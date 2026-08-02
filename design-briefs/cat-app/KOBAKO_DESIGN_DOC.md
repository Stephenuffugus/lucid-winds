# KOBAKO
### Final Design Document, v1.0
**Store listing:** KOBAKO — Cat Field Unit · **Internal wordmark:** FIELD UNIT · **Studio:** Sky Wolf Studios
**Date:** 2026-08-02 · **Status:** approved for build, Slice 1 first
**Supersedes:** the three concept documents (KŌBAKO / ZUKAN 図鑑 / KOBAKO-Night-Log) and both judge panels.

---

## 1. THE PITCH

KOBAKO is a dated field book about one specific cat, kept by a deadpan 3am veterinary field unit that photographs her, names in Japanese whatever ridiculous shape she is currently in, and files it forever. A cat owner needs it because they already have four hundred photographs of this animal and no structure at all, and this turns that pile into a record with dates, terminology, and a red seal on it. They cannot stop because the coat is fixed for the cat's whole life but the *posture* is not, so the book always has an open square and there is always a named shape she does constantly that they have never once managed to photograph.

---

## 2. THE ONE INSIGHT

**Japanese has a rich, everyday, beloved vocabulary for what a cat is DOING, and it is larger and more used than its vocabulary for what a cat IS. The doing is the collectible. The being is not.**

Two findings, together:

- **Japan does not identify cats by breed.** The Japan Society for the Prevention of Cruelty to Animals classifies cats on its spay/neuter subsidy forms by a 15-category 毛色 (coat colour) list, not by breed. Anicom's 2025 insured-cat data has 日本猫 at rank 1 across all ages (28.8 percent) and no named Japanese breed at all among 0-year-olds, where it hides inside 混血猫. In the UK, 89 to 92 percent of cats are non-pedigree random-bred (Irving McGrath et al., *Genes* 2021;12(10):1619), and the canonical breed benchmark (Oxford-IIIT Pet, Parkhi et al., CVPR 2012) *deliberately deleted crossbred cats from the dataset*. Every competitor asks "what breed is this," which is the wrong question and produces the single most repeated one-star review in the category ("Tortoiseshell isn't a breed").
- **The posture set is large, attested, and nobody has built on it.** Japanese owners use at least fifteen named sitting and sleeping postures in daily speech: 香箱座り (kōbako-zuwari, the loaf, named for a lidded lacquered incense box, ja.wikipedia 香箱座り), スフィンクス座り, エジプト座り, 尻尾巻き座り, スコ座り, 横座り, おじさん座り, アンモニャイト, へそ天, ごめん寝, まぶしい寝, おててないない, ツチノコ, ミーアキャット, 猫鍋. English has "loaf."

The product turns on this because it is the answer to the single-subject problem. One cat has one coat forever, which is why every photo-scanner app is a one-shot toy. One cat has fifteen postures, and you have to *catch* each one. That is a collection axis a person with a single indoor cat can work at for a year, it puts the actual animal's face in the daily loop, and it costs nothing because the owner, not the model, files the posture.

---

## 3. THE CORE LOOP

Two objects. A **LOG** is a free, dated observation. A **PLATE** is a printed card produced by a vision call. Every capture becomes a log. The first three logs of a day are automatically plated. There is no menu, no decision, and no wall.

**Terminology used throughout:** SPECIMEN = one real cat, numbered SP-0001. PLATE = one card, numbered per specimen. LOG = one dated observation. THE BOOK = the month grid. THE INDEX = the field guide of silhouettes. THE DOSSIER = the five-axis owner-sourced record on the card back. THE FILE = the export.

### The loop, tap by tap

1. **Open.** The home screen is THE BOOK: the current month as a grid of squares, filled squares carrying a dated vermilion seal and a posture glyph. At the top, one line: today's FIELD ORDER, identical for every player on Earth. **[FREE]**
2. **Tap CAPTURE.** Camera opens. **[FREE]**
3. **The LIGHT METER runs live, on device, before anything leaves the phone.** `getImageData` on a 64x64 downscale, median cut for dominant coat colour, plus computed EXPOSURE, FRAMING and EYES-LIT readings. The whole interface tints to the cat's coat colour instantly. Three jade bars and a verdict: PLATE WILL HOLD / PLATE WILL NOT HOLD. Unlimited retries, no download, sub-10ms, zero network. **[FREE, UNLIMITED]**
4. **Shoot.** **[FREE]**
5. **FILE THE POSTURE.** The index appears as a row of silhouettes with the English name large and the Japanese small. The owner taps which one it is, or taps 該当なし NONE OF THESE. The unit does not guess and never overrules. One tap. **[FREE, and this is deliberate: see section 14, risk 2]**
6. **The log files.** Dated to the photograph, stamped into today's square in the book, silhouette lights in the index if new. Soft haptic, stamp sound. **[FREE]**
7. **If plates remain today, the plate runs.** Scan beam, tinted to the coat colour extracted in step 3. One `claude-haiku-4-5` vision call at 768px long edge. Roughly 2 to 4 seconds. **[PAID: $0.0026]**
8. **The card slams in** with the existing holographic tilt. Coat read on three axes, finish, denomination stamp, epithet, seals. **[PAID output, one call]**
9. **One DOSSIER ITEM is asked, about the moment just photographed.** "You have just photographed her on the sill. When you walked in, she: [looked up] [did not move] [left] [was already watching you]." Four chips, 56px. One tap. **[FREE]**
10. **A cited line prints,** attached to that item, in the field unit register. The relevant dossier band narrows by a real, computed amount. **[FREE]**
11. **Done.** Export is one tap away and is never pushed. **[FREE]**

Modal session: 40 to 90 seconds. Modal *bad* session (cat asleep in the dark behind the sofa): the light meter says PLATE WILL NOT HOLD, the player shoots anyway, it files as a log with a posture and no plate, and the square still fills. **Nothing in KOBAKO can ever be a wasted session.**

### The three secondary loops

- **BACKFILL [FREE, unlimited, zero API calls].** Import from the camera roll. Photos file into the square of the date they were *taken*, read from EXIF `DateTimeOriginal` with a `File.lastModified` fallback. The owner tags the posture. This turns the four hundred existing photographs into a filled book of real history, and it is the reason the first session is extraordinary. A backfilled log can be plated later out of a daily allowance.
- **THE WISH [FREE, no clock, no notification].** 18 characters at naming. Marked 成就 FULFILLED by the owner whenever they decide it came true, at which point the plate takes a permanent gold seal and moves to the 奉納 shelf and a new wish opens. Unlimited repeats over the cat's life.
- **THE FILE [FREE].** The export. See section 10.

---

## 4. THE FIRST 90 SECONDS

No account, no email, no permission speech, no onboarding carousel, no logo screen.

**0:00** Deep purple ink. One line of DM Mono types out at wide tracking:
`FIELD UNIT. 03:47 LOCAL. ONE SUBJECT. NO FILE OPEN.`
Under it, dimmer and smaller: `GENERATED BY A MACHINE. NOT A VET.` (That is the AI disclosure the Anthropic Usage Policy requires for consumer-facing products, carried by the voice instead of a modal.)

**0:05** One amber button, full width, 56px: **OPEN A FILE**. Nothing else on screen.

**0:07** Tap. System photo picker. Multi-select is on and the prompt reads: `GIVE THE UNIT WHAT YOU ALREADY HAVE. IT WILL DATE THEM ITSELF.`

**0:12** They select twelve, or thirty, or ninety. No upload, no call, no spinner. The client reads EXIF dates locally.

**0:16 THE FIRST HOOK.** The book builds itself in front of them, month page by month page, squares stamping with dates from the last two years. `41 PLATES FILED. 19 SQUARES CLOSED. EARLIEST: 2024-11-03.` They have a two-year field book about their cat and they have been in the app for sixteen seconds. This is the endowed progress effect (Nunes and Drèze 2006, *JCR* 32(4):504-512; Kivetz, Urminsky and Zheng 2006, *JMR* 43(1):39-58, where two pre-filled slots cut completion from 15.6 days to 12.7) used legitimately, because the progress is genuinely theirs.

**0:24** `THE UNIT CANNOT NAME THESE SHAPES. YOU CAN.` The index opens: fifteen silhouettes, English name large (THE LOAF, THE SPHINX, NAVEL TO THE SKY, THE APOLOGY), Japanese small underneath. They tag six photos in twenty seconds by tapping. Six silhouettes light.

**0:44** `SELECT ONE PLATE FOR PRINTING. THREE TODAY.` They pick the good one. Light meter reads it, tints the UI to the cat's colour, beam runs. One vision call.

**0:52 THE SECOND HOOK. THE CARD.** Full holo tilt. `COAT: BROWN MACKEREL TABBY AND WHITE, TABBY DOMINANT. KIJI-SHIRO / キジ白. WHITE COVERAGE 31 PERCENT.` Then one line of etymology in the data font: *Kiji is the plumage of the female Japanese green pheasant. Tora is tiger.* Then: `FINISH: PHEASANT. EARNED BY THE COAT, NOT ROLLED.` Then the denomination stamp and, under it, the standing line: **THE DENOMINATION GRADES THE PRINT. THE CAT IS NOT FOR SALE.**

**1:04** Name field, 18 chars. Placeholder is not "Name." It is `WHAT DO YOU CALL HER`.

**1:10** On commit: `RECORDED: MUGI. Two moras. Per Saito et al., Scientific Reports 2019, n=78, this string is now a discriminable auditory stimulus to her. She will move her ears and her head. She will not reply. Cats never reply. Orienting is the reply.` A joke, a citation and a text input in one object.

**1:20** The paw. Two toggle rows, 48px each, paw drawn palm DOWN with the fingers folding toward the viewer. Row one: 右手 RIGHT, money luck 金運 / 左手 LEFT, people come 千客万来. Row two: ABOVE THE EARS, fortune from far away / BELOW, fortune from nearby. No default pre-selected.

**1:26** The wish, 18 chars, with one line above it: *The cat does not grant this. The cat brings the connection. Gōtokuji, Sōtō Zen temple, Setagaya.*

