/**
 * 名片樣板型別定義
 */

export interface Template {
  /** 樣板唯一 ID */
  id: string
  
  /** 樣板顯示名稱 */
  name: string
  
  /** 樣板描述 */
  description: string
  
  /** 作者 */
  author: string
  
  /** 預覽圖片 URL */
  preview: string
  
  /** 分類 */
  category: 'professional' | 'creative' | 'minimal' | 'fun'
  
  /** Flex Message JSON（使用 Template Literals 格式） */
  flex: string
  
  /** 是否為付費樣板 */
  premium?: boolean
  
  /** 標籤 */
  tags?: string[]
}

export interface TemplateVcard {
  /** 姓名 */
  name: string
  
  /** 職稱 */
  title: string
  
  /** 公司 */
  company: string
  
  /** 電話 */
  phone: string
  
  /** Email */
  email: string
  
  /** 網站 */
  website: string
  
  /** 頭像 URL */
  avatarUrl: string
  
  /** LINE 官方帳號 */
  lineOaBasicId: string
  
  /** Instagram */
  instagram: string
  
  /** Facebook */
  facebook: string
  
  /** YouTube */
  youtube: string
  
  /** LinkedIn */
  linkedin: string
  
  /** 分享連結 */
  shareUrl: string
  
  /** vCard 下載連結 */
  vcardUrl: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'professional',
    name: '專業商務',
    description: '適合企業、專業人士使用',
    icon: '💼',
  },
  {
    id: 'creative',
    name: '創意設計',
    description: '適合設計師、創意產業',
    icon: '🎨',
  },
  {
    id: 'minimal',
    name: '簡約風格',
    description: '簡潔俐落的設計',
    icon: '✨',
  },
  {
    id: 'fun',
    name: '趣味風格',
    description: '活潑可愛的設計',
    icon: '🎉',
  },
]
