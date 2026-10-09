# FLOWLINK — final source export

This package contains the complete committed source of the final published animation, including the STL chip enclosure and all project dependencies/configuration declarations.
Source revision: c3d634b0e004129aeed51e81727921ad79953f17

## Run locally
Use Node.js 22.13 or newer and pnpm (the exact pnpm version is declared in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:5173. For a production build, run `pnpm build`.
The original Sites/Cloudflare deployment configuration is included. Deploying outside Sites may require adapting that hosting configuration. The supplied source was built successfully in the original environment; a fresh installation on your machine has not been tested.

## Main code files
- app/components/FlowLinkExperience.tsx — interface, 60-second playback, navigation, results.
- app/globals.css — visual styling and responsive layouts.
- lib/flowlink/world.ts — truck/cars/interior, steering wheel, door, camera, traffic signals and connection dots.
- lib/flowlink/chip.ts — enclosure loading, upright PCB and pulsating processor.
- lib/flowlink/simulation.ts — vehicle speeds, stopping, signal coordination and metrics.
- lib/flowlink/story.ts — chapters and synchronized animation/simulation timeline.
- public/models/FlowLink_OBU-HD1_RevA.stl — supplied enclosure geometry.
- app/page.tsx and app/layout.tsx — application entry and layout.

## Final behavior
60-second playback; fast approach; truck stops before entry; 1.5-second chip close-up; door closes during exit; traffic continues afterward. Larger dotted connections appear during exit and exclude vehicles that have entered the intersection. Steering wheel spokes/hub/rim share a connected assembly.

The final annual panel says Projected savings and shows 53.8 hours / 71.7% as a hypothetical future scenario, separate from simulation-derived intersection results. The assumptions are in simulation.ts and displayed in the interface.

README.md is the original development record and includes superseded iterations. This file describes the final export.

Dependencies (node_modules), compiled output, Git history, local runtime state and generated TypeScript cache are omitted. Install dependencies with pnpm as above. All tracked code, component files, assets and configuration are included.

## Local metrics-card fix
The final annual savings card now appears at all desktop window heights (width above900px). On narrower screens it stacks in a scrollable results area that stays above the navigation. Savings, animation and simulation calculations are unchanged. Replace your old project with this folder, reinstall dependencies if necessary, restart `pnpm dev`, and refresh the browser.
