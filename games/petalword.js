// ═══ LUCID WINDS — Petal Word (5-letter word puzzle) ═══
// 6 guesses to find the hidden 5-letter word.
//   Green tile  = right letter, right position
//   Gold tile   = right letter, wrong position
//   Muted tile  = letter not in the word
// On-screen QWERTY for mobile, with hardware keyboard support.
// Answer pool ~350 common English words plus botanical flavor.
// Valid guesses must be in the pool (prevents random gibberish).
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

// ── Word pool: ~350 common 5-letter English words + botanical extras
var WORDS=('about above abuse actor acute admit adopt adult after again agent agree ahead alarm album alert alike alive allow alone along alter among anger angle angry apart apple apply arena argue arise array aside asset audio audit avoid award aware badge badly baker basic basis beach began begin being below bench berry birth black blame blank blast blend bless blind block blood board boost booth bound brain brand bread break breed brief bring broad broke brown build built buyer cable carry catch cause chain chair chart chase cheap check chest chief child chose civil claim class clean clear click clock close coach coast could count court cover craft crash cream crime cross crowd crown curve cycle daily dance dated dealt death debut delay depth doing doubt dozen draft drama drawn dream dress drill drink drive drove dying eager early earth eight elite empty enemy enjoy enter entry equal error event every exact exist extra faith false fault fiber field fifth fifty fight final first fixed flash fleet floor fluid focus force forth forty forum found frame frank fresh front fruit fully funny giant given glass globe going grace grade grand grant grass great green gross group grown guard guess guest guide happy heart heavy horse hotel house human ideal image index inner input irony issue judge known label large laser later laugh learn lease least leave legal level light limit local logic loose lower lucky lunch lying magic major maker march match mayor meant media metal might minor minus mixed model money month moral motor mount mouse mouth movie music needs never newly night noise north noted novel nurse occur ocean offer often order other ought paint panel paper party peace phase phone photo piece pilot pitch place plain plane plant plate point pound power press price pride prime print prior prize proof proud prove queen quick quiet quite radio raise range rapid ratio reach ready realm refer right rival river roman rough round route royal rural scale scene scope score sense serve seven shall shape share sharp sheet shelf shell shift shirt shock shoot short shown sight since sixth sixty sized skill sleep slide small smart smile smoke solid solve sorry sound south space spare speak speed spend spent split spoke sport staff stage stake stand start state steam steel stick still stock stone stood store storm story strip stuck study stuff style sugar suite super sweet table taken taste teach teeth thank theft their theme there these thick thing think third those three threw throw tight times tired title today topic total touch tough tower track trade train treat trend trial tried tries truck truly trust truth twice under undue union unity until upper upset urban usage usual valid value video virus visit vital voice waste watch water wheel where which while white whole whose woman women world worry worse worst worth would wound write wrong wrote yield young youth acorn alder amber anise anvil apron arbor aspen aster atoll basin beach birch bloom briar broom cedar daisy dandy ferns fairy field flora gourd grain grove heath ivory lemon liana lilac lotus magic maple marsh mossy myrrh olive onion peach peony petal plant plumb poppy raven roots rosed sedge seeds shoot snail spore stalk stone storm sumac swamp thorn tulip vines weeds wheat fruit').split(' ');
// Dedupe + clean
(function(){var seen={},out=[];for(var i=0;i<WORDS.length;i++){var w=WORDS[i].toLowerCase();if(w.length===5&&!seen[w]){seen[w]=1;out.push(w);}}WORDS=out;})();

var KEY_ROWS=['qwertyuiop','asdfghjkl','zxcvbnm'];

