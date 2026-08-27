# PUB-SEO-AUDIT, lucidwinds.com measured 27 August 2026

**Read this first.** Four things on this page are worth more than every meta tag in it.

0. ⛔⛔ **There is a live, enormous, decaying demand curve for the word "jimothy", and six
   other people are already on it.** Jimothy is a **real Seattle raccoon** who went viral in
   July 2026 and now has a Wikipedia article, City Council recognition and a Guild Wars 2
   NPC. Another developer built a four level Jimothy browser game in about twelve hours and got
   press for it (KNKX confirmed, GameSpot and GeekWire unverified, see §11.1). Sky Wolf Studio has by far the deepest Jimothy game
   and does not appear anywhere in any search. **Resubmitting the Steam store page is worth
   more than everything else in this document combined.** Full evidence in §11.1.
0b. ⛔ **The page title aims at a phrase nobody types.** Google autocomplete has no demand for
   "jumping jimothy". It has plenty for `jimothy game` and `jimothy raccoon game`. §11.1(a).
1. ⛔ **Flock the World is behind the workbench gate right now.** A stranger opening
   `https://lucidwinds.com/satellites/flock-the-world/` sees a locked panel that says
   IN DEVELOPMENT and asks for a tester key. Screenshotted live today, see §0. Every
   SEO fix, every Reddit post and every Pi submission for FTW is blocked behind lifting
   that gate. It is one line in the head of `index.html`.
2. ⛔ **Flock the World is not in `sitemap.xml`.** Neither are 29 other satellites,
   including every game built since roughly the start of August, nor **any of the 68
   `/play/` card and puzzle shells**, which per §11.3 sit in the highest demand keyword lane
   the studio owns. The sitemap has 88 URLs; the site has 139 indexable HTML pages plus those
   68 shells.
3. ⛔ **`www.lucidwinds.com` serves the entire site again, byte identical, with no redirect
   and no canonical.** §10.1. One server rule fixes it.

A note on how to read this. §1 to §9 were measured from the repo and from Lighthouse. §10 to
§12 came from crawling the live site and from live keyword research, and where the two
disagree the live one wins. **§4 is an example: I nearly reported the repo's `robots.txt` as
fact and the server is not serving it.** §13 is the revised order of work with everything
folded in; if you only read one section, read that one.

Everything below was measured, not remembered. The scan script is reproduced in §8 so
you can re run it yourself and disagree with me with a number.

---

## 0. What I actually looked at

I fetched the live pages in a real headless Chrome at a phone viewport (412x915) and
opened the screenshots. Reporting what I saw, not what the tags say.

| Page | What renders | Verdict |
|---|---|---|
| `/satellites/flock-the-world/` | The IN DEVELOPMENT gate, a tester key box, and an Unlock button. The game copy is in the DOM underneath, so a crawler can read it, but a person cannot play it. | ⛔ blocked |
| `/satellites/stream-hop/` | Paints correctly: the ink wash raccoon between the Space Needle and Rainier, "Jumping Jimothy", "TAP TO START". Looks good. | ✅ renders |
| `/jimothy/` | Same thing. It is a client side redirect, not an HTTP one, see §3.1. | ⚠️ see §3.1 |

The gated satellites are: `burrow-bowl`, `dragon-philosophy`, `flock-the-world`,
`impossible-garden`, `moon-claw`, `puppy-dash`, `skyshot`, `twin-lanterns`. The gate is
`/dev-gate.js`, included in the head of each. Removing that one `<script>` line opens a
game to the public.

---

## 1. Lighthouse, live, today

Run with Lighthouse 13.4.1 against the live site, mobile emulation, three categories.

| Page | SEO | Performance | Accessibility | LCP | TBT | Weight |
|---|---|---|---|---|---|---|
| `https://lucidwinds.com/` | **100** | **26** | 92 | 24.5 s | 4,180 ms | 5,493 KiB |
| `https://lucidwinds.com/portal/` | **100** | 54 | 95 | 7.1 s | 600 ms | 668 KiB |
| `https://lucidwinds.com/satellites/flock-the-world/` | **92** | 82 | 87 | 4.3 s | 0 ms | 623 KiB |
| `https://lucidwinds.com/jimothy/` | could not score | | | | | |
| `https://lucidwinds.com/satellites/stream-hop/` | could not score | | | | | |

Notes, so you can trust the numbers:

- **The two that "could not score" are not broken.** Lighthouse returned `NO_FCP`, meaning
  it gave up waiting for a first contentful paint. When I loaded the same URL in the same
  Chrome and took a picture, it painted fine. I am reporting a Lighthouse failure, not a
  broken page. It is still a signal worth noting: that page is a single 413 KB HTML file
  and it works the renderer hard enough that an automated renderer with a budget can time
  out on it. Googlebot renders with a budget too.
- **FTW's only SEO deduction is the missing meta description.** Everything else passes.
  Fix that one tag and it scores 100.
- **Lighthouse SEO 100 does not mean the SEO is good.** Lighthouse checks a short
  mechanical list (title, description, 200, crawlable links, robots.txt, image alt,
  viewport, font size). It does not check whether you have a canonical, whether you are in
  the sitemap, or whether the page has any readable content. The root page scores 100 while
  having no canonical, no h1, an og:url pointing at a different page (§3.2), and a 24.5
  second LCP. All four are real problems and Lighthouse's SEO category sees none of them.
- **The root page's 26 performance is the honest headline.** 24.5 second LCP and 4.2
  seconds of main thread blocking on a mid tier phone. Lighthouse's single biggest lever
  there is 7,540 ms of unused JavaScript. That is a real ranking factor and a bigger real
  problem than any tag on this page, but it is a code change and out of scope for this doc.

---

## 2. The site wide inventory

139 HTML pages scanned in the repo (22 root, 4 portal, 113 satellites). Every count below
is from that scan.

| Signal | Pages missing it | Share |
|---|---|---|
| `<title>` | 0 | 0% ✅ |
| `<meta name="description">` | **111** | 80% |
| `<link rel="canonical">` | **131** | 94% |
| `og:title` / `og:description` | 37 | 27% |
| `og:image` | 40 | 29% |
| `twitter:card` | 41 | 29% |
| an `<h1>` anywhere on the page | **94** | 68% |
| `lang` attribute on `<html>` | 3 | 2% ✅ |
| `viewport` | 1 | 1% ✅ |
| JSON-LD structured data | **138** | 99% |
| listed in `sitemap.xml` | **51** | 37% |

Cross tabs that matter:

- **84 pages have Open Graph tags but no meta description.** Somebody did the social card
  pass and skipped the search pass. The og:description is usually already written and
  usable; it just needs copying into a description tag.
- **27 pages have neither.** These are invisible in a search result: Google writes its own
  snippet from whatever text it can scrape, and on a canvas game that is often nothing.
