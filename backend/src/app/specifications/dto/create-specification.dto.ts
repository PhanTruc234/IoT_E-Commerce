import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SpecDataType } from '@prisma/client';

export class CreateSpecificationDto {
    @ApiProperty({ example: 'WiFi' })
    @IsString()
    @MinLength(1)
    @MaxLength(80)
    name: string;

    @ApiPropertyOptional({ example: 'GHz' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @ApiPropertyOptional({ enum: SpecDataType, default: SpecDataType.TEXT })
    @IsOptional()
    @IsEnum(SpecDataType)
    dataType?: SpecDataType;
}