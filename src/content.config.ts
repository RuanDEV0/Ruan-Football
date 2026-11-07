import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  projectSchema,
  experienceSchema,
  educationSchema,
  certificationSchema,
} from '@/lib/content-schemas';

export const collections = {
  projetos: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projetos' }),
    schema: projectSchema,
  }),
  experiencia: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/experiencia' }),
    schema: experienceSchema,
  }),
  formacao: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/formacao' }),
    schema: educationSchema,
  }),
  certificacoes: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/certificacoes' }),
    schema: certificationSchema,
  }),
};
