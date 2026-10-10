import { cp, mkdir, rm } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

// These two directories are generated; rebuilding also removes stale assets.
const root = resolve('public/assets');
for (const [directory, source] of [['img', 'assets/img'], ['mathjax', 'node_modules/mathjax']]) {
    const target = resolve(root, directory);
    if (!target.startsWith(`${root}${sep}`)) throw new Error('Asset destination is outside public/assets');
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    await cp(source, target, {
        recursive: true,
        filter: path => {
            const entry = relative(resolve(source), path);
            // Keep the active bundle and all separately loaded components.
            return directory !== 'mathjax' || entry === 'tex-chtml.js' || !/^(?:tex|mml)-[^/\\]+\.js$/.test(entry);
        },
    });
}
const fontRoot = resolve(root, 'mathjax/fonts/mathjax-newcm-font');
await mkdir(fontRoot, { recursive: true });
for (const entry of ['chtml', 'chtml.js', 'svg', 'svg.js']) {
    await cp(`node_modules/@mathjax/mathjax-newcm-font/${entry}`, resolve(fontRoot, entry), { recursive: true });
}
