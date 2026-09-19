import { Body, Controller, Get, Headers, Ip, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConsentType } from '@prisma/client';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { ConsentService } from './consent.service';

@ApiTags('Consent')
@ApiBearerAuth()
@Controller('consents')
export class ConsentController {
    constructor(private readonly service: ConsentService) { }

    @Get('me')
    @ApiOperation({ summary: 'Các đồng ý của tôi' })
    findMine(@CurrentUser('id') userId: string) {
        return this.service.findMine(userId);
    }

    @Patch(':type')
    @ApiOperation({ summary: 'Bật/tắt đồng ý (marketing)' })
    setConsent(
        @CurrentUser('id') userId: string,
        @Param('type') type: ConsentType,
        @Body('granted') granted: boolean,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        return this.service.setConsent(userId, type, granted, { ipAddress: ip, userAgent });
    }
}