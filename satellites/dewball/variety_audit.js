/* Dewball endgame-variety audit.
 *
 * Stephen, 2026-08-08: "when we get to the larger sizes it's not just a bunch of
 * redundant same little things you're picking up finishing your last minute on
 * the level. it's dumb and not fun."
 *
 * LANDMARKS.md measured that complaint ONCE, by hand, before the landmark tier
 * existed. Measuring it by hand again after every batch is how a number quietly
 * stops being true, so this is the instrument. It reports, per world:
 *
 *   - late kinds     distinct kinds at >= goal/3, i.e. what the ball is big
 *                    enough to eat in the closing minutes. This is THE number.
 *   - one-offs       late kinds placed exactly once — the anti-wheelbarrow count.
 *   - worst repeats  the kinds you eat over and over at the end.
 *   - COLLISIONS     a landmark whose silhouette already exists in its OWN
 *                    world's scatter. A bigger teapot among 77 teapots is still
 *                    a redundant same thing, so this is a defect, not a note.
 *
 * ⛔ Not a gate. It prints numbers a human has to judge. Run it after every
 *    scene or landmark batch, and re-check the tightest world's clock too.
 *
 * Run: NODE_PATH=/workspaces/lucid-winds/node_modules node variety_audit.js
 */
var puppeteer = require('puppeteer'), path = require('path');
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1';

/* Silhouette families. Two kinds in the same family read as THE SAME THING at a
   distance, which is the only thing that matters for this complaint — a landmark
   is a shape you have not seen before. Keyed by the base kind so a landmark can
   declare which family it joins. */
var FAMILY = {
  teapot:'teapot', lmTeapotHill:'teapot',
  cakestand:'cake', lmCakeStand:'cake',
  dovecote:'dovecote', lmDovecote:'dovecote',
  booktower:'bookstack', lmBookTower:'bookstack',
  dollhouse:'house', lmDollHouse:'house',
  sundial:'sundial', lmSundial:'sundial',
  kTinRocket:'rocket', lmRocketStand:'rocket',
  clocktower:'clocktower', lmClockTower:'clocktower'
};

(async function(){
  var browser = await puppeteer.launch({ headless:'new', args:[
    '--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader',
    '--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist' ] });
  var page = await browser.newPage();
  var errs = [];
  page.on('pageerror', function(e){ errs.push(String(e)); });
  await page.goto(url, { waitUntil:'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.start', { timeout:8000 });

  /* ⛔ worlds() does not carry a display name, and the array order is
     w1..w5, w7, w6 — so level 6 is The Whole World and level 7 is Dream Meadow.
     Map by LEVEL number, never by array index. */
  var NAME = { 1:'w1 Crumb Country', 2:'w2 Toybox Peaks', 3:'w3 Night Garden',
               4:'w4 Bazaar Lane', 5:'w5 Starfall Bay', 6:'w7 Whole World',
               7:'zen Dream Meadow' };
  var worlds = await page.evaluate(function(){
    return window.DB_DEV.worlds().map(function(w){
      return { n:w.n, goal:w.goal, zen:!!w.zen };
    });
  });
  worlds.forEach(function(w){ w.w = NAME[w.n] || ('lvl'+w.n); });

  var out = [];
  for (var i=0;i<worlds.length;i++){
    var W = worlds[i];
    await page.evaluate(function(n){ window.DB_DEV.start('level', n); }, W.n);
    await new Promise(function(r){ setTimeout(r, 450); });

    var data = await page.evaluate(function(){
      var st = window.DB_DEV.state(), by = {};
      for (var j=0;j<st.objects.length;j++){
        var o = st.objects[j];
        if (!by[o.k]) by[o.k] = { k:o.k, n:0, s:o.s };
        by[o.k].n++;
        if (o.s > by[o.k].s) by[o.k].s = o.s;
      }
      return Object.keys(by).map(function(k){ return by[k]; });
    });
    out.push({ W:W, kinds:data });
  }
  await browser.close();

  console.log('DEWBALL ENDGAME VARIETY  (late = size >= goal/3)\n');
  var head = 'lvl  world  goal      total  kinds  late  one-offs  landmarks';
  console.log(head); console.log('-'.repeat(head.length));
  var collisions = [];
  out.forEach(function(r){
    var goal = r.W.goal, cut = goal/3;
    var late = r.kinds.filter(function(k){ return k.s >= cut; });
    var ones = late.filter(function(k){ return k.n === 1; });
    var lms  = r.kinds.filter(function(k){ return /^lm/.test(k.k); });
    console.log(
      String(r.W.n).padEnd(5) + String(r.W.w).padEnd(7) +
      String(goal+'cm').padEnd(10) +
      String(r.kinds.reduce(function(a,k){return a+k.n;},0)).padEnd(7) +
      String(r.kinds.length).padEnd(7) + String(late.length).padEnd(6) +
      String(ones.length).padEnd(10) + lms.length);

    /* silhouette collisions inside this world */
    var fams = {};
    r.kinds.forEach(function(k){
      var f = FAMILY[k.k]; if (!f) return;
      (fams[f] = fams[f] || []).push(k);
    });
    Object.keys(fams).forEach(function(f){
      var g = fams[f];
      if (g.length < 2) return;
      var lm = g.filter(function(x){ return /^lm/.test(x.k); });
      if (!lm.length) return;
      collisions.push({ w:r.W.w, fam:f, members:g });
    });
  });

  console.log('\nWORST LATE REPEATS  (what the closing minutes actually taste like)');
  out.forEach(function(r){
    var cut = r.W.goal/3;
    var late = r.kinds.filter(function(k){ return k.s >= cut; })
                      .sort(function(a,b){ return b.n - a.n; }).slice(0,5);
    console.log('  ' + String(r.W.w).padEnd(6) +
      late.map(function(k){ return k.k+' x'+k.n; }).join(', '));
  });

  console.log('\nEVERY LATE KIND PER WORLD  (pick new landmark shapes against these)');
  out.forEach(function(r){
    var cut = r.W.goal/3;
    var late = r.kinds.filter(function(k){ return k.s >= cut; })
                      .sort(function(a,b){ return a.k.localeCompare(b.k); });
    console.log('  ' + r.W.w + '  (>=' + Math.round(cut) + 'cm):');
    console.log('    ' + late.map(function(k){ return k.k; }).join(' '));
  });

  console.log('\nSILHOUETTE COLLISIONS  (landmark duplicating a shape in its own world)');
  if (!collisions.length) console.log('  none');
  collisions.forEach(function(c){
    console.log('  ' + c.w + '  family "' + c.fam + '":  ' +
      c.members.map(function(m){ return m.k+' '+Math.round(m.s)+'cm x'+m.n; }).join('   vs   '));
  });

  console.log('\n' + (errs.length ? ('PAGE ERRORS: '+errs.join(' | ')) : 'no page errors'));
})().catch(function(e){ console.error('AUDIT FAILED: '+e.message); process.exit(1); });
