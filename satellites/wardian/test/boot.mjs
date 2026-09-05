/* Wardian boots, draws a jar, and keeps drawing it. The jar is the whole game,
   so a boot gate that only asks for "no errors" is worth nothing here: this one
   asks the canvas whether there is a jar in the picture. */
import { serve, open, reporter, waitFrames, centre } from './harness.mjs';

const s = await serve();
const { browser, page, errors } = await open(s.base);
const { fails, say } = reporter();

const frames0 = await page.evaluate(() => WARDIAN_TEST.frames());
await waitFrames(page, 8);
say(await page.evaluate(() => WARDIAN_TEST.frames()) > frames0 + 5, 'the frame loop is running');

const st = await page.evaluate(() => {
  const g = WARDIAN_TEST.state();
  return { plants: g.plants.length, moss: g.moss.filter(Boolean).length, props: g.props.length,
    tick: g.tickN, hemi: g.hemi, spores: g.spores };
});
say(st.plants === 2, 'the jar starts with the two ferns the Jarwright left (' + st.plants + ')');
say(st.moss >= 2, 'and moss on the soil (' + st.moss + ' cells)');
say(st.props === 3, 'and three things to move about (' + st.props + ')');
say(st.hemi === 'north' || st.hemi === 'south', 'a hemisphere was guessed: ' + st.hemi);

/* the picture itself. ⛔ a fresh jar is two seedlings and two cushions of
   moss, so "is there green in it" is not a question you can ask at boot: the
   gate asks whether the picture FOLLOWS the jar, by growing it and looking
   again. A green test is not a look, but a canvas that never changes while the
   sim runs is exactly what this catches. */
/* ⛔ measure the JAR, not the canvas. The room is most of the picture and it
   darkens on its own, so a whole canvas average stays green while the jar
   itself glows brighter at midnight than at noon, which is the actual bug the
   first night shot caught. */
const measure = () => page.evaluate(() => {
  const cv = document.getElementById('jar');
  const c = cv.getContext('2d');
  const dpr = cv.width / cv.clientWidth;
  const a = WARDIAN_TEST.toScreen(6, 6), b = WARDIAN_TEST.toScreen(234, 190);
  const x0 = Math.round(a.x * dpr), y0 = Math.round(a.y * dpr);
  const w = Math.round((b.x - a.x) * dpr), h = Math.round((b.y - a.y) * dpr);
  const d = c.getImageData(x0, y0, w, h).data;
  let lit = 0, green = 0, sum = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 17) {
    const r = d[i], g = d[i + 1], bb = d[i + 2];
    n++; sum += r + g + bb;
    if (r + g + bb > 96) lit++;
    if (g > r + 10 && g > bb + 8 && g > 40) green++;
  }
  return { lit: lit / n, green: green / n, bright: sum / n / 3, w: cv.width, h: cv.height };
});
const fresh = await measure();
say(fresh.lit > 0.25, 'the canvas is not a black rectangle (' + (fresh.lit * 100).toFixed(0) + ' percent lit)');
say(fresh.w > 300 && fresh.h > 500, 'and it is the size of the screen (' + fresh.w + 'x' + fresh.h + ')');

await page.evaluate(() => WARDIAN_TEST.advance(900, 'daily'));
await waitFrames(page, 3);
const grown = await measure();
say(grown.green > fresh.green * 3 && grown.green > 0.010,
  'and six days of growth put a plant in the picture (' + (fresh.green * 100).toFixed(2)
  + ' to ' + (grown.green * 100).toFixed(2) + ' percent green)');
const segs = await page.evaluate(() => WARDIAN_TEST.state().plants.reduce((n, p) => n + p.segs.length, 0));
say(segs > 8, 'which is the jar the sim grew, not a picture of one (' + segs + ' segments)');

/* night is darker than noon, which the first build had backwards */
await page.evaluate(() => WARDIAN_TEST.setHour(13));
await waitFrames(page, 3);
const noon = await measure();
await page.evaluate(() => WARDIAN_TEST.setHour(23));
await waitFrames(page, 3);
const dark = await measure();
say(dark.bright < noon.bright * 0.86, 'and the inside of the jar at midnight is darker than at one ('
  + dark.bright.toFixed(0) + ' against ' + noon.bright.toFixed(0) + ' average brightness)');
await page.evaluate(() => WARDIAN_TEST.setHour(11));
await waitFrames(page, 2);

const day = await centre(page, '#chipDay');
say(!!day && day.h >= 48 && day.onTop, 'the day chip is a 48 px target a thumb can reach (' + (day ? day.h.toFixed(0) : 'missing') + ' px)');
const menu = await centre(page, '#btnMenu');
say(!!menu && menu.w >= 48 && menu.h >= 48 && menu.onTop, 'and so is the menu');
const photo = await centre(page, '#btnPhoto');
say(!!photo && photo.w >= 56 && photo.onTop, 'and the photo button is 56 px round');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' BOOT FAILURE(S)'); process.exit(1); }
console.log('\nBOOT OK');
