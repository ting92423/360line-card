import { z } from "zod";

export const CardSchema = z.object({
  slug: z.string().min(1),
  ownerLineUserId: z.string().optional(),
  template: z.string().default('default'),  // 樣板 ID
  updatedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  displayName: z.string().min(1),
  title: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().url().optional(),
  lineOaBasicId: z.string().optional(),

  /**
   * v2: CTA 快捷列（可排序/可開關）
   * - 以 type 決定行為（tel/line/share/map）
   * - value 視 type 而定（tel:電話, line:LINE 連結或 basicId, map:Google Maps URL 或地址）
   */
  ctas: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["tel", "line", "share", "map"]),
        label: z.string().optional(),
        value: z.string().optional(),
        enabled: z.boolean().optional()
      })
    )
    .optional(),

  /**
   * v2: 多頁內容（免費 1 頁、Pro 3 頁）
   * - page: profile / services / gallery
   */
  pages: z
    .object({
      profile: z
        .object({
          bio: z.string().optional()
        })
        .optional(),
      services: z
        .object({
          headline: z.string().optional(),
          items: z.array(z.string()).optional()
        })
        .optional(),
      gallery: z
        .object({
          headline: z.string().optional(),
          images: z.array(z.string().url()).optional()
        })
        .optional()
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      youtube: z.string().url().optional(),
      linkedin: z.string().url().optional()
    })
    .optional()
});

export type Card = z.infer<typeof CardSchema>;

