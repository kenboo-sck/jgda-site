import React from 'react';
import Link from 'next/link';

interface Video {
    id: string;
    title: string;
    url: string;
    image?: { url: string };
    date?: string;
}

export default function LatestVideos({ data }: { data: Video[] }) {
    // 動画データが空の場合は何も表示しない
    if (!data || data.length === 0) return null;

    return (
        <section className="py-24 border-t border-slate-100">
            {/* Section Header */}
            <div className="mb-16 flex items-end justify-between border-b-2 border-slate-100 pb-8">
                <div>
                    <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-[#001f3f]">
                        You<span className="text-red-600">Tube</span>
                    </h2>
                    <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                        日刊スポーツ・ゴルフチャンネル
                    </p>
                </div>
                <div className="hidden md:block w-24 h-1 bg-red-600"></div>
            </div>

            {/* Videos Grid - 3 columns on desktop, 2 columns on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                {data.map((video) => (
                    <a
                        key={video.id}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                    >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-video bg-slate-900 mb-4 overflow-hidden border border-slate-200 group-hover:border-[#001f3f] transition-all shadow-sm group-hover:shadow-lg">
                            {video.image?.url ? (
                                <img
                                    src={video.image.url}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold italic text-xs">NO IMAGE</div>
                            )}

                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-10 h-10 md:w-14 md:h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                                    <svg className="w-5 h-5 md:w-7 md:h-7 fill-current" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Text Info */}
                        <p className="text-[9px] text-red-600 mb-2 font-black tracking-widest uppercase italic">
                            {video.date ? new Date(video.date).toLocaleDateString('ja-JP').replace(/\//g, '.') : ''}
                        </p>
                        <h3 className="text-[14px] font-bold leading-tight text-[#001f3f] group-hover:text-red-600 transition-colors line-clamp-2 italic uppercase tracking-tight">
                            {video.title}
                        </h3>
                    </a>
                ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-end mt-12">
                <Link
                    href="/videos"
                    className="group inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-[#001f3f] hover:text-red-600 transition-colors"
                >
                    View All Videos <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>
        </section>
    );
}
