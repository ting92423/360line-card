# 整合測試指南

## 🧪 快速測試流程

### 1. 啟動開發伺服器

```bash
cd h:\360LINE
npm run dev
```

訪問：http://localhost:3000

---

### 2. 測試樣板渲染（API 測試）

在瀏覽器 Console 中執行：

```javascript
// 測試渲染引擎
const testCard = {
  slug: 'test',
  template: 'chatbot-tw-1',
  displayName: '測試使用者',
  title: '資深工程師',
  company: 'Test Company',
  phone: '0912345678',
  email: 'test@example.com',
  website: 'https://example.com',
  avatarUrl: '/avatar-placeholder.svg',
  lineOaBasicId: '@test',
  social: {
    instagram: 'https://instagram.com/test',
    facebook: 'https://facebook.com/test'
  }
}

// 呼叫渲染（需要在 Node.js 環境）
// const { renderTemplate } = require('./lib/templates/renderer')
// console.log(renderTemplate('chatbot-tw-1', testCard))
```

---

### 3. 測試後台選擇器

#### 訪問後台（需要 LIFF 環境）
- URL：http://localhost:3000/admin
- 需要在 LINE App 中開啟（LIFF 環境）

#### 本機測試（跳過 LIFF）
如果還沒設定 LIFF，可以暫時修改後台來跳過驗證：

**臨時測試方案**（不要提交到 git）：
1. 開啟 `app/admin/ui.tsx`
2. 在 `useEffect` 最前面加入：
   ```typescript
   // 臨時測試：跳過 LIFF
   if (process.env.NODE_ENV === 'development') {
     setLineUserId('test-user-123')
     setIsVerified(true)
     setDraft({
       ...draft,
       displayName: '測試使用者',
       slug: 'test-123'
     })
     setStatus('測試模式：已跳過 LIFF 驗證')
     return
   }
   ```

然後就可以直接訪問：http://localhost:3000/admin

---

### 4. 測試名片頁面

#### 預設樣板
```
http://localhost:3000/c/demo
```

應該顯示：
- ✅ 名片資訊正確顯示
- ✅ 頭像、姓名、職稱、公司
- ✅ 聯絡資訊（電話、Email、網站）
- ✅ 三個按鈕：加 LINE 好友、下載通訊錄、分享名片

---

### 5. 測試樣板切換

#### 方法 A：直接修改 JSON
編輯 `data/cards.json`，修改 template 欄位：

```json
{
  "cards": {
    "demo": {
      "template": "chatbot-tw-1"  // 改這裡
    }
  }
}
```

重新訪問：http://localhost:3000/c/demo

#### 方法 B：使用後台
1. 進入後台（/admin）
2. 選擇不同樣板
3. 點擊「儲存」
4. 點擊「預覽名片」

---

### 6. 測試分享功能（需要 LINE 環境）

**本機無法完整測試**，需要：
1. 部署到可訪問的 HTTPS 網址
2. 設定 LIFF Endpoint
3. 在 LINE App 中開啟

**替代測試（本機）**：
```javascript
// 在名片頁面 Console 執行
const card = {
  slug: 'demo',
  template: 'chatbot-tw-1',
  displayName: '測試使用者',
  // ... 其他欄位
}

import { renderTemplate } from '@/lib/templates/renderer'
const flexJson = renderTemplate('chatbot-tw-1', card)
console.log(JSON.parse(flexJson))
```

將輸出的 JSON 貼到 [Flex Message Simulator](https://developers.line.biz/flex-simulator/) 驗證。

---

## ✅ 測試檢查清單

### 後台測試
- [ ] 樣板選擇器顯示正常
- [ ] 下拉選單有 3 個選項
- [ ] 可以切換樣板
- [ ] 選擇樣板後儲存成功
- [ ] 儲存後 template 欄位正確

### 名片頁面測試
- [ ] 預設樣板顯示正常
- [ ] Chatbot 台灣樣板顯示正常
- [ ] Corporate Buzz 樣板顯示正常
- [ ] 所有資料正確顯示（姓名、職稱等）
- [ ] 按鈕功能正常

### API 測試
- [ ] `GET /api/cards/demo` 回傳包含 template 欄位
- [ ] `PUT /api/cards/[slug]` 可以儲存 template
- [ ] template 欄位驗證正常

### 渲染引擎測試
- [ ] renderTemplate('default', card) 正常
- [ ] renderTemplate('chatbot-tw-1', card) 正常
- [ ] renderTemplate('corporate-buzz', card) 正常
- [ ] 錯誤樣板 ID 會降級到 default
- [ ] 快取機制正常運作

---

## 🐛 常見問題排解

### Q1: 後台顯示「尚未設定 NEXT_PUBLIC_LIFF_ID」

**原因**：環境變數未設定

**解決**：
1. 確認 `.env.local` 存在
2. 填入 `NEXT_PUBLIC_LIFF_ID`
3. 重啟 dev server

**臨時方案**：使用上面的「跳過 LIFF」測試方案

---

### Q2: 樣板渲染失敗

**檢查**：
1. 開啟 Console 查看錯誤訊息
2. 確認 `lib/templates/` 目錄存在
3. 確認所有樣板檔案存在

**除錯**：
```javascript
// 在 Console 執行
import { getTemplateList } from '@/lib/templates/renderer'
console.log(getTemplateList())
```

---

### Q3: 選擇器沒有顯示樣板

**檢查**：
1. 確認 `app/admin/ui.tsx` 已更新
2. 確認沒有 TypeScript 錯誤
3. 重新整理頁面（Ctrl+F5）

---

### Q4: 分享功能無法測試

**本機限制**：
- `liff.shareTargetPicker()` 只能在 LINE App 中使用
- 需要 HTTPS 和正確的 LIFF 設定

**替代方案**：
使用 [Flex Message Simulator](https://developers.line.biz/flex-simulator/) 驗證 Flex JSON

---

## 📊 預期結果

### 預設樣板（default）
- 簡約清爽風格
- 頂部頭像 + 姓名
- 聯絡資訊列表
- 兩個按鈕（查看完整名片、下載通訊錄）

### Chatbot 台灣樣板（chatbot-tw-1）
- 科技感設計
- 綠色調（#6EC4C4, #81C997）
- 左側頭像 + 右側資訊
- 兩個按鈕（查看名片、下載通訊錄）

### Corporate Buzz 樣板（corporate-buzz）
- 專業企業風格
- 深色系漸層背景
- 白色文字
- 金褐色點綴
- 一個按鈕（查看完整名片）

---

## 🎯 下一步

測試完成後：
1. ✅ 提交代碼（如果一切正常）
2. 📝 記錄測試結果
3. 🐛 修正發現的 bug
4. 🎨 準備樣板預覽圖片
5. 🚀 規劃部署流程

---

**需要協助嗎？**
- 查看 `INTEGRATION_PLAN.md` 了解完整架構
- 查看 `INTEGRATION_PROGRESS.md` 了解當前進度
- 查看 Console 錯誤訊息進行除錯
