// ═══ LUCID WINDS — Autumn Leaves (Flood Fill) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GFL(a){
  var SZ=8,grid=[],moves=0,maxMoves=22;
  var LF=['assets/games/flood/leaf-sage.png','assets/games/flood/leaf-gold.png','assets/games/flood/leaf-slate.png','assets/games/flood/leaf-copper.png','assets/games/flood/leaf-plum.png','assets/games/flood/leaf-crimson.png'];
  var CC=['#4a7c35','#C8A84B','#4a7aaa','#c76a30','#9b59b6','#c75050'];
  // Per-player toggle: leaves art on/off. Persisted so the choice
  // sticks across sessions. Stephen's daughter asked for the plain
  // color option.
  var leavesOn=true;
  try{leavesOn=localStorage.getItem('lw_flood_leaves')!=='off';}catch(e){}

  ms(a,'Moves: <strong id="FFm">0</strong>/'+maxMoves);mm(a);
  var gd=document.createElement('div');gd.className='lg';gd.id='FFg';gd.style.gridTemplateColumns='repeat('+SZ+',1fr)';gd.style.gap='2px';gd.style.width='clamp(300px,92vw,420px)';a.appendChild(gd);
  var pb=document.createElement('div');pb.className='lg';pb.style.gridTemplateColumns='repeat(6,1fr)';pb.style.gap='8px';pb.style.padding='12px';pb.style.width='clamp(300px,92vw,420px)';a.appendChild(pb);
  mc(a).innerHTML='<button class="gb" onclick="_FFN()">🔄 New</button> <button class="gb" id="FFleafBtn" onclick="_FFleafToggle()">'+(leavesOn?'🍂 Leaves':'⬤ Plain')+'</button>';

  function gen(){grid=[];for(var i=0;i<SZ*SZ;i++)grid.push(Math.floor(Math.random()*6));moves=0;}
  function flood(oc,nc){
    if(oc===nc)return;
    var vis=[];for(var x=0;x<SZ*SZ;x++)vis.push(false);
    var q=[0];
    while(q.length){
      var i=q.shift();
      if(i<0||i>=SZ*SZ||vis[i])continue;
      if(grid[i]!==oc&&grid[i]!==nc)continue;
      vis[i]=true;
      if(grid[i]===oc)grid[i]=nc;
      var r=Math.floor(i/SZ),c=i%SZ;
      if(r>0)q.push(i-SZ);if(r<SZ-1)q.push(i+SZ);
      if(c>0)q.push(i-1);if(c<SZ-1)q.push(i+1);
    }
  }
  // Build a cell's background string. With leaves on we layer the
  // leaf PNG over the color (so a slow image-load shows the color).
  // With leaves off, just the solid color — no PNG fetch at all.
  function cellBg(idx){
    var color=CC[grid[idx]];
    if(leavesOn)return 'url('+LF[grid[idx]]+') center/cover '+color;
    return color;
  }
  function rn(){
    gd.innerHTML='';
    for(var i=0;i<SZ*SZ;i++){
      var d=document.createElement('div');d.className='lc';
      d.style.background=cellBg(i);
      d.setAttribute('data-i',i);
      gd.appendChild(d);
    }
    pb.innerHTML='';
    for(var j=0;j<6;j++){
      var b=document.createElement('div');b.className='lc'+(grid[0]===j?' lo':'');
      b.style.background=leavesOn?('url('+LF[j]+') center/cover '+CC[j]):CC[j];
      b.setAttribute('data-c',j);
      b.onclick=function(){_FFC(parseInt(this.getAttribute('data-c')));};
      pb.appendChild(b);
    }
  }
  window._FFC=function(c){
    if(grid[0]===c)return;
    _play('tap');flood(grid[0],c);moves++;
    document.getElementById('FFm').textContent=moves;
    rn();
    if(grid.every(function(v){return v===grid[0];})){
      _e('game_win');_playWin();sm((leavesOn?'🍂':'⬤')+' Flooded in '+moves+'!');
      _sr('flood',{w:true,s:moves});
    } else if(moves>=maxMoves){
      _e('game_loss');_play('lose');sm('Out of moves!');
      _sr('flood',{w:false,s:moves});
    }
  };
  window._FFN=function(){gen();sm('');rn();};
  window._FFleafToggle=function(){
    leavesOn=!leavesOn;
    try{localStorage.setItem('lw_flood_leaves',leavesOn?'on':'off');}catch(e){}
    var btn=document.getElementById('FFleafBtn');
    if(btn)btn.textContent=leavesOn?'🍂 Leaves':'⬤ Plain';
    rn();
  };
  _FFN();
}

window._gameFns.flood=GFL;
})();
