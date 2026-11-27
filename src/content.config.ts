import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const order = z.number().int().nonnegative();
const localized = <Schema extends z.ZodType>(schema: Schema) => ({ fr: schema, ja: schema });

const pdf = z.string().regex(/^\/pdf\/[^/]+\.pdf$/i).nullable();
const pages = z.number().int().positive().nullable();

const publications = defineCollection({
  loader: glob({ base: './src/content/publications', pattern: '*.json' }),
  schema: z.object({
    year: z.number().int().min(1900).max(9999),
    type: z.enum(['article', 'revue', 'rapport', 'compilation', 'session']),
    order,
    ...localized(z.object({ title: text, description: text })),
    pdf_fr: pdf,
    pdf_ja: pdf,
    pages_fr: pages,
    pages_ja: pages,
    cover: z.string().regex(/^\/images\/covers\/[^/]+\.(avif|webp|png|jpe?g)$/i).nullable(),
    cover_source_url: z.url().nullable(),
    todo: text.optional(),
  }),
});

const featured = defineCollection({
  loader: glob({ base: './src/content/featured', pattern: '*.json' }),
  schema: z.union([
    z.object({
      order,
      publication: reference('publications'),
      ...localized(z.object({ label: text, date: text, linkLabel: text })),
    }),
    z.object({
      order,
      ...localized(z.object({ label: text, date: text, title: text, description: text, status: text })),
      todo: text.optional(),
    }),
  ]),
});

export const collections = { publications, featured };
