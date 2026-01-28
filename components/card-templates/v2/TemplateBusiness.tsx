import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";
import { Building2 } from "lucide-react";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 overflow-hidden flex items-center justify-center shadow-lg">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="text-2xl font-bold text-white">{(data.displayName || "U").charAt(0)}</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-white text-xl font-extrabold truncate">{data.displayName || "企業名片"}</div>
        <div className="text-cyan-200/90 text-sm font-semibold truncate">{data.title || "職稱 / 部門"}</div>
        <div className="mt-1 flex items-center gap-1 text-white/60 text-xs truncate">
          <Building2 size={12} />
          <span className="truncate">{data.company || "公司名稱"}</span>
        </div>
      </div>
    </div>
  );
}

function Profile({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.profile?.bio || "專注於解決企業端的效率與成長問題。";
  return (
    <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 p-4">
      <div className="text-white font-bold">簡介</div>
      <div className="text-white/80 text-sm leading-relaxed mt-2">{bio}</div>
    </div>
  );
}

function Services({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "核心服務";
  const items = data.pages?.services?.items || ["解決方案諮詢", "專案導入", "技術支援"];
  return (
    <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 p-4">
      <div className="text-white font-bold">{headline}</div>
      <div className="mt-3 space-y-2">
        {items.slice(0, 5).map((t, i) => (
          <div key={i} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2 text-white/85 text-sm">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.gallery?.headline || "案例 / 成果";
  const images = data.pages?.gallery?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 p-4">
      <div className="text-white font-bold">{headline}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {images.length ? (
          images.slice(0, 6).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
          ))
        ) : (
          <>
            <div className="aspect-square rounded-xl bg-white/10" />
            <div className="aspect-square rounded-xl bg-white/10" />
            <div className="aspect-square rounded-xl bg-white/10" />
          </>
        )}
      </div>
      <div className="text-white/60 text-xs mt-2">（Pro 可顯示更多案例/頁面）</div>
    </div>
  );
}

export function TemplateBusiness({
  data,
  page,
  shareUrl,
  onShare
}: {
  data: Partial<Card>;
  page: "profile" | "services" | "gallery";
  shareUrl: string;
  onShare?: () => void;
}) {
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
      <div className="h-[calc(100%-8px)] p-5 flex flex-col">
        <Header data={data} />

        {page === "profile" ? <Profile data={data} /> : null}
        {page === "services" ? <Services data={data} /> : null}
        {page === "gallery" ? <Gallery data={data} /> : null}

        <div className="mt-auto pt-4">
          {data.ctas ? <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} /> : null}
          <div className="mt-3 text-center text-[11px] text-white/45">企業模板</div>
        </div>
      </div>
    </div>
  );
}

