# What exists in the world — research brief 2

The first brief covered apps and the sleep-noise evidence. This one covers everything that *isn't* an app, and what other countries do that the English-language market ignores.

---

## 1. The single most important finding: music has better evidence than noise

This reverses the app's centre of gravity.

**Jespersen et al., Cochrane 2015** (10 RCTs, 557 people): music listening improved subjective sleep quality in adults with insomnia. Mean difference −2.80 on the PSQI, 95% CI −3.42 to −2.17, **moderate-quality evidence** — roughly a one standard deviation improvement.

Compare that to the noise literature from brief 1: a systematic review of 38 studies graded continuous noise as **very low quality** evidence, and a 2026 controlled trial found continuous pink noise made sleep structure worse.

**Music: moderate-quality evidence, positive. Noise: very low-quality evidence, contested.** Almost every product in this category is built around the weaker one.

And the recipe is specific and repeatable across reviews:

- **60–80 bpm** — around a resting heart rate
- **Instrumental**, one voice, soft and smooth
- **Simple structure**, minimal rhythmic change, moderate pitch variation
- **30–45 minutes** before bed, at comfortable volume

That is a build specification, not a vibe. It is now implemented as the Night music generator, and the tempo slider only travels between 60 and 80 bpm on purpose.

### The finding underneath the finding

**Deshmukh / Kumar, on raga Neelambari** (PubMed 9513803): the Karnatic raga traditionally said to induce sleep was tested with polysomnography against a control raga. **No difference in sleep architecture or subjective quality.** The authors concluded the reputation probably reflects a *conditioned response* — most South Indian lullabies are sung in Neelambari.

That is the most useful negative result in this whole project, because it names the real mechanism. **The association is doing more work than the acoustics.** Which means the correct advice is the opposite of what a 200-sound library implies:

> Pick one sound and keep using it. Two weeks of the same sound beats two weeks of browsing.

No competitor says this, because every competitor's retention model depends on you browsing.

A separate systematic review of raga-based music therapy found generally positive effects on subjective sleep and insomnia severity, with Darbari Kanada, Neelambari, Bhairavi and Bageshri recurring — so the tradition isn't empty, it just isn't magic. Hindustani *samay siddhant* (time theory) assigns ragas to watches of the day, and the evening/night assignments line up loosely with circadian reasoning. Bhairavi and Yaman are in the app as scale options, described as approximations in 12-tone equal temperament, because that is what they are.

---

## 2. Japan

Worth taking seriously as a market and as a source of ideas.

**The problem.** Japan sleeps around 90 minutes less per night than the US on OECD figures — long commutes, long hours, and a culture that has not treated sleep as important. Sleep is now a billion-dollar domestic industry. *Inemuri*, napping in public or at work, is read as evidence of hard work rather than laziness.

**The insight nobody else is using.** Yanagisawa (University of Tsukuba) points to Japanese homes being lit too brightly at night, tied to a cultural association between bright light and prosperity — a specifically Japanese problem compared to US and European homes. A sleep app running on a bright phone screen is part of that problem. This is why the visualiser is frame-capped, near-black by default, and has a Void mode that is essentially an unlit screen with a dim clock.

**Product landscape.** Sleep-focused pyjamas engineered around the cup of water a sleeper perspires nightly (Kaimin Labo, GUNZE KAIMIN NAVI, Wacoal Suimin Kagaku, wazarashi gauze from Kyoto). Brain Sleep's head-cooling pillows. MUJI ultrasonic aroma diffusers. S'UIMIN, a Tokyo company doing EEG-based consumer sleep measurement. NeuroSpace running corporate sleep programmes. Nap pods in cities. Otsuka sells a licensed functional food for sleep-rhythm support. The Washington Post's own coverage notes that much of this market has not been rigorously tested.

**The sound tradition is the real find.** Japanese garden design treats sound as a designed material — Fowler calls it an *acoustic horizon*, where hard surfaces amplify local sound and mask the city beyond.

