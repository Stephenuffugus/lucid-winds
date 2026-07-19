# Sheet 07 — POP N LOCK Wildstyle Burner Logo

The one sheet in the whole pack allowed to contain lettering: the POP N LOCK graffiti wildstyle burner title in a wide landscape lockup, plus a compact stacked lockup for the app icon and portal thumbnail.

```
STYLE — "Neon Boombox" (Pop N Lock). 1987 breakdance movie poster meets Saturday-morning cartoon: chunky cel-shaded anthropomorphic ANIMAL characters with THICK black comic outlines, neon airbrush shading, spray-paint glow edges, subtle halftone dot texture. EVERY character is an animal B-BOY in SHINY NYLON PARACHUTE PANTS — baggy MC Hammer style, billowing at the thigh, cinched at the ankle, glossy wet-nylon sheen with bright specular folds — plus 80s streetwear: high-top sneakers with fat laces, kangol and bucket hats, sweatbands, gold rope chains, boomboxes, cassette tapes, windbreakers. Cheerful swagger, kid-friendly, big expressive cartoon eyes, NO menace, NO gore. Palette: night-alley near-black #0c0a06 base; hot magenta #FF2FB9; electric cyan #2FF0E0; voltage yellow #FFD21A; neon lime #39FF14; ultra purple #C24BFF; plus each character's own accent (listed per sheet). Lighting: neon-sign rim light from one side, cool moonlight fill, characters pop off dark backgrounds. Rendering: bold flat cels + airbrush gradients, NO photorealism, NO 3D render, NO text/watermark baked into character sprites (words are drawn by the engine or live on the dedicated logo sheet). Deliver every sprite knocked out on flat magenta #FF00FF.
```

## Sheet layout

This sheet deliberately breaks the grid rule: it is TWO single-subject generations, no grid, no fixed-pitch cutter. Each generation is one piece of lettering art centered on pure flat **magenta #FF00FF** knockout that fills everything outside the artwork. Generous even margin on all four sides, no part of the logo touching any edge, no gradient or shadow on the background.

- **Generation A** — `logo_burner_wide` at **2048x1024 landscape**. The full three-word wildstyle burner on one line, centered.
- **Generation B** — `logo_stacked_icon` at **1024x1024 square**. The compact stacked lockup (POP N over LOCK), centered.

**Spelling warning (read this before you burn credits):** image generators fumble lettering constantly. Batch **4 takes per generation**, expect retries, and pick the take with the cleanest spelling. It must read EXACTLY **P O P** then **N** then **L O C K** — 8 letters in 3 words (10 characters counting the two spaces), no apostrophes, no dashes, no extra or missing letters, no backwards letters. Reject anything that grows a fourth word or an apostrophe. Minor letter cleanup (a wobbly outline, a stray fleck) happens in the cut pass: magenta flood key, tight crop, hand-fix edges.

Assignment list:
- `logo_burner_wide` — 2048x1024, wide one-line burner, POP N LOCK
- `logo_stacked_icon` — 1024x1024, two-line stack, POP N over LOCK

## Assets

- `logo_burner_wide` — A graffiti WILDSTYLE BURNER reading exactly **POP N LOCK** in three chunky overlapping bubble-letter words on one line, with a slight upward left-to-right bounce like a fresh piece on a train car. Letter fill fades from hot magenta #FF2FB9 at the top of each letter into electric cyan #2FF0E0 at the bottom, with voltage yellow #FFD21A slice highlights across the upper curves, fat white shine hits, and a THICK black comic outline around every letterform. A thin neon lime #39FF14 outer glow line traces the whole silhouette, a few subtle paint drips run off the lower edges of the P and the K, and one or two ultra purple #C24BFF four-point sparkle stars sit in the counters. The small middle word N gets its own beat, riding slightly raised between POP and LOCK inside a little spray-splat badge. Lettering only, no characters, no boombox, no extra objects, kid-friendly and fresh.
- `logo_stacked_icon` — The SAME letterforms and the SAME colorway as the wide burner, recomposed as a tight two-line stack: **POP N** on the top line, **LOCK** slightly larger on the bottom line, kerned close so the block reads as one solid mark even at 96px. Same magenta #FF2FB9 into cyan #2FF0E0 fade, voltage yellow #FFD21A highlights, white shines, thick black outline, thin lime #39FF14 glow. Only one or two SHORT drips here because an app icon needs a clean silhouette. It must be unmistakably the same logo family as `logo_burner_wide`, just stacked.

## Copy-paste prompt

