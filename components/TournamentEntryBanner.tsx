import Link from 'next/link';

export default function TournamentEntryBanner() {
    return (
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0 w-full mb-12">
            <div className="relative w-full overflow-hidden bg-[#001f3f] border-b-4 border-red-600 shadow-2xl group rounded-sm">
                {/* Background with dynamic pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_70%)]"></div>
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'
                    }}></div>
                </div>

                {/* Glowing accent orb */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>

                <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-20 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">

                    {/* Left Side: Text Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="animate-pulse w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            <span className="text-red-400 font-mono text-xs font-bold tracking-[0.2em] uppercase">Entry Now Open</span>
                        </div>

                        <h2 className="text-white">
                            <span className="block text-sm md:text-lg font-bold tracking-widest text-slate-400 mb-1">
                                藤井かすみステップジャンプツアー2026
                            </span>
                            <span className="block text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400 drop-shadow-lg">
                                高麗川カントリークラブカップ
                            </span>
                        </h2>

                        <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm font-medium text-slate-300">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded backdrop-blur-sm border border-white/10">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span>2026年4月17日（金）</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded backdrop-blur-sm border border-white/10">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>高麗川カントリークラブ</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded backdrop-blur-sm border border-white/10">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>エントリー期間: 2月9日（月）10:00 〜 4月9日（木）22:00</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: CTA Button */}
                    <div className="md:w-auto w-full flex justify-center">
                        <Link
                            href="https://www.jgda.or.jp/entry/4w89jqxpnb"
                            className="relative group/btn w-full md:w-auto"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-75 group-hover/btn:opacity-100 transition duration-1000 group-hover/btn:duration-200 animate-tilt"></div>
                            <div className="relative px-8 py-4 bg-black rounded-lg leading-none flex items-center justify-center gap-4 border border-white/10 hover:bg-zinc-900 transition-all duration-300">
                                <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Player Entry</span>
                                    <span className="text-lg md:text-xl font-black text-white tracking-widest uppercase italic">
                                        エントリーはこちら
                                    </span>
                                </div>
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover/btn:translate-x-1 transition-transform shadow-lg shadow-red-500/50">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
