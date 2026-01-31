"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, Briefcase, Building2, Phone, Mail, Globe, MapPin,
  Instagram, Facebook, Youtube, Linkedin, MessageCircle,
  Share2, ChevronLeft, ChevronRight, Check, Sparkles, Loader2, LogIn,
  Home, ArrowLeft, AlertCircle, X, FileText, Plus, Trash2,
  Download, UserPlus, Award, // 預覽區新增
  Wand2, Coins, CreditCard, // AI 智能填寫
  Lock, Crown // PRO 模板權限
} from "lucide-react";
import { getLiff, getLiffError } from "@/lib/liff";
import type { Card } from "@/lib/types";

// 條件式日誌（只在開發環境輸出）
const isDev = process.env.NODE_ENV === "development";
const log = (...args: unknown[]) => isDev && console.log(...args);
const logError = (...args: unknown[]) => isDev && console.error(...args);

// 六款名片風格配置（與 Webhook Flex Message 一致）
const CARD_STYLES = [
  {
    id: "style1",
    name: "經典商務",
    bgColor: "#FEF9E7",
    primaryColor: "#F5B7B1",
    secondaryColor: "#FADBD8",
    textColor: "#2C3E50",
    buttonStyle: "rounded" as const,
  },
  {
    id: "style2",
    name: "自然清新",
    bgColor: "#1E8449",
    primaryColor: "#ABEBC6",
    secondaryColor: "#82E0AA",
    textColor: "#FFFFFF",
    buttonStyle: "rounded" as const,
  },
  {
    id: "style3",
    name: "簡約白",
    bgColor: "#FFFFFF",
    primaryColor: "#C4FF61",
    secondaryColor: "#EAEDED",
    textColor: "#2C3E50",
    buttonStyle: "square" as const,
  },
  {
    id: "style4",
    name: "漸層時尚",
    bgColor: "gradient-blue-pink",
    primaryColor: "#FFFFFF",
    secondaryColor: "#F8F9F9",
    textColor: "#FFFFFF",
    buttonStyle: "rounded" as const,
  },
  {
    id: "style5",
    name: "商務專業",
    bgColor: "#F4B942",
    primaryColor: "#2C3E50",
    secondaryColor: "#34495E",
    textColor: "#2C3E50",
    buttonStyle: "rounded" as const,
  },
  {
    id: "style6",
    name: "美業時尚",
    bgColor: "#FDF2F8",
    primaryColor: "#EC4899",
    secondaryColor: "#F9A8D4",
    textColor: "#831843",
    buttonStyle: "rounded" as const,
  },
];

// 生成唯一 slug
function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 經歷項目
interface Experience {
  title: string;
  description: string;
}

// 服務項目
interface ServiceItem {
  name: string;
  description: string;
  price: string;
}

// 常見問題
interface FaqItem {
  question: string;
  answer: string;
}

// 客戶見證
interface Testimonial {
  name: string;
  content: string;
  avatar?: string;
}

// 編輯器數據（對應 Card 類型）
interface EditorData {
  displayName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
  };
  // 額外欄位（存在 template metadata）
  tagline: string;
  address: string;
  lineId: string;
  styleId: string;
  // 關於我頁面
  about: {
    bio: string;
    tags: string[];
    experiences: Experience[];
    motto: string;
  };
  // 服務項目頁面
  services: {
    headline: string;
    items: ServiceItem[];
    bookingUrl: string;
    faqs: FaqItem[];
  };
  // 作品集頁面
  portfolio: {
    headline: string;
    images: string[];
    testimonials: Testimonial[];
  };
  // 公司介紹頁面
  companyInfo: {
    name: string;
    logo: string;
    description: string;
    businessHours: string;
    address: string;
    mapUrl: string;
  };
}

const DEFAULT_DATA: EditorData = {
  displayName: "",
  title: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  },
  tagline: "",
  address: "",
  lineId: "",
  styleId: "style5",
  about: {
    bio: "",
    tags: [],
    experiences: [],
    motto: "",
  },
  services: {
    headline: "",
    items: [],
    bookingUrl: "",
    faqs: [],
  },
  portfolio: {
    headline: "",
    images: [],
    testimonials: [],
  },
  companyInfo: {
    name: "",
    logo: "",
    description: "",
    businessHours: "",
    address: "",
    mapUrl: "",
  },
};

// 模板名稱到風格 ID 映射（模板選擇頁使用的名稱 → 編輯器風格 ID）
const TEMPLATE_TO_STYLE: Record<string, string> = {
  lecturer: "style5",
  insurance: "style1",
  business: "style4",
  commerce: "style2",
  beauty: "style6",
  fortune: "style3",
};

// PRO 風格 ID（需要升級才能使用）
const PRO_STYLES = new Set(["style2", "style3", "style4", "style6"]);
const FREE_STYLES = new Set(["style1", "style5"]);

// 檢查風格是否為 PRO
const isProStyle = (styleId: string) => PRO_STYLES.has(styleId);

