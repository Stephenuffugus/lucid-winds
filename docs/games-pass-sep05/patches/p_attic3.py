import re
P='/workspaces/lucid-winds/satellites/attic/object-render.js'
s=open(P).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90]))
    s=s.replace(old,new)

# ── ERA_LOOK gains a title treatment string per era ──
rep("""  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif' },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: 'Georgia, serif' },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Georgia, serif' },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif' },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace' }
  };""",
"""  /* ERA DEPTH (2026-09-05). Three of the five eras shared Georgia and a title was the same
     drawing in five palettes. `ta` is the title's era treatment, dropped into every class's
     title text: 50s script (italic, tight), 60s bubble (fat round outline in the dark ink),
     70s slab (spaced, a hard mitre outline), 80s chrome (wide caps, a hairline of the pop
     colour), 90s grunge (monospace spread wide, a little faded). Attribute strings only, so
     the nine title lines keep their own sizes and fits. */
  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif',
      ta: 'font-style="italic" letter-spacing="-0.4"' },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: '"Trebuchet MS", "Arial Rounded MT Bold", sans-serif',
      ta: 'paint-order="stroke" stroke="#241430" stroke-width="2.4" stroke-linejoin="round" letter-spacing="-0.8"' },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Rockwell, "Courier New", Georgia, serif',
      ta: 'paint-order="stroke" stroke="#241a10" stroke-width="1.3" stroke-linejoin="miter" letter-spacing="1.8"' },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif',
      ta: 'paint-order="stroke" stroke="#26f0e0" stroke-width="0.7" letter-spacing="2.4"' },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace',
      ta: 'letter-spacing="3" opacity="0.9"' }
  };""")
# the nine title lines take the era treatment (only lines that fit it.name with look.f)
pat=re.compile(r"""look\.f \+ '" font-weight="800" font-size="' \+ fit\((it\.name|String\(it\.name\))""")
n=len(pat.findall(s)); assert n>=8, n
s=pat.sub(lambda m: """look.f + '" font-weight="800" ' + look.ta + ' font-size="' + fit(""" + m.group(1), s)
print('title lines treated:', n)

# ── the price sticker becomes an era object ──
rep("""  function priceSticker(h, px, py, big) {
    var rx = big ? 26 : 24, ry = big ? 14 : 13;
    return '<g transform="rotate(' + (-6 + hb(h, 24) % 12) + ' ' + px + ' ' + py + ')">'
      + '<ellipse cx="' + px + '" cy="' + py + '" rx="' + rx + '" ry="' + ry + '" fill="#f5efdd" stroke="#c9bfa4" stroke-width="1"/>'
      + '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="10" fill="#5a4f3a">$' + (1 + hb(h, 25) % 5) + '.99</text></g>';
  }""",
"""  /* ⛔ THE PRICE STICKER IS AN ERA OBJECT (2026-09-05). One cream oval said "$4.99" on a
     1953 lunchbox and a 1998 zine alike. The era is read the way the engine reads it
     (byte 1 mod 5), the price byte stays byte 25 and the tilt byte 24, so nothing else
     moves. Five stickers a dealer would actually have used: a paper price dot in cents,
     a trading stamp, an orange price gun label, a black neon shop tag, a clearance
     barcode. The group carries data-era so a gate can count five. */
  var ERA_NAMES = ['1950s', '1960s', '1970s', '1980s', '1990s'];
  function priceSticker(h, px, py, big) {
    var era = hb(h, 1) % 5, tilt = -6 + hb(h, 24) % 12, pb = hb(h, 25), s = '';
    var open = '<g data-era="' + ERA_NAMES[era] + '" transform="rotate(' + tilt + ' ' + px + ' ' + py + ')">';
    if (era === 0) {          // paper price dot, in cents, a red ring, serif
      s = '<circle cx="' + px + '" cy="' + py + '" r="14" fill="#f3e9d2" stroke="#c9bfa4" stroke-width="1"/>'
        + '<circle cx="' + px + '" cy="' + py + '" r="11" fill="none" stroke="#c94a3a" stroke-width="1.2"/>'
        + '<text x="' + px + '" y="' + (py + 3.5) + '" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="9.5" fill="#8a2b20">' + (19 + (pb % 5) * 10) + '&#162;</text>';
    } else if (era === 1) {   // trading stamp: green, perforated edge
      s = '<rect x="' + (px - 17) + '" y="' + (py - 12) + '" width="34" height="24" fill="#e9e3c8"/>'
        + '<rect x="' + (px - 17) + '" y="' + (py - 12) + '" width="34" height="24" fill="none" stroke="#f6f2e4" stroke-width="2" stroke-dasharray="2 2"/>'
        + '<rect x="' + (px - 14) + '" y="' + (py - 9) + '" width="28" height="18" fill="#2e7f4a"/>'
        + '<text x="' + px + '" y="' + (py - 1) + '" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="5.5" fill="#e9e3c8" letter-spacing="0.6">TRADING</text>'
        + '<text x="' + px + '" y="' + (py + 6) + '" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="6.5" fill="#f2d16b">' + (1 + pb % 3) + '0 STAMPS</text>';
    } else if (era === 2) {   // price gun label: orange, a torn left edge, a SALE line
      s = '<path d="M' + (px - 16) + ' ' + (py - 9) + ' l3 2 l-3 2 l3 2 l-3 2 l3 2 l-3 2 l3 2 l-3 2 l34 0 l0 -16 Z" fill="#e8772a" stroke="#a84e14" stroke-width="0.8"/>'
        + '<text x="' + (px + 2) + '" y="' + (py + 1) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-weight="700" font-size="9" fill="#2a1408">$' + (1 + pb % 4) + '.' + (pb % 2 ? '29' : '49') + '</text>'
        + '<text x="' + (px + 2) + '" y="' + (py + 7) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="4.5" fill="#2a1408" letter-spacing="1.2">SALE</text>';
    } else if (era === 3) {   // black shop tag with a neon edge
      s = '<rect x="' + (px - 18) + '" y="' + (py - 10) + '" width="36" height="20" rx="3" fill="#101018" stroke="#ff2d7a" stroke-width="1.2"/>'
        + '<text x="' + px + '" y="' + (py + 1) + '" text-anchor="middle" font-family="\\'Arial Narrow\\', system-ui, sans-serif" font-weight="700" font-size="9" fill="#26f0e0" letter-spacing="1">$' + (3 + pb % 7) + '.99</text>'
        + '<text x="' + px + '" y="' + (py + 7.5) + '" text-anchor="middle" font-family="\\'Arial Narrow\\', system-ui, sans-serif" font-size="4.5" fill="#ff2d7a" letter-spacing="1.5">NEW LOW</text>';
    } else {                  // clearance barcode
      var i, bars = '';
      for (i = 0; i < 11; i++) bars += '<rect x="' + (px - 15 + i * 2.7) + '" y="' + (py - 8) + '" width="' + ((pb >> (i % 7)) & 1 ? 1.6 : 0.8) + '" height="8" fill="#1a1a18"/>';
      s = '<rect x="' + (px - 19) + '" y="' + (py - 11) + '" width="38" height="22" fill="#f6f4ee" stroke="#b9b5aa" stroke-width="0.8"/>' + bars
        + '<text x="' + px + '" y="' + (py + 8) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="5" fill="#1a1a18" letter-spacing="0.4">CLEARANCE ' + (1 + pb % 5) + '.99</text>';
    }
    return open + s + '</g>';
  }""")
