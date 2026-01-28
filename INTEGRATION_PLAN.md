# 360LINE 商用專案整合計畫

## 🎯 整合目標

**保留商用架構 + 整合 liff-businesscard 樣板系統**

```
您的 Next.js 商用專案
├── ✅ 保留：後端 API（Next.js API Routes）
├── ✅ 保留：身分驗證（LINE idToken + Session）
├── ✅ 保留：資料庫（PostgreSQL / JSON）
├── ✅ 保留：後台管理（/admin）
├── ✅ 保留：權限管控
├── ✅ 保留：事件追蹤
├── ✅ 保留：vCard 下載
│
└── ➕ 新增：13 種精美樣板系統
    ├── 樣板選擇器
    ├── 動態渲染引擎
    ├── Flex Message 預覽
    └── 多樣板支援
```

---

## 📋 整合內容清單

### **從 liff-businesscard 提取**

| 項目 | 說明 | 整合方式 |
|------|------|---------|
| ✅ **13 種 Flex 樣板** | chatbot-tw-1, chatgpt-1, psprint-592 等 | 轉換成 TypeScript 模組 |
| ✅ **動態渲染引擎** | Template Literals 替換變數 | 建立 `lib/templates/` |
| ✅ **Flex Message 預覽** | flex2html 套件 | 整合到後台 |
| ⚠️ **Google Sheet 整合** | 批次匯入 | 第二階段（選用） |
| ⚠️ **CSV 匯入** | 批次處理 | 第二階段（選用） |
| ❌ **URL 編碼分享** | 資料嵌入 URL | 不需要（我們有資料庫） |

### **保留原專案功能**

| 功能 | 保留理由 |
|------|---------|
| ✅ Next.js + API Routes | 商用必須，支援複雜業務邏輯 |
| ✅ PostgreSQL 資料庫 | 多用戶管理、數據分析 |
| ✅ LINE 身分驗證 | 安全性、權限管控 |
| ✅ Session Cookie | 持久化登入狀態 |
| ✅ vCard 下載 | 實用功能 |
| ✅ 事件追蹤 API | 分析用戶行為 |

---

## 🏗️ 實作步驟

### **階段 1：建立樣板系統（立即執行）**

#### 步驟 1-1：建立樣板目錄結構
```
h:\360LINE\
├── lib\
│   └── templates\
│       ├── index.ts              ← 樣板註冊表
│       ├── types.ts              ← 樣板型別定義
│       ├── renderer.ts           ← 動態渲染引擎
│       ├── templates\            ← 各個樣板
│       │   ├── default.ts        ← 原有預設樣板
│       │   ├── chatbot-tw-1.ts   ← Chatbot 台灣
│       │   ├── chatgpt-1.ts      ← ChatGPT 風格
│       │   ├── psprint-592.ts    ← Corporate Buzz
│       │   ├── psprint-3949.ts   ← Right Align
│       │   ├── line-carousel.ts  ← 多頁訊息
│       │   └── ... (其他樣板)
│       └── previews\             ← 預覽圖片
│           ├── default.png
│           ├── chatbot-tw-1.png
│           └── ...
```

#### 步驟 1-2：更新資料模型
```typescript
// lib/types.ts 新增欄位
export const CardSchema = z.object({
  slug: z.string().min(1),
  ownerLineUserId: z.string().optional(),
  template: z.string().default('default'),  // ← 新增：樣板 ID
  // ... 其他欄位
})
```

#### 步驟 1-3：更新後台 UI
在 `/admin` 後台加入樣板選擇器：
```tsx
// app/admin/ui.tsx
<div className="form-group">
  <label>選擇樣板</label>
  <select name="template">
    <option value="default">預設樣板</option>
    <option value="chatbot-tw-1">Chatbot 台灣開發者</option>
    <option value="chatgpt-1">ChatGPT 問與答</option>
    <option value="psprint-592">Corporate Buzz（企業名片）</option>
    <option value="psprint-3949">Right Align（右對齊）</option>
    <option value="line-carousel">多頁訊息（最多12張）</option>
  </select>
  <small>選擇名片的顯示樣式</small>
</div>
```

