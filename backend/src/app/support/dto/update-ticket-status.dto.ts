import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
    @ApiProperty({ enum: TicketStatus })
    @IsEnum(TicketStatus)
    status: TicketStatus;
}