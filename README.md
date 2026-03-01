# scroll-snap-kit 🎯

> Smooth scroll utilities + React hooks for modern web apps.

Zero dependencies. Tree-shakeable. Works with or without React.

[![npm version](https://img.shields.io/npm/v/scroll-snap-kit)](https://www.npmjs.com/package/scroll-snap-kit)
[![license](https://img.shields.io/npm/l/scroll-snap-kit)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/scroll-snap-kit)](https://bundlephobia.com/package/scroll-snap-kit)

---

## Install

```bash
npm install scroll-snap-kit
```

---

## What's included

| Utility | Description |
|---------|-------------|
| `scrollTo` | Smooth scroll to an element or pixel value |
| `scrollToTop` / `scrollToBottom` | Page-level scroll helpers |
| `getScrollPosition` | Current scroll x/y + percentages |
| `onScroll` | Throttled scroll listener with cleanup |
| `isInViewport` | Check if an element is visible |
| `lockScroll` / `unlockScroll` | Freeze body scroll, restore position |
| `scrollSpy` | Highlight nav links based on active section |
| `onScrollEnd` | Fire a callback when scrolling stops |
| `scrollIntoViewIfNeeded` | Only scroll if element is off-screen |
| `easeScroll` + `Easings` | Custom easing curves for scroll animation |

| Hook | Description |
|------|-------------|
| `useScrollPosition` | Live scroll position + percentage |
| `useInViewport` | Whether a ref'd element is visible |
| `useScrollTo` | Scroll function scoped to a container ref |
| `useScrolledPast` | Boolean — has user scrolled past a threshold |
| `useScrollDirection` | `'up'` \| `'down'` \| `null` |

---

## Vanilla JS Utilities

```js
import {
  scrollTo, scrollToTop, scrollToBottom,
  getScrollPosition, onScroll, isInViewport,
  lockScroll, unlockScroll,
  scrollSpy, onScrollEnd, scrollIntoViewIfNeeded,
  easeScroll, Easings
} from 'scroll-snap-kit';
```

---

### `scrollTo(target, options?)`

Smoothly scroll to a DOM element or a Y pixel value.

```js
scrollTo(document.querySelector('#section'));
scrollTo(500);                                               // scroll to y=500px
scrollTo(document.querySelector('#hero'), { offset: -80 }); // offset for sticky headers
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `behavior` | `'smooth' \| 'instant'` | `'smooth'` | Scroll behavior |
| `block` | `ScrollLogicalPosition` | `'start'` | Vertical alignment |
| `offset` | `number` | `0` | Pixel offset (e.g. `-80` for a sticky nav) |

---

### `scrollToTop(options?)` / `scrollToBottom(options?)`

```js
scrollToTop();
scrollToBottom({ behavior: 'instant' });
```

---

### `getScrollPosition(container?)`

Returns the current scroll position and scroll percentage for the page or any scrollable container.

```js
const { x, y, percentX, percentY } = getScrollPosition();
// percentY → how far down the page (0–100)

// Works on containers too
const pos = getScrollPosition(document.querySelector('.sidebar'));
```

---

### `onScroll(callback, options?)`

Throttled scroll listener. Returns a cleanup function to stop listening.

```js
const stop = onScroll(({ x, y, percentX, percentY }) => {
  console.log(`Scrolled ${percentY}% down`);
}, { throttle: 100 });

stop(); // removes the listener
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `throttle` | `number` | `100` | Minimum ms between callbacks |
| `container` | `Element` | `window` | Scrollable container to listen on |

---

### `isInViewport(element, options?)`

Check whether an element is currently visible in the viewport.

```js
if (isInViewport(document.querySelector('.card'), { threshold: 0.5 })) {
  // At least 50% of the card is visible
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0` | 0–1 portion of element that must be visible |

---

### `lockScroll()` / `unlockScroll()`

Lock page scroll (e.g. when a modal is open) and restore the exact position on unlock — no layout jump.

```js
lockScroll();   // body stops scrolling, position saved
unlockScroll(); // position restored precisely
```

---

### `scrollSpy(sectionsSelector, linksSelector, options?)`

Watches scroll position and automatically adds an active class to the nav link matching the current section. Returns a cleanup function.

```js
const stop = scrollSpy(
  'section[id]',           // sections to spy on
  'nav a',                 // nav links to highlight
  {
    offset: 80,                        // px from top to trigger (default: 0)
    activeClass: 'scroll-spy-active'   // class to toggle (default: 'scroll-spy-active')
  }
);

stop(); // remove the listener
```

```css
/* Style the active link however you like */
nav a.scroll-spy-active {
  color: #00ffaa;
  border-bottom: 1px solid currentColor;
}
```

> Links are matched by comparing their `href` to `#sectionId`. Call `scrollSpy` multiple times to target different link groups simultaneously.

---

### `onScrollEnd(callback, options?)`

Fires a callback once the user has stopped scrolling for a configurable delay. Great for lazy-loading, analytics, or autosave.

```js
const stop = onScrollEnd(() => {
  console.log('User stopped scrolling!');
  saveScrollPosition();
}, { delay: 200 });

stop(); // cleanup
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | `number` | `150` | ms of idle scrolling before callback fires |
| `container` | `Element` | `window` | Scrollable container to watch |

---

### `scrollIntoViewIfNeeded(element, options?)`

Scrolls to an element only if it is partially or fully outside the visible viewport. If it's already visible enough, nothing happens — no unnecessary scroll.

```js
// Only scrolls if the element is off-screen
scrollIntoViewIfNeeded(document.querySelector('.card'));

// threshold: how much must be visible before we skip scrolling
scrollIntoViewIfNeeded(element, { threshold: 0.5, offset: -80 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `1` | 0–1 visibility ratio required to skip scrolling |
| `offset` | `number` | `0` | Pixel offset applied when scrolling |
| `behavior` | `'smooth' \| 'instant'` | `'smooth'` | Scroll behavior |

---

### `easeScroll(target, options?)` + `Easings`

Scroll to a position with a fully custom easing curve, bypassing the browser's native smooth scroll. Returns a `Promise` that resolves when the animation completes.

```js
// Use a built-in easing
await easeScroll('#contact', {
  duration: 800,
  easing: Easings.easeOutElastic
});

// Chain animations
await easeScroll('#hero',     { duration: 600, easing: Easings.easeInOutCubic });
await easeScroll('#features', { duration: 400, easing: Easings.easeOutQuart });

// BYO easing function — any (t: 0→1) => (0→1)
easeScroll(element, { easing: t => t * t * t });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `600` | Animation duration in ms |
| `easing` | `(t: number) => number` | `Easings.easeInOutCubic` | Easing function |
| `offset` | `number` | `0` | Pixel offset applied to target position |

**Built-in easings:**

```js
import { Easings } from 'scroll-snap-kit';

Easings.linear
Easings.easeInQuad
Easings.easeOutQuad
Easings.easeInOutQuad
Easings.easeInCubic
Easings.easeOutCubic
Easings.easeInOutCubic   // ← default
Easings.easeInQuart
Easings.easeOutQuart
Easings.easeOutElastic   // springy overshoot
Easings.easeOutBounce    // bouncy landing
```

---

## React Hooks

```js
import {
  useScrollPosition,
  useInViewport,
  useScrollTo,
  useScrolledPast,
  useScrollDirection
} from 'scroll-snap-kit/hooks';
```

> Requires React 16.8+. React is a peer dependency — install it separately.

---

### `useScrollPosition(options?)`

Returns the current scroll position, updated live on scroll.

```jsx
function ProgressBar() {
  const { x, y, percentX, percentY } = useScrollPosition({ throttle: 50 });
  return <div style={{ width: `${percentY}%` }} className="progress-bar" />;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `throttle` | `number` | `100` | ms between updates |
| `container` | `Element` | `window` | Scrollable container |

---

### `useInViewport(options?)`

Returns a `[ref, inView]` tuple. Attach `ref` to any element to track its viewport visibility using `IntersectionObserver`.

```jsx
function FadeInCard() {
  const [ref, inView] = useInViewport({ threshold: 0.2, once: true });

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease'
      }}
    >
      I animate in when visible!
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0` | 0–1 portion of element visible to trigger |
| `once` | `boolean` | `false` | Only trigger on first entry, then stop observing |

---

### `useScrollTo()`

Returns a `[containerRef, scrollToTarget]` tuple. Scope smooth scrolling to a specific scrollable container, or fall back to window scroll.

```jsx
function Sidebar() {
  const [containerRef, scrollToTarget] = useScrollTo();
  const sectionRef = useRef(null);

  return (
    <div ref={containerRef} style={{ overflowY: 'scroll', height: '400px' }}>
      <button onClick={() => scrollToTarget(sectionRef.current, { offset: -16 })}>
        Jump to section
      </button>
      <div style={{ height: 300 }} />
      <div ref={sectionRef}>Target section</div>
    </div>
  );
}
```

---

### `useScrolledPast(threshold?, options?)`

Returns `true` once the user has scrolled past a given pixel value. Useful for showing back-to-top buttons, sticky CTAs, and similar patterns.

```jsx
function BackToTopButton() {
  const scrolledPast = useScrolledPast(300);
  return scrolledPast ? (
    <button onClick={() => scrollToTop()}>↑ Back to top</button>
  ) : null;
}
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `threshold` | `number` | `100` | Y pixel value to check against |
| `options.container` | `Element` | `window` | Scrollable container |

---

### `useScrollDirection()`

Returns the current scroll direction: `'up'`, `'down'`, or `null` on initial render.

```jsx
function HideOnScrollNav() {
  const direction = useScrollDirection();

  return (
    <nav style={{
      transform: direction === 'down' ? 'translateY(-100%)' : 'translateY(0)',
      transition: 'transform 0.3s ease'
    }}>
      My Navbar
    </nav>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `throttle` | `number` | `100` | ms between direction checks |

---

## Tree-shaking

All exports are named and side-effect free — you only ship what you import:

```js
// Only pulls in ~400 bytes
import { scrollToTop } from 'scroll-snap-kit';

// Import utils and hooks separately for maximum tree-shaking
import { onScroll, scrollSpy } from 'scroll-snap-kit/utils';
import { useScrollPosition } from 'scroll-snap-kit/hooks';
```

---

## Browser support

All modern browsers (Chrome, Firefox, Safari, Edge). `easeScroll` uses `requestAnimationFrame`. `useInViewport` and `isInViewport` use `IntersectionObserver` — supported everywhere modern; polyfill if you need IE11.

---

## Changelog

### v1.1.0
- ✨ `scrollSpy()` — highlight nav links by active section
- ✨ `onScrollEnd()` — callback when scrolling stops
- ✨ `scrollIntoViewIfNeeded()` — scroll only when off-screen
- ✨ `easeScroll()` + `Easings` — custom easing engine with 11 built-in curves

### v1.0.0
- 🎉 Initial release — 8 core utilities and 5 React hooks

---

## License

MIT © Fabian Faraz Farid