**1:30** `FIELD ORDER 0412 ISSUES AT 04:00. SIX SHAPES NAMED. NINE UNNAMED.` The app stops asking for anything. Export sits there, one tap, unpushed.

**Not here:** no notification permission request, no account, no install prompt. The Home Screen install card is drawn by hand and fires **after the second successful plate**, when there is something to lose, with honest copy: `THE BOOK LIVES ON THIS DEVICE. PUT IT ON YOUR HOME SCREEN OR SAFARI WILL BIN IT IN SEVEN DAYS.` (WebKit deletes localStorage, IndexedDB and service worker registrations after seven days of Safari use without site interaction; home-screen web apps are the documented exception, and `beforeinstallprompt` does not exist on iOS.)

---

## 5. THE CARD

Fixed export size 1080x1350. Two faces. Every value below is tagged with its source: **[M]** model, **[D]** device, **[O]** owner, **[C]** computed.

### FRONT (the plate)

| Field | Content | Source |
|---|---|---|
| Plate number | `PLATE 041 / SP-0001` | [C] sequential per specimen |
| Specimen name | 18 chars, uppercase | [O] |
| Photograph | The image, EXIF-corrected via `createImageBitmap({imageOrientation:'from-image'})` | [D] |
| Date block | Date the photograph was TAKEN, not scanned | [D] EXIF `DateTimeOriginal`, fallback `File.lastModified` |
| Coat headline | English first, large. Romaji second. Kana third. Example: `BROWN MACKEREL TABBY AND WHITE / KIJI-SHIRO / キジ白` | [M] validated [C] |
| White coverage | `WHITE COVERAGE 31%` and the word-order note | [C] from segmentation estimate |
| Finish | One of thirteen, derived from coat ground. Never rolled. | [C] from [M] |
| Denomination stamp | One of five koban tiers | [C] |
| Press mark | 御朱印 / NIGHT PRESS / none | [C] |
| Posture | Glyph plus English plus Japanese: `THE LOAF / 香箱座り` | [O] |
| Epithet | One line from a hand-written bank of 400, selected by plate readings + coat + posture | [C] from a curated bank |
| Paw | Rendered palm down, with its meaning: `PAW / MIGITE / 右手 / 金運` | [O] |
| Seal row | Up to four condition seals | [C] |
| Standing line | `THE DENOMINATION GRADES THE PRINT. THE CAT IS NOT FOR SALE.` | fixed |

### BACK (the record, goshuin grammar)

| Field | Content | Source |
|---|---|---|
| Vermilion seal block | Dated 朱印, stamped over the corner | [C] |
| COAT, axis 1 GROUND | kiji / saba / cha / kuro / shiro / sabi / mike / buchi / gurē | [M] gated |
| COAT, axis 2 GEOMETRY | mackerel / classic / spotted / ticked / solid, as loanwords | [M] gated |
| COAT, axis 3 WHITE GRADE | 0 to 5: none / mitted / bicolour / harlequin / van / solid white | [M] |
| Etymology line | One sentence on where the word comes from | curated bank |
| TAIL | 長尾 / かぎしっぽ / 短尾 / お団子しっぽ, with `HES7 c.5T>C, p.V2A. DOMINANT, complete penetrance in heterozygotes. Xu et al., Sci Rep 2016.` | [M] gated |
| EYES | 銅色 / アンバー / ゴールド / ヘーゼル / グリーン / ブルー / 金目銀目, or 判定不能 | [M] gated, only when both eyes open and lit |
| MARKS | ハチワレ / 靴下 / 富士額 / チョビヒゲ | [M] |
| BREED | Resemblance only, above a hard confidence floor: `carries Siamese points`. Otherwise `DOMESTIC SHORTHAIR` or `日本猫` as a first-class named archetype with its own art. **Never a percentage mix.** | [M] gated |
| BAND A: THIS PHOTOGRAPH | six bars, gitaigo underneath | [C] from [M] |
| BAND B: THE SUBJECT | five bars with real bands, `n OBSERVATIONS BY [OWNER]` | [O] over time |
| Residual line | `The best validated model of cat personality explains 41.53 percent of the variance across 2,802 cats. Litchfield et al., PLoS ONE 2017. The rest is her.` | fixed |
| FIELD BIAS stamp | When a coat carries a known human stereotype: `tortitude: reported, not demonstrated. Delgado et al. 2012 found the effect is in the observer.` | [C] |
| THE WISH | 18 chars, plus 成就 FULFILLED state and date | [O] |
| Attribution footer | Every research line credited inline. RABO Inc. Catlog Research credited by report number wherever its data appears. | fixed |
| Disclaimer, baked into the canvas | `NOVELTY PLATE. NOT A HEALTH ASSESSMENT.` | fixed |

### BAND A: the six stats, re-derived

**Every one of the six now measures the PHOTOGRAPH, not the animal.** This is the single most important change from v1.0 of the app and it is what makes the stats safe, honest, and actually variable between two shots of the same cat.

| Stat | Derived from | Gitaigo printed under the bar |
|---|---|---|
| CHONK | Frame occupancy plus silhouette compression. **Never apparent body fat.** Hard floor, can never read as a deficit. | もふもふ |
| LOAF | Count of limbs not visible in frame. Four tucked is 100. | ゴロゴロ |
| VOID | Fraction of the subject below a luminance recovery threshold, that is, how much of the cat the plate failed to record | 所在不明 |
| MENACE | Head area as a proportion of frame. The subject has closed distance. | スリスリ |
| ZOOMIES | Motion blur energy across the subject mask | 運動会 |
| FLOOF | Silhouette edge softness | ふみふみ |

Why this matters: the five validated Feline Grimace Scale action units are ear position, orbital tightening, muzzle tension, whiskers change and head position (Evangelista et al., *Sci Rep* 2019;9:19128, ICC 0.89 on 110 stills). A model asked to score "MENACE" or "VOID" will reach for exactly those features. Ngai et al. (*Sci Rep* 2025;15:43461) tested four general chatbots against an expert rater on 50 cat faces and **all four underestimated pain**, with limits of agreement straddling the 0.39 analgesia threshold. By deriving all six stats from photographic geometry and luminance, none of them can accidentally become an unvalidated pain score printed on a shareable card. A descriptor blocklist (tired, sad, squinting, uncomfortable, lethargic, unwell, plus all ear/orbital/muzzle/whisker/head terms) runs over every generated string as a second guard.

VOID being high on a black cat is now correct and funny in the right direction: the stat is explicitly about the *plate's* failure, not the cat's, and the card says so, and 黒 is the lucky colour.

### The coat taxonomy and card types

Typed on **three independent axes**, which is the reconciliation nobody has built. Axis 1 is the Japanese folk system, which classifies by GROUND COLOUR and assumes mackerel geometry. Axis 2 is the western pedigree system, which classifies by PATTERN GEOMETRY. Axis 3 is white spotting.

> **Trap, hard-coded into the prompt and the copy:** サバトラ is NOT "the Japanese for mackerel tabby." 鯖 saba is the fish's SKIN COLOUR, grey-silver. English "mackerel" names the stripe geometry. All three Japanese tora coats are mackerel-patterned by default. Getting this backwards is the fastest way to look machine-translated.

**Word-order rule, shipped as a free mechanic.** In the bicolour names the FIRST element is the dominant colour, and the JSPCA prints both orders as distinct entries. The client computes white coverage and flips the name at 50 percent, printing the number. Two photographs of the same cat can legitimately produce two different card types, and the reason is a real linguistic rule.

**Card types (20 ground types plus 5 marks). Source: JSPCA 15-category 毛色 list, plus common-use terms.**

| # | Kanji/kana | Romaji | English |
|---|---|---|---|
| 1 | キジトラ | KIJI-TORA | brown mackerel tabby |
| 2 | キジ白 | KIJI-SHIRO | brown tabby and white, tabby dominant |
| 3 | 白キジ | SHIRO-KIJI | white and brown tabby, white dominant |
| 4 | サバトラ | SABA-TORA | silver-grey mackerel tabby |
| 5 | サバ白 | SABA-SHIRO | grey tabby and white |
| 6 | 白サバ | SHIRO-SABA | white and grey tabby |
| 7 | 茶トラ | CHA-TORA | red or orange tabby |
| 8 | 茶白 | CHA-SHIRO | red tabby and white |
| 9 | 白茶 | SHIRO-CHA | white and red tabby |
| 10 | 黒 (烏猫) | KURO (KARASU-NEKO) | black ("crow cat") |
| 11 | 黒白 | KURO-SHIRO | black and white |
| 12 | 白黒 | SHIRO-KURO | white and black |
| 13 | グレー | GURĒ | grey / blue |
| 14 | グレー白 | GURĒ-SHIRO | grey and white |
| 15 | 白 | SHIRO | white |
| 16 | 三毛 | MIKE | calico |
| 17 | サビ (べっ甲) | SABI (BEKKŌ) | tortoiseshell, "rust" |
| 18 | 麦わら | MUGIWARA | brown patched tabby / torbie, "straw" |
| 19 | ぶち | BUCHI | piebald |
| 20 | その他 / 判定不能 | SONOTA / HANTEI-FUNŌ | other / unresolved |

**Marks (separate axis, stackable):** ハチワレ HACHIWARE (the face split like the kanji 八; originally 鉢割れ "cracked bowl," rewritten by merchants as 八 for 末広がり, widening prosperity — never write 鉢割れ), 靴下 KUTSUSHITA (socks), かぎしっぽ KAGI-SHIPPO (hook tail), 金目銀目 KINME-GINME (odd eyes), 三毛雄 MIKE-O (male calico).

### Coat determines finish, not rarity

The finish is a fixed property of the cat and can never be rolled or bought, so no cat is finish-poor. Note that the Japanese consumer colour map is explicitly non-canonical (縁起物百科事典 states interpretations 地域や販売者によって異なります), so the app picks one mapping and stays internally consistent.

