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

interface UserPermissions {
  canEdit: boolean;
  canCreateNew: boolean;
  maxCards: number;
  plan: string;
  status: string;
  message?: string;
  daysRemaining?: number;
}

interface CardAnalytics {
  slug: string;
  totalViews: number;
  uniqueVisitors: number;
  actions: Record<string, number>;
  viewsByDate: Array<{ date: string; views: number }>;
  topLocations: Array<{ country: string; city: string; views: number }>;
  message?: string;
}

export function AdminClient() {
  const [status, setStatus] = useState<string>("");
  const [lineUserId, setLineUserId] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [analytics, setAnalytics] = useState<CardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [idToken, setIdToken] = useState<string>("");
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
        const token = liff.getIDToken();
        if (!token) throw new Error("no_id_token");
        setIdToken(token);
        await fetchJson<{ ok: true; userId: string }>("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idToken: token })
        });
        setIsVerified(true);

        // 取得用戶權限資訊
        try {
          const userData = await fetchJson<{ user: any; permissions: UserPermissions }>("/api/users/me", {
            headers: { "Authorization": `Bearer ${idToken}` }
          });
          setUserPermissions(userData.permissions);
        } catch (e) {
          // 權限獲取失敗不阻擋主流程，但提示用戶
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to fetch user permissions:", e);
          }
          setStatus("部分功能可能受限（無法取得權限資訊）");
        }
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
        
        // 加載統計數據
        const token = liff.getIDToken();
        if (token) {
          loadAnalytics(profile.userId, token);
        }
      } catch {
        setStatus("尚未建立名片，已帶入 LINE profile（可直接儲存）");
      }
    })().catch(() => setStatus("LIFF 初始化失敗（請確認 LIFF 設定、Domain、以及 HTTPS）"));
  }, []);

  // 加載統計數據
  async function loadAnalytics(cardSlug: string, token: string) {
    setAnalyticsLoading(true);
    try {
      const data = await fetchJson<CardAnalytics>(`/api/analytics?slug=${encodeURIComponent(cardSlug)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setAnalytics(data);
    } catch (e) {
      // 統計加載失敗不影響主功能
      console.warn("Failed to load analytics:", e);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  async function onSave() {
    if (!isVerified) {
      setStatus("尚未完成身分驗證，無法儲存");
      return;
    }

    // 檢查權限
    if (userPermissions && !userPermissions.canEdit) {
      setStatus(userPermissions.message || "您的試用期已結束，請升級繼續使用");
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
    <div>
      {/* 頂部導航 */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 16, 
        marginBottom: 20,
        padding: "12px 0"
      }}>
        <a 
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--muted)",
            textDecoration: "none",
            fontSize: 14,
            transition: "color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--muted)"}
        >
          ← 返回首頁
        </a>
        <span style={{ color: "var(--muted)" }}>|</span>
        <a 
          href="/editor"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#FF6B35",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600
          }}
        >
          🎨 新版編輯器
        </a>
      </div>

      <div className="panel">
      {/* 試用狀態橫幅 */}
      {userPermissions && (userPermissions.status === 'trial' || userPermissions.status === 'expired') && (
        <div style={{
          padding: "16px 20px",
          borderRadius: 12,
          background: userPermissions.status === 'expired' 
            ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
            : userPermissions.daysRemaining && userPermissions.daysRemaining <= 3
            ? "linear-gradient(135deg, #ffd93d 0%, #ffc93d 100%)"
            : "linear-gradient(135deg, #6BCF7E 0%, #4CAF50 100%)",
          color: "#fff",
          marginBottom: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                {userPermissions.status === 'expired' ? '⚠️ 試用期已結束' : 
                 userPermissions.daysRemaining && userPermissions.daysRemaining <= 3 ? '⏰ 試用期即將結束' : 
                 '🎉 歡迎使用 360LINE'}
              </div>
              <div style={{ fontSize: 14, opacity: 0.95 }}>
                {userPermissions.message || 
                 (userPermissions.daysRemaining ? `還有 ${userPermissions.daysRemaining} 天試用時間` : '正在試用中')}
              </div>
            </div>
            {userPermissions.status === 'expired' ? (
              <a 
                href="/upgrade" 
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#ff6b6b",
                  borderRadius: 8,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 14,
                  whiteSpace: "nowrap"
                }}
              >
                立即升級
              </a>
            ) : (userPermissions.daysRemaining && userPermissions.daysRemaining <= 3) ? (
              <a 
                href="/upgrade" 
                style={{
                  padding: "10px 20px",
                  background: "rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                  border: "2px solid rgba(255,255,255,0.5)"
                }}
              >
                查看方案
              </a>
            ) : null}
          </div>
        </div>
      )}

      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>編輯名片</div>
          <div className="muted" style={{ marginTop: 4 }}>
            slug：{slug || "（尚未取得）"}
          </div>
          <div className="muted" style={{ marginTop: 4 }}>
            驗證：{isVerified ? "已完成" : "未完成"}
            {userPermissions && (
              <span style={{ marginLeft: 8, color: userPermissions.status === 'trial' ? '#ffc93d' : '#6BCF7E' }}>
                ({userPermissions.plan === 'trial' ? '試用版' : 
                  userPermissions.plan === 'pro' ? '專業版' : 
                  userPermissions.plan === 'enterprise' ? '企業版' : '免費版'})
              </span>
            )}
          </div>
        </div>
        <div className="row">
          <button 
            className="btn primary" 
            type="button" 
            onClick={onSave}
            disabled={userPermissions?.canEdit === false}
            style={{
              opacity: userPermissions?.canEdit === false ? 0.5 : 1,
              cursor: userPermissions?.canEdit === false ? 'not-allowed' : 'pointer'
            }}
          >
            {userPermissions?.canEdit === false ? '試用已結束' : '儲存'}
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

      {/* 統計儀表板 */}
      {isVerified && slug && (
        <div className="panel" style={{ marginTop: 24 }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 20 
          }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>📊 名片統計</div>
            <button
              className="btn"
              onClick={() => idToken && loadAnalytics(slug, idToken)}
              disabled={analyticsLoading}
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              {analyticsLoading ? "載入中..." : "🔄 刷新"}
            </button>
          </div>

          {analyticsLoading && !analytics ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
              載入統計資料中...
            </div>
          ) : analytics ? (
            <>
              {/* 數字概覽卡片 */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                gap: 16,
                marginBottom: 24 
              }}>
                <StatCard 
                  label="總瀏覽數" 
                  value={analytics.totalViews} 
                  icon="👁️" 
                  color="#6BCF7E" 
                />
                <StatCard 
                  label="獨立訪客" 
                  value={analytics.uniqueVisitors} 
                  icon="👤" 
                  color="#5B9BD5" 
                />
                <StatCard 
                  label="電話點擊" 
                  value={analytics.actions?.click_phone || 0} 
                  icon="📞" 
                  color="#FF6B35" 
                />
                <StatCard 
                  label="vCard 下載" 
                  value={analytics.actions?.download_vcard || 0} 
                  icon="💾" 
                  color="#9B59B6" 
                />
              </div>

              {/* 操作統計 */}
              {Object.keys(analytics.actions || {}).length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--muted)" }}>
                    互動行為分布
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(analytics.actions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([action, count]) => (
                        <ActionBar key={action} action={action} count={count} total={analytics.totalViews || 1} />
                      ))
                    }
                  </div>
                </div>
              )}

              {/* 近期瀏覽趨勢 */}
              {analytics.viewsByDate && analytics.viewsByDate.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--muted)" }}>
                    近期瀏覽趨勢（最近 7 天）
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                    {analytics.viewsByDate.slice(0, 7).reverse().map((item, idx) => {
                      const maxViews = Math.max(...analytics.viewsByDate.slice(0, 7).map(d => d.views), 1);
                      const height = (item.views / maxViews) * 60 + 20;
                      return (
                        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>{item.views}</div>
                          <div 
                            style={{ 
                              width: "100%", 
                              height, 
                              background: "linear-gradient(180deg, #6BCF7E 0%, #4CAF50 100%)",
                              borderRadius: 4 
                            }} 
                          />
                          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
                            {item.date.slice(5)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 熱門地區 */}
              {analytics.topLocations && analytics.topLocations.length > 0 && 
               analytics.topLocations[0].country !== "Unknown" && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--muted)" }}>
                    熱門地區
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {analytics.topLocations.slice(0, 5).map((loc, idx) => (
                      <div 
                        key={idx}
                        style={{
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 8,
                          fontSize: 13
                        }}
                      >
                        📍 {loc.city}, {loc.country} ({loc.views})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 無數據提示 */}
              {analytics.message && (
                <div style={{ 
                  textAlign: "center", 
                  padding: 20, 
                  color: "var(--muted)",
                  fontSize: 13,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8
                }}>
                  💡 {analytics.message}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
              尚無統計資料，分享您的名片後即可在此查看數據！
            </div>
          )}
        </div>
      )}
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

// 統計卡片組件
function StatCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: string; 
  color: string; 
}) {
  return (
    <div style={{
      padding: 16,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value.toLocaleString()}</div>
    </div>
  );
}

// 操作統計條形圖
function ActionBar({ 
  action, 
  count, 
  total 
}: { 
  action: string; 
  count: number; 
  total: number; 
}) {
  const percentage = Math.round((count / total) * 100);
  const actionLabels: Record<string, string> = {
    view: "👁️ 瀏覽",
    click_phone: "📞 電話點擊",
    click_email: "📧 Email 點擊",
    click_website: "🌐 網站點擊",
    download_vcard: "💾 下載名片",
    add_friend: "➕ 加好友",
    share: "🔗 分享"
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 100, fontSize: 13, flexShrink: 0 }}>
        {actionLabels[action] || action}
      </div>
      <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
        <div 
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6BCF7E 0%, #4CAF50 100%)",
            borderRadius: 4,
            minWidth: count > 0 ? 4 : 0
          }}
        />
      </div>
      <div style={{ width: 60, textAlign: "right", fontSize: 13, color: "var(--muted)" }}>
        {count} ({percentage}%)
      </div>
    </div>
  );
}

