import type { Card } from "@/lib/types";

export type CreateCardResult = 
  | { success: true; card: Card }
  | { success: false; error: string; currentCount: number };

/** Analytics 統計資料類型 */
export interface CardAnalytics {
  slug: string;
  totalViews: number;
  uniqueVisitors: number;
  actions: Record<string, number>;
  viewsByDate: Array<{ date: string; views: number }>;
  topLocations: Array<{ country: string; city: string; views: number }>;
}

/** Analytics 事件記錄參數 */
export interface AnalyticsEvent {
  cardSlug: string;
  ownerLineUserId?: string;
  actionType: string;
  viewerIp?: string;
  viewerUserAgent?: string;
  viewerCountry?: string;
  viewerCity?: string;
}

export interface CardStore {
  getCard(slug: string): Promise<Card | null>;
  upsertCard(card: Card): Promise<Card>;
  /** 原子操作：建立名片並檢查數量限制 */
  createCardWithLimitCheck?(card: Card, ownerId: string, maxCards: number): Promise<CreateCardResult>;
  /** 記錄瀏覽事件 */
  recordAnalyticsEvent?(event: AnalyticsEvent): Promise<void>;
  /** 獲取名片統計資料 */
  getCardAnalytics?(slug: string, days?: number): Promise<CardAnalytics>;
}

