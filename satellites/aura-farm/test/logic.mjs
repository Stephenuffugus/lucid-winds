/* Aura Farm assertion suite. Run: node test/logic.mjs
   Every assertion here was watched RED against the pre-fix source before it was
   trusted green. A probe that cannot fail is not evidence. */

import {
  boot, readSource, extractGameScript, makeLocalStorage,
  check, group, eq, ok, notOk, gte, lte, throws, noThrow, report,
} from './harness.mjs';

const HTML = readSource();
const SRC = extractGameScript(HTML);

/* Strip comments so copy rules do not fire on developer notes. */
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/* Pull every string and template literal out of the source. */
function stringLiterals(s) {
  const out = [];
  const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(s))) {
    const v = m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
    out.push({ text: v, raw: m[0], index: m.index });
  }
  return out;
}

/* A literal is player facing if it can reach the screen. Excludes selectors,
   colors, ids, urls and other machine strings. */
function isPlayerFacing(t) {
  if (!t || !/[A-Za-z]/.test(t)) return false;
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return false;
  if (/^(rgba?|linear-gradient|radial-gradient|repeating-)/.test(t)) return false;
  if (/^[a-z-]+$/.test(t) && t.length < 24) return false;      // css props, ids, keys
  if (/^\.?[a-zA-Z][\w-]*(\s*[.#>\[][\w-]*)*$/.test(t) && !/\s[a-z]{3,}\s/.test(t)) return false;
  if (/^https?:\/\//.test(t)) return false;
  if (/^[0-9a-fA-F,.\s%()-]+$/.test(t)) return false;
  return /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(t) || /[.!?;:]/.test(t);
}

/* ============================================================
   1. STUDIO COPY RULES
   ============================================================ */
group('1. Copy rules (no dashes in player facing strings)');

const noComments = stripComments(SRC);
const lits = stringLiterals(noComments).filter(l => isPlayerFacing(l.text));

check('no em dash or en dash in any player facing string', () => {
  const bad = lits.filter(l => /[\u2014\u2013]/.test(l.text));
  if (bad.length) {
    throw new Error(bad.length + ' strings carry a dash. First three:\n' +
      bad.slice(0, 3).map(b => '           ' + b.text.slice(0, 90)).join('\n'));
  }
});

check('no em dash or en dash anywhere in the HTML body copy', () => {
  const body = HTML.slice(HTML.indexOf('<body'), HTML.indexOf('<script'));
  ok(!/[\u2014\u2013]/.test(body), 'body markup carries a dash');
});

check('no filler exclamation marks in player facing prose', () => {
  const bad = lits.filter(l => /\w!/.test(l.text) && !/^[A-Z\s]+!$/.test(l.text));
  if (bad.length) throw new Error(bad.length + ' strings use "!": ' + bad[0].text.slice(0, 70));
});

/* ============================================================
   2. TOUCH TARGETS (48px rendered, 375x667)
   ============================================================ */
group('2. Touch targets, 48px minimum rendered');

/* Compute a declared rendered height from the CSS: explicit height/min-height
   wins, otherwise padding + border + line boxes. */
function cssBlock(sel) {
  const re = new RegExp('(^|[,\\s}])' + sel.replace(/[.#]/g, '\\$&') + '\\s*(,[^{]*)?\\{([^}]*)\\}', 'm');
  const m = HTML.match(re);
  return m ? m[3] : null;
}
function prop(block, name) {
  const m = block && block.match(new RegExp('(?:^|;)\\s*' + name + '\\s*:\\s*([^;]+)'));
  return m ? m[1].trim() : null;
}
function px(v) {
  if (!v) return null;
  const m = String(v).match(/(-?[\d.]+)px/);
  return m ? parseFloat(m[1]) : null;
}
function renderedHeight(sel, lines = 1) {
  const b = cssBlock(sel);
  if (!b) throw new Error('no css block for ' + sel);
  const h = px(prop(b, 'height'));
  const mh = px(prop(b, 'min-height'));
  if (h !== null) return h;
  const padRaw = prop(b, 'padding');
  let pt = 0, pb = 0;
  if (padRaw) {
    const parts = padRaw.split(/\s+/).map(px).map(v => (v === null ? 0 : v));
    if (parts.length === 1) { pt = pb = parts[0]; }
    else { pt = parts[0]; pb = parts.length >= 3 ? parts[2] : parts[0]; }
  }
  const fs = px(prop(b, 'font-size')) || 13;
  const bw = px(prop(b, 'border')) || 0;
  const content = lines * Math.round(fs * 1.2);
  const box = pt + pb + content + bw * 2;
  return mh !== null ? Math.max(mh, box) : box;
}

/* selector, how many text lines it renders */
const TARGETS = [
  ['.mbtn', 1],   // contracts, shop, case, map, sound, pause
  ['.abtn', 1],   // active arts
  ['.act', 2],    // hype / snide / harvest, name plus .cost line
  ['.cpill', 1],  // contract progress pill, opens contracts on tap
  ['.buyBtn', 1], // shop purchase
  ['.big', 1],    // every modal button
];
for (const [sel, lines] of TARGETS) {
  check(sel + ' is at least 48px tall', () => {
    const h = renderedHeight(sel, lines);
    gte(h, 48, sel + ' rendered height');
  });
}
check('.mbtn and .abtn are at least 48px wide', () => {
  gte(px(prop(cssBlock('.mbtn'), 'width')), 48, '.mbtn width');
  gte(px(prop(cssBlock('.abtn'), 'width')), 48, '.abtn width');
});

/* ============================================================
   3. PORTAL EMBED PROTOCOL AND THE WAY OUT
   ============================================================ */
group('3. Embed protocol and exit affordance');

check('posts {sws:ready} at parse time and on load', () => {
  ok(/sws:\s*'ready'/.test(SRC), 'no ready message');
  ok(/addEventListener\(\s*'load'/.test(SRC), 'no load handler for ready');
});

check('framed exit posts {sws:close}', () => {
  ok(/sws:\s*'close'/.test(SRC), 'no close message');
});

check('unframed exit falls back to referrer or the portal url', () => {
  ok(/document\.referrer/.test(SRC), 'exit does not consult document.referrer');
  ok(/location\.replace/.test(SRC), 'exit has no portal url fallback');
});

check('the exit button renders when NOT framed (production ships top level)', () => {
  const b = boot({ framed: false, referrer: 'https://lucidwinds.com/portal/' });
  const html = b.getEl('modalContent').innerHTML;
  ok(/swsExit|SWS_EXIT/.test(html),
    'title screen has no exit control when the page is not framed, which is how the portal actually serves /satellites/');
});

check('the exit button also renders when framed', () => {
  const b = boot({ framed: true });
  const html = b.getEl('modalContent').innerHTML;
  ok(/swsExit|SWS_EXIT/.test(html), 'framed title screen has no exit control');
});

check('unframed exit with a portal referrer goes back rather than replacing', () => {
  const b = boot({ framed: false, referrer: 'https://lucidwinds.com/portal/', historyLength: 3 });
  b.T._run('swsExit()');
  ok(b.win._wentBack || b.win._replaced, 'exit did nothing at all');
});

check('unframed exit with no referrer lands on the portal', () => {
  const b = boot({ framed: false, referrer: '', historyLength: 1 });
  b.T._run('swsExit()');
  ok(/portal/.test(b.win._replaced || ''), 'exit did not navigate to the portal, got ' + b.win._replaced);
});

/* ============================================================
   4. SAVE AND LOAD: RELOAD, CORRUPTION, TWO TABS
   ============================================================ */
group('4. Save and load');

const CORRUPT = [
  ['truncated json', '{"day":3,"npcs":'],
  ['a bare string', '"hello"'],
  ['a number', '42'],
  ['null literal', 'null'],
  ['an array', '[1,2,3]'],
  ['object missing npcs', '{"day":3,"zones":{},"unlocked":{}}'],
  ['object missing zones', '{"day":3,"npcs":{},"unlocked":{}}'],
  ['npcs of the wrong type', '{"day":3,"npcs":"nope","zones":{},"unlocked":{}}'],
  ['empty object', '{}'],
];
for (const [label, payload] of CORRUPT) {
  check('corrupt run save (' + label + ') does not strand the player', () => {
    const b = boot({ storage: { auraFarmRun: payload } });
    /* Either the title refuses to offer a continue, or continuing works. */
    const html = b.getEl('modalContent').innerHTML;
    if (/startGame\(false\)/.test(html)) {
      noThrow(() => b.T._run('startGame(false)'), 'offered Continue Run then threw on it');
      eq(b.T.mode, 'play', 'continue did not reach play');
    }
    /* A fresh run must always be reachable. */
    noThrow(() => b.T._run('startGame(true)'), 'could not start a fresh run');
    eq(b.T.mode, 'play', 'fresh run did not start');
  });
}

const CORRUPT_META = [
  ['known is null', '{"known":null}'],
  ['case is a string', '{"case":"nope"}'],
  ['endings is not an array', '{"endings":5}'],
  ['rep is a number', '{"rep":7}'],
  ['rep.runs is a string', '{"rep":{"runs":"x"}}'],
  ['relics is an array', '{"relics":[1,2]}'],
  ['whole meta is a string', '"garbage"'],
  ['whole meta is an array', '[]'],
];
for (const [label, payload] of CORRUPT_META) {
  check('corrupt meta (' + label + ') still boots and plays', () => {
    const b = boot({ storage: { auraFarmMeta: payload } });
    noThrow(() => b.T._run('startGame(true)'), 'fresh run threw');
    noThrow(() => b.T._run('titleScreen()'), 'title screen threw');
    noThrow(() => b.T._run('saveMeta()'), 'saveMeta threw');
    noThrow(() => b.T._run('repLean()'), 'repLean threw');
  });
}

check('a mid day run survives a reload', () => {
  const ls = makeLocalStorage();
  const a = boot({ localStorage: ls });
  a.T._run('startGame(true)');
  a.T.run.essence = 777; a.T.run.day = 4; a.T.run.dayT = 60;
  a.T._run('saveRun()');
  const b = boot({ localStorage: ls });
  b.T._run('startGame(false)');
  eq(b.T.run.essence, 777, 'essence lost across reload');
  eq(b.T.run.day, 4, 'day lost across reload');
});

check('a run whose clock has expired is not resumed into an instant re-end', () => {
  const ls = makeLocalStorage();
  const a = boot({ localStorage: ls });
  a.T._run('startGame(true)');
  a.T.run.day = 14; a.T.run.dayT = 0; a.T.run.dayEarned = 99999;
  a.T.run.rad = 5000; a.T.run.bli = 100;
  a.T._run('saveRun()');
  const b = boot({ localStorage: ls });
  const before = (b.T.meta.rep.runs || []).length;
  const html = b.getEl('modalContent').innerHTML;
  if (/startGame\(false\)/.test(html)) {
    b.T._run('startGame(false)');
    b.T._run('update(0.05)');
    const after = (b.T.meta.rep.runs || []).length;
    eq(after, before, 'resuming an expired run recorded a duplicate finished run');
    ok(b.T.mode !== 'ending', 'resuming an expired run replayed the ending');
  }
});

check('the ending cannot record the same run twice', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.day = 14; b.T.run.rad = 4000; b.T.run.bli = 100;
  b.T._run('ending()');
  const n1 = b.T.meta.rep.runs.length;
  b.T._run('ending()');
  eq(b.T.meta.rep.runs.length, n1, 'ending() recorded the run a second time');
});

group('4b. Two tabs must not clobber each other (read modify write)');

check('specimen case merges, keeping the better charge per soul', () => {
  const ls = makeLocalStorage();
  const tabA = boot({ localStorage: ls });
  const tabB = boot({ localStorage: ls });
  tabA.T.meta.case.p1 = { i: 0.9, tier: 'Brilliant', type: 'radiance', emo: 'joy' };
  tabA.T._run('saveMeta()');
  tabB.T.meta.case.c1 = { i: 0.5, tier: 'Vivid', type: 'radiance', emo: 'hope' };
  tabB.T.meta.case.p1 = { i: 0.3, tier: 'Faint', type: 'radiance', emo: 'hope' };
  tabB.T._run('saveMeta()');
  const stored = JSON.parse(ls.getItem('auraFarmMeta'));
  ok(stored.case.p1, 'tab A specimen was erased by tab B');
  eq(stored.case.p1.i, 0.9, 'the weaker specimen overwrote the better one');
  ok(stored.case.c1, 'tab B specimen was lost');
});

check('relics, milestones and known souls union across tabs', () => {
  const ls = makeLocalStorage();
  const tabA = boot({ localStorage: ls });
  const tabB = boot({ localStorage: ls });
  tabA.T.meta.relics.prism = 1; tabA.T.meta.mile.awe1 = 1; tabA.T.meta.known.p1 = 1;
  tabA.T._run('saveMeta()');
  tabB.T.meta.relics.bell = 1; tabB.T.meta.mile.rich = 1; tabB.T.meta.known.c1 = 1;
  tabB.T._run('saveMeta()');
  const s = JSON.parse(ls.getItem('auraFarmMeta'));
  ok(s.relics.prism && s.relics.bell, 'relics did not union: ' + JSON.stringify(s.relics));
  ok(s.mile.awe1 && s.mile.rich, 'milestones did not union');
  ok(s.known.p1 && s.known.c1, 'known souls did not union');
});

check('counters ADD and bests MAX across tabs', () => {
  const ls = makeLocalStorage();
  const tabA = boot({ localStorage: ls });
  const tabB = boot({ localStorage: ls });
  tabA.T._run('run = newRun(); run.mara = { stunT:0, deep:0, target:null, x:0, y:0 }; run.focus = 999; mode = "play"; shooMara(); shooMara();');
  tabB.T._run('run = newRun(); run.mara = { stunT:0, deep:0, target:null, x:0, y:0 }; run.focus = 999; mode = "play"; shooMara();');
  const s = JSON.parse(ls.getItem('auraFarmMeta'));
  eq(s.maraShoos, 3, 'shoo counter did not ADD across tabs');

  const ls2 = makeLocalStorage();
  const a2 = boot({ localStorage: ls2 });
  const b2 = boot({ localStorage: ls2 });
  a2.T.meta.bestEndless = 30; a2.T._run('saveMeta()');
  b2.T.meta.bestEndless = 12; b2.T._run('saveMeta()');
  eq(JSON.parse(ls2.getItem('auraFarmMeta')).bestEndless, 30, 'bestEndless did not MAX');
});

check('finished runs from both tabs survive in the rep history', () => {
  const ls = makeLocalStorage();
  const tabA = boot({ localStorage: ls });
  const tabB = boot({ localStorage: ls });
  tabA.T._run('repRecordRun("lum", 90, "joy")');
  tabB.T._run('repRecordRun("reap", 8, "dread")');
  const s = JSON.parse(ls.getItem('auraFarmMeta'));
  eq(s.rep.runs.length, 2, 'a finished run was lost to the other tab');
});

/* ============================================================
   5. CORE LOOP
   ============================================================ */
group('5. Core loop end to end');

function pushToPeak(b, id, actId = 'hype', maxSteps = 400) {
  b.T.selected = id;
  const n = b.T.run.npcs[id];
  for (let i = 0; i < maxSteps && n.peak <= 0; i++) {
    b.T.run.focus = b.T.focusCap();
    b.T.cooldowns = {};
    b.T._run('doAction("' + actId + '")');
    b.T._run('update(0.05)');
  }
  return n;
}

check('a fresh run starts on day 1 in the park with two actions', () => {
  const b = boot();
  b.T._run('startGame(true)');
  eq(b.T.run.day, 1);
  eq(b.T.run.venue, 'park');
  ok(b.T.run.owned.hype && b.T.run.owned.snide, 'starting actions missing');
  eq(b.T.mode, 'play');
});

check('hype raises valence and charge', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.selected = 'p1';
  const n = b.T.run.npcs.p1;
  const v0 = n.v, i0 = n.i;
  b.T.run.focus = 100; b.T.cooldowns = {};
  b.T._run('doAction("hype")');
  gte(n.v, v0, 'hype did not raise valence');
  gte(n.i, i0, 'hype did not raise charge');
});

check('an action costs focus and sets its cooldown', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.selected = 'p1';
  b.T.run.focus = 100; b.T.cooldowns = {};
  b.T._run('doAction("hype")');
  eq(b.T.run.focus, 86, 'hype did not cost 14 focus');
  gte(b.T.cooldowns.hype, 0.1, 'no cooldown set');
});

check('an action with too little focus is refused', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.selected = 'p1'; b.T.run.focus = 2; b.T.cooldowns = {};
  const v0 = b.T.run.npcs.p1.v;
  b.T._run('doAction("hype")');
  eq(b.T.run.npcs.p1.v, v0, 'action fired without focus');
  eq(b.T.run.focus, 2, 'focus was spent anyway');
});

check('charge climbs into a peak window and harvest pays out', () => {
  const b = boot();
  b.T._run('startGame(true)');
  const n = pushToPeak(b, 'p1');
  ok(n.peak > 0, 'never reached a peak window in 400 pushes');
  const e0 = b.T.run.essence;
  b.T.run.focus = 100;
  b.T._run('harvest()');
  gte(b.T.run.essence - e0, 1, 'harvest paid nothing');
  gte(b.T.run.dayEarned, 1, 'harvest did not count toward the quota');
  eq(b.T.run.npcs.p1.state, 'recover', 'radiance harvest did not leave them recovering');
});

check('a radiance harvest is repeatable: they recover and can be farmed again', () => {
  const b = boot();
  b.T._run('startGame(true)');
  pushToPeak(b, 'p1');
  b.T.run.focus = 100;
  b.T._run('harvest()');
  eq(b.T.run.npcs.p1.state, 'recover');
  for (let i = 0; i < 2000 && b.T.run.npcs.p1.state === 'recover'; i++) b.T._run('update(0.05)');
  eq(b.T.run.npcs.p1.state, 'idle', 'a recovering soul never returned to idle');
});

check('a blight drain husks permanently and pays more than radiance', () => {
  const b = boot();
  b.T._run('startGame(true)');
  const n = pushToPeak(b, 'p3', 'snide');
  ok(n.v < 0, 'snide did not push valence negative');
  const e0 = b.T.run.essence;
  b.T.run.focus = 100;
  b.T._run('harvest()');
  eq(b.T.run.npcs.p3.state, 'husk', 'drain did not husk');
  gte(b.T.run.essence - e0, 1, 'drain paid nothing');
});

check('a faint feeling cannot be harvested', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.selected = 'p1';
  b.T.run.npcs.p1.v = 0.05; b.T.run.npcs.p1.i = 0.9;
  b.T.run.focus = 100;
  const e0 = b.T.run.essence;
  b.T._run('harvest()');
  eq(b.T.run.essence, e0, 'harvested a feeling below the 0.25 valence gate');
});

check('a husk can be gleaned exactly once', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.npcs.p3.state = 'husk';
  b.T.selected = 'p3'; b.T.run.focus = 100;
  const e0 = b.T.run.essence;
  b.T._run('glean()');
  gte(b.T.run.essence - e0, 1, 'glean paid nothing');
  eq(b.T.run.npcs.p3.state, 'taken', 'gleaned husk did not become taken');
  const e1 = b.T.run.essence;
  b.T.selected = 'p3';
  b.T._run('glean()');
  eq(b.T.run.essence, e1, 'a husk was gleaned twice');
});

check('meeting the quota advances the day, missing it ends the run', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.dayEarned = b.T.quotaFor(1) + 10;
  b.T.run.dayT = 0.001;
  b.T._run('update(0.05)');
  b.T._run('nextDay()');
  eq(b.T.run.day, 2, 'quota met did not advance the day');

  const c = boot();
  c.T._run('startGame(true)');
  c.T.run.dayEarned = 0; c.T.run.dayT = 0.001;
  c.T._run('update(0.05)');
  eq(c.T.mode, 'over', 'missing the quota did not end the run');
});

check('the quota rises every day and compounds in the endless dusk', () => {
  const b = boot();
  for (let d = 2; d <= 14; d++) gte(b.T.quotaFor(d), b.T.quotaFor(d - 1) + 1, 'day ' + d);
  gte(b.T.quotaFor(15), b.T.quotaFor(14), 'endless day 15');
  gte(b.T.quotaFor(25), b.T.quotaFor(20), 'endless compounding');
});

check('a venue blooms at its threshold and unlocks the next one', () => {
  const b = boot();
  b.T._run('startGame(true)');
  notOk(b.T.run.unlocked.club, 'club unlocked too early');
  b.T.run.zones.park.total = 9999; b.T.run.zones.park.rad = 9999;
  b.T._run('checkBloom("park")');
  eq(b.T.run.zones.park.bloomed, 'bloom');
  ok(b.T.run.unlocked.club, 'blooming the park did not unlock the club');
});

check('every venue except the park is locked at the start, and all are reachable', () => {
  const b = boot();
  b.T._run('startGame(true)');
  const locked = b.T.VENUES.filter(v => !b.T.run.unlocked[v.id]).map(v => v.id);
  eq(locked.length, b.T.VENUES.length - 1, 'wrong number locked at start');
  for (let i = 0; i < b.T.VENUES.length - 1; i++) {
    const v = b.T.VENUES[i];
    b.T.run.zones[v.id].total = 99999; b.T.run.zones[v.id].rad = 99999;
    b.T.run.zones[v.id].bloomed = null;
    b.T._run('checkBloom("' + v.id + '")');
  }
  const still = b.T.VENUES.filter(v => !b.T.run.unlocked[v.id]);
  eq(still.length, 0, 'venues unreachable: ' + still.map(v => v.id).join(','));
});

check('contracts generate, track progress and pay out', () => {
  const b = boot();
  b.T._run('startGame(true)');
  eq(b.T.run.contracts.length, 3, 'not three contracts');
  const c = b.T.run.contracts.find(x => x.k === 'rad') || b.T.run.contracts[0];
  const e0 = b.T.run.essence;
  c.k = 'rad'; c.n = 1; c.prog = 0; c.done = false; delete c.amt;
  b.T._run('cprog({type:"harvest", emo:"joy", amt:10, sign:1, onPeak:true, i:0.9})');
  ok(c.done, 'a one step contract did not complete');
  gte(b.T.run.essence - e0, 1, 'contract paid nothing');
});

check('the hard contract awards a relic and relics persist in meta', () => {
  const b = boot();
  b.T._run('startGame(true)');
  eq(Object.keys(b.T.meta.relics).length, 0);
  b.T._run('awardRelic()');
  eq(Object.keys(b.T.meta.relics).length, 1, 'no relic awarded');
  const stored = JSON.parse(b.localStorage.getItem('auraFarmMeta'));
  eq(Object.keys(stored.relics).length, 1, 'relic not persisted');
});

check('buying an action makes it usable and costs essence', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.essence = 1000;
  b.T._run('buyItem("praise")');
  ok(b.T.run.owned.praise, 'purchase did not grant the action');
  eq(b.T.run.essence, 850, 'purchase did not charge the right price');
});

