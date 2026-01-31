"use client";

import type { Card } from "@/lib/types";
import { useEffect, useState } from "react";
import { getLiff } from "@/lib/liff";
import { 
  Phone, Mail, Globe, MapPin, Share2, UserPlus,
  Instagram, Facebook, Youtube, Linkedin, MessageCircle,
  Download, Home, Edit, FileText, Sparkles, Award, User,
  Briefcase, Building2, Package, Image, Clock, ExternalLink
} from "lucide-react";

// 風格配置（與編輯器一致）
const CARD_STYLES: Record<string, {
  name: string;
  bgColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  buttonStyle: "rounded" | "square";
}> = {
  style1: {
    name: "經典商務",
    bgColor: "#FEF9E7",
    primaryColor: "#F5B7B1",
    secondaryColor: "#FADBD8",
    textColor: "#2C3E50",
    buttonStyle: "rounded",
  },
  style2: {
    name: "自然清新",
    bgColor: "#1E8449",
    primaryColor: "#ABEBC6",
    secondaryColor: "#82E0AA",
    textColor: "#FFFFFF",
    buttonStyle: "rounded",
  },
  style3: {
    name: "簡約白",
    bgColor: "#FFFFFF",
    primaryColor: "#C4FF61",
    secondaryColor: "#EAEDED",
    textColor: "#2C3E50",
    buttonStyle: "square",
  },
  style4: {
    name: "漸層時尚",
    bgColor: "gradient-blue-pink",
    primaryColor: "#FFFFFF",
    secondaryColor: "#F8F9F9",
    textColor: "#FFFFFF",
    buttonStyle: "rounded",
  },
  style5: {
    name: "商務專業",
    bgColor: "#F4B942",
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    textColor: "#2C3E50",
    buttonStyle: "rounded",
  },
  style6: {
    name: "美業時尚",
    bgColor: "#FDF2F8",
    primaryColor: "#EC4899",
    secondaryColor: "#F9A8D4",
    textColor: "#831843",
    buttonStyle: "rounded",
  },
  default: {
    name: "預設",
    bgColor: "#F4B942",
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    textColor: "#2C3E50",
    buttonStyle: "rounded",
  },
};

function buildOaAddFriendUrl(basicId: string) {
  const cleaned = basicId.replace(/^@/, "");
  return `https://line.me/R/ti/p/@${encodeURIComponent(cleaned)}`;
}

// 獲取背景樣式
function getBgStyle(bgColor: string): React.CSSProperties {
  if (bgColor === "gradient-blue-pink") {
    return { background: "linear-gradient(180deg, #5DADE2 0%, #AF7AC5 50%, #F1948A 100%)" };
  }
  return { backgroundColor: bgColor };
}

