# Pit Bike Rally test tools (24 Oct 2026, the build out in plans/pitbike-rally/BUILD-PLAN-OCT24.md)

The game lives upstream in `/workspaces/skywolf-pitbike-rally` (ES modules, no service worker). Every gate serves a game
folder with `python3 -m http.server` on a random port and drives the REAL modules in headless Chrome through the dev hook
`window.__PBR` (`S`, `startRace`, `setScreen`, `finishRace`, `saveNow`; `__PBR.autopilot = true` lets the AI ride the
player's bike). One browser at a time: the box has 2 cores.

- `p0_gate.mjs [gameDir] [outDir]`: Part 0 (v1.8) plus its review fixes (v1.9). A v1.7 save round trips byte for byte;
  career and trial wear nothing, a free race wears; an autopilot trial stamps pv 1; an autopilot career race wears nothing
  (then the garage is shot); pause and RESTART RACE (real taps) restart a career round as a career round; a record set
  under newer physics is never raced, beaten or overwritten; the Daily never races yesterday's ghost. `SKIPC=1` skips the
  autopilot races, `SKIPD=1` the review block.
- `p1_gate.mjs [gameDir] [outDir] [noShots]`: Part 1 (v1.9), the analog throttle, driven with REAL touch events (CDP
  `Input.dispatchTouchEvent`, never `el.click()` or synthetic events). Two notes learned the hard way: a CDP `touchEnd`
  lifts EVERY finger (lift one finger by sending a `touchMove` without it), and each awaited CDP event costs about 50 ms
  on this box, so a flick is sent back to back (`Promise.all`) or it arrives as a slow push. Layout and the HUD row are
  checked at 915x412, 800x360, 740x360 and 667x375 with six nitro pips; thumb shots draw the thumbs.
- `fwrun.mjs <p0|p1> [group ...]`: the fail watch. Each group copies the clone to /tmp (tar, no .git), breaks ONE rule in
  one file and must go red on the check it names.
- `deploy.sh <hash> <file under src-hash> <one line only this build has>`: the files only deploy (main's tree plus the
  `satellites/pitbike-rally` paths, a private index). Message in `$SP/msg.txt` (default `/tmp/claude-1000/pb-deploy`).
  Add each new `src-<old>` to its keep list when a build ships.

Vendor: `bash tools/vendor_into_portal.sh` in the clone (it deletes the portal folder), then
`git checkout -- satellites/pitbike-rally/src-<each old sha>` so cached index pages keep their modules.
Push upstream: `env -u GITHUB_TOKEN -u GH_TOKEN git -c credential.helper='!gh auth git-credential' push origin HEAD:main`.
