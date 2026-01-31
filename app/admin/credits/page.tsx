"use client";

import { useState, useEffect } from "react";

interface PendingTopup {
  id: string;
  lineUserId: string;
  amount: number;
  description: string;
  metadata?: {
    transferAmount?: number;
    transferLast5?: string;
  };
  createdAt: string;
}

export default function AdminCreditsPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [pendingTopups, setPendingTopups] = useState<PendingTopup[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 手動加點表單
  const [grantUserId, setGrantUserId] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantNote, setGrantNote] = useState("");

  const fetchPendingTopups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/credits/admin", {
        headers: { "x-admin-secret": adminSecret },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setPendingTopups(data.pendingTopups || []);
      setIsAuthed(true);
    } catch {
      setMessage("驗證失敗，請檢查 Admin Secret");
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmTopup = async (transactionId: string) => {
    const note = prompt("確認備註（可選）：");
    try {
      const res = await fetch("/api/credits/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          action: "confirm",
          transactionId,
          note,
        }),
      });
      const result = await res.json();
      setMessage(result.message || "操作完成");
      fetchPendingTopups();
    } catch (error) {
      setMessage("操作失敗");
    }
  };

  const grantCredits = async () => {
    if (!grantUserId || !grantAmount) {
      setMessage("請填寫用戶 ID 和點數");
      return;
    }
    try {
      const res = await fetch("/api/credits/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          action: "grant",
          lineUserId: grantUserId,
          amount: parseInt(grantAmount),
          note: grantNote || "管理員手動加點",
        }),
      });
      const result = await res.json();
      setMessage(result.message || "操作完成");
      setGrantUserId("");
      setGrantAmount("");
      setGrantNote("");
    } catch (error) {
      setMessage("操作失敗");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 20 }}>🔐 點數管理後台</h1>

      {!isAuthed ? (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Admin Secret:
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                marginTop: 4,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
              placeholder="輸入 ADMIN_SECRET 環境變數的值"
            />
          </label>
          <button
            onClick={fetchPendingTopups}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {loading ? "驗證中..." : "登入"}
          </button>
        </div>
      ) : (
        <>
          {/* 待確認儲值 */}
          <div
            style={{
              background: "#f9f9f9",
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>📋 待確認儲值請求 ({pendingTopups.length})</h2>
            <button
              onClick={fetchPendingTopups}
              style={{
                padding: "8px 16px",
                background: "#2196F3",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 16,
              }}
            >
              重新整理
            </button>

            {pendingTopups.length === 0 ? (
              <p style={{ color: "#666" }}>目前沒有待確認的儲值請求</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th style={{ padding: 10, textAlign: "left" }}>用戶 ID</th>
                    <th style={{ padding: 10, textAlign: "left" }}>方案</th>
                    <th style={{ padding: 10, textAlign: "left" }}>金額</th>
                    <th style={{ padding: 10, textAlign: "left" }}>帳號末5碼</th>
                    <th style={{ padding: 10, textAlign: "left" }}>時間</th>
                    <th style={{ padding: 10, textAlign: "left" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTopups.map((topup) => (
                    <tr key={topup.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 10, fontSize: 12 }}>
                        {topup.lineUserId.substring(0, 10)}...
                      </td>
                      <td style={{ padding: 10 }}>{topup.amount} 點</td>
                      <td style={{ padding: 10 }}>
                        NT${topup.metadata?.transferAmount || "-"}
                      </td>
                      <td style={{ padding: 10, fontWeight: "bold" }}>
                        {topup.metadata?.transferLast5 || "-"}
                      </td>
                      <td style={{ padding: 10, fontSize: 12 }}>
                        {new Date(topup.createdAt).toLocaleString("zh-TW")}
                      </td>
                      <td style={{ padding: 10 }}>
                        <button
                          onClick={() => confirmTopup(topup.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#4CAF50",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          確認加點
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 手動加點 */}
          <div
            style={{
              background: "#fff3e0",
              padding: 20,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <h2 style={{ marginBottom: 16 }}>➕ 手動加點</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <label>
                用戶 LINE User ID:
                <input
                  type="text"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 4,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                  placeholder="U1234567890abcdef..."
                />
              </label>
              <label>
                加點數量:
                <input
                  type="number"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 4,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                  placeholder="50"
                />
              </label>
              <label>
                備註:
                <input
                  type="text"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 4,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                  placeholder="活動贈點、補償等"
                />
              </label>
              <button
                onClick={grantCredits}
                style={{
                  padding: "12px 24px",
                  background: "#FF9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                確認加點
              </button>
            </div>
          </div>
        </>
      )}

      {/* 訊息提示 */}
      {message && (
        <div
          style={{
            padding: 12,
            background: message.includes("失敗") ? "#ffebee" : "#e8f5e9",
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
