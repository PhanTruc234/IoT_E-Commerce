import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'nguyenvana@example.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty({ example: 'Password123' })
    @IsString()
    password: string;
}