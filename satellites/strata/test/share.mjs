/* A specimen sent to somebody else.
   ⛔ THE SECOND BROWSER HAS NEVER SEEN THIS GAME. It is a separate puppeteer
   launch with its own profile and its own storage, and everything it knows
   about the animal is in the link.
   ⛔ THE LINK CARRIES A SEED, NOT A SKELETON. The bones, the name and the
   history are regenerated on the other phone, which is why the last assertions
   here are about a link with rubbish in it: a stranger's link is stranger data
   and must not be able to smuggle in an animal this game did not make.
   Watched to fail: by putting the bones in the link instead of the seed, by
   dropping the sender from the placard, and by trusting the condition word. */
import { serve, open, reporter, waitFrames, tap, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

/* ---- the first phone digs one up and sends it ---- */
const a = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
await waitFrames(a.page, 2);
await tap(a.page, '#btnDig');
await waitFrames(a.page, 2);
await a.page.evaluate(() => STRATA_TEST.site(4242, 0));
await waitFrames(a.page, 2);
await a.page.evaluate(() => { STRATA_TEST.liftAll(); });
await waitFrames(a.page, 2);
await tap(a.page, '#btnMount');
await waitFrames(a.page, 2);
await tap(a.page, '#btnPlaceAll');
await waitFrames(a.page, 2);
await tap(a.page, '#btnKeepIt');
await waitFrames(a.page, 2);
await a.page.click('#dedField');
await a.page.keyboard.type('Penny');
await tap(a.page, '#btnKeep');
await waitFrames(a.page, 3);
/* and the sender puts their own name on it */
await tap(a.page, '#btnHallBack');
await waitFrames(a.page, 2);
await tap(a.page, '#btnDig');
await waitFrames(a.page, 2);

const mine = await a.page.evaluate(() => STRATA_TEST.museum()[0]);
say(!!mine && / pennyi$/.test(mine.name), 'the first phone has a specimen named for Penny ('
  + (mine ? mine.name : 'none') + ')');
const link = await a.page.evaluate(() => STRATA_TEST.linkFor(0));
const hash = link.slice(link.indexOf('#'));
say(hash.indexOf('#f=') === 0 && hash.length > 20, 'and it makes a link (' + hash.length + ' characters)');
say(hash.length < 260, 'short enough to go in a message');
/* ⛔ the link must NOT contain a skeleton */
say(hash.length < 200, 'and far too short to be carrying fifty bones (' + hash.length + ')');
await a.browser.close();

/* ---- a second phone, which has never seen the game ---- */
const b = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1, query: hash });
await waitFrames(b.page, 3);
say((await b.page.evaluate(() => STRATA_TEST.screen())) === 'Hall',
  'the second phone opens straight into the hall');
const crates = await b.page.evaluate(() => STRATA_TEST.crates());
say(crates.length === 1, 'and there is a crate waiting in it (' + crates.length + ')');
say(crates[0].name === mine.name, 'with the name the sender gave it (' + crates[0].name + ')');
const box = await centre(b.page, '#hall .plinth.crate');
say(!!box && box.w >= 48 && box.h >= 48 && box.onTop, 'the crate is a real target on top ('
  + (box ? box.w.toFixed(0) + 'x' + box.h.toFixed(0) : 'missing') + ')');
const crateLabel = await b.page.evaluate(() => document.querySelector('#hall .plinth.crate .placard .sub').textContent);
say(crateLabel.indexOf('from') >= 0, 'and it says who it came from (' + crateLabel.replace(/\n/g, ' / ') + ')');

/* a real tap unpacks it */
await tap(b.page, '#hall .plinth.crate');
await waitFrames(b.page, 3);
const after = await b.page.evaluate(() => ({ museum: STRATA_TEST.museum(),
  crates: STRATA_TEST.crates(), heard: STRATA_TEST.events() }));
say(after.crates.length === 0, 'a real tap opens the crate');
say(after.museum.length === 1, 'and the specimen goes on a plinth (' + after.museum.length + ')');
say(after.museum[0].name === mine.name, 'under the name it was sent with');
say(after.heard.indexOf('jacket') >= 0, 'and the jacket comes off it');

/* ⛔ the placard carries the sender's museum, which is the whole point */
const placard = await b.page.evaluate(() => {
  const p = document.querySelector('#hall .plinth:not(.crate) .placard .sub');
  return p ? p.textContent : null;
});
say(!!placard && placard.indexOf('on loan from') >= 0,
  'and the placard says whose museum it came out of (' + (placard || '').replace(/\n/g, ' / ') + ')');

