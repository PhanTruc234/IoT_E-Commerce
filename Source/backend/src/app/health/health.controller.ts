import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/core/decorators/public.decorator';

@Controller('health')
export class HealthController {
    @Public()
    @Get()
    check() {
        return {
            status: 'ok',
            service: 'iot-backend',
            timestamp: new Date().toISOString(),
        };
    }
}