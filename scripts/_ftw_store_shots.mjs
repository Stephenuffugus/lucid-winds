/* Store screenshot candidates: Steam 1920x1080 + Play portrait 1080x1920.
   Staged mid-game states so the map is alive; every shot gets LOOKED at. */
import puppeteer from "puppeteer";
import fs from "fs";
const STEAM="/workspaces/lucid-winds/store/ftw-steam/shots";
const PLAY="/workspaces/lucid-winds/store/ftw-play";
fs.mkdirSync(STEAM,{recursive:true});fs.mkdirSync(PLAY,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const br=await puppeteer.launch({headless:"new",args:["--no-sandbox","--disable-setuid-sandbox"]});

async function boot(vp){
  const p=await br.newPage();
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem("sws_dev_ok","1");localStorage.setItem("ftw_guide_done","1");localStorage.setItem("ftw_seen",JSON.stringify({brief_CONTRACTOR:1,brief_CRISIS:1}));}catch(e){}});
  await p.setViewport(vp);
  await p.goto("http://127.0.0.1:8777/satellites/flock-the-world/?probe="+Math.random(),{waitUntil:"domcontentloaded"});
  await sleep(2200);
  return p;
}
async function startGame(p,mode){
  await p.evaluate(m=>{document.querySelector(`[data-m="${m}"]`).click();},mode);
  await sleep(250);
  await p.evaluate(()=>document.getElementById("startBtn").click());await sleep(1300);
  const pt=await p.evaluate(()=>{const c=document.getElementById("pickMap");const r=c.getBoundingClientRect();
    for(let fy=0.15;fy<0.9;fy+=0.02)for(let fx=0.05;fx<0.95;fx+=0.02){
      const[wx,wy]=window._dbgPv.toWorld(r.width*fx,r.height*fy);
      const hit=countryAtPoint(wx,wy);if(hit&&hit.n==="Brazil")return{x:r.x+r.width*fx,y:r.y+r.height*fy};}return null;});
  await p.touchscreen.tap(pt.x,pt.y);await sleep(400);
  await p.evaluate(()=>document.getElementById("beginBtn").click());await sleep(1700);
}
/* a believable mid-game: coverage spread across several blocs, some tension */
function stageMid(){
  const set=(id,cov,ctl,cmp,un,res)=>{const r=S.regions[id];if(!r)return;
    r.active=true;r.coverage=cov;r.control=ctl;r.compliance=cmp;r.unrest=un;r.resist=res;};
  set('SA',0.72,0.5,0.7,22,18);set('NA',0.55,0.4,0.66,30,26);set('WE',0.4,0.24,0.5,48,38);
  set('EE',0.6,0.42,0.72,18,12);set('ME',0.35,0.3,0.62,26,10);set('SAs',0.3,0.2,0.55,34,20);
  S.regions.WE.pstate='peaceful';S.cash=8.4e8;S.inf=46;S.day=412;S.oversight=31;
  ['ord','pilot','muni','retail','face','plate','panic','astro','lobby'].forEach(n=>S.owned.add(n));
  recompute(S);popTotals(S);
  for(let i=0;i<4;i++)S.bubbles.push({k:['cash','inf','leak','cash'][i],x:290+i*95,y:170+(i%2)*90,life:34,born:S.day,v:120});
  paintHud();gv&&(gv.dirty=true);
}
/* ---------- STEAM 1920x1080 ---------- */
{
  const p=await boot({width:1920,height:1080,deviceScaleFactor:1});
  await startGame(p,"CONTRACTOR");
  await p.evaluate(stageMid);await sleep(1200);
  await p.screenshot({path:STEAM+"/shot1-map.png"});
  await p.evaluate(()=>openSheet('reg'));await sleep(700);
  await p.screenshot({path:STEAM+"/shot2-world-paths.png"});
  await p.evaluate(()=>closeSheet());await sleep(200);
  await p.evaluate(()=>openSheet('inf'));await sleep(700);
  await p.screenshot({path:STEAM+"/shot3-story-tree.png"});
  await p.evaluate(()=>closeSheet());await sleep(200);
  await p.evaluate(()=>doctrineModal());await sleep(500);
  await p.screenshot({path:STEAM+"/shot4-doctrine.png"});
  await p.evaluate(()=>document.querySelector('[data-doc="glove"]').click());await sleep(300);
  await p.evaluate(()=>{finish(true,'win');});await sleep(2600);
  await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1500);
  await p.screenshot({path:STEAM+"/shot5-ending.png"});
  await p.close();
}
/* ---------- PLAY portrait 1080x1920 ---------- */
{
  const p=await boot({width:1080,height:1920,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await p.screenshot({path:PLAY+"/play-shot1-menu.png"});
  await startGame(p,"CONTRACTOR");
  await p.evaluate(stageMid);await sleep(1200);
  await p.screenshot({path:PLAY+"/play-shot2-map.png"});
  await p.evaluate(()=>openSheet('reg'));await sleep(700);
  await p.screenshot({path:PLAY+"/play-shot3-world.png"});
  await p.evaluate(()=>closeSheet());await sleep(200);
  await p.evaluate(()=>{finish(true,'win');});await sleep(2600);
  await p.evaluate(()=>document.getElementById("endStory").click());await sleep(1500);
  await p.screenshot({path:PLAY+"/play-shot4-ending.png"});
  await p.close();
}
await br.close();
console.log("done");
