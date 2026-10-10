import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl, excerpt, siteTitle, siteDescription } from '../lib/posts';
export async function GET(context: APIContext) {
    return rss({
        title: siteTitle, description: siteDescription, site: context.site!,
        items: (await getPosts()).map(post => ({ title: post.data.title, pubDate: post.data.date, link: postUrl(post), description: excerpt(post), categories: post.data.categories })),
        customData: '<language>en</language>',
    });
}
