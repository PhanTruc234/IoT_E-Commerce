import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class ReviewListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: ReviewStatus })
    @IsOptional()
    @IsEnum(ReviewStatus) status?: ReviewStatus;
}