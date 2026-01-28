/**
 * 樣板註冊表
 * 所有可用的名片樣板都在這裡註冊
 */

import { Template } from '../types'
import { defaultTemplate } from './default'
import { chatbotTw1 } from './chatbot-tw-1'
import { corporateBuzz } from './corporate-buzz'

// 樣板字典
export const templates: Record<string, Template> = {
  'default': defaultTemplate,
  'chatbot-tw-1': chatbotTw1,
  'corporate-buzz': corporateBuzz,
  // TODO: 新增更多樣板
  // 'chatgpt-1': chatgpt1,
  // 'psprint-3949': psprint3949,
  // 'line-carousel': lineCarousel,
}

// 匯出個別樣板（供外部使用）
export { defaultTemplate, chatbotTw1, corporateBuzz }
