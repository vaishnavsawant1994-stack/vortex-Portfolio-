# Gaurav Sharma — Portfolio V15

Static preview: deploy `index.html`, `site.css`, `site.js`, `site-config.js` and `assets/`. The root has both dark and light themes, Auto/Smooth/Full motion choices, project details and a contact draft form.

## Local use

Run `python -m http.server 8000` in the folder, then open `http://localhost:8000`. The release archive includes test scripts and `QA_REPORT_V15.md`.

## Contact delivery

The static site intentionally **does not send** any message until configured. `site-config.js` defaults to `contactEmail: ''`, `contactEndpoint: ''`, meaning preview/copy mode. This is intentional, not a bug.

The included `netlify/functions/contact.mjs` uses Resend's email API. To enable it, deploy the root folder on a Netlify account with functions enabled, verify the sender domain in Resend, and set these **server-side environment variables** (not in client JS):

- `RESEND_API_KEY` — private API key
- `CONTACT_TO_EMAIL` — recipient verified/authorized for this project
- `CONTACT_FROM_EMAIL` — sender address on the verified domain
- `PUBLIC_SITE_ORIGIN` — the exact public site origin (e.g. `https://yourdomain.example`)

Then edit `site-config.js` to set `contactEndpoint: '/api/contact'`; deploy; send a real test enquiry to the intended recipient, verify delivery, and configure rate limiting/bot protection. The `netlify.toml` rewrite maps `/api/contact` to the Netlify function. **ShipStatic is static hosting** and does not execute this Netlify function.

Do **not** paste credentials into this chat or the public configuration file. Use the hosting provider's secret environment settings.

## Original portrait

The present person is a generated approximation, NOT the exact photograph from the source video. Replace `assets/hero-person-*` with licensed/authorized source photography after re-exporting appropriately sized WebP images. Keep the existing dimensions/aspect ratio for stable layouts. Do not pretend AI upscaling restores original facial detail.

## Motion

Auto prioritizes smoothness while preserving the major scroll effects; Smooth uses economical animation; Full retains all motion but is more GPU/CPU intensive. If Full stutters on a device, use Auto or Smooth.

## Acceptance

Review `QA_REPORT_V15.md`. Passing local Chromium tests does not certify Safari/Firefox or physical-device frame rate. The release is a staging candidate pending those checks, a verified portrait and real email delivery.
