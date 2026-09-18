import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateSerialsDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString()
    variantId?: string;

    @ApiProperty({ minimum: 1, maximum: 1000 })
    @Type(() => Number) @IsInt() @Min(1) @Max(1000)
    quantity: number;

    @ApiPropertyOptional({ default: 12 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(0)
    warrantyMonths?: number;
}