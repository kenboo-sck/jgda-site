import { client } from '@/lib/client';
import { getCsvData } from '@/lib/csvParser';
import fs from 'fs';
import path from 'path';
import ResultDisplay from '../ResultDisplay';

export default async function Page({ params }: any) {
  // Promiseを解決（Next.js 15対応）
  const p = await params;
  const id = p.id;

  const res = await client.get({
    endpoint: 'tournament',
    queries: { filters: `tournament_id[equals]${id}` }
  });

  if (!res.contents.length) return <div>Not Found</div>;

  const info = res.contents[0];

  // 💡 microCMSの csv_name があればそれを使い、なければIDを使う
  // 例: csv_name="test.csv" -> baseName="test"
  const csvField = info.csv_name || id;
  const baseName = csvField.replace('.csv', '');

  // 1. 通常のファイル読み込み
  const mainPath = path.join(process.cwd(), 'public', 'data', `${baseName}.csv`);
  const mainData = fs.existsSync(mainPath) ? getCsvData(`${baseName}.csv`) : [];

  // 2. ラウンドごとのファイルがあるか確認して読み込み
  const p1 = path.join(process.cwd(), 'public', 'data', `${baseName}_1.csv`);
  const p2 = path.join(process.cwd(), 'public', 'data', `${baseName}_2.csv`);
  const rd1 = fs.existsSync(p1) ? getCsvData(`${baseName}_1.csv`) : [];
  const rd2 = fs.existsSync(p2) ? getCsvData(`${baseName}_2.csv`) : [];

  // 💡 _2.csv（最終結果）がある場合は、それを最優先で表示データとして採用する
  // （これでベースファイルが古いままでも、_2さえアップすれば最新になります）
  const finalData = (rd2 && rd2.length > 0) ? rd2 : mainData;

  // 💡 選手データを全件取得（microCMSのlimit 100制限に対応するため、offsetをずらしながらループで取得）
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
          fields: 'id,name,affiliation,image'
        }
      });
      allContents = [...allContents, ...res.contents];

      // 取得した件数が limit (100) 未満なら、もう次のデータはないので終了
      if (res.contents.length < limit) break;

      // 次の100件を取得するためにoffsetを増やす
      offset += limit;
    }
    return allContents;
  };

  const playersContents = await fetchAllPlayers().catch((err) => {
    console.error("Failed to fetch players for mapping:", err);
    return [];
  });

  const playerInfoMap: Record<string, { id: string, affiliation?: string, imageUrl?: string }> = {};
  playersContents.forEach((p: any) => {
    if (p.name) {
      // 照合用キーの作成：NFKC正規化（全角半角の統一）、＠、スペース、ドット、特殊空白を除去し、小文字化
      const key = p.name.normalize('NFKC').replace(/[@＠]/g, '').replace(/[\s　\.\u00a0\t\r\n]+/g, "").toLowerCase().trim();
      playerInfoMap[key] = { id: p.id, affiliation: p.affiliation, imageUrl: p.image?.url };
    }
  });

  return <ResultDisplay info={info} playerResults={finalData} rd1={rd1} rd2={rd2} playerInfoMap={playerInfoMap} />;
}