import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// Trang Sửa dùng các endpoint ảnh chuyên dụng (6.2) → bỏ `images` khỏi update
export class UpdateProductDto extends PartialType(
    OmitType(CreateProductDto, ['images'] as const),
) {}
