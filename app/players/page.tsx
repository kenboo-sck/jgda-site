import { client } from '@/lib/client';
import Link from 'next/link';

// キャッシュの設定（必要に応じて調整してください）
export const revalidate = 60; 

const REGION_MAP: { [key: string]: string[] } = {
  "北海道・東北エリア": ["北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島"],
  "関東甲信越エリア": ["茨城", "栃木", "群馬", "埼玉", "千葉", "東京", "神奈川", "山梨", "長野"],
  "中部・東海エリア": ["新潟", "富山", "石川", "福井", "岐阜", "静岡", "愛知", "三重"],
  "関西エリア": ["滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山"],
  "中国エリア": ["鳥取", "島根", "岡山", "広島", "山口"],
  "四国エリア": ["徳島", "香川", "愛媛", "高知"],
  "九州・沖縄エリア": ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"],
};

const KANA_ROWS = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];

function getKanaRow(kana: string) {
  const first = kana?.replace(/[\s　]/g, '')?.[0]; // 全角スペースも確実に除去
  if (!first) return "その他";
  if (/[あ-おア-オ]/.test(first)) return "あ";
  if (/[か-ごカ-ゴ]/.test(first)) return "か";
  if (/[さ-ぞサ-ゾ]/.test(first)) return "さ";
  if (/[た-どタ-ド]/.test(first)) return "た";
  if (/[な-のナ-ノ]/.test(first)) return "な";
  if (/[は-ぽハ-ポ]/.test(first)) return "は";
  if (/[ま-もマ-モ]/.test(first)) return "ま";
  if (/[や-よヤ-ヨ]/.test(first)) return "や";
  if (/[ら-ろラ-ロ]/.test(first)) return "ら";
  if (/[わ-んワ-ン]/.test(first)) return "わ";
  return "その他";
}

function getRegionGroup(birthPlace: string) {
  if (!birthPlace) return "海外";
  for (const [region, prefectures] of Object.entries(REGION_MAP)) {
    if (prefectures.some(pref => birthPlace.includes(pref))) {
      return region;
    }
  }
  return "海外";
}

const REGION_ORDER = ["北海道・東北エリア", "関東甲信越エリア", "中部・東海エリア", "関西エリア", "中国エリア", "四国エリア", "九州・沖縄エリア", "海外"];

export default async function PlayersListPage({ searchParams }: { searchParams: Promise<{ row?: string, area?: string }> }) {
  const { row, area } = await searchParams;
  
  // 全選手データを取得（100件を超える可能性を考慮してループで取得）
  const fetchAllPlayers = async () => {
    let allContents: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await client.get({
        endpoint: 'players',
        queries: { 
          limit: limit, 
          offset: offset, 
          orders: 'nameKana' 
        }
      });
      allContents = [...allContents, ...res.contents];
      if (res.contents.length < limit) break;
      offset += limit;
    }
    return allContents;
  };

  const allPlayers = await fetchAllPlayers().catch(() => []);

  // グループ化処理
  const groupedPlayers: { [key: string]: any[] } = {};

  if (area) {
    // エリアで検索（フィルタ）
    groupedPlayers[area] = allPlayers.filter(p => getRegionGroup(p.birthPlace || p.birth_place) === area);
  } else if (row) {
    // 行で検索（フィルタ）
    groupedPlayers[row] = allPlayers.filter(p => getKanaRow(p.nameKana || p.name_kana) === row);
  } else {
    // デフォルト：全選手を五十音順にグループ化
    KANA_ROWS.forEach(row => groupedPlayers[row] = []);
    groupedPlayers["その他"] = [];
    allPlayers.forEach(p => {
      const row = getKanaRow(p.nameKana || p.name_kana);
      groupedPlayers[row].push(p);
    });
  }

  const activeGroups = Object.keys(groupedPlayers).filter(key => groupedPlayers[key].length > 0);

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            PLAYERS
          </h1>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* 検索・フィルタセクション */}
        <div className="space-y-8 mb-16 bg-slate-50 p-6 md:p-8 rounded-sm border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-300"></span> Search by Name
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/players" className={`w-10 h-10 flex items-center justify-center border font-black text-xs transition-all rounded-sm ${!row && !area ? 'bg-[#001f3f] text-white border-[#001f3f]' : 'bg-white border-slate-200 text-[#001f3f] hover:border-[#001f3f]'}`}>
                ALL
              </Link>
              {KANA_ROWS.map(r => (
                <Link 
                  key={r} 
                  href={`/players?row=${r}`} 
                  className={`w-10 h-10 flex items-center justify-center border font-black text-xs transition-all rounded-sm ${row === r ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-200 text-[#001f3f] hover:border-[#001f3f]'}`}
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-300"></span> Search by Area
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_ORDER.map(r => (
                <Link 
                  key={r} 
                  href={`/players?area=${r}`} 
                  className={`px-4 h-10 flex items-center justify-center border font-black text-[10px] uppercase tracking-wider transition-all rounded-sm ${area === r ? 'bg-red-600 text-white border-red-600' : 'bg-white border-slate-200 text-[#001f3f] hover:border-[#001f3f]'}`}
                >
                  {r.replace("エリア", "")}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 選手リスト（グループ別） */}
        <div className="space-y-20">
          {activeGroups.map(group => (
            <section key={group} id={`group-${group}`} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black italic text-[#001f3f] uppercase tracking-tighter">
                  {group} <span className="text-red-600 ml-1">/</span>
                </h2>
                <div className="flex-1 h-[1px] bg-slate-200"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedPlayers[group].map((player: any) => (
                  <Link href={`/players/${player.id}`} key={player.id} className="group block bg-slate-50 border border-slate-200 hover:border-[#001f3f] transition-colors">
                    <div className="aspect-[3/4] bg-slate-200 relative overflow-hidden">
                       {player.image?.url ? (
                         <img src={player.image.url} alt={player.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic">NO IMAGE</div>
                       )}
                       {player.bio?.includes("プロテスト合格") && (
                         <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-2 py-1 italic tracking-tighter z-10">
                           PRO TEST PASSED
                         </div>
                       )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-black text-[#001f3f] italic uppercase leading-none mb-1 group-hover:text-red-600 transition-colors">{player.name}</h2>
                      {(player.nameKana || player.name_kana) && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {player.nameKana || player.name_kana}
                        </p>
                      )}
                      {player.affiliation && <p className="text-[11px] text-[#001f3f] font-bold mt-2 italic">{player.affiliation}</p>}
                      {(player.birthPlace || player.birth_place) && (
                        <p className="text-[9px] text-slate-400 mt-1 font-medium uppercase tracking-tighter">
                          From: {player.birthPlace || player.birth_place}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