check('a purchase you cannot afford is refused', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.essence = 10;
  b.T._run('buyItem("praise")');
  notOk(b.T.run.owned.praise, 'bought an action without the essence');
  eq(b.T.run.essence, 10, 'essence changed on a refused purchase');
});

check('every shop item is buyable and takes effect', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.essence = 99999;
  for (const it of b.T.SHOP) {
    b.T._run('buyItem("' + it.id + '")');
    const owned = it.kind === 'action' ? b.T.run.owned[it.id]
      : it.kind === 'art' ? b.T.run.arts[it.id] : b.T.run.upgrades[it.id];
    ok(owned, 'shop item ' + it.id + ' did not apply');
  }
});

check('every action in ACTIONS is reachable through the shop or owned at start', () => {
  const b = boot();
  b.T._run('startGame(true)');
  const sellable = new Set(b.T.SHOP.filter(s => s.kind === 'action').map(s => s.id));
  for (const id of Object.keys(b.T.ACTIONS)) {
    ok(b.T.run.owned[id] || sellable.has(id), 'action ' + id + ' can never be obtained');
  }
});

check('no soul is stranded: every roster member sits in a real venue and group', () => {
  const b = boot();
  const venues = new Set(b.T.VENUES.map(v => v.id));
  for (const d of b.T.ROSTER) {
    ok(venues.has(d.venue), d.id + ' lives in an unknown venue');
    ok(d.name && d.group, d.id + ' is missing a name or group');
  }
  eq(new Set(b.T.ROSTER.map(d => d.id)).size, b.T.ROSTER.length, 'duplicate roster ids');
});

