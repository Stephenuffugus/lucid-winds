#!/usr/bin/env node
/* The arcade tile, shot from the REAL running game, square, under the 150 KB
 * the portal grid needs when it loads a hundred of them at once.
 *
 *   node tools/thumb.mjs
 *
 * It walks into a cave with real taps, throws three stones so the tile shows a
 * cave rather than one wall, hides the HUD so the tile reads as art rather than
 * as a screenshot of a UI, and shoots. If it lands over the limit it recaptures
 * smaller rather than shipping a heavy tile.
 *
 * IT SHOOTS THE DEEP, not cave one. Cave one opens in a hand drawn rectangle,
 * and a rectangle photographed square is a rectangle: the first tile read as a
 * technical diagram with a hoop in it. A generated cave has irregular walls and
 * looks like the game. The save is seeded so the deep is open, which is the one
 * liberty a camera may take and a gate may not.
 *
 * Fable moves the result to portal-assets/thumbs/fathom.png in the morning.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, tap, tapAt, ROOT , waitFrames} from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024;
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size });
  await page.evaluate(() => localStorage.setItem('lw_fathom_v1',
    JSON.stringify({ v: 1, stars: [3, 3, 3, 0, 0], bestDepth: 4, sound: 1, motion: 1, seen: { how: 1 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.FATHOM_DEV && window.FATHOM_DEV.frames() > 2, { timeout: 30000 });
  await tap(page, '#btnDeep');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
  await waitFrames(page, 6);
  /* TWO stones, and the second thrown while the first ring is still ALIVE.
     ⛔ The version before this waited for the first ring to reach 250 and then
     for a second ring to exist; by then the first had expired at its maximum
     radius, the wait timed out after forty seconds, every wall had faded, and
     the tool wrote a completely black tile and printed THUMB OK. Nothing
     checked the picture. That is why shotLit exists below. */
  async function throwAt(dx, dy) {
    const at = await page.evaluate((dx, dy) => {
      const p = window.FATHOM_DEV.player(), s = window.FATHOM_DEV.screenOf(p.x, p.y);
      let y = s.y + dy; if (y < 30) y = s.y + Math.abs(dy);
      return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x + dx)), y: Math.max(30, Math.min(window.innerHeight - 60, y)) };
    }, dx, dy);
    await tapAt(page, at.x, at.y);
  }
  const ringAt = (n, r) => page.waitForFunction((n, r) => {
    const s = window.FATHOM_DEV.state();
    return s.ripples.length >= n && s.ripples[n - 1][2] > r;
  }, { timeout: 25000 }, n, r).then(() => true).catch(() => false);

  /* ⛔ SEVEN STONES, IN A FAN, AND THE FILE USED TO SAY THE HAND CANNOT DO IT.
     "The hand does not carry four" was written here on Sep 07 and it is wrong:
     the hand carries EIGHT. The four stone attempt failed for the reason the
     same paragraph gives second, that its `ringAt` waits timed out and the early
     rings expired before the shutter, and the wrong half of that sentence then
     stood as a reason not to try again. There are no waits here at all now, only
     frames, so nothing can time out.
     ⛔ AND WHERE YOU STAND IS NOT THE LEVER. Seven places along the cave's own
     route were measured with the same two stones and the same camera: 4.43,
     4.39, 4.39, 4.39 percent. A room and a corridor light the same handful of
     segments. What changes the picture is how many stones are in the air.
     THE NUMBERS, same seed, same camera: two stones lit 13 wall segments and
     4.1 percent of the tile; seven light 29 and 7.0. */
  const FAN = [[0, -140], [110, -90], [140, 10], [80, 110], [-80, 110], [-140, 10], [-110, -90]];
  /* ONE STONE FIRST, and its wall count kept. This is what the tile is measured
     against below: a picture of this cave lit by a single throw. A floor typed in
     as a number would pass a build that lit nothing new, because the number would
     have been read off the day it was written. */
  await throwAt(0, -130);
  await waitFrames(page, 26);
  const walls1 = await page.evaluate(() => window.FATHOM_DEV.litWalls());
  for (const f of FAN) { await throwAt(f[0], f[1]); await waitFrames(page, 11); }
  await waitFrames(page, 10);
  const wallsN = await page.evaluate(() => window.FATHOM_DEV.litWalls());

  /* hide the chrome: a shelf tile is art, not a picture of a HUD */
  await page.evaluate(() => { document.getElementById('hud').style.visibility = 'hidden'; });
  /* ⛔ AND THE CAMERA GOES OUT, NOT IN. At 1.45 the outer rings ran off all four
     edges and read as lens flare; at 0.9 they nest around the cave and the thing
     the picture is of is a sound going out into the dark, which is the game. */
  await page.evaluate(() => window.FATHOM_DEV.tileZoom(0.9));
  await waitFrames(page, 4);
  /* HOW MUCH OF THIS TILE IS ACTUALLY LIT. A camera with no check on its own
     picture is the same mistake as a gate that cannot fail. */
  const lit = await page.evaluate(() => {
    const cv = document.getElementById('board');
    const g = cv.getContext('2d');
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let on = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) { n++; if (d[i] + d[i + 1] + d[i + 2] > 30) on++; }
    return on / n;
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, lit, walls1, wallsN };
}