```
1980s breakdance movie poster art, 80s airbrush graffiti illustration, Saturday morning cartoon energy: bold flat cel shading with neon airbrush gradients, THICK black comic outlines, spray-paint glow edges, subtle halftone dot texture, hand-painted wildstyle graffiti lettering, NOT photorealistic, NOT a 3D render, NOT a photograph.

Single subject, 2048x1024 landscape. One graffiti WILDSTYLE BURNER logo centered on a solid flat chroma-key magenta #FF00FF background that fills the entire rest of the frame, wide even margin on all sides, nothing touching the image edges.

The burner reads EXACTLY "POP N LOCK" in three chunky overlapping bubble-letter words on one line with a slight upward bounce: spell it P O P, then N, then L O C K, 8 letters in 3 words, no apostrophes, no dashes, no extra letters, no missing letters. Letter fill fades hot magenta #FF2FB9 at the top into electric cyan #2FF0E0 at the bottom, voltage yellow #FFD21A slice highlights on the upper curves, fat white shine hits, thick black outline around every letter, a thin neon lime #39FF14 outer glow tracing the whole silhouette, subtle paint drips off the bottom of a few letters, one or two small ultra purple #C24BFF sparkle stars, the small word N raised on its own spray-splat badge between POP and LOCK. Lettering only, no characters, no animals, no hands, no objects.

Limited consistent color palette, no new hues: hot magenta #FF2FB9, electric cyan #2FF0E0, voltage yellow #FFD21A, neon lime #39FF14, ultra purple #C24BFF, black outline, white shine, flat #FF00FF background only.

The logo is isolated on solid flat chroma-key magenta #FF00FF, pure even fill, no gradient, no texture, no shadow on the background, nothing touching the frame edges, no magenta spill or reflection on the artwork.

Negative prompt: photoreal, 3D render, photograph, misspelled words, extra letters, missing letters, backwards letters, apostrophe, hyphen, punctuation, extra words, watermark, signature, characters, animals, hands, faces, drop shadow on background, gradient background, blurry, scary, gore.
```

Variant B, the stacked icon lockup (run as its own generation):

```
1980s breakdance movie poster art, 80s airbrush graffiti illustration, bold flat cel shading with neon airbrush gradients, THICK black comic outlines, spray-paint glow edges, subtle halftone dot texture, hand-painted wildstyle graffiti bubble lettering, NOT photorealistic, NOT a 3D render, NOT a photograph.

Single subject, 1024x1024 square. One compact stacked graffiti logo centered on a solid flat chroma-key magenta #FF00FF background filling the entire rest of the frame, even margin on all sides, nothing touching the image edges.

The logo reads EXACTLY "POP N LOCK" stacked on two lines: top line P O P then N, bottom line L O C K slightly larger, kerned tight so it reads as one solid block mark. 8 letters in 3 words, no apostrophes, no dashes, no extra letters. Letter fill fades hot magenta #FF2FB9 into electric cyan #2FF0E0, voltage yellow #FFD21A highlights, white shine hits, thick black outline, thin neon lime #39FF14 outer glow, at most one or two short paint drips so the silhouette stays clean for an app icon. Lettering only, no characters, no animals, no objects.

Limited consistent color palette, no new hues: hot magenta #FF2FB9, electric cyan #2FF0E0, voltage yellow #FFD21A, neon lime #39FF14, ultra purple #C24BFF, black outline, white shine, flat #FF00FF background only.

The logo is isolated on solid flat chroma-key magenta #FF00FF, pure even fill, no gradient, no texture, no shadow on the background, nothing touching the frame edges, no magenta spill on the artwork.

Negative prompt: photoreal, 3D render, photograph, misspelled words, extra letters, missing letters, backwards letters, apostrophe, hyphen, punctuation, extra words, watermark, signature, characters, animals, hands, faces, drop shadow on background, gradient background, blurry, scary, gore.
```

## Wire

`logo_burner_wide` replaces the engine-drawn title on the Pop N Lock title screen in satellites/chaff-wars/index.html: swap the CSS `.title-word` text lockup for an `<img>` of the cut burner PNG (keep an aria-label reading POP N LOCK for accessibility), scaled to the same slot so the title screen layout does not move. `logo_stacked_icon` drives the portal thumbnail rebuild (composited over a night-alley #0c0a06 backdrop, exported at 480px or less and 150KB or less per the thumb perf rule) and the manifest icons at 192 and 512. The wide burner can later reappear scaled down on the result screen header and a future VS screen splash. This sheet feeds no HUD cards or ladder tiles; those pull from the character sheets.