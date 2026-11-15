# VORTEX — Cinematic Portfolio Theme

A video-reference-inspired, responsive **dark/light portfolio template** with cinematic scroll effects, modular static assets, and an optional Netlify contact function. The current sample portfolio displays **Gaurav Sharma** content; **VORTEX** is the theme/repository name, not the portfolio owner's identity.

> **Release:** V16 staging candidate (15 November 2026). This reconstruction is not certified identical to the reference video. The portrait is AI-generated artwork, sample projects are illustrative, and email delivery is **disabled until configured**. See [Release status](docs/RELEASE_STATUS.md).

## Live staging preview

[View the V16 staging preview](https://hushed-bolt-u7nq8pb.shipstatic.com) — static demonstration; the Netlify contact function is not running there.

## Quick start

No bundler or database is required for the portfolio UI.

```bash
# Python 3 installed
python3 -m http.server 8000
# visit http://localhost:8000
```

Alternatively, use any static HTTP server. Do not open `index.html` through `file://` if browser storage or asset loading needs to behave as it will on hosting.

## Features

- Original video-inspired dark/red and light/warm-white appearance, with saved theme selection.
- Responsive layouts for desktop, tablet, and mobile, with accessible focus and reduced-motion support.
- Intro animation, scroll-linked hero and section transitions, cursor effects, project dialogs, timeline, technology stack and contact particle orbit.
- Adaptive motion levels **Auto / Smooth / Full** and a lighter mobile profile. Full may be heavier on some devices.
- High-density responsive WebP portrait *reconstruction* and vector project illustrations.
- Contact form **preview/copy** workflow by default; Netlify + Resend server function included for later activation with authorized details.

## Project structure

```text
index.html                    Main page and semantic content
site.css                      Theme, layout, responsive and motion styles
site.js                       UI, animations, dialogs and motion management
site-config.js                Public nonsecret settings (contact disabled)
assets/                       Responsive WebP portrait and SVG illustrations
netlify/functions/contact.mjs Optional email handler (requires secrets)
netlify.toml                  Netlify routes and response headers
scripts/                      Static integrity checks
.github/workflows/ci.yml      GitHub Actions smoke and contact unit checks
docs/                         Architecture, deployment, QA and history
previews/                     Desktop/mobile light/dark visual snapshots
```

## Tests

```bash
node --check site.js
node --check netlify/functions/contact.mjs
node test_contact.mjs
python3 scripts/check_static.py
```

The Playwright-based `test_v15.py`, `test_delivery_ui.py`, and `quick_perf.py` are optional local checks that require Python `playwright`, Chromium and a suitable environment. The tests are synthetic and **not** proof of lag-free real-device scrolling. See [QA report](docs/releases/QA_REPORT_V15.md).

## Contact and deployment

See [Deployment & email](docs/DEPLOYMENT.md). **Do not** commit API keys, real `.env` files or unverified contact addresses. `site-config.js` intentionally has empty `contactEndpoint`/`contactEmail` values. Enabling email delivery requires a verified recipient and domain, server-side secrets, bot/abuse protection, and a delivery test.

## Personalization

The portfolio content, visible name, and sample projects are placeholders from the design recreation; update `index.html`, `site.js` and `assets/` before using it for another individual or business. The original reference photograph, fonts and animation source are not provided. Do not represent the AI portrait or illustrative project graphics as the original assets.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment and contact service](docs/DEPLOYMENT.md)
- [Performance and motion](docs/PERFORMANCE.md)
- [Current release / remaining work](docs/RELEASE_STATUS.md)
- [Development milestones V1–V15](CHANGELOG.md)
- [Source attribution and limitations](docs/ASSETS_AND_ATTRIBUTION.md)

## Licensing and use

**No open-source license has been selected.** Repository visibility does not itself grant permission to reuse the code or third-party reference material. Obtain permission for any real person's photograph, original source design assets, and other protected materials before redistributing them.

## Detailed project guide

The [**Project Handbook**](docs/PROJECT_HANDBOOK.md) describes the repository's specific goals, users, source architecture, functional areas, current qualification limits, development setup, security requirements and next milestones. It differentiates implemented source from unverified or planned functionality.


## V16 improvements

The V16 quality pass improves portrait decode/fallback, dark/light overlapping-label contrast, smaller type, cursor animation scheduling, metadata and contact receipt validation. GitHub CI now covers desktop Chromium/Firefox/WebKit and mobile Chrome/WebKit emulations with accessible-flow checks. The staged demo remains noindex until real identity, content and asset permissions are verified. See [V16 release notes](README_V16.md), [V16 QA](docs/releases/QA_REPORT_V16.md), and [security/privacy requirements](docs/SECURITY_AND_PRIVACY.md).
