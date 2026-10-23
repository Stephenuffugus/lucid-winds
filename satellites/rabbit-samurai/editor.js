/* Rabbit Ronin level editor (2026-10-23, Stephen: "i may want to create a level editor so i can hand sculpt each level",
   then "a computer would be better if i can open it in my browser on my old laptop").
   Loaded by the game only at ?edit=1. It draws the dojo with the game's OWN renderer (window.__RRE.drawInto), so what
   you sculpt is what plays, and PLAY drops the rabbit into the real engine at the phone's own size. The dojo being
   edited is one plain object H in the hand format (index.html, toHand/fromHand); every change rebuilds the level from
   it. Mouse first (old laptop), touch works (one finger edits, two fingers move and zoom). Renders only on change. */
(function(){
"use strict";
var A=window.__RRE; if(!A)return;
var T=A.T, ROWS=A.ROWS, HH=A.HH;
var DPR=Math.min(1.5,window.devicePixelRatio||1);
var LSK='rr_edit_v1_';

/* ---------- the tools ---------- */
var TOOLS=[
  { k:'select', ic:'✋', nm:'Move',      key:'1', tip:'Drag a thing to move it. Drag empty space to look around. Delete removes.' },
  { k:'ground', ic:'🟫', nm:'Ground',    key:'2', tip:'Drag to paint solid ground.' },
  { k:'ledge',  ic:'➖', nm:'Ledge',     key:'3', tip:'Drag to paint a one way ledge (jump up through it, land on top).' },
  { k:'erase',  ic:'🧽', nm:'Erase',     key:'4', tip:'Drag to clear ground and things.' },
  { k:'carrot', ic:'🥕', nm:'Carrot',    key:'5', tip:'Click to place a carrot. Drag to lay a line of them.' },
  { k:'cell',   ic:'🐭', nm:'Cage',      key:'6', tip:'A caged mouse. Sits on the ground under the click.' },
  { k:'hog',    ic:'🦔', nm:'Hedgehog',  key:'7', tip:'Walks the flat ground it stands on.' },
  { k:'spit',   ic:'🐸', nm:'Toad',      key:'8', tip:'Sits still and lobs when the rabbit is near.' },
  { k:'crow',   ic:'🐦', nm:'Crow',      key:'9', tip:'Flies back and forth around where you click.' },
  { k:'porc',   ic:'🌀', nm:'Vine ring', key:'0', tip:'A spinning ring the vine can catch. Swing height: 3 to 5 tiles over the ground.' },
  { k:'bounce', ic:'🟢', nm:'Pad',       key:'q', tip:'A bounce pad on the ground.' },
  { k:'cannon', ic:'💥', nm:'Cannon',    key:'w', tip:'Shoots the rabbit straight up.' },
  { k:'spike',  ic:'🔺', nm:'Spikes',    key:'e', tip:'Hurts on touch. In a pit they sit on its floor.' },
  { k:'gust',   ic:'🌬️', nm:'Wind',      key:'r', tip:'A wind zone that pushes the rabbit in the air.' },
  { k:'post',   ic:'🏮', nm:'Rest post', key:'t', tip:'A checkpoint with a landmark behind it. The light changes at each one.' },
  { k:'diamond',ic:'💎', nm:'Diamond',   key:'d', tip:'The end of the dojo. Only one.' },
  { k:'spawn',  ic:'🐇', nm:'Start',     key:'s', tip:'Where the rabbit starts. Only one.' }
];
var TOOL_BY={}; TOOLS.forEach(function(t){ TOOL_BY[t.k]=t; });
/* how far above the surface each grounded thing's y sits (the game's own numbers, measured on the generator's output) */
var LIFT={ cell:26, hog:14, spit:15, bounce:7, cannon:24, spike:14, post:42, diamond:42, spawn:24 };
var LIST={ carrot:'carrots', cell:'cells', hog:'hogs', spit:'spits', crow:'crows', porc:'porcs', bounce:'bounces', cannon:'cannons', spike:'spikes', gust:'gusts', post:'posts' };
var NAME={ carrot:'carrot', cell:'cage', hog:'hedgehog', spit:'toad', crow:'crow', porc:'vine ring', bounce:'pad', cannon:'cannon', spike:'spikes', gust:'wind', post:'rest post', diamond:'diamond', spawn:'start' };

/* ---------- state ---------- */
var S={ li:0, H:null, tool:'select', cam:0, y0:-T*0.5, z:0.5, grid:true, plain:true,   /* scenery off by default: the shape reads, and it is light on an old laptop */
  sel:null, hover:null, undo:[], redo:[], dirty:false, playing:false, w:0, h:0, msg:'', msgT:0,
  rev:0, clearedRev:-1, playStart:false, playRev:-1, key:'', cloud:{ st:'', draftAt:0, list:{} } };
try{ S.key=localStorage.getItem('rr_edit_key')||''; }catch(e){}

/* ---------- styles + DOM ---------- */
var css=[
'#rre{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:#0d100c;color:#e8dcc8;font:14px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;user-select:none;-webkit-user-select:none}',
'#rre.off{display:none}',
'#rre button{font:inherit;color:#e8dcc8;background:#1c2218;border:1px solid #39432f;border-radius:8px;min-height:40px;min-width:40px;padding:0 10px;cursor:pointer}',
'#rre button:hover{border-color:#7ab356}#rre button.on{background:#2f4a22;border-color:#7ab356;color:#fff}',
'#rre button:disabled{opacity:.4;cursor:default}',
'#rre-top{display:flex;gap:6px;align-items:center;padding:6px 8px;border-bottom:1px solid #2a3124;flex-wrap:wrap}',
'#rre-top select{font:inherit;color:#e8dcc8;background:#1c2218;border:1px solid #39432f;border-radius:8px;min-height:40px;padding:0 6px}',
'#rre-top .sp{flex:1}#rre-top .st{color:#8a9178;font-size:13px;min-width:90px}',
'#rre-top .play{background:#c8a84b;color:#1a1408;border-color:#c8a84b;font-weight:700}',
'#rre-mid{flex:1;display:flex;min-height:0}',
'#rre-tools{display:grid;grid-template-columns:1fr 1fr;align-content:start;gap:4px;padding:6px;border-right:1px solid #2a3124;overflow-y:auto;width:128px;flex:none}',
'#rre-tools button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:2px;min-height:52px;min-width:0;font-size:11px;line-height:1.1}',
'#rre-tools button .k{display:none}',
'#rre-tools button .i{font-size:20px}',
/* the arcade's own floaters (song card, music chip, back button, feedback) stay out of the editor; Play shows them as on the phone */
'body.rre-editing #sws-music-card,body.rre-editing #sws-music-chip,body.rre-editing #sws-music-pill,body.rre-editing #sw-arc,body.rre-editing #sws-arcade-exit,body.rre-editing .lwfb-fab,body.rre-editing .lwfb-tip{display:none!important}',
'#rre-cv{flex:1;min-width:0;position:relative;touch-action:none;cursor:crosshair}',
'#rre-cv canvas{position:absolute;inset:0;width:100%;height:100%}',
'#rre-side{width:250px;flex:none;border-left:1px solid #2a3124;padding:8px;overflow-y:auto;font-size:13px}',
'#rre-side h3{margin:10px 0 4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#c8a84b}',
'#rre-side .row{display:flex;gap:6px;align-items:center;margin:4px 0;flex-wrap:wrap}',
'#rre-side .warn{color:#f0c27a;margin:3px 0;cursor:pointer}#rre-side .ok{color:#9ec46a}',
'#rre-side .muted{color:#8a9178}',
'#rre-bot{padding:4px 10px;border-top:1px solid #2a3124;color:#8a9178;font-size:12px;min-height:22px;display:flex;gap:12px}',
'#rre-msg{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:rgba(20,24,16,.94);border:1px solid #c8a84b;border-radius:10px;padding:8px 14px;pointer-events:none;opacity:0;transition:opacity .2s;max-width:80%;text-align:center}',
'#rre-msg.on{opacity:1}',
'#rre-back{position:fixed;left:50%;top:8px;transform:translateX(-50%);z-index:9100;display:none;font:700 15px system-ui,sans-serif;color:#1a1408;background:#c8a84b;border:0;border-radius:24px;min-height:48px;padding:0 20px;box-shadow:0 2px 12px rgba(0,0,0,.5);cursor:pointer}',
'#rre-help{position:absolute;inset:0;background:rgba(8,10,6,.92);z-index:5;display:none;overflow:auto;padding:24px}',
'#rre-help.on{display:block}#rre-help div{max-width:640px;margin:0 auto}#rre-help kbd{background:#2a3124;border-radius:4px;padding:1px 6px;font:12px monospace}',
'#rre-help li{margin:4px 0}',
'@media (max-width:760px){#rre-side{display:none}#rre-side.sheet{display:block;position:absolute;right:0;top:0;bottom:0;z-index:4;background:#0d100c;width:min(300px,85vw)}',
'#rre-mid{flex-direction:column-reverse}#rre-tools{display:flex;flex-direction:row;width:auto;border-right:0;border-top:1px solid #2a3124;overflow-x:auto;overflow-y:hidden}',
'#rre-tools button{flex:none;min-width:52px;min-height:52px}#rre-tools button .i{font-size:22px}',
'#rre-top .wide{display:none}#rre-top{flex-wrap:nowrap;gap:4px;padding:4px}#rre-top select{max-width:46vw;min-width:0;flex:1}#rre-prev,#rre-next,#rre-helpb{display:none}#rre-top button{min-width:44px;min-height:44px;padding:0 6px}}',
'@media (min-width:761px){#rre-top .narrow{display:none}}'
].join('\n');
var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

var root=document.createElement('div'); root.id='rre';
root.innerHTML=
 '<div id="rre-top">'+
   '<button id="rre-prev" title="Previous dojo">◀</button><select id="rre-dojo"></select><button id="rre-next" title="Next dojo">▶</button>'+
   '<button id="rre-undo" title="Undo (Z)">↶</button><button id="rre-redo" title="Redo (Y)">↷</button>'+
   '<button id="rre-zo" class="wide" title="Zoom out (-)">−</button><button id="rre-zi" class="wide" title="Zoom in (+)">+</button>'+
   '<button id="rre-grid" class="wide" title="Grid lines (G)">Grid</button><button id="rre-plain" class="wide" title="Scenery on or off (B)">Scenery</button>'+
   '<span class="sp"></span><span class="st wide" id="rre-save"></span>'+
   '<button id="rre-info" class="narrow" title="Dojo info"><b>i</b></button><button id="rre-helpb" title="Help (H)">?</button>'+
   '<button id="rre-play" class="play" title="Play from here (P). Shift+P plays from the start.">▶<span class="wide"> Play here</span></button>'+
 '</div>'+
 '<div id="rre-mid"><div id="rre-tools"></div><div id="rre-cv"><canvas></canvas><div id="rre-msg"></div><div id="rre-help"></div></div><div id="rre-side"></div></div>'+
 '<div id="rre-bot"><span id="rre-pos"></span><span id="rre-tip"></span></div>';
document.body.appendChild(root);
var back=document.createElement('button'); back.id='rre-back'; back.textContent='■ Back to the editor (Esc)'; document.body.appendChild(back);

function $(id){ return document.getElementById(id); }
var cvWrap=$('rre-cv'), cv=cvWrap.querySelector('canvas'), ctx=cv.getContext('2d');

/* tools column */
var toolsEl=$('rre-tools');
TOOLS.forEach(function(t){ var b=document.createElement('button'); b.setAttribute('data-tool',t.k); b.title=t.nm+' ('+t.key.toUpperCase()+'): '+t.tip;
  b.innerHTML='<span class="i">'+t.ic+'</span><span class="nm">'+t.nm+'</span><span class="k">'+t.key.toUpperCase()+'</span>';
  b.addEventListener('click',function(){ setTool(t.k); }); toolsEl.appendChild(b); });
/* dojo select */
(function(){ var sel=$('rre-dojo'), h='';
  for(var i=0;i<A.LEVELS;i++){ var w=A.worldOf(i); h+='<option value="'+i+'">Dojo '+(i+1)+' · '+w.name+' '+(i%6+1)+'</option>'; }
  sel.innerHTML=h; sel.addEventListener('change',function(){ openDojo(+sel.value); }); })();

/* help */
$('rre-help').innerHTML='<div><h2 style="color:#c8a84b;margin-top:0">The dojo editor</h2>'+
 '<p>Everything you change saves on this device as you go. Pick a dojo at the top; it opens as the game made it, or as you last left it.</p><ul>'+
 '<li><b>Tools</b> on the left. Keys <kbd>1</kbd> to <kbd>0</kbd>, <kbd>Q</kbd> to <kbd>T</kbd>, <kbd>D</kbd> (diamond) and <kbd>S</kbd> (start) pick them; hover a tool to see its key.</li>'+
 '<li><b>Look around:</b> drag with the right mouse button, or hold <kbd>Space</kbd> and drag, or scroll. <kbd>Ctrl</kbd> + scroll (or pinch) zooms. Arrow keys move too.</li>'+
 '<li><b>Move tool:</b> drag a thing to move it; drag empty space to look around; <kbd>Delete</kbd> removes what is picked.</li>'+
 '<li><b>Undo</b> <kbd>Z</kbd>, <b>redo</b> <kbd>Y</kbd>.</li>'+
 '<li><b>Play here</b> <kbd>P</kbd> drops the rabbit where you are looking, in the real game at phone size. <kbd>Shift</kbd>+<kbd>P</kbd> plays from the start. <kbd>Esc</kbd> comes back.</li>'+
 '<li><b>On a phone:</b> one finger uses the tool, two fingers move and zoom.</li>'+
 '<li>The grid is the game\'s own: one square is one tile. The rabbit is under one tile tall, its vine reaches about six.</li>'+
 '</ul><p class="muted">Tap anywhere to close.</p></div>';
$('rre-help').addEventListener('click',function(){ $('rre-help').classList.remove('on'); });

/* ---------- the level ---------- */
function blankFrom(gen){ return JSON.parse(JSON.stringify(A.toHand(gen))); }
function loadLocal(li){ try{ var s=localStorage.getItem(LSK+li); if(s){ var h=JSON.parse(s); if(h&&h.v===1&&h.rows)return h; } }catch(e){} return null; }
var saveTimer=0;
function saveLocal(){ clearTimeout(saveTimer); setSave('saving…');
  saveTimer=setTimeout(function(){ try{ localStorage.setItem(LSK+S.li, JSON.stringify(S.H)); localStorage.setItem(LSK+'at_'+S.li, String(Date.now())); setSave('saved on this device'); }catch(e){ setSave('could not save: storage full?'); } },500);
  cloudSaveSoon(); }
function setSave(t){ $('rre-save').textContent=t; }
function openDojo(li){
  if(S.playing)stopPlay();
  cloudFlush();
  S.li=li; $('rre-dojo').value=li;
  var local=loadLocal(li), pub=A.PUB[li];
  S.H=JSON.parse(JSON.stringify(local||pub||A.toHand(A.gen(li))));
  S.H.li=li; S.undo=[]; S.redo=[]; S.sel=null; S.clearedRev=-1; S.cloud.draftAt=0;
  A.edit(li,S.H);
  setSave(local?'your version (saved on this device)':(pub?'the version players have':'as the game made it'));
  fitView(true); relevel(); side();
  /* a newer copy in the cloud (saved from another device) wins, unless you have already started changing this one */
  if(S.key){ var rev=S.rev, at=0; try{ at=+(localStorage.getItem(LSK+'at_'+li)||0); }catch(e){}
    api({ op:'get', li:li }).then(function(j){ if(S.li!==li)return; S.cloud.draftAt=j.draftAt;
      if(j.draft&&j.draftAt>at&&S.rev===rev){ S.H=j.draft; S.H.li=li; S.undo=[]; S.redo=[]; changedQuiet(); setSave('your version (from the cloud)'); flash('Opened your newer copy from the cloud'); }
      side(); }).catch(function(e){ cloudSt('cloud: '+e.message); }); }
}
function relevel(){ A.relevel(S.H); req(); }
function snap(){ S.undo.push(JSON.stringify(S.H)); if(S.undo.length>80)S.undo.shift(); S.redo.length=0; }
function changed(){ S.rev++; S.H.li=S.li; S.hover=null; relevel(); saveLocal(); sideSoon(); }
function changedQuiet(){ S.rev++; S.H.li=S.li; S.hover=null; relevel(); try{ localStorage.setItem(LSK+S.li, JSON.stringify(S.H)); localStorage.setItem(LSK+'at_'+S.li, String(Date.now())); }catch(e){} }
function undo(){ if(!S.undo.length)return; S.redo.push(JSON.stringify(S.H)); S.H=JSON.parse(S.undo.pop()); S.sel=null; changed(); flash('Undone'); }
function redo(){ if(!S.redo.length)return; S.undo.push(JSON.stringify(S.H)); S.H=JSON.parse(S.redo.pop()); S.sel=null; changed(); flash('Redone'); }

/* tiles */
function tileAt(c,r){ if(r<0||r>=ROWS||c<0||c>=S.H.W)return '.'; return S.H.rows[r].charAt(c); }
function solid(c,r){ if(r>=ROWS)return true; return tileAt(c,r)!=='.'; }
function setTile(c,r,ch){ if(r<0||r>=ROWS||c<0||c>=S.H.W)return false; var s=S.H.rows[r]; if(s.charAt(c)===ch)return false;
  S.H.rows[r]=s.slice(0,c)+ch+s.slice(c+1); return true; }
/* the first surface at or under a row: the top of a tile with air over it. null = no ground (a pit) */
function surfaceUnder(c,r){ r=Math.max(1,r); for(;r<ROWS;r++){ if(solid(c,r)&&!solid(c,r-1))return r*T; } return null; }

/* ---------- view ---------- */
function size(){ var r=cvWrap.getBoundingClientRect(); S.w=Math.max(100,r.width|0); S.h=Math.max(100,r.height|0);
  cv.width=Math.round(S.w*DPR); cv.height=Math.round(S.h*DPR); req(); }
function fitView(resetX){ size();
  if(S.w<600){ S.z=Math.max(0.3,Math.min(1.6,S.w/(11*T))); S.y0=(ROWS+1)*T-S.h/S.z; }   /* a phone: eleven tiles across, the ground at the bottom */
  else { S.z=Math.max(0.2,Math.min(1.6,S.h/(25*T))); S.y0=-T*0.5; }
  if(resetX)S.cam=0; clampView(); }
function clampView(){ var vw=S.w/S.z, vh=S.h/S.z;
  S.cam=Math.max(-T*2,Math.min(S.H.W*T-vw+T*2,S.cam)); if(S.H.W*T+T*4<vw)S.cam=(S.H.W*T-vw)/2;
  var top=-T*2, bot=ROWS*T+T*2-vh; S.y0=bot<top?(top+bot)/2:Math.max(top,Math.min(bot,S.y0)); }
function zoomAt(f,sx,sy){ var wx=S.cam+sx/S.z, wy=S.y0+sy/S.z; S.z=Math.max(0.2,Math.min(2.5,S.z*f)); S.cam=wx-sx/S.z; S.y0=wy-sy/S.z; clampView(); req(); }
function toWorld(sx,sy){ return { x:S.cam+sx/S.z, y:S.y0+sy/S.z }; }

/* ---------- drawing (only when something changed) ---------- */
var reqd=false;
function req(){ if(reqd||S.playing)return; reqd=true; requestAnimationFrame(draw); }
function draw(){ reqd=false; if(S.playing||!A.G())return;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  A.CB.plain=S.plain; A.CB.over=overlay;
  A.drawInto(ctx,S.w,S.h,S.z,S.y0,S.cam);
  ctx.setTransform(1,0,0,1,0,0); }
/* drawn by the game inside its world transform, after the play */
function overlay(c){ var i, H=S.H, c0=Math.floor(S.cam/T)-1, c1=Math.ceil((S.cam+S.w/S.z)/T)+1, lw=1/S.z;
  /* the dojo's ends */
  c.fillStyle='rgba(0,0,0,0.45)'; c.fillRect(-T*4,-T*4,T*4,ROWS*T+T*8); c.fillRect(H.W*T,-T*4,T*4,ROWS*T+T*8);
  if(S.grid){ c.strokeStyle='rgba(232,220,200,0.10)'; c.lineWidth=lw; c.beginPath();
    for(i=Math.max(0,c0);i<=Math.min(H.W,c1);i++){ c.moveTo(i*T,0); c.lineTo(i*T,ROWS*T); }
    for(i=0;i<=ROWS;i++){ c.moveTo(Math.max(0,c0)*T,i*T); c.lineTo(Math.min(H.W,c1)*T,i*T); } c.stroke();
    c.fillStyle='rgba(232,220,200,0.45)'; c.font=(11/S.z)+'px system-ui'; c.textAlign='left';
    for(i=Math.max(0,c0- c0%10);i<=Math.min(H.W,c1);i+=10){ c.fillText(String(i),i*T+3*lw,-6*lw); }
    /* one way ledges read as dashed tops so they never pass for ground */
    c.strokeStyle='rgba(158,196,106,0.9)'; c.lineWidth=2*lw; c.setLineDash([6*lw,4*lw]); c.beginPath();
    for(var r=0;r<ROWS;r++){ var row=H.rows[r]; for(i=Math.max(0,c0);i<=Math.min(H.W-1,c1);i++){ if(row.charAt(i)==='='){ c.moveTo(i*T,r*T+1); c.lineTo(i*T+T,r*T+1); } } }
    c.stroke(); c.setLineDash([]); }
  /* paths: hedgehog patrols, crow spans, wind zones */
  c.lineWidth=2*lw;
  (H.hogs||[]).forEach(function(o){ c.strokeStyle='rgba(240,194,122,0.8)'; c.beginPath(); c.moveTo(o[3],o[1]+14); c.lineTo(o[4],o[1]+14); c.stroke();
    tick(c,o[3],o[1]+14,lw); tick(c,o[4],o[1]+14,lw); });
  (H.crows||[]).forEach(function(o){ c.strokeStyle='rgba(160,196,232,0.7)'; c.setLineDash([5*lw,5*lw]); c.beginPath(); c.moveTo(o[0]-o[2],o[1]); c.lineTo(o[0]+o[2],o[1]); c.stroke(); c.setLineDash([]); });
  (H.gusts||[]).forEach(function(o){ c.fillStyle='rgba(200,225,255,0.10)'; c.fillRect(o[0],8*T,o[1]-o[0],14*T);
    c.fillStyle='rgba(220,235,255,0.8)'; c.font=(14/S.z)+'px system-ui'; c.textAlign='center'; c.fillText(o[2]>0?'wind →':'← wind',(o[0]+o[1])/2,8*T+18*lw); });
  /* posts: number them, the light turns at each */
  (H.posts||[]).forEach(function(o,q){ c.fillStyle='rgba(200,168,75,0.9)'; c.font='700 '+(13/S.z)+'px system-ui'; c.textAlign='center'; c.fillText('post '+(q+1),o[0],(o[2]||22*T)-64*lw); });
  /* start */
  if(H.spawn){ c.fillStyle='rgba(122,179,86,0.95)'; c.font='700 '+(12/S.z)+'px system-ui'; c.textAlign='center'; c.fillText('START',H.spawn[0],H.spawn[1]-30*lw); }
  /* what the pointer would touch, and what is picked */
  if(S.hover&&!S.drag){ var hb=boxOf(S.hover); if(hb){ c.strokeStyle='rgba(232,220,200,0.6)'; c.lineWidth=lw*1.5; c.strokeRect(hb[0],hb[1],hb[2],hb[3]); } }
  if(S.sel){ var sb=boxOf(S.sel); if(sb){ c.strokeStyle='#c8a84b'; c.lineWidth=lw*2.5; c.strokeRect(sb[0],sb[1],sb[2],sb[3]); } }
  if(S.cursor&&S.tool!=='select'){ var cc=Math.floor(S.cursor.x/T), cr=Math.floor(S.cursor.y/T);
    if(S.tool==='ground'||S.tool==='ledge'||S.tool==='erase'){ c.strokeStyle=S.tool==='erase'?'rgba(255,120,100,0.9)':'rgba(232,220,200,0.9)'; c.lineWidth=lw*2; c.strokeRect(cc*T,cr*T,T,T); } }
}
function tick(c,x,y,lw){ c.beginPath(); c.moveTo(x,y-6*lw); c.lineTo(x,y+6*lw); c.stroke(); }

/* ---------- things: where they are, what box picks them ---------- */
function anchor(t,o){ if(t==='crow')return { x:o[0], y:o[1] }; if(t==='gust')return { x:(o[0]+o[1])/2, y:8*T+30 };
  if(t==='post')return { x:o[0], y:(o[2]||22*T)-24 }; return { x:o[0], y:o[1] }; }
function boxOf(s){ var o=thing(s); if(!o)return null; var a=anchor(s.t,o), r=22;
  if(s.t==='gust')return [o[0],8*T,o[1]-o[0],14*T];
  if(s.t==='cell'||s.t==='post'||s.t==='diamond'||s.t==='cannon')r=26;
  return [a.x-r,a.y-r,r*2,r*2]; }
function thing(s){ if(!s)return null; if(s.t==='diamond')return S.H.diamond; if(s.t==='spawn')return S.H.spawn; var L=S.H[LIST[s.t]]; return L?L[s.i]:null; }
function pick(wx,wy){ var best=null, bd=1e9, k, t, L, i, rad=Math.max(22,14/S.z);
  function cand(t,i,o){ var a=anchor(t,o), dx=a.x-wx, dy=a.y-wy, d=dx*dx+dy*dy; if(t==='gust'){ if(wx>o[0]&&wx<o[1]&&wy>8*T&&wy<22*T)d=rad*rad*0.9; else return; }
    if(d<rad*rad&&d<bd){ bd=d; best={ t:t, i:i }; } }
  for(k in LIST){ t=k; L=S.H[LIST[k]]||[]; for(i=0;i<L.length;i++)cand(t,i,L[i]); }
  if(S.H.diamond)cand('diamond',0,S.H.diamond); if(S.H.spawn)cand('spawn',0,S.H.spawn);
  return best; }

/* put a thing at a world point; returns the thing's array (and the list index) or null with a reason */
function placeAt(t,wx,wy,o){ var c=Math.floor(wx/T), r=Math.floor(wy/T), x=c*T+T/2, sf;
  if(c<0||c>=S.H.W)return { err:'outside the dojo' };
  function half(v){ return Math.round(v/(T/2))*(T/2); }
  if(LIFT[t]!=null){ sf=surfaceUnder(c,r);
    if(sf==null){ if(t==='spike')sf=ROWS*T-6; else return { err:'needs ground under it' }; } }
  switch(t){
    case 'carrot': return { a:[half(wx),half(wy)] };
    case 'porc': return { a:[half(wx),half(wy),o?o[2]:1,o?o[3]:0] };
    case 'crow': return { a:[half(wx),half(wy),o?o[2]:3.5*T,o?o[3]:0,o?o[4]:0.7] };
    case 'gust': var w=o?(o[1]-o[0]):4*T, gx=Math.round(wx/T)*T-Math.round(w/T/2)*T; return { a:[gx,gx+w,o?o[2]:1,o?o[3]:240] };
    case 'hog': var p=patrol(c,sf/T); return { a:[x,sf-14,o?o[2]:1,p[0],p[1]] };
    case 'cell': case 'bounce': case 'spike': return { a:[x,sf-LIFT[t]] };
    case 'spit': case 'cannon': return { a:[x,sf-LIFT[t],o&&o[2]!=null?o[2]:(t==='spit'?1.6:0)] };
    case 'post': return { a:[x,sf-42,sf===22*T?0:sf,sf===22*T?0:sf-HH-8] };
    case 'diamond': return { a:[x,sf-42] };
    case 'spawn': return { a:[x,sf-LIFT.spawn] };
  } return { err:'?' }; }
/* the flat run a hedgehog can walk: the same surface row, no wall, at most seven tiles each way */
function patrol(c,r){ var lo=c, hi=c;
  while(lo-1>=0&&c-lo<7&&solid(lo-1,r)&&!solid(lo-1,r-1))lo--;
  while(hi+1<S.H.W&&hi-c<7&&solid(hi+1,r)&&!solid(hi+1,r-1))hi++;
  return [(lo+0.5)*T,(hi+0.5)*T]; }
function addThing(t,wx,wy){ var p=placeAt(t,wx,wy,null); if(p.err){ flash('A '+NAME[t]+' '+p.err); return null; }
  if(t==='diamond'){ S.H.diamond=p.a; return { t:t, i:0 }; }
  if(t==='spawn'){ S.H.spawn=p.a; return { t:t, i:0 }; }
  var L=S.H[LIST[t]]||(S.H[LIST[t]]=[]);
  /* never two of a kind on one spot */
  for(var i=0;i<L.length;i++){ if(Math.abs(L[i][0]-p.a[0])<4&&Math.abs(L[i][1]-p.a[1])<4)return null; }
  L.push(p.a); if(t==='post')sortPosts();
  return { t:t, i:t==='post'?indexOfPost(p.a):L.length-1 }; }
function sortPosts(){ S.H.posts.sort(function(a,b){ return a[0]-b[0]; }); delete S.H.segs; }
function indexOfPost(a){ return S.H.posts.indexOf(a); }
function moveThing(s,wx,wy){ var o=thing(s); if(!o)return;
  var p=placeAt(s.t,wx,wy,o); if(p.err)return;
  if(s.t==='diamond'){ S.H.diamond=p.a; return; } if(s.t==='spawn'){ S.H.spawn=p.a; return; }
  var L=S.H[LIST[s.t]]; L[s.i]=p.a; if(s.t==='post'){ sortPosts(); s.i=indexOfPost(p.a); } }
function delThing(s){ if(!s)return; if(s.t==='diamond'||s.t==='spawn'){ flash('The '+NAME[s.t]+' can be moved, not removed'); return; }
  var L=S.H[LIST[s.t]]; if(!L||!L[s.i])return; snap(); L.splice(s.i,1); if(s.t==='post')delete S.H.segs; S.sel=null; changed(); }
function eraseAt(wx,wy){ var c=Math.floor(wx/T), r=Math.floor(wy/T), any=setTile(c,r,'.');
  var p=pick(wx,wy); if(p&&p.t!=='diamond'&&p.t!=='spawn'){ var L=S.H[LIST[p.t]]; L.splice(p.i,1); if(p.t==='post')delete S.H.segs; any=true; }
  return any; }

/* ---------- pointer ---------- */
var ptrs={}, gesture=null, spaceDown=false;
function dist(a,b){ var dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }
function local(e){ var r=cv.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; }
cv.addEventListener('contextmenu',function(e){ e.preventDefault(); });
cv.addEventListener('pointerdown',function(e){ cv.setPointerCapture(e.pointerId); var p=local(e); ptrs[e.pointerId]=p;
  var n=Object.keys(ptrs).length;
  if(n===2){ /* a second finger: cancel the stroke the first one began, then move and zoom */
    if(S.drag&&S.drag.snapAt!=null){ S.H=JSON.parse(S.undo[S.drag.snapAt]); S.undo.length=S.drag.snapAt; changed(); }
    S.drag=null; var ks=Object.keys(ptrs), a=ptrs[ks[0]], b=ptrs[ks[1]];
    gesture={ d:dist(a,b)||1, mx:(a.x+b.x)/2, my:(a.y+b.y)/2 }; return; }
  if(n>2)return;
  if(e.button===2||e.button===1||spaceDown){ S.drag={ pan:true, sx:p.x, sy:p.y, cam:S.cam, y0:S.y0 }; return; }
  var w=toWorld(p.x,p.y); S.cursor=w; begin(w,p); });
cv.addEventListener('pointermove',function(e){ var p=local(e); if(ptrs[e.pointerId])ptrs[e.pointerId]=p;
  var w=toWorld(p.x,p.y); S.cursor=w;
  $('rre-pos').textContent='column '+Math.floor(w.x/T)+', row '+Math.floor(w.y/T);
  if(gesture&&Object.keys(ptrs).length===2){ var ks=Object.keys(ptrs), a=ptrs[ks[0]], b=ptrs[ks[1]], d=dist(a,b)||1, mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    S.cam-=(mx-gesture.mx)/S.z; S.y0-=(my-gesture.my)/S.z; zoomAt(d/gesture.d,mx,my); gesture.d=d; gesture.mx=mx; gesture.my=my; return; }
  if(S.drag)move(w,p); else { var h=S.tool==='select'||S.tool==='erase'?pick(w.x,w.y):null; if((h&&!S.hover)||(!h&&S.hover)||(h&&S.hover&&(h.t!==S.hover.t||h.i!==S.hover.i))){ S.hover=h; } req(); } });
function up(e){ delete ptrs[e.pointerId]; if(Object.keys(ptrs).length<2)gesture=null; if(S.drag&&!Object.keys(ptrs).length){ end(); } }
cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
cv.addEventListener('pointerleave',function(){ S.cursor=null; S.hover=null; req(); });
cv.addEventListener('wheel',function(e){ e.preventDefault(); var p=local(e);
  if(e.ctrlKey||e.metaKey){ zoomAt(Math.exp(-e.deltaY*0.0025),p.x,p.y); return; }
  var dx=e.deltaX, dy=e.deltaY; if(e.shiftKey&&!dx){ dx=dy; dy=0; }
  if(Math.abs(dx)<Math.abs(dy)&&S.h/S.z>=ROWS*T){ dx=dy; dy=0; }   /* the whole height fits: a plain scroll walks the dojo */
  S.cam+=dx/S.z; S.y0+=dy/S.z; clampView(); req(); },{ passive:false });

function begin(w,p){ var t=S.tool;
  if(t==='select'){ var h=pick(w.x,w.y); S.sel=h; sideSoon();
    if(h){ S.drag={ move:h, snapAt:S.undo.length, moved:false }; snap(); }
    else S.drag={ pan:true, sx:p.x, sy:p.y, cam:S.cam, y0:S.y0 };
    req(); return; }
  snap(); S.drag={ tool:t, snapAt:S.undo.length-1, any:false, last:null };
  apply(w); }
function apply(w){ var d=S.drag, t=d.tool, c=Math.floor(w.x/T), r=Math.floor(w.y/T), key=c+','+r, did=false;
  if(t==='ground'||t==='ledge'){ if(key===d.last)return; d.last=key; did=setTile(c,r,t==='ground'?'#':'='); }
  else if(t==='erase'){ if(key===d.last)return; d.last=key; did=eraseAt(w.x,w.y); }
  else if(t==='carrot'){ var hx=Math.round(w.x/(T/2)), hy=Math.round(w.y/(T/2)), k2=hx+','+hy; if(k2===d.last)return; d.last=k2; did=!!addThing('carrot',w.x,w.y); }
  else { if(d.last)return; d.last='one'; var s=addThing(t,w.x,w.y); if(s){ S.sel=s; did=true; } }
  if(did){ d.any=true; changed(); } }
function move(w,p){ var d=S.drag;
  if(d.pan){ S.cam=d.cam-(p.x-d.sx)/S.z; S.y0=d.y0-(p.y-d.sy)/S.z; clampView(); req(); return; }
  if(d.move){ moveThing(d.move,w.x,w.y); d.moved=true; S.sel=d.move; S.H.li=S.li; relevel(); return; }
  if(d.tool)apply(w); }
function end(){ var d=S.drag; S.drag=null;
  if(d&&d.move){ if(d.moved){ saveLocal(); sideSoon(); } else S.undo.pop(); }
  if(d&&d.tool&&!d.any)S.undo.pop();
  req(); }

/* ---------- keys ---------- */
window.addEventListener('keydown',function(e){
  if(S.playing){ if(e.key==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); stopPlay(); } return; }
  if(/^(INPUT|SELECT|TEXTAREA)$/.test((e.target&&e.target.tagName)||''))return;
  e.stopPropagation();   /* while editing, the game under the editor never hears a key (Esc would open its pause) */
  var k=e.key.toLowerCase(), mod=e.ctrlKey||e.metaKey;
  if(k===' '){ spaceDown=true; e.preventDefault(); return; }
  if(mod&&k==='z'){ e.preventDefault(); if(e.shiftKey)redo(); else undo(); return; }
  if(mod&&k==='y'){ e.preventDefault(); redo(); return; }
  if(mod&&k==='s'){ e.preventDefault(); saveLocal(); flash('Saved on this device'); return; }
  if(mod)return;
  for(var i=0;i<TOOLS.length;i++){ if(TOOLS[i].key===k){ setTool(TOOLS[i].k); e.preventDefault(); return; } }
  if(k==='z'){ undo(); return; } if(k==='y'){ redo(); return; }
  if(k==='delete'||k==='backspace'){ e.preventDefault(); delThing(S.sel); return; }
  if(k==='p'){ e.preventDefault(); play(e.shiftKey); return; }
  if(k==='g'){ S.grid=!S.grid; btns(); req(); return; }
  if(k==='b'){ S.plain=!S.plain; btns(); req(); return; }
  if(k==='h'||k==='?'){ $('rre-help').classList.toggle('on'); return; }
  if(k==='escape'){ S.sel=null; $('rre-help').classList.remove('on'); sideSoon(); req(); return; }
  if(k==='+'||k==='='){ zoomAt(1.25,S.w/2,S.h/2); return; } if(k==='-'||k==='_'){ zoomAt(0.8,S.w/2,S.h/2); return; }
  var step=(e.shiftKey?12:4)*T;
  if(k==='arrowleft'){ S.cam-=step; } else if(k==='arrowright'){ S.cam+=step; } else if(k==='arrowup'){ S.y0-=T*2; } else if(k==='arrowdown'){ S.y0+=T*2; } else if(k==='home'){ S.cam=0; } else if(k==='end'){ S.cam=S.H.W*T; } else return;
  e.preventDefault(); clampView(); req(); }, true);
window.addEventListener('keyup',function(e){ if(e.key===' ')spaceDown=false; if(!S.playing)e.stopPropagation(); }, true);

/* ---------- play ---------- */
function editing(on){ document.body.classList.toggle('rre-editing',on); }
function play(fromStart){ var x=null, y=null;
  /* the ground where you are looking (the lowest surface, not a ledge overhead); a pit there tries the next columns */
  if(!fromStart){ var c0=Math.max(1,Math.floor((S.cam+S.w/S.z*0.3)/T));
    for(var dc=0;dc<12&&x==null;dc++){ var c=c0+dc; if(c>=S.H.W-1)break;
      for(var r=ROWS-1;r>0;r--){ if(solid(c,r)&&!solid(c,r-1)){ x=c*T+T/2; y=r*T-HH-8; break; } if(!solid(c,r)&&r>=ROWS-2)break; } } }
  S.playing=true; S.sel=null; root.classList.add('off'); back.style.display='block'; editing(false);
  S.playStart=!!fromStart||x==null; S.playRev=S.rev;
  A.CB.clear=function(){ var full=S.playStart&&S.playRev===S.rev; if(full)S.clearedRev=S.rev; stopPlay();
    flash(full?'Cleared from the start':'Cleared (from the middle)'); };
  A.play(JSON.parse(JSON.stringify(S.H)),x,y); }
function stopPlay(){ if(!S.playing)return; var g=A.G(), bx=g?g.bx:null; A.stop(); S.playing=false;
  root.classList.remove('off'); back.style.display='none'; editing(true);
  A.edit(S.li,S.H); if(bx!=null){ S.cam=bx-S.w/S.z*0.3; clampView(); }
  size(); relevel(); }
back.addEventListener('click',stopPlay);

/* ---------- side panel ---------- */
var sideT=0; function sideSoon(){ clearTimeout(sideT); sideT=setTimeout(side,120); }
function side(){ var H=S.H, el=$('rre-side'), li=S.li, w=A.worldOf(li), job=A.jobOf(li), h='';
  function n(k){ return (H[k]||[]).length; }
  h+='<h3>Dojo '+(li+1)+'</h3><div>'+w.name+' '+(li%6+1)+' · '+H.W+' tiles long</div>';
  h+='<div class="row"><button data-act="w-10">−10 tiles</button><button data-act="w+10">+10 tiles</button></div>';
  h+='<h3>Its job</h3><div>'+A.jobText(li)+'</div>';
  h+='<h3>In it</h3><div>'+n('cells')+' cages · '+n('carrots')+' carrots · '+n('hogs')+' hedgehogs · '+n('spits')+' toads · '+n('crows')+' crows · '+n('porcs')+' vine rings · '+n('bounces')+' pads · '+n('cannons')+' cannons · '+n('posts')+' rest posts</div>';
  var warns=checks(job);
  h+='<h3>Checks</h3>'+(warns.length?warns.map(function(x,i){ return '<div class="warn" data-go="'+i+'">⚠ '+x.t+'</div>'; }).join(''):'<div class="ok">Nothing looks wrong.</div>');
  h+='<div class="muted" style="margin-top:4px">These are quick checks, not a playthrough. Press Play to be sure.</div>';
  if(S.sel){ var o=thing(S.sel); h+='<h3>Picked: '+NAME[S.sel.t]+'</h3>';
    if(S.sel.t==='hog')h+='<div class="row"><button data-act="flip">Face the other way</button></div><div class="row">Walks <button data-act="pl-">◀−</button><button data-act="pl+">◀+</button><button data-act="pr-">−▶</button><button data-act="pr+">+▶</button></div>';
    if(S.sel.t==='crow')h+='<div class="row">Range <button data-act="cs-">narrower</button><button data-act="cs+">wider</button></div><div class="row">Speed <button data-act="cv-">slower</button><button data-act="cv+">faster</button></div>';
    if(S.sel.t==='porc')h+='<div class="row"><button data-act="flip">Spin the other way</button></div>';
    if(S.sel.t==='gust')h+='<div class="row"><button data-act="flip">Blow the other way</button></div><div class="row">Width <button data-act="gw-">−1</button><button data-act="gw+">+1</button></div>';
    if(S.sel.t==='post')h+='<div class="muted">Landmark: '+A.landmarkOf(li,S.sel.i).name+'</div>';
    if(S.sel.t!=='diamond'&&S.sel.t!=='spawn')h+='<div class="row"><button data-act="del">Remove it (Delete)</button></div>'; }
  h+='<h3>Cloud</h3>';
  if(!S.key) h+='<div class="muted">Your editor key saves your dojos to the cloud, so they follow you to the phone and survive a cleared browser.</div><div class="row"><input id="rre-key" type="password" autocomplete="off" placeholder="editor key" style="flex:1;min-width:0;min-height:40px;border-radius:8px;border:1px solid #39432f;background:#1c2218;color:#e8dcc8;padding:0 8px"><button data-act="connect">Connect</button></div>';
  h+='<div id="rre-cloudst" class="muted">'+(S.cloud.st||(S.key?'cloud: connected':''))+'</div>';
  h+='<h3>This dojo</h3><div class="row"><button data-act="reset">Start over from the game\'s version</button></div>';
  h+='<div class="row"><button data-act="dl">Download a copy</button><button data-act="ul">Open a copy</button></div>';
  el.innerHTML=h; el._warns=warns; }
$('rre-side').addEventListener('keydown',function(e){ if(e.target&&e.target.id==='rre-key'&&e.key==='Enter'){ e.preventDefault(); connect(e.target.value); } });
$('rre-side').addEventListener('click',function(e){ var b=e.target.closest('[data-act],[data-go]'); if(!b)return;
  if(b.hasAttribute('data-go')){ var wv=this._warns[+b.getAttribute('data-go')]; if(wv&&wv.x!=null){ S.cam=wv.x-S.w/S.z/2; clampView(); if(wv.s)S.sel=wv.s; req(); } return; }
  act(b.getAttribute('data-act')); });
function act(a){ var o=thing(S.sel), H=S.H;
  if(a==='connect'){ var ki=$('rre-key'); connect(ki?ki.value:''); return; }
  if(a==='reset'){ if(!confirm('Throw away your version of this dojo and start from the game\'s?'))return; snap(); try{ localStorage.removeItem(LSK+S.li); }catch(e){} S.H=blankFrom(A.gen(S.li)); S.sel=null; changed(); flash('Back to the game\'s version (Undo brings yours back)'); return; }
  if(a==='dl'){ var blob=new Blob([JSON.stringify(H)],{type:'application/json'}), u=URL.createObjectURL(blob), l=document.createElement('a'); l.href=u; l.download='rabbit-ronin-dojo-'+(S.li+1)+'.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function(){ URL.revokeObjectURL(u); },2000); return; }
  if(a==='ul'){ var f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.onchange=function(){ var r=new FileReader(); r.onload=function(){ try{ var h=JSON.parse(r.result); if(!h||h.v!==1||!h.rows)throw 0; snap(); S.H=h; S.sel=null; changed(); fitView(true); flash('Opened'); }catch(e){ flash('That file is not a dojo'); } }; r.readAsText(f.files[0]); }; f.click(); return; }
  snap();
  if(a==='w+10'||a==='w-10'){ var d=a==='w+10'?10:-10, nw=Math.max(30,H.W+d);
    for(var r=0;r<ROWS;r++){ var s=H.rows[r]; H.rows[r]=nw>H.W?s+Array(nw-H.W+1).join(r>=22?'#':'.'):s.slice(0,nw); } H.W=nw; delete H.segs; }
  else if(a==='del'){ S.undo.pop(); delThing(S.sel); return; }
  else if(o&&a==='flip'){ if(S.sel.t==='hog'||S.sel.t==='porc'||S.sel.t==='gust')o[2]=-(o[2]||1); }
  else if(o&&a==='pl-')o[3]=Math.min(o[0]-T/2,o[3]+T); else if(o&&a==='pl+')o[3]=Math.max(T/2,o[3]-T);
  else if(o&&a==='pr-')o[4]=Math.max(o[0]+T/2,o[4]-T); else if(o&&a==='pr+')o[4]=Math.min(H.W*T-T/2,o[4]+T);
  else if(o&&a==='cs-')o[2]=Math.max(T,o[2]-T/2); else if(o&&a==='cs+')o[2]=Math.min(10*T,o[2]+T/2);
  else if(o&&a==='cv-')o[4]=Math.max(0.3,Math.round((o[4]-0.1)*10)/10); else if(o&&a==='cv+')o[4]=Math.min(1.6,Math.round((o[4]+0.1)*10)/10);
  else if(o&&a==='gw-'){ if(o[1]-o[0]>2*T)o[1]-=T; } else if(o&&a==='gw+')o[1]+=T;
  else { S.undo.pop(); return; }
  changed(); }
/* quick checks: what would make the dojo unplayable or its job impossible */
function checks(job){ var H=S.H, out=[], i;
  if(!H.spawn)out.push({ t:'No start' }); if(!H.diamond)out.push({ t:'No diamond' });
  if(H.spawn&&H.diamond&&H.diamond[0]<=H.spawn[0])out.push({ t:'The diamond is behind the start', x:H.diamond[0] });
  var all=(H.cells||[]).length;
  if((job.k==='mice'||job.k==='safe')&&!all)out.push({ t:'The job is to free every mouse, but there are no cages' });
  if(job.k==='hogs'&&(H.hogs||[]).length<job.n)out.push({ t:'The job is to cut '+job.n+' hedgehogs, but there are '+(H.hogs||[]).length });
  if(job.k==='swing'&&(H.porcs||[]).length<job.n+1)out.push({ t:'The job is '+job.n+' swings in a row; put at least '+(job.n+1)+' vine rings close together' });
  /* grounded things standing on air */
  var G2=['cells','hogs','spits','bounces','cannons'];
  G2.forEach(function(k){ (H[k]||[]).forEach(function(o,q){ var c=Math.floor(o[0]/T), lift={cells:26,hogs:14,spits:15,bounces:7,cannons:24}[k], ry=(o[1]+lift)/T;
    if(Math.abs(ry-Math.round(ry))>0.05||!solid(c,Math.round(ry))||solid(c,Math.round(ry)-1)){
      var t2={cells:'cell',hogs:'hog',spits:'spit',bounces:'bounce',cannons:'cannon'}[k];
      out.push({ t:'A '+NAME[t2]+' at column '+c+' is not on ground', x:o[0], s:{ t:t2, i:q } }); } }); });
  /* the start and the diamond inside solid ground */
  if(H.spawn&&solid(Math.floor(H.spawn[0]/T),Math.floor(H.spawn[1]/T)))out.push({ t:'The start is inside the ground', x:H.spawn[0] });
  if(H.diamond&&solid(Math.floor(H.diamond[0]/T),Math.floor(H.diamond[1]/T)))out.push({ t:'The diamond is inside the ground', x:H.diamond[0] });
  return out; }

/* ---------- the cloud: your drafts follow you between devices and survive a cleared browser ---------- */
function api(body){ body.key=S.key;
  return fetch(A.URL,{ method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) })
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok)throw new Error(j.error||('error '+r.status)); return j; }); }); }
var cloudT=0, cloudPend=false;
function cloudSt(t){ S.cloud.st=t; var el=document.getElementById('rre-cloudst'); if(el)el.textContent=t; }
function cloudSaveSoon(){ if(!S.key)return; cloudPend=true; clearTimeout(cloudT); cloudSt('cloud: waiting to save'); cloudT=setTimeout(cloudFlush,3000); }
function cloudFlush(){ clearTimeout(cloudT); if(!cloudPend||!S.key||!S.H)return; cloudPend=false; var li=S.li, h=JSON.parse(JSON.stringify(S.H));
  cloudSt('cloud: saving…');
  api({ op:'save', li:li, level:h }).then(function(){ S.cloud.draftAt=Date.now(); S.cloud.list[li]=S.cloud.list[li]||{}; S.cloud.list[li].draftAt=Date.now(); cloudSt('cloud: saved '+clock()); dojoMarks(); })
    .catch(function(e){ cloudPend=true; cloudSt('cloud: not saved ('+e.message+'), will try again'); }); }
