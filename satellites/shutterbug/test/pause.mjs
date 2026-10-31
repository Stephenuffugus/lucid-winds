/* Browser gate `pause` (Stephen's note 3 of 31 Oct, "the title button that leaves the game is in the wrong place that
 * ruined my run", and his ruling the same night, "Pause in the top bar": QUESTIONS Q94). Real taps and real keys.
 *
 * At 412x915, 360x780 and 320x568, the sample room with the loop held:
 *   - in the running room Pause shows and the back gesture is watched; a real tap on Pause opens the pause card and keeps
 *     the room (the same frame and hash), and hides itself; under the card an injected .lwfb-fab hides (body.sb-modal);
 *   - under the card the loop runs unheld for 30 animation frames and the sim takes no step;
 *   - the card reads Resume, Share this room, Title, in that order, each 48 px or more, on top and in view, Resume in Sun
 *     and Title plain, inside the room;
 *   - a real tap on A under the card, then Resume: the card gone, Pause back, and no jump (the bug's y 3 steps later);
 *     resumed, the room runs again;
 *   - Share this room opens the sheet over the card, the card hidden under it and the room held, and its Close returns
 *     to the card;
 *   - the card's Title: the title with nothing over it, the room gone and no back watcher armed; the next room opens at
 *     frame 0 with no card over it.
 * The back gesture (his ruling; one CloseWatcher, and a real Escape key, which desktop Chrome sends as a close request),
 * at 412x915: on the title no watcher is armed (SB_DEV.backWatch, so the phone's back leaves the game) and Escape
 * changes nothing; in a room it opens the card; on the card it resumes; on the share sheet it returns to the card; on the
 * clear card and on the death card it is Title. In the reveal (held at its start, SB_DEV.hold) Pause is hidden, and back
 * ends the reveal and opens the card. A link that arrives over the card holds the room under the Tap to develop card with
 * no watcher armed there.
 * A hidden page and a lost focus pause a running room (his call 7). Inside the wrapper iframe (SWS_EMBED): the host page
 * taking the focus leaves the room running (Sproing's rule), and a page brought in front of the wrapper hides it, so the
 * room is held under the card when it comes back. At top level: the focus moved into a child frame, the page still
 * visible, pauses it (the gate's one liberty: the frame added to the page; this browser makes no other blur without a
 * hide, and a page in front fires both).
 * Watched red by PAUSE_LEAVES, PAUSE_RUNS_SIM, RESUME_KEEPS_EDGE, PAUSED_NOT_OVERLAY, PAUSED_NOT_MODAL, PAUSE_ALWAYS_SHOWN,
 * SHARE_CLOSE_TO_PLAY, BACK_UNWATCHED, BACK_CARD_TO_TITLE, BACK_SHEET_UNWATCHED, BACK_CARDS_UNWATCHED, BACK_TRAPS_TITLE,
 * BACK_IN_REVEAL_LOST, CODE_CARD_WATCHED, HIDDEN_NO_PAUSE, BLUR_NO_PAUSE and BLUR_IN_FRAME_PAUSES. */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, centre, sleep } from './harness.mjs';

const R = reporter('PAUSE');
const srv = await serve();
const browser = await launch();
const OVER = ['paused', 'clear', 'death', 'sharesheet', 'devcard'];
const SUN = 'rgb(242, 209, 63)', CLEAR = 'rgba(0, 0, 0, 0)';

