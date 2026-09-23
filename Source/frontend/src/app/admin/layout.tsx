import { RequireAuth } from '@/features/auth/components/require-auth';
import { AdminShell } from '@/shared/components/admin/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RequireAuth role="ADMIN">
            <AdminShell>{children}</AdminShell>
        </RequireAuth>
    );
}