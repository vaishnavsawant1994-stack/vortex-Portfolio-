# V16 — Website-wide finishing and release QA

**Date:** 15 November 2026 · **Status:** staging, not production-certified.

## Changes
- Hero portrait now reports decoded readiness or displays an explicit unavailable-image fallback.
- The SCROLL TO EXPLORE indicator uses a contrasting opaque surface across dark clothes in both themes.
- Essential small typography now has larger sizing floors.
- Custom cursor updates are coalesced by requestAnimationFrame.
- Staging page uses noindex metadata to avoid indexing unverified identities, and gains minimal template-oriented structured data and social preview metadata.
- Server-side contact handler now requires a Resend-style provider receipt ID; HTTP 200 without a receipt is not success.
- Browser regression suite configured for Chromium desktop, Firefox desktop, WebKit desktop, Chromium mobile, WebKit mobile. Includes responsive fit, image readiness, theme persistence, keyboard dialogs, contact preview and axe accessibility findings.

## Verified locally
- 16/16 in-memory Chromium layout checks: eight widths 320, 375, 390, 540, 768, 1024, 1440 and 1920 px times two themes. No detected page overflow, missing portrait, clipped PORTFOLIO title or off-center footer.
- In-memory Chromium interaction smoke passed at 390 and 1440 px; project/contact dialogs, theme switch, mobile menu and normal-motion scroll transform.
- 11/11 Netlify contact backend unit tests passed after receipt validation change.
- JavaScript syntax and dependency-free static checks passed.
- Previous V15 saved dark screenshot missing the portrait; the new local dark capture after image decode shows it. This does not establish whether the old capture was premature or an intermittent runtime defect.

## Not yet verified / release blockers
- **GitHub Actions browser workflow:** new tests are configured but must show a successful run against exact release SHA to count as passed.
- Cross-browser and physical device GPU/thermal FPS, real-user LCP/INP/CLS, slow connections and actual public-HTTP resource verification.
- Original rights-cleared high-resolution portrait. The current person is generated and is not the original recorded photo.
- True identity, bio, statistics, project ownership and original project screenshots; existing entries are illustrative or unverified.
- Verified sender, receiver, Resend key, rate limiting, abuse prevention, published data handling notice and actual inbox delivery. Static ShipStatic demo remains copy-message only.
- A real permanent domain and canonical URL; conversion of demo Open Graph URLs into production-owned absolute URLs; remove noindex only after verification.
- Legal owner decision on software license and permissions for commercial distribution.

**Verdict:** V16 improves staging quality but does not justify claims of 100% source-video parity, zero lag on all devices or complete production certification.
