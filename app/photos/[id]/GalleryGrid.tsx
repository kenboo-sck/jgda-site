'use client';

import { useState } from 'react';

export default function GalleryGrid({ images, title }: { images: any[], title: string }) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <>
      {/* モバイルでは grid (2カラム)、タブレット以上では columns (Masonry) に切り替え */}
      <div className="grid grid-cols-2 gap-3 sm:block sm:columns-2 lg:columns-3 sm:gap-4 sm:space-y-4">
        {images?.map((img: any, idx: number) => {
          // モバイルでのランダム感を出すためのパターン (0, 3, 6, 7... 番目を1カラム=横いっぱいに)
          const isFeatured = (idx % 6 === 0 || idx % 6 === 3);
          return (
            <div 
              key={idx} 
              onClick={() => setSelectedImg(img.url)}
              className={`relative overflow-hidden group bg-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer sm:mb-4 sm:break-inside-avoid ${
                isFeatured ? 'col-span-2' : 'col-span-1'
              }`}
            >
            <img 
              src={`${img.url}?txt=JGDA%20Official%20Photo&txt-align=bottom,right&txt-color=white&txt-size=12&txt-pad=10&txt-shad=5&txt-font=Helvetica,Bold`} 
              alt={`${title} - ${idx + 1}`}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            
            {/* ホバー時の装飾 */}
            <div className="absolute inset-0 border-0 group-hover:border-[12px] border-red-600/20 transition-all duration-300 pointer-events-none"></div>
            
            {/* 拡大アイコン */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {/* ライトボックス（拡大表示） */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-red-600 transition-colors z-[110]"
            onClick={() => setSelectedImg(null)}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img 
              src={`${selectedImg}?txt=JGDA%20Official%20Photo&txt-align=bottom,right&txt-color=white&txt-size=24&txt-pad=20&txt-shad=5&txt-font=Helvetica,Bold`} 
              alt="Enlarged" 
              className="max-w-full max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute -bottom-10 left-0 right-0 text-center">
              <p className="text-white/50 text-[10px] font-black tracking-[0.5em] uppercase italic">{title}</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .break-inside-avoid {
          break-inside: avoid;
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}