/* ════════════════════════════════════════════════════════════════════
   THE ATTIC — economy and save layer. ES5, node + browser, no DOM.
   Lifted out of index.html on 2026-08-16 so it can be asserted in node
   (test/attic-check.js sections E and F). Three things live here and
   nowhere else: what a ticket is worth, what a corrupt save turns into,
   and how two tabs share one wallet.

   ⛔ THE LOOP MUST BE LOSSY. As shipped, a rummage cost 1 ticket and
   scrapping the pull handed 1 straight back, so a player could dig
   forever and the tickets were decoration. Net expectation per dig is
   now -1 (dig) + 0.34 (keeper refund) + 0.5 (scrap) = -0.16. If you
   retune any of the three numbers, re-run the solvency assertion: it
   demands the greediest possible strategy still runs the wallet dry.

   ⛔ READ MODIFY WRITE. The wallet is a counter, and counters ADD. Every
   write re-reads what is on disk and applies this tab's DELTA, so a
   second tab cannot refund the first tab's spending. Bests take the MAX,
   want list ticks take the UNION.
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var DAILY = 5;              // tickets granted once per day
  var RUMMAGE_COST = 1;       // what a dig costs
  var GRAIL_PAY = 3;          // crossing something off the want list
  var PAY_AT = 'FINE';        // a find this good or better refunds the dig
  var KEEPER_PAY = 1;
  var SCRAP_PER = 2;          // two scrapped finds make one ticket
  var DUST_CAP = 6;           // tickets the dust panel can pay per day
  var DUST_PER = 2;           // stubs per ticket
  var TIX_MAX = 99999;        // a corrupt save cannot mint infinity
  var SHELF_MAX = 400;        // hashes kept, newest first

  var GRADE_ORDER = ['TRASHED', 'PLAYED', 'GOOD', 'FINE', 'NEAR MINT', 'MINT', 'FACTORY SEALED'];
  function gIdx(g) { var i = GRADE_ORDER.indexOf(g); return i < 0 ? 2 : i; }

  function clampTix(n) {
    n = Number(n);
    if (!isFinite(n)) n = 0;
    n = Math.floor(n);
    if (n < 0) n = 0;
    if (n > TIX_MAX) n = TIX_MAX;
    return n;
  }
  function isObj(o) { return !!o && typeof o === 'object' && !(o instanceof Array); }

  function baseWallet() {
    return { tix: 0, day: -1, wants: {}, finds: 0, best: 0, scrapCredit: 0, dustDay: -1, dustN: 0,
      dailyDay: -1, streak: 0, wkDay: -1 };
  }
  function newWallet() { var w = baseWallet(); w._base = snap(w); return w; }
  function snap(w) { return { tix: w.tix, finds: w.finds, best: w.best }; }

  /* Anything at all can be on disk: null, a truncated string, an array, a
     number, a negative ticket count, a day index in the year 4000. Every
     one of those has to load into a wallet the player can play with, and
     in particular a future day must not lock the daily allowance out
     forever. Silent repair, never a thrown boot. */
  function readWallet(raw, today) {
    var w = baseWallet(), p = null;
    try { p = (typeof raw === 'string') ? JSON.parse(raw) : raw; } catch (e) { p = null; }
    if (isObj(p)) {
      w.tix = clampTix(p.tix);
      w.day = (typeof p.day === 'number' && isFinite(p.day)) ? Math.floor(p.day) : -1;
      w.wants = isObj(p.wants) ? p.wants : {};
      w.finds = clampTix(p.finds);
      w.best = clampTix(p.best);
      w.scrapCredit = Math.max(0, Math.min(SCRAP_PER - 1, clampTix(p.scrapCredit)));
      w.dustDay = (typeof p.dustDay === 'number' && isFinite(p.dustDay)) ? Math.floor(p.dustDay) : -1;
      w.dustN = Math.max(0, Math.min(DUST_CAP, clampTix(p.dustN)));
      w.dailyDay = (typeof p.dailyDay === 'number' && isFinite(p.dailyDay)) ? Math.floor(p.dailyDay) : -1;
      w.streak = clampTix(p.streak);
      w.wkDay = (typeof p.wkDay === 'number' && isFinite(p.wkDay)) ? Math.floor(p.wkDay) : -1;
    }
    /* a day stamped in the future would otherwise mean "no tickets, ever" */
    if (typeof today === 'number' && w.day > today) w.day = -1;
    if (typeof today === 'number' && w.dustDay > today) { w.dustDay = -1; w.dustN = 0; }
    /* a save stamped in the future would otherwise mean the daily, and with
       it the only reason to come back, never arrives again */
    if (typeof today === 'number' && w.dailyDay > today) { w.dailyDay = -1; w.streak = 0; }
    if (typeof today === 'number' && w.wkDay > weekOf(today)) w.wkDay = -1;
    w._base = snap(w);
    return w;
  }

  function writable(w) {
    return { tix: w.tix, day: w.day, wants: w.wants, finds: w.finds, best: w.best,
      scrapCredit: w.scrapCredit, dustDay: w.dustDay, dustN: w.dustN,
      dailyDay: w.dailyDay, streak: w.streak, wkDay: w.wkDay };
  }

  /* THE TWO TAB RULE. `w` may be minutes stale. Re-read the disk, apply
     only what this tab changed, hand back the string to store. The caller
     must then keep using `w`, which is rebased onto the merged truth. */
  function mergeToDisk(diskRaw, w) {
    var d = readWallet(diskRaw);
    var base = w._base || snap(w);
    d.tix = clampTix(d.tix + (w.tix - base.tix));            // counters ADD
    d.finds = clampTix(d.finds + (w.finds - base.finds));    // counters ADD
    d.best = Math.max(d.best, w.best);                       // bests MAX
    d.day = Math.max(d.day, w.day);
    d.scrapCredit = w.scrapCredit;
    if (w.dustDay > d.dustDay) { d.dustDay = w.dustDay; d.dustN = w.dustN; }
    else if (w.dustDay === d.dustDay) d.dustN = Math.max(d.dustN, w.dustN);
    /* a daily claimed in either tab is claimed, and the streak only ever
       climbs, so both take the MAX */
    d.dailyDay = Math.max(d.dailyDay, w.dailyDay);
    d.streak = Math.max(d.streak, w.streak);
    d.wkDay = Math.max(d.wkDay, w.wkDay);
    var k;
    for (k in w.wants) if (w.wants.hasOwnProperty(k) && w.wants[k]) d.wants[k] = 1;   // union
    /* rebase this tab onto the merged truth so the delta is not re-applied */
    w.tix = d.tix; w.finds = d.finds; w.best = d.best; w.day = d.day;
    w.wants = d.wants; w.dustDay = d.dustDay; w.dustN = d.dustN;
    w.dailyDay = d.dailyDay; w.streak = d.streak; w.wkDay = d.wkDay;
    w._base = snap(w);
    return JSON.stringify(writable(d));
  }

  function grantDaily(w, today) {
    if (w.day === today) return 0;
    w.day = today;
    var before = w.tix;
    w.tix = clampTix(w.tix + DAILY);
    return w.tix - before;
  }

  function spend(w, n) {
    n = Math.max(0, n | 0);
    if (w.tix < n) return false;
    w.tix = clampTix(w.tix - n);
    return true;
  }

  /* the moment of truth. A keeper hands the dig back, junk does not. */
  function payReveal(w, item) {
    var pay = gIdx(item && item.grade) >= gIdx(PAY_AT) ? KEEPER_PAY : 0;
    if (pay) { w.tix = clampTix(w.tix + pay); w.finds = clampTix(w.finds + 1); }
    else w.finds = clampTix(w.finds + 1);
    return pay;
  }

  /* scrapping is a partial refund, not a full one, or the dig is free */
  function payScrap(w) {
    w.scrapCredit = (w.scrapCredit | 0) + 1;
    if (w.scrapCredit < SCRAP_PER) return 0;
    w.scrapCredit = 0;
    w.tix = clampTix(w.tix + 1);
    return 1;
  }

  function payGrails(w, n) {
    n = Math.max(0, n | 0);
    if (!n) return 0;
    w.tix = clampTix(w.tix + GRAIL_PAY * n);
    return GRAIL_PAY * n;
  }

  /* ── THE DAILY FIND and the STREAK ──────────────────────────────────
     The daily costs nothing, so it is not part of the dig economy and the
     solvency assertion does not move. What it buys is a reason to open the
     game on a day when the wallet is dry.
     The streak is consecutive days CLAIMED, not days opened: opening the
     attic and not digging is not a streak. It pays one ticket every seventh
     day, which is 0.14 a day and cannot outrun the daily allowance. */
  var STREAK_EVERY = 7;
  function dailyReady(w, today) { return w.dailyDay !== today; }
  function claimDaily(w, today) {
    if (w.dailyDay === today) return null;
    w.streak = (w.dailyDay === today - 1) ? clampTix(w.streak + 1) : 1;
    w.dailyDay = today;
    var bonus = (w.streak % STREAK_EVERY === 0) ? 1 : 0;
    if (bonus) w.tix = clampTix(w.tix + bonus);
    return { streak: w.streak, bonus: bonus, every: STREAK_EVERY };
  }
  function weekOf(day) { return Math.floor((Math.floor(day) + 4) / 7); }
  /* the WANTED object pays double, once a week, to whoever turns it up */
  function wantedReady(w, today) { return w.wkDay !== weekOf(today); }
  function payWanted(w, today) {
    var wk = weekOf(today);
    if (w.wkDay === wk) return 0;
    w.wkDay = wk;
    w.tix = clampTix(w.tix + GRAIL_PAY * 2);
    return GRAIL_PAY * 2;
  }

  function dustLeft(w, today) {
    if (w.dustDay !== today) return DUST_CAP;
    return Math.max(0, DUST_CAP - (w.dustN | 0));
  }

  function bankDust(w, stubs, today) {
    if (w.dustDay !== today) { w.dustDay = today; w.dustN = 0; }
    var give = Math.min(Math.floor(Math.max(0, stubs | 0) / DUST_PER), dustLeft(w, today));
    if (give <= 0) return 0;
    w.dustN = (w.dustN | 0) + give;
    w.tix = clampTix(w.tix + give);
    return give;
  }

  /* the shelf is 64 bytes a find and re-derives every object from its hash,
     but it still cannot grow without a bound or a long player fills the
     origin's storage quota and every write starts failing silently. */
  function readShelf(raw) {
    var out = [], seen = {}, p = null, i;
    try { p = (typeof raw === 'string') ? JSON.parse(raw) : raw; } catch (e) { p = null; }
    if (!(p instanceof Array)) return out;
    for (i = 0; i < p.length && out.length < SHELF_MAX; i++) {
      if (typeof p[i] === 'string' && /^[0-9a-f]{64}$/.test(p[i]) && !seen[p[i]]) {
        seen[p[i]] = 1; out.push(p[i]);
      }
    }
    return out;
  }

  /* ── WHEN a find was found ──────────────────────────────────────────
     The shelf stores hashes and re-derives everything else, which is why it
     costs 64 bytes a find, but a hash cannot say WHEN. A collection screen
     that cannot date a find has nothing to sort by except the order of an
     array, so the date lives here, in its own map, pruned to the shelf on
     every write exactly like `revealed`.
     ⛔ Two tabs: this is a FIRST WRITE WINS map, so the merge keeps the
     EARLIEST timestamp for a hash. A later tab must never re-date a find. */
  function readFound(raw) {
    var out = {}, p = null, k, v;
    try { p = (typeof raw === 'string') ? JSON.parse(raw) : raw; } catch (e) { p = null; }
    if (!isObj(p)) return out;
    for (k in p) {
      if (!p.hasOwnProperty(k) || !/^[0-9a-f]{64}$/.test(k)) continue;
      v = Number(p[k]);
      if (!isFinite(v) || v <= 0) continue;
      out[k] = Math.floor(v);
    }
    return out;
  }
  function mergeFoundToDisk(diskRaw, mine, shelf) {
    var d = readFound(diskRaw), keep = {}, i, k, h;
    for (k in mine) if (mine.hasOwnProperty(k)) {
      if (!d[k] || mine[k] < d[k]) d[k] = mine[k];    // earliest wins
    }
    /* pruned to the shelf, or it grows by 76 bytes a dig forever */
    for (i = 0; i < shelf.length; i++) { h = shelf[i]; if (d[h]) keep[h] = d[h]; }
    return JSON.stringify(keep);
  }

  /* the shelf is written newest first, so a merge from a stale tab keeps
     both tabs' finds without either losing one */
  function mergeShelfToDisk(diskRaw, mine) {
    var disk = readShelf(diskRaw), out = [], seen = {}, i;
    for (i = 0; i < mine.length; i++) if (!seen[mine[i]]) { seen[mine[i]] = 1; out.push(mine[i]); }
    for (i = 0; i < disk.length; i++) if (!seen[disk[i]]) { seen[disk[i]] = 1; out.push(disk[i]); }
    return out.slice(0, SHELF_MAX);
  }

  var API = {
    DAILY: DAILY, RUMMAGE_COST: RUMMAGE_COST, GRAIL_PAY: GRAIL_PAY, PAY_AT: PAY_AT,
    SCRAP_PER: SCRAP_PER, DUST_CAP: DUST_CAP, DUST_PER: DUST_PER,
    TIX_MAX: TIX_MAX, SHELF_MAX: SHELF_MAX, GRADE_ORDER: GRADE_ORDER, gIdx: gIdx,
    newWallet: newWallet, readWallet: readWallet, mergeToDisk: mergeToDisk, writable: writable,
    grantDaily: grantDaily, spend: spend, payReveal: payReveal, payScrap: payScrap,
    payGrails: payGrails, dustLeft: dustLeft, bankDust: bankDust,
    readShelf: readShelf, mergeShelfToDisk: mergeShelfToDisk,
    readFound: readFound, mergeFoundToDisk: mergeFoundToDisk,
    STREAK_EVERY: STREAK_EVERY, dailyReady: dailyReady, claimDaily: claimDaily,
    weekOf: weekOf, wantedReady: wantedReady, payWanted: payWanted
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC_ECON = API;
})(this);
