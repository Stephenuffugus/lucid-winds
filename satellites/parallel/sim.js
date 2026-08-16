#!/usr/bin/env node
/* PARALLEL headless runner. Zero dependencies.

   Reads the SIM and TEST layers straight out of index.html by marker comment,
   so the solver, the playable game and this script all run the SAME
   stepWorld(). If they ever drift, --verify goes red.

     node sim.js --test           full assertion harness, nonzero exit on fail
     node sim.js --verify         the section 5.5 gates over the 60 levels
     node sim.js --watch=12       ASCII frames of level 12 solving itself
     node sim.js --grep           source gates (Math.random, DOM, dashes)
     node sim.js --solve=12       BFS the level fresh and print the answer
*/
var fs = require('fs');
var path = require('path');

var HTML = path.join(__dirname, 'index.html');

function slice(src, a, b){
  var i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error('marker not found: ' + a);
  return src.slice(i + a.length, j);
}

function loadSim(opts){
  var src = fs.readFileSync(HTML, 'utf8');
  var sim = slice(src, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
  var test = slice(src, '// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');
  var body = sim + (opts && opts.noTest ? '' : test) + '\nreturn {' + [
    'CONFIG','makeRNG','seedFromString','dailyKey','T','TILE_CHARS','TIERS','tierOf','FIXTURES','LEVELS',
    'encodeLevel','decodeLevel','parseAscii','levelToAscii','finishLevel','enterable','supported',
    'initState','stepWorld','packState','bfsSolve','replay','hasDesync','greedyRun','genLevel',
    'buildCandidate','minimizeWalls','genDaily','freshSave','migrateSave','parseSave','mergeSave',
    'clearedCount','starCount','shareLine','IN_CHARS','DIR_L','DIR_R','DIR_U','DIR_D',
    'IN_LEFT','IN_RIGHT','IN_UP','IN_WAIT',
    'skyLayout','skyMinSep','SKY','mirrorDrift','genSeeded','dayNumber',
    'pushRun','mergeHistory','HIST_CAP','campaignCleared','campaignStars','PAR_MAX'
  ].join(',') + (opts && opts.noTest ? '' : ',TEST') + '};';
  /* eslint no-new-func: 0 */
  var mod = new Function(body)();
  mod.__src = src;
  mod.__sim = sim;
  return mod;
}

/* ---------------- --test ---------------- */
function cmdTest(){
  var M = loadSim();
  var t0 = Date.now();
  var rep = M.TEST.run();
  var ms = Date.now() - t0;
  var i;
  for (i = 0; i < rep.failures.length; i++){
    console.log('FAIL  ' + rep.failures[i].name + '   ' + rep.failures[i].detail);
  }
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed + '   (' + rep.total + ' assertions, ' + ms + 'ms)');
  return rep.failed === 0 ? 0 : 1;
}

/* ---------------- --verify ---------------- */
function pad(s, n){ s = '' + s; while (s.length < n) s += ' '; return s; }
function padl(s, n){ s = '' + s; while (s.length < n) s = ' ' + s; return s; }

