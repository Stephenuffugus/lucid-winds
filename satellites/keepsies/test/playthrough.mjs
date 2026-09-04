/**
 * A whole game of Ringer, played in a real browser, twice.
 *
 *   node test/playthrough.mjs
 *
 * Once with the Knuckle and once with the pull back fallback, from the title
 * screen through the rules card to a result. This is the gate that answers the
 * only question a unit test cannot: does the thing actually PLAY, from the first
 * button a person presses to the card that tells them what happened.
 *
 * The player's shots are hard straight flicks up the screen, which is a real
 * shot because the camera frames the cross ahead of the shooter: aiming is the
 * camera's job and the flick is the player's.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, '..', '..');
const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const FLEET = ['/music-unlocks.js', '/music-player.js', '/music-catalog.js', '/music-ladder.json'];
const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  const base = FLEET.indexOf(clean) >= 0 ? SITE : ROOT;
  const p = join(base, normalize(clean).replace(/^(\.\.[/\\])+/, ''));
  if (!p.startsWith(base) || !existsSync(p)) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1';

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 180000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle',
    '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/**
 * A real button press, located by what is actually under its centre.
 *
 * ⛔ IT DOES NOT SCROLL BY DEFAULT, and that is the point: a control that is not
 * under its own centre is a control a player cannot tap without knowing to look
 * for it, and refusing to press it is how this gate found BACK sitting below the
 * fold of the collection. Pass `{scroll: true}` where scrolling really is what a
 * player would do, such as reaching the shop under their own shelf. Anything that
 * should be reachable WITHOUT scrolling must be pressed without it.
 */
async function press(id, opts) {
  if (opts && opts.scroll) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
    }, id);
    await new Promise(r => setTimeout(r, 120));
  }
  const b = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el || el.offsetParent === null) return null;
    const r = el.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    // walk up from the pixel to the control it belongs to: a chip's centre lands
    // on its own label span, which is still that chip and still a real hit
    let hit = document.elementFromPoint(cx, cy);
    while (hit && hit.id !== id && hit.parentElement) hit = hit.parentElement;
    return { cx, cy, w: r.width, h: r.height, hitId: hit ? hit.id : null };
  }, id);
  if (!b) return null;
  if (b.hitId !== id) return Object.assign(b, { blocked: true });
  await page.mouse.click(b.cx, b.cy);
  return b;
}

async function waitPlayerTurn(ms) {
  // drive the opponent's turns rather than waiting for the frame loop to grind
  // them out on a software rasteriser
  await page.evaluate(() => { window.KEEPSIES_DEV.playAiTurns(40); window.KEEPSIES_DEV.settleCamera(50); });
  try {
    await page.waitForFunction(() => {
      const s = window.KEEPSIES_DEV.state();
      // the ceremony counts as an end: waiting only for 'results' sails straight
      // past it, which is how the first version of this gate managed to assert
      // nothing about a ceremony that was running the whole time
      if (document.querySelector('.ceremony')) return true;
      return s.screen === 'results' || (s.match && !s.match.simulating && s.match.turn === 0 && s.match.taw);
    }, { timeout: ms || 25000 });
  } catch (e) { return false; }
  await new Promise(r => setTimeout(r, 140));
  return true;
}

/** One hard straight snap through the shooter. */
async function snap() {
  return page.evaluate(() => {
    const d = window.KEEPSIES_DEV;
    const t = d.state().match.taw;
    if (!t) return null;
    const pts = [];
    for (let i = 0; i <= 18; i++) pts.push({ x: t.x, y: t.y - 300 * i / 18, t: 1000 + 55 * i / 18 });
    return d.flick(pts);
  });
}

/** One pull back drag of the same strength. */
async function drag() {
  return page.evaluate(() => {
    const d = window.KEEPSIES_DEV;
    const t = d.state().match.taw;
    if (!t) return null;
    return d.drag({ x: t.x, y: t.y }, { x: t.x, y: t.y + 175 }, { x: 0, y: 0 });
  });
}

