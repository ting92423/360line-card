/**
 * 管理員點數管理 API
 * GET /api/credits/admin - 取得待確認的儲值請求
 * POST /api/credits/admin - 確認儲值 / 手動加點
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  getPendingTopups, 
  confirmTopup, 
  adminGrantCredits,
  getOrCreateUserCredits
} from "@/lib/credits";

// 簡易管理員驗證（可以之後換成更安全的方式）
function isAdmin(request: NextRequest): boolean {
  // 檢查 admin secret
  const adminSecret = request.headers.get("x-admin-secret");
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (expectedSecret && adminSecret === expectedSecret) {
    return true;
  }
  
  // 開發環境允許
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  
  return false;
}

// GET: 取得待確認的儲值請求
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "未授權" },
      { status: 401 }
    );
  }

  try {
    const pendingTopups = await getPendingTopups();
    
    return NextResponse.json({
      pendingTopups,
      count: pendingTopups.length,
    });

  } catch (error) {
    console.error("Admin get pending error:", error);
    return NextResponse.json(
      { error: "系統錯誤" },
      { status: 500 }
    );
  }
}

// POST: 確認儲值 / 手動加點
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "未授權" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, transactionId, lineUserId, amount, note } = body;

    if (action === "confirm") {
      // 確認儲值
      if (!transactionId) {
        return NextResponse.json(
          { error: "缺少交易 ID" },
          { status: 400 }
        );
      }

      const result = await confirmTopup(transactionId, note);
      return NextResponse.json(result);
    }

    if (action === "grant") {
      // 手動加點
      if (!lineUserId || !amount || amount <= 0) {
        return NextResponse.json(
          { error: "請提供用戶 ID 和加點數量" },
          { status: 400 }
        );
      }

      const result = await adminGrantCredits(lineUserId, amount, note || "管理員手動加點");
      return NextResponse.json(result);
    }

    if (action === "query") {
      // 查詢用戶點數
      if (!lineUserId) {
        return NextResponse.json(
          { error: "請提供用戶 ID" },
          { status: 400 }
        );
      }

      const credits = await getOrCreateUserCredits(lineUserId);
      return NextResponse.json({ credits });
    }

    return NextResponse.json(
      { error: "無效的操作" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "系統錯誤" },
      { status: 500 }
    );
  }
}
