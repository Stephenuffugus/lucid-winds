/* Dewball landmark gallery.
 *
 * A landmark is a thing you steer toward for a minute. If it does not survive
 * being looked at, it is not a landmark, it is a bigger box. So this parks the
 * real ball next to each one at the size a player would be when they meet it,
 * frames it with the real camera, and shoots it.
 *
 * ⛔ This is not a gate and it must never become one. A green assertion cannot
 * see a silhouette. The output is the images, and somebody has to open them.
 *
 * ⛔⛔ BUT IT MUST BE ABLE TO FAIL. The first version of this file reported
 * "lmNoria: placed at -17021,6271 size 900cm" and "no page errors" for a
 * photograph of empty ground with no water wheel anywhere in it. An unaimed
 * probe that cannot tell you it missed is worse than no probe, because the
 * looking that follows it is spent on pictures of dirt. Every shot now carries
 * the subject's measured position in frame, and a shot that missed says MISSED.
 *
 * Run: NODE_PATH=/workspaces/lucid-winds/node_modules node landmark_shots.js [outDir] [levelN]
 *
 * ⭐ levelN shoots ONE world. A full run is seven world builds and ~40 software
 *    -rendered screenshots, which on a 2-core box with ~1.7GB free is enough to
 *    get the renderer OOM-killed mid-gallery. Iterate on one world, then do the
 *    full pass when you actually need the whole set.
 */
var puppeteer = require('puppeteer'), path = require('path'), fs = require('fs');
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1';
var OUT = process.argv[2] || '/tmp/dewball-landmarks';
var ONLY = +(process.argv[3] || 0) || 0;

var PLAN = [
  // ⛔ w HERE IS A 1-BASED LEVEL NUMBER, not an array index: DB_DEV.start does
  // idx=n-1. And the ARRAY runs w1..w5, w7, w6, so level 6 is THE WHOLE WORLD
  // and level 7 is Dream Meadow. Get this wrong and the probe cheerfully shoots
  // the wrong planet and reports success.
  //
  // ⭐ No per-kind `off` overrides any more. Framing distance used to be hand
  // tuned per landmark off the kind's declared `size`, which is a FOOTPRINT: the
  // 3400cm Ferris wheel left the top of frame and the 4600cm Long Span was a
  // smudge, because span and height are different numbers. The probe now
  // measures the subject's real projected box and moves until it fits.
  { w:1, kinds:['lmLongClock','lmGramophone','lmBookTower'] },
  { w:2, kinds:['lmJackBox','lmBlockFort','lmToyTrain','lmRocketStand'] },
  { w:3, kinds:['lmTopiaryStag','lmDovecote','lmGazeboPond','lmArmillary','lmMoonBridge'] },
  { w:4, kinds:['lmClockTower','lmBathHouse','lmNoria','lmSilkPavilion'] },
  { w:5, kinds:['lmFerrisWheel','lmGrandHotel','lmHelterSkelter','lmBrokenKeel','lmMooredBalloon'] },
  { w:6, kinds:['lmSuspBridge','lmStadium','lmPalace'] },
  { w:7, kinds:['lmMoonGate','lmPagoda','lmStoneCircle'] }
];

/* Composition targets, in frame fractions (1 = the whole frame).
 * ⛔ THE BALL IS ALWAYS DEAD CENTRE. updateCamera does lookAt(ball), so there is
 * no such thing as a shot with the ball off to one side. A subject centred in
 * frame is therefore a subject standing BEHIND the ball, which at these ball
 * sizes means largely hidden by it. So the subject is deliberately placed to one
 * side, just clear of the ball's edge, and the ball reads as the scale reference
 * it is meant to be. */
var CLOSE_H = 0.48;   /* subject fills about half the frame height when met */
var WIDE_H  = 0.17;   /* and about a sixth of it from back where you first see it */
var BALL_HALF_NDC = 0.24;  /* the ball's own half width at the usual trail distance */

