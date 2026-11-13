import asyncio
from playwright.async_api import async_playwright
from test_v15 import build_html
async def run():
  html=build_html('light').replace("contactEndpoint: ''","contactEndpoint: 'https://api.example.test/contact'")
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=await b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
    errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
    await page.set_content(html,wait_until='domcontentloaded')
    await page.locator('#contactButton').click()
    await page.locator('#senderName').fill('QA Tester')
    await page.locator('#senderEmail').fill('tester@example.org')
    await page.locator('#senderMessage').fill('Example QA message')
    for raw,should_close in [('{"ok":false}',False), ('not-json',False), ('{"ok":true}',True)]:
      await page.evaluate('''payload=>{window.fetch=async()=>new Response(payload,{status:200,headers:{'Content-Type':'application/json'}})}''',raw)
      await page.locator('#openEmailDraft').click()
      await page.wait_for_timeout(70)
      open_now=await page.locator('#contactDialog').evaluate('(d)=>d.open')
      assert open_now != should_close,(raw,open_now)
      print('PASS',raw,'closed' if not open_now else 'still-open')
    assert not errs,errs
    await b.close()
asyncio.run(run())
