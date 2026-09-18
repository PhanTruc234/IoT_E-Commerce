import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';

@ApiTags('Admin Reviews')
@ApiBearerAuth()
@Controller('admin/reviews')
export class AdminReviewsController {
    constructor(private readonly service: ReviewsService) { }

    @Roles(Role.ADMIN) @Get()
    list(@Query() query: ReviewListQueryDto) { return this.service.findAllAdmin(query); }

    @Roles(Role.ADMIN) @Patch(':id/status')
    setStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) { return this.service.setStatus(id, dto.status); }

    @Roles(Role.ADMIN) @Delete(':id')
    remove(@Param('id') id: string) { return this.service.remove(id); }
}