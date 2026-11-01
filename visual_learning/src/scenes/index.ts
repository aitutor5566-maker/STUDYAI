export type SupportedSceneType = 
  | 'plant_cell'
  | 'solar_system'
  | 'atom_structure'
  | 'human_heart'
  | 'water_molecule'
  | 'volcano_cross_section';

export interface EducationalSceneMetadata {
  id: SupportedSceneType;
  title: string;
  subject: 'biology' | 'physics' | 'chemistry' | 'earth_science' | 'astronomy';
  gradeLevels: number[];
  interactiveLayers: string[];
}

export const REGISTERED_SCENES: Record<SupportedSceneType, EducationalSceneMetadata> = {
  plant_cell: {
    id: 'plant_cell',
    title: 'Plant Cell Micro-Structure',
    subject: 'biology',
    gradeLevels: [6, 7, 8, 9, 10, 11, 12],
    interactiveLayers: ['cell_wall', 'membrane', 'chloroplast', 'vacuole', 'nucleus', 'mitochondria'],
  },
  solar_system: {
    id: 'solar_system',
    title: 'Solar System Planetary Mechanics',
    subject: 'astronomy',
    gradeLevels: [5, 6, 7, 8, 9, 10],
    interactiveLayers: ['sun', 'terrestrial_planets', 'gas_giants', 'orbital_paths'],
  },
  atom_structure: {
    id: 'atom_structure',
    title: 'Bohr Atomic Model (Carbon-12)',
    subject: 'chemistry',
    gradeLevels: [8, 9, 10, 11, 12],
    interactiveLayers: ['nucleus', 'protons', 'neutrons', 'electron_shells'],
  },
  human_heart: {
    id: 'human_heart',
    title: 'Human Heart Anatomy & Blood Flow',
    subject: 'biology',
    gradeLevels: [7, 8, 9, 10, 11, 12],
    interactiveLayers: ['atria', 'ventricles', 'aorta', 'valves', 'pulmonary_artery'],
  },
  water_molecule: {
    id: 'water_molecule',
    title: 'Water Molecule (H2O) Dipole Covalent Bonding',
    subject: 'chemistry',
    gradeLevels: [7, 8, 9, 10, 11, 12],
    interactiveLayers: ['oxygen_atom', 'hydrogen_atoms', 'covalent_bonds', 'electron_density'],
  },
  volcano_cross_section: {
    id: 'volcano_cross_section',
    title: 'Volcanic Magma Chamber & Stratovolcano Cross-Section',
    subject: 'earth_science',
    gradeLevels: [6, 7, 8, 9, 10],
    interactiveLayers: ['magma_chamber', 'main_vent', 'crater', 'crust_layers', 'lava_flow'],
  },
};
