/* bot_climb.js — Wall Climb + new-obstacle verification (physics probes).
 * Mirrors the house harness: file:// + ?dev=1 + swiftshader, _S3 hook, stepN.
 * Climb control model (Stephen 7/19): journey-style TAP TO FLICK, parked on
 * the pad until the first tap; handle-kick off walls climbs; blade = stuck.
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

    // TEST PARKED START: nothing moves until the first tap
    S.newClimbEndless(); S.freeze();
    var G=S.state(), W=S.world();
    var y0p=G.y;
    S.stepN(50,16);
    r.parked={ started:!!G.started, y:+G.y.toFixed(2), moved:+(G.y-y0p).toFixed(2), grounded:!!G.grounded,
      pass: !G.started && Math.abs(G.y-y0p)<0.05 };

    // TEST TAP FLICK: a tap starts the run and pops you up toward the tapped side
    S.tap(1); S.stepN(3,16);
    r.tapFlick={ started:!!G.started, vy:+G.vy.toFixed(1), vx:+G.vx.toFixed(1), w:+G.w.toFixed(1),
      pass: !!G.started && G.vy>10 && G.vx>4 && G.w<0 };

    // TEST KICK: handle into the left wall -> upward rocket, no fail
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    G.x=-W.SW+2; G.y=30; G.vx=-9; G.vy=-2; G.ang=PI; G.w=0; G.holding=false; G.hold=0; G.grounded=false;
    var vyPeak=-99, st;
    for(st=0;st<30;st++){ S.stepN(1,16); if(G.vy>vyPeak)vyPeak=G.vy; if(G.kicks>=1&&st>2)break; }
    r.kick={ failed:!!G.failed, kicks:G.kicks, vyPeak:+vyPeak.toFixed(1), vxAfter:+G.vx.toFixed(1),
      pass: !G.failed && G.kicks>=1 && vyPeak>12 && G.vx>0 };

    // TEST BLADE FAIL: blade into the left wall -> stuck, run over
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    G.x=-W.SW+2; G.y=30; G.vx=-9; G.vy=-2; G.ang=0; G.w=0; G.holding=false; G.hold=0; G.grounded=false;
    S.stepN(30,16);
    r.bladeFail={ failed:!!G.failed, done:!!G.done, pass: !!G.failed && !!G.done };

    // TEST SAP: a sap patch dampens the kick hard
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    W.sap.push({side:-1,y0:26,y1:34});
    G.x=-W.SW+2; G.y=30; G.vx=-9; G.vy=-2; G.ang=PI; G.w=0; G.holding=false; G.hold=0; G.grounded=false;
    var vyPeakS=-99, st2;
    for(st2=0;st2<30;st2++){ S.stepN(1,16); if(G.vy>vyPeakS)vyPeakS=G.vy; if(G.kicks>=1&&st2>2)break; }
    r.sap={ failed:!!G.failed, kicks:G.kicks, vyPeak:+vyPeakS.toFixed(1),
      pass: !G.failed && G.kicks>=1 && vyPeakS>4 && vyPeakS<9 };

    // TEST MIST: an idle started run gets swallowed by the rising void
    S.newClimbEndless(); S.freeze();
    G=S.state(); G.started=true;
    G.x=0; G.y=6; G.vx=0; G.vy=0; G.ang=PI/2; G.w=0; G.voidT=8; G.voidY=5.2; G.holding=false; G.grounded=false;
    S.stepN(160,16);
    r.mist={ failed:!!G.failed, mistDeath:!!G.mistDeath, pass: !!G.failed && !!G.mistDeath };

    // TEST CLIMBABILITY: scripted wall pogo gains real height (12 kicks)
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    W.thorns.length=0; W.wasps.length=0; W.sap.length=0; W.crystals.length=0; W.planks.length=0; W.wind.length=0; W.pads.length=0; W.slabs.length=0; W.items.length=0;
    var y0=20, i;
    G.y=y0; G.x=-W.SW+2.2; G.vx=-8; G.vy=0; G.ang=PI; G.w=0; G.holding=false; G.grounded=false;
    for(i=0;i<12;i++){
      var side=(i%2===0)?-1:1;
      G.x=side<0?-W.SW+2.2:W.SW-2.2;
      G.vx=(side<0)?-8:8;
      G.ang=(side<0)?PI:0;
      G.w=0; G.holding=false; G.grounded=false;
      S.stepN(10,16);
      S.stepN(22,16);
      if(G.failed)break;
    }
    r.pogo={ failed:!!G.failed, kicks:G.kicks, yStart:y0, yEnd:+G.y.toFixed(1),
      gained:+(G.y-y0).toFixed(1), heightStat:+G.height.toFixed(1),
      pass: !G.failed && G.kicks>=10 && (G.y-y0)>20 };

    // TEST SUMMIT WIN: crossing the goal ribbon clears the level
    S.newClimb(2); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    r.summitSetup={ goal:W.goal, climbGoal:G.climbGoal };
    G.x=0; G.y=W.goal-0.8; G.vx=0; G.vy=14; G.ang=PI/2; G.w=0; G.holding=false; G.grounded=false; G.voidY=-14; G.voidT=0;
    S.stepN(25,16);
    var wonNow = G.done && !G.failed;
    S.stepN(220,16);   // ride the ceremony into finishLevel
    r.summit={ won:wonNow, mult:G.mult, title:document.getElementById('go-title').textContent,
      pass: wonNow && G.climbGoal>0 && document.getElementById('go-title').textContent.indexOf('SUMMIT')>=0 };

    // TEST STING: a thorn contact knocks DOWN and resets combo
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    G.x=0; G.y=40; G.vx=6; G.vy=0; G.ang=PI/2; G.w=0; G.combo=5; G.grounded=false;
    W.thorns.push({x:2.2,y:40,r:1.7});
    S.stepN(12,16);
    r.sting={ combo:G.combo, chips:G.chips||0, vy:+G.vy.toFixed(1),
      pass: G.combo===0 && (G.chips||0)>=1 && G.vy<=-5 };

    // TEST WIND: a gust corridor shoves you sideways with no input
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    W.wind.length=0; W.wind.push({y0:50,y1:60,dir:1});
    G.x=0; G.y=55; G.vx=0; G.vy=6; G.ang=PI/2; G.w=0; G.holding=false; G.voidT=0; G.grounded=false;
    S.stepN(25,16);
    r.wind={ vx:+G.vx.toFixed(2), pass: G.vx>1.0 };

    // TEST KICK STREAK: 5 clean kicks pay the streak bonus
    S.newClimbEndless(); S.freeze();
    G=S.state(); W=S.world(); G.started=true;
    W.thorns.length=0; W.wasps.length=0; W.sap.length=0; W.crystals.length=0; W.planks.length=0; W.wind.length=0; W.pads.length=0; W.slabs.length=0; W.items.length=0;
    var preSc=G.score, ki;
    for(ki=0;ki<5;ki++){
      var sd2=(ki%2===0)?-1:1;
      G.x=sd2<0?-W.SW+2.2:W.SW-2.2; G.y=30+ki*2; G.vx=(sd2<0)?-8:8; G.vy=0; G.ang=(sd2<0)?PI:0; G.w=0; G.holding=false; G.grounded=false;
      S.stepN(8,16);
    }
    r.streak={ kickStreak:G.kickStreak||0, scoreGain:G.score-preSc,
      pass: (G.kickStreak||0)>=5 && (G.score-preSc)>=150 };

    // TEST GOURD (freefall): slicing the boom gourd costs you
    S.newFF(5); S.freeze();
    G=S.state(); W=S.world();
    var preScore=1000; G.score=preScore; G.combo=4; G.y=-30; G.x=0; G.vx=6; G.vy=-2; G.ang=PI; G.w=0;
    W.items.length=0; W.thorns.length=0; W.wasps.length=0; W.planks.length=0; W.slabs.length=0; W.pads.length=0; W.crystals.length=0;
    W.items.push({x:2.2,y:-30,r:1.25,f:{n:'gourd',r:1.25,col:0,inner:0,pts:0,pitch:0.6},mesh:new THREE.Mesh(new THREE.BoxGeometry(1,1,1)),cut:false,boom:true});
    S.stepN(10,16);
    r.gourd={ cut:!!W.items[0].cut, score:G.score, combo:G.combo, chips:G.chips||0,
      pass: !!W.items[0].cut && G.score===preScore && G.combo===0 && (G.chips||0)>=1 };

    // TEST OBSTACLE PRESENCE: freefall lvl 8 + journey lvl 8 roll the new hazards
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

    // TEST CRUMBLE: landing on a cracked shelf drops it out from under you
    S.newGame(8); S.freeze();
    G=S.state(); W=S.world();
    var cb2=null, ci2; for(ci2=0;ci2<W.blocks.length;ci2++){ if(W.blocks[ci2].crumble){ cb2=W.blocks[ci2]; break; } }
    if(cb2){
      G.x=cb2.x+cb2.w/2; G.y=cb2.y+cb2.h+3; G.vx=0; G.vy=-4; G.ang=0; G.w=0; G.holding=false;
      S.stepN(20,16);                 // land + arm the crack
      var armed=!!cb2.crumbleT;
      S.stepN(45,16);                 // wobble then drop
      r.crumble={ found:true, armed:armed, gone:!!cb2.gone, pass: armed && !!cb2.gone };
    } else r.crumble={ found:false, pass:false };

    // TEST FORGE: wallbreaker skin card shows up in the store (via the DOM)
    var fb=document.getElementById('b-forge'); if(fb)fb.click();
    var names=[], fns=document.querySelectorAll('.fname'), fi;
    for(fi=0;fi<fns.length;fi++)names.push(fns[fi].textContent);
    r.forge={ cards:names.length, hasWallbreaker: names.indexOf('Wallbreaker Pick')>=0,
      pass: names.indexOf('Wallbreaker Pick')>=0 };

    r.allPass = r.parked.pass && r.tapFlick.pass && r.kick.pass && r.bladeFail.pass && r.sap.pass && r.mist.pass
      && r.pogo.pass && r.summit.pass && r.sting.pass && r.wind.pass && r.streak.pass && r.gourd.pass
      && r.obstacles.pass && r.crumble.pass && r.forge.pass;
    return r;
  });
  // boot path: ?mode=climb drops straight into the endless climb
  var page2 = await browser.newPage();
  page2.on('pageerror', function(e){ if(!/ServiceWorker/.test(e.message)) errors.push('boot: '+e.message); });
  await page2.goto('file:///workspaces/lucid-winds/satellites/slice-3d/index.html?dev=1&mode=climb', {waitUntil:'networkidle2'});
  await new Promise(function(r){setTimeout(r,900)});
  var boot = await page2.evaluate(function(){ var g=window._S3&&window._S3.state(); return { started: !!(g&&g.climbing) }; });
  out.bootClimb=boot; out.allPass=out.allPass&&boot.started;
  out.errors=errors;
  console.log('CLIMB '+(out.allPass&&errors.length===0?'OK':'FAIL'));
  console.log(JSON.stringify(out,null,1));
  await browser.close();
  process.exit(out.allPass&&errors.length===0?0:1);
})();
