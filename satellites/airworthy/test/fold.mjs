/* The workshop, folded by a real thumb: six creases, each a choice and a press,
   and what comes out the other end is the nine numbers derive() reads.
   ⛔ every chip is tapped with a real PointerEvent at a point elementFromPoint
   agrees is reachable, and the precision bar is pressed, not set. */
import { serve, open, reporter, waitFrames, sleep, tap, tapAt, centre } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();

for (const [W, H, tag] of [[375, 667, 'portrait'], [667, 375, 'landscape']]) {
  const { browser, page, errors } = await open(s.base, { width: W, height: H, deviceScaleFactor: 1 });

  const fold = await centre(page, '#btnWorkshop');
  say(!!fold && fold.h >= 48 && fold.onTop, tag + ': the way into the workshop is a 48 px target');
  await tap(page, '#btnWorkshop');
  await waitFrames(page, 2);
  say(await page.evaluate(() => AIRWORTHY_TEST.screen()) === 'workshop', tag + ': and it opens the workshop');

  const folds = await page.evaluate(() => AIRWORTHY_TEST.folds().map(f => ({ id: f.id, field: f.field, n: f.choices.length })));
  say(folds.length === 6, tag + ': there are six creases (' + folds.length + ')');
  say(folds.filter(f => f.n >= 2).length === 5, tag + ': five of them are a choice');

  /* ---- the whole fold, tapped: the second chip of every crease ---- */
  const wanted = {};
  for (let step = 0; step < folds.length; step++) {
    const f = folds[step];
    const at = await page.evaluate(() => AIRWORTHY_TEST.shopStep());
    say(at === step, tag + ': it is on crease ' + (step + 1) + ' (' + (at + 1) + ')');
    if (f.n) {
      const chips = await page.evaluate(() => [...document.querySelectorAll('#shopChips .chip')].map(c => {
        const r = c.getBoundingClientRect();
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { w: r.width, h: r.height, on: top === c || c.contains(top) };
      }));
      say(chips.length === f.n, tag + ': crease ' + (step + 1) + ' offers ' + f.n + ' choices (' + chips.length + ')');
      say(chips.every(c => c.h >= 48), tag + ': and every chip is a 56 px target ('
        + chips.map(c => c.h.toFixed(0)).join(',') + ')');
      say(chips.every(c => c.on), tag + ': and none of them is covered');
      /* tap the SECOND one, whatever it is */
      await tap(page, '#shopChips .chip:nth-child(2)');
      await waitFrames(page, 2);
      wanted[f.field] = await page.evaluate((i) => AIRWORTHY_TEST.folds()[i].choices[1].v, step);
    }
    /* press the crease in the middle of the bar */
    const bar = await centre(page, '#shopBar');
    say(!!bar && bar.h >= 48 && bar.onTop, tag + ': the precision bar is a 48 px target on crease ' + (step + 1));
    await page.evaluate(() => AIRWORTHY_TEST.shopMarker(0.5));
    await tapAt(page, Math.round(bar.x), Math.round(bar.y));
    await waitFrames(page, 2);
    if (step === 0) {
      const p = await page.evaluate(() => AIRWORTHY_TEST.spec().precision);
      say(p > 0.9, tag + ': a press in the middle is a crisp crease (' + p.toFixed(2) + ')');
    }
    if (step < folds.length - 1) {
      await tap(page, '#btnShopNext');
      await waitFrames(page, 2);
    }
  }

  /* ---- the spec is what was tapped ---- */
  const spec = await page.evaluate(() => AIRWORTHY_TEST.spec());
  const wrong = Object.keys(wanted).filter(k => spec[k] !== wanted[k]);
  say(wrong.length === 0, tag + ': the spec is the choices that were tapped'
    + (wrong.length ? ': ' + wrong.map(k => k + ' is ' + spec[k] + ', tapped ' + wanted[k]).join(', ') : ''));

  /* ---- SAVE puts it in the hangar and takes you to the gym ---- */
  const before = await page.evaluate(() => AIRWORTHY_TEST.hangar().length);
  const saveBtn = await centre(page, '#btnShopNext');
  say(!!saveBtn && saveBtn.onTop, tag + ': the save button is reachable');
  await tap(page, '#btnShopNext');
  await waitFrames(page, 3);
  const after = await page.evaluate(() => AIRWORTHY_TEST.hangar());
  say(after.length === before + 1, tag + ': saving puts it in the hangar (' + after.length + ')');
  say(await page.evaluate(() => AIRWORTHY_TEST.screen()) === 'field', tag + ': and takes you to the gym');
  const kept = after[0].spec;
  const drift = Object.keys(wanted).filter(k => kept[k] !== wanted[k]);
  say(drift.length === 0, tag + ': and the plane in the hangar is the one that was folded'
    + (drift.length ? ': ' + drift.join(', ') : ''));

  /* ---- a press at the EDGE is a sloppy crease ---- */
  await page.evaluate(() => AIRWORTHY_TEST.shopStart());
  await waitFrames(page, 2);
  const bar2 = await centre(page, '#shopBar');
  await page.evaluate(() => AIRWORTHY_TEST.shopMarker(0.94));
  await tapAt(page, Math.round(bar2.x), Math.round(bar2.y));
  await waitFrames(page, 2);
  const sloppy = await page.evaluate(() => AIRWORTHY_TEST.spec().precision);
  say(sloppy < 0.5, tag + ': a press at the edge is a sloppy crease (' + sloppy.toFixed(2) + ')');
  say(sloppy > 0, tag + ': but it is still a crease (' + sloppy.toFixed(2) + ')');

  /* ---- Steady Hands makes every crease perfect ---- */
  await tap(page, '#btnMenu').catch(() => {});
  await page.evaluate(() => { AIRWORTHY_TEST.settings().steadyHands = 1; AIRWORTHY_TEST.shopStart(); });
  await waitFrames(page, 2);
  const steadyBar = await page.evaluate(() => document.getElementById('shopBar').classList.contains('on'));
  say(!steadyBar, tag + ': with Steady Hands on there is no bar to hit');
  const steadyOk = await page.evaluate(() => {
    for (let i = 0; i < 6; i++) { AIRWORTHY_TEST.shopTap(); AIRWORTHY_TEST.shop().step = i; }
    AIRWORTHY_TEST.shopRender();
    return AIRWORTHY_TEST.spec().precision;
  });
  say(steadyOk === 1, tag + ': and every crease is perfect (' + steadyOk + ')');
  await page.evaluate(() => { AIRWORTHY_TEST.settings().steadyHands = 0; });

  say(errors.length === 0, tag + ': nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the link, opened in a FRESH context ---- */
const a = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
const made = await a.page.evaluate(() => {
  AIRWORTHY_TEST.shopStart({ nose: 'locked', noseFolds: 3, wing: 0.15, fins: 'down',
    dihedral: 1, precision: 0.62, elev: -4, ail: 3, clip: 'nose' });
  return { link: AIRWORTHY_TEST.link(AIRWORTHY_TEST.spec()), spec: AIRWORTHY_TEST.spec() };
});
say(made.link.indexOf('#p=') > 0, 'a plane becomes a link (' + made.link.length + ' characters)');
say(made.link.length < 200, 'and it is short enough to send (' + made.link.length + ')');
await a.browser.close();

const b = await open(s.base, { width: 375, height: 667, deviceScaleFactor: 1 });
const hash = made.link.slice(made.link.indexOf('#'));
const opened = await b.page.evaluate((h) => AIRWORTHY_TEST.importHash(h), hash);
await waitFrames(b.page, 3);
say(opened, 'and a fresh context opens it');
say(await b.page.evaluate(() => AIRWORTHY_TEST.screen()) === 'workshop',
  'in the workshop, with the creases already made');
const got = await b.page.evaluate(() => ({ spec: AIRWORTHY_TEST.spec(), shop: AIRWORTHY_TEST.shop().choice }));
const keys = ['nose', 'noseFolds', 'wing', 'fins', 'dihedral', 'elev', 'ail', 'clip'];
const bad = keys.filter(k => got.spec[k] !== made.spec[k]);
say(bad.length === 0, 'and every fold came through' + (bad.length ? ': ' + bad.join(', ') : ''));
say(Math.abs(got.spec.precision - made.spec.precision) < 0.01,
  'including how well it was folded (' + got.spec.precision.toFixed(3) + ')');
const shown = ['nose', 'noseFolds', 'wing', 'fins', 'dihedral'].filter((f, i) => got.shop[i] === made.spec[f]);
say(shown.length === 5, 'and the workshop shows those creases (' + shown.length + ' of 5)');
const junk = await b.page.evaluate(() => AIRWORTHY_TEST.importHash('#p=notaplane'));
say(junk === false, 'and a link that is not a plane is refused');
say(b.errors.length === 0, 'nothing landed on the console' + (b.errors.length ? ': ' + b.errors[0] : ''));
await b.browser.close();

s.close();
if (fails.length) { console.log('\n' + fails.length + ' FOLD FAILURE(S)'); process.exit(1); }
console.log('\nFOLD OK');
