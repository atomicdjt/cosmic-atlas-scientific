# v6 numerical methods and scientific semantics

## Ephemeris

Bundled coverage is **JD 2461041.5–2461771.5 TDB**, inclusive (2026-01-01 to
2028-01-01 TDB). Nine targets: Sun 10; Mercury center 199; Venus center 299;
Earth center 399; Mars/Jupiter/Saturn/Uranus/Neptune **system barycenters** 4–8.
These outer target labels do not denote planet surface centers. All responses
identify DE441. Output units are AU and AU/day; one AU is 149597870.7 km.

Queries explicitly select VECTORS, solar-system barycenter `500@0`, ICRF,
REF_PLANE=FRAME, TIME_TYPE=TDB, VEC_CORR=NONE, OUT_UNITS=AU-D, VEC_TABLE=2,
CSV_FORMAT=YES, STEP_SIZE=6 h. These are geometric simultaneous states; no
light-time or stellar aberration is applied. Exact URLs and settings are in
the source metadata and manifest. See the [Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html)
and [API parameter definitions](https://ssd-api.jpl.nasa.gov/doc/horizons.html).

Each six-hour interval uses cubic Hermite interpolation of the two positions
and velocities; velocity is the polynomial's time derivative. Exact grid nodes
are labelled sampled/source-derived, other epochs interpolated/source-derived.
No extrapolation is available. The browser asset and exported states carry a
SHA-256 link to the compiled source artifact. Underlying source uncertainty is
unknown here (null); interpolation residuals are separate numerical diagnostics.

Simultaneous barycentric subtraction supplies heliocentric/geocentric/relative
states. Geometric RA/Dec use conventional ICRF X,Y,Z, whereas the legacy renderer
uses X,Z,Y ordering for sky directions. The orbital plot omits Z, labels axes
and AU scale, and draws the selected body's previous 90 days where supported.

## Time and frames

Julian Date is a representation; its scale must also be stated. UTC input must
be an explicit ISO Z timestamp with a caller-supplied integer TAI−UTC offset.
TT=UTC+(TAI−UTC)+32.184 seconds. A two-term geocentric approximation gives
TDB−TT = 0.001657 sin(g)+0.000022 sin(2g) seconds, where g is the usual solar
mean anomaly in TT centuries. The approximate helper refuses dates outside
1900–2100; this integer-offset UTC helper supports 1972–2099 civil dates only and rejects historical rate-offset UTC. Leap-second instants, UT1 and automatic leap-second prediction are
unsupported. Use JD TDB directly for ephemeris work that needs to avoid this
approximate conversion.

ICRS is a reference system; ICRF realizes its axes. FK5/J2000 is closely aligned
but not identical, and neither identifies Gaia's J2016.0 source epoch. Gaia
proper-motion display and canonical source-epoch exports keep the v5 semantics.
No precession/nutation/EOP/polar-motion/refraction/aberration precision pipeline
was installed. The mean-sidereal observer utility remains explicitly approximate
and unsuitable for telescope pointing. Geocentric state subtraction alone is
not a topocentric apparent place.

## Simulation

The AU/solar-mass/Julian-day Newtonian force uses
G=2.959122082855911e-4 AU³/(solar mass day²). Velocity-Verlet advances positions
from the current acceleration, recomputes acceleration, then advances velocities
from the average. Fixed timesteps preserve the method's symplectic character;
a shortened final step reaches the requested duration exactly. Plummer-style
softening, if selected, changes both force and potential consistently.

The Horizons seed is barycentric Sun–Earth–Mars-system only. Masses are rounded
adopted solar-mass ratios (Sun 1, Earth 3.0034896e-6, Mars system 3.22715e-7),
explicitly approximate model parameters, not a reproduction of DE441 dynamics.
Its initial positions/velocities retain source provenance; every propagated
state becomes numerically integrated model output. Omitted planets, Moon,
relativity and other forces prevent claiming JPL prediction accuracy.

Energy drift uses (E−E0)/|E0|; relative angular-momentum drift uses the norm of
the vector change divided by |L0|. A zero initial denominator remains null.
Linear momentum uses absolute vector change. Center-of-mass residual subtracts
the expected inertial drift R0+P0/M·duration; it does not mistake ordinary COM
motion for numerical error. Solver, timestep, duration, steps and softening
remain visible. Conservation alone does not establish trajectory accuracy.

## Missions

The original circular/copanar Hohmann tool is retained. The new Lambert solver
uses universal variables and Stumpff functions with a near-zero series, stable
trigonometric evaluation and bracketed bisection for **zero revolutions**.
Short and long geometric arc choices are explicit; they are not labelled
prograde/retrograde independently of the endpoint plane. Collinear endpoints,
central singularities, invalid values, unsupported brackets and non-convergence
are rejected. Time residual/tolerance and iteration count accompany solutions.

Horizons heliocentric endpoints drive Sun-only two-body transfers using the
declared gravitational constant. Endpoint velocity differences give departure
and arrival hyperbolic excess speed in km/s. C3 is departure v∞² in km²/s².
It is not launch capability, departure parking-orbit delta-v or arrival capture
delta-v. Planetary-system barycenters and neglected planetary encounters remain
explicit. A 25×25 grid explores departure date and flight time; its minimum is
only the lowest sampled valid C3, not an optimized/certified launch window.

All v5 measurement safeguards and imported-data trust rules remain in force.
