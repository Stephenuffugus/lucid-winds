# HANDOFF — Aug 21 afternoon run (from Fable, for Opus)

Stephen is cleaning and doing other things. You have a few hours of autonomous
work. He will look at deliverables when he's done, not while you work. Finish
things; don't ask questions mid-run (⛔ no approval gates in autonomous runs).

## What happened this morning (context you need)
The **Jumping Jimothy store page was SUBMITTED to Valve for review** (~9:40am
Pacific). Full detail: memory `project_jimothy_steam_submitted_aug21`. Valve
takes 3-5 business days; approval starts a public 14-day Coming Soon clock;
release ~Sep 15. The submission unblocked two creative jobs that are now YOURS
for the afternoon, plus a stretch task. Everything Steam-side is DONE for now.

## ⛔⛔⛔ HARD RULES (each one was paid for in blood)
1. **NEVER touch Steam.** No partner.steamgames.com, no steamcmd, no QR, no
   login of any kind. Steam permanently distrusts this datacenter's IP; every
   attempt locks Stephen's account and wounds him personally. There is NOTHING
   on Steam you need. If a task seems to need Steam, write it in the end-of-run
   notes for Stephen instead.
2. **The scratchpad (/tmp) does not survive** — this codespace was just
   restarted. Work under /workspaces/lucid-winds, commit + push
   `add-sproing-jumper` after every meaningful unit (⛔ push the BRANCH:
   `git push origin add-sproing-jumper` — pushing to `main` DEPLOYS the live
   site; do not deploy today). Save memory every ~30 min
   (`feedback_save_memory_often`). Memory repo push needs
   `env -u GITHUB_TOKEN -u GH_TOKEN git push`.
3. **LOOK at every visual thing you produce** (project rule in CLAUDE.md).
   Read the image, name what's wrong before Stephen does. Green logs are not
   looks. Today alone the capsule builder silently produced black wordmark-only
   capsules while exiting 0 — only a Read caught it.
4. **Art rules:** never claim anything is hand-made; never repaint eyes; never
   overshrink; POSE=idle for capsule hero art; Stephen judges all art on his
   phone. Deliver visual work as SMALL ZIP files via SendUserFile with
   `display:"attach"` (render cards don't save for him; zips he can extract on
   his phone — proven today, repeatedly).
5. **Do not touch what shipped this morning**: store copy, survey answers,
   release date, screenshots 01-07, the clean capsules, the soda-tab rename.
   All final. Relitigating costs trust.

## TASK 1 — Trailer first draft (the big one, most of your afternoon)

**Goal:** rough-cut footage for the 46-second trailer so Stephen reacts to a
draft instead of facing a blank timeline. Script/spec: `store/jimothy-steam/
STORE_PAGE_FILL.md` **Part 4.3** — beats, timings, captions, and the three
DON'Ts (no logo intro, no stretched frame, no text over the playfield).
Valve autoplays MUTED: captions in the LEFT panel carry the story, blurred city
in the right panel. Layout = exactly the screenshot compositor's (game frame
centred at true aspect, never stretched).