/** Play a whole match. Returns what the result card said. */
async function playAMatch(usePullback, label) {
  await page.evaluate((pb) => window.KEEPSIES_DEV.setPullback(pb), usePullback);
  await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 909090, forceFirst: 0, houseRules: { ringSizeFt: 7, bombing: false } }));
  let turns = 0, shots = 0, cancels = 0, seenCeremony = null;
  while (turns++ < 90) {
    const alive = await waitPlayerTurn();
    if (!alive) break;
    const s = await page.evaluate(() => window.KEEPSIES_DEV.state());
    /* ⛔ CATCH THE CEREMONY WHILE IT IS UP. It resolves itself in under two
       seconds, so a gate that only reads the end state would sit through it and
       call a ceremony that never appeared a pass. DESIGN 18 calls this the
       emotional core of the game; it gets an assertion, not a wait. */
    // keep looking until it has something in it, rather than latching on the
    // first frame of an overlay that has not placed its marble yet
    if (!seenCeremony || !seenCeremony.name) {
      seenCeremony = await page.evaluate(() => {
        const v = document.querySelector('.ceremony');
        if (!v) return null;
        const c = v.querySelector('.cer-marble');
        return {
          name: (v.querySelector('.cer-name') || {}).textContent || '',
          line: (v.querySelector('.cer-line') || {}).textContent || '',
          kind: c ? (c.className.indexOf('won') >= 0 ? 'won' : 'lost') : 'none',
          drew: !!(c && c.querySelector('canvas') && c.querySelector('canvas').width === 220),
          resultsStillHidden: document.getElementById('results').hidden
        };
      });
    }
    if (seenCeremony && seenCeremony.name && s.screen !== 'results') {
      await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip());
      await new Promise(r => setTimeout(r, 60));
      continue;
    }
    if (s.screen === 'results') break;
    const aim = usePullback ? await drag() : await snap();
    if (!aim) { cancels++; continue; }
    shots++;
    await page.evaluate(() => window.KEEPSIES_DEV.settle(1500));
    await new Promise(r => setTimeout(r, 30));
  }
  const end = await page.evaluate(() => {
    const s = window.KEEPSIES_DEV.state();
    const g = (id) => { const el = document.getElementById(id); return el ? el.textContent : null; };
    return {
      screen: s.screen, matchesPlayed: s.matchesPlayed,
      title: g('resultTitle'), pocket: g('rPocket'), shots: g('rShots'),
      tech: g('rTech'), sun: g('rSun'), why: g('rWhy'),
      xp: g('rXp'), levelUp: document.getElementById('rLevel').hidden ? '' : g('rLevel')
    };
  });
  end.ceremony = seenCeremony;
  console.log('  ' + label + ': the player took ' + shots + ' shots, ' + cancels + ' cancelled, '
    + turns + ' turns of the loop');
  return end;
}

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });

/* ---- the path a person actually walks ---- */
const playBtn = await press('play');
say(playBtn && !playBtn.blocked, 'PLAY is pressable at its centre');

/* ---- the first twenty seconds: three snaps, and the power curve becomes yours ---- */
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'calib', { timeout: 20000 });
const beforeCalib = await page.evaluate(() => window.KEEPSIES_DEV.state().calib);
say(beforeCalib.own === false, 'before calibration the power curve is a default, not the player\'s');
for (const [px, ms] of [[300, 55], [330, 50], [360, 48]]) {
  await page.waitForFunction(() => {
    const s = window.KEEPSIES_DEV.state();
    return s.screen !== 'calib' || (s.match && !s.match.simulating && s.match.taw);
  }, { timeout: 20000 });
  const still = await page.evaluate(() => window.KEEPSIES_DEV.state().screen === 'calib');
  if (!still) break;
  await page.evaluate((px, ms) => {
    const d = window.KEEPSIES_DEV, t = d.state().match.taw;
    const pts = [];
    for (let i = 0; i <= 18; i++) pts.push({ x: t.x, y: t.y - px * i / 18, t: 1000 + ms * i / 18 });
    d.flick(pts);
    d.settle(1500);
  }, px, ms);
  await new Promise(r => setTimeout(r, 260));
}
const afterCalib = await page.evaluate(() => window.KEEPSIES_DEV.state().calib);
say(afterCalib.own === true, 'after three snaps the power curve is the player\'s own');
say(afterCalib.max > beforeCalib.max, 'and it moved to match a harder thumb: '
  + beforeCalib.max.toFixed(2) + ' to ' + afterCalib.max.toFixed(2) + ' metres a second');
