# START HERE

**When Stephen says "lets get started", read this file first, top to bottom, before anything else.**
It is the board. It is short on purpose. Update it in the turn something changes, not at the end of a session.

_Last updated: 2026-09-16, 13:30 UTC (Fable)._

---

## 1. THE ONE THING THAT IS ACTUALLY BROKEN, AND IT IS NOT IN THIS REPO

**✅ FIXED 2026-09-16 13:30 UTC.** Hostinger's CDN was taken out of the path by editing Stephen's Cloudflare DNS over the API
(Global API Key, since rolled): apex and www now A 82.25.83.190 proxied, the second A and both AAAA deleted, SSL Full (strict).
Proof after the change, one probe each: `/portal/` 200 in 147 ms, `www` Jimothy 200 in 113 ms, a Jimothy sprite 200 image/png in
141 ms, and NO `x-hcdn-*` header on any of them. Before: 19.5 s. The history below is kept so nobody re-adds that CDN.
⛔ hPanel will keep saying "Domain isn't connected" (nameservers are Cloudflare's). Ignore it; the origin serves the domain with a
valid Let's Encrypt cert. ⛔ Never turn Hostinger's CDN back on in hPanel and never point DNS back at `cdn.hstgr.net`.
Lane D (Jimothy atlas) is no longer an emergency but still worth a day: 18 MB on a first visit is a phone problem on its own.

**Hostinger's CDN punishes a visitor's IP address, and that is what "a bunch of shit is broken" has meant since Sep 15.**
It has two moods and they look like different bugs, which is why it keeps getting misdiagnosed:

| mood | what he sees | the tell |
|---|---|---|
| **429 lockout** | Jimothy's art missing, then the arcade and apps page fail for minutes | empty 429 bodies with no MIME type |
| **Tarpit** | A game "flashes and nothing happens". Pages answer **200** but the first byte takes **19.7 s** | the *same* 19.7 s on every path, while `x-hcdn-upstream-rt` reads `0.004` |

**Why a tarpit looks like "nothing happens":** the root `sw.js` navigation handler waits 5 s for the network, tries the cache,
and only gives up at **12 s** with an offline page. On a tarpitted phone a game tap is therefore a flash and then a blank
screen for twelve seconds. Nobody waits twelve seconds. **That is the flash.**

**⛔ CORRECTED 13:10 UTC SEP 16, THE FIX IS NOT IN hPANEL.** lucidwinds.com is on Stephen's OWN Cloudflare zone (NS
ollie/terin.ns.cloudflare.com); hPanel says "Domain isn't connected" because of that. The chain is: his Cloudflare → Hostinger's
CDN (the `x-hcdn-*` layer, THE PUNISHER) → the LiteSpeed origin at **82.25.83.190** (found via the unproxied `ftp.` record).
Probed direct to the origin with `--resolve`: **200 in 58 ms**, full page, valid Let's Encrypt cert for lucidwinds.com (Sep 11 to
Dec 10). His Cloudflare's own edge and cache answer this box in 36 to 47 ms. So everything slow is Hostinger's CDN and nothing else.
**THE FIX: in his Cloudflare dashboard, DNS, point the `lucidwinds.com` and `www` records at A 82.25.83.190, proxy left ON (instant,
no propagation), SSL/TLS mode Full (strict).** That removes Hostinger's CDN from the path. Verify with one probe: no `x-hcdn` headers,
first byte under one second. The old advice below is kept for the record only.

**THE OLD ADVICE (superseded):** hPanel → lucidwinds.com → Performance → CDN → turn down or off the security
layer (rate limiting, DDoS / "under attack", bot protection). Nothing in this repo can serve a page the edge will not hand
over. He has been told this three times; if it is still not done, **ask him for a screenshot of that hPanel page and walk
him through it rather than writing more code.**

⛔ **BEFORE EVER SAYING "THE SITE IS DOWN":** check `time_starttransfer`, check `x-hcdn-upstream-rt`, and fetch the same URL
once from a second egress (WebFetch). A fixed, identical delay across unrelated paths is a rule, not an outage. Three
separate passes on Sep 16 wrote "the whole site is returning 522" about a site that was serving fine.

⛔ **NEVER BURST-PROBE THE LIVE SITE.** It locks this box out too, and then every probe lies. One file at a time, with gaps.

**Re-verified 12:31 UTC Sep 16:** `/portal/` from this box = 200, first byte 19.48 s, `x-hcdn-upstream-rt` 0.013; the same
URL from a second egress loaded promptly. The punishment on an address lasts HOURS (this box was quiet for seven). His
tester's Wi-Fi shares one address, so one Jimothy open punished every game that followed, all afternoon.

---

## 2. THE DEADLINE

**Jumping Jimothy releases Friday Sep 18, 10:01 EDT. Stephen presses the button.** Approved, build r4 live, 26 achievements
published, store page live.

