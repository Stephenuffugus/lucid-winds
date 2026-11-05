#!/usr/bin/env python3
"""Astra's Tomato Man packs into the game's art folder (TOMATO_MAN_BUILD_PLAN.md step 1, and the hero in step 2).
Re runnable; overwrites what it made.

    python3 tools/tomato-man-tests/astra_in.py

Source: /workspaces/tomato-man-astra-v1/pack-v1 (and pack-v2 for the hero's bearings in m2). Target: the clone
/workspaces/Tomato_Man/art/ (branch sunstruck; never satellites/tomato-man in lucid-winds, it is vendored). Only what the
engine draws: the levels use two caster kinds (R awnings and U umbrellas) plus carts and clouds, so the cabana,
billboard, palms, lifeguard tower, rock arch and cliff stay in the pack. Heavy PNGs become webp (opaque grounds lossy,
alpha art lossy with alpha); nine slices, marks and small UI stay as they are. The 23 one colour marks become ONE
inline svg sprite between the TM ICONS markers in index.html. Fonts: Bree Serif and Atkinson Hyperlegible from
google/fonts (OFL, fetched to /home/codespace/tm-drafts/fonts-src) subset to Latin woff2. The arcade thumb
(lucid-winds portal-assets/thumbs/tomato-man.png, 480 square) comes from Astra's promo tile. Store frames, previews and
docs never ship."""
import os, re, shutil, subprocess, sys
from PIL import Image

PACK = '/workspaces/tomato-man-astra-v1/pack-v1/assets'
GAME = '/workspaces/Tomato_Man'
ART = os.path.join(GAME, 'art')
ARCADE = '/workspaces/lucid-winds'
FONTS = '/home/codespace/tm-drafts/fonts-src'
WORLDS = ['morning_tide', 'midday_blaze', 'tide_pools', 'dunes_at_dusk', 'eclipse']
total = [0]

def out(rel):
    p = os.path.join(ART, rel); os.makedirs(os.path.dirname(p), exist_ok=True); return p
def copy(src, rel):
    shutil.copyfile(os.path.join(PACK, src), out(rel)); total[0] += os.path.getsize(out(rel))
def webp(src, rel, q=80, opaque=False, scale=1.0):
    """webp at the size the game draws it (scale), lossy; soft alpha effects compress badly as lossy webp, so the PNG is
    written instead (same name, .png) whenever it is smaller. Returns the path actually written, relative to art/."""
    im = Image.open(os.path.join(PACK, src)); im = im.convert('RGB' if opaque else 'RGBA')
    if scale != 1.0: im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    im.save(out(rel), 'WEBP', quality=q, method=6, alpha_quality=80)
    png = rel[:-5] + '.png'
    im.save(out(png), 'PNG', optimize=True)
    if os.path.getsize(out(png)) < os.path.getsize(out(rel)): os.remove(out(rel)); rel = png
    else: os.remove(out(png))
    total[0] += os.path.getsize(out(rel)); return rel

