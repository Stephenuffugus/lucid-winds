var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await browser.newPage();
  var errors = [];
  page.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push(e.message); });
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,600)});
  var res = await page.evaluate(function(){
    window._S3skiprender=true;
    var S=window._S3, out={levels:[]};
    for(var lv=1;lv<=4;lv++){
      S.newGame(lv); S.freeze();
      var W=S.world(), steps=0, lastX=-99, stuckFor=0, holdT=0;
      while(steps<9000){
        var G=S.state(); if(G.done)break;
        // realistic player: hop when grounded; if blocked (no x progress), HOLD to climb
        if(G.x<lastX+0.02)stuckFor++; else {stuckFor=0; lastX=G.x;}
        if(stuckFor>40)holdT=110;
        var nearWall=G.x>W.wallX-24;
        if(holdT>0){ holdT--; if(steps%17===0)S.tap(); }
        else if(nearWall){ if(steps%18===0)S.tap(); }
        else if(G.grounded)S.tap();
        S.stepN(1,16); steps++;
      }
      var G2=S.state();
      S.stepN(200,16);
      out.levels.push({lv:lv, done:G2.done, slices:G2.slices, score:G2.score, mult:G2.mult, stuckY:+G2.stuckY.toFixed(1), steps:steps,
        goOn:document.getElementById('s-go').classList.contains('on')});
    }
    window._S3skiprender=false;
    return out;
  });
  await new Promise(function(r){setTimeout(r,1100)});
  console.log(JSON.stringify(res));
  var ok = res.levels.length===4 && res.levels.every(function(l){return l.done && l.slices>0 && l.goOn && l.mult>=1;});
  console.log(ok?'LOGIC OK':'FAIL', '· errors:', errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok && !errors.length ? 0 : 1);
})().catch(function(e){ console.error('ERR', e.message); process.exit(2); });
