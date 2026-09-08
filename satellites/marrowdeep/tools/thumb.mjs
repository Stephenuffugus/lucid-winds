#!/usr/bin/env node
/* The arcade tile, shot from the REAL running game, square, under the 150 KB
 * the portal grid needs when it loads a hundred of them at once.
 *
 *   node tools/thumb.mjs
 *
 * IT SHOOTS THE BOSS BOARD, and that is the whole argument of this file. The
 * title screen is a die and a word and could be any game in the fleet; the
 * quest board is two challenge cards and reads as a form. The boss board is the
 * one picture that says what Marrowdeep is: three named Aspects with hit point
 * pips on them, a party Strain bar filling across the top, and three characters
 * under it. A shelf reader learns the game from it without a word of copy.
 *
 * ⛔ THE SQUARE IS A CROP, NOT A SQUARE PHONE, and the first version got that
 * wrong. Opening the game in a 512 by 512 window looks like the obvious way to
 * get a square tile and it is not: `.body` is capped at 420 px wide and
 * `#scr-boss .body` grows from the BOTTOM (the party cards are the most tapped
 * things in the game, so they sit where a thumb pivots), so a square window
 * pushed the boss name and the Strain bar off the top of the scroller and left
 * the bottom third of the tile empty. Measured: 2.6 percent ink, no name, no
 * bar. So the browser is opened TALL, at the width the board is designed for,
 * and the tile is a square CLIP measured around the board's own rectangle. What
 * the tile shows is exactly what the phone shows.
 *
 * It gets there the way a player does: BEGIN, three rolls kept, three deployed,
 * GO, and every stage of a seeded Depth I quest played through with the taps the
 * engine's own policy chooses, until the boss stage opens. Nothing here writes a
 * state and photographs it. The one liberty a camera takes and a gate may not is
 * MD_DEV.seed, so the same boss stands in the tile every run.
 *
 * The footer is HIDDEN before the shutter: a tile with a RESOLVE button across
 * the bottom reads as a screenshot of a UI, and the shelf wants art. The music
 * chip's own corner is left alone because the chip is not in this page.
 *
 * ⛔ A camera with no check on its own picture is the same mistake as a gate
 * that cannot fail. Fathom's tool wrote a completely black tile and printed
 * THUMB OK because nothing read the pixels. So this one reads its own shot back
 * through a canvas and refuses a tile that is mostly ground, AND it measures the
 * thing the tile is for: the boss name, three Aspect cards, three party cards
 * and the Strain bar all present with real rectangles INSIDE the square. A tile
 * whose Aspects have fallen off the bottom edge is not a picture of this game,
 * and it would pass an ink count on the party cards alone.
 *
 * Fable moves the result to portal-assets/thumbs/marrowdeep.png in the morning.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serve, open, ROOT, tap, waitScreen } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024;
const SEED = 2;
/* The two floors, and what each defends. Both are guards against a tile that
   reads as a broken image on a shelf beside eleven others, and both are set
   below what the board measures today so that a layout change is not a red gate
   while a PAINT failure is. See the two measures where they are taken. */
const MIN_INK = 0.02;    /* line and letter. The tile as it ships measures 4.6 percent */
const MIN_CARD = 0.30;   /* card rather than bare deep. The tile as it ships measures 64.5 percent */
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

/* the camera's window. WIDE enough that a square clip around the 420 px board
   has ground on both sides of it, TALL enough that the whole board is on the
   screen at once with the footer gone. */
const VIEW = { width: 620, height: 980 };

