/**
 * Chatbot 台灣開發者樣板
 * 來源：taichunmin/liff-businesscard
 */

import { Template } from '../types'

export const chatbotTw1: Template = {
  id: 'chatbot-tw-1',
  name: 'Chatbot 台灣開發者',
  description: '「Chatbot Developers Taiwan」風格，適合科技業與開發者',
  author: 'taichunmin (adapted)',
  preview: '/templates/chatbot-tw-1.png',
  category: 'professional',
  premium: false,
  tags: ['科技', '開發者', '專業'],
  
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
            "text": "下載通訊錄",
            "color": "#6EC4C4",
            "weight": "bold",
            "align": "center",
            "gravity": "center"
          }
        ],
        "action": {
          "type": "uri",
          "label": "下載通訊錄",
          "uri": "\${vcard.vcardUrl}"
        }
      }
    ]
  }
}`,
}
