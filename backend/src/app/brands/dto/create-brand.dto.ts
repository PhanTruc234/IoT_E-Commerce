import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateBrandDto {
    @ApiProperty({ example: 'Espressif' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'URL logo đã upload qua /uploads/images' })
    @IsOptional()
    @IsUrl({}, { message: 'logoUrl phải là URL hợp lệ' })
    logoUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}