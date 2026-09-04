# JIMOTHY → STEAM. One thing at a time.

**Do these in order. Do not skip ahead. Do not read the rest of the repo.**
Each step says who does it and how you know it is finished. If a step is mine,
say "next" and I will do it while you watch.

---

## THE REAL DATE

Sep 1 is gone. The binding clock is **14 days of public Coming Soon**, and that
clock only starts when Valve **approves** the store page, not when you write it.

```
store page submitted        the day you finish step 6
Valve approves it           + 3 to 5 business days
14 day Coming Soon ends     + 14 days from THAT approval
30 day fee clock ended      Aug 29   ✅ already satisfied, never the constraint
```
Finish step 6 tomorrow and release lands around **Sep 8 or 9**. Every day step 6
waits moves the release by a day, one for one. It is the only thing in this file
with a clock on it.

Nothing is broken. It is a week later than the old plan, and the old plan assumed
the store page went in on Aug 6. **Every day you delay step 6 moves release by a
day**, so steps 1 to 6 are the only urgent things in this file.

---

# WHEN YOU SIT DOWN, READ ONLY THIS BOX

**There is nothing left to make.** Every asset Steam wants already exists in this
repo. Tonight is pasting and uploading, not creating.

- ⛔ **You do NOT need a demo.** The "Add Demo" button you saw is optional. Ignore it.
- ⛔ **You do NOT need a trailer to submit.** It is a nice-to-have you can add after
  Valve approves the page.
- ✅ **All 5 screenshots exist**, already built, edges already handled (each is the
  real game frame on its own blurred backdrop, never plain black).
- ✅ **All 8 capsules exist**, already at Valve's exact pixel sizes.
- ✅ **Every word of the store page is written** and has been through two
  correction passes.

**Realistic time for steps 1 to 6: 30 to 45 minutes.** That gets the page
submitted, which is the only thing with a clock on it. Steps 7 to 9 (the build)
can be a completely different night.

**If you have 10 minutes and no energy:** do steps 1, 2 and 3 only. Three fields.
They are the only choices in the whole process that cannot be changed later, and
everything after them is mechanical.

**If you have 45 minutes:** do 1 through 6 and stop. Then the clock is running
while you sleep.

⛔ **Do not read anything else in this repo tonight.** Not AUTO-MODE.md, not
HANDOFF.md, not the audit files. They are for other days. This file is the whole
job.

---

# PART ONE — get the store page submitted. Nothing else matters until this is done.

### ☐ 1. YOU · Set the price. $2.99.

**Decided 2026-08-18, Stephen:** *"i still think 2.99 is our best bet i dont think
people would pay 5$ for an AI made game on steam but maybe and 3$ gets it started."*
That is the right read and there is nothing left to weigh here. An AI-disclosed
game at $4.99 from a studio nobody has heard of invites the reaction he has
already had in public; at $2.99 it is an impulse buy nobody argues about.

```
https://partner.steamgames.com/packages/pricing/1748610
```
⛔ The price lives on the STORE PACKAGE (1748610), NOT the app. The old
`apps/pricing/5043360` link dead-ends on an app info page with no price field
(verified the hard way 2026-08-20). If the link above doesn't land on a pricing
form: Steamworks home → **Apps & Packages → All Packages** → click the
**Jumping Jimothy** package → **Edit Pricing**.

Base **US $2.99** → then click **Generate Suggested Prices** and take Valve's table
for every other currency wholesale. Do not hand-edit regions.

⛔ Once this is saved, **do not raise it later**. Valve blocks discounting for 30
days after any price increase, which would delete a launch discount. Lowering is
always allowed.

**Done when:** $2.99 is saved and the currency table is filled.

### ☐ 2. YOU · Configure the launch discount. 20%, seven days.

Same page or **Store Presence → Discounts**. It sells at **$2.39** for the first
week.

Why 20% and not Valve's suggested 10%: at this price the discount is not about the
money, it is 60 cents either way. Its job is the strikethrough on the tile and
getting into the launch and Specials surfaces, and 20% reads as a real discount
where 10% reads as nothing. It is well inside Valve's 40% cap.

⛔ **This must be configured BEFORE you press Release.** It cannot be added
afterwards, and a new title cannot run any other discount in its first 30 days.
This is the one setting in the whole process that genuinely cannot be fixed later.

**The honest number:** after Steam's 30%, $2.39 nets you about **$1.67** a copy,
and $2.99 nets about **$2.09** once the launch week ends.

**Done when:** the discount shows as scheduled.

### ☐ 3. YOU · Set the release date to a date you can actually hit

Use **Sep 9** or later. Sep 1 is not reachable: the 14 day Coming Soon clock only
starts when Valve APPROVES the store page, which is step 6 plus their 3 to 5
business days. A date can be moved later without penalty; a missed one cannot be
un-missed.

**Done when:** a release date is set.

### ☐ 4. YOU · Paste the store page
Everything is written and paste-ready in **`store/jimothy-steam/STORE_PAGE_FILL.md`**.
Work top to bottom. Name, short description, About This Game, tags, genre, system
requirements. **Do not rewrite anything as you paste** — the copy has already been
through two correction passes and every claim in it has been checked against the
code.
**Done when:** every field in that file has been pasted.

_Checked for you 2026-08-18: all ten fields Steam asks for are present in that
file (name, short description, About This Game, tags, genre, system requirements,
legal, release date, developer, publisher), and there are no placeholders or notes
left in the live copy._

### ☐ 5. YOU · Upload the art
All of it already exists in **`store/jimothy-steam/capsules/out/`**. There is more
than one file per slot, so here is the exact list. Upload these twelve and ignore
everything else in that folder.

