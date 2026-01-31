/**
 * API: 名片瀏覽統計
 * POST /api/analytics - 記錄瀏覽事件（公開，用於記錄訪客行為）
 * GET /api/analytics?slug=xxx - 取得統計資料（需驗證為名片擁有者）
 */

import { NextRequest, NextResponse } from "next/server";
import { getCard, recordAnalyticsEvent, getCardAnalytics } from "@/lib/storage";
import { verifyLineIdToken } from "@/lib/auth/lineVerify";
import { z } from "zod";

// Zod Schema 驗證
const AnalyticsPostSchema = z.object({
  cardSlug: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  actionType: z.enum(['view', 'click_phone', 'click_email', 'click_website', 'download_vcard', 'add_friend', 'share']).default('view'),
});

// 記錄瀏覽事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Zod 驗證
    const validated = AnalyticsPostSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: validated.error.issues },
        { status: 400 }
      );
    }

    const { cardSlug, actionType } = validated.data;

    // 取得訪客資訊
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 取得名片擁有者資訊（可選，用於統計）
    const card = await getCard(cardSlug);
    const ownerLineUserId = card?.ownerLineUserId;

    // 記錄到資料庫
    await recordAnalyticsEvent({
      cardSlug,
      ownerLineUserId,
      actionType,
      viewerIp: ip !== "unknown" ? ip : undefined,
      viewerUserAgent: userAgent !== "unknown" ? userAgent : undefined,
      // 地區資訊需要透過 IP 地理位置服務取得（暫不實作）
      viewerCountry: undefined,
      viewerCity: undefined,
    });

    // 開發環境額外記錄到 console
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${cardSlug} - ${actionType} from ${ip}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API /api/analytics POST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 取得統計資料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const days = parseInt(searchParams.get("days") || "30", 10);

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    // Slug 格式驗證
    if (!/^[a-zA-Z0-9_-]+$/.test(slug) || slug.length > 100) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // 驗證用戶權限（需要是名片擁有者）
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 驗證 LINE ID Token
    const idToken = authHeader.substring(7);
    let lineUserId: string;
    
    try {
      const payload = await verifyLineIdToken(idToken);
      lineUserId = payload.sub;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // 確認用戶是名片擁有者
    const card = await getCard(slug);
    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    if (card.ownerLineUserId !== lineUserId) {
      return NextResponse.json(
        { error: "Forbidden: You are not the owner of this card" },
        { status: 403 }
      );
    }

    // 從資料庫查詢統計資料
    const analytics = await getCardAnalytics(slug, days);
    
    if (analytics) {
      // PostgreSQL 模式：返回真實資料
      return NextResponse.json(analytics);
    }

    // JSON Store 模式：返回空資料提示
    return NextResponse.json({
      slug,
      totalViews: 0,
      uniqueVisitors: 0,
      actions: {},
      viewsByDate: [],
      topLocations: [],
      message: "Analytics requires PostgreSQL database. Set DATABASE_URL to enable."
    });

  } catch (error) {
    console.error("[API /api/analytics GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
