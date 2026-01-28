"use client";

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import type { Card } from "@/lib/types";
import { getLiff } from "@/lib/liff";

type Draft = Omit<Card, "slug" | "displayName"> & {
  slug?: string;
  displayName?: string;
  avatarUrl?: string;
  template?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  const json = text ? (JSON.parse(text) as T) : ({} as T);
  if (!res.ok) throw new Error((json as any)?.error || `HTTP_${res.status}`);
  return json;
}

export function AdminClient() {
  const [status, setStatus] = useState<string>("");
  const [lineUserId, setLineUserId] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [draft, setDraft] = useState<Draft>({
    template: "default",
    title: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    lineOaBasicId: "",
    social: {
      instagram: "",
      facebook: "",
      youtube: "",
      linkedin: ""
    }
  });

  const slug = useMemo(() => lineUserId || draft.slug || "", [lineUserId, draft.slug]);

  useEffect(() => {
    (async () => {
      setStatus("初始化 LIFF...");
      const liff = await getLiff();
      if (!liff) {
        setStatus("尚未設定 NEXT_PUBLIC_LIFF_ID，或目前不是瀏覽器環境。");
        return;
      }

      if (!liff.isLoggedIn()) {
        setStatus("需要登入 LINE...");
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      setLineUserId(profile.userId);
      setDraft((d) => ({
        ...d,
        displayName: profile.displayName,
        avatarUrl: profile.pictureUrl
      }));

      setStatus("驗證身分（server）...");
      try {
        const idToken = liff.getIDToken();
        if (!idToken) throw new Error("no_id_token");
        await fetchJson<{ ok: true; userId: string }>("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken })
        });
        setIsVerified(true);
      } catch {
        setIsVerified(false);
        setStatus("身分驗證失敗（請確認 LINE_CHANNEL_ID/SESSION_SECRET 與 HTTPS/Domain）");
        return;
      }

      setStatus("讀取既有名片...");
      try {
        const existing = await fetchJson<Card>(`/api/cards/${encodeURIComponent(profile.userId)}`);
        setDraft(existing);
        setStatus("已載入既有名片");
      } catch {
        setStatus("尚未建立名片，已帶入 LINE profile（可直接儲存）");
      }
    })().catch(() => setStatus("LIFF 初始化失敗（請確認 LIFF 設定、Domain、以及 HTTPS）"));
  }, []);

  async function onSave() {
    if (!isVerified) {
      setStatus("尚未完成身分驗證，無法儲存");
      return;
    }
    setStatus("儲存中...");
    const safeSlug = slug || nanoid(8);
    const payload: Card = {
      slug: safeSlug,
      ownerLineUserId: lineUserId || undefined,
      template: draft.template || "default",
      displayName: draft.displayName || "未命名",
      title: draft.title || undefined,
      company: draft.company || undefined,
      avatarUrl: draft.avatarUrl || undefined,
      phone: draft.phone || undefined,
      email: draft.email || undefined,
      website: draft.website || undefined,
      lineOaBasicId: draft.lineOaBasicId || undefined,
      social: {
        instagram: draft.social?.instagram || undefined,
        facebook: draft.social?.facebook || undefined,
        youtube: draft.social?.youtube || undefined,
        linkedin: draft.social?.linkedin || undefined
      }
    };

    try {
      const saved = await fetchJson<Card>(`/api/cards/${encodeURIComponent(payload.slug)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      setDraft(saved);
      setStatus("已儲存");
    } catch (e) {
      setStatus("儲存失敗（請檢查欄位格式，例如 website 必須是完整 URL）");
    }
  }

  const previewUrl = slug ? `/c/${encodeURIComponent(slug)}` : "";

  return (
    <div className="panel">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>編輯名片</div>
          <div className="muted" style={{ marginTop: 4 }}>
            slug：{slug || "（尚未取得）"}
          </div>
          <div className="muted" style={{ marginTop: 4 }}>
            驗證：{isVerified ? "已完成" : "未完成"}
          </div>
        </div>
        <div className="row">
          <button className="btn primary" type="button" onClick={onSave}>
            儲存
          </button>
          {previewUrl ? (
            <a className="btn" href={previewUrl} target="_blank" rel="noreferrer">
              預覽名片
            </a>
          ) : null}
        </div>
      </div>

      <div style={{ height: 12 }} />
      {status ? (
        <div className="muted" style={{ lineHeight: 1.6 }}>
          {status}
        </div>
      ) : null}

      <div style={{ height: 14 }} />

      {/* 樣板選擇器 */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
          選擇名片樣板
        </div>
        <select
          value={draft.template || "default"}
          onChange={(e) => setDraft((d) => ({ ...d, template: e.target.value }))}
          style={{
            width: "100%",
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.15)",
            color: "var(--text)",
            fontSize: 14
          }}
        >
          <option value="default">預設樣板（簡約清爽）</option>
          <option value="chatbot-tw-1">Chatbot 台灣開發者（科技風）</option>
          <option value="corporate-buzz">Corporate Buzz（專業企業）</option>
        </select>
        <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          不同樣板會有不同的視覺呈現，儲存後可在預覽頁面查看效果
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Field
          label="姓名"
          value={draft.displayName || ""}
          onChange={(v) => setDraft((d) => ({ ...d, displayName: v }))}
        />
        <Field label="職稱" value={draft.title || ""} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} />
        <Field
          label="公司"
          value={draft.company || ""}
          onChange={(v) => setDraft((d) => ({ ...d, company: v }))}
        />
        <Field
          label="電話"
          value={draft.phone || ""}
          onChange={(v) => setDraft((d) => ({ ...d, phone: v }))}
        />
        <Field
          label="Email"
          value={draft.email || ""}
          onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
        />
        <Field
          label="官網（完整 URL）"
          value={draft.website || ""}
          onChange={(v) => setDraft((d) => ({ ...d, website: v }))}
        />
        <Field
          label="官方帳號 Basic ID（例如 @mybrand）"
          value={draft.lineOaBasicId || ""}
          onChange={(v) => setDraft((d) => ({ ...d, lineOaBasicId: v }))}
        />
        <div />
        <Field
          label="Instagram URL"
          value={draft.social?.instagram || ""}
          onChange={(v) => setDraft((d) => ({ ...d, social: { ...(d.social || {}), instagram: v } }))}
        />
        <Field
          label="Facebook URL"
          value={draft.social?.facebook || ""}
          onChange={(v) => setDraft((d) => ({ ...d, social: { ...(d.social || {}), facebook: v } }))}
        />
        <Field
          label="YouTube URL"
          value={draft.social?.youtube || ""}
          onChange={(v) => setDraft((d) => ({ ...d, social: { ...(d.social || {}), youtube: v } }))}
        />
        <Field
          label="LinkedIn URL"
          value={draft.social?.linkedin || ""}
          onChange={(v) => setDraft((d) => ({ ...d, social: { ...(d.social || {}), linkedin: v } }))}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <div className="muted" style={{ fontSize: 13 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.15)",
          color: "var(--text)"
        }}
      />
    </label>
  );
}

