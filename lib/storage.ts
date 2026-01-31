import type { Card } from "@/lib/types";
import { getCardStore } from "@/lib/storage/index";
import type { AnalyticsEvent, CardAnalytics } from "@/lib/storage/adapter";

// 導出 getCardStore 供需要原子操作的模組使用
export { getCardStore };

// Back-compat wrapper：其餘程式碼仍可用 getCard/upsertCard
export async function getCard(slug: string): Promise<Card | null> {
  return await getCardStore().getCard(slug);
}

export async function upsertCard(input: Card): Promise<Card> {
  return await getCardStore().upsertCard(input);
}

/**
 * 記錄名片瀏覽/互動事件
 * 僅在 PostgreSQL 模式下有效
 */
export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const store = getCardStore();
  if (store.recordAnalyticsEvent) {
    await store.recordAnalyticsEvent(event);
  } else {
    // JSON Store 模式下只記錄到 console
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${event.cardSlug} - ${event.actionType}`);
    }
  }
}

/**
 * 獲取名片統計資料
 * 僅在 PostgreSQL 模式下返回真實資料
 */
export async function getCardAnalytics(slug: string, days?: number): Promise<CardAnalytics | null> {
  const store = getCardStore();
  if (store.getCardAnalytics) {
    return await store.getCardAnalytics(slug, days);
  }
  // JSON Store 模式下返回 null
  return null;
}

