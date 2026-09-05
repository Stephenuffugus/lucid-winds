import re
E='/workspaces/Litter_Bug/bug-engine.js'
s=open(E).read()
def rep(old,new,n=1):
    global s
    c=s.count(old); assert c==n, ('anchor %d != %d: %s'%(c,n,old[:80]))
    s=s.replace(old,new)

rep("""  // bugIdentity: the whole nameplate for a bug.
  function bugIdentity(codeblock) {
    return {
      name: bugName(codeblock),
      species: bugSpecies(codeblock),
      designation: bugDesignation(codeblock),
      lore: bugLore(codeblock)
    };
  }""",
"""  // ══ THE PART LINE (identity depth, 2026-09-05) ════════════════════════
  // One sentence of lore that names a part the renderer actually drew, read
  // off the SAME plan the grade reads. It has its own rng stream ('|parts'),
  // so the three lines every bug already had are untouched: this is line four.
  // ⛔ A wingless bug can never draw a wing line: the candidates come from the
  // plan, the bank is only ever indexed by a candidate.
  var PART_LINES = {
    shell:        ['Its shell is two halves that close with a click.', 'The shell shuts over its back like a lid on a tin.', 'Under the shell, wings it has never once used.'],
    fourWings:    ['Four wings, and it uses all of them, never in time.', 'Two pairs of wings that beat against each other.', 'It hovers. Nothing this size should hover.'],
    membrane:     ['Its wings are {material} held up to the light.', 'Wings you can read a label through.', 'Thin wings, folded flat, faster than they look.'],
    wingless:     ['No wings. It walks everywhere and always arrives.', 'It never grew wings and never seemed to mind.', 'Wingless, and lower to the ground for it.'],
    veined:       ['The wing veins run like cracks in old glass.', 'Every vein in its wings is a road it has taken.'],
    eyespot:      ['An eyespot on each wing, watching whatever it is not.', 'The eyespots on its wings blink when it lands.'],
    tattered:     ['Its wings are torn at the edges and it flies anyway.', 'Tattered wings. Something got close, once.'],
    plates:       ['Plates down its back, each one a different scrap.', 'A carapace of plates that do not quite match.', 'Armour on its back, bolted on one plate at a time.'],
    hornsCurved:  ['It leads with its horns and the horns curve back.', 'Curved horns, worn smooth at the tips.'],
    hornsAntler:  ['Branched horns like a stripped antenna mast.', 'Its horns fork, and fork again.'],
    hornsKnob:    ['Two blunt knobs for horns. It rams things.', 'Its horns are knobs, and it swings them like hammers.'],
    hookedPincers:['The pincers hook inward and do not let go.', 'Hooked pincers, and a habit of using them first.'],
    pincers:      ['It carries its pincers open, like a question.', 'Pincers wide enough for a bottle cap.'],
    barbed:       ['The stinger is barbed and it has been used.', 'A clubbed stinger it drags behind it like a threat.'],
    forkedTail:   ['A forked tail that tastes the air behind it.', 'Its tail splits in two and each half twitches on its own.'],
    plainTail:    ['The tail ends in a point it keeps clean.', 'A plain tail, held high, that says it is not afraid.'],
    extraEyes:    ['It has more eyes than it needs and uses every one.', 'Extra eyes, so nothing gets close from behind.'],
    fullRidge:    ['A ridge of spines from head to tail, like a torn zipper.', 'Spines down the whole back, one for each segment.'],
    quills:       ['Long quills stand off its back like fence wire.', 'Quills that rattle when it runs.'],
    knobSpines:   ['A row of rounded knobs down its back.', 'Its spines are worn to knobs and it wears them proudly.'],
    spines:       ['One spine on its back, worn to a nub.', 'A few spines, enough to make a gull think twice.'],
    raptorial:    ['Its forelegs fold like a jackknife and open faster.', 'Raptorial forelegs. It does not chase. It waits.'],
    claws:        ['Claws on every foot, which is how it climbs glass.', 'Tarsal claws that tick on tin.'],
    fringed:      ['Fringed legs, feathered like a brush.', 'Its legs are fringed with hairs that catch the dust.'],
    wedge:        ['A wedge of a head, all angle and stare.', 'Its head is a mantis wedge that turns to follow you.'],
    crest:        ['A crest on its head like a bent bottle cap.', 'It wears a crest and holds it up in the rain.'],
    snout:        ['A long snout for reaching into places that were sealed.', 'Its snout finds the seam in anything.'],
    bands:        ['Banded down the body like a warning label.', 'Bands of colour across every segment.'],
    spots:        ['Spotted, as if something dripped on it and dried.', 'Spots down its back like old paint.'],
    stripes:      ['Striped lengthwise, like a barcode that will not scan.', 'Stripes along its back, one for every winter.'],
    chevrons:     ['Chevrons down its back, pointing home.', 'Marked with chevrons, like a road sign nobody reads.'],
    speckle:      ['Speckled all over, like it stood too close to spray paint.', 'A speckle across the body that hides it in grit.'],
    whip:         ['Antennae long as whips, always moving.', 'Whip antennae it tastes the wind with.'],
    fan:          ['Fan tipped antennae, opened like two small combs.', 'Its antennae end in fans and it is always listening.'],
    slit:         ['Slit pupils, like a cat that gave up on people.', 'Eyes with slits in them that narrow when you move.'],
    glossy:       ['Big glossy eyes with the lamp caught in each.', 'Eyes so glossy the whole alley is in them.'],
    sixSeg:       ['Six segments, sewn end to end.', 'A body six segments long, each one a different find.'],
    patchwork:    ['Sewn from four scraps and proud of none of them.', 'A patchwork of scraps that never matched and never will.']
  };
  var WING_KEYS = { shell: 1, fourWings: 1, membrane: 1, veined: 1, eyespot: 1, tattered: 1 };
  function bugPartCandidates(codeblock) {
    var P = bugPlan(codeblock), pl = P.plan, c = [], i, sp = 0;
    var hasWings = pl.wings !== 999;
    // rarest first, so the choice leans toward what the grade also noticed
    if (pl.extraEyes !== 999) c.push('extraEyes');
    if (pl.pincers !== 999) c.push(P.jawKind === 3 ? 'hookedPincers' : 'pincers');
    if (pl.tail !== 999) c.push(P.tailKind === 2 ? 'barbed' : (P.tailKind === 1 ? 'forkedTail' : 'plainTail'));
    for (i = 0; i < pl.spines.length; i++) if (pl.spines[i] !== 999) sp++;
    if (sp >= P.N) c.push('fullRidge');
    else if (sp) c.push(P.spineKind === 2 ? 'quills' : (P.spineKind === 1 ? 'knobSpines' : 'spines'));
    if (P.legKind === 2) c.push('raptorial');
    if (hasWings) {
      if (P.wingKind === 2) c.push('shell');
      else {
        c.push(P.wingKind === 1 ? 'fourWings' : 'membrane');
        if (P.wingStyle === 1) c.push('veined'); else if (P.wingStyle === 2) c.push('eyespot'); else if (P.wingStyle === 3) c.push('tattered');
      }
    } else c.push('wingless');
    if (pl.horns !== 999) c.push(P.hornKind === 1 ? 'hornsAntler' : (P.hornKind === 2 ? 'hornsKnob' : 'hornsCurved'));
    if (P.plateKind && P.wingKind !== 2) c.push('plates');
    if (P.headKind === 1) c.push('wedge'); else if (P.headKind === 2) c.push('crest'); else if (P.headKind === 3) c.push('snout');
    if (P.patternKind) c.push(['bands', 'spots', 'stripes', 'chevrons', 'speckle'][P.patternKind - 1]);
    if (P.legStyle === 1) c.push('claws'); else if (P.legStyle === 2) c.push('fringed');
    if (P.antStyle === 1) c.push('whip'); else if (P.antStyle === 2) c.push('fan');
    if (P.eyeStyle === 1) c.push('slit'); else if (P.eyeStyle === 2) c.push('glossy');
    if (P.N >= 6) c.push('sixSeg');
    if (P.mats.length >= 4) c.push('patchwork');
    return c;
  }
  function bugPartLine(codeblock) {
    var c = bugPartCandidates(codeblock), rng = seededRng(codeblock + '|parts');
    // one of the three loudest parts, so a bug with a stinger and a shell is
    // not always described by the stinger
    var key = c[Math.floor(rng() * Math.min(3, c.length))];
    var line = pick(rng, PART_LINES[key]).replace('{material}', pick(rng, LORE_MATERIAL));
    return { key: key, line: line };
  }

  // ── the family: what a bug IS, read off the two loudest shape rolls ──
  var FAMILY_WING = ['Veilwing', 'Dragonet', 'Shellback', 'Walker'];
  var FAMILY_HEAD = ['round headed', 'wedge headed', 'crested', 'snouted'];
  function bugFamily(codeblock) {
    var P = bugPlan(codeblock);
    var w = P.plan.wings !== 999 ? (P.wingKind || 0) : 3, hd = P.headKind || 0;
    return { wing: w, head: hd, name: FAMILY_WING[w], headName: FAMILY_HEAD[hd], label: FAMILY_WING[w] + ', ' + FAMILY_HEAD[hd] };
  }

  // bugIdentity: the whole nameplate for a bug.
  function bugIdentity(codeblock) {
    return {
      name: bugName(codeblock),
      species: bugSpecies(codeblock),
      designation: bugDesignation(codeblock),
      lore: bugLore(codeblock),
      family: bugFamily(codeblock),
      part: bugPartLine(codeblock)
    };
  }""")
