# THE LAUNCH PLAN — Jimothy's achievements and controller, then Flock on Play

**Written 2026-09-07 by Opus**, from a six agent verification pass in which every asset was
opened and measured rather than taken from a doc, and every step was then attacked by a second
agent whose only job was to find where it fails you. **It found plenty.** What is below is the
corrected version; the corrections are marked ⛔ so you can see what would have gone wrong.

---

## ⛔ FIVE THINGS THE OLD DOCS GOT WRONG. READ THESE FIRST.

1. **September 18 2026 is a FRIDAY.** `docs/JIMOTHY-LAUNCH-KIT.md` said Thursday in two places
   and one of those lines is in a social post you were going to send. Fixed today.
2. **Today, Monday Sep 07, is US Labor Day.** Valve is in Bellevue. A store page submitted today
   queues behind a holiday, so review realistically starts **Tuesday Sep 08**, and three to five
   business days lands **Fri Sep 11 to Mon Sep 14**. The slack is a day thinner than it read.
3. **There is ONE Publish button in Steamworks and it publishes everything staged.** Achievements,
   the launch option, and the controller flags all sit behind
   *Edit Steamworks Settings → Publish → Prepare for Publishing*. The old plan spent its only
   publish on the achievements before it had looked at the other two. **Set all three, then
   publish once.**
4. **Publish is not on the app landing page.** There is no "Publish tab" there. It is inside
   *Edit Steamworks Settings*. Do not go hunting.
5. **Your store page right now says, in the system requirements: "Mouse and keyboard only; there
   is no controller support."** That sentence is live, it is false as of revision 4, and it stays
   live for the whole review window unless this run replaces it.

---

## WHAT I ALREADY DID FOR YOU TODAY

| Done | Why it mattered |
|---|---|
| **Built `jimothy-achievement-icons.zip`** and put it in the vault | There was no zip. Feeding Steamworks meant 52 separate downloads and 52 file-picker hunts — about three hours on a phone. Now it is one download. The contact sheet is deliberately left out: it is 888x276, it is not an icon, and it sorted to the top of the folder right where a tired hand grabs a file. |
| **Fixed the Flock privacy policy** | Its entire contact section read "Questions: Sky Wolf Studio." with no email and no address. Play's User Data policy requires a contact method **in the policy itself**. This was a listing rejection, and no gate in the repo checks prose. |
| **Rewrote the Flock short description** | It opened *"Plague Inc for the surveillance state"* — another company's trademark, in the single most-scanned field in a Play review. It was also 80 characters against an 80 cap: one trailing space on paste and the field refuses to save. The new line is 76 characters. |
| **Unwrapped the Flock full description** | It was hard wrapped at 72 columns for terminal reading. **Play preserves newlines.** Pasting it verbatim would have shipped a listing broken mid-sentence: "They map / your cameras". |
| **Defused the FTW Steam BBCode** | `store/ftw-steam/STORE_PAGE_FILL.md` still held 14 `[h2]`/`[b]`/`[list]` tags — the exact shape that went live as raw tags on Jimothy's page the day you shared the wishlist link. Nobody came back for this file after fixing Jimothy's. It is plain text now. |
| **Rescued 79 unpushed commits** | `abduct_a_chameleon`'s local `main` was 79 commits ahead of GitHub — two weeks of 3D work from Jul 20 to Aug 2 that existed only on this codespace. Pushed to `rescue/main-20260907`. BarBrawl had a rescue branch that had never left either. |

---

# PART ONE — JIMOTHY: ACHIEVEMENTS, CONTROLLER, AND THE r4 BUILD

**Do this at a laptop, not the phone.** Total honest time: **three to five hours**, and the bulk of
it is step 4, typing 26 rows. The old estimate of 79 minutes was fantasy.

**Have your phone next to you.** Steam Guard will ask.

### Step 0 — before you touch anything, read the current state (10 min)

Open these three and write down what you see. The rest of the plan branches on them.

- `partner.steamgames.com` → Jumping Jimothy → **Edit Steamworks Settings → Installation → General**.
  Is there a launch option? Does it say `Jumping Jimothy.exe`, Windows, no arguments?
  **Is it published, or staged?** The repo's own checklist still has this as an unticked box.
