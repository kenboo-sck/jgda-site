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

                        <div className="rich-text-content">
                            <div dangerouslySetInnerHTML={{ __html: tournament.gallery_page_info }} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
