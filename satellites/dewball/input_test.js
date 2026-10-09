// Dewball INPUT test, through REAL touch events (CDP Input.dispatchTouchEvent), never
// el.click(): a control proven by a synthetic click is a control nobody has touched.
//   node input_test.js [--plant]
// 1. First run (Astra C7): a fresh save shows the two cards; holding the left half
//    while the game steps fades "to roll", the right half fades "to look", the overlay
//    goes and save.tutSeen sticks; a second run shows nothing.
// 2. Dash routing (A7): an UNCHARGED dash button hands the touch to the camera stick;
//    a CHARGED one dashes and takes the touch.
// --plant makes the dash button swallow every touch again (the old routing): MUST fail.
var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer'), path = require('path'), fs = require('fs');
var plant = process.argv.indexOf('--plant') > 1;
(async function(){
  var html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  var file = path.join(__dirname, 'index.html');
  if (plant) {
    var a = 'if(_inBtn(t,"dashBtn")&&R&&R.dashM>=1&&R.dashT<=0){ tryDash(); continue; }';
    if (html.indexOf(a) < 0) throw new Error('plant anchor missing');
    file = path.join(require('os').tmpdir(), 'dewball-input-plant-' + process.pid + '.html');
    fs.writeFileSync(file, html.replace(a, 'if(_inBtn(t,"dashBtn")){ tryDash(); continue; }').replace('src="three.min.js"', 'src="' + path.join(__dirname, 'three.min.js') + '"'));
  }
  var b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  var p = await b.newPage(), errs = [], fails = [];
  p.on('pageerror', function(e){ errs.push(e.message); });
  await p.setViewport({ width: 915, height: 412, hasTouch: true, isMobile: true });
  await p.goto('file://' + file + '?dbtest=1&dbseed=12345', { waitUntil: 'networkidle0' });
  await p.waitForFunction('window.DB_DEV && window.DB_DEV.firstRun', { timeout: 20000 });
  var cdp = await p.target().createCDPSession();
  async function touch(type, x, y){ await cdp.send('Input.dispatchTouchEvent', { type: type, touchPoints: type === 'touchEnd' ? [] : [{ x: x, y: y, id: 1 }] }); }
  async function steps(n){ await p.evaluate(function(n){ for (var i = 0; i < n; i++) window.DB_DEV.step(0.05); }, n); }
  function ok(c, m){ if (!c) fails.push(m); }
  await p.evaluate(function(){ window.DB_DEV.start('level', 1); });
  var fr = await p.evaluate(function(){ return window.DB_DEV.firstRun(); });
  ok(fr.on && !fr.hidden && !fr.seen, '1a fresh save should show the first run cards: ' + JSON.stringify(fr));
  await touch('touchStart', 200, 250); await steps(16); await touch('touchEnd');
  fr = await p.evaluate(function(){ return window.DB_DEV.firstRun(); });
  ok(fr.l && !fr.r, '1b left card should fade after rolling, right stay: ' + JSON.stringify(fr));
  await touch('touchStart', 700, 300); await steps(12); await touch('touchEnd');
  fr = await p.evaluate(function(){ return window.DB_DEV.firstRun(); });
  ok(!fr.on && fr.out && fr.seen, '1c both done: overlay out and learned: ' + JSON.stringify(fr));
  await p.evaluate(function(){ window.DB_DEV.start('level', 1); });
  fr = await p.evaluate(function(){ return window.DB_DEV.firstRun(); });
  ok(!fr.on && fr.hidden, '1d a second run shows nothing: ' + JSON.stringify(fr));
  // 2. dash routing, the button's real centre
  var c = await p.evaluate(function(){ var r = document.getElementById('dashBtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.evaluate(function(){ window.DB_DEV.dashMeter(0.3); });
  await touch('touchStart', c.x, c.y);
  var st = await p.evaluate(function(){ return { inp: window.DB_DEV.input(), dash: window.DB_DEV.dashMeter() }; });
  await touch('touchEnd');
  ok(st.inp.R && st.dash.t <= 0, '2a an uncharged dash button should hand the touch to the camera: ' + JSON.stringify(st));
  await p.evaluate(function(){ window.DB_DEV.dashMeter(1); });
  await touch('touchStart', c.x, c.y);
  st = await p.evaluate(function(){ return { inp: window.DB_DEV.input(), dash: window.DB_DEV.dashMeter() }; });
  await touch('touchEnd');
  ok(!st.inp.R && st.dash.t > 0, '2b a charged dash button should dash and keep the touch: ' + JSON.stringify(st));
  ok(!errs.length, 'page errors: ' + errs.join(' | '));
  await b.close();
  if (plant) try { fs.unlinkSync(file); } catch (e) {}
  if (fails.length) { console.log('INPUT_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('INPUT_PASS');
})().catch(function(e){ console.error('FAILED ' + e.message); process.exit(1); });
