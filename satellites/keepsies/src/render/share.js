/**
 * The share cards (KEEPSIES_BUILD_PLAN.md step 7; Astra's ship first number 3): a great shot should make a
 * story worth showing. Two cards on Astra's plates, composed on a canvas from live renders:
 *
 *   marble card 1080 x 1080   her render window, wordmark, name and provenance bands (m3 step 11, render/plates.js)
 *   match card  1080 x 1920   her ONE render window, score, techniques, the pot cloth with three pot renders, provenance, footer
 *
 * Her plates are dark with the windows cut out (share_*_r2.png: alpha 0 in the window), so the window's contents are drawn FIRST and the plate over
 * them. Nothing on a card identifies the player: no profile id, no uid, no name but the opponent's.
 * The file goes to navigator.share after the tap that asked for it, else it downloads.
 */
import { art } from './art.js?v=20261106a';
import { SHARE_MARBLE, SHARE_MATCH } from './plates.js?v=20261106a';

const CREAM = '#e8dcc8', BRASS = '#c8a84b', MUTED = '#98a086', NIGHT = '#0d100c';
const FONT = 'ui-rounded,"Avenir Next",Avenir,Corbel,"Segoe UI",system-ui,sans-serif';
const TIER_HEX = { common: '#b9b4a4', uncommon: '#85bda8', rare: '#91bce1', epic: '#d7a0d9', grail: '#e6c56a' };

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
let iconText = null;

/** A tier's mark from the one sprite, inked in the tier's colour, as an image a canvas can draw. */
const mark = (tier) => symbol(tier, TIER_HEX[tier] || CREAM, 96, 96);

/** Any symbol of the one sprite (a mark, Astra's wordmark) inked in one colour, as a drawable image. */
async function symbol(id, ink, w, h) {
  try {
    if (!iconText) iconText = await (await fetch(art('ui/icons.svg'))).text();
    const m = iconText.match(new RegExp('<symbol id="i-' + id + '" viewBox="([^"]+)">([\\s\\S]*?)</symbol>'));
    if (!m) return null;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="' + m[1] + '">'
      + m[2].replace(/currentColor/g, ink) + '</svg>';
    return await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  } catch (e) { return null; }
}

/** The dirt under a window: Astra's albedo, darkened toward the edges, so a marble lies on the lot. */
async function dirtWindow(g, x, y, w, h) {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#2a2119'; g.fillRect(x, y, w, h);
  try {
    const d = await loadImg(art('env/dirt_albedo.webp'));
    g.globalAlpha = 0.55;
    for (let yy = y; yy < y + h; yy += 512) for (let xx = x; xx < x + w; xx += 512) g.drawImage(d, xx, yy, 512, 512);
    g.globalAlpha = 1;
  } catch (e) { }
  const v = g.createRadialGradient(x + w / 2, y + h * 0.45, Math.min(w, h) * 0.2, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(13,16,12,0)'); v.addColorStop(1, 'rgba(13,16,12,.85)');
  g.fillStyle = v; g.fillRect(x, y, w, h);
  g.restore();
}

/** A marble render centred in a window, a soft shadow under it (Astra's ground shadow). */
async function lay(g, render, cx, cy, size) {
  try {
    const s = await loadImg(art('env/ground_shadow.png'));
    g.globalAlpha = 0.8; g.drawImage(s, cx - size * 0.42, cy + size * 0.33, size * 0.84, size * 0.2); g.globalAlpha = 1;
  } catch (e) { }
  if (render) g.drawImage(render, cx - size / 2, cy - size / 2, size, size);
}

function fit(g, text, font, max) {
  let px = font;
  for (; px > 18; px -= 2) { g.font = '600 ' + px + 'px ' + FONT; if (g.measureText(text).width <= max) break; }
  return px;
}

function wrap(g, text, x, y, w, lh, lines) {
  const words = String(text || '').split(/\s+/);
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const t = line ? line + ' ' + words[i] : words[i];
    if (g.measureText(t).width > w && line) {
      if (n === lines - 1) { g.fillText(line.replace(/[,.;:]?$/, '') + '...', x, y + n * lh); return; }
      g.fillText(line, x, y + n * lh); n++; line = words[i];
    } else line = t;
  }
  if (line) g.fillText(line, x, y + n * lh);
}

/**
 * The marble card on her plate. o: { render (a square canvas of the live render), name, lore, tier, tierWord, line }.
 * `line` is the marble's history in one line (inspect's latest event), never a player id.
 */
