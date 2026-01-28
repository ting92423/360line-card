/**
 * API: 取得當前用戶資訊
 * GET /api/users/me
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyLineIdToken } from "@/lib/auth/lineVerify";
import { getUser, createUser, checkUserPermissions } from "@/lib/auth/userManager";

export async function GET(request: NextRequest) {
  try {
    // 驗證 LINE idToken
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    const payload = await verifyLineIdToken(idToken);

    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // 取得或建立用戶
    let user = await getUser(payload.sub);
    
    if (!user) {
      // 首次登入，建立新用戶
      user = await createUser(
        payload.sub,
        payload.name || "LINE用戶",
        payload.picture
      );
    }

    // 檢查用戶權限
    const permissions = checkUserPermissions(user);

    return NextResponse.json({
      user,
      permissions
    });

  } catch (error) {
    console.error("[API /api/users/me] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
