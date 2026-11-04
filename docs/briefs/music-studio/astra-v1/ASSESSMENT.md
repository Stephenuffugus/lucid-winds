# Music Studio • production assessment

Prepared 3 November 2026 for Stephen and the development team. Input brief is labelled 4 November. Recommendation: keep the musical immediacy and midnight greenhouse identity; turn the product into a dependable pocket studio, with sound discovery as a central creative action.

## Evidence and limits

The upload contains the brief only. Its referenced screens/ directory is absent. I retrieved the public studio.html and response headers on this run and inspected the relevant HTML, CSS and JavaScript. Browser rendering in the local runtime was blocked, so this is a source-backed review plus a screen-by-screen design walkthrough, not a claim to have seen the missing screenshots, listened to the audio engine or tested a phone. Preview images in this package are proposed designs. The arcade shell was not visually reviewed. Recheck current deployment before changing it. Findings reference the retrieved source, whose hash is in dev/LIVE_AUDIT.md.

## Product judgment

A teenager should hear a beat on the first deliberate tap, change one part, and recognize the result as theirs. On day 30 they should reopen the right song without hunting, recover their samples, and export something that sounds like what they heard. More controls will not create that trust. Fast musical feedback, recoverable edits, good sounds and reliable files will.

Do not make launch depend on full desktop DAW parity. Compete on time from idea to satisfying result. Preserve deeper editing behind progressive disclosure. Long term, the serious creator path needs MIDI and stems export, note velocity and duration editing, reliable sample projects, automation and better arrangement. Treat these as milestones, not decoration.

## Keep

- Instant editable starters. They solve the blank-page problem without trapping users in a backing track.
- Four named lanes, section variations and arrangement chips. They are an approachable song model.
- Existing synth fallback while real instruments load. Make the fallback visible and deterministic for export.
- Audio and visual exports. A song can become something the creator is proud to send.
- Distinct lane colors and the warm dark palette. Evolve hierarchy rather than imitate another product.
- Existing undo, local saving, sample storage and synthesis. Improve failure handling instead of replacing working ideas blindly.

## Confirmed findings beyond the brief

1. **Microphone policy is a release blocker.** The live response sends `Permissions-Policy: ... microphone=()`. In supporting browsers, this blocks getUserMedia. Fix the studio route and the enclosing arcade route policy/delegation; test top-level, framed and TWA entry paths. Do not request camera access. See LIVE_AUDIT and SOURCES.
2. **The three-second copyright claim is false reassurance.** Sampler markup says samples are kept under three seconds for copyright safety. Duration is not a blanket permission. Keep a short limit if needed for memory, but explain it as a product limit.
3. **Soundfont rights need correcting.** Source comment around line 881 describes gleitz audio as MIT. The publisher lists FluidR3_GM as CC BY 3.0 and MusyngKite as CC BY-SA 3.0. Audit the exact bank actually served; repository code licensing does not settle recording rights.
4. **Touch rules are not met uniformly.** `.gs-chip` allows 36×36, song row buttons 40 px high, the Keys lane select 44 px, range inputs 28 px high, and seven keys plus gutters cannot all remain 48 px wide at 360 px with current padding. Grid cells also need explicit sizing. A sixteen-column grid cannot fit 48 px targets on a portrait phone: use horizontal scrolling and beat paging, not overlapping invisible hit areas.
5. **Zoom is disabled in viewport metadata.** Remove maximum-scale/user-scalable restrictions and check large text/reflow.
6. **Some briefing descriptions are stale.** Source already custom-styles select arrows and range tracks. The issue is discoverability and density, not literally wholly unstyled controls. Source offers 16/32/64 steps and an extra World Beat kit; do not reduce these to the brief's 16 steps/seven kits during reskinning.
7. **Saving can appear successful after partial failure.** `writeSongIndex` swallows errors; `saveToSlot` can return true after index write failed. `autosaveTick` clears dirty state before a successful write. Sample IndexedDB writes do not surface completion/failure. Use transactional saves and user-visible recovery states.
8. **More product-like names exist than the header badge.** Source contains groove labels such as MPC 60 and SP-1200. Replace player-facing hardware references with descriptive groove names after reviewing their timing meaning. This is compliance with the brief, not a legal conclusion about those names.
9. **Hum is ambiguous.** It abbreviates Humanize in the transport and names microphone melody capture. Spell out Humanize in the feel panel.

