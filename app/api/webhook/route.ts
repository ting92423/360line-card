/**
 * LINE Bot Webhook
 * 處理來自 LINE 平台的事件（加入好友、訊息等）
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createUser, logUserActivity } from "@/lib/auth/userManager";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "";

/**
 * 驗證 LINE Webhook 簽名
 */
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/**
 * 發送訊息到 LINE
 */
async function replyMessage(replyToken: string, messages: any[]) {
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        replyToken,
        messages
      })
    });

    if (!response.ok) {
      console.error("LINE API Error:", await response.text());
    }
  } catch (error) {
    console.error("Failed to reply message:", error);
  }
}

/**
 * 歡迎訊息 Flex Message
 */
function getWelcomeMessage() {
  return {
    type: "flex",
    altText: "歡迎體驗 360LINE 電子名片！",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: `${APP_ORIGIN}/welcome-banner.jpg`,
        size: "full",
        aspectRatio: "20:13",
        aspectMode: "cover"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "歡迎體驗 360LINE",
            weight: "bold",
            size: "xl",
            color: "#1DB446"
          },
          {
            type: "text",
            text: "電子名片系統",
            size: "lg",
            color: "#666666",
            margin: "md"
          },
          {
            type: "separator",
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "✨ 3分鐘快速體驗",
                size: "sm",
                color: "#333333"
              },
              {
                type: "text",
                text: "🎨 多種精美樣板",
                size: "sm",
                color: "#333333"
              },
              {
                type: "text",
                text: "📊 詳細數據分析",
                size: "sm",
                color: "#333333"
              },
              {
                type: "text",
                text: "🆓 7天免費試用",
                size: "sm",
                color: "#333333",
                weight: "bold"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "🚀 立即體驗",
              uri: `https://liff.line.me/${LIFF_ID}`
            }
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "📖 查看範例",
              uri: `${APP_ORIGIN}/c/demo`
            }
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "💡 完全免費，無需註冊！",
                color: "#999999",
                size: "xs",
                align: "center",
                margin: "md"
              }
            ]
          }
        ],
        flex: 0
      }
    }
  };
}

/**
 * 方案介紹 Flex Message
 */
function getPricingMessage() {
  return {
    type: "flex",
    altText: "360LINE 方案介紹",
    contents: {
      type: "carousel",
      contents: [
        // 體驗版
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🆓 體驗版",
                weight: "bold",
                size: "xl",
                color: "#1DB446"
              },
              {
                type: "text",
                text: "7天免費試用",
                size: "sm",
                color: "#666666",
                margin: "md"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                spacing: "sm",
                contents: [
                  { type: "text", text: "✅ 基本名片功能", size: "sm" },
                  { type: "text", text: "✅ 3種樣板", size: "sm" },
                  { type: "text", text: "✅ 無限分享", size: "sm" },
                  { type: "text", text: "⏰ 7天後只能查看", size: "sm", color: "#999999" }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "立即體驗",
                  uri: `https://liff.line.me/${LIFF_ID}`
                },
                style: "primary"
              }
            ]
          }
        },
        // 專業版
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "💼 專業版",
                weight: "bold",
                size: "xl",
                color: "#FF6B35"
              },
              {
                type: "text",
                text: "NT$199/月",
                size: "xxl",
                weight: "bold",
                color: "#FF6B35",
                margin: "md"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                spacing: "sm",
                contents: [
                  { type: "text", text: "✅ 10+精美樣板", size: "sm" },
                  { type: "text", text: "✅ 詳細統計分析", size: "sm" },
                  { type: "text", text: "✅ 自訂短網址", size: "sm" },
                  { type: "text", text: "✅ 多張名片管理", size: "sm" }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "我要升級",
                  text: "我要升級專業版"
                },
                style: "primary",
                color: "#FF6B35"
              }
            ]
          }
        },
        // 企業版
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "🏢 企業版",
                weight: "bold",
                size: "xl",
                color: "#4A5AFF"
              },
              {
                type: "text",
                text: "NT$99/人/月",
                size: "xl",
                weight: "bold",
                color: "#4A5AFF",
                margin: "md"
              },
              {
                type: "text",
                text: "最少5人",
                size: "xs",
                color: "#999999"
              },
              {
                type: "separator",
                margin: "lg"
              },
              {
                type: "box",
                layout: "vertical",
                margin: "lg",
                spacing: "sm",
                contents: [
                  { type: "text", text: "✅ 品牌客製化", size: "sm" },
                  { type: "text", text: "✅ CRM 整合", size: "sm" },
                  { type: "text", text: "✅ 數據儀表板", size: "sm" },
                  { type: "text", text: "✅ 專屬客服", size: "sm" }
                ]
              }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "聯繫業務",
                  text: "我想了解企業版方案"
                },
                style: "primary",
                color: "#4A5AFF"
              }
            ]
          }
        }
      ]
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Received request");
    // 驗證簽名
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    console.log("[Webhook] Signature:", signature);
    console.log("[Webhook] Body length:", body.length);

    if (!signature || !verifySignature(body, signature)) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    console.log("[Webhook] Events count:", data.events?.length);

    // 處理每個事件
    for (const event of data.events) {
      console.log("[Webhook] Processing event:", event.type);

      // 用戶加入好友
      if (event.type === "follow") {
        const userId = event.source.userId;
        
        // 建立新用戶（開始7天試用）
        try {
          await createUser(userId, "LINE用戶");
          await logUserActivity(userId, "follow", { source: "official_account" });
        } catch (error) {
          console.error("Failed to create user:", error);
        }

        // 回覆歡迎訊息
        await replyMessage(event.replyToken, [getWelcomeMessage()]);
      }

      // 用戶封鎖
      if (event.type === "unfollow") {
        const userId = event.source.userId;
        await logUserActivity(userId, "unfollow");
      }

      // 用戶傳送訊息
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.toLowerCase();
        const userId = event.source.userId;

        await logUserActivity(userId, "message", { text });

        // 關鍵字回覆
        if (text.includes("體驗") || text.includes("開始")) {
          await replyMessage(event.replyToken, [getWelcomeMessage()]);
        } 
        else if (text.includes("價格") || text.includes("方案") || text.includes("收費")) {
          await replyMessage(event.replyToken, [getPricingMessage()]);
        }
        else if (text.includes("升級") || text.includes("付費")) {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "感謝您的支持！\n\n請點擊下方連結前往升級頁面：",
            },
            {
              type: "text",
              text: `${APP_ORIGIN}/upgrade`,
              emojis: [{ index: 0, productId: "5ac1bfd5040ab15980c9b435", emojiId: "001" }]
            }
          ]);
        }
        else if (text.includes("客服") || text.includes("幫助") || text.includes("問題")) {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "很高興為您服務！\n\n您可以：\n📧 Email: support@360line.com\n💬 或直接在這裡留言，我們會盡快回覆"
            }
          ]);
        }
        else {
          // 預設回覆
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "您可以輸入以下關鍵字：\n\n🚀 體驗 - 開始使用\n💰 價格 - 查看方案\n📞 客服 - 聯繫我們"
            }
          ]);
        }
      }

      // Postback 事件（按鈕點擊）
      if (event.type === "postback") {
        const userId = event.source.userId;
        await logUserActivity(userId, "postback", { data: event.postback.data });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// 健康檢查
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    service: "360LINE Webhook",
    timestamp: new Date().toISOString()
  });
}
