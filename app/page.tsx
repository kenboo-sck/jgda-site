import { client } from '@/lib/client';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import TopSlider from './TopSlider';
import Sponsors from '@/components/Sponsors';
import { getCsvData } from '@/lib/csvParser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const tourRes = await client.get({
    endpoint: 'tournament',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  // Get the latest tournament with 'results' status or a CSV assigned
  const tournament = tourRes?.contents?.find((t: any) => {
    const status = t.status || t.tournament_status;
    if (!status) return !!t.csv_name;

    const checkMatch = (item: any) => {
      const value = (item?.id || item?.value || item || "").toString().toLowerCase();
      return ['results', '結果公開'].includes(value);
    };

    if (Array.isArray(status)) return status.some(checkMatch);
    return checkMatch(status);
  });

  let players: any[] = [];
  const targetFileName = tournament?.csv_name || 'arima.csv';

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', targetFileName);
    if (fs.existsSync(filePath)) {
      const data: any[] = getCsvData(targetFileName);
      const is2Day = data.length > 0 && ('1r' in (data[0] as any) || '1R' in (data[0] as any));

      players = data
        .filter((r: any) => r.rank !== 'PAR' && r.name)
        .slice(0, 25)
        .map((r: any) => {
          let scoreVal = r.score || r.total || '-';
          if (scoreVal !== '-' && scoreVal !== '' && !isNaN(Number(scoreVal))) {
            const s = Number(scoreVal);
            if (s > 0) scoreVal = `+${s}`;
            else if (s === 0) scoreVal = 'E';
          }
          return {
            rank: r.rank || '-',
            name: r.name || 'Unknown',
            out: is2Day ? (r['1r'] || r['1R'] || '-') : (r.out || '-'),
            in: is2Day ? (r.total || r.TOTAL || r.Total || '-') : (r.in || '-'),
            score: scoreVal,
            is2Day: is2Day
          };
        });
    }
  } catch (err) {
    console.error("CSV Loading Error:", err);
  }

  const newsRes = await client.get({
    endpoint: 'news',
    queries: { limit: 3, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  // スライダーデータの取得
  const sliderRes = await client.get({
    endpoint: 'slider',
    queries: { orders: '-createdAt' }
  }).catch(() => ({ contents: [] }));

  // スポンサーデータの取得 (videos APIで代用)
  const videosRes = await client.get({
    endpoint: 'videos',
    queries: {
      limit: 50,
      filters: 'category[contains]sponsor'
    }
  }).catch(() => ({ contents: [] }));

  console.log("Sponsor Data from CMS:", videosRes.contents);

  // videosのフィールドをSponsorコンポーネントの形式にマッピング
  const sponsorsData = videosRes.contents.map((v: any) => ({
    id: v.id,
    name: v.title || 'Official Partner', // タイトルがない場合のフォールバック
    logo: v.main_image || v.image || v.thumbnail, // main_imageを優先的に取得
    url: v.url // 動画URLをリンク先に
  }));

  return (
    <main className="bg-[#ffffff] min-h-screen font-sans text-[#333] pb-32">

      {/* 1. スライダーエリア */}
      <TopSlider data={sliderRes.contents} />

      <div className="max-w-[1200px] mx-auto px-4 xl:px-0">

        {/* 2. メインタイトル */}
        <section className="mb-10 border-b border-slate-200 pb-6 flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-[#001f3f] leading-none mb-2 uppercase">
              MATCH NEWS <span className="text-red-600">FLASH</span>
            </h2>
            <p className="text-slate-400 text-[10px] md:text-xs tracking-[0.3em] font-medium uppercase">Official Tournament Report</p>
          </div>
        </section>

        {/* 3. 大会コンテンツセクション（アイコン導入・文字サイズ統一） */}
        <section className="mb-16 shadow-2xl overflow-hidden rounded-sm border border-[#001f3f]">

          <header className="bg-[#001f3f] py-6 px-8 border-b border-white/5 flex items-center gap-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight italic uppercase">
              {tournament?.title || (tournament ? "Tournament Result" : "No Tournament Data")}
            </h3>
          </header>

          {tournament?.image?.url && (
            <div className="w-full aspect-[16/9] md:h-[550px] overflow-hidden bg-slate-900 border-b border-[#001f3f]">
              <img src={tournament.image.url} className="w-full h-full object-cover" alt="Tournament Visual" />
            </div>
          )}

          {/* 大会詳細：文字サイズを統一し、SVGアイコンを追加 */}
          <div className="bg-[#001f3f] py-10 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
            {/* Date */}
            <div className="md:border-r border-white/10 px-6 flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 italic">Date</p>
                <p className="text-base font-medium text-white tracking-wide">
                  {tournament?.date
                    ? (tournament.date.includes('T') ? new Date(tournament.date).toLocaleDateString('ja-JP').replace(/\//g, '.') : tournament.date)
                    : "---"}
                </p>
              </div>
            </div>
            {/* Venue */}
            <div className="md:border-r border-white/10 px-6 flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 italic">Venue</p>
                <p className="text-base font-medium text-white tracking-wide">{tournament?.venue || "---"}</p>
              </div>
            </div>
            {/* Winner */}
            <div className="px-6 flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 italic">Winner</p>
                <p className="text-base font-bold text-white tracking-wide italic underline underline-offset-4 decoration-red-600 decoration-2">
                  {players.length > 0 ? players[0].name : "---"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. リーダーボード */}
        <section className="mb-24">
          <div className="border-t-4 border-[#001f3f]">
            <div className="bg-[#f8f9fa] py-4 px-6 border-x border-slate-400 border-b-2 border-slate-400 flex justify-between items-center text-[#001f3f]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0h10a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-6 8a2 2 0 002-2v-8a2 2 0 002-2h2a2 2 0 002 2v8a2 2 0 00-2 2H11z" /></svg>
                <h4 className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase italic">Official Leaderboard</h4>
              </div>
              <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase italic">Final Day Data</span>
            </div>
            <div className="overflow-x-auto bg-white border-x border-b border-slate-400">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[#333] text-[10px] font-bold tracking-[0.1em] uppercase border-b border-slate-400 bg-slate-50">
                    <th className="py-4 px-4 w-14 text-center border-r border-slate-300">Pos</th>
                    <th className="py-4 px-6 text-left">Player Name</th>
                    <th className="py-4 px-2 w-16 text-center border-l border-slate-300">{players[0]?.is2Day ? '1R' : 'Out'}</th>
                    <th className="py-4 px-2 w-16 text-center border-l border-slate-300">{players[0]?.is2Day ? '2R' : 'In'}</th>
                    <th className="py-4 px-6 w-24 md:w-44 text-center bg-slate-100 text-[#001f3f] font-black border-l border-slate-400 text-[11px]">{players[0]?.is2Day ? 'Total' : 'Total Score'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {players.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-5 text-center font-mono text-slate-500 font-bold text-sm border-r border-slate-300">{p.rank}</td>
                      <td className="py-5 px-6 text-[14px] md:text-[16px] font-bold text-[#001f3f] whitespace-nowrap tracking-tight italic">
                        {p.name}
                      </td>
                      <td className="py-5 text-center text-slate-600 font-medium text-xs border-l border-slate-300">{p.out}</td>
                      <td className="py-5 text-center text-slate-600 font-medium text-xs border-l border-slate-300">{p.in}</td>
                      <td className="py-5 text-center font-black text-2xl text-red-600 bg-[#f9f9f9] group-hover:bg-slate-100 border-l border-slate-400 tracking-tighter">
                        {p.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {tournament?.tournament_id && (
              <div className="flex justify-end mt-4">
                <Link
                  href={`/results/${tournament.tournament_id}`}
                  className="group inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-[#001f3f] hover:text-red-600 transition-colors"
                >
                  View Full Result <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 5. ニュース */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black tracking-[0.4em] text-[#001f3f] uppercase italic">Latest News</h2>
            <div className="flex-1 h-[2px] bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {newsRes.contents.map((news: any) => (
              <Link href={`/news/${news.id}`} key={news.id} className="group block">
                <div className="aspect-[3/2] bg-slate-50 mb-6 overflow-hidden border border-slate-200 group-hover:border-[#001f3f] transition-all relative">
                  {news.image?.url && (
                    <img src={news.image.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mb-2 font-bold tracking-widest uppercase">
                  {new Date(news.date || news.publishedAt || news.createdAt).toLocaleDateString('ja-JP').replace(/\//g, '.')}
                </p>
                <h4 className="text-[14px] font-bold leading-relaxed text-[#001f3f] group-hover:text-red-600 transition-colors">
                  {news.title}
                </h4>
              </Link>
            ))}
          </div>
          <div className="flex justify-end mt-10">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-[#001f3f] hover:text-red-600 transition-colors"
            >
              View All News <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* 6. スポンサーセクション */}
        <Sponsors data={sponsorsData} />

      </div>
    </main>
  );
}