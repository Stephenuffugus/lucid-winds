#!/usr/bin/env python3
# forge3d/build.py — builds the real RIPCORD part meshes in Blender.
#
#   blender -b --factory-startup -P tools/forge3d/build.py -- \
#       [--slots assist,ratchet,bit,weight] [--only jag,0-70] \
#       [--export] [--render] [--stack]
#
# Reads tools/forge3d/spec.json (write it with: node tools/forge3d/spec.mjs).
# Geometry is DERIVED FROM THE SAME STATS THE GAME DRAWS FROM, so the mesh
# and the canvas top can never disagree: tooth count is round(3+sharp*8),
# a ratchet's name is its geometry, an assist's family comes off gearMul.
#
# THE MOUNT (all mm, +Y up in the exported file, Blender builds Z-up and the
# glTF exporter converts). Origin per part is its MOUNT FACE:
#   blade   origin = underside face.  Sits at Y=18 nominal.
#   core    origin = seat (underside). Top face lands at Y=26 nominal.
#   assist  origin = top face. Seats 3mm below the blade underside.
#   ratchet origin = top face (mates the blade underside). Body grows DOWN.
#   bit     origin = top of shaft (insertion end). 12mm long, tip at floor.
#   weight  origin = hole face, body grows down into the hole.
# NOMINAL STACK: bit 12 + ratchet body (height name / 10) puts the blade
# underside at 12+6.0=18 for the reference 60 ratchet and the core top at
# 26, exactly the source list's numbers. A 90 ratchet raises the strike
# plane 3mm, a 30 lowers it 3mm — which is what the game says they do.
import bpy, bmesh, json, math, os, sys, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SPEC = json.load(open(os.path.join(HERE, 'spec.json')))
M = SPEC['mount']

def args():
    p = argparse.ArgumentParser()
    p.add_argument('--slots', default='core,blade,assist,ratchet,bit,weight')
    p.add_argument('--only', default='')
    p.add_argument('--export', action='store_true')
    p.add_argument('--render', action='store_true')
    p.add_argument('--stack', action='store_true')
    # renders default to their own dir: _raw/ holds Stephen's sheet crops
    # for cores and blades, and a render landing on the same id would
    # silently replace his art with mine on the next --force cut
    p.add_argument('--out', default=os.path.join(HERE, 'renders'))
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return p.parse_args(argv)

# ---------------------------------------------------------------- materials
def mat(name, color, metal, rough):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metal
    b.inputs['Roughness'].default_value = rough
    return m

def mats_for(tier):
    """Steel body plus one accent the finish system can retint. Material
       names are stable so a game importer can find them."""
    steel = mat('lw_steel', (0.52, 0.54, 0.58), 1.0, 0.32)
    accent = { 'stock':  mat('lw_accent_stock',  (0.22, 0.36, 0.55), 0.6, 0.40),
               'forged': mat('lw_accent_forged', (0.62, 0.45, 0.18), 1.0, 0.35),
               'relic':  mat('lw_accent_relic',  (0.15, 0.11, 0.08), 0.9, 0.45),
             }.get(tier, mat('lw_accent_stock', (0.22, 0.36, 0.55), 0.6, 0.40))
    dark = mat('lw_dark', (0.09, 0.09, 0.10), 0.4, 0.7)
    return steel, accent, dark

# ---------------------------------------------------------------- helpers
def new_obj(name):
    me = bpy.data.meshes.new(name)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob

def commit(bm, ob):
    """Consistent outward normals before the mesh is real: Cycles shades
       both sides so a flipped cap hides here, but a glb consumer culls
       backfaces and would show a hole."""
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data); bm.free()

