/* Capture every shot in the manifest to a JPEG sequence.

   The harness owns the clock (see lib.seizeClock): the game's own loop cannot
   reschedule itself, so every frame is exactly 1/30s of world time and a re-run
   of a shot is identical to the last one. That determinism is why a retry
   VARIES gap/pre — the same timing reproduces the same death, every time.

   ⛔ PNG was the entire frame cost (922ms vs 128ms for JPEG at the same scale).
   Frames are shot at 1080x1920 and land in the 1920x1080 frame at 588x1044, so
   they are downsampled ~1.8x on the way in; q94 JPEG is invisible after that.
   ⛔ Fresh page per shot. Sharing one page let a previous run's game-over state
   bleed into the next shot's first frame.
   ⛔ SEIZE BEFORE START: show('s-play') ends with requestAnimationFrame(loop),
   so starting a level with the real rAF live hands the new game to the game's
   own loop for however long the next await takes. */
const L=require('./lib.js'); const PILOT=require('./director.js');
const SHOTS=require('./shots.js');
const OUT=__dirname+'/../frames';
const ONLY=(process.argv[2]||'').split(',').filter(Boolean);
const Q=94;

function shotDir(id){ const d=OUT+'/'+id; L.fs.mkdirSync(d,{recursive:true}); return d; }
function clean(d){ for(const f of L.fs.readdirSync(d)) if(/\.jpg$/.test(f)) L.fs.unlinkSync(d+'/'+f); }
const pad=n=>String(n).padStart(5,'0');

const baseProg=L.baseProg;

/* ⛔ "the element exists" is not evidence. The daily beat passed its check with
   the card fully occluded by a badge modal. This asks the SCREEN: is the thing
   on stage, inside the viewport, and is the topmost pixel at its centre part of
   it (elementFromPoint), rather than something covering it. */
async function assertVisible(p, sel, label){
  const v=await p.evaluate((sel)=>{
    const e=document.querySelector(sel); if(!e) return {ok:false,why:'no element'};
    const r=e.getBoundingClientRect();
    if(r.width<8||r.height<8) return {ok:false,why:'zero size'};
    if(r.bottom<0||r.top>innerHeight) return {ok:false,why:'off screen top '+Math.round(r.top)+' h '+Math.round(r.height)};
    const cx=r.left+r.width/2, cy=Math.min(innerHeight-2, Math.max(2, r.top+r.height/2));
    const hit=document.elementFromPoint(cx,cy);
    const covered=!(hit===e||e.contains(hit)||(hit&&hit.contains(e)));
    return {ok:!covered, why:covered?('covered by '+(hit?(hit.tagName+'#'+hit.id+'.'+hit.className).slice(0,60):'null')):null,
            top:Math.round(r.top), h:Math.round(r.height)};
  }, sel);
  if(!v.ok) return {ok:false, why:label+' not visible: '+v.why};
  return {ok:true};
}
/* close anything the game threw up in front of the shot */
async function dismissModals(p){
  for(let i=0;i<6;i++){
    const hit=await p.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      const el=Array.from(document.querySelectorAll('button,.btn')).filter(vis)
        .find(e=>/^(Nice|Claim|Collect|OK|Continue|Got it|Close|✕)$/i.test((e.innerText||'').trim()));
      if(el){ el.click(); return (el.innerText||'').trim(); } return null;
    });
    if(!hit) return i;
    await L.sleep(260);
  }
  return 6;
}
/* bring an element into view inside its own scroller, rAF-free */
async function scrollTo(p, sel){
  await p.evaluate((sel)=>{
    const e=document.querySelector(sel); if(!e) return;
    let sc=e.parentElement;
    while(sc && sc.scrollHeight<=sc.clientHeight+4) sc=sc.parentElement;
    if(!sc) return;
    sc.style.scrollBehavior='auto';
    sc.scrollTop = e.offsetTop - sc.clientHeight*0.5 + e.offsetHeight*0.5;
  }, sel);
}

async function frameLoop(p, dir, n, fn){
  for(let f=0;f<n;f++){
    const st=await fn(f);
    await p.screenshot({path:dir+'/f'+pad(f)+'.jpg', type:'jpeg', quality:Q, captureBeyondViewport:false});
    if(st && st.abort) return st;
  }
  return {ok:true};
}

