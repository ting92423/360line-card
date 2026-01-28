import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";

function PageHeader({ data }: { data: Partial<Card> }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-white/15 border border-white/15 overflow-hidden">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white/80">
            {(data.displayName || "U").charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-white text-xl font-extrabold truncate">{data.displayName || "講師姓名"}</div>
        <div className="text-amber-200/90 text-sm font-semibold truncate">{data.title || "講師 / 顧問 / 教練"}</div>
        <div className="text-white/70 text-xs truncate">{data.company || "品牌 / 工作室"}</div>
      </div>
    </div>
  );
}

function ProfilePage({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.profile?.bio || "擅長把複雜內容講到你聽懂，讓學員能立刻上手。";
  return (
    <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 p-4">
      <div className="text-white font-bold">一句話介紹</div>
      <div className="text-white/80 text-sm leading-relaxed mt-2">{bio}</div>
    </div>
  );
}

function ServicesPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "課程 / 服務";
  const items = data.pages?.services?.items || ["一對一諮詢", "企業內訓", "公開班課程"];
  return (
    <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 p-4">
      <div className="text-white font-bold">{headline}</div>
      <ul className="mt-2 space-y-2">
        {items.slice(0, 5).map((t, i) => (
          <li key={i} className="text-white/85 text-sm flex items-start gap-2">
            <span className="mt-[6px] h-2 w-2 rounded-full bg-amber-300/90 shrink-0" />
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GalleryPage({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.gallery?.headline || "授課剪影";
  const images = data.pages?.gallery?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-white/10 border border-white/10 p-4">
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
      <div className="text-white/60 text-xs mt-2">（Pro 可顯示更多相片）</div>
    </div>
  );
}

export function TemplateLecturer({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950">
      <div className="h-full p-5 flex flex-col">
        <PageHeader data={data} />

        {page === "profile" ? <ProfilePage data={data} /> : null}
        {page === "services" ? <ServicesPage data={data} /> : null}
        {page === "gallery" ? <GalleryPage data={data} /> : null}

        <div className="mt-auto pt-4">
          {data.ctas ? <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} /> : null}
          <div className="mt-3 text-center text-[11px] text-white/45">講師模板</div>
        </div>
      </div>
    </div>
  );
}

