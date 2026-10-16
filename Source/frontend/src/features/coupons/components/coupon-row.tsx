'use client';
import { Children, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CouponRow({ children, label }: { children: React.ReactNode; label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ prev: false, next: false });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => setEdges({
            prev: el.scrollLeft > 4,
            next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
        });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        el.addEventListener('scroll', update, { passive: true });
        return () => {
            ro.disconnect();
            el.removeEventListener('scroll', update);
        };
    }, []);

    const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: 'smooth' });

    return (
        <div className="relative">
            <div
                ref={ref}
                role="list"
                aria-label={label}
                className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pt-1 pb-3 scrollbar-none [&::-webkit-scrollbar]:hidden"
            >
                {Children.map(children, (child) => (
                    <div role="listitem" className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]">
                        {child}
                    </div>
                ))}
            </div>
            {edges.prev && <RowArrow side="left" onClick={() => scroll(-1)} />}
            {edges.next && <RowArrow side="right" onClick={() => scroll(1)} />}
        </div>
    );
}

function RowArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={side === 'left' ? 'Xem mã trước' : 'Xem thêm mã'}
            className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-200 transition hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 md:flex ${side === 'left' ? '-left-5' : '-right-5'}`}
        >
            <Icon aria-hidden className="h-5 w-5" />
        </button>
    );
}