async function shoot(scale) {
  const { browser, page, errors } = await open(base, { ...VIEW, deviceScaleFactor: scale });
  const T = sel => tap(page, sel);
  const scr = () => page.evaluate(() => window.MD_DEV.screen());

  await page.evaluate(n => window.MD_DEV.seed(n), SEED);
  await T('#btnBegin');
  await waitScreen(page, 'creation');
  for (let i = 0; i < 3; i++) {
    await waitScreen(page, 'creation');
    await T('#btnRoll');
    await page.waitForFunction(() => document.querySelectorAll('#creCallings .card').length > 0, { timeout: 20000 });
    await T('#creCallings .card');
    await page.waitForFunction(() => { const b = document.getElementById('btnKeep'); return !!b && !b.hidden; }, { timeout: 20000 });
    await T('#btnKeep');
  }
  if ((await scr()) === 'how') await T('#btnGotIt');
  await waitScreen(page, 'hall');
  await T('#btnDeploy');
  await waitScreen(page, 'deploy');
  const picks = await page.evaluate(() => {
    const rows = Array.prototype.slice.call(document.querySelectorAll('#deployList .rostrow'));
    const out = [];
    rows.forEach((r, i) => { if (r.classList.contains('pickable')) out.push(i + 1); });
    return out;
  });
  for (const i of picks.slice(0, 3)) await T(`#deployList .rostrow:nth-child(${i})`);
  await T('#btnGo');
  await page.waitForFunction(() => !!window.MD_DEV.quest(), { timeout: 20000 });

  /* play the stages until the boss stage opens. Progress is the QUEST moving,
     never a screen being seen twice. */
  let turns = 0, stuck = 0, last = '', reached = false;
  while (turns++ < 400) {
    const s = await scr();
    if (s === 'boss') { reached = true; break; }
    const sig = await page.evaluate(() => {
      const q = window.MD_DEV.quest();
      if (!q) return 'noquest|' + window.MD_DEV.screen();
      return [q.stageIndex, q.step, q.cursor, q.round, q.results.length, (q.drops || []).length, !!q.held].join('|');
    });
    const full = s + '@' + sig;
    if (full === last) stuck++; else { stuck = 0; last = full; }
    if (stuck > 6) break;
    if (s === 'hall' || s === 'title') break;
    if (s === 'quest') {
      const plan = await page.evaluate(() => {
        const state = window.MD_DEV.state(), q = window.MD_DEV.quest();
        const stage = window.MD.SIM.currentStage(state);
        const p = window.MD.SIM.policy.assign(state);
        const alive = id => { const c = state.roster.filter(r => r.id === id)[0]; return !!c && c.alive; };
        const living = q.party.filter(alive);
        const used = {}, out = [];
        stage.slots.forEach(function (sl, i) {
          if (sl.done) return;
          const wantN = sl.shape === 'relay' ? 2 : 1;
          const chars = (p.slots[i] && p.slots[i].chars) ? p.slots[i].chars.slice() : [];
          while (chars.length < wantN) {
            const spare = living.filter(id => chars.indexOf(id) < 0).sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
            if (spare == null) break;
            chars.push(spare);
          }
          chars.forEach(function (id) { used[id] = (used[id] || 0) + 1; out.push({ slot: i, pc: q.party.indexOf(id) }); });
        });
        return out;
      });
      for (const t of plan) {
        await tap(page, `#qParty .pc:nth-child(${t.pc + 1})`);
        await tap(page, `#qChallenges .chal:nth-child(${t.slot + 1})`);
      }
      if (await page.evaluate(() => document.getElementById('btnResolve').disabled)) break;
      await T('#btnResolve');
      continue;
    }
    if (s === 'preroll') { await T('#btnRollCheck'); continue; }
    if (s === 'result') { await T('#btnContinue'); continue; }
    if (s === 'sheet') { await T('#btnSheetNext'); continue; }
    if (s === 'death') { await T('#btnDeathOn'); continue; }
    if (s === 'drop') { await T('#btnSalvage'); continue; }
    if (s === 'trait') { await tap(page, '#trCards .card'); await T('#btnTraitKeep'); continue; }
    if (s === 'how') { await T('#btnGotIt'); continue; }
    break;
  }
  if (!reached) {
    await browser.close();
    return { reached: false, errors };
  }

  /* THE CHROME COMES OFF FIRST, and with display:none rather than visibility:
     hidden, because the footer reserves 124 px of the column and the board is
     measured after it is gone. A tile with a RESOLVE button across the bottom is
     a screenshot of a UI; the shelf wants art. */
  await page.evaluate(() => {
    const pin = document.querySelector('#scr-boss .pin');
    if (pin) pin.style.display = 'none';
  });

  /* WHAT THE TILE IS OF, measured before the shutter and not assumed: the boss
     name, the Strain bar, the Aspect cards and the party cards, each with a real
     rectangle. The square is then measured AROUND those rectangles, so the
     framing follows the board instead of the board having to fit a framing. */
  const parts = await page.evaluate(() => {
    const box = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    };
    const asp = Array.prototype.map.call(document.querySelectorAll('#bossAspects .asp'), box);
    const pcs = Array.prototype.map.call(document.querySelectorAll('#bossParty .pc'), box);
    const name = document.getElementById('bossName');
    return {
      name: name ? name.textContent.trim() : '',
      nameBox: box(name),
      bar: box(document.querySelector('.strainbar')),
      aspects: asp, party: pcs,
      pips: document.querySelectorAll('#bossAspects .hpp').length,
      W: window.innerWidth, H: window.innerHeight,
      ground: getComputedStyle(document.getElementById('scr-boss')).backgroundColor.match(/[0-9.]+/g).map(Number)
    };
  });

  /* the square, measured around the board with a margin of ground, then clamped
     into the window. MARGIN is what keeps the cards off the four edges: a tile
     whose top card is flush with the frame reads as a crop of something bigger. */
  const MARGIN = 22;
  const all = [parts.nameBox, parts.bar].concat(parts.aspects, parts.party).filter(Boolean);
  const L = Math.min(...all.map(b => b.x)), R = Math.max(...all.map(b => b.x + b.w));
  const Tp = Math.min(...all.map(b => b.y)), B = Math.max(...all.map(b => b.y + b.h));
  let side = Math.max(R - L, B - Tp) + MARGIN * 2;
  side = Math.min(side, parts.W, parts.H);
  const clip = {
    x: Math.round(Math.max(0, Math.min(parts.W - side, (L + R) / 2 - side / 2))),
    y: Math.round(Math.max(0, Math.min(parts.H - side, (Tp + B) / 2 - side / 2))),
    width: Math.round(side), height: Math.round(side)
  };
  parts.clip = clip;
  const buf = await page.screenshot({ type: 'png', clip: clip });

  /* READ THE TILE BACK, the pixels Chrome actually painted, and measure it TWICE.
     ⛔ One lit fraction is not enough on this palette and a single number was
     wrong the first time it was tried here. The ground is #0c0a10 and a card on
     it is #14111a, ten values apart at the widest channel, so a threshold that
     catches text and borders CANNOT see a card, and a threshold that sees a card
     is satisfied by a screen of empty cards with no names on them. So:
       card  how much of the square is card rather than bare deep, at a distance
             of 6. This is the framing measure: a board adrift in ground scores
             low on it and a board that fills its frame scores 64.5, which is
             what the tile that ships measures.
       ink   how much is LINE AND LETTER, at a distance of 24: names, targets,
             pips, the Strain bar. A tile whose cards painted and whose words did
             not is a grey grid, which is what a shelf reads as a broken game. */
  const lit = await page.evaluate(async (b64, bg) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let ink = 0, card = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      n++;
      const dist = Math.max(Math.abs(d[i] - bg[0]), Math.abs(d[i + 1] - bg[1]), Math.abs(d[i + 2] - bg[2]));
      if (dist > 24) ink++;
      if (dist > 6) card++;
    }
    return { ink: ink / n, card: card / n };
  }, buf.toString('base64'), parts.ground);

  await browser.close();
  return { reached: true, buf, ink: lit.ink, card: lit.card, parts, clip: parts.clip, errors };
}

