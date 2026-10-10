# Repository guide

This repository contains a personal site for reading notes, research discussions, and other interests, built with Astro. Refer to it as "the site" or "this personal site" in maintenance prose; the owner's alias is not the site's name.

## README and presentation

- Treat the current README as the reference for the site's introduction and presentation. Preserve the author's personal wording unless a rewrite is requested.
- Keep the centered mountain mark without an accompanying site-name heading or image caption. Preserve the existing introductory line and reading navigation.
- Keep README.md focused on readers: the personal introduction, reading links, a brief repository pointer, and licensing. Put development, validation, and resource-maintenance instructions in this file.
- Account names, repository URLs, and font-family identifiers are technical identifiers, not a source for the site's public name. Change them only when the task specifically requires it.

## Working conventions

- Keep changes scoped to the request and preserve unrelated work.
- Preserve article text, existing post slugs, category/tag routes, and displayed dates unless a content change is requested.
- Edit source assets, not generated copies. Do not commit `dist/`, `.astro/`, `node_modules/`, `public/assets/img/`, or `public/assets/mathjax/`.
- Retain font licenses, original font files, and the legacy service-worker retirement endpoint.
- Report the checks actually run. Browser behavior requires browser verification; a successful build alone is insufficient.

## Development and validation

Use Node.js 24 (minimum 22.12) and Python 3.12+ for Python tooling. CI uses Python 3.13. Site dev/build commands do not require Python.

```sh
npm ci
npm run dev
```

The development server is at `http://127.0.0.1:4321/`. Run the relevant checks before delivering code changes:

```sh
python -m pip install -r scripts/requirements-lint.txt
npm run check
npm test
npm run build
npm run test:site
```

`npm test` runs Ruff lint/format checks and the JavaScript tests. `npm run test:ruff` runs only Ruff. Its version is pinned in `scripts/requirements-lint.txt`; `ruff.toml` defines the rules and 100-character line length. Fix violations rather than adding `noqa`: the lint command ignores suppressions. Apply formatting with `python -m ruff format scripts tests`.

Python functional tests are separate from `npm test`; their dependencies and commands are listed under resource maintenance below. For documentation-only changes, check Markdown formatting, links, and command/path accuracy.

`npm run build` writes `dist/`; `npm run test:site` validates that build's routes, local links/assets, figures, equations, callouts, and code controls. Run `npm run preview` to inspect the production build. For reading-layout or MathJax changes, check desktop and narrow mobile widths in both themes, equation references, figure captions, horizontal scrolling, and browser/network errors.

GitHub Actions checks pull requests and deploys `main` to GitHub Pages. Pages must use **GitHub Actions** as its deployment source. The workflow is `.github/workflows/astro.yml`.

## Source layout

| Path | Purpose |
| --- | --- |
| `_posts/YYYY-MM-DD-slug.md` | Articles; filenames determine `/posts/slug/` |
| `assets/img/` | Source article images, served at `/assets/img/` |
| `src/pages/about.astro` | About text |
| `src/components/`, `src/layouts/`, `src/pages/` | Shared UI, page layout, and routes |
| `src/lib/` | Post helpers and Markdown transforms |
| `src/styles/reader.css`, `src/scripts/reader.js` | Typography, themes, reading controls, contents navigation, and code copying |
| `public/` | Directly served files, including committed fonts and generated asset directories |

## Article conventions

```yaml
---
title: Article title
date: 2026-10-09T12:00:00+08:00
categories: [Paper Notes]
tags: [Mathematical Modeling]
math: true
description: Optional short description for listings and metadata.
---
```

Use `math: true` for articles requiring MathJax. Use `$...$` for inline math and put each `$$` display delimiter on its own line. Preserve equation tags, labels, and references. Fenced code uses Shiki highlighting and the bundled Monaspace-derived font.

Callouts use GitHub alert syntax: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, or `CAUTION`.

```md
> [!TIP]
> Callout text, including **formatting** and $math$.
```

