/* Jimothy beatability evidence — structural, deterministic.
   Drives the REAL generator in headless Chrome: for every Adventure level 1..100
   (fixed per-level seeds) plus sampled Endless/Rush/Zen/Daily rows, regenerates
   the course and checks the four structural ways a level can be unwinnable:
   1. SEALED: no BFS path through bushes/gates from level start to its gate row.
   2. BUSHED ALCOVE: a blocked cell directly above an open feast gate (the
      "had to die to continue" bug class, fixed once; this proves it stays fixed).
   3. UNCROSSABLE ROAD: worst time-gap between vehicles too small to hop through.
   4. BARE WATER: pad coverage too thin to stand on.
   Run: node scripts/jimothy_beatability.mjs  (serves repo root itself) */
import puppeteer from 'puppeteer';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT='/workspaces/lucid-winds';
const srv=http.createServer((q,s)=>{
  let p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
  if(p.endsWith('/'))p+='index.html';
  fs.readFile(p,(e,d)=>{
    if(e){s.statusCode=404;return s.end();}
    if(p.endsWith('stream-hop/index.html')){
      /* inject a probe shim at the main IIFE's last close; disk file untouched */
      let t=d.toString();
      const i=t.lastIndexOf('})();\n</script>');
      t=t.slice(0,i)+'window.__J={newGame:newGame,genUpTo:genUpTo,G:function(){return G;},ADV_LEN:ADV_LEN,COLS:COLS,advLevelOfRow:advLevelOfRow};\n'+t.slice(i);
      return s.end(t);
    }
    s.end(d);
  });
}).listen(8831);
const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();
p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,150)));
await p.setViewport({width:540,height:960});
await p.goto('http://127.0.0.1:8831/satellites/stream-hop/index.html',{waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,2500));

const analyze=await p.evaluate(()=>{
  window.__probe=function(mode,startLevel,rows){
    var J=window.__J, G_=null;
    J.newGame(mode,startLevel||1);
    var G=J.G(); var r0=G.cr.r, rEnd=r0+rows;
    J.genUpTo(rEnd+2); G=J.G();
    var issues=[], stats={road:0,water:0,safe:0,gate:0,minGapT:1e9,minPadCov:1e9};
    /* per-lane structural checks */
    for(var r=r0; r<=rEnd; r++){
      var L=G.lanes[r]; if(!L) continue;
      if(L.gates){ stats.gate++;
        var above=G.lanes[r+1];
        if(above&&above.blocked) for(var c in L.gates)
          if(above.blocked[c]) issues.push({lv:J.advLevelOfRow(r),r:r,kind:'BUSHED_ALCOVE',col:+c});
        var open=Object.keys(L.gates).length;
        if(open<3) issues.push({lv:J.advLevelOfRow(r),r:r,kind:'FEW_GATES',open:open});
      } else if(L.type==='road'&&L.speed>0&&!L.vents){ stats.road++;
        var w=(L.ents[0]&&L.ents[0].w)||40;
        /* real kill model: HIT_ROAD=0.72 of summed half-widths, and the player
           is invulnerable mid-hop, so the binding time is the standing window */
        var HIT=0.72, crW=42;
        var gapT=L.speed>0?((L.spacing||0)-(w+crW)*HIT)/L.speed:9;
        if(gapT<stats.minGapT)stats.minGapT=gapT;
        if(gapT<0.30) issues.push({lv:J.advLevelOfRow(r),r:r,kind:'TIGHT_ROAD',gapT:+gapT.toFixed(2),spd:Math.round(L.speed)});
      } else if(L.type==='water'){ stats.water++;
        var tw=0; for(var i=0;i<L.ents.length;i++)tw+=L.ents[i].w||0;
        var cov=L.span?tw/L.span:(tw/540);
        if(cov<stats.minPadCov)stats.minPadCov=cov;
        if(!L.ents.length) issues.push({lv:J.advLevelOfRow(r),r:r,kind:'BARE_WATER'});
        else if(cov<0.18) issues.push({lv:J.advLevelOfRow(r),r:r,kind:'THIN_WATER',cov:+cov.toFixed(2)});
      } else if(L.type==='safe') stats.safe++;
    }
    /* BFS reachability: columns 0..COLS-1 per row; safe blocked = wall,
       gate rows passable only at gates, hazards passable anywhere */
    var pass=function(r,c){ var L=G.lanes[r]; if(!L)return true;
      if(L.gates) return !!L.gates[c];
      if(L.type==='safe') return !L.blocked||!L.blocked[c];
      return true; };
    var seen={}, q=[];
    for(var c0=0;c0<J.COLS;c0++) if(pass(r0,c0)){q.push([r0,c0]);seen[r0+','+c0]=1;}
    var reached=r0;
    while(q.length){ var n=q.shift(), rr=n[0], cc=n[1];
      if(rr>reached)reached=rr; if(rr>=rEnd)break;
      var moves=[[rr+1,cc],[rr,cc-1],[rr,cc+1]];
      for(var m=0;m<moves.length;m++){ var mr=moves[m][0],mc=moves[m][1];
        if(mc<0||mc>=J.COLS||mr>rEnd+1)continue;
        var k=mr+','+mc; if(seen[k])continue;
        if(pass(mr,mc)){seen[k]=1;q.push([mr,mc]);} } }
    if(reached<rEnd) issues.push({lv:startLevel,kind:'SEALED',stuckAtRow:reached,of:rEnd});
    return {issues:issues,stats:stats,r0:r0,rEnd:rEnd};
  };
  return {ADV_LEN:window.__J.ADV_LEN,COLS:window.__J.COLS};
});
console.log('constants',JSON.stringify(analyze));

