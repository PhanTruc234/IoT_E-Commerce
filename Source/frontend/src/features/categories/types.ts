export interface Category {
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    level: number;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface CategoryTreeNode extends Category {
    children: CategoryTreeNode[];
}