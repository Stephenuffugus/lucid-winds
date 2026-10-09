// Dewball: WITHOUT WebGL a player gets a screen that says so (Astra C10). Run: node glfail_test.js [--plant]
// Chrome starts with WebGL disabled; a REAL click on the first world card (a mouse event
// through the browser, never el.click()) must show "This browser could not start the game"
// with Try again and Back to worlds, throw no uncaught error, and Back must return to the
// worlds. --plant removes the try/catch around the renderer (the state before 9 Oct): the
// tap then throws and nothing appears, and this MUST fail.
var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer'), path = require('path'), fs = require('fs');
var plant = process.argv.indexOf('--plant') > 1;
(async function(){
  var file = path.join(__dirname, 'index.html');
  if (plant) {
    var src = fs.readFileSync(file, 'utf8');
    var a = 'try{ renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"}); }\n    catch(e){ renderer=null; return false; }';
    if (src.indexOf(a) < 0) throw new Error('plant anchor missing');
    file = path.join(require('os').tmpdir(), 'dewball-glfail-plant-' + process.pid + '.html');
    fs.writeFileSync(file, src.replace(a, 'renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});').replace('src="three.min.js"', 'src="' + path.join(__dirname, 'three.min.js') + '"'));
  }
  var b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-webgl', '--disable-3d-apis', '--disable-gpu'] });
  var p = await b.newPage(), errs = [], fails = [];
  p.on('pageerror', function(e){ errs.push(e.message); });
  await p.setViewport({ width: 915, height: 412 });
  await p.goto('file://' + file, { waitUntil: 'networkidle0' });
  var hasGL = await p.evaluate(function(){ var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); });
  if (hasGL) fails.push('the browser still has WebGL: this run proves nothing');
  await p.waitForSelector('#worldRow .wcard', { timeout: 15000 });
  await p.click('#worldRow .wcard');
  await new Promise(function(r){ setTimeout(r, 600); });
  var st = await p.evaluate(function(){ var o = document.getElementById('glFail');
    return { shown: !!o && !o.classList.contains('hidden'), text: o ? o.innerText : '', menu: !document.getElementById('menu').classList.contains('hidden') }; });
  if (!st.shown) fails.push('no failure screen after tapping a world without WebGL');
  if (st.shown && st.text.indexOf('This browser could not start the game') < 0) fails.push('the failure screen does not say what happened: ' + st.text.slice(0, 80));
  if (errs.length) fails.push('uncaught errors: ' + errs.join(' | '));
  if (st.shown){
    await p.click('#glBack');
    var back = await p.evaluate(function(){ return document.getElementById('glFail').classList.contains('hidden') && !document.getElementById('menu').classList.contains('hidden'); });
    if (!back) fails.push('Back to worlds did not return to the worlds');
  }
  await b.close();
  if (plant) try { fs.unlinkSync(file); } catch (e) {}
  if (fails.length){ console.log('GLFAIL_FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('GLFAIL_PASS no WebGL: a real tap on a world shows the failure screen, no uncaught error, Back returns to the worlds');
})().catch(function(e){ console.error('FAILED ' + e.message); process.exit(1); });
