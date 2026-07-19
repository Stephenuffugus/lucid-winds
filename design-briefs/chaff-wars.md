# CHAFF WARS — Design Brief & Asset Manifest
### A faithful Puyo Puyo / Dr. Robotnik's Mean Bean Machine remake for the Lucid Winds portal
Built: Jul 19-20, 2026. Status: **v1.0 engine + campaign + AI shipped and bot-verified.** Art is procedural (no image files yet); this doc is also the forward asset plan.

> One-sentence description (portal card): *Clear falling seedpods into big chains and bury your rival garden pest in worthless grey Chaff.*

---

## 1. What it is

The player is a garden **Keeper** defending their plot. Colorful **Seedpods** fall two at a time; line up four or more of one color and they pop; pops cascade into **chains**; every chain rains worthless grey **Chaff** onto the rival pest's board. Top out (block your spawn column) and you lose. It is Puyo Puyo, dressed as a cozy-but-mischievous garden brawl.

Location: `satellites/chaff-wars/index.html` (single self-contained ES5 file, the house satellite pattern). Modes shipped: **Campaign** (13 pests + 1 secret), **Solo Endless**. Multiplayer is the next phase (the engine already supports the competitive Tsu ruleset it needs).

---

## 2. THE RULESET FORK — one decision for the Director

Research (puyonexus.com, the canonical competitive wiki, plus the official Sega manual) established a key fact: **Mean Bean Machine is Puyo Puyo 1 (1992), not Puyo Puyo Tsu (1994).** The two rulesets differ in ways that matter:

| Rule | Puyo 1 / authentic MBM | Puyo Tsu / modern competitive |
|---|---|---|
| Offsetting (counter incoming garbage with your own chain) | **None** — garbage always lands | **Yes** — your chain cancels incoming, net excess forwarded |
| All-Clear bonus (clearing the whole board) | **None** | **+30 Chaff loaded onto your next attack** |
| Chain power curve | doubles then caps at 999 (chain 9+) | linear +32/chain ramp, no early cap |
| Hard drop | No (soft drop only) | Yes |

**We ship with the Tsu ruleset as the default** for two reasons: the Director wants **live multiplayer**, and offsetting is the single mechanic that makes competitive versus deep and fair; and he described the countering behavior himself ("they get sent back"). Authentic nostalgia is one boolean away: set `RULES.classic = true` at the top of the engine and Chaff Wars plays exactly like the 1993 Genesis cartridge (no offset, no all-clear, 999-cap chain curve).

**Note on the remembered "3-1" / "3:1" formula:** no such ratio exists in any Puyo/MBM code. The garbage math is simply `floor((chainScore + carry) / 70)` with the fractional remainder carried to the next attack. The "3" is most likely a memory of MBM's 1P-vs-2P Level-4 handicap, which spots a player **3 rows (18 beans) of starting garbage** (Level 5 spots 5 rows). We reproduce that idea as the late-boss `startChaff` handicap (Miss Mildew 1 row, Baron Greymould 2, Ronin Hare 3).

---

## 3. Verified mechanics (source of truth)

Board **6 columns × 12 visible rows + 1 hidden spawn row**; spawn & death cell = column 3 (0-indexed 2), top. Pop = **4+ same color, orthogonal only** (no diagonals). Chain loop: pop → column gravity → re-scan → pop (next link). Chaff: single-hit, never self-pops, cleared only by an orthogonally-adjacent color clear, no hardened variant.

**Scoring (both rulesets share these; only Chain Power differs):**
`score_per_step = (10 × beansCleared) × clamp(ChainPower + ColorBonus + GroupBonus, 1, 999)`
- Chain Power (Tsu, default): `0,8,16,32,64,96,128,160,192,224,256,288,320,352,384,416,448,480,512`
- Chain Power (classic MBM): `0,8,16,32,64,128,256,512,999,999,…`
- Color Bonus by distinct colors in the step: `1→0, 2→3, 3→6, 4→12, 5→24`
- Group Bonus per group, summed: `4→0, 5→2, 6→3, 7→4, 8→5, 9→6, 10→7, 11+→10`

**Garbage:** `Chaff sent = floor((chainScore + carry) / 70)`, remainder carries. Target Points = 70, fixed (no margin time). Drop in rows of 6, partial row in random columns, reallocate on full column, max 30 (5 rows) per drop. Tsu offsetting cancels 1:1 against your own pending before forwarding the excess.

