# Shutterbug: the Reddit feedback post (draft, 13 Nov 2026)

Stephen's idea: before the Play release, ask Reddit what would make people come back. He posts it; nothing
here is posted by Claude.

## The post

**Title (pick one)**
1. I made a game where a photo of your room becomes the level. What would make you come back to it?
2. Take a photo of your room, then climb it. Looking for honest feedback on what's missing.
3. My game turns your room into a platformer level. It's fun once. Help me make it fun twice.

**Body**

Shutterbug turns a photo of any room into a pixel platformer level. You photograph your desk, your kitchen,
your friend's messy bedroom, and then you climb it: the shapes in the photo become the ledges, there are bugs
to catch, a guardian to beat, and every room you finish goes into an album.

It runs in the browser, free, no account: https://lucidwinds.com/satellites/shutterbug/
The photo never leaves your phone. The level is built on the device and the picture is thrown away.

I'm one person and I'm about to put it on Google Play. Before I do, I want to know what would bring you back
after the first few rooms. Three honest questions:

1. After your first room, did you want to photograph a second one? If not, what stopped you?
2. What would you come back tomorrow for: a daily photo prompt everyone shoots, beating a friend's run on the
   same room, a weekly house with its own guardian and keepsake, medals on every room, a daily streak,
   something else?
3. What confused you or felt unfair in the first two minutes?

Blunt answers are the useful ones. Thank you for playing.

## Where to post it (read each sub's rules first; they change)
- **r/playmygame**: made for exactly this. Needs a playable link and the right flair.
- **r/WebGames**: browser games with no sign up. Link straight to the game.
- **r/AndroidGaming**: once it is on Play; developer posts have their own rules and days.
- **r/DestroyMyGame**: the harshest feedback; wants a short video, not a link.
- Not r/pixelart and not r/gamedev's main feed: the first is for hand made art only, the second removes
  promotion.
One sub a day, not all at once: Reddit treats the same link posted everywhere as spam, and each thread
deserves answers from him while it is alive.

## About AI, plainly
- **What a player can see today:** nothing in the game, its privacy page or its manifest says AI. The live
  Shutterbug folder serves only the game's own files (its internal notes answer 404). The word "Astra" appears
  only in code comments inside the page source.
- **What a curious Redditor can find in two clicks:** the GitHub repository is public. It holds CLAUDE.md, the
  handoff notes, and a "Co-Authored-By: Claude" line on nearly every commit. lucidwinds.com also serves
  CLAUDE.md and START-HERE.md from its root. Stripping the game does nothing while those are open.
- **What closes that:** the web root repair already planned (R7), making the repository private (a GitHub
  setting; Hostinger then needs a deploy key), and, if he wants, no co-author line on future commits.
- **Advice:** leave AI out of the post; that is his right, and nobody lists their tools. Do not claim it is
  hand drawn or made without AI, and if someone asks directly, answer straight ("I use AI tools in my
  pipeline; the design, the direction and every decision are mine"). Several game subs remove posts that hide
  it once someone finds out, and a thread that turns into that argument costs more than the feedback is worth.

Question 2 lists the five ideas already on the studio checklist (the open retention pick), so every answer
maps to something that is designed and waiting.

## What to do with the answers
Count them, do not argue with them. Three people naming the same missing thing is a build item. The open
retention pick (docs/STUDIO-CHECKLIST.md) waits on this.
