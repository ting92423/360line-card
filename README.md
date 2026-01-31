# DUO ID - LINE 智慧型電子名片平台

> 一句話介紹：整合 LINE LIFF 的電子名片平台，讓用戶在 LINE 內建立、編輯、分享精美數位名片。

## ✨ 功能特色

- 🎨 **6 款精美名片風格** - 現代商務、專業簡約、時尚美業等
- 📱 **LINE 深度整合** - LIFF 登入、分享到聊天、加好友
- 💳 **vCard 下載** - 一鍵儲存到手機通訊錄
- 🔒 **付費牆系統** - 試用期 7 天、方案限制
- 📊 **使用分析** - 追蹤名片瀏覽、分享等事件

## 🚀 快速啟動

### 環境需求
- Node.js 18+
- npm 或 yarn

### 安裝步驟

```powershell
# 1. 安裝依賴
npm install

# 2. 複製環境變數範本
copy .env.example .env.local

# 3. 編輯 .env.local，填入以下必要變數：
# - NEXT_PUBLIC_LIFF_ID
# - LINE_CHANNEL_SECRET
# - LINE_CHANNEL_ACCESS_TOKEN
# - SESSION_SECRET（至少 32 字元）

# 4. 啟動開發伺服器
npm run dev

# 5. 開啟瀏覽器
# http://localhost:3000
```

### 生產部署

```powershell
# 建置
npm run build

# 啟動
npm run start
```

## 📁 專案結構

```
360LINE/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── analytics/            # 分析 API
│   │   ├── auth/                 # 認證 API
│   │   │   ├── logout/           # 登出
│   │   │   └── verify/           # 驗證 LINE ID Token
│   │   ├── cards/[slug]/         # 名片 CRUD
│   │   ├── events/               # 事件追蹤
│   │   ├── og/                   # Open Graph 圖片
│   │   ├── users/me/             # 用戶資訊
│   │   ├── vcard/[slug]/         # vCard 下載
│   │   └── webhook/              # LINE Bot Webhook
│   ├── c/[slug]/                 # 名片展示頁
│   ├── editor/                   # LIFF 名片編輯器
│   ├── templates/                # 模板瀏覽頁
│   ├── upgrade/                  # 升級頁面
│   ├── admin/                    # 管理後台
│   ├── layout.tsx                # 全域佈局
│   ├── page.tsx                  # 首頁
│   ├── not-found.tsx             # 404 頁面
│   └── error.tsx                 # 錯誤頁面
├── components/                   # React 組件
│   ├── card-templates/           # 名片模板組件
│   │   ├── v2/                   # V2 模板
│   │   └── cta/                  # CTA 組件
│   └── CardView.tsx              # 名片預覽組件
├── lib/                          # 工具函式庫
│   ├── auth/                     # 認證相關
│   │   ├── lineVerify.ts         # LINE ID Token 驗證
│   │   ├── session.ts            # Session 管理
│   │   └── userManager.ts        # 用戶權限管理
│   ├── storage/                  # 資料存儲
│   │   ├── adapter.ts            # 存儲適配器介面
│   │   ├── jsonStore.ts          # JSON 文件存儲
│   │   └── postgresStore.ts      # PostgreSQL 存儲
│   ├── templates/                # 模板系統
│   ├── liff.ts                   # LIFF SDK 封裝
│   ├── types.ts                  # TypeScript 類型
│   ├── vcard.ts                  # vCard 生成
│   ├── events.ts                 # 事件定義
│   └── env.ts                    # 環境變數驗證
├── data/                         # 資料目錄
│   └── cards.json                # JSON 存儲（開發用）
├── public/                       # 靜態資源
├── .env.example                  # 環境變數範本
├── package.json
└── README.md
```

## 🔧 環境變數

| 變數名稱 | 必填 | 說明 |
|---------|------|------|
| `NEXT_PUBLIC_LIFF_ID` | ✅ | LINE LIFF App ID |
| `LINE_CHANNEL_SECRET` | ✅ | LINE Channel Secret（Webhook 簽名驗證） |
| `LINE_CHANNEL_ACCESS_TOKEN` | ✅ | LINE Channel Access Token（回覆訊息） |
| `SESSION_SECRET` | ✅ | Session 簽名密鑰（至少 32 字元） |
| `LINE_CHANNEL_ID` | ⚪ | LINE Channel ID（ID Token 驗證） |
| `DATABASE_URL` | ⚪ | PostgreSQL 連線字串（可選） |
| `NEXT_PUBLIC_APP_ORIGIN` | ⚪ | 應用網址 |

## 📱 LINE Developers 設定

### 1. 建立 Messaging API Channel
- 前往 [LINE Developers Console](https://developers.line.biz/console/)
- 建立 Provider 和 Messaging API Channel
- 記錄 Channel Secret 和 Channel Access Token

### 2. 設定 Webhook
- Webhook URL: `https://your-domain.com/api/webhook`
- 開啟「Use webhook」
- 關閉「Auto-reply messages」

### 3. 建立 LIFF App
- 在同一 Provider 下建立 LIFF App
- Size: Full
- Endpoint URL: `https://your-domain.com/editor`
- Scope: profile, openid
- Bot link feature: On (Normal)

## 🛣️ API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/cards/[slug]` | 取得名片資料 |
| PUT | `/api/cards/[slug]` | 建立/更新名片（需認證） |
| GET | `/api/vcard/[slug]` | 下載 vCard 檔案 |
| POST | `/api/events` | 追蹤事件 |
| POST | `/api/auth/verify` | 驗證 LINE ID Token |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/users/me` | 取得當前用戶資訊 |
| POST | `/api/webhook` | LINE Bot Webhook |

## 🔐 安全機制

- **Webhook 簽名驗證** - 使用 HMAC-SHA256 驗證 LINE Webhook 請求
- **Session Cookie** - HttpOnly、Secure、SameSite 設定
- **資料驗證** - 使用 Zod Schema 驗證所有輸入
- **SQL 注入防護** - 參數化查詢

## 📝 開發指令

```powershell
npm run dev          # 開發伺服器
npm run build        # 生產建置
npm run start        # 生產伺服器
npm run lint         # 程式碼檢查
npm run smoke:editor # 編輯器測試
```

## 📄 授權

MIT License

---

**DUO ID** - 讓每一次交流都留下專業印象 🎯
