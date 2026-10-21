import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceBuyerType, InvoiceStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class CreateInvoiceRequestDto {
    @ApiProperty() @IsUUID()
    orderId: string;

    @ApiProperty({ enum: InvoiceBuyerType }) @IsEnum(InvoiceBuyerType)
    buyerType: InvoiceBuyerType;

    @ApiProperty({ description: 'Họ tên người mua hoặc tên công ty' })
    @IsString() @MinLength(2) @MaxLength(200)
    buyerName: string;

    @ApiPropertyOptional({ description: 'Mã số thuế — bắt buộc với công ty' })
    @ValidateIf((o: CreateInvoiceRequestDto) => o.buyerType === 'COMPANY' || !!o.taxCode)
    @Matches(/^\d{10}(-\d{3})?$/, { message: 'Mã số thuế gồm 10 số (hoặc 10 số-3 số cho chi nhánh)' })
    taxCode?: string;

    @ApiProperty() @IsString() @MinLength(5) @MaxLength(300)
    address: string;

    @ApiProperty({ description: 'Email nhận hoá đơn điện tử' }) @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;

    @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
    note?: string;
}

export class ProcessInvoiceRequestDto {
    @ApiProperty({ enum: ['ISSUED', 'REJECTED'] }) @IsIn(['ISSUED', 'REJECTED'])
    status: 'ISSUED' | 'REJECTED';

    @ApiPropertyOptional({ description: 'Số hoá đơn — bắt buộc khi đã xuất' })
    @ValidateIf((o: ProcessInvoiceRequestDto) => o.status === 'ISSUED')
    @IsString() @MinLength(1) @MaxLength(50)
    invoiceNumber?: string;

    @ApiPropertyOptional({ description: 'Ghi chú cho khách (VD lý do từ chối)' })
    @ValidateIf((o: ProcessInvoiceRequestDto) => o.status === 'REJECTED')
    @IsString() @MinLength(3) @MaxLength(500)
    adminNote?: string;
}

export class InvoiceListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: InvoiceStatus }) @IsOptional() @IsEnum(InvoiceStatus)
    status?: InvoiceStatus;
}
