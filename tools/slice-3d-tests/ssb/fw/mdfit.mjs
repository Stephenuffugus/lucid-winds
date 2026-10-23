import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
await p.setViewport({ width: 360, height: 640, deviceScaleFactor: 1 });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3000));
const r = await p.evaluate(() => {
  const C = { 'b-play': ['Run forward, stick the wall', 'Stick the far wall', 'Run on to the wall', 'Reach and stick the wall'],
    'b-ff': ['Dive to the bullseye floor', 'Dive to the bullseye', 'Land the bullseye'],
    'b-endless': ['No floor, chase the depth', 'No floor, go deep', 'No floor, how deep'],
    'b-climb': ['Stake a height multiplier', 'Stake a multiplier', 'Climb for a multiplier', 'Stick high, win big'] };
  const out = {};
  for (const id in C) { const md = document.querySelector('#' + id + ' .md'), keep = md.textContent, cs = getComputedStyle(md), lh = parseFloat(cs.lineHeight) || 21;
    const avail = md.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    out[id] = { avail: Math.round(avail), font: cs.fontFamily.slice(0, 40) + ' ' + cs.fontSize, lines: C[id].map(t => { md.textContent = t; const sp = document.createElement('span'); sp.textContent = t; sp.style.whiteSpace = 'nowrap'; md.textContent = ''; md.appendChild(sp); const w = sp.getBoundingClientRect().width / (document.getElementById('stage').getBoundingClientRect().width / 540); md.textContent = keep; return t + ' = ' + Math.round(w); }) };
  }
  const card = document.getElementById('b-play').getBoundingClientRect(), sc = document.getElementById('stage').getBoundingClientRect().width / 540;
  out.cardW = Math.round(card.width / sc);
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
