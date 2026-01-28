import { z } from "zod";

export const EventSchema = z.object({
  type: z.enum(["card_view", "card_click_add_friend", "card_click_share", "card_click_vcard"]),
  slug: z.string().min(1),
  ts: z.number().int().positive().optional(),
  // 可選：若有 session，server 端可補上 userId（避免信任 client）
  actorLineUserId: z.string().optional()
});

export type Event = z.infer<typeof EventSchema>;

