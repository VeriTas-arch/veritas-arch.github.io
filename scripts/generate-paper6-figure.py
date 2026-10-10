"""Recompute Fig. 3.5 from Eq. (3.17), rather than tracing the scanned image.

Set b = beta/alpha, d = Omega/alpha, alpha > 0, and phi1 = phi2 = phi.
Equilibria satisfy d - sin(phi) - b*sin(2*phi) = 0. The full two-variable
Jacobian has eigenvalues -cos(phi)-2*b*cos(2*phi) and -3*cos(phi), in units
of alpha. Both must be negative for stability. As in the original figure,
only -pi/2 < phi < pi/2 is shown. The nonzero detunings are illustrative.

Install scripts/requirements-figures.txt, then run this script from any folder.
The checked-in SVG is served directly; website builds do not require Python.
"""

import xml.etree.ElementTree as ET
from io import StringIO
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.lines import Line2D

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/img/paper6_fig3_5.svg"
B_MIN, B_MAX = -2.0, 0.0
DETUNING = 0.15
INK, POSITIVE, NEGATIVE, MUTED = "#303b45", "#426f70", "#756781", "#5d6b74"


def equilibrium_branches(detuning):
    """Parameterize by phase to retain both sides of each saddle-node fold."""
    for sign in (-1, 1):
        phase = sign * np.linspace(1e-5, np.pi / 2 - 1e-5, 6000)
        coupling = (detuning - np.sin(phase)) / np.sin(2 * phase)
        symmetric = -np.cos(phase) - 2 * coupling * np.cos(2 * phase)
        antisymmetric = -3 * np.cos(phase)
        yield coupling, phase, (symmetric < 0) & (antisymmetric < 0)


def make_figure():
    plt.rcParams.update(
        {
            "font.family": "DejaVu Serif",
            "font.size": 12,
            "mathtext.fontset": "dejavuserif",
            "text.color": INK,
            "axes.edgecolor": MUTED,
            "axes.labelcolor": INK,
            "xtick.color": MUTED,
            "ytick.color": MUTED,
            "svg.fonttype": "path",
            "svg.hashsalt": "paper6-figure-3-5",
        }
    )
    fig, ax = plt.subplots(figsize=(7.2, 4.8))
    fig.subplots_adjust(left=0.07, right=0.86, bottom=0.23, top=0.80)
    styles = [
        (0, INK, r"$\Omega/\alpha=0$"),
        (DETUNING, POSITIVE, r"$\Omega/\alpha=+0.15$"),
        (-DETUNING, NEGATIVE, r"$\Omega/\alpha=-0.15$"),
    ]
    for detuning, color, _ in styles:
        for coupling, phase, stable in equilibrium_branches(detuning):
            visible = (coupling >= B_MIN) & (coupling <= B_MAX)
            for state, line in [(True, "-"), (False, (0, (4, 3)))]:
                mask = visible & (stable == state)
                ax.plot(
                    np.where(mask, coupling, np.nan), phase, color=color, lw=1.7, linestyle=line
                )
    # The phi=0 branch is lost when dividing by sin(2*phi); add it explicitly.
    ax.plot([B_MIN, -0.5], [0, 0], color=INK, lw=1.7, linestyle=(0, (4, 3)))
    ax.plot([-0.5, B_MAX], [0, 0], color=INK, lw=1.7)
    ax.plot(-0.5, 0, "o", color=INK, markersize=4.5, zorder=5)
    ax.annotate(
        r"$\beta/\alpha=-\frac{1}{2}$",
        xy=(-0.5, 0),
        xytext=(-0.24, -1.00),
        fontsize=11,
        ha="center",
        color=MUTED,
        arrowprops={"arrowstyle": "->", "color": MUTED, "lw": 0.7, "shrinkA": 3, "shrinkB": 6},
    )

    ax.set(xlim=(B_MIN, B_MAX), ylim=(-np.pi / 2, np.pi / 2))
    ax.spines[["top", "left", "bottom"]].set_visible(False)
    ax.spines["right"].set_position(("data", 0))
    ax.yaxis.tick_right()
    ax.set_xticks([])
    ax.set_yticks([-np.pi / 2, 0, np.pi / 2], [r"$-\pi/2$", "0", r"$\pi/2$"])
    ax.tick_params(axis="y", length=3, pad=8)
    ax.text(1.04, 1.08, r"$\phi$", transform=ax.transAxes, fontsize=15, ha="center")
    # Keep horizontal-axis labels away from the unstable branch at phi=0.
    ax.text(0, -0.11, r"$\beta/\alpha=-2$", transform=ax.transAxes, color=MUTED, fontsize=11)
    ax.text(
        1, -0.11, r"$\beta/\alpha=0$", transform=ax.transAxes, color=MUTED, fontsize=11, ha="right"
    )
    legend = ax.legend(
        [Line2D([], [], color=color, lw=1.7) for _, color, _ in styles],
        [label for _, _, label in styles],
        loc="lower center",
        bbox_to_anchor=(0.5, 1.12),
        ncol=3,
        frameon=False,
        handlelength=1.5,
        columnspacing=1.4,
        fontsize=11,
    )
    ax.add_artist(legend)
    ax.legend(
        [
            Line2D([], [], color=INK, lw=1.7),
            Line2D([], [], color=INK, lw=1.7, linestyle=(0, (4, 3))),
        ],
        ["Stable", "Unstable"],
        loc="upper center",
        bbox_to_anchor=(0.5, -0.18),
        ncol=2,
        frameon=False,
        fontsize=11,
    )

    output = StringIO()
    fig.savefig(output, format="svg", transparent=True, metadata={"Date": None})
    plt.close(fig)
    return output.getvalue()


def themed_svg(source):
    """An embedded SVG inherits the img element's CSS color-scheme."""
    ns = "http://www.w3.org/2000/svg"
    ET.register_namespace("", ns)
    ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
    root = ET.fromstring(source)
    root.set("role", "img")
    root.set("aria-labelledby", "title description")
    title = ET.Element(f"{{{ns}}}title", {"id": "title"})
    title.text = "Figure 3.5. Equilibrium phase differences and long-distance coupling"
    description = ET.Element(f"{{{ns}}}desc", {"id": "description"})
    description.text = (
        "Recomputed from Eq. (3.17). Solid curves are stable and dashed curves are unstable. "
        "For zero detuning the pitchfork is at beta/alpha = -1/2. "
        "The positive and negative detunings Omega/alpha = 0.15 and -0.15 are illustrative."
    )
    palette = {
        INK: "var(--ink)",
        POSITIVE: "var(--positive)",
        NEGATIVE: "var(--negative)",
        MUTED: "var(--muted)",
    }
    for element in root.iter():
        if "style" in element.attrib:
            style = element.get("style")
            for color, variable in palette.items():
                style = style.replace(color, variable)
            element.set("style", style)
    style = ET.Element(f"{{{ns}}}style")
    style.text = """
    :root { --ink: #303b45; --positive: #426f70; --negative: #756781; --muted: #5d6b74; }
    @media (prefers-color-scheme: dark) {
      :root { --ink: #dce3e7; --positive: #9ccbc4; --negative: #b9abd3; --muted: #a1afb9; }
    }
    """
    root.insert(0, title)
    root.insert(1, description)
    root.insert(2, style)
    return ET.tostring(root, encoding="unicode") + "\n"


if __name__ == "__main__":
    OUTPUT.write_text(themed_svg(make_figure()), encoding="utf-8", newline="\n")
    print(OUTPUT)
