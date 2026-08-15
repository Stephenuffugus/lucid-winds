# Critter Games Plan (Stephen + Jesse workshop, 2026-08-15)

## Shipped
- **Berry Picnic** — catch falling berries, quittable, half-size critter.
- **Snack Toss** — flick snacks from the bottom into the critter's mouth at
  the back of the meadow. 12 snacks, launch from under the finger, sideways
  drift steers, streak of 3 = golden snack worth 3. Physics tuned so a full
  flick hits and a weak one falls short.
- **Critter Parade** (nursery 🎪) — up to 6 of YOUR critters march and dance
  across the meadow to the dance groove. Local-only by design (privacy: no
  uploads, ever).
- **Critter Pal rail** (`/satellites/critter-pal.js` + portal broadcast) —
  any studio game can summon the newest critter as a cheering corner pal.
  Same-origin games: include the script, call `CritterPal.mount()`. Cross-
  origin games (Skitterlings, Tally): the PORTAL posts
  `{sws:'critterPal', pal:{name,drawing}}` after the game's sws:ready —
  zero network, zero Firestore, one postMessage. Proof mount: Burrow Bowl.

## Next (agreed direction)
1. **Critter in Skitterlings** — Skitterlings already listens to portal
   messages (source:'skitterlings' protocol); add a critterPal listener
   upstream and use the drawing as the hopper's face/skin. Upstream repo
   work (Stephenuffugus/skitterlings).
2. **Critter Hurdles** — side-run jumper reusing the bone machine's walk
   gait; tap to hop logs/puddles. Could BE the Skitterlings integration
   (their runner + our critter) rather than a new game.
3. **Critter Says** — Simon-says lifting the sequence engine from the
   portal's Echo (`games/simon.js`). Stephen's music note: player picks a
   scale or chord (pentatonic / major / minor arpeggio) and sequence tones
   are drawn from it, so every pattern sounds cohesive and pleasant.
4. **Bubble Bath** — bubbles drift up, critter bounces to pop them.
5. **Hide and Seek** — needs VERY detailed spaces (Stephen). Art-pipeline
   dependency: painted scene sheets (bedroom/garden/meadow) with tap-spots;
   crosses with the MJ art pack pipeline. Write the art request when the
   scene list is decided.

## Efficiency rules (Stephen's constraints, keep)
- Critter data NEVER leaves the device: localStorage is the store, the
  portal postMessage is the only transport. No Firestore documents.
- The pal renders the 2D drawing (one img), not a 3D build — cheap in any
  game. 3D stays in the critter app.
