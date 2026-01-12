import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';
import { AboutHeroImage } from './AboutHeroImage';

export const metadata: Metadata = {
  title: 'JGDAとは',
  description: '一般社団法人 日本プロゴルフ選手育成協会（JGDA）の理念、代表理事挨拶、活動内容についてご紹介します。',
};

export const revalidate = 60;

export default async function AboutPage() {
  // 全選手データを取得してプロテスト合格者を抽出
  const fetchAllPlayers = async () => {
    let allContents: any[] = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const res = await client.get({
        endpoint: 'players',
        queries: { limit: limit, offset: offset, orders: 'nameKana' }
      });
      allContents = [...allContents, ...res.contents];
      if (res.contents.length < limit) break;
      offset += limit;
    }
    return allContents;
  };

  const allPlayers = await fetchAllPlayers().catch(() => []);
  const proPassedPlayers = allPlayers.filter((p: any) => p.bio?.includes("プロテスト合格"));

  // 過去の大会（結果公開済み）を取得
  const res = await client.get({
    endpoint: 'tournament',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  const pastTournaments = res.contents.filter((t: any) => {
    const checkMatch = (s: any) => {
      const id = (s?.id || "").toString().toLowerCase();
      const val = (s?.value || s || "").toString().toLowerCase();
      return id === 'results' || val === 'results';
    };
    return Array.isArray(t.status) ? t.status.some(checkMatch) : checkMatch(t.status);
  });

  // 年度別にグルーピング
  const groupedTournaments = pastTournaments.reduce((acc: { [key: string]: any[] }, t: any) => {
    const year = t.date?.split('.')[0] || 'OTHER';
    if (!acc[year]) acc[year] = [];
    acc[year].push(t);
    return acc;
  }, {});

  const years = Object.keys(groupedTournaments).sort((a, b) => b.localeCompare(a));

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      {/* ヘッダーエリア */}
      <div className="bg-[#001f3f] text-white py-20 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            ABOUT <span className="text-red-600">JGDA</span>
          </h1>
          <p className="text-slate-400 font-bold mt-4 tracking-[0.3em] uppercase text-xs italic">一般社団法人 日本プロゴルフ選手育成協会</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* ページトップのワイドバナー画像 */}
        <div className="mb-16 md:mb-24">
          <div className="aspect-[21/9] overflow-hidden rounded-sm shadow-lg border border-slate-100">
            <img src="/images/an8a6761.webp" alt="JGDA Tournament Scene" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 協会紹介セクション */}
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-16 items-start mb-40">
          <div className="relative lg:col-span-4">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-xl">
              <AboutHeroImage />
            </div>
            {/* 装飾的な要素 */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-l border-b border-red-600 -z-10"></div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <h2 className="text-2xl md:text-4xl font-black italic text-[#001f3f] uppercase tracking-tighter leading-none">
              Empowering the <br />
              <span className="text-red-600">Future of Golf</span>
            </h2>
            <div className="w-16 h-[2px] bg-red-600"></div>
            <div className="text-slate-600 leading-loose font-medium space-y-6 text-sm md:text-base">
              <p>
                日本プロゴルフ選手育成協会は、ゴルフ界のさらなる活性化のために、新人プロや研修生へ真剣勝負のできる大会を開催し、将来的にプロとして活躍するための環境づくりを目的とし、2021年に発足致しました。
              </p>
              <p>
                当協会では、選手育成はもとより、ゴルフを通じて、総合支援が出来るよう貢献してまいります。皆様方の多大なるご支援に深く感謝申し上げると共に、より一層のご支援ご声援のほど、よろしくお願い申し上げます。
              </p>
              <div className="text-right pt-8 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Japan Golf Development Association</p>
                <p className="text-sm font-bold text-slate-600 mb-2">一般社団法人日本プロゴルフ選手育成協会</p>
                <p className="text-xl md:text-2xl font-black italic text-[#001f3f]">代表理事 藤井かすみ</p>
              </div>
            </div>
          </div>
        </section>

        {/* プロテスト合格者セクション */}
        <section className="mb-40">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-[#001f3f]">
              PRO TEST <span className="text-red-600">PASSERS</span>
            </h2>
            <div className="w-10 h-1 bg-red-600 mt-4"></div>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.4em] uppercase mt-4 italic">JLPGA Certified Professionals</p>
            <p className="text-slate-600 text-[14px] text-base font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
              JGDAが主催する大会や強化合宿での経験を経て、難関のプロテスト合格という夢を掴み取った選手たちをご紹介します。次世代のゴルフ界を担う選手たちの更なる活躍を、当協会は全力で応援しています。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {proPassedPlayers.length > 0 ? (
              proPassedPlayers.map((player: any) => (
                <Link
                  href={`/players/${player.id}`}
                  key={player.id}
                  className="group p-4 bg-slate-50 border border-slate-100 hover:border-[#001f3f] transition-all text-center rounded-sm flex flex-col items-center"
                >
                  <div className="w-12 h-12 mb-3 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-100 group-hover:border-red-600 transition-colors">
                    {player.image?.url ? (
                      <img src={player.image.url} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold italic">
                        NO IMG
                      </div>
                    )}
                  </div>
                  <p className="text-[#001f3f] font-black italic group-hover:text-red-600 transition-colors uppercase text-sm leading-tight">
                    {player.name}
                  </p>
                  {(player.nameKana || player.name_kana) && (
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {player.nameKana || player.name_kana}
                    </p>
                  )}
                </Link>
              ))
            ) : (
              <div className="col-span-full py-10 text-center border border-dashed border-slate-200 rounded-sm">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest italic">No Data Available</p>
              </div>
            )}
          </div>
        </section>

        {/* 過去の大会実績セクション */}

        <section className="mb-40">
          <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-[#001f3f]">
              Tournament <span className="text-red-600">History</span>
            </h2>
            <div className="w-10 h-1 bg-red-600 mt-4"></div>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.4em] uppercase mt-4 italic"> JGDAが主催した開催大会一覧です</p>

          </div>

          <div className="space-y-12">
            {pastTournaments.length > 0 ? (
              years.map((year) => (
                <div key={year} className="space-y-2">
                  {/* 年度見出し */}
                  <h3 className="text-xl font-black italic text-[#001f3f] mb-4 flex items-center gap-3">
                    {year}
                    <span className="h-[1px] flex-1 bg-slate-100"></span>
                  </h3>

                  {/* 大会リスト */}
                  <div className="grid grid-cols-1 gap-4">
                    {groupedTournaments[year].map((t: any) => (
                      <Link
                        href={`/results/${t.tournament_id}`}
                        key={t.id}
                        className="group flex flex-col p-5 bg-slate-50/50 border border-slate-100 hover:border-red-600/30 hover:bg-white hover:shadow-md transition-all rounded-sm overflow-hidden relative"
                      >
                        {/* 左側のアクセントライン */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-red-600 transition-colors"></div>

                        <div className="flex items-start gap-4">
                          <span className="text-xs md:text-sm font-black italic text-slate-400 group-hover:text-red-600 shrink-0 transition-colors">
                            {t.date?.split('.')[1] || '--'}
                          </span>
                          <div className="w-[1px] h-4 bg-slate-200 shrink-0 mt-1"></div>
                          <span className="text-xs md:text-sm font-bold text-[#001f3f] flex-1">
                            {t.title}
                          </span>
                          <span className="text-[9px] text-slate-300 font-medium uppercase tracking-tighter hidden sm:block shrink-0">
                            {t.venue}
                          </span>
                        </div>

                        {/* スポンサーロゴ */}
                        {t.sponsors && t.sponsors.length > 0 && (
                          <div className="mt-4 ml-10">
                            <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 italic">Tournament Sponsors / 大会スポンサー</p>
                            <div className="flex flex-wrap gap-x-8 gap-y-4">
                              {t.sponsors.map((s: any, idx: number) => (
                                s.logo?.url && (
                                  <img
                                    key={idx}
                                    src={s.logo.url}
                                    alt=""
                                    className="h-6 md:h-10 w-auto object-contain transition-all"
                                  />
                                )
                              ))}
                            </div>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border border-dashed border-slate-200 rounded-sm">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No Records Available</p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-32 pt-12 border-t border-slate-100 flex justify-center">
          <Link href="/" className="group flex flex-col items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.5em] text-slate-400 group-hover:text-red-600 transition-colors uppercase">Back to Home</span>
            <div className="w-8 h-[1px] bg-slate-200 group-hover:w-12 group-hover:bg-red-600 transition-all"></div>
          </Link>
        </div>
      </div>
    </main>
  );
}