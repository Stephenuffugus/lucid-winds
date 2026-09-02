# DROP MUSIC HERE

Drag the zip of the music folder into THIS folder in the VS Code file tree.
Same gesture you used for the Jimothy music drop.

What happens next, automatically:
  1. `scripts/music_intake.mjs` moves the zip OFF this disk to /tmp.
     /workspaces is 91% full; /tmp has 38GB free. The zip must not stay here.
  2. It unzips in /tmp and reads the folder structure (one folder per game).
  3. It probes every file with ffprobe: format, bitrate, duration, size.
  4. It writes docs/music-intake.json — names and numbers only, no audio.

⛔ NOTHING IN THIS FOLDER IS EVER COMMITTED. It is gitignored, including the zip.
⛔ Audio files never enter git. The repo is public and already 3.7GB.

## Two rules for the folders (added 2026-09-02)

1. The FIRST song in a game's folder, by file name, is the free one the player gets on opening the game. To choose the order, start file names with `01 `, `02 `, and so on. The prefix is stripped from the title the player sees.
2. A folder named `Card Games`, `Board Games`, `Word Games`, `Dice`, `Puzzle Games`, `Party Games`, `Math Games`, `Action Games`, `Pattern Games` or `Creative` becomes a SHARED shelf that every game of that kind can unlock. Extras that do not belong to one game go there.

A folder that matches no game and no family is listed in `docs/music-unmapped.md` after the manifest runs; rename it to the game's exact arcade name and run again. Nothing is guessed.