**The one repo-side thing that would most protect that launch:** a first visit to `/satellites/stream-hop/` makes
**143 requests**, which trips the CDN limit on its own. The visitor is then locked out, which is why Jimothy's art is missing
*and* why the arcade breaks right after someone opens Jimothy. **Packing those sprites into sheets is now LANE D, specified and handed to Opus** (`plans/jimothy/HANDOFF-JIMOTHY-ATLAS.md`,
first in the prompt's order). Measured from the tree Sep 16: 141 requests, 18.3 MB, 124 art files all under 360 px, about
seven sheets. The arcade itself is 20 requests and is NOT the burst. ⛔ Web only; nothing on Steam moves before Friday.

---

## 3. HOW TO CHECK A "GAME IS BROKEN" REPORT IN THE RIGHT ORDER

Do these in order and stop at the first one that explains it. Most reports die at step 1 or 2.

1. **Is it an IN DEVELOPMENT game and does his browser have the flag?** `beta:true` games are gated: without
   `localStorage.sws_dev_ok === '1'` a tap opens a "Tester key" modal instead of the game (`swsDevGate`,
   `portal/index.html`). On a browser he has not unlocked, **every** in-development game refuses to open.
2. **Is the edge tarpitting or locking out?** Section 1. Check TTFB, not just the status code.
3. **Does the page serve, and are the served bytes the built bytes?** `curl` it once with a random query and `diff` the
   result against the file in the tree. A 200 is not proof; a byte diff is.
4. **Does it boot clean from the local copy?** Serve the repo and load the game headless: count requests, 404s and console
   errors. If it boots clean locally and serves byte-identical live, **the game is not broken and the fault is between his
   phone and the file.**
5. **Only then** suspect the game.

**Worked example, Burrow Bowl, Sep 16:** he reported "wouldn't even load, it just flashes and nothing happens". Steps 3 and 4
cleared it: it serves 200 at the exact URL the card uses, byte-identical to the tree, and the local copy boots with **0
console errors, 0 404s and 7 requests**. So Burrow Bowl is not broken. It is step 1 or step 2 on his device, and the
twelve-second blank in section 1 is almost certainly the flash.

---

## 4. WHAT IS BUILT AND WHAT IS NOT

**Built and live:** the math catalog, **nine of ten** games, all serving with byte diffs to prove it (Span, Yonder, Crease,
Brim, Glimpse, Notch, Hush, Tint, Gauge) plus the teacher's link builder at `/satellites/math/config/`.
⛔ **CAIRN was never built** (`assets/math-catalog/06-CAIRN-handoff.md`).

**Not built:** lane D (Jimothy atlas, above) is not started. Lane B, the improvement pass on the twelve, is roughly a fifth done. Gerplunk and Inkswing got one pass each.
Airworthy, Updraft, Fathom, Burrow Bowl and the seven he has not commented on since Sep 6 are untouched. His calls 56, 60,
61, 65, 69, 70 and 71 are specified and waiting.

⛔ **None of the twelve has painted art, and nobody has heard the audio in any of them.**

**Waiting on his approval, not on work:** the nine math games are on the arcade's In Development shelf in the repo, but the
push to `main` was blocked by the auto-mode classifier as a production deploy. The commit is built with its parent verified
as exactly `origin/main`. It needs one push.

---

## 5. HIS OPEN DECISIONS (taste, not bugs — do not "fix" these unasked)

From the shot sweep, about 110 screenshots across the seven new games at four widths, all written into
`plans/<game>/HANDOFF-<GAME>.md`:

1. **Wordless screens.** Four of seven games have doors with no words, and BRIM's ask lives on the door and never where the
   choosing happens.
2. **One mark doing two jobs.** Reveals mark the child's choice and the true answer identically almost everywhere. NOTCH's
   find and GAUGE's compare already do it right: fill for truth, outline for choice.
3. **TINT's mixer averages dye against white in linear light**, washing every recipe toward grey, in a colour game.
4. **The corner disease.** The first earned thing sits top-left of an empty board in five games.
5. **CORE's settings gear sits 8 px from the right edge**, fleet-wide.
6. **NOTCH shows the browser's blue focus ring** on five screens.
7. **The nine math cards have no art.** On the shelf they are a small emoji in an empty black rectangle beside full-bleed
   painted neighbours, and they read as holes. Nine pieces of card art is the fix and it is his to commission.

---

## 6. WHERE THE REAL RECORD IS

- `HANDOFF-FABLE-SEP16.md` — what is broken, with a measurement under every claim.
- `HANDOFF-OPUS-SEP15.md` section 10 — the running report, newest first.
- `plans/<game>/HANDOFF-<GAME>.md` section 13 — per game: every red, its cause, its fix, every plant, every shot fault.
- Memory: `project_cdn_429_lockout_sep15`, `project_lane_c_math_progress_sep16`.

## 7. THE LAWS THAT DO NOT BEND

- Commit and push when green. `git add` fenced paths, never `-A`.
- Deploy = a worktree on `origin/main`, `git checkout <branch> -- <paths>`, verify `HEAD~1 == origin/main`, push, then probe
  one served file at a time with a random query. **Never push the whole branch to main**; it carries unfinished games.
- Every gate is watched red on a plant before it counts. Never weaken a gate.
- **A visual change is not done until it has been LOOKED at.** Open the image and name three things wrong in it.
- Player copy: no dashes, no exclamation points. "Sky Wolf Studio", singular. Touch targets 48 px. Text 0.7rem or more.
- Never edit `scripts/`, `music-unlocks.js`, `CLAUDE.md`, `proto/`. Never `pkill -f` a pattern; kill by PID.
