/* ════════════════════════════════════════════════════════════════════════
   SHARED SOUNDTRACK MANIFEST — single source of truth for BOTH the Lucid
   Winds app (index.html LW_MUSIC) and the Sky Wolf Studios portal
   (portal/index.html). Edit tracks HERE; both surfaces pick them up.

   Each entry: { id, title, artist, src, mood, cat }
     - src may be a LOCAL path (/assets/music/<id>.mp3 — bundled, offline) OR
       a full URL (streamed, needs network). The players treat them the same.
     - cat groups the track into a drawer section (see LW_TRACK_CATS order).

   ADD MUSIC:
     1. Append a line below with a cat.
     2. Bundled: commit the mp3 to /assets/music/ and use an absolute path.
        Streamed: VERIFY the license is CC0 / public-domain / commercial-OK CC
        (LW is monetized — never ship -NC / -ND / unverified), then confirm the
        URL serves audio:  curl -sIL "<url>"  → expect  200 / audio/mpeg.
     3. The Internet Archive Musopen collection is the go-to for public-domain
        classical recordings (composition PD ≠ recording PD — Musopen gives you
        cleared RECORDINGS). Find files via
        https://archive.org/metadata/<identifier> and check metadata.licenseurl.

   Loaded WITHOUT a ?v= stamp, so sw.js gives it a stale-while-revalidate rule
   (like word-banks.js): cached instantly, refreshed in the background, so a
   library update lands on the next load. index.html keeps a hardcoded fallback
   to the bundled original, so the app never loses its core music if this file
   fails to load offline.
   ════════════════════════════════════════════════════════════════════════ */
(function(){
  window.LW_TRACKS = [
    // ── ORIGINALS — Stephen's own music. Bundled (offline-safe). ──
    {id:'the-waiting-dojo', title:'The Waiting Dojo', artist:'Stephen', cat:'Originals', src:'/assets/music/the-waiting-dojo.mp3'},

    // ── CLASSICAL — public domain, streamed from Internet Archive (Musopen,
    //    CC0: archive.org/details/musopen-chopin, licenseurl=publicdomain/zero/1.0).
    //    All HEAD-verified 200 / audio/mpeg. ──
    {id:'chopin-noc-op9-2',        title:'Nocturne Op. 9 No. 2',            artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%209%20no.%202%20in%20E%20flat%20major.mp3'},
    {id:'chopin-noc-op15-1',       title:'Nocturne Op. 15 No. 1',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2015%20no.%201%20In%20F%20major.mp3'},
    {id:'chopin-noc-op27-1',       title:'Nocturne Op. 27 No. 1',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2027%20no.%201%20in%20C%20sharp%20minor.mp3'},
    {id:'chopin-ballade-1',        title:'Ballade No. 1, Op. 23',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Ballade%20no.%201%20-%20Op.%2023.mp3'},
    {id:'chopin-waltz-op64-2',     title:'Waltz Op. 64 No. 2',              artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Waltz%20Op.%2064%20no.%202%20in%20C%20sharp%20minor.mp3'},
    {id:'chopin-prelude-raindrop', title:'Prelude Op. 28 No. 15 “Raindrop”', artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%2015.mp3'},
    // 2026-06-24 library fill-out — all HEAD-verified 200/audio/mpeg, same CC0 collection.
    {id:'chopin-noc-op9-1',          title:'Nocturne Op. 9 No. 1',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/NocturneOp.9No.1InBFlatMinor.mp3'},
    {id:'chopin-noc-op48-1',         title:'Nocturne Op. 48 No. 1',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2048%20no.%201%20in%20C%20minor.mp3'},
    {id:'chopin-fantaisie-impromptu',title:'Fantaisie-Impromptu Op. 66',     artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Fantasie%20Impromptu%20Op.%2066.mp3'},
    {id:'chopin-impromptu-1',        title:'Impromptu No. 1, Op. 29',        artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Impromptu%20no.%201%20-%20Op.%2029.mp3'},
    {id:'chopin-waltz-op64-1',       title:'Waltz Op. 64 No. 1 “Minute”',    artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Waltz%20Op.%2064%20no.%201%20in%20D%20flat%20major.mp3'},
    {id:'chopin-waltz-op69-1',       title:'Waltz Op. 69 No. 1 (L’Adieu)',   artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Waltz%20Op.%2069%20no.%201%20in%20A%20flat%20major.mp3'},
    {id:'chopin-mazurka-op17-4',     title:'Mazurka Op. 17 No. 4',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Mazurka%20Op.%2017%20no.%204%20in%20A%20minor.mp3'},
    {id:'chopin-prelude-op28-6',     title:'Prelude Op. 28 No. 6',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%206.mp3'},
    {id:'chopin-polonaise-heroic',   title:'Polonaise Op. 53 “Heroic”',      artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/PolonaiseOp.53InAFlatMajorheroic.mp3'},
    // J.S. Bach — Kimiko Ishizaka's "Open Goldberg Variations" (CC0:
    // archive.org/details/OpenGoldbergVariations, licenseurl=publicdomain/zero/1.0).
    // HEAD-verified 200/audio/mpeg. The Aria + its da-capo return are the cozy anchors.
    {id:'bach-goldberg-aria', title:'Goldberg Variations — Aria', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/OpenGoldbergVariations/Kimiko%20Ishizaka%20-%20J.S.%20Bach-%20-Open-%20Goldberg%20Variations%2C%20BWV%20988%20%28Piano%29%20-%2001%20Aria.mp3'},
    {id:'bach-goldberg-var13', title:'Goldberg Var. 13', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/OpenGoldbergVariations/Kimiko%20Ishizaka%20-%20J.S.%20Bach-%20-Open-%20Goldberg%20Variations%2C%20BWV%20988%20%28Piano%29%20-%2014%20Variatio%2013%20a%202%20Clav..mp3'},
    {id:'bach-goldberg-var25', title:'Goldberg Var. 25 “Black Pearl”', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/OpenGoldbergVariations/KimikoIshizaka-J.s.Bach--open-GoldbergVariationsBwv988piano-26Variatio25A2Clav..mp3'},
    {id:'bach-goldberg-aria-dacapo', title:'Goldberg — Aria da Capo', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/OpenGoldbergVariations/KimikoIshizaka-J.s.Bach--open-GoldbergVariationsBwv988piano-31AriaDaCapoEFine.mp3'},
    // Debussy — clean modern CC0 Debussy doesn't reliably exist on the Archive
    // (the good recordings are copyrighted; the "CC0" modern uploads are
    // mislabeled rips). This is a GENUINE public-domain-by-age recording: a
    // documented 1944 performance by pianist Suzanne Gyr (78rpm heritage
    // collection), so it carries some vintage warmth. mood credits the player.
    {id:'debussy-fille-flaxen', title:'La Fille aux Cheveux de Lin', artist:'Claude Debussy', mood:'Suzanne Gyr · 1944', cat:'Classical', src:'https://archive.org/download/gyr-la-fille-aux-cheveux-de-lin-debussy/Gyr%20-%20La%20Fille%20aux%20cheveux%20de%20Lin%20%28Debussy%29.mp3'}
  ];

  // Drawer section order. Cats not listed here append after, first-seen order.
  // Empty cats don't render — these are pre-stubbed for future batches.
  window.LW_TRACK_CATS = ['Originals','Classical','Ambient','Lo-fi','Nature'];
})();
