import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const order = z.number().int().nonnegative();
const localized = <Schema extends z.ZodType>(schema: Schema) => ({ fr: schema, ja: schema });

const pdfPath = z.string().regex(/^\/pdf\/[^/]+\.pdf$/i);
const pdf = pdfPath.nullable();
const pages = z.number().int().positive().nullable();

const publications = defineCollection({
  loader: glob({ base: './src/content/publications', pattern: '*.json' }),
  schema: z.object({
    year: z.number().int().min(1900).max(9999),
    type: z.enum(['article', 'revue', 'rapport', 'compilation', 'session', 'programme']),
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

const copy = z.object(localized(text));
const splitTitle = z.object(localized(z.tuple([z.string().min(1), text])));
const copyList = z.object(localized(z.array(text).min(1)));
const eventPdfs = z.object(localized(pdfPath));
const statistic = z.object({ value: text, label: copy });
const actionImage = z.string().regex(/^\/images\/actions\/[^/]+\.webp$/);

const actions = defineCollection({
  loader: glob({ base: './src/content/actions', pattern: '*.json' }),
  schema: z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('page'),
      title: copy,
      hero: z.object({
        eyebrow: copy,
        title: splitTitle,
        description: copy,
        photo: z.object({ src: actionImage, alt: copy, width: z.number().int().positive(), height: z.number().int().positive() }),
        statistics: z.array(statistic).min(1),
      }),
      jump: z.object({ label: copy, items: z.array(z.object({ id: z.enum(['e2025', 'e2024', 'editions']), label: copy })).min(1) }),
      earlier: z.object({ eyebrow: copy, title: copy, note: copy, takeawayLabel: copy }),
      links: z.object({ program: copy, report: copy }),
    }),
    z.object({
      kind: z.literal('osaka-2025'),
      eyebrow: copy,
      title: copy,
      description: copy,
      topics: copyList,
      statistics: z.array(statistic).min(1),
      watermark: actionImage,
      journalLabel: copy,
      journalAnchor: text,
    }),
    z.object({
      kind: z.literal('bilan-2024'),
      eyebrow: copy,
      title: splitTitle,
      summary: z.object(localized(z.tuple([text, text]))),
      statistics: z.array(statistic).min(1),
      opening: z.object({ label: copy, description: copy }),
      sessionsLabel: copy,
      speakersLabel: copy,
      sessions: z.array(z.object({
        label: copy,
        title: copy,
        description: copy,
        speakers: z.array(z.object({ name: text, role: copy })).min(1),
      })).length(4),
      pdf: eventPdfs,
      report: eventPdfs,
    }),
    z.object({
      kind: z.literal('editions'),
      items: z.array(z.object({
        year: copy,
        title: copy,
        subtitle: copy,
        datePlace: copy.optional(),
        statistics: copyList,
        description: copy,
        takeaway: z.object({ title: copy, paragraphs: copyList }),
        bullets: z.array(z.object({ label: copy, description: copy })).min(1),
        link: z.enum(['program', 'report']),
        pdf: eventPdfs,
        report: eventPdfs.optional(),
        todo: text.optional(),
      })).length(5),
    }),
  ]),
});

export const collections = { publications, featured, actions };
