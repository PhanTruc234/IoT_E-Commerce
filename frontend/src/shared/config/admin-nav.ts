import {
    BarChart3, Barcode, FolderTree, Headset, LayoutDashboard, LifeBuoy, MessageCircleQuestion,
    MessageSquareText,
    Package, ScrollText, ShieldCheck, ShoppingCart, Tags, Users, type LucideIcon,
} from 'lucide-react';

export interface AdminNavItem { label: string; href: string; icon: LucideIcon }

export const ADMIN_NAV: AdminNavItem[] = [
    { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Sản phẩm', href: '/admin/products', icon: Package },
    { label: 'Danh mục', href: '/admin/categories', icon: FolderTree },
    { label: 'Thương hiệu', href: '/admin/brands', icon: Tags },
    { label: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Người dùng', href: '/admin/users', icon: Users },
    { label: 'Serial', href: '/admin/serials', icon: Barcode },
    // { label: 'Bảo hành', href: '/admin/warranties', icon: ShieldCheck },
    { label: 'Hỏi đáp', href: '/admin/questions', icon: MessageCircleQuestion },
    { label: 'Đánh giá', href: '/admin/reviews', icon: MessageSquareText },
    { label: 'Hỗ trợ', href: '/admin/support', icon: Headset },
    { label: 'Thống kê', href: '/admin/statistics', icon: BarChart3 },
    { label: 'Nhật ký', href: '/admin/audit-logs', icon: ScrollText },
];