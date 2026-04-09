# CAPYBARA COMPANION — IMPROVEMENT SPEC
## For: Claude Code (super-duper-enigma)
## From: Art Pipeline Manager
## Codebase: index.html (single-file game)

---

## WHAT THIS IS

The Capybara is a Mythic-tier companion creature (7.81% drop rate from hash byte 18, range 0xE0-0xF3). It renders as a small SVG creature sitting next to the plant's pot. There are TWO render paths that both need updating:

---

## LOCATION 1: renderCompanion — case 33
**File:** index.html
**Approximate line:** 10850
**Context:** Inside the `renderCompanion(t, uid)` function, `switch` on `t.companion`

### Current Code (case 33):
```javascript
      case 33: // The Capybara — sitting upright, bottom-right, head clearly above body
        s += '<g opacity="0.82">';
        // Body — wide seated oval, slightly transparent
        s += '<ellipse cx="56" cy="89.5" rx="5.5" ry="3.0" fill="#A87850" opacity="0.75"/>';
        // Belly highlight
        s += '<ellipse cx="56" cy="90.5" rx="3.5" ry="1.5" fill="#C09870" opacity="0.3"/>';
        // Front legs — visible, spread open
        s += '<ellipse cx="52.5" cy="91.5" rx="1.2" ry="0.5" fill="#8A5838" opacity="0.6"/>';
        s += '<ellipse cx="59.5" cy="91.5" rx="1.2" ry="0.5" fill="#8A5838" opacity="0.6"/>';
        // Head — clearly ON TOP, more opaque than body
        s += '<ellipse cx="56" cy="86.0" rx="3.0" ry="2.4" fill="#B88860"/>';
        // Snout — blunt
        s += '<ellipse cx="56" cy="87.5" rx="1.8" ry="1.0" fill="#C09870"/>';
        // Eyes — small, set wide
        s += '<circle cx="54.5" cy="85.5" r="0.5" fill="#2D1810"/>';
        s += '<circle cx="57.5" cy="85.5" r="0.5" fill="#2D1810"/>';
        s += '<circle cx="54.6" cy="85.4" r="0.15" fill="#F4EDDA" opacity="0.5"/>';
        s += '<circle cx="57.6" cy="85.4" r="0.15" fill="#F4EDDA" opacity="0.5"/>';
        // Ears — tiny rounded bumps
        s += '<ellipse cx="54.0" cy="84.2" rx="0.8" ry="0.6" fill="#9A6840"/>';
        s += '<ellipse cx="58.0" cy="84.2" rx="0.8" ry="0.6" fill="#9A6840"/>';
        // Nose dots
        s += '<circle cx="55.5" cy="87.8" r="0.18" fill="#2D1810"/>';
        s += '<circle cx="56.5" cy="87.8" r="0.18" fill="#2D1810"/>';
        s += '</g>';
        break;
```

This version faces FORWARD (symmetrical, both eyes visible).

---

## LOCATION 2: renderMythic — case 'The Capybara'
**File:** index.html
**Approximate line:** 11398
**Context:** Inside the `renderMythic(t, uid)` function, `switch` on `t.mythicName`

### Current Code:
```javascript
      case 'The Capybara':
        // Sits at pot base, right side — clear of stem/leaves
        s += '<g opacity="0.82">';
        // body
        s += '<ellipse cx="54" cy="86" rx="6.5" ry="3.5" fill="#A87850"/>';
        // head
        s += '<ellipse cx="59.5" cy="84.2" rx="3.2" ry="2.6" fill="#B88860"/>';
        // snout
        s += '<ellipse cx="62" cy="84.8" rx="1.5" ry="1.1" fill="#C09870"/>';
        s += '<circle cx="62.5" cy="84.5" r="0.45" fill="#3A2010" opacity="0.7"/>';
        // eye
        s += '<circle cx="59.5" cy="83.2" r="0.75" fill="#2D1810" opacity="0.9"/>';
        s += '<circle cx="59.7" cy="83.0" r="0.22" fill="#F4EDDA" opacity="0.6"/>';
        // ear
        s += '<ellipse cx="58.2" cy="82.2" rx="0.95" ry="0.75" fill="#9A6840"/>';
        // stubby legs
        s += '<ellipse cx="50.5" cy="88.8" rx="1.3" ry="0.55" fill="#8A5838" opacity="0.55"/>';
        s += '<ellipse cx="57.5" cy="88.8" rx="1.3" ry="0.55" fill="#8A5838" opacity="0.55"/>';
        s += '</g>';
        break;
```

This version faces RIGHT (side profile, one eye visible).

---

## VISUAL PREVIEW

Open this HTML to see both versions rendered side by side:

```html
<!DOCTYPE html>
<html><head><style>body{background:#0d100c;display:flex;gap:40px;align-items:center;justify-content:center;height:100vh;margin:0;}
.lbl{color:#5a7050;font-family:system-ui;font-size:10px;text-align:center;margin-top:8px;}</style></head><body>
<div>
<svg viewBox="40 78 30 16" width="300" height="160" style="background:rgba(122,179,86,0.03);border-radius:8px;">
<g opacity="0.82"><ellipse cx="56" cy="89.5" rx="5.5" ry="3.0" fill="#A87850" opacity="0.75"/><ellipse cx="56" cy="90.5" rx="3.5" ry="1.5" fill="#C09870" opacity="0.3"/><ellipse cx="52.5" cy="91.5" rx="1.2" ry="0.5" fill="#8A5838" opacity="0.6"/><ellipse cx="59.5" cy="91.5" rx="1.2" ry="0.5" fill="#8A5838" opacity="0.6"/><ellipse cx="56" cy="86.0" rx="3.0" ry="2.4" fill="#B88860"/><ellipse cx="56" cy="87.5" rx="1.8" ry="1.0" fill="#C09870"/><circle cx="54.5" cy="85.5" r="0.5" fill="#2D1810"/><circle cx="57.5" cy="85.5" r="0.5" fill="#2D1810"/><circle cx="54.6" cy="85.4" r="0.15" fill="#F4EDDA" opacity="0.5"/><circle cx="57.6" cy="85.4" r="0.15" fill="#F4EDDA" opacity="0.5"/><ellipse cx="54.0" cy="84.2" rx="0.8" ry="0.6" fill="#9A6840"/><ellipse cx="58.0" cy="84.2" rx="0.8" ry="0.6" fill="#9A6840"/><circle cx="55.5" cy="87.8" r="0.18" fill="#2D1810"/><circle cx="56.5" cy="87.8" r="0.18" fill="#2D1810"/></g>
</svg>
<div class="lbl">case 33 — front facing<br>(renderCompanion ~line 10850)</div>
</div>
<div>
<svg viewBox="44 78 24 14" width="300" height="175" style="background:rgba(122,179,86,0.03);border-radius:8px;">
<g opacity="0.82"><ellipse cx="54" cy="86" rx="6.5" ry="3.5" fill="#A87850"/><ellipse cx="59.5" cy="84.2" rx="3.2" ry="2.6" fill="#B88860"/><ellipse cx="62" cy="84.8" rx="1.5" ry="1.1" fill="#C09870"/><circle cx="62.5" cy="84.5" r="0.45" fill="#3A2010" opacity="0.7"/><circle cx="59.5" cy="83.2" r="0.75" fill="#2D1810" opacity="0.9"/><circle cx="59.7" cy="83.0" r="0.22" fill="#F4EDDA" opacity="0.6"/><ellipse cx="58.2" cy="82.2" rx="0.95" ry="0.75" fill="#9A6840"/><ellipse cx="50.5" cy="88.8" rx="1.3" ry="0.55" fill="#8A5838" opacity="0.55"/><ellipse cx="57.5" cy="88.8" rx="1.3" ry="0.55" fill="#8A5838" opacity="0.55"/></g>
</svg>
<div class="lbl">case 'The Capybara' — side profile<br>(renderMythic ~line 11398)</div>
</div>
</body></html>
```

---

## CONSTRAINTS (non-negotiable)

- ViewBox: 0 0 70 95 — nothing outside bounds
- Capybara must stay in bottom-right quadrant (x: 45-65, y: 78-93) to avoid overlapping stem/leaves
- ES5 string concatenation only (no template literals, no const/let)
- All colors inline hex — no CSS variables
- Max 20 SVG elements per render (currently 10-16, room to add detail)
- Must render at 60fps on a 2020 midrange phone
- Both render paths (case 33 AND case 'The Capybara') should produce the SAME visual — consolidate to one design

---

## WHAT TO IMPROVE

The current capybara is functional but basic — it's 10 ellipses and circles. A Mythic creature at 7.81% drop rate should feel special. Suggested improvements:

1. **More recognizable silhouette** — capybaras have a distinctive boxy head, flat nose, and thick body. The current version reads more as "generic rodent." Make the proportions more capybara-specific.

2. **Fur texture suggestion** — 2-3 thin stroked arcs on the body (stroke-width 0.4, low opacity) to suggest coarse fur. Not detailed — just enough to break the flat ellipse.

3. **Better ears** — capybara ears are small and round, set high on the head. Current ears are generic bumps.

4. **Whiskers** — 2-3 thin lines from the snout area. Very fine (stroke-width 0.3-0.4). Capybaras have prominent whiskers.

5. **Seated pose** — the front-facing version (case 33) should look like it's sitting contentedly, maybe with a very subtle forward lean like a capybara at rest.

6. **Consolidate both versions** — pick the better pose (recommend side-profile facing right), polish it, then use the same code in BOTH render paths.

7. **Subtle shadow** — one low-opacity ellipse beneath the body (fill #000, opacity 0.08) to ground it on the pot surface.

---

## VERIFICATION

After changes, render these test hashes to confirm the capybara appears correctly:

```javascript
// Force capybara — mythic byte 0xE0
window._forgeHash('00000000000000000000000000000000000000E0000000000000000000000000');

// Force capybara on tall stem
window._forgeHash('000f000000080000000000000000000000000000E0000000000000000000000f');
```

Verify:
- Capybara visible at pot base, right side
- Does not overlap stem or lowest leaf
- Does not extend below y=93 (pot bottom)
- Does not extend past x=65 (right edge safety)
- Renders identically from both renderCompanion case 33 and renderMythic case 'The Capybara'
