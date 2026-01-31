"use client";

import type { Liff } from "@line/liff";

let cached: Promise<Liff | null> | null = null;
let lastError: Error | null = null;

// 條件式日誌（只在開發環境輸出）
const isDev = process.env.NODE_ENV === "development";
const log = (...args: unknown[]) => isDev && console.log(...args);
const logError = (...args: unknown[]) => isDev && console.error(...args);

export async function getLiff(): Promise<Liff | null> {
  if (typeof window === "undefined") return null;
  if (cached) return cached;

  cached = (async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      log("[LIFF] Initializing with ID:", liffId ? `${liffId.substring(0, 10)}...` : "NOT SET");
      
      if (!liffId) {
        lastError = new Error("NEXT_PUBLIC_LIFF_ID 未設定");
        logError("[LIFF] Error:", lastError.message);
        return null;
      }

      const liffModule = await import("@line/liff");
      const liff = liffModule.default;

      await liff.init({ liffId });
      log("[LIFF] Initialized successfully, isLoggedIn:", liff.isLoggedIn(), "isInClient:", liff.isInClient());
      return liff;
    } catch (err) {
      // 解析 LIFF 錯誤詳情
      const liffErr = err as { code?: string; message?: string };
      const errorCode = liffErr.code || "UNKNOWN";
      const errorMessage = liffErr.message || String(err);
      const usedLiffId = process.env.NEXT_PUBLIC_LIFF_ID || "NOT_SET";
      
      // 提供更友善的錯誤訊息
      let friendlyMessage = errorMessage;
      if (errorCode === "INVALID_ARGUMENT") {
        friendlyMessage = "LIFF ID 無效或格式錯誤";
      } else if (errorCode === "UNAUTHORIZED") {
        friendlyMessage = "未授權，請確認 Channel 已發佈";
      } else if (errorCode === "FORBIDDEN") {
        friendlyMessage = "禁止存取，請確認 Endpoint URL 設定正確";
      } else if (errorMessage.includes("Load failed")) {
        friendlyMessage = `Load failed - 請確認 LINE Login Channel 已發佈`;
      }
      
      lastError = new Error(`${friendlyMessage} (${errorCode})`);
      
      // 在生產環境也輸出錯誤以便診斷
      console.error("[LIFF] Init error:", { code: errorCode, message: errorMessage, liffId: usedLiffId });
      
      // 重置 cached 以允許重試
      cached = null;
      return null;
    }
  })();

  return cached;
}

export function getLiffError(): Error | null {
  return lastError;
}

