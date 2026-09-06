# Updraft, decisions taken without asking (newest last)

**PAYOUT_RATE 10, REEL_RATE 2.5 with a separate REEL_BOOST 6, not the plan's REEL 6 / PAYOUT 4.**
With 6 m/s of line coming in, the plan's own launch rhythm (hold 0.6 s, release 0.6 s) nets line IN and the kite can never leave the 8 m layer; a 6 s hold at 40 m reeled the kite into the hand before a figure 8 could finish. The tug's airspeed boost stays 6 m/s; the line itself comes in at 2.5 m/s.

**The reel boost applies only while the line is actually moving (L above LINE_MIN).**
A kite reeled to the hand hovered at the zenith forever under a continuous hold; with the line fully in there is nothing to pull it through the air, so it stalls and drops back, which is the plan's assertion.

**Line pays out only while the kite pulls (tension above PAYOUT_PULL 0.5 N).**
A stalled, falling kite that kept paying out line rose in altitude in the descend test; a slack line does not leave the reel.

**Apparent mass 0.4 kg added to the kite's mass; velocity damping 0.5 rho A CD_motion (v + 2).**
At 0.12 kg the plan's forces gave 350 m/s2 and the kite reached the zenith in a quarter second. The air moving with a 0.5 m2 sail is about 0.3 kg; the damping floor stops a slow pendulum on 120 m of line.

**Own speed only subtracts from airspeed, at DIVE_LOSS 0.35, never adds.**
The plan's Va = W_eff + reel minus v_along fed back on a climb (a climbing kite gained airspeed, gained lift, climbed faster: 130 N) and death spiralled on any sink.

**STALL_V 1.6, not 2.2; EL_MAX 1.0, not 1.45; WINDOW_FLOOR 0.**
With the window as cos(el) and STALL_V 2.2 a Fresh Diamond parked at exactly its stall angle and luffed forever. A Diamond's window top is about 57 degrees; at 1.0 rad it still pulls in Fresh, so the release pays out and the launch rhythm walks up.

**The tail's righting torque goes as sin(angle); a nose straight down stays down until the thumb says otherwise.**
Proportional relaxation was fastest when the nose was fully down, so no dive could develop; a kite pointing at the grass under tension dives, which is the game.

**Tail constraints are follow the leader from the pinned end, twice, not two half and half passes.**
The plan's assertion is one percent on every segment after every step; the symmetric pass left a sixteen segment chain a few percent off under a crack.

**The stall suite's watched failure is STALL_V=0, not the plan's STALL_LIFT=1.**
At 1.5 m/s of airspeed the lift is 0.7 N whatever the factor, so zeroing the factor changes nothing measurable; the stall's teeth are the flag itself (STALL_SINK and STALL_FALL hang off it).

**A Stall Save needs the thumb: the hold must be on at the catch, and the stall must begin above the turbulent layer.**
A Fresh kite luffing at the top catches itself; that is not a trick.

**Mabel stands downwind and to the right at (22, 26) m, crown 9 m up, radius 7 m.**
A kite on a line cannot reach a tree upwind of the player; the design's "upwind" is kept in the words, the geometry puts her where a kite can be snagged.

**Diamond maxTension 60 N (Delta 80, Box 90, Sled 50, Dragon 45).**
The plan names the field and not the number. 60 sits above the Fresh peak at any window angle (asserted) and below a Blustery gust peak under a hold.

**The camera is angular: azimuth is screen x, elevation is screen y, distance is the kite's size.**
A perspective from the hand puts a kite beside the player off the screen; the plan's field with the grass at the bottom is exactly what an angular view of a kite gives.

**tools/shots.mjs and tools/thumb.mjs use UPDRAFT_DEV.place to put the kite aloft. test/*.mjs never do.**
A camera may take that liberty; a gate may not.
