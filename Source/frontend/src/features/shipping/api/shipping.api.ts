import { apiClient } from '@/shared/lib/api-client';

export interface ShippingZone {
    id: string; name: string; fee: number; provinces: string[]; isDefault: boolean;
}
export interface ShippingConfig { zones: ShippingZone[]; freeShipFrom: number }

export interface AdminZone extends ShippingZone { isActive: boolean; sortOrder: number }
export interface ShippingSetting { id: string; freeShipFrom: number }

export interface Location { id: number; name: string }
export interface ShippingQuoteBody {
    provinceId: number;
    wardId: number;
    subtotal: number;
    items: { productId: string; quantity: number }[];
}
export interface ShippingQuote {
    fee: number;
    baseFee: number;
    carrierFee: number | null;
    subsidy: number;
    source: 'GHN' | 'ZONE';
    expectedDeliveryAt: string | null;
    freeShipFrom: number;
}

export const shippingApi = {
    config: () => apiClient.get<ShippingConfig>('/shipping/config').then((r) => r.data),
    provinces: () => apiClient.get<Location[]>('/shipping/provinces').then((r) => r.data),
    wards: (provinceId: number) => apiClient.get<Location[]>(`/shipping/provinces/${provinceId}/wards`).then((r) => r.data),
    quote: (body: ShippingQuoteBody) => apiClient.post<ShippingQuote>('/shipping/quote', body).then((r) => r.data),
    adminZones: () => apiClient.get<AdminZone[]>('/shipping/admin/zones').then((r) => r.data),
    updateZone: (id: string, body: Partial<Pick<AdminZone, 'name' | 'fee' | 'provinces' | 'isActive' | 'sortOrder'>>) =>
        apiClient.patch<AdminZone>(`/shipping/admin/zones/${id}`, body).then((r) => r.data),
    adminSetting: () => apiClient.get<ShippingSetting>('/shipping/admin/setting').then((r) => r.data),
    updateSetting: (freeShipFrom: number) =>
        apiClient.patch<ShippingSetting>('/shipping/admin/setting', { freeShipFrom }).then((r) => r.data),
};

export function calcShippingFee(config: ShippingConfig | undefined, subtotal: number, province?: string | null): number | null {
    if (!config) return null;
    if (subtotal >= config.freeShipFrom) return 0;
    const matched = province ? config.zones.find((z) => z.provinces.includes(province)) : undefined;
    const zone = matched ?? config.zones.find((z) => z.isDefault) ?? null;
    return zone ? zone.fee : 35000;
}

export function formatDeliveryDate(iso: string) {
    const parts = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh', weekday: 'long', day: '2-digit', month: '2-digit',
    }).formatToParts(new Date(iso));
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const weekday = get('weekday');
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${get('day')}/${get('month')}`;
}