## Screen-by-screen walkthrough

| Screen from brief | First session | Day 30 | Recommended correction and verification |
|---|---|---|---|
| 01 Start a Song | Eleven similar boxes make the first choice feel administrative | Wants last used styles and blank project immediately | Eleven cover motifs, name and BPM in live text, two columns, Resume before gallery when a draft exists. Starter selection is a user gesture; do not promise autoplay before it. |
| 02 Grid top | Too many equal-priority controls obscure Play and the active lane | Wants transport stable while editing | One fixed-height transport; Play, Stop, tempo, Loop, Tools. New belongs in header menu. Four-step phone page with 48 px cells and a 16-step noninteractive overview. |
| 03 Lane stack | Tiny spine is carrying too much identity | Hidden horizontal controls are hard to rediscover | Badge, lane name, instrument and pattern preview form a consistent header. Show Mute and Solo in an explicit second row when expanded. FX collapsed by default. |
| 05 Melody lane | Pitch direction, duration and scale need explanation | Needs precise length and velocity without accidental edits | Sticky pitch labels, visible beat boundaries, selected-note inspector, keyboard support. Preview a note without overwriting. |
| 06 Tools | A wall of commands is overwhelming | Wants recurring tools nearby | Three groups: Make music, Shape sound, Save and share. Keep favorite tools in a short recent row. No extra bottom toolbar full of tiny icons. |
| 07 My Songs | Empty list fails to suggest a next action | Twelve similar names are hard to scan | Seeded covers, last edited time, duration, search, recent sort, duplicate and export backup. Never delete on an unlabelled tiny cross alone. |
| 08 Rhythm | Hits and steps are abstract | Wants preview and undoable application | Necklace preview plus explicit target lane/row, audition then Apply. Preserve existing rhythm metadata. Named traditions are inspirations, not claims of complete authentic performance. |
| 09 Circle | The wheel is intimidating without feedback | Wants to hear a progression before replacing chords | Show current key and audition. Keep 12 real accessible buttons over the decorative ring; confirm destructive replacement via undoable apply. |
| 10 Keys | Recording state must be unmistakable | Wants reliable timing and no stuck notes | Horizontally scroll seven columns at 48 px minimum, record dot plus text, release on pointercancel/blur, optional count-in. |
| 11 Hum | Needs to know what gets recorded and when | Wants a retry that preserves the previous melody | Illustration, plain privacy copy, ready/listening/processing/review states, audition draft notes before Replace melody. Show weak input rather than inventing confident notes. |
| 12 Sampler | Waveform starts as an unexplained empty rectangle | Wants fast import and dependable kit recall | Three pad faces, Record / Import / Find sounds entry points, accessible trim controls, non-destructive edits, per-sample license details. Remove copyright-duration claim. |
| 13 Show | Strong payoff but single look | Wants videos that match the song | Keep radial style, add bars, orbit particles and record grooves. Title/end frames with live text and honest export progress; capability-check video formats. |
| 14 Arcade shell | Two onboarding layers may compete | Shell rewards can interrupt creation | Keep studio style subordinate to outer navigation. Award Sunbeams only after successful save/export, once per qualifying action. Verify shell mic policy and frame allow attribute. Not visually reviewed. |

## Ordered smoothing plan

Sizes are relative effort, not time estimates. A = art; C = code/deployment; B = both.

