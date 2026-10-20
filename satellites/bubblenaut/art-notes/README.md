# Bubblenaut art notes

Astra's own notes from the two packs delivered 20 Oct 2026, copied unchanged (no pictures, no scripts).
The 79 source masters live in the private vault, release `vault-20261020-bubblenaut-astra` in
`Stephenuffugus/lucid-winds-vault`; never edit them.

- `main/`: the 60 picture character pack (hero, enemies, world designs). `MAIN-ASSEMBLY.md` and `ASSEMBLY.md`
  hold the frame order, fps, loop and event frame of every strip; the two measurement JSONs hold the source
  rectangle of every frame.
- `remaining-19/`: effects, pieces, backgrounds, title, banner and icon.

The game's runtime art in `../art/r1/` is cut from the masters by `../tools/bncut.py` (see its header for why
each step exists). The SIFT registration it uses is cached in `../tools/registration.json`, so a re-cut needs
numpy, scipy and Pillow but not OpenCV.
