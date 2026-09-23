import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    function Select({ className = '', children, ...props }, ref) {
        return (
            <select
                ref={ref}
                className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 ${className}`}
                {...props}
            >
                {children}
            </select>
        );
    },
);