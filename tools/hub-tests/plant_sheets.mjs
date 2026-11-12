// node tools/hub-tests/plant_sheets.mjs [outdir]   One plant drawn with every aura, then with every mutation: two sheets (sheet-auras.jpg, sheet-mutations.jpg). The look for the plant packets V1 to V4. Repo root on 8777; needs seed_return.js beside it.
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const OUT = process.argv[2] || '.'; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 1260, height: 900, deviceScaleFactor: 1 });
await p.setRequestInterception(true); p.on('request', (r) => (/google-analytics|googletagmanager|portalPing|doubleclick/.test(r.url()) ? r.abort() : r.continue()));
await p.evaluateOnNewDocument(fs.readFileSync('./seed_return.js', 'utf8'));
await p.goto('http://127.0.0.1:8777/index.html', { waitUntil: 'domcontentloaded', timeout: 120000 }); await sleep(7000);
const H = '8f00917b1b6e7a6b38fa1cf8a8f973c59d4b98a22394c850e7a73b2095982c75';
async function sheet(kind, file) {
  const info = await p.evaluate((H, kind) => {
    var bank = TRAIT_BANK[kind]; var items = [];
    if (kind === 'auras') { for (var i = 0; i < bank.length; i++) items.push({ label: i + ' ' + (bank[i] && (bank[i].name || bank[i].n) || bank[i] || ''), ov: { aura: i, mutation: 0, mutationName: 'None', companion: 0 } }); }
    else { items.push({ label: 'none', ov: { mutation: 0, mutationName: 'None', aura: 0, companion: 0 } }); for (var j = 0; j < bank.length; j++) { var m = bank[j]; items.push({ label: (m.byte !== undefined ? '0x' + Number(m.byte).toString(16) + ' ' : '') + (m.name || m.n || JSON.stringify(m).slice(0, 20)), ov: { mutation: m.byte !== undefined ? m.byte : (0xED + j), mutationName: m.name || m.n, aura: 0, companion: 0 } }); } }
    document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;background:#0d100c';
    var w = document.createElement('div'); w.id = 'sh'; w.style.cssText = 'display:grid;grid-template-columns:repeat(9,140px);width:1260px;background:#0d100c';
    var overflow = [];
    items.forEach(function (it) { var c = document.createElement('div'); c.style.cssText = 'width:140px;height:212px;position:relative;border:1px solid #222;box-sizing:border-box;overflow:hidden';
      var svg = ''; try { svg = window._generatePlantSVG(H, 140, 1.0, it.ov); } catch (e) { svg = '<div style="color:red;font:10px monospace">ERR ' + e.message + '</div>'; }
      c.innerHTML = '<div style="height:190px;display:flex;align-items:center;justify-content:center">' + svg + '</div><div style="position:absolute;left:2px;bottom:1px;font:9px monospace;color:#c8a84b;white-space:nowrap">' + it.label.slice(0, 26) + '</div>'; w.appendChild(c);
      // count large plain rects with no gradient/filter: the hard-edged boxes
      var big = (svg.match(/<rect[^>]*>/g) || []).filter(function (r) { var wd = +(r.match(/ width="([\d.]+)"/) || [])[1], ht = +(r.match(/ height="([\d.]+)"/) || [])[1]; return wd >= 30 && ht >= 6 && !/filter=|url\(#/.test(r); }).length;
      var vb = (svg.match(/x="(-?[\d.]+)"[^>]* width="([\d.]+)"/g) || []).some(function (r) { var x = +(r.match(/x="(-?[\d.]+)"/) || [])[1], wd = +(r.match(/width="([\d.]+)"/) || [])[1]; return x < -2 || x + wd > 72; });
      if (big || vb) overflow.push(it.label.slice(0, 22) + (big ? ' [' + big + ' plain wide rects]' : '') + (vb ? ' [draws outside the 70 wide canvas]' : '')); });
    document.body.appendChild(w); return { n: items.length, overflow: overflow, sample: JSON.stringify(bank[bank.length - 1]).slice(0, 120) };
  }, H, kind);
  await sleep(1000); const el = await p.$('#sh'); await el.screenshot({ path: file, type: 'jpeg', quality: 74 }); return info;
}
const a = await sheet('auras', OUT + '/sheet-auras.jpg'); console.log('AURAS', a.n, 'sample', a.sample); console.log(' flagged:', a.overflow.join(' | '));
const m = await sheet('mutations', OUT + '/sheet-mutations.jpg'); console.log('MUTATIONS', m.n, 'sample', m.sample); console.log(' flagged:', m.overflow.join(' | '));
await b.close();
