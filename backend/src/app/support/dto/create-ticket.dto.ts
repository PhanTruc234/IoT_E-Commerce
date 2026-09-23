import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { TicketType } from '@prisma/client';

export class CreateTicketDto {
    @ApiProperty({ enum: TicketType })
    @IsEnum(TicketType)
    type: TicketType;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(150)
    subject: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    @MaxLength(2000)
    message: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    orderId?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}