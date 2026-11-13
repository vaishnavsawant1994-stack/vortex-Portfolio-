import asyncio, json, statistics
from playwright.async_api import async_playwright
from test_v15 import build_html, ROOT

async def main():
 result=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
  for width,choice in [(390,'auto'),(1440,'auto'),(1440,'full'),(390,'full')]:
   context=await b.new_context(viewport={'width':width,'height':844 if width==390 else 900})
   page=await context.new_page()
   await page.set_content(build_html(choice=choice),wait_until='domcontentloaded')
   await page.wait_for_timeout(60)
   await page.evaluate("document.querySelector('#loader').classList.add('hidden')")
   timings=await page.evaluate('''async()=>{
     let samples=[];let start=-1;let doc=document.documentElement;let max=Math.max(0,doc.scrollHeight-innerHeight);
     return await new Promise(resolve=>{
       let prev=0,count=0;
       const run=t=>{
         if(prev)samples.push(t-prev);prev=t;
         const ratio=count/140;
         window.scrollTo(0,max*ratio);
         count++;
         if(count<=140)requestAnimationFrame(run);
         else resolve(samples);
       };requestAnimationFrame(run);
     });
   }''')
   vals=sorted(timings)
   result.append({'width':width,'choice':choice,'median_ms':round(statistics.median(vals),2),'p95_ms':round(vals[int(len(vals)*.95)],2),'above33ms':sum(t>33 for t in vals),'above50ms':sum(t>50 for t in vals),'frames':len(vals)})
   await context.close()
  await b.close()
 (ROOT/'QA_PERFORMANCE_V15.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2))
asyncio.run(main())
