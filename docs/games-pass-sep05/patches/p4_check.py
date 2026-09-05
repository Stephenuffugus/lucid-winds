P='/workspaces/Litter_Bug/check.js'
s=open(P).read()
anchor="    // ══ A CORRUPT SAVE ════════════════════════════════════════════════\n"
assert s.count(anchor)==1
new=r"""    // ══ A CLEAN SHIFT ENDS AT FORTY, THE FEATURED BLOCK STAMPS THE WEEK ═
    group('forty ends the shift, and the featured block stamps the week');
    /* Drives bump(), the function the jobs call. Before 2026-09-05 forty was a ceiling you
       sat under for the rest of the minute; now it is the finish line, the time is kept per
       block, and a clean shift on the day's featured block stamps a seven day strip. */
    const clPage = await open(FILE + '?lbtest=1');
    const cl = await clPage.evaluate(async () => {
      const D = window.LB_DEV; D.reset();
      const feat = D.featured(), SHIFT = D.shiftCap();
      D.startJob(feat);
      await new Promise(r => setTimeout(r, 300));
      let taps = 0;
      for (let i = 0; i < 40 && !D.state().over; i++) { D.bump(2); taps++; }
      const st = D.state(), scr = D.cur();
      const head = document.getElementById('d-head').textContent;
      const note = document.getElementById('d-note').textContent;
      const t = (D.save().times || {})[feat];
      const wk = D.save().week, dow = D.dow();
      const stampedToday = !!(wk && wk.s && wk.s[dow]);
      const strip = document.querySelectorAll('#d-week .wd').length;
      const stripOn = document.querySelectorAll('#d-week .wd.on').length;
      /* the picker */
      D.show('s-home'); document.getElementById('b-scav').click();
      const first = document.querySelector('#s-block .stack .btn');
      const firstJob = first && first.getAttribute('data-job');
      const prim = document.querySelectorAll('#s-block .btn.primary').length;
      const chip = first && first.querySelector('.fb') ? first.querySelector('.fb').textContent : null;
      const bestTxt = first && first.querySelector('.best') ? first.querySelector('.best').textContent : '';
      const chipR = first && first.querySelector('.fb') ? first.querySelector('.fb').getBoundingClientRect() : null;
      const pickStrip = document.querySelectorAll('#block-week .wd').length;
      /* a clean shift on a block that is NOT featured must not stamp */
      const other = ['sort', 'grub', 'wire', 'pry'].filter(k => k !== feat)[0];
      D.startJob(other);
      await new Promise(r => setTimeout(r, 300));
      for (let i = 0; i < 40 && !D.state().over; i++) D.bump(2);
      const head2 = document.getElementById('d-head').textContent;
      const stamps2 = D.save().week.s.reduce((a, b) => a + b, 0);
      const week2 = document.querySelectorAll('#d-week .wd').length;
      /* a shift that runs out of clock is still SHIFT OVER */
      D.startJob(other);
      await new Promise(r => setTimeout(r, 200));
      D.bump(3); D.endJob();
      const head3 = document.getElementById('d-head').textContent;
      return { feat, SHIFT, taps, over: st.over, score: st.score, tLeft: st.t, scr, head, note, t, stampedToday, strip, stripOn,
        firstJob, prim, chip, chipW: chipR ? Math.round(chipR.width) : 0, bestTxt, pickStrip, other, head2, stamps2, week2, head3 };
    });
    await clPage.close();
    ok(cl.over && cl.scr === 's-done' && cl.score === cl.SHIFT, 'forty Shinies ends the shift, the done screen is up', cl);
    ok(cl.tLeft > 0 && cl.taps <= cl.SHIFT / 2 + 1, 'it ended while the clock still had time on it', { tLeft: cl.tLeft, taps: cl.taps });
    ok(cl.head === 'CLEAN SHIFT', 'the done screen says CLEAN SHIFT', cl.head);
    ok(cl.t > 0 && cl.t <= 60 && /Forty in [\d.]+ seconds/.test(cl.note), 'the clean time is kept for the block and read out', { t: cl.t, note: cl.note });
    ok(cl.stampedToday && cl.strip === 7 && cl.stripOn === 1, 'a clean shift on the featured block stamps today on a seven day strip', cl);
    ok(cl.firstJob === cl.feat && cl.prim === 1 && cl.chip === 'TODAY' && cl.chipW > 30, 'the picker puts the featured block first, alone in green, wearing a TODAY chip', cl);
    ok(/CLEAN/.test(cl.bestTxt) && cl.pickStrip === 7, 'the picker shows the clean time on that block and the week strip', { bestTxt: cl.bestTxt, pickStrip: cl.pickStrip });
    ok(cl.head2 === 'CLEAN SHIFT' && cl.stamps2 === 1 && cl.week2 === 0, 'a clean shift on another block is clean but does not stamp the week', cl);
    ok(cl.head3 === 'SHIFT OVER', 'a shift that runs out of clock is SHIFT OVER, not clean', cl.head3);

"""
s=s.replace(anchor,new+anchor)
open(P,'w').write(s)
print('check patched')
