/**
 * 企業/商務模板
 * 設計風格：專業科技感、藍綠漸層、解決方案展示
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Building2, Briefcase, Target, Layers } from "lucide-react";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="flex items-start gap-4">
      {/* 頭像 */}
      <div className="shrink-0 w-18 h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-cyan-900/30">
        <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-cyan-900">
              <span className="text-2xl font-bold text-cyan-200">
                {(data.displayName || "U").charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="min-w-0 flex-1 pt-1">
        <h2 className="text-xl font-extrabold text-white truncate">
          {data.displayName || "企業代表"}
        </h2>
        <p className="text-cyan-300 text-sm font-semibold truncate mt-0.5">
          {data.title || "業務總監"}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-white/60 text-xs">
          <Building2 size={12} className="text-cyan-400" />
          <span className="truncate">{data.company || "科技創新股份有限公司"}</span>
        </div>
      </div>
    </div>
  );
}

function Profile({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "專注於企業數位轉型解決方案，協助客戶提升營運效率與競爭力。";
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-cyan-700/30 p-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
          <Briefcase size={16} />
          專業簡介
        </div>
        <p className="text-white/85 text-sm leading-relaxed">{bio}</p>
      </div>
      
      {/* 專長標籤 */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-200 text-xs font-medium">
          🚀 數位轉型
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-200 text-xs font-medium">
          ☁️ 雲端整合
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-200 text-xs font-medium">
          📊 數據分析
        </span>
      </div>
    </div>
  );
}

function Services({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "解決方案";
  const rawItems = data.pages?.services?.items || [];
  // 支援新舊格式：物件陣列或字串陣列
  const items = rawItems.map(item => 
    typeof item === 'string' ? { name: item, description: '' } : item
  );
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-cyan-700/30 p-4">
      <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
        <Target size={16} />
        {headline}
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
            <div className="flex-1 min-w-0">
              <span className="text-white/90 text-sm font-medium">{item.name}</span>
              {item.description && (
                <p className="text-white/50 text-xs mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.portfolio?.headline || "成功案例";
  const images = data.pages?.portfolio?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-cyan-700/30 p-4">
      <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
        <Layers size={16} />
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
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-700/20 flex items-center justify-center">
              <span className="text-xl">💼</span>
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-700/20 flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border border-cyan-700/20 flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TemplateBusiness({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-cyan-950 relative">
      {/* 背景光效 */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full blur-3xl" />
      
      {/* 頂部漸層邊框 */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
      
      <div className="relative h-[calc(100%-6px)] p-5 flex flex-col">
        <Header data={data} />

        <div className="flex-1 overflow-auto">
          {page === "profile" && <Profile data={data} />}
          {page === "services" && <Services data={data} />}
          {page === "gallery" && <Gallery data={data} />}
        </div>

        <div className="mt-auto pt-4">
          {data.ctas && <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} />}
          <div className="mt-3 text-center text-[11px] text-cyan-400/40">企業商務模板</div>
        </div>
      </div>
    </div>
  );
}