/* the law the picture has to meet, written as the law and not as the count of
   the board today: a boss stands on THREE or more Aspects (R7.1 adds a dormant
   fourth at the deeper Depths, and that must not turn this red) and a party
   deploys three. */
const NEED_ASPECTS = 3, NEED_PARTY = 3;
let got = null;
for (let attempt = 1; attempt <= 3 && !got; attempt++) {
  const r = await shoot(2);
  if (!r.reached) { console.log('  attempt ' + attempt + ': the walk never reached the boss board'); continue; }
  const p = r.parts, c = r.clip;
  const inClip = b => b && b.x >= c.x - 0.5 && b.y >= c.y - 0.5 &&
    b.x + b.w <= c.x + c.width + 0.5 && b.y + b.h <= c.y + c.height + 0.5;
  const cut = [];
  if (!p.nameBox) cut.push('the boss has no name on the board');
  else if (!inClip(p.nameBox)) cut.push('the boss name is outside the square');
  if (!p.bar) cut.push('there is no Strain bar');
  else if (!inClip(p.bar)) cut.push('the Strain bar is outside the square');
  const asps = p.aspects.filter(Boolean);
  if (asps.length < NEED_ASPECTS) cut.push('only ' + asps.length + ' Aspect card(s) are on the board, the law is ' + NEED_ASPECTS);
  if (asps.filter(a => !inClip(a)).length) cut.push(asps.filter(a => !inClip(a)).length + ' Aspect card(s) fall outside the square');
  if (!p.pips) cut.push('the Aspects carry no hit point pips, which is the thing the tile is of');
  const pcs = p.party.filter(Boolean);
  if (pcs.length < NEED_PARTY) cut.push('only ' + pcs.length + ' character card(s) are on the board, the law is ' + NEED_PARTY);
  if (pcs.filter(a => !inClip(a)).length) cut.push(pcs.filter(a => !inClip(a)).length + ' character card(s) fall outside the square');
  console.log('  attempt ' + attempt + ': a ' + c.width + ' px square at ' + c.x + ',' + c.y + ', ' +
    (r.card * 100).toFixed(1) + ' percent card, ' + (r.ink * 100).toFixed(1) + ' percent ink, ' +
    asps.length + ' Aspects with ' + p.pips + ' pips, ' + pcs.length + ' characters, boss ' +
    JSON.stringify(p.name) + ', ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  /* ⛔ A rejected picture is written out and NAMED. A camera that refuses its own
     shot and shows nobody what it refused turns into a tool that just fails. */
  const reject = () => {
    const p2 = join(tmpdir(), 'marrowdeep-thumb-reject-' + attempt + '.png');
    writeFileSync(p2, r.buf);
    console.log('    the picture it refused is at ' + p2 + '. OPEN IT.');
  };
  if (cut.length) { console.log('    ' + cut.join('; ') + '. Retaking.'); reject(); continue; }
  if (r.card < MIN_CARD) {
    console.log('    only ' + (r.card * 100).toFixed(1) + ' percent of the square is card, under the ' +
      (MIN_CARD * 100) + ' percent floor: the board is adrift in ground and the framing is wrong. Retaking.');
    reject(); continue;
  }
  if (r.ink < MIN_INK) {
    console.log('    the tile is ' + (r.ink * 100).toFixed(1) + ' percent line and letter, under the ' +
      (MIN_INK * 100) + ' percent floor: the cards painted and the words did not. Retaking.');
    reject(); continue;
  }
  got = r;
}
if (!got) {
  close();
  console.log('\nTHE TILE NEVER CAME OUT RIGHT in three walks. Either the boss board was never reached, or');
  console.log('the picture is missing the thing it is of: named Aspects, three characters and a Strain bar.');
  console.log('THUMB NOT TAKEN');
  process.exit(1);
}
/* over the grid's limit, the tile is retaken at ONE device pixel per CSS px
   rather than reframed: the framing is the picture and it has already passed,
   so what gives is the density and nothing else. */
let buf = got.buf, dpr = 2;
if (buf.length > LIMIT) {
  console.log('  ' + (buf.length / 1024).toFixed(0) + ' KB is over the 150 KB grid limit, retaking at 1 device pixel per CSS px');
  const r = await shoot(1);
  if (r.reached && r.buf.length < buf.length) { buf = r.buf; dpr = 1; }
}
writeFileSync(OUT, buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + (got.clip.width * dpr) + ' px square  ' + kb.toFixed(1) + ' KB  ' +
  (kb <= 150 ? 'under the limit' : 'STILL OVER'));
console.log('\nOPEN IT. A thumb nobody looked at is how a menu screenshot ends up on the shelf.');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
