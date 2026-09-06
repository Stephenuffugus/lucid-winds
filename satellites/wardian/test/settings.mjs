/* The switches, the photograph and the jar you can carry to another phone.
   ⛔ every one of these is pressed with a real pointer at the point a thumb
   would land on, and the photograph is MEASURED, not merely produced. */
import { serve, open, reporter, waitFrames, sleep, tap, centre } from './harness.mjs';

const s = await serve();
const { browser, page, errors } = await open(s.base);
const { fails, say } = reporter();

await page.evaluate(() => WARDIAN_TEST.advance(1200, 'daily'));
await waitFrames(page, 2);

/* nothing asks for anything at boot */
const asked = await page.evaluate(() => ({
  weather: WARDIAN_TEST.settings().weather,
  tilt: WARDIAN_TEST.settings().tilt,
  sheetOpen: !!document.querySelector('.sheet.on, .screen.on'),
  geo: window.__geoAsked || 0
}));
say(!asked.weather, 'the jar does not listen to the sky until it is asked');
say(!asked.tilt, 'and it does not read the phone tilt either');
say(!asked.sheetOpen, 'and nothing is covering the jar at boot');

await tap(page, '#btnMenu');
await tap(page, '#btnSettings');
await waitFrames(page, 2);
for (const sel of ['#btnSound', '#btnMotion', '#btnTilt', '#btnWeather', '#btnHemi', '#btnExport', '#btnImport', '#btnSettingsClose']) {
  const r = await centre(page, sel);
  say(!!r && r.h >= 48 && r.onTop, 'settings ' + sel + ' is a 48 px target on top ('
    + (r ? r.h.toFixed(0) + (r.onTop ? '' : ', COVERED') : 'missing') + ')');
}

/* the hemisphere toggle moves the seasons */
const beforeSeason = await page.evaluate(() => WARDIAN_TEST.state().env.season);
await tap(page, '#btnHemi');
await waitFrames(page, 2);
const afterSeason = await page.evaluate(() => ({
  season: WARDIAN_TEST.state().env.season, hemi: WARDIAN_TEST.state().hemi,
  label: document.getElementById('btnHemi').textContent
}));
say(afterSeason.season !== beforeSeason, 'the hemisphere toggle turns the year over ('
  + beforeSeason + ' to ' + afterSeason.season + ')');
say(/SOUTHERN|NORTHERN/.test(afterSeason.label), 'and the button says which way round it is now');
await tap(page, '#btnHemi');

/* sound and motion remember themselves */
await tap(page, '#btnSound');
await waitFrames(page, 2);
const soundOff = await page.evaluate(() => ({
  set: WARDIAN_TEST.settings().sound,
  label: document.getElementById('btnSound').textContent,
  saved: JSON.parse(localStorage.getItem('lw_wardian_v1') || '{}').set
}));
say(!soundOff.set && /OFF/.test(soundOff.label), 'sound turns off and says so');
await sleep(1100);
const remembered = await page.evaluate(() => JSON.parse(localStorage.getItem('lw_wardian_v1')).set.sound);
say(!remembered, 'and the save remembers it');
await tap(page, '#btnSound');

await tap(page, '#btnMotion');
await waitFrames(page, 3);
const still = await page.evaluate(() => {
  const a = WARDIAN_TEST.leafAngles();
  return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => {
    const b = WARDIAN_TEST.leafAngles();
    r({ same: JSON.stringify(a) === JSON.stringify(b), n: a.length });
  })));
});
say(still.n > 3 && still.same, 'with motion off the plants stop swaying (' + still.n + ' segments compared)');
await tap(page, '#btnMotion');
await waitFrames(page, 3);
const moving = await page.evaluate(() => {
  const a = WARDIAN_TEST.leafAngles();
  return new Promise(r => setTimeout(() => {
    const b = WARDIAN_TEST.leafAngles();
    r(JSON.stringify(a) !== JSON.stringify(b));
  }, 260));
});
say(moving, 'and with motion on they move again');

/* the jar goes in a line of text and comes back */
const trip = await page.evaluate(() => {
  const before = WARDIAN_TEST.snapshot();
  const txt = WARDIAN_TEST.exportJar();
  WARDIAN_TEST.state().plants.length = 1;
  const ok = WARDIAN_TEST.importJar(txt);
  return { ok, same: WARDIAN_TEST.snapshot() === before, len: txt.length, head: txt.slice(0, 9) };
});
say(trip.head === 'wardian1:', 'a jar exports as one line of text (' + trip.len + ' characters)');
say(trip.ok && trip.same, 'and it comes back the same jar');
const junk = await page.evaluate(() => WARDIAN_TEST.importJar('this is not a jar'));
say(junk === false, 'and something that is not a jar is refused');

await tap(page, '#btnSettingsClose');
await waitFrames(page, 2);

/* the photograph */
const photo = await page.evaluate(() => {
  const cv = WARDIAN_TEST.photo();
  const c = cv.getContext('2d');
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0, green = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * 53) {
    n++;
    if (d[i] + d[i + 1] + d[i + 2] > 110) lit++;
    if (d[i + 1] > d[i] + 10 && d[i + 1] > 40) green++;
  }
  return { w: cv.width, h: cv.height, lit: lit / n, green: green / n, stamp: WARDIAN_TEST.stamp() };
});
say(photo.w === 1080 && photo.h === 1440, 'the photograph is 1080 by 1440 (' + photo.w + 'x' + photo.h + ')');
say(photo.lit > 0.2, 'and it is not a black rectangle (' + (photo.lit * 100).toFixed(0) + ' percent lit)');
say(photo.green > 0.008, 'and the jar is in it (' + (photo.green * 100).toFixed(2) + ' percent green)');
say(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec) \d+, (dawn|morning|afternoon|evening|night)/.test(photo.stamp),
  'the stamp reads like a field note: "' + photo.stamp + '"');
say(!/\d+\.\d{3}|latitude|longitude|-?\d{2}\.\d{2}/.test(photo.stamp), 'and it carries no coordinates');
const btn = await centre(page, '#btnPhoto');
say(!!btn && btn.w >= 56 && btn.onTop, 'and the button that takes it is a 56 px target');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close(); s.close();
if (fails.length) { console.log('\n' + fails.length + ' SETTINGS FAILURE(S)'); process.exit(1); }
console.log('\nSETTINGS OK');
