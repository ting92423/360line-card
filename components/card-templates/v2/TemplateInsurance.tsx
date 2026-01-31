/**
 * 保險/金融模板
 * 設計風格：新光人壽風格 - 深藍配紅色點綴、圓形頭像、專業服務列表
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Award, Shield, TrendingUp } from "lucide-react";

function CircleAvatar({ data }: { data: Partial<Card> }) {
  return (
    <div className="relative">
      {/* 裝飾圓環 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-1">
        <div className="w-full h-full rounded-full bg-slate-900" />
      </div>
      {/* 頭像 */}
      <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-red-500 shadow-xl">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/80">
              {(data.displayName || "U").charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyBadge({ company }: { company?: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700/50">
      <Shield size={14} className="text-blue-300" />
      <span className="text-blue-100 text-sm font-semibold">{company || "保險公司"}</span>
    </div>
  );
}

function ProfilePage({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "用專業與熱忱，為您的人生保駕護航。";
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <Award size={16} />
          個人簡介
        </div>
        <p className="text-white/85 text-sm leading-relaxed">{bio}</p>
      </div>
      
      {/* 成就徽章 */}
      <div className="flex gap-2 flex-wrap">
        <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
          ⭐ 百萬圓桌會員
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium">
          🏆 年度績優
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "專業服務";
  const rawItems = data.pages?.services?.items || [];
  const items = rawItems.map(item => 
    typeof item === 'string' ? { name: item, description: '' } : item
  );
  
  return (
    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-3">
        <TrendingUp size={16} />
        {headline}
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-700/30"
          >
            <div className="w-2 h-2 rounded-full bg-red-400" />
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

function GalleryPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.portfolio?.headline || "服務紀錄";
  const images = data.pages?.portfolio?.images || [];
  
  return (
    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-3">
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
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-700/30" />
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-700/30" />
            <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-700/30" />
          </>
        )}
      </div>
    </div>
  );
}

export function TemplateInsurance({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950">
      {/* 頂部裝飾條 */}
      <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
      
      <div className="h-[calc(100%-6px)] p-5 flex flex-col">
        {/* Header：公司 + 頭像 + 姓名 */}
        <div className="text-center">
          <CompanyBadge company={data.company} />
          
          <div className="mt-4 flex justify-center">
            <CircleAvatar data={data} />
          </div>
          
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            {data.displayName || "業務代表"}
          </h2>
          <p className="mt-1 text-red-300 font-semibold">
            {data.title || "資深業務主任"}
          </p>
        </div>

        {/* 動態內容區 */}
        <div className="flex-1 overflow-auto">
          {page === "profile" && <ProfilePage data={data} />}
          {page === "services" && <ServicesPage data={data} />}
          {page === "gallery" && <GalleryPage data={data} />}
        </div>

        {/* CTA Bar */}
        <div className="mt-auto pt-4">
          {data.ctas && <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} />}
          <div className="mt-3 text-center text-[11px] text-white/40">保險金融模板</div>
        </div>
      </div>
    </div>
  );
}