# the lore: line four is the part line, appended AFTER the three the bug already had
rep("""    var lines = [pick(rng, LORE_TRAIT_TPL)].concat(pickN(rng, LORE_GEN_TPL, 2));
    return lines.map(function (tpl) {
      var s = fill(tpl);
      s = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?]$/.test(s) ? s : s + '.';
    }).join('\\n');""",
"""    var lines = [pick(rng, LORE_TRAIT_TPL)].concat(pickN(rng, LORE_GEN_TPL, 2));
    return lines.map(function (tpl) {
      var s = fill(tpl);
      s = s.charAt(0).toUpperCase() + s.slice(1);
      return /[.!?]$/.test(s) ? s : s + '.';
    }).join('\\n') + '\\n' + bugPartLine(codeblock).line;""")
# exports
m=re.search(r"bugIdentity: bugIdentity,", s); assert m
s=s.replace("bugIdentity: bugIdentity,", "bugIdentity: bugIdentity, bugPartLine: bugPartLine, bugPartCandidates: bugPartCandidates, bugFamily: bugFamily, PART_LINES: PART_LINES, FAMILY_WING: FAMILY_WING, FAMILY_HEAD: FAMILY_HEAD,",1)
open(E,'w').write(s); print('engine patched')

# ── the page ──────────────────────────────────────────────────────────────
P='/workspaces/Litter_Bug/index.html'
s=open(P).read()
rep(""".fladder .gcell .gl{font-size:9px}""",
""".fladder .gcell .gl{font-size:9px}
/* the family chips: ALL or one wing family, a real filter over the grid */
.dexchips{display:flex;gap:8px;margin-top:10px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
.dexchips .chip{flex:none;min-height:48px;padding:0 14px;border-radius:999px;border:1px solid var(--line);background:#10151b;
  color:var(--dim);font-size:13px;font-weight:800;letter-spacing:1px;cursor:pointer}
.dexchips .chip b{color:var(--ink);margin-left:6px}
.dexchips .chip.on{background:#123a1f;border-color:#2f8a4c;color:#9be5b0}
.dexchips .chip.on b{color:#e6ecf2}
.specfam{font-size:11px;letter-spacing:2px;color:var(--dim);font-weight:800;margin-top:4px;text-transform:uppercase}""")
rep("""      <div class="fladder" id="x-fam"></div>""",
"""      <div class="fladder" id="x-fam"></div>
      <div class="dexchips" id="x-chips"></div>""")
