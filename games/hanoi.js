// ═══ LUCID WINDS — Tower of Hanoi (Root Stack) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,_setDiff=G.setDiff,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// ── State (single-game module) ─────────────────────────────────────────────
var pegs=[[],[],[],[]];
var pegCount=3;
var discs=5;
var moves=0;
var optimal=0;
var history=[];           // {from,to,disk} per executed move for undo
var selectedPeg=-1;
var startTs=0;
var solvedTs=0;
var won=false;
var timerId=null;
var pan=null;

// Frame-Stewart optimal count for 4 pegs (n disks)
function fsCount(n){
  if(n<=1)return n;
  if(n===2)return 3;
  var best=Infinity;
  for(var k=1;k<n;k++){
    var c=2*fsCount(n-k)+Math.pow(2,k)-1;
    if(c<best)best=c;
  }
  return best;
}
function optimalCount(n,p){return p===4?fsCount(n):(Math.pow(2,n)-1);}

// ── Styles (injected once) ─────────────────────────────────────────────────
(function injectHanoiStyle(){
  if(document.getElementById('h-anim-style'))return;
  var s=document.createElement('style');s.id='h-anim-style';
  s.textContent=[
    '@keyframes hPanIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes hDiskLand{0%{transform:translateY(-10px);opacity:0.5}60%{transform:translateY(2px)}100%{transform:translateY(0);opacity:1}}',
    '@keyframes hDustPop{0%{transform:scale(0);opacity:0.8}100%{transform:scale(2.4);opacity:0}}',
    '@keyframes hStarFly{0%{transform:scale(0.2) rotate(-20deg);opacity:0}55%{transform:scale(1.25) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}',
    '@keyframes hLineIn{0%{transform:translateY(10px);opacity:0}100%{transform:translateY(0);opacity:1}}',
    '@keyframes hGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(200,168,75,0.3))}50%{filter:drop-shadow(0 0 14px rgba(200,168,75,0.6))}}',
    '#Hpan{max-width:min(96vw,520px);margin:0 auto;padding:10px 12px 14px;user-select:none;-webkit-user-select:none;touch-action:none;box-sizing:border-box;position:relative;animation:hPanIn .4s ease}',
    '#Hpan::before{content:"";position:absolute;inset:0;border-radius:14px;background:radial-gradient(ellipse at 50% 8%,rgba(122,179,86,0.08) 0%,transparent 60%),linear-gradient(180deg,rgba(13,16,12,0.0) 0%,rgba(28,36,24,0.35) 70%,rgba(42,30,20,0.55) 100%);pointer-events:none;z-index:0}',
    '.hpegs{display:flex;justify-content:space-around;align-items:flex-end;gap:clamp(4px,1.5vw,10px);padding:10px 8px 0;position:relative;z-index:1}',
    '.hpeg{flex:1;min-width:0;display:flex;flex-direction:column-reverse;align-items:center;cursor:pointer;position:relative;padding-bottom:2px;-webkit-tap-highlight-color:transparent;min-height:clamp(210px,55vw,280px)}',
    '.hpeg.sel .hrod{background:linear-gradient(180deg,#8a6a42 0%,#6b4520 55%,#3a2410 100%);box-shadow:0 0 14px rgba(200,168,75,0.35);}',
    '.hpeg.sel::after{content:"";position:absolute;inset:-4px 0 20px 0;background:radial-gradient(ellipse at 50% 30%,rgba(200,168,75,0.12) 0%,transparent 70%);border-radius:12px;pointer-events:none;z-index:-1}',
    '.hrod{width:6px;flex-grow:1;min-height:20px;background:linear-gradient(180deg,#6b4520 0%,#4a2d14 55%,#2a1810 100%);border-radius:3px;box-shadow:inset 1px 0 0 rgba(255,220,160,0.12),inset -1px 0 0 rgba(0,0,0,0.25);position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:0}',
    '.hbase{position:absolute;bottom:0;left:0;right:0;height:22px;background:radial-gradient(ellipse at 50% 40%,rgba(120,80,40,0.75) 0%,rgba(42,24,12,0.9) 70%);border-radius:0 0 10px 10px;box-shadow:inset 0 2px 4px rgba(255,200,140,0.12),0 2px 10px rgba(0,0,0,0.4);z-index:0}',
    '.hbase::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(120,80,40,0.35) 0%,transparent 70%);border-radius:inherit}',
    '.hdk{width:var(--dw,60px);height:clamp(14px,3.6vw,22px);border-radius:8px;margin-bottom:2px;position:relative;z-index:2;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),inset 0 -1px 0 rgba(0,0,0,0.2),0 3px 7px rgba(0,0,0,0.35);transition:transform .2s cubic-bezier(.18,1.1,.3,1),box-shadow .2s ease;animation:hDiskLand .3s cubic-bezier(.18,1.1,.3,1)}',
    '.hdk::before{content:"";position:absolute;inset:1px 1px 1px 1px;border-radius:7px;background:inherit;filter:brightness(1.12);opacity:.35;pointer-events:none}',
    '.hpeg.sel .hdk:last-child{transform:translateY(-6px) scale(1.02);box-shadow:inset 0 1px 0 rgba(255,255,255,0.18),0 0 14px rgba(200,168,75,0.45),0 6px 12px rgba(0,0,0,0.45)}',
    '.hpeg.drop-ok::before{content:"";position:absolute;inset:0 0 22px 0;background:linear-gradient(180deg,rgba(122,179,86,0.16) 0%,transparent 70%);border-radius:12px 12px 0 0;pointer-events:none;z-index:-1}',
    '.hpeg.drop-bad::before{content:"";position:absolute;inset:0 0 22px 0;background:linear-gradient(180deg,rgba(220,90,80,0.16) 0%,transparent 70%);border-radius:12px 12px 0 0;pointer-events:none;z-index:-1}',
    '.hctrl{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 4px 2px;flex-wrap:wrap;position:relative;z-index:1}',
    '.hinfo{display:flex;gap:10px;align-items:center;font-family:Georgia,serif;font-size:0.7rem;color:rgba(232,220,200,0.8);flex-wrap:wrap}',
    '.hinfo strong{color:#c8a84b;font-weight:700}',
    '.hbtn-row{display:flex;gap:6px}',
    '.hb{min-height:34px;padding:5px 12px;font-size:.68rem;font-family:Georgia,serif;font-weight:700;border-radius:6px;cursor:pointer;background:rgba(26,31,23,0.7);border:1.5px solid rgba(122,179,86,0.4);color:#e8dcc8;transition:all .15s}',
    '.hb:active{background:rgba(122,179,86,0.2);transform:scale(.96)}',
    '.hb.gold{border-color:#c8a84b;color:#c8a84b;background:linear-gradient(180deg,rgba(200,168,75,0.18),rgba(160,130,50,0.22))}',
    '.hb[disabled]{opacity:.35;pointer-events:none}'
  ].join('');
  document.head.appendChild(s);
})();