function clock(){ var d=new Date(); return d.getHours()+':'+('0'+d.getMinutes()).slice(-2); }
function connect(k){ S.key=(k||'').trim().toLowerCase(); cloudSt('cloud: checking the key…');
  api({ op:'list' }).then(function(j){ try{ localStorage.setItem('rr_edit_key',S.key); }catch(e){} S.cloud.list=j.dojos||{}; dojoMarks(); cloudSt('cloud: connected'); flash('Connected: your dojos save to the cloud too');
    /* what you made on this device before connecting goes up now (only the dojos you changed) */
    var n=0; for(var q=0;q<A.LEVELS;q++){ var h=loadLocal(q); if(h){ n++; (function(q,h){ api({ op:'save', li:q, level:h }).then(function(){ S.cloud.list[q]=S.cloud.list[q]||{}; S.cloud.list[q].draftAt=Date.now(); dojoMarks(); }).catch(function(e){ cloudSt('cloud: dojo '+(q+1)+' not saved ('+e.message+')'); }); })(q,h); } }
    if(n)cloudSt('cloud: connected, sending '+n+' dojo'+(n>1?'s':'')+' you changed here');
    side(); })
    .catch(function(e){ S.key=''; cloudSt(e.message); side(); }); }
/* the dojo list marks the dojos you have changed (✎) */
function dojoMarks(){ var o=$('rre-dojo').options; for(var i=0;i<o.length;i++){ var w=A.worldOf(i), c=S.cloud.list[i]||{}, loc=false; try{ loc=!!localStorage.getItem(LSK+i); }catch(e){}
  o[i].textContent='Dojo '+(i+1)+' · '+w.name+' '+(i%6+1)+((c.draftAt||loc)?'  ✎':''); } }

