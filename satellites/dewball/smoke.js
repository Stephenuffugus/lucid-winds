// Dewball headless smoke test. Run: NODE_PATH=/workspaces/lucid-winds/node_modules node smoke.js
var puppeteer = require('puppeteer');
var path = require('path');
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1';

(function(){
  puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] })
  .then(function(browser){
    var errors = [];
    browser.newPage().then(function(page){
      page.on('pageerror', function(e){ errors.push(String(e)); });
      page.on('console', function(m){
        if(m.type()!=='error') return;
        // file:// runs can't load /sunbeam-sdk.js or the optional ground-art override — expected
        if(/ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) return;
        // ...and a web app manifest is only fetchable over http(s), so file:// CORS-blocks it.
        // Narrow on purpose: any OTHER cross-origin failure must still fail the run.
        if(/Access to manifest at .*manifest\.webmanifest/.test(m.text())) return;
        errors.push('console: '+m.text());
      });

      page.goto(url, { waitUntil:'networkidle0' })
      .then(function(){ return page.waitForFunction('window.DB_DEV && typeof window.DB_DEV.start==="function"', {timeout:5000}); })
      .then(function(){
        return page.evaluate(function(){
          var D = window.DB_DEV;
          D.start('level', 1);
          var startSize = D.size();
          var minSize = startSize, maxSize = startSize;
          var nan = false, stuck = false;
          var frames = 600;
          var lastX = null, lastY = null, movedFrames = 0;
          // drive the ball on a wandering path so it eats scattered objects
          for (var f=0; f<frames; f++){
            var ang = f*0.02;   // slow heading drift -> wide (~32cm radius) sweep through the spawn litter
            D.roll(Math.cos(ang), Math.sin(ang*0.7));
            D.step(0.016);
            var s = D.size();
            var st = D.state();
            if (isNaN(s) || isNaN(st.ballX) || isNaN(st.ballY)) { nan = true; break; }
            if (s < minSize) minSize = s;
            if (s > maxSize) maxSize = s;
            if (lastX !== null){
              var dd = Math.abs(st.ballX-lastX)+Math.abs(st.ballY-lastY);
              if (dd > 0.5) movedFrames++;
            }
            lastX = st.ballX; lastY = st.ballY;
          }
          var endSize = D.size();
          var stAfter = D.state();
          // second phase: use absorbAll to confirm growth-to-max path
          var beforeAll = D.size();
          D.absorbAll();
          var afterAll = D.size();
          // ladder rule: every non-zen world's ceiling must clear the 3-star bar with 15%
          // slack (total-volume budgeting is NOT enough — the pickup-ratio ladder binds).
          // Worlds/bars derive from DB_DEV.worlds() — never hand-mirror them here.
          var WL = D.worlds().filter(function(w){ return !w.zen; }), ladder = [];
          for (var wi = 0; wi < WL.length; wi++){
            D.start('level', WL[wi].n);
            var ceil = D.absorbAll();
            // WALL SIZING LAW: every fixed wall piece must sit within the world's
            // reachable ladder — an oversized wall is permanent inedible scenery
            // that silently kills clean sweep. (state() flags fixed props with f:1.)
            var wallsLeft = 0, sl = D.state();
            for (var qi = 0; qi < sl.objects.length; qi++){ if (sl.objects[qi].f) wallsLeft++; }
            ladder.push({ w: WL[wi].id, ceil: Math.round(ceil), need: Math.round(WL[wi].s3*1.15),
                          wallsLeft: wallsLeft, ok: ceil >= WL[wi].s3*1.15 && wallsLeft === 0 });
          }
          // MARQUEE COURT REACHABILITY: every hand-placed structure that declares a
          // court:{probe} must be enterable by its whole zone audience. A review
          // flood-fill caught the Hedge Maze sealed for every legal ball — this
          // assertion keeps any future spec/seed edit from re-sealing a court.
          function prR(dd){ var t = Math.log(dd/40)/Math.log(30); if (t<0)t=0; if (t>1)t=1; return 0.55+0.17*t; }
          function courtReachable(wrec, ct){
            var stc = D.state(), P = ct.d, bound = wrec.bound;
            // cell must be FINER than the narrowest legal corridor band, or a
            // passable corridor can straddle cell centers and read as sealed
            var cell = Math.max(P*0.22, bound/560), dim = Math.ceil(2*bound/cell);
            var blocked = new Uint8Array(dim*dim), seen = new Uint8Array(dim*dim);
            var clr = P*0.475, pr = prR(P), i, o;
            function idx(cx,cz){ if (wrec.wrap){ cx=((cx%dim)+dim)%dim; cz=((cz%dim)+dim)%dim; }
              else if (cx<0||cz<0||cx>=dim||cz>=dim) return -1;
              return cz*dim+cx; }
            function stamp(x,z,rr){
              var gx=(x+bound)/cell, gz=(z+bound)/cell, rc=rr/cell;
              var x0=Math.floor(gx-rc), x1=Math.floor(gx+rc), z0=Math.floor(gz-rc), z1=Math.floor(gz+rc);
              for (var cx=x0;cx<=x1;cx++) for (var cz=z0;cz<=z1;cz++){
                var dx=(cx+0.5)*cell-bound-x, dz=(cz+0.5)*cell-bound-z;
                if (dx*dx+dz*dz>rr*rr) continue;
                var ii=idx(cx,cz); if (ii>=0) blocked[ii]=1; } }
            for (i=0;i<stc.objects.length;i++){ o=stc.objects[i];
              if (o.m) continue;
              if (o.f ? o.s<=P*pr : o.s<=P*1.15) continue;   // edible/shovable at probe: not a wall
              stamp(o.x,o.z,clr+o.s*0.45); }
            for (i=0;i<stc.gates.length;i++){ var g=stc.gates[i];
              if (g.need<=P) continue;                        // open at this probe
              var rr2=clr+g.need*0.08, n2=Math.max(24,Math.round(6.283*g.r/rr2));
              for (var q2=0;q2<n2;q2++){ var a2=6.283*q2/n2;
                stamp(g.x+Math.cos(a2)*g.r, g.z+Math.sin(a2)*g.r, rr2*1.5); } }
            if (!wrec.wrap){                                  // the world's rim is a wall
              for (var cz9=0;cz9<dim;cz9++) for (var cx9=0;cx9<dim;cx9++){
                var wx9=(cx9+0.5)*cell-bound, wz9=(cz9+0.5)*cell-bound;
                if (wx9*wx9+wz9*wz9>(bound-P*0.5)*(bound-P*0.5)) blocked[cz9*dim+cx9]=1; } }
            var sc0=Math.floor(bound/cell), start=idx(sc0,sc0);
            if (start<0||blocked[start]) return false;        // spawn itself must be clear
            var Q=[start]; seen[start]=1;
            while (Q.length){ var c=Q.pop(), cx2=c%dim, cz2=(c/dim)|0;
              var N=[[1,0],[-1,0],[0,1],[0,-1]];
              for (var k2=0;k2<4;k2++){ var ii2=idx(cx2+N[k2][0],cz2+N[k2][1]);
                if (ii2>=0&&!seen[ii2]&&!blocked[ii2]){ seen[ii2]=1; Q.push(ii2); } } }
            var tx=Math.floor((ct.x+bound)/cell), tz=Math.floor((ct.z+bound)/cell);
            for (var dx2=-1;dx2<=1;dx2++) for (var dz2=-1;dz2<=1;dz2++){
              var it2=idx(tx+dx2,tz+dz2);
              if (it2>=0&&seen[it2]) return true; }
            return false;
          }
          var courts = [];
          for (wi = 0; wi < WL.length; wi++){ if (!WL[wi].courts.length) continue;
            D.start('level', WL[wi].n);
            for (var ci = 0; ci < WL[wi].courts.length; ci++){
              var ok9 = courtReachable(WL[wi], WL[wi].courts[ci]);
              courts.push({ w: WL[wi].id, probe: WL[wi].courts[ci].d, reachable: ok9 }); } }
          return {
            ladder: ladder, courts: courts,
            startSize: startSize, endSize: endSize, minSize: minSize, maxSize: maxSize,
            nan: nan, movedFrames: movedFrames, frames: frames,
            absorbCount: stAfter.absorbCount, clingCount: stAfter.cling.length,
            beforeAll: beforeAll, afterAll: afterAll,
            objectsLeft: stAfter.objects.length
          };
        });
      })
      .then(function(res){
        res.errors = errors;
        var ladderOK = true;
        for (var li = 0; li < res.ladder.length; li++){ if (!res.ladder[li].ok) ladderOK = false; }
        var courtsOK = true;
        for (var ci = 0; ci < res.courts.length; ci++){ if (!res.courts[ci].reachable){ courtsOK = false;
          console.log('COURT SEALED: ' + res.courts[ci].w + ' @ probe ' + res.courts[ci].probe); } }
        var pass = (!res.nan) && (errors.length===0) && (res.endSize > res.startSize) &&
                   (res.movedFrames > 100) && (res.afterAll >= res.beforeAll) && ladderOK && courtsOK;
        console.log(JSON.stringify(res, null, 2));
        console.log(pass ? 'SMOKE_PASS' : 'SMOKE_FAIL');
        browser.close();
        process.exit(pass?0:1);
      })
      .catch(function(err){
        console.log('ERROR: '+err+' | pageerrors: '+JSON.stringify(errors));
        browser.close(); process.exit(1);
      });
    });
  })
  .catch(function(e){ console.log('LAUNCH_FAIL: '+e); process.exit(1); });
})();
