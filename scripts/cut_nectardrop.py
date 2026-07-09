#!/usr/bin/env python3
"""Cut the 25 Nectar Drop sprite sheets into named game assets.

Two cell modes:
  - "cut"  : magenta #FF00FF knockout -> despill -> connected-component keep ->
             alpha trim (round portraits, blooms, balls, UI, bosses, fx, cosmetics).
  - "full" : full-bleed art (backgrounds, screens, splash). Grid-slice, crop any
             magenta gutter border, save opaque JPG.

Sheets are loaded one at a time (box is 8GB/no-swap). Outputs to a STAGING tree so
nothing touches the game until the montages are verified. Named exactly per the
prompt doc so the ART hook can address every asset.
"""
import sys, os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "satellites/nectar-drop/art-drop/Nectar Drop"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/tmp/claude-1000/-workspaces-lucid-winds/cf4698f0-458c-4ddb-bfd9-3e8b5e90ca7c/scratchpad/nd_cut"
only  = sys.argv[3] if len(sys.argv) > 3 else "all"

# ---- output sub-dir + target max long-edge per category ----------------------
def P(*a):
    p = os.path.join(OUT, *a); os.makedirs(os.path.dirname(p), exist_ok=True); return p

# 14-hero roster order (matches sheet8 portraits row-major)
HEROES = ["nectar_kid","clover_scout","marigold_mage","dewdrop_drifter","pollen_puff",
          "button_beetle","ribbon_moth","acorn_archer","sprout_bunny","lantern_snail",
          "firefly_pilot","thistle_hedgehog","starling_gardener","sky_wolf_pup"]
POWERS = ["bloom_burst","gold_rush","seed_split","wind_bend","sticky_silk","shield_dome",
          "time_petal","piercing_thorn","rainbow_chain","free_ball_magnet","score_lantern",
          "peg_swap","multi_pollen","boss_breaker"]
BIOMES = ["moonseed","honeyglass","poppy_lantern","dewdrop_marsh","velvet_moss","citrus_rooftop",
          "firefly_fern","rain_ribbon_lily","thistle_carnival","starfruit_orchard","frosted_clover","solar_marigold"]
BCOL = ["red","green","purple","blue"]
COSNAMES = ["roseglass","cloverfelt","goldbead","creampearl","skyconfetti","rainyblue","citruspaper",
            "thistlepurple","fireflyglow","frostmint","velvetmoss","starfruit","marigold","skywolf"]
BOSSES = ["bramble_bun","gilded_snail_baron","moth_mask_maestro","rainboot_frog_king",
          "velvet_mole_miner","citrus_crown_beetle","fern_foxfire","lilyloop_heron",
          "thistle_tumblehog","starfruit_sphinxcat","clover_yeti_mouse","marigold_sun_bear"]

def boss_cells(group):  # 4 bosses/sheet x (hero, defeated, nameplate)
    out = []
    for b in group:
        out += [("bosses/"+b+"_hero","cut",420), ("bosses/"+b+"_defeated","cut",420), ("bosses/"+b+"_nameplate","cut",320)]
    return out

