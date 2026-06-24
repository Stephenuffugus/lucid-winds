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
    {id:'chopin-prelude-raindrop', title:'Prelude Op. 28 No. 15 “Raindrop”', artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%2015.mp3'}
  ];

  // Drawer section order. Cats not listed here append after, first-seen order.
  // Empty cats don't render — these are pre-stubbed for future batches.
  window.LW_TRACK_CATS = ['Originals','Classical','Ambient','Lo-fi','Nature'];
})();
