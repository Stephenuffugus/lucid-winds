/* THE GIFT, SENT AND OPENED.
 *
 *   node test/gift.mjs
 *
 * A link is made in one browser context and opened in a FRESH one, with its own
 * empty save, the way it will be on the other person's phone. What has to
 * survive that trip is the song, the name, who it is from, what it says and the
 * paper it is wrapped in, and then the recipient has to be able to open it with
 * a real drag and hear the same notes the sender heard.
 *
 * ⛔ the ribbon is pulled with a real pointer over sixty real pixels. A gift you
 * can open with a tap is a dialog, not a present.
 */
import { serve, open, reporter, waitFrames, centre, tap } from './harness.mjs';

const site = await serve();
const { fails, say } = reporter();

/* ---- the sender ---- */
const A = await open(site.base, { width: 375, height: 667 });
const TA = (fn, ...a) => A.page.evaluate(fn, ...a);
let link = '', wantFirst = [];
try {
  await TA(() => {
    window.WINDUP_TEST.setStrip([[0, 7], [2, 7], [4, 11], [6, 11], [8, 12]], 'For you');
    document.getElementById('btnMenu').click();
    document.getElementById('btnGive').click();
  });
  await waitFrames(A.page, 3);
  for (const [sel, min] of [['#giveName', 48], ['#giveNote', 48], ['#btnShare', 56]]) {
    const c = await centre(A.page, sel);
    say(!!c && c.onTop && c.h >= min - 0.5,
      sel + ' is reachable and ' + (c ? c.h.toFixed(0) : 0) + ' px (floor ' + min + ')');
  }
  const wraps = await TA(() => [...document.querySelectorAll('#wrapRow .btn')].map(b => {
    const r = b.getBoundingClientRect();
    const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { w: b.getAttribute('data-wrap'), h: r.height, on: t === b || b.contains(t) };
  }));
  say(wraps.length === 3 && wraps.every(w => w.on && w.h >= 47.5),
    'the three wrappings are all reachable (' + wraps.map(w => w.w).join(', ') + ')');
  await tap(A.page, '#wrapRow .btn:nth-child(2)');
  await waitFrames(A.page, 2);
  await TA(() => {
    document.getElementById('giveName').value = 'For Jessie';
    document.getElementById('giveNote').value = 'Turn it slowly, the way we used to';
    document.getElementById('giveBy').value = 'Stephen';
  });
  link = await TA(() => window.WINDUP_TEST.giftLink());
  say(link.indexOf('#g=') > 0, 'giving it away makes a link (' + link.length + ' characters)');
  say(link.length < 900, 'and it is short enough to send in a message');
  say(await TA(() => window.WINDUP_TEST.strip().wrap) === 'snowfall',
    'and it remembers which paper was chosen');
  wantFirst = await TA(() => window.WINDUP_TEST.strip().holes.slice(0, 3));
} finally {
  await A.browser.close();
}

