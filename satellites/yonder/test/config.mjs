#!/usr/bin/env node
/* YONDER's teacher's links (plans/yonder/HANDOFF-YONDER.md P3; the shape of satellites/span/test/config.mjs). The builder at
 * satellites/math/config registers YONDER with the SAME schema the page parses (satellites/yonder/config.js), so a link made
 * there asks only for what the page will play.
 *
 *   node test/config.mjs          (in the foreground, under the gate lock: its last part opens the page)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the builder has an entry for YONDER going to ../yonder/
 *   2. every key the builder offers, the page parses with the same type, the same values or bounds, and the same default;
 *      the seed is the page's own and never offered (SPAN's shape)
 *   3. a link for every value the builder can offer reads back through the page's schema as exactly that value
 *   4. main.js imports YONDER_SCHEMA from ./config.js and hands it to parseConfig
 *   5. in a browser: a link of the builder's defaults and a link of other values play the road, the mode and the run
 *      length the link asked for
 */
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { parseConfig, buildQuery } from '../../math/core/pure.js';
import { GAMES } from '../../math/config/schemas.js';
import { YONDER_SCHEMA } from '../config.js';

const YONDER = join(MATH, '..', 'yonder');
const { fails, say } = reporter();
const valuesOf = rule => rule.type === 'enum' ? rule.values : rule.type === 'bool' ? [true, false]
  : Array.from(new Set([rule.min, Math.round((rule.min + rule.max) / 2), rule.max, rule.default]));

const entry = GAMES.yonder;
say(!!entry && entry.path === '../yonder/', 'the builder has an entry for YONDER going to ../yonder/' + (entry ? ' (' + entry.path + ')' : ' (none)'));
if (entry) {
  const differ = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    const mine = YONDER_SCHEMA[k];
    if (!mine) { differ.push(k + ' is not parsed by the page'); continue; }
    if (mine.type !== rule.type) differ.push(k + ' is ' + rule.type + ' in the builder and ' + mine.type + ' on the page');
    else if (rule.type === 'enum' && JSON.stringify([...rule.values].sort()) !== JSON.stringify([...mine.values].sort())) differ.push(k + ' offers ' + rule.values.join('/') + ', the page takes ' + mine.values.join('/'));
    else if (rule.type === 'int' && (rule.min !== mine.min || rule.max !== mine.max)) differ.push(k + ' runs ' + rule.min + ' to ' + rule.max + ' in the builder, ' + mine.min + ' to ' + mine.max + ' on the page');
    if (rule.default !== mine.default) differ.push(k + ' defaults to ' + rule.default + ' in the builder and ' + mine.default + ' on the page');
  }
  const unoffered = Object.keys(YONDER_SCHEMA).filter(k => k !== 'seed' && !entry.schema[k]);
  say(differ.length === 0 && unoffered.length === 0, 'every key the builder offers, the page parses with the same type, values or bounds, and default, and every key but the seed is offered'
    + (differ.length || unoffered.length ? ': ' + differ.concat(unoffered.map(k => k + ' is not offered')).join('; ') : ' (' + Object.keys(entry.schema).join(', ') + ')'));
  const lost = [];
  for (const [k, rule] of Object.entries(entry.schema)) {
    for (const v of valuesOf(rule)) {
      const q = buildQuery({ [k]: v }, entry.schema), back = parseConfig(q, YONDER_SCHEMA)[k];
      if (back !== v) lost.push(k + '=' + v + ' (the link "' + q + '" is read as ' + back + ')');
    }
  }
  say(lost.length === 0, 'a link for every value the builder offers reads back through the page\'s schema as that value' + (lost.length ? ': ' + lost.slice(0, 4).join(', ') : ''));
}
{
  const src = readFileSync(join(YONDER, 'main.js'), 'utf8');
  const imports = /import\s*\{[^}]*\bYONDER_SCHEMA\b[^}]*\}\s*from\s*['"]\.\/config\.js\?v=/.test(src);
  const parses = /parseConfig\(\s*location\.search\s*,\s*YONDER_SCHEMA\s*\)/.test(src);
  say(imports && parses, 'main.js imports YONDER_SCHEMA from ./config.js and hands it to parseConfig' + (imports ? '' : ' (it does not import it)') + (parses ? '' : ' (it parses something else)'));
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
    const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/yonder/index.html' + (q ? q + '&' : '?'), ready: 'window.YONDER && window.YONDER.ready' }));
    await sleep(150);
    const played = await opened.page.evaluate(() => window.YONDER.config());
    const wrong = Object.keys(values).filter(k => !played || String(played[k]) !== String(values[k]));
    say(!!played && wrong.length === 0, 'YONDER plays what a link of ' + label + ' asked for (asked ' + JSON.stringify(values) + ', the page plays ' + JSON.stringify(played) + ')');
    say(opened.errors.length === 0, label + ': nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
    await opened.browser.close();
  }
}
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
