import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Email không hợp lệ'),
    password: z
        .string()
        .min(8, 'Mật khẩu tối thiểu 8 ký tự')
        .max(50)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
            'Mật khẩu phải có chữ hoa, chữ thường và ký tự đặc biệt',
        ),
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
        password: z
            .string()
            .min(8, 'Mật khẩu tối thiểu 8 ký tự')
            .max(50)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
                'Mật khẩu phải có chữ hoa, chữ thường và ký tự đặc biệt',
            ),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    });
export type RegisterInput = z.infer<typeof registerSchema>;