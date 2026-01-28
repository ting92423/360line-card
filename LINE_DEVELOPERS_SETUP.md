# LINE Developers 完整設定指南

## 📋 設定檢查清單

- [ ] 1. 登入 LINE Developers Console
- [ ] 2. 建立 Provider
- [ ] 3. 建立 Messaging API Channel
- [ ] 4. 建立 LIFF App
- [ ] 5. 設定 LIFF Endpoint URL
- [ ] 6. 啟用加好友提示（bot_prompt）
- [ ] 7. 取得必要的金鑰和 ID
- [ ] 8. 更新專案環境變數

---

## 🚀 詳細設定步驟

### 步驟 1：登入 LINE Developers Console

1. 前往：https://developers.line.biz/console/
2. 使用您的 LINE 帳號登入
3. 如果是第一次使用，需要同意開發者條款

---

### 步驟 2：建立 Provider

> Provider 是管理您所有 Channel 的容器

1. 點擊「Create a new provider」
2. 輸入 Provider 名稱（例如：`360LINE` 或您的公司名稱）
3. 點擊「Create」

**重要**：一個 Provider 可以包含多個 Channels，建議以公司或專案為單位建立

---

### 步驟 3：建立 Messaging API Channel

> 這個 Channel 對應到您的 LINE 官方帳號

1. 進入剛建立的 Provider
2. 點擊「Create a new channel」
3. 選擇「Messaging API」
4. 填寫資訊：
   - **Channel name**：名片官方帳號（對外顯示的名稱）
   - **Channel description**：電子名片服務
   - **Category**：選擇合適的分類（例如：Business）
   - **Subcategory**：選擇子分類
   - **Email address**：您的聯絡信箱
5. 閱讀並同意條款
6. 點擊「Create」

**完成後記錄以下資訊**：
```
✅ Channel ID: __________________ (例如：1234567890)
✅ Channel Secret: __________________ 
✅ 官方帳號 Basic ID: __________________ (例如：@abc1234)
```

#### 額外設定（在 Messaging API 頁面）：

7. 前往「Messaging API」分頁
8. 找到「Basic ID」→ 這就是您的官方帳號 ID（會顯示為 `@xxxxx`）
9. **關閉自動回應**：
   - 點擊「LINE Official Account features」
   - 進入 LINE Official Account Manager
   - 設定 > 回應設定 > 關閉「自動回應訊息」（否則會干擾您的功能）

---

### 步驟 4：建立 LIFF App

> LIFF 讓您的網頁在 LINE 內執行，並取得使用者授權

1. 在同一個 Provider 下，點擊「Create a new channel」
2. **選擇「LINE Login」**（LIFF 屬於 LINE Login）
3. 填寫資訊：
   - **Channel name**：360LINE 名片系統
   - **Channel description**：LIFF 電子名片應用
   - **App types**：勾選「Web app」
   - **Email address**：您的聯絡信箱
4. 點擊「Create」

#### 建立 LIFF Endpoint：

5. 進入剛建立的 LINE Login Channel
6. 前往「LIFF」分頁
7. 點擊「Add」
8. 填寫 LIFF 設定：

   **開發環境（本機測試）**：
   ```
   LIFF app name: 名片後台-開發版
   Size: Full
   Endpoint URL: http://localhost:3000/admin
   Scope: profile, openid
   Bot link feature: On (Normal)
   ```
   
   **正式環境（部署後）**：
   ```
   LIFF app name: 名片後台
   Size: Full
   Endpoint URL: https://your-domain.com/admin
   Scope: profile, openid
   Bot link feature: On (Normal)
   Module mode: Off
   ```

9. 點擊「Add」

**完成後記錄**：
```
✅ LIFF ID: __________________ (例如：1234567890-AbCdEfGh)
```

---

### 步驟 5：設定加好友提示（bot_prompt）

> 讓使用者授權 LIFF 時，同時彈出「加入官方帳號」提示

1. 在 LIFF 設定頁面中
2. 找到「Bot link feature」
3. 設定為：**On (Normal)** 或 **On (Aggressive)**
   - **Normal**：使用者可選擇是否加入
   - **Aggressive**：更積極提示（建議用 Normal）

4. **連結 Messaging API Channel**：
   - 點擊「Bot link feature」下方的「Link」
   - 選擇您在步驟 3 建立的 Messaging API Channel
   - 確認連結

---

### 步驟 6：設定 Scope & Permissions

1. 在 LINE Login Channel 的「LIFF」分頁中
2. 確認每個 LIFF App 的 Scope 包含：
   - ✅ `profile` - 取得使用者名稱、頭像
   - ✅ `openid` - 取得 ID Token（用於身分驗證）

3. 如果需要取得 Email，可額外加入：
   - `email` - 需要使用者額外授權

---

### 步驟 7：取得 Channel Access Token（選用）

> 如果未來需要主動發送訊息，需要這個 Token

1. 回到 Messaging API Channel
2. 前往「Messaging API」分頁
3. 找到「Channel access token」
4. 點擊「Issue」生成 Token

**記錄**：
```
✅ Channel Access Token: ____________________
```

⚠️ **注意**：此 Token 具有發送訊息的權限，請妥善保管！

---

### 步驟 8：更新專案環境變數

1. 複製 `env.example` 為 `.env.local`：
   ```bash
   copy env.example .env.local
   ```

