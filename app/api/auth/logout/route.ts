import { NextResponse } from "next/server";
import { clearLineSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearLineSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API POST /api/auth/logout]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

