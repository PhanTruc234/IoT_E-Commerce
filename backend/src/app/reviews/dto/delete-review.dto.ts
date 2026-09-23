import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReviewModerationReason } from '@prisma/client';

export class DeleteReviewDto {
    @ApiProperty({ enum: ReviewModerationReason })
    @IsEnum(ReviewModerationReason)
    reason: ReviewModerationReason;
}