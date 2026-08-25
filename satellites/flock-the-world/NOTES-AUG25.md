# FTW — Stephen's playtest notes, Aug 25 (Crisis Engine · Vendor, two runs)

Source: phone notes, two Crisis Engine runs on Vendor. Run 1 LOSS (Platform
dismantled, day 1046, 5-country revolt + mass crackdown). Run 2 WIN (Too Big
To Ban, day 2356, story-tree buyout + concede spam; never reached the
suspicion gate in either run).

Checklist in the order the notes were given. `[x]` only with evidence
(check.js green + probe shot or live grep, per house rules).

## The list

- [x] 1. **Dr Vole pronoun** — portrait is a man, prompts say "she". Fix the
      pronouns (and audit the whole cast for the same mismatch). DONE: 9
      she/her sites → he/him (matches portrait, the male name Merrick, and
      the win epilogue which already said He). Whole cast audited against
      portraits — all other nine consistent (Brill/Klein/Lena she, rest he).
- [ ] 2. **Suspicion gate unreachable + invisible** — crisis tree "proxy
      flashpoint" wants suspicion > 18 but no suspicion stat exists anywhere
      in the UI; player pushed Coalition to 19% thinking that was it. Two full
      runs never reached it. Needs: surface the stat, make the gate reachable
      by deliberate play, fix the gate text. SERIOUS balancing.
- [ ] 3. **Velvet Glove / Iron Fist images butchered** — far too zoomed.
      Show both whole images + their text on one screen, uncropped.
- [ ] 4. **Choice popups eat bubble taps** — story messages appear while
      popping bubbles at 3x and a stray tap picks an option. Need an arming
      guard so a choice can never be made by accident.
- [ ] 5. **Choices show no impact** — popups interrupt and never show what the
      pick actually did. Show the real deltas after choosing.
- [x] 6. **"!" bubbles are silent** — no sound on tap (cash + inf have cues).
      DONE: `sfx/bubble_leak.mp3` (Kenney Interface Sounds scratch_004, CC0
      verified in pack License.txt, house recipe mono 96k) wired into the
      leak branch of collectAt + catalog/cooldown/manifest; check.js extended
      (cue sheet 33, SRC assertion on the handler). ⚠ picked unheard — worth
      an ear on device.
- [ ] 7. **Concede is free and spammable** — clicked repeatedly to crush
      organization with zero consequence. Cooldowns / rate limits so you have
      to balance.
- [ ] 8. **Loss blindside** — five countries revolted, crackdown on all, lost
      with no meter warning. Need a persistent danger readout before the
      Great Refusal fires.
- [x] 9. **End-screen synergy count is lifetime, not per-run** — "9 of 16" was
      the account ledger. DONE: share text now "Synergies found N this run";
      records strip reads "synergies this run N · lifetime M of 16" above the
      per-run name list. Menu keeps lifetime; Feed tab was already per-run.
- [ ] 10. **Proper finish sequence** — fade out to the end screen while the
      ending song plays, then fade to the stats.
- [ ] 11. **One-strategy problem** — buying the Story tree down feels like the
      only decent way to win in every mode; other modes' win paths unclear.
      (Balance umbrella with 2 and 7.)
- [ ] 12. **Same briefing every mode** — pops up for each game type saying to
      build the same way; sick of it.
- [ ] 13. **Tips-off option** — same mid-game tips fire every run; helpful
      only the first time. Persist "seen" + add a toggle.
- [ ] 14. **Country tap blocks bubbles** — info popover opens over the map and
      bubbles are missed behind it. Auto-pause on country tap.
- [ ] 15. **Dossier/chapter art cropped** — room image showed only its middle
      band. Audit EVERY art placement for bad cropping; all such crops are
      presumed mistakes.
- [ ] 16. **Story copy stiff / obviously AI** — loosen the wording.
- [ ] 17. **Country popover: stat bars** — show the bars, not just numbers.
- [ ] 18. **Agitate/Crackdown/Concede legibility** — crackdown drops unrest
      but feeds organization, concede the reverse; the depth is real but
      opaque. Teach it at the point of use.
- [x] 19. **Patriotism vs Coalition** — INVESTIGATED: nothing was reverted.
      The meter is deliberately named Coalition in Crisis Engine (Aug 20
      design) and Patriotism elsewhere; ovrTxt (8c3c4f9) renames event/news
      copy per mode, so a Crisis run correctly says Coalition everywhere the
      pipe reaches. The ~40 events were already swept off "oversight". The
      real bug: three surfaces bypassed the pipe and said Patriotism to a
      Crisis player — tree descriptions, tutorial (incl. an ALL-CAPS line the
      helper missed), lobbying tooltip. DONE: all three piped; ovrTxt now
      handles PATRIOTISM caps.
- [ ] 20. **Last tree nodes broken** — final node in each tree missing its
      image, description clipped unreadable.
- [ ] 21. **Music playlists** — support 4-5 songs per slot like Jimothy,
      easy for Stephen to drop in from Suno, toggle in/out.
- [ ] 22. **Store readiness** — game submittable to Steam and Google Play
      (packaging checklist + whatever blocks it).

## Work order (smartest path through the list)

A. Recon all 22 (read-only fan-out) → this doc updated with root causes.
B. Correctness + trust: 19 (naming truth), 1 (pronouns), 2 (suspicion
   surface + gate), 20 (tree nodes), 9 (per-run synergies).
C. Input safety + feedback: 4, 6, 14, 17, 18, 5.
D. Balance: 7 (concede pricing), 8 (loss warning), 2 (gate reachability),
   11 (mode win paths) — sim-verified per BALANCE-SCALING.md.
E. Presentation: 3 + 15 (art crops, screenshots mandatory), 10 (finish
   sequence), 16 (copy pass), 12 + 13 (briefings/tips).
F. Infrastructure: 21 (music playlists), 22 (store packaging).

Each landed item: check.js extended where checkable, committed + pushed
separately, deployed, live-verified, then crossed off here.

## Item 22 recon (store readiness, scouted Aug 25)

**Steam** — process is `STEAM-CHECKLIST.md` (repo root); the whole Jimothy rig
in `store/jimothy-steam/` is template-quality and reusable (Electron shell
`main.js`, `vendor.sh`, `steampipe/upload.sh` with depot=appid+1, capsule
generator at all 8 Valve sizes + 5 screenshots). Missing: a Steamworks app +
$100 fee, FTW store copy, capsules/screenshots from FTW art, .ico, content
rating + AI disclosure, price call (Stephen: $1 target — ⛔ never raise a
price once set), and vendor.sh must learn FTW's extra files (game.js, art/,
sfx/ — Jimothy shipped one file + assets/). FTW is landscape: drop/invert
the ASPECT lock in main.js.

**Google Play** — runbook is `CROSSCHECK-PLAY-AUG22.md` §5 (bubblewrap) with
gates `scripts/twa_ready.mjs flock-the-world` + `_offline_check.mjs`;
copy-and-edit templates in `satellites/bandits-box/` (manifest, sw.js,
privacy.html, PLAY-LISTING.md, icon generator). FTW currently has NONE of
it: no manifest, no service worker, no icons, no privacy.html, and 3
unguarded `SWS_EXIT` references (needs the `inTWA` guard — Play policy
gate). Offline shell list is non-trivial (index.html + art/ + sfx/). Also
missing: feature graphic 1024x500 (no generator exists in the repo),
assetlinks.json on the host, keystore, Data Safety form. Content-rating
read recommended before either store (arms-fair/surveillance themes).
