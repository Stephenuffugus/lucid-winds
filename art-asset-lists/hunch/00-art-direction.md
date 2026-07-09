# Hunch — Art Direction

> A neon oracle-machine squints at your doodle and tries to read your mind — draw fast, guess-bait the AI, chase the streak.

**Genre:** AI drawing-duel / creative party guessing game (you draw a prompt, a real AI machine guesses blind and scores you)

## Pick a look (kid-friendly options)

### 1. Neon Oracle Arcade — *polished* ⭐ RECOMMENDED
Clean modern-mystic vector illustration with a premium glossy-toy finish: each AI 'machine' is a smooth rounded vinyl / frosted-glass oracle-bot glowing on near-black navy, with one signature electric-lime eye as its soul. Confident dark linework, flat color fields with soft cel-shading and a single crisp specular highlight, gentle bloom around every lime core. Reads app-store premium and a touch mysterious, but stays friendly and kid-safe — this is the machine as a cute cosmic fortune-teller, not a horror robot.

### 2. Sketchbook Doodle — *cozy*
Warm hand-drawn marker-and-crayon look on a cream paper-grain field — perfect for a game that is literally about drawing. Wobbly confident ink outlines, gentle crayon-fill shading, tiny doodle sparkles and scribble-marks, the machines rendered as lovable hand-sketched robots as if the player doodled their opponent themselves. Lime is a bright highlighter-marker accent. Cozy, personal, low-stakes, disarmingly charming.

### 3. Synth Arcade CRT — *retro*
80s synthwave arcade energy: bold geometric chrome-and-neon robot heads over a dark grid horizon, magenta/cyan/lime rim-lighting, soft scanline and CRT-bloom glow, chunky beveled shapes. The machine reads as a retro fortune-telling arcade cabinet come to life. High-contrast, bold, nostalgic — flashier than the other two, still clean and readable at chip size.

**Recommended: Neon Oracle Arcade.** Sheets here already use this look; to try another, swap the first STYLE paragraph in each sheet file.

## Sheets (generate each separately)

- `01-hunch-personas-512.md` — Sheet 1 — Persona machine mascots + thinking eye (cutout)
- `02-hunch-tile-512.md` — Sheet 2 — Portal / app brand tile (full-bleed)

## Style block (baked into every sheet prompt here)

```
STYLE — "Neon Oracle Arcade": polished modern-mystic vector illustration with a premium glossy-toy finish. Every character is a cute AI "machine" oracle-bot — a smooth, rounded vinyl / frosted-holographic-glass robot with one glowing lime eye that is literally its soul. Rendering: clean confident vector linework with a subtle dark outline (#0a0b14), large flat color fields, soft two-step cel-shading, and exactly one crisp specular highlight per form, plus a gentle inner-glow bloom radiating from the lime eye/core. Materials read as matte vinyl + frosted holographic glass + brushed dark-metal accents — never photoreal, never a 3D clay render, never muddy gradient banding. PALETTE: deep near-black navy #0d0e1a base, panel indigo #16182b for shadow shapes, electric lime #c8ff4d as the single "power/eye" signature color, teal #5eead4 as cool rim-light, cream #eef0ff for light body panels, with sparing accents of hit-green #7CFC9B, streak-amber #ffac4d, and miss-rose #ff6b81. LIGHT: soft top-down key light, a cool teal rim-light along the left edge, and a warm lime glow blooming out from each character's eye/core. Bold readable silhouettes FIRST — one distinct shape plus one signature glow per character so it stays legible at a 60px start-screen chip AND a 160px hero size. Mood: cozy-confident, playfully mysterious, a friendly cosmic fortune-teller machine — kid-friendly, never scary, no gore, no grim horror. NO photorealism, NO 3D clay render, NO text labels, NO captions, NO borders, NO UI words unless a logo cell names the exact wordmark. Keep lighting flat and even enough that each sprite cuts cleanly on transparency and compresses well under 150KB.
```

## Wire notes

Inventory is unchanged from the prior asset list (it is correctly keyed to real code) — only the art DIRECTION changed from paper-craft to 'Neon Oracle Arcade'. Sheet 1 cells 1-5 are the unlockable personas, wired in renderPersonas() (index.html ~line 426): swap `<span class=\"pe\">${p.emoji}</span>` for `<img class=\"pe\" src=\"assets/personas/persona_${id}.png\">`. Persona ids/order come from the PERSONAS map: critic, noir, sunny, gremlin, zen — so CUT CELL 5 AS persona_zen.png (engine id 'zen', display name 'The Oracle'), not persona_oracle.png. Chips render ~60px on the start screen and also flavor the result screen, so silhouettes must survive shrinking. Sheet 1 cell 6 (machine_eye_thinking) replaces the `.eye` div (in this clone hunch.html:203, `<div class=\"eye\">👁️</div>` inside #scThink; the index.html build has it ~line 287): swap the emoji for `<img src=\"assets/personas/machine_eye_thinking.png\">` — the CSS @keyframes squint animation still applies to the img, so keep the eye centered/symmetric. Sheet 2 (hunch_tile.png) replaces the typographic icons/icon.svg referenced in the <head> and manifest.webmanifest, AND serves as the Sky Wolf portal thumbnail for this game. Recommended folders: assets/personas/ for Sheet 1, icons/ for Sheet 2 (matches the repo's ART_ASSETS.md convention). DO NOT author: drawing pad #pad, timer ring #ring, score/streak header, result/leaderboard screens, or the shop ink/theme cosmetics — all procedural-by-design; art would degrade them. Every cutout is simple flat-shaded vector on transparency and compresses comfortably under 150KB at 512x512.

