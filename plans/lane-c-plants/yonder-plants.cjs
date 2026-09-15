/* A plant runner for YONDER's browser gates: each plant is a folder copy of satellites/math and satellites/yonder with its
   faults written one edit at a time (every match asserted first), then one gate run in the copy, its FAIL lines printed.
   Usage: node yonder-plants.cjs audio|mileposts [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = {
  audio: [
    ['a01 sound on at first load', [['main.js', "audio.setMuted(panel.get().muted);", "audio.setMuted(false);"]]],
    ['a02 two tones a walk', [['main.js', "  audio.play('walk');\n  const step", "  audio.play('walk'); audio.play('walk');\n  const step"]]],
    ['a03 the tone read in the logarithm', [['main.js', "tone.from = pitchFor(placement, max); tone.to = pitchFor(target, max);", "tone.from = 220 * Math.pow(4, Math.log(1 + placement) / Math.log(1 + max)); tone.to = 220 * Math.pow(4, Math.log(1 + target) / Math.log(1 + max));"]]],
    ['a04 an exponential glide', [['main.js', "o.frequency.linearRampToValueAtTime(tone.to, t + tone.seconds);", "o.frequency.exponentialRampToValueAtTime(tone.to, t + tone.seconds);"]]],
    ['a05 a voice around the master', [['main.js', "      o.connect(g); g.connect(out);\n      o.start(t); o.stop(t + tone.seconds + 0.14);", "      o.connect(g); g.connect(ac.destination);\n      o.start(t); o.stop(t + tone.seconds + 0.14);"]]],
    ['a06 a walk that clips', [['main.js', "g.gain.linearRampToValueAtTime(0.16, t + 0.04);\n      g.gain.setValueAtTime(0.16, t + tone.seconds);", "g.gain.linearRampToValueAtTime(2.6, t + 0.04);\n      g.gain.setValueAtTime(2.6, t + tone.seconds);"]]],
    ['a07 speech unguarded', [['main.js', "  } catch (e) { /* the numeral is on the screen either way (Y7) */ }", "  } finally { /* unguarded */ }"]]],
    ['a08 a server voice allowed', [['main.js', "find(v => v.localService && /^en/i.test(v.lang))", "find(v => /^en/i.test(v.lang))"]]]
  ],
  mileposts: [
    ['m01 no post drawn', [['main.js', "function drawPosts() {\n  road.querySelectorAll('.milepost').forEach(p => p.remove());", "function drawPosts() {\n  road.querySelectorAll('.milepost').forEach(p => p.remove());\n  return;"]]],
    ['m02 a post where the flag went', [['main.js', "if (kind === 'post') { posts.push(target); drawPosts(); }", "if (kind === 'post') { posts.push(Math.round(placement)); drawPosts(); }"]]],
    ['m03 posts kept into the next stage', [['main.js', "  stageEstimates = [];\n  posts = [];", "  stageEstimates = [];"]]],
    ['m04 a post numeral in the truth\'s row', [['index.html', "#road .milepost-label { position: absolute; top: 52px;", "#road .milepost-label { position: absolute; top: 90px;"]]],
    /* ⛔ the first m05 let the page hand MILEPOSTS estimates to recordStage, and the gate stayed green: recordStage drops
       every MILEPOSTS estimate, so the page's line changed nothing. The fault that matters is the engine reading them. */
    ['m05 MILEPOSTS estimates read', [
      ['main.js', "if (kind === 'flag') stageEstimates.push({ target, placement });", "if (kind !== 'post') stageEstimates.push({ target, placement });"],
      ['engine.js', "if (kind === 'mileposts') { s.pending = null; s.reprobe = true; return { session: s, route: null }; }", "if (kind === 'mileposts') { s.pending = null; s.reprobe = true; const r0 = s.roads[max] || freshRecord(); r0.estimates = r0.estimates.concat(estimates).slice(-MIN_FIT); s.roads[max] = r0; return { session: s, route: null }; }"]
    ]],
    ['m06 no probe after MILEPOSTS', [['engine.js', "if (kind === 'mileposts') { s.pending = null; s.reprobe = true; return { session: s, route: null }; }", "if (kind === 'mileposts') { s.pending = null; return { session: s, route: null }; }"]]]
  ]
};
PLANTS.map = [
  ['p3m1 a piece on every round', [['main.js', "  const ended = runRounds >= RUN;", "  const ended = runRounds >= 1;"]]],
  ['p3m2 pieces laid eastward', [['map.js', "const col = COLS - 1 - (i % COLS), row = Math.floor(i / COLS);", "const col = i % COLS, row = Math.floor(i / COLS);"]]],
  ['p3m3 no cap', [['map.js', "r.collect = shelf.length < MAP_PIECES ? collectOnce(shelf, 'piece-' + (shelf.length + 1)) : shelf;", "r.collect = collectOnce(shelf, 'piece-' + (shelf.length + 1));"]]],
  ['p3m4 a race earns nothing', [['main.js', "onEnd: () => { map.earn(byKey); return true; }", "onEnd: () => false"]]]
];
PLANTS.config = [
  ['p3c1 the page ignores its road', [['main.js', "freshSession(Number(CONFIG.road))", "freshSession(10)"]]],
  ['p3c2 the page reads a stray schema', [['main.js', "const CONFIG = parseConfig(location.search, YONDER_SCHEMA);", "const CONFIG = parseConfig(location.search, Object.assign({}, YONDER_SCHEMA, { count: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '30']), default: '20' }) }));"]]]
];
PLANTS.pace = [
  ['p3p1 the walk jumps with less motion', [['main.js', "const dt = now - result.revealAt, p = Math.min(1, Math.max(0, dt / walkMs));", "const dt = now - result.revealAt, p = reduced() ? 1 : Math.min(1, Math.max(0, dt / walkMs));"]]],
  ['p3p2 a heavy frame', [['main.js', "    traveler.style.left = (fx + (tx - fx) * p) + 'px';", "    for (let k = 0, t0 = performance.now(); performance.now() - t0 < 24; k++) Math.sqrt(k);\n    traveler.style.left = (fx + (tx - fx) * p) + 'px';"]]]
];
PLANTS.layout = [
  ['p3l1 a small next', [['index.html', '</style>', '  #next { min-width: 40px; min-height: 40px; width: 40px; height: 40px; }\n</style>']]],
  ['p3l2 a round gear', [['index.html', '</style>', '  .lw-settings-open { border-radius: 50%; }\n</style>']]],
  ['p3l3 tiny ends', [['index.html', '</style>', '  #road .lw-end { font-size: 9px; }\n</style>']]]
];
PLANTS.offline = [
  ['p3o1 map.js left out of the shell', [['sw.js', "  './map.js?v=20260915b',\n", ""]]],
  ['p3o2 every cache deleted', [['sw.js', "keys.filter(k => k.indexOf('yonder-') === 0 && k !== SHELL_VERSION)", "keys.filter(k => k !== SHELL_VERSION)"]]],
  ['p3o3 a network that is waited on forever', [['sw.js', "      }).catch(() => null), NET_TIMEOUT_MS).then(res => res || new Response('', { status: 504 }));", "      }).catch(() => null), 600000).then(res => res || new Response('', { status: 504 }));"]]]
];
PLANTS.art = [
  ['p4a1 the flag not drawn in the stone', [['main.js', "  line.stone.append(spriteCanvas('flag', 4));\n", ""]]],
  ['p4a2 a signpost floating over the road', [['index.html', '</style>', '  #signpost { top: 60px; }\n</style>']]],
  ['p4a3 a traveler on one frame', [['main.js', "    if (walker.dataset.sprite !== frame) drawInto(walker, frame, 3);", "    if (walker.dataset.sprite !== WALK_FRAMES[0]) drawInto(walker, WALK_FRAMES[0], 3);"]]],
  ['p4a4 the post behind the traveler again', [['index.html', '</style>', '  #truth-mark { top: 92px; height: 58px; }\n</style>']]],
  ['p4a5 two pips for every card', [['race.js', "    drawInto(pips, m === 2 ? 'pipsTwo' : 'pipsOne', 6);", "    drawInto(pips, 'pipsTwo', 6);"]]],
  ['p4a6 a small map', [['map.js', "const COLS = 6, ROWS = 5, UNIT = 12;", "const COLS = 10, ROWS = 3, UNIT = 12;"]]]
];
const gate = process.argv[2], only = process.argv[3];
for (const [name, edits] of PLANTS[gate].filter(([n]) => !only || n.startsWith(only))) {
  const dir = path.join(SP, 'yplant-' + gate);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'yonder'), dir]);
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'yonder', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  const r = spawnSync('node', [path.join(dir, 'yonder', 'test', gate + '.mjs')], { encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 230));
  console.log(name.padEnd(40) + (lines.length ? lines.join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}
