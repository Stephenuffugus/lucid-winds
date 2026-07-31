# Naming the Steam app credit — the click-by-click

You paid the $100 Steam Direct fee on Jul 30. That fee bought **one app credit**,
which is the thing you spend to create an App ID. Naming it is the whole task and
it takes about two minutes. Nothing here costs more money.

⛔ It has to be **you**, signed in as the Steam account that paid. There is no way
for me to do this part.

---

## Before you start

Have the Steam Guard code handy (phone app or email) — Steamworks will ask for it
even if regular Steam did not.

Go to **https://partner.steamgames.com** and sign in. If it dumps you on a generic
Steam page instead of the partner site, sign out fully and go back to that URL.

---

## The five clicks

1. **Land on the dashboard.** After sign-in you should see your partner homepage.
   The section you want is the one listing your applications — it is usually
   headed something like *"Your Steamworks Applications"* or *"All Applications"*.
   On a brand new account that list is empty, which is correct.

2. **Find the unused credit.** Somewhere on that page is a line telling you that
   you have an app credit available, with a link next to it along the lines of
   *"Create a new app"* / *"click here to set up your app"*. That link is the one.
   It only appears once the fee has cleared — if you genuinely cannot see it
   anywhere, that is the thing to tell me, because it means the fee has not
   settled and it is a support question, not a naming question.

3. **Type the name.** Enter exactly:

   ```
   Jumping Jimothy
   ```

   This is the store name. It is editable later, so do not agonise over it — but
   the **App ID it creates is permanent**, so only spend the credit when you mean
   to. There is only one credit; spending it on a test app costs another $100.

4. **Accept the terms** it puts in front of you and confirm. Steam creates the app
   and drops you on its **App Admin** page.

5. **Copy the App ID.** It is the number shown at the top of that page next to the
   app name, and it is also in the browser address bar, like
   `partner.steamgames.com/apps/landing/**1234567**`. That number is what I need.

**Send me that number and I am unblocked.** The depot ID, the SteamPipe config
and the upload all derive from it, and the upload script is already written and
waiting.

---

## What to expect right after

Creating the app does **not** publish anything. Nothing is public until you
explicitly submit the store page and later press Release. You will land on a
checklist with a lot of red X marks — that is normal and it is the correct
starting state.

Two things worth doing in the same sitting, because they run on their own clocks
and both must finish before you can take money:

- **Payment / tax details** under the app's or your account's financial section.
  The tax interview plus bank verification takes **2 to 7 business days**, so
  starting it today costs you nothing and starting it in three weeks could cost
  you the launch date.
- Leave the store page alone for now. I have every field written and paste-ready
  in `marketing/steam-jimothy.md`; we fill it once the art is in hand so you are
  not editing it twice.

---

## If you get stuck

The two things that actually go wrong here:

- **No "create new app" link anywhere.** The fee has not cleared to your account
  yet. Valve support is the only fix; it is not something we can code around.
- **It asks you to pay $100 again.** Stop. That means Steam thinks you have no
  credit — do not pay twice. Screenshot it and we will sort it out.

Anything else, screenshot the page and send it to me. I would rather read the
actual screen than guess at the wording, because Valve changes this UI.

---

## Where this sits in the schedule

| | |
|---|---|
| Fee paid | Jul 30 |
| Earliest possible release (30-day rule) | **Aug 29** |
| Coming Soon page must be public for | 14 days before release |
| Target release | **Tue Sep 1** |

The 14-day Coming Soon clock starts when Valve **approves** the store page, not
when we write it. That is why the store page going up early matters more than it
being perfect — it can be edited after approval, and every extra day it is live is
another day of wishlists.

Full detail in `STEAM_SUBMIT.md` next to this file.
