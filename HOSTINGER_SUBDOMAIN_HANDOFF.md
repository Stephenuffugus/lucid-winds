# DEPLOY HANDOFF — Other Claude reads this and ships. Stephen does NOTHING.

> Stephen has chosen **GitHub Pages** as the deploy target. The reason is simple: GitHub Pages can be enabled, configured, and shipped to entirely from the `gh` CLI. Stephen does not touch hPanel, does not click anything, does not log in to anything. The other Claude does 100% of the work.
>
> The end state is: every `git push` to `main` of the other project's repo automatically deploys the game to `https://stephenuffugus.github.io/<repo-name>/`. Stephen opens that URL on his phone and plays.
>
> **Read this entire file before touching anything.** If you skip a step you will waste another day. If you ask Stephen to "log in" or "click in the dashboard" you have already failed — every step here is doable with the tools you have.

---

## THE WHOLE PLAN IN 60 SECONDS

You will:
1. Confirm the repo is on GitHub and you can `gh` against it.
2. Enable GitHub Pages on `main` branch root via `gh api` (one command).
3. Fix any absolute asset paths in `index.html` (one `grep` finds them).
4. Add a `LB_VERSION` cache-bust constant if not already there.
5. Run the smoke harness (if the project has one).
6. Commit, push, wait ~60 seconds for Pages to build.
7. Verify the deploy URL returns HTTP 200 and shows the game.
8. Report to Stephen: the live URL + the commit hash. Then stop talking.

That is the entire job. Steps 1-2 are setup (one time). Steps 3-7 are the normal deploy loop forever after.

---

## STEP 1 — CONFIRM THE GROUND TRUTH

Run these from inside the other project's repo:

```bash
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef,visibility
```

Expected:
- `gh auth status` shows you logged in as `Stephenuffugus` (or with a token that has `repo` + `pages` scope).
- `gh repo view` returns the repo's `owner/name` and default branch (should be `main`).

If `gh auth status` fails: run `gh auth login`, pick GitHub.com, HTTPS, "Login with a web browser" — this gives Stephen a code to paste. **This is the only step where Stephen does anything**, and it is a one-time per-environment auth, not a per-deploy thing. If `gh` is already authed (very likely in this environment), skip it.

If the repo is private and you don't have a `pages` scope token, you'll need to re-auth with `gh auth refresh -s repo,pages`. Pages on private repos requires a paid GitHub plan; if the repo is private and Stephen is on free, **make the repo public** with `gh repo edit --visibility public --accept-visibility-change-consequences`. There is no other path.

---

## STEP 2 — ENABLE GITHUB PAGES (ONE-TIME)

This is the command that has been blocking everything. Run it exactly once per repo:

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

gh api -X POST "/repos/$OWNER_REPO/pages" \
  -f build_type=legacy \
  -F 'source[branch]=main' \
  -F 'source[path]=/'
```

Expected response: a JSON blob with `"status": null` or `"status": "queued"` and a `"html_url"` field — that URL is where the game will live (`https://stephenuffugus.github.io/<repo-name>/`).

**If you get `HTTP 409 — already exists`:** Pages is already enabled. Skip to Step 3.

**If you get `HTTP 404`:** the `gh` token doesn't have `pages` scope. Re-auth: `gh auth refresh -s repo,pages` and try again.

**If you get `HTTP 422`:** the repo is private and the account is on free GitHub. Either upgrade the repo to public (`gh repo edit --visibility public --accept-visibility-change-consequences`) or move to a paid plan. There's no third option.

To check Pages status anytime:
```bash
gh api "/repos/$OWNER_REPO/pages"
```

---

## STEP 3 — FIX ABSOLUTE PATHS (CRITICAL)

GitHub Pages serves your repo at `https://stephenuffugus.github.io/<repo-name>/`. The `<repo-name>/` part is a subdirectory. That means any asset URL starting with `/` (a leading slash) will resolve to the wrong place:

- `<img src="/assets/foo.png">` → tries `https://stephenuffugus.github.io/assets/foo.png` (404 — missing the repo name)
- `<img src="assets/foo.png">` → resolves to `https://stephenuffugus.github.io/<repo>/assets/foo.png` ✓

Find every offender:

```bash
grep -nE '(src|href)=["\047]/(assets|games|api|shared|core|app|fonts|icons|img)' index.html
grep -nE 'fetch\(["\047]/(assets|games|api)' index.html
grep -nE 'url\(["\047]?/(assets|games|api)' index.html
```

For every hit: drop the leading `/`. So `/assets/foo.png` becomes `assets/foo.png`.

**Also delete any `<base href="...">` tag** unless you have a deliberate reason for it. It will silently break relative paths.

**Special case — `manifest.json`**: PWA manifests reference icons by URL. If `manifest.json` has `"src": "/icons/192.png"`, change to `"src": "icons/192.png"`. Same with `"start_url": "/"` — change to `"start_url": "./"`.

**Special case — service worker scope**: if the project registers a service worker like `navigator.serviceWorker.register('/sw.js')`, change to `navigator.serviceWorker.register('sw.js')` and inside `sw.js` make sure all `cache.add(...)` calls use relative paths too. A misconfigured SW on GitHub Pages will trap users on a stale version forever.

