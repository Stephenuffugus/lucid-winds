/* PHASE 1 acceptance guard for the arcade redesign (2026-08-20).
   Measures the REAL rendered page at 390x844 with touch. Run with a server
   on :8777 from the repo root. `--break` inverts the first bound to prove
   the detector can fire (a gate you have not watched fail is decoration). */
import puppeteer from 'puppeteer';
import { catalog } from './catalog.mjs';

const BREAK = process.argv.includes('--break');
const c = catalog();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ args: ['--no-sandbox', '--mute-audio'] });
const p = await b.newPage();
await p.emulate({ viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile' });
await p.goto('http://127.0.0.1:8777/portal/index.html', { waitUntil: 'networkidle2', timeout: 90000 });
await sleep(1800);

let pass = 0, fail = 0;
const t = (name, ok, detail) => {
  if (ok) { pass++; console.log('  ok   ' + name + (detail ? '  (' + detail + ')' : '')); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  (' + detail + ')' : '')); }
};

const m = await p.evaluate(() => {
  const top = el => el ? Math.round(el.getBoundingClientRect().top + scrollY) : null;
  return {
    fgSearch: top(document.getElementById('fg-search')),
    firstCard: top(document.querySelector('.shelf .card')),
    everything: top(document.getElementById('everything-h')),
    members: top(document.querySelector('.members')),
    garden: top(document.getElementById('garden')),
    ctaGone: !document.getElementById('install-cta'),
    markThere: !!document.getElementById('hdr-install'),
    musicH: document.getElementById('music-fab') ? Math.round(document.getElementById('music-fab').getBoundingClientRect().height) : 999,
    headingTxt: (document.getElementById('everything-h') || {}).textContent || '',
    pageH: document.documentElement.scrollHeight,
  };
});

const searchBound = BREAK ? 100 : 950;
t('search sits in the first screens', m.fgSearch !== null && m.fgSearch < searchBound, m.fgSearch + 'px, bound ' + searchBound);
t('a playable card appears within ~2 viewports', m.firstCard !== null && m.firstCard < 1900, m.firstCard + 'px');
t('the duplicate install CTA is gone, the mark remains', m.ctaGone && m.markThere);
t('the members pitch sits ABOVE the wall', m.members !== null && m.garden !== null && m.members < m.garden, m.members + ' < ' + m.garden);
t('the soundtrack is a control, not a billboard', m.musicH < 70, m.musicH + 'px tall');
t('the wall heading derives the openable count (' + c.open + ')', m.headingTxt.indexOf(String(c.open)) >= 0, JSON.stringify(m.headingTxt.trim()));

// classic-name search paints inline results
await p.type('#fg-search', 'peggle');
await sleep(600);
const res = await p.evaluate(() => ({
  shown: document.getElementById('fg-results-wrap').style.display !== 'none',
  names: [...document.querySelectorAll('#fg-results .card .nm')].map(e => e.textContent),
}));
t('typing a classic paints inline results', res.shown && res.names.length > 0, res.names.slice(0, 3).join(', '));
t('peggle finds Nectar Drop', res.names.some(n => /nectar/i.test(n)));

// surprise me launches a real game through the overlay
// Same-origin satellites deliberately navigate TOP-LEVEL (house design since
// Aug 16); native /play/ games open the overlay. Either is a launched game.
const beforeUrl = p.url();
await p.evaluate(() => { document.getElementById('fg-search').value = ''; document.getElementById('fg-surprise').click(); });
await sleep(2500);
let opened = false;
try { opened = await p.evaluate(() => document.body.classList.contains('game-open')); } catch (e) {}
const nav = p.url() !== beforeUrl;
t('Surprise me launches a game (overlay or navigation)', opened || nav, opened ? 'overlay' : (nav ? p.url().split('/').slice(-2).join('/') : 'nothing'));

await b.close();
console.log('\nportal_ux_check: ' + pass + ' ok, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
