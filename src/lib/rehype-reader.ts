import type { Element, ElementContent, Parent, Properties, Root } from 'hast';
import type { Transformer } from 'unified';

// Add shared reading controls to figures, tables, and code blocks.
export default function rehypeReader(): Transformer<Root> {
    return tree => {
        function walk(node: Parent) {
            node.children = node.children.map(child => {
                if (child.type !== 'element') return child;
                walk(child);
                if (child.tagName === 'figure') {
                    child.properties.className = [...new Set([...(child.properties.className || []), 'article-figure'])];
                    child.children = child.children.map(media => {
                        if (media.type !== 'element') return media;
                        const candidate = media.tagName === 'p' && media.children.length === 1 ? media.children[0] : media;
                        const img = candidate?.type === 'element' && candidate.tagName === 'img' ? candidate : null;
                        if (!img) return media;
                        img.properties.loading ??= 'lazy';
                        img.properties.decoding ??= 'async';
                        return element('div', {
                            className: ['figure-media'], role: 'region', tabIndex: 0,
                            ariaLabel: 'Figure; scroll horizontally on small screens',
                        }, [img]);
                    });
                }
                if (child.tagName === 'table') {
                    return element('div', { className: ['table-wrapper'], tabIndex: 0 }, [child]);
                }
                if (child.tagName !== 'pre') return child;
                const code = child.children[0];
                const language = (typeof child.properties.dataLanguage === 'string' && child.properties.dataLanguage) ||
                    (code?.type === 'element' && code.properties.className?.find(c => c.startsWith('language-'))?.slice(9)) || 'Code';
                return element('div', { className: ['highlighter-rouge'] }, [
                    element('div', { className: ['code-header'] }, [
                        element('span', {}, [{ type: 'text', value: language }]),
                        element('button', { type: 'button', className: ['copy-code'], ariaLabel: 'Copy code' }, [{ type: 'text', value: 'Copy' }]),
                    ]), child,
                ]);
            });
        }
        walk(tree);
    };
}

function element(tagName: string, properties: Properties, children: ElementContent[]): Element {
    return { type: 'element', tagName, properties, children };
}
