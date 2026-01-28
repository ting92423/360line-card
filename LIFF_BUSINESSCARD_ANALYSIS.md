# liff-businesscard-master 專案分析報告

## 📊 專案概述

**專案名稱**：LINE 數位版名片（liff-businesscard）  
**作者**：taichunmin  
**GitHub**：https://github.com/taichunmin/liff-businesscard  
**授權**：MIT License  
**技術棧**：Pug + 靜態生成 + LIFF SDK

---

## 🎯 核心特色

### 1️⃣ **不需要後端伺服器**
- ✅ 純靜態頁面（HTML + JavaScript）
- ✅ 使用 Pug 模板引擎生成靜態頁面
- ✅ 可直接部署到 GitHub Pages
- ✅ 名片資料嵌入在 URL 中（Base64 / GZIP 編碼）

### 2️⃣ **豐富的名片樣板**
專案內建 13 種現成樣板：
- 📇 Corporate Buzz（企業名片）
- 📇 Right Align（右對齊名片）
- 📇 Chatbot 台灣開發者名片
- 📱 ChatGPT 問與答風格
- 🐾 動物森友會護照/心意卡
- 📰 多頁訊息（Carousel，最多 12 張）
- 📋 CSV/Google Sheet 批次匯入
- 🔧 JSON5 進階客製化
- 📱 Facebook Post Link 模擬

### 3️⃣ **LIFF 整合功能**
- ✅ `liff.shareTargetPicker()` - 選擇好友分享
- ✅ `liff.sendMessages()` - 傳送到目前聊天室
- ✅ `liff.permanentLink` - 生成永久連結
- ✅ 自動登入與授權
- ✅ 取得使用者 Profile

### 4️⃣ **無需資料庫**
資料儲存方式：
- 方式 1：URL Query Parameter（JSON5 Base64）
- 方式 2：URL Hash（JSON5 GZIP Base64）
- 方式 3：Google Sheet（即時讀取）
- 方式 4：CSV 檔案上傳

---

## 📁 專案結構分析

```
liff-businesscard-master/
│
├── src/                          ← 原始碼目錄
│   ├── index.pug                 ← 首頁（樣板列表）
│   ├── businesscards.csv         ← 樣板清單（CSV 格式）
│   │
│   ├── forms/                    ← 名片表單（13 種樣板）
│   │   ├── chatbot-tw-1.pug      ← Chatbot 台灣名片表單
│   │   ├── chatgpt-1.pug         ← ChatGPT 風格表單
│   │   ├── psprint-592.pug       ← Corporate Buzz 表單
│   │   ├── line-carousel-1.pug   ← 多頁訊息表單
│   │   ├── csv.pug               ← CSV 批次匯入表單
│   │   ├── google-sheet.pug      ← Google Sheet 匯入
│   │   ├── json5.pug             ← JSON5 進階客製化
│   │   └── ...（其他樣板）
│   │
│   ├── cards/                    ← Flex Message 樣板（JSON）
│   │   ├── chatbot-tw-1.txt      ← Chatbot 名片 JSON
│   │   ├── chatgpt-1.txt         ← ChatGPT 風格 JSON
│   │   ├── psprint-592.txt       ← Corporate Buzz JSON
│   │   └── ...（對應的 Flex 樣板）
│   │
│   ├── liff-full/                ← LIFF 完整版頁面
│   │   ├── index.pug             ← LIFF 入口（重導向用）
│   │   ├── share.pug             ← 分享頁面（主要功能）
│   │   ├── share-csv.pug         ← CSV 批次分享
│   │   ├── share-google-sheet.pug ← Google Sheet 分享
│   │   └── share-json5*.pug      ← JSON5 各種編碼方式
│   │
│   ├── js/
│   │   └── common.js             ← 共用 JavaScript
│   │
│   └── json5/
│       └── line-carousel-1.json5 ← JSON5 範例資料
│
├── component/                    ← Pug 元件
│   ├── navbar.pug                ← 導覽列
│   ├── gtag.pug                  ← Google Analytics
│   └── livereload.pug            ← 開發熱重載
│
├── layout/                       ← Pug 版面
│   ├── default.pug               ← 預設版面（Bootstrap 4）
│   └── forms.pug                 ← 表單專用版面
│
├── i18n/                         ← 多國語系
│   └── liff-full/
│       ├── share.en.pug          ← 英文
│       └── share.zh-tw.pug       ← 繁體中文
│
├── example.env                   ← 環境變數範本
├── index.js                      ← 建置腳本（生產環境）
├── dev.js                        ← 開發伺服器
├── build.js                      ← 建置邏輯
├── utils.js                      ← 工具函式
└── package.json                  ← NPM 設定
```

