# HANDOFF — AURA OFF

**To:** Claude Code
**Date:** 28 August 2026
**Owner:** Stephen — SWS Strategic Media LLC / Sky Walk Studio
**Status:** playable, tested, three green test suites. Ready to extend.

---

## READ IN THIS ORDER

1. **`README.md`** — how to run it, how to test it, what not to break.
2. **`ROSTER.md`** — every move and opponent currently in the game. **Generated from code**, never edited by hand.
3. **`docs/AURA-BIBLE.md`** — research foundation, evidence tiers, IP register. **The Addendum v1.1 at the end overrides parts of the main body — read it.**
4. **`docs/AURA-CULTURE.md`** — glossary, real people, locations, bans, the positive case.
5. **`docs/AURA-3D-VR.md`** — 3D environment and VR path. **Parked for now.** Read only when Stephen reopens it.

`../archive/` holds superseded single-file prototypes. **Do not extend anything in there.**

---

## FIRST FIVE MINUTES

```bash
cd aura-off
npm install          # jsdom only, and only for tests
npm run check        # validate → balance sim → integration. All three must pass.
npm run serve        # http://localhost:8080
```

If `npm run check` is green, the project is in a known-good state. **Get it green before you start and keep it green.** If you break something, the failing suite will usually name the exact problem.

---

## WHAT THIS IS

A turn-based gesture duel. Two people, a crowd, no words and no contact. You throw a gesture, they answer, the crowd shifts. It's built on a real 2025–26 phenomenon — teenagers across Latin America holding "aura battles" in public plazas — that traces back to an 11-year-old dancer on the prow of a racing canoe in Sumatra.

The campaign runs five acts: a local plaza, a 200-entrant park bracket, a town where the mayor banned it, the capital with judges *and* a crowd, and finally upriver to where the whole thing started.

**Every location is press-verified. Every character is original.** No real name or likeness ships.

---

## THE FOUR RULES THAT MATTER

### 1. `resolveExchange()` is the only place turn outcomes are decided

In `src/engine/battle.js`. The UI animates its result. The simulator calls it directly. Neither re-implements the rules, so they cannot drift apart.

**If you find yourself computing a score in `src/ui/`, it belongs in `engine/scoring.js` instead.** The old single-file build had the simulator mirroring the turn logic by hand, and that is exactly how balance bugs hide.

### 2. Don't flatten the composure curve

```js
function composure(move, amp){
  const off = amp - move.idealAmp;
  const w = off > 0 ? 0.70 : 0.90;   // tighter tolerance above ideal
  return Math.max(0.50, 1.25 - Math.pow(Math.abs(off) / w, 1.7));
}
```

Score falls off on **both sides** of the ideal amplitude, and harder above than below. Bigger is **not** better. This comes from Prof. Frederick Luis Aldama (UT Austin), who watched a real battle at Parque México and reported that the winner was not the high-intensity performer but the one with total composure.

It is the single mechanic that makes 27 moves feel like 27 different physical acts. A linear ramp would be simpler and would make the game worse.

### 3. Joint names are frozen

```
rot  bob  lean  head  sL  eL  sR  eR  hL  kL  hR  kR
```

These map to real bones when the 3D models arrive. `UPPER` and `LOWER` in `rig.js` are bone-masking arrays — identical meaning for an SVG group or a three.js `SkinnedMesh`. Renaming anything here breaks the port.

Every move must declare `up` + `lo` summing to exactly 1.0. `validate.js` enforces it.

### 4. No move may mock the opponent

BAIT is **self-directed** clowning — falling over, legs giving out, cracking yourself up. Never punching at the other person.

This is the line Costa Rica's Ministry of Public Education drew when it restricted these battles in schools: they're fine until they're used to humiliate, ridicule, harass, or discriminate. Competitors as young as six have been documented.

**This is enforced by `validate.js`, not just written down.** A move called "Point & Laugh" shipped in three consecutive versions while the rule sat in a markdown file being violated. The lint caught it; it is now "Losing It." A paragraph does not survive contact with a code generator. A failing build does.

---

## THE THREE TEST SUITES

Each catches a different class of problem. That's why there are three.

| Suite | Catches |
|---|---|
| `test/validate.js` | Typo'd move ids, weights that don't sum to 1, unlocks nobody can reach, frame times out of order, unknown joints. Plus the content-safety lint and an evidence-tier lint. |
| `test/balance-sim.js` | Design problems. 3,000 battles per matchup across four player skill levels. Finds strictly-dominated moves and difficulty curves that run backwards. |
| `test/integration.js` | What neither can see. Boots the real `index.html` in jsdom, clicks real buttons, plays a battle to the result screen, wins one, and verifies the unlock chain. |

**The evidence-tier lint matters for this project specifically.** If anyone marks a move `V1` — meaning a named outlet documented it inside a real battle — without it being on the sourced list, the build fails. You cannot quietly promote an invention into a fact.

### Current balance

| Act | masher | varied | composed | expert |
|---|---|---|---|---|
| The Plaza | 4% | 76% | 88% | 99% |
| The Park Bracket | 3% | 65% | 80% | 98% |
| The Banned Town | 0% | 33% | 62% | 88% |
| The Capital | 0% | 40% | 65% | 88% |
| Upriver | 0% | 30% | 49% | 75% |