def washer(bm, prof, r_in, z0, z1, segs_in=None):
    """A ring solid: outer wall follows prof (list of radii per seg, len N),
       bore is a circle of r_in with the SAME seg count so every face is a
       clean quad. Returns nothing; fills bm."""
    n = len(prof)
    vo0 = [bm.verts.new((prof[i]*math.cos(2*math.pi*i/n), prof[i]*math.sin(2*math.pi*i/n), z0)) for i in range(n)]
    vo1 = [bm.verts.new((prof[i]*math.cos(2*math.pi*i/n), prof[i]*math.sin(2*math.pi*i/n), z1)) for i in range(n)]
    vi0 = [bm.verts.new((r_in*math.cos(2*math.pi*i/n), r_in*math.sin(2*math.pi*i/n), z0)) for i in range(n)]
    vi1 = [bm.verts.new((r_in*math.cos(2*math.pi*i/n), r_in*math.sin(2*math.pi*i/n), z1)) for i in range(n)]
    for i in range(n):
        j = (i+1) % n
        bm.faces.new((vo0[i], vo0[j], vo1[j], vo1[i]))   # outer wall
        bm.faces.new((vi1[i], vi1[j], vi0[j], vi0[i]))   # bore wall
        bm.faces.new((vo1[i], vo1[j], vi1[j], vi1[i]))   # top ring
        bm.faces.new((vi0[i], vi0[j], vo0[j], vo0[i]))   # bottom ring

def tube(bm, r, z0, z1, n=24, cap0=True, cap1=True, cx=0.0, cy=0.0, r1=None):
    """A capped cylinder (optionally tapered to r1 at z1) at (cx, cy)."""
    r1 = r if r1 is None else r1
    a = [2*math.pi*i/n for i in range(n)]
    v0 = [bm.verts.new((cx+r *math.cos(t), cy+r *math.sin(t), z0)) for t in a]
    v1 = [bm.verts.new((cx+r1*math.cos(t), cy+r1*math.sin(t), z1)) for t in a]
    for i in range(n):
        j = (i+1) % n
        bm.faces.new((v0[i], v0[j], v1[j], v1[i]))
    if cap0: bm.faces.new(tuple(reversed(v0)))
    if cap1: bm.faces.new(tuple(v1))

def finish(ob, name, steel, accent=None, accent_faces=None, dark=None, dark_faces=None):
    """Assign materials, shade, triangulate a copy to count tris."""
    ob.data.materials.append(steel)
    if accent: ob.data.materials.append(accent)
    if dark: ob.data.materials.append(dark)
    if accent_faces or dark_faces:
        for pi, poly in enumerate(ob.data.polygons):
            if accent_faces and accent_faces(poly): poly.material_index = 1
            elif dark_faces and dark_faces(poly): poly.material_index = 2 if accent else 1
    for poly in ob.data.polygons: poly.use_smooth = True
    ob.data.use_auto_smooth = True
    ob.data.auto_smooth_angle = math.radians(40)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    return tris

# ---------------------------------------------------------------- builders
def build_blade(p):
    """The silhouette. Outer rim from the tooth family, bore is the M16
       thread (modelled smooth at 16mm), boss ring below, 12 blind weight
       holes as inset dark rings (an honest recess costs boolean triangles
       the budget does not have; the WEIGHT mesh stands proud of the face
       so the pairing still reads)."""
    R, teeth, fam = p['radiusMm'], p['teeth'], p['family']
    t = 2.5 + (p['mass'] / 0.028) * 3.0            # thickness from mass
    segs = max(44, min(80, 5 * teeth))
    prof = []
    for i in range(segs):
        u = (i / segs) * teeth * 2 * math.pi
        if fam == 'deep':
            w = (u % (2*math.pi)) / (2*math.pi)    # asymmetric saw spur
            prof.append(R * (1.0 - 0.24 * (w ** 1.6)))
        elif fam == 'scallop':
            prof.append(R * (1.0 - 0.09 * (0.5 + 0.5*math.sin(u))))
        else:
            prof.append(R)
    prof = [x * (R / max(prof)) for x in prof]         # a sampled trough is
    # phase luck; the rim must touch the catalogue radius exactly
    ob = new_obj('blade_' + p['id'])
    bm = bmesh.new()
    washer(bm, prof, 8.0, 0.0, t)                          # body; bore dia 16
    washer(bm, [M['bossDia']/2] * 16, 8.6, -2.0, 0.0)      # boss: a real annulus
    washer(bm, [10.6] * 16, 8.6, t, t + 0.7)               # raised hub ring on the face
    for ring in M['holeRings']:                            # weight hole hints
        for k in range(M['holesPerRing']):
            a = 2*math.pi*k/M['holesPerRing']
            hr, hx, hy = M['weightHoleDia']/2, math.cos(a)*R*ring, math.sin(a)*R*ring
            tube(bm, hr, -0.25, 0.0, n=6, cap0=True, cap1=False, cx=hx, cy=hy)
    commit(bm, ob)
    steel, accent, dark = mats_for(p['tier'])
    tris = finish(ob, p['id'], steel, accent, lambda po: abs(po.center.z - t) < .01 and (po.center.length < R*0.62),
                  dark, lambda po: po.center.z < -0.01 and po.center.length < R*0.9 and abs(po.center.z + 0.25) < 0.2)
    return ob, tris, {'radius': R, 'thick': t}

