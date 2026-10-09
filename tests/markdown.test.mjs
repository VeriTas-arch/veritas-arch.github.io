import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';
import remarkMath from 'remark-math';
import remarkReader from '../src/lib/remark-reader.mjs';
import rehypeReader from '../src/lib/rehype-reader.mjs';

const processor = await createMarkdownProcessor({ remarkPlugins: [remarkMath, remarkReader], rehypePlugins: [rehypeReader], smartypants: false });

test('TeX survives Markdown with labels, backslashes, matrices, and inline references', async () => {
  const tex = String.raw`\begin{split}a&=b\\c&=d\end{split}\tag{1}\label{eq:1}`;
  const { code } = await processor.render(`Inline $x_i$ and $\\eqref{eq:1}$.\n\n$$\n${tex}\n$$`);
  const $ = load(code);
  assert.deepEqual($('.math-inline').map((_, el) => $(el).text()).get(), [String.raw`\(x_i\)`, String.raw`\(\eqref{eq:1}\)`]);
  assert.equal($('.math-display').text(), `\\[${tex}\\]`);
  assert.equal($('pre, code').length, 0);
});

test('GitHub alerts preserve rich content and remain separate', async () => {
  const { code } = await processor.render('> [!TIP]\n> First **assumption**\n> continued $x_i$.\n\n> [!NOTE]\n>\n> - Second `item`\n> - Third\n');
  const $ = load(code);
  assert.equal($('blockquote.prompt-tip').length, 1);
  assert.equal($('blockquote.prompt-info').length, 1);
  assert.match($('blockquote.prompt-tip').text(), /continued/);
  assert.equal($('blockquote.prompt-tip strong').text(), 'assumption');
  assert.equal($('blockquote.prompt-tip .math-inline').text(), String.raw`\(x_i\)`);
  assert.equal($('blockquote.prompt-info li').length, 2);
  assert.equal($('blockquote.prompt-info code').text(), 'item');
  assert.doesNotMatch($.text(), /\[!(TIP|NOTE)\]/);
});

test('only leading GitHub alert markers are interpreted', async () => {
  const { code } = await processor.render('> [!WARNING]\n> Warning\n\n> [!IMPORTANT]\n> Important\n\n> [!CAUTION]\n> Caution\n\n> Ordinary [!TIP] text\n');
  const $ = load(code);
  assert.equal($('blockquote.prompt-warning').text().trim(), 'Warning');
  assert.equal($('blockquote.prompt-info').text().trim(), 'Important');
  assert.equal($('blockquote.prompt-danger').text().trim(), 'Caution');
  assert.equal($('blockquote:not([class])').text().trim(), 'Ordinary [!TIP] text');
});

test('code stays literal and gets a copy control; wide tables get a scroll container', async () => {
  const input = '```bat\n@echo off\necho $PATH\n```\n\n| A | B |\n| - | - |\n| 1 | 2 |';
  const { code } = await processor.render(input);
  const $ = load(code);
  assert.equal($('.highlighter-rouge .copy-code').length, 1);
  assert.equal($('pre code').text().trim(), '@echo off\necho $PATH');
  assert.equal($('.table-wrapper table').length, 1);
});

test('all source display equations retain their exact TeX payload', async () => {
  const source = (await readFile('_posts/2024-04-01-paper6.md', 'utf8')).replaceAll('\r\n', '\n');
  const equations = [...source.matchAll(/^\$\$\n([\s\S]*?)\n\$\$/gm)].map(match => match[1]);
  const { code } = await processor.render(source.replace(/^---[\s\S]*?---\s*/, ''));
  const $ = load(code);
  assert.ok(equations.length > 30);
  assert.deepEqual($('.math-display').map((_, el) => $(el).text().slice(2, -2)).get(), equations);
  assert.equal($('blockquote[class*="prompt-"]').length, 7);
  assert.doesNotMatch(source, /\{: \.prompt-/);
  const windows = await processor.render(source.replace(/^---[\s\S]*?---\s*/, '').replaceAll('\n', '\r\n'));
  assert.equal(windows.code.replaceAll('\r\n', '\n'), code);
});
