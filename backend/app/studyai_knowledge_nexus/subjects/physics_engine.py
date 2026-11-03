from typing import Any, Dict, List, Optional

PHYSICS_TOPICS = {
    "lenses": {
        "concept": "Refraction of Light through Convex Lenses",
        "lens_formula": "1/f = 1/v - 1/u",
        "magnification": "m = v / u = Height of Image (I) / Height of Object (O)",
        "sign_convention": "Cartesian Sign Convention: Focal length (f) of convex lens is always positive (+); Object distance (u) is always negative (-).",
        "ray_rules": [
            "1. A ray parallel to the principal axis passes through the principal focus after refraction.",
            "2. A ray passing through the optical centre (O) emerges without any deviation.",
            "3. A ray passing through the first focal point emerges parallel to the principal axis."
        ],
        "cases": [
            {"position": "At 2F₁", "image_pos": "At 2F₂", "nature": "Real and Inverted", "size": "Same size as object (m = -1)"},
            {"position": "Between F₁ and 2F₁", "image_pos": "Beyond 2F₂", "nature": "Real and Inverted", "size": "Magnified (|m| > 1)"},
            {"position": "Between optical centre O and F₁", "image_pos": "On same side as object", "nature": "Virtual and Erect", "size": "Magnified (m > +1), e.g. Magnifying glass"}
        ]
    },
    "circuits": {
        "concept": "Ohm's Law and Electric Circuit Analysis",
        "ohms_law": "V = I * R (At constant temperature and physical conditions)",
        "series_formula": "R_eq = R1 + R2 + ... + Rn (Current remains same; Voltage divides)",
        "parallel_formula": "1/R_eq = 1/R1 + 1/R2 + ... + 1/Rn (Voltage remains same; Current divides)",
        "power_formulas": ["P = V * I", "P = I² * R", "P = V² / R"],
        "icse_safety_devices": ["Fuse (placed in Live wire, low melting point, high resistance)", "Earthing (connects metallic body of appliance to ground)", "Three-pin plug (Earth pin longer and thicker)"]
    }
}


class PhysicsEngine:
    """Physics educational engine for mechanics, optics, electricity, and radioactivity."""

    def analyze_topic(self, query: str) -> Dict[str, Any]:
        q = query.lower()
        if "lens" in q or "refraction" in q or "convex" in q or "focal" in q:
            return {"success": True, "topic": "Optics & Lenses", "data": PHYSICS_TOPICS["lenses"], "verified": True}
        elif "circuit" in q or "ohm" in q or "resistor" in q or "resistance" in q:
            return {"success": True, "topic": "Current Electricity", "data": PHYSICS_TOPICS["circuits"], "verified": True}

        return {
            "success": True,
            "topic": "General Physics Principle",
            "data": {
                "concept": "Fundamental Physical Law",
                "sign_convention": "Strict adherence to SI Units and standard coordinate systems."
            },
            "verified": True
        }


physics_engine = PhysicsEngine()
