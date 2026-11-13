# V15 staging release — evidence and remaining acceptance gates

Date: 2026-11-13
Baseline: V14, preserving the original video-inspired dark/light visual treatment.

## Code improvements

- Full motion retains the original scrolling choreography, portrait layers and contact particle effects, while disabling selected repeatedly rasterized large-area drop shadows / blur filters. Auto retains the faster Balanced choice on desktop and economical choice on smaller/slower devices.
- Contact form now requires an explicit `{ "ok": true }` response body before claiming success. A proxy or server returning HTTP 200 with an error, invalid JSON, or an HTML page no longer closes the form or falsely claims delivery.
- Added no-cache policy for the public site configuration, no-store for contact responses, and no-cache for the entry page in the Netlify deployment configuration.
- Kept credentials out of client-side code. The included Netlify + Resend handler supports deployment only when the owner provides verified addresses and server-side environment variables.

## Completed browser and code checks

- Chromium in-memory QA: **24/24** responsive cases passed (dark/light × 12 screen widths 320–2560px), with no document overflow, usable portrait image, fitted PORTFOLIO title and centered footer. Zero JavaScript exceptions in the tested flows.
- Motion profile + dialog/navigation QA: **3/3** passed (Auto, Smooth, Full), with working project and contact dialogs and scroll behavior.
- Contact backend unit checks: **10/10** passed.
- Contact frontend acknowledgment checks: **3/3** passed, with explicit failure on `{ok:false}` and malformed JSON, and successful closure only on `{ok:true}`.
- `node --check` passed for website script and backend; `netlify.toml` parsed successfully.

## Short synthetic scrolling sample

45 requestAnimationFrame intervals per configuration in headless Chromium, GPU disabled, in-memory HTML:

| Mode/viewport | Median | p95 | Intervals over 33ms |
| --- | ---: | ---: | ---: |
| Auto, 1440px | ~16.7ms | ~16.7ms | 0/45 |
| Full, 1440px | ~33.3ms | ~33.4ms | 35/45 |
| Auto, 390px | ~16.7ms | ~16.7ms | 0/45 |

These figures are synthetic and **not** an actual frame-rate certification. Full mode remains heavier than Auto. Previous longer benchmark attempts timed out in the testing environment; those runs were not treated as passes.

## Known limits (not complete)

1. **Exact original portrait:** The only available source is an AI-reconstructed portrait from earlier work. The original person's high-resolution photograph cannot be recovered from the 384×832 video recording. Reconstructed WebP images are responsive but not the verified original.
2. **Real contact delivery:** Requires an authorized recipient and sending email, verified domain, Resend key, and deployment to function-capable hosting. The static staging site correctly stays in copy-message preview mode until connected. No live email was sent or claimed.
3. **Physical hardware and cross-browser qualification:** No access to the user's laptop/phone. Installed test engine is Chromium only; Safari/WebKit, Firefox, Android Chrome, iPhone Safari and real GPU/thermal conditions were **not** certified.
4. **Public HTTP smoke testing:** The web fetch and local container network could not retrieve the currently hosted URL. Successful deployment status does not independently prove every live asset fetch; review staging in a normal browser.
5. **Original website fidelity:** Original fonts, photography, animation source files and hidden interactions remain unavailable. Replica is not certified pixel-perfect.
6. **Production abuse prevention:** Before enabling live messages, configure bot challenge, throttling and provider monitoring at the host/edge level.

## Required final acceptance

On real desktop Chrome/Edge, Firefox and Safari, plus Android Chrome and iPhone Safari: open the site, switch themes, scroll rapidly in AUTO and SMOOTH, open each project and contact dialog, rotate the device, and record performance traces. Connect and send a **real** test email to a **verified** intended inbox after setting backend secrets. Obtain the original portrait to replace the reconstruction. These remaining actions cannot be certified from this isolated environment.

Release status: **V15 staging/QA candidate**, not final production certification.
