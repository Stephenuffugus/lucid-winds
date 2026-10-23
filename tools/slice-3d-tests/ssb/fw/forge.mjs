import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0]));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 4000));
const click = async sel => { const c = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel); if (c) await p.mouse.click(c.x, c.y); return !!c; };
await click('#b-forge'); await new Promise(r => setTimeout(r, 2500));
const snap = () => p.evaluate(() => { const c = document.getElementById('forge-pvc'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0, h = 0; for (let i = 3; i < d.length; i += 4) { if (d[i] > 20) n++; h = (h * 31 + d[i - 1] + d[i]) % 1000000007; } return { opaque: n, hash: h }; });
const r = {};
r.s1 = await snap(); await new Promise(r2 => setTimeout(r2, 700)); r.s2 = await snap();
r.info = await p.evaluate(() => ({ name: document.getElementById('pv-name').textContent, story: document.getElementById('pv-story').textContent, act: document.getElementById('forge-act').textContent, dis: document.getElementById('forge-act').disabled, cards: document.getElementById('forge-grid').children.length, order: window._S3.skinOrder().length, cat: Object.keys(window._S3.catalog()).length }));
// choose a locked knife with no slivers: nothing is spent, the button says Unlock
await p.evaluate(() => window._S3forge.setSliv(600));
const kat = await p.evaluate(() => { const el = [...document.querySelectorAll('#forge-grid .fcard')].find(e => e.getAttribute('data-key') === 'katana'); el.scrollIntoView({ block: 'center' }); return !!el; });
await new Promise(r2 => setTimeout(r2, 300));
await click('#forge-grid .fcard[data-key="katana"]'); await new Promise(r2 => setTimeout(r2, 400));
r.afterSelect = await p.evaluate(() => ({ sliv: window._S3forge.sliv(), owned: window._S3forge.owned().indexOf('katana') >= 0, name: document.getElementById('pv-name').textContent, act: document.getElementById('forge-act').textContent, rule: document.getElementById('pv-rule').textContent }));
await click('#forge-act'); await new Promise(r2 => setTimeout(r2, 400));
r.afterBuy = await p.evaluate(() => ({ sliv: window._S3forge.sliv(), owned: window._S3forge.owned().indexOf('katana') >= 0, equip: window._S3forge.equip(), act: document.getElementById('forge-act').textContent }));
// a trophy: rule shown, no button
await p.evaluate(() => { const el = document.querySelector('#forge-grid .fcard[data-key="boomerang"]'); el.scrollIntoView({ block: 'center' }); });
await new Promise(r2 => setTimeout(r2, 300)); await click('#forge-grid .fcard[data-key="boomerang"]'); await new Promise(r2 => setTimeout(r2, 300));
r.trophy = await p.evaluate(() => ({ name: document.getElementById('pv-name').textContent, story: document.getElementById('pv-story').textContent, rule: document.getElementById('pv-rule').textContent, actShown: getComputedStyle(document.getElementById('forge-act')).display !== 'none' }));
// leaving the forge stops the loop
await click('#forge-back'); await new Promise(r2 => setTimeout(r2, 300));
r.s3 = await snap(); await new Promise(r2 => setTimeout(r2, 500)); r.s4 = await snap();
r.errs = errs;
console.log(JSON.stringify(r, null, 1));
await b.close();
