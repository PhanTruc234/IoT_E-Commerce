import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { DiscountType, PromotionScope } from '@prisma/client';

export class CreatePromotionDto {
    @ApiProperty() @IsString()
    name: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    description?: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    bannerImage?: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    linkUrl?: string;

    @ApiProperty({ enum: DiscountType }) @IsEnum(DiscountType)
    discountType: DiscountType;

    @ApiProperty() @IsInt() @Min(0)
    value: number;

    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
    maxDiscount?: number;

    @ApiProperty({ enum: PromotionScope }) @IsEnum(PromotionScope)
    scope: PromotionScope;

    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true })
    productIds?: string[];

    @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true })
    categoryIds?: string[];

    @ApiPropertyOptional({ description: 'Độ ưu tiên — dùng khi nhiều chương trình cùng bật "Ưu tiên bắt buộc"' }) @IsOptional() @IsInt()
    priority?: number;

    @ApiPropertyOptional({ description: 'Ưu tiên bắt buộc: luôn áp chương trình này dù giá không thấp nhất' }) @IsOptional() @IsBoolean()
    forcePriority?: boolean;

    @ApiPropertyOptional({ type: [String], description: 'Sản phẩm loại trừ khỏi chương trình' }) @IsOptional() @IsArray() @IsString({ each: true })
    excludedProductIds?: string[];

    @ApiPropertyOptional() @IsOptional() @IsDateString()
    startAt?: string;

    @ApiPropertyOptional() @IsOptional() @IsDateString()
    endAt?: string;

    @ApiPropertyOptional() @IsOptional() @IsBoolean()
    isActive?: boolean;
}