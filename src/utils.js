/**
 * scroll-snap-kit — Core Utilities
 */

/**
 * Smoothly scrolls to a target element or position.
 * @param {Element|number} target - A DOM element or Y pixel value
 * @param {{ behavior?: ScrollBehavior, block?: ScrollLogicalPosition, offset?: number }} options
 */
export function scrollTo(target, options = {}) {
    const { behavior = 'smooth', block = 'start', offset = 0 } = options;

    if (typeof target === 'number') {
        window.scrollTo({ top: target + offset, behavior });
        return;
    }

    if (!(target instanceof Element)) {
        console.warn('[scroll-snap-kit] scrollTo: target must be an Element or a number');
        return;
    }

    if (offset !== 0) {
        const y = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y, behavior });
    } else {
        target.scrollIntoView({ behavior, block });
    }
}

/**
 * Smoothly scrolls to the top of the page.
 * @param {{ behavior?: ScrollBehavior }} options
 */
export function scrollToTop(options = {}) {
    const { behavior = 'smooth' } = options;
    window.scrollTo({ top: 0, behavior });
}

/**
 * Smoothly scrolls to the bottom of the page.
 * @param {{ behavior?: ScrollBehavior }} options
 */
export function scrollToBottom(options = {}) {
    const { behavior = 'smooth' } = options;
    window.scrollTo({ top: document.body.scrollHeight, behavior });
}

/**
 * Returns the current scroll position and scroll percentage.
 * @param {Element} [container=window] - Optional scrollable container
 * @returns {{ x: number, y: number, percentX: number, percentY: number }}
 */
export function getScrollPosition(container) {
    if (container && container instanceof Element) {
        const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container;
        return {
            x: scrollLeft,
            y: scrollTop,
            percentX: scrollWidth > clientWidth ? Math.round((scrollLeft / (scrollWidth - clientWidth)) * 100) : 0,
            percentY: scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 0,
        };
    }

    const x = window.scrollX;
    const y = window.scrollY;
    const maxX = document.body.scrollWidth - window.innerWidth;
    const maxY = document.body.scrollHeight - window.innerHeight;

    return {
        x,
        y,
        percentX: maxX > 0 ? Math.round((x / maxX) * 100) : 0,
        percentY: maxY > 0 ? Math.round((y / maxY) * 100) : 0,
    };
}

/**
 * Attaches a throttled scroll event listener.
 * @param {(position: ReturnType<typeof getScrollPosition>) => void} callback
 * @param {{ throttle?: number, container?: Element }} options
 * @returns {() => void} Cleanup function to remove the listener
 */
export function onScroll(callback, options = {}) {
    const { throttle: throttleMs = 100, container } = options;
    const target = container || window;

    let ticking = false;
    let lastTime = 0;

    const handler = () => {
        const now = Date.now();
        if (now - lastTime < throttleMs) {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    callback(getScrollPosition(container));
                    ticking = false;
                    lastTime = Date.now();
                });
            }
            return;
        }
        lastTime = now;
        callback(getScrollPosition(container));
    };

    target.addEventListener('scroll', handler, { passive: true });
    return () => target.removeEventListener('scroll', handler);
}

/**
 * Checks whether an element is currently visible in the viewport.
 * @param {Element} element
 * @param {{ threshold?: number }} options - threshold: 0–1, portion of element that must be visible
 * @returns {boolean}
 */
export function isInViewport(element, options = {}) {
    if (!(element instanceof Element)) {
        console.warn('[scroll-snap-kit] isInViewport: argument must be an Element');
        return false;
    }

    const { threshold = 0 } = options;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    const verticalVisible = rect.top + rect.height * threshold < windowHeight && rect.bottom - rect.height * threshold > 0;
    const horizontalVisible = rect.left + rect.width * threshold < windowWidth && rect.right - rect.width * threshold > 0;

    return verticalVisible && horizontalVisible;
}

/**
 * Locks the page scroll (e.g. when a modal is open).
 */
export function lockScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
}

/**
 * Unlocks the page scroll and restores position.
 */
export function unlockScroll() {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
}