/* ---- the recipient, in a browser that has never seen this game ---- */
const hash = link.slice(link.indexOf('#'));
const B = await open(site.base, { width: 375, height: 667, query: hash });
const TB = (fn, ...a) => B.page.evaluate(fn, ...a);
try {
  await waitFrames(B.page, 3);
  const got = await TB(() => ({ on: window.WINDUP_TEST.gift().on,
    opened: window.WINDUP_TEST.gift().opened,
    strip: window.WINDUP_TEST.strip(),
    screen: window.WINDUP_TEST.screen(),
    shelf: window.WINDUP_TEST.shelf().length }));
  say(got.on === true, 'the link opens as a parcel');
  say(got.opened === 0, 'and it is still wrapped');
  say(got.strip.name === 'For Jessie', 'the song came with its name (' + got.strip.name + ')');
  say(got.strip.by === 'Stephen', 'and who it is from (' + got.strip.by + ')');
  say(got.strip.dedication.indexOf('slowly') > 0, 'and what it says');
  say(got.strip.wrap === 'snowfall', 'and the paper it is wrapped in');
  say(JSON.stringify(got.strip.holes.slice(0, 3)) === JSON.stringify(wantFirst),
    'and the notes are the ones that were punched');
  /* nothing of the gift is on the recipient's shelf until they say so */
  say(got.shelf === 3, 'and it is not on their shelf yet, only the three that come in the box');

  /* ---- the ribbon: a short tug does nothing, a real pull opens it ---- */
  const end = await TB(() => window.WINDUP_TEST.gift().endAt);
  /* ⛔ ASK THE SCREEN, NOT THE GAME. Every assertion below taps where the game
     says the ribbon end is, so if the game puts it past the edge of the phone
     they all still pass and nobody can open the present. */
  const vp = await TB(() => ({ w: window.innerWidth, h: window.innerHeight }));
  say(end.x > 40 && end.x < vp.w - 40 && end.y > 40 && end.y < vp.h - 40,
    'the ribbon end is on the screen with room for a thumb around it ('
    + end.x.toFixed(0) + ',' + end.y.toFixed(0) + ' on ' + vp.w + 'x' + vp.h + ')');
  const onEnd = await TB((x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? e.id : null;
  }, Math.round(end.x), Math.round(end.y));
  say(onEnd === 'stage', 'and nothing is sitting on top of it (' + onEnd + ')');
  const drag = async (dx, dy, steps = 10) => {
    const put = (type, x, y) => TB((type, x, y) => {
      const el = document.getElementById('stage');
      el.dispatchEvent(new PointerEvent(type, { pointerId: 21, pointerType: 'touch',
        isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    }, type, x, y);
    await put('pointerdown', end.x, end.y);
    for (let i = 1; i <= steps; i++) await put('pointermove', end.x + dx * i / steps, end.y + dy * i / steps);
    await put('pointerup', end.x + dx, end.y + dy);
  };
  await drag(24, 6);
  await waitFrames(B.page, 3);
  say((await TB(() => window.WINDUP_TEST.gift().opened)) === 0,
    'a short tug on the ribbon does not open it');
  await drag(80, 20);
  await waitFrames(B.page, 3);
  const after = await TB(() => ({ opened: window.WINDUP_TEST.gift().opened,
    card: document.getElementById('scrGift').classList.contains('on'),
    note: document.getElementById('giftNote').textContent,
    from: document.getElementById('giftFrom').textContent }));
  say(after.opened >= 1, 'a real pull takes the ribbon off');
  say(after.card, 'and the card is there');
  say(after.note.indexOf('slowly') > 0, 'with the line they wrote on it: "' + after.note + '"');
  say(after.from.indexOf('Stephen') >= 0, 'and who it came from: "' + after.from + '"');

  /* ---- and it plays ---- */
  await TB(() => { document.getElementById('btnGiftOwn').click(); });
  await waitFrames(B.page, 2);
  await TB(() => {
    document.getElementById('btnPunchDone').click();
    window.WINDUP_TEST.clearFired();
  });
  await waitFrames(B.page, 2);
  const hub = await TB(() => window.WINDUP_TEST.layout().hub);
  const put = (type, x, y) => TB((type, x, y) => {
    const el = document.getElementById('stage');
    el.dispatchEvent(new PointerEvent(type, { pointerId: 22, pointerType: 'touch',
      isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, type, x, y);
  const at = (f) => {
    const a = -Math.PI / 2 + f * 2 * Math.PI;
    return { x: hub.x + Math.cos(a) * 46, y: hub.y + Math.sin(a) * 46 };
  };
  let p = at(0);
  await put('pointerdown', p.x, p.y);
  for (let i = 1; i <= 40; i++) { p = at(i / 40); await put('pointermove', p.x, p.y); }
  await put('pointerup', p.x, p.y);
  await waitFrames(B.page, 4);
  const fired = await TB(() => window.WINDUP_TEST.fired().map(f => [f.step, f.row]));
  const want = await TB(() => window.WINDUP_TEST.strip().holes
    .filter(h => h[0] <= window.WINDUP_TEST.readAt()));
  say(JSON.stringify(fired) === JSON.stringify(want),
    'one turn of their crank plays the notes the sender punched ('
    + JSON.stringify(fired) + ')');

  /* ---- keeping it ---- */
  await TB(() => { window.WINDUP_TEST.openLink(location.hash); });
  await waitFrames(B.page, 2);
  await TB(() => { window.WINDUP_TEST.gift().endAt && document.getElementById('btnGiftSave'); });
  await TB(() => {
    window.WINDUP_TEST.gift().opened = 1;
    document.getElementById('btnGiftSave').click();
  });
  await waitFrames(B.page, 3);
  const shelf = await TB(() => window.WINDUP_TEST.shelf().map(e => e.name));
  say(shelf.indexOf('For Jessie') >= 0, 'SAVE TO MY SHELF keeps it (' + JSON.stringify(shelf) + ')');
  await B.page.reload({ waitUntil: 'load' });
  await B.page.waitForFunction(() => window.WINDUP_TEST && window.WINDUP_TEST.frames() > 2, { timeout: 30000 });
  const kept = await TB(() => window.WINDUP_TEST.shelf().map(e => e.name));
  say(kept.indexOf('For Jessie') >= 0, 'and it is still there after a reload');

  say(B.errors.length === 0, 'no page errors' + (B.errors.length ? ': ' + B.errors.slice(0, 3).join(' | ') : ''));
} finally {
  await B.browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' GIFT FAILURE(S)'); process.exit(1); }
console.log('GIFT OK');
