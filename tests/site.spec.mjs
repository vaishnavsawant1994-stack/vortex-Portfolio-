import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function ready(page){
 await page.goto('/');
 await page.evaluate(()=>document.fonts?.ready);
 await expect(page.locator('html')).toHaveAttribute('data-portrait-status','loaded');
 await expect.poll(()=>page.locator('.person-cutout').evaluate(e=>e.naturalWidth)).toBeGreaterThan(0);
}
test('responsive headings, portrait and centered footer remain fitted in both themes',async({page})=>{
 await ready(page);
 for(const theme of ['dark','light']){
   if(theme==='light') await page.locator('#themeToggle').click();
   await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
   for(const width of [320,390,768,1024,1440]){
     await page.setViewportSize({width,height:width<700?844:900});
     await page.waitForTimeout(120);
     const result=await page.evaluate(()=>{
       const rect=s=>document.querySelector(s).getBoundingClientRect();
       const t=rect('.hero-giant'),w=rect('.hero-big-wrap'),f=rect('.footer-big');
       return {overflow:document.documentElement.scrollWidth-innerWidth,
         titleFits:t.left>=w.left-3&&t.right<=w.right+3,
         footerCentered:Math.abs((f.left+f.width/2)-innerWidth/2)<=6,
         imageLoaded:document.querySelector('.person-cutout').naturalWidth>0};
     });
     expect(result,{theme,width}).toMatchObject({titleFits:true,footerCentered:true,imageLoaded:true});
     expect(result.overflow,{theme,width}).toBeLessThanOrEqual(1);
   }
 }
});
test('appearance persists after reload',async({page})=>{
 await ready(page);await page.locator('#themeToggle').click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('all four project dialogs work with keyboard',async({page})=>{
 await ready(page);
 for(const key of ['kirana','bold','monsoon','tiffin']){
   await page.locator('.project-row[data-project="'+key+'"]').focus();
   await page.keyboard.press('Enter');
   await expect(page.locator('#projectDialog')).toBeVisible();
   await expect(page.locator('#modalImage')).toHaveAttribute('alt',/Illustrative/);
   await page.keyboard.press('Escape');
   await expect(page.locator('#projectDialog')).not.toBeVisible();
 }
});
test('contact demo does not claim unconfigured mail delivery',async({page})=>{
 await ready(page);await page.locator('#contactButton').click();
 await expect(page.locator('#contactDialog')).toBeVisible();
 await expect(page.locator('#contactDeliveryNote')).toContainText('Preview mode');
 await expect(page.locator('#openEmailDraft')).toHaveText(/COPY MESSAGE/);
 await page.keyboard.press('Escape');
 await expect(page.locator('#contactDialog')).not.toBeVisible();
});
test('mobile menu opens and closes',async({page,isMobile})=>{
 test.skip(!isMobile,'Mobile-only behavior');
 await ready(page);await page.locator('#mobileToggle').click();
 await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');
 await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded','false');
});
test('axe accessibility reports no critical or serious violations in either theme',async({page})=>{
 await ready(page);
 for(const theme of ['dark','light']){
   if(theme==='light') await page.locator('#themeToggle').click();
   const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   const severe=r.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
   const details=severe.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}));
   expect(details,{theme}).toEqual([]);
   if(r.violations.length) console.log('AXE FINDINGS',theme,JSON.stringify(r.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))));
 }
});
