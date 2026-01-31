/**
 * 升級頁面 - 方案選擇與付費
 */

"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, Clock, Mail, Send, Loader2 } from "lucide-react";

export default function UpgradePage() {
  const [showProContact, setShowProContact] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleProContact = () => {
    setShowProContact(true);
    setSubmitSuccess(false);
  };
  
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模擬提交（實際應發送到後端或郵件服務）
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 發送 mailto
    const subject = encodeURIComponent(`[DUO ID 升級諮詢] ${contactForm.name}`);
    const body = encodeURIComponent(
      `姓名：${contactForm.name}\n` +
      `Email：${contactForm.email}\n` +
      `電話：${contactForm.phone}\n\n` +
      `訊息：\n${contactForm.message}`
    );
    window.open(`mailto:sales@360line.com?subject=${subject}&body=${body}`, "_blank");
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* 專業版諮詢表單 Modal */}
      {showProContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {submitSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">已收到您的資料</h3>
                <p className="text-gray-600 mb-6">
                  我們會在 1-2 個工作日內與您聯繫<br/>
                  感謝您對 DUO ID 專業版的興趣！
                </p>
                <button
                  onClick={() => { setShowProContact(false); setContactForm({ name: "", email: "", phone: "", message: "" }); }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl"
                >
                  關閉
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">升級諮詢</h3>
                  <p className="text-gray-600 text-sm">
                    留下您的聯絡方式，我們會盡快與您聯繫！
                  </p>
                </div>
                
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="您的姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">電話（選填）</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      placeholder="0912-345-678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                      placeholder="有任何問題或需求都可以告訴我們"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProContact(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          送出中...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          送出諮詢
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 聯繫業務 Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">聯繫業務團隊</h3>
            <p className="text-gray-600 mb-6">
              感謝您對企業方案的興趣！<br/>
              請透過以下方式聯繫我們的業務團隊。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">📧 Email：</span>
                <a href="mailto:sales@360line.com" className="text-blue-600">sales@360line.com</a>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">💬 LINE：</span>
                <a href="https://lin.ee/xxxxx" className="text-green-600">@360line</a>
              </p>
            </div>
            <button
              onClick={() => setShowContact(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        {/* 返回按鈕 */}
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>返回首頁</span>
        </a>

        {/* 標題區 */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: "var(--text)" }}>
            選擇適合您的方案
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", maxWidth: 600, margin: "0 auto" }}>
            從體驗到專業，從個人到企業，DUO ID 為您提供最靈活的解決方案
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
                "✅ 完整名片功能",
                "✅ 2款免費模板",
                "✅ 無限分享次數",
                "✅ 基礎統計分析",
                "🎁 7天後可升級恢復編輯"
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
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 4, color: "#FF6B35" }}>
              NT$199<span style={{ fontSize: 18, fontWeight: 500 }}>/月</span>
            </div>
            <div style={{ fontSize: 14, color: "#4CAF50", fontWeight: 600, marginBottom: 4 }}>
              年繳 NT$1,990 省 NT$398！
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>（約 NT$166/月）</div>
            
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
              onClick={handleProContact}
            >
              諮詢升級
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
            <div style={{ fontSize: 48, fontWeight: 800, marginBottom: 4, color: "#4A5AFF" }}>
              NT$99<span style={{ fontSize: 18, fontWeight: 500 }}>/人/月</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>
              最低 NT$495/月（5人起）
            </div>
            <div style={{ fontSize: 12, color: "#4CAF50", fontWeight: 600, marginBottom: 24 }}>
              人數越多越划算！
            </div>
            
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
              onClick={() => setShowContact(true)}
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
