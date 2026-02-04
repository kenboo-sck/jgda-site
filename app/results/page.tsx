import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '大会結果・リーダーボード',
  description: 'JGDA主催ゴルフ大会の試合結果一覧。年度別に全大会のスコア、順位表（リーダーボード）、優勝者・入賞者情報、ホールバイホールの詳細成績をご確認いただけます。過去の大会アーカイブも充実。',
};

// キャッシュの設定（必要に応じて調整してください）
export const revalidate = 0;

export default async function ResultsListPage({ searchParams }: any) {
  const sp = await searchParams;

  // 1. 全大会データを取得（100件制限を回避するために全件取得を試みる）
  const fetchAllTournaments = async () => {
    let all: any[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const res = await client.get({
        endpoint: 'tournament',
        queries: { limit, offset, orders: '-date' }
      }).catch(() => ({ contents: [] }));

      if (!res.contents || res.contents.length === 0) break;
      all = [...all, ...res.contents];
      if (res.contents.length < limit) break;
      offset += limit;
    }
    return all;
  };

  const allData = await fetchAllTournaments();

  // プログラム側でステータスを判定（APIフィルタの不一致を防ぐ）
  const allTournaments = allData.filter((t: any) => {
    if (!t.status) return false;

    // セレクト項目の「ID」または「値」の両方をチェックして判定を確実に
    const checkMatch = (s: any) => {
      const id = (s?.id || "").toString().toLowerCase();
      const val = (s?.value || s || "").toString().toLowerCase();
      return id === 'results' || val === 'results';
    };

    if (Array.isArray(t.status)) {
      return t.status.some((s: any) => checkMatch(s));
    }
    return checkMatch(t.status);
  });

  // 2. 年度を抽出して重複を排除
  const allYears = Array.from(new Set(allTournaments.map((t: any) => {
    const m = t.date?.match(/\d{4}/);
    return m ? m[0] : null;
  }).filter(Boolean))).sort().reverse() as string[];

  // 3. 選択された年度（デフォルトは 'all' にして全件表示を優先）
  const selectedYear = sp.year || 'all';

  // 4. フィルタリングと並び替え
  let filtered = (selectedYear && selectedYear !== 'all')
    ? allTournaments.filter((t: any) => t.date?.includes(selectedYear))
    : allTournaments;

  // 日付文字列から数値を取得して正確にソート
  filtered.sort((a: any, b: any) => {
    const getDateVal = (dateStr: string) => {
      if (!dateStr) return 0;
      const nums = dateStr.match(/\d+/g);
      if (!nums || nums.length < 3) return 0;
      return new Date(Number(nums[0]), Number(nums[1]) - 1, Number(nums[2])).getTime();
    };
    return getDateVal(b.date) - getDateVal(a.date);
  });

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">

      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            Tournament Results
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* 年度切り替えナビゲーション */}
        <div className="flex flex-wrap gap-3 mb-12 border-b border-slate-200 pb-8">
          <Link
            href="/results?year=all"
            className={`px-6 py-2 text-sm font-black italic tracking-widest transition-all rounded-sm ${selectedYear === 'all'
              ? 'bg-[#001f3f] text-white shadow-lg transform -translate-y-1'
              : 'bg-slate-100 text-[#001f3f] hover:bg-slate-200'
              }`}
          >
            ALL
          </Link>
          {allYears.map(year => (
            <Link
              key={year}
              href={`/results?year=${year}`}
              className={`px-6 py-2 text-sm font-black italic tracking-widest transition-all rounded-sm ${selectedYear === year
                ? 'bg-red-600 text-white shadow-lg transform -translate-y-1'
                : 'bg-slate-100 text-[#001f3f] hover:bg-slate-200'
                }`}
            >
              {year}
            </Link>
          ))}
        </div>

        {/* 大会リスト */}
        <div className="grid grid-cols-1 gap-6">
          {filtered.length > 0 ? (
            filtered.map((t: any) => (
              <Link
                href={`/results/${t.tournament_id}`}
                key={t.id}
                className="group block bg-white border border-slate-200 hover:border-[#001f3f] transition-all shadow-sm hover:shadow-xl p-6 md:p-8 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 italic">
                      {t.date}
                    </p>
                    <h2 className="text-xl md:text-2xl font-black text-[#001f3f] italic uppercase tracking-tight group-hover:text-red-600 transition-colors">
                      {t.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {t.venue}
                      </div>
                      {t.related_video && t.related_video.length > 0 && (
                        <div className="flex items-center gap-1 text-red-600 font-black text-[9px] uppercase tracking-widest italic bg-red-50 px-2 py-0.5 rounded-sm border border-red-100">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          Video Available
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black text-[#001f3f] uppercase tracking-widest italic group-hover:text-red-600 transition-colors">
                    View Full Result <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-[#001f3f] group-hover:bg-red-600 transition-colors"></div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <p className="text-slate-300 font-black italic uppercase tracking-widest">No Results Found for {selectedYear}</p>
            </div>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100">
          <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}