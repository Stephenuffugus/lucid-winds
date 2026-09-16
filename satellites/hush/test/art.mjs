#!/usr/bin/env node
/* HUSH's art laws (plans/hush/HANDOFF-HUSH.md 3.8, 3.9, 3.10): information by tier, H3 as pixels, the alert pose never red, and
 * each species drawn in its own coat on the page.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock: its last part opens the page)
 *
 * The sprite laws read the table the page draws from (sprites.js, with each species' coat swapped in as render.js swaps it); the
 * page law reads the clearing's own pixels. Asserted, each watched to fail on a planted fault:
 *   1. 3.8: for every species, each tier of its grazing pose uses more distinct colours than the tier before, and the nearest tier
 *      carries the eye's highlight in its head and the breath in its alert pose
 *   2. H3 (3.9): every alert pose (up, half, ear) of every species and tier differs from its grazing pose in under a fifth of the
 *      grid, and only left of x 0.4, where the head, the neck and the ears are
 *   3. 3.9: every pixel the alert pose paints differently is never red (no hue from 345 to 15 degrees in any coloured pixel), and on
 *      average no darker than what the grazing pose paints there
 *   4. 3.10: on the page, the hare's approach paints the hare's coat and not the deer's, and the fox's the fox's
 *   5. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { SPRITES, PALETTE, COATS, SPECIES, TIER_SIZES } from '../sprites.js';

const { fails, say } = reporter();
/* each species' own coat, the colour its approach must paint and no other species' approach may */
const COAT_OF = Object.fromEntries(SPECIES.map(sp => [sp, COATS[sp][1].toLowerCase()]));
const pal = species => { const p = PALETTE.slice(); p[4] = COATS[species][0]; p[5] = COATS[species][1]; p[6] = COATS[species][2]; return p; };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lstar = h => { const [r, g, b] = rgb(h).map(lin), y = 0.2126 * r + 0.7152 * g + 0.0722 * b; return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y; };
const hueSat = h => { const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.12) return { hue: null, sat: d };
  let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hue *= 60; if (hue < 0) hue += 360; return { hue, sat: d }; };

/* 1 */
{
  const bad = [];
  for (const sp of SPECIES) {
    let last = 0;
    TIER_SIZES.forEach((N, tier) => {
      const colours = new Set(SPRITES[sp + tier + 'graze'].join('').replace(/\./g, '').split('')).size;
      if (!(colours > last)) bad.push(sp + ' tier ' + tier + ' uses ' + colours + ' colours after ' + last);
      last = colours;
    });
    const N = TIER_SIZES[5], head = Math.floor(0.4 * N) + 1;
    const eye = SPRITES[sp + '5graze'].some(row => row.slice(0, head).indexOf('9') >= 0);
    const breath = SPRITES[sp + '5up'].some(row => row.indexOf('a') >= 0);
    if (!eye) bad.push(sp + ' tier 5 has no eye highlight in its head');
    if (!breath) bad.push(sp + ' tier 5 alert pose has no breath');
  }
  say(bad.length === 0, '3.8: every species\' tiers use more colours as they come nearer, and the nearest carries the eye\'s highlight and the breath' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
}

/* 2 and 3 */
{
  const h3 = [], red = [], dark = [];
  for (const sp of SPECIES) {
    const p = pal(sp);
    TIER_SIZES.forEach((N, tier) => {
      const go = SPRITES[sp + tier + 'graze'], limit = Math.floor(0.4 * N);
      for (const pose of ['up', 'half', 'ear']) {
        const nogo = SPRITES[sp + tier + pose];
        let changed = 0, outside = 0, goL = [], nogoL = [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const a = go[y][x], b = nogo[y][x];
          if (a === b) continue;
          changed++;
          if (x > limit) outside++;
          if (b !== '.') {
            const hs = hueSat(p[parseInt(b, 16)]);
            if (hs.hue !== null && (hs.hue >= 345 || hs.hue <= 15)) red.push(sp + tier + pose + ' paints ' + p[parseInt(b, 16)] + ' at ' + x + ',' + y);
            nogoL.push(lstar(p[parseInt(b, 16)]));
          }
          if (a !== '.') goL.push(lstar(p[parseInt(a, 16)]));
        }
        if (!(changed < N * N / 5) || outside > 0) h3.push(sp + tier + pose + ' changes ' + changed + ' of ' + N * N + ' pixels, ' + outside + ' right of x 0.4');
        const mean = xs => xs.reduce((s, v) => s + v, 0) / Math.max(1, xs.length);
        if (nogoL.length && goL.length && mean(nogoL) < mean(goL)) dark.push(sp + tier + pose + ' changed pixels ' + mean(nogoL).toFixed(1) + ' against grazing ' + mean(goL).toFixed(1));
      }
    });
  }
  say(h3.length === 0, 'H3: every alert pose of every species and tier changes under a fifth of its grid, only left of x 0.4' + (h3.length ? ': ' + h3.slice(0, 4).join('; ') : ' (' + SPECIES.length * TIER_SIZES.length * 3 + ' poses)'));
  say(red.length === 0 && dark.length === 0, '3.9: what an alert pose paints differently is never red and on average no darker than the grazing pose' + (red.length || dark.length ? ': ' + red.concat(dark).slice(0, 4).join('; ') : ''));
}

/* 4: each species' coat on the page */
{
  const s = await serve(join(MATH, '..'));
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/hush/index.html?seed=4242&', ready: 'window.HUSH && window.HUSH.ready' }));
  const { page, errors } = opened;
  await page.evaluate(() => document.getElementById('fork-careful').click());
  await sleep(150);
  const seen = {};
  for (const [k, sp] of SPECIES.entries()) {
    /* the settles kept on the device choose the species; the approach stands near so the creature is drawn large */
    await page.evaluate(n => { const rec = JSON.parse(localStorage.getItem('lw:hush:save')); rec.adapt.settles = n; rec.adapt.steps = 15; localStorage.setItem('lw:hush:save', JSON.stringify(rec)); }, k);
    await page.goto(s.base + '/hush/index.html?seed=4242&count=40&fork=careful&', { waitUntil: 'load' });
    await page.waitForFunction('window.HUSH && window.HUSH.ready', { timeout: 30000 });
    await page.evaluate(() => document.getElementById('start').click());
    await page.waitForFunction(() => { const l = window.HUSH.live(); return !!l && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' });
    const colours = await page.evaluate(() => {
      const c = document.getElementById('clearing'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, set = new Set();
      for (let i = 0; i < d.length; i += 4) set.add('#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join(''));
      return Array.from(set);
    });
    seen[sp] = { species: await page.evaluate(() => window.HUSH.species()), own: colours.includes(COAT_OF[sp]), others: SPECIES.filter(o => o !== sp && colours.includes(COAT_OF[o])) };
  }
  const ok = SPECIES.every(sp => seen[sp].species === sp && seen[sp].own && seen[sp].others.length === 0);
  say(ok, '3.10: each species\' approach paints its own coat and no other\'s (' + JSON.stringify(seen) + ')');
  say(errors.length === 0, 'the page: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
  s.close();
}

console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
