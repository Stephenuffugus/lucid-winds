// ═══ LUCID WINDS — Connect Fleur ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

// Inject drop keyframes once
if(!document.getElementById('c4-drop-style')){
  var _c4s=document.createElement('style');_c4s.id='c4-drop-style';
  _c4s.textContent='@keyframes c4drop{0%{transform:translateY(-420%)}60%{transform:translateY(8%)}75%{transform:translateY(-4%)}100%{transform:translateY(0)}}.c4-dropping{animation:c4drop .42s cubic-bezier(.5,.1,.6,1) both}';
  document.head.appendChild(_c4s);
}
function GC4(a){var ROWS=6,COLS=7,bd=[],turn=1,over=false,mv=0,_lastDrop=-1;
  var IMG_P='assets/games/c4/zinnia.png',IMG_A='assets/games/c4/calendula.png';
  ms(a,'Moves: <strong id="C4m">0</strong>');mm(a);
  // Pure CSS board — no image overlay alignment needed
  var gd=document.createElement('div');gd.id='C4g';
  gd.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(6,1fr);gap:clamp(3px,1vw,6px);width:clamp(280px,88vw,420px);margin:0 auto;padding:clamp(6px,2vw,10px);background:linear-gradient(180deg,rgba(48,36,20,.95),rgba(32,24,14,.98));border-radius:clamp(8px,2.5vw,14px);border:2px solid rgba(80,60,30,.4);box-shadow:0 4px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(120,90,40,.15)';
  a.appendChild(gd);
  var obDiv=document.createElement('div');obDiv.id='C4ob';obDiv.style.cssText='text-align:center;min-height:40px;padding:4px 0';a.appendChild(obDiv);
  mc(a).innerHTML='<select class="gsl" id="C4d"><option value="1">Seedling</option><option value="2" selected>Sapling</option><option value="3">Old Growth</option></select><button class="gb" onclick="_C4N()">🔄 New</button>';
  function init(){bd=[];for(var i=0;i<ROWS*COLS;i++)bd.push(0);turn=1;over=false;mv=0;var _cm=document.getElementById('C4m');if(_cm)_cm.textContent='0'}
  function drop(col){for(var r=ROWS-1;r>=0;r--){if(bd[r*COLS+col]===0){bd[r*COLS+col]=turn;_lastDrop=r*COLS+col;return r;}}}
  function check(p){
    for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
      if(c+3<COLS&&bd[r*COLS+c]===p&&bd[r*COLS+c+1]===p&&bd[r*COLS+c+2]===p&&bd[r*COLS+c+3]===p)return true;
      if(r+3<ROWS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c]===p&&bd[(r+2)*COLS+c]===p&&bd[(r+3)*COLS+c]===p)return true;
      if(r+3<ROWS&&c+3<COLS&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c+1]===p&&bd[(r+2)*COLS+c+2]===p&&bd[(r+3)*COLS+c+3]===p)return true;
      if(r+3<ROWS&&c-3>=0&&bd[r*COLS+c]===p&&bd[(r+1)*COLS+c-1]===p&&bd[(r+2)*COLS+c-2]===p&&bd[(r+3)*COLS+c-3]===p)return true;
    }return false}
  function isFull(){for(var c=0;c<COLS;c++)if(bd[c]===0)return false;return true}
  // AI — minimax with alpha-beta
  function score(b){
    function sc4(r,c,dr,dc){var ct=[0,0,0];for(var i=0;i<4;i++){var nr=r+dr*i,nc=c+dc*i;if(nr<0||nr>=ROWS||nc<0||nc>=COLS)return 0;ct[b[nr*COLS+nc]]++;}
      if(ct[2]===4)return 1000;if(ct[1]===4)return -1000;if(ct[2]===3&&ct[0]===1)return 50;if(ct[1]===3&&ct[0]===1)return -50;if(ct[2]===2&&ct[0]===2)return 5;if(ct[1]===2&&ct[0]===2)return -5;return 0}
    var s=0;for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){s+=sc4(r,c,0,1)+sc4(r,c,1,0)+sc4(r,c,1,1)+sc4(r,c,1,-1)}
    for(var c=0;c<COLS;c++){var cc=Math.abs(c-3);s-=cc;}return s}
  function minimax(b,depth,alpha,beta,isMax){
    if(check(2))return {s:10000+depth};if(check(1))return {s:-10000-depth};if(isFull())return {s:0};if(depth===0)return {s:score(b)};
    var best={s:isMax?-Infinity:Infinity,c:-1};var order=[3,2,4,1,5,0,6];
    for(var oi=0;oi<order.length;oi++){var c=order[oi];if(b[c]!==0)continue;
      var r=-1;for(var rr=ROWS-1;rr>=0;rr--){if(b[rr*COLS+c]===0){r=rr;break;}}if(r<0)continue;
      b[r*COLS+c]=isMax?2:1;var val=minimax(b,depth-1,alpha,beta,!isMax);b[r*COLS+c]=0;
      if(isMax){if(val.s>best.s){best={s:val.s,c:c}}alpha=Math.max(alpha,val.s)}
      else{if(val.s<best.s){best={s:val.s,c:c}}beta=Math.min(beta,val.s)}
      if(beta<=alpha)break}return best}
  var _c4Enc=['Nice try! Go again 🌱','Almost had it! One more? 🌿','The garden grows through practice 🌻','Every loss plants a seed of wisdom 🍃','You learn more from losses \u2014 rematch? 🌸'];
  var _c4Win=['Brilliant! You bloomed! 🌸','Your garden flourishes! 🌺','Masterful placement! 🌻','The grove is proud! 🌿','Connect Fleur champion! 🏆'];
  function aiMove(){
    var depMap={1:3,2:5,3:7};var dep=depMap[parseInt((document.getElementById('C4d')||{}).value)]||5;
    var res=minimax(bd.slice(),dep,-Infinity,Infinity,true);
    if(res.c<0){for(var c=0;c<COLS;c++)if(bd[c]===0){res.c=c;break;}}
    drop(res.c);_play('drop');mv++;document.getElementById('C4m').textContent=mv;
    if(check(2)){over=true;_e('game_loss');_play('lose');sm(_c4Enc[Math.floor(Math.random()*_c4Enc.length)]);_sr('c4',{w:false,s:mv})}
    else if(isFull()){over=true;sm('A draw! Well matched \u2014 try again? 🌿');_sr('c4',{w:false,s:mv})}
    else{turn=1;sm('Your turn')}rn()}
  function rn(){var _scrollY=window.scrollY;
    var cells=gd.children;
    if(cells.length!==ROWS*COLS){
      gd.innerHTML='';
      for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
        var d=document.createElement('div');
        d.style.cssText='aspect-ratio:1;border-radius:50%;cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;transition:background .2s ease,box-shadow .2s ease;background:rgba(10,8,4,.7);box-shadow:inset 0 2px 6px rgba(0,0,0,.6)';
        d.setAttribute('data-c',c);
        d.onclick=function(){if(over||turn!==1)return;var col=parseInt(this.getAttribute('data-c'));if(bd[col]!==0)return;
          _play('tap');drop(col);mv++;var _cm=document.getElementById('C4m');if(_cm)_cm.textContent=mv;
          if(check(1)){over=true;_e('game_win');_playWin();sm(_c4Win[Math.floor(Math.random()*_c4Win.length)]);rn();_sr('c4',{w:true,s:mv});return}
          if(isFull()){over=true;sm('A draw! Well matched \u2014 try again? 🌿');rn();_sr('c4',{w:false,s:mv});return}
          turn=2;sm('AI thinking...');rn();setTimeout(aiMove,300)};
        gd.appendChild(d)}
      cells=gd.children;
    }
    for(var i=0;i<ROWS*COLS;i++){
      var d=cells[i],v=bd[i];
      if(v===1){d.style.background='url('+IMG_P+') center/cover';d.style.boxShadow='inset 0 0 4px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.25)';}
      else if(v===2){d.style.background='url('+IMG_A+') center/cover';d.style.boxShadow='inset 0 0 4px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.25)';}
      else{d.style.background='rgba(10,8,4,.7)';d.style.boxShadow='inset 0 2px 6px rgba(0,0,0,.6)';}
      if(i===_lastDrop){d.classList.remove('c4-dropping');void d.offsetWidth;d.classList.add('c4-dropping');}
      else{d.classList.remove('c4-dropping');}
    }
    _lastDrop=-1;
    var ob=document.getElementById('C4ob');
    if(ob){
      if(!over){ob.innerHTML='';}
      else if(check(1)){
        // Player won — the global _showWinCelebration handles this
        ob.innerHTML='';
      }else{
        // Loss or draw — show result + try again
        var isLoss=check(2);
        var msg=isLoss?_c4Enc[Math.floor(Math.random()*_c4Enc.length)]:'A draw! Well matched.';
        ob.innerHTML='<div style="text-align:center;padding:clamp(8px,3vw,16px);background:rgba(26,31,23,.85);border:1px solid rgba(74,124,53,.15);border-radius:12px;margin:8px auto;max-width:320px">'
          +'<div style="font-family:Bebas Neue,sans-serif;font-size:clamp(.8rem,2.5vw,1.1rem);color:'+(isLoss?'var(--cream)':'var(--gold)')+';letter-spacing:.08em;margin-bottom:6px">'+(isLoss?'GAME OVER':'DRAW')+'</div>'
          +'<div style="font-size:clamp(.45rem,1.3vw,.6rem);color:var(--muted);margin-bottom:10px">'+msg+'</div>'
          +'<button class="gb" onclick="_C4N()" style="font-size:clamp(.6rem,1.8vw,.8rem);padding:8px 20px;width:100%;min-height:44px">TRY AGAIN</button>'
          +'</div>';
      }
    }
    window.scrollTo(0,_scrollY)}
  window._C4N=function(){init();gd.innerHTML='';sm('Your turn');rn()};_C4N();}

window._gameFns.c4=GC4;
})();
