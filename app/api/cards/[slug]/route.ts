import { NextResponse } from "next/server";
import { CardSchema } from "@/lib/types";
import { getCard, upsertCard, getCardStore } from "@/lib/storage";
import { getLineSession } from "@/lib/auth/session";
import { getOrCreateUser, checkUserPermissions, getUserCardCount } from "@/lib/auth/userManager";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    
    // Slug 格式驗證：只允許字母、數字、底線、連字號，最長 100 字元
    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug) || slug.length > 100) {
      return NextResponse.json({ error: "invalid_slug", message: "無效的名片識別碼" }, { status: 400 });
    }
    
    const card = await getCard(slug);
    if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(card);
  } catch (error) {
    console.error("[API GET /api/cards/[slug]]", error);
    return NextResponse.json({ error: "internal_error", message: "無法讀取名片資料" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "bad_json" }, { status: 400 });

    // 1. 檢查 Session
    const session = await getLineSession();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 2. 先驗證請求資料（安全性：避免在驗證前使用任何用戶輸入）
    const validated = CardSchema.safeParse({ ...body, slug });
    if (!validated.success) {
      return NextResponse.json({ error: "invalid_payload", issues: validated.error.issues }, { status: 400 });
    }

    // 3. 取得或建立用戶（自動試用）- 使用驗證後的 displayName
    const displayName = validated.data.displayName || 'User';
    const user = await getOrCreateUser(session.sub, displayName);

    // 4. 檢查用戶權限（付費牆）
    const permissions = checkUserPermissions(user);

    // 5. 權限：名片 owner 必須是當前 LINE userId
    if (validated.data.ownerLineUserId && validated.data.ownerLineUserId !== session.sub) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // 6. 檢查現有名片（判斷是新建還是更新）
    const existingCard = await getCard(slug);
    const isNewCard = !existingCard;

    // 6.5 模板權限檢查（PRO 模板需要升級）
    const PRO_TEMPLATES = new Set(["style2", "style3", "style4", "style6"]);
    const requestedTemplate = validated.data.template || "style5";
    
    if (PRO_TEMPLATES.has(requestedTemplate)) {
      // 檢查用戶是否有權限使用 PRO 模板
      if (!permissions.canUseTemplate || !permissions.canUseTemplate(requestedTemplate)) {
        return NextResponse.json({
          error: "template_not_allowed",
          message: "此模板為 PRO 專屬，請升級後使用",
          upgradeUrl: "/upgrade"
        }, { status: 403 });
      }
    }

    // 7. 付費牆檢查與儲存
    const toSave = { ...validated.data, ownerLineUserId: session.sub };

    if (isNewCard) {
      // 新建名片：檢查 canCreateNew
      if (!permissions.canCreateNew) {
        return NextResponse.json({ 
          error: "subscription_expired", 
          message: permissions.message || "您的方案已過期，請升級以繼續建立名片",
          upgradeUrl: "/upgrade"
        }, { status: 403 });
      }

      // 使用原子操作創建名片（如果儲存層支援）
      const store = getCardStore();
      if (store.createCardWithLimitCheck) {
        // PostgreSQL: 使用原子操作防止競態條件
        const result = await store.createCardWithLimitCheck(toSave, session.sub, permissions.maxCards);
        if (result.success) {
          return NextResponse.json(result.card);
        } else {
          return NextResponse.json({ 
            error: "max_cards_reached", 
            message: `您的方案最多只能建立 ${permissions.maxCards} 張名片，目前已有 ${result.currentCount} 張`,
            upgradeUrl: "/upgrade"
          }, { status: 403 });
        }
      } else {
        // JSON Store: 非原子操作（單用戶環境可接受）
        const currentCardCount = await getUserCardCount(session.sub);
        if (currentCardCount >= permissions.maxCards) {
          return NextResponse.json({ 
            error: "max_cards_reached", 
            message: `您的方案最多只能建立 ${permissions.maxCards} 張名片，目前已有 ${currentCardCount} 張`,
            upgradeUrl: "/upgrade"
          }, { status: 403 });
        }
        const saved = await upsertCard(toSave);
        return NextResponse.json(saved);
      }
    } else {
      // 更新名片：檢查 canEdit 和 owner
      if (!permissions.canEdit) {
        return NextResponse.json({ 
          error: "subscription_expired", 
          message: permissions.message || "您的方案已過期，請升級以繼續編輯名片",
          upgradeUrl: "/upgrade"
        }, { status: 403 });
      }

      // 確認是自己的名片
      if (existingCard.ownerLineUserId && existingCard.ownerLineUserId !== session.sub) {
        return NextResponse.json({ error: "forbidden", message: "無法編輯他人的名片" }, { status: 403 });
      }

      const saved = await upsertCard(toSave);
      return NextResponse.json(saved);
    }
  } catch (error) {
    console.error("[API PUT /api/cards/[slug]]", error);
    return NextResponse.json({ error: "internal_error", message: "無法儲存名片資料" }, { status: 500 });
  }
}

