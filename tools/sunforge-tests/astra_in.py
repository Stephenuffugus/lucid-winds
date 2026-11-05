#!/usr/bin/env python3
"""Astra's Sunforge pack v1 into the game folder (SUNFORGE_BUILD_PLAN.md step 1). Re runnable; overwrites what it made.

    python3 tools/sunforge-tests/astra_in.py [pack_dir]

Copies ONLY the runtime set into satellites/ring-stacker/assets/ (identity, core, cells, board, hud, fx, sharing,
fonts); never the store frames, previews or docs (they stay in the pack, /workspaces/sunforge-astra-v1/pack, and the
vault). Fonts are subset to Latin and written as woff2 (fontTools; OFL texts copied beside them). The app icons go
over icons/ (the manifest's names), the social card over og/card.jpg, the promo tile becomes the arcade thumb
portal-assets/thumbs/ring-stacker.png at 480 square (the name the portal already uses). The 18 one colour icons
become ONE inline svg sprite between the SF ICONS markers in index.html, plus our own 'sun' mark for the Sunbeam
lines (the same grammar: 24 unit box, 2 unit stroke, square caps, bevel joins)."""
import os, re, shutil, subprocess, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PACK = sys.argv[1] if len(sys.argv) > 1 else '/workspaces/sunforge-astra-v1/pack'
A = os.path.join(PACK, 'assets')
GAME = os.path.join(ROOT, 'satellites', 'ring-stacker')
OUT = os.path.join(GAME, 'assets')

COPY = {
  'identity': ['a_identity/first_frame.webp', 'a_identity/wordmark_on_dark.svg'],
  'core': ['b_core/core_states.png', 'b_core/core_corona.png', 'b_core/core_heat_shimmer.png'],
  'cells': ['c_cells_pieces/ring_faces_unmarked.png', 'c_cells_pieces/ring_marks_dark.png', 'c_cells_pieces/weld_trim_layers.png',
            'c_cells_pieces/falling_cell.png', 'c_cells_pieces/ghost_cell.png', 'c_cells_pieces/stick_flash.png',
            'c_cells_pieces/sliding_past_streak.png'],
  'board': ['d_board/play_plate.webp', 'd_board/grid_texture.png', 'd_board/void_edge.png', 'd_board/sky_clear_flash.png'],
  'hud': ['e_hud_controls/button_%s_%s.png' % (b, s) for b in ('left', 'right', 'rotate', 'down', 'hold', 'pause') for s in ('idle', 'pressed')]
       + ['e_hud_controls/%s.png' % n for n in ('next_frame', 'hold_frame', 'score_plaque', 'rings_counter', 'level_badge',
                                                 'slam_idle', 'slam_pressed', 'slam_charged', 'mode_journey', 'mode_daily_gyre', 'mode_zen',
                                                 'how_to_play_01', 'how_to_play_02', 'how_to_play_03', 'how_to_play_04')],
  'fx': ['f_fx/%s.png' % n for n in ('slam_shockwave', 'ring_crush_burst', 'void_swallow', 'inward_flow', 'quarter_turn_spin_01',
                                       'quarter_turn_spin_02', 'quarter_turn_spin_03', 'quarter_turn_spin_04', 'chain_x2', 'chain_x3',
                                       'chain_x4', 'chain_x5', 'chain_x6', 'level_up_plate', 'game_over_plate')],
  'sharing': ['g_results_sharing/%s.png' % n for n in ('game_over_card_frame', 'share_square', 'daily_gyre_card')],
}
ICONS = ['left', 'right', 'down', 'rotate', 'hold', 'pause', 'sound', 'music', 'ghost', 'settings', 'home', 'share', 'retry',
         'how_to_play', 'install', 'back']
# ours, in Astra's grammar: a disc with eight short rays (the Sunbeam mark)
SUN = ('<symbol id="i-sun" viewBox="0 0 24 24"><path d="M12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8 M12 2V4 M12 20V22 M2 12H4 M20 12H22 '
       'M4.9 4.9L6.3 6.3 M17.7 17.7L19.1 19.1 M4.9 19.1L6.3 17.7 M17.7 6.3L19.1 4.9" fill="none" stroke="currentColor" '
       'stroke-width="2" stroke-linecap="square" stroke-linejoin="bevel"/></symbol>')

