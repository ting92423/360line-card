"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, User, Briefcase, Building2, Phone, Mail, Globe, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";
import type { Card } from "@/lib/types";
import { TemplateModern } from "@/components/card-templates/TemplateModern";
import { TemplateMinimal } from "@/components/card-templates/TemplateMinimal";
import { TemplateCorporate } from "@/components/card-templates/TemplateCorporate";

// 預設假資料
const DEFAULT_DATA: Partial<Card> = {
  displayName: "王小明",
  title: "資深產品經理",
  company: "科技創新有限公司",
  phone: "+886 912-345-678",
  email: "ming.wang@example.com",
  website: "https://example.com",
  social: {
    instagram: "https://instagram.com/example",
    facebook: "https://facebook.com/example",
    youtube: "https://youtube.com/@example",
    linkedin: "https://linkedin.com/in/example"
  }
};

const TEMPLATES = [
  { id: "modern", name: "Modern", component: TemplateModern },
  { id: "minimal", name: "Minimal", component: TemplateMinimal },
  { id: "corporate", name: "Corporate", component: TemplateCorporate }
];

export function EditorClient() {
  // 狀態分離：資料 vs 選中的模板
  const [cardData, setCardData] = useState<Partial<Card>>(DEFAULT_DATA);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

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

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* 手機：上預覽下表單（表單獨立滾動）；桌機：左右分割 */}
      <div className="flex h-[100dvh] flex-col lg:flex-row">
        {/* 預覽區（手機 42vh / 桌機滿高） */}
        <div className="relative shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl h-[42vh] lg:h-[100dvh] lg:w-1/2">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 lg:py-4">
              <h1 className="text-white font-bold text-lg lg:text-xl">DUO ID 編輯器</h1>
              <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                儲存
              </button>
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
                        className="w-full max-w-[280px] lg:max-w-md"
                        style={{
                          aspectRatio: "9/16",
                          maxHeight: "100%"
                        }}
                      >
                        <template.component data={cardData} />
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
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 lg:py-8 pb-20">
            {/* Template Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">選擇模板風格</h2>
                <span className="text-sm text-blue-600 font-medium">{TEMPLATES[selectedTemplateIndex].name}</span>
              </div>
              <p className="text-sm text-gray-500">左右滑動上方預覽即可切換模板（資料不會被清空）</p>
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