export async function marbleCard(o) {
  const P = SHARE_MARBLE, c = document.createElement('canvas');
  c.width = P.w; c.height = P.h;
  const g = c.getContext('2d'), W = P.render_window;
  g.fillStyle = NIGHT; g.fillRect(0, 0, P.w, P.h);
  await dirtWindow(g, W[0], W[1], W[2], W[3]);
  const size = 540, cx = W[0] + W[2] / 2, cy = W[1] + W[3] / 2 - 10;
  await lay(g, o.render, cx, cy, size);
  try { g.drawImage(await loadImg(art('sharing/share_marble_r2.png')), 0, 0, P.w, P.h); } catch (e) { }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const wm = await symbol('wordmark_keepsies', BRASS, 1000, 210), B = P.wordmark_band;
  if (wm) g.drawImage(wm, B[0] + B[2] / 2 - 200, B[1], 400, 84);
  else { g.fillStyle = BRASS; g.font = '600 48px ' + FONT; g.fillText('Keepsies', B[0] + B[2] / 2, B[1] + B[3] / 2); }
  const N = P.name_band;
  g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.name, 54, N[2] - 24) + 'px ' + FONT;
  g.fillText(o.name, N[0] + N[2] / 2, N[1] + N[3] / 2);
  // the tier by mark, word and colour together, then the history; the lore under it
  const Pv = P.provenance_band, m = await mark(o.tier);
  const words = (o.tierWord || '') + (o.line ? ', ' + o.line.charAt(0).toLowerCase() + o.line.slice(1) : '');
  g.font = '600 30px ' + FONT;
  const tw = Math.min(Pv[2] - 76, g.measureText(words).width), x0 = Pv[0] + Pv[2] / 2 - (tw + 48) / 2, y1 = Pv[1] + 28;
  if (m) g.drawImage(m, x0, y1 - 18, 36, 36);
  g.textAlign = 'left';
  g.fillStyle = TIER_HEX[o.tier] || CREAM;
  g.fillText(o.tierWord || '', x0 + 48, y1, Pv[2] - 60);
  const tierW = g.measureText(o.tierWord || '').width;
  g.fillStyle = CREAM;
  g.fillText(words.slice((o.tierWord || '').length), x0 + 48 + tierW, y1, Pv[2] - 60 - tierW);
  g.textAlign = 'center';
  g.fillStyle = MUTED; g.font = 'italic 26px ' + FONT;
  wrap(g, o.lore, Pv[0] + Pv[2] / 2, Pv[1] + 70, Pv[2] - 32, 30, 1);
  c.layout = { window: W, render: [cx - size / 2, cy - size / 2, size, size] };
  return c;
}

/**
 * The match card on her plate: ONE window, three places on the pot cloth. o: { title, hero { render, name, label }, pots (up to three square canvases), pot (the words),
 * score, shots, techniques }.
 */
export async function matchCard(o) {
  const P = SHARE_MATCH, c = document.createElement('canvas');
  c.width = P.w; c.height = P.h;
  const g = c.getContext('2d'), W = P.render_window;
  g.fillStyle = NIGHT; g.fillRect(0, 0, P.w, P.h);
  await dirtWindow(g, W[0], W[1], W[2], W[3]);
  const size = 780, cx = W[0] + W[2] / 2, cy = W[1] + W[3] / 2 - 50;
  if (o.hero) await lay(g, o.hero.render, cx, cy, size);
  try { g.drawImage(await loadImg(art('sharing/share_match_r2.png')), 0, 0, P.w, P.h); } catch (e) { }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const Tb = P.title_band;
  g.fillStyle = BRASS; g.font = '600 ' + fit(g, o.title, 84, Tb[2] - 40) + 'px ' + FONT;
  g.fillText(o.title, Tb[0] + Tb[2] / 2, Tb[1] + Tb[3] / 2);
  if (o.hero) {
    g.fillStyle = MUTED; g.font = '600 24px ' + FONT; g.fillText((o.hero.label || '').toUpperCase(), cx, W[1] + W[3] - 76);
    g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.hero.name || '', 38, W[2] - 80) + 'px ' + FONT; g.fillText(o.hero.name || '', cx, W[1] + W[3] - 38);
  }
  const Sb = P.score_band;
  g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.score || '', 46, Sb[2] - 40) + 'px ' + FONT; g.fillText(o.score || '', Sb[0] + Sb[2] / 2, Sb[1] + 42);
  g.fillStyle = MUTED; g.font = '30px ' + FONT; g.fillText(o.shots || '', Sb[0] + Sb[2] / 2, Sb[1] + 92);
  const Tc = P.techniques_band;
  if (o.techniques) { g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.techniques, 32, Tc[2] - 40) + 'px ' + FONT; g.fillText(o.techniques, Tc[0] + Tc[2] / 2, Tc[1] + Tc[3] / 2); }
  // the pot on her cloth: lift, dark shadow, render (her layer order)
  const pots = [], r = P.pot_render_radius, n = (o.pots || []).length, places = n === 1 ? [P.pot_render_centers[1]] : n === 2 ? [P.pot_render_centers[0], P.pot_render_centers[2]] : P.pot_render_centers;
  let lift = null, dark = null;
  try { lift = await loadImg(art('ui/contact_lift.png')); dark = await loadImg(art('env/shadow_dark.png')); } catch (e) { }
  for (let k = 0; k < Math.min(n, 3); k++) {
    const q = places[k], R = r * 2 * 256 / 224;
    if (lift) g.drawImage(lift, q[0] - R / 2, q[1] + r * 0.62 - R / 2, R, R);
    if (dark) g.drawImage(dark, q[0] - R / 2, q[1] + r * 0.62 - R / 2, R, R);
    g.drawImage(o.pots[k], q[0] - r, q[1] - r, r * 2, r * 2);
    pots.push([q[0] - r, q[1] - r, r * 2, r * 2]);
  }
  const Pv = P.provenance_band;
  g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.pot || '', 32, Pv[2] - 24) + 'px ' + FONT;
  g.fillText(o.pot || '', Pv[0] + Pv[2] / 2, Pv[1] + Pv[3] / 2);
  const Fb = P.footer_band, wm = await symbol('wordmark_keepsies', BRASS, 1000, 210);
  if (wm) g.drawImage(wm, Fb[0] + Fb[2] / 2 - 114, Fb[1], 228, 48);
  else { g.fillStyle = BRASS; g.font = '600 32px ' + FONT; g.fillText('Keepsies', Fb[0] + Fb[2] / 2, Fb[1] + Fb[3] / 2); }
  c.layout = { window: W, render: [cx - size / 2, cy - size / 2, size, size], pots, cloth: P.pot_cloth_box };
  return c;
}

/** Hand a card to the share sheet (after the tap that asked), else download it. Never throws. */
export async function shareCanvas(canvas, filename, title) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  if (!blob) return 'failed';
  try {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return 'shared';
    }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
}
