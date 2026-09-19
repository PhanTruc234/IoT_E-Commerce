import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { CATEGORIES } from '@/shared/config/navigation';
import logo from "../../../../public/IoTechNew.png"
export function Footer() {
    return (
        <footer className="mt-16 border-t border-gray-200 bg-gray-50">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-5">
                <div className="col-span-2 md:col-span-1">
                    <Image src={logo} alt="IoTech" className="h-20 w-auto object-contain" />
                    <p className="mt-3 text-sm text-gray-500">
                        Cửa hàng thiết bị IoT, module, cảm biến, Arduino/ESP32 và linh kiện điện tử chính hãng.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <a href="#" aria-label="Facebook" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:text-blue-600">
                            {/* <Facebook className="h-4 w-4" /> */}
                        </a>
                        <a href="#" aria-label="Github" className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:text-blue-600">
                            {/* <Github className="h-4 w-4" /> */}
                        </a>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Danh mục</h3>
                    <ul className="mt-3 space-y-2">
                        {CATEGORIES.slice(0, 5).map((c) => (
                            <li key={c.slug}>
                                <Link href={`/products?category=${c.slug}`} className="text-sm text-gray-500 hover:text-blue-600">
                                    {c.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Hỗ trợ</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-500">
                        <li><Link href="/warranty" className="hover:text-blue-600">Tra cứu bảo hành</Link></li>
                        <li><Link href="/orders" className="hover:text-blue-600">Tra cứu đơn hàng</Link></li>
                        <li><Link href="/account" className="hover:text-blue-600">Tài khoản của tôi</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Pháp lý</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-500">
                        <li><Link href="/legal/terms" className="hover:text-blue-600">Điều khoản sử dụng</Link></li>
                        <li><Link href="/legal/privacy" className="hover:text-blue-600">Bảo vệ dữ liệu cá nhân</Link></li>
                        <li><Link href="/legal/return" className="hover:text-blue-600">Chính sách đổi trả</Link></li>
                        <li><Link href="/legal/warranty" className="hover:text-blue-600">Chính sách bảo hành</Link></li>
                        <li><Link href="/legal/shipping" className="hover:text-blue-600">Chính sách vận chuyển</Link></li>
                        <li><Link href="/legal/payment" className="hover:text-blue-600">Chính sách thanh toán</Link></li>
                        <li><Link href="/legal" className="hover:text-blue-600">Tất cả chính sách</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Liên hệ</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> TP. Hồ Chí Minh</li>
                        <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> 0123 456 789</li>
                        <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> support@tmdt-iot.local</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-200 py-4">
                <p className="mx-auto max-w-7xl px-4 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} IoTech — Đồ án tốt nghiệp. Bảo lưu mọi quyền.
                </p>
            </div>
        </footer>
    );
}