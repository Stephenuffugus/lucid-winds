# HUSH — Build Handoff v1.0

**Inhibitory control. A deer in a dawn clearing. Step closer when it grazes; freeze when its head comes up.**

Spec: `HUSH-design-spec.md` — read §2 (claims), §4 Mode 1, §5 (speed vs accuracy), §6 (anti-patterns).
Depends on: CORE v1 (`schedule` — including GLIMPSE's hardening — `reveal`, `adapt.staircase`, `audio`).
Standards: not curriculum-mapped; executive function.

---

## 0. Mission

**The approach is proven.** Gwakkamolé — smash the plain avocados, withhold on the helmeted ones — was built by a team including psychologists and neuroscientists under IES funding, and students improved inhibition on **both reaction time and accuracy**. It was **more effective when difficulty adapted per learner than when it increased identically for everyone**.

**HUSH is the free, no-login, offline, Chromebook-native version of a validated design — plus a physical mode the original doesn't have.**

Red Light / Green Light is the folk version of a go/no-go task. Every four-year-old already knows the rules, so the tutorial is zero words long.

**Claims discipline:** gains demonstrated are *in-game*. A leading researcher in the field put it precisely — people who play these games get better at inhibition **in that game**, and showing transfer to inhibition in general is a much taller order. Consistent with that, one study found gaming enhanced inhibition but **not** updating or shifting. We repeat that caution rather than paper over it.

---

## 1. Invariants

| # | Invariant | Why |
|---|---|---|
| H1 | **Go trials are 75–80% of all trials**, with never fewer than 3 consecutive go trials before a no-go. | **The single most important number in the spec.** The task only measures inhibition if a *prepotent* response exists to inhibit. Frequent no-go trials mean no reflex forms and the game degenerates into ordinary discrimination. |
| H2 | **Adaptive difficulty is mandatory**, across three independent axes. | Fixed-difficulty versions were measurably less effective. |
| H3 | **The no-go cue is a feature difference, never a categorical one.** Same creature, head up. | Gwakkamolé's insight is *helmeted avocados*, not a different vegetable. A categorically distinct signal gets filtered pre-attentively and the inhibition demand evaporates. |
| H4 | **False alarms are cheap** — one step back, a dry leaf-snap, no color change, no run-ending. | At correct difficulty a child false-alarms constantly by design. |
| H5 | **No camera, no microphone, in any mode, under any setting.** | Including Mode 5. `getUserMedia` must not exist in the bundle. |
| H6 | **No violence.** Nothing is hit, smashed, shot, or hurt. The creature is approached. | The source games were built deliberately as shooter-type games *without* the violence. |
| H7 | **One skill per session.** Modes are never intermixed within a run. | The best classroom games focus on one specific cognitive skill with embedded feedback. |
| H8 | **No moralizing in Mode 4.** No patience, self-control, or character language. | It's a mechanic, not a morality test. |
| H9 | **Missed go trials are not scored and not commented on.** | |

Plus CORE G1–G13.

---

## 2. Adaptive axes (H2)

| Axis | Easy → Hard |
|---|---|
| Signal duration | 1200ms → 400ms |
| Go:no-go ratio | 75:25 → 85:15 (more prepotent, harder to stop) |
| Cue similarity | head fully up → head half-raised → an ear twitch |

All three adapt **independently**. A 2-down-1-up staircase per axis.

---

## 3. Speed vs accuracy — an age-sensitive fork

A study of two versions of an inhibition game found a **significant age × condition interaction**: younger participants did better in the **speed** condition, older participants in the **accuracy** condition.

| | **Quick** (younger) | **Careful** (older) |
|---|---|---|
| Scoring weight | steps gained per minute | steps lost to false alarms |
| Signal duration | shorter, faster pace | longer, denser no-go cues |
| Feedback | rewards momentum | rewards clean runs |

Selected at first run by a **picture fork** — two illustrations, no words, no ages. Switchable in settings. Defaulting everyone to "careful" hands younger children the version the evidence says suits them least.

---

## 4. Modes

**1 STEP** (go/no-go — the core) · **2 MIRROR** (interference suppression; three blocks, creature-only → reflection-only → **mixed**, where the demand lives) · **3 SWITCH** (cognitive flexibility) · **4 WAIT** (delayed response) · **5 SIMON** (physical, off-screen).

**Mode 3 is the weakest and the most cuttable.** Flexibility gains are less consistent than inhibition gains and **may require greater novelty and task variability** — so if built, it needs ≥ 5 sortable dimensions (not two), unpredictable switch points, and content that rotates across sessions. Switch cost (RT on switch minus repeat) is the adaptation signal.

### Mode 5 — SIMON, the differentiator

The device gives a command; the child acts **only if it begins with the signal word**. "Hush says: freeze" → freeze. "Hop" → do nothing.

**Why it's in the app:** the interventions with the strongest evidence for inhibitory control are **physical**. School-based physical activity showed positive effects on inhibition in 6 of 8 studies assessing it, with short cognitively-engaging sessions producing immediate improvements. A screen game trains narrow in-game inhibition; Simon Says trains the thing in the body.

**Implementation:** the game speaks or displays the command and **waits. It scores nothing.** An adult plays along, or a sibling judges, or honor system. Optional `DeviceMotion` hop/turn detection, permission-gated and entirely skippable. Runs as a 90-second interlude between screen modes and as a standalone mode.

---

## 5. Data structures

```js
Trial = {
  mode: 'step'|'mirror'|'switch'|'wait',
  type: 'go' | 'nogo',
  cueSimilarity: 0.6,       // 0 = obvious, 1 = near-identical
  durationMs: 700,
  congruent: true,          // MIRROR only
  ruleDimension: 'color',   // SWITCH only
  isSwitchTrial: false
}

Result = {
  outcome: 'hit'|'miss'|'falseAlarm'|'correctRejection',
  rtMs: 412,                // from PAINT timestamp, not schedule
  stepsDelta: +1
}
```

---

## 6. Feedback and the reward system

**Success is proximity.** Every correct step closes distance, and the creature renders **larger and in more detail** — six discrete sprite tiers per species, from far silhouette to full close-up. **Information increases, not just pixels.** By the final steps: whiskers, the wet of an eye, breath in cold air. That escalation *is* the reward. No points, no stars, no coins.

**The final settle is the whole game.** The creature lifts its head, looks directly out, holds two seconds, and instead of fleeing, settles and stays. It then lives in the clearing permanently. **Build this early — it's the reason anyone plays twice.**

**Collectible: the clearing fills.** Over ~24 sessions an empty clearing becomes a living meadow of earned creatures. Unlike a journal or a shelf, it's alive.

**The alert state is signalled by light, not alarm color** — the raised head catches the low sun and gets *brighter*, never red. This game asks children to fail regularly; a red flash would be a punishment cue.

---

## 7. Build order

1. **Frame-accurate signal scheduler + render-time RT capture** — verified under throttle before anything else
2. `generateTrialSequence` with H1's ratio and run-length constraints
3. Clearing renderer + six-tier sprite swap + approach mechanic
4. Mode 1 STEP + `scoreTrial` — core loop
5. `adaptDifficulty` across all three axes
6. **The final settle sequence** — build early (§6)
7. **Mode 5 SIMON** — cheapest mode, highest differentiation, no camera/mic
8. Mode 2 MIRROR + three-block structure
9. Mode 4 WAIT
10. Speed/accuracy picture fork
11. Living clearing collectible, storage
12. Mode 3 SWITCH — last, and cuttable
13. Audio, URL config, SW
14. Accessibility, perf, `getUserMedia` grep, claims grep

**v1 scope = Modes 1 and 5 + the settle + the living clearing.** Complete, defensible, differentiated.

---

## 8. Test gates

- **Go trials are 75–80% across 500 generated sequences**, never fewer than 3 consecutive go trials before a no-go (H1)
- No-go cue similarity is a continuous parameter and the cue is always the same creature — **assert no categorically distinct no-go asset exists** (H3)
- `adaptDifficulty` genuinely varies all three axes independently over a simulated 20-session history
- Signal duration within ±20ms of spec under 4× throttle
- **RT captured from paint, not schedule** — assert by injecting an artificial 100ms render delay and confirming RT does not shift
- **All six creature sprites decoded before first trial** — a decode stall mid-approach reads as a signal and corrupts an RT measurement
- **No `getUserMedia` anywhere in the bundle** (H5)
- Forbidden-claims grep clean
- 60fps sustained through a full approach
- Keyboard-complete (`Space` steps, `←`/`→` for MIRROR)

---

## 9. Things that will tempt you

- **Balancing go and no-go 50/50 "for fairness."** Destroys the prepotent response and the game stops measuring inhibition. (H1)
- **Making the no-go a different animal** because it reads more clearly. It reads *too* clearly. (H3)
- **Adding a startle sound or red flash on a false alarm.** The child will false-alarm constantly by design. (H4)
- **Using the mic to detect "freeze" in Mode 5.** (H5)
- **Scaling one sprite instead of swapping six.** The reward is information, not size. (§6)
- **Measuring RT from when you scheduled the signal.** Corrupts the adaptive engine silently. (gates)
- **Building Mode 3 first because flexibility sounds important.** It's the weakest and most cuttable. (§4)

---

## 10. Ask Stephen, don't decide

- Final name, and how HUSH relates to the existing **"Blink (Don't.)"** AR project — same cognitive skill on two platforms; either siblings that cross-promote, or one gets renamed
- **Whether Mode 5 deserves its own title and URL** — a free, camera-free, mic-free, offline Simon Says is arguably the most immediately useful thing in this catalog for a preschool teacher with thirty kids and two minutes to fill
- Whether to cut Mode 3 entirely
- Whether the clearing becomes hub-level shared content alongside NOTCH's village
