// ═══ LUCID WINDS — wild.js ═══
// Wild tab: Leaflet map, GPS, ferals, pollen, territory
// ════════════════════════════════════════════

window.FG_Wild=(function(){
'use strict';
// Safe stubs for functions defined in later script blocks
function _e(v){if(window._e)window._e(v);}
function _play(id){if(window._play)window._play(id);}
var TILES='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
var MAX_DROPS=3,MAX_POUCH=5,COLLECT_RANGE=75,ZONE_SIZE=0.001;
// Dynamic collect range — Wanderer temperament adds 50m
function _getCollectRange(){
  var range=COLLECT_RANGE;
  try{
    var gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');
    for(var i=0;i<gh.length;i++){
      var t=window.hashToTraits?window.hashToTraits(gh[i].hash):null;
      if(!t)continue;
      var ci=window.getCompanionInfo?getCompanionInfo(t):null;
      if(ci&&ci.temperament&&ci.temperament.feralRange){range+=ci.temperament.feralRange;break;}
    }
  }catch(e){}
  return range;
}
// ═══ ANTI-FARMING: server-side economy protection ═══
// Source of truth: Firestore vaults/{uid}/meta/dailyStats
// localStorage is a read cache only — never trusted for enforcement
var AF_HARVEST_KEY='fg_af_harvests';
var AF_MIN_WILD_MS=0; // DISABLED — minimum wild time removed, daily cap + diminishing returns are sufficient
var _afCache=null; // in-memory cache of today's stats
var _serverDayOffset=0; // ms offset: serverTime = Date.now() + _serverDayOffset

// Get server-aligned "today" string (UTC). Uses offset learned from Firestore.
function _afGetToday(){
  var serverNow=new Date(Date.now()+_serverDayOffset);
  return serverNow.toISOString().slice(0,10);
}

// Learn server time offset on first Firestore read
function _afLearnServerTime(firestoreTimestamp){
  if(firestoreTimestamp&&firestoreTimestamp.toMillis){
    _serverDayOffset=firestoreTimestamp.toMillis()-Date.now();
  }
}

// Fresh empty state for a new day
function _afFreshState(){return{day:_afGetToday(),count:0,drops:0,planters:{},firstWild:0,feralCollects:0};}

// Read from localStorage cache (fast, for UI checks before Firestore confirms)
function _afGetCachedState(){
  if(_afCache&&_afCache.day===_afGetToday())return _afCache;
  try{var raw=localStorage.getItem(AF_HARVEST_KEY);var s=JSON.parse(raw||'{}');
  if(s.day!==_afGetToday())return _afFreshState();
  _afCache=s;return s;}catch(e){return _afFreshState();}
}

// Save to localStorage cache
function _afSaveCache(s){
  _afCache=s;
  try{localStorage.setItem(AF_HARVEST_KEY,JSON.stringify(s));}catch(e){}
}

// Get current user's dailyStats Firestore ref
function _afRef(){
  try{
    var u=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(!u||!u.uid||!window.db)return null;
    return window.db.collection('vaults').doc(u.uid).collection('meta').doc('dailyStats');
  }catch(e){return null;}
}

// Hydrate cache from Firestore (called on wild tab entry + auth)
function _afHydrate(cb){
  var ref=_afRef();
  if(!ref){if(cb)cb(_afGetCachedState());return;}
  ref.get().then(function(doc){
    if(doc.exists){
      var d=doc.data();
      // Learn server time from the doc's lastWrite timestamp
      if(d.lastWrite)_afLearnServerTime(d.lastWrite);
      var today=_afGetToday();
      if(d.day===today){
        var s={day:today,count:d.count||0,drops:d.drops||0,
          planters:d.planters||{},firstWild:d.firstWild||0,feralCollects:d.feralCollects||0};
        _afSaveCache(s);
        if(cb)cb(s);
      } else {
        // Server doc is stale (yesterday) — fresh day
        var fresh=_afFreshState();_afSaveCache(fresh);
        if(cb)cb(fresh);
      }
    } else {
      var fresh=_afFreshState();_afSaveCache(fresh);
      if(cb)cb(fresh);
    }
  }).catch(function(e){
    if(window._swsLog)_swsLog('AF hydrate err: '+e.message,'err');
    if(cb)cb(_afGetCachedState());
  });
}

// Write daily stats to Firestore (server is source of truth)
function _afWriteServer(updates){
  var ref=_afRef();
  if(!ref)return;
  updates.lastWrite=firebase.firestore.FieldValue.serverTimestamp();
  updates.day=_afGetToday();
  ref.set(updates,{merge:true}).catch(function(e){
    if(window._swsLog)_swsLog('AF write err: '+e.message,'err');
  });
}

function _afGetCap(){
  if(window.FG_Backpack&&FG_Backpack.getState){
    var st=FG_Backpack.getState();return(st&&st.cap)?st.cap:3;
  }return 3;
}

function _afMarkWildEntry(){
  var s=_afGetCachedState();
  if(!s.firstWild){
    s.firstWild=Date.now()+_serverDayOffset;
    _afSaveCache(s);
    _afWriteServer({firstWild:s.firstWild});
  }
}

// Synchronous check against cache (UI gating before harvest attempt)
function _afCanHarvest(planterUid){
  var s=_afGetCachedState();
  var cap=_afGetCap();
  if(s.count>=cap)return{ok:false,reason:'Daily harvest limit reached ('+cap+'/day). Come back tomorrow!'};
  var serverNow=Date.now()+_serverDayOffset;
  if(s.firstWild&&(serverNow-s.firstWild)<AF_MIN_WILD_MS){
    var mins=Math.ceil((AF_MIN_WILD_MS-(serverNow-s.firstWild))/60000);
    return{ok:false,reason:'Explore the Wild for a bit longer! '+mins+' min remaining.'};
  }
  if(planterUid&&s.planters[planterUid]>=2)return{ok:false,reason:'You\'ve already harvested from this planter twice today.'};
  return{ok:true};
}

// Record harvest to both cache and Firestore
function _afRecordHarvest(planterUid){
  var s=_afGetCachedState();
  s.count=(s.count||0)+1;
  if(planterUid){s.planters[planterUid]=(s.planters[planterUid]||0)+1;}
  _afSaveCache(s);
  // Write to Firestore — server is the real enforcer
  var updates={count:s.count,planters:s.planters};
  _afWriteServer(updates);
}

// Record drop to both cache and Firestore
function _afRecordDrop(){
  var s=_afGetCachedState();
  s.drops=(s.drops||0)+1;
  _afSaveCache(s);
  _afWriteServer({drops:s.drops});
}
var _map=null,_uM=null,_uLat=null,_uLng=null,_trail=[],_tLine=null,_tGlow=null,_inited=false;
var _drops=0,_pouch=[],_sel=null,_selMk=null,_menuOpen=false,_tt=null;
var _gpsDenied=false,_gpsFallbackTimer=null; // tracks if GPS was denied/unavailable
var _lastGeoTime=0,_lastGeoLat=0,_lastGeoLng=0,_speedKmh=0;
// ── Shared drop real-time listener state ──
var _sharedMarkers={}; // hash → {marker, data} for live shared drops
// Expose on window so cross-IIFE callers (Beholder Omnisight, diagnostics,
// compendium counters) can read the live shared-plant map. Same object,
// not a copy, so mutations inside this IIFE stay visible everywhere.
window._sharedMarkers = _sharedMarkers;
var _snapUnsub=null;   // Firestore onSnapshot unsubscribe function
var _snapZones=null;   // currently subscribed zone set (string for comparison)
var _snapDebounce=null; // debounce timer for moveend re-subscription
var GC={Common:'#8a9a7a',Uncommon:'#5a9e3f',Rare:'#4a90d9',Epic:'#9b59b6',Legendary:'#C8A84B',Mythic:'#e74c3c',Cosmic:'#ff6ec7'};
var FALLBACK=[40.758,-73.9855];

// ── Wild v3 vitality / lifespan ──
// Every plant has a rarity-scaled lifespan in days. decayAt is the
// timestamp at which vitality hits 0. Owner water resets it to full.
// Flat lifespan policy (Apr 14, 2026): every wild plant lives the same
// short base time regardless of rarity. Rarity governs trait quality, not
// survival. Communities must actively tend valuable plants — especially
// off-season where climate damage burns days of life per day. If no one
// visits a hex, plants naturally die and the map self-prunes.
var WILD_BASE_LIFESPAN_DAYS = 3;
var WILD_LIFESPAN_DAYS = {
  Common: WILD_BASE_LIFESPAN_DAYS, Uncommon: WILD_BASE_LIFESPAN_DAYS,
  Rare: WILD_BASE_LIFESPAN_DAYS, Epic: WILD_BASE_LIFESPAN_DAYS,
  Legendary: WILD_BASE_LIFESPAN_DAYS, Mythic: WILD_BASE_LIFESPAN_DAYS,
  Cosmic: WILD_BASE_LIFESPAN_DAYS
};
var WILD_TEND_BONUS_MS = 6 * 3600000;     // +6h per tend
// Previous 5-day lifetime cap is lifted — communities can keep a plant
// alive indefinitely if someone tends every few hours. A high ceiling
// (30 days) remains to prevent single-player exploit loops.
var WILD_TEND_BONUS_CAP = 30 * 86400000;
var WILD_WATER_BONUS_MS = 2 * 3600000;    // +2h per stranger water
var WILD_MAX_AGE_DAYS = 14; // legacy fallback only

function _plantRarity(hash){
  try{
    var t=window.hashToTraits?window.hashToTraits(hash):null;
    if(!t||!window.getTerraGrade)return 'Common';
    var tg=window.getTerraGrade(t);
    return (tg&&(tg.name||tg.label))||'Common';
  }catch(e){return 'Common';}
}
function _lifespanMsFor(rarityName){
  var d = WILD_LIFESPAN_DAYS[rarityName] || 7;
  return d * 86400000;
}
function _ensureVitality(plant){
  // Backfill lifespan + decayAt on legacy plants that predate vitality.
  if(!plant||!plant.hash)return plant;
  var rarity = plant.rarity || plant.grade || _plantRarity(plant.hash);
  plant.rarity = rarity;
  var lifeMs = plant.lifespanMs || _lifespanMsFor(rarity);
  plant.lifespanMs = lifeMs;
  // Prefer numeric droppedAtMs/decayAtMs fields from new drops.
  // Fall back to parsing string droppedAt (legacy Firestore writes) or
  // legacy plant.date; last resort Date.now() for very old records.
  if (typeof plant.droppedAtMs === 'number') {
    plant.droppedAt = plant.droppedAtMs;
  } else if (typeof plant.droppedAt === 'string') {
    var _parsed = new Date(plant.droppedAt).getTime();
    plant.droppedAt = isNaN(_parsed) ? Date.now() : _parsed;
  } else if(!plant.droppedAt && plant.date){
    plant.droppedAt = new Date(plant.date).getTime();
  } else if(!plant.droppedAt){
    plant.droppedAt = Date.now();
  }
  if (typeof plant.decayAtMs === 'number') {
    plant.decayAt = plant.decayAtMs;
  } else if (typeof plant.decayAt === 'string') {
    var _dp = new Date(plant.decayAt).getTime();
    plant.decayAt = isNaN(_dp) ? (plant.droppedAt + lifeMs) : _dp;
  } else if(!plant.decayAt){
    // Legacy plants get lifespan counting from their original drop date.
    plant.decayAt = plant.droppedAt + lifeMs;
  }
  if(!plant.strangerTendAddMs) plant.strangerTendAddMs = 0;
  return plant;
}
function _getWildVitality(plant){
  if(!plant||!plant.hash)return {pct:0,daysLeft:0,dead:true,lifeMs:0};
  _ensureVitality(plant);
  var now = Date.now();
  var remaining = plant.decayAt - now;
  var life = plant.lifespanMs || _lifespanMsFor(plant.rarity || 'Common');
  var pct = Math.max(0, Math.min(1, remaining / life));
  return {
    pct: pct,
    daysLeft: Math.max(0, remaining / 86400000),
    dead: remaining <= 0,
    lifeMs: life,
    remainingMs: Math.max(0, remaining)
  };
}
window._getWildVitality = _getWildVitality;

function _getWild(){try{var j=window._secureGet?window._secureGet('fg_wild_plants'):localStorage.getItem('fg_wild_plants');return JSON.parse(j||'[]');}catch(e){return[];}}
function _saveWild(a){if(window._secureSet){window._secureSet('fg_wild_plants',a);}else{localStorage.setItem('fg_wild_plants',JSON.stringify(a));}}
// Prune withered wild plants using rarity-scaled vitality.
// Each plant dies when its decayAt timestamp is in the past. Dead plants
// are removed from localStorage, deleted from Firestore, written to the
// event log, and toasted to the player on next wild-tab entry.
// Returns true if a plant's death was climate-attributable — i.e. it took
// climate damage in the last 24h before dying. Used to gate sprouts so
// combat or natural-age deaths don't regenerate.
function _diedFromClimate(plant){
  if(!plant||!plant.lastClimateHitAt)return false;
  var sinceHit=Date.now()-plant.lastClimateHitAt;
  return sinceHit < 24*3600000;
}

function _pruneWild(){
  var wild=_getWild();if(!wild.length)return wild;
  // Ensure every plant has vitality fields before comparing (migrates legacy)
  for(var i0=0;i0<wild.length;i0++) _ensureVitality(wild[i0]);
  var died=[];
  var fresh=wild.filter(function(w){
    if(!w||!w.hash)return false;
    var v=_getWildVitality(w);
    if(v.dead){died.push(w);return false;}
    return true;
  });
  if(died.length>0){
    if(window._swsLog)_swsLog('Pruned '+died.length+' withered wild plants','ok');
    _saveWild(fresh);
    // Delete withered plants from Firestore so other players stop seeing them
    var user=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(user&&user.uid&&window.db){
      for(var i=0;i<died.length;i++){
        if(died[i].own!==false&&died[i].hash){
          var docId=user.uid+'_'+died[i].hash.slice(0,16);
          window.db.collection('wildDrops').doc(docId).delete().catch(function(){});
        }
      }
    }
    // Event log + toast for each wither
    var names=[];
    for(var j=0;j<died.length;j++){
      var dp=died[j];
      var nm='';
      try{nm=window.getPlantName?window.getPlantName(dp.hash):dp.hash.slice(0,6);}catch(e){nm=dp.hash.slice(0,6);}
      if(j<3)names.push(nm);
      if(window.LW_Log){
        window.LW_Log.write('wild_withered',{
          hash:dp.hash,
          name:nm,
          rarity:dp.rarity||'Common',
          droppedAt:dp.droppedAt||null,
          lifespanDays:Math.round((dp.lifespanMs||0)/86400000)
        });
      }
    }
    var msg=died.length===1
      ?'\ud83c\udf42 '+names[0]+' withered in the wild.'
      :'\ud83c\udf42 '+died.length+' plants withered: '+names.join(', ')+(died.length>3?'...':'');
    setTimeout(function(){_toast(msg);},1000);
    // ── DEATH SPROUTS ──
    // One sprout per hex, gated on: (1) hex is now empty (no surviving
    // plants + no live shared markers), (2) last death in that hex was
    // climate-caused. Sprouts are wildDrops docs marked sprout:true with
    // a future germinateAt. On next Wild-tab tick they activate into
    // full plants via _germinateSprouts. Inherits parent hash so the
    // local ecosystem's surviving lineage dominates regrowth.
    try {
      var _userS = window.firebase && firebase.auth() && firebase.auth().currentUser;
      if (_userS && _userS.uid && window.db) {
        // Group deaths by zone, check each zone once
        var _deadByZone = {};
        for (var dz = 0; dz < died.length; dz++) {
          var _dpZk = _zoneKey(died[dz].lat, died[dz].lng);
          if (!_deadByZone[_dpZk]) _deadByZone[_dpZk] = [];
          _deadByZone[_dpZk].push(died[dz]);
        }
        // Survivors in fresh arr + shared markers = anything still alive in zone
        var _zoneAlive = {};
        for (var fs = 0; fs < fresh.length; fs++) {
          var _fsZk = _zoneKey(fresh[fs].lat, fresh[fs].lng);
          _zoneAlive[_fsZk] = (_zoneAlive[_fsZk] || 0) + 1;
        }
        if (window._sharedMarkers) {
          for (var _sk in window._sharedMarkers) {
            var _smd = window._sharedMarkers[_sk] && window._sharedMarkers[_sk].data;
            if (!_smd || !_smd.lat) continue;
            var _smZk = _zoneKey(_smd.lat, _smd.lng);
            _zoneAlive[_smZk] = (_zoneAlive[_smZk] || 0) + 1;
          }
        }
        for (var _dzk in _deadByZone) {
          if ((_zoneAlive[_dzk] || 0) > 0) continue; // zone still has plants
          var _zoneDeaths = _deadByZone[_dzk];
          // Most-recent death in this zone determines cause
          var _lastDead = _zoneDeaths[_zoneDeaths.length - 1];
          if (!_diedFromClimate(_lastDead)) continue;
          // Write sprout doc
          var _parentHash = _lastDead.hash;
          var _zParts = _dzk.split(',');
          var _sLat = parseFloat(_zParts[0]) + (Math.random() - 0.5) * 0.00005;
          var _sLng = parseFloat(_zParts[1]) + (Math.random() - 0.5) * 0.00005;
          var _germH = 24 + Math.floor(Math.random() * 12);
          var _sprDoc = {
            lat: _sLat, lng: _sLng, hash: _parentHash, // hash reused; _germinateSprouts regenerates for birth
            ownerUid: 'wild', ownerName: 'Wild',
            ea: 0, defenderGame: 'set', season: 0,
            status: 'alive', grade: 'Common', generation: 1,
            zone: _dzk,
            droppedAt: new Date().toISOString(),
            wildBorn: true,
            sprout: true,
            germinateAt: Date.now() + _germH * 3600000,
            parentHash: _parentHash
          };
          var _sprId = 'sprout_' + _dzk.replace(/[^0-9A-Za-z]/g, '') + '_' + Date.now();
          window.db.collection('wildDrops').doc(_sprId).set(_sprDoc).catch(function(e){
            if (window._swsLog) _swsLog('Sprout write failed: ' + (e && e.message || e), 'warn');
          });
          if (window._logWildEvent) {
            window._logWildEvent({ type: 'sprout', zone: _dzk, parentHash: _parentHash, germinateInHours: _germH });
          }
          if (window._swsLog) _swsLog('Sprout seeded in ' + _dzk + ', germinates in ' + _germH + 'h', 'ok');
        }
      }
    } catch (e) { if (window._swsLog) _swsLog('Sprout error: ' + e.message, 'warn'); }
  }
  // ── ENFORCE 3-PER-ZONE CAP — keep top 3 EA, evict rest ──
  // (Migrates legacy zones that pre-date the cap)
  if(typeof MAX_PER_ZONE!=='undefined'){
    var byZone={};
    for(var z=0;z<fresh.length;z++){
      var k=_zoneKey(fresh[z].lat,fresh[z].lng);
      if(!byZone[k])byZone[k]=[];
      byZone[k].push(fresh[z]);
    }
    var pruned=[],evictCount=0;
    for(var zk in byZone){
      var grp=byZone[zk];
      if(grp.length<=MAX_PER_ZONE){
        for(var g=0;g<grp.length;g++)pruned.push(grp[g]);
      } else {
        grp.sort(function(a,b){return _wildEA(b)-_wildEA(a);});
        for(var g2=0;g2<MAX_PER_ZONE;g2++)pruned.push(grp[g2]);
        evictCount+=(grp.length-MAX_PER_ZONE);
      }
    }
    if(evictCount>0){
      _saveWild(pruned);
      if(window._swsLog)_swsLog('Evicted '+evictCount+' over-cap plants from '+Object.keys(byZone).length+' zones','warn');
      fresh=pruned;
    }
  }
  return fresh;
}
function _getGH(){try{return JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){return[];}}
function _saveGH(a){localStorage.setItem('sws_greenhouse',JSON.stringify(a));}
function _zoneKey(a,b){return(Math.round(a/ZONE_SIZE)*ZONE_SIZE).toFixed(4)+','+(Math.round(b/ZONE_SIZE)*ZONE_SIZE).toFixed(4);}
function _dist(a,b,c,d){var x=(c-a)*Math.PI/180,y=(d-b)*Math.PI/180;var z=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(y/2)*Math.sin(y/2);return 6371000*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z));}

// ═══ 3-PER-ZONE CAP + EVICTION ═══
var MAX_PER_ZONE=3;
// Wild v3 balance: dice-roll takeover. Replaces the deterministic
// `myEA > theirEA` check with 2d6 + companion temperament bonus on
// both sides. Forager +3, Wanderer +2, Mystic +1 on attacker;
// Guardian +2, Mystic +1 on defender.
function _rollTakeover(attackerPlant,defenderPlant){
  function _d(n,sides){var t=0;for(var i=0;i<n;i++)t+=Math.floor(Math.random()*sides)+1;return t;}
  function _tempBonus(plant,side){
    try{
      var t=window.hashToTraits?window.hashToTraits(plant.hash):null;
      if(!t)return 0;
      var info=window.getCompanionInfo?window.getCompanionInfo(t):null;
      if(!info||!info.tempKey)return 0;
      // All 5 temperaments covered (guardian/forager/wanderer/mystic/symbiote)
      if(side==='attacker'){
        if(info.tempKey==='forager')return 3;
        if(info.tempKey==='wanderer')return 2;
        if(info.tempKey==='mystic')return 1;
      }else{
        if(info.tempKey==='guardian')return 2;
        if(info.tempKey==='symbiote')return 1;
        if(info.tempKey==='mystic')return 1;
      }
    }catch(e){}
    return 0;
  }
  var attEA=(attackerPlant&&attackerPlant.ea)||0;
  var defEA=(defenderPlant&&defenderPlant.ea)||0;
  var attRoll=_d(2,6),defRoll=_d(2,6);
  var attComp=_tempBonus(attackerPlant,'attacker');
  var defComp=_tempBonus(defenderPlant,'defender');
  return{
    attEA:attEA,defEA:defEA,
    attRoll:attRoll,defRoll:defRoll,
    attComp:attComp,defComp:defComp,
    attTotal:attEA+attRoll+attComp,
    defTotal:defEA+defRoll+defComp,
    attackerWins:(attEA+attRoll+attComp)>(defEA+defRoll+defComp)
  };
}
window._rollTakeover=_rollTakeover;
function _formatRollToast(r){
  var attStr=r.attEA+'+'+r.attRoll+(r.attComp?'+'+r.attComp:'');
  var defStr=r.defEA+'+'+r.defRoll+(r.defComp?'+'+r.defComp:'');
  var verdict=r.attackerWins?'UPROOTED!':'DEFENDED';
  var icon=r.attackerWins?'\u2694\ufe0f':'\ud83d\udee1\ufe0f';
  return icon+' '+attStr+'='+r.attTotal+' vs '+defStr+'='+r.defTotal+' \u2014 '+verdict;
}
// Wild v3 balance: per-player spatial cap. Max 3 of YOUR OWN plants
// within 700m of any drop point. Forces geographic spread so one
// player can't lock down a neighborhood.
var WILD_SELF_RADIUS_M=700;
var WILD_SELF_MAX=3;
function _checkSelfRadius(lat,lng){
  var mine=0;
  try{
    var myUid='';try{var _u=window.firebase&&firebase.auth()&&firebase.auth().currentUser;if(_u)myUid=_u.uid;}catch(e){}
    var local=_getWild();
    for(var i=0;i<local.length;i++){
      var lp=local[i];if(!lp||!lp.lat||!lp.lng)continue;
      if(_dist(lat,lng,lp.lat,lp.lng)<WILD_SELF_RADIUS_M)mine++;
    }
    if(_sharedMarkers){
      for(var h in _sharedMarkers){
        var sm=_sharedMarkers[h];if(!sm||!sm.data)continue;
        var sd=sm.data;if(!sd.lat||!sd.lng)continue;
        if(!(sd.own||(myUid&&sd.ownerUid===myUid)))continue;
        if(_dist(lat,lng,sd.lat,sd.lng)<WILD_SELF_RADIUS_M)mine++;
      }
    }
  }catch(e){}
  return mine>=WILD_SELF_MAX?mine:0;
}
// Prefers stored .ea (from Firestore/shared markers), falls back to trait compute.
function _wildEA(w){
  if(w&&typeof w.ea==='number'&&w.ea>0)return w.ea;
  try{
    var t=window.hashToTraits(w.hash);
    var days=w.date?Math.floor((Date.now()-new Date(w.date).getTime())/86400000):0;
    return window.computeEA?window.computeEA(t,days):0;
  }catch(e){return 0;}
}
function _weakestInZone(plants){
  if(!plants.length)return null;
  var weakest=plants[0],wEA=_wildEA(plants[0]);
  for(var i=1;i<plants.length;i++){
    var ea=_wildEA(plants[i]);
    if(ea<wEA){weakest=plants[i];wEA=ea;}
  }
  return {plant:weakest,ea:wEA};
}
// Combined zone occupancy — merges local wild + shared Firestore markers.
// Returns a deduped array; local entries preferred over shared on hash collision.
function _allPlantsInZone(zoneKey){
  var out=[],seen={};
  var local=_getWild();
  for(var i=0;i<local.length;i++){
    var w=local[i];if(!w||!w.lat||!w.lng||!w.hash)continue;
    if(_zoneKey(w.lat,w.lng)!==zoneKey)continue;
    out.push(w);seen[w.hash]=true;
  }
  var keys=Object.keys(_sharedMarkers||{});
  for(var j=0;j<keys.length;j++){
    var sm=_sharedMarkers[keys[j]];if(!sm||!sm.data)continue;
    var d=sm.data;if(!d.lat||!d.lng||!d.hash)continue;
    if(seen[d.hash])continue;
    if(_zoneKey(d.lat,d.lng)!==zoneKey)continue;
    out.push(d);
  }
  return out;
}

function activate(){
  // Diagnostic: show system status on first Wild visit
  try{
    var diag='Wild: L='+(!!window.L)+' map='+(!!_map)+' BP='+(!!window.FG_Backpack)+' uLat='+_uLat;
    console.log('[Wild.activate] '+diag);
    if(!window.L)_toast('Error: Leaflet not loaded. Check internet connection.');
  }catch(e){}
  if(!_inited){_initMap();_initGeo();_inited=true;}
  // Prune expired wild plants before loading
  _pruneWild();
  // Load immediately from cache for fast UI
  _loadState();
  _updateUI();
  // Hydrate anti-farming state from Firestore (background)
  _afHydrate(function(){_loadState();_updateUI();});
  // Fallback: load plants even if GPS is slow — uses last known position or fallback
  if(_map&&_uLat)_loadAll();
  else setTimeout(function(){if(_map&&_uLat)_loadAll();},3000);
  // Check for pending harvest/takeover rewards from other players
  _checkPendingRewards();
  // ── Defer heavy network + compute ops so map renders first ──
  var _heavyDelay=window._perfLite?4000:1500;
  setTimeout(function(){
    // Detect biome + biodiversity from real GPS
    if(window.checkBiodiversity&&_uLat){
      checkBiodiversity(_uLat,_uLng,function(bd){
        window._lastBiodiversity=bd;
        if(bd.tier==='hotspot'&&!localStorage.getItem('lw_hotspot_seen')){
          localStorage.setItem('lw_hotspot_seen','1');
          if(window._toast)_toast('Biodiversity Hotspot! '+bd.species+' real plant species observed here. Rare ferals possible!');
        }
      });
    }
    if(window.detectBiome&&_uLat){
      detectBiome(_uLat,_uLng,function(b){
        window._lastDetectedBiome=b;
        if(window.getBiomeInfo){
          var _bInf=getBiomeInfo(b);
          var _bIc=document.getElementById('w-biome');if(_bIc)_bIc.textContent=_bInf.icon;
          var _bNm=document.getElementById('w-biome-name');if(_bNm)_bNm.textContent=_bInf.name;
        }
        var _biShow=localStorage.getItem('lw_biome_shown');
        if(_biShow!==b&&window.getBiomeInfo){
          var _bInfo=getBiomeInfo(b);
          if(window._toast)_toast(_bInfo.icon+' Biome: '+_bInfo.name+(_bInfo.mutation?' — '+_bInfo.mutation+' possible':''));
          localStorage.setItem('lw_biome_shown',b);
        }
      });
    }
  },_heavyDelay);
  // Beholder Omnisight — extended vision check (deferred further)
  if(window._checkBeholderOmnisight)setTimeout(_checkBeholderOmnisight,window._perfLite?6000:3000);
  // Daily ecosystem check: reproduction + mesh + soil + chorus + phenotype
  // Runs once per day on Wild tab entry — heavily deferred on slow devices
  var _reproToday=localStorage.getItem('lw_repro_today');
  var _todayStr=new Date().toISOString().split('T')[0];
  if(_reproToday!==_todayStr){
    localStorage.setItem('lw_repro_today',_todayStr);
    setTimeout(function(){if(window._wildReproduction)_wildReproduction();},window._perfLite?8000:2000);
  }
  // Daily climate damage check — independent lock so it runs even when
  // reproduction is rate-limited. Same weather cache is reused.
  var _climateToday=localStorage.getItem('lw_climate_today');
  if(_climateToday!==_todayStr){
    localStorage.setItem('lw_climate_today',_todayStr);
    setTimeout(function(){if(window._wildClimateTick)_wildClimateTick();},window._perfLite?10000:3500);
  }
  // Sprout germination: opportunistic, runs every Wild entry (cheap —
  // one Firestore query capped at 20 docs). Any authenticated player
  // can activate due sprouts for the whole ecosystem, so no per-user
  // lock is needed. First player online each day does the work.
  setTimeout(function(){if(window._wildGerminateSprouts)_wildGerminateSprouts();},window._perfLite?12000:5000);
  // First-visit onboarding
  if(!localStorage.getItem('lw_wild_onboarded')){
    localStorage.setItem('lw_wild_onboarded','1');
    _showWildOnboard();
  }
  // Night hour warning banner
  var _nh = new Date().getHours();
  var _nb = document.getElementById('w-night-banner');
  if (_nh >= 23 || _nh < 5) {
    if (!_nb) {
      _nb = document.createElement('div');
      _nb.id = 'w-night-banner';
      _nb.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(180,130,40,0.92);color:#fff;text-align:center;padding:10px 16px;font-size:0.7rem;font-family:inherit;letter-spacing:0.02em;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;gap:12px;';
      _nb.innerHTML = '<span>\u26A0 Late hours. Stay safe and aware of your surroundings.</span><button onclick="this.parentNode.remove()" style="background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer;padding:4px 8px;min-height:48px;min-width:48px;flex-shrink:0;">\u2715</button>';
      document.body.appendChild(_nb);
    }
  } else {
    if (_nb) _nb.remove();
  }
  setTimeout(function(){if(_map)_map.invalidateSize();},100);
  setTimeout(function(){if(_map)_map.invalidateSize();},500);
  setTimeout(function(){if(_map)_map.invalidateSize();},1500);
  _gpsFallbackTimer=setTimeout(function(){if(!_uLat&&_map){_uLat=FALLBACK[0];_uLng=FALLBACK[1];_map.setView(FALLBACK,16);_placeUser();_loadAll();_showGpsBanner();}},5000);
  // Init backpack display
  if(window.FG_Backpack){FG_Backpack.init();FG_Backpack.render();}
}

