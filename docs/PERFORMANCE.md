# Performance and motion policy

The default **Auto** chooses Balanced/Economical depending on viewport, device hints and reduced-motion preference. The footer offers **Auto**, **Smooth** (Economical), and **Full** (Cinematic); OS reduced-motion preference overrides intense effects.

## Optimizations in V15

- Cached scroll-linked properties and geometry; avoid unnecessary repeated per-frame writes.
- Offscreen particle/marquee rendering is paused.
- WebP portrait tiers (mobile/tablet/desktop) and SVG project graphics.
- Large animated drop shadows/blur filters reduced to limit repaint/rasterization cost.
- Shared CSS/JS files designed for HTTP caching.

## What has NOT been certified

The V15 QA report records a brief **synthetic headless Chromium** Auto sample near 16.7 ms median; Full was closer to 33 ms for desktop. The benchmark was run with GPU disabled and in-memory content. It is **not real hardware FPS** and does not establish that the website is lag-free on all devices.

## Testing plan

1. Open the deployed HTTP site, not only an in-memory test document.
2. Record performance traces on current Chrome/Edge desktop and real iPhone Safari / Android Chrome; include rapid scrolling and device orientation changes.
3. Measure real LCP, INP and CLS as well as dropped animation frames and JavaScript long tasks.
4. Compare Auto, Smooth and Full; lower particle/blur cost further when a trace shows slow frames.
5. Validate font loading and interaction behavior on Firefox and Safari.

**Rule:** Prioritize usable motion and readable content over maximal effects when a device cannot maintain smoothness.
