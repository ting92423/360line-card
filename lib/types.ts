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

