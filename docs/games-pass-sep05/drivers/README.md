# Drivers and patches, Sep 05 2026

Everything in `drivers/` is a puppeteer walk or probe that was run against the live tree during the
flagship passes (Litter Bug and The Attic). They expect `/workspaces/lucid-winds` (or `/workspaces/Litter_Bug`
for the Litter Bug ones) and puppeteer from lucid-winds `node_modules`; the Attic ones want the static server
`python3 -m http.server 8777` at the repo root. `lbplay.mjs` and `atticplay.mjs` are the full first run walks
with real touch taps (they know the open screen and the how sheet). `artlists.py` and `artwrite.py` generated
the 183 ART_ASSETS.md lists and `ART-ASSETS-INDEX.md`.

Everything in `patches/` is the asserted Python patch that made each pass (anchor counts checked, nothing
applied on a miss). They are the record of what changed and why; the code itself is in git.

`lb-arena-balance-week.txt` is the seven day ladder measurement behind plan row 12.
