var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await browser.newPage();
  var errors=[];
  page.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push(e.message); });
  await page.setViewport({width:540, height:960});
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,700)});
  var out = await page.evaluate(function(){
    function click(id){ var e=document.getElementById(id); e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); e.click(); }
    var S=window._S3, r={};
    r.titleOn=document.getElementById('s-title').classList.contains('on');
    click('b-play');
    r.game1=!!S.state() && document.getElementById('s-play').style.display==='flex';
    S.freeze(); S.stepN(30,16);
    r.g1x=+S.state().x.toFixed(1);
    click('b-home');
    r.backToTitle=document.getElementById('s-title').classList.contains('on');
    click('b-play');
    var G=S.state();
    r.game2=G && G.x===2 && G.score===0 && !G.done;
    S.freeze(); S.stepN(30,16); S.tap(); S.stepN(30,16);
    r.g2moved=S.state().x>2;
    click('b-home');
    r.title2=document.getElementById('s-title').classList.contains('on');
    click('b-how');
    r.howOn=document.getElementById('s-how').classList.contains('on');
    click('how-back');
    r.titleAgain=document.getElementById('s-title').classList.contains('on');
    return r;
  });
  await new Promise(function(r){setTimeout(r,800)});
  console.log(JSON.stringify(out));
  var ok = out.titleOn&&out.game1&&out.backToTitle&&out.game2&&out.g2moved&&out.title2&&out.howOn&&out.titleAgain;
  console.log(ok?'CYCLE OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
