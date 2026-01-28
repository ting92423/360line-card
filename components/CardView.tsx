"use client";

import type { Card } from "@/lib/types";

function maybeTelHref(phone?: string) {
  if (!phone) return null;
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function maybeMailHref(email?: string) {
  if (!email) return null;
  return `mailto:${email}`;
}

function SocialLink({ label, href }: { label: string; href?: string }) {
  if (!href) return null;
  return (
    <a className="btn" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

export function CardView({
  card,
  actions
}: {
  card: Card;
  actions?: React.ReactNode;
}) {
  const telHref = maybeTelHref(card.phone);
  const mailHref = maybeMailHref(card.email);

  return (
    <div className="panel">
      <div className="row" style={{ alignItems: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.avatarUrl || "/avatar-placeholder.svg"}
            alt={card.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{card.displayName}</div>
          <div className="muted" style={{ marginTop: 4, lineHeight: 1.5 }}>
            {[card.title, card.company].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="row">
        {telHref ? (
          <a className="btn" href={telHref}>
            撥打電話
          </a>
        ) : null}
        {mailHref ? (
          <a className="btn" href={mailHref}>
            寄 Email
          </a>
        ) : null}
        {card.website ? (
          <a className="btn" href={card.website} target="_blank" rel="noreferrer">
            前往官網
          </a>
        ) : null}
      </div>

      {actions ? (
        <>
          <div style={{ height: 14 }} />
          {actions}
        </>
      ) : null}

      <div style={{ height: 14 }} />
      <div className="row">
        <SocialLink label="Instagram" href={card.social?.instagram} />
        <SocialLink label="Facebook" href={card.social?.facebook} />
        <SocialLink label="YouTube" href={card.social?.youtube} />
        <SocialLink label="LinkedIn" href={card.social?.linkedin} />
      </div>
    </div>
  );
}

