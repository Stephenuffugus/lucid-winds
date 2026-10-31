/* The layout gate (BUILD-PLAN.md T0.9, gate `layout`): the play screen at 412x915, 390x844, 360x780 and 320x568, in
 * the default and the mirrored strip, measured against section 1.5's rules computed HERE:
 *   - the canvas CSS width is 384 (768 only where 2x fits) when the viewport is 384 or wider, else innerWidth;
 *   - the backing store is 384 x VIEW_ROWS*16 and VIEW_ROWS = clamp(floor((h - 36 - 168) / 16), 20, 40)
 *     (40 at 412 and 390, 36 at 360, 22 at 320x568);
 *   - the top strip is 36 px; the control strip at least 168 and takes the spare height;
 *   - the rocker zones, A and B at least 56 px, the gap at least 16, none over the canvas or the reserved box;
 *   - every other control on the play screen at least 48 px and on top at its centre; the title's exit too;
 *   - the reserved box (412, 390, 360; released at 320): the bottom left 120x120, transparent, borderless, textless,
 *     the top hit at its centre and corners;
 *   - the fleet's chip, from the real /music-unlocks.js: on the title its rect is printed and it is on top and clear of
 *     the title's controls; in a room it is hidden (Q48's addendum, since sb-m0-2: the plan's "inside the reserved box
 *     in play" became "hidden in play" once the chip's saved drag was found to land anywhere);
 *   - landscape 800x360 with a coarse pointer: the rotate card, and five elementFromPoint probes all land on it; a fine
 *     pointer gets no card.
 * The bottom bar (Stephen's note 1 of 31 Oct, QUESTIONS Q90): the installed arcade app's window on Android is drawn under
 * the phone's 48 px button bar with env(safe-area-inset-bottom) at 0, so shell-navpad marks the page .navpad and --sab
 * becomes max(env, 48px):
 *   - a plain tab (the size loop above) is never marked, every rule that reads --sab holds its env 0 value, and the drawn
 *     rocker zones, A and B end 10 px above the bottom, as before the floor;
 *   - under a 48 px inset the phone reports (CDP Emulation.setSafeAreaInsetsOverride) and under ?navpad with env 0, at
 *     the four sizes: the title and Settings scrolled to their end, the crop screen's Retake and Develop, play's drawn
 *     controls, its Title and Share, and every card and sheet end 48 px or more above the bottom; VIEW_ROWS =
 *     clamp(floor((h - 48 - 36 - 168) / 16), 20, 40) (40, 37, 33 and 20);
 *   - ?navpad with env 48: the floor never adds (every rule at its 48 px value, the glyphs 58 px up); with env 60 the
 *     reported inset wins (every rule at 60); an Android app window (the UA, and a display-mode double: headless Chrome
 *     opens no app window) in each display mode the head test names is marked; an Android tab and a desktop app window
 *     are not, and keep the env 0 layout; on the clear card the fleet's chip in its bottom seat ends 10 px over the
 *     inset or the floor, as the strip's glyphs do (never 10 over both);
 *   - under the mark (the reviews of NOTE1, QUESTIONS Q91): the title and Settings as they open, and the title after a
 *     room, draw no control in the bottom 48 px (they end above the bar); the fleet's chip, as each screen shows (the
 *     page reseats it at once), on the title, on Settings and on the title after a room ends 48 px or more up, on top
 *     and clear of the screen's controls, and on the clear card it takes its bottom seat in the reserved box 58 px up; a
 *     song card waiting from another game opens with Play it now and Later 48 px or more up, and its pill too.
 * Watched red by CANVAS_100PCT, A_44PX, RESERVE_FILLED, MIRROR_OVERLAPS_CANVAS, and for the bottom bar NAVPAD_MARK_REMOVED,
 * NAVPAD_FLOOR_DROPPED, STRIP_IGNORES_SAB, NAVPAD_BLANKET, NAVPAD_FLOOR_ADDS, NAVPAD_ANY_ANDROID, NAVPAD_ANY_WINDOW,
 * FIT_IGNORES_SAB, NAVPAD_ENV_DROPPED, NAVPAD_NO_FULLSCREEN, NAVPAD_NO_MINIMAL_UI, SCROLLERS_PAD_PAST_BAR, CHIP_LIFT_DROPPED,
 * PILL_LIFT_DROPPED, CARD_LIFT_DROPPED, CHIP_LIFT_ADDS, CHIPSILL_DROPPED and CHIP_SEAT_LATE. */
import { join } from 'node:path';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, GAME } from './harness.mjs';

