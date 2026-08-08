# Party cloud rooms: the one time switch on (Stephen, ~5 minutes)

The party shell (`party/`) runs today on a LOCAL practice transport:
host tab plus phone tabs in the same browser, good for testing every game
end to end. Real rooms (phones on the couch joining the TV) need three
console actions that only the project owner can do. Nothing in code is
waiting; the moment these are done we flip the transport and it is live.

## 1. Enable Realtime Database
Firebase Console -> project `focus-grove-fffa8` -> Build -> Realtime
Database -> Create database -> us-central1 -> locked mode. Copy the
database URL it shows (looks like `https://focus-grove-fffa8-default-rtdb.firebaseio.com`).

## 2. Enable anonymous auth
Firebase Console -> Authentication -> Sign-in method -> Anonymous -> Enable.
Guests join with no account; anonymous auth is what lets rules say
"only signed in players can write" without making anyone register.

## 3. Paste these Realtime Database rules
Realtime Database -> Rules tab -> replace with:

```json
{
  "rules": {
    "party": {
      "$code": {
        ".read": "auth != null",
        ".write": "auth != null",
        "msgs": {
          "$msg": {
            ".validate": "newData.child('t').isString() && newData.child('from').isString()"
          }
        },
        "meta": {
          ".validate": "newData.hasChildren(['game','created'])"
        }
      }
    }
  }
}
```

## 4. Nothing else. It is already built.

Since this document was written, all of the code side is done and waiting:

- `party/shell/firebase-config.js` exists with the project config and the SDK
  list. ⚖ The one line to check is `databaseURL`: it is the default shape for a
  us-central1 database on this project, but no database existed to confirm it
  against. If the console shows a different URL in step 1, change that line and
  nothing else.
- `party/shell/transport.js` has the complete CloudTransport: anonymous sign in,
  push based messaging, and no history replay (a phone joining a room that has
  been running ten minutes must not receive ten minutes of timer ticks in one
  burst, so it anchors on the last existing key and listens forward).
- A room that cannot connect SAYS SO on screen and points back at this file,
  rather than looking like a room nobody has joined.
- `functions/partyComplete.js` mints sunbeams for every participant. Each
  player's own phone claims for itself: the host screen is just another browser,
  so it reports PLACE and the server decides the AMOUNT. Deploy it with
  `firebase deploy --only functions`.

⚖ **The amounts are yours to set** and are a proposal, not an approved economy:
12 sunbeams for playing, plus 6/4/2 for the top three, capped at 60 a day across
all party titles. They are in one block at the top of `partyComplete.js`.

## 5. Turning it on

Add `?cloud=1` to the host address. The TV then shows a join address that
already carries the flag, so phones just type the code:

    lucidwinds.com/party/host.html?cloud=1

Without the flag everything stays on the local practice transport, so a practice
night still needs no network at all.

⚠ **The cloud path has never run against a real database, because there is not
one yet.** Treat the first real room as the test. The local practice path is
gated on every commit and is unaffected by any of this.

## What stays server side later
Sunbeam minting for party games goes through a Cloud Function
(`partyComplete`) consistent with the existing economy: clients never
write balances, every participant gets minted, caps enforced server side.
That function ships with the transport flip; until then party games are
just fun, which is also fine.
