/**
 * Deployable Netlify serverless contact endpoint.
 * This file cannot run on pure static hosts (e.g. ShipStatic).
 * Required environment variables in your Netlify site settings:
 * RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, PUBLIC_SITE_ORIGIN.
 * Verify CONTACT_FROM_EMAIL's sending domain in your email provider.
 */
const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const json = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff' }
});
const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[character]));

export default async (request) => {
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  const expectedOrigin = process.env.PUBLIC_SITE_ORIGIN;
  const origin = request.headers.get('origin');
  if (!expectedOrigin || !origin || origin !== expectedOrigin) return json({error:'Forbidden origin'},403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({error:'Expected JSON'},415);
  if (Number(request.headers.get('content-length')||'0') > 14000) return json({error:'Request too large'},413);
  const apiKey=process.env.RESEND_API_KEY;
  const destination=process.env.CONTACT_TO_EMAIL;
  const verifiedSender=process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !emailPattern.test(destination||'') || !emailPattern.test(verifiedSender||''))
    return json({error:'Delivery is not configured'},503);
  let payload;
  try { const raw=await request.text(); if(raw.length>14000)return json({error:'Request too large'},413);payload=JSON.parse(raw); }
  catch{return json({error:'Invalid JSON'},400);}
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return json({error:'Invalid payload'},400);
  if (payload.website) return json({ok:true}); // Honeypot: do not send spam
  const name=String(payload.name||'').trim();
  const email=String(payload.email||'').trim();
  const message=String(payload.message||'').trim();
  if (!name || name.length>80 || !emailPattern.test(email) || email.length>120 || message.length<4 || message.length>4000)
    return json({error:'Invalid contact fields'},400);
  try {
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:verifiedSender,to:[destination],
        subject:`Portfolio enquiry from ${name.replace(/[\r\n]/g,' ')}`,
        reply_to:email,
        html:`<h2>Portfolio enquiry</h2><p><b>Name:</b> ${escapeHTML(name)}</p><p><b>Email:</b> ${escapeHTML(email)}</p><p>${escapeHTML(message).replace(/\n/g,'<br>')}</p>`
      })
    });
    if (!response.ok)return json({error:'Delivery unavailable'},502);
    return json({ok:true});
  } catch {return json({error:'Delivery unavailable'},502);}
};
