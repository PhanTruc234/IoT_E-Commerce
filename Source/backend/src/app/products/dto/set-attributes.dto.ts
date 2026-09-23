import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize, ArrayNotEmpty, IsArray, IsBoolean, IsString, MaxLength, MinLength, ValidateNested,
} from 'class-validator';

export class AttributeOptionDto {
    @ApiProperty({ example: '8MB' })
    @IsString() @MinLength(1) @MaxLength(60)
    value: string;
}

export class AttributeDto {
    @ApiProperty({ example: 'Dung lượng Flash' })
    @IsString() @MinLength(1) @MaxLength(60)
    name: string;

    @ApiProperty({ example: true, description: 'Dùng để sinh biến thể' })
    @IsBoolean()
    isVariant: boolean;

    @ApiProperty({ type: [AttributeOptionDto] })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(30)
    @ValidateNested({ each: true })
    @Type(() => AttributeOptionDto)
    options: AttributeOptionDto[];
}

export class SetAttributesDto {
    @ApiProperty({ type: [AttributeDto] })
    @IsArray()
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    @Type(() => AttributeDto)
    attributes: AttributeDto[];
}