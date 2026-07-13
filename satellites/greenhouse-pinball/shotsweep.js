// Pinball flipper shot-sweep: feed the ball to each flipper, sweep flip timing,
// record which shot the ball enters. THE aimability yardstick.
// NODE_PATH=/workspaces/lucid-winds/node_modules node pinball_shotsweep.js
var puppeteer = require('puppeteer');
var path = require('path');
var url = 'file://' + path.resolve('/workspaces/lucid-winds/satellites/greenhouse-pinball/index.html') + '?gptest=1&embed=1';

puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] })
.then(function(browser){
  var errors = [];
  return browser.newPage().then(function(page){
    page.on('pageerror', function(e){ errors.push(String(e)); });
    return page.goto(url, { waitUntil:'load' })
    .then(function(){ return page.waitForFunction('window.PIN_DEV', {timeout:5000}); })
    .then(function(){
      return page.evaluate(function(){
        var D = window.PIN_DEV;
        // feeds mimic an inlane return rolling down onto each flipper
        var FEEDS = [
          { name:'L-inlane', side:'l', x:160, y:748, vx:40,  vy:140 },
          { name:'R-inlane', side:'r', x:370, y:748, vx:-40, vy:140 }
        ];
        var results = {};
        for (var f=0; f<FEEDS.length; f++){
          var fd = FEEDS[f], sweep = [];
          for (var ti=0; ti<=44; ti++){
            var T = 0.40 + ti * 0.0075;
            D.start('zen');
            var G = D.state();
            G.netTime = 0;                       // disarm saves so drains read true
            if (D.forceKick) D.forceKick(false);
            G.awaitLaunch = false; G.plungeHold = false;
            var b = G.balls[0];
            b.inLane = false; b.captured = false; b.onRail = null;
            b.x = fd.x; b.y = fd.y; b.vx = fd.vx; b.vy = fd.vy;
            var outcome = null, flipT = 0, flipped = false, released = false;
            for (var s = 0; s < 360; s++){       // 3s at 120Hz
              var t = s / 120;
              if (!flipped && t >= T){ D.flip(fd.side, true); flipped = true; flipT = t; }
              if (flipped && !released && t >= flipT + 0.25){ D.flip(fd.side, false); released = true; }
              D.step(1/120);
              var bb = D.state().balls[0];
              if (!bb){ outcome = 'drain'; break; }
              if (bb.onRail){ outcome = bb.onRail; break; }
              if (bb.y > 900 && bb.vy > 0){ outcome = 'drain'; break; }
              if (bb.inLane){ outcome = 'reserved'; break; }
            }
            if (!outcome) outcome = 'live';
            sweep.push(outcome);
            D.flip(fd.side, false);
          }
          // summarize: distinct rail shots reached + counts
          var counts = {};
          for (var i=0;i<sweep.length;i++){ counts[sweep[i]] = (counts[sweep[i]]||0)+1; }
          results[fd.name] = { counts: counts, sweep: sweep.join(',') };
        }
        return results;
      });
    })
    .then(function(res){
      res.errors = errors;
      console.log(JSON.stringify(res, null, 1));
      return browser.close().then(function(){ process.exit(0); });
    });
  });
})
.catch(function(e){ console.log('FAIL: '+e); process.exit(1); });