/* ---------- gameplay ---------- */
async function shootPlay(b, sh, attempt){
  const gap = sh.gap + (attempt%3) - 1;              // vary the rhythm per attempt
  const pre = sh.pre + attempt*7;                    // and the entry point
  const p=await L.boot(b,{prog:baseProg(sh.chr?{char:sh.chr}:null)});
  await p.evaluate(PILOT);
  await L.seizeClock(p);
  const start=await p.evaluate((lv,w)=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',lv);
    __PILOT.reset(); if(w) SH_DEV.setWeather(w);
    const g=SH_DEV.state(); return {phase:g&&g.phase, r:g&&g.cr.r, want:(lv-1)*16}; }, sh.lvl, sh.weather||null);
  if(!start||start.phase!=='play'||start.r!==start.want){ await p.close(); return {ok:false,why:'bad start '+JSON.stringify(start)}; }
  /* pre-roll, not written */
  const rolled=await p.evaluate((n,gap)=>{ let s=null;
    for(let f=0;f<n;f++){ s=__PILOT.tick(1/30,{frame:f,gap:gap,stall:30}); if(s.phase!=='play') return {died:f,cause:s.cause}; }
    return {ok:true, r:s.r, combo:s.combo}; }, pre, gap);
  if(rolled.died!=null && !sh.wantDeath){ await p.close(); return {ok:false,why:'died in pre-roll at '+rolled.died+' ('+rolled.cause+')'}; }
  /* the power-up beats: write the pickup onto the row ahead through the game's
     own lane object, so the grab that follows is a real collection */
  if(sh.power) await p.evaluate(k=>{ const g=SH_DEV.state(); const L2=SH_DEV.laneAt(g.cr.r+1);
    L2.power={x:g.cr.x, kind:k}; }, sh.power);
  const dir=shotDir(sh.id); clean(dir);
  let died=null, seen={};
  const res=await frameLoop(p, dir, sh.frames, async f=>{
    const s=await p.evaluate((f,gap)=>__PILOT.tick(1/30,{frame:f,gap:gap,stall:30}), pre+f, gap);
    if(s.phase!=='play' && died==null) died=f;
    seen.combo=Math.max(seen.combo||0,s.combo||0); seen.lastLane=s.lane;
    return {};
  });
  await p.close();
  if(died!=null && !sh.wantDeath) return {ok:false,why:'died mid-shot at frame '+died};
  return {ok:true, info:'maxCombo '+(seen.combo||0)+(sh.power?(' power '+sh.power):'')};
}

/* ---------- the death, and the card it produces ---------- */
/* ⛔ The pre-roll for this one cannot be a guess. The first pass hard-coded
   pre:288 from a probe run under different entry conditions and burned all six
   retries reporting "died too early" while walking the pre-roll further AWAY
   from the truth. A death shot has to FIND its death: play the level with
   rendering off until it dies, then rewind and shoot the seconds around it. */
