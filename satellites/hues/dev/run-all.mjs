/* RUN EVERY HUES GATE (packet H1), one at a time (this box has two cores that behave like one).
     node satellites/hues/dev/run-all.mjs            every gate must be GREEN, plus the shared music unit and mutation gates
     node satellites/hues/dev/run-all.mjs --plants   every planted break must turn its gate RED (a gate that stays green
                                                     through its plant is decoration)
   The music unit gate needs its fixture (/tmp/music-fixture, built by scripts/music_fixture.mjs, which needs ffmpeg). */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
const ROOT = new URL('../../../', import.meta.url).pathname, D = 'satellites/hues/dev/';
const run = (args, env = {}) => { const t = Date.now(); const r = spawnSync('node', args, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 900000 });
  const out = (r.stdout || '') + (r.stderr || ''); const last = out.trim().split('\n').filter((l) => /gate|mutants:|ok,|failed/.test(l)).slice(-1)[0] || out.trim().split('\n').slice(-1)[0];
  return { code: r.status, secs: ((Date.now() - t) / 1000).toFixed(0), last: (last || '').trim() }; };
const plants = process.argv.includes('--plants');
let bad = 0;
if (!plants) {
  if (!existsSync('/tmp/music-fixture/music-catalog.js')) {
    run(['scripts/music_fixture.mjs']);
    run(['scripts/music_manifest.mjs', '--intake', '/tmp/music-fixture/intake.json', '--out', '/tmp/music-fixture/music-catalog.js', '--unmapped', '/tmp/music-fixture/unmapped.md', '--live']);
  }
  for (const [name, args] of [['music unit', ['test/music/unlocks.mjs']], ['music mutants', ['test/music/mutants.mjs']],
    ['review', [D + 'gate-review.mjs']], ['overlap', [D + 'gate-overlap.mjs']], ['fidelity', [D + 'gate-fidelity.mjs']],
    ['copy', [D + 'gate-copy.mjs']], ['touch', [D + 'gate-touch.mjs']], ['save', [D + 'gate-save.mjs']]]) {
    const r = run(args); if (r.code !== 0) bad++;
    console.log((r.code === 0 ? '  GREEN ' : '  RED   ') + name.padEnd(14) + r.secs.padStart(4) + 's  ' + r.last);
  }
  console.log(bad ? '\nrun-all: ' + bad + ' gate(s) RED' : '\nrun-all: every gate green'); process.exit(bad ? 1 : 0);
}
for (const [name, args] of [['overlap / pill', [D + 'gate-overlap.mjs', '--plant=pill']], ['fidelity / flash', [D + 'gate-fidelity.mjs', '--plant=flash']],
  ['copy / lockin', [D + 'gate-copy.mjs', '--plant=lockin']], ['touch / shrink', [D + 'gate-touch.mjs', '--plant=shrink']],
  ['save / novalidate', [D + 'gate-save.mjs', '--plant=novalidate']], ['review / doublelock', [D + 'gate-review.mjs', '--only=d12', '--plant=doublelock']],
  ['review / releaselock', [D + 'gate-review.mjs', '--only=d12', '--plant=releaselock']]]) {
  const r = run(args); if (r.code === 0) bad++;
  console.log((r.code !== 0 ? '  RED (good)  ' : '  GREEN (BAD) ') + name.padEnd(22) + r.secs.padStart(4) + 's  ' + r.last);
}
console.log(bad ? '\nrun-all --plants: ' + bad + ' plant(s) did NOT turn their gate red' : '\nrun-all --plants: every plant caught');
process.exit(bad ? 1 : 0);
