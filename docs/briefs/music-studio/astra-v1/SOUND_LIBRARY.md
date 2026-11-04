# Sound discovery that stays out of the musician's way

## Recommended launch decision

Ship a curated CC0 collection, searchable locally, with same-origin assets and no provider account needed by the player. Retain the current synthesized instruments and audited GM instruments. Add a sound drawer beside the instrument picker and the sample pads. A good initial target is 128 reviewed one-shots, not an unfiltered million-file search: 32 kicks, 24 snares/claps, 24 hats/cymbals, 16 percussion, 16 tonal hits and 16 textures. These are proposed acquisition counts, not audio delivered in this pack.

**The brief says sound comes only from synthesis and streamed GM, and that this handoff must contain no audio. This ZIP contains no audio.** First-class streamed CC0 samples are a proposed extension to that runtime sound-source rule. It can retain one HTML application file with external static assets and vanilla JavaScript, but the team must explicitly adopt that source extension before shipping it. Until then, implement the drawer for existing GM voices and local imports, with source-site links for discovery. Do not quietly add a live API or server dependency.

## The shortest useful flow

1. Tap the instrument name or Find sounds on a sample pad. The drawer knows the destination lane or pad.
2. See useful results immediately: Drums, Instruments, Textures; search; recent and favorite sounds. Show name, type, duration and download state. Optional BPM/key only when known.
3. Tap Preview to hear a level-matched audition. The row has separate Preview and Use sound controls, both at least 48 px. Only one audition plays. The existing instrument stays selected until Use sound.
4. Tap Use sound. Download and decode completely before committing. Replace on the next bar during playback; offer Undo. If no sample pad is available, offer an explicit replacement choice rather than deleting one.
5. Persist the sample reference and its provenance with the song. Show Saved on this device only after both audio storage and project save commit.

Avoid a checkout, provider login or license dialogue for each trusted catalog sound. A small CC0 indicator opens Source details. Do not use a generic green Legal badge that promises more than the team verified.

## Source choices, based on primary sources checked 3 November 2026

| Source | Rights and access | Fit | Launch decision |
|---|---|---|---|
| FreePats electric percussion | Specific page declares CC0; SFZ/WAV and SF2 downloads | Clear initial drum acquisition candidate | Review downloaded archive license and samples, then host permitted converted assets on studio origin |
| FreePats classical guitar | Specific bank declares CC0; multiple formats | Tonal hits and mapped instrument | Preserve root notes, tuning, loop points and velocity zones; not just a generic audio file |
| FreePats pipe organ | Specific bank declares CC0 | Sustained instrument | Preserve release/loop behavior; listen to transitions |
| FreePats synth pads | Several named banks declare CC0 | Warm chords and evolving textures | Select a small bank; review each version separately |
| Freesound CC0 subset | Per-item licenses vary; API commercial use requires an arrangement; original-file download API requires OAuth2 | Broad future discovery | External discovery links now; live integration only after commercial terms and credential design are settled |
| FluidR3_GM in the current gleitz distribution | Publisher lists CC BY 3.0 | Current multi-instrument foundation | Audit version and attribution; do not describe it as public domain or infer audio rights from MIT code |
| MusyngKite in that distribution | Publisher lists CC BY-SA 3.0 | Optional alternative | Separate rights review before use; do not assume all banks share a license |
| 99Sounds | Royalty-free creative uses, but standalone redistribution restricted | User's own licensed imports | Do not mirror its library into the app without specific permission |
| MusicRadar SampleRadar | Music use allowed; redistribution prohibited in source wording | External discovery and local import | Not a built-in sample catalog without permission |
| Internet Archive | Does not guarantee uploaded rights statements | Research lead, not blanket clearance | Item-by-item provenance review only; exclude from default automated intake |

CC0 is a public-domain dedication with fallback terms; it is not the same as a generic “free download.” It does not clear unrelated privacy, publicity or trademark rights. A public-domain composition does not automatically make a later recording public domain. Prioritize instrument recordings with a clear creator, rather than recognizable performances or speech. See SOURCES.md. This is a product acquisition policy, not a legal guarantee about any individual recording.

## What “connected” means in a one-file app

Preferred: a versioned static catalog JSON on the studio's own host, plus authorized audio files on that host. Search and filters run locally. No secret, no live provider availability requirement, no runtime build step. The studio remains one HTML application file, like its external art today. Publishing preparation may convert permitted source archives; that is not a bundler requirement for the app.

If strict GM-only runtime constraints remain: ship only cataloged existing GM voices and local file import. Do not label a source link as Add sound. Browser cross-origin policy, authentication and provider terms prevent a universal paste-any-link importer. Accept local files and allowlisted same-origin catalog URLs; do not fetch arbitrary pages or executable soundfont scripts from user input.

