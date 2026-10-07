import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateShippingSettingDto {
    @ApiProperty({ description: 'Đơn hàng từ mức này (đồng) sẽ được miễn phí vận chuyển' })
    @IsInt() @Min(0)
    freeShipFrom: number;
}
