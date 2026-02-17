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
      <header
        className={`sticky top-0 z-50 w-full h-20 transition-colors duration-500 border-b ${isOpen ? 'bg-[#001f3f] border-[#001f3f]' : 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full">
          <div className="flex items-center justify-between h-full">

            {/* --- ロゴセクション --- */}
            <div className="flex items-center z-[60] relative">
              <Link
                href="/"
                className={`flex items-center transition-all duration-300 ${isOpen ? 'brightness-0 invert' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={LOGO_PC}
                  alt="JGDA"
                  className="hidden md:block h-12 w-auto object-contain"
                  style={{ minWidth: '120px' }}
                />
                <img
                  src={LOGO_SP}
                  alt="JGDA"
                  className="md:hidden h-10 w-auto object-contain"
                  style={{ minWidth: '100px' }}
                />
              </Link>
            </div>

            {/* --- デスクトップナビ --- */}
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

            {/* スマホ用メニューボタン */}
            <div className="lg:hidden z-[60] relative">
              <button
                className={`p-2 focus:outline-none transition-colors duration-300 ${isOpen ? 'text-white' : 'text-[#001f3f]'}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`w-full h-[2px] bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`w-full h-[2px] bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-[2px] bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>

            {/* モバイルメニューオーバーレイ：ヘッダーの下（z-40）からロールダウン */}
            <div
              className={`fixed top-[80px] left-0 w-full h-[calc(100dvh-80px)] bg-[#001f3f] z-40 overflow-y-auto transition-all duration-700 ease-in-out transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
                }`}
              style={{
                WebkitOverflowScrolling: 'touch', // Safariで滑らかにスクロールさせるため
              }}
            >
              <nav className="w-full flex justify-center pt-8 pb-[40vh]">
                <ul className="flex flex-col items-center gap-3 w-full px-10">
                  {navItems.map((item, idx) => (
                    <li key={item.name}
                      className={`w-full text-center transition-all duration-700 transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                        }`}
                      style={{ transitionDelay: `${isOpen ? idx * 40 + 150 : 0}ms` }}
                    >
                      <Link
                        href={item.href}
                        className="text-base font-black text-white italic tracking-[0.2em] hover:text-red-500 transition-colors block py-2 border-b border-white/5"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-6 text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] text-white/40 font-bold tracking-[0.3em] uppercase border border-white/20 px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
                    >
                      Close Menu
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* スクロールトップボタン */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 z-[70] p-3 bg-[#001f3f] text-white shadow-xl rounded-sm transition-all duration-500 hover:bg-red-600 focus:outline-none border border-white/10 ${showScrollTop && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="ページトップへ戻る"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}