- **Edit Steamworks Settings → Application → Steam Input**, and **Edit Store Page → Basic Info**.
  You are looking for where controller support is declared. Look at **both** before you set
  anything, because the live page's own data uses per device family flags
  (`bFullXboxControllerSupport`, `bPartialXboxControllerSupport`, `bPS4…`, `bPS5…`,
  `bSteamInputAPISupport`), which is the Steamworks settings side, not a single dropdown on the
  store page. ⛔ The old plan sent you to Edit Store Page for a control that is probably not there.
- **SteamPipe → Builds.** Is build 25132044 still under review, or cleared?

### Step 1 — get the icons (3 min)

Download **`jimothy-achievement-icons.zip`** (336 KB) from
`github.com/Stephenuffugus/lucid-winds-vault/releases/tag/vault-20260907-jimothy-icons`.

⛔ **The vault repo is private**, so that link only works in a browser signed in to GitHub — fine on
the laptop, historically a problem on your phone. Unzip it. You should have 54 files: 52 icons,
`api_names.json`, and `ACHIEVEMENTS.md`.

### Step 2 — fix or confirm the launch option (5 min, only if step 0 said it was missing)

*Edit Steamworks Settings → Installation → General → Add Launch Option.*
Executable: `Jumping Jimothy.exe` — with the space, no folder prefix. Arguments: empty.
Operating System: Windows.

⛔ **If this is missing or unpublished, the r4 build cannot launch at all** and every later test
fails for a reason that looks like the build.

### Step 3 — set the controller flags (10 min)

Wherever step 0 found them. Tick **Partial Controller Support** (not Full — the game is portrait
and menu-driven, and Partial is the honest claim).

⛔ **If there is no "Steam Achievements" checkbox anywhere, that is correct and expected.** The
store page's achievement row populates automatically once achievements are published. Do not go
looking for it.

### Step 4 — enter the 26 achievements (2 to 3 hours)

*partner.steamgames.com/apps/achievements/5043360* → **New Achievement**, once per row.

For each row, from the unzipped folder:

- **API Name** — ⛔ paste from **`api_names.json`**, not from `ACHIEVEMENTS.md`. Every API name in
  the markdown is wrapped in backticks and they come along on a copy.
- **Display Name** and **Description** — from `ACHIEVEMENTS.md`.
- **Icon (achieved)** — `<API_NAME>.png`
- **Icon (unachieved)** — `<API_NAME>_locked.png`
- **Hidden** — tick it on `ACH_SECRETS` only, **while you are creating that row**. ⛔ Do not do a
  second pass over 26 rows later to find one checkbox.

All 52 icons are 64x64 RGBA, which is exactly Valve's spec. I measured every one.

**Honest note from actually looking at them:** at 64px several badges collapse into "a paw on a
shield" and are hard to tell apart in a list — `ACH_CRITTERS5`, `ACH_CRITTERSALL` and `ACH_DODGE`
especially. And every locked tile is dim: composited over Steam's dark ground they all sit in a
narrow 48 to 58 luma band, so none of them reads brightly. **Neither blocks anything** — icons can
be re-uploaded any time after publishing with no re-review. Ship these and improve them later.

### Step 5 — ONE publish (5 min)

*Edit Steamworks Settings → Publish → Prepare for Publishing → Publish to Steam.*

⛔ **Read the diff before you press it.** It should list the 26 achievements, plus the launch option
if you set one, plus the controller flags. A launch option naming `Jumping Jimothy.exe` is expected
and wanted. **Anything touching SteamPipe branches, depots or the live build is not** — back out and
tell me what it says rather than publishing blind.

Then reload the achievements page and confirm the 26 rows show as **published**, not pending.
Diff the published API names against `api_names.json`. Twenty six hand-typed strings is twenty six
chances at a typo.

### Step 6 — download and verify the r4 build (20 to 40 min, start it during step 4)

From vault release `vault-20260904`:
`jimothy-steam-build-20260905-r4-achievements-controller.zip`, **354,190,913 bytes**.

⛔ **Check the hash before uploading.** A truncated zip in a depot is a lost evening.

