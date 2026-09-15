#!/usr/bin/env node
/* CORE's shots, from where a child and a teacher stand: the demo round at a phone
 * width by thumb, at 320, and at the Chromebook by keyboard, and the settings.
 *
 *   node tools/shots.mjs            every shot
 *   node tools/shots.mjs p2-reveal  only names containing that
 *
 * A shot is opened with the Read tool and three faults are named before the
 * change it shows is called done (CLAUDE.md, LOOKING IS PART OF THE JOB). Every
 * file must stay under 200 KB; the tool says so when one does not.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, SIZES, CORE, sleep } from '../test/harness.mjs';

const OUT = join(CORE, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};

const s = await serve();

/* press the stone and move it toward x; `release` false leaves the thumb down */
async function drag(page, x, release = true) {
  await page.evaluate((x, release) => {
    const stone = document.querySelector('#stage .lw-stone'), st = document.getElementById('stage');
    const sr = stone.getBoundingClientRect(), b = st.getBoundingClientRect();
    const sx = sr.left + sr.width / 2, sy = sr.top + sr.height / 2, tx = b.left + CORE_DEMO.pixelFor(x), ty = sy + 30;
    const fire = (type, cx, cy) => stone.dispatchEvent(new PointerEvent(type,
      { pointerId: 41, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: cx, clientY: cy }));
    fire('pointerdown', sx, sy);
    for (let i = 1; i <= 6; i++) fire('pointermove', sx + (tx - sx) * i / 6, sy + (ty - sy) * i / 6);
    if (release) fire('pointerup', tx, ty);
  }, x, release);
}
const done = page => page.waitForFunction(() => CORE_DEMO.revealDone(), { timeout: 30000 });
const away = page => page.evaluate(() => { const v = CORE_DEMO.round().value; return v > 0.5 ? 0.12 : 0.88; });

if (want('p2-') || want('p1-settings')) {
  const { browser, page } = await open(s.base, SIZES[1]);
  if (want('p2-drag-375')) {
    await drag(page, await away(page), false);
    await sleep(200);
    save('p2-drag-375', await page.screenshot({ type: 'png' }));
    await page.evaluate(() => {
      const stone = document.querySelector('#stage .lw-stone'), r = stone.getBoundingClientRect();
      stone.dispatchEvent(new PointerEvent('pointerup', { pointerId: 41, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: r.left + r.width / 2, clientY: r.top }));
    });
  } else {
    await drag(page, await away(page));
  }
  await done(page);
  if (want('p2-reveal-wrong-375')) save('p2-reveal-wrong-375', await page.screenshot({ type: 'png' }));
  await page.evaluate(() => CORE_DEMO.next());
  await sleep(150);
  const nearX = await page.evaluate(() => { const R = CORE_DEMO.round(); return Math.min(1, Math.max(0, R.value + (R.value > 0.5 ? -1 : 1) * R.tolerance * 0.6)); });
  await drag(page, nearX);
  await done(page);
  if (want('p2-reveal-near-375')) save('p2-reveal-near-375', await page.screenshot({ type: 'png' }));
  if (want('p1-settings-375')) {
    await page.evaluate(() => document.querySelector('.lw-settings-open').click());
    await sleep(200);
    save('p1-settings-375', await page.screenshot({ type: 'png' }));
  }
  await browser.close();
}

if (want('p2-reveal-320')) {
  const { browser, page } = await open(s.base, SIZES[0]);
  /* an answer at an end of the line, so the caption has to stay on the screen */
  const truth = await page.evaluate(() => CORE_DEMO.round().value);
  await drag(page, truth > 0.5 ? 0 : 1);
  await done(page);
  save('p2-reveal-320', await page.screenshot({ type: 'png' }));
  await browser.close();
}

if (want('p2-reveal-1366')) {
  const { browser, page } = await open(s.base, SIZES[3]);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement.classList.contains('lw-stone'))) break;
  }
  for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowRight');
  save('p2-keyboard-1366', await page.screenshot({ type: 'png' }));
  await page.keyboard.press('Enter');
  await done(page);
  save('p2-reveal-1366', await page.screenshot({ type: 'png' }));
  await browser.close();
}

s.close();
console.log('shots done');