const saved = await page.evaluate(() => window.KEEPSIES_DEV.state().save);
say(saved.backend === 'local', 'it was written to real storage, not to memory: ' + saved.backend);
/* Directions before play is a studio standard, so its absence is a FAILURE with
   a sentence, not a stack trace: a gate that crashes tells the morning reader
   less than a gate that says which rule was broken. */
let sawRules = true;
try {
  await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'rules', { timeout: 12000 });
} catch (e) { sawRules = false; }
say(sawRules, 'the rules card comes before the first match, which is the studio standard');
if (sawRules) {
  const goBtn = await press('rulesGo');
  say(goBtn && !goBtn.blocked, 'the rules card dismisses to the match setup');
}
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'setup', { timeout: 20000 });
const bombChip = await press('hr-bombing');
say(bombChip && !bombChip.blocked, 'the house rule chips are pressable');
const hrNow = await page.evaluate(() => window.KEEPSIES_DEV.houseRules());
say(hrNow.bombing === true, 'and a tap really changed the rule: bombing is ' + hrNow.bombing);
/* ---- the ante: the pot goes up before a shot is fired ---- */
const noStake = await page.evaluate(() => ({
  disabled: document.getElementById('setupGo').disabled,
  say: document.getElementById('anteSay').textContent
}));
say(noStake.disabled === true, 'with nothing staked, PLAY is refused: ' + noStake.say);
const staked = await page.evaluate(() => window.KEEPSIES_DEV.stake('dirt_plain'));
say(!!staked && staked.staked.length === 1, 'staking a clay marble puts one up: ' + staked.staked.join(','));
say(staked.ok === true, 'and the opponent matched it: ' + staked.theirs.join(',') + ' (' + staked.say + ')');
const invBefore = await page.evaluate(() => window.KEEPSIES_DEV.inventory());

const setupBtn = await press('setupGo');
say(setupBtn && !setupBtn.blocked, 'PLAY on the setup starts the match');
const pot = await page.evaluate(() => ({ up: window.KEEPSIES_DEV.potUp(), pot: window.KEEPSIES_DEV.pot(), inv: window.KEEPSIES_DEV.inventory() }));
say(pot.up === true, 'the pot went up BEFORE the first turn');
say(pot.inv === invBefore - 1, 'and the staked marble LEFT the inventory in the same write: '
  + invBefore + ' became ' + pot.inv);
say(!!pot.pot && pot.pot.mine.length === 1 && pot.pot.theirs.length === 1,
  'and both sides are in the pot: yours ' + pot.pot.mine.length + ', theirs ' + pot.pot.theirs.length);
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'match', { timeout: 20000 });
const inMatch = await page.evaluate(() => document.getElementById('houseRules').textContent);
say(inMatch.indexOf('bombing') >= 0, 'and the match is playing under the rule you chose: ' + inMatch);

/* ---- a whole game with the Knuckle ---- */
const a = await playAMatch(false, 'with the Knuckle');
say(a.screen === 'results', 'the Knuckle game reached a result card, which said: ' + a.title);
say(a.title === 'You win' || a.title === 'Dusty Coyle wins', 'the card names a winner: ' + a.title);
/* the pot ceremony, caught mid flight */
say(!!a.ceremony, 'the pot ceremony ran before the card'
  + (a.ceremony ? ': ' + a.ceremony.name + ' ' + a.ceremony.line : ', and it did NOT'));
