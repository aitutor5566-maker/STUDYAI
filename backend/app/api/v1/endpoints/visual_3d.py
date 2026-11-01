import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from ....security.rbac import AuthenticatedUser, get_current_user
from ....repositories.db_state import db_state

router = APIRouter()

MODELS_CATALOG = {
    "human_heart": {
        "id": "human_heart",
        "title": "Human Heart & Double Circulation",
        "subject": "biology",
        "category": "Cardiovascular Anatomy",
        "grade_levels": [7, 8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/heart_preview.svg",
        "related_lesson_topic": "Human Heart and Blood Circulation",
        "camera_preset": {"position": [0, 2, 7], "target": [0, 0, 0], "min_distance": 2, "max_distance": 15},
        "description": "Four-chambered muscular dual pump driving pulmonary and systemic circulation loops with one-way atrioventricular and semilunar valves.",
        "parts": [
            {"id": "right_atrium", "name": "Right Atrium", "role": "Receives deoxygenated venous return from superior and inferior vena cava"},
            {"id": "right_ventricle", "name": "Right Ventricle", "role": "Pumps deoxygenated blood through pulmonary valve into pulmonary trunk"},
            {"id": "left_atrium", "name": "Left Atrium", "role": "Receives oxygen-rich blood returning from the lungs via 4 pulmonary veins"},
            {"id": "left_ventricle", "name": "Left Ventricle", "role": "Thick-walled myocardium generating high pressure to pump oxygenated blood through aorta to systemic tissues"},
            {"id": "aorta", "name": "Aortic Arch", "role": "Primary systemic arterial trunk branching into carotid, subclavian, and descending systemic arteries"},
            {"id": "tricuspid_valve", "name": "Tricuspid Valve", "role": "Atrioventricular valve preventing backflow into right atrium during ventricular systole"}
        ]
    },
    "dna_double_helix": {
        "id": "dna_double_helix",
        "title": "DNA Double Helix Architecture",
        "subject": "biology",
        "category": "Molecular Genetics",
        "grade_levels": [8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/dna_preview.svg",
        "related_lesson_topic": "DNA Structure and Replication",
        "camera_preset": {"position": [0, 0, 8], "target": [0, 0, 0], "min_distance": 2, "max_distance": 18},
        "description": "Watson-Crick antiparallel right-handed B-DNA double helix with complementary base pairs connected by hydrogen bonds along sugar-phosphate backbones.",
        "parts": [
            {"id": "sugar_phosphate_rails", "name": "Sugar-Phosphate Backbone", "role": "Antiparallel 5'-to-3' deoxyribose units joined by phosphodiester linkages"},
            {"id": "adenine_thymine", "name": "A=T Base Pair", "role": "Purine-pyrimidine complementary pair stabilized by 2 hydrogen bonds"},
            {"id": "guanine_cytosine", "name": "G≡C Base Pair", "role": "Purine-pyrimidine complementary pair stabilized by 3 hydrogen bonds"},
            {"id": "major_minor_groove", "name": "Major & Minor Grooves", "role": "Periodic spatial indentations providing binding sites for transcription factors and polymerases"}
        ]
    },
    "plant_cell": {
        "id": "plant_cell",
        "title": "Plant Cell Micro-Structure & Chloroplast",
        "subject": "biology",
        "category": "Cellular Biology",
        "grade_levels": [6, 7, 8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/plant_cell_preview.svg",
        "related_lesson_topic": "Photosynthesis in Plant Cells",
        "camera_preset": {"position": [0, 3, 9], "target": [0, 0, 0], "min_distance": 2, "max_distance": 20},
        "description": "Eukaryotic plant cell featuring rigid cellulose cell wall, large central vacuole, and photosynthetic chloroplasts containing thylakoid grana stacks.",
        "parts": [
            {"id": "cell_wall", "name": "Cell Wall", "role": "Rigid outer cellulose layer providing tensile strength and turgor protection"},
            {"id": "chloroplast", "name": "Chloroplast & Grana", "role": "Organelle containing thylakoid stacks and chlorophyll pigments synthesizing glucose from light"},
            {"id": "vacuole", "name": "Central Vacuole", "role": "Large fluid reservoir maintaining hydrostatic turgor pressure against the cell wall"},
            {"id": "nucleus", "name": "Cell Nucleus", "role": "Membrane-bound organelle housing chromosomes and orchestrating cellular gene expression"},
            {"id": "mitochondria", "name": "Mitochondria", "role": "Site of cellular aerobic respiration producing ATP to power metabolic activities"}
        ]
    },
    "solar_system": {
        "id": "solar_system",
        "title": "Solar System Heliocentric Dynamics",
        "subject": "physics",
        "category": "Astronomy & Orbital Mechanics",
        "grade_levels": [5, 6, 7, 8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/solar_preview.svg",
        "related_lesson_topic": "Solar System Dynamics",
        "camera_preset": {"position": [0, 8, 18], "target": [0, 0, 0], "min_distance": 4, "max_distance": 40},
        "description": "Heliocentric planetary orbital simulation demonstrating Keplerian elliptical orbits, axial tilt, and scale distance variations from Mercury to Neptune.",
        "parts": [
            {"id": "sun", "name": "The Sun", "role": "Central G-type main-sequence star comprising 99.86% of total solar system mass"},
            {"id": "terrestrial_planets", "name": "Terrestrial Worlds (Mercury, Venus, Earth, Mars)", "role": "Inner rocky planets with metallic cores and solid silicate crusts"},
            {"id": "gas_giants", "name": "Gas Giants (Jupiter & Saturn)", "role": "Massive hydrogen/helium giants with complex ring systems and extensive moon families"},
            {"id": "ice_giants", "name": "Ice Giants (Uranus & Neptune)", "role": "Mantle-rich worlds dominated by water, ammonia, and methane ices"}
        ]
    },
    "atom_structure": {
        "id": "atom_structure",
        "title": "Bohr Atomic Structure (Carbon-12)",
        "subject": "chemistry",
        "category": "Atomic Theory & Quantum Chemistry",
        "grade_levels": [8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/atom_preview.svg",
        "related_lesson_topic": "Atomic Structure (Bohr Model)",
        "camera_preset": {"position": [0, 0, 7], "target": [0, 0, 0], "min_distance": 2, "max_distance": 16},
        "description": "Quantized planetary Bohr atomic model illustrating central proton/neutron nucleus surrounded by discrete K and L shell electron orbits.",
        "parts": [
            {"id": "nucleus", "name": "Atomic Nucleus", "role": "Dense central cluster containing 6 positively charged protons and 6 neutral neutrons"},
            {"id": "k_shell", "name": "K-Shell (n=1)", "role": "Innermost ground-state energy orbital holding up to 2 paired electrons"},
            {"id": "l_shell", "name": "L-Shell (n=2)", "role": "Valence energy level containing 4 valence electrons responsible for covalent chemical bonding"},
            {"id": "valence_electrons", "name": "Valence Electrons", "role": "Outer shell electrons that participate in chemical reaction hybridization (sp3, sp2, sp)"}
        ]
    },
    "water_molecule": {
        "id": "water_molecule",
        "title": "Water Dipole & Hydrogen Bonding",
        "subject": "chemistry",
        "category": "Chemical Bonding",
        "grade_levels": [7, 8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/water_preview.svg",
        "related_lesson_topic": "Molecular Geometry and Hydrogen Bonding",
        "camera_preset": {"position": [0, 1, 6], "target": [0, 0, 0], "min_distance": 2, "max_distance": 14},
        "description": "Bent molecular geometry (104.5° bond angle) demonstrating electronegative oxygen dipole, polar covalent bonds, and intermolecular hydrogen network.",
        "parts": [
            {"id": "oxygen_atom", "name": "Electronegative Oxygen", "role": "High electron affinity center carrying partial negative charge (δ-)"},
            {"id": "hydrogen_atoms", "name": "Hydrogen Atoms (2x)", "role": "Electropositive centers carrying partial positive charge (δ+)"},
            {"id": "hydrogen_bond", "name": "Intermolecular Hydrogen Bond", "role": "Electrostatic attraction between δ- oxygen of one molecule and δ+ hydrogen of an adjacent water molecule"}
        ]
    },
    "newtons_laws": {
        "id": "newtons_laws",
        "title": "Newton's Laws of Motion Lab",
        "subject": "physics",
        "category": "Classical Mechanics",
        "grade_levels": [8, 9, 10, 11, 12],
        "preview_svg": "/assets/svg/newton_preview.svg",
        "related_lesson_topic": "Newton's Laws of Motion",
        "camera_preset": {"position": [0, 3, 8], "target": [0, 0, 0], "min_distance": 2, "max_distance": 18},
        "description": "Dynamic mechanical simulation demonstrating inertia on an air track, acceleration under applied force vector (F=ma), and action-reaction recoil.",
        "parts": [
            {"id": "cart_mass", "name": "Inertial Mass Cart", "role": "Rigid body exhibiting resistance to acceleration proportional to its mass (m)"},
            {"id": "force_vector", "name": "Applied Force Vector", "role": "Directed dynamic force producing proportional acceleration (a = F/m)"},
            {"id": "normal_force", "name": "Normal & Reaction Vector", "role": "Perpendicular surface reaction supporting equilibrium and demonstrating equal and opposite interaction"}
        ]
    }
}


class SaveModelToLibraryRequest(BaseModel):
    model_id: str
    custom_title: Optional[str] = None
    collection_id: Optional[str] = None


@router.get("/models", summary="List Available 3D Scientific Models")
async def list_models(
    subject: Optional[str] = None,
    user: AuthenticatedUser = Depends(get_current_user)
):
    models = list(MODELS_CATALOG.values())
    if subject and subject.lower() != "all":
        models = [m for m in models if m["subject"].lower() == subject.lower()]
    return models


@router.get("/models/{model_id}", summary="Get Model Metadata & Interactive Hotspots")
async def get_model_metadata(model_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    model = MODELS_CATALOG.get(model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "Not Found", "message": f"Model '{model_id}' not found", "code": "MODEL_NOT_FOUND"}
        )
    return model


@router.post("/save-to-library", status_code=status.HTTP_201_CREATED, summary="Save 3D Model into Personal Learning Library")
async def save_model_to_library(req: SaveModelToLibraryRequest, user: AuthenticatedUser = Depends(get_current_user)):
    model = MODELS_CATALOG.get(req.model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="3D model not found")

    res_id = f"3d_{req.model_id}_{user.id[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = {
        "id": res_id,
        "tenant_id": user.tenant_id or "a0000000-0000-0000-0000-000000000001",
        "title": req.custom_title or model["title"],
        "description": model["description"],
        "subject": model["subject"].capitalize(),
        "grade": "Grades 6–12",
        "resource_type": "model3d",
        "file_path": f"/3d-models/{req.model_id}.glb",
        "file_size_bytes": 1024000,
        "mime_type": "model/gltf-binary",
        "tags": [model["subject"].lower(), "3d", "simulation"],
        "uploaded_by": user.id,
        "is_public": False,
        "created_at": now_iso
    }
    db_state.library_resources[res_id] = record

    # Also automatically add to user's favorites
    if user.id not in db_state.user_favorites:
        db_state.user_favorites[user.id] = []
    if res_id not in db_state.user_favorites[user.id]:
        db_state.user_favorites[user.id].append(res_id)

    # If collection specified, add to collection
    if req.collection_id and req.collection_id in db_state.library_collections:
        col = db_state.library_collections[req.collection_id]
        if res_id not in col["resource_ids"]:
            col["resource_ids"].append(res_id)

    return {"status": "success", "resource": record}