// ── Disk rendering ─────────────────────────────────────────────────────────
// Botanical palette — small disks = soft sage, large disks = deep earth
function diskStyle(idx,total){
  // idx 0 = smallest. Map to a gradient from sage → gold → amber → terracotta → earth
  var ramp=['#7ab356','#a0c070','#c8a84b','#c78a3a','#b56732','#9a4a28','#6f3c20','#4a2a18'];
  var col=ramp[Math.min(idx,ramp.length-1)];
  // Width scales from small (28px) to large (scales with total)
  var baseMin=32, baseMax=Math.min(84,28+total*10);
  var w=total<=1?baseMax:baseMin+(idx/(total-1))*(baseMax-baseMin);
  return {w:Math.round(w), col:col};
}

// ── Drag-and-drop state ────────────────────────────────────────────────────
var dragActive=false;
var dragFromPeg=-1;
var dragStartX=0,dragStartY=0;
var dragMoved=false;

function pegUnder(cx,cy){
  var el=document.elementFromPoint(cx,cy);
  while(el&&el!==pan){
    if(el.classList&&el.classList.contains('hpeg')){
      var a=el.getAttribute('data-p');
      if(a!==null)return parseInt(a,10);
    }
    el=el.parentElement;
  }
  return -1;
}

function highlightDrop(pegIdx){
  var all=pan.querySelectorAll('.hpeg');
  for(var i=0;i<all.length;i++){all[i].classList.remove('drop-ok','drop-bad');}
  if(pegIdx<0||dragFromPeg<0||pegIdx===dragFromPeg)return;
  var src=pegs[dragFromPeg];if(!src.length)return;
  var top=src[src.length-1];
  var dst=pegs[pegIdx];
  var canLand=!dst.length||dst[dst.length-1]>top;
  all[pegIdx].classList.add(canLand?'drop-ok':'drop-bad');
}

