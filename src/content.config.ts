import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = [
  'Architecture',
  'AI',
  'Apps',
  'Cloud',
  'DevOps',
  'Updates',
] as const;

export const TAGS = [
  'introduction',
  'android',
  'ai',
  'gemini',
  'antigravity',
  'neopop',
  'mobile',
  'astro',
  'architecture',
  'kotlin',
  'compose',
  'navigation-3',
  'cicd',
  'agents',
  'design-systems',
] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.enum(CATEGORIES)).min(1),
    tags: z.array(z.enum(TAGS)).min(1),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    readingTime: z.string().optional(),
    tldr: z.string().optional(),
    image: z
      .object({
        path: z.string().min(1),
        alt: z.string().min(1),
      })
      .optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1).max(160),
    status: z.enum(['Live', 'Open Source', 'In Progress', 'Idea']),
    category: z.enum(['Mobile', 'AI', 'Architecture', 'DevOps']),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
    tags: z.array(z.string().min(1)).min(1),
    metrics: z
      .array(
        z.object({
          value: z.string().min(1),
          label: z.string().min(1),
        }),
      )
      .optional(),
    links: z
      .object({
        playStore: z.url().optional(),
        github: z.url().optional(),
        demo: z.url().optional(),
      })
      .optional(),
    gradient: z.string().optional(),
    pubDate: z.coerce.date(),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/series' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(160),
    status: z.enum(['Active', 'Completed', 'Planned']).default('Active'),
    order: z.number().int().default(0),
  }),
});

export const collections = { blog, projects, series };
