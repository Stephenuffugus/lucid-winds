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

/* the picture itself. Sample the canvas: a jar has a lit middle and dark edges,
   and there is green in it. ⛔ a green test is not a look, but a black canvas
   that passes every other gate is exactly what this catches. */
const pic = await page.evaluate(() => {
  const cv = document.getElementById('jar');
  const c = cv.getContext('2d');
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, green = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 37) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    n++;
    if (r + g + b > 96) lit++;
    if (g > r + 12 && g > b + 12 && g > 46) green++;
  }
  return { lit: lit / n, green: green / n, w: cv.width, h: cv.height };
});
say(pic.lit > 0.25, 'the canvas is not a black rectangle (' + (pic.lit * 100).toFixed(0) + ' percent lit)');
say(pic.green > 0.004, 'and there is something growing in it (' + (pic.green * 100).toFixed(2) + ' percent green)');

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
