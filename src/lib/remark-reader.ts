import type { Text } from 'hast';
import type { Nodes, Root } from 'mdast';
import type {} from 'remark-math';
import type { Transformer } from 'unified';

const text = (value: string): Text => ({ type: 'text', value });

// Keep TeX intact for MathJax, including same-line $$ displays and equation labels.
export default function remarkReader(): Transformer<Root> {
    return (tree, file) => {
        function walk(node: Nodes) {
            if (node.type === 'math' || node.type === 'inlineMath') {
                const offset = node.position?.start.offset;
                const display = node.type === 'math' || (offset !== undefined && String(file).startsWith('$$', offset));
                node.data = {
                    hName: 'span',
                    hProperties: { className: [display ? 'math-display' : 'math-inline'] },
                    hChildren: [text(`${display ? '\\[' : '\\('}${node.value}${display ? '\\]' : '\\)'}`)],
                };
            }
            if (node.type === 'blockquote') {
                const paragraph = node.children[0];
                if (paragraph?.type === 'paragraph') {
                    const first = paragraph.children[0];
                    if (first?.type === 'text') {
                        const marker = first.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/);
                        if (marker) {
                            const styles: Record<string, string> = { NOTE: 'info', TIP: 'tip', IMPORTANT: 'info', WARNING: 'warning', CAUTION: 'danger' };
                            node.data = { ...node.data, hProperties: { className: [`prompt-${styles[marker[1]]}`] } };
                            first.value = first.value.slice(marker[0].length);
                            if (!first.value) paragraph.children.shift();
                            if (!paragraph.children.length) node.children.shift();
                        }
                    }
                }
            }
            if (!('children' in node)) return;
            node.children.forEach(walk);
        }
        walk(tree);
    };
}
