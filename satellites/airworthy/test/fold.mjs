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
  /* how many earned folds the ladder hangs on each crease, asked of the page */
  const rungsPerFold = await page.evaluate(() => {
    const out = {};
    AIRWORTHY_TEST.folds().forEach(f => { out[f.id] = 0; });
    AIRWORTHY_TEST.ladder().forEach(r => { out[r.fold] = (out[r.fold] || 0) + 1; });
    return out;
  });
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
      /* ⛔ this asked for the crease's own choice count, which stopped being the
         number of chips the day the ladder put an earned fold on the end of four
         creases. The law is that a crease shows its own choices AND whatever the
         ladder hangs on it, locked ones included, because a part you cannot see
         is not something to work towards. */
      const wantChips = f.n + rungsPerFold[f.id];
      say(chips.length === wantChips, tag + ': crease ' + (step + 1) + ' offers its '
        + f.n + ' folds and ' + rungsPerFold[f.id] + ' earned (' + chips.length + ')');
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
/* ⛔ THE LADDER, WITH A REAL THUMB. Everything about it that is a rule is
   asserted in sim.js; what only a browser can say is that a locked fold is SHOWN
   rather than hidden, that it says the feat, that tapping it does nothing but
   say it again, and that it becomes foldable the moment the medal exists. A part
   you cannot see is not something to work towards. */
{
  const L = await open(s.base, { width: 412, height: 915, deviceScaleFactor: 1 });
  await L.page.evaluate(() => AIRWORTHY_TEST.clearMedals());
  await tap(L.page, '#btnWorkshop');
  await waitFrames(L.page, 2);
  const rungs = await L.page.evaluate(() => AIRWORTHY_TEST.ladder());
  say(rungs.length > 0 && rungs.every(r => !r.open),
    'with no medals, every earned fold is shut (' + rungs.map(r => r.fold).join(', ') + ')');

  /* walk to the crease the first rung belongs to */
  const firstFold = rungs[0].fold;
  /* ⛔ walk the creases the way this file's other gates do, through the shop's
     own step, rather than by tapping NEXT: NEXT will not advance until the
     precision bar has been pressed, so a tapped walk sat on crease one and the
     assertion below looked for a locked chip on a crease that has none. */
  const step = await L.page.evaluate((f) => AIRWORTHY_TEST.folds().findIndex(x => x.id === f), firstFold);
  await L.page.evaluate((n) => { AIRWORTHY_TEST.shop().step = n; AIRWORTHY_TEST.shopRender(); }, step);
  await waitFrames(L.page, 2);
  const chips = await L.page.evaluate(() => [...document.querySelectorAll('#shopChips .chip')].map(c => ({
    locked: c.classList.contains('locked'), label: c.querySelector('span').textContent,
    sub: c.querySelector('.sub').textContent,
    r: c.getBoundingClientRect().height
  })));
  const shut = chips.filter(c => c.locked);
  say(shut.length === 1, 'the locked fold is on the crease with the others (' + chips.length + ' chips, ' + shut.length + ' shut)');
  /* ⛔ my first version of this line looked for the word "medal", and the feat
     for a single one reads "Win a bronze to fold this one": the assertion failed
     on copy that was perfectly correct. It asks for the medal's KIND now, which
     is the thing the sentence actually has to name. */
  const kinds = rungs.map(r => r.medal);
  say(shut.length === 1 && kinds.some(k => shut[0].sub.indexOf(k) >= 0),
    'and it says the feat: "' + (shut[0] ? shut[0].sub : '') + '"');
  say(shut.length === 1 && shut[0].r >= 48, 'and it is still a 48 px target (' + (shut[0] ? Math.round(shut[0].r) : 0) + ' px)');

  /* a tap on it chooses nothing */
  const idx = chips.findIndex(c => c.locked);
  const before = await L.page.evaluate(() => AIRWORTHY_TEST.shopChoices());
  await L.page.evaluate((i) => {
    const c = document.querySelectorAll('#shopChips .chip')[i];
    const r = c.getBoundingClientRect();
    const el = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    el.click();
  }, idx);
  await waitFrames(L.page, 2);
  const after = await L.page.evaluate(() => AIRWORTHY_TEST.shopChoices());
  say(JSON.stringify(before) === JSON.stringify(after), 'and a tap on it folds nothing');

  /* earn the medal and it opens */
  await L.page.evaluate(() => { AIRWORTHY_TEST.earnMedal('gym-far', 'bronze'); });
  await L.page.evaluate(() => AIRWORTHY_TEST.shopRender());
  await waitFrames(L.page, 2);
  const openNow = await L.page.evaluate(() => AIRWORTHY_TEST.ladder()[0].open);
  const chips2 = await L.page.evaluate(() => [...document.querySelectorAll('#shopChips .chip')]
    .filter(c => c.classList.contains('locked')).length);
  say(openNow === true, 'and one bronze opens the first rung');
  say(chips2 === 0, 'and the crease has no shut folds left on it (' + chips2 + ')');
  say(L.errors.length === 0, 'nothing landed on the console' + (L.errors.length ? ': ' + L.errors[0] : ''));
  await L.browser.close();
}

say(b.errors.length === 0, 'nothing landed on the console' + (b.errors.length ? ': ' + b.errors[0] : ''));
await b.browser.close();

s.close();
if (fails.length) { console.log('\n' + fails.length + ' FOLD FAILURE(S)'); process.exit(1); }
console.log('\nFOLD OK');