/* page side: an injected feedback fab (as the loop gate injects it) and one look at everything the rules name */
const install = page => page.evaluate((OVER) => {
  if (!document.querySelector('.lwfb-fab')) {
    const f = document.createElement('div'); f.className = 'lwfb-fab';
    f.style.cssText = 'position:fixed;right:12px;bottom:96px;width:78px;height:78px;z-index:2000000000;background:#d83a9b';
    document.body.appendChild(f);
  }
  window.__look = () => {
    const st = window.SB.game.state, vis = id => getComputedStyle(document.getElementById(id)).visibility;
    return { screen: window.SB_DEV.screen(), watch: window.SB_DEV.backWatch(), on: OVER.filter(id => document.getElementById(id).classList.contains('on')),
      modal: document.body.classList.contains('sb-modal'), fab: getComputedStyle(document.querySelector('.lwfb-fab')).display,
      pause: vis('pause'), card: vis('paused'), state: !!st, frame: st ? st.frame : -1, hash: window.SB_DEV.hash(), href: location.href };
  };
}, OVER);
const look = page => page.evaluate(() => window.__look());
const onText = l => l.on.join(' ') || 'nothing';
/* the loop unheld for n animation frames (counted by the loop itself), then held again: the sim steps taken meanwhile */
async function unheld(page, n = 30) {
  const a = await page.evaluate(() => { window.SB_DEV.hold(false); return { raf: window.SB_DEV.perf().loop.raf, steps: window.SB_DEV.frames() }; });
  await page.waitForFunction((r, n) => window.SB_DEV.perf().loop.raf >= r + n, { timeout: 60000, polling: 50 }, a.raf, n);
  const b = await page.evaluate(() => { window.SB_DEV.hold(true); return { raf: window.SB_DEV.perf().loop.raf, steps: window.SB_DEV.frames() }; });
  return { frames: b.raf - a.raf, steps: b.steps - a.steps };
}
const settle = page => page.evaluate(() => { for (let k = 0; k < 120 && !window.SB_DEV.state().hero.ground; k++) window.SB_DEV.step(1); window.SB_DEV.step(2); return window.SB_DEV.state().hero; });
const escape = async page => { await page.keyboard.press('Escape'); await sleep(60); };

