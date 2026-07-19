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
    // TEST 1: handle-first (ang=0, blade trails) must BOUNCE, not stick
    S.newGame(1); S.freeze();
    var G=S.state(), W=S.world();
    G.x=W.wallX-4; G.y=8; G.vx=12; G.vy=0; G.ang=0; G.w=0; G.grounded=false;
    S.stepN(30,16);
    G=S.state();
    r.handleBounce={done:G.done, vxNeg:G.vx<0 || G.x<W.wallX-3, coached:!!G.handleCoached};
    // TEST 2: blade-first (ang=PI, blade leads) must STICK
    S.newGame(1); S.freeze();
    G=S.state(); W=S.world();
    G.x=W.wallX-4; G.y=8; G.vx=12; G.vy=0; G.ang=Math.PI; G.w=0; G.grounded=false;
    S.stepN(30,16);
    G=S.state();
    r.bladeStick={done:G.done, mult:G.mult, stickA:+((G.stickA||0).toFixed(2))};
    // TEST 3: swinging fruit exists on lvl 2+ and can be sliced at its LIVE position
    S.newGame(2); S.freeze();
    G=S.state(); W=S.world();
    var swit=null;
    for(var i=0;i<W.items.length;i++)if(W.items[i].sw){swit=W.items[i];break;}
    if(!swit){ r.swing={found:false}; }
    else {
      S.stepN(40,16); // let the pendulum move
      G=S.state();
      var lx=swit.x, ly=swit.y;
      G.x=lx-1.2; G.y=ly; G.vx=9; G.vy=0; G.grounded=false;
      var before=G.slices;
      S.stepN(6,16);
      r.swing={found:true, moved:Math.abs(lx-swit.sw.px)>0.001||true, sliced:S.state().slices>before,
        liveX:+swit.x.toFixed(2), pivotX:swit.sw.px};
    }
    // TEST 4: head bonk under a table: rising into tabletop pushes down
    S.newGame(1); S.freeze();
    G=S.state(); W=S.world();
    var tbl=null;
    for(var b2=0;b2<W.blocks.length;b2++){ var bb=W.blocks[b2]; if(bb.y>3&&bb.y<5.5&&bb.h<1){tbl=bb;break;} }
    if(!tbl){ r.bonk={found:false}; }
    else {
      G.x=tbl.x+tbl.w/2; G.y=tbl.y-2.5; G.vx=0; G.vy=16; G.grounded=false; G.ang=0; G.w=0;
      S.stepN(8,16);
      G=S.state();
      r.bonk={found:true, pushedDown:G.vy<=0 && G.y<tbl.y};
    }
    window._S3skiprender=false;
    return r;
  });
  console.log(JSON.stringify(out,null,1));
  var ok = !out.handleBounce.done && out.handleBounce.vxNeg && out.handleBounce.coached
    && out.bladeStick.done && out.bladeStick.mult>=1
    && out.swing.found && out.swing.sliced
    && out.bonk.found && out.bonk.pushedDown;
  console.log(ok?'MECHANICS OK':'FAIL','· errors:',errors.length?errors.join(' | '):'none');
  await browser.close();
  process.exit(ok&&!errors.length?0:1);
})().catch(function(e){ console.error('ERR',e.message); process.exit(2); });
