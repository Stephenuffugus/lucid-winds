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

  /* ════════════════════════════════════════════════════════════════════
     THE DUST. One renderer, exported, used by every family: object-render.js
     imports this file already, so a second copy of the grime would have drifted
     the day either one was tuned.

     ⛔ THIS IS THE GAME'S ONE DRAMATIC BEAT AND IT WAS A COLOUR CORRECTION.
     Shipped as a flat #6b5f4c at 0.62, which is a brown wash you can read
     straight through: at 240px the band name, the sub line, COLLECT ALL 6 and
     the year were all legible under it, so the WIPE button revealed something
     the player had already read. Combined opacity is about 0.91 now, which
     hides 9 to 13px type completely and still lets the SHAPE of the object
     through, because knowing you have found a lunchbox and not knowing what is
     printed on it is exactly the right amount to know.
     ⛔ AND THE WORD "UNWIPED" IS GONE. It was 14px monospace with 5px letter
     spacing floating in the middle of the artwork, which is a debug label, not
     art. The shelf chip already says UNWIPED in the UI where a label belongs.
     ⛔ NO SVG FILTERS. A per element filter is the studio's known iOS killer
     (feedback_svg_filters_per_element_breaks_ios), so the density comes from
     two stacked layers and an even odd hole, never from feGaussianBlur. */
  function grime(h, bx, by, bw, bh) {
    var i, cx, cy, rr, w = '';
    function b(n) { return hb(h, 16 + (n % 14)); }
    /* the swipe: somebody has already run a thumb across this once, and it is
       the only place you get a slightly better look */
    var sy0 = by + bh * (0.34 + (b(3) % 30) / 100), amp = bh * 0.1;
    var swipe = 'M' + bx + ' ' + sy0
      + ' q ' + (bw * 0.3) + ' ' + (-amp) + ' ' + (bw * 0.62) + ' ' + (amp * 0.35)
      + ' q ' + (bw * 0.22) + ' ' + (amp * 0.5) + ' ' + (bw * 0.38) + ' ' + (-amp * 0.2)
      + ' l0 ' + (bh * 0.13)
      + ' q -' + (bw * 0.38) + ' ' + (amp * 0.2) + ' -' + (bw * 0.6) + ' ' + (-amp * 0.35)
      + ' q -' + (bw * 0.3) + ' ' + (-amp * 0.35) + ' -' + (bw * 0.4) + ' ' + (amp * 0.6) + ' Z';
    /* ⛔ 2026-09-05: two layers at 0.79 compounded to 0.956 and the object under them was gone.
       The fleet audit and Stephen both read the dusty card as a broken image. The grade is
       withheld by drawing NO wear in the dusty render (that is what the leak gate measures), not
       by hiding the object, so the dust sits at 0.62 with a 0.42 second layer off the swipe:
       the thing shows through as a shape and a colour, the title mostly does not, and the wipe
       is a reveal instead of an un-blank. */
    w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#5c5142" opacity="0.62"/>';
    w += '<path fill-rule="evenodd" fill="#5c5142" opacity="0.42" d="M' + bx + ' ' + by + ' h' + bw + ' v' + bh + ' h-' + bw + ' Z ' + swipe + '"/>';
    /* cloudiness: where the dust has drifted and where it has not */
    for (i = 0; i < 16; i++) {
      cx = bx + 4 + (b(i) * (i + 5)) % Math.max(1, bw - 8);
      cy = by + 4 + (b(i + 4) * (i + 3)) % Math.max(1, bh - 8);
      rr = 12 + (b(i + 2) % 34);
      w += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + (i % 3 ? '#786a55' : '#463d31') + '" opacity="0.2"/>';
    }
    /* grit, which is what actually says DUST rather than FOG */
    for (i = 0; i < 34; i++) {
      cx = bx + 3 + (b(i + 1) * (i * 7 + 11)) % Math.max(1, bw - 6);
      cy = by + 3 + (b(i + 6) * (i * 5 + 13)) % Math.max(1, bh - 6);
      w += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (0.7 + (i % 4) * 0.55) + '" fill="' + (i % 5 ? '#3a3226' : '#a89a8d') + '" opacity="' + (0.28 + (i % 3) * 0.14) + '"/>';
    }
    /* lint, and a web in whichever corner the hash picks */
    for (i = 0; i < 3; i++) {
      cx = bx + 10 + (b(i + 9) * 3) % Math.max(1, bw - 20);
      cy = by + 10 + (b(i + 11) * 3) % Math.max(1, bh - 20);
      w += '<path d="M' + cx + ' ' + cy + ' q 14 -9 26 4 q 10 11 22 3" fill="none" stroke="#cfc3a8" stroke-width="0.9" opacity="0.3"/>';
    }
    var wx = (b(7) % 2) ? bx + bw : bx, ws = (b(7) % 2) ? -1 : 1, wy = (b(8) % 2) ? by + bh : by, hs = (b(8) % 2) ? -1 : 1;
    for (i = 1; i <= 3; i++) {
      w += '<path d="M' + (wx + ws * i * 15) + ' ' + wy + ' Q' + (wx + ws * i * 9) + ' ' + (wy + hs * i * 9) + ' ' + wx + ' ' + (wy + hs * i * 15) + '" fill="none" stroke="#cfc3a8" stroke-width="0.8" opacity="0.26"/>';
    }
    w += '<path d="M' + wx + ' ' + wy + ' L' + (wx + ws * 48) + ' ' + (wy + hs * 22) + ' M' + wx + ' ' + wy + ' L' + (wx + ws * 22) + ' ' + (wy + hs * 48) + '" stroke="#cfc3a8" stroke-width="0.8" opacity="0.26"/>';
    /* the light catches the top edge of a dusty thing */
    w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="4" fill="#cfc3a8" opacity="0.16"/>';
    return w;
  }
  function grimeLayer(h) { return grime(h, 0, 0, 300, 300); }

  /* ⛔ THE SEVEN STEP RAMP LIVES HERE AND NOWHERE ELSE. It shipped in
     object-render only, so the nine boxy families had seven visible grades and
     the RECORD, the flagship class, had three: PLAYED and GOOD rendered
     byte for byte identically, and so did FINE and NEAR MINT. Found by the
     check's "no two grades render the same picture" group on 2026-08-24, which
     is exactly the sort of thing nobody sees by eye because you never hold two
     grades of the same object side by side unless a test does. */
  var LEVEL = { 'TRASHED': 0, 'PLAYED': 1, 'GOOD': 2, 'FINE': 3, 'NEAR MINT': 4, 'MINT': 5, 'FACTORY SEALED': 6 };
  var PATINA = [0.22, 0.14, 0.09, 0.05, 0.02, 0, 0];
  function ramp(grade, bx, by, bw, bh) {
    var lv = LEVEL[grade], w = '';
    if (typeof lv !== 'number') lv = 2;
    if (PATINA[lv] > 0) w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="#6b5232" opacity="' + PATINA[lv] + '"/>';
    if (lv <= 1) w += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="none" stroke="#241c10" stroke-width="' + (lv === 0 ? 7 : 4) + '" opacity="' + (lv === 0 ? 0.34 : 0.2) + '"/>';
    if (lv === 3) w += '<rect x="' + (bx + bw * 0.16) + '" y="' + (by + 4) + '" width="' + (bw * 0.42) + '" height="4" rx="2" fill="#ffffff" opacity="0.11"/>'
      + '<path d="M' + (bx + bw) + ' ' + (by + bh) + ' l-13 0 l13 -13 Z" fill="#ffffff" opacity="0.14"/>';
    if (lv === 4) w += '<path d="M' + (bx + bw) + ' ' + by + ' l-7 0 l7 7 Z" fill="#ffffff" opacity="0.13"/>';
    if (lv === 5) w += '<path d="M' + (bx + bw * 0.06) + ' ' + (by + bh) + ' L' + (bx + bw * 0.5) + ' ' + by + ' l' + (bw * 0.1) + ' 0 L' + (bx + bw * 0.16) + ' ' + (by + bh) + ' Z" fill="#ffffff" opacity="0.1"/>';
    return w;
  }
  function wearLayer(h, grade) {
    var w = '';
    if (grade === '?') return grimeLayer(h);
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
    return w + ramp(grade, 0, 0, 300, 300);
  }

  function renderSleeve(h, size, opts) {
    var it = A.hashToItem(h);
    if (it.cls !== 'RECORD') return null;
    h = it.hash;   // normalised, so a junk paste still renders
    var look = ERA_LOOK[it.era], c = look.c;
    var band = it.name, album = it.sub.split('"')[1] || '';
    /* LAYOUT BANK 2 (2026-09-05): byte 7 was unspent. Below 128 the sleeve keeps the layout it has
       always had; at 128 and up it takes one of four new ones. Names, eras and grades come from
       other bytes and do not move. */
    var layout = hb(h, 7) < 128 ? hb(h, 16) % 4 : 4 + hb(h, 7) % 4;
    var g = '';

    g += '<rect width="300" height="300" fill="' + c[0] + '"/>';
    if (layout === 0) {
      /* ⛔ STACK WAS 55 PERCENT EMPTY. The upper 168px carried one line of type
         and nothing else, so more than half of the flagship object class was a
         blank field. It has a motif now: a bleed off disc, a rule stack and the
         band name on a plate it can be read against. */
      g += '<circle cx="238" cy="52" r="74" fill="' + c[2] + '"/>'
        + '<circle cx="238" cy="52" r="46" fill="' + c[1] + '"/>'
        + '<circle cx="238" cy="52" r="16" fill="' + c[0] + '"/>';
      var q; for (q = 0; q < 5; q++) g += '<rect x="16" y="' + (18 + q * 9) + '" width="' + (120 - q * 16) + '" height="4" fill="' + c[3] + '" opacity="' + (0.5 - q * 0.07) + '"/>';
      g += '<rect y="176" width="300" height="124" fill="' + c[1] + '"/>'
        + '<rect y="168" width="300" height="8" fill="' + c[2] + '"/>'
        + '<rect x="12" y="' + (108) + '" width="' + (276) + '" height="46" fill="' + c[3] + '" opacity="0.9"/>'
        + '<text x="24" y="' + (140) + '" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 30, 252) + '" fill="' + c[0] + '"' + (look.it ? ' font-style="italic"' : '') + '>' + esc(band) + '</text>'
        + '<text x="20" y="222" font-family="' + look.f + '" font-size="17" fill="' + c[0] + '">' + esc(album) + '</text>'
        + '<rect x="20" y="236" width="90" height="3" fill="' + c[2] + '"/>';
    } else if (layout === 1) {   // DIAGONAL: band name on an angle over a split field
      g += '<path d="M0 300 L300 0 L300 300 Z" fill="' + c[1] + '"/>'
        + '<g transform="rotate(-32 150 150)"><rect x="-40" y="130" width="380" height="44" fill="' + c[2] + '"/>'
        + '<text x="150" y="160" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 26, 292) + '" fill="' + c[0] + '">' + esc(band) + '</text></g>'
        + '<text x="284" y="252" text-anchor="end" font-family="' + look.f + '" font-size="14" fill="' + c[3] + '">' + esc(album) + '</text>';
    } else if (layout === 2) {   // SUN: centered circle motif
      g += '<circle cx="150" cy="132" r="86" fill="' + c[2] + '"/><circle cx="150" cy="132" r="58" fill="' + c[1] + '"/><circle cx="150" cy="132" r="12" fill="' + c[0] + '"/>'
        + '<text x="150" y="246" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 27, 280) + '" fill="' + c[3] + '"' + (look.it ? ' font-style="italic"' : '') + '>' + esc(band) + '</text>'
        + '<text x="150" y="266" text-anchor="middle" font-family="' + look.f + '" font-size="13" fill="' + c[2] + '">' + esc(album) + '</text>';
    } else if (layout === 3) {   // BARS: horizontal banding, right-set type
      var i; for (i = 0; i < 7; i++) g += '<rect y="' + (i * 44) + '" width="300" height="22" fill="' + (i % 2 ? c[1] : c[2]) + '" opacity="' + (0.16 + i * 0.12) + '"/>';
      g += '<text x="282" y="84" text-anchor="end" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 30, 266) + '" fill="' + c[3] + '">' + esc(band) + '</text>'
        + '<text x="282" y="112" text-anchor="end" font-family="' + look.f + '" font-size="15" fill="' + c[3] + '" opacity="0.8">' + esc(album) + '</text>';
    } else if (layout === 4) {   // SPLIT: two colour halves, the band name set tall up the seam
      g += '<rect width="150" height="300" fill="' + c[1] + '"/><rect x="150" width="150" height="300" fill="' + c[2] + '"/>'
        + '<rect x="142" width="16" height="300" fill="' + c[3] + '"/>'
        + '<g transform="rotate(-90 150 150)"><text x="150" y="158" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 30, 270) + '" fill="' + c[0] + '">' + esc(band) + '</text></g>'
        + '<text x="24" y="270" font-family="' + look.f + '" font-size="14" fill="' + c[3] + '">' + esc(album) + '</text>'
        + '<circle cx="222" cy="72" r="34" fill="' + c[0] + '" opacity="0.9"/><circle cx="222" cy="72" r="6" fill="' + c[3] + '"/>';
    } else if (layout === 5) {   // PLATE: a photograph plate with a title strip under it, the label house look
      g += '<rect x="24" y="22" width="252" height="176" fill="' + c[3] + '"/>'
        + '<rect x="24" y="22" width="252" height="176" fill="' + c[2] + '" opacity="0.45"/>'
        + '<circle cx="' + (60 + hb(h, 26) % 160) + '" cy="' + (70 + hb(h, 27) % 80) + '" r="' + (26 + hb(h, 28) % 30) + '" fill="' + c[1] + '" opacity="0.85"/>'
        + '<path d="M24 198 L120 120 L180 160 L276 96 L276 198 Z" fill="' + c[0] + '" opacity="0.35"/>'
        + '<rect x="24" y="198" width="252" height="6" fill="' + c[2] + '"/>'
        + '<text x="28" y="240" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 26, 244) + '" fill="' + c[3] + '">' + esc(band) + '</text>'
        + '<text x="28" y="262" font-family="' + look.f + '" font-size="13" fill="' + c[2] + '">' + esc(album) + '</text>';
    } else if (layout === 6) {   // TARGET: concentric rings off centre, the name across the middle
      var rr2; for (rr2 = 150; rr2 > 0; rr2 -= 26) g += '<circle cx="190" cy="120" r="' + rr2 + '" fill="' + ((rr2 / 26) % 2 ? c[1] : c[2]) + '"/>';
      g += '<rect y="132" width="300" height="52" fill="' + c[3] + '" opacity="0.92"/>'
        + '<text x="150" y="168" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 30, 276) + '" fill="' + c[0] + '">' + esc(band) + '</text>'
        + '<text x="150" y="222" text-anchor="middle" font-family="' + look.f + '" font-style="italic" font-size="14" fill="' + c[3] + '">' + esc(album) + '</text>';
    } else {                     // GRID: nine tiles, one inverted, the name in a bar
      var gi, gj; for (gi = 0; gi < 3; gi++) for (gj = 0; gj < 3; gj++) { var inv = (gi * 3 + gj) === (hb(h, 28) % 9); g += '<rect x="' + (18 + gi * 90) + '" y="' + (18 + gj * 60) + '" width="84" height="54" fill="' + (inv ? c[2] : c[1]) + '"/>' + (inv ? '<circle cx="' + (60 + gi * 90) + '" cy="' + (45 + gj * 60) + '" r="16" fill="' + c[0] + '"/>' : ''); }
      g += '<rect y="206" width="300" height="60" fill="' + c[3] + '"/>'
        + '<text x="150" y="238" text-anchor="middle" font-family="' + look.f + '" font-weight="800" font-size="' + fit(band, 26, 276) + '" fill="' + c[0] + '">' + esc(band) + '</text>'
        + '<text x="150" y="256" text-anchor="middle" font-family="' + look.f + '" font-size="12" fill="' + c[0] + '" opacity="0.8">' + esc(album) + '</text>';
    }
    // label logo chip + era year, always
    g += '<rect x="16" y="272" width="12" height="12" fill="' + c[2] + '"/>'
      + '<text x="34" y="282" font-family="ui-monospace, monospace" font-size="9" fill="' + c[3] + '" opacity="0.85">' + esc(it.sub.split('·')[1] || '') + ' · ' + it.year + '</text>';
    g += wearLayer(h, (opts && opts.dusty) ? '?' : it.grade);
    /* ⛔ data-dusty is the ONLY way anything outside the renderer is allowed to
       ask whether a render is under dust. The word UNWIPED used to be printed
       into the middle of the artwork and the walk keyed off it, so removing a
       debug label from the art broke a test that had no business reading it. */
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"' + ((opts && opts.dusty) ? ' data-dusty="1"' : '') + ' width="' + size + '" height="' + size + '">' + g + '</svg>', item: it };
  }

  var API = { renderSleeve: renderSleeve, grime: grime, ramp: ramp };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.ATTIC_SLEEVE = API;
})(this);
