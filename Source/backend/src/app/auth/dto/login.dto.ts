import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
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
}