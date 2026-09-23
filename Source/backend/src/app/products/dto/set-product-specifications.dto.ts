import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, MaxLength, ValidateNested } from 'class-validator';

export class ProductSpecItemDto {
    @ApiProperty()
    @IsString()
    specificationId: string;

    @ApiProperty({ example: '2.4GHz' })
    @IsString()
    @MaxLength(200)
    value: string;
}

export class SetProductSpecificationsDto {
    @ApiProperty({ type: [ProductSpecItemDto] })
    @IsArray()
    @ArrayMaxSize(50)
    @ValidateNested({ each: true })
    @Type(() => ProductSpecItemDto)
    items: ProductSpecItemDto[];
}