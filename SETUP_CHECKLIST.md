# 🎯 LINE Developers 設定快速檢查表

## ✅ 完成進度追蹤

### 第一階段：LINE Developers Console 設定

- [ ] **1-1. 登入 LINE Developers**
  - 網址：https://developers.line.biz/console/
  - 使用 LINE 帳號登入

- [ ] **1-2. 建立 Provider**
  - Provider 名稱：`___________________`
  - 記錄 Provider ID（僅供參考）

- [ ] **1-3. 建立 Messaging API Channel**
  - Channel 名稱：`___________________`
  - 記錄以下資訊：
    ```
    Channel ID: YOUR_CHANNEL_ID
    Channel Secret: YOUR_CHANNEL_SECRET
    Basic ID (官方帳號): @YOUR_BASIC_ID
    ```

- [ ] **1-4. Messaging API 額外設定**
  - [ ] 前往 LINE Official Account Manager
  - [ ] 關閉「自動回應訊息」
  - [ ] （選用）生成 Channel Access Token: YOUR_CHANNEL_ACCESS_TOKEN

- [ ] **1-5. 建立 LINE Login Channel**
  - Channel 名稱：`___________________`
  - 記錄 Channel ID：`___________________`

- [ ] **1-6. 建立 LIFF App（開發版）**
  - LIFF 名稱：名片後台-開發版
  - Size：Full
  - Endpoint URL：`http://localhost:3000/admin`
  - Scope：✅ profile ✅ openid
  - Bot link feature：✅ On (Normal)
  - 記錄 LIFF ID：`YOUR_LIFF_ID`

- [ ] **1-7. 連結 Bot（加好友提示）**
  - [ ] 在 LIFF 設定中點擊「Link」
  - [ ] 連結到步驟 1-3 的 Messaging API Channel

---

### 第二階段：本機環境設定

- [ ] **2-1. 複製環境變數範本**
  ```bash
  copy env.example .env.local
  ```

- [ ] **2-2. 生成 SESSION_SECRET**
  ```bash
  powershell -ExecutionPolicy Bypass -File generate-secret.ps1
  ```
  生成的 SECRET：`___________________`

- [ ] **2-3. 填寫 .env.local**
  ```env
  NEXT_PUBLIC_LIFF_ID=___________________
  NEXT_PUBLIC_LINE_OA_BASIC_ID=@___________________
  LINE_CHANNEL_ID=___________________
  SESSION_SECRET=___________________
  NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000
  ```

- [ ] **2-4. 安裝相依套件**
  ```bash
  npm install
  ```

- [ ] **2-5. 啟動開發伺服器**
  ```bash
  npm run dev
  ```

---

### 第三階段：本機測試

- [ ] **3-1. 準備測試**
  - [ ] 開發伺服器已啟動（http://localhost:3000）
  - [ ] 手機已安裝 LINE App（最新版）
  - [ ] 手機與電腦在同一網路（或使用 ngrok）

- [ ] **3-2. 開啟 LIFF**
  - 方式 1：在 LINE 聊天中傳送 LIFF URL 給自己：
    ```
    https://liff.line.me/YOUR_LIFF_ID
    ```
  - 方式 2：用 LINE 掃描 QR Code（需先生成）

- [ ] **3-3. 測試授權流程**
  - [ ] LIFF 成功初始化（沒有錯誤訊息）
  - [ ] 彈出授權同意畫面
  - [ ] 彈出「加入官方帳號」提示
  - [ ] 成功取得使用者名稱
  - [ ] 成功取得使用者頭像

- [ ] **3-4. 測試名片功能**
  - [ ] 後台表單顯示正常
  - [ ] 可以填寫名片資料
  - [ ] 點擊「儲存名片」成功
  - [ ] 自動跳轉到名片頁面（/c/xxx）
  - [ ] 名片資料顯示正確

