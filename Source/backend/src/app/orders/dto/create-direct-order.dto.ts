import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class CreateDirectOrderDto extends CreateOrderDto {
    @ApiProperty({ description: 'Sản phẩm mua ngay' })
    @IsString() @IsUUID()
    productId: string;

    @ApiPropertyOptional({ description: 'Biến thể (nếu là sản phẩm có phân loại)' })
    @IsOptional() @IsString() @IsUUID()
    variantId?: string;

    @ApiProperty({ minimum: 1 })
    @IsInt() @Min(1)
    quantity: number;
}
