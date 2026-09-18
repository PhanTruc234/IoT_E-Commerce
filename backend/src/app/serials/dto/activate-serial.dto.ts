import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActivateSerialDto {
    @ApiPropertyOptional({ description: 'Ngày kích hoạt (mặc định hôm nay)' })
    @IsOptional() @IsDateString()
    activatedAt?: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString() @MaxLength(100)
    ownerName?: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString() @MaxLength(20)
    ownerPhone?: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString()
    ownerUserId?: string;
}