check('every trait referenced by a soul exists', () => {
  const b = boot();
  for (const id of Object.keys(b.T.NPC_TRAITS)) {
    ok(b.T.ROSTER.some(d => d.id === id), 'traits for an unknown soul: ' + id);
    for (const t of b.T.NPC_TRAITS[id]) ok(b.T.TRAITS[t], 'unknown trait ' + t + ' on ' + id);
  }
});

check('all six essences are reachable from the emotion mapping', () => {
  const b = boot();
  const seen = new Set();
  for (let v = -1; v <= 1; v += 0.02) for (let i = 0; i <= 1; i += 0.02) seen.add(b.T.emotionOf(v, i));
  for (const k of b.T.EMO_KEYS) ok(seen.has(k), 'essence ' + k + ' is unreachable');
});

/* ============================================================
   6. STUCK STATES
   ============================================================ */
group('6. States a player could get stuck in');

check('selecting a soul who is taken does not wedge the panel', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.npcs.p1.state = 'taken';
  b.T.selected = 'p1';
  noThrow(() => b.T._run('renderPanel()'), 'renderPanel threw on a taken soul');
  noThrow(() => b.T._run('harvest()'), 'harvest threw on a taken soul');
  noThrow(() => b.T._run('glean()'), 'glean threw on a taken soul');
});

