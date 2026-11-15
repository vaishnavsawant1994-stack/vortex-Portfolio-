# Hosting and contact delivery

## Static-only preview

Deploy the repository root (`index.html`, `site.css`, `site.js`, `site-config.js`, `assets/`) to any static host. This provides all visual effects and copy-message functionality but **does not send email**. The staging preview is: https://unveiled-hub-j4y42f5.shipstatic.com.

## Netlify deployment

1. Import this GitHub repository into your Netlify account and select the repository root as publish directory (`netlify.toml` already specifies `publish = "."`). Do not enable an unrelated build command.
2. The optional `netlify/functions/contact.mjs` handler requires Node-compatible Netlify Functions; `/api/contact` is rewritten in `netlify.toml`.
3. Verify ownership of the sending domain with your email delivery provider (Resend in this template).
4. Configure **server-side only**: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `PUBLIC_SITE_ORIGIN` (exact scheme + host used by visitors). Never commit secrets or put them in `site-config.js`.
5. Once the function is live and verified, set `window.PORTFOLIO_CONFIG.contactEndpoint` in `site-config.js` to `'/api/contact'`. A draft fallback email may be supplied only if authorized/verified.
6. Submit a **real** test enquiry and verify receipt before announcing live delivery. The function's success response means the provider accepted the API request; it does not guarantee inbox placement.
7. Add host/edge rate limiting and anti-bot protection, monitor abuse/delivery failures, and establish privacy/data-retention terms before public launch.

## Other hosts

ShipStatic and other static-only hosts cannot run this Netlify Function. Use a function-enabled provider or a separate backend with a configured CORS policy and update the public endpoint accordingly.

## Required production checks

Test actual public HTTP loading, all assets and fonts, theme persistence, project and contact dialogs, mobile navigation and all motion modes across Chrome/Edge, Firefox, Safari and physical phones. Record real Web Vitals and frame traces rather than assuming synthetic tests guarantee 60 FPS. Replace reconstructed imagery only with rights-cleared source assets.


## V16 indexing and verification

V16 staging URL: https://hushed-bolt-u7nq8pb.shipstatic.com. The public demo intentionally has `noindex, nofollow` to avoid indexing unverified sample identity and portfolio statistics. Before an authorized production launch, replace those with true content; configure a canonical HTTPS URL and site-owned absolute Open Graph screenshot; only then remove noindex. Enable the contact endpoint only on function-capable hosting after verified sender/recipient, backend keys, rate limiting, bot challenge and successful real inbox testing. A provider receipt ID is not proof of inbox arrival.
