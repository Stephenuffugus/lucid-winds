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

Then tell me the database URL from step 1 and I wire
`party/shell/firebase-config.js`, finish the CloudTransport adapter in
`party/shell/transport.js` (the interface is already in place), and add a
TTL cleanup so codes recycle.

## What stays server side later
Sunbeam minting for party games goes through a Cloud Function
(`partyComplete`) consistent with the existing economy: clients never
write balances, every participant gets minted, caps enforced server side.
That function ships with the transport flip; until then party games are
just fun, which is also fine.
