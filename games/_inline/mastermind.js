/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: mastermind
 *
 * COPY of the inline GMM mount function from index.html
 * lines 67726-68153.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/mastermind.html shell only. To keep them aligned,
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

  function GMM(a){
    var code=[],guesses=[],cur=[],_mmMode='color';
    var _hintRevealed=-1,_hintUsed=false;
    var _mmGameMode='daily'; // 'daily' | 'random'
    var _mmDailyKey=''; // YYYY-M-D string for today
    var _mmDailyDone=false; // locked after completing daily
    var LETTERS=['A','B','C','D','E','F'];
    var NUMBERS=['1','2','3','4','5','6'];
    // 6 generic shapes for the SHAPE mode — visually distinct enough
    // for young players and colorblind users. SVG uses PAL placeholder
    // that gets replaced with the peg's fill colour at render time.
    var SHAPES=[
      '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="PAL"/><circle cx="20" cy="20" r="6" fill="ACC" opacity="0.7"/></svg>',
      '<svg viewBox="0 0 40 40"><rect x="8" y="8" width="24" height="24" rx="3" fill="PAL"/><rect x="14" y="14" width="12" height="12" rx="1.5" fill="ACC" opacity="0.7"/></svg>',
      '<svg viewBox="0 0 40 40"><polygon points="20,6 34,32 6,32" fill="PAL"/><polygon points="20,14 28,28 12,28" fill="ACC" opacity="0.7"/></svg>',
      '<svg viewBox="0 0 40 40"><polygon points="20,5 35,20 20,35 5,20" fill="PAL"/><polygon points="20,12 28,20 20,28 12,20" fill="ACC" opacity="0.7"/></svg>',
      '<svg viewBox="0 0 40 40"><polygon points="20,5 24,15 35,15 26,22 29,33 20,26 11,33 14,22 5,15 16,15" fill="PAL"/></svg>',
      '<svg viewBox="0 0 40 40"><path d="M15,6 h10 v9 h9 v10 h-9 v9 h-10 v-9 h-9 v-10 h9 z" fill="PAL"/></svg>'
    ];
    // 6 botanical pegs — each a unique plant element
    var PEGS=[
      {name:'Rose',fill:'#c07070',accent:'#e8a0a0',svg:'<svg viewBox="0 0 40 40"><circle cx="20" cy="18" r="11" fill="PAL" opacity="0.9"/><circle cx="20" cy="18" r="7" fill="ACC"/><circle cx="20" cy="18" r="3.5" fill="PAL"/><path d="M20 29 L20 36" stroke="#5a8a3a" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="24" cy="32" rx="4" ry="2.5" fill="#5a8a3a" opacity="0.7" transform="rotate(-20 24 32)"/></svg>'},
      {name:'Fern',fill:'#4a7c35',accent:'#7ab356',svg:'<svg viewBox="0 0 40 40"><path d="M20 36 L20 8" stroke="PAL" stroke-width="2.5" stroke-linecap="round"/><path d="M20 12 Q12 14 10 10" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 12 Q28 14 30 10" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 18 Q13 20 11 16" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 18 Q27 20 29 16" stroke="ACC" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 24 Q14 26 12 22" stroke="ACC" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 24 Q26 26 28 22" stroke="ACC" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M20 29 Q16 31 14 28" stroke="ACC" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 29 Q24 31 26 28" stroke="ACC" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'},
      {name:'Sunflower',fill:'#C8A84B',accent:'#e8d080',svg:'<svg viewBox="0 0 40 40"><g transform="translate(20,17)"><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(0)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(45)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(90)"/><ellipse rx="5" ry="10" fill="ACC" opacity="0.8" transform="rotate(135)"/></g><circle cx="20" cy="17" r="6" fill="#6B4F2D"/><circle cx="20" cy="17" r="4" fill="PAL"/><path d="M20 27 L20 36" stroke="#5a8a3a" stroke-width="2.5" stroke-linecap="round"/></svg>'},
      {name:'Bluebell',fill:'#4a7aaa',accent:'#80b8e0',svg:'<svg viewBox="0 0 40 40"><path d="M20 8 L20 36" stroke="#5a8a3a" stroke-width="2" stroke-linecap="round"/><path d="M14 12 Q14 18 20 18" fill="PAL" opacity="0.85"/><path d="M26 12 Q26 18 20 18" fill="ACC" opacity="0.85"/><path d="M12 19 Q12 25 20 25" fill="PAL" opacity="0.7"/><path d="M28 19 Q28 25 20 25" fill="ACC" opacity="0.7"/><path d="M14 26 Q14 31 20 31" fill="PAL" opacity="0.55"/><path d="M26 26 Q26 31 20 31" fill="ACC" opacity="0.55"/></svg>'},
      {name:'Mushroom',fill:'#9b59b6',accent:'#c48de0',svg:'<svg viewBox="0 0 40 40"><rect x="16" y="22" width="8" height="14" rx="3" fill="#e8dcc8" opacity="0.8"/><ellipse cx="20" cy="22" rx="14" ry="10" fill="PAL"/><ellipse cx="20" cy="22" rx="14" ry="10" fill="ACC" opacity="0.3"/><circle cx="14" cy="18" r="2.5" fill="#e8dcc8" opacity="0.4"/><circle cx="24" cy="16" r="3" fill="#e8dcc8" opacity="0.35"/><circle cx="19" cy="14" r="1.5" fill="#e8dcc8" opacity="0.3"/></svg>'},
      {name:'Ember',fill:'#c76a30',accent:'#e8a060',svg:'<svg viewBox="0 0 40 40"><path d="M20 6 Q28 16 24 24 Q28 20 26 14 Q30 22 24 30 Q22 34 20 36 Q18 34 16 30 Q10 22 14 14 Q12 20 16 24 Q12 16 20 6Z" fill="PAL" opacity="0.9"/><path d="M20 14 Q24 20 22 26 Q20 30 20 32 Q20 30 18 26 Q16 20 20 14Z" fill="ACC" opacity="0.8"/><circle cx="20" cy="24" r="3" fill="#e8dcc8" opacity="0.5"/></svg>'}
    ];
    function pegSvg(idx){var p=PEGS[idx];
      if(_mmMode==='letter')return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:clamp(1.2rem,4vw,1.6rem);font-weight:700;color:'+p.fill+';text-shadow:0 1px 3px rgba(0,0,0,0.5)">'+LETTERS[idx]+'</div>';
      if(_mmMode==='number')return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:clamp(1.2rem,4vw,1.6rem);font-weight:700;color:'+p.fill+';text-shadow:0 1px 3px rgba(0,0,0,0.5)">'+NUMBERS[idx]+'</div>';
      if(_mmMode==='shape')return SHAPES[idx].replace(/PAL/g,p.fill).replace(/ACC/g,p.accent);
      return p.svg.replace(/PAL/g,p.fill).replace(/ACC/g,p.accent)}
    // Difficulty wiring: pre-game modal stashes lw_diff_mastermind in
    // localStorage. Easy = no duplicate colors in the code (much easier
    // to deduce). Higher tiers reduce max guesses to compensate for the
    // same color pool.
    var _mmDiff='medium';try{_mmDiff=localStorage.getItem('lw_diff_mastermind')||'medium';}catch(e){}
    var _mmMaxG={easy:12,medium:10,hard:7,expert:5}[_mmDiff]||10;
    var _mmNoDupes=(_mmDiff==='easy');
    ms(a,'Guesses: <strong id="MMg">0</strong>/'+_mmMaxG);mm(a);
    // Directions
    var dir=document.createElement('div');
    dir.style.cssText='text-align:center;padding:0.5rem 0.8rem;margin:0.3rem auto;max-width:380px;font-family:DM Sans,sans-serif;font-size:clamp(0.65rem,2vw,0.8rem);color:var(--cream);line-height:1.5;opacity:0.85';
    dir.innerHTML='Crack the hidden <strong style="color:var(--gold)">4-seed code</strong>. Pick seeds below, then tap <strong>GUESS</strong>.<br><span style="display:inline-flex;align-items:center;gap:4px;margin-top:4px"><span class="mm-fb-dot exact" style="display:inline-block;width:12px;height:12px"></span> = right seed, right spot</span> &nbsp; <span style="display:inline-flex;align-items:center;gap:4px"><span class="mm-fb-dot close" style="display:inline-block;width:12px;height:12px"></span> = right seed, wrong spot</span>';
    a.appendChild(dir);
    var bd=document.createElement('div');bd.className='mm-board';bd.id='MMb';a.appendChild(bd);
    var cur_d=document.createElement('div');cur_d.className='mm-cur';cur_d.id='MMc';a.appendChild(cur_d);
    var pal=document.createElement('div');pal.className='mm-pal';
    PEGS.forEach(function(p,i){
      var d=document.createElement('div');d.className='mmp';
      d.style.cssText='background:rgba(26,36,22,.8);border-color:'+p.fill;
      d.innerHTML=pegSvg(i);
      d.addEventListener('click',function(){_MMA(i)});
      pal.appendChild(d);
    });
    a.appendChild(pal);
    var _bbs='min-height:52px;padding:0.5rem 1.2rem;font-size:clamp(.6rem,1.8vw,.75rem);flex:1';
    // Stats strip above controls
    var _mmStatsRow=document.createElement('div');
    _mmStatsRow.id='MMstats';
    _mmStatsRow.style.cssText='display:flex;justify-content:center;gap:14px;padding:4px 0;font-family:DM Mono,monospace;font-size:0.62rem;color:rgba(232,220,200,0.7);letter-spacing:0.06em';
    a.appendChild(_mmStatsRow);
    // Restore persisted mode + render
    try{var pm=localStorage.getItem('lw_mm_mode');if(pm==='color'||pm==='shape'||pm==='letter'||pm==='number')_mmMode=pm;}catch(e){}
    try{var gm=localStorage.getItem('lw_mm_game_mode');if(gm==='daily'||gm==='random')_mmGameMode=gm;}catch(e){}
  
    // Two stat buckets kept apart so the daily streak isn't ruined by
    // random-mode losses. byGuesses is a distribution histogram of
    // wins at each guess count (1 through _mmMaxG).
    function _mmDefaultStats(){return{played:0,won:0,streak:0,best:0,byGuesses:[0,0,0,0,0,0,0,0,0,0,0,0]};}
    function _mmLoadStats(key){
      var d=_mmDefaultStats();
      try{var raw=localStorage.getItem(key);if(raw){var p=JSON.parse(raw);for(var k in p)d[k]=p[k];}}catch(e){}
      if(!Array.isArray(d.byGuesses))d.byGuesses=[0,0,0,0,0,0,0,0,0,0,0,0];
      return d;
    }
    function _mmSaveStats(key,s){try{localStorage.setItem(key,JSON.stringify(s));}catch(e){}}
    var _mmStatsRandom=_mmLoadStats('lw_mm_stats');
    var _mmStatsDaily=_mmLoadStats('lw_mm_stats_daily');
    function _mmCurrentStats(){return _mmGameMode==='daily'?_mmStatsDaily:_mmStatsRandom;}
    function _mmPersistCurrent(){
      _mmSaveStats(_mmGameMode==='daily'?'lw_mm_stats_daily':'lw_mm_stats',_mmCurrentStats());
    }
    function _mmRenderStats(){
      var s=_mmCurrentStats();
      var pct=s.played?Math.round(s.won/s.played*100):0;
      var distHtml='';
      var maxCount=0;
      for(var bi=0;bi<s.byGuesses.length;bi++)if(s.byGuesses[bi]>maxCount)maxCount=s.byGuesses[bi];
      if(maxCount>0){
        distHtml='<div style="display:flex;gap:3px;align-items:flex-end;justify-content:center;padding:6px 0 2px;height:28px">';
        for(var bi=0;bi<_mmMaxG;bi++){
          var ct=s.byGuesses[bi]||0;
          var h=maxCount?Math.round((ct/maxCount)*22)+4:4;
          var bg=ct>0?'rgba(200,168,75,0.55)':'rgba(74,124,53,0.15)';
          distHtml+='<div style="width:10px;height:'+h+'px;background:'+bg+';border-radius:2px 2px 0 0;position:relative" title="'+(bi+1)+' guesses: '+ct+'">'
            +(ct>0?'<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:0.42rem;color:var(--muted)">'+(bi+1)+'</div>':'')
            +'</div>';
        }
        distHtml+='</div>';
      }
      _mmStatsRow.innerHTML='<div>played <strong style="color:var(--gold)">'+s.played+'</strong>'
        +' · won <strong style="color:var(--gold)">'+pct+'%</strong>'
        +' · streak <strong style="color:var(--gold)">'+s.streak+'</strong>'
        +' · best <strong style="color:var(--gold)">'+s.best+'</strong></div>'
        +distHtml;
    }
    _mmRenderStats();
  
    // ── Daily code generation ──
    // FNV-style hash on the YYYY-M-D date string. Each byte of the hash
    // picks one of the 6 pegs; first 4 bytes form the code. Same date
    // → same code for everyone globally. Rolls over at local midnight.
    function _mmTodayKey(){
      var d=new Date();
      return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    }
    function _mmDailyCode(){
      var s=_mmTodayKey();
      var h=2166136261;
      for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=(h*16777619)>>>0;}
      var c=[];
      for(var p=0;p<4;p++){
        c.push(h%6);
        h=(h*2654435761)>>>0; // mix before next peg
      }
      return c;
    }
    function _mmLoadDailySnap(){
      try{var raw=localStorage.getItem('lw_mm_daily');if(raw){var p=JSON.parse(raw);if(p.day===_mmTodayKey())return p;}}catch(e){}
      return null;
    }
    function _mmSaveDailySnap(snap){try{localStorage.setItem('lw_mm_daily',JSON.stringify(snap));}catch(e){}}
  
    // ── Game-mode tabs (DAILY | RANDOM) ──
    // Tab-style selector. Switching resets the game state so players
    // can flip between modes without confusion.
    var _modeTab=document.createElement('div');
    _modeTab.style.cssText='display:flex;gap:6px;justify-content:center;padding:6px 0 4px';
    _modeTab.innerHTML='<button class="gb" id="MMdaily" style="min-height:38px;padding:4px 16px;font-size:0.68rem">📅 DAILY</button>'
      +'<button class="gb" id="MMrandom" style="min-height:38px;padding:4px 16px;font-size:0.68rem">🎲 RANDOM</button>';
    a.insertBefore(_modeTab,_mmStatsRow);
    function _mmSyncModeTabs(){
      var db=document.getElementById('MMdaily'),rb=document.getElementById('MMrandom');
      var activeCss='background:rgba(200,168,75,0.22);border-color:rgba(200,168,75,0.55);color:var(--gold)';
      var inactiveCss='';
      if(db)db.style.cssText='min-height:38px;padding:4px 16px;font-size:0.68rem;'+(_mmGameMode==='daily'?activeCss:inactiveCss);
      if(rb)rb.style.cssText='min-height:38px;padding:4px 16px;font-size:0.68rem;'+(_mmGameMode==='random'?activeCss:inactiveCss);
    }
    document.getElementById('MMdaily').onclick=function(){
      if(_mmGameMode==='daily')return;
      _mmGameMode='daily';try{localStorage.setItem('lw_mm_game_mode','daily');}catch(e){}
      _MMN();
    };
    document.getElementById('MMrandom').onclick=function(){
      if(_mmGameMode==='random')return;
      _mmGameMode='random';try{localStorage.setItem('lw_mm_game_mode','random');}catch(e){}
      _MMN();
    };
    function _mmModeLabel(){return _mmMode.charAt(0).toUpperCase()+_mmMode.slice(1);}
    mc(a).innerHTML='<div style="display:flex;gap:8px;padding:4px 0;flex-wrap:wrap;justify-content:center"><button class="gb" style="'+_bbs+';background:rgba(74,124,53,.2);border-color:rgba(122,179,86,.35);color:var(--sage)" onclick="_MMG()">&#10003; GUESS</button><button class="gb" style="'+_bbs+'" onclick="_MMU()">&#9003; UNDO</button><button class="gb" style="'+_bbs+'" onclick="_MMH()" id="MMhint">💡 HINT</button><button class="gb" style="'+_bbs+'" onclick="_MMMode()" id="MMmode">MODE: '+_mmModeLabel().toUpperCase()+'</button><button class="gb-new" onclick="_MMN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button></div>';
    function rn(){
      bd.innerHTML='';
      guesses.forEach(function(g){
        var row=document.createElement('div');row.className='mmr';
        g.guess.forEach(function(c){
          var d=document.createElement('div');d.className='mmp';
          d.style.cssText='background:rgba(26,36,22,.8);border-color:'+PEGS[c].fill;
          d.innerHTML=pegSvg(c);row.appendChild(d);
        });
        // Feedback dots
        var fb=document.createElement('div');fb.className='mm-fb';
        for(var i=0;i<g.exact;i++){var dot=document.createElement('div');dot.className='mm-fb-dot exact';fb.appendChild(dot)}
        for(var i=0;i<g.close;i++){var dot=document.createElement('div');dot.className='mm-fb-dot close';fb.appendChild(dot)}
        for(var i=0;i<4-g.exact-g.close;i++){var dot=document.createElement('div');dot.className='mm-fb-dot miss';fb.appendChild(dot)}
        row.appendChild(fb);
        bd.appendChild(row);
      });
      bd.scrollTop=bd.scrollHeight;
      rnC();
    }
    function rnC(){
      cur_d.innerHTML='';
      for(var i=0;i<4;i++){
        var d=document.createElement('div');d.className='mmp';
        if(cur[i]!==undefined){
          d.style.cssText='background:rgba(26,36,22,.8);border-color:'+PEGS[cur[i]].fill+';cursor:pointer';
          d.innerHTML=pegSvg(cur[i]);
        }else{
          d.style.cssText='background:rgba(26,36,22,.6);border-color:rgba(74,124,53,.2);cursor:pointer';
          d.innerHTML='<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="4" fill="rgba(200,188,160,.15)"/></svg>';
        }
        d.setAttribute('data-i',i);
        d.addEventListener('click',function(){_MMT(parseInt(this.getAttribute('data-i')))});
        cur_d.appendChild(d);
      }
    }
    window._MMA=function(c){if(_mmDailyDone)return;_play('tap');if(cur.length<4)cur.push(c);rnC()};
    window._MMT=function(i){if(_mmDailyDone)return;if(cur[i]!==undefined){_play('tap');cur[i]=(cur[i]+1)%6;rnC()}};
    window._MMU=function(){if(_mmDailyDone)return;if(cur.length>0){_play('tap');cur.pop();rnC()}};
    window._MMG=function(){
      if(_mmDailyDone){sm('Come back tomorrow for a new code');return;}
      if(cur.length!==4){sm('Place 4 seeds first');return;}
      _play('snap');
      // Haptic buzz on guess submit \u2014 same feel as Wordle's Enter
      try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
      var exact=0,close=0,cc=code.slice(),gc=cur.slice();
      for(var i=0;i<4;i++)if(gc[i]===cc[i]){exact++;cc[i]=-1;gc[i]=-2}
      for(var i=0;i<4;i++){if(gc[i]<0)continue;var j=cc.indexOf(gc[i]);if(j>-1){close++;cc[j]=-1}}
      guesses.push({guess:cur.slice(),exact:exact,close:close});cur=[];
      document.getElementById('MMg').textContent=guesses.length;
      if(exact>0)_e('progress');
      var st=_mmCurrentStats();
      if(exact===4){
        _e('game_win');_playWin();
        _sr('mastermind',{w:true,s:guesses.length});
        st.played++;st.won++;st.streak++;
        if(st.streak>st.best)st.best=st.streak;
        if(guesses.length>=1&&guesses.length<=st.byGuesses.length)st.byGuesses[guesses.length-1]++;
        _mmPersistCurrent();_mmRenderStats();
        if(_mmGameMode==='daily'){_mmDailyDone=true;_mmSaveDailySnap({day:_mmTodayKey(),won:true,guesses:guesses.slice(),code:code.slice()});}
        _mmShowResult(true,guesses.length);
      }
      else if(guesses.length>=_mmMaxG){
        _e('game_loss');
        _sr('mastermind',{w:false,s:0});
        st.played++;st.streak=0;
        _mmPersistCurrent();_mmRenderStats();
        if(_mmGameMode==='daily'){_mmDailyDone=true;_mmSaveDailySnap({day:_mmTodayKey(),won:false,guesses:guesses.slice(),code:code.slice()});}
        _mmShowResult(false,null);
      }
      rn();
    };
    // Mode cycles through COLOR \u2192 SHAPE \u2192 LETTER \u2192 NUMBER \u2192 back to COLOR.
    // Shape mode is geometric (circle/square/triangle/diamond/star/plus)
    // for kids and colorblind players who do better with form than hue.
    window._MMMode=function(){
      var next={color:'shape',shape:'letter',letter:'number',number:'color'};
      _mmMode=next[_mmMode]||'color';
      try{localStorage.setItem('lw_mm_mode',_mmMode);}catch(e){}
      var btn=document.getElementById('MMmode');
      if(btn)btn.textContent='MODE: '+_mmMode.toUpperCase();
      _play('tap');
      pal.innerHTML='';
      PEGS.forEach(function(p,i){
        var d=document.createElement('div');d.className='mmp';
        d.style.cssText='background:rgba(26,36,22,.8);border-color:'+p.fill;
        d.innerHTML=pegSvg(i);
        d.addEventListener('click',function(){_MMA(i)});
        pal.appendChild(d);
      });
      rn();
    };
    // Hint: reveal one peg of the secret code in a slot the player
    // hasn't already solved. Costs one guess (bumps the counter toward
    // the max) and can only be used once per game.
    window._MMH=function(){
      if(_hintUsed){sm('Already used your hint');return;}
      if(guesses.length>=_mmMaxG){sm('No guesses left');return;}
      // Find a position the player hasn't correctly placed in cur
      var candidates=[];
      for(var i=0;i<4;i++){
        if(cur[i]===undefined||cur[i]!==code[i])candidates.push(i);
      }
      if(!candidates.length){sm('Your current guess already matches \u2014 hit GUESS');return;}
      var pos=candidates[Math.floor(Math.random()*candidates.length)];
      cur[pos]=code[pos];
      _hintUsed=true;
      _hintRevealed=pos;
      var btn=document.getElementById('MMhint');
      if(btn){btn.disabled=true;btn.style.opacity='0.4';btn.innerHTML='\ud83d\udca1 USED';}
      _play('snap');
      sm('Hint: position '+(pos+1)+' is '+PEGS[code[pos]].name);
      rnC();
    };
    // ── Result card ──
    // Wordle-style card shown on win or loss with share button and
    // "next code in HH:MM" countdown for the daily mode.
    var _resultHost=document.createElement('div');
    _resultHost.id='MMresult';
    _resultHost.style.cssText='margin:6px auto;max-width:360px;padding:0 8px';
    a.appendChild(_resultHost);
    function _mmEmojiGrid(){
      // 🟩 = exact (right peg, right spot)
      // 🟨 = close (right peg, wrong spot)
      // ⬛ = miss
      // Each row shows feedback totals spread across 4 cells, greens
      // first, then golds, then misses. Ordering is NOT positional
      // because feedback itself is non-positional.
      var lines=[];
      for(var r=0;r<guesses.length;r++){
        var g=guesses[r];
        var row='';
        for(var e=0;e<g.exact;e++)row+='🟩';
        for(var c=0;c<g.close;c++)row+='🟨';
        for(var m=0;m<4-g.exact-g.close;m++)row+='⬛';
        lines.push(row);
      }
      return lines.join('\n');
    }
    function _mmTimeToNext(){
      var now=new Date();
      var nxt=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0);
      var ms=nxt-now;
      var h=Math.floor(ms/3600000);var m=Math.floor((ms%3600000)/60000);
      return (h<10?'0':'')+h+':'+(m<10?'0':'')+m;
    }
    function _mmShowResult(won,inGuesses){
      var modeLbl=_mmGameMode==='daily'?('Daily · '+_mmTodayKey()):'Random';
      var title=won?('🌸 Cracked in '+inGuesses+'!'):'🥀 The code was:';
      var codeLine=won?'':('<div style="padding:6px 0;font-family:DM Mono,monospace;font-size:0.72rem;color:var(--cream);opacity:0.9">'+code.map(function(c){return PEGS[c].name;}).join(' · ')+'</div>');
      var grid=_mmEmojiGrid().replace(/\n/g,'<br>');
      var countdown=(_mmGameMode==='daily')?'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.06em;padding-top:6px">Next code in <strong style="color:var(--gold)" id="MMcountdown">'+_mmTimeToNext()+'</strong></div>':'';
      var nextBtn=(_mmGameMode==='random')?'<button class="gb" onclick="_MMN()" style="min-height:44px;padding:8px 20px;font-size:0.75rem">🔄 PLAY AGAIN</button>':'';
      _resultHost.innerHTML='<div style="text-align:center;padding:14px 12px 12px;background:rgba(13,16,12,0.85);border:1.5px solid '+(won?'rgba(122,179,86,0.45)':'rgba(200,80,80,0.35)')+';border-radius:12px;">'
        +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.95rem;letter-spacing:0.1em;color:'+(won?'var(--sage)':'var(--gold)')+';margin-bottom:3px">'+title+'</div>'
        +codeLine
        +'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);letter-spacing:0.06em;margin-bottom:8px">'+modeLbl+'</div>'
        +'<div style="font-size:1.1rem;line-height:1.2;letter-spacing:0.04em">'+grid+'</div>'
        +'<div style="display:flex;gap:8px;justify-content:center;padding-top:10px;flex-wrap:wrap">'
          +'<button class="gb" onclick="_MMShare()" style="min-height:44px;padding:8px 20px;font-size:0.75rem;background:rgba(200,168,75,0.18);border-color:rgba(200,168,75,0.4);color:var(--gold)">📤 SHARE</button>'
          +nextBtn
        +'</div>'
        +countdown
        +'</div>';
      // Tick the countdown every minute while the card is visible
      if(_mmGameMode==='daily'){
        clearInterval(_mmCountdownIv);
        _mmCountdownIv=setInterval(function(){
          var el=document.getElementById('MMcountdown');
          if(!el){clearInterval(_mmCountdownIv);return;}
          el.textContent=_mmTimeToNext();
        },30000);
      }
    }
    var _mmCountdownIv=null;
  
    window._MMShare=function(){
      var modeLbl=_mmGameMode==='daily'?('Daily · '+_mmTodayKey()):'Random';
      var result=guesses.length===0?'?':(guesses[guesses.length-1].exact===4?(''+guesses.length+'/'+_mmMaxG):('X/'+_mmMaxG));
      var text='SEED CODE · '+modeLbl+' · '+result+'\n\n'+_mmEmojiGrid()+'\n\nlucidwinds.com';
      if(navigator.share){
        navigator.share({text:text}).catch(function(){_mmClipCopy(text);});
      }else{
        _mmClipCopy(text);
      }
    };
    function _mmClipCopy(text){
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){sm('Copied to clipboard');}).catch(function(){_mmFallbackCopy(text);});
      }else{
        _mmFallbackCopy(text);
      }
    }
    function _mmFallbackCopy(text){
      var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
      document.body.appendChild(ta);ta.select();
      try{document.execCommand('copy');sm('Copied to clipboard');}catch(e){sm('Copy failed');}
      document.body.removeChild(ta);
    }
  
    // ── Keyboard input ──
    // Desktop players: 1-6 place pegs, 0 clears last slot (same as
    // BACKSPACE), ENTER guesses, H for hint. Mobile players keep the
    // palette taps. Listener installs once per game session and
    // self-cleans when body.game-active goes away.
    function _mmKeyHandler(e){
      if(_mmDailyDone)return;
      var ae=document.activeElement;
      if(ae&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'||ae.isContentEditable))return;
      var k=e.key;
      if(k>='1'&&k<='6'){_MMA(parseInt(k)-1);e.preventDefault();return;}
      if(k==='Backspace'||k==='Delete'||k==='0'){_MMU();e.preventDefault();return;}
      if(k==='Enter'){_MMG();e.preventDefault();return;}
      if(k==='h'||k==='H'){_MMH();e.preventDefault();return;}
    }
    document.addEventListener('keydown',_mmKeyHandler);
    var _mmWatch=setInterval(function(){
      if(!document.body.classList.contains('game-active')){
        document.removeEventListener('keydown',_mmKeyHandler);
        clearInterval(_mmWatch);
        if(_mmCountdownIv){clearInterval(_mmCountdownIv);_mmCountdownIv=null;}
      }
    },1000);
  
    window._MMN=function(){
      // Re-read difficulty + refresh mode tabs
      try{_mmDiff=localStorage.getItem('lw_diff_mastermind')||'medium';}catch(e){}
      _mmMaxG={easy:12,medium:10,hard:7,expert:5}[_mmDiff]||10;
      _mmNoDupes=(_mmDiff==='easy');
      _mmSyncModeTabs();
      code=[];guesses=[];cur=[];
      _hintUsed=false;_hintRevealed=-1;_mmDailyDone=false;
      _mmDailyKey=_mmTodayKey();
      if(_mmGameMode==='daily'){
        code=_mmDailyCode();
        var snap=_mmLoadDailySnap();
        if(snap&&snap.day===_mmDailyKey){
          // Restore completed daily state — board locked, result visible
          guesses=snap.guesses||[];
          code=snap.code||code;
          _mmDailyDone=true;
        }
      }else{
        if(_mmNoDupes){
          var pool=[0,1,2,3,4,5];
          for(var p=pool.length-1;p>0;p--){var j=Math.floor(Math.random()*(p+1));var t=pool[p];pool[p]=pool[j];pool[j]=t;}
          code=pool.slice(0,4);
        }else{
          for(var i=0;i<4;i++)code.push(Math.floor(Math.random()*6));
        }
      }
      var hbtn=document.getElementById('MMhint');
      if(hbtn){hbtn.disabled=!!_mmDailyDone;hbtn.style.opacity=_mmDailyDone?'0.4':'';hbtn.innerHTML='💡 HINT';}
      var msb=document.querySelector('.fg-ms');
      if(msb)msb.innerHTML='Guesses: <strong id="MMg">'+guesses.length+'</strong>/'+_mmMaxG;
      _resultHost.innerHTML='';
      if(_mmCountdownIv){clearInterval(_mmCountdownIv);_mmCountdownIv=null;}
      sm(_mmDailyDone?'Daily already played — come back tomorrow':'');
      _mmRenderStats();rn();
      if(_mmDailyDone){
        var lastG=guesses.length&&guesses[guesses.length-1];
        var won=lastG&&lastG.exact===4;
        _mmShowResult(!!won,won?guesses.length:null);
      }
    };_MMN();
  }

  window._gameFns['mastermind']=GMM;
})();
