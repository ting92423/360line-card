/**
 * LINE Bot Webhook
 * 處理來自 LINE 平台的事件（加入好友、訊息等）
 * 
 * 兩種模式：
 * 1. 模板選擇器 - 簡單預覽，選擇後進入編輯器
 * 2. 完整名片展示 - 直接顯示完整 Flex Message 名片（參考 linenamecard.com）
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isProduction, isWebhookConfigured } from "@/lib/env";

// 安全的日誌函數：生產環境不輸出敏感資訊
function log(message: string, ...args: unknown[]) {
  if (!isProduction()) {
    console.log(`[Webhook] ${message}`, ...args);
  }
}

function logError(message: string, error?: unknown) {
  // 錯誤日誌在所有環境都輸出，但不包含敏感細節
  const safeError = error instanceof Error ? error.message : "Unknown error";
  console.error(`[Webhook] ${message}`, isProduction() ? "" : safeError);
}

/**
 * 驗證 LINE Webhook 簽名
 * 使用 timingSafeEqual 防止時序攻擊
 * 
 * LINE 簽名驗證流程：
 * 1. 使用 channel secret 對 request body 進行 HMAC-SHA256 計算
 * 2. 將結果轉為 base64
 * 3. 與 X-Line-Signature header 比較
 */
function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  
  // 確保兩個字串長度相同後再進行時序安全比較
  // 使用 Buffer.from 將 base64 字串轉為 Buffer 進行比較
  try {
    const hashBuffer = Buffer.from(hash, "base64");
    const signatureBuffer = Buffer.from(signature, "base64");
    
    // 長度不同直接返回 false
    if (hashBuffer.length !== signatureBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
  } catch {
    return false;
  }
}

/**
 * 發送訊息到 LINE
 */
async function replyMessage(replyToken: string, messages: any[], token: string) {
  if (!token) {
    logError("Missing LINE_CHANNEL_ACCESS_TOKEN");
    return;
  }
  try {
    const response = await fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logError("LINE API reply failed", new Error(`Status: ${response.status}, Body: ${errorText}`));
    } else {
      log("Reply sent successfully");
    }
  } catch (error) {
    logError("Failed to reply message", error);
  }
}

/**
 * ============================================================
 * 模式1: 模板選擇器 - 簡單預覽圖，選擇後進入編輯器
 * ============================================================
 */
const TEMPLATE_PREVIEWS = [
  {
    id: "insurance",
    name: "保險金融",
    ctaColor: "#3B82F6",
    accentColor: "#60A5FA",
  },
  {
    id: "commerce",
    name: "商務批發",
    ctaColor: "#14B8A6",
    accentColor: "#F97316",
  },
  {
    id: "lecturer",
    name: "講師顧問",
    ctaColor: "#0EA5E9",
    accentColor: "#06B6D4",
  },
  {
    id: "fortune",
    name: "命理風水",
    ctaColor: "#DC2626",
    accentColor: "#FBBF24",
  },
  {
    id: "business",
    name: "企業商務",
    ctaColor: "#0891B2",
    accentColor: "#06B6D4",
  },
  {
    id: "beauty",
    name: "美業時尚",
    ctaColor: "#DB2777",
    accentColor: "#EC4899",
  },
];

/**
 * 生成模板預覽 Bubble - 簡化版（模式1）
 * 使用靜態圖片 + 底部按鈕，讓用戶選擇後進入編輯器
 */
function createTemplatePreviewBubble(
  template: typeof TEMPLATE_PREVIEWS[0],
  liffId: string,
  appOrigin: string
) {
  const editorUrl = `https://liff.line.me/${liffId}?template=${template.id}`;
  // 使用靜態預覽圖片
  const previewUrl = `${appOrigin}/templates/${template.id}.jpg`;

  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: previewUrl,
      size: "full",
      aspectRatio: "3:4",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: template.name,
          weight: "bold",
          size: "md",
          align: "center",
        },
      ],
      paddingAll: "10px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "選用此模板",
            uri: editorUrl,
          },
          style: "primary",
          color: template.ctaColor,
          height: "sm",
        },
      ],
      paddingAll: "10px",
    },
  };
}

/**
 * ============================================================
 * 模式2: 完整名片展示 - 直接顯示完整 Flex Message 名片
 * 參考 linenamecard.com 及競品設計風格
 * ============================================================
 */

