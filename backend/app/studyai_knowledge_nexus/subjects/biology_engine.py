from typing import Any, Dict, List, Optional

BIOLOGICAL_SYSTEMS = {
    "heart": {
        "organ": "Human Heart",
        "system": "Circulatory System",
        "chambers": ["Right Atrium (Deoxygenated)", "Right Ventricle (Deoxygenated)", "Left Atrium (Oxygenated)", "Left Ventricle (Oxygenated)"],
        "valves": [
            {"name": "Tricuspid Valve", "location": "Between right atrium and right ventricle", "function": "Prevents backflow into right atrium"},
            {"name": "Bicuspid (Mitral) Valve", "location": "Between left atrium and left ventricle", "function": "Prevents backflow into left atrium"},
            {"name": "Semilunar Valves", "location": "At the base of Pulmonary Artery and Aorta", "function": "Prevents backflow into ventricles"}
        ],
        "cycle_phases": ["Atrial Systole (0.1s)", "Ventricular Systole (0.3s)", "Joint Diastole (0.4s)"],
        "recommended_3d_model": "human-heart",
        "key_icse_concept": "Double circulation ensures complete separation of oxygenated and deoxygenated blood for high metabolic efficiency in warm-blooded humans."
    },
    "nephron": {
        "organ": "Nephron (Functional Unit of Kidney)",
        "system": "Excretory System",
        "parts": ["Bowman's Capsule", "Glomerulus", "Proximal Convoluted Tubule (PCT)", "Loop of Henle", "Distal Convoluted Tubule (DCT)", "Collecting Duct"],
        "urine_formation_steps": [
            {"step": "Ultrafiltration", "site": "Glomerulus & Bowman's Capsule", "mechanism": "High hydrostatic pressure forces liquid except plasma proteins and cells through basement membrane."},
            {"step": "Selective Reabsorption", "site": "PCT & Loop of Henle", "mechanism": "Active and passive reabsorption of all glucose, amino acids, major electrolytes, and ~80% of water."},
            {"step": "Tubular Secretion", "site": "DCT", "mechanism": "Active secretion of excess K+, H+, and creatinine into the filtrate to maintain blood pH balance."}
        ],
        "recommended_3d_model": "plant-cell", # Or microscopic organelle view
        "key_icse_concept": "Ultrafiltration occurs because the afferent arteriole is wider than the efferent arteriole, generating high capillary pressure."
    }
}


class BiologyEngine:
    """Biology subject engine providing detailed anatomical and physiological blueprints."""

    def analyze_concept(self, query: str) -> Dict[str, Any]:
        q = query.lower()
        if "heart" in q or "circulation" in q or "cardiac" in q or "valve" in q:
            return {"success": True, "concept": "Human Heart & Double Circulation", "data": BIOLOGICAL_SYSTEMS["heart"], "verified": True}
        elif "nephron" in q or "kidney" in q or "excretion" in q or "urine" in q:
            return {"success": True, "concept": "Nephron Structure & Function", "data": BIOLOGICAL_SYSTEMS["nephron"], "verified": True}

        return {
            "success": True,
            "concept": "General Biology Concept",
            "data": {
                "system": "ICSE Biology Framework",
                "key_icse_concept": "Structure is intimately adapted to physiological function.",
                "recommended_3d_model": "dna-double-helix"
            },
            "verified": True
        }


biology_engine = BiologyEngine()
