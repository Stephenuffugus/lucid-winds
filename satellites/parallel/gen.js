#!/usr/bin/env node
/* PARALLEL level generator.

   Generates all 60 campaign levels from master seed 0x50415241 using the SAME
   GEN and SIM code the game runs, pulled out of index.html by marker comment.
   Re run it with the same seed and it must reproduce the array byte for byte.
   That reproducibility IS the drift alarm: if anyone edits stepWorld, the
   levels change and this script says so.

     node gen.js                 generate and print the array
     node gen.js --write         also splice it into index.html
     node gen.js --check         regenerate and compare against what is embedded
     node gen.js --only=5        just one tier, for yield measurement
     node gen.js --budget=4000   attempts per level before giving up
*/
var fs = require('fs');
var path = require('path');

var HTML = path.join(__dirname, 'index.html');
var START = '// ---- LEVELS_START ----';
var END = '// ---- LEVELS_END ----';

function loadSim(){
  var src = fs.readFileSync(HTML, 'utf8');
  var i = src.indexOf('// ---- SIM_EXPORT_START ----');
  var j = src.indexOf('// ---- SIM_EXPORT_END ----');
  var block = src.slice(i + '// ---- SIM_EXPORT_START ----'.length, j);
  var mod = new Function(block + '\nreturn {CONFIG:CONFIG,makeRNG:makeRNG,TIERS:TIERS,tierOf:tierOf,' +
    'genLevel:genLevel,encodeLevel:encodeLevel,decodeLevel:decodeLevel,bfsSolve:bfsSolve,' +
    'greedyRun:greedyRun,hasDesync:hasDesync,replay:replay,LEVELS:LEVELS,T:T};')();
  mod.__src = src;
  return mod;
}

function args(name, dflt){
  var i, a = process.argv.slice(2);
  for (i = 0; i < a.length; i++){
    if (a[i] === '--' + name) return true;
    if (a[i].indexOf('--' + name + '=') === 0) return a[i].split('=')[1];
  }
  return dflt;
}

var M = loadSim();
var BUDGET = parseInt(args('budget', '6000'), 10);
var ONLY = args('only', null);
var out = [];
var stats = {};
var t0 = Date.now();

/* One RNG chain for the whole run, seeded from the master seed, so level N
   depends on everything generated before it. Rerunning reproduces exactly. */
var rng = M.makeRNG(M.CONFIG.MASTER_SEED);

var n;
for (n = 1; n <= M.CONFIG.LEVEL_COUNT; n++){
  var spec = M.tierOf(n);
  if (ONLY && String(spec.t) !== String(ONLY)){ out.push(null); continue; }
  if (!stats[spec.t]) stats[spec.t] = { levels:0, attempts:0, ms:0, fails:0, pars:[] };
  var lt = Date.now();
  var log = {};
  var lv = M.genLevel(rng, spec, BUDGET, log);
  var dt = Date.now() - lt;
  stats[spec.t].attempts += log.attempts || 0;
  stats[spec.t].ms += dt;
  if (!lv){
    stats[spec.t].fails++;
    process.stderr.write('level ' + n + '  tier ' + spec.t + '  NO ACCEPT after ' +
      (log.attempts || 0) + ' attempts (' + (dt/1000).toFixed(1) + 's)\n');
    out.push(null);
    continue;
  }
  stats[spec.t].levels++;
  stats[spec.t].pars.push(lv.par);
  out.push(M.encodeLevel(lv));
  process.stderr.write('level ' + String(n) + '  tier ' + spec.t + '  par ' + lv.par +
    '  attempts ' + (log.attempts || 0) + '  ' + (dt/1000).toFixed(1) + 's\n');
}

process.stderr.write('\nTIER  MADE  ATTEMPTS  PER ACCEPT   SECONDS   PAR MIN  PAR MAX  PAR MEAN\n');
var tk;
for (tk = 1; tk <= 5; tk++){
  var s = stats[tk];
  if (!s || !s.levels) continue;
  var mean = s.pars.reduce(function(p,c){ return p+c; }, 0) / s.pars.length;
  process.stderr.write(
    String(tk).padStart(4) + String(s.levels).padStart(6) + String(s.attempts).padStart(10) +
    (s.attempts / s.levels).toFixed(1).padStart(12) + (s.ms/1000).toFixed(1).padStart(10) +
    String(Math.min.apply(null, s.pars)).padStart(9) + String(Math.max.apply(null, s.pars)).padStart(9) +
    mean.toFixed(1).padStart(10) + '\n');
}
process.stderr.write('\ntotal ' + ((Date.now()-t0)/1000).toFixed(1) + 's\n');

var made = 0, i;
for (i = 0; i < out.length; i++) if (out[i]) made++;
process.stderr.write('accepted ' + made + ' / ' + M.CONFIG.LEVEL_COUNT + '\n');

var arr = 'var LEVELS = [\n' + out.filter(function(x){ return !!x; })
  .map(function(s){ return '  "' + s + '"'; }).join(',\n') + '\n];';

if (args('check')){
  var same = out.length === M.LEVELS.length;
  for (i = 0; i < M.LEVELS.length && same; i++) if (M.LEVELS[i] !== out[i]) same = false;
  console.log(same
    ? 'REPRODUCIBLE  the embedded array matches a fresh run byte for byte'
    : 'DRIFT  the embedded array does NOT match a fresh run from the same seed');
  process.exitCode = same ? 0 : 1;
} else if (args('write')){
  var src = M.__src;
  var a = src.indexOf(START), b = src.indexOf(END);
  src = src.slice(0, a + START.length) + '\n' + arr + '\n' + src.slice(b);
  fs.writeFileSync(HTML, src);
  console.log('wrote ' + made + ' levels into index.html');
} else {
  console.log(arr);
}
