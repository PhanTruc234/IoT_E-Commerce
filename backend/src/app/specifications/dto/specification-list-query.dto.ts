import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class SpecificationListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ description: 'Tìm theo tên thông số' })
    @IsOptional()
    @IsString()
    search?: string;
}