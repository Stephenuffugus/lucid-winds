#!/usr/bin/env node
/* THE TEACHER'S LINK BUILDER (00-CORE-handoff 2.9; plans/math/HANDOFF-CORE.md P3 step 3).
 *
 *   node test/config.mjs
 *
 * One page at satellites/math/config/ builds a bookmarkable link for any game from the URL
 * schema that game registers, so a teacher can set up practice without any login. The link
 * is only worth something if the game reads back exactly what the teacher chose, so the
 * round trip is asserted through the SAME parseConfig the games call.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the page lists every registered game, with one control per schema key of the right
 *      kind (a choice for an enum or a bool, a number with its bounds for an int)
 *   2. every control is a 48 px target a thumb lands on, at 320, 375 and 412, and nothing
 *      in the form is under 0.7 rem
 *   3. values chosen through the controls give a link that parseConfig reads back as exactly
 *      those values, for every game, and the link goes to that game's folder
 *   4. a number typed outside its bounds never reaches the link
 *   5. at 1366x768 with no touch, the link can be changed by keys alone, with a focus ring
 *   6. nothing is fetched after load, nothing lands on the console, the page does not scroll
 *      sideways
 */
import { serve, open, reporter, centre, SIZES, sleep } from './harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from './shared.mjs';
import { parseConfig } from '../pure.js';

const s = await serve();
const { fails, say } = reporter();
const PAGE = { path: '/config/index.html', ready: 'window.CONFIG_PAGE && window.CONFIG_PAGE.ready' };

/* ⛔ replace what a number field holds, the way a person does: focus it, select all, type, move on. The first version
   triple clicked, which on this touch viewport focused the field and selected nothing, so typing 40 into a field holding
   10 made 1040; the builder rightly refused it, and six laws went red on the gate's own typing (a probe read the value). */
async function typeInto(page, sel, text) {
  await page.click(sel);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.type(text);
  await page.keyboard.press('Tab');
}

for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;

  const games = await page.evaluate(() => Object.keys(CONFIG_PAGE.games));
  const listed = await page.evaluate(() => Array.from(document.querySelectorAll('#game option')).map(o => o.value));
  say(games.length >= 2 && JSON.stringify(listed) === JSON.stringify(games),
    at + ' the page lists every registered game (' + listed.join(', ') + ')');

  for (const id of games) {
    await page.select('#game', id);
    await sleep(80);
    const game = await page.evaluate(g => CONFIG_PAGE.games[g], id);
    const keys = Object.keys(game.schema);

    const kinds = await page.evaluate(() => Array.from(document.querySelectorAll('#fields [data-key]')).map(el => ({
      key: el.dataset.key, tag: el.tagName, type: el.type, min: el.min, max: el.max,
      options: el.tagName === 'SELECT' ? Array.from(el.options).map(o => o.value) : null
    })));
    const wrong = keys.filter(k => {
      const rule = game.schema[k], c = kinds.find(x => x.key === k);
      if (!c) return true;
      if (rule.type === 'enum') return c.tag !== 'SELECT' || JSON.stringify(c.options) !== JSON.stringify(rule.values);
      if (rule.type === 'bool') return c.tag !== 'SELECT' || JSON.stringify(c.options) !== JSON.stringify(['1', '0']);
      return c.tag !== 'INPUT' || c.type !== 'number' || Number(c.min) !== rule.min || Number(c.max) !== rule.max;
    });
    say(kinds.length === keys.length && wrong.length === 0, at + ' ' + id + ' has one control of the right kind per key'
      + (wrong.length ? ': wrong for ' + wrong.join(', ') : ' (' + keys.join(', ') + ')'));

    const targets = ['#game'].concat(keys.map(k => '#fields [data-key="' + k + '"]'), ['#link', '#open']);
    const small = [];
    for (const sel of targets) {
      const r = await centre(page, sel);
      if (!r || r.h < 48 || r.w < 48 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
    }
    say(small.length === 0, at + ' ' + id + ' every control is a 48 px target a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));

    /* choose a value other than the default for every key, through the controls */
    const chosen = {};
    for (const k of keys) {
      const rule = game.schema[k], sel = '#fields [data-key="' + k + '"]';
      if (rule.type === 'enum') { chosen[k] = rule.values.find(v => v !== rule.default); await page.select(sel, chosen[k]); }
      else if (rule.type === 'bool') { chosen[k] = !rule.default; await page.select(sel, chosen[k] ? '1' : '0'); }
      else {
        chosen[k] = rule.default === rule.max ? rule.min : rule.max;
        await typeInto(page, sel, String(chosen[k]));
      }
      await sleep(40);
    }
    const link = await page.$eval('#link', el => el.value);
    const url = new URL(link, s.base + PAGE.path);
    const back = parseConfig(url.search, game.schema);
    say(JSON.stringify(back) === JSON.stringify(Object.assign({}, back, chosen)) && Object.keys(chosen).every(k => back[k] === chosen[k]),
      at + ' ' + id + ' the link reads back as exactly what was chosen (' + url.search + ' gives ' + JSON.stringify(back) + ')');
    say(url.pathname.replace(/\/index\.html$/, '/').endsWith(game.path.replace(/^\.\.\//, '/').replace(/^\.\//, '/')),
      at + ' ' + id + ' and goes to the game (' + url.pathname + ')');

    const ints = keys.filter(k => game.schema[k].type === 'int');
    if (ints.length) {
      const k = ints[0], rule = game.schema[k];
      await typeInto(page, '#fields [data-key="' + k + '"]', String(rule.max + 50));
      await sleep(60);
      const out = parseConfig(new URL(await page.$eval('#link', el => el.value), s.base + PAGE.path).search, game.schema)[k];
      const carried = new URL(await page.$eval('#link', el => el.value), s.base + PAGE.path).searchParams.get(k);
      say(carried === null || Number(carried) <= rule.max, at + ' ' + id + ' a number typed past its bounds never reaches the link ('
        + k + '=' + carried + ', read back as ' + out + ')');
    }
  }

  const minFont = await page.evaluate(() => Math.min(...Array.from(document.querySelectorAll('main *'))
    .filter(e => e.childNodes.length && Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim()))
    .map(e => parseFloat(getComputedStyle(e).fontSize))));
  say(minFont >= 11.2, at + ' nothing in the form is under 0.7 rem (' + minFont.toFixed(1) + ' px)');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* the Chromebook, by keys alone */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  await opened.page.evaluate(() => { window.__first = document.getElementById('link').value; });
  const kb = await assertKeyboardCompletable(opened.page,
    [{ key: 'Tab', until: '#game' }, 'ArrowDown', { key: 'Tab', until: '#fields [data-key]' }, 'ArrowDown'],
    () => document.getElementById('link').value !== window.__first);
  say(kb.ok, '1366x768 keyboard the link can be changed by keys alone (' + kb.detail + ')');
  say(opened.errors.length === 0, '1366x768 keyboard nothing landed on the console' + (opened.errors.length ? ': ' + opened.errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' CONFIG FAILURE(S)'); process.exit(1); }
console.log('CONFIG OK');
