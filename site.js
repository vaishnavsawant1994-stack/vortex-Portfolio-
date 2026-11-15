/* --- app.js --- */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const motionProfile=document.documentElement.dataset.motionProfile||'cinematic';
  const lowPower = motionProfile!=='cinematic';
  const lightweight = motionProfile==='economical'||motionProfile==='reduced';
  const loader = $('#loader');
  const loadingNumber = $('#loadingNumber');
  const progress = $('#topProgress');
  const header = $('#header');
  const toTop = $('#backToTop');
  const nav = $('#nav');
  const mobileToggle = $('#mobileToggle');
  const cursor = $('#cursor');
  const cursorRing = $('#cursorRing');
  const toast = $('#toast');
  let toastTimeout;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2800);
  }


  async function copyText(text) {
    try { if (navigator.clipboard?.writeText) {await navigator.clipboard.writeText(text); return true;} }
    catch (_) { /* Fallback to selection-based copy for restricted contexts. */ }
    const hidden=document.createElement('textarea');
    hidden.value=text;hidden.setAttribute('readonly','');hidden.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(hidden);hidden.select();
    let ok=false;
    try {ok=document.execCommand('copy');} catch (_) {}
    hidden.remove();return ok;
  }

  // Intro — an orbiting constellation of color, as shown at the start/end of the video.
  function setupIntro() {
    if (reducedMotion || lowPower || (()=>{try{return sessionStorage.getItem('gs-cinematic-intro-v3')}catch{return false}})()) { loader.classList.add('hidden'); return; }
    const canvas = $('#loaderParticles');
    const ctx = canvas.getContext('2d');
    const colors = ['#ff403d', '#ffc44f', '#dbff6b', '#bc8aff', '#6ef5ed', '#f7e4d8'];
    const dots = Array.from({ length: 84 }, (_, i) => ({
      a: (i / 84) * Math.PI * 2 + (Math.random() - .5) * 1.3,
      radius: 68 + Math.random() * 138,
      size: 1 + Math.random() * 3.7,
      speed: .00013 + Math.random() * .00028,
      col: colors[i % colors.length],
      phase: Math.random() * Math.PI * 2,
      shape: i % 9 === 0 ? 'rect' : 'circle'
    }));
    let start = performance.now();
    let stop = false;
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    function animate(now) {
      if (stop) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const factor = Math.min(w, h) / 540;
      const elapsed = now - start;
      for (const d of dots) {
        const a = d.a + elapsed * d.speed;
        const r = d.radius * factor * (0.93 + 0.06 * Math.sin(elapsed * .001 + d.phase));
        const x = w / 2 + Math.cos(a) * r;
        const y = h / 2 + Math.sin(a) * r * .5;
        ctx.fillStyle = d.col;
        ctx.globalAlpha = .5 + .5 * Math.sin(elapsed * .0015 + d.phase) ** 2;
        ctx.shadowColor = d.col; ctx.shadowBlur = 12;
        if (d.shape === 'rect') { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillRect(-d.size, -d.size, d.size * 2, d.size * 2); ctx.restore(); }
        else { ctx.beginPath(); ctx.arc(x, y, d.size * factor, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      if (elapsed < 1350) requestAnimationFrame(animate);
      else finishIntro();
    }
    const finishIntro=()=>{if(stop)return;stop=true;loader.classList.add('hidden');loadingNumber.textContent='100';clearInterval(interval);try{sessionStorage.setItem('gs-cinematic-intro-v3','1')}catch(_){};setTimeout(()=>{canvas.width=1;canvas.height=1;},850);};
    $('#skipIntro')?.addEventListener('click',finishIntro);
    let number = 0;
    const interval = setInterval(() => {
      number = Math.min(number + Math.round(5 + Math.random() * 12), 100);
      loadingNumber.textContent = String(number).padStart(2, '0');
      if (number === 100) clearInterval(interval);
    }, 80);
    requestAnimationFrame(animate);
  }

  // Particle renderer V3: draw from cached glow sprites and run only while
  // the contact section is visible. 30 FPS is intentional for mobile comfort.
  function setupContactOrb() {
    const canvas = $('#contactParticles');
    const ctx = canvas.getContext('2d', {alpha:true});
    if (!ctx) return;
    const colors = ['#fb4543','#ffae43','#ffef5c','#a0ff78','#62e5dc','#ad7bff','#ff83c0'];
    const sprites=colors.map(col=>{
      const sc=document.createElement('canvas');sc.width=48;sc.height=48;
      const c=sc.getContext('2d');
      const g=c.createRadialGradient(24,24,1,24,24,24);
      g.addColorStop(0,'#ffffff');g.addColorStop(.10,col);g.addColorStop(.32,col+'cc');g.addColorStop(1,col+'00');
      c.fillStyle=g;c.fillRect(0,0,48,48);return sc;
    });
    const dots = Array.from({length:lowPower?52:90},(_,i)=>({
      a:(i/(lowPower?52:90))*Math.PI*2+(Math.random()-.5)*.7,
      r:.33+Math.random()*.64,
      size:1+Math.random()*3, axis:Math.random()*Math.PI*2,
      speed:.12+Math.random()*.35,sprite:sprites[i%colors.length]
    }));
    let w=500,h=500,px=0,py=0,pointing=false,visible=false,raf=0,last=0;
    function resize(){const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;
      const dpr=Math.min(window.devicePixelRatio||1,lightweight?1:lowPower?1.15:1.5);
      canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    new ResizeObserver(resize).observe(canvas);
    resize();
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();px=(e.clientX-r.left-r.width/2)/Math.max(1,r.width);py=(e.clientY-r.top-r.height/2)/Math.max(1,r.height);pointing=true;if(lightweight)request();},{passive:true});
    canvas.addEventListener('pointerleave',()=>{pointing=false;});
    function request(){if(!raf && visible&&!document.hidden)raf=requestAnimationFrame(render)}
    function render(now){raf=0;if(!visible || document.hidden)return;
      if(!reducedMotion && now-last<(lightweight?65:lowPower?42:33)){request();return;}last=now;
      ctx.clearRect(0,0,w,h);
      const t=reducedMotion?0:now/1000,k=Math.min(w,h)*.44;
      const tiltX=pointing?px*1.3:0,tiltY=pointing?py*1.3:0;
      for(const d of dots){
        const a=d.a+t*d.speed*.42,b=d.axis+t*.12;
        const rz=Math.sin(b)*Math.cos(a);
        const x=w/2+Math.cos(a)*(.72+.28*Math.cos(b))*d.r*k+rz*tiltX*36;
        const y=h/2+Math.sin(a)*d.r*k*.85+rz*tiltY*30;
        const s=d.size*(.7+(rz+1)/3)*4.8;
        ctx.globalAlpha=.48+.52*(rz+1)/2;
        ctx.drawImage(d.sprite,x-s,y-s,s*2,s*2);
      }
      ctx.globalAlpha=1;
      if(!reducedMotion&&!lightweight)request();
    }
    const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'180px 0px'});
    io.observe(canvas);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();});
  }

  const navLinks=$$('.nav-link');
  let navSections=[],lastNav=null;
  function measureNav(){navSections=$$('[data-nav]').map(section=>({name:section.dataset.nav,top:section.getBoundingClientRect().top+scrollY}));}
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${percent.toFixed(4)})`;
    header.classList.toggle('scrolled', window.scrollY > 45);
    toTop.classList.toggle('show', window.scrollY > 500);
    let active = 'home';
    const threshold=window.scrollY+window.innerHeight*.5;
    for(const item of navSections){if(item.top<threshold)active=item.name;}
    if(active!==lastNav){
      for(const a of navLinks){const here=a.getAttribute('href')===`#${active}`;a.classList.toggle('active',here);if(here)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}
      lastNav=active;
    }
  }
  let scrollPending = false;
  window.addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => { updateScroll(); scrollPending = false; });
  }, { passive: true });
  measureNav();updateScroll();
  addEventListener('resize',()=>{measureNav();updateScroll();},{passive:true});
  addEventListener('load',()=>{measureNav();updateScroll();},{once:true});
  document.fonts?.ready?.then(measureNav).catch(()=>{});
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  mobileToggle.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    mobileToggle.classList.toggle('is-open', opened);
    mobileToggle.setAttribute('aria-expanded', String(opened));
    mobileToggle.setAttribute('aria-label', opened ? 'Close menu' : 'Open menu');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    mobileToggle.classList.remove('is-open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open menu');
  }));
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      mobileToggle.classList.remove('is-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px -45px 0px', threshold: .04 });
  $$('.reveal').forEach(el => observer.observe(el));

  // Project case-study overlays. No invented URLs to repos or client sites.
  const projects = {
    kirana: { title: 'KIRANA OS', description: 'A fast, counter-first POS and inventory concept for neighborhood stores. The video shows Kirana OS among the featured projects; this replica reconstructs its showcase layout. Full implementation specifications and external project links were not provided in the recording.', tags: ['REACT', 'NODE.JS', 'POSTGRESQL', 'POS / INVENTORY'], image: 'assets/kirana-dashboard.svg', details: [['VISUALIZED INTERFACE','Daily sales, counter checkout, inventory alerts and recent transactions'],['DESIGN PRINCIPLE','Information-dense, readable, one-glance store operations']] },
    bold: { title: 'BOLD.', description: 'A project named BOLD appears as the second item in the provided video. The exact functionality is not visible, so this detailed design preview is illustrative, not a claim about the original application.', tags: ['PRODUCT DESIGN', 'FRONTEND', 'INTERACTION'], image: 'assets/bold-dashboard.svg', details: [['VISUALIZED INTERFACE','Brand-forward product panels, type system and responsive UI'],['DESIGN PRINCIPLE','Confident information hierarchy without visual clutter']] },
    monsoon: { title: 'MONSOON WATCH', description: 'A real-time weather information dashboard for making practical decisions using forecast data. The project name and portfolio placement are visible in the supplied recording; features beyond the visible presentation are illustrative.', tags: ['PYTHON', 'LIVE DATA', 'API', 'MAPS'], image: 'assets/monsoon-dashboard.svg', details: [['VISUALIZED INTERFACE','Forecast cards, live radar, local maps and rainfall probability'],['DESIGN PRINCIPLE','Turn changing conditions into actionable information']] },
    tiffin: { title: 'TIFFIN ROUTE', description: 'A delivery and route planning showcase focused on local meal logistics. The presentation is a faithful visual-style reconstruction of the section seen in the video, with an interactive case-study card.', tags: ['TYPESCRIPT', 'ROUTING', 'LOGISTICS', 'MAPS'], image: 'assets/tiffin-dashboard.svg', details: [['VISUALIZED INTERFACE','Routing map, delivery progress, driver status and ETA cards'],['DESIGN PRINCIPLE','High-signal dispatch tracking with clear route context']] }
  };
  const projectDialog = $('#projectDialog');
  const contactDialog = $('#contactDialog');
  function openDialog(dialog) { if (!dialog.open) { dialog.showModal(); document.body.classList.add('modal-open'); } }
  function closeDialog(dialog) { if (dialog.open) dialog.close(); }
  [projectDialog, contactDialog].forEach(d => {
    d.addEventListener('close', () => document.body.classList.remove('modal-open'));
    d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
  });
  function showProject(key) {
    const item = projects[key]; if (!item) return;
    $('#modalTitle').textContent = item.title;
    $('#modalImage').src = item.image;
    $('#modalImage').alt = `Illustrative high-resolution ${item.title} concept graphic`;
    $('#modalDescription').textContent = item.description;
    $('#modalTags').replaceChildren(...item.tags.map(tag => { const el = document.createElement('span'); el.textContent = tag; return el; }));
    $('#modalDetails').replaceChildren(...item.details.map(([heading,detail])=>{const box=document.createElement('div');box.className='dialog-detail';const b=document.createElement('b');b.textContent=heading;const t=document.createElement('span');t.textContent=detail;box.append(b,t);return box;}));
    openDialog(projectDialog);
  }
  $$('.project-row').forEach(row => {
    row.addEventListener('click', () => showProject(row.dataset.project));
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showProject(row.dataset.project); } });
  });
  $('#closeProject').addEventListener('click', () => closeDialog(projectDialog));
  $('#closeContact').addEventListener('click', () => closeDialog(contactDialog));
  $('#contactButton').addEventListener('click', () => openDialog(contactDialog));
  $('#footerEmail').addEventListener('click', () => openDialog(contactDialog));
  const config = window.PORTFOLIO_CONFIG || {};
  const contactEndpoint=String(config.contactEndpoint||'').trim();
  const configuredContact=String(config.contactEmail||'').trim();
  const deliveryBtn=$('#openEmailDraft');
  const copyBtn=$('#copyMessageButton');
  const deliveryNote=$('#contactDeliveryNote');
  const help=$('#contactDialogHelp');
  const form=$('#contactForm');
  const messageText=()=>`Portfolio enquiry from ${$('#senderName').value.trim()}\nEmail: ${$('#senderEmail').value.trim()}\n\n${$('#senderMessage').value.trim()}`;
  // The preview must never say it sent a message when there is no verified backend.
  if (contactEndpoint) {
    deliveryBtn.textContent='SEND MESSAGE ↗';
    help.textContent='Send your message through the connected contact service, or copy a draft.';
    deliveryNote.textContent='Messages are sent only after the configured delivery service confirms receipt.';
  } else if (configuredContact) {
    deliveryBtn.textContent='OPEN EMAIL DRAFT ↗';
    deliveryNote.textContent='Your email app will compose a message to '+configuredContact+'. You must send it there.';
    help.textContent='Compose a message in your email app or copy it for later. The site does not send it automatically.';
  } else {
    deliveryBtn.textContent='COPY MESSAGE ⧉';
    copyBtn.hidden=true;
    deliveryNote.textContent='Preview mode: no verified inbox is connected. Copy the message and send it manually.';
    help.textContent='The contact interface is a preview. No message will be delivered until an authorized inbox is connected.';
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity())return;
    const name=$('#senderName').value.trim();
    const email=$('#senderEmail').value.trim();
    const message=$('#senderMessage').value.trim();
    if (!name || !email || !message) {showToast('Please complete each field.');return;}
    if ($('#contactWebsite').value) {showToast('Unable to process this request.');return;}
    if (contactEndpoint) {
      deliveryBtn.disabled=true;
      deliveryBtn.textContent='SENDING…';
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),12000);
      try{
        const url=new URL(contactEndpoint,window.location.href);
        if(url.origin!==location.origin && url.protocol!=='https:')throw Error('Contact endpoint must be secure');
        const response=await fetch(url.toString(),{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({name,email,message,website:''}),
          credentials:url.origin===location.origin?'same-origin':'omit',
          signal:controller.signal
        });
        if(!response.ok)throw Error('Delivery service unavailable');
        const receipt=await response.json().catch(()=>null);
        if(!receipt || receipt.ok!==true)throw Error('Delivery service returned no receipt');
        form.reset();
        showToast('Your message was submitted successfully.');
        closeDialog(contactDialog);
      }catch(err){showToast('Message not delivered. Please copy your message and try again.');}
      finally {clearTimeout(timeout);deliveryBtn.disabled=false;deliveryBtn.textContent='SEND MESSAGE ↗';}
      return;
    }
    if (configuredContact) {
      const subject=encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body=encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
      window.location.href=`mailto:${encodeURIComponent(configuredContact)}?subject=${subject}&body=${body}`;
      showToast('Email draft opened. Review and send it in your email app.');
      return;
    }
    if (await copyText(messageText())) showToast('Message copied. No email was sent.');
    else showToast('Copy is unavailable here. Select and copy your text manually.');
  });
  copyBtn?.addEventListener('click',async()=>{
    if(!form.reportValidity())return;
    if(await copyText(messageText()))showToast('Message copied. Paste it into your email app.');
    else showToast('Copy unavailable. Select and copy the message manually.');
  });
  $('#copyPageButton').addEventListener('click', async () => {
    if (await copyText(window.location.href)) showToast('Website link copied.');
    else showToast('Your browser blocked clipboard access.');
  });

  if (!isTouch && !reducedMotion) {
    let tx = -100, ty = -100, rx = -100, ry = -100, followId=0;
    const follow=()=>{
      followId=0;rx+=(tx-rx)*.22;ry+=(ty-ry)*.22;
      cursorRing.style.transform=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      if(Math.abs(tx-rx)+Math.abs(ty-ry)>.35)followId=requestAnimationFrame(follow);
    };
    let cursorFrame=0;
    document.addEventListener('pointermove',e=>{
      tx=e.clientX;ty=e.clientY;
      if(!cursorFrame)cursorFrame=requestAnimationFrame(()=>{
        cursorFrame=0;
        cursor.style.transform=`translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      });
      if(!followId)followId=requestAnimationFrame(follow);
    },{passive:true});
    $$('a,button,.project-row').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
    // The freestanding subject stays upright; its movement is linked only to
    // the cinematic scroll scene. This avoids competing pointer transforms.
  }

  // Record successful image decode and provide a visible failure state.
  const heroPortrait=document.querySelector('.person-cutout');
  if(heroPortrait){
    const stage=heroPortrait.closest('.person-stage');
    const markFailed=()=>{document.documentElement.dataset.portraitStatus='error';stage?.classList.add('portrait-error');};
    const markReady=()=>{
      if(heroPortrait.naturalWidth<=0){markFailed();return;}
      Promise.resolve(heroPortrait.decode?.()).catch(()=>{}).finally(()=>{
        document.documentElement.dataset.portraitStatus='loaded';
        stage?.classList.remove('portrait-error');
      });
    };
    heroPortrait.addEventListener('load',markReady,{once:true});
    heroPortrait.addEventListener('error',markFailed,{once:true});
    if(heroPortrait.complete){if(heroPortrait.naturalWidth>0)markReady();else markFailed();}
  }
  setupContactOrb();
  setupIntro();
})();

/* --- cinematic.js --- */
/* Cinematic scroll engine — native, dependency-free, user-scroll-scrubbed.
 * A deliberately per-scene choreography based on the provided vertical recording.
 * The short is 384×832 and records an angled monitor, so exact per-frame motion
 * curves cannot be recovered; all major filmed chapters are recreated below.
 */
(() => {
  'use strict';
  const profile=document.documentElement.dataset.motionProfile||'cinematic';
  const reduced = profile==='reduced';
  const economical = profile==='economical';
  const simpleMotion = economical; // Balanced keeps scroll choreography with lower-cost rendering.
  const clamp = (v, a=0, b=1) => Math.min(b, Math.max(a, v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
  const select = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const hero = select('.hero');
  if (!hero) return;
  const stage = document.createElement('div');
  stage.className = 'hero-pin-stage';
  hero.before(stage);
  stage.append(hero);
  const el = {
    hero, stage,
    giant: select('.hero-giant'), left: select('.hero-left'), right: select('.hero-right'),
    portrait: select('.hero-portrait-wrap'), eyebrow: select('.hero-eyebrow'),
    heroBottom:select('.hero-bottom-bar'), heroGlow:select('.hero-ambient'),
    about: select('.about'), aboutLeft:select('.about-left'), aboutRight:select('.about-right'),
    aboutBottom:select('.about-bottom'), aboutHeading:select('.about-left .section-title'),
    work:select('.work'), workHeading:select('.work-heading'), workTitle:select('.work-heading h2'),
    experience:select('.experience'), expLeft:select('.experience-left'), expRight:select('.experience-right'),
    stat: select('.massive-stat'), counter:select('.counter'),
    manifesto:select('.manifesto'), manifestoLeft:select('.manifesto-left'),
    manifestoRight:select('.manifesto-right'), quote:select('.quote-square'),
    stack:select('.stack'), stackHeading:select('.stack-heading'), stackTitle:select('.stack-heading h2'),
    contact:select('.contact'), contactCopy:select('.contact-copy'), orb:select('.contact-orb-box'),
    contactBottom:select('.contact-bottom'), footer:select('.footer'), footerBig:select('.footer-big')
  };
  const projectRows=all('.project-row');
  const timelineItems=all('.timeline-item');
  const stackCards=all('.stack-card');
  const aboutCards=all('.about-mini-cards > div');
  const marqueeTracks=all('.tech-marquee .marquee-track');
  const motionEls = [el.aboutLeft,el.aboutRight,el.aboutBottom,el.workHeading,
    el.expLeft,el.expRight,el.manifestoLeft,el.manifestoRight,
    el.stackHeading,el.contactCopy,el.orb,el.contactBottom,...projectRows,...stackCards];
  motionEls.filter(Boolean).forEach(node=>node.classList.add('motion-managed'));
  
  // Independent letter flutter on the huge PORTFOLIO headline, not merely a fade.
  if (el.giant && !reduced) {
    const word = el.giant.textContent.trim();
    el.giant.innerHTML = [...word].map(ch => `<span class="letter">${ch}</span>`).join('');
  }
  // A small, unobtrusive readout that follows the currently scrubbed chapter.
  const chapter = document.createElement('aside');
  chapter.className='scroll-chapter';
  chapter.setAttribute('aria-hidden','true');
  chapter.innerHTML='<span class="num">01</span><div class="rail"><span></span></div><span class="text">INTRO / 07</span>';
  document.body.append(chapter);
  const chapters=[
    ['INTRO', el.stage],['ABOUT',el.about],['WORK',el.work],
    ['EXPERIENCE',el.experience],['MANIFESTO',el.manifesto],
    ['TOOLKIT',el.stack],['CONTACT',el.contact]
  ];
  document.documentElement.classList.add('cinematic-ready');
  
  // Sticky hero is a longer-than-viewport scene. Other scenes are scrubbed
  // between first-viewport entrance and the end of their visible area.
  let heights={},tops={},projectTops=[],chapterTops=[];
  let viewH=innerHeight, mobile=innerWidth<681;
  const portraitOrigin=()=>innerWidth<681?'translate(-50%,0)':innerWidth<=980?'translate(-50%,-18%)':innerWidth<=1250?'translate(-50%,-30%)':'translate(-50%,-36%)';
  let currentScroll=window.scrollY||0, targetScroll=currentScroll;
  let rafId=0;
  let activeChapter=-1;
  const absoluteTop = node => {
    let y=0;
    while(node && node instanceof HTMLElement) {y+=node.offsetTop;node=node.offsetParent;}
    return y;
  };
  const measure = () => {
    viewH = Math.max(innerHeight,1);mobile=innerWidth<681;
    for (const [key,node] of Object.entries(el)) {
      if(node && key!=='stage') {tops[key]=absoluteTop(node);heights[key]=node.offsetHeight;}
    }
    tops.stage=absoluteTop(stage);heights.stage=stage.offsetHeight;
    projectTops=projectRows.map(absoluteTop);
    chapterTops=chapters.map(c=>c[1]?absoluteTop(c[1]):Infinity);
    targetScroll=window.scrollY||0;
  };
  const enterProgress = (key, entering=.92, leaving=.15) => {
    const start=tops[key]-viewH*entering;
    const end=tops[key]+heights[key]-viewH*leaving;
    return clamp((currentScroll-start)/Math.max(1,end-start));
  };
  const oldStyles=new WeakMap();
  const set=(node,props)=>{
    if(!node)return;
    let old=oldStyles.get(node);
    if(!old){old=Object.create(null);oldStyles.set(node,old);}
    for(const [key,value] of Object.entries(props)){
      if(old[key]!==value){node.style[key]=value;old[key]=value;}
    }
  };
  const oldVars=new WeakMap();
  const setVar=(node,key,value)=>{
    if(!node)return;
    let old=oldVars.get(node);
    if(!old){old=Object.create(null);oldVars.set(node,old);}
    if(old[key]!==value){node.style.setProperty(key,value);old[key]=value;}
  };
  const near=key=>currentScroll+viewH*1.25>tops[key] && currentScroll<tops[key]+heights[key]+viewH*.8;
  const schedule=()=>{if (!rafId && !document.hidden) rafId=requestAnimationFrame(render);};
  const tf=(x=0,y=0,s=1,rot=0)=>`translate3d(${x}px,${y}px,0) scale(${s}) rotate(${rot}deg)`;
  function render() {
    rafId=0;
    // Use the browser's real scroll position without easing behind the page.
    // Damping made headings and project rows remain dim after quick scrolling.
    currentScroll=targetScroll;
    const pHero=mobile?clamp((currentScroll-tops.stage)/Math.max(1,heights.stage))*.52:clamp((currentScroll-tops.stage)/Math.max(1,heights.stage-viewH));
    // Hint to the compositor only for visible chapters. Persistent will-change
    // on every card was allocating off-screen layers and raising GPU memory use.
    for(const [key,node] of [['stage',stage],['about',el.about],['work',el.work],
      ['experience',el.experience],['manifesto',el.manifesto],['stack',el.stack],
      ['contact',el.contact],['footer',el.footer]]) {
      if(node){const shouldBeNear=near(key);if(node.classList.contains('motion-in-view')!==shouldBeNear)node.classList.toggle('motion-in-view',shouldBeNear);}
    }
    // BEGINNING: typographic zoom, separate letter lift, parallax portrait,
    // outward-sweeping introduction and collapsing 3D picture frames.
    if(near('stage')) {
    const heroS=smooth(.06,.94,pHero), heroExit=smooth(.52,.99,pHero);
    set(el.giant,{
      transform:mobile?`translate3d(0,${-heroS*30}px,0) scale(${1+heroS*.045})`:`translate3d(${-heroS*11}vw,${-heroS*11}vh,0) scale(${1+heroS*.54}) rotate(${-heroS*2.8}deg)`,
      opacity:String(1-heroExit*.91)
    });
    if(!simpleMotion){
      setVar(el.hero,'--hero-letter-shift',`${heroS*24}px`);
      setVar(el.hero,'--hero-glow',String(.3+heroS*.9));
      setVar(el.hero,'--hero-glow-scale',String(1+heroS*1.5));
    }
    if (!mobile) set(el.portrait,{
      transform:`${portraitOrigin()} translate3d(${heroS*4}vw,${heroS*11}vh,0) scale(${1+heroS*.13})`,
      opacity:String(1-heroExit*.98)
    });
    else set(el.portrait,{transform:`translate(-50%,${(-heroS*35).toFixed(1)}px)`,opacity:'1'});
    if(!mobile) set(el.left,{transform:tf(-heroS*220,heroS*55,1-heroS*.05),opacity:String(1-heroExit)});
    if(!mobile) set(el.right,{transform:tf(heroS*240,-heroS*65,1-heroS*.05),opacity:String(1-heroExit)});
    if(!mobile) set(el.eyebrow,{transform:tf(-heroS*100,-heroS*45),opacity:String(1-heroExit)});
    if(!mobile) set(el.heroBottom,{transform:tf(0,heroS*35),opacity:String(1-heroExit)});
    setVar(el.portrait,'--portrait-sheen',`${-140+pHero*340}%`);
    }

    // ABOUT: text emerges independently from opposite sides; the giant ghost
    if (!simpleMotion && near('about')) {
    // title glides behind the content and red underline is written by scroll.
    const a=enterProgress('about');
    const aIn=smooth(.03,.35,a), aOut=smooth(.84,1,a);
    set(el.aboutLeft,{transform:tf(lerp(-170,0,aIn)+aOut*-100,lerp(85,0,aIn),1),opacity:String(.7+.3*aIn*(1-aOut*.35))});
    set(el.aboutRight,{transform:tf(lerp(145,0,aIn)+aOut*95,lerp(150,0,aIn),1),opacity:String(.7+.3*aIn*(1-aOut*.3))});
    set(el.aboutBottom,{transform:tf(0,lerp(70,0,smooth(.35,.65,a))),opacity:String(.8+.2*smooth(.35,.7,a))});
    setVar(el.about,'--about-ghost-x',`${(1-a)*20-10}vw`);
    setVar(el.about,'--highlight-width',`${Math.round(100*smooth(.25,.67,a))}%`);
    if(el.aboutHeading)set(el.aboutHeading,{transform:`skewY(${lerp(3,0,aIn)}deg) translateY(${lerp(30,0,aIn)}px)`});
    aboutCards.forEach((c,i)=>{
      const t=smooth(.24+i*.11,.53+i*.11,a);
      setVar(c,'--about-card-y',`${(1-t)*76}px`);
      setVar(c,'--about-card-rotate',`${(1-t)*11}deg`);
      set(c,{opacity:String(.78+.22*t)});
    });

    }

    // WORK: title scrubs across as the sticky project slides arrive;
    if (!simpleMotion && near('work')) {
    // each project rises, then physically recedes/tilts behind the next.
    const w=enterProgress('work');
    const wIn=smooth(0,.24,w),wOut=smooth(.73,1,w);
    set(el.workHeading,{transform:`translate3d(${(1-wIn)*-110+wOut*-170}px,${(1-wIn)*90-wOut*80}px,0) scale(${1+(1-wIn)*.08})`,opacity:String(.7+.3*wIn*(1-wOut*.9))});
    if(el.workTitle)set(el.workTitle,{transform:`skewY(${(1-wIn)*-4}deg)`});
    projectRows.forEach((row,i)=>{
      const top=projectTops[i];
      const incoming=smooth(top-viewH*.95,top-viewH*.17,currentScroll);
      const moveX=(1-incoming)*(i%2?72:-72);
      const moveY=(1-incoming)*55;
      set(row,{transform:`translate3d(${moveX}px,${moveY}px,0)`,opacity:String(.78+.22*incoming)});
    });

    }

    // RESULTS: 40% is a live scroll counter, and career rows enter in order.
    if (!simpleMotion && near('experience')) {
    const e=enterProgress('experience');
    const eIn=smooth(.02,.29,e),eOut=smooth(.82,1,e);
    set(el.expLeft,{transform:tf(lerp(-155,0,eIn),lerp(90,0,eIn)),opacity:String(.7+.3*eIn*(1-eOut*.45))});
    set(el.expRight,{transform:tf(lerp(175,0,eIn),lerp(120,0,eIn)),opacity:String(.7+.3*eIn*(1-eOut*.4))});
    if(el.counter){const n=String(Math.round(40*smooth(.15,.57,e)));if(el.counter.textContent!==n)el.counter.textContent=n;}
    if(el.stat)set(el.stat,{transform:`translate3d(0,${(1-eIn)*50}px,0) scale(${.72+eIn*.28})`});
    timelineItems.forEach((it,i)=>{
      const t=smooth(.16+i*.085,.40+i*.085,e);
      set(it,{opacity:String(.78+.22*t), transform:`translate3d(${(1-t)*80}px,${(1-t)*28}px,0) rotateX(${(1-t)*8}deg)`});
    });

    }

    // MANIFESTO: asymmetric rotations and red card punch-in.
    if (!simpleMotion && near('manifesto')) {
    const m=enterProgress('manifesto');
    const mIn=smooth(.05,.43,m),mOut=smooth(.83,1,m);
    set(el.manifestoLeft,{transform:tf((1-mIn)*-180,mOut*-70,1+(1-mIn)*.07),opacity:String(.75+.25*mIn*(1-mOut*.25))});
    set(el.manifestoRight,{transform:tf((1-mIn)*200,(1-mIn)*155-mOut*65),opacity:String(.75+.25*mIn*(1-mOut*.25))});
    set(el.quote,{transform:`perspective(1000px) rotate(${(1-mIn)*15-mOut*6}deg) rotateY(${(1-mIn)*-20}deg) scale(${.65+mIn*.35})`});
    // Glow remains static: no repaint-heavy animated gradient.

    }

    // TOOLKIT: six cards spring forward in two staggered rows, with extra
    if (!simpleMotion && near('stack')) {
    // parallax in the monolithic TOOLKIT headline.
    const s=enterProgress('stack');
    const sIn=smooth(.04,.35,s),sOut=smooth(.85,1,s);
    set(el.stackHeading,{transform:tf((1-sIn)*-140,(1-sIn)*100-sOut*50,1),opacity:String(.8+.2*sIn*(1-sOut*.5))});
    if(el.stackTitle)set(el.stackTitle,{transform:`translate3d(${sOut*-80}px,0,0) skewY(${(1-sIn)*-5}deg)`});
    stackCards.forEach((card,i)=>{
      const t=smooth(.16+(i%3)*.08+Math.floor(i/3)*.09,.45+(i%3)*.08+Math.floor(i/3)*.09,s);
      const x=(1-t)*(i%2?-125:125);
      const y=(1-t)*(95+Math.floor(i/3)*30);
      const rot=(1-t)*(i%2?-12:12);
      set(card,{transform:`perspective(1100px) translate3d(${x}px,${y}px,0) rotateY(${rot}deg) rotateX(${(1-t)*18}deg) scale(${.82+t*.18})`,opacity:String(.8+.2*t)});
    });

    }

    // CONTACT: particle galaxy grows into the finale. No rasterized fake orb.
    if (!simpleMotion && near('contact')) {
    const c=enterProgress('contact');
    const cIn=smooth(.02,.38,c),cOut=smooth(.86,1,c);
    set(el.contactCopy,{transform:tf((1-cIn)*-170,(1-cIn)*90-cOut*30),opacity:String(.8+.2*cIn*(1-cOut*.15))});
    set(el.orb,{transform:`translate3d(${(1-cIn)*180}px,${(1-cIn)*100}px,0) scale(${.38+cIn*.62+cOut*.2}) rotate(${(1-cIn)*-32+cOut*9}deg)`,opacity:String(.65+cIn*.35)});
    set(el.contactBottom,{transform:tf(0,(1-cIn)*75),opacity:String(.8+.2*cIn)});
    // Radial gradients stay static; only GPU composited transform/opacity move.

    }

    // Footer is independent from the contact scene and updates whenever it enters view.
    if (near('footer')) {const f=enterProgress('footer');if(el.footerBig){const t=smooth(0,.75,f);set(el.footerBig,{transform:`translate3d(0,${((1-t)*22).toFixed(1)}px,0) scale(${(.98+.02*t).toFixed(3)})`,opacity:String(.2+smooth(0,.8,f)*.8)});}}

    // Real scroll-linked side rail. It updates in both directions, not once.
    let active=0;
    for(let i=0;i<chapters.length;i++) {
      if(currentScroll>chapterTops[i]-viewH*.5) active=i;
    }
    const key=active===0?'stage':Object.entries(el).find(([k,v])=>v===chapters[active][1])?.[0] || 'contact';
    if(active!==activeChapter){chapter.querySelector('.num').textContent=String(active+1).padStart(2,'0');chapter.querySelector('.text').textContent=`${chapters[active][0]} / 07`;activeChapter=active;}
    const fill=active===0?pHero:enterProgress(key);
    setVar(chapter,'--rail-fill',`${(100*fill).toFixed(1)}%`);
    set(chapter,{opacity:String(active===0?.65:1)});

  }
  if(reduced){
    // Readable normal flow and no scroll-linked transformations for accessibility.
    chapter.remove();measure();return;
  }
  addEventListener('scroll',()=>{targetScroll=window.scrollY||0;schedule();},{passive:true});
  addEventListener('resize',()=>{measure();targetScroll=window.scrollY||0;schedule();},{passive:true});
  addEventListener('visibilitychange',()=>{if(!document.hidden){targetScroll=window.scrollY||0;schedule();}});
  document.fonts?.ready?.then(()=>{measure();schedule()}).catch(()=>{});
  addEventListener('load',measure,{once:true});
  // Hash navigation should go to the beginning of pinned scenes and not to
  // the sticky child's apparent current top.
  all('a[href="#home"]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});
    history.replaceState(null,'',location.pathname+location.search+'#home');
  }));
  measure();schedule();
})();

/* --- hero-fit.js --- */
/* Cinematic title viewport fit — use canvas glyph metrics, never animate font
   size during a measurement. Handles webfont swaps, reduced motion, resize. */
(() => {
  'use strict';
  const wrap = document.querySelector('.hero-big-wrap');
  const title = document.querySelector('.hero-giant');
  if (!wrap || !title) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let scheduled = 0;
  const fit = () => {
    scheduled = 0;
    if (!wrap.isConnected || !title.isConnected) return;
    const available = wrap.clientWidth;
    if (available <= 0) return;
    const cs = getComputedStyle(title);
    const family = cs.fontFamily;
    const weight = cs.fontWeight;
    const italic = cs.fontStyle;
    const word = title.textContent.trim();
    const chars = [...word];
    if (!chars.length) return;
    // Mirror the split-letter layout, so kerning across distinct spans does
    // not cause the mobile title to overflow even by a few pixels.
    ctx.font = `${italic} ${weight} 100px ${family}`;
    const glyphWidth = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
    const currentSize = parseFloat(cs.fontSize) || 100;
    const currentSpace = parseFloat(cs.letterSpacing) || 0;
    const letterSpacingAt100 = 100 * currentSpace / currentSize;
    const unitWidth = glyphWidth + letterSpacingAt100 * chars.length;
    if (!Number.isFinite(unitWidth) || unitWidth <= 0) return;
    const fontPx = 100 * Math.min(available,window.innerWidth) / unitWidth * .955;
    title.style.setProperty('--hero-fitted-size', `${Math.max(14,fontPx).toFixed(3)}px`);
  };
  const requestFit = () => {
    if (scheduled) cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(fit);
  };
  fit();
  addEventListener('resize',requestFit,{passive:true});
  addEventListener('orientationchange',requestFit,{passive:true});
  if(typeof ResizeObserver !== 'undefined') new ResizeObserver(requestFit).observe(wrap);
  if(document.fonts){
    document.fonts.ready.then(requestFit).catch(()=>{});
    document.fonts.addEventListener?.('loadingdone',requestFit);
  }
})();

/* --- layout-fit.js --- */
/* V7: fit other display headings the same way as PORTFOLIO, using their actual
   rendered scroll widths. Only shrink when necessary; never enlarge designs. */
(() => {
  'use strict';
  const targets = [
    {selector:'.hero-name', min:40},
    {selector:'.section-title', min:28},
    {selector:'.projects-reference .project-copy h3', min:24},
    {selector:'.stack-card h3', min:16},
    {selector:'.footer-big', min:18, safety:.935},
    {selector:'.quote-square>div', min:20}
  ];
  let scheduled=0;
  let running=false;
  const fit = () => {
    scheduled=0;
    if(running) return;
    running=true;
    const list = targets.flatMap(({selector,min,safety}) =>
      [...document.querySelectorAll(selector)].map(el=>({el,min,safety:safety||.985})));
    // Reset first: otherwise every successive resize permanently shrinks text.
    for (const {el} of list) el.style.removeProperty('font-size');
    for (const {el,min,safety} of list){
      if(getComputedStyle(el).display==='none') continue;
      const base = parseFloat(getComputedStyle(el).fontSize)||36;
      for(let i=0;i<7;i++){
        const available=el.clientWidth;
        const used=el.scrollWidth;
        if(available<=0 || used<=available*safety+1) break;
        const actual=parseFloat(getComputedStyle(el).fontSize)||base;
        const target=Math.max(min,actual*Math.min(.985,(available*safety)/Math.max(1,used)));
        if(target>=actual-.15)break;
        el.style.setProperty('font-size',target.toFixed(2)+'px','important');
      }
    }
    running=false;
  };
  const schedule=()=>{if(scheduled) cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(fit);};
  fit();
  addEventListener('resize',schedule,{passive:true});
  addEventListener('orientationchange',schedule,{passive:true});
  addEventListener('load',schedule,{once:true});
  if(document.fonts){document.fonts.ready.then(schedule).catch(()=>{});document.fonts.addEventListener?.('loadingdone',schedule);}
  const project=document.getElementById('projectDialog');
  if(project && typeof MutationObserver!=='undefined')new MutationObserver(schedule).observe(project,{attributes:true,attributeFilter:['open']});
})();

/* --- final-polish.js --- */
/* V9: progressive user-experience enhancements, intentionally independent of
   the core scroll engine and safe if animations are disabled. */
(() => {
  'use strict';
  const root=document.documentElement;
  const economical=document.documentElement.dataset.motionProfile==='economical';
  root.classList.toggle('economical-device',economical);
  // The original URL or a custom hash may be loaded mid-document; restore the
  // right section after webfonts/layout have settled without jumping repeatedly.
  const isInsidePage=hash=>/^#[A-Za-z][A-Za-z0-9_-]*$/.test(hash) && !!document.querySelector(hash);
  addEventListener('load',()=>{
    if(location.hash && isInsidePage(location.hash)) {
      const el=document.querySelector(location.hash);
      if(el && Math.abs(el.getBoundingClientRect().top)>window.innerHeight*1.5) {
        el.scrollIntoView({behavior:'instant',block:'start'});
      }
    }
  },{once:true});
  if(matchMedia('(hover:none)').matches) {const hint=document.querySelector('.orb-instruction');if(hint)hint.textContent='IDEAS IN MOTION / KEEP EXPLORING ↗';}
  // Keyboard users can close the mobile navigation reliably and return focus.
  const nav=document.querySelector('#nav'),toggle=document.querySelector('#mobileToggle');
  if(nav&&toggle) {
    const mq=matchMedia('(max-width:980px)');
    nav.addEventListener('keydown',e=>{
      if(e.key==='Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');
        toggle.focus();
      }
    });
    // Avoid stranded expanded state when rotating into desktop.
    mq.addEventListener?.('change',e=>{
      if(!e.matches){nav.classList.remove('open');toggle.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}
    });
  }
  // Preload only the first chosen project illustration on likely next use,
  // while not fetching all four on slow connections.
  if(!economical && 'IntersectionObserver' in window) {
    const row=document.querySelector('.project-row[data-project="kirana"]');
    if(row) {
      const io=new IntersectionObserver(entries=>{
        if(entries[0].isIntersecting){
          const im=new Image(); im.decoding='async'; im.src='assets/kirana-dashboard.svg';io.disconnect();
        }
      },{rootMargin:'450px'});
      io.observe(row);
    }
  }
})();

/* --- polish-v10.js --- */
/* V10: explicit interaction hygiene, no animation library or perpetual loop. */
(()=>{
  'use strict';
  const nav=document.querySelector('#nav');
  const toggle=document.querySelector('#mobileToggle');
  const mq=matchMedia('(max-width:980px)');
  const closeMenu=({restoreFocus=false}={})=>{
    if(!nav||!toggle||!nav.classList.contains('open'))return;
    nav.classList.remove('open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open menu');
    if(restoreFocus)toggle.focus({preventScroll:true});
  };
  // Tapping outside the mobile menu shouldn't leave it blocking the page.
  document.addEventListener('pointerdown',event=>{
    if(!mq.matches||!nav?.classList.contains('open'))return;
    if(!nav.contains(event.target)&&!toggle.contains(event.target))closeMenu();
  },{passive:true});
  // Main heading was visually prominent but absent from the semantic outline.
  const pageHeading=document.querySelector('.hero-name');
  if(pageHeading?.tagName==='H1')pageHeading.setAttribute('aria-label','Gaurav Sharma');
  // Ensure that hidden intro buttons are not reachable through keyboard tabbing.
  const loader=document.querySelector('#loader');
  const introObserver=new MutationObserver(()=>{
    if(loader?.classList.contains('hidden')){
      loader.inert=true;
      loader.setAttribute('aria-hidden','true');
      introObserver.disconnect();
    }
  });
  if(loader?.classList.contains('hidden')){
    loader.inert=true;loader.setAttribute('aria-hidden','true');
  }else if(loader){introObserver.observe(loader,{attributes:true,attributeFilter:['class']});}
  // Escape should restore keyboard focus to the menu trigger as well as close it.
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&mq.matches&&nav?.classList.contains('open'))closeMenu({restoreFocus:true});
  });
  // Stop the browser from ever revealing the disabled loader after bfcache restore.
  addEventListener('pageshow',()=>{
    if(loader?.classList.contains('hidden')){
      loader.inert=true;loader.setAttribute('aria-hidden','true');
    }
  });
})();

/* --- theme-v11.js --- */
/* V11 — reversible, accessible, persisted appearance preference. */
(()=>{
  'use strict';
  const root=document.documentElement;
  const button=document.getElementById('themeToggle');
  if(!button)return;
  const storeKey='gs-portfolio-theme';
  const meta=document.querySelector('meta[name="theme-color"]');
  function render(theme, announce=false){
    const light=theme==='light';
    root.dataset.theme=light?'light':'dark';
    root.style.colorScheme=light?'light':'dark';
    button.setAttribute('aria-pressed',String(light));
    button.setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');
    button.title=light?'Switch to dark theme':'Switch to light theme';
    const icon=button.querySelector('.theme-icon');
    const label=button.querySelector('.theme-label');
    if(icon)icon.textContent=light?'☾':'☀';
    if(label)label.textContent=light?'DARK':'LIGHT';
    if(meta)meta.setAttribute('content',light?'#f8f7f5':'#09090a');
    if(announce){
      const toast=document.getElementById('toast');
      // No extra DOM changes for screen readers; the button label communicates state.
      if(toast && toast.classList.contains('show'))toast.classList.remove('show');
    }
  }
  const initial=root.dataset.theme==='light'?'light':'dark';
  render(initial);
  button.addEventListener('click',()=>{
    const theme=root.dataset.theme==='light'?'dark':'light';
    render(theme,true);
    try{localStorage.setItem(storeKey,theme)}catch(e){}
  });
  window.addEventListener('storage',(event)=>{
    if(event.key===storeKey)render(event.newValue==='light'?'light':'dark');
  });
})();

/* --- performance-v13.js --- */
(()=>{
'use strict';
// Pause the two infinite marquee tracks when they are out of view.
if('IntersectionObserver' in window){
  const tracks=document.querySelectorAll('.tech-marquee');
  const visibilityObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)entry.target.classList.toggle('is-visible',entry.isIntersecting);
  },{rootMargin:'120px'});
  tracks.forEach(t=>visibilityObserver.observe(t));
}
const btn=document.querySelector('#motionControl');
const label=document.querySelector('#motionLabel');
if(!btn||!label)return;
let choice=document.documentElement.dataset.motionChoice||'auto';
const labels={auto:'AUTO',smooth:'SMOOTH',full:'FULL'};
const render=()=>{
  label.textContent=labels[choice]||'AUTO';
  const desc=`Motion quality: ${labels[choice]||'AUTO'}. Activate to select ${labels[choice==='auto'?'smooth':choice==='smooth'?'full':'auto']}.`;
  btn.setAttribute('aria-label',desc);
  btn.title=desc;
};
btn.addEventListener('click',()=>{
  choice=choice==='auto'?'smooth':choice==='smooth'?'full':'auto';
  try{localStorage.setItem('gs-motion-choice',choice);}catch(_){/* storage optional */}
  // The active choreography is intentionally initialized just once. Reloading
  // avoids partially switching hundreds of scroll-linked transforms mid-frame.
  location.reload();
});
render();
})();