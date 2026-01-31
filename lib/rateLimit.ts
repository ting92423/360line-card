/**
 * 簡單的內存型 Rate Limiter
 * 適用於低流量場景，防止單一 IP/用戶濫用 API
 * 
 * 注意：在 Serverless 環境（如 Vercel）中，每個實例有自己的狀態
 * 如果需要跨實例的 rate limiting，建議使用 Upstash Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 內存存儲（每個 serverless 實例獨立）
const store = new Map<string, RateLimitEntry>();

// 定期清理過期條目（避免內存洩漏）
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 1000; // 每分鐘清理一次

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * 檢查 rate limit
 * @param identifier - 識別碼（通常是 IP 或 userId）
 * @param limit - 時間窗口內允許的最大請求數
 * @param windowMs - 時間窗口（毫秒），預設 60 秒
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60 * 1000
): RateLimitResult {
  cleanup();
  
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);
  
  if (!entry || now > entry.resetTime) {
    // 新條目或已過期
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }
  
  // 現有條目
  entry.count++;
  
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(entry.resetTime / 1000),
    };
  }
  
  return {
    success: true,
    remaining: limit - entry.count,
    reset: Math.ceil(entry.resetTime / 1000),
  };
}

/**
 * 從 Request 獲取客戶端 IP
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for 可能包含多個 IP，取第一個
    return xff.split(",")[0].trim();
  }
  
  const xrip = request.headers.get("x-real-ip");
  if (xrip) return xrip;
  
  // 無法獲取 IP 時使用固定值（不建議在生產環境）
  return "unknown";
}

/**
 * 預設配置
 */
export const RATE_LIMITS = {
  // 驗證相關 API（較嚴格）
  AUTH: { limit: 10, windowMs: 60 * 1000 },
  // 一般讀取 API
  READ: { limit: 60, windowMs: 60 * 1000 },
  // 寫入 API
  WRITE: { limit: 30, windowMs: 60 * 1000 },
  // 事件/分析 API（較寬鬆）
  EVENTS: { limit: 100, windowMs: 60 * 1000 },
} as const;