(function injectStyle(){
  if(document.getElementById('pw-petal-style'))return;
  var s=document.createElement('style');s.id='pw-petal-style';
  s.cssText=[
    '.pw-board{display:flex;flex-direction:column;gap:6px;align-items:center;padding:10px 6px;}',
    '.pw-row{display:flex;gap:6px;}',
    '.pw-cell{width:clamp(40px,11vw,56px);height:clamp(40px,11vw,56px);border:2px solid rgba(74,124,53,0.35);background:rgba(13,16,12,0.6);color:var(--cream,#e8dcc8);font-family:Bebas Neue,sans-serif;font-size:clamp(1.4rem,5vw,2rem);display:flex;align-items:center;justify-content:center;text-transform:uppercase;border-radius:4px;transition:transform .15s ease,background .25s ease,border-color .25s ease;}',
    '.pw-cell.pw-typed{border-color:rgba(200,168,75,0.7);transform:scale(1.05);}',
    '.pw-cell.pw-hit{background:var(--sage,#7ab356);border-color:var(--sage,#7ab356);color:#0d100c;}',
    '.pw-cell.pw-near{background:var(--gold,#c8a84b);border-color:var(--gold,#c8a84b);color:#0d100c;}',
    '.pw-cell.pw-miss{background:rgba(40,44,36,0.85);border-color:rgba(60,68,54,0.85);color:rgba(232,220,200,0.5);}',
    '.pw-flip{animation:pwFlip .55s ease both;}',
    '@keyframes pwFlip{0%{transform:rotateX(0)}50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}',
    '.pw-shake{animation:pwShake .4s ease;}',
    '@keyframes pwShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}',
    '.pw-keyboard{display:flex;flex-direction:column;gap:6px;align-items:center;padding:10px 4px 14px;}',
    '.pw-krow{display:flex;gap:4px;justify-content:center;width:100%;max-width:480px;}',
    '.pw-key{flex:1;min-width:0;height:48px;border:1px solid rgba(74,124,53,0.3);background:rgba(26,31,23,0.85);color:var(--cream,#e8dcc8);font-family:DM Mono,monospace;font-size:0.75rem;font-weight:700;text-transform:uppercase;border-radius:6px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;transition:background .25s ease,border-color .25s ease;padding:0;}',
    '.pw-key.pw-wide{flex:1.5;font-size:0.55rem;}',
    '.pw-key.pw-hit{background:var(--sage,#7ab356);border-color:var(--sage,#7ab356);color:#0d100c;}',
    '.pw-key.pw-near{background:var(--gold,#c8a84b);border-color:var(--gold,#c8a84b);color:#0d100c;}',
    '.pw-key.pw-miss{background:rgba(28,32,24,0.95);border-color:rgba(40,46,34,0.85);color:rgba(232,220,200,0.35);}',
    '.pw-msg{font-family:DM Mono,monospace;font-size:0.6rem;color:var(--gold,#c8a84b);text-align:center;min-height:1.2em;letter-spacing:0.06em;padding:4px 0;}'
  ].join('');
  document.head.appendChild(s);
})();

