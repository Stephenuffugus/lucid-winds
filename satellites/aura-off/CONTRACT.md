# AURA OFF — BUILD CONTRACT v1

**This file is the interface every module builds against.** It is derived from
`HANDOFF.md`, `ROSTER-TARGET.md`, `docs/AURA-BIBLE.md`, `docs/AURA-CULTURE.md`
and the DOM in `index.html`. Where those disagree, precedence is:

1. `index.html` — for DOM ids (it is the real shell that shipped)
2. `ROSTER-TARGET.md` — for **content** (what moves/opponents exist)
3. `AURA-BIBLE.md` Addendum v1.1 — overrides the bible body
4. `AURA-BIBLE.md` body + `AURA-CULTURE.md` — for **evidence** and physical description

If a module needs a number that is in none of them, it is a **new design
decision** — put it here, do not scatter it.

---

## 0. THE ONE ARCHITECTURAL RULE

`resolveExchange()` in `src/engine/battle.js` is the **only** place a turn
outcome is decided. The UI animates its result. The balance simulator calls it
directly. Neither re-implements the rules.

**If you are computing a score inside `src/ui/`, you are in the wrong file.**

---

## 1. FILE OWNERSHIP

Each file has exactly one owner during the build. Do not write outside your lane.

```
src/data/moves.js       27 moves, pure data, no logic
src/data/campaign.js    5 acts, 25 opponents, 5 fits, pure data
src/data/mc.js          announcer lines, pure data
src/engine/rig.js       joint names, UPPER/LOWER masks, applyPose()
src/engine/anim.js      keyframe sampling, amplitude, masking, follow-through lag
src/engine/scoring.js   composure(), all multipliers, crowd vs judge functions
src/engine/battle.js    resolveExchange(), match state, AI policy
src/ui/game.js          screen state machine, deck, run/campaign flow
src/ui/hud.js           crowd ring, meter, callouts, MC bar
src/ui/timing.js        needle + hold-to-amplify input
src/ui/save.js          the ONLY file that touches localStorage
src/ui/style.css        all styling
src/main.js             boot + wiring only
test/validate.js        data integrity + content-safety + evidence lint
test/balance-sim.js     3000 battles/matchup x 4 policies
test/integration.js     boots index.html in jsdom, plays a real battle
tools/gen-docs.js       regenerates ROSTER.md from code
```

Runtime dependencies: **zero**. `jsdom` is test-only. Modern ES modules are fine
(this is a satellite, not the ES5 Lucid Winds shell).

---

## 2. THE RIG — FROZEN, DO NOT RENAME

Twelve joints. These map to real bones when 3D lands. Renaming breaks the port.

```js
export const JOINTS = ['rot','bob','lean','head','sL','eL','sR','eR','hL','kL','hR','kR'];
export const UPPER  = ['lean','head','sL','eL','sR','eR'];
export const LOWER  = ['rot','bob','hL','kL','hR','kR'];
```

| Joint | Meaning | Unit | Sane range |
|---|---|---|---|
| `rot` | whole-body rotation about the feet | deg | -90 … +90 |
| `bob` | vertical offset of the hips (+ = down) | rig units | -20 … +60 |
| `lean` | torso lean / sway | deg | -20 … +20 |
| `head` | head rotation / tilt | deg | -30 … +30 |
| `sL` `sR` | shoulder (upper arm) angle | deg | -180 … +180 |
| `eL` `eR` | elbow angle | deg | -150 … +30 |
| `hL` `hR` | hip angle | deg | -40 … +40 |
| `kL` `kR` | knee angle | deg | -40 … +10 |

**Rest pose is all zeros.** A joint omitted from a keyframe is `0`, not
"hold previous". This makes amplitude scaling trivially correct (§4) and makes
the validator able to check every frame independently.

---

## 3. MOVE SCHEMA

```js
{
  id:       'sixseven',        // lowercase a-z0-9 only, unique, matches ROSTER
  name:     'Six-Seven',       // display
  cat:      'FLOW',            // 'FLEX' | 'FLOW' | 'BAIT'
  tier:     'V1',              // 'V1' documented in a real battle | 'V3' ours
  base:     52,                // base score, integer
  up:       1.0,               // upper-body weight
  lo:       0.0,               // lower-body weight — up + lo === 1.0 EXACTLY
  idealAmp: 1.15,              // the amplitude the crowd rewards
  dur:      1600,              // ms. Keep 1400-2200. Culture rule: seconds, not routines.
  hint:     'Palms up. Legs dead still.',   // HOW to perform it, never what it means
  lag:      0,                 // ms upper trails lower. ONLY set when lo > 0.5. 80-140.
  special:  'interrupt',       // optional, see §6
  frames:   [ {t:0, ...}, {t:0.35, ...}, {t:1, ...} ]
}
```

