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

// ─────────────────────────────────────────────
// NEW FEATURES
// ─────────────────────────────────────────────

/**
 * scrollSpy — watches scroll position and highlights nav links
 * matching the currently active section.
 *
 * @param {string} sectionsSelector   CSS selector for the sections to spy on
 * @param {string} linksSelector      CSS selector for the nav links
 * @param {{ offset?: number, activeClass?: string }} options
 * @returns {() => void}  cleanup / stop function
 *
 * @example
 * const stop = scrollSpy('section[id]', 'nav a', { offset: 80, activeClass: 'active' })
 */
export function scrollSpy(sectionsSelector, linksSelector, options = {}) {
    const { offset = 0, activeClass = 'scroll-spy-active' } = options;

    const sections = Array.from(document.querySelectorAll(sectionsSelector));
    const links = Array.from(document.querySelectorAll(linksSelector));

    if (!sections.length || !links.length) {
        console.warn('[scroll-snap-kit] scrollSpy: no sections or links found');
        return () => { };
    }

    function update() {
        const scrollY = window.scrollY + offset;
        let current = sections[0];

        for (const section of sections) {
            if (section.offsetTop <= scrollY) current = section;
        }

        links.forEach(link => {
            link.classList.remove(activeClass);
            const href = link.getAttribute('href');
            if (href && current && href === `#${current.id}`) {
                link.classList.add(activeClass);
            }
        });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
}

/**
 * onScrollEnd — fires a callback once the user stops scrolling.
 *
 * @param {() => void} callback
 * @param {{ delay?: number, container?: Element }} options
 * @returns {() => void}  cleanup function
 *
 * @example
 * const stop = onScrollEnd(() => console.log('Scrolling stopped!'), { delay: 150 })
 */
export function onScrollEnd(callback, options = {}) {
    const { delay = 150, container } = options;
    const target = container || window;
    let timer = null;

    const handler = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(getScrollPosition(container));
        }, delay);
    };

    target.addEventListener('scroll', handler, { passive: true });
    return () => {
        clearTimeout(timer);
        target.removeEventListener('scroll', handler);
    };
}

/**
 * scrollIntoViewIfNeeded — scrolls to an element only if it is
 * partially or fully outside the visible viewport.
 *
 * @param {Element} element
 * @param {{ behavior?: ScrollBehavior, offset?: number, threshold?: number }} options
 *   threshold: 0–1, how much of the element must be visible before we skip scrolling (default 1 = fully visible)
 *
 * @example
 * scrollIntoViewIfNeeded(document.querySelector('.card'))
 */
export function scrollIntoViewIfNeeded(element, options = {}) {
    if (!(element instanceof Element)) {
        console.warn('[scroll-snap-kit] scrollIntoViewIfNeeded: argument must be an Element');
        return;
    }

    const { behavior = 'smooth', offset = 0, threshold = 1 } = options;
    const rect = element.getBoundingClientRect();
    const wh = window.innerHeight || document.documentElement.clientHeight;
    const ww = window.innerWidth || document.documentElement.clientWidth;

    const visibleH = Math.min(rect.bottom, wh) - Math.max(rect.top, 0);
    const visibleW = Math.min(rect.right, ww) - Math.max(rect.left, 0);
    const visibleRatio =
        (Math.max(0, visibleH) * Math.max(0, visibleW)) / (rect.height * rect.width);

    if (visibleRatio >= threshold) return; // already sufficiently visible — skip

    const y = rect.top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior });
}

/**
 * Built-in easing functions for use with easeScroll().
 */
export const Easings = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: (t) => t * t * t * t,
    easeOutQuart: (t) => 1 - (--t) * t * t * t,
    easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    easeOutBounce: (t) => {
        const n1 = 7.5625, d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
};

/**
 * easeScroll — scroll to a position with a custom easing curve,
 * bypassing the browser's native smooth scroll.
 *
 * @param {Element|number} target   DOM element or pixel Y value
 * @param {{ duration?: number, easing?: (t: number) => number, offset?: number }} options
 * @returns {Promise<void>}  resolves when animation completes
 *
 * @example
 * await easeScroll('#contact', { duration: 800, easing: Easings.easeOutElastic })
 */
export function easeScroll(target, options = {}) {
    const { duration = 600, easing = Easings.easeInOutCubic, offset = 0 } = options;

    let targetY;
    if (typeof target === 'number') {
        targetY = target + offset;
    } else {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) { console.warn('[scroll-snap-kit] easeScroll: target not found'); return Promise.resolve(); }
        targetY = el.getBoundingClientRect().top + window.scrollY + offset;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    return new Promise((resolve) => {
        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);

            window.scrollTo(0, startY + distance * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}