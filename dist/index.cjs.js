/**
 * scroll-snap-kit v2.0.0 (CommonJS)
 * MIT License — https://github.com/farazfarid/scroll-snap-kit
 */
"use strict";

/**
 * scroll-snap-kit — Core Utilities
 */

/**
 * Smoothly scrolls to a target element or position.
 * @param {Element|number} target - A DOM element or Y pixel value
 * @param {{ behavior?: ScrollBehavior, block?: ScrollLogicalPosition, offset?: number }} options
 */
function scrollTo(target, options = {}) {
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
function scrollToTop(options = {}) {
    const { behavior = 'smooth' } = options;
    window.scrollTo({ top: 0, behavior });
}

/**
 * Smoothly scrolls to the bottom of the page.
 * @param {{ behavior?: ScrollBehavior }} options
 */
function scrollToBottom(options = {}) {
    const { behavior = 'smooth' } = options;
    window.scrollTo({ top: document.body.scrollHeight, behavior });
}

/**
 * Returns the current scroll position and scroll percentage.
 * @param {Element} [container=window] - Optional scrollable container
 * @returns {{ x: number, y: number, percentX: number, percentY: number }}
 */
function getScrollPosition(container) {
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
function onScroll(callback, options = {}) {
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
function isInViewport(element, options = {}) {
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
function lockScroll() {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
}

/**
 * Unlocks the page scroll and restores position.
 */
function unlockScroll() {
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
function scrollSpy(sectionsSelector, linksSelector, options = {}) {
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
function onScrollEnd(callback, options = {}) {
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
function scrollIntoViewIfNeeded(element, options = {}) {
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
const Easings = {
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
function easeScroll(target, options = {}) {
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

// ─────────────────────────────────────────────
// v1.2 FEATURES
// ─────────────────────────────────────────────

/**
 * scrollSequence — run multiple easeScroll animations one after another.
 * Returns { promise, cancel } — cancel() aborts mid-sequence.
 *
 * @example
 * const { promise, cancel } = scrollSequence([
 *   { target: '#intro',    duration: 600 },
 *   { target: '#features', duration: 800, pause: 400 },
 *   { target: '#pricing',  duration: 600, easing: Easings.easeOutElastic },
 * ])
 */
function scrollSequence(steps) {
    let cancelled = false;
    const promise = (async () => {
        for (const step of steps) {
            if (cancelled) break;
            const { target, duration = 600, easing = Easings.easeInOutCubic, offset = 0, pause = 0 } = step;
            await easeScroll(target, { duration, easing, offset });
            if (pause > 0 && !cancelled) await new Promise(res => setTimeout(res, pause));
        }
    })();
    return { promise, cancel: () => { cancelled = true; } };
}

/**
 * parallax — attach a parallax scroll effect to one or more elements.
 * speed < 1 = slower (background), speed > 1 = faster (foreground), speed < 0 = reverse.
 * Returns a destroy / cleanup function.
 *
 * @example
 * const destroy = parallax('.hero-bg', { speed: 0.4 })
 * const destroy = parallax('.clouds',  { speed: -0.2, axis: 'x' })
 */
function parallax(targets, options = {}) {
    const { speed = 0.5, axis = 'y', container } = options;
    let els;
    if (typeof targets === 'string') els = Array.from(document.querySelectorAll(targets));
    else if (targets instanceof Element) els = [targets];
    else els = Array.from(targets);
    if (!els.length) { console.warn('[scroll-snap-kit] parallax: no elements found'); return () => { }; }

    const origins = els.map(el => ({
        el,
        originY: el.getBoundingClientRect().top + window.scrollY,
        originX: el.getBoundingClientRect().left + window.scrollX,
    }));

    let rafId = null;
    function update() {
        const scrollY = container ? container.scrollTop : window.scrollY;
        const scrollX = container ? container.scrollLeft : window.scrollX;
        origins.forEach(({ el, originY, originX }) => {
            const dy = (scrollY - (originY - window.innerHeight / 2)) * (speed - 1);
            const dx = (scrollX - (originX - window.innerWidth / 2)) * (speed - 1);
            if (axis === 'y') el.style.transform = `translateY(${dy}px)`;
            else if (axis === 'x') el.style.transform = `translateX(${dx}px)`;
            else el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        rafId = null;
    }
    const handler = () => { if (!rafId) rafId = requestAnimationFrame(update); };
    const t = container || window;
    t.addEventListener('scroll', handler, { passive: true });
    update();
    return () => {
        t.removeEventListener('scroll', handler);
        if (rafId) cancelAnimationFrame(rafId);
        origins.forEach(({ el }) => { el.style.transform = ''; });
    };
}

/**
 * scrollProgress — track how far the user has scrolled through a specific element (0→1).
 * 0 = element top just entered the viewport, 1 = element bottom just left the viewport.
 * Returns a cleanup function.
 *
 * @example
 * const stop = scrollProgress('#article', progress => {
 *   bar.style.width = `${progress * 100}%`
 * })
 */
function scrollProgress(element, callback, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) { console.warn('[scroll-snap-kit] scrollProgress: element not found'); return () => { }; }
    const { offset = 0 } = options;
    function calculate() {
        const rect = el.getBoundingClientRect();
        const wh = window.innerHeight;
        const total = rect.height + wh;
        const passed = wh - rect.top + offset;
        callback(Math.min(1, Math.max(0, passed / total)));
    }
    calculate();
    window.addEventListener('scroll', calculate, { passive: true });
    window.addEventListener('resize', calculate);
    return () => {
        window.removeEventListener('scroll', calculate);
        window.removeEventListener('resize', calculate);
    };
}

/**
 * snapToSection — after scrolling stops, auto-snap to the nearest section.
 * Returns a destroy function.
 *
 * @example
 * const destroy = snapToSection('section[id]', { delay: 150, offset: -70 })
 */
function snapToSection(sections, options = {}) {
    const { delay = 150, offset = 0, duration = 500, easing = Easings.easeInOutCubic } = options;
    const els = typeof sections === 'string'
        ? Array.from(document.querySelectorAll(sections))
        : Array.from(sections);
    if (!els.length) { console.warn('[scroll-snap-kit] snapToSection: no sections found'); return () => { }; }

    let timer = null, snapping = false;
    const handler = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            if (snapping) return;
            snapping = true;
            const scrollMid = window.scrollY + window.innerHeight / 2;
            let closest = els[0], minDist = Infinity;
            els.forEach(el => {
                const mid = el.offsetTop + el.offsetHeight / 2;
                const d = Math.abs(mid - scrollMid);
                if (d < minDist) { minDist = d; closest = el; }
            });
            await easeScroll(closest, { duration, easing, offset });
            snapping = false;
        }, delay);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handler); };
}

// ─────────────────────────────────────────────
// v2.0 FEATURES
// ─────────────────────────────────────────────

/**
 * scrollReveal — animate elements in as they scroll into view.
 * Supports fade, slide (up/down/left/right), scale, and combinations.
 * Uses IntersectionObserver for performance.
 * Returns a destroy function.
 *
 * @param {string|Element|Element[]} targets
 * @param {{ effect?: 'fade'|'slide-up'|'slide-down'|'slide-left'|'slide-right'|'scale'|'fade-scale',
 *           duration?: number, delay?: number, easing?: string,
 *           threshold?: number, once?: boolean, distance?: string }} options
 * @returns {() => void}
 *
 * @example
 * const destroy = scrollReveal('.card', { effect: 'slide-up', duration: 600, delay: 100 })
 */
function scrollReveal(targets, options = {}) {
    const {
        effect = 'fade',
        duration = 500,
        delay = 0,
        easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
        threshold = 0.15,
        once = true,
        distance = '24px',
    } = options;

    const els = typeof targets === 'string'
        ? Array.from(document.querySelectorAll(targets))
        : targets instanceof Element ? [targets] : Array.from(targets);

    if (!els.length) { console.warn('[scroll-snap-kit] scrollReveal: no elements found'); return () => { }; }

    const hiddenStyles = {
        'fade': { opacity: '0' },
        'slide-up': { opacity: '0', transform: `translateY(${distance})` },
        'slide-down': { opacity: '0', transform: `translateY(-${distance})` },
        'slide-left': { opacity: '0', transform: `translateX(${distance})` },
        'slide-right': { opacity: '0', transform: `translateX(-${distance})` },
        'scale': { opacity: '0', transform: 'scale(0.9)' },
        'fade-scale': { opacity: '0', transform: `scale(0.95) translateY(${distance})` },
    };

    const hidden = hiddenStyles[effect] || hiddenStyles['fade'];

    // Save original styles and apply hidden state
    els.forEach((el, i) => {
        el._ssk_origin = { transition: el.style.transition, ...Object.fromEntries(Object.keys(hidden).map(k => [k, el.style[k]])) };
        Object.assign(el.style, hidden);
        el.style.transition = `opacity ${duration}ms ${easing} ${delay + i * 0}ms, transform ${duration}ms ${easing} ${delay}ms`;
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const i = els.indexOf(el);
                setTimeout(() => {
                    el.style.opacity = '';
                    el.style.transform = '';
                }, i * (delay || 0));
                if (once) obs.unobserve(el);
            } else if (!once) {
                Object.assign(entry.target.style, hidden);
            }
        });
    }, { threshold });

    els.forEach(el => obs.observe(el));

    return () => {
        obs.disconnect();
        els.forEach(el => {
            if (el._ssk_origin) {
                el.style.transition = el._ssk_origin.transition;
                el.style.opacity = el._ssk_origin.opacity || '';
                el.style.transform = el._ssk_origin.transform || '';
                delete el._ssk_origin;
            }
        });
    };
}

/**
 * scrollTimeline — drive CSS custom properties (variables) from scroll position,
 * letting you animate anything via CSS using `var(--scroll-progress)` etc.
 * Also supports directly animating numeric CSS properties on elements.
 *
 * @param {Array<{
 *   property: string,        // CSS custom property name e.g. '--hero-opacity'
 *   from: number,            // value at scrollStart
 *   to: number,              // value at scrollEnd
 *   unit?: string,           // CSS unit e.g. 'px', '%', 'deg', 'rem' (default: '')
 *   scrollStart?: number,    // page scroll Y to begin (default: 0)
 *   scrollEnd?: number,      // page scroll Y to end (default: document height)
 *   target?: Element|string, // element to set the property on (default: document.documentElement)
 * }>} tracks
 * @returns {() => void}  cleanup function
 *
 * @example
 * const stop = scrollTimeline([
 *   { property: '--hero-opacity', from: 1, to: 0, scrollStart: 0, scrollEnd: 400 },
 *   { property: '--nav-blur',     from: 0, to: 16, unit: 'px', scrollStart: 0, scrollEnd: 200 },
 * ])
 */
function scrollTimeline(tracks, options = {}) {
    if (!Array.isArray(tracks) || !tracks.length) {
        console.warn('[scroll-snap-kit] scrollTimeline: tracks must be a non-empty array');
        return () => { };
    }

    const resolved = tracks.map(t => ({
        ...t,
        unit: t.unit ?? '',
        scrollStart: t.scrollStart ?? 0,
        scrollEnd: t.scrollEnd ?? (document.body.scrollHeight - window.innerHeight),
        target: typeof t.target === 'string'
            ? document.querySelector(t.target)
            : (t.target ?? document.documentElement),
    }));

    let rafId = null;

    function update() {
        const scrollY = window.scrollY;
        resolved.forEach(({ property, from, to, unit, scrollStart, scrollEnd, target }) => {
            const range = scrollEnd - scrollStart;
            const progress = range <= 0 ? 1 : Math.min(1, Math.max(0, (scrollY - scrollStart) / range));
            const value = from + (to - from) * progress;
            target.style.setProperty(property, `${value}${unit}`);
        });
        rafId = null;
    }

    const handler = () => { if (!rafId) rafId = requestAnimationFrame(update); };
    window.addEventListener('scroll', handler, { passive: true });
    update();

    return () => {
        window.removeEventListener('scroll', handler);
        if (rafId) cancelAnimationFrame(rafId);
        resolved.forEach(({ property, target }) => target.style.removeProperty(property));
    };
}

/**
 * infiniteScroll — fire a callback when the user scrolls near the bottom of the
 * page (or a scrollable container), typically used to load more content.
 *
 * Automatically re-arms itself after the callback resolves (if it returns a Promise)
 * or after a configurable cooldown, so rapid triggers are prevented.
 *
 * @param {() => void | Promise<void>} callback
 * @param {{ threshold?: number, cooldown?: number, container?: Element }} options
 * @returns {() => void}  cleanup / stop function
 *
 * @example
 * const stop = infiniteScroll(async () => {
 *   const items = await fetchMoreItems()
 *   appendItems(items)
 * }, { threshold: 300 })
 */
function infiniteScroll(callback, options = {}) {
    const { threshold = 200, cooldown = 500, container } = options;
    let loading = false;

    const getRemaining = () => {
        if (container) {
            return container.scrollHeight - container.scrollTop - container.clientHeight;
        }
        return document.body.scrollHeight - window.scrollY - window.innerHeight;
    };

    const handler = async () => {
        if (loading) return;
        if (getRemaining() <= threshold) {
            loading = true;
            try {
                await Promise.resolve(callback());
            } finally {
                setTimeout(() => { loading = false; }, cooldown);
            }
        }
    };

    const target = container || window;
    target.addEventListener('scroll', handler, { passive: true });
    handler(); // check immediately in case already near bottom

    return () => target.removeEventListener('scroll', handler);
}

/**
 * scrollTrap — contain scroll within a specific element (like a modal or drawer),
 * preventing the background page from scrolling while the element is open.
 * Handles mouse wheel, touch, and keyboard arrow/space/pageup/pagedown events.
 *
 * Returns a release function.
 *
 * @param {Element | string} element
 * @param {{ allowKeys?: boolean }} options
 * @returns {() => void}  release function
 *
 * @example
 * const release = scrollTrap(document.querySelector('.modal'))
 * // …later, when modal closes:
 * release()
 */
function scrollTrap(element, options = {}) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!(el instanceof Element)) {
        console.warn('[scroll-snap-kit] scrollTrap: element not found');
        return () => { };
    }

    const { allowKeys = true } = options;

    const canScrollUp = () => el.scrollTop > 0;
    const canScrollDown = () => el.scrollTop < el.scrollHeight - el.clientHeight;

    // Wheel handler — block wheel events that would escape the element
    const onWheel = (e) => {
        const goingDown = e.deltaY > 0;
        if (goingDown && !canScrollDown()) { e.preventDefault(); return; }
        if (!goingDown && !canScrollUp()) { e.preventDefault(); return; }
    };

    // Touch handler
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
        const dy = touchStartY - e.touches[0].clientY;
        if (dy > 0 && !canScrollDown()) { e.preventDefault(); return; }
        if (dy < 0 && !canScrollUp()) { e.preventDefault(); return; }
    };

    // Key handler
    const SCROLL_KEYS = { ArrowUp: -40, ArrowDown: 40, PageUp: -300, PageDown: 300, ' ': 300 };
    const onKeyDown = (e) => {
        const delta = SCROLL_KEYS[e.key];
        if (!delta) return;
        if (!el.contains(document.activeElement) && document.activeElement !== el) return;
        e.preventDefault();
        el.scrollTop += delta;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    if (allowKeys) document.addEventListener('keydown', onKeyDown);

    // Also lock the body
    lockScroll();

    return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        if (allowKeys) document.removeEventListener('keydown', onKeyDown);
        unlockScroll();
    };
}

/**
 * scroll-snap-kit — React Hooks
 * Requires React 16.8+
 */

/**
 * Returns the current scroll position, updated on scroll.
 * @param {{ throttle?: number, container?: Element }} options
 * @returns {{ x: number, y: number, percentX: number, percentY: number }}
 */
function useScrollPosition(options = {}) {
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
function useInViewport(options = {}) {
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
function useScrollTo() {
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
function useScrolledPast(threshold = 100, options = {}) {
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
function useScrollDirection(options = {}) {
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

module.exports = {
  scrollTo,
  scrollToTop,
  scrollToBottom,
  getScrollPosition,
  onScroll,
  isInViewport,
  lockScroll,
  unlockScroll,
  scrollSpy,
  onScrollEnd,
  scrollIntoViewIfNeeded,
  Easings,
  easeScroll,
  scrollSequence,
  parallax,
  scrollProgress,
  snapToSection,
  scrollReveal,
  scrollTimeline,
  infiniteScroll,
  scrollTrap,
  useScrollPosition,
  useInViewport,
  useScrollTo,
  useScrolledPast,
  useScrollDirection,
};