#### 步驟 1-4：實作樣板預覽
在後台加入即時預覽功能：
```tsx
// components/TemplatePreview.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Card } from '@/lib/types'

export function TemplatePreview({ card }: { card: Card }) {
  const previewRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // 使用 flex2html 渲染預覽
    if (previewRef.current) {
      const flexMsg = renderTemplate(card.template, card)
      window.flex2html(previewRef.current, JSON.parse(flexMsg))
    }
  }, [card])
  
  return <div ref={previewRef} className="flex-preview" />
}
```

---

### **階段 2：實作動態渲染（核心功能）**

#### 檔案：`lib/templates/renderer.ts`
```typescript
import { Card } from '@/lib/types'
import * as templates from './templates'

export function renderTemplate(templateId: string, card: Card): string {
  // 取得樣板
  const template = templates[templateId] || templates.default
  
  // 準備變數（相容 liff-businesscard 格式）
  const vcard = {
    name: card.displayName,
    title: card.title || '',
    company: card.company || '',
    phone: card.phone || '',
    email: card.email || '',
    website: card.website || '',
    avatarUrl: card.avatarUrl || '/avatar-placeholder.svg',
    lineOaBasicId: card.lineOaBasicId || '',
    instagram: card.social?.instagram || '',
    facebook: card.social?.facebook || '',
    youtube: card.social?.youtube || '',
    linkedin: card.social?.linkedin || '',
    // 加入分享連結（用於名片內的 action）
    shareUrl: `${process.env.NEXT_PUBLIC_APP_ORIGIN}/c/${card.slug}`,
  }
  
  // 使用 Template Literals 動態替換
  const rendered = new Function('vcard', `return \`${template.flex}\``)(vcard)
  
  return rendered
}

// 取得樣板清單
export function getTemplateList() {
  return Object.entries(templates).map(([id, template]) => ({
    id,
    name: template.name,
    description: template.description,
    preview: template.preview,
    author: template.author,
  }))
}
```

---

### **階段 3：整合到分享流程**

#### 檔案：`app/c/[slug]/ui.tsx` 更新
```tsx
'use client'
// ... 現有 imports
import { renderTemplate } from '@/lib/templates/renderer'

export function CardActions({ slug, card }: Props) {
  // ... 現有 state
  
  async function handleShare() {
    try {
      await liffReady
      if (!liff.isInClient()) {
        // 降級：複製連結
        await navigator.clipboard.writeText(shareUrl)
        alert('已複製連結')
        return
      }
      
      // 使用動態樣板渲染 Flex Message
      const flexJson = renderTemplate(card.template, card)
      const flexMsg = JSON.parse(flexJson)
      
      // 分享
      await liff.shareTargetPicker([flexMsg])
      
      // 追蹤事件
      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({ type: 'share', slug }),
      })
    } catch (err) {
      console.error(err)
      alert('分享失敗')
    }
  }
  
  // ... 其他功能
}
```

---

### **階段 4：樣板檔案範例**

#### 檔案：`lib/templates/templates/chatbot-tw-1.ts`
```typescript
import { Template } from '../types'

