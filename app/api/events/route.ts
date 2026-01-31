import { NextResponse } from "next/server";
import { EventSchema } from "@/lib/events";
import { appendEvent } from "@/lib/eventStore";
import { getLineSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = EventSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

    // 不信任 client：若有 session，強制寫入 actorLineUserId
    const session = await getLineSession();
    const event = session ? { ...parsed.data, actorLineUserId: session.sub } : parsed.data;

    await appendEvent(event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API POST /api/events]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

