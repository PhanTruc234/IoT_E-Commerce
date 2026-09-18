import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class AuditListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    action?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    entity?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
