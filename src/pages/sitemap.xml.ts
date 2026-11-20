import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { CATEGORIES } from '@/content/config';
import { SITE } from '@/data/site';
import { getPublishedPosts, slugify } from '@/lib/utils';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

// Serves /sitemap.xml alongside Astro's sitemap-index.xml.
export async function GET(context: APIContext) {
  const base = (context.site ?? new URL(SITE.url)).toString().replace(/\/$/, '');
  const posts = await getPublishedPosts();
  const projects = await getCollection('projects');
  const tags = new Set<string>();
  for (const p of posts) for (const t of p.data.tags) tags.add(t);

  const paths = [
    '/',
    '/about/',
    '/archives/',
    '/categories/',
    '/tags/',
    '/series/',
    '/projects/',
    ...CATEGORIES.map((c) => `/categories/${slugify(c)}/`),
    ...[...tags].map((t) => `/tags/${slugify(t)}/`),
    ...posts.map((p) => `/posts/${p.slug}/`),
    ...projects.map((p) => `/projects/${p.slug}/`),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${escapeXml(`${base}${p}`)}</loc></url>`).join('\n') +
    `\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