```
certutil -hashfile "jimothy-steam-build-20260905-r4-achievements-controller.zip" SHA256
```

Must be `784feb49f5286b70f6e97cdf7287d773d9764133a066f56d5187d99fbffc0937`.

I confirmed by parsing the zip's own directory that it really carries `Jumping Jimothy.exe`,
`steam_api64.dll`, and the `steamworks.js` native module unpacked from the asar — so the Steam SDK
is genuinely in this package and was not in revision 2.

### Step 7 — upload it and set it live (20 min)

Steamworks web depot uploader, the way you did the last one from your phone. App 5043360,
depot 5043361. Set live on the **default** branch.

⛔ **Safer alternative if the current build is still under review:** set r4 live on a private beta
branch first, install from that branch, do step 9, then promote to default. Same total time.

### Step 8 — replace the false line on the store page (10 min)

*Edit Store Page → Basic Info → System Requirements → Minimum → Additional Notes.*

⛔ **Change that one field only.** The rest of the Minimum block (Windows 10 1809+, dual core
2.0 GHz, 4096 MB, DirectX 11, 700 MB, Sound Card: Any) is already correct. Do not retype the table.

Replace `Mouse and keyboard only; there is no controller support.` with a true sentence.

**And while you are on this page, in the same submission** — because every store page submission
restarts Valve's queue and you only want to spend one:

- Set the release date to a **specific day**: Sep 18 2026. It currently says "September 2026" and
  carries an internal timestamp of Sep 30.
- ⛔ **The launch discount.** 20% for seven days. It **cannot be added after release**. It is still
  an unticked box in the repo's own checklist.
- If the wide trailer is going to replace the portrait one, it rides on this submission or waits a
  whole review cycle. `jimothy_trailer_wide.mp4` is in the same vault release.

### Step 9 — test it on real hardware (30 min, Sep 11 or later, never before step 7)

⛔ **This test has a false-negative machine built into it and it will lie to you.**

The game calls `steamSyncAll()` at boot, before any hop, and replays every badge already in your
local save. Electron keeps that save at `%APPDATA%\Jumping Jimothy` and it survives an r2 to r4
swap. **So if you have ever run a desktop build on that machine, the first-hop achievement will not
pop** — not because it is broken, but because the game already thinks you earned it.

**Rename or delete `%APPDATA%\Jumping Jimothy` before you test.**

⛔ **Do not trust the overlay toast.** Overlay hooking on an Electron window is the flakiest link in
this chain. Ground truth is the Steam client's **Library → Jumping Jimothy → Achievements** panel,
or Steamworks' own Global Achievement Stats.

⛔ **Five of the 26 cannot be tested in September at all.** The seasonal badges cover summer,
pride, spooky and winter; none covers month 9. There is a `SEASON_MON` dev override in the code if
you want to force one.

Also confirm here, because nobody ever has: **that the game actually appears in your Steam library
and installs.** The repo's checklist step for that is still unticked.

---

# PART TWO — FLOCK THE WORLD ON GOOGLE PLAY

**Honest time: three to four hours across two sittings**, mostly because the content rating
questionnaire runs long if you actually read it, which you should.

**Prerequisite:** the payments profile. The record says it was created Sep 04 with the W-9 and the
15% tier. If it is complete, **you do not need the bank account to create the app and run an
internal test** — the bank only gates payouts and the production release of a paid app. ⛔ The old
plan told you to stop and wait for Tuesday. Check the profile first; if it is green, keep going
today.

### Step 1 — clear the phone (2 min, do it now, you will forget)

⛔ **Uninstall any sideloaded Flock build from the Pixel.** `app-release-signed.apk` exists and the
build notes told you to sideload it for testing. It carries the same package name signed by a
**debug** cert. If it is on your phone, the Play install fails with a bare "App not installed" and
Android will not tell you why.

### Step 2 — create the app (10 min)

Play Console → **Create app**. Name: Flock the World. Game. **Paid, $0.99**.

### Step 3 — the store listing (40 min)

Everything is in `store/ftw-play/PLAY-LISTING.md`, rewritten today.

