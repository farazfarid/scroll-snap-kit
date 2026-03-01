# scroll-snap-kit 🎯

> Smooth scroll utilities + React hooks for modern web apps.

Zero dependencies. Tree-shakeable. Works with or without React.

---

## Install

```bash
npm install scroll-snap-kit
```

---

## Vanilla JS Utilities

```js
import { scrollTo, scrollToTop, scrollToBottom, getScrollPosition, onScroll, isInViewport, lockScroll, unlockScroll } from 'scroll-snap-kit/utils';
```

### `scrollTo(target, options?)`

Smoothly scroll to a DOM element or a Y pixel value.

```js
scrollTo(document.querySelector('#section'));
scrollTo(500);                                          // scroll to y=500px
scrollTo(document.querySelector('#hero'), { offset: -80 }); // with offset (e.g. sticky header)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `behavior` | `'smooth' \| 'instant'` | `'smooth'` | Scroll behavior |
| `block` | `ScrollLogicalPosition` | `'start'` | Vertical alignment |
| `offset` | `number` | `0` | Pixel offset adjustment |

---

### `scrollToTop(options?)` / `scrollToBottom(options?)`

```js
scrollToTop();
scrollToBottom({ behavior: 'instant' });
```

---

### `getScrollPosition(container?)`

```js
const { x, y, percentX, percentY } = getScrollPosition();
// percentY = how far down the page (0–100)
```

---

### `onScroll(callback, options?)`

Throttled scroll listener. Returns a cleanup function.

```js
const stop = onScroll(({ y, percentY }) => {
  console.log(`Scrolled ${percentY}% down`);
}, { throttle: 150 });

// Later:
stop(); // removes the listener
```

---

### `isInViewport(element, options?)`

```js
if (isInViewport(document.querySelector('.card'), { threshold: 0.5 })) {
  // At least 50% of the card is visible
}
```

---

### `lockScroll()` / `unlockScroll()`

Lock page scroll (e.g. when a modal is open) and restore position on unlock.

```js
lockScroll();   // body stops scrolling
unlockScroll(); // restored to previous position
```

---

## React Hooks

```js
import { useScrollPosition, useInViewport, useScrollTo, useScrolledPast, useScrollDirection } from 'scroll-snap-kit/hooks';
```

### `useScrollPosition(options?)`

```jsx
function ProgressBar() {
  const { percentY } = useScrollPosition({ throttle: 50 });
  return <div style={{ width: `${percentY}%` }} className="progress" />;
}
```

---

### `useInViewport(options?)`

```jsx
function FadeIn() {
  const [ref, inView] = useInViewport({ threshold: 0.2, once: true });
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.5s' }}>
      I fade in when visible!
    </div>
  );
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `threshold` | `number` | `0` | 0–1 portion of element visible to trigger |
| `once` | `boolean` | `false` | Only trigger the first time |

---

### `useScrollTo()`

```jsx
function Page() {
  const [containerRef, scrollToTarget] = useScrollTo();
  const sectionRef = useRef(null);

  return (
    <div ref={containerRef} style={{ overflowY: 'scroll', height: '400px' }}>
      <button onClick={() => scrollToTarget(sectionRef.current)}>Jump to section</button>
      <div style={{ height: 300 }} />
      <div ref={sectionRef}>Target section</div>
    </div>
  );
}
```

---

### `useScrolledPast(threshold?, options?)`

```jsx
function BackToTopButton() {
  const scrolledPast = useScrolledPast(300);
  return scrolledPast ? <button onClick={scrollToTop}>↑ Top</button> : null;
}
```

---

### `useScrollDirection()`

```jsx
function Navbar() {
  const direction = useScrollDirection();
  return (
    <nav style={{ transform: direction === 'down' ? 'translateY(-100%)' : 'translateY(0)' }}>
      My Navbar
    </nav>
  );
}
```

Returns `'up'`, `'down'`, or `null` (on initial render).

---

## License

MIT
