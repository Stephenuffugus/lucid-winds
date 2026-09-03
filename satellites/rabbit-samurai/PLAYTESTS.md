# Rabbit Ronin playtests (the Director's own words, dated)

## 2026-09-02, Stephen

> "i also really want to add the dash attack to rabbit ronin too."

What exists today: an AIR DASH as movement only. `dashUnlocked()` (line 246) gates it on six
clears; the input at line 673 sets `G.dashT=0.16`, `G.vx=facing*560`, plays `sfx('dash')`
and a burst. It moves the rabbit; it does not hit anything.

The ask: a dash ATTACK. Open design questions for him, to answer before it is built:
1. Is the dash itself the attack (anything the rabbit passes through during `dashT` takes the
   hit), or a separate move (dash, then a slash at the end of it)?
2. Does it stay gated on six clears, or is it there from the first run?
3. Does a dash that connects refund the dash (chain kills), or is it one per airtime as now?

Then a tuning brief with the rest of the new-game notes.

### Built (Fable, 2026-09-03): the dash attack

A **DASH** button beside JUMP (keys K, X or F), once the first six dojos are cleared. The
dash is the blade: for 0.18 s the ronin slices whatever it passes through, on the ground or
in the air, from a run or straight off the vine. JUMP in the air still dashes, as taught.
Cooldown 1.4 s, drawn as a gold arc filling round the button. **The criteria that waives
it is a kill:** a dash that connects cools instantly, so a line of enemies is a chain, and
every chained kill scores base times the chain (x2, x3 shows over the button). Slicing a
lob mid dash cuts the cooldown to half a second. A dash kill freezes the frame for a beat
and shakes the screen; the dash leaves a trail of ghosts and two slash lines. Help screen
has a row for it. Proven headless: ground dash fires with cooldown, dash into a hedgehog
kills it, cools the dash and starts the chain.

The three questions answered by the build: the dash itself is the hit; still gated on six
clears; a connecting dash refunds itself. Change any of these in doDash / dashKill.
