import Link from 'next/link';

export default function PreChallengeBanners() {
  const tournaments = [
    {
      title: "Pre challenge シリーズ 葛城大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/8/21（金）",
      venue: "葛城ゴルフ倶楽部（静岡県）",
      entryPeriod: "7月3日 (金) 10:00 ～ 8月14日 (金) 22:00",
      link: "/entry/iejqg7vqzu",
    },
    {
      title: "Pre challenge シリーズ 滋賀大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/8/24（月）",
      venue: "滋賀カントリー倶楽部（滋賀県）",
      entryPeriod: "7月3日 (金) 10:00 ～ 8月17日 (月) 22:00",
      link: "/entry/0zd6slq5ysbh",
    },
    {
      title: "Pre challenge シリーズ 西那須野大会",
      subtitle: "藤井かすみステップジャンプツアー2026",
      date: "2026/9/1（火）",
      venue: "西那須野カントリークラブ（栃木県）",
      entryPeriod: "7月3日 (金) 10:00 ～ 8月25日 (火) 22:00",
      link: "/entry/dabd638nzc",
    },
  ];

  return (
    <section className="bg-slate-50 py-12 border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-[#001f3f]">
            Pre Challenge <span className="text-red-600">Series</span>
          </h2>
          <div className="h-[1px] flex-1 bg-slate-200"></div>
          <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest">Entry Information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tournaments.map((t, idx) => (
            <Link
              href={t.link}
              key={idx}
              className="group bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col p-6 rounded-sm"
            >
              {/* 装飾用の赤い左ボーダー */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 group-hover:bg-red-600 transition-colors"></div>

              {/* サブタイトル */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t.subtitle}
              </p>

              {/* タイトル */}
              <h3 className="text-base font-black text-[#001f3f] italic tracking-tight mb-4 group-hover:text-red-600 transition-colors leading-tight">
                {t.title}
              </h3>

              {/* 詳細情報 */}
              <div className="space-y-2.5 text-xs text-slate-600 mb-6 flex-1">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#001f3f] shrink-0 w-20">開催日：</span>
                  <span className="font-semibold text-slate-900">{t.date}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#001f3f] shrink-0 w-20">開催コース：</span>
                  <span className="text-slate-700">{t.venue}</span>
                </div>
                <div className="flex flex-col gap-1 pt-2.5 border-t border-slate-100">
                  <span className="font-bold text-red-600 text-[10px] uppercase tracking-wider">エントリー期間</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-normal">{t.entryPeriod}</span>
                </div>
              </div>

              {/* ボタン */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black italic text-[#001f3f] group-hover:text-red-600 transition-colors">
                  詳細・エントリーはこちら
                </span>
                <span className="text-[10px] font-black italic text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