function cmdVerify(){
  var M = loadSim();
  var L = M.LEVELS;
  var fails = [];
  function chk(name, cond, detail){ if (!cond) fails.push(name + (detail ? '  ' + detail : '')); }

  chk('level count is ' + M.CONFIG.LEVEL_COUNT, L.length === M.CONFIG.LEVEL_COUNT, 'got ' + L.length);
  if (!L.length){
    console.log('no levels embedded yet');
    return 1;
  }

  var rows = [], byTier = {}, i;
  var t0 = Date.now();
  for (i = 0; i < L.length; i++){
    var n = i + 1;
    var lv = M.decodeLevel(L[i]);
    var spec = M.tierOf(n);

    chk('L' + n + ' tier tag', lv.tier === spec.t, 'tag ' + lv.tier + ' expected ' + spec.t);
    chk('L' + n + ' grid size', lv.w === spec.w && lv.h === spec.h, lv.w + 'x' + lv.h);
    chk('L' + n + ' codec round trip', M.encodeLevel(lv) === L[i]);

    var rp = M.replay(lv, lv.sol);
    chk('L' + n + ' embedded solution wins', rp.end.won === true);
    chk('L' + n + ' embedded solution has a desync', rp.desync === true);
    chk('L' + n + ' embedded solution length equals par', lv.sol.length === lv.par,
        lv.sol.length + ' vs ' + lv.par);

    var fresh = M.bfsSolve(lv, spec.max, M.CONFIG.BFS_VERIFY_CAP);
    chk('L' + n + ' BFS finds a solution', !!fresh && fresh.len > 0);
    if (fresh && fresh.len > 0){
      chk('L' + n + ' embedded par equals a fresh BFS run', fresh.len === lv.par,
          'bfs ' + fresh.len + ' embedded ' + lv.par);
      chk('L' + n + ' solution length inside tier band [' + spec.min + ',' + spec.max + ']',
          lv.par >= spec.min && lv.par <= spec.max, 'par ' + lv.par);
    }
    var greedy = M.greedyRun(lv, lv.par * M.CONFIG.GREEDY_MULT);
    chk('L' + n + ' greedy agent fails', greedy === false);

    if (!byTier[lv.tier]) byTier[lv.tier] = [];
    byTier[lv.tier].push(lv.par);
    rows.push({ n:n, tier:lv.tier, size:lv.w + 'x' + lv.h, par:lv.par,
                bfs:(fresh ? fresh.len : -1), states:(fresh ? fresh.states : 0),
                greedy:greedy ? 'SOLVED' : 'failed', desync:rp.desync ? 'yes' : 'NO' });
  }

  /* positive slope on a tier vs length line fit */
  var xs = [], ys = [];
  for (i = 0; i < rows.length; i++){ xs.push(rows[i].tier); ys.push(rows[i].par); }
  var nn = xs.length, sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (i = 0; i < nn; i++){ sx += xs[i]; sy += ys[i]; sxy += xs[i]*ys[i]; sxx += xs[i]*xs[i]; }
  var slope = (nn*sxy - sx*sy) / (nn*sxx - sx*sx);
  chk('tier length slope is positive', slope > 0, 'slope ' + slope.toFixed(3));

  /* all distinct */
  var seen = {}, dupes = 0;
  for (i = 0; i < L.length; i++){ if (seen[L[i]]) dupes++; seen[L[i]] = 1; }
  chk('no duplicate levels', dupes === 0, dupes + ' duplicates');

  console.log('LEVEL  TIER  GRID    PAR  BFS  STATES   GREEDY  DESYNC');
  for (i = 0; i < rows.length; i++){
    var r = rows[i];
    console.log(padl(r.n,5) + padl(r.tier,6) + '  ' + pad(r.size,7) +
                padl(r.par,4) + padl(r.bfs,5) + padl(r.states,8) + '  ' +
                pad(r.greedy,7) + ' ' + r.desync);
  }
  console.log('');
  console.log('TIER  LEVELS  BAND      MIN  MAX  MEAN');
  var tk;
  for (tk = 1; tk <= M.TIERS.length; tk++){
    if (!byTier[tk]) continue;
    var a = byTier[tk], mn = Math.min.apply(null, a), mx = Math.max.apply(null, a);
    var mean = a.reduce(function(p,c){ return p+c; }, 0) / a.length;
    var spec = M.TIERS[tk-1];
    console.log(padl(tk,4) + padl(a.length,8) + '  ' + pad('[' + spec.min + ',' + spec.max + ']', 9) +
                padl(mn,4) + padl(mx,5) + padl(mean.toFixed(1),6));
  }
  console.log('');
  console.log('tier vs solution length slope  ' + slope.toFixed(3) + '   (must be > 0)');
  console.log('verify took ' + ((Date.now()-t0)/1000).toFixed(1) + 's');
  console.log('');
  if (fails.length){
    for (i = 0; i < fails.length; i++) console.log('FAIL  ' + fails[i]);
    console.log('');
    console.log('VERIFY FAILED  ' + fails.length + ' gate(s)');
    return 1;
  }
  console.log('VERIFY PASSED  all section 5.5 gates green over ' + L.length + ' levels');
  return 0;
}

