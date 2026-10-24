// Fail watch for the Pit Bike gates: each group makes a hard linked copy of the upstream clone with ONE rule broken in one
// file, runs the gate on it and must go RED on the check named by `want`. node fwrun.mjs <p0|p1> [group ...]
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const SRC = '/workspaces/skywolf-pitbike-rally', [part, ...only] = process.argv.slice(2);
const G = {
  p0: {
    NOGUARD: { file: 'src/race.js', want: 'career race \\(finished through finishRace\\)', env: { SKIPC: '1' }, muts: [['if (!race.career) applyRaceWear(race.laps);', 'applyRaceWear(race.laps);']] },
    NOMIGRATE: { file: 'src/save.js', want: 'loaded: v 3', env: { SKIPC: '1' }, muts: [['  if (raw.v === 2) {\n', '  if (false) {\n']] },
    NOSTAMP: { file: 'src/race.js', want: 'record carries pv 1', env: {}, muts: [['if (record) { rec.best = bestMs; rec.pv = PHYS_V; }', 'if (record) { rec.best = bestMs; }']] },
  },
  p1: {
    LINEAR: { file: 'src/input.js', want: 'a 20 px pull', env: {}, args: ['x'], muts: [['DEAD: 8, FULL: 56, EXP: 1.2,', 'DEAD: 8, FULL: 56, EXP: 0.4,']] },
    NOFLICK: { file: 'src/input.js', want: 'flick up from the gas fires nitro once', env: {}, args: ['x'], muts: [['{ thr.flicks++; thr.noBrake = true; fireNitro(); }', '{ thr.flicks++; thr.noBrake = true; }']] },
    FLICKBRAKES: { file: 'src/input.js', want: 'flick up from the gas fires nitro once', env: {}, args: ['x'], muts: [['BRAKE_HOLD: 0.12,', 'BRAKE_HOLD: 0,'], ['const brake = (up > THR.DEAD && !thr.noBrake && !flicking &&', 'const brake = (up > THR.DEAD &&']] },
    PUSHFLICKS: { file: 'src/input.js', want: 'slow push up held 200 ms', env: {}, args: ['x'], muts: [['FLICK_V: 600,', 'FLICK_V: 100,']] },
    NOLEFT: { file: 'src/input.js', want: 'left NITRO fires', env: {}, args: ['x'], muts: [["  bindBtn('btn-nitro-l', fireNitro);", '']] },
    NOANALOG: { file: 'src/input.js', want: 'a 56 px pull', env: {}, args: ['x'], muts: [['p.throttle = Math.max(a.throttle, input.gas ? 1 : 0);', 'p.throttle = input.gas ? 1 : 0;']] },
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
