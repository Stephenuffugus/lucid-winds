# WORKSPACE
### One codespace. Everything in it. Nothing living on one machine.

Start here on a fresh morning.

```bash
./workspace.sh          # what is here, what is dirty, what is unpushed
./workspace.sh pull     # clone anything missing, fetch everything else
./workspace.sh save     # commit and push EVERYTHING, everywhere
```

On a brand new codespace the first two run **automatically** from
`.devcontainer/`, and `./workspace.sh` runs again on every restart so the first
thing you see is whether anything is at risk.

---

## What "everything" is

| Where | What | Cloned by default |
|---|---|---|
| `/workspaces/lucid-winds` | This repo. The flagship app, the portal, the Cloud Functions, all design docs. | yes |
| `/workspaces/abduct_a_chameleon` | The 3D chameleon game. | yes |
| `~/.claude/projects/-workspaces-lucid-winds/memory` | The memory directory, backed by the private `sws-memory` repo. | yes |
| `/workspaces/<game>` | The back catalogue: 18 satellite games. | only with `pull --all` |

---

## Why the games are cloned beside this repo and not copied into it

Because copying them in is a known, already-shipped bug.

A satellite vendored into `lucid-winds/satellites/<game>/` goes stale the
instant the game is pushed again, and a per-satellite service worker then pins
players to the dead build past a history clear. That happened once already and
cost a debugging round. The portal iframes the **live** GitHub Pages URL for
exactly this reason.

So "one codespace with everything in it" is the goal, and it is achieved by
checking every repo out side by side. It is not achieved by merging them into
one repository.

---

## The failure this is built to prevent

A codespace can be reclaimed at any time, without warning. When that happens
you lose, permanently:

- uncommitted changes
- untracked files
- **branches that have no remote**
- **stashes** (nothing pushes a stash, ever)

The last two are the dangerous ones because `git status` looks clean and
everything feels fine. On 2026-08-02 this workspace had two branches in
`abduct_a_chameleon` — `salvage`, which held all the current 3D work, and
`wip/3d-ambient-and-decal-light` — that existed **only on that machine**. Both
are now on GitHub.

`./workspace.sh` calls all four of these out in red. `./workspace.sh save`
fixes the first three, including adopting any branch that has no remote.

---

## Rules the script follows

- **It never discards local work.** `pull` runs `git fetch`, never `git pull`
  and never `git reset`. Merging is your decision, not a script's.
- **A branch with no remote is an emergency**, and `save` pushes it with `-u`.
- **Memory is restored automatically** if the directory is missing. It is a
  private repo, so if that step fails it is an auth problem, not a bug.
- **Stashes are reported and never touched.** Nothing can push a stash. If you
  see a stash warning, unstash it and commit it.

---

## If something looks missing tomorrow

1. `./workspace.sh` first. It tells you the truth about every repo.
2. `./workspace.sh pull` to bring back anything absent.
3. `./workspace.sh pull --all` if you need the back catalogue too.
4. If memory is missing and will not restore, it is `Stephenuffugus/sws-memory`
   and it is private. Everything else is public.

Nothing in this workspace should ever exist in only one place. If you find
something that does, that is a bug in this script, and it is worth fixing
immediately rather than working around.
