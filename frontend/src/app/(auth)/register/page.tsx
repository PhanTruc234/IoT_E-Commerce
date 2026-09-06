import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = { title: 'Đăng ký' };

export default function RegisterPage() {
    return (
        <div>
            <h1 className="mb-1 text-2xl font-semibold text-gray-900">Tạo tài khoản</h1>
            <p className="mb-6 text-sm text-gray-500">Đăng ký để mua sắm thiết bị IoT & linh kiện</p>
            <RegisterForm />
            <p className="mt-6 text-center text-sm text-gray-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:underline">Đăng nhập</Link>
            </p>
        </div>
    );
}