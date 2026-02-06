import { client } from '@/lib/client';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LawsonLogo } from '@/components/LawsonLogo';
import LawsonTicketSection from '@/components/LawsonTicketSection';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tournament = await client.get({
    endpoint: 'tournament',
    contentId: id,
  }).catch(() => null);

  if (!tournament) return { title: 'Tournament Not Found' };

  return {
    title: `${tournament.title} エントリー案内`,
    description: `${tournament.date} 開催、${tournament.venue} で行われる「${tournament.title}」のエントリー案内ページです。募集人数やエントリー方法についてご確認いただけます。`,
    openGraph: {
      title: `${tournament.title} | JGDA 日本プロゴルフ選手育成協会`,
      images: tournament.image?.url ? [tournament.image.url] : [],
    },
  };
}

export const revalidate = 60;

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tournament = await client.get({
    endpoint: 'tournament',
    contentId: id,
  }).catch(() => null);

  // ステータス判定用のヘルパー（文字列、オブジェクト、配列のいずれにも対応）
  const checkStatus = (target: string) => {
    const s = tournament?.status;
    if (!s) return false;
    const check = (val: any) => (val?.id || val || "").toString().toLowerCase() === target;
    return Array.isArray(s) ? s.some(check) : check(s);
  };

  const isResults = checkStatus('results');
  const isEntry = tournament?.entry_active || checkStatus('entry');

  // ステータスが 'results'（結果公開中）の場合は、エントリーページとしては表示させない（404にする）
  // または、エントリー情報が空の場合も表示させない
  if (!tournament || isResults || (!tournament.entry_active && !tournament.entry_guidelines)) {
    notFound();
  }

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      {/* アイコン定義（再利用用） */}
      <svg className="hidden">
        <symbol id="icon-status" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></symbol>
        <symbol id="icon-prize" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></symbol>
        <symbol id="icon-spectate" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></symbol>
        <symbol id="icon-rules" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></symbol>
        <symbol id="icon-guidance" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></symbol>
        <symbol id="icon-date" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></symbol>
        <symbol id="icon-entry" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></symbol>
      </svg>

      {/* ヒーローエリア */}
      <div className="relative h-[40vh] md:h-[60vh] min-h-[300px] md:min-h-[450px] bg-slate-900 overflow-hidden">
        {tournament.image?.url && (
          <img src={tournament.image.url} alt="" className="w-full h-full object-cover object-[center_25%] opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-5xl mx-auto">
            <Link href="/entry" className="text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase italic mb-4 inline-block hover:text-white transition-colors">
              ← Back to Entry List
            </Link>
            <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
              {tournament.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-20">

          {/* 開催概要 */}
          <section>
            <h2 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tight border-b-4 border-red-600 pb-2 mb-6 flex flex-col">
              Tournament Overview
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">開催概要</span>
            </h2>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex border-b border-slate-100 py-3">
                <dt className="w-32 font-black text-slate-400 uppercase italic">開催日</dt>
                <dd className="font-bold text-base">{tournament.date}</dd>
              </div>
              <div className="flex border-b border-slate-100 py-4">
                <dt className="w-32 font-black text-slate-400 uppercase italic shrink-0">開催会場</dt>
                <dd className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    {tournament.venue_logo?.url && (
                      <div className="w-12 h-12 bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0">
                        <img src={tournament.venue_logo.url} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="font-bold">
                      {tournament.venue_url ? (
                        <a
                          href={tournament.venue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#001f3f] text-base underline decoration-slate-300 underline-offset-4 hover:decoration-[#001f3f] transition-colors"
                        >
                          {tournament.venue}
                        </a>
                      ) : (
                        tournament.venue
                      )}
                    </div>
                  </div>
                  {tournament.venue_address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tournament.venue + ' ' + tournament.venue_address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 font-medium hover:text-red-600 transition-colors flex items-center gap-1 group/address"
                    >
                      <svg className="w-3 h-3 text-slate-300 group-hover/address:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {tournament.venue_address}
                    </a>
                  )}
                </dd>
              </div>
              <div className="flex border-b border-slate-100 py-3">
                <dt className="w-32 font-black text-slate-400 uppercase italic">募集人数</dt>
                <dd className="font-bold text-base">{tournament.entry_count || "---"}</dd>
              </div>
            </dl>
            {/* ステータスがエントリー関連の時のみガイドラインを表示 */}
            {tournament.entry_guidelines && tournament.status !== 'results' && (
              <div className="rich-text-content mt-8 bg-slate-50 p-6 md:p-10 rounded-sm border border-slate-100"
                dangerouslySetInnerHTML={{ __html: tournament.entry_guidelines }} />
            )}
          </section>

          {/* Entry Period Section */}
          {tournament.entry_period && !isResults && (
            <section className="relative group mb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#001f3f] text-white flex items-center justify-center rounded-sm transform -skew-x-12 group-hover:bg-red-600 transition-colors">
                  <svg className="w-6 h-6 transform skew-x-12"><use href="#icon-date" /></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tight">Entry Period</h3>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">エントリー期間</span>
                </div>
                <div className="flex-1 h-[2px] bg-slate-100"></div>
              </div>
              <div className="rich-text-content pl-4 md:pl-16"
                dangerouslySetInnerHTML={{ __html: tournament.entry_period }} />
            </section>
          )}

          {/* 各種セクション（リッチエディタ群） */}
          {tournament.entry_fee && !isResults && (
            <section className="relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#001f3f] text-white flex items-center justify-center rounded-sm transform -skew-x-12 group-hover:bg-red-600 transition-colors">
                  <svg className="w-6 h-6 transform skew-x-12"><use href="#icon-prize" /></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tight">Entry Fee</h3>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">エントリーフィ</span>
                </div>
                <div className="flex-1 h-[2px] bg-slate-100"></div>
              </div>
              <div className="rich-text-content pl-4 md:pl-16"
                dangerouslySetInnerHTML={{ __html: tournament.entry_fee }} />
            </section>
          )}

          {/* Entry Application Section */}
          {isEntry && (
            <section className="relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#001f3f] text-white flex items-center justify-center rounded-sm transform -skew-x-12 group-hover:bg-red-600 transition-colors">
                  <svg className="w-6 h-6 transform skew-x-12"><use href="#icon-entry" /></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tight">Entry Application</h3>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">エントリー申込</span>
                </div>
                <div className="flex-1 h-[2px] bg-slate-100"></div>
              </div>

              <div className="pl-4 md:pl-16 space-y-10">
                <LawsonTicketSection
                  qrUrl={tournament.entry_qr?.url}
                  entryUrl={tournament.entry_url || "#"}
                />

                <div className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  <p>締め切り前に定員一杯となった場合、キャンセル待ち希望の選手は、事務局へ直接連絡をいただきますようお願いいたします。</p>
                  <p className="mt-2">
                    竹内メールアドレス <a href="mailto:takeuchi@jgda.or.jp" className="text-[#001f3f] font-bold underline decoration-slate-300 underline-offset-4 hover:decoration-[#001f3f] transition-colors">takeuchi@jgda.or.jp</a> もしくは竹内LINEまでお願いいたします。
                  </p>
                </div>
              </div>
            </section>
          )}



          {/* 残りのセクション */}
          {[
            { title: "Entry Status", subTitle: "エントリー状況", content: tournament.entry_status, icon: "status" },
            { title: "Entry Terms", subTitle: "エントリー条件", content: tournament.entry_terms, icon: "rules" },
            { title: "Practice Round", subTitle: "練習ラウンドについて", content: tournament.practice_info, icon: "guidance" },
            { title: "Prize Money", subTitle: "賞金", content: tournament.prize_money, icon: "prize" },
            { title: "Spectating", subTitle: "ギャラリー観戦", content: tournament.spectate_info, icon: "spectate" },
            { title: "Rules", subTitle: "競技ルール", content: tournament.rules, icon: "rules" },
            { title: "Guidance", subTitle: "案内事項", content: tournament.guidance, icon: "guidance" }
          ].map((sec) => sec.content && (
            <section key={sec.title} className="relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#001f3f] text-white flex items-center justify-center rounded-sm transform -skew-x-12 group-hover:bg-red-600 transition-colors">
                  <svg className="w-6 h-6 transform skew-x-12"><use href={`#icon-${sec.icon}`} /></svg>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tight">
                    {sec.title}
                  </h3>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">{sec.subTitle}</span>
                </div>
                <div className="flex-1 h-[2px] bg-slate-100"></div>
              </div>
              <div className="rich-text-content pl-4 md:pl-16"
                dangerouslySetInnerHTML={{ __html: sec.content }} />
            </section>
          ))}

          {/* ペアリング */}
          {tournament.pairing_url && (
            <section className="bg-[#001f3f] text-white p-8 rounded-sm">
              <div className="flex flex-col mb-4">
                <h3 className="text-xl font-black italic uppercase tracking-widest">Pairing / Start List</h3>
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">組合せ表</span>
              </div>
              <p className="text-slate-400 text-xs mb-6 font-bold uppercase tracking-widest">組合せ表が公開されました。下記よりダウンロードしてください。</p>
              <a href={tournament.pairing_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-white hover:text-[#001f3f] text-white px-8 py-4 font-black italic uppercase tracking-widest transition-all">
                Download PDF →
              </a>
            </section>
          )}

          {/* スポンサーロゴ (メインエリアに移動して拡大) */}
          {tournament.sponsors && tournament.sponsors.length > 0 && (
            <section className="pt-16 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black italic text-[#001f3f] uppercase tracking-tight">Tournament Sponsors</h3>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">大会スポンサー</span>
                </div>
                <span className="flex-1 h-[1px] bg-slate-200"></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10">
                {tournament.sponsors.map((s: any, i: number) => {
                  const content = (
                    <div className="w-full h-full flex items-center justify-center p-2 transition-all group/sponsor">
                      {s.logo?.url && (
                        <img
                          src={s.logo.url}
                          alt=""
                          className="max-w-[95%] max-h-[90%] object-contain transition-transform duration-500 group-hover/sponsor:scale-105"
                        />
                      )}
                    </div>
                  );

                  return (
                    <div key={i} className="aspect-[3/2] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                      {/* Try common field IDs for the URL: url, link, link_url */}
                      {(s.url || s.link || s.link_url) ? (
                        <a href={s.url || s.link || s.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-8">
        <div className="h-[1px] w-20 bg-red-600"></div>
        <div className="flex gap-10">
          <Link href="/entry" className="group flex items-center gap-2 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> Entry List
          </Link>
          <Link href="/" className="group flex items-center gap-2 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
            Home <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}