import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class BrandListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Tìm theo tên' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ default: false, description: 'true = gồm cả thương hiệu đã ẩn (dùng cho admin)' })
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    includeInactive?: boolean = false;
}