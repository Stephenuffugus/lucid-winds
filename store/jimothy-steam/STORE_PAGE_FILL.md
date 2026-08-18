# JUMPING JIMOTHY — Steam store page, field by field

**App 5043360 · depot 5043361 · Sky Wolf Studios · written 2026-08-01**

Everything below is paste ready. Fields are in the order Steamworks presents them.
Nothing here is aspirational: every number was read out of
`satellites/stream-hop/index.html` today, not remembered.

⛔ Two things I changed while writing this, because they would have cost a review
round or a launch day, are recorded at the bottom under **WHAT I FIXED**.

---

# PART 0 — THE DEADLINE, WORKED OUT

## The clocks, and which one actually binds

| Clock | Rule | Where it lands |
|---|---|---|
| **Steam Direct fee** | 30 days from payment before the first product may release | Paid **Thu Jul 30**, so earliest release **Sat Aug 29** |
| **Coming Soon visibility** | 14 days publicly visible, counted from **Valve's approval**, not from when you write it | Approval must land on or before **Tue Aug 18** for a Sep 1 release |
| **Store page review** | Valve states 3 to 5 **business** days | Submit by **Tue Aug 11** at the very latest |
| **Build review** | Separate queue, also 3 to 5 business days | Submit build by **Mon Aug 24** at the very latest |

**The fee clock is not the problem.** Aug 29 is three days before the target and
nothing needs to happen to satisfy it. The binding constraint is the store page
review feeding the 14 day Coming Soon window, and it is tighter than it looks.

## The arithmetic, spelled out

Target release: **Tue Sep 1 2026.**

1. Sep 1 minus 14 days = **Tue Aug 18**. Valve must have **approved** the store
   page by then. Not submitted. Approved.
2. Approval takes 3 to 5 business days. Counting five business days back from
   Aug 18: Aug 17, 14, 13, 12, 11. So the **absolute last submission date is
   Tue Aug 11**, and that assumes it passes first time.
3. A rejection costs another full 3 to 5 business day round. Ten business days
   back from Aug 18 is **Tue Aug 4**. That is the real target: submitting on or
   before **Tue Aug 4** buys exactly one rejection and still ships Sep 1.

Today is Sat Aug 1. Valve does not review at weekends. **The store page has to
go in on Mon Aug 3 or Tue Aug 4.** That is a two day window and it is the whole
schedule.

## The calendar

| Date | Day | What happens | Who |
|---|---|---|---|
| Aug 1 | Sat | Store copy finished, capsules rebuilt at Valve's current sizes (this document) | done |
| Aug 2 | Sun | ✅ DONE (`060618ab`) — five gameplay screenshots off the vendored Steam build live in `capsules/out/screenshots/` | done |
| Aug 3 | Mon | ✅ **DONE. Bank + tax verification is COMPLETE — Stephen has confirmed this repeatedly. Never list it as a blocker again.** | done |
| Aug 3 | Mon | Paste every field below, upload assets, set $2.99 and the launch discount | Stephen, prepped here |
| **Aug 4** | **Tue** | ⭐ **Submit store page for review.** This is the date that buys a rejection round | Stephen |
| Aug 5 to 11 | | Valve store review | Valve |
| ~Aug 7 to 11 | | Approval → Coming Soon goes public → **the 14 day clock starts** and wishlists begin | Valve |
| **Aug 11** | **Tue** | ⛔ Absolute last day a store page submission can still make Sep 1 | |
| Aug 12 to 17 | | Capture and cut the trailer. The page is editable after approval, so the trailer does **not** have to be in the first submission | Stephen |
| **Aug 18** | **Tue** | ⛔ Store page must be **approved** by end of today or Sep 1 is gone | Valve |
| Aug 18 | Tue | `./steampipe/upload.sh`, set build live on default branch, add the launch option, mark ready for review | me |
| Aug 19 to 24 | | Valve build review | Valve |
| **Aug 24** | **Mon** | ⛔ Last safe day to submit the build | |
| Aug 26 | Wed | 14 day Coming Soon clock satisfied if approval landed Aug 12 | |
| Aug 29 | Sat | 30 day fee clock satisfied | |
| Aug 31 | Mon | Financial checklist green, launch discount configured, release date set to Sep 1 | ⛔ Stephen only |
| **Sep 1** | **Tue** | Press **Release App** | ⛔ Stephen only |

**If Aug 4 slips to Aug 11, we ship Sep 1 only if nothing bounces.
If Aug 11 slips at all, the release moves to the following week.** Slipping the
*build* does not move launch as long as it clears before Aug 29.

---

# PART 1 — THE STORE PAGE, FIELD BY FIELD

## 1.1 Basic Info

### Name
```
Jumping Jimothy
```
⛔ Already set at app creation. Do not edit it. The retired name
"Jimothy the Jumping Nugget" stays **only** in `alternateName` on the web page's
schema and in the web `<meta keywords>`; it is stripped out of the Steam build by
`vendor.sh` and must never appear in a Steam field.

### Developer
```
Sky Wolf Studios
```

### Publisher
```
Sky Wolf Studios
```

### Franchise
Leave blank. A one game franchise reads as padding.

### Website
```
https://lucidwinds.com/jimothy/
```

### Support / contact
Steamworks asks for a support URL or email. Use the Steam Community Discussions
hub for the app (tick "Use Steam Discussions"). Reason: the in game bug form is
switched **off** in storefront builds, Discussions notifies Stephen, and it means
no third party support surface has to be maintained or disclosed.

### Release date
- Actual planned release date: **September 1, 2026**
- Display as: **`September 2026`** until the store page is approved, then tighten
  to the exact date once the 14 day clock is provably satisfied.

Why: an exact date on an unapproved page is a promise made before the only
approval that could break it. Wishlisters get a "delayed" notice if it moves, and
that notice is the worst email a 200 wishlist game can send. Loosen it now,
tighten it Aug 18.

### Early Access
**No.** The game is finished. Do not tick it.

---

## 1.2 Short Description (Valve cap: 300 characters)

**Use this (291 characters):**

```
Hop Seattle's roundest raccoon across rainy traffic, floating dumpster lids and diving gulls. 100 fixed levels across ten chapters, five ways to play, and 45 critters and costumes to unlock. Plus one Daily course a day, the same road for everyone. Everything is included and it runs offline.
```