if (a.ceremony) {
  say(a.ceremony.drew === true, 'and it RENDERED the marble at 220 px rather than naming it');
  say(a.ceremony.name.length > 0 && a.ceremony.line.length > 0,
    'and it said which marble and whose it is: ' + a.ceremony.name + ' ' + a.ceremony.line);
  say(a.ceremony.resultsStillHidden === true, 'and the result card waited behind it');
}
say(/\d+ of \d+/.test(a.pocket || ''), 'it reports what you pocketed: ' + a.pocket);
say(parseInt(a.shots, 10) > 0, 'it reports the shot count: ' + a.shots);
say(a.matchesPlayed === 1, 'one match has been recorded, not ' + a.matchesPlayed);
const after = await page.evaluate(() => ({
  up: window.KEEPSIES_DEV.potUp(), inv: window.KEEPSIES_DEV.inventory(),
  line: document.getElementById('rPot').textContent
}));
say(after.up === false, 'and the pot settled rather than staying up');
say(after.line.length > 0, 'and the card says where the marbles went: ' + after.line);
const wallet = await page.evaluate(() => window.KEEPSIES_DEV.wallet());
say(wallet.sunbeams > 0, 'the game wallet was paid for the match: ' + wallet.sunbeams + ' sunbeams');
say(wallet.clay.count === wallet.clay.max, 'and the clay pool is full at ' + wallet.clay.count
  + ' of ' + wallet.clay.max);
// the number is the headline and the reasons are the receipt beneath it, but
// both have to be ON the card: a payout with no stated reason is a mystery
say(/^\d+$/.test(a.sun.trim()) && a.why.indexOf('match completed') >= 0,
  'and the card says what it paid for: ' + a.sun + ', because ' + a.why);
await page.screenshot({ path: join(OUT, 'k1-results.png') });

/* ---- and the same game with the pull back fallback ---- */
await press('again');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'setup', { timeout: 20000 });
// a fresh match needs a fresh stake: the last one is gone
await page.evaluate(() => window.KEEPSIES_DEV.stake('dirt_plain'));
await press('setupGo');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'match', { timeout: 20000 });
const b = await playAMatch(true, 'with the pull back fallback');
say(b.screen === 'results', 'the pull back game reached a result card too, which said: ' + b.title);
say(b.matchesPlayed === 2, 'two matches have now been recorded, not ' + b.matchesPlayed);
await page.evaluate(() => window.KEEPSIES_DEV.setPullback(false));

/* ---- the collection, and the turntable that makes a marble worth owning ---- */
await press('toTitle');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'title', { timeout: 20000 });
const coll = await press('collect');
say(coll && !coll.blocked, 'the collection is reachable from the title');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'collection', { timeout: 20000 });
const grid = await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tile')];
  const painted = tiles.filter(t => {
    const c = t.querySelector('canvas');
    if (!c) return false;
    const g = c.getContext('2d');
    const d = g.getImageData(0, 0, c.width, c.height).data;
    // a tile that rendered has pixels that are not all transparent
    for (let i = 3; i < d.length; i += 4 * 37) if (d[i] > 8) return true;
    return false;
  }).length;
  const r = tiles[0] ? tiles[0].getBoundingClientRect() : null;
  return { tiles: tiles.length, painted, w: r ? r.width : 0, h: r ? r.height : 0 };
});
say(grid.tiles > 0, 'the grid has ' + grid.tiles + ' tiles in it');
say(grid.painted === grid.tiles, 'and every one of them RENDERED a marble: ' + grid.painted
  + ' of ' + grid.tiles + ' have pixels in them');
say(grid.w >= 90 && grid.w <= 104, 'the tiles are ' + grid.w.toFixed(0) + ' by ' + grid.h.toFixed(0)
  + ' rendered px, and the design says 96');

const inspected = await page.evaluate(() => window.KEEPSIES_DEV.inspect('bloodstone_aggie'));
say(!!inspected && inspected.name === 'Bloodstone Aggie',
  'inspect opens on a marble by name: ' + (inspected ? inspected.name : 'nothing'));
