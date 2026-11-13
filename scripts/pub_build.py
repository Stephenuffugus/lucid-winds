#!/usr/bin/env python3
"""Publisher build pipeline: turn a satellite game into a clean ZIP for an
HTML5 game network (GameDistribution / GameMonetize / CrazyGames).

  python3 scripts/pub_build.py <satellite-dir> --target gd|gm [--game-id ID]
  python3 scripts/pub_build.py <satellite-dir> --target crazygames

CrazyGames needs no game id (their SDK knows the game by the page it runs on).
publish/CRAZYGAMES.md says what that target adds and why.

What it does to the copy (never the source):
  1. strips the Sunbeam economy (script tag + init; all game-side calls are
     already `window.Sunbeam &&` guarded)
  2. neutralizes SWS_EXIT and hides the button that called it, by inline
     onclick, by the id the JavaScript wires it to, and by the `.lw-exit`
     class the vendoring bridge appends at run time
  2a. drops every absolute same-origin <script>/<link> whose file the ZIP
     cannot carry, and stubs every absolute .js path in a STRING literal to
     an inert data URL, because half the fleet loads our shell at run time
     where no tag regex can see it
  3. strips canonical, og: and twitter: metas, and takes our other product's
     name out of the title and the visible copy
  4. injects the target network's SDK, VERBATIM per their docs
     (GameMonetize: github.com/MonetizeGame/GameMonetize.com-SDK,
      GameDistribution: github.com/GameDistribution/GD-HTML5 wiki),
     plus a small adapter exposing window.__pubAd() with a 180s throttle
  5. hooks the ad break into the game's round end: fifteen known names in
     four declaration styles, and failing that the game's own capped earn
     helper, which 80 of 84 satellites define identically
  6. prunes top-level folders no shipped file names (the `art-drop/` sheets)
  7. zips the result to publish/dist/<game>-<target>.zip

Every ZIP is then proved by `node publish/tools/pub_verify.mjs <zip>`, which
serves it on a bare origin and plays a round to the end screen with real
pointer events. A build that has not been through that is not a build.

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
window.__pubAdCalls = 0;
window.__pubAdBreaks = 0;
window.__pubAd = function(){
   window.__pubAdCalls++;
   var now = Date.now();
   if (now - window.__pubAdLast < 180000) return;   /* one break per 3 min, max */
   /* 2026-09-02: this read `sdk.showBanner !== 'undefined'`, which compares a
      function to the STRING "undefined" and is therefore always true. It only
      ever worked because the outer typeof guard kept it away from a missing
      sdk. A real typeof check, so a partial SDK cannot throw inside a win screen. */
   if (typeof sdk !== 'undefined' && sdk && typeof sdk.showBanner === 'function') {
      window.__pubAdLast = now;
      window.__pubAdBreaks++;
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
window.__pubAdCalls = 0;
window.__pubAdBreaks = 0;
window.__pubAd = function(){
    window.__pubAdCalls++;
    var now = Date.now();
    if (now - window.__pubAdLast < 180000) return;   /* one break per 3 min, max */
    /* see the note in GM_SDK: `gdsdk.showAd !== 'undefined'` was always true */
    if (typeof gdsdk !== 'undefined' && gdsdk && typeof gdsdk.showAd === 'function') {
        window.__pubAdLast = now;
        window.__pubAdBreaks++;
        gdsdk.showAd();
    }
};
</script>
"""

