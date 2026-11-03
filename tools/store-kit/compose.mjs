/* STORE KIT COMPOSER (20 Oct 2026, the studio asset standard; Hues is the first game through it).
   One tool for every listing, so the studio's Play pages read as one studio:
     • phone screenshots 1080x1920 = a 240px headline band over a 1080x1680 raw from the REAL game
     • the Play feature graphic 1024x500 (wordmark, tagline, icon, an optional pair of swatches or a raw)
     • the Play store icon 512x512 with no alpha (Play rejects transparency in the listing icon)
   Raws come from the game's own shot driver at a phone width (Hues: dev/shots.mjs --fixtures=412x641 --dpr=2.62136).
   Every picture is the real game; nothing here paints game art that the game does not show.

   Run: node tools/store-kit/compose.mjs store/hues-play/kit.json
   kit.json: { out, font:{ css, head, body }, colors:{ bg, ink, dim, accent }, icon,
               shots:[{ src, head, out }], feature:{ title, tagline (a string, or an array of lines), sub?, swatches?:[c1,c2], raw?: a real shot shown framed at the right (Shutterbug, 2 Nov) } } (paths from the repo root)
   Artist frames (Shutterbug, Astra's round 7, 3 Nov): kit.frame = { window:[x,y,w,h], headBox:[x,y,w,h] } and a shot with
   overlay: the kit's background, the raw contained in the window, the overlay (its window clear) at 0,0, the headline
   fitted inside headBox. feature.art + feature.box: her finished illustration with only the title lettered in her box
   (feature.shadow, the hard shadow colour; the title's colour is colors.accent). */
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const puppeteer = (() => { try { return createRequire(join(ROOT, 'package.json'))('puppeteer'); }
  catch (e) { return createRequire('/workspaces/sws-tools/package.json')('puppeteer'); } })();   /* the box keeps it in sws-tools */