try {
  for (const [w, h] of [[412, 915], [360, 780], [320, 568]]) {
    const tag = w + 'x' + h;
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base); await ready(page); await install(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    await settle(page);
    const l0 = await look(page);
    R.say(l0.screen === 'play' && l0.pause === 'visible' && l0.watch === 'play' && l0.on.length === 0,
      tag + ': in the running room Pause shows and the back gesture is watched (screen ' + l0.screen + ', Pause ' + l0.pause + ', watching ' + (l0.watch || 'nothing') + ')');

    /* a stray tap costs a pause, never the room */
    await tap(page, '#pause');
    const l1 = await look(page);
    R.say(l1.screen === 'pause' && l1.on.join() === 'paused' && l1.state && l1.frame === l0.frame && l1.hash === l0.hash && l1.pause === 'hidden',
      tag + ': a real tap on Pause opens the pause card and keeps the room (screen ' + l1.screen + ', on: ' + onText(l1) + ', frame ' + l0.frame + ' then ' + l1.frame + ', the hash ' + (l1.hash === l0.hash ? 'the same' : 'changed') + ', Pause ' + l1.pause + ')');
    R.say(l1.modal && l1.fab === 'none', tag + ': under the pause card an injected .lwfb-fab hides and the page is modal (fab ' + l1.fab + ', modal ' + l1.modal + ')');
    const u1 = await unheld(page);
    const l2 = await look(page);
    R.say(u1.frames >= 30 && u1.steps === 0 && l2.screen === 'pause' && l2.hash === l0.hash,
      tag + ': under the pause card the room holds: ' + u1.frames + ' animation frames unheld, ' + u1.steps + ' sim steps (want 0), the hash ' + (l2.hash === l0.hash ? 'the same' : 'changed'));

    const card = await page.evaluate(() => {
      const st = document.getElementById('stage').getBoundingClientRect(), c = document.getElementById('paused').getBoundingClientRect();
      return { inRoom: c.top >= st.top - 0.5 && c.bottom <= st.bottom + 0.5, box: [c.top, c.bottom, st.top, st.bottom].map(Math.round),
        btns: ['resume', 'pauseshare', 'pausetitle'].map(id => {
          const el = document.getElementById(id), r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return { id, text: el.textContent, top: r.top, h: r.height, onTop: !!t && (t === el || el.contains(t)), inView: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth, bg: getComputedStyle(el).backgroundColor };
        }) };
    });
    const b = card.btns, inOrder = b[0].top < b[1].top && b[1].top < b[2].top;
    R.say(inOrder && b.map(x => x.text).join('|') === 'Resume|Share this room|Title' && b.every(x => x.h >= 48 && x.onTop && x.inView) && b[0].bg === SUN && b[2].bg === CLEAR && card.inRoom,
      tag + ': the card reads ' + b.map(x => x.text).join(', ') + (inOrder ? ', in that order' : ', OUT OF ORDER') + ', each 48 px or more, on top and in view, Resume in Sun and Title plain, inside the room (' +
      b.map(x => x.id + ' ' + x.h.toFixed(0) + (x.onTop ? '' : ' NOT on top') + (x.inView ? '' : ' out of view') + ' ' + x.bg).join(', ') + '; the card ' + card.box[0] + ' to ' + card.box[1] + ', the room ' + card.box[2] + ' to ' + card.box[3] + ')');

    /* a thumb on A under the card is never banked into a jump at Resume */
    const y0 = (await page.evaluate(() => window.SB_DEV.state().hero)).y;
    await tap(page, '#btnA');
    await tap(page, '#resume');
    const l3 = await look(page);
    const g1 = await page.evaluate(() => { window.SB_DEV.step(3); return window.SB_DEV.state().hero; });
    R.say(l3.screen === 'play' && l3.on.length === 0 && l3.pause === 'visible' && l3.watch === 'play',
      tag + ': Resume plays on: the card gone, Pause back, back watched for the room (screen ' + l3.screen + ', on: ' + onText(l3) + ', Pause ' + l3.pause + ', watching ' + (l3.watch || 'nothing') + ')');
    R.say(g1.ground && g1.y === y0, tag + ': a real tap on A under the pause card does not jump at Resume (on the ground ' + g1.ground + ', y ' + (y0 / 256) + ' then ' + (g1.y / 256) + ' px)');
    const u2 = await unheld(page, 10);
    R.say(u2.steps > 0, tag + ': resumed, the room runs again (' + u2.steps + ' steps in ' + u2.frames + ' animation frames)');

    /* Share this room from the card, and its Close back to the card */
    await tap(page, '#pause');
    await tap(page, '#pauseshare');
    const s1 = await look(page);
    const u3 = await unheld(page, 10);
    await tap(page, '#shareclose');
    const s2 = await look(page);
    R.say(s1.screen === 'share' && s1.on.includes('sharesheet') && s1.card === 'hidden' && u3.steps === 0 && s2.screen === 'pause' && s2.on.join() === 'paused' && s2.card === 'visible',
      tag + ': Share this room opens the sheet over the pause card (the card ' + s1.card + ' under it, ' + u3.steps + ' steps in ' + u3.frames + ' frames) and its Close returns to the card (screen ' + s2.screen + ', on: ' + onText(s2) + ', the card ' + s2.card + ')');

    /* the card's Title, and the next room */
    await tap(page, '#pausetitle');
    const t = await look(page), c = await centre(page, '#sample');
    R.say(t.screen === 'title' && t.on.length === 0 && !t.modal && t.fab !== 'none' && !t.state && t.watch === '' && !!c && c.onTop,
      tag + ': the pause card\'s Title: the title with nothing over it (screen ' + t.screen + ', on: ' + onText(t) + ', the room ' + (t.state ? 'kept' : 'gone') + ', fab ' + t.fab + ', back watched for ' + (t.watch || 'nothing') + (c && !c.onTop ? ', a thumb on Try the sample room lands on ' + c.topName : '') + ')');
    await tap(page, '#sample');
    const n = await look(page);
    R.say(n.screen === 'play' && n.frame === 0 && n.on.length === 0 && n.pause === 'visible', tag + ': the next room opens at frame 0 with no card over it and Pause shown (on: ' + onText(n) + ', frame ' + n.frame + ')');
    R.say(errors.length === 0, tag + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the back gesture, by a real Escape key */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base); await ready(page); await install(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    const t0 = await look(page);
    await escape(page);
    const t1 = await look(page);
    R.say(t0.screen === 'title' && t1.screen === 'title' && t0.watch === '' && t1.watch === '' && t1.on.length === 0 && t1.href === t0.href,
      'on the title no back watcher is armed, so the phone\'s back leaves the game as before, and Escape changes nothing (watching ' + (t1.watch || 'nothing') + ', screen ' + t1.screen + ')');
    await tap(page, '#sample');
    await settle(page);
    const b0 = await look(page);
    await escape(page);
    const b1 = await look(page);
    R.say(b1.screen === 'pause' && b1.on.join() === 'paused' && b1.hash === b0.hash && b1.watch === 'pause',
      'back (a real Escape) in a room opens the pause card and keeps the room (screen ' + b1.screen + ', on: ' + onText(b1) + ', watching ' + (b1.watch || 'nothing') + ')');
    await escape(page);
    const b2 = await look(page);
    R.say(b2.screen === 'play' && b2.on.length === 0 && b2.watch === 'play' && b2.hash === b0.hash,
      'back on the pause card resumes (screen ' + b2.screen + ', on: ' + onText(b2) + ', watching ' + (b2.watch || 'nothing') + ')');
    await escape(page);
    await tap(page, '#pauseshare');
    const b3 = await look(page);
    await escape(page);
    const b4 = await look(page);
    R.say(b3.screen === 'share' && b4.screen === 'pause' && !b4.on.includes('sharesheet') && b4.card === 'visible' && b4.watch === 'pause',
      'back on the share sheet closes it and returns to the pause card (screen ' + b3.screen + ' then ' + b4.screen + ', on: ' + onText(b4) + ', the card ' + b4.card + ')');
    await escape(page);
    await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(2); });
    const c0 = await look(page);
    await escape(page);
    const c1 = await look(page);
    R.say(c0.screen === 'clear' && c1.screen === 'title' && c1.on.length === 0 && !c1.state && c1.watch === '',
      'back on the clear card is Title: the title with nothing over it (screen ' + c0.screen + ' then ' + c1.screen + ', on: ' + onText(c1) + ')');
    await tap(page, '#sample');
    await page.evaluate(() => { window.SB.game.state.room.dead = 1; window.SB_DEV.step(1); });   /* the room ended by hand, as the share gate ends it */
    const d0 = await look(page);
    await escape(page);
    const d1 = await look(page);
    R.say(d0.screen === 'dead' && d1.screen === 'title' && d1.on.length === 0 && !d1.state && d1.watch === '',
      'back on the death card is Title: the title with nothing over it (screen ' + d0.screen + ' then ' + d1.screen + ', on: ' + onText(d1) + ')');

    /* the reveal, held at its start (SB_DEV.hold freezes its clock): Pause hidden, and back ends it and pauses */
    await page.evaluate(() => window.SB_DEV.revealSkip(false));
    await tap(page, '#sample');
    const r0 = await look(page), pc = await centre(page, '#pause');
    R.say(r0.screen === 'reveal' && r0.pause === 'hidden' && !!pc && !pc.onTop && r0.watch === 'reveal',
      'in the reveal Pause is hidden: a thumb on it lands on ' + (pc ? pc.topName : 'nothing') + ' (screen ' + r0.screen + ', Pause ' + r0.pause + ', back watched for ' + (r0.watch || 'nothing') + ')');
    await escape(page);
    const r1 = await look(page), rv = await page.evaluate(() => ({ on: window.SB.ui.reveal.on, marks: window.SB_DEV.perf().reveal }));
    R.say(r1.screen === 'pause' && r1.on.join() === 'paused' && rv.on === false && !!rv.marks && rv.marks.end !== undefined && rv.marks.skipped === true,
      'back in the reveal ends it and opens the pause card (screen ' + r1.screen + ', on: ' + onText(r1) + ', the reveal ' + (rv.on ? 'still on' : 'ended') + ')');
    await tap(page, '#resume');
    const r2 = await look(page);
    R.say(r2.screen === 'play' && r2.on.length === 0, 'from that card Resume plays the room (screen ' + r2.screen + ')');
    await page.evaluate(() => window.SB_DEV.revealSkip(true));

    /* a link by hashchange over the pause card: held under the Tap to develop card, no back watcher left armed there */
    await tap(page, '#pause');
    const code = await page.evaluate(() => window.SB.record.encode(window.SB.game.record));
    await page.evaluate(cd => { location.hash = cd; }, code);
    await page.waitForFunction(() => document.getElementById('devcard').classList.contains('on'), { timeout: 5000 }).catch(() => {});
    const k0 = await look(page);
    await escape(page);
    const k1 = await look(page), uk = await unheld(page, 10);
    R.say(k0.on.includes('devcard') && k0.screen === 'code' && k0.watch === '' && k1.screen === 'code' && uk.steps === 0,
      'a link that arrives over the pause card holds the room under the Tap to develop card with no back watcher armed there (screen ' + k0.screen + ', watching ' + (k0.watch || 'nothing') + '; after back ' + k1.screen + ', ' + uk.steps + ' steps)');
    await tap(page, '#devtap');
    const k2 = await look(page);
    R.say(k2.screen === 'play' && k2.on.length === 0 && k2.watch === 'play', 'its tap develops the room with nothing over it (screen ' + k2.screen + ', on: ' + onText(k2) + ')');
    R.say(errors.length === 0, 'the back gesture: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* a lost focus at top level: the focus moved into a child frame, the page still visible */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base); await ready(page); await install(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    await page.evaluate(() => {
      window.__blurs = 0; window.addEventListener('blur', () => { window.__blurs++; });
      const f = document.createElement('iframe'); f.id = 'gatefocus'; f.srcdoc = '<input id="i">';
      f.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;border:0';
      document.body.appendChild(f);
      return new Promise(r => { f.onload = r; });
    });
    const z0 = await look(page);
    await page.evaluate(() => { const f = document.getElementById('gatefocus'); f.contentWindow.focus(); f.contentDocument.getElementById('i').focus(); });
    await sleep(200);
    const z1 = await page.evaluate(() => ({ blurs: window.__blurs, vis: document.visibilityState }));
    const z2 = await look(page);
    R.say(z0.screen === 'play' && z1.blurs > 0 && z1.vis === 'visible' && z2.screen === 'pause' && z2.on.join() === 'paused',
      'at top level a lost focus (moved into a child frame, the page still ' + z1.vis + ') pauses the running room (' + z1.blurs + ' blur, screen ' + z0.screen + ' then ' + z2.screen + ')');
    R.say(errors.length === 0, 'the lost focus: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* inside the wrapper iframe (SWS_EMBED): the host takes the focus, then a page comes in front of the wrapper */
  {
    const b = await newPage(browser, { width: 412, height: 915 });
    await b.page.goto(srv.base + '/__wrap.html', { waitUntil: 'load' });
    let fr = null;
    for (let k = 0; k < 100 && !fr; k++) { fr = b.page.frames().find(f => f.url().includes('probe=wrap')); if (!fr) await sleep(100); }
    await fr.waitForFunction(() => window.SB_DEV && typeof window.SB_DEV.screen === 'function', { timeout: 30000 });
    await fr.evaluate(() => {
      window.SB_DEV.revealSkip(true); window.SB_DEV.hold(true);
      window.__blurs = 0; window.__hides = 0;
      window.addEventListener('blur', () => { window.__blurs++; });
      document.addEventListener('visibilitychange', () => { if (document.hidden) window.__hides++; });
    });
    await install(fr);
    const box = await (await fr.frameElement()).boundingBox();
    const ftap = async (sel) => {
      const c = await fr.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); if (r.width < 1) return null;
        const x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return { x, y, onTop: !!t && (t === el || el.contains(t)) }; }, sel);
      if (!c || !c.onTop) throw new Error('in the frame a thumb on ' + sel + ' does not land on it');
      await b.page.touchscreen.tap(box.x + c.x, box.y + c.y);
    };
    await ftap('#sample');
    await b.page.evaluate(() => { const i = document.createElement('input'); i.id = 'hostfield'; i.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;border:0'; document.body.appendChild(i); i.focus(); });
    await sleep(200);
    const e1 = await fr.evaluate(() => ({ blurs: window.__blurs, embed: window.SWS_EMBED, screen: window.SB_DEV.screen() }));
    R.say(e1.embed === true && e1.blurs > 0 && e1.screen === 'play', 'inside the wrapper iframe a lost focus (the host page took it) leaves the room running, as Sproing does under SWS_EMBED (' + e1.blurs + ' blur, screen ' + e1.screen + ')');
    const other = await browser.newPage();
    await other.bringToFront();
    await sleep(400);
    await b.page.bringToFront();
    await sleep(300);
    const e2 = await fr.evaluate(() => ({ hides: window.__hides, vis: document.visibilityState }));
    const e3 = await look(fr), ue = await unheld(fr, 20);
    R.say(e2.hides > 0 && e2.vis === 'visible' && e3.screen === 'pause' && e3.on.join() === 'paused' && ue.steps === 0,
      'inside the wrapper iframe a hidden page pauses its room: back in front it holds under the pause card (' + e2.hides + ' hide, screen ' + e3.screen + ', ' + ue.steps + ' steps in ' + ue.frames + ' frames)');
    await ftap('#resume');
    const ur = await unheld(fr, 10);
    R.say(ur.steps > 0, 'a real tap on Resume in the frame runs the room again (' + ur.steps + ' steps)');
    R.say(b.errors.length === 0, 'framed: zero page errors' + (b.errors.length ? ' (' + b.errors.join(' ; ') + ')' : ''));
    await other.close();
  }
} finally { await browser.close(); await srv.close(); }
R.finish();