// ── Move execution ─────────────────────────────────────────────────────────
function canMove(from,to){
  if(from<0||to<0||from===to)return false;
  if(!pegs[from].length)return false;
  if(!pegs[to].length)return true;
  return pegs[to][pegs[to].length-1]>pegs[from][pegs[from].length-1];
}

function doMove(from,to){
  if(!canMove(from,to))return false;
  var d=pegs[from].pop();
  pegs[to].push(d);
  history.push({from:from,to:to,disk:d});
  moves++;
  _play('snap');
  updateStatus();
  checkWin();
  return true;
}

function undoMove(){
  if(!history.length||won)return;
  var m=history.pop();
  // Reverse: move disk from m.to back to m.from
  pegs[m.to].pop();
  pegs[m.from].push(m.disk);
  moves=Math.max(0,moves-1);
  _play('tap');
  selectedPeg=-1;
  updateStatus();
  render();
}

function checkWin(){
  // Win: all disks stacked on final peg (last index)
  var goal=pegCount-1;
  if(pegs[goal].length===discs){
    won=true;solvedTs=Date.now();
    if(timerId){clearInterval(timerId);timerId=null;}
    _e('game_win');if(_playWin)_playWin();_sr('hanoi',{w:true,s:moves});
    setTimeout(hanoiVictory,250);
  }
}

// ── Rendering ──────────────────────────────────────────────────────────────
function updateStatus(){
  var mi=document.getElementById('Hmoves');if(mi)mi.textContent=moves;
  var oi=document.getElementById('Hopt');if(oi)oi.textContent=optimal;
  var ub=document.getElementById('Hundo');if(ub)ub.disabled=!history.length||won;
}

function fmtTime(secs){
  var mm=Math.floor(secs/60),ss=secs%60;
  return mm+':'+(ss<10?'0':'')+ss;
}

function tickTimer(){
  if(won||!startTs)return;
  var secs=Math.max(0,Math.round((Date.now()-startTs)/1000));
  var t=document.getElementById('Htime');if(t)t.textContent=fmtTime(secs);
}

function render(){
  if(!pan)return;
  var pegsRow='<div class="hpegs">';
  for(var p=0;p<pegCount;p++){
    var isSel=(p===selectedPeg);
    pegsRow+='<div class="hpeg'+(isSel?' sel':'')+'" data-p="'+p+'">';
    pegsRow+='<div class="hrod"></div>';
    // Disks from bottom up (DOM order: bottom first since column-reverse)
    for(var di=0;di<pegs[p].length;di++){
      var d=pegs[p][di];
      var st=diskStyle(d,discs);
      var grad='linear-gradient(180deg,'+st.col+' 0%,rgba(0,0,0,0.25) 100%)';
      pegsRow+='<div class="hdk" data-d="'+d+'" style="--dw:'+st.w+'px;width:'+st.w+'px;background:'+grad+';"></div>';
    }
    pegsRow+='</div>';
  }
  pegsRow+='<div class="hbase"></div></div>';
  // Controls
  var ctrl='<div class="hctrl">'+
    '<div class="hinfo">'+
      '<span>Moves: <strong id="Hmoves">'+moves+'</strong>/<span style="color:rgba(232,220,200,0.5);">'+optimal+'</span></span>'+
      '<span>⏱ <strong id="Htime">0:00</strong></span>'+
    '</div>'+
    '<div class="hbtn-row">'+
      '<button class="hb" id="Hundo" onclick="_HU()" '+((!history.length||won)?'disabled':'')+'>↶ Undo</button>'+
      '<button class="hb gold" onclick="_HN()">↻ New</button>'+
    '</div>'+
  '</div>';
  pan.innerHTML=pegsRow+ctrl;
  // Rebind handlers on fresh DOM
  bindPegs();
}

