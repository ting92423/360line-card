/**
 * AI 智能名片生成 API
 * 使用 DeepSeek API 生成名片內容
 * 
 * POST /api/ai/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { consumeCredits, getUserCreditsBalance, CREDITS_CONFIG } from "@/lib/credits";
import { getLineSession } from "@/lib/auth/session";

// DeepSeek API 設定
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

// 請求驗證
interface GenerateRequest {
  profession: string;      // 職業/行業
  expertise: string;       // 專長/服務
  impression: string;      // 想給客戶的印象
  displayName?: string;    // 用戶姓名（可選，用於更個人化的生成）
}

// 回應格式
interface GenerateResponse {
  tagline: string;         // 標語（一句話）
  bio: string;             // 個人簡介（150-300字）
  tags: string[];          // 專長標籤（5個）
  motto: string;           // 座右銘
}

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

    // 檢查 API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI 服務未設定，請聯繫管理員" },
        { status: 500 }
      );
    }

    // 解析請求
    const body: GenerateRequest = await request.json();
    const { profession, expertise, impression, displayName } = body;

    if (!profession || !expertise || !impression) {
      return NextResponse.json(
        { error: "請填寫完整資訊" },
        { status: 400 }
      );
    }

    // 檢查點數餘額
    const balance = await getUserCreditsBalance(lineUserId);
    if (balance < CREDITS_CONFIG.COST_PER_GENERATION) {
      return NextResponse.json(
        { 
          error: "點數不足",
          balance,
          required: CREDITS_CONFIG.COST_PER_GENERATION,
          message: `需要 ${CREDITS_CONFIG.COST_PER_GENERATION} 點，目前餘額 ${balance} 點`
        },
        { status: 402 } // Payment Required
      );
    }

    // 建構 Prompt
    const systemPrompt = `你是一位專業的個人品牌顧問，擅長撰寫精煉、有說服力的個人介紹文案。
請根據用戶提供的資訊，生成適合數位名片的內容。

要求：
1. tagline（標語）：一句話（15-25字），要有記憶點，能展現專業特色
2. bio（個人簡介）：150-300字，專業但親切，強調服務價值和獨特優勢
3. tags（專長標籤）：5個關鍵詞，每個2-6字，便於客戶快速了解服務範圍
4. motto（座右銘）：一句話（10-20字），體現專業態度或服務理念

請確保：
- 使用繁體中文
- 語氣專業但不生硬
- 內容具體，避免空泛套話
- 符合台灣市場習慣

請以 JSON 格式回覆，包含 tagline, bio, tags, motto 四個欄位。`;

    const userPrompt = `請為以下人士撰寫數位名片內容：

${displayName ? `姓名：${displayName}` : ''}
職業/行業：${profession}
專長/服務：${expertise}
希望給客戶的印象：${impression}

請生成 JSON 格式的回覆。`;

    // 呼叫 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      return NextResponse.json(
        { error: "AI 服務暫時無法使用，請稍後再試" },
        { status: 502 }
      );
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI 回應異常，請重試" },
        { status: 500 }
      );
    }

    // 解析 AI 回應
    let generated: GenerateResponse;
    try {
      generated = JSON.parse(content);
      
      // 驗證必要欄位
      if (!generated.tagline || !generated.bio || !generated.tags || !generated.motto) {
        throw new Error("Missing required fields");
      }
      
      // 確保 tags 是陣列且有 5 個
      if (!Array.isArray(generated.tags)) {
        generated.tags = [];
      }
      generated.tags = generated.tags.slice(0, 5);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "AI 回應格式異常，請重試" },
        { status: 500 }
      );
    }

    // 扣除點數
    const consumeResult = await consumeCredits(
      lineUserId,
      CREDITS_CONFIG.COST_PER_GENERATION,
      `AI 智能填寫（${profession}）`
    );

    if (!consumeResult.success) {
      return NextResponse.json(
        { error: consumeResult.message || "點數扣除失敗" },
        { status: 402 }
      );
    }

    // 回傳生成結果
    return NextResponse.json({
      success: true,
      data: generated,
      credits: {
        consumed: CREDITS_CONFIG.COST_PER_GENERATION,
        balance: consumeResult.balance
      }
    });

  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "系統錯誤，請稍後再試" },
      { status: 500 }
    );
  }
}
