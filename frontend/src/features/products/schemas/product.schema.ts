import { z } from 'zod';
import type { CreateProductPayload } from '../api/products.api';

const emptyToUndef = (v: unknown) =>
    v === '' || v === null || v === undefined ? undefined : v;

export const productSchema = z
    .object({
        name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(200),
        categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
        brandId: z.string().optional().or(z.literal('')),
        description: z.string().max(5000).optional().or(z.literal('')),
        price: z.coerce.number().int('Giá phải là số nguyên').min(0, 'Giá ≥ 0'),
        salePrice: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).optional()),
        stockQuantity: z.coerce.number().int().min(0),
        status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
        type: z.enum(['SIMPLE', 'VARIABLE', 'COMBO']),
    })
    .refine((d) => d.salePrice == null || d.salePrice <= d.price, {
        message: 'Giá khuyến mãi phải ≤ giá gốc',
        path: ['salePrice'],
    });

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;

export function toProductPayload(v: ProductFormOutput): CreateProductPayload {
    return {
        name: v.name,
        categoryId: v.categoryId,
        brandId: v.brandId ? v.brandId : undefined,
        description: v.description ? v.description : undefined,
        price: v.price,
        salePrice: v.salePrice,
        stockQuantity: v.stockQuantity,
        status: v.status,
        type: v.type,
    };
}