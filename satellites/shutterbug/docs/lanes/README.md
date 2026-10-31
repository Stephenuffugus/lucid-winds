# The 31 Oct build lanes (the workflow scripts, kept for the next session)

These are the Workflow scripts the lead ran on 31 Oct 2026. They are kept here because a session's own copies live under ~/.claude and do not travel with the repo. Each one is a plain Workflow script: build, review, fix, with the box's rules written into CONTEXT and RULES.

- `stick-levels-lane-oct31.js`: the thumbstick (DONE and LIVE in sb-m1-3), then the levels rule (NOT BUILT; it was stopped to save usage). To build the levels rule, reuse CONTEXT, RULES, LEVELS_BRIEF and the levels item. Before running it, point WHERE at a fresh worktree branched from add-sproing-jumper (the stick is already merged), and drop the stick item.
- `weapons-lane-oct31.js`: the weapons spec (docs/WEAPONS-V1.md on sb-weapons, merged) and step 1 (DONE and LIVE). Steps 2 to 4 (the swap card and J2 to J8, the dive weapons, the charms) come from the spec's step list. Run them on a fresh branch from add-sproing-jumper.
- `astra-art-lane-oct31.js`: Astra's in room art (DONE and LIVE; its review was skipped).

The box's rules that every lane needs:
- One browser at a time: `flock /home/codespace/sb-drafts/browser.lock <command>`.
- Long runs go detached.
- `/usr/bin/grep`, not the shell function.
- Commit and push after every step.
- The box stops 12 hours after boot.

## The 31 Oct night lanes (started 21:30 UTC by the lead, after Stephen restarted the box and said "keep building shutterbug")

- `levels-lane-oct31-night.js` (workflow wf_0e39b077-34e): the levels rule, his "floor becomes the ledge" ruling, on branch `sb-levels` in /workspaces/sb-levels (from add-sproing-jumper b1ab7b002). Build, one review (code, corpus, the crop screen), fix. QUESTIONS Q180 to Q199.
- `weapons2-art-lane-oct31-night.js` (workflow wf_e6dd0515-5c2): ART2 (Astra's fx, weapon icons and the hero's extra poses through the cutter) then weapons step 2 (J2 to J8 and the swap card, spec 13.2), on branch `sb-weapons-2` in /workspaces/sb-w2 (from b1ab7b002). Two reviews (code, player) over ART2, step 2 and the never reviewed step 1, then one fix. QUESTIONS Q122 to Q139 (weapons) and Q161 to Q179 (art).
- To rerun one after a box stop: fix any commit the script names, then run it with the Workflow tool (resume works only inside the session that started it). Weapons steps 3 and 4 have no lane yet: write it from the weapons2 script with the spec's sections 13.3 and 13.4.
