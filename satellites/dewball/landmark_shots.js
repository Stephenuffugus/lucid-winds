/* Dewball landmark gallery.
 *
 * A landmark is a thing you steer toward for a minute. If it does not survive
 * being looked at, it is not a landmark, it is a bigger box. So this parks the
 * real ball next to each one at the size a player would be when they meet it,
 * steps the real render loop, and shoots it.
 *
 * ⛔ This is not a gate and it must never become one. A green assertion cannot
 * see a silhouette. The output is the images, and somebody has to open them.
 *
 * Run: NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js [outDir]
 */
var puppeteer = require('puppeteer'), path = require('path'), fs = require('fs');
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1';
var OUT = process.argv[2] || '/tmp/dewball-landmarks';

var PLAN = [
  // ⛔ w HERE IS A 1-BASED LEVEL NUMBER, not an array index: DB_DEV.start does
  // idx=n-1. And the ARRAY runs w1..w5, w7, w6, so level 6 is THE WHOLE WORLD
  // and level 7 is Dream Meadow. Get this wrong and the probe cheerfully shoots
  // the wrong planet and reports success.
  //
  // ⛔⛔ `d` IS THE BALL'S DIAMETER, NOT THE CAMERA DISTANCE. setD sizes the ball
  // and the camera merely trails it, so raising `d` to "fit a tall landmark in
  // frame" instead GROWS THE BALL until it eats the thing being photographed. I
  // did exactly that: d=0.8 on the stadium produced a 41.5m ball chewing a 46m
  // stadium at x53 combo, which is a lovely picture of nothing.
  // To stand further back, raise `off` — the park distance — and leave `d` alone.
  // Tall-for-their-size kinds therefore carry an `off`, never a `d`.
  { w:1, kinds:['lmCardHouse','lmGramophone','lmBookTower'] },
  { w:2, kinds:[{k:'lmJackBox',off:2.7},'lmBlockFort','lmToyTrain','lmRocketStand'] },
  { w:3, kinds:[{k:'lmTopiaryStag',off:2.8},'lmDovecote','lmGazeboPond'] },
  { w:4, kinds:['lmClockTower','lmBathHouse'] },
  { w:5, kinds:[{k:'lmFerrisWheel',off:3.2},{k:'lmGrandHotel',off:2.6}] },
  { w:6, kinds:[{k:'lmSuspBridge',off:3.4},{k:'lmStadium',off:3.0},'lmPalace'] },
  { w:7, kinds:['lmMoonGate','lmPagoda','lmStoneCircle'] }
];

(async function(){
  fs.mkdirSync(OUT, { recursive:true });
  /* ⛔ WITHOUT THESE FLAGS THE CANVAS IS SIMPLY BLACK. Default headless Chrome has
     no WebGL, so the HUD renders, the timer counts, the run "succeeds", and
     every screenshot comes back empty. The first pass of this probe reported
     twelve landmarks placed with no page errors and produced twelve black
     images. A green run is not a look, and this is what that costs. */
  var browser = await puppeteer.launch({ headless:'new', args:[
    '--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader',
    '--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist' ] });
  var page = await browser.newPage();
  var errs = [];
  page.on('pageerror', function(e){ errs.push(String(e)); });
  await page.setViewport({ width:1280, height:820, deviceScaleFactor:1 });
  await page.goto(url, { waitUntil:'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.start', { timeout:8000 });

  var report = [];
  for (var pi=0; pi<PLAN.length; pi++){
    var plan = PLAN[pi];
    await page.evaluate(function(n){ window.DB_DEV.start('level', n); }, plan.w);
    await new Promise(function(r){ setTimeout(r, 500); });

    for (var ki=0; ki<plan.kinds.length; ki++){
      var spec = plan.kinds[ki];
      var kind     = (typeof spec === 'string') ? spec : spec.k;
      var dScale   = (typeof spec === 'string' || !spec.d)   ? 0.42 : spec.d;
      var offScale = (typeof spec === 'string' || !spec.off) ? 1.9  : spec.off;
      var found = await page.evaluate(function(k){
        var st = window.DB_DEV.state();
        for (var i=0;i<st.objects.length;i++) if (st.objects[i].k===k)
          return { x:st.objects[i].x, z:st.objects[i].z, s:st.objects[i].s };
        return null;
      }, kind);

      if (!found){ report.push(kind+': NOT PLACED in world '+plan.w); continue; }

      /* ⛔⛔ POSITIONING IS NOT AIMING, AND AIMING BY DRIVING OVERSHOOTS. The
         camera trails the ball along its HEADING, so parking next to a landmark
         leaves it behind the camera half the time. The first fix was to roll
         toward it, which aimed correctly and then drove straight past: 150 steps
         is 2.4 seconds of travel and the Block Fort shot came back as an empty
         playroom floor with the fort somewhere off camera.
         So: roll a SHORT burst to establish heading, re-park at the framing
         distance without touching the heading, then coast. */
      async function shoot(a, dscale, offscale, suffix){
        await page.evaluate(function(o){
          var D = window.DB_DEV, a = o.a;
          D.setD(Math.max(4, a.s*o.d));
          var off = a.s*o.off, k = 0.7071;              /* park on the diagonal */
          D.setPos(a.x - off*k, a.z - off*k);
          D.roll(0.75, 0.75);
          for (var i=0;i<24;i++) D.step(0.016);          /* just enough to turn */
          D.roll(0,0);
          D.setPos(a.x - off*k, a.z - off*k);            /* undo the drift */
          for (var j=0;j<26;j++) D.step(0.016);          /* let the camera settle */
        }, { a:a, d:dscale, off:offscale });
        await new Promise(function(r){ setTimeout(r, 700); });
        await page.evaluate(function(){ if(window.DB_DEV.render) window.DB_DEV.render(); });
        await page.screenshot({ path: path.join(OUT, kind+suffix+'.png') });
      }
      /* let the world intro card fade, or it sits over the shot */
      await new Promise(function(r){ setTimeout(r, 1500); });
      /* ⭐ TWO SHOTS, per the project rule. The first is where the PLAYER stands
         when they meet it. The second is the wide one, because a landmark that
         only works in close-up is not doing the job a landmark is for. */
      await shoot(found, dScale, offScale, '');
      /* ⛔ THE WIDE SHOT MUST NOT GROW THE BALL. Camera distance is tied to ball
         size here, so my first "wide" set the ball to 1.3x the landmark, and it
         simply ATE it: the frame came back as a 60m ball on a stripped planet
         with a x16 combo counter. Wide means standing further back at the same
         size, which is also what the player actually experiences. */
      await shoot(found, dScale, offScale * 3.16, '-wide');
      report.push(kind+': placed at '+Math.round(found.x)+','+Math.round(found.z)+'  size '+Math.round(found.s)+'cm');
    }
  }

  await browser.close();
  console.log(report.join('\n'));
  console.log(errs.length ? ('PAGE ERRORS: '+errs.join(' | ')) : 'no page errors');
  console.log('images in '+OUT+'  — now OPEN them');
})().catch(function(e){ console.error('SHOTS FAILED: '+e.message); process.exit(1); });
