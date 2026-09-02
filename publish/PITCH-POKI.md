# Poki — what they require, the exclusivity problem, and the text to send

> Written 2026-09-02 from Poki's own developer documentation, read that day, cited below.
> ⚠️ Read the exclusivity section before anything else. Poki is not another
> GameDistribution, and treating it like one would cost us the GD and GM listings.

## Their requirements, as of 2026-09-02

**Read on 2026-09-02:**
- https://developers.poki.com/guide/working-with-poki
- https://developers.poki.com/guide/requirements-quality
- https://developers.poki.com/guide/game-thumbnail
- https://developers.poki.com/guide/revenue-deal-types
- https://sdk.poki.com/requirements

### ⛔ Exclusivity, the thing that decides everything

Poki's preferred deal is **Web Exclusive**: *"on the open web, your game is published
only on Poki."* Steam, the mobile stores and consoles are carved out and stay ours, but
Discord and YouTube Playables count as web and are inside the exclusivity. **Exclusive
deals run five years by default.**

They do offer a second door. **Non-Exclusive** is described as *"a one time flat license
fee instead, with no revenue share"*, and it is aimed at exactly our situation: games
already on other web platforms, or games with niche appeal.

**So the choice is real and it is Stephen's:**

- **Door one, the flat fee.** Any game that goes to GameDistribution or GameMonetize can
  only ever be a non exclusive, flat licence at Poki. One payment, no ongoing share.
  Nothing is given up, because those games are being syndicated anyway.
- **Door two, hold one back.** Pick one title, keep it off GD, GM and every other
  aggregator, and offer Poki the exclusive. That is the deal with a revenue share and
  their marketing behind it, and it is five years long.

⛔ **What we must not do is offer Poki a game we have already handed to GameDistribution
and call it exclusive.** They hand curate and they check.

### Technical, quoted

- **Loading:** *"Players tend to move to another game if loading takes more than 10
  seconds."* Keep the initial download small; 8 MB is the figure their requirements page
  targets.
- **No external requests.** Bundle every asset, font and library.
- **No third party ad system.** Monetisation is the Poki SDK and nothing else.
- **No splash screens, no outgoing links.** A studio logo is allowed on the loading
  screen only.
- **No in game purchase UI and no "remove ads".**
- SDK events must be exact: `gameplayStart()` on the player's first input and not on
  load, `gameplayStop()` on every interruption, `commercialBreak()` only on the way back
  into play, and never two of the same event in a row.
- **16 by 9, responsive**, scaling to 640x360, 836x470 and 1031x580. Desktop, mobile and
  tablet all supported; mobile must fill the screen in portrait or landscape or both.
- **30 fps minimum, 60 fps target.**

### Thumbnails, and a rule worth stealing

Static thumbnail is **628x628 minimum, 1:1, full bleed, no padding or letterboxing**, and
their guidance is blunt: *"avoid text entirely, it quickly becomes unreadable on smaller
tiles"*, plus keep away from colours near their own background, #83FFE7. Animated
thumbnails are required for a global release.

⭐ That rule is why the mandatory marketing sizes in `publish/marketing/` carry no title
text. It is Poki's advice and it is right for GameDistribution's tiles too.

### Terms

- Exclusive: revenue share on the players Poki brings, 100 percent of earnings on players
  we bring ourselves through search, our own site or our own community. Five years.
- Non exclusive: one time flat licence fee, no revenue share.
- Every game is hand picked, and daily releases are deliberately limited.
- The path after acceptance is Web Fit test, then soft launch, then global release.

### What this means for our ZIPs

⛔ **Nothing in `publish/dist/` can go to Poki either.** Every one of those twenty ZIPs
carries a rival network's ad SDK, which Poki forbids outright. A Poki build is a fourth
target in `scripts/pub_build.py`, and it is a slightly bigger job than the CrazyGames one
because their SDK is event driven: `gameplayStart` on first input, `gameplayStop` at the
round end. Our builder already knows where every game's round end is, which is the hard
half of that.

## The three that fit their taste, and why

Poki's audience is young, mostly on a phone, and mostly not reading English. The games
that work there explain themselves in one frame and are played with one finger.

**1. Petal Slice** *(`petal-slice`, 5.36 MB)*
Swipe to slice. There is no instruction to translate and no control to teach. The single
most Poki shaped game we own.

**2. Stop the Light** *(`stop-the-light`, 0.29 MB)*
One tap. Stop the firefly in the gold band, then bank the sparks or risk them again.
Nothing to read, a round lasts under a minute, and at 204 KB it is already far inside
their 8 MB target where most of our catalogue is not.

**3. Berry Vine** *(`berry-vine`, 5.94 MB)*
Bubble shooter, evergreen, universally understood, and the best looking title screen in
the catalogue.

All three are already on our own portal and all three are queued for GameDistribution and
GameMonetize, so all three are **flat licence candidates, not exclusives**. If Stephen
wants the exclusive deal instead, the honest move is to hold one unreleased title back
for it rather than to un ship one of these.

## The submission text, in Stephen's voice

Poki takes games through a submission form at https://developers.poki.com. Paste this
into the free text field, or send it if a person writes back. No dashes, by house rule.

---

Hello,

I am Stephen and I build browser games on my own as Sky Wolf Studio. There are a little
over 160 of them now, all free, all HTML5, and three of them feel like they belong on
Poki.

Petal Slice is a swipe to slice game, one gesture, no words needed. Stop the Light is a
one tap press your luck game where you stop a firefly in a gold band and choose whether
to bank it. Berry Vine is a bubble shooter with a vine that curls home if you let it. All
three are one finger, all three are readable in a single frame, and none of them needs a
word of English to understand.

I should be straight with you about one thing up front. These three are already playable
on my own site and I have been talking to two ad networks about them, so I know they are
not candidates for your web exclusive deal. I am writing about the non exclusive licence
you describe in your deal types. If instead you would rather see something exclusive, I
am happy to hold my next title back for you and build it to your requirements from the
first day, and I would rather do that properly than dress up something I have already
syndicated.

Either way, they are all live at lucidwinds.com if you would like to play them before you
answer.

Thank you for your time,

Stephen Furpahs
Sky Wolf Studio
lucidwinds.com

---

## What Stephen actually has to do

1. Decide door one or door two, because the letter above says it out loud and that
   honesty is the reason it will be read. The default in the letter is door one.
2. Fill in the submission form at https://developers.poki.com with the text above.
3. If they bite, tell Fable, and a Poki target with `gameplayStart` and `gameplayStop`
   goes into the builder.
