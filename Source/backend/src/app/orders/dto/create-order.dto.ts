import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
    @ApiProperty()
    @IsString() @MinLength(2) @MaxLength(100)
    recipientName: string;

    @ApiProperty()
    @IsString() @Matches(/^(0|\+84)\d{8,10}$/, { message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @ApiProperty()
    @IsString() @MinLength(5) @MaxLength(255)
    address: string;

    @ApiPropertyOptional()
    @IsOptional() @IsString() @MaxLength(500)
    note?: string;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}