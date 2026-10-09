// The words at the bottom (design 15 A3, decision D-1). Stephen's note after playing: the line went too fast to
// read, because each sentence simply overwrote the last one.
//
// Two styles, his to choose in the menu:
//   Ticker (default)  sentences enter from the right and travel left at a readable pace, each one led by the
//                     pictures of what happened, so a child who cannot read still gets the story going past.
//   Lines             one still sentence at a time, held long enough to read (1.5 s plus 0.35 s a word).
// `prefers-reduced-motion` forces Lines, whatever the setting says.
//
// Two rules hold in both styles:
//   - an ANSWER to something the player just did never crawls: it appears at once, still, over everything, holds
//     two seconds, and then the crawl carries on where it was;
//   - touching the line holds it still while the finger is down, and a tap opens Today: the last twenty
//     sentences as still text with their pictures, which is the safety net for anyone the ticker outruns.
import { picUrl } from '../art/sprites.js';
import { chipOf } from './chips.js';

export function createNews({ data, mode = 'ticker', now = () => performance.now() }) {
  const el = document.getElementById('info'), strip = document.getElementById('newsStrip');
  const answerEl = document.getElementById('answer'), todayEl = document.getElementById('today');
  const U = data.ui.news;
  const queue = []; // what has not gone past yet
  const today = []; // the last U.todayMax, newest last
  let x = 0, held = false, answerUntil = 0, lineUntil = 0, reduced = false, style = mode;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = false; }

  const styleNow = () => (reduced ? 'lines' : style);
  // (his calls of 5 Oct 2026: while new things wait their turn, ui/because.js asks the crawl to hurry, and it moves at maxSpeed, the
  // pace it never passes: a new phone's first minutes bring three times more new sentences than the line can show at its own pace)
  let hurry = false;
  const speed = () => { // px a second, at the width this phone actually is
    const w = el ? el.clientWidth || U.baseWidth : U.baseWidth;
    return hurry ? U.maxSpeed : Math.min(U.maxSpeed, U.speed * (w / U.baseWidth));
  };

  // A sentence to show. `pics` is a list of { spr, over } (the Because triple), `answer` marks a reply to the
  // player's own action, which never waits and never crawls.
  function add(text, pics, answer) {
    if (!text) return;
    // The same answer again while it is still up and still Today's newest line: the same row, its moment renewed, not another (H2
    // review round, 5 Oct 2026). Since H2 every command of hers is answered at once, and a two second spray of sheep put 31 "A sheep
    // arrived." in a row, all twenty of Today's rows, and pushed out everything she had read before it. Once its moment is over, or
    // once another line came after it, the same words are a row of their own again.
    if (answer && shown && shown.text === text && answerUntil && now() <= answerUntil && today[today.length - 1] === shown) {
      shown.at = now();
      if (pics && pics.length) shown.pics = pics;
      showAnswer(shown);
      return;
    }
    const item = { text, pics: pics || [], at: now() };
    today.push(item);
    while (today.length > U.todayMax) today.shift();
    if (answer) { showAnswer(item); return; }
    queue.push(item);
    while (queue.length > U.queueMax) queue.shift(); // the oldest unshown goes; the world moved on without it
    if (styleNow() === 'ticker') sync();
    else lineUntil = 0; // Lines: the next frame picks it up
  }

  // ---------- ticker ----------
  function sync() {
    if (!strip) return;
    // Rebuild only when the queue's contents changed: the strip holds one element per queued sentence.
    const want = queue.map((i) => i.text).join('\u0000');
    if (strip.dataset.want === want) return;
    strip.dataset.want = want;
    strip.textContent = '';
    for (const item of queue) strip.appendChild(itemEl(item));
    if (x === 0) x = el ? el.clientWidth : U.baseWidth; // a new run starts at the right edge
  }
  // Each picture on its chip (card polish 3, 3 Oct 2026: ui/chips.js, the one rule for every strip: "A baby frog was born." was three
  // plain green tiles in Today, a green frog on the green chip). A terrain the row is about is drawn too, its own tile (design 18
  // A4's ground pictures never reached this line; her card and the sparkle's card drew them: one strip for all three now).
  function itemEl(item) {
    const d = document.createElement('span');
    d.className = 'newsItem';
    for (const p of item.pics) {
      if (!p || !(p.spr || p.cols)) continue;
      const im = new Image();
      im.src = picUrl(p);
      im.alt = '';
      im.style.background = chipOf(data, p);
      d.appendChild(im);
    }
    d.appendChild(document.createTextNode(item.text));
    return d;
  }
  // Called every frame with the seconds since the last one.
  function frame(dt) {
    if (!el) return;
    // When an answer's moment is over: back to the pinned line if one is waiting under it, else away.
    if (answerEl && answerUntil && now() > answerUntil) {
      answerUntil = 0;
      const back = pinned && answerEl.dataset.pin;
      if (back) { answerEl.textContent = ''; answerEl.appendChild(itemEl({ text: back, pics: [] })); }
      else answerEl.hidden = true;
    }
    if (styleNow() === 'lines') return lines();
    if (!strip) return;
    sync();
    if (held || !queue.length) return;
    x -= speed() * dt;
    // Drop what has gone past the left edge, and let the last one rest there instead of marching into nothing.
    const first = strip.firstElementChild;
    if (first) {
      const wid = first.offsetWidth + U.gap;
      if (queue.length > 1 && x + wid < 0) { queue.shift(); strip.removeChild(first); x += wid; sync(); }
      else if (queue.length === 1 && x < 0) x = 0; // it rests at the left until something else happens
    }
    strip.style.transform = `translateX(${Math.round(x)}px)`;
  }
  // Whether a line told now comes straight onto the line (his calls of 5 Oct 2026, ui/because.js pickTold): a new thing waits until the
  // one before it has come all the way on, so the crawl never pushes a line off before it was shown (its queueMax) and the sparkle goes
  // up as the words come. In the crawl: the last line in it is all on the screen, or it is the only one and rests at the left (a line
  // wider than her screen rests there with its end cut off, and comes no further until the next one comes: measured 5 Oct, "A sparrow
  // landed on Maureen's head and bounced off." is 415 px on a 412 px line, and asking for its end on the screen stopped her line for
  // good); in Lines: nothing waits behind the line shown. With no page, or a line it cannot measure, there is room.
  // A line pinned over hers is no room at all (his calls' review round, 5 Oct 2026): the creature she poked, Move's line while she
  // chooses where, the broken world's way out. The pin covers the whole line (#answer, solid, over #info) for as long as she looks, and
  // her first world's first hint is "Tap to poke.": two looks of 20 s at a sheep in her first minutes had 9 and 8 new sentences told
  // under it, unseen and marked told for good (the review's probe, seeds 7 and 11). Now they wait for her to let go, and one that
  // waits longer than its bound is let go untold and stays new (because.js).
  function room() {
    if (!el || !strip) return true;
    if (pinned) return false;
    if (styleNow() === 'lines') return queue.length === 0;
    if (!queue.length || (queue.length === 1 && x <= 0)) return true;
    let right = x - U.gap;
    for (const c of strip.children) right += (c.offsetWidth || 0) + U.gap;
    return !(right > (el.clientWidth || U.baseWidth));
  }
  // ---------- lines ----------
  function lines() {
    if (!strip) return;
    if (now() < lineUntil || !queue.length) return;
    const item = queue.shift();
    strip.textContent = '';
    strip.appendChild(itemEl(item));
    strip.style.transform = 'translateX(0px)';
    x = 0;
    lineUntil = now() + U.lineMs + U.perWordMs * item.text.split(/\s+/).length;
    while (queue.length > U.linesQueueMax) queue.shift();
  }
  // ---------- an answer, at once ----------
  // An answer to what the player just did always gets through (design 15 A3). It covers a pinned line for its
  // moment, and the pin comes back when it is done: before this, a creature being looked at swallowed every
  // answer, so a tap that could not do anything was answered with silence.
  let shown = null; // the answer item last shown (it is Today's own entry too)
  function showAnswer(item) {
    if (!answerEl) return;
    answerEl.textContent = '';
    answerEl.appendChild(itemEl(item));
    answerEl.hidden = false;
    answerUntil = now() + U.answerMs;
    shown = item;
  }
  // The pictures of the answer that is up (H2, 5 Oct 2026; ui/status.js news): the Because system tells the record her finger was
  // just answered with ("The dog barked so loudly that a goblin froze.", the goblin she put down): its strip joins the line that is
  // up, for the rest of its moment, and Today's entry with it. Not a second line, and nothing when that answer's moment is over.
  function answerPics(text, pics) {
    if (!answerEl || !shown || shown.text !== text || !answerUntil || now() > answerUntil || !pics || !pics.length) return;
    shown.pics = pics;
    answerEl.textContent = '';
    answerEl.appendChild(itemEl(shown));
  }
  // A line that stays still until it is taken down: the creature the player has poked, and the line a broken
  // world shows. It sits where an answer sits, so nothing ever crawls that the player is reading on purpose.
  let pinned = false;
  function pin(text) {
    if (!answerEl) return;
    pinned = true;
    const same = answerEl.dataset.pin === text;
    answerEl.dataset.pin = text;
    // An answer is up: it keeps the space for its moment (frame() puts this line back when it is done).
    if (answerUntil && now() <= answerUntil) return;
    answerUntil = 0;
    if (same && !answerEl.hidden) return;
    answerEl.textContent = '';
    answerEl.appendChild(itemEl({ text, pics: [] }));
    answerEl.hidden = false;
  }
  // An answer's moment ends NOW (5 Oct 2026, her Move: she tapped her house, was told "There is no room there.", tapped open
  // ground, and the refusal stood for the rest of its two seconds over the one who had just landed). The next frame() puts the
  // pinned line back, or the line away, as it does when the moment runs out by itself.
  function endAnswer() { if (answerEl && answerUntil) answerUntil = 1; }
  function unpin() {
    if (!answerEl || !pinned) return;
    pinned = false;
    answerEl.dataset.pin = '';
    answerEl.hidden = true;
  }
  // ---------- Today ----------
  function openToday() {
    if (!todayEl) return;
    todayEl.textContent = '';
    for (let i = today.length - 1; i >= 0; i--) {
      const row = itemEl(today[i]);
      row.className = 'todayRow';
      todayEl.appendChild(row);
    }
    todayEl.hidden = false;
    openedAt = now(); // the click that follows the opening touch must not close it again
  }
  let openedAt = 0;
  const closeToday = () => { if (todayEl) { todayEl.hidden = true; todayEl.textContent = ''; } };

  if (el) {
    let downAt = 0, downX = 0;
    el.addEventListener('pointerdown', (ev) => { held = true; downAt = now(); downX = ev.clientX; });
    const up = (ev) => {
      if (!held) return;
      held = false;
      const quick = now() - downAt < U.tapMs && Math.abs((ev.clientX || downX) - downX) < 12;
      if (quick) (todayEl && !todayEl.hidden ? closeToday() : openToday());
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', () => { held = false; });
  }
  if (todayEl) todayEl.addEventListener('click', () => { if (now() - openedAt > U.tapMs) closeToday(); });

  return {
    add, frame, openToday, closeToday, pin, unpin, endAnswer, answerPics,
    set style(v) { style = v === 'lines' ? 'lines' : 'ticker'; lineUntil = 0; x = 0; if (strip) { strip.dataset.want = ''; strip.style.transform = 'translateX(0px)'; } },
    get style() { return styleNow(); },
    get queued() { return queue.length; },
    get todayList() { return today.slice(); },
    get holding() { return held; },
    // Whether an answer to her finger holds the line right now (his calls of 5 Oct 2026: a new thing waits for her answer's moment,
    // ui/because.js pickTold; it would crawl unseen under it).
    get answering() { return !!(answerUntil && now() <= answerUntil); },
    get room() { return room(); }, // (his calls of 5 Oct 2026: a line told now comes straight on, nothing is pushed off unshown)
    set hurry(v) { hurry = !!v; }, // (his calls of 5 Oct 2026: new things wait their turn, the crawl moves at maxSpeed)
    get hurry() { return hurry; },
    speed,
    // A world cleared or opened: nothing from the old one crawls into the new one.
    clear() { queue.length = 0; today.length = 0; unpin(); x = 0; if (strip) { strip.textContent = ''; strip.dataset.want = ''; } closeToday(); if (answerEl) { answerEl.hidden = true; answerUntil = 0; } },
  };
}
