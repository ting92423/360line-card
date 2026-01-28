"use client";

import type { Liff } from "@line/liff";

let cached: Promise<Liff | null> | null = null;

export async function getLiff(): Promise<Liff | null> {
  if (typeof window === "undefined") return null;
  if (cached) return cached;

  cached = (async () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) return null;

    const liffModule = await import("@line/liff");
    const liff = liffModule.default;

    await liff.init({
      liffId
      // 是否跳出「加入好友」勾選框：這要在 LINE Developers 後台設定（bot_prompt = normal）
    });
    return liff;
  })();

  return cached;
}

