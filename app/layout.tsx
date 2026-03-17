import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotionFlow - 动效灵感库",
  description: "专注 UI 动效的灵感库，支持多格式动效素材的高效采集、预览与品牌化归档",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
