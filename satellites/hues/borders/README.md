# Hues borders — how to add one

A border is a cosmetic frame the player buys in the shop, equips, and sees:
1. **in-game** around the two color swatches, and
2. **on their shared result card** (so your art shows up when people share).

There are two kinds. Pick whichever fits your art.

---

## Kind A — image frame (your painted/generated art) ← the main path

This is the one for "a bunch of fun borders." You make one PNG, add one line, done.

### The PNG spec (9-slice frame)
- **Square PNG** (512×512 is ideal; any square size works).
- **Transparent hollow center.** The decorative frame lives in the **outer ~25%** (≈128px on a 512 image). The middle 50% must be empty/transparent — that's where the color swatch shows through.
- **Corners hold the ornament**, edges hold a **simple, stretchable** band. The middle of each edge gets stretched to fit, so keep edge art low-detail (a vine, a rope, a bevel) and put the busy stuff in the four corners.
- Save it here: `borders/<yourname>.png`.

See `wildvine.png` in this folder as the reference — that exact layout renders correctly both in-game and on the share card.

### Wire it (one line)
In `index.html`, add an entry to the `BORDERS` array:

```js
{id:"wildvine", name:"Wild Vine", ds:"Hand-drawn leafy frame", img:"borders/wildvine.png", price:500},
```

- `id` — unique, lowercase, no spaces (also the localStorage key).
- `price` — coins. (Free = `price:0`. Earn-only would need a small gate; ask.)
- `img` — path relative to the game folder.

That's it. Anything with `img` automatically appears in the shop, renders in-game
via `border-image`, AND draws on the shared result card via 9-slice. No other code.

---

## Kind B — procedural (CSS + a canvas painter)

The 8 built-in borders (hairline, bevel, frost, brutalist, gold, neon, deco, prism)
are done this way — a `.bd-<id>` CSS rule **and** a matching `case` in
`paintShareBorder()` so they also render on the share card. Only use this for
pure-CSS effects (gradients, glows). For real artwork, use Kind A.

---

## Prices at a glance (tune freely)
hairline 0 · bevel 80 · frost 180 · brutalist 240 · gold 350 · neon 420 · deco 550 · prism 900 · wildvine 500

Keep a mix: a couple cheap, most mid, a few aspirational. Coins come from playing
(rounds + daily bonus), so ~300–900 is "a few good sessions."

---

## After adding borders
- `node --check` won't parse HTML; instead extract the `<script>` and run it through
  `vm.Script` (see how the repo verifies satellites), or just load the page and open the shop.
- This game is single-source: `satellites/hues/index.html` is canonical and is also
  mirrored to the public `Stephenuffugus/Hues` GitHub Pages site. Push both when you ship.
