import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateZoneDto {
    @ApiPropertyOptional()
    @IsOptional() @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional() @IsInt() @Min(0)
    fee?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true })
    provinces?: string[];

    @ApiPropertyOptional()
    @IsOptional() @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional() @IsInt()
    sortOrder?: number;
}