---

## 🔧 運作原理

### **流程圖**

```
使用者進入首頁
    ↓
選擇名片樣板
    ↓
填寫表單（姓名、職稱、聯絡資訊等）
    ↓
點擊「製作名片」
    ↓
系統將資料編碼成 Base64/GZIP
    ↓
生成 LIFF URL（資料嵌入 URL 中）
    ↓
使用者在 LINE 開啟 LIFF URL
    ↓
LIFF 初始化 + 登入
    ↓
解碼 URL 中的名片資料
    ↓
渲染 Flex Message 預覽
    ↓
使用者點擊「分享好友」
    ↓
liff.shareTargetPicker() 彈出好友選擇
    ↓
完成分享！
```

### **關鍵技術**

#### 1. **資料編碼方式**

**方式 A：JSON5 Base64（小型資料）**
```javascript
// 名片資料
const vcard = { name: '王小明', title: '工程師', phone: '0912345678' }

// 編碼成 Base64
const encoded = btoa(JSON.stringify(vcard))

// 嵌入 URL
const liffUrl = `https://liff.line.me/${LIFF_ID}/share.html?data=${encoded}`
```

**方式 B：JSON5 GZIP Base64（大型資料）**
```javascript
// 使用 pako 壓縮
const compressed = pako.gzip(JSON.stringify(vcard))
const encoded = btoa(String.fromCharCode(...compressed))
const liffUrl = `https://liff.line.me/${LIFF_ID}/share-json5gzip.html#${encoded}`
```

**方式 C：Google Sheet（即時讀取）**
```javascript
// 從公開的 Google Sheet 讀取
const sheetUrl = 'https://docs.google.com/spreadsheets/d/...'
const liffUrl = `https://liff.line.me/${LIFF_ID}/share-google-sheet.html?url=${sheetUrl}`
```

#### 2. **Flex Message 動態渲染**

名片樣板使用 JavaScript Template Literals：

```javascript
// chatbot-tw-1.txt 範例
{
  "type": "bubble",
  "body": {
    "type": "box",
    "contents": [
      {
        "type": "text",
        "text": "${vcard.name}",      // 動態替換
        "size": "xl",
        "weight": "bold"
      },
      {
        "type": "text",
        "text": "${vcard.title}",     // 動態替換
        "size": "sm"
      }
    ]
  }
}
```

渲染邏輯：
```javascript
// 讀取樣板
const tpl = await fetch('/cards/chatbot-tw-1.txt').then(r => r.text())

// 替換變數
const rendered = new Function('vcard', `return \`${tpl}\``)(vcardData)

// 分享
await liff.shareTargetPicker([JSON.parse(rendered)])
```

#### 3. **LIFF 分享功能**

```javascript
// share.pug 核心邏輯
async btnShare() {
  try {
    // 取得渲染後的訊息
    const msgs = this.getRenderedMsgs()
    
    // 彈出好友選擇視窗
    await liff.shareTargetPicker(msgs)
    
    // 分享成功
    await this.swalFire({ icon: 'success', title: '分享成功' })
  } catch (err) {
    console.error(err)
  }
}

// 傳送到目前聊天室
async btnSend() {
  const msgs = this.getRenderedMsgs()
  await liff.sendMessages(msgs)
  liff.closeWindow()
}
```

---

## ⚙️ 環境設定

### **必要環境變數**（`.env`）

```env
# 網站根網址（用於生成連結）
BASEURL=https://your-domain.com/

# LIFF ID（Size: FULL）
LIFFID_FULL=1234567890-AbCdEfGh

