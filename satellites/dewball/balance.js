// Dewball balance probe: per-world absorbAll ceiling + greedy-bot run + knockOff regression.
// NODE_PATH=/workspaces/lucid-winds/node_modules node dewball_balance.js [botOn]
var puppeteer = require('puppeteer');
var path = require('path');
var url = 'file://' + path.resolve('/workspaces/lucid-winds/satellites/dewball/index.html') + '?dbtest=1';
var botOn = process.argv[2] !== '0';

puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })
.then(function(browser){
  return browser.newPage().then(function(page){
    var errors = [];
    page.on('pageerror', function(e){ errors.push(String(e)); });
    return page.goto(url, { waitUntil:'domcontentloaded' })
    .then(function(){ return page.waitForFunction('window.DB_DEV', {timeout:8000}); })
    .then(function(){
      return page.evaluate(function(botOn){
        var D = window.DB_DEV, out = { worlds: [], knock: null };
        var GOALS = {1:24, 2:55, 3:85, 4:240, 5:460};
        function pr(dd){ var t = Math.log(dd/40)/Math.log(30); if(t<0)t=0; if(t>1)t=1; return 0.55+0.17*t; }
        for (var n=1; n<=5; n++){
          // ceiling
          D.start('level', n);
          var ceil = D.absorbAll();
          var leftBig = 0, st0 = D.state();
          for (var q=0; q<st0.objects.length; q++){ if (st0.objects[q].s > ceil*pr(ceil)) leftBig++; }
          var rec = { w:'w'+n, goal: GOALS[n], ceiling: Math.round(ceil*10)/10,
                      ceilingX: Math.round(ceil/GOALS[n]*100)/100, leftovers: leftBig };
          // greedy bot
          if (botOn){
            D.start('level', n);
            var objs = D.state().objects, it = 0, refresh = 0, st2 = D.state();
            while (st2.timer > 0.15 && it++ < 12000){
              var dd = D.size();
              if (refresh-- <= 0){ st2 = D.state(); objs = st2.objects; refresh = 15; }
              var bx = st2.ballX, bz = st2.ballY;
              if (refresh < 14){ st2 = D.state(); bx = st2.ballX; bz = st2.ballY; }
              var lim = dd*pr(dd), near = null, nd = 1e14, i, gg = st2.gates || [];
              for (i=0; i<objs.length; i++){ var o = objs[i];
                o._d2 = undefined;
                if (o.s > lim) continue;
                var fenced = false;                       // skip targets locked behind a closed gate
                for (var gi=0; gi<gg.length; gi++){ var g = gg[gi];
                  if (!g.open && g.x !== undefined){ var gx = o.x-g.x, gz = o.z-g.z;
                    if (gx*gx+gz*gz < g.r*g.r){ fenced = true; break; } } }
                if (fenced) continue;
                var dx = o.x-bx, dz = o.z-bz, d2 = dx*dx+dz*dz;
                o._d2 = d2; if (d2 < nd){ nd = d2; near = o; } }
              var best = near;
              if (near){ var lim2 = nd*2.56, bestV = near.s;   // biggest meal within 1.6x of the nearest
                for (i=0; i<objs.length; i++){ var o2 = objs[i];
                  if (o2.s > lim || o2._d2 === undefined || o2._d2 > lim2) continue;
                  if (o2.s > bestV){ bestV = o2.s; best = o2; } } }
              if (best){ var vx = best.x-bx, vz = best.z-bz, vl = Math.sqrt(vx*vx+vz*vz)||1;
                D.roll(vx/vl, vz/vl); }
              else D.roll(Math.cos(it*0.01), Math.sin(it*0.01));
              D.dash();
              D.step(0.033);
            }
            rec.bot = Math.round(D.size()*10)/10;
            rec.botX = Math.round(rec.bot/GOALS[n]*100)/100;
            rec.absorbs = D.state().absorbCount;
          }
          out.worlds.push(rec);
        }
        // knockOff regression: eat a mover then slam a wall prop — must not throw, mover returns
        D.start('level', 1);
        D.setD(6);
        var st = D.state(), mv = null, i2;
        for (i2=0; i2<st.objects.length; i2++){ if (st.objects[i2].m){ mv = st.objects[i2]; break; } }
        var ok = { moverEaten:false, crash:false, moverBack:false, clingAfter:-1 };
        if (mv){
          // teleport-drive to the mover by rolling toward it (movers wander; chase a while)
          for (var f=0; f<2200 && !ok.moverEaten; f++){
            var s2 = D.state(); var m2 = null;
            for (var j=0; j<s2.objects.length; j++){ if (s2.objects[j].m && s2.objects[j].k===mv.k){ m2=s2.objects[j]; break; } }
            if (!m2){ ok.moverEaten = true; break; }
            var dx2 = m2.x-s2.ballX, dz2 = m2.z-s2.ballY, dl2 = Math.sqrt(dx2*dx2+dz2*dz2)||1;
            D.roll(dx2/dl2, dz2/dl2); D.step(0.033);
          }
          if (ok.moverEaten){
            // find a wall prop and slam it (dash-speed impact via repeated rolls)
            var s3 = D.state(), wall = null;
            for (var w2=0; w2<s3.objects.length; w2++){ var o3=s3.objects[w2];
              if (o3.s > D.size()*1.2 && !o3.m){ if(!wall || (o3.x-s3.ballX)*(o3.x-s3.ballX)+(o3.z-s3.ballY)*(o3.z-s3.ballY) < (wall.x-s3.ballX)*(wall.x-s3.ballX)+(wall.z-s3.ballY)*(wall.z-s3.ballY)) wall=o3; } }
            if (wall){
              try {
                for (var f2=0; f2<900; f2++){ var s4=D.state();
                  var dx3=wall.x-s4.ballX, dz3=wall.z-s4.ballY, dl3=Math.sqrt(dx3*dx3+dz3*dz3)||1;
                  D.roll(dx3/dl3, dz3/dl3); D.step(0.05); }   // big dt = high speed per step
              } catch(e){ ok.crash = true; ok.err = String(e); }
              var s5 = D.state();
              ok.clingAfter = s5.cling.length;
              for (var m3=0; m3<s5.objects.length; m3++){ if (s5.objects[m3].m && s5.objects[m3].k===mv.k){ ok.moverBack = true; break; } }
            }
          }
        }
        out.knock = ok;
        return out;
      }, botOn);
    })
    .then(function(out){
      out.pageErrors = errors;
      console.log(JSON.stringify(out, null, 1));
      var pass = errors.length === 0 && !out.knock.crash;
      for (var i=0;i<out.worlds.length;i++){ var w = out.worlds[i];
        if (w.ceilingX < 1.9*1.15) { pass = false; console.log('CEILING FAIL ' + w.w + ' x' + w.ceilingX); }
        if (botOn && w.botX < 1.0) { pass = false; console.log('BOT FAIL ' + w.w + ' x' + w.botX); } }
      console.log(pass ? 'BALANCE_PASS' : 'BALANCE_FAIL');
      return browser.close().then(function(){ process.exit(pass?0:1); });
    });
  });
})
.catch(function(e){ console.log('FAIL: '+e); process.exit(1); });
