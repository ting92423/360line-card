/**
 * 預設樣板（原有的簡約風格）
 */

import { Template } from '../types'

export const defaultTemplate: Template = {
  id: 'default',
  name: '預設樣板',
  description: '簡約清爽的預設名片樣式',
  author: '360LINE',
  preview: '/templates/default.png',
  category: 'minimal',
  premium: false,
  tags: ['簡約', '通用', '預設'],
  
  flex: `{
  "type": "bubble",
  "size": "giga",
  "body": {
    "type": "box",
    "layout": "vertical",
    "contents": [
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "image",
            "url": "\${vcard.avatarUrl}",
            "size": "xl",
            "aspectRatio": "1:1",
            "aspectMode": "cover",
            "flex": 0
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "\${vcard.name}",
                "weight": "bold",
                "size": "xl",
                "color": "#1a1a1a"
              },
              {
                "type": "text",
                "text": "\${vcard.title}",
                "size": "sm",
                "color": "#666666",
                "margin": "xs"
              },
              {
                "type": "text",
                "text": "\${vcard.company}",
                "size": "xs",
                "color": "#999999",
                "margin": "xs"
              }
            ],
            "margin": "lg"
          }
        ]
      },
      {
        "type": "separator",
        "margin": "lg"
      },
      {
        "type": "box",
        "layout": "vertical",
        "margin": "lg",
        "spacing": "sm",
        "contents": [
          {
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "📞",
                "flex": 0
              },
              {
                "type": "text",
                "text": "\${vcard.phone || '未提供'}",
                "size": "sm",
                "color": "#666666",
                "wrap": true
              }
            ]
          },
          {
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "✉️",
                "flex": 0
              },
              {
                "type": "text",
                "text": "\${vcard.email || '未提供'}",
                "size": "sm",
                "color": "#666666",
                "wrap": true
              }
            ]
          },
          {
            "type": "box",
            "layout": "baseline",
            "spacing": "sm",
            "contents": [
              {
                "type": "text",
                "text": "🌐",
                "flex": 0
              },
              {
                "type": "text",
                "text": "\${vcard.website || '未提供'}",
                "size": "sm",
                "color": "#666666",
                "wrap": true
              }
            ]
          }
        ]
      }
    ]
  },
  "footer": {
    "type": "box",
    "layout": "vertical",
    "spacing": "sm",
    "contents": [
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "查看完整名片",
          "uri": "\${vcard.shareUrl}"
        },
        "style": "primary",
        "color": "#06C755"
      },
      {
        "type": "button",
        "action": {
          "type": "uri",
          "label": "下載通訊錄",
          "uri": "\${vcard.vcardUrl}"
        },
        "style": "secondary"
      }
    ]
  }
}`,
}
