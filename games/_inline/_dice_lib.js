/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Shared dice library (copy from index.html
 * lines 65911-66010). Provides window.LW_DICE + window._LW_tumble +
 * window._LW_dicePicker + window._LW_diceSelect. Required by the dice
 * games (farkle, yahtzee, doubleshutter) when loaded standalone.
 *
 * DUPLICATE, NEVER MOVE. Keep in sync with index.html via
 * scripts/extract_inline_games.js (re-runs extract on demand).
 * ════════════════════════════════════════════════════════════════════ */
window.LW_DICE={
  sets:{
    parchment:{name:'Parchment Botanical',  sub:'seed · dew · clover · sun',  path:'assets/dice/d'},
    dark:     {name:'Dark Garden',          sub:'peonies · skulls · crescent',path:'assets/dice/dark/d'}
  },
  get:function(){
    try{var s=localStorage.getItem('lw_dice_style');if(s&&this.sets[s])return s;}catch(e){}
    return 'parchment';
  },
  set:function(k){
    if(!this.sets[k])return;
    try{localStorage.setItem('lw_dice_style',k);}catch(e){}
    window.dispatchEvent(new CustomEvent('lw-dice-style-change',{detail:{key:k}}));
  },
  face:function(n){return this.sets[this.get()].path+n+'.png';}
};

// Modal picker — grid of set previews (d6 face as the thumbnail), tap to select.
window._LW_dicePicker=function(){
  var existing=document.getElementById('LWdpOV');
  if(existing){existing.remove();return;}
  var cur=window.LW_DICE.get();
  var ov=document.createElement('div');ov.id='LWdpOV';
  ov.style.cssText='position:fixed;inset:0;z-index:200000;background:rgba(5,8,4,0.9);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px;animation:panelFadeIn 0.25s ease;';
  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
  var h='<div style="max-width:480px;width:100%;max-height:84vh;overflow-y:auto;padding:22px 20px 18px;background:linear-gradient(180deg,rgba(18,22,14,0.98),rgba(10,12,8,0.98));border:1.5px solid rgba(200,168,75,0.35);border-radius:14px;box-shadow:0 32px 64px rgba(0,0,0,0.7);">';
  h+='<div style="text-align:center;margin-bottom:14px;"><div style="font-family:Playfair Display,serif;font-style:italic;font-size:1.15rem;color:var(--cream);">Dice Style</div><div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;">choose a set for every dice game</div></div>';
  var keys=Object.keys(window.LW_DICE.sets);
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">';
  for(var i=0;i<keys.length;i++){
    var k=keys[i],s=window.LW_DICE.sets[k];
    var isOn=(k===cur);
    var ring=isOn?'2px solid var(--gold)':'1px solid rgba(200,168,75,0.18)';
    var glow=isOn?'box-shadow:0 0 14px rgba(200,168,75,0.35),0 4px 12px rgba(0,0,0,0.5);':'';
    h+='<div onclick="window._LW_diceSelect(\''+k+'\')" style="cursor:pointer;border:'+ring+';'+glow+'border-radius:12px;padding:10px;background:#0a0c08;display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform 0.15s ease;" onmousedown="this.style.transform=\'scale(0.97)\'" onmouseup="this.style.transform=\'\'" onmouseleave="this.style.transform=\'\'">';
    h+='<img src="'+s.path+'6.png" alt="'+s.name+'" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;background:#0a0c08;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.08em;color:'+(isOn?'var(--gold)':'var(--cream)')+';text-align:center;">'+s.name+(isOn?' ✓':'')+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.5rem;color:var(--muted);letter-spacing:0.05em;text-align:center;line-height:1.3;">'+s.sub+'</div>';
    h+='</div>';
  }
  h+='</div>';
  h+='<div style="text-align:center;margin-top:16px;"><button class="gb" onclick="document.getElementById(\'LWdpOV\').remove()" style="min-height:48px;padding:10px 22px;">CLOSE</button></div>';
  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};
window._LW_diceSelect=function(k){
  window.LW_DICE.set(k);
  var ov=document.getElementById('LWdpOV');if(ov)ov.remove();
};

// ═══ SHARED DICE ROLL (Farkle / Yahtzee / Double Shutter) ═══
// Stephen's gripe with the old animation: the face committed BEFORE the spin,
// so you saw the outcome during the tumble and it felt rigged. This helper
// decouples COMMIT from DISPLAY — the game logic gets its final value right
// away (so bust detection etc. runs clean), but the player sees the <img>
// cycle through random faces and only settle on the final face at the end.
// Tick interval decelerates (snappy at the start, heavier at the settle)
// which reads as a real tumble instead of a metronome flicker.
//
// _LW_tumble(elements, finalValues, {duration, face, onDone})
//   elements:    array of die DOM nodes (each contains an <img>)
//                null entries are skipped (e.g. held dice)
//   finalValues: parallel array of committed 1-6 values
//   opts.duration: total ms (default 720)
//   opts.face:     url-builder: face(n) -> 'assets/dice/d'+n+'.png' by default.
//                  games can override for themed sets per game.
//   opts.onDone:   callback fired after the final face is locked in
window._LW_tumble=function(elements,finalValues,opts){
  opts=opts||{};
  var duration=opts.duration||720;
  // Stephen 2026-06-28: the default used to hardcode the parchment set, so if
  // the player picked a different dice style the TUMBLE showed the wrong skin
  // and only the final settled face matched ("it showed the other kind of dice
  // rolling before the result"). Default to a LIVE current-style lookup so the
  // tumbling faces always match the selected set in every dice game.
  var faceUrl=opts.face||function(n){return (window.LW_DICE&&window.LW_DICE.face)?window.LW_DICE.face(n):'assets/dice/d'+n+'.png';};
  var start=Date.now();
  function setFace(i,val){
    var el=elements[i];if(!el)return;
    var img=el.querySelector('img');
    if(img)img.src=faceUrl(val);
  }
  function tick(){
    var elapsed=Date.now()-start;
    if(elapsed>=duration){
      for(var i=0;i<elements.length;i++)setFace(i,finalValues[i]);
      if(opts.onDone)opts.onDone();
      return;
    }
    // Each rolling die gets a fresh random face. Keep them out of sync by
    // occasionally skipping a die so they don't flicker in lockstep.
    for(var i=0;i<elements.length;i++){
      if(!elements[i])continue;
      if(Math.random()<0.12)continue;
      setFace(i,Math.floor(Math.random()*6)+1);
    }
    // Ease-out: ticks start at ~55ms and push toward ~180ms as the tumble
    // slows down. Quadratic easing so the deceleration is pronounced.
    var frac=elapsed/duration;
    var nextDelay=55+frac*frac*135;
    setTimeout(tick,nextDelay);
  }
  tick();
};
