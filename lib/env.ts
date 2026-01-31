/**
 * 環境變數驗證模組
 * 在應用啟動時驗證所有必需的環境變數
 */

import { z } from "zod";

// 環境變數 Schema 定義
const envSchema = z.object({
  // === 必需變數（Client 端） ===
  NEXT_PUBLIC_LIFF_ID: z
    .string()
    .min(1, "LIFF ID 不可為空")
    .describe("LINE LIFF App ID"),

  NEXT_PUBLIC_LINE_OA_BASIC_ID: z
    .string()
    .min(1, "LINE OA Basic ID 不可為空")
    .describe("LINE 官方帳號 Basic ID"),

  // === 必需變數（Server 端） ===
  LINE_CHANNEL_ID: z
    .string()
    .min(1, "LINE Channel ID 不可為空")
    .describe("LINE Channel ID（用於 idToken 驗證）"),

  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET 必須至少 32 字元")
    .describe("Session Cookie 簽名密鑰"),

  // === 選用變數 ===
  NEXT_PUBLIC_APP_ORIGIN: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .describe("應用網址"),

  LINE_CHANNEL_SECRET: z
    .string()
    .optional()
    .or(z.literal(""))
    .describe("LINE Channel Secret（Webhook 驗證）"),

  LINE_CHANNEL_ACCESS_TOKEN: z
    .string()
    .optional()
    .or(z.literal(""))
    .describe("LINE Bot Access Token"),

  DATABASE_URL: z
    .string()
    .optional()
    .or(z.literal(""))
    .describe("PostgreSQL 連接字串（可選，預設使用 JSON）"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("運行環境"),
});

// 導出類型
export type Env = z.infer<typeof envSchema>;

// 快取驗證結果
let cachedEnv: Env | null = null;

/**
 * 驗證並返回環境變數
 * @throws 如果必需的環境變數缺失或格式錯誤
 */
export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse({
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    NEXT_PUBLIC_LINE_OA_BASIC_ID: process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID,
    NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
    LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      return `  - ${issue.path.join(".")}: ${issue.message}`;
    });

    const errorMessage = [
      "",
      "╔═══════════════════════════════════════════════════════════╗",
      "║           ⚠️  環境變數驗證失敗                            ║",
      "╚═══════════════════════════════════════════════════════════╝",
      "",
      "請檢查以下環境變數設定：",
      "",
      ...errors,
      "",
      "提示：請參考 .env.example 文件設定所有必需的環境變數",
      "",
    ].join("\n");

    console.error(errorMessage);
    throw new Error(`環境變數驗證失敗:\n${errors.join("\n")}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/**
 * 安全地獲取環境變數（不拋出錯誤）
 * 用於可選功能的檢查
 */
export function getEnvSafe(): Partial<Env> {
  return {
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    NEXT_PUBLIC_LINE_OA_BASIC_ID: process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID,
    NEXT_PUBLIC_APP_ORIGIN: process.env.NEXT_PUBLIC_APP_ORIGIN,
    LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
  };
}

/**
 * 檢查是否為生產環境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 檢查 PostgreSQL 是否已配置
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.length > 0 && url !== "postgres://user:password@localhost:5432/dbname");
}

/**
 * 檢查 Webhook 功能是否可用
 */
export function isWebhookConfigured(): boolean {
  return Boolean(
    process.env.LINE_CHANNEL_SECRET &&
    process.env.LINE_CHANNEL_ACCESS_TOKEN
  );
}
