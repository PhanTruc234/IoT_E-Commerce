import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class VnpayService {
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

    private fmtDate(d: Date): string {
        const t = new Date(d.getTime() + 7 * 3600 * 1000);
        const p = (n: number) => String(n).padStart(2, '0');
        return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}${p(t.getUTCHours())}${p(t.getUTCMinutes())}${p(t.getUTCSeconds())}`;
    }

    buildPaymentUrl(input: { code: string; amount: number; ip: string; orderInfo: string }): string {
        const tmnCode = this.config.getOrThrow<string>('VNP_TMNCODE');
        const secret = this.config.getOrThrow<string>('VNP_HASHSECRET');
        const vnpUrl = this.config.get<string>('VNP_URL') ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = this.config.getOrThrow<string>('VNP_RETURN_URL');

        const params: Record<string, string | number> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: input.code,
            vnp_OrderInfo: input.orderInfo,
            vnp_OrderType: 'other',
            vnp_Amount: input.amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: input.ip || '127.0.0.1',
            vnp_CreateDate: this.fmtDate(new Date()),
        };

        const signData = this.buildSignData(params);
        const secureHash = createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex');
        return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
    }

    verifyReturn(query: Record<string, string>): { valid: boolean; code: string; success: boolean } {
        const secureHash = query['vnp_SecureHash'];
        const params: Record<string, string> = { ...query };
        delete params['vnp_SecureHash'];
        delete params['vnp_SecureHashType'];

        const secret = this.config.getOrThrow<string>('VNP_HASHSECRET');
        const signData = this.buildSignData(params);
        const check = createHmac('sha512', secret).update(Buffer.from(signData, 'utf-8')).digest('hex');

        const valid = check === secureHash;
        return { valid, code: query['vnp_TxnRef'], success: valid && query['vnp_ResponseCode'] === '00' };
    }
}