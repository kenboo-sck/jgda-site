import Link from 'next/link';

export default function PreChallengeBanners() {
  const tournaments = [
    {
      title: "Pre challenge シリーズ 葛城大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/8/21（金）",
      venue: "葛城ゴルフ倶楽部（静岡県）",
      entryPeriod: "7月3日（金） 10:00 ～ 8月14日（金） 22:00",
      link: "/entry/iejqg7vqzu",
    },
    {
      title: "Pre challenge シリーズ 滋賀大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/8/24（月）",
      venue: "滋賀カントリー倶楽部（滋賀県）",
      entryPeriod: "7月3日（金） 10:00 ～ 8月17日（月） 22:00",
      link: "/entry/0zd6slq5ysbh",
    },
    {
      title: "Pre challenge シリーズ 西那須野大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/9/1（火）",
      venue: "西那須野カントリークラブ（栃木県）",
      entryPeriod: "7月3日（金） 10:00 ～ 8月25日（火） 22:00",
      link: "/entry/dabd638nzc",
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 xl:px-0 w-full mt-12 mb-8">
      {/* 見出し */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-[#001f3f]">
          Pre Challenge <span className="text-red-600">Series</span>
        </h2>
        <div className="h-[1px] flex-1 bg-slate-200"></div>
        <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest hidden sm:inline">
          Entry Information
        </span>
      </div>

      {/* 3カラムグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tournaments.map((t, idx) => (
          <Link
            href={t.link}
            key={idx}
            className="group relative flex flex-col justify-between overflow-hidden bg-[#001f3f] border-b-4 border-slate-500 hover:border-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-sm p-6 min-h-[360px]"
          >
            {/* バックグラウンドのストライプパターン（門屋組と同様） */}
            <div className="absolute inset-0 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.15),transparent_70%)]"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'
              }}></div>
            </div>

            {/* Glowing accent orbs (門屋組より少しマイルドに) */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600 rounded-full blur-[80px] opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>

            {/* コンテンツエリア (relativeでorbsより前面に) */}
            <div className="relative z-10 flex-1 flex flex-col">
              {/* バッジ（募集ステータスなど） */}
              <div className="inline-flex items-center gap-1.5 mb-3">
                <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                <span className="text-red-400 font-mono text-[9px] font-bold tracking-[0.2em] uppercase">
                  Entry Open Soon
                </span>
              </div>

              {/* サブタイトル */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {t.subtitle}
              </p>

              {/* タイトル */}
              <h3 className="text-lg font-black text-white italic tracking-tight mb-5 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-300 drop-shadow-md group-hover:text-red-400 transition-colors">
                {t.title}
              </h3>

              {/* 詳細情報 (グラスモーフィズム調) */}
              <div className="space-y-2 text-xs text-slate-300 mb-6 flex-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/5 backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span>開催日：{t.date}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/5 backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="truncate">{t.venue}</span>
                </div>
                <div className="flex flex-col gap-1 px-3 py-2 bg-white/5 rounded border border-white/5 backdrop-blur-sm">
                  <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">エントリー期間</span>
                  <span className="text-[10px] text-slate-300 leading-tight">{t.entryPeriod}</span>
                </div>
              </div>
            </div>

            {/* ボタン (門屋組ボタンの縮小版) */}
            <div className="relative z-10 mt-auto pt-2">
              <div className="relative group/btn w-full">
                {/* ホバー時の光るエフェクト */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded bg-clip-border opacity-40 group-hover:opacity-100 blur transition duration-500"></div>
                <div className="relative py-2.5 px-4 bg-black rounded flex items-center justify-between gap-2 border border-white/10 hover:bg-zinc-900 transition-all duration-300">
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold leading-none mb-0.5">Player Entry</span>
                    <span className="text-xs font-black text-white tracking-widest uppercase italic leading-none">
                      エントリーはこちら
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform shadow shadow-red-500/50 shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
