import { NextResponse } from "next/server";
import { CardSchema } from "@/lib/types";
import { getCard, upsertCard } from "@/lib/storage";
import { getLineSession } from "@/lib/auth/session";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const card = await getCard(slug);
  if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PUT(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "bad_json" }, { status: 400 });

  const session = await getLineSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const validated = CardSchema.safeParse({ ...body, slug });
  if (!validated.success) {
    return NextResponse.json({ error: "invalid_payload", issues: validated.error.issues }, { status: 400 });
  }

  // 權限：名片 owner 必須是當前 LINE userId（以 server session 為準）
  if (validated.data.ownerLineUserId && validated.data.ownerLineUserId !== session.sub) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 強制以 session 綁定 owner
  const toSave = { ...validated.data, ownerLineUserId: session.sub };
  const saved = await upsertCard(toSave);
  return NextResponse.json(saved);
}

