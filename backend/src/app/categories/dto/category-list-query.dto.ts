import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class CategoryListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Tìm theo tên hoặc slug' })
    @IsOptional()
    @IsString()
    search?: string;
}