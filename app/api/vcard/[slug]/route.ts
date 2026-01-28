import { NextResponse } from "next/server";
import { getCard } from "@/lib/storage";
import { cardToVCard } from "@/lib/vcard";

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
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
}

