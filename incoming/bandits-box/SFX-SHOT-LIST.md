# BANDIT'S BOX — FOLEY SHOT LIST (for Stephen)

The engine already prefers real recordings: `feel()` checks `SAMPLES[name]`
before falling back to synth, per voice name. So shipping foley is exactly
this: record the sounds below, drop them in `sfx/`, list the filenames in
`SFX_MANIFEST` under these exact names. Nothing else changes; the synth stays
as the offline/missing-file fallback. Random pick per hit + pitch/gain jitter
are applied automatically, which is why ~10 takes per sound matters — repeats
never sound identical.

## Recording spec (applies to everything)

- WAV, 48 kHz, mono, 16 or 24 bit. Close mic (10-20 cm), quietest room you
  have, phone-on-a-pillow is fine if the noise floor is low.
- ~10 takes per sound, varying force/speed naturally. Keep the best 6-10.
- Trim TIGHT: hits under ~400 ms, no silence at the head (attack lands on
  sample 0), short natural tail. Normalize peaks to about −6 dBFS.
- Filenames: `<name>-01.wav`, `<name>-02.wav`, … matching the voice names
  below exactly.

## The 20 one-shot voices, ranked by how much a real recording gains

**Tier 1 — record these first (the app's signature touches):**

| name | what it is in-app | what to record |
|---|---|---|
| `pop` | pop-it bubble press | actual bubble wrap pops; or wet finger-in-cheek pops for the rounder ones |
| `unpop` | pressing a popped bubble back up | bubble wrap pushed back from the far side (softer, duller than pop) |
| `crinkle` | tissues, wrappers | tissue paper + a chip bag, slow and fast handfuls |
| `snap` | chocolate bar snap | real chocolate bars, three thicknesses (the toy has three flavours with different timbres — thin/medium/thick bar) |
| `rip` | PeriPeri package strip | cardboard box-tab rips + velcro at two speeds |
| `latch` | latches locking | real latches, jar clasps, seatbelt buckle |
| `click`* | switch wall | mechanical keyboard switches + light switches (*add to manifest if the wall uses tap/latch today — Opus will confirm the wall's voice name and alias it) |
| `tap` | general finger taps | fingernail + fingertip on wood, plastic, glass |

**Tier 2 — big wins, easy takes:**

| name | record |
|---|---|
| `peel` | stickers and masking tape peeled slow/fast |
| `plink` | water drops into a mug; marble dropped on a plate |
| `squeak` | rubber duck, sneaker on floor, balloon rub |
| `squish` | wet sponge, slime, dough kneads |
| `thunk` | knuckle on hollow wood, cabinet door closing softly |
| `bell` | any small bell, glass tapped with a spoon |
| `zip` | zippers, three speeds |
| `hinge` | a door hinge, slow creaks |

**Tier 3 — synth already does these well, record only if fun:**
`grain` (sand pour), `rib` (finger across a comb), `boing` (jaw harp or a
ruler on a desk edge), `screech`, `airout` (air puffed from a squeeze bottle).

## Friction texture beds (the bigger prize, phase F in the build plan)

The continuous friction sound is currently synthesized noise. The upgrade is
PAIRED seamless loops per texture — one recorded stroking SLOW and LIGHT, one
FAST and HARD — which the engine crossfades by finger speed/pressure:

- fur/plush (the raccoon) — corduroy or a plush toy stroked
- ribbed plastic (textures toy) — comb or ribbed bottle
- sand (sand tray) — hand dragged through dry rice or sand
- sequin fabric (sequins toy) — real reversible sequin pillow
- slime (slime toy) — wet hands + dish soap

Spec: 4-8 s loops, seamless (record 10 s, we crossfade the seam in software),
same mic distance for both of a pair. This needs an engine change
(`FrictionSampled`), so record whenever — the one-shots above ship first.

## Surprise gags (optional, pure joy)

The every-~100th-pop surprises are synth sketches: door chime, small dog,
duck, cuckoo, party horn, frog, coins spilling, tiny fanfare. Any real
recording replaces its sketch (a real dog beats a sawtooth forever). Around
the house counts. If Penny wants to record a surprise, a human "ta-da!" is
allowed to be one of them.
