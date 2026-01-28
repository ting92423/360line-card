/**
 * Corporate Buzz 樣板（企業名片）
 * 來源：PsPrint via taichunmin/liff-businesscard
 */

import { Template } from '../types'

export const corporateBuzz: Template = {
  id: 'corporate-buzz',
  name: 'Corporate Buzz',
  description: '專業企業名片，深色系設計，適合商務人士',
  author: 'PsPrint (adapted)',
  preview: '/templates/corporate-buzz.png',
  category: 'professional',
  premium: false,
  tags: ['企業', '商務', '專業', '深色'],
  
  flex: `{
  "type": "bubble",
  "size": "giga",
  "body": {
    "type": "box",
    "layout": "horizontal",
    "paddingAll": "0px",
    "paddingBottom": "20px",
    "paddingTop": "20px",
    "background": {
      "type": "linearGradient",
      "angle": "90deg",
      "startColor": "#d7c6b2",
      "centerColor": "#eae3d3",
      "endColor": "#d7c6b2",
      "centerPosition": "50%"
    },
    "contents": [
      {
        "type": "box",
        "layout": "vertical",
        "paddingBottom": "5px",
        "paddingTop": "5px",
        "background": {
          "type": "linearGradient",
          "angle": "90deg",
          "startColor": "#41423d",
          "centerColor": "#474745",
          "endColor": "#41423d",
          "centerPosition": "50%"
        },
        "contents": [
          {
            "type": "box",
            "layout": "vertical",
            "paddingAll": "20px",
            "paddingStart": "40px",
            "paddingEnd": "40px",
            "background": {
              "type": "linearGradient",
              "angle": "90deg",
              "startColor": "#0e0f0c",
              "centerColor": "#0e1211",
              "endColor": "#0e0f0c",
              "centerPosition": "50%"
            },
            "contents": [
              {
                "type": "text",
                "text": "\${vcard.name}",
                "size": "3xl",
                "weight": "bold",
                "color": "#ffffff"
              },
              {
                "type": "text",
                "text": "\${vcard.title}",
                "size": "lg",
                "color": "#999999"
              },
              {
                "type": "box",
                "layout": "horizontal",
                "margin": "xl",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "width": "5px",
                    "height": "5px",
                    "backgroundColor": "#ffffff",
                    "cornerRadius": "9px",
                    "contents": []
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "vertical",
                        "flex": 1,
                        "contents": []
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "height": "1px",
                        "backgroundColor": "#ffffff",
                        "contents": []
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "flex": 1,
                        "contents": []
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "width": "5px",
                    "height": "5px",
                    "backgroundColor": "#ffffff",
                    "cornerRadius": "9px",
                    "contents": []
                  }
                ]
              },
              {
                "type": "box",
                "layout": "horizontal",
                "margin": "xl",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "xs",
                    "flex": 0,
                    "contents": [
                      {
                        "type": "text",
                        "text": "\${vcard.phone}",
                        "size": "xs",
                        "color": "#ffffff",
                        "action": {
                          "type": "uri",
                          "uri": "tel:\${vcard.phone}"
                        }
                      },
                      {
                        "type": "text",
                        "text": "\${vcard.email}",
                        "size": "xxs",
                        "color": "#ffffff",
                        "action": {
                          "type": "uri",
                          "uri": "mailto:\${vcard.email}"
                        }
                      }
                    ]
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "flex": 1,
                    "contents": []
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "flex": 0,
                    "contents": [
                      {
                        "type": "text",
                        "text": "\${vcard.company}",
                        "size": "xs",
                        "color": "#ffffff",
                        "wrap": true,
                        "flex": 1
                      },
                      {
                        "type": "text",
                        "text": "\${vcard.website}",
                        "size": "xxs",
                        "color": "#ffffff",
                        "action": {
                          "type": "uri",
                          "uri": "\${vcard.website}"
                        }
                      }
                    ]
                  }
                ]
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
        "color": "#d7c6b2"
      }
    ]
  }
}`,
}
