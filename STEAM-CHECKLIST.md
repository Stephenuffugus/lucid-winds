# JIMOTHY → STEAM. One thing at a time.

**Do these in order. Do not skip ahead. Do not read the rest of the repo.**
Each step says who does it and how you know it is finished. If a step is mine,
say "next" and I will do it while you watch.

---

## THE REAL DATE

Sep 1 is gone. The binding clock is **14 days of public Coming Soon**, and that
clock only starts when Valve **approves** the store page, not when you write it.

```
store page submitted        Aug 19   (step 6 below)
Valve approves it           ~Aug 25  (they state 3 to 5 business days)
14 day Coming Soon ends     ~Sep 8
30 day fee clock ended      Aug 29   ✅ already satisfied
        REALISTIC RELEASE   ~Sep 8 to 9
```

Nothing is broken. It is a week later than the old plan, and the old plan assumed
the store page went in on Aug 6. **Every day you delay step 6 moves release by a
day**, so steps 1 to 6 are the only urgent things in this file.

---

# PART ONE — get the store page submitted. Nothing else matters until this is done.

### ☐ 1. YOU · Open Steamworks and look at the price field. Do not change it.
App **5043360** → Store Presence → Pricing.
**Just report what it says.** One of two things is true and they lead to opposite
actions:
- **Nothing set yet** → step 2a
- **$2.99 already set** → step 2b

⛔ Do not raise a price that is already entered. Valve blocks discounting for
**30 days** after any price increase, which would delete your launch discount and
push release to October.

**Done when:** you have told me which it is.

### ☐ 2a. YOU · Nothing was set → enter $4.99, then Generate Suggested Prices
Base **US $4.99**. Click **Generate Suggested Prices** and take Valve's table for
every other currency wholesale. Do not hand-edit regions.
**Done when:** $4.99 is saved and the currency table is filled.

### ☐ 2b. YOU · $2.99 was already set → leave it alone
Keep $2.99. You lose nothing that matters; see step 3.
**Done when:** you have confirmed you changed nothing.

### ☐ 3. YOU · Configure the launch discount
- If you did 2a: **20%**, seven days → sells at **$3.99**
- If you did 2b: **20%**, seven days → sells at **$2.39**

⛔ A launch discount **must be configured before you press Release**. It cannot be
added afterwards, and a new title cannot run any other discount in its first 30
days. This is the one setting in the whole process you genuinely cannot fix later.
**Done when:** the discount shows as scheduled.

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

### ☐ 7. YOU · Upload the build. One command.
```bash
cd store/jimothy-steam
LW_STEAM_USER=<your steamworks login> ./steampipe/upload.sh
```
It re-vendors from the live game and repackages first, so it cannot ship a stale
Jimothy. If it stops and says steamcmd is missing, it prints the exact command to
run.
**Done when:** the upload finishes without an error.

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

**Step 1.** Look at the price field and tell me what it says. Everything else in
Part One follows from that one answer, and step 6 is what starts your clock.
