# Shutterbug: the fleet handoff (DRAFT)

This is a draft started at T1.13 (BUILD-PLAN.md section 1.6). It holds what the M1 code already does. T3.8 completes it in the NEW_SATELLITE_BRIEF shape: the live URL, the file manifest, the hook line and paragraph, and how to add fixtures.

## The earn moments (the Wallet)

`window.Wallet` lives in the page's shell-save block. Its methods are `earn(n, reason)`, `spend(n, reason)`, `moment(name, detail)` and `balance()`, all for Dead Pixels.

A first time moment goes to the host only when Shutterbug runs inside a frame (the portal):

```
parent.postMessage({ sws: 'earn', moment: '<name>', detail: { ... } }, '*')
```

- The message never carries an amount. The host prices the moments.
- A moment is marked in the save (`shutterbug.v1`, key `moments`) only when it is announced. A moment that happens outside a frame (the bare URL, the installed app) is not announced and not marked, so the first framed one still reaches the host (QUESTIONS Q85).

| Moment | When | Detail | Per session | Ever |
| --- | --- | --- | --- | --- |
| `first_clear` | the first room cleared in a framed session (any mode) | `{ mode: 'free' }` or `{ mode: 'code' }` | at most 1 | 1 a save |
| `first_share` | the first copied link or code, or a native share that went through, in a framed session | `{ via: 'link' }`, `{ via: 'code' }` or `{ via: 'native' }` | at most 1 | 1 a save |
| `house_clear` | a five room house run cleared (M2, T2.8) | not wired yet | at most 1 | 1 a save |
| `daily_done` | the Daily Room cleared (M3, T3.1b) | not wired yet | at most 1 | 1 a save |
| `boss_kill` | the first boss beaten (M2) | not wired yet | at most 1 | 1 a save |

Dead Pixels are banked in the save at a room's clear: the room's count times 0.5 in free play and Level code, floored (DESIGN 8). They are never sent to the host.

## The nav map: every back and X

Every back and X is an internal screen switch. Its handler hides every card and sheet it can sit over. No control navigates, calls `history.back()` or reloads.

| From | Control | To |
| --- | --- | --- |
| Title | All Sky Wolf games | `SWS_EXIT()`, the game's only exit (`{sws:'close'}` when framed) |
| Title | Photograph a room, Choose a photo | the phone's picker, then the crop |
| Title | Try the sample room | the room |
| Title | Level code, Play | the Tap to develop card, then the room |
| Title | a Recent room | the room |
| Title | Settings | Settings |
| Settings | Title | the title |
| Crop | Title | the title |
| Crop | Retake | the picker again |
| Crop | Develop | the reveal, then the room |
| Room | Title (the strip) | the title, every card and sheet hidden |
| Room | Share (the strip) | the share sheet; its Close returns to the room |
| Clear card | Shoot the next room | the title under the camera's picker |
| Clear card | Share this room | the share sheet; its Close returns to the clear card |
| Clear card | Play it again | the room from its start |
| Clear card | Title | the title |
| Death card | Again | the room from its start, the reveal skipped |
| Death card | Title | the title |
| Death card | Share (the strip) | the share sheet; its Close returns to the death card |

The fleet's feedback fab: Shutterbug never loads `/feedback.js`. If a host injects it, `body.sb-modal .lwfb-fab { display: none }` hides it while any card, sheet or the Tap to develop card is up.

## Storage

One localStorage key: `shutterbug.v1` (BUILD-PLAN.md section 2.4). The service worker caches only under `shutterbug-` names and only deletes those.
