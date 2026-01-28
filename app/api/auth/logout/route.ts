import { NextResponse } from "next/server";
import { clearLineSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearLineSessionCookie();
  return NextResponse.json({ ok: true });
}

