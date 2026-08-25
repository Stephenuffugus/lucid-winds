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
- [x] 2. **Suspicion gate unreachable + invisible** — crisis tree "proxy
      flashpoint" wants suspicion > 18 but no suspicion stat exists anywhere
      in the UI; player pushed Coalition to 19% thinking that was it. Two full
      runs never reached it. DONE: root cause was charter (required prereq)
      suppressing the gated stat + late-game normalization. Gate now 10 with
      a LIVE meter as its text; agitate feeds suspicion (+5 local +2 world);
      suspicion bars on region cards + popover; World stat gold at 10+ with
      'of 10 for Proxy' while locked. check.js proves a loud bot opens it.
- [x] 3. **Velvet Glove / Iron Fist images butchered** — DONE: whole image
      beside its text in portrait (both + header on one screen), two-up in
      landscape. Root cause: portrait cards in a 2.6:1 cover strip (~27%
      shown). Shot in both orientations.
- [x] 4. **Choice popups eat bubble taps** — story messages appear while
      popping bubbles at 3x and a stray tap picks an option. DONE: options
      inert 450ms (CSS + hard timestamp guard) and map taps die under any
      modal. (Shot in the visual pass.)
- [x] 5. **Choices show no impact** — popups interrupt and never show what the
      pick actually did. DONE: AFTERMATH phase shows the real deltas (money,
      influence, meter, suspicion, organized, compliance, war heat, pages)
      plus the wire line, behind CONTINUE.
- [x] 6. **"!" bubbles are silent** — no sound on tap (cash + inf have cues).
      DONE: `sfx/bubble_leak.mp3` (Kenney Interface Sounds scratch_004, CC0
      verified in pack License.txt, house recipe mono 96k) wired into the
      leak branch of collectAt + catalog/cooldown/manifest; check.js extended
      (cue sheet 33, SRC assertion on the handler). ⚠ picked unheard — worth
      an ear on device.
- [x] 7. **Concede is free and spammable** — clicked repeatedly to crush
      organization with zero consequence. DONE: a repeat inside 10 days is
      theater - half relief, double control cost, no goodwill. Bots (12/17d
      cadence) untouched; canaries green; spam checks watched red on mutant.
- [x] 8. **Loss blindside** — five countries revolted, crackdown on all, lost
      with no meter warning. DONE: red HUD strip 'THE REFUSAL · N/4 MARKETS
      EXPELLED · N IN UPRISING', blinks at the brink, BREAKING banner at one
      expulsion from loss.
- [x] 9. **End-screen synergy count is lifetime, not per-run** — "9 of 16" was
      the account ledger. DONE: share text now "Synergies found N this run";
      records strip reads "synergies this run N · lifetime M of 16" above the
      per-run name list. Menu keeps lifetime; Feed tab was already per-run.
- [x] 10. **Proper finish sequence** — DONE: 1.1s game dissolve under the
      song, verdict + title lead, reel unspools, stats + buttons fade up as
      the coda (tap-through respected). Bonus fix: #end was a centered flex
      column with overflow, hiding the verdict off the top once content grew.
      Shot the whole sequence.
- [ ] 11. **One-strategy problem** — OPEN, but attacked from three sides
      this pass: concede spam is priced (7), the whole upper Crisis ladder is
      actually reachable for the first time (2) so the loud win path exists
      in practice, and each mode's guide/briefing now teaches its own
      opening (12). The Aug 24 work (patriotism floor, ban debate, bribe
      heat) already targets story-tree dominance. What remains is a
      dedicated tuning session on the four win doors with Stephen's
      playstyle notes (standing open call) - the three seeded canaries
      guard today's balance meanwhile.
- [ ] 12. **Same briefing every mode** — pops up for each game type saying to
      build the same way; sick of it.
- [ ] 13. **Tips-off option** — same mid-game tips fire every run; helpful
      only the first time. Persist "seen" + add a toggle.
- [x] 14. **Country tap blocks bubbles** — info popover opens over the map and
      bubbles are missed behind it. DONE: popover pauses like a sheet (Aug 20
      no-pause call reversed), restores on close, sheets inherit the pause.
- [x] 15. **Dossier/chapter art cropped** — AUDITED all placements: only
      .docart (item 3) and .evart cropped badly; .whopic (square on square),
      .mcart/.dfart (already contain), tree icons, and full-bleed backdrops
      are fine and untouched. .evart now contains, centered, capped 30vh on
      a dark mat. Committee-room plate shot whole.
- [x] 16. **Story copy stiff / obviously AI** — surgical pass: the corpus
      read STRONG on review (event bodies, ambient wire, epilogue beats all
      concrete and human), so no blanket churn. The one real formula - all
      four win screens closing 'Sit with X' - rewritten as four distinct
      closers. If specific popups still land stiff, name them and we hit
      exactly those.
- [x] 17. **Country popover: stat bars** — DONE: unrest/organized/suspicion/
      coverage/compliance bars with numbers, same classes as the World tab.
- [x] 18. **Agitate/Crackdown/Concede legibility** — crackdown drops unrest
      but feeds organization, concede the reverse; the depth is real but
      opaque. DONE: every action toasts its full bill (suspicion/organized/
      grudge included); crackdown button carries a backfire BAND and warns
      HIGH with an icon; agitate title explains the one-two AND the proxy
      lever.
- [x] 19. **Patriotism vs Coalition** — INVESTIGATED: nothing was reverted.
      The meter is deliberately named Coalition in Crisis Engine (Aug 20
      design) and Patriotism elsewhere; ovrTxt (8c3c4f9) renames event/news
      copy per mode, so a Crisis run correctly says Coalition everywhere the
      pipe reaches. The ~40 events were already swept off "oversight". The
      real bug: three surfaces bypassed the pipe and said Patriotism to a
      Crisis player — tree descriptions, tutorial (incl. an ALL-CAPS line the
      helper missed), lobbying tooltip. DONE: all three piped; ovrTxt now
      handles PATRIOTISM caps.
- [x] 20. **Last tree nodes broken** — layout DONE: the four capstones
      (added Aug 24 after the art batch) have no icon, so the 67px icon
      indent is now earned by having one, and the landscape 2-line clamp is
      lifted for capstones (their tap is BUY; the text must be readable).
      Verified unclipped both orientations. ⚠ STILL OWED: 4 art files -
      caps_dep / caps_cap / caps_inf / caps_war webp (Stephen generates;
      NODE_ART gets the 4 keys when they land).
- [x] 21. **Music playlists** — DONE: drop `<slot>_2.mp3` in sfx/ + one
      line in MUSIC_HAVE and it rotates (no repeat, beds hand off at track
      end); SOUNDTRACK pips appear in the menu once a slot has 2+ tracks;
      excludes persist; silence unconfigurable. 4-step guide in
      SFX-GUIDE.md; check.js enforces the manifest both ways.
- [x] 22. **Store readiness** — everything code can do is DONE:
      Play: all 10 gates GREEN (`node scripts/twa_ready.mjs flock-the-world`
      = "ready to list") - manifest, sw.js offline shell (cold launch
      proven), icons from the lens-globe mark, privacy.html, inTWA policy
      guard. Steam: store/ftw-steam/ Electron rig scaffolded + vendor.sh
      PROVEN (11M app/). What remains is Stephen-only, listed in
      store/ftw-steam/FTW-STEAM.md (appid + $100, price call, capsules,
      rating survey) and CROSSCHECK-PLAY-AUG22.md §5 (Play account,
      keystore, assetlinks, bubblewrap init, feature graphic 1024x500).

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
