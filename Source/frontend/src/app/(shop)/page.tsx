import { BadgeCheck, Clock, Headphones, Mail, Package, Phone, RotateCcw, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { FeaturedCategories } from '@/features/products/components/featured-categories';
import { ProductRail } from '@/features/products/components/product-rail';
import { HeroCarousel } from '@/features/promotions/components/hero-carousel';
import { BrandHero } from '@/features/promotions/components/brand-hero';
import { getActivePromotions } from '@/features/promotions/api/get-active-promotions.server';

const TRUST = [
    { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Nhanh chóng, đóng gói an toàn' },
    { icon: ShieldCheck, title: 'Bảo hành theo Serial', desc: 'Tra cứu bảo hành dễ dàng' },
    { icon: BadgeCheck, title: 'Hàng chính hãng', desc: 'Nguồn gốc rõ ràng' },
    { icon: Headphones, title: 'Hỗ trợ kỹ thuật', desc: 'Tư vấn IoT & linh kiện' },
];

export default async function HomePage() {
    const promotions = await getActivePromotions();
    return (
        <>
            <HeroCarousel promotions={promotions}>
                <BrandHero />
            </HeroCarousel>
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {TRUST.map((t) => (
                        <div key={t.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <t.icon className="h-6 w-6 shrink-0 text-blue-600" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                                <p className="text-xs text-gray-500">{t.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <FeaturedCategories />
            <ProductRail title="Sản phẩm bán chạy" sort="best_selling" viewAllHref="/products?sort=best_selling" />
            <ProductRail title="Sản phẩm mới nhất" sort="newest" viewAllHref="/products?sort=newest" />

            <section className="bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-14">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Vì sao chọn chúng tôi?</h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                            Nhà cung cấp thiết bị IoT & linh kiện điện tử uy tín — chính hãng, bảo hành rõ ràng, hỗ trợ kỹ thuật tận tình.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {WHY.map((w) => (
                            <div key={w.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
                                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <w.icon className="h-6 w-6" />
                                </span>
                                <p className="mt-3 font-semibold text-gray-900">{w.title}</p>
                                <p className="mt-1 text-sm text-gray-500">{w.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-8 text-white">
                        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15">
                                    <Headphones className="h-7 w-7" />
                                </span>
                                <div>
                                    <p className="text-lg font-bold">Cần tư vấn kỹ thuật?</p>
                                    <p className="text-sm text-blue-100">Đội ngũ hỗ trợ IoT & linh kiện sẵn sàng giúp bạn chọn đúng sản phẩm.</p>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <a href="tel:19001234" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/20">
                                    <Phone className="h-5 w-5" /> 0123456789
                                </a>
                                <a href="mailto:support@iotech.com" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/20">
                                    <Mail className="h-5 w-5" /> support@iotech.com
                                </a>
                                <span className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium">
                                    <Clock className="h-5 w-5" /> 8:00 – 21:00
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

const WHY = [
    { icon: BadgeCheck, title: 'Hàng chính hãng', desc: 'Nguồn gốc rõ ràng, đầy đủ hoá đơn.' },
    { icon: ShieldCheck, title: 'Bảo hành theo serial', desc: 'Tra cứu bảo hành minh bạch, nhanh chóng.' },
    { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Đóng gói an toàn, miễn phí đơn từ 500k.' },
    { icon: RotateCcw, title: 'Đổi trả 7 ngày', desc: 'Yên tâm mua sắm, hỗ trợ đổi trả dễ dàng.' },
    { icon: Wallet, title: 'Thanh toán linh hoạt', desc: 'COD hoặc VNPAY, an toàn tiện lợi.' },
    { icon: Headphones, title: 'Hỗ trợ kỹ thuật', desc: 'Tư vấn chọn thiết bị & giải đáp dự án IoT.' },
    { icon: Package, title: 'Kho hàng đa dạng', desc: 'ESP32, Arduino, cảm biến, linh kiện… đầy đủ.' },
    { icon: Clock, title: 'Xử lý đơn nhanh', desc: 'Xác nhận & giao hàng trong thời gian ngắn.' },
];