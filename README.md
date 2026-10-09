# FLOWLINK

Interactive React / TypeScript automotive visualization built with Three.js and a Next-compatible Vinext runtime.

## Experience
Scroll through a semi-truck perspective, vehicle intelligence, communication links, predicted paths, adaptive signals and simulation results. Chapter buttons and play/pause provide alternate navigation. Reduced-density rendering is used on mobile; SVGRenderer provides a lightweight 3D fallback without WebGL. The Atlanta environment is procedural and illustrative, not a surveyed model.

## Model
`lib/flowlink/simulation.ts` runs the same 12 vehicle arrivals through fixed-cycle and predictive controllers. Candidate green durations are scored by forecast waiting time; yellow and all-red clearance precede each opposing phase. Stop lines, following distance and occupancy constraints apply to both controllers. Results compare completed journey times, not marketing constants. Traffic-light sequencing follows green → yellow → all-red → opposing green.

The model is an illustrative two-axis, straight-through intersection with two lanes per direction. It is not a calibrated transport model, production control system, or validated Atlanta performance claim. Conflict counts indicate overlapping free-flow arrival windows, not crashes prevented relative to the baseline. Both controllers are collision-constrained.

`SimulationDataProvider` and `RealtimeDataProvider` implement a common snapshot interface. The real-time adapter accepts snapshots through `ingest`; no hardware, networking transport or credentials are included.

## Configuration and modules
- `lib/flowlink/simulation.ts`: vehicle demand, timing configuration, predicted arrivals, candidate scoring, safety constraints, replay frames and metrics.
- `lib/flowlink/story.ts`: story state definitions and chapter progress.
- `lib/flowlink/world.ts`: reusable procedural vehicles, streetscape, camera, chips, links and trajectories.
- `app/components/FlowLinkExperience.tsx`: scroll control, navigation, playback and results.

## Validation
TypeScript checks and production build pass. Both simulation runs were checked over 2,202 frames for vehicle overlap and red-light entry; none found. Chapter and result controls were checked in the preview browser. Its GPU context is disabled, so visual inspection used the SVG fallback; WebGL performance still needs device testing. No reference image was attached to the brief.

## Updated choreography
The attached `public/models/FlowLink_OBU-HD1_RevA.stl` is loaded as the actual neutral translucent enclosure. A small upright internal PCB and pulsating processor are illustrative additions. The unit is placed below the driver's steering column, with a diagnostic coupling, rear pass-through lead and coax routed up the A-pillar to a roof puck. The cutaway magnifies the unit for legibility and is labeled as such; the procedural internals are not a fabrication specification.

The wider close-up uses a gentle orbit and quintic camera easing, with the cab fading into a cutaway. The traffic clock advances throughout every story interval, including 50–60%, where cross traffic is visibly moving while the truck obeys its red light. No hardware installation, regulatory or warranty claims are made by the demo.

## Camera, stopping distance and annual scenario
The camera follows an exterior driver-side approach, a full 360-degree chip inspection, and an exterior rising exit. Only front cab panels participate in the cutaway; wheels, chassis and trailer remain opaque. The cab includes gauges, vents, console controls, seats, armrests and pedals.

Signal stop bars sit 17 metres from the intersection center. Both simulation controllers place a waiting front bumper 2.5 metres before that bar (minor procedural bumper protrusions remain within the requested 2–3 m range). Frame checks verify no red stop-boundary violations or vehicle overlaps.

Annual savings are an illustrative scenario: demo mean seconds saved per vehicle × 250 workdays × 2 trips/day × 10 coordinated intersections/trip ÷ 3600. The percentage divides those hours by the user-supplied 75-hour annual traffic reference. These assumptions are displayed with the result and are not asserted to be measured Atlanta commuting averages.


Latest revision: right-side cab-center camera entry, wider interior field of view and Class 8 cab details. Annual panel now explicitly separates an aspirational future 60h/80% target from demo results. Assumptions: 200 regular workdays ×2 trips ×(8−2)min plus50 peak/holiday-season workdays ×2 trips ×(13−1)min. Baseline75h; residual15h. Connected autonomy is a hypothetical enabling condition, not a quantified additional benefit or adoption forecast.

Latest update: hinged passenger door opens before camera enters; wide reference-inspired cab view holds at 29–36.5% before exit and door closure. Annual aspirational scenario revised to53.8h (71.7%): regular-trip savings5.4min, peak-trip savings10.68min; residual21.2h.

Revision: solid hollow cab shell replaces disappearing exterior block. Connected dashboard and console, restrained screen; transparency only at under-dash close-up. Playback is80s, close-up hold1.5s (32–33.875%), door closes during exit. Annual scenario remains53.8h.

60-second coordinated sequence: approach and stop by4.8s, interior sequence4.8–22.8s with1.5s chip hold, traffic resumes after exit. Steering rim/hub/spokes now form a single assembly connected by an aligned column.
