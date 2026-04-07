import { client } from '@/lib/client';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
        title: `${tournament.title} 観戦案内`,
        description: `${tournament.date} 開催、${tournament.venue} で行われる「${tournament.title}」のギャラリー観戦案内ページです。チケット情報、アクセス、観戦マナーについてご確認いただけます。`,
        openGraph: {
            title: `${tournament.title} | JGDA 日本プロゴルフ選手育成協会`,
            images: tournament.image?.url ? [tournament.image.url] : [],
        },
    };
}

export const revalidate = 60;

export default async function SpectateDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const tournament = await client.get({
        endpoint: 'tournament',
        contentId: id,
    }).catch(() => null);

    if (!tournament || !tournament.gallery_page_info) {
        notFound();
    }

    return (
        <main className="bg-white min-h-screen pb-20 font-sans text-slate-900 border-t border-slate-100">
            {/* ヒーローエリア */}
            <div className="relative h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] bg-[#001f3f] overflow-hidden">
                {tournament.image?.url && (
                    <img src={tournament.image.url} alt="" className="w-full h-full object-cover object-[center_25%] opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/spectate" className="text-red-500 text-[10px] font-black tracking-[0.3em] uppercase italic mb-4 inline-block hover:text-white transition-colors">
                            ← Back to Spectating List
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
                            {tournament.title} <span className="text-red-600">Spectating</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                <div className="flex flex-col gap-12">
                    {/* 上部：概要（クイックリンクを簡潔に表示） */}
                    <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 flex flex-wrap gap-x-12 gap-y-6 rounded-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Date / 開催日</span>
                            <span className="font-bold text-[#001f3f] text-lg">{tournament.date}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Venue / 開催会場</span>
                            <span className="font-bold text-[#001f3f] text-lg">{tournament.venue}</span>
                        </div>
                        <div className="ml-auto flex items-center">
                            <Link
                                href={`/entry/${id}`}
                                className="inline-flex items-center justify-center bg-[#001f3f] text-white px-8 py-3 text-[11px] font-black italic uppercase tracking-[0.2em] hover:bg-red-600 transition-colors shadow-lg"
                            >
                                Main Event Info →
                            </Link>
                        </div>
                    </div>

                    {/* メイン：詳細コンテンツ */}
                    <div>
                        <h2 className="text-xl font-black italic text-[#001f3f] uppercase tracking-tight border-b-4 border-red-600 pb-2 mb-10">
                            Spectating Information
                            <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">観戦に関する詳細案内</span>
                        </h2>


                        <div className="rich-text-content mb-12">
                            <div dangerouslySetInnerHTML={{ __html: tournament.gallery_page_info }} />
                        </div>
                        
                        {/* ペアリング */}
                        {(tournament.pairing_file || tournament.pairing_url) && (
                            <div className="mb-20">
                                <h3 className="text-xl font-black italic text-[#001f3f] uppercase tracking-tight border-l-8 border-red-600 pl-4 mb-8">
                                    Pairing / Start List
                                    <span className="block text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">組合せ表</span>
                                </h3>
                                {tournament.pairing_file && (
                                    <div className="rich-text-content overflow-x-auto bg-slate-50 border border-slate-200 p-4 md:p-8 rounded-sm mb-6">
                                        <div dangerouslySetInnerHTML={{ __html: tournament.pairing_file }} />
                                    </div>
                                )}
                                {tournament.pairing_url && (
                                    <a href={tournament.pairing_url} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 bg-[#001f3f] hover:bg-red-600 text-white px-8 py-4 font-black italic uppercase tracking-widest transition-all shadow-lg text-sm">
                                        Download PDF →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* クラブバスのご案内 (Notice)  */}
                        {(id === '4w89jqxpnb' || tournament.venue?.includes('高麗川カントリークラブ')) && (
                            <div className="mt-16">
                                <div className="rich-text-content mb-8">
                                    <h3>4. クラブバスの運行について</h3>
                                </div>
                                <div className="bg-white p-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-[#001f3f] mb-4 italic tracking-tight">
                                            【4/17 クラブバスのご案内】
                                        </h3>
                                        <p className="text-sm text-slate-600 font-bold mb-8 leading-relaxed">
                                            4月17日(金)の大会当日は、以下の通り高麗川CCのクラブバスが運行しておりますのでご利用ください。
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                            <div>
                                                <h4 className="font-black text-[#001f3f] mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2 italic text-[10px] uppercase tracking-widest">
                                                    行き（各駅発）
                                                </h4>
                                                <ul className="text-sm space-y-4 text-slate-700">
                                                    <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="font-black text-[#001f3f] text-sm shrink-0">西武池袋線 飯能駅：</span>
                                                        <span className="font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded border border-slate-100 shadow-sm text-sm sm:inline-block">
                                                            6:40 / 7:40 / 8:40
                                                        </span>
                                                    </li>
                                                    <li className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                        <span className="font-black text-[#001f3f] text-sm shrink-0 leading-tight">JR川越線・八高線 高麗川駅：</span>
                                                        <span className="font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded border border-slate-100 shadow-sm text-sm sm:inline-block">
                                                            6:55頃 / 7:55頃 / 8:55頃
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[#001f3f] mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2 italic text-[10px] uppercase tracking-widest">
                                                    帰り（クラブハウス発）
                                                </h4>
                                                <ul className="text-sm space-y-4 text-slate-700">
                                                    <li className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="font-black text-[#001f3f] text-sm shrink-0">ゴルフ場発：</span>
                                                        <span className="font-bold text-slate-900 bg-slate-50 px-4 py-2 rounded border border-slate-100 shadow-sm text-sm sm:inline-block">
                                                            14:30 / 15:30 / 16:30（最終）
                                                        </span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-10">
                                            <h4 className="font-black text-[#001f3f] mb-8 italic tracking-tight text-base flex items-center gap-2">
                                                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                                                クラブバス乗場のご案内
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <h5 className="font-black text-[#001f3f] text-sm border-l-4 border-[#001f3f] pl-3">西武池袋線 飯能駅</h5>
                                                    <div className="border border-slate-100 rounded overflow-hidden shadow-sm">
                                                        <img src="/images/st_0417.jpg" alt="飯能駅バス乗り場案内" className="w-full h-auto" />
                                                        <div className="bg-slate-50 p-2 text-[10px] text-slate-400 text-center italic font-bold">
                                                            飯能駅 バス乗り場案内図
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h5 className="font-black text-[#001f3f] text-sm border-l-4 border-[#001f3f] pl-3">JR川越線・八高線 高麗川駅</h5>
                                                    <div className="bg-[#001f3f] p-6 rounded-sm text-white shadow-md relative overflow-hidden h-full">
                                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                                            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v3h3V7z" /></svg>
                                                        </div>
                                                        <p className="text-sm font-bold leading-loose relative z-10">
                                                            駅出口を出て左手側、<br />
                                                            タクシー乗り場後方付近にてお待ちください。<br /><br />
                                                            <span className="text-red-400">※バスが見えましたら手をあげてお知らせください。</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-10 space-y-1 text-[10px] text-slate-400 font-bold italic">
                                            <p>※乗車定員に限りがございます。満席の際はご容赦ください。</p>
                                            <p>※道路状況により到着が前後する場合がございます。</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
