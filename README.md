# Preface

[![Deploy Jekyll site to Pages](https://github.com/VeriTas-arch/veritas-arch.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/VeriTas-arch/veritas-arch.github.io/actions/workflows/jekyll.yml)

Here we have a simple personal site with the [Chirpy][chirpy] theme. It's worth noting that although we have many alternatives, this theme is chosen for its simplicity and ease of use. After all, the site is merely a platform for sharing thoughts and ideas.

## Deployment

With Jekyll installed, run the following commands to start the site locally.

```bash
jekyll clean
jekyll build
jekyll serve
```

[chirpy]: https://github.com/cotes2020/jekyll-theme-chirpy/

## Structure

The source code that author should remember is organized as follows, with the `_posts` directory containing all the blog posts.

```bash
.
├── _data
├── _posts
├── _tabs
├── assets
├── _config.yml
└── index.html
```

> [!TIP]
> For more information, refer to [chirpy-readme](/chirpy-readme.md).