/* ---------- top bar ---------- */
function setTool(k){ S.tool=k; S.hover=null; btns(); $('rre-tip').textContent=TOOL_BY[k].tip; cv.style.cursor=k==='select'?'grab':'crosshair'; req(); }
function btns(){ var bs=toolsEl.querySelectorAll('button'); for(var i=0;i<bs.length;i++)bs[i].classList.toggle('on',bs[i].getAttribute('data-tool')===S.tool);
  $('rre-grid').classList.toggle('on',S.grid); $('rre-plain').classList.toggle('on',!S.plain); }
$('rre-prev').addEventListener('click',function(){ if(S.li>0)openDojo(S.li-1); });
$('rre-next').addEventListener('click',function(){ if(S.li<A.LEVELS-1)openDojo(S.li+1); });
$('rre-undo').addEventListener('click',undo); $('rre-redo').addEventListener('click',redo);
$('rre-zo').addEventListener('click',function(){ zoomAt(0.8,S.w/2,S.h/2); }); $('rre-zi').addEventListener('click',function(){ zoomAt(1.25,S.w/2,S.h/2); });
$('rre-grid').addEventListener('click',function(){ S.grid=!S.grid; btns(); req(); });
$('rre-plain').addEventListener('click',function(){ S.plain=!S.plain; btns(); req(); });
$('rre-play').addEventListener('click',function(e){ play(e.shiftKey); });
$('rre-helpb').addEventListener('click',function(){ $('rre-help').classList.toggle('on'); });
$('rre-info').addEventListener('click',function(){ $('rre-side').classList.toggle('sheet'); });

