import math
import logging
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("knowledge_nexus.geometry_construction_engine")


class ConstructionStep(BaseModel):
    step_number: int
    title: str
    action: str
    tool: str  # 'ruler', 'compass', 'pencil', 'protractor'
    mathematical_justification: str
    active_elements: List[str]
    svg_snapshot: str


class GeometricalConstructionPlan(BaseModel):
    title: str
    topic: str
    given_parameters: Dict[str, Any]
    target_construction: str
    total_steps: int
    steps: List[ConstructionStep]
    final_svg: str
    mathematical_proof: str
    validation_status: str = "mathematically_verified"


class GeometryConstructionEngine:
    """
    Dedicated Step-by-Step 2D Geometry Construction Engine (Part 5).
    Simulates physical compass and straightedge drafting:
    - Step 1: Draw base line segment AB using ruler
    - Step 2: Compass at A with radius AC, draw arc
    - Step 3: Compass at B with radius BC, draw intersecting arc
    - Step 4: Mark intersection point C
    - Step 5: Join AC and BC with ruler
    - Step 6: Label all vertices, side lengths, and interior angles
    - Step 7: Mathematical validity check (Triangle Inequality: a + b > c)
    """

    def construct_triangle(
        self,
        ab: float = 6.0,
        bc: float = 5.0,
        ac: float = 4.0,
        units: str = "cm",
    ) -> GeometricalConstructionPlan:
        """
        Constructs a triangle ABC given three side lengths (SSS construction)
        using exact Euclidean compass-and-ruler trigonometry.
        """
        # Validate Triangle Inequality Theorem: sum of any two sides must exceed the third
        if not (ab + bc > ac and ab + ac > bc and bc + ac > ab):
            raise ValueError(f"Triangle inequality violated: sides {ab}, {bc}, {ac} cannot form a triangle.")

        # Coordinate calculation:
        # Place A at origin (80, 260) in SVG space (scale factor: 45 px per cm)
        scale = 45.0
        ax, ay = 80.0, 260.0
        bx, by = ax + (ab * scale), ay

        # By Law of Cosines at vertex A:
        # bc^2 = ab^2 + ac^2 - 2 * ab * ac * cos(A)
        # cos(A) = (ab^2 + ac^2 - bc^2) / (2 * ab * ac)
        cos_A = (ab ** 2 + ac ** 2 - bc ** 2) / (2.0 * ab * ac)
        sin_A = math.sqrt(max(0.0, 1.0 - cos_A ** 2))
        angle_a_deg = math.degrees(math.acos(cos_A))

        # Vertex C coordinates (upwards in SVG = decreasing y)
        cx = ax + (ac * scale * cos_A)
        cy = ay - (ac * scale * sin_A)

        # Base dimensions
        width = 520
        height = 340

        # Step 1: Draw Base AB
        svg_s1 = f"""<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px; width:100%;">
  <line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <circle cx="{ax}" cy="{ay}" r="5" fill="#38bdf8"/>
  <circle cx="{bx}" cy="{by}" r="5" fill="#38bdf8"/>
  <text x="{ax - 18}" y="{ay + 6}" fill="#f8fafc" font-size="14" font-weight="700">A</text>
  <text x="{bx + 10}" y="{by + 6}" fill="#f8fafc" font-size="14" font-weight="700">B</text>
  <text x="{(ax + bx) / 2}" y="{ay + 24}" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">Base AB = {ab} {units} (Ruler)</text>
</svg>"""

        # Step 2: Compass Arc from A with radius AC
        r_ac_px = ac * scale
        svg_s2 = f"""<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px; width:100%;">
  <!-- Base AB -->
  <line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="{ax}" cy="{ay}" r="5" fill="#38bdf8"/>
  <circle cx="{bx}" cy="{by}" r="5" fill="#38bdf8"/>
  <text x="{ax - 18}" y="{ay + 6}" fill="#f8fafc" font-size="14" font-weight="700">A</text>
  <text x="{bx + 10}" y="{by + 6}" fill="#f8fafc" font-size="14" font-weight="700">B</text>
  <!-- Compass Arc from A (Radius = AC) -->
  <path d="M {cx - 35} {cy + 25} A {r_ac_px} {r_ac_px} 0 0 1 {cx + 35} {cy - 25}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="{ax}" y1="{ay}" x2="{cx}" y2="{cy}" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="{ax + 20}" y="{(ay + cy) / 2}" fill="#f59e0b" font-size="12">Compass Radius = {ac} {units}</text>
  <text x="{(ax + bx) / 2}" y="{ay + 24}" fill="#94a3b8" font-size="12" text-anchor="middle">Base AB = {ab} {units}</text>
</svg>"""

        # Step 3: Compass Arc from B with radius BC
        r_bc_px = bc * scale
        svg_s3 = f"""<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px; width:100%;">
  <line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="{ax}" cy="{ay}" r="5" fill="#38bdf8"/>
  <circle cx="{bx}" cy="{by}" r="5" fill="#38bdf8"/>
  <text x="{ax - 18}" y="{ay + 6}" fill="#f8fafc" font-size="14" font-weight="700">A</text>
  <text x="{bx + 10}" y="{by + 6}" fill="#f8fafc" font-size="14" font-weight="700">B</text>
  <!-- Arc from A -->
  <path d="M {cx - 40} {cy + 30} A {r_ac_px} {r_ac_px} 0 0 1 {cx + 40} {cy - 30}" fill="none" stroke="#f59e0b" stroke-width="2"/>
  <!-- Arc from B -->
  <path d="M {cx + 35} {cy + 35} A {r_bc_px} {r_bc_px} 0 0 0 {cx - 35} {cy - 35}" fill="none" stroke="#a855f7" stroke-width="2"/>
  <circle cx="{cx}" cy="{cy}" r="6" fill="#22c55e"/>
  <text x="{cx}" y="{cy - 14}" fill="#22c55e" font-size="14" font-weight="700" text-anchor="middle">Intersection C</text>
</svg>"""

        # Step 4: Join AC and BC, Complete Triangle
        svg_final = f"""<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" style="background:#090d16; border-radius:12px; width:100%;">
  <!-- Compass Arc Witness Marks -->
  <path d="M {cx - 30} {cy + 25} A {r_ac_px} {r_ac_px} 0 0 1 {cx + 30} {cy - 25}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3"/>
  <path d="M {cx + 25} {cy + 30} A {r_bc_px} {r_bc_px} 0 0 0 {cx - 25} {cy - 30}" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3 3"/>
  
  <!-- Triangle Polygon Fill & Edges -->
  <polygon points="{ax},{ay} {bx},{by} {cx},{cy}" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" stroke-width="3"/>
  
  <!-- Vertices -->
  <circle cx="{ax}" cy="{ay}" r="5" fill="#38bdf8"/>
  <circle cx="{bx}" cy="{by}" r="5" fill="#38bdf8"/>
  <circle cx="{cx}" cy="{cy}" r="6" fill="#22c55e"/>
  
  <!-- Labels -->
  <text x="{ax - 18}" y="{ay + 6}" fill="#f8fafc" font-size="15" font-weight="700">A</text>
  <text x="{bx + 12}" y="{by + 6}" fill="#f8fafc" font-size="15" font-weight="700">B</text>
  <text x="{cx}" y="{cy - 12}" fill="#22c55e" font-size="15" font-weight="700" text-anchor="middle">C</text>
  
  <!-- Dimension Labels -->
  <text x="{(ax + bx) / 2}" y="{ay + 22}" fill="#38bdf8" font-size="13" font-weight="600" text-anchor="middle">c = {ab} {units}</text>
  <text x="{(ax + cx) / 2 - 24}" y="{(ay + cy) / 2}" fill="#f59e0b" font-size="13" font-weight="600">b = {ac} {units}</text>
  <text x="{(bx + cx) / 2 + 12}" y="{(by + cy) / 2}" fill="#a855f7" font-size="13" font-weight="600">a = {bc} {units}</text>
  
  <!-- Angle A Arc & Label -->
  <path d="M {ax + 28} {ay} A 28 28 0 0 0 {ax + 28 * cos_A} {ay - 28 * sin_A}" fill="none" stroke="#f43f5e" stroke-width="1.8"/>
  <text x="{ax + 38}" y="{ay - 8}" fill="#f43f5e" font-size="11" font-weight="600">∠A = {angle_a_deg:.1f}°</text>
</svg>"""

        steps = [
            ConstructionStep(
                step_number=1,
                title="Draw the Base Line Segment AB",
                action=f"Using a straightedge (ruler), draw horizontal line segment AB = {ab} {units}. Mark terminal points A and B.",
                tool="ruler",
                mathematical_justification="Establishes the fixed baseline segment defining the coordinate frame of the polygon.",
                active_elements=["line_ab", "vertex_a", "vertex_b"],
                svg_snapshot=svg_s1,
            ),
            ConstructionStep(
                step_number=2,
                title="Draw First Compass Arc from Vertex A",
                action=f"Adjust compass to radius AC = {ac} {units}. Place the steel needle point firmly at vertex A and strike an arc above line segment AB.",
                tool="compass",
                mathematical_justification=f"By Euclidean definition, every point on this circular arc lies at exact distance {ac} {units} from A.",
                active_elements=["arc_ac", "center_a"],
                svg_snapshot=svg_s2,
            ),
            ConstructionStep(
                step_number=3,
                title="Draw Second Compass Arc from Vertex B to find Point C",
                action=f"Adjust compass to radius BC = {bc} {units}. Place the needle point at vertex B and strike an arc intersecting the first arc at point C.",
                tool="compass",
                mathematical_justification=f"Point C is the simultaneous intersection of two loci: distance {ac} {units} from A and {bc} {units} from B.",
                active_elements=["arc_bc", "center_b", "intersection_c"],
                svg_snapshot=svg_s3,
            ),
            ConstructionStep(
                step_number=4,
                title="Join AC and BC to Complete Triangle ABC",
                action="Using a straightedge, draw line segments connecting A to C and B to C. Label all vertices, sides, and angle measurements.",
                tool="ruler",
                mathematical_justification="Two points uniquely determine a straight line segment. Triangle ABC satisfies SSS congruence criteria.",
                active_elements=["line_ac", "line_bc", "polygon_abc"],
                svg_snapshot=svg_final,
            ),
        ]

        proof = (
            f"MATHEMATICAL VALIDITY PROOF (SSS Criteria):\n"
            f"1. Segment AB = {ab} {units} was drawn directly with ruler.\n"
            f"2. Point C was located on circle(A, {ac} {units}) => AC = {ac} {units}.\n"
            f"3. Point C was located on circle(B, {bc} {units}) => BC = {bc} {units}.\n"
            f"4. By Triangle Inequality Theorem: {ab} + {ac} = {ab + ac:.1f} > {bc}, and {bc} + {ac} = {bc + ac:.1f} > {ab}.\n"
            f"Therefore, Triangle ABC is uniquely constructed and mathematically valid."
        )

        return GeometricalConstructionPlan(
            title=f"Geometrical Construction of Triangle ABC (SSS: {ab} {units}, {bc} {units}, {ac} {units})",
            topic="Geometry: Ruler and Compass Triangle Construction",
            given_parameters={"AB": f"{ab} {units}", "BC": f"{bc} {units}", "AC": f"{ac} {units}"},
            target_construction="Triangle ABC",
            total_steps=len(steps),
            steps=steps,
            final_svg=svg_final,
            mathematical_proof=proof,
            validation_status="mathematically_verified",
        )


geometry_construction_engine = GeometryConstructionEngine()