const R = reporter('LAYOUT');
const srv = await serve();
const browser = await launch();
const TOP = 36, CTRL = 168, CELL = 16, ROWS_MIN = 20, ROWS_MAX = 40, WORLD = 384, RES = 120;
const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/* the bottom bar (Q90): the floor is 48 px, the strip's drawn controls sit 10 px over the inset (#rocker, .verb), and
   each rule that reads --sab computes to a known bottom padding under an inset (or the floor) of `lift` px */
const BAR = 48, GLYPH_LIFT = 10;
const PADS_AT = lift => ({ probe: lift, title: 16 + lift, settings: 16 + lift, crop: lift, strip: lift, rocker: GLYPH_LIFT + lift, verb: GLYPH_LIFT + lift });
const padsAre = (p, lift) => Object.entries(PADS_AT(lift)).every(([k, v]) => Math.abs(p[k] - v) < 0.5);
const padsText = p => Object.entries(p).map(([k, v]) => k + ' ' + v).join(', ');
const wantRowsAt = (h, lift) => Math.max(ROWS_MIN, Math.min(ROWS_MAX, Math.floor((h - lift - TOP - CTRL) / CELL)));
/* page side, installed once per page: every --sab rule's computed bottom padding (for the title and Settings, the
   padding plus the screen's own bottom offset: how far their last control sits above the bottom at the end of a
   scroll, since under the mark they end above the bar and pad 16, Q91), and how far each drawn strip control (the
   rocker's two zones, B's and A's glyphs) ends above the screen bottom */
const installProbes = page => page.evaluate(() => {
  const px = (sel, prop) => parseFloat(getComputedStyle(document.querySelector(sel))[prop]);
  const end = sel => px(sel, 'paddingBottom') + px(sel, 'bottom');
  window.__pads = () => ({ probe: px('#safeprobe', 'paddingBottom'), title: end('#title'), settings: end('#settings'),
    crop: px('#crop', 'paddingBottom'), strip: px('#strip', 'paddingBottom'), rocker: px('#rocker', 'paddingBottom'), verb: px('#btnA', 'paddingBottom') });
  window.__glyphGaps = () => ['#rocker .zl', '#rocker .zr', '#btnB .glyph', '#btnA .glyph'].map(s => innerHeight - document.querySelector(s).getBoundingClientRect().bottom);
  const CTRL = 'button, a, input, select, textarea', nameOf = e => e.id || e.getAttribute('aria-label') || e.tagName;
  const shown = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  /* the bottom `bar` px of the screen showing, as it stands (no scroll): every control whose visible part (clipped by
     the screen, a scroller) reaches into them, and every control a thumb there lands on */
  window.__band = bar => {
    const H = innerHeight, W = innerWidth, scr = document.querySelector('.screen.on'), sb = scr.getBoundingClientRect(), out = [];
    for (const e of scr.querySelectorAll(CTRL)) {
      if (!shown(e)) continue;
      const r = e.getBoundingClientRect(), t = Math.max(r.top, sb.top), b = Math.min(r.bottom, sb.bottom, H);
      if (b - t >= 1 && b > H - bar + 0.5) out.push(nameOf(e) + ' drawn ' + t.toFixed(0) + '-' + b.toFixed(0));
    }
    for (const fx of [0.05, 0.25, 0.5, 0.75, 0.95]) for (const dy of [2, bar / 2, bar - 2]) {
      const t = document.elementFromPoint(fx * W, H - dy), c = t && t.closest && t.closest(CTRL);
      if (c && scr.contains(c)) out.push('a thumb at ' + (fx * W).toFixed(0) + ',' + (H - dy).toFixed(0) + ' lands on ' + nameOf(c));
    }
    return out;
  };
  /* the fleet's chip: how far it ends above the bottom, its seat, whether a thumb at its centre lands on it, and which
     of the showing screen's controls it covers */
  window.__chip = () => {
    const c = document.getElementById('sws-music-chip');
    if (!c || getComputedStyle(c).display === 'none') return null;
    const r = c.getBoundingClientRect(), scr = document.querySelector('.screen.on'), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const covers = [...scr.querySelectorAll(CTRL)].filter(e => { if (!shown(e)) return false; const b = e.getBoundingClientRect(); return b.left < r.right && r.left < b.right && b.top < r.bottom && r.top < b.bottom; }).map(nameOf);
    const seat = c.getAttribute('data-corner') || '';
    return { gap: innerHeight - r.bottom, box: [r.left, r.top, r.width, r.height].map(v => v.toFixed(0)).join(','), bottomSeat: /bottom:/.test(seat), onTop: !!t && (t === c || c.contains(t)), covers };
  };
});
/* the chip once the include has placed it: as it stands at once (under the mark the page reseats it as a screen
   shows, Q91), or reseated first by the include's own probe hook (what its timers do 1.5 s after a tap) */