| Ground | Finish | Meaning printed on the card |
|---|---|---|
| 白 shiro | PEARL | 開運招福, general good fortune |
| 黒 kuro | **SUMI MATTE** (absorbs light, and it is PREMIUM) | 魔除け・厄除け, wards evil. In Japan black is the lucky colour. |
| 茶 cha / 赤 | COPPER | 無病息災, health |
| 金 gold-toned | GOLD LEAF | 金運, money luck specifically |
| 三毛 mike | TRICHROME, all three at once | white + black + orange is the documented reason the calico became the maneki-neko model |
| キジ kiji | PHEASANT, iridescent brown-green | 雉 is the female Japanese green pheasant |
| サバ saba | MACKEREL SILVER | 鯖 is the fish's skin |
| サビ sabi | RUST OXIDE | 錆 is rusted iron |
| 麦わら mugiwara | STRAW | 麦わら is straw |
| グレー gurē | ADZUKI | あずき色, the bean colour used for grey cats' paw pads |
| ぶち buchi | SPLIT LEAF | |
| 金目銀目 | **KINME-GINME**, two-tone, overrides all of the above | treasured as auspicious; clinical term 虹彩異色症 |
| any, low confidence | **判定不能 UNRESOLVED**, matte grey with a printed block | an honest state, not an error |

Shipping black as the "void" or "spooky" tier would import a western superstition, invert the Japanese meaning, and quietly rate the cats a vision model can read least. Matte sumi is the premium finish.

---

## 6. THE PERSONALITY SYSTEM

### Which dimensions, and the attribution correction

The Director's brief assumes Japan leads on cat personality. It does not, and getting this right is the opportunity rather than an obstacle.

- **The best-validated cat personality model is the Feline Five: Litchfield, Quinton, Tindle, Chiera, Kikillus and Roetman, *PLoS ONE* 2017;12(8):e0183455, n=2,802 owner-rated pet cats in South Australia and New Zealand.** Five factors: Neuroticism, Extraversion, Dominance, Impulsiveness, Agreeableness. It is Australian and New Zealander, not Japanese, and calling it Japanese in any store listing or press line is a trivially checkable error that would undercut the exact claim we want to make.
- **What Japan actually leads on is cat COGNITION**, out of Kyoto University, Azabu University and Sophia University: name discrimination (Saito et al. 2019), spatial mapping of the owner from voice alone (Takagi et al. 2021), housemate name-and-face learning (Takagi et al. 2022), and the finding that cats do not avoid people who refuse to help their owner (Chijiiwa et al. 2021). That is a far richer and more original seam and it is what the app's field notes and protocols are built from.
- **Japan's own personality instrument exists and disagrees.** Arahori et al. (2016, *J Vet Behav*, OXTR G738A polymorphism, 94 DNA samples plus a 30-item owner questionnaire, Kyoto) extracted **four** factors: Openness, Friendliness, Roughness, Neuroticism. We print that disagreement on the card as a fact rather than resolving it, because it is honest and it is interesting: two instruments, two structures, neither settled.

**Decision: the dossier uses the Feline Five as its factor structure, named and attributed correctly. Item wording is borrowed, not invented, from Fe-BARQ (Duffy, de Moura and Serpell 2017, 100 items, 23 factors) and the Helsinki CPBQ (Mikkola et al., *Animals* 2021, n>4,300, seven traits).** Arahori's four-factor structure appears as a cross-reference line on the dossier.

### How they are surfaced, and how they relate to the six stats

The six stats are **not replaced.** They are re-scoped and the card says so in its own layout, with no apologetic paragraph anywhere:

- **BAND A: THIS PHOTOGRAPH.** CHONK, LOAF, VOID, MENACE, ZOOMIES, FLOOF. Six bars, all derived from photographic geometry and luminance (section 5). They vary shot to shot. They are honest about being about the plate.
- **BAND B: THE SUBJECT.** Five bars, NEUROTICISM, EXTRAVERSION, DOMINANCE, IMPULSIVENESS, AGREEABLENESS, given field-unit names on the card face: **THE PERIMETER, THE APPROACH, THE CLAIM, THE SWITCH, THE ASK.** Sourced entirely from the owner, thirty to sixty observations at a time.

This split is why the app can print a personality profile at all. **No validated instrument in the field takes a photograph as input.** Feline Five, Fe-BARQ and CPBQ all require an owner who knows the cat; the Feline Temperament Profile needs a live 10-phase interaction; the Secure Base Test needs a six-minute separation-and-reunion protocol. Todorov and Porter (2014, *Psychological Science*) showed different photographs of the *same human* produce different trait impressions. So the app never claims to read personality from a picture, and the layout carries the claim instead of a disclaimer.

### How a personality is discovered over time (the arithmetic, which is real)

Each axis has **k = 12 items** in a hand-written bank, so 60 items total. One item is asked per capture-day, attached to the moment just photographed, chosen round-robin weighted toward the widest band. Each item is answered on four chips scoring 0 / 33 / 67 / 100.

For an axis with `n` of `k` items answered, sum `S` of the answered scores:

```
score        = S / n                          (point estimate)
band         = 50 * (k - n) / k               (half-width, in points)
spread       = sample SD of the answered items
```

`band` is the **actual arithmetic width of the possible mean** given that the unanswered items could land anywhere from 0 to 100. It is not a curve. It cannot be gamed. It shrinks by exactly 4.17 points per item answered on that axis and reaches zero only when every item on the axis is answered.

`spread` is displayed separately and is where contradiction lives honestly. An owner whose answers scatter gets a high spread and the unit prints it: `SPREAD 31. SHE DOES NOT DO THE SAME THING TWICE.` An axis with all twelve items answered but spread above threshold resolves to **変動 VARIABLE**, permanently, which is a legitimate and interesting result rather than a failure.

Under both numbers sits the fixed line: `RESIDUAL UNCERTAINTY: PERMANENT. The best validated model of cat personality explains 41.53 percent of the variance across 2,802 cats. The rest is her.`

**This is a direct correction of a fatal flaw the shippability judge identified in concept 3, whose band was `band(n) = max(5, 40 - round(35 * (n/30)^0.7))`, a pure function of the night count that read none of the answers while the copy claimed it did. A fabricated confidence interval printed next to a correctly formatted citation is a worse offence than anything the competitors were flamed for. The fixed version is also better content, because a band that refuses to close is a story.**

### Why the result will feel true without being flattery

**We are not relying on the Barnum effect and cannot.** Andersen and Nordvik (2002, *Psychol Rep* 90(2):539-45) gave 75 people random NEO-PI-R profiles and found they identified and rejected the ones that deviated from reality. Generic cat flattery reads as broken. The dossier feels specific because it is computed from the owner's own sixty answers, which is felt specificity that is earned rather than faked. That is also the honest limit: **the dossier is a structured record of what one person observed about one cat, not a measurement of the cat.** The app says exactly that, once, on the dossier header: `n OBSERVATIONS BY [OWNER]. THIS IS A RECORD OF WHAT YOU SAW.`

### The protocols (optional, free, and the best thing in the product)

Six guided procedures. None gates anything. All repeatable, all dated, all free. These are the only mechanics where something real happens between the person and the actual animal.

1. **S-19, THE NAME TEST.** Unlocks at 7 filed days. Saito, Shinozuka, Ito and Hasegawa, *Sci Rep* 2019;9:5394, n=78, habituation-dishabituation. Four decoy words mora-matched to the cat's name, then the name on trial five. The owner taps which of five coded responses occurred (ear, head, tail, voice, moved) or NOTHING. The unit computes dishabituation. Result copy carries both nulls popular coverage always drops: cat cafe cats could **not** distinguish their own name from cohabiting cats' names (p = 0.732), and the authors explicitly do not claim referential understanding. Seal: **定位 ORIENTED**. Copy: *She did not answer you. She has never answered you. Orienting is the answer.*
2. **T-21, THE MAP.** Takagi et al., *PLoS ONE* 2021;16(11):e0257611. Leave the room, call once from the new position, return within twenty seconds, record whether she is facing the door you called from. Prints the null, because the null is the point: the effect held for the **owner's voice only**, reversed for cat meows and vanished for electronic sounds (p = .830). Seal: **地図 MAPPED**.
3. **H-20, THE SLOW BLINK.** Humphrey, Proops, Forman, Spooner and McComb, *Sci Rep* 2020;10:16503, **University of Sussex, UK, not Japan**. A ten-second timing bar, then a free extra capture.
4. **T-22, THE HOUSE.** Multi-cat only. Takagi et al., *Sci Rep* 2022;12:6155. Paired with Behnke (2021, Oregon State honours thesis, 18 cohabitant dyads) which found 72 percent of cats Avoidant toward their housemate and only 17 percent Secure, so the bond sheet is usually frosty and the app says so flatly, which is funnier and truer than a friendship meter.
5. **K-19, THE GAZE.** Koyasu and Nagasawa 2019: cats look at a familiar human for a **shorter** duration when being gazed at, the opposite of the dog pattern.
6. **C-21, THE FIELD NOTE.** Not a test. Fires unprompted on the 21st filed day, no reward attached. Chijiiwa, Takagi, Arahori, Anderson, Fujita and Kuroshima, *Animal Behavior and Cognition* 2021;8(1):23-35: cats watched a bystander refuse to help their owner and over four trials showed neither preference for the helper nor avoidance of the non-helper. Copy: *She is not keeping score. Nothing you did in 2024 is on file.*

**Not used, deliberately:** the Nagasawa and Kikusui oxytocin gaze loop (*Science* 2015) is a **dog** finding and wolves did not show it. The cat evidence is thin and sex-specific (Hattori et al. 2024, n=30, males only). Marketing "the love hormone loop" for cats would be borrowing a dog result and would be visibly wrong to anyone in the field.

---

## 7. RARITY WITHOUT LOSERS

Three axes, three different logics, all stated openly in the app. **Only one of them contains any randomness and none of them can be purchased.**

### Axis 1: FINISH. A fixed property of the cat. Never rolled.
Thirteen finishes derived from coat ground (table in section 5). The owner can verify it by looking at their own animal. No cat is finish-poor, and black gets the premium matte.

### Axis 2: DENOMINATION. Earned, deterministic, per-plate, and graded against the cat's own history.

