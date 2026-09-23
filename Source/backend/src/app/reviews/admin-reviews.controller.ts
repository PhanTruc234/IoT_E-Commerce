import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewListQueryDto } from './dto/review-list-query.dto';
import { AuditService } from '../audit/audit.service';
import { AuthUser, CurrentUser } from 'src/core/decorators/current-user.decorator';
import { DeleteReviewDto } from './dto/delete-review.dto';

@ApiTags('Admin Reviews')
@ApiBearerAuth()
@Controller('admin/reviews')
export class AdminReviewsController {
    constructor(
        private readonly service: ReviewsService,
        private readonly audit: AuditService,
    ) { }

    @Roles(Role.ADMIN) @Get()
    list(@Query() query: ReviewListQueryDto) { return this.service.findAllAdmin(query); }

    @Roles(Role.ADMIN) @Patch(':id/status')
    async setStatus(
        @Param('id') id: string,
        @Body() dto: UpdateReviewStatusDto,
        @CurrentUser() actor: AuthUser,
        @Ip() ip: string,
        @Headers('user-agent') ua: string,
    ) {
        const review = await this.service.setStatus(id, dto.status, dto.reason);
        if (dto.status === 'REJECTED') {
            void this.audit.record({
                actorId: actor.id, actorEmail: actor.email, role: actor.role,
                action: 'REVIEW_REJECTED', entity: 'REVIEW', entityId: id,
                method: 'PATCH', path: `/admin/reviews/${id}/status`, statusCode: 200,
                ipAddress: ip, userAgent: ua,
                summary: `Từ chối đánh giá (${dto.reason})`,
                metadata: { reason: dto.reason },
            });
        }
        return review;
    }

    @Roles(Role.ADMIN) @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Body() dto: DeleteReviewDto,
        @CurrentUser() actor: AuthUser,
        @Ip() ip: string,
        @Headers('user-agent') ua: string,
    ) {
        const res = await this.service.remove(id, dto.reason);
        void this.audit.record({
            actorId: actor.id, actorEmail: actor.email, role: actor.role,
            action: 'REVIEW_DELETED', entity: 'REVIEW', entityId: id,
            method: 'DELETE', path: `/admin/reviews/${id}`, statusCode: 200,
            ipAddress: ip, userAgent: ua,
            summary: `Xoá đánh giá (${dto.reason})`,
            metadata: { reason: dto.reason },
        });
        return res;
    }
}