say(!!inspected && inspected.traits >= 4, 'and it lists ' + (inspected ? inspected.traits : 0)
  + ' traits, in words rather than numbers');
const words = await page.evaluate(() => document.getElementById('iTraits').textContent);
say(!/\d\.\d/.test(words.replace('16 mm', '')),
  'and no raw stat number reached the card: ' + words.slice(0, 70));
const prov = await page.evaluate(() => document.getElementById('iProv').textContent);
say(prov.length > 0, 'every marble carries a provenance line: ' + prov);
await page.screenshot({ path: join(OUT, 'k2-inspect-rare.png') });
await press('inspectBack');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'collection', { timeout: 20000 });

/* ---- a pouch, which is the other half of the loop ---- */
/* ⛔ THE POUCHES ARE GATED ON LEVEL 2 (DESIGN 20), and two matches do not always
   get there: two losses are 80 XP against a 120 cost. This gate asserts the gate
   itself before it opens it, because a lock nobody checks is a lock that quietly
   stops working. */
const locked = await page.evaluate(() => ({
  level: window.KEEPSIES_DEV.progress().level,
  pouch: !!document.getElementById('pouch-standard'),
  say: (document.getElementById('pouches').textContent || '')
}));
if (locked.level < 2) {
  say(locked.pouch === false, 'below level 2 there are no pouches to press at all');
  say(locked.say.indexOf('open at level 2') >= 0, 'and the screen says why: ' + locked.say.slice(0, 70));
  await page.evaluate(() => window.KEEPSIES_DEV.grantXp(400));
} else {
  say(true, 'the player is already level ' + locked.level + ', so the pouches are open');
}
const before = await page.evaluate(() => window.KEEPSIES_DEV.wallet().sunbeams);
await page.evaluate(() => window.KEEPSIES_DEV.grantSunbeams(1500));
const std = await press('pouch-standard', { scroll: true });
say(std && !std.blocked, 'the Standard Pouch is pressable when it can be afforded');
const opened = await page.evaluate(() => ({
  say: window.KEEPSIES_DEV.pouchSay(),
  wallet: window.KEEPSIES_DEV.wallet().sunbeams,
  inventory: window.KEEPSIES_DEV.inventory()
}));
say(opened.say.length > 0, 'the pouch says what came out: ' + opened.say);
say(opened.wallet === before + 1500 - 300 || opened.wallet === before + 1500 - 300 + 5,
  'and it cost 300 sunbeams: ' + (before + 1500) + ' became ' + opened.wallet);
await page.screenshot({ path: join(OUT, 'k2-pouches.png') });
const poor = await page.evaluate(() => {
  const b = document.getElementById('pouch-grail');
  return b ? b.disabled : null;
});
say(poor === true, 'and a pouch you cannot afford is disabled rather than failing on the tap');


await press('collBack');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'title', { timeout: 20000 });

/* ---- progression: XP from any match, and the pouches are gated on it ---- */
say(/\d+ XP/.test(a.xp || ''), 'the card says what the match was worth in XP: ' + a.xp);
say((a.xp || '').indexOf('to level') >= 0 || (a.levelUp || '').indexOf('Level') >= 0,
  'and either how far to the next level or that one was reached: ' + (a.levelUp || a.xp));
const prog = await page.evaluate(() => window.KEEPSIES_DEV.progress());
say(prog.level >= 2, 'the player has climbed past level 1: level ' + prog.level
  + ', ' + prog.xp + ' XP in');
say(prog.unlocked.pouches === true, 'and that is what opens the pouches');
say(prog.unlocked.arena === false || prog.level >= 3,
  'and the Arena is still shut, because it opens at ' + 3 + ' and this player is ' + prog.level);

/* ---- losing a rare opens the buy back window, and the card is real ---- */
const lostRare = await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  const m = d.grantMarble('bloodstone_aggie');
  d.grantSunbeams(1000);
  d.setup();
  d.stake('bloodstone_aggie');
  d.go({ seed: 313131, forceFirst: 1 });
  d.forceEnd(1);                                     // the opponent wins it
  return { granted: m, offers: d.offers().length };
});
say(!!lostRare.granted && lostRare.granted.tier === 'rare',
  'a rare goes into the inventory and gets staked: ' + (lostRare.granted || {}).name);