// 示範用的人像圖片 URL
const DEMO_PHOTOS = {
  professional: "https://xleadfunnel.oss-cn-hongkong.aliyuncs.com/LINE/NameCard/template/people_photo.jpg",
  food: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
  fitness: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
  beauty: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
};

// 社交媒體圖示 URL（使用 SVG icons）
const SOCIAL_ICONS = {
  facebook: "https://cdn-icons-png.flaticon.com/128/733/733547.png",
  instagram: "https://cdn-icons-png.flaticon.com/128/2111/2111463.png",
  youtube: "https://cdn-icons-png.flaticon.com/128/1384/1384060.png",
  tiktok: "https://cdn-icons-png.flaticon.com/128/3046/3046121.png",
  line: "https://cdn-icons-png.flaticon.com/128/2111/2111370.png",
  website: "https://cdn-icons-png.flaticon.com/128/1006/1006771.png",
};

// 六款精美名片模板設計（參考競品設計風格）
const FULL_CARD_TEMPLATES = [
  {
    id: "style1",
    name: "營養師",
    tagline: "Registered Dietitian",
    description: "Health Educator",
    primaryColor: "#F5B7B1",
    secondaryColor: "#FADBD8",
    bgColor: "#FEF9E7",
    textColor: "#2C3E50",
  },
  {
    id: "style2",
    name: "美食料理",
    tagline: "Cook like your mum",
    description: "私房料理分享",
    primaryColor: "#82E0AA",
    secondaryColor: "#ABEBC6",
    bgColor: "#1E8449",
    textColor: "#FFFFFF",
  },
  {
    id: "style3",
    name: "健康餐盒",
    tagline: "Delivery of healthy food",
    description: "Healthy food delivered to you",
    primaryColor: "#C4FF61",
    secondaryColor: "#EAEDED",
    bgColor: "#FDFEFE",
    textColor: "#2C3E50",
  },
  {
    id: "style4",
    name: "漸層時尚",
    tagline: "Crafting confidence",
    description: "one cut at a time",
    primaryColor: "#FFFFFF",
    secondaryColor: "#F8F9F9",
    bgColor: "gradient",
    textColor: "#FFFFFF",
  },
  {
    id: "style5",
    name: "商務專業",
    tagline: "網頁設計 / 網路行銷",
    description: "擁有自己的專屬網站其實沒那麼難！",
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    bgColor: "#F4B942",
    textColor: "#2C3E50",
  },
  {
    id: "style6",
    name: "美業時尚",
    tagline: "Beauty & Style",
    description: "讓美麗成為您的日常",
    primaryColor: "#DB2777",
    secondaryColor: "#EC4899",
    bgColor: "#FDF2F8",
    textColor: "#831843",
  },
];

/**
 * 創建完整名片 Bubble - 風格1: 營養師風格（淡黃背景 + 圓形頭像 + 粉色按鈕）
 * 參考競品：Willow Bennett 設計
 */
function createFullCardStyle1(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  // 編輯器 URL 帶上風格參數
  const editorUrl = `https://liff.line.me/${liffId}?style=style1`;
  
  return {
    type: "bubble",
    styles: {
      body: { backgroundColor: "#FEF9E7" },
      footer: { backgroundColor: "#FEF9E7" },
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // 頂部裝飾線
        {
          type: "box",
          layout: "vertical",
          contents: [],
          backgroundColor: "#F5B7B1",
          height: "8px",
          cornerRadius: "4px",
        },
        // 圓形頭像
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "image", url: DEMO_PHOTOS.professional, size: "full", aspectMode: "cover" },
              ],
              width: "100px",
              height: "100px",
              cornerRadius: "100px",
            },
          ],
          justifyContent: "center",
          margin: "lg",
        },
        // 姓名
        { type: "text", text: "Willow Bennett", weight: "bold", size: "xl", align: "center", margin: "md" },
        // 職稱
        { type: "text", text: "Registered Dietitian", size: "sm", color: "#888888", align: "center" },
        { type: "text", text: "+Nutritionist 🥗", size: "sm", color: "#888888", align: "center" },
        // 標語
        { type: "text", text: "· Health Educator ·", size: "xs", color: "#AAAAAA", align: "center", margin: "sm" },
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.facebook, "https://facebook.com"),
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.youtube, "https://youtube.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "lg",
        },
      ],
      paddingAll: "20px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        createStyledButton("Contact", "#F5B7B1", "#2C3E50", "https://line.me"),
        createStyledButton("Mission", "#FADBD8", "#2C3E50", "https://example.com"),
        createStyledButton("Group workshops", "#F5B7B1", "#2C3E50", "https://example.com"),
        createStyledButton("建立我的名片", "#E74C3C", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
    },
  };
}

