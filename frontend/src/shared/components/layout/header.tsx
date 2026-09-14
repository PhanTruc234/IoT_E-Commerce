import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { UserNav } from '@/features/auth/components/user-nav';
import { SearchBar } from './search-bar';
import { MobileMenu } from './mobile-menu';
import { CategoryMenu } from './category-menu';
import { CartButton } from '@/features/cart/components/cart-button';
import logo from "../../../../public/IoTechNew.png"
export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4">
                <MobileMenu />

                <Link href="/" className="flex shrink-0 items-center">
                    <Image src={logo} alt="IoTech" priority className="h-20 w-auto object-contain" />
                </Link>

                <div className="hidden flex-1 md:block">
                    <SearchBar />
                </div>

                <nav className="ml-auto flex items-center gap-1 sm:gap-2">
                    <Link
                        href="/favorites"
                        aria-label="Yêu thích"
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
                    >
                        <Heart className="h-5 w-5" />
                    </Link>
                    <CartButton />
                    <div className="mx-1 hidden h-6 w-px bg-gray-200 sm:block" />
                    <UserNav />
                </nav>
            </div>
            <div className="hidden border-t border-gray-100 md:block">
                <div className="mx-auto flex max-w-7xl items-center gap-2 px-4">
                    <CategoryMenu />
                    <Link href="/" className="px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:text-blue-600">
                        Trang chủ
                    </Link>
                    <Link href="/products" className="px-4 py-2.5 text-sm text-gray-600 transition hover:text-blue-600">
                        Tất cả sản phẩm
                    </Link>
                    <Link href="/compare" className="px-4 py-2.5 text-sm text-gray-600 transition hover:text-blue-600">
                        So sánh sản phẩm
                    </Link>
                    <Link href="/warranty" className="px-4 py-2.5 text-sm text-gray-600 transition hover:text-blue-600">
                        Bảo hành
                    </Link>
                </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-2 md:hidden">
                <SearchBar />
            </div>
        </header>
    );
}