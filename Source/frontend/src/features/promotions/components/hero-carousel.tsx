'use client';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActivePromotion } from '../api/promotions.api';
import { PromoSlide } from './promo-slide';

const AUTOPLAY_MS = 6000;
const noop = () => () => { };

function useMounted() {
    return useSyncExternalStore(noop, () => true, () => false);
}
function useReducedMotion() {
    return useSyncExternalStore(
        (cb) => {
            const mq = matchMedia('(prefers-reduced-motion: reduce)');
            mq.addEventListener('change', cb);
            return () => mq.removeEventListener('change', cb);
        },
        () => matchMedia('(prefers-reduced-motion: reduce)').matches,
        () => false,
    );
}
function useTabHidden() {
    return useSyncExternalStore(
        (cb) => {
            document.addEventListener('visibilitychange', cb);
            return () => document.removeEventListener('visibilitychange', cb);
        },
        () => document.hidden,
        () => false,
    );
}

export function HeroCarousel({ promotions, children }: { promotions: ActivePromotion[]; children: React.ReactNode }) {
    const total = promotions.length + 1;
    const [index, setIndex] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const mounted = useMounted();
    const reduceMotion = useReducedMotion();
    const tabHidden = useTabHidden();
    const touchX = useRef<number | null>(null);

    const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

    const autoplay = total > 1 && !hovered && !focused && !tabHidden && !reduceMotion;
    useEffect(() => {
        if (!autoplay) return;
        const id = setTimeout(() => go(index + 1), AUTOPLAY_MS);
        return () => clearTimeout(id);
    }, [autoplay, index, go]);

    if (total === 1) return <section aria-label="Giới thiệu IoTech" className="border-b border-gray-100">{children}</section>;

    const slideProps = (i: number, label: string) => ({
        role: 'group',
        'aria-roledescription': 'slide',
        'aria-label': `${i + 1} / ${total}: ${label}`,
        'aria-hidden': i !== index,
        inert: i !== index,
        className: 'w-full shrink-0',
    });

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Khuyến mãi nổi bật"
            className="relative overflow-clip border-b border-gray-100"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') go(index - 1);
                if (e.key === 'ArrowRight') go(index + 1);
            }}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                if (touchX.current == null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
            }}
        >
            <div
                aria-live={autoplay ? 'off' : 'polite'}
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {promotions.map((p, i) => (
                    <div key={p.id} {...slideProps(i, p.name)}>
                        <PromoSlide promo={p} mounted={mounted} priority={i === 0} />
                    </div>
                ))}
                <div {...slideProps(total - 1, 'Giới thiệu IoTech')}>{children}</div>
            </div>

            <ArrowButton side="left" onClick={() => go(index - 1)} />
            <ArrowButton side="right" onClick={() => go(index + 1)} />

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-white/75 px-1.5 shadow-sm ring-1 ring-black/5 backdrop-blur">
                {Array.from({ length: total }, (_, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-label={`Chuyển tới banner ${i + 1}`}
                        aria-current={i === index}
                        onClick={() => go(i)}
                        className="cursor-pointer p-1.5 focus-visible:outline-2 focus-visible:outline-blue-600"
                    >
                        <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-blue-600' : 'w-3.5 bg-slate-300 hover:bg-slate-400'}`} />
                    </button>
                ))}
            </div>
        </section>
    );
}

function ArrowButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            aria-label={side === 'left' ? 'Banner trước' : 'Banner tiếp theo'}
            onClick={onClick}
            className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-600 md:flex ${side === 'left' ? 'left-4' : 'right-4'}`}
        >
            <Icon aria-hidden className="h-6 w-6" />
        </button>
    );
}