// ── Interaction: tap OR drag ───────────────────────────────────────────────
function bindPegs(){
  var nodes=pan.querySelectorAll('.hpeg');
  for(var i=0;i<nodes.length;i++){
    (function(el,idx){
      el.onclick=function(){
        if(won||dragMoved){dragMoved=false;return;}
        handleTap(idx);
      };
    })(nodes[i],i);
  }
}

function handleTap(pegIdx){
  if(selectedPeg<0){
    if(pegs[pegIdx].length){selectedPeg=pegIdx;render();}
  } else if(selectedPeg===pegIdx){
    selectedPeg=-1;render();
  } else {
    if(doMove(selectedPeg,pegIdx)){
      selectedPeg=-1;render();
    } else {
      _play('tap');sm('Too big for that peg');
      selectedPeg=-1;render();
    }
  }
}

// Drag handlers (mouse + touch) registered on pan once per new game
function bindDrag(){
  pan.onmousedown=function(e){
    if(won)return;
    var p=pegUnder(e.clientX,e.clientY);if(p<0||!pegs[p].length)return;
    dragActive=true;dragFromPeg=p;dragStartX=e.clientX;dragStartY=e.clientY;dragMoved=false;
    selectedPeg=p;
    // Visual: show peg as selected
    var n=pan.querySelectorAll('.hpeg');for(var i=0;i<n.length;i++)n[i].classList.remove('sel');
    if(n[p])n[p].classList.add('sel');
  };
  pan.onmousemove=function(e){
    if(!dragActive)return;
    if(Math.abs(e.clientX-dragStartX)+Math.abs(e.clientY-dragStartY)>6)dragMoved=true;
    var p=pegUnder(e.clientX,e.clientY);
    highlightDrop(p);
  };
  pan.ontouchstart=function(e){
    if(won)return;
    var t=e.touches&&e.touches[0];if(!t)return;
    var p=pegUnder(t.clientX,t.clientY);if(p<0||!pegs[p].length)return;
    e.preventDefault();
    dragActive=true;dragFromPeg=p;dragStartX=t.clientX;dragStartY=t.clientY;dragMoved=false;
    selectedPeg=p;
    var n=pan.querySelectorAll('.hpeg');for(var i=0;i<n.length;i++)n[i].classList.remove('sel');
    if(n[p])n[p].classList.add('sel');
  };
  pan.ontouchmove=function(e){
    if(!dragActive)return;
    var t=e.touches&&e.touches[0];if(!t)return;
    if(Math.abs(t.clientX-dragStartX)+Math.abs(t.clientY-dragStartY)>6)dragMoved=true;
    e.preventDefault();
    var p=pegUnder(t.clientX,t.clientY);
    highlightDrop(p);
  };
}

function globalRelease(clientX,clientY){
  if(!dragActive)return;
  dragActive=false;
  var targetPeg=pegUnder(clientX,clientY);
  // Clear drop highlights
  if(pan){var all=pan.querySelectorAll('.hpeg');for(var i=0;i<all.length;i++)all[i].classList.remove('drop-ok','drop-bad');}
  if(!dragMoved){return;} // Treated as a tap — let click handler run
  if(targetPeg<0||targetPeg===dragFromPeg){selectedPeg=-1;render();return;}
  if(doMove(dragFromPeg,targetPeg)){
    selectedPeg=-1;render();
  } else {
    _play('tap');sm('Too big for that peg');
    selectedPeg=-1;render();
  }
}

document.addEventListener('mouseup',function(e){if(dragActive)globalRelease(e.clientX,e.clientY);});
document.addEventListener('touchend',function(e){
  if(!dragActive)return;
  var t=(e.changedTouches&&e.changedTouches[0])||null;
  globalRelease(t?t.clientX:-1,t?t.clientY:-1);
});
document.addEventListener('touchcancel',function(){if(dragActive){dragActive=false;selectedPeg=-1;if(pan){var all=pan.querySelectorAll('.hpeg');for(var i=0;i<all.length;i++)all[i].classList.remove('drop-ok','drop-bad','sel');}render();}});

