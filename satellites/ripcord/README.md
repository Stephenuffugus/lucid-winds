# Ripcord

Build a spinning top, wind it by drawing circles, then keep your hands off it
while it fights.

Single file vanilla HTML, CSS and JS. No build step, no framework, no physics
library, no network, no accounts and no currency. It works offline.

**Read [HANDOFF.md](HANDOFF.md).** It is the whole account: what is built, what
went wrong on the way, and the one open design question.

```bash
node tools/check.js        # every gate. Must print ALL GATES PASSED.
node tools/bundle.js       # src/ -> index.html
```

| | |
|---|---|
| Parts | 110 across three tiers, 5,111,040 chassis |
| Weights | up to 4 in 12 holes, 46,666 configurations |
| Abilities | 18, one per core, fired by 1 of 9 triggers you program before launch |
| Rigs | 16 named synergies, each proven to change at least 8 percent of rounds |
| Ladder | 25 rungs, 5 leagues, 5 bosses, every part winnable |
| Modes | Pangkah, Uri, Taya, target range, and pass the phone |

The design and the physics core are Stephen's. `docs/CATALOG.md` and
`docs/ASSETS.md` are generated from `src/sim2.js` and will drift the moment you
edit a part, so re-run their generators.
