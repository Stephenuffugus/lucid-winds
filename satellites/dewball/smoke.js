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
      page.on('console', function(m){ if(m.type()==='error') errors.push('console: '+m.text()); });

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
            var ang = f*0.06;
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
          return {
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
        var pass = (!res.nan) && (errors.length===0) && (res.endSize > res.startSize) &&
                   (res.movedFrames > 100) && (res.afterAll >= res.beforeAll);
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
