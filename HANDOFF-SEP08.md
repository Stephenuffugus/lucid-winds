# HANDOFF — next session. Written Sep 07 2026, end of a 12 hour day.

Stephen is off testing the twelve new games and will come back with notes. Everything below is
current and verified. **Nothing is dirty, nothing is unpushed, and nothing lives only on the box.**

---

## 0. FIRST THING, BEFORE ANYTHING ELSE

Memory does not survive a fresh codespace. If `~/.claude/projects/-workspaces-lucid-winds/memory`
is missing:

```
git clone https://github.com/Stephenuffugus/sws-memory.git \
  ~/.claude/projects/-workspaces-lucid-winds/memory
```

Then `./workspace.sh`.

⛔ **The codespace `GITHUB_TOKEN` is scoped to this repo only.** Anything touching the vault, the
memory repo, or a sibling repo needs `env -u GITHUB_TOKEN -u GH_TOKEN gh …`. Without it you get
"Could not resolve to a Repository" and will wrongly conclude things do not exist. This cost an
agent a wrong answer today.

---

## 1. WHAT HE IS DOING WHILE HE IS AWAY

**Testing the twelve, and bringing notes back.** Nine of the twelve have never had a thumb on them
and nobody has heard any of them on a speaker. His test page, where his answers are saved to a
database you can read back:

`https://claude.ai/code/artifact/c7294130-1b66-417a-ae7d-a9987451175f`

⛔ **When he returns, READ IT before asking him anything** — his verdicts may already be in there.
Read with the Artifact tool: `action: "read_db"`, that url, `db_op: "list"`, `collection: "verdicts"`.
Each doc id is the task id; the body is `{answer, note, at}`.

⛔ **How to take his notes** is a documented procedure and he has corrected people on it:
verbatim first, then sort into fault / taste / already-known, and SAY WHICH.
See `HANDOFF-FABLE-SEP06-EVENING.md` §1.

He also said he may come back with **new game ideas**.

---

## 2. JIMOTHY — THE STATE, AND THE ORDER IS FORCED

**Release Fri Sep 18 2026, 10:01 EDT. Eleven days. The plan is `docs/LAUNCH-PLAN-SEP07.md`;
the revised order is the section at the bottom of that file.**

### The three facts he established at the console today

1. **He already published** (a small description edit), so the Steamworks staging area is clear.
2. **Controller support is on Edit Store Page → Basic Info.** He was right; an earlier analysis in
   the plan said otherwise and was wrong.
3. **⛔⛔ THE RELEASE DATE IS LOCKED AT SEP 18. HE CANNOT MOVE IT.** Steamworks tells him to contact
   Valve. This is the fact everything else hangs on.

### ⛔⛔ The rule that forces the order

`partner.steamgames.com/doc/store/review_process`:

> "All supported features listed on the store page will need to be implemented in the current build.
> If you intend to add a feature in the future, you'll need to remove the selected feature in the
> Basic Info tab until it is implemented and released."

**Revision 2 is the build under review and it has neither achievements nor gamepad.** Publishing the
achievements or ticking controller support now would make the page claim two features the reviewed
build does not have. That is a named fail condition.

### The path

Because the date cannot move, protecting the in-flight review outranks getting r4 reviewed. After
approval, updates need no re-review: *"Once your game has been reviewed and approved, there is no
need to go through review again."*

1. **Leave revision 2 alone in review. Do not touch the build.**
2. Approval realistically **Sep 11 to Sep 15** (Sep 07 was Labor Day, queue starts Sep 08).
3. Then upload r4 and set it live on default.
4. Then publish the 26 achievements, tick controller support, delete the false line — one sitting.
5. Launch Sep 18.

### Free and zero risk, any time (store edits on a live Coming Soon page publish immediately)

- **The release date DISPLAY.** It is set to month-and-year, and Valve sorts a month-and-year game
  "as though you had selected the last day of the month" — **Steam is sorting Jimothy as Sep 30**,
  costing Popular Upcoming placement in his actual launch week. He may have changed this already;
  check the live page before telling him to.
- **Delete `Mouse and keyboard only; there is no controller support`** from Basic Info → System
  Requirements → Minimum → Additional Notes. That one field only; the rest of the block is correct.
- **Enter the 26 achievements.** Defining is app configuration and touches nothing.
  ⛔ **DO NOT PUBLISH THEM** until r4 is live.

### Assets, all verified today

- `vault-20260907-jimothy-icons` → **`jimothy-achievement-icons.zip`**, 336 KB, 54 files (52 icons
  all measured 64x64 RGBA, `api_names.json`, `ACHIEVEMENTS.md`). Built today because there was no
  zip and feeding Steamworks meant 52 separate downloads.
- `vault-20260904` → `jimothy-steam-build-20260905-r4-achievements-controller.zip`, **354,190,913
  bytes**, sha256 `784feb49f5286b70f6e97cdf7287d773d9764133a066f56d5187d99fbffc0937`. I parsed its
  zip directory: it really carries `Jumping Jimothy.exe`, `steam_api64.dll` and the steamworks.js
  native module unpacked from the asar.
- ⛔ Paste API names from **`api_names.json`**, never from `ACHIEVEMENTS.md` — every name there is
  wrapped in backticks and they come along on a copy.

### ⛔ Two traps in testing an achievement

