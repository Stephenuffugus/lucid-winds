#!/usr/bin/env python3
# forge3d/arena.py — the four stadiums and six launchers.
#
#   blender -b --factory-startup -P tools/forge3d/arena.py -- [--render]
#
# The dish is the SIM's dish, in millimetres: radius = K.arenaR x 1000
# (150 standard, 340 long range), the ridge crest at K.ridgeAt = 0.72 of
# the radius, the rail gutter beyond it where railDrag says friction
# drops, and — Chalk Ring only — K.pockets = 3 low points in the lip,
# built as lip dips, countable in the mesh. The Posts gets two posts,
# one per top. Floors sample the textures floors.py writes (or the
# painted ones that replace them at the same path).
#
# Launchers are seen only on the wind screen; 400 tris is the law. Every
# launcher shares one mount statement: a chuck ring, bayonet dia 22 like
# the blade boss, chuck face at origin, body growing up.
import bpy, bmesh, json, math, os, sys, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
spec_mod = importlib.util.spec_from_file_location('forgebuild', os.path.join(HERE, 'build.py'))
FB = importlib.util.module_from_spec(spec_mod); spec_mod.loader.exec_module(FB)
tube, washer, commit, new_obj, mat = FB.tube, FB.washer, FB.commit, FB.new_obj, FB.mat

SPEC = FB.SPEC
FLOORS = os.path.join(ROOT, 'assets', '3d', 'stadium', 'floors')
RIDGE_AT, POCKETS = 0.72, 3           # sim2 K.ridgeAt, K.pockets
STADIUMS = {
    'chalk_ring':  {'R': 150.0, 'pockets': POCKETS, 'posts': 0},
    'posts':       {'R': 150.0, 'pockets': 0, 'posts': 2},
    'taya_circle': {'R': 150.0, 'pockets': 0, 'posts': 0},
    'long_range':  {'R': 340.0, 'pockets': 0, 'posts': 0},
}
LAUNCHER_BUDGET = 400

def m_dish(name):
    m = mat('lw_dish_' + name, (1, 1, 1), 0.0, 0.9)
    nt = m.node_tree
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.join(FLOORS, name + '_albedo.png'))
    rgh = nt.nodes.new('ShaderNodeTexImage')
    rgh.image = bpy.data.images.load(os.path.join(FLOORS, name + '_rough.png'))
    rgh.image.colorspace_settings.name = 'Non-Color'
    b = nt.nodes['Principled BSDF']
    nt.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(rgh.outputs['Color'], b.inputs['Roughness'])
    return m

def build_stadium(name, cfg):
    R = cfg['R']
    # profile: (radius fraction, height mm) — bowl to ridge crest to rail
    # gutter to wall lip. Heights scale gently with R so long range is not
    # a cliff.
    hs = R / 150.0
    prof = [(0.0, 0.0), (0.30, 1.8 * hs), (0.55, 7.5 * hs),
            (RIDGE_AT, 13.5 * hs), (0.80, 10.5 * hs), (0.93, 12.0 * hs),
            (0.985, 30.0 * hs), (1.0, 30.0 * hs)]
    segs = 72
    ob = new_obj('stadium_' + name)
    bm = bmesh.new()
    rings = []
    for pi, (rf, z) in enumerate(prof):
        ring = []
        for i in range(segs):
            a = 2 * math.pi * i / segs
            zz = z
            if cfg['pockets'] and pi >= len(prof) - 2:
                # the pockets: low points in the LIP, a smooth dip per pocket
                for k in range(cfg['pockets']):
                    d = math.atan2(math.sin(a - 2*math.pi*k/cfg['pockets']),
                                   math.cos(a - 2*math.pi*k/cfg['pockets']))
                    if abs(d) < 0.30:
                        zz -= 14.0 * hs * (math.cos(d / 0.30 * math.pi) + 1) / 2
            ring.append(bm.verts.new((R*rf*math.cos(a), R*rf*math.sin(a), zz)))
        rings.append(ring)
    for pi in range(len(rings) - 1):
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((rings[pi][i], rings[pi][j],
                          rings[pi+1][j], rings[pi+1][i]))
    centre = bm.verts.new((0, 0, 0))
    for i in range(segs):
        j = (i + 1) % segs
        bm.faces.new((centre, rings[0][i], rings[0][j]))
    # outer skirt down to the ground plane
    for i in range(segs):
        j = (i + 1) % segs
        a0, a1 = 2*math.pi*i/segs, 2*math.pi*j/segs
        g0 = bm.verts.new((R*1.04*math.cos(a0), R*1.04*math.sin(a0), 0))
        g1 = bm.verts.new((R*1.04*math.cos(a1), R*1.04*math.sin(a1), 0))
        bm.faces.new((rings[-1][i], rings[-1][j], g1, g0))
    for k in range(cfg['posts']):                      # Uri: one post per top
        x = (0.45 * R) * (1 if k == 0 else -1)
        tube(bm, 11.0, 8.0 * hs, 42.0 * hs, n=16, cap0=False, cap1=True, cx=x, cy=0)
    commit(bm, ob)
    # planar UV over the dish so the floor texture lands where the chalk is
    uv = ob.data.uv_layers.new(name='floor')
    for loop in ob.data.loops:
        co = ob.data.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (co.x / (2*R) + 0.5, co.y / (2*R) + 0.5)
    dish = m_dish(name)
    rail = mat('lw_rail', (0.55, 0.57, 0.60), 1.0, 0.25)
    ob.data.materials.append(dish); ob.data.materials.append(rail)
    for po in ob.data.polygons:
        rr = math.hypot(po.center.x, po.center.y) / R
        po.material_index = 1 if rr > RIDGE_AT + 0.02 else 0
        po.use_smooth = True
    # the two support pieces the asset list orders
    sc = new_obj('shadow_catcher_' + name)
    b2 = bmesh.new()
    s = R * 1.4
    vv = [b2.verts.new(p) for p in ((-s,-s,-0.05), (s,-s,-0.05), (s,s,-0.05), (-s,s,-0.05))]
    b2.faces.new(vv); commit(b2, sc)
    sc.data.materials.append(mat('lw_shadowcatcher', (0.02, 0.02, 0.02), 0, 1))
    dc = new_obj('dust_card_' + name)
    b3 = bmesh.new()
    vv = [b3.verts.new(p) for p in ((-R*0.8, 0, 4), (R*0.8, 0, 4), (R*0.8, 0, R*0.5), (-R*0.8, 0, R*0.5))]
    b3.faces.new(vv); commit(b3, dc)
    md = mat('lw_dust_card', (0.75, 0.68, 0.55), 0, 1)
    md.blend_method = 'BLEND'
    md.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.05
    dc.data.materials.append(md)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    return [ob, sc, dc], tris