**Shorter alternative (226 characters), if you want it to read faster:**

```
A rainy city hopper about a very round raccoon. Cross traffic and canals through 100 fixed levels, bank your Feast Trail for a big score, and unlock 45 critters and costumes. One Daily course a day, the same road for everyone.
```

### What I changed from `marketing/steam-jimothy.md`, and why

The old short description was:

> Hop Seattle's roundest and most beloved raccoon across rainy streets, rooftops,
> and the canal. Grab every bottlecap, dodge the ferries and the gulls, and lead
> Jimothy to the greatest dumpster feast in town.

Three problems, all of them cost sales:

1. **It never says what kind of game it is.** A shopper reading a search result
   has about six words of attention. "Hop ... across rainy streets" could be a
   walking sim. The rewrite front loads the verb and the obstacle so the genre is
   unmistakable before the raccoon is.
2. **"rooftops" is not in the game.** The six backdrops are the Waterfront, Pike
   Market, Fremont, Capitol Hill, Interbay and Ballard Locks. There is no rooftop
   content anywhere. A player who buys for rooftops writes a refund.
3. **It listed no reason to come back.** The Daily and the 45 characters are the
   retention hooks and neither was mentioned. On a $2.99 game the short
   description is the entire pitch.

I also cut "and most beloved" (it is the title screen ribbon's job, not the
store's) and added "runs offline / everything included", which is the single
strongest differentiator against every other $2.99 casual game on Steam.

---

## 1.3 About This Game (Steam BBCode, paste as is)

```
[h2]Jimothy is a very round raccoon with a very long way to go.[/h2]
Seattle is wet, the traffic does not care, and the greatest dumpster feast in town is a hundred levels away. Hop him across the streets, ride a dumpster lid down the canal, grab every bottlecap you can reach, and get him there.

Every clean hop forward grows your [b]Feast Trail[/b]. Reach a safe curb and it banks for a big score. One bad hop and the trail is gone. That is the whole game, and it is the reason a two minute run keeps mattering.

[hr][/hr]
[h2]Five ways to play[/h2]
[list]
[*][b]Adventure.[/b] 100 levels across ten Seattle chapters, from Pike Place to Downtown at Dusk. Three stars on every level: finish it, hit its feast goal, clear out its bottlecaps.
[*][b]Daily.[/b] One course a day, the same road for every player in the world, and your first run of the day is the one that counts. No continues, no second attempt, no way to farm it. Play it again as much as you like for practice.
[*][b]Endless.[/b] No finish line. The deep end keeps deepening.
[*][b]Rush.[/b] Sixty seconds. Nothing chases you. The clock is the pressure.
[*][b]Zen.[/b] No street sweeper, no ramp, no rush. It never speeds up. Some evenings that is the point.
[/list]

[hr][/hr]
[h2]A hundred levels that stay put[/h2]
Every Adventure level is a fixed course. Level 47 is the same road on your first attempt and your fortieth, so a level you keep failing is a level you can learn, not a slot machine you keep pulling.

[list]
[*][b]Every fifth level is a twist:[/b] Rush Hour, Steam Night, Gull Swarm.
[*][b]Every tenth level is a proper set piece:[/b] Storm Watch, Ferry Crossing, Rail Yard, Blackout.
[*][b]Every twenty fifth level lends you somebody else's whiskers.[/b] You play it as a critter you do not own yet. You give it back at the end.
[*][b]Level 100 is the feast.[/b] The road does not stop there. The last three chapters keep cycling and the difficulty keeps creeping, so there is always a further out you have not seen.
[/list]

[hr][/hr]
[h2]Forty five to play as[/h2]
[list]
[*][b]Twelve Seattle critters[/b] out of the Prize Bin, bought with bottlecaps you found in the road. The bin never hands you the same one twice.
[*][b]Fourteen costumes[/b], included from the start in this version, because you already bought the game.
[*][b]Ten you cannot buy at any price[/b], handed to you as you clear the campaign, one every ten levels from ten to a hundred.
[*][b]Seven found out on the street[/b]. Nobody will tell you how. One of them takes all eight hidden Seattle landmarks.
[*][b]One that only a code opens.[/b] Unlock codes go out in posts and videos and to the people who helped make this. They work offline in this version too.
[*][b]And Jimothy[/b], who you start with.
[/list]

[hr][/hr]
[h2]The rest of it[/h2]
[list]
[*][b]Nine power ups[/b] on the safe rows: Coffee, Double Shot, Umbrella, Snacks, Walk Signal, Hi Vis Vest, Rain Boots, Street Lamp, Salmon Dinner.
[*][b]Eight hidden Seattle landmarks[/b] to find, from Rachel the Pig to the Gum Wall.
[*][b]Twenty six badges[/b], five of which can only be earned in the season they belong to.
[*][b]Weather that turns mid run.[/b] Rain, fog, and the gull that has been waiting for the fog.
[*][b]Seven original songs[/b], earned as you play.
[/list]

[hr][/hr]
[h2]What this version is[/h2]
[list]
[*][b]Everything is included.[/b] No downloadable content, no in game purchases, no currency to buy. The costume pack that is sold elsewhere is simply yours here.
[*][b]No account and no internet.[/b] It never connects to anything. Your bottlecaps, costumes and streaks live on your machine.
[*][b]It runs in a portrait window[/b], because that is the shape it was built in and stretching it would ruin it.
[*][b]About the art.[/b] The artwork was pre generated with AI tools, then cut, curated and animated by the developer. Nothing is generated while you play.
[/list]
```

**If you upload the two optional extra images** (see the asset manifest), insert
these two lines where marked. If you do not upload them, leave them out; a broken
`[img]` renders as raw text and looks terrible.

```
[img]{STEAM_APP_IMAGE}/extras/five-modes-616.png[/img]
[img]{STEAM_APP_IMAGE}/extras/the-cast-616.png[/img]
```
- `five-modes-616.png` goes directly under the `[h2]Five ways to play[/h2]` line.
- `the-cast-616.png` goes directly under the `[h2]Forty five to play as[/h2]` line.

### What I changed from the old About copy, and why

| Old line | Problem | Fix |
|---|---|---|
| "Hop lane by lane through a hand built city" | **Two separate lies.** The art is generated, so "hand built" is exactly the claim this audience punishes. And the levels are not hand authored either; they are deterministically generated from a per level seed. | Dropped entirely. Replaced with the claim that is both true and better: *the levels are fixed, so a level you keep failing is a level you can learn.* That is a real design decision and it sells harder than "hand built" ever would. |
| "100 fixed levels through ten Seattle neighborhoods ... (course v2; adjust count if shipped different)" | A **parenthetical note to ourselves** left inside paste ready copy. It shipped once and Valve would have seen it. | Verified against `DECADES` and `DEC_LEN`: ten chapters of ten. Note removed, number confirmed. |
| "45 costumes to pull from the Prize Bin, plus secret critters for true collectors" | **Wrong.** 45 is the whole cast. Only 12 are in the bin. | Broken out by lane, with the honest count for each. Reads richer *and* is true. |
| "Five you cannot buy at any price, earned one at a time for showing up seven days in a row" | **Wrong as of 2026-08-18, and it was the copy's fault second.** The build changed: a bought game no longer gates costumes behind a calendar, so those five plus five of the six code ones are on a campaign ladder now. The page was advertising a seven day return grind the build does not have. It also said **six** secrets where the code has **seven**. | *Ten you cannot buy at any price, handed to you as you clear the campaign, one every ten levels from ten to a hundred*, seven secrets, and one code only. Derived from `CHARS` by parsing it, not counting by eye: 1 starter + 12 bin + 14 pack + 10 ladder + 7 secret + 1 code = 45. |
| "A Daily run shared by every player in the world. One try counts." | Right, but it buried the interesting part. | Kept and expanded: *your first run of the day is the one that counts.* That rule is the reason the Daily is worth anything and it is a genuinely good hook. |
| No mention of Endless, Rush or Zen | Three of the five modes were invisible. | All five listed with one line each. |
| No mention of what a Steam player gets that a web player does not | This is a $2.99 purchase competing against a free web version. | "Everything is included / no account / no internet" is now its own section. It is the strongest argument on the page. |
| "Kind to your time. A run takes two minutes. The feast takes a lifetime." | Nice line, but it is a closing line for a trailer, not a features bullet. | Moved out. Use it as the trailer's final card (see the timing sheet). |

Everything else that is new was verified in code today: nine power ups from
`POWER_META`, eight landmarks from `EGGS`, 26 badges from `ACH` plus `SEASONS`,
seven songs from `MUSIC`, six backdrops from `ZONES`, borrowed whiskers from
`borrowedFor()`, the feast at level 100 from `grantDecadeRewards()`.

---

## 1.4 Legal / Copyright and Trademark notice

```
Copyright 2026 Sky Wolf Studios. Jumping Jimothy is a trademark of Sky Wolf Studios. This product includes software from the Electron and Chromium projects; their licences are included with the game. Typefaces used under the SIL Open Font License.
```

⛔ Do not write "All rights reserved. All trademarks are property of their
respective owners in the US and other countries." That boilerplate is for
publishers with third party marks on the page. There are none here, and the
sentence invites the question of whose marks you mean.

---

## 1.5 System Requirements — Windows only

The build is Electron 32 packaged as `dir` (win-unpacked), 493 MB on disk, 64 bit
only. Electron 32 does not support Windows 7, 8 or 8.1, so **Windows 10 is a hard
floor**, not a preference.

### Minimum

| Field | Value |
|---|---|
| OS | Windows 10 64-bit, version 1809 or later |
| Processor | Any 64-bit dual core, 2.0 GHz |
| Memory | 4 GB RAM |
| Graphics | Any GPU with hardware acceleration, including integrated |
| DirectX | Version 11 |
| Network | Not required. The game never connects to the internet |
| Storage | 700 MB available space |
| Sound Card | Any |
| Additional Notes | Plays entirely offline with no account. The game runs in a portrait window and sizes itself to your desktop, so a display at least 800 pixels tall is recommended. Mouse and keyboard only; there is no controller support. |

### Recommended

| Field | Value |
|---|---|
| OS | Windows 11 64-bit |
| Processor | Any 64-bit quad core, 2.5 GHz |
| Memory | 8 GB RAM |
| Graphics | Any dedicated GPU, or modern integrated graphics |
| DirectX | Version 12 |
| Network | Not required |
| Storage | 1 GB available space |
| Sound Card | Any |
| Additional Notes | A display 1136 pixels tall or more shows the game at its full native size without scaling. |

⛔ **Do not fill in macOS or SteamOS.** `package.json` has a `dist:mac` target but
no mac build has ever been produced, notarised or tested. Ticking an OS you have
not shipped is a build review rejection, and it is one of the more common ones.

**Steam Deck:** leave the compatibility rating alone. Valve assigns it. A portrait
window on a 16:10 landscape handheld will almost certainly come back "Unsupported"
or "Playable", and that is fine; do not claim Verified.

---

## 1.6 Genres

| Slot | Value |
|---|---|
| Primary | **Casual** |
| Additional | **Indie** |
| Additional | **Action** |

Casual primary because the tag and the genre must agree or Valve's discovery
queue sends the page to the wrong shelf. A two minute hopper filed under Action
lands next to shooters and dies there.

---

## 1.7 Tags (ranked; Valve takes up to 20, the first ones weigh most)

Paste in exactly this order:

```
1.  Casual
2.  Arcade
3.  Cute
4.  Score Attack
5.  Singleplayer
6.  2D
7.  Family Friendly
8.  Indie
9.  Colorful
10. Difficult
11. Replay Value
12. Funny
13. Top-Down
14. Runner
15. Stylized
16. Short
17. Action
18. Atmospheric
19. Character Customization
20. Old School
```

### Why the top five are those

1. **Casual** — the largest bucket that honestly describes the game, and the one
   that matches the primary genre. Tag and genre agreeing is what Valve's
   discovery queue actually keys on; disagreeing quietly halves the impressions.
2. **Arcade** — the one word that tells a browsing player "one input, one life,
   one number" before they read a sentence. It is also the tag most co-visited
   with the games this belongs next to, so it is the cheapest route into the
   "More Like This" rail of titles ten times its size.
3. **Cute** — the raccoon is the pitch. At 462x174 the face is doing all the
   selling and nothing else survives, so the tag that puts the page in front of
   people already shopping for that face is worth more than any genre word.
4. **Score Attack** — separates it from the drifting, no-fail end of Casual and
   promises the Daily and Endless loop. This is the tag that brings back the
   people who will play it more than once, which is the only kind of buyer a
   $2.99 game can afford to chase.
5. **Singleplayer** — there is no online anything: no accounts, no leaderboards,
   no cloud. Saying so in the top five heads off the one star review that begins
   "I thought the Daily had a leaderboard".

### ⛔ Tags that must never go on this page

**Frogger. Crossy Road.** Both are still sitting in the web page's `<meta
keywords>` for search engine purposes, `vendor.sh` strips them out of the Steam
build, and `preflight.js` warns about them every run. They are other companies'
trademarks. In prose on a blog they are fair comparison; as a Steam tag or
anywhere on the store page they are a takedown request with your app id on it.

Also skip **Pixel Graphics** (the art is illustrated, not pixel art) and anything
implying multiplayer, controller support or achievements.

---

## 1.8 Categories (Steamworks features)

Tick **only** these:

| Category | Tick? | Why |
|---|---|---|
| Single-player | ✅ | True |
| Family Sharing | ✅ | Free to enable, costs nothing, and it is how a $2.99 game gets into a second household |

Leave **unticked**, every one of them:

| Category | Why not |
|---|---|
| Steam Achievements | The game has 26 internal badges, but the Steamworks SDK is not in the Electron build at all. Ticking this without implementing it is an instant build review rejection. |
| Steam Cloud | Cloud sync is deliberately short circuited in the desktop build. Saves are local. |
| Steam Leaderboards | Not implemented. |
| Full or Partial Controller Support | There is no `getGamepads` call anywhere in the game. Input is pointer and keyboard only. |
| Steam Trading Cards | Not available to new titles at launch regardless. |
| Multi-player / Co-op / PvP | None of it exists. |
| Steam Workshop, Remote Play, VR | None of it exists. |

⛔ Achievements are the one worth wanting. They are a real conversion lever and
the game already has the 26 badge list to map onto. But wiring Steamworks into
Electron is a week of work and it is **not** worth moving Sep 1 for. Ship, then
add them in a 1.1 update, which also gives you a reason to be seen again.

---

## 1.9 Supported Languages

| Language | Interface | Full Audio | Subtitles |
|---|---|---|---|
| English | ✅ | ☐ | ☐ |

Leave Full Audio and Subtitles unticked. There is no spoken dialogue anywhere in
the game; the audio is music and sound effects, which are language free. Ticking
"Full Audio" for a game with no voice is technically a false claim and it costs
you nothing to leave it off.

Nothing else is translated. Do not tick a language you have not shipped strings
for; it is the second most common store page rejection after platform claims.

---

## 1.10 Pricing

| Field | Value |
|---|---|
| Base price | **US $2.99** (ratified by Stephen 2026-07-31) |
| Other currencies | Click **Generate Suggested Prices** and take Valve's table wholesale |
| Launch discount | **20%**, seven days, giving **$2.39** (raised from 10% on 2026-08-18: at this price the discount is not about the money, it is 60 cents either way, it is about the strikethrough on the tile and the launch surfaces, and 10% reads as nothing) |

⛔ Two rules that bite:

1. **A launch discount must be configured before you press Release.** It cannot be
   added afterwards, and a new title cannot run any other discount for its first
   30 days. If it is not set on Aug 31 it does not exist.
2. **Do not hand type regional prices.** Valve's suggested table accounts for
   local purchasing power and tax handling; typing your own is how a game ends up
   at an absurd price in Turkey and gets region locked by Valve.

At $2.99 the discount is worth 30 cents, which is not the point. The point is the
green discount flag in every listing and the eligibility for the front page "New
and Trending" discount rails during launch week. Take it.

---

## 1.11 Content Survey and Age Rating

⛔ **Stephen has to submit this himself.** It is a legal attestation about the
product made under the account that owns the app. The full reasoning is in
`store/jimothy-steam/CONTENT_RATING.md`; the answers are reproduced here so this
document is complete.

| Question | Answer |
|---|---|
| Violence | **Yes, mild and cartoon.** Jimothy is bumped by traffic and tumbles over. Slapstick. No weapons, no combat, no injury shown. |
| Blood | No |
| Gore or dismemberment | No |
| Sexual content or nudity | No |
| Profanity or crude humour | No |
| Alcohol, tobacco, drugs | **Yes, one incidental reference.** See below. |
| Gambling | **No.** See below. |
| In-game purchases | **No.** All commerce surfaces are dark in the Steam build and the costume pack is granted at install. There is nothing to buy. |
| User-generated content | No |
| Online, multiplayer or player interaction | No |
| Does the game collect user data? | **No.** Boot diagnostics, the bug form and the redeem ping are all switched off in storefront builds. Proven by driving the build with a seeded crashed boot and logging zero outbound requests. |
| Horror or fear | No |

**Expected rating:** Everyone / PEGI 3 / ESRB E.

**Because no data is collected, no privacy policy is required on the store page.**
That removes an entire category of review friction. Do not add one.

### The alcohol answer, in the box if there is one
```
A single hidden collectible is a discarded beverage can tab found as street litter. No consumption is depicted anywhere in the game.
```
The collectible is "A Rainier Tallboy Tab", one of eight Seattle landmarks
alongside Rachel the Pig and the Gum Wall.

⚖️ **One call for Stephen, not a blocker:** "Rainier" is a real beer brand as well
as a mountain. Renaming it **"A Tallboy Tab"** loses nothing and takes a live
commercial brand name out of a product you are selling. Your writing, your call.
I have not touched it.

### The gambling answer, if they follow up
The Prize Bin takes bottlecaps earned by playing and returns a critter you do not
own. No real money is involved at any point, you cannot lose (duplicates are
impossible by construction, so there is no losing outcome to chase), and the price
is printed on the button. If a separate box asks about **randomised in-game
rewards**, answer yes to that and no to gambling. They are different questions and
conflating them is what causes the follow up email.

---

## 1.12 AI Content Disclosure (separate Valve form, required)

**Pre-Generated content: YES.** Paste:

```
The artwork in this game was pre generated with AI tools, then cut, curated, corrected and animated by the developer before it shipped. This covers the character art, the city backdrops, the item and badge icons, and the store capsules. All code, level design, music and written text are the developer's own. No third party artwork was used as a source.
```

**Live-Generated content: NO.** Paste:

```
The game generates no content with AI at runtime. It ships with every asset on disk, makes no network requests of any kind, and has no connection to any AI service.
```

Valve renders this as an "AI Generated Content Disclosure" box on the live store
page automatically. That is why the About This Game text above carries a short
version of the same statement rather than staying quiet about it: the box appears
either way, and the page reads far better when the developer said it first.

---

# PART 2 — THE COMING SOON PAGE

The Coming Soon page is the same store page with the release date in the future,
so it uses the same fields. What changes is **emphasis**: there is no gameplay a
visitor can verify, no reviews, and exactly one action available, which is
Wishlist. Copy that reads like a manual is wasted here.

**During the Coming Soon window only**, replace the About This Game body with
this shorter version. Swap the full version back in on release day.

```
[h2]Jimothy is a very round raccoon with a very long way to go.[/h2]
Seattle is wet, the traffic does not care, and the greatest dumpster feast in town is a hundred levels away.

Hop him across the streets. Ride a dumpster lid down the canal. Grab every bottlecap you can reach. Every clean hop forward grows your [b]Feast Trail[/b], reaching a safe curb banks it for a big score, and one bad hop takes the lot.

[hr][/hr]
[h2]In the box[/h2]
[list]
[*][b]100 levels[/b] across ten Seattle chapters, and every one of them is a fixed course. A level you keep failing is a level you can learn.
[*][b]A Daily[/b] course, the same road for every player in the world, and your first run of the day is the one that counts.
[*][b]Endless, Rush and Zen[/b] for when you have two minutes, sixty seconds, or nothing in particular to prove.
[*][b]45 critters and costumes[/b] to unlock, and eight hidden Seattle landmarks to find.
[*][b]No account, no internet, no in game purchases.[/b] Everything is included and it all lives on your machine.
[/list]

[hr][/hr]
[b]Out September 2026. Wishlist it and Steam will tell you the day it lands.[/b]

[i]The artwork in this game was pre generated with AI tools, then cut, curated and animated by the developer. Nothing is generated while you play.[/i]
```

### Coming Soon checklist
- Short description: **unchanged**. It is the one field that appears in wishlist
  emails and in the "Upcoming" rails, so it should be final from day one.
- Release date display: **`September 2026`**.
- Minimum assets for approval: all capsules, library assets, **and at least five
  screenshots**. A trailer is not required for approval and can be added the day
  after. Do not hold the Aug 4 submission for the trailer.
- Do not write "Coming Soon" or a date into any capsule image. Valve rejects
  capsules with dates, prices, review quotes or award badges baked in.

---

# PART 3 — ASSET MANIFEST

## 3.1 What Valve requires, and what exists right now

All paths are relative to `/workspaces/lucid-winds/store/jimothy-steam/capsules/out/`.

| Asset | Exact size | Status | File |
|---|---|---|---|
| **Small capsule** | **462 x 174** | ✅ built today | `small_capsule_462x174.png` |
| **Header capsule** | **920 x 430** | ✅ built today | `header_capsule_920x430.png` |
| **Main capsule** | **1232 x 706** | ✅ built today | `main_capsule_1232x706.png` |
| **Vertical capsule** | **748 x 896** | ✅ built today | `vertical_capsule_748x896.png` |
| Page background | 1438 x 810 | ✅ exists | `page_background_1438x810.png` |
| Library capsule | 600 x 900 | ✅ exists | `library_capsule_600x900.png` |
| Library hero | 3840 x 1240 | ✅ exists | `library_hero_3840x1240.png` |
| Library logo | 1280 x 720, **RGBA** | ✅ exists, real alpha | `library_logo_1280x720.png` |
| **Screenshots (min 5)** | 1920 x 1080 | ✅ **done** (`060618ab`, five gameplay shots in `out/screenshots/`) | 3.3 is history |
| Trailer | 1920 x 1080 MP4 | ⛔ **missing** | see Part 4 |
| Trailer poster frame | 1920 x 1080 | ⛔ **missing** | one still from the trailer |
| Microtrailer (optional) | 1920 x 1080, 6 sec | ⛔ missing | see Part 4 |
| Extra images for About (optional) | 616 wide | ⛔ missing | see 3.4 |
| Windows `.ico` for the exe | 256 x 256 | ⛔ missing, cosmetic | see 3.5 |

⛔ **The legacy half size files are still in `out/` and must NOT be uploaded.**
`small_capsule_231x87.png`, `header_capsule_460x215.png`,
`main_capsule_616x353.png`, `vertical_capsule_374x448.png` and every `_idle` /
`_sit` variant are half resolution or alternate poses. **Upload only the four
files in bold above.** Filenames carry their dimensions, so match the number
Steamworks prints next to each upload slot and you cannot get it wrong.

## 3.2 What has to be legible at the smallest rendered size

The small capsule is the one Valve weights hardest because it appears in search,
in recommendations, in the wishlist list and in every "More like this" rail.
**Two things survive it and nothing else: the wordmark and the raccoon's face.**

The current small capsule passes: "JUMPING / Jimothy" sits at roughly 41px cap
height with the face at full frame height on the right. The tagline "The Little
Nugget" is correctly **omitted** at that size, and it should stay omitted.

⛔ Valve's capsule rules that this set complies with, and must keep complying with
if anyone re-cuts them:
- The game's **full name** must be legible. Not a shortened version.
- No review quotes, no award laurels, no discount flashes, no "Coming Soon",
  no dates, no prices, no platform logos.
- No text near the edges; Steam crops capsules at several aspect ratios.

## 3.3 ⛔ The five screenshots in the repo cannot be uploaded

`out/screenshots/` has five 1920x1080 files that pass every mechanical check in
`preflight.js`. Three of them are disqualified for reasons a dimension check
cannot see. I opened all five.

| File | Verdict |
|---|---|
| `01-rush-hour` | Usable as a reference for composition. Reshoot anyway (see below). |
| `02-the-canal` | Same. |
| `03-deep-city` | Same. |
| `04-prize-bin` | ⛔ **Disqualified.** The harness called `SH_DEV.show('s-skins')`, which reveals the screen without running its render pass. The result is an **unrendered menu**: "0 bottlecaps", every row empty, and a "Colours" section that was **retired from the game on 2026-07-24** and is hidden at runtime. It also shows a **`$3` purchase button** and a tofu box where an emoji should be. A Steam screenshot advertising a non-Steam purchase and a dead feature is a review problem, not just an ugly one. |
| `05-the-street` | ⛔ **Disqualified.** It is the **web build's** title screen. It shows a **"Sign in"** button and a **"Support the Studio"** button, both of which are hidden in the Steam build. It misrepresents the product being sold. |

**All three usable shots also have a common weakness:** the portrait game frame is
about 570 pixels wide inside a 1920 pixel canvas, so roughly 70% of every
screenshot is blurred backdrop. In the store gallery those render at about 600
pixels wide, meaning the actual game occupies around 180 pixels. Nobody can see
what is happening.

**The fix, and it applies to all eight new shots:** keep the real game frame at
its true aspect ratio (never stretch it), but put something in the dead space.
A dark caption panel on the left with a five word line, set in the game's own
Fredoka, at about 60px. That turns two thirds of wasted canvas into the thing
Valve's gallery is actually good at, which is reading captions at a glance. It
also solves the muted autoplay problem in the trailer the same way.

⛔ And capture from **`store/jimothy-steam/app/index.html`** (run `./vendor.sh`
first), never from `satellites/stream-hop/index.html`. The vendored copy is the
one with `__STEAM_BUILD` set, which is the only one that shows what a buyer gets.

## 3.4 Optional extra images for the About section

Steam's About column is 616 pixels wide. Two strips would earn their space:

| File | Size | Content |
|---|---|---|
| `five-modes-616.png` | 616 x 260 | Five small panels, one per mode, each with its mode icon from `assets/ui/` and its one line description. |
| `the-cast-616.png` | 616 x 400 | A contact sheet of all 45 characters at small size. This is the single most convincing image on the page for a collector, and every sprite already exists. |

Both are buildable from existing art with a puppeteer script in the same shape as
`capsules/build.js`. Neither blocks the Aug 4 submission.

## 3.5 The Windows icon (cosmetic, not a store asset)

The packaged exe has **no embedded icon and no version metadata**. Steam shows
your capsule art everywhere a player looks, so this only surfaces in the Windows
taskbar and on the raw exe, where it renders as the default Electron atom.

Fixing it needs `rcedit`, which needs wine, which this Linux box does not have,
and it needs a 256x256 `.ico` that does not exist yet. **Not a launch blocker.**
Either add the `.ico` to the art list and run `npm run dist:win` once on a Windows
machine, or ship without it and fix it in 1.1.

The exe is also **not code signed**. Steam does not require it. Unsigned means
Windows SmartScreen may warn on a first launch **outside** Steam. A certificate is
a few hundred dollars a year. Revisit only if players report warnings.

---

# PART 4 — SHOT LIST

Stephen said he can take his time capturing footage. Good, because the difference
between a $2.99 game that sells 200 copies and one that sells 2000 is almost
entirely the first screenshot and the first four seconds of the trailer.

**Capture rig, for all of it:**
- Play the **vendored Steam build** (`./vendor.sh` then `npm start`), not the web
  version. The web version shows Sign in and Support buttons that a buyer will
  never see.
- Native window, no scaling. 640x1136 or as close as the desktop allows.
- Screen shake **on**, colourblind cues **off** (default state).
- Play for real. Every shot below is a moment, not a pose, and a real near miss
  looks different from a staged one.

## 4.1 The five screenshots, in upload order

Steam renders screenshot #1 largest and it is the one that shows in the hover
preview from a search result. Order is not cosmetic.

### Shot 1 — "The near miss"
- **Where:** Adventure, Capitol Hill chapter, around level 55. Rain falling.
- **On screen:** Jimothy mid hop between two moving vehicles with maybe half a
  lane of clearance either side. Feast Trail counter reading **12 or higher** in
  the top right. Bottlecaps visible one row ahead. Street sweeper glow just
  entering frame at the bottom.
- **Player is doing:** committing to a gap that has not closed yet.
- **Caption panel:** `ONE BAD HOP AND THE TRAIL IS GONE`
- **Why it sells:** it is the only screenshot that shows *tension*. Every other
  hopper screenshot on Steam is a static grid of lanes. This one has a verb in it.

### Shot 2 — "Ferry Crossing"
- **Where:** Adventure, a level 20 / 40 / 50 capstone with `cap:'sound'`.
- **On screen:** Jimothy riding a ferry pad across open water, three lanes of
  water above and below him, gulls in the sky, the level banner **FERRY CROSSING**
  still fading. Ballard Locks or Waterfront palette.
- **Player is doing:** waiting on a moving platform, which is the only calm the
  game offers.
- **Caption panel:** `SOME LEVELS YOU CROSS. SOME YOU RIDE.`
- **Why it sells:** it proves the game is not one screen repeated. The set piece
  levels are the single biggest thing the old store copy failed to mention.

### Shot 3 — "Blackout"
- **Where:** Adventure level 100, Downtown at Dusk, `cap:'blackout'`. Thick fog.
- **On screen:** the **Street Lamp** power up active, its light cone burning a
  hole in the fog, everything outside it near black. Jimothy small and lit.
- **Player is doing:** using a power up to see, not to go faster.
- **Caption panel:** `THE FOG IS NOT DECORATION`
- **Why it sells:** it is the best looking frame the game can produce and it is
  the "there is more here than I thought" shot. It also quietly answers the
  question every browsing player asks about a cute game, which is whether it
  gets hard.

### Shot 4 — "A hundred levels"
- **Where:** the Adventure level select map, scrolled to show three chapter
  headers at once and a mix of one, two and three star levels, with the star
  total pill visible top right.
- **On screen:** chapter names readable (Pike Place, West Seattle, SoDo), locked
  levels below the played ones.
- **Player is doing:** choosing.
- **Caption panel:** `100 LEVELS. THREE STARS EACH. EVERY ONE THE SAME ROAD EVERY TIME.`
- **Why it sells:** it is the content shot. It converts "cute two minute game"
  into "there is a lot of this", which is the entire justification for $2.99.

### Shot 5 — "The cast"
- **Where:** Prize Bin → **Collection** tab, scrolled so the Costumes and
  Critters rows are both visible and mostly **unlocked**.
- **On screen:** as many of the 45 as fit, in colour, with the section counters
  showing real numbers.
- **Player is doing:** browsing what they own.
- **Caption panel:** `45 TO PLAY AS. THE COSTUME PACK IS ALREADY YOURS.`
- **Why it sells:** collectors buy on this shot alone. And it is where the "you
  are not being sold anything else" promise becomes visible instead of claimed.
- ⛔ **Collection tab, not Shop.** The Shop tab shows prices. Use the tab that
  shows the wardrobe.

## 4.2 Three more, worth uploading (Valve allows 20)

6. **The Daily result card**, showing the coloured block strip, the day number
   and the streak. Caption: `ONE COURSE A DAY. THE SAME ROAD FOR EVERYONE.`
7. **A level complete screen** with three stars lit and the chapter clear bonus
   floating. Caption: `WORK A LEVEL OVER AND IT SHOWS.`
8. **A Gull Swarm level mid dive**, birds coming down at an angle. Caption:
   `THE GULLS HAVE BEEN WAITING FOR THE FOG.`

## 4.3 The trailer — shot by shot timing sheet

**Encoding:** 1920x1080, H.264 MP4, 30fps, AAC stereo, target under 40 MB.
Upload a **1920x1080 poster frame** with it (use the 0:07 frame).

**⛔ Valve autoplays the trailer MUTED on the store page.** Whatever the music is
doing, the first person to see this hears nothing. Every beat below therefore
carries its meaning in the picture or in a caption, and the music is a bonus for
the people who unmute. This is why there is no voiceover and no "sound on"
gimmick: the panel space either side of the portrait frame is the audio track.

**Layout for the whole trailer:** the game frame stays centred at true aspect
ratio, full height, never stretched. The left panel carries the captions. The
right panel carries the blurred city backdrop. Do not letterbox with black bars;
black bars read as a phone video someone forgot to crop.

| Time | Length | What is on screen | Caption panel | Why |
|---|---|---|---|---|
| 0:00 | 3s | **Cold open, no logo.** Gameplay already running: Jimothy mid hop in Pike Place rain, a truck passing a body width away. | *(none for the first second, then)* `SEATTLE'S ROUNDEST RACCOON` | The first three seconds decide whether anyone watches the rest. A logo card there is three seconds spent on something they already saw in the capsule above the video. |
| 0:03 | 4s | Four fast cuts, roughly one second each, of the same hop in four different chapters: Pike Place, Fremont, Interbay, Ballard Locks. | `TEN CHAPTERS` | Establishes visual variety before anyone can wonder about it. |
| 0:07 | 4s | Hold on a clean run: Feast Trail counter climbing 6, 9, 14. Then a bank at a safe curb, the score fanfare, the number jumping. **This frame is the poster frame.** | `EVERY CLEAN HOP GROWS THE TRAIL` | The core loop, shown rather than described. |
| 0:11 | 2s | The same run, one hop later, ends under a truck. Trail counter snaps to zero. Death card reads SWEPT UP or WASHED OUT. | `ONE BAD HOP TAKES IT ALL` | The stakes. Two seconds is exactly long enough to sting and not long enough to feel like a fail reel. |
| 0:13 | 6s | Set piece montage, roughly 1.5s each: **Ferry Crossing** (riding the pad), **Storm Watch** (rain and chop), **Gull Swarm** (birds diving), **Blackout** (Street Lamp cone in fog). | `EVERY TENTH LEVEL IS A SET PIECE` | The single strongest "there is more here" beat. This is where a viewer decides it is not a one screen game. |
| 0:19 | 4s | Power up grabs cut tight: Coffee dash blur, Hi Vis Vest walking through traffic untouched, Rain Boots crossing water on foot, Salmon Dinner banking the trail. | `NINE POWER UPS` | Shows the game has verbs beyond "hop". |
| 0:23 | 4s | The level select map scrolling down through chapter after chapter, stars filling in. Ends on level 100. | `100 LEVELS` → `AND IT DOES NOT STOP THERE` | The content beat. Scroll it slowly enough to read three chapter names. |
| 0:27 | 5s | Collection screen, costumes and critters filling the grid. Then three quick in game cuts of the **same level played as three different characters** (a critter, a costume, a secret). | `45 TO PLAY AS` | Proves the wardrobe is real and playable, not a menu. |
| 0:32 | 4s | Daily result card drawing its coloured block strip, day number, streak counter ticking up. | `ONE COURSE A DAY, THE SAME ROAD FOR EVERYONE` | The retention hook, and the only line that implies other players exist. |
| 0:36 | 3s | Level 100. The feast. Whatever the celebration looks like on screen. | `THE GREATEST DUMPSTER FEAST IN TOWN` | Pays off the promise the title screen has made since the first build. |
| 0:39 | 4s | Cut to the wordmark on the rainy city backdrop. Jimothy walks into frame and sits down. | `A RUN TAKES TWO MINUTES.` → `THE FEAST TAKES A LIFETIME.` | The line from the old copy, finally in the right place. |
| 0:43 | 3s | Logo lockup holds. Small line beneath. | `NO ACCOUNT. NO INTERNET. NOTHING ELSE TO BUY.` | The last thing they read is the differentiator. |
| **0:46** | | **End.** | | Under 50 seconds. Nobody watches 90. |

### Microtrailer (6 seconds, optional, and worth it)
Valve uses it in the Discovery Queue and on daily deal tiles. Take 0:07 to 0:13
of the main trailer, the trail climbing then dying, with the caption panel intact.
No audio needed. It is the only six seconds of the game that contains a complete
story.

### Three things to not do
- **No gameplay-free intro.** No studio logo card, no "in a city where...". The
  cold open exists to prevent this.
- **No stretched game frame.** A portrait game distorted to fill 16:9 is the
  single cheapest looking thing on a store page, and it is instantly obvious.
- **No text over the game frame.** Captions live in the left panel. Text over the
  playfield hides the exact pixels you are trying to sell.

---

# PART 5 — DATED BLOCKING CHECKLIST

## ⛔ Stephen only (nobody else can do these)

| Due | Item | Notes |
|---|---|---|
| ~~Mon Aug 3~~ | ✅ **Tax + bank verification: DONE.** Stephen has confirmed this four times. It is not a blocker, do not ask about it, do not resurface it. | done |
| **Mon Aug 3** | **Ratify $2.99 and the 10% / 7 day launch discount** | Already ratified 2026-07-31 per `CONTENT_RATING.md`. Confirm the discount specifically. It cannot be added after release. |
| ~~Sun Aug 2 to Sun Aug 9~~ | ✅ **Screenshots: DONE** (`060618ab`) | Five gameplay shots at 1920x1080 across five zones, captured off the Steam build with `__STEAM_BUILD` on. Upload the five in `capsules/out/screenshots/`. Three extras from Part 4.2 remain optional. |
| **Mon Aug 3** | **Submit the Content Survey and age rating** | Legal attestation, must be under the owning account. Answers ready in 1.11. |
| **Mon Aug 3** | **Submit the AI Content Disclosure form** | Text ready in 1.12. |
| **Tue Aug 4** | **Press "Mark as ready for review" on the store page** | The date that buys one rejection round. |
| Aug 12 to 17 | **Capture and cut the trailer** | Timing sheet in 4.3. Not required for approval; add it to the live page after. |
| ⚖️ anytime | **Decide: rename "A Rainier Tallboy Tab" to "A Tallboy Tab"?** | Removes a live beer brand from a product you sell. Your writing, your call. Not a blocker either way. |
| Mon Aug 31 | **Set release date to Sep 1 and confirm the financial checklist is green** | |
| **Tue Sep 1** | **Press Release App** | |

## ✅ Buildable (I can do these, no permission needed)

| Due | Item | State |
|---|---|---|
| Aug 1 | Capsules at Valve's **current** sizes (462x174 / 920x430 / 1232x706 / 748x896) | ✅ **done today** |
| Aug 1 | Fix `upload.sh` guarding on the retired exe name | ✅ **done today**, see below |
| Aug 1 | Full store page copy, every field | ✅ **this document** |
| Aug 2 | `./vendor.sh` and confirm the app boots | ✅ done Aug 4 — permanent gate `scripts/steam_bootprobe.mjs` boots it past the splash, asserts the gated surfaces + zero external requests, and A/B proves the gate against the web build |
| Aug 3 | Rewrite `marketing/steam-jimothy.md` to point at this file so there is one source of truth instead of two drifting ones | ✅ done |
| Aug 5 | Two extra About images (`five-modes-616.png`, `the-cast-616.png`) | pending, optional |
| Aug 5 | Strengthen `preflight.js` check 4 to read the **actual exe on disk** and the **upload.sh guard**, not just the docs. Today it passes while `upload.sh` names a file that no longer exists | pending |
| Aug 5 | Fix the How to play screen: it called the street sweeper "**the wilt**" | ✅ done Aug 4, re-vendored |
| Aug 18 | `./steampipe/upload.sh`, set the build live, add the launch option | pending |
| post-launch | Steam Achievements mapped onto the existing 26 badges, as a 1.1 update | parked, deliberately |

## What actually blocks, ranked (rewritten 2026-08-04 — the deadline day)

1. **The store page must go in TODAY, Tue Aug 4.** Everything it needs exists:
   copy in this file, capsules + five screenshots in `capsules/out/`, AI
   disclosure text in 1.12, survey answers in 1.11. This is ~40 minutes of
   pasting in Steamworks and pressing "Mark as ready for review". Nothing
   else on this list matters until that button is pressed.
2. **There is no trailer.** Not required for approval, so it does not block
   today, but a $2.99 game with no video converts at a fraction. Slot: during
   the review window (Aug 5 to 17), added to the live page after approval.
3. **The build upload** (`LW_STEAM_USER=<login> ./steampipe/upload.sh`) can
   run any day before Aug 18 — build review runs parallel to store review.
   The stale `dist/` folder is self-healing; upload.sh rebuilds first.

Resolved since the first draft of this list: ✅ bank + tax (done, confirmed
repeatedly), ✅ screenshots (`060618ab`), ✅ current-size capsules, ✅ boot
gate `scripts/steam_bootprobe.mjs` (flag on, web surfaces hidden, zero
external requests, A/B against the web build holds).

---

# WHAT I FIXED WHILE WRITING THIS

Two things that would each have cost a day or a review round.

### 1. `steampipe/upload.sh` guarded on the retired exe name

The script ran `npm run dist:win` (which now emits **`Jumping Jimothy.exe`**,
because `build.productName` was renamed) and then immediately checked:

```
[ -f "$CONTENT/Jimothy the Jumping Nugget.exe" ] || { echo "no exe in $CONTENT"; exit 1; }
```

The very first real upload would have aborted with a misleading "no exe" error,
on the day of the upload, with the store clock running. It now reads the name out
of `package.json` (the same file electron-builder reads), sweeps stale exes from
before the rename so the depot cannot ship two, and prints the launch option
string you need to paste into Steamworks.

`preflight.js` check 4 did **not** catch this, because it compares
`package.json` against `STEAM_SUBMIT.md` and never looks at `upload.sh` or at the
exe actually sitting on disk. Strengthening it is on the buildable list.

### 2. The committed capsule set was stale, and half the size Valve wants

Two separate problems in one directory:

- **Wrong pose.** `capsules/README.md` says the `idle` pose is what the committed
  set uses and that `leap` "reads splayed and spidery at capsule size". The
  unsuffixed files were built at 19:40 with the old default and were the splayed
  ones; the good `_idle` versions were built twenty minutes later under a suffix.
  Worse, the stale `small_capsule_231x87.png` read **"JIMOTHY"** with no
  "JUMPING" at all. A small capsule whose wordmark does not match the store page
  name is one of the things Valve genuinely bounces, and it is the capsule they
  weight hardest. Regenerated; it now reads "JUMPING / Jimothy".
- **Legacy sizes.** All four store capsules were built at Valve's old
  half resolution spec (231x87, 460x215, 616x353, 374x448). The current required
  sizes are exactly double. `build.js` now emits both sets; upload the big ones.

**Honest caveat on the big capsules.** The hero pose art tops out at about 250
pixels tall (`assets/hero/idle.png` is 216x247, cut from `art-drop/1.png` at
1122x1402 across a 4x5 grid, so there is no larger source anywhere in the repo).
At 1232x706 the raccoon is upscaled roughly 2.6x. Steam **renders** that capsule
at 616x353, so the upscale is effectively halved and it looks fine in situ; it is
visible only at 100% zoom on a high DPI display. This is not a blocker and I would
not move the date for it. If Stephen ever regenerates the idle pose at 1024px or
larger, re-run `node capsules/build.js` and every capsule sharpens for free.