/* ---------------- --watch ---------------- */
function cmdWatch(n){
  var M = loadSim();
  var lv;
  if (n === 'daily'){
    var d = new Date().toISOString().slice(0,10);
    lv = M.genDaily(M.seedFromString(M.dailyKey(d)));
    if (!lv){ console.log('daily generation failed'); return 1; }
    console.log('DAILY ' + d);
  } else {
    var idx = parseInt(n, 10) - 1;
    if (!(idx >= 0 && idx < M.LEVELS.length)){ console.log('no such level'); return 1; }
    lv = M.decodeLevel(M.LEVELS[idx]);
    console.log('LEVEL ' + (idx+1) + '  tier ' + lv.tier + '  ' + lv.w + 'x' + lv.h + '  par ' + lv.par);
  }
  console.log('solution  ' + lv.sol);
  console.log('legend    A violet avatar   B amber avatar   # wall   ^ spike   a exit A   b exit B');
  console.log('          1 2 3 keys   d e f doors   c crumble  , broken   ~ ice   < > v one way');
  console.log('');
  var rp = M.replay(lv, lv.sol);
  var i, k;
  for (i = 0; i < rp.frames.length; i++){
    var s = rp.frames[i];
    var head = (i === 0 ? 'start' : 'move ' + i + ' ' + lv.sol.charAt(i-1)) +
               (s.desync ? '   DESYNC' : '') + (s.won ? '   WIN' : '') + (s.dead ? '   DEAD' : '');
    console.log(head);
    var art = M.levelToAscii(lv, s);
    for (k = 0; k < art.length; k++) console.log('   ' + art[k]);
    console.log('');
  }
  console.log('ended  ' + (rp.end.won ? 'WON in ' + rp.end.moves + ' moves' : 'NOT WON'));
  return rp.end.won ? 0 : 1;
}

/* ---------------- --solve ---------------- */
function cmdSolve(n){
  var M = loadSim();
  var idx = parseInt(n, 10) - 1;
  if (!(idx >= 0 && idx < M.LEVELS.length)){ console.log('no such level'); return 1; }
  var lv = M.decodeLevel(M.LEVELS[idx]);
  var spec = M.tierOf(idx+1);
  var t0 = Date.now();
  var r = M.bfsSolve(lv, spec.max, M.CONFIG.BFS_VERIFY_CAP);
  console.log('level ' + (idx+1) + '  embedded par ' + lv.par + '  fresh BFS ' + (r ? r.len : 'none') +
              '  states ' + (r ? r.states : 0) + '  ' + (Date.now()-t0) + 'ms');
  if (r) console.log('answer  ' + r.sol);
  return r && r.len === lv.par ? 0 : 1;
}

