// フォトギャラリー詳細ページ: 特定の大会の写真をMasonryレイアウトで表示します
import { client } from '@/lib/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GalleryGrid from './GalleryGrid';

export const revalidate = 60;

export default async function PhotoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const gallery = await client.get({
    endpoint: 'videos',
    contentId: id,
  }).catch(() => null);

  if (!gallery) {
    notFound();
  }

  const t = gallery.type;
  const hasImages = !!gallery.images?.length || !!gallery.main_image;
  
  // 配列・オブジェクト・文字列の全パターンに対応
  const target = Array.isArray(t) ? t[0] : t;
  const typeId = typeof target === 'string' ? target : target?.id;
  const val = typeof target === 'string' ? target : target?.value;

  const isPhoto = typeId === '9pX1xNYa6K' || val === 'photo' || typeId === 'photo' || (!t && hasImages && !gallery.url);

  if (!isPhoto) {
    notFound();
  }

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      {/* ヘッダー */}
      <div className="bg-[#001f3f] text-white py-12 px-4 border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto">
          <Link href="/photos" className="text-red-600 text-[10px] font-black tracking-widest uppercase italic mb-4 inline-block hover:text-white transition-colors">
            ← Back to List
          </Link>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight">
            {gallery.title}
          </h1>
          <p className="text-slate-400 font-bold mt-2 italic">
            {gallery.date ? new Date(gallery.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </p>
        </div>
      </div>

      {/* ギャラリーグリッド (Masonry Layout) */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GalleryGrid images={gallery.images} title={gallery.title} />

        {/* フッターナビ */}
        <div className="mt-20 flex flex-col items-center gap-8">
          <div className="h-[1px] w-20 bg-red-600"></div>
          <div className="flex gap-10">
            <Link href="/photos" className="group flex items-center gap-2 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
              <span className="group-hover:-translate-x-2 transition-transform">←</span> Gallery List
            </Link>
            <Link href="/" className="group flex items-center gap-2 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
              Home <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
