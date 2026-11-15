# Release status — V16 staging candidate

Snapshot date: 2026-11-15

## Available

- Complete portfolio UI, dark/light themes, responsive layouts and scroll animation profiles.
- Four illustrative project rows/details; technology stack, timeline, contact dialog, keyboard-accessible controls and reduced motion.
- Optional Netlify + Resend contact delivery function, **disabled by default**.
- Source code and static/browser/backend test scripts.

## QA evidence (from V15 report)

- Responsive: 24/24 synthetic Chromium cases covering light/dark and 12 widths.
- Motion profiles + interaction: 3/3 local checks.
- Contact function unit tests: 10/10, contact UI acknowledgment checks: 3/3.
- JS syntax checks passed. No JS exceptions in specified tested flows.
- Synthetic Auto frame intervals are encouraging; Full desktop is noticeably heavier.

## Pending prerequisites (cannot mark done without evidence)

- Original, authorized high-resolution photograph (current portrait is AI-generated).
- Verified receiving address, sending domain, email provider settings and an actual delivery test.
- Physical-device Chrome/Edge/Firefox/Safari, iPhone/Android acceptance and actual GPU/frame-rate measurements.
- Independent deployed-HTTP check of the full public site and cache headers.
- Rate limiting/bot protection, data handling notice and review before enabling public email delivery.
- Approval for distribution of any third-party copyrighted design elements/assets.

**This repository is source control for the VORTEX theme, not a claim of final production certification or 100% reference fidelity.**


## V16 qualification

Source and contact changes are on main. Offline Chromium checks: 16/16 responsive dark/light combinations, interaction smoke, and 11/11 backend contract tests. New GitHub Actions jobs exercise Chromium, Firefox and WebKit with responsive layout and accessibility assertions; use the actual CI run conclusion for exact release qualification. V16 staging preview: https://hushed-bolt-u7nq8pb.shipstatic.com. The portrait, contact provider, production origin and physical-device performance remain externally blocked. [Full V16 QA report](releases/QA_REPORT_V16.md).

## V16 exact-head CI result

The final V16 code commit `9780f4dbc0f6fc27ab47b7a375f67b2ecea436a2` passed [GitHub Actions run 43723825505](https://github.com/vaishnavsawant1994-stack/vortex-Portfolio-/actions/runs/43723825505): 27 browser tests passed across Chromium, Firefox, WebKit, and mobile emulations, 3 desktop-only mobile tests skipped; smoke/contact job succeeded. No axe serious/critical violations were reported in either tested theme. Final static staging deployment: https://hushed-bolt-u7nq8pb.shipstatic.com (14 files, ShipStatic success). These are simulated browser tests, not a physical-device performance or live-email certificate.