- **Only one page on the whole site has structured data**, `satellites/stream-hop`.

---

## 3. The specific problems, worst first

### 3.1 `/jimothy/` and `/satellites/stream-hop/` fight each other

This is the most valuable page on the site right now, because it is the URL in the Steam
store's Website field and the one every launch link will point at.

Measured:

```
curl -s -o /dev/null -w "%{http_code}" https://lucidwinds.com/jimothy/     -> 200, no Location header
```

So `/jimothy/` is **not** an HTTP redirect. It returns a real 200 page, and that page then
moves the browser to `/satellites/stream-hop/` in JavaScript. Meanwhile:

| Signal on `/jimothy/` | Value |
|---|---|
| `<link rel="canonical">` | `https://lucidwinds.com/satellites/stream-hop/` |
| `og:url` | `https://lucidwinds.com/jimothy/` |
| in `sitemap.xml`? | yes, at priority 0.9 |

Three signals, three different answers. The sitemap says index `/jimothy/`. The canonical
says do not, index the other one. The og:url says the page is `/jimothy/`. Google will
follow the canonical and drop `/jimothy/`, which is the URL Steam is sending people to and
the one printed on the itch page.

**Pick one and make every signal agree.** My recommendation is to keep
`/satellites/stream-hop/` as the real page (it already has the canonical, the JSON-LD and
the incoming links) and turn `/jimothy/` into a genuine **301 redirect** at the server, then
remove `/jimothy/` from the sitemap. A 301 passes ranking; a JavaScript hop does not
reliably, and a 200 page that self canonicalises away is the worst of the three.

If instead you want `/jimothy/` to be the public face because it is the prettier URL, then
flip it: make `/satellites/stream-hop/` 301 to `/jimothy/`, move the canonical, and update
the sitemap. Either is fine. The current state is not.

### 3.2 The root page declares itself to be the portal

`https://lucidwinds.com/` carries:

```html
<meta property="og:url" content="https://lucidwinds.com/portal/">
```

on a page whose og:title is "Lucid Winds — Botanical Collectible Game". Every share of the
homepage tells the receiving platform that the canonical address of this content is the
arcade. It also has no `<h1>` and no `rel=canonical`. Fix in §5.

### 3.3 www and non www both answer, and nothing says which is real

```
http://lucidwinds.com/       -> 301 -> https://lucidwinds.com/     ✅ good
https://www.lucidwinds.com/  -> 200                                 ⛔ duplicate
```

`www.lucidwinds.com` serves the whole site at 200 with no redirect. Combined with 94% of
pages having no canonical, every page on the site currently exists at two addresses with
nothing telling Google which one counts. This is the single highest leverage fix on the
page: one server rule plus one canonical tag per page.

### 3.4 The sitemap is stale, thin and has no `lastmod`

- 88 URLs for 139 pages. **30 satellites are missing**, including everything recent:
  `abduct-a-chameleon, attic, aura-farm, bandits-box, blackout, bubblenaut, burrow-bowl,
  create-a-critter, deepwell, flock-the-world, fox-basket, glyph-forge, hunch,
  letter-launch, litter-bug, moon-claw, parallel, puppy-dash, siege, sixfold, skitterlings,
  skyshot, stop-the-light, sweet-spot, tally, tarot-run, tomato-man, twin-lanterns,
  wild-wardens, wireworm`.
- **No `<lastmod>` on any entry.** Of the three optional sitemap fields, `lastmod` is the
  one Google has said it actually uses. `changefreq` and `priority` are present on every
  row and are the two it ignores.
- `priority` is 0.6 on 82 of 88 rows, which carries no information even if it were read.
- `/support.html`, `/privacy.html`, `/terms.html`, `/hire.html` and `/studio.html` are all
  live and all absent.

**Fix:** generate the sitemap from the portal catalog instead of maintaining it by hand.
`scripts/catalog.mjs` already knows every satellite and which ones are gated, so a
generator can emit exactly the openable ones and skip the eight behind the dev gate,
which is also the correct behaviour (do not invite Google to a locked door).

### 3.5 96 satellites have no meta description, and 95 of them already have the copy

The portal's `FEATURED` array carries a curated one line blurb for every game. Measured:

- satellites missing a description: **96**
- of those, the portal already holds a written blurb: **95**
- needs writing by hand: **1** (`slice-master`)
- blurb length: min 44, median 89, max 123 characters

So this is not a writing job, it is a plumbing job: read `FEATURED` (using the bracket
matching parser in `scripts/catalog.mjs`, never a regex, per the note at the top of that
file) and inject the blurb as the description on the matching satellite page. Eight blurbs
are under 70 characters and are worth a second clause; the rest are ready.

⚠️ Watch the name mismatch while doing it. The portal card name is not always the page
title: `bloomzap` is carded as "Word Lightning", `chaff-wars` as "Pop N Lock",
`stream-hop` as "Jumping Jimothy". Take the description, not the name.

### 3.6 68% of pages have no h1

Including `/` , `/jimothy/`, `/satellites/stream-hop/`, `/studio.html`, `game.html`,
`greenhouse.html` and `wild.html`. On a canvas game the h1 is often the only text Google
gets. `/satellites/stream-hop/` renders exactly three words of body text to a crawler
("Jumping Jimothy", "TAP TO START"); everything else is behind the tap gate. That page is
selling a $2.99 Steam title and it gives a search engine three words.

A visually hidden h1 is legitimate here and is the cheap fix. FTW already does the right
thing with a visible one.

Small note on FTW's h1: the markup is `<h1><span>F LOCK</span><br><span>THE</span>
<span>WORLD</span></h1>`, so naive text extraction reads "FLOCKTHE WORLD". Browsers and
Google treat the `<br>` as whitespace when extracting rendered text, so I do **not** think
this actually hurts, and I am flagging it only so nobody rediscovers it and panics.

### 3.7 Six internal dev tools are live and indexable

`audit.html` (Leaf & Stem Audit Tool), `leaf-audit.html`, `nuke.html` (Cache Nuke),
`preview.html` (EA Badge Preview), `dual-preview.html`, `dice-tool.html`. All return 200.
`robots.txt` is `Allow: /` with no disallows and no page carries a `noindex`.

Mitigating: I could not find an `href` to any of them from any page, and none are in the
sitemap, so a crawler has no path to them today. This is hygiene, not a fire. Add
`<meta name="robots" content="noindex">` to each, or a `Disallow:` block.

### 3.8 Image alt

55 images across the site have no `alt`, and 41 of those are on the root game page where
they are in game UI, which is an accessibility item more than a search one. The genuinely
worth fixing ones are the small pages where the missing alt is the hero art:
`nectar-drop` (4 of 4), `greenhouse-pinball` (2 of 3), and one each on `attic`,
`burr-blast`, `chaff-wars`, `flock-the-world`, `glyph-forge`, `hunch`, `sled-vine`,
`stream-hop`.

---

## 4. ⛔ `robots.txt`: the file being served is not the file in the repo

I nearly wrote this section from the repo and it would have been wrong. The repo's
`robots.txt` is 68 bytes. **The edge serves 1,904 bytes.** Verified with a cache busting
probe today:

```
curl -s "https://lucidwinds.com/robots.txt?probe=$RANDOM" | wc -c   ->  1904
```

The extra bytes are a **Cloudflare managed block**, delimited by
`# BEGIN Cloudflare Managed content`, that nobody at Sky Wolf Studio wrote. It declares:

