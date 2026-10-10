import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Load the real helper without Astro's build-time content module.
const source = await readFile(new URL('../src/lib/posts.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const exports = {};
runInNewContext(outputText, { exports, require: name => {
    assert.equal(name, 'astro:content');
    return {};
} });
const { excerpt } = exports;

test('excerpts remove incomplete HTML tags before Markdown cleanup', () => {
    for (const body of [
        'Intro <script',
        'Intro <scr_ipt',
        'Intro <img src=x onerror=alert(1)//',
        'Intro <b>bold</b> <script\n src=x',
        'Intro <b>bold</b> <scr<script>ipt> <script',
    ]) {
        const result = excerpt({ data: {}, body });
        assert.doesNotMatch(result, /</, body);
        assert.ok(result.startsWith('Intro'), body);
    }
    assert.equal(excerpt({ data: {}, body: 'Intro <script' }), 'Intro');
    assert.equal(excerpt({ data: {}, body: 'Intro <b>bold</b> <script\n src=x' }), 'Intro bold');
});

test('excerpts preserve paragraph selection, link labels and inline text', () => {
    const body = '# Heading\n\n<script>ignored</script>\n\n> Read **this** [guide](https://example.com) and [reference][ref] with <em>care</em>.\n\nLater paragraph.';
    assert.equal(excerpt({ data: {}, body }), 'Read this guide and reference with care.');
    assert.equal(excerpt({ data: { description: 'Explicit summary' }, body }), 'Explicit summary');
    assert.equal(excerpt({ data: {} }), '');
    assert.equal(excerpt({ data: {}, body: '# Heading\n\n```code```' }), '');
});

test('excerpts retain the length limit and avoid truncating a word', () => {
    assert.equal(excerpt({ data: {}, body: 'x'.repeat(210) }), 'x'.repeat(210));
    const body = 'word '.repeat(60);
    assert.equal(excerpt({ data: {}, body }), Array(41).fill('word').join(' ') + '…');
});