- [ ] **3-5. 測試互動功能**
  - [ ] 點擊「分享名片」彈出好友選擇視窗
  - [ ] 可以選擇好友並成功分享
  - [ ] 對方收到 Flex Message 格式的名片
  - [ ] 點擊「加入好友」可正確跳轉
  - [ ] 點擊「下載通訊錄」可下載 .vcf 檔案

---

### 第四階段：正式環境部署（選用）

- [ ] **4-1. 部署到正式環境**
  - 平台：`___________________ (Vercel/其他)`
  - 正式網址：`___________________`

- [ ] **4-2. 設定正式環境變數**
  - [ ] 在平台設定 `NEXT_PUBLIC_LIFF_ID`
  - [ ] 在平台設定 `NEXT_PUBLIC_LINE_OA_BASIC_ID`
  - [ ] 在平台設定 `LINE_CHANNEL_ID`
  - [ ] 在平台設定 `SESSION_SECRET`（使用新的隨機字串）
  - [ ] （選用）設定 `DATABASE_URL`

- [ ] **4-3. 建立正式版 LIFF**
  - LIFF 名稱：名片後台
  - Endpoint URL：`https://your-domain.com/admin`
  - 其他設定同開發版
  - 記錄 LIFF ID：`___________________`
  - 更新環境變數中的 `NEXT_PUBLIC_LIFF_ID`

- [ ] **4-4. 正式環境測試**
  - [ ] 重複第三階段所有測試項目
  - [ ] 確認 HTTPS 連線正常
  - [ ] 測試分享連結可正常開啟
  - [ ] 測試多位使用者同時使用

---

## 🚨 常見問題快速排解

| 問題 | 可能原因 | 檢查項目 |
|------|---------|---------|
| LIFF 初始化失敗 | LIFF ID 錯誤 | ✅ 檢查 `.env.local` 的 `NEXT_PUBLIC_LIFF_ID` |
| | Endpoint URL 不符 | ✅ 本機測試要用 `http://localhost:3000/admin` |
| 401 Unauthorized | Channel ID 錯誤 | ✅ 確認 `LINE_CHANNEL_ID` 是 LINE Login Channel 的 ID |
| 沒有加好友提示 | Bot link 未啟用 | ✅ LIFF 設定中開啟 Bot link feature |
| | 未連結 Channel | ✅ 點擊 Link 連結到 Messaging API Channel |
| 無法分享 | 不在 LINE 內 | ✅ 必須用 LINE 內建瀏覽器開啟 |
| | LINE 版本太舊 | ✅ 更新 LINE App |
| 本機無法測試 | 網路問題 | ✅ 使用 ngrok 或部署預覽版本 |

---

## 📋 重要資訊記錄卡

請完整填寫此表，供日後維護使用：

```
專案名稱：360LINE 電子名片系統

=== LINE Developers ===
Provider 名稱：___________________
Provider ID：___________________

=== Messaging API Channel ===
Channel 名稱：___________________
Channel ID：___________________
Channel Secret：___________________
官方帳號 Basic ID：@___________________
Channel Access Token：___________________

=== LINE Login Channel ===
Channel 名稱：___________________
Channel ID：___________________

=== LIFF Apps ===
開發版 LIFF ID：YOUR_LIFF_ID
  └─ Endpoint：http://localhost:3000/editor

正式版 LIFF ID：___________________
  └─ Endpoint：https://___________________

=== 環境變數 ===
開發版 SESSION_SECRET：___________________
正式版 SESSION_SECRET：___________________
DATABASE_URL（如有）：___________________

=== 部署資訊 ===
正式網址：https://___________________
部署平台：___________________
最後更新日期：___________________
```

---

## ✅ 設定完成確認

全部打勾後，恭喜您完成 LINE Developers 設定！🎉

- [ ] 所有 LINE Developers 設定已完成
- [ ] 所有環境變數已正確填寫
- [ ] 本機測試全部通過
- [ ] （選用）正式環境已部署並測試完成
- [ ] 重要資訊已記錄並妥善保管

---

**下一步**：開始開發商用功能！💪

參考完整文件：`LINE_DEVELOPERS_SETUP.md`