// ── Victory overlay ────────────────────────────────────────────────────────
function hanoiVictory(){
  var secs=Math.max(1,Math.round((solvedTs-startTs)/1000));
  var timeStr=fmtTime(secs);
  var stars=moves===optimal?3:(moves<=Math.round(optimal*1.5)?2:1);
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(200,168,75,0.32) 0%,rgba(13,16,12,0.94) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:hPanIn .3s ease;font-family:Georgia,serif;';
  var starRow='<div style="display:flex;gap:10px;margin:14px 0 12px;">';
  for(var si=0;si<3;si++){
    var lit=si<stars;
    starRow+='<div style="font-size:2.6rem;line-height:1;filter:drop-shadow(0 0 '+(lit?'18px rgba(255,220,112,0.8)':'4px rgba(0,0,0,0.5)')+');color:'+(lit?'#ffdc70':'rgba(110,100,80,0.5)')+';animation:hStarFly 0.6s cubic-bezier(.18,1.4,.3,1) '+(si*150)+'ms both;">★</div>';
  }
  starRow+='</div>';
  ov.innerHTML=
    '<div style="font-size:3rem;line-height:1;margin-bottom:2px;filter:drop-shadow(0 0 18px rgba(122,179,86,0.7));animation:hGlow 1.8s ease-in-out infinite,hStarFly 0.7s cubic-bezier(.18,1.4,.3,1);">🌿</div>'+
    starRow+
    '<div style="font-size:2.1rem;font-weight:700;color:#c8a84b;letter-spacing:0.08em;text-shadow:0 0 18px rgba(200,168,75,0.6);animation:hLineIn 0.5s ease-out 0.3s both;">TOWER GROWN</div>'+
    '<div style="display:flex;gap:14px;margin-top:14px;font-family:DM Mono,monospace;font-size:0.72rem;color:#e8dcc8;animation:hLineIn 0.5s ease-out 0.5s both;">'+
      '<div><span style="color:rgba(232,220,200,0.55);">Moves</span> <strong style="color:#c8a84b;">'+moves+'</strong><span style="color:rgba(232,220,200,0.4);">/'+optimal+'</span></div>'+
      '<div><span style="color:rgba(232,220,200,0.55);">Time</span> <strong style="color:#7ab356;">'+timeStr+'</strong></div>'+
      '<div><span style="color:rgba(232,220,200,0.55);">Disks</span> <strong style="color:#e8dcc8;">'+discs+'</strong></div>'+
    '</div>'+
    '<div style="display:flex;gap:8px;margin-top:22px;animation:hLineIn 0.5s ease-out 0.8s both;">'+
      '<button onclick="this.parentElement.parentElement.remove();_HN()" style="min-height:46px;padding:10px 22px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;">↻ Next</button>'+
    '</div>';
  ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
  document.body.appendChild(ov);
}

// ── Game lifecycle ─────────────────────────────────────────────────────────
function GH(a){
  ms(a,'Tower of Hanoi');mm(a);
  pan=document.createElement('div');pan.id='Hpan';a.appendChild(pan);
  var pegChoice='<select class="gsl" id="Hp4" onchange="_HN()"><option value="3">3 pegs</option><option value="4">4 pegs</option></select>';
  var diskChoice='<select class="gsl" id="Hd" onchange="_HN()"><option value="3">3</option><option value="4">4</option><option value="5" selected>5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option></select> disks';
  mc(a).innerHTML=pegChoice+' '+diskChoice;
  // Global controls (New / Undo) live inside pan now via render()
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){
    if(timerId){clearInterval(timerId);timerId=null;}
  });
  window._HN();
}

window._HN=function(){
  pegCount=parseInt((document.getElementById('Hp4')||{}).value)||3;
  discs=parseInt((document.getElementById('Hd')||{}).value)||5;
  _setDiff(discs<=3?'easy':discs<=5?'medium':discs<=6?'hard':'expert');
  pegs=[];
  for(var p=0;p<pegCount;p++)pegs.push([]);
  for(var i=discs-1;i>=0;i--)pegs[0].push(i);
  moves=0;selectedPeg=-1;history=[];won=false;
  optimal=optimalCount(discs,pegCount);
  startTs=Date.now();solvedTs=0;
  if(timerId){clearInterval(timerId);}
  timerId=setInterval(tickTimer,500);
  sm('');
  render();
  bindDrag();
};

window._HU=function(){undoMove();};

window._gameFns.hanoi=GH;
})();
