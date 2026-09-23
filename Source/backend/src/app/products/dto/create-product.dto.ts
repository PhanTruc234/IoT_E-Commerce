import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { ProductStatus, ProductType } from '@prisma/client';

export class ProductImageInputDto {
    @ApiProperty({ description: 'URL ảnh đã upload qua /uploads/image' })
    @IsString()
    imageUrl: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class CreateProductDto {
    @ApiProperty({ description: 'ID danh mục' })
    @IsString()
    categoryId: string;

    @ApiPropertyOptional({ description: 'ID thương hiệu' })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiProperty({ example: 'ESP32 DevKit V1 WiFi + Bluetooth' })
    @IsString()
    @MinLength(2)
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    description?: string;

    @ApiProperty({ example: 150000, description: 'Giá gốc (VND)' })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 129000, description: 'Giá KM (VND) ≤ giá gốc' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    salePrice?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    stockQuantity?: number;

    @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @ApiPropertyOptional({ enum: ProductType, default: ProductType.SIMPLE })
    @IsOptional()
    @IsEnum(ProductType)
    type?: ProductType;

    @ApiPropertyOptional({
        type: [ProductImageInputDto],
        description: 'Ảnh kèm khi tạo (đã upload trước qua /uploads/image)',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageInputDto)
    images?: ProductImageInputDto[];
}
