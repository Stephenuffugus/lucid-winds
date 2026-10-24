# Usage: python3 -I records.py <deploy sha> <branch sha>
import io, sys
dep, br = sys.argv[1], sys.argv[2]
p='/workspaces/lucid-winds/plans/super-slice-3d/BUILD-PLAN-OCT23.md'
s=io.open(p,encoding='utf-8').read()
anchor="\n---\n\n## 1. What Stephen asked for, verbatim"
entry=f'''- 2026-10-24 (Opus): **PART E3 LIVE as v6.7** (deploy `{dep}` on main, from add-sproing-jumper `{br}`). Proven live
  on both origins (BUILD v6.7, worker `sw.js?v=71`, cache `slice3d-v73`, card `?v=20261024c`); the profiles that held v6.6
  now run v6.7. Suite 183 of 183 on E3, then rows 1, 19 and 20 after the residuals; `fix/fwrun_e3.js` 23 groups, each red on
  its check. Review: two lenses (the Daily, the tests), a skeptic per finding: 7 confirmed, all folded in. Built and laws:
  - SS08 the Daily: `dailySpec(t)` (FNV of `day:g1:p1`, day = the UTC date; level 5+((n*13)%31) in the day's world);
    `s3d_daily` {{day, gen, used, done, score}}, `okDly` checks every field's type. Bump DAILY_GEN when the shaft builder
    changes what a seed builds, DAILY_PHYS when the fall changes. One SCORED dive, spent on its first simulation tick
    (never by opening the card); PRACTICE scores nothing; `newDaily` re-reads the disk before a scored dive (another tab);
    `saveDaily` merges (used and done ORed, score the max); the result is filed under `G.dailyDay` (the day it began).
  - ⛔ A Daily moves NEITHER level. The review's HIGH: E3 first wrote `if(ff&&!G.daily){{...ffLevel}} else {{...level}}`, so
    every Daily landing fell into the JOURNEY branch. Adding `&&!X` to an `if` that has an `else` hands X to the else.
  - Found, not fixed: two tabs that BOTH tap Scored before either's first tick both get a scored dive (the first tick write
    is not a compare and set; needs two tabs inside about a second). Results are personal: a shared day board needs a server.
  - Also shipped here, the E2 review's residual: the wasp entry window reaches 8.5 (a piece sits 8.5 to 13.5 under a wasp;
    16 stacks in 17,200 dives leave a line, 0 of the 228 proven dives change; 45.400 pinned).
'''
assert s.count(anchor)==1
s=s.replace(anchor, "\n"+entry.rstrip('\n')+anchor,1)
io.open(p,'w',encoding='utf-8').write(s); print('plan ok')
q='/workspaces/lucid-winds/START-HERE.md'
t=io.open(q,encoding='utf-8').read()
board=f'''**🔪 24 Oct (Opus) SUPER SLICE 3D PART E3 LIVE = v6.7** (deploy `{dep}`). **The Daily:** a Daily button on the title opens today's dive, the same dive on every phone in the world (seeded by the date in UTC). One scored try, used up the moment it starts (opening the card costs nothing), practice as often as you like (it scores nothing), and a countdown to the next day. Reach the floor on the scored try for "Daily done" and the Daily badge. A Daily never moves your Journey or Freefall level. A review found 7 things, all fixed before the ship (the worst: a Daily landing pushed the Journey level up to the Daily's level). **Yours:** a shared board for the day (everyone's score) needs a server; say if you want one. Phones: close the tab once.

'''
key='**🔪 24 Oct (Opus) SUPER SLICE 3D PART E2 LIVE = v6.6**'
assert t.count(key)==1
t=t.replace(key, board+key,1)
io.open(q,'w',encoding='utf-8').write(t); print('board ok')
