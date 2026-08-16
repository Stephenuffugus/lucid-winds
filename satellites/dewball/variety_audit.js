/* Dewball endgame-variety audit.
 *
 * Stephen, 2026-08-08: "when we get to the larger sizes it's not just a bunch of
 * redundant same little things you're picking up finishing your last minute on
 * the level. it's dumb and not fun."
 *
 * This is the instrument for that complaint. It reports, per world:
 *
 *   - late kinds     distinct kinds at >= goal/3, the historical yardstick that
 *                    LANDMARKS.md's tables are written in. Kept for continuity.
 *   - CLOSING MENU   ⭐ THE HONEST NUMBER. Every object is dated: the ball
 *                    diameter at which the pickup ladder first lets you eat it.
 *                    The closing menu is everything you can only eat AT OR AFTER
 *                    the two-star bar, which is what "the last minutes" actually
 *                    means. goal/3 was always a proxy; this is the thing itself.
 *   - one-offs       closing kinds placed exactly once — the anti-wheelbarrow count.
 *   - COLLISIONS     a landmark whose silhouette already exists in its OWN
 *                    world's scatter. A bigger teapot among 77 teapots is still
 *                    a redundant same thing, so this is a defect, not a note.
 *
 * ⛔ Not a gate. It prints numbers a human has to judge. Run it after every
 *    scene or landmark batch, and re-check the tightest world's clock too.
 *
 * Run:  node variety_audit.js            (no browser, ~6 seconds)
 *       node variety_audit.js --selftest (just prove the instrument still bites)
 *
 * ------------------------------------------------------------------------
 * 2026-08-16 AUDIT — two things were wrong with the previous version and both
 * of them are the same failure mode this project keeps re-learning.
 *
 * ⛔⛔ THE COLLISION CHECK COULD NOT FAIL. It compared kinds against a hand
 *     written FAMILY table listing lmCakeStand, lmTeapotHill, lmDollHouse,
 *     lmSundial and lmRocketStand — five landmarks that were DELETED in the
 *     same commit that fixed the collisions they found. So the table's landmark
 *     half referenced kinds no world places any more, every family came back
 *     with one member, and the audit had printed a confident "none" ever since.
 *     A hand-maintained list of the defects you already fixed cannot find the
 *     next one. Families are DERIVED now, from the kind ids and display names of
 *     whatever the world actually contains, and the derivation is self-tested
 *     below against a fixture that must produce a hit.
 *
 * ⛔ IT NEEDED CHROMIUM. Nothing in it renders, so it never did. It now boots
 *    the real game in plain node through node_harness.js. Proof the harness is
 *    the same engine and not a model of it: every world's absorbAll ceiling comes
 *    back identical to the decimal to the figures LANDMARKS.md recorded from the
 *    browser (325.4 / 677.5 / 1607.0 / 2804.3 / 6090.5 / 12677.3).
 */
var H = require('./node_harness.js');

/* --- the pickup ladder, mirrored from index.html (prRatio) ----------------
   ⛔ this is the ONE thing this file mirrors, because the ladder decides what
   "late" means. If PICKUP_RATIO/PICKUP_RAMP ever move, move them here too —
   ladderSelfTest below will not catch a silent retune, only a broken solver. */
function prRatio(D){ var t=Math.log(D/40)/Math.log(30); if(t<0)t=0; if(t>1)t=1;
  return 0.55+0.17*t; }
/* smallest ball diameter that can eat an object of size s (f(D)=D*prRatio(D)
   is strictly increasing, so bisect) */
function eatAt(s){
  var lo=0.01, hi=Math.max(4, s*4), i;
  while (hi*prRatio(hi) < s) hi *= 2;
  for (i=0;i<60;i++){ var m=(lo+hi)/2; if (m*prRatio(m) < s) lo=m; else hi=m; }
  return hi;
}

/* --- silhouette families, DERIVED ----------------------------------------
   Two kinds read as the same thing at a distance when they are the same object.
   The game already says so, twice, in the only two places a human ever writes it
   down: the kind id and the display name. "lmDovecote" against "dovecote",
   "The Great Teapot" against "Tea Pot". So tokenize both and look for a shared
   noun. This finds pairs nobody remembered to enumerate, which is the entire
   point — the old hand table only knew the six collisions that had already been
   found and fixed. */
var STOP = { the:1, of:1, a:1, and:1, old:1, great:1, little:1, big:1, grand:1,
             tall:1, small:1, giant:1, new:1, house:0 };
