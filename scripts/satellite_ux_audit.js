#!/usr/bin/env node
/* Studio-wide satellite UX audit — READABLE FONTS + PRE-PLAY DIRECTIONS + EM-DASHES.
 *
 * Sister tool to scripts/touch_audit.js (same philosophy: RENDERED pixels are the
 * only honest measurement; most satellites transform-scale a fixed 540x960 stage,
 * so computed CSS font-size lies by the stage scale ~0.69 at 375w).
 *
 * Per satellites/<slug>/index.html, at a 375x667 phone viewport, it samples the
 * LANDING screen exactly as a first-timer sees it, then once more after a single
 * center tap (splash screens), and reports BOTH samples:
 *   1) FONT CHECK — walks visible text nodes, rendered px = computed font-size x
 *      cumulative transform scale (rect.width / offsetWidth of nearest measurable
 *      ancestor). Flags anything under the threshold (default 11px) with snippet,
 *      selector, and rendered px.
 *   2) DIRECTIONS CHECK — is there a rules/how-to affordance BEFORE play?
 *      (a) interactive: visible button/link whose text or aria-label/title matches
 *          how|how to|rules|directions|guide|help|tutorial|instructions (word-bound,
 *          so "show" does not match "how") or is a lone ? / i glyph;
 *      (b) passive: a visible coach/rules card (id|class ~ rule|coach|howto|
 *          tutorial|instruction|help) carrying at least 15 chars of text — the
 *          house coach-card pattern dismisses with "GOT IT", which (a) would miss.
 *   3) EM-DASH CHECK — U+2014 in visible text (player-facing copy law: none).
 *
 * Scope, stated honestly: canvas-rendered text is invisible to this audit — rows
 * with very few DOM text nodes are marked "low-text" instead of being called clean.
 * A rules screen reachable only through an unlabeled menu drilldown counts as
 * NOT FOUND, which is exactly the point of the check.
 *
 * USAGE  node scripts/satellite_ux_audit.js [minFontPx] [outJson] [--shots=slug1,slug2|all]
 *        default minFontPx 11, default outJson <os tmpdir>/satellite_ux_audit.json
 * OUTPUT sorted table worst-first (smallest rendered font first) + JSON report.
 *        Exit 0 always — it is an auditor, not a gate.
 */
const puppeteer = require('puppeteer');
const path = require('path'); const fs = require('fs'); const os = require('os');
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const pos = args.filter(a => !a.startsWith('--'));
const THRESH = parseFloat(pos[0] || '11');
const OUT = pos[1] || path.join(os.tmpdir(), 'satellite_ux_audit.json');
const shotsFlag = (flags.find(f => f.startsWith('--shots=')) || '').slice(8);
const onlyFlag = (flags.find(f => f.startsWith('--only=')) || '').slice(7); // comma list of slugs

const MIME = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif',
  '.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json',
  '.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.ico':'image/x-icon',
  '.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain' };

function serveFile(req, absPath) {
  try {
    const body = fs.readFileSync(absPath);
    return req.respond({ status: 200, contentType: MIME[path.extname(absPath).toLowerCase()] || 'application/octet-stream',
      headers: { 'Access-Control-Allow-Origin': '*' }, body });
  } catch (e) { return req.respond({ status: 404, body: '' }); }
}

