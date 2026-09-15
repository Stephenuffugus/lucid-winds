/* Plants for CREASE's stack and audio gates, and the HALFWAY page's halfOpen hand off: each plant is a folder copy of
   satellites/math and satellites/crease (from PLANT_SAT, a snapshot) with its faults written one edit at a time (every match
   asserted exactly once first), then its gate run in the copy and its FAIL lines printed. Usage: node crease-p2b-plants.cjs
   [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['s1 no stack ever', 'stack', [['main.js', "const stack = task.stackReveal ? tasks.slice(-3).map(t => t.numerator + '/' + t.denominator) : [];", "const stack = [];"]]],
  ['s2 the stack never fades in', 'stack', [['render.js', "for (const id of ['truth-clip', 'gap', 'stack']) {", "for (const id of ['truth-clip', 'gap']) {"]]],
  ['s3 the stack left on the next round', 'stack', [['render.js', "'#truth-clip, #gap, #stack, .crease'", "'#truth-clip, #gap, .crease'"]]],
  ['s4 the stack off its point', 'stack', [['render.js', "    col.style.left = truthX + 'px';", "    col.style.left = (truthX + 14) + 'px';"]]],
  ['s5 the stack in the wrong order', 'stack', [['main.js', "tasks.slice(-3).map(", "tasks.slice(-3).reverse().map("]]],
  ['s6 the stack above the board', 'stack', [['index.html', "#stack { position: absolute; top: 0;", "#stack { position: absolute; top: -40px;"]]],
  ['s7 a stack on every round', 'stack', [['main.js', "const stack = task.stackReveal ? tasks.slice(-3)", "const stack = tasks.length >= 3 ? tasks.slice(-3)"]]],
  ['a1 a settle per crease', 'audio', [['main.js', "if (heard < 2 && p >= 1) { heard = 2; sound('settle'); }", "if (heard < 2 && p >= 1) { heard = 2; for (let k = 1; k < task.whole * task.denominator; k++) sound('settle'); }"]]],
  ['a2 a knock only when right', 'audio', [['main.js', "{ heard = 1; sound('knock'); }", "{ heard = 1; if (result.correct) sound('knock'); }"]]],
  ['a3 sound unguarded', 'audio', [['main.js', "  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }", "  audio.play(name);"]]],
  ['a4 a set on a round left alone', 'audio', [['main.js', "  if (choice !== null) {\n    /* A1: one sound for the side put down; a round left alone says nothing */\n    sound('set');", "  sound('set');\n  if (choice !== null) {"]]],
  ['a5 the crease voice around the master', 'audio', [['main.js', "src.connect(bp); bp.connect(g); g.connect(out);", "src.connect(bp); bp.connect(g); g.connect(ac.destination);"]]],
  ['a6 a fold at the end still sounds', 'audio', [['main.js', "  if (to === parts) return;", "  if (to === parts) { sound('crease'); return; }"]]],
  ['a7 a crease sound per crease', 'audio', [['main.js', "  /* A1: one crease sound for the press, never one per crease made */\n  sound('crease');", "  for (let k = 1; k < parts; k++) sound('crease');"]]],
  ['a8 a first load not muted', 'audio', [['main.js', "audio.setMuted(panel.get().muted);", "audio.setMuted(false);"]]],
  ['a9 the crease hisses', 'audio', [['main.js', "bp.type = 'bandpass'; bp.frequency.value = 1300;", "bp.type = 'highpass'; bp.frequency.value = 6000;"]]],
  ['a10 the knock clips', 'audio', [['main.js', "knock: knock(210, 120, 0.16, 'sine')", "knock: knock(210, 120, 2.5, 'sine')"]]],
  ['h8 the page never tells the engine half is open', 'halfway', [['main.js', "  state.halfOpen = halfOpen;\n", ""]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'p2bplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), dir]);
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'crease', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  const r = spawnSync('node', [path.join(dir, 'crease', 'test', gate + '.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 240));
  console.log(name.padEnd(42) + (lines.length ? lines.slice(0, 4).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}