def build_core(p):
    """The lock chip, seen from above: a lathe profile — side wall, top
       rim, a recessed face the painted emblem lives on — and three
       bayonet lugs under it at the 8mm boss."""
    r, t = 10.0, 2.6 + (p['mass'] / 0.005) * 1.4
    ob = new_obj('core_' + p['id'])
    bm = bmesh.new()
    n = 24
    ang = [2*math.pi*i/n for i in range(n)]
    ring = lambda rr, z: [bm.verts.new((rr*math.cos(a), rr*math.sin(a), z)) for a in ang]
    v_b, v_t = ring(r, 0.0), ring(r, t)
    v_ri, v_rc = ring(r*0.62, t), ring(r*0.62, t - 0.6)
    def loopfaces(va, vb):
        for i in range(n):
            j = (i+1) % n
            bm.faces.new((va[i], va[j], vb[j], vb[i]))
    loopfaces(v_b, v_t); loopfaces(v_t, v_ri); loopfaces(v_ri, v_rc)
    bm.faces.new(tuple(reversed(v_b)))     # underside
    bm.faces.new(tuple(v_rc))              # recessed face
    for k in range(M['lugs']):
        a = 2*math.pi*k/M['lugs']
        lx, ly = math.cos(a)*(M['socketBossDia']/2 + 1.2), math.sin(a)*(M['socketBossDia']/2 + 1.2)
        tube(bm, 1.5, -2.0, 0.0, n=6, cap0=True, cap1=False, cx=lx, cy=ly)
    commit(bm, ob)
    steel, accent, dark = mats_for(p['tier'])
    tris = finish(ob, p['id'], steel, accent, lambda po: po.center.z > t - 0.7 and po.center.length < r*0.63)
    return ob, tris, {'radius': r, 'thick': t}

def build_assist(p):
    """Seen edge-on under the blade, so the PROFILE is the design."""
    r_out = 14.0 + p['radAddMm']
    h = 3.0
    fam = p['family']
    segs = 72 if fam == 'toothed' else 48
    prof = []
    for i in range(segs):
        u = (i / segs) * 2 * math.pi
        if fam == 'toothed':
            k = 24
            saw = abs(((u*k/(2*math.pi)) % 1.0) - 0.5) * 2   # knurl ridges
            prof.append(r_out - 0.9 * saw)
        elif fam == 'smooth':
            prof.append(r_out)
        else:
            # 8 broad lobes deep enough to see edge-on, which is the only
            # way an assist is ever seen
            prof.append(r_out - 1.1 * (0.5 + 0.5*math.sin(u*8)))
    ob = new_obj('assist_' + p['id'])
    bm = bmesh.new()
    washer(bm, prof, 11.0, -h, 0.0)
    commit(bm, ob)
    steel, accent, dark = mats_for(p['tier'])
    tris = finish(ob, p['id'], steel if fam != 'smooth' else mat('lw_polish', (0.80, 0.81, 0.84), 0.85, 0.20), accent)
    return ob, tris, {'r_out': r_out, 'h': h}

