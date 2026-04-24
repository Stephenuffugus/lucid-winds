// ═══ LUCID WINDS — Simon (Seasonal Cycle) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GS(a){var sq=[],pi=0,rd=0,br=0,pl=false,pt=false,ac=null;

  // ── Chord definitions: semitone intervals from root ──
  var CHORDS={
    'Maj7':[0,4,7,11],
    'min7':[0,3,7,10],
    'Maj9':[0,4,7,14],
    'min9':[0,3,7,14],
    'sus4':[0,5,7,12],
    'sus2':[0,2,7,12],
    '6th':[0,4,7,9],
    'dim7':[0,3,6,9],
    'add9':[0,4,7,14]
  };
  // Octave root frequencies (C note)
  var OCTAVES={'Low (C3)':130.81,'Mid (C4)':261.63,'High (C5)':523.25,'Bright (C6)':1046.50};
  var _chord='Maj7',_oct=261.63;

  function _buildFR(){
    var semi=CHORDS[_chord]||CHORDS['Maj7'];
    // Sort so winter (index 3) is always highest
    var sorted=semi.slice().sort(function(a,b){return a-b});
    var fr=[];
    for(var i=0;i<4;i++)fr.push(_oct*Math.pow(2,sorted[i]/12));
    return fr;
  }
  var FR=_buildFR();

  ms(a,'Round: <strong id="Sr">0</strong> · Best: <strong id="Sb">0</strong>');mm(a);

  // ── Season tiles with artwork ──
  var bd=document.createElement('div');bd.className='sb';
  bd.innerHTML=''
    +'<div class="st" id="s0" onclick="_SP(0)"><span class="sl">SPRING</span></div>'
    +'<div class="st" id="s1" onclick="_SP(1)"><span class="sl">SUMMER</span></div>'
    +'<div class="st" id="s2" onclick="_SP(2)"><span class="sl">AUTUMN</span></div>'
    +'<div class="st" id="s3" onclick="_SP(3)"><span class="sl">WINTER</span></div>';
  a.appendChild(bd);

  // ── Chord & octave: compact tap-to-cycle below tiles ──
  var chKeys=Object.keys(CHORDS);
  var ocKeys=Object.keys(OCTAVES);var ocVals=[];for(var ok=0;ok<ocKeys.length;ok++)ocVals.push(OCTAVES[ocKeys[ok]]);
  var _chIdx=0,_ocIdx=1;
  var cr=mc(a);
  // Build chord dropdown options
  var chOpts='';for(var ci=0;ci<chKeys.length;ci++)chOpts+='<div onclick="_SPC('+ci+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:#fff;border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center'+(ci===_chIdx?';background:rgba(122,179,86,.15);color:var(--gold)':'')+'">'+chKeys[ci]+'</div>';
  // Build octave dropdown options
  var ocOpts='';for(var oi=0;oi<ocKeys.length;oi++)ocOpts+='<div onclick="_SPO('+oi+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:#fff;border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center'+(oi===_ocIdx?';background:rgba(122,179,86,.15);color:var(--gold)':'')+'">'+ocKeys[oi]+'</div>';
  cr.innerHTML=''
    +'<div style="position:relative">'
    +'<div id="Sch" onclick="_SCH()" class="gb" style="min-width:90px;text-align:center"><span style="font-size:11px;color:#C8A84B;letter-spacing:.06em;font-family:Bebas Neue,sans-serif">CHORD ▾</span><br><span style="color:#fff;font-family:DM Mono,monospace;font-size:14px">'+_chord+'</span></div>'
    +'<div id="SchDD" style="display:none;position:absolute;bottom:100%;left:0;right:0;min-width:130px;background:#1a1f17;border:2px solid #7ab356;border-radius:10px;margin-bottom:6px;z-index:999;max-height:260px;overflow-y:auto;box-shadow:0 -4px 20px rgba(0,0,0,.5)">'+chOpts+'</div>'
    +'</div>'
    +'<div style="position:relative">'
    +'<div id="Soc" onclick="_SOC()" class="gb" style="min-width:90px;text-align:center"><span style="font-size:11px;color:#C8A84B;letter-spacing:.06em;font-family:Bebas Neue,sans-serif">OCTAVE ▾</span><br><span style="color:#fff;font-family:DM Mono,monospace;font-size:14px">'+ocKeys[_ocIdx]+'</span></div>'
    +'<div id="SocDD" style="display:none;position:absolute;bottom:100%;left:0;right:0;min-width:130px;background:#1a1f17;border:2px solid #7ab356;border-radius:10px;margin-bottom:6px;z-index:999;max-height:260px;overflow-y:auto;box-shadow:0 -4px 20px rgba(0,0,0,.5)">'+ocOpts+'</div>'
    +'</div>'
    +'<button class="gb" onclick="_SN()">🔄 New</button>';
  function _updSchDD(){var h='';for(var ci=0;ci<chKeys.length;ci++)h+='<div onclick="_SPC('+ci+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:'+(ci===_chIdx?'var(--gold)':'#fff')+';border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center;background:'+(ci===_chIdx?'rgba(122,179,86,.15)':'transparent')+'">'+chKeys[ci]+'</div>';document.getElementById('SchDD').innerHTML=h}
  function _updSocDD(){var h='';for(var oi=0;oi<ocKeys.length;oi++)h+='<div onclick="_SPO('+oi+')" style="padding:10px 16px;cursor:pointer;font-family:DM Mono,monospace;font-size:14px;color:'+(oi===_ocIdx?'var(--gold)':'#fff')+';border-bottom:1px solid rgba(122,179,86,.12);min-height:44px;display:flex;align-items:center;background:'+(oi===_ocIdx?'rgba(122,179,86,.15)':'transparent')+'">'+ocKeys[oi]+'</div>';document.getElementById('SocDD').innerHTML=h}
  // Toggle chord dropdown
  window._SCH=function(){var dd=document.getElementById('SchDD');var od=document.getElementById('SocDD');if(od)od.style.display='none';dd.style.display=dd.style.display==='none'?'block':'none'};
  // Toggle octave dropdown
  window._SOC=function(){var dd=document.getElementById('SocDD');var od=document.getElementById('SchDD');if(od)od.style.display='none';dd.style.display=dd.style.display==='none'?'block':'none'};
  // Pick chord
  window._SPC=function(i){_chIdx=i;_chord=chKeys[i];FR=_buildFR();document.getElementById('Sch').querySelector('span:last-child').textContent=_chord;document.getElementById('SchDD').style.display='none';_updSchDD()};
  // Pick octave
  window._SPO=function(i){_ocIdx=i;_oct=ocVals[i];FR=_buildFR();document.getElementById('Soc').querySelector('span:last-child').textContent=ocKeys[i];document.getElementById('SocDD').style.display='none';_updSocDD()};

  // ── Tone: warm triangle wave with gentle decay ──
  function tn(f,d){
    if(!ac)try{ac=new(window.AudioContext||window.webkitAudioContext);}catch(e){}
    if(!ac)return;
    var t=ac.currentTime;
    var o=ac.createOscillator(),gn=ac.createGain();
    o.type='triangle';
    o.frequency.value=f;
    gn.gain.setValueAtTime(0,t);
    gn.gain.linearRampToValueAtTime(0.18,t+0.02);
    gn.gain.exponentialRampToValueAtTime(0.001,t+d/1000);
    o.connect(gn);gn.connect(ac.destination);
    o.start(t);o.stop(t+d/1000);
  }

  function fl(i,d){var e=document.getElementById('s'+i);if(!e)return;e.classList.add('lt');tn(FR[i],d);setTimeout(function(){e.classList.remove('lt')},d)}
  function ps(){pl=true;pt=false;sm('Watch...');var i=0,sp=Math.max(220,480-rd*12);var iv=setInterval(function(){if(i>=sq.length){clearInterval(iv);pl=false;pt=true;pi=0;sm('Your turn!');return}fl(sq[i],sp*.7);i++},sp)}
  // Simon is memory-endurance: play until you forget. Every 5 rounds
  // fires a milestone (caps at progCap per session via _e). No 'game_win'
  // event mid-game — that was kicking up the play-again overlay and
  // interrupting long runs. The game records its final score only when
  // the player actually makes a mistake.
  function nr(){
    rd++;
    var _sr2=document.getElementById('Sr');if(_sr2)_sr2.textContent=rd;
    sq.push(Math.floor(Math.random()*4));
    // Every 5th round completed: fire a milestone tick (capped per
    // session). Silent — no win overlay.
    if(rd>1&&(rd-1)%5===0)_e('milestone');
    setTimeout(ps,500);
  }
  window._SP=function(i){
    if(!pt||pl)return;
    fl(i,180);
    if(i===sq[pi]){
      pi++;
      if(pi>=sq.length){pt=false;sm('✓ Round '+rd+'!');setTimeout(nr,700);}
    } else {
      pt=false;
      if(rd>br){br=rd;var _sb2=document.getElementById('Sb');if(_sb2)_sb2.textContent=br;}
      // Record result on mistake. Any round >= 5 counts as a 'win' for
      // stats so strong runs show up green; short busts still register
      // so stats don't lie. Win celebration only on new personal best.
      var strong=(rd>=5);
      if(strong){
        if(rd>=br)try{_playWin&&_playWin();}catch(e){}
        _e('game_win');_sr('simon',{w:true,s:rd});
      } else {
        _e('game_loss');_play('lose');_sr('simon',{w:false,s:rd});
      }
      sm('🍂 Round '+rd+'! Best: '+br+(strong?' ✨':''));
    }
  };
  window._SN=function(){sq=[];pi=0;rd=0;pl=false;pt=false;var _sr3=document.getElementById('Sr');if(_sr3)_sr3.textContent='0';sm('Watch...');setTimeout(nr,600)};_SN();}

window._gameFns.simon=GS;
})();