say(lostRare.offers === 1, 'and losing it opens exactly one buy back offer: ' + lostRare.offers);
await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip());
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'ransom', { timeout: 20000 });
const card = await page.evaluate(() => ({
  name: document.getElementById('rsName').textContent,
  say: document.getElementById('rsSay').textContent,
  clock: document.getElementById('rsClock').textContent,
  drew: !!(document.querySelector('#ransomArt canvas')),
  payEnabled: !document.getElementById('rsPay').disabled
}));
say(card.name === 'Bloodstone Aggie', 'the offer card names the marble: ' + card.name);
say(card.drew === true, 'and RENDERS it rather than describing it');
say(card.say.indexOf('400') >= 0, 'and says the price in sunbeams: ' + card.say);
say(card.clock.indexOf('hours left') >= 0, 'and how long is left: ' + card.clock);
say(card.payEnabled === true, 'and the buy back button is live because it can be afforded');
const invBeforePay = await page.evaluate(() => window.KEEPSIES_DEV.inventory());
const payBtn = await press('rsPay');
say(payBtn && !payBtn.blocked, 'the buy back button is pressable at its centre');
const bought = await page.evaluate(() => ({
  say: document.getElementById('rsSay').textContent,
  inv: window.KEEPSIES_DEV.inventory(),
  offers: window.KEEPSIES_DEV.offers().length,
  wallet: window.KEEPSIES_DEV.wallet().sunbeams
}));
say(bought.inv === invBeforePay + 1,
  'and the marble comes home: ' + invBeforePay + ' became ' + bought.inv);
say(bought.offers === 0, 'and the offer closes: ' + bought.offers + ' still open');
say(bought.say.indexOf('yours again') >= 0, 'and the card says so: ' + bought.say);
await press('rsLater');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'results', { timeout: 20000 });
say(true, 'and it hands over to the result card, which is the same contract the ceremony has');
await press('again');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'setup', { timeout: 20000 });
await press('setupBack');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'title', { timeout: 20000 });

/* ---- reduce motion: the ceremony must still hand over the card ---- */
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const rm = await page.evaluate(() => {
  const d = window.KEEPSIES_DEV;
  d.setup();
  d.stake('dirt_plain');
  return d.go({ seed: 121212, forceFirst: 0 });
});
say(rm === true, 'a second staked match starts under reduce motion');
await page.evaluate(() => { window.KEEPSIES_DEV.forceEnd(0); });
await page.waitForFunction(() => !!document.querySelector('.ceremony'), { timeout: 20000 });
const still = await page.evaluate(() => {
  const v = document.querySelector('.ceremony');
  const c = v.querySelector('.cer-marble');
  return { still: !!(c && c.className.indexOf('still') >= 0), name: (v.querySelector('.cer-name') || {}).textContent };
});
say(still.still === true, 'and the ceremony stands still rather than rolling: ' + still.name);
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'results', { timeout: 20000 });
say(true, 'and it still handed over the result card, which is the whole contract');
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
await press('again');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'setup', { timeout: 20000 });
await press('setupBack');
await page.waitForFunction(() => window.KEEPSIES_DEV.state().screen === 'title', { timeout: 20000 });

/* ---- the way out ---- */
const exitOk = await page.evaluate(() => typeof window.SWS_EXIT === 'function' && !!window._sbCapEarn);
say(exitOk, 'the embed protocol and the sunbeam cap helper are both real functions');

say(errors.length === 0, 'zero page errors across two whole games'
  + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));

await browser.close();
server.close();
console.log(fails.length ? '\n' + fails.length + ' FAILED\nPLAYTHROUGH FAILED' : '\nPLAYTHROUGH OK');
process.exit(fails.length ? 1 : 0);
