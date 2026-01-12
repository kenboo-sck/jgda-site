'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { client } from '@/lib/client';
import Sponsors from '@/components/Sponsors';

/**
 * 💡 画像ファイルをプロジェクトの public/images/ フォルダに配置した前提のパスです。
 * 💡 フッターは背景が暗いため、ロゴが暗い色の場合は CSS フィルターで白く調整しています。
 */
const LOGO_PATH = "/images/JGDA_logo_2.svg";

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    // TOPページ以外の場合のみスポンサーデータを取得
    if (isHomePage) return;

    const fetchSponsors = async () => {
      try {
        const res = await client.get({
          endpoint: 'videos',
          queries: { limit: 50, filters: 'category[contains]sponsor' }
        });
        const mappedData = res.contents.map((v: any) => ({
          id: v.id,
          name: v.title || 'Official Partner',
          logo: v.main_image || v.image || v.thumbnail,
          url: v.url
        }));
        setSponsors(mappedData);
      } catch (error) {
        console.error('Failed to fetch sponsors:', error);
      }
    };

    fetchSponsors();
  }, [isHomePage]);

  return (
    <>
      {/* TOPページ以外で、かつデータがある場合のみ表示 */}
      {!isHomePage && <Sponsors data={sponsors} />}
      
      <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 協会ロゴ・名前 */}
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="inline-block mb-6">
              <img 
                src={LOGO_PATH} 
                alt="JGDA" 
                className="h-10 w-auto object-contain"
                // 💡 ロゴが黒系で背景と同化してしまう場合は、下のスタイルを有効にしてください
                style={{ filter: 'brightness(0) invert(1)' }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </a>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              一般社団法人 日本プロゴルフ選手育成協会<br />
              若手プロゴルファーの技術向上と、プロテスト合格を目指す選手たちを多角的に支援しています。
            </p>
          </div>

          {/* メニュー1 */}
          <div>
            <h3 className="font-bold mb-4 text-sm text-gray-200 uppercase tracking-widest">Menu</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/news" className="hover:text-white transition-colors">NEWS</a></li>
              <li><a href="/entry" className="hover:text-white transition-colors">大会エントリー</a></li>
              <li><a href="/results" className="hover:text-white transition-colors">大会結果</a></li>
              <li><a href="/players" className="hover:text-white transition-colors">選手プロフィール</a></li>
            </ul>
          </div>

          {/* メニュー2 */}
          <div>
            <h3 className="font-bold mb-4 text-sm text-gray-200 uppercase tracking-widest">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/photos" className="hover:text-white transition-colors">フォトギャラリー</a></li>
              <li><a href="/videos" className="hover:text-white transition-colors">大会動画</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">JGDAとは</a></li>
            </ul>
          </div>
        </div>

        {/* 下部コピーライト */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Japan Golf Development Association.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">Privacy Policy</a>
            <a href="/terms" className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}