/* Public options only. NEVER put credentials or API keys in this file.
   To activate delivery on a supported backend, set contactEndpoint to /api/contact
   and set the server-side environment variables described in docs/DEPLOYMENT.md.
   contactEmail is an optional verified recipient for the email-draft fallback. */
window.PORTFOLIO_CONFIG = Object.freeze({
  contactEmail: '',
  contactEndpoint: ''
});
