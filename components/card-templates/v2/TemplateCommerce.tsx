/**
 * 商務/批發模板
 * 設計風格：君圓國際風格 - 橘綠配色、公司 Logo、多頁產品展示
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Store, Package, Truck, MapPin } from "lucide-react";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="relative">
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-2xl" />
      
      <div className="relative flex items-start gap-4">
        {/* Logo / 頭像 */}
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 p-0.5 shadow-lg">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50">
                <Store size={28} className="text-orange-500" />
              </div>
            )}
          </div>
        </div>

        {/* 公司資訊 */}
        <div className="min-w-0 flex-1">
          <div className="text-orange-400 text-xs font-bold tracking-wider mb-1">
            {data.company || "公司名稱"}
          </div>
          <h2 className="text-xl font-extrabold text-white truncate">
            {data.displayName || "負責人"}
          </h2>
          <p className="text-teal-300 text-sm font-medium mt-0.5">
            {data.title || "總經理"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "提供優質商品，滿足您的批發需求。";
  
  return (
    <div className="mt-4 space-y-3">
      {/* 簡介卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-900/50 to-teal-800/30 border border-teal-700/30 p-4">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-2">
          <Package size={16} />
          關於我們
        </div>
        <p className="text-white/85 text-sm leading-relaxed">{bio}</p>
      </div>

      {/* 特色標籤 */}
      <div className="flex flex-wrap gap-2">
        <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-medium flex items-center gap-1">
          <Truck size={12} /> 快速出貨
        </div>
        <div className="px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
          💰 批發價格
        </div>
        <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
          🎁 萬種商品
        </div>
      </div>

      {/* 地址 */}
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <MapPin size={14} className="text-orange-400" />
        <span>屏東縣東港鎮文昌街291號</span>
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
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-teal-900/50 to-teal-800/30 border border-teal-700/30 p-4">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-3">
          <Store size={16} />
          {headline}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {items.slice(0, 6).map((item, i) => (
            <div
              key={i}
              className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center"
            >
              <div className="text-white/90 text-sm font-medium">{item.name}</div>
              {item.description && (
                <p className="text-white/50 text-xs mt-0.5">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 經銷優勢 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="text-2xl">✗</div>
          <div className="text-xs text-orange-300 mt-1">免囤貨</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <div className="text-2xl">✗</div>
          <div className="text-xs text-teal-300 mt-1">免預繳</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-2xl">0</div>
          <div className="text-xs text-amber-300 mt-1">創業風險</div>
        </div>
      </div>
    </div>
  );
}

function GalleryPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.portfolio?.headline || "商品展示";
  const images = data.pages?.portfolio?.images || [];
  
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-teal-900/50 to-teal-800/30 border border-teal-700/30 p-4">
      <div className="flex items-center gap-2 text-orange-400 font-bold text-sm mb-3">
        📦 {headline}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {images.length ? (
          images.slice(0, 6).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
          ))
        ) : (
          <>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-900/30 to-teal-900/30 border border-white/10 flex items-center justify-center">
              <Package size={24} className="text-orange-400/50" />
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-900/30 to-teal-900/30 border border-white/10 flex items-center justify-center">
              <Package size={24} className="text-teal-400/50" />
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-900/30 to-teal-900/30 border border-white/10 flex items-center justify-center">
              <Package size={24} className="text-amber-400/50" />
            </div>
          </>
        )}
      </div>
      <p className="text-white/50 text-xs mt-3 text-center">每日上架一二十樣新商品</p>
    </div>
  );
}

export function TemplateCommerce({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-teal-950 to-slate-950">
      {/* 頂部裝飾 */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />
      
      <div className="h-[calc(100%-6px)] p-5 flex flex-col">
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
          <div className="mt-3 text-center text-[11px] text-white/40">商務批發模板</div>
        </div>
      </div>
    </div>
  );
}
