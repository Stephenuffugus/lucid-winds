# Usage: python3 -I records.py <deploy sha> <branch sha>
import io, sys
dep, br = sys.argv[1], sys.argv[2]
p='/workspaces/lucid-winds/plans/super-slice-3d/BUILD-PLAN-OCT23.md'
s=io.open(p,encoding='utf-8').read()
anchor="\n---\n\n## 1. What Stephen asked for, verbatim"
entry=f'''- 2026-10-24 (Opus): **PART E4 LIVE as v6.8** (deploy `{dep}` on main, from add-sproing-jumper `{br}`). PART E IS DONE.
  Proven live on both origins (BUILD v6.8, worker `sw.js?v=72`, cache `slice3d-v74`, card `?v=20261024d`); the profiles that
  held v6.7 now run v6.8. Suite green (row [21]: 17 checks); `fix/fwrun_e4.js` 28 groups, each red on its check. Review: two
  lenses (the chamber, the tests), a skeptic per finding; folded in before the ship. Built and laws:
  - SS04 bosses at levels 5, 10 ... 40 (finite Freefall). A chamber of BOSS_H 36 u BELOW the old floor: the shaft above
    uses `segDepth`, so its pieces, rng() draws and Clean Slice line are the very same (the chamber's ledges draw their own
    stream). DEVIATION from the plan's "two bumpers that lob": a NET across the chamber lobs every landing (no knife falls
    past the boss to the floor before the fight is decided); the lob is AIMED at the boss's lane (vx solved against the
    drag: (tx-x)*ln2/(1-0.5^T)). Contact only while falling; a hit bites (vx*0.25, w*0.3) and the boss hops ONE lane (middle,
    a side, the middle); a handle pops (vy 9) toward the middle from a side lane; three lobs without a hit and the net gives
    way; a hit resets the count; 600 once at the third hit (multiplied by the landing like every in dive reward).
  - ⛔ The ropes: cut only by a knife IN the fight (a lob or hit first), RISING, and never the rope on the boss's side while
    it sits in a side lane (the review: a tap toward the boss's new lane carried the knife into its rope, 35 of 40 played
    fights skipped; a hit leaves the knife falling beside the rope). A skipped boss (rope or give way) is out of the fight
    and forfeits Clean Slice. ⛔ The pop toward a wall juggled a knife for ever between a side lane boss and the padded wall.
  - Padding: `y<bw.y+14+KR` (the old floor's catch line; at +12 the chamber's top 2 u killed). No art: the code boss,
    with its crack; the reveal never fades a mapless sprite (it flashed a white square).
  - Measured (node, the real step; tools/slice-3d-tests/e4): left alone 48 of 48 levels clear; taps of 0.1 s or less after
    each lob clear every fight; a player holding 0.15 s or more toward the boss on EVERY lob overshoots every time (the give
    way ends it); correcting only when a lob would miss clears 200 of 200. No deaths in the chamber; no fight never ends
    (4,176 constructed juggles, 440 played). HIS CALLS: that feel; the x10 bullseye after a win (the third hit is always in
    the middle lane; the skeptic refuted it as a defect: about 10 percent more score when the player aims anyway); whether
    the give way should forfeit Clean Slice (the plan names only the rope; the boss is optional in its definition).
'''
assert s.count(anchor)==1
s=s.replace(anchor, "\n"+entry.rstrip('\n')+anchor,1)
io.open(p,'w',encoding='utf-8').write(s); print('plan ok')
q='/workspaces/lucid-winds/START-HERE.md'
t=io.open(q,encoding='utf-8').read()
board=f'''**🔪 24 Oct (Opus) SUPER SLICE 3D PART E4 LIVE = v6.8: THE BOSSES. PART E IS DONE** (deploy `{dep}`). Each world's last dive (levels 5, 10 ... 40) now ends at its boss, in a chamber below where the floor used to be (the shaft above is the very same dive). Fall onto it blade first for a hit; it hops one lane over and the net under it lobs you back onto it; three hits and it opens (Astra's three stages, a drawn crack after the first), then the net drops and you go on to the floor. A handle bounces off it. Miss three lobs and the net gives way; cut a rope (with the boss in the middle) to skip it; either skip costs the Clean Slice. A review found real faults, all fixed before the ship (the worst: a tap toward the boss after it hopped carried the knife into a rope and skipped the fight). See the morning report below for your calls on the feel.

'''
key='**🔪 24 Oct (Opus) SUPER SLICE 3D PART E3 LIVE = v6.7**'
assert t.count(key)==1
t=t.replace(key, board+key,1)
io.open(q,'w',encoding='utf-8').write(t); print('board ok')