- `steamSyncAll()` runs at boot and replays every badge already in the local save, which Electron
  keeps at `%APPDATA%\Jumping Jimothy` and which survives an r2→r4 swap. **Delete that folder before
  testing** or the first hop will not pop on a perfectly good build.
- **Five of the 26 cannot be tested in September** — the seasonal months exclude month 9.
  `SEASON_MON` is the dev override.

### Unknown in every source

What happens to an in-flight review if the build is replaced mid-pass, and whether Valve re-checks
between approval and release. The path above needs neither answer, which is why it was chosen.

---

## 3. FLOCK THE WORLD ON PLAY — unaffected by any of the above, do it in any order

Part Two of `docs/LAUNCH-PLAN-SEP07.md`. Three to four hours across two sittings.

**Four blockers were fixed today**, all of them prose, which is why no gate had ever seen them:
the privacy policy had no contact method at all (a Play User Data violation on a live page); the
short description opened with a rival's trademark and was 80 chars against an 80 cap; the full
description was hard wrapped and Play preserves newlines; and the FTW *Steam* copy still held 14
BBCode tags, the exact shape that went live as raw tags on Jimothy's page.

⛔ **One of those fixes silently did not take the first time.** Cloudflare rewrites every `mailto:`
on lucidwinds.com into `[email protected]` decoded by JavaScript, so a reviewer without scripts saw
no address. Fenced with `<!--email_off-->` and verified against the **served** page. See
`feedback_cloudflare_eats_mailto_in_policies`.

**What is still his:** create the app, paste the listing, the IARC questionnaire, data safety,
target audience, **developer contact details (email, phone, address)**, upload the signed AAB, and
send back the **App signing SHA-256** so assetlinks can be finished.

⛔ **Uninstall any sideloaded Flock APK from the Pixel first** — same package, debug cert, and the
Play install fails with a bare "App not installed".

⛔ **Managed publishing ON before the production submit**, or it goes live the hour review clears —
possibly the same day as Jimothy's launch.

---

## 4. THE TWELVE — where they stand

All twelve live and green; last full sweep Sep 07 12:01 UTC, twelve green with every stamp agreeing
in four places. Fourteen items landed across all twelve in the last 24 hours.

```
gerplunk 20260907f   windup    20260907c  wardian     20260907c  updraft   20260907d
inkswing 20260907c   airworthy 20260907c  strata      20260907c  doohickey 20260907c
swell    20260907c   asterism  20260907d  whistlestop 20260907d  fathom    20260907c
```

**What no gate can tell anyone:** none of the twelve ships a painted image, nobody has heard any of
them on a speaker, and nine have never been played on glass. That is what he is away doing.

⛔ **`docs/PHONE-CHECKLIST-SEP07.md`** is his page. ⛔ **`HANDOFF-OPUS-SEP07-NIGHT.md`** §9 is the
ledger of what landed and why.

---

## 5. SCARS FROM TODAY — these will bite the next session

- ⛔⛔ **`flock` around `sweep-twelve.mjs` deadlocks it.** It takes the same lock per game. Silent,
  looks like a slow run: 47 minutes against a 19 minute norm. **Run it bare.**
  `fuser -v /tmp/sws-gate.lock` names the holder; kill by PID, never `pkill -f`.
- ⛔⛔ **`git log @{u}..` only checks the CURRENT branch.** `abduct_a_chameleon`'s `main` was **79
  commits ahead** — two weeks of 3D work that existed only on the box. Sweep
  `git for-each-ref refs/heads/` in **every** repo before any box is recycled. Rescued to
  `rescue/main-20260907`; BarBrawl to `rescue/BarBrawl-aug22`.
- ⛔⛔ **Store blockers are prose and no gate reads prose.** Four of them today.
- ⛔ **MEMORY.md is 22.8 KB against a 24 KB read limit.** Compact it properly before adding anything;
  the Jul-and-older ledger lines and the ARCHIVE section are the fat and every one is greppable.
- ⛔ **CLAUDE.md is out of date in two places found today:** it says Pi SDK integration still needs
  building (it is built, `index.html` loads the SDK and defines `createPayment`), and it lists four
  live Cloud Functions when there are thirteen, including an entire undocumented Stripe + NOWPayments
  lane.

---

## 6. THE PROMPT TO PASTE

```
Read HANDOFF-SEP08.md first, then docs/LAUNCH-PLAN-SEP07.md.

I have been testing the twelve new games and I have notes. Take them the way
HANDOFF-FABLE-SEP06-EVENING.md section 1 says: read them back to me verbatim first,
then sort them into fault / taste / already-known, and say which is which. Do not
start fixing anything until I have seen that sort.

Also check the test page for answers I may have already tapped in:
https://claude.ai/code/artifact/c7294130-1b66-417a-ae7d-a9987451175f
(Artifact tool, action read_db, db_op list, collection "verdicts").

Then: anything on Jimothy that needs doing. The Sep 18 date is LOCKED and revision 2
is in review, so do not let me publish achievements or tick controller support until
r4 is live on default. The three free things are the release date display, deleting
the false controller line, and entering the 26 achievements without publishing.

After that, whatever I can do on Flock the World for Play.

Work autonomously, push after every green subsystem, and tell me plainly when
something you find contradicts what a doc says.
```
