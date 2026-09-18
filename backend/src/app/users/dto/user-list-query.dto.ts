import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../../../core/dto/pagination-query.dto';

export class UserListQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: Role })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ enum: ['true', 'false'] })
    @IsOptional()
    @IsIn(['true', 'false'])
    isActive?: string;
}
