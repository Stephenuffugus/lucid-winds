/* GATE (H1, D27 + law): saves survive.
   A. A returning save written by the build BEFORE H1 (coins, frames, equip, difficulty, sound,
      bests, a Daily streak, today's goals in progress) loads to a playable menu with every value
      kept: nothing reset, nothing rewritten, the goals' progress intact.
   B. A damaged hm.missions (seven ways: not JSON, items not a list, an unknown goal, progress not a
      number, null, a date that is not a string, half broken with one good row) still gives a
      playable menu: three goal rows, numeric progress, the exit wired, Daily startable, and the one
      good row of the half broken save keeps its progress.
   Run: node satellites/hues/dev/gate-save.mjs [--plant=novalidate]      412x915. */
import { launch, open, close, reporter, plantFromArgs, tap, playing, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-save');
const browser = await launch();

let page = await open(browser, { w: 412, h: 915, settleMs: 300 });
const info = await page.evaluate(() => ({ today: todayStr(), pick: pickMissions(), pool: MISSION_POOL.map((m) => m.id) }));
await close(page);
const d = new Date(); d.setDate(d.getDate() - 1);
const yesterday = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const progFor = (it) => (it.target > 2 ? 2 : it.target > 1 ? 1 : 0);

async function playableMenu(page, tag) {
  const s = await page.evaluate(() => ({
    rows: document.querySelectorAll('#missionList .mrow').length,
    bars: [...document.querySelectorAll('#missionList .mbar div')].map((b) => b.style.width),
    exit: typeof window.SWS_EXIT === 'function' && !!document.getElementById('exitLink').onclick,
    items: (() => { try { return getMissions().items; } catch (e) { return 'THROWS ' + e.message; } })(),
  }));
  R.t(tag + ': no page errors', page._errors.length === 0, page._errors.slice(0, 2).join(' | '));
  R.t(tag + ': three goal rows with numeric bars', s.rows === 3 && s.bars.every((w) => /^\d+(\.\d+)?%$/.test(w)), 'rows ' + s.rows + ' bars ' + JSON.stringify(s.bars));
  R.t(tag + ': goals are known ids with numeric progress', Array.isArray(s.items) && s.items.length === 3 && s.items.every((it) => it && info.pool.includes(it.id) && Number.isFinite(it.prog) && it.prog >= 0), JSON.stringify(s.items).slice(0, 160));
  R.t(tag + ': the arcade exit is wired', s.exit);
  let started = false; try { await tap(page, '[data-mode="daily"]'); await playing(page); started = await page.evaluate(() => G && G.mode === 'daily'); } catch (e) {}
  R.t(tag + ': Daily starts', started);
  return s;
}

/* ---- A. a returning save from the build before H1 ---- */
const goals = { date: info.today, items: info.pick.map((it) => ({ ...it, prog: progFor(it), done: false })) };
const SEED = { hues_rules: '1', 'hm.coins': '1240', 'hm.owned': 'hairline,bevel,gold,clay_frog', 'hm.equip': 'gold', 'hm.diff': 'casual', 'hm.sound': '0',
  'hm.endless.best': '6420', 'hm.daily.best': '4410', 'hm.daily.streak': '4', 'hm.daily.last': yesterday, 'hm.daily.done': yesterday, 'hm.daily.donescore': '3980', 'hm.missions': JSON.stringify(goals) };
page = await open(browser, { w: 412, h: 915, seed: SEED, settleMs: 600 });
const A = await page.evaluate(() => ({ coins: document.getElementById('menuCoins').textContent, best: document.getElementById('endlessMeta').textContent, diff: (document.querySelector('#diffSeg button.on') || { getAttribute: () => null }).getAttribute('data-diff'), sound: document.getElementById('menuSound').textContent, frame: document.getElementById('targetFrame').className, store: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])) }));
R.t('A: coins shown as 1,240', /1,240/.test(A.coins), A.coins);
R.t('A: Endless best shown', /6,420/.test(A.best), A.best);
R.t('A: difficulty kept (casual)', A.diff === 'casual', String(A.diff));
R.t('A: sound kept off', A.sound.indexOf('🔇') >= 0, A.sound);
R.t('A: equipped frame applied (gold)', /bd-gold/.test(A.frame), A.frame);
const changed = Object.keys(SEED).filter((k) => k !== 'hm.missions' && A.store[k] !== SEED[k]);
R.t('A: no saved value rewritten at boot', changed.length === 0, changed.map((k) => k + ': ' + SEED[k] + ' -> ' + A.store[k]).join(', '));
let kept = null; try { kept = JSON.parse(A.store['hm.missions']); } catch (e) {}
R.t('A: today\'s goals and their progress kept', kept && kept.date === info.today && kept.items.length === 3 && kept.items.every((it, i) => it.id === goals.items[i].id && it.prog === goals.items[i].prog && it.done === false), A.store['hm.missions']);
await playableMenu(page, 'A');
await close(page);

/* ---- B. damaged goals ---- */
const p0 = info.pick.find((it) => it.target > 1) || info.pick[0], P0 = progFor(p0), other = info.pick.find((it) => it.id !== p0.id);
const VARIANTS = [
  ['not JSON', '{oops'],
  ['items not a list', JSON.stringify({ date: info.today, items: 'x' })],
  ['an unknown goal', JSON.stringify({ date: info.today, items: [{ id: 'nope', prog: 1, target: 3, reward: 5, done: false }] })],
  ['progress not a number', JSON.stringify({ date: info.today, items: info.pick.map((it) => ({ ...it, prog: 'NaN' })) })],
  ['null', 'null'],
  ['a date that is not a string', JSON.stringify({ date: 12345, items: [] })],
  ['half broken, one good row', JSON.stringify({ date: info.today, items: [{ ...p0, prog: P0, done: false }, 5, { id: other.id, prog: -4 }] })],
];
for (const [name, raw] of VARIANTS) {
  page = await open(browser, { w: 412, h: 915, seed: { hues_rules: '1', 'hm.coins': '300', 'hm.missions': raw }, settleMs: 500 });
  const s = await playableMenu(page, 'B ' + name);
  if (name.startsWith('half')) {
    const row = Array.isArray(s.items) && s.items.find((it) => it.id === p0.id);
    R.t('B half broken: the good row keeps its progress (' + p0.id + ' = ' + P0 + ')', !!row && row.prog === P0, JSON.stringify(row));
  }
  await close(page);
}
await browser.close();
R.done();
