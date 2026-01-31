import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 模板設計配置 - 每款都有獨特風格
const TEMPLATES: Record<string, {
  name: string;
  displayName: string;
  title: string;
  company: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  bgGradient: string[];
  photoFile: string;
  layout: "center" | "left" | "right" | "full";
}> = {
  insurance: {
    name: "保險金融",
    displayName: "陳千禾",
    title: "資深業務主任",
    company: "新光人壽",
    subtitle: "3年服務超過300個家庭",
    primaryColor: "#1E3A8A",
    secondaryColor: "#60A5FA",
    bgGradient: ["#1E3A5F", "#0F172A"],
    photoFile: "insurance.jpg",
    layout: "center",
  },
  commerce: {
    name: "商務批發",
    displayName: "陳美君",
    title: "總經理",
    company: "君圓國際有限公司",
    subtitle: "專營進口商品批發",
    primaryColor: "#14B8A6",
    secondaryColor: "#F97316",
    bgGradient: ["#115E59", "#134E4A"],
    photoFile: "commerce.jpg",
    layout: "right",
  },
  lecturer: {
    name: "講師顧問",
    displayName: "王振丞",
    title: "企業講師",
    company: "太田水素工坊",
    subtitle: "Ota Hydrogen Biotech",
    primaryColor: "#0EA5E9",
    secondaryColor: "#38BDF8",
    bgGradient: ["#0284C7", "#0369A1"],
    photoFile: "lecturer.jpg",
    layout: "center",
  },
  fortune: {
    name: "命理風水",
    displayName: "方智福",
    title: "命理老師",
    company: "妙福堂學術中心",
    subtitle: "專研命理風水三十餘年",
    primaryColor: "#DC2626",
    secondaryColor: "#FBBF24",
    bgGradient: ["#991B1B", "#7F1D1D"],
    photoFile: "fortune.jpg",
    layout: "left",
  },
  business: {
    name: "企業商務",
    displayName: "林志豪",
    title: "業務總監",
    company: "科技創新股份有限公司",
    subtitle: "專注企業數位轉型",
    primaryColor: "#0891B2",
    secondaryColor: "#22D3EE",
    bgGradient: ["#164E63", "#155E75"],
    photoFile: "business.jpg",
    layout: "full",
  },
  beauty: {
    name: "美業時尚",
    displayName: "張雅琪",
    title: "美容總監",
    company: "LUXE Beauty",
    subtitle: "韓式半永久 · 皮膚管理",
    primaryColor: "#DB2777",
    secondaryColor: "#F472B6",
    bgGradient: ["#9D174D", "#831843"],
    photoFile: "beauty.jpg",
    layout: "center",
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("template") || "insurance";
    const template = TEMPLATES[templateId] || TEMPLATES.insurance;

    // 支援動態名片資料（覆蓋模板預設值）
    const displayName = searchParams.get("name") || template.displayName;
    const title = searchParams.get("title") || template.title;
    const company = searchParams.get("company") || template.company;
    const subtitle = searchParams.get("subtitle") || template.subtitle;
    const avatarUrl = searchParams.get("avatar"); // 自訂頭像 URL

    const host = request.headers.get("host") || "line360-card.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const photoUrl = avatarUrl || `${baseUrl}/templates/${template.photoFile}`;

    // 根據 layout 選擇不同的設計
    if (template.layout === "left") {
      // 左側照片佈局（命理風水）
      return new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", display: "flex", background: `linear-gradient(135deg, ${template.bgGradient[0]} 0%, ${template.bgGradient[1]} 100%)` }}>
            {/* 左側照片 */}
            <div style={{ width: "45%", height: "100%", display: "flex", position: "relative" }}>
              <img src={photoUrl} width={243} height={960} style={{ objectFit: "cover", objectPosition: "top" }} />
              <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60px", background: "linear-gradient(90deg, transparent, " + template.bgGradient[0] + ")", display: "flex" }} />
            </div>
            {/* 右側資訊 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 30px" }}>
              <div style={{ display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                <span style={{ color: template.secondaryColor, fontSize: "18px", fontWeight: "bold" }}>{company}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>{subtitle}</span>
              </div>
              <span style={{ color: "#ffffff", fontSize: "48px", fontWeight: "bold", marginBottom: "10px" }}>{displayName}</span>
              <span style={{ color: template.secondaryColor, fontSize: "22px", fontWeight: "bold" }}>{title}</span>
              <div style={{ display: "flex", marginTop: "40px", padding: "10px 24px", backgroundColor: template.primaryColor, borderRadius: "25px", border: `2px solid ${template.secondaryColor}` }}>
                <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>DUO ID 數位名片</span>
              </div>
            </div>
          </div>
        ),
        { width: 540, height: 960 }
      );
    }

    if (template.layout === "right") {
      // 右側照片佈局（商務批發）
      return new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", display: "flex", background: `linear-gradient(135deg, ${template.bgGradient[0]} 0%, ${template.bgGradient[1]} 100%)` }}>
            {/* 左側資訊 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 30px" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "30px", gap: "12px" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: template.secondaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "24px" }}>📦</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold" }}>{company}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>{subtitle}</span>
                </div>
              </div>
              <span style={{ color: "#ffffff", fontSize: "48px", fontWeight: "bold", marginBottom: "10px" }}>{displayName}</span>
              <span style={{ color: template.secondaryColor, fontSize: "22px", fontWeight: "bold" }}>{title}</span>
              <div style={{ display: "flex", marginTop: "40px", padding: "10px 24px", backgroundColor: template.secondaryColor, borderRadius: "25px" }}>
                <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>DUO ID 數位名片</span>
              </div>
            </div>
            {/* 右側照片 */}
            <div style={{ width: "45%", height: "100%", display: "flex", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "60px", background: "linear-gradient(270deg, transparent, " + template.bgGradient[0] + ")", display: "flex", zIndex: 1 }} />
              <img src={photoUrl} width={243} height={960} style={{ objectFit: "cover", objectPosition: "top" }} />
            </div>
          </div>
        ),
        { width: 540, height: 960 }
      );
    }

    if (template.layout === "full") {
      // 全版照片佈局（企業商務）
      return new ImageResponse(
        (
          <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
            {/* 背景照片 */}
            <img src={photoUrl} width={540} height={960} style={{ objectFit: "cover", objectPosition: "top" }} />
            {/* 頂部漸層 */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)", display: "flex", flexDirection: "column", padding: "30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "45px", height: "45px", borderRadius: "10px", backgroundColor: template.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "22px" }}>🏢</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: "bold" }}>{company}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{subtitle}</span>
                </div>
              </div>
            </div>
            {/* 底部漸層 */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "350px", background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 30px" }}>
              <span style={{ color: "#ffffff", fontSize: "52px", fontWeight: "bold", marginBottom: "8px" }}>{displayName}</span>
              <span style={{ color: template.secondaryColor, fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>{title}</span>
              <div style={{ display: "flex", padding: "10px 24px", backgroundColor: template.primaryColor, borderRadius: "25px", alignSelf: "flex-start" }}>
                <span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>DUO ID 數位名片</span>
              </div>
            </div>
          </div>
        ),
        { width: 540, height: 960 }
      );
    }

    // 預設：中間圓形頭像佈局（保險、講師、美業）
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: `linear-gradient(180deg, ${template.bgGradient[0]} 0%, ${template.bgGradient[1]} 100%)` }}>
          {/* 頂部公司區 */}
          <div style={{ display: "flex", alignItems: "center", padding: "35px 40px", gap: "15px" }}>
            <div style={{ width: "55px", height: "55px", borderRadius: "14px", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${template.secondaryColor}` }}>
              <span style={{ fontSize: "28px" }}>
                {templateId === "insurance" ? "🛡️" : templateId === "beauty" ? "💎" : "💧"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#ffffff", fontSize: "26px", fontWeight: "bold" }}>{company}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>{subtitle}</span>
            </div>
          </div>

          {/* 中間照片區 */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: "340px", height: "340px", borderRadius: "50%", border: `3px solid ${template.secondaryColor}`, opacity: 0.3, display: "flex" }} />
            <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", border: `2px solid ${template.secondaryColor}`, opacity: 0.15, display: "flex" }} />
            <div style={{ width: "300px", height: "300px", borderRadius: "50%", border: `6px solid ${template.secondaryColor}`, overflow: "hidden", display: "flex", boxShadow: `0 0 60px ${template.secondaryColor}40` }}>
              <img src={photoUrl} width={300} height={300} style={{ objectFit: "cover" }} />
            </div>
          </div>

          {/* 底部資訊區 */}
          <div style={{ padding: "30px 40px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#ffffff", fontSize: "48px", fontWeight: "bold", marginBottom: "10px", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{displayName}</span>
            <span style={{ color: template.secondaryColor, fontSize: "22px", fontWeight: "bold" }}>{title}</span>
            <div style={{ display: "flex", marginTop: "25px", padding: "12px 28px", backgroundColor: template.primaryColor, borderRadius: "30px", border: `2px solid ${template.secondaryColor}` }}>
              <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: "bold" }}>DUO ID 數位名片</span>
            </div>
          </div>
        </div>
      ),
      { width: 540, height: 960 }
    );
  } catch (error) {
    console.error("[API GET /api/og]", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
