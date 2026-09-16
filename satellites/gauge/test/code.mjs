#!/usr/bin/env node
/* GA7: the child's diagnostic code never reaches the page (plans/gauge/HANDOFF-GAUGE.md 3.8).
 *
 *   node test/code.mjs          (in the foreground, under the gate lock)
 *
 * A whole run answered as the longer is larger rule, so the engine holds a code, then the page is read whole. Asserted, each watched
 * to fail on a planted fault:
 *   1. the page holds a code after the run (the premise: an empty code would make the rest vacuous), and it is L
 *   2. no letter code stands alone anywhere a child can see or hear: the body's text, every attribute's value, the title, every
 *      class name and data attribute (L, S, Z, A or U as a word by itself)
 *   3. no rule's name is written anywhere: longer is larger, shorter is larger, zero rule, apparent expert, misconception
 *   4. the settings panel, opened, shows neither
 *   5. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { generateComparisonSet, predict } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const SEED = 4242;
const set = generateComparisonSet(rng(SEED >>> 0));

const everything = page => page.evaluate(() => {
  const out = [document.title, document.body.innerText];
  for (const e of document.querySelectorAll('*')) {
    for (const a of Array.from(e.attributes)) if (!/^(style|d|viewBox|points|href|src|type|role|tabindex|width|height|fill|x|y|lang|charset|name|content|rel)$/.test(a.name)) out.push(a.name + '=' + a.value);
  }
  return out;
});
const letters = rows => rows.filter(t => /(^|[\s=:"'])(L|S|Z|A|U)($|[\s"',.])/.test(t) && !/^(aria-pressed|aria-disabled|aria-checked)=/.test(t));
const names = rows => rows.filter(t => /longer is larger|shorter is larger|zero rule|apparent expert|misconception|diagnos/i.test(t));

const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await tap(page, '#start');
await sleep(150);
const seen = [];
for (let i = 0; i < set.length; i++) {
  await tap(page, '#' + predict.L(set[i]));
  await page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 10000, polling: 'raf' });
  const rows = await everything(page);
  seen.push(...letters(rows).map(t => 'letter ' + t.slice(0, 60)), ...names(rows).map(t => 'name ' + t.slice(0, 60)));
  await tap(page, '#next');
  await sleep(50);
}
const code = await page.evaluate(() => window.GAUGE.code());
say(code === 'L', 'after a run answered as longer is larger the page holds a code, and it is L (' + code + ')');
say(seen.length === 0, 'GA7: no letter code and no rule name anywhere in the text, attributes, classes or title through the whole run' + (seen.length ? ': ' + Array.from(new Set(seen)).slice(0, 4).join('; ') : ''));
await tap(page, '.lw-settings-open');
await sleep(150);
const panel = await everything(page);
const inPanel = letters(panel).concat(names(panel));
say(inPanel.length === 0, 'the settings panel, opened, shows no code and no rule name' + (inPanel.length ? ': ' + inPanel.slice(0, 3).join('; ') : ''));
say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CODE FAILURE(S)'); process.exit(1); }
console.log('CODE OK');