async function shootDeath(b, sh, attempt){
  const gap=sh.gap+(attempt%3)-1;
  const scout=await L.boot(b,{prog:baseProg()});
  await scout.evaluate(PILOT); await L.seizeClock(scout);
  await scout.evaluate(lv=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',lv); __PILOT.reset(); }, sh.lvl);
  const found=await scout.evaluate(g=>{ let s=null;
    for(let f=0;f<900;f++){ s=__PILOT.tick(1/30,{frame:f,gap:g,stall:30});
      if(s.phase!=='play') return {at:f, cause:s.cause, combo:s.combo}; }
    return {at:null}; }, gap);
  await scout.close();
  if(found.at==null) return {ok:false, why:'level '+sh.lvl+' at gap '+gap+' never died in 900 frames'};
  /* land the death ~40% into the cut so the approach reads and the card lands */
  const pre=Math.max(30, found.at-Math.round(sh.frames*0.42));
  const p=await L.boot(b,{prog:baseProg()});
  await p.evaluate(PILOT); await L.seizeClock(p);
  await p.evaluate(lv=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',lv); __PILOT.reset(); }, sh.lvl);
  const roll=await p.evaluate((n,g)=>{ let s=null;
    for(let f=0;f<n;f++){ s=__PILOT.tick(1/30,{frame:f,gap:g,stall:30}); if(s.phase!=='play') return {died:f}; }
    return {ok:true,combo:s.combo}; }, pre, gap);
  if(roll.died!=null){ await p.close(); return {ok:false,why:'rewind desynced, died at '+roll.died+' (wanted '+found.at+')'}; }
  const dir=shotDir(sh.id); clean(dir);
  let deadAt=null, card=false;
  await frameLoop(p, dir, sh.frames, async f=>{
    const s=await p.evaluate((f,g,t)=>{ const r=__PILOT.tick(1/30,{frame:f,gap:g,stall:30});
      window.__pump(t);            // safe: discards the queue while a run is live
      r.screen=document.querySelector('#s-go.on')?'go':null; return r; }, pre+f, gap, 1000+f*33);
    if(s.phase!=='play' && deadAt==null) deadAt=f;
    if(s.screen==='go') card=true;
    return {};
  });
  await p.close();
  if(deadAt==null) return {ok:false, why:'never died inside the window'};
  return {ok:true, info:'"'+found.cause+'" at trail '+found.combo+'; scout death abs '+found.at
    +', pre '+pre+', wanted frame '+(found.at-pre)+', got frame '+deadAt+' of '+sh.frames
    +(card?', card reached':', CARD NEVER SHOWED')};
}

/* ---------- level select, scrolled ---------- */
async function shootLevels(b, sh){
  const p=await L.boot(b,{prog:baseProg()});
  await L.seizeClock(p);
  /* ⛔ #lv-list IS the scroller (overflow-y:auto in its own rule); .pad is not,
     and scrolling .pad moved nothing while the shot still reported OK — a green
     signal on a dead screen. It also carries scroll-behavior:smooth, which
     animates on rAF, and we hold rAF, so every write would have been swallowed. */
  const info=await p.evaluate(()=>{ SH_DEV.setAdvMax(100); SH_DEV.screen('s-levels'); SH_DEV.renderLevels();
    const h=document.getElementById('lv-list'); h.style.scrollBehavior='auto';
    return {groups:h.children.length, scrollH:h.scrollHeight, clientH:h.clientHeight,
      scrollable:h.scrollHeight-h.clientHeight}; });
  if(info.scrollable<200){ await p.close(); return {ok:false, why:'level list does not scroll '+JSON.stringify(info)}; }
  /* ⛔ scrolling to scrollHeight overshoots past level 100 into the locked
     "QUEEN ANNE 2" loop chapter, and the spec ends this beat ON 100. Find the
     cell and stop there. Covering the whole list in 4s also ran at ~2.5
     chapters a second, which nobody can read; starting partway up keeps it near
     one chapter a second while still opening on a chapter header. */
  const stop=await p.evaluate(()=>{
    const h=document.getElementById('lv-list');
    const cell=Array.from(h.querySelectorAll('*')).filter(e=>!e.children.length)
      .find(e=>(e.textContent||'').trim()==='100');
    const host=cell?cell.closest('.lv-cell')||cell:null;
    const max=h.scrollHeight-h.clientHeight;
    const want=host?(host.offsetTop-h.clientHeight*0.62+host.offsetHeight):max;
    return {end:Math.max(0,Math.min(max,want)), found:!!host, max:max};
  });
  if(!stop.found){ await p.close(); return {ok:false, why:'could not find the level 100 cell to stop on'}; }
  const START=Math.max(0, stop.end-1180);
  const dir=shotDir(sh.id); clean(dir);
  await frameLoop(p, dir, sh.frames, async f=>{
    await p.evaluate((f,n,a,b2)=>{ const h=document.getElementById('lv-list');
      /* smoothstep: dwell at both ends so the first chapter name and level 100
         are both readable, and spend the speed in the middle */
      const t=f/(n-1), e=t*t*(3-2*t);
      h.scrollTop=a+(b2-a)*e; }, f, sh.frames, START, stop.end);
    return {};
  });
  await p.close();
  return {ok:true, info:'scrolled '+Math.round(START)+' to '+Math.round(stop.end)+' of '+Math.round(stop.max)+', stops on level 100'};
}

/* ---------- the wardrobe ---------- */
async function shootCollection(b, sh){
  const p=await L.boot(b,{prog:baseProg()});
  await L.seizeClock(p);
  const info=await p.evaluate(()=>{ SH_DEV.screen('s-skins'); SH_DEV.bin();
    const t=document.getElementById('tab-coll'); if(t) t.click();     // ⛔ Collection, never Shop: the Shop tab shows prices
    const h=document.getElementById('cos-row');
    const sc=h.closest('.pad')||h.parentElement;
    return {cos:h.children.length, crit:(document.getElementById('crit-row')||{children:[]}).children.length,
      pane:document.getElementById('coll-pane')?'coll-pane':'?', scrollH:sc.scrollHeight, clientH:sc.clientHeight}; });
  await dismissModals(p);
  const vis=await assertVisible(p,'#cos-row','costume row');
  if(!vis.ok){ await p.close(); return {ok:false, why:vis.why}; }
  const dir=shotDir(sh.id); clean(dir);
  await frameLoop(p, dir, sh.frames, async f=>{
    await p.evaluate((f,n)=>{ const h=document.getElementById('cos-row');
      const sc=h.closest('.pad')||h.parentElement;
      const max=Math.max(0, sc.scrollHeight-sc.clientHeight);
      const t=f/(n-1); sc.scrollTop=max*Math.min(1,t*1.15); }, f, sh.frames);
    return {};
  });
  await p.close();
  return {ok:true, info:JSON.stringify(info)};
}

/* ---------- the Daily result card ---------- */
async function shootDaily(b, sh){
  const p=await L.boot(b,{prog:baseProg()});
  await p.evaluate(PILOT); await L.seizeClock(p);
  const st=await p.evaluate(()=>{ SH_DEV.screen('s-play'); SH_DEV.start('daily'); __PILOT.reset();
    SH_DEV.dailySet({streak:7, bestStreak:11});
    const g=SH_DEV.state(); return {phase:g&&g.phase, mode:g&&g.mode, official:!!g.dailyOfficial}; });
  if(!st||st.phase!=='play') { await p.close(); return {ok:false,why:'daily did not start '+JSON.stringify(st)}; }
  const roll=await p.evaluate(()=>{ let s=null, best=0;
    for(let f=0;f<620;f++){ s=__PILOT.tick(1/30,{frame:f,gap:11,stall:30}); if(s.phase!=='play') break; best=s.r; }
    return {r:best, phase:s.phase}; });
  /* however the run ended, end it: the card is built from the finished run */
  await p.evaluate(()=>{ const g=SH_DEV.state(); if(g&&g.phase==='play') SH_DEV.hurt('squish'); });
  /* let the death resolve into the card, then clear anything standing in front
     of it and put the Daily block strip on screen before the shutter opens */
  for(let i=0;i<40;i++){ await p.evaluate(t=>{ try{ SH_DEV.step(1/30); SH_DEV.render(); }catch(e){} window.__pump(t); }, 900+i*33); }
  const closed=await dismissModals(p);
  await scrollTo(p,'#go-daily');
  const vis=await assertVisible(p,'#go-dl-strip','daily block strip');
  if(!vis.ok){ await p.close(); return {ok:false, why:vis.why+' (closed '+closed+' modals)'}; }
  const dir=shotDir(sh.id); clean(dir);
  let card=false;
  await frameLoop(p, dir, sh.frames, async f=>{
    const s=await p.evaluate(t=>{ try{ SH_DEV.step(1/30); SH_DEV.render(); }catch(e){}
      window.__pump(t);
      const d=document.getElementById('go-daily');
      return {go:!!document.querySelector('#s-go.on'), daily:!!(d&&d.style.display!=='none'),
              strip:d?d.querySelectorAll('#go-dl-strip *').length:-1}; }, 1000+f*33);
    if(s.go) card=true; return {};
  });
  const still=await assertVisible(p,'#go-dl-strip','daily block strip');
  const end=await p.evaluate(()=>{ const d=document.getElementById('go-dl-strip');
    return {no:(document.getElementById('go-dl-no')||{}).textContent, blocks:d?d.children.length:0}; });
  await p.close();
  if(!still.ok) return {ok:false, why:'strip was covered by the last frame: '+still.why};
  return {ok:true, info:'rows '+roll.r+', '+end.no+', '+end.blocks+' blocks, strip visible start and end'};
}

/* ---------- level 100 cleared: the feast ---------- */
async function shootClear(b, sh){
  const p=await L.boot(b,{prog:baseProg()});
  await p.evaluate(PILOT); await L.seizeClock(p);
  const st=await p.evaluate(lv=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',lv); __PILOT.reset();
    /* park below the level's gate with the goals met, then hop through it */
    return SH_DEV.advToGate(6,6); }, sh.lvl);
  /* run the celebration out to the clear card, then clear the unlock reveals
     ("Wizothy", "The Trash King") that were photographed sitting on top of it */
  for(let i=0;i<105;i++){ await p.evaluate(t=>{ try{ SH_DEV.step(1/30); SH_DEV.render(); }catch(e){} window.__pump(t); }, 900+i*33); }
  const closed=await dismissModals(p);
  const vis=await assertVisible(p,'#s-clear.on','level clear card');
  if(!vis.ok){ await p.close(); return {ok:false, why:vis.why+' (closed '+closed+' modals)'}; }
  const dir=shotDir(sh.id); clean(dir);
  let clear=false;
  await frameLoop(p, dir, sh.frames, async f=>{
    const s=await p.evaluate(t=>{ try{ SH_DEV.step(1/30); SH_DEV.render(); }catch(e){}
      window.__pump(t);
      return {clear:!!document.querySelector('#s-clear.on')}; }, 1000+f*33);
    if(s.clear) clear=true; return {};
  });
  const still=await assertVisible(p,'#s-clear.on','level clear card');
  await p.close();
  if(!still.ok) return {ok:false, why:'clear card covered at the end: '+still.why};
  return {ok:true, info:'stars '+st.stars+', feasts '+st.feasts+', closed '+closed+' reveals, card clean start and end'};
}

const KIND={play:shootPlay, death:shootDeath, levels:shootLevels, collection:shootCollection,
            daily:shootDaily, clear:shootClear};

(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const report=[];
 for(const sh of SHOTS){
  if(ONLY.length && !ONLY.includes(sh.id) && !ONLY.includes('beat'+sh.beat)) continue;
  if(sh.kind==='endcard'){ console.log(sh.id.padEnd(16),'skipped here (built by endcard.js)'); continue; }
  const fn=KIND[sh.kind]; if(!fn){ console.log(sh.id,'no handler for kind',sh.kind); continue; }
  let r=null;
  const tries=(sh.kind==='play'||sh.kind==='death')?6:1;
  for(let a=0;a<tries;a++){
   const t0=Date.now();
   try{ r=await fn(b,sh,a); }catch(e){ r={ok:false,why:'threw: '+(e.message||e)}; }
   if(r.ok){ console.log(sh.id.padEnd(16),'OK  '+sh.frames+'f  '+((Date.now()-t0)/1000).toFixed(0)+'s  '+(r.info||'')); break; }
   console.log(sh.id.padEnd(16),'retry '+(a+1)+'/'+tries+': '+r.why);
  }
  if(!r||!r.ok) console.log(sh.id.padEnd(16),'⛔ FAILED: '+((r&&r.why)||'?'));
  report.push({id:sh.id, ok:!!(r&&r.ok), why:(r&&r.why)||null, info:(r&&r.info)||null});
 }
 L.fs.writeFileSync(__dirname+'/../frames/_capture_report.json', JSON.stringify(report,null,1));
 await b.close(); srv.close();
 const bad=report.filter(r=>!r.ok);
 console.log('\n'+(report.length-bad.length)+'/'+report.length+' shots captured'+(bad.length?('; FAILED: '+bad.map(r=>r.id).join(', ')):''));
})();
