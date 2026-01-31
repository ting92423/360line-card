"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Check, Lock, Crown } from "lucide-react";
import type { Card } from "@/lib/types";

// 延遲導入模板組件（之後會新增更多）
import { TemplateLecturer } from "@/components/card-templates/v2/TemplateLecturer";
import { TemplateBeauty } from "@/components/card-templates/v2/TemplateBeauty";
import { TemplateBusiness } from "@/components/card-templates/v2/TemplateBusiness";
import { TemplateInsurance } from "@/components/card-templates/v2/TemplateInsurance";
import { TemplateCommerce } from "@/components/card-templates/v2/TemplateCommerce";
import { TemplateFortune } from "@/components/card-templates/v2/TemplateFortune";

// 模板定義（前 2 個免費，其餘為 PRO）
const TEMPLATES = [
  { 
    id: "lecturer", 
    name: "講師顧問", 
    desc: "適合講師、顧問、教練",
    component: TemplateLecturer,
    color: "from-amber-500 to-orange-600",
    premium: false, // 免費
  },
  { 
    id: "insurance", 
    name: "保險金融", 
    desc: "適合保險、銀行、理財顧問",
    component: TemplateInsurance,
    color: "from-blue-600 to-indigo-700",
    premium: false, // 免費
  },
  { 
    id: "business", 
    name: "企業商務", 
    desc: "適合企業主管、業務代表",
    component: TemplateBusiness,
    color: "from-cyan-500 to-blue-600",
    premium: true, // PRO
  },
  { 
    id: "commerce", 
    name: "商務批發", 
    desc: "適合批發商、經銷商、團購",
    component: TemplateCommerce,
    color: "from-emerald-500 to-teal-600",
    premium: true, // PRO
  },
  { 
    id: "beauty", 
    name: "美業時尚", 
    desc: "適合美容、美髮、美甲",
    component: TemplateBeauty,
    color: "from-pink-500 to-rose-600",
    premium: true, // PRO
  },
  { 
    id: "fortune", 
    name: "命理風水", 
    desc: "適合命理師、風水師、塔羅",
    component: TemplateFortune,
    color: "from-red-600 to-amber-600",
    premium: true, // PRO
  },
];

// 每個模板的預設展示資料
const TEMPLATE_DEMOS: Record<string, Partial<Card>> = {
  lecturer: {
    displayName: "王小明",
    title: "企業講師 / 職涯顧問",
    company: "DUO Academy",
    phone: "+886 912-345-678",
    email: "ming.wang@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_1.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 912-345-678", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@duoacademy", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "15年企業培訓經驗，擅長將複雜知識轉化為實用技能，協助超過 500 間企業提升團隊效能。" },
      services: { 
        headline: "課程服務", 
        items: [
          { name: "領導力培訓", description: "提升管理效能" },
          { name: "團隊建設工作坊", description: "強化團隊凝聚力" },
          { name: "一對一教練諮詢", description: "個人化指導" },
          { name: "企業內訓客製化", description: "量身打造課程" }
        ] 
      },
      portfolio: { headline: "授課剪影", images: [] }
    },
  },
  insurance: {
    displayName: "陳千禾",
    title: "資深業務主任",
    company: "新光人壽",
    phone: "+886 923-456-789",
    email: "chen.qianhe@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_2.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 923-456-789", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@shinkongins", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "從業 8 年，已服務超過 300 個家庭的保障規劃，113年保額王全國第3名。用專業守護您的幸福人生。" },
      services: { 
        headline: "專業服務", 
        items: [
          { name: "生涯財務規劃", description: "全方位財務健診" },
          { name: "保險保障規劃", description: "完善風險保障" },
          { name: "財務管理規劃", description: "資產配置建議" },
          { name: "退休金規劃", description: "退休無憂方案" }
        ] 
      },
      portfolio: { headline: "服務照片", images: [] }
    },
  },
  business: {
    displayName: "林志豪",
    title: "業務總監",
    company: "科技創新股份有限公司",
    phone: "+886 934-567-890",
    email: "howard.lin@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_3.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 934-567-890", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@techcorp", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "專注於企業數位轉型解決方案，協助客戶提升營運效率與競爭力。" },
      services: { 
        headline: "解決方案", 
        items: [
          { name: "企業數位轉型", description: "全方位數位化策略" },
          { name: "雲端系統整合", description: "無縫雲端解決方案" },
          { name: "客製化開發", description: "量身打造系統" },
          { name: "技術顧問諮詢", description: "專業技術支援" }
        ] 
      },
      portfolio: { headline: "成功案例", images: [] }
    },
  },
  commerce: {
    displayName: "陳美君",
    title: "總經理",
    company: "君圓國際有限公司",
    phone: "+886 945-678-901",
    email: "mei.chen@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_4.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 945-678-901", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@junyuan", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "專營進口商品批發，提供低於市場價格的優質商品，萬種商品天天上新。" },
      services: { 
        headline: "服務項目", 
        items: [
          { name: "團購批發", description: "量大優惠" },
          { name: "市場百貨批發", description: "多樣化選擇" },
          { name: "娃娃機店批發", description: "熱門商品供應" },
          { name: "品牌代理商", description: "正品保證" }
        ] 
      },
      portfolio: { headline: "商品展示", images: [] }
    },
  },
  beauty: {
    displayName: "張雅琪",
    title: "美容總監",
    company: "LUXE Beauty Studio",
    phone: "+886 956-789-012",
    email: "yachi.zhang@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_5.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 956-789-012", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@luxebeauty", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "10年美業經驗，專精韓式半永久妝容、皮膚管理，讓每位顧客展現最美的自己。" },
      services: { 
        headline: "服務項目", 
        items: [
          { name: "韓式半永久", description: "自然持久妝容" },
          { name: "皮膚管理", description: "專業護膚療程" },
          { name: "美甲美睫", description: "精緻美學設計" },
          { name: "新娘造型", description: "婚禮全套服務" }
        ] 
      },
      portfolio: { headline: "作品集", images: [] }
    },
  },
  fortune: {
    displayName: "方智福",
    title: "命理老師",
    company: "妙福堂學術中心",
    phone: "+886 967-890-123",
    email: "master.fang@example.com",
    avatarUrl: "/pic/LINE_ALBUM_專業形象照_251215_6.jpg",
    ctas: [
      { id: "cta_tel", type: "tel", label: "電話", value: "+886 967-890-123", enabled: true },
      { id: "cta_line", type: "line", label: "LINE", value: "@miaofu", enabled: true },
      { id: "cta_share", type: "share", label: "分享", enabled: true },
    ],
    pages: {
      about: { bio: "愛言學會講師、易理學會理事、清微道宗法師，專研姓名學、紫微斗數、風水堪輿三十餘年。" },
      services: { 
        headline: "服務項目", 
        items: [
          { name: "姓名鑑定", description: "命名改名諮詢" },
          { name: "卜卦棋卦", description: "解答疑難" },
          { name: "旺宅佈局", description: "風水調整" },
          { name: "紫微斗數", description: "命盤分析" },
          { name: "安神/退神", description: "神明服務" },
          { name: "對年合爐", description: "祭祀儀式" }
        ] 
      },
      portfolio: { headline: "活動照片", images: [] }
    },
  },
};