function tokens(id, nm){
  var t = {}, i, w;
  var idw = String(id).replace(/^lm/, '').replace(/^k([A-Z])/, '$1')
              .replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z0-9]+/);
  var nmw = String(nm||'').toLowerCase().split(/[^a-z0-9]+/);
  for (i=0;i<idw.length;i++){ w=idw[i]; if(w.length>2&&!STOP[w]) t[w]=1; }
  for (i=0;i<nmw.length;i++){ w=nmw[i]; if(w.length>2&&!STOP[w]) t[w]=1; }
  /* crude but effective de-pluralising: "stones" and "stone" are one shape */
  var out={}, k; for(k in t){ out[k.replace(/s$/,'')]=1; }
  return out;
}
function headNoun(id, nm){
  var w = String(nm||id).toLowerCase().split(/[^a-z0-9]+/).filter(function(x){ return x && !STOP[x]; });
  if (!w.length) return null;
  return w[w.length-1].replace(/s$/,'');
}
/* Returns null, or { on:<word>, hard:true|false }.
   HARD = the two things are the same object: either their base ids contain one
   another, or their display names end on the same noun. That is a collision and
   the tier exists to prevent it.
   SOFT = they merely share a word ("Moon Bridge" next to "Moon Mushroom", "Toy
   Train" next to "Toy Drum"). Worth a human glance, never a defect on its own —
   grading those as defects is how a report becomes noise nobody reads.
   ⛔ the id containment needs 5+ characters: "jackbox" contains "jack", and a
   jack-in-the-box looks nothing like a six-pointed metal jack. */
function shareShape(a, b){
  var sa = String(a.k).replace(/^lm/,'').replace(/^k(?=[A-Z])/,'').toLowerCase();
  var sb = String(b.k).replace(/^k(?=[A-Z])/,'').toLowerCase();
  if (sa.length >= 5 && sb.length >= 5 && (sa.indexOf(sb) >= 0 || sb.indexOf(sa) >= 0))
    return { on:(sa.length<sb.length?sa:sb), hard:true };
  var ha = headNoun(a.k, a.nm), hb = headNoun(b.k, b.nm);
  if (ha && ha === hb && ha.length >= 4) return { on:ha, hard:true };
  var ta = tokens(a.k, a.nm), tb = tokens(b.k, b.nm), k;
  for (k in ta) if (tb[k]) return { on:k, hard:false };
  return null;
}

/* --- ⚖️ THE INSTRUMENT HAS TO BITE, so prove it every run -----------------
   A probe that cannot fail is not evidence. These fixtures are the exact
   defects this file exists to find; if it stops finding them it exits 2 rather
   than printing a clean report. */
function selfTest(){
  var fails = [];
  /* 1. the historical collisions must still be detectable */
  var pairs = [
    [{k:'lmTeapotHill',nm:'The Great Teapot'}, {k:'teapot',nm:'Tea Pot'}],
    [{k:'lmCakeStand', nm:'The Fondant Tower'},{k:'cakestand',nm:'Cake Stand'}],
    [{k:'lmDollHouse', nm:"The Doll's House"}, {k:'dollhouse',nm:"Doll's House"}],
    [{k:'lmSundial',   nm:'The Moon Sundial'}, {k:'sundial',nm:'Sundial'}],
    [{k:'lmBookTower', nm:'The Leaning Library'},{k:'booktower',nm:'Book Tower'}],
    [{k:'lmClockTower',nm:'The Saffron Clock'}, {k:'clocktower',nm:'Clock Tower'}]
  ];
  for (var i=0;i<pairs.length;i++){ var g = shareShape(pairs[i][0], pairs[i][1]);
    if (!g || !g.hard)
      fails.push('collision detector MISSED ' + pairs[i][0].k + ' vs ' + pairs[i][1].k); }
  /* 2. and it must not GRADE AS A COLLISION things that look nothing alike.
        The last two are live pairs in the shipped worlds that share a word and
        nothing else — if either is ever graded hard, the report is noise. */
  var apart = [
    [{k:'lmGramophone',nm:'The Gramophone'}, {k:'teapot',nm:'Tea Pot'}],
    [{k:'lmHelterSkelter',nm:'The Helter Skelter'}, {k:'rowboat',nm:'Rowing Boat'}],
    [{k:'lmLongClock',nm:'The Longcase Clock'}, {k:'cracker',nm:'Cream Cracker'}],
    [{k:'lmJackBox',nm:'The Jack-in-the-Box'}, {k:'jack',nm:'Toy Jack'}],
    [{k:'lmMoonBridge',nm:'The Moon Bridge'}, {k:'mushroom',nm:'Moon Mushroom'}]
  ];
  for (i=0;i<apart.length;i++){ var f = shareShape(apart[i][0], apart[i][1]);
    if (f && f.hard) fails.push('collision detector FALSE POSITIVE ' + apart[i][0].k + ' vs ' +
                      apart[i][1].k + ' on "' + f.on + '"'); }
  /* 3. the ladder solver must invert the game's own rule */
  var probes = [4, 24, 170, 900, 2200, 5200];
  for (i=0;i<probes.length;i++){ var D = eatAt(probes[i]);
    if (Math.abs(D*prRatio(D) - probes[i]) > probes[i]*0.001)
      fails.push('eatAt(' + probes[i] + ') does not invert prRatio'); }
  if (eatAt(100) <= eatAt(10)) fails.push('eatAt is not monotonic');
  return fails;
}