(async function(){
  fs.mkdirSync(OUT, { recursive:true });
  /* ⛔ WITHOUT THESE FLAGS THE CANVAS IS SIMPLY BLACK. Default headless Chrome has
     no WebGL, so the HUD renders, the timer counts, the run "succeeds", and
     every screenshot comes back empty. The first pass of this probe reported
     twelve landmarks placed with no page errors and produced twelve black
     images. A green run is not a look, and this is what that costs. */
  /* ⛔ protocolTimeout, and it is not optional on a 2-core box. The default 30s
     killed a whole run at world 2 with "Runtime.callFunctionOn timed out" and
     threw away thirty already-good images, because building a heavy world inside
     one evaluate() can outlast it under load. */
  var browser = await puppeteer.launch({ headless:'new', protocolTimeout: 240000, args:[
    '--no-sandbox','--disable-setuid-sandbox','--enable-unsafe-swiftshader',
    '--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist' ] });
  var page = await browser.newPage();
  var errs = [];
  page.on('pageerror', function(e){ errs.push(String(e)); });
  await page.setViewport({ width:1280, height:820, deviceScaleFactor:1 });
  await page.goto(url, { waitUntil:'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.frame', { timeout:8000 });

  var report = [], bad = 0;
  for (var pi=0; pi<PLAN.length; pi++){
    var plan = PLAN[pi];
    if (ONLY && plan.w !== ONLY) continue;
    /* ⛔ one world's stall must not cost the other six. A gallery is worth having
       partially; losing every image because level 2 was slow is not. */
    try {
      await page.evaluate(function(n){ window.DB_DEV.start('level', n); }, plan.w);
    } catch (e) {
      report.push('WORLD '+plan.w+' FAILED TO START: '+e.message);
      continue;
    }
    await new Promise(function(r){ setTimeout(r, 500); });
    /* ⛔ SETTLE THE WORLD BEFORE FRAMING IT, NOT AFTER. The probe used to park the
       ball, frame the shot, then run a dozen ticks "to let the world breathe" —
       and those were the world's FIRST ticks, because wall-clock waiting does not
       advance a sim that only moves on step(). The opening ticks shift the ball
       12.9 METRES, so every shot was composed at one place and taken from
       another; the Grand Hotel measured a clean fit and came back cropped, and
       correcting the fit could never work because the correction was measured
       before the move. Run the opening here, once per world, then nothing after
       the framing is settled. */
    await page.evaluate(function(){
      for (var i=0;i<40;i++) window.DB_DEV.step(0.016); });
    /* the world's own numbers: a park outside the bound gets dragged back, and
       predicting that beats provoking it with a tick that eats the scenery */
    var wInfo = await page.evaluate(function(n){
      var w = window.DB_DEV.worlds()[n-1];
      return { bound:w.bound, wrap:!!w.wrap }; }, plan.w);

    for (var ki=0; ki<plan.kinds.length; ki++){
      var spec = plan.kinds[ki];
      var kind   = (typeof spec === 'string') ? spec : spec.k;
      var dScale = (typeof spec === 'string' || !spec.d) ? 0.42 : spec.d;
      var found = await page.evaluate(function(k){
        var st = window.DB_DEV.state();
        for (var i=0;i<st.objects.length;i++) if (st.objects[i].k===k)
          return { x:st.objects[i].x, z:st.objects[i].z, s:st.objects[i].s };
        return null;
      }, kind);

      if (!found){ report.push(kind+': ⛔ NOT PLACED in world '+plan.w); bad++; continue; }

      /* Park, aim, MEASURE, correct, repeat. Three knobs, each measured rather
         than assumed: park distance sets how big the subject is, camera yaw sets
         where it sits left to right, camera pitch sets it up and down. They
         interact (pitch changes the camera's ground distance), so the cycle runs
         a few times and the last measurement is the one reported.
         ⛔ The old version tried to aim by ROLLING THE BALL toward the subject.
         That never worked and could never have worked: the camera assist that
         turns the view toward travel sits below the TEST early-return in
         readInput, so camYaw is pinned at zero and every headless frame looks
         down +z. Parking on the 45 degree diagonal then put the subject just
         outside a 43.2 degree half-FOV, which is the whole reason w4 came back
         as pictures of dirt. */
      async function frameShot(a, hTarget, suffix){
        var fit = await page.evaluate(function(o){
          var D = window.DB_DEV, a = o.a, bear = Math.PI/4;
          /* ⛔⛔ THE WORLD CLAMPS A BALL PARKED OUTSIDE ITS BOUNDS, and it does it
             on the very next tick no matter how small that tick is: at Starfall
             Bay a park 2120cm beyond the edge came back 1287cm away from where it
             was asked for, from a 2ms step. So the tick happens HERE, before the
             camera is aimed — otherwise every number is measured at a spot the
             ball is about to leave, which is how the Grand Hotel could be framed
             perfectly and photographed cropped, twice, with the correction loop
             working on numbers that no longer applied. */
          /* ⛔⛔ AND A TICK IS NOT FREE: IT EATS THE WORLD. This is a katamari, so a
             parked ball absorbs whatever it is touching on the very next tick,
             instantly, regardless of dt. Ticking inside the sweep meant twenty-odd
             re-parks of a 22-metre ball across a landmark's neighbourhood — the
             wide shot of The Long Span came back at 33.6m with a x97 combo over a
             STRIPPED PLANET. Every wide shot was a photograph of a world the probe
             had just devoured, which is the opposite of what it is for.
             ⭐ So: no ticks while framing. The clamp was the only reason one was
             needed, and a clamp can be predicted instead of provoked — park inside
             the bound in the first place. One tick at the end syncs mesh and HUD. */
          function place(off, yawOff, pitch, doTick){
            var wx = a.x - off*Math.sin(bear), wz = a.z - off*Math.cos(bear);
            if (!o.wrap){                        /* discs clamp; wrapping charts don't */
              var pr = Math.sqrt(wx*wx + wz*wz), lim = o.bound*0.95;
              if (pr > lim){ wx = wx/pr*lim; wz = wz/pr*lim; }
            }
            D.setPos(wx, wz);
            if (doTick) D.step(0.002);
            var s = D.state();
            var c = D.aimAt(a.x, a.z);
            D.setCam(c.yaw + yawOff, pitch);
            D.camSettle();
            var f = D.frame(o.k);
            if (f){ var sx = s.ballX - wx, sz = s.ballY - wz;
                    f.slip = Math.sqrt(sx*sx + sz*sz); }
            return f;
          }
          function clamp(v,lo,hi){ return v<lo?lo:(v>hi?hi:v); }
          var off = a.s * 2.4, yawOff = 0, pitch = 0.62, f, g, slope, want, r, i;
          D.setD(Math.max(4, a.s * o.d));
          f = place(off, yawOff, pitch);
          if (!f) return null;
          function converge(){
          for (var pass=0; pass<3; pass++){
            /* ⛔ AND IF IT IS GONE, COME BACK. The size step is guarded on h>0.004,
               so once an overshoot pushed the subject over a globe's horizon the
               loop measured h=0, skipped its own correction, and sat there — the
               Long Span reported VANISHES WIDE from a distance it is in fact
               perfectly visible at. I nearly wrote that up as a law about
               curvature. It was the guard eating its own recovery. */
            for (var back=0; back<6 && f && f.h <= 0.004; back++){
              off = Math.max(a.s*0.8, off*0.55); f = place(off, yawOff, pitch);
            }
            /* size: projected height goes as 1/distance, so the ratio IS the move */
            if (f.h > 0.004){ r = clamp(f.h / o.hT, 0.4, 2.6); off = clamp(off*r, a.s*0.8, a.s*60); }
            f = place(off, yawOff, pitch);
            /* left-right: secant, so the sign of the mapping is learned, not assumed */
            want = -Math.min(o.BALL + f.w, 0.95 - f.w);
            g = place(off, yawOff + 0.12, pitch);
            slope = (g.cx - f.cx) / 0.12;
            if (Math.abs(slope) > 0.05) yawOff = clamp(yawOff + (want - f.cx)/slope, -1.2, 1.2);
            f = place(off, yawOff, pitch);
            /* up-down: same trick on pitch, which the engine clamps to 0.22..1.12 */
            g = place(off, yawOff, clamp(pitch + 0.08, 0.22, 1.12));
            slope = (g.cy - f.cy) / 0.08;
            if (Math.abs(slope) > 0.05) pitch = clamp(pitch + (0 - f.cy)/slope, 0.22, 1.12);
            f = place(off, yawOff, pitch);
          } }

          /* ⭐ WALK AROUND IT — AT THE PITCH THE SHOT WILL ACTUALLY USE. A landmark
             stands in a built world and the approach the probe used to hard-code
             was as likely as not the one with a row of market stalls in it: the
             first corrected w4 shot framed the Great Water Wheel perfectly, behind
             a wall. But sweeping at the DEFAULT pitch and then dropping the camera
             to frame is how Bazaar Lane still came back shot through a fence — at
             pitch 0.62 the sight line clears the rail, at 0.22 it does not, and
             the same bearing scores 96% and then 67%. So: converge first, sweep at
             that pitch, converge again.
             ⛔ A bearing whose park lands outside the world is no bearing at all —
             the clamp drags the ball somewhere else, so the shot is composed for a
             spot nobody stands in. Those score last. */
          /* ⭐ score = how much of it you can see × how much of it it SHOWS YOU.
             Unblocked alone is not composition: the Great Water Wheel scored 100%
             clear from straight down its axle, where a flat wheel presents as a
             line and the aqueduct is the whole picture. Projected area separates
             face-on from edge-on for nothing, since park distance is fixed across
             the sweep. */
          converge();
          function score(fr){
            if (!fr || fr.slip > off*0.2) return -1;
            return D.occl(o.k) * Math.max(0.0001, fr.w * fr.h);
          }
          var best = bear, bestS = score(f);
          for (i=1;i<8;i++){
            bear = Math.PI/4 + i*Math.PI/4;
            g = place(off, yawOff, pitch);
            var sc = score(g);
            if (sc > bestS){ bestS = sc; best = bear; }
          }
          bear = best;
          f = place(off, yawOff, pitch);
          converge();
          /* ⛔ AND THEN MAKE SURE IT ACTUALLY FITS. The three-knob cycle converges
             on the targets it can reach, but pitch clamps at 0.22 and a tall
             subject pinned against the clamp stays too big for the frame: the
             Grand Hotel came back 66% tall with 13% of it out of shot. Standing
             further back always works, so back off until nothing is cut. */
          for (i=0; i<5 && f && (f.vis<0.995 || f.h>o.hT*1.35); i++){
            off *= 1.16; f = place(off, yawOff, pitch);
          }
          /* ⛔ NOTHING BETWEEN THE LAST place() AND THE SHUTTER. place() has
             already ticked, clamped, aimed and settled; another tick here would
             re-compose the picture that was just measured, and a run with no tick
             at all leaves the ball at the spawn at its start size — that pass
             produced beautifully framed landmarks with NO BALL IN THE PICTURE and
             a HUD reading 60cm beside a 34m tower. */
          /* the ONLY tick of the whole shot: the ball's mesh and the HUD are synced
             nowhere else, and without it the frame has no ball in it */
          f = place(off, yawOff, pitch, true);
          f.off = off; f.pitch = pitch; f.ballD = D.size();
          f.clear = D.occl(o.k); f.bear = Math.round(bear*180/Math.PI);
          return f;
        }, { a:a, d:dScale, k:kind, hT:hTarget, BALL:BALL_HALF_NDC,
             bound:wInfo.bound, wrap:!!wInfo.wrap });

        await new Promise(function(r){ setTimeout(r, 400); });
        await page.evaluate(function(){ if(window.DB_DEV.render) window.DB_DEV.render(); });
        await page.screenshot({ path: path.join(OUT, kind+suffix+'.png') });
        return fit;
      }

      /* let the world intro card fade, or it sits over the shot */
      await new Promise(function(r){ setTimeout(r, 1500); });
      /* ⭐ TWO SHOTS, per the project rule. The first is where the PLAYER stands
         when they meet it. The second is the wide one, because a landmark that
         only works in close-up is not doing the job a landmark is for. */
      var fc, fw;
      try {
        fc = await frameShot(found, CLOSE_H, '');
        fw = await frameShot(found, WIDE_H, '-wide');
      } catch (e) {
        report.push(kind+': ⛔ SHOT FAILED · '+e.message); bad++;
        continue;
      }

      /* the verdict. Anything here that is not "ok" means the image on disk is
         not a picture of the landmark, and looking at it proves nothing. */
      var line = kind+': '+Math.round(found.s)+'cm at '+Math.round(found.x)+','+Math.round(found.z);
      var flags = [];
      if (!fc) flags.push('NO GEOMETRY');
      else {
        line += '  | close: fills '+(fc.h*100).toFixed(0)+'% of frame height'+
                ', centre '+fc.cx.toFixed(2)+','+fc.cy.toFixed(2)+
                ', '+(fc.vis*100).toFixed(0)+'% inside frame, '+(fc.clear*100).toFixed(0)+'% unblocked'+
                ' from '+fc.bear+'°, model '+Math.round(fc.hgt)+'cm tall'+
                '  [stood '+Math.round(fc.off)+'cm back, pitch '+fc.pitch.toFixed(2)+
                ', ball '+Math.round(fc.ballD)+'cm]';
        if (fc.behind === 8) flags.push('MISSED · subject entirely behind the camera');
        else if (fc.vis < 0.9) flags.push('CROPPED · '+((1-fc.vis)*100).toFixed(0)+'% of it is off the edge');
        if (fc.clear < 0.5) flags.push('BLOCKED · only '+(fc.clear*100).toFixed(0)+
                                       '% of it has line of sight from the best of 8 approaches');
        if (fc.slip > fc.off*0.2) flags.push('PARKED OUT OF BOUNDS · the world pulled the ball '+
                                       Math.round(fc.slip)+'cm back before the shot');
        if (fc.h < 0.12) flags.push('TINY · fills only '+(fc.h*100).toFixed(0)+'% of frame height');
        /* a landmark that is wide and low disappears over a globe's horizon: the
           close shot is fine and the wide shot is a smudge. That is a real defect
           in the LANDMARK, not in the probe, so it is reported, not corrected. */
        if (fw && fw.h < 0.05) flags.push('VANISHES WIDE · only '+(fw.h*100).toFixed(1)+'% of frame from back');
      }
      if (flags.length){ line += '\n    ⛔ ' + flags.join('; '); bad++; }
      report.push(line);
    }
  }

  await browser.close();
  console.log(report.join('\n'));
  console.log(errs.length ? ('PAGE ERRORS: '+errs.join(' | ')) : 'no page errors');
  console.log(bad ? ('⛔ '+bad+' shot(s) flagged above, those images are not evidence')
                  : 'framing ok on every shot');
  console.log('images in '+OUT+' · now OPEN them');
})().catch(function(e){ console.error('SHOTS FAILED: '+e.message); process.exit(1); });
