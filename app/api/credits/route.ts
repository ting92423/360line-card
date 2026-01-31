/**
 * 點數 API
 * GET /api/credits - 取得用戶點數餘額
 * POST /api/credits - 建立儲值請求
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  getOrCreateUserCredits, 
  getUserTransactions,
  createTopupRequest,
  CREDITS_CONFIG
} from "@/lib/credits";
import { getLineSession } from "@/lib/auth/session";

// GET: 取得用戶點數資訊
export async function GET(request: NextRequest) {
  try {
    // 驗證 Session
    const session = await getLineSession();
    if (!session) {
      return NextResponse.json(
        { error: "請先登入" },
        { status: 401 }
      );
    }

    // 使用 session 中的 userId（而非請求參數）
    const lineUserId = session.sub;

    const credits = await getOrCreateUserCredits(lineUserId);
    const transactions = await getUserTransactions(lineUserId, 10);

    return NextResponse.json({
      balance: credits.balance,
      totalEarned: credits.totalEarned,
      totalSpent: credits.totalSpent,
      recentTransactions: transactions,
      topupPlans: CREDITS_CONFIG.TOPUP_PLANS,
      bankInfo: CREDITS_CONFIG.BANK_INFO,
    });

  } catch (error) {
    console.error("Get credits error:", error);
    return NextResponse.json(
      { error: "系統錯誤" },
      { status: 500 }
    );
  }
}

// POST: 建立儲值請求
export async function POST(request: NextRequest) {
  try {
    // 驗證 Session
    const session = await getLineSession();
    if (!session) {
      return NextResponse.json(
        { error: "請先登入" },
        { status: 401 }
      );
    }

    // 使用 session 中的 userId
    const lineUserId = session.sub;

    const body = await request.json();
    const { planIndex, transferLast5, displayName } = body;

    if (planIndex === undefined || planIndex < 0 || planIndex >= CREDITS_CONFIG.TOPUP_PLANS.length) {
      return NextResponse.json(
        { error: "請選擇有效的儲值方案" },
        { status: 400 }
      );
    }

    if (!transferLast5 || transferLast5.length !== 5) {
      return NextResponse.json(
        { error: "請輸入轉帳帳號末 5 碼" },
        { status: 400 }
      );
    }

    // 建立儲值請求
    const transaction = await createTopupRequest(lineUserId, planIndex, transferLast5);
    const plan = CREDITS_CONFIG.TOPUP_PLANS[planIndex];

    // 通知管理員（透過 LINE Messaging API）
    await notifyAdmin({
      type: 'topup_request',
      lineUserId,
      displayName: displayName || lineUserId,
      plan: plan.label,
      amount: plan.price,
      transferLast5,
      transactionId: transaction.id,
    });

    return NextResponse.json({
      success: true,
      message: "儲值請求已送出，請等待管理員確認",
      transactionId: transaction.id,
      plan: plan.label,
      amount: plan.price,
    });

  } catch (error) {
    console.error("Topup request error:", error);
    return NextResponse.json(
      { error: "系統錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}

// 通知管理員函數（使用 LINE Messaging API）
async function notifyAdmin(data: {
  type: string;
  lineUserId: string;
  displayName: string;
  plan: string;
  amount: number;
  transferLast5: string;
  transactionId: string;
}) {
  // 使用 LINE Messaging API 發送通知給管理員
  const adminLineUserId = process.env.ADMIN_LINE_USER_ID;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (adminLineUserId && channelAccessToken) {
    try {
      const message = {
        type: "flex",
        altText: `🔔 新的儲值請求 - ${data.displayName}`,
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🔔 新的儲值請求",
                weight: "bold",
                size: "lg",
                color: "#FF6B35"
              }
            ],
            backgroundColor: "#FFF8F0",
            paddingAll: "15px"
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "用戶", size: "sm", color: "#666666", flex: 2 },
                  { type: "text", text: data.displayName, size: "sm", color: "#333333", flex: 5, wrap: true }
                ],
                margin: "md"
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "方案", size: "sm", color: "#666666", flex: 2 },
                  { type: "text", text: data.plan, size: "sm", color: "#333333", flex: 5 }
                ],
                margin: "md"
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "金額", size: "sm", color: "#666666", flex: 2 },
                  { type: "text", text: `NT$${data.amount}`, size: "sm", color: "#FF6B35", weight: "bold", flex: 5 }
                ],
                margin: "md"
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "帳號末5碼", size: "sm", color: "#666666", flex: 2 },
                  { type: "text", text: data.transferLast5, size: "sm", color: "#333333", weight: "bold", flex: 5 }
                ],
                margin: "md"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "text",
                text: `交易ID: ${data.transactionId}`,
                size: "xs",
                color: "#999999",
                margin: "lg"
              }
            ],
            paddingAll: "15px"
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "前往管理後台確認",
                  uri: `${process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://line360-card.vercel.app'}/admin/credits`
                },
                style: "primary",
                color: "#FF6B35"
              }
            ],
            paddingAll: "15px"
          }
        }
      };

      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${channelAccessToken}`,
        },
        body: JSON.stringify({
          to: adminLineUserId,
          messages: [message]
        }),
      });
      
      console.log("[Credits] 已發送 LINE 通知給管理員");
    } catch (error) {
      console.error("[Credits] LINE Messaging API error:", error);
    }
  }

  // 記錄到 console（作為備份）
  console.log("=== 新的儲值請求 ===");
  console.log(`用戶：${data.displayName} (${data.lineUserId})`);
  console.log(`方案：${data.plan}`);
  console.log(`金額：NT$${data.amount}`);
  console.log(`帳號末5碼：${data.transferLast5}`);
  console.log(`交易ID：${data.transactionId}`);
  console.log("==================");
}
