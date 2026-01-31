import { getCard } from "@/lib/storage";
import { CardPageClient } from "./ui";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://line360-card.vercel.app";

// 動態生成 metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCard(slug);
  
  if (!card) {
    return {
      title: "找不到名片",
    };
  }

  const title = `${card.displayName} 的數位名片`;
  const description = [card.title, card.company].filter(Boolean).join(" · ") || "DUO ID 數位名片";
  const cardUrl = `${baseUrl}/c/${slug}`;
  
  // 建構動態 OG Image URL（傳遞名片資料）
  const ogParams = new URLSearchParams({
    template: card.template || "insurance",
    name: card.displayName || "",
    title: card.title || "",
    company: card.company || "",
  });
  
  // 如果有頭像，也傳遞頭像 URL
  if (card.avatarUrl) {
    // 確保頭像 URL 是完整路徑
    const avatarFullUrl = card.avatarUrl.startsWith("http") 
      ? card.avatarUrl 
      : `${baseUrl}${card.avatarUrl}`;
    ogParams.set("avatar", avatarFullUrl);
  }
  
  const imageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: cardUrl,
      images: [
        {
          url: imageUrl,
          width: 540,
          height: 960,
          alt: `${card.displayName} 的名片`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">DUO</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">找不到名片</h1>
          <p className="text-gray-500 mb-6">此名片不存在或已被刪除</p>
          
          {/* 行動按鈕 */}
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
            >
              返回首頁
            </a>
            <a
              href="/editor"
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
            >
              建立我的名片
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <CardPageClient slug={slug} card={card} />;
}