/**
 * 創建完整名片 Bubble - 風格2: 美食料理風格（綠色背景 + 破位頭像）
 * 參考競品：Phoenix Wea 設計
 */
function createFullCardStyle2(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  const editorUrl = `https://liff.line.me/${liffId}?style=style2`;
  
  return {
    type: "bubble",
    styles: {
      body: { backgroundColor: "#1E8449" },
      footer: { backgroundColor: "#1E8449" },
    },
    hero: {
      type: "box",
      layout: "vertical",
      contents: [
        // 頂部滿版圖片
        { type: "image", url: DEMO_PHOTOS.food, size: "full", aspectRatio: "20:9", aspectMode: "cover" },
        // 破位圓形頭像
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "image", url: DEMO_PHOTOS.professional, size: "full", aspectMode: "cover" },
              ],
              width: "70px",
              height: "70px",
              cornerRadius: "70px",
              borderWidth: "3px",
              borderColor: "#1E8449",
            },
          ],
          position: "absolute",
          offsetBottom: "-35px",
          justifyContent: "center",
          width: "100%",
        },
      ],
      position: "relative",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "filler", flex: 0 },
        // 姓名
        { type: "text", text: "Phoenix Wea", weight: "bold", size: "xl", align: "center", color: "#FFFFFF", margin: "xl" },
        // 標語
        { type: "text", text: "Cook like your mum 👨‍🍳", size: "md", color: "#E8F8F5", align: "center", margin: "sm" },
      ],
      paddingTop: "40px",
      paddingBottom: "10px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        createStyledButton("Get Chicken Pot Pie", "#ABEBC6", "#1E8449", "https://example.com"),
        createStyledButton("Spaghetti Carbonara", "#ABEBC6", "#1E8449", "https://example.com"),
        createStyledButton("All Recipes", "#ABEBC6", "#1E8449", "https://example.com"),
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.facebook, "https://facebook.com"),
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.tiktok, "https://tiktok.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "lg",
        },
        createStyledButton("建立我的名片", "#27AE60", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
    },
  };
}

/**
 * 創建完整名片 Bubble - 風格3: 健康餐盒風格（白底 + 頂部滿版圖 + 圖文按鈕）
 * 參考競品：Felix Smith 設計
 */
function createFullCardStyle3(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  const editorUrl = `https://liff.line.me/${liffId}?style=style3`;
  
  return {
    type: "bubble",
    hero: {
      type: "image",
      url: DEMO_PHOTOS.fitness,
      size: "full",
      aspectRatio: "20:9",
      aspectMode: "cover",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // 姓名
        { type: "text", text: "Felix Smith", weight: "bold", size: "xl", align: "center" },
        // 職稱
        { type: "text", text: "Delivery of healthy food", size: "sm", color: "#888888", align: "center", margin: "sm" },
        // 描述
        { type: "text", text: "Healthy food delivered to you. Eat well, effortlessly.", size: "xs", color: "#AAAAAA", align: "center", wrap: true, margin: "sm" },
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.facebook, "https://facebook.com"),
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.website, "https://example.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "lg",
        },
      ],
      paddingAll: "15px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        // 圖文按鈕區
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createImageButton(DEMO_PHOTOS.food, "Weekly menu", "https://example.com"),
            createImageButton(DEMO_PHOTOS.food, "Order", "https://example.com"),
          ],
          spacing: "sm",
        },
        createStyledButton("Our Website", "#C4FF61", "#2C3E50", "https://example.com"),
        createStyledButton("建立我的名片", "#2ECC71", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
    },
  };
}

/**
 * 創建完整名片 Bubble - 風格4: 漸層時尚風格（藍粉漸層背景）
 * 參考競品：Elio Santos 設計
 */
