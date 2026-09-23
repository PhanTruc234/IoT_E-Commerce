import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddCartItemDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiPropertyOptional({ description: 'Bắt buộc nếu SP có biến thể' })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity = 1;
}