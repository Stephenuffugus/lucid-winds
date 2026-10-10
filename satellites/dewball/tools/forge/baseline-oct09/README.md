# same.sh baseline: the physics guard

`smoke.txt` and `balance-w1-12345.txt` are what `same.sh` compares a run against, byte for byte. They were recorded in
Phase 0 (9 Oct 2026) and are re recorded ONLY when a world's content changes on purpose, never to make a red go away.
Each re record, with its reason:

- 10 Oct, `dewball-v25`: Toybox Peaks drawn in (scale 0.9, no mat yards): smoke's w2 ladder line (ceil, need).
- 10 Oct, `dewball-v28`: Toybox's eight small toys: smoke's w2 ladder line.
- 10 Oct, `dewball-v31`: Crumb Country's six new treats: smoke (its w1 scripted roll and absorb all) and the w1 near bot,
  both recorded fresh. ⛔ Adding any scatter entry re rolls the whole world (49 of 56 kinds moved), so the old w1 bot
  could not stay byte identical. Measured before and after: goal 40.1 → 42.7 s, final 319 → 320 of 325, 95% at 127 →
  125 to 132 s.
