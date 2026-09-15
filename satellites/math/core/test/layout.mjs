#!/usr/bin/env node
/* CORE's shell and settings, at the catalog's four sizes (CATALOG-PLAN D4):
 * 320x568, 375x667 and 412x915 by thumb, 1366x768 by keyboard with no touch.
 *
 *   node test/layout.mjs
 *
 * Asserted, each watched to fail on a planted fault (plans/math/HANDOFF-CORE.md section 13):
 *   - the page never scrolls sideways
 *   - numerals are tabular and lining, read from the computed style (2.1)
 *   - a first load is muted (G12), in the store AND on the Sound switch
 *   - every control in the settings panel is a 48 px target a thumb lands on,
 *     measured with elementFromPoint, and no text in it is under 0.7 rem
 *   - by keyboard: Tab reaches the gear with a visible focus ring, Enter opens,
 *     focus lands on the first switch, Space flips it, Escape closes and gives
 *     focus back (G11)
 *   - a setting changed through its switch survives a RELOAD (the gate never
 *     writes the store; it presses the control and reloads into the result)
 *   - clearing the game empties every lw:demo: key
 *   - Less motion puts its class on the root, and takes it off again
 *   - a second tab hears a change made in the first (the storage event)
 *   - nothing is fetched after load (G2), and nothing lands on the console
 */
import { serve, open, launch, reporter, centre, tap, SIZES, sleep } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

const switchState = (page, key) => page.evaluate(k => {
  const b = document.querySelector('.lw-settings [data-key="' + k + '"]');
  return b ? b.getAttribute('aria-checked') : null;
}, key);
const stored = (page) => page.evaluate(() => CORE_DEMO.store.load(CORE_DEMO.gameId, CORE_DEMO.schema).settings);
const focusOn = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { cls: '', key: '', outline: 'none', width: 0 };
  const cs = getComputedStyle(a);
  return { cls: String(a.className), key: a.dataset ? a.dataset.key || '' : '', outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
});
async function tabTo(page, cls, max = 14) {
  for (let i = 0; i < max; i++) {
    const f = await focusOn(page);
    if (f.cls.indexOf(cls) >= 0) return f;
    await page.keyboard.press('Tab');
  }
  return focusOn(page);
}
async function openPanel(page, size) {
  if (size.touch) await tap(page, '.lw-settings-open');
  else { await tabTo(page, 'lw-settings-open'); await page.keyboard.press('Enter'); }
  await sleep(120);
}