function _showWildOnboard(){
  var ov=document.createElement('div');
  ov.id='wild-onboard';
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(5,8,4,0.96);overflow-y:auto;-webkit-overflow-scrolling:touch;animation:panelFadeIn 0.4s ease;';
  var h='<div style="max-width:500px;margin:0 auto;padding:1.5rem 1rem calc(2rem + env(safe-area-inset-bottom,0px));">';

  // ── HERO: Compass + Title ──
  h+='<div style="text-align:center;margin-bottom:2rem;opacity:0;animation:tierFadeIn 0.6s ease 0.2s forwards;">';
  h+='<img src="assets/wild-compass-t.png" style="width:min(240px,55vw);height:auto;filter:drop-shadow(0 10px 40px rgba(200,168,75,0.7));margin-bottom:1rem;" alt="">';
  h+='<div style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(2.8rem,11vw,4rem);color:var(--gold);letter-spacing:0.08em;line-height:1;">THE WILD</div>';
  h+='<div style="font-family:Playfair Display,serif;font-size:clamp(1rem,3.5vw,1.3rem);color:var(--cream);line-height:1.8;margin-top:0.6rem;">';
  h+='Your plants live on a real-world map.<br>Other players can see and harvest them.</div>';
  h+='</div>';

  // ── STEP 1: DROP ──
  h+='<div style="display:flex;align-items:center;gap:clamp(0.8rem,3vw,1.2rem);margin-bottom:1.5rem;opacity:0;animation:tierFadeIn 0.5s ease 0.5s forwards;">';
  h+='<img src="assets/wild-drop-fab-t.png" style="width:min(160px,38vw);height:auto;flex-shrink:0;filter:drop-shadow(0 6px 24px rgba(0,0,0,0.6));" alt="">';
  h+='<div>';
  h+='<div style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(1.5rem,5.5vw,2.2rem);color:var(--sage);letter-spacing:0.06em;line-height:1.2;">1. DROP</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:clamp(0.6rem,2.5vw,0.8rem);color:var(--cream);margin-top:0.4rem;line-height:1.7;">Choose a plant from your greenhouse and place it on the real-world map. It stays there for everyone to see.</div>';
  h+='</div></div>';

  // ── STEP 2: DEFEND ──
  h+='<div style="display:flex;align-items:center;gap:clamp(0.8rem,3vw,1.2rem);margin-bottom:1.5rem;flex-direction:row-reverse;opacity:0;animation:tierFadeIn 0.5s ease 0.7s forwards;">';
  h+='<img src="assets/wild-territory-shield-t.png" style="width:min(150px,36vw);height:auto;flex-shrink:0;filter:drop-shadow(0 6px 24px rgba(0,0,0,0.6));" alt="">';
  h+='<div style="text-align:right;">';
  h+='<div style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(1.5rem,5.5vw,2.2rem);color:var(--sage);letter-spacing:0.06em;line-height:1.2;">2. DEFEND</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:clamp(0.6rem,2.5vw,0.8rem);color:var(--cream);margin-top:0.4rem;line-height:1.7;">Pick a challenge game to guard your territory. Anyone who wants your plant has to beat it first.</div>';
  h+='</div></div>';

  // ── STEP 3: HARVEST ──
  h+='<div style="display:flex;align-items:center;gap:clamp(0.8rem,3vw,1.2rem);margin-bottom:1.5rem;opacity:0;animation:tierFadeIn 0.5s ease 0.9s forwards;">';
  h+='<img src="assets/wild-harvest-btn-t.png" style="width:min(160px,38vw);height:auto;flex-shrink:0;filter:drop-shadow(0 6px 24px rgba(0,0,0,0.6));" alt="">';
  h+='<div>';
  h+='<div style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(1.5rem,5.5vw,2.2rem);color:var(--sage);letter-spacing:0.06em;line-height:1.2;">3. HARVEST</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:clamp(0.6rem,2.5vw,0.8rem);color:var(--cream);margin-top:0.4rem;line-height:1.7;">Find other players\' plants on the map. Beat their challenge to claim the plant for your collection.</div>';
  h+='</div></div>';

  // ── STEP 4: FERALS ──
  h+='<div style="display:flex;align-items:center;gap:clamp(0.8rem,3vw,1.2rem);margin-bottom:1.5rem;flex-direction:row-reverse;opacity:0;animation:tierFadeIn 0.5s ease 1.1s forwards;">';
  h+='<img src="assets/wild-feral-marker-t.png" style="width:min(150px,36vw);height:auto;flex-shrink:0;filter:drop-shadow(0 6px 24px rgba(0,0,0,0.6));" alt="">';
  h+='<div style="text-align:right;">';
  h+='<div style="font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(1.5rem,5.5vw,2.2rem);color:var(--sage);letter-spacing:0.06em;line-height:1.2;">4. FERALS</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:clamp(0.6rem,2.5vw,0.8rem);color:var(--cream);margin-top:0.4rem;line-height:1.7;">Wild seeds spawn near breeding pairs. Walk within range to catch them \u2014 free plants, no greenhouse cost.</div>';
  h+='</div></div>';

  // ── BACKPACK ──
  h+='<div style="display:flex;align-items:center;gap:1rem;background:rgba(26,36,22,0.5);border:1.5px solid rgba(200,168,75,0.25);border-radius:16px;padding:1rem;margin-bottom:1.5rem;opacity:0;animation:tierFadeIn 0.4s ease 1.3s forwards;">';
  h+='<img src="assets/games/wild/backpack-closed-v4.png" style="width:min(90px,20vw);height:auto;flex-shrink:0;filter:drop-shadow(0 4px 14px rgba(0,0,0,0.6));" alt="">';
  h+='<div style="font-family:DM Mono,monospace;font-size:clamp(0.6rem,2.2vw,0.8rem);color:var(--cream);line-height:1.8;text-align:left;">Harvested plants go in your <span style="color:var(--gold);font-weight:bold;">backpack</span>. Hit <span style="color:var(--gold);font-weight:bold;">Return to Base</span> to send them to your greenhouse.</div>';
  h+='</div>';

  // ── CTA BUTTON ──
  h+='<button onclick="document.getElementById(\'wild-onboard\').remove();_showWildHints();" style="width:100%;padding:1rem;border:2px solid rgba(122,179,86,0.5);border-radius:14px;background:linear-gradient(180deg,rgba(74,124,53,0.45),rgba(26,60,22,0.6));color:var(--sage);font-family:Cormorant Garamond,serif;font-weight:700;font-size:clamp(1.3rem,5.5vw,1.8rem);letter-spacing:0.08em;cursor:pointer;min-height:60px;opacity:0;animation:tierFadeIn 0.4s ease 1.5s forwards;">EXPLORE THE WILD</button>';
  h+='</div>';
  ov.innerHTML=h;
  document.body.appendChild(ov);
}
// Pulsing hint callouts on key UI elements after onboarding dismissal
function _showWildHints(){
  // Pulse the drop FAB
  var fab=document.getElementById('dfb');
  if(fab){fab.style.animation='_whPulse 1.5s ease 3';setTimeout(function(){fab.style.animation='';},4600);}
  // Pulse the backpack
  var bp=document.getElementById('bpi');
  if(bp){setTimeout(function(){bp.style.animation='_whPulse 1.5s ease 3';setTimeout(function(){bp.style.animation='';},4600);},2000);}
}
// Expose for inline onclick
window._showWildHints=_showWildHints;

function _initMap(){
  var el=document.getElementById('wild-map');if(!el||!window.L)return;
  _map=L.map('wild-map',{center:[39.83,-98.58],zoom:4,zoomControl:false,attributionControl:false,tap:true,tapTolerance:15});
  L.tileLayer(TILES,{attribution:'&copy; OSM &copy; CARTO',subdomains:'abcd',maxZoom:19}).addTo(_map);
  _map.on('click',function(){closePicker();closeTP();});
  // Map skin: sync zoom for CSS data attribute
  _map.on('zoomend',function(){_map.getContainer().setAttribute('data-zoom',_map.getZoom());});
  // Re-subscribe to shared drops when map view changes significantly
  _map.on('moveend',function(){_scheduleResubscribe();});
  _map.getContainer().setAttribute('data-zoom',_map.getZoom());
  // Time-of-day class on panel
  _updateTimeOfDay();
  setInterval(_updateTimeOfDay,300000); // re-check every 5 min

  // Seasonal particle spawner (replaces basic pollen)
  _startSeasonalParticles();
}

// ═══ TIME OF DAY ═══
function _updateTimeOfDay(){
  var panel=document.getElementById('panel-wild');if(!panel)return;
  var h=new Date().getHours();
  panel.classList.remove('tod-dawn','tod-dusk','tod-night');
  if(_map)_map.getContainer().classList.remove('night-mode');
  if(h>=5&&h<7){panel.classList.add('tod-dawn');}
  else if(h>=17&&h<20){panel.classList.add('tod-dusk');}
  else if(h>=20||h<5){panel.classList.add('tod-night');if(_map)_map.getContainer().classList.add('night-mode');_spawnFireflies();}
}

// ═══ FIREFLIES (night only) ═══
var _fireflyTimer=null;
function _spawnFireflies(){
  if(_fireflyTimer)return;
  // Perf-lite: skip fireflies entirely — DOM churn kills old devices
  if(window._perfLite)return;
  _fireflyTimer=setInterval(function(){
    var panel=document.getElementById('panel-wild');if(!panel)return;
    if(!panel.classList.contains('tod-night')){clearInterval(_fireflyTimer);_fireflyTimer=null;return;}
    var f=document.createElement('div');f.className='firefly';
    f.style.cssText='left:'+(10+Math.random()*80)+'%;top:'+(10+Math.random()*70)+'%;--fx:'+(Math.random()*60-30)+'px;--fy:'+(Math.random()*-60-10)+'px;--fx2:'+(Math.random()*40-20)+'px;--fy2:'+(Math.random()*40-20)+'px;animation:fireflyFloat '+(5+Math.random()*8)+'s ease-in-out forwards;';
    panel.appendChild(f);
    setTimeout(function(){f.remove();},13000);
  },2500);
}

// ═══ SEASONAL PARTICLES ═══
var _seasonParticleTimer=null;
function _startSeasonalParticles(){
  if(_seasonParticleTimer)return;
  // Perf-lite: skip seasonal particles entirely — DOM churn kills old devices
  if(window._perfLite)return;
  // Determine current season from real-world month
  var month=new Date().getMonth(); // 0-11
  var season;
  if(month>=2&&month<=4)season='spring';
  else if(month>=5&&month<=7)season='summer';
  else if(month>=8&&month<=10)season='autumn';
  else season='winter';
  var interval=season==='autumn'?900:season==='spring'?1100:season==='winter'?1400:1300;
  _seasonParticleTimer=setInterval(function(){
    var panel=document.getElementById('panel-wild');if(!panel||panel.style.display==='none')return;
    var p=document.createElement('div');
    p.className='season-particle sp-'+season;
    var spin=Math.random()*360;
    var peak=season==='summer'?0.2:0.35;
    var dx,dy,dur;
    if(season==='autumn'){dx=(Math.random()*40-10);dy=(60+Math.random()*40);dur=4+Math.random()*4;}
    else if(season==='winter'){dx=(Math.random()*30-15);dy=(50+Math.random()*30);dur=5+Math.random()*5;}
    else if(season==='spring'){dx=(Math.random()*50-25);dy=(Math.random()*-60-20);dur=6+Math.random()*6;}
    else{dx=(Math.random()*40-20);dy=(Math.random()*-50-15);dur=7+Math.random()*5;}
    p.style.cssText='left:'+(Math.random()*100)+'%;top:'+(season==='autumn'||season==='winter'?(Math.random()*20)+'%':(60+Math.random()*30)+'%')+';--spin:'+spin+'deg;--dx:'+dx+'px;--dy:'+dy+'px;--peak:'+peak+';animation:seasonDrift '+dur+'s ease forwards;';
    panel.appendChild(p);
    setTimeout(function(){p.remove();},Math.ceil(dur*1000)+500);
  },interval);
}
function _stopSeasonalParticles(){
  if(_seasonParticleTimer){clearInterval(_seasonParticleTimer);_seasonParticleTimer=null;}
}

// ═══ PROXIMITY PULSE — nearby plants glow brighter ═══
function _updateProximity(){
  if(!_uLat||!_uLng)return;
  var hashes=Object.keys(_sharedMarkers);
  for(var i=0;i<hashes.length;i++){
    var entry=_sharedMarkers[hashes[i]];
    if(!entry||!entry.data||!entry.marker)continue;
    var d=entry.data;
    if(!d.lat)continue;
    var dist=_dist(_uLat,_uLng,d.lat,d.lng);
    var el=entry.marker.getElement();
    if(!el)continue;
    if(dist<=COLLECT_RANGE){
      // In range — bright pulse + collectible indicator
      el.className='leaflet-marker-icon leaflet-zoom-animated leaflet-interactive wild-prox-close';
    } else if(dist<=150){
      // Approaching — gentle pulse
      el.className='leaflet-marker-icon leaflet-zoom-animated leaflet-interactive wild-prox-near';
    } else {
      // Far — normal
      el.className='leaflet-marker-icon leaflet-zoom-animated leaflet-interactive';
    }
  }
  // Passive pollen from nearby plants (every 10min per plant)
  _fjPassivePollen();
  // Feral zone refresh — update hex availability as player moves
  _drawFeralZones();
}

// ═══ STEP COUNTER MILESTONES ═══
var _lastStepMilestone=0;
function _checkStepMilestone(){
  var el=document.getElementById('w-steps');if(!el)return;
  var meters=parseInt(el.textContent||'0');
  var milestones=[500,1000,2500,5000,10000];
  for(var i=milestones.length-1;i>=0;i--){
    if(meters>=milestones[i]&&_lastStepMilestone<milestones[i]){
      _lastStepMilestone=milestones[i];
      var labels={500:'500m walked!',1000:'1km explorer!',2500:'2.5km trekker!',5000:'5km ranger!',10000:'10km legend!'};
      _toast('\ud83e\udeb4 '+labels[milestones[i]]);
      break;
    }
  }
}

// ═══ GPS RECOVERY BANNER ═══
function _showGpsBanner(){
  if(document.getElementById('gps-recovery-banner'))return;
  _gpsDenied=true;
  var b=document.createElement('div');
  b.id='gps-recovery-banner';
  b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:rgba(13,16,12,0.95);border-bottom:1.5px solid var(--sage,#7ab356);padding:14px 16px;font-family:DM Mono,monospace;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:panelFadeIn 0.35s ease;';
  var inner='<div style="max-width:500px;margin:0 auto;">';
  inner+='<div style="color:var(--gold,#c8a84b);font-size:0.78rem;font-weight:700;letter-spacing:0.06em;margin-bottom:6px;">\u26A0 GPS UNAVAILABLE</div>';
  inner+='<div style="color:var(--cream,#e8dcc8);font-size:0.65rem;line-height:1.5;margin-bottom:12px;opacity:0.85;">Location is needed to plant, harvest, and collect feral seeds in the Wild. You are currently in demo mode.</div>';
  inner+='<div style="display:flex;gap:10px;">';
  inner+='<button onclick="window._retryGps()" style="flex:1;min-height:48px;background:var(--sage,#7ab356);color:#0d100c;border:none;border-radius:6px;font-family:DM Mono,monospace;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;">ENABLE GPS</button>';
  inner+='<button onclick="window._dismissGpsBanner()" style="flex:1;min-height:48px;background:transparent;color:var(--muted,#8a9178);border:1.5px solid var(--muted,#8a9178);border-radius:6px;font-family:DM Mono,monospace;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;cursor:pointer;">STAY IN DEMO</button>';
  inner+='</div></div>';
  b.innerHTML=inner;
  document.body.appendChild(b);
}
function _hideGpsBanner(){
  var b=document.getElementById('gps-recovery-banner');
  if(b)b.remove();
}
window._dismissGpsBanner=function(){
  _hideGpsBanner();
};
window._retryGps=function(){
  if(!navigator.geolocation){_toast('This device does not support GPS.');return;}
  _hideGpsBanner();
  _toast('Requesting GPS...');
  navigator.geolocation.getCurrentPosition(function(p){
    _gpsDenied=false;
    _uLat=p.coords.latitude;_uLng=p.coords.longitude;
    if(_map)_map.setView([_uLat,_uLng],16);
    _placeUser();_loadAll();
    _toast('Location locked! Tap \ud83c\udf31 to plant.');
  },function(err){
    _toast('GPS still unavailable. Check device settings.');
    _showGpsBanner();
  },{enableHighAccuracy:true,timeout:10000,maximumAge:0});
};

function _initGeo(){
  if(!navigator.geolocation){_uLat=FALLBACK[0];_uLng=FALLBACK[1];_showGpsBanner();setTimeout(function(){if(_map){_map.setView(FALLBACK,16);_placeUser();_loadAll();}},500);return;}
  navigator.geolocation.getCurrentPosition(function(p){
    if(_gpsFallbackTimer){clearTimeout(_gpsFallbackTimer);_gpsFallbackTimer=null;}
    _uLat=p.coords.latitude;_uLng=p.coords.longitude;
    _map.setView([_uLat,_uLng],16);_placeUser();_loadAll();
    _toast('Location locked! Tap \ud83c\udf31 to plant.');
  },function(){
    _uLat=FALLBACK[0];_uLng=FALLBACK[1];
    _map.setView(FALLBACK,16);_placeUser();_loadAll();
    _showGpsBanner();
  },{enableHighAccuracy:true,timeout:8000,maximumAge:30000});
  try{navigator.geolocation.watchPosition(function(p){
    var nL=p.coords.latitude,nN=p.coords.longitude;
    if(_uLat&&_uLng){var d=_dist(_uLat,_uLng,nL,nN);if(d>0.7&&d<50){var s=document.getElementById('w-steps');if(s){s.textContent=parseInt(s.textContent||'0')+Math.round(d);_checkStepMilestone();}}}
    _uLat=nL;_uLng=nN;
    // Speed tracking
    var _now=Date.now();
    if(_lastGeoTime>0&&_lastGeoLat){var _sd=_dist(_lastGeoLat,_lastGeoLng,nL,nN);var _dt=(_now-_lastGeoTime)/1000;if(_dt>0)_speedKmh=(_sd/_dt)*3.6;}
    _lastGeoTime=_now;_lastGeoLat=nL;_lastGeoLng=nN;
    if(_uM)_uM.setLatLng([_uLat,_uLng]);
    if(_scanRing)_scanRing.setLatLng([_uLat,_uLng]);
    _updateProximity();
    _trail.push([_uLat,_uLng]);
    if(_trail.length>500)_trail.splice(0,_trail.length-500);
    if(_tLine){_tLine.setLatLngs(_trail);if(_tGlow)_tGlow.setLatLngs(_trail);}
    else if(_map){
      // Bioluminescent trail — outer glow + inner bright line
      _tGlow=L.polyline(_trail,{color:'rgba(122,179,86,0.08)',weight:14,lineCap:'round',lineJoin:'round',interactive:false}).addTo(_map);
      _tLine=L.polyline(_trail,{color:'rgba(122,179,86,0.3)',weight:4,lineCap:'round',lineJoin:'round',interactive:false,className:'trail-glow'}).addTo(_map);
    }
  },null,{enableHighAccuracy:true,maximumAge:5000});}catch(e){}
  // ═══ COMPASS — device orientation ═══
  _initCompass();
}

function _initCompass(){
  var windEl=document.getElementById('w-wind');if(!windEl)return;
  var compassImg=windEl.querySelector('img');
  var cardinals=['N','NE','E','SE','S','SW','W','NW'];
  function _updateCompass(heading){
    if(compassImg)compassImg.style.transform='rotate('+(180-heading)+'deg)';
    var idx=Math.round(heading/45)%8;
    var txt=windEl.querySelector('span');
    if(!txt){txt=document.createElement('span');txt.style.cssText='font-family:Bebas Neue,sans-serif;font-size:0.4rem;color:var(--cream);letter-spacing:0.06em;';windEl.appendChild(txt);}
    txt.textContent=cardinals[idx];
  }
  // Try absolute orientation first (iOS requires permission)
  if(window.DeviceOrientationEvent){
    // iOS 13+ requires permission request
    if(typeof DeviceOrientationEvent.requestPermission==='function'){
      // Will request on first tap (can't auto-request)
      windEl.onclick=function(){
        DeviceOrientationEvent.requestPermission().then(function(state){
          if(state==='granted'){
            window.addEventListener('deviceorientation',function(e){
              var h=e.webkitCompassHeading||e.alpha||0;
              _updateCompass(h);
            });
            windEl.onclick=null;
          }
        }).catch(function(){});
      };
    } else {
      window.addEventListener('deviceorientationabsolute',function(e){
        if(e.alpha!==null)_updateCompass(360-e.alpha);
      });
      // Fallback to regular deviceorientation
      window.addEventListener('deviceorientation',function(e){
        if(e.webkitCompassHeading){_updateCompass(e.webkitCompassHeading);}
        else if(e.absolute&&e.alpha!==null){_updateCompass(360-e.alpha);}
      });
    }
  }
  _updateCompass(0); // default: North
}

var _lantern=null,_scanRing=null;
function _placeUser(){
  if(!_map||!_uLat)return;
  // Player marker — direction arrow (will become chosen avatar later)
  _uM=L.marker([_uLat,_uLng],{icon:L.divIcon({className:'',html:'<div id="lw-player-arrow" style="width:28px;height:28px;position:relative;"><svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pag"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(74,144,217,0.6)"/></filter></defs><polygon points="14,2 24,22 14,17 4,22" fill="rgba(74,144,217,0.9)" stroke="rgba(200,220,255,0.4)" stroke-width="1" filter="url(#pag)"/></svg></div>',iconSize:[28,28],iconAnchor:[14,14]}),zIndexOffset:1000}).addTo(_map);
  // Scanner range ring (75m collection radius)
  _scanRing=L.circle([_uLat,_uLng],{radius:COLLECT_RANGE,className:'scanner-ring',fill:true,stroke:true,weight:2}).addTo(_map);
}

// ═══ TERRITORY HEXES — show owned zones on map ═══
var _territoryLayers=[];
function _drawTerritory(){
  // Clear old territory
  for(var i=0;i<_territoryLayers.length;i++){if(_map)_map.removeLayer(_territoryLayers[i]);}
  _territoryLayers=[];
  if(!_map)return;
  var wild=_getWild();
  var zones={};
  // Group own plants by zone
  for(var j=0;j<wild.length;j++){
    var w=wild[j];if(!w||!w.lat||!w.own)continue;
    var zk=_zoneKey(w.lat,w.lng);
    if(!zones[zk])zones[zk]={lat:w.lat,lng:w.lng};
  }
  var half=ZONE_SIZE/2;
  for(var k in zones){
    var z=zones[k];
    var cLat=Math.round(z.lat/ZONE_SIZE)*ZONE_SIZE;
    var cLng=Math.round(z.lng/ZONE_SIZE)*ZONE_SIZE;
    // Draw hex-like polygon (6 sides approximating H3)
    var pts=[];
    for(var a=0;a<6;a++){
      var angle=(a*60-30)*Math.PI/180;
      pts.push([cLat+half*Math.sin(angle),cLng+half*1.15*Math.cos(angle)]);
    }
    var hex=L.polygon(pts,{
      color:'rgba(122,179,86,0.35)',weight:1.5,
      fillColor:'rgba(122,179,86,0.06)',fillOpacity:1,
      dashArray:'4,4',interactive:false
    }).addTo(_map);
    _territoryLayers.push(hex);
  }
}

function _loadAll(){
  if(!_map||!_uLat)return;
  var saved=_pruneWild();
  for(var i=0;i<saved.length;i++){var w=saved[i];if(!w||!w.hash)continue;var d=w.date?Math.floor((Date.now()-new Date(w.date).getTime())/86400000):0;_addPlant({lat:w.lat,lng:w.lng,hash:w.hash,own:w.own!==false,days:d,pollen:d*3,status:d>7?'Thriving':d>2?'Growing':'Young',ownerUid:w.ownerUid||'',ownerName:w.ownerName||'Keeper',defenderGame:w.defenderGame||'set'});}
  _drawZoneHexes();_updateCounts();
  _subscribeSharedDrops();
  // Empty-state: if no local wild plants, show drop hint after brief delay
  if(saved.length===0&&!localStorage.getItem('lw_first_drop')){
    setTimeout(function(){
      var existing=document.getElementById('w-empty-hint');if(existing)return;
      var hint=document.createElement('div');hint.id='w-empty-hint';
      hint.style.cssText='position:fixed;bottom:calc(100px + env(safe-area-inset-bottom,0px));right:12px;z-index:998;display:flex;align-items:center;gap:6px;background:rgba(17,22,17,0.95);border:1px solid rgba(200,168,75,0.25);border-radius:10px;padding:8px 12px;animation:tierFadeIn 0.4s ease,_whPulse 2s ease 1s 2;box-shadow:0 4px 16px rgba(0,0,0,0.5);max-width:200px;';
      hint.innerHTML='<span style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--cream);line-height:1.5;">Tap the <span style="color:var(--sage);font-weight:bold;">green button</span> below to drop your first plant!</span><span style="font-size:0.8rem;">&#8595;</span>';
      hint.onclick=function(){hint.remove();};
      document.body.appendChild(hint);
      // Auto-dismiss after 8 seconds
      setTimeout(function(){if(hint.parentNode)hint.style.opacity='0';setTimeout(function(){if(hint.parentNode)hint.remove();},400);},8000);
    },2000);
  }
  if(!document.getElementById('_fA')){var s=document.createElement('style');s.id='_fA';s.textContent='@keyframes _fP{0%,100%{transform:translate(-50%,-50%) scale(1);box-shadow:0 0 10px rgba(200,168,75,0.5);}50%{transform:translate(-50%,-50%) scale(1.25);box-shadow:0 0 18px rgba(200,168,75,0.7);}}@keyframes _fR{0%{width:14px;height:14px;opacity:0.5;}100%{width:36px;height:36px;opacity:0;}}';document.head.appendChild(s);}
}

// ═══ FERAL SPAWNING — Zone-Based Ecosystem (v2) ═══
// Zones with plants show tappable hexes. Each zone gets 1 feral slot.
// When a player taps a zone hex, the hash rolls from zone plants.
// 18-36 hour cooldown per zone per player before next feral.
// NO feral markers on the map — the zone hex IS the indicator.
var FERAL_ZONE_CAP = 2;
var FERAL_SPAWN_MIN_MS = 18 * 3600000; // legacy — now using daily reset
var FERAL_SPAWN_MAX_MS = 36 * 3600000; // legacy — now using daily reset
var _feralRespawnTimer = null;
var _feralZoneHexes = []; // Leaflet layers for tappable feral zones

// Breed hash — crypto.getRandomValues with parent byte mixing
function _breedHash(hashA, hashB) {
  var _rb = new Uint8Array(32);
  crypto.getRandomValues(_rb);
  var offspring = Array.from(_rb).map(function(b){return b.toString(16).padStart(2,'0');}).join('').split('');
  for (var b = 0; b < 64; b++) {
    var roll = _rb[b % 32] / 255;
    if (roll < 0.35 && hashA && hashA.charAt(b)) {
      offspring[b] = hashA.charAt(b);
    } else if (roll < 0.70 && hashB && hashB.charAt(b)) {
      offspring[b] = hashB.charAt(b);
    }
  }
  return offspring.join('');
}

// Adjust offspring rarity — nudge hash bytes to target tier
function _adjustOffspringRarity(hash, gradeA, gradeB) {
  var tiers = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Cosmic'];
  var idxA = tiers.indexOf(gradeA); if (idxA < 0) idxA = 0;
  var idxB = tiers.indexOf(gradeB); if (idxB < 0) idxB = 0;
  var avg = (idxA + idxB) / 2;
  var roll = Math.random();
  var targetIdx;
  if (roll < 0.10) targetIdx = Math.min(6, Math.ceil(avg) + 1);
  else if (roll < 0.30) targetIdx = Math.max(0, Math.floor(avg) - 1);
  else targetIdx = Math.round(avg);
  var chars = hash.split('');
  if (targetIdx >= 5) { chars[32] = 'f'; chars[33] = 'e'; }
  else if (targetIdx >= 3) { chars[32] = 'c'; chars[33] = Math.floor(Math.random() * 4).toString(16); }
  else if (targetIdx <= 1) { chars[32] = Math.floor(Math.random() * 8).toString(16); chars[33] = Math.floor(Math.random() * 16).toString(16); }
  if (targetIdx >= 4) { chars[42] = '2'; chars[43] = Math.floor(2 + Math.random() * 6).toString(16); }
  return chars.join('');
}

// Seed search: 1 per hex per day, resets at midnight UTC
// Returns true if seed is available in this zone today
function _zoneSpawnInterval(zk) {
  // Legacy compat — returns a large number so old checks still work
  return 86400000; // 24h
}
function _isSeedAvailable(zk) {
  var zoneTimers = {};
  try { zoneTimers = JSON.parse(localStorage.getItem('fg_feral_zones') || '{}'); } catch (e) {}
  var lastCollect = zoneTimers[zk] || 0;
  if (lastCollect === 0) return true;
  // Check if last collection was before today midnight UTC
  var lastDate = new Date(lastCollect).toISOString().split('T')[0];
  var today = new Date().toISOString().split('T')[0];
  return lastDate !== today;
}

// Build unified zone map from local wild + shared markers
function _getAllZonePlants() {
  var zones = {};
  // Local wild plants
  var local = _getWild();
  for (var i = 0; i < local.length; i++) {
    var w = local[i]; if (!w || !w.lat || !w.lng || !w.hash) continue;
    var zk = _zoneKey(w.lat, w.lng);
    if (!zones[zk]) zones[zk] = [];
    zones[zk].push({hash: w.hash, lat: w.lat, lng: w.lng});
  }
  // Shared markers from Firestore subscription
  var keys = Object.keys(_sharedMarkers);
  for (var j = 0; j < keys.length; j++) {
    var sm = _sharedMarkers[keys[j]];
    if (!sm || !sm.data || !sm.data.lat || !sm.data.hash) continue;
    var szk = _zoneKey(sm.data.lat, sm.data.lng);
    if (!zones[szk]) zones[szk] = [];
    // Avoid duplicates (own plants already in local)
    var dup = false;
    for (var d = 0; d < zones[szk].length; d++) {
      if (zones[szk][d].hash === sm.data.hash) { dup = true; break; }
    }
    if (!dup) zones[szk].push({hash: sm.data.hash, lat: sm.data.lat, lng: sm.data.lng});
  }
  return zones;
}

function _spawnFerals() {
  // v2: No markers spawned. Just draw tappable zone hexes for zones with available ferals.
  if (!_uLat || !_map) return;
  _drawFeralZones();
}

function _drawFeralZones() {
  // Clear old feral hexes
  for (var fh = 0; fh < _feralZoneHexes.length; fh++) {
    if (_map) _map.removeLayer(_feralZoneHexes[fh]);
  }
  _feralZoneHexes = [];
  if (!_map || !_uLat) return;

  var now = Date.now();
  var zoneTimers = {}; try { zoneTimers = JSON.parse(localStorage.getItem('fg_feral_zones') || '{}'); } catch (e) {}
  var zones = _getAllZonePlants();
  var zoneKeys = Object.keys(zones);
  var half = ZONE_SIZE / 2;
  var availCount = 0;

  for (var z = 0; z < zoneKeys.length; z++) {
    var zk = zoneKeys[z];
    if (zones[zk].length < 1) continue;

    // Check zone timer — is a feral available?
    var lastCollect = zoneTimers[zk] || 0;
    var interval = _zoneSpawnInterval(zk);
    var available = (now - lastCollect >= interval);

    // Parse zone center
    var parts = zk.split(',');
    var cLat = parseFloat(parts[0]);
    var cLng = parseFloat(parts[1]);

    // Only show zones within ~500m
    if (_dist(_uLat, _uLng, cLat, cLng) > 600) continue;

    // Build hex points
    var pts = [];
    for (var a = 0; a < 6; a++) {
      var angle = (a * 60 - 30) * Math.PI / 180;
      pts.push([cLat + half * Math.sin(angle), cLng + half * 1.15 * Math.cos(angle)]);
    }

    if (available) {
      // Feral available — glowing tappable hex
      var hex = L.polygon(pts, {
        color: 'rgba(200,168,75,0.5)', weight: 2,
        fillColor: 'rgba(200,168,75,0.1)', fillOpacity: 1,
        dashArray: '', interactive: true, className: 'feral-zone-hex'
      }).addTo(_map);
      hex._feralZoneKey = zk;
      hex._feralPlants = zones[zk];
      hex.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        _collectFeralFromZone(this._feralZoneKey, this._feralPlants);
      });
      _feralZoneHexes.push(hex);
      availCount++;
    }
  }

  if (availCount > 0 && !_feralRespawnTimer) {
    // Re-check periodically for new feral availability
    _feralRespawnTimer = setTimeout(function() { _feralRespawnTimer = null; _drawFeralZones(); }, 60000);
  }
}