```
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
```

plus `Disallow: /` for **Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot,
CloudflareBrowserRenderingCrawler, GPTBot, Google-Extended, meta-externalagent**. The repo's
own `User-agent: *` block is appended after it, so the file now has two `*` groups. Per
RFC 9309 they merge, so this is untidy rather than broken.

Cloudflare announced the Content Signals Policy on 24 September 2025 and enabled it by
default on millions of domains
([Cloudflare blog](https://blog.cloudflare.com/control-content-use-for-ai-training/),
accessed 2026-08-27, SECONDARY for the domain count).

### What it actually costs you, which is less than it looks

The blocked crawlers are **training** crawlers, and their operators say so:

| Blocked | What it controls |
|---|---|
| `GPTBot` | content "that may be used in **training** our generative AI foundation models" |
| `ClaudeBot` | collects web content to improve generative AI models (**training**) |
| `Google-Extended` | Google: "Google-Extended does **not** impact a site's inclusion in Google Search" and is not a ranking signal |

**Googlebot is not blocked. Indexing is unaffected.** And the crawlers that actually feed
citations in assistant answers are **not** blocked: `OAI-SearchBot`, `ChatGPT-User`,
`Claude-User`, `Claude-SearchBot`, `PerplexityBot`. So the assistants can still find and
cite the games; only model training is opted out. That is a defensible default.

⚠️ **One line does deserve a second look:** `CloudflareBrowserRenderingCrawler: Disallow: /`.
Given §10.3 below (the portal's link graph exists only in JavaScript), blocking browser
rendering crawlers is the wrong instinct for this specific site.

**The action here is not a fix, it is a decision.** Open the Cloudflare dashboard, look at
the AI crawler setting once, and confirm you agree with it. Right now a third party is
making a policy statement in your name at your domain.

Separately, still worth adding to the repo file: a `Disallow` for the six dev tools in §3.7.

---

## 5. The fix list, ordered by impact

Impact is my judgement; the measurement columns are not.

| # | Fix | Pages | Effort | Why it is where it is |
|---|---|---|---|---|
| **1** | Lift the dev gate on Flock the World | 1 | one line | Nothing else about FTW matters until a stranger can play it |
| **2** | Redirect `www` to non `www` at the server, 301 | site wide | one server rule | Every page currently exists twice with no canonical to arbitrate |
| **3** | Add `rel=canonical` to every page | 131 | scripted | Same reason. Cheap, mechanical, and it also fixes §3.1 |
| **4** | Resolve `/jimothy/` vs `/satellites/stream-hop/` (§3.1) | 2 | small | It is the Steam launch URL and it currently self cancels |
| **5** | Regenerate `sitemap.xml` from `scripts/catalog.mjs`, with `lastmod`, skipping gated games | 1 file | small script | 30 games are invisible, including FTW |
| **6** | Inject meta descriptions from the portal blurbs | 95 | scripted | The copy already exists |
| **7** | Fix root `og:url` | 1 | one line | Homepage shares resolve to the arcade |
| **8** | Add a visually hidden `<h1>` to the game pages | 94 | scripted | Often the only text a crawler gets |
| **9** | Add `VideoGame` JSON-LD to the two flagships, then the catalog | 2, then many | small | See §7 |
| **10** | `noindex` the six dev tools | 6 | one line each | Hygiene |
| **11** | Alt text on the hero images listed in §3.8 | ~10 | small | Accessibility first, search second |
| **12** | The root page's 5.5 MB and 4.2 s of blocking | 1 | real work | Biggest true ranking factor, biggest job, own project |

---

## 6. The exact tags

### 6.1 Every page, in `<head>`

```html
<link rel="canonical" href="https://lucidwinds.com/PATH/">
```

One per page, absolute, with the trailing slash for directory URLs, matching exactly the
form used in the sitemap.

### 6.2 `https://lucidwinds.com/` (root, Lucid Winds)

Change:
```html
<meta property="og:url" content="https://lucidwinds.com/portal/">
```
to:
```html
<meta property="og:url" content="https://lucidwinds.com/">
```
Add:
```html
<link rel="canonical" href="https://lucidwinds.com/">
```
And an h1 as the first element in `<body>`:
```html
<h1 class="visually-hidden">Lucid Winds, a botanical collectible game where every plant is one of one</h1>
```

### 6.3 `https://lucidwinds.com/satellites/flock-the-world/`

The whole head block it is missing:

```html
<meta name="description" content="Flock the World is Plague Inc for the surveillance state. You play the vendor selling cameras, drones and scanners to every region on Earth. The civilians are innocent, they fight back, and they learn. Free in your browser.">
<link rel="canonical" href="https://lucidwinds.com/satellites/flock-the-world/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sky Wolf Studio">
<meta property="og:title" content="Flock the World">
<meta property="og:description" content="Plague Inc for the surveillance state. You play the vendor, the civilians are innocent, and they fight back.">
<meta property="og:url" content="https://lucidwinds.com/satellites/flock-the-world/">
<meta property="og:image" content="https://lucidwinds.com/satellites/flock-the-world/art/og-ftw-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A night side world map webbed with satellite coverage arcs over glowing cities.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Flock the World">
<meta name="twitter:description" content="Plague Inc for the surveillance state. You play the vendor, the civilians are innocent, and they fight back.">
<meta name="twitter:image" content="https://lucidwinds.com/satellites/flock-the-world/art/og-ftw-1200x630.jpg">
```

⚠️ **The og:image above does not exist yet.** There is no 1200x630 card in
`satellites/flock-the-world/art/`. Either make one or drop the four image lines; a broken
og:image is worse than none, because the platforms cache the failure.

The description reuses the manifest's own line, which is already the best sentence anyone
has written about this game, and extends it to the ~200 characters a search snippet can
show.

### 6.4 `https://lucidwinds.com/satellites/stream-hop/` (Jimothy)

Already has description, OG, twitter, canonical and JSON-LD. It needs an h1:

```html
<h1 class="visually-hidden">Jumping Jimothy, a rainy Seattle hopper about a very round raccoon</h1>
```

and, once the Steam page is live, the `sameAs` addition in §7.

### 6.5 The 95 scripted descriptions

```html
<meta name="description" content="{FEATURED[i].ds}">
```

read out of `portal/index.html` with the bracket matching parser, matched to the satellite
by the `/satellites/<slug>/` fragment of `FEATURED[i].url`. `slice-master` has no card and
needs one line written by hand.

### 6.6 The visually hidden h1 helper

If the site does not already have one:

```css
.visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
```

Do not use `display:none` for this. A hidden h1 is a normal accessibility pattern; a
display:none h1 is the pattern search engines learned to discount.

---

## 7. Structured data

Exactly one page on the site has JSON-LD: `satellites/stream-hop`. It is good, and it has
one thing in it that should come out.

### 7.1 ⛔ Frogger and Crossy Road are live on the Jimothy page, twice

Verified against the live server on 2026-08-27:

```
curl -s https://lucidwinds.com/satellites/stream-hop/ | grep -o "Frogger[^\"]\{0,40\}"
Frogger, Crossy Road, free browser game, Seattl      <- <meta name="keywords">, line 19
Frogger, Crossy Road, free browser game, Seattl      <- JSON-LD "keywords" field
```

`STEAM-CHECKLIST` and `STORE_PAGE_FILL.md` both already say these are other companies'
trademarks and must never appear on a store page. The reasoning there applies here with
one addition that makes it easy:

**Neither field does anything for search.** Google announced it stopped using
`<meta name="keywords">` for ranking in 2009 and has never walked that back. The
schema.org `keywords` property is not a ranking signal either; Google's structured data
documentation lists no ranking use for it on `VideoGame`. So this is legal exposure with a
return of exactly zero.

**Fix:** delete the `Frogger, Crossy Road, ` substring from both places. Keep everything
else. Keep `alternateName` including "Jimothy the Jumping Nugget", which is a real former
name of the same product and is the correct use of that property. The `<meta keywords>` tag
can stay or go; it is inert either way.

### 7.2 The two flagships should carry `VideoGame` schema, with `sameAs`

Jimothy's block is already close to right. The thing it is missing is the one thing
structured data is genuinely good for now, which is telling a search engine that the thing
on your page, the thing on Steam, and the thing on itch are **one entity**:

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"VideoGame",
  "name":"Jumping Jimothy",
  "alternateName":["Jimothy","Jimothy the Jumping Nugget"],
  "url":"https://lucidwinds.com/satellites/stream-hop/",
  "sameAs":[
    "https://store.steampowered.com/app/5043360/",
    "https://stephenuffugus.itch.io/jimothy-the-jumping-nugget"
  ],
  "image":"https://lucidwinds.com/satellites/stream-hop/assets/og-jimothy3.jpg",
  "description":"Meet Jumping Jimothy, Seattle's roundest and most beloved raccoon. Hop him across the rainy city to the greatest dumpster feast in town. Free to play in your browser.",
  "genre":["Arcade","Casual"],
  "applicationCategory":"GameApplication",
  "gamePlatform":["Web browser","Android","iOS","Windows"],
  "operatingSystem":"Web browser, Android, iOS, Windows 10",
  "inLanguage":"en",
  "author":{"@type":"Organization","name":"Sky Wolf Studio","url":"https://lucidwinds.com/"},
  "publisher":{"@type":"Organization","name":"Sky Wolf Studio"},
  "offers":{"@type":"Offer","price":"0","priceCurrency":"USD","availability":"https://schema.org/InStock"}
}
</script>
```

⚠️ **Add the Steam URL only once the store page is public.** Measured 2026-08-27:
`https://store.steampowered.com/app/5043360/` returns 200 but serves the Steam homepage
(`<title>Welcome to Steam`), which is what Steam does for an app with no public store page.
That matches the Aug 26 rejection over the Library Logo. A `sameAs` pointing at a page that
resolves to a storefront homepage is worse than no `sameAs`.

The itch URL **is** live and verified today:
`https://stephenuffugus.itch.io/jimothy-the-jumping-nugget` returns 200 with a playable
build. See `PUB-LISTINGS.md` before you point search engines at it, because the copy on
that page contradicts the Steam page in three places.

And for FTW:

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"VideoGame",
  "name":"Flock the World",
  "url":"https://lucidwinds.com/satellites/flock-the-world/",
  "image":"https://lucidwinds.com/satellites/flock-the-world/art/og-ftw-1200x630.jpg",
  "description":"A strategy simulation where you play the vendor selling surveillance to every region on Earth. The civilians are innocent, they fight back, and they learn.",
  "genre":["Strategy","Simulation","Indie"],
  "applicationCategory":"GameApplication",
  "gamePlatform":["Web browser","Android"],
  "operatingSystem":"Web browser, Android",
  "inLanguage":"en",
  "author":{"@type":"Organization","name":"Sky Wolf Studio","url":"https://lucidwinds.com/"},
  "publisher":{"@type":"Organization","name":"Sky Wolf Studio"},
  "offers":{"@type":"Offer","price":"0","priceCurrency":"USD","availability":"https://schema.org/InStock"}
}
</script>
```

### 7.3 One `Organization` block, on the portal, once

The studio is currently an entity with no home. Put this on `portal/index.html` only, not
on every page:

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Organization",
  "name":"Sky Wolf Studio",
  "url":"https://lucidwinds.com/",
  "logo":"https://lucidwinds.com/portal-assets/og-portal-1200x630.jpg",
  "sameAs":["https://stephenuffugus.itch.io/"]
}
</script>
```

