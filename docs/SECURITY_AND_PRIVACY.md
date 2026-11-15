# VORTEX — Security, privacy and source provenance

The GitHub repository is public. Never commit live API keys, `.env` or private visitor messages.

The optional Netlify/Resend contact function is DISABLED on static staging. Before enabling it:

1. Obtain an authorized receiving email and a verified sending domain.
2. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `PUBLIC_SITE_ORIGIN` only in server environment secrets.
3. Configure rate limits, bot protection, and monitoring at the host/edge. The included honeypot is not sufficient rate limiting.
4. Publish privacy information describing name/email/message collection, purpose, processor, retention, deletion and contact method.
5. Submit a real enquiry and check provider receipt and inbox delivery. A provider receipt ID is not guaranteed inbox placement.
6. Test CORS/origin restrictions, failures, error responses and abuse pathways. Minimize retained user data.

The portrait is reconstructed artwork, not the source person's authorized original photo. Personal achievements, statistics and illustrative project artwork are not independently verified. Do not sell the theme or represent it as an official person's portfolio without deciding a license and clearing all reference/asset rights.