open(P,'w').write(s); print('object-render patched')

# ── the gate ──
C='/workspaces/lucid-winds/satellites/attic/check.js'
s=open(C).read()
anchor="group('the condition ladder is legible: seven grades, seven pictures');"
assert s.count(anchor)==1
s=s.replace(anchor, r"""group('era depth: five eras, five stickers, five title treatments');
{
  /* the era is byte 1 mod 5 (the engine's law); the sticker shows on wiped grades up to
     NEAR MINT; the title carries the era treatment. Sweep every class at GOOD. */
  const eraSeen = {}, taSeen = {}, missing = [];
  ATTIC.CLASSES.forEach(c => {
    const base = HASHES.find(h => ATTIC.hashToItem(h).cls === c);
    if (!base) return;
    for (let e = 0; e < 5; e++) {
      const h = setByte(setByte(base, 1, e), 2, 0x88);   // era e, GOOD
      const it = ATTIC.hashToItem(h), svg = OBJ.renderItem(h, 300).svg;
      const m = svg.match(/data-era="([0-9]{4}s)"/);
      if (c !== 'RECORD') { if (m && m[1] === it.era) eraSeen[it.era] = (eraSeen[it.era] || 0) + 1; else missing.push(c + '/' + it.era); }
      if (c !== 'RECORD') { const ta = { '1950s': /font-style="italic"/, '1960s': /stroke-linejoin="round"/, '1970s': /stroke-linejoin="miter"/, '1980s': /letter-spacing="2\.4"/, '1990s': /letter-spacing="3"/ }[it.era]; if (ta && ta.test(svg)) taSeen[it.era] = (taSeen[it.era] || 0) + 1; }
    }
  });
  ok('every non record class shows the sticker of its era at GOOD, all five eras', Object.keys(eraSeen).length === 5 && missing.length === 0, missing.slice(0, 6).join(', ') || Object.keys(eraSeen).join(' '));
  ok('every era puts its own treatment on the title', Object.keys(taSeen).length === 5 && Object.values(taSeen).every(n => n >= 8), JSON.stringify(taSeen));
  /* the sticker is grade blind below MINT and absent above NEAR MINT */
  const base = HASHES.find(h => ATTIC.hashToItem(h).cls === 'TOY');
  const at = g => (OBJ.renderItem(setByte(base, 2, g), 300).svg.match(/data-era=/g) || []).length;
  ok('the sticker shows on TRASHED through NEAR MINT and not on MINT or FACTORY SEALED', at(0x08) === 1 && at(0xC0) === 1 && at(0xE8) === 1 && at(0xFA) === 0 && at(0xFF) === 0, [at(0x08), at(0xC0), at(0xE8), at(0xFA), at(0xFF)].join(','));
}
"""+anchor)
open(C,'w').write(s); print('check patched')
