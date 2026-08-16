# HUSH — research brief

Compiled August 2026. Everything below drove a specific decision in the build.

---

## 1. The evidence turned in February 2026, and almost nobody has caught up

**Basner et al., SLEEP 2026;49(5):zsag001** (Penn Medicine). 25 adults, seven nights of polysomnography, randomized crossover. Conditions: silent control, simulated traffic noise (93 events, 45–65 dBA), pink noise at 40 and 50 dBA, earplugs, and combinations.

Findings:
- Traffic noise shortened N3 deep sleep, as expected.
- **Continuous pink noise did not mitigate it.** It made sleep structure worse.
- **Pink noise specifically shortened REM sleep.**
- Foam earplugs did work.
- The authors explicitly caution against indiscriminate use in newborns and toddlers, because REM matters most for a developing brain.

This is the best-controlled study in the category and it lands against the product every competitor sells. It is six months old and the entire App Store is still selling "runs all night."

**Riedy, Smith, Rocha & Basner, Sleep Med Rev 2021;55:101385.** Systematic review, 38 studies, GRADE assessment: evidence that continuous noise improves sleep is **very low quality** — which the authors note contradicts how widely these machines are used.

### What we did about it
Every program in HUSH fades to silence. There is no infinite mode. The default framing is *settle, then let the room go quiet*. Adaptive masking exists so the noise can stay out of the room until something actually needs covering — that is the honest engineering answer to "continuous is bad but the truck still wakes the baby." The evidence panel says all of this in the app, in plain language, unprompted.

This is the positioning. **The noise app that tells you when not to use noise.** No competitor can copy it without repudiating their own subscription.

---

## 2. Where the evidence is genuinely encouraging

Intermittent stimulation is a different intervention from continuous noise, and it goes the other way.

- **Papalambros et al., Front Hum Neurosci 2017** (n=13, 60–84): closed-loop pink-noise pulses timed to the up-phase of slow oscillations increased slow-wave activity; overnight word-recall improvement was roughly three times larger than sham.
- **Ngo et al. 2013** established the effect in young adults.
- **Schade, Mathew, Roberts, Gartenberg & Buxton, Nat Sci Sleep 2020;12:411–429** (n=8, in-lab, supervised): the **open-loop** version — no EEG, fixed timing — raised the percentage of the night spent in N3.

The open-loop result is the important one, because open-loop is all a phone can do.

**Exact stimulus, from the paper:** pink noise bursts, 50 ms long, 5 ms linear onset and offset ramps, repeated every 1.25 s (0.8 Hz), within 10-second presentations.

### What we did about it
The Deep sleep panel implements those numbers exactly — verified in test: 0.80 Hz, 1.250 s period, 50.0 ms bursts, 5.0 ms ramps, 10 s on / 10 s off blocks, 8 bursts per block. Not "inspired by," not an approximation. As far as I can tell no consumer app implements the published stimulus.

The panel also states the limits: n=8, supervised, in-lab, EEG-scored, and the studies used levels near the listener's hearing threshold. A phone on a nightstand is not that. Copying the stimulus faithfully is not the same as reproducing the result, and the app says so.

---

## 3. Hearing safety

**Hugh, Wolter, Propst, Gordon, Cushing & Papsin, Pediatrics 2014;133(4):677–681.** All 14 infant sleep machines tested exceeded 50 dBA at 30 cm on maximum volume — 50 dBA being the hospital-nursery limit. Three exceeded 85 dBA, the adult occupational limit over eight hours. Even at 200 cm, all but one still exceeded 50 dBA.

AAP-derived guidance in circulation: keep it at or below 50 dB at the crib, place the machine roughly 2 m / 7 ft from the head, never on or in the crib.

### What we did about it
This guidance is useless to a parent because it is unmeasurable — nobody owns a sound level meter. So HUSH added a **room meter**: microphone in, RMS to estimated dB, colour-coded against the 50 dBA line, with a calibration slider and an honest statement that phone mics are not calibrated instruments. Put the phone where the baby's head is and read the number. Audio is never recorded or transmitted; the mic node is deliberately not connected to the output.

Volume cap stays on by default at 0.34 of full output.

---

## 4. Competitive landscape

| Product | Model | Notes |
|---|---|---|
| **White Noise (TMSOFT)** | $0.99 + IAP | 10+ years, 45K ratings, the incumbent |
| **myNoise** | Donation | Per-band frequency sliders, hearing calibration, animation modes to prevent habituation. The only genuinely deep one. No timer, no sleep features. |
| **BetterSleep / Calm** | Subscription | Sleep stories, tracking, celebrity narration. Calm gates most things behind a trial. |
| **Endel** | ~$60/yr | Adaptive generated audio keyed to circadian rhythm, weather, heart rate. Best-designed competitor. |
| **LectroFan** | ~$3 one-time | 22 fan sounds. Does exactly what it says. |
| **Dark Noise / Slo / Momental** | One-time unlock | Clean, small, well-reviewed |
| **Zipoapps "White Noise: Baby Sleep"** | **$15/week to remove ads** | $60/month. Reviews describe ads that destroyed a previously loved app. |
| **YouTube** | Ads / Premium | The actual default |

### The two pain points that keep recurring in reviews

1. **Ads waking the baby.** This is the single most repeated complaint in the category. The most-praised free app in the space leads its store listing with exactly this grievance about competitors. A 10,000-signature petition once went to YouTube over ads interrupting sleep videos, and YouTube has since added pause ads and tightened ad-blocker enforcement. A creator selling a $2.99 ad-free copy of a 10-hour white noise video on Gumroad states plainly that YouTube keeps inserting mid-rolls he has disabled.
2. **Playback stopping.** Backgrounding gated behind premium; hard duration caps; "upgrade to continue."

**Your instinct was right and the reviews confirm it.** The YouTube workflow — search, wade through ads, hope the 3-hour video doesn't get a mid-roll at 2 a.m. — is the status quo for a large number of parents, and it is bad for a completely fixable reason.

---

## 5. What HUSH has that nothing else does

1. **The evidence panel.** Cites the study that argues against the product, in the product. Nobody on a subscription can do this.
2. **Published slow-wave stimulus,** implemented to the paper's numbers rather than vibes.
3. **Room dB meter,** which converts unmeasurable AAP guidance into a number a parent can act on.
4. **Adaptive masking** — silent until the room gets loud. Verified stable: steady self-noise settles into the baseline and never chases itself, a loud event lifts gain to 1.93×, and it returns to 1.00× within five minutes.
5. **Comb tuning to an exact frequency,** including the render-quantum fix nothing else has because nothing else tries.
6. **Ok-to-wake light** — the core feature of a $70 Hatch device, as a screen colour.
7. **Full-screen visualizer** with five modes, which also happens to be the direct answer to the black-screen YouTube video.
8. **Free with no mechanism to become otherwise.** No accounts, no server, no analytics, no ad slot. Not "free tier" — structurally incapable of interrupting itself.

---

## 6. Press angles, ranked

1. **"The white noise app that tells you the research says don't use white noise all night."** Contrarian, true, cites Penn Medicine, February 2026, and nobody else has moved on it. This is the story.
2. **A $15/week category, undercut by a free single HTML file.** Solo developer, no server, no tracking.
3. **The measurement angle** — the AAP has told parents "under 50 dB at the crib" for a decade with no way to check it. Here's the check.

Targets: parenting subreddits (r/beyondthebump, r/sleeptrain, r/NewParents), lactation and postpartum groups, paediatric audiology and sleep newsletters, and the "no-subscription software" beat.
