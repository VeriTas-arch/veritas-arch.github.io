// The same code frame is used for every highlighted language.
export default function rehypeReader() {
  return tree => {
    function walk(node) {
      if (!node.children) return;
      node.children = node.children.map(child => {
        walk(child);
        if (child.type !== 'element') return child;
        if (child.tagName === 'table') {
          return element('div', { className: ['table-wrapper'], tabIndex: 0 }, [child]);
        }
        if (child.tagName !== 'pre') return child;
        const language = child.properties?.dataLanguage || child.children[0]?.properties?.className?.find(c => c.startsWith('language-'))?.slice(9) || 'Code';
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

function element(tagName, properties, children) {
  return { type: 'element', tagName, properties, children };
}
