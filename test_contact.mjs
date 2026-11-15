import assert from 'node:assert/strict';
import handler from './netlify/functions/contact.mjs';
const origin='https://preview.example';
const make=(payload,headers={},method='POST')=>new Request('https://preview.example/api/contact',{
  method,headers:{Origin:origin,'Content-Type':'application/json',...headers},
  ...(method==='POST'?{body:JSON.stringify(payload)}:{})
});
let n=0;
async function caseTest(label,req,status,check=()=>{}) {
  const r=await handler(req);
  assert.equal(r.status,status,`${label}: unexpected HTTP code`);
  const body=await r.json();check(body);
  console.log('PASS',++n,label);
}
process.env.PUBLIC_SITE_ORIGIN=origin;
process.env.RESEND_API_KEY='test-only-secret';
process.env.CONTACT_TO_EMAIL='verified-to@example.org';
process.env.CONTACT_FROM_EMAIL='verified-from@example.org';
const valid={name:'Test User',email:'visitor@example.org',message:'Hello, this is a valid test message.',website:''};
await caseTest('Reject GET',make(valid,{},'GET'),405);
await caseTest('Reject other origin',make(valid,{Origin:'https://other.example'}),403);
await caseTest('Reject invalid content type',make(valid,{'Content-Type':'text/plain'}),415);
await caseTest('Reject malformed name',make({...valid,name:'x'.repeat(85)}),400);
await caseTest('Reject invalid email',make({...valid,email:'nonsense'}),400);
await caseTest('Ignore honeypot bot',make({...valid,website:'fakebot.example'}),200);
let sent;
globalThis.fetch=async (url,opts)=>{sent={url,opts};return new Response(JSON.stringify({id:'test-provider-message-id'}),{status:200});};
await caseTest('Deliver valid form',make({...valid,name:'<script>bad</script>'}),200,body=>assert.equal(body.ok,true));
assert.equal(sent.url,'https://api.resend.com/emails');
const outgoing=JSON.parse(sent.opts.body);
assert.ok(!outgoing.html.includes('<script>'));
assert.ok(outgoing.html.includes('&lt;script&gt;'));
assert.equal(outgoing.to[0],'verified-to@example.org');
assert.equal(outgoing.reply_to,'visitor@example.org');
console.log('PASS',++n,'Escape user content and address correct recipient');
globalThis.fetch=async()=>new Response('{}',{status:200});
await caseTest('Provider 200 without receipt is not success',make(valid),502);
globalThis.fetch=async()=>new Response('{}',{status:500});
await caseTest('Upstream send failure is not success',make(valid),502);
delete process.env.RESEND_API_KEY;
await caseTest('No API credentials returns 503',make(valid),503);
console.log(`${n} backend tests passed`);
