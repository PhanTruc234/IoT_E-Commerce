import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../core/decorators/public.decorator';
import { VnpayService } from './vnpay.service';
import { PaymentsService } from './payments.service';
import { SkipThrottle } from '@nestjs/throttler';


@SkipThrottle({ default: true, burst: true })
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger(PaymentsController.name);

    constructor(
        private readonly vnpay: VnpayService,
        private readonly payments: PaymentsService,
        private readonly config: ConfigService,
    ) { }

    @Public()
    @Get('vnpay/ipn')
    @ApiOperation({ summary: 'VNPAY gọi server-to-server báo kết quả (nguồn chính, VNPAY gửi lại tới khi nhận 00/02)' })
    async vnpayIpn(@Query() query: Record<string, string>) {
        const r = this.vnpay.verify(query);
        if (!r.valid) return { RspCode: '97', Message: 'Invalid Checksum' };
        try {
            const { outcome } = await this.payments.applyResult({ ...r, source: 'IPN', raw: query });
            if (outcome === 'NOT_FOUND') return { RspCode: '01', Message: 'Order not found' };
            if (outcome === 'AMOUNT_MISMATCH') return { RspCode: '04', Message: 'Invalid amount' };
            if (outcome === 'ALREADY') return { RspCode: '02', Message: 'Order already confirmed' };
            return { RspCode: '00', Message: 'Confirm Success' };
        } catch (e) {
            this.logger.error(`IPN ${r.txnRef} lỗi: ${(e as Error).message}`);
            return { RspCode: '99', Message: 'Unknown error' };
        }
    }

    @Public()
    @Get('vnpay/return')
    @ApiOperation({ summary: 'VNPAY redirect về sau khi thanh toán (dự phòng khi IPN chưa tới)' })
    async vnpayReturn(@Query() query: Record<string, string>, @Res() res: Response) {
        const frontend = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
        const r = this.vnpay.verify(query);
        let status = 'invalid';
        let orderId = '';
        if (r.valid) {
            try {
                // Cùng hàm với IPN nên IPN tới trước hay sau đều chỉ ghi nhận 1 lần
                const a = await this.payments.applyResult({ ...r, source: 'RETURN', raw: query });
                orderId = a.orderId ?? '';
                if (a.outcome === 'OK' || a.outcome === 'ALREADY') status = a.refund ? 'refund' : r.success ? 'success' : 'failed';
            } catch (e) {
                this.logger.error(`Return ${r.txnRef} lỗi: ${(e as Error).message}`);
                status = 'pending';
                orderId = (await this.payments.orderIdOf(r.txnRef)) ?? '';
            }
        }
        return res.redirect(`${frontend}/orders/${orderId}?payment=${status}`);
    }
}
