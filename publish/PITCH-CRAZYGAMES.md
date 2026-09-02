# CrazyGames — what they require, which three to send, and the text to send

> Written 2026-09-02. Every requirement below was read from CrazyGames' own developer
> documentation on that date, and the page it came from is cited beside it.
> Nothing here has been sent. This is the folder Stephen pastes from when he decides to.

## Their requirements, as of 2026-09-02

**Read on 2026-09-02:**
- https://docs.crazygames.com/requirements/intro/
- https://docs.crazygames.com/requirements/technical/
- https://docs.crazygames.com/requirements/quality/
- https://docs.crazygames.com/faq/
- Submissions go through https://developer.crazygames.com/games

### Two tiers, and only one of them pays

- **Basic Launch** takes the game without their SDK, and pays nothing. Initial download
  50 MB or under, total 250 MB or under, 1500 files or fewer, basic visual QA, PEGI 12.
- **Full Launch** requires their SDK, the `gameplayStart` event, ads served only through
  that SDK, account linking, and a deeper QA pass. This is the tier that earns.

### Technical, quoted

- Initial download **50 MB or under**, and **20 MB or under to be eligible for the mobile
  home page**. Total 250 MB, 1500 files.
- **"Never use absolute paths."** File paths must be relative.
- Externally hosted files are judged on **time to gameplay of 20 seconds or under**.
- Chrome and Edge required. Must run smoothly on a **4 GB Chromebook**.
- Mobile needs the `user-select: none` block so a long press does not select the page.
- Text and images must be legible at `devicePixelRatio: 1`, in a 16 by 9 responsive
  iframe, and on a phone.

### Terms

- **Not exclusive.** The FAQ is explicit: *"You can publish on CrazyGames even if your
  game is already live or has been previously published on mobile, Steam, or other
  platforms, as long as you hold the distribution rights."*
- Revenue share is a share of ad revenue, percentage not published. Payment is monthly
  once the balance passes **100 euro**, by wire or PayPal, and rolls over below that.
- Updates to a live game are usually processed the same working day.

### What this means for our ZIPs

⛔ **The twenty ZIPs in `publish/dist/` cannot be sent to CrazyGames.** Each one carries
either the GameDistribution or the GameMonetize SDK, and a rival network's ad SDK inside
a CrazyGames build is a third party ad system. A CrazyGames build is a third target in
`scripts/pub_build.py`: same strip, same hooks, their SDK and their `gameplayStart`
event instead. The pipeline is one target away, not a rewrite. Everything else already
complies: our games are relative-path, self contained, under 11 MB, and land on a play
button rather than a splash screen.

## The three to send, and why

CrazyGames sells depth and session length. Their front page is survivors runs, tower
defence, driving and shooters, and their QA rewards a game that a player is still in
twenty minutes later. Pick for that, not for the smallest file.

**1. Garden Guard** *(`garden-td`, 1.72 MB, tower defence)*
Nine towers, a wave ladder, three difficulties. Tower defence is a CrazyGames staple and
it is the longest session in our ten, which is the metric their front page is built
around. It reads well on a desktop screen, which is where most of their traffic is.

**2. Nova Bloom** *(`nova-bloom`, 2.49 MB, twin stick shooter)*
Keyboard and mouse native, a run that escalates, four modes including a three minute
daily. Their action shelf is the busiest one they have.

**3. Bloom Breaker** *(`bloom-breaker`, 0.23 MB, brick breaker)*
Sixty hand built levels, twenty four powerups and a boss, and it loads in a fraction of a
second on a school Chromebook, which is a real CrazyGames requirement: they ask that a
game run smoothly on 4 GB of RAM.

Held back on purpose: Petal Slice, Berry Vine and Stop the Light are the three most one
finger, most language free games in the ten, which is exactly Poki's taste. See
`PITCH-POKI.md`.

## The submission text, in Stephen's voice

Paste into the CrazyGames developer portal contact form, or into an email if a person
answers. No dashes anywhere in this text, by house rule.

---

Hello,

I am Stephen, and I build browser games solo as Sky Wolf Studio. There are a bit over
160 of them now, all free to play, all HTML5, and I would like to bring the strongest
three to CrazyGames.

The three I have in mind are Garden Guard, a cozy tower defence with nine botanical
towers and a wave ladder, Nova Bloom, a twin stick starfield where every enemy you clear
plants a flower that charges your bomb, and Bloom Breaker, a brick breaker with sixty
hand built levels, twenty four powerups and a boss. All three are self contained, they
hold a steady frame rate on a cheap laptop, and they land straight in play with no splash
screen and no login.

Each one is already built as a clean standalone package with relative paths and no
external calls, so integrating your SDK and the gameplayStart event is a small piece of
work rather than a port. I can have any of the three ready with your SDK inside a day of
hearing that you want it, and I am happy to start with one and go from there.

They are live now if you want to play them before you answer, at lucidwinds.com, and I
hold all the rights.

Thank you for reading,

Stephen Furpahs
Sky Wolf Studio
lucidwinds.com

---

## What Stephen actually has to do

1. Create the developer account at https://developer.crazygames.com and complete the
   profile, the same fifteen minutes as the other two networks.
2. Paste the text above into their submission form.
3. When they answer, tell Fable which title they want, and a CrazyGames target gets added
   to the builder and the ZIP comes back the same day.
