// ═══ LUCID WINDS — Minesweeper (Root Rot) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;

function GN(a){var rw=10,cl=10,mn=15,bd=[],ov=false,fi=true,fm=false,rv=0,fg=0,sf=0;
  ms(a,'🦠<strong id="Nn">15</strong> · 🚩<strong id="Nf">0</strong> · 🌿<strong id="Nr">0</strong>/<strong id="Ns">85</strong>');mm(a);
  var gd=document.createElement('div');gd.className='ng';gd.id='Ng';gd.style.gridTemplateColumns='repeat('+cl+',1fr)';a.appendChild(gd);
  mc(a).innerHTML='<select class="gsl" id="Nd" onchange="_NN()"><option value="8-10">Easy</option><option value="10-15" selected>Medium</option><option value="12-25">Hard</option></select> <button class="gb" id="Nfb" onclick="_NF()">🚩 Flag</button> <button class="gb" onclick="_NN()">🔄 New</button>';
  function ix(r,c){return r*cl+c}function pl(sr,sc){var p=0;while(p<mn){var r=Math.floor(Math.random()*rw),c=Math.floor(Math.random()*cl);if(Math.abs(r-sr)<=1&&Math.abs(c-sc)<=1||bd[ix(r,c)].m)continue;bd[ix(r,c)].m=true;p++}for(var r=0;r<rw;r++)for(var c=0;c<cl;c++){if(bd[ix(r,c)].m)continue;var n=0;for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var nr=r+dr,nc=c+dc;if(nr>=0&&nr<rw&&nc>=0&&nc<cl&&bd[ix(nr,nc)].m)n++}bd[ix(r,c)].a=n}}
  function re(r,c){if(r<0||r>=rw||c<0||c>=cl)return;var x=bd[ix(r,c)];if(x.rv||x.fl)return;_play('dig');x.rv=true;rv++;if(x.m){ov=true;bd.forEach(function(c){if(c.m)c.sm=true});x.ht=true;_e('game_loss');_play('lose');sm('🦠 Root rot!');_sr('mines',{w:false,s:rv});rn();return}if(rv%Math.max(8,Math.floor(sf/5))===0)_e('cleared');if(x.a===0)for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++)re(r+dr,c+dc)}
  function cw(){document.getElementById('Nr').textContent=rv;if(rv===sf&&!ov){ov=true;_e('game_win');sm('🌿 Clean!');_sr('mines',{w:true,s:rv})}}
  function rn(){gd.innerHTML='';gd.style.gridTemplateColumns='repeat('+cl+',1fr)';for(var r=0;r<rw;r++)for(var c=0;c<cl;c++){var x=bd[ix(r,c)];var d=document.createElement('div');d.setAttribute('data-r',r);d.setAttribute('data-c',c);if(x.rv){d.className='nc '+(x.ht?'nb':x.sm?'nb':'nr'+(x.a?' x'+x.a:''));d.textContent=x.ht?'':x.sm?'':(x.a||'')}else if(x.sm){d.className='nc nb';d.textContent=''}else if(x.fl){d.className='nc nf';d.textContent='';d.setAttribute('data-r',r);d.setAttribute('data-c',c);d.onclick=function(){if(ov)return;var cr=parseInt(this.getAttribute('data-r')),cc=parseInt(this.getAttribute('data-c'));var z=bd[ix(cr,cc)];_play('snap');z.fl=false;fg--;document.getElementById('Nf').textContent=fg;rn()}}else{d.className='nc nh';d.onclick=function(){if(ov)return;var cr=parseInt(this.getAttribute('data-r')),cc=parseInt(this.getAttribute('data-c'));if(fm){var z=bd[ix(cr,cc)];if(!z.rv){_play('snap');z.fl=!z.fl;fg+=z.fl?1:-1;document.getElementById('Nf').textContent=fg;rn()}return}if(bd[ix(cr,cc)].fl)return;if(fi){pl(cr,cc);fi=false;
  // ── BEHOLDER BOOST — reveal N safe cells on first click ──
  try{
    var bh=window.LW_Comp&&LW_Comp.peek('mines');
    if(bh&&!bh.used){
      var safe=[];
      for(var rr=0;rr<rw;rr++)for(var ccx=0;ccx<cl;ccx++){
        if(rr===cr&&ccx===cc)continue;
        var cell=bd[ix(rr,ccx)];
        if(!cell.m&&!cell.rv)safe.push([rr,ccx]);
      }
      // Fisher-Yates-ish shuffle
      for(var si=safe.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var tt=safe[si];safe[si]=safe[sj];safe[sj]=tt;}
      var nReveal=Math.min(bh.value,safe.length);
      for(var ri=0;ri<nReveal;ri++){
        var s=safe[ri];var sc=bd[ix(s[0],s[1])];
        if(!sc.rv){sc.rv=true;rv++;}
      }
      if(nReveal>0)LW_Comp.use('mines');
    }
  }catch(e){}
}re(cr,cc);rn();cw()}}gd.appendChild(d)}}
  window._NF=function(){fm=!fm;document.getElementById('Nfb').className='gb'+(fm?' gon':'')};
  window._NN=function(){var p=document.getElementById('Nd').value.split('-');rw=cl=parseInt(p[0]);mn=parseInt(p[1]);_setDiff(rw<=8?'easy':rw<=10?'medium':'hard');sf=rw*cl-mn;bd=[];for(var i=0;i<rw*cl;i++)bd.push({m:false,rv:false,fl:false,a:0,ht:false,sm:false});ov=false;fi=true;rv=0;fg=0;fm=false;document.getElementById('Nn').textContent=mn;document.getElementById('Nf').textContent='0';document.getElementById('Nr').textContent='0';document.getElementById('Ns').textContent=sf;sm('');rn()};_NN();}

window._gameFns.mines=GN;
})();
