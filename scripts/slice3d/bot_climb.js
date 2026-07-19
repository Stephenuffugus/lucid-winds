/* bot_climb.js — WALL CLIMB (journey-ending mega wall) + obstacle verification.
 * Model (Stephen 7/19): same physics as the normal game — the shortest runway
 * into the TALLEST finishing wall with scaling multiplier bands. Flip-climb,
 * stick the blade as high as you dare. Blade = stick (finish), handle = bounce.
 * Run: node scripts/slice3d/bot_climb.js
 */
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

    // TEST BUILD: journey mode + the mega wall
    S.newClimb(1); S.freeze();
    var G=S.state(), W=S.world();
    r.build={ mode:G.mode, climbWall:!!W.climbWall, bandsL1:W.bands.length, wallTop:+W.wallTop.toFixed(1), topMult:W.topMult,
      pass: G.mode==='run' && !!W.climbWall && W.bands.length>=10 && Math.abs(W.wallTop-W.bands.length*4.6)<0.01 };
    S.newClimb(8); S.freeze(); W=S.world();
    r.build.bandsL8=W.bands.length; r.build.pass=r.build.pass && W.bands.length>r.build.bandsL1;

    // TEST FLAPPY CLIMB: journey taps gain altitude (same physics as the run)
    S.newClimb(1); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0;
    G.x=10; G.y=1.5; G.vx=0; G.vy=0; G.grounded=true; G.ang=0; G.w=0;
    var i; for(i=0;i<5;i++){ S.tap(1); S.stepN(6,16); }
    r.flappy={ y:+G.y.toFixed(1), pass: G.y>7 };

    // TEST STICK LOW: blade into band 0 -> done at x1
    S.newClimb(1); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0;
    G.x=W.wallX-3; G.y=4; G.vx=9; G.vy=0; G.ang=PI; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(15,16);
    r.stickLow={ done:!!G.done, mult:G.mult, pass: !!G.done && G.mult===W.bands[0][0] };

    // TEST STICK HIGH: blade in at y=30 -> band multiplier, score multiplies
    S.newClimb(1); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0;
    G.score=100;
    G.x=W.wallX-3; G.y=30; G.vx=9; G.vy=0; G.ang=PI; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(15,16);
    var expMult=G.done?W.bands[Math.min(W.bands.length-1,Math.floor(G.stuckY/4.6))][0]:-1;
    var stuckHigh=!!G.done && G.mult===expMult && G.mult>=6;
    S.stepN(40,16);   // ride the count-up (score *= mult at doneT 0.4)
    r.stickHigh={ done:!!G.done, mult:G.mult, stuckY:+G.stuckY.toFixed(1), score:G.score,
      pass: stuckHigh && G.score===100*G.mult };

    // TEST HANDLE BOUNCE: handle into the wall -> thunk back, NOT done
    S.newClimb(1); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0;
    G.x=W.wallX-3; G.y=10; G.vx=9; G.vy=0; G.ang=0; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(15,16);
    r.bounce={ done:!!G.done, vx:+G.vx.toFixed(1), pass: !G.done && G.vx<0 };

    // TEST TOP CLAMP: overshooting sticks into the top band at topMult
    S.newClimb(1); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0;
    G.x=W.wallX-3; G.y=W.wallTop+9; G.vx=9; G.vy=0; G.ang=PI; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(15,16);
    r.topClamp={ done:!!G.done, mult:G.mult, stuckY:+G.stuckY.toFixed(1),
      pass: !!G.done && G.mult===W.topMult && G.stuckY<=W.wallTop-1.7 };

    // TEST FINISH FLOW: ceremony lands on the climb result + level ladder bumps
    S.stepN(220,16);
    var t=document.getElementById('go-title').textContent;
    var tclv=+document.getElementById('t-clvl').textContent;
    r.finish={ title:t, climbLevel:tclv, pass: t.indexOf('WALL CLIMB')===0 && tclv>=2 };

    // TEST LEDGE ASSIST (journey): side contact near a block top steps UP
    S.newGame(3); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0; W.crystals.length=0;
    W.blocks.push({x:20,y:0,w:3.4,h:3.2,solid:true,spring:false});
    G.x=18.8; G.y=3.4; G.vx=8; G.vy=0; G.ang=0; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(8,16);
    r.ledge={ y:+G.y.toFixed(2), grounded:!!G.grounded, x:+G.x.toFixed(1),
      pass: G.y>3.2+1.3 };   // stepped up onto the ledge instead of bouncing off

    // TEST HEAD BONK keeps forward motion (no pocket traps)
    S.newGame(3); S.freeze();
    G=S.state(); W=S.world(); W.items.length=0; W.crystals.length=0;
    W.blocks.push({x:18,y:6,w:6,h:1,solid:true,spring:false});
    G.x=20; G.y=4; G.vx=1; G.vy=9; G.ang=0; G.w=0; G.grounded=false; G.holding=false;
    S.stepN(8,16);
    r.bonk={ vy:+G.vy.toFixed(1), vx:+G.vx.toFixed(1), pass: G.vy<0 && G.vx>=6 };

    // TEST OBSTACLE PRESENCE: freefall lvl 8 + journey lvl 8 hazards intact
    var counts={wasps:0,planks:0,thorns:0,gourds:0,gold:0}, b;
    for(b=0;b<4;b++){
      S.newFF(8); S.freeze(); W=S.world();
      counts.wasps+=W.wasps.length; counts.planks+=W.planks.length; counts.thorns+=W.thorns.length;
      var gi; for(gi=0;gi<W.items.length;gi++){ if(W.items[gi].boom)counts.gourds++; if(W.items[gi].f&&W.items[gi].f.n==='goldfruit')counts.gold++; }
    }
    var jc={wasps:0,thorns:0,crumbles:0,gourds:0};
    for(b=0;b<4;b++){
      S.newGame(8); S.freeze(); W=S.world();
      jc.wasps+=(W.wasps||[]).length; jc.thorns+=(W.thorns||[]).length;
      var bi2; for(bi2=0;bi2<W.blocks.length;bi2++){ if(W.blocks[bi2].crumble)jc.crumbles++; }
      for(gi=0;gi<W.items.length;gi++){ if(W.items[gi].boom)jc.gourds++; }
    }
    r.obstacles={ ff:counts, journey:jc,
      pass: counts.wasps>0 && counts.planks>0 && counts.thorns>0 && counts.gourds>0 && counts.gold>0
         && jc.wasps>0 && jc.thorns>0 && jc.crumbles>0 && jc.gourds>0 };

    // TEST CRUMBLE: landing on a cracked shelf drops it
    S.newGame(8); S.freeze();
    G=S.state(); W=S.world();
    var cb2=null, ci2; for(ci2=0;ci2<W.blocks.length;ci2++){ if(W.blocks[ci2].crumble){ cb2=W.blocks[ci2]; break; } }
    if(cb2){
      G.x=cb2.x+cb2.w/2; G.y=cb2.y+cb2.h+3; G.vx=0; G.vy=-4; G.ang=0; G.w=0; G.holding=false;
      S.stepN(20,16);
      var armed=!!cb2.crumbleT;
      S.stepN(45,16);
      r.crumble={ found:true, armed:armed, gone:!!cb2.gone, pass: armed && !!cb2.gone };
    } else r.crumble={ found:false, pass:false };

    // TEST FORGE: wallbreaker card present
    var fb=document.getElementById('b-forge'); if(fb)fb.click();
    var names=[], fns=document.querySelectorAll('.fname'), fi;
    for(fi=0;fi<fns.length;fi++)names.push(fns[fi].textContent);
    r.forge={ cards:names.length, hasWallbreaker: names.indexOf('Wallbreaker Pick')>=0,
      pass: names.indexOf('Wallbreaker Pick')>=0 };

    r.allPass = r.build.pass && r.flappy.pass && r.stickLow.pass && r.stickHigh.pass && r.bounce.pass
      && r.topClamp.pass && r.finish.pass && r.ledge.pass && r.bonk.pass && r.obstacles.pass
      && r.crumble.pass && r.forge.pass;
    return r;
  });
  // boot path: ?mode=climb drops straight onto the wall
  var page2 = await browser.newPage();
  page2.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push('boot: '+e.message); });
  await page2.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1&mode=climb', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,900)});
  var boot = await page2.evaluate(function(){ var g=window._S3&&window._S3.state(); return { started: !!(g&&g.climbWall&&g.mode==='run') }; });
  out.bootClimb=boot; out.allPass=out.allPass&&boot.started;
  out.errors=errors;
  console.log('CLIMB '+(out.allPass&&errors.length===0?'OK':'FAIL'));
  console.log(JSON.stringify(out,null,1));
  await browser.close();
  process.exit(out.allPass&&errors.length===0?0:1);
})();
