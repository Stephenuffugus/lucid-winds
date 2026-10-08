/* GATE (H1 law): every target a player taps is at least 48x48 CSS px AS RENDERED at 360x640.
   Measured as a HIT REGION, not CSS: for each interactive element the page is probed with
   elementFromPoint along a vertical and a horizontal line through its center, 30px beyond its box,
   and the pixels where the browser answers with that element (or its child) are counted. So a
   pseudo element that grows a tap zone counts, and a target covered by something else does not.
   States: menu, rules, Daily play, review, result, share, Endless play, Versus hand off, shop
   (with things to buy and equip).
   Run: node satellites/hues/dev/gate-touch.mjs [--plant=shrink] */
import { launch, open, close, reporter, plantFromArgs, tap, tapText, startMode, guess, lock, next, playing, playSet, toMenu, waitFor, sleep } from './harness.mjs';

plantFromArgs();
const R = reporter('gate-touch');
const browser = await launch();
const MIN = 47.5;

async function measure(page, where, rootSel, extra = []) {
  const res = await page.evaluate((rootSel, extra) => {
    const root = document.querySelector(rootSel); if (!root) return null;
    const cands = new Set([...root.querySelectorAll('button, a[href], [role=button], input, select, textarea, [onclick], [data-buy], [data-equip]')]);
    for (const s of extra) document.querySelectorAll(s).forEach((e) => cands.add(e));
    const out = [];
    for (const el of cands) {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
      let hidden = false; for (let p = el.parentElement; p; p = p.parentElement) { if (getComputedStyle(p).display === 'none') { hidden = true; break; } } if (hidden) continue;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const own = (n) => !!n && (n === el || el.contains(n));
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2; let h = 0, w = 0;
      for (let y = Math.floor(r.top - 30); y <= Math.ceil(r.bottom + 30); y++) if (y >= 0 && y < innerHeight && own(document.elementFromPoint(cx, y))) h++;
      for (let x = Math.floor(r.left - 30); x <= Math.ceil(r.right + 30); x++) if (x >= 0 && x < innerWidth && own(document.elementFromPoint(x, cy))) w++;
      out.push({ id: el.id || el.getAttribute('data-mode') || el.getAttribute('data-diff') || String(el.className || el.tagName).split(' ')[0], text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 22), w, h });
    }
    return out;
  }, rootSel, extra);
  if (!res) { R.t('360x640 ' + where + ': surface ' + rootSel + ' exists', false); return; }
  const small = res.filter((e) => e.w < MIN || e.h < MIN);
  R.t('360x640 ' + where + ': ' + res.length + ' targets, every hit region at least 48x48', res.length > 0 && small.length === 0,
    res.length ? small.map((e) => e.id + (e.text ? ' "' + e.text + '"' : '') + ' ' + e.w + 'x' + e.h).join('; ') : 'no targets found');
}

let page = await open(browser, { w: 360, h: 640 });
await measure(page, 'menu', '#menu');
await tap(page, '[data-mode="daily"]'); await sleep(450);
await measure(page, 'first run rules', '#rulesOv');
await tap(page, '#rulesGo'); await playing(page);
await measure(page, 'Daily play', '#game', ['#pad', '#strip']);
await guess(page, 'close'); await lock(page);
await measure(page, 'review', '#breakdown');
await next(page);
await playSet(page, ['close', 'close', 'close', 'close']);
await measure(page, 'Daily result', '#result');
await tapText(page, '#resActions', 'Share'); await sleep(600);
await measure(page, 'share preview', '#shareModal');
await tap(page, '#shareCloseBtn'); await sleep(250);
await toMenu(page);
await startMode(page, 'endless');
await measure(page, 'Endless play', '#game', ['#pad', '#strip']);
await toMenu(page);
await startMode(page, 'versus');
await playSet(page, ['close', 'close', 'close', 'close', 'close']);
await measure(page, 'Versus hand off', '#result');
R.t('no page errors (fresh)', page._errors.length === 0, page._errors.slice(0, 3).join(' | '));
await close(page);

page = await open(browser, { w: 360, h: 640, seed: { hues_rules: '1', 'hm.coins': '5000', 'hm.owned': 'hairline,bevel,clay_frog', 'hm.equip': 'bevel' } });
await tap(page, '#shopLink'); await sleep(500);
await measure(page, 'shop with frames to buy and equip', '#shop');
await close(page);
await browser.close();
R.done();
