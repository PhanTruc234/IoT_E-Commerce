import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private readonly service: AnalyticsService) { }

    @Public()
    @Post()
    @ApiOperation({ summary: 'Ghi nhận 1 hành vi người dùng' })
    log(@Body() dto: CreateEventDto) {
        return this.service.log(dto);
    }
}