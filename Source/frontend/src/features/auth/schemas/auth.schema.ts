import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
        email: z.email('Email không hợp lệ'),
        phone: z
            .string()
            .regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ')
            .optional()
            .or(z.literal('')),
        password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(50),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });
export type RegisterInput = z.infer<typeof registerSchema>;