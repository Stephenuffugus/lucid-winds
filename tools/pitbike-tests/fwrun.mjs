// Fail watch for the Pit Bike gates: each group makes a hard linked copy of the upstream clone with ONE rule broken in one
// file, runs the gate on it and must go RED on the check named by `want`. node fwrun.mjs <p0|p1> [group ...]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const SRC = '/workspaces/skywolf-pitbike-rally', [part, ...only] = process.argv.slice(2);
const G = {
  p0: {
    NOGUARD: { file: 'src/race.js', want: 'career race \\(finished through finishRace\\)', env: { SKIPC: '1', SKIPD: '1' }, muts: [['if (!race.career) applyRaceWear(race.laps);', 'applyRaceWear(race.laps);']] },
    NOMIGRATE: { file: 'src/save.js', want: 'loaded: v 3', env: { SKIPC: '1', SKIPD: '1' }, muts: [['  if (raw.v === 2) {\n', '  if (false) {\n']] },
    NOSTAMP: { file: 'src/race.js', want: 'record carries pv 1', env: { SKIPD: '1' }, muts: [['if (record) { rec.best = bestMs; rec.pv = PHYS_V; }', 'if (record) { rec.best = bestMs; }']] },
    CAREERRESTART: { file: 'src/ui.js', want: 'restarts it as the same career round', env: { SKIPC: '1' }, muts: [['    if (S.race.career) { startRace(S.race.trackIndex, S.race.variant, { career: true, quick: true }); return; }\n', '']] },
    NEWERPV: { file: 'src/race.js', want: 'newer physics', env: { SKIPC: '1' }, muts: [['const record = bestMs > 0 && rpv <= PHYS_V && (!rec.best || rpv < PHYS_V || bestMs < rec.best);', 'const record = bestMs > 0 && (!rec.best || rpv !== PHYS_V || bestMs < rec.best);']] },
    FEATURED: { file: 'src/ui.js', want: 'keeps its 2x', env: { SKIPC: '1' }, muts: [["if (S.race.career) { startRace(S.race.trackIndex, S.race.variant, { career: true, quick: true }); return; }\n    if (!tryStart(S.race.trackIndex, S.race.variant, S.race.featured))", "if (S.race.career) { startRace(S.race.trackIndex, S.race.variant, { career: true, quick: true }); return; }\n    if (!tryStart(S.race.trackIndex, S.race.variant, false))"]] },
    DAILYGHOST: { file: 'src/race.js', want: 'yesterday', env: { SKIPC: '1' }, muts: [['race.ghost = !def.daily && ghost &&', 'race.ghost = ghost &&']] },
  },
  p1: {
    LINEAR: { file: 'src/input.js', want: 'a 20 px pull', env: {}, args: ['x'], muts: [['DEAD: 8, FULL: 56, EXP: 1.2,', 'DEAD: 8, FULL: 56, EXP: 0.4,']] },
    NOFLICK: { file: 'src/input.js', want: 'flick up from the gas fires nitro once', env: {}, args: ['x'], muts: [['{ thr.flicks++; fireNitro(); }', '{ thr.flicks++; }']] },
    NORETURN: { file: 'src/input.js', want: 'overshoots the middle by 9 px', env: {}, args: ['x'], muts: [['FLICK_RET: 16,', 'FLICK_RET: 0,']] },
    NOCENTER: { file: 'src/input.js', want: 'stays on the gas side', env: {}, args: ['x'], muts: [['if (r.fast && r.peak - thr.cy <= -THR.FLICK_TOP && dwell <= THR.FLICK_DWELL) {', 'if (r.fast && dwell <= THR.FLICK_DWELL) {']] },
    SETTLE: { file: 'src/input.js', want: 'relaxes 18 px', env: {}, args: ['x'], muts: [['else if (y >= r.peak + THR.FLICK_RET && (!r.fast || y - thr.cy >= -THR.DEAD)) {', 'else if (y >= r.peak + THR.FLICK_RET) {']] },
    DWELL: { file: 'src/input.js', want: 'rests 150 ms at the top', env: {}, args: ['x'], muts: [['&& dwell <= THR.FLICK_DWELL) {', ') {']] },
    LIGHTBRAKE: { file: 'src/input.js', want: 'lightest brake', env: {}, args: ['x'], muts: [['THR.BRAKE_MIN + (1 - THR.BRAKE_MIN) * thrCurve(up)', 'thrCurve(up)']] },
    FROMSTART: { file: 'src/input.js', want: 'flick up from the gas fires nitro once', env: {}, args: ['x'], muts: [['if (r.fast && t - r.tFast > THR.FLICK_TOTAL) thr.run = null;', 'if (t - (r.t0 || (r.t0 = t)) > THR.FLICK_TOTAL) thr.run = null;']] },
    NOLEFT: { file: 'src/input.js', want: 'left NITRO fires', env: {}, args: ['x'], muts: [["  bindBtn('btn-nitro-l', fireNitro);", '']] },
    NOANALOG: { file: 'src/input.js', want: 'a 56 px pull', env: {}, args: ['x'], muts: [['p.throttle = Math.max(a.throttle, input.gas ? 1 : 0);', 'p.throttle = input.gas ? 1 : 0;']] },
    NOCLAMP: { file: 'src/input.js', want: '40 px over the bottom edge', env: {}, args: ['x'], muts: [['const cy = Math.min(y, innerHeight - THR.FULL - THR.EDGE);', 'const cy = y;']] },
    PAUSEFIRE: { file: 'src/input.js', want: 'while the race is paused', env: {}, args: ['x'], muts: [['race.started && !race.over && !S.paused && p.nitro > 0', 'race.started && !race.over && p.nitro > 0']] },
    PIPS: { file: 'css/game.css', want: 'no top HUD chip sits', env: {}, args: ['x'], muts: [['body.ctl-analog #nitro-pips{ right:auto; bottom:auto; left:calc(10px + env(safe-area-inset-left)); top:calc(67px + env(safe-area-inset-top)); width:56px; gap:3px; }', 'body.ctl-analog #nitro-pips{ right:auto; bottom:auto; left:calc(74px + env(safe-area-inset-left)); top:calc(26px + env(safe-area-inset-top)); width:auto; }']] },
    OLDGETSANALOG: { file: 'src/save.js', want: 'keeps Classic and shows the card', env: {}, args: ['x'], muts: [["  if (old) { g.ctl = 'classic'; g.ctlAsk = true; }", '']] },
  },
};
let bad = 0;
for (const [k, g] of Object.entries(G[part])) {
  if (only.length && !only.includes(k)) continue;
  const dir = `/tmp/claude-1000/pb/fw-${part}-${k}`; execSync(`rm -rf ${dir} && mkdir -p ${dir} && tar -C ${SRC} --exclude=.git -cf - . | tar -C ${dir} -xf -`);
  const f = `${dir}/${g.file}`; let s = fs.readFileSync(f, 'utf8'); fs.unlinkSync(f);
  for (const [a, b] of g.muts) { const n = s.split(a).length - 1; if (n !== 1) { console.log(k, 'MUTATION DOES NOT BIND (' + n + '):', a.slice(0, 80)); process.exit(2); } s = s.replace(a, b); }
  fs.writeFileSync(f, s);
  let out = '';
  try { out = execSync(`timeout 900 node /workspaces/lucid-winds/tools/pitbike-tests/${part}_gate.mjs ${dir} /tmp/claude-1000/pb/fwshots ${(g.args || []).join(' ')}`, { env: Object.assign({}, process.env, g.env), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  finally { execSync(`rm -rf ${dir}`); }
  const fails = out.split('\n').filter(l => /FAIL/.test(l)), hit = fails.some(l => new RegExp(g.want).test(l));
  if (!hit) bad++;
  console.log(`=== ${part} ${k}: ${hit ? 'RED as wanted' : 'NOT RED on /' + g.want + '/'}`); console.log(fails.map(l => '   ' + l.slice(0, 200)).join('\n'));
}
console.log(bad ? bad + ' group(s) did NOT go red' : 'every group went red where wanted');