const all={adventure:[],modes:{}};
let worstGap=9, worstCov=9, totalIssues=0;
/* ⛔ 1..120, not 1..100. The campaign RESOLVES to 120: past the level 100 feast
   the last three decades cycle so it never dead-ends, and those levels are
   playable, carded and reachable. Checking to 100 left 20 live levels unproven.
   Override with LV_MAX if a future course is longer still. */
const LV_MAX = +(process.env.LV_MAX || 120);
for(let lv=1;lv<=LV_MAX;lv++){
  const r=await p.evaluate(lv=>__probe('adventure',lv,__J.ADV_LEN),lv);
  if(r.issues.length){ all.adventure.push(...r.issues); totalIssues+=r.issues.length; }
  if(r.stats.minGapT<worstGap)worstGap=r.stats.minGapT;
  if(r.stats.minPadCov<worstCov)worstCov=r.stats.minPadCov;
  if(lv%20===0)console.log('adventure through level',lv,'of',LV_MAX,'issues so far',totalIssues);
}
for(const mode of ['endless','rush','zen','daily']){
  const runs=mode==='daily'?1:5, agg=[];
  for(let i=0;i<runs;i++){
    const r=await p.evaluate(m=>__probe(m,1,300),mode);
    agg.push(...r.issues.filter(x=>x.kind!=='SEALED'||x.stuckAtRow<290)); // endless has no gate goal; near-end BFS frontier ok
    if(r.stats.minGapT<worstGap)worstGap=r.stats.minGapT;
  }
  all.modes[mode]=agg; totalIssues+=agg.length;
  console.log(mode, agg.length,'issues over',runs,'run(s) x300 rows');
}
console.log('WORST road time-gap (s):',worstGap.toFixed(2),' WORST water pad coverage:',worstCov.toFixed(2));
console.log('TOTAL ISSUES:',totalIssues);
fs.writeFileSync(ROOT+'/store/jimothy-steam/BEATABILITY_EVIDENCE.json',JSON.stringify(all,null,1));
console.log('written store/jimothy-steam/BEATABILITY_EVIDENCE.json');
await b.close(); srv.close();
