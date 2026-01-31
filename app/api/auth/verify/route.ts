import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLineIdToken } from "@/lib/auth/lineVerify";
import { setLineSessionCookie } from "@/lib/auth/session";

const BodySchema = z.object({
  idToken: z.string().min(10)
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    try {
      const verified = await verifyLineIdToken(parsed.data.idToken);
      await setLineSessionCookie({ sub: verified.sub, iat: Math.floor(Date.now() / 1000) });
      return NextResponse.json({ ok: true, userId: verified.sub });
    } catch {
      return NextResponse.json({ error: "verify_failed" }, { status: 401 });
    }
  } catch (error) {
    console.error("[API POST /api/auth/verify]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

