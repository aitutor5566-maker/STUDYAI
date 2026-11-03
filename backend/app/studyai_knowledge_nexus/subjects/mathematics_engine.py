import re
import logging
from typing import Any, Dict, List, Optional
import sympy as sp

logger = logging.getLogger("knowledge_nexus.math_engine")


class MathematicsEngine:
    """
    Symbolic Mathematical Solver and Verification Engine.
    Leverages SymPy for exact computations, formula resolution,
    and hallucination-free derivations.
    """

    def solve_algebraic_expression(self, expression_str: str) -> Dict[str, Any]:
        """
        Solves or simplifies algebraic expressions or quadratic equations.
        e.g. '2*x**2 - 8*x + 6 = 0' or 'x**2 - 5*x + 6'
        """
        try:
            cleaned = expression_str.replace("^", "**").replace("=", "-(")
            if "-(" in cleaned:
                cleaned += ")"
            
            x = sp.Symbol("x")
            expr = sp.sympify(cleaned)
            roots = sp.solve(expr, x)

            # Step-by-step discriminant if quadratic
            poly = sp.Poly(expr, x)
            deg = poly.degree()
            steps = []
            
            if deg == 2:
                coeffs = poly.all_coeffs()
                a, b, c = coeffs[0], coeffs[1], coeffs[2]
                disc = b**2 - 4*a*c
                steps.append(f"Standard form: {a}x² + ({b})x + ({c}) = 0")
                steps.append(f"Identify coefficients: a = {a}, b = {b}, c = {c}")
                steps.append(f"Calculate Discriminant D = b² - 4ac = ({b})² - 4({a})({c}) = {disc}")
                if disc > 0:
                    nature = "Two distinct real roots"
                elif disc == 0:
                    nature = "Two equal and real roots"
                else:
                    nature = "No real roots (Complex roots)"
                steps.append(f"Nature of roots: {nature}")
                steps.append(f"Roots: x = {roots}")
            else:
                steps.append(f"Original Expression: {expression_str}")
                steps.append(f"Simplified Expression: {sp.simplify(expr)}")
                steps.append(f"Solutions: {roots}")

            return {
                "success": True,
                "input": expression_str,
                "solution": [str(r) for r in roots],
                "steps": steps,
                "verified_by_sympy": True,
            }
        except Exception as e:
            logger.warning(f"SymPy evaluation failed for '{expression_str}': {e}")
            return {
                "success": False,
                "input": expression_str,
                "error": str(e),
                "verified_by_sympy": False,
            }

    def verify_solution(self, equation: str, candidate_answer: str) -> Dict[str, Any]:
        """
        Independently checks whether a proposed student/model solution satisfies the equation.
        """
        try:
            x = sp.Symbol("x")
            cleaned_eq = equation.replace("^", "**")
            if "=" in cleaned_eq:
                left, right = cleaned_eq.split("=")
                expr = sp.sympify(f"({left}) - ({right})")
            else:
                expr = sp.sympify(cleaned_eq)

            val = sp.sympify(candidate_answer.replace("^", "**"))
            residual = expr.subs(x, val)
            is_correct = bool(sp.simplify(residual) == 0)

            return {
                "is_correct": is_correct,
                "equation": equation,
                "candidate": candidate_answer,
                "residual": str(residual),
                "verified": True,
            }
        except Exception as e:
            return {
                "is_correct": False,
                "error": f"Verification failed: {e}",
                "verified": False,
            }

    def generate_function_svg(self, func_type: str = "quadratic") -> str:
        """
        Generates an inline interactive SVG visualization for math functions.
        """
        if func_type == "quadratic":
            # f(x) = x^2 - 4x + 3, roots at x=1, x=3, vertex at (2, -1)
            # Map graph coordinate window x in [-1, 5], y in [-3, 6] to SVG 400x260
            return (
                '<svg viewBox="0 0 400 260" class="w-full h-auto bg-slate-900 rounded-xl p-3 border border-slate-700/50">'
                '<defs>'
                '<linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">'
                '<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>'
                '<stop offset="100%" stop-color="#818cf8" stop-opacity="0.05"/>'
                '</linearGradient>'
                '</defs>'
                '<!-- Grid lines -->'
                '<line x1="40" y1="200" x2="380" y2="200" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>'
                '<line x1="80" y1="20" x2="80" y2="240" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>'
                '<!-- Axes -->'
                '<line x1="30" y1="180" x2="390" y2="180" stroke="#94a3b8" stroke-width="2"/>'
                '<line x1="80" y1="10" x2="80" y2="250" stroke="#94a3b8" stroke-width="2"/>'
                '<!-- Axis Labels -->'
                '<text x="385" y="175" fill="#94a3b8" font-size="12" font-family="sans-serif">x</text>'
                '<text x="85" y="20" fill="#94a3b8" font-size="12" font-family="sans-serif">y</text>'
                '<!-- Parabola curve: f(x) = (x-2)^2 - 1 -->'
                '<path d="M 40 40 Q 180 320 320 40" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>'
                '<!-- Roots Points -->'
                '<circle cx="130" cy="180" r="5" fill="#ec4899"/>'
                '<text x="130" y="170" fill="#f472b6" font-size="11" text-anchor="middle" font-family="sans-serif">Root (1, 0)</text>'
                '<circle cx="230" cy="180" r="5" fill="#ec4899"/>'
                '<text x="230" y="170" fill="#f472b6" font-size="11" text-anchor="middle" font-family="sans-serif">Root (3, 0)</text>'
                '<!-- Vertex -->'
                '<circle cx="180" cy="225" r="5" fill="#eab308"/>'
                '<text x="180" y="245" fill="#facc15" font-size="11" text-anchor="middle" font-family="sans-serif">Vertex (2, -1)</text>'
                '<!-- Title -->'
                '<text x="200" y="30" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">f(x) = x² - 4x + 3</text>'
                '</svg>'
            )
        elif func_type == "trigonometry":
            # Sine wave
            return (
                '<svg viewBox="0 0 400 200" class="w-full h-auto bg-slate-900 rounded-xl p-3 border border-slate-700/50">'
                '<line x1="30" y1="100" x2="380" y2="100" stroke="#94a3b8" stroke-width="2"/>'
                '<line x1="60" y1="20" x2="60" y2="180" stroke="#94a3b8" stroke-width="2"/>'
                '<!-- Sine path -->'
                '<path d="M 60 100 Q 115 10 170 100 T 280 100 T 390 100" fill="none" stroke="#a855f7" stroke-width="3"/>'
                '<circle cx="115" cy="55" r="4" fill="#a855f7"/>'
                '<text x="115" y="45" fill="#d8b4fe" font-size="11" text-anchor="middle">π/2 (Peak = 1)</text>'
                '<circle cx="225" cy="145" r="4" fill="#a855f7"/>'
                '<text x="225" y="165" fill="#d8b4fe" font-size="11" text-anchor="middle">3π/2 (-1)</text>'
                '<text x="200" y="25" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">y = sin(x)</text>'
                '</svg>'
            )
        return ""


math_engine = MathematicsEngine()
