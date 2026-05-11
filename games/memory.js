// ═══ LUCID WINDS — Memory Garden ═══
(function(){
'use strict';
var G=window._G;
// Aliases for shared utilities
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

function GM(a){var IC=[
'<img src="assets/games/memory/01-moonflower-card.png" alt="Moonflower" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/02-bird-of-paradise-card.png" alt="Bird of Paradise" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/03-lotus-card.png" alt="Lotus" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/04-sunflower-card.png" alt="Sunflower" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/05-foxglove-card.png" alt="Foxglove" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/06-passion-flower-card.png" alt="Passion Flower" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/07-bleeding-heart-card.png" alt="Bleeding Heart" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/08-protea-card.png" alt="Protea" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/09-dahlia-card.png" alt="Dahlia" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/10-orchid-card.png" alt="Orchid" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/11-cherry-blossom-card.png" alt="Cherry Blossom" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/12-rafflesia-card.png" alt="Rafflesia" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/13-lavender-card.png" alt="Lavender" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/14-heliconia-card.png" alt="Heliconia" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/15-ghost-orchid-card.png" alt="Ghost Orchid" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/16-venus-flytrap-card.png" alt="Venus Flytrap" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/17-titan-arum-card.png" alt="Titan Arum" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">',
'<img src="assets/games/memory/18-night-blooming-cereus-card.png" alt="Night Cereus" style="width:92%;height:92%;object-fit:contain;border-radius:6px;">'
];var pr=8,cd=[],fl=[],mt=0,mv=0,lk=false;
  ms(a,'🎴 <strong id="Mm">0</strong>/<strong id="Mt">8</strong> · 👆 <strong id="Mv">0</strong>');mm(a);
  var g=document.createElement('div');g.className='mg';g.id='Mg';g.style.gridTemplateColumns='repeat(4,1fr)';a.appendChild(g);
  mc(a).innerHTML='<select class="gsl" id="Md" onchange="_MN()"><option value="6">Easy 3×4</option><option value="8" selected>Medium 4×4</option><option value="10">Hard 5×4</option><option value="12">Expert 6×4</option></select> <button class="gb-new" onclick="_MN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';
  window._MN=function(){pr=parseInt(document.getElementById('Md').value);_setDiff(pr<=6?'easy':pr<=8?'medium':pr<=10?'hard':'expert');var p=sh(IC.slice()).slice(0,pr);cd=sh(p.concat(p.slice()));fl=[];mt=0;mv=0;lk=false;document.getElementById('Mm').textContent='0';document.getElementById('Mt').textContent=pr;document.getElementById('Mv').textContent='0';g.style.gridTemplateColumns='repeat('+(pr<=6?3:pr<=8?4:pr<=10?5:6)+',1fr)';sm('');rn()};
  function rn(){g.innerHTML='';cd.forEach(function(ic,i){var e=document.createElement('div');e.className='mw';e.innerHTML='<div class="mi" id="M'+i+'"><div class="mx mb"></div><div class="mx mf"><div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">'+ic+'</div></div></div>';e.onclick=function(){if(lk)return;var n=document.getElementById('M'+i);if(!n||n.classList.contains('fl')||n.classList.contains('mt'))return;if(fl.length>=2)return;n.classList.add('fl');_play('flip');fl.push(i);if(fl.length===2){mv++;document.getElementById('Mv').textContent=mv;lk=true;if(cd[fl[0]]===cd[fl[1]]){setTimeout(function(){_play('match');document.getElementById('M'+fl[0]).classList.add('mt');document.getElementById('M'+fl[1]).classList.add('mt');mt++;_e('progress');document.getElementById('Mm').textContent=mt;if(mt%Math.max(2,Math.floor(pr/3))===0&&mt<pr)_e('milestone');if(mt>=pr){_e('game_win');_playWin();sm('🌿 Complete! '+mv+' moves');_sr('memory',{w:true,s:mt})}else sm((pr-mt)+' left');fl=[];lk=false},350)}else{setTimeout(function(){var x=document.getElementById('M'+fl[0]),y=document.getElementById('M'+fl[1]);if(x)x.classList.add('wr');if(y)y.classList.add('wr');_play('buzz');setTimeout(function(){if(x)x.classList.remove('fl','wr');if(y)y.classList.remove('fl','wr');fl=[];lk=false},400)},550);sm('Not a match')}}};g.appendChild(e)})}_MN();}

window._gameFns.memory=GM;
})();