- **Short description** — the new 76 character line. ⛔ Not the old one.
- **Full description** — the unwrapped block. ⛔ Not the wrapped one.
- **Icon** — ⛔ use `store/ftw-play/twa/store_icon.png` (512x512 **RGBA**).
  `satellites/flock-the-world/play-icon-512.png` is the identical art but 24-bit RGB with no alpha;
  Play's spec asks for 32-bit. I pixel-diffed them: same image, different encoding.
- **Feature graphic** — `feature-graphic-1024x500.png`.
- **Screenshots** — ⛔ the four in the repo are dated Aug 25 and **four commits since then changed
  what two of them show** (three map colour styles, the pick screen giving the map the screen back,
  detail without clutter). They are honest but stale, and one has about 40% empty background. They
  will pass review. Decide whether you want a listing showing twelve day old art.

### Step 4 — the forms Play will demand and the old plan never mentioned

⛔ Every one of these blocks publishing:

- **App access** — no login required.
- **Ads** — no ads.
- **Content rating** (IARC questionnaire) — the honest answers are drafted in `PLAY-LISTING.md`.
  Expect a maturity note; it is political satire.
- **Data safety** — collects nothing, shares nothing. Answers drafted.
- **Target audience** — 13+.
- **Government apps** — no. **Financial features** — none.
- **Privacy policy URL** — `https://lucidwinds.com/satellites/flock-the-world/privacy.html`
  (fixed today; it now carries a contact method, which it did not this morning).
- ⛔ **Developer contact details** — Settings → Developer account → a public **email, phone number
  and physical address**. Play requires all three on every listing. Not in any doc until now.
- ⛔ **Countries/regions** is its own tab on the track, not inside the release editor.

### Step 5 — upload the bundle (15 min)

`flock-the-world-1.0-upload-signed.aab`, **3,679,753 bytes**, from vault release
`vault-20260906-ftw-upload`. Package `com.skywolfstudio.flocktheworld`, versionCode 1.

I verified the signature end to end: the keystore (alias `upload`, PKCS12, valid to 2054) and the
AAB both carry upload cert SHA-256
`C1:51:95:53:5A:E1:A9:EB:14:35:3F:62:FB:ED:5A:DD:02:49:FA:5A:A3:E7:9A:5A:6E:7B:F9:3D:77:A7:10:EC`,
and `jarsigner` says **jar verified**.

⛔ **IRREVERSIBLE.** Under Play App Signing, the key that signs your first upload becomes the
permanent upload key for this app forever. This is the right one. Do not upload any other AAB.

⛔ **The keystore is safe.** It is in the vault on GitHub, so it survives this codespace. I said
this morning that it lived only on a dying box — that was wrong, and the correction matters: it is
durable, but the GitHub release is now the only copy, so a personal backup is still worth five
minutes.

### Step 6 — send me the App signing SHA-256 (2 min)

*Test and release → **App integrity** → App signing.* ⛔ Not "Setup → App signing"; the Console
moved it. Copy the **App signing key certificate** SHA-256 (not the upload key) and send it over.

A **saved draft** release is enough to generate it. ⛔ You do not need to start a rollout first.

### Step 7 — I fix assetlinks, then you check it (my job, then 10 min of yours)

Right now `https://lucidwinds.com/.well-known/assetlinks.json` contains the literal string
`REPLACE_WITH_PLAY_APP_SIGNING_SHA256`. Google's own validator returns
`ERROR_CODE_MALFORMED_CONTENT` on it. Until it is real, the installed app shows a **browser URL
bar**, which is the classic sloppy TWA.

⛔ **The fix will not appear immediately and the reason is a cache, not a bug.** That file is served
`cache-control: public, max-age=86400` through Cloudflare. After I push it you must:

1. Purge Hostinger's cache: hPanel → Websites → lucidwinds.com → Cache Manager → Clear cache.
2. Fetch the **bare** URL with no query string and read the fingerprint. A `?cb=123` request
   bypasses the cache and will show you the right file while real installs still get the old one.
3. Only then install on the phone.

Every signal will disagree with itself until the edge catches up. Do not chase it by reinstalling.

### Step 8 — internal test on the Pixel (30 min)