const chipNow = (page, reseat = false) => page.waitForFunction(() => !!document.getElementById('sws-music-chip'), { timeout: 8000 }).then(() => true).catch(() => false)
  .then(ok => ok ? page.evaluate(r => { if (r && window.SWSMusic && window.SWSMusic.reseat) window.SWSMusic.reseat(); return window.__chip(); }, reseat) : null);
const chipText = c => c ? 'ends ' + c.gap.toFixed(0) + ' px above the bottom (' + c.box + (c.bottomSeat ? ', a bottom seat' : '') + ')' + (c.onTop ? '' : ', NOT on top') + (c.covers.length ? ', over ' + c.covers.join(', ') : '') : 'is not shown';
const chipClear = (c, bar) => !!c && c.gap >= bar - 0.5 && c.onTop && c.covers.length === 0;

try {
  for (const [w, h] of [[412, 915], [390, 844], [360, 780], [320, 568]]) {
    const tag = w + 'x' + h;
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base);
    await ready(page);
    await installProbes(page);

    /* the title: the exit control, and the fleet chip once it arrives */
    await page.waitForFunction(() => !!document.getElementById('sws-music-chip'), { timeout: 8000 }).catch(() => {});
    await sleep(300);
    const title = await page.evaluate(() => {
      const box = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
      const topAt = el => { const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (t === el || el.contains(t)); };
      const exit = document.getElementById('exit'), chip = document.getElementById('sws-music-chip');
      const ctrls = [...document.querySelectorAll('#title button, #title a')].filter(e => getComputedStyle(e).display !== 'none').map(box);
      return { exit: box(exit), exitTop: topAt(exit), chip: chip && getComputedStyle(chip).display !== 'none' ? box(chip) : null, chipTop: chip ? topAt(chip) : false, ctrls };
    });
    R.say(title.exit.w >= 48 && title.exit.h >= 48 && title.exitTop, tag + ': the exit control is ' + title.exit.w.toFixed(0) + 'x' + title.exit.h.toFixed(0) + ' and on top');
    if (title.chip) {
      const clear = title.ctrls.every(c => !overlap(c, title.chip));
      console.log('  info  ' + tag + ': the fleet chip on the title at ' + [title.chip.x, title.chip.y, title.chip.w, title.chip.h].map(v => v.toFixed(0)).join(',') + (title.chipTop ? ', on top' : ', NOT on top'));
      R.say(title.chipTop && clear, tag + ': on the title the fleet chip is on top and clear of the title\'s controls');
    } else console.log('  info  ' + tag + ': no fleet chip on the title (the catalogue did not place one)');

    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    for (const mirror of [false, true]) {
      const tg = tag + (mirror ? ' mirrored' : '');
      const m = await page.evaluate(mir => {
        document.getElementById('strip').classList.toggle('mirror', mir);
        const box = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
        const q = s => document.querySelector(s), cv = q('#view'), res = q('#reserve'), cs = getComputedStyle(res);
        const topIs = (el, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === el || el.contains(t)); };
        const rb = res.getBoundingClientRect(), resShown = cs.display !== 'none' && rb.width > 0;
        const corners = resShown ? [[rb.left + 2, rb.top + 2], [rb.right - 2, rb.top + 2], [rb.left + 2, rb.bottom - 2], [rb.right - 2, rb.bottom - 2], [rb.left + rb.width / 2, rb.top + rb.height / 2]] : [];
        const chip = q('#sws-music-chip');
        return {
          mark: document.documentElement.classList.contains('navpad'), pads: window.__pads(), glyphGaps: window.__glyphGaps(),
          vw: window.innerWidth, vh: window.innerHeight, cssW: cv.getBoundingClientRect().width, bw: cv.width, bh: cv.height,
          rows: window.SB_DEV.level().viewRows, canvas: box(cv), top: box(q('#top')), strip: box(q('#strip')),
          zl: box(q('#rocker .zl')), zr: box(q('#rocker .zr')), gap: box(q('#rocker .gap')), rocker: box(q('#rocker')),
          A: box(q('#btnA')), B: box(q('#btnB')), back: box(q('#back')), backTop: topIs(q('#back'), q('#back').getBoundingClientRect().left + 24, q('#back').getBoundingClientRect().top + 24),
          res: resShown ? box(res) : null, resClear: resShown ? cs.backgroundColor === 'rgba(0, 0, 0, 0)' && parseFloat(cs.borderTopWidth) === 0 && res.textContent === '' : true,
          resTop: corners.every(([x, y]) => topIs(res, x, y)),
          chipShown: !!chip && getComputedStyle(chip).display !== 'none'
        };
      }, mirror);
      const wantW = m.vw >= WORLD ? WORLD : m.vw;
      const wantRows = Math.max(ROWS_MIN, Math.min(ROWS_MAX, Math.floor((m.vh - TOP - CTRL) / CELL)));
      R.say(Math.abs(m.cssW - wantW) < 0.5, tg + ': the canvas is ' + m.cssW.toFixed(1) + ' CSS px wide (want ' + wantW + ')');
      R.say(m.bw === WORLD && m.bh === m.rows * CELL && m.rows === wantRows, tg + ': the backing store is ' + m.bw + 'x' + m.bh + ', VIEW_ROWS ' + m.rows + ' (the formula gives ' + wantRows + ')');
      R.say(Math.abs(m.top.h - TOP) < 0.5 && m.strip.h >= CTRL - 0.5 && Math.abs(m.top.h + m.canvas.h + m.strip.h - m.vh) < 1.5,
        tg + ': the top strip ' + m.top.h.toFixed(0) + ' px, the control strip ' + m.strip.h.toFixed(0) + ' px (168 or more, the spare height), filling the ' + m.vh + ' px screen');
      /* the bottom bar floor (Q90) costs a plain tab nothing: no mark, every --sab rule at its env 0 value, the glyphs
         where they were before it */
      R.say(!m.mark && padsAre(m.pads, 0), tg + ': a plain tab is not marked .navpad and every rule that reads --sab holds its env 0 value (' + padsText(m.pads) + ')');
      R.say(m.glyphGaps.every(g => Math.abs(g - GLYPH_LIFT) < 0.5), tg + ': the drawn rocker zones, A and B sit ' + m.glyphGaps.map(g => g.toFixed(0)).join(', ') + ' px above the screen bottom, 10 as before the floor');
      const verbs = { 'left zone': m.zl, 'right zone': m.zr, A: m.A, B: m.B };
      for (const [name, b] of Object.entries(verbs)) {
        R.say(b.w >= 56 - 0.5 && b.h >= 56 - 0.5, tg + ': ' + name + ' measures ' + b.w.toFixed(0) + 'x' + b.h.toFixed(0) + ' (56 or more)');
        R.say(!overlap(b, m.canvas) && (!m.res || !overlap(b, m.res)), tg + ': ' + name + ' is clear of the canvas' + (m.res ? ' and the reserved box' : ''));
      }
      R.say(m.gap.w >= 16 - 0.5, tg + ': the rocker\'s gap is ' + m.gap.w.toFixed(0) + ' px (16 or more)');
      R.say(!overlap(m.rocker, m.canvas) && !overlap(m.A, m.B) && !overlap(m.A, m.rocker) && !overlap(m.B, m.rocker), tg + ': the rocker, A and B are disjoint and clear of the canvas');
      R.say(m.back.w >= 48 && m.back.h >= 48 && m.backTop, tg + ': Title is ' + m.back.w.toFixed(0) + 'x' + m.back.h.toFixed(0) + ' and on top');
      if (w >= 360) {
        R.say(!!m.res && Math.abs(m.res.x) < 0.5 && Math.abs(m.res.w - RES) < 0.5 && Math.abs(m.res.h - RES) < 0.5 && Math.abs(m.res.y + m.res.h - m.vh) < 0.5,
          tg + ': the reserved box is the bottom left 120x120 (' + (m.res ? [m.res.x, m.res.y, m.res.w, m.res.h].map(v => v.toFixed(0)).join(',') : 'missing') + ')');
        R.say(m.resClear && m.resTop, tg + ': the reserved box is transparent, borderless and textless, and the top hit at its centre and corners');
      } else R.say(!m.res, tg + ': under 360 the reserved box is released (hidden)');
      R.say(!m.chipShown, tg + ': in a room the fleet chip is hidden (Q48\'s addendum)');
    }
    R.say(errors.length === 0, tag + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the bottom bar (Stephen's note 1 of 31 Oct, QUESTIONS Q90). Opened from the installed arcade app on Android, the game
     runs in the app's window, which Android draws under its 48 px button bar while env(safe-area-inset-bottom) reads 0;
     shell-navpad marks the page .navpad there and --sab is floored at 48. Each condition is a fresh profile (what the
     title shows depends on the save). Under a 48 px inset the phone reports (the CDP override) and under the mark with
     env 0, every screen's controls end 48 px or more above the screen bottom: the title and Settings scrolled to their
     end (both scroll on a short phone), the crop screen's Retake and Develop, play's drawn rocker zones, A and B (their
     hit areas run the strip's full height by design), and each card and sheet (shown by its class for the measure, a
     layout liberty: the cards' own gates open them by real input). The stage gives up rows to the floor by the formula.
     Under the mark (the reviews of NOTE1, Q91) the title and Settings as they open and the title after a room draw
     nothing under the bar at scroll 0, and the fleet's chip on each of them and on the clear card is over the bar and
     clear of the screen's controls. */
  {
    const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36';
    const PHOTO = join(GAME, 'icons', 'icon-512.png');   /* any photo opens the crop screen; this one is in the repo */
    const insetOf = b => ({ top: 0, topMax: 0, left: 0, leftMax: 0, right: 0, rightMax: 0, bottom: b, bottomMax: b });
    const openAs = async (w, h, { inset = 0, query = '', ua = null, mode = null, seedSong = false } = {}) => {
      const ctx = await browser.createBrowserContext();
      const { page, errors } = await newPage(ctx, { width: w, height: h });
      const cdp = await page.createCDPSession();
      if (inset) await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: insetOf(inset) });
      if (ua) await page.setUserAgent(ua);
      /* headless Chrome opens no app window (it has no PWA domain, and setEmulatedMedia takes display-mode and ignores
         it: measured 31 Oct), so the display mode is a double installed before the page's scripts: a display-mode query
         answers whether it names `mode`, with a real MediaQueryList ('all' or 'not all'); any other query is Chrome's */
      if (mode) await page.evaluateOnNewDocument(mode => {
        const real = window.matchMedia.bind(window);
        window.matchMedia = q => /display-mode/.test(q) ? real(q.split(',').some(p => p.indexOf('display-mode: ' + mode) >= 0) ? 'all' : 'not all') : real(q);
      }, mode);
      /* a song another arcade game unlocked mid round waits in the include's pending list (its own key and shape) */
      if (seedSong) await page.evaluateOnNewDocument(() => {
        try { if (!sessionStorage.getItem('sb-seeded')) { sessionStorage.setItem('sb-seeded', '1');
          localStorage.setItem('sws_music_pending_reveal', JSON.stringify([{ id: 'sb-layout-song', title: 'A Song From Another Game', game: 'Another Game' }])); } } catch (e) {}
      });
      await gotoGame(page, srv.base, query);
      await ready(page);
      await installProbes(page);
      return { page, errors, cdp, close: () => ctx.close() };
    };
    /* every visible match of sel, lowest first, with how far it ends above the screen bottom */
    const low = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; })
      .map(e => ({ id: e.id || e.className, gap: innerHeight - e.getBoundingClientRect().bottom })).sort((a, b) => a.gap - b.gap), sel);
    const scrollEnd = (page, id) => page.evaluate(id => { const el = document.getElementById(id); el.scrollTop = el.scrollHeight; return el.scrollHeight > el.clientHeight; }, id);
    const lowText = list => list.slice(0, 2).map(c => c.id + ' ' + c.gap.toFixed(0)).join(', ');
    const errs = s => s.errors.length ? ' (' + s.errors.join(' ; ') + ')' : '';
    const markOf = page => page.evaluate(() => ({ mark: document.documentElement.classList.contains('navpad'), cls: document.documentElement.className, pads: window.__pads() }));
    const markText = (want, t) => (want ? 'the page is marked .navpad' : 'the page is not marked') + ' (the root\'s class: "' + t.cls + '")';
    const bandSay = async (page, tg, what) => {
      const band = await page.evaluate(b => window.__band(b), BAR);
      R.say(band.length === 0, tg + ': ' + what + ' draws no control in the bottom 48 px' + (band.length ? ' (' + band.slice(0, 3).join('; ') + ')' : ''));
    };

    for (const [w, h] of [[412, 915], [390, 844], [360, 780], [320, 568]]) {
      for (const cond of [{ label: 'env 48 (a phone that reports its bar)', inset: BAR }, { label: 'the app mark (?navpad, env 0)', query: 'navpad' }]) {
        const tg = w + 'x' + h + ' ' + cond.label, marked = !!cond.query;
        const s = await openAs(w, h, cond), page = s.page;
        const t0 = await markOf(page);
        R.say(t0.mark === marked, tg + ': ' + markText(marked, t0));
        R.say(padsAre(t0.pads, BAR), tg + ': every rule that reads --sab holds its 48 px value (' + padsText(t0.pads) + ')');
        /* under the mark, the title as it opens: nothing drawn under the bar, and the fleet's chip over it and clear of
           the title (Q91) */
        if (marked) {
          await bandSay(page, tg, 'the title as it opens');
          const chip = await chipNow(page);
          R.say(chipClear(chip, BAR), tg + ': on the title the fleet\'s chip ' + chipText(chip) + ', 48 or more, on top and clear of the title\'s controls');
        }
        /* the title and Settings, each scrolled to its end */
        const titleScrolls = await scrollEnd(page, 'title');
        const title = await low(page, '#title button, #title a, #title input, #build');
        R.say(title.length > 0 && title[0].gap >= BAR - 0.5, tg + ': the title' + (titleScrolls ? ', scrolled to its end,' : '') + ' ends every control and the build line 48 px or more above the bottom (lowest: ' + lowText(title) + ')');
        await tap(page, '#settingsbtn');
        if (marked) {
          await bandSay(page, tg, 'Settings as it opens');
          const chip = await chipNow(page);
          R.say(chipClear(chip, BAR), tg + ': on Settings the fleet\'s chip ' + chipText(chip) + ', 48 or more, on top and clear of Settings\' controls');
        }
        const setScrolls = await scrollEnd(page, 'settings');
        const settings = await low(page, '#settings button, #settings input, #settings select, #settings textarea, #setbuild');
        R.say(settings.length > 0 && settings[0].gap >= BAR - 0.5, tg + ': Settings' + (setScrolls ? ', scrolled to its end,' : '') + ' ends every control and the build line 48 px or more above the bottom (lowest: ' + lowText(settings) + ')');
        await page.evaluate(() => { document.getElementById('settings').scrollTop = 0; });
        await tap(page, '#settitle');
        /* the crop screen, from a real file through Choose a photo */
        await (await page.$('#filechoose')).uploadFile(PHOTO);
        const onCrop = await page.waitForFunction(() => window.SB_DEV.screen() === 'crop', { timeout: 20000 }).then(() => true).catch(() => false);
        const crop = onCrop ? await low(page, '#retake, #develop') : [];
        R.say(onCrop && crop.length === 2 && crop.every(c => c.gap >= BAR - 0.5), tg + ': on the crop screen Retake and Develop end ' + (crop.map(c => c.id + ' ' + c.gap.toFixed(0)).join(', ') || 'nowhere (no crop screen)') + ' px above the bottom (48 or more)');
        if (onCrop) await tap(page, '#croptitle');
        /* play: the sample room, held */
        await page.evaluate(() => { window.SB_DEV.hold(true); document.getElementById('title').scrollTop = 0; });
        await tap(page, '#sample');
        const p = await page.evaluate(() => {
          const b = s => document.querySelector(s).getBoundingClientRect().height;
          return { glyphs: window.__glyphGaps(), rows: window.SB_DEV.level().viewRows, vh: innerHeight, top: b('#top'), canvas: b('#view'), strip: b('#strip') };
        });
        R.say(p.glyphs.every(g => g >= BAR - 0.5), tg + ': the drawn rocker zones, A and B end ' + p.glyphs.map(g => g.toFixed(0)).join(', ') + ' px above the bottom (48 or more)');
        const wantR = wantRowsAt(h, BAR);
        R.say(p.rows === wantR && Math.abs(p.top + p.canvas + p.strip - p.vh) < 1.5 && (p.strip >= CTRL + BAR - 0.5 || p.rows === ROWS_MIN),
          tg + ': VIEW_ROWS ' + p.rows + ' (the formula with the 48 px floor gives ' + wantR + '), the control strip ' + p.strip.toFixed(0) + ' px (216 or more unless the rows sit at their floor), filling the screen');
        const strip = await low(page, '#back, #share');
        R.say(strip.length === 2 && strip.every(c => c.gap >= BAR - 0.5), tg + ': the strip\'s Title and Share end ' + strip.map(c => c.id + ' ' + c.gap.toFixed(0)).join(', ') + ' px above the bottom');
        const cards = await page.evaluate(() => {
          const o = [];
          for (const [id, cls] of [['clear'], ['death'], ['death', 'low'], ['sharesheet'], ['devcard']]) {
            const el = document.getElementById(id); el.classList.add('on'); if (cls) el.classList.add(cls);
            const box = (id === 'devcard' ? document.getElementById('devtap') : el).getBoundingClientRect();
            o.push({ id: id + (cls ? '.' + cls : ''), gap: innerHeight - box.bottom });
            el.classList.remove('on'); if (cls) el.classList.remove(cls);
          }
          return o.sort((a, b) => a.gap - b.gap);
        });
        R.say(cards.every(c => c.gap >= BAR - 0.5), tg + ': every card and sheet ends 48 px or more above the bottom (lowest: ' + lowText(cards) + ')');
        /* under the mark, the room cleared (the hero set down in its exit, SB_DEV.goto): the chip on the clear card, where
           its bottom seat is the strip's reserved box (reseated first, as the include's timers do in a room: this flow
           clears in about a second), then by a real touch on Title, at once, the title after a room, which shows the code
           row and a recent room and runs to the fold on a short phone (Q91) */
        if (marked) {
          await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(3); });
          const cleared = await page.evaluate(() => window.SB_DEV.screen()) === 'clear';
          const chipC = cleared ? await chipNow(page, true) : null;
          R.say(cleared && chipClear(chipC, BAR) && chipC.bottomSeat && Math.abs(chipC.gap - (GLYPH_LIFT + BAR)) < 0.5,
            tg + ': on the clear card the fleet\'s chip ' + chipText(chipC) + ' (want its bottom seat, the reserved box, 58 px up), on top and clear of the card');
          if (cleared) await tap(page, '#cleartitle');
          await bandSay(page, tg, 'the title after a room');
          const chipA = await chipNow(page);
          R.say(chipClear(chipA, BAR), tg + ': at once on the title after a room the fleet\'s chip ' + chipText(chipA) + ', 48 or more, on top and clear of the title\'s controls');
        }
        R.say(s.errors.length === 0, tg + ': zero page errors' + errs(s));
        await s.close();
      }
    }

    /* a song earned in another arcade game waits in the include's pending list and its card opens at the next boot of
       any game, this one included (music-unlocks.js reveals before it checks for a shelf): under the mark the card
       opens with Play it now and Later over the bar, and its pill, folded by a real touch, sits over it too (Q91) */
    for (const [w, h] of [[412, 915], [320, 568]]) {
      const tg = w + 'x' + h + ' the app mark (?navpad, env 0)';
      const s = await openAs(w, h, { query: 'navpad', seedSong: true }), page = s.page;
      const card = await page.waitForFunction(() => !!document.getElementById('sws-music-later'), { timeout: 10000 }).then(() => true).catch(() => false);
      const m = card ? await page.evaluate(() => { const g = s => innerHeight - document.querySelector(s).getBoundingClientRect().bottom; return { card: g('#sws-music-card'), listen: g('#sws-music-listen'), later: g('#sws-music-later') }; }) : null;
      R.say(!!m && m.card >= BAR - 0.5 && m.listen >= BAR - 0.5 && m.later >= BAR - 0.5, tg + ': a song waiting from another game opens its card ' + (m ? 'ending ' + m.card.toFixed(0) + ' px above the bottom, Play it now and Later ' + m.listen.toFixed(0) + ' and ' + m.later.toFixed(0) : 'nowhere (no card)') + ' (48 or more)');
      if (card) await tap(page, '#sws-music-min');
      const pill = card ? await page.waitForFunction(() => { const p = document.getElementById('sws-music-pill'); return p && getComputedStyle(p).display !== 'none' ? innerHeight - p.getBoundingClientRect().bottom : false; }, { timeout: 4000 }).then(v => v.jsonValue()).catch(() => null) : null;
      R.say(pill !== null && pill >= BAR - 0.5, tg + ': folded by a real touch, the song\'s pill ends ' + (pill === null ? 'nowhere (no pill)' : pill.toFixed(0) + ' px above the bottom') + ' (48 or more)');
      R.say(s.errors.length === 0, tg + ' with a song waiting: zero page errors' + errs(s));
      await s.close();
    }

    /* the floor never adds to an inset the phone reports and yields to a larger one, and the mark is the installed
       app's on Android alone, in each display mode the head test names: a browser tab on Android and an app window on
       a desktop are left as they were. On the clear card the fleet's chip in its bottom seat ends 10 px over the bar,
       as the glyphs do */
    for (const [w, h] of [[412, 915], [360, 780]]) {
      for (const c of [
        { label: 'the app mark with env 48 (the floor never adds to it)', query: 'navpad', inset: BAR, mark: true, lift: BAR },
        { label: 'the app mark with env 60 (a reported inset over the floor wins)', query: 'navpad', inset: 60, mark: true, lift: 60 },
        { label: 'an Android app window (display mode standalone, env 0)', ua: ANDROID_UA, mode: 'standalone', mark: true, lift: BAR },
        { label: 'an Android app window (display mode fullscreen, env 0)', ua: ANDROID_UA, mode: 'fullscreen', mark: true, lift: BAR, at412: true },
        { label: 'an Android app window (display mode minimal-ui, env 0)', ua: ANDROID_UA, mode: 'minimal-ui', mark: true, lift: BAR, at412: true },
        { label: 'an Android tab (display mode browser, env 0)', ua: ANDROID_UA, mark: false, lift: 0 },
        { label: 'a desktop app window (display mode standalone, not Android)', mode: 'standalone', mark: false, lift: 0 }
      ].filter(c => !c.at412 || w === 412)) {
        const tg = w + 'x' + h + ' ' + c.label;
        const s = await openAs(w, h, c), page = s.page;
        const t = await markOf(page);
        await page.evaluate(() => window.SB_DEV.hold(true));
        await tap(page, '#sample');
        const g = await page.evaluate(() => ({ glyphs: window.__glyphGaps(), rows: window.SB_DEV.level().viewRows }));
        const want = GLYPH_LIFT + c.lift, wantR = wantRowsAt(h, c.lift);
        R.say(t.mark === c.mark, tg + ': ' + markText(c.mark, t));
        R.say(padsAre(t.pads, c.lift) && g.glyphs.every(v => Math.abs(v - want) < 0.5) && g.rows === wantR,
          tg + ': every rule that reads --sab holds its ' + c.lift + ' px value (' + padsText(t.pads) + '), the drawn controls end ' + g.glyphs.map(v => v.toFixed(0)).join(', ') + ' px up (want ' + want + '), VIEW_ROWS ' + g.rows + ' (want ' + wantR + ')');
        await page.evaluate(() => { window.SB_DEV.goto('exit'); window.SB_DEV.step(3); });
        const chip = await page.evaluate(() => window.SB_DEV.screen()) === 'clear' ? await chipNow(page, true) : null;
        R.say(!!chip && chip.bottomSeat && Math.abs(chip.gap - want) < 0.5, tg + ': on the clear card the fleet\'s chip ' + chipText(chip) + ' (want a bottom seat ' + want + ' px up, 10 over the bar as the glyphs)');
        R.say(s.errors.length === 0, tg + ': zero page errors' + errs(s));
        await s.close();
      }
    }
  }

  /* a phone turned sideways mid room: under the rotate card the loop holds (nothing moves, no moth comes), and
     turned back it runs on (the fourth review: the moths kept coming behind the card) */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915, touch: true, dpr: 3 });
    await gotoGame(page, srv.base); await ready(page);
    await tap(page, '#sample');
    await new Promise(r => setTimeout(r, 2500));   /* past the develop reveal (at most 1.6 s) */
    const f0 = await page.evaluate(() => window.SB_DEV.frames());
    await new Promise(r => setTimeout(r, 300));
    const fA = await page.evaluate(() => window.SB_DEV.frames());
    await page.setViewport({ width: 915, height: 412, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    await new Promise(r => setTimeout(r, 300));
    const s1 = await page.evaluate(() => ({ f: window.SB_DEV.frames(), card: getComputedStyle(document.getElementById('rotate')).display !== 'none' }));
    await new Promise(r => setTimeout(r, 700));
    const f2 = await page.evaluate(() => window.SB_DEV.frames());
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    await new Promise(r => setTimeout(r, 500));
    const f3 = await page.evaluate(() => window.SB_DEV.frames());
    R.say(fA > f0 && s1.card && f2 === s1.f && f3 > f2, 'turned sideways mid room the loop holds under the rotate card (running before: ' + f0 + ' to ' + fA + '; sideways ' + s1.f + ' then ' + f2 + ' in 0.7 s) and runs on when turned back (' + f3 + ')');
    R.say(errors.length === 0, 'sideways and back: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* landscape: a phone held sideways gets the rotate card over everything; a desktop window does not */
  for (const coarse of [true, false]) {
    const { page, errors } = await newPage(browser, { width: 800, height: 360, touch: coarse, dpr: coarse ? 3 : 1 });
    await gotoGame(page, srv.base);
    await ready(page);
    const r = await page.evaluate(() => {
      const card = document.getElementById('rotate'), shown = getComputedStyle(card).display !== 'none';
      const probes = [[400, 180], [40, 40], [760, 40], [40, 320], [760, 320]].map(([x, y]) => { const t = document.elementFromPoint(x, y); return !!t && (t === card || card.contains(t)); });
      return { shown, probes, coarse: matchMedia('(pointer: coarse)').matches, text: card.textContent };
    });
    if (coarse) R.say(r.coarse && r.shown && r.probes.every(Boolean), '800x360 with a coarse pointer: the rotate card ("' + r.text + '") covers the screen, five probes land on it (' + r.probes.map(p => (p ? 'card' : 'NOT')).join(' ') + ')');
    else R.say(!r.coarse && !r.shown, '800x360 with a fine pointer: no rotate card');
    R.say(errors.length === 0, '800x360 ' + (coarse ? 'coarse' : 'fine') + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
