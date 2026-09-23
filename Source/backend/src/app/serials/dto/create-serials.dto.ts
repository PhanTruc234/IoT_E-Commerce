import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSerialsDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString()
    variantId?: string;

    @ApiPropertyOptional({ default: 12 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(0)
    warrantyMonths?: number;

    @ApiProperty({ type: [String], description: 'Danh sách số serial' })
    @IsArray() @ArrayNotEmpty() @IsString({ each: true })
    codes: string[];
}