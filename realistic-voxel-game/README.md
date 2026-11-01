# Realistic 3D Voxel Game Engine

A browser-playable voxel sandbox survival foundation built with **Three.js**, **Rapier 3D (WASM)**, **TypeScript**, and **Vite**, engineered for realistic natural lighting, terrain meshing, physics, and atmospheric rendering.

---

## Technology Stack

- **Graphics**: [Three.js](https://threejs.org/) (WebGL 2, ACES Filmic Tone Mapping, sRGB color space, PCF soft shadows, exponential atmospheric fog)
- **Physics**: [@dimforge/rapier3d-compat](https://rapier.rs/) (High-performance WebAssembly 3D physics with fixed-timestep deterministic stepping)
- **Tooling & Bundler**: [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Unit Testing**: [Vitest](https://vitest.dev/)
- **End-to-End Testing**: [Playwright](https://playwright.dev/) with system Google Chrome / WebGL automation
- **Linting & Formatting**: ESLint 9 + Prettier

---

## Project Structure

```text
realistic-voxel-game/
├── public/
│   └── assets/                  # Static textures, sounds, and assets
├── src/
│   ├── core/                    # Engine loop, delta accumulator, frame profiling
│   │   └── Engine.ts
│   ├── rendering/               # Three.js WebGL 2 renderer, tone mapping, atmosphere
│   │   ├── Renderer.ts
│   │   └── Atmosphere.ts
│   ├── terrain/                 # Voxel chunks, block definitions, face culling
│   │   ├── VoxelChunk.ts
│   │   └── VoxelArchitectureDoc.ts
│   ├── physics/                 # Rapier 3D bindings, colliders, dynamic rigid bodies
│   │   └── PhysicsWorld.ts
│   ├── interaction/             # Spherical orbit/pan camera controller
│   │   └── CameraController.ts
│   ├── ui/                      # Performance HUD (FPS, ms, draw calls, triangles)
│   │   └── HUD.ts
│   ├── tests/                   # Vitest unit tests for physics and voxel meshing
│   │   ├── physics.test.ts
│   │   └── voxel.test.ts
│   └── main.ts                  # Application bootstrap and scene setup
├── tests/
│   └── e2e/                     # Playwright smoke tests
│       └── smoke.test.ts
├── eslint.config.js
├── .prettierrc
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## Available Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Launch Vite local development server with HMR |
| `npm run build` | Perform TypeScript typechecking (`tsc`) and production Vite build |
| `npm run preview` | Preview production bundle locally |
| `npm run typecheck` | Run TypeScript compiler strict checks (`tsc --noEmit`) |
| `npm run lint` | Run ESLint across TypeScript codebase |
| `npm run format:check` | Verify formatting consistency with Prettier |
| `npm test` | Run Vitest unit tests (Physics + Voxel Meshing) |
| `npm run test:e2e` | Run Playwright end-to-end browser smoke tests |

---

## Voxel World Architecture Plan

1. **Chunk Storage**: Flattened 1D array indexed via `x + CHUNK_SIZE * (z + CHUNK_SIZE * y)`.
2. **Face Reduction**: Occlusion culling skips hidden faces where neighbor voxels are solid, reducing geometry by 70%+.
3. **Greedy Meshing**: Merges adjacent planar quads into single polygons.
4. **Collision**: Static ground colliders coupled with Rapier dynamic rigid bodies.
5. **Atmospheric Lighting**: Directional sunlight with soft shadow cascades, hemisphere bounce, and depth fog.
