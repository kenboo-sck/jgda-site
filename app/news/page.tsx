import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
  title: '最新ニュース・お知らせ',
  description: 'JGDA（日本プロゴルフ選手育成協会）の最新ニュース一覧。大会レポート、選手の活躍情報、プロテスト合格者発表、イベント告知、協会からのお知らせを随時更新中。ゴルフ界の最新動向をお届けします。',
};

export const revalidate = 60;

export default async function NewsListPage() {
  const res = await client.get({
    endpoint: 'news',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  const newsList = res.contents;

  const featuredNews = newsList[0];
  const otherNews = newsList.slice(1);

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            NEWS
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Featured News */}
        {featuredNews && (
          <div className="mb-16">
            <Link href={`/news/${featuredNews.id}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-center bg-slate-50 border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="lg:col-span-7 w-full aspect-[4/3] overflow-hidden relative bg-slate-100">
                {featuredNews.image?.url ? (
                  <img src={featuredNews.image.url} alt="" className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic bg-slate-100">NO IMAGE</div>
                )}
                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-4 py-2 tracking-[0.2em] uppercase italic">Latest News</div>
              </div>
              <div className="lg:col-span-5 p-8 lg:p-12">
                <p className="text-[12px] text-red-600 mb-4 font-black tracking-widest uppercase italic">
                  {new Date(featuredNews.date || featuredNews.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }).replace(/\//g, '.')}
                </p>
                <h2 className="text-2xl md:text-3xl font-black leading-tight text-[#001f3f] mb-6 group-hover:text-red-600 transition-colors italic uppercase tracking-tighter">
                  {featuredNews.title}
                </h2>
                <div className="inline-flex items-center gap-3 text-[10px] font-black text-[#001f3f] uppercase tracking-widest group-hover:gap-5 transition-all">
                  Read Article <span className="text-red-600">→</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {otherNews.map((news: any) => (
            <Link href={`/news/${news.id}`} key={news.id} className="group block relative">
              <div className="relative aspect-[4/3] bg-slate-50 mb-6 overflow-hidden border border-slate-200 transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-2">
                {news.image?.url ? (
                  <img
                    src={news.image.url}
                    alt=""
                    className="w-full h-full object-cover block transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">NO IMAGE</div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
              <div className="px-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-[1px] bg-red-600"></span>
                  <p className="text-[10px] text-red-600 font-black tracking-widest uppercase italic">
                    {new Date(news.date || news.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\//g, '.')}
                  </p>
                </div>
                <h2 className="text-lg font-black leading-snug text-[#001f3f] group-hover:text-red-600 transition-colors italic uppercase tracking-tight">
                  {news.title}
                </h2>
                <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Detail <span>+</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        {newsList.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-lg">
            <p className="text-slate-300 font-black italic uppercase tracking-widest">No News Found</p>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-slate-100">
          <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}