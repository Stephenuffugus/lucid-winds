import re
S='/workspaces/lucid-winds/satellites/attic/sleeve-render.js'
O='/workspaces/lucid-winds/satellites/attic/object-render.js'
s=open(S).read(); o=open(O).read()
def rep(txt,old,new,n=1):
    c=txt.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:90])); return txt.replace(old,new)

# ── the era sticker moves to the sleeve renderer, which both renderers can reach ──
i=o.index("  var ERA_NAMES = ['1950s', '1960s', '1970s', '1980s', '1990s'];"); j=o.index("    return open + s + '</g>';\n  }", i)+len("    return open + s + '</g>';\n  }")
sticker_fn=o[i:j]
o=o[:i]+"  /* the era sticker lives in sleeve-render.js now, so records wear it too (2026-09-05) */\n  function priceSticker(h, px, py, big) { return S.priceSticker(h, px, py, big); }"+o[j:]
open(O,'w').write(o)

s=rep(s,"""  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif', it: 1 },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: 'Georgia, serif', it: 0 },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Georgia, serif', it: 0 },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif', it: 0 },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace', it: 0 }
  };

  // 0.72em average glyph width for bold caps; avail = pixels the line may span
  function fit(text, max, avail) { return Math.min(max, (avail || 260) / (Math.max(6, text.length) * 0.72)); }""",
"""  /* ERA DEPTH (2026-09-05): the same five title voices the other nine classes got, on the band
     name: 50s script, 60s bubble, 70s slab, 80s chrome, 90s grunge. `ls` is the letter spacing
     in user units and fit() takes it off the width first. */
  var ERA_LOOK = {
    '1950s': { c: ['#efe3cd', '#2e7f7a', '#d24a35', '#1e2a32'], f: 'Georgia, serif',
      ta: 'font-style="italic" letter-spacing="-0.4"', ls: -0.4 },
    '1960s': { c: ['#e8571d', '#7a2a8a', '#f2b01e', '#241430'], f: '"Trebuchet MS", "Arial Rounded MT Bold", sans-serif',
      ta: 'paint-order="stroke" stroke="#241430" stroke-width="1.6" stroke-linejoin="round" letter-spacing="-0.6"', ls: -0.6 },
    '1970s': { c: ['#caa452', '#7a4a22', '#3f5b3a', '#241a10'], f: 'Rockwell, "Courier New", Georgia, serif',
      ta: 'paint-order="stroke" stroke="#241a10" stroke-width="1.3" stroke-linejoin="miter" letter-spacing="1.8"', ls: 1.8 },
    '1980s': { c: ['#101018', '#1c1c2c', '#ff2d7a', '#26f0e0'], f: '"Arial Narrow", system-ui, sans-serif',
      ta: 'paint-order="stroke" stroke="#26f0e0" stroke-width="0.7" letter-spacing="1.8"', ls: 1.8 },
    '1990s': { c: ['#d8d4c8', '#3a3a38', '#8a2b20', '#191917'], f: 'ui-monospace, monospace',
      ta: 'letter-spacing="2.2" opacity="0.9"', ls: 2.2 }
  };

  // 0.72em average glyph width for bold caps; avail = pixels the line may span, less the spacing
  function fit(text, max, avail, ls) { var n = Math.max(6, String(text).length); return Math.max(5, Math.min(max, ((avail || 260) - (n - 1) * (ls || 0)) / (n * 0.72))); }

  /* ⛔ THE PRICE STICKER IS AN ERA OBJECT (2026-09-05), shared with object-render.js so a 1953
     lunchbox and a 1953 record wear the same paper cent dot. Era is byte 1 mod 5, the price
     byte 25, the tilt byte 24. */
"""+sticker_fn)
# the eight band name lines take the treatment and pass the spacing; the old italic flag goes
pat=re.compile(r"""font-family="' \+ look\.f \+ '" font-weight="800" font-size="' \+ fit\(band, (\d+), (\d+)\)""")
n=len(pat.findall(s)); assert n==8, n
s=pat.sub(lambda m: """font-family="' + look.f + '" font-weight="800" ' + look.ta + ' font-size="' + fit(band, %s, %s, look.ls)"""%(m.group(1),m.group(2)), s)
c=s.count("""(look.it ? ' font-style="italic"' : '')"""); assert c==2, c
s=s.replace(""" + (look.it ? ' font-style="italic"' : '')""", "")
# the sleeve's own cream oval becomes the era sticker
s=rep(s,"""      var px = 216 + hb(h, 22) % 40, py = 18 + hb(h, 23) % 30;
      w += '<g transform="rotate(' + (-6 + hb(h, 24) % 12) + ' ' + px + ' ' + py + ')">'
        + '<ellipse cx="' + px + '" cy="' + py + '" rx="26" ry="14" fill="#f5efdd" stroke="#c9bfa4" stroke-width="1"/>'
        + '<text x="' + px + '" y="' + (py + 4) + '" text-anchor="middle" font-family="ui-monospace, monospace" font-size="11" fill="#5a4f3a">$' + (1 + hb(h, 25) % 5) + '.99</text></g>';""",
"""      var px = 216 + hb(h, 22) % 40, py = 22 + hb(h, 23) % 30;
      w += priceSticker(h, px, py, true);""")
s=rep(s,"""  var API = { renderSleeve: renderSleeve, grime: grime, ramp: ramp };""",
        """  var API = { renderSleeve: renderSleeve, grime: grime, ramp: ramp, priceSticker: priceSticker };""")
open(S,'w').write(s); print('sleeve patched; sticker moved')

C='/workspaces/lucid-winds/satellites/attic/check.js'
c=open(C).read()
c=rep(c,"""      if (c !== 'RECORD') { if (m && m[1] === it.era) eraSeen[it.era] = (eraSeen[it.era] || 0) + 1; else missing.push(c + '/' + it.era); }
      if (c !== 'RECORD') { const ta =""", """      if (m && m[1] === it.era) eraSeen[it.era] = (eraSeen[it.era] || 0) + 1; else missing.push(c + '/' + it.era);
      { const ta =""")
c=rep(c,"""  ok('every non record class shows the sticker of its era at GOOD, all five eras',""", """  ok('every class, records included, shows the sticker of its era at GOOD, all five eras',""")
c=rep(c,"""  ok('every era puts its own treatment on the title', Object.keys(taSeen).length === 5 && Object.values(taSeen).every(n => n >= 8), JSON.stringify(taSeen));""",
        """  ok('every era puts its own treatment on the title, records included', Object.keys(taSeen).length === 5 && Object.values(taSeen).every(n => n >= 9), JSON.stringify(taSeen));""")
open(C,'w').write(c); print('gate covers records')
