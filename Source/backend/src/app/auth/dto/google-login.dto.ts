import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    idToken: string;

    @ApiProperty({ required: false, description: 'Đồng ý điều khoản qua thông báo dưới nút Google' })
    @IsOptional()
    @IsBoolean()
    acceptTerms?: boolean;
}