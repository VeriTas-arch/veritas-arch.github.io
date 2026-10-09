import { getCollection, type CollectionEntry } from 'astro:content';

export const siteTitle = 'Veritas';
export const siteDescription = 'Collections of daily learning and researching.';
export const slugify = (name: string) => name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
export const postUrl = (post: CollectionEntry<'posts'>) => `/posts/${post.id}/`;
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai',
}).format(date);
export const getPosts = async () => (await getCollection('posts')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export function excerpt(post: CollectionEntry<'posts'>) {
  if (post.data.description) return post.data.description;
  const paragraph = post.body?.replace(/^> ?/gm, '').split(/\n\s*\n/).find(part => {
    const clean = part.replace(/^>\s*/gm, '').trim();
    return clean && !/^(#|\{|\[|<|\$|`)/.test(clean);
  }) || '';
  const plain = paragraph.replace(/^>\s*/gm, '').replace(/\[([^\]]+)\](?:\([^)]*\)|\[[^\]]*\])/g, '$1')
    .replace(/<[^>]*>/g, '').replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 210 ? `${plain.slice(0, 207).replace(/\s+\S*$/, '')}…` : plain;
}
