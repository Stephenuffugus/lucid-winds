// ═══ LUCID WINDS — systems.js ═══
// UI, Social, Onboarding, Challenge, Backpack, Breeding, Biome, etc.
// ════════════════════════════════════════════

window.PW_UI=(function(){
'use strict';
var _bpOpen=false,_lbOpen=false,_csOpen=false;

// ═══ KEEPER RANK DATA — 50 levels, Wild v3 curve ═══
// Early levels (1-10) are fast to unlock the core loop.
// Mid levels (11-25) are the real feature gates (Wild v3 phase 2).
// Prestige levels (26-50) are long-tail cosmetic progression.
// Thresholds are CUMULATIVE XP — not per-level.
var RANKS=[
  {lvl:1, title:'Seedling',         xp:0},
  {lvl:2, title:'Sprout',           xp:25},
  {lvl:3, title:'Young Shoot',      xp:75},
  {lvl:4, title:'Budding',          xp:175},
  {lvl:5, title:'Tender',           xp:350},      // UNLOCK: stranger tend
  {lvl:6, title:'Grower',           xp:600},
  {lvl:7, title:'Cultivator',       xp:950},      // UNLOCK: greenhouse breeding
  {lvl:8, title:'Forager',          xp:1400},
  {lvl:9, title:'Gardener',         xp:2000},
  {lvl:10,title:'Naturalist',       xp:2800},     // UNLOCK: fruit harvest
  {lvl:11,title:'Herbalist',        xp:3800},
  {lvl:12,title:'Botanist',         xp:5000},     // UNLOCK: nursery merge-breed
  {lvl:13,title:'Warden',           xp:6500},
  {lvl:14,title:'Rootwalker',       xp:8500},
  {lvl:15,title:'Grove Tender',     xp:11000},    // UNLOCK: cuttings from wild
  {lvl:16,title:'Pathfinder',       xp:14000},
  {lvl:17,title:'Sage',             xp:17500},
  {lvl:18,title:'Archivist',        xp:22000},
  {lvl:19,title:'Curator',          xp:27500},    // UNLOCK: Book of Secrets pages
  {lvl:20,title:'Verdant',          xp:34000},
  {lvl:21,title:'Deeproot',         xp:42000},
  {lvl:22,title:'Thornkeeper',      xp:52000},
  {lvl:23,title:'Mossweaver',       xp:65000},    // UNLOCK: 4th daily Wild drop
  {lvl:24,title:'Fernscribe',       xp:80000},
  {lvl:25,title:'Ancient',          xp:100000},   // UNLOCK: Master Keeper cosmetic
  {lvl:26,title:'Canopy Walker',    xp:125000},
  {lvl:27,title:'Bloomweaver',      xp:155000},
  {lvl:28,title:'Petalsage',        xp:190000},
  {lvl:29,title:'Moonleaf',         xp:235000},
  {lvl:30,title:'Rootkeeper',       xp:290000},
  {lvl:31,title:'Sunseeker',        xp:355000},
  {lvl:32,title:'Dewspeaker',       xp:435000},
  {lvl:33,title:'Grove Elder',      xp:530000},
  {lvl:34,title:'Lucid Dreamer',    xp:640000},
  {lvl:35,title:'Patternkeeper',    xp:770000},
  {lvl:36,title:'Hexsage',          xp:920000},
  {lvl:37,title:'Cycleward',        xp:1100000},
  {lvl:38,title:'Chorusweaver',     xp:1310000},
  {lvl:39,title:'Mycelial Tender',  xp:1555000},
  {lvl:40,title:'Lineage Keeper',   xp:1840000},
  {lvl:41,title:'Starbloom',        xp:2170000},
  {lvl:42,title:'Deepvein',         xp:2550000},
  {lvl:43,title:'Windsinger',       xp:2985000},
  {lvl:44,title:'Drifttender',      xp:3480000},
  {lvl:45,title:'Timekeeper',       xp:4040000},
  {lvl:46,title:'Ancestral',        xp:4675000},
  {lvl:47,title:'Mythseeker',       xp:5390000},
  {lvl:48,title:'Starfield',        xp:6195000},
  {lvl:49,title:'Infinite Bloom',   xp:7100000},
  {lvl:50,title:'Lucid Keeper',     xp:8115000}
];

// Level-gated feature unlocks keyed by rank. Used by window.canSee.* and
// by the level-up celebration UI to announce "NEW UNLOCK" when crossing
// one of these thresholds. Keep in sync with WILD_V3_SPEC.md Section 11.
var LEVEL_UNLOCKS={
  5:  {key:'strangerTend', title:'Tend stranger plants', desc:'You can now tend other keepers\u2019 wild plants within 75m for +2 Dew each.'},
  7:  {key:'breed',        title:'Greenhouse breeding',  desc:'Cross-pollinate two of your own plants to grow a chimera seed.'},
  10: {key:'fruitHarvest', title:'Fruit harvest',        desc:'Take ripe fruit from stranger wild plants for Dew (small bloom delay).'},
  12: {key:'mergeBreed',   title:'Nursery merge breed',  desc:'Merge two nursery seeds into one for trait selection.'},
  15: {key:'cutting',      title:'Wild cuttings',        desc:'Take a cutting from a stranger wild plant — sample breeding seed.'},
  19: {key:'bookSecrets',  title:'Book of Secrets',      desc:'Unlock the Compendium of rare interactions and phenotype lore.'},
  23: {key:'fourthDrop',   title:'4th daily Wild drop',  desc:'You can now drop 4 plants per day instead of 3.'},
  25: {key:'masterKeeper', title:'Master Keeper',        desc:'Cosmetic gold border on your keeper bar + profile.'}
};

function _getXP(){try{return parseInt(localStorage.getItem('pw_xp')||'0');}catch(e){return 0;}}
function _saveXP(v){localStorage.setItem('pw_xp',String(v));}
function _getRank(xp){
  var r=RANKS[0];
  for(var i=RANKS.length-1;i>=0;i--){if(xp>=RANKS[i].xp){r=RANKS[i];break;}}
  var next=null;for(var j=0;j<RANKS.length;j++){if(RANKS[j].xp>xp){next=RANKS[j];break;}}
  return{level:r.lvl,title:r.title,xp:xp,nextXP:next?next.xp:r.xp+5000,nextTitle:next?next.title:'Legend'};
}

function _getName(){return localStorage.getItem('pw_keeper_name')||'Keeper';}
function _getFriendCode(){
  var c=localStorage.getItem('pw_friend_code');
  if(!c){c='????-????';} // Will be set by PW_Social.ensureProfile
  return c;
}

// ═══ XP BAR UPDATE ═══
function updateKeeperBar(){
  var xp=_getXP(),r=_getRank(xp);
  var pct=Math.min(100,Math.round(((xp-RANKS[r.level-1].xp)/(r.nextXP-RANKS[r.level-1].xp))*100));
  var fill=document.getElementById('kb-xp-fill');if(fill)fill.style.width=pct+'%';
  var rank=document.getElementById('kb-rank');if(rank)rank.textContent='Lvl '+r.level+' · '+r.title+' · '+xp+' / '+r.nextXP+' XP';
  var name=document.getElementById('kb-name');if(name)name.textContent=_getName();
  // Character sheet mirror
  var cf=document.getElementById('cs-xp-fill');if(cf)cf.style.width=pct+'%';
  var ct=document.getElementById('cs-xp-text');if(ct)ct.textContent=xp+' / '+r.nextXP+' XP → Level '+(r.level+1);
  var cn=document.getElementById('cs-name');if(cn)cn.textContent=_getName();
  var ti=document.getElementById('cs-title');if(ti)ti.textContent='◈ '+r.title+' · Level '+r.level;
  var fc=document.getElementById('cs-friend-code');if(fc)fc.textContent=_getFriendCode();
}

// ═══ GRANT XP (called from game systems) ═══
window.PW_grantXP=function(amount,reason){
  var xp=_getXP();
  var oldR=_getRank(xp);
  xp+=amount;_saveXP(xp);
  var newR=_getRank(xp);
  updateKeeperBar();
  if(newR.level>oldR.level){
    // Fire the celebration overlay for every level crossed (usually 1, but
    // huge XP grants can vault across multiple thresholds — show each one).
    for(var lvl=oldR.level+1;lvl<=newR.level;lvl++){
      _showLevelUp(lvl,reason);
    }
    // Log event for Root Report + achievements
    if(window.LW_Log)window.LW_Log.write('level_up',{
      fromLevel:oldR.level,
      toLevel:newR.level,
      newTitle:newR.title,
      reason:reason||'unknown'
    });
    console.log('[PW] Level up! '+oldR.title+' \u2192 '+newR.title+' (reason: '+(reason||'?')+')');
  }
};

// ═══ LEVEL-UP CELEBRATION OVERLAY ═══
// Builds lazily on first level-up. Shows the new level number, new title,
// and any Wild v3 unlock that fires at this threshold. Auto-dismisses after
// ~4.5 seconds or on tap. Queued so multiple level-ups don't overlap.
var _luQueue=[],_luBusy=false;
function _showLevelUp(level,reason){
  var rankEntry=null;
  for(var i=0;i<RANKS.length;i++){if(RANKS[i].lvl===level){rankEntry=RANKS[i];break;}}
  if(!rankEntry)return;
  _luQueue.push({level:level,title:rankEntry.title,unlock:LEVEL_UNLOCKS[level]||null,reason:reason});
  if(!_luBusy)_luProcessQueue();
}
function _luProcessQueue(){
  if(_luQueue.length===0){_luBusy=false;return;}
  _luBusy=true;
  var item=_luQueue.shift();
  var ov=document.getElementById('lu-overlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='lu-overlay';
    ov.className='lu-overlay';
    ov.innerHTML=
      '<div class="lu-scrim"></div>'+
      '<div class="lu-panel">'+
        '<div class="lu-label">LEVEL UP</div>'+
        '<div class="lu-level" id="lu-level-num">1</div>'+
        '<div class="lu-title" id="lu-title-text">Seedling</div>'+
        '<div class="lu-unlock" id="lu-unlock-card" style="display:none;">'+
          '<div class="lu-unlock-label">NEW UNLOCK</div>'+
          '<div class="lu-unlock-name" id="lu-unlock-name"></div>'+
          '<div class="lu-unlock-desc" id="lu-unlock-desc"></div>'+
        '</div>'+
        '<div class="lu-burst"></div>'+
      '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(){_luDismiss();});
  }
  document.getElementById('lu-level-num').textContent=item.level;
  document.getElementById('lu-title-text').textContent=item.title;
  var unlockCard=document.getElementById('lu-unlock-card');
  if(item.unlock){
    document.getElementById('lu-unlock-name').textContent=item.unlock.title;
    document.getElementById('lu-unlock-desc').textContent=item.unlock.desc;
    unlockCard.style.display='block';
  } else {
    unlockCard.style.display='none';
  }
  ov.classList.add('open');
  // Haptic + sound pulse
  try{if(navigator.vibrate)navigator.vibrate([30,55,30]);}catch(e){}
  if(window._playWin)window._playWin();
  // Auto-dismiss
  clearTimeout(_luTimer);
  _luTimer=setTimeout(function(){_luDismiss();},4500);
}
var _luTimer=null;
function _luDismiss(){
  clearTimeout(_luTimer);
  var ov=document.getElementById('lu-overlay');
  if(ov)ov.classList.remove('open');
  setTimeout(function(){_luProcessQueue();},350);
}

// ═══ UPDATE STATS ═══
// "Pollen" stat now displays the real lifetime XP (pw_xp), not the old
// fg_pollen dead counter. They're the same thing conceptually — Pollen IS
// Keeper XP in Wild v3. The cs-s-dew stat shows Sunbeams (hash balance).
function updateStats(){
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var wild=[];try{wild=JSON.parse((window._secureGet?window._secureGet('fg_wild_plants'):localStorage.getItem('fg_wild_plants'))||'[]');}catch(e){}
  var xp=_getXP();
  var sunbeams=0;try{var hl=JSON.parse((window._secureGet?window._secureGet('sws_hash_ledger'):localStorage.getItem('sws_hash_ledger'))||'{}');sunbeams=(hl.earned||0)-(hl.spent||0);}catch(e){}
  var e=function(id,v){var el=document.getElementById(id);if(el)el.textContent=v;};
  e('cs-s-plants',gh.length);e('cs-s-pollen',xp);e('cs-s-wild',wild.length);
  e('cs-s-dew',sunbeams);e('cs-s-days',Math.max(1,Math.floor((Date.now()-(parseInt(localStorage.getItem('pw_start')||Date.now())))/86400000)+1));
  e('lb-my-pollen',xp);e('lb-footer-pollen',xp);
}

// ═══ BACKPACK ═══
function toggleBP(){
  _bpOpen=!_bpOpen;
  var exp=document.getElementById('pw-bp-expanded');
  var scrim=document.getElementById('pw-bp-scrim');
  if(_bpOpen){exp.classList.add('open');scrim.classList.add('open');}
  else{exp.classList.remove('open');scrim.classList.remove('open');}
}
function closeBP(){
  _bpOpen=false;
  var exp=document.getElementById('pw-bp-expanded');if(exp)exp.classList.remove('open');
  var scrim=document.getElementById('pw-bp-scrim');if(scrim)scrim.classList.remove('open');
}

// ═══ LEADERBOARD ═══
function toggleLeaderboard(){
  _lbOpen=!_lbOpen;
  var dd=document.getElementById('pw-lb-dropdown');
  if(_lbOpen){dd.classList.add('open');updateStats();}
  else dd.classList.remove('open');
}
function setLBTab(el,tab){
  document.querySelectorAll('.lb-tab').forEach(function(t){t.classList.remove('active');});
  el.classList.add('active');
  // Placeholder: in production, fetch real data per tab
  console.log('[PW] Leaderboard tab:',tab);
}

// ═══ CHARACTER SHEET ═══
function openCharacter(){
  _csOpen=true;
  updateKeeperBar();updateStats();loadFriendsUI();
  _loadCompanion();_renderShowcase();_loadFeaturedHaiku();
  var _pcEl=document.getElementById('pw-character');if(_pcEl)_pcEl.classList.add('open');
}
function closeCharacter(){
  _csOpen=false;
  var _pcEl2=document.getElementById('pw-character');if(_pcEl2)_pcEl2.classList.remove('open');
}
function editShowcase(slot){
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  if(!gh.length){if(window._toast)window._toast('Bloom a plant first!');return;}
  // Build picker overlay
  var ov=document.createElement('div');
  ov.id='cs-showcase-picker';
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(5,8,4,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:panelFadeIn 0.3s ease;';
  var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.6rem;">CHOOSE A PLANT</div>';
  h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;max-width:340px;">';
  for(var i=0;i<gh.length;i++){
    var p=gh[i];
    var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(p.hash,28);}catch(e){}
    var t=window.hashToTraits?window.hashToTraits(p.hash):null;
    var nm=window.getPlantName?window.getPlantName(p.hash):'Plant';
    var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common',color:'var(--cream)'};
    h+='<div onclick="PW_UI._pickShowcase('+slot+','+i+')" style="cursor:pointer;background:rgba(18,22,16,0.7);border:1.5px solid rgba(122,179,86,0.15);border-radius:8px;padding:6px;text-align:center;min-height:48px;">';
    h+='<div style="width:56px;height:56px;margin:0 auto;">'+svg+'</div>';
    h+='<div style="font-size:0.38rem;color:'+tg.color+';margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+nm+'</div>';
    h+='</div>';
  }
  h+='</div>';
  h+='<button onclick="var pk=document.getElementById(\'cs-showcase-picker\');if(pk)pk.remove();" style="margin-top:0.8rem;padding:0.5rem 1.5rem;border:1.5px solid rgba(138,145,120,0.25);border-radius:8px;background:transparent;color:var(--muted);font-family:Bebas Neue,sans-serif;font-size:0.55rem;cursor:pointer;min-height:48px;">CANCEL</button>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
}
function _pickShowcase(slot,ghIdx){
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var p=gh[ghIdx];if(!p)return;
  var showcase=[];try{showcase=JSON.parse(localStorage.getItem('pw_showcase')||'[]');}catch(e){}
  // Return old showcase plant to greenhouse if replacing
  if(showcase[slot]&&showcase[slot].hash){
    var oldHash=showcase[slot].hash;
    var alreadyInGH=gh.some(function(g){return g.hash===oldHash;});
    if(!alreadyInGH){
      gh.push({hash:oldHash,date:showcase[slot].date||new Date().toISOString().split('T')[0],born:showcase[slot].born||Date.now(),origin:'showcase-return'});
    }
  }
  showcase[slot]={hash:p.hash,date:p.date,born:p.born};
  // Remove from greenhouse — frees the slot
  gh.splice(ghIdx,1);
  if(window._secureSet)window._secureSet('sws_greenhouse',gh);
  else localStorage.setItem('sws_greenhouse',JSON.stringify(gh));
  localStorage.setItem('pw_showcase',JSON.stringify(showcase));
  var pk=document.getElementById('cs-showcase-picker');if(pk)pk.remove();
  _renderShowcase();
  if(window.renderGreenhouse)renderGreenhouse();
  if(window._toast)window._toast('Plant showcased! Greenhouse slot freed.');
  _syncProfileField('showcase',showcase.map(function(s){return s?s.hash:null;}));
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
}
function _renderShowcase(){
  var showcase=[];try{showcase=JSON.parse(localStorage.getItem('pw_showcase')||'[]');}catch(e){}
  var grid=document.querySelector('.cs-showcase-grid');if(!grid)return;
  var r=_getRank(_getXP());
  var slots=r.level>=10?3:1;
  var h='';
  for(var i=0;i<3;i++){
    if(i>=slots){
      h+='<div class="cs-showcase-slot empty"><div>🔒 Level 10</div></div>';
    }else if(showcase[i]&&showcase[i].hash){
      var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(showcase[i].hash,32);}catch(e){}
      var nm=window.getPlantName?window.getPlantName(showcase[i].hash):'Plant';
      h+='<div class="cs-showcase-slot" onclick="PW_UI.editShowcase('+i+')" style="cursor:pointer;background:rgba(18,22,16,0.5);border-color:rgba(200,168,75,0.25);">';
      h+='<div style="width:64px;height:64px;margin:0 auto;">'+svg+'</div>';
      h+='<div style="font-size:0.38rem;color:var(--gold);margin-top:2px;">'+nm+'</div></div>';
    }else{
      h+='<div class="cs-showcase-slot empty" onclick="PW_UI.editShowcase('+i+')" style="cursor:pointer;"><div>+ Add Plant</div></div>';
    }
  }
  grid.innerHTML=h;
}
function copyFriendCode(){
  var code=_getFriendCode();
  if(navigator.clipboard){navigator.clipboard.writeText(code).then(function(){
    var err=document.getElementById('cs-friend-err');if(err)err.textContent='Copied!';
    setTimeout(function(){if(err)err.textContent='';},2000);
  });}else{alert('Your friend code: '+code);}
}

// ═══ ADD FRIEND ═══
function addFriend(){
  var input=document.getElementById('cs-add-friend');
  var err=document.getElementById('cs-friend-err');
  if(!input||!input.value.trim()){if(err)err.textContent='Enter a friend code.';return;}
  if(!window.PW_Social){if(err)err.textContent='Social system loading...';return;}
  if(err)err.textContent='Looking up...';
  PW_Social.lookupFriendCode(input.value.trim(),function(friend,errMsg){
    if(!friend){if(err)err.textContent=errMsg||'Not found.';return;}
    if(err)err.textContent='Found: '+friend.name+' (Lvl '+friend.level+'). Sending...';
    PW_Social.sendFriendRequest(friend.uid,function(ok,sendErr){
      if(ok){
        if(err)err.textContent='Request sent to '+friend.name+'!';
        if(input)input.value='';
        setTimeout(function(){if(err)err.textContent='';},3000);
      }else{
        if(err)err.textContent=sendErr||'Request failed.';
      }
    });
  });
}

// ═══ LOAD FRIENDS INTO CHARACTER SHEET ═══
function loadFriendsUI(){
  if(!window.PW_Social)return;
  // Load accepted friends
  PW_Social.loadFriends(function(friends){
    var el=document.getElementById('cs-friends-list');
    var cnt=document.getElementById('cs-friend-count');
    if(cnt)cnt.textContent='('+friends.length+')';
    if(!el)return;
    if(friends.length===0){el.innerHTML='<div style="color:var(--muted);font-size:0.42rem;">No friends yet. Share your code!</div>';return;}
    var h='';
    for(var i=0;i<friends.length;i++){
      var f=friends[i];
      h+='<div style="display:flex;align-items:center;justify-content:space-between;padding:0.25rem 0;border-bottom:1px solid rgba(74,124,53,0.06);">'
        +'<span style="color:var(--cream);">'+(f.senderName||f.friendUid.slice(0,8))+'</span>'
        +'<span style="color:var(--gold);font-family:DM Mono,monospace;font-size:0.38rem;">'+(f.pollen||0)+' pollen</span>'
        +'</div>';
    }
    el.innerHTML=h;
  });
  // Load pending requests
  PW_Social.loadPendingRequests(function(reqs){
    var el=document.getElementById('cs-pending-list');if(!el)return;
    if(reqs.length===0){el.innerHTML='';return;}
    var h='<div style="font-size:0.42rem;color:var(--gold);margin-bottom:0.2rem;">Pending Requests:</div>';
    for(var i=0;i<reqs.length;i++){
      var r=reqs[i];
      h+='<div style="display:flex;align-items:center;gap:0.3rem;padding:0.2rem 0;">'
        +'<span style="color:var(--cream);font-size:0.42rem;">'+(r.senderName||'Keeper')+'</span>'
        +'<button onclick="PW_UI.acceptReq(\''+r.uid+'\')" style="padding:0.15rem 0.4rem;border:1px solid rgba(122,179,86,0.3);border-radius:4px;background:rgba(74,124,53,0.1);color:var(--sage);font-size:0.38rem;cursor:pointer;">Accept</button>'
        +'<button onclick="PW_UI.declineReq(\''+r.uid+'\')" style="padding:0.15rem 0.4rem;border:1px solid rgba(139,46,46,0.2);border-radius:4px;background:none;color:var(--muted);font-size:0.38rem;cursor:pointer;">Decline</button>'
        +'</div>';
    }
    el.innerHTML=h;
  });
}
function acceptReq(uid){if(window.PW_Social)PW_Social.acceptFriend(uid,function(){loadFriendsUI();});}
function declineReq(uid){if(window.PW_Social)PW_Social.declineFriend(uid,function(){loadFriendsUI();});}

// ═══ EDIT KEEPER NAME ═══
function editName(){
  var cur=_getName();
  var ov=document.createElement('div');
  ov.id='cs-name-editor';
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(5,8,4,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:panelFadeIn 0.3s ease;';
  ov.innerHTML='<div style="text-align:center;max-width:280px;background:rgba(18,22,16,0.95);border:1.5px solid rgba(200,168,75,0.3);border-radius:16px;padding:1.2rem;box-shadow:0 12px 40px rgba(0,0,0,0.6);">'
    +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.65rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.6rem;">EDIT KEEPER NAME</div>'
    +'<input type="text" id="cs-name-input" value="'+cur.replace(/"/g,'&quot;')+'" maxlength="20" style="width:100%;padding:0.5rem;background:rgba(26,36,22,0.4);border:1.5px solid rgba(122,179,86,0.2);border-radius:8px;color:var(--cream);font-family:DM Mono,monospace;font-size:0.55rem;text-align:center;outline:none;margin-bottom:0.6rem;" />'
    +'<div style="display:flex;gap:0.4rem;">'
    +'<button onclick="var ne=document.getElementById(\'cs-name-editor\');if(ne)ne.remove();" style="flex:1;padding:0.5rem;border:1.5px solid rgba(138,145,120,0.25);border-radius:8px;background:transparent;color:var(--muted);font-family:Bebas Neue,sans-serif;font-size:0.55rem;cursor:pointer;min-height:48px;">CANCEL</button>'
    +'<button onclick="PW_UI._saveName()" style="flex:1;padding:0.5rem;border:1.5px solid rgba(122,179,86,0.3);border-radius:8px;background:rgba(74,124,53,0.15);color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:0.55rem;cursor:pointer;min-height:48px;">SAVE</button>'
    +'</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){var inp=document.getElementById('cs-name-input');if(inp)inp.focus();},100);
}
function _saveName(){
  var inp=document.getElementById('cs-name-input');if(!inp)return;
  var name=inp.value.trim();
  if(!name||name.length<1){if(window._toast)window._toast('Name cannot be empty.');return;}
  if(name.length>20)name=name.substring(0,20);
  localStorage.setItem('pw_keeper_name',name);
  updateKeeperBar();
  var ne=document.getElementById('cs-name-editor');if(ne)ne.remove();
  if(window._toast)window._toast('Name updated!');
  _syncProfileField('displayName',name);
}

// ═══ COMPANION EQUIPPING ═══
function _loadCompanion(){
  var activeComp=localStorage.getItem('pw_active_companion');
  if(!activeComp)return;
  try{
    var comp=JSON.parse(activeComp);
    var icon=document.getElementById('cs-companion-icon');
    var name=document.getElementById('cs-companion-name');
    var buff=document.getElementById('cs-companion-buff');
    if(icon)icon.textContent=comp.icon||'🐾';
    if(name)name.textContent=comp.name||'Unknown';
    var _buffText='';
    if(comp.ability)_buffText=comp.ability;
    if(comp.temperament)_buffText+=(_buffText?' · ':'')+comp.tempIcon+' '+comp.temperament;
    if(!_buffText)_buffText='Passive companion';
    if(buff)buff.innerHTML=_buffText;
  }catch(e){}
}
function equipCompanion(){
  // Scan greenhouse for plants with companions
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var found=[];
  var seen={};
  for(var i=0;i<gh.length;i++){
    var t=window.hashToTraits?window.hashToTraits(gh[i].hash):null;
    if(!t)continue;
    var cIdx=t.companion;
    var tb=window.TRAIT_BANK;
    if(!tb||!tb.companions||!tb.companions[cIdx])continue;
    var c=tb.companions[cIdx];
    if(c.name==='None'||seen[cIdx])continue;
    seen[cIdx]=true;
    var _compAbility='',_compTemp='',_compTempIcon='';
    if(window.getCompanionInfo){
      var _ci=getCompanionInfo(t);
      if(_ci&&_ci.ability){_compAbility=_ci.ability.name+': '+_ci.ability.desc;}
      if(_ci&&_ci.temperament){_compTemp=_ci.temperament.name+' — '+_ci.temperament.desc;_compTempIcon=_ci.temperament.icon||'';}
    }
    found.push({idx:cIdx,name:c.name,icon:c.icon||'🐾',ability:_compAbility,temperament:_compTemp,tempIcon:_compTempIcon,hash:gh[i].hash});
  }
  if(!found.length){if(window._toast)window._toast('Bloom a plant with a companion creature first!');return;}
  // Build picker
  var ov=document.createElement('div');
  ov.id='cs-comp-picker';
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(5,8,4,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:panelFadeIn 0.3s ease;';
  var h='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.6rem;">EQUIP COMPANION</div>';
  h+='<div style="width:100%;max-width:340px;">';
  var cur=localStorage.getItem('pw_active_companion');
  var curIdx=-1;try{if(cur)curIdx=JSON.parse(cur).idx;}catch(e){}
  for(var j=0;j<found.length;j++){
    var f=found[j];
    var active=f.idx===curIdx;
    h+='<div onclick="PW_UI._pickCompanion('+j+')" style="cursor:pointer;display:flex;align-items:center;gap:0.5rem;padding:0.5rem;margin-bottom:4px;background:rgba(18,22,16,'+(active?'0.8':'0.5')+');border:1.5px solid '+(active?'rgba(200,168,75,0.4)':'rgba(122,179,86,0.12)')+';border-radius:8px;min-height:48px;">';
    h+='<div style="font-size:1.2rem;width:32px;text-align:center;">'+f.icon+'</div>';
    h+='<div style="flex:1;"><div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--cream);">'+f.name+(active?' <span style="color:var(--gold);">★ ACTIVE</span>':'')+'</div>';
    if(f.ability)h+='<div style="font-family:DM Mono,monospace;font-size:0.38rem;color:var(--sage);margin-top:2px;">'+f.ability+'</div>';
    if(f.temperament)h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin-top:1px;">'+f.tempIcon+' '+f.temperament+'</div>';
    if(!f.ability&&!f.temperament)h+='<div style="font-size:0.35rem;color:var(--muted);">Passive companion</div>';
    h+='</div></div>';
  }
  h+='</div>';
  h+='<button onclick="var pk=document.getElementById(\'cs-comp-picker\');if(pk)pk.remove();" style="margin-top:0.8rem;padding:0.5rem 1.5rem;border:1.5px solid rgba(138,145,120,0.25);border-radius:8px;background:transparent;color:var(--muted);font-family:Bebas Neue,sans-serif;font-size:0.55rem;cursor:pointer;min-height:48px;">CLOSE</button>';
  ov.innerHTML=h;
  // Store found list for click handler
  window._csCompFound=found;
  document.body.appendChild(ov);
}
function _pickCompanion(idx){
  var f=window._csCompFound?window._csCompFound[idx]:null;if(!f)return;
  var compData={idx:f.idx,name:f.name,icon:f.icon,ability:f.ability,temperament:f.temperament,tempIcon:f.tempIcon};
  localStorage.setItem('pw_active_companion',JSON.stringify(compData));
  _loadCompanion();
  var pk=document.getElementById('cs-comp-picker');if(pk)pk.remove();
  if(window._toast)window._toast(f.name+' equipped!');
  _syncProfileField('activeCompanion',compData);
}

// ═══ SYNC SINGLE PROFILE FIELD TO FIRESTORE ═══
function _syncProfileField(field,value){
  try{
    if(!window.firebase||!firebase.auth||!firebase.auth().currentUser)return;
    var uid=firebase.auth().currentUser.uid;
    var update={};update[field]=value;
    firebase.firestore().collection('profiles').doc(uid).update(update).catch(function(e){
      console.warn('[PW] Profile field sync failed:',field,e.message);
    });
  }catch(e){}
}

// ═══ FEATURED HAIKU ═══
function _loadFeaturedHaiku(){
  var showcase=[];try{showcase=JSON.parse(localStorage.getItem('pw_showcase')||'[]');}catch(e){}
  var haikuEl=document.getElementById('cs-haiku');if(!haikuEl)return;
  // Use first showcase plant, or first greenhouse plant
  var hash=null;
  if(showcase[0]&&showcase[0].hash)hash=showcase[0].hash;
  if(!hash){
    var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
    if(gh.length)hash=gh[0].hash;
  }
  if(!hash){haikuEl.innerHTML='<em style="color:var(--muted);">Bloom your first plant to feature its haiku here</em>';return;}
  if(window.getHaiku){
    var hk=window.getHaiku(hash);
    haikuEl.innerHTML='<div style="color:var(--cream);font-style:italic;line-height:1.8;font-size:0.48rem;">'+hk.line1+'<br>'+hk.line2+'<br>'+hk.line3+'</div>';
  }
}

// ═══ FULL STATS UPDATE ═══
// Overwrite the basic updateStats with comprehensive version
function updateStats(){
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var wild=[];try{wild=JSON.parse((window._secureGet?window._secureGet('fg_wild_plants'):localStorage.getItem('fg_wild_plants'))||'[]');}catch(e){}
  var pollen=0;try{pollen=parseInt((window._secureGet?window._secureGet('fg_pollen'):localStorage.getItem('fg_pollen'))||'0');}catch(e){}
  var dew=0;try{var hl=JSON.parse((window._secureGet?window._secureGet('sws_hash_ledger'):localStorage.getItem('sws_hash_ledger'))||'{}');dew=(hl.earned||0)-(hl.spent||0);}catch(e){}
  // Games played — count from hash ledger sources
  var gamesPlayed=0;try{var hl2=JSON.parse((window._secureGet?window._secureGet('sws_hash_ledger'):localStorage.getItem('sws_hash_ledger'))||'{}');gamesPlayed=hl2.sources?hl2.sources.games||0:0;}catch(e){}
  // Seeds found (ferals)
  var ferals=[];try{ferals=JSON.parse(localStorage.getItem('fg_feral_collected')||'[]');}catch(e){}
  // Compost count
  var compostLog=[];try{compostLog=JSON.parse(localStorage.getItem('sws_compost_log')||'[]');}catch(e){}
  // Rarest grade
  var rarestIdx=0;
  var gradeOrder=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Cosmic'];
  for(var i=0;i<gh.length;i++){
    var t=window.hashToTraits?window.hashToTraits(gh[i].hash):null;
    var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common'};
    var gi=gradeOrder.indexOf(tg.name);
    if(gi>rarestIdx)rarestIdx=gi;
  }
  // Creatures discovered
  var bestiary=[];try{bestiary=JSON.parse(localStorage.getItem('pw_bestiary')||'[]');}catch(e){}
  // Friends count
  var friendCount=0;
  var fcEl=document.getElementById('cs-friend-count');
  if(fcEl){var m=fcEl.textContent.match(/\d+/);if(m)friendCount=parseInt(m[0]);}
  // Days active
  var daysActive=Math.max(1,Math.floor((Date.now()-(parseInt(localStorage.getItem('pw_start')||Date.now())))/86400000)+1);

  var e=function(id,v){var el=document.getElementById(id);if(el)el.textContent=v;};
  e('cs-s-plants',gh.length);
  e('cs-s-pollen',pollen);
  e('cs-s-seeds',ferals.length);
  e('cs-s-wild',wild.length);
  e('cs-s-games',gamesPlayed);
  e('cs-s-groves',0); // Will be populated when Root Networks are built
  e('cs-s-compost',compostLog.length);
  e('cs-s-dew',dew);
  e('cs-s-rarest',gradeOrder[rarestIdx]);
  e('cs-s-creatures',bestiary.length);
  e('cs-s-days',daysActive);
  e('cs-s-friends',friendCount);
  e('lb-my-pollen',pollen);e('lb-footer-pollen',pollen);
}

// ═══ WILD TAB SHOW/HIDE ═══
function showWildUI(){
  var bp=document.getElementById('pw-backpack');if(bp)bp.style.display='block';
  var fab=document.getElementById('pw-drop-fab');if(fab)fab.style.display='block';
}
function hideWildUI(){
  closeBP();
  var bp=document.getElementById('pw-backpack');if(bp)bp.style.display='none';
  var fab=document.getElementById('pw-drop-fab');if(fab)fab.style.display='none';
  var dd=document.getElementById('pw-lb-dropdown');if(dd)dd.classList.remove('open');_lbOpen=false;
}

// ═══ INIT ═══
function init(){
  if(!localStorage.getItem('pw_start'))localStorage.setItem('pw_start',String(Date.now()));
  updateKeeperBar();
  // Show keeper bar only if onboarded (onboarding controls it otherwise)
  if(localStorage.getItem('pw_onboarded')==='1'){
    var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='flex';
  }
}
setTimeout(init,200);

return{toggleBP:toggleBP,closeBP:closeBP,toggleLeaderboard:toggleLeaderboard,setLBTab:setLBTab,
  openCharacter:openCharacter,closeCharacter:closeCharacter,editShowcase:editShowcase,copyFriendCode:copyFriendCode,
  addFriend:addFriend,loadFriendsUI:loadFriendsUI,acceptReq:acceptReq,declineReq:declineReq,
  showWildUI:showWildUI,hideWildUI:hideWildUI,updateKeeperBar:updateKeeperBar,updateStats:updateStats,
  editName:editName,_saveName:_saveName,equipCompanion:equipCompanion,_pickCompanion:_pickCompanion,
  _pickShowcase:_pickShowcase};
})();

window.PW_Social=(function(){
'use strict';
var _profileChecked=false;
var CHARSET='ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No 0/O/1/I/L

function _genFriendCode(){
  var c='';for(var i=0;i<8;i++)c+=CHARSET[Math.floor(Math.random()*CHARSET.length)];
  return c;
}
function _formatCode(c){return c?c.substring(0,4)+'-'+c.substring(4):'';}

// ═══ ENSURE PROFILE EXISTS (called on every auth) ═══
function ensureProfile(user){
  if(!user||!user.uid||_profileChecked)return;
  var db=firebase.firestore();
  db.collection('profiles').doc(user.uid).get().then(function(doc){
    _profileChecked=true;
    if(doc.exists){
      // Profile exists — update local state
      var d=doc.data();
      if(d.friendCode)localStorage.setItem('pw_friend_code',_formatCode(d.friendCode));
      if(d.displayName)localStorage.setItem('pw_keeper_name',d.displayName);
      if(d.accountNumber)localStorage.setItem('pw_account_number',String(d.accountNumber));
      // Restore equipped companion if local lost it (e.g. fresh device, cleared cache)
      if(d.activeCompanion&&d.activeCompanion.name&&!localStorage.getItem('pw_active_companion')){
        try{localStorage.setItem('pw_active_companion',JSON.stringify(d.activeCompanion));}catch(e){}
      }
      if(window.PW_UI)PW_UI.updateKeeperBar();
      console.log('[PW_Social] Profile loaded: '+d.displayName+' #'+d.accountNumber);
      return;
    }
    // ═══ NEW PROFILE — create everything ═══
    console.log('[PW_Social] Creating new profile for '+user.uid.slice(0,8)+'…');
    _createNewProfile(user,db);
  }).catch(function(e){
    console.warn('[PW_Social] Profile check failed:',e.message);
    _profileChecked=true;
  });
}

function _createNewProfile(user,db){
  var keeperName=localStorage.getItem('pw_keeper_name')||
    (user.displayName)||(user.email?user.email.split('@')[0]:'Keeper');

  // Step 1: Get account number atomically
  var counterRef=db.collection('meta').doc('accountCounter');
  db.runTransaction(function(tx){
    return tx.get(counterRef).then(function(cDoc){
      var num=1;
      if(cDoc.exists&&cDoc.data().next){num=cDoc.data().next;}
      tx.update(counterRef,{next:num+1});
      return num;
    });
  }).then(function(accountNumber){
    console.log('[PW_Social] Account number: '+accountNumber);
    localStorage.setItem('pw_account_number',String(accountNumber));

    // Step 2: Generate unique friend code
    var code=_genFriendCode();
    var codeRef=db.collection('friendCodes').doc(code);

    // Try to create the friend code (will fail if duplicate)
    return codeRef.set({uid:user.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()})
      .then(function(){return{accountNumber:accountNumber,friendCode:code};})
      .catch(function(){
        // Collision — try once more with a new code
        var code2=_genFriendCode();
        return db.collection('friendCodes').doc(code2)
          .set({uid:user.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()})
          .then(function(){return{accountNumber:accountNumber,friendCode:code2};});
      });
  }).then(function(result){
    localStorage.setItem('pw_friend_code',_formatCode(result.friendCode));

    // Step 3: Determine pioneer status
    var badges=[];
    if(result.accountNumber<=100)badges.push('founders_aura');
    if(result.accountNumber<=1000)badges.push('pioneer');

    // Step 4: Create profile document
    var profile={
      displayName:keeperName,
      friendCode:result.friendCode,
      accountNumber:result.accountNumber,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      pollen:0,
      pollenRate:0,
      level:1,
      title:'Seedling',
      badges:badges,
      h3Index:null,
      activeCompanion:null,
      showcase:[],
      featuredHaiku:null,
      avatarConfig:{bgScene:'forest',borderStyle:'vine',trailColor:'#7ab356',pinStyle:'default'}
    };
    return db.collection('profiles').doc(user.uid).set(profile);
  }).then(function(){
    console.log('[PW_Social] Profile created successfully');
    if(window.PW_UI)PW_UI.updateKeeperBar();

    // Step 5: Initialize vault subdocuments
    _initVaultDocs(user.uid,db);
  }).catch(function(e){
    console.error('[PW_Social] Profile creation failed:',e.message);
  });
}

function _initVaultDocs(uid,db){
  var vaultRef=db.collection('vaults').doc(uid);
  var batch=db.batch();

  // Only set if they don't exist yet (merge:true)
  batch.set(vaultRef.collection('greenhouse').doc('state'),{maxSlots:10},{merge:true});
  batch.set(vaultRef.collection('feralPouch').doc('state'),{
    level:1,maxDaily:2,collectedToday:0,lastResetDate:new Date().toISOString().slice(0,10),cryoAvailable:false
  },{merge:true});
  batch.set(vaultRef.collection('hashWallet').doc('state'),{
    balance:0,totalEarned:0,sources:{games:0,milestones:0,events:0},spent:{watering:0,sprouting:0,mutations:0}
  },{merge:true});
  batch.set(vaultRef.collection('companions').doc('state'),{
    active:null,temperamentsRevealed:[],bloomsPerCompanion:{}
  },{merge:true});
  batch.set(vaultRef.collection('trailSteps').doc('state'),{
    lifetimeSteps:0,todaySteps:0,currentGiftTier:0
  },{merge:true});
  batch.set(vaultRef.collection('settings').doc('state'),{
    accountNumber:parseInt(localStorage.getItem('pw_account_number')||'0'),
    tutorialState:{onboarded:true},
    notifications:{events:true,friends:true,climate:true}
  },{merge:true});
  batch.set(vaultRef.collection('purchases').doc('state'),{
    greenhouseSlots:0,pouchLevel:1,totalPiSpent:0
  },{merge:true});

  batch.commit().then(function(){
    console.log('[PW_Social] Vault subdocuments initialized');
  }).catch(function(e){
    console.warn('[PW_Social] Vault init partial failure:',e.message);
  });
}

// ═══ FRIEND CODE LOOKUP ═══
function lookupFriendCode(code,callback){
  var clean=code.replace(/[-\s]/g,'').toUpperCase();
  if(clean.length!==8){callback(null,'Code must be 8 characters');return;}
  var db=firebase.firestore();
  db.collection('friendCodes').doc(clean).get().then(function(doc){
    if(!doc.exists){callback(null,'No keeper found with that code');return;}
    var friendUid=doc.data().uid;
    db.collection('profiles').doc(friendUid).get().then(function(pDoc){
      if(!pDoc.exists){callback(null,'Profile not found');return;}
      callback({uid:friendUid,name:pDoc.data().displayName,level:pDoc.data().level,title:pDoc.data().title});
    });
  }).catch(function(e){callback(null,e.message);});
}

// ═══ SEND FRIEND REQUEST ═══
function sendFriendRequest(friendUid,callback){
  var user=firebase.auth().currentUser;
  if(!user){callback(false,'Not logged in');return;}
  if(user.uid===friendUid){callback(false,'That\'s you!');return;}
  var db=firebase.firestore();
  var myName=localStorage.getItem('pw_keeper_name')||'Keeper';
  var batch=db.batch();
  var now=firebase.firestore.FieldValue.serverTimestamp();

  // My record: I sent a request
  batch.set(db.collection('friends').doc(user.uid).collection('connections').doc(friendUid),{
    status:'pending_sent',friendUid:friendUid,createdAt:now,pollen:0
  });
  // Their record: they received a request
  batch.set(db.collection('friends').doc(friendUid).collection('connections').doc(user.uid),{
    status:'pending_received',friendUid:user.uid,senderName:myName,createdAt:now,pollen:0
  });

  batch.commit().then(function(){
    callback(true);
  }).catch(function(e){
    callback(false,e.message);
  });
}

// ═══ ACCEPT FRIEND REQUEST ═══
function acceptFriend(friendUid,callback){
  var user=firebase.auth().currentUser;
  if(!user){callback(false);return;}
  var db=firebase.firestore();
  var batch=db.batch();
  var now=firebase.firestore.FieldValue.serverTimestamp();

  batch.update(db.collection('friends').doc(user.uid).collection('connections').doc(friendUid),{
    status:'accepted',acceptedAt:now
  });
  batch.update(db.collection('friends').doc(friendUid).collection('connections').doc(user.uid),{
    status:'accepted',acceptedAt:now
  });

  batch.commit().then(function(){callback(true);}).catch(function(e){
    console.error('[PW_Social] Accept failed:',e);callback(false);
  });
}

// ═══ DECLINE FRIEND REQUEST ═══
function declineFriend(friendUid,callback){
  var user=firebase.auth().currentUser;
  if(!user){callback(false);return;}
  var db=firebase.firestore();
  var batch=db.batch();

  batch.delete(db.collection('friends').doc(user.uid).collection('connections').doc(friendUid));
  batch.delete(db.collection('friends').doc(friendUid).collection('connections').doc(user.uid));

  batch.commit().then(function(){callback(true);}).catch(function(){callback(false);});
}

// ═══ LOAD FRIENDS LIST ═══
function loadFriends(callback){
  var user=firebase.auth().currentUser;
  if(!user){callback([]);return;}
  var db=firebase.firestore();
  db.collection('friends').doc(user.uid).collection('connections')
    .where('status','==','accepted').get().then(function(snap){
      var friends=[];
      snap.forEach(function(doc){
        var d=doc.data();d.uid=doc.id;friends.push(d);
      });
      callback(friends);
    }).catch(function(){callback([]);});
}

// ═══ LOAD PENDING REQUESTS ═══
function loadPendingRequests(callback){
  var user=firebase.auth().currentUser;
  if(!user){callback([]);return;}
  var db=firebase.firestore();
  db.collection('friends').doc(user.uid).collection('connections')
    .where('status','==','pending_received').get().then(function(snap){
      var reqs=[];
      snap.forEach(function(doc){var d=doc.data();d.uid=doc.id;reqs.push(d);});
      callback(reqs);
    }).catch(function(){callback([]);});
}

return{
  ensureProfile:ensureProfile,lookupFriendCode:lookupFriendCode,
  sendFriendRequest:sendFriendRequest,acceptFriend:acceptFriend,
  declineFriend:declineFriend,loadFriends:loadFriends,
  loadPendingRequests:loadPendingRequests,formatCode:_formatCode
};
})();


window.PW_Onboard=(function(){
'use strict';
var _giftHash=null,_giftTraits=null,_beat=0;

function _isOnboarded(){
  // Primary check
  if(localStorage.getItem('pw_onboarded')==='1')return true;
  // Robust fallback: if player has ANY sign of prior activity, they're returning
  try{var gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');if(gh.length>0){_markOnboarded();return true;}}catch(e){}
  if(localStorage.getItem('lw_vault_uid')){_markOnboarded();return true;}
  if(localStorage.getItem('sws_totalHashes')){_markOnboarded();return true;}
  if(localStorage.getItem('pw_keeper_name')){_markOnboarded();return true;}
  if(localStorage.getItem('sws_user_email')){_markOnboarded();return true;}
  if(localStorage.getItem('sws_user_session')){_markOnboarded();return true;}
  if(localStorage.getItem('lw_tut')){_markOnboarded();return true;}
  // Check if Firebase has an active session (survives localStorage clear)
  try{if(window.firebase&&firebase.auth&&firebase.auth().currentUser){_markOnboarded();return true;}}catch(e){}
  return false;
}
function _markOnboarded(){localStorage.setItem('pw_onboarded','1');}

// Generate a gift plant hash guaranteed Uncommon+ (min score 3)
function _genGiftHash(){
  // Gift plant must be Uncommon+ (score >= 2). Try 500 times.
  // hashToTraits + getTerraGrade are in Block 5, loaded before Block 15 (onboarding).
  var bestHash='';var bestScore=0;
  for(var attempts=0;attempts<500;attempts++){
    var h='';for(var i=0;i<64;i++)h+='0123456789abcdef'[Math.floor(Math.random()*16)];
    try{
      if(window.hashToTraits&&window.getTerraGrade){
        var t=window.hashToTraits(h);
        var g=window.getTerraGrade(t);
        if(g.score>bestScore){bestHash=h;bestScore=g.score;}
        if(g.score>=2){_giftHash=h;_giftTraits=t;console.log('[LW] Gift plant: '+g.name+' (score '+g.score+', attempt '+attempts+')');return h;}
      }
    }catch(e){}
  }
  // Fallback: use the best hash we found (even if Common — better than random)
  _giftHash=bestHash||('a'.repeat(64));
  try{if(window.hashToTraits)_giftTraits=window.hashToTraits(_giftHash);}catch(e){_giftTraits=null;}
  console.log('[LW] Gift plant fallback, best score: '+bestScore);
  return _giftHash;
}

function _getHaiku(hash){
  if(window.getHaiku){var h=window.getHaiku(hash);return[h.line1,h.line2,h.line3];}
  if(window._generateHaiku)return window._generateHaiku(hash);
  return['Seeds wait under ash','Moss drinks from split stone','Dawn cracks the dry husk'];
}

function start(){
  if(_isOnboarded())return;
  var el=document.getElementById('pw-onboard');if(!el)return;
  el.classList.add('active');
  var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='none';
  console.log('[LW] start() called');
  try{_genGiftHash();}catch(e){console.error('[LW] Gift hash generation failed:',e);}
  // Fallback: if _genGiftHash crashed, make a simple random hash
  if(!_giftHash){
    _giftHash='';
    for(var i=0;i<64;i++)_giftHash+='0123456789abcdef'[Math.floor(Math.random()*16)];
    if(window.hashToTraits){try{_giftTraits=window.hashToTraits(_giftHash);}catch(e2){_giftTraits=null;}}
  }
  console.log('[LW] Onboard start(), _generatePlantSVG exists:',!!window._generatePlantSVG);
  console.log('[LW] _giftHash:',_giftHash?_giftHash.substring(0,8)+'...':'NULL');
  if(window.startRain)window.startRain();
  // Beat 1 is already show class in HTML
  _beat=1;
  // Force Beat 1 to re-enter its show state so CSS transitions activate
  var beat1=document.getElementById('ob-beat1');
  if(beat1){
    beat1.classList.remove('show');
    void beat1.offsetHeight;
    beat1.classList.add('show');
  }
  // Text starts AFTER splash screen is gone (callback from splash dismiss)
  // If no splash, starts immediately
  var hasSplash=!!document.getElementById('pw-splash');
  if(hasSplash){
    window._obTextReady=function(){
      console.log('[LW] Starting Beat 1 text playback');
      _playLines(1);
      setTimeout(function(){var sk=document.getElementById('ob-skip');if(sk)sk.classList.add('show');},4000);
    };
  } else {
    setTimeout(function(){
      console.log('[LW] Starting Beat 1 text playback');
      _playLines(1);
    },2000);
    setTimeout(function(){var sk=document.getElementById('ob-skip');if(sk)sk.classList.add('show');},6000);
  }
  // Tap left to go back, tap right to go forward
  el.addEventListener('click',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    if(e.target.classList&&e.target.classList.contains('ob-dot'))return; // dots handle themselves
    // Start rain on first interaction (mobile requires gesture for AudioContext)
    if(window.startRain)window.startRain();
    var x=e.clientX||0;
    var w=window.innerWidth;
    if(x<w*0.3&&_beat>1){
      // Left 30% of screen — go back
      clearTimeout(_lineTimer);
      _showBeat(_beat-1);
    } else if(_beat<4){
      // Right 70% — go forward
      clearTimeout(_lineTimer);
      _advanceBeat();
    }
  });
}

var _lineTimer=null;

function _playLines(beat){
  var lines=document.querySelectorAll('.ob-line[data-beat="'+beat+'"]');
  if(!lines.length){_advanceBeat();return;}
  var i=0;
  function showNext(){
    if(i>=lines.length){
      // Hold last line, then advance
      _lineTimer=setTimeout(function(){_advanceBeat();},2500);
      return;
    }
    // Fade out previous
    if(i>0){lines[i-1].classList.remove('on');lines[i-1].classList.add('off');}
    // Fade in current
    lines[i].classList.add('on');lines[i].classList.remove('off');
    i++;
    _lineTimer=setTimeout(showNext,3000);
  }
  showNext();
}

function _resetLines(beat){
  var lines=document.querySelectorAll('.ob-line[data-beat="'+beat+'"]');
  for(var j=0;j<lines.length;j++){lines[j].classList.remove('on','off');}
}

function _advanceBeat(){
  if(_beat>=4)return;
  var next=_beat+1;
  _showBeat(next);
}

function _showBeat(n){
  var prev=_beat;
  _beat=n;
  clearTimeout(_lineTimer);

  // Update dots
  var dots=document.querySelectorAll('.ob-dot');
  for(var d=0;d<dots.length;d++)dots[d].classList.toggle('on',d===n-1);
  var dotsContainer=document.getElementById('ob-dots');
  if(dotsContainer)dotsContainer.style.display=(n===4)?'none':'flex';

  // Crossfade: fade out old beat, fade in new beat simultaneously
  var oldBeat=document.getElementById('ob-beat'+prev);
  var newBeat=document.getElementById('ob-beat'+n);

  // Start fading out old beat
  if(oldBeat&&prev!==n){
    oldBeat.classList.add('fade-out');
  }

  // Show new beat immediately (it starts at opacity 0 and transitions to 1)
  if(newBeat){
    newBeat.style.display='flex';
    // Force reflow so transition fires
    void newBeat.offsetWidth;
    newBeat.classList.add('show');
    newBeat.classList.remove('fade-out');
  }

  // After crossfade completes, clean up old beat
  setTimeout(function(){
    if(oldBeat&&prev!==n){
      oldBeat.classList.remove('show','fade-out');
      oldBeat.style.display='none';
    }
    for(var rb=1;rb<=4;rb++){_resetLines(rb);}

    if(n===4){
      if(window.stopRain)window.stopRain();
      _renderGiftPlant();
    } else {
      setTimeout(function(){_playLines(n);},800);
    }
  },1800);
}

function _renderGiftPlant(){
  var render=document.getElementById('ob-plant-render');
  if(!_giftHash){
    _giftHash='';
    for(var i=0;i<64;i++)_giftHash+='0123456789abcdef'[Math.floor(Math.random()*16)];
    try{if(window.hashToTraits)_giftTraits=window.hashToTraits(_giftHash);}catch(e){_giftTraits=null;}
  }
  if(render){
    var done=false;
    if(window._generatePlantSVG){
      try{
        var s=window._generatePlantSVG(_giftHash,160);
        if(s&&s.length>10){render.innerHTML=s;done=true;}
      }catch(e){console.error('[LW] SVG render failed:',e);}
    }
    if(!done){
      render.innerHTML='<div style="font-size:5rem;padding-top:1.5rem;">&#x1F33F;</div><div style="font-size:0.5rem;color:#5a7050;margin-top:0.5rem;">Your plant is taking shape...</div>';
    }
  }
  setTimeout(function(){
    var auth=document.getElementById('ob-auth');if(auth)auth.classList.add('show');
    var man=document.getElementById('ob-manifesto');if(man)man.style.opacity='1';
  },1200);
}

function _revealPlant(){
  // Unblur
  var render=document.getElementById('ob-plant-render');
  if(render)render.classList.remove('blurred');
  setTimeout(function(){if(render)render.classList.add('revealed');},50);

  // Show name and grade
  var tg={name:'Uncommon',color:'#8CB86E'};
  try{if(window.getTerraGrade&&_giftTraits)tg=window.getTerraGrade(_giftTraits);}catch(e){/* use default */}
  var A=['Verdant','Shadow','Golden','Crimson','Pale','Iron','Ember','Frost','Dusk','Storm','Moss','Jade','Azure','Copper','Silk','Wild'];
  var N=['Wisp','Bloom','Fern','Thorn','Crown','Root','Drift','Spiral','Haze','Phantom','Crest','Veil','Shard','Arch','Spire','Reed'];
  var nm=A[parseInt(_giftHash.substring(0,2),16)%A.length]+' '+N[parseInt(_giftHash.substring(2,4),16)%N.length];

  var nameEl=document.getElementById('ob-plant-name');
  if(nameEl){nameEl.textContent=nm;nameEl.style.color='#F0EBD8';nameEl.style.opacity='1';}
  var gradeEl=document.getElementById('ob-plant-grade');
  if(gradeEl){gradeEl.textContent='FLIP YOUR CARD TO REVEAL';gradeEl.style.color='#8a9178';gradeEl.style.opacity='1';}

  // Type out haiku
  setTimeout(function(){
    var haiku=_getHaiku(_giftHash);
    var hEl=document.getElementById('ob-haiku');
    if(hEl&&haiku){
      var lines=Array.isArray(haiku)?haiku:haiku.split('\n');
      hEl.innerHTML=lines.join('<br>')+'<div class="ob-haiku-src">&mdash; '+nm+'</div>';
      hEl.classList.add('show');
    }
  },1500);

  // Check for creature
  setTimeout(function(){
    if(_giftTraits&&_giftTraits.companion>=20){
      var creatures={20:'Droplet',21:'Bee',22:'Pollen',23:'Firefly',24:'Butterfly',25:'Moth',26:'Ladybug',27:'Snail',28:'Hummingbird',29:'Dragonfly',30:'Caterpillar',31:'Spider',32:'Toad',33:'Phoenix',34:'Bioluminescent Pulse',35:'Ancient Rune',36:'Great Blue Heron',37:'Starfall',38:'Beholder',39:'Cat',40:'Platypus',41:'Praying Mantis',42:'Hedgehog',43:'Pangolin',44:'Luna Moth',45:'Porcupine',46:'Glow Snail',47:'Axolotl',48:'Scorpion',49:'Origami Crane',50:'Garden Gnome',51:'Robin',52:'Worm',53:'Turtle',54:'Bat',55:'Mouse',56:'Owl',57:'Silly Goose'};
      var cName=creatures[_giftTraits.companion];
      if(cName){
        var cEl=document.getElementById('ob-creature');
        if(cEl){cEl.textContent='"It brought a companion \u2014 '+cName+'."';cEl.classList.add('show');}
      }
    }
  },3000);

  setTimeout(function(){
    var cont=document.getElementById('ob-continue');
    if(cont){cont.classList.add('show');setTimeout(function(){cont.scrollIntoView({behavior:'smooth',block:'center'});},300);}
    var dots=document.getElementById('ob-dots');if(dots)dots.style.display='none';
  },3500);
}

function submitAuth(){
  var nameInput=document.getElementById('ob-name-input');
  var emailInput=document.getElementById('ob-email');
  var passInput=document.getElementById('ob-pass');
  var errEl=document.getElementById('ob-auth-err');
  var btn=document.getElementById('ob-auth-btn');
  var name=(nameInput?nameInput.value:'').trim();
  var email=(emailInput?emailInput.value:'').trim();
  var pass=(passInput?passInput.value:'').trim();

  if(!name){if(errEl)errEl.textContent='Pick a name, Keeper.';return;}
  if(!email){if(errEl)errEl.textContent='Enter your email.';return;}
  if(pass.length<6){if(errEl)errEl.textContent='Password needs 6+ characters.';return;}

  if(btn){btn.disabled=true;btn.textContent='Growing...';}
  if(errEl)errEl.textContent='';
  console.log('[LW] submitAuth called, hash:',_giftHash?_giftHash.substring(0,8):'NULL');

  // Save keeper name
  localStorage.setItem('pw_keeper_name',name);

  // Safety: re-enable button after 10s if nothing happened
  var _authTimeout=setTimeout(function(){
    if(btn){btn.disabled=false;btn.textContent='\uD83C\uDF31 CLAIM THIS PLANT';}
    if(errEl)errEl.textContent='Connection timed out. Tap to try again.';
  },10000);

  // Firebase auth
  if(window.firebase&&firebase.auth){
    firebase.auth().createUserWithEmailAndPassword(email,pass).then(function(cred){
      clearTimeout(_authTimeout);
      console.log('[LW] Auth success, calling _mintGiftPlant + _revealPlant');
      // ═══ TRACK SIGN UP WITH REF CODE (set-38) ═══
      if(typeof gtag!=='undefined')gtag('event','sign_up',{method:'email',ref_code:window._swsRef||''});
      // Success — mint the gift plant
      _mintGiftPlant();
      // Hide auth, reveal plant
      var auth=document.getElementById('ob-auth');if(auth)auth.style.display='none';
      _revealPlant();
      // Grant first XP
      if(window.PW_grantXP)PW_grantXP(10,'first_plant');
    }).catch(function(err){
      clearTimeout(_authTimeout);
      console.error('[LW] Auth error:',err.code,err.message);
      if(btn){btn.disabled=false;btn.textContent='\uD83C\uDF31 CLAIM THIS PLANT';}
      var msg=err.message||'Something went wrong.';
      if(err.code==='auth/email-already-in-use'){
        // Account exists — try signing in (returning player used signup form)
        firebase.auth().signInWithEmailAndPassword(email,pass).then(function(){
          clearTimeout(_authTimeout);
          console.log('[LW] Auth success (sign-in) — returning player via signup form');
          // Do NOT mint gift plant — they already have an account
          _markOnboarded();
          var authEl=document.getElementById('ob-auth');if(authEl)authEl.style.display='none';
          var el=document.getElementById('pw-onboard');
          if(el){el.style.display='none';el.style.pointerEvents='none';el.classList.remove('active');}
          var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='flex';
          if(window.PW_UI)PW_UI.updateKeeperBar();
          setTimeout(function(){
            if(window.renderGreenhouse)renderGreenhouse();
            if(window.updateDashboard)updateDashboard();
            if(window.switchTab)switchTab('greenhouse');
          },1500);
        }).catch(function(e2){
          clearTimeout(_authTimeout);
          console.error('[LW] Auth error:',e2.code,e2.message);
          if(btn){btn.disabled=false;btn.textContent='\uD83C\uDF31 CLAIM THIS PLANT';}
          if(errEl)errEl.textContent='Account exists. Wrong password? Use "Sign in" below.';
        });
        return;
      }
      if(errEl)errEl.textContent=msg;
    });
  }else{
    clearTimeout(_authTimeout);
    // No Firebase — local only mode
    _mintGiftPlant();
    var auth=document.getElementById('ob-auth');if(auth)auth.style.display='none';
    _revealPlant();
    if(window.PW_grantXP)PW_grantXP(10,'first_plant');
  }
}

function _mintGiftPlant(){
  // If hash generation failed, generate one now — NEVER silently skip
  if(!_giftHash){
    console.warn('[LW] _mintGiftPlant: _giftHash was null, generating fallback');
    try{_genGiftHash();}catch(e){}
  }
  if(!_giftHash){
    _giftHash='';
    for(var fi=0;fi<64;fi++)_giftHash+='0123456789abcdef'[Math.floor(Math.random()*16)];
    console.warn('[LW] _mintGiftPlant: using random fallback hash');
  }
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){gh=[];}
  if(gh.some(function(p){return p.hash===_giftHash;}))return;
  gh.push({
    hash:_giftHash,
    date:new Date().toISOString().split('T')[0],
    born:Date.now(),
    origin:'gift',
    rare:true,
    traits:null,
    breedCount:0,
    generation:1
  });
  if(window.saveGreenhouse){saveGreenhouse(gh);}else{localStorage.setItem('sws_greenhouse',JSON.stringify(gh));}
  console.log('[LW] Gift plant minted: '+_giftHash.slice(0,8));
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
}

function finish(){
  _markOnboarded();
  var el=document.getElementById('pw-onboard');
  if(el){el.style.display='none';el.style.pointerEvents='none';el.classList.remove('active');}
  var dots=document.getElementById('ob-dots');if(dots)dots.style.display='none';
  var skip=document.getElementById('ob-skip');if(skip)skip.style.display='none';
  var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='flex';
  if(window.PW_UI)PW_UI.updateKeeperBar();
  if(window.renderGreenhouse)renderGreenhouse();
  if(window.updateDashboard)updateDashboard();
  if(window.switchTab)switchTab('greenhouse');
}

function skip(){
  if(window.stopRain)window.stopRain();
  // set-51: Skip cinematic but still show auth form (beat 4)
  // Previously this bypassed signup entirely — user got no account
  if(!_giftHash)_genGiftHash();
  if(!_giftHash){_giftHash='';for(var i=0;i<64;i++)_giftHash+='0123456789abcdef'[Math.floor(Math.random()*16)];}
  clearTimeout(_lineTimer);
  // Jump straight to beat 4 which shows auth form + gift plant
  _beat=3; // _showBeat increments from current
  _showBeat(4);
  // Hide skip button since we're already at the end
  var sk=document.getElementById('ob-skip');if(sk)sk.style.display='none';
}

// ═══ CREATURE DISCOVERY TUTORIAL ═══
// Called after any plant bloom that has a companion
window.PW_creatureDiscovery=function(companionName,companionIdx){
  // Check if this is their first creature ever
  var found=[];try{found=JSON.parse(localStorage.getItem('pw_bestiary')||'[]');}catch(e){}
  var isFirst=found.length===0;
  if(found.indexOf(companionIdx)===-1){found.push(companionIdx);localStorage.setItem('pw_bestiary',JSON.stringify(found));}
  if(!isFirst)return; // Only show tutorial on FIRST creature
  // Brief delay then show discovery animation
  setTimeout(function(){
    var toast=document.createElement('div');
    toast.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999999;background:rgba(17,22,17,0.98);border:1.5px solid rgba(200,168,75,0.25);border-radius:14px;padding:1.2rem 1.5rem;text-align:center;max-width:280px;box-shadow:0 12px 40px rgba(0,0,0,0.7);animation:panelFadeIn 0.4s ease;';
    toast.innerHTML='<div style="font-size:2.5rem;margin-bottom:0.4rem;">&#x1F98E;</div>'
      +'<div style="font-family:Playfair Display,serif;font-size:0.85rem;color:var(--cream);margin-bottom:0.3rem;">A creature appeared!</div>'
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:0.5rem;">'+companionName+'</div>'
      +'<div style="font-size:0.42rem;color:var(--muted);line-height:1.6;margin-bottom:0.6rem;">You can equip creatures in your <b style="color:var(--sage);">Greenhouse &rarr; Bestiary</b> for passive bonuses. Discover more by blooming plants!</div>'
      +'<button onclick="this.parentElement.remove()" style="padding:0.4rem 1.2rem;border:1.5px solid rgba(122,179,86,0.2);border-radius:6px;background:rgba(26,36,22,0.3);color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:0.6rem;cursor:pointer;min-height:44px;">GOT IT</button>';
    document.body.appendChild(toast);
    if(window.PW_grantXP)PW_grantXP(15,'first_creature');
  },1500);
};

// ═══ INIT ═══
// Wait for Firebase auth to settle before deciding whether to show onboarding.
// onAuthStateChanged fires null first, then fires again with user if session exists.
// We need to wait for the real auth state before checking _isOnboarded.
var _obInitDone=false;
function _obInit(){
  if(_obInitDone)return;_obInitDone=true;
  if(!_isOnboarded()){start();}else{
    var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='flex';
  }
}
// If Firebase auth resolves a user, we know they're returning — skip onboarding
try{
  if(window.firebase&&firebase.auth){
    var _obUnsub=firebase.auth().onAuthStateChanged(function(user){
      _obUnsub(); // one-shot listener
      if(user){_markOnboarded();_obInit();}
      else{setTimeout(_obInit,200);} // no user — tiny delay then check localStorage
    });
  } else {
    setTimeout(_obInit,800);
  }
}catch(e){setTimeout(_obInit,800);}
// Safety net: if auth never fires, start after 2.5s
setTimeout(_obInit,2500);

// Go to specific beat (from dot taps or swipe)
function goToBeat(n){
  if(n<1||n>4||n===_beat)return;
  clearTimeout(_lineTimer);
  _showBeat(n);
}

// Swipe support for onboarding
(function(){
  var sx=0,sy=0;
  var el=document.getElementById('pw-onboard');
  if(!el)return;
  el.addEventListener('touchstart',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    sx=e.changedTouches[0].clientX;sy=e.changedTouches[0].clientY;
  },{passive:true});
  el.addEventListener('touchend',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    var dx=e.changedTouches[0].clientX-sx;
    var dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx))return;
    clearTimeout(_lineTimer);
    if(dx<0&&_beat<4)_showBeat(_beat+1); // swipe left = next
    else if(dx>0&&_beat>1)_showBeat(_beat-1); // swipe right = prev
  },{passive:true});
})();

// ═══ RETURNING PLAYER LOGIN ═══
function showLogin(){
  var newForm=document.getElementById('ob-auth-new');
  var loginForm=document.getElementById('ob-auth-login');
  if(newForm)newForm.style.display='none';
  if(loginForm)loginForm.style.display='block';
  // Hide gift plant preview since they already have plants
  var render=document.getElementById('ob-plant-render');if(render)render.style.opacity='0.3';
  var nameEl=document.getElementById('ob-name');if(nameEl)nameEl.style.display='none';
  var gradeEl=document.getElementById('ob-grade');if(gradeEl)gradeEl.style.display='none';
  var haikuEl=document.getElementById('ob-haiku');if(haikuEl)haikuEl.style.display='none';
  var manifesto=document.getElementById('ob-manifesto');if(manifesto)manifesto.style.display='none';
}

function showSignup(){
  var newForm=document.getElementById('ob-auth-new');
  var loginForm=document.getElementById('ob-auth-login');
  if(newForm)newForm.style.display='block';
  if(loginForm)loginForm.style.display='none';
  // Restore gift plant preview
  var render=document.getElementById('ob-plant-render');if(render)render.style.opacity='1';
  var nameEl=document.getElementById('ob-name');if(nameEl)nameEl.style.display='';
  var gradeEl=document.getElementById('ob-grade');if(gradeEl)gradeEl.style.display='';
  var haikuEl=document.getElementById('ob-haiku');if(haikuEl)haikuEl.style.display='';
  var manifesto=document.getElementById('ob-manifesto');if(manifesto)manifesto.style.display='';
}

function submitLogin(){
  var email=(document.getElementById('ob-login-email').value||'').trim();
  var pass=document.getElementById('ob-login-pass').value||'';
  var errEl=document.getElementById('ob-login-err');
  var btn=document.getElementById('ob-login-btn');

  if(!email){if(errEl)errEl.textContent='Enter your email.';return;}
  if(!pass){if(errEl)errEl.textContent='Enter your password.';return;}

  if(btn){btn.disabled=true;btn.textContent='Signing in...';}
  if(errEl)errEl.textContent='';

  var _loginTimeout=setTimeout(function(){
    if(btn){btn.disabled=false;btn.textContent='SIGN IN';}
    if(errEl)errEl.textContent='Connection timed out. Try again.';
  },10000);

  if(window.firebase&&firebase.auth){
    firebase.auth().signInWithEmailAndPassword(email,pass).then(function(){
      clearTimeout(_loginTimeout);
      console.log('[LW] Login success — returning player');
      if(typeof gtag!=='undefined')gtag('event','login',{method:'email'});
      // Do NOT mint gift plant — this is a returning player
      _markOnboarded();
      // Hide onboarding
      var el=document.getElementById('pw-onboard');
      if(el){el.style.display='none';el.style.pointerEvents='none';el.classList.remove('active');}
      var dots=document.getElementById('ob-dots');if(dots)dots.style.display='none';
      var kb=document.getElementById('pw-keeper-bar');if(kb)kb.style.display='flex';
      if(window.PW_UI)PW_UI.updateKeeperBar();
      // Vault hydration happens via onAuthStateChanged → _loadVaultForUser
      // Just switch to greenhouse after a brief delay for hydration
      setTimeout(function(){
        if(window.renderGreenhouse)renderGreenhouse();
        if(window.updateDashboard)updateDashboard();
        if(window.switchTab)switchTab('greenhouse');
      },1500);
    }).catch(function(err){
      clearTimeout(_loginTimeout);
      if(btn){btn.disabled=false;btn.textContent='SIGN IN';}
      var msg='Something went wrong.';
      if(err.code==='auth/wrong-password'||err.code==='auth/invalid-credential'||err.code==='auth/invalid-login-credentials'){
        msg='Incorrect password. Try again.';
      } else if(err.code==='auth/user-not-found'){
        msg='No account with that email. Create one instead?';
      } else if(err.code==='auth/too-many-requests'){
        msg='Too many attempts. Wait a moment and try again.';
      } else {
        msg=err.message||msg;
      }
      if(errEl)errEl.textContent=msg;
    });
  } else {
    clearTimeout(_loginTimeout);
    if(errEl)errEl.textContent='Connection unavailable. Try again later.';
    if(btn){btn.disabled=false;btn.textContent='SIGN IN';}
  }
}

function forgotPassword(){
  var email=(document.getElementById('ob-login-email').value||'').trim();
  var errEl=document.getElementById('ob-login-err');
  if(!email){if(errEl)errEl.textContent='Enter your email first, then tap Forgot Password.';return;}
  if(errEl)errEl.textContent='';
  if(window.firebase&&firebase.auth){
    firebase.auth().sendPasswordResetEmail(email).then(function(){
      if(errEl){errEl.style.color='var(--sage)';errEl.textContent='Reset link sent to '+email+'. Check your inbox (and spam folder).';}
      if(typeof gtag!=='undefined')gtag('event','password_reset_sent',{method:'email'});
    }).catch(function(e){
      if(errEl){errEl.style.color='#c07070';
        if(e.code==='auth/user-not-found')errEl.textContent='No account found with that email.';
        else if(e.code==='auth/invalid-email')errEl.textContent='Invalid email address.';
        else if(e.code==='auth/too-many-requests')errEl.textContent='Too many attempts. Try again later.';
        else errEl.textContent='Error: '+(e.message||'Unknown error');
      }
    });
  } else {
    if(errEl)errEl.textContent='Auth system not loaded. Refresh and try again.';
  }
}

return{start:start,submitAuth:submitAuth,finish:finish,skip:skip,goToBeat:goToBeat,showLogin:showLogin,showSignup:showSignup,submitLogin:submitLogin,forgotPassword:forgotPassword};
})();



window.FG_Challenge = (function(){
'use strict';

var _callback=null,_timer=null,_timeLeft=0,_timeMax=0,_solved=false;
var _type='',_state={};

// ═══ SHARED: Timer, Modal, Win/Lose ═══
function _startTimer(){
  var fill=document.getElementById('fc-timer-fill');
  var text=document.getElementById('fc-timer-text');
  _timer=setInterval(function(){
    _timeLeft-=100;
    if(_timeLeft<=0){_timeLeft=0;_lose();return;}
    var pct=Math.round((_timeLeft/_timeMax)*100);
    if(fill){fill.style.width=pct+'%';if(pct<30)fill.classList.add('urgent');else fill.classList.remove('urgent');}
    if(text)text.textContent=Math.ceil(_timeLeft/1000)+'s';
    if(_timeLeft<=3100&&_timeLeft>2900){try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}}
  },100);
}
function _win(){
  _solved=true;clearInterval(_timer);
  var r=document.getElementById('fc-result');
  if(r){r.textContent='\ud83c\udf3f SUCCESS!';r.style.color='var(--sage)';r.classList.add('show');}
  try{navigator.vibrate&&navigator.vibrate([30,50,30]);}catch(e){}
  setTimeout(function(){_close();if(_callback)_callback(true);},900);
}
function _lose(){
  _solved=true;clearInterval(_timer);
  var r=document.getElementById('fc-result');
  if(r){r.textContent='\u23f0 TIME UP';r.style.color='#c07070';r.classList.add('show');}
  try{navigator.vibrate&&navigator.vibrate(200);}catch(e){}
  setTimeout(function(){_close();if(_callback)_callback(false);},1100);
}
function _close(){
  var m=document.getElementById('fc-modal');if(m)m.classList.remove('open');
  clearInterval(_timer);
  var r=document.getElementById('fc-result');if(r){r.classList.remove('show');r.style.color='var(--gold)';}
  // If closed without solving, treat as abandon (fail)
  if(!_solved&&_callback){var cb=_callback;_callback=null;cb(false);}
  _solved=false;
}

// ═══ TYPE 1: QUICK TRIOS ═══
var SET_SHAPES=['circle','diamond','wave'];
var SET_COLORS=['#7ab356','#C8A84B','#c07070'];
function _shapeSVG(s,c,sz){sz=sz||16;if(s==='circle')return'<svg viewBox="0 0 20 20" width="'+sz+'" height="'+sz+'"><circle cx="10" cy="10" r="8" fill="'+c+'" opacity="0.85"/></svg>';if(s==='diamond')return'<svg viewBox="0 0 20 20" width="'+sz+'" height="'+sz+'"><polygon points="10,2 18,10 10,18 2,10" fill="'+c+'" opacity="0.85"/></svg>';return'<svg viewBox="0 0 20 20" width="'+sz+'" height="'+sz+'"><path d="M2,14 Q6,6 10,10 Q14,14 18,6" stroke="'+c+'" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';}
function _isSet(a,b,c){var ps=['shape','color','count'];for(var i=0;i<ps.length;i++){var p=ps[i];if(!(a[p]===b[p]&&b[p]===c[p])&&!(a[p]!==b[p]&&b[p]!==c[p]&&a[p]!==c[p]))return false;}return true;}
function _genSetBoard(){
  for(var att=0;att<200;att++){var cards=[];for(var i=0;i<9;i++)cards.push({shape:SET_SHAPES[Math.floor(Math.random()*3)],color:SET_COLORS[Math.floor(Math.random()*3)],count:[1,2,3][Math.floor(Math.random()*3)],idx:i});
  var sc=0;for(var a=0;a<7;a++)for(var b=a+1;b<8;b++)for(var c=b+1;c<9;c++)if(_isSet(cards[a],cards[b],cards[c]))sc++;
  if(sc>=1&&sc<=3)return cards;}
  return[{shape:'circle',color:'#7ab356',count:1,idx:0},{shape:'diamond',color:'#C8A84B',count:2,idx:1},{shape:'wave',color:'#c07070',count:3,idx:2},{shape:'circle',color:'#C8A84B',count:3,idx:3},{shape:'diamond',color:'#c07070',count:1,idx:4},{shape:'wave',color:'#7ab356',count:2,idx:5},{shape:'circle',color:'#c07070',count:2,idx:6},{shape:'diamond',color:'#7ab356',count:3,idx:7},{shape:'wave',color:'#C8A84B',count:1,idx:8}];
}
function _renderSet(){
  var b=document.getElementById('fc-board');if(!b)return;b.style.gridTemplateColumns='repeat(3,1fr)';
  var h='';for(var i=0;i<_state.cards.length;i++){var c=_state.cards[i];var sel=_state.sel.indexOf(i)>=0;
  var shapes='';for(var j=0;j<c.count;j++)shapes+=_shapeSVG(c.shape,c.color,18);
  h+='<div class="fc-card'+(sel?' selected':'')+'" onclick="FG_Challenge._tap('+i+')"><div class="fc-shape">'+shapes+'</div></div>';}b.innerHTML=h;
}
function _tapSet(idx){
  if(_solved)return;var pos=_state.sel.indexOf(idx);
  if(pos>=0)_state.sel.splice(pos,1);else{if(_state.sel.length>=3)return;_state.sel.push(idx);}
  _renderSet();
  if(_state.sel.length===3){var a=_state.cards[_state.sel[0]],b=_state.cards[_state.sel[1]],c=_state.cards[_state.sel[2]];
  if(_isSet(a,b,c))_win();else{var els=document.querySelectorAll('.fc-card.selected');for(var i=0;i<els.length;i++)els[i].classList.add('wrong');
  setTimeout(function(){_state.sel=[];_renderSet();},400);try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}}}
}

// ═══ TYPE 2: PATTERN MEMORY ═══
var MEM_COLORS=['#7ab356','#C8A84B','#c07070','#5a9fcf','#9b59b6','#e67e22'];
function _genMemory(difficulty){
  var count=difficulty>=2?6:difficulty>=1?5:4;
  var seq=[];for(var i=0;i<count;i++)seq.push({color:MEM_COLORS[Math.floor(Math.random()*MEM_COLORS.length)],x:15+Math.random()*70,y:15+Math.random()*70});
  return seq;
}
function _renderMemory(){
  var b=document.getElementById('fc-board');if(!b)return;
  b.style.gridTemplateColumns='1fr';
  var s=_state;
  var h='<div style="position:relative;width:100%;height:240px;background:rgba(26,36,22,0.3);border-radius:10px;border:1px solid rgba(74,124,53,0.1);">';
  for(var i=0;i<s.seq.length;i++){
    var dot=s.seq[i];var visible=s.phase==='show'||(s.phase==='input'&&s.revealed[i]);
    var active=s.phase==='input'&&!s.revealed[i];
    h+='<div onclick="FG_Challenge._tap('+i+')" style="position:absolute;left:'+dot.x+'%;top:'+dot.y+'%;width:36px;height:36px;border-radius:50%;transform:translate(-50%,-50%);cursor:'+(active?'pointer':'default')+';background:'+(visible?dot.color:'rgba(122,179,86,0.08)')+';border:2px solid '+(visible?dot.color:'rgba(122,179,86,0.15)')+';opacity:'+(visible?'0.9':'0.6')+';transition:all 0.3s;display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:#000;">'+(s.phase==='show'?(i+1):'')+'</div>';
  }
  h+='</div>';
  if(s.phase==='show')h+='<div style="text-align:center;font-size:0.5rem;color:var(--gold);margin-top:8px;">Memorize the sequence ('+s.seq.length+' dots)</div>';
  else h+='<div style="text-align:center;font-size:0.5rem;color:var(--cream);margin-top:8px;">Tap dot #'+(s.inputIdx+1)+' of '+s.seq.length+'</div>';
  b.innerHTML=h;
}
function _tapMemory(idx){
  if(_solved||_state.phase!=='input')return;
  if(idx===_state.order[_state.inputIdx]){
    _state.revealed[idx]=true;_state.inputIdx++;_renderMemory();
    if(_state.inputIdx>=_state.seq.length)_win();
  }else{
    var els=document.querySelectorAll('#fc-board div[onclick]');if(els[idx])els[idx].style.background='#c07070';
    setTimeout(function(){_renderMemory();},300);try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}
  }
}

// ═══ TYPE 3: GROWTH SEQUENCE (replaced Spot the Difference) ═══
var GROWTH_STAGES=[
  {name:'Seed',icon:'\ud83c\udf30',desc:'Dormant'},
  {name:'Sprout',icon:'\ud83c\udf31',desc:'First leaves'},
  {name:'Growing',icon:'\ud83c\udf3f',desc:'Establishing'},
  {name:'Bloom',icon:'\ud83c\udf3a',desc:'Full flower'}
];
var GROWTH_STAGES_HARD=[
  {name:'Seed',icon:'\ud83c\udf30',desc:'Dormant'},
  {name:'Germinating',icon:'\ud83d\udca7',desc:'Water activates'},
  {name:'Sprout',icon:'\ud83c\udf31',desc:'First leaves'},
  {name:'Growing',icon:'\ud83c\udf3f',desc:'Establishing'},
  {name:'Flowering',icon:'\ud83c\udf3c',desc:'Buds forming'},
  {name:'Bloom',icon:'\ud83c\udf3a',desc:'Full flower'}
];
function _genGrowth(difficulty){
  var stages=difficulty>=2?GROWTH_STAGES_HARD.slice():difficulty>=1?GROWTH_STAGES.concat([{name:'Flowering',icon:'\ud83c\udf3c',desc:'Buds forming'}]):GROWTH_STAGES.slice();
  var shuffled=stages.slice();
  for(var i=shuffled.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=t;}
  var same=true;for(var k=0;k<shuffled.length;k++){if(shuffled[k].name!==stages[k].name){same=false;break;}}
  if(same){var tmp=shuffled[0];shuffled[0]=shuffled[1];shuffled[1]=tmp;}
  return{correct:stages,shuffled:shuffled,picked:[],remaining:shuffled.map(function(s,i){return{stage:s,idx:i,used:false};})};
}
function _renderGrowth(){
  var b=document.getElementById('fc-board');if(!b)return;var s=_state;
  b.style.gridTemplateColumns='1fr';
  var h='<div style="text-align:center;margin-bottom:10px;">';
  h+='<div style="display:flex;gap:6px;justify-content:center;margin-bottom:14px;min-height:54px;">';
  for(var i=0;i<s.correct.length;i++){
    var picked=s.picked[i];
    h+='<div style="width:48px;height:54px;border-radius:8px;background:rgba(26,36,22,0.5);border:1.5px solid '+(picked?'rgba(122,179,86,0.4)':'rgba(74,124,53,0.15)')+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;">';
    if(picked){h+='<div style="font-size:1.1rem;">'+picked.icon+'</div><div style="font-size:0.28rem;color:var(--sage);">'+picked.name+'</div>';}
    else{h+='<div style="font-size:0.6rem;color:var(--muted);">'+(i+1)+'</div>';}
    h+='</div>';
  }
  h+='</div>';
  h+='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
  for(var i=0;i<s.remaining.length;i++){
    var r=s.remaining[i];
    if(r.used)h+='<div style="width:60px;height:64px;"></div>';
    else h+='<div onclick="FG_Challenge._tap('+i+')" style="width:60px;height:64px;border-radius:8px;background:rgba(74,124,53,0.12);border:1.5px solid rgba(74,124,53,0.2);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:transform 0.1s;" ontouchstart="this.style.transform=\'scale(0.92)\'" ontouchend="this.style.transform=\'scale(1)\'">'
      +'<div style="font-size:1.3rem;">'+r.stage.icon+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.32rem;color:var(--cream);">'+r.stage.name+'</div>'
      +'</div>';
  }
  h+='</div></div>';
  h+='<div style="text-align:center;font-size:0.42rem;color:var(--muted);margin-top:6px;">Tap stages in growth order</div>';
  b.innerHTML=h;
}
function _tapGrowth(idx){
  if(_solved)return;var s=_state;
  if(s.remaining[idx].used)return;
  var tapped=s.remaining[idx].stage;
  var expectedIdx=s.picked.length;
  if(tapped.name===s.correct[expectedIdx].name){
    s.remaining[idx].used=true;s.picked.push(tapped);
    _renderGrowth();
    if(s.picked.length===s.correct.length)_win();
  } else {
    var els=document.querySelectorAll('#fc-board div[onclick]');
    if(els[idx])els[idx].style.borderColor='#c07070';
    setTimeout(function(){
      s.picked=[];for(var i=0;i<s.remaining.length;i++)s.remaining[i].used=false;_renderGrowth();
    },400);
    try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}
  }
}

// ═══ TYPE 4: COLOR MATCH ═══
var CM_PALETTE=[{n:'Sage',c:'#7ab356'},{n:'Gold',c:'#C8A84B'},{n:'Cream',c:'#F0EBD8'},{n:'Moss',c:'#1a2416'},{n:'Forest',c:'#2A5C2A'},{n:'Copper',c:'#b87333'},{n:'Dusk',c:'#6a5a8a'},{n:'Ember',c:'#c76a30'}];
function _genColor(difficulty){
  var count=difficulty>=2?6:difficulty>=1?5:4;
  var target=CM_PALETTE[Math.floor(Math.random()*CM_PALETTE.length)];
  var options=[target];
  var pool=CM_PALETTE.filter(function(p){return p.c!==target.c;});
  while(options.length<count&&pool.length>0){var ri=Math.floor(Math.random()*pool.length);options.push(pool.splice(ri,1)[0]);}
  // Shuffle
  for(var i=options.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=options[i];options[i]=options[j];options[j]=t;}
  return{target:target,options:options,answer:options.indexOf(target)};
}
function _renderColor(){
  var b=document.getElementById('fc-board');if(!b)return;var s=_state;
  b.style.gridTemplateColumns='1fr';
  var h='<div style="width:80px;height:80px;border-radius:12px;margin:0 auto 12px;background:'+s.target.c+';border:2px solid rgba(240,235,216,0.1);"></div>';
  h+='<div style="text-align:center;font-size:0.5rem;color:var(--cream);margin-bottom:10px;">Match this color</div>';
  h+='<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">';
  for(var i=0;i<s.options.length;i++){
    h+='<div onclick="FG_Challenge._tap('+i+')" style="width:52px;height:52px;border-radius:8px;background:'+s.options[i].c+';border:2px solid rgba(240,235,216,0.06);cursor:pointer;transition:transform 0.1s;" ontouchstart="this.style.transform=\'scale(0.92)\'" ontouchend="this.style.transform=\'scale(1)\'"></div>';
  }
  h+='</div>';b.innerHTML=h;
}
function _tapColor(idx){if(_solved)return;if(idx===_state.answer)_win();else{try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}}}

// ═══ TYPE 5: MATH SPROUT ═══
function _genMath(difficulty){
  var a,b,c,answer,display;
  if(difficulty>=2){
    // Three-variable: a+b+c=? — constrain so answer is 1-9
    a=1+Math.floor(Math.random()*3);b=1+Math.floor(Math.random()*3);c=1+Math.floor(Math.random()*3);
    answer=a+b+c;display='\ud83c\udf3f='+a+'  \ud83c\udf38='+b+'  \ud83c\udf3b='+c+'\n\ud83c\udf3f + \ud83c\udf38 + \ud83c\udf3b = ?';
  }else if(difficulty>=1){
    // Solve for one variable — answer is always 1-6
    a=1+Math.floor(Math.random()*4);b=1+Math.floor(Math.random()*6);
    var total=a+a+b;answer=b;display='\ud83c\udf3f + \ud83c\udf3f + \ud83c\udf38 = '+total+'\n\ud83c\udf38 = ?';
  }else{
    // Simple addition — constrain so sum is 2-9
    a=1+Math.floor(Math.random()*4);b=1+Math.floor(Math.random()*(9-a));
    if(b<1)b=1;answer=a+b;display='\ud83c\udf3f + \ud83c\udf38 = ?\n\ud83c\udf3f = '+a+'  \ud83c\udf38 = '+b;
  }
  return{answer:answer,display:display};
}
function _renderMath(){
  var b=document.getElementById('fc-board');if(!b)return;var s=_state;
  b.style.gridTemplateColumns='1fr';
  var lines=s.display.split('\n');
  var h='<div style="text-align:center;margin-bottom:12px;">';
  for(var i=0;i<lines.length;i++)h+='<div style="font-size:1rem;color:var(--cream);margin:6px 0;">'+lines[i]+'</div>';
  h+='</div>';
  h+='<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">';
  for(var n=1;n<=9;n++){
    h+='<div onclick="FG_Challenge._tap('+n+')" style="width:44px;height:44px;border-radius:8px;background:rgba(26,36,22,0.4);border:1.5px solid rgba(74,124,53,0.15);cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--cream);">'+n+'</div>';
  }
  h+='</div>';b.innerHTML=h;
}
function _tapMath(n){if(_solved)return;if(n===_state.answer)_win();else{try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}}}

// ═══ TYPE 6: WORD UNSCRAMBLE ═══
var WORD_BANK={easy:['fern','moss','root','bark','leaf','seed','soil','vine','bud','sap','pod','dew','husk','twig','ash','cap','elm','oak','yew','hay'],medium:['bloom','spore','frond','petal','stalk','thorn','grove','trunk','shade','loam'],hard:['lichen','sprout','canopy','meadow','pollen','botany','fungal','stamen']};
function _genWord(difficulty){
  var pool=difficulty>=2?WORD_BANK.hard:difficulty>=1?WORD_BANK.medium:WORD_BANK.easy;
  var word=pool[Math.floor(Math.random()*pool.length)];
  var letters=word.split('');
  // Shuffle
  for(var i=letters.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=letters[i];letters[i]=letters[j];letters[j]=t;}
  // Ensure it's actually scrambled
  if(letters.join('')===word&&letters.length>2){var tmp=letters[0];letters[0]=letters[1];letters[1]=tmp;}
  return{word:word,scrambled:letters,picked:[],remaining:letters.map(function(l,i){return{letter:l,idx:i,used:false};})};
}
function _renderWord(){
  var b=document.getElementById('fc-board');if(!b)return;var s=_state;
  b.style.gridTemplateColumns='1fr';
  var h='<div style="text-align:center;margin-bottom:8px;">';
  // Answer slots
  h+='<div style="display:flex;gap:4px;justify-content:center;margin-bottom:12px;">';
  for(var i=0;i<s.word.length;i++){
    var letter=s.picked[i]||'';
    h+='<div style="width:36px;height:42px;border-radius:6px;background:rgba(26,36,22,0.5);border:1.5px solid '+(letter?'rgba(200,168,75,0.3)':'rgba(74,124,53,0.15)')+';display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--cream);">'+letter.toUpperCase()+'</div>';
  }
  h+='</div>';
  // Scrambled letters
  h+='<div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;">';
  for(var i=0;i<s.remaining.length;i++){
    var r=s.remaining[i];
    if(r.used)h+='<div style="width:38px;height:42px;"></div>';
    else h+='<div onclick="FG_Challenge._tap('+i+')" style="width:38px;height:42px;border-radius:6px;background:rgba(74,124,53,0.12);border:1.5px solid rgba(74,124,53,0.2);cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:1rem;color:var(--sage);">'+r.letter.toUpperCase()+'</div>';
  }
  h+='</div></div>';b.innerHTML=h;
}
function _tapWord(idx){
  if(_solved)return;var s=_state;
  if(s.remaining[idx].used)return;
  s.remaining[idx].used=true;s.picked.push(s.remaining[idx].letter);
  _renderWord();
  if(s.picked.length===s.word.length){
    if(s.picked.join('')===s.word)_win();
    else{
      // Wrong — reset after flash
      setTimeout(function(){
        s.picked=[];for(var i=0;i<s.remaining.length;i++)s.remaining[i].used=false;_renderWord();
      },500);
      try{navigator.vibrate&&navigator.vibrate(50);}catch(e){}
    }
  }
}

// ═══ UNIFIED TAP DISPATCHER ═══
// ═══ TYPE 7: CHESS PUZZLE (mate-in-1 / mate-in-2) ═══
var _chessPuzzles=null,_chBoard=null,_chTurn='',_chSel=null,_chSolution=[],_chSolIdx=0,_chFlip=false;
function _chParseFEN(fen){
  var parts=fen.split(' ');
  var rows=parts[0].split('/');
  var board=[];
  for(var r=0;r<8;r++){
    board[r]=[];
    var col=0;
    for(var ci=0;ci<rows[r].length;ci++){
      var ch=rows[r][ci];
      if(ch>='1'&&ch<='8'){for(var e=0;e<parseInt(ch);e++){board[r][col++]=null;}}
      else{board[r][col++]={type:ch.toUpperCase(),color:ch===ch.toUpperCase()?'w':'b'};}}
  }
  return{board:board,turn:parts[1]||'w'};
}
function _chUCI(m){return{fr:8-parseInt(m[1]),fc:m.charCodeAt(0)-97,tr:8-parseInt(m[3]),tc:m.charCodeAt(2)-97,promo:m[4]||null};}
function _chApply(b,m){
  var p=b[m.fr][m.fc];b[m.tr][m.tc]=m.promo?{type:m.promo.toUpperCase(),color:p.color}:p;b[m.fr][m.fc]=null;
  // Castling
  if(p&&p.type==='K'&&Math.abs(m.fc-m.tc)===2){
    if(m.tc===6){b[m.tr][5]=b[m.tr][7];b[m.tr][7]=null;}
    if(m.tc===2){b[m.tr][3]=b[m.tr][0];b[m.tr][0]=null;}
  }
}
function _chIsLegal(b,fr,fc,tr,tc,turn){
  var p=b[fr][fc];if(!p||p.color!==turn)return false;
  var t=b[tr][tc];if(t&&t.color===turn)return false;
  var dr=tr-fr,dc=tc-fc,adr=Math.abs(dr),adc=Math.abs(dc);
  var ty=p.type;
  if(ty==='P'){
    var dir=p.color==='w'?-1:1;var start=p.color==='w'?6:1;
    if(dc===0&&!t){if(dr===dir)return true;if(fr===start&&dr===2*dir&&!b[fr+dir][fc])return true;}
    if(adc===1&&dr===dir&&t)return true;
    return false;
  }
  if(ty==='N')return(adr===2&&adc===1)||(adr===1&&adc===2);
  if(ty==='K'){
    if(adr<=1&&adc<=1)return true;
    // Castling (simplified — no full check validation)
    if(adr===0&&adc===2&&!t){
      if(dc===2&&b[fr][7]&&b[fr][7].type==='R'&&!b[fr][5]&&!b[fr][6])return true;
      if(dc===-2&&b[fr][0]&&b[fr][0].type==='R'&&!b[fr][1]&&!b[fr][2]&&!b[fr][3])return true;
    }
    return false;
  }
  // Sliding pieces
  var dirs=[];
  if(ty==='R'||ty==='Q')dirs.push([0,1],[0,-1],[1,0],[-1,0]);
  if(ty==='B'||ty==='Q')dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
  for(var di=0;di<dirs.length;di++){
    var dd=dirs[di];
    for(var s=1;s<8;s++){
      var nr=fr+dd[0]*s,nc=fc+dd[1]*s;
      if(nr<0||nr>7||nc<0||nc>7)break;
      if(nr===tr&&nc===tc)return true;
      if(b[nr][nc])break;
    }
  }
  return false;
}
function _chPieceHTML(p){
  if(!p)return'';
  var art='assets/games/chess/';
  var col=p.color==='w'?'green':'gold';
  var map={K:'king',Q:'queen',R:'rook',B:'bishop',N:'knight',P:'pawn'};
  return'<img src="'+art+'p-'+map[p.type]+'-'+col+'.png" style="width:85%;height:85%;object-fit:contain;pointer-events:none;">';
}
function _renderChess(){
  var b=document.getElementById('fc-board');if(!b)return;
  b.style.gridTemplateColumns='repeat(8,1fr)';
  b.style.gap='0';
  b.style.maxWidth='320px';
  b.style.margin='0 auto';
  var h='';
  for(var r=0;r<8;r++){
    var dr=_chFlip?7-r:r;
    for(var c=0;c<8;c++){
      var dc=_chFlip?7-c:c;
      var light=(dr+dc)%2===0;
      var bg=light?'rgba(42,48,37,.5)':'rgba(74,124,53,.25)';
      var sel=_chSel&&_chSel[0]===dr&&_chSel[1]===dc;
      if(sel)bg='rgba(200,168,75,.5)';
      var pc=_chBoard[dr][dc];
      h+='<div onclick="FG_Challenge._tap('+(dr*8+dc)+')" style="aspect-ratio:1;background:'+bg+';display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;border:1px solid rgba(0,0,0,0.15);">';
      if(pc)h+=_chPieceHTML(pc);
      // Legal move indicator
      if(_chSel&&_chIsLegal(_chBoard,_chSel[0],_chSel[1],dr,dc,_chTurn)){
        h+='<div style="position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(122,179,86,.45);pointer-events:none;"></div>';
      }
      h+='</div>';
    }
  }
  b.innerHTML=h;
}
function _setupChess(diff){
  // Load puzzles (lazy fetch)
  if(!_chessPuzzles){
    try{
      var xhr=new XMLHttpRequest();
      xhr.open('GET','assets/games/chess-puzzles.json',false);// sync for simplicity
      xhr.send();
      if(xhr.status===200)_chessPuzzles=JSON.parse(xhr.responseText);
    }catch(e){}
  }
  if(!_chessPuzzles){_lose();return;}
  // Pick puzzle: diff 0 = mate-in-1, diff 1-2 = mate-in-2
  var pool=diff>=1?_chessPuzzles.m2:_chessPuzzles.m1;
  var pz=pool[Math.floor(Math.random()*pool.length)];
  // Parse FEN and apply opponent's last move (first move in solution)
  var moves=pz.m.split(' ');
  var parsed=_chParseFEN(pz.f);
  _chBoard=parsed.board;
  _chTurn=parsed.turn;
  // Apply opponent's last move to get puzzle position
  var opp=_chUCI(moves[0]);
  _chApply(_chBoard,opp);
  _chTurn=_chTurn==='w'?'b':'w';
  // Solution is the remaining moves (player's moves)
  _chSolution=[];
  for(var i=1;i<moves.length;i++)_chSolution.push(_chUCI(moves[i]));
  _chSolIdx=0;
  _chSel=null;
  _chFlip=_chTurn==='b';// flip board if playing as black
  _renderChess();
}
function _tapChess(v){
  var r=Math.floor(v/8),c=v%8;
  var pc=_chBoard[r][c];
  // If no piece selected, select player's piece
  if(!_chSel){
    if(pc&&pc.color===_chTurn){_chSel=[r,c];_renderChess();}
    return;
  }
  // If tapping own piece, reselect
  if(pc&&pc.color===_chTurn){_chSel=[r,c];_renderChess();return;}
  // Check if this move matches the solution
  var expected=_chSolution[_chSolIdx];
  if(!expected){return;}
  if(_chSel[0]===expected.fr&&_chSel[1]===expected.fc&&r===expected.tr&&c===expected.tc){
    // Correct move
    _chApply(_chBoard,expected);
    _chSolIdx++;
    _chSel=null;
    try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}
    // Check if puzzle complete
    if(_chSolIdx>=_chSolution.length){
      _renderChess();_win();return;
    }
    // Apply opponent's response (next move in solution)
    var opp=_chSolution[_chSolIdx];
    _chApply(_chBoard,opp);
    _chTurn=_chTurn==='w'?'b':'w';
    _chSolIdx++;
    _chTurn=_chTurn==='w'?'b':'w';
    // Check if more player moves needed
    if(_chSolIdx>=_chSolution.length){
      _renderChess();_win();return;
    }
    _renderChess();
  } else {
    // Wrong move — flash red, deselect
    _chSel=null;
    _renderChess();
    var bd=document.getElementById('fc-board');
    if(bd){bd.style.boxShadow='inset 0 0 30px rgba(180,60,60,0.4)';setTimeout(function(){bd.style.boxShadow='none';},400);}
    try{navigator.vibrate&&navigator.vibrate(100);}catch(e){}
  }
}

// ═══ SLIDING PUZZLE ═══
var _slTiles=[];
var _slSize=3;
var _slEmpty=0;
var _slMoveCount=0;

function _isSolvable(tiles, size) {
  var inv=0;
  for(var i=0;i<tiles.length;i++){
    if(tiles[i]===0)continue;
    for(var j=i+1;j<tiles.length;j++){
      if(tiles[j]===0)continue;
      if(tiles[i]>tiles[j])inv++;
    }
  }
  if(size%2===1){
    // Odd grid: solvable if inversions even
    return inv%2===0;
  } else {
    // Even grid: solvable if (inversions + row of blank from bottom) is odd
    var blankRow=Math.floor(tiles.indexOf(0)/size);
    var fromBottom=size-blankRow;
    return (inv+fromBottom)%2===1;
  }
}

function _genSliding(size){
  var n=size*size;
  var tiles=[];
  for(var i=1;i<n;i++)tiles.push(i);
  tiles.push(0);
  // Shuffle until solvable
  var attempts=0;
  do {
    for(var i=tiles.length-1;i>0;i--){
      var j=Math.floor(Math.random()*(i+1));
      var tmp=tiles[i];tiles[i]=tiles[j];tiles[j]=tmp;
    }
    attempts++;
    if(attempts>500)break;
  } while(!_isSolvable(tiles,size)||_isSlSolved(tiles));
  return tiles;
}

function _isSlSolved(tiles){
  for(var i=0;i<tiles.length-1;i++){
    if(tiles[i]!==i+1)return false;
  }
  return tiles[tiles.length-1]===0;
}

function _setupSliding(diff){
  _slSize=diff===0?3:4;
  _slTiles=_genSliding(_slSize);
  _slEmpty=_slTiles.indexOf(0);
  _slMoveCount=0;
  _renderSliding();
}

function _renderSliding(){
  var b=document.getElementById('fc-board');
  if(!b)return;
  var n=_slSize;
  var gap=4;
  b.style.cssText='display:grid;grid-template-columns:repeat('+n+',1fr);grid-template-rows:repeat('+n+',1fr);gap:'+gap+'px;max-width:280px;margin:0 auto;aspect-ratio:1;';
  var h='';
  for(var i=0;i<_slTiles.length;i++){
    var v=_slTiles[i];
    if(v===0){
      h+='<div data-idx="'+i+'" style="aspect-ratio:1;background:transparent;border-radius:6px;"></div>';
    } else {
      var fs=n===3?'1.5rem':'1.1rem';
      h+='<div data-idx="'+i+'" onclick="FG_Challenge._tap('+i+')" style="aspect-ratio:1;background:rgba(26,36,22,0.7);border:1px solid rgba(122,179,86,0.25);border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:Bebas Neue,sans-serif;font-size:'+fs+';color:var(--cream);cursor:pointer;min-height:48px;min-width:48px;transition:transform 0.18s ease;">';
      h+=v;
      h+='</div>';
    }
  }
  b.innerHTML=h;
}

function _tapSliding(idx){
  if(_solved)return;
  var v=_slTiles[idx];
  if(v===0)return;
  var n=_slSize;
  var row=Math.floor(idx/n),col=idx%n;
  var eRow=Math.floor(_slEmpty/n),eCol=_slEmpty%n;
  // Check adjacency (Manhattan distance = 1)
  var dist=Math.abs(row-eRow)+Math.abs(col-eCol);
  if(dist!==1)return;

  // Animate the slide
  var tileEl=document.querySelector('[data-idx="'+idx+'"]');
  if(tileEl){
    var dx=(eCol-col)*((tileEl.offsetWidth||60)+4);
    var dy=(eRow-row)*((tileEl.offsetHeight||60)+4);
    tileEl.style.transform='translate('+dx+'px,'+dy+'px)';
  }

  // Swap after animation
  var oldEmpty=_slEmpty;
  setTimeout(function(){
    _slTiles[oldEmpty]=v;
    _slTiles[idx]=0;
    _slEmpty=idx;
    _slMoveCount++;
    try{navigator.vibrate&&navigator.vibrate(10);}catch(e){}
    _renderSliding();
    if(_isSlSolved(_slTiles)){
      _win();
    }
  },160);
}

function _tap(v){
  if(_type==='set')_tapSet(v);
  else if(_type==='memory')_tapMemory(v);
  else if(_type==='spot')_tapGrowth(v);
  else if(_type==='color')_tapColor(v);
  else if(_type==='math')_tapMath(v);
  else if(_type==='word')_tapWord(v);
  else if(_type==='chess')_tapChess(v);
  else if(_type==='sliding')_tapSliding(v);
}

// ═══ START — picks random type ═══
function _setupChallenge(diff, grade) {
  var sub=document.getElementById('fc-subtitle');
  var title=document.getElementById('fc-title');
  var board=document.getElementById('fc-board');

  // Type-specific setup
  if(_type==='set'){
    _state={cards:_genSetBoard(),sel:[]};
    if(title)title.textContent='QUICK TRIOS';
    if(sub)sub.textContent=(grade||'Common')+' — Pick 3 cards where shape, color & count are each ALL SAME or ALL DIFFERENT';
    _renderSet();
  }else if(_type==='memory'){
    var seq=_genMemory(diff);
    var order=[];for(var i=0;i<seq.length;i++)order.push(i);
    _state={seq:seq,order:order,revealed:{},inputIdx:0,phase:'show'};
    if(title)title.textContent='PATTERN MEMORY';
    if(sub)sub.textContent=(grade||'Common')+' — Watch the numbered dots, then tap them back in the same order';
    _renderMemory();
    setTimeout(function(){if(!_solved){_state.phase='input';_renderMemory();}},2500);
  }else if(_type==='spot'){
    _state=_genGrowth(diff);
    if(title)title.textContent='GROWTH SEQUENCE';
    if(sub)sub.textContent=(grade||'Common')+' — Tap the growth stages from smallest to largest';
    _renderGrowth();
  }else if(_type==='color'){
    _state=_genColor(diff);
    if(title)title.textContent='COLOR MATCH';
    if(sub)sub.textContent=(grade||'Common')+' — Tap the swatch that matches the target color above';
    _renderColor();
  }else if(_type==='math'){
    _state=_genMath(diff);
    if(title)title.textContent='MATH SPROUT';
    if(sub)sub.textContent=(grade||'Common')+' — Tap the correct answer to the equation';
    _renderMath();
  }else if(_type==='word'){
    _state=_genWord(diff);
    if(title)title.textContent='WORD UNSCRAMBLE';
    if(sub)sub.textContent=(grade||'Common')+' — Drag or tap the scrambled letters to spell the word';
    _renderWord();
  }else if(_type==='chess'){
    var isM2=diff>=1;
    if(title)title.textContent=isM2?'CHECKMATE IN 2':'CHECKMATE IN 1';
    if(sub)sub.textContent=(grade||'Common')+' — Find the '+(isM2?'mate in 2 moves':'checkmate');
    _setupChess(diff);
    // Chess gets a timer — 90s for mate-in-1, 120s for mate-in-2
    _timeMax=isM2?120000:90000;_timeLeft=_timeMax;
    var fill=document.getElementById('fc-timer-fill');
    if(fill){fill.parentNode.style.display='block';fill.style.width='100%';fill.classList.remove('urgent');}
    var text=document.getElementById('fc-timer-text');
    if(text){text.style.display='block';text.textContent=Math.ceil(_timeLeft/1000)+'s';}
    var modal=document.getElementById('fc-modal');
    if(modal)modal.classList.add('open');
    _startTimer();
    return;
  }else if(_type==='sliding'){
    var is4=diff>=1;
    if(title)title.textContent='SLIDE PUZZLE';
    if(sub)sub.textContent=(grade||'Common')+' — Arrange tiles in order';
    _setupSliding(diff);
    _timeMax=is4?90000:60000;_timeLeft=_timeMax;
    var fill=document.getElementById('fc-timer-fill');
    if(fill){fill.parentNode.style.display='block';fill.style.width='100%';fill.classList.remove('urgent');}
    var text=document.getElementById('fc-timer-text');
    if(text){text.style.display='block';text.textContent=Math.ceil(_timeLeft/1000)+'s';}
    var modal=document.getElementById('fc-modal');
    if(modal)modal.classList.add('open');
    _startTimer();
    return;
  }

  // Hide timer — no time pressure, just solve it
  var fill=document.getElementById('fc-timer-fill');
  if(fill)fill.parentNode.style.display='none';
  var text=document.getElementById('fc-timer-text');
  if(text)text.style.display='none';

  // Show modal
  var modal=document.getElementById('fc-modal');
  if(modal)modal.classList.add('open');
  // No timer started — player takes as long as they need
}

function start(grade, callback) {
  _callback=callback;_solved=false;clearInterval(_timer);

  var times={Common:45000,Uncommon:42000,Rare:38000,Epic:35000,Legendary:32000,Mythic:28000,Cosmic:25000};
  _timeMax=times[grade]||38000;_timeLeft=_timeMax;

  var diff=0;
  if(grade==='Rare'||grade==='Epic')diff=1;
  if(grade==='Legendary'||grade==='Mythic'||grade==='Cosmic')diff=2;

  // Pick random challenge type
  var types=['set','chess'];
  _type=types[Math.floor(Math.random()*types.length)];

  _setupChallenge(diff, grade);
}

function startSpecific(type, grade, callback) {
  _callback=callback;_solved=false;clearInterval(_timer);
  var times={Common:45000,Uncommon:42000,Rare:38000,Epic:35000,Legendary:32000,Mythic:28000,Cosmic:25000};
  _timeMax=times[grade]||38000;_timeLeft=_timeMax;
  var diff=0;
  if(grade==='Rare'||grade==='Epic')diff=1;
  if(grade==='Legendary'||grade==='Mythic'||grade==='Cosmic')diff=2;
  var validTypes=['set','chess'];
  _type=(validTypes.indexOf(type)>=0)?type:'set';
  _setupChallenge(diff, grade);
}

return{start:start,startSpecific:startSpecific,_tap:_tap,_close:_close};
})();

// Achievement bar updater (was in demo's sim section)
function uab(){
  var b=document.getElementById('ab');if(!b)return;
  if(!window.BP)return;
  var s=BP.getState?BP.getState():{ph:0,pollen:0};
  if(s.ph<1){b.style.display='block';var p=document.getElementById('abp');var f=document.getElementById('abf');if(p)p.textContent=s.ph+'/1';if(f)f.style.width=Math.min(100,s.ph*100)+'%';}
  else if(s.pollen<100){b.style.display='block';var t=b.querySelector('.abt');if(t)t.innerHTML='<span class="abv">'+s.pollen+'/100</span> pollen — slot 3 at 100';var f2=document.getElementById('abf');if(f2)f2.style.width=Math.min(100,s.pollen)+'%';}
  else{b.style.display='none';}
}
(function(){
'use strict';
var I={packC:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><path d="M13 17C13 13 16 10 20 10H28C32 10 35 13 35 17V35C35 38.3 32.3 41 29 41H19C15.7 41 13 38.3 13 35V17Z" fill="#2a4a20"/><path d="M14.5 17C14.5 14 16.8 12 19.5 12H28.5C31.2 12 33.5 14 33.5 17V21.5C33.5 22.3 32.8 23 32 23H16C15.2 23 14.5 22.3 14.5 21.5V17Z" fill="#3d6e2c"/><path d="M19 11C19.5 8.8 21.4 7.5 24 7.5C26.6 7.5 28.5 8.8 29 11" fill="none" stroke="#1e3418" stroke-width="2.2" stroke-linecap="round"/><path d="M16 18.5C12.5 17 10 13.8 9 9.5" fill="none" stroke="#4a8a35" stroke-width="1.8" stroke-linecap="round"/><path d="M32 18.5C35.5 17 38 13.8 39 9.5" fill="none" stroke="#4a8a35" stroke-width="1.8" stroke-linecap="round"/><path d="M35 25C37.2 25.2 39 26.8 39 29V34C39 35.8 37.5 37.2 35.8 37.2H34.5C34 37.2 33.5 36.7 33.5 36.2V26C33.5 25.3 34.3 24.9 35 25Z" fill="#2a4a20"/><path d="M34 26.2H35.8C37 26.2 38 27.2 38 28.4V29.8C38 30.3 37.6 30.7 37.1 30.7H34Z" fill="#3d6e2c"/><path d="M21.5 16.5C22.2 15 24 14.5 25.5 15.5C27 16.5 27.2 18.5 26 19.8C25 20.8 23 21 22.5 19.5C22 18 22.8 17 21.5 16.5Z" fill="#7ab356"/><path d="M24 16C24.5 17.5 24.2 19 23.5 20.2" fill="none" stroke="#4a7c35" stroke-width="0.8" stroke-linecap="round"/><path d="M17 23.5C18 24.8 19.5 25.5 21.5 25.8C23 26 25 26 26.5 25.8C28.5 25.5 30 24.8 31 23.5" fill="none" stroke="#1e3418" stroke-width="0.8" stroke-linecap="round" opacity="0.5"/><path d="M18 31C20 30.3 22 30 24 30C26 30 28 30.3 30 31" fill="none" stroke="#1e3418" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/></svg>',
packO:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><path d="M14 19C14 15 17 12 21 12H27C31 12 34 15 34 19V35C34 38 31.5 40.5 28.5 40.5H19.5C16.5 40.5 14 38 14 35V19Z" fill="#2a4a20"/><path d="M15 17C15.5 14.5 17.5 13 20 13H28C30.5 13 32.5 14.5 33 17L33.5 14C33.5 12 31.5 10.5 29 10.5H19C16.5 10.5 14.5 12 14.5 14Z" fill="#3d6e2c"/><path d="M19.5 12C19.5 9.5 21.5 8 24 8C26.5 8 28.5 9.5 28.5 12" fill="none" stroke="#1e3418" stroke-width="2" stroke-linecap="round"/><path d="M16 18C12.5 16.5 10 13 9 8.5" fill="none" stroke="#4a8a35" stroke-width="1.8" stroke-linecap="round"/><path d="M32 18C35.5 16.5 38 13 39 8.5" fill="none" stroke="#4a8a35" stroke-width="1.8" stroke-linecap="round"/><path d="M16 17C16.5 15 18.5 14 21 14H27C29.5 14 31.5 15 32 17V20C32 20.5 31.5 21 31 21H17C16.5 21 16 20.5 16 20V17Z" fill="#0d1a0a"/><path d="M20 18C20.5 15.5 22 14.5 23 15.5" fill="none" stroke="#7ab356" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/><path d="M27 17.5C26.5 15 25 14 24.5 15" fill="none" stroke="#8fc25e" stroke-width="1" stroke-linecap="round" opacity="0.5"/><path d="M18 31C20 30.3 22 30 24 30C26 30 28 30.3 30 31" fill="none" stroke="#1e3418" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/><path d="M34 25.5C36 25.7 37.5 27 37.5 29V33.5C37.5 35 36.2 36 34.8 36H34C33.5 36 33 35.5 33 35V26.5C33 25.8 33.5 25.4 34 25.5Z" fill="#2a4a20"/><path d="M33.5 26.5H35C36 26.5 37 27.3 37 28.4V29.5C37 30 36.6 30.3 36.2 30.3H33.5Z" fill="#3d6e2c"/></svg>',
ter:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" width="56" height="56" class="tb"><path d="M12 38.5C12 28.7 14.4 20.8 19.2 14.8C21.6 11.8 24.6 9.4 28 7.6C31.4 9.4 34.4 11.8 36.8 14.8C41.6 20.8 44 28.7 44 38.5V39H12Z" fill="#f0ebd8" opacity="0.16"/><path d="M28 7.6C31.4 9.4 34.4 11.8 36.8 14.8C41.6 20.8 44 28.7 44 38.5" fill="none" stroke="#f0ebd8" stroke-width="1" stroke-linecap="round" opacity="0.22"/><path d="M18.2 14.6C14.7 19.5 13 26.1 13 34.8" fill="none" stroke="#f0ebd8" stroke-width="1" stroke-linecap="round" opacity="0.3"/><circle cx="28" cy="5.8" r="2" fill="#C8A84B"/><path d="M9.5 39.2C9.5 38.2 10.3 37.4 11.3 37.4H44.7C45.7 37.4 46.5 38.2 46.5 39.2V48.8C46.5 49.8 45.7 50.6 44.7 50.6H11.3C10.3 50.6 9.5 49.8 9.5 48.8Z" fill="#1a1f17"/></svg>',
seed:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="26" height="26"><path d="M18 31.6C14.2 28.9 11.1 24.3 10.6 19.2C10 13.3 13.1 9.6 18 9.6C22.9 9.6 26 13.3 25.4 19.2C24.9 24.3 21.8 28.9 18 31.6Z" fill="#C8A84B"/><path d="M12 12.6C12.6 9.9 15 8.1 18 8.1C21 8.1 23.4 9.9 24 12.6C22.3 13.6 20.2 14.1 18 14.1C15.8 14.1 13.7 13.6 12 12.6Z" fill="#2a3622"/><rect x="17" y="6.2" width="2" height="2.7" rx="1" fill="#2a3622"/></svg>',
marker:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32"><path d="M20 3.5C13.1 3.5 7.8 8.8 7.8 15.4C7.8 24.4 15.7 30.5 18.8 35.3C19.1 35.8 19.5 36 20 36C20.5 36 20.9 35.8 21.2 35.3C24.3 30.5 32.2 24.4 32.2 15.4C32.2 8.8 26.9 3.5 20 3.5Z" fill="#2a3622" stroke="#4a7c35" stroke-width="1"/><path d="M14 16.8V11.8M20 16.8V11.8M26 16.8V11.8M12.5 15H27.5" fill="none" stroke="#7ab356" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28.5" cy="27.5" r="6" fill="#C8A84B"/></svg>'};
var MP=['<svg viewBox="0 0 30 30" width="30" height="30"><ellipse cx="15" cy="20" rx="7" ry="4.5" fill="#4a7c35"/><ellipse cx="11" cy="17" rx="4.5" ry="6" transform="rotate(-25 11 17)" fill="#7ab356"/><ellipse cx="19" cy="17" rx="4.5" ry="6" transform="rotate(25 19 17)" fill="#7ab356"/><ellipse cx="15" cy="14.5" rx="3.5" ry="5.5" fill="#5a9444"/><ellipse cx="15" cy="15.5" rx="2" ry="3" fill="#4a7c35"/></svg>','<svg viewBox="0 0 30 30" width="30" height="30"><path d="M15 26 L15 8" stroke="#4a7c35" stroke-width="1.2" stroke-linecap="round"/><path d="M15 22 Q10 20 8 17 M15 19 Q10 17 9 14 M15 16 Q11 15 10 12" stroke="#7ab356" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M15 22 Q20 20 22 17 M15 19 Q20 17 21 14 M15 16 Q19 15 20 12" stroke="#7ab356" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>','<svg viewBox="0 0 30 30" width="30" height="30"><path d="M14 26 Q13 18 16 12" stroke="#4a7c35" stroke-width="1.3" stroke-linecap="round" fill="none"/><path d="M13 20 Q10 18 8 20 M17 16 Q20 14 21 16" stroke="#5a9444" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="16.5" cy="10" r="3.5" fill="#C8A84B" opacity="0.85"/><circle cx="16.5" cy="10" r="1.5" fill="#4a7c35"/></svg>','<svg viewBox="0 0 30 30" width="30" height="30"><rect x="11" y="12" width="8" height="14" rx="4" fill="#4a7c35"/><rect x="5" y="15" width="5" height="8" rx="2.5" fill="#4a7c35"/><rect x="20" y="13" width="5" height="6" rx="2.5" fill="#4a7c35"/><circle cx="15" cy="10.5" r="1.8" fill="#C8A84B" opacity="0.7"/></svg>','<svg viewBox="0 0 30 30" width="30" height="30"><path d="M8 10 Q12 12 14 16 Q16 20 22 22 Q25 23 27 26" stroke="#4a7c35" stroke-width="1" stroke-linecap="round" fill="none"/><circle cx="9" cy="10" r="2.5" fill="#7ab356"/><circle cx="13" cy="14.5" r="2.8" fill="#7ab356"/><circle cx="18" cy="19" r="2.5" fill="#5a9444"/><circle cx="23" cy="23" r="2.2" fill="#7ab356"/></svg>'];
var UI={pol:'<svg viewBox="0 0 16 16" width="14" height="14"><circle cx="8" cy="8" r="4" fill="#C8A84B"/><circle cx="8" cy="3.2" r="1.3" fill="#C8A84B"/><circle cx="12.2" cy="6" r="1.3" fill="#C8A84B"/><circle cx="11" cy="11.5" r="1.3" fill="#C8A84B"/><circle cx="5" cy="11.5" r="1.3" fill="#C8A84B"/><circle cx="3.8" cy="6" r="1.3" fill="#C8A84B"/></svg>',hx:'<svg viewBox="0 0 16 16" width="14" height="14"><polygon points="8,1.5 13.6,4.75 13.6,11.25 8,14.5 2.4,11.25 2.4,4.75" fill="none" stroke="#7ab356" stroke-width="1" stroke-linejoin="round"/><path d="M8 7 Q7 5.5 8 4.5 Q9 5.5 8 7Z" fill="#4a7c35"/><path d="M8 7 L8 10" stroke="#4a7c35" stroke-width="0.8" stroke-linecap="round"/></svg>',spr:'<svg viewBox="0 0 28 28" width="24" height="24"><path d="M14 24 L14 15" stroke="#7ab356" stroke-width="1.5" stroke-linecap="round"/><path d="M14 15 Q10 12 8 8 Q12 10 14 13 Q16 10 20 8 Q18 12 14 15Z" fill="#7ab356"/><path d="M10 24 Q14 22 18 24" fill="#2a3622"/></svg>',lk:'<svg viewBox="0 0 20 20" width="16" height="16"><rect x="5" y="9" width="10" height="8" rx="2" fill="#2a3622"/><path d="M7.5 9 L7.5 7 Q7.5 3.5 10 3.5 Q12.5 3.5 12.5 7 L12.5 9" stroke="#4a7c35" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="10" cy="13" r="1.2" fill="#0d100c"/></svg>',star:'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3 L14 9 L20.5 9 L15.2 13 L17.2 19.5 L12 15.5 L6.8 19.5 L8.8 13 L3.5 9 L10 9Z" fill="#C8A84B"/></svg>',kp:'<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="#4a7c35" stroke-width="1.2"/><circle cx="10" cy="10" r="7.5" fill="#1a1f17"/><path d="M10 14 L10 8" stroke="#4a7c35" stroke-width="1" stroke-linecap="round"/><path d="M10 8 Q8 6 7 4 Q9 5.5 10 7 Q11 5.5 13 4 Q12 6 10 8Z" fill="#7ab356"/></svg>'};
var GC={Common:'#8a9a7a',Uncommon:'#2ecc40',Rare:'#3498db',Epic:'#9b59b6',Legendary:'#f1c40f',Mythic:'#e74c3c',Cosmic:'#ff6ec7'};
var GS=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Cosmic'];
var PN=['Verdant Wisp','Shadow Crown','Pale Phantom','Dusk Tendril','Bloom Shard','Root Hymn','Spore Veil','Canopy Ghost','Thorn Lace','Ember Fern','Moss Herald','Crystal Stalk','Fog Petal'];
var LORE=['Your attention left a mark. Something is growing.','No one has ever seen this plant before. No one ever will again.','Someone else\'s attention scattered this seed. Now it\'s yours to grow.','The map remembers where you planted it. So will the weather.'];
var LOCS=['Riverside Park','Oak Hill Trail','Cedar Lane','Willow Bridge','Fern Valley'];
var CLIM=['Temperate','Warm','Cool','Humid','Arid'];
function rn(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pk(a){return a[rn(0,a.length-1)];}
function fh(){var h='';for(var i=0;i<64;i++)h+='0123456789abcdef'[rn(0,15)];return h;}
function hap(){try{navigator.vibrate&&navigator.vibrate(12);}catch(e){}}
function toast(m,l){var c=document.getElementById('tc');var t=document.createElement('div');t.className='tm'+(l?' lore':'');t.textContent=m;c.appendChild(t);setTimeout(function(){t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(function(){t.remove();},300);},l?3500:2200);}
function celeb(m,s){var o=document.createElement('div');o.className='uo';o.innerHTML='<div class="ucrd"><div>'+UI.star+'</div><div class="uct">'+m+'</div>'+(s?'<div class="ucs">'+s+'</div>':'')+'</div>';document.body.appendChild(o);conf();setTimeout(function(){o.style.opacity='0';o.style.transition='opacity 0.4s';setTimeout(function(){o.remove();},400);},2800);}
function conf(){var b=document.createElement('div');b.className='cf';var c=['#f1c40f','#2ecc40','#F0EBD8','#3498db','#9b59b6','#ff6ec7'];for(var i=0;i<20;i++){var s=document.createElement('span');var a=Math.random()*Math.PI*2;var d=50+Math.random()*90;s.style.cssText='background:'+c[i%c.length]+';--cx:'+Math.cos(a)*d+'px;--cy:'+Math.sin(a)*d+'px;--cr:'+(Math.random()*720-360)+'deg;animation-delay:'+Math.random()*0.15+'s;';b.appendChild(s);}document.body.appendChild(b);setTimeout(function(){b.remove();},1500);}

var st={plants:[],seeds:[],unlocks:{seed1:true},daily:null,pollen:0,hashes:0,steps:0,drops:3,ph:0,gp:0,fc:0,wd:0,gh:[]};
// Simulated greenhouse plants
for(var gi=0;gi<6;gi++){st.gh.push({hash:fh(),name:pk(PN),grade:pk(GS.slice(0,4)),pi:rn(0,4)});}

/* ═══ BACKPACK ═══ */
var BP=(function(){
var _o=false,_ss=null,_sp=null,_ht=null;
var SL=[{id:1},{id:2,h:'Harvest 1st plant',k:'slot2'},{id:3,h:'100 pollen',k:'slot3'},{id:4,h:'10 games',k:'slot4'},{id:5,h:'Drop 5 in Wild',k:'slot5'},{id:6,h:'Daily slot',k:'slot6',dy:true}];
var SC=[{c:1,k:'seed1'},{c:5,k:'seed5'},{c:10,k:'seed10'},{c:15,k:'seed15'},{c:20,k:'seed20'}];
function xp(){var c=1;for(var i=1;i<SL.length;i++){var s=SL[i];if(st.unlocks[s.k]){if(s.dy){var td=new Date().toISOString().split('T')[0];if(st.daily!==td)c++;}else c++;}}return c;}
function xc(){var c=1;for(var i=SC.length-1;i>=0;i--){if(st.unlocks[SC[i].k]){c=SC[i].c;break;}}return c;}
function init(){var el=document.getElementById('bpi');if(el){var s=el.querySelector('svg');if(s)s.remove();}render();}
function toggle(){if(_o)close();else open();}
function open(){_o=true;hap();var el=document.getElementById('bpi');if(el){el.style.backgroundImage="url('assets/games/wild/backpack-open-v4.png')";}var _bpeEl=document.getElementById('bpe');if(_bpeEl)_bpeEl.classList.add('open');render();}
function close(){_o=false;csi();cpi();var el=document.getElementById('bpi');if(el){el.style.backgroundImage="url('assets/games/wild/backpack-closed-v4.png')";}var _bpeEl2=document.getElementById('bpe');if(_bpeEl2)_bpeEl2.classList.remove('open');}
function csi(){_ss=null;document.getElementById('sdi').classList.remove('show');}
function cpi(){_sp=null;document.getElementById('pic').classList.remove('show');}
function render(){
  var bg=document.getElementById('bpb');var t=st.plants.length+st.seeds.length;bg.textContent=t;bg.classList.toggle('e',t===0);
  var pe=document.getElementById('bpp');var mx=xp();var h='';
  for(var i=0;i<st.plants.length&&i<mx;i++){
    var p=st.plants[i];var g=p.grade;var gc=GC[g]||GC.Common;
    var plantSvg='';if(window._generatePlantSVG&&p.hash){try{plantSvg=window._generatePlantSVG(p.hash,28);}catch(e){}}if(!plantSvg)plantSvg=MP[p.pi%5];
    h+='<div class="ps" onclick="BP.tp('+i+')"><div class="tr" data-g="'+g+'">'+I.ter+'<div class="pm">'+plantSvg+'</div><div class="hd '+(p.hp||'h')+'"></div><div class="gl" style="color:'+gc+';background:rgba(13,16,12,0.8);">'+g.toUpperCase()+'</div></div></div>';
  }
  for(var j=st.plants.length;j<mx;j++){h+='<div class="ps"><div class="tr" data-g="Common" style="opacity:0.2;">'+I.ter+'<div class="pm" style="opacity:0.12;color:var(--muted);font-size:14px;display:flex;align-items:center;justify-content:center;">+</div></div></div>';}
  var sh=0;for(var k=1;k<SL.length&&sh<2;k++){if(SL[k].k&&!st.unlocks[SL[k].k]){h+='<div class="lk">'+UI.lk+'<div class="lh">'+SL[k].h+'</div></div>';sh++;}}
  pe.innerHTML=h;
  var se=document.getElementById('bps');var cp=xc();h='';
  for(var m=0;m<st.seeds.length&&m<cp;m++){h+='<div class="ss'+(st.seeds[m].rare?' rare':'')+'" onclick="BP.ts('+m+')"><div class="sd-icon">'+I.seed+'</div></div>';}
  for(var n=st.seeds.length;n<cp;n++)h+='<div class="se"></div>';
  se.innerHTML=h;
  // dbb badge is owned by FG_Wild._updateUI — do not overwrite here
  uab();
}
function tp(i){if(i>=st.plants.length)return;_sp=i;csi();var p=st.plants[i];var gc=GC[p.grade];hap();
  var infoSvg='';if(window._generatePlantSVG&&p.hash){try{infoSvg=window._generatePlantSVG(p.hash,56);}catch(e){}}if(!infoSvg)infoSvg=MP[p.pi%5];
  document.getElementById('pic-pl').innerHTML=infoSvg;document.getElementById('pic-pl').style.borderColor=gc;
  document.getElementById('pic-nm').textContent=p.name;
  document.getElementById('pic-gr').textContent=p.grade.toUpperCase();document.getElementById('pic-gr').style.color=gc;
  document.getElementById('pic-or').textContent='Origin: '+p.origin;
  document.getElementById('pic').classList.add('show');
}
function ts(i){if(i>=st.seeds.length)return;_ss=i;cpi();var s=st.seeds[i];hap();
  document.getElementById('sdl').textContent=s.loc;document.getElementById('sdc').textContent=s.clim;
  document.getElementById('sdh').textContent=s.hash.substring(0,12)+'...';document.getElementById('sdi').classList.add('show');}
function s2n(){if(_ss===null)return;var seed=st.seeds[_ss];st.seeds.splice(_ss,1);csi();render();hap();
// Fire event so the nursery listener picks it up
if(seed){window.dispatchEvent(new CustomEvent('bp-seed-to-nursery',{detail:seed}));}
toast('Seed sent to Nursery!');}
var _sht=null;
function sns(){if(_ss===null)return;document.getElementById('htcn').style.transition='width 0.3s linear';document.getElementById('htc-nur').classList.add('holding');_sht=setTimeout(function(){s2n();},300);}
function sne(){clearTimeout(_sht);document.getElementById('htc-nur').classList.remove('holding');document.getElementById('htcn').style.transition='none';document.getElementById('htcn').style.width='0';}
// Hold-to-confirm release
function hts(){if(_sp===null)return;document.getElementById('htcf').style.transition='width 0.3s linear';document.getElementById('htc-rel').classList.add('holding');_ht=setTimeout(function(){if(_sp!==null&&_sp<st.plants.length){var p=st.plants.splice(_sp,1)[0];cpi();render();hap();st.wd++;cu();
// WIRE: Actually place on the map
if(window.FG_Wild&&window.FG_Wild._dropFromBP){
  FG_Wild._dropFromBP(p);
} else {
  toast(p.name+' released — open the map to see it!');
}}},300);}
function hte(){clearTimeout(_ht);document.getElementById('htc-rel').classList.remove('holding');document.getElementById('htcf').style.transition='none';document.getElementById('htcf').style.width='0';}
function ap(o){if(st.plants.length>=xp()){toast('Backpack full!');return false;}st.plants.push(o);st.ph++;render();_rtbRender();hap();cu();return true;}
function as(o){if(st.seeds.length>=xc()){toast('Seed pouch full!');return false;}st.seeds.push(o);st.fc++;render();_rtbRender();hap();cu();return true;}
function ul(k,m,s){if(st.unlocks[k])return;st.unlocks[k]=true;render();celeb(m,s);}
function cu(){if(!st.unlocks.slot2&&st.ph>=1)ul('slot2','Second plant slot unlocked!','Harvest plants to fill it.');if(!st.unlocks.slot3&&st.pollen>=100)ul('slot3','Third slot unlocked!','100 pollen reached.');if(!st.unlocks.slot4&&st.gp>=10)ul('slot4','Bonus slot earned!','10 games played.');if(!st.unlocks.slot5&&st.wd>=5)ul('slot5','Fifth slot unlocked!','5 plants in the Wild.');if(!st.unlocks.seed5&&st.fc>=1)ul('seed5','Seed pouch expands to 5!','Find ferals as you walk.');if(!st.unlocks.seed10&&st.fc>=5)ul('seed10','Pouch holds 10!','Your eye sharpens.');}
// ═══ RETURN TO BASE — unload backpack to greenhouse ═══
// RTB: 2 free returns/day (base), +2 if extra backpack slots purchased = 4 max
var RTB_BASE_PER_DAY=2;
var RTB_PAID_BONUS=2;
var RTB_KEY='fg_rtb_today';

function _rtbGetToday(){return new Date().toISOString().slice(0,10);}
function _rtbLoadState(){
  try{var raw=JSON.parse(localStorage.getItem(RTB_KEY)||'{}');
    if(raw.day===_rtbGetToday())return raw;
  }catch(e){}
  return{day:_rtbGetToday(),count:0};
}
function _rtbSaveState(s){try{localStorage.setItem(RTB_KEY,JSON.stringify(s));}catch(e){}}
function _rtbMaxReturns(){
  var base=RTB_BASE_PER_DAY;
  // Check if player bought extra backpack slots (unlocks = purchased slot count)
  var unlocks=0;try{unlocks=st.unlocks||0;}catch(e){}
  return base+(unlocks>0?RTB_PAID_BONUS:0);
}
function _rtbCanReturn(){return _rtbLoadState().count<_rtbMaxReturns();}
function _rtbReturnsLeft(){return Math.max(0,_rtbMaxReturns()-_rtbLoadState().count);}

function returnToBase(){
  if(!_rtbCanReturn()){
    var max=_rtbMaxReturns();
    toast('No returns left today ('+max+'/'+max+' used). Resets at midnight.');
    return;
  }
  var plants=st.plants.slice();
  var seeds=st.seeds.slice();
  if(plants.length===0&&seeds.length===0){toast('Backpack is empty!');return;}

  // Deliver plants to greenhouse
  var ghRaw=localStorage.getItem('sws_greenhouse')||'[]';
  var gh=[];try{gh=JSON.parse(ghRaw);}catch(e){}
  var delivered=0;
  for(var i=0;i<plants.length;i++){
    var p=plants[i];
    if(gh.some(function(g){return g.hash===p.hash;}))continue;
    gh.push({hash:p.hash,date:new Date().toISOString(),born:Date.now(),origin:p.origin||'wild',rare:false,traits:null,breedCount:0,generation:1});
    delivered++;
  }
  localStorage.setItem('sws_greenhouse',JSON.stringify(gh));
  st.plants=[];

  // Deliver seeds to nursery
  var seedCount=0;
  for(var j=0;j<seeds.length;j++){
    window.dispatchEvent(new CustomEvent('bp-seed-to-nursery',{detail:seeds[j]}));
    seedCount++;
  }
  st.seeds=[];

  // Record return time
  var rtbState=_rtbLoadState();rtbState.count++;_rtbSaveState(rtbState);

  // Also write to server-side dailyStats
  try{
    var u=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(u&&window.db){
      window.db.collection('vaults').doc(u.uid).collection('meta').doc('dailyStats').set({
        lastReturnToBase:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }
  }catch(e){}

  render();_rtbRender();hap();
  if(window.renderGreenhouse)renderGreenhouse();
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
  if(typeof gtag!=='undefined')gtag('event','return_to_base',{plants:delivered,seeds:seedCount});

  // Trigger reveal sequence for delivered plants
  if(delivered>0&&window._startReveal){
    window._startReveal(plants,seedCount);
  } else {
    var msg='Returned to base!';
    if(seedCount>0)msg+=' '+seedCount+' seed'+(seedCount>1?'s':'')+' → nursery.';
    celeb('\ud83c\udfe0 '+msg,'Next return in 6 hours.');
  }
}

function _rtbRender(){
  var btn=document.getElementById('bp-rtb');if(!btn)return;
  // Only show on Wild tab
  var wp=document.getElementById('panel-wild');
  if(!wp||!wp.classList.contains('active')){btn.style.display='none';return}
  btn.style.display='block';
  var left=_rtbReturnsLeft();
  if(left>0){
    btn.classList.remove('on-cooldown');
    var total=st.plants.length+st.seeds.length;
    btn.innerHTML='\ud83c\udfe0 RETURN'+(total>0?' ('+total+')':'')+' <span class="rtb-timer">'+left+'/'+_rtbMaxReturns()+'</span>';
  } else {
    btn.classList.add('on-cooldown');
    btn.innerHTML='\ud83c\udfe0 <span class="rtb-timer">0 returns left</span>';
  }
}

// Update timer display every minute
var _rtbTimer=null;
function _rtbStartTimer(){
  if(_rtbTimer)return;
  _rtbTimer=setInterval(function(){_rtbRender();},60000);
}

// ═══ MIDNIGHT AUTO-DELIVER ═══
// At midnight, any plants/seeds left in backpack auto-deliver to greenhouse/nursery
var MIDNIGHT_KEY='fg_bp_midnight';
function checkMidnightDeliver(){
  var today=new Date().toISOString().split('T')[0];
  var lastCheck=localStorage.getItem(MIDNIGHT_KEY)||'';
  if(lastCheck===today)return; // already checked today
  localStorage.setItem(MIDNIGHT_KEY,today);
  if(st.plants.length===0&&st.seeds.length===0)return;
  // Auto-deliver everything
  var ghRaw=localStorage.getItem('sws_greenhouse')||'[]';
  var gh=[];try{gh=JSON.parse(ghRaw);}catch(e){}
  var delivered=0;
  for(var i=0;i<st.plants.length;i++){
    var p=st.plants[i];
    if(gh.some(function(g){return g.hash===p.hash;}))continue;
    gh.push({hash:p.hash,date:new Date().toISOString(),born:Date.now(),origin:p.origin||'wild',rare:false,traits:null,breedCount:0,generation:1});
    delivered++;
  }
  localStorage.setItem('sws_greenhouse',JSON.stringify(gh));
  var seedCount=st.seeds.length;
  for(var j=0;j<st.seeds.length;j++){
    window.dispatchEvent(new CustomEvent('bp-seed-to-nursery',{detail:st.seeds[j]}));
  }
  st.plants=[];st.seeds=[];render();
  if(delivered>0||seedCount>0){
    var msg='Midnight delivery: ';
    if(delivered>0)msg+=delivered+' plant'+(delivered>1?'s':'');
    if(delivered>0&&seedCount>0)msg+=', ';
    if(seedCount>0)msg+=seedCount+' seed'+(seedCount>1?'s':'');
    msg+=' sent home.';
    toast(msg);
    if(window.renderGreenhouse)window.renderGreenhouse();
    if(window.syncVaultToCloud)setTimeout(window.syncVaultToCloud,500);
  }
}

// ═══ CLOUD SYNC ═══
function getState(){return{plants:st.plants,seeds:st.seeds,unlocks:st.unlocks,daily:st.daily,pollen:st.pollen,hashes:st.hashes,steps:st.steps,drops:st.drops,ph:st.ph,gp:st.gp,fc:st.fc,wd:st.wd,lastRTB:_rtbLoadState()};}
function loadFromCloud(data){if(!data)return;if(data.plants)st.plants=data.plants;if(data.seeds)st.seeds=data.seeds;if(data.unlocks){for(var k in data.unlocks)st.unlocks[k]=data.unlocks[k];}if(typeof data.pollen==='number')st.pollen=data.pollen;if(typeof data.hashes==='number')st.hashes=data.hashes;if(typeof data.steps==='number')st.steps=data.steps;if(typeof data.ph==='number')st.ph=data.ph;if(typeof data.gp==='number')st.gp=data.gp;if(typeof data.fc==='number')st.fc=data.fc;if(typeof data.wd==='number')st.wd=data.wd;if(data.lastRTB)localStorage.setItem(RTB_KEY,String(data.lastRTB));render();_rtbRender();_rtbStartTimer();}
return{init:init,toggle:toggle,open:open,close:close,render:render,tp:tp,ts:ts,s2n:s2n,sns:sns,sne:sne,hts:hts,hte:hte,ap:ap,as:as,cu:cu,cpi:cpi,csi:csi,getState:getState,loadFromCloud:loadFromCloud,returnToBase:returnToBase,_rtbRender:_rtbRender,_rtbStartTimer:_rtbStartTimer,checkMidnightDeliver:checkMidnightDeliver};
})();
window.BP=BP;
window._BP_UI=UI;
})();

// Alias for spec compatibility (MUST be outside IIFE)
window.FG_Backpack = window.BP;

// Wire show/hide to be called externally
window.FG_Backpack.show = function() {
  _bpContext = 'wild';
  try{console.log('[BP.show] called');}catch(e){}
  var el = document.getElementById('bpi');
  var fab = document.getElementById('dfb');
  if (el) el.style.display = 'block';
  if (fab) fab.style.display = 'flex';
  var stp = document.getElementById('stp');
  if (stp) stp.style.display = 'block';
  // Show map overlays
  var vig = document.querySelector('.map-vignette');
  var glass = document.querySelector('.map-glass-highlight');
  if (vig) vig.style.display = 'block';
  if (glass) glass.style.display = 'block';
  // Inject SVG icons if not already there
  var dfi = document.getElementById('dfi');
  if (dfi && !dfi.querySelector('svg') && window._BP_UI) dfi.innerHTML = window._BP_UI.spr || '';
  var sdhi = document.getElementById('sdhi');
  if (sdhi && !sdhi.querySelector('svg') && window._BP_UI) sdhi.innerHTML = window._BP_UI.hx || '';
  // Show return-to-base button + start cooldown timer
  if (BP._rtbRender) BP._rtbRender();
  if (BP._rtbStartTimer) BP._rtbStartTimer();
  // Check midnight auto-deliver on Wild tab entry
  if (BP.checkMidnightDeliver) BP.checkMidnightDeliver();
  // Show recenter button
  var rc = document.getElementById('w-recenter'); if (rc) rc.style.display = 'flex';
};
window.FG_Backpack.hide = function() {
  if (window.BP) BP.close();
  var el = document.getElementById('bpi');
  var fab = document.getElementById('dfb');
  var rtb = document.getElementById('bp-rtb');
  if (el) el.style.display = 'none';
  if (fab) fab.style.display = 'none';
  if (rtb) rtb.style.display = 'none';
  var rc = document.getElementById('w-recenter'); if (rc) rc.style.display = 'none';
  var stp = document.getElementById('stp');
  if (stp) stp.style.display = 'none';
  // Hide map overlays
  var vig = document.querySelector('.map-vignette');
  var glass = document.querySelector('.map-glass-highlight');
  if (vig) vig.style.display = 'none';
  if (glass) glass.style.display = 'none';
};

// ═══ COMPACT MODE — backpack visible on greenhouse/nursery tabs ═══
var _bpContext = 'wild'; // 'wild' | 'greenhouse' | 'nursery'
var BP_SLOT_CD_KEY = 'fg_bp_slot_cd';
var BP_SLOT_CD_MS = 6 * 3600000; // 6 hours

window.FG_Backpack.showCompact = function(tab) {
  _bpContext = tab || 'greenhouse';
  if (window.BP) BP.close(); // close expanded panel if open
  var el = document.getElementById('bpi');
  if (el) el.style.display = 'block';
  // Hide wild-specific UI
  var fab = document.getElementById('dfb'); if (fab) fab.style.display = 'none';
  var rtb = document.getElementById('bp-rtb'); if (rtb) rtb.style.display = 'none';
  var rc = document.getElementById('w-recenter'); if (rc) rc.style.display = 'none';
  var stp = document.getElementById('stp'); if (stp) stp.style.display = 'none';
  // Check midnight auto-deliver
  if (BP && BP.checkMidnightDeliver) BP.checkMidnightDeliver();
  if (BP) BP.render();
};

// Override toggle/open to be context-aware
var _origOpen = window.FG_Backpack.open || (BP ? BP.open : null);
var _origTp = BP ? BP.tp : null;
var _origTs = BP ? BP.ts : null;

// Per-slot cooldown helpers
function _bpGetCooldowns() {
  try { return JSON.parse(localStorage.getItem(BP_SLOT_CD_KEY) || '{}'); } catch (e) { return {}; }
}
function _bpSetCooldown(key) {
  var cd = _bpGetCooldowns();
  cd[key] = Date.now();
  try { localStorage.setItem(BP_SLOT_CD_KEY, JSON.stringify(cd)); } catch (e) {}
}
function _bpCooldownRemaining(key) {
  var cd = _bpGetCooldowns();
  if (!cd[key]) return 0;
  var elapsed = Date.now() - cd[key];
  return Math.max(0, BP_SLOT_CD_MS - elapsed);
}
function _bpFormatTime(ms) {
  var h = Math.floor(ms / 3600000);
  var m = Math.ceil((ms % 3600000) / 60000);
  return h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
}

// Send plant from backpack to greenhouse (with 6h cooldown)
window.FG_Backpack.sendPlantHome = function(idx) {
  if (!BP || !BP.getState) return;
  var state = BP.getState();
  if (idx >= state.plants.length) return;
  var cdKey = 'p' + idx;
  var remaining = _bpCooldownRemaining(cdKey);
  if (remaining > 0) {
    if (BP.toast) BP.toast('Cooldown: ' + _bpFormatTime(remaining) + ' remaining');
    else if (window._toast) window._toast('Cooldown: ' + _bpFormatTime(remaining) + ' remaining');
    return;
  }
  var plant = state.plants.splice(idx, 1)[0];
  if (!plant) return;
  // Add to greenhouse
  var gh = [];
  try { gh = JSON.parse((window._secureGet ? window._secureGet('sws_greenhouse') : localStorage.getItem('sws_greenhouse')) || '[]'); } catch (e) {}
  gh.push({
    hash: plant.hash,
    date: new Date().toISOString().split('T')[0],
    born: Date.now(),
    origin: plant.origin || 'wild',
    rare: plant.rare || false,
    traits: null,
    breedCount: 0,
    generation: plant.generation || 1
  });
  if (window.saveGreenhouse) window.saveGreenhouse(gh);
  else {
    if (window._secureSet) window._secureSet('sws_greenhouse', gh);
    else localStorage.setItem('sws_greenhouse', JSON.stringify(gh));
  }
  _bpSetCooldown(cdKey);
  BP.render();
  if (window.renderGreenhouse) window.renderGreenhouse();
  if (window.syncVaultToCloud) setTimeout(window.syncVaultToCloud, 500);
  var name = plant.name || 'Plant';
  if (BP.toast) BP.toast(name + ' sent to Greenhouse!');
  else if (window._toast) window._toast(name + ' sent to Greenhouse!');
};

// Send seed from backpack to nursery (with 6h cooldown)
window.FG_Backpack.sendSeedToNursery = function(idx) {
  if (!BP || !BP.getState) return;
  var state = BP.getState();
  if (idx >= state.seeds.length) return;
  var cdKey = 's' + idx;
  var remaining = _bpCooldownRemaining(cdKey);
  if (remaining > 0) {
    if (BP.toast) BP.toast('Cooldown: ' + _bpFormatTime(remaining) + ' remaining');
    else if (window._toast) window._toast('Cooldown: ' + _bpFormatTime(remaining) + ' remaining');
    return;
  }
  var seed = state.seeds.splice(idx, 1)[0];
  if (!seed) return;
  _bpSetCooldown(cdKey);
  window.dispatchEvent(new CustomEvent('bp-seed-to-nursery', {detail: seed}));
  BP.render();
  if (window.renderNursery) setTimeout(window.renderNursery, 200);
  if (window.syncVaultToCloud) setTimeout(window.syncVaultToCloud, 500);
  if (BP.toast) BP.toast('Seed sent to Nursery!');
  else if (window._toast) window._toast('Seed sent to Nursery!');
};

// Context-aware plant tap — show "Send Home" button on greenhouse tab
var _origTpFn = BP ? BP.tp : function(){};
BP.tp = function(i) {
  _origTpFn(i);
  if (_bpContext === 'greenhouse') {
    // Replace hold-to-release with Send Home button
    var relBtn = document.getElementById('htc-rel');
    if (relBtn) relBtn.style.display = 'none';
    var pic = document.getElementById('pic');
    if (pic) {
      var existing = document.getElementById('bp-send-home');
      if (existing) existing.remove();
      var cdKey = 'p' + i;
      var remaining = _bpCooldownRemaining(cdKey);
      var btn = document.createElement('button');
      btn.id = 'bp-send-home';
      btn.style.cssText = 'display:block;width:100%;margin-top:8px;padding:12px;min-height:48px;border:1px solid var(--sage);background:rgba(122,179,86,0.15);color:var(--sage);border-radius:8px;font-family:DM Mono,monospace;font-size:0.4rem;cursor:pointer;';
      if (remaining > 0) {
        btn.textContent = 'COOLDOWN: ' + _bpFormatTime(remaining);
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.textContent = 'SEND TO GREENHOUSE';
        btn.onclick = function() { window.FG_Backpack.sendPlantHome(i); pic.classList.remove('show'); };
      }
      pic.appendChild(btn);
    }
  } else {
    // Wild tab — restore hold-to-release
    var relBtn2 = document.getElementById('htc-rel');
    if (relBtn2) relBtn2.style.display = '';
    var old = document.getElementById('bp-send-home');
    if (old) old.remove();
  }
};

// Context-aware seed tap — show "Plant Seed" button on nursery tab
var _origTsFn = BP ? BP.ts : function(){};
BP.ts = function(i) {
  _origTsFn(i);
  if (_bpContext === 'nursery') {
    // Replace hold-to-send with Plant Seed button
    var nurBtn = document.getElementById('htc-nur');
    if (nurBtn) nurBtn.style.display = 'none';
    var sdi = document.getElementById('sdi');
    if (sdi) {
      var existing = document.getElementById('bp-plant-seed');
      if (existing) existing.remove();
      var cdKey = 's' + i;
      var remaining = _bpCooldownRemaining(cdKey);
      var btn = document.createElement('button');
      btn.id = 'bp-plant-seed';
      btn.style.cssText = 'display:block;width:100%;margin-top:8px;padding:12px;min-height:48px;border:1px solid var(--gold);background:rgba(200,168,75,0.15);color:var(--gold);border-radius:8px;font-family:DM Mono,monospace;font-size:0.4rem;cursor:pointer;';
      if (remaining > 0) {
        btn.textContent = 'COOLDOWN: ' + _bpFormatTime(remaining);
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.textContent = 'PLANT IN NURSERY';
        btn.onclick = function() { window.FG_Backpack.sendSeedToNursery(i); sdi.classList.remove('show'); };
      }
      sdi.appendChild(btn);
    }
  } else {
    // Wild tab — restore hold-to-send
    var nurBtn2 = document.getElementById('htc-nur');
    if (nurBtn2) nurBtn2.style.display = '';
    var old = document.getElementById('bp-plant-seed');
    if (old) old.remove();
  }
};

// Wire seed-to-nursery event listener
window.addEventListener('bp-seed-to-nursery', function(e) {
  if (!e.detail) return;
  var seed = e.detail;
  var isMystery = !!seed.mystery || seed.type === 'feral';
  // Use FG_Data.addSeed for correct nursery format
  if (window.FG_Data && FG_Data.addSeed) {
    var result = FG_Data.addSeed({
      seedHash: seed.hash || '',
      parentAHash: seed.hash || '',
      parentBHash: 'feral_' + Date.now(),
      nonce: 0,
      mystery: isMystery
    });
    if (result.ok) {
      if (window.renderNursery) renderNursery();
      if (window._toast) _toast(isMystery ? '\ud83c\udf31 Mystery seed planted! Water it daily to see what it becomes.' : '\ud83c\udf31 Seed added to nursery! Water it daily.');
    } else {
      if (window._toast) _toast('Nursery full. Bloom or abandon a seed first.');
    }
  } else {
    // Fallback: direct write in correct format
    var nursery = [];
    try { var _nRaw = window._secureGet ? window._secureGet('sws_nursery') : localStorage.getItem('sws_nursery'); nursery = JSON.parse(_nRaw || '[]') || []; } catch(ex) {}
    if (nursery.length >= 3) { if (window._toast) _toast('Nursery full!'); return; }
    var today = new Date().toISOString().slice(0, 10);
    nursery.push({
      id: 'nur_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      seedHash: seed.hash || '',
      parentAHash: seed.hash || '',
      parentBHash: 'feral_wild',
      nonce: 0,
      plantedAt: today,
      waterLog: [],
      status: 'growing',
      nickname: null,
      mystery: isMystery
    });
    if (window._secureSet) { window._secureSet('sws_nursery', nursery); } else { localStorage.setItem('sws_nursery', JSON.stringify(nursery)); }
    if (window.renderNursery) renderNursery();
  }
  if (window.syncVaultToCloud) setTimeout(syncVaultToCloud, 500);
});

(function(){
'use strict';
var GC={Common:'#8a9a7a',Uncommon:'#5a9e3f',Rare:'#4a90d9',Epic:'#9b59b6',Legendary:'#C8A84B',Mythic:'#e74c3c',Cosmic:'#ff6ec7'};
var _queue=[];
var _seedCount=0;
var _idx=0;
var _active=false;

window._startReveal=function(plants,seeds){
  if(!plants||plants.length===0)return;
  _queue=plants.slice();
  _seedCount=seeds||0;
  _idx=0;
  _active=true;
  _showNext();
};

function _showNext(){
  var overlay=document.getElementById('reveal-overlay');
  if(!overlay)return;
  if(_idx>=_queue.length){_finish();return;}

  overlay.classList.add('active');
  var card=document.getElementById('rev-card');
  var countEl=document.getElementById('rev-count');
  var tapEl=document.getElementById('rev-tap');
  if(card)card.classList.remove('flipped');
  if(countEl)countEl.textContent=(_idx+1)+' / '+_queue.length;
  if(tapEl)tapEl.textContent='tap to reveal';

  // Set up click to flip
  overlay.onclick=function(){
    if(!card.classList.contains('flipped')){
      var _revPlant=_queue[_idx];
      _flipReveal(_revPlant);
      card.classList.add('flipped');
      if(tapEl)tapEl.textContent='tap for next';
      try{navigator.vibrate&&navigator.vibrate([15,50,25]);}catch(e){}
      // Play grade-appropriate fanfare
      if(window.FG_Audio&&FG_Audio.enabled){try{var _rg='Common';if(window.hashToTraits&&window.getTerraGrade&&_revPlant.hash){_rg=window.getTerraGrade(window.hashToTraits(_revPlant.hash)).label||'Common';}FG_Audio.playRevealFanfare(_rg);}catch(e){}}
    } else {
      _idx++;
      if(_idx<_queue.length){_showNext();}
      else{_finish();}
    }
  };
}

function _flipReveal(plant){
  var hash=plant.hash;
  var info={nm:'Plant',grade:'Common',gc:'#8a9a7a',t:null};
  try{
    if(window.hashToTraits&&hash){
      info.t=window.hashToTraits(hash);
      var A=['Verdant','Shadow','Golden','Crimson','Pale','Iron','Ember','Frost','Dusk','Storm','Moss','Jade','Azure','Copper','Silk','Wild'];
      var N=['Wisp','Bloom','Fern','Thorn','Crown','Root','Drift','Spiral','Haze','Phantom','Crest','Veil','Shard','Arch','Spire','Reed'];
      info.nm=A[parseInt(hash.substring(0,2),16)%A.length]+' '+N[parseInt(hash.substring(2,4),16)%N.length];
      if(window.getTerraGrade){var tg=window.getTerraGrade(info.t);info.grade=tg.label||'Common';}
      info.gc=GC[info.grade]||GC.Common;
    }
  }catch(e){}

  // Render SVG
  var svgEl=document.getElementById('rev-svg');
  if(svgEl&&window._generatePlantSVG){try{svgEl.innerHTML=window._generatePlantSVG(hash,100);}catch(e){svgEl.innerHTML='';}}

  // Name + grade
  var nameEl=document.getElementById('rev-name');
  if(nameEl){nameEl.textContent=info.nm;nameEl.style.color=info.gc;}
  var gradeEl=document.getElementById('rev-grade');
  if(gradeEl){gradeEl.textContent=info.grade.toUpperCase();gradeEl.style.color=info.gc;gradeEl.style.borderColor=info.gc;}

  // Haiku
  var haikuEl=document.getElementById('rev-haiku');
  if(haikuEl&&window.getHaiku){
    try{var hk=window.getHaiku(hash);haikuEl.innerHTML=(hk.line1||'')+'<br>'+(hk.line2||'')+'<br>'+(hk.line3||'');}
    catch(e){haikuEl.innerHTML='';}
  }

  // Glow ring color
  var glowEl=document.getElementById('rev-glow');
  if(glowEl){glowEl.style.boxShadow='0 0 60px '+info.gc+',0 0 120px '+info.gc+'40';}

  // Card border color
  var card=document.getElementById('rev-card');
  var back=card?card.querySelector('.reveal-back'):null;
  if(back){back.style.borderColor=info.gc;}

  // GA event
  if(typeof gtag!=='undefined')gtag('event','harvest_reveal',{grade:info.grade,name:info.nm});
}

function _finish(){
  var overlay=document.getElementById('reveal-overlay');
  if(overlay){overlay.classList.remove('active');overlay.onclick=null;}
  _active=false;
  _queue=[];
  var msg='\ud83c\udfe0 Returned to base!';
  if(_seedCount>0)msg+=' +'+_seedCount+' seed'+(_seedCount>1?'s':'');
  if(window.showHexMsg)showHexMsg(msg);
}
})();

(function(){
'use strict';
// Pi SDK — gracefully degrades outside Pi Browser
var _piReady=false;
var _piUser=null;

function _initPi(){
  if(typeof Pi==='undefined'){console.log('[Pi] Not in Pi Browser — payments disabled.');return;}
  try{
    Pi.init({version:'2.0',sandbox:true}); // sandbox:true for testnet, false for mainnet
    console.log('[Pi] SDK initialized (sandbox mode).');
    _piReady=true;
  }catch(e){console.log('[Pi] Init failed:',e.message);}
}

function authenticate(cb){
  if(!_piReady){if(cb)cb(null);return;}
  Pi.authenticate(['username','payments'],function(payment){
    // Handle incomplete payment from previous session
    _completePayment(payment.identifier,payment.transaction?payment.transaction.txid:null);
  }).then(function(auth){
    _piUser={uid:auth.user.uid,username:auth.user.username,token:auth.accessToken};
    console.log('[Pi] Authenticated:',_piUser.username);
    if(cb)cb(_piUser);
  }).catch(function(e){
    console.log('[Pi] Auth failed:',e);
    if(cb)cb(null);
  });
}

function createPayment(amount,memo,metadata,onSuccess,onCancel){
  if(!_piReady){
    if(window.showHexMsg)showHexMsg('Pi payments not available — open in Pi Browser');
    return;
  }
  Pi.createPayment({amount:amount,memo:memo,metadata:metadata},{
    onReadyForServerApproval:function(paymentId){
      _approvePayment(paymentId);
    },
    onReadyForServerCompletion:function(paymentId,txid){
      _completePayment(paymentId,txid,function(){
        if(onSuccess)onSuccess(paymentId);
      });
    },
    onCancel:function(paymentId){
      console.log('[Pi] Payment cancelled:',paymentId);
      if(onCancel)onCancel();
    },
    onError:function(error){
      console.error('[Pi] Payment error:',error);
      if(window.showHexMsg)showHexMsg('Payment error — try again');
    }
  });
}

// Server-side approval — calls Firebase Cloud Function
function _approvePayment(paymentId){
  // TODO: Replace with actual Cloud Function URL after deployment
  var url='https://us-central1-focus-grove-fffa8.cloudfunctions.net/piApprove';
  try{
    var xhr=new XMLHttpRequest();
    xhr.open('POST',url,true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send(JSON.stringify({paymentId:paymentId}));
  }catch(e){console.error('[Pi] Approve error:',e);}
}

// Server-side completion — calls Firebase Cloud Function
function _completePayment(paymentId,txid,cb){
  var url='https://us-central1-focus-grove-fffa8.cloudfunctions.net/piComplete';
  try{
    var xhr=new XMLHttpRequest();
    xhr.open('POST',url,true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onload=function(){if(cb)cb();};
    xhr.send(JSON.stringify({paymentId:paymentId,txid:txid}));
  }catch(e){console.error('[Pi] Complete error:',e);}
}

// ── Payment wrappers for game features ──
window.LW_Pi={
  ready:function(){return _piReady;},
  user:function(){return _piUser;},
  authenticate:authenticate,
  // Greenhouse slot expansion — 1 Pi per slot
  buySlot:function(slotNum,cb){
    createPayment(1,'Greenhouse Slot '+slotNum,{type:'slot',slot:slotNum},function(){
      // Deliver: increment slot count
      var slots=parseInt(localStorage.getItem('sws_greenhouse_slots')||'10')+1;
      localStorage.setItem('sws_greenhouse_slots',String(slots));
      if(window.renderGreenhouse)renderGreenhouse();
      if(window.syncVaultToCloud)syncVaultToCloud();
      if(window.showHexMsg)showHexMsg('Slot '+slotNum+' unlocked!');
      if(cb)cb(true);
    },function(){if(cb)cb(false);});
  },
  // Emergency pouch slot — 10 Pi, once per day
  buyEmergencySlot:function(cb){
    createPayment(10,'Emergency Pouch Slot',{type:'emergency_pouch'},function(){
      if(window.FG_Backpack&&FG_Backpack.ul)FG_Backpack.ul('slot6','Emergency slot unlocked!','One-time daily.');
      if(cb)cb(true);
    },function(){if(cb)cb(false);});
  },
  // Field pouch upgrade — Pi per slot
  buyPouchUpgrade:function(cb){
    createPayment(1,'Field Pouch Upgrade',{type:'pouch_upgrade'},function(){
      // Deliver: increment seed pouch capacity
      if(window.showHexMsg)showHexMsg('Seed pouch expanded!');
      if(cb)cb(true);
    },function(){if(cb)cb(false);});
  }
};

// Initialize on load
_initPi();
})();


(function(){
'use strict';
var DLK = 'lw_daily_login';

function _today() { return new Date().toISOString().split('T')[0]; }

function _yesterday() {
  var d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function _loadDaily() {
  try { return JSON.parse(localStorage.getItem(DLK) || 'null') || { lastClaim: null, streak: 0 }; }
  catch(e) { return { lastClaim: null, streak: 0 }; }
}

function _saveDaily(d) {
  try { localStorage.setItem(DLK, JSON.stringify(d)); } catch(e) {}
}

// Reward table: base dew per day + streak milestones
function _dailyReward(streak) {
  var base = Math.min(5 + Math.floor(streak / 3), 15); // 5 dew, +1 per 3 days, cap 15
  var bonus = 0;
  var bonusLabel = '';
  if (streak === 7) { bonus = 25; bonusLabel = '7-DAY STREAK BONUS'; }
  else if (streak === 14) { bonus = 50; bonusLabel = '14-DAY STREAK BONUS'; }
  else if (streak === 30) { bonus = 100; bonusLabel = '30-DAY STREAK BONUS'; }
  else if (streak > 0 && streak % 30 === 0) { bonus = 100; bonusLabel = streak + '-DAY STREAK BONUS'; }
  return { base: base, bonus: bonus, bonusLabel: bonusLabel, total: base + bonus };
}

function _showDailyReward() {
  var daily = _loadDaily();
  var today = _today();

  // Already claimed today — triple guard
  if (daily.lastClaim === today) return;
  if (localStorage.getItem('lw_daily_claimed') === today) return;
  if (window._dailyClaimedThisSession) return;

  // Streak logic
  if (daily.lastClaim === _yesterday()) {
    daily.streak = (daily.streak || 0) + 1;
  } else if (daily.lastClaim !== today) {
    daily.streak = 1; // reset — missed a day or first login
  }

  var reward = _dailyReward(daily.streak);

  // Dew is granted inside the calendar modal now (tier-based)

  // Save claim (three places for redundancy)
  daily.lastClaim = today;
  _saveDaily(daily);
  localStorage.setItem('lw_daily_claimed', today);
  window._dailyClaimedThisSession = true;

  // ── MONTHLY CALENDAR MODAL ──
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var dayOfMonth = now.getDate();
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Load this month's login calendar
  var calKey = 'lw_cal_' + year + '_' + month;
  var cal = {};
  try { cal = JSON.parse(localStorage.getItem(calKey) || '{}'); } catch(e) {}
  cal[dayOfMonth] = true; // Mark today
  localStorage.setItem(calKey, JSON.stringify(cal));
  var loggedDays = Object.keys(cal).length;

  // Reward tiers by week
  var dayReward = dayOfMonth <= 7 ? 3 : dayOfMonth <= 14 ? 5 : dayOfMonth <= 21 ? 8 : 12;
  // Perfect attendance bonus check
  var perfectSoFar = true;
  for (var pd = 1; pd < dayOfMonth; pd++) { if (!cal[pd]) { perfectSoFar = false; break; } }

  var ov = document.createElement('div');
  ov.id = 'daily-reward-modal';
  ov.style.cssText = 'position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:rgba(5,8,4,0.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:panelFadeIn 0.3s ease;padding:1rem;';

  var h = '<div style="text-align:center;max-width:340px;width:100%;background:rgba(18,22,16,0.95);border:1.5px solid rgba(200,168,75,0.3);border-radius:16px;padding:1rem;box-shadow:0 12px 40px rgba(0,0,0,0.6);">';

  // Header
  h += '<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:0.12em;margin-bottom:0.15rem;">' + monthNames[month].toUpperCase() + ' LOGIN</div>';
  h += '<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin-bottom:0.5rem;">' + loggedDays + ' / ' + daysInMonth + ' days this month</div>';

  // Calendar grid
  h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:0.5rem;">';
  // Day headers
  var dayLabels = ['M','T','W','T','F','S','S'];
  for (var dl = 0; dl < 7; dl++) {
    h += '<div style="font-family:DM Mono,monospace;font-size:0.25rem;color:var(--muted);text-align:center;">' + dayLabels[dl] + '</div>';
  }
  // Offset for first day of month (Monday = 0)
  var firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday=0 to Monday-start
  for (var sp = 0; sp < firstDay; sp++) {
    h += '<div></div>';
  }
  // Days
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = d === dayOfMonth;
    var isLogged = cal[d];
    var isFuture = d > dayOfMonth;
    var weekNum = Math.ceil(d / 7);
    var tierReward = weekNum <= 1 ? 3 : weekNum <= 2 ? 5 : weekNum <= 3 ? 8 : 12;
    var bg = isToday ? 'rgba(122,179,86,0.3)' : isLogged ? 'rgba(200,168,75,0.15)' : isFuture ? 'rgba(26,36,22,0.3)' : 'rgba(192,112,112,0.08)';
    var border = isToday ? 'rgba(122,179,86,0.5)' : isLogged ? 'rgba(200,168,75,0.3)' : 'rgba(74,124,53,0.08)';
    var color = isLogged ? 'var(--gold)' : isFuture ? 'var(--muted)' : 'rgba(192,112,112,0.5)';
    h += '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:4px;padding:2px;text-align:center;min-height:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    h += '<div style="font-family:DM Mono,monospace;font-size:0.3rem;color:' + color + ';">' + d + '</div>';
    if (isLogged) h += '<div style="font-size:0.22rem;color:var(--sage);">+' + tierReward + '</div>';
    h += '</div>';
  }
  h += '</div>';

  // Today's reward
  h += '<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;color:rgba(91,175,220,0.95);text-shadow:0 0 15px rgba(91,175,220,0.3);margin:0.2rem 0;">+' + dayReward + '</div>';
  h += '<div style="font-family:DM Mono,monospace;font-size:0.38rem;color:var(--muted);margin-bottom:0.3rem;">Sunbeams (Week ' + Math.ceil(dayOfMonth / 7) + ' bonus)</div>';

  // Streak info
  h += '<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin-bottom:0.15rem;">\ud83d\udd25 ' + daily.streak + ' day streak</div>';

  // Perfect attendance
  if (perfectSoFar && dayOfMonth > 1) {
    h += '<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--gold);margin-bottom:0.15rem;">\u2728 Perfect attendance! (' + (daysInMonth - dayOfMonth) + ' days to monthly reward)</div>';
  }

  // Monthly reward preview
  h += '<div style="font-family:DM Mono,monospace;font-size:0.3rem;color:var(--muted);margin-top:0.2rem;padding:0.3rem;background:rgba(200,168,75,0.05);border:1px solid rgba(200,168,75,0.1);border-radius:6px;">';
  h += 'Month-end reward: <span style="color:var(--gold);">' + daysInMonth + '/' + daysInMonth + ' = Rare Feral Seed + 50 Dew</span>';
  h += '</div>';

  // Collect button
  h += '<button onclick="this.parentNode.parentNode.remove();if(window._lwNotifPrompt)window._lwNotifPrompt();" style="margin-top:0.5rem;width:100%;padding:0.5rem;border:1.5px solid rgba(122,179,86,0.3);border-radius:8px;background:linear-gradient(180deg,rgba(74,124,53,0.25),rgba(46,80,36,0.35));color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:0.65rem;letter-spacing:0.1em;cursor:pointer;min-height:48px;">COLLECT +' + dayReward + ' DEW</button>';
  h += '</div>';

  ov.innerHTML = h;
  document.body.appendChild(ov);

  // Grant today's reward (use tier-based amount instead of old formula)
  if (window.earnHashes) earnHashes(dayReward);

  // Haptic + analytics
  try { if (window._haptic) _haptic('sync'); } catch(e) {}
  if (typeof gtag !== 'undefined') gtag('event', 'daily_login', { streak: daily.streak, reward: dayReward, day: dayOfMonth, logged: loggedDays });

  // Update dashboard
  if (window.updateDashboard) setTimeout(updateDashboard, 300);
}

// Expose for triggering after vault loads
var _dailyLoginChecked = false;
window._checkDailyLogin = function() {
  if (_dailyLoginChecked) return; // Only check once per session
  _dailyLoginChecked = true;
  setTimeout(_showDailyReward, 1200);
};
})();

(function(){
'use strict';
var TK='lw_tut';
var _ov=null,_dlg=null,_spot=null;

function _getStep(){var s=localStorage.getItem(TK);if(s==='done')return -1;return parseInt(s,10)||0;}
function _setStep(n){localStorage.setItem(TK,String(n));}
function _done(){_setStep('done');_clear();}

function _clear(){
  if(_ov&&_ov.parentNode)_ov.remove();_ov=null;
  if(_dlg&&_dlg.parentNode)_dlg.remove();_dlg=null;
  if(_spot&&_spot.parentNode)_spot.remove();_spot=null;
}

function _dialog(text,btnLabel,btnCb,pos){
  if(_dlg&&_dlg.parentNode)_dlg.remove();
  _dlg=document.createElement('div');
  _dlg.style.cssText='position:fixed;z-index:1000012;background:rgba(18,24,16,0.97);border:1.5px solid rgba(200,168,75,0.3);border-radius:16px;padding:1.2rem 1.4rem;max-width:min(340px,90vw);font-family:Playfair Display,serif;font-size:clamp(0.85rem,2.8vw,1.05rem);color:var(--cream);line-height:1.8;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.6);animation:panelFadeIn 0.35s ease;';
  if(pos==='top'){_dlg.style.top='12%';_dlg.style.left='50%';_dlg.style.transform='translateX(-50%)';}
  else if(pos==='bottom'){_dlg.style.bottom='calc(90px + env(safe-area-inset-bottom,0px))';_dlg.style.left='50%';_dlg.style.transform='translateX(-50%)';}
  else{_dlg.style.top='40%';_dlg.style.left='50%';_dlg.style.transform='translate(-50%,-50%)';}
  var h='<div style="margin-bottom:0.6rem;">'+text+'</div>';
  if(btnLabel){
    h+='<button onclick="void(0)" style="min-height:52px;min-width:140px;padding:0.5rem 1.4rem;border-radius:10px;border:1.5px solid rgba(200,168,75,0.35);background:linear-gradient(180deg,rgba(200,168,75,0.15),rgba(200,168,75,0.05));color:var(--gold);font-family:Bebas Neue,sans-serif;font-size:0.85rem;letter-spacing:0.1em;cursor:pointer;">'+btnLabel+'</button>';
  }
  _dlg.innerHTML=h;
  if(btnCb){var btn=_dlg.querySelector('button');if(btn)btn.onclick=function(e){e.stopPropagation();btnCb();};}
  document.body.appendChild(_dlg);
  return _dlg;
}

function _overlay(tapCb){
  if(_ov&&_ov.parentNode)_ov.remove();
  _ov=document.createElement('div');
  _ov.style.cssText='position:fixed;inset:0;z-index:1000010;background:rgba(0,0,0,0.72);animation:panelFadeIn 0.3s ease;';
  if(tapCb)_ov.onclick=tapCb;
  document.body.appendChild(_ov);
}

function _spotlight(el){
  if(!el)return;
  if(_spot&&_spot.parentNode)_spot.remove();
  var r=el.getBoundingClientRect();
  _spot=document.createElement('div');
  _spot.style.cssText='position:fixed;z-index:1000011;border-radius:12px;box-shadow:0 0 0 9999px rgba(0,0,0,0.72);pointer-events:none;transition:all 0.3s ease;';
  _spot.style.top=(r.top-8)+'px';_spot.style.left=(r.left-8)+'px';
  _spot.style.width=(r.width+16)+'px';_spot.style.height=(r.height+16)+'px';
  document.body.appendChild(_spot);
  el.style.position=el.style.position||'relative';
  el.style.zIndex='1000011';
}

// ═══ Find the Game nav button (used by multiple steps) ═══
function _findGameBtn(){
  var navBtns=document.querySelectorAll('.fg-nav-btn');
  for(var i=0;i<navBtns.length;i++){
    var img=navBtns[i].querySelector('img');
    if(img&&img.alt==='Game')return navBtns[i];
  }
  return null;
}

// ═══ EMPTY GREENHOUSE PATH ═══
// Player has no plants — skip collection tutorial, guide them to earn their first
function _stepEmpty(){
  _overlay(function(){_done();});
  _dialog(
    'Welcome to <span style="color:var(--gold);">Lucid Winds</span>!<br><br>' +
    'Your greenhouse is where your <span style="color:var(--sage);">one-of-a-kind plants</span> live.<br><br>' +
    'Each one is a unique piece of art \u2014 grown from your attention.<br><br>' +
    '<span style="color:var(--muted);font-size:0.85em;">Play games to earn Dew. Collect 30 Dew to bloom your first plant.</span>',
    'START PLAYING', function(){
      _done();
      if(window.switchTab)switchTab('game');
    },'center');
}

// ═══ STEP 1: "This is your first plant. Tap to view it." ═══
function _step1(retries){
  if(typeof retries==='undefined')retries=0;
  _setStep(1);
  setTimeout(function(){
    var cards=document.querySelectorAll('.greenhouse-plant:not(.undiscovered)');
    if(!cards.length){
      if(retries<6){setTimeout(function(){_step1(retries+1);},500);return;}
      console.warn('[LW Tutorial] No plants found after retries, switching to empty path');
      _stepEmpty();
      return;
    }
    var firstCard=cards[0];
    // Overlay dismisses tutorial if tapped (escape hatch for stuck states)
    _overlay(function(){_done();firstCard.style.zIndex='';});
    _spotlight(firstCard);
    _dialog('This is your first plant.<br><br><span style="color:var(--gold);font-size:1.1em;">Tap it to take a closer look.</span><br><div style="font-size:1.8rem;margin-top:0.3rem;animation:_whPulse 1.5s ease infinite;">\u2193</div>',null,null,'top');
    var origClick=firstCard.onclick;
    firstCard.onclick=function(e){
      _clear();
      firstCard.style.zIndex='';
      firstCard.onclick=origClick;
      if(origClick)origClick.call(firstCard,e);
      _setStep(2);
      _waitForCarousel(0);
    };
  },600);
}

// Wait for carousel to open before showing step 2
function _waitForCarousel(attempts){
  var gallery=document.getElementById('plant-gallery-modal');
  if(gallery&&gallery.classList.contains('open')){
    setTimeout(_step2,300);
  } else if(attempts<20){
    setTimeout(function(){_waitForCarousel(attempts+1);},200);
  } else {
    // Carousel never opened — skip to game step
    console.warn('[LW Tutorial] Carousel did not open, skipping to step 4');
    _stepGame();
  }
}

// ═══ STEP 2: Carousel front — uniqueness + flip prompt ═══
function _step2(){
  _setStep(2);
  _dialog('Every plant is completely unique \u2014 created through your own interactions.<br><br>The <span style="color:var(--gold);">name</span> and <span style="color:var(--gold);">haiku</span> are generated just for you.<br><br><span style="color:var(--sage);font-size:1.1em;">Tap the card to flip it and see the layers \u2192</span>','',null,'bottom');
  if(_dlg){var btn=_dlg.querySelector('button');if(btn)btn.remove();}
  var flipWrap=document.querySelector('.cs-flip-wrap');
  if(flipWrap){
    var _polls=0;
    var _watchFlip=function(){
      if(flipWrap.classList.contains('flipped')){
        _clear();
        setTimeout(_step3,500);
      } else if(_polls<150){
        _polls++;
        setTimeout(_watchFlip,200);
      } else {
        _clear();
        setTimeout(_step3,300);
      }
    };
    setTimeout(_watchFlip,500);
  } else {
    _clear();
    setTimeout(_step3,300);
  }
}

// ═══ STEP 3: Carousel back — DNA ledger ═══
function _step3(){
  _setStep(3);
  _dialog('These are the <span style="color:var(--gold);">genetic layers</span> that make up your unique piece of art.<br><br>Each trait was shaped by the hash of your attention.','GOT IT',function(){
    _clear();
    if(window.closePlantGallery)closePlantGallery();
    setTimeout(_stepGame,500);
  },'top');
}

// ═══ FINAL STEP: Direct to Game tab ═══
function _stepGame(){
  _setStep(4);
  setTimeout(function(){
    _overlay(function(){_done();}); // tap overlay to dismiss
    var gameBtn=_findGameBtn();
    if(gameBtn){
      _spotlight(gameBtn);
      _dialog('Earn more plants by <span style="color:var(--sage);">playing games</span>, <span style="color:var(--sage);">making art</span>, and <span style="color:var(--sage);">solving puzzles</span>.<br><br>Explore and find what you like!','TAP GAME TO START',function(){
        _done();
        gameBtn.style.zIndex='';
        if(window.switchTab)switchTab('game');
      },'center');
    } else {
      _dialog('Earn more plants by playing games, making art, and solving puzzles!','GOT IT',function(){_done();},'center');
    }
  },400);
}

// ═══ DEFERRED: Nursery check ═══
function checkNursery(){
  if(localStorage.getItem('lw_tut_nursery'))return;
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  localStorage.setItem('lw_tut_nursery','1');
  if(gh.length<2){
    setTimeout(function(){
      _dialog('You need at least <span style="color:var(--gold);">2 plants</span> to breed.<br><br>Play some games to earn more, then come back!','GOT IT',function(){_clear();},'center');
    },400);
  } else {
    setTimeout(function(){
      _dialog('You have enough plants to breed!<br><br><span style="color:var(--sage);">Cross-pollination</span> combines two plants into something new. Water the seed for 3 days and it blooms.','GOT IT',function(){_clear();},'center');
    },400);
  }
}

// ═══ DEFERRED: Breed screen ═══
function checkBreed(){
  if(localStorage.getItem('lw_tut_breed'))return;
  localStorage.setItem('lw_tut_breed','1');
  setTimeout(function(){
    _dialog('These are the <span style="color:var(--gold);">genetic layers</span> side by side.<br><br><span style="color:var(--sage);">DOMINANT</span> traits pass down. <span style="color:var(--gold);">BLENDS</span> mix. <span style="color:#d8a0a0;">RISKY</span> ones may mutate.','GOT IT',function(){_clear();},'top');
  },600);
}

function start(){
  // Already completed or in-progress — bail
  if(_getStep()!==0)return;
  // Returning player detection: >1 plant means they've been playing
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  if(gh.length>1){_done();return;}
  // Cloud sync markers mean returning player
  if(localStorage.getItem('lw_vault_uid')||localStorage.getItem('sws_totalHashes')){_done();return;}
  // Start tutorial — _step1 handles both "has plants" and "no plants" paths
  _step1();
}

window.PW_Tutorial={start:start,checkNursery:checkNursery,checkBreed:checkBreed};
})();


// ═══ set-51: BREEDING COMPARISON MODULE ═══
(function(){
'use strict';
var _plantA=null,_plantACtx=null,_partners=[],_pIdx=0;
var _allEligible=[],_aIdx=0;
var _seasonKeys=['spring','summer','autumn','winter'];
var _seasonEmblems=['\ud83c\udf38','\u2600\ufe0f','\ud83c\udf42','\u2744\ufe0f'];
var _seasonNames=['Spring','Summer','Autumn','Winter'];

// Layer categories for card back
var _LAYERS=[
  {key:'VESSEL',get:function(t){var b=window.TRAIT_BANK;return b&&b.pots&&b.pots[t.pot]?b.pots[t.pot].name:'Pot #'+t.pot;}},
  {key:'STEM',get:function(t){var b=window.TRAIT_BANK;var si=t.stem%24;return b&&b.stems&&b.stems[si]?b.stems[si].name:'Stem #'+si;},rare:function(t){var b=window.TRAIT_BANK;var si=t.stem%24;return b&&b.stems&&b.stems[si]&&b.stems[si].rare;},inherit:true,tag:function(t){var b=window.TRAIT_BANK;var si=t.stem%24;return(b&&b.stems&&b.stems[si]&&b.stems[si].rare)?'DOM':'';}},
  {key:'CANOPY',get:function(t){var li=t.leafType%71;var b=window.TRAIT_BANK;return b&&b.leaves&&b.leaves[li]?b.leaves[li].name:'Leaf #'+li;},rare:function(t){var li=t.leafType%71;var b=window.TRAIT_BANK;return b&&b.leaves&&b.leaves[li]&&b.leaves[li].rare;},inherit:true,tag:function(){return 'MIX';}},
  {key:'BLOOM',get:function(t){if(!t.hasFlower)return 'None';var b=window.TRAIT_BANK;return b&&b.flowers&&b.flowers[t.flower%71]?b.flowers[t.flower%71].name:'Bloom #'+t.flower;},rare:function(t){var b=window.TRAIT_BANK;return t.hasFlower&&b&&b.flowers&&b.flowers[t.flower%71]&&b.flowers[t.flower%71].rare;},inherit:true,tag:function(){return 'MIX';},none:function(t){return !t.hasFlower;}},
  {key:'SUBSTRATE',get:function(t){var b=window.TRAIT_BANK;return b&&b.substrates&&b.substrates[t.base]?b.substrates[t.base].name:'Base #'+t.base;},rare:function(t){var b=window.TRAIT_BANK;return b&&b.substrates&&b.substrates[t.base]&&b.substrates[t.base].rare;},inherit:true,tag:function(t){var b=window.TRAIT_BANK;return(b&&b.substrates&&b.substrates[t.base]&&b.substrates[t.base].rare)?'DOM':'';}},
  {key:'AURA',get:function(t){var b=window.TRAIT_BANK;if(b&&b.auras&&b.auras[t.aura]){var n=b.auras[t.aura].name;return n==='None'?'None':n;}return t.aura>2?'Aura #'+t.aura:'None';},none:function(t){var b=window.TRAIT_BANK;if(b&&b.auras&&b.auras[t.aura])return b.auras[t.aura].name==='None';return t.aura<=4;},rare:function(t){var b=window.TRAIT_BANK;return b&&b.auras&&b.auras[t.aura]&&b.auras[t.aura].rare;}},
  {key:'COMPANION',get:function(t){var b=window.TRAIT_BANK;if(b&&b.companions&&b.companions[t.companion]){var n=b.companions[t.companion].name;return n==='None'?'None':n;}return t.companion<20?'None':'Creature #'+t.companion;},mythic:function(t){return t.companion>=32&&t.companion<=38;},rare:function(t){var b=window.TRAIT_BANK;return b&&b.companions&&b.companions[t.companion]&&b.companions[t.companion].rare;},none:function(t){var b=window.TRAIT_BANK;if(b&&b.companions&&b.companions[t.companion])return b.companions[t.companion].name==='None';return t.companion<20;}},
  {key:'MUTATION',get:function(t){return t.mutationName||'None';},mutation:function(t){return t.mutationName&&t.mutationName!=='None';},inherit:true,tag:function(t){return(t.mutationName&&t.mutationName!=='None')?'RISK':'';},none:function(t){return !t.mutationName||t.mutationName==='None';}}
];

function _info(hash){
  var t=window.hashToTraits?window.hashToTraits(hash):null;
  var tg=t&&window.getTerraGrade?window.getTerraGrade(t):null;
  var sea=t&&window.getSeasonInfo?window.getSeasonInfo(t):null;
  var ea=t&&window.computeEA?window.computeEA(t,0):0;
  var nm=typeof window.getPlantName==='function'?window.getPlantName(hash):hash.slice(0,8);
  return {t:t,tg:tg,sea:sea,ea:ea,nm:nm,season:t?t.season%4:0};
}

function _renderCard(el,plant,role,side){
  if(!el||!plant)return;
  var i=_info(plant.hash);
  var masked=plant._wildMasked;
  var s=masked?'':_seasonKeys[i.season];
  el.className='bs-cb '+s;
  var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(plant.hash,36);}catch(e){}
  var h='<div class="bs-role">'+role+'</div>';
  h+='<div class="bs-head"><div class="bs-thumb">'+svg+'</div><div style="flex:1;min-width:0;">';
  if(masked){
    h+='<div class="bs-name" style="color:var(--muted);">Wild Specimen</div>';
    h+='<div class="bs-meta"><span style="color:var(--muted);">??? Grade</span>';
    h+='<span style="color:var(--muted);">EA ???</span>';
    h+='<span style="color:var(--muted);">Season ???</span>';
    h+='<span style="color:var(--muted);">\ud83e\udde0 Mystery</span></div>';
  } else {
    var _bsNp = typeof buildNameplate === 'function' ? buildNameplate(plant.hash) : i.nm;
    h+='<div class="bs-name" style="color:'+(i.tg?i.tg.color:'var(--cream)')+';">'+_bsNp+'</div>';
    var _bs=window.FG_Data&&FG_Data.getBreedStatus?FG_Data.getBreedStatus(plant):null;
    var _bcLabel='',_bcColor='var(--muted)';
    if(_bs){
      if(_bs.reason==='IMMATURE'){_bcLabel='\ud83c\udf31 '+_bs.daysLeft+'d to mature';_bcColor='rgba(91,175,220,0.8)';}
      else if(_bs.reason==='COOLDOWN'){_bcLabel='\u23f3 '+_bs.cooldownDays+'d cooldown';_bcColor='rgba(200,168,75,0.8)';}
      else if(_bs.reason==='NO_CHARGES'){_bcLabel='\ud83d\udca4 Resting';_bcColor='rgba(192,112,112,0.8)';}
      else if(_bs.canBreed){_bcLabel='\ud83e\uddec '+_bs.charges+'/3';_bcColor='var(--sage)';}
    } else {
      var _bc=plant.breedCount||0;
      _bcLabel=_bc>=3?'\u26a1 SPENT':'\ud83e\uddec '+_bc+'/3';
      _bcColor=_bc>=3?'rgba(192,112,112,0.9)':'var(--muted)';
    }
    h+='<div class="bs-meta"><span style="color:'+(i.tg?i.tg.color:'var(--cream)')+';">'+(i.tg?i.tg.icon:'')+' '+(i.tg?i.tg.name:'')+'</span>';
    h+='<span style="color:'+(i.tg?i.tg.color:'var(--cream)')+';">EA '+i.ea+'</span>';
    h+='<span style="color:var(--muted);">'+_seasonEmblems[i.season]+' G'+(i.t?i.t.chimerGen||1:1)+'</span>';
    h+='<span style="color:'+_bcColor+';">'+_bcLabel+'</span></div>';
  }
  h+='</div></div>';
  // Layers
  if(i.t){
    _LAYERS.forEach(function(L){
      var val=L.get(i.t);
      var isRare=L.rare&&L.rare(i.t);
      var isMythic=L.mythic&&L.mythic(i.t);
      var isMut=L.mutation&&L.mutation(i.t);
      var isNone=L.none&&L.none(i.t);
      var isH=L.inherit&&!isNone;
      var tag=L.tag?L.tag(i.t):'';
      var rowCls=isH?' heritable':'';
      var valCls=isRare?' rare':isMythic?' mythic':isMut?' mutation':isNone?' none':'';
      var star=(isRare||isMythic||isMut)?'\u2605 ':'';
      var tagCls=tag==='DOM'?' tag-dom':tag==='MIX'?' tag-mix':tag==='RISK'?' tag-risk':'';
      var tagLabel=tag==='DOM'?'DOMINANT':tag==='MIX'?'BLENDS':tag==='RISK'?'RISKY':'';
      var tagH=tag?'<span class="bs-tag'+tagCls+'">'+tagLabel+'</span>':'';
      h+='<div class="bs-row'+rowCls+'"><span class="bs-cat">'+L.key+'</span><span class="bs-val'+valCls+'">'+star+val+tagH+'</span></div>';
    });
  }
  // Add inline nav arrows below each card
  if(side==='a'&&_allEligible.length>2&&_plantACtx!=='wild-other'){
    h+='<div class="bs-card-nav"><button class="bs-card-nav-btn" onclick="window.bsSwipeA(-1)">\u2039</button><span class="bs-card-nav-count">'+(_aIdx+1)+' / '+_allEligible.length+'</span><button class="bs-card-nav-btn" onclick="window.bsSwipeA(1)">\u203a</button></div>';
  }
  if(side==='b'&&_partners.length>1){
    h+='<div class="bs-card-nav"><button class="bs-card-nav-btn" onclick="window.bsSwipe(-1)">\u2039</button><span class="bs-card-nav-count">'+(_pIdx+1)+' / '+_partners.length+'</span><button class="bs-card-nav-btn" onclick="window.bsSwipe(1)">\u203a</button></div>';
  }
  el.innerHTML=h;
}

// Genetic compatibility score — how good is this pairing?
function _compatScore(tA, tB) {
  if (!tA || !tB) return 50;
  var score = 50; // base
  // Diversity bonus: different traits = better offspring variety
  if (tA.stem !== tB.stem) score += 5;
  if ((tA.leafType%71) !== (tB.leafType%71)) score += 5;
  if (tA.hasFlower !== tB.hasFlower || (tA.flower%71) !== (tB.flower%71)) score += 5;
  if (tA.aura !== tB.aura) score += 4;
  if ((tA.base%71) !== (tB.base%71)) score += 4;
  // Season diversity — different seasons = wider offspring possibilities
  if (tA.season !== tB.season) score += 6;
  // Rarity synergy — both rare in different layers = better
  var rareCountA = 0, rareCountB = 0;
  if (tA.pot === 15 || tA.mutationName !== 'None') rareCountA++;
  if (tA.hasFlower && (tA.flower%71) >= 34) rareCountA++;
  if (tB.pot === 15 || tB.mutationName !== 'None') rareCountB++;
  if (tB.hasFlower && (tB.flower%71) >= 34) rareCountB++;
  score += Math.min(rareCountA, 2) * 4 + Math.min(rareCountB, 2) * 4;
  // Penalty: same mutation = genetic similarity risk
  if (tA.mutationName !== 'None' && tA.mutationName === tB.mutationName) score -= 10;
  // Penalty: same mythic = collapse risk
  if (tA.mythicName !== 'None' && tA.mythicName === tB.mythicName) score -= 12;
  // Companion bonus — different companions = chance of rare offspring companion
  if (tA.companion !== tB.companion && tA.companion >= 20 && tB.companion >= 20) score += 5;
  return Math.max(10, Math.min(98, score));
}
function _compatLabel(score) {
  if (score >= 85) return {label:'EXCELLENT MATCH',color:'#8CB86E'};
  if (score >= 70) return {label:'GOOD PAIRING',color:'var(--sage)'};
  if (score >= 55) return {label:'COMPATIBLE',color:'var(--gold)'};
  if (score >= 40) return {label:'FAIR',color:'var(--muted)'};
  return {label:'LOW DIVERSITY',color:'#d8a0a0'};
}

function _renderForecast(){
  var fc=document.getElementById('bs-forecast');
  if(!fc||!_plantA||!_partners.length)return;
  var iA=_info(_plantA.hash);
  var iB=_info(_partners[_pIdx].hash);
  if(!iA.t||!iB.t){fc.innerHTML='';return;}

  // Genetic compatibility score
  var _cscore = _compatScore(iA.t, iB.t);
  var _clabel = _compatLabel(_cscore);

  // Simple forecast heuristics
  var eaA=iA.ea,eaB=iB.ea;
  var eaLow=Math.max(0,Math.min(eaA,eaB)-3);
  var eaHigh=Math.max(eaA,eaB)+3;
  var eaPct=Math.round(((eaLow+eaHigh)/2)/30*100);
  var rareCount=0;
  _LAYERS.forEach(function(L){if(L.rare&&(L.rare(iA.t)||L.rare(iB.t)))rareCount++;});
  var rarePct=Math.min(95,20+rareCount*12);
  var hasMut=(iA.t.mutationName&&iA.t.mutationName!=='None')||(iB.t.mutationName&&iB.t.mutationName!=='None');
  var mutPct=hasMut?25:5;
  var genA=iA.t.chimerGen||1,genB=iB.t.chimerGen||1;
  var offGen=Math.max(genA,genB)+1;
  // Season weights
  var sA=iA.season,sB=iB.season;
  var sw=[10,10,10,10];sw[sA]+=30;sw[sB]+=30;
  var swTotal=sw[0]+sw[1]+sw[2]+sw[3];

  // Compatibility score banner
  var h='<div class="bs-compat"><div class="bs-compat-score" style="color:'+_clabel.color+';">'+_cscore+'% — '+_clabel.label+'</div><div class="bs-compat-label">Genetic diversity · Trait synergy · Rarity overlap</div></div>';
  h+='<div class="bs-fc-title">\ud83c\udf31 OFFSPRING FORECAST</div>';
  h+='<div class="bs-meter"><div class="bs-ml">EA Range</div><div class="bs-mt"><div class="bs-mf gold" style="width:'+eaPct+'%"></div></div><div class="bs-mv gold">'+eaLow+' — '+eaHigh+'</div></div>';
  h+='<div class="bs-meter"><div class="bs-ml">Rare+</div><div class="bs-mt"><div class="bs-mf gold" style="width:'+rarePct+'%"></div></div><div class="bs-mv gold">'+rarePct+'%</div></div>';
  h+='<div class="bs-meter"><div class="bs-ml">Mutation</div><div class="bs-mt"><div class="bs-mf warn" style="width:'+mutPct+'%"></div></div><div class="bs-mv warn">'+mutPct+'%</div></div>';
  h+='<div class="bs-meter"><div class="bs-ml">Chimera</div><div class="bs-mt"><div class="bs-mf warn" style="width:100%"></div></div><div class="bs-mv warn">Gen '+offGen+'</div></div>';
  h+='<div class="bs-seasons"><div class="bs-ml">Season</div>';
  for(var si=0;si<4;si++){
    var pct=Math.round(sw[si]/swTotal*100);
    h+='<span class="bs-sc'+(pct>=30?' hot':'')+'">'+_seasonEmblems[si]+' '+pct+'%</span>';
  }
  h+='</div>';
  h+='<div class="bs-chimera">\ud83e\uddec <span>Gen '+offGen+' Chimera — <b>-'+(offGen-1)*2+' EA</b> but <b>2× climate immunity</b>.</span></div>';
  // Monte Carlo simulation forecast
  if(window.breedingForecast&&_plantA&&_partners[_pIdx]){
    var _fc=breedingForecast(_plantA.hash,_partners[_pIdx].hash);
    if(_fc){
      h+='<div style="margin-top:0.4rem;padding:0.4rem;background:rgba(18,22,16,0.5);border:1px solid rgba(200,168,75,0.1);border-radius:6px;">';
      h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.42rem;color:var(--gold);letter-spacing:0.08em;margin-bottom:0.2rem;">SIMULATION (20 offspring)</div>';
      // Grade breakdown bar
      h+='<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:0.2rem;">';
      var _gcColors={Common:'rgba(138,145,120,0.6)',Uncommon:'rgba(122,179,86,0.7)',Rare:'rgba(91,175,220,0.8)',Epic:'rgba(153,89,182,0.8)',Legendary:'rgba(200,168,75,0.8)',Mythic:'rgba(232,160,191,0.8)',Cosmic:'rgba(255,110,199,0.9)'};
      var _gOrder=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Cosmic'];
      for(var _gi=0;_gi<_gOrder.length;_gi++){
        var _gPct=_fc.grades[_gOrder[_gi]]||0;
        if(_gPct>0)h+='<div style="width:'+_gPct+'%;background:'+_gcColors[_gOrder[_gi]]+';"></div>';
      }
      h+='</div>';
      // Grade labels
      h+='<div style="display:flex;flex-wrap:wrap;gap:4px;font-family:DM Mono,monospace;font-size:0.28rem;">';
      for(var _gl=0;_gl<_gOrder.length;_gl++){
        var _glPct=_fc.grades[_gOrder[_gl]]||0;
        if(_glPct>0)h+='<span style="color:'+_gcColors[_gOrder[_gl]]+';">'+_gOrder[_gl]+' '+_glPct+'%</span>';
      }
      h+='</div>';
      // EA + mutation + flower
      h+='<div style="font-family:DM Mono,monospace;font-size:0.3rem;color:var(--muted);margin-top:0.15rem;">';
      h+='EA '+_fc.eaRange[0]+'-'+_fc.eaRange[1]+' · '+_fc.mutationChance+'% mutation · '+_fc.flowerChance+'% bloom';
      h+='</div></div>';
    }
  }

  // Inbreeding depression warning
  var _mutA = iA.t.mutationName || 'None';
  var _mutB = iB.t.mutationName || 'None';
  var _mythA = iA.t.mythicName || 'None';
  var _mythB = iB.t.mythicName || 'None';
  var _sameMut = _mutA !== 'None' && _mutA === _mutB;
  var _sameMythic = _mythA !== 'None' && _mythA === _mythB;

  if (_sameMut && _sameMythic) {
    h += '<div style="margin-top:0.4rem;padding:0.4rem;background:rgba(192,60,60,0.12);border:1px solid rgba(192,60,60,0.3);border-radius:6px;font-size:0.4rem;color:rgba(192,112,112,0.95);line-height:1.6;">';
    h += '<b>⚠ GENETIC COLLAPSE</b><br>';
    h += 'Both parents share <b>' + _mutA + '</b> mutation AND <b>' + _mythA + '</b> mythic.<br>';
    h += 'Offspring has <b>0% chance</b> of inheriting either trait.';
    h += '</div>';
  } else if (_sameMythic) {
    h += '<div style="margin-top:0.4rem;padding:0.4rem;background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.25);border-radius:6px;font-size:0.4rem;color:var(--gold);line-height:1.6;">';
    h += '<b>⚠ GENETIC SIMILARITY</b><br>';
    h += 'Both parents have <b>' + _mythA + '</b>.<br>';
    h += '~70% chance offspring loses this mythic. Consider a genetically distant partner.';
    h += '</div>';
  } else if (_sameMut) {
    h += '<div style="margin-top:0.4rem;padding:0.4rem;background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.25);border-radius:6px;font-size:0.4rem;color:var(--gold);line-height:1.6;">';
    h += '<b>⚠ GENETIC SIMILARITY</b><br>';
    h += 'Both parents have <b>' + _mutA + '</b> mutation.<br>';
    h += '~70% chance offspring loses this mutation. Consider a genetically distant partner.';
    h += '</div>';
  }

  // ── Layer forecast with qualitative labels ──────────────────────
  var _layerChecks = [
    { name: 'Chimera Vein', ok: iA.t.leafColors[0] !== iB.t.leafColors[0], prob: 0.60, terra: '+1' },
    { name: 'Vigor Band', ok: Math.abs(iA.t.stemHeight - iB.t.stemHeight) >= 10, prob: 0.20, terra: '+1' },
    { name: 'Pollen Dusting', ok: iA.t.hasFlower && iB.t.hasFlower, prob: 0.35, terra: '—' },
    { name: 'Root Tendrils', ok: Math.abs((iA.t.stem % 15) - (iB.t.stem % 15)) >= 3, prob: 0.25, terra: '+1' },
    { name: 'Spectrum Leaf', ok: (function() { var c={}; iA.t.leafColors.forEach(function(x){c[x]=1}); iB.t.leafColors.forEach(function(x){c[x]=1}); return Object.keys(c).length>=4; })(), prob: 0.15, terra: '+2' },
    { name: 'Canopy Weave', ok: iA.t.leafCount >= 4 && iB.t.leafCount >= 4, prob: 0.20, terra: '+1' },
    { name: 'Thorned Crown', ok: ((iA.t.base%30===16)&&iB.t.leafCount>=5)||((iB.t.base%30===16)&&iA.t.leafCount>=5), prob: 0.40, terra: '+2' },
    { name: 'Mammoth Guard', ok: ((iA.t.companion===34)||(iB.t.companion===34))&&Math.abs(iA.t.leafSize-iB.t.leafSize)>3, prob: 0.30, terra: '+2' },
    { name: 'Aerial Root', ok: ((iA.t.pot===4)&&iB.t.stemHeight>40)||((iB.t.pot===4)&&iA.t.stemHeight>40), prob: 0.15, terra: '+1' }
  ];

  var eligibleLayers = _layerChecks.filter(function(l) { return l.ok; });
  if (eligibleLayers.length > 0) {
    h += '<div style="margin-top:0.35rem;padding:0.3rem;background:rgba(13,16,12,0.35);border-radius:6px;border:1px solid rgba(74,124,53,0.08);">';
    h += '<div style="font-family:Bebas Neue,sans-serif;font-size:0.36rem;letter-spacing:0.1em;color:var(--muted);margin-bottom:0.15rem;">POSSIBLE LAYERS</div>';
    eligibleLayers.forEach(function(l) {
      var label, color;
      if (l.prob >= 0.50) { label = 'LIKELY'; color = 'var(--sage)'; }
      else if (l.prob >= 0.20) { label = 'POSSIBLE'; color = 'var(--gold)'; }
      else { label = 'RARE'; color = 'rgba(192,112,112,0.8)'; }
      h += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.35rem;margin:2px 0;">';
      h += '<span style="color:var(--cream);">' + l.name + ' <span style="color:var(--muted);font-size:0.3rem;">' + l.terra + ' Terra</span></span>';
      h += '<span style="font-family:Bebas Neue,sans-serif;font-size:0.32rem;letter-spacing:0.06em;color:' + color + ';">' + label + ' ✓</span>';
      h += '</div>';
    });
    h += '</div>';
  }

  // Tag legend — help players understand inheritance
  h+='<div style="margin-top:0.4rem;padding:0.3rem;background:rgba(13,16,12,0.3);border-radius:6px;border:1px solid rgba(74,124,53,0.06);">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.4rem;color:var(--muted);letter-spacing:0.1em;margin-bottom:0.2rem;">INHERITANCE GUIDE</div>';
  h+='<div style="display:flex;gap:0.3rem;flex-wrap:wrap;">';
  h+='<div style="font-size:0.32rem;color:var(--sage);"><span class="bs-tag tag-dom">DOMINANT</span> Likely passes to offspring</div>';
  h+='<div style="font-size:0.32rem;color:var(--gold);"><span class="bs-tag tag-mix">BLENDS</span> Mixes traits from both parents</div>';
  h+='<div style="font-size:0.32rem;color:#d8a0a0;"><span class="bs-tag tag-risk">RISKY</span> Unpredictable — may mutate or vanish</div>';
  h+='</div></div>';
  fc.innerHTML=h;
}

window.openBreedScreen=function(plantA,context){
  _plantACtx=context||'greenhouse';
  if(window.PW_Tutorial)PW_Tutorial.checkBreed();
  // Build full eligible list from greenhouse
  var gh=[];
  try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  // Filter eligible: must have charges AND pass cooldown/maturity
  _allEligible=gh.filter(function(p){
    if(window.FG_Data&&FG_Data.getBreedStatus){
      var bs=FG_Data.getBreedStatus(p);
      return bs.canBreed;
    }
    return (p.breedCount||0)<3; // Legacy fallback
  });

  // Wild-other: wild plant is locked on side A, greenhouse plants are partners
  if(_plantACtx==='wild-other'){
    if(_allEligible.length<1){
      if(window._toast)window._toast('No plants ready to breed. Check cooldowns and maturity.');
      return;
    }
    _plantA=plantA; // wild plant object (has _wildMasked flag)
    _partners=_allEligible;
    _pIdx=0;
    _aIdx=-1; // not in eligible list
    _renderBreedCards();
    var _bsEl=document.getElementById('breed-screen');if(_bsEl)_bsEl.classList.add('open');
    return;
  }

  if(_allEligible.length<2){
    // Give helpful message about WHY
    var immature=gh.filter(function(p){if(!FG_Data||!FG_Data.getBreedStatus)return false;var bs=FG_Data.getBreedStatus(p);return bs.reason==='IMMATURE';});
    var cooling=gh.filter(function(p){if(!FG_Data||!FG_Data.getBreedStatus)return false;var bs=FG_Data.getBreedStatus(p);return bs.reason==='COOLDOWN';});
    var resting=gh.filter(function(p){if(!FG_Data||!FG_Data.getBreedStatus)return false;var bs=FG_Data.getBreedStatus(p);return bs.reason==='NO_CHARGES';});
    var msg='Need 2 plants ready to breed.';
    if(immature.length)msg+=' '+immature.length+' still maturing.';
    if(cooling.length)msg+=' '+cooling.length+' on cooldown.';
    if(resting.length)msg+=' '+resting.length+' recovering charges.';
    if(window._toast)window._toast(msg);
    return;
  }
  // Find plantA in eligible list, default to first
  _aIdx=0;
  for(var i=0;i<_allEligible.length;i++){if(_allEligible[i].hash===plantA.hash){_aIdx=i;break;}}
  _plantA=_allEligible[_aIdx];
  // Build partner list excluding plantA
  _partners=_allEligible.filter(function(p){return p.hash!==_plantA.hash;});
  _pIdx=0;
  _renderBreedCards();
  var _bsEl=document.getElementById('breed-screen');if(_bsEl)_bsEl.classList.add('open');
};

function _renderBreedCards(){
  var isWild=_plantACtx==='wild-other';
  _renderCard(document.getElementById('bs-card-a'),_plantA,isWild?'WILD SPECIMEN (LOCKED)':'PLANT A','a');
  _renderCard(document.getElementById('bs-card-b'),_partners[_pIdx],isWild?'YOUR PLANT':'PLANT B','b');
  _renderForecast();
}

window.closeBreedScreen=function(){
  var _bsEl2=document.getElementById('breed-screen');if(_bsEl2)_bsEl2.classList.remove('open');
  _plantA=null;_partners=[];
};

window.bsSwipe=function(dir){
  if(!_partners.length)return;
  _pIdx=(_pIdx+dir+_partners.length)%_partners.length;
  var cardB=document.getElementById('bs-card-b');
  cardB.style.opacity='0';
  cardB.style.transform=dir>0?'translateX(10px)':'translateX(-10px)';
  setTimeout(function(){
    _renderCard(cardB,_partners[_pIdx],'PLANT B','b');
    _renderForecast();
    cardB.style.opacity='1';
    cardB.style.transform='translateX(0)';
  },140);
};

window.bsSwipeA=function(dir){
  if(_allEligible.length<3)return; // need at least 3 so both sides have options
  _aIdx=(_aIdx+dir+_allEligible.length)%_allEligible.length;
  _plantA=_allEligible[_aIdx];
  // Rebuild partner list excluding new plantA
  _partners=_allEligible.filter(function(p){return p.hash!==_plantA.hash;});
  if(_pIdx>=_partners.length)_pIdx=0;
  var cardA=document.getElementById('bs-card-a');
  cardA.style.opacity='0';
  cardA.style.transform=dir>0?'translateX(10px)':'translateX(-10px)';
  setTimeout(function(){
    _renderBreedCards();
    cardA.style.opacity='1';
    cardA.style.transform='translateX(0)';
  },140);
};

window.bsConfirmBreed=function(){
  if(!_plantA||!_partners[_pIdx])return;
  var iA=_info(_plantA.hash);
  var iB=_info(_partners[_pIdx].hash);
  var genA=(iA.t?iA.t.chimerGen:1)||1;
  var genB=(iB.t?iB.t.chimerGen:1)||1;
  var offGen=Math.max(genA,genB)+1;
  var txt='Cross <b>'+iA.nm+'</b> with <b>'+iB.nm+'</b>?<br><br>';
  txt+='Offspring will be a <b>Gen '+offGen+' Chimera</b> with -'+(offGen-1)*2+' EA but 2× climate immunity.<br><br>';
  txt+='The seed goes to your Nursery. Water it 3 days to bloom.';
  var _bctEl=document.getElementById('bs-confirm-text');if(_bctEl)_bctEl.innerHTML=txt;
  var _bcEl=document.getElementById('bs-confirm');if(_bcEl)_bcEl.classList.add('open');
};

window.bsExecuteBreed=function(){
  var _bcEl2=document.getElementById('bs-confirm');if(_bcEl2)_bcEl2.classList.remove('open');
  if(!_plantA||!_partners[_pIdx])return;
  var mate=_partners[_pIdx];

  // Use Wild IIFE _doCrossPollination only for own wild plants
  // wild-other (non-owned) uses greenhouse path since the plant isn't in user's collection
  if(_plantACtx==='wild'&&typeof _doCrossPollination==='function'){
    _doCrossPollination(_plantA,mate);
  } else {
    // Greenhouse context — use FG_Data.crossPollinateHashes (SHA-256 + Mendelian)
    if(window.FG_Data&&window.FG_Data.crossPollinateHashes){
      var _bsA=_plantA,_bsM=mate;
      window.closeBreedScreen();
      if(window._toast)window._toast('🧬 Cross-pollinating…');
      FG_Data.crossPollinateHashes(_bsA.hash,_bsM.hash).then(function(result){
        var offHash=result.childHash;
        // Compute generation from parent plants (not from nonce which is pollination counter)
        var _genA=1,_genB=1;
        try{var _genGh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');
          _genGh.forEach(function(p){if(p.hash===_bsA.hash)_genA=p.generation||1;if(p.hash===_bsM.hash)_genB=p.generation||1;});
        }catch(e){}
        var offGen=Math.max(_genA,_genB)+1;
        if(window.FG_Data&&window.FG_Data.addSeed){
          var res=window.FG_Data.addSeed({seedHash:offHash,parentAHash:_bsA.hash,parentBHash:_bsM.hash,nonce:offGen});
          if(!res.ok){if(window._toast)window._toast('Nursery full. Bloom or abandon a seed first.');return;}
        }
        // Use breed charges on both parents (handles cooldown, charges, breedCount)
        if(window.FG_Data&&FG_Data.useBreedCharge){
          FG_Data.useBreedCharge(_bsA.hash);
          FG_Data.useBreedCharge(_bsM.hash);
        } else {
          // Legacy fallback
          var _raw=window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse');
          var _bcGh2=[];try{_bcGh2=JSON.parse(_raw||'[]');}catch(e){}
          _bcGh2.forEach(function(p){
            if(p.hash===_bsA.hash||p.hash===_bsM.hash){p.breedCount=(p.breedCount||0)+1;}
          });
          if(window.saveGreenhouse)saveGreenhouse(_bcGh2);
        }
        localStorage.setItem('lw_first_breed','1');
        if(window.renderNursery)renderNursery();
        if(window.switchTab)switchTab('nursery');
        if(window._toast)window._toast('🌱 Seed planted! Water 3 days to bloom.');
        if(window.PW_grantXP)PW_grantXP(5,'cross_pollinate');
        if(window.LW_Log)window.LW_Log.write('plant_bred',{
          parentAHash:_bsA.hash,parentBHash:_bsM.hash,seedHash:offHash,
          parentAName:(window.getPlantName?getPlantName(_bsA.hash):''),
          parentBName:(window.getPlantName?getPlantName(_bsM.hash):''),
          generation:offGen
        });
        if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
      }).catch(function(e){
        console.error('[Breed] crossPollinateHashes failed:', e);
        if(window._toast)window._toast('Breeding failed: ' + (e.message||'unknown error'));
      });
    } else {
      // Fallback: no FG_Data available
      if(window._toast)window._toast('Breeding engine not loaded. Try again.');
      window.closeBreedScreen();
    }
  }
  // closeBreedScreen called above before async — don't call again here
};
})();

(function(){
'use strict';
// Predict offspring trait ranges from two parent hashes
window.breedingForecast=function(hashA,hashB){
  if(!hashA||!hashB||!window.hashToTraits)return null;
  var tA=hashToTraits(hashA),tB=hashToTraits(hashB);
  if(!tA||!tB)return null;

  // Simulate 20 potential offspring to build probability ranges
  var results={grades:{},seasons:{},companions:{},mutations:0,eaRange:[99,0],hasFlower:0};
  for(var sim=0;sim<20;sim++){
    // Quick offspring hash simulation
    var offHash='';
    for(var i=0;i<64;i++){
      var a=parseInt(hashA[i]||'0',16),b=parseInt(hashB[i]||'0',16);
      var seed=(a^b^(sim*13+i*7))%16;
      offHash+=seed.toString(16);
    }
    var ot=hashToTraits(offHash);
    var og=window.getTerraGrade?getTerraGrade(ot):{name:'Common'};
    var oea=window.computeEA?computeEA(ot,0):0;
    results.grades[og.name]=(results.grades[og.name]||0)+1;
    results.seasons[ot.season]=(results.seasons[ot.season]||0)+1;
    if(ot.companion>=20)results.companions[ot.companion]=(results.companions[ot.companion]||0)+1;
    if(ot.mutationName&&ot.mutationName!=='None')results.mutations++;
    if(ot.hasFlower)results.hasFlower++;
    if(oea<results.eaRange[0])results.eaRange[0]=oea;
    if(oea>results.eaRange[1])results.eaRange[1]=oea;
  }

  // Convert to percentages
  var gradesPct={};
  var gradeOrder=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Cosmic'];
  for(var g=0;g<gradeOrder.length;g++){
    if(results.grades[gradeOrder[g]])gradesPct[gradeOrder[g]]=Math.round(results.grades[gradeOrder[g]]/20*100);
  }

  return{
    grades:gradesPct,
    eaRange:results.eaRange,
    mutationChance:Math.round(results.mutations/20*100),
    flowerChance:Math.round(results.hasFlower/20*100),
    seasonSpread:results.seasons,
    companionChance:Object.keys(results.companions).length>0?Math.round(Object.keys(results.companions).length/20*100):0
  };
};
})();

(function(){
'use strict';
window._toggleTerritory=function(){
  var panel=document.getElementById('w-territory');
  if(!panel)return;
  if(panel.style.display==='none'||!panel.style.display){
    _populateTerritory();
    panel.style.display='block';
  }else{panel.style.display='none';}
};

function _populateTerritory(){
  var el=document.getElementById('w-territory-stats');if(!el)return;
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var events=[];try{events=JSON.parse(localStorage.getItem('lw_wild_events')||'[]');}catch(e){}
  var meshLinks=[];try{meshLinks=JSON.parse(localStorage.getItem('lw_mesh_links')||'[]');}catch(e){}
  var commons=[];try{commons=JSON.parse(localStorage.getItem('lw_commons')||'[]');}catch(e){}
  var pollen=0;try{pollen=parseInt(localStorage.getItem('fg_pollen')||'0');}catch(e){}

  // Count offspring from events
  var birthCount=events.filter(function(e){return e.type==='birth';}).length;
  var spreadCount=events.filter(function(e){return e.type==='spread';}).length;
  // Seasons in wild
  var wildSeasons={};
  wild.forEach(function(p){try{var t=window.hashToTraits?window.hashToTraits(p.hash):null;if(t)wildSeasons[t.season]=true;}catch(e){}});
  // Highest EA in wild
  var maxEA=0;wild.forEach(function(p){if((p.ea||0)>maxEA)maxEA=p.ea||0;});
  // Active mesh links
  var activeMesh=meshLinks.filter(function(l){return l.stage>=1;}).length;
  // Biome
  var biome=window._lastDetectedBiome||'unknown';
  var biomeInfo=window.getBiomeInfo?window.getBiomeInfo(biome):{icon:'?',name:'Scanning'};

  function _stat(icon,val,label,color){
    return'<div style="padding:4px;background:rgba(18,22,16,0.5);border:1px solid rgba(74,124,53,0.08);border-radius:6px;">'
      +'<div style="font-size:0.55rem;">'+icon+'</div>'
      +'<div style="font-size:0.45rem;color:'+(color||'var(--cream)')+';font-weight:700;">'+val+'</div>'
      +'<div style="font-size:0.25rem;color:var(--muted);">'+label+'</div></div>';
  }

  el.innerHTML=
    _stat('🌱',wild.length,'planted','var(--sage)')+
    _stat('🧬',birthCount,'offspring','var(--gold)')+
    _stat('🌿',spreadCount,'spread','rgba(122,179,86,0.9)')+
    _stat('⚡',maxEA,'peak EA','var(--cream)')+
    _stat('🍄',activeMesh,'mesh links','var(--sage)')+
    _stat('🌳',commons.length,'commons','var(--gold)')+
    _stat(Object.keys(wildSeasons).length+'/4','','seasons','rgba(200,168,75,0.8)')+
    _stat('🌸',pollen,'pollen','var(--gold)')+
    _stat(biomeInfo.icon,biomeInfo.name,'biome',biomeInfo.color||'var(--muted)');
  // Territory influence
  var _ti=window.getTerritoryInfluence?getTerritoryInfluence():{score:0,tier:'Seedling'};
  el.innerHTML+=_stat('🏆',_ti.score,'influence','var(--gold)')+
    _stat('📜',_ti.tier,'rank','var(--cream)');
}
})();

(function(){
'use strict';
// Scale definitions — each mode has a character
var SCALES={
  lydian:    [0,2,4,6,7,9,11],  // bright, dreamy (Spring)
  ionian:    [0,2,4,5,7,9,11],  // happy, stable
  mixolydian:[0,2,4,5,7,9,10],  // warm, bluesy (Summer)
  dorian:    [0,2,3,5,7,9,10],  // mellow, sophisticated (Autumn)
  aeolian:   [0,2,3,5,7,8,10],  // dark, natural minor (Winter)
  phrygian:  [0,1,3,5,7,8,10],  // exotic, tense
  pentatonic:[0,2,4,7,9]         // universal, always sounds good
};

var ROOT_NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var SEASON_MODES=['lydian','mixolydian','dorian','aeolian'];
var ARPEGGIO_PATTERNS=[
  [0,2,4],      // triad up
  [4,2,0],      // triad down
  [0,2,4,2],    // triad bounce
  [0,4,2,4],    // skip pattern
  [0,2,4,7],    // extended
  [0,1,2,4],    // chromatic approach
  [0,4,7,4],    // wide bounce
  [0,2,4,5,7]   // scalar run
];

window.getPlantSong=function(hash){
  if(!hash||hash.length<32)return null;
  // Helper: get byte value from hash position
  function hb(pos){return parseInt(hash.slice(pos*2,pos*2+2),16)||0;}

  var traits=window.hashToTraits?window.hashToTraits(hash):null;
  var season=traits?traits.season:0;
  var ea=0;try{ea=window.computeEA?window.computeEA(traits,0):0;}catch(e){}

  // Root note from byte 0 (12 options)
  var rootIdx=hb(0)%12;
  var root=ROOT_NOTES[rootIdx];
  var rootMidi=48+rootIdx; // Middle C octave

  // Mode from season (primary) + byte 1 (variation)
  var modeKey=SEASON_MODES[season];
  // 20% chance of modal interchange based on byte 1
  if(hb(1)%5===0){
    var altModes=['pentatonic','phrygian','ionian'];
    modeKey=altModes[hb(1)%3];
  }
  var scale=SCALES[modeKey];

  // Tempo from byte 2 (60-140 BPM range)
  var tempo=60+Math.round(hb(2)/255*80);
  // Swing from byte 3 (0-0.3)
  var swing=Math.round((hb(3)/255)*30)/100;

  // Arpeggio pattern from byte 4
  var arpPattern=ARPEGGIO_PATTERNS[hb(4)%ARPEGGIO_PATTERNS.length];

  // Note density from EA (higher EA = more embellishment)
  var density=Math.min(1,ea/20); // 0-1 range

  // Filter settings from mutation
  var filterCutoff=2000+hb(5)*20; // 2000-7100 Hz
  var filterResonance=0.5+hb(6)/255*4; // 0.5-4.5 Q
  var mutName=traits?traits.mutationName:'None';
  if(mutName==='Glitch'){filterCutoff=800;filterResonance=8;} // bitcrushed
  if(mutName==='Glass Stem'){filterCutoff=6000;filterResonance=6;} // high resonance
  if(mutName==='Wireframe'){filterCutoff=1200;filterResonance=1;} // dark

  // LFO from byte 7
  var lfoRate=0.5+hb(7)/255*4; // 0.5-4.5 Hz
  var lfoDepth=hb(8)/255*0.4; // 0-0.4

  // Octave range from stem height
  var octave=traits&&traits.stemHeight>35?5:traits&&traits.stemHeight>25?4:3;

  // Companion percussion
  var hasPercussion=traits&&traits.companion>=20;
  var percPattern=hasPercussion?hb(9)%8:0;

  return{
    root:root, rootMidi:rootMidi, mode:modeKey, scale:scale,
    tempo:tempo, swing:swing, octave:octave,
    arpPattern:arpPattern, density:density,
    filter:{cutoff:filterCutoff,resonance:filterResonance},
    lfo:{rate:lfoRate,depth:lfoDepth},
    percussion:{active:hasPercussion,pattern:percPattern},
    season:season, ea:ea, mutation:mutName
  };
};
})();

(function(){
'use strict';
function _updateBadge() {
  if (!navigator.setAppBadge) return;
  try {
    var nur = JSON.parse(localStorage.getItem('sws_nursery') || '[]');
    var today = new Date().toISOString().split('T')[0];
    var needsWater = 0;
    for (var i = 0; i < nur.length; i++) {
      if (nur[i].status === 'growing' && nur[i].waterLog && nur[i].waterLog.indexOf(today) === -1) needsWater++;
    }
    if (needsWater > 0) navigator.setAppBadge(needsWater);
    else navigator.clearAppBadge();
  } catch(e) {}
}
// Update on load and every 30 minutes
setTimeout(_updateBadge, 5000);
setInterval(_updateBadge, 1800000);
window._updateBadge = _updateBadge;
})();

(function(){
'use strict';
var _wakeLock=null;
window._requestWakeLock=function(){
  if(!('wakeLock' in navigator))return;
  navigator.wakeLock.request('screen').then(function(wl){_wakeLock=wl;}).catch(function(){});
};
window._releaseWakeLock=function(){
  if(_wakeLock){_wakeLock.release().catch(function(){});_wakeLock=null;}
};
// Re-acquire on page visibility change (browser releases on tab switch)
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&_wakeLock===null){
    // Only re-acquire if we're on wild tab
    var wildPanel=document.getElementById('panel-wild');
    if(wildPanel&&wildPanel.classList.contains('active'))window._requestWakeLock();
  }
});
})();

(function(){
'use strict';
var BIOME_KEY='lw_biome_cache';
var BIOMES={
  wetland:  {name:'Wetland',   icon:'🌊', color:'#5BA0C4', rarityBoost:0.08, spawnMod:1.0, mutation:'Root Rot Resistance'},
  riverside:{name:'Riverside', icon:'🏞️', color:'#6BAFB2', rarityBoost:0.04, spawnMod:1.3, mutation:'Driftwood Stem'},
  coastal:  {name:'Coastal',   icon:'🏖️', color:'#A0C4E8', rarityBoost:0.03, spawnMod:0.8, mutation:'Salt Crystal'},
  forest:   {name:'Forest',    icon:'🌲', color:'#4A7C35', rarityBoost:0.05, spawnMod:1.2, mutation:'Moss Veil'},
  mountain: {name:'Mountain',  icon:'⛰️', color:'#8A9178', rarityBoost:0.10, spawnMod:0.6, mutation:'Alpine Frost'},
  desert:   {name:'Desert',    icon:'🏜️', color:'#D4A843', rarityBoost:0.12, spawnMod:0.4, mutation:'Thorn Crown'},
  farmland: {name:'Farmland',  icon:'🌾', color:'#A0A060', rarityBoost:0,    spawnMod:1.5, mutation:null},
  garden:   {name:'Garden',    icon:'🌷', color:'#E8A0BF', rarityBoost:0.02, spawnMod:1.4, mutation:'Cultivar Bloom'},
  park:     {name:'Urban Park',icon:'🌳', color:'#7AB356', rarityBoost:0.01, spawnMod:1.0, mutation:null},
  suburban: {name:'Suburban',  icon:'🏡', color:'#8A9178', rarityBoost:0,    spawnMod:0.8, mutation:null}
};

function _loadCache(){try{return JSON.parse(localStorage.getItem(BIOME_KEY)||'{}');}catch(e){return{};}}
function _saveCache(c){localStorage.setItem(BIOME_KEY,JSON.stringify(c));}

// Detect biome from OSM Overpass API
function detectBiome(lat,lng,callback){
  // Check cache first (keyed by ~1km grid)
  var cacheKey=Math.round(lat*100)/100+','+Math.round(lng*100)/100;
  var cache=_loadCache();
  if(cache[cacheKey]&&(Date.now()-cache[cacheKey].ts)<2592000000){// 30 day TTL
    callback(cache[cacheKey].biome);return;
  }

  // Query Overpass API for nearby features
  var query='[out:json][timeout:10];(node["natural"](around:500,'+lat+','+lng+');node["leisure"](around:500,'+lat+','+lng+');node["landuse"](around:500,'+lat+','+lng+');way["natural"](around:500,'+lat+','+lng+');way["leisure"](around:500,'+lat+','+lng+');way["landuse"](around:500,'+lat+','+lng+'););out tags;';

  fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(query)})
  .then(function(r){return r.json();})
  .then(function(data){
    var tags={water:0,wetland:0,wood:0,park:0,garden:0,farmland:0,beach:0};
    var elements=data.elements||[];
    for(var i=0;i<elements.length;i++){
      var t=elements[i].tags||{};
      if(t.natural==='water'||t.natural==='wetland')tags.water++;
      if(t.natural==='wetland')tags.wetland++;
      if(t.natural==='wood'||t.landuse==='forest')tags.wood++;
      if(t.leisure==='park')tags.park++;
      if(t.leisure==='garden')tags.garden++;
      if(t.landuse==='farmland')tags.farmland++;
      if(t.natural==='beach'||t.natural==='coastline')tags.beach++;
    }

    // Priority classification
    var biome='suburban';
    if(tags.wetland>0)biome='wetland';
    else if(tags.water>0&&tags.beach>0)biome='coastal';
    else if(tags.water>1)biome='riverside';
    else if(tags.wood>2)biome='forest';
    else if(tags.farmland>0)biome='farmland';
    else if(tags.garden>0)biome='garden';
    else if(tags.park>0)biome='park';

    // Cache result
    cache[cacheKey]={biome:biome,ts:Date.now()};
    _saveCache(cache);
    callback(biome);
  })
  .catch(function(){
    // Offline fallback — use weather to guess
    callback('suburban');
  });
}

// Get biome info object
function getBiomeInfo(biomeKey){
  return BIOMES[biomeKey]||BIOMES.suburban;
}

// Get current player biome (cached)
function getCurrentBiome(callback){
  var cache=_loadCache();
  var lastKey=cache._lastBiome;
  if(lastKey&&BIOMES[lastKey]){callback(lastKey);return;}
  // Need GPS
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(pos){
      detectBiome(pos.coords.latitude,pos.coords.longitude,function(b){
        cache._lastBiome=b;_saveCache(cache);
        callback(b);
      });
    },function(){callback('suburban');});
  }else{callback('suburban');}
}

// ── iNATURALIST BIODIVERSITY SCORING ──
// Real plant observations near player affect feral rarity
var FERTILITY_KEY='lw_fertility_cache';
function checkBiodiversity(lat,lng,callback){
  var fCache={};try{fCache=JSON.parse(localStorage.getItem(FERTILITY_KEY)||'{}');}catch(e){}
  var fKey=Math.round(lat*100)/100+','+Math.round(lng*100)/100;
  if(fCache[fKey]&&(Date.now()-fCache[fKey].ts)<604800000){callback(fCache[fKey]);return;} // 7 day TTL

  var url='https://api.inaturalist.org/v1/observations/species_counts?lat='+lat.toFixed(4)+'&lng='+lng.toFixed(4)+'&radius=1&taxon_id=47126&quality_grade=research&per_page=1';
  fetch(url).then(function(r){return r.json();}).then(function(data){
    var count=data.total_results||0;
    var tier='barren';
    if(count>=61)tier='hotspot';
    else if(count>=31)tier='fertile';
    else if(count>=11)tier='moderate';
    var result={species:count,tier:tier,ts:Date.now()};
    fCache[fKey]=result;
    localStorage.setItem(FERTILITY_KEY,JSON.stringify(fCache));
    callback(result);
  }).catch(function(){callback({species:0,tier:'barren',ts:Date.now()});});
}

// Expose
window.detectBiome=detectBiome;
window.getBiomeInfo=getBiomeInfo;
window.getCurrentBiome=getCurrentBiome;
window.checkBiodiversity=checkBiodiversity;
window.BIOMES=BIOMES;
})();

(function(){
'use strict';
var CHORUS_KEY='lw_chorus_data';
var CLUSTER_DIST=0.002; // ~200m

// Extract hue (0-360) from hex color string
function _hexToHue(hex){
  if(!hex||hex.length<6)return 0;
  hex=hex.replace('#','');
  var r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;
  var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,h=0;
  if(d===0)return 0;
  if(max===r)h=((g-b)/d)%6;
  else if(max===g)h=(b-r)/d+2;
  else h=(r-g)/d+4;
  h=Math.round(h*60);if(h<0)h+=360;
  return h;
}

function _hueDiff(h1,h2){var d=Math.abs(h1-h2);return d>180?360-d:d;}

function evaluateBloomChorus(){
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var shared=[];
  if(window._sharedMarkers){var keys=Object.keys(window._sharedMarkers);for(var i=0;i<keys.length;i++){var e=window._sharedMarkers[keys[i]];if(e&&e.data)shared.push(e.data);}}
  var allPlants=wild.concat(shared);

  // Filter to blooming plants only
  var blooming=[];
  for(var bi=0;bi<allPlants.length;bi++){
    var p=allPlants[bi];if(!p.lat||!p.hash)continue;
    var t=null;try{t=window.hashToTraits?window.hashToTraits(p.hash):null;}catch(e){}
    if(t&&t.hasFlower){blooming.push({lat:p.lat,lng:p.lng,hash:p.hash,hue:_hexToHue(t.flowerColor),color:t.flowerColor});}
  }

  // Cluster blooming plants
  var visited={};var choruses=[];
  for(var ci=0;ci<blooming.length;ci++){
    if(visited[ci])continue;
    var cluster=[ci];visited[ci]=true;var queue=[ci];
    while(queue.length>0){
      var cur=queue.shift();
      for(var ni=0;ni<blooming.length;ni++){
        if(visited[ni])continue;
        if(Math.abs(blooming[cur].lat-blooming[ni].lat)<CLUSTER_DIST&&Math.abs(blooming[cur].lng-blooming[ni].lng)<CLUSTER_DIST){
          visited[ni]=true;cluster.push(ni);queue.push(ni);
        }
      }
    }
    if(cluster.length>=3){
      var plants=cluster.map(function(idx){return blooming[idx];});
      // Calculate harmony score
      var score=0;
      for(var pa=0;pa<plants.length;pa++){
        for(var pb=pa+1;pb<plants.length;pb++){
          var diff=_hueDiff(plants[pa].hue,plants[pb].hue);
          if(diff>=150&&diff<=210)score+=3; // complementary
          else if(diff>=15&&diff<=60)score+=1; // analogous
          // identical = +0
        }
      }
      var cLat=0,cLng=0;
      for(var cc=0;cc<plants.length;cc++){cLat+=plants[cc].lat;cLng+=plants[cc].lng;}
      choruses.push({plants:plants.length,score:score,centerLat:cLat/plants.length,centerLng:cLng/plants.length,
        colors:plants.map(function(p){return p.color;}),hashes:plants.map(function(p){return p.hash.slice(0,8);})});
    }
  }

  // Log new choruses
  var existing=[];try{existing=JSON.parse(localStorage.getItem(CHORUS_KEY)||'[]');}catch(e){}
  if(choruses.length>existing.length&&choruses.length>0){
    if(window._logWildEvent)window._logWildEvent({type:'chorus',event:'formed',score:choruses[0].score,plants:choruses[0].plants});
  }
  localStorage.setItem(CHORUS_KEY,JSON.stringify(choruses));
  return choruses;
}

function getChorusBonus(plantHash){
  var choruses=[];try{choruses=JSON.parse(localStorage.getItem(CHORUS_KEY)||'[]');}catch(e){}
  var h8=plantHash.slice(0,8);
  for(var i=0;i<choruses.length;i++){
    if(choruses[i].hashes&&choruses[i].hashes.indexOf(h8)>=0){
      return{inChorus:true,score:choruses[i].score,pollenBonus:Math.min(0.5,choruses[i].score*0.05)};
    }
  }
  return{inChorus:false,score:0,pollenBonus:0};
}

window.evaluateBloomChorus=evaluateBloomChorus;
window.getChorusBonus=getChorusBonus;
})();

(function(){
'use strict';
var PHENOTYPES=['Luminous Veins','Deep Roots','Whispering Bloom','Ancient Bark','Crystal Dew','Shadow Twin','Spirit Companion','Golden Hour'];
var ADJACENT_DIST=0.002;

// Get hidden phenotype from hash byte 23
function getPhenotype(hash){
  if(!hash||hash.length<48)return PHENOTYPES[0];
  var byte23=parseInt(hash.slice(46,48),16)||0;
  return PHENOTYPES[Math.floor(byte23/32)];
}

// Check if conditions met to reveal phenotype on player's wild plants
function checkPhenotypeReveal(){
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  if(wild.length===0)return;
  var shared=[];
  if(window._sharedMarkers){var keys=Object.keys(window._sharedMarkers);for(var i=0;i<keys.length;i++){var e=window._sharedMarkers[keys[i]];if(e&&e.data)shared.push(e.data);}}

  var changed=false;
  for(var wi=0;wi<wild.length;wi++){
    var wp=wild[wi];
    if(wp.phenotypeRevealed||!wp.lat||!wp.hash)continue;
    var wt=null;try{wt=window.hashToTraits?window.hashToTraits(wp.hash):null;}catch(e){}
    if(!wt)continue;

    // Check nearby shared plants for trigger conditions
    for(var si=0;si<shared.length;si++){
      var sp=shared[si];
      if(!sp.lat||!sp.hash)continue;
      if(Math.abs(wp.lat-sp.lat)>ADJACENT_DIST||Math.abs(wp.lng-sp.lng)>ADJACENT_DIST)continue;

      var st=null;try{st=window.hashToTraits?window.hashToTraits(sp.hash):null;}catch(e){}
      if(!st)continue;

      // Trigger: opposite season nearby
      var isOppositeSeason=(wt.season===0&&st.season===2)||(wt.season===2&&st.season===0)||
                          (wt.season===1&&st.season===3)||(wt.season===3&&st.season===1);
      // Trigger: same companion from different owner
      var sameCompanion=wt.companion>=20&&wt.companion===st.companion;

      if(isOppositeSeason||sameCompanion){
        var pheno=getPhenotype(wp.hash);
        wp.phenotypeRevealed=true;
        wp.phenotype=pheno;
        changed=true;
        var _pName='';try{_pName=window.getPlantName?window.getPlantName(wp.hash):'';}catch(e){}
        if(window._logWildEvent)window._logWildEvent({type:'phenotype',event:'revealed',hash:wp.hash,plantName:_pName,phenotype:pheno});
        if(window._toast)window._toast('✨ Hidden phenotype revealed: '+pheno+'!');
        break;
      }
    }
  }
  if(changed)localStorage.setItem('fg_wild_plants',JSON.stringify(wild));
}

window.getPhenotype=getPhenotype;
window.checkPhenotypeReveal=checkPhenotypeReveal;
})();

(function(){
'use strict';
var COMMONS_KEY='lw_commons';
var MIN_PLANTS=7;
var MIN_PLAYERS=2; // lowered from 3 for testing — raise for launch

// Name generation from dominant traits
var PREFIXES=['Silver','Golden','Ember','Frost','Moss','Shadow','Crystal','Ancient','Verdant','Lunar','Storm','Deep','Wild','Quiet','Iron'];
var SUFFIXES=['Hollow','Clearing','Grove','Thicket','Garden','Refuge','Stand','Bower','Copse','Dell','Glade','Haven','Meadow','Patch','Ring'];

function _genCommonsName(plants){
  // Deterministic name from combined hashes
  var seed=0;
  for(var i=0;i<plants.length;i++){
    for(var j=0;j<8&&j<(plants[i].hash||'').length;j++)seed=(seed*31+plants[i].hash.charCodeAt(j))&0x7FFFFFFF;
  }
  return PREFIXES[seed%PREFIXES.length]+' '+SUFFIXES[(seed>>8)%SUFFIXES.length];
}

function evaluateCommons(){
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var shared=[];
  if(window._sharedMarkers){
    var keys=Object.keys(window._sharedMarkers);
    for(var i=0;i<keys.length;i++){var e=window._sharedMarkers[keys[i]];if(e&&e.data)shared.push(e.data);}
  }
  var allPlants=wild.concat(shared);
  if(allPlants.length<MIN_PLANTS)return[];

  // Cluster plants by proximity (~300m zones)
  var CLUSTER_DIST=0.003;
  var visited={};
  var clusters=[];

  for(var pi=0;pi<allPlants.length;pi++){
    var p=allPlants[pi];
    if(!p.lat||!p.lng||visited[pi])continue;
    // BFS to find cluster
    var cluster=[pi];visited[pi]=true;
    var queue=[pi];
    while(queue.length>0){
      var cur=queue.shift();
      var cp=allPlants[cur];
      for(var ni=0;ni<allPlants.length;ni++){
        if(visited[ni]||!allPlants[ni].lat)continue;
        if(Math.abs(cp.lat-allPlants[ni].lat)<CLUSTER_DIST&&Math.abs(cp.lng-allPlants[ni].lng)<CLUSTER_DIST){
          visited[ni]=true;cluster.push(ni);queue.push(ni);
        }
      }
    }
    if(cluster.length>=MIN_PLANTS){
      var clusterPlants=cluster.map(function(idx){return allPlants[idx];});
      // Count unique owners
      var owners={};
      for(var ci=0;ci<clusterPlants.length;ci++){owners[clusterPlants[ci].ownerUid||'wild']=true;}
      var ownerCount=Object.keys(owners).length;
      if(ownerCount>=MIN_PLAYERS){
        // Calculate center
        var cLat=0,cLng=0;
        for(var cl=0;cl<clusterPlants.length;cl++){cLat+=clusterPlants[cl].lat;cLng+=clusterPlants[cl].lng;}
        cLat/=clusterPlants.length;cLng/=clusterPlants.length;
        clusters.push({
          name:_genCommonsName(clusterPlants),
          plants:clusterPlants.length, owners:ownerCount,
          centerLat:cLat, centerLng:cLng,
          hashes:clusterPlants.map(function(p){return(p.hash||'').slice(0,8);})
        });
      }
    }
  }

  // Save and notify on new commons
  var existing=[];try{existing=JSON.parse(localStorage.getItem(COMMONS_KEY)||'[]');}catch(e){}
  var existingNames=existing.map(function(c){return c.name;});
  for(var nc=0;nc<clusters.length;nc++){
    if(existingNames.indexOf(clusters[nc].name)<0){
      // New commons formed!
      if(window._logWildEvent)window._logWildEvent({type:'commons',event:'formed',
        name:clusters[nc].name,plants:clusters[nc].plants,owners:clusters[nc].owners});
      if(window._toast)window._toast('🌳 A Commons has formed: '+clusters[nc].name+'!');
    }
  }
  localStorage.setItem(COMMONS_KEY,JSON.stringify(clusters));
  return clusters;
}

function getCommons(){try{return JSON.parse(localStorage.getItem(COMMONS_KEY)||'[]');}catch(e){return[];}}

window.evaluateCommons=evaluateCommons;
window.getCommons=getCommons;
})();

(function(){
'use strict';
var SOIL_KEY='lw_soil_maturity';
// Soil stages — higher maturity = better ferals, more bonuses
var SOIL_STAGES=[
  {id:0,name:'Bare',       min:0,  eaBonus:0, feralTier:'Common'},
  {id:1,name:'Pioneer',    min:20, eaBonus:1, feralTier:'Uncommon'},
  {id:2,name:'Understory', min:40, eaBonus:2, feralTier:'Rare'},
  {id:3,name:'Canopy',     min:60, eaBonus:3, feralTier:'Epic'},
  {id:4,name:'Old Growth', min:80, eaBonus:4, feralTier:'Legendary'}
];

function _loadSoil(){try{return JSON.parse(localStorage.getItem(SOIL_KEY)||'{}');}catch(e){return{};}}
function _saveSoil(s){
  // Prune zones not updated in 60 days
  var cutoff=Date.now()-60*86400000;
  var keys=Object.keys(s);
  for(var i=0;i<keys.length;i++){if(s[keys[i]].lastUpdate&&s[keys[i]].lastUpdate<cutoff)delete s[keys[i]];}
  localStorage.setItem(SOIL_KEY,JSON.stringify(s));
}

function getSoilStage(maturity){
  var stage=SOIL_STAGES[0];
  for(var i=SOIL_STAGES.length-1;i>=0;i--){if(maturity>=SOIL_STAGES[i].min){stage=SOIL_STAGES[i];break;}}
  return stage;
}

// Update soil maturity for hexes with plants — called during reproduction cycle
function updateSoilMaturity(){
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var soil=_loadSoil();
  var today=new Date().toISOString().split('T')[0];

  // Occupied hexes gain +1 maturity per day (max 100)
  var occupiedZones={};
  for(var i=0;i<wild.length;i++){
    if(!wild[i].lat)continue;
    // Use simple zone key (rounded to ~100m)
    var zk=Math.round(wild[i].lat*1000)/1000+','+Math.round(wild[i].lng*1000)/1000;
    occupiedZones[zk]=(occupiedZones[zk]||0)+1;
  }

  // Also count shared markers
  if(window._sharedMarkers){
    var keys=Object.keys(window._sharedMarkers);
    for(var j=0;j<keys.length;j++){
      var entry=window._sharedMarkers[keys[j]];
      if(entry&&entry.data&&entry.data.lat){
        var szk=Math.round(entry.data.lat*1000)/1000+','+Math.round(entry.data.lng*1000)/1000;
        occupiedZones[szk]=(occupiedZones[szk]||0)+1;
      }
    }
  }

  var zoneKeys=Object.keys(occupiedZones);
  for(var z=0;z<zoneKeys.length;z++){
    var zk2=zoneKeys[z];
    if(!soil[zk2])soil[zk2]={maturity:0,lastUpdate:Date.now()};
    if(soil[zk2].lastDate===today)continue; // already updated today
    // More plants = slightly faster maturity (cap at +3/day)
    var gain=Math.min(3,occupiedZones[zk2]);
    soil[zk2].maturity=Math.min(100,soil[zk2].maturity+gain);
    soil[zk2].lastDate=today;
    soil[zk2].lastUpdate=Date.now();
  }

  // Empty zones decay -1/week
  var allSoilKeys=Object.keys(soil);
  for(var sk=0;sk<allSoilKeys.length;sk++){
    if(!occupiedZones[allSoilKeys[sk]]){
      // Check if it's been a week since last update
      var daysSince=Math.floor((Date.now()-(soil[allSoilKeys[sk]].lastUpdate||Date.now()))/86400000);
      var decay=Math.floor(daysSince/7);
      if(decay>0){
        soil[allSoilKeys[sk]].maturity=Math.max(0,soil[allSoilKeys[sk]].maturity-decay);
        soil[allSoilKeys[sk]].lastUpdate=Date.now();
      }
    }
  }

  _saveSoil(soil);
  return soil;
}

// Get soil info for a specific location
function getSoilInfo(lat,lng){
  var soil=_loadSoil();
  var zk=Math.round(lat*1000)/1000+','+Math.round(lng*1000)/1000;
  var entry=soil[zk]||{maturity:0};
  var stage=getSoilStage(entry.maturity);
  return{maturity:entry.maturity,stage:stage,name:stage.name,eaBonus:stage.eaBonus,feralTier:stage.feralTier};
}

// Expose
window.updateSoilMaturity=updateSoilMaturity;
window.getSoilInfo=getSoilInfo;
window.getSoilStage=getSoilStage;
window.SOIL_STAGES=SOIL_STAGES;
})();

(function(){
'use strict';
var MESH_KEY='lw_mesh_links';
// Mesh stages: days of sustained connection required
var STAGES=[
  {id:0,name:'None',        days:0,  pollenMod:0,   waterShare:0,   feralRate:0},
  {id:1,name:'Root Contact', days:3,  pollenMod:0.05,waterShare:0,   feralRate:0},
  {id:2,name:'Nutrient Bridge',days:7, pollenMod:0.15,waterShare:0.25,feralRate:1},
  {id:3,name:'Deep Network', days:14, pollenMod:0.25,waterShare:0.50,feralRate:2},
  {id:4,name:'Old Growth',   days:30, pollenMod:0.40,waterShare:0.75,feralRate:3,eaBonus:1}
];
var ZONE_ADJACENT_DIST=0.002; // ~200m in degrees, close enough for hex adjacency

function _loadMesh(){try{return JSON.parse(localStorage.getItem(MESH_KEY)||'[]');}catch(e){return[];}}
function _saveMesh(m){localStorage.setItem(MESH_KEY,JSON.stringify(m));}

// Get mesh stage from days connected
function _getStage(days){
  var stage=STAGES[0];
  for(var i=STAGES.length-1;i>=0;i--){if(days>=STAGES[i].days){stage=STAGES[i];break;}}
  return stage;
}

// Evaluate all mesh connections for the current player's wild plants
// Called during reproduction cycle or tab switch
function evaluateMesh(){
  var myWild=[];try{myWild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  if(myWild.length<1)return[];

  // Get all visible shared plants (other players)
  var sharedPlants=[];
  if(window._sharedMarkers){
    var keys=Object.keys(window._sharedMarkers);
    for(var i=0;i<keys.length;i++){
      var entry=window._sharedMarkers[keys[i]];
      if(entry&&entry.data)sharedPlants.push(entry.data);
    }
  }

  var allPlants=myWild.concat(sharedPlants);
  var meshLinks=_loadMesh();
  var today=new Date().toISOString().split('T')[0];
  var updated=false;

  // Check each of my plants against all nearby plants
  for(var mi=0;mi<myWild.length;mi++){
    var mp=myWild[mi];
    if(!mp.lat||!mp.lng)continue;

    for(var ai=0;ai<allPlants.length;ai++){
      var ap=allPlants[ai];
      if(!ap.lat||!ap.lng||ap.hash===mp.hash)continue;
      // Must be different owner
      if(ap.ownerUid===mp.ownerUid&&ap.own)continue;

      // Check adjacency (~200m)
      var dlat=Math.abs(mp.lat-ap.lat),dlng=Math.abs(mp.lng-ap.lng);
      if(dlat>ZONE_ADJACENT_DIST||dlng>ZONE_ADJACENT_DIST)continue;

      // Both must be 3+ days old
      var mpAge=Math.floor((Date.now()-new Date(mp.date||Date.now()).getTime())/86400000);
      var apAge=Math.floor((Date.now()-new Date(ap.droppedAt||ap.date||Date.now()).getTime())/86400000);
      if(mpAge<3||apAge<3)continue;

      // Find or create link
      var linkKey=[mp.hash.slice(0,8),ap.hash.slice(0,8)].sort().join('_');
      var existing=null;
      for(var li=0;li<meshLinks.length;li++){if(meshLinks[li].key===linkKey){existing=meshLinks[li];break;}}

      if(!existing){
        // New link — start germination
        meshLinks.push({key:linkKey,hashA:mp.hash.slice(0,8),hashB:ap.hash.slice(0,8),
          startDate:today,lastHealthy:today,daysConnected:0,stage:0,
          latA:mp.lat,lngA:mp.lng,latB:ap.lat,lngB:ap.lng});
        updated=true;
        if(window._logWildEvent)window._logWildEvent({type:'mesh',event:'germination',
          hashA:mp.hash.slice(0,8),hashB:ap.hash.slice(0,8)});
      }else{
        // Update existing link
        if(existing.lastHealthy!==today){
          // Check health: both must be watered recently (simplified — check lastWatered within 48h)
          var mpHealthy=mp.lastWatered&&(Date.now()-new Date(mp.lastWatered).getTime())<172800000;
          var apHealthy=true; // assume shared plants are healthy (can't check their watering)
          if(mpHealthy||mpAge<7){
            // Healthy — advance connection
            existing.daysConnected++;
            existing.lastHealthy=today;
            var newStage=_getStage(existing.daysConnected);
            if(newStage.id>existing.stage){
              existing.stage=newStage.id;
              updated=true;
              var _meshPlantName='';try{_meshPlantName=window.getPlantName?window.getPlantName(mp.hash):'';}catch(e){}
              if(window._logWildEvent)window._logWildEvent({type:'mesh',event:'stage_up',
                stage:newStage.name,hashA:existing.hashA,hashB:existing.hashB,plantName:_meshPlantName});
              if(window._toast&&newStage.id>=2)window._toast('🍄 Mesh upgraded to '+newStage.name+'!');
            }
          }else{
            // Unhealthy — degrade
            existing.daysConnected=Math.max(0,existing.daysConnected-1);
            var degradeStage=_getStage(existing.daysConnected);
            if(degradeStage.id<existing.stage){existing.stage=degradeStage.id;updated=true;}
          }
        }
      }
    }
  }

  // Prune dead links (stage 0 and not checked in 14 days)
  var cutoff=new Date(Date.now()-14*86400000).toISOString().split('T')[0];
  meshLinks=meshLinks.filter(function(l){return l.stage>0||l.lastHealthy>cutoff;});

  if(updated)_saveMesh(meshLinks);
  return meshLinks;
}

// Get mesh bonuses for a specific plant
function getMeshBonus(plantHash){
  var meshLinks=_loadMesh();
  var hash8=plantHash.slice(0,8);
  var bonus={pollenMod:0,waterShare:0,feralRate:0,eaBonus:0,connections:0,highestStage:0,stageName:'None'};
  // Diversity tracking
  var seasons={};
  for(var i=0;i<meshLinks.length;i++){
    var l=meshLinks[i];
    if(l.hashA===hash8||l.hashB===hash8){
      var stage=STAGES[l.stage]||STAGES[0];
      bonus.connections++;
      if(stage.id>bonus.highestStage){bonus.highestStage=stage.id;bonus.stageName=stage.name;}
      bonus.pollenMod=Math.max(bonus.pollenMod,stage.pollenMod);
      bonus.waterShare=Math.max(bonus.waterShare,stage.waterShare);
      bonus.feralRate+=stage.feralRate;
      bonus.eaBonus+=(stage.eaBonus||0);
    }
  }
  // Cap EA bonus from mesh at +3
  bonus.eaBonus=Math.min(3,bonus.eaBonus);
  return bonus;
}

// Get all mesh links for map rendering
function getMeshLinks(){return _loadMesh();}

// Expose
window.evaluateMesh=evaluateMesh;
window.getMeshBonus=getMeshBonus;
window.getMeshLinks=getMeshLinks;
window.MESH_STAGES=STAGES;
})();

(function(){
'use strict';
var TRIGGER_KEY='lw_triggers_found';
var TRIGGER_LOG_KEY='lw_trigger_log';

// ── TRIGGER DEFINITIONS ──
// Each trigger: {id, name, riddle, category, check(ctx), effect, rarity}
// ctx = {plant, nearbyPlants, weather, hour, month, realSeason, moonPhase, playerStats}
var TRIGGERS=[
  // ── TRAIT COMBOS ──
  {id:'prism',name:'Prism',riddle:'Fragile light bends where rain meets glass.',category:'trait',
    check:function(c){return c.plant&&c.plant.mutationName==='Glass Stem'&&c.weather&&c.weather.rain>1;},
    effect:'+1 EA temporary, rainbow particle',reward:{ea:1,pollen:5}},
  {id:'moonstone',name:'Moonstone',riddle:'Crystal roots drink silver light.',category:'trait',
    check:function(c){if(!c.plant)return false;var b=c.plant.base%71;return b===15&&c.moonPhase==='full';},
    effect:'Silver glow, 2x pollen until dawn',reward:{pollen:15}},
  {id:'canopy_crown',name:'Canopy Crown',riddle:'The tallest braids reach sunlight first.',category:'trait',
    check:function(c){if(!c.plant||!c.nearbyPlants)return false;var isBraided=(c.plant.stem%24)>12;if(!isBraided||c.plant.stemHeight<40)return false;
      return c.nearbyPlants.some(function(p){var t=p.traits;return t&&(t.stem%24)>12&&t.stemHeight>=40;});},
    effect:'+1 EA permanent for both',reward:{ea:1}},
  {id:'thornwall',name:'Thornwall',riddle:'Two barbed sentinels share a border.',category:'trait',
    check:function(c){if(!c.plant||!c.nearbyPlants)return false;var lt=c.plant.leafType%71;var thorns=[5,12,18,25,33];
      if(thorns.indexOf(lt)<0)return false;return c.nearbyPlants.some(function(p){return p.traits&&thorns.indexOf(p.traits.leafType%71)>=0;});},
    effect:'Both hexes defended — Hard difficulty minimum',reward:{pollen:3}},
  {id:'bloom_mirror',name:'Bloom Mirror',riddle:'Twin flowers face each other and forget which is which.',category:'trait',
    check:function(c){if(!c.plant||!c.plant.hasFlower||!c.nearbyPlants)return false;
      return c.nearbyPlants.some(function(p){return p.traits&&p.traits.hasFlower&&(p.traits.flower%71)===(c.plant.flower%71)&&p.traits.flowerColor===c.plant.flowerColor;});},
    effect:'Cross-pollinate reward doubled',reward:{pollen:10}},

  // ── COMPANION INTERACTIONS ──
  {id:'swamp_lantern',name:'Swamp Lantern',riddle:'The toad waits. The firefly answers.',category:'companion',
    check:function(c){if(!c.plant||!c.nearbyPlants)return false;var isT=c.plant.companion===32;var isF=c.plant.companion===23;
      if(!isT&&!isF)return false;var need=isT?23:32;return c.hour>=20&&c.nearbyPlants.some(function(p){return p.traits&&p.traits.companion===need;});},
    effect:'Both plants glow on map',reward:{pollen:8}},
  {id:'pollinator_hwy',name:'Pollinator Highway',riddle:'The bee and the bird share the road.',category:'companion',
    check:function(c){if(!c.plant||!c.nearbyPlants)return false;var isB=c.plant.companion===21;var isH=c.plant.companion===28;
      if(!isB&&!isH)return false;var need=isB?28:21;return c.hour>=6&&c.hour<20&&c.nearbyPlants.some(function(p){return p.traits&&p.traits.companion===need;});},
    effect:'Cross-pollinate rewards tripled',reward:{pollen:12}},
  {id:'symbiont',name:'Symbiont',riddle:'Mushroom and root share a secret language.',category:'companion',
    check:function(c){if(!c.plant||!c.nearbyPlants)return false;return c.plant.companion===73&&c.nearbyPlants.some(function(p){return p.traits&&[9,10,18,29].indexOf(p.traits.base%71)>=0;});},
    effect:'EA shared with nearby plants',reward:{ea:1,pollen:5}},

  // ── WEATHER + TRAIT ──
  {id:'lightning_scar',name:'Lightning Scar',riddle:'The sky writes on the living wood.',category:'weather',
    check:function(c){return c.weather&&c.weather.weathercode&&[95,96,99].indexOf(c.weather.weathercode)>=0&&Math.random()<0.3;},
    effect:'+3 EA or death (50/50)',reward:{ea:3}},
  {id:'wind_seed',name:'Wind Seed',riddle:'Strong gusts carry what roots cannot hold.',category:'weather',
    check:function(c){if(!c.plant||!c.weather)return false;var lt=c.plant.leafType%71;return c.weather.windspeed>30&&[2,7,14,22,35].indexOf(lt)>=0;},
    effect:'Free feral spawns 200-500m downwind',reward:{pollen:3}},
  {id:'frost_glass',name:'Frost Glass',riddle:'Cold makes crystal of the morning dew.',category:'weather',
    check:function(c){return c.plant&&c.plant.mutationName==='Glass Stem'&&c.weather&&c.weather.temp<0;},
    effect:'Permanent seasonal stress immunity',reward:{ea:1}},
  {id:'heat_bloom',name:'Heat Bloom',riddle:'Desert flowers wait for exactly this.',category:'weather',
    check:function(c){if(!c.plant||!c.weather)return false;var b=c.plant.base%71;return c.weather.temp>35&&([11,12].indexOf(b)>=0||c.plant.hasFlower&&(c.plant.flower%71)>=30);},
    effect:'3x pollen for duration',reward:{pollen:20}},

  // ── SEASONAL ──
  {id:'vernal_bloom',name:'Vernal Bloom',riddle:'The equinox rewards those who arrived prepared.',category:'season',
    check:function(c){if(!c.plant)return false;var d=new Date();return d.getMonth()===2&&d.getDate()>=19&&d.getDate()<=21&&c.plant.season===0&&c.ea>=15;},
    effect:'Guaranteed free seed, no partner needed',reward:{pollen:25}},
  {id:'evergreen',name:'Evergreen',riddle:'What survives the coldest night earns the title.',category:'season',
    check:function(c){if(!c.plant)return false;var d=new Date();return d.getMonth()===11&&d.getDate()>=21&&d.getDate()<=22&&c.plant.season===3&&c.plantAge>=90;},
    effect:'Plant can never die from seasonal mortality',reward:{ea:2,pollen:15}},

  // ── PLAYER ACTION ──
  {id:'rainfall',name:'Rainfall',riddle:'Ten gardens tended by a stranger\'s hand.',category:'action',
    check:function(c){return c.playerStats&&c.playerStats.watersToday>=10;},
    effect:'Your wild plants auto-watered 3 days',reward:{pollen:20}},
  {id:'midnight_gardener',name:'Midnight Gardener',riddle:'Who waters between the hours of twelve and four?',category:'action',
    check:function(c){return c.playerStats&&c.playerStats.midnightWaters>=3;},
    effect:'Plants generate pollen at night',reward:{pollen:10}},
  {id:'the_graft',name:'The Graft',riddle:'Breed the same pair twice and see what the second child knows.',category:'action',
    check:function(c){return c.playerStats&&c.playerStats.samePairBreeds>=2;},
    effect:'Offspring +2 EA over RNG',reward:{ea:2}},
  // ── ECOSYSTEM STATE TRIGGERS ──
  {id:'first_mesh',name:'Root Contact',riddle:'Two strangers share the dark beneath.',category:'trait',
    check:function(c){try{var m=JSON.parse(localStorage.getItem('lw_mesh_links')||'[]');return m.some(function(l){return l.stage>=1;});}catch(e){return false;}},
    effect:'First mycelial connection formed',reward:{pollen:10}},
  {id:'deep_network',name:'Deep Network',riddle:'Thirty days of patient roots.',category:'trait',
    check:function(c){try{var m=JSON.parse(localStorage.getItem('lw_mesh_links')||'[]');return m.some(function(l){return l.stage>=3;});}catch(e){return false;}},
    effect:'Mesh reached Deep Network stage',reward:{pollen:25}},
  {id:'first_commons',name:'Named Ground',riddle:'When enough gather, the land finds its name.',category:'trait',
    check:function(c){try{return JSON.parse(localStorage.getItem('lw_commons')||'[]').length>0;}catch(e){return false;}},
    effect:'First Commons ecosystem formed',reward:{pollen:50}},
  {id:'four_seasons',name:'Complete Cycle',riddle:'Spring, summer, autumn, winter — all present.',category:'season',
    check:function(c){if(!c.plant)return false;try{var gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');var s={};gh.forEach(function(p){try{var t=window.hashToTraits(p.hash);s[t.season]=true;}catch(e){}});return Object.keys(s).length>=4;}catch(e){return false;}},
    effect:'All four seasons in greenhouse',reward:{pollen:15}},
  {id:'territory_gardener',name:'Green Thumb',riddle:'Fifty points of influence. The land knows your name.',category:'action',
    check:function(c){try{var ti=window.getTerritoryInfluence?getTerritoryInfluence():{score:0};return ti.score>=500;}catch(e){return false;}},
    effect:'Reached Gardener territory rank',reward:{pollen:20}},
  {id:'elder_plant',name:'The Elder',riddle:'Three cycles complete. What remains is wiser.',category:'trait',
    check:function(c){try{var gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');return gh.some(function(p){return(p.breedCount||0)>=3;});}catch(e){return false;}},
    effect:'First plant used all breed charges',reward:{pollen:10}},
  {id:'night_watcher',name:'Night Watcher',riddle:'Some things only bloom when the sun is gone.',category:'weather',
    check:function(c){return c.hour>=22||c.hour<4;},
    effect:'Played between midnight and 4 AM',reward:{pollen:5}},
  {id:'storm_chaser',name:'Storm Chaser',riddle:'Thunder rolls. The brave stay planted.',category:'weather',
    check:function(c){return c.weather&&c.weather.rain>10;},
    effect:'Played during heavy rain',reward:{pollen:8}},
  {id:'biodiversity_scout',name:'Biodiversity Scout',riddle:'Where real flowers grow, rare seeds follow.',category:'action',
    check:function(c){try{var bd=window._lastBiodiversity;return bd&&bd.tier==='hotspot';}catch(e){return false;}},
    effect:'Visited a real-world biodiversity hotspot',reward:{pollen:30}},
  {id:'full_house',name:'Full House',riddle:'Every slot filled. Every plant unique.',category:'action',
    check:function(c){try{var gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');return gh.length>=10;}catch(e){return false;}},
    effect:'Greenhouse completely full',reward:{pollen:15}}
];

// ── MOON PHASE CALCULATOR (client-side) ──
function _getMoonPhase(){
  var now=new Date();
  var year=now.getFullYear(),month=now.getMonth()+1,day=now.getDate();
  if(month<=2){year--;month+=12;}
  var A=Math.floor(year/100),B=2-A+Math.floor(A/4);
  var JD=Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day+B-1524.5;
  var daysSinceNew=JD-2451550.1;
  var cycle=daysSinceNew/29.530588853;
  var phase=(cycle-Math.floor(cycle))*29.53;
  if(phase>=13.5&&phase<15.5)return'full';
  if(phase>=0&&phase<1.5)return'new';
  if(phase>=6.5&&phase<8.5)return'first_quarter';
  if(phase>=20.5&&phase<22.5)return'last_quarter';
  return phase<14.75?'waxing':'waning';
}
window._getMoonPhase=_getMoonPhase;

// ── CHECK TRIGGERS (with balance rules) ──
// Max 1 event/plant/day, max 3/player/day, 7-day per-trigger cooldown, 24h min age
var COOLDOWN_KEY='lw_trigger_cooldowns';
function _getCooldowns(){try{return JSON.parse(localStorage.getItem(COOLDOWN_KEY)||'{}');}catch(e){return{};}}
function _saveCooldowns(cd){
  // Prune entries older than 7 days
  var now=new Date().toISOString().split('T')[0];
  var cutoff=new Date(Date.now()-7*86400000).toISOString().split('T')[0];
  var keys=Object.keys(cd);
  for(var i=0;i<keys.length;i++){if(typeof cd[keys[i]]==='string'&&cd[keys[i]]<cutoff)delete cd[keys[i]];}
  localStorage.setItem(COOLDOWN_KEY,JSON.stringify(cd));
}

function checkTriggers(plant, nearbyPlants, weather, playerStats){
  if(!plant)return[];
  var traits=null;
  try{traits=window.hashToTraits?window.hashToTraits(plant.hash):null;}catch(e){}
  if(!traits)return[];

  var now=new Date();
  var today=now.toISOString().split('T')[0];
  var plantAge=Math.floor((Date.now()-(plant.born||plant.mintedAt||Date.now()))/86400000);

  // Balance rule: min 24h plant age
  if(plantAge<1)return[];

  // Balance rule: max 1 event per plant per day
  var cd=_getCooldowns();
  var plantKey=plant.hash.slice(0,8)+'_day';
  if(cd[plantKey]===today)return[];

  // Balance rule: max 3 events per player per day
  var dayCount=cd._dayCount||0;
  var dayDate=cd._dayDate||'';
  if(dayDate!==today){dayCount=0;dayDate=today;}
  if(dayCount>=3)return[];

  var ea=window.computeEA?window.computeEA(traits,0,plant):0;
  var ctx={
    plant:traits, plantObj:plant, nearbyPlants:nearbyPlants||[],
    weather:weather||{}, hour:now.getHours(), month:now.getMonth(),
    realSeason:now.getMonth()<3?3:now.getMonth()<6?0:now.getMonth()<9?1:2,
    moonPhase:_getMoonPhase(), playerStats:playerStats||{},
    ea:ea, plantAge:plantAge
  };

  // Enrich nearby plants with traits
  for(var i=0;i<ctx.nearbyPlants.length;i++){
    if(!ctx.nearbyPlants[i].traits){
      try{ctx.nearbyPlants[i].traits=window.hashToTraits?window.hashToTraits(ctx.nearbyPlants[i].hash):null;}catch(e){}
    }
  }

  var found=[];
  var discovered=_getDiscovered();
  for(var t=0;t<TRIGGERS.length;t++){
    // Balance rule: 7-day per-trigger per-plant cooldown
    var trigPlantKey=plant.hash.slice(0,8)+'_'+TRIGGERS[t].id;
    if(cd[trigPlantKey]&&cd[trigPlantKey]>new Date(Date.now()-7*86400000).toISOString().split('T')[0])continue;

    try{
      if(TRIGGERS[t].check(ctx)){
        found.push(TRIGGERS[t]);
        // Set cooldowns
        cd[plantKey]=today;
        cd[trigPlantKey]=today;
        dayCount++;
        cd._dayCount=dayCount;
        cd._dayDate=dayDate;
        _saveCooldowns(cd);
        // Mark as discovered (first time only)
        if(discovered.indexOf(TRIGGERS[t].id)<0){
          discovered.push(TRIGGERS[t].id);
          _saveDiscovered(discovered);
          // Log discovery for morning report
          if(window._logWildEvent)window._logWildEvent({
            type:'trigger',triggerId:TRIGGERS[t].id,name:TRIGGERS[t].name,
            category:TRIGGERS[t].category,hash:plant.hash,
            plantName:window.getPlantName?window.getPlantName(plant.hash):'',
            firstDiscovery:true
          });
        }
        break; // max 1 event per plant per check (priority order)
      }
    }catch(e){}
  }
  return found;
}

// ── COMPENDIUM DATA ──
function _getDiscovered(){try{return JSON.parse(localStorage.getItem(TRIGGER_KEY)||'[]');}catch(e){return[];}}
function _saveDiscovered(arr){localStorage.setItem(TRIGGER_KEY,JSON.stringify(arr));}

function getCompendium(){
  var disc=_getDiscovered();
  return TRIGGERS.map(function(t){
    var unlocked=disc.indexOf(t.id)>=0;
    return{id:t.id,name:unlocked?t.name:'???',riddle:t.riddle,category:t.category,
      effect:unlocked?t.effect:'???',unlocked:unlocked,reward:unlocked?t.reward:null};
  });
}

function getCompendiumProgress(){
  var disc=_getDiscovered();
  return{found:disc.length,total:TRIGGERS.length,pct:Math.round(disc.length/TRIGGERS.length*100)};
}

// Expose
window.checkTriggers=checkTriggers;
window.getCompendium=getCompendium;
window.getCompendiumProgress=getCompendiumProgress;
window.INTERACTION_TRIGGERS=TRIGGERS;
})();

(function(){
'use strict';

// Companion ability effects — keyed by ability ID from TRAIT_BANK
var ABILITIES = {
  rainCaller:    {name:'Rain Caller',    desc:'Reduces water decay 50%, 30% auto-water chance'},
  herdImmunity:  {name:'Herd Immunity',  desc:'+1 EA per ally within 500m (max +4)'},
  omnisight:     {name:'Omnisight',      desc:'Reveals ferals 1km, takeover alerts'},
  permafrost:    {name:'Permafrost',     desc:'Ignores seasonal stress, +2 off-season EA'},
  scavenger:     {name:'Scavenger',      desc:'Banks fertilizer from displaced plants'},
  silkTrap:      {name:'Silk Trap',      desc:'Takeover requires beating defense 2x'},
  precisionStrike:{name:'Precision Strike',desc:'2x harvest reward, +1 offensive EA'},
  shellShift:    {name:'Shell Shift',    desc:'25% chance to relocate on takeover'},
  nightBloom:    {name:'Night Bloom',    desc:'2x pollen 8PM-6AM, glow marker at night'},
  driftPollen:   {name:'Drift Pollination',desc:'20% daily free cross-pollination to ally 1km'}
};

// Temperament bonuses
var TEMPERAMENTS = {
  guardian: {name:'Guardian', icon:'🛡️', desc:'+1 defense EA',     defenseEA:1},
  forager:  {name:'Forager',  icon:'🍂', desc:'+10% harvest hashes', harvestBonus:0.10},
  wanderer: {name:'Wanderer', icon:'🦋', desc:'+50m feral range',   feralRange:50},
  mystic:   {name:'Mystic',   icon:'✨', desc:'+15% pollen yield',  pollenBonus:0.15},
  symbiote: {name:'Symbiote', icon:'🌿', desc:'25% shared watering', sharedWater:0.25}
};

// Get companion info for a plant
window.getCompanionInfo = function(traits) {
  if (!traits || !window.TRAIT_BANK) return null;
  var idx = traits.companion;
  var tb = window.TRAIT_BANK;
  if (!tb.companions || !tb.companions[idx]) return null;
  var c = tb.companions[idx];
  if (c.name === 'None') return null;
  return {
    idx: idx, name: c.name, rare: c.rare || false,
    temperament: c.temp ? TEMPERAMENTS[c.temp] : null,
    tempKey: c.temp || null,
    ability: c.ability ? ABILITIES[c.ability] : null,
    abilityKey: c.ability || null
  };
};

// Apply companion defense bonus to EA
window.getCompanionDefenseEA = function(traits) {
  var info = getCompanionInfo(traits);
  if (!info) return 0;
  var bonus = 0;
  // Temperament defense bonus (Guardian)
  if (info.temperament && info.temperament.defenseEA) bonus += info.temperament.defenseEA;
  // Permafrost — ignore seasonal stress (handled in computeEA)
  return bonus;
};

// Apply companion reproduction modifier
window.getCompanionReproMod = function(traits, weather) {
  var info = getCompanionInfo(traits);
  if (!info || !info.abilityKey) return 1.0;
  // Rain Caller: 30% auto-water, reduced decay
  if (info.abilityKey === 'rainCaller') return weather && weather.rain < 1 ? 1.3 : 1.0;
  // Night Bloom: 2x reproduction at night
  if (info.abilityKey === 'nightBloom') {
    var hr = new Date().getHours();
    return (hr >= 20 || hr < 6) ? 2.0 : 1.0;
  }
  return 1.0;
};

// Check if shell shift saves a plant from displacement (25% chance)
window.checkShellShift = function(traits) {
  var info = getCompanionInfo(traits);
  if (!info || info.abilityKey !== 'shellShift') return false;
  return Math.random() < 0.25;
};

// Check if silk trap doubles defense (requires beating game 2x)
window.checkSilkTrap = function(traits) {
  var info = getCompanionInfo(traits);
  return info && info.abilityKey === 'silkTrap';
};

// Get harvest bonus from companion temperament
window.getCompanionHarvestBonus = function(traits) {
  var info = getCompanionInfo(traits);
  if (!info || !info.temperament) return 0;
  return info.temperament.harvestBonus || 0;
};

// Get pollen bonus from companion temperament
window.getCompanionPollenBonus = function(traits) {
  var info = getCompanionInfo(traits);
  if (!info || !info.temperament) return 0;
  return info.temperament.pollenBonus || 0;
};

// Expose for dev panel and card display
window.COMPANION_ABILITIES = ABILITIES;
window.COMPANION_TEMPERAMENTS = TEMPERAMENTS;
})();

// Simple geohash encoder — precision 7 (~150m cells), good enough for geo-range queries
window._geoHash=function(lat,lng,precision){
  precision=precision||7;
  var CHARS='0123456789bcdefghjkmnpqrstuvwxyz';
  var minLat=-90,maxLat=90,minLng=-180,maxLng=180;
  var isLng=true,bit=0,ch=0,hash='';
  while(hash.length<precision){
    if(isLng){var mid=(minLng+maxLng)/2;if(lng>=mid){ch|=(1<<(4-bit));minLng=mid;}else{maxLng=mid;}}
    else{var mid2=(minLat+maxLat)/2;if(lat>=mid2){ch|=(1<<(4-bit));minLat=mid2;}else{maxLat=mid2;}}
    isLng=!isLng;bit++;
    if(bit===5){hash+=CHARS[ch];bit=0;ch=0;}
  }
  return hash;
};

(function(){
'use strict';
var HZ_KEY='lw_home_zone'; // {lat, lng, enabled}
var HZ_RADIUS=0.0018; // ~200m in degrees

window._toggleHomeZone=function(){
  var hz={};try{hz=JSON.parse(localStorage.getItem(HZ_KEY)||'{}');}catch(e){}
  if(hz.enabled){
    hz.enabled=false;
    localStorage.setItem(HZ_KEY,JSON.stringify(hz));
    _updateHZButtons();
    if(window._toast)_toast('Home zone OFF. Your plants are visible to all.');
  }else{
    if(hz.lat&&hz.lng){
      hz.enabled=true;
      localStorage.setItem(HZ_KEY,JSON.stringify(hz));
      _updateHZButtons();
      if(window._toast)_toast('Home zone ON. Plants within 200m of home hidden from others.');
    }else{
      // No home set yet — prompt to set
      window._setHomeZone();
    }
  }
};

window._setHomeZone=function(){
  if(!navigator.geolocation){if(window._toast)_toast('GPS not available.');return;}
  if(window._toast)_toast('Getting your location...');
  navigator.geolocation.getCurrentPosition(function(pos){
    var hz={lat:pos.coords.latitude,lng:pos.coords.longitude,enabled:true};
    localStorage.setItem(HZ_KEY,JSON.stringify(hz));
    _updateHZButtons();
    if(window._toast)_toast('Home zone set! Plants within 200m of here are hidden from other players.');
  },function(){
    if(window._toast)_toast('Could not get location. Try again outside.');
  },{enableHighAccuracy:true,timeout:10000});
};

// Check if a lat/lng is inside someone's home zone
window._isInHomeZone=function(lat,lng){
  var hz={};try{hz=JSON.parse(localStorage.getItem(HZ_KEY)||'{}');}catch(e){}
  if(!hz.enabled||!hz.lat||!hz.lng)return false;
  var dlat=Math.abs(lat-hz.lat),dlng=Math.abs(lng-hz.lng);
  return(dlat<HZ_RADIUS&&dlng<HZ_RADIUS);
};

function _updateHZButtons(){
  var hz={};try{hz=JSON.parse(localStorage.getItem(HZ_KEY)||'{}');}catch(e){}
  var btn=document.getElementById('home-zone-btn');
  var setBtn=document.getElementById('home-zone-set-btn');
  if(btn){
    btn.textContent=hz.enabled?'Home Zone: ON ✓':'Home Zone: OFF';
    btn.style.borderColor=hz.enabled?'rgba(122,179,86,0.4)':'';
  }
  if(setBtn){
    setBtn.style.display=(hz.lat&&hz.lng)?'block':'none';
    if(hz.lat)setBtn.textContent='Update Home Location (currently '+hz.lat.toFixed(3)+', '+hz.lng.toFixed(3)+')';
  }
}

// Init buttons on settings open
var _origToggleSettings=window.toggleSettingsMenu;
window.toggleSettingsMenu=function(){
  if(_origToggleSettings)_origToggleSettings();
  setTimeout(_updateHZButtons,50);
};
})();

(function(){
'use strict';
var QUEST_KEY='lw_daily_quests';
var STREAK_KEY='lw_quest_streak';

// Quest templates — pick 3 per day
var TEMPLATES=[
  {id:'win_game',text:'Win a mini-game',icon:'🎮',check:function(s){return(s.gamesWon||0)>=1;}},
  {id:'win_3',text:'Win 3 mini-games',icon:'🎯',check:function(s){return(s.gamesWon||0)>=3;}},
  {id:'earn_10',text:'Earn 10 dew drops',icon:'💧',check:function(s){return(s.dewEarned||0)>=10;}},
  {id:'water_seed',text:'Water a nursery seed',icon:'🌱',check:function(s){return(s.seedsWatered||0)>=1;}},
  {id:'view_plants',text:'Inspect 3 plants',icon:'🔍',check:function(s){return(s.plantsViewed||0)>=3;}},
  {id:'play_5min',text:'Play for 5 minutes',icon:'⏱️',check:function(s){return(s.playTimeMin||0)>=5;}},
  {id:'compost',text:'Compost a plant',icon:'🧪',check:function(s){return(s.composted||0)>=1;}},
  {id:'open_wild',text:'Visit the Wild tab',icon:'🗺️',check:function(s){return(s.wildVisited||0)>=1;}}
];

function _today(){return new Date().toISOString().split('T')[0];}

function _loadQuests(){
  try{var d=JSON.parse(localStorage.getItem(QUEST_KEY)||'{}');if(d.date===_today())return d;return null;}catch(e){return null;}
}

function _generateQuests(){
  // Deterministic daily selection using date as seed
  var day=_today();
  var seed=0;for(var i=0;i<day.length;i++)seed=(seed*31+day.charCodeAt(i))&0x7FFFFFFF;
  var pool=TEMPLATES.slice();
  var picked=[];
  for(var j=0;j<3&&pool.length>0;j++){
    var idx=seed%(pool.length);seed=Math.floor(seed/pool.length)+j*7;
    picked.push({id:pool[idx].id,text:pool[idx].text,icon:pool[idx].icon,done:false});
    pool.splice(idx,1);
  }
  var data={date:day,quests:picked,progress:{},claimed:false};
  localStorage.setItem(QUEST_KEY,JSON.stringify(data));
  return data;
}

function _getQuests(){
  var d=_loadQuests();
  if(!d)d=_generateQuests();
  // Re-check completion
  for(var i=0;i<d.quests.length;i++){
    var q=d.quests[i];
    var tmpl=TEMPLATES.filter(function(t){return t.id===q.id;})[0];
    if(tmpl&&tmpl.check(d.progress))q.done=true;
  }
  localStorage.setItem(QUEST_KEY,JSON.stringify(d));
  return d;
}

// Track quest progress
function _trackQuest(key,val){
  var d=_getQuests();
  d.progress[key]=(d.progress[key]||0)+(val||1);
  localStorage.setItem(QUEST_KEY,JSON.stringify(d));
  // Check if all 3 complete
  var allDone=d.quests.every(function(q){
    var tmpl=TEMPLATES.filter(function(t){return t.id===q.id;})[0];
    return tmpl&&tmpl.check(d.progress);
  });
  if(allDone&&!d.claimed){
    d.claimed=true;
    localStorage.setItem(QUEST_KEY,JSON.stringify(d));
    _claimStreak();
  }
  // Update quest button badge
  _updateQuestBadge();
}

function _claimStreak(){
  var streak={};try{streak=JSON.parse(localStorage.getItem(STREAK_KEY)||'{}');}catch(e){}
  var today=_today();
  var yesterday=new Date(Date.now()-86400000).toISOString().split('T')[0];
  if(streak.lastDate===yesterday){
    streak.count=(streak.count||0)+1;
  }else if(streak.lastDate===today){
    // Already claimed today
    return;
  }else{
    streak.count=1; // Reset
  }
  streak.lastDate=today;
  streak.count=Math.min(streak.count,7); // Cap at 7
  localStorage.setItem(STREAK_KEY,JSON.stringify(streak));
  // Award streak bonus hashes
  var bonus=streak.count;
  if(window.earnHashes)earnHashes(bonus);
  if(window._toast)window._toast('🔥 Daily quests complete! Streak: '+streak.count+' (+'+bonus+' dew)');
}

function _updateQuestBadge(){
  var btn=document.getElementById('daily-quest-btn');if(!btn)return;
  // Progressive disclosure: show after first plant
  btn.style.display=(window.canSee&&window.canSee.questPanel())?'':'none';
  var d=_getQuests();
  var done=d.quests.filter(function(q){return q.done;}).length;
  if(d.claimed){btn.textContent='✅ '+done+'/3';btn.style.borderColor='rgba(122,179,86,0.4)';}
  else{btn.textContent=done+'/3 QUESTS';btn.style.borderColor=done>0?'rgba(200,168,75,0.3)':'rgba(122,179,86,0.15)';}
}

// Quest panel overlay
window._openDailyQuests=function(){
  var d=_getQuests();
  var streak={};try{streak=JSON.parse(localStorage.getItem(STREAK_KEY)||'{}');}catch(e){}
  var ov=document.createElement('div');
  ov.id='quest-panel';
  ov.style.cssText='position:fixed;inset:0;z-index:99997;background:rgba(5,8,4,0.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;animation:panelFadeIn 0.3s ease;';
  var h='<div style="width:90%;max-width:320px;background:rgba(18,22,16,0.95);border:1.5px solid rgba(200,168,75,0.2);border-radius:16px;padding:1.2rem;box-shadow:0 12px 40px rgba(0,0,0,0.6);">';
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.7rem;color:var(--gold);letter-spacing:0.1em;">DAILY QUESTS</div>';
  h+='<button onclick="var qp=document.getElementById(\'quest-panel\');if(qp)qp.remove();" style="width:36px;height:36px;border-radius:50%;border:1px solid rgba(138,145,120,0.2);background:transparent;color:var(--cream);font-size:0.5rem;cursor:pointer;min-height:48px;min-width:48px;">✕</button>';
  h+='</div>';
  // Streak display
  var sc=streak.count||0;
  h+='<div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.6rem;padding:0.35rem 0.5rem;background:rgba(200,168,75,0.06);border:1px solid rgba(200,168,75,0.15);border-radius:8px;">';
  h+='<span style="font-size:0.7rem;">🔥</span>';
  h+='<div><div style="font-family:Bebas Neue,sans-serif;font-size:0.5rem;color:var(--gold);">STREAK: '+sc+' DAY'+(sc!==1?'S':'')+'</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.32rem;color:var(--muted);">Complete all 3 for +'+Math.min(sc+1,7)+' dew bonus</div></div></div>';
  // Quests
  for(var i=0;i<d.quests.length;i++){
    var q=d.quests[i];
    var tmpl=TEMPLATES.filter(function(t){return t.id===q.id;})[0];
    var done=tmpl&&tmpl.check(d.progress);
    h+='<div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem;margin-bottom:4px;background:rgba(26,36,22,'+(done?'0.6':'0.3')+');border:1px solid '+(done?'rgba(122,179,86,0.3)':'rgba(74,124,53,0.1)')+';border-radius:8px;min-height:48px;">';
    h+='<span style="font-size:0.7rem;width:28px;text-align:center;">'+(done?'✅':q.icon)+'</span>';
    h+='<div style="flex:1;font-family:DM Mono,monospace;font-size:0.42rem;color:'+(done?'var(--sage)':'var(--cream)')+';'+(done?'text-decoration:line-through;opacity:0.7;':'')+'">'+q.text+'</div>';
    h+='</div>';
  }
  if(d.claimed){
    h+='<div style="text-align:center;margin-top:0.5rem;font-family:DM Mono,monospace;font-size:0.4rem;color:var(--sage);">✨ All quests complete! Come back tomorrow.</div>';
  }
  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};

// Hook into game events to track progress
var _origE=window._e;
if(_origE){
  window._e=function(){
    var result=_origE.apply(this,arguments);
    _trackQuest('gamesWon',1);
    _trackQuest('dewEarned',1);
    return result;
  };
}
// Hook into switchTab for wild visit tracking (uses hook system)
if(window._addSwitchTabHook)_addSwitchTabHook(function(tab){
  if(tab==='wild')_trackQuest('wildVisited',1);
});
// Hook into carousel view for plant inspection
var _origOC=window.openCarousel;
if(_origOC){
  window.openCarousel=function(){
    _origOC.apply(this,arguments);
    _trackQuest('plantsViewed',1);
  };
}

// Init on load
setTimeout(function(){
  _getQuests(); // Generate if needed
  _updateQuestBadge();
  // Track play time
  var _ptStart=Date.now();
  setInterval(function(){
    var mins=Math.floor((Date.now()-_ptStart)/60000);
    if(mins>0){var d=_loadQuests();if(d){d.progress.playTimeMin=mins;localStorage.setItem(QUEST_KEY,JSON.stringify(d));}}
  },60000);
},1500);

window._trackQuest=_trackQuest;
})();

(function(){
'use strict';
var EVT_KEY='lw_wild_events';
var REPORT_KEY='lw_morning_report';
var MAX_EVENTS=500; // Capped for localStorage safety — FIFO eviction

// ── EVENT TYPES ──
// birth: { type:'birth', hash, parentA, parentB, grade, ea, zone, date }
// weather: { type:'weather', hash, name, event:'frost'|'rain'|'drought', survived:bool, date }
// watered: { type:'watered', hash, name, by:'stranger'|keeperName, date }
// spread: { type:'spread', originHash, originName, descendantHash, distance, date }
// invaded: { type:'invaded', defenderHash, defenderName, invaderHash, invaderEA, date }
// feral: { type:'feral', hash, name, collectedBy, date }

function _loadEvents(){
  try{return JSON.parse(localStorage.getItem(EVT_KEY)||'[]');}catch(e){return[];}
}
function _saveEvents(evts){
  if(evts.length>MAX_EVENTS)evts=evts.slice(evts.length-MAX_EVENTS);
  localStorage.setItem(EVT_KEY,JSON.stringify(evts));
}

// Log a new event
window._logWildEvent=function(evt){
  if(!evt||!evt.type)return;
  evt.date=evt.date||new Date().toISOString();
  evt.ts=Date.now();
  var evts=_loadEvents();
  evts.push(evt);
  _saveEvents(evts);
};

// ── MORNING REPORT ──
// Generates 2-3 narrative lines from recent events

function _generateReport(){
  var evts=_loadEvents();
  var now=Date.now();
  var dayAgo=now-86400000;
  var recent=evts.filter(function(e){return(e.ts||0)>dayAgo;});
  var lines=[];

  // Count event types
  var births=recent.filter(function(e){return e.type==='birth';});
  var weatherEvents=recent.filter(function(e){return e.type==='weather';});
  var waterings=recent.filter(function(e){return e.type==='watered';});
  var spreads=recent.filter(function(e){return e.type==='spread';});
  var invasions=recent.filter(function(e){return e.type==='invaded';});
  var rareEvts=recent.filter(function(e){return e.type==='rare';});
  var triggerEvts=recent.filter(function(e){return e.type==='trigger';});

  // Trigger discoveries (compendium unlocks — the riddle moments)
  if(triggerEvts.length>0){
    var te=triggerEvts[0];
    lines.push({icon:'🔮',text:'Secret discovered: '+te.name+'. Your '+te.plantName+' revealed something hidden.',color:'rgba(255,110,199,0.9)'});
  }

  // Companion ability stories
  var compEvts=recent.filter(function(e){return e.type==='companion';});
  if(compEvts.length>0){
    var ce2=compEvts[compEvts.length-1];
    lines.push({icon:'🐾',text:ce2.text||ce2.companion+' did something helpful.',color:'var(--sage)'});
  }

  // Phenotype revelation stories
  var phenoEvts=recent.filter(function(e){return e.type==='phenotype';});
  if(phenoEvts.length>0){
    var pe=phenoEvts[0];
    lines.push({icon:'✨',text:'Hidden trait revealed on your '+pe.plantName+': '+pe.phenotype+'.',color:'rgba(200,168,75,0.9)'});
  }

  // Chorus stories
  var chorusEvts=recent.filter(function(e){return e.type==='chorus';});
  if(chorusEvts.length>0){
    var ch=chorusEvts[0];
    lines.push({icon:'🎵',text:'A Bloom Chorus formed — '+ch.plants+' flowers in harmony. Score: '+ch.score+'.',color:'rgba(232,160,191,0.9)'});
  }

  // Commons stories
  var commonsEvts=recent.filter(function(e){return e.type==='commons';});
  if(commonsEvts.length>0){
    var ce=commonsEvts[0];
    lines.push({icon:'🌳',text:ce.name+' emerged — '+ce.plants+' plants from '+ce.owners+' keepers formed an ecosystem.',color:'var(--gold)'});
  }

  // Mesh stories
  var meshEvts=recent.filter(function(e){return e.type==='mesh';});
  if(meshEvts.length>0){
    var me=meshEvts[meshEvts.length-1];
    if(me.event==='stage_up'){
      lines.push({icon:'🍄',text:'Your underground network grew to '+me.stage+'. The roots go deeper.',color:'var(--sage)'});
    }else if(me.event==='germination'){
      lines.push({icon:'🌱',text:'A new mycelial connection is forming underground between your plants.',color:'var(--muted)'});
    }
  }

  // Natural event stories
  var naturalEvts=recent.filter(function(e){return e.type==='natural';});
  if(naturalEvts.length>0){
    var ne=naturalEvts[naturalEvts.length-1]; // most recent
    lines.push({icon:ne.event==='frost_nip'?'🥶':ne.event==='companion_nap'?'😴':ne.event==='starfall_dust'?'✨':'🌿',
      text:ne.text||(ne.name+' happened to your '+ne.plantName+'.'),
      color:ne.event==='frost_nip'?'rgba(160,196,232,0.9)':'var(--sage)'});
  }

  // Rare event stories (priority — these are the screenshot moments)
  if(rareEvts.length>0){
    var re=rareEvts[0];
    if(re.event==='twin_birth'){
      lines.push({icon:'👯',text:'Twins! Two seedlings sprouted from the same cross near you.',color:'var(--gold)'});
    }else if(re.event==='mutation_bloom'){
      lines.push({icon:'🧬',text:'Something unusual happened. A seedling developed a '+re.mutation+' mutation.',color:'rgba(255,110,199,0.9)'});
    }else if(re.event==='vagrant_seed'){
      lines.push({icon:'🌬️',text:'The wind carried a seed far from its parents. It landed somewhere unexpected.',color:'rgba(200,168,75,0.8)'});
    }else if(re.event==='albino_seedling'){
      lines.push({icon:'🤍',text:'A pale seedling appeared nearby. It won\'t last long without help.',color:'rgba(232,220,200,0.9)'});
    }else if(re.event==='biome_mutation'){
      lines.push({icon:'🧬',text:'Your '+re.biome+' biome produced a '+re.mutation+' mutation on a feral!',color:'rgba(255,110,199,0.9)'});
    }
  }

  // Birth stories
  if(births.length>0){
    var b=births[births.length-1]; // most recent
    var nm=b.name||window.getPlantName&&window.getPlantName(b.hash)||'A wild seedling';
    if(births.length===1){
      lines.push({icon:'🌱',text:nm+' sprouted from a cross near you. '+b.grade+', EA '+b.ea+'.',color:'var(--sage)'});
    }else{
      lines.push({icon:'🌱',text:births.length+' new plants sprouted overnight. Strongest: '+nm+' ('+b.grade+', EA '+b.ea+').',color:'var(--sage)'});
    }
  }

  // Weather stories
  if(weatherEvents.length>0){
    var we=weatherEvents[0];
    var wIcons={heavy_rain:'🌧️',rain:'🌦️',drought:'🏜️',frost:'🥶'};
    var wTexts={heavy_rain:'Heavy rain soaked the area. Your plants are thriving.',rain:'Light rain nourished the soil overnight.',drought:'Hot and dry. Your plants are stressed but holding.',frost:'A cold front passed through. Frost-sensitive plants are struggling.'};
    lines.push({icon:wIcons[we.event]||'⛅',text:wTexts[we.event]||'Weather passed through your area.',
      color:we.event==='drought'||we.event==='frost'?'rgba(192,112,112,0.7)':'rgba(91,175,220,0.9)'});
  }

  // Watering stories
  var strangerWaters=waterings.filter(function(e){return e.by&&e.by!=='self';});
  if(strangerWaters.length>0){
    var uniqueWaterers={};strangerWaters.forEach(function(w){uniqueWaterers[w.by]=true;});
    var wCount=Object.keys(uniqueWaterers).length;
    lines.push({icon:'💧',text:wCount+' stranger'+(wCount>1?'s':'')+' watered your plants overnight.',color:'rgba(91,175,220,0.9)'});
  }

  // Spread stories
  if(spreads.length>0){
    var s=spreads[spreads.length-1];
    lines.push({icon:'🌿',text:'A descendant of your '+s.originName+' was found '+Math.round(s.distance||0)+'m away.',color:'var(--gold)'});
  }

  // Invasion stories
  if(invasions.length>0){
    var inv=invasions[0];
    lines.push({icon:'⚔️',text:'Your '+inv.defenderName+' was outcompeted by a wild seedling (EA '+inv.invaderEA+').',color:'rgba(192,112,112,0.8)'});
  }

  // Feral decay stories (plant went feral from neglect)
  var feralEvts=recent.filter(function(e){return e.type==='feral';});
  if(feralEvts.length>0){
    var fe=feralEvts[0];
    lines.push({icon:'💀',text:'Your '+(fe.name||'plant')+' went feral from neglect. Its genetics live on in the wild.',color:'rgba(192,112,112,0.7)'});
  }

  // Biome-related stories
  if(lines.length<3&&window._lastDetectedBiome&&window.getBiomeInfo){
    var _bReport=getBiomeInfo(window._lastDetectedBiome);
    if(_bReport.mutation){
      lines.push({icon:_bReport.icon,text:'Your '+_bReport.name+' biome has a chance of producing '+_bReport.mutation+' mutations.',color:_bReport.color});
    }
  }

  // If nothing happened — seasonal idle messages
  if(lines.length===0){
    var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
    var _month=new Date().getMonth();
    var _idleMessages=[
      // Spring (Mar-May)
      ['🌸','The spring air hums with possibility. Your plants are dreaming of new growth.'],
      ['🌱','Roots stretch deeper in the warming soil. Something is preparing to bloom.'],
      // Summer (Jun-Aug)
      ['☀️','Long days and warm nights. Your plants soak in every hour of light.'],
      ['🌻','The heat brings out the strongest. Your garden stands tall.'],
      // Autumn (Sep-Nov)
      ['🍂','Leaves are turning. The garden settles into a golden pause.'],
      ['🍁','Seeds are scattering on the autumn wind. Someone will find them.'],
      // Winter (Dec-Feb)
      ['❄️','The quiet season. Beneath the frost, roots are still reaching.'],
      ['🌙','A cold clear night. Your plants rest under starlight.']
    ];
    var _seasonIdx=_month<3?6:_month<6?0:_month<9?2:4; // map month to season pair
    var _dayPick=new Date().getDate()%2; // alternate daily
    var _idle=_idleMessages[_seasonIdx+_dayPick];
    if(wild.length>0){
      lines.push({icon:_idle[0],text:_idle[1],color:'var(--muted)'});
    }else{
      lines.push({icon:'🗺️',text:'No plants in the wild yet. Drop one on the map to start your legacy.',color:'var(--muted)'});
    }
  }

  return lines.slice(0,3); // max 3 lines
}

// ── MORNING REPORT UI ──
function _showMorningReport(){
  // Don't show if already shown today
  var lastShown=localStorage.getItem(REPORT_KEY);
  var today=new Date().toISOString().split('T')[0];
  if(lastShown===today)return;
  if(localStorage.getItem('pw_onboarded')!=='1')return;

  var lines=_generateReport();
  if(lines.length===0)return;

  // Delay to let app settle
  setTimeout(function(){
    var ov=document.createElement('div');
    ov.id='morning-report';
    ov.style.cssText='position:fixed;inset:0;z-index:99995;background:rgba(5,8,4,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:panelFadeIn 0.4s ease;';

    var h='<div style="width:88%;max-width:340px;text-align:center;">';
    // Header
    h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.9rem;color:var(--gold);margin-bottom:0.3rem;opacity:0.7;">overnight</div>';
    h+='<div style="width:40px;height:1px;background:rgba(200,168,75,0.3);margin:0 auto 0.8rem;"></div>';

    // Lines — staggered fade in
    for(var i=0;i<lines.length;i++){
      var l=lines[i];
      h+='<div style="margin-bottom:0.6rem;opacity:0;animation:tierFadeIn 0.6s ease '+(0.3+i*0.4)+'s forwards;">';
      h+='<span style="font-size:0.65rem;">'+l.icon+'</span>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.42rem;color:'+l.color+';line-height:1.6;margin-top:0.15rem;">'+l.text+'</div>';
      h+='</div>';
    }

    // Dismiss
    h+='<button onclick="var mr=document.getElementById(\'morning-report\');if(mr)mr.remove();" style="margin-top:0.6rem;padding:0.5rem 2rem;border:1.5px solid rgba(122,179,86,0.2);border-radius:8px;background:rgba(26,36,22,0.3);color:var(--sage);font-family:Bebas Neue,sans-serif;font-size:0.55rem;letter-spacing:0.1em;cursor:pointer;min-height:48px;opacity:0;animation:tierFadeIn 0.5s ease '+(0.3+lines.length*0.4+0.2)+'s forwards;">TEND YOUR GARDEN</button>';
    h+='</div>';

    ov.innerHTML=h;
    document.body.appendChild(ov);
    localStorage.setItem(REPORT_KEY,today);

    // Auto-dismiss after 12 seconds
    setTimeout(function(){var mr=document.getElementById('morning-report');if(mr){mr.style.transition='opacity 0.5s ease';mr.style.opacity='0';setTimeout(function(){if(mr.parentNode)mr.parentNode.removeChild(mr);},500);}},12000);
  },2500);
}

// Wire reproduction events into the log
var _origLogBirth=window._swsLog;
// Hook: log births from reproduction engine
window._logWildBirth=function(data){
  if(!data)return;
  var nm='';try{nm=window.getPlantName?window.getPlantName(data.hash):'';}catch(e){}
  window._logWildEvent({
    type:'birth',hash:data.hash,name:nm,
    parentA:data.parentA,parentB:data.parentB,
    grade:data.grade||'Common',ea:data.ea||0,
    zone:data.zone||'',weather:data.weatherAtBirth||null
  });
};

// Show report on app load
setTimeout(_showMorningReport,3500);

// Expose for testing
window._showMorningReport=_showMorningReport;
window._generateReport=_generateReport;
window._getWildEvents=_loadEvents;
})();

(function(){
'use strict';

var CATEGORIES=[
  {key:'trait',    label:'SYNERGIES',    icon:'✦', color:'var(--sage)'},
  {key:'companion',label:'COMPANIONS',  icon:'🐾', color:'var(--gold)'},
  {key:'weather',  label:'WEATHER',     icon:'⛅', color:'rgba(91,175,220,0.9)'},
  {key:'season',   label:'SEASONS',     icon:'🌸', color:'rgba(232,160,191,0.9)'},
  {key:'action',   label:'ACTIONS',     icon:'👤', color:'var(--cream)'},
  {key:'natural',  label:'EVENTS',      icon:'🌿', color:'var(--sage)'}
];

window._openCompendiumUI=function(){
  var triggers=window.getCompendium?window.getCompendium():[];
  var progress=window.getCompendiumProgress?window.getCompendiumProgress():{found:0,total:0,pct:0};

  // Also get synergy discoveries from plants
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var foundSynergies={};
  for(var si=0;si<gh.length;si++){
    try{
      var t=window.hashToTraits?window.hashToTraits(gh[si].hash):null;
      if(!t)continue;
      var syn=window.getSynergy?window.getSynergy(t):null;
      if(syn&&syn.all){
        for(var sj=0;sj<syn.all.length;sj++)foundSynergies[syn.all[sj].name]=syn.all[sj];
      }else if(syn){foundSynergies[syn.name]=syn;}
    }catch(e){}
  }
  var synCount=Object.keys(foundSynergies).length;
  var totalDiscovered=progress.found+synCount;

  var ov=document.createElement('div');
  ov.id='compendium-overlay';
  ov.style.cssText='position:fixed;inset:0;z-index:99996;background:rgba(5,8,4,0.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:flex;flex-direction:column;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:panelFadeIn 0.3s ease;';

  var h='<div style="padding:1rem;max-width:400px;margin:0 auto;width:100%;">';
  // Header
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;">';
  h+='<div><div style="font-family:Cormorant Garamond,serif;font-size:0.85rem;color:var(--gold);">Book of Secrets</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.38rem;color:var(--muted);">'+totalDiscovered+' discovered</div></div>';
  h+='<button onclick="var co=document.getElementById(\'compendium-overlay\');if(co)co.remove();" style="width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(138,145,120,0.25);background:rgba(26,36,22,0.5);color:var(--cream);font-size:0.6rem;cursor:pointer;min-height:48px;min-width:48px;">✕</button>';
  h+='</div>';

  // Progress bar
  var totalAll=60+progress.total; // synergies + triggers
  var pctAll=Math.round(totalDiscovered/totalAll*100);
  h+='<div style="margin-bottom:0.8rem;">';
  h+='<div style="display:flex;justify-content:space-between;font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin-bottom:3px;"><span>'+totalDiscovered+' / '+totalAll+'</span><span>'+pctAll+'%</span></div>';
  h+='<div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;"><div style="height:100%;width:'+pctAll+'%;background:linear-gradient(90deg,rgba(122,179,86,0.6),rgba(200,168,75,0.7));border-radius:2px;transition:width 0.4s;"></div></div>';
  h+='</div>';

  // Synergies section
  h+='<div style="margin-bottom:0.8rem;">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.6rem;color:var(--sage);letter-spacing:0.1em;margin-bottom:0.4rem;">✦ SYNERGIES <span style="color:var(--muted);font-size:0.4rem;">'+synCount+' / 60</span></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;">';
  // Build synergy grid from _SYNERGIES
  if(window._SYNERGIES){
    // Can't access _SYNERGIES directly (inside IIFE), use getSynergy approach
    // Instead show discovered synergies
    var synKeys=Object.keys(foundSynergies);
    for(var sk=0;sk<Math.min(synKeys.length,60);sk++){
      var s=foundSynergies[synKeys[sk]];
      h+='<div style="padding:4px;background:rgba(122,179,86,0.08);border:1px solid rgba(122,179,86,0.15);border-radius:6px;text-align:center;min-height:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;" title="'+s.name+': '+s.fx+'">';
      h+='<div style="font-size:0.5rem;">✦</div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.25rem;color:var(--sage);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">'+s.name+'</div>';
      h+='</div>';
    }
    // Fill remaining as locked
    for(var sl=synKeys.length;sl<60;sl++){
      h+='<div style="padding:4px;background:rgba(26,36,22,0.3);border:1px solid rgba(74,124,53,0.06);border-radius:6px;text-align:center;min-height:36px;display:flex;align-items:center;justify-content:center;opacity:0.4;">';
      h+='<div style="font-size:0.4rem;color:var(--muted);">?</div>';
      h+='</div>';
    }
  }
  h+='</div></div>';

  // Biomes section
  if(window.BIOMES){
    var biomeCache={};try{biomeCache=JSON.parse(localStorage.getItem('lw_biome_cache')||'{}');}catch(e){}
    var discoveredBiomes={};
    var bKeys=Object.keys(biomeCache);
    for(var bk=0;bk<bKeys.length;bk++){if(bKeys[bk]!=='_lastBiome'&&biomeCache[bKeys[bk]].biome)discoveredBiomes[biomeCache[bKeys[bk]].biome]=true;}
    var biomeKeys=Object.keys(BIOMES);
    var biomeFound=Object.keys(discoveredBiomes).length;
    h+='<div style="margin-bottom:0.8rem;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.55rem;color:var(--sage);letter-spacing:0.1em;margin-bottom:0.4rem;">🌍 BIOMES <span style="color:var(--muted);font-size:0.4rem;">'+biomeFound+' / '+biomeKeys.length+'</span></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;">';
    for(var bi2=0;bi2<biomeKeys.length;bi2++){
      var bm=BIOMES[biomeKeys[bi2]];
      var discovered=discoveredBiomes[biomeKeys[bi2]];
      h+='<div style="padding:4px;background:'+(discovered?'rgba(122,179,86,0.08)':'rgba(26,36,22,0.3)')+';border:1px solid '+(discovered?bm.color+'33':'rgba(74,124,53,0.06)')+';border-radius:6px;text-align:center;min-height:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;'+(discovered?'':'opacity:0.4;')+'">';
      h+='<div style="font-size:0.5rem;">'+(discovered?bm.icon:'?')+'</div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.22rem;color:'+(discovered?bm.color:'var(--muted)')+';">'+(discovered?bm.name:'???')+'</div>';
      h+='</div>';
    }
    h+='</div></div>';
  }

  // Triggers section by category
  for(var ci=0;ci<CATEGORIES.length;ci++){
    var cat=CATEGORIES[ci];
    var catTriggers=triggers.filter(function(t){return t.category===cat.key;});
    if(catTriggers.length===0)continue;
    var catFound=catTriggers.filter(function(t){return t.unlocked;}).length;

    h+='<div style="margin-bottom:0.8rem;">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.55rem;color:'+cat.color+';letter-spacing:0.1em;margin-bottom:0.4rem;">'+cat.icon+' '+cat.label+' <span style="color:var(--muted);font-size:0.4rem;">'+catFound+' / '+catTriggers.length+'</span></div>';

    for(var ti=0;ti<catTriggers.length;ti++){
      var tr=catTriggers[ti];
      if(tr.unlocked){
        h+='<div style="padding:0.4rem;margin-bottom:4px;background:rgba(18,22,16,0.6);border:1px solid '+cat.color+'33;border-left:3px solid '+cat.color+';border-radius:6px;">';
        h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.5rem;color:'+cat.color+';">'+tr.name+'</div>';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--cream);margin-top:2px;">'+tr.effect+'</div>';
        h+='</div>';
      }else{
        h+='<div style="padding:0.4rem;margin-bottom:4px;background:rgba(13,16,12,0.4);border:1px solid rgba(74,124,53,0.06);border-left:3px solid rgba(138,145,120,0.15);border-radius:6px;">';
        h+='<div style="font-family:DM Mono,monospace;font-size:0.4rem;color:var(--muted);font-style:italic;">\"'+tr.riddle+'\"</div>';
        h+='</div>';
      }
    }
    h+='</div>';
  }

  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};

// Update compendium count in keeper bar
function _updateCompCount(){
  var el=document.getElementById('kb-comp-count');if(!el)return;
  // Progressive disclosure: only show compendium button when earned.
  // Uses .has-entries class so the CSS flex rules win over display:none.
  var compBtn=document.getElementById('kb-compendium');
  if(compBtn){
    var show=(window.canSee&&window.canSee.compendium());
    if(show)compBtn.classList.add('has-entries');
    else compBtn.classList.remove('has-entries');
  }
  var progress=window.getCompendiumProgress?window.getCompendiumProgress():{found:0};
  // Count synergies from greenhouse
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  var synSet={};
  for(var i=0;i<gh.length;i++){
    try{var t=window.hashToTraits?window.hashToTraits(gh[i].hash):null;if(!t)continue;
      var syn=window.getSynergy?window.getSynergy(t):null;
      if(syn&&syn.all)syn.all.forEach(function(s){synSet[s.name]=1;});
      else if(syn)synSet[syn.name]=1;
    }catch(e){}
  }
  el.textContent=(progress.found+Object.keys(synSet).length);
}
setTimeout(_updateCompCount,3000);
window._updateCompCount=_updateCompCount;
})();

(function(){
'use strict';

window.openAncestryViewer=function(plant){
  if(!plant)return;
  closePlantActionDrawer();
  var ov=document.createElement('div');
  ov.id='ancestry-viewer';
  ov.style.cssText='position:fixed;inset:0;z-index:99996;background:rgba(5,8,4,0.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow-y:auto;-webkit-overflow-scrolling:touch;animation:panelFadeIn 0.3s ease;';

  var nm=window.getPlantName?window.getPlantName(plant.hash):'Plant';
  var gen=plant.generation||1;
  var h='<div style="width:100%;max-width:380px;">';
  // Header
  h+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;">';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--gold);letter-spacing:0.1em;">ANCESTRY</div>';
  h+='<button onclick="var av=document.getElementById(\'ancestry-viewer\');if(av)av.remove();" style="width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(138,145,120,0.25);background:rgba(26,36,22,0.5);color:var(--cream);font-size:0.6rem;cursor:pointer;min-height:48px;min-width:48px;display:flex;align-items:center;justify-content:center;">✕</button>';
  h+='</div>';

  // Current plant (center)
  var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(plant.hash,44);}catch(e){}
  var t=window.hashToTraits?window.hashToTraits(plant.hash):null;
  var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common',color:'var(--cream)',icon:''};
  h+='<div style="text-align:center;padding:0.6rem;background:rgba(18,22,16,0.7);border:2px solid rgba(200,168,75,0.3);border-radius:12px;margin-bottom:0.6rem;">';
  h+='<div style="width:88px;height:88px;margin:0 auto;">'+svg+'</div>';
  h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.6rem;color:var(--cream);margin-top:0.3rem;">'+nm+'</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.38rem;color:'+tg.color+';">'+tg.icon+' '+tg.name+' · Gen '+gen+'</div>';
  h+='</div>';

  // Parents
  if(plant.parentAHash||plant.parentBHash){
    h+='<div style="text-align:center;margin-bottom:0.4rem;">';
    h+='<div style="width:1px;height:20px;background:rgba(200,168,75,0.3);margin:0 auto;"></div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin:0.2rem 0;">PARENTS</div>';
    h+='</div>';
    h+='<div style="display:flex;gap:8px;margin-bottom:0.6rem;">';
    h+=_renderAncestorCard(plant.parentAHash,'Parent A');
    h+=_renderAncestorCard(plant.parentBHash,'Parent B');
    h+='</div>';

    // Grandparents (if we can find them)
    var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
    var ancestry=[];try{ancestry=JSON.parse(localStorage.getItem('sws_ancestry')||'[]');}catch(e){}
    var parentAPlant=_findPlant(plant.parentAHash,gh);
    var parentBPlant=_findPlant(plant.parentBHash,gh);
    var hasGP=false;
    if((parentAPlant&&parentAPlant.parentAHash)||(parentBPlant&&parentBPlant.parentAHash)){
      hasGP=true;
      h+='<div style="text-align:center;margin-bottom:0.4rem;">';
      h+='<div style="width:1px;height:16px;background:rgba(122,179,86,0.2);margin:0 auto;"></div>';
      h+='<div style="font-family:DM Mono,monospace;font-size:0.32rem;color:var(--muted);margin:0.15rem 0;">GRANDPARENTS</div>';
      h+='</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-bottom:0.6rem;">';
      if(parentAPlant){
        h+=_renderAncestorMini(parentAPlant.parentAHash);
        h+=_renderAncestorMini(parentAPlant.parentBHash);
      }else{h+=_renderAncestorMini(null);h+=_renderAncestorMini(null);}
      if(parentBPlant){
        h+=_renderAncestorMini(parentBPlant.parentAHash);
        h+=_renderAncestorMini(parentBPlant.parentBHash);
      }else{h+=_renderAncestorMini(null);h+=_renderAncestorMini(null);}
      h+='</div>';
    }
  }else{
    h+='<div style="text-align:center;padding:0.6rem;color:var(--muted);font-family:DM Mono,monospace;font-size:0.42rem;">';
    h+='Gen 1 — Original mint, no parents.</div>';
  }

  // Haiku
  if(window.getHaiku){
    var hk=window.getHaiku(plant.hash);
    h+='<div style="text-align:center;padding:0.6rem;margin-top:0.4rem;border-top:1px solid rgba(122,179,86,0.1);">';
    h+='<div style="font-family:Cormorant Garamond,serif;font-style:italic;font-size:0.45rem;color:var(--cream);line-height:1.8;">'+hk.line1+'<br>'+hk.line2+'<br>'+hk.line3+'</div>';
    h+='</div>';
  }

  // Hash
  h+='<div style="text-align:center;margin-top:0.3rem;font-family:DM Mono,monospace;font-size:0.3rem;color:rgba(138,145,120,0.4);word-break:break-all;">'+plant.hash+'</div>';

  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
};

function _findPlant(hash,gh){
  if(!hash)return null;
  for(var i=0;i<gh.length;i++){if(gh[i].hash===hash)return gh[i];}
  return null;
}

function _renderAncestorCard(hash,label){
  if(!hash)return'<div style="flex:1;padding:0.4rem;background:rgba(26,36,22,0.4);border:1px dashed rgba(138,145,120,0.2);border-radius:8px;text-align:center;min-height:80px;display:flex;align-items:center;justify-content:center;"><div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);">Unknown</div></div>';
  var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(hash,28);}catch(e){}
  var nm=window.getPlantName?window.getPlantName(hash):'???';
  var t=window.hashToTraits?window.hashToTraits(hash):null;
  var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common',color:'var(--cream)'};
  var h='<div style="flex:1;padding:0.4rem;background:rgba(18,22,16,0.5);border:1.5px solid rgba(122,179,86,0.12);border-radius:8px;text-align:center;">';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.28rem;color:var(--muted);margin-bottom:0.2rem;">'+label+'</div>';
  h+='<div style="width:56px;height:56px;margin:0 auto;">'+svg+'</div>';
  h+='<div style="font-family:Cormorant Garamond,serif;font-size:0.42rem;color:var(--cream);margin-top:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+nm+'</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.28rem;color:'+tg.color+';">'+tg.name+'</div>';
  h+='</div>';
  return h;
}

function _renderAncestorMini(hash){
  if(!hash)return'<div style="padding:0.25rem;background:rgba(26,36,22,0.3);border:1px dashed rgba(138,145,120,0.15);border-radius:6px;text-align:center;min-height:44px;display:flex;align-items:center;justify-content:center;"><div style="font-size:0.25rem;color:var(--muted);">?</div></div>';
  var svg='';try{if(window._generatePlantSVG)svg=window._generatePlantSVG(hash,18);}catch(e){}
  var nm=window.getPlantName?window.getPlantName(hash):'???';
  var h='<div style="padding:0.25rem;background:rgba(18,22,16,0.4);border:1px solid rgba(122,179,86,0.08);border-radius:6px;text-align:center;">';
  h+='<div style="width:36px;height:36px;margin:0 auto;">'+svg+'</div>';
  h+='<div style="font-size:0.25rem;color:var(--cream);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+nm+'</div>';
  h+='</div>';
  return h;
}

})();

(function(){
'use strict';
var _nsEl=null;
var _nsVisible=false;

function _getNextStep(){
  // Priority-ordered checks — return first match
  var gh=[];try{gh=JSON.parse((window._secureGet?window._secureGet('sws_greenhouse'):localStorage.getItem('sws_greenhouse'))||'[]');}catch(e){}
  var nur=[];try{nur=JSON.parse(localStorage.getItem('sws_nursery')||'[]');}catch(e){}
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var hl={};try{hl=JSON.parse((window._secureGet?window._secureGet('sws_hash_ledger'):localStorage.getItem('sws_hash_ledger'))||'{}');}catch(e){}
  var dew=(hl.earned||0)-(hl.spent||0);
  var today=new Date().toISOString().split('T')[0];

  // 1. Nursery seed needs watering today
  for(var i=0;i<nur.length;i++){
    var s=nur[i];
    if(s.status==='growing'&&s.waterLog&&s.waterLog.indexOf(today)===-1){
      var left=3-s.waterLog.length;
      return{icon:'💧',text:'Your seed needs water! '+left+' day'+(left!==1?'s':'')+' until bloom.',action:'nursery',color:'rgba(91,175,220,0.9)'};
    }
  }
  // 2. Nursery seed ready to bloom
  for(var j=0;j<nur.length;j++){
    var s2=nur[j];
    if(s2.status==='growing'&&s2.waterLog&&s2.waterLog.length>=3){
      return{icon:'🌸',text:'A seed is ready to bloom! Tap to reveal your new plant.',action:'nursery',color:'var(--gold)'};
    }
  }
  var _nsCost=window._getMintCost?window._getMintCost():30;
  // 3. Close to minting (>= 2/3 of cost)
  if(dew>=Math.floor(_nsCost*0.66)&&dew<_nsCost){
    return{icon:'🌱',text:'Almost there! '+(_nsCost-dew)+' more dew to mint a new plant.',action:'game',color:'var(--sage)'};
  }
  // 4. No plants yet (besides gift)
  if(gh.length<=1){
    return{icon:'🎮',text:'Play a game to earn dew drops. '+_nsCost+' dew = your next plant!',action:'game',color:'var(--sage)'};
  }
  // 5. Haven't dropped anything in wild yet
  if(gh.length>=3&&wild.length===0){
    return{icon:'🗺️',text:'Try the Wild tab! Drop a plant on the map near you.',action:'wild',color:'rgba(122,179,86,0.8)'};
  }
  // 6. Have plants but haven't bred — only show if plants are actually ready
  if(gh.length>=2&&!localStorage.getItem('lw_first_breed')){
    var eligible=gh.filter(function(p){
      if(window.FG_Data&&FG_Data.getBreedStatus){return FG_Data.getBreedStatus(p).canBreed;}
      return(p.breedCount||0)<3;
    });
    if(eligible.length>=2){
      return{icon:'🧬',text:'You can breed! Open a plant and tap BREED to create offspring.',action:'greenhouse',color:'var(--gold)'};
    }
  }
  // 7. Greenhouse getting full
  if(gh.length>=8&&gh.length<=10){
    return{icon:'📦',text:gh.length+'/10 slots used. Compost a plant for fertilizer or expand storage.',action:'greenhouse',color:'rgba(200,168,75,0.8)'};
  }
  // 8. Default: earn more
  if(dew<Math.floor(_nsCost*0.33)){
    return{icon:'🎯',text:'Play games to earn dew. '+dew+'/'+_nsCost+' toward your next plant.',action:'game',color:'var(--muted)'};
  }
  // 9. Mid-progress
  return{icon:'🌿',text:dew+'/'+_nsCost+' dew collected. Keep playing to mint your next plant!',action:'game',color:'var(--sage)'};
}

function _updateNextStep(){
  if(!_nsEl)_nsEl=document.getElementById('lw-next-step');
  if(!_nsEl)return;
  // Don't show during onboarding
  if(localStorage.getItem('pw_onboarded')!=='1'){_nsEl.style.display='none';return;}
  var step=_getNextStep();
  _nsEl.innerHTML='<span style="font-size:0.55rem;">'+step.icon+'</span> <span style="color:'+step.color+';">'+step.text+'</span>';
  _nsEl.onclick=function(){if(window.switchTab)switchTab(step.action);};
  _nsEl.style.display='flex';
  _nsVisible=true;
}

// Update on tab switch (uses hook system)
if(window._addSwitchTabHook)_addSwitchTabHook(function(){
  setTimeout(_updateNextStep,200);
});

// Update on key events
window.addEventListener('lw-hash-earned',function(){setTimeout(_updateNextStep,500);});
window.addEventListener('lw-plant-minted',function(){setTimeout(_updateNextStep,500);});

// Initial update after load
setTimeout(function(){
  _updateNextStep();
  // Re-check every 30 seconds for nursery watering
  setInterval(_updateNextStep,30000);
},2000);

window._updateNextStep=_updateNextStep;
})();

  // ═══ Splash screen fade (set-38b) ═══
  // Splash dismisses first, THEN triggers onboarding text
  (function(){
    var sp=document.getElementById('pw-splash');
    if(!sp){
      // No splash — trigger text immediately if onboarding is active
      if(window._obTextReady)window._obTextReady();
      return;
    }
    setTimeout(function(){
      sp.style.transition='opacity 2s ease';
      sp.style.opacity='0';
      sp.style.pointerEvents='none';
    },4000);
    setTimeout(function(){
      if(sp.parentNode)sp.parentNode.removeChild(sp);
      // NOW tell onboarding it's safe to show text
      if(window._obTextReady)window._obTextReady();
    },6200);
  })();

window.addEventListener('load',function(){
  setTimeout(function(){
    var popular=['memory','merge','klondike','chess','mines'];
    for(var i=0;i<popular.length;i++){
      var link=document.createElement('link');
      link.rel='prefetch';
      link.href='games/'+popular[i]+'.js?v='+LW_VERSION;
      link.as='script';
      document.head.appendChild(link);
    }
  },8000);
});

(function(){
'use strict';

// ── Permission prompt banner (shown after daily login dismiss) ──
window._lwNotifPrompt = function() {
  if (localStorage.getItem('lw_notif_asked')) return;
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    localStorage.setItem('lw_notif_asked', '1');
    return;
  }
  if (Notification.permission === 'denied') {
    localStorage.setItem('lw_notif_asked', '1');
    return;
  }

  var _autoTimer = null;

  var bar = document.createElement('div');
  bar.id = 'lw-notif-bar';
  bar.style.cssText = 'position:fixed;bottom:calc(var(--nav-h,58px) + var(--sb,0px) + 6px);left:8px;right:8px;z-index:99990;' +
    'background:rgba(13,16,12,0.96);border:1.5px solid rgba(122,179,86,0.3);border-radius:12px;' +
    'padding:0.7rem 0.8rem;display:flex;align-items:center;gap:0.6rem;' +
    'box-shadow:0 8px 28px rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
    'animation:panelFadeIn 0.3s ease;';

  var txt = document.createElement('span');
  txt.style.cssText = 'flex:1;font-family:DM Mono,monospace;font-size:0.42rem;color:var(--cream,#e8dcc8);line-height:1.3;';
  txt.textContent = 'Get notified when seeds are ready?';

  var btnYes = document.createElement('button');
  btnYes.textContent = 'YES';
  btnYes.style.cssText = 'min-width:54px;min-height:48px;padding:0.35rem 0.6rem;border:1.5px solid rgba(122,179,86,0.4);' +
    'border-radius:8px;background:linear-gradient(180deg,rgba(74,124,53,0.35),rgba(46,80,36,0.45));' +
    'color:var(--sage,#7ab356);font-family:DM Mono,monospace;font-size:0.42rem;font-weight:700;' +
    'letter-spacing:0.08em;cursor:pointer;';

  var btnNo = document.createElement('button');
  btnNo.textContent = 'NOT NOW';
  btnNo.style.cssText = 'min-width:54px;min-height:48px;padding:0.35rem 0.6rem;border:1px solid rgba(138,145,120,0.25);' +
    'border-radius:8px;background:transparent;color:var(--muted,#8a9178);' +
    'font-family:DM Mono,monospace;font-size:0.38rem;letter-spacing:0.05em;cursor:pointer;';

  function dismiss() {
    localStorage.setItem('lw_notif_asked', '1');
    if (bar.parentNode) bar.parentNode.removeChild(bar);
    if (_autoTimer) clearTimeout(_autoTimer);
  }

  btnYes.onclick = function() {
    Notification.requestPermission().then(function(perm) {
      if (perm === 'granted') {
        _checkNurSeedsOnLoad();
      }
    });
    dismiss();
  };

  btnNo.onclick = function() {
    dismiss();
  };

  bar.appendChild(txt);
  bar.appendChild(btnYes);
  bar.appendChild(btnNo);
  document.body.appendChild(bar);

  _autoTimer = setTimeout(function() {
    if (bar.parentNode) {
      bar.style.transition = 'opacity 0.4s ease';
      bar.style.opacity = '0';
      setTimeout(function() {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 450);
    }
    localStorage.setItem('lw_notif_asked', '1');
  }, 10000);
};

// ── Schedule nursery notification ──
var _nurTimers = {};

window._scheduleNurNotif = function(seed, bloomReady) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;

  if (bloomReady) {
    _fireNurNotif('Your seed is ready to bloom!', 'Tap to open the Nursery and bloom your plant.');
    return;
  }

  var now = new Date();
  var midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 5, 0);
  var msUntil = midnight.getTime() - now.getTime();

  var sid = seed.id || seed.seedHash || 'default';
  if (_nurTimers[sid]) clearTimeout(_nurTimers[sid]);

  _nurTimers[sid] = setTimeout(function() {
    var daysLeft = 3 - (seed.waterLog ? seed.waterLog.length : 0);
    if (daysLeft > 0) {
      _fireNurNotif(
        'Time to water your seed!',
        daysLeft + ' watering' + (daysLeft > 1 ? 's' : '') + ' left until bloom.'
      );
    }
    delete _nurTimers[sid];
  }, msUntil);
};

function _fireNurNotif(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then(function(reg) {
    reg.showNotification(title, {
      body: body,
      icon: 'assets/notification-icon-192.png',
      badge: 'assets/notification-icon-192.png',
      tag: 'lw-nursery',
      renotify: true,
      vibrate: [100, 50, 100]
    });
  });
}

// ── Page load: check if seeds need watering (for backgrounded returns) ──
function _checkNurSeedsOnLoad() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  var nur;
  try {
    nur = JSON.parse(localStorage.getItem('sws_nursery') || '[]');
  } catch(e) { return; }
  if (!nur || !nur.length) return;

  var today = new Date().toISOString().split('T')[0];
  var needWater = 0;
  var bloomReady = 0;

  for (var i = 0; i < nur.length; i++) {
    var s = nur[i];
    if (s.status !== 'growing') continue;
    var wl = s.waterLog || [];
    if (wl.length >= 3) {
      bloomReady++;
    } else if (wl.indexOf(today) === -1) {
      needWater++;
    }
  }

  if (bloomReady > 0) {
    _fireNurNotif(
      bloomReady + ' seed' + (bloomReady > 1 ? 's are' : ' is') + ' ready to bloom!',
      'Tap to open Lucid Winds and bloom.'
    );
  } else if (needWater > 0) {
    _fireNurNotif(
      needWater + ' seed' + (needWater > 1 ? 's need' : ' needs') + ' watering today',
      'Open the Nursery to water your seeds.'
    );
  }
}

document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    setTimeout(_checkNurSeedsOnLoad, 2000);
  }
});

window.addEventListener('load', function() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  setTimeout(function() {
    var nur;
    try {
      nur = JSON.parse(localStorage.getItem('sws_nursery') || '[]');
    } catch(e) { return; }
    if (!nur || !nur.length) return;
    var today = new Date().toISOString().split('T')[0];
    for (var i = 0; i < nur.length; i++) {
      var s = nur[i];
      if (s.status !== 'growing') continue;
      var wl = s.waterLog || [];
      if (wl.length < 3 && wl.indexOf(today) !== -1) {
        window._scheduleNurNotif(s);
      }
    }
  }, 3000);
});

})();

(function(){
'use strict';
// Register hooks instead of wrapping switchTab repeatedly
// Hooks fire AFTER the original switchTab completes
window._switchTabHooks=[];
window._addSwitchTabHook=function(fn){
  if(typeof fn==='function')window._switchTabHooks.push(fn);
};
// Applied at end of file as the FINAL wrapper
})();

(function(){
'use strict';
// Shared in-memory cache for greenhouse and wild plants
// Invalidated on every write — reads are instant
var _ghCache=null, _ghCacheTick=0;
var _wildCache=null, _wildCacheTick=0;
var _nurCache=null, _nurCacheTick=0;

window._plantCache={
  greenhouse:function(){
    var raw=localStorage.getItem('sws_greenhouse');
    var tick=raw?raw.length:0; // cheap change detection
    if(_ghCache&&_ghCacheTick===tick)return _ghCache;
    try{_ghCache=JSON.parse(raw||'[]');}catch(e){_ghCache=[];}
    _ghCacheTick=tick;
    return _ghCache;
  },
  wild:function(){
    var raw=localStorage.getItem('fg_wild_plants');
    var tick=raw?raw.length:0;
    if(_wildCache&&_wildCacheTick===tick)return _wildCache;
    try{_wildCache=JSON.parse(raw||'[]');}catch(e){_wildCache=[];}
    _wildCacheTick=tick;
    return _wildCache;
  },
  nursery:function(){
    var raw=localStorage.getItem('sws_nursery');
    var tick=raw?raw.length:0;
    if(_nurCache&&_nurCacheTick===tick)return _nurCache;
    try{_nurCache=JSON.parse(raw||'[]');}catch(e){_nurCache=[];}
    _nurCacheTick=tick;
    return _nurCache;
  },
  invalidate:function(which){
    if(!which||which==='greenhouse'){_ghCache=null;_ghCacheTick=0;}
    if(!which||which==='wild'){_wildCache=null;_wildCacheTick=0;}
    if(!which||which==='nursery'){_nurCache=null;_nurCacheTick=0;}
  }
};
})();

(function(){
'use strict';
// Read the current Keeper level without depending on PW_UI closure scope.
function _lwLevel(){
  try{
    var xp=parseInt(localStorage.getItem('pw_xp')||'0');
    var ranks=[0,25,75,175,350,600,950,1400,2000,2800,3800,5000,6500,8500,11000,14000,17500,22000,27500,34000,42000,52000,65000,80000,100000,125000,155000,190000,235000,290000,355000,435000,530000,640000,770000,920000,1100000,1310000,1555000,1840000,2170000,2550000,2985000,3480000,4040000,4675000,5390000,6195000,7100000,8115000];
    for(var i=ranks.length-1;i>=0;i--){if(xp>=ranks[i])return i+1;}
    return 1;
  }catch(e){return 1;}
}
// Gate advanced features based on player progress.
// Each returns true if the feature should be VISIBLE. Wild v3 level gates
// are folded in alongside existing activity-based gates.
window.canSee = {
  // ── Wild v3 level gates (use Keeper level) ──
  strangerTend: function(){return _lwLevel()>=5;},
  greenhouseBreed: function(){return _lwLevel()>=7;},
  fruitHarvest: function(){return _lwLevel()>=10;},
  nurseryMergeBreed: function(){return _lwLevel()>=12;},
  wildCutting: function(){return _lwLevel()>=15;},
  bookOfSecretsPages: function(){return _lwLevel()>=19;},
  fourthWildDrop: function(){return _lwLevel()>=23;},
  masterKeeper: function(){return _lwLevel()>=25;},
  levelGate: function(n){return _lwLevel()>=(n||0);},
  currentLevel: function(){return _lwLevel();},
  // ── Existing activity-based gates (preserved for backwards compat) ──
  compendium: function() {
    // Show after first synergy or 5+ plants
    var gh=[]; try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
    if(gh.length>=5)return true;
    var disc=[];try{disc=JSON.parse(localStorage.getItem('lw_triggers_found')||'[]');}catch(e){}
    return disc.length>0;
  },
  breeding: function() {
    // Show after 2+ plants
    var gh=[]; try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
    return gh.length>=2;
  },
  wildTab: function() {
    // Always visible but prompt changes
    var gh=[]; try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
    return gh.length>=2;
  },
  meshInfo: function() {
    // Show after first wild drop
    return !!localStorage.getItem('lw_first_drop');
  },
  soilInfo: function() {
    return !!localStorage.getItem('lw_first_drop');
  },
  biomeInfo: function() {
    return !!localStorage.getItem('lw_first_drop');
  },
  territory: function() {
    var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
    return wild.length>=3;
  },
  constellation: function() {
    var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
    return wild.length>=3;
  },
  breedForecast: function() {
    return !!localStorage.getItem('lw_first_breed');
  },
  questPanel: function() {
    // Show after first game win
    var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
    return gh.length>=1;
  }
};
})();

(function(){
'use strict';
// Beholder companion reveals feral seed locations within 1km (normally 500m/75m)
// Checks once per Wild tab visit
window._checkBeholderOmnisight=function(){
  // Does the player own a Beholder?
  var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
  var hasBeholder=false;
  for(var i=0;i<gh.length;i++){
    try{var t=window.hashToTraits?window.hashToTraits(gh[i].hash):null;if(t&&t.companion===38)hasBeholder=true;}catch(e){}
  }
  if(!hasBeholder)return;

  // Show extended feral info toast
  var ferals=[];try{ferals=JSON.parse(localStorage.getItem('fg_ferals')||'[]');}catch(e){}
  var feralCount=ferals.filter(function(f){return!f.collected;}).length;

  // Count plants in extended range
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var shared=0;
  if(window._sharedMarkers){shared=Object.keys(window._sharedMarkers).length;}

  if(feralCount>0||shared>0){
    if(window._toast)window._toast('👁️ Beholder sees: '+feralCount+' feral seed'+(feralCount!==1?'s':'')+' · '+shared+' wild plant'+(shared!==1?'s':'')+' nearby');
  }

  // Log to compendium if first time
  var _bSeen=localStorage.getItem('lw_beholder_seen');
  if(!_bSeen){
    localStorage.setItem('lw_beholder_seen','1');
    if(window._logWildEvent)window._logWildEvent({type:'companion',event:'omnisight',companion:'Beholder',
      text:'The Beholder\'s eye opened. It sees everything within 1km.'});
  }
};
})();

(function(){
'use strict';
// Calculate your overall territory influence — how much of the local ecosystem you shape
window.getTerritoryInfluence=function(){
  var wild=[];try{wild=JSON.parse(localStorage.getItem('fg_wild_plants')||'[]');}catch(e){}
  var events=[];try{events=JSON.parse(localStorage.getItem('lw_wild_events')||'[]');}catch(e){}
  var meshLinks=[];try{meshLinks=JSON.parse(localStorage.getItem('lw_mesh_links')||'[]');}catch(e){}
  var commons=[];try{commons=JSON.parse(localStorage.getItem('lw_commons')||'[]');}catch(e){}

  var score=0;
  score+=wild.length*10; // 10 pts per wild plant
  score+=events.filter(function(e){return e.type==='birth';}).length*5; // 5 pts per offspring
  score+=events.filter(function(e){return e.type==='spread';}).length*8; // 8 pts per lineage spread
  score+=meshLinks.filter(function(l){return l.stage>=1;}).length*15; // 15 pts per mesh link
  score+=commons.length*50; // 50 pts per commons
  // Bonus for diversity
  var seasons={};wild.forEach(function(p){try{var t=window.hashToTraits?window.hashToTraits(p.hash):null;if(t)seasons[t.season]=true;}catch(e){}});
  score+=Object.keys(seasons).length*20; // 20 pts per season represented

  var tier='Seedling';
  if(score>=500)tier='Gardener';
  if(score>=1000)tier='Cultivator';
  if(score>=2500)tier='Grove Keeper';
  if(score>=5000)tier='Forest Warden';
  if(score>=10000)tier='Ecosystem Architect';

  return{score:score,tier:tier};
};
})();

(function(){
'use strict';
var _finalOrig = window.switchTab;
if (!_finalOrig) return;
var _hasVT = typeof document.startViewTransition === 'function';
window.switchTab = function(tab) {
  // Core switch with optional View Transition
  function _doSwitch() {
    _finalOrig(tab);
    // Dispatch all registered hooks
    var hooks = window._switchTabHooks || [];
    for (var i = 0; i < hooks.length; i++) {
      try { hooks[i](tab); } catch(e) {}
    }
  }
  if (_hasVT) {
    try { document.startViewTransition(_doSwitch); } catch(e) { _doSwitch(); }
  } else {
    _doSwitch();
  }
};
})();

