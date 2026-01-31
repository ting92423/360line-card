/**
 * Next.js Instrumentation
 * 在應用啟動時執行環境變數驗證
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // 只在 Node.js 運行時執行（排除 Edge Runtime）
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv, isDatabaseConfigured, isWebhookConfigured } = await import("@/lib/env");
    
    try {
      // 驗證必需的環境變數
      validateEnv();
      
      console.log("✅ 環境變數驗證通過");
      
      // 顯示可選功能狀態
      if (isDatabaseConfigured()) {
        console.log("📦 PostgreSQL 已配置");
      } else {
        console.log("📁 使用 JSON 文件存儲（開發模式）");
      }
      
      if (isWebhookConfigured()) {
        console.log("🤖 LINE Bot Webhook 已配置");
      } else {
        console.log("⚠️  LINE Bot Webhook 未配置（部分功能不可用）");
      }
      
    } catch (error) {
      // 在開發環境顯示詳細錯誤，生產環境仍然啟動但記錄警告
      if (process.env.NODE_ENV === "development") {
        console.error("❌ 環境變數驗證失敗，請檢查 .env.local 設定");
        // 開發環境不阻止啟動，方便除錯
      } else {
        // 生產環境：記錄錯誤但不阻止啟動（避免部署失敗）
        console.error("⚠️  環境變數驗證警告：", error instanceof Error ? error.message : error);
      }
    }
  }
}
