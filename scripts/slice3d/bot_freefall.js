var puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
(async function(){
  var browser = await puppeteer.launch({headless:'new', args:['--no-sandbox','--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
  var page = await browser.newPage();
  var errors=[];
  page.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push(e.message); });
  await page.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,500)});
  var out = await page.evaluate(function(){
    window._S3skiprender=true;
    var S=window._S3, r={levels:[]};
    // FULL RUNS: 3 freefall levels with a steering bot
    for(var lv=1;lv<=3;lv++){
      S.newFF(lv); S.freeze();
      var W=S.world();
      var steps=0, minY=99, stallFor=0, coast=0;
      while(steps<9000){
        var G=S.state(); if(G.done)break;
        // stall recovery: no downward progress means STOP TAPPING and drop
        if(G.y<minY-0.5){ minY=G.y; stallFor=0; } else stallFor++;
        if(stallFor>150){ coast=80; stallFor=0; }
        if(coast>0){ coast--; }
        else if(G.grounded){
          var esc=(Math.abs(G.x)>W.SW-4.5)?(G.x>0?-1:1):(G.x>=0?1:-1);
          S.tap(esc);
        }
        else if(steps%42===0){ S.tap(G.x>1.5?-1:(G.x<-1.5?1:(steps%84===0?-1:1))); }
        S.stepN(1,16); steps++;
      }
      var G2=S.state();
      S.stepN(200,16);
      r.levels.push({lv:lv, done:G2.done, slices:G2.slices, score:G2.score, mult:G2.mult,
        x:+G2.x.toFixed(1), steps:steps, goOn:document.getElementById('s-go').classList.contains('on'),
        title:document.getElementById('go-title').textContent,
        lab:document.getElementById('go-lab').textContent});
    }
    // MECH 1: side wall always bounces, never sticks
    S.newFF(1); S.freeze();
    var G=S.state(), W=S.world();
    G.x=0; G.y=-10; G.vx=30; G.vy=0; G.grounded=false;
    S.stepN(20,16);
    G=S.state();
    r.wallBounce={insideShaft:Math.abs(G.x)<W.SW, vxFlipped:G.vx<0, notDone:!G.done};
    // MECH 2: blade-down center stick = x10
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    G.x=0.3; G.y=W.floorY+5; G.vx=0; G.vy=-12; G.ang=Math.PI/2; G.w=0; G.grounded=false;
    S.stepN(20,16);
    G=S.state();
    r.bullseye={done:G.done, mult:G.mult};
    // MECH 3: handle-flat landing bounces back up
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    G.x=4; G.y=W.floorY+5; G.vx=0; G.vy=-12; G.ang=0; G.w=0; G.grounded=false;
    S.stepN(26,16);
    G=S.state();
    r.floorBounce={notDone:!G.done, movingUp:G.vy>0, coached:!!G.handleCoached};
    // MECH 4: edge stick = x1 zone
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    G.x=W.SW-1; G.y=W.floorY+5; G.vx=0; G.vy=-12; G.ang=Math.PI/2; G.w=0; G.grounded=false;
    S.stepN(20,16);
    G=S.state();
    r.edgeZone={done:G.done, mult:G.mult};
    window._S3skiprender=false;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var L=out.levels;
  var ok = L.length===3 && L.every(function(l){return l.done && l.slices>0 && l.goOn && /FREEFALL/.test(l.title) && /floor/.test(l.lab);})
    && out.wallBounce.insideShaft && out.wallBounce.vxFlipped && out.wallBounce.notDone
    && out.bullseye.done && out.bullseye.mult===10
    && out.floorBounce.notDone && out.floorBounce.movingUp
    && out.edgeZone.done && out.edgeZone.mult<=2;
  console.log(ok?'FREEFALL OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
