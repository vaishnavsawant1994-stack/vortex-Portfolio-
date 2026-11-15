"""Offline Chromium regression, inlining web assets because this sandbox blocks HTTP.
Not a substitute for deployed network/browser/physical hardware tests.
"""
from pathlib import Path
import base64,re,json,sys,traceback
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text()
CSS=(ROOT/'site.css').read_text()
JS=(ROOT/'site.js').read_text()
CONF=(ROOT/'site-config.js').read_text()
for p in sorted((ROOT/'assets').rglob('*')):
 if p.is_file():
  mime={'webp':'image/webp','png':'image/png','svg':'image/svg+xml'}[p.suffix.lstrip('.')]
  url='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
  HTML=HTML.replace('assets/'+p.name,url)
  JS=JS.replace('assets/'+p.name,url)
HTML=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>', '', HTML)
HTML=HTML.replace('<link rel="stylesheet" href="site.css" />','<style>'+CSS+'</style>')
HTML=HTML.replace('<script src="site-config.js" defer></script>', '')
HTML=HTML.replace('<script src="site.js" defer></script>', '')
HTML=HTML.replace('</body>', '<script>'+CONF+'</script><script>'+JS+'</script></body>')
results=[]
with sync_playwright() as p:
 for viewport in [(320,640),(375,812),(390,844),(540,850),(768,1024),(1024,768),(1440,900),(1920,1080)]:
  width,height=viewport
  for theme in ['dark','light']:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
   page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce',device_scale_factor=1)
   errors=[]
   page.on('pageerror', lambda ex:errors.append(str(ex)))
   page.set_content(HTML,wait_until='load',timeout=15000)
   page.wait_for_timeout(130)
   if theme=='light':page.locator('#themeToggle').click(force=True)
   diag=page.evaluate('''() => {
    const r=s=>document.querySelector(s)?.getBoundingClientRect();
    const image=document.querySelector('.person-cutout');
    const title=r('.hero-giant'),wrap=r('.hero-big-wrap'),foot=r('.footer-big');
    return {titleFitted:title.left>=wrap.left-3&&title.right<=wrap.right+3,
      portraitReady:image?.naturalWidth>0,
      portraitStatus:document.documentElement.dataset.portraitStatus,
      footerCentered:Math.abs((foot.left+foot.width/2)-innerWidth/2)<=6,
      overflow:document.documentElement.scrollWidth-innerWidth,
      buttonName:document.querySelector('#themeToggle').getAttribute('aria-label'),
      theme:document.documentElement.dataset.theme};
   }''')
   outcome={**{'width':width,'theme':theme},**diag,'errors':errors}
   assert diag['portraitReady'],outcome
   assert diag['titleFitted'],outcome
   assert diag['overflow']<=1,outcome
   assert diag['footerCentered'],outcome
   assert diag['theme']==theme,outcome
   assert not errors,outcome
   if width in [390,1440]:
    path=ROOT/'previews'/f'v16-{theme}-{width}.png'
    page.screenshot(path=str(path))
   results.append(outcome)
   browser.close()
 print(json.dumps({'checks':len(results),'status':'pass','viewportThemes':[f"{x['width']}/{x['theme']}" for x in results]},indent=2))
