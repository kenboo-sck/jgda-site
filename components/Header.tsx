'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * 💡 画像ファイルをプロジェクトの public/images/ フォルダに配置した前提のパスです。
 */
const LOGO_PC = "/images/JGDA_logo_2.svg";
const LOGO_SP = "/images/JGDA_logo_2.svg";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'NEWS', href: '/news' },
    { name: '大会エントリー', href: '/entry' },
    { name: '大会結果', href: '/results' },
    { name: 'フォトギャラリー', href: '/photos' },
    { name: '選手プロフィール', href: '/players' },
    { name: 'ギャラリー観戦', href: '/spectate' },
    { name: '大会動画', href: '/videos' },
    { name: 'JGDAとは', href: '/about' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`sticky top-0 z-50 shadow-sm transition-all duration-300 ${isOpen ? 'bg-[#001f3f] border-[#001f3f]' : 'bg-white/95 backdrop-blur-md border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">

            {/* --- ロゴセクション --- */}
            <div className="flex items-center z-50 relative">
              <Link href="/" className={`flex items-center transition-all duration-300 ${isOpen ? 'brightness-0 invert' : ''}`} onClick={() => setIsOpen(false)}>
                {/* PC用ロゴ（768px以上で表示） */}
                <img
                  src={LOGO_PC}
                  alt="JGDA"
                  className="hidden md:block h-12 w-auto object-contain"
                  style={{ minWidth: '120px' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                {/* スマホ用ロゴ（768px未満で表示） */}
                <img
                  src={LOGO_SP}
                  alt="JGDA"
                  className="md:hidden h-10 w-auto object-contain"
                  style={{ minWidth: '100px' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </Link>
            </div>

            {/* --- ナビゲーションセクション（デスクトップ） --- */}
            <nav className="hidden lg:block">
              <ul className="flex gap-6 text-[12px] font-black tracking-widest text-[#001f3f] uppercase italic">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="group relative py-2 block">
                      <span className="group-hover:text-red-600 transition-colors duration-300">{item.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* モバイル用メニューボタン */}
            <div className="lg:hidden z-50 relative">
              <button
                className={`p-2 focus:outline-none transition-colors duration-300 ${isOpen ? 'text-white' : 'text-[#001f3f]'}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="メニューを開く"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`w-full h-[2px] bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-[2px] bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>

            {/* モバイルメニューオーバーレイ */}
            <div className={`fixed inset-0 bg-[#001f3f] z-40 flex flex-col items-center justify-center transition-all duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
              <nav>
                <ul className="flex flex-col gap-6 text-center">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-2xl font-black text-white italic uppercase tracking-widest hover:text-red-500 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

          </div>
        </div>

      </header>

      {/* スクロールトップボタン */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 z-40 p-3 bg-[#001f3f] text-white shadow-xl rounded-sm transition-all duration-500 hover:bg-red-600 focus:outline-none border border-white/10 ${showScrollTop && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="ページトップへ戻る"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}