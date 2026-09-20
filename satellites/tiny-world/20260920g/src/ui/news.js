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
import { url } from '../art/sprites.js';

export function createNews({ data, mode = 'ticker', now = () => performance.now() }) {
  const el = document.getElementById('info'), strip = document.getElementById('newsStrip');
  const answerEl = document.getElementById('answer'), todayEl = document.getElementById('today');
  const U = data.ui.news;
  const queue = []; // what has not gone past yet
  const today = []; // the last U.todayMax, newest last
  let x = 0, held = false, answerUntil = 0, lineUntil = 0, reduced = false, style = mode;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduced = false; }

  const styleNow = () => (reduced ? 'lines' : style);
  const speed = () => { // px a second, at the width this phone actually is
    const w = el ? el.clientWidth || U.baseWidth : U.baseWidth;
    return Math.min(U.maxSpeed, U.speed * (w / U.baseWidth));
  };

  // A sentence to show. `pics` is a list of { spr, over } (the Because triple), `answer` marks a reply to the
  // player's own action, which never waits and never crawls.
  function add(text, pics, answer) {
    if (!text) return;
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
  function itemEl(item) {
    const d = document.createElement('span');
    d.className = 'newsItem';
    for (const p of item.pics) {
      if (!p || !p.spr) continue;
      const im = new Image();
      im.src = url(p.spr, p.over || undefined);
      im.alt = '';
      d.appendChild(im);
    }
    d.appendChild(document.createTextNode(item.text));
    return d;
  }
  // Called every frame with the seconds since the last one.
  function frame(dt) {
    if (!el) return;
    if (answerEl && answerUntil && !pinned && now() > answerUntil) { answerEl.hidden = true; answerUntil = 0; }
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
  function showAnswer(item) {
    if (!answerEl || pinned) return; // a pinned line (the creature being looked at) owns the space while it is up
    answerEl.textContent = '';
    answerEl.appendChild(itemEl(item));
    answerEl.hidden = false;
    answerUntil = now() + U.answerMs;
  }
  // A line that stays still until it is taken down: the creature the player has poked, and the line a broken
  // world shows. It sits where an answer sits, so nothing ever crawls that the player is reading on purpose.
  let pinned = false;
  function pin(text) {
    if (!answerEl) return;
    pinned = true;
    answerUntil = 0;
    if (answerEl.dataset.pin === text) return;
    answerEl.dataset.pin = text;
    answerEl.textContent = '';
    answerEl.appendChild(itemEl({ text, pics: [] }));
    answerEl.hidden = false;
  }
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
    add, frame, openToday, closeToday, pin, unpin,
    set style(v) { style = v === 'lines' ? 'lines' : 'ticker'; lineUntil = 0; x = 0; if (strip) { strip.dataset.want = ''; strip.style.transform = 'translateX(0px)'; } },
    get style() { return styleNow(); },
    get queued() { return queue.length; },
    get todayList() { return today.slice(); },
    get holding() { return held; },
    speed,
    // A world cleared or opened: nothing from the old one crawls into the new one.
    clear() { queue.length = 0; today.length = 0; unpin(); x = 0; if (strip) { strip.textContent = ''; strip.dataset.want = ''; } closeToday(); if (answerEl) { answerEl.hidden = true; answerUntil = 0; } },
  };
}
