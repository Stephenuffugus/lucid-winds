// Greenhouse Pinball headless smoke test (v1.5 rulesheet).
// Run: NODE_PATH=/workspaces/lucid-winds/node_modules node smoke.js
// Loads index.html?gptest=1 over file:// (no http server) and drives PIN_DEV.
var puppeteer = require('puppeteer');
var path = require('path');
var url = 'file://' + path.resolve(__dirname, 'index.html') + '?gptest=1&embed=1';

puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] })
.then(function(browser){
  var errors = [];
  browser.newPage().then(function(page){
    page.on('pageerror', function(e){ errors.push(String(e)); });
    // sunbeam-sdk.js 404s over file:// by design (Sunbeam.init catches it) — not a failure.
    // manifest.webmanifest is CORS-blocked under file:// only (loads fine over http) — not a failure.
    page.on('console', function(m){ var t=m.text(); if(m.type()==='error' && t.indexOf('Failed to load resource')<0 && t.indexOf('manifest')<0) errors.push('console: '+t); });

    page.goto(url, { waitUntil:'load' })
    .then(function(){ return page.waitForFunction('window.PIN_DEV', {timeout:5000}); })
    .then(function(){
      return page.evaluate(function(){
        var D = window.PIN_DEV, T = {}, G, i;

        // ---- P0: skill shot ----
        D.start('classic');
        D.chargePlunge(1);
        var sk = D.skill();
        var hit = D.hitLitBumper();
        T.skillShot = sk.lit >= 0 && hit && hit.done === true;

        // ---- P0: nudge -> tilt kills flippers (nudge has a 0.12s cooldown) ----
        D.start('classic'); D.chargePlunge(0.5);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up');
        T.tilt = D.tiltState().tiltOut > 0;

        // ---- drain geography: outlanes drain, inlanes deliver ----
        D.start('zen');
        T.outlaneDrains = D.dropBall(82,660).out === 'outlane' && D.dropBall(448,660).out === 'outlane';
        T.inlaneDelivers = D.dropBall(140,660).out === 'inlane' && D.dropBall(390,660).out === 'inlane';

        // ---- kickback: fires when lit, silent when unlit ----
        D.start('zen');
        D.forceKick(true); var f0 = D.kickState().fires;
        D.dropBall(82,660); T.kickFires = (D.kickState().fires - f0) === 1;
        D.forceKick(false); var f1 = D.kickState().fires;
        var ud = D.dropBall(82,660);
        T.kickUnlitDrains = (D.kickState().fires - f1) === 0 && ud.drained;
        D.forceKick(false); D.hitShot('retL'); D.hitShot('retR');
        T.kickRelight = D.kickState().lit === true;

        // ---- B-L-O-O-M -> lock lit ----
        D.start('classic');
        D.hitShot('sB'); D.hitShot('sL'); D.hitShot('sO1'); D.hitShot('sO2'); D.hitShot('sM');
        T.wordLock = D.lockState().lockLit === true;

        // ---- lock via diverted green ramp: swallow + replacement serve ----
        var l1 = D.lockViaRamp();
        T.lockSwallows = l1.lockedDelta === 1 && l1.await === true && l1.balls === 1;

        // ---- 3 locks -> Pollen Multiball, jackpot ladder, super, add-a-ball ----
        D.start('classic'); D.forceLock(3);
        var mb = D.mbState();
        T.mbStarts = mb.pollen === true && mb.balls === 3 && mb.save > 0;
        D.hitShot('fern'); D.hitShot('trellis'); D.hitShot('lorbit'); D.hitShot('rorbit');
        T.superLights = D.mbState().superLit === true && D.mbState().jpCount === 4;
        var sc = D.hitScoop();
        T.superPays = sc.awarded >= 1000000 && D.mbState().jpLadder === 2 && D.mbState().jpValue === 500000;
        var rip = D.ripSpinner(1400);
        T.addABall = rip.added === true && rip.balls === 4;
        G = D.state();
        while (G.balls.length > 1) { G.balls[G.balls.length-1].x = 270; G.balls[G.balls.length-1].y = 920; D.step(0.016); }
        D.step(0.016);
        T.mbEnds = D.mbState().pollen === false && D.lockState().locked === 0;

        // ---- scaling: second MB is level 1.5 ----
        D.forceLock(3);
        T.mbScales = D.mbState().level === 1.5 && D.mbState().jpValue === 375000;

        // ---- changing ramps ----
        D.start('zen');
        var h1 = D.railShot('heart'), h2 = D.railShot('heart'), h3 = D.railShot('heart');
        T.heartAlternates = h1.exitX !== h2.exitX && h1.exitX === h3.exitX;
        var fA = D.railShot('fern'), fB = D.railShot('fern');
        T.fernCrossover = fA.exitX !== fB.exitX;
        D.state().lockLit = true;
        T.greenDiverts = D.divertState('green').lock === true;
        D.state().lockLit = false;
        T.greenNormal = D.divertState('green').lock === false;

        // ---- Bloom Rush: frenzy, no balls, pays, expires ----
        D.start('classic');
        var b0 = D.state().balls.length;
        D.forceBloom();
        T.rushNoBalls = D.state().balls.length === b0 && D.rushState().rush > 19;
        var s0 = D.state().score; D.hitShot('sB');
        T.rushPays = (D.state().score - s0) >= 2500;
        G = D.state(); G.rush = 0.5; G.balls[0].inLane = true;
        for (i = 0; i < 60; i++) D.step(0.016);
        T.rushExpires = D.rushState().rush === 0;

        // ---- wizard: 12 jackpots ends it, checklist resets ----
        D.start('classic'); D.forceWizard();
        T.wizardStarts = D.wizardState().wizard === true && D.wizardState().balls === 4;
        for (i = 0; i < 12; i++) D.hitShot('fern');
        var wz = D.wizardState();
        T.wizardEnds = wz.wizard === false && wz.questsDone.indexOf(true) === -1;

        // ---- EOB bonus ----
        D.start('classic');
        D.hitShot('sB'); D.hitShot('sL');
        var bs = D.bonusState(), pre = D.state().score;
        G = D.state(); G.netTime = 0; G.balls[0].inLane = false; G.balls[0].x = 270; G.balls[0].y = 920; G.balls[0].vy = 100;
        D.step(0.016);
        T.eobBonus = (D.state().score - pre) >= Math.round(bs.bonusBase * bs.bonusMult);

        // ---- v1.5.1 adversarial-review fixes ----
        // a failed FULL BLOOM tears down on drain-out: no 1M mode next ball, checklist resets
        D.start('classic'); D.forceWizard();
        G = D.state(); G.wizSave = 0;
        for (i = G.balls.length - 1; i >= 0; i--) { G.balls[i].x = 270; G.balls[i].y = 920; G.balls[i].vy = 100; }
        D.step(0.016);
        T.wizardDrainTeardown = D.wizardState().wizard === false && G.questsDone.indexOf(true) === -1;

        // a save recovers an OUTLANE drain by re-centring between the flippers
        D.start('zen'); D.forceKick(false);
        G = D.state(); G.balls[0].inLane = false; G.balls[0].x = 82; G.balls[0].y = 905; G.balls[0].vx = 0; G.balls[0].vy = 200;
        D.step(0.016);
        var svb = D.state().balls[0];
        T.outlaneSaveRecenters = !!svb && svb.x >= 190 && svb.x <= 350 && svb.vy < 0;

        // TILT disables the multiball ball save
        D.start('classic'); D.forceLock(3);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up');
        G = D.state(); var nb0 = G.balls.length;
        G.balls[0].x = 270; G.balls[0].y = 920; G.balls[0].vy = 100; D.step(0.016);
        T.tiltKillsMbSave = D.tiltState().tiltOut > 0 && D.state().balls.length === nb0 - 1;

        // a running quest PAUSES during Pollen MB instead of burning out invisibly
        D.start('classic'); D.startQuest(0);
        var qt0 = D.questState().timer;
        D.forceLock(3);
        for (i = 0; i < 30; i++) D.step(0.033);
        var qs2 = D.questState();
        T.questPausesInMB = !!qs2 && qs2.name === 'Seedling Sprint' && Math.abs(qs2.timer - qt0) < 0.2;

        // kickback survives a 50ms jank frame: fires AND the bead stays in play
        D.start('zen'); D.forceKick(true);
        G = D.state(); G.balls[0].inLane = false; G.balls[0].x = 112; G.balls[0].y = 849; G.balls[0].vx = 0; G.balls[0].vy = 1100;
        var kf0 = D.kickState().fires;
        D.step(0.05);
        // if the bead had drained anyway, zen would have re-served it inLane with vy=0
        var kb2 = D.state().balls[0];
        T.kickbackJankSafe = (D.kickState().fires - kf0) === 1 && !!kb2 && kb2.inLane === false && kb2.vy < 0;

        // scaling caps: mbLevel <= 2 even after many multiballs
        D.start('classic');
        for (var mbi = 0; mbi < 5; mbi++) { D.forceLock(3); G = D.state();
          while (G.balls.length > 1) { G.balls[G.balls.length-1].x = 270; G.balls[G.balls.length-1].y = 920; D.step(0.016); }
          D.step(0.016); }
        D.forceLock(3);
        T.mbLevelCapped = D.mbState().level === 2;

        // super cap: 2 per MB, ladder pinned at x2, third rung does not relight
        D.start('classic'); D.forceLock(3);
        var rung = function(){ D.hitShot('fern'); D.hitShot('trellis'); D.hitShot('lorbit'); D.hitShot('rorbit'); };
        rung(); D.hitScoop();
        rung(); D.hitScoop();
        rung();
        T.superCapped = D.mbState().superLit === false && D.mbState().jpLadder === 2;
        // an unclaimed super's scoop light clears when the MB ends
        G = D.state();
        while (G.balls.length > 1) { G.balls[G.balls.length-1].x = 270; G.balls[G.balls.length-1].y = 920; D.step(0.016); }
        D.step(0.016);
        T.scoopLitCleared = D.state().scoopLit === false;

        // Bloom Rush pays on flow shots too (ramp base 2500 + rush 2000)
        D.start('classic'); D.forceBloom();
        var rs0 = D.state().score; D.hitShot('fern');
        T.rushPaysRamp = (D.state().score - rs0) >= 4500;

        // a lock's replacement serve keeps ball-scoped state: tilt persists, skill stays spent
        D.start('classic'); D.chargePlunge(0.5);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up'); for (i = 0; i < 10; i++) D.step(0.016);
        D.nudge('up');
        var tOut0 = D.tiltState().tiltOut > 0;
        D.hitShot('sB'); D.hitShot('sL'); D.hitShot('sO1'); D.hitShot('sO2'); D.hitShot('sM');
        var lk2 = D.lockViaRamp();
        T.lockKeepsTilt = tOut0 && lk2.lockedDelta === 1 && D.tiltState().tiltOut > 0;
        D.chargePlunge(0.5);
        T.lockServeNoSkill = D.skill().win === 0;

        // the serve spot sits clear of the right divider post (422,700 r5)
        D.start('classic');
        var sv0 = D.state().balls[0];
        T.serveClearOfPost = Math.sqrt((sv0.x-422)*(sv0.x-422)+(sv0.y-700)*(sv0.y-700)) >= 16;

        // ---- autoplay sanity + survivability ----
        D.start('zen');
        var ap = D.autoPlay(45);
        T.autoPlaySane = ap.score > 0 && ap.phase === 'play';
        var met = D.metrics(6);
        T.survivability = met.median >= 3.5;
        T.metricsMedian = met.median;

        return T;
      });
    })
    .then(function(T){
      var fails = [], passes = 0, total = 0, k;
      for (k in T) {
        if (k === 'metricsMedian') continue;
        total++;
        if (T[k] === true) passes++; else fails.push(k + '=' + JSON.stringify(T[k]));
      }
      T.errors = errors;
      if (errors.length) { total++; fails.push('pageerrors: ' + JSON.stringify(errors)); } else { total++; passes++; }
      console.log(JSON.stringify(T, null, 1));
      console.log('ASSERTS ' + passes + '/' + total + (fails.length ? '  FAILS: ' + fails.join(', ') : ''));
      console.log(fails.length ? 'SMOKE_FAIL' : 'SMOKE_PASS');
      browser.close();
      process.exit(fails.length ? 1 : 0);
    })
    .catch(function(err){
      console.log('ERROR: ' + err + ' | pageerrors: ' + JSON.stringify(errors));
      browser.close(); process.exit(1);
    });
  });
})
.catch(function(e){ console.log('LAUNCH_FAIL: ' + e); process.exit(1); });
