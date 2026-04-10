// ═══ LUCID WINDS — core.js ═══
// Shared infrastructure loaded by every page
// Error handler, Firebase, hashToTraits, FG_Data, FG_Audio
// ════════════════════════════════════════════

// ── MULTI-PAGE NAVIGATION ──
// window._lwPage is set by each HTML page before this loads.
// switchTab() routes to the correct page or switches panels within a page.
(function(){
  var PAGE = window._lwPage || 'game';
  var PAGE_MAP = {
    game: 'game.html',
    greenhouse: 'greenhouse.html',
    nursery: 'greenhouse.html#nursery',
    dashboard: 'greenhouse.html#dashboard',
    binder: 'greenhouse.html#binder',
    wild: 'wild.html'
  };
  // Tabs that live on the greenhouse page
  var GH_TABS = {greenhouse:1, nursery:1, dashboard:1, binder:1};

  window.switchTab = function(tab) {
    // If we're already on the right page, do local panel switching
    if (PAGE === tab) return;
    if (PAGE === 'greenhouse' && GH_TABS[tab]) {
      // Local panel switch within greenhouse page
      if (window._ghShowPanel) window._ghShowPanel(tab);
      return;
    }
    // Navigate to a different page
    var url = PAGE_MAP[tab];
    if (url) {
      location.href = url;
    }
  };
})();

// ── GLOBAL ERROR CATCHER ──
// GLOBAL ERROR CATCHER — shows script errors visually
console.log('[LW] Build v20260330b');
window._lwBuild='v20260330b';
// Onboarding controlled by PW_Onboard module — do NOT force skip here
window._errLog=[];
window.onerror=function(msg,url,line,col,err){
  // Ignore cross-origin "Script error." — CORS noise from GA4/Firebase
  if(msg==='Script error.'&&!line)return;
  window._errLog.push(line+': '+msg);
  var d=document.getElementById('_errs');
  if(!d){d=document.createElement('div');d.id='_errs';d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999999;background:rgba(192,50,50,0.95);color:#fff;font-family:monospace;font-size:10px;padding:4px 8px;max-height:30vh;overflow:auto;display:none;';document.body.appendChild(d);}
  d.style.display='block';
  d.innerHTML+='<div>L'+line+': '+msg+'</div>';
};
// DEBUG: build overlay disabled for production

// ── OFFLINE WARNING BANNER ──
// ── OFFLINE WARNING BANNER — detect Firebase unavailability ──────────────
(function(){
  window._showOfflineBanner = function() {
    var b = document.getElementById('lw-offline-banner');
    if (b) b.style.display = 'block';
  };
  window._hideOfflineBanner = function() {
    var b = document.getElementById('lw-offline-banner');
    if (b) b.style.display = 'none';
  };
  // After page loads, check if Firebase SDK loaded at all
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (!window.firebase || !window.firebase.auth) {
        window._showOfflineBanner();
      }
    }, 4000);
  });
})();

// ── PERFORMANCE TIER DETECTION ──
    var dominated = false;
    var cores = navigator.hardwareConcurrency || 2;
    var mem = navigator.deviceMemory || 0;
    if (cores <= 4) dominated = true;
    if (mem > 0 && mem <= 4) dominated = true;
    var ua = navigator.userAgent || '';
    // Old iPhones/iPads — deviceMemory not available in Safari so detect by OS version
    if (/iPhone|iPad|iPod/.test(ua)) {
      var m = ua.match(/OS (\d+)/);
      if (m && parseInt(m[1], 10) < 16) dominated = true;
      // iPhone with 2 cores = iPhone 5S/6/6S era
      if (cores <= 2) dominated = true;
    }
    if (/Android/.test(ua) && cores <= 4) dominated = true;
    if (dominated) {
      document.documentElement.classList.add('perf-lite');
    }
    window._perfLite = dominated;

// ── VERSION CHECK — force reload on deploy ──
var LW_VERSION='2026.04.10.13';
(function(){
  var stored=localStorage.getItem('lw_version');
  if(stored&&stored!==LW_VERSION){
    if(!stored||stored<'2026.04.01'){
      localStorage.removeItem('fg_wild_plants');
      localStorage.removeItem('fg_ferals');
      localStorage.removeItem('fg_af_harvests');
      localStorage.removeItem('fg_w_d');
      localStorage.removeItem('fg_pouch');
      localStorage.removeItem('fg_feral_breed_date');
      console.log('[LW] Cleared stale wild data for fresh start.');
    }
    if(!stored||stored<'2026.04.01.5'){
      localStorage.removeItem('pw_onboarded');
      console.log('[LW] Reset onboarding flag — cinematic will play.');
    }
    if(!stored||stored<'2026.04.01.18'){
      localStorage.removeItem('fg_af_harvests');
      console.log('[LW] Reset anti-farming timer for new 10min window.');
    }
    localStorage.setItem('lw_version',LW_VERSION);
    console.log('[LW] Version changed: '+stored+' → '+LW_VERSION+'. Reloading.');
    var _cbUrl=location.href.split('?')[0]+'?v='+LW_VERSION;
    location.replace(_cbUrl);
    return;
  }
  localStorage.setItem('lw_version',LW_VERSION);
})();

// ── REFERRAL TRACKING + GA4 SESSION ──
(function(){
  var CK=7776000;
  function sR(r){var c=r.trim();if(!c)return;localStorage.setItem('sws_ref',c);sessionStorage.setItem('sws_ref',c);document.cookie='sws_ref='+c+'; path=/; max-age='+CK+'; SameSite=Lax';}
  function gR(){return localStorage.getItem('sws_ref')||sessionStorage.getItem('sws_ref')||(document.cookie.split('; ').find(function(r){return r.startsWith('sws_ref=');})||'').split('=')[1]||'';}
  var u=new URLSearchParams(window.location.search).get('ref');
  var isNew=false;
  if(u){sR(u);isNew=true;}else{var s=gR();if(s)sR(s);}
  if(typeof gtag==='undefined')return;
  var isReturning=localStorage.getItem('pw_onboarded')==='1';
  var isMobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var screenW=window.screen?window.screen.width:0;
  var screenH=window.screen?window.screen.height:0;
  var ref=gR();
  if(ref){
    gtag('config','G-XE58S4X6RX',{
      'campaign_source':ref,
      'campaign_medium':'referral',
      'campaign_name':'ref_'+ref
    });
    if(isNew){
      gtag('event','referral_arrival',{
        'event_category':'acquisition',
        'event_label':ref,
        'ref_code':ref
      });
    }
  }else{
    gtag('config','G-XE58S4X6RX');
  }
  gtag('set','user_properties',{
    'ref_code':ref||'direct',
    'is_returning':isReturning?'yes':'no',
    'device_type':isMobile?'mobile':'desktop',
    'screen_size':screenW+'x'+screenH
  });
  gtag('event','session_start_lw',{
    returning:isReturning,
    device:isMobile?'mobile':'desktop',
    screen:screenW+'x'+screenH,
    ref_code:ref||'direct'
  });
  window._swsRef=ref||'';
})();

// ── FIREBASE BOOTSTRAP ──
  // ── SWS Firebase Bootstrap — init ONLY. All auth logic runs inside the game IIFE. ──
  var firebaseConfig = {
    apiKey:            'AIzaSyBAE_JvPixhHwt4ziu8LdZ7HAszd9T58zY',
    authDomain:        'focus-grove-fffa8.firebaseapp.com',
    projectId:         'focus-grove-fffa8',
    storageBucket:     'focus-grove-fffa8.firebasestorage.app',
    messagingSenderId: '739627513827',
    appId:             '1:739627513827:web:3d4088a90fd388730652d6'
  };
  firebase.initializeApp(firebaseConfig);
  var db   = firebase.firestore();
  // Enable offline persistence — queues writes during outage, replays on reconnect
  db.enablePersistence({synchronizeTabs:true}).catch(function(err){
    if(err.code==='failed-precondition')console.warn('Firestore persistence: multiple tabs open');
    else if(err.code==='unimplemented')console.warn('Firestore persistence: browser unsupported');
  });
  var auth = firebase.auth();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){
    // Incognito/private browsing may block LOCAL (IndexedDB). Fall back to SESSION.
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(function(){});
  });

  // set-102: Handle mobile redirect return (signInWithRedirect fallback)
  auth.getRedirectResult()
    .then(function(result) {
      if (result && result.user) {
        if (window._swsLog) _swsLog('✓ Redirect sign-in returned: ' + result.user.email, 'ok');
      }
    })
    .catch(function(err) {
      if (err.code && err.code !== 'auth/no-auth-event') {
        if (window._swsLog) _swsLog('✗ Redirect error: ' + err.code + ' — ' + err.message, 'err');
      }
    });

