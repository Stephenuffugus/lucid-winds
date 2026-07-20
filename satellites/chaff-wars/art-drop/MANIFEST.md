# Pop N Lock — "Neon Boombox" Art Pack (raws) — dropped 2026-07-20

Source: Stephen's 012Assets Drive → "Pop N Lock — Art Pack (Neon Boombox, 2026-07-19)".
These are the RAW generations (magenta #FF00FF knockout on the crew/UI/FX/logo sheets;
opaque on the backgrounds). Prompt pack of record: `art-asset-lists/pop-n-lock/`.
Cut with `scripts/cut_popnlock.py` → `satellites/chaff-wars/assets/`.

| Raw file | Content | Grid | Cut → assets/ |
|---|---|---|---|
| sheet1.png | Crew A (cols: aphid-swarm, gnat-king-cole, cabbage-moth · rows: idle/win/lose) | 3x3 magenta | char/{id}-{idle,win,lose}.png |
| sheet2.png | Crew B (slug-slugmore, cutworm, june-beetle) | 3x3 magenta | char/… |
| sheet3.png | Crew C (garden-snail, crow-cawlin, gopher-gustavo) | 3x3 magenta | char/… |
| sheet4.png | Crew D (deer-duchess, bindweed-lady, powdery-mildew) | 3x3 magenta | char/… |
| sheet5.png | Heroes (baron-greymould, ronin-hare, keeper) | 3x3 magenta | char/… |
| sheet6a.png | **menu-wall** (blank lit brick, cans + cassette on ground) | opaque | bg/menu-wall.jpg |
| sheet6b.png | **battle-alley** (dark alley, graffiti sides, dark UI center, boombox) | opaque | bg/battle-alley.jpg |
| sheet7a.png | logo — stacked POP N / LOCK burner (square) | magenta | logo/stacked.png |
| sheet7b.png | logo — wide one-line POP N LOCK burner | magenta | logo/wide.png |
| sheet8.png | UI chrome (14 plates, see below) | 4x4 magenta (last 2 blank) | ui/… |
| sheet9.png | FX (pop/chaff splat, buff wipe, cast aura — 4 frames each) | 4x4 magenta | fx/… |

### sheet8 UI chrome cell map (row-major, 4x4)
R1: vs-frame · banner-win · banner-lose · banner-allclear
R2: mode-a · mode-b · next-window · power-lit
R3: burst-1 · burst-2 · burst-3 · burst-go
R4: room-card · power-unlit · (blank) · (blank)

### sheet9 FX cell map (row-major, 4x4; each row = 4 anim frames)
R1: pop-1..4   R2: chaff-1..4   R3: buff-1..4   R4: aura-1..4

Character ids match `ROSTER` ids in index.html exactly.