var st = selfTest();
if (st.length){
  console.error('⛔ VARIETY AUDIT SELF-TEST FAILED — the instrument is broken, not the game:');
  st.forEach(function(f){ console.error('   ' + f); });
  process.exit(2);
}
if (process.argv.indexOf('--selftest') > 1){
  console.log('variety_audit self-test OK (6 collision fixtures, 5 negatives, ladder solver)');
  process.exit(0);
}

/* ------------------------------------------------------------------------ */
var D = H.boot({ seed: +(process.argv[2] || 12345) || 12345 });
var PROPS = D.props();
function nameOf(k){ return (PROPS[k] && PROPS[k].nm) || k; }
function volOf(k, s){ var f = (PROPS[k] && PROPS[k].volF) || 1;
  return 0.75 * (Math.PI/6) * s*s*s * f; }

var worlds = D.worlds(), out = [];
worlds.forEach(function(W){
  D.start('level', W.n);
  var s = D.state(), by = {}, i, o, b;
  for (i=0;i<s.objects.length;i++){
    o = s.objects[i];
    b = by[o.k] || (by[o.k] = { k:o.k, nm:nameOf(o.k), n:0, s:0, smin:1e18, fixed:!!o.f, mover:!!o.m, vol:0 });
    b.n++; b.vol += volOf(o.k, o.s);
    if (o.s > b.s) b.s = o.s;
    if (o.s < b.smin) b.smin = o.s;
  }
  var ceil = D.absorbAll();
  out.push({ W:W, kinds:Object.keys(by).map(function(k){ return by[k]; }), ceil:ceil });
});

/* the zen world has no goal or star bars; date its closing stretch off its own
   ceiling instead, or it silently reports its entire contents as "late" */
function bars(r){
  var W = r.W;
  if (!W.zen) return { goal:W.goal, s2:W.s2, s3:W.s3 };
  return { goal:Math.round(r.ceil*0.25), s2:Math.round(r.ceil*0.58), s3:Math.round(r.ceil*0.85) };
}

console.log('DEWBALL ENDGAME VARIETY   (node harness, seed ' + (process.argv[2]||12345) + ')\n');
var head = 'lvl  world               goal      total  kinds  late  CLOSING  one-offs  landmarks';
console.log(head); console.log('-'.repeat(head.length));
out.forEach(function(r){
  var B = bars(r), cut = B.goal/3;
  var late = r.kinds.filter(function(k){ return k.s >= cut; });
  var close = r.kinds.filter(function(k){ return k.s >= B.s2 * prRatio(B.s2); });
  var ones = close.filter(function(k){ return k.n === 1; });
  var lms  = r.kinds.filter(function(k){ return /^lm/.test(k.k); });
  r._late = late; r._close = close; r._bars = B;
  console.log(
    String(r.W.n).padEnd(5) + String(r.W.id + ' ' + r.W.nm).padEnd(20) +
    String(B.goal + 'cm').padEnd(10) +
    String(r.kinds.reduce(function(a,k){ return a+k.n; }, 0)).padEnd(7) +
    String(r.kinds.length).padEnd(7) + String(late.length).padEnd(6) +
    String(close.length).padEnd(9) + String(ones.length).padEnd(10) + lms.length);
});

console.log('\nTHE CLOSING MENU  (only edible at or after the ★★ bar — what the last minutes taste like)');
console.log('   share = of everything eaten in that stretch, by COUNT / by VOLUME');
out.forEach(function(r){
  var tot = 0, vol = 0;
  r._close.forEach(function(k){ tot += k.n; vol += k.vol; });
  console.log('  ' + r.W.id + ' ' + r.W.nm + '   ★★ ' + r._bars.s2 + 'cm  ->  ceiling ' +
              Math.round(r.ceil) + 'cm   (' + tot + ' objects across ' + r._close.length + ' kinds)');
  r._close.slice().sort(function(a,b){ return b.n - a.n; }).slice(0,6).forEach(function(k){
    console.log('      ' + String(k.n + 'x').padStart(6) + '  ' + String(k.nm).padEnd(24) +
      String(Math.round(k.n/tot*100) + '%').padStart(5) + ' / ' +
      String(Math.round(k.vol/vol*100) + '%').padStart(4) + '  ' + Math.round(k.s) + 'cm' +
      (k.fixed ? '  [wall/structure]' : ''));
  });
});

