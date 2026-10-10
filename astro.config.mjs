import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import remarkReader from './src/lib/remark-reader.ts';
import rehypeReader from './src/lib/rehype-reader.ts';

export default defineConfig({
    site: 'https://veritas-arch.github.io',
    trailingSlash: 'always',
    integrations: [sitemap()],
    markdown: {
        processor: unified({
            remarkPlugins: [remarkMath, remarkReader],
            rehypePlugins: [rehypeRaw, rehypeReader],
            smartypants: false,
        }),
        shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: false },
    },
});
