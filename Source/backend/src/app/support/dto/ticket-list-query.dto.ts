import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus, TicketType } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class TicketListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: TicketStatus })
    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;

    @ApiPropertyOptional({ enum: TicketType })
    @IsOptional()
    @IsEnum(TicketType)
    type?: TicketType;
}