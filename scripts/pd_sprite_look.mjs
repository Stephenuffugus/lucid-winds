/* Shoot every sprite state of the wired Puppy Dash skin from the player's
   seat, driving the REAL update()/render(). One PNG per state. */
import p from "puppeteer";
const OUT="/tmp/claude-1000/-workspaces-lucid-winds/98fe5831-1e9f-4f9d-9642-ad52f261494e/scratchpad/pdspr";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"]});
const errs=[];
const pg=await b.newPage();
await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
pg.on("pageerror",e=>errs.push(String(e).slice(0,200)));
await pg.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('sws_dev_ok','1');}catch(e){}});
await pg.goto("http://127.0.0.1:8777/satellites/puppy-dash/index.html?pd_test=1",{waitUntil:"domcontentloaded",timeout:45000});
await sleep(1500);
/* wait for every sprite to load, and SAY which did not */
const ready=await pg.evaluate(async()=>{
  const D=window.PD;
  for(let i=0;i<40;i++){
    const pu=Object.keys(D.PUP_STATES).filter(s=>!D.PUP_READY[s]);
    const ob=Object.keys(D.OB_SPR).filter(s=>!D.OB_READY[s]);
    if(!pu.length&&!ob.length) return {ok:true};
    await new Promise(r=>setTimeout(r,250));
  }
  return {ok:false,pup:Object.keys(D.PUP_STATES).filter(s=>!window.PD.PUP_READY[s]),
          ob:Object.keys(D.OB_SPR).filter(s=>!window.PD.OB_READY[s])};
});
console.log("sprites:",JSON.stringify(ready));
await pg.evaluate(()=>{document.querySelectorAll('.lwfb-fab,.lwfb-fab-x').forEach(e=>e.style.setProperty('display','none','important'));});
/* take the clock: the page's own rAF loop keeps playing the game (and dying)
   between our evaluates. Stub it out; every frame below is ours. */
await pg.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
await pg.screenshot({path:OUT+"/00_select_card.png"});
/* helper: run the real loop for T seconds then render one clean frame */
/* clear the field every frame while stepping: rows spawn inside update(),
   and a shoot that dies mid-sequence photographs the wrong state */
const step=(T)=>pg.evaluate((T)=>{const D=window.PD;const dt=1/60;
  for(let n=0;n<T*60;n++){ D.state.objs.length=0; D.update(dt); } D.render();},T);
const shot=async(name)=>{await pg.evaluate(()=>{
  document.getElementById("gameOverScreen").classList.add("hidden");
  window.PD.render();});await pg.screenshot({path:OUT+"/"+name});};
await pg.evaluate(()=>{const D=window.PD;D.startRun();
  const dt=1/60;for(let n=0;n<600&&D.state.speed<(D.CFG.spd0+D.CFG.spdMax)/2;n++){D.state.objs.length=0;D.update(dt);}
  D.state.objs.length=0;D.state.parts.length=0;D.state.floaters.length=0;});
await shot("01_run_a.png");
await step(0.30); await shot("02_run_b.png");
/* jump: rise, peak, fall */
await pg.evaluate(()=>window.PD.doJump()); await step(0.06); await shot("03_jump_rise.png");
await step(0.18); await shot("04_jump_peak.png");
await step(0.16); await shot("05_jump_fall.png");
/* land squash frames */
await pg.evaluate(()=>{const D=window.PD;const dt=1/60;let n=0;while(D.state.jump>0&&n<200){D.update(dt);n++;}D.update(dt);D.render();});
await shot("06_land.png");
await step(0.3);
/* slide hold */
await pg.evaluate(()=>window.PD.doSlide()); await step(0.25); await shot("07_slide_hold.png");
await step(0.6);
/* bank left then right (flip) */
await pg.evaluate(()=>{window.PD.state.targetLane=0;}); await step(0.03); await shot("08_bank_left_in.png");
await step(0.08); await shot("09_bank_left_hold.png");
await step(0.6);
await pg.evaluate(()=>{window.PD.state.targetLane=2;}); await step(0.05); await shot("10_bank_right_flip.png");
await step(0.8);
/* all six obstacles staged on the road at two depths */
await pg.evaluate(()=>{const D=window.PD,S=D.state;S.objs.length=0;
  const HY=S? D.prog:0;
  const L=D.L;
  D.OBSTACLES.forEach((o,i)=>{ S.objs.push({kind:"ob",o,lane:i%3,y:L.HY+(D.L.PY-D.L.HY)*(i<3?0.85:0.55),resolved:true}); });
  D.render();});
await shot("11_obstacles.png");
/* caught: startled, tumble, flat-under-card */
await pg.evaluate(()=>{const D=window.PD;D.state.objs.length=0;D.gameOver();});
await step(0.05); await shot("12_caught_startled.png");
await step(0.18); await shot("13_caught_tumble.png");
await step(0.5); await shot("14_caught_flat.png");
console.log("errors:",errs.length?errs:"none");
await b.close();