The five tiers are one coherent system, the koban denomination ladder. The written value on the maneki-neko's coin escalated over time (千両 → 万両 → 百万両 → 千万両 is the modern standard, and modest older cats carry 千両), and the top of the ladder is **小判なし NO KOBAN**, because Gōtokuji's own cat holds no coin and raises its right paw, and the temple states: 「招福猫児は、人を招いて『縁』をもたらしてくれますが、福そのものを与えてくれるわけではありません。」 It brings the connection, not the fortune. **The rarest card in the app is the one with no coin printed on it.**

Points, all of which are properties of the photograph and none of which are properties of the animal:

```
PLATE QUALITY      0 to 3    light meter composite (exposure, framing, eyes lit)
POSTURE NOVELTY    3 / 1 / 0 first / second / thereafter for this posture, this specimen
FIELD ORDER MET    +1
CONDITION SEALS    +1 each, capped at 3
FIRST PLATE EVER   +2        once per specimen, unrepeatable
```

**Coat contributes exactly zero. Breed contributes exactly zero.** Scottish Fold, Munchkin, Persian and every brachycephalic or chondrodysplastic conformation are on a hard exclusion list and can never raise a tier, because the fold is a dominant TRPV4 variant that also produces osteochondrodysplasia (Gandolfi et al., *Osteoarthritis Cartilage* 2016) and the short legs are chondrodysplasia. Gilding a genetic disease is not a position this studio takes.

The RAW score is then converted to a denomination as a **percentile against this specimen's own trailing 20 plates**, with absolute gates on the top two tiers:

```
bottom 50%                                        千両     SEN-RYO
50 to 80%                                         万両     MAN-RYO
80 to 94%                                         百万両   HYAKUMAN-RYO
94 to 99.4%  AND >=1 condition seal AND quality>=2 千万両  SENMAN-RYO
top 0.6%     AND >=2 seals AND quality 3 AND order met  小判なし  NO KOBAN
```

### The distribution, and the proof that no cat is the bad one

Across all plates, all users, by construction:

| Tier | Kanji | Share |
|---|---|---|
| SEN-RYO | 千両 | **50.0%** |
| MAN-RYO | 万両 | **30.0%** |
| HYAKUMAN-RYO | 百万両 | **14.0%** |
| SENMAN-RYO | 千万両 | **5.4%** |
| NO KOBAN | 小判なし | **0.6%** |

**Because the denomination is a percentile against the specimen's own plates, this distribution is identical for every cat on Earth by construction.** A black moggy photographed in a dark hallway and a show Ragdoll under studio lights produce the same grade distribution over a hundred plates. That is not a promise in copy, it is arithmetic, and the RATES screen says so in one line: `EVERY SUBJECT PRODUCES THE SAME LADDER. THE PLATE IS GRADED AGAINST ITSELF.`

**The floor tier is designed first and designed best.** 千両 SEN-RYO gets the best-written epithets in the bank, its own visual identity, and the Edo fact that modest older cats carry 千両. It is the most common outcome on purpose. Berger and Milkman (2012, *JMR*, 6,956 NYT articles) found awe raises share odds 30 percent while **sadness lowers them 16 percent**, so there is no disappointing reveal beat anywhere in the loop: a floor-tier reveal is an addition, never a verdict.

**Every specimen's rarest card is its first one.** The 初 HATSU seal is unrepeatable and everyone gets exactly one.

### Axis 3: THE PRESS. The variable-ratio layer, on the sheet of paper only.

Ferster and Skinner (1957) established variable ratio as the highest steady response rate and most extinction-resistant schedule. It runs here on the print and never on the animal.

