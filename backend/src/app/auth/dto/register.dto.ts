import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'nguyenvana@example.com' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiProperty({ example: 'Password123', minLength: 6 })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
    @MaxLength(50)
    password: string;

    @ApiProperty({ example: 'Nguyễn Văn A' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;

    @ApiProperty({ example: '0912345678', required: false })
    @IsOptional()
    @Matches(/^(0|\+84)\d{9}$/, { message: 'Số điện thoại không hợp lệ' })
    phone?: string;
}