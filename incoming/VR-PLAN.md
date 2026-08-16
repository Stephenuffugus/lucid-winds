# SKY WOLF STUDIOS — VR / META HORIZON PLAN

Supersedes `HANDOFFSKYWALKVR.md`, which was written from a mishearing and from a
stale picture of the catalog. Written 2026-08-16 after triaging all 183 titles and
re-verifying Meta's live docs.

**Owner:** Stephen / SWS Strategic Media LLC — **Sky Wolf Studios**
**Test device:** Meta Quest 2 (owned, on hand)
**Stack:** unchanged. Single file vanilla HTML/CSS/JS, Three.js where already present, no build step.
**Budget:** $0.

---

## 0. THE CORRECTIONS

The original handoff is directionally right and its technical section is sound. Six
things in it are wrong or out of date, and two of them would have wasted weeks.

| # | The handoff says | Actually |
|---|---|---|
| 1 | "Sky Walk Arcade", `skywalkarcade` | **Sky Wolf Studios**, at lucidwinds.com. Mishearing. |
| 2 | MARBLEBEAT is the flagship VR candidate | **MARBLEBEAT no longer exists as a title.** It shipped last night as PadLab's 4th tab. There is nothing to package. |
| 3 | Cairn is a candidate | **Cairn does not exist in this repo.** No folder, no card, no source. |
| 4 | Sweet Spot is a candidate | Correct. It lives in an external repo (`stephenuffugus.github.io/Sweet-Spot`). |
| 5 | Criterion 1 is "already 3D or trivially lifted" | Then it named three games, **none of which are 3D**. The games that actually use Three.js are Dewball, Super Slice 3D and its three variants, and Create A Critter. |
| 6 | Tier 2 is the store, at weeks 4 to 6, after VR titles | **Meta accepts plain 2D PWAs on the Horizon Store.** The arcade can be a store app now, with no VR work at all. This inverts the whole plan. See §2. |

Two of those, taken together, mean the original Tier 1 would have started by building a
VR version of a game that no longer exists and a game that never did.

---

## 1. M1 IS DONE — the triage

`scripts/quest_triage.mjs` reads every title in the catalog for the things that make a
game unplayable with a controller pointer. Output is `QUEST-COMPAT.md`.

```
183 titles
  160  read clean
    7  worth an eye on the device
    0  blocked
   16  source lives in external repos, not readable from here
```

**Nothing in the catalog is blocked from running in the Quest browser today.** That is
the single most useful fact in this document and it is what makes the 2D store path
viable immediately.

The 7 cautions are five games with a lot of sub-32px controls (Jumping Jimothy, Silt,
Mosaic Garden, Power Scalers, Deepwell), Times Table Quest's pinch zoom having no
controller equivalent, and Sproing's tilt steering needing drag to be the default.

### ⛔ How this number was nearly wrong

The first run of the triage reported **19 blocked games, and every one was a false
positive.** Fifteen matched `gesturestart` + `preventDefault`, which *suppresses* pinch
zoom rather than requiring it. Acting on that report would have stripped a protection out
of fifteen games and made them worse in a headset, to fix a defect that did not exist.
Sproing was called blocked for tilt when its own settings key already offers drag.

The detectors now carry regression guards for both, and the script self-tests. But the
standing lesson holds: **a checker gets verified before the code it accuses.**

### ⛔ What the triage is not

Nothing here has been run on a headset. A game marked clean can still be wrong in VR for
reasons no static read can see: text unreadable at panel distance, a play area that wants
a wrist flick, motion that makes somebody queasy. This is a shortlist so nobody has to
open 183 games by hand. **Every call in it should be checked against the Quest 2.**

---

## 2. THE REORDERED PLAN

The handoff's premise checks out and is better than it knew. Meta forked Bubblewrap
specifically for Quest, the Horizon Store takes both immersive WebXR PWAs and **plain 2D
PWAs**, and IARC content ratings are free and instant. Everything below is $0.

### Phase 1 — Ship the arcade itself, as a 2D store app (days, not weeks)

The arcade is already a PWA with a manifest, HTTPS, and a service worker. It is already
playable in the Quest browser. Packaging it with `@meta-quest/bubblewrap-cli` in 2D mode
puts **183 free games** on a store where the entire catalog is a rounding error next to
Google Play.

This is the exposure play, and it is nearly free. It requires no game changes, no WebXR,
and no new art beyond store assets. It also answers the thing you actually said: *we built
so much stuff that nobody uses.* A storefront listing does more for that in a week than a
single VR title does in a month.

