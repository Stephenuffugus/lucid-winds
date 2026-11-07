# SHUTTERBUG — Astra Round 10 handoff

**120 production sheets / 216 frames.** All six sections are included, together with editable indexed masters. This ZIP is art and integration metadata; it does not change the running game or approve the proposals in `ASSESSMENT.md`.

| Section | Directory | Production sheets | Frames |
| --- | --- | ---: | ---: |
| A — Film stocks | `assets/a_film/` | 12 | 12 |
| B — Rank | `assets/b_rank/` | 11 | 11 |
| C — Prints and row frames | `assets/c_prints/` | 66 | 66 |
| D — Four enemy verbs | `assets/d_enemies/` | 16 | 81 |
| E — Two guardians and attacks | `assets/e_guardians/` | 10 | 26 |
| F — Weather | `assets/f_weather/` | 5 | 20 |

`previews/` contains exactly one contact sheet for each section. Those six previews are for viewing, not importing as atlases. Each production directory has a `source/` subdirectory with one editable text master per PNG. Only this round is included, except for the two explicitly reused Round 9 flame files needed by the Lantern Wasp.

## File and palette contract

`manifest.json` is the import authority. Each production record includes `file`, `key`, `size`, `cell`, `frame_names`, `fps`, `frames`, `pivot` and `source`; the familiar `w`, `h`, `names` fields are retained as convenience aliases. Paths are relative to the ZIP root. `size` is the full PNG width and height; `cell` is one animation frame’s width and height, **not** the world’s 16px erosion grid. The source rectangle for frame i is `[i × cell[0], 0, cell[0], cell[1]]`. There are no atlas gutters or rotated frames.

PNGs use crisp native pixels and binary transparency. Use nearest-neighbour sampling, no mipmaps and integer placement. Preserve the supplied canvas and pivot when changing states. The outlined living forms use the established Ink edge; tiny weather motes are sparse one-pixel marks rather than filled screen overlays. Sources use `frame_name` followed by a space and slash-separated rows: `.` is transparent, and hexadecimal `0`–`f` are these palette indices.

| Index | Colour | Hex | Index | Colour | Hex |
| --- | --- | --- | --- | --- | --- |
| 0 | Ink | #0b0a0f | 8 | Amber | #e07a2b |
| 1 | Soot | #1f1a1d | 9 | Brick | #c8302f |
| 2 | Slate | #4a4a52 | a | Magenta | #d83a9b |
| 3 | Pewter | #8a8a90 | b | Lapis | #2f5fd0 |
| 4 | Ash | #c9c7c0 | c | Teal | #3fb8b4 |
| 5 | Paper | #f2efe6 | d | Moss | #3f9a3a |
| 6 | Glare | #fbfbff | e | Sun | #f2d13f |
| 7 | Walnut | #6b3f2a | f | Film | #f0dcb0 |

The palette is the actual Round 9 palette. Paper is used for the photographs; Film cream and hero/beacon Sun are not introduced into these new room objects. No smoothing or semi-transparent glow is required.

`fps: 0` means select by named state. It does not mean “animate every frame slowly.” Positive fps is a suggested cadence; `loop: false` still means play once, then hold/remove as the behaviour requires. The game owns attack durations, physics, rewards and unlock thresholds. No rank thresholds have been invented.

## A — Six film stocks

Each key is **48 × 48**, one `ready` frame, plus its separate `_locked` key containing one `locked` frame:

`film_auto`, `film_attic`, `film_frost`, `film_deep`, `film_overgrowth`, `film_ember`.

The locked version preserves all colour and adds a small lock drawn with a **one-native-pixel Ink stroke**. The lock is not a one-pixel dot. Draw the stock name and required rank in code beside/below the artwork; do not put text over the motif. Auto’s question of light is a pale disc containing a question-shaped dark opening. The motifs also distinguish stocks without relying on colour: question, moth, snowflake, waves, leaf and flame. Auto’s locked asset is supplied for completeness; its actual availability remains a system decision.

## B — Rank

All badges are **24 × 24**, one `badge` frame, with the iris opening farther at each rank. The names below are metadata, not baked lettering.

| Key | Rank |
| --- | --- |
| `rank_01` | Shutterbug |
| `rank_02` | Snapshot |
| `rank_03` | Focus Puller |
| `rank_04` | Darkroom Hand |
| `rank_05` | Exposure |
| `rank_06` | Lensman |
| `rank_07` | Developer |
| `rank_08` | Enlarger |
| `rank_09` | Archivist |
| `rank_10` | The Light |

`rank_up` is a **128 × 16**, single-frame plate in the film-strip grammar. Put code-rendered words inside its `[10,3,108,10]` text rectangle. The brief did not request a new progress-bar asset; the title’s bar remains code-drawn. Awards of stocks, looks and frames are not encoded into the badge images.

## C — Thirty prints and five completion frames

