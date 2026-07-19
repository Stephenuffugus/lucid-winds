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
    var S=window._S3, r={};
    var PI=Math.PI;

    // TEST CHIP: blade into the left wall -> combo lost, chip counted, knocked away
    S.newFF(1); S.freeze();
    var G=S.state(), W=S.world();
    G.combo=4;
    G.x=-W.SW+1.4; G.y=-20; G.vx=-9; G.vy=-4; G.ang=0; G.w=0; G.holding=false; G.hold=0;
    S.stepN(4,16);
    G=S.state();
    r.chip={chips:G.chips||0, comboZeroed:G.combo===0, knockedRight:G.vx>0, x:+G.x.toFixed(1)};

    // TEST CLEAN BOUNCE: handle into the left wall -> combo kept, no chip, bounced away
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    G.combo=4;
    G.x=-W.SW+1.4; G.y=-20; G.vx=-9; G.vy=-4; G.ang=PI; G.w=0; G.holding=false; G.hold=0;
    S.stepN(4,16);
    G=S.state();
    r.clean={chips:G.chips||0, comboKept:G.combo===4, bouncedRight:G.vx>0};

    // TEST CUT: blade facing a fruit below -> sliced
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    var target=null;
    for(var i=0;i<W.items.length;i++){ if(!W.items[i].sw){ target=W.items[i]; break; } }
    G.x=target.x; G.y=target.y+2.4; G.vx=0; G.vy=-14; G.ang=PI/2; G.w=0; G.holding=false; G.hold=0; // blade down at fruit below
    var before=G.slices;
    S.stepN(6,16);
    G=S.state();
    r.cut={fruit:target.f.n, sliced:G.slices>before};

    // TEST BONK: handle facing a fruit below -> bonked (consumed, not sliced)
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    var t2=null;
    for(var j=0;j<W.items.length;j++){ if(!W.items[j].sw){ t2=W.items[j]; break; } }
    G.x=t2.x; G.y=t2.y+2.4; G.vx=0; G.vy=-14; G.ang=-PI/2; G.w=0; G.holding=false; G.hold=0; // handle down toward fruit
    var before2=G.slices;
    S.stepN(6,16);
    G=S.state();
    r.bonk={consumed:t2.cut===true, notSliced:G.slices===before2};

    // TEST FULL RUN: steer toward center, settle blade-down near the floor, stick it
    S.newFF(1); S.freeze();
    G=S.state(); W=S.world();
    var steps=0, done=false;
    while(steps<4000){
      G=S.state(); if(G.done){done=true;break;}
      var floorNear = G.y < W.floorY+16;
      if(floorNear){
        // settle the blade straight down to stick
        S.hold(0);
        var g2=S.state(); g2.w=0; g2.ang=PI/2; // aim blade-down
      } else {
        // hold toward center to keep off the walls
        S.hold(G.x>0.6?-1:(G.x<-0.6?1:0));
      }
      S.stepN(1,16); steps++;
    }
    S.stepN(200,16); // play the finale out so the finish screen shows
    G=S.state();
    r.run={done:done, mult:G.mult, steps:steps, goOn:document.getElementById('s-go').classList.contains('on')};

    window._S3skiprender=false;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var ok = out.chip.chips>0 && out.chip.comboZeroed && out.chip.knockedRight
    && out.clean.chips===0 && out.clean.comboKept && out.clean.bouncedRight
    && out.cut.sliced
    && out.bonk.consumed && out.bonk.notSliced
    && out.run.done && out.run.mult>=1 && out.run.goOn;
  console.log(ok?'ORIENT OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