# Each entry: (sheet, cols, rows, cells[])  where cells[i] = (relpath|None, mode, maxedge)
SHEETS = {
 "sheet1": (2,2,[("bg/world01","full",900),("bg/world02","full",900),("bg/world03","full",900),("bg/world04","full",900)]),
 "sheet2": (2,2,[("bg/world05","full",900),("bg/world06","full",900),("bg/world07","full",900),("bg/world08","full",900)]),
 "sheet3": (2,2,[("bg/world09","full",900),("bg/world10","full",900),("bg/world11","full",900),("bg/world12","full",900)]),
 "sheet4": (2,2,[("fg/world01","cut",900),("fg/world02","cut",900),("fg/world03","cut",900),("fg/world04","cut",900)]),
 "sheet5": (2,2,[("fg/world05","cut",900),("fg/world06","cut",900),("fg/world07","cut",900),("fg/world08","cut",900)]),
 "sheet6": (2,2,[("fg/world09","cut",900),("fg/world10","cut",900),("fg/world11","cut",900),("fg/world12","cut",900)]),
 "sheet7": (1,2,[("screens/title","full",900),("screens/worldmap","full",940)]),
 "sheet8": (4,4,[("portraits/"+h,"cut",300) for h in HEROES]+[None,None]),
 "sheet9": (4,7,[("silhouettes/"+h,"cut",240) for h in HEROES]+[("buddies/"+h,"cut",240) for h in HEROES]),
 "sheet10":(4,7,[("powers/vfx_"+p,"cut",320) for p in POWERS]+[("powers/icon_"+p,"cut",170) for p in POWERS]),
 "sheet11":(4,8,[
    ("core/ball_default","cut",120),("core/ball_buoyant","cut",120),("core/ball_spent","cut",120),("core/ball_child","cut",96),
    ("core/launcher_body","cut",240),("core/launcher_barrel","cut",240),("core/launcher_charge","cut",200),("core/launcher_recoil","cut",240),
    ("core/basket","cut",240),("core/catch_flash","cut",200),("core/bin_100","cut",180),("core/bin_250","cut",180),
    ("core/bin_500","cut",180),("core/bin_1000","cut",180),("core/bin_jackpot","cut",180),("core/bin_flash","cut",180),
    ("core/gutter","cut",520),("core/bloom_red","cut",150),("core/bloom_red_pop","cut",170),("core/bloom_green","cut",150),
    ("core/bloom_green_pop","cut",170),("core/bloom_purple","cut",150),("core/bloom_purple_pop","cut",170),("core/bloom_blue","cut",150),
    ("core/bloom_blue_pop","cut",170),("core/bloom_gold","cut",150),("core/bloom_gold_pop","cut",170),("core/bloom_cream","cut",150),
    ("core/bloom_cream_pop","cut",170),("core/bloom_armored","cut",170),("core/doomed_ring","cut",180),("core/shell_dome","cut",180),
 ]),
 "sheet12":(4,4,[("biome/"+BIOMES[r]+"_"+BCOL[c],"cut",140) for r in range(0,4) for c in range(4)]),
 "sheet13":(4,4,[("biome/"+BIOMES[r]+"_"+BCOL[c],"cut",140) for r in range(4,8) for c in range(4)]),
 "sheet14":(4,4,[("biome/"+BIOMES[r]+"_"+BCOL[c],"cut",140) for r in range(8,12) for c in range(4)]),
 "sheet15":(3,4,boss_cells(BOSSES[0:4])),
 "sheet16":(3,4,boss_cells(BOSSES[4:8])),
 "sheet17":(3,4,boss_cells(BOSSES[8:12])),
 "sheet18":(3,6,[(x,"cut",e) for x,e in [
    ("ui/hud_top_bar",520),("ui/hud_power_slot_empty",200),("ui/hud_power_slot_ready",200),("ui/hud_shot_counter",200),
    ("ui/score_meter_empty",520),("ui/score_meter_fill",520),("ui/combo_meter_empty",520),("ui/combo_meter_fill",520),
    ("ui/combo_peak_badge",220),("ui/nectar_coin_counter",220),("ui/map_panel",700),("ui/map_path",420),
    ("ui/node_locked",180),("ui/node_unlocked",180),("ui/node_current",180),("ui/node_cleared",180),
    ("ui/node_boss",180),("ui/node_secret",180)]]),
 "sheet19":(3,6,[(x,"cut",e) for x,e in [
    ("ui/star_empty",150),("ui/star_filled",150),("ui/star_perfect",150),("ui/reward_frame",300),
    ("ui/rules_card",520),("ui/rules_card_shoot",520),("ui/rules_card_bucket",520),("ui/rules_card_power",520),
    ("ui/rules_card_boss",520),("ui/wardrobe_panel",700),("ui/wardrobe_tab_balls",200),("ui/wardrobe_tab_trails",200),
    ("ui/wardrobe_tab_launchers",200),("ui/slot_empty",200),("ui/slot_owned",200),("ui/slot_locked",200),
    ("ui/win_panel",700),("ui/lose_panel",700)]]),
 "sheet20":(4,4,[(x,"cut",e) for x,e in [
    ("ui/pause_panel",520),("ui/settings_panel",520),("ui/btn_primary_up",360),("ui/btn_primary_down",360),
    ("ui/btn_secondary_up",360),("ui/btn_secondary_down",360),("ui/btn_disabled",360),("ui/btn_close",150),
    ("ui/btn_back",150),("ui/btn_next",150),("ui/btn_restart",150),("ui/btn_map",150),
    ("ui/btn_play",150),("ui/btn_shop",150),("ui/btn_claim",150),("ui/chip",150)]]),
 "sheet21":(4,7,[("fx/"+x,"cut",e) for x,e in [
    ("burst_ring_rose",240),("burst_ring_sage",240),("burst_ring_gold",240),("burst_ring_cream",240),
    ("spark_rose",180),("spark_sage",180),("spark_gold",180),("spark_cream",180),
    ("finale_flash",320),("finale_vignette",480),("confetti_round",160),("confetti_star",160),
    ("confetti_leaf",160),("confetti_ribbon",160),("wind_seed_small",120),("wind_seed_large",160),
    ("combo_aura_1",200),("combo_aura_2",220),("combo_aura_3",260),("trail_default",200),
    ("trail_sparkle_gold",200),("fog_puff_small",180),("fog_puff_large",260),("impact_star",180),
    ("ricochet_tick",120),("power_pickup_glow",200),("score_pop_bubble",200),("shake_dust",180)]]),
 # sheet22 is laid out 4x8 (NOT 4x7): balls = 3 full rows + a centred 2-ball row,
 # then trails = 3 full rows + a 2-trail row. Explicit None gaps keep alignment.
 "sheet22":(4,8,[
    ("cosmetics/ball_roseglass","cut",150),("cosmetics/ball_cloverfelt","cut",150),("cosmetics/ball_goldbead","cut",150),("cosmetics/ball_creampearl","cut",150),
    ("cosmetics/ball_skyconfetti","cut",150),("cosmetics/ball_rainyblue","cut",150),("cosmetics/ball_citruspaper","cut",150),("cosmetics/ball_thistlepurple","cut",150),
    ("cosmetics/ball_fireflyglow","cut",150),("cosmetics/ball_frostmint","cut",150),("cosmetics/ball_velvetmoss","cut",150),("cosmetics/ball_starfruit","cut",150),
    None,("cosmetics/ball_marigold","cut",150),("cosmetics/ball_skywolf","cut",150),None,
    ("cosmetics/trail_roseglass","cut",180),("cosmetics/trail_cloverfelt","cut",180),("cosmetics/trail_goldbead","cut",180),("cosmetics/trail_creampearl","cut",180),
    ("cosmetics/trail_skyconfetti","cut",180),("cosmetics/trail_rainyblue","cut",180),("cosmetics/trail_citruspaper","cut",180),("cosmetics/trail_thistlepurple","cut",180),
    ("cosmetics/trail_fireflyglow","cut",180),("cosmetics/trail_frostmint","cut",180),("cosmetics/trail_velvetmoss","cut",180),("cosmetics/trail_starfruit","cut",180),
    ("cosmetics/trail_marigold","cut",180),("cosmetics/trail_skywolf","cut",180),None,None]),
 "sheet23":(3,6,[("cosmetics/launcher_"+n,"cut",240) for n in COSNAMES]+[
    ("cosmetics/prestige_ball","cut",150),("cosmetics/prestige_trail","cut",180),
    ("cosmetics/prestige_launcher","cut",240),("cosmetics/prestige_badge","cut",220)]),
 "sheet24":(5,5,[("ach/"+x,"cut",160) for x in [
    "first_drop","perfect_clear","no_bucket_win","five_combo","ten_combo","first_boss","three_bosses",
    "all_bosses","world_one_clear","world_six_clear","world_twelve_clear","first_wardrobe","half_wardrobe",
    "full_wardrobe","trail_collector","launcher_collector","ball_collector","daily_win","lucky_bounce",
    "long_shot","bank_master","power_user","no_power_win","score_million","locked"]]),
 "sheet25":(2,4,[
    ("brand/logo","cut",520),("brand/skywolf_mark","cut",360),
    ("brand/splash","full",900),("brand/title_art","full",900),
    ("brand/app_icon","cut",512),("brand/app_icon_round","cut",512),
    ("brand/loader_spinner","cut",300),("brand/loader_tip","cut",420)]),
}

