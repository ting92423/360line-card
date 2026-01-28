"use client";

import { Phone, MapPin, Share2, MessageCircle } from "lucide-react";
import type { Card } from "@/lib/types";

export type CtaType = NonNullable<Card["ctas"]>[number]["type"];

const ICONS: Record<CtaType, React.ReactNode> = {
  tel: <Phone size={20} />,
  line: <MessageCircle size={20} />,
  share: <Share2 size={20} />,
  map: <MapPin size={20} />
};

function normalizeLineUrl(value?: string) {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  // Accept full URL
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  // Accept @basicId → convert to OA link
  if (v.startsWith("@")) return `https://line.me/R/ti/p/${encodeURIComponent(v)}`;
  return v;
}

function normalizeMapUrl(value?: string) {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  // treat as address/keyword
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
}

export function getCtaHref(cta: NonNullable<Card["ctas"]>[number], fallbackShareUrl: string) {
  const type = cta.type;
  const value = (cta.value || "").trim();
  if (type === "tel") return value ? `tel:${value}` : "";
  if (type === "line") return normalizeLineUrl(value);
  if (type === "map") return normalizeMapUrl(value);
  if (type === "share") return fallbackShareUrl;
  return "";
}

export function CtaBar({
  ctas,
  shareUrl,
  onShare,
  className
}: {
  ctas: NonNullable<Card["ctas"]>;
  shareUrl: string;
  onShare?: () => void;
  className?: string;
}) {
  const enabled = ctas.filter((c) => c.enabled !== false);
  if (enabled.length === 0) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-4 gap-3">
        {enabled.slice(0, 4).map((cta) => {
          const href = getCtaHref(cta, shareUrl);
          const label = cta.label || (cta.type === "tel" ? "電話" : cta.type === "line" ? "LINE" : cta.type === "share" ? "分享" : "地圖");

          // share uses Web Share API if available
          if (cta.type === "share") {
            return (
              <button
                key={cta.id}
                type="button"
                onClick={onShare}
                className="h-12 rounded-xl bg-white/15 text-white flex items-center justify-center backdrop-blur-sm border border-white/15 active:scale-[0.99]"
                aria-label={label}
                title={label}
              >
                {ICONS.share}
              </button>
            );
          }

          return (
            <a
              key={cta.id}
              href={href || undefined}
              className={`h-12 rounded-xl bg-white/15 text-white flex items-center justify-center backdrop-blur-sm border border-white/15 active:scale-[0.99] ${
                href ? "opacity-100" : "opacity-40 pointer-events-none"
              }`}
              aria-label={label}
              title={label}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {ICONS[cta.type]}
            </a>
          );
        })}
      </div>
    </div>
  );
}