function _collectFeralFromZone(zk, zonePlants) {
  if (!_uLat) { _toast('Need location.'); return; }
  var parts = zk.split(',');
  var cLat = parseFloat(parts[0]), cLng = parseFloat(parts[1]);
  var d = _dist(_uLat, _uLng, cLat, cLng);
  var _dynRange = typeof _getCollectRange === 'function' ? _getCollectRange() : COLLECT_RANGE;
  if (d > _dynRange) {
    _toast('Walk closer! ' + Math.round(d * 3.281) + ' ft away. Need within ' + Math.round(_dynRange * 3.281) + ' ft.');
    return;
  }

  // Check zone cooldown — 1 seed per hex per day
  if (!_isSeedAvailable(zk)) {
    _toast('Already searched this hex today. Resets at midnight.');
    return;
  }

  // ── WILD SEED ROLL — environment-influenced, random parents ──
  // Key difference from greenhouse breeding:
  //   Wild: random parents, biome mutations (12%), soil rarity boost, biodiversity bonus
  //   Greenhouse: player-chosen parents, no environment, predictable forecast
  if (!zonePlants || zonePlants.length === 0) { _toast('No plants in this zone.'); return; }
  var parentA = zonePlants[Math.floor(Math.random() * zonePlants.length)];
  var parentB = zonePlants.length > 1 ? zonePlants[Math.floor(Math.random() * zonePlants.length)] : parentA;
  // Avoid same parent
  if (parentB.hash === parentA.hash && zonePlants.length > 1) {
    for (var pi = 0; pi < zonePlants.length; pi++) { if (zonePlants[pi].hash !== parentA.hash) { parentB = zonePlants[pi]; break; } }
  }
  var feralHash = _breedHash(parentA.hash, parentB.hash);

  // ── ENVIRONMENT MODIFIERS (wild-only advantage) ──

  // Soil maturity boosts base rarity
  if (window.getSoilInfo) {
    var parts2 = zk.split(',');
    var _soilInfo = getSoilInfo(parseFloat(parts2[0]), parseFloat(parts2[1]));
    if (_soilInfo && _soilInfo.maturity >= 40) {
      // Mature soil nudges offspring rarity up
      var _sArr = feralHash.split('');
      var _sBoost = Math.floor(_soilInfo.maturity / 30); // 1-3 boost levels
      _sArr[0] = Math.min(15, parseInt(_sArr[0], 16) + _sBoost).toString(16);
      feralHash = _sArr.join('');
    }
  }

  // Biome-specific mutation chance (12% in wild vs 0% in greenhouse)
  if (window._lastDetectedBiome && window.getBiomeInfo) {
    var _fBiome = getBiomeInfo(window._lastDetectedBiome);
    if (_fBiome.mutation && Math.random() < 0.12) { // 12% chance of biome mutation
      // Inject mutation marker into hash byte 32-33
      var _fhArr = feralHash.split('');
      _fhArr[32] = 'f'; _fhArr[33] = '0'; // triggers mutation in hashToTraits
      feralHash = _fhArr.join('');
      if (window._logWildEvent) window._logWildEvent({type:'rare', event:'biome_mutation', biome:_fBiome.name, mutation:_fBiome.mutation});
    }
  }

  // Biodiversity rarity boost
  if (window._lastBiodiversity && window._lastBiodiversity.tier !== 'barren') {
    var _bdBoost = {moderate:0.02, fertile:0.05, hotspot:0.10};
    var _bdChance = _bdBoost[window._lastBiodiversity.tier] || 0;
    if (_bdChance > 0 && Math.random() < _bdChance) {
      // Boost hash to produce rarer traits by setting key bytes higher
      var _bhArr = feralHash.split('');
      _bhArr[8] = 'e'; // higher leaf rarity
      _bhArr[22] = 'c'; // higher bloom rarity
      feralHash = _bhArr.join('');
    }
  }

  // Determine grade for challenge difficulty
  var info = {};
  try {
    var t = window.hashToTraits ? hashToTraits(feralHash) : null;
    var tg = t && window.getTerraGrade ? getTerraGrade(t) : null;
    info = { nm: typeof getPlantName === 'function' ? getPlantName(feralHash) : feralHash.slice(0, 8), grade: tg ? tg.name : 'Common' };
  } catch (e) { info = { nm: feralHash.slice(0, 8), grade: 'Common' }; }

  // Challenge gate
  if (window.FG_Challenge) {
    FG_Challenge.start(info.grade, function(success) {
      if (success) {
        _awardFeral(feralHash, parentA.hash, parentB.hash, zk, info);
      } else {
        _toast('Challenge failed. Try again when the zone refreshes.');
      }
    });
  } else {
    _awardFeral(feralHash, parentA.hash, parentB.hash, zk, info);
  }
}

function _awardFeral(hash, parentA, parentB, zk, info) {
  // Mark zone as collected
  var zoneTimers = {}; try { zoneTimers = JSON.parse(localStorage.getItem('fg_feral_zones') || '{}'); } catch (e) {}
  zoneTimers[zk] = Date.now();
  localStorage.setItem('fg_feral_zones', JSON.stringify(zoneTimers));

  // ── Mystery seed: name/grade stay sealed until the seed blooms in nursery.
  // We still compute the true grade so Dew reward can scale, but the player
  // sees "Mystery Seed" everywhere until they water it and get the bloom.
  var mysteryName = 'Mystery Seed';
  var mysteryGrade = '???';
  var feralObj = {
    hash: hash,
    name: mysteryName,
    type: 'feral',
    grade: mysteryGrade,
    mystery: true,
    parentA: parentA,
    parentB: parentB,
    zone: zk,
    date: new Date().toISOString()
  };
  if (window.FG_Backpack && FG_Backpack.as) {
    var added = FG_Backpack.as(feralObj);
    if (!added) { _toast('Seed pouch full!'); return; }
  }

  // Dew reward by grade — grade itself stays hidden, but a mystery seed's
  // dew payout is always Common-tier until sprouted. Rarer seeds reward the
  // player with rarity reveal + stat bonuses at bloom time, not collection.
  var dewReward = 1;
  if (window.earnDew) earnDew(dewReward, 'feral_collect');

  // Event log: mystery seeds deserve a journal entry even before reveal.
  if (window.LW_Log) {
    window.LW_Log.write('feral_collected', {
      hash: hash,
      grade: '???',
      name: 'Mystery Seed',
      mystery: true,
      reward: dewReward
    });
  }

  _toast('\ud83c\udf30 Mystery seed pocketed. +' + dewReward + ' Dew \u00b7 sprout it to see what it is');
  try { navigator.vibrate && navigator.vibrate([15, 30, 15]); } catch (e) {}
  if (typeof gtag !== 'undefined') gtag('event', 'feral_collected', { mystery: 1, zone: zk.slice(0, 10) });

  // Refresh zone hexes to remove the glow
  _drawFeralZones();
  if (window.FG_Backpack) FG_Backpack.render();
}

// Debounced re-check after shared markers arrive
function _feralRespawnDebounced() {
  if (_feralRespawnTimer) clearTimeout(_feralRespawnTimer);
  _feralRespawnTimer = setTimeout(function() { _feralRespawnTimer = null; _drawZoneHexes(); _wildReproduction(); }, 2000);
}

// ═══ WILD PLANT REPRODUCTION ═══
// Breeding pairs in a zone have a chance to spawn a NEW wild plant in an
// adjacent zone. This is a shared Firestore event visible to all players.
// Uses deterministic doc ID (parent hashes + date) so multiple players
// triggering the same check produce the same write → idempotent.
var REPRO_CHANCE = 0.30; // 30% base per breeding pair per day
var REPRO_KEY = 'fg_repro_zones'; // localStorage: { zoneKey: lastCheckDate }
var REPRO_LINEAGE_CAP = 12; // max hexes per genetic line
// Population scaling: more plants = higher reproduction (ecological resilience)
// 2 plants = 0.7x, 4 plants = 1.0x, 8+ plants = 1.4x
function _popScale(count) { return Math.min(1.4, 0.5 + count * 0.125); }
var _reproTimer = null;
var _reproWeather = null; // cached weather data {temp, rain, fetched}

// Fetch real weather from Open-Meteo (free, no API key). Captures temp,
// daily rain, and current windspeed (for the WIND climate threshold).
function _fetchReproWeather(lat, lng, cb) {
  if (_reproWeather && (Date.now() - _reproWeather.fetched) < 3600000) { cb(_reproWeather); return; }
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(4) + '&longitude=' + lng.toFixed(4) + '&current_weather=true&daily=precipitation_sum&timezone=auto&forecast_days=1';
  fetch(url).then(function(r) { return r.json(); }).then(function(d) {
    var rain = 0; try { rain = d.daily.precipitation_sum[0] || 0; } catch (e) {}
    var temp = 20; try { temp = d.current_weather.temperature || 20; } catch (e) {}
    // open-meteo returns windspeed in km/h. Convert to mph to match the
    // plant windMax threshold units (18-45 mph range).
    var windKmh = 0; try { windKmh = d.current_weather.windspeed || 0; } catch (e) {}
    var wind = Math.round(windKmh * 0.621371 * 10) / 10;
    _reproWeather = { rain: rain, temp: temp, wind: wind, fetched: Date.now() };
    cb(_reproWeather);
  }).catch(function() { cb({ rain: 0, temp: 20, wind: 0, fetched: Date.now() }); });
}

// ═══ WILD CLIMATE DAMAGE TICK ═══
// Runs once per day on Wild-tab entry. For every plant in view (own +
// shared markers), compare today's weather to the plant's hash-derived
// climate thresholds. Each breached threshold subtracts hours from
// decayAt. Season multiplier amplifies damage for plants out-of-season.
// Events log silently to the Book of Secrets — no toast spam.
//
// Storage:
//   lw_climate_today  — ISO date string, rate-limits to 1x/day
//   lw_dry_days       — { zoneKey: consecutive dry-days count } for drought
//                       detection; reset when rain>1mm lands on the zone.
function _wildClimateTick() {
  if (!_uLat) return;
  _fetchReproWeather(_uLat, _uLng, function(weather) {
    _doClimateTick(weather);
  });
}
window._wildClimateTick = _wildClimateTick;

// ═══ SPROUT GERMINATION ═══
// Scan Firestore for sprout docs whose germinateAt has passed, then flip
// them to full wild plants. Runs on Wild-tab entry. Any authenticated
// player can germinate (wildDrops rule v6 already allows any auth'd user
// to update wild-owned docs), so the first player online each day does
// the work for the whole ecosystem.
function _wildGerminateSprouts() {
  if (!window.db || !window.firebase || !firebase.auth().currentUser) return;
  var now = Date.now();
  try {
    window.db.collection('wildDrops')
      .where('status', '==', 'alive')
      .where('sprout', '==', true)
      .limit(20)
      .get()
      .then(function(snap) {
        var activated = 0;
        snap.forEach(function(doc) {
          var d = doc.data();
          if (!d.germinateAt || d.germinateAt > now) return;
          // Synthesize an offspring hash from the parent so the sprout
          // becomes a new plant rather than an exact parent clone.
          var ph = d.parentHash || d.hash || '';
          var newHash = '';
          var timeSalt = Math.floor(now / 1000).toString(16);
          for (var h = 0; h < 64; h++) {
            var a = parseInt(ph[h] || '0', 16);
            var s = parseInt(timeSalt[h % timeSalt.length] || '0', 16);
            newHash += (a ^ s % 16).toString(16);
          }
          var newTraits = null, newEA = 5, newGrade = 'Common';
          try {
            newTraits = window.hashToTraits ? window.hashToTraits(newHash) : null;
            if (newTraits) {
              newEA = window.computeEA ? window.computeEA(newTraits, 0) : 5;
              var tg = window.getTerraGrade ? window.getTerraGrade(newTraits) : null;
              newGrade = tg ? (tg.name || 'Common') : 'Common';
            }
          } catch (e) {}
          doc.ref.update({
            sprout: false,
            germinateAt: null,
            hash: newHash,
            ea: newEA,
            grade: newGrade,
            season: (newTraits && newTraits.season) || 0,
            droppedAt: new Date().toISOString()
          }).then(function() {
            if (window._logWildEvent) {
              window._logWildEvent({ type: 'germinate', zone: d.zone, hash: newHash, grade: newGrade, parentHash: ph });
            }
          }).catch(function(){});
          activated++;
        });
        if (activated > 0 && window._swsLog) _swsLog('Germinated ' + activated + ' sprouts', 'ok');
      })
      .catch(function(e){
        if (window._swsLog) _swsLog('Germination query failed: ' + (e && e.message || e), 'warn');
      });
  } catch(e) {}
}
window._wildGerminateSprouts = _wildGerminateSprouts;

function _doClimateTick(weather) {
  var zones = _getAllZonePlants();
  var zoneKeys = Object.keys(zones);
  if (!zoneKeys.length) return;
  var temp = weather.temp || 20;
  var rain = weather.rain || 0;
  var wind = weather.wind || 0; // mph — captured by _fetchReproWeather as of Apr 14 2026
  // Dry-day tracking per zone
  var dryMap = {};
  try { dryMap = JSON.parse(localStorage.getItem('lw_dry_days') || '{}'); } catch(e) {}
  var currentMonth = new Date().getMonth();
  var curSeason = currentMonth < 3 ? 3 : currentMonth < 6 ? 0 : currentMonth < 9 ? 1 : 2;
  // Update local wild array for persistence at end
  var localWild = _getWild();
  var localChanged = false;
  var totalBreaches = 0, plantsDamaged = 0;

  for (var zk in zones) {
    // Drought counter: increment dry days, reset on rain
    if (rain > 1) dryMap[zk] = 0;
    else dryMap[zk] = (dryMap[zk] || 0) + 1;
    var zDry = dryMap[zk];

    var plants = zones[zk];
    for (var pi = 0; pi < plants.length; pi++) {
      var p = plants[pi];
      if (!p || !p.hash) continue;
      var t; try { t = window.hashToTraits ? window.hashToTraits(p.hash) : null; } catch(e) { continue; }
      if (!t) continue;
      // Legacy plants minted before thresholds shipped may lack fields.
      // Fill with safe defaults so they don't instantly die.
      var heatMax = typeof t.heatMax === 'number' ? t.heatMax : 32;
      var coldMin = typeof t.coldMin === 'number' ? t.coldMin : 5;
      var droughtDays = typeof t.droughtDays === 'number' ? t.droughtDays : 6;
      var floodMm = typeof t.floodMm === 'number' ? t.floodMm : 40;

      var breaches = [];
      if (temp > heatMax) breaches.push({ kind: 'heat', cur: temp, thr: heatMax });
      if (temp < coldMin) breaches.push({ kind: 'cold', cur: temp, thr: coldMin });
      if (rain > floodMm) breaches.push({ kind: 'flood', cur: rain, thr: floodMm });
      if (zDry > droughtDays) breaches.push({ kind: 'drought', cur: zDry, thr: droughtDays });
      var windMax = typeof t.windMax === 'number' ? t.windMax : 28;
      if (wind > windMax) breaches.push({ kind: 'wind', cur: wind, thr: windMax });
      if (!breaches.length) continue;

      // Season multiplier: peak 0.5x, adjacent 1.0x, opposite 1.75x
      var plantSeason = t.season || 0;
      var seasonDelta = Math.abs(plantSeason - curSeason);
      if (seasonDelta === 3) seasonDelta = 1;
      var seasonMult = seasonDelta === 0 ? 0.5 : seasonDelta === 2 ? 1.75 : 1.0;

      // 8 hours per breach × season mult. Cap at 3 days lifespan lost per day.
      var hoursLost = Math.min(72, breaches.length * 8 * seasonMult);
      var msLost = hoursLost * 3600 * 1000;

      // Apply damage: only to plants tracked in local wild (own). Shared
      // markers are driven by their owners' clients — we log the event for
      // the ecosystem view but don't mutate someone else's plant state here.
      var localIdx = -1;
      for (var lw = 0; lw < localWild.length; lw++) {
        if (localWild[lw] && localWild[lw].hash === p.hash) { localIdx = lw; break; }
      }
      if (localIdx >= 0) {
        var lp = localWild[localIdx];
        _ensureVitality(lp);
        lp.decayAt = (lp.decayAt || Date.now()) - msLost;
        lp.lastClimateHitAt = Date.now();
        lp.lastClimateKind = breaches[0].kind;
        localChanged = true;
      }
      plantsDamaged++;
      totalBreaches += breaches.length;

      // Silent Book of Secrets entry — one per damaged plant per day
      if (window._logWildEvent) {
        var breachLabels = breaches.map(function(b) { return b.kind; }).join('+');
        var plantName = '';
        try { plantName = window.getPlantName ? window.getPlantName(p.hash) : ''; } catch(e) {}
        window._logWildEvent({
          type: 'climate',
          event: breachLabels,
          hash: p.hash,
          name: plantName,
          temp: temp,
          rain: rain,
          dryDays: zDry,
          seasonMult: seasonMult,
          hoursLost: hoursLost,
          breaches: breaches.map(function(b){return b.kind+':'+Math.round(b.cur*10)/10+'/'+b.thr;})
        });
      }
    }
  }

  // Persist dry-day tracking and damaged plants
  try { localStorage.setItem('lw_dry_days', JSON.stringify(dryMap)); } catch(e) {}
  if (localChanged) _saveWild(localWild);

  if (window._swsLog && totalBreaches > 0) {
    _swsLog('Climate tick: ' + plantsDamaged + ' plants took damage (' + totalBreaches + ' breaches, ' + Math.round(temp) + '°C, ' + rain.toFixed(1) + 'mm)', 'info');
  }
}

window._wildReproduction = function(simMode){ return _wildReproduction(simMode); };
function _wildReproduction(simMode) {
  if (!_uLat || !_map) return;
  var user = window.firebase && firebase.auth() && firebase.auth().currentUser;
  if (!user || !user.uid || !window.db) return;

  // Fetch weather then proceed
  _fetchReproWeather(_uLat, _uLng, function(weather) {
    _doReproduction(weather, simMode);
  });
}

