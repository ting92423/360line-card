# 🚀 Vercel 部署完成指南

## ✅ 已完成的步驟

1. ✅ Git 初始化並提交代碼
2. ✅ 創建 GitHub Repository: https://github.com/ting92423/360line-card
3. ✅ 推送代碼到 GitHub
4. ✅ 連接 Vercel 並開始部署
5. ✅ 修正循環導入錯誤

---

## 📊 您的 Vercel 專案資訊

**專案名稱**: `line360-card`  
**生產環境 URL**: https://line360-card.vercel.app (部署完成後)  
**Dashboard**: https://vercel.com/ting92423s-projects/line360-card

---

## ⚙️ 必須設定的環境變數

請在 Vercel Dashboard 中設定以下環境變數：

### 1. LINE LIFF 設定

```env
NEXT_PUBLIC_LIFF_ID=你的LIFF_ID
```
**取得方式**: LINE Developers Console > LIFF 分頁 > 您建立的 LIFF App

---

### 2. LINE 官方帳號

```env
NEXT_PUBLIC_LINE_OA_BASIC_ID=@你的官方帳號ID
```
**取得方式**: LINE Developers Console > Messaging API Channel > Basic ID

---

### 3. LINE Channel ID

```env
LINE_CHANNEL_ID=你的Channel_ID
```
**取得方式**: LINE Developers Console > LINE Login Channel > Basic settings > Channel ID

---

### 4. Session Secret

```env
SESSION_SECRET=你的隨機字串
```

**生成方式**:
```powershell
powershell -ExecutionPolicy Bypass -File generate-secret.ps1
```

或手動生成 64 字元的隨機字串。

---

### 5. 應用網址（自動設定）

```env
NEXT_PUBLIC_APP_ORIGIN=https://line360-card.vercel.app
```

⚠️ **重要**: 等 Vercel 部署完成後，使用您實際的 Vercel 網址替換此值。

---

### 6. 資料庫（選用）

如果您使用 PostgreSQL：

```env
DATABASE_URL=postgres://user:password@host:5432/dbname
```

如果不填，系統會使用 `data/cards.json` 作為儲存。

---

## 📋 環境變數設定步驟

1. **開啟 Vercel Dashboard**  
   https://vercel.com/ting92423s-projects/line360-card/settings/environment-variables

2. **逐一新增環境變數**
   - 點擊 "Add New"
   - 輸入 Name (例如：`NEXT_PUBLIC_LIFF_ID`)
   - 輸入 Value (您的實際值)
   - 選擇 Environment：勾選 **Production**, **Preview**, **Development**
   - 點擊 "Save"

3. **重新部署**  
   設定完所有環境變數後，前往 "Deployments" 分頁，點擊最新部署的 "..." 按鈕，選擇 "Redeploy"。

---

## 🔄 更新 LINE Developers 設定

部署完成後，您需要更新 LINE Developers 的 LIFF Endpoint URL：

### 1. 取得 Vercel 網址
部署完成後，Vercel 會顯示類似：
```
https://line360-card.vercel.app
```

### 2. 更新 LIFF Endpoint
前往 LINE Developers Console：
1. 進入您的 LINE Login Channel
2. 前往 "LIFF" 分頁
3. 編輯您的 LIFF App
4. 將 **Endpoint URL** 改為：  
   `https://line360-card.vercel.app/admin`
5. 儲存

---

## 🧪 測試流程

### 1. 確認部署成功
訪問：https://line360-card.vercel.app

應該會看到首頁，並有兩個按鈕：
- "查看示範名片"
- "前往後台 (LIFF)"

### 2. 測試 Demo 名片
訪問：https://line360-card.vercel.app/c/demo

應該顯示示範名片資訊。

### 3. 在 LINE 中測試後台
1. 在 LINE 聊天中傳送：`https://liff.line.me/YOUR_LIFF_ID`
2. 應該開啟後台並自動取得您的 LINE Profile
3. 填寫名片資訊並儲存
4. 測試分享功能

---

## ⚠️ 常見問題

### Q1: 部署失敗顯示環境變數錯誤
**解決方式**: 確認所有必要的環境變數都已設定，特別是 `NEXT_PUBLIC_` 開頭的變數。

### Q2: LIFF 初始化失敗
**原因**: 
- `NEXT_PUBLIC_LIFF_ID` 沒有設定
- LINE Developers 的 Endpoint URL 不正確

**解決方式**:
1. 確認 Vercel 環境變數中有 `NEXT_PUBLIC_LIFF_ID`
2. 確認 LINE Developers 的 Endpoint URL 是 `https://line360-card.vercel.app/admin`

### Q3: 401 Unauthorized 錯誤
**原因**: `LINE_CHANNEL_ID` 或 `SESSION_SECRET` 沒有設定

**解決方式**: 在 Vercel 設定這兩個環境變數

### Q4: 分享功能無法使用
**原因**: 
- LIFF Scope 沒有包含 `chat_message.write`
- 不在 LINE 環境中測試

**解決方式**:
1. 確認 LINE Developers > LIFF 的 Scope 包含 `chat_message.write`
2. 必須在 LINE App 中開啟測試

---

## 🎯 下一步

1. ✅ **設定所有環境變數** (最重要)
2. ✅ **更新 LINE Developers 的 Endpoint URL**
3. ✅ **在 LINE 中測試完整流程**
4. ⭕ **設定自定義域名** (選用，例如 `card.yourdomain.com`)
5. ⭕ **設定 PostgreSQL** (如需要更穩定的資料庫)

---

## 📞 需要協助？

如果遇到任何問題：
1. 檢查 Vercel 的 "Logs" 查看錯誤訊息
2. 檢查 LINE Developers Console 的設定
3. 確認所有環境變數都已正確設定
4. 在瀏覽器 Console 查看前端錯誤訊息

---

**祝部署順利！** 🚀
