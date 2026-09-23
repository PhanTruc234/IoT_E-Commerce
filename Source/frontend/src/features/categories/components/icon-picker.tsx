'use client';
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES } from '@/shared/config/category-icons';

export function IconPicker({ value, onChange }: { value?: string; onChange: (name: string) => void }) {
    return (
        <div className="grid max-h-44 grid-cols-8 gap-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {CATEGORY_ICON_NAMES.map((name) => {
                const Icon = CATEGORY_ICONS[name];
                const active = value === name;
                return (
                    <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => onChange(name)}
                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );
}