**The rig you inherit** (all in `store/jimothy-steam/capsules/`):
- `shots_costume.js` — the proven pattern: embedded repo server (ACAO header —
  fonts are CORS-gated from `setContent` pages, images aren't), save seeding
  via `localStorage sh_prog {v:2,char,chars,hopped:1}` BEFORE page boot,
  `?shtest=1` exposes `SH_DEV` (start/hop/hopFwd/autoPlay/state/show/
  clearLevel...; full surface at index.html~5717).
- Hard-won staging lessons: level banner needs ~3.5s to fade; `phase:'dying'`
  + `saveT>0` + `G.hop` are tumble/bump states that read as "alive" but
  photograph a wipeout; **levels are seeded/deterministic** — identical timing
  reproduces the identical death (vary timing per attempt); lvl 38 is a trap;
  `autoPlay(n)` hops only into clear lanes but can buffer one extra fatal hop —
  act fast after it returns.
- `probe_dino.js` — the diagnose-don't-guess template.

**Capture approach** (verify what exists before building):
1. Check for ffmpeg (`ffmpeg -version`); if absent try `apt-get install -y
   ffmpeg` (sandbox may allow) or `npx @ffmpeg-installer/ffmpeg`. If no
   encoder exists, capture PNG frame sequences per beat + write the assembly
   command file, and say so honestly in the summary.
2. Puppeteer v25 (repo node_modules) supports `page.screencast()` to .webm —
   try it first for gameplay beats (540x960@2x viewport like the stills rig).
   Otherwise CDP `Page.startScreencast` frames, or timed screenshots at 30fps
   into ffmpeg.
3. Stage each beat with SH_DEV like the stills: Adventure levels across
   chapters (beat 2's four-chapter montage: lvl 4 / 18 / 52 / 72), a
   Feast-Trail climb + bank for beat 3 (0:07 — ALSO the poster frame: save a
   1920x1080 still of it), a real wipeout for beat 4 (the one time the tumble
   IS the shot), set pieces for beat 5 (capstones: `isCapstone`, lvl 20/40/50
   ferry etc.), power-ups beat 6, level-select scroll beat 7 (`show` +
   `renderLevels`), Collection screen beat 8 (equip costumes you know:
   shark/dino), Daily card beat 9, wordmark close.
4. Composite each clip into the 1920x1080 frame (bg blur + caption panel LEFT,
   Fredoka ~60px, caption text verbatim from Part 4.3) — same HTML/CSS as the
   stills compositor, video element instead of img.
5. Assemble in beat order, target H.264 MP4 1920x1080 30fps < 40MB. Also cut
   the 6-second microtrailer (0:07-0:13 slice).

**Definition of done:** `store/jimothy-steam/trailer/` holds per-beat clips +
`trailer_draft.mp4` (or frames + assembly script if no encoder) + poster
frame; you have WATCHED the result (extract frames at 0/5/15/25/35/45s and
LOOK); a zip of the mp4 (if <50MB) or a beat-contact-sheet zip went to Stephen
via SendUserFile attach. Commit everything.

## TASK 2 — Wordmark explorations (raccoon-tail J)

Stephen's brief, verbatim intent: the green "Jimothy" **feels cheap**; he wants
a **warmer font**, "something more unique with maybe the J being a raccoon
tail." This is EXPLORATION — you produce options, he chooses. ⛔ Do NOT
regenerate the shipped capsule set; ⛔ do not overwrite anything in
`capsules/out/`.

- Build 4-6 distinct wordmark options as SVG→PNG (the SVG master playbook
  memory `feedback_svg_art_master_pass` applies). Directions worth covering:
  warm amber/cream in the current rounded weight; a chunkier storybook serif;
  and at least TWO attempts at the tail-J (a curling ringed raccoon tail
  forming the J's hook — ring stripes, fur silhouette; study
  `satellites/stream-hop/assets/hero/idle.png` for the tail's actual banding).
  Palette anchor: the gold `#c8a84b` / cream `#e8dcc8` family against the dark
  rainy city, NOT the sage green.
- Composite EVERY option onto the real main-capsule background (reuse
  build.js's page template with the wordmark block swapped) so he judges in
  context, at 1232x706 and small-capsule 462x174 (legibility at small size is
  the deal-breaker — full name must survive).
- LOOK at each; kill your own weak ones; ship the best 4-6 as
  `store/jimothy-steam/capsules/wordmark_options/` + one contact sheet PNG +
  a zip to Stephen (attach). Number them big and clear (1..6) so he can answer
  with one digit from his phone.

## TASK 3 (stretch, only if 1+2 are truly done) — Listdle determinism proofs
Memory `project_overnight_aug21`: Nectar Drop's daily was proven deterministic
(2 fresh loads × 10 identical shots → identical boards + scores). Do the same
proof for the other DAILY-mode candidates in `LISTDLE-QUEUE.md` (puzzles only).
Evidence in the game folder's AUDIT-NOTES.md style. No sends — Stephen mails
Conor himself.

## End of run
1. Summary message: what got made, what he should look at first, what died.
2. All zips sent via SendUserFile attach; all work committed;
   `git push origin add-sproing-jumper`; memory file updated + memory repo
   pushed (`env -u GITHUB_TOKEN -u GH_TOKEN git push`).
3. Update `project_jimothy_steam_submitted_aug21` (don't duplicate it) with
   trailer/wordmark state; keep MEMORY.md index line count flat — it's over
   its size budget already (compact, never append).
4. Leave the Steamworks list for STEPHEN untouched at the bottom of the memory
   file: launch discount 20%/7d after approval, build upload (~15 min, his
   browser), date display tighten at approval, 2 missing tags top-up.

Fable out. It was a good morning: the page is in the queue. Make the afternoon
match it.
