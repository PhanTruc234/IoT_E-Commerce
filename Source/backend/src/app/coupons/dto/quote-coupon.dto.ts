import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QuoteCouponDto {
    @ApiProperty() @IsInt() @Min(0)
    subtotal: number;

    @ApiProperty() @IsInt() @Min(0)
    shippingFee: number;

    @ApiPropertyOptional() @IsOptional() @IsString()
    productCode?: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    shippingCode?: string;
}