def build_ratchet(p):
    """The name IS the geometry: N teeth on the 14mm ring, body height is
       the named height over ten. No cheating."""
    n_teeth, h = p['teeth'], p['bodyMm']
    r_body = 6.0
    flare = 1.25 if p['strikeHigh'] > 1.15 else 1.0
    ob = new_obj('ratchet_' + p['id'])
    bm = bmesh.new()
    tube(bm, r_body*flare, 0.0, -max(1.4, h*0.22), n=32, cap0=True, cap1=False)  # crown at mount face
    tube(bm, r_body, -max(1.4, h*0.22), -h, n=32, cap0=False, cap1=True)         # body
    tube(bm, 4.5, -h, -h + 0.001, n=16, cap0=True, cap1=False)             # bore mouth (bit seats here)
    for k in range(max(0, n_teeth)):                                       # the countable teeth
        a = 2*math.pi*k/max(1, n_teeth)
        # centred so they bite INTO the body: the first pass floated them
        # 0.2mm clear of the wall, three studs orbiting a pillbox
        tx, ty = math.cos(a)*6.4, math.sin(a)*6.4
        tube(bm, 0.85, -0.2, -min(h*0.75, 2.8), n=5, cap0=True, cap1=True, cx=tx, cy=ty)
    commit(bm, ob)
    steel, accent, dark = mats_for(p['tier'])
    tris = finish(ob, p['id'], steel, accent, lambda po: (po.center.xy.length > M['ratchetRingDia']/2 - 1.2) and po.center.z > -2.6)
    return ob, tris, {'teeth': n_teeth, 'h': h}

def build_bit(p):
    """A lathe: 9mm shaft for the top 6mm (the press fit), a collar, then
       the foot the family decides. Always 12mm long, tip on the floor."""
    fam = p['family']
    L = M['bitLength']
    ob = new_obj('bit_' + p['id'])
    bm = bmesh.new()
    tube(bm, M['bitShaftDia']/2, 0.0, -M['bitInsertDepth'], n=24, cap0=True, cap1=False)
    tube(bm, 5.6, -M['bitInsertDepth'], -M['bitInsertDepth'] - 1.6, n=24, cap0=False, cap1=False)  # collar
    z_col = -M['bitInsertDepth'] - 1.6
    tip_r = 0.5 if fam == 'sharp' else (1.6 + p['stable'] * 2.2)
    if fam == 'sharp':
        tube(bm, 3.2, z_col, z_col - 1.2, n=24, cap0=False, cap1=False)
        tube(bm, 3.2, z_col - 1.2, -L, n=24, cap0=False, cap1=True, r1=tip_r)   # needle cone
    elif fam == 'rounded':
        tube(bm, 4.6, z_col, -L + 1.4, n=24, cap0=False, cap1=False)
        tube(bm, 4.6, -L + 1.4, -L, n=24, cap0=False, cap1=True, r1=tip_r*0.8)  # dome-ish
    else:  # cogs
        tube(bm, 4.2, z_col, -L + 1.2, n=24, cap0=False, cap1=False)
        tube(bm, 4.2, -L + 1.2, -L, n=24, cap0=False, cap1=True, r1=2.2)
        for k in range(8):                                                      # the rail cogs
            a = 2*math.pi*k/8
            cx, cy = math.cos(a)*4.8, math.sin(a)*4.8
            tube(bm, 0.7, -L + 3.4, -L + 0.8, n=5, cap0=True, cap1=True, cx=cx, cy=cy)
    commit(bm, ob)
    steel, accent, dark = mats_for(p['tier'])
    tipmat = {'sharp': mat('lw_hardened', (0.35, 0.36, 0.40), 0.9, 0.25),
              'rounded': mat('lw_polymer', (0.80, 0.78, 0.72), 0.0, 0.5),
              'cogs': mat('lw_accent_forged', (0.62, 0.45, 0.18), 1.0, 0.35)}[fam]
    ob.data.materials.append(steel); ob.data.materials.append(tipmat)
    for po in ob.data.polygons:
        if po.center.z < -M['bitInsertDepth'] - 1.6: po.material_index = 1
        po.use_smooth = True
    ob.data.use_auto_smooth = True; ob.data.auto_smooth_angle = math.radians(40)
    tris = sum(len(po.vertices) - 2 for po in ob.data.polygons)
    return ob, tris, {'len': L, 'fam': fam}