**Hard rules the validator enforces:**

- `up + lo === 1.0` (within 1e-9)
- `frames[0].t === 0` and `frames[last].t === 1`, strictly increasing
- every key in a frame other than `t` must be in `JOINTS`
- `lag > 0` only permitted when `lo > 0.5`
- `id` must appear exactly once, and must be reachable from some opponent `drop`
- `tier: 'V1'` only for ids on the sourced list in §8
- **content safety:** no move name, hint, or id may describe an action aimed at
  the opponent. BAIT is self-directed clowning. See §7. `lasso` is the single
  documented exception and is a rope gag, not mockery.

**Flavour rule (from AURA-CULTURE §1.4):** `hint` describes *how to perform the
move*. It never explains what the meme means. Meaning is the one thing this
culture refuses to supply.

---

## 4. ANIMATION

```
sample(move, t01, amp)  →  { rot, bob, lean, ... }   // all 12 joints
```

1. Find the bracketing keyframes for `t01`, interpolate each joint linearly.
   (Ease with smoothstep on the segment parameter — it costs nothing and reads
   far better than linear.)
2. **Amplitude scales deltas from rest, never absolutes.** Rest is zero, so
   `value * amp`. Never scale `t`.
3. **Follow-through lag:** if `move.lag > 0`, sample the UPPER joints at
   `t01 - lag/dur` (clamped to 0) while LOWER samples at `t01`. This one rule
   does more for perceived quality than any polish pass.
4. **Blending is bone masking.** `blend(A, B)` takes UPPER joints from A's
   sample and LOWER joints from B's. Identical concept in SVG and in three.js.

---

## 5. SCORING

```
raw = base
    × timing
    × matchup
    × freshness
    × composure(move, amp)
    × combo
    × pattern
```

| Factor | Values |
|---|---|
| `timing` | perfect **2.0** · clean **1.35** · shaky **0.7** · whiff **0.3** |
| `matchup` | advantage **1.5** · neutral **1.0** · disadvantage **0.7** |
| `freshness` | by times already used: `[1.0, 0.68, 0.42, 0.25]`, clamp at last |
| `combo` | `1 + 0.14 * links` |
| `pattern` | named 3-move chain **1.5**, else **1.0** |

**Category triangle:** `FLEX > BAIT`, `BAIT > FLOW`, `FLOW > FLEX`.

### composure() — FROZEN, quoted from HANDOFF §2. Do not flatten.

```js
export function composure(move, amp){
  const off = amp - move.idealAmp;
  const w = off > 0 ? 0.70 : 0.90;   // tighter tolerance above ideal
  return Math.max(0.50, 1.25 - Math.pow(Math.abs(off) / w, 1.7));
}
```

Score falls off on **both** sides of ideal, and harder above than below.
Bigger is not better. This is sourced (Aldama, Parque México — the winner was
the calmest performer, not the loudest) and it is the mechanic that makes 27
moves feel like 27 different physical acts. A linear ramp would be simpler and
would make the game worse.

### Crowd vs judges — two different functions, not one with a flag

Verified: some battles are crowd-judged, some use a panel, some both.

- **`crowdScore(ctx)`** rewards laughter and surprise. Weight BAIT category up,
  reward big swings and novelty, care less about precision.
- **`judgeScore(ctx)`** rewards technique and freshness. Weight `composure` and
  `freshness` up, punish repeats harder, ignore spectacle.

Act scoring modes: `'crowd'` · `'judges'` · `'both'`. Act 5 additionally sets
`unstable: true` — the deck moves, which perturbs the player's achieved
amplitude and speeds the timing needle.

### Blend

Costs **100 hype**. Takes UPPER from move A and LOWER from move B.
**Reward a genuine split, punish a stack.** A blend of two upper-dominant moves
(six-seven + jawline) must score *worse* than a real split (six-seven upper +
aura walk lower). Suggested: multiply by `0.6 + 1.4 * (A.up * B.lo)` — tune in
the sim, but the sign of the effect is not negotiable.

---

## 6. SPECIALS AND QUIRKS

Twelve specials. Each is a **mechanical role**, not a number tweak.

