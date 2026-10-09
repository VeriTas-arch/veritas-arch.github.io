const text = value => ({ type: 'text', value });

// Keep TeX intact for MathJax, including same-line $$ displays and equation labels.
export default function remarkReader() {
  return (tree, file) => {
    function walk(node) {
      if (node.type === 'math' || node.type === 'inlineMath') {
        const original = String(file).slice(node.position.start.offset, node.position.end.offset);
        const display = node.type === 'math' || original.startsWith('$$');
        node.data = {
          hName: 'span',
          hProperties: { className: [display ? 'math-display' : 'math-inline'] },
          hChildren: [text(`${display ? '\\[' : '\\('}${node.value}${display ? '\\]' : '\\)'}`)],
        };
      }
      if (node.type === 'blockquote') {
        const paragraph = node.children[0];
        const first = paragraph?.type === 'paragraph' && paragraph.children[0];
        const marker = first?.type === 'text' && first.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/);
        if (marker) {
          const styles = { NOTE: 'info', TIP: 'tip', IMPORTANT: 'info', WARNING: 'warning', CAUTION: 'danger' };
          node.data = { ...node.data, hProperties: { className: [`prompt-${styles[marker[1]]}`] } };
          first.value = first.value.slice(marker[0].length);
          if (!first.value) paragraph.children.shift();
          if (!paragraph.children.length) node.children.shift();
        }
      }
      if (!node.children) return;
      node.children.forEach(walk);
    }
    walk(tree);
  };
}
