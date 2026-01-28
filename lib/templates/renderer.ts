/**
 * 樣板動態渲染引擎
 */

import { Card } from '@/lib/types'
import { Template, TemplateVcard } from './types'
import { templates } from './templates'

// 快取編譯後的渲染函式（效能優化）
const renderFnCache = new Map<string, (vcard: TemplateVcard) => string>()

/**
 * 準備 vcard 資料（轉換成樣板格式）
 */
function prepareVcard(card: Card): TemplateVcard {
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000'
  
  return {
    name: card.displayName,
    title: card.title || '',
    company: card.company || '',
    phone: card.phone || '',
    email: card.email || '',
    website: card.website || '',
    avatarUrl: card.avatarUrl || `${origin}/avatar-placeholder.svg`,
    lineOaBasicId: card.lineOaBasicId || process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID || '',
    instagram: card.social?.instagram || '',
    facebook: card.social?.facebook || '',
    youtube: card.social?.youtube || '',
    linkedin: card.social?.linkedin || '',
    shareUrl: `${origin}/c/${card.slug}`,
    vcardUrl: `${origin}/api/vcard/${card.slug}`,
  }
}

/**
 * 渲染樣板（主要函式）
 * @param templateId 樣板 ID
 * @param card 名片資料
 * @returns 渲染後的 Flex Message JSON 字串
 */
export function renderTemplate(templateId: string, card: Card): string {
  // 取得樣板（如果不存在則使用預設）
  const template = templates[templateId] || templates.default
  
  // 檢查快取
  if (!renderFnCache.has(templateId)) {
    try {
      // 編譯樣板（使用 Template Literals）
      const renderFn = new Function('vcard', `return \`${template.flex}\``) as (vcard: TemplateVcard) => string
      renderFnCache.set(templateId, renderFn)
    } catch (err) {
      console.error(`Failed to compile template: ${templateId}`, err)
      // 如果編譯失敗，使用預設樣板
      const defaultFn = new Function('vcard', `return \`${templates.default.flex}\``) as (vcard: TemplateVcard) => string
      renderFnCache.set(templateId, defaultFn)
    }
  }
  
  // 準備資料
  const vcard = prepareVcard(card)
  
  // 執行渲染
  const renderFn = renderFnCache.get(templateId)!
  const rendered = renderFn(vcard)
  
  return rendered
}

/**
 * 取得樣板清單
 */
export function getTemplateList(): Template[] {
  return Object.values(templates)
}

/**
 * 取得樣板（依 ID）
 */
export function getTemplate(templateId: string): Template | undefined {
  return templates[templateId]
}

/**
 * 檢查樣板是否存在
 */
export function isValidTemplate(templateId: string): boolean {
  return templateId in templates
}

/**
 * 取得免費樣板清單
 */
export function getFreeTemplates(): Template[] {
  return Object.values(templates).filter(tpl => !tpl.premium)
}

/**
 * 取得付費樣板清單
 */
export function getPremiumTemplates(): Template[] {
  return Object.values(templates).filter(tpl => tpl.premium)
}

/**
 * 檢查使用者是否可使用此樣板
 * @param templateId 樣板 ID
 * @param userPlan 使用者方案（'free' | 'premium'）
 */
export function canUseTemplate(templateId: string, userPlan: 'free' | 'premium' = 'free'): boolean {
  const template = templates[templateId]
  if (!template) return false
  if (userPlan === 'premium') return true
  return !template.premium
}

/**
 * 清除渲染快取（用於開發/測試）
 */
export function clearRenderCache(): void {
  renderFnCache.clear()
}
