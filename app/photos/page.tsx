// フォトギャラリー一覧ページ: 年度ごとに大会をリストアップします
import { client } from '@/lib/client';
import Link from 'next/link';

export const revalidate = 60;

export default async function PhotosListPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const sp = await searchParams;

  // フィルターを外して全件取得し、プログラム側で安全にフィルタリングします
  const res = await client.get({
    endpoint: 'videos',
    queries: { 
      limit: 100, 
      orders: '-date'
    }
  }).catch(() => ({ contents: [] }));

  // デバッグ用：ターミナルに取得データの種別を表示します
  // console.log('Fetched types:', res.contents.map((c: any) => ({ id: c.id, type: c.type })));

  // フィルタリングロジックの強化
  const allGalleries = res.contents.filter((g: any) => {
    const t = g.type;
    // 1. 種別が未設定の場合：写真リストまたはメイン画像があり、かつURL（動画）がないものを写真とみなす
    if (!t) return (!!g.images?.length || !!g.main_image) && !g.url;

    // 2. 種別が設定されている場合：配列、オブジェクト、文字列の全パターンに対応
    const target = Array.isArray(t) ? t[0] : t;
    const id = typeof target === 'string' ? target : target?.id;
    const val = typeof target === 'string' ? target : target?.value;

    return id === '9pX1xNYa6K' || val === 'photo' || id === 'photo';
  });

  // 1. 年度を抽出して重複を排除
  const allYears = Array.from(new Set(allGalleries.map((g: any) => {
    const m = g.date?.match(/\d{4}/);
    return m ? m[0] : null;
  }).filter(Boolean))).sort().reverse() as string[];

  // 2. 選択された年度（デフォルトは最新年）
  const selectedYear = sp.year || allYears[0] || new Date().getFullYear().toString();
  // 年度データがある場合のみフィルタリングし、ない場合は全件表示する
  const filteredGalleries = allYears.length > 0 
    ? allGalleries.filter((g: any) => g.date?.includes(selectedYear))
    : allGalleries;

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      {/* ヘッダーエリア */}
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 tracking-[0.3em] uppercase italic">Memory of Games</span>
            <div className="h-[1px] flex-1 bg-white/20"></div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            Photo <span className="text-red-600">Gallery</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* 年度切り替えタブ */}
        <div className="flex flex-wrap gap-2 mb-16 border-b border-slate-100 pb-8">
          {allYears.map(year => (
            <Link
              key={year}
              href={`/photos?year=${year}`}
              className={`px-8 py-3 text-sm font-black italic tracking-[0.2em] transition-all rounded-sm ${
                selectedYear === year 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-slate-100 text-[#001f3f] hover:bg-slate-200'
              }`}
            >
              {year}
            </Link>
          ))}
        </div>

        {/* ギャラリーリスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredGalleries.length > 0 ? (
            filteredGalleries.map((gallery: any) => (
              <Link 
                key={gallery.id} 
                href={`/photos/${gallery.id}`} 
                className="group block relative overflow-hidden bg-slate-900 aspect-[16/9]"
              >
                {gallery.main_image?.url ? (
                  <img 
                    src={gallery.main_image.url} 
                    alt={gallery.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold italic">NO IMAGE</div>
                )}
                
                {/* オーバーレイテキスト */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <p className="text-red-600 text-[10px] font-black tracking-widest uppercase italic mb-2">
                    {gallery.date ? new Date(gallery.date).toLocaleDateString('ja-JP').replace(/\//g, '.') : ''}
                  </p>
                  <h2 className="text-xl md:text-2xl font-black text-white italic uppercase leading-tight group-hover:text-red-500 transition-colors">
                    {gallery.title}
                  </h2>
                  <div className="mt-4 flex items-center gap-2 text-white/50 text-[9px] font-bold tracking-[0.3em] uppercase">
                    View Gallery <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
                
                {/* 装飾ライン */}
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-lg">
              {allGalleries.length === 0 ? (
                <p className="text-slate-300 font-black italic uppercase tracking-[0.3em]">No Gallery Data Registered in microCMS</p>
              ) : (
                <p className="text-slate-300 font-black italic uppercase tracking-[0.3em]">No Gallery Found for {selectedYear}</p>
              )}
            </div>
          )}
        </div>

        {/* 下部ナビゲーション */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex justify-center">
          <Link href="/" className="group inline-flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-[#001f3f] hover:text-red-600 transition-colors uppercase italic">
            <span className="group-hover:-translate-x-2 transition-transform">←</span> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
