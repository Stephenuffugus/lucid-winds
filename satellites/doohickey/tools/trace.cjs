#!/usr/bin/env node
/* THE LEVEL TRACER (T2.4, 2026-09-15). The tool levels 13 to 19 were authored with.
 *
 *   node tools/trace.cjs --id=12                     an existing level's own solution
 *   node tools/trace.cjs --file=cand.cjs             a candidate: module.exports = function (S) { return level; }
 *   node tools/trace.cjs --id=13 --without=spring    the same level with every part of that type taken out
 *   node tools/trace.cjs --id=14 --every=0.125 --max=8
 *
 * It builds the SIM exactly as sim.js does, out of this game's index.html SIM_EXPORT span, and prints what a
 * person authoring against the simulator needs: every moving body's position (a seesaw's angle too) sampled
 * every `--every` seconds until the bell or `--max`; when the bell rang; each bonus point, touched or not and
 * when; the stars; and whether an EMPTY machine wins the level by itself. It asserts nothing and changes
 * nothing: `node sim.js --test` and `--solve` are the laws, this is the pencil.
 *
 * ⛔ A bonus touched at 0.00 s is not on the path: something was standing on it when the level began (a
 * domino did exactly that on the first draft of Dominoes Upstairs). Put bonuses where the run goes, later.
 * ⛔ `--without` is how the `teaches:` law is checked before it is written: a level must stop winning with the
 * part it teaches taken out.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var HTML_PATH = process.env.DOOHICKEY_HTML || path.join(__dirname, '..', 'index.html');
var HTML = fs.readFileSync(HTML_PATH, 'utf8');
function extract(src, a, b) {
  var i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found: ' + a);
  return src.slice(i + a.length, j);
}
var SIM_SRC = extract(HTML, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var S = new Function(SIM_SRC + '\nreturn { CONFIG: CONFIG, DEG: DEG, PARTS: PARTS, LEVELS: LEVELS, buildWorld: buildWorld,'
  + ' runMachine: runMachine, bellRung: bellRung, starsFor: starsFor, machineFromSolution: machineFromSolution,'
  + ' newMachine: newMachine, vlen: vlen, vsub: vsub };')();

var argOf = function (name, dflt) {
  var a = process.argv.find(function (x) { return x.indexOf('--' + name + '=') === 0; });
  return a ? a.split('=').slice(1).join('=') : dflt;
};
var level;
if (argOf('id') !== undefined) {
  var want = parseInt(argOf('id'), 10);
  level = S.LEVELS.filter(function (l) { return l.id === want; })[0];
  if (!level) throw new Error('no level with id ' + want);
} else if (argOf('file')) {
  var mod = require(path.resolve(argOf('file')));
  level = typeof mod === 'function' ? mod(S) : mod;
} else {
  console.log('usage: --id=N | --file=cand.cjs [--without=TYPE] [--every=0.25] [--max=RUN_MAX_S]');
  process.exit(2);
}
var drop = argOf('without');
if (drop) {
  level = Object.assign({}, level, {
    name: level.name + ' (without its ' + drop + ')',
    solution: level.solution.filter(function (p) { return p.type !== drop; })
  });
}

var every = parseFloat(argOf('every', '0.25'));
var maxS = parseFloat(argOf('max', String(S.CONFIG.RUN_MAX_S)));
var machine = S.machineFromSolution(level);
var world = S.buildWorld(level, machine);
var hz = S.CONFIG.PHYS_HZ, dt = 1 / hz, steps = Math.round(maxS * hz), sampleEvery = Math.max(1, Math.round(every * hz));
var touched = level.bonus.map(function () { return 0; }), touchedAt = level.bonus.map(function () { return -1; });
var goalAt = -1, i, k, b;
console.log('level ' + level.id + ' "' + level.name + '"  par ' + level.par + '  parts ' + machine.parts.length
  + '  teaches ' + (level.teaches || '-') + '  bonus ' + JSON.stringify(level.bonus));
for (i = 0; i < steps; i++) {
  world.step(dt);
  for (k = 0; k < level.bonus.length; k++) {
    if (touched[k]) continue;
    for (b = 0; b < world.bodies.length; b++) {
      var body = world.bodies[b];
      if (body.isStatic || !body.awake) continue;
      if (S.vlen(S.vsub(body.pos, level.bonus[k])) < 26) { touched[k] = 1; touchedAt[k] = i / hz; break; }
    }
  }
  if (goalAt < 0 && S.bellRung(world)) goalAt = i / hz;
  if (i % sampleEvery === 0 || goalAt === i / hz) {
    var moving = world.bodies.filter(function (x) { return !x.isStatic && x.awake; }).map(function (x) {
      return x.kind + '(' + x.pos.x.toFixed(0) + ',' + x.pos.y.toFixed(0)
        + (x.kind === 'seesaw' ? ' ' + (x.angle / S.DEG).toFixed(0) + 'deg' : '') + ')';
    });
    if (moving.length) console.log('  t ' + (i / hz).toFixed(2).padStart(6) + '  ' + moving.join(' '));
  }
  if (goalAt >= 0 && i / hz > goalAt + 0.3) break;
}
var res = S.runMachine(level, machine);
var empty = S.runMachine(level, S.newMachine());
console.log('goal ' + (goalAt >= 0 ? 'rang at ' + goalAt.toFixed(2) + ' s' : 'NEVER') + '; runMachine agrees: ' + res.goal
  + '; stars ' + S.starsFor(level, machine, res) + '; bonus ' + touched.join(',') + ' at '
  + touchedAt.map(function (t) { return t < 0 ? 'never' : t.toFixed(2); }).join(',')
  + '; an empty machine wins it: ' + empty.goal + '; parts ' + machine.parts.length + ' of par ' + level.par);
