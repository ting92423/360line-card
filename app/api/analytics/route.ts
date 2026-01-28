/**
 * API: 名片瀏覽統計
 * POST /api/analytics - 記錄瀏覽事件
 * GET /api/analytics?slug=xxx - 取得統計資料
 */

import { NextRequest, NextResponse } from "next/server";
import { getCardStore } from "@/lib/storage/index";

// 記錄瀏覽事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardSlug, actionType = 'view' } = body;

    if (!cardSlug) {
      return NextResponse.json(
        { error: "Missing cardSlug" },
        { status: 400 }
      );
    }

    // 取得訪客資訊
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 記錄到資料庫
    const store = getCardStore();
    
    // 如果使用 PostgreSQL
    if (store.constructor.name === 'PostgresCardStore') {
      // TODO: 記錄到 card_views 表
      console.log(`[Analytics] Card: ${cardSlug}, Action: ${actionType}, IP: ${ip}`);
    }

    // 暫時記錄到 console（之後會存入資料庫）
    console.log(`[View] ${cardSlug} - ${actionType} from ${ip}`);

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

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
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

    // TODO: 從資料庫查詢統計資料
    const mockStats = {
      slug,
      totalViews: 42,
      uniqueVisitors: 28,
      actions: {
        view: 42,
        click_phone: 8,
        click_email: 5,
        click_website: 12,
        download_vcard: 3,
        add_friend: 2,
        share: 1
      },
      viewsByDate: [
        { date: "2026-01-20", views: 5 },
        { date: "2026-01-21", views: 8 },
        { date: "2026-01-22", views: 12 },
        { date: "2026-01-23", views: 10 },
        { date: "2026-01-24", views: 7 }
      ],
      topLocations: [
        { country: "TW", city: "Taipei", views: 25 },
        { country: "TW", city: "Taichung", views: 10 },
        { country: "TW", city: "Kaohsiung", views: 7 }
      ]
    };

    return NextResponse.json(mockStats);

  } catch (error) {
    console.error("[API /api/analytics GET] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
