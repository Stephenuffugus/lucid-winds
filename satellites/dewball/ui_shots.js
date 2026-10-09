// Dewball UI SHOTS: the screens a player reads, at the phone sizes that matter.
//   node ui_shots.js --out <dir> [--states title,howto,goal,fact,pause] [--sizes 412x915,360x740,915x412]
// Each state is reached through the game's own buttons or its own run (no CSS poked in),
// one browser, one world. ⛔ No emoji font on this box: an emoji is a tofu box here and
// that is the harness, not the game. ⛔ A shot taken is not a shot looked at.
var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer'), path = require('path'), fs = require('fs');
function arg(k, d){ var i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; }
var out = path.resolve(arg('out', '.')), states = arg('states', 'title,howto,goal,fact,pause').split(',');
var sizes = arg('sizes', '412x915,360x740,915x412').split(',').map(function(s){ return s.split('x').map(Number); });
fs.mkdirSync(out, { recursive: true });
(async function(){
  var b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  var p = await b.newPage(), errs = [], n = 0;
  p.on('pageerror', function(e){ errs.push(e.message); });
  for (var si = 0; si < sizes.length; si++) {
    var w = sizes[si][0], h = sizes[si][1];
    await p.setViewport({ width: w, height: h, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await p.goto('file://' + path.resolve(__dirname, 'index.html') + '?dbtest=1&dbseed=12345', { waitUntil: 'networkidle0' });
    await p.waitForFunction('window.DB_DEV && window.DB_DEV.notes', { timeout: 20000 });
    /* a fresh save per size: the first run lesson is learned once per device, so the
       second size would otherwise never see it */
    await p.evaluate(function(){ localStorage.clear(); });
    await p.reload({ waitUntil: 'networkidle0' });
    await p.waitForFunction('window.DB_DEV && window.DB_DEV.notes', { timeout: 20000 });
    for (var k = 0; k < states.length; k++) {
      var st = states[k], file = path.join(out, st + '-' + w + 'x' + h + '.png');
      if (st === 'title') {
        await p.evaluate(function(){ ['howto','pauseOv','result'].forEach(function(id){ var e = document.getElementById(id); if (e) e.classList.add('hidden'); });
          document.getElementById('menu').classList.remove('hidden'); });
      } else if (st === 'howto') {
        await p.evaluate(function(){ document.getElementById('mHow').click(); });
      } else if (st === 'firstrun') {
        await p.evaluate(function(){ var D = window.DB_DEV; D.start('level', 1);
          var c = document.getElementById('introCard'); if (c) c.classList.remove('show');
          for (var i = 0; i < 4; i++) D.step(0.05); D.camSettle(); D.render(); });
      } else if (st === 'dash') {
        await p.evaluate(function(){ var D = window.DB_DEV; D.start('level', 1); D.endFirstRun();
          var c = document.getElementById('introCard'); if (c) c.classList.remove('show');
          for (var i = 0; i < 10; i++) D.step(0.05); D.dashMeter(0.6); D.step(0.05); D.camSettle(); D.render(); });
      } else if (st === 'goal' || st === 'fact' || st === 'pause') {
        await p.evaluate(function(st){
          var D = window.DB_DEV; D.start('level', 1); D.endFirstRun();
          var c = document.getElementById('introCard'); if (c) c.classList.remove('show');
          if (st === 'goal') { D.setD(26); D.syncBall(); for (var i = 0; i < 6; i++) D.step(0.05); }
          else { for (var j = 0; j < 30; j++) D.step(0.05); D.notify('💡 You\'re the size of a ping pong ball.', 'fact'); D.step(0.05); }
          D.camSettle(); D.render();
          if (st === 'pause') D.pause(true);
        }, st);
      }
      await new Promise(function(r){ setTimeout(r, 400); });   /* let the slot's fade finish */
      await p.screenshot({ path: file });
      var info = await p.evaluate(function(){ var n = window.DB_DEV.notes(); var g = document.getElementById('hudGoal');
        return { slot: n.shown ? n.text : '', hudGoal: g ? g.textContent : '' }; });
      console.log(path.relative(process.cwd(), file), JSON.stringify(info));
      if (st === 'pause') await p.evaluate(function(){ window.DB_DEV.pause(false); });
      if (st === 'howto') await p.evaluate(function(){ document.getElementById('howBack').click(); });
      n++;
    }
  }
  console.log('UI_SHOTS ' + n + ' page errors: ' + (errs.length ? errs.join(' | ') : 'none'));
  await b.close();
})().catch(function(e){ console.error('FAILED ' + e.message); process.exit(1); });
