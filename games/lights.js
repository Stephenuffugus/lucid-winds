// ═══ LUCID WINDS — Lights Out (Glow Shrooms) ═══
(function(){
'use strict';
var G=window._G;
if(!document.getElementById('_lights_glow_css')){var _s=document.createElement('style');_s.id='_lights_glow_css';_s.textContent='.lc{transition:box-shadow 240ms ease,filter 240ms ease,opacity 240ms ease}.lc.l-on{animation:_lcPulseOn 260ms ease-out}.lc.l-off{animation:_lcPulseOff 260ms ease-out}@keyframes _lcPulseOn{0%{box-shadow:none;filter:brightness(0.85)}45%{box-shadow:0 0 20px var(--gold,#c8a84b),0 0 8px var(--gold,#c8a84b);filter:brightness(1.15)}100%{box-shadow:0 0 6px rgba(200,168,75,0.35);filter:brightness(1)}}@keyframes _lcPulseOff{0%{box-shadow:0 0 18px var(--gold,#c8a84b);filter:brightness(1.1)}100%{box-shadow:none;filter:brightness(1)}}';document.head.appendChild(_s);}
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GL(a){var SZ=5,gr=[],ini=[],mv=0,sl=0,pz=0,won=false; // won latch (2026-07-03): board used to stay live after solving — re-solving refired game_win/earn
  // lifetime solves persist (2026-07-03 polish: ✅ counter was session-only)
  try{sl=parseInt(localStorage.getItem('lw_lights_solved'),10)||0;}catch(e){}
  function _lKill(){var o=document.getElementById('L-over');if(o)o.remove();}
  _lKill();
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(_lKill);
  ms(a,'#<strong id="Lp">1</strong> · 👆<strong id="Lm">0</strong> · ✅<strong id="Ls">'+sl+'</strong>');mm(a);
  var bw=document.createElement('div');bw.style.cssText='position:relative;width:clamp(300px,92vw,420px);margin:0 auto';
  var bg=document.createElement('img');bg.src='assets/games/lights/grid.png';bg.style.cssText='width:100%;display:block;border-radius:8px';bw.appendChild(bg);var fade=document.createElement('div');fade.style.cssText='position:absolute;inset:0;border-radius:8px;box-shadow:inset 0 0 40px 12px rgba(13,16,12,.85);pointer-events:none';bw.appendChild(fade);
  var gd=document.createElement('div');gd.className='lg';gd.id='Lg';gd.style.cssText='position:absolute;top:7%;left:7%;right:7%;bottom:7%;grid-template-columns:repeat(5,1fr);gap:clamp(2px,1vw,5px)';bw.appendChild(gd);a.appendChild(bw);mc(a).innerHTML='<button class="gb" onclick="_LN()">↻ New Game</button><button class="gb" onclick="_LR()">↺ Reset</button>';
  function tg(r,c){if(r>=0&&r<SZ&&c>=0&&c<SZ)gr[r*SZ+c]=gr[r*SZ+c]?0:1}function ok(){for(var i=0;i<SZ*SZ;i++)if(gr[i])return false;return true}
  var _lampOn='assets/games/lights/shroom-on.png';
  var _lampOff='assets/games/lights/shroom-off.png';
  function anim(i,wasOn){var el=gd.children[i];if(!el)return;var cls=wasOn?'l-off':'l-on';el.classList.add(cls);setTimeout(function(){if(el)el.classList.remove(cls)},450)}
  function rn(changed){gd.innerHTML='';for(var i=0;i<SZ*SZ;i++){var d=document.createElement('div');d.className='lc';d.style.cssText='background:url('+(gr[i]?_lampOn:_lampOff)+') center/cover !important;border:none !important;box-shadow:none !important;border-radius:clamp(4px,1.2vw,8px)';d.setAttribute('data-i',i);d.onclick=function(){if(won)return;var el=this;var x=parseInt(el.getAttribute('data-i'));var r=Math.floor(x/SZ),c=x%SZ;el.classList.add('ltap');setTimeout(function(){el.classList.remove('ltap')},260);_play("click");var af=[];var pairs=[[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]];for(var p=0;p<pairs.length;p++){var pr=pairs[p][0],pc=pairs[p][1];if(pr>=0&&pr<SZ&&pc>=0&&pc<SZ)af.push({idx:pr*SZ+pc,was:gr[pr*SZ+pc]})}tg(r,c);tg(r-1,c);tg(r+1,c);tg(r,c-1);tg(r,c+1);mv++;document.getElementById('Lm').textContent=mv;rn(af);if(ok()){won=true;sl++;try{localStorage.setItem('lw_lights_solved',String(sl));}catch(e){}document.getElementById('Ls').textContent=sl;_e('puzzle_solved');_e('game_win');_playWin();sm('🌿 Done in '+mv+' moves!');_sr('lights',{w:true,s:mv,lo:1});
  (function(mvF,slF){setTimeout(function(){
    _lKill();
    var ov=document.createElement('div');ov.id='L-over';
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at 50% 40%,rgba(200,168,75,0.25) 0%,rgba(13,16,12,0.92) 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:Georgia,serif;';
    ov.innerHTML='<div style="font-size:3.2rem;line-height:1;">\ud83c\udf44</div>'
      +'<div style="font-size:1.7rem;font-weight:700;color:#c8a84b;letter-spacing:0.08em;margin-top:10px;">ALL SHROOMS DIMMED</div>'
      +'<div style="font-size:0.95rem;color:#e8dcc8;margin-top:10px;"><b style="color:#c8a84b">'+mvF+'</b> moves \u00b7 '+slF+' patches cleared all-time</div>'
      +'<button id="L-next" style="margin-top:22px;min-height:48px;padding:12px 30px;font-family:Georgia,serif;font-weight:700;font-size:0.92rem;background:linear-gradient(180deg,rgba(122,179,86,0.35),rgba(74,124,53,0.45));border:2px solid #7ab356;color:#f5ebd0;border-radius:10px;cursor:pointer;">NEXT PATCH \u25b6</button>'
      +'<button id="L-stay" style="margin-top:10px;min-height:44px;padding:8px 20px;background:transparent;border:1px solid rgba(138,145,120,0.4);color:#8a9178;border-radius:10px;font-size:0.75rem;cursor:pointer;">admire the glow</button>';
    ov.querySelector('#L-next').onclick=function(){ov.remove();window._LN();};
    ov.querySelector('#L-stay').onclick=function(){ov.remove();};
    ov.onclick=function(ev){if(ev.target===ov)ov.remove();};
    document.body.appendChild(ov);
  },500);})(mv,sl);}};gd.appendChild(d)}if(changed){for(var j=0;j<changed.length;j++)anim(changed[j].idx,changed[j].was)}}
  function gn(){gr=[];for(var i=0;i<SZ*SZ;i++)gr.push(0);var n=5+Math.floor(Math.random()*8);for(var t=0;t<n;t++){var ri=Math.floor(Math.random()*SZ),ci=Math.floor(Math.random()*SZ);tg(ri,ci);tg(ri-1,ci);tg(ri+1,ci);tg(ri,ci-1);tg(ri,ci+1)}if(ok()){tg(2,2);tg(1,2);tg(3,2);tg(2,1);tg(2,3)}ini=gr.slice()}
  window._LN=function(){_lKill();won=false;pz++;mv=0;document.getElementById('Lp').textContent=pz;document.getElementById('Lm').textContent='0';sm('');gn();rn()};window._LR=function(){won=false;gr=ini.slice();mv=0;document.getElementById('Lm').textContent='0';sm('Reset');rn()};_LN();}

window._gameFns.lights=GL;
})();
