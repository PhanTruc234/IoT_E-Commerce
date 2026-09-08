import Link from 'next/link';
import { FolderTree, Tags } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
            <p className="mt-1 text-sm text-gray-500">Chào mừng đến trang quản trị. Thống kê chi tiết sẽ có ở Feature ⑯.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/categories" className="rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-sm">
                    <FolderTree className="h-6 w-6 text-blue-600" />
                    <p className="mt-3 font-semibold text-gray-900">Danh mục</p>
                    <p className="text-sm text-gray-500">Quản lý cây danh mục</p>
                </Link>
                <Link href="/admin/brands" className="rounded-xl border border-gray-200 bg-white p-5 transition hover:shadow-sm">
                    <Tags className="h-6 w-6 text-blue-600" />
                    <p className="mt-3 font-semibold text-gray-900">Thương hiệu</p>
                    <p className="text-sm text-gray-500">Quản lý thương hiệu</p>
                </Link>
            </div>
        </div>
    );
}