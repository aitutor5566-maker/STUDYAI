export interface ProceduralGeometryDescriptor {
  type: 'sphere' | 'box' | 'cylinder' | 'torus' | 'compound';
  dimensions: number[];
  color: number;
  emissive?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
}

export interface InteractiveModelPart {
  id: string;
  name: string;
  description: string;
  geometry: ProceduralGeometryDescriptor;
}
