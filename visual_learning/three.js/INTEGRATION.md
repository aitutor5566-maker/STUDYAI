# Official Three.js GitHub Integration

This directory contains the official integration of **Three.js** into the STUDYAI visual teaching ecosystem.

## Upstream Repository
- **URL**: `https://github.com/mrdoob/three.js`
- **Release Version**: `0.170.0`
- **License**: MIT License (see [LICENSE](./LICENSE))
- **Copyright**: © 2010–2024 Three.js Authors

## License & Compliance
Three.js is open-source software licensed under the permissive **MIT License**:
- Freedom to use, modify, merge, publish, distribute, and sublicense.
- Preserves original copyright notice and permission notice.
- No commercial restrictions or copyleft obligations.

## Build Artifacts & Distribution
The repository provides official ES Module and CommonJS builds in `./build/`:
- `build/three.module.js` — Core ES Module (used for modern browser & Vite bundling).
- `build/three.cjs` — CommonJS bundle for Node.js environments.
- `examples/jsm/loaders/GLTFLoader.js` — Official glTF / GLB 3D model loader.
- `examples/jsm/controls/OrbitControls.js` — Official camera orbit and interaction controls.

## Architectural Rule
**Zero Duplicate Three.js Installations:**
All visual learning modules in STUDYAI (AI Tutor, Library 3D Lab, Procedural Geometry, and Flutter WebViews) utilize the unified Visual Learning Engine (`visual_learning/engine/VisualLearningEngine.ts`) which wraps this official Three.js integration. No component may import disconnected third-party copies.
