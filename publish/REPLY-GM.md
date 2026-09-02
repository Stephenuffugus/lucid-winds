# Reply to GameMonetize — ready to paste

**To:** Marian, mentolatux@gamemonetize.com
**Thread:** "Re: Non-exclusive HTML5 games for your network" (his reply, 2026-07-29)
**Send after:** the developer account at gamemonetize.com exists.

⚠️ Same note as the GameDistribution reply: the studio is **Sky Wolf Studio**, singular.

⭐ **Marian asked for one game first, and his mail ends with a line worth taking
seriously: "we are looking for high-quality games, not simple ones."** So the one game we
lead with should not be the smallest or the most elegant, it should be the one that looks
like the most game. That is **Bloom Breaker**: sixty hand built levels, twenty four
powerups, a boss, a shop, and it still loads in 43 KB. **Garden Guard**, the tower
defence, is the alternative if they come back wanting more depth.

No dashes anywhere in the text, by house rule.

---

Hi Marian,

Thank you for the clear steps, and sorry for the long gap. I wanted the game finished and
tested before I came back rather than send you something half ready.

The developer account is set up. Taking your advice, I am submitting one game first.

It is Bloom Breaker, a botanical brick breaker with sixty hand built levels, twenty four
powerups, a boss fight and a shop, and it loads in well under a second. Your SDK is
integrated exactly as your repository documents it, window.SDK_OPTIONS with the game id
and the onEvent handler for SDK_GAME_PAUSE, SDK_GAME_START and SDK_READY, with the
preroll on load and the ad break placed on the game over screen, never on start up, and
throttled to one break every three minutes.

The package is fully self contained. No external calls, nothing loaded from my own
server, no service worker, no fonts or libraries fetched from anywhere. I unzipped it,
served it from a bare folder and played a round through to the game over screen on a 375
by 667 phone before calling it finished, so what you review is what I played.

If it clears your review I have nine more of the same standard ready to follow, a bubble
shooter, a swipe to slice arcade game, a physics puzzle, an arcade shooter, a bubble
platformer, a one tap press your luck game, a twin stick shooter, a tower defence and a
pong arena, each one built and tested the same way.

I am creating the game entry now and will rebuild the package with its real game id
before I upload, since a placeholder id serves no ads. Nothing needed from you beyond the
review, and thank you for taking the time on it.

Stephen Furpahs
Sky Wolf Studio
lucidwinds.com

---

## After sending

```
python3 scripts/pub_build.py satellites/bloom-breaker --target gm --game-id <THE REAL ID>
node publish/tools/pub_verify.mjs publish/dist/bloom-breaker-gm.zip
```

Marian's mail also offers WeTransfer or FastUpload if the panel upload gives trouble. The
ZIP is 43 KB, so it will not.