All of these live as clearly-labeled constants at the top of the engine (`CHAIN_POWER_TSU`, `CHAIN_POWER_CLASSIC`, `COLOR_BONUS`, `groupBonus()`, `TARGET_POINTS`, `ALLCLEAR_NUIS`, `GARBAGE_CAP`) so any rebalance is a one-line change.

---

## 4. Campaign "Keeper's Stand" — roster & ramp

13 garden pests, ascending, plus a secret duel. Every line is one sentence, no dashes (studio standard).

| # | Pest | Colors | Fall (cells/s) | AI q (0-1) | React (ms) | Start Chaff | Handicap |
|---|------|:--:|:--:|:--:|:--:|:--:|:--:|
| 1 | The Aphid Swarm | 4 | 1.2 | 0.10 | 900 | 0 | 1.00 |
| 2 | Gnat King Cole | 4 | 1.5 | 0.18 | 850 | 0 | 1.00 |
| 3 | Mabel Cabbagewing | 4 | 1.9 | 0.26 | 800 | 0 | 1.00 |
| 4 | Sir Reginald Slugmore | 4 | 2.3 | 0.34 | 750 | 0 | 1.00 |
| 5 | Chompers the Cutworm | 4 | 2.8 | 0.42 | 700 | 0 | 1.00 |
| 6 | Baron von Beetle | 4 | 3.4 | 0.50 | 650 | 0 | 1.00 |
| 7 | Escargeddon | 4 | 4.0 | 0.57 | 600 | 0 | 1.00 |
| 8 | Cawlin the Crow | 4 | 4.7 | 0.64 | 540 | 0 | 1.05 |
| 9 | Gustavo the Gopher | 5 | 5.5 | 0.71 | 480 | 0 | 1.05 |
| 10 | Duchess Dapple | 5 | 6.4 | 0.78 | 420 | 0 | 1.10 |
| 11 | Lady Bindweed | 5 | 7.3 | 0.85 | 370 | 0 | 1.15 |
| 12 | Miss Mildew | 5 | 8.2 | 0.92 | 310 | 1 | 1.20 |
| 13 | Baron Greymould (boss) | 5 | 9.2 | 0.97 | 260 | 2 | 1.25 |
| S | The Ronin Hare (secret) | 5 | 10.5 | 1.00 | 230 | 3 | 1.40 |

Final boss Baron Greymould is the "Robotnik" of the garden and opens by dumping pre-placed Chaff on the player, exactly like the original. The secret **Ronin Hare** is a cheeky Rabbit Samurai cameo, unlocked after clearing the boss.

**Match structure:** single game per opponent (faithful MBM cadence). Best-of-3 for the boss and secret is designed but v1 ships single-game across the board for a brisk 13-fight run; the `RULES`/match layer can add rounds later. Unlock is linear (beat N to unlock N+1); the design also specs charming "Garden Gate" password codes as a future homage to the cartridge password system.

---

## 5. AI

Per falling pair the AI enumerates ~22 legal placements (11 for same-color pairs), simulates each drop + full chain resolution, and scores the result with a weighted heuristic dominated by **chain potential** (the latent biggest chain the board could ignite) plus height, spawn-column choke, connectivity, and buried-singleton terms. A single difficulty knob `q ∈ [0,1]` scales think-quality (blunder probability + top-K sampling), the chain-building weights, reaction speed, a fire-threshold (how long it holds a chain), and a counter-fire toggle (only q ≥ 0.6 reacts to incoming garbage; below that it ignores your board, faithful to MBM). Compute is ~5.8ms average / 14.6ms worst at q=1.0 with 5 colors, and it runs **once per piece spawn**, not per frame, so it never janks the 60fps render.

---

## 6. Economy & rewards

All earns route through the shared `_sbCapEarn` helper (30 Sunbeams/day/game cap, studio standard). First-clear rewards: 2 Sunbeams per pest 1-11, 3 for Miss Mildew and Baron Greymould, +2 campaign-completion bonus = **exactly 30**, i.e. clearing the campaign in a day maxes the daily allowance by design. Replay wins pay 1 (soft-capped). Solo Endless pays `floor(score/1200)` up to 6. The secret Ronin Hare is cosmetic only (no Sunbeams), so it can never collide with the cap. Future cosmetic economy: earnable skins (Heirloom base, Dewdrop, Googly Sprouts) plus premium Pi skins (Crystal Pods, Autumn Husks).

