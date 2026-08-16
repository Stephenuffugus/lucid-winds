/* ════════════════════════════════════════════════════════════════════
   JIMOTHY — headless check. No browser, no network.
     node test/jimothy-check.js
   Exits 1 on any failure. This is a STATIC check: it compiles every inline
   script block and then asserts the invariants that this file's own ⛔
   comments claim but that nothing was enforcing. Every one of these was
   watched RED against the code as it stood on 2026-08-16.

   What it will NOT catch: anything that needs the game to run. The debug API
   at the bottom of index.html (SH_DEV) is the hook for that, and a puppeteer
   harness belongs on top of it. This file is the cheap gate that runs in a
   second and would have caught all three of the audit's high severity finds.
   ════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm');
var ROOT = path.join(__dirname, '..');
var page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

var fails = 0, passes = 0;
function sec(s) { console.log('\n── ' + s + ' ' + Array(Math.max(2, 62 - s.length)).join('─')); }
function ok(name, cond, detail) {
  if (cond) { passes++; console.log('  PASS  ' + name + (detail ? '   (' + detail + ')' : '')); }
  else { fails++; console.log('  FAIL  ' + name + (detail ? '   (' + detail + ')' : '')); }
}

/* ═══ A. SYNTAX ════════════════════════════════════════════════════ */
sec('A  SYNTAX (a broken block still serves a 200)');
(function () {
  /* ⛔ compile with vm, never with a brace counter. The stylesheet is full of
     inline SVG data URIs whose braces and parens defeat naive counting, and
     a `</script>` inside a string truncates a regex split. */
  /* ⛔ skip <script type="application/ld+json"> and friends: they are DATA,
     not JavaScript, and compiling them reports a syntax error in a fine page. */
  var blocks = (page.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g) || [])
    .filter(function (b) {
      var t = b.match(/^<script[^>]*\btype\s*=\s*["']([^"']+)/);
      return !t || /javascript|module|ecmascript/i.test(t[1]);
    });
  var bad = [], i;
  for (i = 0; i < blocks.length; i++) {
    var body = blocks[i].replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    if (/^\s*$/.test(body)) continue;
    try { new vm.Script(body, { filename: 'inline-' + i }); }
    catch (e) { bad.push('block ' + i + ': ' + e.message); }
  }
  ok('every inline script block compiles', bad.length === 0, bad.join(' | '));
  ok('there are blocks to compile', blocks.length >= 3, blocks.length + ' blocks');
  var swBad = '';
  try { new vm.Script(sw, { filename: 'sw.js' }); } catch (e) { swBad = e.message; }
  ok('sw.js compiles', !swBad, swBad);
})();

/* ═══ B. SERVICE WORKER LOCKSTEP ═══════════════════════════════════ */
sec('B  SERVICE WORKER (the version drift that has now happened 3 times)');
(function () {
  var cm = sw.match(/var\s+CACHE\s*=\s*["']jimothy-v(\d+)["']/);
  var vm2 = page.match(/var\s+SWV\s*=\s*['"](\d+)['"]/);
  ok('sw.js declares a versioned cache name', !!cm, cm ? cm[0] : 'not found');
  ok('index.html declares SWV', !!vm2, vm2 ? vm2[0] : 'not found');
  /* ⛔ THIS IS THE ONE. Drifted 57 vs 67, then 73 vs 77. The registered URL
     is sw.js?v=SWV, so if SWV does not move the browser never refetches the
     worker and every player keeps installing the old one. */
  ok('SWV and the sw.js cache version are in lockstep', !!(cm && vm2 && cm[1] === vm2[1]),
    cm && vm2 ? ('SWV=' + vm2[1] + ' vs jimothy-v' + cm[1]) : 'could not read both');

  /* the worker must only ever delete its OWN caches: caches.keys() is origin
     wide and this origin hosts the whole studio */
  var del = sw.match(/caches\.keys\(\)[\s\S]{0,420}?delete/);
  ok('cache deletion is scoped to the jimothy prefix',
    !!(del && /indexOf\("jimothy-"\)\s*===\s*0/.test(del[0])),
    del ? 'found a keys() sweep, checking its guard' : 'no keys() sweep found');
  ok('the registration passes the version through', /register\(\s*['"]sw\.js\?v='\s*\+\s*SWV/.test(page));
})();

/* ═══ C. SAVE INTEGRITY ════════════════════════════════════════════ */
sec('C  SAVE (every field written must be read back)');
(function () {
  var block = page.slice(page.indexOf('var PROG={'), page.indexOf('function saveProg()'));
  ok('the PROG loader was located', block.length > 400, block.length + ' chars');

  /* THE BUG THIS SECTION EXISTS FOR: PROG.decRew is the once ever ledger for
     the decade capstones, the level 50 bin pull and the level 100 feast. It
     was saved (saveProg stringifies all of PROG) but never loaded, so every
     one of those payouts fired again on each fresh browser session. */
  var declared = /decRew\s*:/.test(block);
  var loaded = /(_o\(p\.decRew\)|p\.decRew)\s*\)?\s*PROG\.decRew\s*=/.test(block);
  ok('decRew is declared in the PROG default', declared);
  ok('decRew is read back out of the save', loaded, 'saved but never loaded means every capstone re-pays');

  /* and the same for every other once ever / high water field: if saveProg
     writes it, the loader must read it, or it silently resets each session */
  var payoutKeys = ['caps', 'capsEver', 'tokens', 'chars', 'pulls', 'decRew', 'rewardDay', 'rewardStreak', 'lastBonusDay', 'roads'];
  var unread = payoutKeys.filter(function (k) {
    return !(new RegExp('p\\.' + k + '\\b')).test(block);
  });
  ok('every payout bearing field is read back on boot', unread.length === 0, 'never loaded: ' + unread.join(', '));

  /* a wrong TYPE in the save must not throw partway through the loader and
     abandon the rest of it (strict mode, one catch for 25 statements) */
  ok('object fields are type guarded before assignment', /function _o\(v\)/.test(page),
    'no _o() guard: a save whose `unlocked` is a string truncates the load');

  /* counters ADD and bests MAX, at the one place a run pays out */
  var bank = page.slice(page.indexOf('function bankRun()'), page.indexOf('function bankRun()') + 2200);
  ok('the run payout was located', bank.length > 200);
  ok('bests take the MAX', /PROG\.best\[G\.mode\]\s*=\s*G\.score/.test(bank) && /G\.score\s*>\s*best/.test(bank));
  ok('counters ADD with a paid delta guard',
    /PROG\.caps\s*=\s*\(PROG\.caps\|\|0\)\+Math\.max\(0,\s*G\.coins-\(G\.capsPaid\|\|0\)\)/.test(bank),
    'a continued run reaches gameOver more than once');
})();

/* ═══ D. THE TWO STREAM PRNG ═══════════════════════════════════════ */
sec('D  DAILY PRNG (two streams, and they must stay two)');
(function () {
  var m = page.match(/if\(mode==='daily'\)\{[\s\S]{0,320}?\}/);
  ok('the daily seeding block was located', !!m, m ? '' : 'not found');
  if (!m) return;
  var b = m[0];
  /* ⛔ TWO INDEPENDENT STREAMS. rng is the CLOCK (weather, gulls), lrng is the
     COURSE (lanes, traffic, pads, pickups). Collapsing them to one generator
     means the weather consumes course draws and every player's shared daily
     road stops matching. */
  ok('the daily builds two separate generators', /rng\s*=\s*mkRng\(/.test(b) && /lrng\s*=\s*mkRng\(/.test(b), b.replace(/\s+/g, ' '));
  ok('the two generators do not share a seed', !/lrng\s*=\s*rng\b/.test(b) && /mkRng\([\s\S]*?\)[\s\S]*?mkRng\(/.test(b));
  ok('the daily seed is the day, not the clock', /seed\s*=\s*daySeed\(\)/.test(b));
  ok('the day seed is hashed rather than used raw', /dayIndex\(\)\s*\*\s*2654435761/.test(page),
    'small correlated seeds make correlated courses');

  /* the course must not be built from Math.random anywhere */
  var course = page.slice(page.indexOf('function buildRoad'), page.indexOf('function buildRoad') + 4000);
  ok('the road builder never calls Math.random', course.indexOf('Math.random') < 0,
    'a shared daily cannot contain an unseeded draw');
})();

/* ═══ E. IF / ELSE IF CHAIN ════════════════════════════════════════ */
sec('E  CHAIN HAZARD (a bare if in the middle steals the chain)');
(function () {
  /* This bug shipped here once: a bare `if` was sitting between two arms of
     the safe row else-if ladder, so the coin roll bound to IT instead of to
     the egg roll and silently changed the shared daily course. The guard is
     positional: inside the lane builder, no bare `if(` may appear between
     two `else if(` arms at the same indentation. */
  var start = page.indexOf('function buildSafe');
  if (start < 0) start = page.indexOf('L.power=');
  var region = page.slice(start, start + 3500).split('\n');
  var lastElseIf = -1, offenders = [], i;
  for (i = 0; i < region.length; i++) {
    var line = region[i];
    var ind = (line.match(/^\s*/) || [''])[0].length;
    if (/^\s*\}?\s*else if\s*\(/.test(line)) { lastElseIf = i; continue; }
    if (lastElseIf >= 0 && /^\s*if\s*\(/.test(line) && ind <= 4) {
      /* a bare if AFTER the chain has closed is fine; the hazard is one that
         still has an else if BELOW it */
      var j, moreBelow = false;
      for (j = i + 1; j < Math.min(i + 14, region.length); j++) if (/^\s*\}?\s*else if\s*\(/.test(region[j])) moreBelow = true;
      if (moreBelow) offenders.push('line +' + i + ': ' + line.trim().slice(0, 70));
    }
  }
  ok('no bare if sits inside the lane content else if chain', offenders.length === 0, offenders.join(' | '));
  ok('the lane content chain was located', region.length > 20, region.length + ' lines scanned');
})();

/* ═══ F. NO ROOM WITHOUT A DOOR ════════════════════════════════════ */
sec('F  DEAD ENDS (every full screen overlay needs a way out)');
(function () {
  /* the daily reward overlay sits at z-index 300 over everything. Its only
     dismiss path used to be the Claim button, which is also the one path
     that can throw. System back walked the screen underneath it instead. */
  ok('the daily reward overlay has a close function', /function closeDailyReward\(\)/.test(page));
  ok('the daily reward overlay has a Later button', /id="reward-later"/.test(page));
  ok('the daily reward overlay closes on a backdrop tap',
    /_rewardEl\.onclick\s*=\s*function\s*\(e\)\s*\{\s*if\s*\(\s*e\.target\s*===\s*_rewardEl\s*\)/.test(page));
  ok('system back closes the daily reward before navigating',
    /rewardOpen\(\)\)\{\s*closeDailyReward\(\)/.test(page));
  ok('claiming hides the overlay before anything that can throw',
    page.indexOf('closeDailyReward();\n  saveProg();') > 0 ||
    /closeDailyReward\(\);\s*\n\s*saveProg\(\)/.test(page),
    'a throw in achCheck or revealChar would pin the overlay open');

  /* a disabled button whose only re-enable lives in third party code */
  var rev = page.slice(page.indexOf('function reviveRun()'), page.indexOf('function reviveRun()') + 900);
  ok('the revive ad path has a rescue timeout', /setTimeout\([\s\S]{0,120}?disabled\s*=\s*false/.test(rev),
    'if the ad SDK never calls back, Continue stays dead for the run');
  ok('the revive ad call is wrapped against a throw', /try\{\s*ads\.rewarded/.test(rev));
})();

/* ═══ G. CONTENT MAP IS THE SOURCE OF TRUTH ════════════════════════ */
sec('G  CONTENT (CONTENT-MAP.md is the source of truth)');
(function () {
  var map = fs.readFileSync(path.join(ROOT, 'CONTENT-MAP.md'), 'utf8');

  /* ⛔ the five weekly costumes are the reason to come back tomorrow and the
     map says they are never for sale. Append only: inserting one in the
     middle moves somebody's prize two days before they reach it. */
  var weekly = ['froggothy', 'dinothy', 'knight', 'hazmat', 'pirate'];
  var rew = page.match(/REWARD_SKINS\s*=\s*\[([^\]]*)\]/);
  ok('REWARD_SKINS exists in the game', !!rew, rew ? rew[0].slice(0, 90) : 'not found');
  if (rew) {
    var ids = rew[1].split(',').length;
    ok('the weekly ladder still has five rungs', ids === 5, ids + ' entries; CONTENT-MAP lists 5');
  }
  var mapWeekly = (map.match(/\| [1-5] \| \w/g) || []).length;
  ok('CONTENT-MAP still documents five weekly costumes', mapWeekly === 5, mapWeekly + ' rows');

  /* ⛔ the 14 pack costumes were sold as fourteen and the list never grows */
  var pack = page.match(/var\s+PACK_COSTUMES\s*=\s*\{([\s\S]*?)\}/);
  ok('PACK_COSTUMES exists', !!pack, pack ? '' : 'not found');
  if (pack) {
    var n = (pack[1].match(/\w+\s*:\s*1/g) || []).length;
    ok('the supporter pack is still exactly fourteen costumes', n === 14,
      n + ' ids; CONTENT-MAP: "Never add to this list"');
  }

  /* ⛔ colours and finishes were retired. The code is dormant behind FIN_ON
     and must stay dormant. */
  var fin = page.match(/FIN_ON\s*=\s*(true|false|!?\d)/);
  ok('the retired colour finishes are still switched off', !!fin && /false|!1|0/.test(fin[1]),
    fin ? fin[0] : 'FIN_ON not found');

  /* ⛔ HOME IS FIVE BUTTONS. Settled design, do not add a sixth. */
  var home = page.match(/<div class="home-btns"[\s\S]*?<\/div>\s*<\/div>/);
  if (!home) home = page.match(/id="s-title"[\s\S]{0,4000}/);
  var btnCount = home ? (home[0].match(/class="btn[^"]*"/g) || []).length : -1;
  ok('the title screen was located for a button count', btnCount >= 0, btnCount + ' buttons seen');
})();

/* ═══ H. COPY LAW ══════════════════════════════════════════════════ */
sec('H  COPY LAW (no dash characters in player facing copy)');
(function () {
  /* ⛔ STRIP COMMENTS BEFORE ANALYSING SOURCE, AND ONLY LOOK AT SOURCE.
     Two traps here, both of which produced false reds first time out:
     1. this file's comments are full of prose and apostrophes, so a naive
        per line string scan desynchronises on the first "hero's" and then
        reports the surrounding comment as player copy;
     2. the page is not all JavaScript. Walking the WHOLE file with a JS
        string scanner reads CSS declarations and HTML prose as string
        literals. So: scan the inline JS blocks with a state machine, and
        check the markup's visible text separately. */
  var hits = [], i, b2;
  var jsBlocks = (page.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g) || [])
    .filter(function (blk) {
      var t = blk.match(/^<script[^>]*\btype\s*=\s*["']([^"']+)/);
      return !t || /javascript|module|ecmascript/i.test(t[1]);
    })
    .map(function (blk) { return blk.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''); });

  for (b2 = 0; b2 < jsBlocks.length; b2++) {
    var src = jsBlocks[b2], n = src.length;
    var st = 0;   // 0 code, 1 line comment, 2 block comment, 3 single, 4 double, 5 template
    var buf = '', startLine = 1, line = 1;
    for (i = 0; i < n; i++) {
      var ch = src.charAt(i), nx = src.charAt(i + 1);
      if (ch === '\n') line++;
      if (st === 0) {
        if (ch === '/' && nx === '/') { st = 1; i++; }
        else if (ch === '/' && nx === '*') { st = 2; i++; }
        else if (ch === "'") { st = 3; buf = ''; startLine = line; }
        else if (ch === '"') { st = 4; buf = ''; startLine = line; }
        else if (ch === '`') { st = 5; buf = ''; startLine = line; }
      } else if (st === 1) { if (ch === '\n') st = 0; }
      else if (st === 2) { if (ch === '*' && nx === '/') { st = 0; i++; } }
      else {
        var q = st === 3 ? "'" : (st === 4 ? '"' : '`');
        if (ch === '\\') { i++; continue; }
        if (ch === q) { if (/[—–]/.test(buf)) hits.push('block ' + b2 + ' line ' + startLine + ': ' + buf.slice(0, 60)); st = 0; buf = ''; }
        else buf += ch;
      }
    }
  }

  /* and the markup's own visible text, which no JS scanner would ever see */
  var body = page.slice(page.indexOf('<body'));
  var visible = body.replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  var mkHits = visible.match(/[^\s]{0,24}[—–][^\s]{0,24}/g) || [];
  ok('no em dash or en dash in the markup the player reads', mkHits.length === 0, mkHits.slice(0, 3).join(' | '));

  ok('no em dash or en dash inside a string literal', hits.length === 0, hits.slice(0, 4).join(' | '));
})();

console.log('\n' + (fails ? 'FAILED' : 'OK') + '  ' + passes + ' passed, ' + fails + ' failed\n');
process.exit(fails ? 1 : 0);
