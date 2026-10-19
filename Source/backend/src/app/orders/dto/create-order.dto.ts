import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    recipientName: string;

    @ApiProperty()
    @IsString()
    @Matches(/^(0|\+84)\d{8,10}$/, { message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @ApiProperty({ description: 'Số nhà, tên đường (khi có provinceId/wardId) hoặc địa chỉ đầy đủ (kiểu cũ)' })
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    address: string;

    @ApiPropertyOptional({ description: 'Mã tỉnh/thành hệ 2 cấp (GHN)' })
    @IsOptional()
    @IsInt()
    @Min(1)
    provinceId?: number;

    @ApiPropertyOptional({ description: 'Mã phường/xã hệ 2 cấp (GHN) — bắt buộc khi có provinceId' })
    @ValidateIf((o: CreateOrderDto) => o.provinceId != null)
    @IsInt()
    @Min(1)
    wardId?: number;

    @ApiPropertyOptional({ description: 'Kiểu cũ: tên tỉnh/thành để tính phí theo khu vực' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    province?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(30)
    productCouponCode?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(30)
    shippingCouponCode?: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}