def build_weight(p):
    """Three masses, one mesh: a slug sized to the 3.5mm blind hole. The
       hole is 4 deep; the brick stands proud on purpose — a fitted heavy
       weight should be visible on the underside at a glance."""
    h = {'chip': 2.0, 'slug': 3.5, 'brick': 5.0}[p['id']]
    ob = new_obj('weight_' + p['id'])
    bm = bmesh.new()
    tube(bm, 1.7, 0.0, -h, n=12)
    commit(bm, ob)
    dense = mat('lw_dense', (0.28, 0.26, 0.30), 1.0, 0.5)
    ob.data.materials.append(dense)
    for po in ob.data.polygons: po.use_smooth = True
    tris = sum(len(po.vertices) - 2 for po in ob.data.polygons)
    return ob, tris, {'h': h}

def validate(slot, p, ob):
    """Mount compatibility measured off the FINISHED mesh, never echoed
       from the numbers the builder was given — a builder that drifts from
       the spec should fail here, not ship. Returns {check: (ok, detail)}."""
    vs = ob.data.vertices
    lo_z = min(v.co.z for v in vs); hi_z = max(v.co.z for v in vs)
    rr = [math.hypot(v.co.x, v.co.y) for v in vs]
    rmax, rmin = max(rr), min(rr)
    c = {}
    if slot == 'blade':
        c['outer radius = catalogue'] = (abs(rmax - p['radiusMm']) < 0.06, '%.2f vs %.1f' % (rmax, p['radiusMm']))
        # the bore is read off the body wall, above z=0.25: the weight hole
        # hints on a small blade reach further in than the bore and fooled
        # the first version of this check (cleaver 'bore' came out 13.97)
        bore = min(math.hypot(v.co.x, v.co.y) for v in vs if v.co.z > 0.25)
        c['thread bore 16mm'] = (abs(bore - 8.0) < 0.06, 'dia %.2f' % (bore * 2))
        c['boss ring reaches -2'] = (abs(lo_z + 2.0) < 0.06, '%.2f' % lo_z)
        c['origin at underside'] = (abs(min(v.co.z for v in vs if math.hypot(v.co.x, v.co.y) > p['radiusMm'] * 0.92)) < 0.06, '')
    elif slot == 'core':
        c['lugs reach 2 below seat'] = (abs(lo_z + 2.0) < 0.06, '%.2f' % lo_z)
        lug_r = [math.hypot(v.co.x, v.co.y) for v in vs if v.co.z < -0.05]
        c['lugs at the 8mm boss'] = (min(lug_r) > 3.4 and max(lug_r) < 6.9,
                                     '%.1f..%.1f' % (min(lug_r), max(lug_r)))
    elif slot == 'assist':
        c['top face at origin'] = (abs(hi_z) < 0.01, '%.2f' % hi_z)
        c['bore = 22mm boss'] = (abs(rmin - 11.0) < 0.06, 'dia %.2f' % (rmin * 2))
        c['hides under the smallest blade'] = (rmax <= 18.0, '%.2f' % rmax)
    elif slot == 'ratchet':
        c['body height = name/10'] = (abs(-lo_z - p['bodyMm']) < 0.06, '%.2f vs %.1f' % (-lo_z, p['bodyMm']))
        crown = max(1.4, p['bodyMm'] * 0.22)
        # count teeth STRUCTURALLY: each tooth is its own shell, so teeth =
        # connected components among the verts in the tooth band. Two
        # angle-gap thresholds were tried first and both lied (0.45x merged
        # a 14-tooth ring's 10.7-degree gaps; 0.30x split single teeth).
        band = set(v.index for v in vs
                   if math.hypot(v.co.x, v.co.y) > 6.45 and -2.9 < v.co.z < -(crown + 0.12))
        if p['teeth'] == 0:
            c['toothless, as named'] = (len(band) == 0, '%d stray verts' % len(band))
        else:
            parent = {i: i for i in band}
            def find(i):
                while parent[i] != i:
                    parent[i] = parent[parent[i]]; i = parent[i]
                return i
            for e in ob.data.edges:
                a, b = e.vertices
                if a in band and b in band:
                    parent[find(a)] = find(b)
            islands = len(set(find(i) for i in band))
            c['teeth counted = name'] = (islands == p['teeth'], '%d vs %d' % (islands, p['teeth']))
    elif slot == 'bit':
        c['length 12mm, tip on floor'] = (abs(-lo_z - 12.0) < 0.06, '%.2f' % -lo_z)
        shaft_r = max(math.hypot(v.co.x, v.co.y) for v in vs if v.co.z > -5.9)
        c['shaft dia 9 press fit'] = (abs(shaft_r - 4.5) < 0.06, 'dia %.2f' % (shaft_r * 2))
    elif slot == 'weight':
        c['fits the 3.5mm hole'] = (rmax <= 1.75, 'dia %.2f' % (rmax * 2))
    return c