Every subject has a **16 × 16 pickup** and a separately drawn **48 × 48 album tile**. The pickup is a small Polaroid with a deliberately simplified few-pixel subject; it is not a blurred reduction of the larger tile. All are one-frame assets. Pickup pivots are `[8,16]`; album tile pivots are `[24,24]`.

| Row / prefix | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| attic | The Dusty Globe | A Doll’s Eye | The Stopped Clock | Grandmother’s Fan | The Tin Soldier | A Moth in Amber |
| frost | The Frozen Key | A Snow Globe | The Blue Bottle | The Icicle Comb | A Lost Mitten | The Last Match |
| deep | The Glass Float | A Ship in a Bottle | The Anchor Charm | A Pearl Button | The Diver’s Watch | The Conch |
| overgrowth | The Seed Packet | A Pressed Fern | The Garden Gnome | The Watering Can | A Snail Shell | The Thorn Crown |
| ember | The Brass Lantern | A Matchbook | The Kiln Key | The Ash Jar | A Red Thread | The Coal Heart |

For row `attic`, item 1, bind pickup `print_attic_1` to album tile `print_tile_attic_1`; the same pattern covers every row and number. The canonical collectible ID is the pickup key, and both manifest records carry it as `print_id`. Names may change without altering IDs or saved collection state. The manifest’s `print_collections` maps the complete five-by-six collection and each row reward.

