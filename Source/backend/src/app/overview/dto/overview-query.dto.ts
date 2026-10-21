import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export class OverviewQueryDto {
    @ApiPropertyOptional({ description: 'Ngày bắt đầu (giờ VN), YYYY-MM-DD — mặc định 29 ngày trước' })
    @IsOptional() @Matches(DAY, { message: 'from phải có dạng YYYY-MM-DD' })
    from?: string;

    @ApiPropertyOptional({ description: 'Ngày kết thúc (giờ VN, tính cả ngày này), YYYY-MM-DD — mặc định hôm nay' })
    @IsOptional() @Matches(DAY, { message: 'to phải có dạng YYYY-MM-DD' })
    to?: string;
}
