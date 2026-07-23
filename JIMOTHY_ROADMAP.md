# Jimothy — Roadmap & Execution Plan
_Last updated: 2026-07-23. Pick up here next session._

Legend: 🔴 broken/urgent · 🟡 needs Stephen's decision · 🟢 ready to build (my queue) · 👤 only Stephen can do · 🅿️ parked

---

## ✅ DONE 2026-07-23 pm (committed + pushed to main, live) — "polish for money" pass
- **Retired the AI splash video.** Front door is now the static ink-wash keyart (`jimothy-hero.png`) + "TAP TO START"; one tap → menu. The `.mp4` no longer loads. (Stephen: the 4s AI video was the #1 thing drawing AI hate on socials.)
- **Feast-gate landing now unmistakable.** `obs-trashbags` was used BOTH as the land-here target AND as a curb wall → confusion. Trash bags are feast-only now; walls are plain street furniture (bins/planters/cones/barrier/roadworks); each open gate gets a downward chevron + glowing floor ring.
- **Teaching coach (freeze-and-show).** First power-up ever + first landmark ever freeze the world and show a card (art + name + what it does / skin-unlock explainer). Each new power KIND after that gets a one-line toast. Once per concept ever (`PROG.taughtPower`/`taughtEgg`). How screen made explicit on the landmark→skin unlock.
- SWV/cache **v31→v32**. Verified headless (puppeteer): no JS errors, splash→menu, both coaches fire/freeze/dismiss, render clean while frozen. HEAD 981cd605.

## ✅ DONE earlier session (all committed + pushed to main, live on lucidwinds.com/jimothy)
- 29 skins → full **19-frame animation packs** (16 costumes + 13 critters), all `full:1`
- **Real left-run sprints** for every skin (mirrored run-r → run-l; Scout + Market have hand-painted lefts)
- **Fallback-blob fix** (warm the full pose pack so costumes never flash the vector blob)
- **New ink-wash home-screen icon + portal thumbnail** (+ manifest cache-bust so it actually lands)
- **"Are you sure? — spend 25 caps"** confirm before a paid continue
- **On-page SEO**: sitemap.xml + robots.txt (87 urls) + VideoGame structured data + canonical
- **Daily/Weekly login reward** — free caps daily, a NEW skin every 7th consecutive day
  - Skin pool APPROVED by Stephen: soggy, market, deckhand (commons) → summer, nordic, barista, scout, hardhat (rares). Epics/secrets/shark stay premium.

---

## 🔴 PRIORITY — BROKEN, fix first
1. **Star bug — only ever earns 1 star.** Goals are low (L1 = 2 pizzas + 2 coins over 16 rows), so 1-star-only is almost certainly a bug, not difficulty. Trace star-award logic `index.html ~1714–1730` (s|=1 finish, s|=2 flowers≥advFlowerGoal, s|=4 coins≥advCoinGoal) — check lvFlowers/lvCoins are populated at check time and the bitmask saves to `PROG.adv.stars[done]` before the ~1730 reset.

---

## 🟡 DECISIONS NEEDED FROM STEPHEN (these unblock the build)
1. **Campaign: finite or endless?** It's currently **endless — no ending to beat.** Fork:
   - **A)** Stay endless, guarantee a missing egg every ~3 levels → Sasquatch by ~lvl 24.
   - **B)** Build a **finite campaign (~24–50 levels) with a real finale**, eggs paced across it, last one at the finish → Sasquatch on completion. *(My rec — this is the "I beat it" moment people screenshot & share. Stephen leaning here: Sasquatch @ ~lvl 50.)*
2. **Level 25 reward** — what unlocks? (a skin? a finish/material? a cap payout?)
3. **Difficulty past 24** — green-light the gentle, testable extension? (see 🟢 #1)
4. **Pad-ride tightening** — green-light bumping the pad-center pull 0.10→~0.20? (see 🟢 #2)

---

## 🟢 MY BUILD QUEUE (ready on your go)
1. **Difficulty past level 24** — advDiff caps at 9.5 (~lvl 24) and drives hazard density + chaser speed. Extend as a **shallow continued ramp** (single tunable, fully reversible). Needs Stephen playtesting after.
2. **Pad-ride tightening** — one number: the pad-center pull in the water-ride code (`index.html ~1990`), 0.10 → ~0.20 for a tighter lock. Reversible.
3. **Campaign milestones** (after decision #1):
   - Level 25 → unlock [TBD].
   - Level 50 → Sasquatch (move off the egg-collection, OR keep eggs as the hint trail).
   - "A Sasquatch was sighted deeper in the city…" milestone toasts every ~10 levels.
4. **itch.io page** for Jimothy — fast store presence + SEO backlink + fad-capture while Steam cooks. (Just say go.)
5. **Steam build** (when usage allows) — thin **Electron wrapper** + a `supporterPack()→true` premium-unlock flag (bundles shark + best skins + songs into the paid build) + all store-page art. Model: **paid ~$2.99, premium included** (no Steam DLC SDK needed).
6. **Daily-reward tunables** if wanted — pool/order, cap amounts, or soften reset-on-miss.

---

## 👤 STEPHEN'S TODO (only you can do these)
1. **Home-screen icon** — it's fixed server-side; do the clean re-add: uninstall old Jimothy → Chrome ⋮ → Site settings → lucidwinds.com → **Clear & reset** → reopen → Add to Home screen.
2. **Google Search Console** (10 min, the SEO accelerant): add property `lucidwinds.com` → verify via **HTML file** (send me the file, I'll deploy it) → submit `sitemap.xml` → **Request Indexing** for `/jimothy/`. (Then Bing Webmaster Tools too.)
3. **Steam account** (starts the mandatory ~30-day clock — the sooner the better): create Steamworks partner account, tax/bank/signature, pay the **$100** Steam Direct fee. Realistic Steam launch ≈ 4 weeks from that day.

---

## 🅿️ PARKED
- **"Sky Wolf Studios" name/SEO** — collides with an existing *Skywolf Game Studios* (FL) and skywolfstudios.com is taken (Istanbul). Winning the branded search is hard with this name. Options: distinctive ownable domain (skywolf.games / playskywolf.com) + "tell people the URL," or differentiate the name. Stephen: "not worrying about it for now."
- **More skins / content** — Stephen will make more when time allows. Cutting rig (`scratchpad/cut2.py` + `batch_cut.py`) is built + documented in memory; new sheets drop straight in.
- **Real painted left-runs** for prop-heavy costumes (currently mirrored, props on the flipped side — fine at hop speed).

---

## Reference
- Deploy = commit → `git push origin add-sproing-jumper` and `git push origin add-sproing-jumper:main` (Hostinger auto-deploys main).
- ⛔ Every release: bump **ARTV** (assets) and/or **SWV + sw.js CACHE** (code) together. Currently SWV/cache = **v31**, ARTV = **38**.
- Cutting/masking/skin details live in memory: `project_streamhop_jimothy_buildout.md`.
