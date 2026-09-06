import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-8 block text-center text-2xl font-bold tracking-tight text-gray-900">
                    TMĐT<span className="text-blue-600">IoT</span>
                </Link>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
            </div>
        </div>
    );
}