# GitHub Pages 自訂域名（選用）
CNAME=cards.example.com

# 開發模式（僅本機使用）
NODE_ENV=development
```

### **LIFF 設定需求**

在 LINE Developers Console 設定：

| 項目 | 設定值 |
|------|--------|
| **Size** | Full（全螢幕） |
| **Endpoint URL** | `https://your-domain.com/liff-full/` |
| **Scope** | ✅ `profile`<br>✅ `openid`<br>✅ `chat_message.write` |
| **Bot link feature** | On (Normal) - 選用 |

⚠️ **重要**：必須勾選 `chat_message.write` 才能使用 `shareTargetPicker()`

---

## 🚀 部署方式

### **方案 A：GitHub Pages（推薦）**

專案內建 GitHub Actions 自動部署：

1. Fork 專案到您的 GitHub
2. 設定 Repository Secrets：
   ```
   BASEURL=https://your-username.github.io/liff-businesscard/
   LIFFID_FULL=你的LIFF_ID
   ```
3. 推送 commit 後自動建置並部署到 GitHub Pages
4. 更新 LIFF Endpoint URL 為 GitHub Pages 網址

### **方案 B：Vercel / Netlify**

```bash
# 1. 建置靜態檔案
npm run build

# 2. 上傳 dist/ 目錄到平台
```

### **方案 C：本機開發**

```bash
# 1. 複製環境變數
cp example.env .env

# 2. 填寫 LIFF ID
# 編輯 .env：LIFFID_FULL=你的LIFF_ID

# 3. 安裝相依套件
npm install
# 或使用 yarn
yarn install

# 4. 啟動開發伺服器
npm run dev
# 預設：http://localhost:3000

# 5. （選用）設定 HTTPS
yarn mkcert  # 生成本機 SSL 憑證
yarn dev     # 使用 HTTPS 啟動
```

---

## 🆚 與您原專案的比較

| 項目 | **您的專案**<br>（h:\360LINE） | **liff-businesscard-master** |
|------|------------------------------|------------------------------|
| **技術棧** | Next.js 15 + React 19 | Pug + 靜態生成 |
| **後端** | ✅ 需要（API Routes） | ❌ 不需要（純前端） |
| **資料庫** | ✅ JSON / PostgreSQL | ❌ 不需要（資料在 URL） |
| **身分驗證** | ✅ LINE idToken 驗證 + Session | ⚠️ 僅前端（無驗證） |
| **名片管理** | ✅ 後台編輯 `/admin` | ❌ 無後台（填表後即分享） |
| **名片儲存** | ✅ Server 端儲存 | ❌ 資料嵌入 URL |
| **vCard 下載** | ✅ `/api/vcard/[slug]` | ❌ 無此功能 |
| **事件追蹤** | ✅ `/api/events` | ⚠️ Google Analytics（前端） |
| **樣板數量** | 1 個（可擴充） | 13 個（內建） |
| **適合場景** | 商用 SaaS、多用戶管理 | 個人使用、快速分享 |
| **部署難度** | ⭐⭐⭐ 需要伺服器 | ⭐ 靜態託管即可 |
| **安全性** | ✅ Server 驗證 + Session | ⚠️ 無權限管控 |
| **擴充性** | ✅ 易於加入新功能 | ⚠️ 需修改建置腳本 |

---

## 💡 可借鑑之處

### 1️⃣ **樣板系統**
- 可將 13 種樣板整合到您的專案
- 在後台加入「選擇樣板」功能
- 使用 JavaScript Template Literals 做動態替換

### 2️⃣ **資料編碼技術**
- 分享連結時可選擇性「嵌入資料」或「使用 slug」
- 臨時分享：資料嵌入 URL（無需儲存）
- 永久名片：儲存到資料庫（有 slug）

### 3️⃣ **多國語系**
- 參考 `i18n/` 的架構
- 支援中英文切換

### 4️⃣ **Google Sheet 整合**
- 批次匯入功能很實用
- 可用於企業/團隊名片管理

### 5️⃣ **Flex Message 預覽**
- 使用 `flex2html` 套件即時預覽
- 在分享前就能看到實際效果