// ── PHASE 1: DATA LAYER (hashToTraits, FG_Data) ──
(function(){
  'use strict';

  // ── Storage helpers ──
  function _ls(key){ try{ return JSON.parse(localStorage.getItem(key)); }catch(e){ return null; } }
  function _ss(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} }

  // ── UTC date string ──
  function _today(){ return new Date().toISOString().split('T')[0]; }

  // ─────────────────────────────────────────────────────────────────────────
  // hashToTraits v3 — window-exposed, overwrites game IIFE version at runtime
  // Slot map: 0-15 traits, 16-17 mutation byte, 18-19 mythic byte,
  //           20 base, 21 companion, 22-63 entropy reserve
  // ─────────────────────────────────────────────────────────────────────────
  var _PAL = ['pine','sage','terra','sand','cream','moss','slate','teal','copper','ash','plum','amber','rust','rose','violet','gold'];

  window.hashToTraits = function hashToTraits(hash){
    var h = (hash||'').toLowerCase();
    while(h.length < 64) h += '0';
    function hc(i){ return parseInt(h[i],16)||0; }
    function hb(i){ return parseInt(h[i]+h[i+1],16)||0; }

    var mutByte  = hb(16);
    var mythByte = hb(18);

    var mutName =
      mutByte >= 0xFC ? 'Glitch'          :
      mutByte >= 0xF8 ? 'Glass Stem'      :
      mutByte >= 0xF4 ? 'Wireframe'       :
      mutByte >= 0xF0 ? 'Holographic'     :
      mutByte >= 0xEC ? 'Neon'            :
      mutByte >= 0xE8 ? 'Ink Wash'        :
      mutByte >= 0xE4 ? 'Golden'          :
      mutByte >= 0xE0 ? 'Porcelain'       :
      mutByte >= 0xDC ? 'Bioluminescent'  :
      mutByte >= 0xD8 ? 'Pixel Art'       :
      mutByte >= 0xD4 ? 'Silhouette'      :
      mutByte >= 0xD0 ? 'Albino'          :
      mutByte >= 0xCC ? 'Fossil'          :
      'None';

    // Phase 3 mythic rarity — set-103-8-14: Beholder pushed to 0xFF (0.39%)
    // Tier distribution across 256 values:
    //   0xFF       → The Beholder      (1/256 = 0.39%)   COSMIC
    //   0xFE       → Starfall           (1/256 = 0.39%)   LEGENDARY
    //   0xFC-0xFD  → Storm Wraith       (2/256 = 0.78%)   LEGENDARY
    //   0xF8-0xFB  → Raccoon (4/256 = 1.56%)   LEGENDARY
    //   0xF4-0xF7  → Biolum Pulse       (4/256 = 1.56%)   LEGENDARY
    //   0xE0-0xF3  → The Phoenix         (20/256 = 7.81%)  MYTHIC
    //   0xD0-0xDF  → The Toad           (16/256 = 6.25%)  MYTHIC
    //   0x00-0xCF  → None               (208/256 = 81.25%)
    var mythName =
      mythByte === 0xFF ? 'The Beholder'          :
      mythByte >= 0xFE  ? 'Garden Spider'              :
      mythByte >= 0xFC  ? 'Great Blue Heron'          :
      mythByte >= 0xF8  ? 'Raccoon'    :
      mythByte >= 0xF4  ? 'Woolly Mammoth'  :
      mythByte >= 0xE0  ? 'The Phoenix'          :
      mythByte >= 0xD0  ? 'The Toad'              : 'None';

    var goldenPot   = hc(0)  === 15;
    var glowFlower  = hc(11) === 15;
    var crystalBase = hc(20) === 15;

    return {
      pot:          goldenPot  ? 15 : hb(0) % 60, // 60 pot types (0-59)
      potColor:     _PAL[hc(1)],
      stem:         (mythByte >= 0xD0) ? 9 : ((hb(2) % 24) === 9 ? 0 : hb(2) % 24),
      stemColor:    hb(5) % 12,
      stemHeight:   22 + hc(3) * 2.5,
      leafType:     hb(4) % 71, // 71 leaf types (0-70)
      leafCount:    5 + (hc(5) % 6),
      leafSize:     8 + (hc(6) % 7),
      leafColors:   [_PAL[hc(7)],_PAL[hc(8)],_PAL[hc(9)]],
      hasFlower:    hc(10) > 4,
      flower:       glowFlower ? 15 : hb(11) % 71, // 71 flower types (0-70)
      flowerColor:  _PAL[hc(12)],
      flowerSize:   6 + (hc(13) % 7),
      chimerGen:    1, // default gen 1; breeding sets this to parent max + 1
      leafSpread:   7 + (hc(14) % 6),
      aura:         hb(15) % 36,  // 0-35 aura slots (0-4 = none)
      base:         crystalBase ? 15 : hb(20) % 71,
      // Companion: base rate ~20% (48 None + 12 creatures), mythic creatures override
      companion:    (function(){
        var _mb = hb(18);
        if (_mb === 0xFF) return 38; // Beholder (0.39%)
        if (_mb >= 0xFE) return 37;  // Garden Spider (0.39%)
        if (_mb >= 0xFC) return 36;  // Great Blue Heron (0.78%)
        if (_mb >= 0xF8) return 35;  // Raccoon (1.56%)
        if (_mb >= 0xF4) return 34;  // Woolly Mammoth (1.56%)
        if (_mb >= 0xE0) return 33;  // Phoenix (7.81%)
        if (_mb >= 0xD0) return 32;  // Toad (6.25%)
        return hb(21) % 82;          // 82 slots: 48 None + 34 creatures = ~41% base rate
      })(),
      mutation:     mutByte,
      mutationName: mutName,
      mythic:       mythByte,
      mythicName:   mythName,
      isRare: goldenPot||glowFlower||crystalBase||mutName!=='None'||mythName!=='None',
      season: hb(22) % 4  // 0=Spring, 1=Summer, 2=Autumn, 3=Winter
    };
  };

  // ═══ SEASON SYSTEM ═══
  var SEASON_DATA = [
    {name:'Spring', emblem:'\ud83c\udf38', color:'#E8A0BF', months:[2,3,4]},
    {name:'Summer', emblem:'\u2600\ufe0f', color:'#F0D060', months:[5,6,7]},
    {name:'Autumn', emblem:'\ud83c\udf42', color:'#D4842A', months:[8,9,10]},
    {name:'Winter', emblem:'\u2744\ufe0f', color:'#A0C4E8', months:[11,0,1]}
  ];
  window.SEASON_DATA = SEASON_DATA;

  // Internal helper: season info for a single season index
  function _seasonInfoForIdx(sIdx) {
    var sd = SEASON_DATA[sIdx % 4];
    var currentMonth = new Date().getMonth();
    var inPeak = sd.months.indexOf(currentMonth) >= 0;
    var adjMonths = [];
    for (var i = 0; i < sd.months.length; i++) {
      adjMonths.push((sd.months[i] + 11) % 12);
      adjMonths.push((sd.months[i] + 1) % 12);
    }
    var isAdjacent = !inPeak && adjMonths.indexOf(currentMonth) >= 0;
    return {
      name: sd.name, emblem: sd.emblem, color: sd.color,
      inPeak: inPeak, isAdjacent: isAdjacent,
      eaBonus: inPeak ? 2 : (isAdjacent ? 1 : 0),
      stressMod: inPeak ? 0.5 : (isAdjacent ? 1.0 : 1.5),
      pollenMod: inPeak ? 1.5 : (isAdjacent ? 1.0 : 0.5)
    };
  }

  // plant param is optional — when provided AND chimera gen 2+, grants
  // dual-season immunity: best bonus from own season + both parent seasons
  window.getSeasonInfo = function(traits, plant) {
    var s = (traits && typeof traits.season === 'number') ? traits.season % 4 : 0;
    var best = _seasonInfoForIdx(s);

    // Dual immunity for chimeras with two different-season parents
    if (plant && plant.parentAHash && plant.parentBHash && (plant.generation || 1) > 1) {
      try {
        var sA = (parseInt(plant.parentAHash[22] + plant.parentAHash[23], 16) || 0) % 4;
        var sB = (parseInt(plant.parentBHash[22] + plant.parentBHash[23], 16) || 0) % 4;
        var parentSeasons = [];
        if (sA !== s) parentSeasons.push(sA);
        if (sB !== s && sB !== sA) parentSeasons.push(sB);
        for (var p = 0; p < parentSeasons.length; p++) {
          var pi = _seasonInfoForIdx(parentSeasons[p]);
          if (pi.eaBonus > best.eaBonus) best.eaBonus = pi.eaBonus;
          if (pi.stressMod < best.stressMod) best.stressMod = pi.stressMod;
          if (pi.pollenMod > best.pollenMod) best.pollenMod = pi.pollenMod;
          if (pi.inPeak) best.inPeak = true;
          if (pi.isAdjacent && !best.inPeak) best.isAdjacent = true;
        }
      } catch (e) { /* fall through to own-season only */ }
    }
    return best;
  };

  // HTML badge for any card/panel
  window.seasonBadge = function(traits) {
    var si = window.getSeasonInfo(traits);
    return '<span style="display:inline-flex;align-items:center;gap:2px;font-size:0.4rem;color:' + si.color + ';background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;border:1px solid ' + si.color + '33;" title="' + si.name + (si.inPeak ? ' (Peak!)' : '') + '">' + si.emblem + ' ' + si.name + '</span>';
  };

  // ═══ EVOLUTIONARY ADVANTAGE (EA) SCORE ═══
  // Every trait layer contributes logically: rarity ≠ power
  // Director: "Glass stem would actually be -1 even though it's rare because glass is weak"
  window.computeEA = function(traits, days, plant) {
    if (!traits) return 0;
    var ea = 0;
    // LEAF TYPE (0-3)
    var lt = traits.leafType % 71;
    if (lt >= 46) ea += 3; else if (lt >= 30) ea += 2; else if (lt >= 16) ea += 1;
    // STEM TYPE (0-2)
    var st = traits.stem % 24;
    if (st === 5 || st === 6 || st === 7 || st === 8) ea += 2;
    else if (st === 3 || st === 4) ea += 1;
    // BLOOM (0-4)
    if (traits.hasFlower) {
      var fl = traits.flower % 71;
      if (fl === 15 || fl >= 34) ea += 3; else if (fl >= 20) ea += 2; else if (fl >= 10) ea += 1;
    }
    // POT (0-1)
    if (traits.pot === 15 || traits.pot >= 20) ea += 1;
    // COMPANION (0-5)
    var comp = traits.companion;
    if (comp === 38) ea += 5; else if (comp === 37) ea += 4;
    else if (comp >= 34 && comp <= 36) ea += 3; else if (comp >= 32) ea += 3;
    else if (comp >= 20) ea += 1;
    // AURA (0-3)
    if (traits.aura >= 15) ea += 3; else if (traits.aura >= 8) ea += 2; else if (traits.aura >= 1) ea += 1;
    // MUTATION: rare ≠ strong
    var mut = traits.mutationName;
    if (mut === 'Wireframe') ea += 1;
    else if (mut === 'Glass Stem') ea -= 1;
    else if (mut === 'Glitch') ea -= 1;
    // SUBSTRATE (0-2)
    var base = traits.base % 71;
    // Rare substrates (Crystal=15, Meteorite=28, Mycelium=29): +1 EA
    // Legendary+ substrates (56-61): +2 EA
    if (base >= 56) ea += 2; else if (base === 15 || base === 28 || base === 29 || (base >= 52 && base <= 55)) ea += 1;
    // SEASON (0-2) — chimeras get dual immunity via plant param
    // Mammoth Permafrost: ignore seasonal stress, +2 in off-season
    var _compInfoEA = window.getCompanionInfo ? getCompanionInfo(traits) : null;
    if (_compInfoEA && _compInfoEA.abilityKey === 'permafrost') {
      ea += 2; // Always +2 regardless of season (normally 0 in off-season)
    } else if (window.getSeasonInfo) {
      ea += window.getSeasonInfo(traits, plant).eaBonus;
    }
    // AGE (0-3)
    var d = days || 0;
    if (d >= 90) ea += 3; else if (d >= 30) ea += 2; else if (d >= 7) ea += 1;
    // SYNERGY BONUS (cosmetic + EA only, never affects Terra Grade)
    var syn = window.getSynergy ? window.getSynergy(traits) : null;
    if (syn) ea += syn.ea;
    // CHIMERA PENALTY: -2 per gen
    var gen = (traits.chimerGen || 1) - 1;
    if (gen > 0) ea -= gen * 2;
    return Math.max(0, ea);
  };
  window.eaBadge = function(ea, gc) {
    var c = gc || '#8a9a7a';
    if (ea >= 20) c = '#ff6ec7'; else if (ea >= 15) c = '#f1c40f'; else if (ea >= 10) c = '#9b59b6';
    return '<span style="font-family:Bebas Neue,sans-serif;font-size:0.5rem;color:' + c + ';background:rgba(0,0,0,0.4);padding:1px 5px;border-radius:3px;border:1px solid ' + c + '44;">EA ' + ea + '</span>';
  };

  // ═══ SYNERGY ENGINE (set-39) ═══════════════════════════════════════════
  // 40 synergies. Two traits from different layers must align.
  // First match wins — one synergy max per plant. Never affects Terra Grade.
  // EA bonus stacks with existing EA. Visual effect rendered separately.
  var _SYNERGIES = [
    // ELEMENTAL
    {id:1, name:'Frozen Flame',      a:function(t){return t.flower%71===67;},     b:function(t){return t.leafType%71===61;},  ea:2, theme:'elemental', fx:'leaves flicker orange↔ice-blue'},
    {id:2, name:'Magma Heart',       a:function(t){return t.base%71===17;},       b:function(t){return t.aura%36===20;},      ea:2, theme:'elemental', fx:'molten cracks pulse through substrate'},
    {id:3, name:'Permafrost',        a:function(t){return t.season===3;},         b:function(t){return t.leafType%71===67;},  ea:1, theme:'elemental', fx:'ice crystals creep along leaf edges'},
    {id:4, name:'Ember Drift',       a:function(t){return t.flower%71===66;},     b:function(t){return t.base%71===59;},      ea:2, theme:'elemental', fx:'ember particles rise from base'},
    {id:5, name:'Stormglass',        a:function(t){return t.stem%24===22;},       b:function(t){return t.aura%36===19;},      ea:2, theme:'elemental', fx:'prismatic shards refract through stem'},
    {id:6, name:'Sunstroke',         a:function(t){return t.season===1;},         b:function(t){return t.aura%36===6;},       ea:1, theme:'elemental', fx:'deep amber bathes entire plant'},
    {id:7, name:'Monsoon Bloom',     a:function(t){return t.season===0;},         b:function(t){return t.flower%71===3;},     ea:1, theme:'elemental', fx:'rain-drop ripples radiate from bloom'},
    {id:8, name:'Bonfire Vigil',     a:function(t){return t.pot%71===50;},        b:function(t){return t.companion===23;},    ea:1, theme:'elemental', fx:'fireflies orbit cauldron rim with gold trails'},
    {id:9, name:'Scorched Earth',    a:function(t){return t.base%71===57;},       b:function(t){return t.stem%24===12;},      ea:2, theme:'elemental', fx:'bark shifts to charcoal with glowing grain'},
    {id:10,name:'Static Charge',     a:function(t){return t.stem%24===6;},        b:function(t){return t.leafType%71===60;},  ea:1, theme:'elemental', fx:'spark particles jump between leaf tips'},
    // NATURE
    {id:11,name:'Symbiosis',         a:function(t){return t.base%71===18;},       b:function(t){return t.companion===27;},    ea:1, theme:'nature', fx:'mycelium threads connect substrate to snail'},
    {id:12,name:"Pollinator's Crown",a:function(t){return t.flower%71===10;},     b:function(t){return t.companion===28;},    ea:2, theme:'nature', fx:'iridescent pollen motes swirl to hummingbird'},
    {id:13,name:'Old Growth',        a:function(t){return t.stem%24===4;},        b:function(t){return t.base%71===9;},       ea:1, theme:'nature', fx:'moss creeps up lower trunk, breathing slowly'},
    {id:14,name:'Hedge Witch',       a:function(t){return t.pot%71===53;},        b:function(t){return t.companion===43;},    ea:2, theme:'nature', fx:'green runes orbit skull eye sockets'},
    {id:15,name:'Nectar Tide',       a:function(t){return t.flower%71===2;},      b:function(t){return t.companion===24;},    ea:1, theme:'nature', fx:'butterfly wings pulse with hibiscus color'},
    {id:16,name:'Web Garden',        a:function(t){return t.aura%36===17;},       b:function(t){return t.companion===31;},    ea:2, theme:'nature', fx:'dew drops bead along web strands'},
    {id:17,name:'Bamboo Grove',      a:function(t){return t.stem%24===13;},       b:function(t){return t.leafType%71===4;},   ea:1, theme:'nature', fx:'leaves sway in unison like a single gust'},
    {id:18,name:'Fern Hollow',       a:function(t){return t.stem%24===14;},       b:function(t){return t.leafType%71===6;},   ea:1, theme:'nature', fx:'tiny fronds peek from hollow trunk opening'},
    {id:19,name:'Autumn Harvest',    a:function(t){return t.season===2;},         b:function(t){return t.leafType%71===7;},   ea:1, theme:'nature', fx:'one leaf drifts down and fades each cycle'},
    {id:20,name:'Coral Reef',        a:function(t){return t.stem%24===9;},        b:function(t){return t.base%71===8;},       ea:1, theme:'nature', fx:'caustic light ripples across pebble substrate'},
    // COSMIC
    {id:21,name:'Stardust Crown',    a:function(t){return t.base%71===56;},       b:function(t){return t.flower%71===15;},    ea:2, theme:'cosmic', fx:'bloom white-hot, stardust streams upward'},
    {id:22,name:'Meteor Garden',     a:function(t){return t.base%71===28;},       b:function(t){return t.aura%36===8;},       ea:2, theme:'cosmic', fx:'meteorite streaks fall through aura'},
    {id:23,name:'Lunar Tide',        a:function(t){return t.leafType%71===63;},   b:function(t){return t.aura%36===7;},       ea:2, theme:'cosmic', fx:'leaves glow silver, cast circular light pools'},
    {id:24,name:'Aurora Veil',       a:function(t){return t.aura%36===5;},        b:function(t){return t.flower%71===5;},     ea:1, theme:'cosmic', fx:'aurora colors bleed into tulip petals'},
    {id:25,name:'Seed Nexus',        a:function(t){return t.aura%36===9;},        b:function(t){return t.pot%71===57;},       ea:2, theme:'cosmic', fx:'sacred geometry pulses between pot and aura'},
    {id:26,name:'Clock Garden',      a:function(t){return t.flower%71===69;},     b:function(t){return t.stem%24===3;},       ea:1, theme:'cosmic', fx:'clock ticks in real time, stem sways as pendulum'},
    {id:27,name:'Holographic Prism', a:function(t){return t.mutationName==='Holographic';}, b:function(t){return t.leafType%71===9;}, ea:2, theme:'cosmic', fx:'needles split into full rainbow refraction'},
    {id:28,name:'Stained Vigil',     a:function(t){return t.aura%36===35;},       b:function(t){return t.stem%24===23;},      ea:2, theme:'cosmic', fx:'colored light panels project onto iron trunk'},
    {id:29,name:'Void Gate',         a:function(t){return t.flower%71===68;},     b:function(t){return t.aura%36===29;},      ea:2, theme:'cosmic', fx:'black hole distortion warps around bloom'},
    {id:30,name:'Neon Pulse',        a:function(t){return t.mutationName==='Neon';}, b:function(t){return t.stem%24===7;},     ea:1, theme:'cosmic', fx:'both stems alternate neon pink and cyan'},
    // DARK
    {id:31,name:'Miasma Pitcher',    a:function(t){return t.aura%36===18;},       b:function(t){return t.flower%71===34;},    ea:2, theme:'dark', fx:'toxic vapor pours from pitcher into aura'},
    {id:32,name:'Bone Altar',        a:function(t){return t.pot%71===51;},        b:function(t){return t.base%71===15;},      ea:1, theme:'dark', fx:'crystals glow within, illuminating egg cracks'},
    {id:33,name:"Titan's Maw",       a:function(t){return t.flower%71===36;},     b:function(t){return t.companion===32;},    ea:2, theme:'dark', fx:'toad mesmerized; purple scent-lines waft from bloom'},
    {id:34,name:'Fossil Memory',     a:function(t){return t.mutationName==='Fossil';}, b:function(t){return t.base%71===52;}, ea:1, theme:'dark', fx:'fossil imprint extends into substrate'},
    {id:35,name:'Shadow Loom',       a:function(t){return t.mutationName==='Silhouette';}, b:function(t){return t.leafType%71===68;}, ea:2, theme:'dark', fx:'void petals show inverted starfield texture'},
    // MYTHICAL
    {id:36,name:'Dragon Keep',       a:function(t){return t.flower%71===35;},     b:function(t){return t.pot%71===56;},       ea:2, theme:'mythical', fx:'amphora glows with firelight, dragon casts shadows'},
    {id:37,name:"Alchemist's Rose",  a:function(t){return t.pot%71===15;},        b:function(t){return t.flower%71===1;},     ea:1, theme:'mythical', fx:'rose petals shift to metallic gold at tips'},
    {id:38,name:"Beholder's Gaze",   a:function(t){return t.companion===38;},     b:function(t){return t.leafType%71===62;},  ea:2, theme:'mythical', fx:'beholder eye tracks largest frond with green scan'},
    {id:39,name:'Phoenix Pyre',      a:function(t){return t.companion===33;},     b:function(t){return t.stem%24===10;},      ea:2, theme:'mythical', fx:'phoenix perches on succulent, embers drift upward'},
    {id:40,name:'Wise Owl Roost',    a:function(t){return t.companion===57;},     b:function(t){return t.stem%24===5;},       ea:1, theme:'mythical', fx:'owl perches in braid junction, golden eye blink'},
    // ── BOTANICAL (set-apr8) — based on real plant biology ──
    {id:41,name:'Mycorrhizal Web',   a:function(t){return t.base%71===29;},       b:function(t){return t.leafType%71>=60;},   ea:2, theme:'nature', fx:'fungal threads connect mycelium to crystal roots'},
    {id:42,name:'Carnivore Bog',     a:function(t){return t.base%71===18;},       b:function(t){return t.flower%71===34;},    ea:2, theme:'nature', fx:'pitcher bloom drips into mushroom compost below'},
    {id:43,name:'Dew Collector',     a:function(t){return t.base%71===9;},        b:function(t){return t.leafType%71===22;},  ea:1, theme:'nature', fx:'morning fog pools on elephant ears above living moss'},
    {id:44,name:'Sun Carpet',        a:function(t){return t.base%71===11;},       b:function(t){return t.season===1;},        ea:1, theme:'nature', fx:'desert sand shimmers in summer heat'},
    {id:45,name:'Fern Hollow',       a:function(t){return t.leafType%71===6;},    b:function(t){return t.companion===73;},    ea:1, theme:'nature', fx:'fern fronds shelter mushroom sprite in dappled shade'},
    {id:46,name:'Volcanic Orchid',   a:function(t){return t.base%71===10;},       b:function(t){return t.flower%71===10;},    ea:2, theme:'nature', fx:'orchid roots grip volcanic rock, steam wisps rise'},
    {id:47,name:'Moonlit Lotus',     a:function(t){return t.flower%71===3;},      b:function(t){return t.base%71===59;},      ea:2, theme:'cosmic', fx:'lotus glows silver on moonstone dust, water rings expand'},
    {id:48,name:'Frost Fern',        a:function(t){return t.leafType%71===6;},    b:function(t){return t.season===3;},        ea:1, theme:'elemental', fx:'ice crystals trace fern fractal pattern on fronds'},
    {id:49,name:'Obsidian Mirror',   a:function(t){return t.base%71===17;},       b:function(t){return t.mutationName==='Glass Stem';}, ea:2, theme:'dark', fx:'glass stem reflects in obsidian surface, doubled silhouette'},
    {id:50,name:'Butterfly Garden',  a:function(t){return t.companion===24;},     b:function(t){return t.flower%71===2;},     ea:1, theme:'nature', fx:'butterfly circles hibiscus bloom in lazy spiral'},
    {id:51,name:'Toad Stool',        a:function(t){return t.companion===32;},     b:function(t){return t.base%71===18;},      ea:2, theme:'nature', fx:'toad sits in mushroom compost, content and mossy'},
    {id:52,name:'Terrarium World',   a:function(t){return t.pot%60===7;},         b:function(t){return t.companion>=20&&t.companion<=31;}, ea:1, theme:'nature', fx:'glass terrarium frames tiny companion in miniature world'},
    {id:53,name:'Meteor Orchid',     a:function(t){return t.base%71===28;},       b:function(t){return t.flower%71===10;},    ea:2, theme:'cosmic', fx:'orchid roots weave through meteorite, stardust on petals'},
    {id:54,name:'Phoenix Ash Bed',   a:function(t){return t.base%71===57;},       b:function(t){return t.companion===33;},    ea:3, theme:'mythical', fx:'phoenix nests in its own ash, renewal cycle complete'},
    {id:55,name:'Crystal Beetle',    a:function(t){return t.companion===78;},     b:function(t){return t.base%71===15;},      ea:2, theme:'cosmic', fx:'beetle carapace refracts crystal matrix light'},
    {id:56,name:'Lantern Firefly',   a:function(t){return t.pot%60===21;},        b:function(t){return t.companion===23;},    ea:1, theme:'nature', fx:'firefly drifts into lantern pot, warm glow intensifies'},
    {id:57,name:'Needle Rain',       a:function(t){return t.leafType%71===9;},    b:function(t){return t.season===2;},        ea:1, theme:'nature', fx:'autumn needles drift down like copper rain'},
    {id:58,name:'Dragon Egg Hatch',  a:function(t){return t.pot%60===51;},        b:function(t){return t.flower%71===35;},    ea:2, theme:'mythical', fx:'dragon arum unfurls from cracked egg, steam and spice'},
    {id:59,name:'Jellyfish Drift',   a:function(t){return t.companion===72;},     b:function(t){return t.aura%36>=5&&t.aura%36<=10;}, ea:2, theme:'cosmic', fx:'jellyfish trails bioluminescent tendrils through aurora aura'},
    {id:60,name:'Will-o-Wisp Trail', a:function(t){return t.companion===79;},     b:function(t){return t.base%71===29;},      ea:2, theme:'dark', fx:'wisp drifts along mycelium network lines, eerie green glow'}
  ];

  // Get ALL synergies for a plant (capped at 3 displayed, +4 EA max)
  window.getSynergy = function(traits) {
    if (!traits) return null;
    var all = [];
    for (var i = 0; i < _SYNERGIES.length; i++) {
      var s = _SYNERGIES[i];
      try { if (s.a(traits) && s.b(traits)) all.push({ id:s.id, name:s.name, ea:s.ea, theme:s.theme, fx:s.fx, emoji:s.emoji||'' }); } catch(e) {}
    }
    if (all.length === 0) return null;
    // Sort by EA descending, cap at 3 displayed
    all.sort(function(a,b){ return b.ea - a.ea; });
    var displayed = all.slice(0, 3);
    // Cap total EA at +4
    var totalEA = 0;
    for (var j = 0; j < displayed.length; j++) {
      totalEA += displayed[j].ea;
      if (totalEA > 4) { displayed[j].ea = Math.max(0, displayed[j].ea - (totalEA - 4)); totalEA = 4; }
    }
    // Return first for backward compatibility (EA calc uses .ea)
    // but attach .all for display purposes
    var result = displayed[0];
    result.ea = 0;
    for (var k = 0; k < displayed.length; k++) result.ea += displayed[k].ea;
    result.all = displayed;
    result.totalFound = all.length;
    return result;
  };

  // ═══ HARDINESS SCORE ═══════════════════════════════════════════════════
  // Composite durability metric from trait layers, breed layers, compost
  // heritage, generation, and Terra Grade. Scale: 1.0 (fragile) – 7.0 (Cosmic).
  window.getHardiness = function(traits, plant) {
    if (!traits) return 1;
    var h = 1;
    if (traits.aura >= 1) h += 0.5;
    if (traits.base >= 7) h += 0.5;
    if (traits.hasFlower) h += 0.25;
    if (traits.mutationName === 'Wireframe') h += 1;
    if (traits.mutationName === 'Glass Stem') h += 1;
    if (traits.mutationName === 'Glitch') h += 1.5;
    if (traits.companion >= 32 && traits.companion <= 33) h += 1;
    if (traits.companion >= 34 && traits.companion <= 36) h += 1.5;
    if (traits.companion >= 37) h += 2;
    if (plant && plant.breedLayers) {
      var bl = plant.breedLayers;
      var layerCount = 0;
      if (bl.chimeraVein) layerCount++;
      if (bl.vigorBand) layerCount++;
      if (bl.spectrumLeaf) layerCount++;
      if (bl.thornedCrown) layerCount++;
      if (bl.rootTendrils) layerCount++;
      if (bl.canopyWeave) layerCount++;
      if (bl.biolumSpots) layerCount++;
      if (bl.aerialRoot) layerCount++;
      h += layerCount * 0.5;
    }
    if (plant && plant.mycelialCrown) h += 2;
    var gen = (plant && plant.generation) ? plant.generation : (traits.chimerGen || 1);
    if (gen > 1) h += (gen - 1) * 0.5;
    var tg = null;
    try { tg = window.getTerraGrade(traits); } catch(e) {}
    if (tg && tg.name === 'Cosmic') {
      h = 7;
    } else {
      h = Math.min(6.5, h);
    }
    return Math.round(h * 10) / 10;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Seven tiers, scored by stacking rare trait signals. No double-dipping.
  // Exposed as window.getTerraGrade(traits) for cross-team use.
  //
  //   MODEL H TIER THRESHOLDS — Loot Distribution Master Spec
  //   TIER         SCORE    COLOR     TARGET %
  //   ─────────────────────────────────────────────────────
  //   Common       0-1      #959588   ~42%
  //   Uncommon     2-3      #8CB86E   ~28%
  //   Rare         4-5      #5b8fb9   ~16%
  //   Epic         6-7      #9B59B6   ~9%
  //   Legendary    8-9      #C8A84B   ~3.5%
  //   Mythic       10-11    #A87285   ~1.2%
  //   Cosmic       12+      #D94FFF   ~0.3%
  //
  var _TERRA_GRADES = [
    { name:'Common',    minScore:0,  color:'#959588', icon:'○' },
    { name:'Uncommon',  minScore:2,  color:'#8CB86E', icon:'◈' },
    { name:'Rare',      minScore:4,  color:'#5b8fb9', icon:'◆' },
    { name:'Epic',      minScore:6,  color:'#9B59B6', icon:'◇' },
    { name:'Legendary', minScore:8,  color:'#C8A84B', icon:'✦' },
    { name:'Mythic',    minScore:10, color:'#A87285', icon:'★' },
    { name:'Cosmic',    minScore:12, color:'#D94FFF', icon:'✧' }
  ];

  // ═══ MODEL H SCORING ENGINE — Loot Distribution Master Spec ═══
  // 5 base slots (best-of pairing) + 2 spikes (mutation, mythic)
  // + earned layers (breed, compost, synergy)
  // Inspired by D&D, Diablo 2, Path of Exile loot curves.
  window.getTerraGrade = function(t) {
    if (!t) return _TERRA_GRADES[0];
    var score = 0;

    // ── SLOT 1: VESSEL — best of (pot rarity, substrate rarity) ── max +3
    var potS = 0;
    if (t.pot === 15) potS = 2;  // Golden Pot (Legendary)
    else {
      var _p = t.pot % 60;
      // Rare pots: Terrarium(7), Amphora(21), Cauldron(22), Urn(23), Bonsai(27), Stone(28)
      if (_p===7||_p===21||_p===22||_p===23||_p===27||_p===28) potS = 1;
      // Epic pots (expanded): Cauldron(50), Geode(51), Fossil Bowl(52), Obsidian Crucible(53), Glass Orb(54)
      if (_p===50||_p===51||_p===52||_p===53||_p===54) potS = 1;
      // Legendary pots: Ancient Amphora(56), Philosopher's Vessel(57), Moonstone Urn(58)
      if (_p===56||_p===57||_p===58) potS = 2;
      // Mythic pot: World Seed Cradle(59)
      if (_p===59) potS = 3;
    }
    var subS = 0;
    var _b = t.base % 71;
    // Rare substrates: Crystal(15), Sulfuric(16), Obsidian(17), Meteorite(28), Mycelium(29)
    if (_b===15||_b===16||_b===17||_b===28||_b===29) subS = 1;
    // Epic substrates: Amber(52), Biolum Soil(53), Magnetic Sand(54), Fossil Bed(55)
    if (_b===52||_b===53||_b===54||_b===55) subS = 1;
    // Legendary substrates: Stardust(56), Dragon Bone Ash(57), Quicksilver(58)
    if (_b===56||_b===57||_b===58) subS = 2;
    // Mythic substrates: Phoenix Ash(59), Void Essence(60), Moonstone Dust(61)
    if (_b===59||_b===60||_b===61) subS = 3;
    score += (potS > subS ? potS : subS);

    // ── SLOT 2: FOLIAGE — best of (stem rarity, leaf rarity) ── max +2
    var stemS = 0;
    var _st = t.stem % 24;
    // Epic stems: Ancient Bark(12), Hollow Trunk(14)
    if (_st===12||_st===14) stemS = 1;
    // Legendary stems: Crystal Spine(22), Iron Trunk(23)
    if (_st===22||_st===23) stemS = 2;
    var leafS = 0;
    var _lt = t.leafType % 71;
    // Epic leaves: Crown Laurel(40)-Jellyleaf(49)
    if (_lt>=40&&_lt<=49) leafS = 1;
    // Legendary leaves: Crystal Shard(60), Ember Leaf(61), Feather Frond(62)
    if (_lt>=60&&_lt<=62) leafS = 2;
    // Mythic leaves: Void Petal(68), Wishbone(69), Lantern Pod(70)
    if (_lt>=68&&_lt<=70) leafS = 2;
    // Rare expanded: Lunar Disc(63)-Frost Plate(67)
    if (_lt>=63&&_lt<=67) leafS = 1;
    score += (stemS > leafS ? stemS : leafS);

    // ── SLOT 3: BLOOM ── max +3
    if (t.hasFlower) {
      var _bl = t.flower % 71;
      // Mythic bloom: Titan Arum(38) — only one per ~1.4%
      if (_bl===38) score += 3;
      // Legendary blooms: Glow Flower(15), Ghost Orchid(41), Dragon Arum(37), Carrion Starfish(39)
      else if (_bl===15||_bl===41||_bl===37||_bl===39) score += 2;
      // Epic exotics: idx 34-45 (minus the legendaries already counted)
      else if (_bl>=34&&_bl<=45) score += 1;
      // Rare+ expanded: Flame Bloom(66), Ice Rose(67), Void Blossom(68), Clock Flower(69), Prism Bloom(70)
      else if (_bl>=66&&_bl<=70) score += 1;
    }

    // ── SLOT 4: AURA ── max +2
    var _au = t.aura % 36;
    // Legendary auras: Void Eclipse(29), Stained Glass(35)
    if (_au===29||_au===35) score += 2;
    // Epic auras: Spider Web(17), Poison Miasma(18), Frost Crystal(19), Ember Glow(20)
    // + Northern Lights V2(31), Lightning Bugs(33)
    else if ((_au>=17&&_au<=20)||_au===31||_au===33) score += 1;

    // ── SLOT 5: COMPANION — base path only (non-mythic) ── max +2
    if (t.mythic < 0xD0) {
      var _c = t.companion;
      // Rare base creatures: Platypus(40), Pangolin(43), Luna Moth(44),
      // Glow Snail(46), Axolotl(47), Scorpion(48)
      if (_c===40||_c===43||_c===44||_c===46||_c===47||_c===48) score += 1;
      // Epic companions: Origami Crane(49), Gnome(50), Chameleon(69), Jellyfish(72)
      if (_c===49||_c===50||_c===69||_c===72) score += 1;
      // Legendary companions: Raven(75), Crystal Beetle(78), Will-o-Wisp(79)
      if (_c===75||_c===78||_c===79) score += 2;
    }

    // ── SPIKE: MUTATION (0-3) ──
    var _mn = t.mutationName;
    if (_mn==='Wireframe'||_mn==='Albino'||_mn==='Silhouette') score += 1;
    else if (_mn==='Fossil'||_mn==='Glass Stem'||_mn==='Neon'||_mn==='Bioluminescent') score += 2;
    else if (_mn==='Golden'||_mn==='Ink Wash'||_mn==='Porcelain'||_mn==='Glitch'||_mn==='Holographic'||_mn==='Pixel Art') score += 3;

    // ── SPIKE: MYTHIC COMPANION (0-8) ── scored by mythic byte tier
    var _mb = t.mythic;
    if (_mb===0xFF) score += 8;                          // Beholder (Cosmic)
    else if (_mb>=0xFE) score += 7;                      // Starfall
    else if (_mb>=0xFC) score += 6;                      // Storm Wraith
    else if (_mb>=0xF4&&_mb<0xFC) score += 5;            // Biolum Pulse + Ancient Rune
    else if (_mb>=0xD0&&_mb<0xF4) score += 4;            // Toad + Phoenix

    // ── EARNED LAYERS (breeding, composting, synergies) ──

    // Mycelial Crown — composted heritage (+2)
    if (t.mycelialCrown) score += 2;

    // Breed layers (0-8)
    if (t.breedLayers) {
      if (t.breedLayers.chimeraVein) score += 1;
      if (t.breedLayers.vigorBand) score += 1;
      if (t.breedLayers.spectrumLeaf) score += 2;
      if (t.breedLayers.thornedCrown) score += 2;
      if (t.breedLayers.biolumSpots) score += 2;
      if (t.breedLayers.rootTendrils) score += 1;
      if (t.breedLayers.canopyWeave) score += 1;
      if (t.breedLayers.aerialRoot) score += 1;
    }

    // Compost layers (0-7)
    if (t.compostLayers) {
      if (t.compostLayers.mycelialCrown) score += 1;
      if (t.compostLayers.substrateEcho) score += 1;
      if (t.compostLayers.leafMemory) score += 1;
      if (t.compostLayers.auraResidue) score += 1;
      if (t.compostLayers.tierImprint) score += 2;
      if (t.compostLayers.dualHeritage) score += 2;
      if (t.compostLayers.deepRoot) score += 1;
    }

    // Synergy bonuses (0-3)
    if (typeof checkSynergies === 'function') {
      var _syn = checkSynergies(t);
      if (_syn.length >= 1) score += 1;
      if (_syn.length >= 3) score += 2;
      if (_syn.length >= 5) score += 3;
    }

    // Find highest qualifying tier
    var grade = _TERRA_GRADES[0];
    for (var gi = _TERRA_GRADES.length - 1; gi >= 0; gi--) {
      if (score >= _TERRA_GRADES[gi].minScore) { grade = _TERRA_GRADES[gi]; break; }
    }
    return { name: grade.name, color: grade.color, icon: grade.icon, score: score, label: grade.name };
  };

  // _TERRA_GRADES: internal only — not exposed on window (anti-cheat)

  // ═══ BREED LAYER ENGINE — deterministic layer activation at bloom ═══
  // Uses seed hash bytes 40-53 for probability rolls (no Math.random).
  // Max 4 layers per plant. Highest Terra-value layers kept if >4 trigger.
  // Called by _executeBloom after the child hash is computed.
  function evaluateBreedLayers(tA, tB, seedHash, pALayers, pBLayers) {
    function roll(pos) { return parseInt(seedHash[40 + pos] || '8', 16) / 16; }
    var pA = pALayers || {};
    var pB = pBLayers || {};
    var L = {};

    // T1: Chimera Vein — different primary leaf colors, 60%/75%
    var cvOk = tA.leafColors[0] !== tB.leafColors[0];
    L.chimeraVein = cvOk && roll(0) < (pA.chimeraVein || pB.chimeraVein ? 0.75 : 0.60);

    // T1: Vigor Band — stem height diff >= 10, 20%/30%
    var vbOk = Math.abs(tA.stemHeight - tB.stemHeight) >= 10;
    L.vigorBand = vbOk && roll(1) < (pA.vigorBand ? 0.30 : 0.20);

    // T1: Pollen Dusting — both flower, 35%, never inherits
    L.pollenDusting = (tA.hasFlower && tB.hasFlower) && roll(2) < 0.35;

    // T1: Root Tendrils — stem types differ by 3+, 25%/30%
    var rtOk = Math.abs((tA.stem % 15) - (tB.stem % 15)) >= 3;
    L.rootTendrils = rtOk && roll(3) < (pA.rootTendrils || pB.rootTendrils ? 0.30 : 0.25);

    // T2: Hybrid Bloom — both flower, different types, 30%, never inherits
    L.hybridBloom = (tA.hasFlower && tB.hasFlower && (tA.flower % 46) !== (tB.flower % 46)) && roll(4) < 0.30;

    // T2: Spectrum Leaf — 4+ unique leaf colors, 15%/75%
    var allC = {};
    tA.leafColors.forEach(function(c) { allC[c] = 1; });
    tB.leafColors.forEach(function(c) { allC[c] = 1; });
    var slOk = Object.keys(allC).length >= 4;
    L.spectrumLeaf = slOk && roll(5) < (pA.spectrumLeaf || pB.spectrumLeaf ? 0.75 : 0.15);

    // T2: Canopy Weave — both leafCount 4+, 20%/35%
    var cwOk = tA.leafCount >= 4 && tB.leafCount >= 4;
    L.canopyWeave = cwOk && roll(6) < (pA.canopyWeave || pB.canopyWeave ? 0.35 : 0.20);

    // T3: Thorned Crown — Obsidian base (16) + other leafCount 5+, 40%/50%
    var tcOk = ((tA.base % 30 === 16) && tB.leafCount >= 5) || ((tB.base % 30 === 16) && tA.leafCount >= 5);
    L.thornedCrown = tcOk && roll(7) < (pA.thornedCrown || pB.thornedCrown ? 0.50 : 0.40);

    // T3: Bioluminescent Spots — Biolum Pulse mythic (comp 34) + leafSize diff > 3, 30%/35%
    var bsOk = ((tA.companion === 34) || (tB.companion === 34)) && Math.abs(tA.leafSize - tB.leafSize) > 3;
    L.biolumSpots = bsOk && roll(8) < (pA.biolumSpots || pB.biolumSpots ? 0.35 : 0.30);

    // T3: Aerial Root — Hanging pot (case 4) + tall stem (>40), 15%/25%
    var arOk = ((tA.pot === 4) && tB.stemHeight > 40) || ((tB.pot === 4) && tA.stemHeight > 40);
    L.aerialRoot = arOk && roll(9) < (pA.aerialRoot || pB.aerialRoot ? 0.25 : 0.15);

    // Cap at 4 layers — keep highest Terra value
    var _vals = {
      chimeraVein:1, vigorBand:1, pollenDusting:0, rootTendrils:1,
      hybridBloom:1, spectrumLeaf:2, canopyWeave:1,
      thornedCrown:2, biolumSpots:2, aerialRoot:1
    };
    var active = Object.keys(L).filter(function(k) { return L[k]; });
    if (active.length > 4) {
      active.sort(function(a, b) { return (_vals[b] || 0) - (_vals[a] || 0); });
      active.slice(4).forEach(function(k) { L[k] = false; });
    }

    return L;
  }

  window.evaluateBreedLayers = evaluateBreedLayers;

  // ═══ SYNERGY ENGINE — trait combination bonuses ═══════════════════════════
  var SYNERGY_META = [
    { id:'crystalline',  emoji:'💠', name:'Crystalline Harmony',  desc:'Crystal base + Glass Stem mutation',
      test: function(t){ return (t.base >= 25) && (t.mutation >= 0xE0 && t.mutation < 0xF0); } },
    { id:'deepglow',     emoji:'🔮', name:'Deep Glow',            desc:'Biolum aura + rare flower',
      test: function(t){ return (t.aura >= 18) && t.hasFlower && (t.flower >= 60); } },
    { id:'ancientroots', emoji:'🌿', name:'Ancient Roots',        desc:'Braided stem + Mycelial Crown',
      test: function(t){ return (t.stemType === 'Braided' || (typeof t.stem !== 'undefined' && t.stem > 12)) && t.mycelialCrown; } },
    { id:'chimeraforce', emoji:'⚡', name:'Chimera Force',        desc:'Gen 3+ chimera + breed layer',
      test: function(t){ return (t.chimerGen >= 3) && t.breedLayers && Object.keys(t.breedLayers).some(function(k){ return t.breedLayers[k]; }); } },
    { id:'seasonalecho', emoji:'🌀', name:'Seasonal Echo',        desc:'Compost Substrate Echo + matching season substrate',
      test: function(t){ return t.compostLayers && t.compostLayers.substrateEcho && (t.base >= 20); } },
    { id:'floralcrown',  emoji:'🌸', name:'Floral Crown',         desc:'Rare flower + crown companion',
      test: function(t){ return t.hasFlower && (t.flower >= 55) && (t.companion >= 30 && t.companion < 40); } },
    { id:'mossweave',    emoji:'🍃', name:'Moss Weave',           desc:'5+ leaves + Leaf Memory compost',
      test: function(t){ return (t.leafCount >= 7) && t.compostLayers && t.compostLayers.leafMemory; } },
    { id:'stormborn',    emoji:'⛈', name:'Stormborn',             desc:'Glitch mutation + mythic companion',
      test: function(t){ return (t.mutation >= 0xF0) && (t.companion >= 32 && t.companion <= 38); } },
    { id:'deepheritage', emoji:'📜', name:'Deep Heritage',        desc:'Dual Heritage + Tier Imprint compost',
      test: function(t){ return t.compostLayers && t.compostLayers.dualHeritage && t.compostLayers.tierImprint; } },
    { id:'cosmicbloom',  emoji:'🌌', name:'Cosmic Bloom',         desc:'Cosmic-tier score + any synergy',
      test: function(t){ return false; /* evaluated post-hoc */ } }
  ];

  function checkSynergies(t) {
    if (!t) return [];
    var active = [];
    // Resolve mutation byte for synergy tests
    if (typeof t.mutation === 'undefined' && t.hash) {
      try { t.mutation = parseInt(t.hash.slice(32, 34), 16); } catch(e) { t.mutation = 0; }
    }
    // Resolve stem numeric value
    if (typeof t.stem === 'undefined' && t.hash) {
      try { var _hc2 = parseInt(t.hash[2], 16); t.stem = _hc2; } catch(e) { t.stem = 0; }
    }
    for (var i = 0; i < SYNERGY_META.length; i++) {
      if (SYNERGY_META[i].id === 'cosmicbloom') continue; // post-hoc
      try { if (SYNERGY_META[i].test(t)) active.push(SYNERGY_META[i]); } catch(e) {}
    }
    // Cosmic Bloom: triggered if score >= 18 AND at least 1 other synergy
    if (active.length > 0) {
      try {
        var _tg = getTerraGrade(t);
        if (_tg && _tg.score >= 18) active.push(SYNERGY_META[SYNERGY_META.length - 1]);
      } catch(e) {}
    }
    return active;
  }

  window.checkSynergies = checkSynergies;
  window.SYNERGY_META = SYNERGY_META;

  // ─────────────────────────────────────────────────────────────────────────
  // Cross-Pollination Engine
  // ─────────────────────────────────────────────────────────────────────────
  async function _sha256hex(str){
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('');
  }

  async function crossPollinateHashes(hashA, hashB){
    var nonce = (_ls('sws_pollination_nonce')||0)+1;
    _ss('sws_pollination_nonce', nonce);
    var nonceHex = nonce.toString(16).padStart(8,'0');
    var seed = await _sha256hex(hashA + hashB + nonceHex);
    var a = hashA.toLowerCase().padEnd(64,'0');
    var b = hashB.toLowerCase().padEnd(64,'0');
    var child = seed.split('');

    // Mendelian mixing: positions 0-31
    for(var i=0;i<32;i++){
      var dom = parseInt(seed[i],16);
      if(dom === 15){ child[i] = seed[i+32]||'0'; } // hybrid vigor
      else if(dom < 8){ child[i] = a[i]; }
      else { child[i] = b[i]; }
    }
    // positions 32-63 come from SEED directly (already set)

    // Mendelian recessive overrides (non-mythic, non-mutation traits)
    if(a[0]==='f' && b[0]==='f') child[0]='f';   // Golden Pot
    if(a[11]==='f'&& b[11]==='f') child[11]='f'; // Glow Flower

    // ── INBREEDING DEPRESSION (Critical Systems spec) ──────────────
    // Byte positions: mutation = [16,17], mythic = [18,19]
    // Threshold: 0xD0+ = active trait (Wireframe/Glass/Glitch or Mythic creature)
    var mA=parseInt(a[16]+a[17],16)||0, mB=parseInt(b[16]+b[17],16)||0;
    var yA=parseInt(a[18]+a[19],16)||0, yB=parseInt(b[18]+b[19],16)||0;
    var _sameMut   = mA >= 0xD0 && mB >= 0xD0 && Math.abs(mA - mB) < 16;
    var _sameMythic = yA >= 0xD0 && yB >= 0xD0 && Math.abs(yA - yB) < 16;

    if (_sameMut && _sameMythic) {
      // GENETIC COLLAPSE — both byte pairs rerolled from fresh entropy
      // 0% chance of inheriting either trait
      var _gcSeed = seed.slice(40, 48); // use unused seed bytes
      child[16] = _gcSeed[0] || '4'; child[17] = _gcSeed[1] || '2';
      child[18] = _gcSeed[2] || '3'; child[19] = _gcSeed[3] || '1';
    } else {
      // MUTATION bytes
      if (_sameMut) {
        // Same mutation on both parents → reroll with 70% chance of losing it
        var _mReroll = parseInt(seed[48] || '8', 16);
        if (_mReroll < 11) {
          // 11/16 = ~69% → trait lost, reroll to sub-threshold
          child[16] = seed[49] || '6'; child[17] = seed[50] || '3';
        } else {
          // 5/16 = ~31% → trait survives but at lower tier
          var mLow = Math.max(0xD0, Math.min(mA, mB));
          var mLowHex = mLow.toString(16).padStart(2, '0');
          child[16] = mLowHex[0]; child[17] = mLowHex[1];
        }
      } else if (mA >= 0xD0 && mB >= 0xD0) {
        // Different mutations — normal Mendelian: higher tier wins
        var mHigh = Math.max(mA, mB).toString(16).padStart(2, '0');
        child[16] = mHigh[0]; child[17] = mHigh[1];
      }

      // MYTHIC bytes
      if (_sameMythic) {
        // Same mythic on both parents → reroll with 70% chance of losing it
        var _yReroll = parseInt(seed[51] || '7', 16);
        if (_yReroll < 11) {
          // ~69% → trait lost
          child[18] = seed[52] || '5'; child[19] = seed[53] || '2';
        } else {
          // ~31% → trait survives at lower tier
          var yLow = Math.max(0xD0, Math.min(yA, yB));
          var yLowHex = yLow.toString(16).padStart(2, '0');
          child[18] = yLowHex[0]; child[19] = yLowHex[1];
        }
      } else if (yA >= 0xD0 && yB >= 0xD0) {
        // Different mythics — normal Mendelian: higher tier wins
        var yHigh = Math.max(yA, yB).toString(16).padStart(2, '0');
        child[18] = yHigh[0]; child[19] = yHigh[1];
      }
    }

    return { childHash: child.join(''), nonce: nonce };
  }

  function logAncestry(parentAHash, parentBHash, nonce, childHash){
    var log = _ls('sws_ancestry')||[];
    log.unshift({ parentAHash:parentAHash, parentBHash:parentBHash, nonce:nonce, childHash:childHash, date:_today() });
    if(log.length>20) log=log.slice(0,20);
    _ss('sws_ancestry', log);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Nursery — 3-day watering cycle
  // ─────────────────────────────────────────────────────────────────────────
  function _loadNursery(){ try{var j=window._secureGet?window._secureGet('sws_nursery'):localStorage.getItem('sws_nursery');return JSON.parse(j)||[];}catch(e){return [];} }
  function _saveNursery(n){ if(window._secureSet){window._secureSet('sws_nursery',n);}else{_ss('sws_nursery',n);} }

  var NUR_SLOTS_KEY = 'sws_nursery_slots';
  var NUR_SLOTS_BASE = 3;
  var NUR_SLOTS_MAX = 6;
  function getNurSlots() {
    try {
      var stored = parseInt(localStorage.getItem(NUR_SLOTS_KEY), 10);
      if (stored >= NUR_SLOTS_BASE && stored <= NUR_SLOTS_MAX) return stored;
      return NUR_SLOTS_BASE;
    } catch(e) { return NUR_SLOTS_BASE; }
  }
  function setNurSlots(n) {
    var clamped = Math.max(NUR_SLOTS_BASE, Math.min(NUR_SLOTS_MAX, n));
    localStorage.setItem(NUR_SLOTS_KEY, String(clamped));
    return clamped;
  }

  function addSeed(opts){
    var nursery=_loadNursery();
    var maxSlots = getNurSlots();
    if(nursery.length>=maxSlots) return {ok:false,reason:'NURSERY_FULL'};
    var today=_today();
    var seed={
      id:'nur_'+Date.now()+'_'+Math.floor(Math.random()*1000),
      seedHash:opts.seedHash, parentAHash:opts.parentAHash,
      parentBHash:opts.parentBHash, nonce:opts.nonce||0,
      plantedAt:today, waterLog:[today], status:'growing', nickname:null
    };
    nursery.push(seed);
    _saveNursery(nursery);
    return {ok:true,seed:seed};
  }

  function waterSeed(id){
    var nursery=_loadNursery();
    var idx=nursery.findIndex(function(s){return s.id===id;});
    if(idx<0) return {ok:false,reason:'NOT_FOUND'};
    var seed=nursery[idx];
    if(seed.status!=='growing') return {ok:false,reason:'NOT_GROWING'};
    var today=_today();
    if(seed.waterLog.indexOf(today)>-1) return {ok:false,reason:'ALREADY_WATERED_TODAY'};
    seed.waterLog.push(today);
    var bloomReady=seed.waterLog.length>=3;
    nursery[idx]=seed;
    _saveNursery(nursery);
    return {ok:true,seed:seed,bloomReady:bloomReady};
  }

  function isBloomReady(seed){ return seed&&seed.waterLog.length>=3&&seed.status==='growing'; }
  function canWaterToday(seed){ return seed&&seed.waterLog.indexOf(_today())<0&&seed.status==='growing'; }

  function bloomSeed(id){
    var nursery=_loadNursery();
    var idx=nursery.findIndex(function(s){return s.id===id;});
    if(idx<0) return {ok:false,reason:'NOT_FOUND'};
    var seed=nursery[idx];
    if(!isBloomReady(seed)) return {ok:false,reason:'NOT_READY'};
    var result={ok:true,seedHash:seed.seedHash,ancestry:{parentAHash:seed.parentAHash,parentBHash:seed.parentBHash,nonce:seed.nonce}};
    nursery.splice(idx,1);
    _saveNursery(nursery);
    return result;
  }

  function removeSeed(id){
    var nursery=_loadNursery();
    _saveNursery(nursery.filter(function(s){return s.id!==id;}));
    return {ok:true};
  }

  function getNursery(){ return _loadNursery(); }

  // ─────────────────────────────────────────────────────────────────────────
  // Streak — Grove Rhythm
  // ─────────────────────────────────────────────────────────────────────────
  function _loadStreak(){
    return _ls('sws_streak')||{currentStreak:0,longestStreak:0,lastActiveDate:null,totalActiveDays:0,mercySeeds:1,claimedMilestones:[]};
  }
  function _saveStreak(s){ _ss('sws_streak',s); }

  function recordActivity(){
    var s=_loadStreak();
    var today=_today();
    var yesterday=new Date(Date.now()-86400000).toISOString().split('T')[0];

    if(s.lastActiveDate===today) return {ok:true,streak:s,newMilestones:[]};

    if(s.lastActiveDate===yesterday){
      s.currentStreak++;
    } else if(s.lastActiveDate && s.lastActiveDate!==yesterday){
      // Missed a day — auto-consume mercy seed
      if(s.mercySeeds>0){
        s.mercySeeds--;
        s.currentStreak++;
      } else {
        s.currentStreak=1;
      }
    } else {
      s.currentStreak=1;
    }

    s.lastActiveDate=today;
    s.totalActiveDays=(s.totalActiveDays||0)+1;
    if(s.currentStreak>s.longestStreak) s.longestStreak=s.currentStreak;

    var MILESTONES=[3,7,14,30];
    var newMilestones=MILESTONES.filter(function(m){
      return s.currentStreak>=m && (s.claimedMilestones||[]).indexOf(m)<0;
    });

    _saveStreak(s);
    return {ok:true,streak:s,newMilestones:newMilestones};
  }

  function claimMilestone(days){
    var s=_loadStreak();
    if(!s.claimedMilestones) s.claimedMilestones=[];
    if(s.claimedMilestones.indexOf(days)<0) s.claimedMilestones.push(days);
    if(days===30) s.mercySeeds=(s.mercySeeds||0)+1;
    _saveStreak(s);
  }

  function getStreak(){ return _loadStreak(); }
  function useMercySeed(){
    var s=_loadStreak();
    if(s.mercySeeds>0){ s.mercySeeds--; _saveStreak(s); return {ok:true}; }
    return {ok:false,reason:'NO_MERCY_SEEDS'};
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BREEDING LIFECYCLE (set-apr8)
  // ─────────────────────────────────────────────────────────────────────────
  var BREED_COOLDOWNS = {
    Common:3, Uncommon:5, Rare:7, Epic:10, Legendary:14, Mythic:21, Cosmic:28
  };
  var MATURITY_DAYS = 0; // Disabled for beta testing — re-enable at launch (was 7)
  var MAX_CHARGES = 3;
  var CHARGE_RECOVERY_DAYS = 14;

  // Get a plant's current breed status
  function getBreedStatus(plant){
    if(!plant)return{canBreed:false,reason:'NO_PLANT'};
    var now=Date.now();
    var born=plant.born||plant.mintedAt||null;
    // If no born timestamp, plant predates the maturity system — treat as mature
    var ageDays=(born!==null&&born>0)?Math.floor((now-born)/86400000):999;

    // Maturity check (only for plants with known birth date)
    if(ageDays<MATURITY_DAYS){
      return{canBreed:false,reason:'IMMATURE',daysLeft:MATURITY_DAYS-ageDays,ageDays:ageDays,charges:MAX_CHARGES};
    }

    // Compute current charges (recoverable system)
    var charges=plant.breedCharges;
    if(typeof charges==='undefined'||charges===null){
      // Legacy plant: convert from old breedCount system
      var used=plant.breedCount||0;
      charges=Math.max(0,MAX_CHARGES-used);
    }
    // Recover charges over time
    var lastRecovery=plant.breedChargeLastRecovery||plant.lastBreedDate||(born||now);
    var daysSinceRecovery=Math.max(0,Math.floor((now-lastRecovery)/86400000));
    var recovered=Math.floor(daysSinceRecovery/CHARGE_RECOVERY_DAYS);
    if(recovered>0&&charges<MAX_CHARGES){
      charges=Math.min(MAX_CHARGES,charges+recovered);
    }

    if(charges<=0){
      // Calculate next recovery
      var nextRecoveryDays=CHARGE_RECOVERY_DAYS-(daysSinceRecovery%CHARGE_RECOVERY_DAYS);
      return{canBreed:false,reason:'NO_CHARGES',charges:0,nextRecoveryDays:nextRecoveryDays,ageDays:ageDays};
    }

    // Cooldown check
    var lastBreed=plant.lastBreedDate||0;
    if(lastBreed){
      var t=window.hashToTraits?window.hashToTraits(plant.hash):null;
      var tg=window.getTerraGrade&&t?window.getTerraGrade(t):{name:'Common'};
      var baseCooldown=BREED_COOLDOWNS[tg.name]||3;
      // Season modifier
      var seasonMod=1;
      if(t&&window.getSeasonInfo){
        var si=window.getSeasonInfo(t,plant);
        if(si.isPeak)seasonMod=0.5;
        else if(si.isOpposite)seasonMod=2;
      }
      var cooldownMs=baseCooldown*seasonMod*86400000;
      var elapsed=now-lastBreed;
      if(elapsed<cooldownMs){
        var hoursLeft=Math.ceil((cooldownMs-elapsed)/3600000);
        return{canBreed:false,reason:'COOLDOWN',hoursLeft:hoursLeft,charges:charges,ageDays:ageDays,cooldownDays:Math.ceil(hoursLeft/24)};
      }
    }

    return{canBreed:true,charges:charges,ageDays:ageDays};
  }

  // Use a breed charge (call after successful breed)
  function useBreedCharge(plantHash){
    var gh=[];try{gh=JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');}catch(e){return;}
    var found=false;
    gh.forEach(function(p){
      if(p.hash===plantHash){
        // Compute current charges first
        var status=getBreedStatus(p);
        p.breedCharges=Math.max(0,(status.charges||0)-1);
        p.lastBreedDate=Date.now();
        p.breedChargeLastRecovery=Date.now();
        p.breedCount=(p.breedCount||0)+1;
        found=true;
      }
    });
    if(found&&window.saveGreenhouse)saveGreenhouse(gh);
  }

  // Format breed status for UI display
  function formatBreedStatus(status){
    if(!status)return'Unknown';
    if(status.reason==='IMMATURE')return'Seedling — '+status.daysLeft+' day'+(status.daysLeft!==1?'s':'')+' to maturity';
    if(status.reason==='NO_CHARGES')return'Resting — charge recovers in '+status.nextRecoveryDays+' day'+(status.nextRecoveryDays!==1?'s':'');
    if(status.reason==='COOLDOWN')return'Cooldown — '+status.cooldownDays+' day'+(status.cooldownDays!==1?'s':'')+' remaining';
    if(status.canBreed)return status.charges+'/'+MAX_CHARGES+' charges available';
    return'Cannot breed';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────
  window.FG_Data = {
    crossPollinateHashes: crossPollinateHashes,
    logAncestry: logAncestry,
    addSeed: addSeed,
    waterSeed: waterSeed,
    bloomSeed: bloomSeed,
    removeSeed: removeSeed,
    getNursery: getNursery,
    isBloomReady: isBloomReady,
    canWaterToday: canWaterToday,
    recordActivity: recordActivity,
    claimMilestone: claimMilestone,
    getStreak: getStreak,
    useMercySeed: useMercySeed,
    getNurSlots: getNurSlots,
    setNurSlots: setNurSlots,
    getBreedStatus: getBreedStatus,
    useBreedCharge: useBreedCharge,
    formatBreedStatus: formatBreedStatus,
    MATURITY_DAYS: MATURITY_DAYS,
    MAX_CHARGES: MAX_CHARGES
  };

}());

// ── PHASE 2: AUDIO ENGINE ──
(function(){
  'use strict';

  var _ctx = null;
  var _masterGain = null;
  var _droneGain, _h1Gain, _h2Gain, _h3Gain, _noiseGain;
  var _prewarmed = false;
  var _enabled = false;
  var _volume = 0.7;
  var _rarityTier = 0;

  // Persist prefs
  (function(){
    try{
      var p=JSON.parse(localStorage.getItem('sws_audio')||'{}');
      if(typeof p.enabled==='boolean') _enabled=p.enabled;
      if(typeof p.volume==='number') _volume=p.volume;
    }catch(e){}
  })();

  function _savePrefs(){ try{localStorage.setItem('sws_audio',JSON.stringify({enabled:_enabled,volume:_volume}));}catch(e){} }

  // ── AudioContext singleton ──
  function _getCtx(){
    if(!_ctx){
      _ctx = new (window.AudioContext||window.webkitAudioContext)();
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = _enabled ? _volume : 0;
      _masterGain.connect(_ctx.destination);
      _buildSoundscape();
    }
    return _ctx;
  }

  // ── White noise buffer ──
  function _makeNoise(){
    var ctx=_getCtx();
    var buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    return buf;
  }

  // ── Persistent 5-node soundscape graph ──
  function _buildSoundscape(){
    var ctx=_ctx;
    var now=ctx.currentTime;

    // Drone osc A1
    var drone=ctx.createOscillator(); drone.type='sine'; drone.frequency.value=55;
    _droneGain=ctx.createGain(); _droneGain.gain.value=0;
    drone.connect(_droneGain); _droneGain.connect(_masterGain); drone.start(now);

    // H1 osc A2
    var h1=ctx.createOscillator(); h1.type='sine'; h1.frequency.value=110;
    _h1Gain=ctx.createGain(); _h1Gain.gain.value=0;
    h1.connect(_h1Gain); _h1Gain.connect(_masterGain); h1.start(now);

    // H2 osc E3
    var h2=ctx.createOscillator(); h2.type='triangle'; h2.frequency.value=165;
    _h2Gain=ctx.createGain(); _h2Gain.gain.value=0;
    h2.connect(_h2Gain); _h2Gain.connect(_masterGain); h2.start(now);

    // H3 osc A3
    var h3=ctx.createOscillator(); h3.type='sine'; h3.frequency.value=220;
    _h3Gain=ctx.createGain(); _h3Gain.gain.value=0;
    h3.connect(_h3Gain); _h3Gain.connect(_masterGain); h3.start(now);

    // Bandpass noise
    var nSrc=ctx.createBufferSource(); nSrc.buffer=_makeNoise(); nSrc.loop=true;
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=400; bp.Q.value=0.8;
    nSrc.connect(bp);
    _noiseGain=ctx.createGain(); _noiseGain.gain.value=0;
    bp.connect(_noiseGain); _noiseGain.connect(_masterGain); nSrc.start(now);
  }

  // Gain tables per rarity tier [drone,h1,h2,h3,noise]
  var RARITY_GAINS = [
    [0.040,0.000,0.000,0.000,0.030], // 0 Common
    [0.070,0.020,0.000,0.000,0.020], // 1 Uncommon
    [0.110,0.060,0.030,0.000,0.010], // 2 Rare
    [0.160,0.120,0.080,0.040,0.000]  // 3 Mythic
  ];

  function _applySoundscapeTier(tier){
    if(!_ctx||!_droneGain) return;
    var g=RARITY_GAINS[Math.min(3,Math.max(0,tier))];
    var now=_ctx.currentTime;
    var end=now+2.5;
    [_droneGain,_h1Gain,_h2Gain,_h3Gain,_noiseGain].forEach(function(gn,i){
      gn.gain.linearRampToValueAtTime(g[i]*(_enabled?_volume:0),end);
    });
  }

  // ── Pre-warm on first interaction ──
  function _prewarm(){
    if(_prewarmed) return;
    _prewarmed=true;
    _getCtx();
    if(_enabled) _applySoundscapeTier(_rarityTier);
  }
  ['touchstart','mousedown','keydown'].forEach(function(ev){
    document.addEventListener(ev,_prewarm,{once:true,passive:true});
  });

  // Suspend/resume on tab visibility
  document.addEventListener('visibilitychange',function(){
    if(!_ctx) return;
    if(document.hidden) _ctx.suspend(); else _ctx.resume();
  });

  // ── Trios Chimes — C-E-G ascending triad ──
  // ── Trios — Zen singing-bowl chord swell ──
  // Pure sine triad C-E-G, slow attack (0.35s), long sustain, gentle 2.5s release.
  // Max gain capped at 0.15 — extremely calm, meditative.
  // Phase 14 verified: pure-sine singing-bowl · 0.35s attack · 2.8s release · maxGain=0.15
  var BOWL_FREQS = [261.63, 329.63, 392.00]; // C4 E4 G4 — pure major triad
  function playChime(cardIdx){
    if(!_enabled) return;
    var ctx=_getCtx();
    if(ctx.state==='suspended') ctx.resume();
    // Play the full triad simultaneously on first call; ignore cardIdx 1 & 2
    if(cardIdx !== 0) return;
    var now = ctx.currentTime;
    var maxGain = 0.15; // hard ceiling — never harsh

    BOWL_FREQS.forEach(function(freq, k){
      // Slight stagger so chord blooms like petals opening (0, 80, 160 ms)
      var onset = now + k * 0.08;
      // Fundamental — pure sine, slow attack
      var osc = ctx.createOscillator(); osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (k === 1 ? 2 : -1); // gentle detuning for warmth
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, onset);
      g.gain.linearRampToValueAtTime(maxGain * _volume * (k === 1 ? 0.9 : 1.0), onset + 0.35); // slow swell
      g.gain.setValueAtTime(maxGain * _volume * (k === 1 ? 0.9 : 1.0), onset + 0.8);           // sustain
      g.gain.linearRampToValueAtTime(0.0001, onset + 2.8);                                      // long gentle release
      osc.connect(g); g.connect(_masterGain);
      osc.start(onset); osc.stop(onset + 3.0);

      // Octave sub for body — very quiet
      var sub = ctx.createOscillator(); sub.type = 'sine';
      sub.frequency.value = freq / 2;
      var sg = ctx.createGain();
      sg.gain.setValueAtTime(0, onset);
      sg.gain.linearRampToValueAtTime(maxGain * 0.28 * _volume, onset + 0.5);
      sg.gain.linearRampToValueAtTime(0.0001, onset + 2.2);
      sub.connect(sg); sg.connect(_masterGain);
      sub.start(onset); sub.stop(onset + 2.4);
    });
  }

  // ── Mint Gong — triple-layer 3.2s decay ──
  function playGong(){
    if(!_enabled) return;
    var ctx=_getCtx();
    if(ctx.state==='suspended') ctx.resume();
    var now=ctx.currentTime;

    // Layer 1 — bronze fundamental (sawtooth → lowpass)
    var osc1=ctx.createOscillator(); osc1.type='sawtooth'; osc1.frequency.value=80;
    var flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=180; flt.Q.value=8;
    var g1=ctx.createGain();
    g1.gain.setValueAtTime(0,now);
    g1.gain.linearRampToValueAtTime(0.55*_volume,now+0.01);
    g1.gain.exponentialRampToValueAtTime(0.001,now+3.2);
    osc1.connect(flt); flt.connect(g1); g1.connect(_masterGain);
    osc1.start(now); osc1.stop(now+3.3);

    // Layer 2 — metallic shimmer A5
    var osc2=ctx.createOscillator(); osc2.type='triangle'; osc2.frequency.value=880;
    var g2=ctx.createGain();
    g2.gain.setValueAtTime(0,now);
    g2.gain.linearRampToValueAtTime(0.18*_volume,now+0.01);
    g2.gain.exponentialRampToValueAtTime(0.001,now+1.8);
    osc2.connect(g2); g2.connect(_masterGain);
    osc2.start(now); osc2.stop(now+2.0);

    // Layer 3 — feedback delay room tail
    var osc3=ctx.createOscillator(); osc3.type='sine'; osc3.frequency.value=110;
    var gn1=ctx.createGain(); gn1.gain.value=1;
    var delay=ctx.createDelay(); delay.delayTime.value=0.24;
    var lpf=ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value=800;
    var fb=ctx.createGain(); fb.gain.value=0.35; // < 1 → self-terminating
    var tailGain=ctx.createGain();
    tailGain.gain.setValueAtTime(0,now);
    tailGain.gain.linearRampToValueAtTime(0.30*_volume,now+0.01);
    tailGain.gain.exponentialRampToValueAtTime(0.001,now+2.8);
    osc3.connect(gn1);
    gn1.connect(delay); delay.connect(lpf); lpf.connect(fb); fb.connect(delay);
    lpf.connect(tailGain); tailGain.connect(_masterGain);
    osc3.start(now); osc3.stop(now+3.0);

    // Haptic
    if(navigator.vibrate) navigator.vibrate([0,0,80,40,30]);
  }

  function getRarityTier(hash){
    if(!hash) return 0;
    var t=window.hashToTraits ? window.hashToTraits(hash) : null;
    if(!t) return 0;
    if(t.mythicName&&t.mythicName!=='None') return 3;
    if(t.mutationName&&t.mutationName!=='None') return 2;
    if(t.isRare) return 1;
    return 0;
  }
  // ── Card Select — woody 'tock' click ──
  function playClick(){
    if(!_enabled) return;
    var ctx=_getCtx();
    if(ctx.state==='suspended') ctx.resume();
    var now=ctx.currentTime;
    // Sharp transient: filtered noise burst
    var buf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.06),ctx.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.008));
    var src2=ctx.createBufferSource(); src2.buffer=buf;
    // Bandpass centred ~600 Hz for 'wood' character
    var bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=620; bp.Q.value=4;
    var g=ctx.createGain();
    g.gain.setValueAtTime(0.38*_volume,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+0.055);
    src2.connect(bp); bp.connect(g); g.connect(_masterGain);
    src2.start(now);
  }

  // ── Invalid Match — low dull thud ──
  function playThud(){
    if(!_enabled) return;
    var ctx=_getCtx();
    if(ctx.state==='suspended') ctx.resume();
    var now=ctx.currentTime;
    // Sub-bass sine with fast pitch drop (body hit)
    var osc=ctx.createOscillator(); osc.type='sine';
    osc.frequency.setValueAtTime(120,now);
    osc.frequency.exponentialRampToValueAtTime(40,now+0.18);
    var g=ctx.createGain();
    g.gain.setValueAtTime(0,now);
    g.gain.linearRampToValueAtTime(0.55*_volume,now+0.006);
    g.gain.exponentialRampToValueAtTime(0.001,now+0.22);
    osc.connect(g); g.connect(_masterGain);
    osc.start(now); osc.stop(now+0.25);
    // Noise thud layer
    var nbuf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.12),ctx.sampleRate);
    var nd=nbuf.getChannelData(0);
    for(var i=0;i<nd.length;i++) nd[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.025));
    var ns=ctx.createBufferSource(); ns.buffer=nbuf;
    var lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=180;
    var ng=ctx.createGain(); ng.gain.setValueAtTime(0.28*_volume,now);
    ng.gain.exponentialRampToValueAtTime(0.001,now+0.12);
    ns.connect(lp); lp.connect(ng); ng.connect(_masterGain);
    ns.start(now);
  }

  // ── Plant Minted — deep botanical drone, 4 s evolving fade ──
  function playMintDrone(){
    if(!_enabled) return;
    var ctx=_getCtx();
    if(ctx.state==='suspended') ctx.resume();
    var now=ctx.currentTime;
    // Root harmonic A2
    var o1=ctx.createOscillator(); o1.type='sine'; o1.frequency.value=55;
    o1.detune.value=4; // slight beat
    var g1=ctx.createGain();
    g1.gain.setValueAtTime(0,now);
    g1.gain.linearRampToValueAtTime(0.45*_volume,now+0.35);
    g1.gain.linearRampToValueAtTime(0.30*_volume,now+2.0);
    g1.gain.exponentialRampToValueAtTime(0.001,now+4.2);
    o1.connect(g1); g1.connect(_masterGain); o1.start(now); o1.stop(now+4.3);
    // 5th E3
    var o2=ctx.createOscillator(); o2.type='triangle'; o2.frequency.value=82.4;
    var g2=ctx.createGain();
    g2.gain.setValueAtTime(0,now+0.1);
    g2.gain.linearRampToValueAtTime(0.22*_volume,now+0.6);
    g2.gain.exponentialRampToValueAtTime(0.001,now+3.8);
    o2.connect(g2); g2.connect(_masterGain); o2.start(now+0.1); o2.stop(now+4.0);
    // Bright shimmer A4 — enters late for 'evolution'
    var o3=ctx.createOscillator(); o3.type='sine'; o3.frequency.value=440;
    var g3=ctx.createGain();
    g3.gain.setValueAtTime(0,now+1.2);
    g3.gain.linearRampToValueAtTime(0.12*_volume,now+1.7);
    g3.gain.exponentialRampToValueAtTime(0.001,now+4.0);
    o3.connect(g3); g3.connect(_masterGain); o3.start(now+1.2); o3.stop(now+4.1);
    // Filtered noise breath
    var nbuf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*4.0),ctx.sampleRate);
    var nd=nbuf.getChannelData(0);
    for(var i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
    var ns=ctx.createBufferSource(); ns.buffer=nbuf;
    var bp2=ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.frequency.value=220; bp2.Q.value=1.2;
    var ng=ctx.createGain();
    ng.gain.setValueAtTime(0,now);
    ng.gain.linearRampToValueAtTime(0.08*_volume,now+0.8);
    ng.gain.exponentialRampToValueAtTime(0.001,now+4.0);
    ns.connect(bp2); bp2.connect(ng); ng.connect(_masterGain); ns.start(now);
  }

  // ── Wild Ambient Sound ──
  var _ambientNode=null,_ambientGain=null;
  function startWildAmbient(){
    if(_ambientNode||!_enabled)return;
    var ctx=_getCtx();if(!ctx||ctx.state!=='running')return;
    // Brown noise (wind) through low-pass filter
    var bufSize=ctx.sampleRate*2;
    var buf=ctx.createBuffer(1,bufSize,ctx.sampleRate);
    var data=buf.getChannelData(0);
    var last=0;
    for(var i=0;i<bufSize;i++){var w=Math.random()*2-1;last=(last+0.02*w)/1.02;data[i]=last*3.5;}
    _ambientNode=ctx.createBufferSource();
    _ambientNode.buffer=buf;_ambientNode.loop=true;
    var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=400;lp.Q.value=0.5;
    _ambientGain=ctx.createGain();_ambientGain.gain.value=0;
    _ambientGain.gain.linearRampToValueAtTime(0.06*_volume,ctx.currentTime+2);
    _ambientNode.connect(lp);lp.connect(_ambientGain);_ambientGain.connect(_masterGain);
    _ambientNode.start();
  }
  function stopWildAmbient(){
    if(!_ambientNode)return;
    try{
      if(_ambientGain){_ambientGain.gain.linearRampToValueAtTime(0,(_ctx?_ctx.currentTime:0)+1.5);}
      setTimeout(function(){try{_ambientNode.stop();_ambientNode.disconnect();}catch(e){}finally{_ambientNode=null;_ambientGain=null;}},2000);
    }catch(e){_ambientNode=null;_ambientGain=null;}
  }
  function playCollectChime(){
    var ctx=_getCtx();if(!ctx||ctx.state!=='running'||!_enabled)return;
    var now=ctx.currentTime;
    // Rising three-note chime (pentatonic: C5, E5, G5)
    var freqs=[523,659,784];
    for(var i=0;i<freqs.length;i++){
      var osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=freqs[i];
      var g=ctx.createGain();g.gain.setValueAtTime(0,now+i*0.12);
      g.gain.linearRampToValueAtTime(0.12*_volume,now+i*0.12+0.03);
      g.gain.exponentialRampToValueAtTime(0.001,now+i*0.12+0.6);
      osc.connect(g);g.connect(_masterGain);osc.start(now+i*0.12);osc.stop(now+i*0.12+0.7);
    }
  }
  function playRevealFanfare(grade){
    var ctx=_getCtx();if(!ctx||ctx.state!=='running'||!_enabled)return;
    var now=ctx.currentTime;
    // Grade determines richness: more notes for rarer plants
    var bases={Common:[262,330],Uncommon:[262,330,392],Rare:[262,330,392,523],Epic:[262,330,392,523,659],Legendary:[262,330,392,523,659,784],Mythic:[262,330,392,523,659,784,988],Cosmic:[262,330,392,523,659,784,988,1047]};
    var freqs=bases[grade]||bases.Common;
    for(var i=0;i<freqs.length;i++){
      var osc=ctx.createOscillator();osc.type=i<3?'sine':'triangle';osc.frequency.value=freqs[i];
      var g=ctx.createGain();g.gain.setValueAtTime(0,now+i*0.1);
      g.gain.linearRampToValueAtTime(0.1*_volume,now+i*0.1+0.04);
      g.gain.exponentialRampToValueAtTime(0.001,now+i*0.1+0.8);
      osc.connect(g);g.connect(_masterGain);osc.start(now+i*0.1);osc.stop(now+i*0.1+0.9);
    }
  }

  // ── Public API ──
  window.FG_Audio = {
    setEnabled: function(b){
      _enabled=b;
      if(_masterGain) _masterGain.gain.value=b?_volume:0;
      _savePrefs();
    },
    setVolume: function(v){
      _volume=Math.min(1,Math.max(0,v));
      if(_masterGain&&_enabled) _masterGain.gain.value=_volume;
      _savePrefs();
    },
    playChime: playChime,
    playGong:  playGong,
    playClick: playClick,
    playThud:  playThud,
    playMintDrone: playMintDrone,
    setRarityTier: function(tier){
      _rarityTier=tier;
      if(_prewarmed) _applySoundscapeTier(tier);
    },
    getRarityTier: getRarityTier,
    startWildAmbient: startWildAmbient,
    stopWildAmbient: stopWildAmbient,
    playCollectChime: playCollectChime,
    playRevealFanfare: playRevealFanfare,
    get enabled(){ return _enabled; }
  };

}());
