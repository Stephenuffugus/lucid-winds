# CrazyGames: the third builder target

Built 13 Nov 2026. Nothing has been sent, uploaded or signed up for. This file says what
the target does, how to build with it, where the three ZIPs are, and what only the owner
can do next.

## What the target does

`python3 scripts/pub_build.py satellites/<game> --target crazygames` makes the same
stripped copy as the GameMonetize and GameDistribution targets (no Sunbeam economy, no
portal exit, no feedback form, no music shell, no service worker or manifest, no
canonical, og or twitter tags, no links or strings pointing at our sites, unused folders
pruned) and then adds the CrazyGames SDK v3 instead of a rival network's SDK.

- The SDK tag `https://sdk.crazygames.com/crazygames-sdk-v3.js` goes in the head before
  the game code, as their intro page writes it. Then `CrazyGames.SDK.init()` runs, and
  nothing else touches the SDK until it resolves.
- The SDK is used only when its environment is `local` or `crazygames`. Anywhere else
  it is `disabled` and every call throws, so the adapter leaves it alone. If the script
  is blocked (an ad blocker, a closed network), every call is a no-op and the game plays.
- `loadingStart` and `loadingStop` frame the page load, only when the page is still
  loading when init resolves.
- `gameplayStart` when play begins or resumes: the game's own start functions
  (startLevel, startEndless, startGame, startMode, resumeGame, advanceLevel and a few
  more names the fleet uses). A game with none of them starts on the first input after
  a break.
- `gameplayStop` at every break: the round end (before the ad), the game's pause and
  menu functions (pauseGame, toMenu, levelClear), and any visible pause screen (an
  element whose id names a pause). When a pause screen closes, play starts again.
  Start and stop are idempotent, so they always alternate.
- A midgame ad at the same round end the other two targets use, never during play.
  From the request until `adFinished` or `adError` the page is covered by a dim layer
  and keys are swallowed. Sound is muted only once `adStarted` fires and comes back on
  finish and on error. A 60 second safety release means a lost callback cannot freeze
  the game. Their SDK spaces midgame ads itself (one per three minutes) and answers an
  early request with an error, so the adapter asks at every round end.
- Muting covers every AudioContext the game makes (its `resume()` is refused while an
  ad plays) and any audio or video element. `game.settings.muteAudio` is honoured the
  same way and stays above the game's own sound toggle.
- `happytime` only when a whole game is won (Bloom Breaker's final world), never per
  level.
- No rewarded ads: no game offers a reward through the other two targets.
- `user-select: none` on the body, as their mobile requirement asks.
- Copy: "hand built" and its cousins are taken out of the shipped text (Bloom Breaker's
  meta description said "60 hand built levels"). This runs for this target only, so the
  two older targets build exactly as before.

There is no game id. Their SDK knows the game by the page it runs on.

## The pages it was built from (read 13 Nov 2026)

- https://docs.crazygames.com/sdk/intro/ (the tag, init, environments)
- https://docs.crazygames.com/sdk/game/ (gameplay start and stop, loading, happy time, settings)
- https://docs.crazygames.com/sdk/video-ads/ (requestAd, its callbacks and error codes)
- https://docs.crazygames.com/requirements/ads/
- https://docs.crazygames.com/requirements/technical/
- https://docs.crazygames.com/requirements/gameplay/
- https://docs.crazygames.com/requirements/quality/
- https://docs.crazygames.com/resources/html5/common-fixes/

## How to build and check a ZIP

```
python3 scripts/pub_build.py satellites/garden-td --target crazygames
node publish/tools/pub_verify.mjs publish/dist/garden-td-crazygames.zip --offline
node publish/tools/cg_check.mjs publish/dist/garden-td-crazygames.zip stub 800x600
node publish/tools/cg_check.mjs publish/dist/garden-td-crazygames.zip blocked 375x667
```

`cg_check.mjs` serves the unzipped game alone, opens it inside an iframe, and either
blocks the SDK or answers it with a local stub that records every call. It fails on a
page error, a request to any other host, a link out, a call before init, two starts in a
row, an ad request during play, sound running during the ad, or the page still blocked
or muted after it. `stub-error` makes every ad fail, to prove the game comes back.

## The three ZIPs

The `publish/dist/` folder is git ignored; the files stay on this machine.

- Garden Guard: `publish/dist/garden-td-crazygames.zip`, 1.44 MB
- Nova Bloom: `publish/dist/nova-bloom-crazygames.zip`, 2.39 MB
- Bloom Breaker: `publish/dist/bloom-breaker-crazygames.zip`, 46 KB

All three are far under their 20 MB mobile home page limit and their 1500 file limit.

Why Bloom Breaker is the third: it is the one in the built set most likely to work on a
web portal. A player understands a brick breaker before the ball moves, it plays with one
thumb or a mouse, a level takes a minute or two, and it loads at once on a cheap
Chromebook, which their audience uses. It is also the game the earlier pitch named.

## What CrazyGames still needs from the owner

1. A developer account at https://developer.crazygames.com (the owner signs up; no one
   else can).