def main():
    total = 0
    for sub, files in COPY.items():
        d = os.path.join(OUT, sub); os.makedirs(d, exist_ok=True)
        for rel in files:
            src = os.path.join(A, rel); dst = os.path.join(d, os.path.basename(rel))
            shutil.copyfile(src, dst); total += os.path.getsize(dst)
    # fonts: Latin subset as woff2 (both OFL); the variable Space Grotesk keeps its weight axis
    fd = os.path.join(OUT, 'fonts'); os.makedirs(fd, exist_ok=True)
    uni = 'U+0020-007E,U+00A0,U+00B7,U+00D7,U+2018,U+2019,U+201C,U+201D,U+2026'
    for src, dst in (('barlow_condensed_black.ttf', 'barlow-condensed-black.woff2'), ('space_grotesk_variable.ttf', 'space-grotesk.woff2')):
        subprocess.run([sys.executable, '-m', 'fontTools.subset', os.path.join(A, 'a_identity', 'fonts', src),
                        '--unicodes=' + uni, '--flavor=woff2', '--layout-features=kern,liga,tnum,pnum',
                        '--output-file=' + os.path.join(fd, dst)], check=True)
        total += os.path.getsize(os.path.join(fd, dst))
    for t in ('barlow_ofl.txt', 'space_grotesk_ofl.txt'):
        shutil.copyfile(os.path.join(A, 'a_identity', 'fonts', t), os.path.join(fd, t))
    # app icons over the manifest's names, the social card, the arcade thumb
    ic = os.path.join(GAME, 'icons')
    shutil.copyfile(os.path.join(A, 'a_identity', 'app_icon_192.png'), os.path.join(ic, 'icon-192.png'))
    shutil.copyfile(os.path.join(A, 'a_identity', 'app_icon_512.png'), os.path.join(ic, 'icon-512.png'))
    shutil.copyfile(os.path.join(A, 'a_identity', 'app_icon_maskable_512.png'), os.path.join(ic, 'icon-maskable-512.png'))
    shutil.copyfile(os.path.join(A, 'a_identity', 'social_card.jpg'), os.path.join(GAME, 'og', 'card.jpg'))
    thumb = Image.open(os.path.join(A, 'a_identity', 'promo_tile.jpg')).convert('RGB').resize((480, 480), Image.LANCZOS)
    thumb.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(
        os.path.join(ROOT, 'portal-assets', 'thumbs', 'ring-stacker.png'), optimize=True)
    # the one inline sprite
    syms = []
    for n in ICONS:
        svg = open(os.path.join(A, 'e_hud_controls', 'icon_%s.svg' % n)).read()
        vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
        inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', svg, flags=re.S).strip()
        syms.append('<symbol id="i-%s" viewBox="%s">%s</symbol>' % (n.replace('_', '-'), vb, inner))
    syms.append(SUN)
    sprite = ('<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
              + ''.join(syms) + '</svg>')
    page = os.path.join(GAME, 'index.html'); h = open(page).read()
    a, b = '<!-- SF ICONS (tools/sunforge-tests/astra_in.py writes this line) -->', '<!-- /SF ICONS -->'
    if a in h:
        i, j = h.index(a) + len(a), h.index(b)
        h = h[:i] + '\n' + sprite + '\n' + h[j:]
        open(page, 'w').write(h)
    else:
        print('no SF ICONS markers in index.html yet: sprite not written')
    print('assets: %d files, %d KB (fonts included); thumb %d KB; icons %d symbols' % (
        sum(len(v) for v in COPY.values()) + 2, total // 1024,
        os.path.getsize(os.path.join(ROOT, 'portal-assets', 'thumbs', 'ring-stacker.png')) // 1024, len(syms)))

main()
