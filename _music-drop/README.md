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
