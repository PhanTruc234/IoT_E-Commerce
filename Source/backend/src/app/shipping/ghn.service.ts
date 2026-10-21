import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GhnLocation {
    id: number;
    name: string;
}

export interface ParcelLine {
    name: string;
    code?: string;
    quantity: number;
    price: number;
    weightGram: number;
}

export interface GhnShipmentInput {
    clientOrderCode?: string;
    toName: string;
    toPhone: string;
    toAddress: string;
    toWardName: string;
    toProvinceName: string;
    lines: ParcelLine[];
    codAmount: number;
    insuranceValue: number;
    note?: string | null;
}

export interface GhnFee {
    totalFee: number;
    expectedDeliveryAt: string | null;
}

export class GhnError extends Error {
    constructor(message: string, readonly code?: string) {
        super(message);
    }
}

interface Envelope<T> {
    code: number;
    message: string;
    data: T;
    code_message?: string;
    code_message_value?: string;
}
interface RawLocation {
    _id: number;
    name: string;
    status: number;
}
interface RawFee {
    order_code: string;
    total_fee: number;
    expected_delivery_time?: string;
}

const MASTER_TTL = 24 * 60 * 60 * 1000;
const FEE_TTL = 10 * 60 * 1000;
const MAX_INSURANCE = 5_000_000;

const BOXES = [
    { max: 500, length: 15, width: 10, height: 8, tare: 40 },
    { max: 1000, length: 20, width: 15, height: 8, tare: 70 },
    { max: 3000, length: 25, width: 20, height: 10, tare: 120 },
    { max: 10000, length: 30, width: 25, height: 20, tare: 250 },
    { max: Infinity, length: 50, width: 40, height: 25, tare: 600 },
];

const ERROR_MESSAGES: Record<string, string> = {
    RECEIVE_WARD_IS_INVALID: 'GHN chưa hỗ trợ giao đến phường/xã này',
    WARD_IS_INVALID: 'GHN chưa hỗ trợ giao đến phường/xã này',
    TO_ADDRESS_CONFLICT: 'Địa chỉ nhận không khớp với phường/xã đã chọn',
    PHONE_INVALID: 'Số điện thoại người nhận không hợp lệ',
    ROUTE_NOT_FOUND_SERVICE: 'GHN chưa có tuyến giao tới địa chỉ này',
    SERVICE_NOT_FOUND_CONFIG_FEE: 'GHN chưa có bảng giá cho tuyến này',
    CLIENT_NOT_OWNER_OF_SHOP: 'Token GHN không thuộc shop đã cấu hình',
    ORDER_NOT_FOUND: 'Không tìm thấy vận đơn trên GHN',
};

export function buildParcel(lines: ParcelLine[]) {
    const net = lines.reduce((s, l) => s + l.weightGram * l.quantity, 0);
    const box = BOXES.find((b) => net <= b.max)!;
    const weight = net + box.tare;
    const heavy = weight >= 20_000;
    return {
        weight,
        length: box.length,
        width: box.width,
        height: box.height,
        service_type_id: heavy ? 5 : 2,
        items: lines.map((l) => {
            const itemBox = BOXES.find((b) => l.weightGram <= b.max)!;
            return {
                name: l.name.slice(0, 512),
                code: l.code,
                quantity: l.quantity,
                price: l.price,
                ...(heavy ? { weight: l.weightGram, length: itemBox.length, width: itemBox.width, height: itemBox.height } : {}),
            };
        }),
    };
}

export function insuranceFor(subtotal: number) {
    return Math.min(Math.max(0, subtotal), MAX_INSURANCE);
}

function normalizePhone(phone: string) {
    return phone.startsWith('+84') ? `0${phone.slice(3)}` : phone;
}

@Injectable()
export class GhnService {
    private readonly logger = new Logger(GhnService.name);
    private readonly baseUrl: string;
    private readonly token: string;
    private readonly shopId: string;
    private provinceCache?: { at: number; data: GhnLocation[] };
    private readonly wardCache = new Map<number, { at: number; data: GhnLocation[] }>();
    private readonly feeCache = new Map<string, { at: number; data: GhnFee }>();

    constructor(config: ConfigService) {
        this.baseUrl = (config.get<string>('GHN_API_URL') ?? '').replace(/\/+$/, '');
        this.token = config.get<string>('GHN_TOKEN') ?? '';
        this.shopId = config.get<string>('GHN_SHOP_ID') ?? '';
    }

    get enabled() {
        return !!(this.baseUrl && this.token && this.shopId);
    }

    get isSandbox() {
        return this.baseUrl.includes('dev-online-gateway');
    }

    get shopIdNumber() {
        return Number(this.shopId);
    }

    trackingUrl(orderCode: string) {
        const host = this.isSandbox ? 'https://tracking.ghn.dev' : 'https://donhang.ghn.vn';
        return `${host}/?order_code=${encodeURIComponent(orderCode)}`;
    }

