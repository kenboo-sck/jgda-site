import { client } from '@/lib/client';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const news = await client.get({
    endpoint: 'news',
    contentId: id,
  }).catch(() => null);

  if (!news) return { title: 'News Not Found' };

  return {
    title: news.title,
    description: news.content?.replace(/<[^>]*>?/gm, '').substring(0, 160),
    openGraph: {
      title: news.title,
      images: news.image?.url ? [news.image.url] : [],
    },
  };
}

export const revalidate = 60;

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const news = await client.get({
    endpoint: 'news',
    contentId: id,
  }).catch(() => null);

  if (!news) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-400 mb-4 italic uppercase">News Not Found</h1>
        <Link href="/news" className="text-[#001f3f] font-bold hover:text-red-600 transition-colors border-b border-[#001f3f] hover:border-red-600">
          NEWS一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 tracking-[0.2em] uppercase italic">News</span>
            <p className="text-[10px] text-slate-400 font-black tracking-[0.3em] uppercase italic">
              {new Date(news.date || news.createdAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              }).replace(/\//g, '.')}
            </p>
          </div>
          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase leading-tight">
            {news.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {news.image?.url && (
          <div className="mb-12 border border-slate-200 shadow-2xl">
            <img
              src={news.image.url}
              alt=""
              className="w-full h-auto block"
            />
          </div>
        )}

        <div
          className="prose prose-slate max-w-none whitespace-pre-wrap
            prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:text-[#001f3f]
            prose-p:text-slate-700 prose-p:leading-loose prose-p:font-medium prose-p:text-lg prose-p:mb-8
            prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-sm prose-img:shadow-md
            [&_p:empty]:h-8 [&_p:empty]:block"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <div className="mt-24 pt-10 border-t-2 border-[#001f3f] flex justify-between items-center">
          <Link href="/news" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to News List
          </Link>
          <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
            Home <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
