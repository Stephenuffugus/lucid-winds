# Ring Stacker (Stephen 7/17 — the tetris he saw)

**The ask:** "your piece would come down and youre trying to build square rings around the center little square. if you slam the piece down it causes the center to rotate and if you set it down it doesnt rotate. when you complete a ring it gets erased and everything collapses."

## The design
- Board: a square grid (say 15x15) with a 1-cell CORE in the center. Gravity pulls INWARD toward the core (pieces fall from any edge toward the middle — or simpler faithful reading: pieces fall top-down onto a structure built around the core).
- Faithful reading of what he described: standard top-down falling tetrominoes, but the goal is completing concentric SQUARE RINGS around the core instead of rows. Ring 1 = the 8 cells around the core, ring 2 = the 16 cells around that, etc.
- **The twist he loved:** SLAM (hard drop) rotates the whole center structure 90 degrees as the piece lands; SOFT drop doesn't. Rotation is the strategic tool — you slam to spin a gap around to where the next piece can fill it, at the cost of scrambling your aim.
- Complete a ring → it erases with a pulse and everything OUTSIDE collapses inward one ring. Chain collapses = combos.
- Modes: Journey (ring quotas per level, speed ramps), Daily seed, Zen.
- Very buildable with our standard deterministic engine + machine proofs (bot: greedy surface-fitting with slam heuristic).

## Call for Stephen
Name + whether gravity is top-down (simpler, probably what he saw) or inward-from-all-edges (wilder, harder to read). Recommend top-down v1.
