/* Shoot the Aug 25 Puppy Dash drop from the player's seat: the world skin
   (sky/treeline/fence/road/props), the pickup sprites, and every state of all
   four new animals. Same discipline as pd_sprite_look.mjs: stub rAF, own the
   clock, clear spawns while stepping. */
import p from "puppeteer";
import fs from "fs";
const OUT="/workspaces/lucid-winds/portal-assets/review/pd-drop-aug25";
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const b=await p.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"]});
const errs=[];
const pg=await b.newPage();
await pg.setViewport({width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true});
pg.on("pageerror",e=>errs.push(String(e).slice(0,200)));
await pg.evaluateOnNewDocument(()=>{try{localStorage.clear();localStorage.setItem('sws_dev_ok','1');}catch(e){}});
await pg.goto("http://127.0.0.1:8777/satellites/puppy-dash/index.html?pd_test=1&probe="+Math.random(),{waitUntil:"domcontentloaded",timeout:45000});
await sleep(1600);
/* preload EVERY animal + wait for env art, and SAY what did not load */
const ready=await pg.evaluate(async()=>{
  const D=window.PD;
  Object.keys(D.CH_META).forEach(id=>D.loadCharArt(id));
  for(let i=0;i<60;i++){
    const ch=[];
    for(const id of Object.keys(D.CH_META))
      for(const st of Object.keys(D.CH_META[id].states))
        if(!D.CH_READY[id]||!D.CH_READY[id][st]) ch.push(id+"/"+st);
    const env=["sky","road","treeline","fence","tree","bench","flowers","bone","bone_gold","magnet","jetpack"]
      .filter(k=>!D.ENV_READY[k]);
    if(!ch.length&&!env.length) return {ok:true};
    if(i===59) return {ok:false,ch,env};
    await new Promise(r=>setTimeout(r,250));
  }
},{timeout:30000});
console.log("art:",JSON.stringify(ready));
await pg.evaluate(()=>{document.querySelectorAll('.lwfb-fab,.lwfb-fab-x').forEach(e=>e.style.setProperty('display','none','important'));});
await pg.evaluate(()=>{ window.requestAnimationFrame=()=>0; });
await pg.evaluate(()=>window.PD.buildSelect());
await sleep(200);
await pg.screenshot({path:OUT+"/00_select.png"}); console.log("shot select");

const step=(T)=>pg.evaluate((T)=>{const D=window.PD;const dt=1/60;
  for(let n=0;n<T*60;n++){ D.state.objs.length=0; D.update(dt); } D.render();},T);
const shot=async(name)=>{await pg.evaluate(()=>{
  document.getElementById("gameOverScreen").classList.add("hidden");
  window.PD.render();});await pg.screenshot({path:OUT+"/"+name});console.log("shot",name);};

/* the world, mid-run, with a spawned field left alone so props/obstacles/
   pickups all show: this one frame is the whole drop in one look */
await pg.evaluate(()=>{const D=window.PD;D.startRun();
  const dt=1/60;for(let n=0;n<480;n++){D.state.objs.length=0;D.update(dt);}D.render();});
await shot("01_world_live.png");
await pg.evaluate(()=>{const D=window.PD;
  if(D.state.mode!=="play"){D.reset();const dt=1/60;for(let n=0;n<200;n++){D.state.objs.length=0;D.update(dt);}}
  D.state.objs.length=0;D.state.props.length=0;
  /* stage a readable field: one of each obstacle depth-staggered, bones, both powerups */
  const HY=D.L.HY, T=D.L.PY-HY;
  D.state.objs.push({kind:"ob",o:{id:"hydrant",action:"jump"},lane:0,y:HY+T*0.75,resolved:false});
  D.state.objs.push({kind:"ob",o:{id:"trashcan",action:"dodge"},lane:2,y:HY+T*0.55,resolved:false});
  D.state.objs.push({kind:"ob",o:{id:"limbo",action:"slide"},lane:1,y:HY+T*0.35,resolved:false});
  for(let j=0;j<4;j++)D.state.objs.push({kind:"bis",lane:1,y:HY+T*(0.62-j*0.07),dead:false,gold:j===2});
  D.state.objs.push({kind:"jet",lane:0,y:HY+T*0.42,resolved:false,dead:false});
  D.state.objs.push({kind:"magnet",lane:2,y:HY+T*0.30,resolved:false,dead:false});
  D.spawnProp();D.spawnProp();D.spawnProp();D.spawnProp();
  D.state.props.forEach((pr,i)=>{pr.y=HY+T*(0.25+i*0.2);pr.kind=["tree","bench","tuft","tree"][i%4];pr.side=i%2?1:-1;});
  D.render();});
await shot("02_world_staged.png");

for(const id of ["fox","bunny","raccoon","kitten"]){
  await pg.evaluate(id=>{const D=window.PD;
    D.state.animal=D.ANIMALS.find(a=>a.id===id);
    D.reset();D.state.spawnT=999;D.state.jetSpawnT=999;D.state.magnetSpawnT=999;
    const dt=1/60;for(let n=0;n<200;n++){D.state.objs.length=0;D.update(dt);}
    D.state.parts.length=0;D.render();},id);
  await shot(id+"_run.png");
  await pg.evaluate(()=>window.PD.doJump()); await step(0.20); await shot(id+"_jump.png");
  await pg.evaluate(()=>{const D=window.PD;const dt=1/60;let n=0;while(D.state.jump>0&&n<300){D.state.objs.length=0;D.update(dt);n++;}D.render();});
  await pg.evaluate(()=>window.PD.slide()); await step(0.22); await shot(id+"_slide.png");
  await pg.evaluate(()=>{const D=window.PD;D.state.sliding=false;D.gameOver();}); await step(0.35);
  await shot(id+"_caught.png");
}
console.log("pageerrors:",errs.length?errs:"none");
await b.close();
console.log("DONE ->",OUT);