export function EditorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 從 URL 取得風格參數（支援 style 和 template 兩種參數）
  const templateParam = searchParams.get("template");
  const styleParam = searchParams.get("style");
  
  // 計算初始風格（如果是 PRO 風格則降級為免費風格）
  const requestedStyle = styleParam || (templateParam && TEMPLATE_TO_STYLE[templateParam]) || "style5";
  const initialStyle = PRO_STYLES.has(requestedStyle) ? "style5" : requestedStyle; // PRO 風格降級為免費
  const initialIndex = Math.max(0, CARD_STYLES.findIndex((s) => s.id === initialStyle));
  const existingSlug = searchParams.get("slug"); // 編輯既有名片

  // 狀態
  const [cardData, setCardData] = useState<EditorData>({ ...DEFAULT_DATA, styleId: initialStyle });
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "social" | "about" | "services" | "portfolio" | "company">("basic");
  const [previewPage, setPreviewPage] = useState<"card" | "about" | "services" | "portfolio" | "company">("card"); // 預覽頁面切換
  
  // LIFF 狀態
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{ userId: string; displayName: string; pictureUrl?: string } | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  
  // 操作狀態
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessUrl, setSaveSuccessUrl] = useState<string | null>(null); // 儲存成功後的名片 URL
  const [cardSlug, setCardSlug] = useState<string>(existingSlug || "");
  const [linkCopied, setLinkCopied] = useState(false); // 連結已複製狀態
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 追蹤未保存的變更
  
  // AI 智能填寫狀態
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiInput, setAiInput] = useState({ profession: '', expertise: '', impression: '' });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [showTopupDialog, setShowTopupDialog] = useState(false);
  const [selectedTopupPlan, setSelectedTopupPlan] = useState<number | null>(null);
  const [topupLast5, setTopupLast5] = useState("");
  const [isTopupSubmitting, setIsTopupSubmitting] = useState(false);
  const [topupPlans, setTopupPlans] = useState<Array<{points: number; price: number; bonus: number; label: string}>>([
    { points: 100, price: 100, bonus: 0, label: '100 點' },
    { points: 300, price: 250, bonus: 50, label: '300 點（加贈 50 點）' },
    { points: 600, price: 450, bonus: 150, label: '600 點（加贈 150 點）' },
  ]);
  const [bankInfo, setBankInfo] = useState({
    bankName: '載入中...',
    bankCode: '---',
    accountNumber: '載入中...',
    accountName: '載入中...',
  });
  const [showAiSuccess, setShowAiSuccess] = useState(false); // AI 生成成功提示
  
  // 試用期狀態
  const [trialInfo, setTrialInfo] = useState<{
    status: string;
    daysLeft?: number;
    message?: string;
  } | null>(null);

  const currentStyle = CARD_STYLES[selectedStyleIndex];

  // 初始化 LIFF
  useEffect(() => {
    async function initLiff() {
      try {
        log("[Editor] Starting LIFF init...");
        const liff = await getLiff();
        
        if (!liff) {
          const error = getLiffError();
          const errorMsg = error?.message || "LIFF 初始化失敗";
          logError("[Editor] LIFF is null, error:", errorMsg);
          setLiffError(errorMsg);
          setIsLoading(false);
          return;
        }

        log("[Editor] LIFF ready, isLoggedIn:", liff.isLoggedIn());
        setIsLiffReady(true);

        // 檢查是否已登入
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);
          try {
            const profile = await liff.getProfile();
            setUserProfile({
              userId: profile.userId,
              displayName: profile.displayName,
              pictureUrl: profile.pictureUrl,
            });

            // 如果有用戶名稱，預填到表單
            if (profile.displayName && !cardData.displayName) {
              setCardData(prev => ({ ...prev, displayName: profile.displayName }));
            }

            // 檢查用戶權限（試用期/訂閱狀態）
            try {
              const idToken = liff.getIDToken();
              if (idToken) {
                // 驗證並建立 session
                await fetch("/api/auth/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idToken }),
                });
                
                // 獲取用戶權限資訊
                const userRes = await fetch("/api/users/me", {
                  headers: { "Authorization": `Bearer ${idToken}` },
                });
                if (userRes.ok) {
                  const userData = await userRes.json();
                  if (userData.permissions) {
                    setTrialInfo({
                      status: userData.permissions.status,
                      daysLeft: userData.permissions.daysLeft,
                      message: userData.permissions.message,
                    });
                  }
                }
                
                // 獲取用戶 AI 點數和儲值方案（Session 會自動驗證）
                const creditsRes = await fetch(`/api/credits`);
                if (creditsRes.ok) {
                  const creditsData = await creditsRes.json();
                  setUserCredits(creditsData.balance);
                  // 更新儲值方案和銀行資訊
                  if (creditsData.topupPlans) {
                    setTopupPlans(creditsData.topupPlans);
                  }
                  if (creditsData.bankInfo) {
                    setBankInfo(creditsData.bankInfo);
                  }
                }
              }
            } catch (authErr) {
              logError("[Editor] Auth verify error:", authErr);
            }
          } catch (profileErr) {
            logError("[Editor] Failed to get profile:", profileErr);
          }

          // 如果有既有 slug，載入名片資料
          if (existingSlug) {
            await loadExistingCard(existingSlug);
          }
        } else if (liff.isInClient()) {
          // 在 LINE 內但未登入，自動觸發登入
          log("[Editor] In LINE client but not logged in, triggering login...");
          liff.login({ redirectUri: window.location.href });
          return;
        }

        setIsLoading(false);
      } catch (err) {
        logError("[Editor] LIFF init error:", err);
        const errorMsg = err instanceof Error ? err.message : "LIFF 初始化錯誤";
        setLiffError(errorMsg);
        setIsLoading(false);
      }
    }

    initLiff();
  }, [existingSlug]);

  // 離開頁面前提醒用戶保存變更
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "您有未保存的變更，確定要離開嗎？";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 載入既有名片
  async function loadExistingCard(slug: string) {
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const card: Card = await res.json();
        setCardData({
          displayName: card.displayName || "",
          title: card.title || "",
          company: card.company || "",
          phone: card.phone || "",
          email: card.email || "",
          website: card.website || "",
          social: {
            instagram: card.social?.instagram || "",
            facebook: card.social?.facebook || "",
            youtube: card.social?.youtube || "",
            linkedin: card.social?.linkedin || "",
          },
          tagline: card.pages?.about?.tagline || "",
          address: card.pages?.about?.address || "",
          lineId: card.lineOaBasicId || "",
          styleId: card.template || "style5",
          // 載入關於我資料
          about: {
            bio: card.pages?.about?.bio || "",
            tags: card.pages?.about?.tags || [],
            experiences: card.pages?.about?.experiences?.map(e => ({
              title: e.title || "",
              description: e.description || "",
            })) || [],
            motto: card.pages?.about?.motto || "",
          },
          // 載入服務項目
          services: {
            headline: card.pages?.services?.headline || "",
            items: card.pages?.services?.items?.map(i => ({
              name: i.name || "",
              description: i.description || "",
              price: i.price || "",
            })) || [],
            bookingUrl: card.pages?.services?.bookingUrl || "",
            faqs: card.pages?.services?.faqs?.map(f => ({
              question: f.question || "",
              answer: f.answer || "",
            })) || [],
          },
          // 載入作品集
          portfolio: {
            headline: card.pages?.portfolio?.headline || "",
            images: card.pages?.portfolio?.images || [],
            testimonials: card.pages?.portfolio?.testimonials?.map(t => ({
              name: t.name || "",
              content: t.content || "",
              avatar: t.avatar || "",
            })) || [],
          },
          // 載入公司介紹
          companyInfo: {
            name: card.pages?.company?.name || "",
            logo: card.pages?.company?.logo || "",
            description: card.pages?.company?.description || "",
            businessHours: card.pages?.company?.businessHours || "",
            address: card.pages?.company?.address || "",
            mapUrl: card.pages?.company?.mapUrl || "",
          },
        });
        // 設定風格
        const styleIdx = CARD_STYLES.findIndex(s => s.id === card.template);
        if (styleIdx >= 0) setSelectedStyleIndex(styleIdx);
      }
    } catch (err) {
      logError("Failed to load card:", err);
    }
  }

  // LIFF 登入
  async function handleLogin() {
    try {
      const liff = await getLiff();
      if (liff && !liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
      }
    } catch (err) {
      logError("Login error:", err);
    }
  }

  // 更新欄位（同時標記為有未保存變更）
  const updateField = (field: keyof EditorData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const updateSocial = (platform: keyof EditorData["social"], value: string) => {
    setCardData((prev) => ({
      ...prev,
      social: { ...prev.social, [platform]: value },
    }));
    setHasUnsavedChanges(true);
  };

  // 切換風格（包含 PRO 權限檢查）
  const canUseStyle = (styleId: string) => {
    // TODO: 未來可根據用戶訂閱狀態判斷
    // 目前只允許使用免費風格
    return FREE_STYLES.has(styleId);
  };

  const prevStyle = () => {
    const newIndex = selectedStyleIndex > 0 ? selectedStyleIndex - 1 : CARD_STYLES.length - 1;
    const newStyleId = CARD_STYLES[newIndex].id;
    
    if (isProStyle(newStyleId)) {
      setSaveError("🔒 此風格為 PRO 專屬，請升級後使用");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    
    setSelectedStyleIndex(newIndex);
    setCardData(prev => ({ ...prev, styleId: newStyleId }));
  };

  const nextStyle = () => {
    const newIndex = selectedStyleIndex < CARD_STYLES.length - 1 ? selectedStyleIndex + 1 : 0;
    const newStyleId = CARD_STYLES[newIndex].id;
    
    if (isProStyle(newStyleId)) {
      setSaveError("🔒 此風格為 PRO 專屬，請升級後使用");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    
    setSelectedStyleIndex(newIndex);
    setCardData(prev => ({ ...prev, styleId: newStyleId }));
  };

  // AI 智能生成處理
  const handleAiGenerate = async () => {
    if (!userProfile) {
      setAiError("請先登入");
      return;
    }

    if (!aiInput.profession || !aiInput.expertise || !aiInput.impression) {
      setAiError("請填寫完整資訊");
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession: aiInput.profession,
          expertise: aiInput.expertise,
          impression: aiInput.impression,
          displayName: cardData.displayName || userProfile.displayName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // 點數不足
          setAiError(result.message || "點數不足，請先儲值");
          return;
        }
        throw new Error(result.error || "生成失敗");
      }

      // 填入生成的內容
      const { data, credits } = result;
      setCardData(prev => ({
        ...prev,
        tagline: data.tagline || prev.tagline,
        about: {
          ...prev.about,
          bio: data.bio || prev.about.bio,
          tags: data.tags || prev.about.tags,
          motto: data.motto || prev.about.motto,
        }
      }));

      // 更新點數餘額
      setUserCredits(credits.balance);
      setHasUnsavedChanges(true);

      // 關閉對話框並重置輸入
      setShowAiDialog(false);
      setAiInput({ profession: '', expertise: '', impression: '' });
      
      // 顯示成功提示
      setShowAiSuccess(true);
      setTimeout(() => setShowAiSuccess(false), 3000);

    } catch (error) {
      console.error("AI generate error:", error);
      setAiError(error instanceof Error ? error.message : "生成失敗，請稍後再試");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // 儲值請求送出處理
  const handleTopupSubmit = async () => {
    if (selectedTopupPlan === null || topupLast5.length !== 5) {
      return;
    }

    setIsTopupSubmitting(true);

    try {
      const response = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineUserId: userProfile?.userId,
          planIndex: selectedTopupPlan,
          transferLast5: topupLast5,
          displayName: userProfile?.displayName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "儲值請求失敗");
      }

      // 關閉對話框並重置狀態
      setShowTopupDialog(false);
      setSelectedTopupPlan(null);
      setTopupLast5("");
      
      // 顯示成功訊息（使用 saveError 的位置顯示成功訊息）
      setSaveError(`✅ 儲值請求已送出！方案：${result.plan}，金額：NT$${result.amount}。請等待管理員確認。`);
      setTimeout(() => setSaveError(null), 5000);

    } catch (error) {
      console.error("Topup request error:", error);
      setSaveError(error instanceof Error ? error.message : "儲值請求失敗，請稍後再試");
    } finally {
      setIsTopupSubmitting(false);
    }
  };

  // 儲存名片
  const handleSave = async () => {
    if (!isLoggedIn || !userProfile) {
      setSaveError("請先登入");
      return;
    }

    if (!cardData.displayName.trim()) {
      setSaveError("請輸入姓名");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // 生成或使用既有 slug
      const slug = cardSlug || generateSlug();
      
      // 構建 Card 物件
      const cardPayload: Partial<Card> = {
        slug,
        displayName: cardData.displayName.trim(),
        title: cardData.title.trim() || undefined,
        company: cardData.company.trim() || undefined,
        phone: cardData.phone.trim() || undefined,
        email: cardData.email.trim() || undefined,
        website: cardData.website.trim() || undefined,
        lineOaBasicId: cardData.lineId.trim() || undefined,
        template: CARD_STYLES[selectedStyleIndex].id,
        social: {
          instagram: cardData.social.instagram.trim() || undefined,
          facebook: cardData.social.facebook.trim() || undefined,
          youtube: cardData.social.youtube.trim() || undefined,
          linkedin: cardData.social.linkedin.trim() || undefined,
        },
        // 多頁內容
        pages: {
          about: {
            bio: cardData.about.bio.trim() || undefined,
            tags: cardData.about.tags.length > 0 ? cardData.about.tags : undefined,
            experiences: cardData.about.experiences.filter(e => e.title.trim()).map(e => ({
              title: e.title.trim(),
              description: e.description.trim() || undefined,
            })),
            motto: cardData.about.motto.trim() || undefined,
            tagline: cardData.tagline.trim() || undefined,
            address: cardData.address.trim() || undefined,
          },
          services: {
            headline: cardData.services.headline.trim() || undefined,
            items: cardData.services.items.filter(i => i.name.trim()).map(i => ({
              name: i.name.trim(),
              description: i.description.trim() || undefined,
              price: i.price.trim() || undefined,
            })),
            bookingUrl: cardData.services.bookingUrl.trim() || undefined,
            faqs: cardData.services.faqs.filter(f => f.question.trim() && f.answer.trim()).map(f => ({
              question: f.question.trim(),
              answer: f.answer.trim(),
            })),
          },
          portfolio: {
            headline: cardData.portfolio.headline.trim() || undefined,
            images: cardData.portfolio.images.filter(url => url.trim()),
            testimonials: cardData.portfolio.testimonials.filter(t => t.name.trim() && t.content.trim()).map(t => ({
              name: t.name.trim(),
              content: t.content.trim(),
              avatar: t.avatar?.trim() || undefined,
            })),
          },
          company: {
            name: cardData.companyInfo.name.trim() || undefined,
            logo: cardData.companyInfo.logo.trim() || undefined,
            description: cardData.companyInfo.description.trim() || undefined,
            businessHours: cardData.companyInfo.businessHours.trim() || undefined,
            address: cardData.companyInfo.address.trim() || undefined,
            mapUrl: cardData.companyInfo.mapUrl.trim() || undefined,
          },
        },
      };

      const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // 處理付費牆錯誤
        if (err.error === "subscription_expired") {
          setSaveError(err.message || "您的方案已過期，請升級以繼續使用");
          if (err.upgradeUrl) {
            setTimeout(() => router.push(err.upgradeUrl), 2000);
          }
          return;
        }
        if (err.error === "max_cards_reached") {
          setSaveError(err.message || "已達名片數量上限，請升級以建立更多名片");
          if (err.upgradeUrl) {
            setTimeout(() => router.push(err.upgradeUrl), 2000);
          }
          return;
        }
        throw new Error(err.message || err.error || "儲存失敗");
      }

      const savedCard = await res.json();
      setCardSlug(savedCard.slug);

      // 顯示成功彈窗（含名片連結）
      const cardUrl = `${window.location.origin}/c/${savedCard.slug}`;
      setSaveSuccessUrl(cardUrl);
      setLinkCopied(false); // 重置複製狀態
      setHasUnsavedChanges(false); // 重置未保存狀態
    } catch (err) {
      logError("Save error:", err);
      setSaveError(err instanceof Error ? err.message : "儲存失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  // 分享名片
  const handleShare = async () => {
    if (!cardSlug) {
      setSaveError("請先儲存名片");
      return;
    }

    const shareUrl = `${window.location.origin}/c/${cardSlug}`;
    
    try {
      const liff = await getLiff();
      
      // 檢查是否在 LINE 內且 API 可用
      if (liff && liff.isInClient() && liff.isApiAvailable?.('shareTargetPicker')) {
        await liff.shareTargetPicker([{
          type: "text",
          text: `${cardData.displayName} 的數位名片\n${shareUrl}`,
        }]);
        // shareTargetPicker 正常完成即為成功
        return;
      }
      
      // 非 LINE 環境
      if (navigator.share) {
        await navigator.share({
          title: `${cardData.displayName} 的數位名片`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSaveError(null);
        alert("已複製連結！");
      }
    } catch (err) {
      // 降級為複製
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("已複製連結！");
      } catch {
        setSaveError("分享失敗，請手動複製網址：" + shareUrl);
      }
    }
  };

  // 獲取背景樣式
  const getBgStyle = (bgColor: string) => {
    if (bgColor === "gradient-blue-pink") {
      return { background: "linear-gradient(180deg, #5DADE2 0%, #AF7AC5 50%, #F1948A 100%)" };
    }
    return { backgroundColor: bgColor };
  };

  // 載入中畫面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60">載入編輯器...</p>
        </div>
      </div>
    );
  }

  // 未登入畫面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          {/* 返回首頁按鈕 */}
          <a 
            href="/"
            className="absolute top-4 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">返回首頁</span>
          </a>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">DUO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">DUO ID 名片編輯器</h1>
          <p className="text-gray-500 mb-6">請使用 LINE 登入以建立您的專屬數位名片</p>
          
          {liffError ? (
            <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle size={20} />
                <p className="font-medium">初始化錯誤</p>
              </div>
              <p className="text-sm">{liffError}</p>
              <p className="text-sm mt-3 font-medium">請確認：</p>
              <ul className="text-sm mt-1 text-left list-disc list-inside">
                <li>在 LINE App 中開啟此頁面</li>
                <li>LIFF Endpoint URL 已正確設定</li>
                <li>LIFF ID 已在環境變數中設定</li>
              </ul>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                >
                  重新載入
                </button>
                <a
                  href="/"
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Home size={14} />
                  首頁
                </a>
              </div>
            </div>
          ) : isLiffReady ? (
            <>
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-[#06C755] text-white font-medium rounded-xl hover:bg-[#05b34c] transition-colors flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                使用 LINE 登入
              </button>
              <a
                href="/"
                className="mt-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Home size={14} />
                返回首頁
              </a>
            </>
          ) : (
            <div className="text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">正在初始化...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 計算橫幅高度（有橫幅時需要調整頂部間距）
  const showTrialBanner = trialInfo && (trialInfo.status === 'trial' || trialInfo.status === 'expired');
  const bannerHeight = showTrialBanner ? 'pt-12' : '';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 試用期提示橫幅 */}
      {showTrialBanner && (
        <div className={`fixed top-0 left-0 right-0 z-[60] px-4 py-2 text-center text-sm font-medium ${
          trialInfo.status === 'expired' 
            ? 'bg-red-500 text-white' 
            : trialInfo.daysLeft && trialInfo.daysLeft <= 3
              ? 'bg-amber-500 text-white'
              : 'bg-blue-500 text-white'
        }`}>
          {trialInfo.status === 'expired' ? (
            <span>
              試用期已結束 · 
              <a href="/upgrade" className="underline font-bold ml-1">立即升級</a>
              以繼續使用
            </span>
          ) : (
            <span>
              試用期剩餘 {trialInfo.daysLeft || 0} 天 · 
              <a href="/upgrade" className="underline font-bold ml-1">查看方案</a>
            </span>
          )}
        </div>
      )}

      {/* 頂部導航 */}
      <header className={`fixed ${showTrialBanner ? 'top-10' : 'top-0'} left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 返回首頁按鈕 */}
            <a 
              href="/"
              className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              title="返回首頁"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </a>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DUO</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-gray-900">名片編輯器</h1>
              <p className="text-xs text-gray-500">
                {userProfile?.displayName ? `歡迎，${userProfile.displayName}` : "建立您的專屬數位名片"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 點數顯示 */}
            {isLoggedIn && userCredits !== null && (
              <button
                onClick={() => {
                  setSelectedTopupPlan(null);
                  setTopupLast5("");
                  setShowTopupDialog(true);
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5 border border-amber-200"
                title="點擊儲值"
              >
                <Coins size={16} className="text-amber-500" />
                <span className="text-sm font-medium text-amber-700">{userCredits}</span>
              </button>
            )}
            {cardSlug && (
              <button
                onClick={handleShare}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">分享</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isSaving ? "儲存中..." : "儲存名片"}
            </button>
          </div>
        </div>
      </header>

      {/* 訊息 Toast - 位置適應試用期橫幅 */}
      {saveError && (
        <div className={`fixed ${showTrialBanner ? 'top-28' : 'top-20'} left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300`}>
          <div className={`${saveError.startsWith('✅') ? 'bg-green-500' : 'bg-red-500'} text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-md mx-4`}>
            {saveError.startsWith('✅') ? <Check size={20} className="flex-shrink-0" /> : <AlertCircle size={20} className="flex-shrink-0" />}
            <p className="text-sm flex-1">{saveError}</p>
            <button 
              onClick={() => setSaveError(null)} 
              className={`flex-shrink-0 ${saveError.startsWith('✅') ? 'hover:bg-green-600' : 'hover:bg-red-600'} rounded-full p-1 transition-colors`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* AI 生成成功 Toast */}
      {showAiSuccess && (
        <div className={`fixed ${showTrialBanner ? 'top-28' : 'top-20'} left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300`}>
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-md mx-4">
            <Wand2 size={20} className="flex-shrink-0" />
            <p className="text-sm flex-1">AI 已為您生成內容，請檢查並編輯！</p>
            <button 
              onClick={() => setShowAiSuccess(false)} 
              className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 儲存成功彈窗 */}
      {saveSuccessUrl && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* 成功圖示 */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              名片儲存成功！
            </h2>
            <p className="text-gray-500 text-center text-sm mb-4">
              您的數位名片已準備就緒，快來分享給朋友吧
            </p>
            
            {/* 名片連結 */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">您的名片連結</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 truncate">
                  {saveSuccessUrl}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(saveSuccessUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    } catch {
                      // 降級：選中文字
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    linkCopied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {linkCopied ? '已複製 ✓' : '複製'}
                </button>
              </div>
            </div>
            
            {/* 主要操作按鈕 */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // 分享功能
                  handleShare();
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                分享名片
              </button>
              
              <button
                onClick={() => {
                  router.push(`/c/${cardSlug}`);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                查看名片
                <ChevronRight size={18} />
              </button>
            </div>
            
            {/* 繼續編輯連結 */}
            <button
              onClick={() => {
                setSaveSuccessUrl(null);
              }}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              繼續編輯
            </button>
          </div>
        </div>
      )}

      {/* AI 智能填寫對話框 */}
      {showAiDialog && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* 標題 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wand2 size={24} className="text-violet-500" />
                AI 智能填寫
              </h2>
              <button
                onClick={() => {
                  setShowAiDialog(false);
                  setAiError(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 點數餘額 */}
            <div className="flex items-center justify-between bg-violet-50 rounded-lg px-4 py-2 mb-4">
              <span className="text-sm text-violet-700">您的點數餘額</span>
              <span className="font-bold text-violet-600">{userCredits ?? 0} 點</span>
            </div>

            {/* 點數不足提示 */}
            {userCredits !== null && userCredits < 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700">
                  點數不足，請先儲值後再使用 AI 功能
                </p>
                <button
                  onClick={() => {
                    setShowAiDialog(false);
                    setSelectedTopupPlan(null);
                    setTopupLast5("");
                    setShowTopupDialog(true);
                  }}
                  className="mt-2 text-sm text-amber-600 font-medium hover:underline"
                >
                  前往儲值 →
                </button>
              </div>
            )}

            {/* 輸入表單 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  您的職業/行業 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aiInput.profession}
                  onChange={(e) => setAiInput(prev => ({ ...prev, profession: e.target.value }))}
                  placeholder="例：保險業務、美髮設計師、房仲經紀人"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  您的專長/服務 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aiInput.expertise}
                  onChange={(e) => setAiInput(prev => ({ ...prev, expertise: e.target.value }))}
                  placeholder="例：家庭保障規劃、染燙造型、商辦租賃"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  您想給客戶什麼印象 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aiInput.impression}
                  onChange={(e) => setAiInput(prev => ({ ...prev, impression: e.target.value }))}
                  placeholder="例：專業、親切、值得信賴"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* 錯誤訊息 */}
            {aiError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{aiError}</p>
              </div>
            )}

            {/* 操作按鈕 */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleAiGenerate}
                disabled={isAiGenerating || !aiInput.profession || !aiInput.expertise || !aiInput.impression || (userCredits !== null && userCredits < 1)}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    AI 正在撰寫中...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    開始生成（消耗 1 點）
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setShowAiDialog(false);
                  setAiError(null);
                }}
                className="w-full py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                取消
              </button>
            </div>

            {/* 說明文字 */}
            <p className="mt-4 text-xs text-gray-400 text-center">
              AI 將根據您提供的資訊，自動生成標語、個人簡介、專長標籤和座右銘
            </p>
          </div>
        </div>
      )}

      {/* 儲值對話框 */}
      {showTopupDialog && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* 標題 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={24} className="text-amber-500" />
                儲值點數
              </h2>
              <button
                onClick={() => setShowTopupDialog(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 目前餘額 */}
            <div className="flex items-center justify-between bg-amber-50 rounded-lg px-4 py-3 mb-4">
              <span className="text-sm text-amber-700">目前點數餘額</span>
              <span className="font-bold text-amber-600 text-lg">{userCredits ?? 0} 點</span>
            </div>

            {/* 儲值方案 */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">選擇儲值方案：</p>
              {topupPlans.map((plan, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTopupPlan(index)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    selectedTopupPlan === index
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : index === 1 
                        ? 'border-amber-400 bg-amber-50/50' 
                        : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{plan.label}</span>
                      {index === 1 && (
                        <span className="ml-2 text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full">
                          最划算
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-amber-600">NT${plan.price}</span>
                  </div>
                  {plan.bonus > 0 && (
                    <p className="text-xs text-green-600 mt-1">🎁 加贈 {plan.bonus} 點！</p>
                  )}
                </button>
              ))}
            </div>

            {/* 帳號末5碼輸入 */}
            {selectedTopupPlan !== null && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  請輸入您的轉帳帳號末 5 碼
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={topupLast5}
                  onChange={(e) => setTopupLast5(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="例：12345"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 text-center text-lg tracking-widest font-mono"
                />
              </div>
            )}

            {/* 轉帳資訊 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">轉帳資訊：</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>銀行：{bankInfo.bankName}（{bankInfo.bankCode}）</p>
                <p>帳號：{bankInfo.accountNumber}</p>
                <p>戶名：{bankInfo.accountName}</p>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ 請先完成轉帳，再選擇方案並輸入帳號末 5 碼
              </p>
            </div>

            {/* 送出儲值請求 */}
            {selectedTopupPlan !== null && (
              <button
                onClick={handleTopupSubmit}
                disabled={topupLast5.length !== 5 || isTopupSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                {isTopupSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    送出中...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    確認送出儲值請求
                  </>
                )}
              </button>
            )}

            {/* 關閉按鈕 */}
            <button
              onClick={() => setShowTopupDialog(false)}
              className="w-full py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              稍後再說
            </button>
          </div>
        </div>
      )}

      <div className={`pb-8 lg:flex lg:h-screen ${showTrialBanner ? 'pt-28 lg:pt-24' : 'pt-20 lg:pt-16'}`}>
        {/* 預覽區 */}
        <div className="lg:w-1/2 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex flex-col">
          {/* 風格選擇器 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={prevStyle}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-center min-w-[140px]">
              <div className="flex items-center justify-center gap-2">
                <p className="text-white font-medium">{currentStyle.name}</p>
                {isProStyle(currentStyle.id) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold">
                    <Crown size={10} />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-white/60 text-xs">{selectedStyleIndex + 1} / {CARD_STYLES.length}</p>
            </div>
            <button
              onClick={nextStyle}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          
          {/* PRO 升級提示 */}
          {isProStyle(currentStyle.id) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl text-center">
              <p className="text-yellow-200 text-sm font-medium flex items-center justify-center gap-2">
                <Lock size={14} />
                此風格為 PRO 專屬
              </p>
              <a 
                href="/upgrade" 
                className="text-yellow-300 text-xs hover:underline"
              >
                升級即可解鎖所有風格 →
              </a>
            </div>
          )}

          {/* 名片預覽 - 完整展示（含多頁切換） */}
          <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-2">
            <div className="w-full max-w-sm space-y-3">
              {/* 名片主體 */}
              <div 
                className="rounded-2xl shadow-2xl overflow-hidden"
                style={getBgStyle(currentStyle.bgColor)}
              >
                {previewPage === "card" ? (
                  /* 名片頁面 */
                  <div className="p-6">
                    {/* 頭像區 */}
                    <div className="flex justify-center mb-4">
                      <div 
                        className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden"
                        style={{ borderColor: currentStyle.primaryColor, borderWidth: "3px" }}
                      >
                        {userProfile?.pictureUrl ? (
                          <img src={userProfile.pictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} style={{ color: currentStyle.textColor }} />
                        )}
                      </div>
                    </div>

                    {/* 姓名 & 職稱 & 公司 */}
                    <div className="text-center mb-4">
                      <h2 
                        className="text-2xl font-bold"
                        style={{ color: currentStyle.textColor }}
                      >
                        {cardData.displayName || "您的姓名"}
                      </h2>
                      <p 
                        className={`text-sm mt-1 ${!cardData.title ? 'opacity-40 italic' : ''}`}
                        style={{ color: currentStyle.textColor, opacity: cardData.title ? 0.8 : 0.4 }}
                      >
                        {cardData.title || "職稱（例：資深顧問）"}
                      </p>
                      <p 
                        className={`text-sm mt-1 ${!cardData.company ? 'opacity-40 italic' : ''}`}
                        style={{ color: currentStyle.textColor, opacity: cardData.company ? 0.6 : 0.35 }}
                      >
                        {cardData.company || "公司名稱"}
                      </p>
                    </div>

                    {/* 標語 */}
                    <p 
                      className={`text-center text-sm mb-4 ${!cardData.tagline ? 'opacity-40 italic' : ''}`}
                      style={{ color: currentStyle.textColor, opacity: cardData.tagline ? 0.7 : 0.35 }}
                    >
                      {cardData.tagline || "一句話介紹自己..."}
                    </p>

                    {/* 社群媒體圖示 */}
                    <div className="flex justify-center gap-2 mb-4 flex-wrap">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!cardData.social.instagram ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: currentStyle.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: currentStyle.textColor }}
                      >
                        <Instagram size={16} />
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!cardData.social.facebook ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: currentStyle.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: currentStyle.textColor }}
                      >
                        <Facebook size={16} />
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!cardData.social.youtube ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: currentStyle.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: currentStyle.textColor }}
                      >
                        <Youtube size={16} />
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!cardData.social.linkedin ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: currentStyle.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: currentStyle.textColor }}
                      >
                        <Linkedin size={16} />
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${!cardData.lineId ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: currentStyle.textColor === "#FFFFFF" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", color: currentStyle.textColor }}
                      >
                        <MessageCircle size={16} />
                      </div>
                    </div>

                    {/* 聯絡按鈕 */}
                    <div className="space-y-2">
                      <div
                        className={`w-full py-3 text-center font-medium ${currentStyle.buttonStyle === "rounded" ? "rounded-full" : "rounded-lg"} ${!cardData.phone ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: currentStyle.primaryColor, color: currentStyle.bgColor.includes("gradient") || currentStyle.bgColor === "#1E8449" ? currentStyle.textColor : "#FFFFFF" }}
                      >
                        📞 {cardData.phone || "0912-345-678"}
                      </div>
                      <div
                        className={`w-full py-3 text-center font-medium ${currentStyle.buttonStyle === "rounded" ? "rounded-full" : "rounded-lg"} ${!cardData.email ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: currentStyle.secondaryColor, color: currentStyle.textColor }}
                      >
                        ✉️ {cardData.email ? "發送郵件" : "your@email.com"}
                      </div>
                      <div
                        className={`w-full py-3 text-center font-medium ${currentStyle.buttonStyle === "rounded" ? "rounded-full" : "rounded-lg"} ${!cardData.website ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: currentStyle.secondaryColor, color: currentStyle.textColor }}
                      >
                        🌐 {cardData.website ? "前往網站" : "www.yoursite.com"}
                      </div>
                      {/* 地址 */}
                      <div
                        className={`w-full py-2 text-center text-sm ${!cardData.address ? 'opacity-40 italic' : ''}`}
                        style={{ color: currentStyle.textColor, opacity: cardData.address ? 0.7 : 0.35 }}
                      >
                        📍 {cardData.address || "台北市信義區..."}
                      </div>
                    </div>
                  </div>
                ) : previewPage === "about" ? (
                  /* 關於我頁面預覽 */
                  <div className="p-6 bg-white min-h-[280px]">
                    {/* 個人簡介 */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText size={12} />
                        關於我
                      </h3>
                      <p className={`text-sm text-gray-700 leading-relaxed ${!cardData.about.bio ? 'opacity-40 italic' : ''}`}>
                        {cardData.about.bio || "在這裡介紹您的專業背景、服務理念..."}
                      </p>
                    </div>

                    {/* 專長標籤 */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={12} />
                        專長領域
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {cardData.about.tags.length > 0 ? (
                          cardData.about.tags.slice(0, 5).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs italic">專業諮詢</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs italic">業務開發</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs italic">+更多</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 經歷資歷 */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Award size={12} />
                        經歷資歷
                      </h3>
                      <div className="space-y-2">
                        {cardData.about.experiences.length > 0 ? (
                          cardData.about.experiences.slice(0, 3).map((exp, i) => (
                            <div key={i} className="border-l-2 border-amber-400 pl-2">
                              <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                              {exp.description && <p className="text-xs text-gray-500">{exp.description}</p>}
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="border-l-2 border-gray-200 pl-2 opacity-40">
                              <p className="text-sm font-medium text-gray-400 italic">10 年產業經驗</p>
                            </div>
                            <div className="border-l-2 border-gray-200 pl-2 opacity-40">
                              <p className="text-sm font-medium text-gray-400 italic">資深顧問認證</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 座右銘 */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                      <p className={`text-center text-sm italic ${!cardData.about.motto ? 'text-gray-400' : 'text-gray-700'}`}>
                        「{cardData.about.motto || "您的座右銘或服務理念"}」
                      </p>
                    </div>
                  </div>
                ) : previewPage === "services" ? (
                  /* 服務項目頁面預覽 */
                  <div className="p-6 bg-white min-h-[280px]">
                    {/* 標題 */}
                    <div className="text-center mb-4">
                      <h2 className={`text-lg font-bold ${!cardData.services.headline ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                        {cardData.services.headline || "服務項目"}
                      </h2>
                    </div>

                    {/* 服務列表 */}
                    <div className="space-y-2 mb-4">
                      {cardData.services.items.length > 0 ? (
                        cardData.services.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <Briefcase size={14} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                {item.price && <span className="text-xs text-amber-600">{item.price}</span>}
                              </div>
                              {item.description && <p className="text-xs text-gray-500 truncate">{item.description}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg opacity-40">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Briefcase size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-400 italic">服務項目 1</p>
                              <p className="text-xs text-gray-300 italic">服務說明...</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg opacity-40">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <Briefcase size={14} className="text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-400 italic">服務項目 2</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 預約按鈕 */}
                    <button className={`w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl ${!cardData.services.bookingUrl ? 'opacity-40' : ''}`}>
                      立即預約
                    </button>
                  </div>
                ) : previewPage === "portfolio" ? (
                  /* 作品集頁面預覽 */
                  <div className="p-6 bg-white min-h-[280px]">
                    {/* 標題 */}
                    <div className="text-center mb-4">
                      <h2 className={`text-lg font-bold ${!cardData.portfolio.headline ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                        {cardData.portfolio.headline || "作品集"}
                      </h2>
                    </div>

                    {/* 圖片牆 */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {cardData.portfolio.images.length > 0 ? (
                        cardData.portfolio.images.slice(0, 4).map((url, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {url ? (
                              <img src={url} alt={`作品 ${i + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Sparkles size={24} />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                            <Sparkles size={24} className="text-gray-300" />
                          </div>
                          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                            <Sparkles size={24} className="text-gray-300" />
                          </div>
                          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                            <Sparkles size={24} className="text-gray-300" />
                          </div>
                          <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                            <Sparkles size={24} className="text-gray-300" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* 客戶見證 */}
                    {cardData.portfolio.testimonials.length > 0 ? (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                        <p className="text-xs text-gray-700 italic mb-1">
                          「{cardData.portfolio.testimonials[0].content}」
                        </p>
                        <p className="text-xs text-gray-500 text-right">— {cardData.portfolio.testimonials[0].name}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 opacity-40">
                        <p className="text-xs text-gray-400 italic mb-1">「客戶評價...」</p>
                        <p className="text-xs text-gray-300 text-right italic">— 客戶名稱</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 公司介紹頁面預覽 */
                  <div className="p-6 bg-white min-h-[280px]">
                    {/* Logo & 名稱 */}
                    <div className="text-center mb-4">
                      {cardData.companyInfo.logo ? (
                        <img src={cardData.companyInfo.logo} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
                      ) : (
                        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 size={24} className="text-gray-300" />
                        </div>
                      )}
                      <h2 className={`text-lg font-bold ${!cardData.companyInfo.name ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                        {cardData.companyInfo.name || "公司名稱"}
                      </h2>
                    </div>

                    {/* 公司簡介 */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Building2 size={12} />
                        公司簡介
                      </h3>
                      <p className={`text-sm text-gray-700 leading-relaxed ${!cardData.companyInfo.description ? 'opacity-40 italic' : ''}`}>
                        {cardData.companyInfo.description ? 
                          (cardData.companyInfo.description.length > 100 
                            ? cardData.companyInfo.description.substring(0, 100) + "..." 
                            : cardData.companyInfo.description) 
                          : "介紹您的公司、品牌故事..."}
                      </p>
                    </div>

                    {/* 營業時間 */}
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Globe size={12} />
                        營業時間
                      </h3>
                      <p className={`text-sm ${!cardData.companyInfo.businessHours ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                        {cardData.companyInfo.businessHours || "週一至週五 09:00 - 18:00"}
                      </p>
                    </div>

                    {/* 地址 */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className={!cardData.companyInfo.address ? 'text-gray-400 italic' : ''}>
                        {cardData.companyInfo.address || "公司地址..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按鈕區（預覽示意） */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1 py-2.5 px-2 bg-[#06C755] text-white rounded-xl opacity-90">
                  <UserPlus size={18} />
                  <span className="text-[10px] font-medium">加 LINE</span>
                </div>
                <div className="flex flex-col items-center gap-1 py-2.5 px-2 bg-white text-gray-600 rounded-xl shadow-sm opacity-90">
                  <Download size={18} />
                  <span className="text-[10px] font-medium">儲存聯絡人</span>
                </div>
                <div className="flex flex-col items-center gap-1 py-2.5 px-2 bg-white text-gray-600 rounded-xl shadow-sm opacity-90">
                  <Share2 size={18} />
                  <span className="text-[10px] font-medium">分享名片</span>
                </div>
              </div>

              {/* 頁面切換 Tab（同步編輯 Tab） */}
              <div className="bg-white/90 rounded-lg p-0.5 shadow-sm space-y-0.5">
                {/* 第一排：名片 + 關於我 */}
                <div className="flex gap-0.5">
                  {[
                    { id: "card", label: "名片", icon: User, tab: "basic" },
                    { id: "about", label: "關於我", icon: FileText, tab: "about" },
                  ].map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setPreviewPage(page.id as typeof previewPage);
                        setActiveTab(page.tab as typeof activeTab);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-colors flex items-center justify-center gap-1 ${
                        previewPage === page.id
                          ? "bg-amber-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <page.icon size={12} />
                      {page.label}
                    </button>
                  ))}
                </div>
                {/* 第二排：服務 + 作品 + 公司 */}
                <div className="flex gap-0.5">
                  {[
                    { id: "services", label: "服務", icon: Briefcase, tab: "services" },
                    { id: "portfolio", label: "作品", icon: Sparkles, tab: "portfolio" },
                    { id: "company", label: "公司", icon: Building2, tab: "company" },
                  ].map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setPreviewPage(page.id as typeof previewPage);
                        setActiveTab(page.tab as typeof activeTab);
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-colors flex items-center justify-center gap-1 ${
                        previewPage === page.id
                          ? "bg-amber-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <page.icon size={12} />
                      {page.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 品牌標誌 */}
              <p className="text-center text-[10px] text-white/50">
                Powered by <span className="font-semibold">DUO ID</span>
              </p>
            </div>
          </div>

          {/* 風格指示器 */}
          <div className="flex justify-center gap-2 mt-2 pb-2">
            {CARD_STYLES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedStyleIndex(index);
                  setCardData(prev => ({ ...prev, styleId: CARD_STYLES[index].id }));
                }}
                className={`h-2 rounded-full transition-all ${
                  index === selectedStyleIndex ? "bg-white w-6" : "bg-white/40 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 編輯區 */}
        <div className="lg:w-1/2 lg:overflow-y-auto">
          <div className="max-w-lg mx-auto p-4 lg:p-6">
            {/* Tab 切換 - 上排（名片基本資訊） */}
            <div className="bg-white rounded-xl p-1 shadow-sm mb-2 sticky top-20 lg:top-0 z-10">
              <div className="flex gap-1">
                {[
                  { id: "basic", label: "基本", icon: User, preview: "card" },
                  { id: "contact", label: "聯絡", icon: Phone, preview: "card" },
                  { id: "social", label: "社群", icon: Instagram, preview: "card" },
                  { id: "about", label: "關於我", icon: FileText, preview: "about" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setPreviewPage(tab.preview as typeof previewPage);
                    }}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      activeTab === tab.id
                        ? "bg-amber-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={14} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              {/* 下排（擴充頁面） */}
              <div className="flex gap-1 mt-1">
                {[
                  { id: "services", label: "服務項目", icon: Briefcase, preview: "services" },
                  { id: "portfolio", label: "作品集", icon: Sparkles, preview: "portfolio" },
                  { id: "company", label: "公司介紹", icon: Building2, preview: "company" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setPreviewPage(tab.preview as typeof previewPage);
                    }}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      activeTab === tab.id
                        ? "bg-amber-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon size={14} />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 基本資訊 */}
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-amber-500" />
                  基本資訊
                </h3>
                
                <InputField
                  label="姓名 *"
                  placeholder="輸入您的姓名"
                  value={cardData.displayName}
                  onChange={(v) => updateField("displayName", v)}
                  icon={<User size={16} />}
                  required
                />
                
                <InputField
                  label="職稱"
                  placeholder="例：資深顧問、設計師"
                  value={cardData.title}
                  onChange={(v) => updateField("title", v)}
                  icon={<Briefcase size={16} />}
                />
                
                <InputField
                  label="公司 / 品牌"
                  placeholder="公司或品牌名稱"
                  value={cardData.company}
                  onChange={(v) => updateField("company", v)}
                  icon={<Building2 size={16} />}
                />
                
                <InputField
                  label="標語 / 簡介"
                  placeholder="一句話描述您的專業"
                  value={cardData.tagline}
                  onChange={(v) => updateField("tagline", v)}
                  icon={<Sparkles size={16} />}
                />
              </div>
            )}

            {/* 聯絡方式 */}
            {activeTab === "contact" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone size={18} className="text-green-500" />
                  聯絡方式
                </h3>
                
                <InputField
                  label="電話"
                  placeholder="0912-345-678"
                  value={cardData.phone}
                  onChange={(v) => updateField("phone", v)}
                  icon={<Phone size={16} />}
                  type="tel"
                  validationType="phone"
                />
                
                <InputField
                  label="Email"
                  placeholder="your@email.com"
                  value={cardData.email}
                  onChange={(v) => updateField("email", v)}
                  icon={<Mail size={16} />}
                  type="email"
                  validationType="email"
                />
                
                <InputField
                  label="網站"
                  placeholder="https://your-website.com"
                  value={cardData.website}
                  onChange={(v) => updateField("website", v)}
                  icon={<Globe size={16} />}
                  type="url"
                  validationType="url"
                />
                
                <InputField
                  label="地址"
                  placeholder="公司或服務地點"
                  value={cardData.address}
                  onChange={(v) => updateField("address", v)}
                  icon={<MapPin size={16} />}
                />
                
                <InputField
                  label="LINE ID"
                  placeholder="@yourbrand 或 LINE 連結"
                  value={cardData.lineId}
                  onChange={(v) => updateField("lineId", v)}
                  icon={<MessageCircle size={16} />}
                />
              </div>
            )}

            {/* 社群連結 */}
            {activeTab === "social" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Instagram size={18} className="text-pink-500" />
                  社群連結
                </h3>
                <p className="text-sm text-gray-500">填寫後會在名片上顯示對應圖示</p>
                
                <InputField
                  label="Instagram"
                  placeholder="https://instagram.com/yourname"
                  value={cardData.social.instagram}
                  onChange={(v) => updateSocial("instagram", v)}
                  icon={<Instagram size={16} />}
                  type="url"
                  validationType="instagram"
                />
                
                <InputField
                  label="Facebook"
                  placeholder="https://facebook.com/yourname"
                  value={cardData.social.facebook}
                  onChange={(v) => updateSocial("facebook", v)}
                  icon={<Facebook size={16} />}
                  type="url"
                  validationType="facebook"
                />
                
                <InputField
                  label="YouTube"
                  placeholder="https://youtube.com/@yourname"
                  value={cardData.social.youtube}
                  onChange={(v) => updateSocial("youtube", v)}
                  icon={<Youtube size={16} />}
                  type="url"
                  validationType="youtube"
                />
                
                <InputField
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/yourname"
                  value={cardData.social.linkedin}
                  onChange={(v) => updateSocial("linkedin", v)}
                  icon={<Linkedin size={16} />}
                  type="url"
                  validationType="linkedin"
                />
              </div>
            )}

            {/* 關於我 */}
            {activeTab === "about" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={18} className="text-blue-500" />
                    關於我 / 專業介紹
                  </h3>
                  {/* 點數顯示 */}
                  {userCredits !== null && (
                    <div className="flex items-center gap-1 text-sm text-amber-600">
                      <Coins size={14} />
                      <span>{userCredits} 點</span>
                    </div>
                  )}
                </div>
                
                {/* AI 智能填寫按鈕 */}
                <button
                  onClick={() => setShowAiDialog(true)}
                  disabled={!isLoggedIn}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 size={20} />
                  AI 智能填寫
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">消耗 1 點</span>
                </button>
                <p className="text-xs text-gray-400 text-center -mt-2">
                  讓 AI 幫您撰寫專業的自我介紹、標語和專長標籤
                </p>
                
                {/* 個人簡介 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">個人簡介</label>
                  <textarea
                    value={cardData.about.bio}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      about: { ...prev.about, bio: e.target.value }
                    }))}
                    placeholder="介紹您的專業背景、服務理念、獨特優勢..."
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                  <p className={`mt-1 text-xs ${cardData.about.bio.length >= 1900 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {cardData.about.bio.length}/2000
                    {cardData.about.bio.length >= 1900 && ' (即將達到上限)'}
                  </p>
                </div>

                {/* 專長標籤 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">專長標籤</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cardData.about.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = [...cardData.about.tags];
                            newTags.splice(index, 1);
                            setCardData(prev => ({
                              ...prev,
                              about: { ...prev.about, tags: newTags }
                            }));
                          }}
                          className="hover:text-amber-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="輸入專長後按 Enter 或點擊新增"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          if (cardData.about.tags.length < 10) {
                            setCardData(prev => ({
                              ...prev,
                              about: { ...prev.about, tags: [...prev.about.tags, e.currentTarget.value.trim()] }
                            }));
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim() && cardData.about.tags.length < 10) {
                          setCardData(prev => ({
                            ...prev,
                            about: { ...prev.about, tags: [...prev.about.tags, input.value.trim()] }
                          }));
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">最多 10 個標籤，例：保險規劃、財務顧問、退休理財</p>
                </div>

                {/* 經歷 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">經歷 / 資歷</label>
                  <div className="space-y-3">
                    {cardData.about.experiences.map((exp, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const newExps = [...cardData.about.experiences];
                              newExps[index] = { ...newExps[index], title: e.target.value };
                              setCardData(prev => ({
                                ...prev,
                                about: { ...prev.about, experiences: newExps }
                              }));
                            }}
                            placeholder="經歷標題（如：10 年保險業經驗）"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                          />
                          <input
                            type="text"
                            value={exp.description}
                            onChange={(e) => {
                              const newExps = [...cardData.about.experiences];
                              newExps[index] = { ...newExps[index], description: e.target.value };
                              setCardData(prev => ({
                                ...prev,
                                about: { ...prev.about, experiences: newExps }
                              }));
                            }}
                            placeholder="補充說明（選填）"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newExps = [...cardData.about.experiences];
                            newExps.splice(index, 1);
                            setCardData(prev => ({
                              ...prev,
                              about: { ...prev.about, experiences: newExps }
                            }));
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {cardData.about.experiences.length < 10 && (
                    <button
                      onClick={() => {
                        setCardData(prev => ({
                          ...prev,
                          about: {
                            ...prev.about,
                            experiences: [...prev.about.experiences, { title: "", description: "" }]
                          }
                        }));
                      }}
                      className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      新增經歷
                    </button>
                  )}
                </div>

                {/* 座右銘 */}
                <InputField
                  label="座右銘 / 理念"
                  placeholder="您的服務理念或座右銘"
                  value={cardData.about.motto}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    about: { ...prev.about, motto: v }
                  }))}
                  icon={<Sparkles size={16} />}
                />
              </div>
            )}

            {/* 服務項目 */}
            {activeTab === "services" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase size={18} className="text-amber-500" />
                  服務項目
                </h3>
                
                {/* 標題 */}
                <InputField
                  label="頁面標題"
                  placeholder="例：專業服務項目、我的服務"
                  value={cardData.services.headline}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    services: { ...prev.services, headline: v }
                  }))}
                  icon={<Briefcase size={16} />}
                />

                {/* 服務列表 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">服務項目列表</label>
                  <div className="space-y-3">
                    {cardData.services.items.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...cardData.services.items];
                                newItems[index] = { ...newItems[index], name: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  services: { ...prev.services, items: newItems }
                                }));
                              }}
                              placeholder="服務名稱（如：品牌設計）"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                            />
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...cardData.services.items];
                                newItems[index] = { ...newItems[index], description: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  services: { ...prev.services, items: newItems }
                                }));
                              }}
                              placeholder="服務說明（選填）"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                            />
                            <input
                              type="text"
                              value={item.price}
                              onChange={(e) => {
                                const newItems = [...cardData.services.items];
                                newItems[index] = { ...newItems[index], price: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  services: { ...prev.services, items: newItems }
                                }));
                              }}
                              placeholder="價格（如：NT$1,000 起、免費諮詢）"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newItems = [...cardData.services.items];
                              newItems.splice(index, 1);
                              setCardData(prev => ({
                                ...prev,
                                services: { ...prev.services, items: newItems }
                              }));
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {cardData.services.items.length < 10 && (
                    <button
                      onClick={() => {
                        setCardData(prev => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            items: [...prev.services.items, { name: "", description: "", price: "" }]
                          }
                        }));
                      }}
                      className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      新增服務項目
                    </button>
                  )}
                </div>

                {/* 預約連結 */}
                <InputField
                  label="預約連結"
                  placeholder="https://your-booking-url.com"
                  value={cardData.services.bookingUrl}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    services: { ...prev.services, bookingUrl: v }
                  }))}
                  icon={<Globe size={16} />}
                  validationType="url"
                />

                {/* 常見問題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">常見問題 FAQ</label>
                  <div className="space-y-3">
                    {cardData.services.faqs.map((faq, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const newFaqs = [...cardData.services.faqs];
                                newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  services: { ...prev.services, faqs: newFaqs }
                                }));
                              }}
                              placeholder="問題（如：營業時間是？）"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                            />
                            <textarea
                              value={faq.answer}
                              onChange={(e) => {
                                const newFaqs = [...cardData.services.faqs];
                                newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  services: { ...prev.services, faqs: newFaqs }
                                }));
                              }}
                              placeholder="回答"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm resize-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newFaqs = [...cardData.services.faqs];
                              newFaqs.splice(index, 1);
                              setCardData(prev => ({
                                ...prev,
                                services: { ...prev.services, faqs: newFaqs }
                              }));
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {cardData.services.faqs.length < 10 && (
                    <button
                      onClick={() => {
                        setCardData(prev => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            faqs: [...prev.services.faqs, { question: "", answer: "" }]
                          }
                        }));
                      }}
                      className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      新增常見問題
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 作品集 */}
            {activeTab === "portfolio" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-500" />
                  作品集
                </h3>
                
                {/* 標題 */}
                <InputField
                  label="頁面標題"
                  placeholder="例：精選作品、成功案例"
                  value={cardData.portfolio.headline}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    portfolio: { ...prev.portfolio, headline: v }
                  }))}
                  icon={<Sparkles size={16} />}
                />

                {/* 作品圖片 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">作品圖片連結</label>
                  <p className="text-xs text-gray-400 mb-2">請輸入圖片網址，建議使用 Imgur、Cloudinary 等圖床服務</p>
                  <div className="space-y-2">
                    {cardData.portfolio.images.map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newImages = [...cardData.portfolio.images];
                            newImages[index] = e.target.value;
                            setCardData(prev => ({
                              ...prev,
                              portfolio: { ...prev.portfolio, images: newImages }
                            }));
                          }}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                        />
                        <button
                          onClick={() => {
                            const newImages = [...cardData.portfolio.images];
                            newImages.splice(index, 1);
                            setCardData(prev => ({
                              ...prev,
                              portfolio: { ...prev.portfolio, images: newImages }
                            }));
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {cardData.portfolio.images.length < 12 && (
                    <button
                      onClick={() => {
                        setCardData(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            images: [...prev.portfolio.images, ""]
                          }
                        }));
                      }}
                      className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      新增圖片
                    </button>
                  )}
                </div>

                {/* 客戶見證 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">客戶見證</label>
                  <div className="space-y-3">
                    {cardData.portfolio.testimonials.map((testimonial, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={testimonial.name}
                              onChange={(e) => {
                                const newTestimonials = [...cardData.portfolio.testimonials];
                                newTestimonials[index] = { ...newTestimonials[index], name: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  portfolio: { ...prev.portfolio, testimonials: newTestimonials }
                                }));
                              }}
                              placeholder="客戶名稱（如：陳先生、A 公司）"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm"
                            />
                            <textarea
                              value={testimonial.content}
                              onChange={(e) => {
                                const newTestimonials = [...cardData.portfolio.testimonials];
                                newTestimonials[index] = { ...newTestimonials[index], content: e.target.value };
                                setCardData(prev => ({
                                  ...prev,
                                  portfolio: { ...prev.portfolio, testimonials: newTestimonials }
                                }));
                              }}
                              placeholder="客戶評價內容"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white text-sm resize-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newTestimonials = [...cardData.portfolio.testimonials];
                              newTestimonials.splice(index, 1);
                              setCardData(prev => ({
                                ...prev,
                                portfolio: { ...prev.portfolio, testimonials: newTestimonials }
                              }));
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {cardData.portfolio.testimonials.length < 10 && (
                    <button
                      onClick={() => {
                        setCardData(prev => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            testimonials: [...prev.portfolio.testimonials, { name: "", content: "" }]
                          }
                        }));
                      }}
                      className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      新增客戶見證
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 公司介紹 */}
            {activeTab === "company" && (
              <div className="bg-white rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-500" />
                  公司介紹
                </h3>
                
                {/* 公司名稱 */}
                <InputField
                  label="公司名稱"
                  placeholder="您的公司 / 品牌名稱"
                  value={cardData.companyInfo.name}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, name: v }
                  }))}
                  icon={<Building2 size={16} />}
                />

                {/* 公司 Logo */}
                <InputField
                  label="公司 Logo 連結"
                  placeholder="https://example.com/logo.png"
                  value={cardData.companyInfo.logo}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, logo: v }
                  }))}
                  icon={<Globe size={16} />}
                  validationType="url"
                />

                {/* 公司簡介 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">公司簡介</label>
                  <textarea
                    value={cardData.companyInfo.description}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, description: e.target.value }
                    }))}
                    placeholder="介紹您的公司、品牌故事、服務理念..."
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>

                {/* 營業時間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">營業時間</label>
                  <textarea
                    value={cardData.companyInfo.businessHours}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, businessHours: e.target.value }
                    }))}
                    placeholder="週一至週五 09:00 - 18:00&#10;週六、日公休"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-gray-900 placeholder:text-gray-400 bg-white"
                  />
                </div>

                {/* 公司地址 */}
                <InputField
                  label="公司地址"
                  placeholder="台北市信義區..."
                  value={cardData.companyInfo.address}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, address: v }
                  }))}
                  icon={<MapPin size={16} />}
                />

                {/* 地圖連結 */}
                <InputField
                  label="Google 地圖連結（選填）"
                  placeholder="https://maps.google.com/..."
                  value={cardData.companyInfo.mapUrl}
                  onChange={(v) => setCardData(prev => ({
                    ...prev,
                    companyInfo: { ...prev.companyInfo, mapUrl: v }
                  }))}
                  icon={<Globe size={16} />}
                  validationType="url"
                />
              </div>
            )}

            {/* 底部提示 */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>編輯完成後點擊「儲存名片」</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 驗證函數
const validators = {
  email: (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v: string) => !v || /^[\d\s\-+()]+$/.test(v),
  url: (v: string) => !v || /^https?:\/\/.+/.test(v) || v.startsWith("www."),
  instagram: (v: string) => !v || /^https?:\/\/(www\.)?instagram\.com\/.+/.test(v),
  facebook: (v: string) => !v || /^https?:\/\/(www\.)?facebook\.com\/.+/.test(v),
  youtube: (v: string) => !v || /^https?:\/\/(www\.)?youtube\.com\/.+/.test(v) || /^https?:\/\/youtu\.be\/.+/.test(v),
  linkedin: (v: string) => !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v),
};

const validationErrors: Record<string, string> = {
  email: "請輸入有效的 Email 格式",
  phone: "請輸入有效的電話格式",
  url: "請輸入有效的網址（需以 http:// 或 https:// 開頭）",
  instagram: "請輸入有效的 Instagram 連結",
  facebook: "請輸入有效的 Facebook 連結",
  youtube: "請輸入有效的 YouTube 連結",
  linkedin: "請輸入有效的 LinkedIn 連結",
};

function InputField({
  label,
  placeholder,
  value,
  onChange,
  icon,
  required,
  type = "text",
  validationType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url";
  validationType?: keyof typeof validators;
}) {
  const [touched, setTouched] = useState(false);
  const isValid = !validationType || validators[validationType](value);
  const showError = touched && value && !isValid;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${showError ? "text-red-400" : "text-gray-400"}`}>{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400 ${
            showError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
          }`}
        />
      </div>
      {showError && validationType && (
        <p className="mt-1 text-xs text-red-500">{validationErrors[validationType]}</p>
      )}
    </div>
  );
}
