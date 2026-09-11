import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ComboItemInputDto {
    @ApiProperty({ description: 'ID sản phẩm thành phần (SIMPLE)' })
    @IsString()
    productId: string;

    @ApiProperty({ default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ description: 'ID biến thể (bắt buộc nếu thành phần là SP có biến thể)' })
    @IsOptional()
    @IsString()
    variantId?: string;
}

export class SetComboItemsDto {
    @ApiProperty({ type: [ComboItemInputDto] })
    @IsArray()
    @ArrayMaxSize(30)
    @ValidateNested({ each: true })
    @Type(() => ComboItemInputDto)
    items: ComboItemInputDto[];
}