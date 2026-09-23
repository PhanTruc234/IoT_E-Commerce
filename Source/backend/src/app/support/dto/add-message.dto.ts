import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddMessageDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    @MaxLength(2000)
    message: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}