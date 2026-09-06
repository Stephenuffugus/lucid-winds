/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studio — Inline game copy: farkle
 *
 * COPY of the inline GF mount function from index.html
 * lines 68121-68483.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/farkle.html shell only. To keep them aligned,
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

  function GF(a){var dice=[0,0,0,0,0,0],kept=new Array(6).fill(false),turn=0,rolling=false,busted=false;
    var numPlayers=1,curP=0,players=[{banked:0}],target=10000,gameOver=false,finalRound=false,finalStart=-1;
    var justRolled=new Array(6).fill(false);
    var overlay=null; // {kind:'hot'|'farkle'|'gameover', ...}
    var fGen=0; // bumped by _FN + exit cleanup — invalidates stale timer chains (2026-07-04 audit)
    // Inject Farkle keyframes once
    if(!document.getElementById('f-anim-style')){
      var _fs=document.createElement('style');_fs.id='f-anim-style';
      _fs.textContent=
        '@keyframes fDieRoll{0%{transform:rotate(0) scale(1)}30%{transform:rotate(180deg) scale(0.9)}60%{transform:rotate(360deg) scale(1.1)}82%{transform:rotate(540deg) scale(1.08)}100%{transform:rotate(540deg) scale(1)}}'+
        '.fDie.rolling{animation:fDieRoll 0.85s cubic-bezier(.18,.7,.3,1) both;}'+
        '.fDie.held{transform:translateY(-4px) scale(0.96);filter:saturate(0.85);}'+
        /* Farkle: warm amber cast to read against the brown felt */
        '.fDie img{filter:sepia(0.08) saturate(1.08) brightness(1.02) drop-shadow(0 2px 3px rgba(90,40,10,0.35));}'+
        '@keyframes fHotFlash{0%{transform:scale(0.3) rotate(-6deg);opacity:0}45%{transform:scale(1.22) rotate(2deg);opacity:1}72%{transform:scale(0.96);opacity:1}100%{transform:scale(1);opacity:1}}'+
        '@keyframes fFarkleShake{0%,100%{transform:translateX(0)}18%{transform:translateX(-7px) rotate(-1deg)}38%{transform:translateX(7px) rotate(1deg)}58%{transform:translateX(-4px)}78%{transform:translateX(4px)}}'+
        '@keyframes fLineIn{0%{transform:translateX(-12px);opacity:0}100%{transform:translateX(0);opacity:1}}'+
        '@keyframes fFadeIn{0%{opacity:0}100%{opacity:1}}'+
        '@keyframes fFinalPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,180,90,0.35),inset 0 1px 0 rgba(255,255,255,0.08)}50%{box-shadow:0 0 14px rgba(255,180,90,0.7),inset 0 1px 0 rgba(255,255,255,0.12)}}'+
        '.fFinal{animation:fFinalPulse 1.8s ease-in-out infinite;}';
      document.head.appendChild(_fs);
    }
    function seedDie(n){
      return '<img src="'+window.LW_DICE.face(n)+'" alt="'+n+'" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:clamp(6px,2vw,12px)" draggable="false"/>';
    }
    ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">🎲 <span id="Fp" style="color:#ffb45a;font-weight:700;">P1</span> &middot; <strong id="Fs" style="color:#ffdc70;font-size:1.2em;">0</strong> / '+target+'</span>');
    mm(a);
    // Felted brown pan
    var pan=document.createElement('div');pan.id='Fpan';
    var _F_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
        +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="22"/>'
        +'<feColorMatrix values="0 0 0 0 0.09  0 0 0 0 0.04  0 0 0 0 0.02  0 0 0 .08 0"/></filter>'
        +'<rect width="100%" height="100%" filter="url(#n)"/>'
      +'</svg>'
    );
    pan.style.cssText='max-width:min(100vw - 16px,560px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'
      +'background:'
        +'url("'+_F_FELT+'"),'
        +'radial-gradient(ellipse at 50% 0%,rgba(255,160,90,0.08) 0%,transparent 50%),'
        +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.3) 0%,transparent 65%),'
        +'linear-gradient(135deg,#3d1a08 0%,#2a1408 55%,#1a0c04 100%);'
      +'background-size:180px 180px, auto, auto, auto;'
      +'border-radius:14px;'
      +'border:2px solid #6b4520;'
      +'box-shadow:'
        +'inset 0 0 0 1px rgba(220,160,90,0.25),'
        +'inset 0 0 38px rgba(0,0,0,0.5),'
        +'0 0 40px rgba(0,0,0,0.8),'
        +'0 6px 22px rgba(0,0,0,0.6);';
    a.appendChild(pan);
    mc(a); // empty — controls go inside pan
    // Scoring (unchanged logic)
    function score(){var ct=new Array(7).fill(0);for(var i=0;i<6;i++)if(kept[i])ct[dice[i]]++;var s=0;for(var v=1;v<=6;v++){if(ct[v]>=3){s+=(v===1)?1000:v*100;var extra=ct[v]-3;s+=extra*100;ct[v]=0}else{if(v===1)s+=ct[v]*100;if(v===5)s+=ct[v]*50}}return s}
    // Breakdown chips — shows WHY the kept dice score what they score
    function scoreBreakdown(){
      var ct=new Array(7).fill(0);for(var i=0;i<6;i++)if(kept[i])ct[dice[i]]++;
      var parts=[];
      for(var v=1;v<=6;v++){
        if(ct[v]>=3){
          var base=(v===1)?1000:v*100;
          var extra=(ct[v]-3)*100;
          var label=ct[v]+'×'+v+(ct[v]>3?' +'+extra:'');
          parts.push({label:label,pts:base+extra});
        } else {
          if(v===1)for(var k=0;k<ct[1];k++)parts.push({label:'single 1',pts:100});
          if(v===5)for(var k2=0;k2<ct[5];k2++)parts.push({label:'single 5',pts:50});
        }
      }
      return parts;
    }
    function liveTurn(){return turn+score()}
    // BANK button color ramps with stakes — muted at low turn score, volcanic near 2000+
    function bankStyle(){
      var t=liveTurn();
      if(busted||gameOver||t<=0)return{bg:'rgba(0,0,0,0.4)',bdr:'rgba(232,220,200,0.2)',col:'rgba(232,220,200,0.4)',gl:''};
      if(t<300)return{bg:'linear-gradient(180deg,rgba(160,120,80,0.28),rgba(110,80,50,0.4))',bdr:'#8a6a42',col:'#e8dcc8',gl:''};
      if(t<750)return{bg:'linear-gradient(180deg,rgba(200,168,75,0.35),rgba(160,130,55,0.4))',bdr:'#ffdc70',col:'#f5ebd0',gl:'box-shadow:0 0 8px rgba(255,220,112,0.4);'};
      if(t<1500)return{bg:'linear-gradient(180deg,rgba(255,180,90,0.4),rgba(200,130,60,0.5))',bdr:'#ffb45a',col:'#fff0d6',gl:'box-shadow:0 0 14px rgba(255,180,90,0.55);'};
      return{bg:'linear-gradient(180deg,rgba(255,100,80,0.5),rgba(220,70,50,0.55))',bdr:'#ff5a4a',col:'#fff',gl:'box-shadow:0 0 22px rgba(255,90,70,0.7);'};
    }
    function scoreboardStrip(){
      var h='<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 2px 8px;border-bottom:1px solid rgba(220,160,90,0.2);margin-bottom:8px;">';
      for(var p=0;p<players.length;p++){
        var on=p===curP&&!gameOver;
        var pct=Math.min(100,Math.round(players[p].banked/target*100));
        var col=on?'#ffb45a':'rgba(232,220,200,0.55)';
        var bg=on?'linear-gradient(180deg,rgba(255,180,90,0.16),rgba(200,130,60,0.08))':'rgba(0,0,0,0.25)';
        var bdr=on?'1.5px solid #ffb45a':'1px solid rgba(232,220,200,0.15)';
        h+='<div style="flex:1 1 80px;min-width:70px;padding:5px 8px;background:'+bg+';border:'+bdr+';border-radius:6px;'+(on?'box-shadow:0 0 10px rgba(255,180,90,0.25);':'')+'">';
        h+='<div style="display:flex;justify-content:space-between;align-items:center;font-family:Georgia,serif;font-size:0.7rem;">';
        h+='<span style="color:'+col+';font-weight:'+(on?'700':'400')+';">P'+(p+1)+'</span>';
        h+='<span style="color:'+col+';font-weight:700;">'+players[p].banked+'</span>';
        h+='</div>';
        h+='<div style="height:3px;background:rgba(0,0,0,0.5);border-radius:2px;margin-top:3px;overflow:hidden;">';
        h+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#8a6a42,#ffb45a);transition:width .4s;"></div>';
        h+='</div>';
        h+='</div>';
      }
      h+='</div>';
      return h;
    }
    function playerPicker(){
      // Only visible before any play in the current match
      if(turn>0||players[0].banked>0||curP>0||gameOver||finalRound)return '';
      for(var pp=1;pp<players.length;pp++)if(players[pp].banked>0)return '';
      // First roll leaves turn===0 (points live in kept dice) — hide the picker
      // once any die is on the felt so a mid-turn tap can't wipe the match.
      for(var dd=0;dd<6;dd++)if(dice[dd])return '';
      var h='<div style="display:flex;gap:6px;justify-content:center;align-items:center;padding:2px 2px 8px;flex-wrap:wrap;">';
      h+='<span style="font-family:DM Mono,monospace;font-size:0.7rem;letter-spacing:0.12em;color:rgba(232,220,200,0.55);text-transform:uppercase;">Players</span>';
      for(var n=1;n<=4;n++){
        var on=n===numPlayers;
        h+='<button onclick="_FNP('+n+')" style="min-width:48px;min-height:48px;padding:6px 12px;border-radius:6px;border:'+(on?'1.5px solid #ffb45a':'1px solid rgba(220,160,90,0.3)')+';background:'+(on?'rgba(255,180,90,0.18)':'rgba(0,0,0,0.35)')+';color:'+(on?'#ffb45a':'#e8dcc8')+';font-family:Georgia,serif;font-weight:700;font-size:0.75rem;cursor:pointer;">'+n+'</button>';
      }
      h+='</div>';
      return h;
    }
    function rn(){
      // Keep header ticker in sync
      var fp=document.getElementById('Fp');if(fp)fp.textContent='P'+(curP+1);
      var fsEl=document.getElementById('Fs');if(fsEl)fsEl.textContent=players[curP]?players[curP].banked:0;
      var h='';
      h+=playerPicker();
      h+=scoreboardStrip();
      // Status + controls bar
      var hint = busted ? '🍂 Farkle, lost this turn'
               : gameOver ? 'Game over'
               : (turn===0 && score()===0) ? 'Tap ROLL to begin'
               : 'Tap dice to keep · bank or press your luck';
      var bs=bankStyle();
      var rollDisabled=rolling||busted||gameOver;
      var bankDisabled=rolling||liveTurn()<=0||busted||gameOver;
      h+='<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;">';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.72rem;color:rgba(255,220,180,0.78);flex:1 1 140px;min-width:0;text-align:center;">'+hint+'</div>';
      h+='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
      h+='<button class="gb" onclick="_FR()" '+(rollDisabled?'disabled':'')+' style="min-height:48px;padding:10px 14px;font-size:0.7rem;font-family:Georgia,serif;font-weight:700;background:'+(rollDisabled?'rgba(0,0,0,0.4)':'linear-gradient(180deg,rgba(255,180,90,0.3),rgba(200,130,60,0.4))')+';border:'+(rollDisabled?'1px solid rgba(232,220,200,0.25)':'2px solid #ffb45a')+';color:'+(rollDisabled?'rgba(232,220,200,0.4)':'#fff0d6')+';border-radius:6px;cursor:'+(rollDisabled?'not-allowed':'pointer')+';'+(rollDisabled?'':'box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 2px 5px rgba(0,0,0,0.5);')+'">🎲 Roll</button>';
      h+='<button class="gb" onclick="_FB()" '+(bankDisabled?'disabled':'')+' style="min-height:48px;padding:10px 14px;font-size:0.7rem;font-family:Georgia,serif;font-weight:700;background:'+bs.bg+';border:2px solid '+bs.bdr+';color:'+bs.col+';border-radius:6px;cursor:'+(bankDisabled?'not-allowed':'pointer')+';'+bs.gl+'">💰 Bank'+(liveTurn()>0?' '+liveTurn():'')+'</button>';
      h+='<button class="gb" onclick="_FN()" title="New game" style="min-height:48px;padding:10px 12px;font-size:0.7rem;font-family:Georgia,serif;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;border-radius:6px;cursor:pointer;">↻</button>';
      h+='<button class="gb" onclick="window._LW_dicePicker()" title="Dice style" style="min-height:48px;padding:10px 12px;font-size:0.7rem;font-family:Georgia,serif;background:linear-gradient(180deg,rgba(200,168,75,0.25),rgba(160,130,55,0.35));border:1px solid rgba(200,168,75,0.55);color:#f5ebd0;border-radius:6px;cursor:pointer;">🎲 Style</button>';
      h+='</div></div>';
      // Single stable dice grid (Stephen 2026-06-28): all 6 dice ALWAYS occupy
      // fixed slots. Held dice get a glowing box + lift IN PLACE — no separate,
      // smaller tray, so holding a die never reflows/resizes the layout.
      h+='<div style="background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.45) 100%);border:1px solid rgba(0,0,0,0.55);border-radius:10px;padding:10px;margin-bottom:6px;box-shadow:inset 0 2px 8px rgba(0,0,0,0.55);min-height:120px;">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;min-height:14px;">';
      h+='<div style="font-family:Georgia,serif;font-size:0.75rem;letter-spacing:0.18em;color:rgba(232,220,200,0.62);text-transform:uppercase;">'+(turn>0?'Kept dice glow \u00b7 tap to release':'Roll \u00b7 then tap dice to keep')+'</div>';
      if(turn>0)h+='<div style="font-family:Georgia,serif;font-size:0.7rem;color:rgba(232,220,200,0.7);flex-shrink:0;">Locked: <strong style="color:#ffdc70;">'+turn+'</strong></div>';
      h+='</div>';
      h+='<div style="display:flex;gap:clamp(6px,2vw,10px);justify-content:center;flex-wrap:wrap;">';
      for(var i=0;i<6;i++){
        var held=kept[i];
        var roll=justRolled[i];
        var stagger=roll?'animation-delay:'+(i*60)+'ms;':'';
        var heldBox=held?'box-shadow:0 0 0 3px #ffb45a,0 0 14px rgba(255,180,90,0.55),inset 0 0 12px rgba(255,180,90,0.18);background:rgba(255,180,90,0.10);':'';
        h+='<div onclick="_FHold('+i+')" class="fDie'+(roll?' rolling':'')+(held?' held':'')+'" data-i="'+i+'" style="width:clamp(62px,17vw,88px);height:clamp(62px,17vw,88px);display:flex;align-items:center;justify-content:center;border-radius:clamp(8px,2.5vw,12px);cursor:'+(dice[i]?'pointer':'default')+';'+heldBox+stagger+'">';
        if(dice[i])h+=seedDie(dice[i]);
        else h+='<span style="display:block;width:10px;height:10px;border-radius:50%;background:rgba(255,180,90,0.28);box-shadow:0 0 6px rgba(255,180,90,0.25);"></span>';
        h+='</div>';
      }
      h+='</div></div>';
      var parts=scoreBreakdown();
      h+='<div style="min-height:30px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;align-items:center;margin-bottom:8px;">';
      if(parts.length){
        for(var bp=0;bp<parts.length;bp++){
          h+='<span style="font-family:Georgia,serif;font-size:0.7rem;color:#f5ebd0;background:rgba(0,0,0,0.35);border:1px solid rgba(255,180,120,0.25);border-radius:10px;padding:2px 8px;">'+parts[bp].label+' <strong style="color:#ffdc70;">+'+parts[bp].pts+'</strong></span>';
        }
        h+='<span style="font-family:Georgia,serif;font-size:0.7rem;color:#fff0d6;background:linear-gradient(180deg,rgba(255,180,90,0.25),rgba(200,130,60,0.25));border:1px solid #ffb45a;border-radius:10px;padding:2px 10px;font-weight:700;">Turn '+liveTurn()+'</span>';
      }
      h+='</div>';
      // Final round banner
      if(finalRound && !gameOver){
        h+='<div class="fFinal" style="margin-top:6px;padding:7px 12px;background:linear-gradient(180deg,rgba(255,180,90,0.22),rgba(200,130,60,0.18));border:1.5px solid #ffb45a;border-radius:8px;text-align:center;font-family:Georgia,serif;font-size:0.72rem;color:#fff0d6;letter-spacing:0.05em;">⚠ FINAL ROUND · P'+(finalStart+1)+' hit '+target+'</div>';
      }
      // ── OVERLAYS ─────────────────────────────────────────────────
      if(overlay && overlay.kind==='hot'){
        h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,140,60,0.42) 0%,rgba(30,10,5,0.95) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:fFadeIn 0.2s ease-out;">';
        h+='<div style="font-size:5rem;line-height:1;margin-bottom:12px;animation:fHotFlash 0.7s cubic-bezier(.18,1.4,.3,1);filter:drop-shadow(0 0 30px rgba(255,140,60,0.9));">🔥</div>';
        h+='<div style="font-family:Georgia,serif;font-size:2.8rem;font-weight:700;color:#ffb45a;letter-spacing:0.06em;text-shadow:0 0 30px rgba(255,140,60,0.9);text-align:center;animation:fHotFlash 0.7s cubic-bezier(.18,1.4,.3,1);">HOT DICE!</div>';
        h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:1rem;color:#fff0d6;margin-top:10px;animation:fLineIn 0.5s ease-out 0.4s both;">+'+overlay.pts+' locked · rolling all six</div>';
        h+='</div>';
      }
      if(overlay && overlay.kind==='farkle'){
        h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(60,20,10,0.45) 0%,rgba(10,5,5,0.96) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:fFadeIn 0.28s ease-out;">';
        h+='<div style="font-size:4.2rem;line-height:1;margin-bottom:14px;animation:fFarkleShake 0.7s ease-out;filter:drop-shadow(0 0 22px rgba(200,80,60,0.75));">🍂</div>';
        h+='<div style="font-family:Georgia,serif;font-size:2.4rem;font-weight:700;color:#e86a4a;letter-spacing:0.08em;text-shadow:0 0 26px rgba(230,90,60,0.75);animation:fFarkleShake 0.7s ease-out;">FARKLE</div>';
        h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.95rem;color:#e8dcc8;margin-top:10px;animation:fLineIn 0.5s ease-out 0.4s both;">'+(overlay.lost>0?'Lost '+overlay.lost+' from this turn':'No scoring dice this roll')+'</div>';
        h+='</div>';
      }
      if(overlay && overlay.kind==='gameover'){
        h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,'+(overlay.won?'rgba(255,180,90,0.32)':'rgba(60,30,20,0.4)')+' 0%,rgba(20,10,5,0.96) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:fFadeIn 0.4s ease-out;">';
        h+='<div style="font-size:'+(overlay.won?'4.5rem':'3rem')+';line-height:1;margin-bottom:10px;filter:drop-shadow(0 0 22px '+(overlay.won?'rgba(255,180,90,0.75)':'rgba(140,100,80,0.6)')+');">'+(overlay.won?'🏆':'🌱')+'</div>';
        h+='<div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:700;color:'+(overlay.won?'#ffb45a':'#f5ebd0')+';letter-spacing:0.04em;margin-bottom:18px;">'+(overlay.won?'VICTORY':'GAME OVER')+'</div>';
        h+='<div style="display:flex;flex-direction:column;gap:8px;max-width:340px;width:90%;">';
        for(var li=0;li<overlay.lines.length;li++){
          if(li>=overlay.lineIdx){h+='<div style="height:36px;"></div>';continue;}
          var line=overlay.lines[li];
          var big=line.big;
          h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:'+(big?'linear-gradient(180deg,rgba(255,180,90,0.2),rgba(255,180,90,0.05))':'rgba(0,0,0,0.42)')+';border:1px solid '+(big?'#ffb45a':'rgba(232,220,200,0.25)')+';border-radius:8px;font-family:Georgia,serif;animation:fLineIn 0.45s cubic-bezier(.2,1.4,.3,1);">';
          h+='<span style="font-style:italic;font-size:0.78rem;color:#f5ebd0;">'+line.label+'</span>';
          h+='<span style="font-weight:'+(big?'700':'400')+';font-size:'+(big?'1.5rem':'0.95rem')+';color:'+(line.color||'#f5ebd0')+';">'+line.value+(line.medal?' '+(window._lwEmojiSprite&&window._LW_EMOJI_SPRITES&&window._LW_EMOJI_SPRITES[line.medal]?window._lwEmojiSprite(line.medal,28):line.medal):'')+'</span>';
          h+='</div>';
        }
        h+='</div>';
        if(overlay.lineIdx>overlay.lines.length){
          h+='<button class="gb" onclick="_FN()" style="margin-top:18px;min-height:48px;padding:8px 22px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:fLineIn 0.5s ease-out;">↻ Play Again</button>';
        }
        h+='</div>';
      }
      pan.innerHTML=h;
    }
    window._FNP=function(n){numPlayers=n;_play('tap');_FN()};
    window._FHold=function(x){if(!dice[x]||gameOver||busted||rolling)return;_play('tap');kept[x]=!kept[x];rn();};
    function nextPlayer(){turn=0;kept=new Array(6).fill(false);dice=new Array(6).fill(0);justRolled=new Array(6).fill(false);busted=false;rolling=false;if(finalRound){curP=(curP+1)%players.length;if(curP===finalStart){endGame();return}}else{curP=(curP+1)%players.length}rn();sm('P'+(curP+1)+", 🎲 Roll")}
    function endGame(){
      gameOver=true;
      var best=-1,winner=0;for(var i=0;i<players.length;i++)if(players[i].banked>best){best=players[i].banked;winner=i}
      _play('win');try{_playWin()}catch(e){}
      var prevBest=0;try{prevBest=(_gr()['farkle']||{}).b||0}catch(e){}
      var recScore=(winner===0)?best:players[0].banked;
      if(winner===0){_e('game_win');_sr('farkle',{w:true,s:best})}else{_e('game_loss');_sr('farkle',{w:false,s:players[0].banked})}
      var lines=[];
      if(players.length>1){
        for(var p=0;p<players.length;p++){
          var isW=p===winner;
          lines.push({label:'P'+(p+1)+(isW?' · winner':''),value:players[p].banked,color:isW?'#ffb45a':'#f5ebd0',medal:isW?(winner===0?'🏆':'🥇'):null});
        }
      }
      lines.push({label:players.length>1?'WINNING SCORE':'FINAL SCORE',value:best,color:'#ffb45a',big:true,medal:winner===0?'🏆':null});
      var isRec=recScore>prevBest;
      lines.push({label:isRec?'BEST · NEW RECORD':'BEST',value:isRec?recScore:prevBest,color:isRec?'#ffdc70':'#f5ebd0',medal:isRec?'🌟':null});
      overlay={kind:'gameover',lines:lines,won:winner===0,lineIdx:0};
      rn();
      (function(){
        var _rg=fGen;
        function reveal(){
          if(_rg!==fGen)return;
          if(!overlay)return;
          overlay.lineIdx++;
          if(overlay.lineIdx<=lines.length){_play('tap');rn();setTimeout(reveal,700);}
          else{rn();}
        }
        setTimeout(reveal,700);
      })();
    }
    window._FR=function(){
      if(rolling||busted||gameOver)return;rolling=true;
      var _rollG=fGen; // stale after ↻New / exit — kills this roll's whole timer chain
      justRolled=new Array(6).fill(false);
      var any=false;
      for(var i=0;i<6;i++)if(!kept[i]){dice[i]=Math.floor(Math.random()*6)+1;justRolled[i]=true;any=true}
      _play('dice');
      function collectRolledEls(){
        var els=[],vals=[];
        for(var k=0;k<6;k++){
          els.push(justRolled[k]?document.querySelector('.fDie[data-i="'+k+'"]'):null);
          vals.push(dice[k]);
        }
        return {els:els,vals:vals};
      }
      if(!any){
        // HOT DICE — lock points, reset kept, roll all six. Still tumble.
        var locked=score();
        turn+=locked;kept=new Array(6).fill(false);
        for(var j=0;j<6;j++){dice[j]=Math.floor(Math.random()*6)+1;justRolled[j]=true}
        rn();
        var hot=collectRolledEls();
        window._LW_tumble(hot.els,hot.vals,{duration:720,onDone:function(){
          if(_rollG!==fGen)return;
          overlay={kind:'hot',pts:locked};
          _play('win');_e('milestone');
          rn();
          setTimeout(function(){if(_rollG!==fGen)return;overlay=null;rolling=false;rn()},1500);
          setTimeout(function(){if(_rollG!==fGen)return;justRolled=new Array(6).fill(false)},420);
        }});
        return;
      }
      // Bust detection — runs on committed dice so we decide before the tumble
      // completes, but reveal only at settle.
      var ct=new Array(7).fill(0);for(var i2=0;i2<6;i2++)if(!kept[i2])ct[dice[i2]]++;
      var hct=new Array(7).fill(0);for(var i3=0;i3<6;i3++)if(kept[i3])hct[dice[i3]]++;
      var has=ct[1]>0||ct[5]>0;
      for(var v=1;v<=6;v++){if(ct[v]>=3)has=true;if(ct[v]>0&&hct[v]>=3)has=true;}
      rn();
      var rolled=collectRolledEls();
      if(!has){
        window._LW_tumble(rolled.els,rolled.vals,{duration:720,onDone:function(){
          if(_rollG!==fGen)return;
          busted=true;
          // Lost = turn points PLUS kept-dice score — the overlay used to say
          // "No scoring dice this roll" while 200 sat visibly kept behind it.
          var lost=(typeof liveTurn==='function')?liveTurn():turn;
          overlay={kind:'farkle',lost:lost};
          _play('lose');_e('game_loss');
          rn();
          setTimeout(function(){
            if(_rollG!==fGen)return;
            overlay=null;
            if(players.length>1)nextPlayer();
            else{
              // Solo bust used to leave busted/kept/dice set — Roll AND Bank
              // stayed disabled forever and only ↻New (which wipes the bank)
              // recovered. Reset the turn exactly like nextPlayer does.
              turn=0;kept=new Array(6).fill(false);dice=new Array(6).fill(0);
              justRolled=new Array(6).fill(false);busted=false;rolling=false;
              rn();sm('🎲 Roll');
            }
          },1700);
          setTimeout(function(){if(_rollG!==fGen)return;justRolled=new Array(6).fill(false)},420);
        }});
        return;
      }
      // Normal branch
      window._LW_tumble(rolled.els,rolled.vals,{duration:720,onDone:function(){
        if(_rollG!==fGen)return;
        rolling=false;
        justRolled=new Array(6).fill(false);
        rn();
      }});
    };
    window._FB=function(){
      // rolling in the guard: the bust is decided synchronously in _FR before
      // the 720ms tumble lands — a Bank tap mid-tumble used to dodge the
      // farkle and bank the turn anyway (2026-07-04 audit).
      if(rolling||busted||gameOver)return;
      var ts=score();
      if(ts+turn<=0){sm('Tap dice to keep first');return}
      var gained=ts+turn;players[curP].banked+=gained;_e('progress');
      if(players[curP].banked>=1000)_e('milestone');
      sm('P'+(curP+1)+' banked '+gained);
      if(players[curP].banked>=target&&!finalRound){
        finalRound=true;finalStart=curP;
        if(players.length===1){endGame();return}
        _play('win');
      }
      if(players.length>1){
        // Zero the turn + lock input for the handoff — extra Bank taps during
        // the 800ms window used to re-bank the same turn score. nextPlayer
        // resets rolling and the rest of the turn state.
        turn=0;kept=new Array(6).fill(false);rolling=true;rn();
        var _bg=fGen;setTimeout(function(){if(_bg!==fGen)return;nextPlayer()},800);
      }
      else{
        turn=0;kept=new Array(6).fill(false);dice=new Array(6).fill(0);justRolled=new Array(6).fill(false);
        if(players[curP].banked>=target)endGame();else rn();
      }
    };
    window._FN=function(){
      fGen++; // orphan any in-flight tumble/bank/reveal timers
      dice=new Array(6).fill(0);kept=new Array(6).fill(false);justRolled=new Array(6).fill(false);
      turn=0;rolling=false;busted=false;curP=0;gameOver=false;finalRound=false;finalStart=-1;overlay=null;
      players=[];for(var i=0;i<numPlayers;i++)players.push({banked:0});
      sm(numPlayers>1?('P1, 🎲 Roll (first to '+target+')'):'🎲 Roll');
      rn();
    };
    // Re-render on dice-style change. Self-unregisters once the game is gone.
    var _fStyleListener=function(){
      if(!document.body.contains(a)){window.removeEventListener('lw-dice-style-change',_fStyleListener);return;}
      try{rn();}catch(e){}
    };
    window.addEventListener('lw-dice-style-change',_fStyleListener);
    if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){fGen++;window.removeEventListener('lw-dice-style-change',_fStyleListener);});
    _FN();
  }

  window._gameFns['farkle']=GF;
})();
