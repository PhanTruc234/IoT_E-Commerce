import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export enum ProductSort {
    NEWEST = 'newest',
    PRICE_ASC = 'price_asc',
    PRICE_DESC = 'price_desc',
    BEST_SELLING = 'best_selling',
}

export class ProductListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Tìm theo tên hoặc SKU' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({ enum: ProductStatus, description: 'Chỉ dùng cho admin' })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Lọc theo số sao trung bình: 5 = 5 sao, 4 = từ 4 sao trở lên…' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional({ enum: ProductSort, default: ProductSort.NEWEST })
    @IsOptional()
    @IsEnum(ProductSort)
    sort?: ProductSort = ProductSort.NEWEST;
}