check('a venue emptied of souls still runs and still ends the day', () => {
  const b = boot();
  b.T._run('startGame(true)');
  for (const d of b.T.ROSTER) if (d.venue === 'park') b.T.run.npcs[d.id].state = 'taken';
  noThrow(() => { for (let i = 0; i < 60; i++) b.T._run('update(0.05)'); }, 'update threw in an emptied venue');
  b.T.run.dayT = 0.001;
  noThrow(() => b.T._run('update(0.05)'), 'the day could not end in an emptied venue');
  eq(b.T.mode, 'over', 'an emptied venue with no quota did not end the run');
});

check('the day clock is frozen while a modal is open', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T._run('showModal("<p>x</p>")');
  const t0 = b.T.run.dayT;
  b.T._run('update(0.05)');
  eq(b.T.run.dayT, t0, 'the clock ran while a modal was open');
});

check('a thousand simulated seconds never throws', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.day = 11; // Mara at her most aggressive
  b.T._run('rollDay()');
  noThrow(() => {
    for (let i = 0; i < 20000; i++) {
      if (b.T.mode !== 'play') break;
      b.T._run('update(0.05)');
      if (b.T.run && b.T.run.dayT < 1) b.T.run.dayT = 120;
      if (b.T.run) b.T.run.dayEarned = 999999;
    }
  }, 'the simulation threw');
});