export const chatbotTw1: Template = {
  id: 'chatbot-tw-1',
  name: 'Chatbot 台灣開發者',
  description: '「Chatbot Developers Taiwan」的名片樣式，適合科技業',
  author: 'taichunmin',
  preview: '/templates/chatbot-tw-1.png',
  category: 'professional',
  
  // Flex Message JSON（使用 Template Literals）
  flex: `{
    "type": "bubble",
    "size": "giga",
    "body": {
      "type": "box",
      "layout": "horizontal",
      "spacing": "lg",
      "contents": [
        {
          "type": "box",
          "layout": "vertical",
          "width": "100px",
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [{"type": "filler"}]
            },
            {
              "type": "box",
              "layout": "vertical",
              "width": "100px",
              "height": "100px",
              "contents": [
                {
                  "type": "image",
                  "url": "\${vcard.avatarUrl}",
                  "aspectMode": "cover",
                  "aspectRatio": "1:1",
                  "align": "center",
                  "gravity": "center"
                }
              ]
            },
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [{"type": "filler"}]
            }
          ]
        },
        {
          "type": "box",
          "layout": "vertical",
          "borderWidth": "1px",
          "borderColor": "#6EC4C4",
          "flex": 0,
          "height": "120px",
          "contents": [{"type": "filler"}]
        },
        {
          "type": "box",
          "layout": "vertical",
          "flex": 3,
          "contents": [
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [{"type": "filler"}]
            },
            {
              "type": "text",
              "text": "\${vcard.company || 'Chatbot Developers Taiwan'}",
              "color": "#6EC4C4",
              "size": "sm",
              "weight": "bold"
            },
            {
              "type": "text",
              "text": "\${vcard.title}",
              "color": "#81C997",
              "size": "xxs",
              "margin": "xxl"
            },
            {
              "type": "text",
              "text": "\${vcard.name}",
              "color": "#81C997",
              "size": "xl",
              "weight": "bold"
            },
            {
              "type": "box",
              "layout": "vertical",
              "flex": 1,
              "contents": [{"type": "filler"}]
            }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "spacing": "md",
      "contents": [
        {
          "type": "box",
          "layout": "vertical",
          "borderColor": "#6EC4C4",
          "borderWidth": "1px",
          "cornerRadius": "5px",
          "paddingAll": "5px",
          "contents": [
            {
              "type": "text",
              "text": "查看名片",
              "color": "#6EC4C4",
              "weight": "bold",
              "align": "center",
              "gravity": "center"
            }
          ],
          "action": {
            "type": "uri",
            "label": "查看名片",
            "uri": "\${vcard.shareUrl}"
          }
        },
        {
          "type": "box",
          "layout": "vertical",
          "borderColor": "#6EC4C4",
          "borderWidth": "1px",
          "cornerRadius": "5px",
          "paddingAll": "5px",
          "contents": [
            {
              "type": "text",
              "text": "分享給好友",
              "color": "#6EC4C4",
              "weight": "bold",
              "align": "center",
              "gravity": "center"
            }
          ],
          "action": {
            "type": "uri",
            "label": "分享給好友",
            "uri": "\${vcard.shareUrl}?openExternalBrowser=1"
          }
        }
      ]
    }
  }`,
}
```

#### 檔案：`lib/templates/templates/index.ts`
```typescript
import { chatbotTw1 } from './chatbot-tw-1'
import { chatgpt1 } from './chatgpt-1'
import { psprint592 } from './psprint-592'
import { defaultTemplate } from './default'

export const templates = {
  default: defaultTemplate,
  'chatbot-tw-1': chatbotTw1,
  'chatgpt-1': chatgpt1,
  'psprint-592': psprint592,
  // ... 其他樣板
}
```

---

## 🎨 UI/UX 改進

### **1. 後台樣板選擇器（視覺化）**

```tsx
// app/admin/ui.tsx - 樣板選擇元件
<div className="template-selector">
  <h3>選擇名片樣板</h3>
  <div className="template-grid">
    {templates.map(tpl => (
      <div 
        key={tpl.id}
        className={`template-card ${selectedTemplate === tpl.id ? 'active' : ''}`}
        onClick={() => setSelectedTemplate(tpl.id)}
      >
        <img src={tpl.preview} alt={tpl.name} />
        <h4>{tpl.name}</h4>
        <p>{tpl.description}</p>
      </div>
    ))}
  </div>
</div>
```

### **2. 即時預覽面板**

```tsx
// 在後台右側顯示即時預覽
<div className="preview-panel">
  <h3>名片預覽</h3>
  <div className="phone-mockup">
    <TemplatePreview card={currentCard} />
  </div>
  <p className="hint">這是您的名片在 LINE 中的顯示效果</p>