- **御朱印 GOSHUIN, 1 in 512** (deliberately anchored to Pokemon GO's documented base shiny rate), derived deterministically from the plate's pixel hash so it cannot be re-rolled. **Boosted to 1 in 22 on 22 February and 1 in 29 on 29 September.**
- **A visible ceiling at 300 plates.** The unit guarantees one. The counter is on screen. Framed in press-run language, not gacha language: `PRESS RUN: 1 IN 512 SHEETS TAKE THE SEAL. THE UNIT GUARANTEES ONE BY PLATE 300.`
- **Free, knowledge-gated presses:** NIGHT PRESS for any plate exposed 00:00 to 04:00 local, plus the two calendar dates. Not documented anywhere in the app.

**No near-miss taunt, ever.** Clark et al. (*Neuron* 2009;61(3):481-490) showed near-misses raise the urge to continue while feeling *worse*, and only when the player believes they had control. There is never a "SO CLOSE TO GOSHUIN" line. The honest pre-hoc version is the light meter: the skill signal arrives **before** the irreversible tap, so a retry is a craft decision rather than a lever pull.

### The condition seals (about fifteen at launch, none documented in the app)

夜 NIGHT PRESS (00:00 to 04:00) · ニャンニャンニャン (22 February) · 来る福 KURU-FUKU (29 September) · 初 HATSU (first plate of a specimen) · 又 MATA (specimen aged 10 or over) · 三毛雄 MIKE-O (mike coat plus owner-confirmed male) · 鉤 KAGI (kagi-shippo) · 金目銀目 KINME-GINME (odd eyes, both open and lit) · 二匹 NIHIKI (second cat in frame) · 香箱 KOBAKO (the loaf, filed on the day the order asked for it) · 節 SETSU (first plate of a calendar season) · 年 NEN (same date, one year on) · 成就 JŌJU (fulfilled wish, gold) · 皆勤 KAIKIN (every square in a month filled) · 判定不能 (an unresolved plate, which is a real seal and not a failure).

**Let the rare conditions go undocumented.** Neko Atsume never told players which toys drew which rare cats and the community built the wiki, and that discovery gap was the marketing (4M downloads May 2015 to 10M by 4 December 2015 against an internal target of 50,000 a year). A stamp nobody can explain is the strongest possible reason to post an exported PNG.

---

## 8. THE DAILY RITUAL

**THE FIELD ORDER.** One global daily assignment, identical for every player on Earth, derived on device from the UTC date via a fixed table with no server call. Issues at local 04:00.

`FIELD ORDER 0412. THE SUBJECT AT REST, FROM DIRECTLY ABOVE.`

**Cost: zero. Never a vision call, never a network call, eight lines of code plus a table.**

**What it gives:** meeting it stamps the day's square with the order number, adds +1 to the plate's denomination, and makes two friends' exports comparable. Wardle's stated reason the Wordle grids spread is that everyone was solving the **same** puzzle, not a random one per player, and that is the entire social layer of a product with no feed.

**Critical design correction.** The order is **never a rare posture.** DOCUMENT THE MEERKAT is not achievable on demand and within a week the order becomes decoration that players fire a random photo at. Every one of the roughly 60 hand-written orders is completable by any cat on any day:

- **Framing orders:** from directly above, from floor level, from behind, with one paw out of frame, filling the frame.
- **Light orders:** in the last light of the day, under a lamp, in a doorway, backlit.
- **Context orders:** with something of yours in frame, in the place she chose rather than the one you bought, on a surface she is not allowed on.
- **Time orders:** before you feed her, at the hour you read this, the first time you see her today.
- **Cognition orders** (drawn from Takagi et al. 2021): `CALL THE SUBJECT ONCE FROM ANOTHER ROOM. PHOTOGRAPH WHAT ARRIVES.`

The rare postures live in the index as an untimed hunt, forever, never as a daily demand.

**What it costs the player to miss it: exactly nothing, permanently.** Zagal, Björk and Lewis (FDG 2013) give the decisive test for the "Playing by Appointment" dark pattern: it is nullified if completing appointments is not required for progression. A missed square is never marked as a failure and can be **back-filled later with any photograph actually taken on that date**, which is why the EXIF dating rule is generous rather than restrictive.

**THERE IS NO STREAK COUNTER ANYWHERE IN THIS PRODUCT.** A streak attached to a living animal a person loves converts a broken counter into a felt failure of care. The Snapchat literature (2,483 early adolescents, *Computers in Human Behavior Reports*) documents exactly that obligation and distress. What ships instead is a per-month 皆勤 KAIKIN seal, awarded and never revoked, plus two **FROST** tokens held at once (Duolingo's published A/B: doubling streak freezes raised DAU +0.38 percent; their weekend amulet produced +4 percent week-later returns and 5 percent fewer streak losses) and an explicit PAUSE. Nothing here can break.

**Notification discipline: exactly one per day, at an hour the user picks, in the field unit register, never in the cat's voice.** Notifications written as the animal are impersonation of a real being the user is bonded to, and they are catastrophic the first time one fires for a cat that has died.

**iOS reality, stated as a loop dependency and not a checklist item:** web push does not exist on iOS outside an installed PWA on 16.4 or later. Until the user installs to the Home Screen, the daily notification never fires. **The install prompt is therefore not a growth step, it is a precondition of the loop**, and it is drawn by hand after the second successful plate with honest copy about the seven-day WebKit storage deletion.

---

## 9. PROGRESSION AND COLLECTION

Three surfaces, deliberately redundant so that if one fails to land the other two still pull.

### THE BOOK (the retention object)
A goshuin-chō month grid. One page per month, one square per day, each filled square carrying a dated vermilion seal, a posture glyph and the plate's finish. Backfill means the book usually opens with two years of history already in it. Progress renders as **proportion of distance remaining**, never as a raw count, because that is the functional form Kivetz, Urminsky and Zheng's goal-distance model fits. A month at 19 of 31 is a real, keepable page and is never labelled incomplete. The year spread lays twelve pages side by side. The anniversary view puts this year's plate for a given date beside last year's.

### THE INDEX (the field guide, 図鑑)
Greyed silhouettes from first launch, before the player owns anything. Two shelves:

- **POSTURE, 15 slots, solo-completable.** English name large, Japanese small. Filling one prints its etymology. This is the shelf a one-cat household can finish, and it is shown first and highest.
- **COAT AND MARK, 20 ground types plus 5 marks, labelled THE STREET.** Header states plainly: `THIS SHELF DOCUMENTS THE WORLD, NOT YOUR CAT.` Filled by photographing any cat you have permission to photograph: a friend's, a relative's, the one at the cafe. It is openly not completable by one indoor cat and never pretends otherwise.

**Duplicates never junk.** A repeat fill raises that slot's PRESS COUNT and at 3 presses the slot upgrades LINE to INKED to SEALED, three visibly different renderings. This is the cheapest possible fix for the loudest complaint against the nearest competitor ("I also want to be able to delete some of them, keeping only the best ones, instead of having MANY of the same cat"). A repeat is progress.

### THE DOSSIER (the meta-collection for a person with one cat)
Five bands narrowing over 60 observations (section 6), then a SECOND FILE that measures **drift** rather than identity: `SHE HAS MOVED 9 POINTS ON THE APPROACH SINCE MARCH.` Framed as consolidation, never as "your cat changed," which is the honest framing given the longitudinal work (*Developmental Psychobiology* 2023) found individual differences become more **repeatable** with age.

### What completing a set does
**Every completion reward is free and effort-gated. Nothing random is ever purchasable, and no paid randomness is ever attached to set completion.** Complete gacha (コンプリートガチャ) has been prohibited "card matching" under the 景品表示法 since the Consumer Affairs Agency ruling of 18 May 2012, enforceable 1 July 2012, and the index is a set-completion mechanic. Keeping it free permanently keeps the Japanese market open.

Closing a track never ends in a full stop. Kivetz et al. documented a **post-reward effort collapse** the instant the first reward lands, followed by re-acceleration toward the second. So:

- Closing the 15 posture slots immediately opens **THE SECOND PRESSING**: the same 15 postures in a different season, **already pre-filled** with any the player happened to shoot out of season. A player who closes the posture shelf in August wakes up with 4 of 15 winter slots already done.
- Closing a month grid produces a **MONTHLY SHEET**: a printable nine-up binder page of that month's plates, exported free as a single PNG. It is an object, not a currency.

### The terminal state, deliberately designed
The documented Neko Atsume completionist's motivation "completely dissipated" the moment the book was full. So the last page is not a cliff: a printable full-collection binder, a dated COMPLETE seal, and **one thing that only exists after completion**: the annual re-scan view, the same cat on the same date across years. **The cat in the photograph is genuinely getting older. That is the one axis a real-cat app has that no virtual pet game can produce, and a card from 2026 beside a card from 2029 is a keepsake no gacha can manufacture.**

### There is no currency
Deliberate. The clearest documented cause of Neko Atsume's decay, in Japanese players' own words, was 「にぼしあつめ」, sardine collecting: everything bought, every cat collected, currency accumulating into a void. v1.0 of this app has no currency. That is a feature and we defend it.

**And nothing the player owns may ever degrade, expire, break, or require maintenance.** Neko Atsume 2 added item durability in 2024 and it is the single most criticised change in the sequel. Cards do not rot. The only direction is accumulation. Non-negotiable in a category whose promise is 癒し.

---

## 10. SOCIAL WITHOUT A FEED

**No public feed, no stranger surfaces, no comments, no leaderboard, no cross-user rarity percentile, no contact upload, no invite gating, no auto-posting.** Stated on the store page as a design position, not a backlog item.

This is the load-bearing ethical choice in the product and it will come under the most commercial pressure precisely when the app starts working. The evidence is unambiguous: Cat Scanner's in-app community chat generates bullying and moderation complaints inside its own App Store reviews. Pet Parade's voting economy generates "you ruined it" one-stars. Locket reached roughly 80 million downloads with no feed, no comments and a hard friend cap, so private-by-default is not a growth handicap. And structurally: **the instant rarity is comparable between strangers, somebody's cat is objectively last**, and the affectionate frame collapses into a judgement.

### Three ways other people enter

1. **The export, handed over by the OS share sheet.** That is the entire distribution mechanism.
2. **The shared daily field order.** Two friends' cards from the same day sit next to each other meaningfully because they were answering the same assignment. This is Wordle's grid mechanic without the grid.
3. **Their cat, in your camera.** The STREET shelf fills by photographing any cat you have permission to photograph. Handing your phone to a friend and scanning their cat in front of them is the single most reliable word-of-mouth act available to this category, and it is why the plate allowance is three per day and not one.

**Explicitly cut:** the trade-code system from concept 2, in which a 14-character base32 string typed by hand yielded a procedurally rendered ink drawing of a cat you have never met. Both judges killed it independently. It has no emotional payload, and the object it redeems into is an uncosted procedural cat-illustration engine harder than the studio's existing plant renderer.

### What the exported image carries

Fixed 1080x1350. Also shipped: a 1080x1920 story crop and a 1200x630 link crop.

- The photograph, the cat's name, the epithet, the coat headline in English then romaji then kana, the denomination stamp, the finish, the posture, any seals.
- **A dated vermilion seal block in goshuin grammar.** The Japanese proof-of-visit artefact is the 御朱印: a dated inked entry with a red 朱印 stamped over it. This reads as **record** rather than **meme**, which matches the field unit voice, and it makes the exported image look nothing like the wall of western holo cards it will land beside.
- A small non-ugly wordmark and a short URL. **No QR code, no download badge, no app-store banner.** Wordle's grid carried literally no branding and produced roughly 100,000 public shares on a two-million-player day, about 5 percent. That is the number to instrument against.
- **Legible at 200px wide.** Title and denomination must survive a thumbnail.
- Baked permanently into the canvas in the data font: `NOVELTY PLATE. NOT A HEALTH ASSESSMENT.` **Anything not on the canvas does not exist downstream.**
- Export is one tap from the reveal, never from a menu, and never pushed.

**Technical, because this is a primary engineering surface and not a button:** fixed 1080x1350 backing store with **no devicePixelRatio multiplication** (DPR 3 gives 13.1 megapixels against mobile Safari's hard 16,777,216-pixel canvas area cap, which fails silently to a blank canvas with no exception). Gate the draw on an explicit per-face `await document.fonts.load('800 100px "Bricolage Grotesque"')` for **every weight actually drawn**, because `document.fonts.ready` only waits for fonts the layout engine decided to load and canvas-only text never participates in layout. Encode `image/jpeg` at 0.92 or `image/png` only, **never `image/webp`**, which Safari and iOS Safari silently downgrade to PNG. Render in a Worker via `transferControlToOffscreen` where available (Safari/iOS 16.4+, Chrome Android 69+) with a main-thread fallback. **Self-host and subset a real Japanese display face (a Noto Sans JP or M PLUS weight) before any kana ships**, because Bricolage Grotesque has no Japanese glyphs and the export will render tofu boxes.

---

## 11. ECONOMY AND MONETISATION

### No currencies. None.
There is no soft currency, no hard currency, no energy, no cans, no film credits that money buys.

### The free tier, stated on the store page as a design position

`NO ADS. NO LOOT BOXES. NO RANDOM PURCHASES. NO SUBSCRIPTION. NO SCAN LIMITS YOU CAN PAY TO REMOVE.`

Free forever: unlimited logs, unlimited backfill, unlimited light meter, **3 plates per day**, up to five specimens, all 20 coat types, all 15 postures, all finishes, all denominations, all presses including 御朱印, every seal, the full dossier and all protocols, the book, the monthly sheet, every export at 1080x1350, the lost-cat poster, and memorial mode.

This is competitive analysis, not sentiment. **CatchCat** went from a viral launch to **2.968/5 across 2,612 ratings in about six weeks** on one ad per can and one ad per catch. **MeowTalk** went from 20 million downloads to **1.531/5 across 90,728 ratings** on a move to $7.49 per week plus an ad before every capture, and then lost its own name on iOS to a Turkish shell company. **Neko Atsume 2** sits at 4.7 stars across 4,500+ ratings with praise centring unprompted on it being completely free with no ads. Both direct competitors executed the ad-gated-capture mechanic in public and in living memory.

### The vision API cost model, with real numbers

Model: `claude-haiku-4-5` (standard resolution tier, 1568px cap, so nothing is lost by not going higher).
Image: 768px long edge, 4:3, so 768x576. Visual tokens = ceil(768/28) x ceil(576/28) = 28 x 21 = **588 tokens**.

```
Input:   588 image + ~900 system/schema/text  = 1,488 tokens @ $1/M  = $0.001488
Output:  ~220 tokens of JSON                             @ $5/M  = $0.001100
TOTAL PER PLATE                                                   = $0.00259
```

| Scenario | Plates/month | Vision cost/user/month |
|---|---|---|
| Median active user (1.2 plates on ~14 active days) | 17 | **$0.044** |
| Blended cohort average | 22 | **$0.057** |
| Heaviest possible user (3/day, every day) | 90 | **$0.233** |

Everything else in the product costs **$0**: logs, backfill, the light meter, the posture filing, the field order, the book, the index, the dossier, the protocols, the wish, every export.

**The real constraint is not per-plate price, it is the tier spend cap.** The Start tier has a **$500/month hard cap** after which API usage **pauses until the next calendar month.** $500 ÷ $0.00259 = **193,000 plates/month**, which is roughly **8,700 MAU at the blended average** and only **2,140 MAU if every user hits the cap every day**. Mitigations, all shipped before any public link:

- **Move to Build tier ($1,000) before launch.** Start tier is not a launch configuration.
- **Content-addressed scan cache.** Canonicalise via `createImageBitmap({imageOrientation:'from-image'})`, downscale to a fixed 256x256, SHA-256 the raw RGBA buffer, key `scans/{pixelHash}` in Firestore. A re-scan of the same photograph is free and returns the identical card. This also kills the re-roll-until-MYTHIC exploit dead on arrival, and it is the only determinism available: `temperature`, `top_p` and `top_k` are **removed on Claude Opus 5, Opus 4.8, Opus 4.7 and Fable 5** and return 400, and non-default values are rejected on Sonnet 5.
- **Per-uid daily quota incremented inside a Firestore `runTransaction`**, never a client check and never a read-then-write, so two tabs cannot both pass. Cache lookup happens **before** the quota decrement so a re-scan is free.
- **`maxInstances` set on the function** as the second spend brake.
- **Per-call `usage.input_tokens` and `usage.output_tokens` logged to a daily rollup doc**, so cost per plate is measured and not assumed.
- **Blind A/B on 50 real cat photos at 512 vs 768 vs 1024px before locking the resolution.** At 512px the image is 266 tokens and the plate drops to about $0.00227, and the image falls from 40 percent of input tokens to 23 percent.

### What money buys: three deterministic, named, one-time SKUs, all sold after the artifact exists

1. **THE FIELD KIT. $8.99 / £6.99 / ¥1,000, one time, never expiring.** Unlimited plate history indexing (the free tier indexes the most recent 60 plates; nothing is ever deleted, and buying the kit restores the index), five additional card stocks and frame finishes **picked, not rolled**, 2400x3000 export, a four-up A4 home print sheet, and the full method write-ups for all six protocols. Every card the player already owns keeps working forever if they never buy it.
2. **THE PRINT. $14 for a single 89x127mm card**, printed with the real foil or matte finish and the dated seal, posted out. Bought most often for a 小判なし plate, a first plate, or in memoriam. **$18 for a nine-up binder page.**
3. **THE YEAR BOOK. $34 plus shipping.** A physically bound goshuin-style book of the year: twelve month pages of real stamps, twelve chosen plates, the wish and its fulfilment date, the coat page with etymologies, the anniversary spread. Ordered once a year in January for the year just finished.

This is the Doconoko model, and **Doconoko is the highest-rated real-cat app in Japan at 4.72 from 9,079 ratings, free and ad-free for a decade, monetising printed calendars and photo cubes.**

### What we will be pressured to sell and will not

Rarity, in any form (the moment rarity is purchasable, every exported card becomes unfalsifiable and the export **is** the distribution strategy). Extra plates a la carte (that is an energy meter with a nicer name). Any random paid element (Zendle and Cairns 2018, n=7,422, found loot-box spend associated with problem-gambling severity **more strongly** than other in-game spend, implicating the randomisation itself). Any set-completion reward behind paid randomness, ever.

### Honest ceiling
Cats and Soup has 50 to 60 million downloads and Sensor Tower panel revenue in the low tens of thousands of dollars per month per platform-region. **The cozy cat category reaches enormous numbers of people who will not pay.** Plan the economics around near-zero server cost per user and a single-digit percentage buying a physical object, not around a monetised loop. There is not one here, and building one would destroy the thing that makes it work.

---

## 12. THE VOICE

**Register:** a veterinary field unit working a night shift, filing a record about an animal it finds absurd and is careful not to insult. Clinical, dry, precise, never warm, never mean, never cute. The joke works because the app refuses to acknowledge that it is a joke.

**Copy rules:**
1. **Every word is hand-written and banked.** Epithets, etymologies, field orders, refusals, protocol results. Curated in a versioned file the way the botanical game curates its haiku banks, and **never generated at runtime.** Hacker News's verdict on the nearest competitor was literally "AI Slop," and the entire competitive set now reads as machine output. This is the moat.
2. **Never anthropomorphise into invalid emotions.** No jealousy, no compassion, no revenge, no plotting, no missing you. Bouma et al. (2023, n>1,800 Dutch cat owners) found owners who anthropomorphise are **less** accurate at reading cats from photographs, and owners who frame the cat as a child attribute the most ecologically invalid emotions. A card that says the cat is plotting revenge actively trains the user toward the worst-performing interpretive style.
3. **The unit speaks about the app, never as the animal.** No notification, no line, no copy, ever, in the cat's voice.
4. **State a fact, then let it be funny.** The etymology is the joke. Never point at it.
5. **Cite inline, in the data font, at the same size as everything else.** A citation is not a footnote, it is part of the sentence.
6. **Never claim certainty the field does not have.** 判定不能 UNRESOLVED is a first-class output, printed without apology.
7. **No puns, in any language.** English cat puns collapse the register into every other cat app. Japanese 地口 puns do not survive translation and would need a native writer to write from scratch, not translate.
8. **No adjective where an observation will do.** Not "she is affectionate." "She was already watching the door."
9. **Every Japanese word ships with its etymology or does not ship.** If a term cannot carry its own explanation in the field unit voice, cut it.
10. **English name loud, Japanese name as the reward.** The index reads THE LOAF first and 香箱座り second. The vocabulary is a payoff, not a tuition fee charged at the door.

**Ten example lines:**

1. `PLATE 041 FILED. THE SUBJECT WAS ASLEEP THROUGHOUT AND REMAINS UNAWARE OF THIS RECORD.`
2. `COAT: KIJI-SHIRO. Kiji is the plumage of the female Japanese green pheasant. Tora is tiger. She is named after a bird and a tiger and she is asleep in a laundry basket.`
3. `EYE CLASS: 判定不能 UNRESOLVED. The bulb was warm. The unit will not guess.`
4. `GROUND: BLACK. 62 percent of the subject was not recovered by the plate. In Japan this is the lucky colour.`
5. `FIELD ORDER 0412 MET. THE SUBJECT WAS PHOTOGRAPHED FROM DIRECTLY ABOVE AND OBJECTED.`
6. `SUBJECT DECLINED. One reading withheld. It will release on a later plate.`
7. `RECORDED: MUGI. Two moras. Per Saito et al., Scientific Reports 2019, this string is now a discriminable auditory stimulus to her. She will move her ears and her head. She will not reply. Orienting is the reply.`
8. `She is not keeping score. Chijiiwa et al. 2021 had cats watch a person refuse to help their owner, four trials, and the cats did not avoid them afterwards. Nothing you did in 2024 is on file.`
9. `THE DENOMINATION GRADES THE PRINT. THE CAT IS NOT FOR SALE.`
10. `The best validated model of cat personality explains 41.53 percent of the variance across 2,802 cats. The rest is her.`

**Things this app never says:** purrfect · furbaby · fur baby · pawsome · meow-anything · any cat pun · "your cat is" followed by a judgement · "the AI has determined" · "she's such a" · tired, sad, squinting, uncomfortable, lethargic, unwell, or any ear, orbital, muzzle, whisker or head-position descriptor (blocklisted, because those are the five Feline Grimace Scale action units) · any breed percentage · any implication that a photograph was hand drawn or painted · any health reassurance · any comparison to another person's cat · anything in the cat's voice · "-sama," "-chan," "nya," or any Japanese honorific or particle borrowed as decoration. RABO writes 猫様 sincerely as a decade of house style; a western app dropping it is cosplay.

---

## 13. WHAT WE ARE NOT BUILDING

- **A public feed, a comment system, a leaderboard, a rarity percentile against strangers, or any stranger-to-stranger surface.** Permanently.
- **A breed identifier.** The market leader already ships breed catching "just like in Pokemon Go" with challenges, treats and a community feed at 1M+ installs, and its worst reviews are about breed accuracy. Competing there means fighting an incumbent on its own ground with its own worst bug. Breed is a low-confidence resemblance line only, and 90 percent of cats have no correct breed answer.
- **A breed percentage mix.** UK random-bred cats are genetically random-bred, "rather than admixed, mix breed, or crossbred" (Irving McGrath et al. 2021). "35 percent Maine Coon" is a category error, not a hedge.
- **A cat translator, a meow decoder, or an emotion reader.** MeowTalk's ~90 percent lab figure drops to roughly 70 percent by its own creator's real-world estimate, and cats have no shared vocal lexicon: meows are individually negotiated with one specific human. Any universal decoding claim is unfoundable.
- **A health feature, a pain score, a comfort check, or a condition grade.** That space is genuinely regulated-adjacent, genuinely scientific, and commercially dead (Sylvester at 9 ratings, the official Feline Grimace Scale app at 15, CatsMe at 54). More importantly, a wrong reassurance about a sick cat is the one failure mode that would end the studio's reputation.
- **Any on-device model.** MediaPipe Tasks Vision is 7.7 MB of first load (45 KB bundle plus 3.12 MB gzipped wasm plus 4.56 MB tflite), about twelve seconds on 4G, to save $0.0026 on a check the vision call performs for free as an `is_cat` field. transformers.js's default detector is 43 MB even quantized. Neither is a breed classifier: COCO-80 has one relevant label ("cat") and ImageNet-1k has five plus a set of big cats that will confidently call a large tabby a lynx.
- **Any currency, energy meter, scan cap that money removes, ad, subscription, loot box, gacha, pity timer, or paid randomness of any kind.**
- **Any deterioration.** No durability, no decay, no expiry, no withering, no card that fades, no cat that "leaves if you neglect it."
- **The 55-station Tōkaidō track** (Kuniyoshi 1848). Cut from v1 as padding wearing a citation. Parked; it may return as a multi-year service track once the loop is proven past day 30.
- **Trade codes and the procedural cat-diagram renderer.** Cut outright.
- **Cat blood-type or star-sign readings.** Ketsuekigata is pseudoscience (Nawata 2014: under 0.3 percent of personality variance across 10,000+ respondents) and a live harassment category in Japan with its own word, ブラハラ.
- **A Japanese localisation produced by translation.** A Japanese build is a separate writing job with a native writer, held until the English loop is proven.
- **Cat islands, cat cafes as a Japanese invention, Hello Kitty, Nanzenji, maneki-neko as ancient or sacred, or any of it as decoration.** See section 14.

---

## 14. RISKS AND HARD LINES

### The hard lines. All of these ship before public launch, not after the first support email.

**H1. CHONK must not be a body-condition read, and there is a shippable acceptance test.** Photo-based body condition scoring separates ideal from obese with only **1.8 percent misclassification** (Graff et al., *Front Vet Sci* 2025;12:1604557), 24 percent of owners already underestimate their cat's condition (Blanchard et al., *Animals* 2023), and owners of heavy or obese cats are significantly **more attached** to them (Bjørnvad et al., *Front Vet Sci* 2026;13:1757719, 35 percent of a home-visited Danish sample at BCS 7-9/9). A fat joke lands on the bond the whole app depends on. Veterinary communication research specifically flags humour about pet weight as double-edged (Sutherland et al., *JAVMA* 2022). **Test: 200 cards, an independent scorer who has not seen the stat assigns BCS blind, correlation must be non-significant. If it correlates, CHONK is re-derived, not re-worded. If it still correlates after re-derivation, the app ships with five stats.**

**H2. No pain-adjacent output, and silence must never read as an all-clear.** Descriptor blocklist (section 12). All six stats derived from photographic geometry so none reads an FGS action unit. **A permanent, always-visible, never-triggered footer pointing to a vet**, so the absence of a warning is never information. Ngai et al. 2025 is the reason: four general chatbots scoring the FGS all underestimated pain.

**H3. Human faces are a hard stop.** No card, no stats, no export, image not persisted, detected as early in the pipeline as possible. Under Illinois BIPA (740 ILCS 14/10 and 14/20) the regulated item is a "scan of hand or face geometry," which is precisely what a vision pipeline computes from a photograph, and the photograph exclusion does not cover it. Written notice and written release are required **before** collection, with a private right of action at **$1,000 per negligent and $5,000 per intentional or reckless violation plus attorneys' fees.** "It was a joke" is not a defence. Every other non-cat input (dog, bread loaf, plush toy, photo of a photo, no animal) gets a bespoke, delightful, hand-written refusal.

**H4. Memorial mode.** A specimen can be marked IN MEMORIAM. All dossier bands freeze exactly where they stand and relabel FINAL. The book freezes rather than gapping. Every notification for that specimen ceases immediately and irreversibly. Its slot is preserved and never prompts. The wish becomes a dated record rather than an open button. The export takes a quiet date range with no black band. Nothing is deleted and nothing is ever paywalled. Thanatosensitivity is a named HCI subfield for exactly this (Massimi and Charise, CHI 2009). UK cat life expectancy at age 0 is 11.74 years (Teng et al., *JFMS* 2024), so over any real userbase this happens repeatedly, and the single most painful review in the entire competitive research set is a user who lost their deceased cat's recordings and was charged for the privilege.

**H5. The free lost-cat poster.** A printable A4 sheet auto-built from assets the app already holds: the best photograph, the name, the coat description in **plain English**, the tail form, the distinguishing marks. Sized for convenience-store printing. This is the most-praised feature of Doconoko and it is the highest goodwill per line of code available anywhere in this design. It is what turns a toy into something people defend.

**H6. No rarity ever grades the animal, and no conformation disease is ever gilded.** Breed contributes zero to denomination. Scottish Fold, Munchkin, Persian and every brachycephalic or chondrodysplastic conformation are hard-excluded from raising a tier.

**H7. Attribution.** RABO Inc.'s Catlog Research is credited by report number wherever its data appears, in app, on the card, and in the store listing. They earned it across 16 billion data points and uncredited use would be noticed by exactly the audience being courted. Same for the Feline Five (Australia and New Zealand, never Japan), and for Humphrey et al. 2020 (University of Sussex, UK, never Japan).

**H8. The art is generated from the user's photograph and we say so.** Never hand drawn, never painted, never illustrated.

### The risks, ranked, with mitigations

**R1. The vocabulary is a tuition fee charged before the fun.** An English-speaking cat owner cannot read サバトラ or ごめん寝 on day one, so a slot labelled only in kana is a blank, not a desire. **Mitigation: English name loud and first everywhere, Japanese as the reward for filling the slot.** This is the single most-repeated cross-judge criticism and it is fixed by typography, not by cutting content.

**R2. Posture classification has no published benchmark and the model may not be able to do it.** There is no published accuracy figure for cat pose or coat-pattern classification by any model, and the fine-grained literature is brutal (LLaVA at 99.98 percent species accuracy and 15.11 percent breed accuracy on the same images; FG-BMK, arXiv 2606.19053, concludes current LVLMs "remain inadequate fine-grained recognizers"). **Mitigation, and this is the central architectural decision of the document: the owner files the posture, with no model call at all.** One tap on a silhouette. This removes the entire unbenchmarked dependency from the critical path, costs nothing, generates labelled data for free, and is more feline than an oracle: the unit proposes nothing, the owner confirms. It also makes the daily loop free, which is what makes the cost model survive. If a later benchmark shows the model is reliable, it can be added as a **suggestion** the owner accepts or overrules, never as a verdict.

**R3. Colour reads will flip under warm bulbs.** ColorBench (Liang et al., arXiv 2504.10514, 32 models, 11 tasks) measured the strongest proprietary models at about 54 percent overall against human 80 percent plus, with GPT-4o at **46.2 percent robustness to colour transformation.** A tungsten bulb will genuinely flip saba against kiji. **Mitigation: four fields are confidence-gated and render as 判定不能 UNRESOLVED rather than a guess (saba vs kiji, tortie vs calico which turns on whether white is in frame, smoke vs solid, ticked vs solid), each with a specific re-shoot instruction. A hard genetic validator sits between model and card: a red or orange cat can never return "solid" (orange is epistatic to non-agouti, there is no truly solid orange cat), mike and sabi default the sex field to female with MIKE-O as a separate owner-confirmed event, and a solid-white result cannot claim an eye colour if the eyes are shut.** UNRESOLVED on a card that reads as a 3am veterinary field unit is completely on-brand and it buys the product its credibility.

**R4. The writing job is the product and is routinely underpriced.** 400 epithets, 60 field orders, 60 dossier items with four chips and a cited source line each, 20 coat etymologies, 15 posture lines, every refusal, all six protocol result texts. That is weeks of careful prose by someone who reads the sources. **Mitigation: it is its own build slice with its own owner and its own calendar time.** If it is generated at runtime, this becomes the AI-slop product it was designed against.

**R5. iOS silently eats the collection and silently disables the notification.** WebKit deletes localStorage, IndexedDB, sessionStorage and service worker registrations after seven days of Safari use without site interaction, and eviction is all-or-nothing across every storage technology at once. Web push does not exist on iOS outside an installed PWA on 16.4+. **Mitigation: IndexedDB with one record per plate storing the Blob directly (never a data URL, never localStorage, which is 5 MiB and holds about two base64 photos), every write wrapped in `navigator.locks.request` so two tabs cannot clobber a read-once-written-wholesale save, a BroadcastChannel `plate-added` message so the other tab re-reads instead of overwriting, `navigator.storage.persist()` on first successful save, and a hand-drawn Share-menu install card after the second plate with honest copy.**

**R6. The proxy and the service worker are both launch blockers.** The API key must live in Secret Manager via `defineSecret` and be read with `.value()` inside a v2 `onCall` with `enforceAppCheck: true`. `fetch()` does **not** reject on 4xx or 5xx, so `!res.ok` must be checked explicitly. A policy refusal returns **HTTP 200 with `stop_reason: 'refusal'`**, so code reading `content[0].text` unconditionally crashes. JSON Schema `minimum`/`maximum` are **unsupported** in structured outputs and return 400, so every stat is clamped server-side or the app ships a card with CHONK 4200. Separately: **the service worker must not call `event.respondWith()` on navigation requests at all** (an unsettled promise there produces a permanent black screen with no error and no timeout, which this studio has already shipped once across a fleet), cache names must be versioned, `caches.keys()` is origin-wide and will collide with the botanical game, and a kill switch must unregister on a flag file.

**R7. Nobody enforces capture-now, so the field order is defeated by scrolling backwards.** Every user already has four hundred photos. **Mitigation, and it is generous rather than restrictive: the plate is dated to the day the PHOTOGRAPH was taken, read from EXIF `DateTimeOriginal` with a `File.lastModified` fallback. An old photo fills its own old square, not today's.** The camera roll becomes an asset that builds the past instead of an exploit that fakes the present, and backfill becomes the best moment in the first session. A photo with no recoverable date files as UNDATED and cannot take a seal.

**R8. Scope. This studio ships single-file vanilla JS.** Neko Atsume was two people and one verb and reached 30 million downloads. Neko Gacha shipped 150+ cats, six-star rarities, gacha and a party RPG and is culturally invisible. **Mitigation: Slice 1 ships in one day, and day-14 retention on Slice 1 alone decides whether anything after Slice 6 gets written.**

**R9. Name squatting.** MeowTalk has vanished from the iOS App Store entirely and a Turkish shell company now owns its name in iOS search. The cat-scanner and cat-translator name spaces are saturated with near-identical titles. **Mitigation: search both stores and secure the listing before any public mention of the name.**

**R10. Optimising for the funniest photo selects for distressed animals.** Analysis of 162 pet videos intended to be funny found stress reactions in 82 percent, injury risk in 52 percent, suspected pain in 30 percent and agony-breeding characteristics in 32 percent, with 93.8 percent commercially successful (Kühnöhl et al., *JAAWS* 2026). **Mitigation: the denomination rewards plate quality and posture novelty, never extremity, and the field orders ask for rest, framing and light, never for a reaction.**

---

## 15. BUILD ORDER

### SLICE 1 — THE BOOK, THE BACKFILL AND THE LIGHT METER
**Ships:** one day, bolted onto the existing 723-line file. No server, no new API cost, no schema change. (a) The on-device **light meter**: `getImageData` on a 64x64 downscale, median cut for coat colour, three jade bars, UI tinting. (b) **Backfill import**: multi-select from the camera roll, EXIF `DateTimeOriginal` parsed client-side with `File.lastModified` fallback, no upload. (c) **The book**: month grid, dated seal per filled square, two squares pre-stamped on install, progress as distance remaining, no streak counter. (d) **The posture index**: 15 silhouettes, English name large, one-tap owner filing.
**Depends on:** nothing.
**Already fun because:** a user imports thirty old photographs and, inside twenty seconds, has a two-year dated field book about their cat with six named shapes lit up in an index they have never seen before. No vision call is involved.
**How we know it works:** 20 real testers, Pixel 9 and iPhone. Two numbers: **day-3 and day-14 return rate**, and **the proportion who import more than ten photos unprompted.** If day-3 return is not strong on this slice alone, nothing after Slice 6 gets built.
**Hard gate:** the existing client-side key path is dev-only and no public link exists until Slice 2 lands.

### SLICE 2 — THE PROXY (LAUNCH BLOCKER)
**Ships:** Firebase Cloud Functions v2 `onCall`, region us-central1, key in Secret Manager via `defineSecret` read with `.value()`, `enforceAppCheck: true`, anonymous Firebase Auth, `claude-haiku-4-5` at 768px, structured outputs, `scans/{pixelHash}` cache checked **before** the quota decrement, daily quota incremented inside `runTransaction`, `maxInstances` set, explicit `!res.ok` branch, explicit `stop_reason === 'refusal'` branch before touching `content[0].text`, all six stats clamped server-side.
**Depends on:** Slice 1.
**How we know it works:** two tabs firing simultaneously cannot exceed the daily cap; the same photograph re-uploaded returns the identical card with zero token spend; a deliberately refused image returns a friendly message and not a stack trace; the key does not appear in any client bundle (verified by grep of the deployed file).

### SLICE 3 — STORAGE THAT SURVIVES
**Ships:** IndexedDB, one record per plate, Blobs stored directly. Every write wrapped in `navigator.locks.request('plates-write', ...)`. BroadcastChannel `plate-added`. `navigator.storage.persist()` on first save, real numbers from `navigator.storage.estimate()` in a settings row. Minimum installable PWA manifest (HTTPS, name, 192 and 512 PNG icons, start_url, `display: standalone`, `prefer_related_applications: false`). Hand-drawn Share-menu install card after the second plate.
**Depends on:** Slice 2.
**How we know it works:** two tabs open, both adding plates, nothing is lost. Home-screen install survives an eight-day gap on a real iPhone.

### SLICE 4 — THE THREE-AXIS COAT SCHEMA AND THE VALIDATOR
**Ships:** prompt and JSON schema move from a single coat string to `ground`, `geometry`, `white_grade`, `white_coverage_pct`, `tail_form`, `eye_class`, `marks[]`, each with a confidence. The genetic validator, the four confidence gates rendering 判定不能, the word-order flip at 50 percent coverage, the descriptor blocklist, the six re-derived Band A stats with gitaigo, the English-first bilingual card face, the coat etymology bank.
**Depends on:** Slice 2.
**How we know it works:** 100 hand-labelled photographs. Per-field accuracy published internally. The four gated fields return UNRESOLVED at the expected rate under warm indoor light. No orange cat ever returns "solid." **Plus the CHONK acceptance test (H1) runs here, not later.**

### SLICE 5 — DENOMINATION, FINISH, PRESS AND THE SEALS
**Ships:** the koban ladder replacing ALLEY/HOUSE/SHOW/FOIL/MYTHIC, the trailing-20 percentile computation, the coat-to-finish table, the standing line on the card face, breed contribution set to zero plus the conformation exclusion list, the 御朱印 press at 1 in 512 derived from the pixel hash with the 300-plate ceiling and the published RATES screen, the fifteen condition seals, the two calendar date checks (22 February, 29 September).
**Depends on:** Slice 4.
**How we know it works:** simulate 100,000 synthetic plate histories against the scorer and confirm the distribution is 50/30/14/5.4/0.6 and is **identical across simulated specimens with different coats.** That is the "no losers" proof and it is a test, not a claim.

### SLICE 6 — THE FIELD ORDER, THE WISH AND THE PAW
**Ships:** the 60-order table, date-seeded on device with a local 04:00 rollover, one notification at a user-picked hour, FROST tokens, PAUSE, the per-month 皆勤 seal, back-fill of missed squares. The four-step naming ritual: name, wish, paw side, paw height, paw drawn palm down. The 成就 FULFILLED action, the gold seal, the 奉納 shelf, unlimited repeats.
**Depends on:** Slices 1 and 3.
**How we know it works:** two devices on the same date show the same order. Missing a day changes nothing anywhere in the app. A wish marked fulfilled at 90 days behaves identically to one marked at 9 days.

### SLICE 7 — THE EXPORT
**Ships:** the goshuin rewrite of the 1080x1350 canvas. Dated vermilion seal block, coat term in three scripts, gitaigo under the Band A bars, the permanent novelty disclaimer baked in, fixed backing store with no DPR multiply, explicit per-weight `document.fonts.load`, self-hosted and subsetted JP display face, `image/jpeg` at 0.92 only, OffscreenCanvas in a Worker with a main-thread fallback, plus 1080x1920 and 1200x630 crops.
**Depends on:** Slices 4 and 5.
**How we know it works:** renders correctly on a cold load with no cached fonts, on a memory-pressured iPhone, at 200px wide as a thumbnail. No tofu boxes anywhere.

### SLICE 8 — THE HARD CASES (BEFORE PUBLIC LAUNCH)
**Ships:** memorial mode in full (H4), the free lost-cat poster (H5), the human-face hard stop (H3), the permanent vet footer (H2), the bespoke refusals for dog, bread loaf, plush toy and photo-of-a-photo, and the multi-cat bond sheet with the Behnke 72 percent Avoidant line.
**Depends on:** Slices 3 and 7.
**How we know it works:** a memorial specimen produces zero notifications forever, retains every card, and never prompts. A photograph containing a human face persists nothing anywhere.

### SLICE 9 — THE CONTENT SPRINT
**Ships:** 400 epithets, 60 field orders, 60 dossier items with four chips and a cited source each, 20 coat etymologies, 15 posture lines, all refusals, all protocol texts. Its own owner, its own calendar time, its own versioned bank file.
**Depends on:** the schemas from Slices 4 and 5 being frozen.
**How we know it works:** a reader who has never seen the app can tell which lines are hand-written and which are not, and there are none of the latter.

### SLICE 10 — THE DOSSIER AND THE PROTOCOLS
**Ships:** the five Feline Five axes with the real band arithmetic and the spread figure, the item asked after each capture, the 変動 VARIABLE resolution state, the residual line, the Arahori cross-reference. Then Protocol S-19 (the name test, the emotional centrepiece), T-21, H-20, K-19, T-22, and the C-21 field note firing unprompted on the 21st filed day with no reward attached.
**Depends on:** Slice 9.
**How we know it works:** the band arithmetic is verified against a spreadsheet, contradicting answers visibly widen the spread while the band still narrows, and no axis ever displays a number the stored answers do not support. S-19 completion rate above 25 percent by day 14, or it needs a silent mode rather than a nag.

### SLICE 11 — THE SECOND PRESSING, THE LONGITUDINAL STRIP, THE MONTHLY SHEET
**Ships:** the pre-endowed second pressing, the per-specimen longitudinal strip with the RABO-attributed seasonal population lines, the printable nine-up monthly sheet, the anniversary view.
**Depends on:** Slice 6 and roughly 30 days of real user data existing.

### SLICE 12 — THE FIELD KIT AND THE PRINT PIPELINE
**Ships:** the one-time $8.99 unlock, then print-on-demand for the single card, the binder page and the year book.
**Depends on:** everything above holding past day 30 in real cohorts. **The paid tier never ships before the thing it is a tier of is finished.**

---

## 16. OPEN QUESTIONS FOR THE DIRECTOR

**Q1. English-first or Japanese-first on the card face and in the index?**
This document specifies **English name large, Japanese small underneath, etymology as the reward for filling the slot.** Both judge panels independently flagged the alternative as a tuition fee charged before the fun: a slot labelled only サバトラ is a blank to a person who cannot read it, not a desire. The counter-argument is that the Japanese-forward version is more distinctive and more defensible against a copycat.
**Recommendation: English-first. Ship it. The Japanese is the payoff, and a payoff you cannot read on day one is not a payoff.** This is reversible with a single boolean if it reads as thin.

**Q2. Does the DOSSIER (the five-axis personality system) ship in v1, or wait for v2?**
It is the largest single content cost in the document (60 items with 240 chips and 60 cited source lines) and it is the piece most likely to be misread as a horoscope. It is also the piece with the highest sharing ceiling, because a typed result is the proven mass-viral shape.
**Recommendation: v2, gated on Slice 1 day-14 retention.** If people come back for the book and the index alone, the dossier is upside. If they do not, the dossier will not save it and we will have spent three weeks of writing to find out. Build slices 1 through 9 first; the dossier is Slice 10 for exactly this reason.

**Q3. Strict or lenient EXIF dating on backfilled photographs?**
Strict means a photograph with stripped metadata (anything that has been through WhatsApp, Messages or most re-exports) files as UNDATED, cannot take a seal, and cannot close a square. Lenient means falling back to `File.lastModified`, which for a re-shared photo is the date it hit the device, which fakes the past.
**Recommendation: strict, with one stated exception.** Try EXIF `DateTimeOriginal` first; if absent, fall back to `File.lastModified` **only if that date is more than 48 hours old** (so it cannot fill today's square); otherwise file as UNDATED with the honest line `NO DATE RECOVERED. THIS PLATE IS FILED OUT OF SEQUENCE.` An UNDATED plate is on-brand and is better than a lie.

**Q4. Does the STREET shelf (the 20 coat types one cat cannot fill) survive at all?**
Concept 2 staked its title on it and both judges found it structurally broken for the core user, one indoor cat and no friends in the app. This document keeps it but relabels it, moves it below the posture shelf, and states its incompletability on the header. The alternative is cutting it to eight solo-reachable slots and losing the "photograph a friend's cat" demo, which is the best word-of-mouth act available.
**Recommendation: keep it as specified, and set a kill criterion now.** If fewer than 20 percent of day-14 retained users have filled a third coat slot, cut the shelf to eight and fold the rest into the etymology reference. Decide the criterion before we are emotionally attached to the shelf.

**Q5. Platform: PWA on a lucidwinds subdomain, or native store presence on both stores?**
The engineering in this document is PWA-shaped and can ship in weeks. But the iOS half of the viral cat-card market is currently empty (CatchCat is Android-only), the naming space is being actively squatted (MeowTalk lost its own name on iOS to a shell company), and neither store has a "Pets" category, which is itself a discovery problem.
**Recommendation: claim the name on both stores immediately, this week, before any public mention. Ship the PWA first at a subdomain, and wrap it only once day-30 retention justifies the store review overhead.** The name claim is cheap, urgent and irreversible if lost. The native wrap is expensive and can wait.