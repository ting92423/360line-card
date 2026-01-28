import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LINE 電子名片",
  description: "深度整合 LINE LIFF 的電子名片系統（MVP）"
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

