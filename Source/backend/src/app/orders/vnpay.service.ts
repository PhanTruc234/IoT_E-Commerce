import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export interface VnpayResult {
    valid: boolean;
    txnRef: string;
    amount: number;
    success: boolean;
    responseCode: string | null;
    transactionNo: string | null;
    bankCode: string | null;
}

// Kết quả QueryDR: PAID/FAILED là chắc chắn, PENDING = VNPAY chưa chốt, NOT_FOUND = khách chưa thanh toán giao dịch này
export type QueryDrStatus = 'PAID' | 'FAILED' | 'PENDING' | 'NOT_FOUND';
export interface QueryDrResult {
    status: QueryDrStatus;
    amount: number | null;
    transactionNo: string | null;
    bankCode: string | null;
    responseCode: string;
    raw: Record<string, string>;
}

export class VnpayQueryError extends Error { }

@Injectable()
export class VnpayService {
    private readonly logger = new Logger(VnpayService.name);

    constructor(private readonly config: ConfigService) { }

    private enc(v: string | number): string {
        return encodeURIComponent(String(v)).replace(/%20/g, '+');
    }

    private buildSignData(params: Record<string, string | number>): string {
        return Object.keys(params)
            .sort()
            .map((k) => `${k}=${this.enc(params[k])}`)
            .join('&');
    }

    private hmac(data: string): string {
        const secret = this.config.getOrThrow<string>('VNP_HASHSECRET');
        return createHmac('sha512', secret).update(Buffer.from(data, 'utf-8')).digest('hex');
    }

    fmtDate(d: Date): string {
        const t = new Date(d.getTime() + 7 * 3600 * 1000);
        const p = (n: number) => String(n).padStart(2, '0');
        return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${p(t.getUTCSeconds())}`;
    }
    private safeEqualHex(expected: string, received?: string): boolean {
        if (!received) return false;
        const a = Buffer.from(expected, 'hex');
        const b = Buffer.from(received, 'hex');
        return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
    }
    buildPaymentUrl(input: { txnRef: string; amount: number; ip: string; orderInfo: string; createdAt: Date; expiresAt: Date }) {
        const tmnCode = this.config.getOrThrow<string>('VNP_TMNCODE');
        const vnpUrl = this.config.get<string>('VNP_URL') ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = this.config.getOrThrow<string>('VNP_RETURN_URL');
        const createDate = this.fmtDate(input.createdAt);

        const params: Record<string, string | number> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: input.txnRef,
            vnp_OrderInfo: input.orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: input.amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: input.ip || '127.0.0.1',
            vnp_CreateDate: createDate,
            // Hết hạn thì link cũ không trả tiền được nữa → chặn trả 2 lần từ gốc
            vnp_ExpireDate: this.fmtDate(input.expiresAt),
        };

        const signData = this.buildSignData(params);
        return { url: `${vnpUrl}?${signData}&vnp_SecureHash=${this.hmac(signData)}`, createDate };
    }

    /** Dùng chung cho Return URL và IPN (cùng bộ tham số, cùng cách ký). */
    verify(query: Record<string, string>): VnpayResult {
        const secureHash = query['vnp_SecureHash'];
        const params: Record<string, string> = {};
        for (const [k, v] of Object.entries(query)) {
            if (k.startsWith('vnp_') && k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType') params[k] = v;
        }
        const valid = this.safeEqualHex(this.hmac(this.buildSignData(params)), secureHash);
        const responseCode = query['vnp_ResponseCode'] ?? null;
        // vnp_TransactionStatus là trạng thái giao dịch thật, vnp_ResponseCode chỉ là kết quả bước thanh toán
        const txnStatus = query['vnp_TransactionStatus'] ?? responseCode;
        return {
            valid,
            txnRef: query['vnp_TxnRef'] ?? '',
            amount: Math.round(Number(query['vnp_Amount'] ?? 0) / 100),
            success: valid && responseCode === '00' && txnStatus === '00',
            responseCode,
            transactionNo: query['vnp_TransactionNo'] || null,
            bankCode: query['vnp_BankCode'] || null,
        };
    }

    /** Hỏi VNPAY trạng thái thật của 1 giao dịch (API querydr). Lỗi mạng / chữ ký sai → VnpayQueryError. */
    async queryDr(input: { txnRef: string; createDate: string }): Promise<QueryDrResult> {
        const apiUrl = this.config.get<string>('VNP_API_URL') ?? 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
        const body = {
            vnp_RequestId: randomUUID().replace(/-/g, ''),
            vnp_Version: '2.1.0',
            vnp_Command: 'querydr',
            vnp_TmnCode: this.config.getOrThrow<string>('VNP_TMNCODE'),
            vnp_TxnRef: input.txnRef,
            vnp_OrderInfo: `Kiem tra giao dich ${input.txnRef}`,
            vnp_TransactionDate: input.createDate,
            vnp_CreateDate: this.fmtDate(new Date()),
            vnp_IpAddr: this.config.get<string>('VNP_SERVER_IP') ?? '127.0.0.1',
        };
        const signData = [
            body.vnp_RequestId, body.vnp_Version, body.vnp_Command, body.vnp_TmnCode, body.vnp_TxnRef,
            body.vnp_TransactionDate, body.vnp_CreateDate, body.vnp_IpAddr, body.vnp_OrderInfo,
        ].join('|');

        let raw: Record<string, string>;
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...body, vnp_SecureHash: this.hmac(signData) }),
                signal: AbortSignal.timeout(10000),
            });
            raw = (await res.json()) as Record<string, string>;
        } catch (e) {
            this.logger.warn(`QueryDR ${input.txnRef}: ${(e as Error).message}`);
            throw new VnpayQueryError('Không kết nối được VNPAY');
        }

        const code = String(raw.vnp_ResponseCode ?? '');
        if (code === '91') return { status: 'NOT_FOUND', amount: null, transactionNo: null, bankCode: null, responseCode: code, raw };
        if (code !== '00') {
            this.logger.warn(`QueryDR ${input.txnRef}: ${code} ${raw.vnp_Message ?? ''}`);
            throw new VnpayQueryError(`VNPAY từ chối truy vấn (${code})`);
        }
        const resSign = [
            raw.vnp_ResponseId, raw.vnp_Command, raw.vnp_ResponseCode, raw.vnp_Message, raw.vnp_TmnCode, raw.vnp_TxnRef,
            raw.vnp_Amount, raw.vnp_BankCode, raw.vnp_PayDate, raw.vnp_TransactionNo, raw.vnp_TransactionType,
            raw.vnp_TransactionStatus, raw.vnp_OrderInfo, raw.vnp_PromotionCode, raw.vnp_PromotionAmount,
        ].map((v) => v ?? '').join('|');
        if (!this.safeEqualHex(this.hmac(resSign), raw.vnp_SecureHash)) {
            throw new VnpayQueryError('Chữ ký phản hồi QueryDR không hợp lệ');
        }

        const st = String(raw.vnp_TransactionStatus ?? '');
        // 00 thành công · 01 chưa hoàn tất · 07 nghi ngờ gian lận (chờ VNPAY xử lý) · còn lại coi là không thành công
        const status: QueryDrStatus = st === '00' ? 'PAID' : st === '01' || st === '07' ? 'PENDING' : 'FAILED';
        return {
            status,
            amount: raw.vnp_Amount ? Math.round(Number(raw.vnp_Amount) / 100) : null,
            transactionNo: raw.vnp_TransactionNo || null,
            bankCode: raw.vnp_BankCode || null,
            responseCode: st,
            raw,
        };
    }
}
