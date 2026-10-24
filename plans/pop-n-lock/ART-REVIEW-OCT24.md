# Pop N Lock: Astra's return checked, file by file (Fable, 24 Oct 2026)

**What arrived** (his chat upload, copied byte for byte, vaulted as `vault-20261024-pop-n-lock-astra` in the private
vault repo): `assets/pop-n-lock-assets.zip` (18,464,160 bytes, sha256 `6ce2238b...`, git ignored) and the review PDF
(`docs/briefs/pop-n-lock/ASTRA-RETURN-POP-N-LOCK-REVIEW-OCT24.pdf`, 20 pages; its 68 directions are also
`extras/directions.json` in the zip). Extracted to `/tmp/claude-1000/.../scratchpad/pnl/x/` (dies at a codespace stop;
re-extract from the zip with `python3 -I`, never run anything in `extras/`).

**Against the brief** (`docs/briefs/pop-n-lock/ASTRA-POP-N-LOCK-OCT23.html` section 5): **111 of 216 files, 105 missing,
every one listed in the manifest**, exactly what the brief allowed ("if this is too much for one pass, do the first six
pests, the boss, the secret and the Keeper, and list the rest under MISSING"). All 111 are the exact pixel sizes asked,
RGBA with real alpha (no magenta keying needed), lower case underscore names in the brief's folders. Every dance frame
has its feet on y = 470 of a 512 canvas (measured: bottoms 470 in all 54). The style is one style: the July pack's neon
b boy cartoon, thick ink, flat neon, one light from upper left. The extras folder carries developer files (a patch, a
regression script, a copy of the live source, python build scripts): read as data only.

## Per set

| Set | Asked | Got | Looked at | Verdict |
|---|---|---|---|---|
| `pods/` five bodies, no faces | 5 | 5, each with its own mark (crimson diamond, dewdrop circle, nightshade star, sprout triangle, sunbean square) | readable without colour at thumbnail size; the marks sit low, under where the code draws the eyes | **use** |
| `pods/<colour>/pod_link_h, _v` | 10 | 10 | flat bars, authored procedurally (Astra says so); plain next to the painted bodies but they are joins behind bodies | **use**, drawn behind the bodies, clipped to the cell (PNL-056) |
| `pods/chaff.png` | 1 | 1 | a dull grey rock, clearly worthless | **use** |
| `pods/chaff_crack_01..03` | 3 | 0 | | **missing**; the code's procedural shatter stays |
| `pop/` 20 pop frames | 20 | 0 | | **missing**; the code's procedural pop stays |
| `board/` three frames | 3 | 3 | thin neon outline rectangles with corner knots, apertures empty (centre alpha 0 on all three); procedural, not the "speaker cabinet or stage" asked | **use for now**, weak: they are frames, not a set piece. Ask again later with the missing list |
| `dance/` 15 characters x 6 | 90 | 54 (9 characters: aphid swarm, Baron Greymould, Baron Von Beetle, Chompers, Gnat King Cole, the Keeper, Mabel, Ronin Hare, Sir Reginald) | six distinct frames each, real moves (worm, backspin, headspin, robot, King's freeze); Gnat King Cole's "scratch spin" is six near identical DJ poses; the aphid crowd wave is subtle; several characters face left or front though the brief said right (a dance turns, so this is acceptable: do NOT mirror whole sets); apparent scale jumps inside a loop (the Keeper's frames 3 and 4 are twice as wide as 1 and 6, Chompers frame 3 is 257 tall against 391) are the moves, not errors, but the engine must hold one render box per character | **use**, with one render box and a crossfade check on device (Astra asks the same) |
| `react/` hit + danger x 15 | 30 | 30, all fifteen, the six characters without a dance included | consistent; hit = bracing, danger = hands up; the two read apart | **use** |
| `hud/` hype frame, sap frame, sap ready | 3 of 17 | 3 | thin frames, procedural, fine as frames | **use**; the 14 tier and chain plates are **missing**; code keeps drawing those words |
| `powers/` 17 icons + warning | 18 | 5 (aphid_rain, bloom_surge, deep_roots, greenhouse_glass, cast_warning) | the four round icons are the best painted pieces in the pack; the warning is a dark wordless banner with a bolt | **use** when Powers ships; 13 icons **missing** |
| `story/` 16 panels | 16 | 0 | | **missing** |
| `store/` feature graphic, icons | 3 | 0 | | **missing** |
| `extras/match_concept.jpg` | (the style picture) | 1 | a proposed layout: big well with the pods, a rival rail, HYPE as a vertical meter, a two row six button tray (LEFT SOFT RIGHT / ROTATE L ROTATE R DROP), the aphid crew in a caption bar | a proposal only, and a good one: it is Astra's PNL-007 and PNL-008 drawn |

**Three things wrong, named:** (1) the board frames are outlines, not the painted speaker cabinet the brief asked for;
(2) Gnat King Cole's dance barely moves; (3) nothing for the 105 missing files was substituted, so the HYPE tiers, chain
numbers, pops and story cards stay code drawn after this pack lands.

## Astra's review, sorted (keep, change, kill: my reading, his word decides anything marked HIS)

**Bugs that are real (verified in `satellites/chaff-wars/index.html`, BUILD v1.6, the live file):**
- PNL-060 HYPE drains in milliseconds: `loop(t)` passes `dt` in MILLISECONDS (`dt = t - lastT`, capped 60);
  `tickField` does `f.hype -= dt*1.3` (line 1016), so 80 HYPE is gone in four frames. The meter has never worked.
  Astra's patch (`dt/1000*1.3`) is right.
- PNL-061 the same for `chainGlow` (line 1015).
- PNL-062 All Clear spent without a clear: `finishResolve` adds and clears `allBonus` on any resolve, chain or not
  (line 749). Astra's guard (`R.chain>0`) is right and matches Tsu.
- PNL-063 a cancelled touch rotates: `pointercancel` is wired to `dragEnd` (line 1420), whose short touch branch
  rotates. Astra's cancel handler is right.
- PNL-064 `firePower` (line 688) has no phase guard and mutates the grid inside the button handler, with a silent
  `catch`. Powers is a hidden mode today, so the risk is latent; fix with Powers.
- PNL-067 the hold repeat waits 105 then 33 ms before the first repeat. Small, real.
- PNL-007 there is no soft drop button: the tray is `c-left c-right c-rotccw c-rot c-prog`, `$('c-down')` is guarded by
  `if(!el)return`, and the soft hold lives only on the drag gesture. Real.
- PNL-066 the next window art box and the pair draw use different rectangles. Plausible from the source; verify on a shot.
- PNL-065 at 360 wide the 540 stage scales to 0.667 and 11 px labels become 7 px; the settings switch is 43 x 24. Real
  against the 48 px and 0.7 rem laws.

**Keep (agree):** PNL-001 feel before features; 003 to 006 and 009 to 012 (landing window, kick table and quick turn,
one repeat scheduler, drag intent lock with the hard drop flick as a setting, an accurate guide, a chain rhythm with
distance based landing instead of frame decay, attack numbers and a same tick commit, pause on hide); 008 the bigger
grid at 412 with labels in CSS px; 046 to 048 the dance state machine (result, hit, danger, chain dance, idle; the
signature loop at chain 2) which is what the dance art is for; 050 and 053 (the first three rivals as lessons, a
measured balance experiment: the July memory already holds the sweep tool); 054 to 058 the art integration rules
(near black well, marks under faces, joins behind equal neighbours only, map underscore names to the hyphenated ids,
load only the current two dancers: a 512 frame is 1 MiB decoded, 120 frames would be 120 MiB); 059 the launch gate;
068 keep the polish that exists.

**Change (agree with the direction, his word on the shape):** PNL-002 Standard versus Retro rules (the July ruling
kept Tsu as default with `RULES.classic` one boolean away: Retro is that boolean given a name, cheap, HIS to want);
036 to 038 the crew collection, the neighbourhood story and the ending (needs the 16 missing story panels or runtime
text cards; HIS); 041 rematch in the room (Astra calls the live code's hidden Again a gap; real, needs the room code
flow); 044 online attack durability (the relay's eight event window: a real risk for online Versus, priority 1 by Astra,
but server shaped; HIS on whether online Versus is in this build at all).

**HIS calls, not planned:** PNL-013 to 033, the Powers redesign. Astra replaces his July design (input reversal,
rotation lock, forced drop, hidden colours, control freeze) with board tactics only: cancelable Chaff packets, bounded
cleanses, shields, delays, one reflect; 17 named powers with costs and cooldowns (`extras/powers_spec.json`) and a
resolution contract with deterministic tests. It is a coherent design and the safer one for online play; it is also a
rewrite of his idea, so it waits for his yes. PNL-034 Daily Mix, 035 36 puzzles, 039 training, 042 quick match, 043
pass and play, 045 share cards: new modes, his. PNL-040 price 0.99: his.

**Kill (disagree):** nothing outright. PNL-004's "two press 180 quick turn" is a Tsu feature the July ruling did not
ask for; fold it under PNL-002 as part of Standard only if he wants it.