# CrazyGames, SDK v3, read from their own docs on 2026-11-13:
#   https://docs.crazygames.com/sdk/intro/       (the tag, init, environments)
#   https://docs.crazygames.com/sdk/game/        (gameplayStart/Stop, loadingStart/Stop, happytime, settings)
#   https://docs.crazygames.com/sdk/video-ads/   (requestAd, adStarted/adFinished/adError)
#   https://docs.crazygames.com/requirements/ads/ and /requirements/technical/
# The tag goes in the head before the game code, as their intro page writes it. The
# adapter after it never lets the game depend on the SDK: if the script is blocked or
# the environment is "disabled" (any host that is not theirs or localhost, where every
# call throws), each call below is a no-op and the game plays on.
# What it does, all of it from those pages:
#   init first, and nothing else until init resolves
#   loadingStart/loadingStop around the page load, only when the page is still loading
#   gameplayStart when play begins or resumes, gameplayStop at every break; both are
#     idempotent, so a start never follows a start
#   a midgame ad only at the round end the other two targets already use, after the
#     stop; the UI is blocked from the request until adFinished or adError (their ads
#     page: "Block the UI until either an adFinished or adError event occurs"), audio is
#     muted only once adStarted fires and comes back on finish AND on error, plus a 60 s
#     safety release so a lost callback can never freeze the game
#   game.settings.muteAudio honoured and kept above the game's own sound toggle
#   happytime only on a whole game win (Bloom Breaker's winGame), never per level
# No rewarded ads: no game offers a reward through the other two targets.
CG_SDK = """
<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
<script type="text/javascript">
(function(){
  var cg = null, playing = false, wantPlay = false, adBusy = false, reason = '';
  var adMute = false, setMute = false, ctxs = [], releaseT = null, blocker = null;
  window.__pubAdLast = 0; window.__pubAdCalls = 0; window.__pubAdBreaks = 0;
  window.__cgCtxs = ctxs;
  function call(fn){ if (!cg) return; try { fn(cg); } catch (e) {} }

  /* audio: every AudioContext the game makes is remembered, and resume() is refused
     while an ad plays or the site asks for silence */
  var AC = window.AudioContext || window.webkitAudioContext, acResume = null;
  if (AC) {
    acResume = AC.prototype.resume;
    AC.prototype.resume = function(){
      if (adMute || setMute) return Promise.resolve();
      return acResume.apply(this, arguments);
    };
    var W = function(o){ var c = (o === undefined) ? new AC() : new AC(o); ctxs.push(c); return c; };
    W.prototype = AC.prototype;
    if (window.AudioContext) window.AudioContext = W;
    if (window.webkitAudioContext) window.webkitAudioContext = W;
  }
  function applyMute(){
    var m = adMute || setMute, i, els;
    for (i = 0; i < ctxs.length; i++) {
      var c = ctxs[i];
      try {
        if (m && c.state === 'running') { c.__cgSus = true; c.suspend(); }
        else if (!m && c.__cgSus) { c.__cgSus = false; acResume.call(c); }
      } catch (e) {}
    }
    els = document.querySelectorAll('audio,video');
    for (i = 0; i < els.length; i++) {
      try {
        if (m && !els[i].paused) { els[i].__cgWas = true; els[i].pause(); }
        else if (!m && els[i].__cgWas) { els[i].__cgWas = false; var p = els[i].play(); if (p && p.catch) p.catch(function(){}); }
      } catch (e) {}
    }
  }

  /* the UI is blocked from the ad request until the ad is over or has failed */
  function block(on){
    if (on && !blocker && document.body) {
      blocker = document.createElement('div');
      blocker.setAttribute('aria-hidden', 'true');
      blocker.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.35)';
      document.body.appendChild(blocker);
    } else if (!on && blocker) {
      if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
      blocker = null;
    }
  }
  ['keydown', 'keyup', 'keypress'].forEach(function(k){
    window.addEventListener(k, function(e){ if (adBusy) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  });

  window.__cgStart = function(){
    wantPlay = true;
    if (playing || adBusy || !cg) return;
    playing = true; reason = '';
    call(function(s){ s.game.gameplayStart(); });
  };
  window.__cgStop = function(why){
    wantPlay = false; reason = why || 'hook';
    if (!playing) return;
    playing = false;
    call(function(s){ s.game.gameplayStop(); });
  };
  window.__cgHappy = function(){ call(function(s){ s.game.happytime(); }); };

  function adDone(){
    if (!adBusy) return;
    adBusy = false; window.__pubPaused = false;
    if (releaseT) { clearTimeout(releaseT); releaseT = null; }
    adMute = false; applyMute(); block(false);
  }
  /* the round end hook: stop first, then a midgame. The SDK keeps its own three minute
     spacing and answers a request that is too early with adError (adCooldown), so the
     request is made at every round end and their pacing decides. */
  window.__pubAd = function(){
    window.__pubAdCalls++;
    window.__cgStop('break');
    if (!cg || adBusy) return;
    adBusy = true; window.__pubPaused = true; block(true);
    releaseT = setTimeout(adDone, 60000);
    try {
      cg.ad.requestAd('midgame', {
        adStarted: function(){ window.__pubAdLast = Date.now(); window.__pubAdBreaks++; adMute = true; applyMute(); },
        adFinished: adDone,
        adError: adDone
      });
    } catch (e) { adDone(); }
  };

  /* pause screens: a visible element whose id names a pause (not a button) is a break;
     when it goes away after a pause, play resumes. Nova Bloom pauses inline, with no
     function a hook could find, so this is the one rule that covers all three. */
  function pauseVisible(){
    var els = document.querySelectorAll('[id*="pause" i]'), i;
    for (i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.tagName === 'BUTTON' || /btn|button/i.test(e.id)) continue;
      var r = e.getBoundingClientRect(), st = getComputedStyle(e);
      if (r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden' && +st.opacity > 0.05) return true;
    }
    return false;
  }
  setInterval(function(){
    if (adBusy) return;
    var pv = false; try { pv = pauseVisible(); } catch (e) {}
    if (pv && playing) window.__cgStop('pause');
    else if (!pv && !playing && reason === 'pause') window.__cgStart();
  }, 300);

  /* a game with no start function the builder could hook starts on the first input
     after a break */
  ['pointerdown', 'keydown'].forEach(function(k){
    window.addEventListener(k, function(){
      if (window.__cgStartOnInput && !adBusy && !playing && reason !== 'pause') window.__cgStart();
    }, true);
  });

  try {
    var S = window.CrazyGames && window.CrazyGames.SDK;
    if (S && typeof S.init === 'function') {
      S.init().then(function(){
        var env = S.environment;
        if (env !== 'local' && env !== 'crazygames') return;   /* "disabled": every call throws */
        cg = S;
        var loading = document.readyState !== 'complete';
        if (loading) call(function(s){ s.game.loadingStart(); });
        try {
          setMute = !!(S.game.settings && S.game.settings.muteAudio); applyMute();
          S.game.addSettingsChangeListener(function(n){ setMute = !!(n && n.muteAudio); applyMute(); });
        } catch (e) {}
        function loaded(){
          if (loading) call(function(s){ s.game.loadingStop(); });
          if (wantPlay) { wantPlay = false; window.__cgStart(); }
        }
        if (loading) window.addEventListener('load', loaded); else loaded();
      }).catch(function(){});
    }
  } catch (e) {}
})();
</script>
<style>body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}</style>
"""

