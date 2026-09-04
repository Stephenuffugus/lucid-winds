# Trailer, Sep 04 2026 (the one on the store page)

Source: Stephen's Pixel 9 screen recording of the web game, 38 s, portrait 1080x1920
(delivered as `assets/preview.mp4`, not committed: 77 MB). `render_1080p.sh` turns it
into the Steam 1920x1080 file (`IN=path/to/capture.mp4 ./render_1080p.sh`):

- crops the game column (x 112..967, y 240..1739) which drops the web "Music" chip at the
  top and anything under the game (the earlier InShot export carried a watermark there)
- blurred, darkened copy of the same column fills the wide frame
- three captions in the game's own Fredoka at weight 600 (`caption600.ttf`, instanced from
  `../fonts/f3.woff2` with fontTools), each 3.7 s with half-second fades, in the margins
- `endcard.png` (page background + library logo + "Sky Wolf Studio") fades in at 35 s and
  is also the poster / thumbnail
- audio untouched apart from a 1.1 s fade at the end; measured -13.9 LUFS, -2 dB peak

Two full-frame image inputs with per-frame scale/eq/fade made the first version take
20 minutes on this 2-core box under load. One pre-composed RGBA end card with
`enable='gte(t,35)'` made it 1m48s. A `\n` inside a bash double-quoted drawtext text is a
literal n; captions come from `textfile=`. The delivered file was re-encoded at crf 21 to
fit the 30 MB phone card (24 MB).
