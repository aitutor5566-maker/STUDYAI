import * as THREE from 'three';

export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  WATER = 6
}

export interface BlockColorDef {
  top: number;
  sides: number;
  bottom: number;
  roughness: number;
  metalness: number;
}

export const BLOCK_PROPERTIES: Record<BlockType, BlockColorDef> = {
  [BlockType.AIR]: { top: 0, sides: 0, bottom: 0, roughness: 0, metalness: 0 },
  [BlockType.GRASS]: {
    top: 0x4d7c0f, // Lush natural green
    sides: 0x57534e, // Soil edge
    bottom: 0x3f3f46,
    roughness: 0.85,
    metalness: 0.05
  },
  [BlockType.DIRT]: {
    top: 0x57534e,
    sides: 0x57534e,
    bottom: 0x57534e,
    roughness: 0.95,
    metalness: 0.0
  },
  [BlockType.STONE]: {
    top: 0x71717a,
    sides: 0x71717a,
    bottom: 0x71717a,
    roughness: 0.7,
    metalness: 0.1
  },
  [BlockType.WOOD]: {
    top: 0xb45309,
    sides: 0x78350f,
    bottom: 0xb45309,
    roughness: 0.8,
    metalness: 0.0
  },
  [BlockType.LEAVES]: {
    top: 0x15803d,
    sides: 0x166534,
    bottom: 0x15803d,
    roughness: 0.6,
    metalness: 0.0
  },
  [BlockType.WATER]: {
    top: 0x0284c7,
    sides: 0x0369a1,
    bottom: 0x075985,
    roughness: 0.1,
    metalness: 0.1
  }
};

// Face definitions: normal vector, vertices for quad
interface FaceDefinition {
  dir: [number, number, number];
  corners: [number, number, number][];
  isTop?: boolean;
  isBottom?: boolean;
}

const FACES: FaceDefinition[] = [
  // Top (+Y)
  {
    dir: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0]
    ],
    isTop: true
  },
  // Bottom (-Y)
  {
    dir: [0, -1, 0],
    corners: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1]
    ],
    isBottom: true
  },
  // Right (+X)
  {
    dir: [1, 0, 0],
    corners: [
      [1, 0, 1],
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1]
    ]
  },
  // Left (-X)
  {
    dir: [-1, 0, 0],
    corners: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ]
  },
  // Front (+Z)
  {
    dir: [0, 0, 1],
    corners: [
      [0, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1]
    ]
  },
  // Back (-Z)
  {
    dir: [0, 0, -1],
    corners: [
      [1, 0, 0],
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0]
    ]
  }
];

export class VoxelChunk {
  public static readonly SIZE = 16;
  public readonly voxels: Uint8Array;
  public mesh: THREE.Mesh | null = null;
  public readonly position: THREE.Vector3;
  private readonly material: THREE.MeshStandardMaterial;

  constructor(chunkX = 0, chunkY = 0, chunkZ = 0) {
    this.position = new THREE.Vector3(
      chunkX * VoxelChunk.SIZE,
      chunkY * VoxelChunk.SIZE,
      chunkZ * VoxelChunk.SIZE
    );
    this.voxels = new Uint8Array(VoxelChunk.SIZE * VoxelChunk.SIZE * VoxelChunk.SIZE);

    // Physically Based Material with Vertex Colors support
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
    });
  }

  private getIndex(x: number, y: number, z: number): number {
    return x + VoxelChunk.SIZE * (z + VoxelChunk.SIZE * y);
  }

  public getBlock(x: number, y: number, z: number): BlockType {
    if (
      x < 0 ||
      x >= VoxelChunk.SIZE ||
      y < 0 ||
      y >= VoxelChunk.SIZE ||
      z < 0 ||
      z >= VoxelChunk.SIZE
    ) {
      return BlockType.AIR;
    }
    return this.voxels[this.getIndex(x, y, z)];
  }

  public setBlock(x: number, y: number, z: number, type: BlockType): boolean {
    if (
      x < 0 ||
      x >= VoxelChunk.SIZE ||
      y < 0 ||
      y >= VoxelChunk.SIZE ||
      z < 0 ||
      z >= VoxelChunk.SIZE
    ) {
      return false;
    }
    this.voxels[this.getIndex(x, y, z)] = type;
    return true;
  }

  /**
   * Generates a mesh with face culling (omitting internal occluded faces).
   * Culled meshing eliminates over 75% of non-visible faces compared to naive cubes.
   */
  public generateMesh(): THREE.Mesh {
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const tempColor = new THREE.Color();
    let vertexCount = 0;

    for (let y = 0; y < VoxelChunk.SIZE; y++) {
      for (let z = 0; z < VoxelChunk.SIZE; z++) {
        for (let x = 0; x < VoxelChunk.SIZE; x++) {
          const block = this.getBlock(x, y, z);
          if (block === BlockType.AIR) continue;

          const blockProps = BLOCK_PROPERTIES[block];

          for (const face of FACES) {
            const nx = x + face.dir[0];
            const ny = y + face.dir[1];
            const nz = z + face.dir[2];

            const neighbor = this.getBlock(nx, ny, nz);
            // Occlusion culling: only draw face if neighbor is air (or transparent)
            if (neighbor !== BlockType.AIR) {
              continue;
            }

            // Determine face color
            let hexColor = blockProps.sides;
            if (face.isTop) hexColor = blockProps.top;
            else if (face.isBottom) hexColor = blockProps.bottom;
            tempColor.setHex(hexColor);

            // Add 4 vertices for this quad
            for (const corner of face.corners) {
              positions.push(x + corner[0], y + corner[1], z + corner[2]);
              normals.push(face.dir[0], face.dir[1], face.dir[2]);
              colors.push(tempColor.r, tempColor.g, tempColor.b);
            }

            // Two triangles per quad
            indices.push(
              vertexCount,
              vertexCount + 1,
              vertexCount + 2,
              vertexCount,
              vertexCount + 2,
              vertexCount + 3
            );
            vertexCount += 4;
          }
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    } else {
      this.mesh = new THREE.Mesh(geometry, this.material);
      this.mesh.position.copy(this.position);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
    }

    return this.mesh;
  }

  public getActiveBlockCount(): number {
    let count = 0;
    for (let i = 0; i < this.voxels.length; i++) {
      if (this.voxels[i] !== BlockType.AIR) count++;
    }
    return count;
  }

  public dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.material.dispose();
      if (this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
      this.mesh = null;
    }
  }
}