⛔ The brand is **SKY WOLF STUDIO, singular**, everywhere. `feedback_skywolf_account_branding`
records that shipped games still carry the plural and that this is an open sweep. Do not
add a new plural while fixing tags.

---

## 8. The scan, so you can disagree with me with a number

Everything in §2 and §3 comes out of one script. It is in the scratchpad rather than the
repo because it is a measuring tool, not a shipping one; move it to `scripts/` if it is
worth keeping.

```
/tmp/claude-1000/-workspaces-lucid-winds/44932b2e-c014-4983-9c7c-e5db0dba6eba/scratchpad/seoscan.mjs
```

It walks every `*.html` in the repo root, `portal/`, `jimothy/` and `satellites/*/`, parses
the head, and reports title, description, OG, Twitter, canonical, robots, viewport, lang,
h1 count, image alt gaps, JSON-LD presence and sitemap membership per page, plus the
aggregate counts. Output lands in `seo.json` next to it.

The Lighthouse runs:

```bash
export CHROME_PATH=~/.cache/puppeteer/chrome/linux-151.0.7922.47/chrome-linux64/chrome
npx lighthouse "https://lucidwinds.com/" --only-categories=seo,performance,accessibility \
  --output=json --output-path=./lh-root.json --quiet \
  --chrome-flags="--headless=new --no-sandbox --disable-dev-shm-usage"
```

⛔ `~/.cache/puppeteer` must never be deleted. It is the only Chrome in this codespace and
it is what every screenshot, probe and Lighthouse run here depends on.

