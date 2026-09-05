import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ngayDang: z.coerce.date(),
    // Lúc sửa gần nhất. Bỏ trống thì web tự lấy từ lịch sử Git của chính file bài này.
    ngayCapNhat: z.coerce.date().optional(),
    thoiGianDoc: z.number().optional(),
    anhDaiDien: z.string().optional(),
    doiTuong: z.enum(['chu-hang', 'nha-xe', 'ca-hai']).default('ca-hai'),
    // true = bài nháp, chưa đủ 3 ảnh thật hoặc chưa anh Nhận duyệt — KHÔNG hiện công khai.
    // Đổi thành false (hoặc xoá dòng) khi đủ ảnh + đã duyệt để đăng thật.
    draft: z.boolean().default(false)
  })
});

export const collections = { blog };
