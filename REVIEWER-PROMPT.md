# Paste this to start the reviewer

Copy everything between the lines. Attach or point them at
`CROSSCHECK-PLAY-AUG22.md`.

---

You are reviewing another model's work before I act on it. I do not want a
second opinion that agrees with the first one. I want you to try to find where
it is wrong.

Context: I run Sky Wolf Studio. I have a Google Play **organization** account
with a D-U-N-S number, approved and ready to publish. I have about 182 free
browser games and a handful of apps at lucidwinds.com. Jumping Jimothy goes to
Steam at $2.99 around Sep 15. I have not made a single move yet.

The other model wrote `CROSSCHECK-PLAY-AUG22.md` in this repo. Read it first. It
recommends: do not set up a merchant account, delay Jimothy to November, list
Bandit's Box first in Entertainment, Hush second, and keep the Stripe tip jar out
of any Play app entirely.

**Start with evidence, not with its argument.** Run these before you form a view:

    node scripts/twa_ready.mjs bandits-box
    node scripts/twa_ready.mjs siege
    node scripts/twa_ready.mjs --all
    node scripts/_twa_boundary_check.mjs
    node scripts/_offline_check.mjs bandits-box
    grep -ril stripe --include=*.js --include=*.html . | grep -v node_modules | wc -l

(the offline and boundary checks need a static server on the repo root at
port 8777: `python3 -m http.server 8777 --bind 127.0.0.1`)

**The second one must FAIL.** If `twa_ready.mjs` passes everything you hand it,
it is decoration and the whole readiness claim is worthless. Say so.

Then answer these, and answer them **even if you agree**, saying what would
change your mind:

1. Is delaying Jimothy to November right, or is that trading three months of
   certain exposure for a speculative Steam review risk?
2. Should Hush be the first listing instead of Bandit's Box?
3. Is the `inTWA` detection in `satellites/bandits-box/index.html` sound, and
   does it fail closed? It is a policy boundary implemented as a runtime
   condition. If it is wrong, an out of Play payment flow becomes reachable from
   inside a Play app.
4. Is free to paid genuinely a one way door on Google Play?
5. Once granted, is Play production access account level or per app?

**Then break the frame.** That document sets the questions, which biases you
toward its own view of the problem. What did it not consider at all? Is the
premise wrong? Is there a better first move than any of the ten candidates it
looked at?

Section 6 of the document is its own error log from the last two days, including
telling me to go live on a payment rail I had abandoned, and a tool that produced
three false claims on its first run. Read it. The pattern it admits to is that
**nothing fails loudly** and it makes confident claims about things it did not
check. Look for more of that.

Be blunt. If the recommendation is wrong, say it is wrong and say what to do
instead. If it is right, say which parts you actually verified versus which parts
you are taking on trust.
