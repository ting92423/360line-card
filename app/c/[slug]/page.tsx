import { CardView } from "@/components/CardView";
import { getCard } from "@/lib/storage";
import { CardActions } from "./ui";

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card) {
    return (
      <main className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>找不到名片</h1>
          <div className="muted">slug: {slug}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="grid">
        <CardView card={card} actions={<CardActions slug={slug} card={card} />} />

        <div className="panel">
          <h2 style={{ margin: "0 0 10px" }}>提示</h2>
          <div className="muted" style={{ lineHeight: 1.75 }}>
            建議用 LINE 內瀏覽器（LIFF）開啟，分享按鈕會直接跳出選好友視窗；非 LINE 環境會自動降級成「複製連結」。
          </div>
        </div>
      </div>
    </main>
  );
}

