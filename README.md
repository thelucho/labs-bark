# Hero Frame Sequence — BARK™

A frontend demo for the **LABS** section of [thelucho.dev](https://www.thelucho.dev).

This project is part of a series of small, self-contained experiments I build to explore interaction, motion, and visual techniques before taking them into client or product work. Each demo isolates one idea. Here, that idea is the **Hero**.

---

## What this demo explores

The Hero plays a **pointer-driven frame sequence**.

A 101-frame JPEG sequence of a dog looking from left to right is preloaded and painted onto a `<canvas>`. Horizontal pointer position maps to a frame in that sequence: left of the viewport looks left, the center looks straight ahead, the right looks right.

GSAP’s ticker interpolates toward the target frame with easing and a speed cap, so the sequence always plays through neighboring frames instead of jumping. The effect respects `prefers-reduced-motion`.

The rest of the page is a fictional pet brand (BARK™) that gives the Hero a real layout to live in.

---

## Stack

| Piece | Role |
| --- | --- |
| [Astro](https://astro.build) | Pages, components, and the build |
| TypeScript | Hero, scroll, and motion scripts |
| Canvas 2D | Painting the frame sequence |
| [GSAP](https://gsap.com) | Ticker, easing, ScrollTrigger, intro and reveals |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scrolling |
| Plus Jakarta Sans + Instrument Serif | Type, loaded via Astro Fonts / Google |

---

## Run it locally

Node `>= 22.12.0` is required.

```sh
npm install
npm run dev
```

The site starts at `http://localhost:4321`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Serve the production build locally |

---

## More from LABS

This is one demo in an ongoing series. The rest live on [thelucho.dev](https://www.thelucho.dev).
