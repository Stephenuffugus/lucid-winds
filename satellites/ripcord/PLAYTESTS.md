# Ripcord playtests (the Director's own words, dated)

## 2026-09-02, Stephen, first notes (before playing the 3D battle toggle)

> "ripcord gives me no idea of what any of the different pieces are doing. we need a stats
> section that's open and as you flip through the pieces you can see how it will affect your
> stats. the music menu on people games needs to be movable and minimizable too. i see that i
> can see the pieces in the menu in 3D but can i watch them duel in 3D, that's the next step to
> doing it in VR. this might end up being our third game listed if we do it right."

Three asks:
1. **A stats panel that stays open while you flip through pieces**, showing the delta each
   piece makes to your build (attack, defence, speed, whatever the round machine reads) BEFORE
   you commit it. Today the piece card shows the piece, not what it does to you.
2. **The music chip (the fleet one) must be movable and minimisable** on the games where it
   sits over play. Fleet wide fix, not Ripcord only: /music-unlocks.js.
3. **Watch the duel in 3D.** This EXISTS behind Settings (the gear) → "3D battle (beta)"; he
   has not found it. Surface it: a "Watch in 3D" button on the battle screen itself, not a
   settings toggle. VR is the step after (docs/VR-PILOT.md).

Stakes: he sees Ripcord as a possible third store listing.

### Answered the same night (Fable, 2026-09-02, build on branch)

- **Stats while flipping.** Every part chip now carries the two biggest changes it would make
  (▲smash ▼spin), computed from the real build, and the stats panel is bigger and colour coded.
- **Weights that look tappable.** The dial is 224 px instead of 158, every empty hole is a solid
  ring with a + in it, and a line under the dial says what tapping does (chip, slug, brick, off).
- **Skipping back to the start.** Every pick rebuilt every rail, which reset their scroll. Rails
  and the sheet keep their place across a pick now.
- **Could not scroll Tuning or Looks.** Not the sheet: the fleet music card sat over the bottom
  third and ate the gesture. The card is now a floating panel: drag by the handle, tap the
  triangle or swipe down to fold it to a pill, folds itself after twelve idle seconds. Fleet wide.
- **Combos.** Sixteen rigs already existed; the panel only listed ones you had made. It is a rig
  book now: every rig with its recipe and state. Adding one is one entry in src/rigs.js.
- **Watch in 3D.** A 3D button on the launch dock, same switch as Settings.
- Not done: the rig book only opens at rung 4 (teaching gate, untouched); the boss test reports
  The Post as beatable by defence 78 percent of the time, which predates this pass.
