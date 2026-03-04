// scroll-snap-kit — TypeScript declarations
// v2.0.0

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────

export type ScrollBehaviorOption = 'smooth' | 'instant' | 'auto';
export type ScrollAxis = 'x' | 'y' | 'both';
export type RevealEffect =
    | 'fade'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right'
    | 'scale'
    | 'fade-scale';

export interface ScrollPosition {
    x: number;
    y: number;
    percentX: number;
    percentY: number;
}

export type CleanupFn = () => void;

// ─────────────────────────────────────────────
// Core utilities (v1.0)
// ─────────────────────────────────────────────

export interface ScrollToOptions {
    behavior?: ScrollBehaviorOption;
    block?: ScrollLogicalPosition;
    offset?: number;
}

/** Smoothly scroll to a DOM element or a Y pixel value. */
export function scrollTo(target: Element | number, options?: ScrollToOptions): void;

/** Scroll to the top of the page. */
export function scrollToTop(options?: Pick<ScrollToOptions, 'behavior'>): void;

/** Scroll to the bottom of the page. */
export function scrollToBottom(options?: Pick<ScrollToOptions, 'behavior'>): void;

/** Returns current scroll position and percentage for the page or a container. */
export function getScrollPosition(container?: Element): ScrollPosition;

export interface OnScrollOptions {
    throttle?: number;
    container?: Element;
}

/** Throttled scroll listener. Returns a cleanup function. */
export function onScroll(
    callback: (position: ScrollPosition) => void,
    options?: OnScrollOptions
): CleanupFn;

export interface InViewportOptions {
    threshold?: number;
}

/** Check whether an element is currently visible in the viewport. */
export function isInViewport(element: Element, options?: InViewportOptions): boolean;

/** Lock the page scroll (e.g. when a modal is open). */
export function lockScroll(): void;

/** Unlock the page scroll and restore the saved position. */
export function unlockScroll(): void;

// ─────────────────────────────────────────────
// v1.1 utilities
// ─────────────────────────────────────────────

export interface ScrollSpyOptions {
    offset?: number;
    activeClass?: string;
}

/** Watch scroll and highlight nav links matching the current section. */
export function scrollSpy(
    sectionsSelector: string,
    linksSelector: string,
    options?: ScrollSpyOptions
): CleanupFn;

export interface OnScrollEndOptions {
    delay?: number;
    container?: Element;
}

/** Fire a callback once the user has stopped scrolling. */
export function onScrollEnd(
    callback: (position: ScrollPosition) => void,
    options?: OnScrollEndOptions
): CleanupFn;

export interface ScrollIfNeededOptions {
    threshold?: number;
    offset?: number;
    behavior?: ScrollBehaviorOption;
}

/** Scroll to an element only if it is outside the viewport. */
export function scrollIntoViewIfNeeded(element: Element, options?: ScrollIfNeededOptions): void;

// Easings
export type EasingFn = (t: number) => number;

export interface EasingsMap {
    linear: EasingFn;
    easeInQuad: EasingFn;
    easeOutQuad: EasingFn;
    easeInOutQuad: EasingFn;
    easeInCubic: EasingFn;
    easeOutCubic: EasingFn;
    easeInOutCubic: EasingFn;
    easeInQuart: EasingFn;
    easeOutQuart: EasingFn;
    easeOutElastic: EasingFn;
    easeOutBounce: EasingFn;
}

/** Built-in easing functions for use with easeScroll. */
export declare const Easings: EasingsMap;

export interface EaseScrollOptions {
    duration?: number;
    easing?: EasingFn;
    offset?: number;
}

/** Scroll with a custom easing curve. Returns a Promise that resolves on completion. */
export function easeScroll(
    target: Element | string | number,
    options?: EaseScrollOptions
): Promise<void>;

// ─────────────────────────────────────────────
// v1.2 utilities
// ─────────────────────────────────────────────

export interface SequenceStep extends EaseScrollOptions {
    target: Element | string | number;
    pause?: number;
}

export interface ScrollSequenceResult {
    promise: Promise<void>;
    cancel: () => void;
}

/** Chain multiple easeScroll animations sequentially. */
export function scrollSequence(steps: SequenceStep[]): ScrollSequenceResult;

export interface ParallaxOptions {
    speed?: number;
    axis?: ScrollAxis;
    container?: Element;
}

/** Attach a parallax scroll speed to one or more elements. */
export function parallax(
    targets: string | Element | NodeList | Element[],
    options?: ParallaxOptions
): CleanupFn;

export interface ScrollProgressOptions {
    offset?: number;
}

/** Track how far (0–1) the user has scrolled through a specific element. */
export function scrollProgress(
    element: Element | string,
    callback: (progress: number) => void,
    options?: ScrollProgressOptions
): CleanupFn;

export interface SnapToSectionOptions extends EaseScrollOptions {
    delay?: number;
}

/** Auto-snap to the nearest section after scrolling stops. */
export function snapToSection(
    sections: string | Element[],
    options?: SnapToSectionOptions
): CleanupFn;

// ─────────────────────────────────────────────
// v2.0 utilities
// ─────────────────────────────────────────────

export interface ScrollRevealOptions {
    effect?: RevealEffect;
    duration?: number;
    delay?: number;
    easing?: string;
    threshold?: number;
    once?: boolean;
    distance?: string;
}

/** Animate elements in as they scroll into view. */
export function scrollReveal(
    targets: string | Element | Element[],
    options?: ScrollRevealOptions
): CleanupFn;

export interface TimelineTrack {
    property: string;
    from: number;
    to: number;
    unit?: string;
    scrollStart?: number;
    scrollEnd?: number;
    target?: Element | string;
}

/** Drive CSS custom properties from scroll position. */
export function scrollTimeline(tracks: TimelineTrack[]): CleanupFn;

export interface InfiniteScrollOptions {
    threshold?: number;
    cooldown?: number;
    container?: Element;
}

/** Fire a callback when the user scrolls near the bottom. */
export function infiniteScroll(
    callback: () => void | Promise<void>,
    options?: InfiniteScrollOptions
): CleanupFn;

export interface ScrollTrapOptions {
    allowKeys?: boolean;
}

/** Contain scroll within an element, preventing background page scroll. */
export function scrollTrap(
    element: Element | string,
    options?: ScrollTrapOptions
): CleanupFn;

// ─────────────────────────────────────────────
// React Hooks
// ─────────────────────────────────────────────

import { RefObject } from 'react';

export interface UseScrollPositionOptions {
    throttle?: number;
    container?: Element;
}

/** Returns live scroll position and percentage, updated on scroll. */
export function useScrollPosition(options?: UseScrollPositionOptions): ScrollPosition;

export interface UseInViewportOptions {
    threshold?: number;
    once?: boolean;
}

/** Returns [ref, inView] — tracks viewport visibility via IntersectionObserver. */
export function useInViewport<T extends Element = Element>(
    options?: UseInViewportOptions
): [RefObject<T>, boolean];

/** Returns [containerRef, scrollToFn] — scoped smooth scroll for a container. */
export function useScrollTo<T extends Element = Element>(): [
    RefObject<T>,
    (target: Element | number, options?: ScrollToOptions) => void
];

/** Returns true once the user has scrolled past the given Y threshold. */
export function useScrolledPast(threshold?: number, options?: { container?: Element }): boolean;

/** Returns current scroll direction: 'up' | 'down' | null. */
export function useScrollDirection(options?: { throttle?: number }): 'up' | 'down' | null;