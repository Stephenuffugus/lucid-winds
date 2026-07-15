// Dewball balance probe: per-world absorbAll ceiling + greedy-bot run + knockOff regression.
// NODE_PATH=/workspaces/lucid-winds/node_modules node balance.js [botOn] [seed] [onlyWorldN]
// Worlds/goals derive from DB_DEV.worlds() — never hand-mirror them here (tuning law).
// Math.random is seeded in-page under ?dbtest=1, so a given seed is fully deterministic.
// onlyWorldN (1-based, non-zen) runs a single world and skips the knock test — fast iteration.
var puppeteer = require('puppeteer');
var path = require('path');
var botOn = process.argv[2] !== '0';
var seed = +(process.argv[3] || 12345) || 12345;
var onlyN = +(process.argv[4] || 0) || 0;
var doTrace = process.argv.indexOf('trace') > 1;
var nearSight = process.argv.indexOf('near') > 1;   // vision-limited bot: models a human
                                                    // who can only chase what they can SEE
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1&dbseed=' + seed;

puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
.then(function(browser){
  return browser.newPage().then(function(page){
    var errors = [];
    page.on('pageerror', function(e){ errors.push(String(e)); });
    return page.goto(url, { waitUntil:'domcontentloaded' })
    .then(function(){ return page.waitForFunction('window.DB_DEV', {timeout:8000}); })
    .then(function(){
      return page.evaluate(function(botOn, onlyN, doTrace, nearSight){
        var D = window.DB_DEV, out = { worlds: [], knock: null };
        var WL = D.worlds().filter(function(w){ return !w.zen && (!onlyN || w.n === onlyN); });
        function pr(dd){ var t = Math.log(dd/40)/Math.log(30); if(t<0)t=0; if(t>1)t=1; return 0.55+0.17*t; }
        // does the straight run from (bx,bz) to (tx,tz) cross a CLOSED gate ring?
        // Rings are walls from BOTH sides (concentric worlds: the ball lives INSIDE
        // closed rings and breaks outward) — blocked when exactly one endpoint is
        // inside, or when an outside-outside segment dips through the circle.
        // steer around wall props (v4.0 structures): if the straight line to the
        // target clips an unpickable prop, deflect the heading around it. This is
        // wall-following: each piece of a wall line pushes the heading sideways
        // until a doorway lets the ray through — how a human drives a hedgerow.
        function steer(bx,bz,tx,tz,dd,blks){
          var dx=tx-bx, dz=tz-bz, L=Math.sqrt(dx*dx+dz*dz)||1, ux=dx/L, uz=dz/L;
          var look=Math.min(L,dd*16), hit=null, hitT=1e18, hpx=0, hpz=0, hrad=1;
          for (var bi=0; bi<blks.length; bi++){ var o=blks[bi];
            var rx=o.x-bx, rz=o.z-bz;
            var t=rx*ux+rz*uz;
            if (t<-o.s||t>look) continue;
            if (t>L*0.92) continue;             // blocker sits AT the target: just go
            var px=rx-ux*t, pz=rz-uz*t, p2=px*px+pz*pz;
            var rad=o.s*0.45+dd*0.62;
            if (p2<rad*rad&&t<hitT){ hitT=t; hit=o; hpx=px; hpz=pz; hrad=rad; } }
          if (!hit) return [ux,uz];
          var pl=Math.sqrt(hpx*hpx+hpz*hpz), awx, awz;
          if (pl>1e-4){ awx=-hpx/pl; awz=-hpz/pl; }
          else { awx=-uz; awz=ux; }             // dead-on: pick a deterministic side
          var wgt=1.15*(1-pl/hrad)+0.35;
          var ox=ux+awx*wgt, oz=uz+awz*wgt, ol=Math.sqrt(ox*ox+oz*oz)||1;
          return [ox/ol,oz/ol];
        }
        function pathBlocked(bx,bz,tx,tz,gg){
          for (var gi=0; gi<gg.length; gi++){ var g=gg[gi];
            if (g.open || g.x===undefined) continue;
            var aIn=(bx-g.x)*(bx-g.x)+(bz-g.z)*(bz-g.z) < g.r*g.r;
            var tIn=(tx-g.x)*(tx-g.x)+(tz-g.z)*(tz-g.z) < g.r*g.r;
            if (aIn!==tIn) return true;
            if (aIn) continue;                       // both inside: chord stays inside
            var dx=tx-bx, dz=tz-bz, L2=dx*dx+dz*dz||1;
            var t=((g.x-bx)*dx+(g.z-bz)*dz)/L2; if(t<0)t=0; if(t>1)t=1;
            var px=bx+dx*t-g.x, pz=bz+dz*t-g.z;
            if (px*px+pz*pz < g.r*g.r) return true; }
          return false;
        }
        for (var wi=0; wi<WL.length; wi++){
          var n = WL[wi].n, GOAL = WL[wi].goal, S2 = WL[wi].s2, S3 = WL[wi].s3;
          // ceiling
          D.start('level', n);
          var ceil = D.absorbAll();
          var leftBig = 0, st0 = D.state();
          for (var q=0; q<st0.objects.length; q++){ if (st0.objects[q].s > ceil*pr(ceil)) leftBig++; }
          var rec = { w: WL[wi].id, goal: GOAL, s3: S3, time: WL[wi].time, ceiling: Math.round(ceil*10)/10,
                      ceilingX: Math.round(ceil/GOAL*100)/100, s3ok: ceil >= S3*1.15, leftovers: leftBig };
          // greedy bot — with dash discipline + stuck escape, so runs measure PACING,
          // not random knockoff catastrophes (the old perma-dash bot swung 1.1x-5x
          // on identical code depending on mover luck; useless as a yardstick)
          if (botOn){
            D.start('level', n);
            var objs = D.state().objects, it = 0, refresh = 0, st2 = D.state();
            var dashOK = true, lastBest = null, lastCX = 0, lastCZ = 0, escT = 0, escA = 0;
            var blkX = [], blkZ = [], blkT = [], fleeX = 0, fleeZ = 0, stuckRun = 0, srchT = 0, srchA = 0;
            var blks = [];   // unpickable wall props near the ball (refreshed with dashOK)
            while (st2.timer > 0.15 && !st2.over && it++ < 16000){
              var dd = D.size();
              if (refresh-- <= 0){ st2 = D.state(); objs = st2.objects; refresh = 15; }
              var bx = st2.ballX, bz = st2.ballY;
              if (refresh < 14){ st2 = D.state(); bx = st2.ballX; bz = st2.ballY; }
              var lim = dd*pr(dd), best = null, bestScore = -1, i, gg = st2.gates || [];
              if (refresh === 14){
                // dash safety: never dash with a hard wall (or too-big mover) nearby —
                // dash-speed impacts trigger knockOff and shed 3 pickups
                dashOK = true; fleeX = 0; fleeZ = 0; blks.length = 0;
                var fd2 = 1e14;
                for (i=0; i<objs.length; i++){ var ow = objs[i];
                  // flee unpickable CHASERS only (wander/patrol/dart movers just bump;
                  // fleeing every sheep on w7 starved the bot to 0.1x)
                  if (ow.m && ow.ai === 'chase' && ow.s > lim){
                    var fx = bx-ow.x, fz = bz-ow.z, f2 = fx*fx+fz*fz, fr = dd*6+ow.s;
                    if (f2 < fr*fr && f2 < fd2){ fd2 = f2; var fl = Math.sqrt(f2)||1;
                      fleeX = fx/fl; fleeZ = fz/fl; } }
                  // fixed wall pieces are HARD even at <= 1.15x ball (the engine
                  // skips the shove for them) — treat them as walls from the moment
                  // they're merely unpickable, or the bot dashes into hedges it
                  // "knows" are shovable right before they turn edible
                  if (ow.s <= (ow.f ? lim : dd*1.15)) continue;
                  // small fixed walls (below the shove line) get a TIGHT no-dash
                  // radius: a dash slip there sheds 3 pickups, not a run — the wide
                  // dd*3 bubble around every hedge piece froze the bot to a creep
                  // (w2 t-goal doubled; humans dash through wall gaps all day)
                  var wx = ow.x-bx, wz = ow.z-bz, w2d = wx*wx+wz*wz;
                  var wr = (ow.f && ow.s <= dd*1.15 ? dd*1.6 : dd*3) + ow.s*0.5;
                  if (!ow.m){ var br9 = dd*20+ow.s;      // static walls: steering set
                    if (w2d < br9*br9) blks.push(ow); }
                  if (w2d < wr*wr) dashOK = false; }
              }
              for (i=0; i<objs.length; i++){ var o = objs[i];
                o._d2 = undefined;
                if (o.s > lim) continue;
                var fenced = false;                       // skip targets across a closed ring
                // (one side in, one side out — with concentric rings "inside" is home)
                for (var gi=0; gi<gg.length; gi++){ var g = gg[gi];
                  if (!g.open && g.x !== undefined){
                    var tIn = (o.x-g.x)*(o.x-g.x)+(o.z-g.z)*(o.z-g.z) < g.r*g.r;
                    var mIn = (bx-g.x)*(bx-g.x)+(bz-g.z)*(bz-g.z) < g.r*g.r;
                    if (tIn !== mIn){ fenced = true; break; } } }
                if (fenced) continue;
                var blk = false;                          // skip the pocket we got stuck in
                // radius capped: at big D an uncapped dd*3 pocket blacklists whole map
                // regions and the bot limit-cycles between the few survivors
                var pkR = Math.min(dd*3, 700);
                for (var bi=0; bi<blkX.length; bi++){ if (blkT[bi]>it){
                  var bdx = o.x-blkX[bi], bdz = o.z-blkZ[bi];
                  if (bdx*bdx+bdz*bdz < pkR*pkR){ blk = true; break; } } }
                if (blk) continue;
                var dx = o.x-bx, dz = o.z-bz, d2 = dx*dx+dz*dz;
                if (nearSight){ var vis = dd*22+400; if (d2 > vis*vis) continue; }
                o._d2 = d2;
                // value = meal volume per travel: a player at 8m treks to the cottage
                // feast instead of diving into wall pockets after streetlamps.
                // A closed gate ring across the route makes a target near-worthless
                // (grinding the arc was a permanent limit cycle on w5 Lighthouse Point).
                var sc9 = o.s*o.s*o.s/(Math.sqrt(d2)+dd*4);
                if (sc9 > bestScore*0.05 && pathBlocked(bx,bz,o.x,o.z,gg)) sc9 *= 0.02;
                if (sc9 > bestScore){ bestScore = sc9; best = o; } }
              // stuck detection: barely moved over ~3s -> blacklist the POCKET around the
              // target we were grinding toward and RETREAT (away from it), long enough to
              // actually leave; repeated sticking escalates to a long wander
              if (it % 90 === 0){
                if (Math.abs(bx-lastCX)+Math.abs(bz-lastCZ) < Math.min(dd*1.2,420) && lastBest){
                  blkX.push(lastBest.x); blkZ.push(lastBest.z); blkT.push(it+700);
                  stuckRun++;
                  escT = stuckRun >= 3 ? 260 : 90;
                  escA = Math.atan2(bx-lastBest.x, bz-lastBest.z) + (stuckRun-1)*0.9; }
                else stuckRun = 0;
                lastCX = bx; lastCZ = bz;
              }
              lastBest = best;
              // creep near walls: full-speed slams trigger knockOff (impact > 0.84x max);
              // a player brakes in tight quarters — so does the bot
              var thr = dashOK ? 1 : 0.55;
              // flee SIDESTEPS (perpendicular) — running straight away from a chaser
              // is a permanent pursuit; a dog once walked the bot for 3 minutes
              var flpX = -fleeZ, flpZ = fleeX;
              if (escT-- > 0){ D.roll(Math.cos(escA)*thr, Math.sin(escA)*thr); }
              else if (best){ var sv = steer(bx,bz,best.x,best.z,dd,blks);
                var rx = sv[0] + flpX*0.9 + fleeX*0.3, rz = sv[1] + flpZ*0.9 + fleeZ*0.3;
                var rl = Math.sqrt(rx*rx+rz*rz)||1;
                D.roll(rx/rl*thr, rz/rl*thr); }
              else if (fleeX||fleeZ) D.roll((flpX+fleeX*0.5)*thr, (flpZ+fleeZ*0.5)*thr);
              else { if (it - (srchT||0) > 90){ srchT = it; srchA = Math.random()*6.283; }
                var sw = steer(bx,bz,bx+Math.cos(srchA)*dd*30,bz+Math.sin(srchA)*dd*30,dd,blks);
                D.roll(sw[0]*thr, sw[1]*thr); }
              if (dashOK) D.dash();
              D.step(0.033);
              if (doTrace && it % 300 === 0){ if (!rec.trace) rec.trace = [];
                rec.trace.push([Math.round(WL[wi].time-st2.timer), Math.round(dd), Math.round(bx), Math.round(bz),
                                st2.absorbCount, best?Math.round(Math.sqrt(best._d2||0)):-1, blkX.length]); }
              // star-pace telemetry: elapsed seconds when the bot crossed each star bar
              var dNow = D.size(), tEl = Math.round((WL[wi].time - st2.timer)*10)/10;
              if (!rec.t100 && dNow >= GOAL) rec.t100 = tEl;
              if (!rec.t140 && dNow >= S2) rec.t140 = tEl;
              if (!rec.t190 && dNow >= S3) rec.t190 = tEl;
            }
            rec.bot = Math.round(D.size()*10)/10;
            rec.botX = Math.round(rec.bot/GOAL*100)/100;
            rec.absorbs = D.state().absorbCount;
          }
          out.worlds.push(rec);
        }
        // knockOff regression: eat a mover then slam a wall prop — must not throw, mover returns
        if (onlyN){ out.knock = { skipped: true, crash: false }; return out; }
        D.start('level', 1);
        D.setD(8);                       // big enough that any w1 critter is edible
        var st = D.state(), mv = null, i2, kindN0 = 0;
        for (i2=0; i2<st.objects.length; i2++){ var om = st.objects[i2];
          if (om.m && om.s <= 8*0.55 && !mv) mv = om; }
        var ok = { moverEaten:false, crash:false, moverBack:false, clingAfter:-1 };
        if (mv){
          for (i2=0; i2<st.objects.length; i2++){ if (st.objects[i2].m && st.objects[i2].k===mv.k) kindN0++; }
          // start NEXT to the mover and chase the NEAREST of its kind; "eaten" =
          // the kind's count dropped. (The old version chased the first-listed
          // instance cross-map and only passed if ALL of them died — with v4.0
          // walls in the way it silently never tested knockOff at all.)
          D.setPos(mv.x + 30, mv.z);
          for (var f=0; f<900 && !ok.moverEaten; f++){
            var s2 = D.state(); var m2 = null, bd2 = 1e18, kn = 0;
            for (var j=0; j<s2.objects.length; j++){ var o2 = s2.objects[j];
              if (!o2.m || o2.k!==mv.k) continue; kn++;
              var dxx = o2.x-s2.ballX, dzz = o2.z-s2.ballY, dq = dxx*dxx+dzz*dzz;
              if (dq < bd2){ bd2 = dq; m2 = o2; } }
            if (kn < kindN0){ ok.moverEaten = true; break; }
            if (!m2) break;
            var dx2 = m2.x-s2.ballX, dz2 = m2.z-s2.ballY, dl2 = Math.sqrt(dx2*dx2+dz2*dz2)||1;
            D.roll(dx2/dl2, dz2/dl2); D.step(0.033);
          }
          if (ok.moverEaten){
            // find a wall prop and slam it (dash-speed impact via repeated rolls)
            var s3 = D.state(), wall = null;
            for (var w2=0; w2<s3.objects.length; w2++){ var o3=s3.objects[w2];
              if (o3.s > D.size()*1.2 && !o3.m){ if(!wall || (o3.x-s3.ballX)*(o3.x-s3.ballX)+(o3.z-s3.ballY)*(o3.z-s3.ballY) < (wall.x-s3.ballX)*(wall.x-s3.ballX)+(wall.z-s3.ballY)*(wall.z-s3.ballY)) wall=o3; } }
            if (wall){
              // count same-kind movers BEFORE the slam: knockOff restoring the eaten
              // one must INCREASE the count (any surviving sibling used to satisfy
              // the old any-of-kind check, which made moverBack vacuous)
              var s3b = D.state(), knPre = 0, m3;
              for (m3=0; m3<s3b.objects.length; m3++){ if (s3b.objects[m3].m && s3b.objects[m3].k===mv.k) knPre++; }
              try {
                for (var f2=0; f2<900; f2++){ var s4=D.state();
                  var dx3=wall.x-s4.ballX, dz3=wall.z-s4.ballY, dl3=Math.sqrt(dx3*dx3+dz3*dz3)||1;
                  D.roll(dx3/dl3, dz3/dl3); D.step(0.05); }   // big dt = high speed per step
              } catch(e){ ok.crash = true; ok.err = String(e); }
              var s5 = D.state(), knPost = 0;
              ok.clingAfter = s5.cling.length;
              for (m3=0; m3<s5.objects.length; m3++){ if (s5.objects[m3].m && s5.objects[m3].k===mv.k) knPost++; }
              ok.moverBack = knPost > knPre;
            }
          }
        }
        out.knock = ok;
        return out;
      }, botOn, onlyN, doTrace, nearSight);
    })
    .then(function(out){
      out.pageErrors = errors;
      out.seed = seed;
      console.log(JSON.stringify(out, null, 1));
      var pass = errors.length === 0 && !out.knock.crash && (out.knock.skipped || out.knock.moverEaten);
      for (var i=0;i<out.worlds.length;i++){ var w = out.worlds[i];
        if (w.s3ok === false) { pass = false; console.log('CEILING FAIL ' + w.w + ' (3-star bar unreachable)'); }
        if (botOn && w.botX < 1.0) { pass = false; console.log('BOT FAIL ' + w.w + ' x' + w.botX); } }
      console.log(pass ? 'BALANCE_PASS' : 'BALANCE_FAIL');
      return browser.close().then(function(){ process.exit(pass?0:1); });
    });
  });
})
.catch(function(e){ console.log('FAIL: '+e); process.exit(1); });
