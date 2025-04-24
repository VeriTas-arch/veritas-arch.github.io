# Preface

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/VeriTas-arch/veritas-arch.github.io/jekyll.yml?style=flat-square&logo=githubactions&logoSize=auto&label=build%20and%20deploy&labelColor=24292e&color=0366d6)
![GitHub last commit](https://img.shields.io/github/last-commit/VeriTas-arch/veritas-arch.github.io?display_timestamp=author&style=flat-square&logo=git&label=last%20update&color=fc6d26)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg?style=flat-square&logo=creativecommons)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

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
