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

    // TEST FAIL: blade into the left wall -> knife STICKS and the run FAILS
    S.newFF(1); S.freeze();
    var G=S.state(), W=S.world();
    G.x=-W.SW+1.4; G.y=-20; G.vx=-9; G.vy=-4; G.ang=0; G.w=0; G.holding=false; G.hold=0;
    S.stepN(4,16);
    G=S.state();
    r.wallFail={failed:G.failed===true, done:G.done===true, stopped:Math.abs(G.vx)<0.01&&Math.abs(G.vy)<0.01};

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

    // TEST PAD BOUNCE: handle into a cushion -> bounce + bonus, combo kept
    S.newFF(3); S.freeze();
    G=S.state(); W=S.world();
    var pad=(W.pads&&W.pads.length)?W.pads[0]:null;
    if(W.slabs)W.slabs.length=0; if(W.items)W.items.length=0; if(W.crystals)W.crystals.length=0; // isolate the pad
    if(!pad){ r.padBounce={found:false}; r.padChip={found:false}; }
    else {
      G.combo=3; var sc0=G.score;
      G.x=pad.x-2.6; G.y=pad.y; G.vx=6; G.vy=-2; G.ang=PI; G.w=0; G.holding=false; G.hold=0; // blade points +x(right)=away from pad on the left? knife left of pad, blade world +x toward pad => need handle toward pad
      // knife is LEFT of pad (x=pad.x-2.6), pad is to the RIGHT (+x). handle must face +x => blade faces -x => ang=0 (blade world -x). set ang=0
      G.ang=0;
      S.stepN(4,16);
      G=S.state();
      r.padBounce={found:true, comboKept:G.combo===3, gotBonus:G.score>sc0, chips:G.chips||0};
      // TEST PAD CHIP: blade into the cushion -> chip
      S.newFF(3); S.freeze();
      G=S.state(); W=S.world(); pad=W.pads[0];
      if(W.slabs)W.slabs.length=0; if(W.items)W.items.length=0; if(W.crystals)W.crystals.length=0;
      G.combo=3;
      G.x=pad.x-2.6; G.y=pad.y; G.vx=6; G.vy=-2; G.ang=PI; G.w=0; G.holding=false; G.hold=0; // blade world +x toward pad
      S.stepN(4,16);
      G=S.state();
      r.padChip={found:true, chipped:(G.chips||0)>0, comboZeroed:G.combo===0};
    }

    // TEST SLAB CUT: blade-down fall through a brown stack -> chain of cuts
    S.newFF(2); S.freeze();
    G=S.state(); W=S.world();
    var stack=(W.slabs&&W.slabs.length)?W.slabs : null;
    if(W.pads)W.pads.length=0; if(W.items)W.items.length=0; if(W.crystals)W.crystals.length=0; // isolate the stack
    if(!stack){ r.slabCut={found:false}; r.slabBonk={found:false}; }
    else {
      // find the topmost slab of the first column (group by x)
      var top=W.slabs[0];
      for(var si=0;si<W.slabs.length;si++){ if(Math.abs(W.slabs[si].x-top.x)<0.1 && W.slabs[si].y>top.y) top=W.slabs[si]; }
      G.x=top.x; G.y=top.y+3; G.vx=0; G.vy=-16; G.ang=PI/2; G.w=0; G.holding=false; G.hold=0; // blade down
      var sl0=G.slices;
      S.stepN(14,16);
      G=S.state();
      r.slabCut={found:true, cutCount:G.slices-sl0, combo:G.combo};
      // TEST SLAB BONK: handle-down onto a slab -> no cut
      S.newFF(2); S.freeze();
      G=S.state(); W=S.world();
      if(W.pads)W.pads.length=0; if(W.items)W.items.length=0; if(W.crystals)W.crystals.length=0;
      var top2=W.slabs[0];
      for(var si2=0;si2<W.slabs.length;si2++){ if(Math.abs(W.slabs[si2].x-top2.x)<0.1 && W.slabs[si2].y>top2.y) top2=W.slabs[si2]; }
      G.x=top2.x; G.y=top2.y+3; G.vx=0; G.vy=-16; G.ang=-PI/2; G.w=0; G.holding=false; G.hold=0; // handle down
      var sb0=G.slices;
      S.stepN(4,16);
      G=S.state();
      r.slabBonk={found:true, noCut:top2.cut!==true && G.slices===sb0};
    }

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
    r.run={done:done, mult:G.mult, steps:steps, goOn:document.getElementById('s-go').classList.contains('on'),
      detail:document.getElementById('go-detail').textContent, lab:document.getElementById('go-lab').textContent};

    window._S3skiprender=false;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var ok = out.wallFail.failed && out.wallFail.done && out.wallFail.stopped
    && out.clean.chips===0 && out.clean.comboKept && out.clean.bouncedRight
    && out.cut.sliced
    && out.bonk.consumed && out.bonk.notSliced
    && out.run.done && out.run.mult>=1 && out.run.goOn
    && out.padBounce.found && out.padBounce.comboKept && out.padBounce.gotBonus && out.padBounce.chips===0
    && out.padChip.found && out.padChip.chipped && out.padChip.comboZeroed
    && out.slabCut.found && out.slabCut.cutCount>=2
    && out.slabBonk.found && out.slabBonk.noCut
    && /clean dive/.test(out.run.detail);
  console.log(ok?'ORIENT OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
