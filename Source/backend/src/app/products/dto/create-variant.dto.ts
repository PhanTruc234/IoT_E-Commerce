import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVariantDto {
    @ApiProperty({ type: [String], description: 'Mỗi thuộc tính-biến thể chọn 1 optionId' })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    optionIds: string[];

    @ApiPropertyOptional({ description: 'Giá VND (bỏ trống = giá gốc SP)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price?: number;

    @ApiPropertyOptional()
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

    @ApiPropertyOptional({ description: 'URL ảnh riêng của biến thể' })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}