/* ---------------- --grep (source gates) ---------------- */
function cmdGrep(){
  var M = loadSim({ noTest:true });
  var src = M.__src, sim = M.__sim;
  var bad = [], i;

  if (/Math\.random/.test(sim)) bad.push('Math.random appears inside the SIM markers');
  var domWords = ['document', 'canvas', 'requestAnimationFrame', 'performance', 'localStorage'];
  for (i = 0; i < domWords.length; i++){
    if (sim.indexOf(domWords[i]) >= 0) bad.push(domWords[i] + ' appears inside the SIM markers');
  }
  if (/[^a-zA-Z_$.]window\b/.test(sim)) bad.push('window appears inside the SIM markers');

  var opens = (src.match(/<script/g) || []).length;
  var closes = (src.match(/<\/script/g) || []).length;
  if (opens !== closes) bad.push('script tag count mismatch, a literal close tag is probably inside a string');

  /* dashes in player facing copy: the static body text, minus tags and script */
  var bodyStart = src.indexOf('<body>'), bodyEnd = src.indexOf('</body>');
  var body = src.slice(bodyStart, bodyEnd);
  body = body.replace(/<script[\s\S]*?<\/script>/g, ' ');
  var textOnly = body.replace(/<[^>]*>/g, '\n');
  var lines = textOnly.split('\n');
  for (i = 0; i < lines.length; i++){
    var ln = lines[i].trim();
    if (!ln) continue;
    if (/[‐-―−]/.test(ln) || /[A-Za-z]-[A-Za-z]/.test(ln)){
      bad.push('dash in body copy: ' + ln.slice(0, 60));
    }
  }
  /* prose looking string literals anywhere in the file */
  var strRe = /(['"])((?:\\.|(?!\1)[^\\\r\n])*)\1/g, m;
  var scriptOnly = src.slice(src.indexOf('<script'));
  while ((m = strRe.exec(scriptOnly))){
    var v = m[2];
    if (v.length < 12) continue;
    if (!/[a-z]{3,}\s[a-z]{2,}\s[a-z]{2,}/i.test(v)) continue;   /* three words or more */
    if (/^[a-z-]+:\s/.test(v)) continue;                          /* css declarations */
    if (/[‐-―−]/.test(v) || /[A-Za-z]-[A-Za-z]/.test(v)){
      bad.push('dash in prose string: ' + v.slice(0, 60));
    }
  }

  /* Element wiring. No browser runs here, so a typo in an id would otherwise
     surface as a dead button in front of a player. Every id the script reaches
     for must exist somewhere in the file, either in the static markup or in
     the markup the script itself writes. */
  var declared = {}, m2, dupes = [];
  var idRe = /id="([A-Za-z0-9_]+)"/g;
  while ((m2 = idRe.exec(src))){
    if (declared[m2[1]]) dupes.push(m2[1]);
    declared[m2[1]] = 1;
  }
  var refRe = /(?:\$\(|getElementById\(|wire\()'([A-Za-z0-9_]+)'/g;
  var missing = {}, refs = 0;
  while ((m2 = refRe.exec(src))){
    refs++;
    if (!declared[m2[1]]) missing[m2[1]] = 1;
  }
  var mk = Object.keys(missing);
  for (i = 0; i < mk.length; i++) bad.push('the script reaches for an element that does not exist: ' + mk[i]);
  /* a duplicate static id would make one of the two unreachable */
  var staticSrc = src.slice(0, src.indexOf('<script'));
  var seenStatic = {}, sm;
  var sIdRe = /id="([A-Za-z0-9_]+)"/g;
  while ((sm = sIdRe.exec(staticSrc))){
    if (seenStatic[sm[1]]) bad.push('duplicate element id in the markup: ' + sm[1]);
    seenStatic[sm[1]] = 1;
  }

  if (bad.length){
    for (i = 0; i < bad.length; i++) console.log('FAIL  ' + bad[i]);
    console.log('');
    console.log('GREP GATES FAILED  ' + bad.length);
    return 1;
  }
  console.log('GREP GATES PASSED');
  console.log('  no Math.random between the SIM markers');
  console.log('  no page objects between the SIM markers');
  console.log('  script tags balanced');
  console.log('  no dash characters in player facing copy');
  console.log('  all ' + refs + ' element lookups resolve to an id that exists');
  return 0;
}

/* ---------------- main ---------------- */
var args = process.argv.slice(2);
function arg(name){
  var i;
  for (i = 0; i < args.length; i++){
    if (args[i] === '--' + name) return true;
    if (args[i].indexOf('--' + name + '=') === 0) return args[i].split('=')[1];
  }
  return null;
}
var code = 0;
if (arg('test')) code = cmdTest();
else if (arg('verify')) code = cmdVerify();
else if (arg('watch')) code = cmdWatch(arg('watch'));
else if (arg('solve')) code = cmdSolve(arg('solve'));
else if (arg('grep')) code = cmdGrep();
else {
  console.log('PARALLEL sim runner');
  console.log('  node sim.js --test        full assertion harness');
  console.log('  node sim.js --verify      the 60 level gates');
  console.log('  node sim.js --watch=12    ASCII frames of a solution');
  console.log('  node sim.js --watch=daily today\'s generated level');
  console.log('  node sim.js --solve=12    fresh BFS of one level');
  console.log('  node sim.js --grep        source gates');
}
/* exitCode rather than exit() so stdout is fully flushed before we die, and so
   a red suite ALWAYS leaves a nonzero status for whatever gate runs above us. */
process.exitCode = code ? 1 : 0;