function createFullCardStyle4(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  const editorUrl = `https://liff.line.me/${liffId}?style=style4`;
  
  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // 圓形頭像
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "image", url: DEMO_PHOTOS.beauty, size: "full", aspectMode: "cover" },
              ],
              width: "90px",
              height: "90px",
              cornerRadius: "90px",
              borderWidth: "3px",
              borderColor: "#5DADE2",
            },
          ],
          justifyContent: "center",
          margin: "md",
        },
        // 姓名
        { type: "text", text: "Elio Santos 🇦🇷", weight: "bold", size: "xl", align: "center", color: "#FFFFFF", margin: "md" },
        // 標語
        { type: "text", text: "Crafting confidence, one cut", size: "sm", color: "#E8F8F5", align: "center" },
        { type: "text", text: "at a time", size: "sm", color: "#E8F8F5", align: "center" },
      ],
      paddingAll: "20px",
      background: {
        type: "linearGradient",
        angle: "180deg",
        startColor: "#5DADE2",
        centerColor: "#AF7AC5",
        endColor: "#F1948A",
      },
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        createStyledButton("Book", "#FFFFFF", "#5DADE2", "https://example.com"),
        createStyledButton("Gallery", "#FFFFFF", "#AF7AC5", "https://example.com"),
        createStyledButton("Pricing", "#FFFFFF", "#F1948A", "https://example.com"),
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.facebook, "https://facebook.com"),
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.tiktok, "https://tiktok.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "md",
        },
        createStyledButton("建立我的名片", "#9B59B6", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
      background: {
        type: "linearGradient",
        angle: "180deg",
        startColor: "#F1948A",
        endColor: "#F5B7B1",
      },
    },
  };
}

/**
 * 創建完整名片 Bubble - 風格5: 商務專業風格（黃色背景 + Logo）
 * 參考競品：KS Digital 設計
 */
function createFullCardStyle5(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  const editorUrl = `https://liff.line.me/${liffId}?style=style5`;
  
  return {
    type: "bubble",
    styles: {
      body: { backgroundColor: "#F4B942" },
      footer: { backgroundColor: "#F4B942" },
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Logo 圓形區塊
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "text", text: "K|S", size: "xl", weight: "bold", align: "center", color: "#2C3E50" },
              ],
              width: "80px",
              height: "80px",
              cornerRadius: "80px",
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
            },
          ],
          justifyContent: "center",
        },
        // 公司名
        { type: "text", text: "KS Digital", weight: "bold", size: "xl", align: "center", margin: "lg" },
        // 服務項目
        { type: "text", text: "網頁設計 / 網路行銷", size: "md", weight: "bold", align: "center", margin: "sm" },
        // 描述
        { type: "text", text: "擁有自己的專屬網站其實沒那麼難！讓您的網站在茫茫大海中快速被搜尋！", size: "sm", color: "#5D4E37", align: "center", wrap: true, margin: "md" },
      ],
      paddingAll: "20px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        createStyledButton("一頁式網頁 x Line 電子名片", "#2C3E50", "#FFFFFF", "https://example.com"),
        createStyledButton("網頁設計", "#2C3E50", "#FFFFFF", "https://example.com"),
        createStyledButton("網路行銷", "#2C3E50", "#FFFFFF", "https://example.com"),
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.facebook, "https://facebook.com"),
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.tiktok, "https://tiktok.com"),
            createSocialIcon(SOCIAL_ICONS.youtube, "https://youtube.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "lg",
        },
        createStyledButton("建立我的名片", "#E67E22", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
    },
  };
}

/**
 * 創建完整名片 Bubble - 風格6: 美業時尚風格（粉色系）
 */
function createFullCardStyle6(template: typeof FULL_CARD_TEMPLATES[0], liffId: string) {
  const editorUrl = `https://liff.line.me/${liffId}?style=style6`;
  
  return {
    type: "bubble",
    styles: {
      body: { backgroundColor: "#FDF2F8" },
      footer: { backgroundColor: "#FDF2F8" },
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // 圓形頭像
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "image", url: DEMO_PHOTOS.beauty, size: "full", aspectMode: "cover" },
              ],
              width: "100px",
              height: "100px",
              cornerRadius: "100px",
              borderWidth: "4px",
              borderColor: "#F9A8D4",
            },
          ],
          justifyContent: "center",
        },
        // 姓名
        { type: "text", text: "Sophie Chen", weight: "bold", size: "xl", align: "center", color: "#831843", margin: "md" },
        // 職稱
        { type: "text", text: "Beauty & Style Consultant", size: "sm", color: "#9D174D", align: "center" },
        // 描述
        { type: "text", text: "讓美麗成為您的日常 ✨", size: "sm", color: "#BE185D", align: "center", margin: "sm" },
        // 社交媒體圖示
        {
          type: "box",
          layout: "horizontal",
          contents: [
            createSocialIcon(SOCIAL_ICONS.instagram, "https://instagram.com"),
            createSocialIcon(SOCIAL_ICONS.tiktok, "https://tiktok.com"),
            createSocialIcon(SOCIAL_ICONS.youtube, "https://youtube.com"),
          ],
          justifyContent: "center",
          spacing: "lg",
          margin: "lg",
        },
      ],
      paddingAll: "20px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        createStyledButton("預約諮詢", "#EC4899", "#FFFFFF", "https://line.me"),
        createStyledButton("作品集", "#F9A8D4", "#831843", "https://example.com"),
        createStyledButton("課程資訊", "#FBCFE8", "#9D174D", "https://example.com"),
        createStyledButton("建立我的名片", "#DB2777", "#FFFFFF", editorUrl),
      ],
      spacing: "sm",
      paddingAll: "15px",
    },
  };
}

