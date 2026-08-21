/* Beat 3 is "the trail climbs, then banks", and it is also the poster frame.
   That only works if the bank happens INSIDE the four second window, so find
   the frame it actually fires on rather than guessing a pre-roll. */
const L=require('./lib.js'); const PILOT=require('./director.js');
const CAND=(process.argv[2]||'85:11').split(',').map(x=>x.split(':').map(Number));
(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 console.log('lvl gap  banks(frame@combo)                          bestWindowPre  peak');
 for(const [lv,gap] of CAND){
  const p=await L.boot(b,{prog:L.baseProg()});
  await p.evaluate(PILOT); await L.seizeClock(p);
  await p.evaluate(l=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',l); __PILOT.reset(); }, lv);
  const out=await p.evaluate((gap)=>{
   var banks=[],last=0,peak=0,died=null;
   for(var f=0;f<420;f++){ var s=__PILOT.tick(1/30,{frame:f,gap:gap,stall:30});
    if(s.combo>peak)peak=s.combo;
    if(s.combo<last && last>=2) banks.push(f+'@'+last);
    last=s.combo;
    if(s.phase!=='play'){ died=f; break; } }
   return {banks:banks,peak:peak,died:died};
  }, gap);
  await p.close();
  /* a 120 frame window that ends ~25 frames after the biggest bank */
  let best='-';
  if(out.banks.length){ const top=out.banks.map(x=>({f:+x.split('@')[0],c:+x.split('@')[1]}))
    .sort((a,b2)=>b2.c-a.c)[0]; best=Math.max(0, top.f-95)+' (bank@'+top.f+' c'+top.c+')'; }
  console.log(String(lv).padEnd(3),String(gap).padEnd(4),
    (out.banks.join(' ')||'none').padEnd(44), String(best).padEnd(14), out.peak, out.died?('DIED '+out.died):'');
 }
 await b.close(); srv.close();
})();