- [ ] Meta developer account under SWS Strategic Media LLC (developers.meta.com/horizon)
- [x] ~~Verify the arcade manifest satisfies Bubblewrap~~ — it already does. `portal/manifest.webmanifest` has `name`, `short_name`, `start_url`, `id`, `display: standalone`, and 192 plus 512 icons in both `any` and `maskable`. `scope` is `/`, which correctly keeps every game inside the app window. Its description said 140+ games and now says 160+, which is what a visitor can open (183 are carded, 22 are dev gated). That description becomes the store listing, so it is worth being exactly right: `scripts/advertised_count_check.mjs` now fails on a claim that is stale **or** larger than the openable count.
- [ ] **Deal with the 13 off-origin games first.** See below.
- [ ] Package 2D, landscape, unique Android package id, signed
- [ ] Store assets: icon set, hero, 3+ screenshots, 30-60s capture recorded on the Quest itself
- [ ] IARC questionnaire, target Everyone or E10+
- [ ] Submit for VRC review

#### The one real blocker in Phase 1: 13 games live on someone else's origin

A store app is a Trusted Web Activity. URLs inside `scope` open in the app window;
anything outside it opens in a browser overlay, and in a headset that means the player
gets ejected from the app and has to find their way back. Of 119 satellite cards, 105 are
same origin and fine. **13 are not**, and the list includes a flagship and the handoff's
own surviving VR candidate:

```
  12 on stephenuffugus.github.io   Tomato Man · Abduct a Chameleon · Abduct a Chameleon 3D ·
                                   Glyph Forge · Litter Bug · Sweet Spot · Tarot Run ·
                                   Sixfold · Letter Launch · Skitterlings · Wild Wardens · Tally
   1 on hunch-mauve.vercel.app     HUNCH
```

(Lucid Winds itself is written as an absolute `lucidwinds.com` URL but that is the app's
own origin, so it stays in scope.)

The fix is the one already used for Aura Farm: **vendor them same origin** into
`satellites/<name>/`. That also removes their dependence on GitHub Pages staying up and
makes them cacheable by the arcade's own service worker. Twelve of the thirteen are repos
we control. It is a day of unglamorous copying and it should happen before packaging, not
after, because a store reviewer opening Litter Bug and getting bounced to a browser is a
VRC finding waiting to happen.

**The risk to name honestly:** a free app on the Horizon Store gets very little organic
traffic unless it is featured. This is a lottery ticket that costs almost nothing, not a
distribution channel. Ship it, measure it, and let the numbers decide whether Phase 2 is
worth the weeks.

### Phase 2 — One WebXR title, chosen from what actually exists

Only after Phase 1 is submitted and measured. The handoff's selection criteria are good;
applied to the real catalog they point somewhere else entirely.

**Dewball is the pick.** By the handoff's own four criteria: it is already Three.js, its
core loop is rolling a ball through a physical world which is the most native thing VR
does, its clock is a few minutes, and it has almost no text. It is also already a
flagship, so a VR version reinforces something rather than starting cold.

Runner up is **Super Slice 3D**, also Three.js, also spatial, also short. **Create A
Critter** is the interesting outlier: it is a maker toy rather than a game, and maker toys
demo extremely well in VR, but it has the most UI to rebuild for a ray pointer.

**Sweet Spot** keeps its place from the handoff and is still the highest reinvention
effort of the group, since motion-controller swing timing is a different game from thumb
timing. Worth it eventually, not first.

### Phase 3 — Everything else, only if Phase 1 or 2 shows traction

A VR lobby scene, more titles, in-app payments. All parked. None of it earns its cost
until something above it works.

---

## 3. TECHNICAL SPEC

§3 of the original handoff is sound and stands as written: feature detect
`navigator.xr.isSessionSupported('immersive-vr')`, VR always additive and never required,
`local-floor` with a `local` fallback, `renderer.setAnimationLoop`, `setPixelRatio(1)` in
XR, under 100 draw calls, 72 fps floor, no artificial locomotion, `THREE.PositionalAudio`,
AudioContext resumed on session start.

Additions from the live docs and from this codebase:

- **Bubblewrap is Meta's fork**, `@meta-quest/bubblewrap-cli` (1.24.1 verified, needs Node 18+). Not upstream Google Bubblewrap, and not a generic TWA tutorial.
- **The `2D` vs `immersive` choice happens at packaging time**, not in the app. Same codebase either way.
- **The Quest thumbstick emits `wheel` events.** Any game with a wheel handler already has a zoom control in the headset. This is why Create A Critter's pinch orbit is fine.
- **The service worker rules do not relax in a headset.** `caches.keys()` is still origin wide, a worker must still only delete its own prefix, and `SHELL_VERSION` and the registration `?v=` still move in lockstep. A store app that strands itself on a stale shell has no update path a player can reach.
- **The funnel hook** goes on the pause and end screens: a QR code and a tappable link to lucidwinds.com, tagged `?src=quest-<title>`.

---

## 4. WHAT I WOULD DO NEXT

1. **Register the Meta developer account.** It is free, it takes minutes, and every path below it is blocked until it exists. This is the one thing only Stephen can do.
2. **Put the arcade on the Quest 2 and play it.** Not a test, a play. Fifteen minutes with the headset on will tell us more about text size, pointer precision and comfort than the triage ever can, and it will confirm or kill the 7 cautions.
3. Then package for 2D and submit.

Phase 2 does not start until 1 through 3 are done and the store listing has numbers on it.
