import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class QuoteItemDto {
    @ApiProperty() @IsUUID()
    productId: string;

    @ApiPropertyOptional() @IsOptional() @IsUUID()
    variantId?: string;

    @ApiProperty() @IsInt() @Min(1)
    quantity: number;
}

export class QuoteCouponDto {
    @ApiProperty() @IsInt() @Min(0)
    subtotal: number;

    @ApiProperty() @IsInt() @Min(0)
    shippingFee: number;

    @ApiPropertyOptional() @IsOptional() @IsString()
    productCode?: string;

    @ApiPropertyOptional() @IsOptional() @IsString()
    shippingCode?: string;

    @ApiPropertyOptional({ type: [QuoteItemDto], description: 'Các dòng hàng — để biết dòng nào đang được giảm (mã "không áp cho SP đang giảm")' })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => QuoteItemDto)
    items?: QuoteItemDto[];
}