2. 填入剛才記錄的資訊：

   ```env
   # LIFF 設定
   NEXT_PUBLIC_LIFF_ID=1234567890-AbCdEfGh
   
   # 官方帳號（步驟 3 的 Basic ID，可含或不含 @）
   NEXT_PUBLIC_LINE_OA_BASIC_ID=@abc1234
   
   # LINE Login Channel ID（步驟 4 的 Channel ID）
   LINE_CHANNEL_ID=1234567890
   
   # Session 簽章密鑰（請改成隨機字串，至少 32 字元）
   SESSION_SECRET=your-super-secret-random-string-min-32-chars
   
   # 應用網址（選填，SSR 時需要）
   NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000
   
   # PostgreSQL（選填，未填則用 JSON 儲存）
   # DATABASE_URL=postgres://user:password@localhost:5432/dbname
   ```

3. 生成安全的 `SESSION_SECRET`：
   ```bash
   # PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

---

## 🧪 測試流程

### 本機測試（開發環境）

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 在手機上使用 LINE 開啟 LIFF URL：
   ```
   https://liff.line.me/YOUR_LIFF_ID
   ```
   
   或掃描 QR Code（用 LINE QR Code Scanner 生成器）

3. 測試流程：
   - ✅ LIFF 初始化成功
   - ✅ 彈出授權畫面
   - ✅ 彈出「加入好友」提示
   - ✅ 取得 LINE Profile（顯示名稱、頭像）
   - ✅ 儲存名片成功
   - ✅ 前往名片頁面
   - ✅ 測試分享功能（選好友視窗）
   - ✅ 測試加好友按鈕

---

## ⚠️ 常見問題

### Q1: LIFF 初始化失敗（liff.init error）

**可能原因**：
- ❌ LIFF ID 錯誤
- ❌ Endpoint URL 與實際網址不符
- ❌ 本機測試但設定了 HTTPS 網址

**解決方法**：
- 檢查 `.env.local` 的 `NEXT_PUBLIC_LIFF_ID`
- 本機測試時，LIFF Endpoint 要設為 `http://localhost:3000/admin`
- 正式環境必須使用 HTTPS

---

### Q2: idToken 驗證失敗（401 Unauthorized）

**可能原因**：
- ❌ `LINE_CHANNEL_ID` 填錯（要填 LINE Login Channel 的 ID）
- ❌ Channel ID 與 LIFF ID 不匹配

**解決方法**：
- 確認 `LINE_CHANNEL_ID` 是「LINE Login Channel」的 ID
- 在 LINE Developers 檢查 LIFF 屬於哪個 Channel

---

### Q3: 沒有彈出「加入好友」提示

**可能原因**：
- ❌ Bot link feature 未啟用
- ❌ 沒有連結 Messaging API Channel

**解決方法**：
- 進入 LIFF 設定 > Bot link feature > 設為 On (Normal)
- 點擊「Link」連結到您的 Messaging API Channel

---

### Q4: 本機測試無法使用 LIFF

**解決方法**：
- LINE LIFF 必須在 **LINE 內建瀏覽器** 中測試
- 無法在一般瀏覽器中使用（會失敗）
- 建議使用 **ngrok** 或 **Vercel Preview** 部署測試版本：
  
  ```bash
  # 使用 ngrok
  npx ngrok http 3000
  # 將產生的 https URL 設定到 LIFF Endpoint
  ```

---

### Q5: 分享功能無法使用

**可能原因**：
- ❌ 不在 LINE 內建瀏覽器
- ❌ LINE 版本太舊

**解決方法**：
- 確保在 LINE App 中開啟（不是 Chrome/Safari）
- 更新 LINE 到最新版本
- 如果仍無法使用，會自動降級為「複製連結」

---

## 📱 正式部署檢查清單

準備正式上線前，請確認：

- [ ] 已部署到正式環境（Vercel / 其他平台）
- [ ] 取得正式 HTTPS 網址
- [ ] 更新 LIFF Endpoint URL 為正式網址
- [ ] 在 `.env` 或平台環境變數中設定所有金鑰
- [ ] `SESSION_SECRET` 使用強隨機字串
- [ ] 如果使用 PostgreSQL，已建立資料庫並填入 `DATABASE_URL`
- [ ] 測試完整流程（授權 → 建立名片 → 分享 → 加好友）
- [ ] LINE Official Account Manager 已關閉自動回應
- [ ] 設定 Webhook（如需接收訊息）

---

## 🎯 快速參考

### 重要連結

- LINE Developers Console: https://developers.line.biz/console/
- LINE Official Account Manager: https://manager.line.biz/
- LIFF 文件: https://developers.line.biz/en/docs/liff/
- LINE Messaging API 文件: https://developers.line.biz/en/docs/messaging-api/

### 環境變數對照表

| 環境變數 | 取得位置 | 必填 |
|---------|---------|------|
| `NEXT_PUBLIC_LIFF_ID` | LINE Login Channel > LIFF | ✅ |
| `NEXT_PUBLIC_LINE_OA_BASIC_ID` | Messaging API Channel > Basic ID | ✅ |
| `LINE_CHANNEL_ID` | LINE Login Channel > Basic settings | ✅ |
| `SESSION_SECRET` | 自行生成隨機字串 | ✅ |
| `NEXT_PUBLIC_APP_ORIGIN` | 您的網站網址 | ⭕ |
| `DATABASE_URL` | PostgreSQL 連線字串 | ⭕ |

---

## 💡 小技巧

1. **開發時使用多個 LIFF**：
   - 建立兩個 LIFF：一個指向本機（localhost），一個指向正式環境
   - 可同時開發測試而不互相干擾

2. **QR Code 快速測試**：
   - 使用 https://liff.line.me/YOUR_LIFF_ID 生成 QR Code
   - 用 LINE 掃描即可直接開啟

3. **Debug 模式**：
   - 在瀏覽器 Console 查看 LIFF 錯誤訊息
   - 使用 `liff.getOS()` 確認環境
   - 使用 `liff.isInClient()` 確認是否在 LINE 內

---

**設定完成後，執行 `npm run dev` 並開始測試！** 🚀