check('Mara stays away before day 3 and appears after', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T._run('ensureMara()');
  notOk(b.T.run.mara, 'Mara appeared before day 3');
  b.T.run.day = 5;
  b.T._run('ensureMara()');
  ok(b.T.run.mara, 'Mara never appears');
});

check('flaring your aura stuns Mara and costs focus', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.day = 5; b.T._run('ensureMara()');
  b.T.run.focus = 100;
  b.T._run('shooMara()');
  gte(b.T.run.mara.stunT, 1, 'Mara was not stunned');
  lte(b.T.run.focus, 90, 'flaring cost no focus');
});

/* ============================================================
   7. DETERMINISM
   ============================================================ */
group('7. Determinism (no Math.random in tested logic)');

check('the game exposes a seedable rng', () => {
  ok(/xorshift|_seedRng|rngSeed|_rngState/i.test(SRC), 'no seedable rng found in source');
});

check('the same seed produces the same day roll', () => {
  const a = boot(); const b = boot();
  a.T._run('startGame(true); _seedRng(12345); run.day = 6; rollDay();');
  b.T._run('startGame(true); _seedRng(12345); run.day = 6; rollDay();');
  eq(a.T.run.weather, b.T.run.weather, 'weather differed under the same seed');
  eq(JSON.stringify(a.T.run.event), JSON.stringify(b.T.run.event), 'venue event differed');
  eq(JSON.stringify(a.T.run.contracts.map(c => c.label)),
    JSON.stringify(b.T.run.contracts.map(c => c.label)), 'contracts differed');
});