**A masher losing everywhere is correct, not a bug.** The freshness rule models the verified win condition — competitors are documented as needing to reference as many different memes as possible — so repeating yourself has to lose.

---

## HOW TO ADD A MOVE

1. Add an entry to `src/data/moves.js`. Required: `id, name, cat, tier, base, up, lo, idealAmp, dur, hint, frames`. Optional: `special, lag, shades`.
2. `up` + `lo` must sum to 1.0. `frames` must start at `t:0` and end at `t:1`, strictly increasing.
3. Set `lag` only on lower-led moves (`lo > 0.5`). It's the milliseconds the upper body trails the lower — the single biggest quality win in the animation system.
4. **Give it an unlock.** Set some opponent's `drop` in `src/data/campaign.js` to its id, or `validate.js` will fail with `unreachable moves`.
5. `node tools/gen-docs.js` to regenerate `ROSTER.md`.
6. `npm run check`. If the sim reports it as never chosen, it's strictly dominated — give it a distinct mechanical role rather than just raising its numbers.

Tier honestly. If you invented it, it's `V3`. Only mark `V1` if a named outlet documented that specific gesture in a real battle, and add the citation to `docs/AURA-BIBLE.md`.

---

## NEXT TASKS, ORDERED

**1. The crowd as a real system.** Currently 21–41 dots. Aldama's whole cultural reading is that the gathering *is* the point — a free, nonviolent, in-person space in a region with a long history of the plaza. This is the highest-value visual work available and it carries the game's emotional thesis.

**2. Two-stage battles.** A qualifying round, then the head-to-head. Structural borrow from ballroom (which the press themselves compare these battles to). Real depth for modest work. **Use our own vocabulary, never ballroom's — see `AURA-CULTURE.md` §A7 for why this matters.**

**3. Regional move packs.** The trend has distinct local reference sets across Mexico, Brazil, Argentina, Bolivia, Costa Rica, Peru, Ecuador and Spain. Both a design win and the obvious monetization.

**4. Native score language.** The culture already has its own callouts: `+1000 de aura`, `+10.000 de aura`, `aura 100%`, `perdió aura`, and `aura infinita` — which is the literal prize in Argentina. Use these rather than invented units.

**5. The clip loop, visualized.** Reputation already grows the crowd and gives a head start. Make it visible — the documented mechanism is that the street feeds the networks and the networks fill the street.

**6. PWA shell.** Manifest, service worker, offline, install prompt. `src/ui/save.js` is the only file that touches storage; uncomment the localStorage bodies there and nothing else changes.

**Parked, not dead:** VR and 3D environments. See `docs/AURA-3D-VR.md`. Headline finding — **Google Photorealistic 3D Tiles cannot ship**, because the terms prohibit caching and offline use and cap promotional videos at 30 seconds, which makes a store listing video impossible. **OpenStreetMap via `blender-osm` is the license-clean path** and gives real plaza layouts for every arena.

---

## OPEN QUESTIONS — ASK, DON'T INVENT

1. **Six-seven palm orientation.** Know Your Meme, CNN and Fox all say palms **up**, alternating like a balance scale. One Infobae piece says palms down. Ruled palms up on source weight. Verify against raw video before final animation.
2. **Roblox gestures.** Confirmed as referenced in battles; no source describes the physical motion. Deliberately unbuilt.
3. **Aura walk — entrance or scored move?** Unresolved. If it's an entrance, it belongs in the Fit Check system instead.
4. **Is there a women's scene we're not seeing?** Only one woman is named as a competitor across roughly forty sources (Alejandra Bastilla, runner-up in Cochabamba), yet AFP photographed a young woman competing in Mexico City. **The gap is probably in the press coverage, not the culture.** The roster was rebalanced to 9 female / 6 male / 10 neutral on that assumption. Don't build further on it without primary video research.
5. **Round count and judge criteria.** *Resolved as unresolvable.* CNN confirms these battles have no criteria, judges, or rules by design. Our scoring system is original invention, and that's settled rather than a gap.
6. **Does Meta Horizon Store accept WebXR titles**, or require a native APK wrapper? Only matters if VR reopens.

---

## THE THING WORTH REMEMBERING

The winner of the Bellas Artes battle in Mexico City was a 16-year-old named Kaled Rosales. He took 3,000 pesos. Asked why he does it, he said that more than for the prize, he does it to have a good time and take his mind off things at home.

That's the game. Not getting famous. Not beating everyone. A kid who has somewhere to go on a Tuesday, in a public square that belongs to teenagers for twenty minutes.

And the thing almost nobody is building: **Pacu Jalur.** A 17th-century Indonesian boat race where a child called the Togak Luan has the literal job of generating aura for a sixty-person crew, standing on the prow of a forty-metre canoe, where the only real skill is composure on unstable ground. A fifteen-second clip of that made roughly **$6.5 million** for a rural regency in Sumatra and lifted regional tourism 35%.

It's public tradition, it's nobody's IP, and it's the reason Act 5 puts the player on the prow with the deck moving underneath them — the one place where the composure mechanic and the real job become the same thing.

Build the memes to get attention. Build the river to be remembered.
