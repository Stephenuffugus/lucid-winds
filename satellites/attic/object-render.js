/* ════════════════════════════════════════════════════════════════════
   OBJECT RENDERER — hash → SVG for the nine non-record classes: VHS
   clamshell, carded TOY, BOARD GAME lid, CEREAL box, COMIC cover, mass
   market PAPERBACK, photocopied ZINE, LCD HANDHELD, steel LUNCHBOX.
   Same laws as sleeve-render.js: era drives the visual language,
   CONDITION renders as real wear, every roll comes off the hash,
   300x300 viewBox, system fonts, ES5, node + browser.
   Voice law: original fake brands only, no real trademarks, no em-dashes.
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports)
    ? require('./attic-engine.js') : root.ATTIC;
  var S = (typeof module !== 'undefined' && module.exports)
    ? require('./sleeve-render.js') : root.ATTIC_SLEEVE;

  function hb(h, n) { return parseInt(h.substr(n * 2, 2), 16); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function fit(text, max, avail) { return Math.min(max, (avail || 260) / (Math.max(6, String(text).length) * 0.72)); }
  /* ⛔ NEVER PICK INK BY EYE FROM ONE ERA. Five palettes go through every
     renderer, so a colour that reads on the 1950s cream field is invisible on
     the 1980s near black one. The paperback title was drawn in c[2] on c[1]:
     dark red on dark grey in the 1990s palette, a title you could not read at
     any size. Ask the background what colour it can carry. */
  function lum(hex) {
    var h2 = String(hex).replace('#', '');
    if (h2.length === 3) h2 = h2[0] + h2[0] + h2[1] + h2[1] + h2[2] + h2[2];
    var r = parseInt(h2.substr(0, 2), 16) / 255, g2 = parseInt(h2.substr(2, 2), 16) / 255, b = parseInt(h2.substr(4, 2), 16) / 255;
    return 0.2126 * r + 0.7152 * g2 + 0.0722 * b;
  }
  function inkOn(bg) { return lum(bg) > 0.42 ? '#17130d' : '#f6efdd'; }

  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif' },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: 'Georgia, serif' },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Georgia, serif' },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif' },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace' }
  };

  /* ⛔ ONE DUST RENDERER, IN sleeve-render.js. This file used to carry a
     second copy of the grime, so the record's dust and everything else's dust
     were two functions that had to be tuned twice and would have drifted the
     first time either one was. object-render already imports sleeve-render,
     so it asks for it. Grade is not passed in here at all, which is the point.
     Everything the player sees before they wipe has to be identical whether
     the thing under it is TRASHED or FACTORY SEALED. */
  function grime(h, bx, by, bw, bh) { return S.grime(h, bx, by, bw, bh); }

  /* ════════════════════════════════════════════════════════════════════
     DAMAGE PRIMITIVES. A condition tier has to read as DAMAGE at 90px, not
     as a rendering artefact. The old TRASHED layer was a pale rectangle at
     the top left plus a 2px white line all the way across, which reads as a
     scanline and a clipping bug (seen at 240px, 2026-08-23). Everything in
     here is drawn the way the real damage looks: a tear shows the material
     under it, a crease has a shadow on one side of it, tape is amber and
     sits ON TOP of the thing it is repairing.
     ⛔ A COMIC DOES NOT WEAR THE WAY A RECORD WEARS. Ten families, ten tell
     sets, dispatched on `kind` at the bottom of this block. If you add a
     family, add its tells, or it silently falls back to the generic box. */
  function jag(x1, y1, x2, y2, amp, seed, n) {
    var d = 'M' + x1 + ' ' + y1, i, t, px, py, nx = -(y2 - y1), ny = (x2 - x1);
    var L = Math.sqrt(nx * nx + ny * ny) || 1; nx /= L; ny /= L;
    for (i = 1; i <= n; i++) {
      t = i / n;
      px = x1 + (x2 - x1) * t; py = y1 + (y2 - y1) * t;
      var k = ((seed * (i + 7) * 2654435761) >>> 0) % 200 / 100 - 1;
      d += ' L' + (px + nx * k * amp).toFixed(1) + ' ' + (py + ny * k * amp).toFixed(1);
    }
    return d;
  }
  /* a torn corner: the shape is REMOVED and the paper stock under it shows,
     with a dark bruise along the tear so it does not read as a white block */
  function tornCorner(bx, by, bw, bh, corner, seed, stock) {
    var s = 26 + (seed % 16), x0, y0, x1, y1, x2, y2;
    if (corner === 0) { x0 = bx; y0 = by; x1 = bx + s; y1 = by; x2 = bx; y2 = by + s; }
    else if (corner === 1) { x0 = bx + bw; y0 = by; x1 = bx + bw - s; y1 = by; x2 = bx + bw; y2 = by + s; }
    else if (corner === 2) { x0 = bx; y0 = by + bh; x1 = bx + s; y1 = by + bh; x2 = bx; y2 = by + bh - s; }
    else { x0 = bx + bw; y0 = by + bh; x1 = bx + bw - s; y1 = by + bh; x2 = bx + bw; y2 = by + bh - s; }
    var edge = jag(x1, y1, x2, y2, 4, seed, 6);
    return '<path d="M' + x0 + ' ' + y0 + ' L' + x1 + ' ' + y1 + ' ' + edge.slice(1) + ' Z" fill="' + (stock || '#cfc3a8') + '"/>'
      + '<path d="' + edge + '" fill="none" stroke="#4a3d2a" stroke-width="1.6" opacity="0.55"/>';
  }
  /* a crease reads as a fold because it has a LIT side and a SHADOW side.
     One flat white line is a scanline and that is exactly what shipped. */
  function crease(x1, y1, x2, y2, w) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / L, ny = dx / L;
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff8e8" stroke-width="' + (w || 1.6) + '" opacity="0.5"/>'
      + '<line x1="' + (x1 + nx * (w || 1.6)) + '" y1="' + (y1 + ny * (w || 1.6)) + '" x2="' + (x2 + nx * (w || 1.6)) + '" y2="' + (y2 + ny * (w || 1.6)) + '" stroke="#2a2116" stroke-width="' + (w || 1.6) + '" opacity="0.4"/>';
  }
  /* tape is a REPAIR: amber, translucent, with hard cut ends and a shine */
  function tape(cx, cy, w, hgt, rot) {
    return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" opacity="0.82">'
      + '<rect x="' + (cx - w / 2) + '" y="' + (cy - hgt / 2) + '" width="' + w + '" height="' + hgt + '" fill="#d8c48a" opacity="0.5"/>'
      + '<rect x="' + (cx - w / 2) + '" y="' + (cy - hgt / 2) + '" width="' + w + '" height="' + hgt + '" fill="none" stroke="#a8925c" stroke-width="0.9" opacity="0.8"/>'
      + '<rect x="' + (cx - w / 2) + '" y="' + (cy - hgt / 2 + 1.5) + '" width="' + w + '" height="2" fill="#fff6dc" opacity="0.45"/></g>';
  }
  function stain(cx, cy, r, tone) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 0.82) + '" fill="' + (tone || '#6b4f24') + '" opacity="0.2"/>'
      + '<ellipse cx="' + (cx + r * 0.2) + '" cy="' + (cy - r * 0.15) + '" rx="' + (r * 0.6) + '" ry="' + (r * 0.5) + '" fill="' + (tone || '#6b4f24') + '" opacity="0.16"/>';
  }
  function ring(cx, cy, r, tone) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + (tone || '#6b4f24') + '" stroke-width="3" opacity="0.3"/>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (tone || '#6b4f24') + '" opacity="0.07"/>';
  }
  function scuff(x, y, w, hgt, op) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hgt + '" rx="' + (hgt / 2) + '" fill="#ffffff" opacity="' + (op || 0.16) + '"/>';
  }
  function rustDots(h, bx, by, bw, bh, n, seed) {
    var s = '', i, a, b2, r;
    for (i = 0; i < n; i++) {
      a = bx + 4 + (hb(h, 20 + (i % 8)) * (i + 3) + seed * 17) % Math.max(1, bw - 8);
      b2 = by + 4 + (hb(h, 21 + (i % 7)) * (i + 5) + seed * 29) % Math.max(1, bh - 8);
      r = 1.4 + (i % 3);
      s += '<circle cx="' + a + '" cy="' + b2 + '" r="' + r + '" fill="#9a5a24" opacity="0.55"/>'
        + '<circle cx="' + a + '" cy="' + b2 + '" r="' + (r * 1.9) + '" fill="#9a5a24" opacity="0.14"/>';
    }
    return s;
  }
  function priceSticker(h, px, py, big) {
    var rx = big ? 26 : 24, ry = big ? 14 : 13;
    return '<g transform="rotate(' + (-6 + hb(h, 24) % 12) + ' ' + px + ' ' + py + ')">'
      + '<ellipse cx="' + px + '" cy="' + py + '" rx="' + rx + '" ry="' + ry + '" fill="#f5efdd" stroke="#c9bfa4" stroke-width="1"/>'
      + '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#5a4f3a">$' + (1 + hb(h, 25) % 5) + '.99</text></g>';
  }
  /* SHRINKWRAP. Two crossing highlights and a heat seam, which is what a
     wrapped object actually looks like: the gloss does not follow the art. */
  function shrink(bx, by, bw, bh) {
    return '<path d="M' + bx + ' ' + (by + bh * 0.7) + ' L' + (bx + bw) + ' ' + (by + bh * 0.2) + ' l0 26 L' + bx + ' ' + (by + bh * 0.7 + 26) + ' Z" fill="#ffffff" opacity="0.17"/>'
      + '<path d="M' + bx + ' ' + (by + bh * 0.78) + ' L' + (bx + bw) + ' ' + (by + bh * 0.28) + ' l0 7 L' + bx + ' ' + (by + bh * 0.78 + 7) + ' Z" fill="#ffffff" opacity="0.32"/>'
      + '<path d="M' + (bx + bw * 0.18) + ' ' + by + ' L' + (bx + bw * 0.62) + ' ' + (by + bh) + '" stroke="#ffffff" stroke-width="1.4" opacity="0.22"/>'
      + '<rect x="' + (bx - 3) + '" y="' + (by - 3) + '" width="' + (bw + 6) + '" height="' + (bh + 6) + '" rx="4" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.28"/>';
  }

  /* ── the ten tell sets ──────────────────────────────────────────── */
  var TELLS = {
    _box: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      if (heavy || mid) s += '<path d="M' + x + ' ' + y + ' l20 0 l-20 20 Z" fill="#ffffff" opacity="0.2"/>'
        + '<path d="M' + (x + w) + ' ' + (y + hh) + ' l-20 0 l20 -20 Z" fill="#ffffff" opacity="0.17"/>';
      if (heavy) s += tornCorner(x, y, w, hh, 1, hb(h, 20), '#cfc3a8')
        + crease(x + w * 0.18, y + hh * 0.15, x + w * 0.7, y + hh * 0.86, 1.8)
        + stain(x + w * 0.3, y + hh * 0.72, 22);
      return s;
    },
    VHS: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      if (mid) s += scuff(x + 18, y + hh * 0.28, w - 40, 5, 0.13) + scuff(x + 26, y + hh * 0.62, w - 56, 4, 0.1);
      if (heavy) {
        /* the clamshell cracks, the label peels, the sleeve gets taped shut */
        s += '<path d="' + jag(x + 8, y + hh * 0.2, x + w - 10, y + hh * 0.46, 5, hb(h, 20) + 1, 7) + '" fill="none" stroke="#f0ece0" stroke-width="2.2" opacity="0.75"/>'
          + '<path d="' + jag(x + 8, y + hh * 0.2, x + w - 10, y + hh * 0.46, 5, hb(h, 20) + 1, 7) + '" fill="none" stroke="#000000" stroke-width="4" opacity="0.2" transform="translate(1.5,2)"/>'
          + '<path d="M' + (x + w - 44) + ' ' + (y + hh - 62) + ' l38 0 l-6 18 l-32 -4 Z" fill="#efe8d2" opacity="0.85"/>'
          + tape(x + w / 2, y + hh - 8, w * 0.7, 16, -3)
          + stain(x + 30, y + 40, 20);
      }
      return s;
    },
    TOY: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      /* the hang hole tears out. It is the first thing that goes on a card
         and it is the tell a collector looks for first. */
      if (mid) s += crease(x + 14, y + hh * 0.3, x + w - 16, y + hh * 0.24, 1.4);
      if (heavy) {
        s += '<path d="M' + (x + w / 2 - 16) + ' ' + (y + 10) + ' q 16 -8 32 0 l-4 20 q -12 6 -24 0 Z" fill="#cfc3a8"/>'
          + '<path d="M' + (x + w / 2 - 10) + ' ' + (y + 14) + ' l10 18 l10 -18" fill="none" stroke="#4a3d2a" stroke-width="1.5" opacity="0.6"/>'
          + crease(x + 12, y + hh * 0.62, x + w - 12, y + hh * 0.55, 2)
          + '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="' + (hh - 16) + '" rx="5" fill="#b58a3c" opacity="0.16"/>'
          + tornCorner(x, y, w, hh, 3, hb(h, 21), '#cfc3a8');
      }
      return s;
    },
    GAME: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      if (mid) s += ring(x + w * 0.74, y + hh * 0.3, 26) + scuff(x + 14, y + 8, w - 28, 5, 0.14);
      if (heavy) {
        /* a lid splits at the corner and gets taped, and the box gets sat on */
        s += '<path d="M' + x + ' ' + (y + hh * 0.42) + ' l' + (w * 0.26) + ' -10" stroke="#f2ecdc" stroke-width="2.4" opacity="0.7" fill="none"/>'
          + tape(x + w * 0.13, y + hh * 0.4, 56, 18, -14)
          + tornCorner(x, y, w, hh, 3, hb(h, 22), '#c9b98f')
          + stain(x + w * 0.36, y + hh * 0.78, 26)
          + crease(x + w * 0.55, y, x + w * 0.48, y + hh, 2.2);
      }
      return s;
    },
    CEREAL: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      /* the coupon on the back gets cut out and it goes THROUGH the box */
      if (mid) s += crease(x + 6, y + hh * 0.42, x + w - 6, y + hh * 0.38, 1.6) + scuff(x + 10, y + 6, w - 20, 6, 0.12);
      if (heavy) {
        s += '<path d="M' + x + ' ' + (y + 18) + ' q ' + (w * 0.3) + ' 14 ' + (w * 0.55) + ' -4 q ' + (w * 0.3) + ' -12 ' + (w * 0.45) + ' 8 l0 -22 l-' + w + ' 0 Z" fill="#000000" opacity="0.28"/>'
          + '<rect x="' + (x + w * 0.2) + '" y="' + (y + hh * 0.66) + '" width="' + (w * 0.34) + '" height="' + (hh * 0.12) + '" fill="#cfc3a8"/>'
          + '<rect x="' + (x + w * 0.2) + '" y="' + (y + hh * 0.66) + '" width="' + (w * 0.34) + '" height="' + (hh * 0.12) + '" fill="none" stroke="#4a3d2a" stroke-width="1.2" opacity="0.5" stroke-dasharray="3 2"/>'
          + crease(x + w * 0.3, y, x + w * 0.42, y + hh, 2.4)
          + stain(x + w * 0.7, y + hh * 0.5, 24);
      }
      return s;
    },
    COMIC: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      /* SPINE ROLL is the comic tell: the whole book curls away from the
         staples, so the left edge carries a shadow and the cover bows. */
      if (mid || heavy) s += '<path d="M' + (x + 6) + ' ' + y + ' q 8 ' + (hh / 2) + ' 0 ' + hh + ' l-6 0 l0 -' + hh + ' Z" fill="#000000" opacity="' + (heavy ? 0.3 : 0.16) + '"/>'
        + '<circle cx="' + (x + 5) + '" cy="' + (y + hh * 0.26) + '" r="3" fill="#9a5a24" opacity="' + (heavy ? 0.75 : 0.4) + '"/>'
        + '<circle cx="' + (x + 5) + '" cy="' + (y + hh * 0.74) + '" r="3" fill="#9a5a24" opacity="' + (heavy ? 0.75 : 0.4) + '"/>';
      if (mid) s += '<path d="M' + (x + w) + ' ' + (y + 26) + ' l-22 -22 l22 0 Z" fill="#ffffff" opacity="0.22"/>'
        + crease(x + w - 30, y + 6, x + w - 4, y + 34, 1.3);
      if (heavy) {
        s += tape(x + 7, y + hh * 0.5, 16, hh * 0.62, 0)
          + tornCorner(x, y, w, hh, 1, hb(h, 23), '#e8dfc4')
          + crease(x + w * 0.2, y + hh * 0.1, x + w * 0.86, y + hh * 0.42, 1.8)
          + stain(x + w * 0.5, y + hh * 0.86, 30, '#7a5a2a')
          + '<rect x="' + x + '" y="' + (y + hh - 18) + '" width="' + w + '" height="18" fill="#7a5a2a" opacity="0.22"/>';
      }
      return s;
    },
    PAPERBACK: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '', i;
      /* SPINE CREASES: white lines up the spine, the exact thing a reader
         puts into a paperback and can never take out again. */
      if (mid) for (i = 0; i < 3; i++) s += '<rect x="' + (x + 2) + '" y="' + (y + 40 + i * 62 + hb(h, 20 + i) % 22) + '" width="11" height="2.4" fill="#fbf3e2" opacity="0.65"/>';
      if (heavy) {
        for (i = 0; i < 6; i++) s += '<rect x="' + (x + 2) + '" y="' + (y + 22 + i * 40 + hb(h, 20 + i) % 16) + '" width="11" height="3" fill="#fbf3e2" opacity="0.8"/>';
        /* dog ear: an actual folded triangle with the page stock showing */
        s += '<path d="M' + (x + w) + ' ' + (y + hh) + ' l-34 0 l34 -34 Z" fill="#0d0a06" opacity="0.35"/>'
          + '<path d="M' + (x + w - 34) + ' ' + (y + hh) + ' l34 -34 l0 34 Z" fill="#e6d9b4"/>'
          + '<path d="M' + (x + w - 34) + ' ' + (y + hh) + ' l34 -34" stroke="#8a7549" stroke-width="1.2" fill="none"/>'
          + crease(x + w * 0.22, y + 8, x + w * 0.3, y + hh - 8, 1.6)
          + stain(x + w * 0.66, y + hh * 0.3, 24, '#7a5a2a');
      }
      /* the page block yellows on everything below FINE */
      if (mid || heavy) s += '<rect x="' + (x + w - 9) + '" y="' + (y + 3) + '" width="9" height="' + (hh - 6) + '" fill="#b98f4a" opacity="' + (heavy ? 0.55 : 0.3) + '"/>';
      return s;
    },
    ZINE: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      /* it was folded in half to go in an envelope, always */
      s += crease(x, y + hh * 0.5, x + w, y + hh * 0.5, mid || heavy ? 2 : 1.1);
      if (mid) s += ring(x + w * 0.7, y + hh * 0.24, 24, '#7a5a2a') + '<circle cx="' + (x + 8) + '" cy="' + (y + 30) + '" r="2.6" fill="#9a5a24" opacity="0.6"/>';
      if (heavy) {
        /* the toner lifts, the staple rusts through, the coupon is gone */
        s += '<rect x="' + (x + w * 0.12) + '" y="' + (y + hh * 0.3) + '" width="' + (w * 0.7) + '" height="14" fill="#ffffff" opacity="0.4"/>'
          + '<rect x="' + (x + w * 0.3) + '" y="' + (y + hh * 0.58) + '" width="' + (w * 0.5) + '" height="8" fill="#ffffff" opacity="0.3"/>'
          + '<circle cx="' + (x + 8) + '" cy="' + (y + 30) + '" r="4" fill="#9a5a24" opacity="0.8"/>'
          + '<circle cx="' + (x + 8) + '" cy="' + (y + hh - 30) + '" r="4" fill="#9a5a24" opacity="0.8"/>'
          + '<path d="M' + (x + w) + ' ' + (y + hh) + ' l-30 0 l30 -26 Z" fill="#cfc3a8"/>'
          + stain(x + w * 0.4, y + hh * 0.8, 26, '#6b4f24');
      }
      return s;
    },
    HANDHELD: function (h, g, x, y, w, hh, heavy, mid, scr) {
      var s = '', i;
      scr = scr || { x: x + 22, y: y + 30, w: w - 44, h: 96 };
      /* screen scratches first, then a DEAD SEGMENT, which is the tell that
         actually kills the value of a handheld */
      if (mid || heavy) for (i = 0; i < (heavy ? 5 : 2); i++)
        s += '<line x1="' + (scr.x + 6 + (hb(h, 20 + i) % Math.max(1, scr.w - 20))) + '" y1="' + (scr.y + 4) + '" x2="' + (scr.x + 10 + (hb(h, 22 + i) % Math.max(1, scr.w - 14))) + '" y2="' + (scr.y + scr.h - 4) + '" stroke="#ffffff" stroke-width="0.9" opacity="0.3"/>';
      if (heavy) {
        s += '<rect x="' + (scr.x + 6 + hb(h, 21) % Math.max(1, scr.w - 40)) + '" y="' + (scr.y + 10 + hb(h, 23) % Math.max(1, scr.h - 30)) + '" width="26" height="12" fill="#0a1408" opacity="0.85"/>'
          + '<rect x="' + (x + w * 0.3) + '" y="' + (y + hh - 22) + '" width="' + (w * 0.4) + '" height="14" rx="3" fill="#7fae6a" opacity="0.5"/>'
          + '<rect x="' + (x + w * 0.3) + '" y="' + (y + hh - 22) + '" width="' + (w * 0.4) + '" height="14" rx="3" fill="none" stroke="#4d7a3c" stroke-width="1.4" opacity="0.7"/>'
          + tornCorner(x, y, w, hh, 2, hb(h, 24), '#a89c88')
          + '<path d="' + jag(x + 4, y + hh * 0.72, x + w * 0.5, y + hh * 0.62, 3, hb(h, 25) + 3, 5) + '" fill="none" stroke="#f2efe6" stroke-width="1.8" opacity="0.6"/>';
      }
      if (mid) s += scuff(x + w * 0.24, y + hh - 40, w * 0.5, 6, 0.13);
      return s;
    },
    LUNCHBOX: function (h, g, x, y, w, hh, heavy, mid) {
      var s = '';
      if (mid) s += rustDots(h, x + 4, y + 4, w - 8, hh - 8, 5, 3)
        + '<ellipse cx="' + (x + w * 0.7) + '" cy="' + (y + hh * 0.62) + '" rx="26" ry="18" fill="#000000" opacity="0.14"/>';
      if (heavy) {
        /* dents read as a dark pool with a hard bright rim on the light side,
           and the litho scrapes off at the edges down to bare steel */
        s += '<ellipse cx="' + (x + w * 0.34) + '" cy="' + (y + hh * 0.44) + '" rx="30" ry="21" fill="#000000" opacity="0.26"/>'
          + '<path d="M' + (x + w * 0.34 - 26) + ' ' + (y + hh * 0.44 - 8) + ' a 30 21 0 0 1 46 -6" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>'
          + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" fill="#8f8a80" opacity="0.65"/>'
          + '<rect x="' + x + '" y="' + (y + hh - 7) + '" width="' + w + '" height="7" fill="#8f8a80" opacity="0.55"/>'
          + rustDots(h, x + 2, y + 2, w - 4, hh - 4, 14, 9)
          + '<path d="' + jag(x + w * 0.12, y + hh, x + w * 0.2, y + hh * 0.4, 4, hb(h, 26) + 5, 6) + '" fill="none" stroke="#8f8a80" stroke-width="2.4" opacity="0.7"/>';
      }
      return s;
    }
  };
  /* a sealed object is wrapped, bagged or carded, and that differs per family */
  var SEALED = {
    _box: function (h, x, y, w, hh) { return shrink(x, y, w, hh); },
    COMIC: function (h, x, y, w, hh) {
      return '<rect x="' + (x - 5) + '" y="' + (y - 6) + '" width="' + (w + 10) + '" height="' + (hh + 14) + '" rx="2" fill="#dfe9f2" opacity="0.14"/>'
        + '<rect x="' + (x - 5) + '" y="' + (y - 6) + '" width="' + (w + 10) + '" height="' + (hh + 14) + '" rx="2" fill="none" stroke="#eaf3ff" stroke-width="1.6" opacity="0.5"/>'
        + '<rect x="' + (x - 5) + '" y="' + (y + hh + 2) + '" width="' + (w + 10) + '" height="6" fill="#eaf3ff" opacity="0.35"/>'
        + '<path d="M' + (x + w * 0.1) + ' ' + (y - 6) + ' L' + (x + w * 0.55) + ' ' + (y + hh + 8) + '" stroke="#ffffff" stroke-width="10" opacity="0.1"/>'
        + '<path d="M' + (x + w * 0.45) + ' ' + (y - 6) + ' L' + (x + w * 0.95) + ' ' + (y + hh + 8) + '" stroke="#ffffff" stroke-width="5" opacity="0.13"/>';
    },
    ZINE: function (h, x, y, w, hh) {
      return '<rect x="' + (x - 6) + '" y="' + (y + hh * 0.24) + '" width="' + (w + 12) + '" height="' + (hh * 0.52) + '" fill="#e6ddc4" opacity="0.9"/>'
        + '<rect x="' + (x - 6) + '" y="' + (y + hh * 0.24) + '" width="' + (w + 12) + '" height="' + (hh * 0.52) + '" fill="none" stroke="#b9ac8c" stroke-width="1.4"/>'
        + '<rect x="' + (x + 10) + '" y="' + (y + hh * 0.34) + '" width="' + (w * 0.5) + '" height="7" fill="#5a4f3a" opacity="0.5"/>'
        + '<rect x="' + (x + 10) + '" y="' + (y + hh * 0.46) + '" width="' + (w * 0.36) + '" height="6" fill="#5a4f3a" opacity="0.4"/>'
        + '<rect x="' + (x + w * 0.62) + '" y="' + (y + hh * 0.3) + '" width="34" height="26" fill="#c4a86a" opacity="0.8"/>'
        + '<text x="' + (x + w * 0.62 + 17) + '" y="' + (y + hh * 0.3 + 17) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#4a3d20">STAMP</text>';
    },
    HANDHELD: function (h, x, y, w, hh) {
      return '<rect x="' + (x - 12) + '" y="' + (y - 16) + '" width="' + (w + 24) + '" height="' + (hh + 30) + '" rx="7" fill="#f2ecdc" opacity="0.2"/>'
        + '<rect x="' + (x - 12) + '" y="' + (y - 16) + '" width="' + (w + 24) + '" height="' + (hh + 30) + '" rx="7" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.45"/>'
        + '<ellipse cx="' + (x + w / 2) + '" cy="' + (y - 8) + '" rx="12" ry="5" fill="#ffffff" opacity="0.55"/>'
        + shrink(x, y, w, hh);
    },
    LUNCHBOX: function (h, x, y, w, hh) {
      return shrink(x, y, w, hh)
        + '<rect x="' + (x + w * 0.28) + '" y="' + (y + hh * 0.34) + '" width="' + (w * 0.44) + '" height="' + (hh * 0.3) + '" fill="#f5efdd" opacity="0.9"/>'
        + '<text x="' + (x + w / 2) + '" y="' + (y + hh * 0.46) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#5a4f3a">PACKING</text>'
        + '<text x="' + (x + w / 2) + '" y="' + (y + hh * 0.56) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#5a4f3a">INSERT</text>';
    }
  };

  /* wear dispatch. `opts.kind` picks the family's tell set, `opts.sy` is where
     a price sticker would actually have been slapped on THIS shape measured
     from the top of the object (the default 16 is right for a clamshell and
     was wrong for a cereal box, where it landed square on the MORNING FOODS
     banner). grade === '?' means unrevealed: no condition marks at all. */
  /* ⛔ SEVEN GRADES, SEVEN PICTURES. Shipped with three: heavy fired on
     TRASHED, mid fired on PLAYED and GOOD, and FINE, NEAR MINT and MINT were
     the identical drawing with the price sticker in a slightly different spot.
     Seen on the contact sheet 2026-08-24: six of the seven columns of the
     cereal row were the same box. A ladder you cannot see is not a ladder, and
     wiping to NEAR MINT has to LOOK better than wiping to FINE. */
  /* ⛔ ONE RAMP, IN sleeve-render.js. It used to live here only, which is how
     the record class ended up with three visible grades while everything else
     had seven. */
  var LEVEL = { 'TRASHED': 0, 'PLAYED': 1, 'GOOD': 2, 'FINE': 3, 'NEAR MINT': 4, 'MINT': 5, 'FACTORY SEALED': 6 };
  function wear(h, grade, bx, by, bw, bh, opts) {
    if (typeof opts === 'number') opts = { sy: opts };
    opts = opts || {};
    var sy = typeof opts.sy === 'number' ? opts.sy : 16;
    if (grade === '?') return grime(h, bx, by, bw, bh);
    var lv = LEVEL[grade];
    if (typeof lv !== 'number') lv = 2;
    var heavy = lv === 0, mid = lv === 1 || lv === 2;
    var t = TELLS[opts.kind] || TELLS._box;
    var w = t(h, grade, bx, by, bw, bh, heavy, mid, opts.scr);
    /* the age wash and the top of the ladder: every step is a little cleaner
       than the one below it, so two cards side by side always differ */
    w += S.ramp(grade, bx, by, bw, bh);
    if (lv <= 4) w += priceSticker(h, bx + bw - 34 - hb(h, 22) % 20, by + sy + hb(h, 23) % 24);
    if (lv === 6) w += (SEALED[opts.kind] || SEALED._box)(h, bx, by, bw, bh);
    return w;
  }

  function shadow(bx, by, bw, bh) {
    return '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh + 6) + '" rx="' + (bw * 0.52) + '" ry="9" fill="#000000" opacity="0.25"/>';
  }

  // ── VHS: black clamshell, era cover art, title band, rental label ──
  function drawVHS(h, it, look, gr) {
    var c = look.c, bx = 62, by = 12, bw = 176, bh = 272;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="6" fill="#14120e"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="14" height="' + bh + '" rx="6" fill="#201c16"/>';
    var ax = bx + 22, ay = by + 16, aw = bw - 36, ah = bh - 92;
    g += '<rect x="' + ax + '" y="' + ay + '" width="' + aw + '" height="' + ah + '" fill="' + c[0] + '"/>';
    var motif = hb(h, 16) % 3;
    if (motif === 0) {           // horror slash
      g += '<path d="M' + ax + ' ' + (ay + ah) + ' L' + (ax + aw) + ' ' + ay + ' l0 ' + ah + ' Z" fill="' + c[1] + '"/>'
        + '<path d="M' + (ax + aw * 0.18) + ' ' + ay + ' l16 0 L' + (ax + aw * 0.62) + ' ' + (ay + ah) + ' l-16 0 Z" fill="' + c[2] + '"/>';
    } else if (motif === 1) {    // floating moon + silhouette hills
      g += '<circle cx="' + (ax + aw / 2) + '" cy="' + (ay + ah * 0.34) + '" r="' + (aw * 0.26) + '" fill="' + c[2] + '"/>'
        + '<path d="M' + ax + ' ' + (ay + ah) + ' q ' + (aw * 0.25) + ' -' + (ah * 0.4) + ' ' + (aw * 0.5) + ' 0 q ' + (aw * 0.25) + ' -' + (ah * 0.3) + ' ' + (aw * 0.5) + ' 0 Z" fill="' + c[3] + '"/>';
    } else {                     // neon grid horizon
      var i;
      for (i = 0; i < 5; i++) g += '<rect x="' + ax + '" y="' + (ay + ah * 0.55 + i * 9) + '" width="' + aw + '" height="2.5" fill="' + c[3] + '" opacity="' + (0.9 - i * 0.15) + '"/>';
      g += '<circle cx="' + (ax + aw / 2) + '" cy="' + (ay + ah * 0.42) + '" r="' + (aw * 0.2) + '" fill="' + c[2] + '"/>';
    }
    g += '<rect x="' + ax + '" y="' + (ay + ah - 46) + '" width="' + aw + '" height="46" fill="' + c[3] + '" opacity="0.88"/>'
      + '<text x="' + (ax + aw / 2) + '" y="' + (ay + ah - 26) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 17, aw - 8) + '" fill="' + c[0] + '">' + esc(it.name) + '</text>'
      + '<text x="' + (ax + aw / 2) + '" y="' + (ay + ah - 10) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="' + fit(String(it.sub).replace(/"/g, '').slice(0, 40), 9, aw - 10) + '" fill="' + c[0] + '" opacity="0.85">' + esc(String(it.sub).replace(/"/g, '').slice(0, 40)) + '</text>';
    // spine label strip, handwritten-ish
    g += '<rect x="' + (bx + 20) + '" y="' + (by + bh - 58) + '" width="' + (bw - 40) + '" height="34" fill="#efe8d2"/>'
      /* the label strip is bw-40 wide and the name was set at a fixed 11px,
         so THE CHURCH VAN THAT SAID NO printed as "HE CHURCH VAN THAT S",
         clipped at BOTH ends by the white rect it was meant to sit inside */
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 37) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="' + fit(it.name.slice(0, 22), 11, bw - 48) + '" fill="#3a3428">' + esc(it.name.slice(0, 22)) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 12) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#6a624e">HI-FI &middot; SP MODE &middot; ' + it.year + '</text>';
    if (it.sticker && it.sticker.indexOf('rental') >= 0) {
      g += '<g transform="rotate(-8 96 60)"><rect x="66" y="46" width="72" height="26" rx="4" fill="#e8c23a" stroke="#8a731c" stroke-width="1.5"/>'
        + '<text x="102" y="58" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="700" fill="#3a3010">BE KIND</text>'
        + '<text x="102" y="67" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7" font-weight="700" fill="#3a3010">REWIND</text></g>';
    }
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'VHS' });
  }

  // ── TOY: carded blister pack ──────────────────────────────────────
  function drawToy(h, it, look, gr) {
    var c = look.c, bx = 56, by = 10, bw = 188, bh = 278;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="8" fill="' + c[2] + '"/>'
      + '<rect x="' + (bx + 8) + '" y="' + (by + 8) + '" width="' + (bw - 16) + '" height="' + (bh - 16) + '" rx="5" fill="' + c[0] + '"/>'
      + '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + 16) + '" rx="14" ry="6" fill="#ffffff" opacity="0.9"/>';   // hang hole
    g += '<rect x="' + (bx + 8) + '" y="' + (by + 26) + '" width="' + (bw - 16) + '" height="52" fill="' + c[1] + '"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 50) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 16, bw - 28) + '" fill="' + c[0] + '">' + esc(it.name) + '</text>'
      /* slice(0,38) alone left the gimmick line running off the card edge,
         clipped mid word ("key included (wrong ke"). Fit it to the card. */
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 68) + '" text-anchor="middle" font-family="' + look.f + '" font-size="' + fit(String(it.sub).slice(0, 44), 8.5, bw - 26) + '" fill="' + c[0] + '" opacity="0.9">' + esc(String(it.sub).slice(0, 44)) + '</text>';
    // the bubble + figure
    var cxm = bx + bw / 2, cym = by + 172, crushed = gr === 'TRASHED' || gr === 'PLAYED';
    var skin = ['#e8b06a', '#8ac46a', '#6a9ce8', '#e86a6a', '#c9c9c9', '#b98ae0'][hb(h, 18) % 6];
    var suit = c[(hb(h, 19) % 3) + 1];
    g += figure(cxm, cym - 8, 1.42, skin, hb(h, 26) % 4 === 0, suit, true);
    /* one accessory off the hash so two toys of the same palette are not the
       same doll: a helmet, a hat, or a thing in the hand */
    var acc = hb(h, 27) % 4;
    if (acc === 0) g += '<path d="M' + (cxm - 15) + ' ' + (cym - 46) + ' q 15 -20 30 0 Z" fill="' + suit + '"/><rect x="' + (cxm - 19) + '" y="' + (cym - 48) + '" width="38" height="5" rx="2" fill="' + suit + '"/>';
    else if (acc === 1) g += '<circle cx="' + cxm + '" cy="' + (cym - 40) + '" r="19" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.7"/>';
    else if (acc === 2) g += '<rect x="' + (cxm + 30) + '" y="' + (cym - 52) + '" width="6" height="34" rx="3" fill="' + c[2] + '" transform="rotate(24 ' + (cxm + 33) + ' ' + (cym - 36) + ')"/>';
    var bubblePath = crushed
      ? '<path d="M' + (cxm - 52) + ' ' + (cym + 66) + ' q -8 -70 22 -116 q 18 -22 44 -8 q 26 12 30 52 q 6 48 -14 74 Z" fill="#ffffff" opacity="0.2" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>'
      : '<ellipse cx="' + cxm + '" cy="' + (cym - 2) + '" rx="58" ry="76" fill="#ffffff" opacity="0.16" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/>';
    g += bubblePath
      + '<path d="M' + (cxm - 34) + ' ' + (cym - 58) + ' q 12 -20 34 -22" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/>';
    // burst
    g += '<g transform="rotate(12 ' + (bx + bw - 34) + ' ' + (by + 104) + ')">'
      + '<circle cx="' + (bx + bw - 34) + '" cy="' + (by + 104) + '" r="21" fill="' + c[1] + '"/>'
      + '<text x="' + (bx + bw - 34) + '" y="' + (by + 101) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="8" fill="' + c[0] + '">COLLECT</text>'
      + '<text x="' + (bx + bw - 34) + '" y="' + (by + 111) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="8" fill="' + c[0] + '">ALL ' + (3 + hb(h, 28) % 7) + '</text></g>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 14) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="' + c[3] + '" opacity="0.8">AGES ' + (3 + hb(h, 29) % 6) + ' AND UP &middot; ' + it.year + '</text>';
    /* sy 16 put the sticker on the title band, the same defect the cereal
       box had before A2. A blister card gets priced on the bubble. */
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'TOY', sy: 150 });
  }

  // ── BOARD GAME: box lid, landscape ───────────────────────────────
  function drawGame(h, it, look, gr) {
    var c = look.c, bx = 12, by = 62, bw = 276, bh = 180;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + (by + 6) + '" width="' + bw + '" height="' + (bh - 6) + '" rx="4" fill="' + c[3] + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="4" fill="' + c[1] + '"/>'
      + '<rect x="' + (bx + 10) + '" y="' + (by + 10) + '" width="' + (bw - 20) + '" height="' + (bh - 20) + '" fill="none" stroke="' + c[0] + '" stroke-width="2" opacity="0.6"/>';
    // title plate on a jaunty angle
    g += '<g transform="rotate(-4 150 ' + (by + 62) + ')">'
      + '<rect x="' + (bx + 18) + '" y="' + (by + 34) + '" width="' + (bw - 36) + '" height="52" rx="5" fill="' + c[2] + '"/>'
      + '<text x="150" y="' + (by + 67) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 24, bw - 52) + '" fill="' + c[0] + '">' + esc(it.name) + '</text></g>';
    var premise = String(it.sub).split('&middot;')[0].split('·')[0];
    /* fixed 11px on a 46 char slice ran "the rules are four pages and two of
       them are a" straight off both sides of the lid */
    g += '<text x="150" y="' + (by + 112) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="' + fit(premise.slice(0, 46), 11, bw - 34) + '" fill="' + c[0] + '">' + esc(premise.slice(0, 46)) + '</text>';
    // two dice
    var d1 = 1 + hb(h, 17) % 6, d2 = 1 + hb(h, 18) % 6;
    function die(x, y, n, rot) {
      var s = '<g transform="rotate(' + rot + ' ' + (x + 14) + ' ' + (y + 14) + ')"><rect x="' + x + '" y="' + y + '" width="28" height="28" rx="5" fill="' + c[0] + '"/>';
      var P = { 1: [[14, 14]], 2: [[8, 8], [20, 20]], 3: [[8, 8], [14, 14], [20, 20]], 4: [[8, 8], [20, 8], [8, 20], [20, 20]], 5: [[8, 8], [20, 8], [14, 14], [8, 20], [20, 20]], 6: [[8, 8], [20, 8], [8, 14], [20, 14], [8, 20], [20, 20]] }[n];
      for (var i = 0; i < P.length; i++) s += '<circle cx="' + (x + P[i][0]) + '" cy="' + (y + P[i][1]) + '" r="2.6" fill="' + c[3] + '"/>';
      return s + '</g>';
    }
    g += die(bx + 26, by + bh - 52, d1, -12 + hb(h, 19) % 24) + die(bx + 62, by + bh - 46, d2, -12 + hb(h, 26) % 24);
    // players chip
    var players = String(it.sub).match(/\d+ to \d+ players/);
    g += '<rect x="' + (bx + bw - 108) + '" y="' + (by + bh - 44) + '" width="94" height="24" rx="12" fill="' + c[0] + '"/>'
      + '<text x="' + (bx + bw - 61) + '" y="' + (by + bh - 28) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="700" font-size="10" fill="' + c[3] + '">' + esc(players ? players[0] : 'family fun') + '</text>';
    /* the year sat in the top right corner, which is exactly where the price
       sticker lands, so every priced lid showed "$2.99" over half a year */
    g += '<text x="' + (bx + 16) + '" y="' + (by + bh - 16) + '" font-family="ui-monospace, monospace" font-size="9" fill="' + c[0] + '" opacity="0.8">' + it.year + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'GAME', sy: 128 });
  }

  // ── CEREAL: tall box front ───────────────────────────────────────
  function drawCereal(h, it, look, gr) {
    var c = look.c, bx = 66, by = 8, bw = 168, bh = 282;
    var pop = c[2], deep = c[3];
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' + pop + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="40" fill="' + deep + '"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 25) + '" text-anchor="middle" font-family="' + look.f + '" font-size="10" letter-spacing="3" fill="' + c[0] + '">MORNING FOODS</text>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + 76) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 19, bw - 14) + '" fill="' + c[0] + '" stroke="' + deep + '" stroke-width="0.8">' + esc(it.name) + '</text>';
    // mascot: rolled head shape
    var mx = bx + bw / 2, my = by + 148, mtype = hb(h, 17) % 4;
    var skin = ['#f2c14e', '#8ac46a', '#e88a5a', '#9ad8e8'][hb(h, 18) % 4];
    g += '<circle cx="' + mx + '" cy="' + my + '" r="40" fill="' + skin + '"/>'
      + '<circle cx="' + (mx - 13) + '" cy="' + (my - 8) + '" r="5" fill="#ffffff"/><circle cx="' + (mx + 13) + '" cy="' + (my - 8) + '" r="5" fill="#ffffff"/>'
      + '<circle cx="' + (mx - 12) + '" cy="' + (my - 7) + '" r="2.4" fill="#1a1a1a"/><circle cx="' + (mx + 14) + '" cy="' + (my - 7) + '" r="2.4" fill="#1a1a1a"/>'
      + '<path d="M' + (mx - 14) + ' ' + (my + 12) + ' q 14 14 28 0" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (mtype === 0) g += '<path d="M' + (mx - 26) + ' ' + (my - 28) + ' L' + mx + ' ' + (my - 78) + ' L' + (mx + 26) + ' ' + (my - 28) + ' Z" fill="' + deep + '"/>';                      // gnome hat
    if (mtype === 1) g += '<path d="M' + (mx - 34) + ' ' + (my - 22) + ' l-12 -26 l24 8 Z" fill="' + skin + '"/><path d="M' + (mx + 34) + ' ' + (my - 22) + ' l12 -26 l-24 8 Z" fill="' + skin + '"/>'; // wolf ears
    if (mtype === 2) g += '<circle cx="' + mx + '" cy="' + my + '" r="48" fill="none" stroke="#ffffff" stroke-width="5" opacity="0.75"/>';                                              // astro helmet
    if (mtype === 3) g += '<path d="M' + (mx - 30) + ' ' + (my - 30) + ' q 30 -34 60 0" stroke="' + deep + '" stroke-width="8" fill="none"/>';                                          // combover
    // bowl of loops
    g += '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh - 44) + '" rx="56" ry="20" fill="#ffffff"/>'
      + '<ellipse cx="' + (bx + bw / 2) + '" cy="' + (by + bh - 48) + '" rx="50" ry="14" fill="' + skin + '" opacity="0.9"/>';
    var i;
    for (i = 0; i < 7; i++) {
      g += '<circle cx="' + (bx + 34 + ((hb(h, 19) + i * 37) % (bw - 66))) + '" cy="' + (by + bh - 52 + (i % 3) * 5) + '" r="5" fill="' + pop + '" stroke="' + deep + '" stroke-width="1.4"/>';
    }
    // claim burst
    /* the burst used to sit at by+96 with the title baseline at by+76, so it
       covered the first word of the name on every cereal box. It lives below
       the title now, riding the mascot's shoulder the way a real one would. */
    g += '<g transform="rotate(-14 ' + (bx + 28) + ' ' + (by + 116) + ')">'
      + '<circle cx="' + (bx + 28) + '" cy="' + (by + 116) + '" r="23" fill="' + c[0] + '"/>'
      + '<text x="' + (bx + 28) + '" y="' + (by + 113) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="7.5" fill="' + deep + '">FREE PRIZE</text>'
      + '<text x="' + (bx + 28) + '" y="' + (by + 122) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="7.5" fill="' + deep + '">INSIDE*</text></g>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 12) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" fill="' + deep + '" opacity="0.9">NET WT ' + (10 + hb(h, 26) % 14) + ' OZ &middot; ' + it.year + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'CEREAL', sy: 96 });
  }

  /* a person shaped silhouette that is actually a person: shoulders, a
     stance, hands and feet. The toy figure was a circle, a rounded rect and
     four limbs with two dot eyes and no mouth, on a fifth of every pull. */
  function figure(cx, cy, s, fill, cape, suit, face) {
    var g = '';
    if (!suit) suit = fill;
    if (cape) g += '<path d="M' + (cx - 15 * s) + ' ' + (cy - 18 * s) + ' q ' + (15 * s) + ' ' + (46 * s) + ' ' + (30 * s) + ' 0 l' + (10 * s) + ' ' + (44 * s) + ' q -' + (25 * s) + ' ' + (12 * s) + ' -' + (50 * s) + ' 0 Z" fill="' + fill + '" opacity="0.72"/>';
    g += '<circle cx="' + cx + '" cy="' + (cy - 27 * s) + '" r="' + (9 * s) + '" fill="' + fill + '"/>'
      + '<path d="M' + (cx - 13 * s) + ' ' + (cy - 16 * s) + ' q ' + (13 * s) + ' -' + (7 * s) + ' ' + (26 * s) + ' 0 l' + (3 * s) + ' ' + (28 * s) + ' q -' + (16 * s) + ' ' + (6 * s) + ' -' + (32 * s) + ' 0 Z" fill="' + suit + '"/>'
      + '<path d="M' + (cx - 13 * s) + ' ' + (cy - 14 * s) + ' l-' + (14 * s) + ' ' + (20 * s) + ' l' + (6 * s) + ' ' + (4 * s) + ' l' + (13 * s) + ' -' + (18 * s) + ' Z" fill="' + fill + '"/>'
      + '<path d="M' + (cx + 13 * s) + ' ' + (cy - 14 * s) + ' l' + (15 * s) + ' -' + (12 * s) + ' l' + (5 * s) + ' ' + (6 * s) + ' l-' + (14 * s) + ' ' + (16 * s) + ' Z" fill="' + fill + '"/>'
      + '<circle cx="' + (cx - 26 * s) + '" cy="' + (cy + 8 * s) + '" r="' + (4 * s) + '" fill="' + fill + '"/>'
      + '<circle cx="' + (cx + 32 * s) + '" cy="' + (cy - 24 * s) + '" r="' + (4 * s) + '" fill="' + fill + '"/>'
      + '<path d="M' + (cx - 10 * s) + ' ' + (cy + 12 * s) + ' l-' + (5 * s) + ' ' + (30 * s) + ' l' + (9 * s) + ' 0 l' + (4 * s) + ' -' + (28 * s) + ' Z" fill="' + suit + '"/>'
      + '<path d="M' + (cx + 10 * s) + ' ' + (cy + 12 * s) + ' l' + (6 * s) + ' ' + (30 * s) + ' l-' + (9 * s) + ' 0 l-' + (4 * s) + ' -' + (28 * s) + ' Z" fill="' + suit + '"/>'
      + '<path d="M' + (cx - 16 * s) + ' ' + (cy + 42 * s) + ' l' + (12 * s) + ' 0 l0 -' + (5 * s) + ' l-' + (12 * s) + ' 0 Z" fill="' + suit + '"/>'
      + '<path d="M' + (cx + 16 * s) + ' ' + (cy + 42 * s) + ' l-' + (12 * s) + ' 0 l0 -' + (5 * s) + ' l' + (12 * s) + ' 0 Z" fill="' + suit + '"/>';
    /* ⛔ A FACE IS A MOUTH TOO. The carded toy shipped as a circle, a rounded
       rect, four limbs and two dot eyes: no mouth, no hands, no feet, on a
       fifth of every pull. A silhouette on a comic cover wants no face at all,
       so this is opt in. */
    if (face) {
      g += '<circle cx="' + (cx - 3.6 * s) + '" cy="' + (cy - 29 * s) + '" r="' + (2.6 * s) + '" fill="#ffffff"/>'
        + '<circle cx="' + (cx + 3.8 * s) + '" cy="' + (cy - 29 * s) + '" r="' + (2.6 * s) + '" fill="#ffffff"/>'
        + '<circle cx="' + (cx - 3.2 * s) + '" cy="' + (cy - 28.6 * s) + '" r="' + (1.3 * s) + '" fill="#16130f"/>'
        + '<circle cx="' + (cx + 4.2 * s) + '" cy="' + (cy - 28.6 * s) + '" r="' + (1.3 * s) + '" fill="#16130f"/>'
        + '<path d="M' + (cx - 4.4 * s) + ' ' + (cy - 22 * s) + ' q ' + (4.4 * s) + ' ' + (4.2 * s) + ' ' + (8.8 * s) + ' 0" fill="none" stroke="#16130f" stroke-width="' + (1.5 * s) + '" stroke-linecap="round"/>'
        + '<path d="M' + (cx - 8 * s) + ' ' + (cy - 34 * s) + ' q ' + (8 * s) + ' -' + (4 * s) + ' ' + (16 * s) + ' 0" fill="none" stroke="#16130f" stroke-width="' + (1.2 * s) + '" opacity="0.35"/>';
    }
    return g;
  }

  // ── COMIC: cover, corner box, banner title, blurb strip ──────────
  function drawComic(h, it, look, gr) {
    var c = look.c, bx = 59, by = 9, bw = 182, bh = 282;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="' + c[0] + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="7" height="' + bh + '" fill="' + c[3] + '" opacity="0.5"/>';
    // the art field, then a burst behind the figure
    var ax = bx + 12, ay = by + 60, aw = bw - 24, ah = bh - 132;
    g += '<rect x="' + ax + '" y="' + ay + '" width="' + aw + '" height="' + ah + '" fill="' + c[1] + '"/>';
    var i, R = aw * 0.52, mx = ax + aw / 2, my = ay + ah * 0.46;
    for (i = 0; i < 16; i++) {
      var a1 = (i / 16) * Math.PI * 2, a2 = a1 + 0.18;
      g += '<path d="M' + mx + ' ' + my + ' L' + (mx + Math.cos(a1) * R) + ' ' + (my + Math.sin(a1) * R)
        + ' L' + (mx + Math.cos(a2) * R) + ' ' + (my + Math.sin(a2) * R) + ' Z" fill="' + c[2] + '" opacity="0.5"/>';
    }
    g += figure(mx - 6, my + 10, 1.05, c[3], hb(h, 17) % 2 === 0);
    if (hb(h, 18) % 3 === 0) g += '<path d="M' + (ax + 8) + ' ' + (ay + ah - 6) + ' q ' + (aw * 0.2) + ' -' + (ah * 0.34) + ' ' + (aw * 0.42) + ' -4 Z" fill="' + c[3] + '" opacity="0.55"/>';
    // masthead
    g += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="54" fill="' + c[3] + '"/>'
      + '<text x="' + (bx + bw / 2 + 14) + '" y="' + (by + 26) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(String(it.name).slice(0, 44), 21, bw - 68) + '" fill="' + c[2] + '">' + esc(String(it.name).slice(0, 44)) + '</text>'
      + '<text x="' + (bx + bw / 2 + 14) + '" y="' + (by + 44) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" letter-spacing="2" fill="' + c[0] + '" opacity="0.85">' + (it._issue || 1) + ' &middot; ' + it.year + '</text>';
    // corner box, bottom left of the masthead, where a real one lives
    g += '<rect x="' + (bx + 5) + '" y="' + (by + 5) + '" width="34" height="44" fill="' + c[0] + '" stroke="' + c[2] + '" stroke-width="1.5"/>'
      + figure(bx + 22, by + 24, 0.32, c[3], false)
      + '<rect x="' + (bx + 5) + '" y="' + (by + 36) + '" width="34" height="13" fill="' + c[2] + '"/>'
      + '<text x="' + (bx + 22) + '" y="' + (by + 46) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" font-weight="700" fill="' + c[3] + '">' + (it._cents || 12) + '&#162;</text>';
    // blurb banner
    var blurb = (String(it.sub).split('"')[1] || '').slice(0, 46);
    g += '<g transform="rotate(-2 ' + (bx + bw / 2) + ' ' + (by + bh - 52) + ')">'
      + '<rect x="' + (bx + 8) + '" y="' + (by + bh - 66) + '" width="' + (bw - 16) + '" height="30" fill="' + c[2] + '"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 46) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="' + fit(blurb, 11, bw - 26) + '" fill="' + c[3] + '">' + esc(blurb) + '</text></g>';
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + bh - 10) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" fill="' + c[3] + '" opacity="0.85">' + esc(String(it.sub).split('·')[1] || '') + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'COMIC', sy: 150 });
  }

  // ── PAPERBACK: spine, vignette, page block ───────────────────────
  function drawPaperback(h, it, look, gr) {
    var c = look.c, bx = 66, by = 11, bw = 169, bh = 278;
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' + c[1] + '"/>'
      + '<rect x="' + bx + '" y="' + by + '" width="13" height="' + bh + '" fill="' + c[3] + '"/>'
      + '<rect x="' + (bx + bw - 9) + '" y="' + (by + 3) + '" width="9" height="' + (bh - 6) + '" fill="#efe6ce"/>';
    var i;
    for (i = 0; i < 26; i++) g += '<rect x="' + (bx + bw - 9) + '" y="' + (by + 6 + i * 10) + '" width="9" height="1" fill="#c2b48c" opacity="0.7"/>';
    // vignette illustration
    var mx = bx + bw / 2 - 4, my = by + 150;
    g += '<ellipse cx="' + mx + '" cy="' + my + '" rx="60" ry="74" fill="' + c[0] + '"/>'
      + '<path d="M' + (mx - 60) + ' ' + (my + 34) + ' q 30 -26 60 -4 q 28 20 60 2 l0 42 l-120 0 Z" fill="' + c[3] + '" opacity="0.75"/>'
      + '<circle cx="' + (mx + 30) + '" cy="' + (my - 40) + '" r="14" fill="' + c[2] + '" opacity="0.9"/>'
      + figure(mx - 14, my + 12, 0.72, c[3], false);
    if (hb(h, 17) % 2) g += '<path d="M' + (mx + 18) + ' ' + (my + 46) + ' l0 -34 l16 -12 l16 12 l0 34 Z" fill="' + c[3] + '"/>'
      + '<rect x="' + (mx + 28) + '" y="' + (my + 20) + '" width="9" height="12" fill="' + c[2] + '" opacity="0.9"/>';
    g += '<ellipse cx="' + mx + '" cy="' + my + '" rx="60" ry="74" fill="none" stroke="' + c[2] + '" stroke-width="2.5"/>';
    // title and author
    var pink = inkOn(c[1]);
    g += '<text x="' + (bx + bw / 2 + 5) + '" y="' + (by + 42) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 20, bw - 40) + '" fill="' + pink + '">' + esc(String(it.name).slice(0, 34)) + '</text>'
      + '<text x="' + (bx + bw / 2 + 5) + '" y="' + (by + 62) + '" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="10" fill="' + pink + '" opacity="0.75">' + esc(String(it.sub).split('·')[0].trim()) + '</text>';
    // colophon and price
    g += '<rect x="' + (bx + 22) + '" y="' + (by + bh - 34) + '" width="16" height="16" fill="' + c[2] + '"/>'
      + '<text x="' + (bx + 44) + '" y="' + (by + bh - 22) + '" font-family="ui-monospace, monospace" font-size="8" fill="' + pink + '" opacity="0.8">' + esc((String(it.sub).split('·')[1] || '').trim()) + '</text>'
      + '<rect x="' + (bx + bw - 54) + '" y="' + (by + 6) + '" width="40" height="20" fill="' + c[0] + '" opacity="0.92"/>'
      + '<text x="' + (bx + bw - 34) + '" y="' + (by + 20) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="9" font-weight="700" fill="' + inkOn(c[0]) + '">' + esc((String(it.sub).split('·')[2] || '').trim()) + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'PAPERBACK', sy: 96 });
  }

  // ── ZINE: photocopy, two tones, off register, staples ────────────
  function drawZine(h, it, look, gr) {
    var c = look.c, bx = 61, by = 12, bw = 178, bh = 276;
    var ink = c[3], paper = '#ddd7c6';
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="' + paper + '"/>'
      /* the photocopier lid gap: a black band down the edge the page did not
         sit flat against. It is the single most photocopy thing there is. */
      + '<rect x="' + (bx + bw - 12) + '" y="' + by + '" width="12" height="' + bh + '" fill="#2a2620" opacity="0.62"/>'
      + '<rect x="' + (bx + 8) + '" y="' + (by + 8) + '" width="' + (bw - 28) + '" height="' + (bh - 16) + '" fill="none" stroke="' + ink + '" stroke-width="2.4"/>'
      + '<rect x="' + (bx + 13) + '" y="' + (by + 13) + '" width="' + (bw - 38) + '" height="' + (bh - 26) + '" fill="none" stroke="' + ink + '" stroke-width="1" opacity="0.6"/>';
    // halftone blob
    var i, j, mx = bx + bw / 2 - 6, my = by + 150;
    for (i = 0; i < 11; i++) for (j = 0; j < 11; j++) {
      var dx = (i - 5) * 7, dy = (j - 5) * 7, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 38) continue;
      var rr = Math.max(0.4, 3.2 - d / 14) * (1 - ((hb(h, 17 + ((i + j) % 8)) % 40) / 120));
      g += '<circle cx="' + (mx + dx) + '" cy="' + (my + dy) + '" r="' + rr.toFixed(2) + '" fill="' + ink + '" opacity="0.8"/>';
    }
    g += figure(mx, my + 4, 0.62, ink, false);
    // off register title: the same words printed twice, a whisker apart
    var t = String(it.name).slice(0, 34), fs = fit(t, 19, bw - 46);
    g += '<text x="' + (bx + bw / 2 - 5) + '" y="' + (by + 48) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-weight="700" font-size="' + fs + '" fill="' + ink + '" opacity="0.28" transform="translate(2,1.6)">' + esc(t) + '</text>'
      + '<text x="' + (bx + bw / 2 - 5) + '" y="' + (by + 48) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-weight="700" font-size="' + fs + '" fill="' + ink + '">' + esc(t) + '</text>'
      + '<text x="' + (bx + bw / 2 - 5) + '" y="' + (by + 66) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8.5" letter-spacing="1.5" fill="' + ink + '" opacity="0.8">NUMBER ' + (it._num || 1) + ' OF ' + (it._run || 50) + '</text>';
    g += '<text x="' + (bx + 20) + '" y="' + (by + bh - 26) + '" font-family="ui-monospace, monospace" font-size="9" fill="' + ink + '">FREE OR ' + (25 + hb(h, 19) % 4 * 25) + ' CENTS</text>'
      + '<text x="' + (bx + 20) + '" y="' + (by + bh - 14) + '" font-family="ui-monospace, monospace" font-size="7.5" fill="' + ink + '" opacity="0.75">PLEASE COPY AND PASS ON &middot; ' + it.year + '</text>';
    // staples down the fold
    g += '<rect x="' + (bx + 4) + '" y="' + (by + 58) + '" width="10" height="3.4" fill="#8f8a80"/>'
      + '<rect x="' + (bx + 4) + '" y="' + (by + bh - 62) + '" width="10" height="3.4" fill="#8f8a80"/>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'ZINE', sy: 100 });
  }

  // ── HANDHELD: LCD unit, printed bezel, d pad and buttons ─────────
  var HH_SHELL = ['#b8352e', '#2f4f8a', '#b6b2a8', '#d8a52c', '#3f6b45', '#2a2622'];
  function drawHandheld(h, it, look, gr) {
    var c = look.c, bx = 64, by = 16, bw = 172, bh = 268;
    var shell = HH_SHELL[hb(h, 17) % HH_SHELL.length];
    var g = shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="16" fill="' + shell + '"/>'
      + '<rect x="' + (bx + 5) + '" y="' + (by + 5) + '" width="' + (bw - 10) + '" height="' + (bh - 10) + '" rx="13" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.16"/>';
    var sx = bx + 20, sy2 = by + 30, sw = bw - 40, sh = 100;
    g += '<rect x="' + (sx - 6) + '" y="' + (sy2 - 6) + '" width="' + (sw + 12) + '" height="' + (sh + 12) + '" rx="6" fill="#1b1b18"/>'
      + '<rect x="' + sx + '" y="' + sy2 + '" width="' + sw + '" height="' + sh + '" fill="#93a877"/>'
      + '<rect x="' + sx + '" y="' + sy2 + '" width="' + sw + '" height="' + (sh * 0.34) + '" fill="#a6b98a" opacity="0.6"/>';
    // the printed scene behind the segments, then the segments themselves
    var i, seg = hb(h, 18) % 3;
    if (seg === 0) { for (i = 0; i < 4; i++) g += '<rect x="' + (sx + 6) + '" y="' + (sy2 + 16 + i * 20) + '" width="' + (sw - 12) + '" height="2" fill="#5f7048" opacity="0.5"/>'; }
    else if (seg === 1) { g += '<path d="M' + sx + ' ' + (sy2 + sh) + ' l' + (sw * 0.5) + ' -' + (sh * 0.55) + ' l' + (sw * 0.5) + ' ' + (sh * 0.55) + ' Z" fill="#7d9163" opacity="0.7"/>'; }
    else { g += '<circle cx="' + (sx + sw / 2) + '" cy="' + (sy2 + sh * 0.4) + '" r="' + (sw * 0.2) + '" fill="#7d9163" opacity="0.7"/>'; }
    for (i = 0; i < 6; i++) {
      if ((hb(h, 19 + i) & 3) === 0) continue;
      g += '<rect x="' + (sx + 8 + (i % 3) * (sw / 3.2)) + '" y="' + (sy2 + 12 + Math.floor(i / 3) * 44) + '" width="' + (sw / 4.4) + '" height="26" rx="2" fill="#24301c" opacity="0.85"/>';
    }
    g += '<text x="' + (sx + sw - 4) + '" y="' + (sy2 + sh - 5) + '" text-anchor="end" font-family="ui-monospace, monospace" font-size="8" fill="#24301c" opacity="0.7">' + (100 + hb(h, 26) % 900) + '</text>';
    // printed title on the bezel
    g += '<text x="' + (bx + bw / 2) + '" y="' + (by + 22) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="7.5" letter-spacing="2.5" fill="#ffffff" opacity="0.72">' + esc(String(it.sub).split('·')[0].trim().toUpperCase().slice(0, 24)) + '</text>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + 158) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 18, bw - 26) + '" fill="#ffffff">' + esc(String(it.name).slice(0, 28)) + '</text>';
    // d pad and buttons
    var dx2 = bx + 44, dy2 = by + 202;
    g += '<rect x="' + (dx2 - 9) + '" y="' + (dy2 - 27) + '" width="18" height="54" rx="4" fill="#211f1c"/>'
      + '<rect x="' + (dx2 - 27) + '" y="' + (dy2 - 9) + '" width="54" height="18" rx="4" fill="#211f1c"/>'
      + '<circle cx="' + dx2 + '" cy="' + dy2 + '" r="5" fill="#3a3733"/>';
    var b1 = bx + bw - 52, b2 = bx + bw - 24;
    g += '<circle cx="' + b1 + '" cy="' + (dy2 + 8) + '" r="13" fill="#e8e2d4"/><circle cx="' + b2 + '" cy="' + (dy2 - 10) + '" r="13" fill="#e8e2d4"/>';
    if (gr !== 'TRASHED') {
      g += '<text x="' + b1 + '" y="' + (dy2 + 12) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#3a3733">A</text>'
        + '<text x="' + b2 + '" y="' + (dy2 - 6) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" fill="#3a3733">B</text>';
    }
    for (i = 0; i < 5; i++) g += '<circle cx="' + (bx + 34 + i * 11) + '" cy="' + (by + bh - 22) + '" r="2.4" fill="#000000" opacity="0.42"/>';
    g += '<text x="' + (bx + bw - 16) + '" y="' + (by + bh - 18) + '" text-anchor="end" font-family="ui-monospace, monospace" font-size="7" fill="#ffffff" opacity="0.55">' + it.year + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'HANDHELD', sy: 234, scr: { x: sx, y: sy2, w: sw, h: sh } });
  }

  // ── LUNCHBOX: embossed steel, handle, litho scene ────────────────
  function drawLunchbox(h, it, look, gr) {
    var c = look.c, bx = 27, by = 66, bw = 246, bh = 178;
    var g = '<path d="M' + (bx + bw * 0.3) + ' ' + (by + 4) + ' q ' + (bw * 0.2) + ' -46 ' + (bw * 0.4) + ' 0" fill="none" stroke="#2f2b26" stroke-width="9" stroke-linecap="round"/>'
      + '<path d="M' + (bx + bw * 0.3) + ' ' + (by + 4) + ' q ' + (bw * 0.2) + ' -46 ' + (bw * 0.4) + ' 0" fill="none" stroke="#5d564c" stroke-width="4" stroke-linecap="round"/>'
      + shadow(bx, by, bw, bh)
      + '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" rx="12" fill="' + c[1] + '"/>'
      + '<rect x="' + (bx + 7) + '" y="' + (by + 7) + '" width="' + (bw - 14) + '" height="' + (bh - 14) + '" rx="8" fill="' + c[0] + '"/>'
      + '<rect x="' + (bx + 7) + '" y="' + (by + 7) + '" width="' + (bw - 14) + '" height="' + (bh - 14) + '" rx="8" fill="none" stroke="' + c[3] + '" stroke-width="1.6" opacity="0.55"/>';
    var ix = bx + 12, iy = by + 12, iw = bw - 24, ih = bh - 24;
    // litho scene
    /* the scene, the trees and the figure were ALL c[3] and the figure stood
       exactly on the ground line, so the whole picture was one dark shape on
       another dark shape and the lid read as an empty cream field with a
       banner on it. Sky, sun and trees above the banner; the figure below it,
       silhouetted the other way round against the ground. */
    var sky = c[0], ground = c[3];
    g += '<circle cx="' + (ix + iw * 0.84) + '" cy="' + (iy + ih * 0.2) + '" r="' + (ih * 0.15) + '" fill="' + c[2] + '"/>';
    var i;
    for (i = 0; i < 4; i++) g += '<path d="M' + (ix + iw * (0.05 + i * 0.13)) + ' ' + (iy + ih * 0.34) + ' l' + (iw * 0.055) + ' -' + (ih * 0.22) + ' l' + (iw * 0.055) + ' ' + (ih * 0.22) + ' Z" fill="' + ground + '" opacity="0.72"/>';
    g += '<rect x="' + ix + '" y="' + (iy + ih * 0.68) + '" width="' + iw + '" height="' + (ih * 0.32) + '" fill="' + ground + '" opacity="0.9"/>'
      + '<path d="M' + ix + ' ' + (iy + ih * 0.68) + ' q ' + (iw * 0.25) + ' -' + (ih * 0.09) + ' ' + (iw * 0.5) + ' 0 q ' + (iw * 0.25) + ' ' + (ih * 0.07) + ' ' + (iw * 0.5) + ' 0 l0 ' + (ih * 0.06) + ' l-' + iw + ' 0 Z" fill="' + ground + '" opacity="0.9"/>'
      + figure(ix + iw * 0.2, iy + ih * 0.82, 0.42, sky, hb(h, 18) % 3 === 0)
      + figure(ix + iw * 0.8, iy + ih * 0.84, 0.32, c[2], false);
    // title banner across the middle
    g += '<g transform="rotate(-3 ' + (bx + bw / 2) + ' ' + (by + bh * 0.5) + ')">'
      + '<rect x="' + (bx + 20) + '" y="' + (by + bh * 0.38) + '" width="' + (bw - 40) + '" height="42" rx="6" fill="' + c[2] + '" stroke="' + c[3] + '" stroke-width="2"/>'
      + '<text x="' + (bx + bw / 2) + '" y="' + (by + bh * 0.38 + 27) + '" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(it.name, 22, bw - 62) + '" fill="' + c[3] + '">' + esc(String(it.name).slice(0, 34)) + '</text></g>';
    // latch and hinge
    g += '<rect x="' + (bx + bw / 2 - 15) + '" y="' + (by + bh - 12) + '" width="30" height="16" rx="3" fill="#5d564c"/>'
      + '<rect x="' + (bx + bw / 2 - 9) + '" y="' + (by + bh - 8) + '" width="18" height="7" rx="2" fill="#8f8a80"/>'
      + '<rect x="' + (bx + 16) + '" y="' + (by + bh - 4) + '" width="26" height="5" rx="2" fill="#5d564c" opacity="0.8"/>'
      + '<rect x="' + (bx + bw - 42) + '" y="' + (by + bh - 4) + '" width="26" height="5" rx="2" fill="#5d564c" opacity="0.8"/>'
      + '<text x="' + (bx + bw - 16) + '" y="' + (by + 22) + '" text-anchor="end" font-family="ui-monospace, monospace" font-size="7.5" fill="' + c[3] + '" opacity="0.8">EMBOSSED STEEL &middot; ' + it.year + '</text>';
    return g + wear(h, gr, bx, by, bw, bh, { kind: 'LUNCHBOX', sy: 40 });
  }

  // ── dispatch ─────────────────────────────────────────────────────
  /* opts.dusty renders the UNREVEALED object: the thing itself, under
     grime, with every condition mark withheld. Two objects of the same
     class and era must be indistinguishable while dusty or the wipe is
     a formality. test/attic-check.js section C measures exactly that. */
  function renderItem(h, size, opts) {
    var it = A.hashToItem(h);
    h = it.hash;   // normalised, so a junk paste still renders
    var dusty = !!(opts && opts.dusty);
    if (it.cls === 'RECORD') return S.renderSleeve(h, size, opts);
    var look = ERA_LOOK[it.era] || ERA_LOOK['1970s'];
    var gr = dusty ? '?' : it.grade, g;
    var DRAW = {
      VHS: drawVHS, TOY: drawToy, GAME: drawGame, CEREAL: drawCereal,
      COMIC: drawComic, PAPERBACK: drawPaperback, ZINE: drawZine,
      HANDHELD: drawHandheld, LUNCHBOX: drawLunchbox
    };
    /* ⛔ an unknown class must not silently render as a cereal box. It did:
       the old dispatch was an if/else chain with `else g = drawCereal(...)`,
       so the day a family was added without a renderer every one of them
       would have come out as breakfast. */
    var fn = DRAW[it.cls];
    if (!fn) return null;
    g = fn(h, it, look, gr);
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"' + (dusty ? ' data-dusty="1"' : '') + ' width="' + size + '" height="' + size + '">' + g + '</svg>', item: it };
  }

  var API = { renderItem: renderItem };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC_OBJECT = API;
})(this);
