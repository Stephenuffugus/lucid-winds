/* The shots the plan asks for. Every one is taken from where the PLAYER stands:
   a 375x667 phone, the jar on screen, no debug camera.
   ⛔ a single shot filter must never skip the setup that makes the shot: the
   shutter is gated, the walk to the moment is not. */
import { serve, open, waitFrames, sleep } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../test/harness.mjs';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;

const s = await serve();
/* the player's own pixels: 375x667 at 1x keeps every shot under the 200 KB the
   plan allows for evidence, and it is what the thumb actually sees */
const { browser, page } = await open(s.base, { deviceScaleFactor: 1 });
const shot = async (name, el) => {
  const target = el ? await page.$(el) : page;
  const buf = await target.screenshot({ type: 'png' });
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + (buf.length / 1024).toFixed(0) + ' KB');
};

/* a jar with some age on it, so the shots are not two sprouts */
await page.evaluate(() => { WARDIAN_TEST.advance(1400); });
await waitFrames(page, 3);
await page.evaluate(() => { WARDIAN_TEST.setHour(11); });
await waitFrames(page, 3);
if (want('p1-jar-day')) await shot('p1-jar-day');

await page.evaluate(() => { WARDIAN_TEST.setHour(22); });
await waitFrames(page, 3);
if (want('p1-jar-night')) await shot('p1-jar-night');

/* the unfurl strip: six panels of ONE frond, ten ticks apart, in one image */
if (want('p1-unfurl')) {
  const panels = [];
  for (let i = 0; i < 6; i++) {
    await page.evaluate((c) => { WARDIAN_TEST.setHour(13); WARDIAN_TEST.setCurl(c); }, 1 - i * 0.2);
    await waitFrames(page, 2);
    panels.push(await page.screenshot({ type: 'png', encoding: 'base64' }));
  }
  const strip = await page.evaluate(async (panels) => {
    const imgs = await Promise.all(panels.map(b => new Promise(res => {
      const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + b;
    })));
    /* crop the frond, not the room: the top of the plants at 375 wide */
    const cw = 152, ch = 206, sx = 64, sy = 262, dpr = 1;
    const cv = document.createElement('canvas');
    cv.width = cw * 3; cv.height = ch * 2;
    const c = cv.getContext('2d');
    c.fillStyle = '#0d0a07'; c.fillRect(0, 0, cv.width, cv.height);
    imgs.forEach((im, i) => {
      const dx = (i % 3) * cw, dy = Math.floor(i / 3) * ch;
      c.drawImage(im, sx * dpr, sy * dpr, cw * dpr, ch * dpr, dx, dy, cw, ch);
      c.strokeStyle = 'rgba(201,162,75,.35)'; c.strokeRect(dx + .5, dy + .5, cw - 1, ch - 1);
      c.fillStyle = '#C9A24B'; c.font = '11px monospace';
      c.fillText('curl ' + (1 - i * 0.2).toFixed(1), dx + 9, dy + 17);
    });
    return cv.toDataURL('image/png').split(',')[1];
  }, panels);
  writeFileSync(join(OUT, 'p1-unfurl.png'), Buffer.from(strip, 'base64'));
  console.log('  p1-unfurl.png  ' + (Buffer.from(strip, 'base64').length / 1024).toFixed(0) + ' KB');
}

await browser.close(); s.close();
console.log('shots done');
