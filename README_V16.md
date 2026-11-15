# VORTEX V16 — Quality & Release Notes

V16 is an incremental finishing pass preserving the dark/light cinematic portfolio look. It fixes portrait readiness and failure UX, light-theme text overlap, micro-typography, high-frequency cursor rendering and false-positive provider acknowledgment. Cross-browser and accessibility tests are now part of GitHub Actions.

Run locally:

```bash
python3 -m http.server 8000
```

Validation once Node packages and browsers are available:

```bash
npm install
npx playwright install chromium firefox webkit
npm run test:e2e
node test_contact.mjs
python3 scripts/check_static.py
```

The demo page is deliberately `noindex, nofollow`, since its sample name, achievements, photograph and project case studies are not original verified assets. Before a real launch, replace and verify those claims, secure the relevant rights, set a canonical URL and absolute social-image URL, configure a verified backend and conduct real mail delivery plus physical-device QA.

See [V16 quality report](docs/releases/QA_REPORT_V16.md).
