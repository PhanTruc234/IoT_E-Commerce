import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVariantDto {
    @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) price?: number;
    @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) salePrice?: number;
    @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) stockQuantity?: number;
    @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}