| Device | What it is | Why it's implementable |
|---|---|---|
| **Suikinkutsu** 水琴窟 | An upturned pot buried by a tea-house wash basin. Water drips in and rings like a koto. Edo period, credited to Kobori Enshū. Tuned by hand to musical frequencies. | Literally a tuned resonator excited by a random transient — exactly what the engine already does. Built as droplet chirp plus bell partials on a hirajoshi scale. |
| **Furin** 風鈴 | Glass or iron wind bells under the eaves, descended from Buddhist *fūtaku*. A symbol of summer and of feeling cooler. | Strikes cluster in gusts. Even spacing sounds mechanical; the app gates strike probability on a slow two-rate gust function. |
| **Shishi-odoshi** 鹿威し | Bamboo tube fills, tips, knocks a stone. Built to scare deer; kept because it marks passing time. | One knock every 20–50 seconds and nothing in between. The opposite of a sound machine and genuinely calming for it. |

None of these are sampled. All are generated, which is why the app is still one file with no audio assets.

---

## 3. The gadget shelf, and what it's actually selling

| Device | Price | Mechanism | Verdict |
|---|---|---|---|
| **Dodow** | ~$60 | Projects a pulsing blue light on the ceiling; you breathe with it down to ~6 breaths/min | The mechanism is sound. It is a light that breathes. |
| **Somnox** | ~$600–830 | A robot that physically breathes against you | The only independent RCT (n=44) found it **not effective**. |
| **Morphée** | ~$100 | Screen-free box, analogue keys, 8/20-minute sessions | Reviewers' main criticism: *almost too much choice*. |
| **Hatch Rest** | ~$70 | Ok-to-wake colour clock plus sound | The clock is the feature. It is a coloured light on a timer. |
| **LectroFan** | ~$3 app / ~$50 device | 22 fan sounds | Does what it says. |

Three conclusions the app now acts on:

1. **Paced breathing is the most reliable thing on this shelf**, and it is a light that expands and contracts. That is free. Ember mode already breathes at 5.5 cycles/minute; the Breathe sound does it in audio.
2. **Ok-to-wake is a coloured screen on a timer.** Already shipped.
3. **Too much choice is the failure mode of the good products.** Morphée's flaw is the warning. This is why v4 adds a two-question guide that ends in exactly two recommendations, each with a reason — not a longer list.

---

## 4. How this shaped v4

**22 sounds, every one documented, every one labelled by how much to believe.**

- Good evidence — 2
- Some evidence — 14
- Traditional, untested — 4
- No evidence, just pleasant — 2

Only two sounds in the entire library claim good evidence: Night music and Breathe. Four are labelled as tradition with no trials behind them, and two are labelled as having no evidence at all and being in the app because they are nice. **Golden field is one of them** — the golden ratio is described as a real signal-processing trick for avoiding repetition and explicitly not as a healing frequency.

That labelling is the feature. A sound library where everything is described as scientifically optimised is a library where the descriptions carry no information.

**1,186 words of written information across the library**, in plain language, each card saying what the sound is, where it comes from, and what is and isn't known.

**Two-question guide** — what's keeping you awake, and how do you like your sound. Forty routes, all verified to resolve to a real, documented sound.

---

## 5. Still open

- **Say the conditioning finding louder.** The single most useful sentence in this brief is "pick one and stick with it for two weeks," and it deserves more than a line in an info card. It could be the app's opening screen.
- **More generated voices:** rain on a tin roof, a fire, a train at distance, a gamelan-derived bell set, a shakuhachi-style breath tone. All within reach of the additive engine.
- **Cultural accuracy review.** The Japanese material here is researched but written by an outsider. Before this ships publicly, someone who grew up with these sounds should read the copy.
- **Anonymised aggregate of which sounds people stay with** would be genuinely interesting research and would require a server. Probably still not worth it.