⛔ **Play a full round while online before you test offline.** The service worker precaches only
eight files; every card, badge, cast and event image is cached only after it has been requested
once. Launch, go offline immediately, and you will see a half-drawn game and blame the build.

Then check: **no URL bar**, and **no "← Back to Sky Wolf" button** anywhere. That button is the
policy boundary — it navigates to the portal, which has Stripe. The gate script only asserts the
guard exists in the source; it has never been evaluated on a device.

### Step 9 — before production, not after

⛔ **Turn Managed Publishing ON** (Publishing overview → Managed publishing). Without it the app
goes live the moment review approves, which could be any hour between Sep 11 and Sep 20 — possibly
the same day as the Valve verdict, or the day Jimothy launches. You want to choose the hour.

---

## THE ONE STEP MOST LIKELY TO GO WRONG, IN EACH

**Jimothy: the Publish diff (step 5).** Steamworks publishes everything staged, and nobody has
verified the publish state of the launch option saved back on Sep 04. If the diff shows more than
you expect, read every line rather than pressing through or backing out blindly.

**Flock: assetlinks (step 7).** It is a CDN cache, so the repo will be right, a cache-busted curl
will be right, Google's validator will still be wrong, and the phone will still show a URL bar. All
four at once. Work the cache in the order above and do not touch the bundle — the app half is
already correct.

---

## WHAT IS NOT IN THIS PLAN, ON PURPOSE

The Steam release itself, the outreach emails, the curator submissions, and the launch kit's daily
posts. Those are a separate day's work and three of them are already overdue. This plan is the two
things you named.

---

# ⛔ UPDATE, Sep 07 evening — THE ORDER CHANGED. READ THIS BEFORE PART ONE.

Three facts from Stephen at the console plus a Valve-doc research pass:

1. **He already published** (a small description edit). The staging area is clear, so anything staged
   from here is only what he stages.
2. **Controller support IS on Edit Store Page → Basic Info.** He was right, the earlier analysis in
   this file was wrong. Valve's store-editing doc lists "Controller Support for your game" there.
3. **⛔⛔ THE RELEASE DATE IS LOCKED AT SEP 18 AND HE CANNOT MOVE IT.** Steamworks tells him to
   contact Valve. Valve: *"You can change the release date up to two weeks prior... Once this
   visibility starts, you can no longer adjust your release date."*

**⛔ THE RULE THAT FORCES THE ORDER** (`partner.steamgames.com/doc/store/review_process`):
> "All supported features listed on the store page will need to be implemented in the current build.
> If you intend to add a feature in the future, you'll need to remove the selected feature in the
> Basic Info tab until it is implemented and released."

So publishing achievements or ticking controller while **revision 2** is under review manufactures a
review failure: the page would claim two features the reviewed build does not have.

**THE PATH, revised.** Because the date cannot move, protecting the in-flight review outranks getting
r4 in front of a reviewer. After approval, updates need no re-review:
> "Once your game has been reviewed and approved, there is no need to go through review again."

1. **Leave rev 2 alone in review.** Do not touch the build.
2. Wait for approval, realistically **Sep 11 to Sep 15** (Sep 07 was Labor Day; the queue starts Sep 08).
3. Then upload r4 and set it live on default.
4. Then publish the 26 achievements, tick controller support, delete the false line — one sitting.
5. Launch Sep 18.

**ZERO RISK, DO ANY TIME** (store edits on a live Coming Soon page publish immediately, no review):
- **Switch the release date DISPLAY to the exact date.** With month-and-year, Valve sorts the game
  "as though you had selected the last day of the month" — **Steam is sorting Jimothy as Sep 30**,
  costing Popular Upcoming placement in the real launch week.
- Delete `Mouse and keyboard only; there is no controller support` from Minimum → Additional Notes.
  That one field only.
- Enter the 26 achievements. Defining is app config and touches nothing. **Do not press Publish.**

**RESIDUAL RISK:** nobody documents whether Valve re-checks between approval and release, or what
happens to an in-flight review if the build is replaced mid-pass. Both are unknown in Valve's docs
and in developer reports. The path above avoids needing either answer.

**PART TWO (Flock on Play) is unaffected** and can be done in any order.
