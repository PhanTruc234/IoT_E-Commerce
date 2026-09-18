import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateReviewStatusDto {
    @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
    @IsIn(['APPROVED', 'REJECTED'])
    status: 'APPROVED' | 'REJECTED';
}