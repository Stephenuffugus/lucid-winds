/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: doubleshutter
 *
 * COPY of the inline GDS mount function from index.html
 * lines 66697-66850.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/doubleshutter.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GDS(a){
    var rows,sel,d1,d2,phase,rolls,gameOver,_bestScore;
    try{_bestScore=parseInt(localStorage.getItem('lw_ds_best')||'999',10);}catch(e){_bestScore=999;}
    ms(a,'Rolls: <strong id="DSr">0</strong> · Open score: <strong id="DSo">135</strong> · Best: <strong id="DSbest">'+(_bestScore>=999?'—':_bestScore)+'</strong>');mm(a);
    // Directions
    var dir=document.createElement('div');
    dir.style.cssText='text-align:center;padding:0.4rem 0.8rem;margin:0.2rem auto;max-width:440px;font-family:DM Sans,sans-serif;font-size:clamp(0.6rem,1.7vw,0.75rem);color:var(--cream);line-height:1.55;opacity:0.9';
    dir.innerHTML='Roll <strong>2 dice</strong>. Shut any open tiles that <strong>add up to your roll</strong>. One tile or several, your choice.<br>FRONT row reads <strong>1 → 9</strong>, BACK row reads <strong>9 → 1</strong> (mirrored). A <strong>back tile stays covered</strong> until you shut the <strong>front tile above it</strong>. Plan your knockdowns: flipping the FRONT 1 reveals the BACK 9 in that column.<br>If you get stuck, open tiles become your score and <strong style="color:var(--gold)">front tiles count double</strong>. Once every open tile is <strong>6 or less</strong>, you may roll just <strong>1 die</strong>. Shut all 18 for a perfect game.';
    a.appendChild(dir);
    var wrap=document.createElement('div');wrap.className='ds-wrap';a.appendChild(wrap);
    // BACK row renders on top (physical game orientation)
    var r1Lbl=document.createElement('div');r1Lbl.className='ds-rowlbl';r1Lbl.innerHTML='BACK &nbsp;·&nbsp; 9 → 1 &nbsp;·&nbsp; counts ×1';wrap.appendChild(r1Lbl);
    var r1=document.createElement('div');r1.className='ds-row';r1.id='DSr1';wrap.appendChild(r1);
    // FRONT row below
    var r2Lbl=document.createElement('div');r2Lbl.className='ds-rowlbl';r2Lbl.innerHTML='FRONT &nbsp;·&nbsp; 1 → 9 &nbsp;·&nbsp; <span style="color:var(--gold)">counts ×2 if stuck</span>';wrap.appendChild(r2Lbl);
    var r2=document.createElement('div');r2.className='ds-row';r2.id='DSr2';wrap.appendChild(r2);
    // Dice + info
    var dz=document.createElement('div');dz.className='ds-dice';dz.id='DSdz';wrap.appendChild(dz);
    var info=document.createElement('div');info.className='ds-info';info.id='DSinfo';wrap.appendChild(info);
    mc(a).innerHTML='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:6px"><button class="gb" id="DSroll2" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em" onclick="_DSRoll(2)">🎲 ROLL 2</button><button class="gb" id="DSroll1" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;display:none" onclick="_DSRoll(1)">🎲 ROLL 1</button><button class="gb" id="DSshut" style="min-height:52px;min-width:120px;font-size:0.85rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;background:rgba(200,168,75,0.15);border-color:var(--gold);color:var(--gold);display:none" onclick="_DSShut()">✓ SHUT</button><button class="gb" onclick="window._LW_dicePicker()" title="Dice style" style="min-height:52px;min-width:90px;padding:6px 14px;font-size:0.72rem;font-family:Bebas Neue,sans-serif;letter-spacing:0.08em;background:linear-gradient(180deg,rgba(200,168,75,0.25),rgba(160,130,55,0.35));border:1.5px solid rgba(200,168,75,0.55);color:var(--gold);border-radius:10px">🎲 STYLE</button><button class="gb-new" onclick="_DSN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
    // Tile value: row 0 (BACK) at idx i → 9-i.  row 1 (FRONT) at idx i → i+1.
    function tileVal(r,i){return r===1?(i+1):(9-i);}
    // A BACK tile is only revealed (tappable) once the FRONT tile in the same
    // column is shut. FRONT tiles are always reachable.
    function isReachable(r,i){return r===1?true:rows[1][i];}
    // "Open" now excludes back tiles that are still covered by their front.
    function allOpen(){var out=[];for(var r=0;r<2;r++)for(var i=0;i<9;i++){if(rows[r][i])continue;if(!isReachable(r,i))continue;out.push({r:r,i:i,v:tileVal(r,i)});}return out;}
    function bothDone(){for(var r=0;r<2;r++)for(var i=0;i<9;i++)if(!rows[r][i])return false;return true;}
    // Scoring at bust still counts every unshut tile (covered or not) since the
    // back tiles are physically still in the box. Front ×2, back ×1.
    function scoreWeighted(){var s=0;for(var i=0;i<9;i++){if(!rows[0][i])s+=tileVal(0,i);if(!rows[1][i])s+=2*tileVal(1,i);}return s;}
    function maxOpenVal(){var o=allOpen(),m=0;for(var k=0;k<o.length;k++)if(o[k].v>m)m=o[k].v;return m;}
    function selSum(){var s=0;sel.forEach(function(t){s+=t.v;});return s;}
    function canMakeSum(target){
      // Subset-sum over reachable open tiles only — covered backs are not in play
      var open=allOpen().map(function(o){return o.v;});
      function find(idx,rem){if(rem===0)return true;if(rem<0||idx>=open.length)return false;return find(idx+1,rem-open[idx])||find(idx+1,rem);}
      return find(0,target);
    }
    function rn(){
      [r1,r2].forEach(function(rowEl,ri){
        rowEl.innerHTML='';
        for(var i=0;i<9;i++){
          var t=document.createElement('div');t.className='ds-tile';
          if(ri===1)t.className+=' ds-front';
          var covered=(ri===0&&!rows[1][i]);  // back tile with its front still up
          if(rows[ri][i])t.className+=' shut';
          else if(covered)t.className+=' covered';
          var isSel=sel.some(function(s){return s.r===ri&&s.i===i;});
          if(isSel)t.className+=' sel';
          t.textContent=covered?'':tileVal(ri,i);
          t.setAttribute('data-r',ri);t.setAttribute('data-i',i);
          if(!rows[ri][i]&&!covered&&phase==='select'&&!gameOver){
            t.onclick=function(){
              var r=parseInt(this.getAttribute('data-r')),idx=parseInt(this.getAttribute('data-i'));
              var existing=-1;for(var k=0;k<sel.length;k++)if(sel[k].r===r&&sel[k].i===idx){existing=k;break;}
              if(existing>=0)sel.splice(existing,1);
              else sel.push({r:r,i:idx,v:tileVal(r,idx)});
              _play('tap');rn();
            };
          }
          rowEl.appendChild(t);
        }
      });
      // Dice
      dz.innerHTML='';
      if(d1){var dd1=document.createElement('div');dd1.className='ds-die';dd1.innerHTML='<img src="'+window.LW_DICE.face(d1)+'" alt="'+d1+'"/>';dz.appendChild(dd1);}
      if(d2){var dd2=document.createElement('div');dd2.className='ds-die';dd2.innerHTML='<img src="'+window.LW_DICE.face(d2)+'" alt="'+d2+'"/>';dz.appendChild(dd2);}
      // Info bar
      var target=(d1||0)+(d2||0);
      var ss=selSum();
      if(phase==='roll'){
        info.innerHTML='Tap <strong>ROLL</strong> · current risk: <strong style="color:var(--gold)">'+scoreWeighted()+'</strong>';
      } else if(phase==='rolling'){
        info.innerHTML='<span style="opacity:0.7">rolling…</span>';
      } else if(phase==='select'){
        var remaining=target-ss;
        var tone=(ss===target&&ss>0)?'color:#7ab356':(ss>target?'color:#c47a7a':'color:var(--cream)');
        info.innerHTML='Roll: <strong>'+target+'</strong> &nbsp;·&nbsp; selected <strong style="'+tone+'">'+ss+'</strong> / '+target+(ss<target?' (need '+remaining+' more)':'');
      }
      // Buttons
      var b2=document.getElementById('DSroll2'),b1=document.getElementById('DSroll1'),bs=document.getElementById('DSshut');
      if(phase==='roll'&&!gameOver){
        b2.style.display='';
        b1.style.display=(maxOpenVal()<=6&&maxOpenVal()>0)?'':'none';
        bs.style.display='none';
      } else if(phase==='select'){
        b2.style.display='none';b1.style.display='none';
        bs.style.display=(ss===target&&ss>0)?'':'none';
      } else {b2.style.display='none';b1.style.display='none';bs.style.display='none';}
      document.getElementById('DSr').textContent=rolls;
      document.getElementById('DSo').textContent=scoreWeighted();
    }
    window._DSRoll=function(n){
      if(phase!=='roll'||gameOver)return;
      if(n===1&&maxOpenVal()>6){sm('Every open tile must be 6 or less to roll 1 die');return;}
      _play('snap');
      d1=Math.floor(Math.random()*6)+1;
      d2=n===2?Math.floor(Math.random()*6)+1:0;
      rolls++;sel=[];
      // New 'rolling' phase locks taps and ROLL while the tumble plays out.
      phase='rolling';
      rn();
      wrap.classList.add('rolling');
      var dieEls=dz.querySelectorAll('.ds-die');
      var vals=[d1];if(d2)vals.push(d2);
      window._LW_tumble(dieEls,vals,{duration:760,face:function(n){return window.LW_DICE.face(n);},onDone:function(){
        wrap.classList.remove('rolling');
        phase='select';
        var target=d1+d2;
        rn();
        if(!canMakeSum(target)){
          gameOver=true;
          var finalScore=scoreWeighted();
          var wasBest=false;
          if(finalScore<_bestScore){_bestScore=finalScore;try{localStorage.setItem('lw_ds_best',String(finalScore));}catch(e){}wasBest=true;var be=document.getElementById('DSbest');if(be)be.textContent=finalScore;}
          sm('🍂 Stuck on '+target+' · score '+finalScore+' (front ×2)'+(wasBest?' · 🌟 NEW BEST':''));
          _play('lose');_e('game_loss');_sr('doubleshutter',{w:false,s:finalScore});
          phase='done';rn();
        }
      }});
    };
    window._DSShut=function(){
      if(phase!=='select')return;
      var target=d1+d2,ss=selSum();
      if(ss!==target){sm('Selected sum must equal '+target);return;}
      _play('drop');
      sel.forEach(function(s){rows[s.r][s.i]=true;});
      sel=[];_e('progress');
      if(bothDone()){
        gameOver=true;
        try{localStorage.setItem('lw_ds_best','0');}catch(e){}
        _bestScore=0;var be=document.getElementById('DSbest');if(be)be.textContent='0';
        sm('🌿 PERFECT! Every tile shut!');_e('game_win');_playWin();_sr('doubleshutter',{w:true,s:0});
        phase='done';rn();return;
      }
      // Milestone every 6 shut tiles for a little progression dopamine
      var shutCount=0;for(var r=0;r<2;r++)for(var i=0;i<9;i++)if(rows[r][i])shutCount++;
      if(shutCount>0&&shutCount%6===0)_e('milestone');
      phase='roll';rn();
    };
    window._DSN=function(){
      rows=[new Array(9).fill(false),new Array(9).fill(false)];
      sel=[];d1=0;d2=0;phase='roll';rolls=0;gameOver=false;
      sm('Roll and shut. Either row, any combo. Front counts double.');rn();
    };
    // Re-render on dice-style change. Self-unregisters once the game is gone.
    var _dsStyleListener=function(){
      if(!document.body.contains(a)){window.removeEventListener('lw-dice-style-change',_dsStyleListener);return;}
      try{rn();}catch(e){}
    };
    window.addEventListener('lw-dice-style-change',_dsStyleListener);
    _DSN();
  }

  window._gameFns['doubleshutter']=GDS;
})();
