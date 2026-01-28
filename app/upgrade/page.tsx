/**
 * 升級頁面 - 方案選擇與付費
 */

"use client";

export default function UpgradePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        {/* 標題區 */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: "var(--text)" }}>
            選擇適合您的方案
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 600, margin: "0 auto" }}>
            從體驗到專業，從個人到企業，360LINE 為您提供最靈活的解決方案
          </p>
        </div>

        {/* 方案卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 30,
          marginBottom: 60
        }}>
          {/* 體驗版 */}
          <div className="panel" style={{ 
            padding: 30,
            border: "2px solid rgba(107, 207, 126, 0.3)",
            position: "relative"
          }}>
            <div style={{ 
              position: "absolute",
              top: 20,
              right: 20,
              background: "linear-gradient(135deg, #6BCF7E 0%, #4CAF50 100%)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              免費試用
            </div>
            
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>體驗版</div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>
              NT$0
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>7天完整體驗</div>
            
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 30 }}>
              {[
                "✅ 基本名片功能",
                "✅ 3種精美樣板",
                "✅ 無限分享",
                "✅ 基礎統計",
                "⏰ 過期後只能查看"
              ].map((feature, i) => (
                <li key={i} style={{ marginBottom: 12, fontSize: 14, color: "var(--text)" }}>
                  {feature}
                </li>
              ))}
            </ul>

            <a 
              href="/admin"
              className="btn primary"
              style={{ 
                width: "100%", 
                textAlign: "center", 
                display: "block",
                textDecoration: "none"
              }}
            >
              立即體驗
            </a>
          </div>

          {/* 專業版 */}
          <div className="panel" style={{ 
            padding: 30,
            border: "3px solid #FF6B35",
            position: "relative",
            transform: "scale(1.05)",
            boxShadow: "0 8px 30px rgba(255, 107, 53, 0.3)"
          }}>
            <div style={{ 
              position: "absolute",
              top: 20,
              right: 20,
              background: "linear-gradient(135deg, #FF6B35 0%, #ee5a52 100%)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              最熱門
            </div>
            
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>專業版</div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: "#FF6B35" }}>
              NT$199
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>每月 / 年付 1,990 元</div>
            
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 30 }}>
              {[
                "✅ 10張名片",
                "✅ 10+精美樣板",
                "✅ 詳細統計分析",
                "✅ 自訂短網址",
                "✅ vCard批量匯出",
                "✅ 優先客服支援"
              ].map((feature, i) => (
                <li key={i} style={{ marginBottom: 12, fontSize: 14, color: "var(--text)" }}>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className="btn primary"
              style={{ 
                width: "100%",
                background: "linear-gradient(135deg, #FF6B35 0%, #ee5a52 100%)",
                border: "none"
              }}
              onClick={() => alert("金流整合開發中，敬請期待！")}
            >
              立即升級
            </button>
          </div>

          {/* 企業版 */}
          <div className="panel" style={{ 
            padding: 30,
            border: "2px solid rgba(74, 90, 255, 0.3)"
          }}>
            <div style={{ 
              position: "absolute",
              top: 20,
              right: 20,
              background: "linear-gradient(135deg, #4A5AFF 0%, #3d4ae5 100%)",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              企業優選
            </div>
            
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>企業版</div>
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, color: "#4A5AFF" }}>
              NT$99
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>每人每月 / 最少5人</div>
            
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 30 }}>
              {[
                "✅ 無限名片",
                "✅ 所有樣板",
                "✅ 品牌客製化",
                "✅ 子網域設定",
                "✅ CRM系統整合",
                "✅ 專屬客服與培訓"
              ].map((feature, i) => (
                <li key={i} style={{ marginBottom: 12, fontSize: 14, color: "var(--text)" }}>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className="btn"
              style={{ 
                width: "100%",
                background: "linear-gradient(135deg, #4A5AFF 0%, #3d4ae5 100%)",
                color: "#fff",
                border: "none"
              }}
              onClick={() => alert("請聯繫我們的業務團隊：sales@360line.com")}
            >
              聯繫業務
            </button>
          </div>
        </div>

        {/* FAQ 區 */}
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 30, textAlign: "center", color: "var(--text)" }}>
            常見問題
          </h2>

          <div className="panel" style={{ padding: 30 }}>
            {[
              {
                q: "試用期結束後會怎樣？",
                a: "試用期結束後，您的名片仍可供他人查看，但您無法編輯或建立新名片。升級後即可恢復所有功能。"
              },
              {
                q: "可以隨時取消訂閱嗎？",
                a: "可以！您可以隨時取消訂閱，取消後會在當前訂閱期結束後生效，不會立即停止服務。"
              },
              {
                q: "企業版如何計費？",
                a: "企業版以員工數量計費，最少5人起訂。每增加1人按月加收 NT$99，無上限。"
              },
              {
                q: "是否提供發票？",
                a: "是的，我們為所有付費用戶提供電子發票，企業用戶可申請三聯式發票。"
              },
              {
                q: "資料會保留多久？",
                a: "即使試用期結束或取消訂閱，您的資料會永久保留。重新訂閱後即可立即恢復編輯。"
              }
            ].map((faq, i) => (
              <div key={i} style={{ marginBottom: i < 4 ? 30 : 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  {faq.a}
                </div>
                {i < 4 && <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", marginTop: 20 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* CTA 區 */}
        <div style={{ 
          textAlign: "center", 
          marginTop: 60, 
          padding: "60px 40px",
          background: "linear-gradient(135deg, #6BCF7E 0%, #4CAF50 100%)",
          borderRadius: 20,
          color: "#fff"
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            還在猶豫？先試試看！
          </h2>
          <p style={{ fontSize: 18, marginBottom: 30, opacity: 0.95 }}>
            7天完整體驗，無需信用卡，隨時可以升級
          </p>
          <a 
            href="/admin"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              background: "#fff",
              color: "#4CAF50",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            立即開始體驗 →
          </a>
        </div>
      </div>
    </main>
  );
}
