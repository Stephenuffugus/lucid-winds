# HANDOFF MARROWDEEP. Written Sep 08 2026 by Fable. The entry point for the build.

Stephen's design, `assets/MARROWDEEP_DESIGN_SPEC.md` (744 lines), came in on the morning of Sep 08 with "i want this
game built today." Nothing of Marrowdeep existed in any repo, branch or memory; the previous codespace stopped before
anything was saved. This file is the map; the plan is `plans/marrowdeep/HANDOFF-MARROWDEEP.md`; the prompt to paste
is section 3 below.

## 1. What was done today before the build (so the builder decides nothing)

| File | What it is |
|---|---|
| `plans/marrowdeep/RULES.md` | The rules of play, complete. Every rule the spec left undefined is DECIDED (Armor, where boss Strikes land, Strain at Depth I, Toll's stat, Relay bodies, replacement mid quest, the drop screen, Legacies, the offer) and every spec error is CORRECTED with the arithmetic (two cells of the master table, one floor row, Lanternborn, the Retire converter, three names with dashes). Rule ids are what gates cite. |
| `plans/marrowdeep/proto/engine.js`, `sim.mjs`, `PROTO-REPORT.md` | The prototype engine (the spec's build step 1 through 9, headless) and the balance harness of spec section 15, built from RULES, verified three ways, with BASE_TOUGHNESS, STRIKE_TARGET and RESPITE tuned against the spec's death and income targets. P0 pastes the engine into the page. |
| `plans/marrowdeep/data/*.json` | The content the spec's section 16 said was not yet written: challenge text, six bosses, twenty four Traits, twenty uniques, name banks, relic word lists, every blurb and card line; verified against the copy law and the effect vocabulary. |
| `plans/marrowdeep/AUDIT.md` | Five auditors (math, engine, economy, screens, fleet laws) and a refuter per finding; what survived and what was done with it. |
| `plans/marrowdeep/ART-PACK-MARROWDEEP.md` | Stephen's sheets (a Doc in 012Assets, "newest request again"). The game draws everything itself; art is an upgrade. |
| `plans/marrowdeep/HANDOFF-MARROWDEEP.md` | The plan: fence, inheritance with verified paths, corrections, architecture, four phases with gates, screens, art, listing, pitfalls, decision rights, sizing, protocol, morning report. |

## 2. The order for the day and the night

P0 (engine in the page, five gates, about 1.5 h) -> P1 (a whole Depth I quest by taps and the seam gate, about 4 h)
-> P2 (the account: Roster, Character, the Hall's shelves, death and the wall, the save gate, about 4 h) -> P3
(Depths II to V, Sigils, the ear gate, the shell, shots, thumb, about 4 h). About fourteen hours for one Opus on two
cores. P0 through P2 is "built today"; P3 is the night. Fable reviews in the morning (fence diff, gates alone, one gate
broken on purpose, real play at 412, 375 and 320, the thumb to `portal-assets/thumbs/`, the portal row from plan
section 8, deploy with a live marker, the CI list).

## 3. THE PROMPT (paste as is into a fresh Opus session; paste the same prompt again after every session end or codespace restart, it resumes itself)

```
You are Claude Opus, building MARROWDEEP, a new game for Sky Wolf Studio, in the lucid-winds repo at
/workspaces/lucid-winds on branch add-sproing-jumper, unattended, for as long as this run lasts. The
Director is Stephen; he reads your work when he is back and he wants this game built today. Fable
(another Claude) wrote your plan, the rules, the prototype engine and the content, reviews what you
produce against the plan, and deploys. You build. One builder, this box, two cores; slow is fine,
stopping is not.

THIS RUN MAY BE INTERRUPTED. Your session ends when its context ends, and the codespace may be closed
and reopened during the run. The same prompt starts the next session. Nothing survives those breaks
except what is committed AND pushed, so you commit and push the moment something is green, never at
the end of a phase only.

FIRST, whether this is the first session or a resumed one:
1. git pull --rebase --autostash origin add-sproing-jumper
2. df -h / must show at least 2 GB free. If it does not: delete satellites/*/docs/shots/*.png that no
   ledger or morning report references, run npm cache clean --force, delete nothing under
   ~/.cache/puppeteer and nothing under assets/, then check again.
3. ls ~/.cache/puppeteer/chrome must list a version; if it is empty, run
   npx puppeteer browsers install chrome from /workspaces/lucid-winds.
4. Start the static server if nothing answers on it:
   (python3 -m http.server 8777 --bind 127.0.0.1 >/dev/null 2>&1 &)
5. Read /workspaces/lucid-winds/plans/marrowdeep/HANDOFF-MARROWDEEP.md whole. Sections 0, 4, 5, 9 and
   14 bind you. Then /workspaces/lucid-winds/plans/marrowdeep/RULES.md whole: the engine is built from
   RULES, not from the spec, and every gate cites a rule id. Then
   /workspaces/lucid-winds/plans/marrowdeep/proto/PROTO-REPORT.md, so you know what the engine you are
   about to paste in has already proved. Read /workspaces/lucid-winds/CLAUDE.md, the sections LOOKING IS
   PART OF THE JOB and WHAT THE DIRECTOR EXPECTS. Read /workspaces/lucid-winds/satellites/fathom/index.html
   lines 1 to 260 and its tools/check.js, tools/lint.mjs, test/harness.mjs and sw.js, because the plan's
   section 2 tells you to copy them. Skim assets/MARROWDEEP_DESIGN_SPEC.md sections 1, 7, 12 and 13 for
   the voice; where it and RULES disagree, RULES wins.
6. Find your place: the plan's SESSION STATE. If it names a next action, start there; if it says
   nothing has been built, start at P0 step 1.

THE FENCE. satellites/marrowdeep/** and plans/marrowdeep/HANDOFF-MARROWDEEP.md. Nothing else. git add
only those paths, never -A. git pull --rebase --autostash origin add-sproing-jumper before the first
edit and before every push. Never push to main. Never edit another satellite, portal/index.html,
scripts/, music-unlocks.js, any other game's sw.js, RULES.md, proto/, data/ (copy from them, never
into them). A rebase conflict outside your fence is resolved by taking theirs.

THE ORDER. P0, P1, P2, P3, each to its gates, in the plan's section 5. A phase is done when
tools/check.js prints ALL GATES PASSED, every new gate has been watched to fail once, the screenshots
have been opened with the Read tool and described with three faults each, the ledger (section 13)
holds pasted command output, and the work is committed and pushed. Write DONE P<n> or BLOCKED <gate> in
SESSION STATE as each phase ends. Do not stop after a phase to wait for anyone. When P3 is done, write
the morning report at the top of section 15 and stop.

THE OVERNIGHT PROTOCOL. Never wait on a human. An ambiguity is the smallest reasonable choice, logged
in satellites/marrowdeep/docs/DECISIONS.md with one line of why; the rulings in RULES.md are not
ambiguities and are implemented as written. A gate still red after three honest attempts is written
into SESSION STATE as BLOCKED with its last thirty lines of output, and you move on; you never weaken,
skip or delete a gate to pass it. Two cores: gates one at a time, every browser gate as
timeout 2700 flock -w 1800 /tmp/sws-gate.lock node <cmd>; a browser gate that fails inside the suite is
rerun alone, twice, and two passes alone is a pass. No helper agents for judgement calls; at most two,
only for reading or a mechanical sweep, never while a gate runs. When your context is running long:
finish the subsystem in hand, run its gates, commit, push, write SESSION STATE with the exact next
action (file, function, step number), write the morning report at the top of section 15, and stop.
Never start a subsystem you cannot finish and commit inside the context you have left.

THE FIRST THING YOU DO on a fresh plan after reading is P0 step 1: the page with the proto engine
pasted between the SIM markers and the seven data files inlined, then P0 step 2 and 3 (sim.js with
--table, --test, --data; tools/check.js with lint, table, test, data, boot), run them, paste the output
into the ledger, commit "marrowdeep P0: the engine in the page, five gates", push. Then P1.

TOOLS. Node 24. puppeteer at /workspaces/lucid-winds/node_modules with a cached Chrome; this game is
DOM and SVG, so headless needs only --no-sandbox --disable-gpu; never delete ~/.cache/puppeteer. The
static server is on 127.0.0.1:8777. Everything you may copy from the fleet is named, with line
numbers, in the plan's section 2; there is no Sunbeam SDK for satellites and nothing listens for the
earn message, so make no economy claims in copy.

LAWS. No dash of any kind in player copy, no exclamation point, commas. "Sky Wolf Studio", singular.
48 px rendered touch targets at 375 wide, proved by elementFromPoint, never by calling a handler.
Every import and asset carries ?v=<stamp>; var STAMP, every head ?v=, the music include, the service
worker registration and sw.js SHELL_VERSION are one string. Runtime modules are .js. Nothing between
the SIM markers touches document, window, Date or Math.random; the sim is the game and the seam gate
proves the page's answer equals the sim's for the same seed. The bottom left 120 by 120 of every
screen is empty for the fleet's music chip. A visual phase is not done until you have looked at the
screenshot and named three things wrong. Screenshots are evidence, under 200 KB each, never
regenerated just to regenerate them. Text 0.7 rem or larger. A count in a gate is a law, not today's
number. A fresh GainNode's gain is one; every voice sets its own, and the ear gate measures the peak.
```

## 4. What Fable does in the morning

1. `./workspace.sh`, then `git log --oneline -20` for the night's commits and the plan's SESSION STATE.
2. Fence diff: `git show --stat` of every commit touches only `satellites/marrowdeep` and the plan.
3. Gates alone, under the lock: `cd satellites/marrowdeep && timeout 2700 flock -w 1800 /tmp/sws-gate.lock node
   tools/check.js`. Then one gate broken on purpose and watched red.
4. Real play at 412x915, 375x667, 320x568 with real taps: a whole quest, one death, one retirement, the wall, two tabs.
   Open every shot in `docs/shots/`. Name three faults each before reading the builder's.
5. `docs/thumb.png` to `portal-assets/thumbs/marrowdeep.png`; the portal row from plan section 8 with the stamp in both
   `?v=`; `marrowdeep` into the TWELVE lists of `scripts/fleet/ci-twelve.mjs` and `sweep-twelve.mjs`.
6. Deploy: `git log HEAD..origin/main` empty, `git push origin add-sproing-jumper:main`, then
   `curl -s "https://lucidwinds.com/satellites/marrowdeep/?probe=$RANDOM" | grep -c "var STAMP = '<stamp>'"`.
7. His phone checklist, and his notes taken verbatim into the plan's SESSION STATE first, then sorted.
