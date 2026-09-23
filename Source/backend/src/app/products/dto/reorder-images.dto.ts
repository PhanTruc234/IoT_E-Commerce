import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReorderImagesDto {
    @ApiProperty({ type: [String], description: 'Danh sách imageId theo thứ tự mong muốn' })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    imageIds: string[];
}