```
small_capsule_462x174.png          -> Small Capsule
header_capsule_920x430.png         -> Header Capsule
main_capsule_1232x706.png          -> Main Capsule
vertical_capsule_748x896.png       -> Vertical Capsule
library_capsule_600x900.png        -> Library Capsule
library_hero_3840x1240.png         -> Library Hero
library_logo_1280x720.png          -> Library Logo
page_background_1438x810.png       -> Page Background

screenshots/01-rush-hour_1920x1080.png
screenshots/02-pike-market_1920x1080.png
screenshots/03-the-canal_1920x1080.png
screenshots/04-fremont_1920x1080.png
screenshots/05-deep-city_1920x1080.png
```

⛔ Those are the LARGER of each pair. The folder also holds legacy half-size ones
and `_idle` / `_sit` pose variants; none of those go to Steam.
⛔ The Library Hero deliberately has no wordmark on it, because Steam lays the
Library Logo on top. Do not swap in one with the name baked in or it renders twice.

**Done when:** eight capsule slots have an image and there are five screenshots.

### ☐ 6. YOU · Fill the two forms, then submit the page for review
- **AI disclosure** — the honest text is in `STORE_PAGE_FILL.md`. Paste it.
- **Content rating survey** — the answers are in `store/jimothy-steam/CONTENT_RATING.md`
  (17 answers, all written out; you are copying, not deciding).
Then **mark the store page ready for review**.

**Done when:** Steamworks says the page is submitted. ⭐ **This starts the 14 day
clock. It is the single most valuable button in this file.**

---

# PART TWO — the build. Can happen while Valve reviews the page.

### ☐ 7. YOU · Upload the build through the web uploader (Sep 04 2026 revision)
Steam refuses logins from the codespace (datacenter IP, permanent), so `upload.sh`
and steamcmd cannot run from here. The build is a zip you upload in your own browser.

1. Download `jimothy-steam-build-20260904.zip` (350 MB) from
   https://github.com/Stephenuffugus/lucid-winds-vault/releases/tag/vault-20260904
   (log in to GitHub first; the vault is private).
2. Open https://partner.steamgames.com/apps/depotuploads/5043360 and upload the
   zip as-is to depot **5043361**. Do not unzip it: the zip root is the depot
   root, with `Jumping Jimothy.exe` at the top, which is what the launch option
   already saved in step 8 expects.
3. Wait for the page to say the build was processed (it appears under Builds).

The zip was re-vendored Sep 04 from the live game (soda not beer, window title
"Jumping Jimothy", portal music include stripped) and passed
`node scripts/steam_bootprobe.mjs` (commerce dark, zero external requests).
**Done when:** the build shows on the Builds page.

### ☐ 7b. YOU · Achievements (added Sep 04; before the revision 3 build goes live)
Stats & Achievements → Achievements: 26 rows from `store/jimothy-steam/ACHIEVEMENTS.md`
(API names exact, both icons each), Save, **Publish**. Then upload
`jimothy-steam-build-20260904-r3-achievements.zip` from the same vault release, set it
live on default, and tick **Steam Achievements** in Store Presence features.
Revision 2 can go through build review first; later builds need no re-review.
**Done when:** the store page shows "26 achievements" and your first hop pops one.

### ☐ 8. YOU · Point Steam at the exe
Steamworks → **Builds** → set the build live on the **default** branch.
Then **Installation → General** → add a launch option:
executable **`Jumping Jimothy.exe`**, OS **Windows**.
**Done when:** the launch option is saved.

### ☐ 9. YOU · Mark the build ready for review
**Done when:** Steamworks shows the build submitted.

---

# PART THREE — while you wait for Valve. Not blocking.

### ☐ 10. YOU · Play it on your own machine, once, at fullscreen
This is the only thing nobody else can check: **does the game hold 60fps with the
new side art on real hardware?** A headless container cannot tell me what a laptop
does with a blurred full-screen layer.
**Done when:** you have played a few levels maximised and it felt smooth. If it
did not, say so and I will make the bezel static.

### ☐ 11. YOU · Record the trailer
The shot list, timings and captions are already written in `STORE_PAGE_FILL.md`.
A trailer is not required to submit and it is the single biggest thing you can add
to the page afterwards.
**Done when:** uploaded, or consciously skipped for launch.

### ☐ 12. YOU · The skins and poses pass
Your own call, on your own time. It can land **after** submission: Valve expects a
near-final build for review, not a final one, and art updates are just another
SteamPipe upload.

---

# AFTER STEAM. Do not start any of this until Jimothy is submitted.

- ☐ **Play Parallel and Blackout, decide whether to ungate them.** They are the two
  strongest submissions we have for the Listdle directory and they are locked
  behind the dev gate, so nobody can review them. 20 minutes of play decides it.
- ☐ **Send three or four puzzles to Listdle.** The ten candidates are in
  `LISTDLE-QUEUE.md`. Send puzzles only. The three that sank were action games.
- ☐ **Tarot Run playtest.** `satellites/tarot-run/NEXT.md` Part 0 is a checklist of
  one-word verdicts. The game is at build B37 and healthy; it is waiting on taste.
- ☐ **HUNCH's leaderboard is 500ing** and needs your Upstash credentials.
- ☐ Google Play $25 · Apple $99/yr · Pi registration · free Meta developer account.

---

## If you only do one thing today

**Steps 1 to 3.** They are three fields on two pages and they are the only
decisions in the whole process that cannot be changed afterwards. Everything from
step 4 on is copying and pasting from files that are already written.
