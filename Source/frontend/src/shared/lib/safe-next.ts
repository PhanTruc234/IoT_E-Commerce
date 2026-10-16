export function getSafeNext(): string | null {
    if (typeof window === 'undefined') return null;
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next || !next.startsWith('/') || /[\\\x00-\x1f]/.test(next)) return null;
    try {
        const url = new URL(next, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        return url.pathname + url.search + url.hash;
    } catch {
        return null;
    }
}

export function loginUrl(next: string) {
    return `/login?next=${encodeURIComponent(next)}`;
}
