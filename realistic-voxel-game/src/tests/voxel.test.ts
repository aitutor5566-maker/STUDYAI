import { describe, it, expect } from 'vitest';
import { VoxelChunk, BlockType } from '../terrain/VoxelChunk';

describe('VoxelChunk Meshing and Occlusion Culling', () => {
  it('initializes an empty 16x16x16 chunk of air', () => {
    const chunk = new VoxelChunk(0, 0, 0);
    expect(chunk.getActiveBlockCount()).toBe(0);
    expect(chunk.getBlock(0, 0, 0)).toBe(BlockType.AIR);
  });

  it('correctly sets and retrieves block types', () => {
    const chunk = new VoxelChunk(0, 0, 0);
    chunk.setBlock(2, 3, 4, BlockType.GRASS);
    chunk.setBlock(5, 5, 5, BlockType.STONE);

    expect(chunk.getBlock(2, 3, 4)).toBe(BlockType.GRASS);
    expect(chunk.getBlock(5, 5, 5)).toBe(BlockType.STONE);
    expect(chunk.getActiveBlockCount()).toBe(2);
  });

  it('generates 6 faces (12 triangles, 36 indices) for an isolated single block', () => {
    const chunk = new VoxelChunk(0, 0, 0);
    chunk.setBlock(8, 8, 8, BlockType.STONE);

    const mesh = chunk.generateMesh();
    expect(mesh).toBeDefined();

    const geometry = mesh.geometry;
    const indexAttr = geometry.getIndex();
    expect(indexAttr).not.toBeNull();
    // 6 faces * 2 triangles * 3 indices = 36 indices
    expect(indexAttr!.count).toBe(36);

    const posAttr = geometry.getAttribute('position');
    // 6 faces * 4 vertices = 24 vertices
    expect(posAttr.count).toBe(24);
  });

  it('culls touching faces between two adjacent solid blocks', () => {
    const chunk = new VoxelChunk(0, 0, 0);
    // Two adjacent blocks along X axis
    chunk.setBlock(8, 8, 8, BlockType.DIRT);
    chunk.setBlock(9, 8, 8, BlockType.DIRT);

    const mesh = chunk.generateMesh();
    const indexAttr = mesh.geometry.getIndex();

    // Without culling, two blocks would have 12 faces * 6 indices = 72 indices.
    // With occlusion culling, the 2 internal touching faces are culled -> 10 faces * 6 indices = 60 indices.
    expect(indexAttr!.count).toBe(60);
  });

  it('updates mesh when blocks are edited dynamically', () => {
    const chunk = new VoxelChunk(0, 0, 0);
    chunk.setBlock(4, 4, 4, BlockType.WOOD);
    const mesh1 = chunk.generateMesh();
    expect(mesh1.geometry.getIndex()!.count).toBe(36);

    // Mine / remove block
    chunk.setBlock(4, 4, 4, BlockType.AIR);
    const mesh2 = chunk.generateMesh();
    expect(mesh2.geometry.getIndex()!.count).toBe(0);
  });
});
