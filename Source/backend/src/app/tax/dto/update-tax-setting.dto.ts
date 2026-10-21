import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateTaxSettingDto {
    @ApiPropertyOptional({ description: 'Bật / tắt tính VAT' })
    @IsOptional() @IsBoolean()
    enabled?: boolean;

    @ApiPropertyOptional({ description: 'Thuế suất (%) — VD 8 hoặc 10' })
    @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(100)
    rate?: number;

    @ApiPropertyOptional({ description: 'true: giá niêm yết đã gồm VAT; false: cộng thêm VAT khi thanh toán' })
    @IsOptional() @IsBoolean()
    pricesIncludeTax?: boolean;
}