---

## 7. ASSET & ANIMATION FRAME MANIFEST (the "how many frames" answer)

Everything below is the **future sprite-art budget**. The shipped v1 renders 100% procedurally (faced seedpods with gaze, grey Chaff husks, ghost drop, chain floats) and needs zero image files to run. Author sizes: seedpods/chaff 96×96 @2x, portraits 256×256 @2x (bosses 512), backgrounds 1080×1920 @2x.

### Per-element frame counts
- **One seedpod color, one skin = 45 frames:** idle breathe (8), blink (4), directional connected-eyes gaze (8), land squash (5), nervous/anticipation (6), pop/burst (8), falling wobble (6).
- **One full skin (5 colors) = 225 frames.**
- **All 5 skins (Heirloom base + Dewdrop + Googly Sprouts + Crystal Pods + Autumn Husks) = 1,125 frames.**
- **Chaff (universal grey, tinted in code per skin) = 33 frames:** standard idle/jitter/crack/shatter (17) + hardened multi-hit variant (16). Recommend keeping universal for threat-readability.
- **Character portraits (15 = 14 opponents + Keeper) = 529 frames:** 33 each (neutral idle 6, taunt 6, attacking 5, flinch 4, victory 6, defeat 6), with the boss (+20) and secret (+14) getting extra states.
- **Backgrounds (6 grouped biome stages) = 6 static / 18 animated frames** (recommend 2-3 procedural parallax layers over baked cels).
- **FX & UI = 93 frames MVP (text chain numbers) / 169 full (sprite chain 1-19).** Covers all-clear banner, chaff-incoming warning, pending counter icons, Sunbeam sparkle, win/lose/VS/countdown banners, title logo, buttons, board frame.
- **Audio = 25 assets** (15 SFX + 10 music tracks) layered over the shipped WebAudio placeholders. No frame cost.

### Grand totals
| Pass | Frames | Contents |
|---|---:|---|
| **MVP art** | **≈ 886** | 1 base bean skin, universal chaff, 15 portraits, 6 static stages, text chain numbers |
| **Full "go all out"** | **≈ 1,874** | 5 bean skins, animated backgrounds, sprite chain flourishes |

**Phasing:** Phase 1 Ship = 886. Phase 2 Polish = +88 (animated backgrounds + sprite chain numbers) = 974. Phase 3 Premium skins = +900 (the four alternate bean sets that drive the cosmetic economy) = 1,874. The gap between MVP and full vision is almost entirely monetizable cosmetics, so we can ship at 886 and grow into 1,874.

> **Twenty-second summary:** Chaff Wars needs about **886 sprite frames** to ship a complete, good-looking art pass, and about **1,874 frames** for the full vision. The extra ~900 are the four premium bean skins, so the art can ship lean and monetize the rest. **Do not drop this asset list into the Drive art pipeline until the Director gives the go.**

---

## 8. Next phases (Director's stated wants)

1. **Live multiplayer** — engine already runs the competitive Tsu ruleset (real-time both-boards, offsetting, counter). Needs a netcode layer (matchmaking + input/garbage sync).
2. **Campaign polish** — best-of-3 bosses, password codes, portrait art, per-stage backgrounds/music.
3. **Cosmetic economy** — earnable + premium bean skins per the manifest; Pi-priced premium tier.

## 9. Dev / test notes

- Headless verify: open `?cwdev=1` → `window.CW_DEV` exposes `proofCheck()`, `sim(stage,seed,maxTurns)`, `demo()`, `bench()`, `setRule('classic',true)`, `state()`, `grid()`, `resolve(grid)`, and manual `botMove/rotate/drop/soft`. All engine proofs pass; matches conclude; classic mode verified.
- Screenshot probe: `file://` + puppeteer at deviceScaleFactor 2 (see `reference_satellite_screenshot_probe` memory). Headless Chrome has no emoji font, so opponent-portrait emoji render as tofu boxes — a headless-only artifact, and a reason the portraits are slated for real art.
- Every scoring/garbage/difficulty constant is a labeled one-liner at the top of the engine for fast retuning.