const cfgPath = process.argv[2];
if (!cfgPath) { console.log('usage: node tools/store-kit/compose.mjs <kit.json>'); process.exit(1); }
const K = JSON.parse(readFileSync(join(ROOT, cfgPath), 'utf8'));
const OUT = join(ROOT, K.out); mkdirSync(OUT, { recursive: true });
const C = K.colors, F = K.font;
const dataUrl = (p) => 'data:image/png;base64,' + readFileSync(join(ROOT, p)).toString('base64');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = `<meta charset="utf-8"><link rel="stylesheet" href="${F.css}"><style>*{margin:0;padding:0;box-sizing:border-box}
  body{background:${C.bg};color:${C.ink};font-family:${F.body},system-ui,sans-serif;-webkit-font-smoothing:antialiased}</style>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'] });
const render = async (html, w, h, file) => {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.__fit && window.__fit());   /* a headline shrunk until it fits its box (artist frames) */
  await page.screenshot({ path: join(OUT, file), omitBackground: false });
  await page.close();
  console.log('  ' + K.out + '/' + file);
};

/* 1. phone screenshots: the band is the only text Play shows big, so one short line, no dashes */
for (const s of K.shots) {
  if (!existsSync(join(ROOT, s.src))) { console.log('  MISSING raw ' + s.src + ' (run the game shot driver first)'); process.exitCode = 1; continue; }
  if (s.overlay) {
    const [wx, wy, ww, wh] = K.frame.window, [hx, hy, hw, hh] = K.frame.headBox;
    await render(`${head}<body style="width:1080px;height:1920px;overflow:hidden;position:relative">
      <img src="${dataUrl(s.src)}" style="position:absolute;left:${wx}px;top:${wy}px;width:${ww}px;height:${wh}px;object-fit:contain">
      <img src="${dataUrl(s.overlay)}" style="position:absolute;left:0;top:0;width:1080px;height:1920px">
      <div id="hd" style="position:absolute;left:${hx}px;top:${hy}px;width:${hw}px;height:${hh}px;display:flex;align-items:center;
        font-family:${F.head};font-size:104px;line-height:.92;color:${C.ink};overflow:hidden">${esc(s.head)}</div>
      <script>window.__fit=()=>{const e=document.getElementById('hd');let f=104;while(f>40&&(e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1)){f-=2;e.style.fontSize=f+'px'}}</script></body>`, 1080, 1920, s.out);
    continue;
  }
  await render(`${head}<body style="width:1080px;height:1920px;overflow:hidden">
    <div style="height:240px;display:flex;align-items:center;justify-content:center;padding:0 70px;text-align:center;
      border-bottom:2px solid ${C.accent}33;font-family:${F.head};font-size:82px;line-height:1.05;letter-spacing:.005em">${esc(s.head)}</div>
    <img src="${dataUrl(s.src)}" style="display:block;width:1080px;height:1680px"></body>`, 1080, 1920, s.out);
}

/* 2. feature graphic */
if (K.feature && K.feature.art) {
  const fe = K.feature, [bx, by, bw, bh] = fe.box;
  await render(`${head}<body style="width:1024px;height:500px;overflow:hidden;position:relative">
    <img src="${dataUrl(fe.art)}" style="position:absolute;left:0;top:0;width:1024px;height:500px">
    <div id="hd" style="position:absolute;left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;display:flex;align-items:center;justify-content:center;
      font-family:${F.head};font-size:${Math.round(bh * 1.3)}px;line-height:1;letter-spacing:.14em;color:${C.accent};text-shadow:5px 5px 0 ${fe.shadow || '#000'};white-space:nowrap">${esc(fe.title)}</div></body>`, 1024, 500, fe.out || 'feature-graphic-1024x500.png');
}
else if (K.feature) {
  const fe = K.feature;
  const sw = (fe.swatches || []).map((c, i) => `<div style="display:flex;flex-direction:column;gap:12px">
      <div style="font-size:16px;letter-spacing:.24em;color:${C.dim};text-transform:uppercase">${i ? 'Yours' : 'Target'}</div>
      <div style="width:200px;height:150px;border-radius:22px;background:${c};box-shadow:0 22px 50px -24px #000,inset 0 0 0 1px #ffffff14"></div></div>`).join('');
  await render(`${head}<body style="width:1024px;height:500px;overflow:hidden;display:flex;align-items:center;padding:0 64px;gap:56px;
      background:radial-gradient(120% 140% at 0% 0%,#1a1a20 0%,${C.bg} 60%)">
    <div style="flex:1;display:flex;flex-direction:column;gap:18px">
      <div style="display:flex;align-items:center;gap:22px"><img src="${dataUrl(K.icon)}" style="width:96px;height:96px;border-radius:22px">
        <div style="font-family:${F.head};font-size:118px;line-height:1">${esc(fe.title)}</div></div>
      <div style="font-size:30px;font-weight:600;letter-spacing:.01em;line-height:1.3">${[].concat(fe.tagline).map(esc).join('<br>')}</div>
      ${fe.sub ? `<div style="font-size:19px;color:${C.dim};letter-spacing:.04em">${esc(fe.sub)}</div>` : ''}
    </div>
    ${sw ? `<div style="display:flex;gap:22px">${sw}</div>` : ''}
    ${fe.raw ? `<div style="flex:none;width:250px;height:420px;overflow:hidden;border-radius:22px;box-shadow:0 22px 50px -24px #000,inset 0 0 0 1px #ffffff14"><img src="${dataUrl(fe.raw)}" style="display:block;width:250px"></div>` : ''}</body>`, 1024, 500, 'feature-graphic-1024x500.png');
}

/* 3. the listing icon: the game's own 512 icon flattened onto the background (no alpha) */
if (K.icon) {
  const page = await browser.newPage(); await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:${C.bg}"><img src="${dataUrl(K.icon)}" style="display:block;width:512px;height:512px"></body>`);
  await page.screenshot({ path: join(OUT, 'play-icon-512.png'), omitBackground: false }); await page.close();
  console.log('  ' + K.out + '/play-icon-512.png');
}
await browser.close();
