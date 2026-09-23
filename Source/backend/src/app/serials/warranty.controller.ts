import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { SerialsService } from './serials.service';

@ApiTags('Warranty')
@Controller('warranty')
export class WarrantyController {
    constructor(private readonly service: SerialsService) { }

    @Public()
    @Get('lookup')
    @ApiOperation({ summary: 'Tra cứu bảo hành theo số serial' })
    lookup(@Query('code') code?: string) { return this.service.lookup(code); }
}