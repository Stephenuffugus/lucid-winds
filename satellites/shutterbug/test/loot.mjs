/* Browser gate `loot` (BUILD-PLAN.md T1.6): a room whose one Sun cell, two cells right of spawn, is its scroll. A REAL
 * touch held on the rocker's right walks the hero onto it; on the ground the offer opens (#offer: two stats, each a
 * distinct icon and name, each button 48 px or more) and while it is up the hero does not move though right stays
 * held; a REAL tap on the first scroll picks it: the offer closes, the stat and the scroll count rise, the pick is heard,
 * and the recorded script carries the CHOICE word, so the script replayed on the room's first state ends on the live
 * hash. At 412x915 and 360x780.
 *
 * The chest (the M1 review): walked on past the scroll, the chest's compare puts the slip up alone and the page modal;
 * a REAL tap on Keep the slip closes it and records one TAKE word that replays to the live hash. The scroll and the
 * chest opening on one step show one sheet at a time, the offer first as the sim answers it, then the slip. At 320x568
 * a room ended under the offer shows the death card alone with a thumb landing on Again and Title; at 412x915 the
 * strip's Title with the offer up leaves nothing over the title (at 320 the offer covers it).
 *
 * Watched red by SIM_RUNS_UNDER_SHEET (the movement bits honoured under the offer), CHOICE_VIA_SHELL (the shell
 * writes the stat: the replay's hash differs from the live run's), SLIP_OVER_OFFER, SHEET_OVER_DEATH, SLIP_NOT_MODAL,
 * OFFER_NOT_CLEARED and SLIPOK_LEAVES. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, pressEl, step, centre } from './harness.mjs';

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
        heard: window.SB_DEV.audioEvents().filter(e => e.name === 'pick').length, ctx: window.SB_DEV.audioState(), choice: words.filter(wd => ((wd >> 6) & 15) === 1).length, same: window.SB.sim.hash(s) === window.SB_DEV.hash() };
    });
    /* heard: a pick voice scheduled, not an ask counted (the M1 review: audioPlayed counts before the sound is live) */
    R.say(!after.offer && !after.on && after.stats === 1 && after.scrolls === 1 && after.heard >= 1, w + ': the tap picks: the offer closes, one stat and one scroll more, the pick is heard (' + after.heard + ' pick voice, the context ' + after.ctx + ')');
    R.say(after.choice === 1 && after.same, w + ': the recorded script carries the CHOICE word (' + after.choice + ') and replays on the room\'s first state to the live hash (' + after.same + ')');
    R.say(errors.length === 0, w + ': no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }

  /* the chest (the M1 review: no gate had ever opened it or tapped Keep the slip, the compare's only way out). The
     room's chest is set on row 46 by hand before the first state is kept (a named liberty: the room has one, up on
     row 39), so the replay still starts from the state the room played */
  const sheetsOf = page => page.evaluate(() => { const st = window.SB_DEV.state(), on = id => document.getElementById(id).classList.contains('on');
    return { offer: on('offer'), slip: on('slip'), death: on('death'), modal: document.body.classList.contains('sb-modal'), offered: st ? st.scrollsOffered : null, compare: st ? st.room.compare : 0, screen: window.SB_DEV.screen() }; });
  const openRoom = async (w, h, chestX) => {
    const pg = await newPage(browser, { width: w, height: h });
    await gotoGame(pg.page, srv.base); await ready(pg.page);
    await pg.page.evaluate(() => window.SB_DEV.hold(true));
    await pg.page.evaluate((str, cx) => { window.SB_DEV.loadRecord(str); const st = window.SB.game.state; st.chest.idx = 46 * 24 + cx; st.chest.open = 0; window.__s0 = structuredClone(st); }, REC, chestX);
    return pg;
  };
  const walkUntil = async (page, pred) => {
    await pressEl(page, '#rocker .zr');
    let sh = null;
    for (let k = 0; k < 60; k++) { await step(page, 2); sh = await sheetsOf(page); if (pred(sh)) break; }
    await page.touchscreen.touchEnd();
    return sh;
  };
  {
    const { page, errors } = await openRoom(412, 915, 20);
    await walkUntil(page, sh => !!sh.offered);
    await tap(page, '#pickA'); await step(page, 2);
    const at = await walkUntil(page, sh => !!sh.compare);
    R.say(at.compare === 1 && at.slip && !at.offer && at.modal, '412: walked on past the scroll, the chest opens its compare: the slip is up alone and the page is modal (slip ' + at.slip + ', modal ' + at.modal + ')');
    await tap(page, '#slipok'); await step(page, 3);
    const done = await page.evaluate(() => {
      const st = window.SB_DEV.state(), words = window.SB.sim.rle.decode(window.SB.input.recording());
      const s = window.SB.sim.attach(structuredClone(window.__s0), window.SB.game.level);
      for (const wd of words) window.SB.sim.step(s, wd);
      return { compare: st.room.compare, open: st.chest.open, slip: document.getElementById('slip').classList.contains('on'), modal: document.body.classList.contains('sb-modal'),
        take: words.filter(wd => ((wd >> 6) & 15) === window.SB.sim.CHOICE.TAKE).length, same: window.SB.sim.hash(s) === window.SB_DEV.hash() };
    });
    R.say(done.compare === 0 && done.open === 1 && !done.slip && !done.modal && done.take === 1 && done.same,
      '412: a real tap on Keep the slip closes the compare (' + done.compare + '), the slip goes, the recording carries one TAKE word (' + done.take + ') and replays to the live hash (' + done.same + ')');
    R.say(errors.length === 0, '412 chest: no page errors' + (errors.length ? ' (' + errors.join('; ') + ')' : ''));
    await page.close();
  }
  /* the scroll and the chest on one step (the chest one cell past the scroll): one sheet at a time, the offer first as
     the sim answers it; then Title under the open offer, and a room ended under it. At 320x568, where a sheet over
     the death card hides both its buttons */
  {
    const { page, errors } = await openRoom(320, 568, 17);
    const both = await walkUntil(page, sh => !!sh.offered || !!sh.compare);
    R.say(!!both.offered && both.compare === 1 && both.offer && !both.slip && both.modal, '320: the scroll\'s offer and the chest\'s compare open on one step: the offer is up alone (slip ' + both.slip + ')');
    await tap(page, '#pickA'); await step(page, 2);
    const next = await sheetsOf(page);
    R.say(!next.offered && next.compare === 1 && !next.offer && next.slip && next.modal, '320: the pick closes the offer and the slip comes up after it (slip ' + next.slip + ')');
    await tap(page, '#slipok'); await step(page, 2);
    const none = await sheetsOf(page);
    R.say(!none.offer && !none.slip && !none.modal && none.compare === 0, '320: Keep the slip, and neither sheet is up');
    await page.close();
    /* at 412 the strip's Title shows under the offer (at 320 the offer covers it: the offer is answered first) */
    const a = await openRoom(412, 915, 21);
    await walkUntil(a.page, sh => !!sh.offered);
    await tap(a.page, '#back');
    const t = await sheetsOf(a.page), ct = await centre(a.page, '#sample');
    R.say(t.screen === 'title' && !t.offer && !t.slip && !t.modal && !!ct && ct.onTop, '412: the strip\'s Title with the offer up: the title with nothing over it (offer ' + t.offer + ', modal ' + t.modal + ')');
    R.say(a.errors.length === 0, '412 title: no page errors' + (a.errors.length ? ' (' + a.errors.join('; ') + ')' : ''));
    await a.page.close();
    const b = await openRoom(320, 568, 21);
    await walkUntil(b.page, sh => !!sh.offered);
    /* the room ended by hand under the open offer (the hit on the step a sheet opens is rare in play): the state
       marked dead, the next step shows the death card */
    await b.page.evaluate(() => { window.SB.game.state.room.dead = 1; window.SB_DEV.step(1); });
    const d = await sheetsOf(b.page), again = await centre(b.page, '#deathagain'), dtitle = await centre(b.page, '#deathtitle');
    R.say(d.death && !d.offer && !d.slip && !!again && again.onTop && !!dtitle && dtitle.onTop, '320: a room ended under the offer shows the death card alone, a thumb lands on Again and Title (offer ' + d.offer + ')');
    R.say(errors.length === 0 && b.errors.length === 0, '320: no page errors' + (errors.length + b.errors.length ? ' (' + errors.concat(b.errors).join('; ') + ')' : ''));
    await b.page.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