---

## 🎯 整合建議

### **方案 A：混合模式（推薦）**

將兩個專案優勢結合：

```
您的專案（後端 + 管理）
    ↓
+ liff-businesscard（樣板 + 前端）
    ↓
= 完整商用解決方案
```

**實作步驟**：

1. **保留您的架構**
   - Next.js + API Routes
   - 身分驗證 + Session
   - 資料庫儲存

2. **整合 liff-businesscard 的樣板**
   ```
   h:\360LINE\
   ├── lib/
   │   └── templates/          ← 新增
   │       ├── chatbot-tw-1.ts
   │       ├── chatgpt-1.ts
   │       └── ...（13 個樣板）
   ```

3. **在後台加入「樣板選擇」**
   ```tsx
   // app/admin/ui.tsx
   <select name="template">
     <option value="default">預設樣板</option>
     <option value="chatbot-tw-1">Chatbot 台灣</option>
     <option value="chatgpt-1">ChatGPT 風格</option>
     <option value="psprint-592">Corporate Buzz</option>
   </select>
   ```

4. **動態渲染 Flex Message**
   ```typescript
   // lib/templates/renderer.ts
   export function renderTemplate(templateId: string, vcard: Card) {
     const tpl = templates[templateId]
     return new Function('vcard', `return \`${tpl}\``)(vcard)
   }
   ```

5. **分享時支援兩種模式**
   - 模式 1：使用 slug（需登入、永久）
   - 模式 2：嵌入資料（臨時分享、無需登入）

### **方案 B：直接使用 liff-businesscard**

如果您只需要快速上線，可直接使用：

1. Fork `liff-businesscard-master`
2. 部署到 GitHub Pages
3. 設定 LIFF ID
4. 客製化樣板和品牌

**優點**：
- ✅ 快速上線（1 小時內）
- ✅ 無需維護後端
- ✅ 13 種樣板立即可用

**缺點**：
- ❌ 無法追蹤名片瀏覽數
- ❌ 無法管理多張名片
- ❌ 無權限管控

---

## 📊 總結

| 評估項目 | 評分 | 說明 |
|---------|------|------|
| **功能完整度** | ⭐⭐⭐⭐☆ | 基本功能齊全，但缺乏管理後台 |
| **易用性** | ⭐⭐⭐⭐⭐ | 無需後端，填表即可分享 |
| **擴充性** | ⭐⭐⭐☆☆ | 靜態生成架構，擴充需修改建置流程 |
| **安全性** | ⭐⭐☆☆☆ | 無身分驗證，資料在 URL 中 |
| **商用化程度** | ⭐⭐☆☆☆ | 適合個人使用，不適合 SaaS |
| **部署難度** | ⭐⭐⭐⭐⭐ | GitHub Pages 一鍵部署 |
| **樣板豐富度** | ⭐⭐⭐⭐⭐ | 13 種精美樣板 |
| **文件完整度** | ⭐⭐⭐⭐☆ | 有完整教學文章 |

---

## 🚦 建議行動方案

### **立即可做（測試階段）**

1. ✅ 在本機啟動 `liff-businesscard-master`
2. ✅ 體驗 13 種樣板的功能
3. ✅ 測試 LIFF 分享流程
4. ✅ 研究您最喜歡的 3-5 個樣板原始碼

### **短期目標（1-2 週）**

1. 📋 決定整合方案（混合模式 or 直接使用）
2. 🎨 挑選適合您品牌的樣板
3. 🔧 客製化樣板顏色、文字、Logo
4. 🚀 部署測試版本到 GitHub Pages

### **長期目標（商用化）**

1. 💼 將樣板整合到您的 Next.js 專案
2. 🔐 保留身分驗證和權限管控
3. 📊 加入進階分析功能
4. 💳 規劃付費方案（多樣板、進階功能）

---

**需要我協助您進行哪個步驟？**

選項：
- 🧪 在本機啟動並測試 liff-businesscard
- 🔀 規劃兩個專案的整合方案
- 🎨 客製化特定樣板
- 📦 部署到 GitHub Pages
