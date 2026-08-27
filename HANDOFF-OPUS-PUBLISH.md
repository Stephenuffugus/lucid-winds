# OPUS HANDOFF — publishing research + marketing prep (Aug 27)

Stephen's direction: get Jimothy onto Pi Network (then FTW), get the
soundtracks distributable, get SEO + listings everywhere. You are the research
and drafting arm; you produce DOCUMENTS, not code changes, except where a task
names a file. Work top to bottom; each task's deliverable is a markdown file
in repo root prefixed `PUB-`.

Context files first: `PI_DEPLOY.md`, memory rule "PI listing ?pi=1"
(project_pi_compliance_leak_aug01 — the Pi-flagged presentation must only show
under ?pi=1), `STEAM-CHECKLIST.md` (Jimothy is already submitted to Steam,
~Sep 15), `CROSSCHECK-PLAY-AUG22.md` (Play runbook), `satellites/flock-the-world/NOTES-AUG27.md` §G.

## Task 1 — Jimothy on Pi Network (deliverable: PUB-PI-JIMOTHY.md)

Research, from Pi's current developer docs (minepi.com/developers, Pi Browser
docs) and write a runbook Stephen can execute:
- Current app submission flow in the Pi Developer Portal (Brainstorm →
  Develop app → mainnet listing): exact steps, required assets, review
  expectations in 2026, and known wait times. Note his history: Lucid Winds
  was submitted and never answered for months — find whether resubmission or
  a new app is the cleaner path, and whether the ecosystem directory listing
  is separate from just running inside Pi Browser.
- The demo + unlock model he wants: free demo, unlock full game for ~10 Pi via
  Pi SDK U2A payments (createPayment → server approve/complete). Document the
  minimal server needs (Firebase function pattern exists in
  `functions/index.js` piApprove/piComplete for Lucid Winds — assess reuse),
  and Pi's policy on paid unlocks vs tips.
- Whether a plain hosted PWA URL is enough (Pi Browser loads normal URLs) and
  what the ?pi=1 lane must show/hide for compliance (no Stripe surfaces in Pi).
- Draft the listing copy (name, short, long, category) from Jimothy's Steam
  store copy in `store/jimothy-steam/`.
- Draft 5 forum/community posts for the Pi ecosystem (r/PiNetwork, Pi chat
  moderated channels, Pi developer forums): warm, human, zero dashes, no hype
  spam, each tailored to the venue's self-promo rules WHICH YOU CHECK FIRST.

## Task 2 — FTW on Pi after Jimothy (append to PUB-PI-JIMOTHY.md)

Same lane, note the differences: FTW already has manifest/sw/icons/privacy
(Play gates 10/10), landscape orientation, $1 intent elsewhere. Recommend
free-with-tip vs paid-unlock for a satire title on Pi, with reasoning. Flag:
FTW's themes (surveillance satire) against Pi's content guidelines, honestly.

## Task 3 — soundtrack distribution (deliverable: PUB-MUSIC-DISTRO.md)

His music is Suno-generated, curated by him (he is a producer). BEFORE any
recommendation, resolve honestly and cite sources:
- Suno commercial + distribution rights BY PLAN TIER in 2026 (free tier does
  NOT grant commercial use; confirm what his tier grants and what he'd need).
- Distributor policies on AI-generated music: DistroKid, TuneCore, CD Baby,
  LANDR current stance + disclosure requirements; DSP-side policies (Spotify,
  Apple, YouTube Music) and the practical takedown risk.
- Options ranked: (a) full DSP distribution with AI disclosure where required;
  (b) Bandcamp + itch.io soundtrack editions (fewer gates, direct revenue,
  pairs with games); (c) YouTube topic uploads + Content ID caveats.
- What metadata/branding to use (SKY WOLF STUDIO singular; per-game album
  naming) and cover art needs.
- NEVER recommend claiming human performance. The house law is we never
  misrepresent generated work.

## Task 4 — SEO audit (deliverable: PUB-SEO-AUDIT.md)

Crawl the live portal (lucidwinds.com and the satellites, e.g.
/satellites/flock-the-world/) READ-ONLY and report per page: title tag,
meta description, OG/Twitter cards, canonical, sitemap.xml + robots.txt
presence, h1 sanity, image alt coverage, Lighthouse SEO score. Output a
fix-list table ordered by impact with the exact tags to add (Fable session
lands the edits; you do not edit). Include search-intent keyword suggestions
per game (e.g. "free browser strategy game", "Plague Inc style browser game").

## Task 5 — listings + communities sweep (deliverable: PUB-LISTINGS.md)

Build the target list with per-venue rules checked (self-promo policies FIRST,
noted per row): itch.io (recommend: real store presence for both games),
CrazyGames/Poki-style portals (check their embed/licensing terms honestly),
r/WebGames, r/incremental_games (FTW fits), r/playmygame, r/IndieGaming,
Hacker News Show HN (FTW's satire angle), TIGSource, indie Discords,
web-game curators/newsletters. For each: what to post, when, and a draft
(warm, human, zero dashes, no astroturf — Stephen posts under his own
account; never draft fake-user reviews or ask friends to pose as players;
a friend quote must be a real friend's real words).

## Rules

- Research uses live sources; cite URLs + access dates in every doc.
- No accounts created, nothing submitted, nothing posted — documents only.
- Zero dashes in any copy meant for humans. SKY WOLF STUDIO, singular.
- If a finding kills an idea (policy forbids it, rights unclear), SAY SO at
  the top of the doc, not buried.