def sample_key(a):
    """Sample the flat magenta key from the sheet's most-magenta corner.
    Returns (R,G,B) float or None (full-bleed sheets have no key corner)."""
    H,W = a.shape[:2]; s=10
    cands=[a[0:s,0:s], a[0:s,W-s:W], a[H-s:H,0:s], a[H-s:H,W-s:W]]
    best=None
    for c in cands:
        m = c.reshape(-1,3).astype(float).mean(0)
        if m[0]>150 and m[2]>150 and m[1]<90:
            if best is None or m[1] < best[1]: best=m   # lowest green = purest key
    return best

def magenta_mask(a, key=None):
    """Background = pixels within colour distance of the flat magenta KEY. This
    keeps saturated-purple content (purple blooms sit >130 from the ~(247,5,247)
    key) while cleanly removing the field AND ring-sprite centres. Falls back to a
    hue test only when no key corner was found."""
    R,G,B = a[:,:,0].astype(np.float32), a[:,:,1].astype(np.float32), a[:,:,2].astype(np.float32)
    if key is not None:
        d = np.sqrt((R-key[0])**2 + (G-key[1])**2 + (B-key[2])**2)
        return d < 100.0
    hue = (R > G+24) & (B > G+24)
    return hue & (np.minimum(R,B) > 150) & (G < 85)

