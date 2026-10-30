/* Browser gate `loot` (BUILD-PLAN.md T1.6): a room whose one Sun cell, two cells right of spawn, is its scroll. A REAL
 * touch held on the rocker's right walks the hero onto it; on the ground the offer opens (#offer: two stats, each a
 * distinct icon and name, each button 48 px or more) and while it is up the hero does not move though right stays
 * held; a REAL tap on the first scroll picks it: the offer closes, the stat and the scroll count rise, the pick is heard,
 * and the recorded script carries the CHOICE word, so the script replayed on the room's first state ends on the live
 * hash. At 412x915 and 360x780.
 *
 * Watched red by SIM_RUNS_UNDER_SHEET (the movement bits honoured under the offer) and CHOICE_VIA_SHELL (the shell
 * writes the stat: the replay's hash differs from the live run's). */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, pressEl, step } from './harness.mjs';

const R = reporter('LOOT');
const srv = await serve();
const browser = await launch();
const rows = []; for (let y = 0; y < 48; y++) rows.push(y === 47 ? '1'.repeat(24) : y >= 40 ? '1111' + '4'.repeat(20) : '4'.repeat(24));
rows[46] = rows[46].slice(0, 16) + 'e' + rows[46].slice(17);
const REC = JSON.stringify({ v: 1, w: 24, h: 48, mode: 0, focal: null, rows, rows2: null });

try {
  for (const [w, h] of [[412, 915], [360, 780]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    const ok = await page.evaluate(str => { const r = window.SB_DEV.loadRecord(str); window.__s0 = structuredClone(window.SB.game.state); return r; }, REC);
    const s0 = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), loot: window.SB_DEV.state().loot }));
    R.say(!!ok && s0.screen === 'play' && s0.loot.length === 1 && s0.loot[0].kind === 2 && s0.loot[0].idx === 46 * 24 + 16, w + ': the room loads, its one loot the scroll at (16, 46)');

    /* a real touch held on the rocker's right until the offer opens */
    await pressEl(page, '#rocker .zr');
    let opened = null;
    for (let k = 0; k < 40 && !opened; k++) { await step(page, 5); opened = await page.evaluate(() => window.SB_DEV.state().scrollsOffered); }
    const under = await page.evaluate(() => {
      const x0 = window.SB_DEV.state().hero.x;
      window.SB_DEV.step(30);
      const st = window.SB_DEV.state(), el = document.getElementById('offer'), bs = ['pickA', 'pickB'].map(id => document.getElementById(id));
      return { x0, x1: st.hero.x, on: el.classList.contains('on'), tall: bs.map(b => b.getBoundingClientRect().height), icons: bs.map(b => b.querySelector('.ico').className), names: bs.map(b => b.querySelector('b').textContent) };
    });
    R.say(!!opened && under.on && under.x1 === under.x0, w + ': the offer opens on the ground and the hero holds still under it with right held (x ' + under.x0 / 256 + ' then ' + under.x1 / 256 + ' px)');
    R.say(under.tall.every(t => t >= 48) && new Set(under.icons).size === 2 && new Set(under.names).size === 2 && under.names.every(n => n.length > 0), w + ': two scrolls, each a distinct icon and name (' + under.names.join(', ') + '), ' + under.tall.map(Math.round).join(' and ') + ' px tall');
    await page.touchscreen.touchEnd();

    /* a real tap on the first scroll */
    await tap(page, '#pickA');
    await step(page, 3);
    const after = await page.evaluate(() => {
      const st = window.SB_DEV.state(), words = window.SB.sim.rle.decode(window.SB.input.recording());
      const s = window.SB.sim.attach(structuredClone(window.__s0), window.SB.game.level);
      for (const wd of words) window.SB.sim.step(s, wd);
      return { offer: st.scrollsOffered, on: document.getElementById('offer').classList.contains('on'), stats: st.hero.vigor + st.hero.focus + st.hero.grit, scrolls: st.hero.scrolls,
        played: window.SB_DEV.audioPlayed(), choice: words.filter(wd => ((wd >> 6) & 15) === 1).length, same: window.SB.sim.hash(s) === window.SB_DEV.hash() };
    });
    R.say(!after.offer && !after.on && after.stats === 1 && after.scrolls === 1 && (after.played.pick || 0) >= 1, w + ': the tap picks: the offer closes, one stat and one scroll more, the pick is heard');
    R.say(after.choice === 1 && after.same, w + ': the recorded script carries the CHOICE word (' + after.choice + ') and replays on the room\'s first state to the live hash (' + after.same + ')');
    R.say(errors.length === 0, w + ': no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