---

## 9. The two scripts Fable should write

These are specifications, not shipped code. I have not edited the repo.

### 9.1 `scripts/gen_sitemap.mjs`

Replaces the hand maintained `sitemap.xml`. Reads the catalog rather than a list, so it
cannot go stale again, and skips gated games so Google is never invited to a locked door.

```js
/* Generate sitemap.xml from the portal catalog + the real files on disk.
   ⛔ Uses scripts/catalog.mjs, which bracket-matches the arrays out of
   portal/index.html. Never regex a parseable structure. */
import { readFileSync, writeFileSync, statSync, existsSync } from 'fs'
import { catalog } from './catalog.mjs'

const ORIGIN = 'https://lucidwinds.com'

// Pages that are pages, not games. Everything else comes from the catalog.
const STATIC = [
  ['/',                  1.0],
  ['/portal/',           0.9],
  ['/portal/apps.html',  0.8],
  ['/jimothy/',          0.9],   // ⛔ drop this row if /jimothy/ becomes a 301, see §3.1
  ['/links.html',        0.7],
  ['/support.html',      0.6],
  ['/privacy.html',      0.4],
  ['/terms.html',        0.4],
]

// ⛔ Never list a dev-gated game. dev-gate.js in the head === not public.
function gated(dir) {
  const f = `satellites/${dir}/index.html`
  return existsSync(f) && readFileSync(f, 'utf8').includes('dev-gate.js')
}

function lastmod(rel) {
  try { return statSync(rel).mtime.toISOString().slice(0, 10) } catch { return null }
}

const rows = []
for (const [path, pri] of STATIC) {
  const rel = path === '/' ? 'index.html'
            : path.endsWith('/') ? path.slice(1) + 'index.html'
            : path.slice(1)
  rows.push({ loc: ORIGIN + path, pri, mod: lastmod(rel) })
}
const seen = new Set()
for (const s of catalog().sats) {
  // ⛔ Dedupe by DIRECTORY, and decide gating from the FILE, not the card.
  // abduct-a-chameleon has two cards: the 2D game (open) and abduct-3d.html
  // (beta:true). Skipping on the card's `gated` flag would drop the open game.
  if (!s.dir || seen.has(s.dir)) continue
  seen.add(s.dir)
  if (gated(s.dir)) continue
  rows.push({
    loc: `${ORIGIN}/satellites/${s.dir}/`,
    pri: 0.6,
    mod: lastmod(`satellites/${s.dir}/index.html`),
  })
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...rows.map(r =>
    `  <url><loc>${r.loc}</loc>` +
    (r.mod ? `<lastmod>${r.mod}</lastmod>` : '') +
    `<priority>${r.pri}</priority></url>`),
  '</urlset>', '',
].join('\n')

writeFileSync('sitemap.xml', xml)
console.log(`sitemap.xml: ${rows.length} urls`)
```

Two deliberate changes from the current file: **`lastmod` is in and `changefreq` is out.**
Google has said it uses `lastmod` and ignores `changefreq` and `priority`; `priority` stays
only because it costs nothing and some other crawlers still read it.

Verified against the real catalog on 2026-08-27: `catalog().sats` has 116 rows, 113 with a
`dir`, and the row shape is `{name, url, cat, kind, gated, dir}`. `dir` is `null` for off site
entries like Lucid Winds itself, which is why the loop skips falsy `dir`.

⚠️ **20 rows carry `gated: true` but only 8 directories actually contain `dev-gate.js`.** The
card flag is `beta: true`, which is a portal display state; the script tag is the real gate.
That is why the code above reads the file. Getting this backwards costs you twelve games in
the sitemap.

### 9.2 `scripts/inject_meta.mjs`

One pass over the satellites that adds what is missing and touches nothing that is present.

```
for each satellites/<dir>/index.html:
  slug   = dir
  blurb  = FEATURED entry whose url contains /satellites/<slug>/   -> .ds
  title  = the page's existing <title>, unchanged

  if no <meta name="description">   insert  <meta name="description" content="{blurb}">
  if no <link rel="canonical">      insert  <link rel="canonical" href="https://lucidwinds.com/satellites/{slug}/">
  if no <h1>                        insert  <h1 class="visually-hidden">{title without the studio suffix}</h1>
                                            as the first child of <body>
  never overwrite an existing tag
  never touch a gated game (dev-gate.js in head)
```

⛔ Three rules from the repo's own scar tissue apply to writing this:

1. **Parse, do not regex.** `portal/index.html` FEATURED is a JavaScript array literal with
   variable shaped rows and apostrophes inside comments. `scripts/catalog.mjs` already
   solved this exact problem and its header explains why four earlier regexes each got a
   different, wrong answer.
2. **Verify every file still parses afterward.** `node --check` on extracted script blocks,
   or `vm.createScript`, per CLAUDE.md rule 15. Injecting into the head of a 400 KB
   single file game is exactly where a stray character kills a whole script block.
3. **Bump the `?v=` on anything with a service worker** or the edge serves the old head.
   `feedback_htaccess_does_not_deploy` and `feedback_verify_the_versioned_url`.

### 9.3 How to prove any of it worked

Not "it returned 200". Grep the live HTML for a marker that did not exist before:

```bash
curl -s "https://lucidwinds.com/satellites/flock-the-world/?probe=$RANDOM" \
  | grep -c 'name="description"'
```

---

## 10. What only a live crawl could show

Everything above §9 came from the repo plus Lighthouse. These came from fetching the real
served bytes, and three of them are bigger than anything in §3.

I re ran the three load bearing measurements myself rather than pass them on:

```
apex md5  12918985b8a71043de8c55b80de9ac99
www  md5  12918985b8a71043de8c55b80de9ac99      -> identical, §10.1
FEATURED rows 116, with ?v= 41                   -> §10.2
ls play/*.html | wc -l  ->  68                   -> §10.4
grep -c '/play/' sitemap.xml  ->  0
```

(The `/play/` count is 68 files, not the 69 my first pass reported. `catalog.mjs` counts 67
native games, so one of the 68 files is a shell that is not a carded game. The point is
unchanged: **zero of them are in the sitemap**.)

### 10.1 ⛔ `www` is not just a duplicate, it is a byte identical one

```
https://lucidwinds.com/      -> 200
https://www.lucidwinds.com/  -> 200, no redirect
md5 of both bodies:  12918985b8a71043de8c55b80de9ac99   (identical)
http://www.lucidwinds.com/   -> 301 -> https://www.  (stays on www)
```

The http to https redirect exists on both hostnames and is a clean single hop. What does
not exist is www to apex. So the entire site is served twice, identically, from two
hostnames, with **no canonical tag on 94% of pages** to say which one counts. This is the
single worst technical defect on the site and it is one server rule.

### 10.2 ⛔ You link the parameterised URLs and sitemap the clean ones

