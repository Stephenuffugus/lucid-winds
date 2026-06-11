/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: yahtzee
 *
 * COPY of the inline GY mount function from index.html
 * lines 66381-66698.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/yahtzee.html shell only. To keep them aligned,
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

  function GY(a){var dice=[0,0,0,0,0],kept=new Array(5).fill(false),rolls=0,turn=1,scores={},justRolled=new Array(5).fill(false);
    // Takeover overlay state. {kind:'yahtzee'|'gameover', ...}
    var overlay=null;
    // Inject Yahtzee keyframes once.
    if(!document.getElementById('y-anim-style')){
      var _ys=document.createElement('style');_ys.id='y-anim-style';
      _ys.textContent=
        '@keyframes yDieRoll{0%{transform:rotate(0) scale(1)}30%{transform:rotate(180deg) scale(0.9)}60%{transform:rotate(360deg) scale(1.1)}82%{transform:rotate(540deg) scale(1.08)}100%{transform:rotate(540deg) scale(1)}}'+
        '@keyframes yDieLift{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-6px) scale(0.96)}}'+
        '.yDie.rolling{animation:yDieRoll 0.85s cubic-bezier(.18,.7,.3,1) both;}'+
        '.yDie.held{transform:translateY(-6px) scale(0.96);filter:saturate(0.85);}'+
        /* Yahtzee/Seed Shaker: cool sage cast so the dice sit against the green pan */
        '.yDie img{filter:hue-rotate(-6deg) saturate(0.9) brightness(1.05) drop-shadow(0 2px 3px rgba(0,0,0,0.4));}'+
        '@keyframes yBestPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,220,112,0.4),inset 0 1px 0 rgba(255,255,255,0.08)}50%{box-shadow:0 0 12px rgba(255,220,112,0.55),inset 0 1px 0 rgba(255,255,255,0.12)}}'+
        '.yBestPulse{animation:yBestPulse 1.4s ease-in-out infinite;}'+
        '@keyframes yYahtzeeIn{0%{opacity:0}100%{opacity:1}}'+
        '@keyframes yYahtzeeSlam{0%{transform:scale(0.3) rotate(-8deg);opacity:0}45%{transform:scale(1.25) rotate(2deg);opacity:1}70%{transform:scale(0.96) rotate(-1deg);opacity:1}100%{transform:scale(1) rotate(0);opacity:1}}'+
        '@keyframes yEndPop{0%{transform:translateY(40px) scale(0.7);opacity:0}55%{transform:translateY(-6px) scale(1.08);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}'+
        '@keyframes yLineIn{0%{transform:translateX(-12px);opacity:0}100%{transform:translateX(0);opacity:1}}';
      document.head.appendChild(_ys);
    }
    // Botanical dice — paper-card PNGs (seed/dew/clover/sun/flower/moon).
    // Routes through LW_DICE so the style picker swaps all games at once.
    function seedDie(n){
      return '<img src="'+window.LW_DICE.face(n)+'" alt="'+n+'" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none;border-radius:clamp(6px,2vw,12px)" draggable="false"/>';
    }
    var CATS=[
      {name:'Ones',sub:'Sprouts',icon:'&#x1F331;',desc:'Sum of 1s'},
      {name:'Twos',sub:'Twin Leaf',icon:'&#x1F33F;',desc:'Sum of 2s'},
      {name:'Threes',sub:'Trillium',icon:'&#x2618;',desc:'Sum of 3s'},
      {name:'Fours',sub:'Clover',icon:'&#x1F340;',desc:'Sum of 4s'},
      {name:'Fives',sub:'Star Bloom',icon:'&#x2B50;',desc:'Sum of 5s'},
      {name:'Sixes',sub:'Hex Petal',icon:'&#x1F33A;',desc:'Sum of 6s'},
      {name:'3 of a Kind',sub:'Cluster',icon:'&#x1F33E;',desc:'Sum of all dice'},
      {name:'4 of a Kind',sub:'Grove',icon:'&#x1F332;',desc:'Sum of all dice'},
      {name:'Full House',sub:'Full Canopy',icon:'&#x1F333;',desc:'Three + a pair = 25'},
      {name:'Small Straight',sub:'Trail',icon:'&#x1F6A4;',desc:'4 in a row = 30'},
      {name:'Large Straight',sub:'River',icon:'&#x1F30A;',desc:'5 in a row = 40'},
      {name:'Bloom',sub:'5 of a Kind',icon:'&#x2728;',desc:'All 5 match = 50'},
      {name:'Chance',sub:'Wild Growth',icon:'&#x1F3B2;',desc:'Sum of all dice'}
    ];
    ms(a,'<span style="font-family:Georgia,serif;letter-spacing:.06em;">🎲 Turn <strong id="Yt" style="color:#7ab356;font-size:1.2em;">1</strong>/13 &middot; Roll <strong id="Yr" style="color:#ffdc70;font-size:1.2em;">0</strong>/3</span>');mm(a);
    // Felted pan — rolls + scoresheet inside a single dark-forest table.
    var pan=document.createElement('div');pan.id='Ypan';
    var _Y_FELT="data:image/svg+xml;utf8,"+encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">'
        +'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="17"/>'
        +'<feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 .08 0"/></filter>'
        +'<rect width="100%" height="100%" filter="url(#n)"/>'
      +'</svg>'
    );
    pan.style.cssText='max-width:min(96vw,560px);margin:0 auto;padding:6px 14px 14px;user-select:none;box-sizing:border-box;'
      +'background:'
        +'url("'+_Y_FELT+'"),'
        +'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.05) 0%,transparent 50%),'
        +'radial-gradient(circle at 50% 100%,rgba(0,0,0,0.3) 0%,transparent 65%),'
        +'linear-gradient(135deg,#1f3818 0%,#162a11 55%,#0e1d09 100%);'
      +'background-size:180px 180px, auto, auto, auto;'
      +'border-radius:14px;'
      +'border:2px solid #6b4520;'
      +'box-shadow:'
        +'inset 0 0 0 1px rgba(180,140,70,0.25),'
        +'inset 0 0 38px rgba(0,0,0,0.45),'
        +'0 6px 22px rgba(0,0,0,0.6);';
    a.appendChild(pan);
    // mc empty — controls go inside pan.
    mc(a);
    // Scoring logic
    function cs(cat){
      var c=new Array(7).fill(0);dice.forEach(function(d){c[d]++});
      var sum=dice.reduce(function(a,b){return a+b},0);
      if(cat<6)return c[cat+1]*(cat+1);
      if(cat===6){for(var v=1;v<=6;v++)if(c[v]>=3)return sum;return 0}
      if(cat===7){for(var v=1;v<=6;v++)if(c[v]>=4)return sum;return 0}
      if(cat===8){var h3=false,h2=false;for(var v=1;v<=6;v++){if(c[v]===3)h3=true;if(c[v]===2)h2=true}return h3&&h2?25:0}
      if(cat===9){var s=[];for(var v=1;v<=6;v++)if(c[v])s.push(v);s.sort(function(a,b){return a-b});var str=s.join('');return str.indexOf('1234')>-1||str.indexOf('2345')>-1||str.indexOf('3456')>-1?30:0}
      if(cat===10){var s=[];for(var v=1;v<=6;v++)if(c[v])s.push(v);return s.length===5&&s[4]-s[0]===4?40:0}
      if(cat===11){for(var v=1;v<=6;v++)if(c[v]===5)return 50;return 0}
      return sum;
    }
    function rn(){
      var h='';
      // Roll status + controls bar at top.
      h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.7rem;color:rgba(232,220,200,0.65);">'+(rolls===0?'Tap ROLL to begin':rolls===3?'Pick a category':'Tap dice to keep')+'</div>';
      h+='<div style="display:flex;gap:6px;">';
      h+='<button class="gb" onclick="_YR()" '+(rolls>=3?'disabled':'')+' style="display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:10px 16px;font-size:0.7rem;background:'+(rolls>=3?'rgba(0,0,0,0.4)':'linear-gradient(180deg,rgba(255,220,112,0.3),rgba(200,168,75,0.4))')+';border:'+(rolls>=3?'1px solid rgba(232,220,200,0.25)':'2px solid #ffdc70')+';color:'+(rolls>=3?'rgba(232,220,200,0.4)':'#f5ebd0')+';font-family:Georgia,serif;'+(rolls>=3?'cursor:not-allowed;':'cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 2px 5px rgba(0,0,0,0.5);')+'">🎲 Roll '+(rolls<3?'('+(3-rolls)+' left)':'done')+'</button>';
      h+='<button class="gb" onclick="_YN()" title="New game" style="display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:10px 14px;font-size:0.62rem;background:linear-gradient(180deg,rgba(122,179,86,0.3),rgba(74,124,53,0.4));border:1px solid rgba(122,179,86,0.55);color:#f5ebd0;font-family:Georgia,serif;">↻ New</button>';
      h+='<button class="gb" onclick="window._LW_dicePicker()" title="Dice style" style="display:inline-flex;align-items:center;gap:5px;min-height:44px;padding:10px 14px;font-size:0.62rem;background:linear-gradient(180deg,rgba(200,168,75,0.25),rgba(160,130,55,0.35));border:1px solid rgba(200,168,75,0.55);color:#f5ebd0;font-family:Georgia,serif;">🎲 Style</button>';
      h+='</div>';
      h+='</div>';
      // Roll area — dice that are NOT held. Felted pocket inset.
      h+='<div style="background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.4) 100%);border:1px solid rgba(0,0,0,0.5);border-radius:10px;padding:10px;margin-bottom:6px;box-shadow:inset 0 2px 8px rgba(0,0,0,0.5);min-height:120px;">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.18em;color:rgba(232,220,200,0.45);text-align:center;text-transform:uppercase;margin-bottom:6px;">Roll Area</div>';
      h+='<div style="display:flex;gap:clamp(6px,2vw,12px);justify-content:center;flex-wrap:wrap;">';
      var anyRolling=false, anyInRoll=false;
      for(var i=0;i<5;i++){
        if(kept[i])continue;
        anyInRoll=true;
        var rolling=justRolled[i];
        if(rolling)anyRolling=true;
        var stagger = rolling ? ('animation-delay:'+(i*60)+'ms;') : '';
        h+='<div onclick="_YHold('+i+')" class="yDie'+(rolling?' rolling':'')+'" data-i="'+i+'" style="width:clamp(78px,22vw,108px);height:clamp(78px,22vw,108px);display:flex;align-items:center;justify-content:center;border-radius:clamp(10px,3vw,14px);cursor:'+(dice[i]?'pointer':'default')+';'+stagger+'">';
        if(dice[i])h+=seedDie(dice[i]);
        else h+='<span style="font-size:2rem;color:rgba(232,220,200,0.25);">·</span>';
        h+='</div>';
      }
      if(!anyInRoll){
        h+='<div style="font-family:Georgia,serif;font-style:italic;color:rgba(232,220,200,0.45);align-self:center;padding:30px;">All dice held, score it</div>';
      }
      h+='</div></div>';
      // Held tray — dice the player is keeping. Smaller, slightly tinted.
      var anyHeld=false;
      for(var hi=0;hi<5;hi++)if(kept[hi]){anyHeld=true;break;}
      if(anyHeld||rolls>0){
        h+='<div style="background:linear-gradient(180deg,rgba(180,140,70,0.18),rgba(120,90,40,0.25));border:1px solid rgba(220,180,120,0.3);border-radius:8px;padding:8px;margin-bottom:8px;box-shadow:inset 0 1px 0 rgba(255,220,140,0.1),0 2px 4px rgba(0,0,0,0.4);">';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;letter-spacing:0.18em;color:#ffdc70;text-align:center;text-transform:uppercase;margin-bottom:6px;">Held, '+(anyHeld?'tap to release':'tap a die above to keep')+'</div>';
        h+='<div style="display:flex;gap:8px;justify-content:center;min-height:54px;align-items:center;">';
        for(var hj=0;hj<5;hj++){
          if(!kept[hj])continue;
          h+='<div onclick="_YHold('+hj+')" class="yDie held" style="width:clamp(48px,14vw,64px);height:clamp(48px,14vw,64px);display:flex;align-items:center;justify-content:center;border-radius:clamp(6px,2vw,10px);cursor:pointer;">';
          h+=seedDie(dice[hj]);
          h+='</div>';
        }
        if(!anyHeld)h+='<span style="font-family:Georgia,serif;font-style:italic;font-size:0.65rem;color:rgba(245,235,208,0.5);">none</span>';
        h+='</div></div>';
      }
      // Scorecard
      h+='<div id="Ysc"></div>';
      // ── OVERLAYS ────────────────────────────────────────────────
      if(overlay && overlay.kind==='yahtzee'){
        h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,220,112,0.35) 0%,rgba(10,5,20,0.95) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:yYahtzeeIn 0.2s ease-out;">';
        h+='<div style="font-size:5.5rem;line-height:1;margin-bottom:14px;animation:yYahtzeeSlam 0.7s cubic-bezier(.18,1.5,.3,1);filter:drop-shadow(0 0 30px rgba(255,220,112,0.85));">🌟</div>';
        h+='<div style="font-family:Georgia,serif;font-size:3rem;font-weight:700;color:#ffdc70;letter-spacing:0.06em;text-shadow:0 0 32px rgba(255,220,112,0.9);text-align:center;animation:yYahtzeeSlam 0.7s cubic-bezier(.18,1.5,.3,1);">YAHTZEE!</div>';
        h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:1rem;color:#f5ebd0;margin-top:10px;animation:yLineIn 0.5s ease-out 0.4s both;">Five of a kind &middot; +50</div>';
        h+='</div>';
      }
      if(overlay && overlay.kind==='gameover'){
        h+='<div style="position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,'+(overlay.won?'rgba(255,220,112,0.3)':'rgba(60,40,100,0.4)')+' 0%,rgba(10,5,20,0.96) 70%);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;animation:yYahtzeeIn 0.4s ease-out;">';
        h+='<div style="font-size:'+(overlay.won?'4.5rem':'3rem')+';line-height:1;margin-bottom:10px;animation:yEndPop 0.9s cubic-bezier(.18,1.4,.3,1);filter:drop-shadow(0 0 24px '+(overlay.won?'rgba(255,220,112,0.7)':'rgba(140,100,200,0.6)')+');">'+(overlay.won?'🏆':'🌱')+'</div>';
        h+='<div style="font-family:Georgia,serif;font-size:1.6rem;font-weight:700;color:'+(overlay.won?'#ffdc70':'#f5ebd0')+';letter-spacing:0.04em;text-shadow:0 0 22px '+(overlay.won?'rgba(255,220,112,0.7)':'rgba(0,0,0,0.6)')+';margin-bottom:18px;">'+(overlay.won?'GREAT GAME':'GAME OVER')+'</div>';
        h+='<div style="display:flex;flex-direction:column;gap:8px;max-width:340px;width:90%;">';
        for(var li=0;li<overlay.lines.length;li++){
          var line=overlay.lines[li];
          var visible=li<overlay.lineIdx;
          if(!visible){h+='<div style="height:36px;"></div>';continue;}
          var size=line.big?'1.6rem':'0.95rem';
          var weight=line.big?'700':'400';
          var bg=line.big?'linear-gradient(180deg,rgba(255,220,112,0.18),rgba(255,220,112,0.05))':'rgba(0,0,0,0.4)';
          var bdr=line.big?'#ffdc70':'rgba(232,220,200,0.25)';
          h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:'+bg+';border:1px solid '+bdr+';border-radius:8px;font-family:Georgia,serif;animation:yLineIn 0.45s cubic-bezier(.2,1.4,.3,1);">';
          h+='<span style="font-style:italic;font-size:0.78rem;color:#f5ebd0;letter-spacing:0.04em;">'+line.label+'</span>';
          h+='<span style="font-weight:'+weight+';font-size:'+size+';color:'+(line.color||'#f5ebd0')+';text-shadow:0 1px 2px rgba(0,0,0,0.6);">'+line.value+(line.medal?' '+(window._lwEmojiSprite&&window._LW_EMOJI_SPRITES&&window._LW_EMOJI_SPRITES[line.medal]?window._lwEmojiSprite(line.medal,28):line.medal):'')+'</span>';
          h+='</div>';
        }
        h+='</div>';
        // CTA after all lines reveal.
        if(overlay.lineIdx>overlay.lines.length){
          h+='<button class="gb" onclick="_YN()" style="margin-top:18px;min-height:46px;padding:8px 22px;font-family:Georgia,serif;font-weight:700;font-size:0.85rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:8px;letter-spacing:0.05em;cursor:pointer;animation:yLineIn 0.5s ease-out;">↻ Play Again</button>';
        }
        h+='</div>';
      }
      pan.innerHTML=h;
      rnS();
    }
    // Click handler exposed via window for inline onclick.
    window._YHold=function(x){if(rolls===0||rolls>=3)return;if(!dice[x])return;_play('tap');kept[x]=!kept[x];rn();};
    function rnS(){
      // Best-play detection — among unfilled cats with rolls>0, find highest score.
      var bestIdx=-1, bestVal=0;
      if(rolls>0){
        for(var bi=0;bi<13;bi++){
          if(scores[bi]!==undefined)continue;
          var bv=cs(bi);
          if(bv>bestVal){bestVal=bv;bestIdx=bi;}
        }
      }
      function row(i){
        var done=scores[i]!==undefined;
        var val=done?scores[i]:(rolls>0?cs(i):null);
        var canScore=!done&&rolls>0;
        var isBest = canScore && i===bestIdx && bestVal>0;
        var rowBg = done ? 'rgba(0,0,0,0.45)' : isBest ? 'linear-gradient(180deg,rgba(255,220,112,0.16),rgba(200,168,75,0.08))' : 'rgba(0,0,0,0.3)';
        var rowBorder = done ? '1px solid rgba(232,220,200,0.15)' : isBest ? '1.5px solid #ffdc70' : '1px solid rgba(232,220,200,0.18)';
        var animCls = isBest ? 'yBestPulse' : '';
        var rs='';
        if(done){
          rs = '<span style="font-family:Georgia,serif;font-weight:700;font-size:0.95rem;color:rgba(232,220,200,0.45);">'+val+'</span>';
        } else if(canScore){
          if(val>0){
            var c = isBest ? '#ffdc70' : '#7ab356';
            rs = '<span style="font-family:Georgia,serif;font-weight:700;font-size:'+(isBest?'1.15rem':'0.95rem')+';color:'+c+';">'+val+'</span>';
          } else {
            rs = '<span style="font-family:DM Mono,monospace;font-size:0.7rem;color:rgba(230,57,70,0.55);">0</span>';
          }
        } else {
          rs = '<span style="color:rgba(232,220,200,0.3);font-family:DM Mono,monospace;font-size:0.65rem;">, </span>';
        }
        var clickAttr = canScore ? 'onclick="_YS('+i+')" style="cursor:pointer;' : 'style="';
        return '<div class="'+animCls+'" '+clickAttr+'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;margin:2px 0;background:'+rowBg+';border:'+rowBorder+';border-radius:6px;'+(done?'opacity:0.62;':'')+'">'
          +'<div style="display:flex;align-items:center;gap:8px;min-width:0;">'
            +'<span style="font-size:1rem;line-height:1;flex-shrink:0;">'+CATS[i].icon+'</span>'
            +'<div style="min-width:0;">'
              +'<div style="font-family:Georgia,serif;font-size:0.75rem;font-weight:700;color:#f5ebd0;line-height:1.1;">'+CATS[i].name+'</div>'
              +'<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:rgba(232,220,200,0.55);letter-spacing:0.06em;line-height:1.1;margin-top:1px;">'+CATS[i].desc+'</div>'
            +'</div>'
          +'</div>'
          +'<div style="flex-shrink:0;text-align:right;min-width:42px;">'+rs+'</div>'
        +'</div>';
      }
      var h='';
      // ── UPPER SECTION header + bonus tracker bar ─────────────────
      var upperSum=0;for(var i=0;i<6;i++)if(scores[i]!==undefined)upperSum+=scores[i];
      var bonus=upperSum>=63?35:0;
      var pct=Math.min(100,Math.round(upperSum/63*100));
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0 4px;padding:0 4px;">';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:#7ab356;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">Upper</div>';
      h+='<div style="font-family:Georgia,serif;font-style:italic;font-size:0.62rem;color:'+(bonus?'#ffdc70':'rgba(232,220,200,0.55)')+';">'+(bonus?'BONUS +35':upperSum+' / 63 to bonus')+'</div>';
      h+='</div>';
      // Bonus progress bar
      h+='<div style="height:4px;background:rgba(0,0,0,0.5);border-radius:2px;margin:0 4px 6px;overflow:hidden;border:1px solid rgba(0,0,0,0.5);">';
      h+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#7ab356,'+(bonus?'#ffdc70':'#a8d873')+');transition:width .4s;'+(bonus?'box-shadow:0 0 8px #ffdc7088;':'')+'"></div>';
      h+='</div>';
      for(var i=0;i<6;i++)h+=row(i);
      // ── LOWER SECTION ────────────────────────────────────────────
      h+='<div style="margin:10px 0 4px;padding:0 4px;font-family:DM Mono,monospace;font-size:0.55rem;color:#dc8a8a;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">Lower</div>';
      for(var i=6;i<13;i++)h+=row(i);
      // ── TOTAL ────────────────────────────────────────────────────
      var total=bonus;for(var k in scores)total+=scores[k];
      h+='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;margin-top:10px;background:linear-gradient(180deg,rgba(255,220,112,0.18),rgba(200,168,75,0.08));border:2px solid #ffdc70;border-radius:8px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.15),0 0 14px rgba(255,220,112,0.25);">';
      h+='<span style="font-family:Georgia,serif;font-weight:700;font-size:0.95rem;color:#f5ebd0;letter-spacing:0.04em;">TOTAL</span>';
      h+='<span style="font-family:Georgia,serif;font-weight:700;font-size:1.6rem;color:#ffdc70;text-shadow:0 1px 3px rgba(0,0,0,0.6);">'+total+'</span>';
      h+='</div>';
      document.getElementById('Ysc').innerHTML=h;
    }
    var yRolling=false;
    window._YR=function(){
      // Roll lock: rapid taps during the 720ms tumble used to burn rolls 2
      // and 3 with zero chance to set holds (Farkle has this guard; Yahtzee didn't).
      if(yRolling)return;
      if(rolls>=3){sm('Pick a category to score');return}
      yRolling=true;
      _play('dice');rolls++;document.getElementById('Yr').textContent=rolls;
      justRolled=new Array(5).fill(false);
      // On first roll, always re-roll all dice (ignore any pre-holds on the display dice)
      if(rolls===1){kept=new Array(5).fill(false);for(var i=0;i<5;i++){dice[i]=Math.floor(Math.random()*6)+1;justRolled[i]=true}}
      else{for(var i=0;i<5;i++)if(!kept[i]){dice[i]=Math.floor(Math.random()*6)+1;justRolled[i]=true}}
      rn();
      // Tumble-through-faces so the player doesn't see the final face during the spin.
      var els=[],vals=[];
      for(var k=0;k<5;k++){
        els.push(justRolled[k]?document.querySelector('.yDie[data-i="'+k+'"]'):null);
        vals.push(dice[k]);
      }
      window._LW_tumble(els,vals,{duration:720,onDone:function(){
        yRolling=false;
        justRolled=new Array(5).fill(false);
        rn();
      }});
    };
    window._YS=function(cat){
      if(!rolls||scores[cat]!==undefined)return;
      _play('snap');var v=cs(cat);scores[cat]=v;
      // YAHTZEE moment — five-of-a-kind into the Bloom slot for the full 50.
      var isYahtzee = (cat===11 && v===50);
      if(isYahtzee){
        _e('milestone');_playWin();
        overlay={kind:'yahtzee'};rn();
        setTimeout(function(){overlay=null;_advanceTurn(cat,v);},2400);
        return;
      }
      sm(CATS[cat].name+': +'+v+' pts');
      if(v>=25)_e('progress');
      _advanceTurn(cat,v);
    };
    function _advanceTurn(cat,v){
      turn++;document.getElementById('Yt').textContent=Math.min(turn,13);
      rolls=0;kept=new Array(5).fill(false);
      for(var _i=0;_i<5;_i++)dice[_i]=Math.floor(Math.random()*6)+1;
      document.getElementById('Yr').textContent='0';
      if(turn>13){
        // Build staged end-of-game lines.
        var upperSum=0;for(var i=0;i<6;i++)if(scores[i]!==undefined)upperSum+=scores[i];
        var bonus=upperSum>=63?35:0;
        var lowerSum=0;for(var j=6;j<13;j++)if(scores[j]!==undefined)lowerSum+=scores[j];
        var tot=upperSum+lowerSum+bonus;
        var won=tot>=150;
        if(won){_e('game_win');_playWin();}else{_e('game_loss');_play('lose');}
        _sr('yahtzee',{w:won,s:tot});
        var lines=[
          {label:'Upper section',value:upperSum,color:'#7ab356'},
          {label:'Upper bonus',value:bonus?'+35':'—',color:bonus?'#ffdc70':'rgba(232,220,200,0.4)'},
          {label:'Lower section',value:lowerSum,color:'#dc8a8a'},
          {label:'TOTAL',value:tot,color:'#ffdc70',big:true,medal:won?'🏆':null}
        ];
        overlay={kind:'gameover',lines:lines,won:won,tot:tot,lineIdx:0};
        rn();
        function reveal(){
          if(!overlay)return;
          overlay.lineIdx++;
          if(overlay.lineIdx<=lines.length){
            _play('tap');rn();
            setTimeout(reveal,800);
          }
        }
        setTimeout(reveal,700);
      }else if(turn%3===0)_e('milestone');
      rn();
    }
    window._YN=function(){dice=[];for(var _i=0;_i<5;_i++)dice.push(Math.floor(Math.random()*6)+1);kept=new Array(5).fill(false);rolls=0;turn=1;scores={};overlay=null;document.getElementById('Yt').textContent='1';document.getElementById('Yr').textContent='0';sm('Tap ROLL to begin!');rn()};
    // Re-render on dice-style change. Self-unregisters once the game is gone.
    var _yStyleListener=function(){
      if(!document.body.contains(a)){window.removeEventListener('lw-dice-style-change',_yStyleListener);return;}
      try{rn();}catch(e){}
    };
    window.addEventListener('lw-dice-style-change',_yStyleListener);
    _YN();
  }

  window._gameFns['yahtzee']=GY;
})();
