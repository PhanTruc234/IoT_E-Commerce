import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUrl } from 'class-validator';

export class AttachImagesDto {
    @ApiProperty({ type: [String], description: 'URL ảnh đã upload qua /uploads/images' })
    @IsArray()
    @ArrayNotEmpty()
    @IsUrl({}, { each: true, message: 'imageUrls phải là danh sách URL hợp lệ' })
    imageUrls: string[];
}
