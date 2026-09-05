#!/usr/bin/env python3
"""No dashes in player copy (Stephen, Apr 22: commas and semicolons only).
Finds em/en dashes (glyph, \\u2013/\\u2014 escapes, &mdash;/&ndash;) in what the PLAYER reads:
HTML text nodes and title/aria-label/placeholder/alt attributes, and JS string literals
(single, double, backtick) in .js files and inline <script>s. Comments and code are skipped.
  python3 scripts/fleet/dashes.py satellites/letter-launch            # dry run, prints every change
  python3 scripts/fleet/dashes.py satellites/letter-launch --apply
Rules: 'a — b' -> 'a, b' (or 'a; b' when b starts a capitalised clause); 'word—word' -> 'word, word';
'3–5' -> '3 to 5'; a dash standing alone or between non-words ('— or —', 'SCORE —') -> '·'."""
import re, sys, os
DASH = r'(?:—|–|\\u2014|\\u2013|&mdash;|&ndash;)'
D = re.compile(DASH)
SKIP = re.compile(r'/(node_modules|vendor|libs?|three|rapier|docs/shots|test|tools|__pycache__)/|\.min\.js$')
JS_STR = re.compile(r"""'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`""", re.S)
JS_COMMENT = re.compile(r'//[^\n]*|/\*.*?\*/', re.S)
changes = []
lone = []

ENT = re.compile(r'&(#\d+|#x[0-9a-f]+|\w+);$', re.I)
WORDISH_PREV = set('.,!?)"\'%…»\u2019\u201d]')
WORDISH_NEXT = set('"\'(«\u2018\u201c[')
def fix_text(t):
    # collapse the spaces around every dash first, then decide each one from its neighbours
    t2 = re.sub(r' *' + DASH + r' *', lambda m: D.search(m.group(0)).group(0), t)
    def rep(m):
        s, e = m.start(), m.end()
        pb = t2[:s]; pa = t2[e:]
        prevw = pb[-1:]; nextw = pa[:1]
        prev_ok = bool(prevw) and (prevw.isalnum() or prevw in WORDISH_PREV or bool(ENT.search(pb[-12:])))
        next_ok = bool(nextw) and (nextw.isalnum() or nextw in WORDISH_NEXT or nextw == '&')
        if prevw.isdigit() and nextw.isdigit() and ' ' not in t[max(0, m.start()-1):m.end()+1]:
            return ' to '
        if not prev_ok or not next_ok:
            return ' · '
        pw = re.findall(r'[\w\u2019\']+$', pb); nw = re.findall(r'^[\w\u2019\']+', pa)
        pw = pw[0] if pw else ''; nw = nw[0] if nw else ''
        caps = lambda w: len(w) >= 2 and w.isupper()
        # 'TITAN AT LARGE — WORLD BOSS' and 'Tarot Run — Daily' are labels, not clauses
        if caps(pw) or caps(nw) or (pw[:1].isupper() and nw[:1].isupper() and len(pb.split()) <= 4):
            return ' · '
        return '; ' if (nextw.isupper() and prevw.isalnum()) else ', '
    return D.sub(rep, t2)

def fix_js(code, fname):
    # blank out comments so their dashes are never touched, then rewrite string literals only
    masked = JS_COMMENT.sub(lambda m: ' ' * len(m.group(0)), code)
    out = []; last = 0
    for m in JS_STR.finditer(masked):
        lit = code[m.start():m.end()]
        if D.search(lit):
            q = lit[0]; inner = lit[1:-1]
            if not re.sub(r'\s|' + DASH, '', inner):
                # a literal that is ONLY a dash: a split()/indexOf delimiter in code, or a UI
                # placeholder. Ambiguous, so it is reported and left for a human.
                lone.append((fname, code.count('\n', 0, m.start()) + 1, lit))
                out.append(code[last:m.start()]); out.append(lit); last = m.end(); continue
            new = q + fix_text(inner) + q
            if new != lit:
                changes.append((fname, code.count('\n', 0, m.start()) + 1, lit[:90], new[:90]))
            out.append(code[last:m.start()]); out.append(new); last = m.end()
    out.append(code[last:])
    return ''.join(out)

ATTR = re.compile(r'\b(title|aria-label|placeholder|alt|data-tip|data-title)=("[^"]*"|\'[^\']*\')')
def fix_html(html, fname):
    parts = re.split(r'(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->)', html, flags=re.S | re.I)
    out = []
    for p in parts:
        low = p[:8].lower()
        if low.startswith('<script'):
            m = re.match(r'(<script\b[^>]*>)(.*)(</script>)$', p, re.S | re.I)
            out.append(m.group(1) + fix_js(m.group(2), fname) + m.group(3)); continue
        if low.startswith('<style') or low.startswith('<!--'):
            out.append(p); continue
        # markup: rewrite text between tags and the listed attributes
        segs = re.split(r'(<[^>]+>)', p)
        for i, s in enumerate(segs):
            if s.startswith('<'):
                def arep(m):
                    v = m.group(2); q = v[0]
                    nv = q + fix_text(v[1:-1]) + q
                    if nv != v: changes.append((fname, None, v[:90], nv[:90]))
                    return m.group(1) + '=' + nv
                segs[i] = ATTR.sub(arep, s)
            elif D.search(s):
                ns = fix_text(s)
                if ns != s: changes.append((fname, None, s.strip()[:90], ns.strip()[:90]))
                segs[i] = ns
        out.append(''.join(segs))
    return ''.join(out)

def run(root, apply):
    for dp, dn, fn in os.walk(root):
        for f in fn:
            path = os.path.join(dp, f)
            if SKIP.search('/' + path) or not f.endswith(('.html', '.js')): continue
            try: s = open(path, encoding='utf-8').read()
            except Exception: continue
            if not D.search(s): continue
            new = fix_html(s, path) if f.endswith('.html') else fix_js(s, path)
            if apply and new != s: open(path, 'w', encoding='utf-8').write(new)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    apply = '--apply' in sys.argv
    for r in args: run(r, apply)
    for c in changes:
        print('%s:%s\n   - %s\n   + %s' % (c[0], c[1] or '', c[2], c[3]))
    for l in lone: print('LONE (not touched): %s:%s %s' % l)
    print('%d changes %s, %d lone literals left alone' % (len(changes), 'APPLIED' if apply else '(dry run)', len(lone)))
