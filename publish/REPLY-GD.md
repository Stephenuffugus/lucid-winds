# Reply to GameDistribution — ready to paste

**To:** Sabina Sturzova, s.sturzova@azerion.com
**Thread:** "Re: Non-exclusive HTML5 games for syndication" (her intake mail, 2026-08-03)
**Send after:** the developer account at gamedistribution.com exists and the payment
details are filled in. Nothing else has to happen first.

⚠️ **One small thing to keep consistent.** The July mails were signed "Sky Wolf Studios".
The studio name is **Sky Wolf Studio**, singular. The text below uses the singular, and
the developer account should be created under the singular too, so the account, the
games and the signature all agree.

No dashes anywhere in the text, by house rule. Commas only.

---

Hi Sabina,

Thank you for laying the steps out so clearly, and sorry for the slow reply. I wanted to
have everything ready before I came back to you rather than send you a promise.

Where things stand. The developer account is set up and the payment details are in. I
have gone through the quality guidelines, and I have built ten of my strongest titles
into clean standalone packages with your SDK integrated straight from the GD HTML5 wiki,
window.GD_OPTIONS with the game id and the onEvent handler, a preroll on load and a
midroll that fires on the win or game over screen and never on start up. Each build is
throttled to one break every three minutes so a short game cannot stack them.

Every package is self contained. No external calls, no links out to my own site, no
service worker, no font or library fetched from anywhere. I unzipped each one, served it
on a bare origin and played a round through to the end screen on a 375 by 667 phone
before I called it done, so the version you review is the version I actually played.

Marketing assets are ready at all five of your sizes, the mandatory 512x384, 512x512 and
200x120 and the optional 1280x720 and 1280x550, painted from each game's own art.

The ten are Bloom Breaker, a brick breaker with sixty levels and a boss, Berry Vine, a
bubble shooter, Petal Slice, a swipe to slice arcade game, Dew Snip, a physics puzzle,
Picnic Panic, an arcade shooter, Bubblenaut, a bubble platformer, Stop the Light, a one
tap press your luck game, Nova Bloom, a twin stick shooter, Garden Guard, a tower
defence, and Pong Arena, twelve levels of every pong there ever was. Sizes run from 26 KB
to 6 MB. Jumping Jimothy is ready too, my raccoon hopper, trimmed to 54 MB for upload.

I am creating the first game entry now and will rebuild that package with its real game
id before I upload, since the placeholder build serves no ads. If you would rather I
start with one title and add the rest once it clears QA, say the word and I will do that
instead. Otherwise there is nothing I need from you, and I will get out of your way and
let the review process work.

Thank you again,

Stephen Furpahs
Sky Wolf Studio
lucidwinds.com

---

## After sending

The moment a game entry exists and has an id, paste the id to Fable. The rebuild is one
command per network and takes under a minute:

```
python3 scripts/pub_build.py satellites/bloom-breaker --target gd --game-id <THE REAL ID>
node publish/tools/pub_verify.mjs publish/dist/bloom-breaker-gd.zip
```

⛔ Upload the rebuilt ZIP, never the placeholder one in `publish/dist/` today. The
placeholder loads and plays perfectly and serves no ads, which is the worst of both.
