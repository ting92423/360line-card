"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, User, Briefcase, Building2, Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import type { Card } from "@/lib/types";
import { TemplateLecturer } from "@/components/card-templates/v2/TemplateLecturer";
import { TemplateBeauty } from "@/components/card-templates/v2/TemplateBeauty";
import { TemplateBusiness } from "@/components/card-templates/v2/TemplateBusiness";

// 預設假資料（含 CTA / 多頁）
const DEFAULT_DATA: Partial<Card> = {
  displayName: "王小明",
  title: "講師 / 顧問",
  company: "DUO Academy",
  phone: "+886 912-345-678",
  email: "ming.wang@example.com",
  website: "https://example.com",
  ctas: [
    { id: "cta_tel", type: "tel", label: "電話", value: "+886 912-345-678", enabled: true },
    { id: "cta_line", type: "line", label: "LINE", value: "@mybrand", enabled: true },
    { id: "cta_share", type: "share", label: "分享", enabled: true },
    { id: "cta_map", type: "map", label: "地圖", value: "台北市信義區", enabled: true }
  ],
  pages: {
    profile: { bio: "擅長把複雜內容講到你聽懂，讓學員能立刻上手。" },
    services: { headline: "課程 / 服務", items: ["公開班課程", "企業內訓", "一對一諮詢"] },
    gallery: { headline: "授課剪影", images: [] }
  },
  social: {
    instagram: "https://instagram.com/example",
    facebook: "https://facebook.com/example",
    youtube: "https://youtube.com/@example",
    linkedin: "https://linkedin.com/in/example"
  }
};

const TEMPLATES = [
  { id: "lecturer", name: "講師", component: TemplateLecturer },
  { id: "beauty", name: "美業", component: TemplateBeauty },
  { id: "business", name: "企業", component: TemplateBusiness }
];

