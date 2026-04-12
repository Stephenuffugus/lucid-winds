// ═══ LUCID WINDS — Sprout (Wordle-style 5-letter deduction) ═══
(function(){
'use strict';



window._gameFns=window._gameFns||{};
window._gameFns.sprout=function SP(a){
  // Compact botanical/common 5-letter word pool (~300 words).
  var WORDS=('BLOOM,FROND,SPORE,THORN,PETAL,FLORA,PLANT,SHRUB,STALK,GROVE,HERBS,TULIP,LILAC,DAISY,PANSY,ASTER,CEDAR,BIRCH,MAPLE,OLIVE,'+
    'HEDGE,WHEAT,GRAIN,GOURD,FUNGI,LEAFY,GROWN,SEEDS,FIELD,MARSH,CREEK,EARTH,MULCH,PRUNE,GRAFT,FRUIT,BERRY,MELON,PEACH,MANGO,'+
    'LEMON,GRAPE,ACORN,ALDER,CROPS,FERNS,GRASS,LOTUS,MAIZE,PALMS,REEDS,ROSES,VINES,BOUGH,BRIAR,ABOUT,ABOVE,AFTER,AGAIN,ALIGN,'+
    'ALLOW,ALONE,ALONG,ANGRY,APART,APPLE,APPLY,ARENA,ARGUE,ARISE,ASIDE,AVOID,AWAKE,AWARD,AWARE,BASIC,BEACH,BEGIN,BEING,BELOW,'+
    'BENCH,BIRTH,BLACK,BLAME,BLANK,BLAST,BLAZE,BLEED,BLEND,BLIND,BLOCK,BLOOD,BOARD,BOUND,BRAIN,BRAND,BRAVE,BREAD,BREAK,BREED,'+
    'BRIEF,BRING,BROAD,BROKE,BROWN,BRUSH,BUILD,BURST,BUYER,CABIN,CABLE,CAMEL,CANDY,CARGO,CATCH,CAUSE,CHAIN,CHAIR,CHALK,CHAMP,'+
    'CHARM,CHART,CHASE,CHEAP,CHECK,CHESS,CHEST,CHICK,CHIEF,CHILD,CHILI,CHILL,CHINA,CHIRP,CHOIR,CHOKE,CHOSE,CIVIC,CIVIL,CLAIM,'+
    'CLAMP,CLASH,CLASS,CLEAN,CLEAR,CLERK,CLICK,CLIFF,CLIMB,CLOCK,CLOSE,CLOTH,CLOUD,CLOWN,CLUCK,COACH,COAST,COLOR,COULD,COUNT,'+
    'COURT,COVER,CRACK,CRAFT,CRANE,CRASH,CRAZY,CREAM,CREPT,CRIED,CRISP,CROSS,CROWD,CROWN,CRUEL,CRUSH,CRUST,CURVE,DAILY,DANCE,'+
    'DATED,DEALT,DEATH,DEBUT,DECAL,DECAY,DELAY,DEPTH,DRAFT,DRAIN,DRANK,DRAWN,DREAM,DRESS,DRIED,DRIFT,DRILL,DRINK,DRIVE,DROVE,'+
    'DRYLY,DWELL,EAGER,EAGLE,EARLY,ENEMY,ENJOY,ENTER,ENTRY,EQUAL,ERROR,EVENT,EVERY,EXACT,EXIST,EXTRA,FAITH,FALSE,FANCY,FAULT,'+
    'FENCE,FEVER,FEWER,FIBER,FIGHT,FINAL,FIRST,FIXED,FLAIR,FLAKE,FLAME,FLASH,FLEET,FLESH,FLICK,FLING,FLOAT,FLOCK,FLOOD,FLOOR,'+
    'FLOUR,FOCUS,FORCE,FORTH,FORTY,FORUM,FOUND,FRAME,FRANK,FRESH,FROWN,GIANT,GLASS,GLEAM,GLIDE,GLOBE,GLOOM,GLORY,GLOVE,GRACE,'+
    'GRAND,GRANT,GRAVE,GREAT,GREEN,GUARD,GUESS,GUEST,GUIDE,HABIT,HAPPY,HARDY,HARSH,HATCH,HEART,HEAVY,HENCE,HORSE,HOTEL,HOUSE,'+
    'HUMAN,IDEAL,IMAGE,INDEX,INNER,INPUT,JOINT,JUICE,JUMPY,KNIFE,KNOCK,KNOWN,LABEL,LAPSE,LARGE,LATER,LAYER,LEARN,LEAST,LEAVE,'+
    'LEGAL,LEVEL,LIGHT,LIMIT,LOCAL,LOGIC,LOOSE,LOVER,LOWER,LOYAL,LUCKY,LUNAR,LUNCH,MAGIC,MAJOR,MATCH,MIGHT,MINOR,MIXED,MONEY,'+
    'MONTH,MORAL,MOTOR,MOUNT,MOUSE,MOUTH,MOVIE,MUSIC,NEVER,NEWER,NIGHT,NOBLE,NOISE,NORTH,NOVEL,NURSE,OCEAN,OFFER,OFTEN,ORDER,'+
    'ORGAN,OTHER,OUTER,OWNER,PAINT,PANEL,PAPER,PARTY,PEACE,PHONE,PIANO,PIECE,PILOT,PITCH,PLACE,PLAIN,PLATE,PLAZA,POINT,POUND,'+
    'POWER,PRESS,PRICE,PRIDE,PRIZE,PROUD,QUEEN,QUICK,QUIET,QUITE,RADIO,RAISE,RANGE,RAPID,RATIO,REACH,READY,REALM,REBEL,REFER,'+
    'RELAX,REPLY,RIDGE,RIGHT,RIVAL,RIVER,ROBIN,ROUND,ROUTE,ROYAL,SCALE,SCENE,SCOPE,SCORE,SENSE,SHADE,SHAKE,SHALL,SHAPE,SHARP,'+
    'SHEER,SHEET,SHELF,SHELL,SHIFT,SHINE,SHIRT,SHOCK,SHONE,SHOOT,SHORE,SHORT,SHOWN,SIGHT,SILLY,SINCE,SKILL,SLEEP,SLIDE,SMALL,'+
    'SMART,SMILE,SMOKE,SNAKE,SOLID,SOLVE,SORRY,SOUND,SOUTH,SPACE,SPARE,SPEAK,SPEED,SPELL,SPEND,SPLIT,SPOKE,SPORT,STAFF,STAGE,'+
    'STAND,START,STATE,STEAM,STEEL,STEEP,STEER,STICK,STILL,STOCK,STONE,STOOD,STORE,STORM,STORY,STOUT,STRAP,STRAW,STUDY,STUFF,'+
    'STYLE,SUGAR,SUITE,SUPER,SWEET,SWIFT,SWING,SWORN,TABLE,TASTE,TEACH,TENSE,TERRY,THANK,THEFT,THEIR,THEME,THERE,THESE,THICK,'+
    'THING,THINK,THIRD,THOSE,THREE,THREW,THROW,THUMB,TIGER,TIGHT,TIMER,TODAY,TOOTH,TOPIC,TOTAL,TOUCH,TOUGH,TOWER,TRACK,TRADE,'+
    'TRAIL,TRAIN,TREAT,TREND,TRIAL,TRIBE,TRICK,TRIED,TRUCK,TRULY,TRUNK,TRUST,TRUTH,TWICE,UNDER,UNION,UNITY,UNTIL,UPPER,UPSET,'+
    'URBAN,USAGE,USUAL,VALID,VALUE,VIDEO,VISIT,VITAL,VOCAL,VOICE,WAIST,WATCH,WATER,WHEEL,WHERE,WHICH,WHILE,WHITE,WHOLE,WORLD,'+
    'WORRY,WORSE,WORST,WORTH,WOULD,WRITE,WRONG,WROTE,YOUNG,YOUTH').split(',');
  var VALID={};for(var i=0;i<WORDS.length;i++)VALID[WORDS[i]]=1;

  var secret='',guesses=[],current='',done=false,won=false;
  var keyState={}; // letter -> 'g','y','x'

  ms(a,'Sprout · <span id="SPms">Guess the word</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='SPpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:8px;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_SPN()">🌱 NEW</button>';

  function newGame(){
    secret=WORDS[Math.floor(Math.random()*WORDS.length)];
    guesses=[];current='';done=false;won=false;keyState={};
    sm('Guess the 5-letter word');
    render();
  }

  function evaluate(guess){
    var res=['x','x','x','x','x'];
    var used=[0,0,0,0,0];
    for(var i=0;i<5;i++){
      if(guess.charAt(i)===secret.charAt(i)){res[i]='g';used[i]=1;}
    }
    for(i=0;i<5;i++){
      if(res[i]==='g')continue;
      for(var j=0;j<5;j++){
        if(!used[j]&&guess.charAt(i)===secret.charAt(j)){res[i]='y';used[j]=1;break;}
      }
    }
    return res;
  }

  function submit(){
    if(done||current.length!==5)return;
    if(!VALID[current]){
      var ms1=document.getElementById('SPms');if(ms1)ms1.textContent='Not in word list';
      return;
    }
    var res=evaluate(current);
    guesses.push({w:current,r:res});
    // Update keyboard state (g>y>x priority)
    for(var i=0;i<5;i++){
      var ch=current.charAt(i),s=res[i];
      if(keyState[ch]==='g')continue;
      if(s==='g')keyState[ch]='g';
      else if(s==='y'&&keyState[ch]!=='g')keyState[ch]='y';
      else if(!keyState[ch])keyState[ch]='x';
    }
    if(current===secret){
      done=true;won=true;
      _e('game_win');_playWin();sm('✓ Solved in '+guesses.length+'!');
      _sr('sprout',{w:true,s:guesses.length});
    } else if(guesses.length>=6){
      done=true;
      _e('game_loss');_play('lose');sm('The word was '+secret);
      _sr('sprout',{w:false,s:6});
    } else {
      _e('progress');
    }
    current='';render();
  }

  function render(){
    var h='';
    var COLORS={g:'#538D3E',y:'#B59F3B',x:'#3A3A3C','':'rgba(26,31,23,0.5)'};
    h+='<div style="display:flex;flex-direction:column;gap:4px;align-items:center;margin:8px 0;">';
    for(var r=0;r<6;r++){
      h+='<div style="display:flex;gap:4px;">';
      var gd=guesses[r];
      var wd=gd?gd.w:(r===guesses.length?current:'');
      for(var c=0;c<5;c++){
        var ch=wd.charAt(c)||'';
        var st=gd?gd.r[c]:'';
        var bg=gd?COLORS[st]:'rgba(26,31,23,0.5)';
        var bc=gd?bg:(ch?'rgba(122,179,86,0.5)':'rgba(122,179,86,0.2)');
        h+='<div style="width:52px;height:52px;background:'+bg+';border:2px solid '+bc+';border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1.6rem;color:#e8dcc8;font-weight:700;">'+ch+'</div>';
      }
      h+='</div>';
    }
    h+='</div>';
    // Keyboard
    var rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
    h+='<div style="margin-top:12px;">';
    for(var rr=0;rr<3;rr++){
      h+='<div style="display:flex;gap:3px;justify-content:center;margin-bottom:4px;">';
      if(rr===2){h+='<button onclick="_SPK(\'ENT\')" style="min-width:44px;height:48px;padding:0 8px;background:rgba(122,179,86,0.3);border:1px solid rgba(122,179,86,0.5);border-radius:4px;color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:0.75rem;cursor:pointer;">ENTER</button>';}
      for(var k=0;k<rows[rr].length;k++){
        var L=rows[rr].charAt(k);
        var kb=keyState[L];
        var kbg=kb==='g'?'#538D3E':kb==='y'?'#B59F3B':kb==='x'?'#3A3A3C':'rgba(122,179,86,0.2)';
        h+='<button onclick="_SPK(\''+L+'\')" style="width:30px;height:48px;background:'+kbg+';border:1px solid rgba(122,179,86,0.3);border-radius:4px;color:#e8dcc8;font-family:DM Mono,monospace;font-size:0.9rem;font-weight:700;cursor:pointer;">'+L+'</button>';
      }
      if(rr===2){h+='<button onclick="_SPK(\'BS\')" style="min-width:44px;height:48px;padding:0 8px;background:rgba(122,179,86,0.3);border:1px solid rgba(122,179,86,0.5);border-radius:4px;color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:0.75rem;cursor:pointer;">⌫</button>';}
      h+='</div>';
    }
    h+='</div>';
    pan.innerHTML=h;
  }

  window._SPK=function(k){
    if(done)return;
    if(k==='ENT'){submit();return;}
    if(k==='BS'){current=current.slice(0,-1);render();return;}
    if(current.length<5){current+=k;render();}
  };
  window._SPN=function(){newGame();};

  newGame();
};
})();
