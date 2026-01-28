"use client";

import type { Card } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { getLiff } from "@/lib/liff";
import { renderTemplate } from "@/lib/templates/renderer";

function buildOaAddFriendUrl(basicId: string) {
  const cleaned = basicId.replace(/^@/, "");
  return `https://line.me/R/ti/p/@${encodeURIComponent(cleaned)}`;
}

function buildFlexMessageForCard(card: Card, slug: string) {
  try {
    // 使用動態樣板渲染
    const flexJson = renderTemplate(card.template || 'default', card);
    const contents = JSON.parse(flexJson);
    
    return {
      type: "flex",
      altText: `${card.displayName} 的電子名片`,
      contents
    };
  } catch (err) {
    console.error('Template render failed, using fallback', err);
    
    // 降級：使用簡單的預設樣板
    const origin =
      typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_ORIGIN || "";
    const cardUrl = `${origin}/c/${encodeURIComponent(slug)}`;
    const heroUrl = card.avatarUrl || `${origin}/avatar-placeholder.svg`;

    return {
      type: "flex",
      altText: `${card.displayName} 的電子名片`,
      contents: {
        type: "bubble",
        hero: {
          type: "image",
          url: heroUrl,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover"
        },
        body: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: card.displayName,
              wrap: true,
              weight: "bold",
              size: "xl"
            },
            {
              type: "text",
              text: [card.title, card.company].filter(Boolean).join(" · ") || " ",
              wrap: true,
              size: "sm",
              color: "#777777"
            },
            {
              type: "button",
              style: "primary",
              action: {
                type: "uri",
                label: "開啟名片",
                uri: cardUrl
              }
            }
          ]
        }
      }
    };
  }
}

export function CardActions({ slug, card }: { slug: string; card: Card }) {
  const [status, setStatus] = useState<string>("");

  const vcardUrl = useMemo(() => `/api/vcard/${encodeURIComponent(slug)}`, [slug]);

  useEffect(() => {
    // 非阻塞：優先載入 UI，事件用 sendBeacon 上報
    try {
      const payload = JSON.stringify({ type: "card_view", slug });
      navigator.sendBeacon?.("/api/events", payload);
    } catch {
      // ignore
    }
  }, [slug]);

  async function onShare() {
    setStatus("");
    try {
      const liff = await getLiff();
      if (!liff || !liff.isInClient()) {
        await navigator.clipboard.writeText(window.location.href);
        setStatus("非 LINE 環境：已複製名片連結");
        return;
      }

      try {
        const payload = JSON.stringify({ type: "card_click_share", slug });
        navigator.sendBeacon?.("/api/events", payload);
      } catch {}

      const message = buildFlexMessageForCard(card, slug);
      // @ts-expect-error - LINE SDK typings 對 Flex Message 不完整（但實際可用）
      const result = await liff.shareTargetPicker([message]);
      if (result) setStatus("已送出分享");
    } catch (e) {
      setStatus("分享失敗（請確認 LIFF 設定已啟用 ShareTargetPicker）");
    }
  }

  function onAddFriend() {
    const basicId = card.lineOaBasicId || process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || "";
    if (!basicId) {
      setStatus("尚未設定官方帳號 Basic ID（NEXT_PUBLIC_LINE_OA_BASIC_ID）");
      return;
    }
    try {
      const payload = JSON.stringify({ type: "card_click_add_friend", slug });
      navigator.sendBeacon?.("/api/events", payload);
    } catch {}
    const url = buildOaAddFriendUrl(basicId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="row">
        <button className="btn primary" onClick={onAddFriend} type="button">
          一鍵加 LINE 好友
        </button>
        <a
          className="btn"
          href={vcardUrl}
          onClick={() => {
            try {
              const payload = JSON.stringify({ type: "card_click_vcard", slug });
              navigator.sendBeacon?.("/api/events", payload);
            } catch {}
          }}
        >
          儲存到通訊錄（vCard）
        </a>
        <button className="btn" onClick={onShare} type="button">
          分享名片
        </button>
      </div>

      {status ? (
        <>
          <div style={{ height: 10 }} />
          <div className="muted" style={{ lineHeight: 1.6 }}>
            {status}
          </div>
        </>
      ) : null}
    </div>
  );
}

