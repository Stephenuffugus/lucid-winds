/* Plants for GLIMPSE's browser gates (flash, timing, modes, audio, config, specimens, art, pace, layout, offline): each plant is a
   folder copy of satellites/math and satellites/glimpse (from PLANT_SAT, a snapshot of a green tree) with its faults written one
   edit at a time (every match asserted exactly once first), then its gate run in the copy and its FAIL lines printed.
   Usage: node glimpse-browser-plants.cjs [name prefix]   (run the whole thing under the gate lock) */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const M = 'glimpse/main.js', H = 'glimpse/index.html', R = 'glimpse/render.js', J = 'glimpse/journal.js', W = 'glimpse/sw.js', S = 'glimpse/sprites.js', C = 'glimpse/config.js';
const PLANTS = [
  /* flash */
  /* ⛔ fl1's first form (session + 1) planted nothing in FLASH, whose deal does not read the session; the deal now draws once more from the seed */
  ['fl1 a round off the seed', 'flash', [[M, 'pairs = dealSession(r, { mode: MODE, tier: tierNow(), session });', 'r(); pairs = dealSession(r, { mode: MODE, tier: tierNow(), session });']]],
  ['fl2 every pad in one row', 'flash', [[M, 'for (const row of padRows(padsFor(x))) {', 'for (const row of [padsFor(x)]) {']]],
  ['fl3 pads awake in the flash', 'flash', [[M, "  if (phase !== 'answer') return;\n  const rt", "  if (phase === 'reveal') return;\n  const rt"], [M, '  renderPads(current);\n', '  renderPads(current);\n  setPads(true);\n']]],
  ['fl4 no mask', 'flash', [[M, "onMasked: () => { drawMask(ctx, W, round * 7); phase = 'mask'; }", "onMasked: () => { phase = 'mask'; }"]]],
  ['fl5 a blink per firefly', 'flash', [[M, "      sound('blink');\n", "      for (let k = 0; k < countOf(current); k++) sound('blink');\n"]]],
  ['fl6 a bar that grows while deciding', 'flash', [[M, '    setPads(true);\n    if (byKey)', "    setPads(true);\n    const bar = document.createElement('div'); bar.style.cssText = 'height:6px;background:#e9eef2;width:0'; document.getElementById('play').append(bar);\n    const grow = () => { if (phase === 'answer') { bar.style.width = Math.round((performance.now() - shownAt) / 40) + 'px'; requestAnimationFrame(grow); } }; requestAnimationFrame(grow);\n    if (byKey)"]]],
  ['fl7 reaction time off the paint', 'flash', [[M, 'const rt = performance.now() - shownAt,', 'const rt = performance.now() - shownAt + 120,']]],
  ['fl8 the numeral only when right', 'flash', [[M, 'if (dt >= total && truthEl.hidden) {', 'if (dt >= total && truthEl.hidden && result.correct) {']]],
  ['fl9 no focus on next by keys', 'flash', [[M, 'if (result.byKey) nextBtn.focus();', 'if (result.byKey && false) nextBtn.focus();']]],
  /* timing */
  ['ti1 the page flash runs long', 'timing', [[M, "return schedule.flash({ durationMs, onShow: () => { if (current)", "return schedule.flash({ durationMs: durationMs + 60, onShow: () => { if (current)"]]],
  ['ti2 a round flash off flashMs', 'timing', [[M, "const durationMs = flashMs(countOf(current), CONFIG.flash === 'auto' ? undefined : CONFIG.flash);", "const durationMs = flashMs(countOf(current), CONFIG.flash === 'auto' ? undefined : CONFIG.flash) + 20;"]]],
  /* modes */
  ['mo1 FRAME without its zero pad', 'modes', [[M, '    for (const value of row) {', '    for (const value of row.filter(v => v !== 0)) {']]],
  ['mo2 SPREAD pads as numerals', 'modes', [[M, "      if (typeof value === 'number') {", '      if (true) {']]],
  ['mo3 no glow in the empty cells', 'modes', [[M, "x.ask === 'complement' && dt >= fade", 'false']]],
  ['mo4 both swarms amber', 'modes', [[M, '{ dots: x.a.dots, S: half, ox: 0, oy, glow }', '{ dots: x.a.dots, S: half, ox: 0, oy, glow: glowAmber }']]],
  ['mo5 four doors on a named link', 'modes', [[H, '  body[data-fixed] #start-groups, body[data-fixed] #start-frame, body[data-fixed] #start-spread { display: none; }\n', '']]],
  ['mo6 SPREAD reveals one count', 'modes', [[M, "x.mode === 'spread' ? x.a.n + '   ' + x.b.n : String(x.answer)", "x.mode === 'spread' ? String(x.a.n) : String(x.answer)"]]],
  /* audio */
  ['au1 a first load not muted', 'audio', [[M, 'audio.setMuted(panel.get().muted);', 'audio.setMuted(false);']]],
  ['au2 sound unguarded', 'audio', [[M, '  try { audio.play(name); } catch (e) { /* no sound on this device; the round goes on */ }', '  audio.play(name);']]],
  ['au3 the blink clips', 'audio', [[M, 'g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);', 'g.gain.exponentialRampToValueAtTime(1.6, t + 0.01);']]],
  ['au4 the blink hisses', 'audio', [[M, "o.type = 'sine';\n      o.frequency.setValueAtTime(880, t);\n      o.frequency.exponentialRampToValueAtTime(660, t + 0.15);", "o.type = 'square';\n      o.frequency.setValueAtTime(5200, t);\n      o.frequency.exponentialRampToValueAtTime(4800, t + 0.15);"]]],
  /* config */
  ['co1 the page takes a count the builder does not', 'config', [[C, "values: Object.freeze(['12', '24', '36']), default: '12'", "values: Object.freeze(['12', '24', '36', '48']), default: '12'"]]],
  ['co2 the page defaults another flash', 'config', [[C, "values: Object.freeze(['auto', '250', '400', '600', 'long']), default: 'auto'", "values: Object.freeze(['auto', '250', '400', '600', 'long']), default: '400'"]]],
  /* specimens */
  ['sp1 a page every round', 'specimens', [[M, '  const ended = runRounds >= RUN;', '  const ended = true;']]],
  ['sp2 a digit on the journal', 'specimens', [[J, "  go.innerHTML = '&#9654;';", "  go.innerHTML = '3';"]]],
  ['sp3 past twenty four', 'specimens', [[J, 'r.collect = pages.length < JOURNAL_SIZE ?', 'r.collect = true ?']]],
  ['sp4 a flash under the journal', 'specimens', [[M, "el('first').hidden && !journal.shown() ?", "el('first').hidden ?"]]],
  ['sp5 a reload mid run earns', 'specimens', [[M, 'let runRounds = 0;', "let runRounds = Number(sessionStorage.getItem('glimpse-run') || 0);"], [M, '  runRounds++;', "  runRounds++;\n  sessionStorage.setItem('glimpse-run', String(runRounds % RUN));"]]],
  /* art */
  ['ar1 blue as light as amber', 'art', [[S, "'#4a90d9', /* 4 blue firefly", "'#e0b040', /* 4 blue firefly"]]],
  ['ar2 a mask of night', 'art', [[R, '  ctx.fillStyle = PALETTE[1];\n  ctx.fillRect(0, 0, W, W);', '  ctx.fillStyle = PALETTE[0];\n  ctx.fillRect(0, 0, W, W);'], [R, '      sprite.draw(ctx, tuft, PALETTE, Math.round(x + odd + (shift % step)), Math.round(y), scale);', '      /* no tuft */']]],
  ['ar3 a journal page one pixel a pixel', 'art', [[J, 'const scale = Math.max(1, Math.min(', 'const scale = 1 || Math.max(1, Math.min(']]],
  /* pace */
  /* ⛔ pa1's first form (square roots whose results were never used) planted nothing, as CREASE's pa1 once did: the loop can be
     optimised away. Two milliseconds of real time a firefly cannot be */
  ['pa1 a heavy firefly', 'pace', [[R, '  for (const d of dots) {\n    const size', '  for (const d of dots) {\n    { const busy = performance.now(); while (performance.now() - busy < 2) { /* a heavy firefly */ } }\n    const size']]],
  ['pa2 less motion ignored', 'pace', [[M, 'const fade = reduced() ? 0 : FADE, land = reduced() ? 0 : LAND,', 'const fade = FADE, land = LAND,']]],
  /* layout */
  ['la1 pads 44 px', 'layout', [[H, '.pad.lw-btn { width: 56px; min-width: 56px; min-height: 56px;', '.pad.lw-btn { width: 44px; min-width: 44px; min-height: 44px; max-height: 44px;']]],
  ['la2 the numeral at 9 px', 'layout', [[H, 'bottom: 10px; text-align: center; font-size: var(--type-34);', 'bottom: 10px; text-align: center; font-size: 9px;']]],
  ['la3 a meadow wider than a phone', 'layout', [[H, '#meadow-wrap { position: relative; width: min(100%, 360px); }', '#meadow-wrap { position: relative; width: 420px; }']]],
  ['la4 proportional figures on the pads', 'layout', [[H, 'color: #e9eef2; font-variant-numeric: tabular-nums lining-nums; font-size: var(--type-20); line-height: 1; }', 'color: #e9eef2; font-variant-numeric: proportional-nums; font-size: var(--type-20); line-height: 1; }']]],
  /* offline */
  ['of1 the worker deletes every cache', 'offline', [[W, "keys.filter(k => k.indexOf('glimpse-') === 0 && k !== SHELL_VERSION)", 'keys.filter(k => k !== SHELL_VERSION)']]],
  ['of2 the journal not precached', 'offline', [[W, "  './journal.js?v=20260916c',\n", '']]],
  ['of3 a miss that never settles', 'offline', [[W, ".then(res => res || new Response('', { status: 504 }));", '.then(res => res || new Promise(() => {}));']]],
  ['of4 the manifest misnamed', 'offline', [['glimpse/manifest.webmanifest', '"name": "Glimpse"', '"name": "Firefly"']]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'glimpse-plant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'glimpse'), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, file), src = fs.readFileSync(p, 'utf8');
    const n = src.split(from).length - 1;
    if (n !== 1) { console.log(name.padEnd(46) + 'NOT PLANTED: the match is ' + n + ' times in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('node', [path.join(dir, 'glimpse', 'test', gate + '.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, killSignal: 'SIGKILL', env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 220));
  console.log(name.padEnd(46) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)') + (r.signal ? ' [killed ' + r.signal + ']' : ''));
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log('plants done');
