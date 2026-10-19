import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';

class QuoteItemDto {
    @ApiProperty()
    @IsUUID()
    productId: string;

    @ApiProperty({ minimum: 1 })
    @IsInt()
    @Min(1)
    @Max(999)
    quantity: number;
}

export class ShippingQuoteDto {
    @ApiPropertyOptional({ description: 'Mã tỉnh/thành hệ 2 cấp của GHN' })
    @IsOptional()
    @IsInt()
    @Min(1)
    provinceId?: number;

    @ApiPropertyOptional({ description: 'Mã phường/xã hệ 2 cấp của GHN' })
    @IsOptional()
    @IsInt()
    @Min(1)
    wardId?: number;

    @ApiProperty({ description: 'Tạm tính hiển thị ở checkout (đơn thật sẽ được tính lại)' })
    @IsInt() @Min(0)
    subtotal: number;

    @ApiProperty({ type: [QuoteItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(50)
    @ValidateNested({ each: true })
    @Type(() => QuoteItemDto)
    items: QuoteItemDto[];
}