def main():
    # the sun (the angry states and the corona load only in the Eclipse world)
    webp('b_sun/roaming_sun.png', 'sun/roaming_sun.webp'); webp('b_sun/sun_rays.png', 'sun/sun_rays.webp')
    copy('b_sun/sun_position_hud.png', 'sun/sun_position_hud.png')
    for st in ('glare', 'wind_up', 'lunge', 'panting'): webp('b_sun/angry_sun_%s.png' % st, 'sun/angry_sun_%s.webp' % st)
    webp('b_sun/eclipse_corona.png', 'sun/eclipse_corona.webp', scale=0.5)
    # the five worlds: ground (opaque, lossy), horizon, decor sheet, the world card and key art
    for w in WORLDS:
        webp('c_worlds/%s_ground.png' % w, 'worlds/%s/ground.webp' % w, q=78, opaque=True)
        webp('c_worlds/%s_decor.png' % w, 'worlds/%s/decor.webp' % w, q=82)
        copy('c_worlds/%s_card.webp' % w, 'worlds/%s/card.webp' % w)
        copy('c_worlds/%s_key_art.webp' % w, 'worlds/%s/key_art.webp' % w)
    # the casters the engine draws
    for c in ('umbrella', 'cloud_platform', 'cloud_elevator'):
        webp('c_worlds/%s.png' % c, 'casters/%s.webp' % c, q=82)
    # her awning canopies fill only the middle of their frames: cropped to the art, so stretching it to an awning's
    # footprint makes the drawn canopy the same size as the solid one; her three cart pigments cut apart the same way
    def crop_alpha(im):
        bb = im.split()[3].point(lambda v: 255 if v > 24 else 0).getbbox(); return im.crop(bb)
    for c in ('striped_awning', 'solid_awning'):
        im = crop_alpha(Image.open(os.path.join(PACK, 'c_worlds', c + '.png')).convert('RGBA'))
        im.save(out('casters/%s.webp' % c), 'WEBP', quality=82, method=6, alpha_quality=88); total[0] += os.path.getsize(out('casters/%s.webp' % c))
    sheet = Image.open(os.path.join(PACK, 'c_worlds', 'vendor_cart_reskins.png')).convert('RGBA')
    for k, name in enumerate(('terracotta', 'slate', 'sage')):
        im = crop_alpha(sheet.crop((k * 512, 0, k * 512 + 512, 320)))
        im.save(out('casters/cart_%s.webp' % name), 'WEBP', quality=82, method=6, alpha_quality=88); total[0] += os.path.getsize(out('casters/cart_%s.webp' % name))
    copy('c_worlds/far_silhouette.png', 'casters/far_silhouette.png')
    # pickups and markers
    for k in ('aloe_lit', 'aloe_dim', 'popsicle', 'shade_pool', 'checkpoint_pair', 'exit_flag', 'seashell', 'ice_cream', 'gem', 'sparkle'):
        webp('d_pickups/%s.png' % k, 'pickups/%s.webp' % k, q=82)
    # effects
    # at the size they are drawn: the patch about 200 px across, the puffs and bursts under 100, the shimmer a strip
    for k, sc in (('hot_sand_patch', 0.5), ('heat_shimmer', 0.5), ('wind_streak', 1.0), ('collect_burst', 0.5), ('respawn_flash', 0.5),
                  ('burn_smoke', 0.5), ('dash_puff', 0.5), ('near_burn_vignette', 1.0), ('eclipse_dark_vignette', 1.0)):
        webp('e_fx/%s.png' % k, 'fx/%s.webp' % k, q=80, scale=sc)
    # the interface: wordmarks, the menu plate, buttons, joystick, meter, medals, progress marks, nine slices
    for k in ('logo_on_sand.svg', 'logo_on_dark.svg', 'menu_plate.webp', 'button_dash.svg', 'button_shade.svg', 'button_spf.svg',
              'button_ice.svg', 'disabled_overlay.svg', 'joystick_base.png', 'joystick_thumb.png', 'exposure_meter_frame.png',
              'exposure_fill.png', 'medal_gold.svg', 'medal_silver.svg', 'medal_bronze.svg', 'progress_star.png',
              'progress_shell.png', 'progress_cone.png', 'progress_gem.png', 'level_card_frame.png', 'shop_card_frame.png',
              'builder_frame_frame.png', 'coach_bubble_frame.png', 'toast_pill_frame.png', 'aloe_wallet_chip_frame.png'):
        copy('f_ui/' + k, 'ui/' + k)
    # the social card for link previews (og:image), as a JPG the crawlers all read
    Image.open(os.path.join(PACK, 'g_store', 'social_card.webp')).convert('RGB').save(out('social_card.jpg'), 'JPEG', quality=84, optimize=True)
    total[0] += os.path.getsize(out('social_card.jpg'))
    # the share frames (loaded only when a card is shared)
    webp('../../pack-v1/assets/g_store/result_square.png', 'sharing/result_square.webp', q=82)
    webp('../../pack-v1/assets/g_store/daily_card.png', 'sharing/daily_card.webp', q=82)
    # app icons over the manifest's names, the arcade thumb from the promo tile
    for src, dst in (('app_icon_192.png', 'icon-192.png'), ('app_icon_512.png', 'icon-512.png'), ('app_icon_maskable_512.png', 'icon-512-maskable.png')):
        shutil.copyfile(os.path.join(PACK, 'f_ui', src), os.path.join(GAME, dst))
    tile = Image.open(os.path.join(PACK, 'g_store', 'promo_tile.webp')).convert('RGB').resize((480, 480), Image.LANCZOS)
    tile.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(
        os.path.join(ARCADE, 'portal-assets', 'thumbs', 'tomato-man.png'), optimize=True)
    # fonts: Latin subsets as woff2, OFL beside them
    uni = 'U+0020-007E,U+00A0,U+00B7,U+00D7,U+2018,U+2019,U+201C,U+201D,U+2026'
    for src, dst in (('breeserif_BreeSerif-Regular.ttf', 'bree-serif.woff2'),
                     ('atkinsonhyperlegible_AtkinsonHyperlegible-Regular.ttf', 'atkinson-regular.woff2'),
                     ('atkinsonhyperlegible_AtkinsonHyperlegible-Bold.ttf', 'atkinson-bold.woff2')):
        subprocess.run([sys.executable, '-m', 'fontTools.subset', os.path.join(FONTS, src), '--unicodes=' + uni, '--flavor=woff2',
                        '--layout-features=kern,liga,tnum', '--output-file=' + out('fonts/' + dst)], check=True)
        total[0] += os.path.getsize(out('fonts/' + dst))
    shutil.copyfile(os.path.join(FONTS, 'breeserif_OFL.txt'), out('fonts/bree-serif-OFL.txt'))
    shutil.copyfile(os.path.join(FONTS, 'atkinsonhyperlegible_OFL.txt'), out('fonts/atkinson-hyperlegible-OFL.txt'))
    # THE HERO (step 2). The default tomato in v2's bearings: her neutral composite sheets (8 cells: idle, walk 1 to 4,
    # dash crouch, dash stretch, hop) at half size, 128 px cells, which is what a 64 px sprite needs on a 2x phone; the
    # three west bearings are her mirrored exports, so the game draws e, se and ne flipped instead of shipping them.
    V2 = '/workspaces/tomato-man-astra-v1/pack-v2/assets/a_hero'
    def half(src, rel, q=82):
        im = Image.open(src).convert('RGBA'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        im.save(out(rel), 'WEBP', quality=q, method=6, alpha_quality=85); total[0] += os.path.getsize(out(rel))
    for b in ('s', 'se', 'e', 'ne', 'n'): half(os.path.join(V2, 'tomato_%s_neutral.png' % b), 'hero/tomato_%s.webp' % b)
    for k in ('respawn', 'victory'): half(os.path.join(V2, 'tomato_%s_neutral.png' % k), 'hero/tomato_%s.webp' % k)
    half(os.path.join(PACK, 'a_hero', 'exposure_states.png'), 'hero/exposure_states.webp')
    PRODUCE = ['strawberry', 'orange', 'lemon', 'lime', 'peach', 'cherry', 'bell_pepper', 'eggplant', 'avocado', 'heirloom', 'pickle', 'golden', 'sunburn']
    for k in PRODUCE: half(os.path.join(PACK, 'a_hero', '%s_body.png' % k), 'hero/%s_body.webp' % k)
    half(os.path.join(PACK, 'a_hero', 'face_neutral.png'), 'hero/face_neutral.webp')
    HATS = ['sun_hat', 'ball_cap', 'tiny_sombrero', 'lettuce_cap', 'lifeguard_visor', 'umbrella_hat', 'sun_crown', 'shell_crown',
            'ice_cream_hat', 'cool_shades', 'gem_crown', 'eclipse_halo']
    for k in HATS:                       # four bearings s e n w in one 512x128 sheet each (v2)
        im = Image.open(os.path.join(V2, 'hat_%s_directions.png' % k)).convert('RGBA')
        im.save(out('hero/hats/%s.webp' % k), 'WEBP', quality=84, method=6, alpha_quality=90); total[0] += os.path.getsize(out('hero/hats/%s.webp' % k))
    for k in ('ember', 'cool', 'aloe', 'rainbow'): copy('a_hero/trail_%s.png' % k, 'hero/trails/%s.png' % k)
    # the builder (on demand): her headless body, the fourteen heads with their faces, the twelve hats at head scale
    for src, rel in [('builder_body.png', 'builder/body.webp'), ('tomato_head.png', 'builder/tomato_head.webp')] + \
                    [('%s_head.png' % k, 'builder/%s_head.webp' % k) for k in PRODUCE] + [('hat_%s.png' % k, 'builder/hats/%s.webp' % k) for k in HATS]:
        im = Image.open(os.path.join(PACK, 'a_hero', src)).convert('RGBA')
        if src == 'builder_body.png':    # her body file carries a stray second collar below the boots (rows 588 down)
            px = im.load()
            for yy in range(588, im.height):
                for xx in range(im.width): px[xx, yy] = (0, 0, 0, 0)
        im.save(out(rel), 'WEBP', quality=84, method=6, alpha_quality=90); total[0] += os.path.getsize(out(rel))
    # the hat anchors of every authored bearing and frame (manifest.animations sockets), written into the page
    import json
    m2 = json.load(open('/workspaces/tomato-man-astra-v1/pack-v2/manifest.json'))
    socks = {b: [sk['hat_anchor'] for sk in m2['animations'][b]['sockets']] for b in ('s', 'se', 'e', 'ne', 'n')}
    page0 = os.path.join(GAME, 'index.html'); h0 = open(page0).read()
    a0, b0 = '/* TM HERO SOCKETS (lucid-winds tools/tomato-man-tests/astra_in.py writes this line) */', '/* /TM HERO SOCKETS */'
    if a0 in h0:
        i0, j0 = h0.index(a0) + len(a0), h0.index(b0)
        h0 = h0[:i0] + '\nconst HAT_ANCHOR=' + json.dumps(socks, separators=(',', ':')) + ';\n' + h0[j0:]; open(page0, 'w').write(h0)
    else: print('no TM HERO SOCKETS markers yet: anchors not written')
    # the one inline sprite of her one colour marks
    syms = []
    for f in sorted(os.listdir(os.path.join(PACK, 'f_ui'))):
        if not f.endswith('_mark.svg'): continue
        svg = open(os.path.join(PACK, 'f_ui', f)).read()
        vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
        inner = re.sub(r'^.*?<svg[^>]*>|</svg>\s*$', '', svg, flags=re.S).strip()
        syms.append('<symbol id="tm-%s" viewBox="%s">%s</symbol>' % (f[:-9].replace('_', '-'), vb, inner))
    sprite = ('<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
              + ''.join(syms) + '</svg>')
    page = os.path.join(GAME, 'index.html'); h = open(page).read()
    a, b = '<!-- TM ICONS (lucid-winds tools/tomato-man-tests/astra_in.py writes this line) -->', '<!-- /TM ICONS -->'
    if a in h:
        i, j = h.index(a) + len(a), h.index(b); h = h[:i] + '\n' + sprite + '\n' + h[j:]; open(page, 'w').write(h)
    else: print('no TM ICONS markers in index.html yet: sprite not written')
    print('art: %d KB written (fonts included); %d marks in the sprite; thumb %d KB' % (
        total[0] // 1024, len(syms), os.path.getsize(os.path.join(ARCADE, 'portal-assets', 'thumbs', 'tomato-man.png')) // 1024))

main()
