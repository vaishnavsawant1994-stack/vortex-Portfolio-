import asyncio,statistics,json
from playwright.async_api import async_playwright
from test_v15 import build_html
async def measure(width,mode):
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':width,'height':900 if width>400 else 844})
  await page.set_content(build_html(choice=mode),wait_until='domcontentloaded',timeout=15000)
  await page.evaluate("document.querySelector('#loader')?.classList.add('hidden')")
  times=await asyncio.wait_for(page.evaluate('''async()=>new Promise(resolve=>{const a=[];let old=0,n=0;const max=document.documentElement.scrollHeight-innerHeight;function f(t){if(old)a.push(t-old);old=t;scrollTo(0,max*(n/45));n++;if(n<46)requestAnimationFrame(f);else resolve(a);}requestAnimationFrame(f);})'''),timeout=16)
  await browser.close()
  return {'width':width,'mode':mode,'n':len(times),'median_ms':round(statistics.median(times),2),'p95_ms':round(sorted(times)[int(len(times)*.95)],2),'long33':sum(x>33 for x in times)}
async def main():
 for width,mode in [(1440,'auto'),(1440,'full'),(390,'auto')]:
  try:print(await measure(width,mode),flush=True)
  except Exception as e:print('UNAVAILABLE',width,mode,type(e).__name__,str(e)[:120],flush=True)
asyncio.run(main())
