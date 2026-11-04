/**
 * The share cards (KEEPSIES_BUILD_PLAN.md step 7; Astra's ship first number 3): a great shot should make a
 * story worth showing. Two cards on Astra's plates, composed on a canvas from live renders:
 *
 *   marble card 1080 x 1080   the window 90, 90, 900 by 630; bands at 730 (name), 800 (lore), 920 (tier and
 *                             history), from anchors.json marble_card
 *   match card  1080 x 1920   two windows 420 by 660 at 90 and 570, 280; bands at 90 (the result), 1000 (the
 *                             pot), 1150 (the match), 1500 (the name of the game), anchors.json match_card
 *
 * Her plates are dark with the windows cut out, so the window's contents are drawn FIRST and the plate over
 * them. Nothing on a card identifies the player: no profile id, no uid, no name but the opponent's.
 * The file goes to navigator.share after the tap that asked for it, else it downloads.
 */
import { art } from './art.js?v=20261105a';

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
 * The marble card. o: { render (a square canvas of the live render), name, lore, tier, tierWord, line }.
 * `line` is the marble's history in one line (inspect's latest event), never a player id.
 */
export async function marbleCard(o) {
  const c = document.createElement('canvas');
  c.width = c.height = 1080;
  const g = c.getContext('2d');
  g.fillStyle = NIGHT; g.fillRect(0, 0, 1080, 1080);
  await dirtWindow(g, 90, 90, 900, 630);
  await lay(g, o.render, 540, 395, 540);
  try { g.drawImage(await loadImg(art('sharing/marble_card.png')), 0, 0, 1080, 1080); } catch (e) { }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  // the name stands on the plate's first rule (770), not across it
  g.fillStyle = CREAM; g.font = '600 ' + fit(g, o.name, 54, 880) + 'px ' + FONT;
  g.fillText(o.name, 540, 740);
  g.fillStyle = MUTED; g.font = 'italic 30px ' + FONT;
  wrap(g, o.lore, 540, 823, 860, 38, 2);
  // the tier by mark, word and colour together, then the history
  const m = await mark(o.tier);
  const words = (o.tierWord || '') + (o.line ? ', ' + o.line.charAt(0).toLowerCase() + o.line.slice(1) : '');
  g.font = '600 32px ' + FONT;
  const tw = g.measureText(words).width, x0 = 540 - (tw + 52) / 2;
  if (m) g.drawImage(m, x0, 925, 40, 40);
  g.textAlign = 'left';
  g.fillStyle = TIER_HEX[o.tier] || CREAM;
  g.fillText(o.tierWord || '', x0 + 52, 946);
  const tierW = g.measureText(o.tierWord || '').width;
  g.fillStyle = CREAM;
  g.fillText(words.slice((o.tierWord || '').length), x0 + 52 + tierW, 946);
  const wm = await symbol('wordmark_keepsies', BRASS, 1000, 210);
  if (wm) g.drawImage(wm, 540 - 105, 1002, 210, 44);
  else { g.textAlign = 'center'; g.fillStyle = BRASS; g.font = '600 26px ' + FONT; g.fillText('Keepsies', 540, 1024); }
  return c;
}

/**
 * The match card. o: { title, left, right (each { render, name, label }), pot, stats (lines) }.
 * The two windows are the two sides of the pot: yours on the left, theirs on the right.
 */
export async function matchCard(o) {
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1920;
  const g = c.getContext('2d');
  g.fillStyle = NIGHT; g.fillRect(0, 0, 1080, 1920);
  const sides = [[90, o.left], [570, o.right]];
  for (const [x, s] of sides) {
    await dirtWindow(g, x, 280, 420, 660);
    if (s) await lay(g, s.render, x + 210, 560, 330);
  }
  try { g.drawImage(await loadImg(art('sharing/match_card.png')), 0, 0, 1080, 1920); } catch (e) { }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = BRASS; g.font = '600 ' + fit(g, o.title, 84, 880) + 'px ' + FONT;
  g.fillText(o.title, 540, 155);
  for (const [x, s] of sides) {
    if (!s) continue;
    g.fillStyle = MUTED; g.font = '600 24px ' + FONT; g.fillText((s.label || '').toUpperCase(), x + 210, 820);
    g.fillStyle = CREAM; g.font = '600 ' + fit(g, s.name || '', 34, 380) + 'px ' + FONT; g.fillText(s.name || '', x + 210, 870);
  }
  g.fillStyle = CREAM; g.font = '600 38px ' + FONT;
  wrap(g, o.pot, 540, 1030, 880, 46, 2);
  g.fillStyle = MUTED; g.font = '30px ' + FONT;
  (o.stats || []).slice(0, 5).forEach((t, i) => g.fillText(t, 540, 1190 + i * 44));
  const wm = await symbol('wordmark_keepsies', BRASS, 1000, 210);
  if (wm) g.drawImage(wm, 540 - 300, 1500, 600, 126);
  else { g.fillStyle = BRASS; g.font = '600 64px ' + FONT; g.fillText('Keepsies', 540, 1560); }
  g.fillStyle = MUTED; g.font = '28px ' + FONT; g.fillText('Marbles, for keeps', 540, 1660);
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
