/* ════════════════════════════════════════════════════════════════════
 * Sky Wolf Studios — Inline game copy: sokoban
 *
 * COPY of the inline GSK mount function from index.html
 * lines 68045-68364.
 *
 * DUPLICATE, NEVER MOVE. The original code in index.html is the
 * live source of truth for the in-LW play surface. This copy serves
 * the /play/sokoban.html shell only. To keep them aligned,
 * re-run scripts/extract_inline_games.js whenever index.html's
 * inline game block is edited.
 * ════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var G=window._G;
  var _e=G.e, _play=G.play, _playWin=G.playWin, _st=G.st, _xt=G.xt,
      ms=G.ms, mm=G.mm, mc=G.mc, sm=G.sm, sh=G.sh,
      _sr=G.sr, _gr=G.gr, _setDiff=G.setDiff,
      _solEnterFS=G.solEnterFS, _solClearFS=G.solClearFS, _solExitFS=G.solExitFS;
  window._gameFns=window._gameFns||{};

  function GSK(a){
    // ── TILE ART (PNG preferred, SVG fallback) ──
    // Drop PNGs in assets/games/sokoban/ to auto-reskin. See README.txt in that folder.
    var SVG={
      player:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#8B6B3D"/><ellipse cx="24" cy="22" rx="10" ry="9" fill="#e8a050"/><ellipse cx="24" cy="30" rx="8" ry="7" fill="#d4903a"/><polygon points="15,16 12,6 18,13" fill="#e8a050"/><polygon points="33,16 36,6 30,13" fill="#e8a050"/><polygon points="15,16 13,8 17,14" fill="#f0b870" opacity="0.6"/><polygon points="33,16 35,8 31,14" fill="#f0b870" opacity="0.6"/><circle cx="20" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="28" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="21" cy="19.5" r="0.8" fill="#fff"/><circle cx="29" cy="19.5" r="0.8" fill="#fff"/><ellipse cx="24" cy="24" rx="2" ry="1.2" fill="#d47a7a"/><line x1="10" y1="22" x2="4" y2="20" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="10" y1="24" x2="4" y2="25" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="38" y1="22" x2="44" y2="20" stroke="#e8a050" stroke-width="1" opacity="0.6"/><line x1="38" y1="24" x2="44" y2="25" stroke="#e8a050" stroke-width="1" opacity="0.6"/><ellipse cx="24" cy="40" rx="6" ry="2" fill="rgba(0,0,0,0.15)"/></svg>',
      crate:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#8B6B3D"/><circle cx="24" cy="24" r="12" fill="#7ab356"/><circle cx="24" cy="24" r="9" fill="#5a9a36"/><path d="M24 15 Q20 20 24 24 Q28 20 24 15Z" fill="#4a8a26"/><path d="M24 24 Q18 22 15 24 Q18 26 24 24Z" fill="#4a8a26"/><path d="M24 24 Q30 22 33 24 Q30 26 24 24Z" fill="#4a8a26"/><circle cx="24" cy="24" r="3" fill="#8BC34A" opacity="0.5"/></svg>',
      planted:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#c8a84b" opacity="0.25"/><rect x="4" y="4" width="40" height="40" rx="4" fill="none" stroke="#c8a84b" stroke-width="2.5"/><circle cx="24" cy="24" r="12" fill="#7ab356"/><circle cx="24" cy="24" r="9" fill="#5a9a36"/><path d="M24 15 Q20 20 24 24 Q28 20 24 15Z" fill="#4a8a26"/><circle cx="24" cy="24" r="3" fill="#c8a84b"/><circle cx="24" cy="24" r="14" fill="#c8a84b" opacity="0.08"/></svg>',
      target:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2A2018"/><ellipse cx="24" cy="26" rx="14" ry="10" fill="#3a2a1a"/><ellipse cx="24" cy="25" rx="12" ry="8" fill="#5C4033"/><ellipse cx="24" cy="24" rx="8" ry="5" fill="#6B4F2D"/><ellipse cx="24" cy="23.5" rx="4" ry="2.5" fill="#8B6B3D" opacity="0.5"/></svg>',
      wall:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2f4a24"/><rect x="6" y="6" width="36" height="36" rx="3" fill="#4a7c35" stroke="#5a8a3a" stroke-width="2"/></svg>',
      floor:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#6B4F2D"/><rect x="6" y="6" width="36" height="36" rx="3" fill="#8B6B3D"/></svg>',
      playerOnTarget:'<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="4" fill="#2A2018"/><ellipse cx="24" cy="26" rx="14" ry="10" fill="#3a2a1a"/><ellipse cx="24" cy="25" rx="12" ry="8" fill="#5C4033"/><ellipse cx="24" cy="22" rx="10" ry="9" fill="#e8a050"/><ellipse cx="24" cy="30" rx="8" ry="7" fill="#d4903a"/><polygon points="15,16 12,6 18,13" fill="#e8a050"/><polygon points="33,16 36,6 30,13" fill="#e8a050"/><circle cx="20" cy="20" r="2.5" fill="#2a1a0a"/><circle cx="28" cy="20" r="2.5" fill="#2a1a0a"/><ellipse cx="24" cy="24" rx="2" ry="1.2" fill="#d47a7a"/></svg>'
    };
    window._SKSVG=SVG;
    // Map logical tile key → PNG filename (kebab-case)
    var PNG={player:'player',crate:'crate',planted:'planted',target:'target',wall:'wall',floor:'floor',playerOnTarget:'player-on-target'};
    function tile(k){
      return '<img src="assets/games/sokoban/'+PNG[k]+'.png" alt="" draggable="false" '
        +'style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none" '
        +'onerror="this.onerror=null;this.outerHTML=window._SKSVG.'+k+'"/>';
    }
    var ART={
      player:tile('player'),crate:tile('crate'),planted:tile('planted'),
      target:tile('target'),wall:tile('wall'),floor:tile('floor'),
      playerOnTarget:tile('playerOnTarget')
    };
    // ── 170 LEVELS — Classic Microban + curated collections, all verified solvable ──
    var LEVELS=[
      /* 1. Microban */ {w:5,h:3,map:'#####'+'#@OX#'+'#####'},
      /* 2. ExtremelyEasy */ {w:5,h:3,map:'#####'+'#XO@#'+'#####'},
      /* 3. ExtremelyEasy */ {w:7,h:3,map:'#######'+'#XO@OX#'+'#######'},
      /* 4. Illustrative */ {w:6,h:6,map:'..####'+'..#..#'+'###..#'+'#+*O.#'+'#...##'+'#####.'},
      /* 5. Illustrative */ {w:7,h:8,map:'#####..'+'#...###'+'#.....#'+'#.#.#.#'+'#.#.#.#'+'#+O.#.#'+'#.....#'+'#######'},
      /* 6. Illustrative */ {w:8,h:7,map:'########'+'########'+'##.+O.##'+'##.##.##'+'##....##'+'########'+'########'},
      /* 7. Microban */ {w:6,h:7,map:'####..'+'#.X#..'+'#..###'+'#*@..#'+'#..O.#'+'#..###'+'####..'},
      /* 8. Microban */ {w:6,h:7,map:'#####.'+'#X..##'+'#@OO.#'+'##...#'+'.##..#'+'..##X#'+'...###'},
      /* 9. Microban */ {w:7,h:6,map:'#######'+'#.....#'+'#.#.#.#'+'#X.O*@#'+'#...###'+'#####..'},
      /* 10. Microban */ {w:7,h:6,map:'####...'+'#..####'+'#.X.X.#'+'#.OO#@#'+'##....#'+'.######'},
      /* 11. Microban */ {w:7,h:6,map:'#####..'+'#...###'+'#..O..#'+'##*.X.#'+'.#...@#'+'.######'},
      /* 12. Microban */ {w:7,h:7,map:'#######'+'#..*..#'+'#.....#'+'##.#.##'+'.#O@X#.'+'.#...#.'+'.#####.'},
      /* 13. Microban */ {w:7,h:7,map:'#.#####'+'..#...#'+'###OO@#'+'#...###'+'#.....#'+'#.X.X.#'+'#######'},
      /* 14. Microban */ {w:7,h:7,map:'######.'+'#...X#.'+'#.##.##'+'#..OO@#'+'#.#...#'+'#X..###'+'#####..'},
      /* 15. Microban */ {w:7,h:7,map:'#####..'+'#...#..'+'#.@.#..'+'#.OO###'+'##X.X.#'+'.#....#'+'.######'},
      /* 16. ExtremelyEasy */ {w:7,h:5,map:'..###..'+'..#X#..'+'###O###'+'#XO@OX#'+'#######'},
      /* 17. Illustrative */ {w:6,h:6,map:'######'+'#X+O.#'+'#O*..#'+'#....#'+'##..##'+'.####.'},
      /* 18. Microban */ {w:9,h:6,map:'..####...'+'###..####'+'#.....O.#'+'#.#..#O.#'+'#.X.X#@.#'+'#########'},
      /* 19. Microban */ {w:7,h:8,map:'.######'+'##....#'+'#..##.#'+'#.#.O.#'+'#..*.X#'+'##.#@##'+'.#...#.'+'.#####.'},
      /* 20. Microban */ {w:8,h:7,map:'####....'+'#..###..'+'#....###'+'#..O*@.#'+'###.X#.#'+'..#....#'+'..######'},
      /* 21. Microban */ {w:6,h:7,map:'######'+'#....#'+'#.#@.#'+'#.O*.#'+'#.X*.#'+'#....#'+'######'},
      /* 22. Microban */ {w:6,h:7,map:'#####.'+'#.@.#.'+'#XXX#.'+'#OOO##'+'#....#'+'#....#'+'######'},
      /* 23. Microban */ {w:6,h:7,map:'####..'+'#..###'+'#.OO.#'+'#XXX.#'+'#.@O.#'+'#...##'+'#####.'},
      /* 24. Microban */ {w:7,h:6,map:'.#####.'+'.#...#.'+'##...##'+'#.OOO.#'+'#.X+X.#'+'#######'},
      /* 25. Microban */ {w:6,h:7,map:'######'+'#XXX.#'+'#..O.#'+'#.#O##'+'#..O.#'+'#..@.#'+'######'},
      /* 26. Microban */ {w:8,h:6,map:'########'+'#......#'+'#.X**O@#'+'#......#'+'#####..#'+'....####'},
      /* 27. Microban */ {w:9,h:7,map:'.....###.'+'######@##'+'#....X*.#'+'#...#...#'+'#####O#.#'+'....#...#'+'....#####'},
      /* 28. Microban */ {w:7,h:9,map:'#######'+'#.....#'+'#X.X..#'+'#.##.##'+'#..O.#.'+'###O.#.'+'..#@.#.'+'..#..#.'+'..####.'},
      /* 29. Microban */ {w:7,h:9,map:'#####..'+'#...###'+'#X.X..#'+'#...#.#'+'##.#..#'+'.#@OO.#'+'.#....#'+'.#..###'+'.####..'},
      /* 30. Microban */ {w:6,h:8,map:'.#####'+'.#.@.#'+'.#...#'+'###O.#'+'#.XXX#'+'#.OO.#'+'###..#'+'..####'},
      /* 31. Microban */ {w:8,h:6,map:'#######.'+'#.....#.'+'#@OOO.##'+'#..#XXX#'+'##....##'+'.######.'},
      /* 32. Microban */ {w:8,h:8,map:'########'+'#...XX.#'+'#..@OO.#'+'#####.##'+'...#..#.'+'...#..#.'+'...#..#.'+'...####.'},
      /* 33. Microban */ {w:7,h:7,map:'.####..'+'.#..###'+'.#.OO.#'+'##XXX.#'+'#..@O.#'+'#...###'+'#####..'},
      /* 34. Microban */ {w:7,h:7,map:'..####.'+'.##..#.'+'##@OX##'+'#.OO..#'+'#.X.X.#'+'###...#'+'..#####'},
      /* 35. Microban */ {w:7,h:7,map:'.####..'+'##..###'+'#.....#'+'#X**O@#'+'#...###'+'##..#..'+'.####..'},
      /* 36. Microban */ {w:7,h:7,map:'#######'+'#X.#..#'+'#..O..#'+'#X.O#@#'+'#..O..#'+'#X.#..#'+'#######'},
      /* 37. Microban */ {w:7,h:7,map:'####...'+'#..####'+'#X*O..#'+'#.XO#.#'+'##.@..#'+'.#...##'+'.#####.'},
      /* 38. Microban */ {w:6,h:9,map:'.#####'+'.#...#'+'.#.X.#'+'##.*.#'+'#..*##'+'#..@##'+'##.O.#'+'.#...#'+'.#####'},
      /* 39. Microban */ {w:10,h:7,map:'..####....'+'###..#####'+'#..O..@XX#'+'#.O....#.#'+'###.####.#'+'..#......#'+'..########'},
      /* 40. Microban */ {w:7,h:8,map:'...####'+'...#..#'+'...#@.#'+'####OX#'+'#...OX#'+'#.#.OX#'+'#....##'+'######.'},
      /* 41. Microban */ {w:7,h:8,map:'#####..'+'#...##.'+'#.#..#.'+'#@O*X##'+'##..X.#'+'.#.O#.#'+'.##...#'+'..#####'},
      /* 42. Microban */ {w:9,h:8,map:'..######.'+'..#....#.'+'..#.##@##'+'###.#.O.#'+'#.XX#.O.#'+'#.......#'+'#..######'+'####.....'},
      /* 43. Microban */ {w:9,h:8,map:'#####....'+'#...##...'+'#.O..#...'+'##.O.####'+'.###@X..#'+'..#..X#.#'+'..#.....#'+'..#######'},
      /* 44. Microban */ {w:9,h:8,map:'#######..'+'#.....###'+'#..@OOXX#'+'####.##.#'+'..#.....#'+'..#..####'+'..#..#...'+'..####...'},
      /* 45. Microban */ {w:8,h:9,map:'..####..'+'..#..#..'+'..#@.#..'+'..#..#..'+'###.####'+'#....*.#'+'#..O...#'+'#####X.#'+'....####'},
      /* 46. Microban */ {w:10,h:6,map:'.#########'+'.#....#..#'+'##.O#O#..#'+'#..XOX@..#'+'#..X#....#'+'##########'},
      /* 47. Microban */ {w:11,h:7,map:'..#######..'+'###.....#..'+'#.O.O...#..'+'#.###.#####'+'#.@.X.X...#'+'#...###...#'+'#####.#####'},
      /* 48. Microban */ {w:7,h:9,map:'####...'+'#X.##..'+'#X@.#..'+'#X.O#..'+'##O.###'+'.#.O..#'+'.#....#'+'.#..###'+'.####..'},
      /* 49. Microban */ {w:6,h:8,map:'..####'+'###.@#'+'#..O.#'+'#..*X#'+'#..*X#'+'#..O.#'+'###..#'+'..####'},
      /* 50. Microban */ {w:8,h:8,map:'######..'+'#..@.#..'+'#..#.##.'+'#.X#..##'+'#.XOOO.#'+'#.X#...#'+'####...#'+'...#####'},
      /* 51. Microban */ {w:7,h:7,map:'.#####.'+'##X.X##'+'#.*.*.#'+'#..#..#'+'#.O.O.#'+'##.@.##'+'.#####.'},
      /* 52. Microban */ {w:8,h:8,map:'#####...'+'#...###.'+'#.X...##'+'##*#O..#'+'#.X#.O.#'+'#.@##.##'+'#.....#.'+'#######.'},
      /* 53. ExtremelyEasy */ {w:7,h:7,map:'..###..'+'..#X#..'+'###O###'+'#XO@OX#'+'###O###'+'..#X#..'+'..###..'},
      /* 54. Microban */ {w:10,h:8,map:'########..'+'#.@.#..#..'+'#......#..'+'#####O.#..'+'....#..###'+'.##.#O.XX#'+'.##.#..###'+'....####..'},
      /* 55. Microban */ {w:9,h:6,map:'..####...'+'###..####'+'#.......#'+'#@O***X.#'+'#.......#'+'#########'},
      /* 56. Microban */ {w:10,h:7,map:'##########'+'#........#'+'#.##X###.#'+'#.#.OO.X.#'+'#.X.@O##.#'+'#####....#'+'....######'},
      /* 57. Microban */ {w:10,h:7,map:'.####.....'+'.#..######'+'##....O..#'+'#.X#.O...#'+'#.X#O#####'+'#.X@.#....'+'######....'},
      /* 58. Microban */ {w:11,h:5,map:'###########'+'#....X##..#'+'#.OO@XXOO.#'+'#...##X...#'+'###########'},
      /* 59. Microban */ {w:8,h:7,map:'.#######'+'.#.....#'+'.#.XOX.#'+'##.O@O.#'+'#..XOX.#'+'#......#'+'########'},
      /* 60. Microban */ {w:12,h:6,map:'######.#####'+'#....###...#'+'#.OO.....#@#'+'#.O.#XXX...#'+'#...########'+'#####.......'},
      /* 61. Microban */ {w:9,h:8,map:'......###'+'#####.#X#'+'#...###X#'+'#...O.#X#'+'#.O..O..#'+'#####@#.#'+'....#...#'+'....#####'},
      /* 62. Microban */ {w:9,h:8,map:'#########'+'#.@.#...#'+'#.O.O...#'+'##O###.##'+'#..XXX..#'+'#...#...#'+'######..#'+'.....####'},
      /* 63. Microban */ {w:10,h:9,map:'#####.....'+'#...####..'+'#.#.#.X#..'+'#....O.###'+'###.#OX..#'+'#...#@...#'+'#.#.######'+'#...#.....'+'#####.....'},
      /* 64. Microban */ {w:8,h:8,map:'#######.'+'#.@#..#.'+'#XO...#.'+'#X.#.O##'+'#XO#...#'+'#X.#.O.#'+'#..#...#'+'########'},
      /* 65. Microban */ {w:8,h:8,map:'..#####.'+'..#.X.##'+'###.O..#'+'#.X.O#@#'+'#.#O.X.#'+'#..O.###'+'##.X.#..'+'.#####..'},
      /* 66. ExtremelyEasy */ {w:7,h:7,map:'.###...'+'.#X###.'+'##O#X#.'+'#XO@O##'+'###OOX#'+'..#X###'+'..###..'},
      /* 67. Microban */ {w:10,h:8,map:'.####.....'+'.#..####..'+'.#.....##.'+'##.##...#.'+'#X.X#.@O##'+'#...#.OO.#'+'#..X#....#'+'##########'},
      /* 68. Microban */ {w:8,h:10,map:'######..'+'#.@..#..'+'#.O#.#..'+'#.O..#..'+'#.O.##..'+'###.####'+'.#..#..#'+'.#XXX..#'+'.#.....#'+'.#######'},
      /* 69. Microban */ {w:8,h:10,map:'####....'+'#..#####'+'#.OO.O.#'+'#......#'+'##.##.##'+'#XXX#@#.'+'#.###.##'+'#......#'+'#..#...#'+'########'},
      /* 70. Microban */ {w:8,h:12,map:'..######'+'..#.XX@#'+'..#.OO.#'+'..##.###'+'...#.#..'+'...#.#..'+'####.#..'+'#....##.'+'#.#...#.'+'#...#.#.'+'###...#.'+'..#####.'},
      /* 71. Microban */ {w:9,h:9,map:'.....####'+'.....#.@#'+'.....#..#'+'######.X#'+'#...O..X#'+'#..OO#.X#'+'#....####'+'###..#...'+'..####...'},
      /* 72. Microban */ {w:9,h:9,map:'....#####'+'#####...#'+'#....O..#'+'#..O#O#@#'+'###.#...#'+'..#.XXX.#'+'..###..##'+'....#..#.'+'....####.'},
      /* 73. Microban */ {w:11,h:9,map:'.....#####.'+'.....#...##'+'.....#....#'+'.######...#'+'##.....#X.#'+'#.O.O.@..##'+'#.######X#.'+'#........#.'+'##########.'},
      /* 74. Microban */ {w:10,h:7,map:'.#######..'+'##.XXXX##.'+'#...######'+'#...O.O.@#'+'###..O.O.#'+'..###....#'+'....######'},
      /* 75. Microban */ {w:10,h:7,map:'.########.'+'.#..@...#.'+'.#.O..O.#.'+'###.##.###'+'#..OXXO..#'+'#...XX...#'+'##########'},
      /* 76. Microban */ {w:9,h:8,map:'....####.'+'..###..##'+'.##.O...#'+'##.O..#.#'+'#.@#OO..#'+'#.XX..###'+'#.XX###..'+'#####....'},
      /* 77. Microban */ {w:9,h:8,map:'.#######.'+'.#.....#.'+'##.###O##'+'#XO...@.#'+'#.XX.#O.#'+'#X##..O.#'+'#....####'+'######...'},
      /* 78. SeeminglyHard */ {w:13,h:9,map:'.###..####...'+'.#.####..#...'+'.#.O.....#...'+'.#.###...#...'+'##...###.####'+'#......@....#'+'#...##.#.##.#'+'#X####......#'+'###..########'},
      /* 79. Microban */ {w:11,h:8,map:'......#####'+'......#X..#'+'......#X#.#'+'#######X#.#'+'#.@.O.O.O.#'+'#.#.#.#.###'+'#.......#..'+'#########..'},
      /* 80. Microban */ {w:11,h:8,map:'####..####.'+'#..####..#.'+'#..#..#..#.'+'#..#....O##'+'#..X.X#O..#'+'#@.##.#.O.#'+'#...X.#...#'+'###########'},
      /* 81. Microban */ {w:6,h:10,map:'.####.'+'##..#.'+'#X.O#.'+'#XO.#.'+'#XO.#.'+'#XO.#.'+'#X.O##'+'#...@#'+'##...#'+'.#####'},
      /* 82. Microban */ {w:9,h:10,map:'..######.'+'..#....##'+'.##.##..#'+'.#.OO.#.#'+'.#.@O.#.#'+'.#....#.#'+'####.#..#'+'#..XXX.##'+'#.....##.'+'#######..'},
      /* 83. Microban */ {w:11,h:7,map:'##########.'+'#.@.XXXX.#.'+'#...####O##'+'##.#..O.O.#'+'.#.O......#'+'.#...######'+'.#####.....'},
      /* 84. Microban */ {w:7,h:11,map:'#####..'+'#...#..'+'#.X.#..'+'#X@X###'+'##X#..#'+'#..O..#'+'#.O...#'+'##OO..#'+'.#..###'+'.#..#..'+'.####..'},
      /* 85. Microban */ {w:11,h:7,map:'#######....'+'#.....#####'+'#.OO#@##XX#'+'#.#.......#'+'#..O.#.#..#'+'####.O..XX#'+'...########'},
      /* 86. Microban */ {w:13,h:6,map:'...##########'+'####....##..#'+'#..OOOXXXXO@#'+'#......###..#'+'#...####.####'+'#####........'},
      /* 87. ExtremelyEasy */ {w:7,h:7,map:'#####..'+'#@OX##.'+'##OOX##'+'.#XOOX#'+'.##XO##'+'..##X#.'+'...###.'},
      /* 88. Microban */ {w:8,h:10,map:'#####...'+'#.@.####'+'#......#'+'#.O.OO.#'+'##O##..#'+'#...####'+'#.XX..#.'+'##XX..#.'+'.###..#.'+'...####.'},
      /* 89. Microban */ {w:8,h:10,map:'######..'+'#....##.'+'#.O.O.##'+'##.OO..#'+'.#.#...#'+'.#.##.##'+'.#..X.X#'+'.#.@X.X#'+'.#..####'+'.####...'},
      /* 90. Microban */ {w:10,h:8,map:'####......'+'#.@###....'+'#X*..#####'+'#XX#OO.O.#'+'##.......#'+'.#.#.##..#'+'.#...#####'+'.#####....'},
      /* 91. Microban */ {w:9,h:9,map:'..######.'+'..#....#.'+'..#..O.#.'+'.####O.#.'+'##.O.O.#.'+'#XXXX#.##'+'#.....@.#'+'##..#...#'+'.########'},
      /* 92. Microban */ {w:9,h:9,map:'..####...'+'..#..#...'+'..#.O####'+'###X.X..#'+'#.O.#.O.#'+'#..X.X###'+'####O.#..'+'...#.@#..'+'...####..'},
      /* 93. Microban */ {w:9,h:9,map:'..####...'+'..#..#...'+'..#..####'+'###OXO..#'+'#..X@X..#'+'#..OXO###'+'####..#..'+'...#..#..'+'...####..'},
      /* 94. Microban */ {w:12,h:7,map:'#####..#####'+'#...####XX.#'+'#.OOO......#'+'#...O#..XX.#'+'###.@#..##.#'+'..#..##....#'+'..##########'},
      /* 95. Microban */ {w:10,h:7,map:'.....#####'+'...###...#'+'####XXXXX#'+'#.@OOOOO.#'+'#.....#.##'+'#####...#.'+'....#####.'},
      /* 96. Microban */ {w:7,h:8,map:'#######'+'#.....#'+'#.XOX.#'+'#.OXO.#'+'#.XOX.#'+'#.OXO.#'+'#..@..#'+'#######'},
      /* 97. Microban */ {w:13,h:9,map:'###########..'+'#.....#...###'+'#.O@O.#.X..X#'+'#.##.###.##.#'+'#.#.......#.#'+'#.#...#...#.#'+'#.#########.#'+'#...........#'+'#############'},
      /* 98. Microban */ {w:11,h:8,map:'.####......'+'.#..#######'+'.#O.@#...X#'+'##.#OO...X#'+'#..O..##XX#'+'#...#.#####'+'###...#....'+'..#####....'},
      /* 99. Microban */ {w:11,h:8,map:'###########'+'#XXXX#....#'+'#..#...OO.#'+'#..@..##..#'+'#.....##O.#'+'######..O.#'+'.....#....#'+'.....######'},
      /* 100. Microban */ {w:11,h:8,map:'..#########'+'###...#...#'+'#.*.O.X.X.#'+'#...O.##.##'+'####*#...#.'+'.#..@..###.'+'.#...###...'+'.#####.....'},
      /* 101. Microban */ {w:9,h:10,map:'########.'+'#......#.'+'#.####.#.'+'#.#XXX@#.'+'#.###O###'+'#.#.....#'+'#..OO.O.#'+'####...##'+'...#X###.'+'...###...'},
      /* 102. Microban */ {w:10,h:9,map:'.######...'+'##....#...'+'#...O.#...'+'#..OO.#...'+'###.X#####'+'..##X#.@.#'+'...#X..O.#'+'...#X.####'+'...####...'},
      /* 103. Microban */ {w:9,h:10,map:'.....####'+'######..#'+'#.......#'+'#..XXX.X#'+'##O######'+'#.O..#...'+'#...O###.'+'##..O..#.'+'.##.@..#.'+'..######.'},
      /* 104. Microban */ {w:10,h:9,map:'##########'+'#...##...#'+'#.O..O@#.#'+'####.#.O.#'+'...#X#..##'+'.#.#X#.O#.'+'.#.#X...#.'+'.#.#X...#.'+'...######.'},
      /* 105. Microban */ {w:10,h:9,map:'##.####...'+'####..####'+'.#.O.OX..#'+'##.#..XO.#'+'#...##X###'+'#..O..X.#.'+'#.@.#...#.'+'#..######.'+'####......'},
      /* 106. Microban */ {w:10,h:11,map:'..####....'+'.##..#####'+'.#..O..@.#'+'.#..O#...#'+'####.#####'+'#..#...#..'+'#....O.#..'+'#.XX#..#..'+'#..X####..'+'#..##.....'+'####......'},
      /* 107. Microban */ {w:10,h:11,map:'.#####....'+'##...#....'+'#....#####'+'#..#X#...#'+'#@.#X#.O.#'+'#..#X#..##'+'#....#..#.'+'##..##OO#.'+'.##.....#.'+'..#..####.'+'..####....'},
      /* 108. Microban */ {w:10,h:8,map:'.#######..'+'.#..X.X###'+'.#.X.X.X.#'+'###.####.#'+'#..@O..O.#'+'#..OO..O.#'+'####...###'+'...#####..'},
      /* 109. Microban */ {w:12,h:8,map:'......######'+'......#....#'+'..#####.X..#'+'###..###X..#'+'#.O..O..X.##'+'#.@OO.#.X.#.'+'##....#####.'+'.######.....'},
      /* 110. Illustrative */ {w:14,h:7,map:'.......####...'+'########..##..'+'#..........###'+'#.@OO.##...XX#'+'#.OO...##..XX#'+'#.........####'+'###########...'},
      /* 111. Microban */ {w:10,h:10,map:'.#########'+'.#.......#'+'##@#####.#'+'#..#...#.#'+'#..#...OX#'+'#..##O##X#'+'##O##..#X#'+'#...O..#X#'+'#...#..###'+'########..'},
      /* 112. Microban */ {w:10,h:10,map:'.#####....'+'##...##...'+'#..O..##..'+'#.O.O..##.'+'###O#.X.##'+'..#.#.X..#'+'.##.##X..#'+'.#.@..X.##'+'.#...#..#.'+'.########.'},
      /* 113. SeeminglyHard */ {w:13,h:10,map:'.#########...'+'.#..#....#...'+'.#.......#...'+'.#.##...####.'+'.#X#.O@O.#X#.'+'##.#....##.#.'+'#..######..##'+'#...........#'+'##.######..##'+'.###....####.'},
      /* 114. Microban */ {w:13,h:9,map:'############.'+'#..........#.'+'#.#######.@##'+'#.#.........#'+'#.#..O...#..#'+'#.OO.#####..#'+'###..#.#.XXX#'+'..####.#....#'+'.......######'},
      /* 115. Microban */ {w:11,h:8,map:'.#######...'+'##.....##..'+'#..O.O..#..'+'#.O.O.O.#..'+'##.###.####'+'.#@..XXXXX#'+'.##.....###'+'..#######..'},
      /* 116. Microban */ {w:11,h:8,map:'..#########'+'###.@.#...#'+'#.*.O.*XX.#'+'#...O.#...#'+'####*#..###'+'.#.....##..'+'.#...###...'+'.#####.....'},
      /* 117. Microban */ {w:13,h:8,map:'......#####..'+'......#...##.'+'......#.O..#.'+'########.#@##'+'#.X..#.O.O..#'+'#........O#.#'+'#XXX#####...#'+'#####...#####'},
      /* 118. Microban */ {w:12,h:10,map:'########....'+'#..XXX.#....'+'#..###.##...'+'#..#.O..#...'+'##.#@O..#...'+'.#.#.O..#...'+'.#.###.#####'+'.#.........#'+'.#...###...#'+'.#####.#####'},
      /* 119. Microban */ {w:10,h:9,map:'.########.'+'.#......#.'+'.#@...O.#.'+'##.###O.#.'+'#.XXXXX###'+'#.O.O.O..#'+'######.#.#'+'.....#...#'+'.....#####'},
      /* 120. Microban */ {w:12,h:10,map:'.......#####'+'########...#'+'#X...X..@#X#'+'#..###.....#'+'##.O..#....#'+'.#.O...#####'+'.#.O#..#....'+'.##.#..#....'+'..#...##....'+'..#####.....'},
      /* 121. Microban */ {w:11,h:11,map:'.......####'+'.#######..#'+'.#.O......#'+'.#...O.O..#'+'.#.########'+'##.#.X..#..'+'#..#.#..#..'+'#..@.X.##..'+'##.#.#.#...'+'.#...X.#...'+'.#######...'},
      /* 122. Microban */ {w:11,h:11,map:'..######...'+'..#....#...'+'..#....#...'+'#####..#...'+'#...#X#####'+'#...O@O...#'+'#####X#...#'+'...##.##.##'+'...#...OX#.'+'...#...###.'+'...#####...'},
      /* 123. Microban */ {w:10,h:11,map:'####......'+'#..#######'+'#..X.##.X#'+'#.O#....X#'+'##.##.#.X#'+'.#....#..#'+'.####.#..#'+'..#.@O.###'+'..#.OO.#..'+'..#....#..'+'..######..'},
      /* 124. Microban */ {w:9,h:14,map:'...###...'+'...#@#...'+'.###O###.'+'##..X..##'+'#..#.#..#'+'#.#...#.#'+'#.#...#.#'+'#.#...#.#'+'#..#.#..#'+'##.O.O.##'+'.##X.X##.'+'..#...#..'+'..#...#..'+'..#####..'},
      /* 125. Microban */ {w:12,h:8,map:'....#####...'+'#####...####'+'#.....#....#'+'#..#XXXXX..#'+'##..##.#.###'+'.#OO@OOO.#..'+'.#.....###..'+'.#######....'},
      /* 126. Microban */ {w:14,h:9,map:'##############'+'#......#.....#'+'#.O@OO.#.X.XX#'+'##.##.###.##.#'+'.#.#.......#.#'+'.#.#...#...#.#'+'.#.#########.#'+'.#...........#'+'.#############'},
      /* 127. SeeminglyHard */ {w:13,h:10,map:'.#########...'+'.#..#....#...'+'.#.......#...'+'.#.##.O.####.'+'.#X#.O@O.#X#.'+'##.#....##.#.'+'#..######..##'+'#.........X.#'+'##.######..##'+'.###....####.'},
      /* 128. Microban */ {w:11,h:12,map:'.....####..'+'.#.###..#..'+'.#.#....#..'+'.#.#..#.#..'+'.#.#O.#X#..'+'.#.#..#.#.#'+'.#.#O.#X#.#'+'...#..#.#.#'+'####O.#X#.#'+'#.@.....#.#'+'#...#..##.#'+'########...'},
      /* 129. Microban */ {w:12,h:10,map:'........####'+'#########..#'+'#...##.O...#'+'#..O...##..#'+'###.#X.X#.##'+'..#.#X.X#O##'+'..#.#...#..#'+'..#.@.O....#'+'..#..#######'+'..####......'},
      /* 130. Microban */ {w:10,h:9,map:'..########'+'..#..#.X.#'+'..#...X*X#'+'..#..#.*.#'+'####O##X##'+'#......O.#'+'#.O.##.O.#'+'#...@#...#'+'##########'},
      /* 131. Microban */ {w:10,h:12,map:'.####.....'+'##..###...'+'#@O...#...'+'###.O.#...'+'.#..######'+'.#..OXXXX#'+'.#..#.####'+'.##.#.#...'+'.#.O#.#...'+'.#....#...'+'.#..###...'+'.####.....'},
      /* 132. Microban */ {w:12,h:10,map:'...####.....'+'...#..#.....'+'.###..#.....'+'##..O.#.....'+'#...#.#.....'+'#.#OO.######'+'#.#...#...X#'+'#..O..@...X#'+'###..####XX#'+'..####..####'},
      /* 133. Laborious */ {w:9,h:10,map:'######...'+'######...'+'#....#...'+'#....##..'+'#..O*X##.'+'##.*@*.##'+'.##X*O..#'+'..##....#'+'...#....#'+'...######'},
      /* 134. Microban */ {w:11,h:11,map:'......####.'+'#######..#.'+'#.O......##'+'#.O#####..#'+'#..@#..#..#'+'##.##XX...#'+'#..#.XX####'+'#.O..###...'+'#.O###.....'+'#..#.......'+'####.......'},
      /* 135. Microban */ {w:8,h:8,map:'########'+'#@.....#'+'#.XOOX.#'+'#.OXXO.#'+'#.OXXO.#'+'#.XOOX.#'+'#......#'+'########'},
      /* 136. Microban */ {w:11,h:10,map:'.####.####.'+'.#..###..##'+'.#......@.#'+'##XX###...#'+'#......#..#'+'#XXX#O..#.#'+'#.##.OO.O.#'+'#..O....###'+'####..###..'+'...####....'},
      /* 137. Microban */ {w:14,h:9,map:'########.#####'+'#..#...###...#'+'#......##.O..#'+'#X#.@.##.O..##'+'#X#...#.O..##.'+'#X#....O..##..'+'#X.##.#####...'+'##....#.......'+'.######.......'},
      /* 138. ExtremelyEasy */ {w:9,h:9,map:'###......'+'#X##.....'+'#OX###...'+'#.O#X####'+'#XO.O.OX#'+'####@#O.#'+'...###XO#'+'.....##X#'+'......###'},
      /* 139. Microban */ {w:11,h:9,map:'######.....'+'#....###...'+'#..#.O.#...'+'#..O.@.#...'+'##.##.#####'+'#..#XXXXXX#'+'#.O.O.O.O.#'+'##...######'+'.#####.....'},
      /* 140. Microban */ {w:12,h:7,map:'.###########'+'##XXXXXXX..#'+'#.OOOOOOO@.#'+'#...#.#.#.##'+'#.#.#.....#.'+'#...#######.'+'#####.......'},
      /* 141. Microban */ {w:13,h:10,map:'.......####..'+'......##..###'+'####..#..O..#'+'#..####.O.O.#'+'#...XX#.#O..#'+'#..#...@..###'+'##.#XX#.###..'+'.#.##.#.#....'+'.#......#....'+'.########....'},
      /* 142. Illustrative */ {w:10,h:10,map:'#########.'+'#.......##'+'#........#'+'#.+*.#...#'+'#..**...##'+'#...**O.#.'+'#.....#.#.'+'#....#..#.'+'####...##.'+'...#####..'},
      /* 143. Microban */ {w:9,h:13,map:'..#######'+'#.#.....#'+'#.#.#.#.#'+'..#.@.O.#'+'###.###.#'+'#...###.#'+'#.O..##X#'+'##.O..#X#'+'.##.O..X#'+'#.##.O#X#'+'##.##.#X#'+'###.#...#'+'###.#####'},
      /* 144. Microban */ {w:11,h:11,map:'.######....'+'.#.X..#....'+'##OX#.#....'+'#..*..#....'+'#.XX###....'+'##O.#.#####'+'##.##.#...#'+'#..####.#.#'+'#...@.O.O.#'+'##..#.....#'+'.##########'},
      /* 145. Microban */ {w:9,h:12,map:'######...'+'#....####'+'#....XXX#'+'#....XXX#'+'######..#'+'..#..#..#'+'..#.OO.##'+'..#.@O..#'+'..#.OO..#'+'..##.O#.#'+'...#....#'+'...######'},
      /* 146. Microban */ {w:10,h:13,map:'.#####....'+'##...####.'+'#..OOO..#.'+'#.#...O.#.'+'#...O##.##'+'###..#X..#'+'..#..#...#'+'.#####.###'+'.#...#.##.'+'.#.@XXXX#.'+'.#......#.'+'.#...#..#.'+'.########.'},
      /* 147. Microban */ {w:11,h:12,map:'#####......'+'#...###....'+'#.#O..#....'+'#.O...#....'+'#.O.O.#....'+'#.O#..#....'+'#..@###....'+'##.########'+'#......XXX#'+'#.........#'+'########XX#'+'.......####'},
      /* 148. Microban */ {w:12,h:11,map:'..####......'+'###..#......'+'#....###....'+'#.#.X.X#....'+'#.@.XXX####.'+'#.#.#.#...##'+'#...#.OO...#'+'#####..O.O.#'+'....##O.#.##'+'.....#....#.'+'.....######.'},
      /* 149. ExtremelyEasy */ {w:9,h:10,map:'....###..'+'...##@#..'+'..##.O###'+'.##.OX#X#'+'##.OX#XO#'+'#.OX#XO.#'+'#.X#XO.##'+'#.##O.##.'+'#....##..'+'######...'},
      /* 150. Microban */ {w:14,h:10,map:'...####.......'+'...#..########'+'####.O.OXXXXX#'+'#...O...######'+'#@###.###.....'+'#..O..#.......'+'#.O.#.#.......'+'##.#..#.......'+'.#....#.......'+'.######.......'},
      /* 151. SeeminglyHard */ {w:14,h:12,map:'....#########.'+'...##.......##'+'..##..#####..#'+'..#..##...##.#'+'###.##..O..#.#'+'#......*+*X#.#'+'#.......#..#.#'+'#########.##.#'+'.....#...O...#'+'.....####.#.##'+'........#...#.'+'........#####.'},
      /* 152. Microban */ {w:8,h:8,map:'########'+'#......#'+'#.O***.#'+'#.*..*.#'+'#.*..*.#'+'#.***X.#'+'#.....@#'+'########'},
      /* 153. Microban */ {w:11,h:11,map:'.#########.'+'##...#...##'+'#....#....#'+'#..O.#.O..#'+'#...*X*...#'+'####X@X####'+'#...*X*...#'+'#..O.#.O..#'+'#....#....#'+'##...#...##'+'.#########.'},
      /* 154. Microban */ {w:11,h:11,map:'.####.####.'+'##..###..##'+'#...#.#...#'+'#..*X.X*..#'+'###O...O###'+'.#...@...#.'+'###O...O###'+'#..*X.X*..#'+'#...#.#...#'+'##..###..##'+'.####.####.'},
      /* 155. Microban */ {w:14,h:13,map:'...#####......'+'..##...#......'+'###..#.#......'+'#....X.#......'+'#..##.#####...'+'#..X.X.#..##..'+'#..#.@.O...###'+'#####X.#..O..#'+'....####..O..#'+'.......##.O.##'+'........#..##.'+'........#..#..'+'........####..'},
      /* 156. Microban */ {w:13,h:13,map:'..#####......'+'..#...#......'+'..#.#.#######'+'..#..*..#...#'+'..##.##...#.#'+'..#.....#*..#'+'###.#.#.#.###'+'#..*#O+...#..'+'#.#...##.##..'+'#...#..*..#..'+'#######.#.#..'+'......#...#..'+'......#####..'},
      /* 157. Microban */ {w:9,h:9,map:'.#######.'+'##..X..##'+'#.XOOOX.#'+'#.OX.XO.#'+'#XO.@.OX#'+'#.OX.XO.#'+'#.XOOOX.#'+'##..X..##'+'.#######.'},
      /* 158. Illustrative */ {w:13,h:12,map:'.######.#####'+'##X...###...#'+'#+*.....*...#'+'##..####**.##'+'.####..O.*..#'+'....#.##....#'+'....#..##...#'+'....#.#.O.###'+'....#...#.#..'+'....##....#..'+'.....###..#..'+'.......####..'},
      /* 159. Illustrative */ {w:12,h:12,map:'..######....'+'.##....#####'+'.#.....#...#'+'.#.****....#'+'.#....##..##'+'.#.....#.##.'+'.#.#####.#..'+'.#.....#.##.'+'##.....#..#.'+'#..***+#O.#.'+'#......#..#.'+'###########.'},
      /* 160. Illustrative */ {w:9,h:9,map:'#########'+'#.......#'+'#.OX.XO.#'+'#.**O*X.#'+'#..O+O..#'+'#..*O*X.#'+'#.*X.XO.#'+'#.......#'+'#########'},
      /* 161. ExtremelyEasy */ {w:12,h:12,map:'.......###..'+'......##@#..'+'#######.O#..'+'#....#.OX#..'+'#.##..OX####'+'#O.###X###X#'+'#XO.#####XO#'+'##XO...#XO.#'+'.##X##.#O.##'+'..####.#.##.'+'.....#...#..'+'.....#####..'},
      /* 162. Microban */ {w:13,h:10,map:'#############'+'#X#.@#..#...#'+'#X#OO...#.O.#'+'#X#..#.O#...#'+'#X#.O#..#.O##'+'#X#..#.O#..#.'+'#X#.O#..#.O#.'+'#XX..#.O...#.'+'#XX..#..#..#.'+'############.'},
      /* 163. Laborious */ {w:13,h:14,map:'#########....'+'.########....'+'.#......#....'+'.#.####.####.'+'.#.#..#.#..##'+'##.#...*....#'+'#..#....*...#'+'#.####.*+*..#'+'#.#.....*...#'+'#.#......*.##'+'#.#..####.##.'+'#.####...O#..'+'#......#..#..'+'###########..'},
      /* 164. Illustrative */ {w:10,h:13,map:'######....'+'#....#....'+'#.##.###..'+'#..#...##.'+'#..O*.X.##'+'#..X*O@X.#'+'#....OO..#'+'#..X*OXX.#'+'#..O*.*.##'+'#..#...##.'+'#.##.###..'+'#....#....'+'######....'},
      /* 165. Microban */ {w:11,h:11,map:'...#####...'+'...#.@.#...'+'..##...##..'+'###XOOOX###'+'#..OXXXO..#'+'#..OX#XO..#'+'#..OXXXO..#'+'###XOOOX###'+'..##...##..'+'...#...#...'+'...#####...'},
      /* 166. Illustrative */ {w:12,h:14,map:'....#####...'+'..###...####'+'..#...O....#'+'..#.##.###.#'+'..#.#.X..#.#'+'###.#....#.#'+'#...*...*#.#'+'#...**.**..#'+'####*...*#.#'+'..#......#.#'+'..#...+..#.#'+'..#..#O###.#'+'..#..#.....#'+'..##########'},
      /* 167. Laborious */ {w:12,h:14,map:'###########.'+'...########.'+'...#......#.'+'#####..##.#.'+'#....OO...#.'+'#..X**..#.#.'+'##.**..##.##'+'.#.....#...#'+'#####..#...#'+'#.....##.#.#'+'#..**......#'+'#.*+*.######'+'#.....#.....'+'#######.....'},
      /* 168. Illustrative */ {w:13,h:11,map:'...########..'+'####......##.'+'#..#.......#.'+'#..OOO.....#.'+'#...OX**...#.'+'###XXX@XXX###'+'.#...**XO...#'+'.#.....OOO..#'+'.#.......#..#'+'.##......####'+'..########...'},
      /* 169. Illustrative */ {w:12,h:13,map:'..########..'+'.##......#..'+'.#.......###'+'##.........#'+'#...#OO....#'+'#.OO..OO...#'+'##.OO..OO.##'+'.#..OO..OO#.'+'.##.X#X#X.##'+'.#.X.X.X.X.#'+'.#..X.+.X..#'+'.##X.X.X.X##'+'..#########.'},
      /* 170. Microban */ {w:12,h:12,map:'...####.....'+'.###..#####.'+'.#.OO.#...#.'+'.#.O.X.XOO##'+'.#.XX.#X.O.#'+'###.#**.X..#'+'#..X.**#.###'+'#.O.X#.XX.#.'+'##OOX@X.O.#.'+'.#...#.OO.#.'+'.#####..###.'+'.....####...'}
    ];
    function _skSparkle(){
      var rect=gd.getBoundingClientRect();var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      var colors=['#c8a84b','#7ab356','#e8a050','#f0b870','#fff','#d4903a'];
      for(var i=0;i<24;i++){
        var sp=document.createElement('div');
        var angle=Math.random()*Math.PI*2,dist=40+Math.random()*80,sz=4+Math.random()*6;
        var dx=Math.cos(angle)*dist,dy=Math.sin(angle)*dist;
        sp.style.cssText='position:fixed;left:'+(cx-sz/2)+'px;top:'+(cy-sz/2)+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+colors[i%colors.length]+';pointer-events:none;z-index:9999;opacity:1;transition:all 0.8s cubic-bezier(0.25,0.46,0.45,0.94);box-shadow:0 0 6px '+colors[i%colors.length];
        sp.setAttribute('data-sk-fx','1');document.body.appendChild(sp);
        setTimeout(function(s,x,y){s.style.transform='translate('+x+'px,'+y+'px) scale(0)';s.style.opacity='0'}.bind(null,sp,dx,dy),20);
        setTimeout(function(s){if(s.parentNode)s.remove()}.bind(null,sp),900);
      }
      var cat=document.createElement('div');
      cat.style.cssText='position:fixed;left:50%;top:'+cy+'px;transform:translate(-50%,-50%) scale(0);width:clamp(160px,45vw,220px);height:clamp(160px,45vw,220px);z-index:9998;pointer-events:none;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s;opacity:0';
      cat.innerHTML='<img src="assets/games/sokoban/player-on-target.png" style="width:100%;height:100%;object-fit:contain" alt="">';
      cat.setAttribute('data-sk-fx','1');document.body.appendChild(cat);
      setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(1)';cat.style.opacity='1'},30);
      // Second sparkle burst around the cat
      setTimeout(function(){
        for(var j=0;j<16;j++){var sp2=document.createElement('div');var a2=Math.random()*Math.PI*2,d2=60+Math.random()*100,sz2=3+Math.random()*5;sp2.style.cssText='position:fixed;left:'+((window.innerWidth/2)-sz2/2)+'px;top:'+(cy-sz2/2)+'px;width:'+sz2+'px;height:'+sz2+'px;border-radius:50%;background:'+colors[j%colors.length]+';pointer-events:none;z-index:9999;opacity:1;transition:all 1s ease-out;box-shadow:0 0 8px '+colors[j%colors.length];sp2.setAttribute('data-sk-fx','1');document.body.appendChild(sp2);setTimeout(function(s,x,y){s.style.transform='translate('+x+'px,'+y+'px) scale(0)';s.style.opacity='0'}.bind(null,sp2,Math.cos(a2)*d2,Math.sin(a2)*d2),20);setTimeout(function(s){if(s.parentNode)s.remove()}.bind(null,sp2),1100)}
      },400);
      setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(1.1) rotate(3deg)';},800);
      setTimeout(function(){cat.style.transform='translate(-50%,-50%) scale(0)';cat.style.opacity='0'},3600);
      setTimeout(function(){if(cat.parentNode)cat.remove()},4200);
    }
    function _skWinScreen(levelNum,mv){
      var old=document.getElementById('sk-win');if(old)old.remove();
      var ov=document.createElement('div');ov.id='sk-win';
      ov.style.cssText='position:fixed;inset:0;z-index:10000;background:rgba(8,10,6,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:boardFadeIn 0.4s ease';
      // Happy cat
      var catImg=document.createElement('img');
      catImg.src='assets/games/sokoban/player-on-target.png';
      catImg.style.cssText='width:clamp(180px,50vw,260px);height:clamp(180px,50vw,260px);object-fit:contain;animation:tierRevealPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;filter:drop-shadow(0 0 20px rgba(200,168,75,0.3))';
      ov.appendChild(catImg);
      // Text
      var txt=document.createElement('div');
      txt.style.cssText='font-family:Bebas Neue,sans-serif;font-size:clamp(1.4rem,5vw,2rem);color:var(--gold);letter-spacing:0.1em;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,0.5)';
      txt.textContent=levelNum==='ALL'?'ALL LEVELS COMPLETE!':'LEVEL '+levelNum+' COMPLETE!';
      ov.appendChild(txt);
      var sub=document.createElement('div');
      sub.style.cssText='font-family:DM Mono,monospace;font-size:clamp(0.5rem,1.5vw,0.7rem);color:var(--cream);opacity:0.7';
      sub.textContent=mv+' moves';
      ov.appendChild(sub);
      // Buttons
      var btns=document.createElement('div');
      btns.style.cssText='display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center';
      var nextBtn=document.createElement('button');
      nextBtn.className='gb';
      nextBtn.style.cssText='min-height:52px;min-width:140px;font-size:0.85rem;background:rgba(74,124,53,0.25);border-color:rgba(122,179,86,0.4);color:var(--sage)';
      nextBtn.textContent=levelNum==='ALL'?'⟳ PLAY AGAIN':'⏭️ NEXT LEVEL';
      nextBtn.onclick=function(){ov.remove();document.querySelectorAll('[data-sk-fx]').forEach(function(el){el.remove()});if(levelNum==='ALL'){lvl=0;localStorage.setItem('sk_lvl','0')}load();rn()};
      btns.appendChild(nextBtn);
      var pickBtn=document.createElement('button');
      pickBtn.className='gb';
      pickBtn.style.cssText='min-height:52px;min-width:140px;font-size:0.85rem';
      pickBtn.textContent='🎮 DIFFERENT GAME';
      pickBtn.onclick=function(){ov.remove();document.querySelectorAll('[data-sk-fx]').forEach(function(el){el.remove()});_openGamePicker()};
      btns.appendChild(pickBtn);
      ov.appendChild(btns);
      document.body.appendChild(ov);
      // Sparkles around the cat
      _skSparkle();
      setTimeout(_skSparkle,600);
    }
    var grid=[],origGrid=[],w=7,h=5,px=0,py=0,moves=0,lvl=parseInt(localStorage.getItem('sk_lvl')||'0',10);
    ms(a,'Level <strong id="SKl">1</strong> · Moves <strong id="SKm">0</strong>');mm(a);
    var gd=document.createElement('div');gd.className='skg';gd.id='SK';a.appendChild(gd);
    var _arsz='clamp(90px,26vw,130px)';
    var db=document.createElement('div');db.style.cssText='display:grid;grid-template-columns:auto auto auto;grid-template-rows:auto auto auto;width:fit-content;margin:-10px auto 0';
    var _abs='background:none;border:none;padding:0;margin:-15px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;width:'+_arsz+';height:'+_arsz+';position:relative;z-index:1';
    var _ais='width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none';
    db.innerHTML='<div></div><button style="'+_abs+'" onclick="_SKM(0,-1)"><img src="assets/games/arrow-up.png" style="'+_ais+'" alt="Up"></button><div></div>'
      +'<button style="'+_abs+'" onclick="_SKM(-1,0)"><img src="assets/games/arrow-left.png" style="'+_ais+'" alt="Left"></button><div></div>'
      +'<button style="'+_abs+'" onclick="_SKM(1,0)"><img src="assets/games/arrow-right.png" style="'+_ais+'" alt="Right"></button><div></div>'
      +'<button style="'+_abs+'" onclick="_SKM(0,1)"><img src="assets/games/arrow-down.png" style="'+_ais+'" alt="Down"></button><div></div>';
    a.appendChild(db);mc(a).innerHTML='<button class="gb" onclick="_SKU()">⬅️ Undo</button><button class="gb" onclick="_SKR()">↩️ Reset</button><button class="gb" onclick="_SKN()">⏭️ Next Level</button> <button class="gb" onclick="_SKjump()" style="font-size:0.7rem;">📋 Jump to Level</button>';
    var _skHist=[];
    // 0=floor,1=wall,2=crate,3=target,4=crate-on-target
    function load(){var L=LEVELS[lvl%LEVELS.length];w=L.w;h=L.h;grid=[];
      for(var i=0;i<L.map.length;i++){var c=L.map[i];if(c==='@'){grid.push(0);px=i%w;py=Math.floor(i/w)}else if(c==='+'){grid.push(3);px=i%w;py=Math.floor(i/w)}else if(c==='O'){grid.push(2)}else if(c==='*'){grid.push(4)}else if(c==='X'){grid.push(3)}else if(c==='#'){grid.push(1)}else grid.push(0)}
      origGrid=grid.slice();moves=0;document.getElementById('SKl').textContent=lvl+1;document.getElementById('SKm').textContent='0'}
    function rn(){gd.style.gridTemplateColumns='repeat('+w+',1fr)';gd.innerHTML='';
      for(var y=0;y<h;y++)for(var x=0;x<w;x++){var d=document.createElement('div');d.className='skc';d.style.overflow='hidden';
        var v=grid[y*w+x],isTarget=(v===3||v===4),isCrate=(v===2||v===4),isPlayer=(x===px&&y===py);
        if(v===1){d.innerHTML=ART.wall}
        else if(isPlayer&&isTarget){d.innerHTML=ART.target+ART.player;d.style.position='relative';d.querySelectorAll('img').forEach(function(im,idx){if(idx===0)im.style.cssText+='position:absolute;inset:0;opacity:0.4;';if(idx===1)im.style.cssText+='position:relative;z-index:2;'})}
        else if(isPlayer){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.player}
        else if(isCrate&&isTarget){d.innerHTML=ART.planted}
        else if(isCrate){d.style.background='rgba(26,31,23,.4)';d.innerHTML=ART.crate}
        else if(isTarget){d.innerHTML=ART.target}
        else{d.innerHTML=ART.floor}
        gd.appendChild(d)}
      document.getElementById('SKm').textContent=moves;
      var won=true;for(var i=0;i<grid.length;i++)if(grid[i]===3)won=false;
      if(won&&grid.some(function(v){return v===4})){
        _e('game_win');_sr('sokoban',{w:true,s:moves});
        if(lvl<LEVELS.length-1){_play('win');_skWinScreen(lvl+1,moves);lvl++;localStorage.setItem('sk_lvl',String(lvl))}
        else{_play('win');_skWinScreen('ALL',moves)}}}
    window._SKM=function(dx,dy){var nx=px+dx,ny=py+dy;if(nx<0||nx>=w||ny<0||ny>=h)return;var ni=ny*w+nx,nv=grid[ni];if(nv===1)return;
      // Snapshot for undo
      _skHist.push({g:grid.slice(),px:px,py:py,mv:moves});
      if(_skHist.length>200)_skHist.shift();
      if(nv===2||nv===4){var bx=nx+dx,by=ny+dy;if(bx<0||bx>=w||by<0||by>=h){_skHist.pop();return;}var bi=by*w+bx,bv=grid[bi];if(bv===1||bv===2||bv===4){_skHist.pop();return;}
        _play('drop');grid[ni]=(nv===4)?3:0;grid[bi]=(bv===3)?4:2;if(bv===3)_e('progress')}else{_play('tap')}
      px=nx;py=ny;moves++;rn()};
    window._SKU=function(){if(!_skHist.length){sm('Nothing to undo');return;}var s=_skHist.pop();grid=s.g;px=s.px;py=s.py;moves=s.mv;_play('tap');rn();};
    window._SKR=function(){_skHist=[];load();sm('Reset');rn()};
    window._SKN=function(){_skHist=[];lvl=(lvl+1)%LEVELS.length;localStorage.setItem('sk_lvl',String(lvl));load();sm('Level '+(lvl+1));rn();};
    window._SKjump=function(){
      var v=prompt('Jump to level (1-'+LEVELS.length+'):',String(lvl+1));
      if(v===null)return;
      var n=parseInt(v,10);
      if(isNaN(n)||n<1||n>LEVELS.length){sm('Invalid level, must be 1 to '+LEVELS.length);return;}
      _skHist=[];lvl=n-1;localStorage.setItem('sk_lvl',String(lvl));load();sm('Level '+(lvl+1));rn();
    };
    // Bind keydown only ONCE — was attaching a fresh listener every
    // time GSK was invoked (new game / tab revisit), stacking handlers.
    if(!window._skKeyBound){
      window._skKeyBound=true;
      document.addEventListener('keydown',function(e){var m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(m[e.key]&&_a==='sokoban'){e.preventDefault();_SKM(m[e.key][0],m[e.key][1]);}});
    }
    load();rn()}

  window._gameFns['sokoban']=GSK;
})();
