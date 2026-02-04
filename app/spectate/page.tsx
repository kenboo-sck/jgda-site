import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'ギャラリー観戦のご案内',
    description: 'JGDA主催ゴルフ大会のギャラリー観戦案内ページ。観戦チケット情報、料金、会場へのアクセス方法、駐車場情報、観戦マナー・ルールをご確認いただけます。プロを目指す若手選手たちの真剣勝負をぜひ会場でご観戦ください。',
};

export const revalidate = 60;

export default async function SpectatePage() {
    const res = await client.get({
        endpoint: 'tournament',
        queries: { limit: 100, orders: '-date' }
    }).catch(() => ({ contents: [] }));

    const allTournaments = res.contents;

    // ギャラリー専用情報（gallery_page_info）がある大会を抽出
    const spectateTournaments = allTournaments.filter((t: any) => {
        const checkMatch = (s: any, target: string) => {
            const id = (s?.id || "").toString().toLowerCase();
            const val = (s?.value || s || "").toString().toLowerCase();
            return id === target || val === target;
        };

        const hasInfo = !!t.gallery_page_info;
        const isResults = Array.isArray(t.status) ? t.status.some((s: any) => checkMatch(s, 'results')) : checkMatch(t.status, 'results');
        const isUpcoming = Array.isArray(t.status) ? t.status.some((s: any) => checkMatch(s, 'upcoming')) : checkMatch(t.status, 'upcoming');

        // 専用情報があり、かつ「結果公開中」でも「募集前」でもない大会のみを表示
        return hasInfo && !isResults && !isUpcoming;
    });

    return (
        <main className="bg-white min-h-screen pb-20 font-sans text-slate-900 border-t border-slate-100">
            <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        GALLERY <span className="text-red-600">SPECTATING</span>
                    </h1>
                    <p className="text-slate-400 font-bold mt-4 tracking-widest uppercase text-xs italic">ギャラリー観戦のご案内</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-16">
                {spectateTournaments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-16">
                        {spectateTournaments.map((t: any) => (
                            <section key={t.id} className="bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
                                <div className="grid grid-cols-1 lg:grid-cols-12">
                                    {/* 画像セクション */}
                                    <Link href={`/spectate/${t.id}`} className="lg:col-span-5 aspect-[16/9] lg:aspect-auto relative bg-slate-900 overflow-hidden group/img">
                                        {t.image?.url ? (
                                            <img src={t.image.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">NO IMAGE</div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 tracking-widest uppercase italic shadow-lg">
                                            Tickets Available
                                        </div>
                                    </Link>

                                    {/* コンテンツセクション */}
                                    <div className="lg:col-span-7 p-8 md:p-12">
                                        <div className="mb-6">
                                            <p className="text-red-600 text-[10px] font-black italic uppercase tracking-[0.2em] mb-2">{t.date}</p>
                                            <Link href={`/spectate/${t.id}`} className="group/link">
                                                <h2 className="text-xl md:text-2xl font-black text-[#001f3f] italic uppercase tracking-tight leading-tight group-hover/link:text-red-600 transition-colors">
                                                    {t.title}
                                                </h2>
                                            </Link>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {t.venue}
                                            </p>
                                        </div>

                                        <div className="rich-text-content mb-10 line-clamp-3 text-sm"
                                            dangerouslySetInnerHTML={{ __html: t.gallery_page_info }} />

                                        <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-4">
                                            <Link
                                                href={`/spectate/${t.id}`}
                                                className="inline-flex items-center gap-2 bg-[#001f3f] text-white px-6 py-3 text-[11px] font-black italic uppercase tracking-[0.2em] hover:bg-red-600 transition-colors shadow-lg"
                                            >
                                                View Details <span className="translate-y-[1px]">→</span>
                                            </Link>
                                            <Link
                                                href={`/entry/${t.id}`}
                                                className="inline-flex items-center gap-2 border-2 border-[#001f3f] text-[#001f3f] px-6 py-[10px] text-[11px] font-black italic uppercase tracking-[0.2em] hover:bg-[#001f3f] hover:text-white transition-all shadow-sm"
                                            >
                                                Tournament Info
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-lg">
                        <svg className="w-16 h-16 text-slate-200 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-slate-300 font-black italic uppercase tracking-widest text-lg">No Spectating Information Available</p>
                        <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">現在、観戦案内中の大会はありません。</p>
                    </div>
                )}

                <div className="mt-32 pt-12 border-t border-slate-100 flex justify-center">
                    <Link href="/" className="group flex flex-col items-center gap-2 text-slate-400 hover:text-red-600 transition-colors">
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase">Back to Home</span>
                        <div className="w-8 h-[1px] bg-slate-200 group-hover:w-16 group-hover:bg-red-600 transition-all"></div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