# famOf reads the engine's family; the meter's wing names are the family names
rep("""var FAM_WING=['MEMBRANE','FOUR WING','SHELL','WINGLESS'], FAM_HEAD=['ROUND','WEDGE','CREST','SNOUT'], FAM_TAIL=['NO TAIL','PLAIN','FORKED','STINGER'];
/* the family a bug belongs to, read off the SAME plan the renderer draws from */
function famOf(cb){
  var P=null; try{ P=BUG_ENGINE.bugPlan(cb); }catch(e){}
  if(!P||!P.plan) return null;
  var has=function(v){ return v!=null && v!==999; };
  return { wing: has(P.plan.wings) ? (P.wingKind||0) : 3, head: P.headKind||0, tail: has(P.plan.tail) ? 1+(P.tailKind||0) : 0 };
}""",
"""var FAM_WING=['VEILWINGS','DRAGONETS','SHELLBACKS','WALKERS'], FAM_HEAD=['ROUND','WEDGE','CREST','SNOUT'], FAM_TAIL=['NO TAIL','PLAIN','FORKED','STINGER'];
/* the family a bug belongs to, read off the SAME plan the renderer draws from (the engine
   owns the names; the tail is counted here for the meter only) */
function famOf(cb){
  var P=null, F=null; try{ P=BUG_ENGINE.bugPlan(cb); F=BUG_ENGINE.bugFamily(cb); }catch(e){}
  if(!P||!P.plan||!F) return null;
  var has=function(v){ return v!=null && v!==999; };
  return { wing: F.wing, head: F.head, tail: has(P.plan.tail) ? 1+(P.tailKind||0) : 0 };
}
var DEX_FILTER=-1;   /* -1 all, else a wing family index */""")
# the grid honours the filter; the chips are painted with counts
rep("""  dex.forEach(function(b,i){
    var c=document.createElement('div'); c.className='card';""",
"""  var chips=$('x-chips'), fc=[0,0,0,0];
  dex.forEach(function(b){ var f=famOf(b.cb); if(f) fc[f.wing]++; });
  var ch='<button class="chip'+(DEX_FILTER<0?' on':'')+'" data-fam="-1">ALL<b>'+dex.length+'</b></button>';
  FAM_WING.forEach(function(nm,i){ ch+='<button class="chip'+(DEX_FILTER===i?' on':'')+'" data-fam="'+i+'">'+nm+'<b>'+fc[i]+'</b></button>'; });
  chips.innerHTML=ch;
  var cb=chips.querySelectorAll('.chip'), q;
  for(q=0;q<cb.length;q++)(function(el){ el.onclick=function(){ DEX_FILTER=parseInt(el.getAttribute('data-fam'),10); paintDex(); }; })(cb[q]);
  var shown=0;
  dex.forEach(function(b,i){
    if(DEX_FILTER>=0){ var ff=famOf(b.cb); if(!ff||ff.wing!==DEX_FILTER) return; }
    shown++;
    var c=document.createElement('div'); c.className='card';""")
