# Music Engine Integration Plan (sheet-music → audio)

Status: PLAN ONLY, not built. Written 2026-06-27 for Stephen + the dedicated
"music Claude" he is about to spin up. We will talk it through before building.

## The thing being added

A separately-built engine (another Claude) that **reads sheet music and plays
it**. Feed it any public-domain score and it produces audio, no recording
needed. This solves three things at once:
1. Classical pieces we cannot add today because no cleared recording exists.
2. Bringing in other styles cheaply (anything with a score).
3. Novel listening: restyle a piece (tempo, instrument, key), watch the score
   animate, generative variations.

## Where the music stack stands today (the real seams)

- `music-tracks.js` — single source of truth. One array of
  `{ id, title, artist, src, cat }`. `src` is an audio path/URL (bundled mp3 or
  streamed). Feeds BOTH the app (`LW_MUSIC` in index.html) and the portal.
- `music-player.js` — shared `SWSPlayer`. It is entirely `<audio>`-based:
  `play(i)` sets `audio.src = track.src` and calls `.play()`. Recorded vs
  streamed is invisible to it. Has playlists, repeat, save/restore, the one
  music button + categorized drawer. Used on portal + every game shell.
- The "Music Studio" (game id `song`, in the Creative category) is a separate
  DAW-lite CREATION tool: layer drums/bass/keys/leads.

So today: one manifest, one player/button for listening, one studio for making.

## Core decision: the engine is a TRACK FACTORY, not a second player

Do not build the sheet engine as a competing player. Build it upstream of the
manifest. The engine renders a score to audio; that audio becomes a normal
entry in `music-tracks.js` under a new category (e.g. "Classical (rendered)").
The existing one button plays it like anything else. Nobody listening can tell
a rendered Chopin from a recorded one. The "no recording exists" gap is closed
with zero player changes.

## Core decision: RENDER AHEAD, do not live-synth in the background

This app has a real thermal history (the animation-pause work). A WebAudio synth
running continuously under gameplay is exactly the always-on CPU that cooks
phones. So:
- For anything that plays in the **background/library**: the engine renders a
  score to an audio buffer ONCE (bake to a file, or render-to-blob and cache).
  At play time it is just a recording. No synth cost, no thermal risk, no player
  surgery.
- Keep **live synthesis** only inside a deliberate interactive surface (the
  "score room" below), where the player is actively messing with the music and
  the CPU cost is expected and bounded.

## Core decision: federate, do not fuse (player + studio + engine)

Listening and creating are different modes. Do NOT merge the player and the
Music Studio into one mega-UI. Share the layer UNDERNEATH instead:
- **One engine** (synth / instrument voices) powers both the sheet renderer and
  the Studio's instruments, so voices are consistent.
- They COMMUNICATE through shared formats, not a fused screen:
  - Studio composition → export as a rendered track that lands in the library
    (players become contributors).
  - Library piece → "open in Studio" to remix.
  - Both speak one notation/voice format.

Mental model: **one engine underneath, one library+player for listening, one
studio for creating, talking to each other through shared files.** Each piece
can evolve (and be owned by the music Claude) without breaking the others.

## The real prize: a "Score Room" (its own surface)

The novel-listening idea deserves its own screen, like the Studio: show the
notation animating as it plays, let the listener restyle it (tempo, instrument,
key, generative variation). This is the genuine short-form-video / share hook
("watch an 1840s score come alive, then hear it as a music box") and it rhymes
with the rest of Lucid Winds: procedural plants, procedural haiku, now
procedural music. Brand-consistent, not a bolt-on. This is where live synth is
allowed.

## Phasing

- **Phase 1 (highest value, lowest risk):** engine renders a batch of PD scores
  to audio; add them to `music-tracks.js` under a "Classical (rendered)" cat.
  Ships behind the existing one button. Validates the engine and fills the
  library immediately. No player changes.
- **Phase 2:** share the synth/voice engine between the renderer and the Music
  Studio. Add a Studio "publish to library" export (composition → rendered
  track).
- **Phase 3:** the Score Room (animated notation + restyle), live synth, and the
  cross-links (listen → open in Studio; library → remix).

## Decisions for Stephen + the music Claude (talk through before building)

1. **Render-ahead vs live-synth** for the library. Recommendation: render-ahead
   for anything background; live only in the Score Room.
2. **Notation format in.** MusicXML / MIDI / ABC / Lilypond? Pick a
   machine-readable one and source it from places that publish it (Mutopia
   Project, MuseScore CC scores), NOT scanned IMSLP PDFs (those need optical
   music recognition the engine probably does not do).
3. **Licensing nuance.** PD *composition* is not PD *engraving*. Want PD
   compositions in PD/CC machine-readable scores. Same discipline the manifest
   already documents for recording-vs-composition.
4. **Public framing.** A synth playing a human-composed public-domain score is a
   *player piano*, not an AI composer. Lead with "we render public-domain
   scores," not "AI makes music." Cleaner story given the AI-showcase-DQ risk in
   the playbook. The artist funnel (Stephen's own Bandcamp originals) stays a
   separate lane; rendered classical is background ambiance, his originals are
   the artist lane.

## Seams the music Claude should build against (so it does not reinvent)

- **Manifest track type:** extend `music-tracks.js` entries minimally. Simplest:
  a rendered piece is just a normal `{id,title,artist,src,cat:'Classical
  (rendered)'}` where `src` points at the baked audio. If we ever want
  on-the-fly, add an optional `kind:'sheet'` + `score:'<path>'` that the player
  routes to the engine, but default to baked audio first.
- **Engine render contract:** `render(score, {instrument,tempo,key}) ->
  audioBlob/URL`. Pure function, cacheable, offline-capable. This is what feeds
  Phase 1.
- **Studio publish/import contract:** Studio composition <-> notation file the
  engine can render; "publish" writes a manifest entry pointing at the baked
  output.

## Open questions to resolve with Stephen

- What format does the engine actually consume right now? (Drives sourcing.)
- Does it already render-to-buffer, or is it currently real-time only?
- In-app `LW_MUSIC` vs portal player are still slightly separate (per memory the
  in-app one lacks playlists). Do we unify them while we are in here, or leave
  that to the music Claude as a parallel cleanup?
