"""Numerical checks for the optional Python figure-generation workflow."""

import importlib.util
import unittest
from pathlib import Path

import numpy as np

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/generate-paper6-figure.py"
SPEC = importlib.util.spec_from_file_location("paper6_figure", SCRIPT)
figure = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(figure)


class BifurcationFigureTests(unittest.TestCase):
    def test_branches_satisfy_both_equations_and_full_system_stability(self):
        for detuning in [0, figure.DETUNING, -figure.DETUNING]:
            for coupling, phase, stable in figure.equilibrium_branches(detuning):
                visible = (coupling >= figure.B_MIN) & (coupling <= figure.B_MAX)
                coupling, phase, stable = coupling[visible], phase[visible], stable[visible]

                # Evaluate Eq. (3.17) directly, independently of its reduced form.
                def field(x, y):
                    return np.array(
                        [
                            detuning - 2 * np.sin(x) + np.sin(y) - coupling * np.sin(x + y),  # noqa: B023
                            detuning + np.sin(x) - 2 * np.sin(y) - coupling * np.sin(x + y),  # noqa: B023
                        ]
                    )

                np.testing.assert_allclose(field(phase, phase), 0, atol=1e-12)
                step = 1e-6
                dx = (field(phase + step, phase) - field(phase - step, phase)) / (2 * step)
                dy = (field(phase, phase + step) - field(phase, phase - step)) / (2 * step)
                jacobians = np.moveaxis(np.array([dx, dy]), -1, 0)
                np.testing.assert_array_equal(
                    np.all(np.linalg.eigvalsh(jacobians) < 0, axis=1), stable
                )

    def test_zero_detuning_pitchfork(self):
        for coupling in [-2, -1, -0.6]:
            phase = np.arccos(-1 / (2 * coupling))
            self.assertAlmostEqual(np.sin(phase) + coupling * np.sin(2 * phase), 0)
        self.assertGreater(-1 - 2 * (-0.6), 0)  # The zero-phase branch is unstable.
        self.assertLess(-1 - 2 * (-0.4), 0)  # It becomes stable after beta/alpha=-1/2.

    def test_generated_svg_is_current(self):
        generated = figure.themed_svg(figure.make_figure())
        self.assertEqual(generated, figure.OUTPUT.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
