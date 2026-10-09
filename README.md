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

## Migration notes

The local `_design/` study is ignored and is not published. The old Jekyll configuration, templates, Ruby dependencies, plugins, generated output, and Chirpy asset submodule have been removed. Articles remain in `_posts/` and are loaded by Astro; Ruby and Git submodules are no longer required.

MathJax is pinned to 3.2.2. The Markdown math parser's transitive KaTeX dependency is overridden to 0.18.2 to include its security fix; browser rendering uses MathJax. Source Sans Pro files retain the previous site's font metrics and include their upstream provenance and license in `public/assets/fonts/source-sans-pro/`.

`public/sw.min.js` retires the former Chirpy service worker and removes only `chirpy-*` caches. Keep this URL available so returning visitors can update. This version does not install a new offline worker.

The migration normalizes Markdown display-math fences and replaces Kramdown callout attributes with GitHub alerts without changing article text. The legacy IPEX timestamp `2025-04-23 24:00 +0800` is written as `2025-04-24T00:00:00+08:00`, preserving its displayed date.

Content: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Bundled fonts retain their respective upstream licenses.
