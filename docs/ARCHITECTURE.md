# Architecture overview

VORTEX is a **no-build static UI** with an optional server-side Netlify contact endpoint.

## Runtime components

- `index.html`: sections, navigation, project cards, dialogs, theme/motion initialization, responsive image markup.
- `site.css`: dark/light color variables, responsive design, typography, transitions and reduced-motion fallbacks.
- `site.js`: interactive controls, project data, cached scroll-linked style updates, canvas particle effects, custom cursor, mobile navigation and dialog lifecycle.
- `site-config.js`: **public, intentionally blank** contact destination and endpoint (contains no secrets).
- `assets/`: WebP versions of a **generated portrait** and SVG representations of sample project dashboards.
- `netlify/functions/contact.mjs`: optional server handler; accepts validated contact JSON, checks request origin and calls Resend when configured.

## Data flow

```
Browser → static HTML/CSS/JS/assets → interactive portfolio
                                   ├─ project modal (illustrative static data)
                                   └─ contact dialog
                                        ├─ default: copy message (no delivery)
                                        └─ configured: POST /api/contact
                                            → Netlify function → Resend → verified recipient
```

No database, account signup, CMS or backend datastore is included. Project information currently exists in static content/scripts. The design is a reconstruction of a recording, not original website source code.

## Constraints

- Portrait artwork is *not* the original person image.
- Projects are illustrative and may not reflect live independent products.
- Email remains intentionally unconfigured.
- Third-party Google Fonts load from Google servers where allowed; fallback fonts are provided.
- Scroll animation performance varies with device, graphics capabilities, browser, and motion mode.
