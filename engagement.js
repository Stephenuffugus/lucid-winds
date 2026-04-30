// ═══════════════════════════════════════════════════════════════════════════
// LUCID WINDS — ENGAGEMENT SYSTEM v1
//   Lifetime Achievements (250+), Daily Challenges, Weekly Challenges.
//   - Data only. No UI. Stephen designs UI separately.
//   - LW_ACH.bump(counter, n)         increments any counter
//   - LW_ACH.get(counter)             reads a counter
//   - LW_ACH.checkAll()               run on tab switch + LW_Events.fire
//   - LW_ACH.grantReward({type,amt})  routes to earnDew / earnHashes / etc
//   - LW_ACH.dailies()                returns today 3 picks
//   - LW_ACH.weeklies()               returns this week 3 picks
//   - LW_ACH.markDone(id)             optional explicit mark for non-counter
//
// Reward lanes (NEVER cross): Dew (time), Sunbeams (SPARING, never >5/grant),
// Pollen alias = XP via PW_grantXP, BoS lore unlock (cosmetic), trophy entry.
// NO EA, no climate immunity, no rare drops, no free plants, no free Pi.
// ES5 only. No frameworks.
// ═══════════════════════════════════════════════════════════════════════════
(function(){
  'use strict';

  var COUNTERS_KEY = 'lw_ach_counters';
  var PROGRESS_KEY = 'lw_ach_progress';
  var DAILY_KEY    = 'lw_ach_daily';
  var WEEKLY_KEY   = 'lw_ach_weekly';
  var TROPHY_KEY   = 'lw_ach_trophies';

  function _read(k, def){
    try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : def; }
    catch(e){ return def; }
  }
  function _write(k, v){
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){}
  }

  // ─── COUNTERS WRITE BATCHING (perf) ────────────────────────────────────
  // bump() used to parse + stringify + setItem on every call. Hot actions
  // (water/breed/feral/tend) were hammering localStorage 60+ times/sec.
  // Now we hold the counters object in memory and flush every 5s, on
  // visibilitychange, and on beforeunload. Reads always come from cache.
  var _countersCache = null;
  var _countersDirty = false;
  var _countersFlushT = null;
  function _getCounters(){
    if (_countersCache === null) _countersCache = _read(COUNTERS_KEY, {});
    return _countersCache;
  }
  function _markCountersDirty(){
    _countersDirty = true;
    if (_countersFlushT) return;
    _countersFlushT = setTimeout(_flushCounters, 5000);
  }
  function _flushCounters(){
    if (_countersFlushT) { clearTimeout(_countersFlushT); _countersFlushT = null; }
    if (!_countersDirty || _countersCache === null) return;
    _write(COUNTERS_KEY, _countersCache);
    _countersDirty = false;
  }
  try {
    document.addEventListener('visibilitychange', function(){ if (document.hidden) _flushCounters(); });
    window.addEventListener('beforeunload', _flushCounters);
    window.addEventListener('pagehide', _flushCounters);
  } catch(e){}

  // ─── COUNTER STORE ──────────────────────────────────────────────────────
  // Throttled completion-checker. checkAll loops the full catalog so we
  // can't run it on every bump. 1.5s after the last bump we run it once
  // and surface any newly-finished daily / weekly / achievement.
  var _checkPending = null;
  function _scheduleCheck(){
    if (_checkPending) return;
    _checkPending = setTimeout(function(){
      _checkPending = null;
      try {
        var r = checkAll();
        if (!r) return;
        // Daily completions — toast directs player to QUESTS to claim.
        if (r.newDailyDone && r.newDailyDone.length) {
          for (var di = 0; di < r.newDailyDone.length; di++) {
            var de = null;
            for (var dj = 0; dj < DAILIES.length; dj++) if (DAILIES[dj].id === r.newDailyDone[di]) { de = DAILIES[dj]; break; }
            if (de && window._toast) window._toast('☀️ Daily complete: ' + de.name + ' — claim in QUESTS');
          }
        }
        // Weekly completions — same pattern.
        if (r.newWeeklyDone && r.newWeeklyDone.length) {
          for (var wi = 0; wi < r.newWeeklyDone.length; wi++) {
            var we = null;
            for (var wj = 0; wj < WEEKLIES.length; wj++) if (WEEKLIES[wj].id === r.newWeeklyDone[wi]) { we = WEEKLIES[wj]; break; }
            if (we && window._toast) window._toast('🌙 Weekly complete: ' + we.name + ' — claim in QUESTS');
          }
        }
        // Lifetime achievements — same pattern (bigger moment, but still claim-required).
        if (r.newAch && r.newAch.length) {
          for (var ai = 0; ai < r.newAch.length; ai++) {
            var ae = ACH_BY_ID[r.newAch[ai]];
            if (ae && window._toast) {
              var tierEmoji = { bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎', mythic:'✨' }[ae.tier] || '🏆';
              window._toast(tierEmoji + ' ' + ae.name + ' — claim in QUESTS');
            }
            if (ae && ae.tier === 'mythic' && window._haptic) try { window._haptic('bloom'); } catch(e){}
          }
        }
        // Refresh the BoS QUESTS tab badge + the keeper-bar book icon
        // badge so counts drop live as dailies complete.
        // _bosRefreshBadges internally calls _updateBookBadge, but we also
        // call it directly in case the bos-overlay isn't open (the in-book
        // refresh early-returns when the overlay is closed).
        try { if (window._bosRefreshBadges) window._bosRefreshBadges(); } catch(e){}
        try { if (window._updateBookBadge) window._updateBookBadge(); } catch(e){}
      } catch(e){}
    }, 1500);
  }

  function bump(counter, amount){
    if (!counter) return 0;
    if (typeof amount !== 'number' || isNaN(amount)) amount = 1;
    var c = _getCounters();
    c[counter] = (c[counter] || 0) + amount;
    _markCountersDirty();
    _scheduleCheck();
    return c[counter];
  }
  function get(counter){
    return _getCounters()[counter] || 0;
  }
  function setCounter(counter, value){
    var c = _getCounters();
    c[counter] = value;
    _markCountersDirty();
    _scheduleCheck();
    return value;
  }

  // ─── DAY / WEEK KEYS ────────────────────────────────────────────────────
  function _pad2(n){ n = String(n); return n.length < 2 ? '0'+n : n; }
  function _todayKey(){
    var d = new Date();
    return d.getFullYear()+'-'+_pad2(d.getMonth()+1)+'-'+_pad2(d.getDate());
  }
  function _yearDayIndex(d){
    d = d || new Date();
    var start = new Date(d.getFullYear(),0,0);
    var diff  = d - start;
    return Math.floor(diff / 86400000);
  }
  function _mondayOfWeek(){
    var d = new Date();
    var dow = d.getDay() || 7;
    var mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dow - 1));
    return mon.getFullYear()+'-'+_pad2(mon.getMonth()+1)+'-'+_pad2(mon.getDate());
  }
  function _uidHash(){
    try {
      var u = localStorage.getItem('lw_device_id') ||
              localStorage.getItem('_fgDeviceId') ||
              window._fgDeviceId ||
              localStorage.getItem('sws_user_session') ||
              'anon';
      var h = 0;
      for (var i = 0; i < u.length; i++) { h = (h * 31 + u.charCodeAt(i)) | 0; }
      return Math.abs(h);
    } catch(e){ return 7; }
  }

  // ─── LIFETIME ACHIEVEMENT CATALOG ───────────────────────────────────────
  var ACH = [
    {id:'col_first_plant',    tier:'bronze',   category:'COLLECTION', name:'A Pot, A Promise',           desc:'Mint your first plant.',                                              counter:'mint_total',       target:1,    reward:{type:'dew', amt:15}},
    {id:'col_mint_5',         tier:'bronze',   category:'COLLECTION', name:'A Quiet Shelf',              desc:'Mint 5 plants.',                                                       counter:'mint_total',       target:5,    reward:{type:'dew', amt:25}},
    {id:'col_mint_10',        tier:'bronze',   category:'COLLECTION', name:'Ten Friends in Pots',        desc:'Mint 10 plants.',                                                      counter:'mint_total',       target:10,   reward:{type:'dew', amt:40}},
    {id:'col_mint_25',        tier:'silver',   category:'COLLECTION', name:'A Modest Greenhouse',        desc:'Mint 25 plants.',                                                      counter:'mint_total',       target:25,   reward:{type:'dew', amt:80}},
    {id:'col_mint_50',        tier:'silver',   category:'COLLECTION', name:'Half a Hundred',             desc:'Mint 50 plants.',                                                      counter:'mint_total',       target:50,   reward:{type:'dew', amt:120}},
    {id:'col_mint_100',       tier:'gold',     category:'COLLECTION', name:'A Library of Roots',         desc:'Mint 100 plants.',                                                     counter:'mint_total',       target:100,  reward:{type:'dew', amt:200}},
    {id:'col_mint_250',       tier:'gold',     category:'COLLECTION', name:'The Long Patience',          desc:'Mint 250 plants.',                                                     counter:'mint_total',       target:250,  reward:{type:'dew', amt:300}},
    {id:'col_mint_500',       tier:'platinum', category:'COLLECTION', name:'Five Hundred Hands',         desc:'Mint 500 plants.',                                                     counter:'mint_total',       target:500,  reward:{type:'dew', amt:500}},
    {id:'col_mint_1000',      tier:'mythic',   category:'COLLECTION', name:'A Thousand Sunbeams Spent',  desc:'Mint 1,000 plants.',                                                   counter:'mint_total',       target:1000, reward:{type:'trophy', amt:1, name:'A Thousand Hands'}},
    {id:'col_mint_2500',      tier:'mythic',   category:'COLLECTION', name:'The Keeper of Many',         desc:'Mint 2,500 plants.',                                                   counter:'mint_total',       target:2500, reward:{type:'trophy', amt:1, name:'The Keeper of Many'}},

    {id:'col_disc_pot_5',     tier:'bronze',   category:'COLLECTION', name:'Five Vessels',               desc:'Discover 5 different pot designs.',                                    counter:'pots_seen',        target:5,    reward:{type:'dew', amt:20}},
    {id:'col_disc_pot_15',    tier:'silver',   category:'COLLECTION', name:'Fifteen Hands That Hold',    desc:'Discover 15 pot designs.',                                             counter:'pots_seen',        target:15,   reward:{type:'dew', amt:60}},
    {id:'col_disc_pot_30',    tier:'gold',     category:'COLLECTION', name:'A Potter Inventory',         desc:'Discover 30 pot designs.',                                             counter:'pots_seen',        target:30,   reward:{type:'dew', amt:150}},
    {id:'col_disc_pot_45',    tier:'platinum', category:'COLLECTION', name:'Pots Beyond Counting',       desc:'Discover 45 pot designs.',                                             counter:'pots_seen',        target:45,   reward:{type:'dew', amt:300}},
    {id:'col_disc_pot_all',   tier:'mythic',   category:'COLLECTION', name:'Every Vessel, Every Voice',  desc:'Discover all 60 pot designs.',                                         counter:'pots_seen',        target:60,   reward:{type:'trophy', amt:1, name:'Every Vessel'}},

    {id:'col_disc_leaf_10',   tier:'bronze',   category:'COLLECTION', name:'Ten Greens',                 desc:'Discover 10 different leaf forms.',                                    counter:'leaves_seen',      target:10,   reward:{type:'dew', amt:25}},
    {id:'col_disc_leaf_25',   tier:'silver',   category:'COLLECTION', name:'A Field of Shapes',          desc:'Discover 25 leaf forms.',                                              counter:'leaves_seen',      target:25,   reward:{type:'dew', amt:75}},
    {id:'col_disc_leaf_50',   tier:'gold',     category:'COLLECTION', name:'Half the Canopy',            desc:'Discover 50 leaf forms.',                                              counter:'leaves_seen',      target:50,   reward:{type:'dew', amt:200}},
    {id:'col_disc_leaf_all',  tier:'mythic',   category:'COLLECTION', name:'Every Leaf, Named',          desc:'Discover all 71 leaf forms.',                                          counter:'leaves_seen',      target:71,   reward:{type:'trophy', amt:1, name:'Every Leaf'}},

    {id:'col_disc_flow_10',   tier:'bronze',   category:'COLLECTION', name:'Ten Petals',                 desc:'Discover 10 different flower forms.',                                  counter:'flowers_seen',     target:10,   reward:{type:'dew', amt:25}},
    {id:'col_disc_flow_25',   tier:'silver',   category:'COLLECTION', name:'A Dictionary of Blooms',     desc:'Discover 25 flower forms.',                                            counter:'flowers_seen',     target:25,   reward:{type:'dew', amt:75}},
    {id:'col_disc_flow_50',   tier:'gold',     category:'COLLECTION', name:'Half the Field',             desc:'Discover 50 flower forms.',                                            counter:'flowers_seen',     target:50,   reward:{type:'dew', amt:200}},
    {id:'col_disc_flow_all',  tier:'mythic',   category:'COLLECTION', name:'Every Bloom, Remembered',    desc:'Discover all 71 flower forms.',                                        counter:'flowers_seen',     target:71,   reward:{type:'trophy', amt:1, name:'Every Bloom'}},

    {id:'col_disc_comp_5',    tier:'bronze',   category:'COLLECTION', name:'Five Visitors',              desc:'Meet 5 different companion creatures.',                                counter:'companions_seen',  target:5,    reward:{type:'dew', amt:30}},
    {id:'col_disc_comp_15',   tier:'silver',   category:'COLLECTION', name:'A Garden of Guests',         desc:'Meet 15 companion creatures.',                                         counter:'companions_seen',  target:15,   reward:{type:'dew', amt:90}},
    {id:'col_disc_comp_30',   tier:'gold',     category:'COLLECTION', name:'The Quiet Census',           desc:'Meet 30 companion creatures.',                                         counter:'companions_seen',  target:30,   reward:{type:'dew', amt:200}},
    {id:'col_disc_comp_all',  tier:'mythic',   category:'COLLECTION', name:'Every Creature, Welcomed',   desc:'Meet all 55 named companion creatures.',                               counter:'companions_seen',  target:55,   reward:{type:'trophy', amt:1, name:'Every Creature'}},

    {id:'col_disc_sub_5',     tier:'bronze',   category:'COLLECTION', name:'Five Soils',                 desc:'See 5 different substrates.',                                          counter:'substrates_seen',  target:5,    reward:{type:'dew', amt:20}},
    {id:'col_disc_sub_20',    tier:'silver',   category:'COLLECTION', name:'A Geologist Eye',            desc:'See 20 substrates.',                                                   counter:'substrates_seen',  target:20,   reward:{type:'dew', amt:80}},
    {id:'col_disc_sub_40',    tier:'gold',     category:'COLLECTION', name:'A Library of Ground',        desc:'See 40 substrates.',                                                   counter:'substrates_seen',  target:40,   reward:{type:'dew', amt:180}},
    {id:'col_disc_sub_all',   tier:'mythic',   category:'COLLECTION', name:'Every Ground, Tasted',       desc:'See all 64 substrates.',                                               counter:'substrates_seen',  target:64,   reward:{type:'trophy', amt:1, name:'Every Ground'}},

    {id:'col_disc_aur_3',     tier:'bronze',   category:'COLLECTION', name:'A Glimmer Around the Edge',  desc:'Discover 3 auras.',                                                    counter:'auras_seen',       target:3,    reward:{type:'dew', amt:25}},
    {id:'col_disc_aur_10',    tier:'silver',   category:'COLLECTION', name:'Ten Halos',                  desc:'Discover 10 auras.',                                                   counter:'auras_seen',       target:10,   reward:{type:'dew', amt:80}},
    {id:'col_disc_aur_20',    tier:'gold',     category:'COLLECTION', name:'A Catalog of Light',         desc:'Discover 20 auras.',                                                   counter:'auras_seen',       target:20,   reward:{type:'dew', amt:180}},
    {id:'col_disc_aur_all',   tier:'mythic',   category:'COLLECTION', name:'Every Halo, Witnessed',      desc:'Discover all 31 auras.',                                               counter:'auras_seen',       target:31,   reward:{type:'trophy', amt:1, name:'Every Halo'}},

    {id:'col_disc_mut_3',     tier:'silver',   category:'COLLECTION', name:'Three Strange Things',       desc:'Witness 3 mutations.',                                                 counter:'mutations_seen',   target:3,    reward:{type:'dew', amt:60}},
    {id:'col_disc_mut_10',    tier:'gold',     category:'COLLECTION', name:'Ten Quiet Anomalies',        desc:'Witness 10 mutations.',                                                counter:'mutations_seen',   target:10,   reward:{type:'dew', amt:160}},
    {id:'col_disc_mut_all',   tier:'mythic',   category:'COLLECTION', name:'Every Mutation, Loved',      desc:'Witness all 19 mutations.',                                            counter:'mutations_seen',   target:19,   reward:{type:'trophy', amt:1, name:'Every Mutation'}},

    {id:'col_grade_uncommon', tier:'bronze',   category:'COLLECTION', name:'Uncommon Light',             desc:'Mint your first Uncommon plant.',                                      counter:'mint_uncommon',    target:1,    reward:{type:'dew', amt:15}},
    {id:'col_grade_rare',     tier:'bronze',   category:'COLLECTION', name:'Rare Air',                   desc:'Mint your first Rare plant.',                                          counter:'mint_rare',        target:1,    reward:{type:'dew', amt:25}},
    {id:'col_grade_epic',     tier:'silver',   category:'COLLECTION', name:'Epic in the Pot',            desc:'Mint your first Epic plant.',                                          counter:'mint_epic',        target:1,    reward:{type:'dew', amt:50}},
    {id:'col_grade_legend',   tier:'gold',     category:'COLLECTION', name:'A Legend by the Window',     desc:'Mint your first Legendary plant.',                                     counter:'mint_legendary',   target:1,    reward:{type:'dew', amt:120}},
    {id:'col_grade_mythic',   tier:'platinum', category:'COLLECTION', name:'Mythic Hush',                desc:'Mint your first Mythic plant.',                                        counter:'mint_mythic',      target:1,    reward:{type:'dew', amt:250}},
    {id:'col_grade_cosmic',   tier:'mythic',   category:'COLLECTION', name:'A Star, In a Pot',           desc:'Mint your first Cosmic plant.',                                        counter:'mint_cosmic',      target:1,    reward:{type:'trophy', amt:1, name:'A Star, In a Pot'}},

    {id:'col_grade_full_set', tier:'platinum', category:'COLLECTION', name:'All Seven Voices',           desc:'Own at least one plant of every grade.',                               counter:'',                 target:1,    reward:{type:'dew', amt:500}},

    {id:'col_seasons_4',      tier:'silver',   category:'COLLECTION', name:'Four Seasons in the Sill',   desc:'Own a plant from each of the four seasons.',                           counter:'',                 target:1,    reward:{type:'dew', amt:80}},
    {id:'col_companion_l3',   tier:'gold',     category:'COLLECTION', name:'A Companion, Truly Known',   desc:'Raise any companion to bond level 3.',                                 counter:'comp_l3',          target:1,    reward:{type:'dew', amt:120}},
    {id:'col_companion_l5',   tier:'platinum', category:'COLLECTION', name:'A Bond of Five Years',       desc:'Raise any companion to bond level 5.',                                 counter:'comp_l5',          target:1,    reward:{type:'dew', amt:300}},
    {id:'col_companion_l6',   tier:'mythic',   category:'COLLECTION', name:'A Lifelong Friend',          desc:'Raise any companion to bond level 6.',                                 counter:'comp_l6',          target:1,    reward:{type:'trophy', amt:1, name:'A Lifelong Friend'}},
    {id:'col_companion_l3x5', tier:'mythic',   category:'COLLECTION', name:'Five Companions, All Known', desc:'Reach bond level 3 with five different companions.',                   counter:'comp_l3',          target:5,    reward:{type:'trophy', amt:1, name:'Five Companions Known'}},

    {id:'col_pots_dozen',     tier:'bronze',   category:'COLLECTION', name:'A Dozen Vessels Owned',      desc:'Own plants in 12 different pot designs at once.',                      counter:'pots_owned_unique',target:12,   reward:{type:'dew', amt:60}},
    {id:'col_pots_thirty',    tier:'gold',     category:'COLLECTION', name:'Thirty Pots, Thirty Lives',  desc:'Own plants in 30 different pot designs at once.',                      counter:'pots_owned_unique',target:30,   reward:{type:'dew', amt:200}},
    {id:'col_pots_forty',     tier:'platinum', category:'COLLECTION', name:'Forty Quiet Conversations',  desc:'Own plants in 40 different pot designs at once.',                      counter:'pots_owned_unique',target:40,   reward:{type:'dew', amt:400}},

    {id:'col_synergy_5',      tier:'silver',   category:'COLLECTION', name:'Five Songs Found',           desc:'Discover 5 plant synergies.',                                          counter:'synergy_disc',     target:5,    reward:{type:'dew', amt:75}},
    {id:'col_synergy_25',     tier:'gold',     category:'COLLECTION', name:'A Choir of Twenty Five',     desc:'Discover 25 synergies.',                                               counter:'synergy_disc',     target:25,   reward:{type:'dew', amt:200}},
    {id:'col_synergy_75',     tier:'platinum', category:'COLLECTION', name:'Seventy Five Quiet Pairs',   desc:'Discover 75 synergies.',                                               counter:'synergy_disc',     target:75,   reward:{type:'dew', amt:400}},
    {id:'col_synergy_200',    tier:'mythic',   category:'COLLECTION', name:'Every Song the Garden Sings',desc:'Discover all 200 synergies.',                                          counter:'synergy_disc',     target:200,  reward:{type:'trophy', amt:1, name:'Every Song'}},

    {id:'col_memento_10',     tier:'bronze',   category:'COLLECTION', name:'Ten Things Kept',            desc:'Collect 10 mementos.',                                                 counter:'mementos_owned',   target:10,   reward:{type:'dew', amt:50}},
    {id:'col_memento_50',     tier:'gold',     category:'COLLECTION', name:'A Drawer of Small Things',   desc:'Collect 50 mementos.',                                                 counter:'mementos_owned',   target:50,   reward:{type:'dew', amt:250}},
    {id:'col_memento_all',    tier:'mythic',   category:'COLLECTION', name:'Every Memento, Held',        desc:'Collect all 96 mementos.',                                             counter:'mementos_owned',   target:96,   reward:{type:'trophy', amt:1, name:'Every Memento'}},

    {id:'col_full_grove',     tier:'gold',     category:'COLLECTION', name:'A Full Grove',               desc:'Fill your greenhouse to its current cap.',                             counter:'gh_full',          target:1,    reward:{type:'dew', amt:200}},
    {id:'col_60_slots',       tier:'platinum', category:'COLLECTION', name:'Sixty Pots, Sixty Stories',  desc:'Reach the maximum 60 greenhouse slots.',                               counter:'gh_max_slots',     target:60,   reward:{type:'dew', amt:500}},

    {id:'brd_first',          tier:'bronze',   category:'BREEDING',   name:'A First Cross',              desc:'Cross pollinate two plants.',                                          counter:'breed_total',      target:1,    reward:{type:'dew', amt:20}},
    {id:'brd_5',              tier:'bronze',   category:'BREEDING',   name:'Five Quiet Pairings',        desc:'Complete 5 cross pollinations.',                                       counter:'breed_total',      target:5,    reward:{type:'dew', amt:40}},
    {id:'brd_25',             tier:'silver',   category:'BREEDING',   name:'A Patient Hand',             desc:'Complete 25 cross pollinations.',                                      counter:'breed_total',      target:25,   reward:{type:'dew', amt:100}},
    {id:'brd_100',            tier:'gold',     category:'BREEDING',   name:'A Hundred Crossings',        desc:'Complete 100 cross pollinations.',                                     counter:'breed_total',      target:100,  reward:{type:'dew', amt:300}},
    {id:'brd_500',            tier:'platinum', category:'BREEDING',   name:'A Lineage of Lineages',      desc:'Complete 500 cross pollinations.',                                     counter:'breed_total',      target:500,  reward:{type:'dew', amt:600}},
    {id:'brd_chimera_2',      tier:'silver',   category:'BREEDING',   name:'A Second Generation',        desc:'Breed a Gen 2 chimera.',                                               counter:'chimera_g2',       target:1,    reward:{type:'dew', amt:60}},
    {id:'brd_chimera_3',      tier:'gold',     category:'BREEDING',   name:'A Third Bloodline',          desc:'Breed a Gen 3 chimera.',                                               counter:'chimera_g3',       target:1,    reward:{type:'dew', amt:150}},
    {id:'brd_chimera_4',      tier:'platinum', category:'BREEDING',   name:'A Fourth Door Opens',        desc:'Breed a Gen 4 chimera.',                                               counter:'chimera_g4',       target:1,    reward:{type:'dew', amt:300}},
    {id:'brd_chimera_5',      tier:'mythic',   category:'BREEDING',   name:'A Fifth Voice in the Stem',  desc:'Breed a Gen 5 chimera.',                                               counter:'chimera_g5',       target:1,    reward:{type:'trophy', amt:1, name:'Fifth Voice'}},
    {id:'brd_chimera_6',      tier:'mythic',   category:'BREEDING',   name:'A Sixth, And the Stem Sings',desc:'Breed a Gen 6 chimera.',                                               counter:'chimera_g6',       target:1,    reward:{type:'trophy', amt:1, name:'Sixth, And the Stem Sings'}},
    {id:'brd_within_season',  tier:'bronze',   category:'BREEDING',   name:'A Same Season Pair',         desc:'Breed two plants of the same season.',                                 counter:'breed_within',     target:1,    reward:{type:'dew', amt:25}},
    {id:'brd_across_season',  tier:'silver',   category:'BREEDING',   name:'A Stranger Match',           desc:'Breed two plants from opposite seasons.',                               counter:'breed_opposite',   target:1,    reward:{type:'dew', amt:50}},
    {id:'brd_all_season_pair',tier:'gold',     category:'BREEDING',   name:'Every Pair Possible',        desc:'Cross at least one pair from every season pair combination.',          counter:'season_pairs',     target:10,   reward:{type:'dew', amt:200}},
    {id:'brd_clipping_first', tier:'bronze',   category:'BREEDING',   name:'A First Clipping',           desc:'Take your first clipping.',                                            counter:'clipping_total',   target:1,    reward:{type:'dew', amt:20}},
    {id:'brd_clipping_25',    tier:'silver',   category:'BREEDING',   name:'Twenty Five Clippings',      desc:'Take 25 clippings.',                                                   counter:'clipping_total',   target:25,   reward:{type:'dew', amt:80}},
    {id:'brd_clipping_100',   tier:'gold',     category:'BREEDING',   name:'A Hundred Cuttings',         desc:'Take 100 clippings.',                                                  counter:'clipping_total',   target:100,  reward:{type:'dew', amt:200}},
    {id:'brd_wild_breed_5',   tier:'silver',   category:'BREEDING',   name:'Five Wild Crosses',          desc:'Cross pollinate with 5 wild plants.',                                  counter:'breed_with_wild',  target:5,    reward:{type:'dew', amt:80}},
    {id:'brd_wild_breed_25',  tier:'gold',     category:'BREEDING',   name:'Twenty Five Wild Hands',     desc:'Cross pollinate with 25 wild plants.',                                 counter:'breed_with_wild',  target:25,   reward:{type:'dew', amt:200}},
    {id:'brd_stranger_5',     tier:'silver',   category:'BREEDING',   name:'Five Stranger Crosses',      desc:'Cross pollinate with 5 stranger owned wild plants.',                   counter:'breed_with_stranger',target:5,  reward:{type:'dew', amt:100}},
    {id:'brd_stranger_25',    tier:'gold',     category:'BREEDING',   name:'A Quilt of Strangers',       desc:'Cross pollinate with 25 stranger owned wild plants.',                  counter:'breed_with_stranger',target:25, reward:{type:'dew', amt:250}},
    {id:'brd_mendelian',      tier:'gold',     category:'BREEDING',   name:'A Mendelian Echo',           desc:'Breed an offspring inheriting both parent dominant traits.',           counter:'breed_mendelian',  target:1,    reward:{type:'dew', amt:200}, hidden:true},
    {id:'brd_purebreed_10',   tier:'platinum', category:'BREEDING',   name:'A Patient Bloodline',        desc:'Breed 10 same season offspring in one lineage.',                       counter:'lineage_pure',     target:10,   reward:{type:'dew', amt:400}, hidden:true},
    {id:'brd_seed_to_seed',   tier:'silver',   category:'BREEDING',   name:'A Seed Becomes a Mother',    desc:'Breed an offspring whose parent was bred from another seed.',          counter:'second_gen_breed', target:1,    reward:{type:'dew', amt:80}},
    {id:'brd_cross_climate',  tier:'gold',     category:'BREEDING',   name:'A Cross of Two Skies',       desc:'Breed two plants whose climate tolerances barely overlap.',            counter:'breed_climate_div',target:1,    reward:{type:'dew', amt:200}, hidden:true},

    {id:'mas_class_picked',   tier:'bronze',   category:'MASTERY',    name:'A Path Chosen',              desc:'Choose your first class at level 7.',                                  counter:'class_picked',     target:1,    reward:{type:'dew', amt:30}},
    {id:'mas_class_l2',       tier:'silver',   category:'MASTERY',    name:'A Path Walked',              desc:'Reach class level 2 in any class.',                                    counter:'class_l2',         target:1,    reward:{type:'dew', amt:60}},
    {id:'mas_class_l3',       tier:'gold',     category:'MASTERY',    name:'A Master Quiet',             desc:'Reach class level 3 (Master) in any class.',                           counter:'class_l3',         target:1,    reward:{type:'dew', amt:200}},
    {id:'mas_class_l3_two',   tier:'platinum', category:'MASTERY',    name:'Two Masteries',              desc:'Master 2 classes.',                                                    counter:'class_l3',         target:2,    reward:{type:'dew', amt:400}},
    {id:'mas_class_l3_all',   tier:'mythic',   category:'MASTERY',    name:'All Five Paths Walked',      desc:'Master all 5 classes.',                                                counter:'class_l3',         target:5,    reward:{type:'trophy', amt:1, name:'All Five Paths'}},

    {id:'mas_tree_10',        tier:'bronze',   category:'MASTERY',    name:'Ten Points, Spent',          desc:'Spend 10 Keeper Tree points.',                                         counter:'tree_spent',       target:10,   reward:{type:'dew', amt:30}},
    {id:'mas_tree_25',        tier:'silver',   category:'MASTERY',    name:'A Path Opened',              desc:'Spend 25 Keeper Tree points.',                                         counter:'tree_spent',       target:25,   reward:{type:'dew', amt:80}},
    {id:'mas_tree_50',        tier:'gold',     category:'MASTERY',    name:'The Gilding Hour',           desc:'Spend 50 Keeper Tree points.',                                         counter:'tree_spent',       target:50,   reward:{type:'dew', amt:200}},
    {id:'mas_tree_75',        tier:'platinum', category:'MASTERY',    name:'A Near Horizon',             desc:'Spend 75 Keeper Tree points.',                                         counter:'tree_spent',       target:75,   reward:{type:'dew', amt:300}},
    {id:'mas_tree_100',       tier:'mythic',   category:'MASTERY',    name:'The Long Watch',             desc:'Spend all 100 Keeper Tree points.',                                    counter:'tree_spent',       target:100,  reward:{type:'trophy', amt:1, name:'The Long Watch'}},

    {id:'mas_lvl_10',         tier:'bronze',   category:'MASTERY',    name:'Level Ten',                  desc:'Reach Keeper level 10.',                                               counter:'kp_level',         target:10,   reward:{type:'dew', amt:30}},
    {id:'mas_lvl_25',         tier:'silver',   category:'MASTERY',    name:'Level Twenty Five',          desc:'Reach Keeper level 25.',                                               counter:'kp_level',         target:25,   reward:{type:'dew', amt:75}},
    {id:'mas_lvl_50',         tier:'gold',     category:'MASTERY',    name:'Level Fifty',                desc:'Reach Keeper level 50.',                                               counter:'kp_level',         target:50,   reward:{type:'dew', amt:150}},
    {id:'mas_lvl_75',         tier:'gold',     category:'MASTERY',    name:'Level Seventy Five',         desc:'Reach Keeper level 75.',                                               counter:'kp_level',         target:75,   reward:{type:'dew', amt:250}},
    {id:'mas_lvl_100',        tier:'platinum', category:'MASTERY',    name:'A Keeper, in Full',          desc:'Reach Keeper level 100.',                                              counter:'kp_level',         target:100,  reward:{type:'dew', amt:400}},
    {id:'mas_lvl_150',        tier:'mythic',   category:'MASTERY',    name:'A Hundred and Fifty Years',  desc:'Reach Keeper level 150.',                                              counter:'kp_level',         target:150,  reward:{type:'trophy', amt:1, name:'A Hundred and Fifty Years'}},
    {id:'mas_lvl_200',        tier:'mythic',   category:'MASTERY',    name:'Two Hundred Quiet Springs',  desc:'Reach Keeper level 200.',                                              counter:'kp_level',         target:200,  reward:{type:'trophy', amt:1, name:'Two Hundred Springs'}},

    {id:'mas_pres_1',         tier:'gold',     category:'MASTERY',    name:'A First Ascension',          desc:'Prestige once.',                                                       counter:'prestige_lvl',     target:1,    reward:{type:'dew', amt:200}},
    {id:'mas_pres_3',         tier:'platinum', category:'MASTERY',    name:'Three Lives Lived',          desc:'Prestige 3 times.',                                                    counter:'prestige_lvl',     target:3,    reward:{type:'dew', amt:500}},
    {id:'mas_pres_5',         tier:'mythic',   category:'MASTERY',    name:'A Keeper Reborn',            desc:'Prestige 5 times.',                                                    counter:'prestige_lvl',     target:5,    reward:{type:'trophy', amt:1, name:'A Keeper Reborn'}},
    {id:'mas_pres_10',        tier:'mythic',   category:'MASTERY',    name:'Ten Lives, One Garden',      desc:'Prestige 10 times.',                                                   counter:'prestige_lvl',     target:10,   reward:{type:'trophy', amt:1, name:'Ten Lives'}},

    {id:'mas_tools_5',        tier:'bronze',   category:'MASTERY',    name:'Five Tools Tried',           desc:'Use 5 different tools.',                                               counter:'tools_used',       target:5,    reward:{type:'dew', amt:25}},
    {id:'mas_tools_15',       tier:'silver',   category:'MASTERY',    name:'A Workshop Open',            desc:'Use 15 different tools.',                                              counter:'tools_used',       target:15,   reward:{type:'dew', amt:75}},
    {id:'mas_tools_all',      tier:'gold',     category:'MASTERY',    name:'Every Tool, Calloused',      desc:'Use every available tool at least once.',                              counter:'tools_used',       target:25,   reward:{type:'dew', amt:200}},

    {id:'mas_box_10',         tier:'bronze',   category:'MASTERY',    name:'Ten Boxes Opened',           desc:'Open 10 mystery boxes.',                                               counter:'boxes_opened',     target:10,   reward:{type:'dew', amt:25}},
    {id:'mas_box_50',         tier:'silver',   category:'MASTERY',    name:'Fifty Small Surprises',      desc:'Open 50 mystery boxes.',                                               counter:'boxes_opened',     target:50,   reward:{type:'dew', amt:100}},
    {id:'mas_box_250',        tier:'gold',     category:'MASTERY',    name:'A Drawer of Curiosities',    desc:'Open 250 mystery boxes.',                                              counter:'boxes_opened',     target:250,  reward:{type:'dew', amt:300}},
    {id:'mas_box_1000',       tier:'mythic',   category:'MASTERY',    name:'A Thousand Boxes Later',     desc:'Open 1,000 mystery boxes.',                                            counter:'boxes_opened',     target:1000, reward:{type:'trophy', amt:1, name:'A Thousand Boxes'}},

    {id:'mas_items_5',        tier:'bronze',   category:'MASTERY',    name:'Five Items Held',            desc:'Collect 5 different items.',                                           counter:'items_unique',     target:5,    reward:{type:'dew', amt:25}},
    {id:'mas_items_10',       tier:'silver',   category:'MASTERY',    name:'A Pocket Sorted',            desc:'Collect 10 different items.',                                          counter:'items_unique',     target:10,   reward:{type:'dew', amt:75}},
    {id:'mas_items_all',      tier:'gold',     category:'MASTERY',    name:'Every Item, Found',          desc:'Collect every craftable item at least once.',                          counter:'items_unique',     target:16,   reward:{type:'dew', amt:200}},

    {id:'exp_steps_500',      tier:'bronze',   category:'EXPLORATION',name:'Five Hundred Steps',         desc:'Walk 500 steps on the Wild map.',                                      counter:'steps_total',      target:500,  reward:{type:'dew', amt:15}},
    {id:'exp_steps_5k',       tier:'bronze',   category:'EXPLORATION',name:'Five Thousand',              desc:'Walk 5,000 steps.',                                                    counter:'steps_total',      target:5000, reward:{type:'dew', amt:30}},
    {id:'exp_km_1',           tier:'bronze',   category:'EXPLORATION',name:'One Kilometer',              desc:'Walk 1 km on the Wild map.',                                           counter:'meters_total',     target:1000, reward:{type:'dew', amt:30}},
    {id:'exp_km_10',          tier:'silver',   category:'EXPLORATION',name:'Ten Kilometers',             desc:'Walk 10 km.',                                                          counter:'meters_total',     target:10000,reward:{type:'dew', amt:80}},
    {id:'exp_km_100',         tier:'gold',     category:'EXPLORATION',name:'One Hundred Kilometers',     desc:'Walk 100 km.',                                                         counter:'meters_total',     target:100000,reward:{type:'dew', amt:250}},
    {id:'exp_km_500',         tier:'platinum', category:'EXPLORATION',name:'Five Hundred Kilometers',    desc:'Walk 500 km.',                                                         counter:'meters_total',     target:500000,reward:{type:'dew', amt:500}},
    {id:'exp_km_1000',        tier:'mythic',   category:'EXPLORATION',name:'A Thousand Kilometers Walked',desc:'Walk 1,000 km on the Wild map.',                                      counter:'meters_total',     target:1000000,reward:{type:'trophy', amt:1, name:'A Thousand Kilometers'}},
    {id:'exp_km_5000',        tier:'mythic',   category:'EXPLORATION',name:'Five Thousand Kilometers',   desc:'Walk 5,000 km. The legs of a long keeper.',                            counter:'meters_total',     target:5000000,reward:{type:'trophy', amt:1, name:'Five Thousand Kilometers'}},
    {id:'exp_km_10000',       tier:'mythic',   category:'EXPLORATION',name:'Ten Thousand Kilometers',    desc:'Walk 10,000 km. Around a planet, slowly.',                             counter:'meters_total',     target:10000000,reward:{type:'trophy', amt:1, name:'Ten Thousand Kilometers'}},

    {id:'exp_first_drop',     tier:'bronze',   category:'EXPLORATION',name:'A First Wild',               desc:'Drop your first wild plant.',                                          counter:'wild_drops',       target:1,    reward:{type:'dew', amt:25}},
    {id:'exp_drops_25',       tier:'silver',   category:'EXPLORATION',name:'A Trail of Twenty Five',     desc:'Drop 25 wild plants.',                                                 counter:'wild_drops',       target:25,   reward:{type:'dew', amt:75}},
    {id:'exp_drops_100',      tier:'gold',     category:'EXPLORATION',name:'A Hundred Plantings',        desc:'Drop 100 wild plants.',                                                counter:'wild_drops',       target:100,  reward:{type:'dew', amt:200}},
    {id:'exp_drops_500',      tier:'platinum', category:'EXPLORATION',name:'A Generation of Wild',       desc:'Drop 500 wild plants.',                                                counter:'wild_drops',       target:500,  reward:{type:'dew', amt:500}},
    {id:'exp_drops_2000',     tier:'mythic',   category:'EXPLORATION',name:'Two Thousand Plantings',     desc:'Drop 2,000 wild plants.',                                              counter:'wild_drops',       target:2000, reward:{type:'trophy', amt:1, name:'Two Thousand Plantings'}},

    {id:'exp_hex_5',          tier:'bronze',   category:'EXPLORATION',name:'Five Hexes Marked',          desc:'Plant in 5 different hexes.',                                          counter:'hexes_planted',    target:5,    reward:{type:'dew', amt:25}},
    {id:'exp_hex_25',         tier:'silver',   category:'EXPLORATION',name:'Twenty Five Hexes',          desc:'Plant in 25 different hexes.',                                         counter:'hexes_planted',    target:25,   reward:{type:'dew', amt:80}},
    {id:'exp_hex_100',        tier:'gold',     category:'EXPLORATION',name:'A Hundred Hexes',            desc:'Plant in 100 different hexes.',                                        counter:'hexes_planted',    target:100,  reward:{type:'dew', amt:250}},
    {id:'exp_hex_500',        tier:'platinum', category:'EXPLORATION',name:'A Map of Five Hundred',      desc:'Plant in 500 different hexes.',                                        counter:'hexes_planted',    target:500,  reward:{type:'dew', amt:500}},
    {id:'exp_hex_1000',       tier:'mythic',   category:'EXPLORATION',name:'A Thousand Hexes Stitched',  desc:'Plant in 1,000 different hexes.',                                      counter:'hexes_planted',    target:1000, reward:{type:'trophy', amt:1, name:'Thousand Hexes'}},

    {id:'exp_biome_3',        tier:'bronze',   category:'EXPLORATION',name:'Three Biomes Visited',       desc:'Visit 3 different biomes.',                                            counter:'biomes_visited',   target:3,    reward:{type:'dew', amt:30}},
    {id:'exp_biome_5',        tier:'silver',   category:'EXPLORATION',name:'Five Biomes Walked',         desc:'Visit 5 different biomes.',                                            counter:'biomes_visited',   target:5,    reward:{type:'dew', amt:80}},
    {id:'exp_biome_all',      tier:'gold',     category:'EXPLORATION',name:'All Ten Biomes',             desc:'Visit all 10 biomes.',                                                 counter:'biomes_visited',   target:10,   reward:{type:'dew', amt:250}},
    {id:'exp_biome_trophy',   tier:'mythic',   category:'EXPLORATION',name:'Every Biome, Every Wind',    desc:'Visit all 10 biomes AND collect a feral from each.',                   counter:'biomes_visited',   target:10,   reward:{type:'trophy', amt:1, name:'Every Biome'}},

    {id:'exp_feral_first',    tier:'bronze',   category:'EXPLORATION',name:'A First Feral',              desc:'Collect your first feral seed.',                                       counter:'ferals_total',     target:1,    reward:{type:'dew', amt:20}},
    {id:'exp_feral_10',       tier:'bronze',   category:'EXPLORATION',name:'Ten Wild Seeds',             desc:'Collect 10 feral seeds.',                                              counter:'ferals_total',     target:10,   reward:{type:'dew', amt:50}},
    {id:'exp_feral_50',       tier:'silver',   category:'EXPLORATION',name:'Fifty Mystery Seeds',        desc:'Collect 50 feral seeds.',                                              counter:'ferals_total',     target:50,   reward:{type:'dew', amt:150}},
    {id:'exp_feral_250',      tier:'gold',     category:'EXPLORATION',name:'A Quarter Thousand Ferals',  desc:'Collect 250 feral seeds.',                                             counter:'ferals_total',     target:250,  reward:{type:'dew', amt:300}},
    {id:'exp_feral_1000',     tier:'mythic',   category:'EXPLORATION',name:'A Thousand Mysteries',       desc:'Collect 1,000 feral seeds.',                                           counter:'ferals_total',     target:1000, reward:{type:'trophy', amt:1, name:'Thousand Mysteries'}},
    {id:'exp_feral_rare',     tier:'silver',   category:'EXPLORATION',name:'A Rare Mystery',             desc:'Collect a feral seed that bloomed Rare or higher.',                    counter:'ferals_rare_plus', target:1,    reward:{type:'dew', amt:60}},
    {id:'exp_feral_legend',   tier:'gold',     category:'EXPLORATION',name:'A Legendary Mystery',        desc:'Collect a feral that bloomed Legendary or higher.',                    counter:'ferals_legend_plus',target:1,   reward:{type:'dew', amt:200}},
    {id:'exp_feral_cosmic',   tier:'mythic',   category:'EXPLORATION',name:'A Cosmic Mystery',           desc:'Collect a feral that bloomed Cosmic.',                                 counter:'ferals_cosmic',    target:1,    reward:{type:'trophy', amt:1, name:'Cosmic Mystery'}},
    {id:'exp_forage_25',      tier:'bronze',   category:'EXPLORATION',name:'Twenty Five Foraging Wins',  desc:'Solve 25 foraging puzzles.',                                           counter:'forage_solved',    target:25,   reward:{type:'dew', amt:60}},
    {id:'exp_forage_100',     tier:'silver',   category:'EXPLORATION',name:'A Hundred Foraging Wins',    desc:'Solve 100 foraging puzzles.',                                          counter:'forage_solved',    target:100,  reward:{type:'dew', amt:150}},
    {id:'exp_forage_500',     tier:'gold',     category:'EXPLORATION',name:'Five Hundred Foraging Wins', desc:'Solve 500 foraging puzzles.',                                          counter:'forage_solved',    target:500,  reward:{type:'dew', amt:350}},
    {id:'exp_forage_perfect', tier:'silver',   category:'EXPLORATION',name:'A Perfect Forage',           desc:'Solve a foraging puzzle without a single wrong guess.',                counter:'forage_perfect',   target:1,    reward:{type:'dew', amt:50}},

    {id:'hnt_first',          tier:'bronze',   category:'HUNT',       name:'A First Firefly',            desc:'Catch your first hunt firefly.',                                       counter:'hunt_caught',      target:1,    reward:{type:'dew', amt:30}},
    {id:'hnt_3',              tier:'bronze',   category:'HUNT',       name:'Three Lights in the Reeds',  desc:'Catch 3 hunt fireflies.',                                              counter:'hunt_caught',      target:3,    reward:{type:'dew', amt:60}},
    {id:'hnt_season_full',    tier:'silver',   category:'HUNT',       name:'A Full Season of Light',     desc:'Catch all 12 fireflies in a single season.',                           counter:'hunt_full_season', target:1,    reward:{type:'dew', amt:200}},
    {id:'hnt_two_seasons',    tier:'gold',     category:'HUNT',       name:'Two Seasons Complete',       desc:'Complete the firefly hunt in 2 different seasons.',                    counter:'hunt_full_season', target:2,    reward:{type:'dew', amt:300}},
    {id:'hnt_all_seasons',    tier:'mythic',   category:'HUNT',       name:'A Year of Lights',           desc:'Complete the firefly hunt in all 4 seasons. A multi year achievement.',counter:'hunt_full_season', target:4,    reward:{type:'trophy', amt:1, name:'A Year of Lights'}},
    {id:'hnt_late_night',     tier:'bronze',   category:'HUNT',       name:'A Late Night Catch',         desc:'Catch a firefly between midnight and 4am.',                            counter:'hunt_late_night',  target:1,    reward:{type:'dew', amt:25}},
    {id:'hnt_dawn',           tier:'silver',   category:'HUNT',       name:'A Dawn Catch',               desc:'Catch a firefly between 4am and 7am.',                                 counter:'hunt_dawn',        target:1,    reward:{type:'dew', amt:40}},
    {id:'hnt_50',             tier:'gold',     category:'HUNT',       name:'Fifty Lights',               desc:'Catch 50 hunt fireflies (lifetime).',                                  counter:'hunt_caught',      target:50,   reward:{type:'dew', amt:200}},
    {id:'hnt_200',            tier:'platinum', category:'HUNT',       name:'Two Hundred Lights',         desc:'Catch 200 hunt fireflies.',                                            counter:'hunt_caught',      target:200,  reward:{type:'dew', amt:400}},
    {id:'hnt_500',            tier:'mythic',   category:'HUNT',       name:'Five Hundred Lights',        desc:'Catch 500 hunt fireflies.',                                            counter:'hunt_caught',      target:500,  reward:{type:'trophy', amt:1, name:'Five Hundred Lights'}},
    {id:'hnt_no_miss',        tier:'silver',   category:'HUNT',       name:'A Steady Hand',              desc:'Catch 5 fireflies in a row without missing.',                          counter:'hunt_streak',      target:5,    reward:{type:'dew', amt:80}, hidden:true},
    {id:'hnt_one_session',    tier:'silver',   category:'HUNT',       name:'Three Caught in One Walk',   desc:'Catch 3 fireflies in a single Wild session.',                          counter:'hunt_session_3',   target:1,    reward:{type:'dew', amt:60}},
    {id:'hnt_birthday_month', tier:'gold',     category:'HUNT',       name:'A Light in Your Month',      desc:'Catch a firefly in your birth month.',                                 counter:'hunt_birth_month', target:1,    reward:{type:'dew', amt:120}, hidden:true},
    {id:'hnt_solstice',       tier:'gold',     category:'HUNT',       name:'A Solstice Light',           desc:'Catch a firefly within a week of a solstice.',                         counter:'hunt_solstice',    target:1,    reward:{type:'dew', amt:120}, hidden:true},
    {id:'hnt_equinox',        tier:'gold',     category:'HUNT',       name:'An Equinox Light',           desc:'Catch a firefly within a week of an equinox.',                         counter:'hunt_equinox',     target:1,    reward:{type:'dew', amt:120}, hidden:true},

    {id:'wea_summon_first',   tier:'bronze',   category:'WEATHER',    name:'A First Sky Asked',          desc:'Summon weather for the first time.',                                   counter:'weather_summon',   target:1,    reward:{type:'dew', amt:20}},
    {id:'wea_summon_4',       tier:'silver',   category:'WEATHER',    name:'All Four Skies Spoken',      desc:'Summon every weather type at least once.',                             counter:'weather_types',    target:4,    reward:{type:'dew', amt:80}},
    {id:'wea_summon_25',      tier:'gold',     category:'WEATHER',    name:'A Sky Talker',               desc:'Summon weather 25 times.',                                             counter:'weather_summon',   target:25,   reward:{type:'dew', amt:200}},
    {id:'wea_survive_heat',   tier:'silver',   category:'WEATHER',    name:'Through the Heatwave',       desc:'Keep a plant alive through a real heatwave breach.',                   counter:'survived_heat',    target:1,    reward:{type:'dew', amt:50}},
    {id:'wea_survive_cold',   tier:'silver',   category:'WEATHER',    name:'Through the Cold Snap',      desc:'Keep a plant alive through a cold snap breach.',                       counter:'survived_cold',    target:1,    reward:{type:'dew', amt:50}},
    {id:'wea_survive_storm',  tier:'silver',   category:'WEATHER',    name:'Through the Storm',          desc:'Keep a plant alive through a wind or storm breach.',                   counter:'survived_wind',    target:1,    reward:{type:'dew', amt:50}},
    {id:'wea_survive_flood',  tier:'silver',   category:'WEATHER',    name:'Through the Flood',          desc:'Keep a plant alive through a flood breach.',                           counter:'survived_flood',   target:1,    reward:{type:'dew', amt:50}},
    {id:'wea_survive_drought',tier:'silver',   category:'WEATHER',    name:'Through the Dry',            desc:'Keep a plant alive through a drought breach.',                         counter:'survived_drought', target:1,    reward:{type:'dew', amt:50}},
    {id:'wea_survive_all_5',  tier:'gold',     category:'WEATHER',    name:'All Five Vectors Survived',  desc:'Survive every climate vector at least once.',                          counter:'survived_vectors', target:5,    reward:{type:'dew', amt:250}},
    {id:'wea_year_alive',     tier:'gold',     category:'WEATHER',    name:'A Year of One Plant',        desc:'Keep one plant alive 365 days.',                                       counter:'plant_age_max_d',  target:365,  reward:{type:'dew', amt:300}},
    {id:'wea_two_year',       tier:'platinum', category:'WEATHER',    name:'Two Years of One Plant',     desc:'Keep one plant alive 730 days.',                                       counter:'plant_age_max_d',  target:730,  reward:{type:'dew', amt:500}},
    {id:'wea_five_year',      tier:'mythic',   category:'WEATHER',    name:'Five Years of One Plant',    desc:'Keep one plant alive 1,825 days.',                                     counter:'plant_age_max_d',  target:1825, reward:{type:'trophy', amt:1, name:'Five Years of One Plant'}},
    {id:'wea_4_seasons',      tier:'gold',     category:'WEATHER',    name:'Through Every Season',       desc:'Keep one plant alive through all 4 seasons.',                          counter:'plant_4_seasons',  target:1,    reward:{type:'dew', amt:200}},
    {id:'wea_climate_diary',  tier:'platinum', category:'WEATHER',    name:'A Climate Diary',            desc:'Survive every climate vector with the same plant.',                    counter:'one_plant_5vec',   target:1,    reward:{type:'dew', amt:400}, hidden:true},
    {id:'wea_no_loss_30',     tier:'silver',   category:'WEATHER',    name:'Thirty Days, No Wither',     desc:'Go 30 consecutive days without a wild withering.',                     counter:'days_no_wither',   target:30,   reward:{type:'dew', amt:120}, hidden:true},
    {id:'wea_no_loss_100',    tier:'gold',     category:'WEATHER',    name:'A Hundred Quiet Days',       desc:'Go 100 consecutive days without a wild withering.',                    counter:'days_no_wither',   target:100,  reward:{type:'dew', amt:300}, hidden:true},
    {id:'wea_perfect_season', tier:'gold',     category:'WEATHER',    name:'A Perfect Season',           desc:'Survive a full real world season with no plant losses.',               counter:'perfect_seasons',  target:1,    reward:{type:'dew', amt:250}, hidden:true},
    {id:'wea_perfect_year',   tier:'platinum', category:'WEATHER',    name:'A Perfect Year',             desc:'Survive a full real world year with no plant losses.',                 counter:'perfect_years',    target:1,    reward:{type:'dew', amt:500}, hidden:true},
    {id:'wea_drought_prepared',tier:'gold',    category:'WEATHER',    name:'Prepared for the Dry',       desc:'Survive a 10 day drought without losing a plant.',                     counter:'drought_10',       target:1,    reward:{type:'dew', amt:200}, hidden:true},

    {id:'ded_login_3',        tier:'bronze',   category:'DEDICATION', name:'Three Days in a Row',        desc:'Open the app 3 days in a row.',                                        counter:'login_streak',     target:3,    reward:{type:'dew', amt:15}},
    {id:'ded_login_7',        tier:'bronze',   category:'DEDICATION', name:'A Week of Tending',          desc:'Open the app 7 days in a row.',                                        counter:'login_streak',     target:7,    reward:{type:'dew', amt:40}},
    {id:'ded_login_30',       tier:'silver',   category:'DEDICATION', name:'A Month of Tending',         desc:'Open the app 30 days in a row.',                                       counter:'login_streak',     target:30,   reward:{type:'dew', amt:120}},
    {id:'ded_login_100',      tier:'gold',     category:'DEDICATION', name:'A Hundred Quiet Mornings',   desc:'Open the app 100 days in a row.',                                      counter:'login_streak',     target:100,  reward:{type:'dew', amt:300}},
    {id:'ded_login_365',      tier:'platinum', category:'DEDICATION', name:'A Year of Mornings',         desc:'Open the app 365 days in a row.',                                      counter:'login_streak',     target:365,  reward:{type:'dew', amt:500}},
    {id:'ded_login_730',      tier:'mythic',   category:'DEDICATION', name:'Two Years of Mornings',      desc:'Open the app 730 days in a row.',                                      counter:'login_streak',     target:730,  reward:{type:'trophy', amt:1, name:'Two Years of Mornings'}},
    {id:'ded_login_1000',     tier:'mythic',   category:'DEDICATION', name:'A Thousand Quiet Days',      desc:'Open the app 1,000 days in a row.',                                    counter:'login_streak',     target:1000, reward:{type:'trophy', amt:1, name:'A Thousand Quiet Days'}},
    {id:'ded_login_lifetime', tier:'silver',   category:'DEDICATION', name:'Fifty Days, Lifetime',       desc:'Open the app on 50 different days.',                                   counter:'login_days_total', target:50,   reward:{type:'dew', amt:80}},
    {id:'ded_login_lt_500',   tier:'gold',     category:'DEDICATION', name:'Five Hundred Days, Lifetime',desc:'Open the app on 500 different days.',                                  counter:'login_days_total', target:500,  reward:{type:'dew', amt:300}},
    {id:'ded_login_lt_1000',  tier:'mythic',   category:'DEDICATION', name:'A Thousand Days Lifetime',   desc:'Open the app on 1,000 different days.',                                counter:'login_days_total', target:1000, reward:{type:'trophy', amt:1, name:'A Thousand Days Lifetime'}},
    {id:'ded_dailies_10',     tier:'bronze',   category:'DEDICATION', name:'Ten Daily Tasks',            desc:'Complete 10 daily challenges.',                                        counter:'daily_done',       target:10,   reward:{type:'dew', amt:30}},
    {id:'ded_dailies_50',     tier:'silver',   category:'DEDICATION', name:'Fifty Daily Tasks',          desc:'Complete 50 daily challenges.',                                        counter:'daily_done',       target:50,   reward:{type:'dew', amt:80}},
    {id:'ded_dailies_250',    tier:'gold',     category:'DEDICATION', name:'A Quarter Thousand Dailies', desc:'Complete 250 daily challenges.',                                       counter:'daily_done',       target:250,  reward:{type:'dew', amt:200}},
    {id:'ded_dailies_1000',   tier:'platinum', category:'DEDICATION', name:'A Thousand Dailies',         desc:'Complete 1,000 daily challenges.',                                     counter:'daily_done',       target:1000, reward:{type:'dew', amt:400}},
    {id:'ded_dailies_3000',   tier:'mythic',   category:'DEDICATION', name:'Three Thousand Dailies',     desc:'Complete 3,000 daily challenges.',                                     counter:'daily_done',       target:3000, reward:{type:'trophy', amt:1, name:'Three Thousand Dailies'}},
    {id:'ded_weeklies_5',     tier:'bronze',   category:'DEDICATION', name:'Five Weekly Tasks',          desc:'Complete 5 weekly challenges.',                                        counter:'weekly_done',      target:5,    reward:{type:'dew', amt:40}},
    {id:'ded_weeklies_25',    tier:'silver',   category:'DEDICATION', name:'Twenty Five Weeklies',       desc:'Complete 25 weekly challenges.',                                       counter:'weekly_done',      target:25,   reward:{type:'dew', amt:120}},
    {id:'ded_weeklies_100',   tier:'gold',     category:'DEDICATION', name:'A Hundred Weeklies',         desc:'Complete 100 weekly challenges.',                                      counter:'weekly_done',      target:100,  reward:{type:'dew', amt:300}},
    {id:'ded_weeklies_500',   tier:'mythic',   category:'DEDICATION', name:'Five Hundred Weeklies',      desc:'Complete 500 weekly challenges.',                                      counter:'weekly_done',      target:500,  reward:{type:'trophy', amt:1, name:'Five Hundred Weeklies'}},
    {id:'ded_perfect_week',   tier:'silver',   category:'DEDICATION', name:'A Perfect Week',             desc:'Complete every daily and weekly task in one week.',                    counter:'perfect_weeks',    target:1,    reward:{type:'dew', amt:60}},
    {id:'ded_perfect_month',  tier:'gold',     category:'DEDICATION', name:'A Perfect Month',            desc:'Complete every daily and weekly for 4 weeks straight.',                counter:'perfect_weeks',    target:4,    reward:{type:'dew', amt:200}},
    {id:'ded_perfect_quarter',tier:'platinum', category:'DEDICATION', name:'A Perfect Quarter',          desc:'Complete every daily and weekly for 13 weeks straight.',               counter:'perfect_weeks',    target:13,   reward:{type:'dew', amt:500}},

    {id:'soc_first_neighbor', tier:'bronze',   category:'SOCIAL',     name:'A First Neighbor Seen',      desc:'See another player plant on the map.',                                 counter:'strangers_seen',   target:1,    reward:{type:'dew', amt:15}},
    {id:'soc_5_blessed',      tier:'bronze',   category:'SOCIAL',     name:'Five Strangers Blessed',     desc:'Tend 5 stranger owned wild plants.',                                   counter:'tend_strangers',   target:5,    reward:{type:'dew', amt:30}},
    {id:'soc_25_blessed',     tier:'silver',   category:'SOCIAL',     name:'Twenty Five Quiet Helps',    desc:'Tend 25 stranger plants.',                                             counter:'tend_strangers',   target:25,   reward:{type:'dew', amt:80}},
    {id:'soc_100_blessed',    tier:'gold',     category:'SOCIAL',     name:'A Hundred Quiet Helps',      desc:'Tend 100 stranger plants.',                                            counter:'tend_strangers',   target:100,  reward:{type:'dew', amt:200}},
    {id:'soc_500_blessed',    tier:'platinum', category:'SOCIAL',     name:'Five Hundred Quiet Helps',   desc:'Tend 500 stranger plants.',                                            counter:'tend_strangers',   target:500,  reward:{type:'dew', amt:500}},
    {id:'soc_2k_blessed',     tier:'mythic',   category:'SOCIAL',     name:'Two Thousand Quiet Helps',   desc:'Tend 2,000 stranger plants.',                                          counter:'tend_strangers',   target:2000, reward:{type:'trophy', amt:1, name:'Two Thousand Quiet Helps'}},
    {id:'soc_uniq_strangers', tier:'silver',   category:'SOCIAL',     name:'Twenty Different Keepers',   desc:'Tend plants from 20 different keepers.',                               counter:'unique_keepers',   target:20,   reward:{type:'dew', amt:80}},
    {id:'soc_uniq_strangers_x',tier:'gold',    category:'SOCIAL',     name:'A Hundred Different Keepers',desc:'Tend plants from 100 different keepers.',                              counter:'unique_keepers',   target:100,  reward:{type:'dew', amt:250}},
    {id:'soc_share_first',    tier:'bronze',   category:'SOCIAL',     name:'A First Share',              desc:'Share a plant for the first time.',                                    counter:'shares_total',     target:1,    reward:{type:'dew', amt:15}},
    {id:'soc_share_25',       tier:'silver',   category:'SOCIAL',     name:'Twenty Five Shares',         desc:'Share 25 plants.',                                                     counter:'shares_total',     target:25,   reward:{type:'dew', amt:60}},
    {id:'soc_invade_def',     tier:'silver',   category:'SOCIAL',     name:'A Garden Defended',          desc:'Defend a plant from an EA challenger.',                                counter:'def_holds',        target:1,    reward:{type:'dew', amt:60}, hidden:true},
    {id:'soc_invade_take',    tier:'silver',   category:'SOCIAL',     name:'A Garden Taken',             desc:'Take over a stranger plant via EA.',                                   counter:'takeovers',        target:1,    reward:{type:'dew', amt:60}, hidden:true},
    {id:'soc_friend_first',   tier:'bronze',   category:'SOCIAL',     name:'A First Friend Added',       desc:'Add your first friend.',                                               counter:'friends_total',    target:1,    reward:{type:'dew', amt:20}},
    {id:'soc_friend_5',       tier:'silver',   category:'SOCIAL',     name:'Five Quiet Friends',         desc:'Have 5 friends.',                                                      counter:'friends_total',    target:5,    reward:{type:'dew', amt:60}},
    {id:'soc_friend_25',      tier:'gold',     category:'SOCIAL',     name:'Twenty Five Friends Tended', desc:'Have 25 friends.',                                                     counter:'friends_total',    target:25,   reward:{type:'dew', amt:150}},

    {id:'dc_midnight_mint',   tier:'silver',   category:'DEEP CUTS',  name:'A Mint at Midnight',         desc:'Mint a plant between midnight and 1am local time.',                    counter:'mint_midnight',    target:1,    reward:{type:'dew', amt:60}, hidden:true},
    {id:'dc_dawn_mint',       tier:'bronze',   category:'DEEP CUTS',  name:'A Mint at Dawn',             desc:'Mint a plant between 5am and 7am local time.',                         counter:'mint_dawn',        target:1,    reward:{type:'dew', amt:30}, hidden:true},
    {id:'dc_dusk_mint',       tier:'bronze',   category:'DEEP CUTS',  name:'A Mint at Dusk',             desc:'Mint a plant between 6pm and 9pm local time.',                         counter:'mint_dusk',        target:1,    reward:{type:'dew', amt:30}, hidden:true},
    {id:'dc_4am_session',     tier:'silver',   category:'DEEP CUTS',  name:'A Session at Four AM',       desc:'Open the app between 3am and 5am local time.',                         counter:'session_4am',      target:1,    reward:{type:'dew', amt:50}, hidden:true},
    {id:'dc_birthday_month',  tier:'silver',   category:'DEEP CUTS',  name:'A Birthday Month',           desc:'Mint a plant in your birth month.',                                    counter:'mint_birth_month', target:1,    reward:{type:'dew', amt:80}, hidden:true},
    {id:'dc_new_year_mint',   tier:'silver',   category:'DEEP CUTS',  name:'A First Day Mint',           desc:'Mint a plant on January 1.',                                           counter:'mint_jan1',        target:1,    reward:{type:'dew', amt:80}, hidden:true},
    {id:'dc_leap_day',        tier:'gold',     category:'DEEP CUTS',  name:'A Leap Day Mint',            desc:'Mint a plant on February 29.',                                         counter:'mint_leap',        target:1,    reward:{type:'dew', amt:200}, hidden:true},
    {id:'dc_solstice_mint',   tier:'silver',   category:'DEEP CUTS',  name:'A Solstice Mint',            desc:'Mint a plant within a week of any solstice.',                          counter:'mint_solstice',    target:1,    reward:{type:'dew', amt:60}, hidden:true},
    {id:'dc_equinox_mint',    tier:'silver',   category:'DEEP CUTS',  name:'An Equinox Mint',            desc:'Mint a plant within a week of any equinox.',                           counter:'mint_equinox',     target:1,    reward:{type:'dew', amt:60}, hidden:true},
    {id:'dc_full_moon',       tier:'silver',   category:'DEEP CUTS',  name:'A Full Moon Witness',        desc:'Open the app on a full moon night.',                                   counter:'full_moon_visits', target:1,    reward:{type:'dew', amt:40}, hidden:true},
    {id:'dc_new_moon',        tier:'silver',   category:'DEEP CUTS',  name:'A New Moon Witness',         desc:'Open the app on a new moon night.',                                    counter:'new_moon_visits',  target:1,    reward:{type:'dew', amt:40}, hidden:true},
    {id:'dc_all_moons',       tier:'gold',     category:'DEEP CUTS',  name:'Every Phase, Witnessed',     desc:'Open the app under every phase of the moon.',                          counter:'moon_phases_seen', target:8,    reward:{type:'dew', amt:200}, hidden:true},
    {id:'dc_bos_pages_25',    tier:'bronze',   category:'DEEP CUTS',  name:'Twenty Five Pages Read',     desc:'Read 25 Book of Secrets pages.',                                       counter:'bos_pages_read',   target:25,   reward:{type:'dew', amt:30}},
    {id:'dc_bos_pages_100',   tier:'silver',   category:'DEEP CUTS',  name:'A Hundred Pages Read',       desc:'Read 100 BoS pages.',                                                  counter:'bos_pages_read',   target:100,  reward:{type:'dew', amt:80}},
    {id:'dc_bos_pages_all',   tier:'mythic',   category:'DEEP CUTS',  name:'Every Page Read',            desc:'Read every Book of Secrets page.',                                     counter:'bos_pages_read',   target:480,  reward:{type:'trophy', amt:1, name:'Every Page Read'}},
    {id:'dc_bos_trig_25',     tier:'bronze',   category:'DEEP CUTS',  name:'Twenty Five Triggers',       desc:'Discover 25 BoS triggers.',                                            counter:'bos_triggers',     target:25,   reward:{type:'dew', amt:30}},
    {id:'dc_bos_trig_100',    tier:'silver',   category:'DEEP CUTS',  name:'A Hundred Triggers',         desc:'Discover 100 BoS triggers.',                                           counter:'bos_triggers',     target:100,  reward:{type:'dew', amt:100}},
    {id:'dc_bos_trig_250',    tier:'gold',     category:'DEEP CUTS',  name:'A Quarter Thousand Triggers',desc:'Discover 250 BoS triggers.',                                           counter:'bos_triggers',     target:250,  reward:{type:'dew', amt:250}},
    {id:'dc_bos_trig_all',    tier:'mythic',   category:'DEEP CUTS',  name:'Every Trigger Found',        desc:'Discover all 480 BoS triggers.',                                       counter:'bos_triggers',     target:480,  reward:{type:'trophy', amt:1, name:'Every Trigger Found'}},
    {id:'dc_compost_first',   tier:'bronze',   category:'DEEP CUTS',  name:'A First Letting Go',         desc:'Compost your first plant.',                                            counter:'compost_total',    target:1,    reward:{type:'dew', amt:15}},
    {id:'dc_compost_50',      tier:'silver',   category:'DEEP CUTS',  name:'Fifty Returnings',           desc:'Compost 50 plants.',                                                   counter:'compost_total',    target:50,   reward:{type:'dew', amt:80}},
    {id:'dc_compost_500',     tier:'gold',     category:'DEEP CUTS',  name:'Five Hundred Returnings',    desc:'Compost 500 plants.',                                                  counter:'compost_total',    target:500,  reward:{type:'dew', amt:200}},
    {id:'dc_no_compost_year', tier:'gold',     category:'DEEP CUTS',  name:'A Year Without Loss',        desc:'Go a full year without composting any plant.',                         counter:'days_no_compost',  target:365,  reward:{type:'dew', amt:300}, hidden:true},
    {id:'dc_first_quartet',   tier:'bronze',   category:'DEEP CUTS',  name:'Four Tabs Visited',          desc:'Visit all four tabs in one session.',                                  counter:'tabs_in_session',  target:4,    reward:{type:'dew', amt:10}},
    {id:'dc_quiet_keeper',    tier:'silver',   category:'DEEP CUTS',  name:'A Quiet Tender',             desc:'Tend 50 plants without composting any of them.',                       counter:'tend_no_compost',  target:50,   reward:{type:'dew', amt:60}, hidden:true},
    {id:'dc_minimalist',      tier:'gold',     category:'DEEP CUTS',  name:'The Minimalist',             desc:'Reach Keeper level 50 with under 10 plants in greenhouse.',            counter:'',                 target:1,    reward:{type:'dew', amt:200}, hidden:true},
    {id:'dc_polymath',        tier:'platinum', category:'DEEP CUTS',  name:'The Polymath',               desc:'Earn at least one achievement in every category.',                     counter:'cat_completion',   target:9,    reward:{type:'dew', amt:400}},
    {id:'dc_completionist_75',tier:'mythic',   category:'DEEP CUTS',  name:'Three Quarters Done',        desc:'Earn 75% of all lifetime achievements.',                               counter:'',                 target:1,    reward:{type:'trophy', amt:1, name:'Three Quarters Done'}},
    {id:'dc_completionist_99',tier:'mythic',   category:'DEEP CUTS',  name:'A Garden Whole',             desc:'Earn 99% of all lifetime achievements.',                               counter:'',                 target:1,    reward:{type:'trophy', amt:1, name:'A Garden Whole'}},
    {id:'dc_quiet_donor',     tier:'silver',   category:'DEEP CUTS',  name:'A Quiet Donor',              desc:'Tip the Hermit at the Hut.',                                           counter:'hermit_tips',      target:1,    reward:{type:'dew', amt:50}, hidden:true},
    {id:'dc_no_skip',         tier:'gold',     category:'DEEP CUTS',  name:'No Acceleration',            desc:'Bloom 25 nursery seeds without spending Dew to skip days.',            counter:'bloom_no_skip',    target:25,   reward:{type:'dew', amt:200}, hidden:true},
    {id:'dc_old_browser',     tier:'silver',   category:'DEEP CUTS',  name:'A Patient Reader',           desc:'Open the app on 5 different devices.',                                 counter:'devices_seen',     target:5,    reward:{type:'dew', amt:50}, hidden:true}
  ];

  // ─── DAILY CHALLENGE POOL ───────────────────────────────────────────────
  var DAILIES = [
    {id:'d_tend_3',           name:'Tend three wild plants today.',                          counter:'d_tend',         target:3,    reward:{type:'dew', amt:8}},
    {id:'d_tend_5',           name:'Tend five wild plants today.',                           counter:'d_tend',         target:5,    reward:{type:'dew', amt:12}},
    {id:'d_tend_10',          name:'Tend ten wild plants today.',                            counter:'d_tend',         target:10,   reward:{type:'dew', amt:15}},
    {id:'d_water_own_3',      name:'Water three of your own wild plants.',                   counter:'d_water_own',    target:3,    reward:{type:'dew', amt:8}},
    {id:'d_water_stranger',   name:'Water a stranger plant.',                                counter:'d_water_str',    target:1,    reward:{type:'dew', amt:10}},
    {id:'d_water_strangers_3',name:'Water three stranger plants.',                           counter:'d_water_str',    target:3,    reward:{type:'dew', amt:14}},
    {id:'d_mass_water',       name:'Mass water all your eligible wild plants.',              counter:'d_mass_water',   target:1,    reward:{type:'dew', amt:10}},
    {id:'d_drop_1',           name:'Drop one wild plant somewhere new.',                     counter:'d_drop',         target:1,    reward:{type:'dew', amt:8}},
    {id:'d_drop_3',           name:'Drop three wild plants today.',                          counter:'d_drop',         target:3,    reward:{type:'dew', amt:14}},
    {id:'d_feral_1',          name:'Catch one feral seed.',                                  counter:'d_feral',        target:1,    reward:{type:'dew', amt:10}},
    {id:'d_feral_2',          name:'Catch two feral seeds.',                                 counter:'d_feral',        target:2,    reward:{type:'dew', amt:14}},
    {id:'d_forage_1',         name:'Solve one foraging puzzle.',                             counter:'d_forage',       target:1,    reward:{type:'dew', amt:10}},
    {id:'d_forage_3',         name:'Solve three foraging puzzles.',                          counter:'d_forage',       target:3,    reward:{type:'dew', amt:15}},
    {id:'d_walk_500',         name:'Walk 500 meters on the Wild map.',                       counter:'d_meters',       target:500,  reward:{type:'dew', amt:8}},
    {id:'d_walk_1k',          name:'Walk one kilometer.',                                    counter:'d_meters',       target:1000, reward:{type:'dew', amt:12}},
    {id:'d_walk_2k',          name:'Walk two kilometers.',                                   counter:'d_meters',       target:2000, reward:{type:'dew', amt:15}},
    {id:'d_steps_500',        name:'Take five hundred steps.',                               counter:'d_steps',        target:500,  reward:{type:'dew', amt:8}},
    {id:'d_steps_2k',         name:'Take two thousand steps.',                               counter:'d_steps',        target:2000, reward:{type:'dew', amt:14}},
    {id:'d_game_1',           name:'Win a mini game.',                                       counter:'d_game_win',     target:1,    reward:{type:'dew', amt:8}},
    {id:'d_game_3',           name:'Win three mini games.',                                  counter:'d_game_win',     target:3,    reward:{type:'dew', amt:14}},
    {id:'d_game_two_kinds',   name:'Win two different mini games today.',                    counter:'d_game_kinds',   target:2,    reward:{type:'dew', amt:12}},
    {id:'d_game_five_kinds',  name:'Win five different mini games today.',                   counter:'d_game_kinds',   target:5,    reward:{type:'dew', amt:15}},
    {id:'d_breed_1',          name:'Cross pollinate once.',                                  counter:'d_breed',        target:1,    reward:{type:'dew', amt:10}},
    {id:'d_breed_2',          name:'Cross pollinate twice.',                                 counter:'d_breed',        target:2,    reward:{type:'dew', amt:14}},
    {id:'d_breed_wild',       name:'Cross pollinate with a wild plant.',                     counter:'d_breed_wild',   target:1,    reward:{type:'dew', amt:12}},
    {id:'d_clipping_1',       name:'Take one clipping.',                                     counter:'d_clipping',     target:1,    reward:{type:'dew', amt:10}},
    {id:'d_mint_1',           name:'Mint one plant.',                                        counter:'d_mint',         target:1,    reward:{type:'dew', amt:10}},
    {id:'d_mint_2',           name:'Mint two plants.',                                       counter:'d_mint',         target:2,    reward:{type:'dew', amt:15}},
    {id:'d_compost_1',        name:'Compost one plant.',                                     counter:'d_compost',      target:1,    reward:{type:'dew', amt:8}},
    {id:'d_box_1',            name:'Open a mystery box.',                                    counter:'d_box',          target:1,    reward:{type:'dew', amt:8}},
    {id:'d_box_3',            name:'Open three mystery boxes.',                              counter:'d_box',          target:3,    reward:{type:'dew', amt:14}},
    {id:'d_swap_companion',   name:'Equip a companion you have not used this week.',         counter:'d_swap_comp',    target:1,    reward:{type:'dew', amt:10}},
    {id:'d_tap_5_new_wilds',  name:'Tap five wild plants you have not seen before.',         counter:'d_tap_new',      target:5,    reward:{type:'dew', amt:10}},
    {id:'d_spend_50_dew',     name:'Spend fifty Dew at the Hut.',                            counter:'d_dew_spent',    target:50,   reward:{type:'dew', amt:8}},
    {id:'d_read_3_bos',       name:'Read three Book of Secrets pages you have not read.',    counter:'d_bos_read',     target:3,    reward:{type:'dew', amt:10}},
    {id:'d_read_5_bos',       name:'Read five Book of Secrets pages.',                       counter:'d_bos_read',     target:5,    reward:{type:'dew', amt:14}},
    {id:'d_trigger_disc',     name:'Discover one new BoS trigger.',                          counter:'d_trigger',      target:1,    reward:{type:'dew', amt:12}},
    {id:'d_synergy_disc',     name:'Discover one new synergy.',                              counter:'d_synergy',      target:1,    reward:{type:'dew', amt:12}},
    {id:'d_match_30_sb',      name:'Earn thirty Sunbeams from games today.',                 counter:'d_sunbeams',     target:30,   reward:{type:'dew', amt:14}},
    {id:'d_match_60_sb',      name:'Earn sixty Sunbeams from games today.',                  counter:'d_sunbeams',     target:60,   reward:{type:'dew', amt:15}},
    {id:'d_water_streak',     name:'Add a day to your water streak.',                        counter:'d_water_streak', target:1,    reward:{type:'dew', amt:8}},
    {id:'d_visit_4_tabs',     name:'Visit all four tabs.',                                   counter:'d_tabs',         target:4,    reward:{type:'dew', amt:8}},
    {id:'d_visit_wild_5min',  name:'Spend five minutes on the Wild tab.',                    counter:'d_wild_secs',    target:300,  reward:{type:'dew', amt:8}},
    {id:'d_visit_gh_5min',    name:'Spend five minutes in the Greenhouse.',                  counter:'d_gh_secs',      target:300,  reward:{type:'dew', amt:8}},
    {id:'d_browse_carousel',  name:'Open three plants in the carousel.',                     counter:'d_carousel',     target:3,    reward:{type:'dew', amt:8}},
    {id:'d_inspect_plant',    name:'Flip a plant card to read its DNA.',                     counter:'d_flip_card',    target:1,    reward:{type:'dew', amt:8}},
    {id:'d_share_1',          name:'Share a plant.',                                         counter:'d_share',        target:1,    reward:{type:'dew', amt:10}},
    {id:'d_download_1',       name:'Download a plant card.',                                 counter:'d_download',     target:1,    reward:{type:'dew', amt:10}},
    {id:'d_nursery_water',    name:'Water a nursery seed.',                                  counter:'d_nursery',      target:1,    reward:{type:'dew', amt:8}},
    {id:'d_nursery_bloom',    name:'Bloom a nursery seed.',                                  counter:'d_bloom',        target:1,    reward:{type:'dew', amt:14}},
    {id:'d_use_tool',         name:'Use one tool from your inventory.',                      counter:'d_tool_use',     target:1,    reward:{type:'dew', amt:10}},
    {id:'d_use_two_tools',    name:'Use two different tools.',                               counter:'d_tool_kinds',   target:2,    reward:{type:'dew', amt:14}},
    {id:'d_dawn_open',        name:'Open the app between 5am and 7am.',                      counter:'d_dawn',         target:1,    reward:{type:'dew', amt:10}},
    {id:'d_dusk_open',        name:'Open the app between 6pm and 9pm.',                      counter:'d_dusk',         target:1,    reward:{type:'dew', amt:10}},
    {id:'d_weather_summon',   name:'Summon weather once.',                                   counter:'d_weather',      target:1,    reward:{type:'dew', amt:12}},
    {id:'d_two_seasons',      name:'Hold plants from two different seasons in greenhouse.',  counter:'d_season_check', target:1,    reward:{type:'dew', amt:8}},
    {id:'d_three_seasons',    name:'Hold plants from three different seasons.',              counter:'d_season_check', target:1,    reward:{type:'dew', amt:10}},
    {id:'d_take_wild_photo',  name:'Open a stranger plant card on the map.',                 counter:'d_str_inspect',  target:1,    reward:{type:'dew', amt:8}},
    {id:'d_pet_companion',    name:'Tap your equipped companion.',                           counter:'d_pet',          target:1,    reward:{type:'dew', amt:5}},
    {id:'d_check_journal',    name:'Open your Field Journal.',                               counter:'d_journal',      target:1,    reward:{type:'dew', amt:5}},
    {id:'d_check_compendium', name:'Open the Compendium.',                                   counter:'d_compendium',   target:1,    reward:{type:'dew', amt:5}},
    {id:'d_collect_3_dew',    name:'Collect at least 25 Dew today.',                         counter:'d_dew_earned',   target:25,   reward:{type:'dew', amt:8}},
    {id:'d_long_session',     name:'Spend ten minutes in the app today.',                    counter:'d_session_secs', target:600,  reward:{type:'dew', amt:10}},
    {id:'d_two_wilds_check',  name:'Check on two of your wild plants.',                      counter:'d_wild_check',   target:2,    reward:{type:'dew', amt:8}},
    {id:'d_two_kinds_substr', name:'Mint two plants with different substrates today.',       counter:'d_substr_kinds', target:2,    reward:{type:'dew', amt:14}},
    {id:'d_pickup_packback',  name:'Move one plant from backpack to greenhouse.',            counter:'d_bp_move',      target:1,    reward:{type:'dew', amt:8}},
    {id:'d_first_play',       name:'Play your first game of the day.',                       counter:'d_first_play',   target:1,    reward:{type:'dew', amt:5}},
    {id:'d_check_orient',     name:'Open the Orientation card.',                             counter:'d_orient',       target:1,    reward:{type:'dew', amt:5}},
    {id:'d_drop_three_zones', name:'Drop plants in three different hexes today.',            counter:'d_hex_drop',     target:3,    reward:{type:'dew', amt:14}},
    {id:'d_keepers_tree',     name:'Spend a Keeper Tree point.',                             counter:'d_tree_point',   target:1,    reward:{type:'dew', amt:10}},
    {id:'d_collect_one_box',  name:'Earn a mystery box today.',                              counter:'d_box_earned',   target:1,    reward:{type:'dew', amt:10}},
    {id:'d_use_an_item',      name:'Use one item from your stash.',                          counter:'d_item_used',    target:1,    reward:{type:'dew', amt:10}},
    {id:'d_lookat_lineage',   name:'View a plant lineage.',                                  counter:'d_lineage',      target:1,    reward:{type:'dew', amt:8}},
    {id:'d_record_haiku',     name:'Read a plant haiku.',                                    counter:'d_haiku',        target:1,    reward:{type:'dew', amt:5}},
    {id:'d_water_3_seasons',  name:'Water plants of three different seasons today.',         counter:'d_water_seasons',target:3,    reward:{type:'dew', amt:14}},
    {id:'d_complete_2_dailies',name:'Complete two other daily tasks.',                       counter:'d_complete_2_dailies',target:2,reward:{type:'dew', amt:8}},
    {id:'d_quiet_walk',       name:'Walk without playing a game (200m on Wild).',            counter:'d_quiet_meters', target:200,  reward:{type:'dew', amt:6}},
    {id:'d_compost_legacy',   name:'Compost a plant older than 30 days.',                    counter:'d_compost_old',  target:1,    reward:{type:'dew', amt:12}, hidden:true},
    {id:'d_clip_two_plants',  name:'Take two clippings today.',                              counter:'d_clipping',     target:2,    reward:{type:'dew', amt:14}}
  ];

  // ─── WEEKLY CHALLENGE POOL ──────────────────────────────────────────────
  var WEEKLIES = [
    {id:'w_tend_25',          name:'Tend twenty five wild plants this week.',                counter:'w_tend',         target:25,   reward:{type:'dew', amt:35}},
    {id:'w_tend_50',          name:'Tend fifty wild plants this week.',                      counter:'w_tend',         target:50,   reward:{type:'dew', amt:50}},
    {id:'w_tend_100',         name:'Tend a hundred wild plants this week.',                  counter:'w_tend',         target:100,  reward:{type:'dew', amt:60}},
    {id:'w_strangers_15',     name:'Tend fifteen stranger plants this week.',                counter:'w_str',          target:15,   reward:{type:'dew', amt:40}},
    {id:'w_strangers_50',     name:'Tend fifty stranger plants this week.',                  counter:'w_str',          target:50,   reward:{type:'dew', amt:60}},
    {id:'w_walk_5km',         name:'Walk five kilometers this week.',                        counter:'w_meters',       target:5000, reward:{type:'dew', amt:40}},
    {id:'w_walk_15km',        name:'Walk fifteen kilometers this week.',                     counter:'w_meters',       target:15000,reward:{type:'dew', amt:55}},
    {id:'w_walk_30km',        name:'Walk thirty kilometers this week.',                      counter:'w_meters',       target:30000,reward:{type:'dew', amt:60}},
    {id:'w_steps_15k',        name:'Take fifteen thousand steps this week.',                 counter:'w_steps',        target:15000,reward:{type:'dew', amt:40}},
    {id:'w_steps_40k',        name:'Take forty thousand steps this week.',                   counter:'w_steps',        target:40000,reward:{type:'dew', amt:55}},
    {id:'w_games_10',         name:'Win ten mini games this week.',                          counter:'w_game_win',     target:10,   reward:{type:'dew', amt:35}},
    {id:'w_games_30',         name:'Win thirty mini games this week.',                       counter:'w_game_win',     target:30,   reward:{type:'dew', amt:55}},
    {id:'w_games_5kinds',     name:'Win five different mini game types this week.',          counter:'w_game_kinds',   target:5,    reward:{type:'dew', amt:45}},
    {id:'w_games_10kinds',    name:'Win ten different mini game types this week.',           counter:'w_game_kinds',   target:10,   reward:{type:'dew', amt:60}},
    {id:'w_mint_5',           name:'Mint five plants this week.',                            counter:'w_mint',         target:5,    reward:{type:'dew', amt:40}},
    {id:'w_mint_15',          name:'Mint fifteen plants this week.',                         counter:'w_mint',         target:15,   reward:{type:'dew', amt:60}},
    {id:'w_breed_5',          name:'Cross pollinate five times this week.',                  counter:'w_breed',        target:5,    reward:{type:'dew', amt:40}},
    {id:'w_breed_15',         name:'Cross pollinate fifteen times this week.',               counter:'w_breed',        target:15,   reward:{type:'dew', amt:55}},
    {id:'w_clip_10',          name:'Take ten clippings this week.',                          counter:'w_clipping',     target:10,   reward:{type:'dew', amt:40}},
    {id:'w_feral_5',          name:'Catch five feral seeds this week.',                      counter:'w_feral',        target:5,    reward:{type:'dew', amt:40}},
    {id:'w_feral_15',         name:'Catch fifteen feral seeds this week.',                   counter:'w_feral',        target:15,   reward:{type:'dew', amt:55}},
    {id:'w_forage_15',        name:'Solve fifteen foraging puzzles this week.',              counter:'w_forage',       target:15,   reward:{type:'dew', amt:45}},
    {id:'w_forage_30',        name:'Solve thirty foraging puzzles this week.',               counter:'w_forage',       target:30,   reward:{type:'dew', amt:60}},
    {id:'w_dailies_5',        name:'Complete five daily challenges this week.',              counter:'w_daily_done',   target:5,    reward:{type:'dew', amt:35}},
    {id:'w_dailies_15',       name:'Complete fifteen daily challenges this week.',           counter:'w_daily_done',   target:15,   reward:{type:'dew', amt:55}},
    {id:'w_bos_5',            name:'Discover five new BoS triggers this week.',              counter:'w_bos',          target:5,    reward:{type:'dew', amt:40}},
    {id:'w_synergy_3',        name:'Discover three new synergies this week.',                counter:'w_synergy',      target:3,    reward:{type:'dew', amt:40}},
    {id:'w_hunt_2',           name:'Catch two hunt fireflies this week.',                    counter:'w_hunt',         target:2,    reward:{type:'dew', amt:45}},
    {id:'w_hunt_5',           name:'Catch five hunt fireflies this week.',                   counter:'w_hunt',         target:5,    reward:{type:'dew', amt:60}},
    {id:'w_biomes_3',         name:'Visit three different biomes this week.',                counter:'w_biomes',       target:3,    reward:{type:'dew', amt:40}},
    {id:'w_hexes_10',         name:'Plant in ten different hexes this week.',                counter:'w_hexes',        target:10,   reward:{type:'dew', amt:45}},
    {id:'w_drop_10',          name:'Drop ten wild plants this week.',                        counter:'w_drop',         target:10,   reward:{type:'dew', amt:40}},
    {id:'w_storm_survive',    name:'Survive a real weather storm event.',                    counter:'w_storm',        target:1,    reward:{type:'dew', amt:50}},
    {id:'w_water_streak_7',   name:'Maintain a seven day watering streak.',                  counter:'w_water_streak', target:7,    reward:{type:'dew', amt:55}},
    {id:'w_login_7',          name:'Open the app every day this week.',                      counter:'w_login_days',   target:7,    reward:{type:'dew', amt:50}},
    {id:'w_compost_5',        name:'Compost five plants this week.',                         counter:'w_compost',      target:5,    reward:{type:'dew', amt:40}},
    {id:'w_collect_300_dew',  name:'Collect three hundred Dew this week.',                   counter:'w_dew_earned',   target:300,  reward:{type:'dew', amt:35}},
    {id:'w_box_15',           name:'Open fifteen mystery boxes this week.',                  counter:'w_box',          target:15,   reward:{type:'dew', amt:45}},
    {id:'w_pots_5',           name:'See five new pot designs this week.',                    counter:'w_pots',         target:5,    reward:{type:'dew', amt:40}},
    {id:'w_leaves_10',        name:'See ten new leaf forms this week.',                      counter:'w_leaves',       target:10,   reward:{type:'dew', amt:40}},
    {id:'w_flowers_10',       name:'See ten new flower forms this week.',                    counter:'w_flowers',      target:10,   reward:{type:'dew', amt:40}},
    {id:'w_companion_3',      name:'Meet three new companions this week.',                   counter:'w_comps',        target:3,    reward:{type:'dew', amt:45}},
    {id:'w_chimera_g2',       name:'Breed a Gen 2 or higher chimera this week.',             counter:'w_chimera',      target:1,    reward:{type:'dew', amt:50}},
    {id:'w_seasons_4_holding',name:'End the week holding plants from all four seasons.',     counter:'w_seasons_full', target:1,    reward:{type:'dew', amt:55}},
    {id:'w_grades_3',         name:'Mint three different grade tiers this week.',            counter:'w_grade_kinds',  target:3,    reward:{type:'dew', amt:50}},
    {id:'w_no_compost',       name:'Go a full week without composting any plant.',           counter:'w_no_compost',   target:1,    reward:{type:'dew', amt:50}, hidden:true},
    {id:'w_three_classes',    name:'Use three different class powers this week.',            counter:'w_class_use',    target:3,    reward:{type:'dew', amt:45}},
    {id:'w_dawn_3',           name:'Open the app at dawn three days this week.',             counter:'w_dawn_days',    target:3,    reward:{type:'dew', amt:40}},
    {id:'w_evening_3',        name:'Open the app in the evening three days this week.',     counter:'w_dusk_days',    target:3,    reward:{type:'dew', amt:40}},
    {id:'w_quiet_listener',   name:'Read ten BoS pages this week.',                          counter:'w_bos_read',     target:10,   reward:{type:'dew', amt:40}},
    {id:'w_perfect_dailies',  name:'Complete every daily challenge for three days.',          counter:'w_perfect_days', target:3,    reward:{type:'dew', amt:55}}
  ];

  // ─── REWARD GRANT ────────────────────────────────────────────────────────
  function grantReward(reward){
    if (!reward || !reward.type) return;
    var amt = reward.amt || 0;
    try {
      if (reward.type === 'dew') {
        if (typeof window.earnDew === 'function') window.earnDew(amt, 'achievement');
      } else if (reward.type === 'sunbeam') {
        if (amt > 5) amt = 5;
        if (typeof window.earnHashes === 'function') window.earnHashes(amt);
      } else if (reward.type === 'pollen') {
        if (typeof window.PW_grantXP === 'function') window.PW_grantXP(amt, 'achievement');
      } else if (reward.type === 'box') {
        if (window.LW_BOXES && window.LW_BOXES.add) window.LW_BOXES.add(amt || 1);
      } else if (reward.type === 'trophy' || reward.type === 'lore') {
        var trophies = _read(TROPHY_KEY, []);
        trophies.push({name: reward.name || 'Trophy', t: Date.now(), kind: reward.type});
        _write(TROPHY_KEY, trophies);
      }
    } catch(e){}
  }

  // ─── PROGRESS / COMPLETION ──────────────────────────────────────────────
  function isAchDone(id){
    var p = _read(PROGRESS_KEY, {});
    return !!p[id];
  }
  function markAchDone(ach){
    var p = _read(PROGRESS_KEY, {});
    if (p[ach.id]) return false;
    // Stephen 2026-04-30 LATE LATE LATE LATE: rewards no longer auto-grant
    // on completion. Player must tap CLAIM in the QUESTS panel. Stamp
    // claimed:false so the legacy migration (which sets claimed:true on
    // entries missing the field) never claims this for them.
    p[ach.id] = {at: Date.now(), tier: ach.tier, claimed: false};
    _write(PROGRESS_KEY, p);
    try { if (typeof gtag !== 'undefined') gtag('event', 'achievement_earned', {ach_id: ach.id, tier: ach.tier, category: ach.category}); } catch(e){}
    return true;
  }

  // ─── DAILY / WEEKLY PICKS (deterministic) ───────────────────────────────
  function _pickN(pool, n, seed){
    var arr = pool.slice();
    var s = seed | 0;
    for (var i = arr.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var j = s % (i + 1);
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    var out = [];
    for (var k = 0; k < n && k < arr.length; k++) out.push(arr[k].id);
    return out;
  }

  function dailies(){
    var today = _todayKey();
    var st = _read(DAILY_KEY, null);
    if (!st || st.date !== today) {
      var seed = (_yearDayIndex() + _uidHash()) | 0;
      st = {date: today, picks: _pickN(DAILIES, 3, seed), done: []};
      _write(DAILY_KEY, st);
      var c = _getCounters();
      for (var k in c) { if (k.indexOf('d_') === 0) delete c[k]; }
      _markCountersDirty();
      _flushCounters();
    }
    return st;
  }
  function weeklies(){
    var monday = _mondayOfWeek();
    var st = _read(WEEKLY_KEY, null);
    if (!st || st.monday !== monday) {
      var jan1 = new Date(new Date().getFullYear(),0,1);
      var weekIdx = Math.floor((Date.now() - jan1.getTime()) / (7 * 86400000));
      var seed = ((weekIdx * 97) + _uidHash() + 31) | 0;
      st = {monday: monday, picks: _pickN(WEEKLIES, 3, seed), done: []};
      _write(WEEKLY_KEY, st);
      var c2 = _getCounters();
      for (var k2 in c2) { if (k2.indexOf('w_') === 0) delete c2[k2]; }
      _markCountersDirty();
      _flushCounters();
    }
    return st;
  }

  var DAILY_BY_ID = {};
  for (var di = 0; di < DAILIES.length; di++) DAILY_BY_ID[DAILIES[di].id] = DAILIES[di];
  var WEEKLY_BY_ID = {};
  for (var wi = 0; wi < WEEKLIES.length; wi++) WEEKLY_BY_ID[WEEKLIES[wi].id] = WEEKLIES[wi];
  var ACH_BY_ID = {};
  for (var ai = 0; ai < ACH.length; ai++) ACH_BY_ID[ACH[ai].id] = ACH[ai];

  // ─── CHECK PASS ─────────────────────────────────────────────────────────
  function _checkLifetime(){
    var newAch = [];
    var c = _getCounters();
    var p = _read(PROGRESS_KEY, {});
    try {
      var disc = JSON.parse(localStorage.getItem('lw_triggers_discovered')||'[]') || [];
      c.bos_triggers = disc.length || c.bos_triggers || 0;
    } catch(e){}
    try {
      var gh = JSON.parse(localStorage.getItem('sws_greenhouse')||'[]');
      var slotsCap = parseInt(localStorage.getItem('sws_greenhouse_slots')||'10');
      if (gh.length >= slotsCap && slotsCap > 0) c.gh_full = 1;
      c.gh_max_slots = slotsCap;
      var potsSet = {}, seasons = {}, tiers = {};
      for (var gi = 0; gi < gh.length; gi++) {
        try {
          var t = window.hashToTraits ? window.hashToTraits(gh[gi].hash) : null;
          if (t) {
            potsSet[t.pot] = true;
            if (typeof t.season === 'number') seasons[t.season] = true;
            if (window.getTerraGrade) {
              var g = window.getTerraGrade(t);
              if (g && g.name) tiers[g.name] = true;
            }
          }
        } catch(e){}
      }
      c.pots_owned_unique = Object.keys(potsSet).length;
      if (Object.keys(tiers).length >= 7) {
        if (!p['col_grade_full_set']) markAchDone(ACH_BY_ID['col_grade_full_set']);
      }
      if (Object.keys(seasons).length >= 4) {
        if (!p['col_seasons_4']) markAchDone(ACH_BY_ID['col_seasons_4']);
      }
      _markCountersDirty();
    } catch(e){}
    for (var i = 0; i < ACH.length; i++) {
      var a = ACH[i];
      if (p[a.id]) continue;
      if (!a.counter || a.target == null) continue;
      var v = c[a.counter] || 0;
      if (v >= a.target) {
        if (markAchDone(a)) newAch.push(a.id);
      }
    }
    if (!p['dc_polymath']) {
      var cats = {};
      var p2 = _read(PROGRESS_KEY, {});
      for (var aid in p2) { var aa = ACH_BY_ID[aid]; if (aa) cats[aa.category] = true; }
      if (Object.keys(cats).length >= 9) {
        if (markAchDone(ACH_BY_ID['dc_polymath'])) newAch.push('dc_polymath');
      }
    }
    var pNow = _read(PROGRESS_KEY, {});
    var done = 0; for (var aid2 in pNow) done++;
    var pct = done / ACH.length;
    if (pct >= 0.75 && !pNow['dc_completionist_75']) { if (markAchDone(ACH_BY_ID['dc_completionist_75'])) newAch.push('dc_completionist_75'); }
    if (pct >= 0.99 && !pNow['dc_completionist_99']) { if (markAchDone(ACH_BY_ID['dc_completionist_99'])) newAch.push('dc_completionist_99'); }
    return newAch;
  }

  function _checkDaily(){
    var st = dailies();
    var c = _getCounters();
    var newDone = [];
    for (var i = 0; i < st.picks.length; i++) {
      var id = st.picks[i];
      if (st.done.indexOf(id) >= 0) continue;
      var d = DAILY_BY_ID[id];
      if (!d) continue;
      var v = c[d.counter] || 0;
      if (v >= d.target) {
        st.done.push(id);
        newDone.push(id);
        bump('daily_done', 1);
        bump('w_daily_done', 1);
        bump('d_complete_2_dailies', 1);
        // Auto-grant retired 2026-04-30 — player claims manually in QUESTS.
        try { if (typeof gtag !== 'undefined') gtag('event', 'daily_done', {id: id}); } catch(e){}
      }
    }
    _write(DAILY_KEY, st);
    return newDone;
  }

  function _checkWeekly(){
    var st = weeklies();
    var c = _getCounters();
    var newDone = [];
    for (var i = 0; i < st.picks.length; i++) {
      var id = st.picks[i];
      if (st.done.indexOf(id) >= 0) continue;
      var w = WEEKLY_BY_ID[id];
      if (!w) continue;
      var v = c[w.counter] || 0;
      if (v >= w.target) {
        st.done.push(id);
        newDone.push(id);
        bump('weekly_done', 1);
        // Auto-grant retired 2026-04-30 — player claims manually in QUESTS.
        try { if (typeof gtag !== 'undefined') gtag('event', 'weekly_done', {id: id}); } catch(e){}
      }
    }
    _write(WEEKLY_KEY, st);
    return newDone;
  }

  function checkAll(){
    dailies(); weeklies();
    var newAch     = _checkLifetime();
    var newDaily   = _checkDaily();
    if (newDaily.length) {
      var more = _checkLifetime();
      for (var i = 0; i < more.length; i++) newAch.push(more[i]);
    }
    var newWeekly  = _checkWeekly();
    if (newWeekly.length) {
      var more2 = _checkLifetime();
      for (var j = 0; j < more2.length; j++) newAch.push(more2[j]);
    }
    return {newAch: newAch, newDailyDone: newDaily, newWeeklyDone: newWeekly};
  }

  // ─── LOGIN STREAK ───────────────────────────────────────────────────────
  function _bumpLoginStreak(){
    try {
      var today = _todayKey();
      var raw = localStorage.getItem('lw_ach_login') || '{}';
      var s = {};
      try { s = JSON.parse(raw) || {}; } catch(e){ s = {}; }
      if (s.lastDate === today) return;
      var y = new Date(Date.now() - 86400000);
      var yKey = y.getFullYear()+'-'+_pad2(y.getMonth()+1)+'-'+_pad2(y.getDate());
      if (s.lastDate === yKey) {
        s.streak = (s.streak || 0) + 1;
      } else {
        s.streak = 1;
      }
      s.lastDate = today;
      s.totalDays = (s.totalDays || 0) + 1;
      localStorage.setItem('lw_ach_login', JSON.stringify(s));
      setCounter('login_streak', s.streak);
      setCounter('login_days_total', s.totalDays);
      bump('w_login_days', 1);
    } catch(e){}
  }

  function markDone(achId){
    var a = ACH_BY_ID[achId];
    if (!a) return false;
    return markAchDone(a);
  }

  // ─── CLAIM (manual reward collection) ──────────────────────────────────
  // Stephen 2026-04-30 LATE LATE LATE LATE — completed quests/achievements
  // no longer auto-pay. Player taps CLAIM in the QUESTS UI to collect.
  // kind: 'ach' | 'daily' | 'weekly'
  function isClaimed(kind, id){
    if (kind === 'ach') {
      var p = _read(PROGRESS_KEY, {});
      var entry = p[id];
      if (!entry) return true; // not earned yet, treat as nothing-to-claim
      return entry.claimed !== false;
    }
    if (kind === 'daily') {
      var st = dailies();
      if ((st.done || []).indexOf(id) < 0) return true;
      return (st.claimed || []).indexOf(id) >= 0;
    }
    if (kind === 'weekly') {
      var st2 = weeklies();
      if ((st2.done || []).indexOf(id) < 0) return true;
      return (st2.claimed || []).indexOf(id) >= 0;
    }
    return true;
  }
  function claim(kind, id){
    if (kind === 'ach') {
      var p = _read(PROGRESS_KEY, {});
      var entry = p[id];
      if (!entry || entry.claimed) return false;
      var ach = ACH_BY_ID[id];
      if (!ach) return false;
      entry.claimed = true;
      _write(PROGRESS_KEY, p);
      grantReward(ach.reward);
      try { if (typeof gtag !== 'undefined') gtag('event', 'achievement_claimed', {ach_id: id}); } catch(e){}
      return ach.reward || true;
    }
    if (kind === 'daily') {
      var st = dailies();
      if ((st.done || []).indexOf(id) < 0) return false;
      if (!st.claimed) st.claimed = [];
      if (st.claimed.indexOf(id) >= 0) return false;
      var d = DAILY_BY_ID[id];
      if (!d) return false;
      st.claimed.push(id);
      _write(DAILY_KEY, st);
      grantReward(d.reward);
      try { if (typeof gtag !== 'undefined') gtag('event', 'daily_claimed', {id: id}); } catch(e){}
      return d.reward || true;
    }
    if (kind === 'weekly') {
      var st2 = weeklies();
      if ((st2.done || []).indexOf(id) < 0) return false;
      if (!st2.claimed) st2.claimed = [];
      if (st2.claimed.indexOf(id) >= 0) return false;
      var w = WEEKLY_BY_ID[id];
      if (!w) return false;
      st2.claimed.push(id);
      _write(WEEKLY_KEY, st2);
      grantReward(w.reward);
      try { if (typeof gtag !== 'undefined') gtag('event', 'weekly_claimed', {id: id}); } catch(e){}
      return w.reward || true;
    }
    return false;
  }
  // One-shot migration on first load after the auto-grant → manual-claim
  // switch. Existing players already received their auto-grants under the
  // old system, so mark every already-completed entry as claimed to prevent
  // double-payout. New completions write claimed:false so the migration
  // never touches them.
  function _migrateClaim(){
    try {
      var p = _read(PROGRESS_KEY, {});
      var changed = false;
      for (var id in p) {
        if (!p.hasOwnProperty(id)) continue;
        if (p[id] && p[id].claimed === undefined) {
          p[id].claimed = true;
          changed = true;
        }
      }
      if (changed) _write(PROGRESS_KEY, p);
      var d = _read(DAILY_KEY, null);
      if (d && d.done && !d.claimed) {
        d.claimed = d.done.slice();
        _write(DAILY_KEY, d);
      }
      var w = _read(WEEKLY_KEY, null);
      if (w && w.done && !w.claimed) {
        w.claimed = w.done.slice();
        _write(WEEKLY_KEY, w);
      }
    } catch(e){}
  }
  _migrateClaim();

  // ─── PUBLIC API ─────────────────────────────────────────────────────────
  window.LW_ACH = {
    bump: bump,
    get: get,
    set: setCounter,
    checkAll: checkAll,
    grantReward: grantReward,
    dailies: dailies,
    weeklies: weeklies,
    markDone: markDone,
    isDone: isAchDone,
    isClaimed: isClaimed,
    claim: claim,
    catalog: ACH,
    dailyPool: DAILIES,
    weeklyPool: WEEKLIES,
    progress: function(){ return _read(PROGRESS_KEY, {}); },
    counters: function(){ return _getCounters(); },
    trophies: function(){ return _read(TROPHY_KEY, []); },
    _resetDay:  function(){ localStorage.removeItem(DAILY_KEY); },
    _resetWeek: function(){ localStorage.removeItem(WEEKLY_KEY); },
    _resetAll:  function(){
      _countersCache = {};
      _countersDirty = false;
      if (_countersFlushT) { clearTimeout(_countersFlushT); _countersFlushT = null; }
      localStorage.removeItem(COUNTERS_KEY);
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(DAILY_KEY);
      localStorage.removeItem(WEEKLY_KEY);
      localStorage.removeItem(TROPHY_KEY);
      localStorage.removeItem('lw_ach_login');
    },
    _flush: _flushCounters
  };

  setTimeout(function(){
    _bumpLoginStreak();
    bump('d_first_play', 1);
    var hr = new Date().getHours();
    if (hr >= 5 && hr <= 7) bump('d_dawn', 1);
    if (hr >= 18 && hr <= 21) bump('d_dusk', 1);
    if (hr >= 5 && hr <= 7) bump('w_dawn_days', 1);
    if (hr >= 18 && hr <= 21) bump('w_dusk_days', 1);
    if (hr >= 3 && hr <= 5) bump('session_4am', 1);
    checkAll();
  }, 1500);

  function _hookST(){
    if (window._lwAchSTHooked) return;
    if (typeof window.switchTab !== 'function') { setTimeout(_hookST, 600); return; }
    var orig = window.switchTab;
    window.switchTab = function(tab){
      try {
        var seen = _read('lw_ach_tabs_session', {});
        if (!seen[tab]) {
          seen[tab] = 1; _write('lw_ach_tabs_session', seen);
          bump('d_tabs', 1);
          bump('tabs_in_session', 1);
        }
      } catch(e){}
      var ret = orig.apply(this, arguments);
      setTimeout(checkAll, 400);
      return ret;
    };
    window._lwAchSTHooked = true;
  }
  _hookST();

  function _hookEvents(){
    if (window._lwAchEvtHooked) return;
    if (!window.LW_Events || !window.LW_Events.fire) { setTimeout(_hookEvents, 800); return; }
    var origFire = window.LW_Events.fire;
    window.LW_Events.fire = function(name){
      var ret = origFire.apply(this, arguments);
      if (ret) bump('bos_triggers', 1);
      bump('d_trigger', 1);
      bump('w_bos', 1);
      setTimeout(checkAll, 200);
      return ret;
    };
    window._lwAchEvtHooked = true;
  }
  _hookEvents();

  function _markSeen(setKey, val, ctrKey){
    try {
      var s = _read(setKey, {});
      if (s[val]) return;
      s[val] = 1; _write(setKey, s);
      var c = _getCounters();
      c[ctrKey] = (c[ctrKey] || 0) + 1;
      _markCountersDirty();
    } catch(e){}
  }

  function _wrap(fname, before, after){
    if (window['_lwAch_wrap_'+fname]) return;
    var orig = window[fname];
    if (typeof orig !== 'function') { setTimeout(function(){ _wrap(fname, before, after); }, 1200); return; }
    window[fname] = function(){
      try { if (before) before.apply(this, arguments); } catch(e){}
      var ret = orig.apply(this, arguments);
      try { if (after) after.call(this, ret, arguments); } catch(e){}
      return ret;
    };
    window['_lwAch_wrap_'+fname] = true;
  }

  _wrap('mintPlant', null, function(ret, args){
    var hash = args[0];
    bump('mint_total', 1);
    bump('d_mint', 1);
    bump('w_mint', 1);
    var hr = new Date().getHours();
    var d = new Date();
    if (hr === 0) bump('mint_midnight', 1);
    if (hr >= 5 && hr <= 7) bump('mint_dawn', 1);
    if (hr >= 18 && hr <= 21) bump('mint_dusk', 1);
    if (d.getMonth() === 0 && d.getDate() === 1) bump('mint_jan1', 1);
    if (d.getMonth() === 1 && d.getDate() === 29) bump('mint_leap', 1);
    var doy = _yearDayIndex(d);
    if (Math.abs(doy - 80) <= 7 || Math.abs(doy - 266) <= 7) bump('mint_equinox', 1);
    if (Math.abs(doy - 172) <= 7 || Math.abs(doy - 355) <= 7) bump('mint_solstice', 1);
    try {
      if (window.hashToTraits && window.getTerraGrade) {
        var t = window.hashToTraits(hash);
        var g = window.getTerraGrade(t);
        if (g && g.name) {
          var key = 'mint_' + g.name.toLowerCase();
          bump(key, 1);
          if (typeof t.pot === 'number')      _markSeen('pots_seen_set', t.pot, 'pots_seen');
          if (typeof t.leafType === 'number') _markSeen('leaves_seen_set', t.leafType, 'leaves_seen');
          if (typeof t.flower === 'number' && t.hasFlower) _markSeen('flowers_seen_set', t.flower, 'flowers_seen');
          if (typeof t.aura === 'number' && t.aura > 4) _markSeen('auras_seen_set', t.aura, 'auras_seen');
          if (typeof t.companion === 'number') _markSeen('companions_seen_set', t.companion, 'companions_seen');
          if (typeof t.base === 'number')     _markSeen('substrates_seen_set', t.base, 'substrates_seen');
          if (typeof t.mutation === 'number' && t.mutation >= 0xCC) _markSeen('mutations_seen_set', t.mutation, 'mutations_seen');
        }
      }
    } catch(e){}
    setTimeout(checkAll, 300);
  });

  _wrap('_doCrossPollination', null, function(){
    bump('breed_total', 1);
    bump('breed_with_wild', 1);
    bump('d_breed', 1);
    bump('d_breed_wild', 1);
    bump('w_breed', 1);
    setTimeout(checkAll, 300);
  });

  _wrap('bsExecuteBreed', null, function(){
    bump('breed_total', 1);
    bump('d_breed', 1);
    bump('w_breed', 1);
    setTimeout(checkAll, 400);
  });

  _wrap('confirmCompost', null, function(){
    bump('compost_total', 1);
    bump('d_compost', 1);
    bump('w_compost', 1);
    setCounter('days_no_compost', 0);
    setTimeout(checkAll, 200);
  });

  _wrap('shareDrawerPlant', null, function(){
    bump('shares_total', 1);
    bump('d_share', 1);
    setTimeout(checkAll, 200);
  });
  _wrap('downloadPlantCard', null, function(){
    bump('d_download', 1);
    setTimeout(checkAll, 200);
  });
  _wrap('openCarousel', null, function(){
    bump('d_carousel', 1);
  });

  _wrap('earnDew', function(amount){
    if (typeof amount === 'number' && amount > 0) {
      bump('d_dew_earned', amount);
      bump('w_dew_earned', amount);
    }
  }, null);

  _wrap('earnHashes', function(amount){
    if (typeof amount === 'number' && amount > 0) {
      bump('d_sunbeams', amount);
    }
  }, null);

  _wrap('_play', function(gameKey){
    bump('d_first_play', 1);
    if (gameKey) {
      var seen = _read('lw_ach_games_today', {date: _todayKey(), set:{}});
      if (seen.date !== _todayKey()) seen = {date:_todayKey(), set:{}};
      if (!seen.set[gameKey]) {
        seen.set[gameKey] = 1; _write('lw_ach_games_today', seen);
        bump('d_game_kinds', 1);
      }
      var seenW = _read('lw_ach_games_week', {monday:_mondayOfWeek(), set:{}});
      if (seenW.monday !== _mondayOfWeek()) seenW = {monday:_mondayOfWeek(), set:{}};
      if (!seenW.set[gameKey]) {
        seenW.set[gameKey] = 1; _write('lw_ach_games_week', seenW);
        bump('w_game_kinds', 1);
      }
    }
  }, null);

  // ─── Counter sites still UNWIRED (audited 2026-04-30) ─────────────────
  //
  // Two remain — both need a daily/seasonal boundary daemon, not just a
  // bump at one action site.
  //
  //   - 'perfect_seasons'   bump if a real-world meteorological season
  //                         starts and ends with zero plant deaths in
  //                         _pruneWild. Hook _pruneWild's `died.length>0`
  //                         block to clear the lw_perfect_season flag,
  //                         then a daily heartbeat checks if the season
  //                         crossed and bumps perfect_seasons if the
  //                         flag is still clean.
  //
  //   - 'perfect_years'     same shape but on Jan-1 boundary.
  //
  // Drop a single LW_ACH.bump('counter_key', amount) at each site and the
  // engine will pick up. checkAll() runs on tab change and on every BoS
  // event fire, so completion lands within a heartbeat.
  // ─────────────────────────────────────────────────────────────────────

})();