---

## STEP 4 — CACHE-BUST CONSTANT

Near the top of the main `<script>` block in `index.html`, ensure this exists:

```js
window.LB_VERSION = '2026.05.23.01'; // bump on every push
```

(If the project already has `LW_VERSION` or `GAME_VERSION` or similar, use that — don't create a duplicate.)

Then every asset URL the JS constructs should append the version:

```js
'<img src="assets/bugs/wing-01.png?v=' + (window.LB_VERSION || '0') + '">'
```

Why this matters on GitHub Pages: GitHub serves assets through Fastly's CDN with aggressive edge caching. Without a cache-bust query, Stephen's browser will trap him on the previous version even after you push a fix. The version-string query forces a fresh fetch.

**Bump `LB_VERSION` on every single deploy.** Use ISO date + counter format (`2026.05.23.01`, `2026.05.23.02`, etc.) so it's always monotonically increasing.

---

## STEP 5 — SMOKE HARNESS

If the project has `scripts/smoke.js` (or `npm run smoke`), run it:

```bash
npm install --silent
npm run smoke
```

Must be green. If it red-lines, fix it before you push. A broken smoke harness is a broken game and you'll just be shipping a broken thing publicly.

If the project has no smoke harness, skip this step (don't add one as a "while I'm in here" — Stephen will tell you when to add one).

---

## STEP 6 — COMMIT AND PUSH

```bash
git add -A
git status   # eyeball what you're about to commit; abort if anything looks wrong
git commit -m "$(cat <<'EOF'
Deploy: enable GitHub Pages + fix relative paths for subdir hosting

- Enabled Pages on main/root via gh api
- Converted absolute asset paths to relative for github.io/<repo>/ subdir
- Bumped LB_VERSION for cache bust

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push origin main
```

GitHub Pages picks up the push and rebuilds. Build takes 30-90 seconds.

---

## STEP 7 — VERIFY THE DEPLOY ACTUALLY WORKS

Don't trust the build status — verify the URL.

```bash
OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
REPO_NAME=$(gh repo view --json name -q .name)
PAGES_URL=$(gh api "/repos/$OWNER_REPO/pages" -q .html_url)

echo "Deploy URL: $PAGES_URL"

# Poll until the deploy is live (max ~2 min)
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL")
  echo "Attempt $i: HTTP $code"
  if [ "$code" = "200" ]; then
    break
  fi
  sleep 10
done

# Spot-check: does the served HTML contain something we expect?
curl -s "$PAGES_URL" | grep -i "<title>" | head -1
```

You're done when the URL returns HTTP 200 and the `<title>` matches what's in your repo's `index.html`.

Also spot-check that an asset loads:

```bash
# Try a known asset path from your repo
curl -s -o /dev/null -w "%{http_code}\n" "$PAGES_URL/assets/icon.png"
# Expect: 200 (or whatever path you actually have — pick any real file)
```

If the HTML loads (200) but assets are 404, you have an absolute-path issue — re-run Step 3's greps.

---

## STEP 8 — REPORT TO STEPHEN AND SHUT UP

In one short message, give Stephen:
1. The live URL (`https://stephenuffugus.github.io/<repo-name>/`)
2. The commit hash you pushed
3. A one-line summary of what changed

Then stop. Do not propose follow-up work. Do not "while I'm in here". Do not refactor. Stephen will tell you what to do next.

---

## THE NORMAL DEPLOY LOOP (after Step 2 is done once)

After today, every code change ships like this:

1. Edit files.
2. Bump `LB_VERSION` (`2026.05.23.01` → `2026.05.23.02`).
3. Run smoke harness (if present).
4. `git add -A && git commit -m "..." && git push origin main`
5. Wait ~60 seconds.
6. Verify URL returns 200 with curl.
7. Tell Stephen the commit hash.

Steps 1-2 of THIS handoff (gh auth + enable Pages) only happen ONCE per repo, ever. After that, it's just normal commits.

---

## TROUBLESHOOTING — IF SOMETHING IS BROKEN

### Symptom: Deploy URL returns 404

**Cause:** Pages enabled but first build hasn't finished, OR `index.html` isn't at the repo root.

**Fix:**
```bash
# Is the build still queued?
gh api "/repos/$OWNER_REPO/pages/builds/latest"
# Look at "status" — should be "built". If "queued" or "building", wait.
# If "errored", read the "error.message" field.

# Is index.html at repo root?
ls -la index.html
# If it's in a subfolder, either move it to root or reconfigure Pages source path
# to point at that subfolder.
```

To change the source path:
```bash
gh api -X PUT "/repos/$OWNER_REPO/pages" \
  -F 'source[branch]=main' \
  -F 'source[path]=/docs'   # or whatever subfolder
```

### Symptom: HTML loads but every image/script is 404

**Cause:** Absolute paths. Re-run Step 3.

### Symptom: Old version still showing after a fresh push

**Cause:** Either the build hasn't finished, or the browser/CDN is serving stale.

**Fix:**
- Wait 60 seconds, refresh.
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R).
- If still stale: did you bump `LB_VERSION`? If not, do that and re-push.
- Check `gh api "/repos/$OWNER_REPO/pages/builds/latest"` — what's the latest build status and timestamp?

### Symptom: `gh api -X POST .../pages` returns 422 "Bad Request"

**Cause:** Usually one of:
- Repo is private and account is on free GitHub plan
- A `gh-pages` branch already exists and is being used (conflict with `main` config)
- The source body format is slightly wrong for this `gh` version

**Fix:** Try the alternative JSON body format:
```bash
gh api -X POST "/repos/$OWNER_REPO/pages" \
  --input - <<'EOF'
{
  "source": { "branch": "main", "path": "/" }
}
EOF
```

If 422 persists and the message mentions "private repository":
```bash
gh repo edit --visibility public --accept-visibility-change-consequences
# then retry the POST
```

### Symptom: Game loads but service worker traps users on old version

**Cause:** A misconfigured service worker is now permanently cached on Stephen's phone.

**Fix:** Either disable the SW for now (comment out the `register` call, push), or ship a "kill switch" SW that calls `self.registration.unregister()` on activate. Stephen does NOT need to clear his cache manually — that should never be the answer.

### Symptom: PHP file (Stripe checkout, etc.) doesn't execute

**Cause:** **GitHub Pages does not run PHP.** Period. There is no fix on the Pages side.

**Workaround:** Move the PHP endpoint to a serverless function. Recommended path: Cloudflare Workers or Vercel Functions — both deployable from `gh` CLI with no panel work. If the other project's v1 doesn't have monetization yet, just don't ship the PHP for now and tell Stephen this needs addressed when monetization lands.

### Symptom: gh auth doesn't have pages scope

**Cause:** Old auth that didn't request the scope.

**Fix:** `gh auth refresh -s repo,pages` — this re-auths with the additional scope. Stephen will need to confirm in a browser ONE time (this is the only time he clicks anything in this whole plan). If you want to skip even that one click, use a PAT (personal access token) created via API — but that's more setup than it saves.

---

## VERIFICATION CHECKLIST — "DONE" MEANS ALL GREEN

- [ ] `gh repo view` confirms repo + default branch
- [ ] `gh api "/repos/$OWNER_REPO/pages"` returns a built status (not 404)
- [ ] No absolute paths left: all three greps in Step 3 return empty
- [ ] `LB_VERSION` (or equivalent) constant exists at top of index.html and is bumped
- [ ] Smoke harness passes (if present)
- [ ] Latest commit is pushed to `main`
- [ ] Curl of the Pages URL returns HTTP 200
- [ ] Curl of a known asset under the Pages URL returns HTTP 200
- [ ] `<title>` in served HTML matches the repo's `index.html`
- [ ] Stephen has been told: live URL + commit hash

If any box won't tick green, debug from the Troubleshooting section above. **Do not tell Stephen "done" until all boxes are green.**

---

## RULES OF ENGAGEMENT FOR THE OTHER CLAUDE

Stephen has been burned all day. Follow these:

1. **Tell Stephen the commit hash AND the live URL after every push.** Both. Every time.
2. **Do not promise timelines.** Say "I'll ship it" not "I'll ship it in X minutes".
3. **Do not refactor while you're in there.** Touch only what Stephen asked you to touch.
4. **When something doesn't work, trace it.** Webhook? Build status? File on server? Cached? Stop GUESSING and start CURLING. The Troubleshooting section is your runbook.
5. **Never ask Stephen to do something a CLI can do.** Re-read this doc — every step is a command, not a panel click. If you find yourself typing "Stephen, please log in to..." STOP and find the CLI equivalent.
6. **Do not edit this handoff doc** unless Stephen tells you to. If something here is wrong, tell Stephen — he'll update the Lucid Winds copy.
7. **One change at a time.** Don't bundle "fix path + add feature + refactor". One PR, one purpose.

---

## APPENDIX — IF STEPHEN LATER WANTS THE PRETTY URL

The github.io URL is ugly. If Stephen ever wants `barbrawl.lucidwinds.com` instead, the path is:

1. AI: in the repo, create a file named `CNAME` at root containing exactly `barbrawl.lucidwinds.com` (no protocol, no path, no newline ideally).
2. Stephen: in Hostinger DNS, add a CNAME record: `barbrawl` → `stephenuffugus.github.io`. (One panel click.)
3. AI: in GitHub repo settings (or via `gh api`), the CNAME file is automatically detected.
4. Wait ~10 min for DNS + cert provisioning. GitHub provisions HTTPS automatically for custom domains.

That's the ONLY time Stephen would need to touch any panel for this project. He can defer it forever — the github.io URL works fine for testing.

---

*End of handoff. If the AI follows this doc verbatim, Stephen's other game ships in 5 minutes flat without Stephen touching anything. If the AI deviates and starts asking Stephen to "log in to..." or "click on..." anywhere except possibly a one-time `gh auth refresh` browser confirm, the AI has failed the handoff.*
