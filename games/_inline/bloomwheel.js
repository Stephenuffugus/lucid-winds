/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: bloomwheel
 *
 * COPY of the inline GBW mount function from index.html
 * lines 70285-70578.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/bloomwheel.html shell only. To keep them aligned,
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

  function GBW(a){
    var canvas,ctx,bufC,bufX,W,H,cx,cy,radius,dpr;
    var symmetry=8,bpm=90,spinOn=true,musicOn=false;
    var rotAngle=0,brushSize=3,brushSizes=[1,2,3,5,8,12,18,25],brushIdx=2;
    var drawing=false,lastX=0,lastY=0,strokes=0,startT=Date.now(),colorPh=0;
    var beatCount=0,activeBeat=0,aCtx=null,mGain=null,nextBT=0,beatInt=60/bpm,schTimer=null;
    var PAL=[{r:74,g:124,b:53},{r:122,g:179,b:86},{r:212,g:168,b:67},{r:232,g:220,b:200},{r:196,g:122,b:122},{r:91,g:155,b:213},{r:160,g:120,b:180},{r:74,g:124,b:53}];
  
    ms(a,'<span id="BWbpm">90 BPM</span> · <span id="BWsym">8</span>-fold');mm(a);
  
    // Canvas. touch-action:pan-y lets the browser claim vertical scroll
    // gestures before the canvas sees them, so the Keeper can scroll the
    // button panel below without fighting the draw handler. Horizontal
    // strokes still draw; circular/mandala strokes work fine.
    canvas=document.createElement('canvas');canvas.style.cssText='display:block;width:100%;aspect-ratio:1;max-width:420px;margin:0 auto;border-radius:12px;touch-action:pan-y;background:#0d100c';
    a.appendChild(canvas);ctx=canvas.getContext('2d');
    bufC=document.createElement('canvas');bufX=bufC.getContext('2d');
  
    function resize(){
      dpr=window.devicePixelRatio||1;var r=canvas.getBoundingClientRect();W=r.width;H=r.height;
      canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      var old=null;if(bufC.width>0&&bufC.height>0){try{old=bufX.getImageData(0,0,bufC.width,bufC.height)}catch(e){}}
      bufC.width=W*dpr;bufC.height=H*dpr;bufX.setTransform(dpr,0,0,dpr,0,0);
      if(old){try{bufX.putImageData(old,0,0)}catch(e){}}
      cx=W/2;cy=H/2;radius=Math.max(1,Math.min(cx,cy)-10);
    }
  
    function getColor(ph,dist){
      if(_bwUserColor){
        // Parse hex to rgba with slight alpha variation
        var r2=parseInt(_bwUserColor.slice(1,3),16),g2=parseInt(_bwUserColor.slice(3,5),16),b2=parseInt(_bwUserColor.slice(5,7),16);
        var bright=0.7+dist/radius*0.3;
        return 'rgba('+Math.min(255,Math.round(r2*bright))+','+Math.min(255,Math.round(g2*bright))+','+Math.min(255,Math.round(b2*bright))+',0.75)';
      }
      var t=(ph+dist*0.003)%1;if(t<0)t+=1;var idx=t*(PAL.length-1),i=Math.floor(idx),f=idx-i;
      var aa=PAL[i],b=PAL[Math.min(i+1,PAL.length-1)];
      return 'rgba('+Math.round(aa.r+(b.r-aa.r)*f)+','+Math.round(aa.g+(b.g-aa.g)*f)+','+Math.round(aa.b+(b.b-aa.b)*f)+',0.7)';
    }
  
    // Audio
    function initAudio(){
      aCtx=new(window.AudioContext||window.webkitAudioContext)();
      mGain=aCtx.createGain();mGain.gain.value=0.3;mGain.connect(aCtx.destination);
      var p1=aCtx.createOscillator();p1.type='sine';p1.frequency.value=110;
      var p2=aCtx.createOscillator();p2.type='sine';p2.frequency.value=165;
      var p3=aCtx.createOscillator();p3.type='triangle';p3.frequency.value=220;
      var pG=aCtx.createGain();pG.gain.value=0.04;
      p1.connect(pG);p2.connect(pG);p3.connect(pG);pG.connect(mGain);
      var lfo=aCtx.createOscillator();lfo.type='sine';lfo.frequency.value=0.15;
      var lfG=aCtx.createGain();lfG.gain.value=0.02;lfo.connect(lfG);lfG.connect(pG.gain);
      lfo.start();p1.start();p2.start();p3.start();
      beatInt=60/bpm;nextBT=aCtx.currentTime+0.1;scheduleBeat();
      // Keep the visibility suspend/resume handler alive — it reads
      // window._bwAudioCtx, which was assigned ONCE at mount while aCtx was
      // still null (so backgrounding the tab never suspended the pad).
      window._bwAudioCtx=aCtx;
    }
    function scheduleBeat(){
      if(!aCtx||!musicOn)return;var now=aCtx.currentTime;
      while(nextBT<now+0.1){
        var bib=beatCount%4;
        if(bib===0||bib===2)playKick(nextBT);
        playHH(nextBT,bib===0?0.15:0.08);
        if(bib===0&&(beatCount%8)<4)playNote(nextBT);
        beatCount++;nextBT+=beatInt;
      }
      schTimer=setTimeout(scheduleBeat,25);
    }
    function playKick(t){var o=aCtx.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+0.12);var g=aCtx.createGain();g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.connect(g);g.connect(mGain);o.start(t);o.stop(t+0.3)}
    function playHH(t,v){var bs=aCtx.sampleRate*0.05,buf=aCtx.createBuffer(1,bs,aCtx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<bs;i++)d[i]=Math.random()*2-1;var s=aCtx.createBufferSource();s.buffer=buf;var hp=aCtx.createBiquadFilter();hp.type='highpass';hp.frequency.value=7000;var g=aCtx.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.06);s.connect(hp);hp.connect(g);g.connect(mGain);s.start(t);s.stop(t+0.08)}
    function playNote(t){var notes=[220,261.6,293.7,329.6,392];var o=aCtx.createOscillator();o.type='triangle';o.frequency.value=notes[Math.floor(Math.random()*notes.length)];var g=aCtx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.1,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+0.6);o.connect(g);g.connect(mGain);o.start(t);o.stop(t+0.7)}
  
    // Drawing
    function toLocal(px2,py2){var r=canvas.getBoundingClientRect();var x=px2-r.left,y=py2-r.top;var dx=x-cx,dy=y-cy;var c=Math.cos(-rotAngle),s=Math.sin(-rotAngle);return{x:dx*c-dy*s+cx,y:dx*s+dy*c+cy}}
    function _drawLine(ax,ay,bx,by){bufX.beginPath();bufX.moveTo(ax,ay);bufX.lineTo(bx,by);bufX.stroke()}
    function _rot(px2,py2,a){var co=Math.cos(a),sn=Math.sin(a);return{x:(px2-cx)*co-(py2-cy)*sn+cx,y:(px2-cx)*sn+(py2-cy)*co+cy}}
    function _mirX(px2,py2){return{x:-(px2-cx)+cx,y:py2}}
    function _mirY(px2,py2){return{x:px2,y:-(py2-cy)+cy}}
    function drawSym(x1,y1,x2,y2){
      var dist=Math.sqrt((x1-cx)*(x1-cx)+(y1-cy)*(y1-cy));var color=getColor(colorPh,dist);var sz=brushSize*(0.5+dist/radius*0.8);
      bufX.lineWidth=sz;bufX.lineCap='round';bufX.lineJoin='round';bufX.strokeStyle=color;
      var mode=_bwMirrors[_bwMirrorIdx];
      var step=(Math.PI*2)/symmetry;
      if(mode==='freehand'){
        _drawLine(x1,y1,x2,y2);
      }else if(mode==='radial'){
        for(var i=0;i<symmetry;i++){var r1=_rot(x1,y1,step*i),r2=_rot(x2,y2,step*i);_drawLine(r1.x,r1.y,r2.x,r2.y)}
      }else if(mode==='kaleidoscope'){
        for(var i=0;i<symmetry;i++){var r1=_rot(x1,y1,step*i),r2=_rot(x2,y2,step*i);_drawLine(r1.x,r1.y,r2.x,r2.y);
          var m1=_mirX(x1,y1),m2=_mirX(x2,y2);var rm1=_rot(m1.x,m1.y,step*i),rm2=_rot(m2.x,m2.y,step*i);_drawLine(rm1.x,rm1.y,rm2.x,rm2.y)}
      }else if(mode==='horizontal'){
        _drawLine(x1,y1,x2,y2);var m1=_mirX(x1,y1),m2=_mirX(x2,y2);_drawLine(m1.x,m1.y,m2.x,m2.y);
      }else if(mode==='quad'){
        _drawLine(x1,y1,x2,y2);
        var mx1=_mirX(x1,y1),mx2=_mirX(x2,y2);_drawLine(mx1.x,mx1.y,mx2.x,mx2.y);
        var my1=_mirY(x1,y1),my2=_mirY(x2,y2);_drawLine(my1.x,my1.y,my2.x,my2.y);
        var mb1=_mirY(mx1.x,mx1.y),mb2=_mirY(mx2.x,mx2.y);_drawLine(mb1.x,mb1.y,mb2.x,mb2.y);
      }else{
        // mandala — radial + alternating reflection (original)
        for(var i=0;i<symmetry;i++){var aa=step*i,co=Math.cos(aa),sn=Math.sin(aa);
          var rx1=(x1-cx)*co-(y1-cy)*sn+cx,ry1=(x1-cx)*sn+(y1-cy)*co+cy;
          var rx2=(x2-cx)*co-(y2-cy)*sn+cx,ry2=(x2-cx)*sn+(y2-cy)*co+cy;
          _drawLine(rx1,ry1,rx2,ry2);
          if(i%2===0){var mmx1=-(x1-cx)*co-(y1-cy)*sn+cx,mmy1=-(x1-cx)*sn+(y1-cy)*co+cy;var mmx2=-(x2-cx)*co-(y2-cy)*sn+cx,mmy2=-(x2-cx)*sn+(y2-cy)*co+cy;_drawLine(mmx1,mmy1,mmx2,mmy2)}}
      }
    }
    function gtp(e){return e.touches&&e.touches.length?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}}
    // Draw handlers — do NOT preventDefault on touchstart so vertical
    // scroll gestures can still reach the page. preventDefault only when
    // we're already in an active stroke so the browser doesn't scroll
    // mid-draw.
    function onD(e){var p=gtp(e);
      if(_bwDrawingPath){var r=canvas.getBoundingClientRect();_bwCustomPath=[{x:(p.x-r.left)/W,y:(p.y-r.top)/H}];return}
      var l=toLocal(p.x,p.y);drawing=true;lastX=l.x;lastY=l.y;strokes++;if(!aCtx&&musicOn)initAudio()}
    function onM(e){var p=gtp(e);
      if(_bwDrawingPath){e.preventDefault();var r=canvas.getBoundingClientRect();_bwCustomPath.push({x:(p.x-r.left)/W,y:(p.y-r.top)/H});return}
      if(!drawing)return;
      e.preventDefault();
      var l=toLocal(p.x,p.y);drawSym(lastX,lastY,l.x,l.y);lastX=l.x;lastY=l.y}
    function onU(e){
      if(_bwDrawingPath&&_bwCustomPath.length>2){_bwDrawingPath=false;sm('Custom path set! ('+_bwCustomPath.length+' points)');return}
      drawing=false}
    canvas.addEventListener('mousedown',onD);canvas.addEventListener('mousemove',onM);
    canvas.addEventListener('mouseup',onU);canvas.addEventListener('mouseleave',onU);
    canvas.addEventListener('touchstart',onD,{passive:false});
    canvas.addEventListener('touchmove',onM,{passive:false});
    canvas.addEventListener('touchend',onU,{passive:false});
  
    // Render loop
    var lt=0,_bwRaf=0;
    function _bwKillAudio(){
      if(schTimer){clearTimeout(schTimer);schTimer=null;}
      if(aCtx){try{aCtx.close();}catch(e){}aCtx=null;mGain=null;}
      musicOn=false;
      if(_bwRaf){cancelAnimationFrame(_bwRaf);_bwRaf=0;}
    }
    window._bwKillAudio=_bwKillAudio;
    // Kill audio when browser tab is hidden/minimized — register once only
    if(!window._bwVisHandler){
      window._bwVisHandler=function(){
        try{
          if(document.hidden&&window._bwAudioCtx&&_a==='bloomwheel'&&window._bwAudioCtx.state==='running'){window._bwAudioCtx.suspend();}
          else if(!document.hidden&&window._bwAudioCtx&&_a==='bloomwheel'&&window._bwAudioCtx.state==='suspended'){window._bwAudioCtx.resume();}
        }catch(e){}
      };
      document.addEventListener('visibilitychange',window._bwVisHandler);
    }
    window._bwAudioCtx=aCtx;
    function render(ts){
      if(_a!=='bloomwheel'){_bwKillAudio();return}
      if(!ctx||!bufC){_bwKillAudio();return}
      if(!bufC.width||!bufC.height||!W||!H){_bwRaf=requestAnimationFrame(render);return}
      var dt=lt?(ts-lt)/1000:0.016;lt=ts;
      if(spinOn){
        var speed=(Math.PI*2)/(beatInt*16);
        var mode=_bwPaths[_bwPathIdx];
        _bwPathT+=dt*speed;
        rotAngle+=speed*dt;
        if(mode==='custom'&&_bwCustomPath.length>2){var ci=(_bwPathT*2)%_bwCustomPath.length;var fi=Math.floor(ci);var ff=ci-fi;var p0=_bwCustomPath[fi%_bwCustomPath.length];var p1=_bwCustomPath[(fi+1)%_bwCustomPath.length];cx=W*(p0.x+(p1.x-p0.x)*ff);cy=H*(p0.y+(p1.y-p0.y)*ff)}
      }
      colorPh+=dt*0.02;if(colorPh>1)colorPh-=1;
      ctx.fillStyle='#0d100c';ctx.fillRect(0,0,W,H);
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle='rgba(74,124,53,0.06)';ctx.lineWidth=1;ctx.stroke();
      ctx.strokeStyle='rgba(74,124,53,0.03)';ctx.lineWidth=0.5;
      var step=(Math.PI*2)/symmetry;
      for(var i=0;i<symmetry;i++){var ga=step*i+rotAngle;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ga)*radius,cy+Math.sin(ga)*radius);ctx.stroke()}
      ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle='rgba(212,168,67,0.15)';ctx.fill();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(rotAngle);ctx.translate(-cx,-cy);ctx.drawImage(bufC,0,0,W,H);ctx.restore();
      // Draw custom path preview
      if(_bwDrawingPath&&_bwCustomPath.length>1){ctx.beginPath();ctx.moveTo(_bwCustomPath[0].x*W,_bwCustomPath[0].y*H);for(var pi=1;pi<_bwCustomPath.length;pi++)ctx.lineTo(_bwCustomPath[pi].x*W,_bwCustomPath[pi].y*H);ctx.strokeStyle='rgba(200,168,75,0.5)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([])}
      _bwRaf=requestAnimationFrame(render);
    }
  
    // Controls
    // Movement patterns — circle + custom path only
    var _bwPaths=['circle','custom'];
    var _bwPathIdx=0,_bwCustomPath=[],_bwDrawingPath=false,_bwPathT=0;
    var _bwUserColor=null; // null = auto palette
    // Mirror modes — mandala is the default landing so the canvas looks
    // alive the moment a stroke is drawn. Freehand is one tap away.
    var _bwMirrors=['mandala','freehand','radial','kaleidoscope','horizontal','quad'];
    var _bwMirrorIdx=0;
  
    var _bbs='min-height:56px;min-width:clamp(72px,20vw,96px);padding:0.5rem 0.4rem;font-size:clamp(.55rem,1.6vw,.7rem);background:rgba(26,31,23,.9);border:1.5px solid rgba(74,124,53,.25);border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.03);text-align:center';
    // Color palette
    var _bwPalette=['#7ab356','#4a7c35','#c8a84b','#e8dcc8','#c07070','#5bafd4','#9b59b6','#c76a30','#e8a050','#3B5323','#D4A843','#e8dcc8'];
    var palDiv=document.createElement('div');palDiv.style.cssText='display:flex;gap:4px;justify-content:center;flex-wrap:wrap;padding:6px 4px';
    _bwPalette.forEach(function(c){
      var sw=document.createElement('div');
      sw.style.cssText='width:clamp(28px,8vw,36px);height:clamp(28px,8vw,36px);border-radius:50%;background:'+c+';cursor:pointer;border:3px solid rgba(0,0,0,0.3);box-shadow:0 1px 4px rgba(0,0,0,0.3);transition:transform .12s,border-color .12s';
      sw.onclick=function(){_BWColor(c);palDiv.querySelectorAll('div').forEach(function(d){d.style.borderColor='rgba(0,0,0,0.3)';d.style.transform='scale(1)'});sw.style.borderColor='var(--gold)';sw.style.transform='scale(1.2)'};
      palDiv.appendChild(sw);
    });
    // Auto color rainbow button
    var autoSw=document.createElement('div');
    autoSw.id='BWautoSw';
    autoSw.style.cssText='width:clamp(28px,8vw,36px);height:clamp(28px,8vw,36px);border-radius:50%;background:conic-gradient(#c07070,#e8a050,#c8a84b,#7ab356,#5bafd4,#9b59b6,#c07070);cursor:pointer;border:3px solid var(--gold);box-shadow:0 1px 4px rgba(0,0,0,0.3);transition:transform .12s;transform:scale(1.2)';
    autoSw.onclick=function(){_bwUserColor=null;palDiv.querySelectorAll('div').forEach(function(d){d.style.borderColor='rgba(0,0,0,0.3)';d.style.transform='scale(1)'});autoSw.style.borderColor='var(--gold)';autoSw.style.transform='scale(1.2)'};
    palDiv.appendChild(autoSw);
    a.appendChild(palDiv);
  
    var ctrlDiv=mc(a);
    var _bls='display:block;font-size:clamp(0.32rem,0.9vw,0.38rem);color:var(--muted);margin-top:2px;letter-spacing:0.04em';
    // Primary controls — always visible. Stephen: 'bloom wheel should have
    // a few of the most important buttons at the top or readily available
    // like, clear.' CLEAR + SAVE now live with the petals row so players
    // never have to open MORE to wipe or mint a mandala.
    //   Row 1: petals + draw mode + brush (stroke-by-stroke dials)
    //   Row 2: CLEAR + SAVE (essential actions) + MORE toggle
    //   Row 3: secondary drawer (BPM, music, path, freeze)
    ctrlDiv.innerHTML='<div style="display:flex;gap:6px;padding:6px 0;flex-wrap:wrap;justify-content:center">'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWS(4)" id="BWs4">4<span style="'+_bls+'">PETALS</span></button>'
      +'<button class="gb gon" style="'+_bbs+'" onclick="_BWS(8)" id="BWs8">8<span style="'+_bls+'">PETALS</span></button>'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWS(12)" id="BWs12">12<span style="'+_bls+'">PETALS</span></button>'
      +'<button class="gb gon" style="'+_bbs+';min-width:clamp(100px,28vw,130px)" onclick="_BWMirror()" id="BWmir">✿ MANDALA<span style="'+_bls+'">DRAW MODE</span></button>'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWBrush()" id="BWbr">● 3<span style="'+_bls+'">BRUSH</span></button>'
      +'</div>'
      // Essentials row — CLEAR + SAVE promoted out of the accordion so
      // they're a single tap away. MORE OPTIONS toggle sits with them.
      // 2026-05-13: dropped position:sticky;bottom:0. Stephen: "the clear
      // button in bloom wheel moves as i scroll so it stacks on other
      // buttons and looks like shit." The sticky row floated over the
      // MORE accordion contents on scroll. Now flows inline like the rest.
      +'<div style="display:flex;gap:6px;padding:8px 4px;flex-wrap:wrap;justify-content:center;align-items:center;background:rgba(13,16,12,.92);border-top:1px solid rgba(74,124,53,.15);margin:0 -12px">'
      +'<button class="gb" style="'+_bbs+';border-color:rgba(217,107,75,0.35);color:#e8a090" onclick="_BWClear()">✕ CLEAR<span style="'+_bls+'">CANVAS</span></button>'
      +'<button class="gb" style="'+_bbs+';border-color:rgba(200,168,75,0.4);color:var(--gold);background:rgba(200,168,75,0.08)" onclick="_BWSave()">💾 SAVE<span style="'+_bls+'">IMAGE</span></button>'
      +'<button class="gb" style="min-height:40px;padding:0.35rem 0.9rem;font-size:0.55rem;letter-spacing:0.1em;background:rgba(26,31,23,.6);border:1px solid rgba(74,124,53,.2);border-radius:8px;" onclick="_BWMore()" id="BWmoreTog">▼ MORE</button>'
      +'</div>'
      +'<div id="BWmoreRow" style="display:none;gap:6px;padding:6px 0;flex-wrap:wrap;justify-content:center">'
      +'<button class="gb" style="'+_bbs+';min-width:clamp(88px,24vw,110px)" onclick="_BWPath()" id="BWpath">◯ SPIN<span style="'+_bls+'">PATH</span></button>'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWBpm(-10)">◀ SLOWER<span style="'+_bls+'">BPM</span></button>'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWBpm(10)">FASTER ▶<span style="'+_bls+'">BPM</span></button>'
      +'<button class="gb" style="'+_bbs+'" onclick="_BWMusic()" id="BWmus">♫ OFF<span style="'+_bls+'">MUSIC</span></button>'
      +'<button class="gb" style="'+_bbs+';min-width:clamp(88px,24vw,110px)" onclick="_BWFreeze()" id="BWfrz">❄ FREEZE<span style="'+_bls+'">ROTATION</span></button>'
      +'</div>';
    window._BWMore=function(){
      var r=document.getElementById('BWmoreRow');if(!r)return;
      var on=r.style.display==='flex';
      r.style.display=on?'none':'flex';
      var tog=document.getElementById('BWmoreTog');
      if(tog)tog.innerHTML=(on?'▼':'▲')+' MORE';
    };
  
    window._BWS=function(n){symmetry=n;document.getElementById('BWsym').textContent=n;
      document.getElementById('BWs4').className='gb'+(n===4?' gon':'');
      document.getElementById('BWs8').className='gb'+(n===8?' gon':'');
      document.getElementById('BWs12').className='gb'+(n===12?' gon':'')};
    window._BWBpm=function(d){bpm=Math.max(50,Math.min(160,bpm+d));beatInt=60/bpm;document.getElementById('BWbpm').textContent=bpm+' BPM'};
    window._BWMusic=function(){musicOn=!musicOn;var btn=document.getElementById('BWmus');if(btn){btn.textContent=musicOn?'♫ ON':'♫ OFF';btn.className='gb'+(musicOn?' gon':'')}
      if(musicOn){if(!aCtx)initAudio();else{nextBT=aCtx.currentTime+0.1;scheduleBeat()}}
      if(!musicOn&&schTimer)clearTimeout(schTimer);if(mGain)mGain.gain.value=musicOn?0.3:0};
    window._BWBrush=function(){brushIdx=(brushIdx+1)%brushSizes.length;brushSize=brushSizes[brushIdx];var btn=document.getElementById('BWbr');if(btn)btn.textContent='● '+Math.round(brushSize)};
    window._BWColor=function(c){_bwUserColor=c;var as=document.getElementById('BWautoSw');if(as){as.style.borderColor='rgba(0,0,0,0.3)';as.style.transform='scale(1)'}};
    window._BWMirror=function(){
      _bwMirrorIdx=(_bwMirrorIdx+1)%_bwMirrors.length;
      var names={freehand:'✎ FREEHAND',mandala:'✿ MANDALA',radial:'❋ RADIAL',kaleidoscope:'◆ KALEIDOSCOPE',horizontal:'↔ MIRROR',quad:'✦ QUAD'};
      var btn=document.getElementById('BWmir');if(btn){btn.textContent=names[_bwMirrors[_bwMirrorIdx]];btn.className='gb gon'}
    };
    window._BWPath=function(){
      _bwPathIdx=(_bwPathIdx+1)%_bwPaths.length;_bwPathT=0;
      var p=_bwPaths[_bwPathIdx];
      var btn=document.getElementById('BWpath');if(btn){btn.textContent=p==='circle'?'◯ SPIN':'✏ DRAW PATH';btn.className='gb'+(p==='custom'?' gon':'')}
      if(p==='custom'){_bwCustomPath=[];_bwDrawingPath=true;sm('Draw a path on canvas, then tap DRAW PATH again')}
      else{_bwDrawingPath=false;cx=W/2;cy=H/2}
    };
    window._BWFreeze=function(){spinOn=!spinOn;var btn=document.getElementById('BWfrz');if(btn){btn.textContent=spinOn?'❄ FREEZE':'▶ RESUME';btn.className='gb'+(spinOn?'':' gon')}sm(spinOn?'Spinning':'Frozen, screenshot or save!')};
    window._BWClear=function(){bufX.clearRect(0,0,bufC.width,bufC.height);rotAngle=0;strokes=0;_bwCustomPath=[];_bwDrawingPath=false;_bwPathIdx=0;_bwPathT=0;cx=W/2;cy=H/2;var pb=document.getElementById('BWpath');if(pb)pb.textContent='◯ SPIN';sm('Canvas cleared')};
    // Track whether this session has already minted a hash so save can't
    // be tap-farmed for unlimited Sunbeams. Same pattern as pixelgarden.
    var _bwWonThisSession=false;
    window._BWSave=function(){
      if(strokes<=0){sm('Draw something first');return;}
      var g=window._lwArtSaveGate&&window._lwArtSaveGate('bloomwheel');
      if(g&&!g.allow){sm('Save again in '+g.secs+'s');return;}
      var sc=document.createElement('canvas');sc.width=W*dpr;sc.height=H*dpr;var sx=sc.getContext('2d');sx.setTransform(dpr,0,0,dpr,0,0);
      sx.fillStyle='#0d100c';sx.fillRect(0,0,W,H);sx.save();sx.beginPath();sx.arc(cx,cy,radius,0,Math.PI*2);sx.clip();sx.drawImage(bufC,0,0,W,H);sx.restore();
      sx.beginPath();sx.arc(cx,cy,radius,0,Math.PI*2);sx.strokeStyle='rgba(74,124,53,0.3)';sx.lineWidth=2;sx.stroke();
      sx.fillStyle='rgba(232,220,200,0.2)';sx.font='10px Bebas Neue,sans-serif';sx.textAlign='center';sx.fillText('BLOOM WHEEL, LUCID WINDS',cx,H-10);
      var lk=document.createElement('a');lk.download='bloom-wheel-'+Date.now()+'.png';lk.href=sc.toDataURL('image/png');lk.click();
      _playWin();sm('Mandala saved!');
      if(g&&g.firstWin){_e('game_win');_sr('bloomwheel',{w:true,s:Math.round((Date.now()-startT)/1000)});}
      else _e('milestone');
    };
  
    // Hash earning — 1 per 60 seconds of active drawing (track interval so we can clear on teardown)
    if(window._bwHashInt){try{clearInterval(window._bwHashInt);}catch(e){}}
    window._bwHashInt=setInterval(function(){if(_a==='bloomwheel'&&strokes>0)_e('progress');else if(_a!=='bloomwheel'){try{clearInterval(window._bwHashInt);window._bwHashInt=null;}catch(e){}}},60000);
  
    // Resize handler — only register once across multiple entries
    if(window._bwResize){try{window.removeEventListener('resize',window._bwResize);}catch(e){}}
    window._bwResize=resize;
    resize();window.addEventListener('resize',window._bwResize);
    requestAnimationFrame(render);
  }

  window._gameFns['bloomwheel']=GBW;
})();
