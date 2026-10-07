import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddWishlistDto {
    @ApiProperty()
    @IsString() @IsUUID()
    productId: string;
}