/**
 * 輔助函數：創建社交媒體圖示
 */
function createSocialIcon(iconUrl: string, linkUri: string) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      { type: "image", url: iconUrl, size: "24px", aspectMode: "fit" },
    ],
    width: "32px",
    height: "32px",
    justifyContent: "center",
    alignItems: "center",
    action: { type: "uri", uri: linkUri },
  };
}

/**
 * 輔助函數：創建樣式化按鈕
 */
function createStyledButton(label: string, bgColor: string, textColor: string, uri: string) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      { type: "text", text: label, align: "center", size: "sm", weight: "bold", color: textColor },
    ],
    backgroundColor: bgColor,
    paddingAll: "12px",
    cornerRadius: "25px",
    action: { type: "uri", uri: uri },
  };
}

/**
 * 輔助函數：創建圖文按鈕
 */
function createImageButton(imageUrl: string, label: string, uri: string) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      { type: "image", url: imageUrl, size: "full", aspectRatio: "4:3", aspectMode: "cover" },
      {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: label, align: "center", size: "sm", weight: "bold", color: "#2C3E50" },
        ],
        backgroundColor: "#C4FF61",
        paddingAll: "8px",
      },
    ],
    cornerRadius: "8px",
    action: { type: "uri", uri: uri },
    flex: 1,
  };
}

/**
 * 模式1: 模板選擇 Carousel - 簡單預覽圖，選擇後進入編輯器
 * 注意：liffId 必須從環境變數 NEXT_PUBLIC_LIFF_ID 取得
 */
function getTemplateSelectCarousel(appOrigin: string, liffId: string) {
  const safeOrigin = appOrigin?.trim() || "https://line360-card.vercel.app";
  const safeLiffId = liffId?.trim() || process.env.NEXT_PUBLIC_LIFF_ID || "";
  
  if (!safeLiffId) {
    log("ERROR: LIFF ID is not configured. Please set NEXT_PUBLIC_LIFF_ID environment variable.");
  }

  return {
    type: "flex",
    altText: "選擇名片模板 - 左右滑動瀏覽 6 款精美風格",
    contents: {
      type: "carousel",
      contents: TEMPLATE_PREVIEWS.map((t) => createTemplatePreviewBubble(t, safeLiffId, safeOrigin)),
    },
  };
}

/**
 * 模式2: 完整名片 Carousel - 直接顯示完整 Flex Message 名片
 * 六種不同風格，參考競品設計
 * 注意：liffId 必須從環境變數 NEXT_PUBLIC_LIFF_ID 取得
 */
function getFullCardCarousel(liffId: string) {
  const safeLiffId = liffId?.trim() || process.env.NEXT_PUBLIC_LIFF_ID || "";

  // 創建六種不同風格的完整名片
  const cards = [
    createFullCardStyle1(FULL_CARD_TEMPLATES[0], safeLiffId), // 營養師風格 - 粉色按鈕
    createFullCardStyle2(FULL_CARD_TEMPLATES[1], safeLiffId), // 美食料理風格 - 綠色背景
    createFullCardStyle3(FULL_CARD_TEMPLATES[2], safeLiffId), // 健康餐盒風格 - 圖文按鈕
    createFullCardStyle4(FULL_CARD_TEMPLATES[3], safeLiffId), // 漸層時尚風格 - 藍粉漸層
    createFullCardStyle5(FULL_CARD_TEMPLATES[4], safeLiffId), // 商務專業風格 - 黃色背景
    createFullCardStyle6(FULL_CARD_TEMPLATES[5], safeLiffId), // 美業時尚風格 - 粉色系
  ];

  return {
    type: "flex",
    altText: "完整名片展示 - 左右滑動瀏覽 6 款精美風格",
    contents: {
      type: "carousel",
      contents: cards,
    },
  };
}

