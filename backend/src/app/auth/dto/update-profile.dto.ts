import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @Matches(/^(0|\+84)\d{8,10}$/, { message: 'Số điện thoại không hợp lệ' })
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;
}