# CrazyGames wants gameplayStart whenever play begins or resumes and gameplayStop at
# every break (docs.crazygames.com/sdk/game/). These are the fleet's own names for those
# moments; only the first declaration of each is hooked, and only in a crazygames build.
CG_START = ['startLevel', 'startEndless', 'startGame', 'startMode', 'startRun',
            'resumeGame', 'advanceLevel', 'nextLevel', 'restartLevel']
CG_STOP = ['levelClear', 'levelComplete', 'completeLevel', 'pauseGame', 'toMenu',
           'showMenu', 'goMenu', 'backToMenu']
CG_HAPPY = ['winGame']     # a whole game won; their docs: not for every level

# Three handles, because the fleet ships the same button three different ways and each
# one was found by looking at a built page rather than by reading the source:
#   inline onclick  -> the original rule, which turned out to match almost nothing
#   .lw-exit        -> the class the vendoring bridge gives the button it appends at run
#                      time (Picnic Panic builds it in JavaScript: no id, no onclick)
#   .swsback        -> the arcade back chip (Merge Blast), wired two lines away from the
#                      SWS_EXIT call, which no statement-local id sniffer will ever see
# and the aria labels, which are the one thing the fleet writes consistently. The
# soundtrack chip goes with them: its script is stripped from a publisher build, so
# leaving the button would leave a control that does nothing.
#   [data-go=exit]  -> Pong Arena's menu tile, a data attribute the router reads
# and `[id*="feedback"]`: the builder strips OUR feedback fab, but Jimothy carries a
# feedback form of its own, wired to our endpoint, with a "We would love to hear what
# you think" button on its game over screen. A publisher build must not post anywhere.
HIDE_EXIT_CSS = ('<style>[onclick*="SWS_EXIT"],[data-sws-exit],[data-go="exit"],'
                 '.lw-exit,.swsback,[aria-label*="arcade" i],[aria-label*="soundtrack" i],'
                 '[aria-label*="sky wolf" i],[id*="feedback" i]{display:none!important}</style>')

# Round-end names the fleet actually uses, most specific first. `win` and `finish`
# are last because they are the two that could plausibly belong to something else;
# every earlier name is unambiguous. Kept in step with publish/tools/pick_screen.mjs,
# which reports the same hook per game before anything is built.
# ⭐ Ordered by OUTCOME COVERAGE, not by how likely the name is. The names above the line
# run whether the player won or lost, so the break lands at the end of every round; the
# ones below only run on a win, so a game hooked there shows no midroll to a player who
# keeps losing, which is most players. Berry Vine declares both `winGame` and
# `showResults`, and the first version of this list hooked the win.
ROUND_END = [
    # either outcome
    'endRun', 'endRound', 'roundOver', 'endGame', 'gameOver', 'showResults', 'showResult',
    # win only, used when the game has nothing better
    'completeLevel', 'levelComplete', 'winLevel', 'winGame', 'showWin', 'onWin',
    'finish', 'win']


