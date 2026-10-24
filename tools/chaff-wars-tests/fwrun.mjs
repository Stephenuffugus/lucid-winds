// Fail watch for Pop N Lock: each group writes index.html with ONE fix undone as index-fw.html beside it (every relative
// URL keeps working), runs the gate on it, must go RED on the check it names, then deletes it. node fwrun.mjs p0 [group ...]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const DIR = '/workspaces/lucid-winds/satellites/chaff-wars/', TMP = DIR + 'index-fw.html', [part, ...only] = process.argv.slice(2);
const G = {
  p0: {
    HYPEDT: { want: 'HYPE 80 after 16 ms', muts: [['f.hype=Math.max(0,f.hype-dt/1000*1.3);', 'f.hype=Math.max(0,f.hype-dt*1.3);']] },
    GLOWDT: { want: 'chain glow 1 after 16 ms', muts: [['f.chainGlow=Math.max(0,f.chainGlow-dt/1000*1.1);', 'f.chainGlow=Math.max(0,f.chainGlow-dt*1.1);']] },
    ALLBONUS: { want: 'All Clear bonus survives', muts: [['if(f.allBonus&&R.chain>0){', 'if(f.allBonus){']] },
    CANCEL: { want: 'cancelled 10 px, 100 ms touch', muts: [["cv.addEventListener('pointercancel',dragCancel,{passive:false});", "cv.addEventListener('pointercancel',dragEnd,{passive:false});"]] },
    LOCKDRAG: { want: 'lock in the middle of a soft drop', muts: [['  if(f===MATCH.pf&&dragSt){ if(dragSt.soft)f.softHold=false; dragSt=null; }', '']] },
    REPEAT: { want: 'held arrow moves at once', muts: [['t=setTimeout(function(){ fn(); r=setInterval(fn,33); },first||105);', 't=setTimeout(function(){ r=setInterval(fn,33); },first||105);']] },
    BACKLOG: { want: 'starting a soft drop drops at most one row', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '']] },
    CLAMPAFTER: { want: 'falls a row every 40 ms', muts: [['      if(f.gravAcc>g)f.gravAcc=g;', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g; f.gravAcc-=dt;'], ['      f.gravAcc+=dt;\n      while(f.gravAcc>=g)', '      f.gravAcc+=dt; if(f.gravAcc>g)f.gravAcc=g;\n      while(f.gravAcc>=g)']] },
    FLOATFIT: { want: 'banner fits the board', muts: [["var punch=Math.min(1,Math.max(0,fl.life-0.82)/0.18);", "var punch=Math.max(0,fl.life-0.82)/0.18;"], ["if(mw>lim){ fs=Math.max(10,Math.floor(fs*lim/mw)); ctx.font='italic 800 '+fs+'px system-ui'; }", ""]] },
  },
};
let bad = 0;
for (const [k, g] of Object.entries(G[part])) {
  if (only.length && !only.includes(k)) continue;
  let html = fs.readFileSync(DIR + 'index.html', 'utf8');
  for (const [a, b] of g.muts) { const n = html.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } html = html.replace(a, b); }
  if (fs.existsSync(TMP)) { console.log('refusing: ' + TMP + ' exists'); process.exit(3); }
  fs.writeFileSync(TMP, html); let out = '';
  try { out = execSync('timeout 900 node /workspaces/lucid-winds/tools/chaff-wars-tests/' + part + '_gate.mjs index-fw.html /tmp/claude-1000/pnl/fw', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { fs.unlinkSync(TMP); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log(`=== ${part} ${k}: ${hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'}`); console.log(fails.map(l => '   ' + l.slice(0, 180)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
