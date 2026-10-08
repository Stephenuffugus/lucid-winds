/* GATE (H1, D32): no dash, minus sign or ampersand in anything a player reads.
   Walks the text of every state a player can reach (menu fresh and after play, rules, every kind of
   review: exact, timeout, miss, stage clear with a life restored and with lives full, life lost,
   run over; Daily first clear and practice, the share card's canvas text, the share and copy text,
   Endless result, Versus hand off and result, the shop's 120 frames, toasts, alerts and confirms),
   plus aria labels, titles and alt text. Fleet chrome (music card, feedback form) is not Hues copy.
   Run: node satellites/hues/dev/gate-copy.mjs [--plant=lockin]      412x915. */
import { launch, open, close, reporter, plantFromArgs, tap, tapText, startMode, guess, lock, next, playing, setTimeFrac, toMenu, waitFor, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-copy');
const browser = await launch();
const BAD = /[-‐-―−﹘﹣－&]/;
const seen = new Map();   /* text -> first state it was seen in */
const page = await open(browser, { w: 412, h: 915 });
await page.evaluate(() => { const o = window.toast; window.__toasts = []; window.toast = function (m) { window.__toasts.push(String(m)); return o.apply(this, arguments); }; });

async function collect(where) {
  const got = await page.evaluate(() => {
    const roots = ['app', 'rulesOv', 'shareModal', 'toast'].map((id) => document.getElementById(id)).filter(Boolean), out = [];
    const fleet = (el) => el && el.closest && el.closest('#sws-music-card,#sws-music-pill,#sws-music-toast,#sws-music-chip,.lwfb-fab,.lwfb-bg');
    for (const r of roots) {
      const tw = document.createTreeWalker(r, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t && !fleet(n.parentElement)) out.push(t); }
      r.querySelectorAll('[aria-label],[title],[alt],[placeholder]').forEach((el) => { if (fleet(el)) return; for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = el.getAttribute(a); if (v) out.push(v); } });
    }
    return out;
  });
  for (const t of got) if (!seen.has(t)) seen.set(t, where);
}
async function round(how, where) { await playing(page); await guess(page, how); await lock(page); await collect(where); await next(page); }

await collect('menu, fresh');
await tap(page, '#installLink'); await sleep(200);
await tap(page, '[data-mode="daily"]'); await sleep(450); await collect('first run rules'); await tap(page, '#rulesGo');
await playing(page); await collect('Daily round 1');
await tap(page, '#gMenu'); await sleep(200);                                   /* the leave confirm (auto yes) */
await tap(page, '[data-mode="daily"]'); await playing(page);
await round('exact', 'review, exact');
await playing(page); await setTimeFrac(page, 0.001);
await waitFor(page, () => document.getElementById('breakdown').classList.contains('show'), 6000); await sleep(450); await collect('review, timeout'); await next(page);
await round('far', 'review, miss');
await round('close', 'review'); await round('close', 'review, last');
await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(400); await collect('Daily first clear');
await tapText(page, '#resActions', 'Share'); await sleep(700); await collect('share preview');
await tap(page, '#shareTextBtn'); await sleep(200); await tap(page, '#shareImgBtn'); await sleep(250); await tap(page, '#shareSaveBtn'); await sleep(250);
await collect('share toasts'); await tap(page, '#shareCloseBtn'); await sleep(250);
await tapText(page, '#resActions', 'Practice');
for (let i = 0; i < 5; i++) await round('close', 'practice review');
await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(400); await collect('Daily practice result');
await toMenu(page); await collect('menu after play');
await startMode(page, 'endless'); await collect('Endless level 1');
for (const how of ['exact', 'exact', 'far', 'exact', 'exact']) await round(how, 'Endless review, stage 1');
for (let i = 0; i < 5; i++) await round('exact', 'Endless review, stage 2');
for (let i = 0; i < 3; i++) { await playing(page); await guess(page, 'far'); await lock(page); await collect('Endless review, losing'); await next(page); }
await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(400); await collect('Endless result');
await toMenu(page);
await startMode(page, 'versus'); await collect('Versus P1');
for (let i = 0; i < 5; i++) await round('close', 'Versus review');
await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(400); await collect('Versus hand off');
await tapText(page, '#resActions', 'Player 2');
for (let i = 0; i < 5; i++) await round('exact', 'Versus P2 review');
await waitFor(page, () => document.getElementById('result').classList.contains('on'), 6000); await sleep(400); await collect('Versus result');
await toMenu(page);
await tap(page, '#shopLink'); await sleep(500); await collect('shop');
const buy = await page.$('[data-buy]'); if (buy) { await buy.scrollIntoView(); const b = await buy.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(300); await collect('shop after a buy'); }
const extra = await page.evaluate(() => ({ canvas: window.__hues.canvas, clip: window.__hues.clip, shares: window.__hues.shares, alerts: window.__hues.alerts, confirms: window.__hues.confirms, toasts: window.__toasts, title: document.title }));
for (const [k, list] of Object.entries(extra)) for (const t of [].concat(list)) for (const line of String(t).split('\n')) { const s = line.trim(); if (s && !seen.has(s)) seen.set(s, k); }

const bad = [...seen].filter(([t]) => BAD.test(t));
R.t('copy walked: ' + seen.size + ' distinct strings, ' + extra.canvas.length + ' canvas, ' + extra.toasts.length + ' toasts, ' + extra.clip.length + ' copied', seen.size > 150 && extra.canvas.length > 5 && extra.clip.length > 0, 'too little text reached: the walk did not get where it should');
R.t('no dash, minus or ampersand in player copy', bad.length === 0, bad.length + ' strings: ' + bad.slice(0, 14).map(([t, w]) => '"' + t.slice(0, 60) + '" (' + w + ')').join('; '));
for (const [t, w] of bad) console.log('        ' + JSON.stringify(t.slice(0, 90)) + '   (' + w + ')');
R.t('no page errors', page._errors.length === 0, page._errors.slice(0, 3).join(' | '));
await close(page);
await browser.close();
R.done();