def prune_unreferenced(root, extra_keep=()):
    """Delete top-level folders that no shipped source file names. Returns
    [(folder, MB)] of what went. Conservative on purpose: only top-level folders,
    only when the folder name appears nowhere as `<name>/` in the code that ships."""
    src = []
    for base, _, files in os.walk(root):
        for f in files:
            if f.rsplit('.', 1)[-1].lower() in ('html', 'htm', 'js', 'mjs', 'css', 'json', 'webmanifest'):
                try:
                    src.append(open(os.path.join(base, f), encoding='utf-8', errors='ignore').read())
                except OSError:
                    pass
    blob = '\n'.join(src)
    gone = []
    for d in sorted(os.listdir(root)):
        p = os.path.join(root, d)
        if not os.path.isdir(p) or d in extra_keep:
            continue
        if (d + '/') in blob or ('/' + d + '"') in blob or ("/" + d + "'") in blob:
            continue
        mb = sum(os.path.getsize(os.path.join(b, f))
                 for b, _, fs in os.walk(p) for f in fs) / 1048576
        shutil.rmtree(p)
        gone.append((d, mb))
    return gone


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

    # 1. sunbeam economy out (some satellites load the SDK by absolute URL so
    #    the same file works from the github.io mirror - strip both forms)
    html = re.sub(r'<script src="(?:https://lucidwinds\.com)?/sunbeam-sdk\.js[^"]*"></script>\n?', '', html)
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

    # 2a2. the studio shell never ships to a publisher: no feedback fab (posts to
    #      our endpoint), no static jukebox tags. Dynamic music loads are satisfied
    #      by the stubs injected below, so nothing 404s.
    #      ⛔ 2026-09-02 (Fable review): the fab LOADER is a 300 byte block, but this regex
    #      matched ANY inline block naming feedback.js, and vine-runner names it inside its
    #      61 KB game script. That build would have shipped with no game in it. Only a
    #      small block is a loader; a big one is left alone, and 2a4 below turns its
    #      runtime load into an inert data URL while the LW_Feedback stub swallows mountFab.
    def _fab_block(m):
        return '' if len(m.group(0)) < 2500 else m.group(0)
    html = re.sub(r"<script>(?:(?!</script>).)*feedback\.js(?:(?!</script>).)*</script>\n?", _fab_block, html, flags=re.S)
    html = re.sub(r'<script src="[^"]*(?:music-tracks|music-player|engagement|dev-gate|arcade-exit)\.js[^"]*"></script>\n?', '', html)

    # 2a3. ⭐ THE GENERAL RULE, and the one that matters most.
    #      Every strip above names a file. That is how this builder shipped a 404 for
    #      three weeks without knowing: `/music-unlocks.js` was added to 105 satellites
    #      on 2026-09-02, the named list above was written in early August, and the tag
    #      sailed straight through. In a publisher ZIP an absolute same-origin path has
    #      no server behind it, so EVERY one of them is a 404, and the music one also
    #      paints a "CONGRATULATIONS, YOU UNLOCKED A SONG" card over a third of the
    #      screen on boot with a button that streams from our host.
    #      So: after the named strips, drop any <script src="/..."> or <link href="/...">
    #      whose file is not in the copy. This cannot be outrun by tomorrow's shell file.
    def _shell_ref(m):
        path = m.group('path').split('?')[0].split('#')[0].lstrip('/')
        if os.path.exists(os.path.join(out_dir, path)):
            return m.group(0)              # the ZIP carries it; leave it alone
        dropped.append('/' + path)
        return ''
    dropped = []
    html = re.sub(r'<script[^>]*\ssrc="(?P<path>/[^"]*)"[^>]*>\s*</script>\n?', _shell_ref, html)
    html = re.sub(r'<link[^>]*\shref="(?P<path>/[^"]*)"[^>]*/?>\n?', _shell_ref, html)
    if dropped:
        print('dropped absolute refs the ZIP cannot carry: ' + ', '.join(sorted(set(dropped))))

    # 2a4. and the ones that are not TAGS at all. Picnic Panic builds its Sunbeam loader
    #      at run time, `s.src = "/sunbeam-sdk.js?v=7"; document.head.appendChild(s)`, and
    #      every game in the fleet does the same with '/feedback.js?v=6'. No tag regex can
    #      ever see those, and an `onerror` that swallows the failure means the game looks
    #      fine while the network's console fills with 404s during review.
    #      Any absolute .js path in a string literal that the ZIP does not carry becomes an
    #      inert data URL: it still assigns, still loads, still fires onload, and never
    #      leaves the page.
    def _js_literal(m):
        q, path = m.group('q'), m.group('path')
        if os.path.exists(os.path.join(out_dir, path.split('?')[0].split('#')[0].lstrip('/'))):
            return m.group(0)
        stubbed.append(path)
        return q + 'data:text/javascript,' + q
    stubbed = []
    html = re.sub(r'(?P<q>["\'])(?P<path>/[A-Za-z0-9._/-]+\.js(?:\?[^"\']*)?)(?P=q)', _js_literal, html)
    if stubbed:
        print('stubbed runtime script loads: ' + ', '.join(sorted(set(stubbed))))
        # a stubbed path that is NOT one of our shell files is the game loading its own
        # code by absolute path (burrow-bowl: /satellites/critter-pal.js). Stubbing that
        # blanks the game. Say so, loudly; the ZIP needs that file copied in by hand.
        SHELL = ('/music-unlocks.js', '/feedback.js', '/sunbeam-sdk.js', '/arcade-exit.js',
                 '/music-tracks.js', '/dev-gate.js', '/music-player.js', '/engagement.js', '/sw.js')
        odd = sorted(set(p.split('?')[0] for p in stubbed) - set(SHELL))
        if odd:
            print('!! review: stubbed a NON-shell script the game loads by absolute path, the '
                  'game will be missing code: ' + ', '.join(odd))

    # 2b. no PWA surface in a publisher build: the sw.js and manifest files are
    #     excluded from the copy, so the references must go too or the console
    #     fills with 404s during review
    html = re.sub(r'<link rel="manifest"[^>]*/?>\n?', '', html)
    html = re.sub(r"navigator\.serviceWorker\.register\(", "window.__pubNoSW(", html)

    # 2c. the exit BUTTON, not just the exit function.
    #     SWS_EXIT was neutralised in step 2 and HIDE_EXIT_CSS hides anything with an
    #     inline onclick that names it. Measured against the fleet, almost nothing does:
    #     the exits are wired in JavaScript, `el('exitBtn').onclick=...` and
    #     `tap('b-exit', ...)`, so the CSS matched nothing and the build shipped a button
    #     reading "Sky Wolf Studio Arcade" that was now dead as well as forbidden.
    #     Read the id out of the wiring, and only hide it if that id really exists.
    #     ⛔ 2026-09-02 (Fable review): the first version of this sniffer read the WHOLE
    #     document. Bloom Breaker and Garden Guard carry the HTML comment
    #     `<!-- exit / cross-promo (only element that calls SWS_EXIT) -->` two lines under
    #     `<canvas id="game">`, the lookback found "game", and both publisher builds shipped
    #     with the PLAYFIELD display:none. The verifier passed them (the game over card is
    #     DOM) and the marketing pass photographed a black table and called it "dark".
    #     Now: only script bodies are searched, and a canvas is never an exit button.
    exit_ids = []
    for body in re.findall(r'<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)</script>', html):
        for m in re.finditer(r'SWS_EXIT', body):
            if body[max(0, m.start() - 8):m.start()].rstrip().endswith('window.') and \
               body[m.end():m.end() + 10].lstrip().startswith('='):
                continue                                   # the definition itself
            # look back over the statement AND the line before it: Merge Blast fetches the
            # element on one line and wires it on the next, so a lookback that stops at the
            # newline finds no id at all
            stmt = body[max(0, m.start() - 260):m.start()]
            stmt = ';'.join(re.split(r';', stmt)[-2:])
            # `$("#exitPortalBtn")` (Blooming Words) carries the id with a leading `#`;
            # the first version of this pattern refused the hash and shipped the button
            ids = re.findall(r'''['"]#?([A-Za-z][\w-]{1,40})['"]''', stmt)
            for cand in reversed(ids):
                tag = re.search(r'<([A-Za-z0-9]+)[^>]*\sid\s*=\s*["\']%s["\']' % re.escape(cand), html)
                if tag and tag.group(1).lower() != 'canvas':
                    exit_ids.append(cand)
                    break
    exit_ids = sorted(set(exit_ids))
    exit_css = ('<style>' + ','.join('#' + i for i in exit_ids) + '{display:none!important}</style>') if exit_ids else ''
    if exit_ids:
        print('hid portal exit element(s): ' + ', '.join('#' + i for i in exit_ids))

    # 2d. our brand out of the head. A "Lucid Winds Edition" of a game on GameMonetize
    #     reads as somebody else's build; og:/twitter: cards point at a portal listing
    #     that a publisher build is not allowed to advertise.
    def _title(m):
        t = re.sub(r'\s*[·|]\s*[^·|]*(?:Lucid Winds|Sky Wolf)[^·|]*', '', m.group(1)).strip()
        return '<title>' + (t or m.group(1).split('·')[0].strip()) + '</title>'
    html = re.sub(r'<title>(.*?)</title>', _title, html, flags=re.S)
    html = re.sub(r'<meta (?:property|name)="(?:og|twitter):[^"]*"[^>]*/?>\n?', '', html)
    # JSON-LD is search engine furniture describing the game AT OUR URL. In a publisher
    # ZIP the url and image fields are emptied by the domain sweep and what is left is a
    # structured claim with holes in it. Out.
    html = re.sub(r'<script[^>]*type="application/ld\+json"[^>]*>[\s\S]*?</script>\n?', '', html)

    # 2e. our OTHER product's name out of the visible copy. Bloom Breaker's footer reads
    #     "Sky Wolf Studio · a Lucid Winds satellite"; on GameMonetize that is a claim
    #     about a game the player cannot see. The studio byline stays (it is ours to
    #     sign), the cross-brand tail goes. Text nodes only: script and style bodies are
    #     cut out first, because `a > b && c < d` in JavaScript looks exactly like a text
    #     node to a regex and rewriting it would silently break the game.
    def _debrand_text(chunk):
        def one(m):
            t = m.group(1)
            if 'Lucid Winds' not in t:
                return m.group(0)
            parts = [p for p in re.split(r'\s*[·|]\s*', t) if 'Lucid Winds' not in p]
            return '>' + (' · '.join(parts) if parts else '') + '<'
        return re.sub(r'>([^<>]*)<', one, chunk)

    pieces = re.split(r'(<script[\s\S]*?</script>|<style[\s\S]*?</style>)', html)
    html = ''.join(p if i % 2 else _debrand_text(p) for i, p in enumerate(pieces))

    # 3. no canonical/og/twitter pointers at our hosting
    html = re.sub(r'<link rel="canonical"[^>]*/?>\n?', '', html)
    html = re.sub(r'<meta (?:property|name)="(?:og:url|og:image|twitter:image|twitter:url)"[^>]*/?>\n?', '', html)

    # 3b. CrazyGames only (the other two targets build exactly as before): the studio
    #     never claims "hand built" or "hand made" in copy that goes out, and Bloom
    #     Breaker's meta description still says "60 hand built levels". Text and
    #     attributes only; script and style bodies are left alone.
    if target == 'crazygames':
        HAND = r'\bhand[- ](?:built|made|painted|drawn|crafted)\s+'
        pieces = re.split(r'(<script[\s\S]*?</script>|<style[\s\S]*?</style>)', html)
        html = ''.join(p if i % 2 else re.sub(HAND, '', p, flags=re.I) for i, p in enumerate(pieces))

    # 4. SDK + exit-hider, injected right after <head>
    sdk = {'gm': GM_SDK, 'gd': GD_SDK, 'crazygames': CG_SDK}[target].replace('%GAME_ID%', game_id)
    # ⭐ the last of the economy, and the only part that survives a static strip.
    #    `window._sbCapEarn` is defined INSIDE each game, not in the SDK we remove, and it
    #    keeps its own daily cap in localStorage. So a publisher build still counted the
    #    grant and still printed it: "☀ +6 sunbeams" on Dew Snip's win screen, "☀ no
    #    sunbeams this run" on Berry Vine's and Garden Guard's. Both are a promise about a
    #    currency that does not exist in this build. The strings are built at run time
    #    from JavaScript, so no text pass can reach them; a small observer hides the leaf
    #    element they land in, whenever they land.
    nosw = ('<script>window.__pubNoSW=function(){var p={then:function(){return p},"catch":function(){return p}};return p};'
            'window.LW_TRACKS=window.LW_TRACKS||[];window.SWSPlayer=window.SWSPlayer||{init:function(){}};'
            'window.LW_Feedback=window.LW_Feedback||{mountFab:function(){}};'
            '(function(){var RX=/sunbeam|\\bdew drops?\\b|support the studio|\\bdonate\\b|tip jar/i,t=null;'
            'function hide(e){var n=e,d=0;while(n&&d<3){var g=(n.tagName||"").toLowerCase();'
            'if(g==="button"||g==="a"||n.getAttribute&&n.getAttribute("role")==="button"){n.style.display="none";return;}'
            'n=n.parentElement;d++;}e.style.display="none";}'
            'function sweep(){var e=document.body?document.body.getElementsByTagName("*"):[],i;'
            'for(i=0;i<e.length;i++){if(!e[i].children.length&&RX.test(e[i].textContent||""))'
            'hide(e[i]);}}'
            'function q(){if(t)return;t=setTimeout(function(){t=null;try{sweep();}catch(x){}},120);}'
            'if(document.readyState!=="loading")q();else document.addEventListener("DOMContentLoaded",q);'
            'try{new MutationObserver(q).observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch(x){}'
            '})();</script>'
            '<style>#musicLink,#installLink,#music-link,#install-link{display:none!important}</style>')
    html = html.replace('<head>', '<head>' + nosw + HIDE_EXIT_CSS + exit_css + sdk, 1)

    # 5. ad break at the round end
    #
    # 2026-09-02: the old version looked for exactly four names in exactly one
    # declaration style and, failing that, rewrote `window._sbCapEarn&&window._sbCapEarn(`
    # call sites. Measured against the live fleet that pair covers 5 satellites out of
    # 84: the fleet writes `if(window._sbCapEarn) granted=window._sbCapEarn(n,tag)`,
    # which the rewrite never matched, and its round ends are called endRun, winGame,
    # winLevel, showResults and half a dozen other names. Both halves are widened here,
    # and the fallback now hooks the game's OWN `window._sbCapEarn=function(n,tag){`
    # definition - 80 of 84 satellites carry that exact line - so one insertion covers
    # every earn site in the file instead of one text shape of them.
    AD = 'try{window.__pubAd&&window.__pubAd();}catch(e){}'
    hook_name = hook_kind = None
    for fn in ROUND_END:
        for pat in (r'(function\s+%s\s*\([^)]*\)\s*\{)' % fn,
                    r'((?:var|let|const)\s+%s\s*=\s*function\s*\([^)]*\)\s*\{)' % fn,
                    r'((?:var|let|const)\s+%s\s*=\s*\([^)]*\)\s*=>\s*\{)' % fn,
                    r'(\b%s\s*:\s*function\s*\([^)]*\)\s*\{)' % fn):
            if re.search(pat, html):
                html = re.sub(pat, r'\1' + AD, html, count=1)
                hook_name, hook_kind = fn, 'round-end function'
                break
        if hook_name:
            break
    # a win-only hook shows no break to a player who loses, and most players lose. If the
    # primary hook was one of the win-only names, hook the matching defeat as well. The
    # 180 s throttle means a game that somehow fires both still serves one break.
    WIN_ONLY = {'completeLevel', 'levelComplete', 'winLevel', 'winGame', 'showWin',
                'onWin', 'finish', 'win'}
    defeat_hook = None
    if hook_name in WIN_ONLY:
        for fn in ('loseLevel', 'loseGame', 'showLose', 'gameLose', 'defeat', 'failLevel'):
            pat = r'(function\s+%s\s*\([^)]*\)\s*\{)' % fn
            if re.search(pat, html):
                html = re.sub(pat, r'\1' + AD, html, count=1)
                defeat_hook = fn
                break

    if not hook_name:
        pat = r'(window\._sbCapEarn\s*=\s*function\s*\([^)]*\)\s*\{)'
        if re.search(pat, html):
            html = re.sub(pat, r'\1' + AD, html, count=1)
            hook_name, hook_kind = '_sbCapEarn', 'capped earn helper'
    if not hook_name:
        print('!! no round-end function and no earn helper - SDK loads (preroll works) '
              'but there is no midroll hook. Do not ship this one.')
    else:
        print(f'midroll hooked at {hook_kind} `{hook_name}`'
              + (f', plus the defeat function `{defeat_hook}`' if defeat_hook else ''))
    hooked = hook_name is not None

    # 5b. CrazyGames only: gameplay start and stop at the game's own moments. The round
    #     end needs no hook of its own: __pubAd stops gameplay before it asks for the ad.
    if target == 'crazygames':
        def _hook(fn, code):
            for pat in (r'(function\s+%s\s*\([^)]*\)\s*\{)' % fn,
                        r'((?:var|let|const)\s+%s\s*=\s*function\s*\([^)]*\)\s*\{)' % fn,
                        r'((?:var|let|const)\s+%s\s*=\s*\([^)]*\)\s*=>\s*\{)' % fn):
                # no `name: function` here: Garden Guard's sound table has a
                # `levelClear:function(){` that plays a chime, not a game moment
                if re.search(pat, html):
                    return re.sub(pat, lambda m: m.group(1) + code, html, count=1), True
            return html, False
        starts, stops, happy = [], [], []
        for fn in CG_START:
            html, ok = _hook(fn, 'try{window.__cgStart&&window.__cgStart();}catch(e){}')
            if ok: starts.append(fn)
        for fn in CG_STOP:
            html, ok = _hook(fn, "try{window.__cgStop&&window.__cgStop('hook');}catch(e){}")
            if ok: stops.append(fn)
        for fn in CG_HAPPY:
            html, ok = _hook(fn, 'try{window.__cgHappy&&window.__cgHappy();}catch(e){}')
            if ok: happy.append(fn)
        if not starts:
            html = html.replace('</head>', '<script>window.__cgStartOnInput=true;</script></head>', 1)
        print('crazygames gameplayStart at: ' + (', '.join(starts) or 'first input after a break (no start function found)'))
        print('crazygames gameplayStop at: ' + ', '.join(stops + ['the round end before the ad', 'a visible pause screen']))
        if happy:
            print('crazygames happytime at: ' + ', '.join(happy))

    # 6. networks forbid links or branding pointing at our own portal: neutralize
    #    any remaining our-domain URL inside JS/HTML string literals (share links,
    #    canvas watermarks). Structured tags were stripped above; this is the sweep.
    html = re.sub(r'https?://(?:www\.)?(?:lucidwinds\.com|stephenuffugus\.github\.io)[^"\'\s)]*', '', html)
    html = re.sub(r'(["\'])(?:www\.)?lucidwinds\.com[^"\']*(["\'])', r'\1\2', html)

    open(idx, 'w', encoding='utf-8').write(html)
    print(f'index.html {n0} -> {len(html)} bytes; midroll hook: {hooked}')

    # a build tool that can emit broken HTML must prove it did not:
    # extract every inline script and node --check it
    import subprocess, tempfile
    # ⛔ only JavaScript. This checker used to node --check every inline block including
    # `type="application/ld+json"`, which is JSON and fails to parse as a program: the
    # first game with structured data in its head (Jimothy) tripped a build that was
    # perfectly fine.
    blocks = [b for t, b in re.findall(r'<script(?![^>]*src=)([^>]*)>(.*?)</script>', html, re.S)
              if not re.search(r'type\s*=\s*"(?!text/javascript|application/javascript|module)', t)]
    for bi, b in enumerate(blocks):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
            tf.write(b); tp = tf.name
        r = subprocess.run(['node', '--check', tp], capture_output=True, text=True)
        os.unlink(tp)
        if r.returncode != 0:
            print(f'!! SYNTAX BROKEN in inline script #{bi}:\n{r.stderr[:400]}')
            sys.exit(1)
    print(f'{len(blocks)} inline scripts parse clean')

    # 7. dead weight out. Several satellites keep an `art-drop/` beside the game: the
    #    raw generated sheets the shipped art was cut from. Nothing in the game names
    #    them, and they are 63 MB of Nectar Drop's 89 MB and 32 MB of Tonic Drop's 34.
    #    The rule is mechanical and checkable: a top-level folder no shipped html, js,
    #    css or json file mentions cannot be loaded, so it cannot be needed.
    #    Runs AFTER index.html is rewritten, so a folder that only the stripped og:image
    #    referred to counts as unreferenced too.
    pruned = prune_unreferenced(out_dir)
    if pruned:
        print('pruned unreferenced: ' + ', '.join(f'{d}/ ({mb:.1f} MB)' for d, mb in pruned))

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
    ap.add_argument('--target', choices=['gd', 'gm', 'crazygames'], required=True)
    ap.add_argument('--game-id', default='REPLACE_WITH_GAME_ID')
    a = ap.parse_args()
    build(a.src, a.target, a.game_id)
