import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jgda.or.jp"),
  title: {
    default: "JGDA | 一般社団法人 日本プロゴルフ選手育成協会",
    template: "%s | JGDA 日本プロゴルフ選手育成協会",
  },
  description: "若手プロゴルファーの技術向上と、プロテスト合格を目指す選手たちを多角的に支援する一般社団法人 日本プロゴルフ選手育成協会（JGDA）の公式サイトです。大会情報、選手プロフィール、最新ニュースをお届けします。",
  keywords: ["ゴルフ", "プロゴルファー育成", "JGDA", "日本プロゴルフ選手育成協会", "ゴルフ大会", "プロテスト合格支援"],
  openGraph: {
    title: "JGDA | 一般社団法人 日本プロゴルフ選手育成協会",
    description: "若手プロゴルファーの育成を支援するJGDA公式サイト",
    url: "https://www.jgda.or.jp",
    siteName: "JGDA",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JGDA | 一般社団法人 日本プロゴルフ選手育成協会",
    description: "若手プロゴルファーの育成を支援するJGDA公式サイト",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased text-gray-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}