export function TemplatesClient() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedPage, setSelectedPage] = useState<"profile" | "services" | "gallery">("profile");

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSelectedPage("profile"); // 切換模板時重置頁面
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", onSelect);
      onSelect();
    }
  }, [emblaApi, onSelect]);

  const currentTemplate = TEMPLATES[selectedIndex];
  const currentDemo = TEMPLATE_DEMOS[currentTemplate.id];

  const handleSelectTemplate = () => {
    router.push(`/editor?template=${currentTemplate.id}`);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">選擇模板風格</h1>
            <p className="text-sm text-white/60 mt-1">左右滑動瀏覽，找到最適合您的風格</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-white/60 hover:text-white text-sm"
          >
            返回
          </button>
        </div>
      </div>

      {/* Template Info Bar */}
      <div className="px-4 py-3 flex items-center justify-between bg-black/30">
        <div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${currentTemplate.color} text-white text-sm font-semibold`}>
              {currentTemplate.name}
            </div>
            {currentTemplate.premium && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold">
                <Crown size={12} />
                PRO
              </div>
            )}
          </div>
          <p className="text-white/50 text-xs mt-1">{currentTemplate.desc}</p>
        </div>
        <div className="text-white/40 text-sm">
          {selectedIndex + 1} / {TEMPLATES.length}
        </div>
      </div>

      {/* Page Switcher */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          {(["profile", "services", "gallery"] as const).map((page) => (
            <button
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPage === page
                  ? "bg-white/15 text-white border border-white/20"
                  : "bg-white/5 text-white/50 border border-white/10"
              }`}
            >
              {page === "profile" ? "關於我" : page === "services" ? "服務項目" : "作品集"}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative flex-1 px-2">
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="上一個模板"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {TEMPLATES.map((template, index) => {
              const TemplateComponent = template.component;
              const demoData = TEMPLATE_DEMOS[template.id];
              
              return (
                <div
                  key={template.id}
                  className="flex-[0_0_85%] min-w-0 px-2 py-4"
                >
                  <div
                    className={`mx-auto transition-all duration-300 relative ${
                      index === selectedIndex ? "scale-100 opacity-100" : "scale-90 opacity-50"
                    }`}
                    style={{ maxWidth: "360px", aspectRatio: "9/16" }}
                  >
                    <TemplateComponent
                      data={demoData}
                      page={selectedPage}
                      shareUrl="#"
                      onShare={() => {}}
                    />
                    {/* PRO 模板遮罩 */}
                    {template.premium && (
                      <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center pointer-events-none">
                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold shadow-lg">
                          <Crown size={12} />
                          PRO
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="下一個模板"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="flex justify-center gap-2 py-4">
          {TEMPLATES.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex ? "bg-white w-6" : "bg-white/30 w-2"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-6 px-4">
        {currentTemplate.premium ? (
          <>
            <button
              onClick={() => router.push("/upgrade")}
              className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <Lock size={20} />
              升級 PRO 解鎖此模板
            </button>
            <p className="text-center text-white/40 text-xs mt-3">
              升級專業版即可使用所有 PRO 模板
            </p>
          </>
        ) : (
          <>
            <button
              onClick={handleSelectTemplate}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r ${currentTemplate.color} text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]`}
            >
              <Check size={20} />
              選用「{currentTemplate.name}」模板
            </button>
            <p className="text-center text-white/40 text-xs mt-3">
              選擇後可隨時在編輯器中切換其他模板
            </p>
          </>
        )}
      </div>
    </div>
  );
}