check('different seeds produce different day rolls', () => {
  const seen = new Set();
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const b = boot();
    b.T._run('startGame(true); _seedRng(' + s + '); run.day = 6; rollDay();');
    seen.add(b.T.run.weather + '|' + JSON.stringify(b.T.run.contracts.map(c => c.label)));
  }
  gte(seen.size, 3, 'eight seeds produced fewer than three distinct days');
});

check('no bare Math.random survives in game logic', () => {
  const logic = stripComments(SRC);
  const hits = [...logic.matchAll(/Math\.random\(\)/g)];
  /* Only the rng seed itself may touch Math.random. */
  ok(hits.length <= 1, hits.length + ' bare Math.random() calls remain in logic');
});

/* ============================================================
   8. BROKER REPUTATION: does it change anything the player can feel?
   ============================================================ */
group('8. Broker reputation must be felt, not just displayed');

function withRep(kind, n = 3) {
  const b = boot();
  b.T._run('startGame(true)');
  for (let i = 0; i < n; i++) b.T._run('repRecordRun("' + kind + '", 50, "joy")');
  return b;
}

check('reputation leans to the type you have played most', () => {
  eq(withRep('lum').T.repLean().lean, 'lum');
  eq(withRep('reap').T.repLean().lean, 'reap');
  eq(withRep('gray').T.repLean().lean, 'gray');
});

