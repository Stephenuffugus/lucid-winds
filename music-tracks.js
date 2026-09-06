/* ════════════════════════════════════════════════════════════════════════
   SHARED SOUNDTRACK MANIFEST — single source of truth for BOTH the Lucid
   Winds app (index.html LW_MUSIC) and the Sky Wolf Studio portal
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
    {id:'whispered-light',           title:'Whispered Light',             artist:'Stephen', cat:'Originals', src:'/assets/music/whispered-light.mp3'},
    {id:'whispered-light-variation', title:'Whispered Light (Variation)', artist:'Stephen', cat:'Originals', src:'/assets/music/whispered-light-variation.mp3'},
    {id:'whispered-leaves',          title:'Whispered Leaves',            artist:'Stephen', cat:'Originals', src:'/assets/music/whispered-leaves.mp3'},
    {id:'whispering-pines',          title:'Whispering Pines',            artist:'Stephen', cat:'Originals', src:'/assets/music/whispering-pines.mp3'},
    {id:'the-quiet-room',            title:'The Quiet Room',              artist:'Stephen', cat:'Originals', src:'/assets/music/the-quiet-room.mp3'},
    {id:'fog-over-the-harbor',       title:'Fog Over the Harbor',         artist:'Stephen', cat:'Originals', src:'/assets/music/fog-over-the-harbor.mp3'},
    {id:'fog-over-the-harbor-upbeat',title:'Fog Over the Harbor (Upbeat)',artist:'Stephen', cat:'Originals', src:'/assets/music/fog-over-the-harbor-upbeat.mp3'},
    // Jimothy theme — the rest of the Jimothy OST is unlocked by playing the game
    {id:'cartridge-moonwalk',        title:'Cartridge Moonwalk',          artist:'Stephen', cat:'Originals', src:'/assets/music/cartridge-moonwalk.mp3'},
    // 2026-09-02: the Lucid Winds theme, both takes, STREAMED from /music/v1/ (the private lucid-winds-music repo,
    // deployed by Hostinger). Not bundled, not in git. Stephen: "lucid winds theme goes in the apps originals yes".
    {id:'midnight-greenhouse',        title:'Midnight Greenhouse',         artist:'Stephen', cat:'Originals', src:'/music/v1/originals/midnight-greenhouse.mp3'},
    {id:'midnight-greenhouse-1',      title:'Greenhouse Before Dawn',       artist:'Stephen', cat:'Originals', src:'/music/v1/originals/midnight-greenhouse-1.mp3'},

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
    // Bach — Kimiko Ishizaka's "Open" Well-Tempered Clavier Book 1 (PD Mark:
    // archive.org/details/bach-well-tempered-clavier-book-1). Clean modern piano.
    {id:'bach-wtc-prelude-c', title:'WTC Prelude No. 1 in C, BWV 846', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2001%20Prelude%20No.%201%20in%20C%20major%2C%20BWV%20846.mp3'},
    {id:'bach-wtc-prelude-cmin', title:'WTC Prelude No. 2 in C minor', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2003%20Prelude%20No.%202%20in%20C%20minor%2C%20BWV%20847.mp3'},
    {id:'bach-wtc-prelude-ebmin', title:'WTC Prelude No. 8 in E♭ minor', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2015%20Prelude%20No.%208%20in%20E-flat%20minor%2C%20BWV%20853.mp3'},
    // 2026-06-24 expansion — more cozy instrumental, same verified CC0/PD collections, all HEAD-verified 200/audio-mpeg.
    {id:'chopin-noc-op9-3',    title:'Nocturne Op. 9 No. 3',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/NocturneOp.9No.3.mp3'},
    {id:'chopin-noc-op32-2',   title:'Nocturne Op. 32 No. 2',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2032%20no.%202%20in%20A%20flat%20major.mp3'},
    {id:'chopin-noc-op55-1',   title:'Nocturne Op. 55 No. 1',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2055%20no.%201%20in%20F%20minor.mp3'},
    {id:'chopin-noc-op62-2',   title:'Nocturne Op. 62 No. 2',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2062%20no.%202%20in%20E%20major.mp3'},
    {id:'chopin-ballade-3',    title:'Ballade No. 3, Op. 47',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Ballade%20no.%203%20-%20Op.%2047.mp3'},
    {id:'bach-wtc-prelude-dmin',  title:'WTC Prelude No. 6 in D minor',   artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2011%20Prelude%20No.%206%20in%20D%20minor%2C%20BWV%20851.mp3'},
    {id:'bach-wtc-prelude-bbmaj', title:'WTC Prelude No. 21 in B♭ major', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2041%20Prelude%20No.%2021%20in%20B-flat%20major%2C%20BWV%20866.mp3'},
    // 2026-06-24 batch 2 — more cozy Chopin preludes/nocturnes + gentle Bach preludes, all HEAD-verified 200/audio-mpeg.
    {id:'chopin-prelude-op28-7',  title:'Prelude Op. 28 No. 7',           artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%207.mp3'},
    {id:'chopin-prelude-op28-13', title:'Prelude Op. 28 No. 13',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%2013.mp3'},
    {id:'chopin-prelude-op28-17', title:'Prelude Op. 28 No. 17',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%2017.mp3'},
    {id:'chopin-prelude-op28-21', title:'Prelude Op. 28 No. 21',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Prelude%20Op.%2028%20no.%2021.mp3'},
    {id:'chopin-noc-op32-1',      title:'Nocturne Op. 32 No. 1',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/Nocturne%20Op.%2032%20no.%201%20in%20B%20major.mp3'},
    {id:'chopin-noc-op72-1',      title:'Nocturne Op. 72 No. 1',          artist:'Frédéric Chopin', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/musopen-chopin/NocturneOp.72No.1InEMinor.mp3'},
    {id:'bach-wtc-prelude-emaj',  title:'WTC Prelude No. 9 in E major',   artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2017%20Prelude%20No.%209%20in%20E%20major%2C%20BWV%20854.mp3'},
    {id:'bach-wtc-prelude-bmaj',  title:'WTC Prelude No. 23 in B major',  artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2045%20Prelude%20No.%2023%20in%20B%20major%2C%20BWV%20868.mp3'},
    // 2026-06-24 batch 3 — Bach fugues (Stephen asked). Same verified WTC collection, all HEAD-verified 200/audio-mpeg.
    // (Inventions, Paganini, Rachmaninoff: no clean CC0/PD recordings exist — good ones are copyrighted, PD-by-age ones are scratchy. Left out honestly.)
    {id:'bach-wtc-fugue-cmaj', title:'WTC Fugue No. 1 in C major',  artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2002%20Fugue%20No.%201%20in%20C%20major%2C%20BWV%20846.mp3'},
    {id:'bach-wtc-fugue-cmin', title:'WTC Fugue No. 2 in C minor',  artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2004%20Fugue%20No.%202%20in%20C%20minor%2C%20BWV%20847.mp3'},
    {id:'bach-wtc-fugue-gmin', title:'WTC Fugue No. 16 in G minor', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2032%20Fugue%20No.%2016%20in%20G%20minor%2C%20BWV%20861.mp3'},
    {id:'bach-wtc-fugue-bmin', title:'WTC Fugue No. 24 in B minor', artist:'J.S. Bach', mood:'Public Domain', cat:'Classical', src:'https://archive.org/download/bach-well-tempered-clavier-book-1/Kimiko%20Ishizaka%20-%20Bach-%20Well-Tempered%20Clavier%2C%20Book%201%20-%2048%20Fugue%20No.%2024%20in%20B%20minor%2C%20BWV%20869.mp3'}
    // Debussy (1944 Suzanne Gyr recording) REMOVED 2026-06-24: lovely piece, but
    // the vintage recording's volume sits far below everything else, so the jump
    // to it was jarring/uncomfortable. Pulled per Stephen. (If a clean, level-
    // matched public-domain Debussy turns up later, re-add it here.)
  ];

  // ── UNLOCKED IN GAMES — the cross-game reward shelf. Games write earned
  // tracks to localStorage 'sws_game_unlocks' ([{id,title,artist,src,game}]);
  // anything found there joins the library on the next load. Unlock a song in
  // Jimothy (or any future game), keep it in your studio player forever. ──
  /* ⛔⛔ THIS HAS TO BE RE-RUNNABLE. Stephen: "i unlocked all the songs in jimothy... and
     when i go back to the studios i dont have access to the songs from jimothy."

     Nothing was wrong with the data — the key, the shape and the paths were all correct
     and the songs were sitting in localStorage the whole time. The bug was that this
     folded them in exactly ONCE, when the script parsed. Leaving for a game and coming
     back returns you to a page restored from the back/forward cache, whose JavaScript
     never runs again, so the studio still had the track list it built before you played.
     Only a hard reload ever showed them.

     ⛔ It must PUSH INTO THE SAME ARRAY, never replace it: both players hold
     window.LW_TRACKS by reference and re-derive their groups on every render, so pushing
     makes a new song appear the moment the drawer is opened, with no reload at all. */
  /* Drawer section order. Cats not listed here append after, first-seen order.
     Empty cats don't render — these are pre-stubbed for future batches.
     Declared BEFORE foldGameUnlocks so the fold can register game sections. */
  window.LW_TRACK_CATS = ['Originals','Unlocked in Games','Classical','Ambient','Lo-fi','Nature'];

  /* PER-GAME SECTIONS (2026-07-25, Stephen). A game with its own soundtrack gets
     its own shelf named after the game, and those shelves sort ABOVE Originals —
     what you earned by playing is the thing you want to see first. Games without
     a `game` field still land in the generic 'Unlocked in Games' shelf. */
  function foldGameUnlocks(){
    try{
      var gu = JSON.parse(localStorage.getItem('sws_game_unlocks') || '[]');
      var have = {}; for (var hi = 0; hi < window.LW_TRACKS.length; hi++) have[window.LW_TRACKS[hi].id] = 1;
      var cats = window.LW_TRACK_CATS, top = 0;
      for (var gj = 0; gj < gu.length; gj++) { var gt = gu[gj];
        if (gt && gt.id && gt.src && !have[gt.id]) { have[gt.id] = 1;
          var cat = gt.game || 'Unlocked in Games';
          // register the game's shelf at the top of the order, once, in first-seen order
          if (cats.indexOf(cat) < 0) { cats.splice(top++, 0, cat); }
          window.LW_TRACKS.push({ id: gt.id, title: gt.title || gt.id, artist: gt.artist || 'Stephen',
            mood: gt.game ? ('unlocked in ' + gt.game) : null, cat: cat, src: gt.src }); } }
    } catch (e) {}
  }
  foldGameUnlocks();
  window.LW_FOLD_GAME_UNLOCKS = foldGameUnlocks;                 // hosts can call it directly
  try{
    // coming back from a game: bfcache restore (JS never re-runs), a tab regaining focus,
    // and an iframe-hosted game writing the key from another document
    window.addEventListener('pageshow', function(e){ if (e && e.persisted) foldGameUnlocks(); });
    window.addEventListener('focus', foldGameUnlocks);
    window.addEventListener('storage', function(e){ if (!e.key || e.key === 'sws_game_unlocks') foldGameUnlocks(); });
  } catch (e) {}

})();
