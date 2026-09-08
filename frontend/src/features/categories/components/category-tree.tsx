'use client';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { CategoryIcon } from './category-icon';
import type { CategoryTreeNode } from '../types';

interface Actions {
    onAddChild: (node: CategoryTreeNode) => void;
    onEdit: (node: CategoryTreeNode) => void;
    onDelete: (node: CategoryTreeNode) => void;
}

function Row({ node, ...actions }: { node: CategoryTreeNode } & Actions) {
    return (
        <>
            <div className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50" style={{ paddingLeft: (node.level - 1) * 24 + 8 }}>
                <CategoryIcon name={node.icon} className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="font-medium text-gray-800">{node.name}</span>
                <span className="text-xs text-gray-400">/{node.slug}</span>
                {!node.isActive && <Badge color="gray">Ẩn</Badge>}
                <span className="rounded bg-gray-100 px-1.5 text-xs text-gray-500">Cấp {node.level}</span>
                <div className="ml-auto flex items-center gap-1">
                    {node.level < 3 && (
                        <button onClick={() => actions.onAddChild(node)} title="Thêm danh mục con" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 cursor-pointer">
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={() => actions.onEdit(node)} title="Sửa" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 cursor-pointer">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => actions.onDelete(node)} title="Xóa" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {node.children.map((c) => (
                <Row key={c.id} node={c} {...actions} />
            ))}
        </>
    );
}

export function CategoryTree({ nodes, ...actions }: { nodes: CategoryTreeNode[] } & Actions) {
    return (
        <div className="divide-y divide-gray-50">
            {nodes.map((n) => (
                <Row key={n.id} node={n} {...actions} />
            ))}
        </div>
    );
}