# PIXEL PETRI: the expansion and the commercial, a proposal for Stephen (Fable, 5 Nov 2026)

Stephen, 5 Nov: "i would love to do a massive expansion on pixel petri and create a commercial since its how highest
grossing so far with 7 natural purchases from different countries. i dont know if someone is buying it and stealing it
or what."

## Where it stands (checked, not assumed)
- Pixel Petri is the private repo Stephenuffugus/tiny-world (NOT cloned on this box; `env -u GITHUB_TOKEN gh repo clone
  Stephenuffugus/tiny-world /workspaces/tiny-world` when the work starts). `satellites/tiny-world/` in lucid-winds is its
  deploy output (live 20261009i, 9 Oct, the Pi rail); never edited by hand. Its own CLAUDE.md, STATUS.md (the top entry
  is the Pi rail, 9 Oct) and PLAN.md are the rules and the state; the design bible is design/ (16 chapters).
- On Google Play since 4 Oct at $0.99 (com.skywolfstudio.pixelpetri), a Trusted Web Activity of the live page, so every
  deploy reaches buyers at once. The web page itself is open and free on lucidwinds.com; the Pi listing on
  petri.lucidwinds.com sells one 8 Pi unlock over a taster tray.
- Design 19 is done (155 lines built, 5 Oct); the ideas brief IDEAS-BRIEF-2.md asked an outside reader for new creature
  combinations; design/09-expansion.md is the bible's own expansion chapter (Sep 19, "proposals, nothing adopted until
  he says so") with twelve sections and a ranking in its section 12. The expansion should start from that chapter, not
  from a blank page: it already holds moods, relationships, eggs and nests, carrying capacity, flocks, day and night
  shifts, village ages, many villages and other peoples, world generators, player toys, stories the game tells back,
  sharing, themed packs.

## The seven buyers
Seven purchases in seven countries in a month, with no marketing, is what organic Play search looks like for a paid
indie app: one person per country finds it by a word ("petri", "pixel world", "sandbox") and pays a dollar. It is not a
sign of theft. Nothing is gained by buying it to copy: the Play app is a window onto a web page anyone can open free,
and the JavaScript is already public. If a clone ever appeared on Play, the remedy is Play's impersonation policy and a
takedown notice, not DRM (there is no DRM worth building for a web game). What to actually read: Play Console,
Statistics, by country and by acquisition (store listing visitors to installs), to see which search words bring them.
The one real question the number raises is for you: the web is free and the Play app is a dollar; what the dollar buys
today is the icon and offline. The expansion can be free everywhere (the builder law: never gate simulation content)
or the Play and Pi versions can carry the new packs first. Your call, and the bible's rule leans free.

## The expansion: three shapes, pick one to plan first
Each is a milestone of two to four nights for Opus with Fable's plan, built in the tiny-world repo under its laws, the
heavy suite once per milestone (it takes 25 to 40 minutes; the per step check is the node only validate-data and
lint-sim), his Pixel pass between milestones. Astra draws the new sprites in the game's pixel style (the first Astra
brief for Pixel Petri would be its own folder, Drive Astra/Pixel Petri, one brief and one kickoff).
1. **THE LIVING YEAR** (bible 2 and 4): seasons and weather over every world; ponds freeze, snow spreads, harvests,
   migrations, day and night shifts for nocturnal species, carrying capacity so rabbits boom and foxes follow. Touches
   all 126 creatures through the rules tables, changes every screenshot, and is the thing a child sees happen. The one I
   would plan first: most new behaviour per sprite drawn.
2. **MANY PEOPLES** (bible 3): village ages (camp, hamlet, town, kingdom), several villages with relations, goblin and
   penguin and merfolk camps that build in their own way, jobs you can see, weddings and festivals. The densest
   screenshot and the most story; the most code.
3. **THEMED PACKS** (bible 11): each pack one terrain, about ten creatures, six things, three powers, six reactions, one
   scenario (a volcano isle, a frozen north, a reef, a swamp). The most Astra work per night of code; the cleanest unit
   to sell or to give away one at a time; the least change to how the world behaves.
The commercial wants 1 or 2 on screen; 3 is the follow on content line.

## The commercial
A 20 to 30 second portrait video from real play, no voice, captions in the game's font, the game's own sounds: a finger
paints a pond, a family and sheep drop in, a wolf, night falls and everybody goes home, a village grows, the Scrapbook
fills, the title card, the Play badge. Pipeline on this box: the game's own shot tooling (tiny-world dev/, puppeteer at
1080x1920) captures the frames of a scripted world, ffmpeg (installed for the job: sudo works on this box) cuts them with
the captions and Astra's title and end cards, output an MP4 at 1080x1920 for the Play listing's promo slot (Play wants a
YouTube link; you upload) and a 1080 square for social. One night of Opus after Astra's two cards; no new game code. Do
it AFTER the first expansion milestone is live, so the video shows what is new.

## Your calls
1. Which expansion first (1, 2 or 3), or a different order.
2. Free everywhere, or the packs first on Play and Pi.
3. The commercial after milestone one (recommended) or now from the game as it is.
4. Whether Penny designs the first pack (she named Tomato Man; the Scrapbook is hers).
