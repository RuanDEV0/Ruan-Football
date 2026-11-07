import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const date = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const period = z
  .object({ start: date, end: date.optional() })
  .refine((value) => !value.end || value.end >= value.start, {
    message: 'O fim do período não pode anteceder o início.',
  });
const publicUrl = z.url({ protocol: /^https?$/ });
const base = z.object({ title: text, publishable: z.boolean() });

function withoutPending<T extends z.ZodType<{ publishable: boolean }>>(schema: T): T {
  return schema.refine(
    (value) => !value.publishable || !JSON.stringify(value).includes('[[PENDENTE'),
    { message: 'Conteúdo público contém informação pendente.' },
  );
}

export const projectSchema = withoutPending(
  base.extend({
    summary: text,
    order: z.number().int().nonnegative(),
    featured: z.boolean(),
    status: z.enum(['development', 'staging', 'production', 'completed']),
    role: text,
    period,
    stack: z.array(text).min(1),
    links: z.object({
      repository: publicUrl.optional(),
      demo: publicUrl.optional(),
      docs: publicUrl.optional(),
    }),
    cover: text.optional(),
  }),
);
export const experienceSchema = withoutPending(
  base.extend({ organization: text, role: text, period, summary: text }),
);
export const educationSchema = withoutPending(
  base.extend({
    institution: text,
    period,
    status: z.enum(['ongoing', 'completed', 'paused']),
    summary: text,
  }),
);
export const certificationSchema = withoutPending(
  base.extend({ issuer: text, issued: date, credential: publicUrl.optional() }),
);
