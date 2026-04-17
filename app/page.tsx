import { client } from '@/lib/client';
import Link from 'next/link';
import Image from 'next/image'; // 💡 ここを追加しました
import fs from 'fs';
import path from 'path';
import TopSlider from './TopSlider';
import Sponsors from '@/components/Sponsors';
import LatestVideos from '@/components/LatestVideos';
import InstagramFeed from '@/components/InstagramFeed';
import { getCsvData } from '@/lib/csvParser';
import TournamentEntryBanner from '@/components/TournamentEntryBanner';

import banner01 from '@/public/images/bn-01.jpg';
import banner02 from '@/public/images/bn-02.jpg';

export const revalidate = 3600;

export default async function Home() {
  const tourRes = await client.get({
    endpoint: 'tournament',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

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

  const fetchAllPlayers = async () => {
    let allContents: any[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const res = await client.get({
        endpoint: 'players',
        queries: { limit: limit, offset: offset, fields: 'id,name,image' }
      });
      allContents = [...allContents, ...res.contents];
      if (res.contents.length < limit) break;
      offset += limit;
    }
    return allContents;
  };

  const playersContents = await fetchAllPlayers().catch(() => []);
  const playerInfoMap: Record<string, { id: string, image?: string }> = {};
  playersContents.forEach((p: any) => {
    if (p.name) {
      const key = p.name.normalize('NFKC').replace(/[@＠]/g, '').replace(/[\s　\.\u00a0\t\r\n]+/g, "").toLowerCase().trim();
      playerInfoMap[key] = { id: p.id, image: p.image?.url };
    }
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
          const name = r.name || 'Unknown';
          const matchKey = name.normalize('NFKC').replace(/[@＠]/g, '').replace(/[\s　\.\u00a0\t\r\n]+/g, "").toLowerCase().trim();
          const pData = playerInfoMap[matchKey];

          return {
            rank: r.rank || '-',
            name: name,
            pid: pData?.id,
            imageUrl: pData?.image,
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

  const sliderRes = await client.get({
    endpoint: 'slider',
    queries: { orders: '-createdAt' }
  }).catch(() => ({ contents: [] }));

  const videosRes = await client.get({
    endpoint: 'videos',
    queries: {
      limit: 50,
      filters: 'category[contains]sponsor'
    }
  }).catch(() => ({ contents: [] }));

  const sponsorsData = videosRes.contents.map((v: any) => ({
    id: v.id,
    name: v.title || 'Official Partner',
    logo: v.main_image || v.image || v.thumbnail,
    url: v.url
  }));

  const allVideosRes = await client.get({
    endpoint: 'videos',
    queries: { limit: 20, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  const latestVideosData = allVideosRes.contents
    .filter((v: any) => {
      if (!v.url) return false;
      const cat = typeof v.category === 'string' ? v.category : (Array.isArray(v.category) ? v.category[0] : "");
      if (cat?.includes('sponsor')) return false;

      const t = v.type;
      if (!t) return true;
      const target = Array.isArray(t) ? t[0] : t;
      const id = typeof target === 'string' ? target : target?.id;
      const val = typeof target === 'string' ? target : target?.value;
      return id !== '9pX1xNYa6K' && val !== 'photo';
    })
    .slice(0, 6)
    .map((v: any) => ({
      id: v.id,
      title: v.title,
      url: v.url,
      image: v.main_image || v.image || v.thumbnail,
      date: v.date
    }));

  return (
    <main className="bg-white min-h-screen font-sans text-[#333] pb-32">
      <TopSlider data={sliderRes.contents} />

      {/* ライブ配信バナーエリア (非表示中：次回大会で使用する場合はコメントアウトを解除)
      <section className="bg-white pt-10 pb-4">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
          <div className="relative bg-[#001f3f] rounded-sm shadow-2xl p-6 md:p-8 border-l-4 border-red-600 overflow-hidden group/container">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative w-full flex flex-col gap-8 lg:gap-10 items-center z-10">
              <div className="w-full text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-2 mb-3 justify-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-red-400 font-mono text-xs md:text-sm font-bold tracking-[0.2em] uppercase">Special Live Streaming</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-widest drop-shadow-md leading-tight italic mb-4 md:mb-6">
                  <span className="block text-slate-400 text-xs md:text-sm lg:text-base font-bold tracking-[0.2em] mb-2.5 not-italic">高麗川カントリークラブカップ</span>
                  高麗川大会 <span className="text-red-500">ライブ配信</span>はこちら！
                </h2>

                <div className="inline-flex relative mt-1 md:mt-2 mb-4 group">
                  <div className="absolute inset-0 bg-red-600/40 blur-lg rounded-full animate-pulse group-hover:bg-red-600/60 transition-colors duration-500"></div>
                  
                  <div className="relative flex items-center bg-slate-900 border border-red-500/50 px-5 md:px-7 py-2.5 md:py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-red-500/20 p-2 rounded-full hidden sm:block">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <div className="flex flex-col text-center sm:text-left">
                        <span className="text-slate-400 font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase leading-none mb-1 md:mb-1.5">
                          Date & Time
                        </span>
                        <div className="flex items-baseline justify-center sm:justify-start gap-2">
                          <span className="text-white text-base md:text-xl font-bold tracking-widest leading-none">
                            2026年4月17日<span className="text-red-400 font-medium ml-1">（金）</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-8">
                <Link href="https://video.unext.jp/livedetail/LIV0000014088" target="_blank" rel="noopener noreferrer" className="flex-1 w-full block overflow-hidden rounded shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 border border-white/10 group bg-slate-900 border-b-2 border-b-red-600/50 hover:border-b-red-500">
                  <Image src={banner01} alt="U-NEXT Live" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100" />
                </Link>
                <Link href="https://player.yourlive.jvckenwood.com/jgda/20260417_jgda.html" target="_blank" rel="noopener noreferrer" className="flex-1 w-full block overflow-hidden rounded shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 border border-white/10 group bg-slate-900 border-b-2 border-b-red-600/50 hover:border-b-red-500">
                  <Image src={banner02} alt="JVC KENWOOD Live" className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      <TournamentEntryBanner />

      <section className="bg-white py-24">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
          <div className="mb-10 border-b border-slate-200 pb-6 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-[#001f3f] leading-none mb-2 uppercase">
                MATCH NEWS <span className="text-red-600">FLASH</span>
              </h2>
              <p className="text-slate-400 text-[10px] md:text-xs tracking-[0.3em] font-medium uppercase">Official Tournament Report</p>
            </div>
          </div>

          <div className="mb-16 shadow-2xl overflow-hidden rounded-sm border border-[#001f3f]">
            <header className="bg-[#001f3f] py-6 px-8 border-b border-white/5 flex items-center gap-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight italic">
                {tournament?.title || (tournament ? "Tournament Result" : "No Tournament Data")}
              </h3>
            </header>

            {/* 💡 修正箇所1：大会画像 */}
            {tournament?.image?.url && (
              <div className="w-full aspect-[16/9] md:h-[550px] overflow-hidden bg-slate-900 border-b border-[#001f3f] relative">
                <Image 
                  src={tournament.image.url} 
                  alt="Tournament Visual" 
                  fill 
                  className="object-cover" 
                  sizes="100vw"
                />
              </div>
            )}

            <div className="bg-[#001f3f] py-10 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
              {/* (中略...元のままです) */}
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
              <div className="md:border-r border-white/10 px-6 flex items-start gap-4">
                <div className="mt-1 text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 italic">Venue</p>
                  <p className="text-base font-medium text-white tracking-wide">{tournament?.venue || "---"}</p>
                </div>
              </div>
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
          </div>

          <div className="border-t-4 border-[#001f3f]">
            <div className="bg-[#f8f9fa] py-4 px-6 border-x border-slate-400 border-b-2 border-slate-400 flex justify-between items-center text-[#001f3f]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0h10a2 2 0 002-2v-4a2 2 0 00-2-2h-2m-6 8a2 2 0 002-2v-8a2 2 0 002-2h2a2 2 0 002 2v8a2 2 0 00-2 2H11z" /></svg>
                <h4 className="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase italic">Official Leaderboard</h4>
              </div>
              <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase italic">Final Day Data</span>
            </div>

            {/* Mobile View */}
            <div className="md:hidden bg-white border-x border-b border-slate-400">
              <div className="divide-y divide-slate-200">
                {players.map((p, i) => (
                  <div key={i} className="px-4 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 flex-shrink-0 text-center">
                      <span className="text-xs font-mono font-bold text-slate-400">{p.rank}</span>
                    </div>

                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      {/* 💡 修正箇所2：スマホ版の選手アイコン画像 */}
                      {p.imageUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 relative">
                          <Image 
                            src={p.imageUrl} 
                            alt={p.name} 
                            fill 
                            className="object-cover" 
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="mb-0.5 mt-[-2px]">
                          {p.pid ? (
                            <Link href={`/players/${p.pid}`} className="text-[13px] font-bold text-[#001f3f] hover:text-red-600 transition-colors inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-tight">
                              <span>{p.name}</span>
                              <span className="text-[8px] flex-shrink-0 bg-slate-100 text-slate-400 px-1 py-0 rounded-[2px] font-black tracking-widest uppercase not-italic">Profile</span>
                            </Link>
                          ) : (
                            <span className="text-[13px] font-bold text-[#001f3f] italic tracking-tight leading-tight block">{p.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-medium">
                          <span>{p.is2Day ? '1R' : 'Out'}:{p.out}</span>
                          <div className="w-[1px] h-2 bg-slate-200"></div>
                          <span>{p.is2Day ? '2R' : 'In'}:{p.in}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-2xl font-black italic tracking-tighter text-red-600 leading-none">
                        {p.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto bg-white border-x border-b border-slate-400">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[#333] text-[10px] font-bold tracking-[0.1em] uppercase border-b border-slate-400 bg-slate-50">
                    <th className="py-4 px-4 w-14 text-center border-r border-slate-300">Pos</th>
                    <th className="py-4 px-6 text-left">Player Name</th>
                    <th className="py-4 px-2 w-24 min-w-[96px] text-center border-l border-slate-300">{players[0]?.is2Day ? '1R' : 'Out'}</th>
                    <th className="py-4 px-2 w-24 min-w-[96px] text-center border-l border-slate-300">{players[0]?.is2Day ? '2R' : 'In'}</th>
                    <th className="py-4 px-6 w-24 md:w-44 text-center bg-slate-100 text-[#001f3f] font-black border-l border-slate-400 text-[11px]">{players[0]?.is2Day ? 'Total' : 'Total Score'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {players.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-5 text-center font-mono text-slate-500 font-bold text-sm border-r border-slate-300">{p.rank}</td>
                      <td className="py-5 px-6 text-[14px] font-bold text-[#001f3f] tracking-tight italic select-none leading-tight">
                        <div className="flex items-center gap-3">
                          {/* 💡 修正箇所3：PC版の選手アイコン画像 */}
                          {p.imageUrl ? (
                            <Image 
                              src={p.imageUrl} 
                              alt={p.name} 
                              width={32} 
                              height={32} 
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0 bg-slate-50" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                          )}
                          {p.pid ? (
                            <Link href={`/players/${p.pid}`} className="group/item inline-flex items-center gap-2 hover:text-red-600 transition-all pointer-events-auto">
                              <span className="pointer-events-none">{p.name}</span>
                              <span className="text-[9px] bg-slate-100 group-hover/item:bg-red-600 group-hover/item:text-white text-slate-400 px-1.5 py-0.5 rounded-[2px] font-black tracking-widest uppercase not-italic transition-all pointer-events-none">
                                Profile
                              </span>
                            </Link>
                          ) : (
                            <span className="pointer-events-none">{p.name}</span>
                          )}
                        </div>
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
        </div>
      </section>

      <section className="bg-[#f8f9fa] py-24 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0">
          <div className="mb-16 flex items-end justify-between border-b-2 border-slate-200 pb-8">
            <div>
              <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-[#001f3f]">
                Latest <span className="text-red-600">News</span>
              </h2>
              <p className="mt-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
                最新ニュース
              </p>
            </div>
            <div className="hidden md:block w-24 h-1 bg-red-600"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {newsRes.contents.map((news: any) => (
              <Link href={`/news/${news.id}`} key={news.id} className="group block">
                <div className="aspect-[3/2] bg-white mb-6 overflow-hidden border border-slate-200 group-hover:border-[#001f3f] transition-all relative">
                  {/* 💡 修正箇所4：ニュースのサムネイル画像 */}
                  {news.image?.url && (
                    <Image 
                      src={news.image.url} 
                      alt={news.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
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
          <div className="flex justify-end mt-12">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-[#001f3f] hover:text-red-600 transition-colors"
            >
              View All News <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Sponsors data={sponsorsData} />
      <LatestVideos data={latestVideosData} />
      <InstagramFeed />
    </main>
  );
}