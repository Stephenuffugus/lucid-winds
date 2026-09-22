// TUMBLE tuning. Every number a designer might want to move lives here.
// World units are meters. The table top is y = 0.

export const VERSION = '20260921f';

export const PHYS = {
  hz: 60,                 // fixed physics step (DESIGN 13.1)
  maxStepsPerFrame: 4,
  gravity: -9.81,
  sleepAfter: 0.5,        // seconds at rest before we put a body to sleep (DESIGN 13.1)
  restDrift: 0.004,       // m of drift allowed while "at rest"
  restTurnCos: 0.99966,   // cos(half of 3 degrees): rotation allowed while at rest
  restTurnCosLoose: 0.99144, // cos(half of 15 degrees): the loose clock for socks rocking in place
  thawSpeed: 0.2,         // m/s a moving body needs before it wakes a frozen neighbour
  bodyBudget: 150,        // active body budget (DESIGN 13.2)
  bodyCap: 200,           // hard cap
  dump: { linDamp: 2.6, angDamp: 6.0, settleHold: 0.25, layer: 0.028 },   // extra damping only while the dryer pre-simulates
  sock: { friction: 0.85, restitution: 0.02, linDamp: 0.9, angDamp: 2.4, density: 180 },
  ball: { radius: 0.042, friction: 0.7, restitution: 0.38, linDamp: 0.12, angDamp: 0.9, density: 260 },
  holdHeight: 0.10,       // the finger plane, 10 cm above the table (DESIGN 13.4)
  holdStiffness: 22,      // 1/s, how fast the held body chases the finger
  releaseSamples: 3,      // pointer samples used for flick velocity (DESIGN 3.1)
  maxFlick: 4.2,          // m/s cap on a released sock or ball
};

// The folding table and the back shelf where the basket and the Odd Bin sit.
export const TABLE = {
  halfW: 0.42,
  front: 0.60,            // z of the front rail
  back: -0.98,            // z of the back wall
  playBack: -0.44,        // z where the play area ends and the back shelf begins
  railH: 0.045,
  railT: 0.03,
};

export const BASKET = {
  x: 0.25, z: -0.74,
  radius: 0.125,          // inner rim radius at the top
  bottomRadius: 0.10,
  height: 0.20,
  wallT: 0.012,
  segments: 18,
  bigRadius: 0.15,        // Bigger basket peg
};

export const ODDBIN = {
  x: -0.27, z: -0.74,
  halfW: 0.105, halfD: 0.085, height: 0.13, wallT: 0.01,
};

export const DRYER = {
  x: 0, z: -1.02, doorY: 0.30, doorR: 0.17,
};

export const CAMERA = {
  table: { fov: 42, pos: [0, 1.62, 1.18], look: [0, -0.02, -0.12] },
  room:  { fov: 50, pos: [0.15, 1.55, 2.55], look: [-0.05, 0.25, -0.6] },
};

export const HELD = {
  distance: 0.62,         // meters from the camera along the finger ray
  liftPx: 96,             // the held sock floats this far above the thumb
  scale: 1.55,            // held sock renders large (DESIGN 3.1)
  warmHandsScale: 1.95,   // Warm hands peg
};

export const SHOT = {
  gain: 2.3,              // launch m/s per screen height a second of finger speed (on an 844 px tall phone, 1200 px/s is 3.3 m/s, a basket from mid table)
  minSpeed: 0.55,         // m/s; slower than this and the ball is just set down
  maxSpeed: 4.6,
  elevation: 0.88,        // radians (50 degrees), launch pitch for a flicked ball
  assistAngle: 0.16,      // radians: flicks this close to the basket get nudged toward it
  assist: 0.6,            // how much of the aim gap the nudge closes
  rangeWindow: [0.55, 1.8], // a flick between these fractions of the ideal speed gets its speed nudged too
  rangeAssist: 0.7,       // how much of the speed gap that nudge closes (lands flicks of roughly 1000 to 1500 px/s)
  // (measured 2026-09-17 in headless Chrome at 390x844: the first gain, on table plane speed, was tuned on gate flicks
  //  the harness had stretched into slow drags; with real timing 1485 px/s left at 4.6 m/s and flew two metres long,
  //  and the same flick measured 3.3 or 5.1 m/s depending on where on the screen it started)
  lobTime: 0.72,          // seconds, tap to basket lob flight time
};