/* ⛔ SIX IN A THOUSAND ONLY CATCHES A BLANK TILE, and a tile can be far from
   blank and still read as a broken image on a shelf beside eleven others, which
   is what this one did: about eighty five percent black with two pixel lines.
   The floor is 0.035, which the tile as it is now clears at 4.3 percent and
   every framing below clears nothing, so the number defends the PICTURE and not
   only the pipeline.
   ⛔ TWO THINGS THAT ARE NOT THE ANSWER, both tried on 2026-09-07 and both
   measured. FOUR STONES: the hand does not carry four, so throws three and four
   land on nothing, `ringAt` waits its full twenty five seconds twice, and by the
   shutter the first two rings have expired and every wall has faded. 0.64
   percent, a QUARTER of the two stone tile, which is the exact failure this
   file's own header describes arriving by a new door. And A BIGGER ZOOM ALONE,
   1.9 with the rings run out to 150: zooming a sparse cave gives you a bigger
   sparse cave, the ring runs off all four edges and reads as a lens artifact,
   and the lit walls become scattered corners.
   ⛔ WHAT WORKED WAS THE MOMENT, NOT THE SIZE. The rings are caught EARLIER, at
   110 and 45 rather than 150 and 60, while the sound is still crossing the walls
   it is lighting, and the camera comes in only 1.45 so the whole ring sits
   inside the frame with the lit cave inside it. That is this game's own picture:
   a sound going out into the dark. 2.63 percent to 4.3. */
/* ⛔ AND THE LIT FRACTION WAS MEASURING THE RING, NOT THE CAVE. Seven places
   along the route all came back 4.39 to 4.43 percent while the wall count sat at
   twelve or thirteen: nearly all of that number is the ripple circle, which is
   the same size wherever it is thrown, so a tile with the walls stripped out of
   it entirely would still have cleared 0.035. The floor stays as a guard against
   a black tile, and the picture is now defended by a DIFFERENTIAL the camera
   measures on the spot: the fan has to light at least twice the wall a single
   stone lights in the same cave. Two stones could never have passed that. */
const MIN_LIT = 0.035;
const WALL_RATIO = 2;
let size = 512, got = null;
for (let attempt = 1; attempt <= 4 && !got; attempt++) {
  const r = await shoot(size);
  console.log('  attempt ' + attempt + ': ' + (r.lit * 100).toFixed(2) + ' percent of the tile is lit, '
    + r.wallsN + ' wall segments against ' + r.walls1 + ' for one stone, ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  if (r.lit >= MIN_LIT && r.wallsN >= r.walls1 * WALL_RATIO) got = r;
  else if (r.lit >= MIN_LIT) console.log('    the fan lit ' + r.wallsN + ' where one stone lit ' + r.walls1
    + ', which is not ' + WALL_RATIO + ' times as much cave. Retaking.');
}
if (!got) {
  close();
  console.log('\nTHE TILE CAME OUT DARK OR THIN four times. Either the throws are not landing, or the fan');
  console.log('is lighting no more cave than a single stone, which is the shape of the tile that read');
  console.log('as a broken image on the shelf.');
  console.log('THUMB TOO DARK');
  process.exit(1);
}
let buf = got.buf;
while (buf.length > LIMIT && size > 256) {
  size = Math.round(size * 0.8);
  console.log('  ' + (buf.length / 1024).toFixed(0) + ' KB is over the 150 KB grid limit, recapturing at ' + size + ' px');
  const r = await shoot(size);
  buf = r.buf;
}
writeFileSync(OUT, buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + size + ' px  ' + kb.toFixed(1) + ' KB  ' + (kb <= 150 ? 'under the limit' : 'STILL OVER'));
console.log('\nOPEN IT. A thumb nobody looked at is how a menu screenshot ends up on the shelf.');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
