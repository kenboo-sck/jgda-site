import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '大会エントリー・年間スケジュール',
  description: 'JGDA主催ゴルフ大会へのエントリー受付ページ。現在募集中の大会一覧、参加資格、エントリー費用、申込方法をご確認いただけます。年間のツアースケジュールも掲載。プロテスト合格を目指す研修生・アマチュア選手の皆様のご参加をお待ちしています。',
};

export const revalidate = 60;

export default async function EntryListPage() {
  // 大会情報を取得（エントリー受付中のものを優先的に取得する想定）
  const res = await client.get({
    endpoint: 'tournament',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  const allTournaments = res.contents;

  // 1. エントリー受付中の大会（結果公開済み以外で、かつステータスがupcoming以外で、エントリー設定があるもの）
  const entryTournaments = allTournaments.filter((t: any) => {
    const checkMatch = (s: any, target: string) => {
      const id = (s?.id || "").toString().toLowerCase();
      const val = (s?.value || s || "").toString().toLowerCase();
      return id === target || val === target;
    };

    const isResults = Array.isArray(t.status) ? t.status.some((s: any) => checkMatch(s, 'results')) : checkMatch(t.status, 'results');
    const isUpcoming = Array.isArray(t.status) ? t.status.some((s: any) => checkMatch(s, 'upcoming')) : checkMatch(t.status, 'upcoming');

    // 結果公開済みでなく、かつ募集前（upcoming）でもなく、エントリー用の設定がある場合に表示
    return !isResults && !isUpcoming && (t.entry_active || t.entry_guidelines);
  });

  // 2. スケジュール用（結果公開済み以外の大会を抽出し、開催が近い順にソート）
  const scheduleTournaments = allTournaments
    .filter((t: any) => {
      const checkMatch = (s: any) => {
        const id = (s?.id || "").toString().toLowerCase();
        const val = (s?.value || s || "").toString().toLowerCase();
        return id === 'results' || val === 'results';
      };
      return !(Array.isArray(t.status) ? t.status.some(checkMatch) : checkMatch(t.status));
    })
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusLabel = (t: any) => {
    const checkResults = (s: any) => (s?.id || s || "").toString().toLowerCase() === 'results';
    if (Array.isArray(t.status) ? t.status.some(checkResults) : checkResults(t.status)) return { label: 'FINISHED', class: 'text-slate-400 border-slate-200' };
    if (t.entry_active) return { label: 'ENTRY OPEN', class: 'text-red-600 border-red-600' };
    return { label: 'UPCOMING', class: 'text-[#001f3f] border-[#001f3f]' };
  };

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            Tournament <span className="text-red-600">Entry</span>
          </h1>
          <p className="text-slate-400 font-bold mt-4 tracking-widest uppercase text-xs italic">大会エントリー受付一覧</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* セクション見出し: エントリー中 */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-black italic uppercase tracking-tight text-[#001f3f]">
            Active <span className="text-red-600">Entries</span>
          </h2>
          <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {entryTournaments.length > 0 ? (
            entryTournaments.map((t: any) => (
              <Link href={`/entry/${t.id}`} key={t.id} className="group bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col">
                {/* 画像エリア */}
                <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative">
                  {t.image?.url ? (
                    <img src={t.image.url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">NO IMAGE</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-black px-3 py-1 tracking-widest uppercase italic rounded-sm shadow-lg ${t.entry_active ? 'bg-red-600 text-white' : 'bg-slate-800 text-white/50'}`}>
                      {t.entry_active ? 'Accepting' : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* テキストエリア */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 text-[10px] font-black italic uppercase tracking-widest">{t.date}</span>
                  </div>
                  <h2 className="text-lg font-black text-[#001f3f] italic uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {t.title}
                  </h2>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {t.venue}
                    </div>
                    <span className="text-[10px] font-black italic text-[#001f3f] group-hover:translate-x-1 transition-transform">VIEW DETAILS →</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <p className="text-slate-300 font-black italic uppercase tracking-widest">No Active Entries Found</p>
              <p className="text-slate-400 text-xs mt-2 font-bold">現在、募集中の大会はありません。</p>
            </div>
          )}
        </div>

        {/* スケジュールセクション */}
        <div className="mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b-4 border-[#001f3f] pb-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-[#001f3f] leading-none">
                Season <span className="text-red-600">Schedule</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 italic">年間ツアースケジュール</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest">Total {scheduleTournaments.length} Tournaments</span>
            </div>
          </div>

          <div className="space-y-4">
            {scheduleTournaments.map((t: any) => {
              const status = getStatusLabel(t);
              const isLinkDisabled = status.label === 'UPCOMING';

              const content = (
                <>
                  {/* 日付 */}
                  <div className="w-32 shrink-0">
                    <p className="text-lg font-black italic text-[#001f3f] leading-none">{t.date?.split('.')[1]}.{t.date?.split('.')[2]}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.date?.split('.')[0]}</p>
                  </div>

                  {/* タイトルと会場 */}
                  <div className="flex-1">
                    <h3 className={`text-base md:text-lg font-black italic uppercase tracking-tight transition-colors line-clamp-1 text-[#001f3f] ${isLinkDisabled ? '' : 'group-hover:text-red-600'}`}>
                      {t.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {t.venue}
                    </p>
                  </div>

                  {/* ステータスバッジ */}
                  <div className={`inline-flex items-center justify-center px-4 py-1 border-2 text-[9px] font-black italic tracking-[0.2em] rounded-full shrink-0 ${status.class}`}>
                    {status.label}
                  </div>
                </>
              );

              if (isLinkDisabled) {
                return (
                  <div key={t.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 md:p-6 bg-white border border-slate-100 cursor-default">
                    {content}
                  </div>
                );
              }

              return (
                <Link href={`/entry/${t.id}`} key={t.id} className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 md:p-6 bg-white border border-slate-100 hover:border-[#001f3f] transition-all hover:shadow-md relative overflow-hidden">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-center">
          <Link href="/" className="group inline-flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}