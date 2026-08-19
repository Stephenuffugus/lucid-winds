# Social / Launch Kit — Glyph Forge

Copy-paste ready. Replace `LINK` with the live URL once Pages/Hostinger is up
(GitHub Pages: `https://stephenuffugus.github.io/glyph_forge/`, or your
Hostinger domain). Replace `ITCH` with the itch.io URL once it exists.

The single most important asset is the **Daily Sigil**: same seed for everyone,
one attempt. It's the shareable comparison loop. Lead with it.

---

## X / Twitter — launch thread

**1/**
I built a roguelite deckbuilder that's secretly a damage formula you learn to
break. No engine, no downloads — one HTML file, plays offline on your phone,
even synthesises its own sound. Free:
LINK

**2/**
Most deckbuilders hide the math. Glyph Forge *is* the math. You fuse 2–3 runes;
the spell resolves live, left→right: a POWER track you stack, an XMULT track you
detonate. Slot order is the skill.

**3/**
Commit and it breaks open. Go mono-element or mono-shape and damage scales
*exponentially*. 1000+ damage turns exist — but only once you've found the line.
36 runes, 48 named fusions, 22 relics, 5 hidden ones you have to *earn*.

**4/**
7 Sigils. Each blesses AND forbids — one seals Water, one trades 12 HP for raw
multiplier — and each carries a Champion that levels mid-run. Every run is a
different game.

**5/**
Balance isn't vibes: a brute-force AI plays 100 runs per Sigil + a per-relic
impact matrix every commit and prints a pass/fail verdict. It caught a relic at
a literal 100% win rate and I had to re-cost it. The numbers are *earned*.

**6/**
There's a **Daily Sigil**: same seed for everyone, one shot. Play today's, post
how far you got 👇 Can you beat me to the Sovereign?
LINK

*(Reply to 6 with your own result + a screenshot of the depth strip.)*

---

## Reddit — r/roguelikes

**Title:** Glyph Forge — a roguelite deckbuilder where the spell *is* the damage
formula, and learning to break it is the progression (free, browser, offline)

**Body:**
> One HTML file, no install, plays offline, makes its own sound. You fuse 2–3
> runes and the spell resolves live left→right: an additive POWER track and a
> multiplicative XMULT track. Slot order matters; mono-element/shape commitment
> scales exponentially, so "focus beats variety" is a real decision.
>
> 7 Sigils that each bless *and* forbid (run identities, with a Champion that
> levels mid-run), 22 relics, 5 transmutations you trigger by binding a secret
> rune triad in one run. 36 runes / 48 named fusions; finding one inscribes it
> in your codex forever — the codex is the meta-game.
>
> Balance was sim-driven the whole way: a brute-force AI plays ~100 runs per
> Sigil plus a per-relic impact matrix every change, with a determinism
> assertion. Full reduced-motion support, single-handed portrait play.
>
> Honest bit: illuminated-manuscript art ships in batches *after* launch — it's
> built to look intentional with none yet (styled glyphs, not broken boxes).
> I'd rather ship playable than pretty-but-late.
>
> Free, pay-what-you-want on itch if it grabs you. **Daily Sigil** (same seed
> for everyone, one attempt) is the thing to compare — curious how far people
> get on day one. LINK

## Reddit — r/incremental_games

**Title:** Glyph Forge — fuse runes, find the exponential line, watch a 4-digit
damage turn happen (free, one file, offline)

**Body:**
> Less idle, more "solve the engine": every spell is a hand-built rune fusion
> that resolves into a POWER track (additive, order-dependent) and an XMULT
> track (multiplicative, scarce). The dopamine is the moment a build clicks and
> the readout heat goes gold→crimson and a 1000+ pops.
>
> Run-scoped progression: Sigils (bless+forbid identities) with a leveling
> Champion, 22 relics, 5 hidden transmutations. 36 runes, 48 fusions you
> discover and keep in a codex. ~12–18 min a run. Numbers are sim-validated
> (a bot plays hundreds of runs + a relic-impact matrix every commit).
>
> Browser, installs to home screen, fully offline, no accounts/ads/tracking.
> There's a deterministic **Daily Sigil** for direct comparison. LINK

*(Read each sub's self-promo rules before posting. Reply to comments; don't
drive-by. The devlog in `DEVLOG.md` works as a follow-up comment or its own
post if the launch post does well.)*

---

## 3 Daily Sigil share hooks (the recurring loop)

1. "Glyph Forge — Daily Sigil [DATE]: I fell at encounter 9/13. Same seed for
   everyone — beat that? LINK"
2. "Today's Daily Sigil handed everyone the same deck and a Sovereign with my
   name on it. 11/13. Your run? LINK"
3. "Daily Sigil [DATE]: inscribed the whole codex, 13/13 ✷. One seed, one
   attempt, no excuses. LINK"

*(The in-game Share button already generates this text with the seed + result —
these are the manual/template versions for when you post first.)*

---

## Press / curator blurb (≤60 words — for emails, Discords, newsletters)

> **Glyph Forge** is a pocket roguelite deckbuilder where every spell is a rune
> fusion that resolves live into stackable POWER and detonatable XMULT — the
> damage formula, turned inside out so that breaking it is the progression.
> Seven bless-and-forbid Sigils, 22 relics, a deterministic Daily Sigil. One
> offline HTML file, free, pay-what-you-want.

One-liner: *A pocket roguelite deckbuilder. Fuse runes into spells. Find what
shouldn't work.*

---

## Launch-day checklist

**T-0 (go live)**
- [ ] Site reachable over **https** (GitHub Pages toggle *or* Hostinger upload
      done — `tools/HOSTINGER-UPLOAD.md`). Open it on a real phone.
- [ ] Hard-test one full run on mobile: fuse, combo banner, reward, defeat,
      Daily Sigil, mute button, Add-to-Home-Screen + airplane-mode offline.
- [ ] itch.io page published (`ITCH_STORE_COPY.md`), 5 screenshots uploaded
      (see that file), PWYW suggested $4.
- [ ] `GF_LINKS.itch` set in `index.html` → re-deploy/re-pack → CTAs light up.

**T-0 → +2h (post)**
- [ ] X thread (lead with the Daily Sigil link, post your own result on tweet 6).
- [ ] r/roguelikes post; r/incremental_games post (check each sub's rules first).
- [ ] Pin/screenshot your own Daily Sigil result as the reply.

**+24h**
- [ ] Reply to every comment. Post `DEVLOG.md` as a follow-up if the launch
      post has traction.
- [ ] Post the next day's Daily Sigil hook (#1–3 above) — this is the retention
      loop, not a one-off.

**Watch**
- [ ] itch views→downloads ratio, Daily Sigil shares, any "balance feels off"
      feedback → reproduce in the dev sandbox, re-run `node sim-run.js`, tune.
