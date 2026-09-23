import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserEventType } from '@prisma/client';

export class CreateEventDto {
    @ApiProperty({ enum: UserEventType })
    @IsEnum(UserEventType)
    type: UserEventType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    productId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    keyword?: string;
}