export function EditorClient() {
  // 狀態分離：資料 vs 選中的模板
  const [cardData, setCardData] = useState<Partial<Card>>(DEFAULT_DATA);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [selectedPage, setSelectedPage] = useState<"profile" | "services" | "gallery">("profile");

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // 監聽 carousel 變化
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedTemplateIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // 訂閱 carousel events
  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', onSelect);
      onSelect(); // 初始化
    }
  }, [emblaApi, onSelect]);

  const updateField = <K extends keyof Card>(field: K, value: Card[K]) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (platform: keyof NonNullable<Card['social']>, value: string) => {
    setCardData(prev => ({
      ...prev,
      social: { ...prev.social, [platform]: value }
    }));
  };

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/c/" + encodeURIComponent(cardData.slug || "demo")
      : "https://line360-card.vercel.app";

  async function onShare() {
    const url = shareUrl;
    const title = `${cardData.displayName || "DUO ID"} 的數位名片`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // ignore
    }
    try {
      await navigator.clipboard.writeText(url);
      // 簡化：先用 alert，之後可換成 toast
      alert("已複製連結");
    } catch {
      alert(url);
    }
  }

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* 手機：全頁名片預覽，下滑才看到表單；桌機：左右分割 */}
      <div className="lg:flex lg:h-[100dvh]">
        {/* 預覽區（手機滿屏 / 桌機滿高） */}
        <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl h-[100dvh] lg:h-[100dvh] lg:w-1/2 lg:sticky lg:top-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 lg:py-4">
              <div className="min-w-0">
                <h1 className="text-white font-bold text-lg lg:text-xl truncate">DUO ID 編輯器</h1>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPlan("free")}
                    className={`text-xs px-2 py-1 rounded-lg border ${
                      plan === "free" ? "bg-white/15 text-white border-white/20" : "bg-transparent text-white/60 border-white/10"
                    }`}
                  >
                    Free（1頁）
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlan("pro")}
                    className={`text-xs px-2 py-1 rounded-lg border ${
                      plan === "pro" ? "bg-amber-500/25 text-amber-100 border-amber-300/30" : "bg-transparent text-white/60 border-white/10"
                    }`}
                  >
                    Pro（3頁）
                  </button>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                儲存
              </button>
            </div>

            {/* Page Switcher */}
            <div className="px-4 pt-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPage("profile")}
                  className={`h-9 rounded-xl text-xs font-semibold border ${
                    selectedPage === "profile"
                      ? "bg-white/15 text-white border-white/20"
                      : "bg-transparent text-white/70 border-white/10"
                  }`}
                >
                  第1頁（名片）
                </button>
                <button
                  type="button"
                  onClick={() => (plan === "pro" ? setSelectedPage("services") : undefined)}
                  className={`h-9 rounded-xl text-xs font-semibold border ${
                    selectedPage === "services"
                      ? "bg-white/15 text-white border-white/20"
                      : "bg-transparent text-white/70 border-white/10"
                  } ${plan === "pro" ? "" : "opacity-50"}`}
                  title={plan === "pro" ? "第2頁" : "Pro 才能使用第2頁"}
                >
                  第2頁（服務）
                </button>
                <button
                  type="button"
                  onClick={() => (plan === "pro" ? setSelectedPage("gallery") : undefined)}
                  className={`h-9 rounded-xl text-xs font-semibold border ${
                    selectedPage === "gallery"
                      ? "bg-white/15 text-white border-white/20"
                      : "bg-transparent text-white/70 border-white/10"
                  } ${plan === "pro" ? "" : "opacity-50"}`}
                  title={plan === "pro" ? "第3頁" : "Pro 才能使用第3頁"}
                >
                  第3頁（相簿）
                </button>
              </div>
              {plan !== "pro" ? (
                <div className="mt-2 text-[11px] text-white/60">提示：Free 只開放第1頁；升級 Pro 可使用第2/3頁</div>
              ) : null}
            </div>

            {/* Carousel */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 py-4 lg:px-4">
              <button
                onClick={scrollPrev}
                className="absolute left-2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous template"
                type="button"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="w-full h-full overflow-hidden flex items-center justify-center" ref={emblaRef}>
                <div className="flex h-full">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="flex-[0_0_100%] min-w-0 px-3 lg:px-4 h-full flex items-center justify-center"
                    >
                      <div
                        className="h-full w-auto max-w-[86vw] lg:w-full lg:max-w-md"
                        style={{
                          aspectRatio: "9/16"
                        }}
                      >
                        <template.component data={cardData} page={selectedPage} shareUrl={shareUrl} onShare={onShare} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollNext}
                className="absolute right-2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next template"
                type="button"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {TEMPLATES.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === selectedTemplateIndex ? "bg-white w-6" : "bg-white/40 w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 編輯區（獨立滾動，保持預覽永遠可見） */}
        <div className="bg-gray-50 lg:flex-1 lg:h-[100dvh] lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:py-8 pb-20">
            {/* Template Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">選擇模板風格</h2>
                <span className="text-sm text-blue-600 font-medium">{TEMPLATES[selectedTemplateIndex].name}</span>
              </div>
              <p className="text-sm text-gray-500">左右滑動上方預覽即可切換模板（資料不會被清空）</p>
            </div>

            {/* CTA Bar Editor */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-gray-900">CTA 快捷列</h2>
                <div className="text-xs text-gray-500">可排序/可開關</div>
              </div>
              <div className="mt-3 space-y-3">
                {(cardData.ctas || []).map((cta, idx) => (
                  <div key={cta.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900">
                        {cta.label || (cta.type === "tel" ? "電話" : cta.type === "line" ? "LINE" : cta.type === "share" ? "分享" : "地圖")}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600"
                          onClick={() => {
                            const next = [...(cardData.ctas || [])];
                            if (idx <= 0) return;
                            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                            setCardData((p) => ({ ...p, ctas: next }));
                          }}
                          aria-label="上移"
                          title="上移"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600"
                          onClick={() => {
                            const next = [...(cardData.ctas || [])];
                            if (idx >= next.length - 1) return;
                            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                            setCardData((p) => ({ ...p, ctas: next }));
                          }}
                          aria-label="下移"
                          title="下移"
                        >
                          ↓
                        </button>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={cta.enabled !== false}
                            onChange={(e) => {
                              const next = [...(cardData.ctas || [])];
                              next[idx] = { ...next[idx], enabled: e.target.checked };
                              setCardData((p) => ({ ...p, ctas: next }));
                            }}
                          />
                          啟用
                        </label>
                      </div>
                    </div>
                    {cta.type !== "share" ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={cta.value || ""}
                          onChange={(e) => {
                            const next = [...(cardData.ctas || [])];
                            next[idx] = { ...next[idx], value: e.target.value };
                            setCardData((p) => ({ ...p, ctas: next }));
                          }}
                          placeholder={cta.type === "tel" ? "電話，例如 +886 912-345-678" : cta.type === "line" ? "LINE 連結或 @basicId" : "Google Maps URL 或地址"}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-gray-500">分享會使用 Web Share API（不支援時改為複製連結）</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                基本資訊
              </h2>

              <div className="space-y-4">
                <InputField
                  label="姓名"
                  placeholder="王小明"
                  value={cardData.displayName || ""}
                  onChange={(v) => updateField("displayName", v)}
                  icon={<User size={16} />}
                />

                <InputField
                  label="職稱"
                  placeholder="資深產品經理"
                  value={cardData.title || ""}
                  onChange={(v) => updateField("title", v)}
                  icon={<Briefcase size={16} />}
                />

                <InputField
                  label="公司"
                  placeholder="科技創新有限公司"
                  value={cardData.company || ""}
                  onChange={(v) => updateField("company", v)}
                  icon={<Building2 size={16} />}
                />
              </div>
            </div>

            {/* Contact Info Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone size={18} className="text-green-600" />
                聯絡方式
              </h2>

              <div className="space-y-4">
                <InputField
                  label="電話"
                  placeholder="+886 912-345-678"
                  value={cardData.phone || ""}
                  onChange={(v) => updateField("phone", v)}
                  icon={<Phone size={16} />}
                />

                <InputField
                  label="Email"
                  placeholder="your@example.com"
                  value={cardData.email || ""}
                  onChange={(v) => updateField("email", v)}
                  icon={<Mail size={16} />}
                />

                <InputField
                  label="網站"
                  placeholder="https://example.com"
                  value={cardData.website || ""}
                  onChange={(v) => updateField("website", v)}
                  icon={<Globe size={16} />}
                />
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Instagram size={18} className="text-pink-600" />
                社群媒體
              </h2>

              <div className="space-y-4">
                <InputField
                  label="Instagram"
                  placeholder="https://instagram.com/yourname"
                  value={cardData.social?.instagram || ""}
                  onChange={(v) => updateSocial("instagram", v)}
                  icon={<Instagram size={16} />}
                />

                <InputField
                  label="Facebook"
                  placeholder="https://facebook.com/yourname"
                  value={cardData.social?.facebook || ""}
                  onChange={(v) => updateSocial("facebook", v)}
                  icon={<Facebook size={16} />}
                />

                <InputField
                  label="YouTube"
                  placeholder="https://youtube.com/@yourname"
                  value={cardData.social?.youtube || ""}
                  onChange={(v) => updateSocial("youtube", v)}
                  icon={<Youtube size={16} />}
                />

                <InputField
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/yourname"
                  value={cardData.social?.linkedin || ""}
                  onChange={(v) => updateSocial("linkedin", v)}
                  icon={<Linkedin size={16} />}
                />
              </div>
            </div>

            {/* Debug Info（之後可拿掉） */}
            <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-700">
              <p>
                <strong>當前模板：</strong> {TEMPLATES[selectedTemplateIndex].name}
              </p>
              <p className="mt-1">
                <strong>姓名：</strong> {cardData.displayName || "(未填寫)"}
              </p>
              <p className="mt-1 text-gray-500">切換模板時，資料會保留（CardData 與 SelectedTemplate 分離）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  icon
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
        />
      </div>
    </div>
  );
}