| Special | Effect |
|---|---|
| `interrupt` | cancels the opponent's combo chain this turn |
| `guard` | halves incoming score this turn |
| `refresh` | resets freshness decay on your least-fresh move |
| `feint` | very cheap; next move gets +1 combo link |
| `highRisk` | ×1.6 on a perfect/clean, ×0.35 on shaky/whiff |
| `debuff` | reduces the opponent's next-turn score |
| `counter` | bonus scaled by how big the opponent's last move was |
| `finisher` | usable only when the meter is within ~15% — large swing |
| `evade` | negates the opponent's `debuff`/`counter` this turn |
| `hype` | generates extra hype instead of score |
| `read` | reveals the opponent's next category before you commit |
| `persist` | scores again at reduced value on the following turn |

Four opponent quirks:

| Quirk | Effect |
|---|---|
| `mirror` | always picks the category that beats your last |
| `patient` | skill scales up when behind |
| `frontrunner` | skill scales up when ahead |
| `punisher` | extra penalty applied to your repeats |

---

## 7. CONTENT SAFETY — ENFORCED BY THE BUILD, NOT BY THIS PARAGRAPH

**No move may mock the opponent.** BAIT is self-directed clowning — falling
over, legs giving out, cracking yourself up. Never punching at the other person.

This is the line Costa Rica's Ministry of Public Education drew when it
restricted these battles in schools: fine until used to **humiliate, ridicule,
harass, or discriminate**. Documented competitors are as young as six.

`test/validate.js` must fail the build on a violation. A move called
"Point & Laugh" shipped in three consecutive versions while this rule sat in a
markdown file being ignored. It is now "Losing It", where you crack yourself up.
**A paragraph does not survive contact with a code generator. A failing build does.**

Also enforced:
- no real person's name, likeness, or signature celebration
- no branded garment or existing character (that is exactly the trap the real
  CDMX winner walked into with the Lightning McQueen shorts)
- no stat called "attractiveness"; mewing/sigma are absurdist comedy, never aspiration
- `tier:'V1'` cannot be claimed without the id being on the §8 list

---

## 8. EVIDENCE — THE V1 LIST

Only these 13 ids may carry `tier:'V1'`. Everything else is `V3` — our original
work, which is safe to ship and honest to label.

```
sixseven  mewing  sigma  shades  grimace  aurawalk  boat  swirl
collapse  lasso   eyeroll  sideeye  clog
```

Anything else marked V1 fails the build.

---

## 9. CONTENT — 27 MOVES

Authoritative table. `ROSTER-TARGET.md` is the source; this is the same data in
build order. **id ← name mapping matters** — several differ.

| id | name | cat | tier | base | up/lo | idealAmp | special |
|---|---|---|---|---|---|---|---|
| `aurawalk` | Aura Walk | FLEX | V1 | 60 | 20/80 | 1.00 | — |
| `mewing` | Jawline | FLEX | V1 | 58 | 100/0 | 1.05 | interrupt |
| `sigma` | Cold Read | FLEX | V1 | 44 | 100/0 | 1.00 | guard |
| `shades` | Shade Drop | FLEX | V1 | 56 | 90/10 | 1.10 | — |
| `stillwater` | Still Water | FLEX | V3 | 62 | 50/50 | 0.90 | — |
| `slowturn` | Slow Turn | FLEX | V3 | 56 | 30/70 | 1.05 | refresh |
| `grimace` | The Grimace | FLEX | V1 | 78 | 100/0 | 1.15 | finisher |
| `shadowstep` | Shadow Step | FLEX | V3 | 46 | 20/80 | 1.00 | evade |
| `heeldrag` | Heel Drag | FLEX | V3 | 66 | 10/90 | 0.88 | — |
| `sixseven` | Six-Seven | FLOW | V1 | 52 | 100/0 | 1.15 | — |
| `sideeye` | Look Away | FLOW | V1 | 34 | 100/0 | 1.00 | feint |
| `boat` | River Prow | FLOW | V1 | 70 | 50/50 | 1.05 | — |
| `shoulder` | Shoulder Roll | FLOW | V3 | 48 | 80/20 | 1.20 | — |
| `spin` | Ground Spin | FLOW | V3 | 60 | 20/80 | 1.30 | — |
| `ripple` | Body Wave | FLOW | V3 | 54 | 50/50 | 1.20 | — |
| `swirl` | Swirl & Swing | FLOW | V1 | 56 | 90/10 | 1.20 | — |
| `headnod` | Head Nod | FLOW | V3 | 36 | 100/0 | 1.05 | — |
| `crowdturn` | Crowd Turn | FLOW | V3 | 30 | 40/60 | 1.25 | hype |
| `collapse` | Dead Drop | BAIT | V1 | 64 | 30/70 | 1.50 | highRisk |
| `lasso` | Lasso | BAIT | V1 | 56 | 85/15 | 1.40 | debuff |
| `eyeroll` | Unimpressed | BAIT | V1 | 40 | 100/0 | 1.10 | counter |
| `losingit` | Losing It | BAIT | V3 | 50 | 80/20 | 1.40 | — |
| `noodle` | Noodle Legs | BAIT | V3 | 52 | 10/90 | 1.45 | persist |
| `freeze` | Freeze Frame | BAIT | V3 | 55 | 60/40 | 1.35 | — |
| `clog` | Giant Clog | BAIT | V1 | 60 | 80/20 | 1.50 | — |
| `doubletake` | Double Take | BAIT | V3 | 48 | 100/0 | 1.30 | read |
| `buckle` | Knee Buckle | BAIT | V3 | 52 | 10/90 | 1.40 | — |

