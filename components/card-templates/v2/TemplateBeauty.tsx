/**
 * 美業/時尚模板
 * 設計風格：優雅漸層、柔和粉色調、精緻作品展示
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Sparkles, Heart, Camera } from "lucide-react";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="text-center">
      {/* 頭像 */}
      <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl shadow-pink-900/30">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {(data.displayName || "U").charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      {/* 姓名與職稱 */}
      <h2 className="mt-4 text-2xl font-extrabold text-white drop-shadow-lg">
        {data.displayName || "美業職人"}
      </h2>
      <p className="mt-1 text-white/90 text-sm font-medium">
        {data.title || "美甲 / 美睫 / 護膚"}
      </p>
      <p className="mt-0.5 text-white/70 text-xs">
        {data.company || "LUXE Beauty Studio"}
      </p>
    </div>
  );
}

function Profile({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "專注自然質感，讓你每天都更有自信。";
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
          <Sparkles size={16} className="text-yellow-200" />
          關於我
        </div>
        <p className="text-white/90 text-sm leading-relaxed">{bio}</p>
      </div>
      
      {/* 特色標籤 */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-medium">
          ✨ 韓式技術
        </span>
        <span className="px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-medium">
          💖 預約制
        </span>
        <span className="px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-medium">
          🌸 私密空間
        </span>
      </div>
    </div>
  );
}

function Services({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "熱門項目";
  const rawItems = data.pages?.services?.items || [];
  const items = rawItems.map(item => 
    typeof item === 'string' ? { name: item, description: '' } : item
  );
  return (
    <div className="mt-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4">
      <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
        <Heart size={16} className="text-red-200" />
        {headline}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 6).map((item, i) => (
          <div
            key={i}
            className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-center"
          >
            <div className="text-white/95 text-sm font-medium">{item.name}</div>
            {item.description && (
              <p className="text-white/60 text-xs mt-0.5">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.portfolio?.headline || "作品集";
  const images = data.pages?.portfolio?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 p-4">
      <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
        <Camera size={16} className="text-purple-200" />
        {headline}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.length ? (
          images.slice(0, 6).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
          ))
        ) : (
          <>
            <div className="aspect-square rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-xl">💅</span>
            </div>
            <div className="aspect-square rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-xl">👁️</span>
            </div>
            <div className="aspect-square rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TemplateBeauty({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 relative">
      {/* 背景光暈效果 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_40%)]" />
      
      <div className="relative h-full p-5 flex flex-col">
        <Header data={data} />

        <div className="flex-1 overflow-auto">
          {page === "profile" && <Profile data={data} />}
          {page === "services" && <Services data={data} />}
          {page === "gallery" && <Gallery data={data} />}
        </div>

        <div className="mt-auto pt-4">
          {data.ctas && <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} />}
          <div className="mt-3 text-center text-[11px] text-white/50">美業時尚模板</div>
        </div>
      </div>
    </div>
  );
}

