// ═══ LUCID WINDS — Story Seeds (daily creative writing) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;
window._gameFns=window._gameFns||{};
window._gameFns.storyseeds=function SS(a){
  var PROMPTS=[
    {text:'Describe a plant you passed today but never really looked at.',category:'OBSERVATION',icon:'👁'},
    {text:'What does rain sound like to a leaf?',category:'PERSPECTIVE',icon:'🌧'},
    {text:'Write about the oldest tree you remember.',category:'MEMORY',icon:'🌳'},
    {text:'A garden at midnight. What is happening?',category:'IMAGINATION',icon:'🌙'},
    {text:'Describe the smell of soil after rain.',category:'SENSES',icon:'🌍'},
    {text:'What was growing in the yard where you grew up?',category:'MEMORY',icon:'🏡'},
    {text:'Describe a meal that tasted like a season.',category:'MEMORY',icon:'🍽'},
    {text:'Write about hands that planted something.',category:'MEMORY',icon:'🤲'},
    {text:'What is the first flower you remember?',category:'MEMORY',icon:'🌸'},
    {text:'Tell the story of a seed that waited.',category:'IMAGINATION',icon:'🌱'},
    {text:'A vine grew through a crack in the wall. Where did it lead?',category:'IMAGINATION',icon:'🌿'},
    {text:'Two trees have grown side by side for a hundred years. What do they say to each other?',category:'IMAGINATION',icon:'🌲'},
    {text:'A gardener finds a flower that does not exist in any book.',category:'IMAGINATION',icon:'📖'},
    {text:'Write from the perspective of a root pushing through stone.',category:'PERSPECTIVE',icon:'💪'},
    {text:'The last garden on Earth. Who tends it?',category:'IMAGINATION',icon:'🌍'},
    {text:'What emotion does the color green carry for you?',category:'FEELING',icon:'💚'},
    {text:'Write about something that grew back after you thought it was gone.',category:'FEELING',icon:'🔄'},
    {text:'Describe patience without using the word.',category:'FEELING',icon:'⏳'},
    {text:'What would you plant if you had one seed and one wish?',category:'FEELING',icon:'✨'},
    {text:'Write a letter to your future self from a garden bench.',category:'FEELING',icon:'✉'},
    {text:'Name three things in nature you are grateful for today.',category:'GRATITUDE',icon:'🙏'},
    {text:'Write about water. Just water.',category:'OBSERVATION',icon:'💧'},
    {text:'What grows without anyone tending it?',category:'OBSERVATION',icon:'🌾'},
    {text:'Describe light moving across a room.',category:'SENSES',icon:'☀'},
    {text:'What sound does stillness make?',category:'SENSES',icon:'🤫'},
    {text:'What can a river teach a stone?',category:'WISDOM',icon:'🏞'},
    {text:'Write about something small that changed everything.',category:'WISDOM',icon:'🔍'},
    {text:'Finish this: The moss knows...',category:'WISDOM',icon:'🧠'},
    {text:'What would the wind write if it could?',category:'IMAGINATION',icon:'💨'},
    {text:'Describe a place where time moves slowly.',category:'SENSES',icon:'🕰'}
  ];

  var currentPrompt=null,_ssWon=false;

  ms(a,'Story Seeds · <span id="SSw">0 words</span>');
  mm(a);
  var pan=document.createElement('div');pan.id='SSpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:10px;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_SSNew()"><img src="assets/games/new-game-btn.png" alt="New Game"></button> <button class="gb" onclick="_SSSave()">💾 SAVE</button>';

  function getDateSeed(){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
  function getDailyPrompt(){return PROMPTS[getDateSeed()%PROMPTS.length];}
  function getRandomPrompt(){return PROMPTS[Math.floor(Math.random()*PROMPTS.length)];}

  function getStreak(){
    try{
      var entries=JSON.parse(localStorage.getItem('sws_storyseeds_entries')||'[]');
      var streak=0,today=new Date();
      for(var i=0;i<30;i++){
        var cd=new Date(today);cd.setDate(today.getDate()-i);
        var ds=cd.toISOString().split('T')[0];
        var has=false;for(var j=0;j<entries.length;j++)if(entries[j].date===ds){has=true;break;}
        if(has)streak++;else break;
      }
      return streak;
    }catch(e){return 0;}
  }

  function render(){
    var streak=getStreak();
    var h='';
    h+='<div style="text-align:center;padding:12px 8px;">';
    h+='<div style="font-size:1.8rem;margin-bottom:6px;">'+currentPrompt.icon+'</div>';
    h+='<div style="font-family:Crimson Text,Georgia,serif;font-size:1rem;font-style:italic;color:var(--cream);line-height:1.5;max-width:340px;margin:0 auto;">"'+currentPrompt.text+'"</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.78rem;letter-spacing:0.12em;color:var(--sage);margin-top:8px;">'+currentPrompt.category+'</div>';
    h+='</div>';
    h+='<textarea id="SSta" oninput="_SSIn()" placeholder="Begin writing here..." style="width:100%;min-height:220px;background:rgba(26,36,22,0.3);border:1px solid rgba(122,179,86,0.3);border-radius:10px;color:var(--cream);font-family:Crimson Text,Georgia,serif;font-size:0.95rem;line-height:1.6;padding:12px;resize:vertical;outline:none;box-sizing:border-box;"></textarea>';
    if(streak>0){
      h+='<div style="text-align:center;font-family:Bebas Neue,sans-serif;font-size:0.85rem;color:var(--gold);letter-spacing:0.12em;padding:8px;">🔥 '+streak+' DAY STREAK</div>';
    }
    pan.innerHTML=h;
  }

  function updateWords(){
    var ta=document.getElementById('SSta');if(!ta)return 0;
    var t=ta.value.trim();var n=t?t.split(/\s+/).length:0;
    var w=document.getElementById('SSw');if(w)w.textContent=n+' word'+(n!==1?'s':'');
    return n;
  }

  window._SSIn=function(){
    // Typing only updates the word counter. The old instant 10-word
    // milestone here was an unbounded farm: paste 10 words → New Prompt →
    // paste again, ~3s per sunbeam at the 'free' class progCap of 99.
    // All earning now goes through the gated, daily-capped save below.
    updateWords();
  };

  window._SSNew=function(){
    // _ssWon must NOT reset here — otherwise users can _SSNew()+_SSSave loop
    // to re-trigger the 10-word game_win every prompt switch.
    currentPrompt=getRandomPrompt();render();
  };

  // Paid saves cap out at 3/day — it's a daily journal, not a sunbeam mine.
  function _ssPaidToday(){
    var k='lw_ss_paid_'+new Date().toISOString().split('T')[0];
    var n=0;try{n=parseInt(localStorage.getItem(k)||'0',10)||0;}catch(e){}
    return {key:k,count:n};
  }

  window._SSSave=function(){
    var ta=document.getElementById('SSta');if(!ta)return;
    var text=ta.value.trim();
    if(!text){sm('Write something first');return;}
    var n=text.split(/\s+/).length;
    if(n<10){sm('At least 10 words to save');return;}
    var g=window._lwArtSaveGate&&window._lwArtSaveGate('storyseeds');
    if(g&&!g.allow){sm('Save again in '+g.secs+'s');return;}
    try{
      var entries=JSON.parse(localStorage.getItem('sws_storyseeds_entries')||'[]');
      entries.push({date:new Date().toISOString().split('T')[0],prompt:currentPrompt.text,text:text,words:n,timestamp:Date.now()});
      if(entries.length>365)entries=entries.slice(-365);
      localStorage.setItem('sws_storyseeds_entries',JSON.stringify(entries));
    }catch(e){}
    var paid=_ssPaidToday();
    if(paid.count<3){
      try{localStorage.setItem(paid.key,String(paid.count+1));}catch(e){}
      if(g&&g.firstWin){_ssWon=true;_e('game_win');if(_playWin)_playWin();}
      else _e('milestone');
      sm('✓ Saved · '+n+' words');
    }else{
      sm('✓ Saved · '+n+' words (journal rewards refresh tomorrow)');
    }
    _sr('storyseeds',{w:true,s:n});
    ta.value='';updateWords();
    currentPrompt=getRandomPrompt();render();
  };

  currentPrompt=getDailyPrompt();
  render();
};
})();
