# FABLE'S VERIFICATION OF THE FOUR PUB DOCS — Aug 27 evening

Stephen: "he was catching his own mistakes so I don't trust anything." Fair worry,
wrong conclusion: the self-corrections are the sign of a process that checks itself,
and my independent pass CONFIRMED every load-bearing claim I tested. I read all four
documents end to end (4,635 lines), re-measured the repo and live-site claims with my
own commands, and re-fetched the critical external sources from their primary pages.

## The verdict

**All four documents PASS. No false claim survived into the final text that I could
find.** The errors Opus caught in itself (the fabricated subreddit quote, the wrong
first Pi patch, the "8 unwired tracks" misread, the source-tree-vs-build sizes) are
all documented in place, corrected, and the corrections check out. The honest
"could not verify" sections are accurate boundaries, not hedging.

## What I independently confirmed (my own commands / fetches, Aug 27 evening)

| Claim | Method | Result |
|---|---|---|
| Pi rail price hole: `piApprove`/`piComplete` never validate amount; client picks it | read both functions + client call site | ✅ CONFIRMED, real vulnerability |
| Suno terms effective **Sep 3**: commercial rights attach to downloads, tier-capped | fetched suno.com/terms-september-2026 | ✅ CONFIRMED verbatim |
| The download cap is **retroactive to the whole back catalog** | fetched help.suno.com/13614785 | ✅ CONFIRMED: "including songs created before that date" |
| Perpetual rights survive cancellation for anything downloaded | same terms fetch | ✅ CONFIRMED verbatim |
| Jimothy is a real viral Seattle raccoon (July 2026, Kiana Hall, GW2 NPC, UW degree, council) | fetched Wikipedia | ✅ CONFIRMED (bonus context: Hall's spouse is a GW2 dev) |
| itch page claims "hand-painted", retired name, Frogger/Crossy Road, 44 chars, 7-day streak, while carrying an AI-Assisted tag | fetched the live itch page | ✅ ALL CONFIRMED live |
| Pi U2A needs a Core-Team-approved Incoming Multisig Wallet; A2U is testnet + "selected mainnet" | fetched pi-apps.github.io Launch page | ✅ CONFIRMED verbatim |
| Bandcamp banned AI music Jan 2026, removal on suspicion | fetched the Bandcamp blog post | ✅ CONFIRMED verbatim |
| www serves the site byte-identical, no redirect | md5 both hostnames | ✅ identical hashes |
| robots.txt served is 1,904B Cloudflare-managed, not the 68B repo file | cache-busted curl | ✅ CONFIRMED |
| Sitemap 88 URLs; 68 /play/ shells, zero in sitemap | grep + ls | ✅ CONFIRMED |
| /jimothy/ canonical vs og:url self-conflict | curl live page | ✅ CONFIRMED |
| "rooftops" live in the How-to-play; Frogger ×3 live on the page | grep live + repo | ✅ CONFIRMED |
| itch build zip dated Jul 31 (predates the Aug 18 costume-ladder change) | ls | ✅ CONFIRMED |

## ⭐ One conflict the docs could not see, now RESOLVED in Stephen's favor

Stephen described his workflow to me as composer-first: he records his own melodies
and harmonies, uploads them, and Suno arranges/produces. The music doc, working from
a different conversation, treats the catalog as fully generated and flags a scary
"Remix" clause (non-commercial forever). **I fetched the September terms and read the
definition: a "Remix" is another USER remixing YOUR Output via the remix feature.**
Output generated from your own uploaded audio is ordinary Output: assigned to you,
commercial on Pro, with your (true) warranty that you owned the uploads. The
catastrophe reading is dead.

**But the fork still matters, per track, and only Stephen can answer it:**
- Tracks that began from his recorded melodies: the DistroKid disclosure may honestly
  be "Part of the audio" not "All of the audio"; his authored melody perceptible in
  the output is HIS copyright under the USCO's own rule ("works of authorship...
  perceptible in AI-generated outputs"), which strengthens everything the music doc
  says is weak; and "composed by Stephen, produced with Suno" becomes the accurate
  credit.
- Tracks that were prompt-only: everything in PUB-MUSIC-DISTRO stands as written.
**Action: a one-line-per-track inventory of which lane each release track is in,
before any distributor form gets filled.**

## ⚠ Flags on the drafts (fix before posting, none structural)

1. **"I am one person in Ohio with two kids"** (Show HN draft): I cannot verify Ohio
   or the number of kids from anything in this repo. Every biographical word posted
   under Stephen's name must be his own and true. He rewrites the personal lines.
2. **"the code is mine and the systems are mine"** (same draft): the systems and
   direction are his; the code is heavily AI-assisted. On HN specifically, that
   sentence invites the one gotcha that turns a good thread bad. Suggested honest
   shape: "the design and systems are mine; I build with AI tools across the stack
   and I am happy to talk about exactly how." The KNKX precedent shows honesty
   PLAYED WELL locally; hiding it is the only losing move.
3. All Reddit rules were read from snapshots weeks old (Reddit is IP-blocked from
   here; I could not do better). Re-read each sub's rules in a browser on the day.

## What stays unverified (accepted as the docs label them)

DistroKid's help-center policy (403 to one pass), Apple's provider email, Amazon's
non-policy, CrazyGames' real revenue split, Newgrounds everything, Discord rules,
whether the site is indexed at all (Search Console only), Pi's multisig signer set
and withdrawal path (support ticket), iPhone save survival in Pi Browser (his phone).

---

# THE UNIFIED ORDER OF WORK (all four docs merged, one list)

## ⏰ Stephen, this week, calendar-real deadlines first

- [ ] **S1. Before Wed Sep 3: download the ENTIRE Suno library**, best quality, stems
      included, then back it up off Suno and off one machine. Confirmed retroactive.
      While in there: generate hard all week (nothing metered until the 3rd), and
      keep the subscription running through September.
- [ ] **S2. Resubmit the Steam page** (the fixed Library Logo is delivered; app
      5043360). The Jimothy demand curve is decaying daily; six competitors ride it.
- [ ] **S3. Fix the itch page copy in the itch dashboard** (exact replacements in
      PUB-LISTINGS): hand-painted claim OUT today, title to Jumping Jimothy,
      45 characters, campaign-ladder line, Frogger/Crossy Road out, embed 540x960.
      I rebuild the zip (F6); you re-upload it.
- [ ] **S4. Answer the per-track workflow question** (which tracks began from your
      recorded melodies). One line per release track. Gates every distributor form.
- [ ] **S5. Google Search Console**: verify the domain, submit the sitemap (after F3).
- [ ] **S6. Decisions**: FTW gate open? (gates Show HN, CrazyGames, Pi, FTW SEO) ·
      your Reddit account age/karma? · Cloudflare AI-crawler setting once ·
      iPhone Pi Browser save test (ten minutes) · Pi support ticket (Post 1, §9).

## 🔧 Fable's code queue (no decisions needed; in order)

- [ ] **F1. Close the Pi price hole** (piApprove floor/tier validation per §4.3's
      corrected patch; floors read from the prices the client already displays,
      tips floored at 0.1; Stephen can retune numbers after, the hole closes now).
- [ ] **F2. Repo copy fixes**: "rooftops" out of the How-to-play; Frogger/Crossy Road
      out of stream-hop's meta keywords + JSON-LD; music README one-liner;
      CLAUDE.md Pi audience 47M → ~16M migrated.
- [ ] **F3. SEO mechanical pass**: canonical on every page; meta descriptions from
      the portal blurbs (95 scripted); hidden h1s; sitemap generator from
      catalog.mjs with lastmod, gated games skipped, /play/ shells included;
      Jimothy title/h1 retargeted to "jimothy game / raccoon game"; FTW head block;
      root og:url fix; noindex the six dev tools; hero alt text.
- [ ] **F4. /play/ shells**: h1 + canonical + three real sentences each (68 pages,
      scripted + hand-checked).
- [ ] **F5. links.html**: fill the itch slot; singular studio name sweep on that page.
- [ ] **F6. Rebuild the itch zip** from current stream-hop (build.sh) for S3.
- [ ] **F7. Jimothy `?pi=1` rail** (hide fiat surfaces, per §5) once S6's Pi answers
      land; FTW rail after the gate decision.
- [ ] **F8. www→apex 301**: server-side rule (Cloudflare/Hostinger dashboard = his
      hands); canonicals in F3 mitigate meanwhile.

## Then, one per week (the venue ladder, from PUB-LISTINGS)

Video of Jimothy → Show HN for FTW (gate permitting) → r/WebGames Jimothy →
CrazyGames FTW → Alpha Beta Gamer Discord → Steam Curator Connect (100 offers,
post-approval) → r/Seattle Saturday → Indie Sunday → r/gamedev write-up.
Music: Steam Soundtrack + itch soundtrack project first; DistroKid only for
presence, after S4.
