import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
const ROOT = '/workspaces/lucid-winds';
const srv = createServer((req, res) => {
  try { res.end(readFileSync(join(ROOT, decodeURIComponent(req.url.split('?')[0])))); }
  catch (e) { res.writeHead(404); res.end(); }
}).listen(8936);
const b = await puppeteer.launch({ headless: 'new', args: [
  '--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader',
  '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage();
await pg.setViewport({ width: 720, height: 900 });
pg.on('pageerror', e => console.log('PAGE ERR:', e.message));
await pg.evaluateOnNewDocument(() => localStorage.setItem('sws_dev_ok', '1'));
await pg.goto('http://127.0.0.1:8936/loaf.html', { waitUntil: 'networkidle0', timeout: 60000 });
await pg.waitForFunction(() => window.LoafCat3D && window.LoafCat3D.setDNA, { timeout: 30000 });
await pg.evaluate(() => {
  document.getElementById('view-room').classList.remove('hidden');
  document.getElementById('tunerBody').classList.remove('hidden');
  document.getElementById('tuner').scrollIntoView();
});
/* Hand-read ground truths - what the scan SHOULD produce for each cat. */
const TARGETS = [
  ['barthalomew', 'assets/loaf/refcats/barthalomew/barthalomew-target-3d.png', {
    base: '#17141A', marking: '#0A0808', white: '#F2EFE8', eye: '#AEB94A',
    nose: '#2A2428', pattern: 'solid', whiteStyle: 'socks', whiteGrade: 3.4,
    whiteEdge: 0.45, seed: 0xBA47, floof: 0.62, chonk: 0.66, ear: 0.5, muzzle: 0.42 }],
  ['oreo', 'assets/loaf/refcats/oreo/oreo-target-3d.png', {
    base: '#8A7156', marking: '#241C14', white: '#F2EFE8', eye: '#A8B860',
    nose: '#C4756A', pattern: 'mackerel', whiteStyle: 'bib', whiteGrade: 1.5,
    whiteEdge: 0.4, seed: 0xEE0, floof: 0.35, chonk: 0.72, ear: 0.5, muzzle: 0.45 }]
];
for (const [name, out, dna] of TARGETS) {
  await pg.evaluate(d => window.LoafCat3D.setDNA(d), dna);
  /* wait for the 512px final paint to land, not a fixed nap */
  await pg.waitForFunction(exp => {
    const s = window.LoafCat3D._dbg();
    return s.coatSize === 512 && s.coatStats && s.dna && s.dna.base === exp;
  }, { timeout: 8000 }, dna.base).catch(() => null);
  await new Promise(r => setTimeout(r, 500));
  const el = await pg.$('#stage3d');
  await el.screenshot({ path: join(ROOT, out) });
  console.log('target rendered:', name);
}
await b.close(); srv.close();
