import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/data/site';
import { getPublishedPosts } from '@/lib/utils';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.brandTitle,
    description: SITE.description,
    site: context.site ?? SITE.url,
    stylesheet: '/rss-style.xsl',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.slug}/`,
      categories: [...post.data.categories, ...post.data.tags],
    })),
  });
}
