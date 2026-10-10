// Add shared reading controls to figures, tables, and code blocks.
export default function rehypeReader() {
  return tree => {
    function walk(node) {
      if (!node.children) return;
      node.children = node.children.map(child => {
        walk(child);
        if (child.type !== 'element') return child;
        if (child.tagName === 'figure') {
          child.properties.className = [...new Set([...(child.properties.className || []), 'article-figure'])];
          child.children = child.children.map(media => {
            const img = media.tagName === 'img' ? media :
              media.tagName === 'p' && media.children.length === 1 && media.children[0].tagName === 'img' ? media.children[0] : null;
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