/**
 * 歡迎訊息 Flex Message - 專注名片版本
 * 注意：liffId 必須從環境變數 NEXT_PUBLIC_LIFF_ID 取得
 */
function getWelcomeMessage(appOrigin: string, liffId: string) {
  const safeLiffId = liffId?.trim() || process.env.NEXT_PUBLIC_LIFF_ID || "";

  log("Building welcome message");

  return {
    type: "flex",
    altText: "歡迎體驗 DUO ID 電子名片！",
    contents: {
      type: "bubble",
      styles: {
        body: { backgroundColor: "#F4B942" },
        footer: { backgroundColor: "#F4B942" },
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: "DUO", size: "lg", weight: "bold", align: "center", color: "#2C3E50" },
                ],
                width: "70px",
                height: "70px",
                cornerRadius: "70px",
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
              },
            ],
            justifyContent: "center",
          },
          {
            type: "text",
            text: "DUO ID 數位名片",
            weight: "bold",
            size: "xl",
            align: "center",
            margin: "lg",
          },
          {
            type: "text",
            text: "一分鐘建立專屬電子名片",
            size: "md",
            align: "center",
            margin: "sm",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              { type: "text", text: "✨ 6 款精美名片風格", size: "sm", align: "center" },
              { type: "text", text: "📱 社群媒體一鍵連結", size: "sm", align: "center" },
              { type: "text", text: "🔗 LINE 直接分享名片", size: "sm", align: "center" },
              { type: "text", text: "🆓 完全免費使用", size: "sm", weight: "bold", align: "center" },
            ],
          },
        ],
        paddingAll: "20px",
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "瀏覽名片範例", align: "center", size: "md", weight: "bold", color: "#FFFFFF" },
            ],
            backgroundColor: "#2C3E50",
            paddingAll: "14px",
            cornerRadius: "25px",
            action: { type: "message", text: "名片" },
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "立即建立我的名片", align: "center", size: "md", weight: "bold", color: "#FFFFFF" },
            ],
            backgroundColor: "#E67E22",
            paddingAll: "14px",
            cornerRadius: "25px",
            action: { type: "uri", uri: `https://liff.line.me/${safeLiffId}` },
          },
        ],
        paddingAll: "15px",
      },
    },
  };
}

/**
 * 方案介紹 Flex Message
 */