# ---------------------------------------------------------------- launchers
def box(bm, x0, x1, y0, y1, z0, z1):
    v = [bm.verts.new(p) for p in (
        (x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
        (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1))]
    for q in ((0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)):
        bm.faces.new(tuple(v[i] for i in q))

def chuck(bm):
    """The one mount statement every launcher shares: bayonet ring dia 22,
       chuck face at origin, body above."""
    washer(bm, [11.0] * 16, 8.6, 0.0, 4.0)

def l_cord(bm):
    tube(bm, 16, 4, 22, n=20)                          # drum
    tube(bm, 4, 10, 16, n=8, cx=19, cy=0)              # cord exit boss
    tube(bm, 6, 12, 15, n=8, cx=34, cy=0)              # pull tab
def l_ripcord(bm):
    tube(bm, 15, 4, 20, n=16)
    box(bm, 20, 66, -1.6, 1.6, 12.5, 15.5)             # the rack bar
    for x in (24, 34, 44, 54):                         # teeth standing on it
        box(bm, x, x + 5, -1.6, 1.6, 15.5, 18.0)
def l_winder(bm):
    tube(bm, 16, 4, 20, n=18)
    tube(bm, 2.6, 10, 14, n=6, cx=16, cy=0, r1=2.6)
    tube(bm, 2.6, 12, 12.1, n=6, cx=27, cy=0)          # arm plate
    tube(bm, 4.5, 12, 24, n=10, cx=27, cy=0)           # crank knob
def l_bat(bm):
    tube(bm, 13, 4, 14, n=16)
    tube(bm, 7, 14, 64, n=12, r1=11)                   # the club grip
    tube(bm, 12, 64, 70, n=12, r1=10)                  # pommel
def l_whip(bm):
    tube(bm, 14, 4, 18, n=16)
    for k in range(6):                                 # the tail, a falling arc
        t = k / 5.0
        tube(bm, 3.4 - t * 1.8, 18 + k * 7 - t*t*10, 25 + k * 7 - t*t*10, n=7,
             cx=14 + k * 9, cy=0)
def l_spool(bm):
    washer(bm, [19.0] * 12, 9.0, 6, 9)                 # bottom flange
    washer(bm, [19.0] * 12, 9.0, 21, 24)               # top flange
    tube(bm, 13.5, 9, 21, n=14)                        # wound cord drum
    tube(bm, 3.0, 12, 17, n=6, cx=19, cy=0, r1=2.2)    # cord tail, rooted in the flange

LAUNCHERS = {'cord': l_cord, 'ripcord': l_ripcord, 'winder': l_winder,
             'bat': l_bat, 'whip': l_whip, 'spool': l_spool}

def build_launcher(lid):
    ob = new_obj('launcher_' + lid)
    bm = bmesh.new()
    chuck(bm)
    LAUNCHERS[lid](bm)
    commit(bm, ob)
    steel = mat('lw_steel', (0.52, 0.54, 0.58), 1.0, 0.32)
    grip = mat('lw_grip', (0.16, 0.15, 0.17), 0.1, 0.8)
    cordm = mat('lw_cord', (0.72, 0.62, 0.42), 0.0, 0.7)
    ob.data.materials.append(steel); ob.data.materials.append(grip); ob.data.materials.append(cordm)
    for po in ob.data.polygons:
        po.use_smooth = True
        r = math.hypot(po.center.x, po.center.y)
        if lid == 'spool' and r < 14 and 9 < po.center.z < 21: po.material_index = 2
        elif po.center.z > 24: po.material_index = 1
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    return ob, tris

# ---------------------------------------------------------------- validation
def validate_stadium(name, cfg, ob):
    vs = ob.data.vertices
    R = cfg['R']
    rmax = max(math.hypot(v.co.x, v.co.y) for v in vs)
    c = {'dish radius = sim arenaR': (abs(rmax - R * 1.04) < 0.6, '%.1f' % rmax)}
    lip = [(math.atan2(v.co.y, v.co.x), v.co.z) for v in vs
           if math.hypot(v.co.x, v.co.y) > R * 0.975 and v.co.z > 1]
    if cfg['pockets']:
        zmax = max(z for _, z in lip)
        dips, inside = 0, False
        for a, z in sorted(lip):
            low = z < zmax - 6
            if low and not inside: dips += 1
            inside = low
        c['pockets countable in the lip'] = (dips == cfg['pockets'], '%d vs %d' % (dips, cfg['pockets']))
    if cfg['posts']:
        tall = set()
        for v in vs:
            if v.co.z > 25 and math.hypot(v.co.x, v.co.y) < R * 0.8:
                tall.add(1 if v.co.x > 0 else -1)
        c['two posts, one per top'] = (len(tall) == cfg['posts'], str(len(tall)))
    return c

def main():
    render = '--render' in sys.argv
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    report = []
    made = {}
    for name, cfg in STADIUMS.items():
        objs, tris = build_stadium(name, cfg)
        checks = validate_stadium(name, cfg, objs[0])
        report.append({'kind': 'stadium', 'id': name, 'tris': tris,
                       'checks': {k: {'ok': v[0], 'detail': v[1]} for k, v in checks.items()}})
        made[name] = objs
    for lid in LAUNCHERS:
        ob, tris = build_launcher(lid)
        report.append({'kind': 'launcher', 'id': lid, 'tris': tris,
                       'checks': {'within 400': {'ok': tris <= LAUNCHER_BUDGET, 'detail': str(tris)}}})
        made[lid] = [ob]
    for name, objs in made.items():
        d = os.path.join(ROOT, 'assets', '3d', 'stadium' if name in STADIUMS else 'launcher')
        os.makedirs(d, exist_ok=True)
        bpy.ops.object.select_all(action='DESELECT')
        for ob in objs: ob.select_set(True)
        bpy.ops.export_scene.gltf(filepath=os.path.join(d, name + '.glb'),
            use_selection=True, export_format='GLB', export_apply=True)
    if render:
        # one studio, resized per subject: the part studio blows a 45mm
        # launcher to white if it is scaled for a 300mm dish, and the
        # dish is a dark soup if it is not
        cam = FB.setup_render()
        FB.VIEWS['stadium'] = 34
        FB.VIEWS['launcher'] = 22
        base = {o.name: tuple(o.location) for o in bpy.context.collection.objects
                if o.name.startswith('sb_')}
        outd = os.path.join(HERE, 'renders')
        os.makedirs(outd, exist_ok=True)
        for name, objs in made.items():
            big = name in STADIUMS
            for o in bpy.context.collection.objects:
                if o.name.startswith('sb_'):
                    o.location = tuple(c * (5 if big else 1) for c in base[o.name])
                    o.scale = (3, 3, 3) if big else (1, 1, 1)
            # the dust card is an engine asset, not a beauty prop: edge-on
            # at 5% alpha it drew a hard band across the whole dish
            FB.render_part(objs[0], 'stadium' if big else 'launcher', cam,
                           os.path.join(outd, 'arena-' + name + '.png'))
    bad = [(r['id'], k) for r in report for k, v in r['checks'].items() if not v['ok']]
    json.dump(report, open(os.path.join(HERE, 'arena-report.json'), 'w'), indent=1)
    for pid, k in bad: print('  ARENA FAIL %s: %s' % (pid, k))
    print('arena: %d built (%d stadiums, %d launchers), %d failures'
          % (len(report), len(STADIUMS), len(LAUNCHERS), len(bad)))

main()