export function CardPageClient({ slug, card }: { slug: string; card: Card }) {
  const [status, setStatus] = useState<string>("");
  const [isInLine, setIsInLine] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activePage, setActivePage] = useState<"card" | "about" | "services" | "portfolio" | "company">("card");
  const [avatarError, setAvatarError] = useState(false); // 頭像載入失敗

  // 獲取風格
  const styleId = card.template || "default";
  const style = CARD_STYLES[styleId] || CARD_STYLES.default;

  // 檢查各頁面是否有內容
  const hasAboutContent = !!(
    card.pages?.about?.bio ||
    (card.pages?.about?.tags && card.pages.about.tags.length > 0) ||
    (card.pages?.about?.experiences && card.pages.about.experiences.length > 0) ||
    card.pages?.about?.motto
  );

  const hasServicesContent = !!(
    card.pages?.services?.headline ||
    (card.pages?.services?.items && card.pages.services.items.length > 0) ||
    card.pages?.services?.bookingUrl
  );

  const hasPortfolioContent = !!(
    card.pages?.portfolio?.headline ||
    (card.pages?.portfolio?.images && card.pages.portfolio.images.length > 0) ||
    (card.pages?.portfolio?.testimonials && card.pages.portfolio.testimonials.length > 0)
  );

  const hasCompanyContent = !!(
    card.pages?.company?.name ||
    card.pages?.company?.description ||
    card.pages?.company?.address ||
    card.pages?.company?.businessHours
  );

  // 計算可用頁面
  const availablePages = [
    { id: "card" as const, label: "名片", icon: User, show: true },
    { id: "about" as const, label: "關於我", icon: FileText, show: hasAboutContent },
    { id: "services" as const, label: "服務項目", icon: Briefcase, show: hasServicesContent },
    { id: "portfolio" as const, label: "作品集", icon: Image, show: hasPortfolioContent },
    { id: "company" as const, label: "公司介紹", icon: Building2, show: hasCompanyContent },
  ].filter(page => page.show);

  const hasMultiplePages = availablePages.length > 1;

  useEffect(() => {
    // 檢查是否在 LINE 內 & 是否為擁有者
    getLiff().then(async (liff) => {
      if (liff && liff.isInClient()) {
        setIsInLine(true);
      }
      
      // 檢查是否為名片擁有者
      if (liff && liff.isLoggedIn()) {
        try {
          const profile = await liff.getProfile();
          if (profile.userId && card.ownerLineUserId === profile.userId) {
            setIsOwner(true);
          }
        } catch {
          // 忽略錯誤
        }
      }
    }).catch(() => {
      // 忽略 LIFF 錯誤
    });

    // 記錄瀏覽事件
    try {
      const payload = JSON.stringify({ type: "card_view", slug });
      navigator.sendBeacon?.("/api/events", payload);
    } catch {
      // ignore
    }
  }, [slug, card.ownerLineUserId]);

  // 分享名片
  async function onShare() {
    setStatus("");
    const shareUrl = window.location.href;
    
    try {
      const liff = await getLiff();
      
      // 檢查是否在 LINE 內且 shareTargetPicker API 可用
      if (liff && liff.isInClient() && liff.isApiAvailable?.('shareTargetPicker')) {
        try {
          navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "card_click_share", slug }));
        } catch {}

        const result = await liff.shareTargetPicker([{
          type: "text",
          text: `${card.displayName} 的數位名片\n${shareUrl}`,
        }]) as { status?: string } | undefined;
        
        // 檢查分享結果（shareTargetPicker 返回值類型為 void 或 undefined）
        // 實際上 LINE LIFF 不一定回傳 status，所以用 optional chaining
        if (result?.status === 'success') {
          setStatus("已送出分享");
        } else {
          // 預設認為分享成功（LINE 未取消就是成功）
          setStatus("已送出分享");
        }
        return;
      }

      // 非 LINE 環境或 API 不可用
      if (navigator.share) {
        await navigator.share({
          title: `${card.displayName} 的數位名片`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("已複製連結");
      }
    } catch (e) {
      // 降級處理
      try {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("已複製連結");
      } catch {
        setStatus("分享失敗，請手動複製網址");
      }
    }
  }

  // 加 LINE 好友
  function onAddFriend() {
    const basicId = card.lineOaBasicId || process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || "";
    if (!basicId) {
      setStatus("尚未設定 LINE 官方帳號");
      return;
    }
    try {
      navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "card_click_add_friend", slug }));
    } catch {}
    const url = buildOaAddFriendUrl(basicId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // 下載 vCard
  function onDownloadVCard() {
    try {
      navigator.sendBeacon?.("/api/events", JSON.stringify({ type: "card_click_vcard", slug }));
    } catch {}
    window.location.href = `/api/vcard/${encodeURIComponent(slug)}`;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 名片主體 */}
        <div 
          className="rounded-3xl shadow-2xl overflow-hidden"
          style={getBgStyle(style.bgColor)}
        >
          <div className="p-8">
            {/* 頭像區 */}
            <div className="flex justify-center mb-6">
              <div 
                className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden"
                style={{ borderColor: style.primaryColor, borderWidth: "4px" }}
              >
                {card.avatarUrl && !avatarError ? (
                  <img 
                    src={card.avatarUrl} 
                    alt={card.displayName} 
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-4xl font-bold"
                    style={{ color: style.textColor, backgroundColor: style.secondaryColor }}
                  >
                    {card.displayName?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            </div>

            {/* 姓名 & 職稱 */}
            <div className="text-center mb-6">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: style.textColor }}
              >
                {card.displayName}
              </h1>
              {card.title && (
                <p 
                  className="text-lg"
                  style={{ color: style.textColor, opacity: 0.8 }}
                >
                  {card.title}
                </p>
              )}
              {card.company && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: style.textColor, opacity: 0.6 }}
                >
                  {card.company}
                </p>
              )}
              {/* 標語 */}
              {card.pages?.about?.tagline && (
                <p 
                  className="text-sm mt-3 italic"
                  style={{ color: style.textColor, opacity: 0.7 }}
                >
                  「{card.pages.about.tagline}」
                </p>
              )}
            </div>

            {/* 社群媒體圖示 */}
            {(card.social?.instagram || card.social?.facebook || card.social?.youtube || card.social?.linkedin) && (
              <div className="flex justify-center gap-4 mb-6">
                {card.social?.instagram && (
                  <a
                    href={card.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: style.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      color: style.textColor 
                    }}
                  >
                    <Instagram size={20} />
                  </a>
                )}
                {card.social?.facebook && (
                  <a
                    href={card.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: style.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      color: style.textColor 
                    }}
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {card.social?.youtube && (
                  <a
                    href={card.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: style.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      color: style.textColor 
                    }}
                  >
                    <Youtube size={20} />
                  </a>
                )}
                {card.social?.linkedin && (
                  <a
                    href={card.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: style.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                      color: style.textColor 
                    }}
                  >
                    <Linkedin size={20} />
                  </a>
                )}
              </div>
            )}

            {/* 聯絡按鈕 */}
            <div className="space-y-3">
              {card.phone && (
                <a
                  href={`tel:${card.phone.replace(/\s+/g, "")}`}
                  className={`w-full py-4 text-center font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
                    style.buttonStyle === "rounded" ? "rounded-full" : "rounded-xl"
                  }`}
                  style={{ 
                    backgroundColor: style.primaryColor,
                    color: style.bgColor.includes("gradient") || style.bgColor === "#1E8449" ? style.textColor : "#FFFFFF"
                  }}
                >
                  <Phone size={20} />
                  {card.phone}
                </a>
              )}
              
              {card.email && (
                <a
                  href={`mailto:${card.email}`}
                  className={`w-full py-4 text-center font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
                    style.buttonStyle === "rounded" ? "rounded-full" : "rounded-xl"
                  }`}
                  style={{ backgroundColor: style.secondaryColor, color: style.textColor }}
                >
                  <Mail size={20} />
                  發送郵件
                </a>
              )}
              
              {card.website && (
                <a
                  href={card.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-4 text-center font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
                    style.buttonStyle === "rounded" ? "rounded-full" : "rounded-xl"
                  }`}
                  style={{ backgroundColor: style.secondaryColor, color: style.textColor }}
                >
                  <Globe size={20} />
                  前往網站
                </a>
              )}
              
              {/* 地址 */}
              {card.pages?.about?.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(card.pages.about.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 text-center text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${
                    style.buttonStyle === "rounded" ? "rounded-full" : "rounded-xl"
                  }`}
                  style={{ backgroundColor: style.textColor === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.05)", color: style.textColor }}
                >
                  <MapPin size={16} />
                  {card.pages.about.address}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 操作按鈕區 */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={onAddFriend}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-[#06C755] text-white rounded-2xl hover:bg-[#05b34c] transition-colors"
          >
            <UserPlus size={24} />
            <span className="text-xs font-medium">加 LINE</span>
          </button>
          
          <button
            onClick={onDownloadVCard}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={24} />
            <span className="text-xs font-medium">儲存聯絡人</span>
          </button>
          
          <button
            onClick={onShare}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Share2 size={24} />
            <span className="text-xs font-medium">分享名片</span>
          </button>
        </div>

        {/* 狀態訊息 */}
        {status && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 bg-white rounded-lg py-2 px-4 inline-block shadow-sm">
              {status}
            </p>
          </div>
        )}

        {/* 頁面切換 Tab - 有多個頁面時顯示 */}
        {hasMultiplePages && (
          <div className="mt-6 bg-white rounded-xl p-1 shadow-sm">
            <div className={`grid gap-1 ${availablePages.length <= 3 ? `grid-cols-${availablePages.length}` : 'grid-cols-3'}`} style={{ gridTemplateColumns: `repeat(${Math.min(availablePages.length, 3)}, 1fr)` }}>
              {availablePages.slice(0, 3).map((page) => {
                const IconComponent = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id)}
                    className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      activePage === page.id
                        ? "bg-amber-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent size={14} />
                    {page.label}
                  </button>
                );
              })}
            </div>
            {/* 第二行（如果有超過 3 個頁面） */}
            {availablePages.length > 3 && (
              <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: `repeat(${availablePages.length - 3}, 1fr)` }}>
                {availablePages.slice(3).map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page.id)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        activePage === page.id
                          ? "bg-amber-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent size={14} />
                      {page.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 關於我頁面 */}
        {activePage === "about" && hasAboutContent && (
          <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* 個人簡介 */}
            {card.pages?.about?.bio && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText size={14} />
                  關於我
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {card.pages.about.bio}
                </p>
              </div>
            )}

            {/* 專長標籤 */}
            {card.pages?.about?.tags && card.pages.about.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={14} />
                  專長領域
                </h3>
                <div className="flex flex-wrap gap-2">
                  {card.pages.about.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 經歷資歷 */}
            {card.pages?.about?.experiences && card.pages.about.experiences.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award size={14} />
                  經歷資歷
                </h3>
                <div className="space-y-3">
                  {card.pages.about.experiences.map((exp, index) => (
                    <div key={index} className="border-l-2 border-amber-400 pl-4">
                      <p className="font-medium text-gray-900">{exp.title}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 座右銘 */}
            {card.pages?.about?.motto && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-center italic text-gray-700">
                  「{card.pages.about.motto}」
                </p>
              </div>
            )}
          </div>
        )}

        {/* 服務項目頁面 */}
        {activePage === "services" && hasServicesContent && (
          <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* 標題 */}
            {card.pages?.services?.headline && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {card.pages.services.headline}
                </h2>
              </div>
            )}

            {/* 服務列表 */}
            {card.pages?.services?.items && card.pages.services.items.length > 0 && (
              <div className="space-y-4">
                {card.pages.services.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.price && (
                          <span className="text-amber-600 font-medium text-sm">{item.price}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 預約連結 */}
            {card.pages?.services?.bookingUrl && (
              <a
                href={card.pages.services.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
              >
                <ExternalLink size={18} />
                立即預約
              </a>
            )}

            {/* 常見問題 */}
            {card.pages?.services?.faqs && card.pages.services.faqs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  常見問題
                </h3>
                <div className="space-y-3">
                  {card.pages.services.faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900 mb-2">Q: {faq.question}</p>
                      <p className="text-sm text-gray-600">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 作品集頁面 */}
        {activePage === "portfolio" && hasPortfolioContent && (
          <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* 標題 */}
            {card.pages?.portfolio?.headline && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {card.pages.portfolio.headline}
                </h2>
              </div>
            )}

            {/* 圖片牆 */}
            {card.pages?.portfolio?.images && card.pages.portfolio.images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {card.pages.portfolio.images.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`作品 ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 客戶見證 */}
            {card.pages?.portfolio?.testimonials && card.pages.portfolio.testimonials.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={14} />
                  客戶見證
                </h3>
                <div className="space-y-4">
                  {card.pages.portfolio.testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-gray-700 italic mb-3">「{testimonial.content}」</p>
                      <div className="flex items-center gap-3">
                        {testimonial.avatar ? (
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                            <span className="text-amber-800 font-medium">
                              {testimonial.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{testimonial.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 公司介紹頁面 */}
        {activePage === "company" && hasCompanyContent && (
          <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm space-y-6">
            {/* 公司標誌與名稱 */}
            <div className="text-center">
              {card.pages?.company?.logo && (
                <img 
                  src={card.pages.company.logo} 
                  alt={card.pages.company.name || "公司標誌"}
                  className="h-20 mx-auto mb-4 object-contain"
                />
              )}
              {card.pages?.company?.name && (
                <h2 className="text-xl font-bold text-gray-900">
                  {card.pages.company.name}
                </h2>
              )}
            </div>

            {/* 公司簡介 */}
            {card.pages?.company?.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 size={14} />
                  公司簡介
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {card.pages.company.description}
                </p>
              </div>
            )}

            {/* 營業時間 */}
            {card.pages?.company?.businessHours && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  營業時間
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {card.pages.company.businessHours}
                </p>
              </div>
            )}

            {/* 地址 */}
            {card.pages?.company?.address && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin size={14} />
                  公司地址
                </h3>
                <p className="text-gray-700 mb-3">{card.pages.company.address}</p>
                {card.pages.company.mapUrl ? (
                  <a
                    href={card.pages.company.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <MapPin size={16} />
                    在地圖上查看
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.pages.company.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <MapPin size={16} />
                    在地圖上查看
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 擁有者編輯按鈕 */}
        {isOwner && (
          <div className="mt-6">
            <a
              href={`/editor?slug=${encodeURIComponent(slug)}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
            >
              <Edit size={18} />
              編輯這張名片
            </a>
          </div>
        )}

        {/* 品牌標誌與導航 */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold">DUO ID</span>
          </p>
          
          {/* 導航連結 */}
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home size={14} />
              首頁
            </a>
            {!isOwner && (
              <a
                href="/editor"
                className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                <Edit size={14} />
                建立我的名片
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 保留舊的 CardActions 以防有其他地方使用
export function CardActions({ slug, card }: { slug: string; card: Card }) {
  return <CardPageClient slug={slug} card={card} />;
}
