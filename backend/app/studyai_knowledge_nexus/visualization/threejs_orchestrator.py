from typing import Any, Dict, List, Optional


class ThreeJSSceneOrchestrator:
    """
    Produces safe, declarative 3D scene specifications for Three.js.
    Never executes arbitrary code or unvalidated string evals.
    """

    PRESET_MODELS: Dict[str, Dict[str, Any]] = {
        "human-heart": {
            "title": "Interactive 3D Human Heart",
            "scene": {
                "background": "#090d16",
                "camera": {"fov": 50, "position": [0, 0, 7]},
                "lights": [
                    {"type": "ambient", "color": "#ffffff", "intensity": 0.8},
                    {"type": "directional", "color": "#ff6b81", "position": [5, 10, 7], "intensity": 1.2}
                ],
                "objects": [
                    {
                        "id": "myocardium",
                        "geometry": {"type": "sphere", "radius": 1.8, "widthSegments": 32, "heightSegments": 32},
                        "material": {"type": "meshStandard", "color": "#b91c1c", "roughness": 0.3, "metalness": 0.1},
                        "scale": [1.0, 1.3, 0.9],
                        "position": [0, -0.2, 0]
                    },
                    {
                        "id": "aorta",
                        "geometry": {"type": "torus", "radius": 0.9, "tube": 0.28, "radialSegments": 16, "tubularSegments": 32, "arc": 3.1415},
                        "material": {"type": "meshStandard", "color": "#ef4444", "roughness": 0.2},
                        "position": [0.2, 1.3, 0],
                        "rotation": [0, 0, -0.5]
                    },
                    {
                        "id": "vena_cava",
                        "geometry": {"type": "cylinder", "radiusTop": 0.25, "radiusBottom": 0.25, "height": 2.2, "radialSegments": 24},
                        "material": {"type": "meshStandard", "color": "#2563eb", "roughness": 0.2},
                        "position": [-1.1, 0.4, -0.2]
                    }
                ],
                "annotations": [
                    {"id": "aorta_label", "text": "Aorta (Carries oxygenated blood to body)", "position": [0.2, 2.2, 0]},
                    {"id": "vena_cava_label", "text": "Superior Vena Cava", "position": [-1.3, 1.2, -0.2]},
                    {"id": "left_ventricle", "text": "Thick muscular Left Ventricle", "position": [1.2, -0.8, 0.5]}
                ]
            }
        },
        "plant-cell": {
            "title": "Interactive 3D Plant Cell Structure",
            "scene": {
                "background": "#09120e",
                "camera": {"fov": 45, "position": [0, 0, 8]},
                "lights": [
                    {"type": "ambient", "color": "#ffffff", "intensity": 0.9},
                    {"type": "directional", "color": "#4ade80", "position": [4, 8, 5], "intensity": 1.0}
                ],
                "objects": [
                    {
                        "id": "cell_wall",
                        "geometry": {"type": "box", "width": 4.0, "height": 3.0, "depth": 2.2},
                        "material": {"type": "meshStandard", "color": "#15803d", "transparent": True, "opacity": 0.45, "roughness": 0.5},
                        "position": [0, 0, 0]
                    },
                    {
                        "id": "large_vacuole",
                        "geometry": {"type": "sphere", "radius": 1.1, "widthSegments": 24, "heightSegments": 24},
                        "material": {"type": "meshStandard", "color": "#38bdf8", "transparent": True, "opacity": 0.6, "roughness": 0.1},
                        "position": [0.3, 0.1, 0]
                    },
                    {
                        "id": "chloroplast_1",
                        "geometry": {"type": "sphere", "radius": 0.35, "widthSegments": 16, "heightSegments": 16},
                        "material": {"type": "meshStandard", "color": "#22c55e", "roughness": 0.3},
                        "scale": [1.4, 0.7, 0.7],
                        "position": [-1.2, 0.8, 0.3]
                    }
                ],
                "annotations": [
                    {"id": "wall_label", "text": "Rigid Cellulose Cell Wall", "position": [-2.1, 1.6, 0]},
                    {"id": "vacuole_label", "text": "Central Turgid Vacuole", "position": [0.3, 1.3, 0]}
                ]
            }
        },
        "dna-double-helix": {
            "title": "Interactive 3D DNA Double Helix",
            "scene": {
                "background": "#09090b",
                "camera": {"fov": 50, "position": [0, 0, 6]},
                "lights": [{"type": "ambient", "color": "#ffffff", "intensity": 1.0}],
                "objects": [
                    {
                        "id": "helix_core",
                        "geometry": {"type": "cylinder", "radiusTop": 0.6, "radiusBottom": 0.6, "height": 4.5, "radialSegments": 16},
                        "material": {"type": "meshStandard", "color": "#8b5cf6", "wireframe": True},
                        "position": [0, 0, 0]
                    }
                ],
                "annotations": [
                    {"id": "base_pairs", "text": "Nitrogenous Bases (A-T, G-C)", "position": [0, 1.5, 0.8]},
                    {"id": "sugar_backbone", "text": "Deoxyribose-Phosphate Backbone", "position": [0.8, -1.2, 0.5]}
                ]
            }
        }
    }

    def get_scene_spec(self, model_key: str) -> Optional[Dict[str, Any]]:
        return self.PRESET_MODELS.get(model_key.lower())


threejs_orchestrator = ThreeJSSceneOrchestrator()
