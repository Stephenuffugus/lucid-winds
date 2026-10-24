# Super Slice files-only deploy (used for v6.9 to v7.2, 24 Oct 2026)

`deploy.sh` builds a commit on main from main's tree plus ONLY the branch's changes under `satellites/slice-3d` and
`portal/index.html`, in a private git index, refuses if main has commits the branch lacks or if the portal diff is more
than the Super Slice card's `?v=` stamp, checks five values in the built commit, then pushes it to main.

Before running, write the state files into `$SP` (default `/tmp/claude-1000/ss-deploy`):
- `msg.txt`: the commit message; `@BR@` is replaced by the branch's short sha.
- `want_build` (e.g. `var BUILD="v7.2";`), `want_swreg` (`register('sw.js?v=76')`), `want_cache` (`var CACHE = "slice3d-v78";`),
  `want_card` (`url:"/satellites/slice-3d/?v=20261024h"`), `want_code` (one line only the new build has).

After: `git fetch origin main && git merge --no-edit origin/main && git push origin add-sproing-jumper`, wait for the
host, byte compare the live files with a random query (one probe at a time), then `ssb/oldworker.mjs <origin> check`
on both origins (profiles primed on the old build BEFORE the deploy).