function wireInterception(page) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', req => {
      const url = req.url();
      try {
        let m = url.match(/^file:\/\/([^?#]+)(?:[?#].*)?$/i);
        if (m) {
          const p = decodeURIComponent(m[1]);
          const isFile = fs.existsSync(p) && !fs.statSync(p).isDirectory();
          if (!/[?#]/.test(url) && isFile) return req.continue();
          // strip ?v= cache-bust, and remap root-absolute paths (/sunbeam-sdk.js) to repo root
          return serveFile(req, isFile ? p : path.join(ROOT, p));
        }
        m = url.match(/^https?:\/\/(?:www\.)?lucidwinds\.com\/([^?#]*)/i);
        if (m) return serveFile(req, path.join(ROOT, decodeURIComponent(m[1])));
        if (/^https?:/i.test(url)) return req.abort('failed');   // fonts.googleapis, cloudfunctions, github.io: no network here
        return req.continue();
      } catch (e) { try { req.abort('failed'); } catch (e2) {} }
    });
  });
}

/* Runs inside the page. Self-contained — no closures. */
function auditPage(THRESH) {
  function vis(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      if (e.getAttribute && e.getAttribute('aria-hidden') === 'true') return false;
    }
    return true;
  }
  function scaleOf(el) {          // rendered px / layout px via nearest measurable ancestor
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.display !== 'inline' && e.offsetWidth > 0) {
        var r = e.getBoundingClientRect();
        if (r.width > 0.5) return r.width / e.offsetWidth;
      }
    }
    return 1;
  }
  function sel(el) {
    var parts = [];
    for (var e = el, i = 0; e && e.nodeType === 1 && i < 4 && e !== document.body; e = e.parentElement, i++) {
      var s = e.tagName.toLowerCase();
      if (e.id) { parts.unshift(s + '#' + e.id); break; }
      var cl = (typeof e.className === 'string') ? e.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      if (cl) s += '.' + cl;
      parts.unshift(s);
    }
    return parts.join('>');
  }
  var out = { textNodes: 0, minPx: null, minSnip: '', fontsUnder: [], fontsUnderTotal: 0,
              dashes: [], dashTotal: 0, directions: { found: false, hits: [] }, url: location.href };
  if (!document.body) return out;

  // ---- 1) fonts + 3) em-dashes: walk visible text nodes
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  var n;
  while ((n = walker.nextNode())) {
    var txt = n.nodeValue;
    if (!txt || !txt.replace(/[\s ]+/g, '')) continue;
    var p = n.parentElement;
    if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(p.tagName)) continue;
    if (!vis(p)) continue;
    var range = document.createRange(); range.selectNodeContents(n);
    var r = range.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    out.textNodes++;
    var cssPx = parseFloat(getComputedStyle(p).fontSize) || 0;
    var sc = scaleOf(p);
    var px = cssPx * sc;
    var snip = txt.replace(/[\s ]+/g, ' ').trim().slice(0, 42);
    if (out.minPx === null || px < out.minPx) { out.minPx = px; out.minSnip = snip; }
    if (px < THRESH - 0.05) {
      out.fontsUnderTotal++;
      out.fontsUnder.push({ px: +px.toFixed(1), cssPx: +cssPx.toFixed(1), scale: +sc.toFixed(3), text: snip, sel: sel(p) });
    }
    var dm = txt.match(/—/g);
    if (dm) { out.dashTotal += dm.length; if (out.dashes.length < 8) out.dashes.push({ text: snip, sel: sel(p), count: dm.length }); }
  }
  out.fontsUnder.sort(function (a, b) { return a.px - b.px; });
  out.fontsUnder = out.fontsUnder.slice(0, 15);
  if (out.minPx !== null) out.minPx = +out.minPx.toFixed(1);

  // ---- 2) directions affordance
  var WORD = /\b(how\s*to(\s*play)?|how|rules?|directions?|guide|help|tutorial|instructions?)\b/i;
  var els = document.querySelectorAll('button,a[href],[onclick],[role="button"],.btn,summary,[aria-label],[title]');
  var i, el, sawSkip = false, sawNext = false;
  for (i = 0; i < els.length && out.directions.hits.length < 6; i++) {
    el = els[i];
    if (!vis(el)) continue;
    var er = el.getBoundingClientRect();
    if (er.width < 4 || er.height < 4) continue;
    if (er.bottom < 0 || er.top > innerHeight || er.right < 0 || er.left > innerWidth) continue;
    var label = ((el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '')).trim();
    var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    var matched = null;
    if (text.length <= 60) {                       // buttons are short; long text is a card, handled below
      var m1 = (text + ' ' + label).match(WORD);
      if (m1) matched = m1[0];
      else if (text && /^[?❓❔ℹⓘ🛈i]$/i.test(text)) matched = text; // lone help glyph
    } else if (label) {
      var m2 = label.match(WORD);
      if (m2) matched = m2[0];
    }
    if (matched) {
      out.directions.found = true;
      out.directions.hits.push({ kind: 'interactive', matched: matched, text: (text || label).slice(0, 40), sel: sel(el) });
    }
    if (text.length <= 20 && /^skip\b/i.test(text)) sawSkip = true;
    if (text.length <= 20 && /^(next|continue)\b/i.test(text)) sawNext = true;
  }
  if (sawSkip && sawNext) {           // Skip + Next pair on the landing = onboarding walkthrough deck
    out.directions.found = true;
    out.directions.hits.push({ kind: 'onboarding-deck', matched: 'skip+next pair', text: 'walkthrough slides', sel: '' });
  }
  var cards = document.querySelectorAll(
    '[id*="rule" i],[class*="rule" i],[id*="coach" i],[class*="coach" i],[id*="howto" i],[class*="howto" i],' +
    '[id*="how-to" i],[class*="how-to" i],[id*="tutorial" i],[class*="tutorial" i],[id*="instruction" i],' +
    '[class*="instruction" i],[id*="help" i],[class*="help" i]');
  for (i = 0; i < cards.length && out.directions.hits.length < 6; i++) {
    el = cards[i];
    if (!vis(el)) continue;
    var cr = el.getBoundingClientRect();
    if (cr.width < 20 || cr.height < 12) continue;
    if (cr.bottom < 0 || cr.top > innerHeight) continue;
    var ctext = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (ctext.length < 15) continue;
    out.directions.found = true;
    out.directions.hits.push({ kind: 'passive-card', matched: (el.id || el.className || '').toString().slice(0, 30), text: ctext.slice(0, 40), sel: sel(el) });
  }
  return out;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'] });
  const sats = fs.readdirSync(path.join(ROOT, 'satellites'))
    .filter(d => { try { return fs.existsSync(path.join(ROOT, 'satellites', d, 'index.html')); } catch (e) { return false; } })
    .filter(d => !onlyFlag || onlyFlag.split(',').indexOf(d) !== -1)
    .sort();
  const wantShot = slug => shotsFlag === 'all' || shotsFlag.split(',').indexOf(slug) !== -1;
  const shotDir = path.dirname(OUT);
  const rows = [];

  for (const slug of sats) {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    page.on('dialog', d => { d.dismiss().catch(() => {}); });
    let jsErrors = 0; page.on('pageerror', () => { jsErrors++; });
    await wireInterception(page);
    let landing = null, afterTap = null, err = '', tapNavigated = false;
    try {
      await page.goto('file://' + path.join(ROOT, 'satellites', slug, 'index.html'),
        { waitUntil: 'domcontentloaded', timeout: 25000 });
      await new Promise(r => setTimeout(r, 2000));
      landing = await page.evaluate(auditPage, THRESH);
      if (shotsFlag && wantShot(slug)) {
        await page.screenshot({ path: path.join(shotDir, 'ux_' + slug + '_landing.png') }).catch(() => {});
      }
      // one center tap to leave a possible splash; sample again
      try {
        const beforeUrl = page.url();
        await page.mouse.click(187, 333);
        await new Promise(r => setTimeout(r, 1400));
        tapNavigated = page.url() !== beforeUrl;
        afterTap = await page.evaluate(auditPage, THRESH);
        if (shotsFlag && wantShot(slug)) {
          await page.screenshot({ path: path.join(shotDir, 'ux_' + slug + '_aftertap.png') }).catch(() => {});
        }
      } catch (e2) { /* tap sample is best-effort */ }
    } catch (e) { err = e.message.slice(0, 60); }
    await page.close();

    const samples = [landing, afterTap].filter(Boolean);
    const minFont = samples.length ? Math.min.apply(null, samples.map(s => s.minPx === null ? 999 : s.minPx)) : null;
    const row = {
      slug, err, jsErrors, tapNavigated,
      minFont: (minFont === null || minFont === 999) ? null : minFont,
      underLanding: landing ? landing.fontsUnderTotal : null,
      underAfterTap: afterTap ? afterTap.fontsUnderTotal : null,
      dirLanding: landing ? landing.directions.found : null,
      dirAfterTap: afterTap ? afterTap.directions.found : null,
      directionsFound: !!((landing && landing.directions.found) || (afterTap && afterTap.directions.found)),
      emdashTotal: Math.max(landing ? landing.dashTotal : 0, afterTap ? afterTap.dashTotal : 0),
      lowText: !!(landing && landing.textNodes < 3),
      landing, afterTap
    };
    rows.push(row);
    const worstSnip = (landing && landing.fontsUnder[0]) ? (landing.fontsUnder[0].px + 'px "' + landing.fontsUnder[0].text + '"')
      : (afterTap && afterTap.fontsUnder[0]) ? ('tap: ' + afterTap.fontsUnder[0].px + 'px "' + afterTap.fontsUnder[0].text + '"') : '';
    process.stderr.write('. ' + slug + (err ? ' ERR' : '') + (worstSnip ? ' [' + worstSnip + ']' : '') + '\n');
  }
  await browser.close();

  rows.sort((a, b) => {
    const am = a.minFont === null ? 998 : a.minFont, bm = b.minFont === null ? 998 : b.minFont;
    if (a.err && !b.err) return 1; if (b.err && !a.err) return -1;
    if (am !== bm) return am - bm;
    return ((b.underLanding || 0) + (b.underAfterTap || 0)) - ((a.underLanding || 0) + (a.underAfterTap || 0));
  });

  const pad = (s, n) => String(s).padEnd(n);
  const rpad = (s, n) => String(s).padStart(n);
  console.log('\nSATELLITE UX AUDIT — 375x667, rendered px, threshold ' + THRESH + 'px — worst font first');
  console.log(pad('satellite', 22) + rpad('minFont', 8) + rpad('<' + THRESH + ' land', 8) + rpad('<' + THRESH + ' tap', 7)
    + '  ' + pad('dirs(land/tap)', 15) + rpad('emdash', 7) + '  worst offender / directions found');
  for (const r of rows) {
    if (r.err) { console.log(pad(r.slug, 22) + '  ERR ' + r.err); continue; }
    const dir = (r.dirLanding ? 'yes' : 'NO') + '/' + (r.dirAfterTap === null ? '-' : (r.dirAfterTap ? 'yes' : 'NO'));
    const off = (r.landing && r.landing.fontsUnder[0])
      ? r.landing.fontsUnder[0].px + 'px "' + r.landing.fontsUnder[0].text + '" @ ' + r.landing.fontsUnder[0].sel
      : (r.afterTap && r.afterTap.fontsUnder[0])
        ? 'tap: ' + r.afterTap.fontsUnder[0].px + 'px "' + r.afterTap.fontsUnder[0].text + '" @ ' + r.afterTap.fontsUnder[0].sel
        : (r.lowText ? '(low-text: canvas UI?)' : 'clean');
    const dirNote = r.directionsFound && ((r.landing && r.landing.directions.hits[0]) || (r.afterTap && r.afterTap.directions.hits[0]))
      ? ' | dirs: ' + (((r.landing && r.landing.directions.hits[0]) || r.afterTap.directions.hits[0]).kind) + ' "'
        + (((r.landing && r.landing.directions.hits[0]) || r.afterTap.directions.hits[0]).text) + '"'
      : '';
    console.log(pad(r.slug, 22) + rpad(r.minFont === null ? '-' : r.minFont, 8) + rpad(r.underLanding === null ? '-' : r.underLanding, 8)
      + rpad(r.underAfterTap === null ? '-' : r.underAfterTap, 7) + '  ' + pad(dir, 15)
      + rpad(r.emdashTotal || 0, 7) + '  ' + off + dirNote);
  }

  const noDirs = rows.filter(r => !r.err && !r.directionsFound);
  const withDash = rows.filter(r => !r.err && r.emdashTotal > 0);
  const errored = rows.filter(r => r.err);
  console.log('\n' + rows.length + ' satellites audited · ' + errored.length + ' errored');
  console.log('NO pre-play directions affordance (' + noDirs.length + '): ' + noDirs.map(r => r.slug).join(', '));
  console.log('Em-dashes in visible text (' + withDash.length + '): ' + withDash.map(r => r.slug + '(' + r.emdashTotal + ')').join(', '));
  console.log('Fonts under ' + THRESH + 'px on landing: '
    + rows.filter(r => !r.err && (r.underLanding || 0) > 0).length + ' satellites');

  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString(), viewport: '375x667', threshold: THRESH,
    summary: { audited: rows.length, errored: errored.length, noDirections: noDirs.map(r => r.slug),
               emdash: withDash.map(r => ({ slug: r.slug, count: r.emdashTotal })) },
    rows
  }, null, 1));
  console.log('\nJSON report: ' + OUT);
  process.exit(0);
})();
