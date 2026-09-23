'use client';
import { useState } from 'react';
import { FolderTree, Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/admin/page-header';
import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/spinner';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import { useAdminCategoryTree, useDeleteCategory } from '@/features/categories/hooks/use-categories';
import { CategoryTree } from '@/features/categories/components/category-tree';
import { CategoryFormModal } from '@/features/categories/components/category-form-modal';
import type { Category, CategoryTreeNode } from '@/features/categories/types';

type ModalState =
    | { mode: 'create'; parent: { id: string; name: string; level: number } | null }
    | { mode: 'edit'; category: Category }
    | null;

export default function AdminCategoriesPage() {
    const { data, isLoading, isError, error } = useAdminCategoryTree();
    const del = useDeleteCategory();
    const [modal, setModal] = useState<ModalState>(null);
    const [target, setTarget] = useState<CategoryTreeNode | null>(null);

    return (
        <div>
            <PageHeader
                title="Danh mục"
                action={<Button onClick={() => setModal({ mode: 'create', parent: null })}><Plus className="h-4 w-4" /> Thêm danh mục</Button>}
            />

            <div className="rounded-xl border border-gray-200 bg-white">
                {isLoading && <div className="flex justify-center py-16"><Spinner /></div>}
                {isError && <div className="p-6 text-sm text-red-600">{getApiErrorMessage(error)}</div>}
                {data && data.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-center">
                        <FolderTree className="h-10 w-10 text-gray-300" />
                        <p className="mt-3 text-sm text-gray-500">Chưa có danh mục nào.</p>
                    </div>
                )}
                {data && data.length > 0 && (
                    <div className="p-2">
                        <CategoryTree
                            nodes={data}
                            onAddChild={(n) => setModal({
                                mode: 'create',
                                parent: {
                                    id: n.id,
                                    name: n.name,
                                    level:
                                        n.level
                                }
                            })}
                            onEdit={(n) => setModal({ mode: 'edit', category: n })}
                            onDelete={(n) => setTarget(n)}
                        />
                    </div>
                )}
            </div>

            <CategoryFormModal
                open={modal !== null}
                onClose={() => setModal(null)}
                mode={modal?.mode ?? 'create'}
                parent={modal?.mode === 'create' ? modal.parent : null}
                category={modal?.mode === 'edit' ? modal.category : undefined}
            />

            <ConfirmDialog
                open={target !== null}
                title="Xóa danh mục"
                message={`Xóa "${target?.name}"? Không thể xóa nếu còn danh mục con.`}
                error={del.isError ? getApiErrorMessage(del.error) : undefined}
                loading={del.isPending}
                onClose={() => { setTarget(null); del.reset(); }}
                onConfirm={() => { if (target) del.mutate(target.id, { onSuccess: () => setTarget(null) }); }}
            />
        </div>
    );
}