function _doReproduction(weather, simMode) {
  var user = firebase.auth().currentUser;
  var td = simMode ? simMode.date : new Date().toISOString().slice(0, 10);
  var checked = {}; try { checked = JSON.parse(localStorage.getItem(REPRO_KEY) || '{}'); } catch (e) {}

  // Weather modifiers
  var weatherMod = 1.0;
  var _weatherEvent = null;
  if (weather.rain > 5) { weatherMod = 2.0; _weatherEvent = 'heavy_rain'; }
  else if (weather.rain > 1) { weatherMod = 1.5; _weatherEvent = 'rain'; }
  else if (weather.rain === 0 && weather.temp > 35) { weatherMod = 0.3; _weatherEvent = 'drought'; }
  else if (weather.rain === 0 && weather.temp < 0) { weatherMod = 0.5; _weatherEvent = 'frost'; }

  // Log weather event once per day for morning report
  if (!simMode && _weatherEvent && window._logWildEvent) {
    var _wEvtKey = 'lw_weather_logged';
    var _wToday = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(_wEvtKey) !== _wToday) {
      localStorage.setItem(_wEvtKey, _wToday);
      var _wNames = { heavy_rain: 'heavy rain', rain: 'rain', drought: 'drought', frost: 'frost' };
      window._logWildEvent({ type: 'weather', event: _weatherEvent, name: _wNames[_weatherEvent], temp: weather.temp, rain: weather.rain });
    }
  }

  // Build zone map from all sources
  var zones = _getAllZonePlants();
  var zoneKeys = Object.keys(zones);
  var births = 0;
  var simLog = [];

  for (var z = 0; z < zoneKeys.length; z++) {
    var zk = zoneKeys[z];
    // Gather plants from this zone AND adjacent zones (plants in neighboring tiles can breed)
    var _zkParts = zk.split(',');
    var _zkLat = parseFloat(_zkParts[0]), _zkLng = parseFloat(_zkParts[1]);
    var plants = (zones[zk] || []).slice(); // copy this zone's plants
    var _adjStep = ZONE_SIZE || 0.001;
    for (var _adx = -1; _adx <= 1; _adx++) {
      for (var _ady = -1; _ady <= 1; _ady++) {
        if (_adx === 0 && _ady === 0) continue; // skip self
        var _adjKey = (Math.round((_zkLat + _adx * _adjStep) / _adjStep) * _adjStep).toFixed(4) + ',' + (Math.round((_zkLng + _ady * _adjStep) / _adjStep) * _adjStep).toFixed(4);
        if (zones[_adjKey]) {
          for (var _ap = 0; _ap < zones[_adjKey].length; _ap++) {
            var _isDup = false;
            for (var _dp = 0; _dp < plants.length; _dp++) { if (plants[_dp].hash === zones[_adjKey][_ap].hash) { _isDup = true; break; } }
            if (!_isDup) plants.push(zones[_adjKey][_ap]);
          }
        }
      }
    }
    // Age-gate: plants under 2 days old can't breed. Prevents explosive
    // compounding where wild-born babies become parents the same week
    // and the cluster runs away from its map. A 2-day floor also leaves
    // a natural breeding window (plants live 3 days baseline) before
    // climate damage closes the door.
    var MATURE_MS = 2 * 86400000;
    var now = Date.now();
    var maturePlants = [];
    for (var am = 0; am < plants.length; am++) {
      var _ap = plants[am];
      var _dat = _ap && _ap.droppedAt;
      if (typeof _dat === 'string') _dat = new Date(_dat).getTime();
      if (typeof _dat !== 'number' || isNaN(_dat)) _dat = now; // legacy: assume fresh
      if ((now - _dat) >= MATURE_MS) maturePlants.push(_ap);
    }
    // Override plants array with mature-only for the breeding logic below.
    plants = maturePlants;

    if (plants.length < 2) continue; // need 2+ mature parents
    if (!simMode && checked[zk] === td) continue; // already checked today

    if (!simMode) checked[zk] = td;

    // Population scaling: larger populations reproduce faster (ecological resilience)
    var popMod = _popScale(plants.length);
    // Density falloff — replaces the soft 50% cap at 6 plants. Sharper
    // tiers so dense zones self-limit instead of becoming permanent
    // growth engines. At 7+ plants no birth rolls from this zone.
    var densityMod =
      plants.length >= 7 ? 0 :
      plants.length >= 5 ? 0.10 :
      plants.length >= 3 ? 0.35 :
      1.0;
    if (densityMod === 0) continue; // zone is saturated; skip

    // Pick best complementary pair (prefer opposite seasons)
    var bestPair = null, bestScore = -1;
    for (var pi = 0; pi < plants.length && pi < 6; pi++) {
      for (var pj = pi + 1; pj < plants.length && pj < 6; pj++) {
        var sA = plants[pi].season || 0, sB = plants[pj].season || 0;
        var score = (Math.abs(sA - sB) === 2) ? 3 : (sA !== sB ? 2 : 1); // opposite > different > same
        score += Math.random(); // tie-break
        if (score > bestScore) { bestScore = score; bestPair = [pi, pj]; }
      }
    }
    if (!bestPair) continue;

    // Season modifier: peak season plants reproduce more
    var month = new Date().getMonth();
    var curSeason = month < 3 ? 3 : month < 6 ? 0 : month < 9 ? 1 : 2; // W,Sp,Su,Au
    var parentA = plants[bestPair[0]], parentB = plants[bestPair[1]];
    var seasonMod = 1.0;
    if ((parentA.season || 0) === curSeason || (parentB.season || 0) === curSeason) seasonMod = 1.3;

    // Mesh bonus: plants in mesh reproduce faster
    var meshMod = 1.0;
    if (window.getMeshBonus) {
      var _mA = getMeshBonus(parentA.hash || ''); var _mB = getMeshBonus(parentB.hash || '');
      var _meshStage = Math.max(_mA.highestStage || 0, _mB.highestStage || 0);
      if (_meshStage >= 3) meshMod = 1.3; else if (_meshStage >= 2) meshMod = 1.15;
    }
    // Soil bonus: mature soil boosts reproduction. Bug fix (Apr 14 2026):
    // was reading baseLat/baseLng which are declared later in the loop
    // (line ~1716 for wind dispersal), so this branch ALWAYS short-
    // circuited to false — soil bonuses have never applied. Use the
    // zone-center values computed at line 1583.
    var soilMod = 1.0;
    if (window.getSoilInfo && !isNaN(_zkLat)) {
      var _soilInfo = getSoilInfo(_zkLat, _zkLng);
      if (_soilInfo && _soilInfo.maturity >= 60) soilMod = 1.3;
      else if (_soilInfo && _soilInfo.maturity >= 30) soilMod = 1.15;
    }
    // Companion ability modifier
    var compMod = 1.0;
    if (window.getCompanionReproMod) {
      var _pAT = null; try { _pAT = window.hashToTraits(parentA.hash || ''); } catch (e) {}
      var _pBT = null; try { _pBT = window.hashToTraits(parentB.hash || ''); } catch (e) {}
      if (_pAT) compMod = Math.max(compMod, getCompanionReproMod(_pAT, weather));
      if (_pBT) compMod = Math.max(compMod, getCompanionReproMod(_pBT, weather));
    }
    // Final reproduction chance
    // Biome modifier (detected from real GPS + OSM data)
    var biomeMod = 1.0;
    if (window.getBiomeInfo && window._lastDetectedBiome) {
      var _bi = getBiomeInfo(window._lastDetectedBiome);
      if (_bi && _bi.spawnMod) biomeMod = _bi.spawnMod;
    }
    var finalChance = REPRO_CHANCE * weatherMod * densityMod * seasonMod * popMod * meshMod * soilMod * compMod * biomeMod;
    if (Math.random() >= finalChance) {
      if (simMode) simLog.push({ zone: zk, chance: Math.round(finalChance * 100) + '%', result: 'no breed' });
      continue;
    }

    // Generate offspring hash — always Gen 1 (wild resets chimera generation)
    var offHash = _breedHash(parentA.hash, parentB.hash);
    var gradeA = 'Common', gradeB = 'Common';
    try {
      if (window.hashToTraits && window.getTerraGrade) {
        gradeA = window.getTerraGrade(window.hashToTraits(parentA.hash)).name || 'Common';
        gradeB = window.getTerraGrade(window.hashToTraits(parentB.hash)).name || 'Common';
      }
    } catch (e) {}
    offHash = _adjustOffspringRarity(offHash, gradeA, gradeB);

    // Compute offspring traits — Gen 1 always
    var offTraits = null, offEA = 0, offGrade = 'Common';
    try {
      offTraits = window.hashToTraits(offHash);
      offTraits.chimerGen = 1; // ALWAYS Gen 1 in the wild
      offEA = window.computeEA ? window.computeEA(offTraits, 0) : 0;
      var otg = window.getTerraGrade ? window.getTerraGrade(offTraits) : null;
      offGrade = otg ? otg.name : 'Common';
    } catch (e) {}

    // Pick target hex — wind-biased dispersal with empty-hex preference.
    // Dispersal distance grows with each failed attempt so a baby from a
    // plant deep inside a tight cluster can eventually reach fresh ground.
    // Passes 1-4: 1-2 zones out (neighbor). Passes 5-8: 2-4 zones (second
    // ring). Passes 9-12: 3-6 zones (escape radius for dense clusters).
    // If still nothing empty, fall back to the last roll so the invasion
    // path still exists for legitimate takeovers.
    var parts = zk.split(',');
    var baseLat = parseFloat(parts[0]), baseLng = parseFloat(parts[1]);
    var targetLat, targetLng, targetZone, emptyFound = false;
    for (var dt = 0; dt < 12; dt++) {
      var windRad = ((_wd || 0) + Math.random() * 180 - 90) * Math.PI / 180;
      var windStr = 0.2 + Math.random() * 0.3;
      var randStr = 1 - windStr;
      // Escape-radius scaling — grow search out past the cluster.
      var rangeBase = dt < 4 ? 1 : dt < 8 ? 2 : 3;
      var rangeSpan = dt < 4 ? 1 : dt < 8 ? 2 : 3;
      var dist = ZONE_SIZE * (rangeBase + Math.random() * rangeSpan);
      targetLat = baseLat + Math.cos(windRad) * dist * windStr + (Math.random() - 0.5) * dist * randStr;
      targetLng = baseLng + Math.sin(windRad) * dist * windStr + (Math.random() - 0.5) * dist * randStr;
      targetZone = _zoneKey(targetLat, targetLng);
      if (targetZone === zk) continue; // don't land on own source zone
      if (!zones[targetZone] || zones[targetZone].length === 0) { emptyFound = true; break; }
    }

    // EA-based invasion check
    var targetPlants = zones[targetZone] || [];
    var invaded = false, displacedPlant = null;
    if (targetPlants.length > 0) {
      // Find weakest plant in target zone
      var weakest = targetPlants[0], weakestEA = targetPlants[0].ea || 0;
      for (var wp = 1; wp < targetPlants.length; wp++) {
        var wpEA = targetPlants[wp].ea || 0;
        // Player drops get +3 defense bonus
        if (!targetPlants[wp].wildBorn) wpEA += 3;
        // Companion temperament defense bonus (Guardian: +1)
        if (window.getCompanionDefenseEA && targetPlants[wp].hash) {
          try { var _wpT = window.hashToTraits(targetPlants[wp].hash); wpEA += getCompanionDefenseEA(_wpT); } catch (e) {}
        }
        // Mesh defense bonus (+1 per connection, max +3)
        if (window.getMeshBonus) { var _wpMesh = getMeshBonus(targetPlants[wp].hash || ''); wpEA += _wpMesh.eaBonus; }
        if (wpEA < weakestEA) { weakest = targetPlants[wp]; weakestEA = wpEA; }
      }
      // Offspring must exceed defender by 2+
      if (offEA > weakestEA + 2) {
        // Shell Shift check — Porcupine companion has 25% relocate chance
        if (window.checkShellShift && weakest.hash) {
          try {
            var _ssT = window.hashToTraits(weakest.hash);
            if (checkShellShift(_ssT)) {
              // Plant relocates instead of dying
              if (window._logWildEvent) window._logWildEvent({type:'rare',event:'shell_shift',hash:weakest.hash,
                name:window.getPlantName?window.getPlantName(weakest.hash):''});
              if (simMode) simLog.push({zone:zk,result:'Shell Shift! Defender relocated instead of dying'});
              continue; // skip this invasion — defender survived
            }
          } catch (e) {}
        }
        invaded = true;
        displacedPlant = weakest;
      } else {
        if (simMode) simLog.push({ zone: zk, chance: Math.round(finalChance * 100) + '%', result: 'blocked by EA ' + weakestEA + ' (offspring EA ' + offEA + ')' });
        continue; // can't invade, offspring dies
      }
    }

    // Lineage cap: count how many plants share these parent genes
    var lineageKey = [parentA.hash.slice(0, 4), parentB.hash.slice(0, 4)].sort().join('');
    var lineageCount = 0;
    for (var lz = 0; lz < zoneKeys.length; lz++) {
      var lPlants = zones[zoneKeys[lz]];
      for (var lp = 0; lp < lPlants.length; lp++) {
        var lk = [(lPlants[lp].parentA || '').slice(0, 4), (lPlants[lp].parentB || '').slice(0, 4)].sort().join('');
        if (lk === lineageKey) lineageCount++;
      }
    }
    if (lineageCount >= REPRO_LINEAGE_CAP) {
      if (simMode) simLog.push({ zone: zk, result: 'lineage cap reached (' + lineageCount + '/' + REPRO_LINEAGE_CAP + ')' });
      continue;
    }

    // Build offspring drop data
    // docId includes the source zone so each zone's attempt is a distinct
    // Firestore write. Previously collisions between zones rolling the same
    // "best pair" overwrote each other, capping clusters at ~1 birth/day.
    var pairKey = [parentA.hash.slice(0, 8), parentB.hash.slice(0, 8)].sort().join('');
    var zoneTag = zk.replace(/[^0-9A-Za-z]/g, '');
    var docId = 'wild_' + pairKey + '_' + td.replace(/-/g, '') + '_' + zoneTag;

    // ── RARE EVENT ROLLS ──
    var rareEvents = [];

    // Twin Birth (5%) — second offspring in adjacent hex
    var _isTwin = Math.random() < 0.05;
    if (_isTwin) rareEvents.push('twin');

    // Mutation Bloom (1%) — spontaneous mutation
    if (Math.random() < 0.01) {
      var _mutTypes = ['Glitch', 'Glass Stem', 'Wireframe'];
      var _mutPick = _mutTypes[Math.floor(Math.random() * 3)];
      // Modify hash byte 16 to trigger mutation
      var _mutHex = offHash.split('');
      _mutHex[32] = 'f'; _mutHex[33] = _mutPick === 'Glitch' ? '8' : _mutPick === 'Glass Stem' ? '4' : '0';
      offHash = _mutHex.join('');
      // Recompute traits with mutation
      try {
        offTraits = window.hashToTraits(offHash);
        offTraits.chimerGen = 1;
        offEA = window.computeEA ? window.computeEA(offTraits, 0) : offEA;
        var _mtg = window.getTerraGrade ? window.getTerraGrade(offTraits) : null;
        offGrade = _mtg ? _mtg.name : offGrade;
      } catch (e) {}
      rareEvents.push('mutation:' + _mutPick);
    }

    // Vagrant Seed (3%) — offspring lands 1-5km away instead of adjacent
    if (Math.random() < 0.03) {
      var vagDist = 0.01 + Math.random() * 0.04; // ~1-5km in degrees
      var vagAngle = Math.random() * Math.PI * 2;
      targetLat = baseLat + Math.cos(vagAngle) * vagDist;
      targetLng = baseLng + Math.sin(vagAngle) * vagDist;
      targetZone = _zoneKey(targetLat, targetLng);
      rareEvents.push('vagrant');
    }

    // Albino Seedling (0.5%) — all-white palette, dies in 48h unless watered
    if (Math.random() < 0.005) {
      rareEvents.push('albino');
    }

    var dropData = {
      lat: targetLat, lng: targetLng, hash: offHash,
      ownerUid: 'wild',
      ownerName: 'Wild',
      ea: offEA, defenderGame: 'set',
      season: (offTraits && offTraits.season) || 0,
      status: 'alive', grade: offGrade, generation: 1,
      zone: targetZone,
      droppedAt: simMode ? simMode.date + 'T12:00:00Z' : new Date().toISOString(),
      wildBorn: true,
      parentA: parentA.hash.slice(0, 8),
      parentB: parentB.hash.slice(0, 8),
      originDropperUid: parentA.originDropperUid || parentB.originDropperUid || parentA.ownerUid || parentB.ownerUid || 'wild',
      originDropperName: parentA.originDropperName || parentB.originDropperName || parentA.ownerName || parentB.ownerName || 'Wild',
      weatherAtBirth: { rain: weather.rain, temp: weather.temp },
      geohash: window._geoHash ? window._geoHash(targetLat, targetLng) : '',
      rareEvents: rareEvents.length > 0 ? rareEvents : null
    };

    if (simMode) {
      var rareStr = rareEvents.length > 0 ? ' [' + rareEvents.join(', ') + ']' : '';
      simLog.push({ zone: zk, chance: Math.round(finalChance * 100) + '%', result: 'BIRTH! EA:' + offEA + ' ' + offGrade + rareStr + (invaded ? ' (invaded EA:' + (displacedPlant.ea || 0) + ')' : ' (empty hex)'), data: dropData });
    }

    // Write to Firestore
    if (!simMode) {
      (function(did, dd, dp) {
        // If invading, log the invasion and delete the displaced plant
        if (dp) {
          if (window._logWildEvent) {
            var dpName = '';try{dpName=window.getPlantName?window.getPlantName(dp.hash||''):'Unknown';}catch(e){}
            window._logWildEvent({type:'invaded',defenderHash:dp.hash||'',defenderName:dpName,invaderHash:dd.hash,invaderEA:dd.ea});
          }
          if (dp.docId) window.db.collection('wildDrops').doc(dp.docId).delete().catch(function() {});
        }
        window.db.collection('wildDrops').doc(did).set(dd)
          .then(function() {
            if (window._swsLog) _swsLog('Wild birth! ' + did + ' grade:' + dd.grade + ' EA:' + dd.ea, 'ok');
            if (window._logWildBirth) window._logWildBirth(dd);
            // Dynasty reward: origin dropper earns pollen when their genetics spread
            if (dd.originDropperUid && dd.originDropperUid !== 'wild') {
              try {
                var _myUid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : '';
                if (dd.originDropperUid === _myUid) {
                  // It's MY lineage spreading — earn pollen!
                  var _dynPollen = {Common:1, Uncommon:2, Rare:3, Epic:5, Legendary:8, Mythic:12, Cosmic:20};
                  var _reward = _dynPollen[dd.grade] || 1;
                  var _curPol = parseInt(localStorage.getItem('fg_pollen') || '0');
                  localStorage.setItem('fg_pollen', String(_curPol + _reward));
                  if (window._logWildEvent) window._logWildEvent({
                    type: 'spread', originHash: dd.parentA || '', originName: dd.originDropperName || 'Your plant',
                    descendantHash: dd.hash, distance: 0, pollenEarned: _reward
                  });
                }
              } catch (e) {}
            }
          })
          .catch(function(e) { if (window._swsLog) _swsLog('Wild birth write: ' + (e.code || e.message), 'warn'); });
      })(docId, dropData, invaded ? displacedPlant : null);
    }

    // Log rare events to morning report
    if (!simMode && rareEvents.length > 0) {
      var _offName = '';try{_offName=window.getPlantName?window.getPlantName(offHash):'';}catch(e){}
      for (var re = 0; re < rareEvents.length; re++) {
        var evt = rareEvents[re];
        if (evt === 'twin') {
          window._logWildEvent({type:'rare',event:'twin_birth',hash:offHash,name:_offName,zone:targetZone});
        } else if (evt.indexOf('mutation:') === 0) {
          window._logWildEvent({type:'rare',event:'mutation_bloom',hash:offHash,name:_offName,mutation:evt.split(':')[1],zone:targetZone});
        } else if (evt === 'vagrant') {
          window._logWildEvent({type:'rare',event:'vagrant_seed',hash:offHash,name:_offName,zone:targetZone});
        } else if (evt === 'albino') {
          window._logWildEvent({type:'rare',event:'albino_seedling',hash:offHash,name:_offName,zone:targetZone});
        }
      }
    }

    // Twin Birth: spawn second offspring in adjacent hex
    if (_isTwin && !simMode) {
      var twinHash = _breedHash(parentB.hash, parentA.hash); // reversed parents = different hash
      var twinLat = targetLat + (Math.random() - 0.5) * ZONE_SIZE;
      var twinLng = targetLng + (Math.random() - 0.5) * ZONE_SIZE;
      var twinTraits = null, twinEA = 0, twinGrade = 'Common';
      try {
        twinTraits = window.hashToTraits(twinHash);
        twinTraits.chimerGen = 1;
        twinEA = window.computeEA ? window.computeEA(twinTraits, 0) : 0;
        var ttg = window.getTerraGrade ? window.getTerraGrade(twinTraits) : null;
        twinGrade = ttg ? ttg.name : 'Common';
      } catch (e) {}
      var twinDocId = 'twin_' + pairKey + '_' + td.replace(/-/g, '');
      var twinData = {
        lat: twinLat, lng: twinLng, hash: twinHash,
        ownerUid: 'wild', ownerName: 'Wild',
        ea: twinEA, defenderGame: 'set',
        season: (twinTraits && twinTraits.season) || 0,
        status: 'alive', grade: twinGrade, generation: 1,
        zone: _zoneKey(twinLat, twinLng),
        droppedAt: new Date().toISOString(),
        wildBorn: true, isTwin: true,
        parentA: parentA.hash.slice(0, 8), parentB: parentB.hash.slice(0, 8),
        originDropperUid: dropData.originDropperUid,
        originDropperName: dropData.originDropperName,
        weatherAtBirth: dropData.weatherAtBirth,
        geohash: window._geoHash ? window._geoHash(twinLat, twinLng) : ''
      };
      window.db.collection('wildDrops').doc(twinDocId).set(twinData).catch(function() {});
      if (window._logWildBirth) window._logWildBirth(twinData);
      births++;
    }

    births++;
    break; // max 1 birth per zone per day
  }

  // ── COMPANION ABILITY CHECKS (daily) ──
  if (!simMode) {
    var _myWildComp = [];
    try { _myWildComp = JSON.parse(localStorage.getItem('fg_wild_plants') || '[]'); } catch(e) {}
    for (var _ci = 0; _ci < _myWildComp.length; _ci++) {
      var _cp = _myWildComp[_ci];
      if (!_cp.hash || !_cp.lat) continue;
      var _ct = null;
      try { _ct = window.hashToTraits ? window.hashToTraits(_cp.hash) : null; } catch(e) {}
      if (!_ct) continue;
      var _cInfo = window.getCompanionInfo ? getCompanionInfo(_ct) : null;
      if (!_cInfo || !_cInfo.abilityKey) continue;

      // Toad Rain Caller — 30% auto-water chance
      if (_cInfo.abilityKey === 'rainCaller' && Math.random() < 0.3) {
        _cp.lastWatered = new Date().toISOString();
        _cp.neglectDecay = 0;
        if (window._logWildEvent) window._logWildEvent({type:'companion',event:'rain_caller',
          hash:_cp.hash,companion:_cInfo.name,text:_cInfo.name+' called rain — your plant was watered'});
      }

      // Butterfly Drift Pollination — 20% free cross-pollinate to random ally
      if (_cInfo.abilityKey === 'driftPollen' && Math.random() < 0.2 && _myWildComp.length > 1) {
        var _dTarget = _myWildComp[Math.floor(Math.random() * _myWildComp.length)];
        if (_dTarget.hash !== _cp.hash) {
          var _polReward = 3 + Math.floor(Math.random() * 8);
          try { var _pol = parseInt(localStorage.getItem('fg_pollen') || '0'); localStorage.setItem('fg_pollen', String(_pol + _polReward)); } catch(e) {}
          if (window._logWildEvent) window._logWildEvent({type:'companion',event:'drift_pollen',
            hash:_cp.hash,companion:_cInfo.name,text:'Butterfly carried pollen to a distant ally — +'+_polReward+' pollen'});
        }
      }

      // Raccoon Scavenger — check if any nearby plants were displaced, bank fertilizer
      if (_cInfo.abilityKey === 'scavenger') {
        var _recentInvasions = [];
        try { var _evts = JSON.parse(localStorage.getItem('lw_wild_events') || '[]'); _recentInvasions = _evts.filter(function(e) { return e.type === 'invaded' && Date.now() - (e.ts || 0) < 86400000; }); } catch(e) {}
        if (_recentInvasions.length > 0) {
          var _fertBank = parseInt(localStorage.getItem('lw_raccoon_fert') || '0');
          if (_fertBank < 3) {
            localStorage.setItem('lw_raccoon_fert', String(_fertBank + 1));
            if (window._logWildEvent) window._logWildEvent({type:'companion',event:'scavenger',
              hash:_cp.hash,companion:_cInfo.name,text:'Raccoon scavenged 1 fertilizer from a displaced plant'});
          }
        }
      }
    }
    localStorage.setItem('fg_wild_plants', JSON.stringify(_myWildComp));
  }

  // ── DAILY ECOSYSTEM EVALUATION ──
  if (!simMode) {
    if (window.evaluateMesh) try { evaluateMesh(); } catch (e) {}
    if (window.updateSoilMaturity) try { updateSoilMaturity(); } catch (e) {}
    if (window.evaluateCommons) try {
      evaluateCommons();
      // Render Commons boundaries on map
      if (window.getCommons && _map) {
        // Clear old commons circles
        if (window._commonsCircles) {
          for (var cci = 0; cci < window._commonsCircles.length; cci++) {
            _map.removeLayer(window._commonsCircles[cci]);
          }
        }
        window._commonsCircles = [];
        var commons = getCommons();
        for (var cmi = 0; cmi < commons.length; cmi++) {
          var cm = commons[cmi];
          var cmCircle = L.circle([cm.centerLat, cm.centerLng], {
            radius: 150, color: 'rgba(200,168,75,0.3)', fillColor: 'rgba(200,168,75,0.05)',
            weight: 1, dashArray: '8,6', fillOpacity: 0.05, interactive: false
          }).addTo(_map);
          // Add label
          var cmLabel = L.marker([cm.centerLat, cm.centerLng], {
            icon: L.divIcon({
              className: '',
              html: '<div style="font-family:Cormorant Garamond,serif;font-size:0.4rem;color:rgba(200,168,75,0.6);text-align:center;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,0.8);pointer-events:none;">' + cm.name + '<br><span style="font-family:DM Mono,monospace;font-size:0.25rem;color:var(--muted);">' + cm.plants + ' plants · ' + cm.owners + ' keepers</span></div>',
              iconSize: [120, 30], iconAnchor: [60, 15]
            }),
            interactive: false
          }).addTo(_map);
          window._commonsCircles.push(cmCircle);
          window._commonsCircles.push(cmLabel);
        }
      }
    } catch (e) {}
    if (window.evaluateBloomChorus) try { evaluateBloomChorus(); } catch (e) {}
    // Render constellation lines (connect your wild plants — gated by progressive disclosure)
    if (_map && (!window.canSee || window.canSee.constellation())) {
      if (window._constellationLines) { for (var _cli = 0; _cli < window._constellationLines.length; _cli++) _map.removeLayer(window._constellationLines[_cli]); }
      window._constellationLines = [];
      var _myWildPlants = [];
      try { _myWildPlants = JSON.parse(localStorage.getItem('fg_wild_plants') || '[]'); } catch(e) {}
      if (_myWildPlants.length >= 2) {
        // Sort by distance from center for a cleaner shape
        var _cLat2 = 0, _cLng2 = 0;
        for (var _ci2 = 0; _ci2 < _myWildPlants.length; _ci2++) { if(_myWildPlants[_ci2].lat){_cLat2 += _myWildPlants[_ci2].lat; _cLng2 += _myWildPlants[_ci2].lng;} }
        _cLat2 /= _myWildPlants.length; _cLng2 /= _myWildPlants.length;
        // Draw lines from each plant to its nearest neighbor
        for (var _pi2 = 0; _pi2 < _myWildPlants.length; _pi2++) {
          var _pA2 = _myWildPlants[_pi2]; if (!_pA2.lat) continue;
          var _nearDist = 999999, _nearIdx = -1;
          for (var _pj2 = 0; _pj2 < _myWildPlants.length; _pj2++) {
            if (_pi2 === _pj2 || !_myWildPlants[_pj2].lat) continue;
            var _d2 = Math.abs(_pA2.lat - _myWildPlants[_pj2].lat) + Math.abs(_pA2.lng - _myWildPlants[_pj2].lng);
            if (_d2 < _nearDist) { _nearDist = _d2; _nearIdx = _pj2; }
          }
          if (_nearIdx >= 0) {
            var _cLine = L.polyline([[_pA2.lat, _pA2.lng], [_myWildPlants[_nearIdx].lat, _myWildPlants[_nearIdx].lng]], {
              color: 'rgba(200,168,75,0.12)', weight: 0.8, dashArray: '3,8', interactive: false
            }).addTo(_map);
            window._constellationLines.push(_cLine);
          }
        }
      }
    }
    // Render home zone circle on map (owner only)
    if (window._isInHomeZone && _map) {
      if (window._homeZoneCircle) _map.removeLayer(window._homeZoneCircle);
      try {
        var _hz = JSON.parse(localStorage.getItem('lw_home_zone') || '{}');
        if (_hz.enabled && _hz.lat && _hz.lng) {
          window._homeZoneCircle = L.circle([_hz.lat, _hz.lng], {
            radius: 200, color: 'rgba(232,220,200,0.15)', fillColor: 'rgba(232,220,200,0.03)',
            weight: 1, dashArray: '8,12', fillOpacity: 0.03, interactive: false
          }).addTo(_map);
        }
      } catch(e) {}
    }
    // Render mesh connections on map (gated by progressive disclosure)
    if (window.getMeshLinks && _map && (!window.canSee || window.canSee.meshInfo())) {
      if (window._meshLines) { for (var mli = 0; mli < window._meshLines.length; mli++) _map.removeLayer(window._meshLines[mli]); }
      window._meshLines = [];
      var meshLinks = getMeshLinks();
      for (var ml = 0; ml < meshLinks.length; ml++) {
        var link = meshLinks[ml];
        if (!link.latA || !link.latB || link.stage < 1) continue;
        var meshOpacity = link.stage === 1 ? 0.12 : link.stage === 2 ? 0.2 : link.stage === 3 ? 0.3 : 0.4;
        var meshWeight = link.stage >= 3 ? 1.5 : 1;
        var meshLine = L.polyline([[link.latA, link.lngA], [link.latB, link.lngB]], {
          color: '#7ab356', weight: meshWeight, opacity: meshOpacity,
          dashArray: link.stage >= 3 ? null : '4,6', interactive: false
        }).addTo(_map);
        window._meshLines.push(meshLine);
      }
    }
    if (window.checkPhenotypeReveal) try { checkPhenotypeReveal(); } catch (e) {}
  }

  // ── NATURAL EVENTS (weather-driven, per-plant, max 1/day) ──
  if (!simMode) {
    var _myWildForEvents = [];
    try { _myWildForEvents = JSON.parse(localStorage.getItem('fg_wild_plants') || '[]'); } catch (e) {}
    var _evtToday = new Date().toISOString().split('T')[0];
    for (var ei = 0; ei < _myWildForEvents.length; ei++) {
      var ep = _myWildForEvents[ei];
      if (ep.lastEventDate === _evtToday) continue; // already had event today
      var epAge = Math.floor((Date.now() - new Date(ep.date || Date.now()).getTime()) / 86400000);
      if (epAge < 1) continue; // min 24h age

      var evtFired = null;
      var _rng = Math.random();

      // Dew Crown — sunrise + humidity high (12% chance)
      if (!evtFired && weather.rain > 0 && weather.temp > 5 && weather.temp < 25 && _rng < 0.12) {
        evtFired = { event: 'dew_crown', name: 'Dew Crown', text: 'First light kissed your plant with dew', reward: { ea: 1 } };
      }
      // Sun Flare — hot clear day (10% chance)
      if (!evtFired && weather.temp > 30 && weather.rain === 0 && Math.random() < 0.10) {
        evtFired = { event: 'sun_flare', name: 'Sun Flare', text: 'Noon painted your plant in gold', reward: { hashes: 3 } };
      }
      // Companion Nap — nice day, has companion (15% chance)
      if (!evtFired && ep.ea && ep.ea > 0 && weather.temp >= 20 && weather.temp <= 28 && Math.random() < 0.15) {
        var _epTraits = null;
        try { _epTraits = window.hashToTraits ? window.hashToTraits(ep.hash) : null; } catch (e) {}
        if (_epTraits && _epTraits.companion >= 20) {
          var cName = '';
          try { cName = window.TRAIT_BANK.companions[_epTraits.companion].name; } catch (e) {}
          evtFired = { event: 'companion_nap', name: 'Companion Nap', text: 'Your ' + cName + ' curled up for a nap in the shade' };
        }
      }
      // Root Hum — old plant, mature soil (8% chance)
      if (!evtFired && epAge > 30 && Math.random() < 0.08) {
        evtFired = { event: 'root_hum', name: 'Root Hum', text: 'Old ground remembers. Your plant drew from deep earth.', reward: { hashes: 2 } };
      }
      // Starfall Dust — clear night, new moon (3% chance)
      if (!evtFired && weather.rain === 0 && new Date().getHours() >= 22 && Math.random() < 0.03) {
        var _moon = window._getMoonPhase ? window._getMoonPhase() : '';
        if (_moon === 'new') {
          evtFired = { event: 'starfall_dust', name: 'Starfall Dust', text: 'The sky shed what it cannot keep. Faint sparkle on your leaves.', reward: { ea: 1 } };
        }
      }
      // Frost Nip — freezing, calm wind (5% chance, negative)
      if (!evtFired && weather.temp < -2 && Math.random() < 0.05) {
        evtFired = { event: 'frost_nip', name: 'Frost Nip', text: 'The cold bit your plant\'s smallest leaves.', reward: { ea: -1 } };
      }

      if (evtFired) {
        ep.lastEventDate = _evtToday;
        var _epName = '';
        try { _epName = window.getPlantName ? window.getPlantName(ep.hash) : ''; } catch (e) {}
        if (window._logWildEvent) window._logWildEvent({
          type: 'natural', event: evtFired.event, name: evtFired.name,
          hash: ep.hash, plantName: _epName, text: evtFired.text
        });
        // Apply rewards
        if (evtFired.reward) {
          if (evtFired.reward.hashes) {
            try { var _hl = JSON.parse(localStorage.getItem('sws_hash_ledger') || '{}'); _hl.earned = (_hl.earned || 0) + evtFired.reward.hashes; localStorage.setItem('sws_hash_ledger', JSON.stringify(_hl)); } catch (e) {}
          }
          if (evtFired.reward.ea) { ep.ea = (ep.ea || 0) + evtFired.reward.ea; }
        }
      }
    }
    localStorage.setItem('fg_wild_plants', JSON.stringify(_myWildForEvents));
  }

  // ── NEGLECT DECAY (plants that nobody tends decline) ──
  if (!simMode) {
    var _myWild = [];
    try { _myWild = JSON.parse(localStorage.getItem('fg_wild_plants') || '[]'); } catch (e) {}
    var _decayDirty = false;
    var _today = new Date().toISOString().split('T')[0];
    for (var di = 0; di < _myWild.length; di++) {
      var wp = _myWild[di];
      var lastTended = wp.lastWatered || wp.date || '';
      var daysSinceTend = 0;
      if (lastTended) {
        try { daysSinceTend = Math.floor((Date.now() - new Date(lastTended).getTime()) / 86400000); } catch (e) {}
      }
      // 7+ days: wilting (-1 EA/day, visual flag)
      if (daysSinceTend >= 7 && daysSinceTend < 21) {
        var decay = daysSinceTend - 6; // 1 EA lost per day past day 7
        wp.neglectDecay = decay;
        wp.status = 'Wilting';
        _decayDirty = true;
      }
      // 21+ days: goes feral — owner loses the plant
      if (daysSinceTend >= 21) {
        var feralName = '';
        try { feralName = window.getPlantName ? window.getPlantName(wp.hash) : ''; } catch (e) {}
        if (window._logWildEvent) {
          window._logWildEvent({ type: 'feral', hash: wp.hash, name: feralName, reason: 'neglect' });
        }
        if (window._toast) _toast('💀 Your ' + (feralName || 'plant') + ' went feral from neglect.');
        // Convert to wild-owned
        wp.ownerUid = 'wild';
        wp.ownerName = 'Feral';
        wp.own = false;
        wp.wildBorn = true;
        _decayDirty = true;
      }
    }
    if (_decayDirty) {
      // Remove fully feral plants from local wild array
      _myWild = _myWild.filter(function (wp) { return wp.own !== false; });
      localStorage.setItem('fg_wild_plants', JSON.stringify(_myWild));
    }
  }

  // ── SPONTANEOUS SPAWNING (depleted area recovery) ──
  // If player is in an area with very few plants, nature reclaims
  if (!simMode && _uLat) {
    var playerZone = _zoneKey(_uLat, _uLng);
    var nearbyCount = 0;
    for (var nz = 0; nz < zoneKeys.length; nz++) {
      var nzParts = zoneKeys[nz].split(',');
      var nzDist = Math.abs(parseFloat(nzParts[0]) - _uLat) + Math.abs(parseFloat(nzParts[1]) - _uLng);
      if (nzDist < ZONE_SIZE * 5) nearbyCount += zones[zoneKeys[nz]].length;
    }
    // If fewer than 3 plants within ~500m of player, spawn a wild feral
    if (nearbyCount < 3 && Math.random() < 0.5) {
      var spontHash = '';
      for (var sh = 0; sh < 64; sh++) spontHash += '0123456789abcdef'[Math.floor(Math.random() * 16)];
      var spontLat = _uLat + (Math.random() - 0.5) * 0.004; // ~200m radius
      var spontLng = _uLng + (Math.random() - 0.5) * 0.004;
      var spontTraits = null, spontEA = 0, spontGrade = 'Common';
      try {
        spontTraits = window.hashToTraits(spontHash);
        spontEA = window.computeEA ? window.computeEA(spontTraits, 0) : 3;
        var stg = window.getTerraGrade ? window.getTerraGrade(spontTraits) : null;
        spontGrade = stg ? stg.name : 'Common';
      } catch (e) {}
      var spontDoc = 'spont_' + playerZone.replace(/[^a-z0-9]/gi, '') + '_' + td.replace(/-/g, '');
      var spontData = {
        lat: spontLat, lng: spontLng, hash: spontHash,
        ownerUid: 'wild', ownerName: 'Wild',
        ea: spontEA, defenderGame: 'set',
        season: (spontTraits && spontTraits.season) || 0,
        status: 'alive', grade: spontGrade, generation: 1,
        zone: _zoneKey(spontLat, spontLng),
        droppedAt: new Date().toISOString(),
        wildBorn: true, spontaneous: true,
        parentA: 'nature', parentB: 'nature',
        geohash: window._geoHash ? window._geoHash(spontLat, spontLng) : ''
      };
      window.db.collection('wildDrops').doc(spontDoc).set(spontData).catch(function() {});
      births++;
    }
  }

  // Prune old zone checks (keep 7 days)
  var ckeys = Object.keys(checked);
  var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  for (var ck = 0; ck < ckeys.length; ck++) {
    if (checked[ckeys[ck]] < weekAgo) delete checked[ckeys[ck]];
  }
  localStorage.setItem(REPRO_KEY, JSON.stringify(checked));

  if (births > 0) {
    _toast('\ud83c\udf31 ' + births + ' new plant' + (births > 1 ? 's' : '') + ' sprouted in the wild!');
  }
}

function _addFeral(f){
  if(!_map||f.collected)return;
  var h='<div style="width:32px;height:40px;position:relative;cursor:pointer;"><img src="assets/games/wild/wild-feral-marker-v4.png" style="width:32px;height:32px;filter:drop-shadow(0 0 8px rgba(200,168,75,.5));animation:_fP 2.5s ease-in-out infinite" alt=""><div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);font-family:DM Mono,monospace;font-size:0.28rem;color:var(--gold);white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,.9);background:rgba(8,11,7,.8);padding:1px 4px;border-radius:2px;">FERAL</div></div>';
  var mk=L.marker([f.lat,f.lng],{icon:L.divIcon({className:'',html:h,iconSize:[24,38],iconAnchor:[12,12]}),zIndexOffset:800}).addTo(_map);
  mk.on('click',function(){_collectFeral(f,mk);});
}

function _collectFeral(f,mk){
  if(!_uLat){_toast('Need location.');return;}
  var d=_dist(_uLat,_uLng,f.lat,f.lng);
  if(d>COLLECT_RANGE){_toast('Walk closer! '+Math.round(d*3.281)+' ft away. Need within '+Math.round(COLLECT_RANGE*3.281)+' ft.');return;}
  // Check cooldown (keyed by zone+date since hash doesn't exist yet)
  var cdKey=(f.zone||'x')+'_'+((f.date||'').slice(0,10));
  if(!f._cooldown){try{var _fc=JSON.parse(localStorage.getItem('fg_feral_cd')||'{}');if(_fc[cdKey])f._cooldown=_fc[cdKey];}catch(e){}}
  if(f._cooldown&&Date.now()<f._cooldown){
    var secs=Math.ceil((f._cooldown-Date.now())/1000);
    _toast('Cooldown! Try again in '+secs+'s');return;
  }

  // Roll hash NOW from plants currently in this zone
  _rollFeralHash(f);

  // Launch challenge (grade based on rolled hash)
  if(window.FG_Challenge){
    var info=_buildInfo(f.hash);
    FG_Challenge.start(info.grade,function(success){
      if(success){
        _doCollectFeral(f,mk);
        _play('match');
      } else {
        f._cooldown=Date.now()+120000;
        try{var _fc=JSON.parse(localStorage.getItem('fg_feral_cd')||'{}');_fc[cdKey]=f._cooldown;localStorage.setItem('fg_feral_cd',JSON.stringify(_fc));}catch(e){}
        _play('buzz');
        _toast('Almost! Try again in 2 minutes.');
        // Re-roll hash on next attempt so player gets a different combo
        f.hash=null;f.parentA=null;f.parentB=null;
      }
    });
  } else {
    _doCollectFeral(f,mk);
  }
}

// Roll hash at collection time from plants in the feral's zone
function _rollFeralHash(f){
  if(f.hash)return; // already rolled (shouldn't happen but guard)
  var zones=_getAllZonePlants();
  var plants=zones[f.zone]||[];
  var hashA=null,hashB=null;
  if(plants.length>=2){
    // Random pair from zone
    var idxA=Math.floor(Math.random()*plants.length);
    var idxB=(idxA+1+Math.floor(Math.random()*(plants.length-1)))%plants.length;
    hashA=plants[idxA].hash;hashB=plants[idxB].hash;
  } else if(plants.length===1){
    // Single plant + random nonce
    hashA=plants[0].hash;
    var rb=new Uint8Array(32);crypto.getRandomValues(rb);
    hashB=Array.from(rb).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  } else {
    // No plants left — pure random
    var rb2=new Uint8Array(32);crypto.getRandomValues(rb2);
    hashA=Array.from(rb2).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
    rb2=new Uint8Array(32);crypto.getRandomValues(rb2);
    hashB=Array.from(rb2).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  }
  f.hash=_breedHash(hashA,hashB);
  // Adjust rarity based on parents
  var gradeA='Common',gradeB='Common';
  try{if(window.hashToTraits&&window.getTerraGrade){
    gradeA=window.getTerraGrade(window.hashToTraits(hashA)).name||'Common';
    gradeB=window.getTerraGrade(window.hashToTraits(hashB)).name||'Common';
  }}catch(e){}
  f.hash=_adjustOffspringRarity(f.hash,gradeA,gradeB);
  f.parentA=hashA?hashA.slice(0,8):null;
  f.parentB=hashB?hashB.slice(0,8):null;
}

function _doCollectFeral(f,mk){
  var info=_buildInfo(f.hash);
  var seedObj={hash:f.hash,loc:'Wild zone',clim:'Temperate',date:new Date().toISOString(),rare:info.grade!=='Common'};
  if(window.FG_Backpack){
    if(!FG_Backpack.as(seedObj)){_toast('Seed pouch full!');return;}
  } else {
    if(_pouch.length>=MAX_POUCH){_toast('Seed pouch full!');return;}
    _pouch.push({hash:f.hash,name:info.nm,type:'feral'});_savePouch();
  }
  f.collected=true;
  var data=[];try{data=JSON.parse(localStorage.getItem('fg_ferals')||'[]');}catch(e){}
  for(var i=0;i<data.length;i++){if(data[i].hash===f.hash){data[i].collected=true;break;}}
  localStorage.setItem('fg_ferals',JSON.stringify(data));
  if(_map&&mk)_map.removeLayer(mk);
  if(window.FG_Backpack)FG_Backpack.render();
  // Award Dew based on rarity (feral collection drips dew into the pouch)
  var dewReward={Common:1,Uncommon:2,Rare:3,Epic:5,Legendary:8,Mythic:12,Cosmic:20};
  var reward=dewReward[info.grade]||1;
  if(window.earnDew)window.earnDew(reward,'feral_collect');
  // Event log: record feral collection for Root Report / discovery stats
  if(window.LW_Log){
    window.LW_Log.write('feral_collected',{
      hash:f.hash,
      grade:info.grade,
      name:info.nm,
      reward:reward
    });
  }
  _e('progress');
  // Feral collection animation — seed crack burst
  _feralBurst(info.grade,info.gc,info.nm,reward);
  if(window.FG_Audio&&FG_Audio.enabled)try{FG_Audio.playCollectChime();}catch(e){}
  if(typeof gtag!=='undefined') gtag('event','feral_collected',{grade:info.grade,dew_reward:reward});
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
}

// ═══ FERAL COLLECTION BURST ═══
function _feralBurst(grade,gc,name,reward){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center;';
  // Flash
  var flash=document.createElement('div');
  flash.style.cssText='position:absolute;inset:0;background:'+gc+';opacity:0;animation:feralFlash 0.6s ease-out forwards;';
  overlay.appendChild(flash);
  // Particles burst
  for(var i=0;i<12;i++){
    var p=document.createElement('div');
    var angle=(i*30)*Math.PI/180;
    var dist=40+Math.random()*60;
    var dx=Math.cos(angle)*dist;
    var dy=Math.sin(angle)*dist;
    var sz=3+Math.random()*4;
    p.style.cssText='position:absolute;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+gc+';top:50%;left:50%;box-shadow:0 0 6px '+gc+';opacity:0;animation:feralParticle 0.8s ease-out forwards;--fdx:'+dx+'px;--fdy:'+dy+'px;';
    overlay.appendChild(p);
  }
  // Grade label
  var label=document.createElement('div');
  label.style.cssText='position:relative;font-family:Bebas Neue,sans-serif;font-size:1.2rem;color:'+gc+';letter-spacing:0.1em;text-shadow:0 0 20px '+gc+',0 2px 8px rgba(0,0,0,0.8);opacity:0;animation:feralLabel 1.5s ease-out 0.3s forwards;';
  label.textContent=grade.toUpperCase();
  overlay.appendChild(label);
  // Reward text
  var rw=document.createElement('div');
  rw.style.cssText='position:absolute;top:calc(50% + 30px);font-family:DM Mono,monospace;font-size:0.45rem;color:var(--cream);opacity:0;animation:feralLabel 1.2s ease-out 0.5s forwards;text-shadow:0 1px 4px rgba(0,0,0,0.8);';
  rw.textContent=name+' +'+reward+' Dew';
  overlay.appendChild(rw);
  document.body.appendChild(overlay);
  try{navigator.vibrate&&navigator.vibrate([20,40,30]);}catch(e){}
  setTimeout(function(){overlay.remove();},2200);
}

// ═══ PLANT INFO BUILDER ═══
function _buildInfo(hash){
  var t=null,nm='',rarities=[],grade='Common',gc='#8a9a7a';
  try{
    if(window.hashToTraits&&hash){
      t=window.hashToTraits(hash);
      var A=['Verdant','Shadow','Golden','Crimson','Pale','Iron','Ember','Frost','Dusk','Storm','Moss','Jade','Azure','Copper','Silk','Wild'];
      var N=['Wisp','Bloom','Fern','Thorn','Crown','Root','Drift','Spiral','Haze','Phantom','Crest','Veil','Shard','Arch','Spire','Reed'];
      nm=A[parseInt(hash.substring(0,2),16)%A.length]+' '+N[parseInt(hash.substring(2,4),16)%N.length];
      if(t.mutationName&&t.mutationName!=='None') rarities.push(t.mutationName);
      if(t.mythic>=0xD0){var m=t.mythic===0xFF?'Beholder':t.mythic>=0xFE?'Spider':t.mythic>=0xFC?'Heron':t.mythic>=0xF4?'Mammoth':t.mythic>=0xE0?'Phoenix':'Toad';rarities.push(m);}
      if(t.hasFlower&&t.flower===15) rarities.push('Glow Flower');
      if(t.pot===15) rarities.push('Golden Pot');
      if(t.base===15) rarities.push('Crystal Base');
      if(t.aura>0) rarities.push('Aura');
      if(t.hasFlower&&(t.flower%71)>34) rarities.push('Exotic Bloom');
      rarities=rarities.slice(0,3);
      try{var tg=window.getTerraGrade(t);grade=tg.label;gc=tg.color||GC[grade]||'#8a9a7a';}catch(e){}
    }
  }catch(e){}
  if(!nm) nm=(hash||'').substring(0,8);
  return{t:t,nm:nm,rarities:rarities,grade:grade,gc:gc};
}

// ═══ ADD PLANT TO MAP ═══
// Rarity glow ring HTML for plant markers
// Glow rings only on YOUR plants — wild plants stay mysterious
function _glowRing(grade,own){
  if(!own)return '';
  var g=(grade||'Common').toLowerCase();
  return '<div class="wild-glow wild-glow-'+g+'"></div>';
}

function _isRarePlus(grade){var g=(grade||'').toLowerCase();return g==='rare'||g==='epic'||g==='legendary'||g==='mythic'||g==='cosmic';}

function _shieldBadge(p){
  if(!p.defenderGame||p.defenderGame==='none')return '';
  return '<img src="assets/games/wild/wild-territory-shield-v4.png" style="position:absolute;top:-8px;left:-8px;width:20px;height:22px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.8));pointer-events:none;z-index:2;" alt="">';
}