2. In the portal, a new game for each ZIP: upload the ZIP, then open the preview on
   their QA page (crazygames.com/preview) and play one round. That page is the only
   place the real SDK and real ads run.
3. The submission form. Suggested answers follow. Support email: `[support email]`.

### Garden Guard

- Title: Garden Guard
- Description: Plant a garden that fights back. Nine plant towers hold the path against
  a parade of pests across a ladder of waves. Choose where each one grows, upgrade the
  ones that work, and call the next wave early when you feel brave. Three difficulties
  and an endless mode.
- Category: Tower Defense (or Strategy)
- Controls: Mouse or touch. Click a soil spot to open the tray, click a plant to see its
  range, click again to plant it. Click a planted tower to upgrade or sell it.
- Tags: tower defense, strategy, garden, plants, waves, casual
- Orientation: portrait first; it shows side panels on a wide screen.

### Nova Bloom

- Title: Nova Bloom
- Description: A twin stick starfield. Every enemy you clear plants a flower, and flying
  over a grown flower charges your Bloom Bomb. Learn the moths, wasps, needles and the
  serpent, chase a higher multiplier, and try the daily run, the pacifist run or a calm
  zen flight.
- Category: Shooting (or Action)
- Controls: Desktop: WASD or arrow keys to fly, the mouse to aim, hold the mouse button
  to fire, Space for the Bloom Bomb. Touch: the left half of the screen is the flight
  stick, the right half aims and fires; the target toggle fires for you.
- Tags: shooter, twin stick, space, arcade, bullet hell, flowers
- Orientation: portrait first.

### Bloom Breaker

- Title: Bloom Breaker
- Description: A brick breaker in a night garden. Sixty levels across a world map,
  twenty four powerups, a boss at the end, three difficulties and an endless mode. Bounce
  the ball, break the bricks, catch what falls.
- Category: Casual (or Arcade)
- Controls: Mouse or touch to move the paddle; the paddle follows the pointer on
  desktop. Click, tap or press Space to launch the ball.
- Tags: brick breaker, breakout, arcade, casual, levels, one hand
- Orientation: portrait first.

## What could not be checked here

- The real SDK and real ads. Every check ran with the SDK blocked or with a local stub
  that follows their documented surface; nothing was loaded from their servers. The
  real ad overlay, the real three minute spacing, the preroll and how their QA tool
  scores the build are only visible on their QA page.
- Their environment detection on their own domains (`crazygames`), and whether init
  resolves before the page has loaded there (the stub resolves after 150 ms).
- Readability at their desktop iframe sizes at a device pixel ratio of 1. The three
  games are portrait first; on an 800 by 600 frame they draw a centred column with dark
  bars, and Bloom Breaker's level label is small there. Their QA may ask for bigger text.
- The midgame ad is only at the round end. Bloom Breaker also pauses play between
  levels (gameplayStop, then gameplayStart on the next level); no ad is asked for there,
  to keep the same breaks as the other two targets.
- Their gameplay rules ask that a new player lands in play at once, or within one click.
  All three open on a menu with a Play button first; Garden Guard asks for a difficulty
  and a level after that, which is more than one click. Their QA may ask for a quicker
  start.
