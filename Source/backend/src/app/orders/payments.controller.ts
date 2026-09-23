import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../core/decorators/public.decorator';
import { VnpayService } from './vnpay.service';
import { OrdersService } from './orders.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly vnpay: VnpayService,
        private readonly orders: OrdersService,
        private readonly config: ConfigService,
    ) { }

    @Public()
    @Get('vnpay/return')
    @ApiOperation({ summary: 'VNPAY redirect về sau khi thanh toán' })
    async vnpayReturn(@Query() query: Record<string, string>, @Res() res: Response) {
        const { valid, code, success } = this.vnpay.verifyReturn(query);
        if (valid) await this.orders.markPaid(code, success);
        const frontend = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
        const order = await this.orders.findByCode(code);
        const status = !valid ? 'invalid' : success ? 'success' : 'failed';
        return res.redirect(`${frontend}/orders/${order?.id ?? ''}?payment=${status}`);
    }
}