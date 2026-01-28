import type { Card } from "@/lib/types";
import { CtaBar } from "@/components/card-templates/cta/CtaBar";

function Header({ data }: { data: Partial<Card> }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-white/20 border border-white/15 overflow-hidden">
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
        <div className="text-white text-xl font-extrabold truncate">{data.displayName || "美業職人"}</div>
        <div className="text-white/80 text-sm truncate">{data.title || "美甲 / 美睫 / 護膚"}</div>
        <div className="text-white/60 text-xs truncate">{data.company || "工作室 / 沙龍"}</div>
      </div>
    </div>
  );
}

function Profile({ data }: { data: Partial<Card> }) {
  const bio = data.pages?.profile?.bio || "專注自然質感，讓你每天都更有自信。";
  return (
    <div className="mt-4 rounded-2xl bg-white/12 border border-white/10 p-4">
      <div className="text-white font-bold">風格與特色</div>
      <div className="text-white/80 text-sm leading-relaxed mt-2">{bio}</div>
    </div>
  );
}

function Services({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.services?.headline || "熱門項目";
  const items = data.pages?.services?.items || ["凝膠美甲", "睫毛嫁接", "皮膚管理"];
  return (
    <div className="mt-4 rounded-2xl bg-white/12 border border-white/10 p-4">
      <div className="text-white font-bold">{headline}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.slice(0, 4).map((t, i) => (
          <div key={i} className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-white/85 text-sm">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery({ data }: { data: Partial<Card> }) {
  const headline = data.pages?.gallery?.headline || "作品集";
  const images = data.pages?.gallery?.images || [];
  return (
    <div className="mt-4 rounded-2xl bg-white/12 border border-white/10 p-4">
      <div className="text-white font-bold">{headline}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.length ? (
          images.slice(0, 4).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={src} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
          ))
        ) : (
          <>
            <div className="aspect-[4/5] rounded-2xl bg-white/10" />
            <div className="aspect-[4/5] rounded-2xl bg-white/10" />
          </>
        )}
      </div>
      <div className="text-white/60 text-xs mt-2">（Pro 可開啟更多作品集頁）</div>
    </div>
  );
}

export function TemplateBeauty({
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
    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-500 via-rose-400 to-amber-300">
      <div className="h-full p-5 flex flex-col">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.35),transparent_50%)]" />
        <div className="relative z-10 h-full flex flex-col">
          <Header data={data} />

          {page === "profile" ? <Profile data={data} /> : null}
          {page === "services" ? <Services data={data} /> : null}
          {page === "gallery" ? <Gallery data={data} /> : null}

          <div className="mt-auto pt-4">
            {data.ctas ? <CtaBar ctas={data.ctas} shareUrl={shareUrl} onShare={onShare} /> : null}
            <div className="mt-3 text-center text-[11px] text-white/60">美業模板</div>
          </div>
        </div>
      </div>
    </div>
  );
}

