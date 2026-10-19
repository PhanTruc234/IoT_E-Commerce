import { Body, Controller, Headers, HttpCode, Logger, Post, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';
import { Public } from '../../core/decorators/public.decorator';
import { OrdersService } from './orders.service';
import { ShipmentsService } from './shipments.service';

// Payload GHN gửi (PascalCase, mọi trường luôn có mặt) — chỉ khai báo phần dùng tới
interface GhnCallback {
    ShopID?: number;
    OrderCode?: string;
    ClientOrderCode?: string;
    Type?: string;
    Status?: string;
    Reason?: string;
    Warehouse?: string;
    Time?: string;
}

@ApiExcludeController()
@Controller('shipping/ghn')
export class GhnWebhookController {
    private readonly logger = new Logger(GhnWebhookController.name);
    private readonly secret: string;

    constructor(
        config: ConfigService,
        private readonly orders: OrdersService,
        private readonly shipments: ShipmentsService,
    ) {
        this.secret = config.get<string>('GHN_WEBHOOK_SECRET') ?? '';
    }

    private validSecret(received?: string) {
        if (!this.secret || !received) return false;
        const a = Buffer.from(received);
        const b = Buffer.from(this.secret);
        return a.length === b.length && timingSafeEqual(a, b);
    }

    @Public()
    @SkipThrottle({ default: true, burst: true })
    @Post('webhook')
    @HttpCode(200)
    async handle(@Headers('x-webhook-secret') secret: string | undefined, @Body() body: GhnCallback) {
        if (!this.validSecret(secret)) throw new UnauthorizedException();

        if (!this.shipments.isOurShop(body?.ShopID) || !body.OrderCode || !body.Type || !body.Status) {
            return { ok: true, ignored: true };
        }
        const time = body.Time ? new Date(body.Time) : new Date();
        try {
            const res = await this.orders.applyCarrierEvent({
                orderCode: body.OrderCode,
                clientOrderCode: body.ClientOrderCode || undefined,
                type: body.Type,
                status: body.Status,
                reason: body.Reason || undefined,
                warehouse: body.Warehouse || undefined,
                time: Number.isNaN(time.getTime()) ? new Date() : time,
            }, true);
            return { ok: true, ...res };
        } catch (e) {
            this.logger.error(`Webhook GHN ${body.OrderCode}/${body.Status} lỗi: ${(e as Error).message}`);
            throw new ServiceUnavailableException();
        }
    }
}