window._gameFns=window._gameFns||{};
window._gameFns.petalword=function GPW(a){
  var answer='',row=0,col=0,grid=[],done=false;
  var keyState={}; // letter -> 'hit'|'near'|'miss'
  ms(a,'Guess: <strong id="PWg">0</strong>/6');
  mm(a,'Find the 5-letter word');
  var wrap=document.createElement('div');wrap.className='pw-board';wrap.id='PWboard';a.appendChild(wrap);
  var msg=document.createElement('div');msg.className='pw-msg';msg.id='PWmsg';a.appendChild(msg);
  var kb=document.createElement('div');kb.className='pw-keyboard';kb.id='PWkb';a.appendChild(kb);
  mc(a).innerHTML='<button class="gb" onclick="window._PWNew()">🔄 New Word</button>';

  function pickWord(){return WORDS[Math.floor(Math.random()*WORDS.length)];}

  function buildBoard(){
    wrap.innerHTML='';grid=[];
    for(var r=0;r<6;r++){
      var rowEl=document.createElement('div');rowEl.className='pw-row';
      var cells=[];
      for(var c=0;c<5;c++){
        var cell=document.createElement('div');cell.className='pw-cell';
        rowEl.appendChild(cell);cells.push(cell);
      }
      wrap.appendChild(rowEl);grid.push(cells);
    }
  }

  function buildKeyboard(){
    kb.innerHTML='';
    for(var r=0;r<KEY_ROWS.length;r++){
      var rowEl=document.createElement('div');rowEl.className='pw-krow';
      if(r===2){
        var enter=document.createElement('button');enter.className='pw-key pw-wide';enter.textContent='ENTER';enter.setAttribute('data-k','enter');
        enter.onclick=function(){submitGuess();};
        rowEl.appendChild(enter);
      }
      var letters=KEY_ROWS[r];
      for(var i=0;i<letters.length;i++){
        var k=document.createElement('button');k.className='pw-key';k.textContent=letters[i];k.setAttribute('data-k',letters[i]);
        k.onclick=(function(letter){return function(){typeLetter(letter);};})(letters[i]);
        rowEl.appendChild(k);
      }
      if(r===2){
        var del=document.createElement('button');del.className='pw-key pw-wide';del.innerHTML='⌫';del.setAttribute('data-k','back');
        del.onclick=function(){deleteLetter();};
        rowEl.appendChild(del);
      }
      kb.appendChild(rowEl);
    }
  }

  function showMsg(t){msg.textContent=t;}

  function typeLetter(ch){
    if(done||row>=6||col>=5)return;
    grid[row][col].textContent=ch;
    grid[row][col].classList.add('pw-typed');
    col++;
    _play('tap');
  }

  function deleteLetter(){
    if(done||col<=0)return;
    col--;
    grid[row][col].textContent='';
    grid[row][col].classList.remove('pw-typed');
  }

  function shakeRow(r){
    for(var c=0;c<5;c++){
      grid[r][c].classList.add('pw-shake');
      (function(cell){setTimeout(function(){cell.classList.remove('pw-shake');},420);})(grid[r][c]);
    }
  }

  function buildGuess(){
    var g='';for(var c=0;c<5;c++)g+=(grid[row][c].textContent||'').toLowerCase();
    return g;
  }

  function submitGuess(){
    if(done)return;
    if(col<5){showMsg('Need 5 letters');shakeRow(row);return;}
    var guess=buildGuess();
    if(WORDS.indexOf(guess)<0){showMsg('Not in word list');shakeRow(row);return;}
    showMsg('');
    // Score the guess: handle duplicate letters correctly. First pass
    // marks exact hits and consumes those letters from the answer pool.
    // Second pass marks remaining letters as near or miss.
    var status=['miss','miss','miss','miss','miss'];
    var ansArr=answer.split('');
    var taken=[false,false,false,false,false];
    for(var c=0;c<5;c++){
      if(guess[c]===ansArr[c]){status[c]='hit';taken[c]=true;}
    }
    for(var c=0;c<5;c++){
      if(status[c]==='hit')continue;
      for(var k=0;k<5;k++){
        if(!taken[k]&&guess[c]===ansArr[k]){status[c]='near';taken[k]=true;break;}
      }
    }
    // Animate each cell with a flip + color, staggered for satisfaction
    for(var c=0;c<5;c++){
      (function(c){
        setTimeout(function(){
          var cell=grid[row][c];
          cell.classList.add('pw-flip');
          cell.classList.remove('pw-typed');
          setTimeout(function(){
            cell.classList.add('pw-'+status[c]);
            // Update keyboard color (only upgrade severity: miss→near→hit)
            var letter=guess[c];
            var cur=keyState[letter];var next=status[c];
            var rank={miss:1,near:2,hit:3};
            if(!cur||rank[next]>rank[cur]){
              keyState[letter]=next;
              var keyEl=kb.querySelector('[data-k="'+letter+'"]');
              if(keyEl){
                keyEl.classList.remove('pw-hit','pw-near','pw-miss');
                keyEl.classList.add('pw-'+next);
              }
            }
          },280);
        },c*220);
      })(c);
    }
    // After all flips finish, evaluate end state
    setTimeout(function(){
      if(guess===answer){
        done=true;
        var bonus=6-row; // remaining guesses
        // Reward scaled by efficiency. _e()'s "milestone" gives a small
        // hash bump per remaining guess; "game_win" is the main grant.
        for(var b=0;b<bonus;b++)_e('milestone');
        _e('game_win');
        if(_playWin)_playWin();
        showMsg('🌿 Solved in '+(row+1)+'!');
        _sr('petalword',{w:true,s:row+1});
      } else {
        row++;col=0;
        var gEl=document.getElementById('PWg');if(gEl)gEl.textContent=row;
        if(row>=6){
          done=true;
          showMsg('🥀 The word was: '+answer.toUpperCase());
          _sr('petalword',{w:false,s:answer});
        }
      }
    },5*220+320);
  }

  // Hardware keyboard support (on devices with one)
  function onKey(e){
    if(done)return;
    if(e.key==='Enter'){submitGuess();e.preventDefault();return;}
    if(e.key==='Backspace'){deleteLetter();e.preventDefault();return;}
    var ch=(e.key||'').toLowerCase();
    if(ch.length===1&&ch>='a'&&ch<='z')typeLetter(ch);
  }
  document.addEventListener('keydown',onKey);
  // Cleanup on game switch (game-active class drops when player exits)
  var watcher=setInterval(function(){
    if(!document.body.classList.contains('game-active')){
      document.removeEventListener('keydown',onKey);
      clearInterval(watcher);
    }
  },1000);

  window._PWNew=function(){
    answer=pickWord();row=0;col=0;done=false;keyState={};
    var gEl=document.getElementById('PWg');if(gEl)gEl.textContent='0';
    showMsg('');buildBoard();buildKeyboard();
  };
  _PWNew();
};
})();
