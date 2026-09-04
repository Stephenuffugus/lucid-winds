/**
 * The three app icons, drawn by code: one blue glass marble sitting in a dirt
 * hollow with its shadow, the game in one shape.
 *
 *   node tools/make_icons.mjs
 *
 * Nothing here is hand painted and nothing here is claimed to be. It is a canvas
 * script rendered in real Chrome and written to PNG. If Stephen wants better,
 * the file names are in ART_ASSETS.md and this becomes the placeholder.
 */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const page = await browser.newPage();
await page.goto('about:blank');

const draw = async (size, maskable) => page.evaluate(async (S, MASK) => {
  const c = new OffscreenCanvas(S, S);
  const g = c.getContext('2d');
  let s = 42;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

  // the dirt ground
  const dirt = g.createRadialGradient(S * 0.5, S * 0.66, S * 0.05, S * 0.5, S * 0.66, S * 0.72);
  dirt.addColorStop(0, '#6b5a45');
  dirt.addColorStop(1, '#241d16');
  g.fillStyle = dirt;
  g.fillRect(0, 0, S, S);
  // coarse grain: stones, not per pixel noise. Per pixel noise made a 512 icon
  // half a megabyte, because PNG cannot compress what is random everywhere.
  for (let i = 0; i < S * 1.6; i++) {
    const x = rnd() * S, y = rnd() * S, r = S * (0.004 + rnd() * 0.016);
    g.fillStyle = 'rgba(' + (150 + rnd() * 60 | 0) + ',' + (132 + rnd() * 50 | 0) + ',' + (108 + rnd() * 40 | 0) + ',' + (0.05 + rnd() * 0.14).toFixed(2) + ')';
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }

  const pad = MASK ? 0.80 : 1.0;
  const R = S * 0.235 * pad;                 // the taw
  const r2 = S * 0.115 * pad;                // one mib beside it
  const cx = S * 0.455, cy = S * 0.455;
  const mx = S * 0.755, my = S * 0.665;

  // the chalk ring, an ELLIPSE on the ground and BEHIND both marbles, so it
  // reads as a ring you are looking across and not as a mouth under a face
  g.save();
  g.translate(S * 0.5, S * 0.70);
  g.scale(1, 0.30);
  g.strokeStyle = 'rgba(232,220,200,0.42)';
  g.lineWidth = Math.max(1.5, S * 0.030 / 0.30 * 0.30);
  g.beginPath(); g.arc(0, 0, S * 0.40 * pad, 0, 6.2832); g.stroke();
  g.restore();

  function marble(x, y, r, cool) {
    g.save();
    g.translate(x, y + r * 0.86);
    g.scale(1, 0.28);
    const sh = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.25);
    sh.addColorStop(0, 'rgba(0,0,0,0.66)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh;
    g.beginPath(); g.arc(0, 0, r * 1.25, 0, 6.2832); g.fill();
    g.restore();

    const body = g.createRadialGradient(x - r * 0.36, y - r * 0.44, r * 0.04, x, y, r);
    if (cool) {
      body.addColorStop(0, '#e6f4ff'); body.addColorStop(0.30, '#7fb6e2');
      body.addColorStop(0.76, '#28598a'); body.addColorStop(1, '#0e2a40');
    } else {
      body.addColorStop(0, '#fff2d6'); body.addColorStop(0.30, '#e2b463');
      body.addColorStop(0.76, '#94631f'); body.addColorStop(1, '#3d2708');
    }
    g.fillStyle = body;
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();

    // the vane inside, the thing that makes it a marble and not a ball
    g.save();
    g.beginPath(); g.arc(x, y, r * 0.97, 0, 6.2832); g.clip();
    g.globalAlpha = 0.62;
    g.fillStyle = cool ? '#eaf6ff' : '#fff0cf';
    g.beginPath();
    g.ellipse(x + r * 0.06, y + r * 0.10, r * 0.66, r * 0.19, -0.42, 0, 6.2832);
    g.fill();
    g.globalAlpha = 0.38;
    g.beginPath();
    g.ellipse(x + r * 0.06, y + r * 0.10, r * 0.60, r * 0.17, 0.95, 0, 6.2832);
    g.fill();
    g.restore();

    g.strokeStyle = cool ? 'rgba(205,234,255,0.55)' : 'rgba(255,232,186,0.5)';
    g.lineWidth = Math.max(1, r * 0.055);
    g.beginPath(); g.arc(x, y, r * 0.965, 0, 6.2832); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.beginPath(); g.ellipse(x - r * 0.35, y - r * 0.41, r * 0.16, r * 0.10, -0.6, 0, 6.2832); g.fill();
  }

  marble(mx, my, r2, false);
  marble(cx, cy, R, true);

  const blob = await c.convertToBlob({ type: 'image/png' });
  const buf = new Uint8Array(await blob.arrayBuffer());
  let out = '';
  for (let i = 0; i < buf.length; i++) out += String.fromCharCode(buf[i]);
  return btoa(out);
}, size, maskable);

for (const [name, size, mask] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true]]) {
  const b64 = await draw(size, mask);
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(join(ROOT, name), buf);
  console.log(name + '  ' + size + 'x' + size + '  ' + (buf.length / 1024).toFixed(1) + ' KB');
}
await browser.close();
console.log('ICONS OK');
