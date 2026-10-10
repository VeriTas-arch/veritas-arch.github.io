import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

// These two directories are generated; rebuilding also removes stale assets.
const root = resolve('public/assets');
for (const [directory, source] of [['img', 'assets/img'], ['mathjax', 'node_modules/mathjax/es5']]) {
    const target = resolve(root, directory);
    if (!target.startsWith(`${root}${sep}`)) throw new Error('Asset destination is outside public/assets');
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    await cp(source, target, { recursive: true });
}
await cp('node_modules/mathjax/LICENSE', resolve(root, 'mathjax/LICENSE'));