check('a withered run is recorded, not only a completed one', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.rad = 100; b.T.run.bli = 900;
  b.T.run.dayEarned = 0; b.T.run.dayT = 0.001;
  b.T._run('update(0.05)');
  eq(b.T.mode, 'over');
  gte((b.T.meta.rep.runs || []).length, 1,
    'dying leaves no trace in reputation, so a learning player never has one');
});

check('Mara prices her tribute by your standing', () => {
  const prices = new Set(['lum', 'gray', 'reap'].map(k => withRep(k).T.tributePrice()));
  eq(prices.size, 3, 'tribute price does not vary with standing');
});

check('Mara siphons at a different rate depending on your standing', () => {
  const rate = k => {
    const b = withRep(k);
    b.T.run.day = 5;
    return b.T._run('maraRate()');
  };
  const l = rate('lum'), r = rate('reap');
  ok(l !== r, 'a Luminary and a Reaper are siphoned at the same rate (' + l + ' vs ' + r + ')');
  gte(l, r, 'the Reaper should be treated as a colleague, not a mark');
});

check('standing seeds the wallet of a returning harvester', () => {
  const fresh = boot();
  fresh.T._run('startGame(true)');
  const e0 = fresh.T.run.essence;
  const back = withRep('lum', 3);
  back.T._run('startGame(true)');
  gte(back.T.run.essence, e0 + 1, 'a returning harvester starts with the same empty wallet');
});

check('contract pools lean with your standing', () => {
  const labels = k => {
    const b = withRep(k, 5);
    const out = [];
    for (let s = 0; s < 40; s++) {
      b.T._run('_seedRng(' + (s + 1) + '); run.day = 7; genContracts(run);');
      out.push(...b.T.run.contracts.map(c => c.k + ':' + (c.emo || '')));
    }
    return out;
  };
  const lum = labels('lum'), reap = labels('reap');
  const bliShare = a => a.filter(x => /^bli|dread|sorrow|rage/.test(x)).length / a.length;
  ok(bliShare(reap) > bliShare(lum),
    'a Reaper and a Luminary get the same contract mix (' + bliShare(reap).toFixed(3) + ' vs ' + bliShare(lum).toFixed(3) + ')');
});

check('the standing is visible during a run, not only on the title', () => {
  const b = withRep('reap');
  b.T._run('startGame(true)');
  b.T._run('openSettings()');
  const html = b.getEl('modalContent').innerHTML;
  ok(/Reaper|standing|Standing/.test(html), 'the pause screen never states your standing');
});

check('the day 2 letter greets who you have been', () => {
  const seen = new Set();
  for (const k of ['lum', 'gray', 'reap']) {
    const b = withRep(k);
    b.T._run('startGame(true); run.day = 2;');
    seen.add(b.T._run('composeLetter({contractsDone:0,shoos:0,stolen:0,ess:emoZero(),rad:0,bli:0,husked:[]}).body'));
  }
  eq(seen.size, 3, 'the day 2 letter reads the same for every standing');
});

