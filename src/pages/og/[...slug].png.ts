import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '@/data/site';

type OgProps = {
  title: string;
  description: string;
  badge: string;
  meta: string;
};

const fontDir = path.join(process.cwd(), 'node_modules', '@fontsource');

const fonts = [
  {
    name: 'Inter',
    data: fs.readFileSync(
      path.join(fontDir, 'inter', 'files', 'inter-latin-400-normal.woff'),
    ),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: fs.readFileSync(
      path.join(fontDir, 'inter', 'files', 'inter-latin-600-normal.woff'),
    ),
    weight: 600 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: fs.readFileSync(
      path.join(fontDir, 'inter', 'files', 'inter-latin-700-normal.woff'),
    ),
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'JetBrains Mono',
    data: fs.readFileSync(
      path.join(
        fontDir,
        'jetbrains-mono',
        'files',
        'jetbrains-mono-latin-400-normal.woff',
      ),
    ),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'JetBrains Mono',
    data: fs.readFileSync(
      path.join(
        fontDir,
        'jetbrains-mono',
        'files',
        'jetbrains-mono-latin-600-normal.woff',
      ),
    ),
    weight: 600 as const,
    style: 'normal' as const,
  },
];

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const projects = await getCollection('projects');

  const paths: Array<{ params: { slug: string }; props: OgProps }> = [
    {
      params: { slug: 'default' },
      props: {
        title: SITE.fullTitle,
        description: SITE.description,
        badge: 'ARCHITECTURE · AI ENGINEERING',
        meta: 'hbhadauria.github.io',
      },
    },
    ...posts.map((post) => ({
      params: { slug: `posts/${post.slug}` },
      props: {
        title: post.data.title,
        description: post.data.description,
        badge: post.data.categories.join(' · ').toUpperCase(),
        meta: `${post.data.pubDate.toISOString().slice(0, 10)}${
          post.data.readingTime ? ` · ${post.data.readingTime}` : ''
        }`,
      },
    })),
    ...projects.map((project) => ({
      params: { slug: `projects/${project.slug}` },
      props: {
        title: project.data.title,
        description: project.data.description,
        badge: `CASE STUDY · ${project.data.category.toUpperCase()}`,
        meta: project.data.status.toUpperCase(),
      },
    })),
  ];

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, badge, meta } = props as OgProps;
  const titleSize = title.length > 72 ? 40 : title.length > 48 ? 44 : 50;

  const markup = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#0b0d12',
        color: '#f8fafc',
        fontFamily: 'Inter',
        borderTop: '8px solid #8b8cff',
        padding: '52px 64px',
        backgroundImage:
          'radial-gradient(circle at 88% 18%, rgba(139, 140, 255, 0.16), transparent 44%), radial-gradient(circle at 14% 85%, rgba(52, 211, 153, 0.10), transparent 40%)',
      },
      children: [
        // Top header: Brand mark + Badge
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  },
                  children: [
                    {
                      type: 'svg',
                      props: {
                        width: 44,
                        height: 44,
                        viewBox: '0 0 64 64',
                        children: [
                          {
                            type: 'rect',
                            props: {
                              width: 64,
                              height: 64,
                              rx: 14,
                              fill: '#12151c',
                              stroke: '#222736',
                              strokeWidth: 2,
                            },
                          },
                          {
                            type: 'path',
                            props: {
                              d: 'M18 15v34M46 15v34',
                              stroke: '#f8fafc',
                              strokeWidth: 6,
                              strokeLinecap: 'round',
                            },
                          },
                          {
                            type: 'path',
                            props: {
                              d: 'M32 21l3.2 7.8L43 32l-7.8 3.2L32 43l-3.2-7.8L21 32l7.8-3.2z',
                              fill: '#34d399',
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#f8fafc',
                              },
                              children: SITE.author,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontFamily: 'JetBrains Mono',
                                fontSize: '13px',
                                color: '#9aa3b2',
                                letterSpacing: '0.08em',
                              },
                              children: 'HSB LEARNINGS',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#34d399',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '999px',
                    padding: '8px 18px',
                  },
                  children: badge,
                },
              },
            ],
          },
        },

        // Middle content: Title + Description
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '980px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: `${titleSize}px`,
                    fontWeight: 700,
                    lineHeight: 1.16,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '22px',
                    lineHeight: 1.45,
                    color: '#9aa3b2',
                  },
                  children: description,
                },
              },
            ],
          },
        },

        // Footer: Author + Stack-agnostic tagline + URL
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #222736',
              paddingTop: '24px',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '42px',
                          height: '42px',
                          borderRadius: '999px',
                          backgroundImage:
                            'linear-gradient(135deg, #6366f1, #34d399)',
                          color: '#0b0d12',
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          fontSize: '16px',
                        },
                        children: 'HB',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '17px',
                                fontWeight: 600,
                                color: '#f8fafc',
                              },
                              children: SITE.author,
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: {
                                fontSize: '15px',
                                color: '#9aa3b2',
                              },
                              children: SITE.tagline,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '15px',
                    color: '#9aa3b2',
                  },
                  children:
                    meta === 'hbhadauria.github.io'
                      ? 'hbhadauria.github.io'
                      : `hbhadauria.github.io · ${meta}`,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(markup as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
