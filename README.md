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
| `scrollSequence` | Chain multiple scroll animations in order |
| `parallax` | Attach parallax speed multipliers to elements |
| `scrollProgress` | Track how far through an element the user has scrolled |
| `snapToSection` | Auto-snap to the nearest section after scrolling stops |

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
  easeScroll, Easings,
  scrollSequence, parallax, scrollProgress, snapToSection
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

const pos = getScrollPosition(document.querySelector('.sidebar'));
```

---

### `onScroll(callback, options?)`

Throttled scroll listener. Returns a cleanup function.

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

```js
lockScroll();   // body stops scrolling, position saved
unlockScroll(); // position restored precisely — no layout jump
```

---

### `scrollSpy(sectionsSelector, linksSelector, options?)`

Watches scroll position and automatically adds an active class to the nav link matching the current section.

```js
const stop = scrollSpy(
  'section[id]',
  'nav a',
  { offset: 80, activeClass: 'scroll-spy-active' }
);

stop(); // remove listener
```

```css
nav a.scroll-spy-active {
  color: #00ffaa;
  border-bottom: 1px solid currentColor;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `offset` | `number` | `0` | px from top to trigger section change |
| `activeClass` | `string` | `'scroll-spy-active'` | Class added to the active link |

---

### `onScrollEnd(callback, options?)`

Fires once the user has stopped scrolling for a configurable delay.

```js
const stop = onScrollEnd(() => {
  console.log('User stopped scrolling!');
  saveScrollPosition();
}, { delay: 200 });

stop();
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | `number` | `150` | ms of idle scrolling before callback fires |
| `container` | `Element` | `window` | Scrollable container to watch |

---

### `scrollIntoViewIfNeeded(element, options?)`

Scrolls to an element only if it is outside the visible viewport. If it's already visible enough, nothing happens.

```js
scrollIntoViewIfNeeded(document.querySelector('.card'));
scrollIntoViewIfNeeded(element, { threshold: 0.5, offset: -80 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `1` | 0–1 visibility ratio required to skip scrolling |
| `offset` | `number` | `0` | Pixel offset applied when scrolling |
| `behavior` | `'smooth' \| 'instant'` | `'smooth'` | Scroll behavior |

---

### `easeScroll(target, options?)` + `Easings`

Scroll to a position with a fully custom easing curve. Returns a `Promise` that resolves when animation completes.

```js
await easeScroll('#contact', { duration: 800, easing: Easings.easeOutElastic });

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
| `offset` | `number` | `0` | Pixel offset applied to target |

**Built-in easings:** `linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeOutElastic`, `easeOutBounce`

---

### `scrollSequence(steps)`

Run multiple `easeScroll` animations one after another as a choreographed sequence. Supports pauses between steps. Returns `{ promise, cancel }`.

```js
const { promise, cancel } = scrollSequence([
  { target: '#intro',    duration: 600 },
  { target: '#features', duration: 800, pause: 400 },  // pause 400ms before next step
  { target: '#pricing',  duration: 600, easing: Easings.easeOutElastic },
]);

await promise;       // resolves when all steps complete
cancel();            // abort at any point mid-sequence
```

| Step option | Type | Default | Description |
|-------------|------|---------|-------------|
| `target` | `Element \| string \| number` | — | Scroll destination (required) |
| `duration` | `number` | `600` | Duration of this step in ms |
| `easing` | `Function` | `easeInOutCubic` | Easing for this step |
| `offset` | `number` | `0` | Pixel offset |
| `pause` | `number` | `0` | ms to wait after this step before the next |

---

### `parallax(targets, options?)`

Attach a parallax scroll effect to one or more elements. Each element moves relative to its original position at the given `speed` multiplier.

```js
// speed < 1 = moves slower than scroll (background feel)
// speed > 1 = moves faster than scroll (foreground feel)
// speed < 0 = moves in the opposite direction to scroll

const destroy = parallax('.hero-bg', { speed: 0.4 });
const destroy = parallax('.clouds',  { speed: -0.2, axis: 'x' });
const destroy = parallax([el1, el2], { speed: 0.6, axis: 'both' });

destroy(); // removes the effect and resets all transforms
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | `number` | `0.5` | Movement multiplier |
| `axis` | `'y' \| 'x' \| 'both'` | `'y'` | Axis to apply parallax on |
| `container` | `Element` | `window` | Scrollable container |

---

### `scrollProgress(element, callback, options?)`

Track how far the user has scrolled through a specific element, independent of overall page progress.

- `0` = element top just entered the bottom of the viewport
- `1` = element bottom just exited the top of the viewport

```js
const stop = scrollProgress('#article', (progress) => {
  progressBar.style.width = `${progress * 100}%`;
  if (progress === 1) console.log('Article fully read!');
});

stop(); // cleanup
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `offset` | `number` | `0` | Pixel adjustment to progress calculation |

---

### `snapToSection(sections, options?)`

After the user stops scrolling, automatically snap to the nearest section. Returns a destroy function.

```js
const destroy = snapToSection('section[id]', {
  delay: 150,                        // ms to wait after scroll stops (default: 150)
  offset: -70,                       // account for sticky nav (default: 0)
  duration: 500,                     // snap animation duration (default: 500)
  easing: Easings.easeInOutCubic     // snap animation easing
});

destroy(); // remove snap behaviour
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delay` | `number` | `150` | ms after scrolling stops before snap fires |
| `offset` | `number` | `0` | Pixel offset applied to snap target |
| `duration` | `number` | `500` | Snap animation duration in ms |
| `easing` | `Function` | `Easings.easeInOutCubic` | Snap animation easing |

> Works on both window scroll and scrollable containers. Pass an array of elements instead of a selector for more control.

---

## React Hooks

```js
import {
  useScrollPosition, useInViewport, useScrollTo,
  useScrolledPast, useScrollDirection
} from 'scroll-snap-kit/hooks';
```

> Requires React 16.8+. React is a peer dependency — install it separately.

---

### `useScrollPosition(options?)`

```jsx
function ProgressBar() {
  const { percentY } = useScrollPosition({ throttle: 50 });
  return <div style={{ width: `${percentY}%` }} className="progress-bar" />;
}
```

### `useInViewport(options?)`

```jsx
function FadeInCard() {
  const [ref, inView] = useInViewport({ threshold: 0.2, once: true });
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.5s' }}>
      Fades in when visible!
    </div>
  );
}
```

### `useScrollTo()`

```jsx
function Page() {
  const [containerRef, scrollToTarget] = useScrollTo();
  const sectionRef = useRef(null);
  return (
    <div ref={containerRef} style={{ overflowY: 'scroll', height: '400px' }}>
      <button onClick={() => scrollToTarget(sectionRef.current)}>Jump</button>
      <div ref={sectionRef}>Target</div>
    </div>
  );
}
```

### `useScrolledPast(threshold?)`

```jsx
function BackToTopButton() {
  const scrolledPast = useScrolledPast(300);
  return scrolledPast ? <button onClick={scrollToTop}>↑ Top</button> : null;
}
```

### `useScrollDirection()`

```jsx
function HideOnScrollNav() {
  const direction = useScrollDirection();
  return (
    <nav style={{ transform: direction === 'down' ? 'translateY(-100%)' : 'translateY(0)' }}>
      My Navbar
    </nav>
  );
}
```

---

## Tree-shaking

All exports are named and side-effect free:

```js
import { scrollToTop } from 'scroll-snap-kit';             // ~400 bytes
import { onScroll, scrollSpy } from 'scroll-snap-kit/utils';
import { useScrollPosition } from 'scroll-snap-kit/hooks';
```

---

## Browser support

All modern browsers. `easeScroll` and `scrollSequence` use `requestAnimationFrame`. `useInViewport` / `isInViewport` use `IntersectionObserver` — polyfill if you need IE11.

---

## Changelog

### v1.2.0
- ✨ `scrollSequence()` — chain multiple scroll animations with pauses and cancel support
- ✨ `parallax()` — multi-element parallax with configurable speed, axis, and cleanup
- ✨ `scrollProgress()` — per-element scroll progress tracking (0→1)
- ✨ `snapToSection()` — auto-snap to nearest section after scrolling stops

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