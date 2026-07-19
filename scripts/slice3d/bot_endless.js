var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var b = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await b.newPage();
  var errors=[]; page.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push(e.message); });
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,500)});
  var out = await page.evaluate(function(){
    window._S3skiprender=true;
    var S=window._S3, r={};
    // build endless
    S.newEndless(); S.freeze();
    var G=S.state(), W=S.world();
    r.build={endless:G.endless===true, depth:Math.round(-W.floorY), hudEndless:document.getElementById('h-lvl').textContent};
    // fall a good way down the pit (hold center, aim blade-down so no accidental wall fail)
    var steps=0;
    while(steps<1400){ G=S.state(); if(G.done)break;
      S.hold(Math.abs(G.x)>0.6?(G.x>0?-1:1):0);
      var g=S.state(); if(g.w>3)g.w=3; if(g.w<-3)g.w=-3; // keep it aimable
      S.stepN(1,16); steps++;
    }
    G=S.state();
    r.midDepth=Math.round(G.depth);
    r.hudLive=document.getElementById('h-lvl').textContent;
    // now force a blade-into-wall FAIL
    G.x=-W.SW+1.4; G.vx=-9; G.vy=-4; G.ang=0; G.w=0; G.holding=false; G.hold=0;
    S.stepN(4,16);
    G=S.state();
    r.failed=G.failed===true;
    // let the fail screen show
    S.stepN(140,16);
    r.finish={goOn:document.getElementById('s-go').classList.contains('on'),
      title:document.getElementById('go-title').textContent,
      detail:document.getElementById('go-detail').textContent,
      nextLabel:document.getElementById('go-next').textContent};
    r.bestSaved = /best \d+m/.test(r.finish.detail);
    window._S3skiprender=false;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var ok = out.build.endless && out.build.depth>800 && /ENDLESS/.test(out.build.hudEndless)
    && out.midDepth>20 && /DEPTH/.test(out.hudLive)
    && out.failed && out.finish.goOn && /DEPTH/.test(out.finish.title)
    && out.finish.nextLabel==='Dive Again' && out.bestSaved;
  console.log(ok?'ENDLESS OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await b.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
