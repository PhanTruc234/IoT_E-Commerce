import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { SIMULATABLE } from '../shipments.service';

export class SimulateShipmentDto {
    @ApiProperty({ enum: SIMULATABLE })
    @IsIn(SIMULATABLE)
    status: (typeof SIMULATABLE)[number];
}