import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SerialStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class SerialListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    productId?: string;

    @ApiPropertyOptional({ enum: SerialStatus })
    @IsOptional()
    @IsEnum(SerialStatus)
    status?: SerialStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    variantId?: string;
}