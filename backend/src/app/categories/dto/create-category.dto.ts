import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Cảm biến nhiệt độ' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ example: 'Các loại cảm biến đo nhiệt độ môi trường' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ example: 'Thermometer', description: 'Tên icon lucide — chỉ dùng cho cấp 2 & 3' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    icon?: string;

    @ApiPropertyOptional({ description: 'ID danh mục cha. Bỏ trống = danh mục gốc (cấp 1)' })
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional({ default: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}