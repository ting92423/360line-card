# 360LINE 對標：LINE LIFF 電子名片（MVP）

這是一個 **深度整合 LINE 生態（LIFF）**的電子名片 MVP，包含：

- 名片展示頁：`/c/[slug]`
- 一鍵加好友（導向官方帳號）
- 一鍵分享（`liff.shareTargetPicker` + Flex Message）
- vCard 下載（`/api/vcard/[slug]` → `.vcf`）
- 後台（LIFF）：`/admin` 取得 LINE profile，自動帶入資料並儲存

> 注意：本 MVP 用 `data/cards.json` 做簡易儲存（適合本機 Demo）。正式上線建議改為 PostgreSQL / Redis，並加上 **LINE Login + 後端驗證 access token**。

## 本機啟動

1) 安裝依賴

```bash
npm install
```

2) 設定環境變數

把 `env.example` 複製成 `.env.local`，並填入你的 LIFF ID / OA Basic ID：

```bash
copy env.example .env.local
```

你至少需要填：

- `NEXT_PUBLIC_LIFF_ID`
- `NEXT_PUBLIC_LINE_OA_BASIC_ID`
- `LINE_CHANNEL_ID`（用於 server 驗證 idToken）
- `SESSION_SECRET`（簽名 session cookie）

3) 開發模式

```bash
npm run dev
```

打開：

- `http://localhost:3000/` 首頁
- `http://localhost:3000/c/demo` 示範名片
- `http://localhost:3000/admin` 後台（需要在 LIFF 環境）

## LINE Developers / LIFF 必做設定

### 1) 建立 Channel + LIFF App

在 LINE Developers 建立：

- **Messaging API Channel**（綁定你的官方帳號）
- 在同一 Provider 下建立 **LIFF app**

### 2) LIFF Endpoint URL

把 LIFF Endpoint 指向你的名片頁（或後台頁）：

- 例如：`https://your-domain.com/admin`
- 或：`https://your-domain.com/c/demo`

### 3) 加好友提示（bot_prompt）

要達成「授權時順便跳出加入好友」：

- 在 LIFF 設定開啟 **Add friend option / bot_prompt**（通常設為 `normal`）

### 4) ShareTargetPicker

要使用 `liff.shareTargetPicker()`：

- LIFF 必須允許 share（並在 LINE 版本/裝置上測試）

## 商用版：Auth / 權限

本專案已加入「商用級」基礎權限：

- `/admin` 會先取得 `liff.getIDToken()` → `POST /api/auth/verify`
- server 端呼叫 LINE `oauth2/v2.1/verify` 驗 idToken
- 驗過後寫入 `HttpOnly` 的 `line_session` cookie
- `PUT /api/cards/[slug]` 需要 session（沒有就是 `401`）

### 必填環境變數

- `LINE_CHANNEL_ID`
- `SESSION_SECRET`

> 注意：若你用的是 Messaging API channel / LIFF channel 組合，請確認 `LINE_CHANNEL_ID` 對應到你用來簽發 idToken 的那個 channel。

## 路由與 API

- 名片頁：`/c/[slug]`
- 讀取名片：`GET /api/cards/[slug]`
- 儲存名片：`PUT /api/cards/[slug]`
- 下載通訊錄：`GET /api/vcard/[slug]`（回傳 `.vcf`）
- 事件追蹤：`POST /api/events`
- 登出：`POST /api/auth/logout`

## 下一步（你要做成商用版時）

- 後端：改用 PostgreSQL（並加上 migrations）
- Auth：LINE Login（或 LIFF access token）→ 後端驗證 `ownerLineUserId`
- 分析：名片 view / 分享 / 加好友 click（GA4 或自建 event 表）
- Flex：更漂亮的 Bubble / Carousel（可支援多模板）
- 分享裂變：名片內嵌「一鍵加入官方帳號」與「一鍵預約/表單」CTA

