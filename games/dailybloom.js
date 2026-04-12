// ═══ DAILY BLOOM — 5 cognitive exercises, ~3 minute check-in ═══
// Word recall, math, reaction, pattern match, Stroop color naming.
(function(){
'use strict';
window._gameFns=window._gameFns||{};
window._gameFns.dailybloom=function DB(a){
  var exOrder=['wordRecall','math','reaction','pattern','colorName'];
  var exNames=['WORD RECALL','QUICK MATH','REACTION','PATTERN','COLOR NAMING'];
  var currentEx=0;
  var scores=[0,0,0,0,0];
  var exData={};

  ms(a,'🌱 Daily Bloom — <strong id="DBd">'+exNames[0]+'</strong>');
  mm(a);
  var pan=document.createElement('div');pan.id='DBpan';
  pan.style.cssText='max-width:420px;margin:0 auto;padding:10px;user-select:none;text-align:center;color:#e8dcc8;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb-new" onclick="_DBN()"><img src="assets/games/new-game-btn.png" alt="New Game"></button>';

  function dots(){
    var h='<div style="display:flex;gap:6px;justify-content:center;padding:6px;">';
    for(var i=0;i<5;i++){
      var done=i<currentEx,act=i===currentEx&&currentEx<5;
      h+='<div style="width:10px;height:10px;border-radius:50%;border:1.5px solid '+(done?'#7ab356':act?'#c8a84b':'rgba(122,179,86,0.3)')+';background:'+(done?'#7ab356':'transparent')+';'+(act?'box-shadow:0 0 6px rgba(200,168,75,0.4);':'')+'"></div>';
    }
    h+='</div>';
    return h;
  }

  var WORD_BANKS=[
    ['fern','moss','stone','river','cloud','bloom','thorn','petal','root','bark'],
    ['oak','rain','dew','soil','wind','leaf','vine','seed','pond','shade'],
    ['grove','dawn','mist','ridge','trail','creek','pine','cliff','meadow','frost']
  ];

  function header(title,desc){
    return '<div style="font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:2px;color:#7ab356;margin:6px 0 2px;">'+title+'</div>'+
      '<div style="font-size:.72rem;opacity:.55;font-style:italic;margin-bottom:8px;">'+desc+'</div>';
  }

  function startWord(){
    var bank=WORD_BANKS[Math.floor(Math.random()*WORD_BANKS.length)].slice();
    for(var i=bank.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=bank[i];bank[i]=bank[j];bank[j]=t;}
    var target=bank.slice(0,5),distract=bank.slice(5,10);
    exData={phase:'mem',target:target,distract:distract,recalled:[]};
    var h=header('WORD RECALL','Memorize these 5 words (10s)');
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;">';
    for(var w=0;w<target.length;w++)h+='<div style="padding:10px 14px;background:rgba(26,36,22,0.6);border:1px solid rgba(122,179,86,0.2);border-radius:8px;font-family:Bebas Neue,sans-serif;font-size:.95rem;letter-spacing:1px;">'+target[w].toUpperCase()+'</div>';
    h+='</div>'+dots();
    pan.innerHTML=h;
    setTimeout(function(){
      if(exData.phase!=='mem')return;
      exData.phase='recall';
      var all=exData.target.concat(exData.distract);
      for(var i2=all.length-1;i2>0;i2--){var j2=Math.floor(Math.random()*(i2+1));var t2=all[i2];all[i2]=all[j2];all[j2]=t2;}
      var h2=header('WORD RECALL','Tap the 5 words you saw');
      h2+='<div id="DBwr" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0;">';
      for(var i3=0;i3<all.length;i3++) h2+=optBtn(all[i3].toUpperCase(),'_DBwt(\''+all[i3]+'\',this)');
      h2+='</div><div id="DBmsg" style="font-size:.75rem;color:#7ab356;">0/5 selected</div>';
      h2+=dots();
      pan.innerHTML=h2;
    },10000);
  }
  window._DBwt=function(word,el){
    if(exData.phase!=='recall')return;
    if(el.dataset.done)return;el.dataset.done='1';
    var isTgt=exData.target.indexOf(word)>=0;
    if(isTgt){el.style.background='rgba(122,179,86,0.3)';el.style.borderColor='#7ab356';el.style.color='#7ab356';exData.recalled.push(word);}
    else{el.style.background='rgba(196,122,122,0.2)';el.style.borderColor='#c47a7a';el.style.color='#c47a7a';}
    var msg=document.getElementById('DBmsg');if(msg)msg.textContent=exData.recalled.length+'/5 selected';
    var wrongs=0;var btns=document.querySelectorAll('#DBwr button');
    for(var i=0;i<btns.length;i++)if(btns[i].dataset.done&&btns[i].style.borderColor.indexOf('196')>=0)wrongs++;
    if(exData.recalled.length>=5||wrongs>=3){
      scores[0]=Math.round(exData.recalled.length/5*100);
      setTimeout(nextEx,700);
    }
  };

  function optBtn(label,onclickStr,extra){
    return '<button onclick="'+onclickStr+'" style="min-height:44px;padding:10px 18px;border-radius:10px;background:rgba(26,36,22,0.7);border:1.5px solid rgba(122,179,86,0.3);color:#e8dcc8;font-family:Bebas Neue,sans-serif;font-size:.95rem;letter-spacing:1px;cursor:pointer;'+(extra||'')+'">'+label+'</button>';
  }

  function startMath(){
    exData={correct:0,total:0,startTime:Date.now(),maxTime:20000};
    showMath();
  }
  function showMath(){
    if(Date.now()-exData.startTime>exData.maxTime){
      scores[1]=Math.min(100,Math.round(exData.correct*12.5));nextEx();return;
    }
    var ops=['+','-','×'],op=ops[Math.floor(Math.random()*3)],A,B,ans;
    if(op==='+'){A=5+Math.floor(Math.random()*50);B=5+Math.floor(Math.random()*50);ans=A+B;}
    else if(op==='-'){A=20+Math.floor(Math.random()*50);B=1+Math.floor(Math.random()*A);ans=A-B;}
    else{A=2+Math.floor(Math.random()*12);B=2+Math.floor(Math.random()*12);ans=A*B;}
    var wrongs=[];
    while(wrongs.length<3){var w=ans+Math.floor(Math.random()*11)-5;if(w!==ans&&wrongs.indexOf(w)<0&&w>=0)wrongs.push(w);}
    var opts=[ans].concat(wrongs);
    for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;}
    var el=Math.round((Date.now()-exData.startTime)/1000);
    var h=header('QUICK MATH','Solve as many as you can in 20s ('+el+'s)');
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:2.2rem;color:#e8dcc8;margin:12px 0;letter-spacing:2px;">'+A+' '+op+' '+B+'</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;">';
    for(i=0;i<opts.length;i++) h+=optBtn(opts[i],'_DBm('+opts[i]+','+ans+',this)');
    h+='</div><div style="font-size:.72rem;color:#7ab356;">Correct: '+exData.correct+'</div>'+dots();
    pan.innerHTML=h;
  }
  window._DBm=function(picked,correct,el){
    exData.total++;
    if(picked===correct){exData.correct++;el.style.background='rgba(122,179,86,0.3)';el.style.borderColor='#7ab356';el.style.color='#7ab356';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}}
    else{el.style.background='rgba(196,122,122,0.2)';el.style.borderColor='#c47a7a';el.style.color='#c47a7a';}
    setTimeout(showMath,250);
  };

  function startReact(){
    exData={times:[],phase:'wait',attempts:0,max:5,timer:null};
    showReact();
  }
  function showReact(){
    if(exData.attempts>=exData.max){
      var avg=0;for(var i=0;i<exData.times.length;i++)avg+=exData.times[i];
      avg=exData.times.length>0?Math.round(avg/exData.times.length):999;
      scores[2]=Math.min(100,Math.max(0,Math.round(150-(avg-150)*0.5)));
      nextEx();return;
    }
    exData.phase='wait';
    var last=exData.times.length>0?exData.times[exData.times.length-1]+'ms':'';
    var h=header('REACTION','Tap when the circle turns green ('+(exData.attempts+1)+'/'+exData.max+')');
    h+='<div id="DBrt" onclick="_DBr()" style="width:150px;height:150px;border-radius:50%;background:rgba(196,122,122,0.15);border:2.5px solid rgba(196,122,122,0.5);display:inline-flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;color:#c47a7a;font-size:1rem;margin:12px auto;cursor:pointer;letter-spacing:2px;">WAIT...</div>';
    h+='<div id="DBrmsg" style="font-size:.72rem;color:#7ab356;min-height:1rem;">'+last+'</div>'+dots();
    pan.innerHTML=h;
    var delay=1500+Math.random()*2500;
    exData.timer=setTimeout(function(){
      if(exData.phase!=='wait')return;
      exData.phase='go';exData.goTime=Date.now();
      var t=document.getElementById('DBrt');
      if(t){t.style.background='rgba(122,179,86,0.25)';t.style.borderColor='#7ab356';t.style.color='#7ab356';t.textContent='TAP!';}
    },delay);
  }
  window._DBr=function(){
    if(exData.phase==='wait'){
      clearTimeout(exData.timer);
      var m=document.getElementById('DBrmsg');if(m){m.textContent='Too early! Wait for green.';m.style.color='#c47a7a';}
      setTimeout(showReact,800);return;
    }
    if(exData.phase==='go'){
      var t=Date.now()-exData.goTime;
      exData.times.push(t);exData.attempts++;exData.phase='done';
      var m=document.getElementById('DBrmsg');if(m){m.textContent=t+'ms';m.style.color='#7ab356';}
      try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
      setTimeout(showReact,600);
    }
  };

  function startPat(){
    exData={correct:0,round:0,max:5};
    showPat();
  }
  function renderGrid(g,cs){
    var h='<div style="display:inline-grid;grid-template-columns:repeat(3,'+cs+'px);gap:2px;">';
    for(var r=0;r<g.length;r++)for(var c=0;c<g[r].length;c++){
      h+='<div style="width:'+cs+'px;height:'+cs+'px;border-radius:3px;background:'+(g[r][c]?'rgba(122,179,86,0.55)':'rgba(26,36,22,0.5)')+';"></div>';
    }
    return h+'</div>';
  }
  function showPat(){
    if(exData.round>=exData.max){
      scores[3]=Math.round(exData.correct/exData.max*100);nextEx();return;
    }
    exData.round++;
    var sz=3,pattern=[];
    for(var r=0;r<sz;r++){pattern[r]=[];for(var c=0;c<sz;c++)pattern[r][c]=Math.random()>0.5?1:0;}
    var opts=[pattern];
    for(var v=0;v<3;v++){
      var vr=[];for(var rr=0;rr<sz;rr++)vr[rr]=pattern[rr].slice();
      var flips=1+Math.floor(Math.random()*2);
      for(var f=0;f<flips;f++){var fr=Math.floor(Math.random()*sz),fc=Math.floor(Math.random()*sz);vr[fr][fc]=vr[fr][fc]?0:1;}
      opts.push(vr);
    }
    var correctIdx=0;
    for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;if(j===correctIdx)correctIdx=i;else if(i===correctIdx)correctIdx=j;}
    var h=header('PATTERN MATCH','Which grid matches the original? ('+exData.round+'/'+exData.max+')');
    h+=renderGrid(pattern,36);
    h+='<div style="font-size:.55rem;opacity:.4;margin:4px 0;">↑ ORIGINAL ↑</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;">';
    for(i=0;i<opts.length;i++) h+='<div onclick="_DBp('+i+','+correctIdx+',this)" style="cursor:pointer;border:2px solid rgba(122,179,86,0.25);border-radius:6px;padding:4px;min-height:44px;">'+renderGrid(opts[i],26)+'</div>';
    h+='</div>'+dots();
    pan.innerHTML=h;
  }
  window._DBp=function(picked,correct,el){
    if(picked===correct){exData.correct++;el.style.borderColor='#7ab356';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}}
    else el.style.borderColor='#c47a7a';
    setTimeout(showPat,450);
  };

  var CN=['RED','GREEN','BLUE','YELLOW'];
  var CH=['#c47a7a','#7ab356','#5b9bd5','#c8a84b'];
  function startColor(){
    exData={correct:0,startTime:Date.now(),maxTime:15000};
    showColor();
  }
  function showColor(){
    if(Date.now()-exData.startTime>exData.maxTime){
      scores[4]=Math.min(100,Math.round(exData.correct*14));nextEx();return;
    }
    var wi=Math.floor(Math.random()*4),ci;do{ci=Math.floor(Math.random()*4);}while(ci===wi);
    var el=Math.round((Date.now()-exData.startTime)/1000);
    var h=header('COLOR NAMING','Tap the COLOR of the text, not the word ('+el+'s)');
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:2.8rem;color:'+CH[ci]+';margin:14px 0;letter-spacing:4px;">'+CN[wi]+'</div>';
    h+='<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;">';
    for(var i=0;i<4;i++) h+='<button onclick="_DBc('+i+','+ci+',this)" style="min-height:44px;padding:10px 18px;border-radius:10px;background:rgba(26,36,22,0.7);border:1.5px solid '+CH[i]+'66;color:'+CH[i]+';font-family:Bebas Neue,sans-serif;font-size:.95rem;letter-spacing:1px;cursor:pointer;">'+CN[i]+'</button>';
    h+='</div><div style="font-size:.72rem;color:#7ab356;">Correct: '+exData.correct+'</div>'+dots();
    pan.innerHTML=h;
  }
  window._DBc=function(picked,correct,el){
    if(picked===correct){exData.correct++;el.style.background='rgba(122,179,86,0.25)';try{navigator.vibrate&&navigator.vibrate(8);}catch(e){}}
    else el.style.background='rgba(196,122,122,0.2)';
    setTimeout(showColor,200);
  };

  function nextEx(){
    currentEx++;
    if(currentEx>=exOrder.length){showResults();return;}
    var d=document.getElementById('DBd');if(d)d.textContent=exNames[currentEx];
    startExercise(currentEx);
  }
  function startExercise(i){
    switch(exOrder[i]){
      case 'wordRecall':startWord();break;
      case 'math':startMath();break;
      case 'reaction':startReact();break;
      case 'pattern':startPat();break;
      case 'colorName':startColor();break;
    }
  }
  function showResults(){
    var total=0;for(var i=0;i<5;i++)total+=scores[i];
    var bloom=Math.round(total/5);
    var h='<div style="font-family:Bebas Neue,sans-serif;font-size:.8rem;color:#7ab356;letter-spacing:2px;margin:10px 0 4px;">YOUR DAILY BLOOM SCORE</div>';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:3.5rem;color:#c8a84b;line-height:1;">'+bloom+'</div>';
    h+='<div style="margin:14px auto;max-width:280px;font-size:.72rem;text-align:left;">';
    for(i=0;i<5;i++){
      var col=scores[i]>=70?'#7ab356':scores[i]>=40?'#c8a84b':'#c47a7a';
      h+='<div style="display:flex;justify-content:space-between;padding:3px 0;"><span>'+exNames[i]+'</span><span style="color:'+col+';">'+scores[i]+'</span></div>';
      h+='<div style="height:5px;background:rgba(26,36,22,0.5);border-radius:3px;margin:2px 0 6px;"><div style="height:100%;width:'+scores[i]+'%;background:'+col+';border-radius:3px;"></div></div>';
    }
    h+='</div>';
    h+='<div style="font-size:.7rem;opacity:.5;margin-top:8px;">Come back tomorrow to see your garden grow.</div>';
    pan.innerHTML=h;
    sm('Daily Bloom: '+bloom);
    _e('milestone');_e('milestone');
    if(bloom>=60){_e('game_win');try{_playWin();}catch(e){}}
    _sr('dailybloom',{w:bloom>=60,s:bloom});
    try{
      var hist=JSON.parse(localStorage.getItem('dailybloom_history')||'[]');
      hist.push({date:new Date().toISOString().split('T')[0],score:bloom,scores:scores.slice()});
      if(hist.length>90)hist=hist.slice(-90);
      localStorage.setItem('dailybloom_history',JSON.stringify(hist));
    }catch(e){}
  }

  window._DBN=function(){
    currentEx=0;scores=[0,0,0,0,0];
    var d=document.getElementById('DBd');if(d)d.textContent=exNames[0];
    startExercise(0);
  };

  startExercise(0);
};
})();