    private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown, timeoutMs = 8000, retries = 1): Promise<T> {
        if (!this.enabled) throw new GhnError('Chưa cấu hình GHN', 'NOT_CONFIGURED');
        let res: Response;
        try {
            res = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers: { Token: this.token, ShopId: this.shopId, 'Content-Type': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: AbortSignal.timeout(timeoutMs),
            });
        } catch {
            if (retries > 0) {
                await new Promise((r) => setTimeout(r, 500));
                return this.request<T>(method, path, body, timeoutMs, retries - 1);
            }
            this.logger.warn(`GHN ${method} ${path}: không kết nối được`);
            throw new GhnError('Không kết nối được GHN, vui lòng thử lại', 'NETWORK');
        }
        const json = (await res.json().catch(() => null)) as Envelope<T> | null;
        if (!res.ok || !json || json.code !== 200) {
            const code = json?.code_message;
            this.logger.warn(`GHN ${method} ${path}: HTTP ${res.status} ${code ?? ''} ${json?.message ?? ''}`);
            throw new GhnError((code && ERROR_MESSAGES[code]) || `GHN từ chối: ${json?.message ?? `HTTP ${res.status}`}`, code);
        }
        return json.data;
    }

    async provinces(): Promise<GhnLocation[]> {
        if (this.provinceCache && Date.now() - this.provinceCache.at < MASTER_TTL) return this.provinceCache.data;
        const raw = await this.request<RawLocation[] | null>('GET', '/v3/master-data/province/all?limit=200', undefined, 5000);
        const data = (raw ?? [])
            .filter((p) => p.status === 1)
            .map((p) => ({ id: p._id, name: p.name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        this.provinceCache = { at: Date.now(), data };
        return data;
    }

    async wards(provinceId: number): Promise<GhnLocation[]> {
        const hit = this.wardCache.get(provinceId);
        if (hit && Date.now() - hit.at < MASTER_TTL) return hit.data;
        const raw = await this.request<RawLocation[] | null>(
            'GET', `/v3/master-data/ward/all-by-province-id?province_id=${provinceId}&limit=200`, undefined, 5000,
        );
        const data = (raw ?? [])
            .filter((w) => w.status === 1)
            .map((w) => ({ id: w._id, name: w.name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        if (data.length) this.wardCache.set(provinceId, { at: Date.now(), data });
        return data;
    }

    async resolve(provinceId: number, wardId: number) {
        const province = (await this.provinces()).find((p) => p.id === provinceId);
        if (!province) return null;
        const ward = (await this.wards(provinceId)).find((w) => w.id === wardId);
        return ward ? { province, ward } : null;
    }

    private buildBody(input: GhnShipmentInput) {
        return {
            payment_type_id: 1,
            required_note: 'CHOXEMHANGKHONGTHU',
            client_order_code: input.clientOrderCode,
            to_name: input.toName,
            to_phone: normalizePhone(input.toPhone),
            to_address: input.toAddress,
            to_ward_name: input.toWardName,
            to_province_name: input.toProvinceName,
            is_new_to_address: true,
            cod_amount: input.codAmount,
            insurance_value: input.insuranceValue,
            order_value: input.insuranceValue,
            note: input.note ?? undefined,
            ...buildParcel(input.lines),
        };
    }

    async previewFee(input: Omit<GhnShipmentInput, 'toName' | 'toPhone' | 'clientOrderCode' | 'note'>): Promise<GhnFee> {
        const parcel = buildParcel(input.lines);
        const key = [input.toProvinceName, input.toWardName, parcel.weight, input.insuranceValue].join('|');
        const hit = this.feeCache.get(key);
        if (hit && Date.now() - hit.at < FEE_TTL) return hit.data;

        const raw = await this.request<RawFee>('POST', '/v2/shipping-order/preview', this.buildBody({
            ...input, toName: 'Khách hàng', toPhone: '0900000000', codAmount: 0,
        }), 6000, 0);
        const data = { totalFee: raw.total_fee, expectedDeliveryAt: raw.expected_delivery_time ?? null };
        if (this.feeCache.size > 500) this.feeCache.clear();
        this.feeCache.set(key, { at: Date.now(), data });
        return data;
    }

    /** Không tự gửi lại: timeout thì GHN có thể đã tạo xong → bên gọi tra findByClientCode trước khi tạo lại. */
    async createOrder(input: GhnShipmentInput): Promise<GhnFee & { orderCode: string }> {
        const raw = await this.request<RawFee>('POST', '/v2/shipping-order/create', this.buildBody(input), 10000, 0);
        return { orderCode: raw.order_code, totalFee: raw.total_fee, expectedDeliveryAt: raw.expected_delivery_time ?? null };
    }

    /** Vận đơn đang hoạt động theo mã đơn của shop. Vận đơn đã huỷ thì GHN báo "không tồn tại" → null. */
    async findByClientCode(clientOrderCode: string): Promise<{ orderCode: string; status: string; leadtime: string | null } | null> {
        try {
            const data = await this.request<{ order_code: string; status: string; leadtime?: string }>(
                'POST', '/v2/shipping-order/detail-by-client-code', { client_order_code: clientOrderCode },
            );
            return { orderCode: data.order_code, status: data.status, leadtime: data.leadtime ?? null };
        } catch (e) {
            if (e instanceof GhnError && /không tồn tại|not found/i.test(e.message)) return null;
            throw e;
        }
    }

    async cancelOrder(orderCode: string): Promise<boolean> {
        const data = await this.request<{ order_code: string; result: boolean }[]>('POST', '/v2/switch-status/cancel', {
            order_codes: [orderCode],
            reason_code: 'GHN-CANCEL-OTHER',
            reason: 'Shop huỷ đơn',
        });
        return !!data?.find((d) => d.order_code === orderCode)?.result;
    }

    async orderDetail(orderCode: string): Promise<{ status: string; leadtime: string | null }> {
        const data = await this.request<{ status: string; leadtime?: string }>(
            'GET', `/v2/shipping-order/detail?order_code=${encodeURIComponent(orderCode)}`,
        );
        return { status: data.status, leadtime: data.leadtime ?? null };
    }

    async printUrl(orderCode: string): Promise<string> {
        const data = await this.request<{ token: string }>('POST', '/v2/a5/gen-token', { order_codes: [orderCode] });
        const origin = new URL(this.baseUrl).origin;
        return `${origin}/a5/public-api/printA5?token=${encodeURIComponent(data.token)}`;
    }
}