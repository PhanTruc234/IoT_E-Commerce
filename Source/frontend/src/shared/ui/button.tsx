import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100',
};
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm' };

export function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
    return (
        <button
            className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    );
}