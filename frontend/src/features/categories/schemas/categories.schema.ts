import { z } from 'zod';

export const CategoriesSchema = z.object({
    name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
    description: z.string().max(500).optional().or(z.literal('')),
    icon: z.string().optional().or(z.literal('')),
    sortOrder: z.coerce.number().int().min(0),
    isActive: z.boolean(),
});

export type CategoryFormInput = z.input<typeof CategoriesSchema>;   // form giữ
export type CategoryFormOutput = z.output<typeof CategoriesSchema>; // sau parse