BUILDERS = {'core': build_core, 'blade': build_blade, 'assist': build_assist,
            'ratchet': build_ratchet, 'bit': build_bit, 'weight': build_weight}
SLOTKEY = {'core': 'cores', 'blade': 'blades', 'assist': 'assists',
           'ratchet': 'ratchets', 'bit': 'bits', 'weight': 'weights'}

# ---------------------------------------------------------------- render
def setup_render():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 96          # no denoiser in this build, samples carry it
    sc.cycles.use_denoising = False
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 512
    # metal with nothing to reflect renders as grey soap, so the world is a
    # little studio: emission planes stand in for softboxes and show up in
    # the speculars, which is what makes steel read as steel
    w = bpy.data.worlds['World']; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.055, 0.055, 0.065, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
    def softbox(name, loc, rot, size, color, strength):
        me = bpy.data.meshes.new(name); ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size)
        bm.to_mesh(me); bm.free()
        ob.location, ob.rotation_euler = loc, rot
        m = bpy.data.materials.new(name); m.use_nodes = True
        nt = m.node_tree; nt.nodes.clear()
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Color'].default_value = (*color, 1)
        em.inputs['Strength'].default_value = strength
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(em.outputs[0], out.inputs[0])
        me.materials.append(m)
        ob.visible_camera = False
        return ob
    softbox('sb_key',  (-70, -50, 100), (math.radians(35), 0, math.radians(-38)), 110, (1.0, 0.96, 0.88), 18)
    softbox('sb_rim',  (85, 70, 30),    (math.radians(-70), 0, math.radians(40)), 55, (0.75, 0.85, 1.0), 9)
    softbox('sb_fill', (50, -80, 10),   (math.radians(-80), 0, math.radians(150)), 70, (0.9, 0.9, 0.95), 5)
    cam = bpy.data.cameras.new('cam'); cam.lens = 85
    cam.clip_end = 100000   # a 340mm dish frames from ~2700 units out,
                            # past the default 1000 clip - the first
                            # stadium renders were empty frames
    co = bpy.data.objects.new('cam', cam)
    bpy.context.collection.objects.link(co); sc.camera = co
    return co

def aim(cam, target, dist, elev_deg, azim_deg=-90):
    from mathutils import Vector
    el, az = math.radians(elev_deg), math.radians(azim_deg)
    cam.location = (target[0] + dist*math.cos(el)*math.cos(az),
                    target[1] + dist*math.cos(el)*math.sin(az),
                    target[2] + dist*math.sin(el))
    d = Vector(target) - Vector(cam.location)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

VIEWS = {  # elevation deg, and where the interesting face is
    'core': 55, 'blade': 55, 'assist': 13, 'ratchet': 18, 'bit': 14, 'weight': 30 }

def render_part(ob, slot, cam, out):
    for o in bpy.context.collection.objects:
        # the softboxes are meshes too, and hiding them turned every part
        # into a silhouette on the first lit run
        if o.type == 'MESH' and not o.name.startswith('sb_'):
            o.hide_render = o is not ob
    lo, hi = [min(v.co[i] for v in ob.data.vertices) for i in range(3)], \
             [max(v.co[i] for v in ob.data.vertices) for i in range(3)]
    ctr = [(lo[i]+hi[i])/2 for i in range(3)]
    # bounding SPHERE fit: the first framing used half the largest extent
    # and cropped the tip off every tall part
    rad = math.sqrt(sum((hi[i]-lo[i])**2 for i in range(3))) / 2
    fov = 2*math.atan(18.0 / cam.data.lens)   # sensor 36mm
    aim(cam, ctr, (rad * 1.12) / math.sin(fov/2), VIEWS[slot])
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)

