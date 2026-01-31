/**
 * Next.js Middleware
 * 應用 Rate Limiting 到 API 路由
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 簡單的內存型 rate limiter（middleware 版本）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } | null {
  // 根據路徑返回不同的限制
  if (pathname.startsWith("/api/auth/")) {
    return { limit: 10, windowMs: 60 * 1000 }; // 驗證 API: 10 次/分鐘
  }
  if (pathname.startsWith("/api/webhook")) {
    return null; // Webhook 不限制（由 LINE 伺服器發送）
  }
  if (pathname.startsWith("/api/analytics") || pathname.startsWith("/api/events")) {
    return { limit: 100, windowMs: 60 * 1000 }; // 事件 API: 100 次/分鐘
  }
  if (pathname.startsWith("/api/")) {
    return { limit: 60, windowMs: 60 * 1000 }; // 其他 API: 60 次/分鐘
  }
  return null;
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xrip = request.headers.get("x-real-ip");
  if (xrip) return xrip;
  return "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 只處理 API 路由
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  const config = getRateLimitConfig(pathname);
  if (!config) {
    return NextResponse.next();
  }
  
  const clientIp = getClientIp(request);
  const key = `${clientIp}:${pathname.split("/").slice(0, 3).join("/")}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // 新條目或已過期
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", config.limit.toString());
    response.headers.set("X-RateLimit-Remaining", (config.limit - 1).toString());
    response.headers.set("X-RateLimit-Reset", Math.ceil((now + config.windowMs) / 1000).toString());
    return response;
  }
  
  entry.count++;
  
  if (entry.count > config.limit) {
    // 超過限制
    const response = NextResponse.json(
      { error: "rate_limit_exceeded", message: "請求過於頻繁，請稍後再試" },
      { status: 429 }
    );
    response.headers.set("X-RateLimit-Limit", config.limit.toString());
    response.headers.set("X-RateLimit-Remaining", "0");
    response.headers.set("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000).toString());
    response.headers.set("Retry-After", Math.ceil((entry.resetTime - now) / 1000).toString());
    return response;
  }
  
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", config.limit.toString());
  response.headers.set("X-RateLimit-Remaining", (config.limit - entry.count).toString());
  response.headers.set("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000).toString());
  return response;
}

// 只匹配 API 路由
export const config = {
  matcher: "/api/:path*",
};