`print_silhouette` is one **48 × 48** generic uncollected tile, as requested. Tint only its Ash (#c9c7c0) silhouette pixels **inside** aperture `[5,4,38,34]`; leave the Paper border, dark image field and lower caption stroke unchanged. A palette-index replacement is preferable to a blended multiply tint, which can introduce colours the cutter refuses. This deliberately does not reveal an individual subject’s shape before collection.

The row rewards are `frame_attic`, `frame_frost`, `frame_deep`, `frame_overgrowth`, `frame_ember`: **72 × 96**, one `unlocked` frame each, preserving the actual Round 8 `polaroid_frame` geometry. The transparent image aperture is exactly **[6,6,60,72]** (x 6–65, y 6–77). Composite the player’s photo beneath the plate; place the plate last. These reward frames are not 48px collection tiles. Colour and lower-border motifs make each row reward distinct.

## D — Four new enemy verbs

All six biome body designs below have both a **16 × 16 fodder** key and a **24 × 24 `<key>_elite`** key. Native elite grids retain the Ink edge and gain larger anatomy/markings. Their first four frame indices are always **0 idle, 1 move, 2 hurt, 3 dead**. The idle/move pair carries a one-pixel body change and a changed stance. Suggested locomotion cadence is 8fps; never include hurt, dead or special actions in that loop.

| Base key | Biome | Additional frames, by index | Verb and art cue |
| --- | --- | --- | --- |
| `dust_lobber` | Attic | 4 windup | Inflates the dusty cheek/nozzle before an arcing shot |
| `cinder_lobber` | Ember | 4 windup | Raises a coal-lined chimney nozzle before the shot |
| `jelly_dropper` | Deep | 4 hanging, 5 drop, 6 climb | Bell stretches downward; climbing arms reach toward the shelf |
| `seed_dropper` | Overgrowth | 4 hanging, 5 drop, 6 climb | Folded seed with leaf hooks; tightens into the falling pose |
| `ice_shellback` | Frost | None | Tall faceted ice shield on the **right** |
| `slag_shellback` | Ember | None | Broad riveted slag plate on the **right** |

`pellet_dust` and `pellet_cinder` are separate **8 × 8**, two-frame (`spin0`, `spin1`) projectile strips at a suggested 10fps. The lobbers’ manifest entries bind their respective projectile. Windup is a held pose; a provisional 400ms art timing is supplied for integration, not a change to the difficulty design. The game computes the arc.

Lobbers and shellbacks use bottom-centre pivots; droppers use top-centre, with their thread exiting there. A falling/climbing dropper’s world anchor moves; the sprite pivot itself stays fixed. Extend the thread toward its shelf in code. No collision bounds are inferred from decorative thread pixels.

Shellback armour is the right side in every living frame. Mirror the entire image **and its combat facing** together. A front hit bounces the hero; a rear hit or top dive kills the enemy, as the brief specifies. The armour has deliberately different geometry in Frost and Ember, beyond its colour.

`splitter_elite` is **24 × 24** with **idle, move, hurt, dead, split**. Its neutral clay body has two joined lobes and a central seam. On its first qualifying hit, the game selects `split` once, then replaces it with two independent children.

`splitter_halves` is a single **16 × 16** strip with eight frames: **left_idle, left_move, left_hurt, left_dead, right_idle, right_move, right_hurt, right_dead**. Spawn one child using block `[0,4]`, the other using `[4,4]`; each uses bottom-centre `[8,16]`. The two seam-facing shapes are distinct. Do not cycle from the left child’s dead frame into the right child’s idle frame. The splitter is neutral clay and needs no biome recolour.

## E — Cobweb Loom and Lantern Wasp

`boss_cobweb_loom` and `boss_lantern_wasp` are **80 × 64** body sheets in the existing `boss_fallback` layout: **breathe, brace, tell, hurt, down**, pivot `[40,64]`, **5 × 4 erosion cells of 16px**. Keep one persistent cell mask across every pose. A pose change must never restore an already destroyed piece. The loom’s wooden members/web and the lantern’s ribs/wings separate into readable parts. Keep the game’s existing dark mass under them; the underlay is not a second damageable layer painted into these files.

The brace poses compress or fold the bodies; tell opens the Loom’s mouth and brightens its web, or raises the Wasp’s wings and lights its lantern. Use the existing 500ms guardian tell window. Hurt retains Ink while flashing the body; down leaves distinct collapsed remains. Neither guardian is enabled in a house by this art pack; the brief places alternation from Round 11 onward.

| Guardian | Attack key | Cell / frames | Placement and playback |
| --- | --- | --- | --- |
| Cobweb Loom | `boss_web_strand` | 16 × 48; drop0–2 | Top-centre `[8,0]` at ceiling; extend downward at 10fps once, then hold/remove by behaviour |
| Cobweb Loom | `boss_dust_puff` | 32 × 32; puff0–2 | Centre `[16,16]`; expand at 10fps once, then remove |
| Lantern Wasp | `boss_stinger_dart` | 8 × 8; spin0–2 | Centre `[4,4]`; right-facing dart, 12fps loop; orient toward its travel direction |
| Lantern Wasp | `boss_floor_flame` | 16 × 16; crawl0–2 | Bottom-centre `[8,16]`; 10fps loop; mirror for leftward travel |

Each attack has a separate `<attack_key>_tell`, **16 × 16**, one static `tell` frame with `[8,16]` pivot. Show the mark before the prop becomes active, then remove it. The web marker sits under the impending ceiling strand; the dart mark indicates its emission/direction rather than drawing the entire trajectory. The manifest’s `guardian_attack_bindings` lists these relationships explicitly.

**Reuse:** `boss_floor_flame.png` and `boss_floor_flame_tell.png` are copied unchanged from Round 9/B, including their source grids. Keep the existing keys and reuse them; do not register a second flame under a Wasp-specific alias. Both are included here so this ZIP is sufficient on its own.

## F — Weather

`weather_attic`, `weather_frost`, `weather_deep`, `weather_overgrowth`, `weather_ember` each contain four **8 × 8** frames, `particle0`–`particle3`, centred at `[4,4]`, suggested 6fps loop. Their subjects are dust, snow, bubbles, pollen and embers respectively. Code scatters and moves them. They are decorative, do not collide, and should remain sparse enough that tells and collectibles are easy to find. Freeze or reduce their movement under the game’s reduced-motion option. Pollen uses Moss/Ash, not the hero’s Sun.

## Shipping readings and observed limits

- **Live visit:** the available browser showed build `sb m2 12`; I played the sample room and opened the album, but its title had no Darkroom entry, so no house-to-guardian run was completed.
- **Phone request:** no physical phone or working device emulation was available in this session; the live observations are from the browser view and are not claimed as phone playtesting.
- **Designed systems:** film stocks, rank and COLLECTION are treated as future systems exactly as written in the brief; their absence from the observed build did not change the asset list.
- **No extra approval step:** the ten assessment ideas are proposals for Stephen only; all drawn assets implement the supplied brief rather than those proposals.
- **Locked mark:** “1px lock” means one-pixel stroke around a legible tiny lock; a literal one-pixel symbol could not communicate locked state.
- **Rank plate:** “rank up strip” is interpreted as one static 128 × 16 plate because no animation or baked words were requested.
- **Print naming:** `print_tile_<same>` is interpreted as `print_tile_<biome>_<number>`, without repeating `print_` inside the key.
- **Print silhouette:** one generic unknown subject is supplied, as the singular asset request specifies; its tinted region is defined above.
- **Frame size:** “as your Round 8 frames” means its actual 72 × 96 Polaroid canvas and 60 × 72 aperture, preserved here.
- **Enemy variants:** each of the six biome bodies gets both fodder and elite sheets; the splitter gets its single elite plus a combined two-child fodder sheet.
- **New enemies:** all are new keys; no Round 8/9 enemy key is silently replaced.
- **Dust puff:** the unspecified size is resolved to 32 × 32 and three expansion frames, matching Round 9’s dust-prop scale.
- **Guardian tells:** separate anticipation marks are included for all four attacks to preserve Round 9’s attack-plus-tell convention.
- **Dark mass:** the existing world underlay remains in place; only the erodible guardian bodies change.
- **Biome vocabulary:** new keys use `overgrowth`, matching this brief and the live album; it is the biome called Bramble in Round 9.

No new weapon, title, additional HUD screen, gameplay build, or unrequested earlier-round archive is included.
