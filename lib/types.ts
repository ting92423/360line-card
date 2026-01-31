import { z } from "zod";

/**
 * 名片資料 Schema
 * 包含長度限制以防止資料庫溢出和效能問題
 */
export const CardSchema = z.object({
  // URL 安全的 slug（只允許字母、數字、底線、連字號）
  slug: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Slug 只能包含字母、數字、底線和連字號"
  }),
  ownerLineUserId: z.string().max(100).optional(),
  template: z.string().max(50).default('default'),  // 樣板 ID
  updatedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime().optional(),
  
  // 基本資訊（含長度限制）
  displayName: z.string().min(1).max(100),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  avatarUrl: z.string().url().max(2000).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),  // 允許空字串
  website: z.string().url().max(2000).optional().or(z.literal("")),
  lineOaBasicId: z.string().max(100).optional(),

  /**
   * v2: CTA 快捷列（可排序/可開關）
   * - 以 type 決定行為（tel/line/share/map）
   * - value 視 type 而定（tel:電話, line:LINE 連結或 basicId, map:Google Maps URL 或地址）
   */
  ctas: z
    .array(
      z.object({
        id: z.string().min(1).max(50),
        type: z.enum(["tel", "line", "share", "map"]),
        label: z.string().max(100).optional(),
        value: z.string().max(500).optional(),
        enabled: z.boolean().optional()
      })
    )
    .max(10)  // 最多 10 個 CTA
    .optional(),

  /**
   * v3: 多頁內容（免費 1 頁、專業版 3 頁、商務版 5 頁）
   * - about: 關於我/專業介紹
   * - services: 服務項目
   * - portfolio: 作品集
   * - company: 公司資訊
   */
  pages: z
    .object({
      // 關於我 / 專業介紹
      about: z
        .object({
          bio: z.string().max(2000).optional(),           // 個人簡介
          tags: z.array(z.string().max(50)).max(10).optional(),  // 專長標籤
          experiences: z.array(
            z.object({
              title: z.string().max(100),                 // 經歷標題
              description: z.string().max(500).optional() // 經歷說明
            })
          ).max(10).optional(),
          motto: z.string().max(200).optional(),          // 座右銘
          tagline: z.string().max(200).optional(),        // 標語/簡介
          address: z.string().max(500).optional()         // 聯絡地址
        })
        .optional(),
      
      // 服務項目
      services: z
        .object({
          headline: z.string().max(200).optional(),       // 標題
          items: z.array(
            z.object({
              icon: z.string().max(50).optional(),        // 圖示名稱
              name: z.string().max(100),                  // 服務名稱
              description: z.string().max(500).optional(), // 說明
              price: z.string().max(100).optional()       // 價格
            })
          ).max(20).optional(),
          bookingUrl: z.string().url().max(500).optional().or(z.literal("")), // 預約連結
          faqs: z.array(
            z.object({
              question: z.string().max(200),
              answer: z.string().max(1000)
            })
          ).max(10).optional()
        })
        .optional(),
      
      // 作品集
      portfolio: z
        .object({
          headline: z.string().max(200).optional(),
          images: z.array(z.string().url().max(2000)).max(20).optional(),
          videos: z.array(z.string().url().max(2000)).max(5).optional(),
          testimonials: z.array(
            z.object({
              name: z.string().max(100),
              content: z.string().max(500),
              avatar: z.string().url().max(2000).optional()
            })
          ).max(10).optional()
        })
        .optional(),
      
      // 公司資訊
      company: z
        .object({
          name: z.string().max(200).optional(),           // 公司名稱
          description: z.string().max(2000).optional(),   // 公司簡介
          logo: z.string().url().max(2000).optional(),    // Logo URL
          address: z.string().max(500).optional(),        // 地址
          mapUrl: z.string().url().max(2000).optional().or(z.literal("")), // 地圖連結
          businessHours: z.string().max(500).optional()   // 營業時間
        })
        .optional()
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().url().max(500).optional().or(z.literal("")),
      facebook: z.string().url().max(500).optional().or(z.literal("")),
      youtube: z.string().url().max(500).optional().or(z.literal("")),
      linkedin: z.string().url().max(500).optional().or(z.literal(""))
    })
    .optional()
});

export type Card = z.infer<typeof CardSchema>;