for (const size of SIZES) {
  const at = size.name;
  const { browser, page, errors, requests } = await open(s.base, size);

  /* ⛔ against the width the gate ASKED for, never innerWidth: on a mobile viewport a page wider than the phone
     widens the layout viewport with it, innerWidth follows, and the first version of this law stayed green with the
     body planted 700 px wide on a 320 px phone */
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');

  const nums = await page.evaluate(() => [document.body, document.getElementById('sample')]
    .map(el => getComputedStyle(el).fontVariantNumeric));
  say(nums.every(v => /tabular-nums/.test(v) && /lining-nums/.test(v)),
    at + ' numerals are tabular and lining (' + nums.join(' | ') + ')');

  say((await stored(page)).muted === true, at + ' a first load is muted in the store (G12)');

  if (size.touch) {
    const b = await centre(page, '.lw-settings-open');
    say(!!b && b.w >= 48 && b.h >= 48 && b.onTop, at + ' the settings gear is a 48 px target a thumb lands on ('
      + (b ? Math.round(b.w) + 'x' + Math.round(b.h) + (b.onTop ? '' : ', COVERED') : 'missing') + ')');
  } else {
    const f = await tabTo(page, 'lw-settings-open');
    say(f.cls.indexOf('lw-settings-open') >= 0 && f.outline !== 'none' && f.width >= 2,
      at + ' Tab reaches the gear with a visible focus ring (' + f.outline + ' ' + f.width + ' px)');
  }
  await openPanel(page, size);

  const panel = await page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('.lw-settings button')) {
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const fonts = [b].concat(Array.from(b.querySelectorAll('*'))).map(e => parseFloat(getComputedStyle(e).fontSize));
      out.push({ name: b.dataset.key || b.className, w: r.width, h: r.height,
        onTop: !!top && (top === b || b.contains(top)), font: Math.min.apply(null, fonts) });
    }
    return { open: !document.querySelector('.lw-settings').hidden, out };
  });
  say(panel.open && panel.out.length >= 6, at + ' the panel opens with its controls (' + panel.out.length + ')');
  const bad = panel.out.filter(b => b.w < 48 || b.h < 48 || !b.onTop);
  say(bad.length === 0, at + ' every control in it is a 48 px target a thumb lands on'
    + (bad.length ? ': ' + bad.map(b => b.name + ' ' + Math.round(b.w) + 'x' + Math.round(b.h) + (b.onTop ? '' : ' COVERED')).join(', ') : ''));
  const minFont = Math.min.apply(null, panel.out.map(b => b.font));
  say(minFont >= 11.2, at + ' and nothing in it is under 0.7 rem (' + minFont.toFixed(1) + ' px)');
  say(await switchState(page, 'muted') === 'false', at + ' and Sound reads Off on a first load');

  if (size.touch) {
    await tap(page, '.lw-settings [data-key="muted"]');
  } else {
    const f = await focusOn(page);
    say(f.key === 'muted', at + ' opening the panel by keyboard puts focus on its first switch (' + (f.key || f.cls || 'nothing') + ')');
    await page.keyboard.press('Space');
  }
  await sleep(120);
  say((await stored(page)).muted === false, at + ' turning Sound on through its switch writes it to the store');
  /* ⛔ counted after a QUIET WINDOW, not the instant the controls answer: the first version read the request log
     about 0.4 s after load, and a fetch planted every 400 ms had not fired yet, so the law stayed green over it.
     The bound is stated: nothing is fetched through a round of the settings and 1.5 s of idle after it. */
  await sleep(1500);
  const fetched = requests.length;
  say(fetched === 0, at + ' nothing was fetched after load, through the settings and 1.5 s of idle (G2)'
    + (fetched ? ': ' + fetched + ', ' + requests.slice(0, 2).join(', ') : ''));

  if (!size.touch) {
    await page.keyboard.press('Escape');
    await sleep(100);
    const back = await page.evaluate(() => ({ hidden: document.querySelector('.lw-settings').hidden,
      cls: document.activeElement ? String(document.activeElement.className) : '' }));
    say(back.hidden && back.cls.indexOf('lw-settings-open') >= 0, at + ' Escape closes the panel and gives focus back to the gear');
  }

  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction('window.CORE_DEMO && window.CORE_DEMO.ready', { timeout: 30000 });
  await openPanel(page, size);
  say(await switchState(page, 'muted') === 'true', at + ' and after a reload Sound still reads On');

  if (size.touch) {
    await tap(page, '.lw-settings [data-key="reducedMotion"]');
    await sleep(80);
    const onCls = await page.evaluate(() => document.documentElement.classList.contains('lw-reduced-motion'));
    await tap(page, '.lw-settings [data-key="reducedMotion"]');
    await sleep(80);
    const offCls = await page.evaluate(() => document.documentElement.classList.contains('lw-reduced-motion'));
    say(onCls && !offCls, at + ' Less motion puts its class on the root and takes it off again');
    await tap(page, '.lw-clear');
    await sleep(60);
    await tap(page, '.lw-clear');
  } else {
    await tabTo(page, 'lw-clear');
    await page.keyboard.press('Enter');
    await sleep(60);
    await page.keyboard.press('Enter');
  }
  await sleep(120);
  const left = await page.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('lw:demo:') === 0).length);
  say(left === 0, at + ' clearing the game empties everything it saved (' + left + ' keys left)');

  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* two tabs of the same game in one browser */
{
  const browser = await launch();
  const A = await open(s.base, Object.assign({}, SIZES[1], { browser }));
  const B = await open(s.base, Object.assign({}, SIZES[1], { browser }));
  await openPanel(A.page, SIZES[1]);
  await tap(A.page, '.lw-settings [data-key="reducedMotion"]');
  await sleep(400);
  const heard = await B.page.evaluate(() => document.documentElement.classList.contains('lw-reduced-motion'));
  say(heard, 'a second tab hears Less motion turned on in the first and applies it');
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
