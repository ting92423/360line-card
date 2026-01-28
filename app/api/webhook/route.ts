/**
 * LINE Bot Webhook
 * 處理來自 LINE 平台的事件（加入好友、訊息等）
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createUser, logUserActivity } from "@/lib/auth/userManager";

/**
 * 驗證 LINE Webhook 簽名
 */
function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/**
 * 發送訊息到 LINE
 */
async function replyMessage(replyToken: string, messages: any[], token: string) {
  if (!token) {
    console.error("Missing LINE_CHANNEL_ACCESS_TOKEN");
    return;
  }
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        replyToken,
        messages
      })
    });

    if (!response.ok) {
      console.error("LINE API Error:", await response.text());
    } else {
      console.log("[Webhook] Reply success");
    }
  } catch (error) {
    console.error("Failed to reply message:", error);
  }
}

/**
 * 歡迎訊息 Flex Message
 */
function getWelcomeMessage(appOrigin: string, liffId: string) {
  return {
    type: "flex",
    altText: "歡迎體驗 360LINE 電子名片！",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: `${appOrigin}/avatar-placeholder.svg`, // 改用現有的檔案
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
              { type: "text", text: "✨ 3分鐘快速體驗", size: "sm" },
              { type: "text", text: "🎨 多種精美樣板", size: "sm" },
              { type: "text", text: "📊 詳細數據分析", size: "sm" },
              { type: "text", text: "🆓 7天免費試用", size: "sm", weight: "bold" }
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
              uri: `https://liff.line.me/${liffId}`
            }
          }
        ]
      }
    }
  };
}

/**
 * 方案介紹 Flex Message
 */
function getPricingMessage(liffId: string) {
  return {
    type: "flex",
    altText: "360LINE 方案介紹",
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "🆓 體驗版", weight: "bold", size: "xl", color: "#1DB446" },
              { type: "text", text: "7天免費試用", size: "sm", margin: "md" }
            ]
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: { type: "uri", label: "立即體驗", uri: `https://liff.line.me/${liffId}` },
                style: "primary"
              }
            ]
          }
        }
      ]
    }
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.LINE_CHANNEL_SECRET || "";
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || "";

  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    console.log("[Webhook] Received request. Body length:", body.length);

    if (!verifySignature(body, signature, secret)) {
      console.error("[Webhook] Invalid signature. Check LINE_CHANNEL_SECRET.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    for (const event of data.events) {
      console.log("[Webhook] Event:", event.type);

      if (event.type === "follow") {
        await replyMessage(event.replyToken, [getWelcomeMessage(origin, liffId)], token);
      } else if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text;
        if (text.includes("體驗") || text.includes("開始")) {
          await replyMessage(event.replyToken, [getWelcomeMessage(origin, liffId)], token);
        } else if (text.includes("價格") || text.includes("方案")) {
          await replyMessage(event.replyToken, [getPricingMessage(liffId)], token);
        } else {
          await replyMessage(event.replyToken, [{ type: "text", text: "您好！輸入「體驗」開始建立名片，或「價格」查看方案。" }], token);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
