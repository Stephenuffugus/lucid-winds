#!/usr/bin/env python3
"""Publisher build pipeline: turn a satellite game into a clean ZIP for an
HTML5 game network (GameDistribution / GameMonetize).

  python3 scripts/pub_build.py <satellite-dir> --target gd|gm [--game-id ID]

What it does to the copy (never the source):
  1. strips the Sunbeam economy (script tag + init; all game-side calls are
     already `window.Sunbeam &&` guarded)
  2. neutralizes SWS_EXIT and hides any button that called it (publisher
     networks forbid external links / portals inside the game)
  3. strips canonical/og:url metas that point at our domains
  4. injects the target network's SDK, VERBATIM per their docs
     (GameMonetize: github.com/MonetizeGame/GameMonetize.com-SDK,
      GameDistribution: github.com/GameDistribution/GD-HTML5 wiki),
     plus a small adapter exposing window.__pubAd() with a 180s throttle
  5. hooks the ad break into completeLevel() when present (win screens are
     the placement both networks recommend; never on initial load)
  6. zips the result to publish/dist/<game>-<target>.zip

Game IDs come from each network's developer panel after the game entry is
created; rebuild with --game-id before uploading.
"""
import argparse, os, re, shutil, sys, zipfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GM_SDK = """
<script type="text/javascript">
   window.SDK_OPTIONS = {
      gameId: "%GAME_ID%",
      onEvent: function (a) {
         switch (a.name) {
            case "SDK_GAME_PAUSE":
               window.__pubPaused = true;
               break;
            case "SDK_GAME_START":
               window.__pubPaused = false;
               break;
            case "SDK_READY":
               break;
         }
      }
   };
(function (a, b, c) {
   var d = a.getElementsByTagName(b)[0];
   a.getElementById(c) || (a = a.createElement(b), a.id = c, a.src = "https://api.gamemonetize.com/sdk.js", d.parentNode.insertBefore(a, d))
})(document, "script", "gamemonetize-sdk");
window.__pubAdLast = 0;
window.__pubAd = function(){
   var now = Date.now();
   if (now - window.__pubAdLast < 180000) return;   /* one break per 3 min, max */
   if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
      window.__pubAdLast = now;
      sdk.showBanner();
   }
};
</script>
"""

GD_SDK = """
<script type="text/javascript">
window["GD_OPTIONS"] = {
    "gameId": "%GAME_ID%",
    "onEvent": function(event) {
        switch (event.name) {
            case "SDK_GAME_START":
                window.__pubPaused = false;
                break;
            case "SDK_GAME_PAUSE":
                window.__pubPaused = true;
                break;
        }
    },
};
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://html5.api.gamedistribution.com/main.min.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'gamedistribution-jssdk'));
window.__pubAdLast = 0;
window.__pubAd = function(){
    var now = Date.now();
    if (now - window.__pubAdLast < 180000) return;   /* one break per 3 min, max */
    if (typeof gdsdk !== 'undefined' && gdsdk.showAd !== 'undefined') {
        window.__pubAdLast = now;
        gdsdk.showAd();
    }
};
</script>
"""

HIDE_EXIT_CSS = '<style>[onclick*="SWS_EXIT"],[data-sws-exit]{display:none!important}</style>'


def build(src_dir, target, game_id):
    name = os.path.basename(os.path.normpath(src_dir))
    out_dir = os.path.join(REPO, 'publish', 'build', f'{name}-{target}')
    dist = os.path.join(REPO, 'publish', 'dist')
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(dist, exist_ok=True)
    shutil.copytree(src_dir, out_dir, ignore=shutil.ignore_patterns(
        'sw.js', 'manifest.webmanifest', '*.md', 'design'))

    idx = os.path.join(out_dir, 'index.html')
    html = open(idx, encoding='utf-8').read()
    n0 = len(html)

    # 1. sunbeam economy out
    html = re.sub(r'<script src="/sunbeam-sdk\.js[^"]*"></script>\n?', '', html)
    html = re.sub(r'<script>window\.Sunbeam&&Sunbeam\.init[^<]*</script>\n?', '', html)

    # 2. no exits to our portal — brace-BALANCED replace; the body nests
    #    braces (if/else), and a lazy [^}]* left the else clause orphaned
    #    as a syntax error in the first build of this very script
    m = re.search(r'window\.SWS_EXIT=function\(\)\{', html)
    if m:
        i = m.end(); depth = 1
        while i < len(html) and depth:
            if html[i] == '{': depth += 1
            elif html[i] == '}': depth -= 1
            i += 1
        html = html[:m.start()] + 'window.SWS_EXIT=function(){}' + html[i:]

    # 3. no canonical/og/twitter pointers at our hosting
    html = re.sub(r'<link rel="canonical"[^>]*/?>\n?', '', html)
    html = re.sub(r'<meta (?:property|name)="(?:og:url|og:image|twitter:image|twitter:url)"[^>]*/?>\n?', '', html)

    # 4. SDK + exit-hider, injected right after <head>
    sdk = (GM_SDK if target == 'gm' else GD_SDK).replace('%GAME_ID%', game_id)
    html = html.replace('<head>', '<head>' + HIDE_EXIT_CSS + sdk, 1)

    # 5. ad break at the win screen
    hooked = False
    for fn in ('completeLevel', 'gameOver', 'endRound', 'showWin'):
        pat = r'(function %s\([^)]*\)\{)' % fn
        if re.search(pat, html):
            html = re.sub(pat, r'\1try{window.__pubAd&&window.__pubAd();}catch(e){}', html, count=1)
            hooked = True
            break
    if not hooked:
        print('!! no round-end function found - SDK loads (preroll works) but no midroll hook')

    open(idx, 'w', encoding='utf-8').write(html)
    print(f'index.html {n0} -> {len(html)} bytes; midroll hook: {hooked}')

    # a build tool that can emit broken HTML must prove it did not:
    # extract every inline script and node --check it
    import subprocess, tempfile
    blocks = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', html, re.S)
    for bi, b in enumerate(blocks):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
            tf.write(b); tp = tf.name
        r = subprocess.run(['node', '--check', tp], capture_output=True, text=True)
        os.unlink(tp)
        if r.returncode != 0:
            print(f'!! SYNTAX BROKEN in inline script #{bi}:\n{r.stderr[:400]}')
            sys.exit(1)
    print(f'{len(blocks)} inline scripts parse clean')

    zpath = os.path.join(dist, f'{name}-{target}.zip')
    if os.path.exists(zpath):
        os.remove(zpath)
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(out_dir):
            for f in files:
                p = os.path.join(root, f)
                z.write(p, os.path.relpath(p, out_dir))
    print(f'wrote {zpath} ({os.path.getsize(zpath)//1024} KB)')

    # leftovers that would fail publisher review
    left = re.findall(r'https?://(?:www\.)?(?:lucidwinds\.com|stephenuffugus\.github\.io)[^"\'\s)]*', html)
    if left:
        print('!! review: our-domain URLs still referenced:')
        for u in sorted(set(left)):
            print('   ' + u)
    return zpath


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src')
    ap.add_argument('--target', choices=['gd', 'gm'], required=True)
    ap.add_argument('--game-id', default='REPLACE_WITH_GAME_ID')
    a = ap.parse_args()
    build(a.src, a.target, a.game_id)
