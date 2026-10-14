import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Đăng nhập' };

export default function LoginPage() {
    return (
        <div>
            <h1 className="text-center text-2xl font-semibold text-slate-900">Đăng nhập</h1>
            <p className="mt-1.5 mb-7 text-center text-sm text-slate-500">Chào mừng bạn quay lại IoTech.</p>
            <LoginForm />
            <p className="mt-8 text-center text-sm text-slate-500">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:underline">Đăng ký ngay</Link>
            </p>
        </div>
    );
}
