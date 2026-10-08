import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
    constructor(private readonly promotions: PromotionsService) { }

    @Public()
    @Get('active')
    @ApiOperation({ summary: 'Khuyến mãi đang chạy (banner + luật giá)' })
    active() {
        return this.promotions.getActive();
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin')
    adminList() { return this.promotions.adminList(); }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post('admin')
    adminCreate(@Body() dto: CreatePromotionDto) { return this.promotions.adminCreate(dto); }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('admin/:id')
    adminUpdate(@Param('id') id: string, @Body() dto: UpdatePromotionDto) { return this.promotions.adminUpdate(id, dto); }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Delete('admin/:id')
    adminRemove(@Param('id') id: string) { return this.promotions.adminRemove(id); }
}