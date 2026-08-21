/* 9 hops and a combo of zero on levels 3/12/92 is a contradiction: every
   forward landing increments combo. Trace one of them frame by frame and let
   the game say what it is actually doing. */
const L=require('./lib.js'); const PILOT=require('./director.js');
(async()=>{
 const srv=await L.serve(L.PORT);
 const b=await L.puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
 const p=await L.boot(b,{prog:{char:'roon'}});
 await p.evaluate(PILOT);
 for(const lv of [3,7]){
  await p.evaluate(l=>{ SH_DEV.start('adventure',l); __PILOT.reset(); }, lv);
  await L.seizeClock(p);
  const out=await p.evaluate((lv)=>{
    var rows=[], g0=SH_DEV.state();
    var info={startR:g0.cr.r, startX:Math.round(g0.cr.x), started:g0.started, phase:g0.phase,
      laneHere:SH_DEV.laneAt(g0.cr.r).type, laneAhead:SH_DEV.laneAt(g0.cr.r+1).type,
      blockedAhead:JSON.stringify(SH_DEV.laneAt(g0.cr.r+1).blocked||{}),
      gatesAhead:JSON.stringify(SH_DEV.laneAt(g0.cr.r+1).gates||null), coach:!!g0.coach, resumeT:g0.resumeT};
    for(var f=0;f<160;f++){
      var s=__PILOT.tick(1/30,{frame:f, hold:100, gap:5, stall:70});
      if(f>=98 && f<130) rows.push(f+':r'+s.r.toFixed(2)+' c'+s.combo+' '+(s.acted||'.')+' '+__PILOT.should());
    }
    var g=SH_DEV.state();
    return {info:info, rows:rows, endR:g.cr.r, endCombo:g.combo, started:g.started};
  }, lv);
  await L.releaseClock(p);
  console.log('=== lvl',lv,'===', JSON.stringify(out.info));
  console.log(out.rows.join('\n'));
  console.log('end r',out.endR,'combo',out.endCombo,'started',out.started);
 }
 await b.close(); srv.close();
})();
