import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
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

    @ApiProperty({ example: 'Password@123', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
    @MaxLength(50)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/, {
        message: 'Mật khẩu phải có chữ hoa, chữ thường và ký tự đặc biệt',
    })
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

    @ApiProperty({ description: 'Đồng ý Điều khoản & Chính sách bảo vệ dữ liệu' })
    @IsBoolean()
    acceptTerms: boolean;
}