**Starting kit:** `sixseven`, `aurawalk`, `sideeye`. Every other move is
unlocked by beating the opponent that drops it (§10).

### Physical descriptions that are already sourced

`AURA-BIBLE.md` §2 carries real joint angles for these — **use them, do not
invent over them**: `sixseven` (§2.1), `mewing` (§2.2), `boat` (§2.3),
`aurawalk` (§2.4), `sigma` (§2.5), `collapse` (§2.6), `lasso` (§2.7),
`sideeye` (§2.9), `eyeroll` (§2.10).

`swirl` is described by AFP as *swirling the hands, then swinging the arms back
and forth* — the cleanest movement description in the whole corpus.
`grimace` is *a final, decisive grimace* that ends the battle: pure face, zero body.

---

## 10. CONTENT — 5 ACTS, 25 OPPONENTS

Beat an opponent → learn their move. **9 rounds per battle** (Addendum A8:
no standard exists; this is our design choice).

| Act | id | Setting | Scoring | Flags |
|---|---|---|---|---|
| 1 | `plaza` | Local square, Tuesday evening | crowd | — |
| 2 | `bracket` | Municipal park, 200 entrants | crowd | repeats punished |
| 3 | `banned` | Empty lot, headlights only | judges | — |
| 4 | `capital` | Palace esplanade | both | fit matters most |
| 5 | `upriver` | The prow of a racing boat | judges | `unstable: true` |

| Act | Opponent | Skill | Quirk | Pool | Drops |
|---|---|---|---|---|---|
| plaza | Chispa | 0.30 | — | 2 | `headnod` |
| plaza | Tía Beti | 0.38 | — | 3 | `shadowstep` |
| plaza | Nena Vox | 0.44 | frontrunner | 3 | `losingit` |
| plaza | Rulo | 0.48 | — | 3 | `eyeroll` |
| plaza | **El Portero** | 0.58 | punisher | 4 | `sigma` |
| bracket | Uvi | 0.62 | — | 4 | `shoulder` |
| bracket | Maikito | 0.68 | — | 3 | `collapse` |
| bracket | La Gemela | 0.74 | mirror | 3 | `ripple` |
| bracket | Tacho | 0.78 | — | 3 | `buckle` |
| bracket | **Doña Feffer** | 0.86 | patient | 5 | `crowdturn` |
| banned | La Farola | 0.78 | — | 3 | `shades` |
| banned | La Silenciosa | 0.84 | punisher | 3 | `stillwater` |
| banned | Nudo | 0.88 | — | 3 | `slowturn` |
| banned | La Regla | 0.94 | — | 4 | `heeldrag` |
| banned | **El Alcalde** | 1.04 | frontrunner | 5 | `mewing` |
| capital | El Zapato | 0.88 | — | 3 | `lasso` |
| capital | Condesa | 0.92 | — | 4 | `freeze` |
| capital | Revés | 0.96 | mirror | 4 | `noodle` |
| capital | El Payaso | 1.00 | — | 4 | `clog` |
| capital | **La Explanada** | 1.12 | patient | 6 | `doubletake` |
| upriver | The Rower | 1.16 | — | 3 | `swirl` |
| upriver | The Current | 1.24 | punisher | 3 | `spin` |
| upriver | The Bow | 1.32 | — | 3 | `grimace` |
| upriver | Downstream | 1.38 | frontrunner | 3 | `boat` |
| upriver | **Togak Luan** | 1.50 | mirror | 7 | — |

Bold = act boss. Roster reads **9 female / 6 male / 10 neutral** — deliberate,
see HANDOFF open question #4. Do not skew it back.

