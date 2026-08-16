import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ngayDang: z.coerce.date(),
    thoiGianDoc: z.number().optional(),
    anhDaiDien: z.string().optional(),
    doiTuong: z.enum(['chu-hang', 'nha-xe', 'ca-hai']).default('ca-hai')
  })
});

export const collections = { blog };