/* ============================================================
   9. ECONOMY SANITY
   ============================================================ */
group('9. Economy sanity');

check('blight pays more per harvest than radiance at equal charge', () => {
  const b = boot();
  b.T._run('startGame(true)');
  const mk = (v) => {
    b.T.run.essence = 0; b.T.run.focus = 100;
    b.T.run.npcs.p1.state = 'idle'; b.T.run.npcs.p1.v = v; b.T.run.npcs.p1.i = 0.8;
    b.T.run.npcs.p1.peak = 0; b.T.selected = 'p1';
    b.T._run('harvest()');
    return b.T.run.essence;
  };
  const rad = mk(0.8);
  b.T.run.npcs.p1.state = 'idle';
  const bli = mk(-0.8);
  gte(bli, rad + 1, 'blight does not out pay radiance');
});

check('the day 14 quota is reachable within a day of focus', () => {
  const b = boot();
  b.T._run('startGame(true)');
  /* focus budget for one day: starting focus plus regeneration */
  const budget = 100 + 6 * 120;
  const perHarvest = 14 * 5 + 10; // roughly five pushes then the harvest
  const harvests = budget / perHarvest;
  const perYield = 80; // conservative: 0.8 charge, no bonuses
  gte(harvests * perYield, b.T.quotaFor(14), 'day 14 is not reachable on a full day of focus');
});

check('the shop cannot be paid for with quota progress', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.essence = 1000; b.T.run.dayEarned = 500;
  b.T._run('buyItem("praise")');
  eq(b.T.run.dayEarned, 500, 'spending essence moved the quota bar');
});

check('the harvest button estimate matches what harvest actually pays', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.selected = 'p4'; // Deep Well soul
  const n = b.T.run.npcs.p4;
  n.state = 'idle'; n.v = 0.8; n.i = 0.8; n.peak = 3;
  b.T.run.combo = 4; b.T.run.lastSign = 1; b.T.run.focus = 100;
  const btn = b.doc.createElement('button');
  b.T._run('refreshHarvestBtn(' + 'arguments[0]' + ', run.npcs.p4)', btn);
  const shown = parseInt((btn.innerHTML.match(/~(\d+)✦/) || [])[1], 10);
  const e0 = b.T.run.essence;
  b.T._run('harvest()');
  const actual = b.T.run.essence - e0;
  ok(Math.abs(shown - actual) <= Math.max(2, actual * 0.06),
    'the button promised ' + shown + ' and harvest paid ' + actual);
});

/* ============================================================
   10. PRESENTATION CONTRACTS
   ============================================================ */
group('10. Presentation');

check('the toast rail can hold a whole day announcement', () => {
  const b = boot();
  b.T._run('startGame(true)');
  b.T.run.day = 3; b.T.run.event = { venue: 'park', group: 'The Joggers', n: 'Marathon Day', d: 'x' };
  b.T.run.weather = 'drizzle';
  b.getEl('toasts')._children.length = 0;
  b.T._run('announceDay()');
  const texts = b.getEl('toasts')._children.map(c => c.textContent);
  ok(texts.some(t => /quota/i.test(t)), 'the quota line was destroyed by the toast cap');
  ok(texts.some(t => /Mara/i.test(t)), 'the Mara warning was destroyed by the toast cap');
});

check('every onclick in the markup resolves to a real function', () => {
  const b = boot({ framed: true });
  const handlers = new Set();
  for (const m of HTML.matchAll(/onclick="([a-zA-Z_$][\w$]*)\(/g)) handlers.add(m[1]);
  for (const m of SRC.matchAll(/onclick=\\?["']([a-zA-Z_$][\w$]*)\(/g)) handlers.add(m[1]);
  for (const m of SRC.matchAll(/onclick="\$\{[^}]*\}?([a-zA-Z_$][\w$]*)\(/g)) handlers.add(m[1]);
  ok(handlers.size > 8, 'found suspiciously few handlers: ' + handlers.size);
  for (const h of handlers) {
    ok(b.T._has(h) || typeof b.ctx[h] === 'function', 'onclick="' + h + '()" is not defined');
  }
});

check('the title screen renders and offers a new run', () => {
  const b = boot();
  const html = b.getEl('modalContent').innerHTML;
  ok(/AURA FARM/.test(html), 'no title');
  ok(/confirmNew\(\)/.test(html), 'no new run button');
});

check('the how to screen explains every core verb', () => {
  const b = boot();
  b.T._run('howTo()');
  const html = b.getEl('modalContent').innerHTML;
  for (const word of ['quota', 'peak', 'Radiance', 'Blight', 'contract', 'Mara', 'glean']) {
    ok(new RegExp(word, 'i').test(html), 'how to never mentions ' + word);
  }
});

process.exit(report() ? 0 : 1);
