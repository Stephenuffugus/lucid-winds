#!/usr/bin/env node
/* HUSH's teacher's links (plans/hush/HANDOFF-HUSH.md P3; the shape of TINT's and GAUGE's test/config.mjs). The builder at
 * satellites/math/config registers HUSH with the SAME schema the page parses (satellites/hush/config.js), so a link made there asks
 * only for what the page will play.
 *
 *   node test/config.mjs          (in the foreground, under the gate lock: its last part opens the page)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the builder has an entry for HUSH going to ../hush/
 *   2. every key the builder offers, the page parses with the same type, the same values or bounds, and the same default; the seed
 *      is the page's own and never offered
 *   3. a link for every value the builder can offer reads back through the page's schema as exactly that value
 *   4. main.js imports HUSH_SCHEMA from ./config.js and hands it to parseConfig
 *   5. in a browser: a link of the builder's defaults and a link of other values play the fork and the run length the link asked
 *      for; a link naming a fork skips the child's picture fork and one naming none shows it on a first visit; the first run's
 *      order is the one Node deals at the seed for that fork
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { parseConfig, buildQuery, rng } from '../../math/core/pure.js';
import { GAMES } from '../../math/config/schemas.js';
import { HUSH_SCHEMA } from '../config.js';
import { dealRun, adaptAxes } from '../engine.js';

const HUSH = join(MATH, '..', 'hush');
const { fails, say } = reporter();
const valuesOf = rule => rule.type === 'enum' ? rule.values : rule.type === 'bool' ? [true, false]
  : Array.from(new Set([rule.min, Math.round((rule.min + rule.max) / 2), rule.max, rule.default]));

const entry = GAMES.hush;
say(!!entry && entry.path === '../hush/', 'the builder has an entry for HUSH going to ../hush/' + (entry ? ' (' + entry.path + ')' : ' (none)'));
if (entry) {
  const differ = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    const mine = HUSH_SCHEMA[k];
    if (!mine) { differ.push(k + ' is not parsed by the page'); continue; }
    if (mine.type !== rule.type) differ.push(k + ' is ' + rule.type + ' in the builder and ' + mine.type + ' on the page');
    else if (rule.type === 'enum' && JSON.stringify([...rule.values].sort()) !== JSON.stringify([...mine.values].sort())) differ.push(k + ' offers ' + rule.values.join('/') + ', the page takes ' + mine.values.join('/'));
    else if (rule.type === 'int' && (rule.min !== mine.min || rule.max !== mine.max)) differ.push(k + ' runs ' + rule.min + ' to ' + rule.max + ' in the builder, ' + mine.min + ' to ' + mine.max + ' on the page');
    if (rule.default !== mine.default) differ.push(k + ' defaults to ' + rule.default + ' in the builder and ' + mine.default + ' on the page');
  }
  const unoffered = Object.keys(HUSH_SCHEMA).filter(k => k !== 'seed' && !entry.schema[k]);
  say(differ.length === 0 && unoffered.length === 0, 'every key the builder offers, the page parses with the same type, values or bounds, and default, and every key but the seed is offered'
    + (differ.length || unoffered.length ? ': ' + differ.concat(unoffered.map(k => k + ' is not offered')).join('; ') : ' (' + Object.keys(entry.schema).join(', ') + ')'));
  const lost = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    for (const v of valuesOf(rule)) {
      const q = buildQuery({ [k]: v }, entry.schema), back = parseConfig(q, HUSH_SCHEMA)[k];
      if (back !== v) lost.push(k + '=' + v + ' (the link "' + q + '" is read as ' + back + ')');
    }
  }
  say(lost.length === 0, 'a link for every value the builder offers reads back through the page\'s schema as that value' + (lost.length ? ': ' + lost.slice(0, 4).join(', ') : ''));
}
{
  const src = readFileSync(join(HUSH, 'main.js'), 'utf8');
  const imports = /import\s*\{[^}]*\bHUSH_SCHEMA\b[^}]*\}\s*from\s*['"]\.\/config\.js\?v=/.test(src);
  const parses = /parseConfig\(\s*location\.search\s*,\s*HUSH_SCHEMA\s*\)/.test(src);
  say(imports && parses, 'main.js imports HUSH_SCHEMA from ./config.js and hands it to parseConfig' + (imports ? '' : ' (it does not import it)') + (parses ? '' : ' (it parses something else)'));
}

/* what the page plays for a builder's link */
const s = await serve(join(MATH, '..'));
if (entry) {
  const defaults = {}, others = {};
  for (const [k, rule] of Object.entries(entry.schema)) {
    defaults[k] = rule.default;
    others[k] = rule.type === 'enum' ? rule.values.find(v => v !== rule.default) : rule.type === 'bool' ? !rule.default : (rule.default === rule.min ? rule.max : rule.min);
  }
  for (const [label, values] of [['the builder\'s defaults', defaults], ['other values', others]]) {
    const q = buildQuery(values, entry.schema);
    const opened = await open(s.base, Object.assign({}, SIZES[3], { path: '/hush/index.html' + (q ? q + '&' : '?'), ready: 'window.HUSH && window.HUSH.ready' }));
    const { page, errors } = opened;
    await sleep(150);
    const played = await page.evaluate(() => window.HUSH.config());
    const wrong = Object.keys(values).filter(k => !played || String(played[k]) !== String(values[k]));
    say(!!played && wrong.length === 0, 'HUSH plays what a link of ' + label + ' asked for (asked ' + JSON.stringify(values) + ', the page plays ' + JSON.stringify(played) + ')');
    /* a link naming a fork skips the picture fork; a link naming none shows it on a first visit (a fresh profile) */
    const named = values.fork === 'quick' || values.fork === 'careful';
    const forkShown = await page.evaluate(() => !document.getElementById('fork').hidden);
    if (!named) await page.evaluate(() => document.getElementById('fork-careful').click());
    await sleep(120);
    await page.evaluate(() => document.getElementById('start').click());
    await page.waitForFunction(() => window.HUSH.run().length > 0, { timeout: 15000, polling: 'raf' });
    const got = await page.evaluate(() => ({ fork: window.HUSH.fork(), run: window.HUSH.run(), length: window.HUSH.runLength() }));
    const fork = named ? values.fork : 'careful';
    const want = dealRun(rng(HUSH_SCHEMA.seed.default >>> 0), { n: Number(values.count), level: adaptAxes([], fork).ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
    const same = JSON.stringify(got.run) === JSON.stringify(want);
    say(forkShown === !named && got.fork === fork && got.length === Number(values.count) && same,
      label + ': the picture fork ' + (named ? 'skipped, the link naming ' + values.fork : 'shown, the link naming none') + ', the run ' + values.count + ' trials, and its order the one Node deals at the seed for that fork (' + JSON.stringify({ forkShown, fork: got.fork, length: got.length, same }) + ')');
    say(errors.length === 0, label + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
    await opened.browser.close();
  }
}
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
