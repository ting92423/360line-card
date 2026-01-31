import { NextResponse } from "next/server";
import { getCard } from "@/lib/storage";
import { cardToVCard } from "@/lib/vcard";
import { z } from "zod";

// Slug 驗證 Schema
const SlugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, {
  message: "Slug can only contain letters, numbers, hyphens, and underscores"
});

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await context.params;

    // 驗證 slug 格式（防止路徑遍歷或注入）
    const slugValidation = SlugSchema.safeParse(rawSlug);
    if (!slugValidation.success) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }
    const slug = slugValidation.data;

    const card = await getCard(slug);
    if (!card) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const vcf = cardToVCard(card);
    const filename = `${slug}.vcf`;

    return new NextResponse(vcf, {
      headers: {
        "content-type": "text/vcard; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("[API GET /api/vcard/[slug]]", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

