# SFX Credits — Puppy Dash

All one-shots sourced from **Kenney.nl** asset packs, published under
**Creative Commons Zero (CC0)** — public domain, free for commercial use, no
attribution required. Each pack's `License.txt` was verified to state CC0 at
download time (2026-08-25).

Processing (ffmpeg): mono 96kbps MP3, leading silence trimmed, loudness
normalized to -14 LUFS / -1.5 dBTP. The in-game synth remains the fallback for
every cue.

⚠ Cues were picked by name and waveform in a headless box, not by ear.
Audition on a phone; swapping any of them is one file replace, no code change.

## Source packs

| Pack | URL | License |
|---|---|---|
| Interface Sounds | https://kenney.nl/assets/interface-sounds | CC0 |
| Impact Sounds | https://kenney.nl/assets/impact-sounds | CC0 |
| Digital Audio | https://kenney.nl/assets/digital-audio | CC0 |
| Music Jingles | https://kenney.nl/assets/music-jingles | CC0 |

## File provenance

| File | Cue | Source pack | Original file |
|---|---|---|---|
| jump.mp3 | jump | Digital Audio | phaseJump1.ogg |
| slide.mp3 | slide | Digital Audio | lowDown.ogg |
| coin.mp3 | bone pickup | Digital Audio | pepSound3.ogg |
| gold.mp3 | golden bone | Interface Sounds | confirmation_002.ogg |
| magnet.mp3 | magnet powerup | Digital Audio | powerUp2.ogg |
| jet.mp3 | jetpack | Digital Audio | powerUp12.ogg |
| crash.mp3 | caught | Impact Sounds | impactPlank_medium_000.ogg |
| land.mp3 | landing | Impact Sounds | footstep_grass_002.ogg |
| ui.mp3 | button tap | Interface Sounds | click_002.ogg |
| best.mp3 | new best jingle | Music Jingles | Pizzicato jingles/jingles_PIZZI01.ogg |
| over.mp3 | game over sting | Music Jingles | Pizzicato jingles/jingles_PIZZI09.ogg |

## Music (Stephen's, not CC0 — wanted)

The game has no music yet. Cue list for Suno, same delivery specs as FTW
(stereo 128k MP3, loop files must end clean with NO fade-out tail):

| Cue file | What it is | Notes |
|---|---|---|
| music_menu.mp3 | select screen loop | bright, bouncy, 20 to 40s loop |
| music_run.mp3 | the run loop | playful driving 100 to 120 BPM; it plays under everything, keep the low end light so the one-shots read |
| music_jet.mp3 | jetpack overlay (optional) | 8 to 12s of triumph, can layer OVER music_run |

Drop them in this folder and tell the code they exist — wiring is one small
block modeled on FTW's sfxBed.