# ---------------------------------------------------------------- main
def main():
    a = args()
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    only = set(x for x in a.only.split(',') if x)
    report, built = [], []
    for slot in a.slots.split(','):
        for p in SPEC[SLOTKEY[slot]]:
            if only and p['id'] not in only: continue
            ob, tris, dims = BUILDERS[slot](p)
            budget = SPEC['budgets'][slot]
            checks = validate(slot, p, ob)
            report.append({'slot': slot, 'id': p['id'], 'tris': tris,
                           'budget': budget, 'over': tris > budget, 'dims': dims,
                           'checks': {k: {'ok': v[0], 'detail': v[1]} for k, v in checks.items()}})
            built.append((slot, p['id'], ob))
    cam = setup_render() if (a.render or a.stack) else None
    if a.export:
        for slot, pid, ob in built:
            d = os.path.join(ROOT, 'assets', '3d', slot)
            os.makedirs(d, exist_ok=True)
            bpy.ops.object.select_all(action='DESELECT')
            ob.select_set(True)
            bpy.ops.export_scene.gltf(filepath=os.path.join(d, pid + '.glb'),
                use_selection=True, export_format='GLB', export_apply=True)
    if a.render:
        os.makedirs(a.out, exist_ok=True)
        for slot, pid, ob in built:
            render_part(ob, slot, cam, os.path.join(a.out, pid + '.png'))
    if a.stack:
        build_stack(cam)
    over = [r for r in report if r['over']]
    bad = [(r['id'], k, v['detail']) for r in report
           for k, v in r['checks'].items() if not v['ok']]
    json.dump(report, open(os.path.join(HERE, 'report.json'), 'w'), indent=1)
    for pid, k, d in bad:
        print('  MOUNT FAIL %-12s %s (%s)' % (pid, k, d))
    print('forge3d: built %d, %d over budget %s, %d mount failures'
          % (len(report), len(over), [r['id'] for r in over] or '', len(bad)))

def build_stack(cam):
    """One fully dressed top at the nominal stack heights — the proof the
       mount is one mount. Exported and photographed."""
    ids = {'blade': 'wheel', 'core': 'iron', 'assist': 'wing',
           'ratchet': '3-60', 'bit': 'point'}
    zs = {'bit': 12.0, 'ratchet': 18.0, 'assist': 15.0, 'blade': 18.0}
    parts = []
    for slot, pid in ids.items():
        p = next(x for x in SPEC[SLOTKEY[slot]] if x['id'] == pid)
        ob, _, dims = BUILDERS[slot](p)
        # the core's seat is wherever its own thickness puts it: top face 26
        ob.location.z = zs.get(slot, M['coreTopY'] - dims.get('thick', 3))
        parts.append(ob)
    for k in range(3):  # a few weights fitted, chip slug brick
        w = BUILDERS['weight'](SPEC['weights'][k])[0]
        a = 2*math.pi*k/6
        R = next(x for x in SPEC['blades'] if x['id'] == 'wheel')['radiusMm']
        w.location = (math.cos(a)*R*0.80, math.sin(a)*R*0.80, 18.0)
        parts.append(w)
    for o in bpy.context.collection.objects:
        if o.type == 'MESH' and not o.name.startswith('sb_'):
            o.hide_render = o not in parts
    aim(cam, (0, 0, 14), 120, 18)
    out = os.path.join(ROOT, 'docs', 'shots-art', 'stack-proof.png')
    bpy.context.scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    d = os.path.join(ROOT, 'assets', '3d')
    os.makedirs(d, exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in parts: ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(d, 'stack-proof.glb'),
        use_selection=True, export_format='GLB', export_apply=True)

if __name__ == '__main__':   # arena.py imports the builders
    main()