</div>
```

---

## 📊 資料庫更新

### **Migration SQL**

```sql
-- 新增 template 欄位到現有的 cards 表
ALTER TABLE cards 
ADD COLUMN template VARCHAR(50) DEFAULT 'default';

-- 為現有資料設定預設樣板
UPDATE cards 
SET template = 'default' 
WHERE template IS NULL;

-- 建立索引（選用，加速查詢）
CREATE INDEX idx_cards_template ON cards(template);
```

### **JSON Store 更新**

如果使用 `data/cards.json`，更新格式：

```json
{
  "cards": {
    "demo": {
      "slug": "demo",
      "template": "chatbot-tw-1",
      "displayName": "示範使用者",
      "title": "業務經理",
      "...": "..."
    }
  }
}
```

---

## 🚀 部署與測試

### **測試檢查清單**

- [ ] 樣板渲染正常（所有 13 種）
- [ ] 動態變數替換正確
- [ ] 分享功能正常（LIFF + 降級）
- [ ] 預覽功能正常
- [ ] 資料庫儲存/讀取 template 欄位
- [ ] 後台選擇器 UI 正常
- [ ] 事件追蹤記錄樣板 ID
- [ ] vCard 下載不受樣板影響

### **效能優化**

```typescript
// lib/templates/renderer.ts - 快取樣板
const templateCache = new Map<string, Function>()

export function renderTemplate(templateId: string, card: Card): string {
  const template = templates[templateId] || templates.default
  
  // 快取編譯後的函式
  if (!templateCache.has(templateId)) {
    templateCache.set(
      templateId,
      new Function('vcard', `return \`${template.flex}\``)
    )
  }
  
  const renderFn = templateCache.get(templateId)!
  return renderFn(prepareVcard(card))
}
```

---

## 💰 商業模式擴充

### **免費版 vs 付費版**

| 功能 | 免費版 | 付費版 |
|------|--------|--------|
| 基本樣板 | 3 種 | 13 種 |
| 自訂 Logo | ❌ | ✅ |
| 進階分析 | ❌ | ✅ |
| 多張名片 | 1 張 | 無限 |
| vCard 下載 | ✅ | ✅ |
| 客製化樣板 | ❌ | ✅ |

### **實作付費牆**

```typescript
// lib/templates/access.ts
export function canUseTemplate(templateId: string, userPlan: string): boolean {
  const freeTemplates = ['default', 'chatbot-tw-1', 'psprint-592']
  
  if (userPlan === 'premium') return true
  return freeTemplates.includes(templateId)
}
```

---

## 📅 實作時程

### **第 1 週：核心整合**
- ✅ 建立樣板系統架構
- ✅ 轉換 3-5 個主要樣板
- ✅ 實作動態渲染引擎
- ✅ 更新資料庫 schema

### **第 2 週：UI 與測試**
- ✅ 實作後台樣板選擇器
- ✅ 加入即時預覽功能
- ✅ 測試所有樣板
- ✅ 修正 bug

### **第 3 週：完整整合**
- ✅ 轉換剩餘 8-10 個樣板
- ✅ 優化效能（快取）
- ✅ 加入分析追蹤
- ✅ 撰寫文件

### **第 4 週：上線準備**
- ✅ 完整測試流程
- ✅ 部署到正式環境
- ✅ 使用者測試
- ✅ 收集回饋

---

## 🎯 成功指標

- ✅ 13 種樣板全部可用
- ✅ 渲染速度 < 100ms
- ✅ 分享成功率 > 95%
- ✅ 使用者可輕鬆切換樣板
- ✅ 保留所有原有商用功能
- ✅ 無效能退化
- ✅ 零停機時間部署

---

**準備好開始實作了嗎？我將從建立樣板系統架構開始！** 🚀
