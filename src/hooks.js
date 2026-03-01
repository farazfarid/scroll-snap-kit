/**
 * scroll-snap-kit — React Hooks
 * Requires React 16.8+
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { getScrollPosition, onScroll, isInViewport } from './utils.js';

/**
 * Returns the current scroll position, updated on scroll.
 * @param {{ throttle?: number, container?: Element }} options
 * @returns {{ x: number, y: number, percentX: number, percentY: number }}
 */
export function useScrollPosition(options = {}) {
    const { throttle = 100, container } = options;
    const [position, setPosition] = useState(() =>
        typeof window !== 'undefined' ? getScrollPosition(container) : { x: 0, y: 0, percentX: 0, percentY: 0 }
    );

    useEffect(() => {
        const cleanup = onScroll((pos) => setPosition(pos), { throttle, container });
        return cleanup;
    }, [throttle, container]);

    return position;
}

/**
 * Returns whether a referenced element is currently in the viewport.
 * @param {{ threshold?: number, once?: boolean }} options
 * @returns {[React.RefObject, boolean]}
 */
export function useInViewport(options = {}) {
    const { threshold = 0, once = false } = options;
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting;
                if (once) {
                    if (visible && !hasTriggered.current) {
                        hasTriggered.current = true;
                        setInView(true);
                        observer.disconnect();
                    }
                } else {
                    setInView(visible);
                }
            },
            { threshold }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold, once]);

    return [ref, inView];
}

/**
 * Returns a scrollTo function scoped to an element ref or the window.
 * @returns {[React.RefObject, (target: Element|number, options?: object) => void]}
 */
export function useScrollTo() {
    const containerRef = useRef(null);

    const scrollToTarget = useCallback((target, options = {}) => {
        const { behavior = 'smooth', offset = 0 } = options;
        const container = containerRef.current;

        if (!container) {
            // fallback to window scroll
            if (typeof target === 'number') {
                window.scrollTo({ top: target + offset, behavior });
            } else if (target instanceof Element) {
                target.scrollIntoView({ behavior });
            }
            return;
        }

        if (typeof target === 'number') {
            container.scrollTo({ top: target + offset, behavior });
        } else if (target instanceof Element) {
            const containerTop = container.getBoundingClientRect().top;
            const targetTop = target.getBoundingClientRect().top;
            container.scrollBy({ top: targetTop - containerTop + offset, behavior });
        }
    }, []);

    return [containerRef, scrollToTarget];
}

/**
 * Tracks whether the user has scrolled past a given pixel threshold.
 * @param {number} threshold - Y pixel value to check against (default: 100)
 * @param {{ container?: Element }} options
 * @returns {boolean}
 */
export function useScrolledPast(threshold = 100, options = {}) {
    const { container } = options;
    const [scrolledPast, setScrolledPast] = useState(false);

    useEffect(() => {
        const cleanup = onScroll(({ y }) => {
            setScrolledPast(y > threshold);
        }, { container });
        return cleanup;
    }, [threshold, container]);

    return scrolledPast;
}

/**
 * Returns scroll direction: 'up' | 'down' | null
 * @param {{ throttle?: number }} options
 * @returns {'up'|'down'|null}
 */
export function useScrollDirection(options = {}) {
    const { throttle = 100 } = options;
    const [direction, setDirection] = useState(null);
    const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

    useEffect(() => {
        const cleanup = onScroll(({ y }) => {
            setDirection(y > lastY.current ? 'down' : 'up');
            lastY.current = y;
        }, { throttle });
        return cleanup;
    }, [throttle]);

    return direction;
}