function getPricingMessage(appOrigin: string) {
  const safeOrigin = appOrigin?.trim() || "https://line360-card.vercel.app";

  return {
    type: "flex",
    altText: "DUO ID 方案介紹",
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "🆓 免費版", weight: "bold", size: "xl", color: "#1DB446" },
              { type: "text", text: "完全免費使用", size: "sm", margin: "md" },
              { type: "text", text: "✓ 6 款精美模板", size: "xs", margin: "md", color: "#666666" },
              { type: "text", text: "✓ 即時編輯預覽", size: "xs", margin: "sm", color: "#666666" },
              { type: "text", text: "✓ 一鍵分享名片", size: "xs", margin: "sm", color: "#666666" },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "瀏覽模板",
                  text: "模板",
                },
                style: "primary",
              },
            ],
          },
        },
      ],
    },
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.LINE_CHANNEL_SECRET || "";
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || "";

  // 檢查 Webhook 是否已正確配置
  if (!isWebhookConfigured()) {
    logError("Webhook not configured - missing LINE_CHANNEL_SECRET or ACCESS_TOKEN");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature") || "";

    // 驗證簽名
    if (!verifySignature(body, signature, secret)) {
      logError("Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    for (const event of data.events) {
      log("Processing event:", event.type);

      if (event.type === "follow") {
        // 新用戶加入：發送歡迎訊息
        await replyMessage(event.replyToken, [getWelcomeMessage(origin, liffId)], token);
      } 
      // 用戶取消關注
      else if (event.type === "unfollow") {
        log("User unfollowed:", event.source?.userId);
        // 可以在這裡記錄用戶取消關注的事件
      }
      // Postback 事件（按鈕點擊）
      else if (event.type === "postback") {
        const postbackData = event.postback?.data || "";
        log("Postback received:", postbackData);
        
        // 解析 postback data（格式：action=xxx&param=yyy）
        const params = new URLSearchParams(postbackData);
        const action = params.get("action");
        
        switch (action) {
          case "view_templates":
            // 查看模板
            await replyMessage(event.replyToken, [getFullCardCarousel(liffId)], token);
            break;
          case "create_card":
            // 建立名片 - 引導至 LIFF
            const styleParam = params.get("style") || "style5";
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: `🎨 您選擇了精美風格！\n\n點擊下方連結開始建立名片：\nhttps://liff.line.me/${liffId}?style=${styleParam}`,
              },
            ], token);
            break;
          case "view_pricing":
            // 查看方案
            await replyMessage(event.replyToken, [getPricingMessage(origin)], token);
            break;
          case "help":
            // 幫助
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "🆘 DUO ID 使用指南\n\n1️⃣ 輸入「名片」瀏覽精美範例\n2️⃣ 選擇喜歡的風格\n3️⃣ 點擊「建立我的名片」\n4️⃣ 填寫資訊並儲存\n5️⃣ 分享給好友！\n\n💡 有問題請聯繫：support@360line.com",
              },
            ], token);
            break;
          default:
            // 未知 postback
            log("Unknown postback action:", action);
            await replyMessage(event.replyToken, [
              {
                type: "text",
                text: "感謝您的操作！輸入「名片」開始體驗 DUO ID 🎨",
              },
            ], token);
        }
      }
      // 文字訊息
      else if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.toLowerCase();
        const safeLiffId = liffId?.trim() || process.env.NEXT_PUBLIC_LIFF_ID || "";
        
        // 我的名片（輸入「我的」「my」「編輯」「edit」「管理」）
        if (text.includes("我的") || text.includes("my") || text.includes("編輯") || 
            text.includes("edit") || text.includes("管理")) {
          log("Sending my card link");
          await replyMessage(event.replyToken, [
            {
              type: "flex",
              altText: "我的名片",
              contents: {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "📇 我的名片",
                      weight: "bold",
                      size: "xl",
                      margin: "md"
                    },
                    {
                      type: "text",
                      text: "點擊下方按鈕查看或編輯您的名片",
                      size: "sm",
                      color: "#666666",
                      margin: "md",
                      wrap: true
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
                      color: "#F4B942",
                      action: {
                        type: "uri",
                        label: "查看/編輯我的名片",
                        uri: `https://liff.line.me/${safeLiffId}`
                      }
                    },
                    {
                      type: "button",
                      style: "secondary",
                      action: {
                        type: "message",
                        label: "瀏覽名片範例",
                        text: "名片"
                      }
                    }
                  ]
                }
              }
            }
          ], token);
        }
        // 名片展示（輸入「名片」「card」「範例」「模板」「風格」「開始」「建立」）
        else if (text.includes("名片") || text.includes("card") || text.includes("範例") || 
            text.includes("模板") || text.includes("風格") || text.includes("開始") || 
            text.includes("建立") || text.includes("體驗") || text.includes("start")) {
          log("Sending full card carousel");
          await replyMessage(event.replyToken, [getFullCardCarousel(liffId)], token);
        }
        else if (text.includes("價格") || text.includes("方案") || text.includes("price")) {
          await replyMessage(event.replyToken, [getPricingMessage(origin)], token);
        }
        else if (text.includes("help") || text.includes("幫助") || text.includes("說明")) {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "🆘 DUO ID 使用指南\n\n1️⃣ 輸入「名片」瀏覽精美範例\n2️⃣ 選擇喜歡的風格\n3️⃣ 點擊「建立我的名片」\n4️⃣ 填寫資訊並儲存\n5️⃣ 分享給好友！\n\n📇 輸入「我的」查看已建立的名片\n\n💡 有問題請聯繫：support@360line.com",
            },
          ], token);
        }
        else {
          await replyMessage(event.replyToken, [
            {
              type: "text",
              text: "您好！👋\n\n輸入以下關鍵字：\n\n📋 「名片」- 瀏覽精美名片範例\n📇 「我的」- 查看/編輯我的名片\n💰 「價格」- 查看方案\n🆘 「幫助」- 使用說明\n\n🎨 DUO ID - 智慧型電子名片",
            },
          ], token);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Webhook processing error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
