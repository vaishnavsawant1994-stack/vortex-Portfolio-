from pathlib import Path
import base64, re, asyncio, json, statistics
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent
MIME={'.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'}

def uri(file):
  b=Path(file).read_bytes()
  return f'data:{MIME[Path(file).suffix]};base64,'+base64.b64encode(b).decode()

def build_html(theme='dark',choice='auto'):
  html=(ROOT/'index.html').read_text()
  css=(ROOT/'site.css').read_text()
  js=(ROOT/'site.js').read_text()
  conf=(ROOT/'site-config.js').read_text()
  for f in (ROOT/'assets').glob('*'):
    if f.suffix not in MIME:continue
    rel='assets/'+f.name
    data=uri(f)
    html=html.replace(rel,data)
    css=css.replace(rel,data)
    js=js.replace(rel,data)
  html=re.sub(r'<link href="https://fonts.googleapis.com[^>]+>', '',html)
  html=re.sub(r'<link rel="preconnect"[^>]+>', '',html)
  html=html.replace('<link rel="stylesheet" href="site.css" />',f'<style>{css}</style>')
  html=html.replace('<script src="site-config.js" defer></script>',f'<script>{conf}</script>')
  html=html.replace('<script src="site.js" defer></script>','')
  html=html.replace("var choice='auto';",f"var choice='{choice}';")
  if theme=='light':html=html.replace("var t=localStorage.getItem('gs-portfolio-theme');","var t='light';")
  # by default full script at end
  html=html.replace('</body>',f'<script>{js}</script></body>')
  return html

async def main():
  results={'layout':[], 'interactions':[],'failures':[], 'frame':{}}
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for theme in ['dark','light']:
      html=build_html(theme=theme)
      for w,h in [(320,640),(360,740),(390,844),(430,932),(681,920),(768,1024),(981,900),(1024,768),(1366,768),(1440,900),(1920,1080),(2560,1440)]:
        context=await b.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
        page=await context.new_page()
        issues=[]
        page.on('pageerror',lambda e:issues.append(str(e)))
        await page.set_content(html,wait_until='domcontentloaded')
        await page.wait_for_timeout(100)
        metrics=await page.evaluate('''() => {
          const q=(s)=>document.querySelector(s),r=(s)=>q(s)?.getBoundingClientRect();
          const big=r('.hero-giant'),cont=r('.hero-big-wrap'),footer=r('.footer-big');
          return {docW:document.documentElement.scrollWidth,viewport:innerWidth,img:q('.person-cutout').complete&&q('.person-cutout').naturalWidth>0,
            bg:getComputedStyle(document.documentElement).getPropertyValue('--bg'),
            heading:document.querySelectorAll('h1').length,
            bigFit:big && cont && big.left>=cont.left-8&&big.right<=cont.right+8,
            footerCenter:footer?Math.abs((footer.left+footer.right)/2-innerWidth/2):null,
            main:!!document.querySelector('#mainContent'),
            note:q('#contactDeliveryNote')?.textContent
          };
        }''')
        success=metrics['docW']<=w+2 and metrics['img'] and metrics['heading']==1 and metrics['bigFit'] and metrics['footerCenter']<12 and not issues
        results['layout'].append({'theme':theme,'width':w,'ok':bool(success),'metrics':metrics,'errors':issues})
        if not success: results['failures'].append({'case':f'layout/{theme}/{w}','metrics':metrics,'errors':issues})
        if (theme=='light' and w in [390,1440]) or (theme=='dark' and w in [390,1440]):
          await page.screenshot(path=str(ROOT/f'qa-v15-{theme}-{w}.png'))
        await context.close()
    # Normal motion and modal behavior
    for profile in ['auto','smooth','full']:
      h=build_html('dark',profile)
      context=await b.new_context(viewport={'width':1440,'height':900})
      page=await context.new_page()
      errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
      await page.set_content(h,wait_until='domcontentloaded')
      await page.wait_for_timeout(250)
      motion=await page.evaluate('document.documentElement.dataset.motionProfile')
      await page.evaluate("document.querySelector('#loader').classList.add('hidden')")
      # Modal project
      await page.locator('.project-row[data-project="kirana"]').click(timeout=5000)
      is_open=await page.locator('#projectDialog').evaluate('(e)=>e.open')
      loaded=await page.locator('#modalImage').evaluate('(e)=>e.complete&&e.naturalWidth>0')
      await page.keyboard.press('Escape')
      closed=not await page.locator('#projectDialog').evaluate('(e)=>e.open')
      await page.locator('#contactButton').click(timeout=5000)
      btnlabel=(await page.locator('#openEmailDraft').inner_text()).strip()
      note=await page.locator('#contactDeliveryNote').inner_text()
      await page.keyboard.press('Escape')
      contact_closed=not await page.locator('#contactDialog').evaluate('(e)=>e.open')
      # test move hero
      await page.evaluate('window.scrollTo(0, Math.round(document.body.scrollHeight*0.16))')
      await page.wait_for_timeout(120)
      active=await page.locator('#home').evaluate('(e)=>e.getBoundingClientRect().top')
      result={'profile':profile,'derived':motion,'project':is_open and loaded and closed,'contact':contact_closed and 'COPY MESSAGE' in btnlabel and 'no verified inbox' in note,'scroll':active<0,'errors':errs}
      result['ok']=result['project'] and result['contact'] and result['scroll'] and not result['errors']
      results['interactions'].append(result)
      if not result['ok']:results['failures'].append({'case':f'interact/{profile}','result':result})
      await context.close()
    await b.close()
  (ROOT/'QA_RESULTS_V15.json').write_text(json.dumps(results,indent=2))
  print('LAYOUT',sum(x['ok'] for x in results['layout']),'/',len(results['layout']))
  print('INTERACTION',sum(x['ok'] for x in results['interactions']),'/',len(results['interactions']))
  print('ERRORS',results['failures'][:10])

if __name__=='__main__':asyncio.run(main())