**41 of the 116 portal tiles link with a cache busting stamp**, for example
`href="/satellites/flock-the-world/?v=20260825a"`. That URL returns 200, serves identical
bytes, and carries no canonical. The sitemap, where the game appears at all, lists the clean
URL. So every internal link points at a variant that nothing declares to be a duplicate.

The `?v=` stamps are load bearing for cache busting and must not be removed. **The fix is
the canonical tag**, which is fix #3 in §5 and now has a second reason to exist.

### 10.3 The portal's link graph does not exist in HTML

The portal's served HTML contains **13 `<a href>` links and not one of them points at a
game.** All 116 satellites and all 68 `/play/` shells live in JavaScript object literals,
and there is no `<noscript>` fallback.

This is **not fatal**, and I want to be precise about why: the client side `card()` function
emits genuine `<a class="card" href="...">` anchors, not `div` plus `onclick`, so Google's
rendering pass can find them. But rendering is second wave and unreliable, and the thing
that is supposed to backstop it, the sitemap, is missing 32 satellites and **all 68 `/play/`
shells**. Combined with `CloudflareBrowserRenderingCrawler: Disallow: /` in §4, the site is
leaning hard on a discovery path it has partly blocked.

### 10.4 The 68 `/play/` shells are the buried asset

Every one returns 200. Every one is **2,921 bytes with 151 characters of visible text**, no
`<h1>`, no canonical, and none are in the sitemap. That is the solitaire, mahjong, crossword
and card inventory, and per §11.3 it sits in the highest demand, most evergreen keyword lane
the studio owns. 68 near identical 151 character pages is also a textbook thin content
pattern if they ever do get indexed as they are.

### 10.5 Page weight, and where it actually goes

| Page | Transfer (gzip) | Raw | Visible text | JS comments |
|---|---|---|---|---|
| `/` | **1.86 MB** | 7.06 MB | 12,026 chars | **1,397,995 B (19.8%)** |
| `/portal/` | 77 KB | 226 KB | 2,412 chars | 44,511 B (19.7%) |
| `/satellites/flock-the-world/` | 167 KB | 466 KB | 1,378 chars | 69,883 B (15.0%) |
| `/satellites/stream-hop/` | 141 KB | 413 KB | 5,843 chars | 90,212 B (21.9%) |
| `/portal/apps.html` | 9 KB | 40 KB | 3,879 chars | 124 B (0.3%) |

**The homepage ships 1.86 MB compressed to deliver 12 KB of text, and 1.4 MB of that is
developer comments.** Roughly a fifth of the bytes on all four heavy pages are comments.

I am not suggesting stripping comments from the source. They are load bearing institutional
memory and CLAUDE.md exists partly because of what got lost when they were not there. **A
minify step at deploy time** takes about 20% off the wire with zero source changes. TTFB is
already good, 0.07 to 0.15 s with Cloudflare cache HITs.

### 10.6 Is the site indexed? Probably not, and I could not prove it

**UNVERIFIED, with strong indirect evidence, and the failed attempts are listed so you can
judge the strength yourself.**

What failed: the `site:` operator is not honoured by the search tool available here; scraping
Bing produced bot defence content that *looked* like a "no results" page and was discarded
after a control query proved it was garbage; DuckDuckGo returned 202 and Mojeek 403.

What did work: searching for the site's **own verbatim meta description sentence**.

