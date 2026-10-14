import { Controller, Get, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from 'src/core/decorators/public.decorator';
import { resolveClientIp } from 'src/core/security/client-ip';

@SkipThrottle({ default: true, burst: true })
@Controller('health')
export class HealthController {
    constructor(private readonly config: ConfigService) { }

    @Public()
    @Get()
    check(@Req() req: Request) {
        return {
            status: 'ok',
            service: 'iot-backend',
            timestamp: new Date().toISOString(),
            clientIp: resolveClientIp(req, this.config.get<string>('CLIENT_IP_HEADER')),
        };
    }
}