rep("""    c.onclick=function(){ openSpec(i); };
    g.appendChild(c);
  });
}""",
"""    c.onclick=function(){ openSpec(i); };
    g.appendChild(c);
  });
  if(!shown) g.innerHTML='<div class="empty">No '+FAM_WING[DEX_FILTER].toLowerCase()+' pinned yet. They turn up when they turn up.</div>';
}""")
# the specimen card: the family under the species, front and back
rep("""    +'<div class="specsp">'+_esc(id.species)+'</div>'
    +'<div class="marks" id="sp-marks" style="margin-top:8px"></div>'""",
"""    +'<div class="specsp">'+_esc(id.species)+'</div>'
    +'<div class="specfam">'+_esc(id.family.name)+' · '+_esc(id.family.headName)+'</div>'
    +'<div class="marks" id="sp-marks" style="margin-top:8px"></div>'""")
rep("""  row('PARTS', D.gr.marks.length ? _esc(D.gr.marks.join(', ')) : 'a plain grub, nothing grown in');""",
"""  row('FAMILY', _esc(id.family.name)+', '+_esc(id.family.headName));
  row('PARTS', D.gr.marks.length ? _esc(D.gr.marks.join(', ')) : 'a plain grub, nothing grown in');""")
# the canvas card: the family under the species
rep("""  ctx.fillStyle='#8fa0b2'; ctx.font='italic 18px Georgia,serif'; ctx.fillText(id.species, W/2, ny+4);""",
"""  ctx.fillStyle='#8fa0b2'; ctx.font='italic 18px Georgia,serif'; ctx.fillText(id.species, W/2, ny+4);
  ctx.fillStyle='#5f6d7c'; ctx.font='800 11px "Trebuchet MS",sans-serif'; ctx.fillText((id.family.name+'   \\u00b7   '+id.family.headName).toUpperCase().split('').join('\\u200a'), W/2, ny+24);""")
open(P,'w').write(s); print('page patched')

