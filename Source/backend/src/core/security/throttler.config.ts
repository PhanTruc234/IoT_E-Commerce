import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { resolveClientIp } from './client-ip';

export function throttlerOptionsFactory(config: ConfigService): ThrottlerModuleOptions {
    const ipHeader = config.get<string>('CLIENT_IP_HEADER');

    return {
        throttlers: [
            { name: 'default', ttl: 60_000, limit: 300 },
            { name: 'burst', ttl: 1_000, limit: 20 },
        ],
        getTracker: (req: Parameters<typeof resolveClientIp>[0]) => resolveClientIp(req, ipHeader),
    };
}