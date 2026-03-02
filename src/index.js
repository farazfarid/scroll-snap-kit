// scroll-snap-kit
// Smooth scroll utilities + React hooks
// https://github.com/farazfarid/scroll-snap-kit

export {
    scrollTo,
    scrollToTop,
    scrollToBottom,
    getScrollPosition,
    onScroll,
    isInViewport,
    lockScroll,
    unlockScroll,
    // New in v1.1
    scrollSpy,
    onScrollEnd,
    scrollIntoViewIfNeeded,
    easeScroll,
    Easings,
    // v1.2
    scrollSequence,
    parallax,
    scrollProgress,
    snapToSection,
} from './utils.js';

export {
    useScrollPosition,
    useInViewport,
    useScrollTo,
    useScrolledPast,
    useScrollDirection,
} from './hooks.js';