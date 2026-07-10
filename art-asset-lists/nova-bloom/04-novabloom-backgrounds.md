# Sheet 04 — Full-bleed backdrops (one per Garden palette) + title

**DROP-IN wiring (no engine patch):** draw a 540x960 backdrop image in `render()` before the
grid pass, keyed by `PROG.pal` (`PALS` keys: meadow / violet / dawn). Keep backdrops DARK
(85 to 92 percent near-black) so the warp grid (`rgba(P.grid, 0.20)` lines) and neon entities
stay readable — this is the thermal-safe, motion-clarity rule. Title backdrop sits behind
`#s-title` (CSS background, DOM-only).
Each image generated ONCE at 1080x1920, shipped at 540x960 (host resizes >1600px — keep
under). Target <=150KB each as JPG.

**PROMPT (make FOUR separate images, one per paragraph; no magenta needed, these are full-bleed):**

1. MIDNIGHT MEADOW backdrop: Vector Nova style, a vast near-black space vista with the
faintest sage green 7AB356 nebula dust low on the horizon, sparse pinprick stars, subtle
vignette toward the edges, no foreground objects, no text, dark enough for bright neon
gameplay on top, 1080x1920 portrait.
2. DEEP VIOLET backdrop: same composition language, near-black with faint violet 8A6CE0
aurora ribbons and rare star clusters, no text, 1080x1920 portrait.
3. DAWN CHORUS backdrop: same composition language, near-black warming to a thin amber
E0A45C dawn line at the very bottom edge, drifting ember motes, no text, 1080x1920 portrait.
4. TITLE backdrop: Vector Nova hero shot, a lone neon dart ship soaring over an endless
glowing wireframe grid that warps around one enormous radiant gold flower on the horizon,
rose and sage accents, cinematic, no text, 1080x1920 portrait.