function _addPlant(p){
  if(!_map)return;
  // ── HEX MODE: skip individual markers — only hex polygons render on map ──
  // Plant data is still stored in _getWild()/_sharedMarkers for hex inspector.
  // This eliminates ALL marker SVG rendering on load = massive perf win.
  return null;
  var sz=p.own?40:26,svg='';
  if(p.own){
    if(window._generatePlantSVG&&p.hash){try{svg=window._generatePlantSVG(p.hash,sz);}catch(e){}}
  } else {
    svg='<img src="assets/games/wild/wild-marker-common-v2.png" style="width:'+sz+'px;height:'+sz+'px;filter:drop-shadow(0 0 4px rgba(122,179,86,0.3));" alt="">';
  }
  if(!svg||svg.length<30){var fc=p.own?'#7ab356':'#5a7050';svg='<svg viewBox="0 0 30 40" width="'+sz+'" height="'+Math.round(sz*40/30)+'" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="30" width="14" height="10" rx="2" fill="#5a3a1f"/><line x1="15" y1="30" x2="15" y2="12" stroke="#3A5C2A" stroke-width="3" stroke-linecap="round"/><ellipse cx="8" cy="18" rx="7" ry="5" fill="'+fc+'" opacity="0.85" transform="rotate(-20 8 18)"/><ellipse cx="22" cy="15" rx="7" ry="5" fill="'+fc+'" opacity="0.8" transform="rotate(15 22 15)"/></svg>';}
  var info=_buildInfo(p.hash);
  // Own plants: show name in rarity color + season emblem + glow
  // Wild plants: show name in muted neutral — rarity is a mystery until harvest
  var tagColor=p.own?info.gc:'var(--muted)';
  var seasonEmb='';if(p.own&&info.t&&window.getSeasonInfo){var si=window.getSeasonInfo(info.t);seasonEmb=' <span style="font-size:0.35rem;">'+si.emblem+'</span>';}
  var tagName=p.own?info.nm:'Wild Plant';
  var tag='<div style="position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);font-family:Bebas Neue,sans-serif;font-size:0.35rem;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,1),0 0 6px rgba(0,0,0,0.8);color:'+tagColor+';pointer-events:none;">'+tagName+seasonEmb+'</div>';
  var th=Math.round(sz*40/30)+14;
  var glow=_glowRing(info.grade,p.own);
  var shield=_shieldBadge(p);
  // Age-based visual for own plants
  var ageFilter='filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));';
  if(p.own){
    var d=p.days||0;
    if(d<=2)ageFilter='filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 0 6px rgba(122,179,86,0.4));'; // young — bright green aura
    else if(d>=7)ageFilter='filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7)) drop-shadow(0 0 5px rgba(200,168,75,0.25));'; // established — warm gold
  }
  // Wilting visual — neglected plants desaturate + brown ring
  var wiltStyle='';var wiltRing='';
  var nd=p.neglectDecay||0;var isWilt=(nd>0||p.status==='Wilting');
  if(isWilt){
    wiltStyle='filter:saturate(0.4) brightness(0.7);';
    wiltRing='<div style="position:absolute;inset:-4px;border:2px solid rgba(139,90,43,0.6);border-radius:50%;pointer-events:none;z-index:0;"></div>';
    if(nd>10)wiltStyle+='opacity:0.5;';
  }
  var html='<div style="position:relative;width:'+(sz+6)+'px;height:'+th+'px;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;'+ageFilter+'">'
    +glow+shield+wiltRing+'<div style="'+wiltStyle+'">'+svg+'</div>'+tag+'</div>';
  var pd={lat:p.lat,lng:p.lng,hash:p.hash,own:p.own,name:info.nm,grade:info.grade,gc:info.gc,days:p.days||0,pollen:p.pollen||0,status:p.status||'Growing',neglectDecay:nd,traits:info.t,rarities:info.rarities,defenderGame:p.defenderGame||'set',ownerUid:p.ownerUid||'',ownerName:p.ownerName||'Keeper'};
  var mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:html,iconSize:[sz+6,th],iconAnchor:[(sz+6)/2,th-6]}),zIndexOffset:p.own?500:100}).addTo(_map).on('click',function(){showTP(pd,mk);});
}

// ═══ TRAIT PANEL ═══
// ═══ FIELD JOURNAL — reward every plant interaction ═══
// Every plant is a point of interest. Tapping always pays.
var FJ_KEY='lw_field_journal';
function _fjLoad(){try{return JSON.parse(localStorage.getItem(FJ_KEY)||'{}');}catch(e){return {};}}
function _fjSave(j){localStorage.setItem(FJ_KEY,JSON.stringify(j));}

function _fjInteract(p){
  if(!p||!p.hash)return;
  var j=_fjLoad();
  var today=new Date().toISOString().split('T')[0];
  var key=p.hash.slice(0,16);
  var entry=j[key]||{};
  var reward=0;var rewardType='';

  // DISCOVERY: first time ever tapping this plant
  if(!entry.discovered){
    entry.discovered=today;
    reward+=2;rewardType='New discovery! +2 Dew';
    // Track total discoveries
    j._count=(j._count||0)+1;
  }
  // SCOUT: first inspect this plant today
  else if(entry.lastScout!==today){
    reward+=1;rewardType='Scouted +1 Dew';
  }
  entry.lastScout=today;
  j[key]=entry;
  _fjSave(j);

  if(reward>0){
    if(window.earnDew)window.earnDew(reward,'field_journal');
    _play(reward>=2?'discover':'tap'); // discovery sparkle vs scout tap
    _toast(rewardType+(j._count?' \u00b7 '+j._count+' species found':''));
    if(window._updateGameDew)_updateGameDew();
  }
}

// Passive proximity pollen — called from _updateProximity on GPS update
function _fjPassivePollen(){
  if(!_uLat||!_uLng)return;
  var j=_fjLoad();
  var now=Date.now();
  var earned=0;
  // Check shared markers
  var hashes=Object.keys(_sharedMarkers);
  for(var i=0;i<hashes.length;i++){
    var entry=_sharedMarkers[hashes[i]];
    if(!entry||!entry.data||!entry.data.lat)continue;
    var dist=_dist(_uLat,_uLng,entry.data.lat,entry.data.lng);
    if(dist<=COLLECT_RANGE){
      var fk='_pp_'+hashes[i].slice(0,12);
      var lastPoll=j[fk]||0;
      if(now-lastPoll>=600000){ // 10 min cooldown per plant
        j[fk]=now;
        earned++;
      }
    }
  }
  // Also check own wild plants
  var wild=_getWild();
  for(var w=0;w<wild.length;w++){
    if(!wild[w].lat)continue;
    var wd=_dist(_uLat,_uLng,wild[w].lat,wild[w].lng);
    if(wd<=COLLECT_RANGE){
      var wk='_pp_'+wild[w].hash.slice(0,12);
      var wlp=j[wk]||0;
      if(now-wlp>=600000){j[wk]=now;earned++;}
    }
  }
  if(earned>0){
    // Proximity "passing-by" reward — now earns Dew instead of pollen
    if(typeof window.earnDew==='function')window.earnDew(earned,'wild_pass_by');
    _fjSave(j);
  }
}

