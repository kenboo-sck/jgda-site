import { Metadata } from 'next';
import { client } from '@/lib/client';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '大会動画・ハイライト',
  description: 'JGDA主催ゴルフ大会の公式動画コンテンツ。日刊スポーツ・ゴルフチャンネル提供による試合ハイライト、優勝者インタビュー、プレー解説動画を年度別にご覧いただけます。YouTube公式チャンネルで最新動画を配信中。',
};

// キャッシュの設定（1分ごとに更新）
export const revalidate = 60;

export default async function VideosListPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const sp = await searchParams;

  // microCMSから動画データを取得
  const res = await client.get({
    endpoint: 'videos',
    queries: { limit: 100, orders: '-date' }
  }).catch(() => ({ contents: [] }));

  // フィルタリングロジックの改善
  const allVideos = res.contents.filter((v: any) => {
    // YouTube URLがないものは動画ではない
    if (!v.url) return false;

    const t = v.type;
    // 1. 種別が未設定の場合：URLがあれば動画とみなす（既に上でチェック済み）
    if (!t) return true;

    // 2. 種別が設定されている場合
    const target = Array.isArray(t) ? t[0] : t;
    const id = typeof target === 'string' ? target : target?.id;
    const val = typeof target === 'string' ? target : target?.value;

    // 明示的に photo (9pX1xNYa6K) でない限り、URLがあれば動画として扱う
    return id !== '9pX1xNYa6K' && val !== 'photo';
  });

  // 1. 年度を抽出して重複を排除
  const allYears = Array.from(new Set(allVideos.map((v: any) => {
    const m = v.date?.match(/\d{4}/);
    return m ? m[0] : null;
  }).filter(Boolean))).sort().reverse() as string[];

  // 2. 選択された年度（デフォルトは最新年）
  const selectedYear = sp.year || allYears[0] || new Date().getFullYear().toString();
  const filteredVideos = allYears.length > 0
    ? allVideos.filter((v: any) => v.date?.includes(selectedYear))
    : allVideos;

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">

      {/* ヘッダーエリア */}
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 tracking-[0.3em] uppercase italic">Official Channel</span>
            <div className="h-[1px] flex-1 bg-white/20"></div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-slate-400 uppercase">日刊スポーツ・ゴルフチャンネル</p>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
              Tournament <span className="text-red-600">Videos</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* 年度切り替えタブナビゲーション */}
        <div className="flex flex-wrap gap-2 mb-16 border-b border-slate-100 pb-8">
          {allYears.map(year => (
            <Link
              key={year}
              href={`/videos?year=${year}`}
              className={`relative px-8 py-3 text-sm font-black italic tracking-[0.2em] transition-all overflow-hidden group ${selectedYear === year
                ? 'text-white'
                : 'text-[#001f3f] hover:text-red-600'
                }`}
            >
              <span className="relative z-10">{year}</span>
              {selectedYear === year && (
                <div className="absolute inset-0 bg-red-600 skew-x-[-12deg] transform scale-110 shadow-lg"></div>
              )}
              <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-600 transition-transform duration-300 origin-left ${selectedYear === year ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></div>
            </Link>
          ))}
        </div>

        {/* 動画リストグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video: any) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                {/* サムネイルコンテナ */}
                <div className="relative aspect-video bg-slate-900 mb-5 overflow-hidden border border-slate-200 group-hover:border-[#001f3f] transition-all shadow-md group-hover:shadow-xl">
                  {video.image?.url ? (
                    <img
                      src={video.image.url}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold italic">NO IMAGE</div>
                  )}

                  {/* 再生アイコンオーバーレイ */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* テキスト情報 */}
                <p className="text-[10px] text-red-600 mb-2 font-black tracking-widest uppercase italic">
                  {video.date ? new Date(video.date).toLocaleDateString('ja-JP').replace(/\//g, '.') : ''}
                </p>
                <h2 className="text-lg font-black leading-tight text-[#001f3f] group-hover:text-red-600 transition-colors line-clamp-2 italic uppercase tracking-tight">
                  {video.title}
                </h2>
              </a>
            ))
          ) : (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 rounded-lg">
              <p className="text-slate-300 font-black italic uppercase tracking-[0.3em]">No Videos Found for {selectedYear}</p>
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