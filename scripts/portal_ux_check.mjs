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
    members: top(document.querySelector('.members')),
    tiles: document.querySelectorAll('#browse-tiles .tile').length,
    tileCounts: [...document.querySelectorAll('#browse-tiles .tc')].map(e => parseInt(e.textContent, 10)),
    famCards: document.querySelectorAll('#fam-shelf .card').length,
    testlab: !!document.getElementById('test-lab'),
    gardenCards: document.querySelectorAll('#garden .card').length,
    domCards: document.querySelectorAll('.card').length,
    ctaGone: !document.getElementById('install-cta'),
    markThere: !!document.getElementById('hdr-install'),
    musicH: document.getElementById('music-fab') ? Math.round(document.getElementById('music-fab').getBoundingClientRect().height) : 999,
    headingTxt: (document.getElementById('everything-h') || {}).textContent || '',
    pageH: document.documentElement.scrollHeight,
    imgs: document.images.length,
  };
});

const searchBound = BREAK ? 100 : 950;
t('search sits in the first screens', m.fgSearch !== null && m.fgSearch < searchBound, m.fgSearch + 'px, bound ' + searchBound);
t('a playable card appears within ~2 viewports', m.firstCard !== null && m.firstCard < 1900, m.firstCard + 'px');
t('the duplicate install CTA is gone, the mark remains', m.ctaGone && m.markThere);
t('the members pitch is on the storefront', m.members !== null, m.members + 'px');
t('the soundtrack is a control, not a billboard', m.musicH < 70, m.musicH + 'px tall');
t('the wall heading derives the openable count (' + c.open + ')', m.headingTxt.indexOf(String(c.open)) >= 0, JSON.stringify(m.headingTxt.trim()));
// Phase 2: the landing page stopped pre-rendering the wall
t('the wall does NOT pre-render on load', m.gardenCards === 0, m.gardenCards + ' garden cards');
t('the landing page carries a curated card count, not 283', m.domCards < 60, m.domCards + ' cards in DOM');
t('the landing page is a storefront, not 37 viewports', m.pageH < 16000, m.pageH + 'px');
t('six genre tiles with live counts', m.tiles === 6 && m.tileCounts.every(n => n > 0), JSON.stringify(m.tileCounts));
t('Familiar favorites shelf is present', m.famCards >= 5, m.famCards + ' cards');
t('the Test Lab door exists', m.testlab);
t('Your arcade stays hidden for a brand new visitor',
  await p.evaluate(() => document.getElementById('your-arcade').offsetParent === null));

// Browse all enters Catalog Mode, renders the wall, back returns
await p.evaluate(() => document.getElementById('fg-browse').click());
await sleep(900);
const cat1 = await p.evaluate(() => ({
  open: document.body.classList.contains('catalog-open'),
  cards: document.querySelectorAll('#garden .card').length,
  storefrontHidden: document.querySelector('.members').offsetParent === null,
}));
t('Browse all opens Catalog Mode with the full wall', cat1.open && cat1.cards > 150 && cat1.storefrontHidden,
  cat1.cards + ' cards, storefront hidden ' + cat1.storefrontHidden);
await p.goBack();
await sleep(700);
const cat2 = await p.evaluate(() => ({
  open: document.body.classList.contains('catalog-open'),
  members: !!document.querySelector('.members').offsetParent,
}));
t('phone back returns to the storefront', !cat2.open && cat2.members);

// Phase 3: vibes + six genres
const v1 = await p.evaluate(() => ({
  storefrontChips: document.querySelectorAll('#vibe-row .vchip').length,
  counts: [...document.querySelectorAll('#vibe-row .vchip small')].map(e => parseInt(e.textContent, 10)),
  partyTab: !!document.querySelector('#tabs button[data-c="party"]'),
}));
t('six vibe chips with nonzero counts on the storefront', v1.storefrontChips === 6 && v1.counts.every(n => n > 0), JSON.stringify(v1.counts));
t('Party is no longer a genre tab', !v1.partyTab);
await p.evaluate(() => { [...document.querySelectorAll('#vibe-row .vchip')].find(c => c.getAttribute('data-vibe') === 'think').click(); });
await sleep(900);
const v2 = await p.evaluate(() => ({
  open: document.body.classList.contains('catalog-open'),
  cards: document.querySelectorAll('#garden .card').length,
  chipOn: !!document.querySelector('#vibes .vchip.on'),
}));
t('a storefront vibe opens the catalog filtered', v2.open && v2.chipOn && v2.cards > 40 && v2.cards < 120, v2.cards + ' think games');
await p.evaluate(() => { document.querySelector('#vibes .vchip.on').click(); });
await sleep(700);
const v3 = await p.evaluate(() => document.querySelectorAll('#garden .card').length);
t('clearing the vibe restores the full tab', v3 > 150, v3 + ' cards');
const v4 = await p.evaluate(() => {
  const tb = document.querySelector('#tabs button[data-c="action"]'); tb.click();
  return new Promise(res => setTimeout(() => {
    res([...document.querySelectorAll('#garden .card .nm')].map(e => e.textContent));
  }, 500));
});
t('party titles live under Arcade & Action now', v4.some(n => /chameleon|whack/i.test(n)), v4.filter(n => /chameleon|whack/i.test(n)).join(', '));
await p.goBack(); await sleep(500);

// a genre tile opens the catalog on its tab
await p.evaluate(() => document.querySelector('#browse-tiles [data-tile="card"]').click());
await sleep(800);
const cat3 = await p.evaluate(() => ({
  open: document.body.classList.contains('catalog-open'),
  tab: (document.querySelector('#tabs button.on') || {}).getAttribute ? document.querySelector('#tabs button.on').getAttribute('data-c') : null,
  cards: document.querySelectorAll('#garden .card').length,
}));
t('a genre tile opens Catalog Mode on its tab', cat3.open && cat3.tab === 'card' && cat3.cards > 5,
  'tab ' + cat3.tab + ', ' + cat3.cards + ' cards');
await p.goBack(); await sleep(500);

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

// Phase 4: the surprise launch above must have been recorded; a return
// visit shows Your arcade. (Surprise may have navigated off the portal.)
await p.goto('http://127.0.0.1:8777/portal/index.html', { waitUntil: 'networkidle2' });
await sleep(1600);
const rec = await p.evaluate(() => JSON.parse(localStorage.getItem('sws_recent') || '[]').length);
t('the launched game was recorded to Recently Played', rec > 0, rec + ' entries');
const ya2 = await p.evaluate(() => ({
  visible: !!document.getElementById('your-arcade').offsetParent,
  jump: document.querySelectorAll('#recent-shelf .card').length,
  chips: document.querySelectorAll('.you-chip').length,
}));
t('a returning visitor gets Your arcade with Jump back in', ya2.visible && ya2.jump > 0 && ya2.chips === 3,
  ya2.jump + ' recent cards, ' + ya2.chips + ' chips');

await b.close();
console.log('\nportal_ux_check: ' + pass + ' ok, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
