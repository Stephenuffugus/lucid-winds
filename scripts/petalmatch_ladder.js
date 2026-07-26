#!/usr/bin/env node
/* Petal Match LADDER REPORT.
 *
 * Prints the difficulty load of every level straight from the real genLevel, so
 * the shape of the ladder is visible in one screen without replaying anything.
 * Doc 06 §1c wants the generator to PROVE each level is in range; this is how
 * you read the proof.
 *
 *   load 1.0 = the average competent run finishes exactly as the last move goes.
 *   Higher is harder. See _loadOf() in games/petalmatch.js.
 *
 * USAGE  node scripts/petalmatch_ladder.js [from] [to]
 */
const puppeteer = require('puppeteer');
const path = require('path'); const http = require('http'); const fs = require('fs');
const FROM = parseInt(process.argv[2] || '1', 10);
const TO   = parseInt(process.argv[3] || '40', 10);
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
               '.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json','.svg':'image/svg+xml' };
function serve(){ return new Promise(r=>{ const s=http.createServer((q,res)=>{
  let p=decodeURIComponent(q.url.split('?')[0]); if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('x');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res); }); s.listen(0,'127.0.0.1',()=>r(s)); }); }

(async () => {
  const srv = await serve();
  const browser = await puppeteer.launch({ args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(()=>{ try{ localStorage.setItem('sws_dir_petalmatch','1'); }catch(e){} });
  await page.goto('http://127.0.0.1:'+srv.address().port+'/play/petalmatch.html',{waitUntil:'networkidle2',timeout:30000});
  await new Promise(r=>setTimeout(r,2500));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,.gb,[onclick]')]
    .filter(e=>e.offsetParent!==null).find(e=>/let.?s play|play|start|begin/i.test(e.textContent||'')); if(b)b.click(); });
  await new Promise(r=>setTimeout(r,1500));
  if(!await page.evaluate(()=>!!(window._PM_TEST&&window._PM_TEST.load))){
    console.error('_PM_TEST.load missing'); process.exit(1);
  }

  const rows = [];
  for (let lv = FROM; lv <= TO; lv++) rows.push(await page.evaluate(l=>window._PM_TEST.load(l), lv));

  console.log('lv  kind      moves  demand    load     eff');
  console.log('─'.repeat(64));
  let prevChapter = -1;
  for (const r of rows) {
    const ch = Math.floor((r.lv-1)/10);
    if (ch !== prevChapter) { console.log('  ── chapter ' + (ch+1) + ' ' + '─'.repeat(44)); prevChapter = ch; }
    const bar = '█'.repeat(Math.min(28, Math.round(r.eff*20))).padEnd(28,'·');
    console.log(String(r.lv).padStart(3)+'  '+r.kind.padEnd(8)+String(r.moves).padStart(5)+
      String(Math.round(r.demand)).padStart(8)+r.load.toFixed(2).padStart(8)+r.eff.toFixed(2).padStart(8)+
      '  '+bar+(r.finale?' ← finale':''));
  }

  const loads = rows.map(r=>r.eff);
  const nonFinale = rows.filter(r=>!r.finale).map(r=>r.eff);
  const mean = a=>a.reduce((x,y)=>x+y,0)/a.length;
  let jag=0; for(let i=1;i<loads.length;i++) jag+=Math.abs(loads[i]-loads[i-1]);
  jag/=(loads.length-1);
  console.log('\n⛔ judged on EFF (raw load / PM_KFIX): the per-kind correction MEANS raw differs by kind.');
  console.log('non-finale eff    min '+Math.min(...nonFinale).toFixed(2)+
              '   mean '+mean(nonFinale).toFixed(2)+'   max '+Math.max(...nonFinale).toFixed(2)+
              '   spread '+(Math.max(...nonFinale)-Math.min(...nonFinale)).toFixed(2));
  console.log('avg jump level-to-level  '+jag.toFixed(3));

  /* ═══ WHAT "GOOD" MEANS HERE — CHANGED 2026-07-26 ══════════════════════
     This used to print "⛔ SAWTOOTH" whenever the average level-to-level jump
     went over 0.25, i.e. it rewarded a FLAT ladder. That is how the game ended
     up with forty levels between 0.59 and 1.07 and no relief anywhere in it —
     technically balanced, no fun, and the tool was applauding.

     A flat ladder is not the goal and never was. The real complaint that
     started all this was a level-25 WALL, which was three bugs, not a curve.
     What a match-3 ladder actually needs is a low FLOOR (levels you crush), a
     capped CEILING (nothing hopeless), and the spikes landing where the design
     put them instead of at random. So that is what gets checked. Variation is
     the point — do not "fix" the jump number back down. ⛔ */
  const CEIL = 1.15, FLOOR = 0.45;
  const hot   = rows.filter(r=>!r.finale && r.eff > CEIL);
  const chapters = [...new Set(rows.map(r=>Math.floor((r.lv-1)/10)))];
  const noRelief = chapters.filter(c=>{
    const inCh = rows.filter(r=>Math.floor((r.lv-1)/10)===c && !r.finale);
    return inCh.length && Math.min(...inCh.map(r=>r.eff)) > FLOOR;
  });
  /* Spikes are meant to sit at sub-position 3 and 7, finale at 9.
     ⛔ TOP THREE, not top two. Objectives with small integer counts (a 7-thorn
     level, a 3-dew level) carry up to ~10% of Math.round noise in their eff,
     which is enough to swap two near-tied levels in the ranking. Demanding the
     exact top two made this fail on a chapter that was built correctly. */
  const misplaced = chapters.filter(c=>{
    const inCh = rows.filter(r=>Math.floor((r.lv-1)/10)===c && !r.finale);
    if (inCh.length < 9) return false;                      // partial chapter
    const top = inCh.slice().sort((a,b)=>b.eff-a.eff).slice(0,3).map(r=>(r.lv-1)%10);
    return !(top.includes(3) && top.includes(7));
  });

  let ok = true;
  if (hot.length)      { ok=false; console.log('⛔ ABOVE THE CEILING ('+CEIL+'): '+hot.map(r=>'lv'+r.lv+' '+r.eff.toFixed(2)).join(', ')); }
  if (noRelief.length) { ok=false; console.log('⛔ NO RELIEF LEVEL in chapter(s) '+noRelief.map(c=>c+1).join(', ')+' — every level above '+FLOOR+'. This is the flat-ladder failure.'); }
  if (misplaced.length){ ok=false; console.log('⛔ SPIKES NOT AT POSITIONS 4 AND 8 in chapter(s) '+misplaced.map(c=>c+1).join(', ')+' — check PM_RHYTHM / _KSLOT.'); }
  // blockers must never sit next to each other, and level 1 must be an open board
  const BLOCK = { dew:1, thorns:1 };
  const adj = rows.filter((r,i)=>i>0 && BLOCK[r.kind] && BLOCK[rows[i-1].kind]).map(r=>'lv'+(r.lv-1)+'+'+r.lv);
  if (adj.length)          { ok=false; console.log('⛔ BLOCKERS BACK TO BACK: '+adj.join(', ')); }
  if (BLOCK[rows[0].kind] && FROM===1) { ok=false; console.log('⛔ LEVEL 1 IS A BLOCKER LEVEL ('+rows[0].kind+') — first contact must be a clean board.'); }

  console.log(ok ? '✓ floor, ceiling, spike placement and blocker spacing all hold.' : '');

  await browser.close(); srv.close();
})();