# ── the gate ──────────────────────────────────────────────────────────────
C='/workspaces/Litter_Bug/check.js'
s=open(C).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
s=s.replace(anchor, r"""    // ══ IDENTITY DEPTH ════════════════════════════════════════════════
    group('identity depth: the lore names a part the bug has, and no name moves');
    /* fixtures/identity-60.json was captured from the engine BEFORE the part line
       existed. A bug is its name: the sixty must still answer to theirs, their old
       three lines must still lead, and line four must name a part the plan drew. */
    const idPage = await open(FILE + '?lbtest=1');
    const idr = await idPage.evaluate(async () => {
      const E = window.BUG_ENGINE, D = window.LB_DEV; D.reset();
      const fx = await (await fetch('fixtures/identity-60.json?' + Math.random())).json();
      let nameSame = 0, loreKept = 0, fourLines = 0;
      fx.forEach(f => { const id = E.bugIdentity(f.h); if (id.name === f.name && id.species === f.species) nameSame++; if (id.lore.indexOf(f.lore) === 0) loreKept++; if (id.lore.split('\n').length === 4) fourLines++; });
      let partOk = 0, wingLeak = 0, keys = {}, n = 600;
      for (let i = 0; i < n; i++) {
        const h = E.sha256Hex('idcheck-' + i), p = E.bugPartLine(h), c = E.bugPartCandidates(h), P = E.bugPlan(h);
        const bank = E.PART_LINES[p.key] || [];
        if (c.indexOf(p.key) >= 0 && bank.some(t => p.line.indexOf(t.split('{')[0]) === 0)) partOk++;
        keys[p.key] = 1;
        if (P.plan.wings === 999 && /^(shell|fourWings|membrane|veined|eyespot|tattered)$/.test(p.key)) wingLeak++;
      }
      /* the family chips over a dozen minted bugs */
      for (let i = 0; i < 12; i++) { D.setShinies(D.mintCost); await D.doMint(); D.keep(); }
      document.getElementById('b-dex').click();
      const chips = [...document.querySelectorAll('#x-chips .chip')];
      const chipH = chips.length ? chips[0].getBoundingClientRect().height : 0;
      const total = document.querySelectorAll('#x-grid .card').length;
      const fam = D.dex().map(b => E.bugFamily(b.cb).wing);
      let filterOk = true, detail = [];
      chips.slice(1).forEach((ch, i) => { ch.click(); const shown = document.querySelectorAll('#x-grid .card').length; const want = fam.filter(w => w === i).length; detail.push(shown + '/' + want); if (shown !== want) filterOk = false; });
      chips[0].click(); const back = document.querySelectorAll('#x-grid .card').length;
      D.openSpec(0); const famLine = document.querySelector('#sp-front .specfam');
      const famRow = [...document.querySelectorAll('#sp-back .row .k')].some(k => k.textContent === 'FAMILY');
      return { nameSame, loreKept, fourLines, fxN: fx.length, partOk, n, wingLeak, keysUsed: Object.keys(keys).length, chips: chips.length, chipH, total, filterOk, detail, back, famLine: famLine ? famLine.textContent : null, famRow };
    });
    await idPage.close();
    ok(idr.nameSame === idr.fxN, 'sixty fixture bugs still answer to their name and species', idr.nameSame + '/' + idr.fxN);
    ok(idr.loreKept === idr.fxN, 'the three lore lines every bug already had still lead', idr.loreKept + '/' + idr.fxN);
    ok(idr.fourLines === idr.fxN, 'and every bug now has a fourth line', idr.fourLines + '/' + idr.fxN);
    ok(idr.partOk === idr.n, 'the fourth line names a part the plan drew, from that part\'s bank', idr.partOk + '/' + idr.n);
    ok(idr.wingLeak === 0, 'a wingless bug never gets a wing line', idr.wingLeak);
    ok(idr.keysUsed >= 25, 'the part line draws on a wide bank', idr.keysUsed + ' parts used over 600');
    ok(idr.chips === 5 && idr.chipH >= 48, 'five family chips over the Bugdex, 48px tall', { chips: idr.chips, chipH: idr.chipH });
    ok(idr.total === 12 && idr.filterOk && idr.back === 12, 'a chip filters the grid to its family and ALL brings it back', idr.detail);
    ok(!!idr.famLine && /[A-Z]+ · /.test(idr.famLine) && idr.famRow, 'the specimen card names the family, front and ledger', idr.famLine);

"""+anchor)
open(C,'w').write(s); print('check patched')
