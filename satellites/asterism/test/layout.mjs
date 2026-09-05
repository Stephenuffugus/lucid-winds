#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * 48 px RENDERED and reachable: the rectangle AND document.elementFromPoint at
 * its centre landing on it. el.click() proves nothing and is not used here.
 * It also holds the seat: the bottom left 120 by 120 of the sky belongs to the
 * fleet's music chip and its folded pill.
 */
import { serve, open, reporter, tap, centre, tapAt, sleep, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [{ width: 375, height: 667 }, { width: 320, height: 568 }, { width: 412, height: 915 }];

for (const size of SIZES) {
  const tag = size.width + 'x' + size.height;
  const { browser, page, errors } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);
  await dev(() => localStorage.setItem('lw_asterism_v1',
    JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 0 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
  await waitFrames(page, 5);

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') : 'MISSING'));
  }

  /* the first ever boot: the three lines, then the sky */
  await check('#btnHowOk', 'GOT IT on the first boot');
  await tap(page, '#btnHowOk');
  await sleep(200);
  await check('#chipPlace', 'the place and time chip');
  await check('#btnMenu', 'the menu');
  await check('#btnDraw', 'DRAW', 56);

  /* the seat, measured by RECTANGLE: the sky chrome is pointer-events none, so
     elementFromPoint would happily report an empty corner that is full */
  const intruders = await dev(() => {
    const H = window.innerHeight, BOX = { l: 0, t: H - 120, r: 120, b: H };
    const skip = ['app', 'sky', 'chrome', 'toast', 'testPanel', 'starLabel'];
    const bad = [];
    document.querySelectorAll('#app *').forEach(el => {
      if (skip.indexOf(el.id) >= 0) return;
      if (el.classList.contains('screen') || el.classList.contains('sheet')) return;
      if (el.closest('.screen') || el.closest('.sheet')) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (el.hidden || (el.closest('[hidden]'))) return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.right <= BOX.l || r.left >= BOX.r || r.bottom <= BOX.t || r.top >= BOX.b) return;
      bad.push((el.id || el.className || el.tagName) + ' at ' + r.left.toFixed(0) + ',' + r.top.toFixed(0));
    });
    return Array.from(new Set(bad));
  });
  say(intruders.length === 0, tag + '  the bottom left 120 by 120 is free for the music pill' + (intruders.length ? ': ' + intruders.join(', ') : ''));

  /* the menu and everything it opens */
  await tap(page, '#btnMenu'); await sleep(200);
  for (const [sel, nm] of [['#btnAlmanac', 'ALMANAC'], ['#btnBirth', 'BIRTH SKY'],
    ['#btnPromptShow', 'PROMPT'], ['#btnSettings', 'SETTINGS'], ['#btnAbout', 'ABOUT'], ['#btnMenuClose', 'CLOSE']]) {
    await check(sel, nm);
  }
  await tap(page, '#btnAbout'); await sleep(200);
  await check('#btnAboutBack', 'BACK on About');
  const credit = await dev(() => document.getElementById('hygCredit').textContent);
  say(/HYG/.test(credit) && /CC BY/.test(credit), tag + '  the About sheet carries the HYG credit');
  await tap(page, '#btnAboutBack'); await sleep(200);

  await tap(page, '#btnMenu'); await sleep(150);
  await tap(page, '#btnSettings'); await sleep(200);
  for (const [sel, nm] of [['#btnSound', 'SOUND'], ['#btnTwinkle', 'TWINKLE'], ['#btnMotion', 'MOTION'],
    ['#btnExportAlm', 'COPY ALMANAC'], ['#btnImportAlm', 'BRING IT IN'], ['#btnSettingsClose', 'CLOSE settings']]) {
    await check(sel, nm);
  }
  await tap(page, '#btnSettingsClose'); await sleep(200);

  await tap(page, '#chipPlace'); await sleep(250);
  for (const [sel, nm] of [['#btnModeTonight', 'TONIGHT'], ['#btnModeBirth', 'A DATE'],
    ['#citySearch', 'the city search box'], ['#latField', 'latitude'], ['#lonField', 'longitude'],
    ['#btnGeo', 'USE MY LOCATION'], ['#btnPlaceGo', 'GO'], ['#btnPlaceClose', 'CLOSE place']]) {
    await check(sel, nm);
  }
  const firstCity = await centre(page, '#cityList button');
  say(!!firstCity && firstCity.h >= 48 && firstCity.onTop, tag + '  a city in the list is ' + (firstCity ? firstCity.h.toFixed(0) : '0') + ' px tall and reachable');
  await tap(page, '#btnPlaceClose'); await sleep(200);

  /* draw one, so the name, myth, almanac, spread and poster screens exist */
  const v = await dev(() => window.ASTERISM_DEV.screenOfHip(91262));
  const d = await dev(() => window.ASTERISM_DEV.screenOfHip(102098));
  if (v && d) {
    await tapAt(page, v.x, v.y); await waitFrames(page, 2);
    await check('#btnUndo', 'UNDO while drawing');
    await tapAt(page, d.x, d.y); await waitFrames(page, 2);
    await tap(page, '#btnDraw'); await sleep(250);
    for (const [sel, nm] of [['#nameField', 'the name field'], ['#btnDice', 'ROLL A NAME'],
      ['#btnNameCancel', 'BACK on the name sheet'], ['#btnNameSave', 'SAVE IT']]) await check(sel, nm);
    await tap(page, '#btnNameSave');
    await page.waitForFunction(() => !window.ASTERISM_DEV.typing() && (window.ASTERISM_DEV.myth() || '').length > 40, { timeout: 30000 }).catch(() => {});
    for (const [sel, nm] of [['#btnAnother', 'ANOTHER'], ['#btnMythShare', 'SHARE the myth'], ['#btnMythKeep', 'KEEP IT']]) await check(sel, nm);
    await tap(page, '#btnMythKeep'); await sleep(300);
    await tap(page, '#btnMenu'); await sleep(150);
    await tap(page, '#btnAlmanac'); await sleep(300);
    const card = await centre(page, '.card');
    say(!!card && card.h >= 48 && card.onTop, tag + '  an almanac spread card is ' + (card ? card.h.toFixed(0) : '0') + ' px tall and reachable');
    await check('#btnAlmBack', 'BACK on the almanac');
    await tap(page, '.card'); await sleep(300);
    for (const [sel, nm] of [['#btnShowSky', 'SHOW ON SKY'], ['#btnPoster', 'MAKE A POSTER'],
      ['#btnShare', 'SHARE A LINK'], ['#btnDelete', 'DELETE'], ['#btnSpreadBack', 'BACK on the spread']]) await check(sel, nm);
    await tap(page, '#btnPoster'); await sleep(350);
    for (const [sel, nm] of [['#btnLayChart', 'CHART'], ['#btnLayMin', 'MINIMAL'],
      ['#btnLayPlate', 'PLATE'], ['#btnExport', 'EXPORT'], ['#btnPosterBack', 'BACK on the poster']]) await check(sel, nm);
  } else {
    say(false, tag + '  Vega and Deneb are on the screen so the rest of the screens can be reached');
  }

  const wide = await dev(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  say(!wide, tag + '  nothing pushes the page sideways');
  say(errors.length === 0, tag + '  nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}
close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