console.log('\nEVERY CLOSING KIND PER WORLD  (pick new landmark shapes against these)');
out.forEach(function(r){
  console.log('  ' + r.W.id + ' ' + r.W.nm + ':');
  console.log('    ' + r._close.map(function(k){ return k.k; }).sort().join(' '));
});

/* --- collisions ----------------------------------------------------------- */
console.log('\n⛔ SILHOUETTE COLLISIONS  (landmark duplicating a shape in its OWN world)');
var hard = [], soft = [];
out.forEach(function(r){
  var lms = r.kinds.filter(function(k){ return /^lm/.test(k.k); });
  var base = r.kinds.filter(function(k){ return !/^lm/.test(k.k); });
  lms.forEach(function(L){
    base.forEach(function(Bk){
      var g = shareShape(L, Bk); if (!g) return;
      var line = '  ' + r.W.id + '  "' + g.on + '":  ' + L.k + ' ' + L.nm + ' ' +
        Math.round(L.s) + 'cm x' + L.n + '   vs   ' + Bk.k + ' ' + Bk.nm + ' ' +
        Math.round(Bk.s) + 'cm x' + Bk.n + (Bk.s >= L.s ? '   ⛔ LANDMARK IS NOT THE BIGGER ONE' : '');
      (g.hard ? hard : soft).push(line);
    });
  });
});
if (!hard.length) console.log('  none  (detector self-tested against 6 known collisions this run)');
hard.forEach(function(l){ console.log(l); });
console.log('\n   shared naming only (look at the shapes, then ignore or rename):');
soft.forEach(function(l){ console.log('  ' + l); });

/* --- ⭐ THE TOP OF THE LADDER -------------------------------------------
   The variety question has a second half that counting kinds cannot see: is
   there anything up there AT ALL? Every object is dated by the ball diameter
   that can first eat it, so the world can be asked directly whether growing
   past the two- and three-star bars ever unlocks a new meal. If it does not,
   the closing stretch is by definition hoovering leftovers you could already
   eat — which is the complaint, stated at the ladder instead of the prop list. */
console.log('\nTOP OF THE LADDER  (does growing past a star bar unlock anything?)');
var lh = 'world  ★★      ★★★     ceiling  biggest prop            needs ball  objs>=★★  objs>=★★★';
console.log(lh); console.log('-'.repeat(lh.length));
out.forEach(function(r){
  var B = r._bars, mx = null, n2 = 0, n3 = 0;
  r.kinds.forEach(function(k){ if (!mx || k.s > mx.s) mx = k; });
  r.kinds.forEach(function(k){ var d = eatAt(k.s); if (d >= B.s2) n2 += k.n; if (d >= B.s3) n3 += k.n; });
  console.log(String(r.W.id).padEnd(7) + String(B.s2).padEnd(8) + String(B.s3).padEnd(8) +
    String(Math.round(r.ceil)).padEnd(9) + String(mx.nm + ' ' + Math.round(mx.s) + 'cm').padEnd(24) +
    String(Math.round(eatAt(mx.s))).padEnd(12) + String(n2).padEnd(10) + n3 +
    (n3 === 0 ? '   ⛔ nothing in this world needs a 3-star ball' : ''));
});

/* --- the anti-wheelbarrow count ------------------------------------------- */
console.log('\nWORST CLOSING REPEATS  (one kind eaten over and over is the complaint)');
out.forEach(function(r){
  var tot = 0; r._close.forEach(function(k){ tot += k.n; });
  var top = r._close.slice().sort(function(a,b){ return b.n - a.n; })[0];
  if (!top) { console.log('  ' + r.W.id + '  (no closing stretch)'); return; }
  var flag = (top.n/tot > 0.25) ? '  ⛔ over a quarter of the closing stretch is ONE kind' : '';
  console.log('  ' + String(r.W.id).padEnd(4) + String(top.nm).padEnd(24) + 'x' +
    String(top.n).padEnd(6) + Math.round(top.n/tot*100) + '% of closing pickups' + flag);
});
console.log('');
