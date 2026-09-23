import { Folder } from 'lucide-react';
import { CATEGORY_ICONS } from '@/shared/config/category-icons';

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
    const Icon = (name && CATEGORY_ICONS[name]) || Folder;
    return <Icon className={className} />;
}