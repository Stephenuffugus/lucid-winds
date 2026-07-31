/* ════════════════════════════════════════════════════════════════════
   SLEEVE RENDERER (prototype) — hash → one-of-one record sleeve SVG.
   Pilot renderer for the Attic's first object class. Era drives the whole
   visual language (palette + type + layout idiom); CONDITION renders as
   real wear (ring wear, corner scuffs, price sticker, shrinkwrap gloss).
   Deterministic, 300x300 viewBox, system fonts only (no asset files).
   ════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  var A = (typeof module !== 'undefined' && module.exports)
    ? require('./attic-engine.js') : root.ATTIC;

  function hb(h, n) { return parseInt(h.substr(n * 2, 2), 16); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // era → visual language: [bg, field, ink, pop], font stack, weight
  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif', it: 1 },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: 'Georgia, serif', it: 0 },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Georgia, serif', it: 0 },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif', it: 0 },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace', it: 0 }
  };

  // 0.72em average glyph width for bold caps; avail = pixels the line may span
  function fit(text, max, avail) { return Math.min(max, (avail || 260) / (Math.max(6, text.length) * 0.72)); }

  function wearLayer(h, grade) {
    var w = '';
    var heavy = grade === 'TRASHED', mid = grade === 'PLAYED' || grade === 'GOOD';
    if (heavy || mid) {
      // ring wear: the record's circle pressed through the cardboard
      w += '<circle cx="150" cy="150" r="128" fill="none" stroke="#ffffff" stroke-width="' + (heavy ? 10 : 6) + '" opacity="' + (heavy ? 0.22 : 0.12) + '"/>';
      // corner scuffs
      w += '<path d="M0 0 L26 0 L0 26 Z" fill="#ffffff" opacity="0.18"/><path d="M300 300 L274 300 L300 274 Z" fill="#ffffff" opacity="0.15"/>';
    }
    if (heavy) {
      w += '<path d="M300 0 L286 0 L300 22 Z" fill="#ffffff" opacity="0.3"/>'
        + '<rect x="' + (40 + hb(h, 20) % 120) + '" y="0" width="2" height="' + (60 + hb(h, 21) % 80) + '" fill="#ffffff" opacity="0.25"/>';  // seam split
    }
    if (grade !== 'FACTORY SEALED' && grade !== 'MINT') {
      var px = 216 + hb(h, 22) % 40, py = 18 + hb(h, 23) % 30;
      w += '<g transform="rotate(' + (-6 + hb(h, 24) % 12) + ' ' + px + ' ' + py + ')">'
        + '<ellipse cx="' + px + '" cy="' + py + '" rx="26" ry="14" fill="#f5efdd" stroke="#c9bfa4" stroke-width="1"/>'
        + '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#5a4f3a">$' + (1 + hb(h, 25) % 5) + '.99</text></g>';
    }
    if (grade === 'FACTORY SEALED') {
      w += '<path d="M0 210 L300 60 L300 96 L0 246 Z" fill="#ffffff" opacity="0.16"/>'
        + '<path d="M0 232 L300 82 L300 90 L0 240 Z" fill="#ffffff" opacity="0.28"/>';
    }
    return w;
  }

  function renderSleeve(h, size) {
    var it = A.hashToItem(h);
    if (it.cls !== 'RECORD') return null;
    var look = ERA_LOOK[it.era], c = look.c;
    var band = it.name, album = it.sub.split('"')[1] || '';
    var layout = hb(h, 16) % 4;
    var g = '';

    g += '<rect width="300" height="300" fill="' + c[0] + '"/>';
    if (layout === 0) {          // STACK: big field, giant type up top
      g += '<rect y="176" width="300" height="124" fill="' + c[1] + '"/>'
        + '<rect y="168" width="300" height="8" fill="' + c[2] + '"/>'
        + '<text x="20" y="66" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 34, 264) + '" fill="' + c[3] + '"' + (look.it ? ' font-style="italic"' : '') + '>' + esc(band) + '</text>'
        + '<text x="20" y="222" font-family="' + look.f + '" font-size="17" fill="' + c[0] + '">' + esc(album) + '</text>';
    } else if (layout === 1) {   // DIAGONAL: band name on an angle over a split field
      g += '<path d="M0 300 L300 0 L300 300 Z" fill="' + c[1] + '"/>'
        + '<g transform="rotate(-32 150 150)"><rect x="-40" y="130" width="380" height="44" fill="' + c[2] + '"/>'
        + '<text x="150" y="160" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 26, 340) + '" fill="' + c[0] + '">' + esc(band) + '</text></g>'
        + '<text x="284" y="252" text-anchor="end" font-family="' + look.f + '" font-size="14" fill="' + c[3] + '">' + esc(album) + '</text>';
    } else if (layout === 2) {   // SUN: centered circle motif
      g += '<circle cx="150" cy="132" r="86" fill="' + c[2] + '"/><circle cx="150" cy="132" r="58" fill="' + c[1] + '"/><circle cx="150" cy="132" r="12" fill="' + c[0] + '"/>'
        + '<text x="150" y="246" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 27, 280) + '" fill="' + c[3] + '"' + (look.it ? ' font-style="italic"' : '') + '>' + esc(band) + '</text>'
        + '<text x="150" y="266" text-anchor="middle" font-family="' + look.f + '" font-size="13" fill="' + c[2] + '">' + esc(album) + '</text>';
    } else {                     // BARS: horizontal banding, right-set type
      var i; for (i = 0; i < 7; i++) g += '<rect y="' + (i * 44) + '" width="300" height="22" fill="' + (i % 2 ? c[1] : c[2]) + '" opacity="' + (0.16 + i * 0.12) + '"/>';
      g += '<text x="282" y="84" text-anchor="end" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 30, 266) + '" fill="' + c[3] + '">' + esc(band) + '</text>'
        + '<text x="282" y="112" text-anchor="end" font-family="' + look.f + '" font-size="15" fill="' + c[3] + '" opacity="0.8">' + esc(album) + '</text>';
    }
    // label logo chip + era year, always
    g += '<rect x="16" y="272" width="12" height="12" fill="' + c[2] + '"/>'
      + '<text x="34" y="282" font-family="ui-monospace, monospace" font-size="9" fill="' + c[3] + '" opacity="0.85">' + esc(it.sub.split('·')[1] || '') + ' · ' + it.year + '</text>';
    g += wearLayer(h, it.grade);
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="' + size + '" height="' + size + '">' + g + '</svg>', item: it };
  }

  var API = { renderSleeve: renderSleeve };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC_SLEEVE = API;
})(this);
