'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthBootstrap } from '@/features/auth/components/auth-bootstrap';
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
                },
            }),
    );

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
            <QueryClientProvider client={queryClient}>
                <AuthBootstrap />
                {children}
            </QueryClientProvider>
        </GoogleOAuthProvider>
    );
}