Captioned figures use native HTML wrappers with Markdown inside:

```md
<figure id="fig-example">

![Describe the information in the figure.](/assets/img/example.svg)

<figcaption>

**Figure 1.** Caption with *emphasis*, [links](https://example.com), and $math$.

</figcaption>
</figure>
```

Keep the blank lines around Markdown content so it is parsed inside HTML wrappers. Reference the optional figure ID with `[Figure 1](#fig-example)`. The shared transform adds figure styling, lazy loading, and a keyboard-accessible scrolling container; captions follow the body font. Use a native `<img>` when explicit image dimensions are needed.

## Resource maintenance

### MathJax

`package.json` is the source of truth for the exact MathJax version; update it and the lockfile with `npm install --save-exact mathjax@<version>`.

`scripts/prepare-assets.mjs` regenerates `public/assets/img/` from `assets/img/` and `public/assets/mathjax/` from installed npm packages. It copies only the active `tex-chtml.js` combined bundle, excluding alternative combined bundles. Keep separately loaded components, New Computer Modern font resources for both CHTML and SVG output, dynamic glyph data, speech resources, and licenses available locally.

`src/layouts/Base.astro` configures the local entry point and font path. After an upgrade, review upstream changes to package layout, run the checks/build above, and inspect `/posts/paper6/` in the browser. Verify equation references, figure-caption math, mobile scrolling, and local loading of extensions, dynamic fonts, and speech resources without external requests.

The Markdown parser brings in KaTeX transitively. Retain the override in `package.json` unless the dependency chain has been reviewed; the browser renderer is MathJax.

### Fonts

The common-character subsets of Source Sans Pro and Monaspace Neon are named Veritas Sans and Veritas Mono to respect reserved font names. Preserve the originals, provenance READMEs, and licenses in `public/assets/fonts/`. Full fonts provide fallback for characters outside the subsets.

```sh
python -m pip install -r scripts/requirements-fonts.txt
python scripts/subset-fonts.py
python -m unittest discover -s tests -p "test_font_subsets.py"
```

Commit the generated subset WOFF2 files and `src/styles/fonts.css`. The generator preserves OpenType features, variable axes, metrics, and license records, and uses a reusable character range rather than scanning article text. Normal dev/build commands use the committed files.

### Paper6 figure

The committed `assets/img/paper6_fig3_5.svg` is generated from Eq. (3.17). The script solves the symmetric equilibrium condition and classifies stability using both eigenvalues of the full system. Nonzero detunings of ±0.15 are illustrative. The SVG contains light/dark palettes selected through the embedding page's color scheme.

Use the versions verified against the committed SVG; Matplotlib version changes can alter its serialized output:

```sh
python -m pip install "matplotlib==3.10.9" "numpy==2.5.3"
python scripts/generate-paper6-figure.py
python -m unittest discover -s tests -p "test_paper6_figure.py"
```

After installing both figure and font dependencies, run all Python functional tests with `python -m unittest discover -s tests -p "test_*.py"`. Regular site builds copy the committed SVG without running Python.

## Compatibility and migration

- Articles remain in `_posts/`, but Astro replaces Jekyll. Ruby dependencies and Git submodules are no longer required. The ignored `_design/` study is not published.
- `public/sw.min.js` retires the former Chirpy worker and removes only `chirpy-*` caches. Keep its URL and the update logic in `Base.astro` so returning visitors can clear old caches; do not introduce a new offline worker as part of cleanup.
- `src/pages/sitemap.xml.ts` preserves the old sitemap URL; the sitemap integration owns the generated page list.
- The migration normalized Markdown display-math fences and replaced Kramdown callout attributes with GitHub alerts without changing article text.
- The legacy IPEX timestamp `2025-04-23 24:00 +0800` is represented as `2025-04-24T00:00:00+08:00`, preserving its displayed date.

Content uses CC BY-NC-SA 4.0. Bundled fonts retain their respective upstream licenses.
