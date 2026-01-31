import type { Metadata } from "next";
import "./styles.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://line360-card.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "LINE 電子名片 | 360LINE",
    template: "%s | 360LINE",
  },
  description: "一鍵建立專業電子名片，深度整合 LINE 生態系。支援多種精美模板、一鍵分享、vCard 下載。",
  keywords: ["電子名片", "LINE", "LIFF", "數位名片", "名片製作", "商務名片"],
  authors: [{ name: "360LINE" }],
  creator: "360LINE",
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: baseUrl,
    siteName: "360LINE 電子名片",
    title: "LINE 電子名片 | 360LINE",
    description: "一鍵建立專業電子名片，深度整合 LINE 生態系。支援多種精美模板、一鍵分享、vCard 下載。",
    images: [
      {
        url: `${baseUrl}/api/og?template=business`,
        width: 540,
        height: 960,
        alt: "360LINE 電子名片預覽",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LINE 電子名片 | 360LINE",
    description: "一鍵建立專業電子名片，深度整合 LINE 生態系。",
    images: [`${baseUrl}/api/og?template=business`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