### Fits — chosen before the fight

| id | Fit | Crowd | Judges |
|---|---|---|---|
| `clogs` | Loud clogs | +8 | +0 |
| `black` | All black | +0 | +6 |
| `headcloth` | Headcloth & shades | +4 | +4 |
| `frog` | Frog suit | +10 | -3 |
| `uniform` | School uniform | +0 | +0 |

Both the frog suit and the giant clog are **documented** — real competitors
turned up dressed as a frog and battled with a giant rubber clog.

---

## 11. DOM CONTRACT — ids come from the shipped `index.html`

The UI must drive exactly these. Do not rename; do not invent siblings.

```
#top #crowd #meterFill #mcbar #roundLabel #foeLabel
#arena  .floor  #you #them  (each has .aura, .callout, .movename, .statusrow)
        #calloutYou #calloutThem #nameYou #nameThem #statusYou #statusThem
#deck   #prompt #grid #hypeFill #blendBtn
#timing #timingTitle #track #zoneOuter #zoneCore #needle
        #ampFill #ampIdeal #timingHint #holdpad
#fit    #fitGrid #fitGo
#result #resultTitle #resultUnlock #resultLog #againBtn
#map    #mapSub #actList
#title  #startBtn #howBtn
```

Turn state is `<body data-state>`: `ready` → `timing` → `resolving` → `over`.
`.screen` toggles with class `on`.

**Touch targets are 48px minimum, measured as rendered px at 375×667.**
That is a hard rule in this repo and it is measured, not eyeballed.

---

## 12. VOICE

Score popups use the culture's own language, never invented units:

```
+1000 AURA     the standard callout
+10.000        the big one
AURA 100%      a clean read
PERDIÓ AURA    a whiff
AURA INFINITA  a flawless win  (the literal prize in Argentina)
```

**Do not use ballroom vocabulary.** Not "tens across the board", not "chop", not
"realness", not "houses". Multiple outlets compare these battles to voguing, so
the parallel is theirs — but ballroom is Black and Latino LGBTQ+ culture with a
specific history and its own word, *noguing*, for exactly this kind of
uninformed borrowing. Study the architecture, ship our own words.

---

## 13. PALETTE — LOCKED

```css
--ground: #1A0B2E;   --deep: #2B1450;   --you: #FF2E88;
--them:   #00E5D4;   --lamp: #FFB627;   --bone: #FDF6EC;
```

Plaza at dusk under sodium streetlights, lit by phone flashes.
**Not neon-cyberpunk** — that is the default and it is wrong for this.
Daylight fading over concrete.

Fighters are glowing silhouettes on a flat colour field. Every fighter must be
identifiable in pure black at 64px.

---

## 14. BALANCE TARGETS

The inherited table below described code we no longer have. **It is a target,
not a measurement.** `test/balance-sim.js` produces the real numbers and the
real numbers get written into `README.md`, honestly, whatever they are.

| Act | masher | varied | composed | expert |
|---|---|---|---|---|
| The Plaza | 4% | 76% | 88% | 99% |
| The Park Bracket | 3% | 65% | 80% | 98% |
| The Banned Town | 0% | 33% | 62% | 88% |
| The Capital | 0% | 40% | 65% | 88% |
| Upriver | 0% | 30% | 49% | 75% |

Four player policies the sim must model:
- **masher** — spams one strong move, random timing
- **varied** — never repeats within 3, random timing
- **composed** — never repeats, holds near `idealAmp`
- **expert** — plays the matchup triangle, near-perfect timing and amplitude

**A masher losing everywhere is correct, not a bug.** The freshness rule models
the verified win condition — competitors are documented as needing to reference
as many different memes as possible — so repeating yourself has to lose.

---

## 15. THE THESIS — WHAT THIS GAME IS ABOUT

The winner of the real Bellas Artes battle was a 16-year-old who took 3,000
pesos. Asked why he does it, he said that more than for the prize, he does it to
have a good time and take his mind off things at home.

That's the game. Not getting famous. Not beating everyone. A kid who has
somewhere to go on a Tuesday, in a public square that belongs to teenagers for
twenty minutes.

The crowd is not set dressing — the gathering *is* the point. Every environment
is a public square, never a stage. The ending is about the room, not the ranking.

And Act 5 is a reveal, not just a difficulty spike: the player learns the whole
thing started on a 40-metre canoe in Sumatra, where a child's literal job is
generating aura for sixty rowers, and the only real skill is composure on
unstable ground.

**Build the memes to get attention. Build the river to be remembered.**
