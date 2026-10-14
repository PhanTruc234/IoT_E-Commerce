import { AlertCircle, Lock } from 'lucide-react';


export function AuthAlert({ message, locked }: { message: string; locked?: boolean }) {
    return (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <span>{message}</span>
        </div>
    );
}
