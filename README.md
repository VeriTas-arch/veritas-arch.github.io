# Veritas

Personal reading notes and research discussions, built with Astro. Static pages retain the original `/posts/<slug>/`, category, and tag URLs.

## Local development

Use Node.js 24 (minimum 22.12). MathJax is installed by npm; fonts are bundled with their licenses.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. For a production preview:

```sh
npm run check
npm test
npm run build
npm run test:site
npm run preview
```

Build output is `dist/`. GitHub Actions checks pull requests and deploys `main` to GitHub Pages. Pages must use **GitHub Actions** as its deployment source. See the [Astro deployment guide](https://docs.astro.build/en/guides/deploy/github/).

## Writing and editing

- `_posts/YYYY-MM-DD-slug.md`: Markdown articles. Filenames determine `/posts/slug/`; keep existing slugs stable.
- `assets/img/`: article images, addressed as `/assets/img/example.png`.
- `src/pages/about.astro`: About text.
- `src/components/`, `src/layouts/`: common navigation, article layout, and page structure.
- `src/styles/reader.css`: reading typography, colors, and responsive layout.
- `src/scripts/reader.js`: theme, reading preferences, contents navigation, and code copying.
- `public/`: directly served files. Dev/build commands regenerate `public/assets/img` from `assets/img` and `public/assets/mathjax` from the npm package; edit their originals instead.

Article frontmatter:

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

Use `$...$` for inline math. Put each `$$` display delimiter on its own line; MathJax preserves equation tags, labels, and references. Fenced code uses Shiki highlighting and the bundled Monaspace Neon font. Callouts use GitHub alert syntax (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, or `CAUTION`):

```md
> [!TIP]
> Callout text, including **formatting** and $math$.
```

Captioned figures use standard HTML wrappers with Markdown inside:

```md
<figure id="fig-example">

![Describe the information in the figure.](/assets/img/example.svg)

<figcaption>

**Figure 1.** Caption with *emphasis*, [links](https://example.com), and $math$.

</figcaption>
</figure>
```

Keep the blank lines around Markdown content so it is parsed inside the HTML wrappers. Reference the optional figure ID with `[Figure 1](#fig-example)`. The site adds shared figure styling, lazy loading, and a keyboard-accessible scrolling container; captions follow the body font. A native `<img>` can also be used when explicit image dimensions are needed.

The paper6 bifurcation diagram is reproducible with Python 3.12+:

```sh
python -m pip install -r scripts/requirements-figures.txt
python scripts/generate-paper6-figure.py
python -m unittest discover -s tests -p "test_*.py"
```

The script solves the symmetric equilibrium condition from Eq. (3.17) and classifies stability using both eigenvalues of the two-variable system. Nonzero detunings $\Omega/\alpha = \pm 0.15$ are illustrative and documented in the script. Its transparent SVG contains light/dark palettes selected through the embedding page's `color-scheme`; see [MDN's embedded SVG example](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-color-scheme#embedded_elements). Commit the generated `assets/img/paper6_fig3_5.svg`; regular dev/build commands copy it without requiring Python. The original PNG is retained as a reference.

## MathJax maintenance

`package.json` is the source of truth for the MathJax version; `package-lock.json` records the resolved installation. Keep the dependency pinned to an exact version and update both files with `npm install --save-exact mathjax@<version>`.

Dev/build commands copy the installed browser assets and the default New Computer Modern font through `scripts/prepare-assets.mjs`; `src/layouts/Base.astro` configures and loads the local MathJax entry point and font path. Font files, dynamic glyph data, and speech resources are served locally under `/assets/mathjax/`. For a major upgrade, check the [upstream migration guide](https://docs.mathjax.org/en/stable/upgrading/v3.html) for changes to package directories, entry points, and font loading before updating these files.

After an upgrade, run the checks and build listed under Local development, then inspect `/posts/paper6/` in the browser. Verify that scripts and fonts load locally without errors, equation numbers and references resolve, figure-caption math renders, and wide formulas remain usable on mobile in both light and dark themes.

## Font maintenance

Shared typography uses common-character subsets of Source Sans Pro and Monaspace Neon, named Veritas Sans and Veritas Mono to respect their reserved font names. The original fonts and licenses remain in `public/assets/fonts/`; browsers load the complete fonts only when characters outside the subsets are needed. Font declarations in `src/styles/fonts.css` are bundled into the shared stylesheet.

To regenerate the committed subsets and declarations:

```sh
python -m pip install -r scripts/requirements-fonts.txt
python scripts/subset-fonts.py
python -m unittest discover -s tests -p "test_font_subsets.py"
```

Normal dev/build commands use the committed font files without Python. The subsets preserve OpenType features and variable axes; they cover a reusable character range rather than the current articles' text.

## Migration notes

The local `_design/` study is ignored and is not published. The old Jekyll configuration, templates, Ruby dependencies, plugins, generated output, and Chirpy asset submodule have been removed. Articles remain in `_posts/` and are loaded by Astro; Ruby and Git submodules are no longer required.

The Markdown math parser's transitive KaTeX dependency has a security override in `package.json`; browser rendering uses MathJax. Source Sans Pro files retain the previous site's font metrics and include their upstream provenance and license in `public/assets/fonts/source-sans-pro/`.

`public/sw.min.js` retires the former Chirpy service worker and removes only `chirpy-*` caches. Keep this URL available so returning visitors can update. This version does not install a new offline worker.

The migration normalizes Markdown display-math fences and replaces Kramdown callout attributes with GitHub alerts without changing article text. The legacy IPEX timestamp `2025-04-23 24:00 +0800` is written as `2025-04-24T00:00:00+08:00`, preserving its displayed date.

Content: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Bundled fonts retain their respective upstream licenses.