var flashT=0; function flash(t){ var m=$('rre-msg'); m.textContent=t; m.classList.add('on'); clearTimeout(flashT); flashT=setTimeout(function(){ m.classList.remove('on'); },1800); }
window.addEventListener('resize',function(){ if(!S.playing){ size(); clampView(); } });

/* ---------- boot: wait for the art, then open the dojo in the address (?dojo=N) or dojo 1 ---------- */
function boot(){ if(!A.ART.ok){ setTimeout(boot,120); return; }
  var m=/[?&]dojo=(\d+)/.exec(location.search), li=m?Math.max(0,Math.min(A.LEVELS-1,(+m[1])-1)):0;
  editing(true); setTool('select'); openDojo(li); dojoMarks();
  if(S.key)api({ op:'list' }).then(function(j){ S.cloud.list=j.dojos||{}; dojoMarks(); cloudSt('cloud: connected'); }).catch(function(e){ cloudSt('cloud: '+e.message); });
  window.addEventListener('pagehide',cloudFlush); document.addEventListener('visibilitychange',function(){ if(document.hidden)cloudFlush(); });
  /* the painted scenery arrives after the first draw; draw again while it lands (the editor otherwise draws only on a change) */
  var k=0, iv=setInterval(function(){ req(); if(++k>=10)clearInterval(iv); },600); }
window.__RRED={ S:S, open:openDojo, play:play, stop:stopPlay, tool:setTool, act:act, req:req, toWorld:toWorld, checks:function(){ return checks(A.jobOf(S.li)); } };   /* test handle */
boot();
})();
