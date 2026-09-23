import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class OrderListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString() search?: string;

    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus) status?: OrderStatus;

    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
}