"""Offline smoke tests with synthetic in-memory network-asset replacements."""
from pathlib import Path
import base64,re,json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
h=(root/'index.html').read_text();js=(root/'site.js').read_text();css=(root/'site.css').read_text();config=(root/'site-config.js').read_text()
for f in (root/'assets').iterdir():
 if not f.is_file():continue
 mime='image/svg+xml' if f.suffix=='.svg' else 'image/png' if f.suffix=='.png' else 'image/webp'
 u='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()
 h=h.replace('assets/'+f.name,u);js=js.replace('assets/'+f.name,u)
h=re.sub(r'<link href="https://fonts.googleapis.com/[^>]+>','',h)
h=h.replace('<link rel="stylesheet" href="site.css" />','<style>'+css+'</style>').replace('<script src="site-config.js" defer></script>','').replace('<script src="site.js" defer></script>','').replace('</body>','<script>'+config+'</script><script>'+js+'</script></body>')
res=[]
with sync_playwright() as p:
 for width,height in [(390,844),(1440,900)]:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
  pg=b.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
  errors=[];pg.on('pageerror',lambda e: errors.append(str(e)))
  pg.set_content(h,wait_until='load')
  pg.locator('[data-project="kirana"]').click(force=True)
  assert pg.locator('#projectDialog').is_visible()
  assert pg.locator('#modalImage').get_attribute('alt').startswith('Illustrative')
  pg.keyboard.press('Escape');assert not pg.locator('#projectDialog').is_visible()
  pg.locator('#contactButton').click(force=True)
  assert pg.locator('#contactDialog').is_visible()
  assert 'Preview mode' in pg.locator('#contactDeliveryNote').inner_text()
  pg.keyboard.press('Escape');assert not pg.locator('#contactDialog').is_visible()
  if width==390:
   pg.locator('#mobileToggle').click(force=True)
   assert pg.locator('#mobileToggle').get_attribute('aria-expanded')=='true'
   pg.keyboard.press('Escape')
   assert pg.locator('#mobileToggle').get_attribute('aria-expanded')=='false'
  for mode in ('dark','light'):
   if mode=='light':pg.locator('#themeToggle').click(force=True)
   color=pg.evaluate('''() => {let e=document.querySelector('.scroll-indicator'),s=getComputedStyle(e);return {color:s.color,bg:s.backgroundColor,theme:document.documentElement.dataset.theme}}''')
   assert color['theme']==mode
   assert color['bg']!='rgba(0, 0, 0, 0)',color
  assert not errors, errors
  res.append({'viewport':width,'projects':True,'contact':True,'menu':width==390,'theme':True,'errors':0})
  b.close()
 # Full motion: nonreduced, shows geometry responds to actual scroll position.
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 pg=b.new_page(viewport={'width':1440,'height':900},reduced_motion='no-preference')
 pg.set_content(h,wait_until='load')
 pg.locator('#skipIntro').click(force=True)
 initial=pg.locator('.hero-giant').evaluate('(e)=>getComputedStyle(e).transform')
 pg.evaluate('window.scrollTo(0, 550)');pg.wait_for_timeout(200)
 updated=pg.locator('.hero-giant').evaluate('(e)=>getComputedStyle(e).transform')
 assert initial!=updated,(initial,updated)
 print(json.dumps({'interactions':res,'normalMotionChanged':True},indent=2))
 b.close()