A future provider adapter can sit behind the same catalog shape. Never put a shared Freesound client secret or token into public HTML. A commercial licensed integration may require additional architecture beyond this brief. CORS permission and content license permission are independent. No authenticated provider calls were made for this pack.

## Catalog record and provenance

See dev/sound_catalog.schema.json and dev/source_candidates.json. Candidates are source-page leads only, with `ready:false`; no invented sample IDs, audio URLs or checksums. The published playable catalog starts empty until acquisition passes review.

Every approved playable sound needs stable ID/version, creator and source page, exact license URI, verification date, source archive SHA-256, original filename, normalized audio SHA-256, MIME, bytes, duration, channels, sample rate, category/tags, loudness/peak metadata, preview/asset URL and modifications. Preserve attribution text even for CC0 as useful provenance. BPM and key can be null; never invent them. Distinguish one-shot, loop and mapped instrument. A mapped instrument additionally needs root MIDI note, key/velocity ranges, tuning and loop envelope data.

Retain a review log and original license evidence internally. Removing a catalog item prevents new discovery but must not silently rewrite or delete a user's existing project. A rights problem needs a migration/remediation decision with a clear explanation.

## Audio behavior and performance contract

- Immediate starter playback uses the existing synth if required notes are not ready. Label this clearly. Avoid switching timbre halfway through a held note; adopt prepared voices at a beat or bar boundary.
- Preview target: median under 150 ms warm/decoded, under 1.5 s cold on a tested representative mobile connection. These are targets, not measured results. Show Loading immediately and allow cancellation.
- Start with at most two fetches and one decode in flight. Deduplicate requests by content hash. Abort obsolete previews and ignore stale completions. Never add a previous search result after the user changed selection.
- Initial sample policy: 10 MB encoded file limit and 30 s decoded duration limit; default drum edit region remains 3 s. These are proposed resource limits, not copyright rules. Validate before expensive allocation where possible; reject malformed/unsupported audio with the original project intact.
- Decoded float32 PCM uses sampleRate × seconds × channels × 4 bytes, plus overhead. At 48 kHz a 30 s stereo clip is about 11.52 MB. Set a proposed 32 MiB decoded LRU budget, measure it on low-memory phones, and never evict active voices or unsaved work.
- Cache downloaded encoded audio in IndexedDB with quota handling. Keep in-use project references pinned. “Available offline” means required bytes are cached; it does not guarantee the app shell will reopen offline. A proper install/offline shell requires separately served service-worker infrastructure, beyond literal single-file deployment.
- Use gain-based audition matching, not destructive normalization of source files. Apply short fades at trim boundaries, preserve stereo unless user chooses mono, and document reverse/pitch/trim as reversible edits. Playback-rate pitch shifting changes duration; do not promise independent tempo fitting without a tested stretch algorithm.
- Project backup must include authorized sample bytes or explicit missing-sample references, source information, sound versions and edit parameters. Song code alone cannot carry arbitrary local audio. Show this before sharing, and offer a portable project file rather than a silent substitute.
- Keep stock sample identity stable across catalog updates. Project files reference asset hashes/versions, not mutable search-result positions.

## Preview in the beat

For the first release, Preview auditions the candidate in isolation and leaves the song unchanged. Next, add “Hear in song”: route the selected lane through a temporary candidate voice at the next bar while preserving the committed selection. Stop preview restores the original exactly. Give MIDI-note candidates a lane-appropriate note/chord and drum candidates the selected row's pattern. Treat this as an explicit feature addition requiring engine tests.

## Export and musical trust

Freeze a project snapshot and all required sound versions before rendering. Preload every required note/sample and explain any unavailable voice. Offer Wait or Export with synth sounds; never substitute without notice. Use the same scheduling, envelope, effects and seeded probability/humanize choices in live playback and offline rendering. Include reverb/delay tails, stop hung notes and protect against clipping without quietly changing the mix. Offline stems need a shared effects-routing decision: shared return stems or documented wet per-lane exports, not duplicate reverbs that sum incorrectly.

Video export must probe supported codecs and MIME at runtime, include captured Web Audio output, and keep visual timing tied to audio. Do not label WebM as MP4. WAV remains a dependable fallback; test file sharing and download fallbacks inside the TWA.

## Acquisition acceptance

No sound becomes searchable until its source/recording rights are documented, allowed redistribution is verified, archive contents are inspected, per-file hashes are recorded, audio is decoded/listened to, peaks/DC offset/trim are checked, and root/loop metadata is verified where relevant. Start with the four FreePats page leads supplied here, then broaden. Neither this ZIP nor the sample schema is a ready-to-ship audio library.