def despill(a):
    Rf,Gf,Bf = a[:,:,0].astype(np.int16), a[:,:,1].astype(np.int16), a[:,:,2].astype(np.int16)
    lean = ((Rf+Bf)//2 - Gf) > 30
    Rf2 = np.where(lean, np.minimum(Rf, Gf+40), Rf)
    Bf2 = np.where(lean, np.minimum(Bf, Gf+40), Bf)
    return np.dstack([Rf2, Gf, Bf2]).astype(np.uint8)

def fit(im, maxedge):
    w,h = im.size; m = max(w,h)
    if m > maxedge:
        r = maxedge/m; im = im.resize((max(1,int(w*r)), max(1,int(h*r))), Image.LANCZOS)
    return im

def save_png(im, path, maxedge):
    p = P(path+".png"); e = maxedge
    for _ in range(6):
        fit(im, e).save(p, optimize=True)
        if os.path.getsize(p) <= 150*1024 or e < 90: break
        e = int(e*0.82)
    return p

def save_jpg(im, path, maxedge):
    base = im.convert("RGB"); p = P(path+".jpg"); e = maxedge
    for _ in range(6):
        cur = fit(base, e); q = 86; cur.save(p, quality=q)
        while os.path.getsize(p) > 150*1024 and q > 50:
            q -= 6; cur.save(p, quality=q)
        if os.path.getsize(p) <= 150*1024 or e < 500: break
        e = int(e*0.85)
    return p, q

def cut_cell(cell, path, maxedge, key):
    ch,cw = cell.shape[:2]
    fg = ~magenta_mask(cell, key)
    fg = ndi.binary_opening(fg, iterations=1)
    fg = ndi.binary_erosion(fg, iterations=1)      # eat magenta fringe
    fg = ndi.binary_closing(fg, iterations=2)      # re-close interior holes
    lbl,n = ndi.label(fg)
    if n==0: print("   EMPTY",path); return None
    sizes = ndi.sum(np.ones_like(lbl), lbl, range(1,n+1))
    biggest = sizes.max()
    keep = np.zeros_like(fg)
    for i in range(1,n+1):
        if sizes[i-1] >= max(40, biggest*0.02): keep |= (lbl==i)
    if not keep.any(): print("   NOISE",path); return None
    m = ndi.binary_dilation(keep, iterations=1)
    ys,xs = np.where(m)
    y0,y1,x0,x1 = ys.min(),ys.max()+1,xs.min(),xs.max()+1
    pad=4
    y0,x0 = max(0,y0-pad),max(0,x0-pad); y1,x1=min(ch,y1+pad),min(cw,x1+pad)
    rgb = despill(cell)[y0:y1,x0:x1]
    alpha = ndi.gaussian_filter((m[y0:y1,x0:x1].astype(np.uint8))*255, 0.6)
    out = np.dstack([rgb,alpha]).astype(np.uint8)
    save_png(Image.fromarray(out,"RGBA"), path, maxedge)
    return (x1-x0, y1-y0)

def crop_gutter(cell, key):
    """Trim magenta gutter rows/cols from a full-bleed cell edge-in."""
    a = cell; H,W = a.shape[:2]
    mg = magenta_mask(a, key)
    def frac_row(r): return mg[r,:].mean()
    def frac_col(c): return mg[:,c].mean()
    t=0; b=H; l=0; r=W
    while t<b-4 and frac_row(t)>0.6: t+=1
    while b>t+4 and frac_row(b-1)>0.6: b-=1
    while l<r-4 and frac_col(l)>0.6: l+=1
    while r>l+4 and frac_col(r-1)>0.6: r-=1
    return a[t:b, l:r]

def process(sheet):
    cols,rows,cells = SHEETS[sheet]
    im = Image.open(os.path.join(SRC, sheet+".png")).convert("RGB")
    a = np.asarray(im); H,W = a.shape[:2]
    key = sample_key(a)
    cw,chh = W/cols, H/rows
    ok=0
    for idx,spec in enumerate(cells):
        if spec is None: continue
        path,mode,maxedge = spec
        rr,cc = idx//cols, idx%cols
        y0,y1 = int(round(rr*chh)), int(round((rr+1)*chh))
        x0,x1 = int(round(cc*cw)), int(round((cc+1)*cw))
        cell = a[y0:y1, x0:x1]
        if mode=="full":
            cell = crop_gutter(cell, key)
            _,q = save_jpg(Image.fromarray(cell), path, maxedge)
            print("  %-28s full %dx%d"%(path, cell.shape[1], cell.shape[0])); ok+=1
        else:
            r = cut_cell(cell, path, maxedge, key)
            if r: print("  %-28s %dx%d"%(path, r[0], r[1])); ok+=1
    print("%s: %d assets"%(sheet, ok))

todo = list(SHEETS.keys()) if only=="all" else [only]
for s in todo: process(s)
print("DONE ->", OUT)
