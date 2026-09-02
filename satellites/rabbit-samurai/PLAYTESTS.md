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
