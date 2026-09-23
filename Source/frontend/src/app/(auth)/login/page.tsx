import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default function LoginPage() {
    return (
        <div>
            <h1 className="mb-1 text-2xl font-semibold text-gray-900">Đăng nhập</h1>
            <p className="mb-6 text-sm text-gray-500">Chào mừng bạn quay lại 👋</p>
            <LoginForm />
            <p className="mt-6 text-center text-sm text-gray-500">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:underline">Đăng ký ngay</Link>
            </p>
        </div>
    );
}