| Query | lucidwinds.com in results? |
|---|---|
| `"Seattle's roundest and most beloved raccoon"` (verbatim from the site's own description) | **No** |
| `"Jumping Jimothy" game raccoon` | **No** |
| `jimothy game play free browser` | **No** |
| `"Sky Wolf Studio" arcade free browser games no ads` | **No** |
| `"Flock the World" satellite game browser strategy` | **No** |

A site failing to surface for its own unique sentence is the strongest proxy available for
"not indexed, or indexed with no visibility". **Only Google Search Console can settle it,
and only Stephen can open that.** It is the first thing on the list in §12.

### 10.7 Two brand collisions worth knowing before spending on either name

- **`lucidwinds` is taken elsewhere.** `lucidwinds.itch.io` is a **different developer**
  entirely (Hiraeth, Dream Painters, Shipwreckers), and `@lucidwinds` is taken on Instagram
  and X by other people.
- **"Sky Wolf Studio" collides hard.** *Sky Wolf* is a 1987 arcade title with pages on every
  ROM site, and **Skywolf Game Studios** is an active indie studio in Palm Bay, Florida with
  its own itch.io, Facebook, Google Play and domain.

Neither is a legal problem and neither is a reason to rename anything. It does mean **you
will not win either name on search**, so brand queries are not the lane. §11 is.
---

## 11. Keywords, and the finding that matters more than every tag on this page

**Method, stated up front so you can weigh it.** I had no paid volume tool, so there are
**no invented numbers anywhere below**. Demand evidence is the Google Suggest API
(`suggestqueries.google.com`, queried 2026-08-27), which returns queries Google actually
observes. A phrase appearing in autocomplete is evidence of real demand. `(none)` is
meaningful evidence of absence. Competition is judged from who currently ranks.

### 11.1 ⛔⛔ Jimothy is a real, famous, live news story, and six other people are already selling games about him

I verified this myself rather than take it second hand.

**[Jimothy](https://en.wikipedia.org/wiki/Jimothy_(raccoon)) is a real wild raccoon in
Ballard, Seattle**, with a short spine, no owner, and a Wikipedia article. He went viral in
**July 2026** after Kiana Hall posted a video. Since then: Seattle City Council recognition,
a University of Washington honorary degree, a Google Search easter egg, murals, tattoos,
Mariners shirts, a **Guild Wars 2 NPC** added by ArenaNet on 11 August, a D&D Beyond stat
block, Skyrim and Stardew Valley mods.

**And another developer already got the press.** Chris Pirillo, an Issaquah creative
entrepreneur with a large existing audience, built a four level 8 bit Jimothy browser game
in about **twelve hours** and got press for it.

⚠️ **Precision on the outlets, because I over claimed first time.** The one I verified myself is
[KNKX public radio](https://www.knkx.org/arts-culture/2026-08-06/seattle-raccoon-jimothy-video-game-ai)
(Pirillo, Issaquah, "approximately twelve hours", vibe coding, and his decision to reject a
location tracking feature to protect the real animal).
[GameSpot](https://www.gamespot.com/articles/viral-raccoon-jimothy-gets-his-own-browser-video-game-and-the-internet-is-smitten/)
and [GeekWire](https://www.geekwire.com/2026/8-bit-jimothy-viral-sensation-raids-trash-cans-eludes-paparazzi-in-seattle-creators-video-game/)
carry matching headlines and are Cloudflare blocked from this machine, so they are neither
confirmed nor disproved. ⛔ **PC Gamer does not belong on that list**: its Jimothy article is
about brand accounts posting fan art (WoW, RuneScape, The Sims, Halo) and never mentions Pirillo
or a browser game. **So: at most three outlets, one confirmed.**
Exact match domains are already taken: `playjimothy.com`, `jimothydash.com`,
`jimothyheist.com`, `jimothygames.xyz`, `arcade.pirillo.com/jimothy.html`,
`playlin.io/game/jimothy`, `jimothydev.itch.io`.

**Sky Wolf Studio has the deepest Jimothy game by a wide margin and zero visibility for it.**
One hundred fixed levels, five modes, 45 characters, a daily, a soundtrack, against a
weekend build that got covered. That is not a complaint about fairness, it is a statement about
distribution, and distribution is fixable.

**Two things follow, and they are the most valuable lines in this document.**

**(a) The title tag is aimed at a phrase nobody searches.** Autocomplete for
`jumping jimothy` returns nothing relevant. It suggests "jimothy jumping" and, bizarrely,
"jump float serve vs jump serve". The queries that actually exist are:

`jimothy game` · `jimothy raccoon game` · `jimothy video game` · `jimothy arcade game` ·
`jimothy game google` · `jimothy dino game` · `jimothy the raccoon dino game`

**Retarget the page.** Keep **Jumping Jimothy** as the product name, on Steam, on the
capsules, in `alternateName` where it already correctly sits. But the `<title>` and the
`<h1>` should lead with the words people type:

```html
<title>Jimothy Game: play the Seattle raccoon hopper free in your browser</title>
<h1 class="visually-hidden">Jimothy the raccoon, a free browser hopper across rainy Seattle</h1>
```

**(b) This demand curve is decaying and the Steam page is stuck.** Viral attention has a
half life. The Steam store page came back on 26 August over the Library Logo and is waiting
on a resubmission. Every day that page is not public is a day of the largest free demand
signal this studio will ever get, going to six other people. **Nothing else in this document
is worth doing before that resubmission goes in.**

⚠️ **One thing I want to flag honestly and without drama.** Jimothy is a real wild animal
with no owner, so there are no publicity rights attached to him and nothing here is
obviously a problem. But a $2.99 commercial product named after a living, currently famous
animal is worth ten minutes of thought before launch: check whether anyone has filed on the
name, and be ready for the question "did you ask anyone". The good news is the local
precedent is friendly. KNKX covered Pirillo's game and reported **no backlash about AI**, and
Pirillo went out of his way to reject a location tracking feature to avoid the real animal
being harassed. That is the bar in this space, and Jimothy's game clears it easily.

### 11.2 Jumping Jimothy, the target list

| # | Phrase | Demand evidence | Competition |
|---|---|---|---|
| 1 | `jimothy game` | ✅ autocomplete, head term | High, 6+ dedicated domains |
| 2 | `jimothy raccoon game` | ✅ autocomplete | High |
| 3 | **`jimothy arcade game`** | ✅ autocomplete | **Med to low, best head adjacent target** |
| 4 | `jimothy video game` | ✅ autocomplete | Med |
| 5 | `crossy road like games` | ✅ (`crossy road style games`, `crossy road type games`) | Med, strongest category lane |
| 6 | `crossy road style game free` | ✅ variant confirmed | **Low** |
| 7 | **`raccoon crossing road game`** | ✅ autocomplete, 3 variants | **Low, exact mechanic match** |
| 8 | `raccoon crossing street game` | ✅ autocomplete | **Low** |
| 9 | `raccoon game online free` | ✅ autocomplete | **Low** |
| 10 | `seattle raccoon game` | ✅ autocomplete | **Low** |
| 11 | `jimothy game unblocked` | ❌ `(none)`, but "unblocked" is a proven school traffic pattern | Speculative |
| 12 | `frogger style game free` | ❌ `(none)` | Do not target |

⚠️ Note #5 and #6. **"Crossy Road" has real search demand and is a trademark.** Targeting
`crossy road style game free` in body copy as a comparison is normal practice and is
different from putting the mark in a Steam tag or a store title, which
`store/jimothy-steam/STORE_PAGE_FILL.md` correctly forbids. Use it in a sentence, never as a
label. And `frogger style game free` returns nothing, so the Frogger keyword in §7.1 is not
even buying traffic, which settles that argument.

### 11.3 The portal, which is the best value lane on the whole site

The portal is currently trying to rank on "Sky Wolf Studio Arcade", a brand that collides
with a 1987 arcade machine and a Florida studio (§10.7). That is unwinnable. The winnable
play is the opposite shape: let each of the 68 `/play/` shells rank for its own boring,
evergreen, high intent query, and let the portal collect them.

| # | Phrase | Demand evidence | Note |
|---|---|---|---|
| 1 | **`browser games no ads`** | ✅ 9 autocomplete variants | Best portal fit, and it is **literally true** |
| 2 | `free games no download no sign up` | ✅ autocomplete | High competition, huge volume |
| 3 | `mahjong free online no download` | ✅ 9 variants | You have `/play/mahjong` |
| 4 | `solitaire free online no ads` | ✅ autocomplete | You have klondike, spider, freecell, pyramid, tripeaks, golf |
| 5 | `mini crossword free unlimited` | ✅ autocomplete | **Low.** NYT owns the head, not the tail. You have a mini crossword |
| 6 | `browser games that work on mobile` | ✅ autocomplete | **Low** |

**None of those 68 pages is in the sitemap, none has an h1, none has a canonical, and each
has 151 characters of text.** Fixing that is a bigger win than anything on the flagship.

### 11.4 Flock the World, and I am not going to pretend

**FTW cannot be won on search.** Every conceptual query returns `(none)`:
`surveillance capitalism game`, `satire strategy game`, `spy satellite simulator game`,
`games where you are the villain browser`, `surveillance satire game`. Worse,
`satellite game` and `surveillance game` are **dominated by hunting trail cameras**
("satellite game camera"), which is actively the wrong traffic. `flock the world`
autocompletes to world clocks and Jurassic World.

The only lane with proven demand is Plague Inc adjacency:

| # | Phrase | Demand evidence | Competition |
|---|---|---|---|
| 1 | `games like plague inc free` | ✅ autocomplete | Med |
| 2 | **`games like plague inc browser`** | ✅ stem confirmed, 8 variants | **Low** |
| 3 | `games like plague inc but war` | ✅ autocomplete | **Low** |
| 4 | `games like plague inc reddit` | ✅ autocomplete | Forum led. **Go and post, do not try to rank** |
| 5 | `plague inc type games` | ✅ autocomplete | Med |
| 6 | `world conquest game browser` | ✅ autocomplete | **Low** |
| 7 | **`political simulator browser`** | ✅ autocomplete | **Low, closest true intent match** |
| 8 | `free browser strategy game` | ✅ (`best free browser strategy game`) | High, freetogame and mmobomb own it |

**FTW's discovery channels are Reddit, itch.io and press. Not Google.** Its manifest line,
"Plague Inc for the surveillance state", is already the best sentence anyone has written
about it and it happens to be the exact phrase with demand. Put it in the meta description
(§6.3) and then go and post it somewhere, per `PUB-LISTINGS.md`.

⚠️ **One name risk.** "Flock" now strongly means **Flock Safety**, the licence plate reader
company, in US news. Autocomplete shows `flock cameras around the world`, `flock locations`,
and even `jimothy game flock cameras`. A surveillance satire called Flock will be read as
commentary on that specific company. That is arguably perfect and arguably a trademark
adjacent collision. Either way it should be a decision, not an accident.
---

## 12. What 2026 SEO actually rewards for a site like this

Sourced from Google's own documentation, quoted, because this is the area with the most
confident nonsense written about it.

### 12.1 `VideoGame` schema alone earns nothing. Co-type it.

This corrects §7.2 in one detail and it matters:

> **"Google doesn't show a rich result for Software Apps that only have the `VideoGame`
> type."**
> — [Google Search Central, Software App structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app), accessed 2026-08-27

`VideoGame` is not in Google's supported rich result gallery. **Software App is**, and Google
gives the worked example:

> "To make sure that your Software App is eligible for display as a rich result, co-type the
> `VideoGame` type with another type. For example: `@type: ["VideoGame", "MobileApplication"]`"

```json
"@type": ["VideoGame", "WebApplication"],
```

⛔ **But I had the required properties backwards, and it changes the recommendation.** Google
lists as **required**: `name`, `offers.price`, and **one of `aggregateRating` or `review`**.
`applicationCategory` and `operatingSystem` are only **recommended**.

**So co-typing alone earns no rich result.** It needs a rating or a review, and you do not have
real ones. ⛔ **Do not invent them.** The honest position: co-type it because it is more accurate
and costs nothing, but **expect nothing from it until there are genuine reviews**, which arrive
free once the game is on Steam. That moves item #11 in §13 down the list, not up.

`BreadcrumbList` is also supported and trivially earned, and it is worth adding to the
satellites alongside the co-typed block.

### 12.2 Meta description: still read, never promised, and not a ranking factor

> **"Snippets are primarily created from the page content itself. However, Google sometimes
> uses the meta description HTML element if it might give users a more accurate description
> of the page than content taken directly from the page."**
> — [Google, Control your snippets](https://developers.google.com/search/docs/appearance/snippet), accessed 2026-08-27

So it is CTR insurance, not ranking. **The real problem on this site is not description
quality, it is that the pages with no description also have almost no text.** FTW serves
1,378 characters of visible text and no `h1`; Jimothy's page serves three words before the
tap gate. When there is neither a description nor body text, Google has nothing to build a
snippet from at all.

### 12.3 AI Overviews and AI Mode: there is nothing to buy

> **"There are no additional requirements to appear in AI Overviews or AI Mode, nor other
> special optimizations necessary."**
> **"You don't need to create new machine readable files, AI text files, or markup to appear
> in these features."**
> **"There's also no special schema.org structured data that you need to add."**
> — [Google, AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), accessed 2026-08-27

These features draw from the regular search index. **For this site, "AI visibility" and "get
indexed at all" are the same project.** There is no separate lane and anyone selling one is
selling nothing.

### 12.4 `llms.txt`: skip it

`https://lucidwinds.com/llms.txt` returns 404. Leave it. Google's Gary Illyes said in July
2025 that Google does not support it and does not plan to, and John Mueller's advice was
"when an AI platform that brings you clients complains that it needs the file for your site,
then I'd recommend taking the time to create one". No major provider has committed to
reading it in production.

⚠️ **This one is genuinely contested** and a minority of practitioners report wins. I am
calling it because the burden of proof is not met, and because Google has published no doc
page for it, which is itself informative. Sources here are SECONDARY
([Search Engine Journal](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/),
accessed 2026-08-27); there is no first party Google statement to point at.

---

## 13. The revised order of work

§5 ordered the fixes by mechanical impact. Now that the live crawl and the keyword research
are in, the honest order changes, because two things outrank every tag on the site.

| # | Do this | Why it is here |
|---|---|---|
| **0** | **Resubmit the Steam store page.** | §11.1. It is not an SEO task and it is worth more than every SEO task on this page combined, because the demand curve is decaying |
| **1** | **Open Google Search Console, verify the domain, submit the sitemap.** | §10.6 could not be settled from outside. Everything below is guesswork until this is done |
| **2** | **301 `www` to the apex.** | §10.1. One server rule. The whole site currently exists twice |
| **3** | **Self referential canonical on every page.** | §3.3 and §10.2. Fixes the `www` duplicate, the `?v=` duplicate on 41 games, and the `/jimothy/` conflict, all at once |
| **4** | **Lift the FTW dev gate, or accept it is not a marketing target.** | §0 |
| **5** | **Retarget the Jimothy title and h1 to `jimothy game`.** | §11.1(a). The current title aims at a phrase with no demand |
| **6** | **Regenerate the sitemap** with `lastmod`, the 32 missing satellites, and all 68 `/play/` shells. | §3.4, §10.4, §9.1 |
| **7** | **Give FTW a head:** description, OG, canonical, fixed h1. | §6.3 |
| **8** | **Meta descriptions from the portal blurbs**, 95 of them scripted. | §3.5, §9.2 |
| **9** | **Give the 68 `/play/` shells an h1, a canonical, and 3 or 4 real sentences.** | §10.4 and §11.3. Cheapest real traffic on the site |
| **10** | **Visually hidden h1 on the 94 pages without one.** | §3.6 |
| **11** | **Co-type the JSON-LD and roll it to the satellites.** ⚠️ Accuracy only: it earns no rich result without a real rating or review. | §12.1 |
| **12** | **Look at the Cloudflare AI crawler setting once and decide.** | §4 |
| **13** | **Minify at deploy.** | §10.5. About 20% off the wire, zero source changes |
| **14** | `noindex` the six dev tools; alt text on the ten hero images. | §3.7, §3.8 |
| **15** | **The homepage's 24.5 second LCP.** | §1. Biggest true ranking factor, biggest job, its own project |

---

## 14. What I could not verify

- **Whether the site is indexed.** §10.6. Search Console only.
- **The `?v=` variants' actual index status.** They are indexable and uncanonicalised; whether
  Google has actually indexed any of them needs Search Console.
- **Real search volumes.** No paid tool. Everything in §11 is autocomplete presence or
  absence, which is directional evidence, not a number. Do not quote a volume from this doc,
  because there isn't one in it.
- **Whether `/jimothy/` or `/satellites/stream-hop/` currently holds any ranking.** Same
  reason.
- **Any first party Google statement on `llms.txt`.** None exists.
