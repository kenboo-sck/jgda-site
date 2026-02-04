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
  description: "一般社団法人 日本プロゴルフ選手育成協会（JGDA）公式サイト。2021年発足、若手プロゴルファーの技術向上とJLPGA・JGTOプロテスト合格を目指す選手を多角的に支援。真剣勝負の大会開催、強化合宿、トレーニング指導を通じてゴルフ界の未来を担う選手を育成しています。大会エントリー、試合結果、選手プロフィール、フォトギャラリー、動画コンテンツなど最新情報を発信中。",
  keywords: [
    "ゴルフ",
    "プロゴルファー育成",
    "JGDA",
    "日本プロゴルフ選手育成協会",
    "ゴルフ大会",
    "プロテスト合格支援",
    "女子ゴルフ",
    "JLPGA",
    "研修生",
    "ゴルフスクール",
    "ゴルフ大会エントリー",
    "ゴルフ試合結果",
    "藤井かすみ",
  ],
  openGraph: {
    title: "JGDA | 一般社団法人 日本プロゴルフ選手育成協会",
    description: "若手プロゴルファーの夢を支援するJGDA公式サイト。大会情報、試合結果、選手プロフィール、フォトギャラリーなど最新情報を発信。プロテスト合格を目指す選手を全力でサポートしています。",
    url: "https://www.jgda.or.jp",
    siteName: "JGDA - 日本プロゴルフ選手育成協会",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JGDA | 一般社団法人 日本プロゴルフ選手育成協会",
    description: "若手プロゴルファーの夢を支援するJGDA公式サイト。大会情報、試合結果、選手プロフィールなど最新情報を発信中。",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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