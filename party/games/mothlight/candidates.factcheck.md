# Mothlight candidates: fact check

**Date:** 18 October 2026
**Input:** `party/games/mothlight/candidates.review.js` (ml-r001 to ml-r030, Astra's B1.6 list in `party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md`)
**Status:** a review only. Nothing here is in `content.js`. Nothing was committed.

## Method

1. **Bank rules.** Every candidate was machine-checked against the rules at the top of `content.js`: one sentence under 110 characters (the longest is 64), no dash characters of any kind (checked for U+002D and U+2010 to U+2015, U+2212, U+FE58, U+FE63, U+FF0D: none found), and no politics, religion, bodies, violence or brand names (all 30 are clean; "zipper" is listed by Merriam-Webster as a *former* trademark and is already in the bank as ml-0227).
2. **Duplicates.** Each candidate's key words were grepped against the 659 entries of `MOTHLIGHT_BANK`. A candidate that teaches the same underlying fact as an existing entry, even with the opposite answer, is a DROP. Entries in the same topic family that teach a different fact are noted so deck building can keep them apart (D04), but they are not dropped.
3. **Source check.** Every surviving claim was checked against a live page from a mainstream source, and the line that settles it is recorded. Astra's own link was tried first.
   * NASA, USGS, NOAA, Met Office, NPS and Smithsonian pages were read directly.
   * Kew (kew.org), Britannica, the UBC Botanical Garden and Merriam-Webster all return **HTTP 403** to this machine, through both the fetch tool and curl.
   * The Merriam-Webster entries were therefore read from **Internet Archive snapshots of merriam-webster.com taken in 2026**. The table names the exact snapshot for each. The definition text was pulled out of the archived HTML and quoted.
   * No Kew page could be read at all. Every Kew-sourced candidate is either dropped as a duplicate anyway, or (r011) re-sourced to a page that could be read.
4. **Verdicts.**
   * **PASS:** the answer is right, the sentence is accurate exactly as worded, and a page confirms it.
   * **FIX:** a field has to change before the entry can ship. Here that means only one source swap, r011.
   * **DROP:** a duplicate, or a claim that could not be confirmed from a real page.
   * Nothing was softened to make it pass.

## Results

| id | verdict | final text | answer | source name | URL checked | why |
| --- | --- | --- | --- | --- | --- | --- |
| ml-r001 | DROP | Mercury has no moons. | true | NASA Mercury Facts | https://science.nasa.gov/mercury/facts/ | True ("Mercury doesn't have moons") but a duplicate of ml-0310 "Every planet in the solar system has at least one moon." (false), which teaches the same fact. |
| ml-r002 | PASS | Venus is farther from the Sun than Mars is. | false | NASA Venus Facts + NASA Mars Facts | https://science.nasa.gov/venus/venus-facts/ and https://science.nasa.gov/mars/facts/ | Venus is "the second planet from the Sun" at 0.72 AU and Mars "the fourth planet from the Sun" at 1.5 AU. Their orbits never cross, so the statement is never true. |
| ml-r003 | DROP | Jupiter has a ring system. | true | NASA Jupiter Facts | https://science.nasa.gov/jupiter/jupiter-facts/ | True ("Jupiter's rings were a surprise", 1979) but a duplicate of ml-0312 "Saturn is the only planet in our solar system with rings." (false). |
| ml-r004 | PASS | Saturn has a solid surface like Earth's. | false | NASA Saturn Facts | https://science.nasa.gov/saturn/facts/ | NASA: "As a gas giant, Saturn doesn't have a true surface." Same topic as ml-0065 (it would float) but a different fact. |
| ml-r005 | PASS | Neptune takes longer than Uranus to travel around the Sun. | true | NASA Neptune Facts + NASA Uranus Facts | https://science.nasa.gov/neptune/neptune-facts/ and https://science.nasa.gov/uranus/facts/ | Neptune "about 165 Earth years", Uranus "about 84 Earth years". The Neptune page alone does not give Uranus, so the second page is needed. |
| ml-r006 | PASS | The Moon makes its own visible light like the Sun does. | false | NASA Moonlight | https://science.nasa.gov/moon/moonlight/ | NASA: "The Moon does not make its own light." Moonlight is reflected sunlight. Astra's Moon Facts page only implies this, so the source becomes the NASA Moonlight page. |
| ml-r007 | PASS | The Sun is a star. | true | NASA Sun Facts | https://science.nasa.gov/sun/facts/ | NASA: "The Sun is the only star in our solar system." An easy entry, which suits the D04 easy and surprising mix. |
| ml-r008 | DROP | Mercury takes more than one Earth year to orbit the Sun. | false | NASA Mercury Facts | https://science.nasa.gov/mercury/facts/ | Correctly false (about 88 days) but a duplicate of ml-0063 "A year on Mercury lasts only 88 Earth days." |
| ml-r009 | DROP | Bamboo belongs to the grass family. | true | Kew Bamboo | https://www.kew.org/read-and-watch/bamboo-kew-pandas (HTTP 403, not readable) | Duplicate of ml-0646 "Bamboo is a type of tree." (false), and close to ml-0647 (grass family). Dropped on the duplicate alone. The Kew link could not be read. |
| ml-r010 | DROP | Cinnamon sticks are made from a tree's roots. | false | Kew Cinnamon | https://www.kew.org/plants/cinnamon (HTTP 403, not readable) | Duplicate three times over: ml-0388 and ml-0436 (cinnamon from roots, false) and ml-0639 (dried inner bark, true). The Kew link could not be read. |
| ml-r011 | FIX | Cork can be harvested from the bark of a tree. | true | Smithsonian Magazine (replaces Kew Secret Gardens) | https://www.smithsonianmag.com/travel/cork-trees-soft-skinned-monarchs-of-the-mediterranean-31526/ | The claim holds: "The cork tree's bark is a thick spongy hide that is stripped away", and it is "harvested again in nine years". Astra's Kew link returned 403 and never showed that it mentions cork, so the source field must change to Smithsonian. |
| ml-r012 | DROP | Ferns reproduce using seeds inside flowers. | false | National Park Service Ferns | https://www.nps.gov/muwo/learn/nature/ferns.htm | Correctly false ("Ferns reproduce using spores. They do not produce flowers or seeds") but a duplicate of ml-0650 "Ferns spread by scattering tiny seeds..." (false). |
| ml-r013 | PASS | Mosses produce spores. | true | National Park Service Moss | https://www.nps.gov/acad/learn/nature/moss.htm | NPS: mosses "reproduce with spores, like fungi or ferns." Same topic as ml-0132 (north side of trees) but a different fact. |
| ml-r014 | DROP | Natural vanilla pods grow on a kind of oak tree. | false | Kew Vanilla | https://www.kew.org/plants/vanilla (HTTP 403, not readable) | Duplicate of ml-0137 "Vanilla flavoring comes from a kind of orchid." (and ml-0413 covers vanilla orchids too). The Kew link could not be read. |
| ml-r015 | PASS | Ordinary ice is less dense than liquid water. | true | USGS Water Density | https://www.usgs.gov/water-science-school/science/water-density | USGS: "Ice is less dense than liquid water which is why your ice cubes float." Same family as ml-0509 (densest just above freezing) and ml-0518 (only water expands as it freezes). Different facts, but keep them apart in a deck. |
| ml-r016 | PASS | Water must boil before any of it can evaporate. | false | USGS Evaporation | https://www.usgs.gov/water-science-school/science/evaporation-and-water-cycle | USGS: water "evaporates much more slowly at its freezing point", and about 90% of atmospheric moisture comes from oceans, seas, lakes and rivers evaporating. So boiling is not required. |
| ml-r017 | PASS | Fog is a cloud at ground level. | true | Met Office Fog + NOAA NESDIS | https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog and https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/whats-the-difference-between-fog-and-clouds | Met Office: "essentially a cloud at ground level". NOAA NESDIS, with no hedge: "Fog is a kind of cloud that touches the ground." So the plain wording stands. |
| ml-r018 | PASS | Dew falls from clouds in the same way as rain. | false | Met Office Dew | https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/temperature/dew | Met Office: dew forms when "water vapour will condense into droplets" on surfaces cooled below the dew point. It does not fall from clouds. |
| ml-r019 | PASS | Condensation turns water vapor into liquid water. | true | USGS Condensation | https://www.usgs.gov/water-science-school/science/condensation-and-water-cycle | USGS: "Condensation is the process of gaseous water (water vapor) turning into liquid water." Same family as ml-0512 (kettle cloud), but a different fact. |
| ml-r020 | PASS | The air near Earth's surface contains more oxygen than nitrogen. | false | NOAA JetStream The Atmosphere | https://www.noaa.gov/jetstream/atmosphere | NOAA: nitrogen 78.084%, oxygen 20.946% (dry air). |
| ml-r021 | PASS | A magnetic compass uses a magnetized needle to show direction. | true | Merriam Webster Compass | https://web.archive.org/web/20260907011646/https://www.merriam-webster.com/dictionary/compass | MW: "a device for determining directions by means of a magnetic needle or group of needles turning freely on a pivot". Same topic as ml-0458 (who invented it), but a different fact. |
| ml-r022 | PASS | A barometer is used to measure wind speed. | false | Merriam Webster Barometer | https://web.archive.org/web/20260915092834/https://www.merriam-webster.com/dictionary/barometer | MW: "an instrument for determining the pressure of the atmosphere". Wind speed is measured by an anemometer. |
| ml-r023 | PASS | Some telescopes use mirrors to collect light. | true | Merriam Webster Telescope | https://web.archive.org/web/20260211172858/https://www.merriam-webster.com/dictionary/telescope | MW: "by means of the refraction of light rays through a lens or the reflection of light rays by a concave mirror". |
| ml-r024 | PASS | A traditional hourglass measures time with flowing water. | false | Merriam Webster Hourglass | https://web.archive.org/web/20260526230957/https://www.merriam-webster.com/dictionary/hourglass | MW: "a quantity of usually sand runs in an hour into the lower one". The word "traditional" carries the "usually", and a water timer is a clepsydra. |
| ml-r025 | PASS | A xylophone has wooden bars. | true | Merriam Webster Xylophone | https://web.archive.org/web/20260312011232/https://www.merriam-webster.com/dictionary/xylophone | MW: "a percussion instrument consisting of a series of wooden bars graduated in length". |
| ml-r026 | PASS | An accordion makes its notes with plucked strings. | false | Merriam Webster Accordion | https://web.archive.org/web/20261004132215/https://www.merriam-webster.com/dictionary/accordion | MW: "the wind is forced past free reeds by means of a hand operated bellows". No strings. |
| ml-r027 | PASS | A sieve lets smaller particles pass through its openings. | true | Merriam Webster Sieve | https://web.archive.org/web/20261013005741/https://www.merriam-webster.com/dictionary/sieve | MW: "a device with meshes or perforations through which finer particles ... may be passed to separate them from coarser ones". |
| ml-r028 | PASS | A zipper fastens a jacket by tying a row of knots. | false | Merriam Webster Zipper | https://web.archive.org/web/20260517200629/https://www.merriam-webster.com/dictionary/zipper | MW: "two rows of metal or plastic teeth ... and a sliding piece". "Zipper" is marked "a former trademark", it is generic now, and the bank already uses it in ml-0227. |
| ml-r029 | PASS | A sundial uses a shadow to indicate the time. | true | Merriam Webster Sundial | https://web.archive.org/web/20261006121205/https://www.merriam-webster.com/dictionary/sundial | MW: "an instrument to show the time of day by the shadow of a gnomon". |
| ml-r030 | PASS | A thermometer and a barometer measure the same thing. | false | Merriam Webster Thermometer + Barometer | https://web.archive.org/web/20260901030631/https://www.merriam-webster.com/dictionary/thermometer | MW: a thermometer is "an instrument for measuring temperature", and a barometer measures atmospheric pressure (see r022). |

## Counts

* **PASS: 22**
* **FIX: 1** (ml-r011: the source changes to Smithsonian; the text and answer stay as written)
* **DROP: 7**, all of them semantic duplicates of entries already in the bank:
  * r001 (ml-0310)
  * r003 (ml-0312)
  * r008 (ml-0063)
  * r009 (ml-0646)
  * r010 (ml-0388, ml-0436, ml-0639)
  * r012 (ml-0650)
  * r014 (ml-0137)

**Survivors:** 23 entries, 12 true and 11 false (Astra's 15 and 15 balance is gone because 4 true and 3 false were dropped).

**Before any survivor joins `MOTHLIGHT_BANK`:**
* give it a real id from `ml-0661` on (the bank's highest is ml-0660);
* shorten its source to the bank's style (NASA, USGS, NOAA, Met Office, National Park Service, Smithsonian, Merriam-Webster);
* keep the explanation and URL in the audit sidecar per D03.