function showTP(p,mk){
  _sel=p;_selMk=mk||null;
  // Reward interaction (discovery/scout)
  _fjInteract(p);
  var tp=document.getElementById('w-tp');if(!tp)return;
  // Hero: SVG + name + grade
  var sv=document.getElementById('wtp-svg');
  if(sv){
    if(p.own&&window._generatePlantSVG&&p.hash){try{sv.innerHTML=window._generatePlantSVG(p.hash,48);}catch(e){}}
    else if(!p.own){sv.innerHTML='<img src="assets/games/wild/wild-marker-common-v2.png" style="width:48px;height:48px;filter:drop-shadow(0 0 8px rgba(122,179,86,0.4));" alt="">';}
  }
  var n=document.getElementById('wtp-name');if(n){n.textContent=p.own?(p.name||'?'):'Wild Specimen';n.style.color=p.own?(p.gc||'var(--cream)'):'var(--cream)';}
  var g=document.getElementById('wtp-grade');
  if(g){
    if(p.own){g.textContent=(p.grade||'COMMON').toUpperCase();g.style.color=p.gc;}
    else{g.textContent='UNKNOWN';g.style.color='var(--muted)';}
  }
  var ow=document.getElementById('wtp-owner');if(ow){
    var ownerTxt=p.own?'Your plant':(p.ownerName||'Wild specimen');
    if(p.wildBorn&&p.originDropperUid&&p.originDropperUid!=='wild'){
      ownerTxt+=' · Lineage of '+(p.originDropperName||'a keeper');
    }
    if(p.wildBorn&&p.generation){
      ownerTxt+=' · Gen '+p.generation+' wild';
    }
    ow.textContent=ownerTxt;
  }
  // Rarest traits — hidden for non-owned plants (mystery until harvest)
  var re=document.getElementById('wtp-rarest');
  if(re){
    if(p.own&&p.rarities&&p.rarities.length>0){var rh='';for(var i=0;i<p.rarities.length;i++)rh+='<span style="display:inline-block;padding:2px 6px;border-radius:3px;font-size:clamp(.35rem,1vw,.42rem);margin:2px 2px 0 0;background:rgba(0,0,0,0.3);color:'+(p.gc||'var(--gold)')+';border:1px solid '+(p.gc||'var(--gold)')+';">\u2605 '+p.rarities[i]+'</span>';re.innerHTML=rh;re.style.display='block';}
    else re.style.display='none';
  }
  // Stats grid — hide EA and season for non-owned (keep days and status visible)
  var t=p.traits||{};
  var eaScore=window.computeEA?window.computeEA(t,p.days):0;
  var seasonInfo=window.getSeasonInfo?window.getSeasonInfo(t):{name:'?',emblem:'?'};
  var ea=document.getElementById('wtp-ea');if(ea){ea.textContent=p.own?eaScore:'?';ea.style.color=p.own&&eaScore>=15?'var(--gold)':'var(--muted)';}
  var sn=document.getElementById('wtp-season');if(sn){sn.innerHTML=p.own?seasonInfo.emblem:'?';sn.title=p.own?(seasonInfo.name+(seasonInfo.inPeak?' (Peak!)':'')):'Harvest to reveal';}
  var dy=document.getElementById('wtp-days');if(dy)dy.textContent=p.days+'d';
  var st=document.getElementById('wtp-status');
  if(st){
    if(!p.own&&p.defenderGame&&p.defenderGame!=='none'){
      var _gNames={set:'Trios',memory:'Memory',growth:'Growth',color:'Color',math:'Math',word:'Word'};
      st.textContent=_gNames[p.defenderGame]||p.defenderGame;
      st.style.color='var(--gold)';
      st.parentNode.querySelector('.wtp2-stat-lbl').textContent='Challenge';
    } else {
      st.textContent=p.status||'\u2014';st.style.color=p.status==='Thriving'?'var(--sage)':'var(--cream)';
      st.parentNode.querySelector('.wtp2-stat-lbl').textContent='Status';
    }
  }

  // Wire INSPECT buttons (both own and other)
  var inspFn=function(){
    var _wildPlant={hash:p.hash,date:p.date||'',born:Date.now(),origin:'wild',rare:false,traits:''};
    if(window.openCarousel){closeTP();openCarousel([_wildPlant],0,'wild-inspect');}
  };
  // Inspect only for own plants (wtp-inspect2 is in own-actions panel)
  var inspBtn2=document.getElementById('wtp-inspect2');if(inspBtn2)inspBtn2.onclick=inspFn;

  // === OWNERSHIP DETECTION ===
  var ab=document.getElementById('wtp-act');
  var otherAct=document.getElementById('wtp-other-actions');
  var ownActions=document.getElementById('wtp-own-actions');
  var ownStatus=document.getElementById('wtp-own-status');

  if(p.own){
    if(otherAct)otherAct.style.display='none';
    if(ownActions)ownActions.style.display='flex';
    // Pollen rate info
    var _polRates={Common:1,Uncommon:2,Rare:4,Epic:6,Legendary:9,Mythic:12,Cosmic:15};
    var _polRate=_polRates[p.grade]||1;
    // Firefly Night Bloom: 2x pollen 8PM-6AM
    try{var _pTraits=window.hashToTraits?window.hashToTraits(p.hash):null;
      if(_pTraits){
        var _pComp=window.getCompanionInfo?getCompanionInfo(_pTraits):null;
        if(_pComp&&_pComp.abilityKey==='nightBloom'){var _hr=new Date().getHours();if(_hr>=20||_hr<6)_polRate*=2;}
        // Mystic temperament: +15% pollen
        var _pPolBonus=window.getCompanionPollenBonus?getCompanionPollenBonus(_pTraits):0;
        if(_pPolBonus>0)_polRate=Math.round(_polRate*(1+_pPolBonus));
        // Bloom chorus bonus
        var _chBonus=window.getChorusBonus?getChorusBonus(p.hash):null;
        if(_chBonus&&_chBonus.inChorus)_polRate=Math.round(_polRate*(1+_chBonus.pollenBonus));
      }
    }catch(e){}
    var waterBtn=document.getElementById('wtp-water');
    if(waterBtn){
      waterBtn.onclick=function(){_waterOwnPlant(p,mk);};
      waterBtn.disabled=false;
      if(_uLat&&p.lat){
        var distToPlant=_dist(_uLat,_uLng,p.lat,p.lng);
        if(distToPlant>COLLECT_RANGE){
          waterBtn.disabled=true;
          if(ownStatus){ownStatus.innerHTML=Math.round(distToPlant)+'m away \u2014 walk within '+Math.round(COLLECT_RANGE)+'m to water<br><span style="color:var(--gold);">Earning '+_polRate+' pollen/hr</span>';ownStatus.style.display='block';}
        } else {
          if(ownStatus){ownStatus.innerHTML='Close enough to tend this plant<br><span style="color:var(--gold);">Earning '+_polRate+' pollen/hr</span>';ownStatus.style.display='block';}
        }
      } else {
        var _statusExtra='';
        // Add mesh info
        if(window.getMeshBonus){var _mb=getMeshBonus(p.hash);if(_mb.connections>0)_statusExtra+='<br><span style="color:var(--sage);">\ud83c\udf44 Mesh: '+_mb.stageName+' ('+_mb.connections+' link'+ (_mb.connections>1?'s':'')+')</span>';}
        // Add soil info
        if(window.getSoilInfo&&p.lat){var _si=getSoilInfo(p.lat,p.lng);if(_si.maturity>0)_statusExtra+='<br><span style="color:rgba(200,168,75,0.7);">\ud83c\udf3f Soil: '+_si.name+' ('+_si.maturity+'/100)</span>';}
        // Biome info
        if(window._lastDetectedBiome&&window.getBiomeInfo){var _bInfo=getBiomeInfo(window._lastDetectedBiome);_statusExtra+='<br><span style="color:'+_bInfo.color+';">'+_bInfo.icon+' '+_bInfo.name+(_bInfo.rarityBoost>0?' (+'+Math.round(_bInfo.rarityBoost*100)+'% rare)':'')+'</span>';}
        if(ownStatus){ownStatus.innerHTML='<span style="color:var(--gold);">Earning '+_polRate+' pollen/hr</span>'+_statusExtra;ownStatus.style.display='block';}
      }
    }
    var crossBtn=document.getElementById('wtp-cross');
    if(crossBtn)crossBtn.onclick=function(){_crossPollinate(p);};
    // Defense change button — show current game, tap to change
    var defBtn=document.getElementById('wtp-defense');
    if(defBtn){
      var _gNames={set:'Trios',memory:'Memory',growth:'Growth',color:'Color',math:'Math',word:'Word'};
      var _curDef=_gNames[p.defenderGame]||'Trios';
      defBtn.querySelector('.wtp2-btn-lbl').textContent=_curDef;
      defBtn.onclick=function(){_changeDefense(p);};
    }
  } else {
    if(ownActions)ownActions.style.display='none';
    if(otherAct)otherAct.style.display='flex';
    // Proximity hint + reward preview for non-owned plants
    var _dewRewards={Common:3,Uncommon:5,Rare:8,Epic:12,Legendary:18,Mythic:25,Cosmic:40};
    var _reward=_dewRewards[p.grade]||'?';
    var _tooFar=false;
    var _distOther=0;
    if(_uLat&&p.lat){_distOther=_dist(_uLat,_uLng,p.lat,p.lng);_tooFar=_distOther>COLLECT_RANGE;}
    if(ab){
      if(_tooFar){
        ab.style.opacity='0.35';ab.style.pointerEvents='none';
        var _abLbl=ab.querySelector('.wtp2-btn-lbl');
        if(_abLbl)_abLbl.textContent=Math.round(_distOther)+'m away';
      } else {
        ab.style.opacity='1';ab.style.pointerEvents='auto';
        ab.onclick=function(){_harvestToPouch(p);};
        var _abLbl2=ab.querySelector('.wtp2-btn-lbl');
        if(_abLbl2)_abLbl2.textContent='Harvest';
      }
    }
    if(ownStatus){
      if(_tooFar){
        ownStatus.innerHTML='Walk within '+Math.round(COLLECT_RANGE)+'m to harvest <span style="color:rgba(91,175,220,0.9);">\u2b50 '+_reward+' Dew</span>';
      } else {
        ownStatus.innerHTML='Beat their challenge to harvest <span style="color:rgba(91,175,220,0.9);">\u2b50 '+_reward+' Dew</span>';
      }
      ownStatus.style.display='block';
    }
    // Water other player's plant button
    var waterOtherBtn=document.getElementById('wtp-water-other');
    if(waterOtherBtn){
      var _waterKey='lw_water_budget';
      var _wBudget={};try{_wBudget=JSON.parse(localStorage.getItem(_waterKey)||'{}');}catch(e){}
      var _wToday=new Date().toISOString().split('T')[0];
      if(_wBudget.date!==_wToday){_wBudget={date:_wToday,count:0};}
      var _wLeft=5-(_wBudget.count||0);
      if(_tooFar){
        waterOtherBtn.style.opacity='0.35';waterOtherBtn.style.pointerEvents='none';
        waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent=Math.round(_distOther)+'m';
      }else if(_wLeft<=0){
        waterOtherBtn.style.opacity='0.35';waterOtherBtn.style.pointerEvents='none';
        waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent='0 left';
      }else{
        waterOtherBtn.style.opacity='1';waterOtherBtn.style.pointerEvents='auto';
        waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent='Water ('+_wLeft+')';
        waterOtherBtn.onclick=function(){
          // 10-second hold timer
          var _wHold=null;
          waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent='Hold...';
          waterOtherBtn.style.background='rgba(91,175,220,0.15)';
          var _wStart=Date.now();
          var _wInterval=setInterval(function(){
            var elapsed=((Date.now()-_wStart)/1000).toFixed(0);
            waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent=elapsed+'s / 10s';
            if(elapsed>=10){
              clearInterval(_wInterval);
              // Water complete!
              _wBudget.count=(_wBudget.count||0)+1;
              localStorage.setItem(_waterKey,JSON.stringify(_wBudget));
              waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent='Watered!';
              waterOtherBtn.style.opacity='0.5';waterOtherBtn.style.pointerEvents='none';
              // Log event
              var _pName='';try{_pName=window.getPlantName?window.getPlantName(p.hash):'';}catch(e){}
              var _myName=localStorage.getItem('pw_keeper_name')||'A stranger';
              if(window._logWildEvent)window._logWildEvent({type:'watered',hash:p.hash,name:_pName,by:_myName});
              // Award pollen to waterer
              try{var _pol=parseInt(localStorage.getItem('fg_pollen')||'0');localStorage.setItem('fg_pollen',String(_pol+2));}catch(e){}
              if(window._toast)_toast('💧 Watered! +2 pollen. '+(4-_wBudget.count)+' waters left today.');
              if(window._haptic)_haptic('bloom');
              if(window._trackQuest)_trackQuest('plantsWatered',1);
            }
          },1000);
          // Cancel on touchend/mouseup
          var _cancelWater=function(){
            clearInterval(_wInterval);
            waterOtherBtn.querySelector('.wtp2-btn-lbl').textContent='Water ('+Math.max(0,5-(_wBudget.count||0))+')';
            waterOtherBtn.style.background='';
            waterOtherBtn.removeEventListener('touchend',_cancelWater);
            waterOtherBtn.removeEventListener('mouseup',_cancelWater);
            waterOtherBtn.removeEventListener('mouseleave',_cancelWater);
          };
          // Only cancel if released BEFORE 10s
          setTimeout(function(){
            waterOtherBtn.addEventListener('touchend',_cancelWater);
            waterOtherBtn.addEventListener('mouseup',_cancelWater);
            waterOtherBtn.addEventListener('mouseleave',_cancelWater);
          },100);
        };
      }
    }
    // Wild breed button — breed with this wild plant using your greenhouse plants
    var wildBreedBtn=document.getElementById('wtp-wild-breed');
    if(wildBreedBtn){
      var _ghForBreed=[];try{_ghForBreed=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
      if(_ghForBreed.length<1){
        wildBreedBtn.style.opacity='0.35';wildBreedBtn.style.pointerEvents='none';
        var _wbLbl=wildBreedBtn.querySelector('.wtp2-btn-lbl');if(_wbLbl)_wbLbl.textContent='Need plants';
      } else {
        wildBreedBtn.style.opacity='1';wildBreedBtn.style.pointerEvents='auto';
        wildBreedBtn.onclick=function(){
          // Must be within COLLECT_RANGE to breed
          if(_uLat&&p.lat){
            var _bDist=_dist(_uLat,_uLng,p.lat,p.lng);
            if(_bDist>COLLECT_RANGE){_toast('Walk closer to breed! '+Math.round(_bDist)+'m away. Need within '+Math.round(COLLECT_RANGE)+'m.');return;}
          }
          closeTP();
          var _wildForBreed={hash:p.hash,name:'Wild Specimen',grade:p.grade||'Common',gc:p.gc||'var(--muted)',days:p.days||0,ownerUid:p.ownerUid||'',generation:1,breedCount:0,_wildMasked:true};
          if(window.openBreedScreen)openBreedScreen(_wildForBreed,'wild-other');
          else _toast('Breeding screen not loaded.');
        };
      }
    }
  }

  tp.classList.add('open');
}
function closeTP(){var tp=document.getElementById('w-tp');if(tp)tp.classList.remove('open');var oa=document.getElementById('wtp-own-actions');if(oa)oa.style.display='none';var ot=document.getElementById('wtp-other-actions');if(ot)ot.style.display='flex';var ab=document.getElementById('wtp-act');if(ab){ab.style.opacity='1';ab.style.pointerEvents='auto';var _abl=ab.querySelector('.wtp2-btn-lbl');if(_abl)_abl.textContent='Harvest';}var wb=document.getElementById('wtp-wild-breed');if(wb){wb.style.opacity='1';wb.style.pointerEvents='auto';var _wbl=wb.querySelector('.wtp2-btn-lbl');if(_wbl)_wbl.textContent='Breed';}var os=document.getElementById('wtp-own-status');if(os){os.style.display='none';os.textContent='';}var sl=document.getElementById('wtp-status');if(sl){var lb=sl.parentNode.querySelector('.wtp2-stat-lbl');if(lb)lb.textContent='Status';}_sel=null;_selMk=null;}

// ═══ HARVEST TO BACKPACK (other players' plants only) ═══
function _harvestToPouch(p){
  if(!p||!p.hash){_toast('No plant selected.');return;}
  if(p.own){_toast('You can\'t harvest your own plant!');return;} // SAFETY CHECK
  // Anti-farming checks
  var afCheck=_afCanHarvest(p.ownerUid||'');
  if(!afCheck.ok){_toast(afCheck.reason);return;}
  // Check proximity
  if(_uLat&&p.lat){
    var distToPlant=_dist(_uLat,_uLng,p.lat,p.lng);
    if(distToPlant>COLLECT_RANGE){_toast('Walk closer! '+Math.round(distToPlant)+'m away.');return;}
  }
  // Check cooldown on this plant
  if(p._harvestCooldown&&Date.now()<p._harvestCooldown){
    var secs=Math.ceil((p._harvestCooldown-Date.now())/1000);
    _toast('Defended! Try again in '+secs+'s');return;
  }
  // Must beat the planter's chosen defender game
  var defGame=p.defenderGame||'set';
  var grade=p.grade||'Common';
  if(window.FG_Challenge&&FG_Challenge.startSpecific){
    FG_Challenge.startSpecific(defGame,grade,function(success){
      if(success){
        _doHarvest(p);
        _play('match');
      } else {
        p._harvestCooldown=Date.now()+10000;
        _play('buzz');
        _toast('Defended! Try again in 10 seconds.');
      }
    });
  } else if(window.FG_Challenge){
    FG_Challenge.start(grade,function(success){
      if(success){_doHarvest(p);_play('collect');}
      else{p._harvestCooldown=Date.now()+10000;_play('buzz');_toast('Defended! Try again in 10 seconds.');}
    });
  } else {
    // FG_Challenge not loaded — block harvest to protect economy
    _toast('Challenge system loading. Try again in a moment.');
    return;
  }
}
function _doHarvest(p){
  // Pre-check: backpack has room (fresh state check before starting transaction)
  var plantObj={hash:p.hash,name:p.name,grade:p.grade||'Common',origin:'wild',hp:'h',pi:parseInt(p.hash.charAt(0),16)%5};
  if(window.FG_Backpack&&FG_Backpack.getState){
    var _bpSt=FG_Backpack.getState();
    if(_bpSt&&_bpSt.plants&&_bpSt.plants.length>=(_bpSt.cap||3)){
      _toast('Backpack full! Return to Base first.');return;
    }
  } else if(!window.FG_Backpack){
    if(_pouch.length>=MAX_POUCH){_toast('Pouch full!');return;}
  }

  var dewReward={Common:3,Uncommon:5,Rare:8,Epic:12,Legendary:18,Mythic:25,Cosmic:40};
  var baseReward=dewReward[p.grade]||3;
  // Heron Precision Strike: 2x harvest IF the plant being harvested HAS a Heron
  // (was incorrectly applied globally — fixed to check the target plant only)
  try {
    var _harvestTraits=window.hashToTraits?window.hashToTraits(p.hash):null;
    if(_harvestTraits&&_harvestTraits.companion===36)baseReward*=2; // Great Blue Heron on THIS plant
  } catch(e){}
  // Forager temperament: +10% harvest bonus
  try {
    var _harvCompBonus=window.getCompanionHarvestBonus;
    if (_harvCompBonus) {
      var _gh4F=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');
      for (var _f4i=0;_f4i<_gh4F.length;_f4i++){
        var _f4t=window.hashToTraits?window.hashToTraits(_gh4F[_f4i].hash):null;
        if (_f4t){var _fBonus=_harvCompBonus(_f4t);if(_fBonus>0){baseReward=Math.round(baseReward*(1+_fBonus));break;}}
      }
    }
  } catch(e){}
  // Diminishing returns: 80% decay per harvest today
  var harvestCount=_afGetCachedState().count||0;
  var decay=Math.pow(0.8,harvestCount);
  var reward=Math.max(1,Math.round(baseReward*decay));
  var myUid='';try{var _mu=window.firebase&&firebase.auth()&&firebase.auth().currentUser;if(_mu)myUid=_mu.uid;}catch(e){}

  // ── Firestore transaction: atomic harvest ──
  // Prevents double-harvest race condition between two players
  var _isDemo=p.ownerUid&&p.ownerUid.indexOf('demo_')===0;
  if(window.db&&p.ownerUid&&p.hash&&!_isDemo){
    var docId=p.ownerUid+'_'+p.hash.slice(0,16);
    var dropRef=window.db.collection('wildDrops').doc(docId);
    window.db.runTransaction(function(tx){
      return tx.get(dropRef).then(function(doc){
        if(!doc.exists){throw new Error('ALREADY_HARVESTED');}
        // Plant still exists — safe to harvest. Delete it atomically.
        tx.delete(dropRef);
        // Write reward for the displaced planter
        if(p.ownerUid&&p.ownerUid!==myUid){
          var rewardRef=window.db.collection('vaults').doc(p.ownerUid).collection('pendingRewards').doc();
          tx.set(rewardRef,{
            type:'harvest_reward',amount:reward,grade:p.grade||'Common',
            plantName:p.name||'Plant',harvesterUid:myUid,
            timestamp:firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
    }).then(function(){
      // Transaction succeeded — apply local state
      _afRecordHarvest(p.ownerUid||'');
      _harvestApplyLocal(p,plantObj,reward);
      if(window._swsLog)_swsLog('Harvest TX OK: '+docId,'ok');
    }).catch(function(e){
      if(e.message==='ALREADY_HARVESTED'){
        _toast('Someone else got that plant first!');
        // Clean up local marker
        var wild=_getWild().filter(function(w){return w.hash!==p.hash;});
        _saveWild(wild);if(_selMk&&_map)_map.removeLayer(_selMk);closeTP();_updateCounts();
      } else {
        if(window._swsLog)_swsLog('Harvest TX err: '+e.message,'err');
        // Fallback: apply locally anyway (offline resilience)
        _afRecordHarvest(p.ownerUid||'');
        _harvestApplyLocal(p,plantObj,reward);
      }
    });
  } else {
    // No Firestore (offline or demo mode) — local only
    _afRecordHarvest(p.ownerUid||'');
    _harvestApplyLocal(p,plantObj,reward);
  }
}

// Apply harvest results to local state (called after transaction succeeds or in offline mode)
function _harvestApplyLocal(p,plantObj,reward){
  if(window.FG_Backpack){
    if(!FG_Backpack.ap(plantObj)){_toast('Plant slots full!');return;}
  } else {
    _pouch.push({hash:p.hash,name:p.name,type:'harvest',grade:p.grade,gc:p.gc});_savePouch();
  }
  var wild=_getWild().filter(function(w){return w.hash!==p.hash;});
  _saveWild(wild);
  if(_selMk&&_map)_map.removeLayer(_selMk);
  // Also clean shared marker entry (for demo and real shared plants)
  if(p.hash&&_sharedMarkers[p.hash]){
    if(_sharedMarkers[p.hash].marker&&_map)_map.removeLayer(_sharedMarkers[p.hash].marker);
    delete _sharedMarkers[p.hash];
  }
  closeTP();
  if(window.FG_Backpack)FG_Backpack.render();
  _updateCounts();
  // ── Harvest reveal flash: show the plant they caught ──
  try{navigator.vibrate&&navigator.vibrate([25,40,40,60,55]);}catch(e){} // bloom crescendo
  _showHarvestReveal(p,reward);
  // First harvest milestone
  if(!localStorage.getItem('lw_first_harvest')){
    localStorage.setItem('lw_first_harvest','1');
    setTimeout(function(){_toast('\ud83c\udf1f First harvest! Hit RETURN TO BASE when your backpack is full.');},2500);
  }
}
function _showHarvestReveal(p,reward){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(5,8,4,0.88);backdrop-filter:blur(10px);animation:panelFadeIn 0.3s ease;pointer-events:auto;';
  var plantSvg='';
  if(window._generatePlantSVG&&p.hash){try{plantSvg=window._generatePlantSVG(p.hash,100);}catch(e){}}
  var nm=p.name||'Plant';
  var grade=(p.grade||'Common').toUpperCase();
  var gc=p.gc||'var(--cream)';
  var h='<div style="text-align:center;opacity:0;animation:tierRevealPop 0.5s ease 0.1s forwards;">';
  h+='<div style="width:120px;height:120px;border-radius:16px;background:rgba(26,36,22,0.6);border:2px solid '+gc+';display:flex;align-items:center;justify-content:center;margin:0 auto 0.4rem;box-shadow:0 0 30px rgba(122,179,86,0.15);">'+plantSvg+'</div>';
  h+='<div style="font-family:Playfair Display,serif;font-size:0.85rem;color:var(--cream);margin-bottom:0.15rem;">'+nm+'</div>';
  h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.55rem;color:'+gc+';letter-spacing:0.1em;margin-bottom:0.3rem;">'+grade+'</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.4rem;color:rgba(91,175,220,0.9);margin-bottom:0.1rem;">+'+reward+' Dew to owner</div>';
  h+='<div style="font-family:DM Mono,monospace;font-size:0.35rem;color:var(--muted);margin-top:0.2rem;">\ud83c\udf92 Added to backpack</div>';
  h+='</div>';
  ov.innerHTML=h;
  ov.onclick=function(){ov.style.opacity='0';ov.style.transition='opacity 0.25s';setTimeout(function(){if(ov.parentNode)ov.remove();},300);};
  document.body.appendChild(ov);
  // Auto-dismiss after 2.5 seconds
  setTimeout(function(){if(ov.parentNode){ov.style.opacity='0';ov.style.transition='opacity 0.25s';setTimeout(function(){if(ov.parentNode)ov.remove();},300);}},2500);
}

// ═══ WATER OWN PLANT (GPS-proximate only) ═══
function _waterOwnPlant(p,mk){
  if(!p||!p.hash){_toast('No plant selected.');return;}
  if(!_uLat||!p.lat){_toast('Need GPS location.');return;}

  // Check proximity
  var distToPlant=_dist(_uLat,_uLng,p.lat,p.lng);
  if(distToPlant>COLLECT_RANGE){
    _toast('Too far! Walk within '+Math.round(COLLECT_RANGE)+'m to water. ('+Math.round(distToPlant)+'m away)');
    return;
  }

  // Check Dew cost (5 Dew to water — now spends from the real Dew ledger,
  // not the hash ledger. Hash/Sunbeams are for plant minting only.)
  var _waterCost=5;
  var balance=(typeof window.getTotalDew==='function')?window.getTotalDew():0;
  if(balance<_waterCost){_toast('Need '+_waterCost+' Dew to water. You have '+balance+'. Earn Dew from your wild plants.');return;}

  // Spend 5 Dew
  if(typeof window.spendDew==='function'){
    if(!window.spendDew(_waterCost)){_toast('Not enough Dew to water.');return;}
  }

  // Update wild plant stress
  var wild=_getWild();
  var _wateredHash=null;
  for(var i=0;i<wild.length;i++){
    if(wild[i].hash===p.hash){
      wild[i].stress=Math.max(0,(wild[i].stress||0)-2);
      wild[i].lastWatered=new Date().toISOString();
      wild[i].neglectDecay=0;
      _wateredHash=wild[i].hash;
      break;
    }
  }
  // Symbiote temperament: 25% shared watering to mesh-connected plants
  if(_wateredHash&&window.getMeshLinks){
    var _meshLinks=getMeshLinks();
    var _wh8=_wateredHash.slice(0,8);
    for(var _mi=0;_mi<_meshLinks.length;_mi++){
      var _ml=_meshLinks[_mi];
      if(_ml.stage<2)continue; // Need at least Nutrient Bridge for water sharing
      var _linkedHash=null;
      if(_ml.hashA===_wh8)_linkedHash=_ml.hashB;
      else if(_ml.hashB===_wh8)_linkedHash=_ml.hashA;
      if(!_linkedHash)continue;
      // Check if linked plant has Symbiote companion
      for(var _wi=0;_wi<wild.length;_wi++){
        if(wild[_wi].hash&&wild[_wi].hash.slice(0,8)===_linkedHash){
          var _shareAmt=_ml.stage>=3?0.5:0.25;
          wild[_wi].stress=Math.max(0,(wild[_wi].stress||0)-Math.ceil(2*_shareAmt));
          wild[_wi].lastWatered=new Date().toISOString();
          break;
        }
      }
    }
  }
  _saveWild(wild);

  // Visual feedback — sound + toast + water particle burst on marker
  _play('match');
  // Watering grants pollen XP as a caretaker reward (direct XP, no Dew earn)
  var _waterXP=3;if(window.PW_grantXP)PW_grantXP(_waterXP,'water_care');
  _play('water');
  _toast('\ud83d\udca7 Watered! Stress reduced. (-5 Dew, +'+_waterXP+' XP)');
  if(mk&&mk._icon){
    var mEl=mk._icon;
    // Brief glow pulse
    mEl.style.transition='filter 0.3s ease';
    mEl.style.filter='drop-shadow(0 0 12px rgba(91,143,185,0.8)) brightness(1.2)';
    setTimeout(function(){mEl.style.filter='';mEl.style.transition='';},1200);
    // Water droplet particles
    var rect=mEl.getBoundingClientRect();
    var cx=rect.left+rect.width/2;var cy=rect.top+rect.height/2;
    for(var _wi=0;_wi<8;_wi++){(function(i){
      var angle=(i/8)*Math.PI*2+Math.random()*0.4;
      var dist=20+Math.random()*25;
      var dx=Math.cos(angle)*dist;var dy=Math.sin(angle)*dist-15;
      var drop=document.createElement('div');
      drop.innerHTML='<svg width="8" height="10" viewBox="0 0 8 10"><path d="M4,0 C4,0 0,5 0,7 C0,8.7 1.8,10 4,10 C6.2,10 8,8.7 8,7 C8,5 4,0 4,0Z" fill="rgba(91,143,185,0.8)"/></svg>';
      drop.style.cssText='position:fixed;left:'+cx+'px;top:'+cy+'px;pointer-events:none;z-index:99999;opacity:0;animation:sparkBurst 1.2s ease forwards;animation-delay:'+(i*40)+'ms;--sdx:'+dx+'px;--sdy:'+dy+'px;';
      document.body.appendChild(drop);
      setTimeout(function(){if(drop.parentNode)drop.remove();},1400);
    })(_wi);}
  }

  // Update status text
  var ownStatus=document.getElementById('wtp-own-status');
  if(ownStatus)ownStatus.textContent='\u2713 Watered just now';

  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
}

// ═══ CROSS-POLLINATE (visit action — plant stays on map) ═══
function _crossPollinate(p){
  if(!p||!p.hash){_toast('No plant selected.');return;}
  var gh=_getGH();
  if(!gh||gh.length===0){_toast('You need plants in your greenhouse to cross-pollinate.');return;}
  // set-51: Open new breeding comparison screen instead of old picker
  closeTP();
  if(window.openBreedScreen)window.openBreedScreen(p,'wild');
  else _toast('Breeding screen not loaded.');
}

// ═══ EXECUTE CROSS-POLLINATION ═══
function _doCrossPollination(wildPlant,matePlant){
  function _cpReward(offGen){
    var roll=Math.random();
    var rewardMsg='';
    if(roll<0.6){
      // 60% — XP reward (monotonic pollen, no spend)
      var xpBonus=5+Math.floor(Math.random()*10);
      if(window.PW_grantXP)PW_grantXP(xpBonus,'cross_pollinate');
      rewardMsg='+'+xpBonus+' XP!';
    } else if(roll<0.9){
      // 30% — Dew reward (spendable on acceleration + cuttings)
      var dewBonus=2+Math.floor(Math.random()*4);
      if(window.earnDew)window.earnDew(dewBonus,'cross_pollinate');
      rewardMsg='+'+dewBonus+' Dew!';
    } else {
      // 10% — Sunbeams reward (toward next plant mint)
      var sbBonus=3+Math.floor(Math.random()*5);
      if(window.earnHashes)window.earnHashes(sbBonus);
      rewardMsg='+'+sbBonus+' Sunbeams toward a new plant!';
    }
    _play('match');
    var parentInfo=_buildInfo(wildPlant.hash);
    var mateInfo=_buildInfo(matePlant.hash);
    var chimerMsg=offGen>1?' Gen '+offGen+' chimera — 2× climate immunity, -'+(offGen-1)*2+' EA':'';
    _toast('\ud83c\udf31 Cross-pollinated!\n'+parentInfo.nm+' × '+mateInfo.nm+'\nSeed → Nursery.'+chimerMsg+'\n'+rewardMsg);
    if(window.PW_grantXP)PW_grantXP(5,'cross_pollinate');
    if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
  }

  // Use SHA-256 Mendelian hash via FG_Data
  if(window.FG_Data&&FG_Data.crossPollinateHashes){
    FG_Data.crossPollinateHashes(wildPlant.hash,matePlant.hash).then(function(result){
      var offHash=result.childHash;
      // Compute generation BEFORE addSeed so seed stores correct value
      var _wpGen=1,_mpGen=1;
      var _bcGh3=[];try{_bcGh3=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){}
      var _bcDirty3=false;
      _bcGh3.forEach(function(p){
        if(p.hash===wildPlant.hash){_wpGen=p.generation||1;p.breedCount=(p.breedCount||0)+1;_bcDirty3=true;}
        if(p.hash===matePlant.hash){_mpGen=p.generation||1;p.breedCount=(p.breedCount||0)+1;_bcDirty3=true;}
      });
      var offGen=Math.max(_wpGen,_mpGen)+1;
      if(window.FG_Data&&FG_Data.addSeed){
        var addResult=FG_Data.addSeed({seedHash:offHash,parentAHash:wildPlant.hash,parentBHash:matePlant.hash,nonce:offGen});
        if(!addResult.ok){_toast('Nursery full. Bloom or abandon a seed first.');return;}
      }
      if(_bcDirty3&&window.saveGreenhouse)saveGreenhouse(_bcGh3);
      if(window.renderNursery)renderNursery();
      // Event log: record the cross-pollinate for Root Report / lineage trace
      if(window.LW_Log){
        window.LW_Log.write('cross_pollinate',{
          parentA:wildPlant.hash,
          parentB:matePlant.hash,
          child:offHash,
          gen:offGen,
          context:'wild'
        });
      }
      _cpReward(offGen);
    });
  } else {
    _toast('Breeding engine loading... trying again.');
    setTimeout(function(){if(window.FG_Data&&FG_Data.crossPollinateHashes)window._doCrossPollination(wildPlant,matePlant);else _toast('Breeding engine not available.');},1500);
  }
}
window._doCrossPollination=_doCrossPollination;

// ═══ POUCH DELIVERY — DISABLED (backpack system handles delivery) ═══
function _deliverPouch(){return;}

// ═══ POUCH RENDERING — DISABLED (backpack renders its own UI) ═══
function _renderPouch(){if(window.FG_Backpack)FG_Backpack.render();}

// ═══ PICKER — drop from greenhouse to wild ═══
function openPicker(){
  if(_speedKmh>25){_toast('\ud83c\udf3f Slow down to plant! Moving too fast.');return;}
  if(!_uLat){_toast('Getting location...');return;}
  var rem=MAX_DROPS-_drops;
  if(rem<=0){_toast('All 3 drops used today!');return;}
  var gh=_getGH();
  if(!gh.length){_toast('No plants! Play the Grove game first.');return;}
  // Reset picker to drop mode
  var title=document.getElementById('wpk-title');
  if(title){title.textContent='DROP A SPECIMEN';title.style.color='var(--sage)';}
  document.getElementById('wpk-lim').textContent=rem+' remaining';
  var gr=document.getElementById('wpk-grid');gr.innerHTML='';
  for(var i=0;i<gh.length;i++){(function(pl){
    var c=document.createElement('div');
    c.className='dpk2-card';
    var sv='';try{if(window._generatePlantSVG)sv=window._generatePlantSVG(pl.hash,40);}catch(e){}
    if(!sv)sv='<div style="width:40px;height:48px;background:rgba(122,179,86,0.15);border-radius:8px;"></div>';
    var info=_buildInfo(pl.hash);
    var gc=GC[info.grade]||'#8a9a7a';
    c.innerHTML='<div class="dpk2-card-svg">'+sv+'</div><div class="dpk2-card-name">'+info.nm+'</div><div class="dpk2-card-grade" style="color:'+gc+';">'+info.grade.toUpperCase()+'</div>';
    c.onclick=function(e){e.stopPropagation();_drop(pl);};
    gr.appendChild(c);
  })(gh[i]);}
  document.getElementById('w-picker').classList.add('open');
}
function closePicker(){var pk=document.getElementById('w-picker');if(pk)pk.classList.remove('open');}

function _drop(pl){
  closePicker();
  if(!_uLat||!_uLng){_toast('No location.');return;}
  if((MAX_DROPS-_drops)<=0)return;
  var wild=_getWild();
  var myUid='';try{var _cu=window.firebase&&firebase.auth()&&firebase.auth().currentUser;if(_cu)myUid=_cu.uid;}catch(e){}
  var la=_uLat+(Math.random()-0.5)*0.0005,lo=_uLng+(Math.random()-0.5)*0.0005;
  var zone=_zoneKey(la,lo);

  // Wild v3 balance: per-km self-cap BEFORE zone check
  var _selfCount=_checkSelfRadius(la,lo);
  if(_selfCount){_toast('\ud83c\udf3f Too close to your other plants ('+_selfCount+' within 700m). Walk further to plant.');return;}

  // Combined occupancy: local wild + shared remote markers in this zone
  var inZone=_allPlantsInZone(zone);
  // Already have your own plant in this zone? Refuse (one self per zone).
  for(var io=0;io<inZone.length;io++){
    var iz=inZone[io];
    var mine=(iz.own===true)||(myUid&&iz.ownerUid===myUid);
    if(mine){_toast('You already have a plant in this zone.');return;}
  }
  var displaced=null;
  if(inZone.length>=MAX_PER_ZONE){
    // DICE-ROLL TAKEOVER — 2d6 + companion bonus on each side
    var myInfo=_buildInfo(pl.hash);
    var myEA=window.computeEA?window.computeEA(myInfo.t,0):0;
    var w=_weakestInZone(inZone);
    var _att={hash:pl.hash,ea:myEA};
    var _def={hash:w.plant.hash,ea:w.ea};
    var _roll=_rollTakeover(_att,_def);
    if(!_roll.attackerWins){
      _toast('Zone full (3 plants). \ud83c\udfb2 '+_formatRollToast(_roll));
      return;
    }
    displaced={ownerUid:w.plant.ownerUid,hash:w.plant.hash,grade:w.plant.grade||'Common',name:w.plant.name||'Plant'};
    _toast('\ud83c\udfb2 '+_formatRollToast(_roll));
  }

  // Wild v3 Phase 1: harvest is dead, so there's no defender game to pick.
  // Skip the picker and finish the drop directly. The defenderGame field
  // is still written for Firestore backward compat but is meaningless now.
  _pendingDrop={plant:pl,lat:la,lng:lo,wild:wild,displaced:displaced};
  _finishDrop('none');
}

var _pendingDrop=null;

function _showDefenderPicker(){
  var modal=document.getElementById('fc-modal');
  if(!modal)return _finishDrop('set'); // fallback
  var board=document.getElementById('fc-board');
  var title=document.getElementById('fc-title');
  var sub=document.getElementById('fc-subtitle');
  var timerWrap=document.getElementById('fc-timer-wrap');
  var timerText=document.getElementById('fc-timer-text');
  if(timerWrap)timerWrap.style.display='none';
  if(timerText)timerText.style.display='none';
  if(title)title.textContent='CHOOSE YOUR DEFENSE';
  if(sub)sub.textContent='Pick the challenge that protects your plant';

  var games=[
    {id:'set',name:'Quick Trios',img:'assets/games/cards/card-front.png',desc:'Find 3 matching cards',diff:'Easy'},
    {id:'memory',name:'Memory',img:'assets/games/memory/00-card-back.png',desc:'Remember the pattern',diff:'Medium'},
    {id:'growth',name:'Growth',img:'assets/games/flood/leaf-gold.png',desc:'Order the stages',diff:'Medium'},
    {id:'color',name:'Color',img:'assets/games/simon/spring-btn.png',desc:'Match the target hue',diff:'Easy'},
    {id:'math',name:'Math',img:'assets/games/flood/grid.png',desc:'Solve the equation',diff:'Hard'},
    {id:'word',name:'Word',img:'assets/games/memory/01-moonflower.png',desc:'Unscramble letters',diff:'Hard'},
    {id:'chess',name:'Chess',img:'assets/chess-defense-64.png',desc:'Find the checkmate',diff:'Hard'},
    {id:'sliding',name:'Slide',img:'assets/slide-puzzle-64.png',desc:'Arrange the tiles',diff:'Medium'}
  ];

  var h='<div style="font-family:DM Mono,monospace;font-size:0.6rem;color:var(--muted);text-align:center;margin-bottom:10px;">Harder games are tougher for harvesters to beat</div>';
  for(var i=0;i<games.length;i++){
    var g=games[i];
    var dc=g.diff==='Easy'?'var(--sage)':g.diff==='Medium'?'var(--gold)':'#c07070';
    h+='<div class="fc-card" onclick="FG_Wild._pickDefense(\''+g.id+'\')" style="flex-direction:column;gap:6px;padding:10px 8px;min-height:90px;">';
    h+='<img src="'+g.img+'" alt="'+g.name+'" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid rgba(122,179,86,0.15);">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--cream);letter-spacing:0.06em;">'+g.name+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.45rem;color:'+dc+';letter-spacing:0.06em;margin-top:auto;">'+g.diff+'</div>';
    h+='</div>';
  }
  if(board)board.innerHTML=h;
  if(board)board.style.gridTemplateColumns='repeat(3,1fr)';
  modal.classList.add('open');
}

var _pickingDefense=false;
function _pickDefense(gameId){
  if(_pickingDefense)return;
  _pickingDefense=true;
  var modal=document.getElementById('fc-modal');
  if(modal)modal.classList.remove('open');
  // Reset modal for future challenge use
  var timerWrap=document.getElementById('fc-timer-wrap');
  var timerText=document.getElementById('fc-timer-text');
  if(timerWrap)timerWrap.style.display='block';
  if(timerText)timerText.style.display='block';
  var board=document.getElementById('fc-board');
  if(board)board.style.gridTemplateColumns='repeat(3,1fr)';
  _finishDrop(gameId);
  setTimeout(function(){_pickingDefense=false;},500);
}

function _finishDrop(defenderGame){
  if(!_pendingDrop)return;
  var pd=_pendingDrop;_pendingDrop=null;
  var pl=pd.plant,la=pd.lat,lo=pd.lng,wild=pd.wild;

  _drops++;_saveState();_afRecordDrop();
  var gh=_getGH().filter(function(g){return g.hash!==pl.hash;});_saveGH(gh);

  // Compute EA at drop time
  var dropTraits=null;try{dropTraits=window.hashToTraits(pl.hash);}catch(e){}
  var dropEA=window.computeEA?window.computeEA(dropTraits,0):0;

  var _dropUid='';try{var _du=window.firebase&&firebase.auth()&&firebase.auth().currentUser;if(_du)_dropUid=_du.uid;}catch(e){}
  // Wild v3 vitality: compute rarity-scaled lifespan + initial decayAt.
  var _dropRarity='Common';try{if(dropTraits&&window.getTerraGrade){var _dtg=window.getTerraGrade(dropTraits);_dropRarity=(_dtg&&(_dtg.name||_dtg.label))||'Common';}}catch(e){}
  var _dropLifeMs=_lifespanMsFor(_dropRarity);
  var _nowMs=Date.now();
  wild.push({
    lat:la,lng:lo,hash:pl.hash,
    date:new Date().toISOString(),
    own:true,
    ownerUid:_dropUid,
    ownerName:localStorage.getItem('pw_keeper_name')||'Keeper',
    ea:dropEA,
    defenderGame:defenderGame||'set',
    season:dropTraits?dropTraits.season:0,
    rarity:_dropRarity,
    droppedAt:_nowMs,
    lifespanMs:_dropLifeMs,
    decayAt:_nowMs+_dropLifeMs,
    strangerTendAddMs:0,
    lastWateredAt:0
  });
  _saveWild(wild);
  _addPlant({lat:la,lng:lo,hash:pl.hash,own:true,days:0,pollen:0,status:'Just Planted',defenderGame:defenderGame||'set'});
  if(_map)_map.panTo([la,lo],{animate:true,duration:0.5});
  _updateCounts();_updateUI();_drawTerritory();
  if(window.renderGreenhouse)renderGreenhouse();
  try{navigator.vibrate&&navigator.vibrate([30,55,30]);}catch(e){} // sync pulse — planted!
  _toast('\ud83c\udf31 Planted with '+defenderGame.toUpperCase()+' defense (EA: '+dropEA+')');
  // Drop burst animation at map coordinates
  setTimeout(function(){
    if(!_map)return;
    var pt=_map.latLngToContainerPoint([la,lo]);
    var cx=pt.x,cy=pt.y;
    var mapEl=document.getElementById('wild-map');
    if(!mapEl)return;
    var rect=mapEl.getBoundingClientRect();
    cx+=rect.left;cy+=rect.top;
    for(var _di=0;_di<12;_di++){(function(i){
      var angle=(i/12)*Math.PI*2;
      var dist=25+Math.random()*30;
      var dx=Math.cos(angle)*dist;var dy=Math.sin(angle)*dist;
      var leaf=document.createElement('div');
      leaf.innerHTML='\ud83c\udf3f';
      leaf.style.cssText='position:fixed;left:'+cx+'px;top:'+cy+'px;pointer-events:none;z-index:99999;font-size:0.6rem;opacity:0;animation:sparkBurst 1s ease forwards;animation-delay:'+(i*30)+'ms;--sdx:'+dx+'px;--sdy:'+dy+'px;';
      document.body.appendChild(leaf);
      setTimeout(function(){if(leaf.parentNode)leaf.remove();},1200);
    })(_di);}
  },600);
  // First drop milestone
  var _eh=document.getElementById('w-empty-hint');if(_eh)_eh.remove();
  if(!localStorage.getItem('lw_first_drop')){
    localStorage.setItem('lw_first_drop','1');
    setTimeout(function(){
      _toast('\ud83c\udf1f First plant in the Wild! Walk around — ferals will spawn near breeding pairs.');
    },2500);
  }
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
  _writeSharedDrop(la,lo,pl.hash,dropEA,defenderGame,dropTraits,pd.displaced);
  // Event log: record the wild drop for Root Report / memorial / achievements
  if(window.LW_Log){
    window.LW_Log.write('wild_drop',{
      hash:pl.hash,
      lat:la,
      lng:lo,
      zone:_zoneKey(la,lo),
      ea:dropEA,
      defenderGame:defenderGame||'set',
      displaced:pd.displaced?pd.displaced.hash:null
    });
  }
}

// ═══ STATE ═══
function _loadState(){
  var td=_afGetToday(); // server-aligned day
  try{var raw=window._secureGet?window._secureGet('fg_w_d'):localStorage.getItem('fg_w_d');var d=JSON.parse(raw||'{}');_drops=(d.d===td)?(d.c||0):0;}catch(e){_drops=0;}
  try{_pouch=JSON.parse(localStorage.getItem('fg_pouch')||'[]');}catch(e){_pouch=[];}
  // Midnight reset: clear stale feral breed date
  var storedBreedDate='';
  try{storedBreedDate=localStorage.getItem('fg_feral_breed_date')||'';}catch(e){}
  if(storedBreedDate!==td){
    localStorage.removeItem('fg_feral_breed_date');
  }
}
function _saveState(){var val=JSON.stringify({d:_afGetToday(),c:_drops});if(window._secureSet){window._secureSet('fg_w_d',val);}else{localStorage.setItem('fg_w_d',val);}}
function _savePouch(){localStorage.setItem('fg_pouch',JSON.stringify(_pouch));}

// ═══ UI ═══
function _updateUI(){
  var rem=Math.max(0,MAX_DROPS-_drops);
  var b=document.getElementById('dbb');if(b){b.textContent=rem;b.classList.toggle('lo',rem<=1);}
  var f=document.getElementById('dfb');if(f)f.style.opacity=rem<=0?'0.4':'1';
  var dl=document.getElementById('w-drops-left');if(dl){dl.textContent=rem;dl.style.color=rem<=0?'var(--muted)':rem<=1?'var(--gold)':'var(--cream)';}
  // Empty state nudge for first-time players
  var nudge=document.getElementById('w-empty-nudge');
  var wild=_getWild();
  if(wild.length===0&&_drops===0){
    if(!nudge){
      nudge=document.createElement('div');nudge.id='w-empty-nudge';
      nudge.style.cssText='position:fixed;bottom:calc(90px + env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);z-index:9990;text-align:center;pointer-events:none;animation:panelFadeIn 0.5s ease;';
      nudge.innerHTML='<div style="background:rgba(13,16,12,0.92);border:1.5px solid rgba(122,179,86,0.2);border-radius:14px;padding:14px 22px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);max-width:280px;">'
        +'<div style="font-family:Playfair Display,serif;font-size:0.8rem;color:var(--cream);margin-bottom:6px;">Plant your first specimen</div>'
        +'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);line-height:1.5;">Tap the \ud83c\udf31 button to drop a plant from your greenhouse onto the real-world map. Other players can see it!</div>'
        +'<div style="font-family:DM Mono,monospace;font-size:0.45rem;color:var(--sage);margin-top:8px;">'+rem+' drops remaining today</div>'
        +'</div>';
      var mapWrap=document.getElementById('wild-tab');
      if(mapWrap)mapWrap.appendChild(nudge);
    }
  } else if(nudge){nudge.remove();}
}
function _getPollen(){try{var j=window._secureGet?window._secureGet('fg_pollen'):localStorage.getItem('fg_pollen');return parseInt(j||'0');}catch(e){return 0;}}
function _savePollen(v){if(window._secureSet){window._secureSet('fg_pollen',String(v));}else{localStorage.setItem('fg_pollen',String(v));}}
function _updateCounts(){
  var w=_getWild();
  var c=document.getElementById('w-count');if(c)c.textContent=w.length;
  var now=Date.now();
  // Offline catch-up: compute Dew earned since last tick and credit via earnDew.
  // The per-minute setInterval handles live ticking; this path catches up time
  // the player spent on other tabs or offline, capped at 12 hours so idle
  // weeks don't print a fortune on re-entry.
  var lastTick=0;try{lastTick=parseInt(localStorage.getItem('fg_dew_tick')||localStorage.getItem('fg_pollen_tick')||'0');}catch(e){}
  if(lastTick>0&&w.length>0){
    var elapsedMin=Math.floor((now-lastTick)/60000);
    if(elapsedMin>720)elapsedMin=720;
    if(elapsedMin>0){
      var pollenRates={Common:1,Uncommon:2,Rare:4,Epic:6,Legendary:9,Mythic:12,Cosmic:15};
      // Match live ticker: /240 scale + diminishing returns past 5 plants
      var sortedRates=[];
      for(var i=0;i<w.length;i++){
        var grade='Common';
        try{if(window.hashToTraits&&window.getTerraGrade&&w[i].hash){
          var tr=window.hashToTraits(w[i].hash);grade=window.getTerraGrade(tr).label||'Common';
        }}catch(e){}
        sortedRates.push(pollenRates[grade]||1);
      }
      sortedRates.sort(function(a,b){return b-a;});
      var hourlyTotal=0;
      for(var ri=0;ri<sortedRates.length;ri++){
        var mult=ri<5?1.0:0.5;
        hourlyTotal+=sortedRates[ri]*mult;
      }
      // Weather: Dawn Mist doubles earnings (match live ticker)
      try{if(window.isWeatherMist&&window.isWeatherMist())hourlyTotal*=2;}catch(e){}
      var earned=Math.floor(hourlyTotal*elapsedMin/240);
      if(earned>0&&typeof window.earnDew==='function')window.earnDew(earned,'wild_offline_catchup');
    }
  }
  localStorage.setItem('fg_dew_tick',String(now));
  // w-pollen shows Keeper XP (Pollen = XP rework); fg_pollen is dead
  var p=document.getElementById('w-pollen');
  if(p){try{p.textContent=parseInt(localStorage.getItem('pw_xp')||'0');}catch(e){}}
  // Update Dew balance display (real Dew ledger, not the hash ledger)
  try{
    var dewBal=typeof window.getTotalDew==='function'?window.getTotalDew():0;
    var dEl=document.getElementById('w-dew');if(dEl)dEl.textContent=dewBal;
  }catch(e){}
}
function toggleMenu(){}
function useFC(){}
// ═══ PENDING REWARDS — check for harvest/takeover notifications ═══
function _checkPendingRewards(){
  try{
    var user=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(!user||!user.uid||!window.db)return;
    var rewardsRef=window.db.collection('vaults').doc(user.uid).collection('pendingRewards')
      .orderBy('timestamp','desc').limit(10);
    rewardsRef.get().then(function(snap){
      if(snap.empty)return;
      var msgs=[];var totalDew=0;
      snap.forEach(function(doc){
        var r=doc.data();
        if(r.type==='harvest_reward'){
          msgs.push(r.plantName+' was harvested! +'+r.amount+' Dew');
          totalDew+=r.amount;
        } else if(r.type==='takeover_reward'){
          msgs.push(r.plantName+' was displaced! +'+r.amount+' Dew');
          totalDew+=r.amount;
        }
        doc.ref.delete().catch(function(){});
      });
      if(totalDew>0){
        // Credit Dew to the real Dew ledger (not the hash ledger — that mints plants)
        try{
          if(typeof earnDew==='function'){
            earnDew(totalDew,'wild_pending_reward');
          } else {
            var raw=window._secureGet?window._secureGet('sws_dew_ledger'):localStorage.getItem('sws_dew_ledger');
            var ledger=JSON.parse(raw||'{}');
            ledger.earned=(ledger.earned||0)+totalDew;
            var val=JSON.stringify(ledger);
            if(window._secureSet)window._secureSet('sws_dew_ledger',val);
            else localStorage.setItem('sws_dew_ledger',val);
          }
        }catch(e){}
        _updateCounts();
      }
      if(msgs.length>0){
        // Show notification overlay
        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99998;background:rgba(13,16,12,0.95);border-bottom:1.5px solid var(--gold);padding:16px;font-family:DM Mono,monospace;backdrop-filter:blur(8px);animation:panelFadeIn 0.35s ease;cursor:pointer;';
        var h='<div style="max-width:500px;margin:0 auto;">';
        h+='<div style="color:var(--gold);font-size:0.75rem;font-weight:700;letter-spacing:0.06em;margin-bottom:8px;">WILD ACTIVITY</div>';
        for(var i=0;i<msgs.length;i++){
          h+='<div style="color:var(--cream);font-size:0.6rem;line-height:1.6;opacity:0.9;">'+msgs[i]+'</div>';
        }
        h+='<div style="color:var(--sage);font-size:0.5rem;margin-top:8px;">+'+totalDew+' Dew credited</div>';
        h+='</div>';
        ov.innerHTML=h;
        ov.onclick=function(){ov.style.opacity='0';ov.style.transition='opacity 0.25s';setTimeout(function(){if(ov.parentNode)ov.remove();},300);};
        document.body.appendChild(ov);
        setTimeout(function(){if(ov.parentNode){ov.style.opacity='0';ov.style.transition='opacity 0.25s';setTimeout(function(){if(ov.parentNode)ov.remove();},300);}},6000);
      }
    }).catch(function(e){if(window._swsLog)_swsLog('Pending rewards err: '+e.message,'warn');});
  }catch(e){}
}
function _toast(m){var e=document.getElementById('w-toast');if(!e)return;e.textContent=m;e.style.opacity='1';e.style.transform='translate(-50%,-50%) scale(1)';clearTimeout(_tt);_tt=setTimeout(function(){e.style.opacity='0';e.style.transform='translate(-50%,-50%) scale(0.95)';},3500);}

var _wd=45;setInterval(function(){_wd=(_wd+(Math.random()>0.5?12:-8)+360)%360;var w=document.getElementById('w-wind');if(w){var ds=['N','NE','E','SE','S','SW','W','NW'];w.textContent=ds[Math.round(_wd/45)%8]+' '+(5+Math.round(Math.random()*10))+'mph';}},8000);
// Cache grade lookups so we don't call hashToTraits every 60s
var _wildGradeCache={};
function _getWildGrade(hash){
  if(_wildGradeCache[hash])return _wildGradeCache[hash];
  var grade='Common';
  try{if(window.hashToTraits&&window.getTerraGrade&&hash){
    var tr=window.hashToTraits(hash);grade=window.getTerraGrade(tr).label||'Common';
  }}catch(e){}
  _wildGradeCache[hash]=grade;
  return grade;
}
setInterval(function(){var w=_getWild();if(w.length>0){
  // ECON BALANCE: Dew rate runs at 1/4 nominal to keep the economy
  // from running away. Rate table stays readable; the /240 divisor
  // means a Common earns 1 Dew every 4 hours, a Cosmic every 16 min.
  // Diminishing returns past 5 plants — additional plants contribute
  // at half rate. Prevents whale armies from printing Dew.
  var dewRates={Common:1,Uncommon:2,Rare:4,Epic:6,Legendary:9,Mythic:12,Cosmic:15};
  var sortedRates=[];
  for(var si=0;si<w.length;si++)sortedRates.push(dewRates[_getWildGrade(w[si].hash)]||1);
  sortedRates.sort(function(a,b){return b-a;});
  var hourlyTotal=0;
  for(var i=0;i<sortedRates.length;i++){
    var mult=i<5?1.0:0.5;
    hourlyTotal+=sortedRates[i]*mult;
  }
  var remainder=0;try{remainder=parseFloat(localStorage.getItem('fg_dew_rem')||localStorage.getItem('fg_pollen_rem')||'0');}catch(e){}
  var minuteEarned=hourlyTotal/240+remainder;
  var wholeEarned=Math.floor(minuteEarned);
  localStorage.setItem('fg_dew_rem',String(minuteEarned-wholeEarned));
  if(wholeEarned>0){
    // Route to the real Dew ledger in app.js. Also grants matching XP.
    if(typeof window.earnDew==='function')window.earnDew(wholeEarned,'wild_tick');
    // Update the wild tab's visible counters.
    // w-dew = real Dew balance, w-pollen = Keeper XP (Pollen = XP rework).
    var wd=document.getElementById('w-dew');
    if(wd&&typeof window.getTotalDew==='function')wd.textContent=window.getTotalDew();
    var p=document.getElementById('w-pollen');
    if(p){try{p.textContent=parseInt(localStorage.getItem('pw_xp')||'0');}catch(e){}}
  }
  localStorage.setItem('fg_dew_tick',String(Date.now()));
}},60000);

// ═══ DROP FROM BACKPACK — place a plant from BP onto the map ═══
function _dropFromBP(p){
  if(_pendingDrop){_toast('Drop in progress…');return;}
  if(_speedKmh>25){_toast('\ud83c\udf3f Slow down to plant! Moving too fast.');return;}
  if(!_uLat||!_uLng){_toast('Need GPS location to drop.');return;}
  if(typeof gtag!=='undefined') gtag('event','wild_plant_drop',{lat:_uLat.toFixed(3),lng:_uLng.toFixed(3)});
  var wild=_getWild();
  var myUid='';try{var _cu=window.firebase&&firebase.auth()&&firebase.auth().currentUser;if(_cu)myUid=_cu.uid;}catch(e){}
  var la=_uLat+(Math.random()-0.5)*0.0005,lo=_uLng+(Math.random()-0.5)*0.0005;
  var zone=_zoneKey(la,lo);
  // Wild v3 balance: per-km self-cap BEFORE zone check
  var _selfCount=_checkSelfRadius(la,lo);
  if(_selfCount){_toast('\ud83c\udf3f Too close to your other plants ('+_selfCount+' within 700m). Walk further to plant.');return;}
  // 3-per-zone cap with weakest-eviction (combined local + shared markers)
  var inZone=_allPlantsInZone(zone);
  for(var io=0;io<inZone.length;io++){
    var iz=inZone[io];
    var mine=(iz.own===true)||(myUid&&iz.ownerUid===myUid);
    if(mine){_toast('You already have a plant in this zone.');return;}
  }
  var displaced=null;
  if(inZone.length>=MAX_PER_ZONE){
    // DICE-ROLL TAKEOVER — 2d6 + companion bonus on each side
    var myInfo=_buildInfo(p.hash);
    var myEA=window.computeEA?window.computeEA(myInfo.t,0):0;
    var w=_weakestInZone(inZone);
    var _att={hash:p.hash,ea:myEA};
    var _def={hash:w.plant.hash,ea:w.ea};
    var _roll=_rollTakeover(_att,_def);
    if(!_roll.attackerWins){
      _toast('Zone full (3 plants). \ud83c\udfb2 '+_formatRollToast(_roll));return;
    }
    displaced={ownerUid:w.plant.ownerUid,hash:w.plant.hash,grade:w.plant.grade||'Common',name:w.plant.name||'Plant'};
    _toast('\ud83c\udfb2 '+_formatRollToast(_roll));
  }

  // Wild v3 Phase 1: skip defender picker (harvest removed), finish drop now.
  _pendingDrop={plant:p,lat:la,lng:lo,wild:wild,displaced:displaced,fromBP:true};
  _finishDrop('none');
}
// ═══ SHARED WILD DROPS — visible to all players ═══
function _writeSharedDrop(lat,lng,hash,ea,defGame,traits,displaced){
  try{
    var user=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(!user||!user.uid||!window.db)return;
    var grade='Common';
    try{if(traits&&window.getTerraGrade){var _tg=window.getTerraGrade(traits);grade=(_tg.name||_tg.label||'Common');}}catch(e){}
    var _nowMs=Date.now();
    var _lifeMs=_lifespanMsFor(grade);
    var newDropData={
      lat:lat,lng:lng,hash:hash,ownerUid:user.uid,
      ownerName:localStorage.getItem('pw_keeper_name')||'Keeper',
      ea:ea||0,defenderGame:defGame||'set',
      season:(traits&&traits.season)||0,status:'alive',
      grade:grade,
      rarity:grade,
      zone:_zoneKey(lat,lng),
      droppedAt:new Date(_nowMs).toISOString(),
      droppedAtMs:_nowMs,
      lifespanMs:_lifeMs,
      decayAtMs:_nowMs+_lifeMs,
      strangerTendAddMs:0
    };
    var newDocId=user.uid+'_'+hash.slice(0,16);

    if(displaced&&displaced.ownerUid&&displaced.hash){
      // ── TAKEOVER: atomic transaction ──
      // Delete displaced plant, create new drop, reward displaced planter
      var oldDocId=displaced.ownerUid+'_'+displaced.hash.slice(0,16);
      var oldRef=window.db.collection('wildDrops').doc(oldDocId);
      var newRef=window.db.collection('wildDrops').doc(newDocId);
      var dewReward={Common:3,Uncommon:5,Rare:8,Epic:12,Legendary:18,Mythic:25,Cosmic:40};
      var reward=dewReward[displaced.grade||'Common']||3;

      window.db.runTransaction(function(tx){
        return tx.get(oldRef).then(function(doc){
          if(doc.exists){
            // Re-verify EA server-side: the displaced plant still exists
            var serverEA=doc.data().ea||0;
            if(ea<=serverEA){throw new Error('EA_DEFENDED');}
            tx.delete(oldRef);
            // Reward displaced planter
            if(displaced.ownerUid!==user.uid){
              var rewardRef=window.db.collection('vaults').doc(displaced.ownerUid).collection('pendingRewards').doc();
              tx.set(rewardRef,{
                type:'takeover_reward',amount:reward,grade:displaced.grade||'Common',
                plantName:displaced.name||'Plant',harvesterUid:user.uid,
                timestamp:firebase.firestore.FieldValue.serverTimestamp()
              });
            }
          }
          // Place new plant regardless (zone might be empty now)
          tx.set(newRef,newDropData);
        });
      }).then(function(){
        if(window._swsLog)_swsLog('Takeover TX OK — displaced '+oldDocId,'ok');
      }).catch(function(e){
        if(e.message==='EA_DEFENDED'){
          _toast('Takeover failed — their plant grew stronger since you checked!');
          if(window._swsLog)_swsLog('Takeover EA check failed server-side','warn');
        } else {
          if(window._swsLog)_swsLog('Takeover TX err: '+e.message,'err');
          // Fallback: just write the new drop (old one may already be gone)
          window.db.collection('wildDrops').doc(newDocId).set(newDropData).catch(function(){});
        }
      });
    } else {
      // No takeover — simple write
      window.db.collection('wildDrops').doc(newDocId).set(newDropData)
        .catch(function(e){if(window._swsLog)_swsLog('Shared drop err: '+e.message,'err');});
    }
  }catch(e){}
}
// ═══ REAL-TIME SHARED DROPS — live onSnapshot listener ═══

// Compute zone keys visible on current map bounds (capped at 9 for Firestore 'in' query)
function _getVisibleZones(){
  if(!_map)return[];
  // 5x5 grid = 25 zones but Firestore 'in' caps at 10, so use map bounds to pick best 10
  var cLat=_uLat||_map.getCenter().lat;
  var cLng=_uLng||_map.getCenter().lng;
  var zones=[];
  var seen={};
  for(var dLat=-2;dLat<=2;dLat++){
    for(var dLng=-2;dLng<=2;dLng++){
      var zLat=Math.round(cLat/ZONE_SIZE)*ZONE_SIZE+dLat*ZONE_SIZE;
      var zLng=Math.round(cLng/ZONE_SIZE)*ZONE_SIZE+dLng*ZONE_SIZE;
      var k=zLat.toFixed(4)+','+zLng.toFixed(4);
      if(!seen[k]){seen[k]=true;zones.push(k);}
    }
  }
  // Firestore 'in' max is 10 — take closest to center
  if(zones.length>10){
    zones.sort(function(a,b){
      var pa=a.split(','),pb=b.split(',');
      var da=Math.abs(parseFloat(pa[0])-cLat)+Math.abs(parseFloat(pa[1])-cLng);
      var db=Math.abs(parseFloat(pb[0])-cLat)+Math.abs(parseFloat(pb[1])-cLng);
      return da-db;
    });
    zones=zones.slice(0,10);
  }
  return zones;
}

// Debounced re-subscribe when map pans/zooms
function _scheduleResubscribe(){
  if(_snapDebounce)clearTimeout(_snapDebounce);
  _snapDebounce=setTimeout(function(){
    _snapDebounce=null;
    var newZones=_getVisibleZones().sort().join('|');
    if(newZones!==_snapZones)_subscribeSharedDrops();
  },800);
}

// Main subscription — real-time listener for shared drops
function _subscribeSharedDrops(){
  var user=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
  if(!user||!window.db||!_map){
    // No auth/Firestore — seed demo plants so player can still experience Wild
    setTimeout(function(){_seedDemoPlants();},2000);
    return;
  }

  var zones=_getVisibleZones();
  if(zones.length===0)return;
  var zoneKey=zones.sort().join('|');
  if(zoneKey===_snapZones)return; // already watching these zones

  // Unsubscribe previous listener
  if(_snapUnsub){_snapUnsub();_snapUnsub=null;}
  _snapZones=zoneKey;

  if(window._swsLog)_swsLog('Subscribing to '+zones.length+' zones (live)','ok');

  try{
    _snapUnsub=window.db.collection('wildDrops')
      .where('zone','in',zones)
      .where('status','==','alive')
      .onSnapshot(function(snap){
        var seenHashes={};
        var now=Date.now();
        var _sharedCount=Object.keys(_sharedMarkers).length;
        snap.forEach(function(doc){
          var d=doc.data();if(!d.lat||!d.lng||!d.hash)return;
          // Skip drops older than 14 days (stale Firestore data)
          if(d.droppedAt){var age=now-new Date(d.droppedAt).getTime();if(age>WILD_MAX_AGE_DAYS*86400000)return;}
          seenHashes[d.hash]=true;

          // Skip if we already have this marker
          if(_sharedMarkers[d.hash])return;
          // Cap total shared markers to prevent map lag. Raised from 30
          // to 80 because wild-born births were silently dropped once a
          // keeper's cluster + neighbors filled the earlier cap —
          // reproduction ran but new plants never rendered. 80 still
          // keeps perf in bounds on low-end devices.
          if(_sharedCount>=80)return;
          _sharedCount++;

          var isOwn=(d.ownerUid===user.uid);
          // Skip if in local wild (own plants already rendered by _loadAll)
          var localWild=_getWild();
          if(localWild.some(function(w){return w.hash===d.hash;}))return;

          var pd={lat:d.lat,lng:d.lng,hash:d.hash,own:isOwn,
            days:Math.floor((Date.now()-new Date(d.droppedAt||Date.now()).getTime())/86400000),
            pollen:0,status:isOwn?'Your Plant':'Wild',
            ownerName:d.ownerName||'Keeper',ownerUid:d.ownerUid,
            ea:d.ea||0,defenderGame:d.defenderGame||'set',season:d.season||0,grade:d.grade||'Common'};

          var mk=_addSharedMarker(pd);
          _sharedMarkers[d.hash]={marker:mk,data:pd};
        });

        // Remove markers for plants that disappeared (harvested by another player)
        var hashes=Object.keys(_sharedMarkers);
        for(var i=0;i<hashes.length;i++){
          if(!seenHashes[hashes[i]]){
            var entry=_sharedMarkers[hashes[i]];
            if(entry&&entry.marker&&_map)_map.removeLayer(entry.marker);
            delete _sharedMarkers[hashes[i]];
          }
        }
        // Always run distance fallback as supplement — catches plants outside zone grid
        _loadSharedDropsFallback(user);
        // If still nothing after fallback, seed demo plants so player can experience harvest
        if(Object.keys(seenHashes).length===0){
          setTimeout(function(){if(Object.keys(_sharedMarkers).length===0)_seedDemoPlants();},3000);
        }
        // Re-check feral spawns now that shared markers are updated
        _feralRespawnDebounced();
      },function(e){
        if(window._swsLog)_swsLog('Snapshot err: '+(e.message||e)+' — using fallback','warn');
        _loadSharedDropsFallback(user);
        setTimeout(function(){if(Object.keys(_sharedMarkers).length===0)_seedDemoPlants();},3000);
      });
  }catch(e){if(window._swsLog)_swsLog('Subscribe err: '+e,'err');}
}

// Detach listener (called on tab switch away from wild)
function _unsubscribeSharedDrops(){
  if(_snapUnsub){_snapUnsub();_snapUnsub=null;}
  _snapZones=null;
}

// Add a single shared drop marker to the map (returns the Leaflet marker)
function _addSharedMarker(p){
  if(!_map)return null;
  // ── HEX MODE: skip individual markers — hex inspector handles display ──
  // Still store data in _sharedMarkers so hex inspector can read it.
  return null;
  var sz=p.own?40:26,svg='';
  if(p.own){
    // Own plants: show the actual procedural SVG
    if(window._generatePlantSVG&&p.hash){try{svg=window._generatePlantSVG(p.hash,sz);}catch(e){}}
  } else {
    // Non-owned: generic leaf icon — rarity is a mystery
    svg='<img src="assets/games/wild/wild-marker-common-v2.png" style="width:'+sz+'px;height:'+sz+'px;filter:drop-shadow(0 0 4px rgba(122,179,86,0.3));" alt="">';
  }
  if(!svg||svg.length<30){var fc=p.own?'#7ab356':'#5a7050';svg='<svg viewBox="0 0 30 40" width="'+sz+'" height="'+Math.round(sz*40/30)+'" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="30" width="14" height="10" rx="2" fill="#5a3a1f"/><line x1="15" y1="30" x2="15" y2="12" stroke="#3A5C2A" stroke-width="3" stroke-linecap="round"/><ellipse cx="8" cy="18" rx="7" ry="5" fill="'+fc+'" opacity="0.85" transform="rotate(-20 8 18)"/><ellipse cx="22" cy="15" rx="7" ry="5" fill="'+fc+'" opacity="0.8" transform="rotate(15 22 15)"/></svg>';}
  var info=_buildInfo(p.hash);
  var tagColor=p.own?info.gc:'var(--muted)';
  var seasonEmb='';if(p.own&&info.t&&window.getSeasonInfo){var si=window.getSeasonInfo(info.t);seasonEmb=' <span style="font-size:0.35rem;">'+si.emblem+'</span>';}
  // Non-owned plants: hide name, grade, season — mystery until harvest
  var tagName=p.own?info.nm:'Wild Plant';
  var tag='<div style="position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);font-family:Bebas Neue,sans-serif;font-size:0.35rem;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,1),0 0 6px rgba(0,0,0,0.8);color:'+tagColor+';pointer-events:none;">'+tagName+seasonEmb+'</div>';
  var th=Math.round(sz*40/30)+14;
  var glow=_glowRing(info.grade||p.grade,p.own);
  var shield=_shieldBadge(p);
  // Wilting visual — neglected plants desaturate + brown ring
  var wiltStyle2='';var wiltRing2='';
  var nd2=p.neglectDecay||0;var isWilt2=(nd2>0||p.status==='Wilting');
  if(isWilt2){
    wiltStyle2='filter:saturate(0.4) brightness(0.7);';
    wiltRing2='<div style="position:absolute;inset:-4px;border:2px solid rgba(139,90,43,0.6);border-radius:50%;pointer-events:none;z-index:0;"></div>';
    if(nd2>10)wiltStyle2+='opacity:0.5;';
  }
  var html='<div style="position:relative;width:'+(sz+6)+'px;height:'+th+'px;display:flex;align-items:flex-end;justify-content:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.7));">'
    +glow+shield+wiltRing2+'<div style="'+wiltStyle2+'">'+svg+'</div>'+tag+'</div>';
  var pd={lat:p.lat,lng:p.lng,hash:p.hash,own:p.own,name:info.nm,grade:info.grade||p.grade,gc:info.gc,days:p.days||0,pollen:p.pollen||0,status:p.status||'Growing',neglectDecay:nd2,traits:info.t,rarities:info.rarities,defenderGame:p.defenderGame||'set',ownerUid:p.ownerUid||'',ownerName:p.ownerName||'Keeper'};
  var mk=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:html,iconSize:[sz+6,th],iconAnchor:[(sz+6)/2,th-6]}),zIndexOffset:p.own?500:100}).addTo(_map).on('click',function(){showTP(pd,mk);});
  return mk;
}

// Broad fallback — loads all alive drops within range (no zone filter)
function _loadSharedDropsFallback(user){
  try{
    window.db.collection('wildDrops').where('status','==','alive').limit(50).get()
      .then(function(snap){
        var count=0;
        var now=Date.now();
        snap.forEach(function(doc){
          var d=doc.data();if(!d.lat||!d.lng||!d.hash)return;
          if(d.droppedAt){var age=now-new Date(d.droppedAt).getTime();if(age>WILD_MAX_AGE_DAYS*86400000)return;}
          // Skip distance filter if in GPS fallback mode — show all drops for testing/demo
          if(_uLat&&d.lat&&!_gpsDenied){var dist=_dist(_uLat,_uLng,d.lat,d.lng);if(dist>50000)return;}
          if(_sharedMarkers[d.hash])return;
          var isOwn=(d.ownerUid===user.uid);
          var pd={lat:d.lat,lng:d.lng,hash:d.hash,own:isOwn,
            days:Math.floor((Date.now()-new Date(d.droppedAt||Date.now()).getTime())/86400000),
            pollen:0,status:isOwn?'Your Plant':'Wild',
            ownerName:d.ownerName||'Keeper',ownerUid:d.ownerUid,
            ea:d.ea||0,defenderGame:d.defenderGame||'set',season:d.season||0,grade:d.grade||'Common'};
          var mk=_addSharedMarker(pd);
          _sharedMarkers[d.hash]={marker:mk,data:pd};
          count++;
        });
        if(window._swsLog)_swsLog('Fallback: loaded '+count+' nearby drops','ok');
      }).catch(function(e){if(window._swsLog)_swsLog('Fallback load err: '+e.message,'err');});
  }catch(e){}
}

// ═══ DEMO PLANTS — seed harvestable plants when nobody else is nearby ═══
function _seedDemoPlants(){
  if(!_map||!_uLat)return;
  // Only seed once per session
  if(_demoSeeded)return;
  // Don't seed if real shared plants exist
  if(Object.keys(_sharedMarkers).length>0)return;
  _demoSeeded=true;
  var demoNames=['Wild Sage','Forest Bloom','Dew Fern','Moss Heart','Thorn Ivy'];
  var demoGrades=['Common','Uncommon','Rare','Common','Uncommon'];
  var demoGames=['set','memory','color','math','word'];
  var count=3+Math.floor(Math.random()*3); // 3-5 plants
  for(var i=0;i<count;i++){
    // Scatter within ~40-70m of player (within COLLECT_RANGE)
    var angle=Math.random()*Math.PI*2;
    var dist=0.0003+Math.random()*0.0003; // ~30-60m in lat/lng
    var la=_uLat+Math.sin(angle)*dist;
    var lo=_uLng+Math.cos(angle)*dist;
    // Generate a deterministic demo hash
    var seed=Math.floor(Math.random()*0xFFFFFFFF).toString(16);
    var demoHash='';for(var j=0;j<8;j++)demoHash+=seed;demoHash=demoHash.slice(0,64);
    var pd={lat:la,lng:lo,hash:demoHash,own:false,
      days:Math.floor(Math.random()*10),pollen:0,
      status:'Wild',name:demoNames[i%demoNames.length],
      ownerName:'Wanderer',ownerUid:'demo_'+i,
      ea:Math.floor(Math.random()*8)+2,
      defenderGame:demoGames[i%demoGames.length],
      season:Math.floor(Math.random()*4),
      grade:demoGrades[i%demoGrades.length],
      _demo:true};
    var mk=_addSharedMarker(pd);
    _sharedMarkers[demoHash]={marker:mk,data:pd,demo:true};
  }
  _toast('Wild plants detected nearby! Tap one to harvest.');
}
var _demoSeeded=false;

function _recenter(){
  if(_map&&_uLat){_map.setView([_uLat,_uLng],17,{animate:true,duration:0.6});_toast('Recentered on your location.');}
  else{_toast('Waiting for GPS...');}
}
// ═══ CHANGE DEFENSE GAME — update defender game on own wild plant ═══
function _changeDefense(p){
  closeTP();
  // Reuse fc-modal for game selection
  var modal=document.getElementById('fc-modal');
  if(!modal){_toast('Challenge modal not loaded.');return;}
  var board=document.getElementById('fc-board');
  var title=document.getElementById('fc-title');
  var sub=document.getElementById('fc-subtitle');
  var timerWrap=document.getElementById('fc-timer-wrap');
  var timerText=document.getElementById('fc-timer-text');
  if(timerWrap)timerWrap.style.display='none';
  if(timerText)timerText.style.display='none';
  if(title)title.textContent='CHANGE DEFENSE';
  if(sub)sub.textContent='Pick the challenge harvesters must beat';
  var games=[
    {id:'set',name:'Quick Trios',img:'assets/games/cards/card-front.png',diff:'Easy'},
    {id:'memory',name:'Memory',img:'assets/games/memory/00-card-back.png',diff:'Medium'},
    {id:'growth',name:'Growth',img:'assets/games/flood/leaf-gold.png',diff:'Medium'},
    {id:'color',name:'Color',img:'assets/games/simon/spring-btn.png',diff:'Easy'},
    {id:'math',name:'Math',img:'assets/games/flood/grid.png',diff:'Hard'},
    {id:'word',name:'Word',img:'assets/games/memory/01-moonflower.png',diff:'Hard'}
  ];
  var h='';
  for(var i=0;i<games.length;i++){
    var g=games[i];
    var dc=g.diff==='Easy'?'var(--sage)':g.diff==='Medium'?'var(--gold)':'#c07070';
    var sel=g.id===p.defenderGame?' border-color:var(--gold);background:rgba(200,168,75,0.1);':'';
    h+='<div class="fc-card" onclick="_applyDefenseChange(\''+p.hash+'\',\''+g.id+'\')" style="flex-direction:column;gap:6px;padding:10px 8px;'+sel+'">';
    h+='<img src="'+g.img+'" alt="'+g.name+'" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid rgba(122,179,86,0.15);">';
    h+='<div style="font-family:Bebas Neue,sans-serif;font-size:0.75rem;color:var(--cream);letter-spacing:0.06em;">'+g.name+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.45rem;color:'+dc+';letter-spacing:0.06em;margin-top:auto;">'+g.diff+(g.id===p.defenderGame?' \u2713':'')+'</div>';
    h+='</div>';
  }
  if(board){board.innerHTML=h;board.style.gridTemplateColumns='repeat(3,1fr)';}
  modal.classList.add('open');
}
window._applyDefenseChange=function(hash,gameId){
  var modal=document.getElementById('fc-modal');if(modal)modal.classList.remove('open');
  var timerWrap=document.getElementById('fc-timer-wrap');if(timerWrap)timerWrap.style.display='block';
  var timerText=document.getElementById('fc-timer-text');if(timerText)timerText.style.display='block';
  // Update local wild plant
  var wild=_getWild();
  for(var i=0;i<wild.length;i++){
    if(wild[i].hash===hash){wild[i].defenderGame=gameId;break;}
  }
  _saveWild(wild);
  // Update Firestore
  try{
    var user=window.firebase&&firebase.auth()&&firebase.auth().currentUser;
    if(user&&window.db){
      var docId=user.uid+'_'+hash.slice(0,16);
      window.db.collection('wildDrops').doc(docId).update({defenderGame:gameId}).catch(function(){});
    }
  }catch(e){}
  var _gNames={set:'Trios',memory:'Memory',growth:'Growth',color:'Color',math:'Math',word:'Word'};
  _toast('\ud83d\udee1 Defense changed to '+(_gNames[gameId]||gameId));
  if(window.syncVaultToCloud)setTimeout(syncVaultToCloud,500);
};
function _logTip(msg){_toast(msg);}

// ═══ HEX INSPECTOR SYSTEM — Zone-based interaction (replaces individual markers) ═══
var _zoneHexLayers = [];
var _hexInspOpen = false;
var _hexInspZone = null; // current zone key
var _hexInspPlants = []; // plants in current zone
var _hexSelPlant = null; // selected plant in inspector
var _hexLockedTimer = null;

// ── Unified zone hex drawing ──
// Replaces both _drawTerritory() and _drawFeralZones() with one system
function _drawZoneHexes() {
  // Clear old hex layers
  for (var i = 0; i < _zoneHexLayers.length; i++) {
    if (_map) _map.removeLayer(_zoneHexLayers[i]);
  }
  _zoneHexLayers = [];
  if (!_map || !_uLat) return;

  var zones = _getAllZonePlants();
  var zoneKeys = Object.keys(zones);
  var half = ZONE_SIZE / 2;
  var now = Date.now();
  var zoneTimers = {};
  try { zoneTimers = JSON.parse(localStorage.getItem('fg_feral_zones') || '{}'); } catch (e) {}

  // Sort by distance — closest hexes first
  var zoneArr = [];
  for (var z = 0; z < zoneKeys.length; z++) {
    var zk = zoneKeys[z];
    var parts = zk.split(',');
    var cLat = parseFloat(parts[0]);
    var cLng = parseFloat(parts[1]);
    var d = _dist(_uLat, _uLng, cLat, cLng);
    zoneArr.push({ key: zk, lat: cLat, lng: cLng, dist: d, count: zones[zk].length });
  }
  zoneArr.sort(function(a, b) { return a.dist - b.dist; });

  // Cap at 50 hexes for performance
  var cap = Math.min(zoneArr.length, 50);
  for (var h = 0; h < cap; h++) {
    var zone = zoneArr[h];
    var plantCount = zone.count;
    if (plantCount < 1) continue;

    // Check if seed is available in this zone (1 per hex per day)
    var seedAvailable = _isSeedAvailable(zone.key) && plantCount >= 1;

    // Determine hex class based on activity
    var inRange = zone.dist <= _getCollectRange();
    var hexClass = 'zone-hex-dim';
    if (!inRange) {
      hexClass = 'zone-hex-locked';
    } else if (plantCount >= 4) {
      hexClass = 'zone-hex-hot';
    } else if (plantCount >= 2) {
      hexClass = 'zone-hex-mod';
    }
    if (seedAvailable && inRange) hexClass += ' zone-hex-seed';

    // Determine color — own plants sage, shared plants gold
    var wild = _getWild();
    var hasOwn = false;
    for (var ow = 0; ow < wild.length; ow++) {
      if (wild[ow] && _zoneKey(wild[ow].lat, wild[ow].lng) === zone.key) { hasOwn = true; break; }
    }
    var baseColor = hasOwn ? 'rgba(122,179,86,' : 'rgba(200,168,75,';
    var strokeAlpha = inRange ? '0.5)' : '0.15)';
    var fillAlpha = inRange ? '0.08)' : '0.03)';

    // Build hex points
    var pts = [];
    for (var a = 0; a < 6; a++) {
      var angle = (a * 60 - 30) * Math.PI / 180;
      pts.push([zone.lat + half * Math.sin(angle), zone.lng + half * 1.15 * Math.cos(angle)]);
    }

    var hex = L.polygon(pts, {
      color: baseColor + strokeAlpha,
      weight: 1.5,
      fillColor: baseColor + fillAlpha,
      fillOpacity: 1,
      interactive: true,
      className: hexClass
    }).addTo(_map);

    // Store zone data on the hex
    hex._zoneKey = zone.key;
    hex._zoneDist = zone.dist;
    hex._zonePlantCount = plantCount;
    hex._zoneSeedAvailable = seedAvailable;

    // Tap handler — inspector or locked preview
    hex.on('click', function(e) {
      L.DomEvent.stopPropagation(e);
      var zk = this._zoneKey;
      var d = this._zoneDist;
      var dynRange = typeof _getCollectRange === 'function' ? _getCollectRange() : COLLECT_RANGE;
      if (d <= dynRange) {
        _openHexInspector(zk);
      } else {
        _showLockedPreview(zk, d, this._zonePlantCount, this._zoneSeedAvailable);
      }
    });

    _zoneHexLayers.push(hex);
  }
}

// ── Locked hex preview (>75m) ──
function _showLockedPreview(zk, dist, count, seedAvail) {
  var el = document.getElementById('hex-locked');
  if (!el) return;
  var countEl = document.getElementById('hl-count');
  var soilEl = document.getElementById('hl-soil');
  var seedEl = document.getElementById('hl-seed');
  var distEl = document.getElementById('hl-dist');

  if (countEl) countEl.textContent = count + ' plant' + (count !== 1 ? 's' : '');
  if (distEl) distEl.textContent = Math.round(dist) + 'm away';

  // Soil info
  if (soilEl && window.getSoilInfo) {
    var parts = zk.split(',');
    var si = getSoilInfo(parseFloat(parts[0]), parseFloat(parts[1]));
    soilEl.textContent = (si && si.name ? si.name : 'Bare') + ' soil';
  }

  // Seed status
  if (seedEl) {
    if (seedAvail) {
      seedEl.textContent = 'Seed ready to find';
      seedEl.style.color = 'var(--sage)';
    } else {
      seedEl.textContent = 'Searched today';
      seedEl.style.color = 'var(--muted)';
    }
  }

  el.classList.add('show');
  clearTimeout(_hexLockedTimer);
  _hexLockedTimer = setTimeout(function() { el.classList.remove('show'); }, 3000);
}

// ── Open hex inspector (<=75m) ──
function _openHexInspector(zk) {
  var zones = _getAllZonePlants();
  var plants = zones[zk] || [];
  if (plants.length === 0) { _toast('No plants in this zone.'); return; }

  _hexInspZone = zk;
  _hexInspPlants = plants;
  _hexInspOpen = true;
  _hexSelPlant = null;

  var panel = document.getElementById('hex-inspector');
  var scrim = document.getElementById('hex-insp-scrim');
  if (!panel) return;

  // Zone name — auto-generated from coordinates
  var parts = zk.split(',');
  var lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
  var nameEl = document.getElementById('hi-zone-name');
  if (nameEl) {
    // Generate a deterministic zone name
    var seed = 0;
    for (var si = 0; si < zk.length; si++) seed = ((seed << 5) - seed + zk.charCodeAt(si)) | 0;
    var prefixes = ['Mossy','Quiet','Ancient','Sunlit','Shaded','Misty','Wild','Deep','Silver','Golden'];
    var suffixes = ['Hollow','Glen','Patch','Ring','Dell','Copse','Clearing','Thicket','Bed','Stand'];
    nameEl.textContent = prefixes[Math.abs(seed) % prefixes.length] + ' ' + suffixes[Math.abs(seed >> 8) % suffixes.length];
  }

  // Distance
  var distEl = document.getElementById('hi-zone-dist');
  if (distEl) {
    var d = _dist(_uLat, _uLng, lat, lng);
    distEl.textContent = Math.round(d) + 'm';
  }

  // Habitat info
  _renderHabitatInfo(zk, lat, lng);

  // Plant cards
  _renderHexPlants(plants);

  // Seed search button state
  _renderSeedSearch(zk, plants);

  // Hide detail section
  var detailEl = document.getElementById('hi-detail');
  if (detailEl) detailEl.style.display = 'none';

  // Open panel
  panel.classList.add('open');
  if (scrim) scrim.classList.add('open');
}

// ── Close hex inspector ──
window._closeHexInspector = function() {
  _hexInspOpen = false;
  _hexInspZone = null;
  _hexSelPlant = null;
  var panel = document.getElementById('hex-inspector');
  var scrim = document.getElementById('hex-insp-scrim');
  if (panel) panel.classList.remove('open');
  if (scrim) scrim.classList.remove('open');
};

// ── Render habitat info chips ──
function _renderHabitatInfo(zk, lat, lng) {
  var el = document.getElementById('hi-habitat');
  if (!el) return;
  var chips = '';

  // Biome
  if (window._lastDetectedBiome && window.getBiomeInfo) {
    var bi = getBiomeInfo(window._lastDetectedBiome);
    chips += '<div class="hi-hab-chip">' + (bi.icon || '') + ' <b>' + (bi.name || 'Unknown') + '</b></div>';
  }

  // Soil
  if (window.getSoilInfo) {
    var si = getSoilInfo(lat, lng);
    if (si) chips += '<div class="hi-hab-chip">Soil: <b>' + si.name + '</b> (' + si.maturity + '%)</div>';
  }

  // Mesh
  if (window.getMeshBonus) {
    // Check if any plant in zone has mesh connections
    for (var mp = 0; mp < _hexInspPlants.length; mp++) {
      var mb = getMeshBonus(_hexInspPlants[mp].hash);
      if (mb && mb.connections > 0) {
        chips += '<div class="hi-hab-chip">Mesh: <b>' + mb.stageName + '</b> (' + mb.connections + ' links)</div>';
        break;
      }
    }
  }

  // Bloom chorus
  if (window.getChorusBonus) {
    for (var cp = 0; cp < _hexInspPlants.length; cp++) {
      var cb = getChorusBonus(_hexInspPlants[cp].hash);
      if (cb && cb.inChorus) {
        chips += '<div class="hi-hab-chip">Chorus: <b>+' + Math.round(cb.pollenBonus * 100) + '% pollen</b></div>';
        break;
      }
    }
  }

  el.innerHTML = chips || '<div class="hi-hab-chip">No habitat data yet</div>';
}

// ── Render plant card thumbnails ──
function _renderHexPlants(plants) {
  var el = document.getElementById('hi-plant-scroll');
  if (!el) return;
  el.innerHTML = '';

  // Augment plants with full data from local wild + shared
  var wild = _getWild();
  var augmented = [];
  for (var i = 0; i < plants.length; i++) {
    var p = plants[i];
    var full = null;
    // Check local wild
    for (var w = 0; w < wild.length; w++) {
      if (wild[w].hash === p.hash) { full = wild[w]; break; }
    }
    // Check shared markers
    if (!full && _sharedMarkers[p.hash]) {
      full = _sharedMarkers[p.hash].data || null;
    }
    // Compute EA for sorting — prefer stored, fallback to trait recompute
    var _eaVal = 0;
    if (full && typeof full.ea === 'number' && full.ea > 0) {
      _eaVal = full.ea;
    } else if (typeof _wildEA === 'function') {
      try { _eaVal = _wildEA({hash: p.hash, ea: full && full.ea, date: full && full.date}); } catch (e) { _eaVal = 0; }
    }
    augmented.push({
      hash: p.hash, lat: p.lat, lng: p.lng,
      own: full ? (full.own !== false) : false,
      wildBorn: full ? !!full.wildBorn : false,
      ownerName: full ? (full.ownerName || 'Keeper') : 'Unknown',
      ownerUid: full ? (full.ownerUid || '') : '',
      defenderGame: full ? (full.defenderGame || 'set') : 'set',
      date: full ? full.date : null,
      days: full && full.date ? Math.floor((Date.now() - new Date(full.date).getTime()) / 86400000) : 0,
      ea: _eaVal
    });
  }

  // Display-level 3-per-zone cap — legacy drops from before the cap landed
  // can leave >3 plants in a zone, and we can't delete other players' remote
  // plants from Firestore (no auth). Sort by EA desc, show the top 3, note
  // the hidden count so the keeper knows about the excess.
  var _overCapExcess = 0;
  if (augmented.length > MAX_PER_ZONE) {
    augmented.sort(function(a, b) { return (b.ea || 0) - (a.ea || 0); });
    _overCapExcess = augmented.length - MAX_PER_ZONE;
    augmented = augmented.slice(0, MAX_PER_ZONE);
  }
  if (_overCapExcess > 0) {
    var note = document.createElement('div');
    note.style.cssText = 'padding:0.5rem 0.75rem;margin-bottom:0.4rem;background:rgba(200,168,75,0.08);border:1px solid rgba(200,168,75,0.2);border-radius:6px;font-family:DM Mono,monospace;font-size:0.48rem;color:var(--gold);line-height:1.4;';
    note.innerHTML = '\u26a0 Zone has ' + (augmented.length + _overCapExcess) + ' plants total \u2014 showing strongest 3 by EA (' + _overCapExcess + ' legacy weaker plant' + (_overCapExcess === 1 ? '' : 's') + ' hidden).';
    el.appendChild(note);
  }

  for (var j = 0; j < augmented.length; j++) {
    var ap = augmented[j];
    var card = document.createElement('div');
    card.className = 'hi-plant-row';
    card.setAttribute('data-idx', j);

    // Plant SVG — show for ALL plants (Wild v3: keepers need to see
    // everyone's art to decide which plants to tend and breed with).
    var svgHtml = '';
    if (window._generatePlantSVG) {
      try { svgHtml = window._generatePlantSVG(ap.hash, 40, 1); } catch (e) { svgHtml = ''; }
    }
    if (!svgHtml) {
      svgHtml = '<svg viewBox="0 0 40 50" width="40" height="50" xmlns="http://www.w3.org/2000/svg"><rect x="11" y="38" width="18" height="12" rx="3" fill="rgba(90,112,80,0.2)"/><line x1="20" y1="38" x2="20" y2="15" stroke="rgba(90,112,80,0.25)" stroke-width="3" stroke-linecap="round"/><ellipse cx="12" cy="20" rx="9" ry="6" fill="rgba(90,112,80,0.15)" transform="rotate(-20 12 20)"/><ellipse cx="28" cy="17" rx="9" ry="6" fill="rgba(90,112,80,0.12)" transform="rotate(15 28 17)"/></svg>';
    }

    var name = window.getPlantName ? getPlantName(ap.hash) : ap.hash.slice(0, 8);
    var grade = '?', gradeColor = 'var(--muted)';
    if (window.hashToTraits && window.getTerraGrade) {
      try { var tr = hashToTraits(ap.hash); var tg = getTerraGrade(tr); grade = tg.label || tg.name || '?'; gradeColor = tg.color || 'var(--muted)'; } catch (e) {}
    }
    var origin = ap.own ? 'Planted' : (ap.wildBorn ? 'Wild Born' : ap.ownerName);

    // Sprout render override — a dormant seedling awaiting germination.
    // Shows the sprout art + countdown instead of generated plant SVG.
    if (ap.sprout && ap.germinateAt) {
      var _remainMs = ap.germinateAt - Date.now();
      var _remainTxt = _remainMs <= 0 ? 'Ready to germinate' :
        _remainMs >= 3600000 ? Math.round(_remainMs / 3600000) + 'h' :
        Math.round(_remainMs / 60000) + 'm';
      card.innerHTML =
        '<div class="hi-pr-svg" style="display:flex;align-items:center;justify-content:center;"><img src="assets/games/wild/wild-sprout.png" alt="sprout" style="width:44px;height:44px;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></div>' +
        '<div class="hi-pr-info"><div class="hi-pr-name" style="color:var(--sage);font-style:italic;">Sprout</div>' +
        '<div class="hi-pr-meta" style="color:var(--gold);">Germinates in ' + _remainTxt + '</div></div>';
    } else {
      card.innerHTML =
        '<div class="hi-pr-svg">' + svgHtml + '</div>' +
        '<div class="hi-pr-info"><div class="hi-pr-name">' + name + '</div>' +
        '<div class="hi-pr-meta" style="color:' + gradeColor + ';">' + grade + ' · ' + origin + '</div></div>';
    }

    // Tap to select
    (function(idx, plantData) {
      card.addEventListener('click', function() {
        _selectHexPlant(idx, plantData);
      });
    })(j, ap);

    el.appendChild(card);
  }

  // Store augmented for action handlers
  _hexInspPlants = augmented;
}

// ── Select a plant in the inspector ──
function _selectHexPlant(idx, plantData) {
  _hexSelPlant = plantData;

  // Highlight selected card
  var cards = document.querySelectorAll('.hi-plant-row');
  for (var c = 0; c < cards.length; c++) cards[c].classList.remove('selected');
  var sel = document.querySelector('.hi-plant-row[data-idx="' + idx + '"]');
  if (sel) sel.classList.add('selected');

  // Field Journal: first-tap discovery + daily scout Dew rewards
  if (typeof _fjInteract === 'function') _fjInteract(plantData);

  // Build detail panel
  var el = document.getElementById('hi-detail');
  if (!el) return;

  var p = plantData;
  var name = '???';
  var grade = '?';
  var gradeColor = 'var(--muted)';
  var traits = null;
  var tg = null;

  if (window.hashToTraits) {
    try { traits = hashToTraits(p.hash); } catch (e) {}
  }
  if (traits && window.getTerraGrade) {
    try { tg = getTerraGrade(traits); grade = tg.label || tg.name || '?'; gradeColor = tg.color || 'var(--muted)'; } catch (e) {}
  }
  if (window.getPlantName) {
    try { name = getPlantName(p.hash); } catch (e) {}
  }

  // Vitality bar — rarity-scaled lifespan readout on every plant.
  // Works for own + stranger plants. Dead plants show a withered state.
  var vitalityHtml = '';
  try {
    var _sourcePlant = null;
    var _localWild = _getWild();
    for (var _lw = 0; _lw < _localWild.length; _lw++) {
      if (_localWild[_lw].hash === p.hash) { _sourcePlant = _localWild[_lw]; break; }
    }
    if (!_sourcePlant && _sharedMarkers && _sharedMarkers[p.hash]) {
      _sourcePlant = _sharedMarkers[p.hash].data || null;
    }
    if (_sourcePlant) {
      _ensureVitality(_sourcePlant);
      var _vit = _getWildVitality(_sourcePlant);
      var _vPct = Math.round(_vit.pct * 100);
      var _vDays = _vit.daysLeft;
      var _vLabel = _vDays >= 1 ? Math.round(_vDays) + ' days left' : Math.round(_vDays * 24) + 'h left';
      var _vColor = _vPct > 66 ? 'var(--sage)' : _vPct > 33 ? '#c8a84b' : '#c07060';
      vitalityHtml = '<div class="hi-vitality">' +
        '<div class="hi-vitality-row"><span class="hi-vitality-label">VITALITY</span>' +
          '<span class="hi-vitality-val" style="color:' + _vColor + ';">' + _vPct + '% \u00b7 ' + _vLabel + '</span>' +
        '</div>' +
        '<div class="hi-vitality-bar"><div class="hi-vitality-fill" style="width:' + _vPct + '%;background:' + _vColor + ';"></div></div>' +
        '<div class="hi-vitality-caption">Lifespan ' + Math.round((_sourcePlant.lifespanMs || 0) / 86400000) + 'd \u00b7 ' + (_sourcePlant.rarity || 'Common') + (p.own ? ' \u00b7 Water to reset' : ' \u00b7 Tend to extend') + '</div>' +
      '</div>';
    }
  } catch(e) {}

  // ── CLIMATE profile ──
  // Shows the plant's 5 hash-derived thresholds vs today's weather, so a
  // keeper can see at a glance what's currently hurting their plant and
  // decide whether to tend or let nature take it. Uses the already-fetched
  // _reproWeather cache so the hex-tap doesn't hit open-meteo again.
  var climateHtml = '';
  if (traits && typeof traits.heatMax === 'number') {
    var _cw = _reproWeather || null;
    var _curTemp = _cw ? _cw.temp : null;
    var _curRain = _cw ? _cw.rain : null;
    var _curDry = 0;
    try {
      var _dryMap = JSON.parse(localStorage.getItem('lw_dry_days') || '{}');
      var _pzk = _zoneKey(p.lat, p.lng);
      _curDry = _dryMap[_pzk] || 0;
    } catch(e) {}
    // Season multiplier for this plant today — shown as a badge
    var _curMonth = new Date().getMonth();
    var _curSeason = _curMonth < 3 ? 3 : _curMonth < 6 ? 0 : _curMonth < 9 ? 1 : 2;
    var _ps = traits.season || 0;
    var _sDelta = Math.abs(_ps - _curSeason); if (_sDelta === 3) _sDelta = 1;
    var _sMultTxt = _sDelta === 0 ? 'PEAK (-50% dmg)' : _sDelta === 2 ? 'OPPOSITE (+75% dmg)' : 'IN-BETWEEN';
    var _sMultColor = _sDelta === 0 ? 'var(--sage)' : _sDelta === 2 ? '#c07060' : '#c8a84b';
    // Threshold rows — status: safe/near/breached
    function _climateRow(icon, label, thresholdTxt, curTxt, breached, near) {
      var dotColor = breached ? '#c07060' : (near ? '#c8a84b' : 'var(--sage)');
      var valColor = breached ? '#c07060' : 'var(--cream)';
      return '<div class="hi-climate-row">' +
        '<span class="hi-climate-icon">' + icon + '</span>' +
        '<span class="hi-climate-label">' + label + '</span>' +
        '<span class="hi-climate-thr">' + thresholdTxt + '</span>' +
        '<span class="hi-climate-cur" style="color:' + valColor + ';">' + curTxt + '</span>' +
        '<span class="hi-climate-dot" style="background:' + dotColor + ';"></span>' +
      '</div>';
    }
    climateHtml = '<div class="hi-climate">' +
      '<div class="hi-climate-head"><span class="hi-climate-title">CLIMATE</span>' +
      '<span class="hi-climate-season" style="color:' + _sMultColor + ';">' + _sMultTxt + '</span></div>';
    // Heat
    climateHtml += _climateRow(
      '\ud83d\udd25', 'HEAT',
      '\u2264 ' + traits.heatMax + '\u00b0C',
      _curTemp !== null ? Math.round(_curTemp) + '\u00b0C' : '\u2014',
      _curTemp !== null && _curTemp > traits.heatMax,
      _curTemp !== null && _curTemp > traits.heatMax - 3 && _curTemp <= traits.heatMax
    );
    // Cold
    climateHtml += _climateRow(
      '\u2744\ufe0f', 'COLD',
      '\u2265 ' + traits.coldMin + '\u00b0C',
      _curTemp !== null ? Math.round(_curTemp) + '\u00b0C' : '\u2014',
      _curTemp !== null && _curTemp < traits.coldMin,
      _curTemp !== null && _curTemp < traits.coldMin + 3 && _curTemp >= traits.coldMin
    );
    // Drought
    climateHtml += _climateRow(
      '\ud83c\udfdc\ufe0f', 'DROUGHT',
      '\u2264 ' + traits.droughtDays + 'd dry',
      _curDry + 'd dry',
      _curDry > traits.droughtDays,
      _curDry >= traits.droughtDays - 1 && _curDry <= traits.droughtDays
    );
    // Flood
    climateHtml += _climateRow(
      '\ud83c\udf27\ufe0f', 'FLOOD',
      '\u2264 ' + traits.floodMm + 'mm',
      _curRain !== null ? (Math.round(_curRain * 10) / 10) + 'mm' : '\u2014',
      _curRain !== null && _curRain > traits.floodMm,
      _curRain !== null && _curRain > traits.floodMm * 0.8 && _curRain <= traits.floodMm
    );
    // Wind — open-meteo windspeed converted to mph in _fetchReproWeather
    var _curWind = _cw ? _cw.wind : null;
    climateHtml += _climateRow(
      '\ud83d\udca8', 'WIND',
      '\u2264 ' + traits.windMax + 'mph',
      _curWind !== null ? Math.round(_curWind) + 'mph' : '\u2014',
      _curWind !== null && _curWind > traits.windMax,
      _curWind !== null && _curWind > traits.windMax - 5 && _curWind <= traits.windMax
    );
    climateHtml += '</div>';
  }

  // Trait summary — visible for ALL plants in Wild v3 (the old hide-rarity
  // rule was reversed now that harvest/theft is gone — strangers' plants
  // become social landmarks players can aspire to tend, not targets).
  var traitHtml = '';
  if (traits) {
    traitHtml += '<div class="hi-detail-traits">';
    traitHtml += 'Pot: ' + (traits.pot || '?') + ' &middot; Stem: ' + (traits.stem || '?') + '<br>';
    traitHtml += 'Leaves: ' + (traits.leafCount || '?') + 'x ' + (traits.leafType || '?') + '<br>';
    if (traits.hasFlower) traitHtml += 'Bloom: ' + (traits.flower || '?') + '<br>';
    if (traits.companion && traits.companion !== 'None') traitHtml += 'Companion: ' + traits.companion + '<br>';
    if (traits.mutation && traits.mutation !== 'None') traitHtml += 'Mutation: <span style="color:var(--gold);">' + traits.mutation + '</span><br>';
    traitHtml += 'Age: ' + p.days + ' days';
    traitHtml += '</div>';
  }

  // Action buttons
  var actions = '';
  var user = window.firebase && firebase.auth() && firebase.auth().currentUser;
  var isOwn = p.own || (user && user.uid && p.ownerUid === user.uid);

  // INSPECT is always available — everyone can see any plant in the wild
  // regardless of resources or level (per Stephen's design).
  var inspectBtn = '<button class="hi-action-btn" onclick="window._hexAction(\'inspect\')">&#128269; INSPECT</button>';

  if (isOwn) {
    actions += '<button class="hi-action-btn" onclick="window._hexAction(\'water\')">&#128167; WATER</button>';
    actions += '<button class="hi-action-btn gold" onclick="window._hexAction(\'breed\')">&#129516; BREED</button>';
    actions += inspectBtn;
    actions += '<button class="hi-action-btn" onclick="window._hexAction(\'defense\')">&#128737; DEFENSE</button>';
  } else if (p.wildBorn) {
    actions += '<button class="hi-action-btn" onclick="window._hexAction(\'collect\')">&#127793; COLLECT</button>';
    actions += '<button class="hi-action-btn gold" onclick="window._hexAction(\'breed\')">&#129516; BREED</button>';
    actions += '<button class="hi-action-btn" onclick="window._hexAction(\'water\')">&#128167; WATER</button>';
  } else {
    // Wild v3: stranger plants get INSPECT (always), WATER (budgeted),
    // TEND (Lv 5, restorative), and CUTTING (Lv 15, destructive).
    // Seeing is free, tending is kind, cutting wounds.
    var _canTend = (window.canSee && window.canSee.strangerTend && window.canSee.strangerTend());
    var _canCut  = (window.canSee && window.canSee.wildCutting && window.canSee.wildCutting());
    actions += inspectBtn;
    actions += '<button class="hi-action-btn" onclick="window._hexAction(\'water\')">&#128167; WATER</button>';
    actions += '<button class="hi-action-btn' + (_canTend ? '' : ' locked') + '" onclick="window._hexAction(\'tend\')" title="' + (_canTend ? 'Tend this plant — gives it +life and grants you Dew' : 'Unlocks at Keeper Level 5') + '">&#127807; TEND' + (_canTend ? '' : ' &#128274;') + '</button>';
    actions += '<button class="hi-action-btn' + (_canCut ? ' gold' : ' locked') + '" onclick="window._hexAction(\'cutting\')" title="' + (_canCut ? 'Take a clone seed — WOUNDS the parent plant' : 'Unlocks at Keeper Level 15') + '">\u2702\ufe0f CUTTING' + (_canCut ? '' : ' &#128274;') + '</button>';
  }

  el.innerHTML =
    '<div class="hi-detail-name">' + name + '</div>' +
    '<div class="hi-detail-grade" style="color:' + gradeColor + ';">' + grade + '</div>' +
    vitalityHtml +
    climateHtml +
    traitHtml +
    '<div class="hi-actions">' + actions + '</div>';

  el.style.display = 'block';
}

// ── Render seed search button ──
function _renderSeedSearch(zk, plants) {
  var btn = document.getElementById('hi-search-btn');
  var timerEl = document.getElementById('hi-search-timer');
  if (!btn) return;

  var available = _isSeedAvailable(zk) && plants.length >= 1;

  if (plants.length < 1) {
    btn.disabled = true;
    btn.innerHTML = '<span class="hi-search-icon">&#127793;</span> NO PLANTS TO SEARCH';
    if (timerEl) timerEl.style.display = 'none';
  } else if (available) {
    btn.disabled = false;
    btn.innerHTML = '<span class="hi-search-icon">&#127793;</span> SEARCH FOR SEEDS';
    if (timerEl) timerEl.style.display = 'none';
  } else {
    btn.disabled = true;
    btn.innerHTML = '<span class="hi-search-icon">&#127793;</span> SEARCHED TODAY';
    if (timerEl) {
      timerEl.textContent = 'Resets at midnight';
      timerEl.style.display = 'block';
    }
  }
}

// ── Seed search action (replaces feral collection) ──
window._hexSeedSearch = function() {
  if (!_hexInspZone || !_hexInspPlants || _hexInspPlants.length < 1) return;
  _collectFeralFromZone(_hexInspZone, _hexInspPlants);
  // After collection, refresh the search button state
  setTimeout(function() {
    if (_hexInspOpen && _hexInspZone) _renderSeedSearch(_hexInspZone, _hexInspPlants);
  }, 500);
};

// ── Plant action dispatcher ──
window._hexAction = function(action) {
  if (!_hexSelPlant) { _toast('Select a plant first.'); return; }
  var p = _hexSelPlant;

  switch (action) {
    case 'water':
      // Hourly tending model (Apr 14, 2026): any watering is gated on a
      // per-plant-per-user 1h cooldown. No daily budget caps — you can
      // tend as many different plants as you want, but not the same plant
      // twice in under an hour. This is what makes community tending
      // meaningful: one keeper can keep a plant alive in peak season,
      // four keepers rotating every 2h can keep it alive in winter.
      var _tendMap = {}; try { _tendMap = JSON.parse(localStorage.getItem('lw_plant_last_tend') || '{}'); } catch (e) {}
      var _lastTend = _tendMap[p.hash] || 0;
      var _sinceTend = Date.now() - _lastTend;
      if (_sinceTend < 3600000) {
        var _mins = Math.max(1, Math.ceil((3600000 - _sinceTend) / 60000));
        _toast('\u231b Tended recently. Back in ' + _mins + 'm.');
        break;
      }
      if (!p.own && _uLat && p.lat) {
        var _wDist = _dist(_uLat, _uLng, p.lat, p.lng);
        if (_wDist > COLLECT_RANGE) { _toast('Walk closer! ' + Math.round(_wDist) + 'm away.'); break; }
      }
      if (p.own) {
        // Owner water: +6h, no lifetime cap. Can stack indefinitely as
        // long as each tend is at least 1h after the previous.
        var _wild = _getWild();
        var _hit = null, _hitIdx = -1;
        for (var _wi = 0; _wi < _wild.length; _wi++) {
          if (_wild[_wi].hash === p.hash) { _hit = _wild[_wi]; _hitIdx = _wi; break; }
        }
        if (!_hit) { _toast('Plant not found in your local wild cache.'); break; }
        _ensureVitality(_hit);
        _hit.lastWateredAt = Date.now();
        _hit.decayAt = (_hit.decayAt || Date.now()) + 6 * 3600000;
        _wild[_hitIdx] = _hit;
        _saveWild(_wild);
        _toast('\ud83d\udca7 Watered! +6h of life.');
        if (window._haptic) _haptic('bloom');
        if (window._trackQuest) _trackQuest('plantsWatered', 1);
        if (window.LW_Log) window.LW_Log.write('wild_watered', { hash: p.hash });
      } else {
        // Stranger water: +2h onto the shared marker's decayAt. Still
        // respects the WILD_TEND_BONUS_CAP so a single plant can't get
        // infinite tending across all visitors (raised to 30d earlier).
        try {
          if (_sharedMarkers && _sharedMarkers[p.hash] && _sharedMarkers[p.hash].data) {
            var _wSmd = _sharedMarkers[p.hash].data;
            _ensureVitality(_wSmd);
            if ((_wSmd.strangerTendAddMs || 0) < WILD_TEND_BONUS_CAP) {
              _wSmd.strangerTendAddMs = (_wSmd.strangerTendAddMs || 0) + WILD_WATER_BONUS_MS;
              _wSmd.decayAt = (_wSmd.decayAt || Date.now()) + WILD_WATER_BONUS_MS;
            }
          }
        } catch(e) {}
        if (window.PW_grantXP) PW_grantXP(5, 'wild_water_stranger');
        if (window.LW_Log) window.LW_Log.write('wild_watered_stranger', { hash: p.hash, ownerName: p.ownerName || 'Keeper' });
        _toast('\ud83d\udca7 Watered a keeper\u2019s plant. +2h \u00b7 +5 XP.');
        if (window._haptic) _haptic('bloom');
        if (window._trackQuest) _trackQuest('plantsWatered', 1);
      }
      // Write hourly cooldown timestamp for this plant
      _tendMap[p.hash] = Date.now();
      try { localStorage.setItem('lw_plant_last_tend', JSON.stringify(_tendMap)); } catch(e) {}
      // Refresh inspector detail
      if (typeof _selectHexPlant === 'function') _selectHexPlant(0, p);
      break;

    case 'breed':
      if (window.openBreedScreen) {
        _closeHexInspector();
        openBreedScreen(p, 'wild');
      } else { _toast('Breed system loading...'); }
      break;

    case 'inspect':
      // Open the Extra Details modal for ANY plant — own, stranger, wild,
      // or greenhouse. The modal reconstructs from hash if the plant isn't
      // in any local store, so stranger wild plants still render fully.
      if (window._openPlantDetails) {
        _closeHexInspector();
        window._openPlantDetails(p.hash);
      } else { _toast('Details view loading...'); }
      break;

    case 'harvest':
      // DEAD CODE — harvest was removed in Wild v3 Phase 1. Kept as a safety
      // net in case any stale cached UI still calls it. Will be deleted in
      // a cleanup commit once confirmed there are no call sites left.
      _toast('Harvest has been retired. Try TEND instead (unlocks at Lv 5).');
      break;

    case 'tend':
      // Wild v3 Phase 2 stub — non-destructive stranger tend, grants Dew.
      // Full implementation comes with the Phase 2 interactions commit.
      if (!window.canSee || !window.canSee.strangerTend || !window.canSee.strangerTend()) {
        _toast('Tending unlocks at Keeper Level 5.');
        break;
      }
      if (_uLat && p.lat) {
        var _tendDist = _dist(_uLat, _uLng, p.lat, p.lng);
        if (_tendDist > COLLECT_RANGE) { _toast('Walk closer! ' + Math.round(_tendDist) + 'm away.'); break; }
      }
      if (p.own) { _toast('That\u2019s your own plant \u2014 water it instead.'); break; }
      // Wild v3 Phase 2: non-destructive tend. Adds +6h to the target
      // plant's remaining lifespan (capped at +5 days lifetime per plant),
      // 6h per-player cooldown to stop spamming the same plant.
      var _tendKey = 'lw_tend_cd';
      var _tendCd = {}; try { _tendCd = JSON.parse(localStorage.getItem(_tendKey) || '{}'); } catch (e) {}
      if (_tendCd[p.hash] && Date.now() - _tendCd[p.hash] < 6 * 3600000) {
        var _tendHrs = Math.ceil(6 - (Date.now() - _tendCd[p.hash]) / 3600000);
        _toast('Already tended this plant. Back in ' + _tendHrs + 'h.');
        break;
      }
      _tendCd[p.hash] = Date.now();
      localStorage.setItem(_tendKey, JSON.stringify(_tendCd));
      // Bump the locally-cached shared marker so the inspector reflects
      // the new vitality immediately. Server source-of-truth update will
      // come with the Firestore transaction landing in Phase 2 finish.
      try {
        if (_sharedMarkers && _sharedMarkers[p.hash] && _sharedMarkers[p.hash].data) {
          var _smd = _sharedMarkers[p.hash].data;
          _ensureVitality(_smd);
          if ((_smd.strangerTendAddMs || 0) < WILD_TEND_BONUS_CAP) {
            _smd.strangerTendAddMs = (_smd.strangerTendAddMs || 0) + WILD_TEND_BONUS_MS;
            _smd.decayAt = (_smd.decayAt || Date.now()) + WILD_TEND_BONUS_MS;
          }
        }
      } catch(e) {}
      if (window.earnDew) window.earnDew(2, 'wild_tend_stranger');
      if (window.PW_grantXP) PW_grantXP(10, 'wild_tend_stranger');
      if (window.LW_Log) window.LW_Log.write('wild_tended_stranger', { hash: p.hash, ownerName: p.ownerName || 'Keeper' });
      _toast('\ud83c\udf3f Tended ' + (p.ownerName || 'a keeper') + '\u2019s plant. +6h lifespan \u00b7 +2 Dew \u00b7 +10 XP');
      _play('match');
      break;

    case 'cutting':
      // Wild v3 Phase 2 — destructive stranger interaction. Creates a
      // clone seed in the nursery and WOUNDS the parent by removing
      // 10% of its remaining lifespan. Once per player per plant, ever.
      if (!window.canSee || !window.canSee.wildCutting || !window.canSee.wildCutting()) {
        _toast('Cuttings unlock at Keeper Level 15.');
        break;
      }
      if (_uLat && p.lat) {
        var _cutDist = _dist(_uLat, _uLng, p.lat, p.lng);
        if (_cutDist > COLLECT_RANGE) { _toast('Walk closer! ' + Math.round(_cutDist) + 'm away.'); break; }
      }
      if (p.own) { _toast('Cuttings from your own plants don\u2019t wound — just breed them normally.'); break; }
      // Per-player lifetime gate — hash keys a seen set so a player can
      // only take one cutting from any given plant, ever.
      var _cutKey = 'lw_cuttings_taken';
      var _cutLog = {}; try { _cutLog = JSON.parse(localStorage.getItem(_cutKey) || '{}'); } catch (e) {}
      if (_cutLog[p.hash]) {
        _toast('You\u2019ve already taken a cutting from this plant. Each is a lifetime one-shot.');
        break;
      }
      // Nursery capacity check — don't wound the plant if we can't
      // deposit the clone (would be pure grief).
      var _nurMax = (window.FG_Data && window.FG_Data.getNurSlots) ? window.FG_Data.getNurSlots() : 3;
      var _nurNow = (window.FG_Data && window.FG_Data.getNursery) ? window.FG_Data.getNursery().length : 0;
      if (_nurNow >= _nurMax) {
        _toast('Nursery full (' + _nurNow + '/' + _nurMax + '). Bloom or abandon a seed first.');
        break;
      }
      // Confirmation: cutting is destructive and irreversible, spell it out.
      window._lwConfirm && window._lwConfirm({
        title: 'TAKE A CUTTING',
        body: 'You\u2019ll gain a clone seed (Gen 2, \u22122 EA from the wound). The parent plant loses <b>10%</b> of its remaining lifespan. This cannot be undone. Tend other plants instead to be kind.',
        yes: 'TAKE CUTTING',
        no: 'LEAVE IT ALONE',
        danger: true
      }, function() {
        // Wound the cached plant (source of truth for the live view).
        try {
          if (_sharedMarkers && _sharedMarkers[p.hash] && _sharedMarkers[p.hash].data) {
            var _smd = _sharedMarkers[p.hash].data;
            _ensureVitality(_smd);
            var _rem = Math.max(0, (_smd.decayAt || Date.now()) - Date.now());
            var _wound = Math.round(_rem * 0.10);
            _smd.decayAt = (_smd.decayAt || Date.now()) - _wound;
            _smd.cuttingWounds = (_smd.cuttingWounds || 0) + 1;
          }
        } catch(e) {}
        // Record cutting so this plant can never be cut again by us.
        _cutLog[p.hash] = Date.now();
        try { localStorage.setItem(_cutKey, JSON.stringify(_cutLog)); } catch(e) {}
        // Deposit a clone seed in the nursery — both parents = the cut
        // plant's hash so the spliced bloom reproduces the same plant,
        // gen defaults to 2 (neither parent in greenhouse), which means
        // the natural -2 EA chimera penalty already applies.
        if (window.FG_Data && window.FG_Data.addSeed) {
          var _addResult = window.FG_Data.addSeed({
            seedHash: p.hash,
            parentAHash: p.hash,
            parentBHash: p.hash,
            nonce: 0,
            mystery: false
          });
          if (!_addResult || !_addResult.ok) {
            _toast('Cutting failed to land in nursery. Parent plant was spared.');
            // Undo the cutting record so the player can try again later
            delete _cutLog[p.hash];
            try { localStorage.setItem(_cutKey, JSON.stringify(_cutLog)); } catch(e) {}
            return;
          }
        }
        // Rewards: Dew + pollen XP for the cutter. The XP is smaller
        // than tend because the action is extractive.
        if (window.PW_grantXP) PW_grantXP(15, 'wild_cutting');
        if (window.LW_Log) window.LW_Log.write('wild_cutting_taken', {
          hash: p.hash,
          name: typeof getPlantName === 'function' ? getPlantName(p.hash) : '',
          ownerName: p.ownerName || 'Keeper'
        });
        if (window.renderNursery) renderNursery();
        if (window.syncVaultToCloud) setTimeout(syncVaultToCloud, 500);
        _toast('\u2702\ufe0f Clone seed added to the nursery. The parent weakened.');
        if (window._haptic) _haptic('error');
        if (typeof _selectHexPlant === 'function') _selectHexPlant(0, p);
      });
      break;

    case 'collect':
      // Uproot wild-born plant to greenhouse
      if (window.mintPlant) {
        window._lwConfirm({
          title: 'COLLECT PLANT',
          body: 'Uproot this wild plant and add it to your greenhouse? It will be permanently removed from the wild.',
          yes: 'COLLECT',
          no: 'LEAVE IT',
          danger: false
        }, function() {
          mintPlant(p.hash).then(function(ok) {
            if (ok !== false) {
              // Remove from wild
              var wild = _getWild();
              for (var ri = wild.length - 1; ri >= 0; ri--) {
                if (wild[ri] && wild[ri].hash === p.hash) { wild.splice(ri, 1); break; }
              }
              _saveWild(wild);
              _toast('Plant collected to greenhouse!');
              _closeHexInspector();
              _drawZoneHexes();
              if (window.syncVaultToCloud) setTimeout(syncVaultToCloud, 500);
            }
          });
        });
      } else { _toast('Collect system loading...'); }
      break;

    // NOTE: old 'inspect' case (greenhouse carousel lookup) removed —
    // superseded by the new case 'inspect' earlier in this switch that
    // uses _openPlantDetails and works for any plant regardless of store.

    case 'defense':
      if (typeof _pickDefense === 'function') _pickDefense(p.hash);
      else _toast('Defense picker loading...');
      break;
  }
};

// Expose a getter for shared markers so _openPlantDetails (and other
// cross-module code) can look up stranger wild plants by hash.
function _getSharedMarker(hash){try{return (_sharedMarkers&&_sharedMarkers[hash])?_sharedMarkers[hash]:null;}catch(e){return null;}}
// Expose the toast helper globally so non-Wild tabs can surface
// status messages without silently falling through their window._toast
// nullability checks (the #w-toast element is position:fixed, so it
// works from any tab).
window._toast = _toast;
return{activate:activate,toggleMenu:toggleMenu,showTP:showTP,closeTP:closeTP,useFC:useFC,openPicker:openPicker,closePicker:closePicker,_dropFromBP:_dropFromBP,_pickDefense:_pickDefense,_afMarkWildEntry:_afMarkWildEntry,_unsubShared:_unsubscribeSharedDrops,_startSeasons:_startSeasonalParticles,_stopSeasons:_stopSeasonalParticles,_recenter:_recenter,_logTip:_logTip,_doReproduction:_doReproduction,_wildReproduction:_wildReproduction,_fetchReproWeather:_fetchReproWeather,_drawZoneHexes:_drawZoneHexes,_openHexInspector:_openHexInspector,_getSharedMarker:_getSharedMarker};
})();
