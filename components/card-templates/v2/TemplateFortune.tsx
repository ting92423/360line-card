/**
 * 命理/風水模板
 * 設計風格：方智福老師風格 - 紅金配色、傳統元素、服務項目列表
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Sparkles, BookOpen, Star } from "lucide-react";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="relative text-center">
      {/* 背景裝飾 - 傳統雲紋效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent rounded-3xl" />
      
      <div className="relative">
        {/* 頭像 */}
        <div className="mx-auto w-24 h-24 rounded-2xl overflow-hidden border-4 border-amber-500/50 shadow-xl shadow-amber-900/30">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-900 flex items-center justify-center">
              <span className="text-4xl">☯</span>
            </div>
          )}
        </div>

        {/* 姓名與稱號 */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium mb-2">
            <Sparkles size={12} />
            {data.company || "命理中心"}
            <Sparkles size={12} />
          </div>
          
          <h2 className="text-2xl font-black text-white tracking-wide">
            {data.displayName || "命理老師"}
          </h2>
          
          <p className="mt-1 text-amber-300 font-bold">
            {data.title || "命理師"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "專研命理學術，為您指點迷津。";
  
  return (
    <div className="mt-4 space-y-3">
      {/* 經歷卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-red-900/40 to-amber-900/20 border border-amber-700/30 p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
          <BookOpen size={16} />
          經歷
        </div>
        <p className="text-white/85 text-sm leading-relaxed">{bio}</p>
      </div>

      {/* 認證標籤 */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="px-3 py-1.5 rounded-lg bg-red-800/40 border border-red-600/30 text-red-200 text-xs font-medium">
          📜 易理學會理事
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-amber-800/40 border border-amber-600/30 text-amber-200 text-xs font-medium">
          🏛 學會講師
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "服務項目";
  const rawItems = data.pages?.services?.items || [];
  const items = rawItems.map(item => 
    typeof item === 'string' ? { name: item, description: '' } : item
  );
  
  return (
    <div className="mt-4">
      <div className="rounded-2xl bg-gradient-to-br from-red-900/40 to-amber-900/20 border border-amber-700/30 p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
          <Star size={16} />
          {headline}
        </div>
        
        {/* 雙欄服務列表 */}
        <div className="grid grid-cols-2 gap-2">
          {items.slice(0, 8).map((item, i) => (
            <div
              key={i}
              className="px-3 py-2.5 rounded-xl bg-black/20 border border-amber-700/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xs">•</span>
                <span className="text-white/90 text-sm">{item.name}</span>
              </div>
              {item.description && (
                <p className="text-white/50 text-xs mt-1 pl-4">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 特色服務 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="text-center p-3 rounded-xl bg-red-900/30 border border-red-700/30">
          <div className="text-xl">🔮</div>
          <div className="text-xs text-red-200 mt-1">收驚</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-amber-900/30 border border-amber-700/30">
          <div className="text-xl">🏠</div>
          <div className="text-xs text-amber-200 mt-1">陽宅鑑定</div>
        </div>
      </div>
    </div>
  );
}

function GalleryPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.portfolio?.headline || "活動紀錄";
  const images = data.pages?.portfolio?.images || [];
  
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-red-900/40 to-amber-900/20 border border-amber-700/30 p-4">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
        📸 {headline}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.length ? (
          images.slice(0, 6).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
          ))
        ) : (
          <>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-red-900/50 to-amber-900/30 border border-amber-700/20 flex items-center justify-center text-2xl">
              ☯
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-red-900/50 to-amber-900/30 border border-amber-700/20 flex items-center justify-center text-2xl">
              🔮
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-red-900/50 to-amber-900/30 border border-amber-700/20 flex items-center justify-center text-2xl">
              📿
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TemplateFortune({
  data,
  page,
  shareUrl,
  onShare,
}: {
  data: Partial<Card>;
  page: "profile" | "services" | "gallery";
  shareUrl: string;
  onShare?: () => void;
}) {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-red-950 via-red-900 to-slate-950 relative">
      {/* 背景裝飾 */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-amber-500/5 to-transparent rounded-full blur-3xl" />
      
      {/* 頂部金邊 */}
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
      
      <div className="relative h-[calc(100%-6px)] p-5 flex flex-col">
        <Header data={data} />

        {/* 動態內容 */}
        <div className="flex-1 overflow-auto">
          {page === "profile" && <ProfilePage data={data} />}
          {page === "services" && <ServicesPage data={data} />}
          {page === "gallery" && <GalleryPage data={data} />}
        </div>

        {/* CTA Bar */}
        <div className="mt-auto pt-4">
          {data.ctas && <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} />}
          <div className="mt-3 text-center text-[11px] text-amber-400/50">命理風水模板</div>
        </div>
      </div>
    </div>
  );
}
