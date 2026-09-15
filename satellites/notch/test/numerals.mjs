#!/usr/bin/env node
/* N7: no numeral anywhere a child can see (plans/notch/HANDOFF-NOTCH.md 3.7; the handoff's "grep the DOM for [0-9] after a full
 * run").
 *
 *   node test/numerals.mjs          (in the foreground, under the gate lock)
 *
 * Asserted at 375x667 and at 1366x768, each watched to fail on a planted fault:
 *   1. the first screen shows no digit (text, aria labels, titles, alt, the page's title)
 *   2. after a whole session of twelve and a round set aside, the page shows no digit in its visible text or in any label a
 *      screen reader speaks, and no SVG text holds one
 *   3. the settings panel, opened, shows no digit
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { SESSION_LENGTH } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';

/* every string a child could see or hear, from what is on the screen now */
const readable = page => page.evaluate(() => {
  const out = [];
  const visible = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  out.push(['title', document.title]);
  out.push(['text', document.body.innerText]);
  for (const e of document.querySelectorAll('[aria-label], [title], [alt], [aria-valuetext], [placeholder]')) {
    if (!visible(e) && !e.closest('#play') && !e.closest('#first')) continue;
    for (const a of ['aria-label', 'title', 'alt', 'aria-valuetext', 'placeholder']) if (e.hasAttribute(a)) out.push([a + ' on ' + (e.id || e.tagName.toLowerCase()), e.getAttribute(a)]);
  }
  for (const t of document.querySelectorAll('svg text, svg title, svg desc')) out.push(['svg ' + t.tagName, t.textContent]);
  return out;
});
const digits = rows => rows.filter(([, v]) => /[0-9]/.test(v || '')).map(([k, v]) => k + ': ' + JSON.stringify((v || '').slice(0, 60)));
async function seatByKeys(page) {
  let presses = 0;
  while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
    const a = await page.evaluate(() => window.NOTCH.angle());
    await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
    presses++;
  }
  await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });
}

for (const size of [SIZES[1], SIZES[3]]) {
  const at = size.name;
  const { browser, page, errors } = await open(s.base, Object.assign({}, size, { path: '/notch/index.html?seed=4242&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const first = digits(await readable(page));
  say(first.length === 0, at + ' the first screen shows no digit' + (first.length ? ': ' + first.join('; ') : ''));
  await page.evaluate(() => document.getElementById('start').click());
  await sleep(150);
  await page.evaluate(() => document.getElementById('bench').focus());
  const seen = [];
  for (let i = 0; i < SESSION_LENGTH; i++) {
    await seatByKeys(page);
    seen.push(...digits(await readable(page)));
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(60);
    await page.evaluate(() => document.getElementById('bench').focus());
  }
  await tap(page, '#aside');
  await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });
  seen.push(...digits(await readable(page)));
  const played = await page.evaluate(() => window.NOTCH.results.length);
  say(played === SESSION_LENGTH + 1 && seen.length === 0, at + ' after a session of twelve and a round set aside, no digit in the text, any spoken label or any SVG text (' + played + ' rounds)' + (seen.length ? ': ' + Array.from(new Set(seen)).slice(0, 4).join('; ') : ''));
  await tap(page, '.lw-settings-open');
  await sleep(150);
  const panel = await page.evaluate(() => { const p = document.querySelector('.lw-settings'); return p ? [p.innerText].concat(Array.from(p.querySelectorAll('[aria-label]')).map(e => e.getAttribute('aria-label'))) : ['no panel']; });
  const inPanel = panel.filter(t => /[0-9]/.test(t));
  say(panel[0] !== 'no panel' && inPanel.length === 0, at + ' the settings panel shows no digit' + (inPanel.length ? ': ' + inPanel.join('; ') : ''));
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' NUMERALS FAILURE(S)'); process.exit(1); }
console.log('NUMERALS OK');
