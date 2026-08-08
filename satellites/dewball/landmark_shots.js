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
  { w:2, kinds:['lmDollHouse','lmCarousel'] },
  { w:3, kinds:['lmGlasshouse','lmSundial'] },
  { w:4, kinds:['lmCaravanGate','lmSpiceHall'] },
  { w:5, kinds:['lmPierPavilion','lmDryDock','lmCannery'] },
  { w:6, kinds:['lmCathedral','lmAqueduct','lmObservatory'] }   // w7 is index 6
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
      var kind = plan.kinds[ki];
      var found = await page.evaluate(function(k){
        var st = window.DB_DEV.state();
        for (var i=0;i<st.objects.length;i++) if (st.objects[i].k===k)
          return { x:st.objects[i].x, z:st.objects[i].z, s:st.objects[i].s };
        return null;
      }, kind);

      if (!found){ report.push(kind+': NOT PLACED in world '+plan.w); continue; }

      /* ⛔ POSITIONING IS NOT AIMING. The camera trails the ball along its
         HEADING, so parking the ball near a landmark leaves the landmark behind
         the camera about half the time, and the first pass of this shot showed
         a lovely empty beach. Park back along one axis, then roll TOWARD the
         landmark and let the camera swing in behind. */
      await page.evaluate(function(a){
        var D = window.DB_DEV;
        D.setD(Math.max(4, a.s*0.62));
        var off = a.s*2.2;
        D.setPos(a.x - off, a.z - off);
        D.roll(0.75, 0.75);                 /* head toward it */
        for (var i=0;i<150;i++) D.step(0.016);
        D.roll(0,0);
        for (var j=0;j<20;j++) D.step(0.016);
      }, found);
      await new Promise(function(r){ setTimeout(r, 350); });
      /* let the world intro card fade, or it sits over the shot */
      await new Promise(function(r){ setTimeout(r, 1400); });
      await page.evaluate(function(){ if(window.DB_DEV.render) window.DB_DEV.render(); });
      await page.screenshot({ path: path.join(OUT, kind+'.png') });
      report.push(kind+': placed at '+Math.round(found.x)+','+Math.round(found.z)+'  size '+Math.round(found.s)+'cm');
    }
  }

  await browser.close();
  console.log(report.join('\n'));
  console.log(errs.length ? ('PAGE ERRORS: '+errs.join(' | ')) : 'no page errors');
  console.log('images in '+OUT+'  — now OPEN them');
})().catch(function(e){ console.error('SHOTS FAILED: '+e.message); process.exit(1); });
