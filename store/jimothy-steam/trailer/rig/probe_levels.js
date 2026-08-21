/* Which levels can the pilot play cleanly, at what rhythm, and when it dies
   WHY. Runs the same pilot the capture uses, at the same 1/30 step, rendering
   off. Levels are seeded, so a clean result here is the same clean result at
   capture time — that determinism is the whole reason this probe is worth
   trusting (and the reason a retry must vary its timing to get a new outcome). */
const L=require('./lib.js'); const PILOT=require('./director.js');
const LEVELS=(process.argv[2]||'3,4,7,12,18,24,31,36,44,52,58,64,72,78,85,92').split(',').map(Number);
const FRAMES=+(process.argv[3]||500);
const GAPS=(process.argv[4]||'9,13,17').split(',').map(Number);
const HOLD=+(process.argv[5]||100);
(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const p=await L.boot(b,{prog:L.baseProg()});
 await p.evaluate(PILOT);
 console.log('lvl  chapter          special      gap  survived   cause     hops maxC banks arc');
 for(const lv of LEVELS){
  for(const gap of GAPS){
   /* ⛔ a 0-frame "death" in an earlier sweep was residue from the PREVIOUS
      level, not this one. Assert the start before believing anything after it. */
   /* ⛔⛔ SEIZE BEFORE START, ALWAYS. show('s-play') ends with
      requestAnimationFrame(loop), so starting a level while the real rAF is
      live hands the new game to the game's own loop for however long the next
      await takes — the hero stands there unpiloted and the wilt eats him. That
      is the entire explanation for the "0f over" rows in the first two sweeps;
      they were never a property of the level. */
   await L.seizeClock(p);
   const start=await p.evaluate(l=>{ SH_DEV.screen('s-play'); SH_DEV.start('adventure',l); __PILOT.reset();
     var g=SH_DEV.state(); return {phase:g&&g.phase, r:g&&g.cr.r, want:(l-1)*16}; }, lv);
   if(!start||start.phase!=='play'||start.r!==start.want){
     console.log(String(lv).padEnd(4),'BAD START:',JSON.stringify(start)); await L.releaseClock(p); continue; }
   const out=await p.evaluate((n,lv,hold,gap)=>{
    var arc=[],banks=0,hops=0,last=0,maxC=0,died=null,at=n;
    for(var f=0;f<n;f++){
      var s=__PILOT.tick(1/30,{frame:f,hold:hold,gap:gap,stall:26});
      if(s.acted==='hop'||s.acted==='forced') hops++;
      if(s.combo>maxC) maxC=s.combo;
      if(s.combo<last && last>=2){ banks++; arc.push(last); }
      last=s.combo;
      if(s.phase!=='play'){ var g=SH_DEV.state(); died=(g&&g.deadCause)||s.phase; at=f; break; }
    }
    return {arc:arc,banks:banks,hops:hops,maxC:maxC,died:died,at:at,
      chapter:SH_DEV.chapterName(lv), sp:SH_DEV.spNames[SH_DEV.special(lv)]||''};
   }, FRAMES, lv, HOLD, gap);
   await L.releaseClock(p);
   console.log(String(lv).padEnd(4),(out.chapter||'').padEnd(16),(out.sp||'-').padEnd(12),
     String(gap).padEnd(4), (out.died?(out.at+'f'):'ALL '+FRAMES+'f').padEnd(10),
     (out.died||'-').padEnd(9), String(out.hops).padEnd(4), String(out.maxC).padEnd(4),
     String(out.banks).padEnd(5), out.arc.join(','));
  }
 }
 await b.close(); srv.close();
})();
