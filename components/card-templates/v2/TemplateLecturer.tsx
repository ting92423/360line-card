/**
 * 講師/顧問模板
 * 設計風格：專業深色調、金色點綴、課程服務展示
 */
import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Mic, BookOpen, Users, Award } from "lucide-react";

function PageHeader({ data }: { data: Partial<Card> }) {
  return (
    <div className="flex items-start gap-4">
      {/* 頭像 */}
      <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-lg shadow-amber-900/20">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-slate-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-amber-200">
              {(data.displayName || "U").charAt(0)}
            </span>
          </div>
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 mb-2">
          <Mic size={10} className="text-amber-400" />
          <span className="text-amber-300 text-[10px] font-medium">專業講師</span>
        </div>
        <h2 className="text-xl font-extrabold text-white truncate">
          {data.displayName || "講師姓名"}
        </h2>
        <p className="text-amber-300 text-sm font-semibold truncate mt-0.5">
          {data.title || "講師 / 顧問 / 教練"}
        </p>
        <p className="text-white/60 text-xs truncate mt-0.5">
          {data.company || "DUO Academy"}
        </p>
      </div>
    </div>
  );
}

function ProfilePage({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.about?.bio || "擅長把複雜內容講到你聽懂，讓學員能立刻上手。";
  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-700/30 p-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <Award size={16} />
          關於我
        </div>
        <p className="text-white/85 text-sm leading-relaxed">{bio}</p>
      </div>
      
      {/* 資歷標籤 */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-200 text-xs font-medium">
          📚 15年經驗
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-200 text-xs font-medium">
          🎯 500+ 企業
        </span>
      </div>
    </div>
  );
}

function ServicesPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "課程服務";
  const rawItems = data.pages?.services?.items || [];
  const items = rawItems.map(item => 
    typeof item === 'string' ? { name: item, description: '' } : item
  );
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-700/30 p-4">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
        <BookOpen size={16} />
        {headline}
      </div>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
              {i + 1}
            </span>
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
  const headline = data.pages?.portfolio?.headline || "授課剪影";
  const images = data.pages?.portfolio?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-900/30 to-slate-900/50 border border-amber-700/30 p-4">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
        <Users size={16} />
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
            <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-900/30 to-slate-800/50 border border-amber-700/20 flex items-center justify-center">
              <span className="text-xl">🎤</span>
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-900/30 to-slate-800/50 border border-amber-700/20 flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-900/30 to-slate-800/50 border border-amber-700/20 flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function TemplateLecturer({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-amber-950 relative">
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* 頂部金邊 */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />
      
      <div className="relative h-[calc(100%-4px)] p-5 flex flex-col">
        <PageHeader data={data} />

        <div className="flex-1 overflow-auto">
          {page === "profile" && <ProfilePage data={data} />}
          {page === "services" && <ServicesPage data={data} />}
          {page === "gallery" && <GalleryPage data={data} />}
        </div>

        <div className="mt-auto pt-4">
          {data.ctas && <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} />}
          <div className="mt-3 text-center text-[11px] text-amber-400/40">講師顧問模板</div>
        </div>
      </div>
    </div>
  );
}

