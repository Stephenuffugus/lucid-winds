# VINE RUNNER — Art Brief (Midjourney-ready)
# For Stephen. Drop renders into the ART {} object at the top of
# satellites/vine-runner/index.html (or send them to me and I'll wire + tune scale/anchor).

## How it works
The game is fully playable procedurally right now. Each art slot you fill *replaces*
its placeholder — you can do them one at a time, in any order, and see each land.
All sprites are **theme-neutral on purpose** (they must read on all 6 garden palettes),
so you render each ONCE.

## Style token — paste into EVERY prompt (keeps them consistent)
> vibrant 16-bit-inspired game sprite, botanical fantasy, glossy Saturday-morning
> cartoon shading, clean bold silhouette, saturated greens and golds, centered
> subject with ~10% padding, on a flat #FF00FF magenta background

**Transparency:** Midjourney won't output transparent PNGs. Render on the flat magenta,
then knock the magenta out (any bg-remover, or send them to me and I'll matte them).

**Runner camera (poses 1–5):** rear view, slightly above & behind — we see the
character's back, top of head, heels. (Sonic-2 special-stage camera.)

---

## PRIORITY 1 — these 8 fully skin the game
| # | Slot (`ART.`) | Size | Frames | Prompt seed (append the style token) |
|---|---|---|---|---|
| 1 | `runnerRun` | 512² | 4 | a small sprout/vine creature sprinting away from the viewer, rear view from slightly above, legs alternating each frame |
| 2 | `runnerLeanL` | 512² | 1 | same creature banked hard LEFT, leaves trailing, rear view |
| 3 | `runnerLeanR` | 512² | 1 | mirror of #2 (or I flip #2 in code) |
| 4 | `runnerJump` | 512² | 1 | same creature curled into an airborne tuck/ball, rear view (also used as the loop/roll pose) |
| 5 | `runnerHit` | 512² | 1 | same creature flinching, leaves askew, petals/stars popping off |
| 6 | `seed` | 256² | 1–4 | a glowing golden seed/pod; 4 frames = a slow spin (1 frame is fine, code adds bob + glow) |
| 7 | `thorn` | 256² | 1 | a dark red bramble/thorn cluster, menacing, reads clearly at thumbnail size |
| 8 | `boostDew` | 256² | 1 | an oversized luminous cyan-blue dewdrop, inner glow, one bright highlight (the speed pod) |

## PRIORITY 2 — stage dressing (do after P1)
| # | Slot | Size | Frames | Prompt seed |
|---|---|---|---|---|
| 9 | `gateBloom` | 512² | 1 | a giant flower seen head-on down a tunnel, petals radiating from a golden centre (the end-of-stage bloom you run into) |
| 10 | `bgVista` | 512² | 1 (or 6) | soft glowing canopy light at the end of a vine tunnel, floating spores, haze, fading dark at the edges — no transparency needed |
| 11 | `hudSeed` | 128² | 1 | a simple flat-shaded seed icon for the HUD counter |

**Optional themed vistas:** `bgVista` also accepts an **array of 6** (one per garden).
Same prompt, swap the colour words in order: 1 Verdant Vine (lush green) · 2 Sunset Ivy
(amber dusk) · 3 Moonflower (indigo night) · 4 Rose Bramble (crimson) · 5 Frost Fern
(teal/ice) · 6 Golden Root (chartreuse/gold). A single vista is a fine fallback.

## PRIORITY 3 — polish
| # | What | Size | Notes |
|---|---|---|---|
| 12 | Title logo | 1024×512 | "VINE RUNNER" lettering grown from vines, seeds dotting the letters |
| 13 | Sparkle burst sheet | 256² ×4 | gold pop for seed collection (currently procedural) |
| 14 | Vitality leaf icon | 128² | small leaf for the HUD health pips (currently procedural) — nice-to-have |

---

## Notes from the feel pass (so art matches the mechanics)
- **Thorns get a pulsing red warning halo** as they approach — so render the thorn
  itself with a strong, readable red silhouette; the game adds the glow.
- **Dew pod = the speed boost** — make it clearly the "good, grab me" cyan thing,
  visually distinct from gold seeds and red thorns at a glance.
- The runner reads as a **back-view sprinting creature**; lean-left/right sell the
  steering, so exaggerate the bank.
- Seeds must **pop gold against every background** including the dark Night/Cosmic
  gardens — keep them bright and high-contrast.

Send renders (or magenta-bg sheets) and I'll wire each into `ART`, matte them, and
tune per-sprite scale/anchor in-game.
