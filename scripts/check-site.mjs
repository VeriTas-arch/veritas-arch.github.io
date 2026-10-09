import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const root = resolve('dist');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}
const htmlFiles = (await files(root)).filter(file => file.endsWith('.html'));
const documents = new Map(await Promise.all(htmlFiles.map(async file => [file, load(await readFile(file, 'utf8'))])));
const errors = [];
let links = 0;
for (const [file, $] of documents) {
  const pathname = `/${relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, '')}`;
  assert.equal($('h1').length, 1, `${pathname}: one page heading`);
  assert.equal($('link[rel="canonical"]').length, 1, `${pathname}: canonical`);
  assert.equal($('.brand-mark path').length, 2, `${pathname}: inline logo`);
  assert.ok($('blockquote').toArray().every(node => $(node).text().trim()), `${pathname}: no empty blockquotes`);
  assert.doesNotMatch($('.article-body').text(), /\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]|\{: \.prompt-/, `${pathname}: no unrendered callout markers`);
  for (const el of $('[href], [src]').toArray()) {
    const value = $(el).attr('href') || $(el).attr('src');
    if (!value || /^(mailto:|tel:|data:|javascript:)/.test(value)) continue;
    const url = new URL(value, `https://veritas-arch.github.io${pathname}`);
    if (url.origin !== 'https://veritas-arch.github.io') continue;
    links++;
    let target = join(root, decodeURIComponent(url.pathname));
    try {
      if ((await stat(target)).isDirectory()) target = join(target, 'index.html');
      await stat(target);
      if (url.hash && documents.has(target)) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (!documents.get(target)('[id]').toArray().some(node => documents.get(target)(node).attr('id') === id)) errors.push(`${pathname}: missing fragment ${value}`);
      }
    } catch { errors.push(`${pathname}: missing ${value}`); }
  }
}
for (const route of ['posts/paper6/', 'posts/bic/', 'posts/ipex/', 'about/', 'archives/', 'tags/', 'categories/']) {
  assert.ok(documents.has(join(root, route, 'index.html')), `Preserve /${route}`);
}
const paper = documents.get(join(root, 'posts/paper6/index.html'));
assert.equal(paper('.math-display').length, 34);
assert.equal(paper('blockquote[class*="prompt-"]').length, 7);
assert.doesNotMatch(paper('.article-body').text(), /\{: \.prompt-/);
const engineering = documents.get(join(root, 'posts/ipex/index.html'));
assert.match(engineering('.article-meta time').text(), /April 24, 2025/);
assert.ok(engineering('.copy-code').length > 0);
const feed = load(await readFile(join(root, 'feed.xml'), 'utf8'), { xmlMode: true });
const postPages = [...documents.keys()].filter(file => relative(root, file).replaceAll('\\', '/').match(/^posts\/[^/]+\/index\.html$/));
assert.equal(feed('item').length, postPages.length);
for (const file of ['sitemap.xml', 'sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', '404.html', 'sw.min.js', 'assets/mathjax/tex-chtml.js', 'assets/fonts/monaspace-neon/MonaspaceNeonVar.woff2']) await stat(join(root, file));
assert.deepEqual(errors, [], errors.join('\n'));
console.log(`Verified ${htmlFiles.length} HTML pages and ${links} local links/assets; legacy routes, feed, equations, callouts and code controls passed.`);
