import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewModerationReason } from '@prisma/client';
import { IsEnum, IsIn, IsOptional } from 'class-validator';

export class UpdateReviewStatusDto {
    @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
    @IsIn(['APPROVED', 'REJECTED'])
    status: 'APPROVED' | 'REJECTED';

    @ApiPropertyOptional({ enum: ReviewModerationReason })
    @IsOptional()
    @IsEnum(ReviewModerationReason)
    reason?: ReviewModerationReason;
}