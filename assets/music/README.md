# Lucid Winds — Soundtrack drop folder

Drop finished MP3s into this directory, then add an entry to the
`TRACKS` array near the bottom of `index.html` (search for
`LW_MUSIC — soundtrack player`).

## Recommended encoding
- **Format:** MP3 (universal — Pi Browser, iOS, Android, desktop)
- **Bitrate:** 192 kbps (sounds full, ~1.4 MB/min)
- **Sample rate:** 44.1 kHz
- **Stereo:** yes
- **LUFS:** target around -14 LUFS integrated (streaming-friendly,
  matches what listeners expect from Spotify-quality bounces)

## Manifest entry shape
```js
{
  id:     'lucid-wind',                   // kebab-case, used internally
  title:  'Lucid Wind',                   // shown in player UI
  artist: 'Stephen',                      // optional, defaults to "Stephen"
  src:    'assets/music/lucid-wind.mp3',  // path from repo root
  mood:   'jazzy hip-hop'                 // optional flavor tag, shown small
}
```

## Behavior reminders
- Player auto-pauses whenever any mini-game opens (Bloom Wheel, etc).
  Resumes only if the game-open caused the pause.
- User-paused tracks stay paused.
- Volume, current track, and mute persist via `localStorage`
  (`lw_music_state`). Playback POSITION does not — by design.
- The "Soundtrack" row in BoS ABOUT only renders when `TRACKS.length > 0`.

## Hosting note
These MP3s ship inside the repo and deploy to Hostinger with the rest
of the static site. Browser streams progressively — no whole-file
preload. Per-listener bandwidth is ~3 MB per track played.
