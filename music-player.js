/* ════════════════════════════════════════════════════════════════════════
   SHARED SOUNDTRACK PLAYER — single implementation used by BOTH the Sky Wolf
   Studios portal (portal/index.html) and every game shell (play/shell.js).
   Owns: audio playback, the categorized drawer UI, custom playlists,
   cross-page continuity, repeat, and link-rot skip. Reads the shared track
   manifest from window.LW_TRACKS (/music-tracks.js — load that FIRST).

   The HOST owns only its button: create/place/style a button element (incl.
   its `.playing` look) and hand it to init(). This player wires the click to
   open the drawer and toggles `.playing` on it. Everything else lives here so
   there is ONE copy to maintain.

   USAGE
     <script src="/music-tracks.js"></script>
     <script src="/music-player.js"></script>
     SWSPlayer.init({ button: document.getElementById('my-music-btn') });

   init(config):
     button   (required)  the host's button Element
     theme    (optional)  { panel, panel2, line, leaf, ink, muted, bg } overrides
     key      (optional)  localStorage state key   (default 'sws_music_state')
     plKey    (optional)  localStorage playlist key (default 'sws_playlists')
     z        (optional)  drawer z-index           (default 99990)
   Returns window.SWS_MUSIC (the control API used by the drawer's inline onclicks).

   Continuity + playlists are stored under shared keys, so a mix or a playing
   track started in the portal keeps going in the games and vice-versa. NOTE:
   the in-app index.html LW_MUSIC is a separate player (key 'lw_music_state')
   and is intentionally NOT wired through this module.
   ════════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var inited = false;

  function palette(T){
    T = T || {};
    return {
      panel:  T.panel  || '#15201a',
      panel2: T.panel2 || '#1c2a22',
      line:   T.line   || '#2a3a30',
      leaf:   T.leaf   || '#5fc08a',
      ink:    T.ink    || '#e8f1e9',
      muted:  T.muted  || '#8fa896',
      bg:     T.bg     || '#0d1410'
    };
  }

  function injectStyle(c){
    if(document.getElementById('swsp-style')) return;
    var s = document.createElement('style');
    s.id = 'swsp-style';
    s.textContent =
      '.swsp-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:flex-end;justify-content:center}'
    + '.swsp-bg.on{display:flex}@media(min-width:560px){.swsp-bg{align-items:center;padding:18px}}'
    + '.swsp{background:linear-gradient(180deg,'+c.panel+',#10180f);border:1px solid '+c.line+';border-radius:16px 16px 0 0;width:100%;max-width:460px;max-height:86vh;display:flex;flex-direction:column;box-shadow:0 -10px 50px rgba(0,0,0,.6)}'
    + '@media(min-width:560px){.swsp{border-radius:16px}}'
    + '.swsp .hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;border-bottom:1px solid '+c.line+'}'
    + '.swsp .hd h3{margin:0;font-size:14px;letter-spacing:1.4px;text-transform:uppercase;color:'+c.leaf+'}'
    + '.swsp .x{background:transparent;border:0;color:'+c.muted+';font-size:24px;line-height:1;cursor:pointer;padding:2px 6px}.swsp .x:hover{color:'+c.ink+'}'
    + '.swsp-now{padding:12px 16px;border-bottom:1px solid '+c.line+';display:flex;align-items:center;gap:12px}'
    + '.swsp-now .meta{flex:1;min-width:0}.swsp-now .t{font-weight:700;font-size:14px;color:'+c.ink+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.swsp-now .a{font-size:11.5px;color:'+c.muted+';margin-top:2px}.swsp-now .ctrls{display:flex;gap:6px;flex-shrink:0}'
    + '.swsp-now .ctrls button{width:42px;height:42px;border-radius:50%;border:1px solid '+c.line+';background:'+c.bg+';color:'+c.ink+';cursor:pointer;font-size:15px;display:grid;place-items:center}'
    + '.swsp-now .ctrls button.pp{border-color:'+c.leaf+';color:'+c.leaf+'}.swsp-now .ctrls button:hover{border-color:'+c.leaf+'}'
    + '.swsp-row{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid '+c.line+'}'
    + '.swsp-row span.lbl{font-size:10px;letter-spacing:1px;color:'+c.muted+';width:26px}.swsp-row input{flex:1;accent-color:'+c.leaf+'}'
    + '.swsp-rep{background:'+c.bg+';border:1px solid '+c.line+';color:'+c.muted+';border-radius:8px;padding:7px 10px;font-size:11px;cursor:pointer;white-space:nowrap}'
    + '.swsp-rep.act{color:'+c.leaf+';border-color:'+c.leaf+'}'
    + '.swsp-list{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 10px 16px;flex:1}'
    + '.swsp-cat{display:flex;align-items:center;gap:8px;margin:12px 4px 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:'+c.leaf+'}'
    + '.swsp-cat:first-child{margin-top:2px}.swsp-cat .ln{flex:1;height:1px;background:'+c.line+'}.swsp-cat .ct{color:'+c.muted+';font-size:10px}'
    + '.swsp-trk{display:block;width:100%;text-align:left;padding:10px 11px;margin-bottom:5px;border-radius:9px;cursor:pointer;background:'+c.bg+';border:1px solid transparent;color:'+c.ink+'}'
    + '.swsp-trk:hover{border-color:'+c.line+'}.swsp-trk.on{background:rgba(95,192,138,.12);border-color:rgba(95,192,138,.45)}'
    + '.swsp-trk .tt{font-weight:700;font-size:13px}.swsp-trk.on .tt{color:'+c.leaf+'}.swsp-trk .aa{font-size:11px;color:'+c.muted+';margin-top:2px}'
    + '.swsp-trk.edit{border-color:rgba(95,192,138,.25)}.swsp-trk.edit.member{background:rgba(95,192,138,.14);border-color:rgba(95,192,138,.5)}'
    + '.swsp-trk .mk{display:inline-block;min-width:14px;color:'+c.leaf+';font-weight:700}'
    + '.swsp-plnew{background:transparent;border:1px solid '+c.leaf+';color:'+c.leaf+';border-radius:7px;padding:3px 9px;font-size:10.5px;cursor:pointer;text-transform:none}'
    + '.swsp-plactive{display:flex;align-items:center;gap:8px;font-size:12px;color:'+c.leaf+';background:rgba(95,192,138,.1);border:1px solid rgba(95,192,138,.35);border-radius:8px;padding:7px 10px;margin:0 4px 6px}'
    + '.swsp-plactive button{margin-left:auto;background:transparent;border:1px solid '+c.line+';color:'+c.muted+';border-radius:6px;padding:4px 8px;font-size:10.5px;cursor:pointer}'
    + '.swsp-plempty{font-size:11.5px;color:'+c.muted+';line-height:1.6;padding:4px 6px 8px;margin:0 2px}'
    + '.swsp-plrow{display:flex;align-items:stretch;gap:5px;margin:0 4px 5px}.swsp-plrow.on .swsp-plplay{border-color:rgba(95,192,138,.5);background:rgba(95,192,138,.12)}'
    + '.swsp-plplay{flex:1;text-align:left;background:'+c.panel2+';border:1px solid '+c.line+';border-radius:9px;padding:9px 11px;cursor:pointer;color:'+c.ink+';display:flex;flex-direction:column;gap:2px}'
    + '.swsp-plplay .nm{font-weight:700;font-size:13px}.swsp-plplay .ct{font-size:11px;color:'+c.muted+'}'
    + '.swsp-plbtn{width:40px;border:1px solid '+c.line+';background:'+c.panel2+';color:'+c.muted+';border-radius:9px;cursor:pointer;font-size:15px}.swsp-plbtn.act{color:'+c.leaf+';border-color:'+c.leaf+'}'
    + '.swsp-pledit{font-size:11.5px;color:'+c.leaf+';background:rgba(95,192,138,.08);border:1px dashed rgba(95,192,138,.4);border-radius:8px;padding:7px 10px;margin:0 4px 6px;display:flex;align-items:center;gap:8px}'
    + '.swsp-pledit button{margin-left:auto;background:'+c.leaf+';border:0;color:#08130c;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer}'
    + '.swsp-foot{padding:9px 16px 14px;font-size:11px;color:'+c.muted+';text-align:center;line-height:1.5;border-top:1px solid '+c.line+'}';
    document.head.appendChild(s);
  }

  function init(config){
    if(inited) return window.SWS_MUSIC;
    config = config || {};
    var btn = config.button;
    if(!btn) return null;
    inited = true;

    var TRACKS = (window.LW_TRACKS && window.LW_TRACKS.length) ? window.LW_TRACKS
               : [{id:'the-waiting-dojo', title:'The Waiting Dojo', artist:'Stephen', cat:'Originals', src:'/assets/music/the-waiting-dojo.mp3'}];
    var CATS = (window.LW_TRACK_CATS && window.LW_TRACK_CATS.length) ? window.LW_TRACK_CATS : ['Originals','Classical'];
    var KEY = config.key || 'sws_music_state';
    var PL_KEY = config.plKey || 'sws_playlists';
    var Z = config.z || 99990;

    injectStyle(palette(config.theme));

    // pl = active playlist id (null = full library); queue = TRACKS indices in
    // play order (null = full library); edit = playlist id being edited (UI).
    var st = { idx:-1, volume:0.5, playing:false, repeat:'all', open:false, errSkips:0, _time:0, pl:null, queue:null, edit:null };
    try{ var s = JSON.parse(localStorage.getItem(KEY)||'{}');
         if(typeof s.idx==='number') st.idx=s.idx;
         if(typeof s.volume==='number') st.volume=s.volume;
         if(typeof s.playing==='boolean') st.playing=s.playing;
         if(typeof s.repeat==='string') st.repeat=s.repeat;
         if(typeof s.time==='number') st._time=s.time;
         if(typeof s.pl==='string') st.pl=s.pl; }catch(e){}
    var _saveT = 0;
    function save(){ try{ var t=audio?audio.currentTime:(st._time||0); localStorage.setItem(KEY, JSON.stringify({idx:st.idx, volume:st.volume, playing:st.playing, repeat:st.repeat, time:t, pl:st.pl})); }catch(e){} }
    function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];}); }

    // ── Playlists ──
    function plAll(){ try{ return JSON.parse(localStorage.getItem(PL_KEY)||'[]'); }catch(e){ return []; } }
    function plStore(a){ try{ localStorage.setItem(PL_KEY, JSON.stringify(a)); }catch(e){} }
    function plGet(id){ var a=plAll(); for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
    function plMake(name){ var a=plAll(); var id='pl'+Date.now()+Math.floor(Math.random()*1000); a.push({id:id,name:name,ids:[]}); plStore(a); return id; }
    function plDrop(id){ plStore(plAll().filter(function(p){return p.id!==id;})); }
    function plToggleMember(id, tid){ var a=plAll(); for(var i=0;i<a.length;i++){ if(a[i].id===id){ var k=a[i].ids.indexOf(tid); if(k>=0)a[i].ids.splice(k,1); else a[i].ids.push(tid); break; } } plStore(a); }
    function idxOfId(tid){ for(var i=0;i<TRACKS.length;i++) if(TRACKS[i].id===tid) return i; return -1; }
    function buildQueue(){
      if(!st.pl){ st.queue=null; return; }
      var p=plGet(st.pl); if(!p){ st.pl=null; st.queue=null; return; }
      var q=[]; for(var i=0;i<p.ids.length;i++){ var ix=idxOfId(p.ids[i]); if(ix>=0) q.push(ix); }
      st.queue = q.length ? q : null;
      if(!st.queue) st.pl=null;
    }

    var audio = null;
    function ensure(){
      if(audio) return audio;
      audio = document.createElement('audio');
      audio.preload = 'none'; audio.volume = st.volume;
      audio.addEventListener('ended', function(){
        if(st.repeat==='one'){ audio.currentTime=0; var p=audio.play(); if(p&&p['catch'])p['catch'](function(){}); return; }
        if(st.queue && st.queue.length){
          var pos=st.queue.indexOf(st.idx), np=pos+1;
          if(np>=st.queue.length){ if(st.repeat==='all'){ play(st.queue[0]); } else { st.playing=false; btn.classList.remove('playing'); save(); } }
          else play(st.queue[np]);
          return;
        }
        var n=st.idx+1;
        if(n>=TRACKS.length){ if(st.repeat==='all'){ play(0); } else { st.playing=false; btn.classList.remove('playing'); save(); } }
        else play(n);
      });
      audio.addEventListener('error', function(){ if(st.errSkips>=TRACKS.length){ st.errSkips=0; return; } st.errSkips++; next(); });
      audio.addEventListener('play',  function(){ st.errSkips=0; st.playing=true;  btn.classList.add('playing'); render(); save(); });
      audio.addEventListener('pause', function(){ st.playing=false; btn.classList.remove('playing'); render(); save(); });
      audio.addEventListener('timeupdate', function(){ var now=Date.now(); if(now-_saveT>2000){ _saveT=now; save(); } });
      document.body.appendChild(audio);
      return audio;
    }
    function play(i){
      if(typeof i!=='number') i = st.idx>=0 ? st.idx : 0;
      if(i<0 || i>=TRACKS.length) i = 0;
      var a = ensure(), t = TRACKS[i];
      if(st.idx!==i || (a.src||'').indexOf(t.src)<0){ a.src = t.src; st.idx=i; st._time=0; save(); }
      var p = a.play(); if(p && p['catch']) p['catch'](function(){});
      render();
    }
    function pause(){ if(audio) audio.pause(); }
    function resume(){ if(audio && audio.src){ var p=audio.play(); if(p&&p['catch'])p['catch'](function(){}); } else play(); }
    function step(dir){
      if(st.queue && st.queue.length){
        var pos=st.queue.indexOf(st.idx); if(pos<0) pos = dir>0 ? -1 : 0;
        var np=pos+dir; if(np<0) np=st.queue.length-1; if(np>=st.queue.length) np=0;
        play(st.queue[np]);
      } else { play(((st.idx<0?0:st.idx)+dir+TRACKS.length)%TRACKS.length); }
    }
    function next(){ step(1); }
    function prev(){ step(-1); }
    function setVol(v){ v=Number(v); if(isNaN(v))return; st.volume=Math.max(0,Math.min(1,v)); if(audio)audio.volume=st.volume; save(); }
    function cycleRepeat(){ st.repeat = st.repeat==='all'?'one':(st.repeat==='one'?'off':'all'); save(); render(); }

    function trackTap(i){
      if(st.edit){ plToggleMember(st.edit, TRACKS[i].id); if(st.pl===st.edit) buildQueue(); render(); return; }
      if(!(st.queue && st.queue.indexOf(i)>=0)){ st.pl=null; st.queue=null; }
      play(i); save();
    }
    function playPlaylist(id){ st.pl=id; buildQueue(); save(); if(st.queue && st.queue.length) play(st.queue[0]); render(); }
    function clearPlaylist(){ st.pl=null; st.queue=null; save(); render(); }
    function plNew(){ var n=window.prompt('Name this playlist:',''); if(n===null) return; n=(n||'').trim()||'My Mix'; st.edit=plMake(n); render(); }
    function plDelete(id){ if(!window.confirm('Delete this playlist?')) return; plDrop(id); if(st.pl===id) clearPlaylist(); if(st.edit===id) st.edit=null; render(); }
    function plEdit(id){ st.edit = (st.edit===id) ? null : id; render(); }

    function groups(){
      var map={}, order=[];
      for(var i=0;i<TRACKS.length;i++){ var ct=TRACKS[i].cat||'Originals'; if(!map[ct]){map[ct]=[];order.push(ct);} map[ct].push({t:TRACKS[i],i:i}); }
      var fs={}; for(var j=0;j<order.length;j++) fs[order[j]]=j;
      order.sort(function(a,b){ var ia=CATS.indexOf(a); if(ia<0)ia=100+fs[a]; var ib=CATS.indexOf(b); if(ib<0)ib=100+fs[b]; return ia-ib; });
      return order.map(function(ct){ return {cat:ct, items:map[ct]}; });
    }

    var bg=null;
    function openDrawer(){
      if(!bg){
        bg=document.createElement('div'); bg.className='swsp-bg'; bg.style.zIndex=Z;
        bg.addEventListener('click', function(e){ if(e.target===bg) closeDrawer(); });
        document.body.appendChild(bg);
      }
      st.open=true; bg.classList.add('on'); render();
    }
    function closeDrawer(){ st.open=false; if(bg) bg.classList.remove('on'); }

    function plSectionHTML(){
      var pls = plAll();
      var h = '<div class="swsp-cat" style="margin-top:2px">Playlists<span class="ln"></span><button class="swsp-plnew" onclick="SWS_MUSIC.plNew()">&#43; New</button></div>';
      if(st.pl){ var ap=plGet(st.pl); if(ap){ h += '<div class="swsp-plactive">&#9835; Playing: '+esc(ap.name)+' <button onclick="SWS_MUSIC.plClear()">Full library</button></div>'; } }
      if(!pls.length){
        h += '<div class="swsp-plempty">No playlists yet. Tap <b>&#43;&nbsp;New</b>, name it, then tap tracks below to add them. Hit <b>Repeat</b> to loop your mix.</div>';
      } else {
        for(var i=0;i<pls.length;i++){
          var p=pls[i], isEd=(st.edit===p.id), isAct=(st.pl===p.id);
          h += '<div class="swsp-plrow'+(isAct?' on':'')+'">';
          h += '<button class="swsp-plplay" onclick="SWS_MUSIC.plPlay(\''+p.id+'\')"><span class="nm">'+esc(p.name)+'</span><span class="ct">'+p.ids.length+' track'+(p.ids.length===1?'':'s')+'</span></button>';
          h += '<button class="swsp-plbtn'+(isEd?' act':'')+'" title="Edit tracks" onclick="SWS_MUSIC.plEdit(\''+p.id+'\')">&#9998;</button>';
          h += '<button class="swsp-plbtn" title="Delete" onclick="SWS_MUSIC.plDelete(\''+p.id+'\')">&#128465;</button>';
          h += '</div>';
          if(isEd){ h += '<div class="swsp-pledit">Editing <b>'+esc(p.name)+'</b> — tap tracks below to add/remove. <button onclick="SWS_MUSIC.plEdit(\''+p.id+'\')">Done</button></div>'; }
        }
      }
      return h;
    }

    function render(){
      if(!st.open || !bg) return;
      var cur = (st.idx>=0 && TRACKS[st.idx]) ? TRACKS[st.idx] : null;
      var repLbl = st.repeat==='one'?'&#128258; One':(st.repeat==='all'?'&#128257; All':'&#128257; Off');
      var h = '<div class="swsp" onclick="event.stopPropagation()">';
      h += '<div class="hd"><h3>&#9835; Soundtrack</h3><button class="x" aria-label="Close" onclick="SWS_MUSIC.close()">&times;</button></div>';
      h += '<div class="swsp-now"><div class="meta"><div class="t">' + (cur?esc(cur.title):'Pick a track to start') + '</div><div class="a">' + (cur?(esc(cur.artist||'Stephen')+(cur.mood?' &middot; '+esc(cur.mood):'')):'Public-domain library + studio originals') + '</div></div><div class="ctrls">';
      h += '<button onclick="SWS_MUSIC.prev()" aria-label="Previous">&#9198;</button>';
      h += st.playing ? '<button class="pp" onclick="SWS_MUSIC.pause()" aria-label="Pause">&#9208;</button>' : '<button class="pp" onclick="SWS_MUSIC.resume()" aria-label="Play">&#9654;</button>';
      h += '<button onclick="SWS_MUSIC.next()" aria-label="Next">&#9197;</button></div></div>';
      h += '<div class="swsp-row"><span class="lbl">VOL</span><input type="range" min="0" max="100" value="'+Math.round(st.volume*100)+'" oninput="SWS_MUSIC.vol(this.value/100)"><button class="swsp-rep'+(st.repeat!=='off'?' act':'')+'" onclick="SWS_MUSIC.repeat()">'+repLbl+'</button></div>';
      h += '<div class="swsp-list">';
      h += plSectionHTML();
      var gs = groups();
      var editing = st.edit ? plGet(st.edit) : null;
      for(var g=0;g<gs.length;g++){
        h += '<div class="swsp-cat">'+esc(gs[g].cat)+'<span class="ln"></span><span class="ct">'+gs[g].items.length+'</span></div>';
        for(var m=0;m<gs[g].items.length;m++){
          var t=gs[g].items[m].t, i=gs[g].items[m].i, on=(i===st.idx);
          var member = editing ? (editing.ids.indexOf(t.id)>=0) : false;
          h += '<button class="swsp-trk'+(on?' on':'')+(st.edit?' edit':'')+(member?' member':'')+'" onclick="SWS_MUSIC.trackTap('+i+')">';
          h += '<div class="tt">'+(st.edit?'<span class="mk">'+(member?'&#10003;':'&#43;')+'</span> ':'')+esc(t.title)+(on&&st.playing&&!st.edit?' &nbsp;<span style="font-size:10px">&#9654; PLAYING</span>':'')+'</div>';
          h += '<div class="aa">'+esc(t.artist||'Stephen')+(t.mood?' &middot; '+esc(t.mood):'')+'</div>';
          h += '</button>';
        }
      }
      h += '</div>';
      h += '<div class="swsp-foot">'+(st.edit?'Tap tracks above to add them to your playlist.':'Build a playlist and hit Repeat to loop it. Public-domain classical via the Internet Archive.')+'</div>';
      h += '</div>';
      bg.innerHTML = h;
    }

    // Resume a track handed off from another page — only if it was playing, so
    // a first visit never gets surprise audio. Re-kicks on first interaction
    // when the browser blocks autoplay on a fresh load.
    function tryResume(){
      if(!st.playing || st.idx<0 || !TRACKS[st.idx]) return;
      var a = ensure(); a.src = TRACKS[st.idx].src;
      a.addEventListener('loadedmetadata', function(){ if(st._time>0){ try{ a.currentTime=st._time; }catch(e){} } }, {once:true});
      var p = a.play();
      if(p && p['catch']) p['catch'](function(){
        var onInt=function(){ document.removeEventListener('pointerdown',onInt,true); document.removeEventListener('keydown',onInt,true); var pp=a.play(); if(pp&&pp['catch'])pp['catch'](function(){}); };
        document.addEventListener('pointerdown',onInt,true); document.addEventListener('keydown',onInt,true);
      });
      render();
    }

    btn.addEventListener('click', openDrawer);
    window.SWS_MUSIC = { play:play, pause:pause, resume:resume, next:next, prev:prev, vol:setVol, repeat:cycleRepeat, close:closeDrawer, open:openDrawer,
                         trackTap:trackTap, plPlay:playPlaylist, plClear:clearPlaylist, plNew:plNew, plDelete:plDelete, plEdit:plEdit };

    buildQueue();
    tryResume();
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState==='hidden') save(); });
    return window.SWS_MUSIC;
  }

  window.SWSPlayer = { init: init };
})();
