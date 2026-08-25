/* Store screenshots v2: lit geography via setSpreadOrder, coherent endings,
   zoomed portrait, Crisis flavor shot. */
import puppeteer from "puppeteer";
const STEAM="/workspaces/lucid-winds/store/ftw-steam/shots";
const PLAY="/workspaces/lucid-winds/store/ftw-play";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});

async function boot(vp){
  const p=await br.newPage();
  p.on('dialog',d=>d.accept());
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.removeItem("ftw_run");localStorage.setItem("ftw_guide_done","1");
    localStorage.setItem("ftw_seen",JSON.stringify({brief_CONTRACTOR:1,brief_CRISIS:1,brief_DEEPSTATE:1}));}catch(e){}});
  await p.setViewport(vp);
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2200);
  return p;
}
async function startGame(p,mode){
  await p.evaluate(m=>{document.querySelector(`[data-m="${m}"]`).click();},mode);
  await sleep(250);
  await p.evaluate(()=>document.getElementById("startBtn").click());
  for(let i=0;i<24;i++){await sleep(300);if(await p.evaluate(()=>!!window._dbgPv))break;}
  const scr=await p.evaluate(()=>[...document.querySelectorAll('.screen')].filter(e=>e.classList.contains('on')).map(e=>e.id).join(','));
  if(!(await p.evaluate(()=>!!window._dbgPv))){console.log('PICK NEVER CAME, screen=',scr);process.exit(3);}
  const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
      const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
      const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
  await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
  await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1700);
}
const STAGE=`
  function lightUp(id,cov,ctl,cmp,un,res){const r=S.regions[id];if(!r)return;
    r.active=true;r.coverage=cov;r.control=ctl;r.compliance=cmp;r.unrest=un;r.resist=res;
    setSpreadOrder(S,id,anchorOf(id));}
`;
const MID=STAGE+`
  if(!S.doctrine){S.doctrine='glove';recompute(S);}
  lightUp('SA',0.85,0.6,0.72,20,16);lightUp('NA',0.62,0.45,0.66,28,26);lightUp('WE',0.45,0.26,0.5,47,38);
  lightUp('EE',0.66,0.45,0.72,16,12);lightUp('ME',0.5,0.34,0.62,24,10);lightUp('SAs',0.38,0.22,0.55,32,20);
  lightUp('CND',0.4,0.25,0.6,18,20);lightUp('SEA',0.3,0.18,0.55,22,12);
  S.regions.WE.pstate='peaceful';S.cash=8.4e8;S.inf=64;S.day=412;S.oversight=31;
  ['ord','pilot','muni','retail','face','plate','panic','astro','lobby'].forEach(n=>S.owned.add(n));
  recompute(S);popTotals(S);
  S.bubbles.length=0;
  S.bubbles.push({k:'cash',x:250,y:210,life:34,born:S.day,v:220});
  S.bubbles.push({k:'inf',x:520,y:150,life:34,born:S.day,v:4});
  S.bubbles.push({k:'leak',x:435,y:250,life:34,born:S.day,v:0});
  paintHud();gv.dirty=true;
`;
const ENDSTAGE=STAGE+`
  if(!S.doctrine){S.doctrine='glove';recompute(S);}
  REGIONS.forEach(R=>{lightUp(R.id,0.97,0.95,0.9,6,8);});
  S.day=1497;S.oversight=64;S.cash=2.1e9;recompute(S);
  S._lastChoiceMs=Date.now();tick();S.oversight=64;paintHud();
`;

/* ---------- STEAM 1920x1080 ---------- */
{
  const p=await boot({width:1920,height:1080,deviceScaleFactor:1});
  await startGame(p,"CONTRACTOR");
  await p.evaluate(MID);await sleep(1400);
  await p.screenshot({path:STEAM+"/shot1-map.png"});
  /* coherent ending */
  await p.evaluate(ENDSTAGE);await sleep(300);
  await p.evaluate(()=>finish(true,'win'));await sleep(2600);
  await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1500);
  await p.screenshot({path:STEAM+"/shot5-ending.png"});
  await p.close();
}
/* Crisis flavor for shot2 */
{
  const p=await boot({width:1920,height:1080,deviceScaleFactor:1});
  await startGame(p,"CRISIS");
  await p.evaluate(MID+`
    S.doctrine='fist';recompute(S);
    S.warHeat=0.42;S.oversight=44;
    S.regions.WE.pstate='violent';S.regions.WE.unrest=74;
    S.regions.NA.pstate='peaceful';S.regions.NA.unrest=52;
    ['threat','agit','border','charter'].forEach(n=>S.owned.add(n));recompute(S);paintHud();
    const[wx,wy]=anchorOf('WE');S.pings.push({x:wx,y:wy,t:0,kind:'v'});
  `);await sleep(1200);
  await p.screenshot({path:STEAM+"/shot2-crisis.png"});
  await p.close();
}
/* ---------- PLAY portrait ---------- */
{
  const p=await boot({width:1080,height:1920,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await startGame(p,"CONTRACTOR");
  await p.evaluate(MID);await sleep(600);
  /* zoom to the action so portrait is not a letterboxed band (drive the view
     directly - synthetic click() does not reach the zoom buttons) */
  await p.evaluate(()=>{gv.z=gv.containZ*2.5;gv.center(400,215);gv.dirty=true;});
  await sleep(900);
  await p.screenshot({path:PLAY+"/play-shot2-map.png"});
  await p.evaluate(ENDSTAGE);await sleep(300);
  await p.evaluate(()=>finish(true,'win'));await sleep(2600);
  await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1500);
  await p.screenshot({path:PLAY+"/play-shot4-ending.png"});
  await p.close();
}
await br.close();
console.log("done v2");
