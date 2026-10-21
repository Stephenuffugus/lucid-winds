/* LOOK at an image border the way a player sees it: play screen, the shop scrolled to the frames, the share card.
   node satellites/hues/dev/look-borders.mjs <outdir>   (server on 8777 at the repo root). Equips clay_worm via ?hstest=1. */
import puppeteer from 'puppeteer';
const S = process.argv[2]; const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--force-color-profile=srgb'] });
const pg = await b.newPage(); await pg.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await pg.goto('http://127.0.0.1:8777/satellites/hues/?hstest=1&v=look', { waitUntil: 'networkidle2' }); await sleep(1500);
await pg.evaluate(() => { HUES_TEST.setBorder('clay_chameleon'); });
await pg.reload({ waitUntil: 'networkidle2' }); await sleep(1500);
await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /got it/i.test(e.textContent || '')); b && b.click(); }); await sleep(800);
await pg.evaluate(() => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = 'borders/clay/clay-8.png'; }));
const ids = await pg.evaluate(() => ({ eq: HUES_TEST.equipped(), cls: HUES_TEST.inGameClass(), tpl: document.querySelector('.compare').className }));
console.log(JSON.stringify(ids));
// into Endless play
await pg.evaluate(() => { const b = [...document.querySelectorAll('button,[data-mode]')].find(e => e.dataset.mode === 'endless' || /^endless/i.test((e.textContent || '').trim())); b && b.click(); }); await sleep(2500);
console.log('screen', await pg.evaluate(() => document.querySelector('.screen.on, [data-screen].on, #game')?.id || document.body.className));
await pg.screenshot({ path: S + '/hues-play-clay.png' });
const geo = await pg.evaluate(() => { const t = document.getElementById('targetSwatch').getBoundingClientRect(), y = document.getElementById('yoursSwatch').getBoundingClientRect(); return { target: [t.left, t.top, t.width, t.height].map(Math.round), yours: [y.left, y.top, y.width, y.height].map(Math.round), gap: Math.round(y.left - t.right) }; });
console.log(JSON.stringify(geo));
// the shop
await pg.evaluate(() => { openShop(); }); await sleep(1200);
await pg.evaluate(() => { const g = document.getElementById('shopGrid'); const sc = g.closest('.screen') || document.scrollingElement; (g.closest('[style*=overflow]') || sc).scrollTop = 1e6; window.scrollTo(0, 1e6); }); await sleep(600);
await pg.screenshot({ path: S + '/hues-shop-clay.png' });
// the share card
await pg.evaluate(() => new Promise(r => { const im = HUES_TEST.borderImgFor ? HUES_TEST.borderImgFor('clay_worm') : null; setTimeout(r, 600); }));
const url = await pg.evaluate(() => HUES_TEST.shareCard());
const fs = await import('fs'); fs.writeFileSync(S + '/hues-share-clay.png', Buffer.from(url.split(',')[1], 'base64'));
await b.close();
