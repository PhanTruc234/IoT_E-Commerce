import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { CouponType, DiscountType } from '@prisma/client';

export class CreateCouponDto {
    @ApiProperty() @IsString() @Length(3, 30)
    code: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    description?: string;

    @ApiProperty({ enum: CouponType }) @IsEnum(CouponType)
    type: CouponType;

    @ApiProperty({ enum: DiscountType }) @IsEnum(DiscountType)
    discountType: DiscountType;

    @ApiProperty({ description: 'PERCENT: 1-100, FIXED: số tiền, FREE_SHIPPING: 0 = miễn toàn bộ' })
    @IsInt() @Min(0)
    value: number;

    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
    maxDiscount?: number;

    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
    minOrder?: number;

    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
    usageLimit?: number;

    @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
    perUserLimit?: number;

    @ApiPropertyOptional() @IsOptional() @IsDateString()
    startAt?: string;

    @ApiPropertyOptional() @IsOptional() @IsDateString()
    endAt?: string;

    @ApiPropertyOptional() @IsOptional() @IsBoolean()
    isActive?: boolean;
}