| # | Improvement | Size | Owner | Depends on | Done when |
|---|---|---|---|---|---|
| 1 | Fix microphone policy, bad copyright copy and soundfont attribution | S | C | Exact host config and bank audit | All entry paths tested; sample license notice accurate |
| 2 | Make song and sample saves honest and recoverable | L | C | Existing data schema audit | Quota/error/reload/migration tests pass; backup round trip works |
| 3 | Replace emoji and hardware badge with supplied identity and SVG set | S | B | Name approval for proposed wordmark only | No emoji controls or old badge; accessible labels remain |
| 4 | Stable transport, 48 px controls, grid paging and readable lane headers | M | B | #3 | 360, 390, 412, 430 px and desktop checked; no overlapping targets |
| 5 | Starter gallery and one editable three-action introduction | M | B | #4, supplied covers | First deliberate tap starts a usable fallback beat; no blank network wait |
| 6 | My Songs covers, success card and backup affordance | M | B | #2, cover generator | Twelve-song task is easy; failed save never shows success |
| 7 | Sound drawer with preview, replace, recents and favorites | L | B | License catalog, import contract | Warm preview responsive; no credentials in shipped HTML; edits undoable |
| 8 | Sampler and Hum permission/review states | M | B | #1, #2 | Denial, weak signal and cancel all recover without data loss |
| 9 | Show styles, video cards and share frames | M | B | Export path tests | Audio/video align and formats match extension/MIME |
| 10 | Store compositions from real post-integration captures | S | B | #1–9 pass | No feature in screenshots exceeds delivered behavior |

## Hook-ranked product additions

| Rank | Addition | Why | Art needed | Release |
|---|---|---|---|---|
| 1 | Find sounds, audition in the beat, then swap | Discovery becomes music immediately | Drawer design, waveform and source state icons | First three |
| 2 | Personal song cover plus one clean share action | A finished object creates pride and a reason to return | Seeded covers and share/title frames | First three |
| 3 | Guided first beat in three actions | Shows that every starter is editable | Starter covers and step spotlight tokens | First three |
| 4 | MIDI, stems and full project backup | Serious creators can keep working elsewhere | Export sheet states, file format labels | After stable master WAV and backup |
| 5 | Pass the phone section exchange | Social without servers | Turn indicator and session card | Later |
| 6 | More starters by mood and energy | Broadens taste without burdening the initial grid | Additional art only when music exists | Later |
| 7 | Optional local daily prompt | A reason to practice without ranking pressure | Prompt card | Later; no account requirement |
| 8 | Paid creative expansion | Charge for workflow value or original sound design | Honest feature comparison | Only after retention and export reliability |

The first three follow reliability fixes, not precede them. Keep reliable saving, backup and basic export out of a paywall. Do not sell access to public-domain recordings as if exclusivity were the value.

## Three commercial risks

1. **The app looks like a toy or sounds inconsistent.** Better art helps, but abrupt instrument loading and fragile exports kill trust. Lock the selected sound for an export, surface download status, match levels and test mix headroom.
2. **It reaches for every DAW feature before making one workflow excellent.** Win a narrow promise: a personal beat, a found sound and a shareable result in a short phone session. Measure completion before adding more tool rows.
3. **Saved work or sample rights become uncertain.** Protect songs with transactional storage and portable backups. Curate a traceable CC0 library; keep provider API terms separate from recording rights. Never imply a local save is cloud backup.

## Naming candidates

These are creative proposals, not checked trademark, domain or store-name availability. Do not rename the live product until Stephen chooses and the team checks conflicts.

| Name | Case |
|---|---|
| **Grovewave** • recommended | A distinctive music word paired with the greenhouse atmosphere; the icon can turn planted steps into a waveform. |
| **Mossbeat** | Short and tactile, especially suited to beatmaking, though narrower than the broader studio. |
| **Liltroom** | Suggests a welcoming place for making melodic ideas, with room to grow beyond beat grids. |

The supplied Grovewave wordmark is a proposal. A Music Studio fallback wordmark is also included so integration can proceed without a naming decision. App icon is wordless and survives either choice.