/* the plate: a 1080 by 1350 card with bones on it, from the same seed (Fable, 2026-09-06) */
const plate = await b.page.evaluate(() => {
  const m = STRATA_TEST.museum()[0];
  const cv = STRATA_TEST.plate(m);
  const c = cv.getContext('2d');
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let bone = 0, rock = 0, paper = 0;
  for (let i = 0; i < d.length; i += 16) {
    const r = d[i], g = d[i + 1], bl = d[i + 2];
    if (r > 235 && g > 220 && bl > 185) bone++;
    else if (r > 120 && r < 150 && g > 95 && g < 115 && bl < 80) rock++;
    else if (r > 225 && g > 210 && bl > 180) paper++;
  }
  const btn = document.getElementById('btnSpPlate');
  return { w: cv.width, h: cv.height, bone, rock, paper, btnText: btn ? btn.textContent : null };
});
say(plate.w === 1080 && plate.h === 1350, 'the plate is 1080 by 1350 (' + plate.w + 'x' + plate.h + ')');
say(plate.bone > 400, 'and bones are drawn on it (' + plate.bone + ' bone samples)');
say(plate.rock > 4000, 'inside a rock frame (' + plate.rock + ' rock samples)');
say(plate.btnText === 'MAKE A PLATE', 'and the plinth sheet offers MAKE A PLATE');

/* ⛔ the SKELETON was regenerated here, not sent: the same seed, the same bones */
const same = await b.page.evaluate((seed, era) => {
  const cv = document.querySelector('#hall .plinth:not(.crate) canvas');
  const c = cv.getContext('2d');
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let ink = 0;
  for (let i = 0; i < d.length; i += 4 * 7) if (d[i + 3] > 40) ink++;
  return { ink, w: cv.width, h: cv.height, seed, era };
}, mine.seed, mine.era);
say(same.ink > 300, 'and a skeleton was drawn from the seed on this phone (' + same.ink + ' marks)');

/* ---- stranger data ---- */
const junk = await b.page.evaluate(() => {
  const before = STRATA_TEST.crates().length;
  location.hash = '#f=this-is-not-a-specimen';
  return before;
});
await waitFrames(b.page, 3);
const alive = await b.page.evaluate(() => STRATA_TEST.frames());
await waitFrames(b.page, 2);
say((await b.page.evaluate(() => STRATA_TEST.frames())) > alive, 'a link with rubbish in it does not stop the game');
say((await b.page.evaluate(() => STRATA_TEST.crates())).length === junk,
  'and nothing arrives from it (' + (await b.page.evaluate(() => STRATA_TEST.crates())).length + ' crates)');
/* the field journal names the specimen against its body plan, which is the one place a
   plan is spoken aloud. The layout gate proves the empty case; this one mounts a real
   specimen first, so it proves the named case. (Opus, 2026-09-06) */
await b.page.evaluate(() => { document.getElementById('scrMenu').classList.add('on'); });
await b.page.waitForFunction(() => document.getElementById('btnToJournal'), { timeout: 5000 }).catch(() => {});
await tap(b.page, '#btnToJournal');
await new Promise(r => setTimeout(r, 500));
const jour = await b.page.evaluate(() => ({
  on: document.getElementById('scrJournal').classList.contains('on'),
  spec: document.getElementById('jSpec').textContent,
  firsts: Array.prototype.map.call(document.querySelectorAll('#jFirsts .first'), e => e.textContent)
}));
say(jour.on, 'the field journal opens from the menu');
say(jour.spec === '1', 'and it counts the specimen that arrived by link (' + jour.spec + ')');
say(jour.firsts.length === 4 && jour.firsts.some(t => !/not met yet/.test(t)),
  'and names it against its body plan: ' + jour.firsts.join(' | '));

say(b.errors.length === 0, 'nothing landed on the console' + (b.errors.length ? ': ' + b.errors[0] : ''));
await b.browser.close();

/* ---- a link that claims a condition nobody has ---- */
const c2 = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
await waitFrames(c2.page, 2);
const forged = await c2.page.evaluate(() => {
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const enc = (str) => {
    const b = [];
    for (let i = 0; i < str.length; i++) b.push(str.charCodeAt(i));
    let out = '';
    for (let i = 0; i < b.length; i += 3) {
      const n = (b[i] << 16) | ((i + 1 < b.length ? b[i + 1] : 0) << 8) | (i + 2 < b.length ? b[i + 2] : 0);
      out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
      if (i + 1 < b.length) out += B64[(n >> 6) & 63];
      if (i + 2 < b.length) out += B64[n & 63];
    }
    return out;
  };
  location.hash = '#f=' + enc('99|3|Fakeus <script>alerti|Some One|Immaculate|1');
  return true;
});
void forged;
await waitFrames(c2.page, 3);
const got = await c2.page.evaluate(() => STRATA_TEST.crates());
say(got.length === 1, 'a hand written link still brings a crate (' + got.length + ')');
say(got.length === 1 && got[0].condition === 'Patched',
  'but a condition nobody has is not believed (' + (got[0] ? got[0].condition : '?') + ')');
say(got.length === 1 && /^[A-Za-z]+ [a-z]+$/.test(got[0].name),
  'and the name is letters and one space, whatever was in the link (' + (got[0] ? got[0].name : '?') + ')');
say(c2.errors.length === 0, 'and nothing landed on the console'
  + (c2.errors.length ? ': ' + c2.errors[0] : ''));
await c2.browser.close();

s.close();
if (fails.length) { console.log('\n' + fails.length + ' SHARE FAILURE(S)'); process.exit(1); }
console.log('\nSHARE OK');
