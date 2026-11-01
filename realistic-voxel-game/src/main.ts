import { Engine } from './core/Engine';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { VoxelChunk, BlockType } from './terrain/VoxelChunk';

async function bootstrap() {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Container #app not found in document.');
  }

  // 1. Initialize WebAssembly physics subsystem
  await PhysicsWorld.init();

  // 2. Initialize Game Engine
  const engine = new Engine(container);

  // 3. Generate a realistic natural test voxel chunk (16x16)
  const chunk = new VoxelChunk(0, 0, 0);

  for (let x = 0; x < VoxelChunk.SIZE; x++) {
    for (let z = 0; z < VoxelChunk.SIZE; z++) {
      // Bedrock / Stone foundation
      chunk.setBlock(x, 0, z, BlockType.STONE);
      chunk.setBlock(x, 1, z, BlockType.STONE);
      chunk.setBlock(x, 2, z, BlockType.DIRT);

      // Water pond in corner
      if (x <= 3 && z <= 3) {
        chunk.setBlock(x, 2, z, BlockType.WATER);
        continue;
      }

      // Natural undulating elevation with center mound
      const distFromCenter = Math.hypot(x - 8, z - 8);
      const elevation = distFromCenter < 4 ? 4 : 3;

      for (let y = 3; y <= elevation; y++) {
        chunk.setBlock(x, y, z, y === elevation ? BlockType.GRASS : BlockType.DIRT);
      }
    }
  }

  // Add a voxel tree atop the hill (x=8, z=8, y=5..8 trunk, canopy at y=8..10)
  for (let ty = 5; ty <= 7; ty++) {
    chunk.setBlock(8, ty, 8, BlockType.WOOD);
  }
  for (let lx = 6; lx <= 10; lx++) {
    for (let lz = 6; lz <= 10; lz++) {
      for (let ly = 7; ly <= 9; ly++) {
        if (Math.hypot(lx - 8, lz - 8, ly - 8) <= 2.2) {
          if (chunk.getBlock(lx, ly, lz) === BlockType.AIR) {
            chunk.setBlock(lx, ly, lz, BlockType.LEAVES);
          }
        }
      }
    }
  }

  const chunkMesh = chunk.generateMesh();
  engine.renderer.scene.add(chunkMesh);

  // 4. Static physics collider matching the terrain foundation
  engine.physics.createStaticBox({ x: 8, y: 1.5, z: 8 }, { x: 8, y: 1.5, z: 8 });

  // 5. Spawn initial dynamic physics cubes falling under gravity
  engine.spawnPhysicsBlock(undefined, 0xef4444); // Red block
  engine.spawnPhysicsBlock(undefined, 0x3b82f6); // Blue block
  engine.spawnPhysicsBlock(undefined, 0xeab308); // Gold block

  // 6. Interactive drop button
  const button = document.createElement('button');
  button.id = 'btn-drop-voxel';
  button.innerText = 'Drop Dynamic Voxel (Space)';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.left = '50%';
  button.style.transform = 'translateX(-50%)';
  button.style.padding = '12px 24px';
  button.style.backgroundColor = '#2563eb';
  button.style.color = '#ffffff';
  button.style.fontSize = '14px';
  button.style.fontWeight = 'bold';
  button.style.borderRadius = '8px';
  button.style.border = '1px solid rgba(255, 255, 255, 0.2)';
  button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1000';
  button.style.transition = 'background-color 0.15s ease';

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#1d4ed8';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#2563eb';
  });
  button.addEventListener('click', () => {
    engine.spawnPhysicsBlock();
  });
  document.body.appendChild(button);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      engine.spawnPhysicsBlock();
    }
  });

  // 7. Start Engine
  engine.start();

  // Expose engine globally for automated smoke testing
  (window as unknown as { __VOXEL_ENGINE__: Engine }).__VOXEL_ENGINE__ = engine;
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrapping error:', err);
});
