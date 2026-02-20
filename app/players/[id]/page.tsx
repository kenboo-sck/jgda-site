import { client } from '@/lib/client';
import { getCsvData } from '@/lib/csvParser';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await client.get({
    endpoint: 'players',
    contentId: id,
  }).catch(() => null);

  if (!player) return { title: 'Player Not Found' };

  return {
    title: `${player.name} プロフィール`,
    description: `${player.name} (${player.affiliation || 'JGDA'}) のプロフィール、戦績、動画をご覧いただけます。`,
    openGraph: {
      title: `${player.name} | JGDA 日本プロゴルフ選手育成協会`,
      images: player.image?.url ? [player.image.url] : [],
    },
  };
}

// キャッシュの設定（必要に応じて調整してください）
export const revalidate = 60;

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // microCMSから選手データを取得
  const player = await client.get({
    endpoint: 'players',
    contentId: id,
  }).catch(() => null);

  // デバッグ用：取得したデータをサーバーコンソールに表示
  console.log('Fetched Player Data:', player);

  // データが見つからない場合
  if (!player) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-400 mb-4 italic uppercase">Player Not Found</h1>
        <Link href="/" className="text-[#001f3f] font-bold hover:text-red-600 transition-colors border-b border-[#001f3f] hover:border-red-600">
          HOMEへ戻る
        </Link>
      </div>
    );
  }

  // 💡 microCMSのフィールドIDがスネークケース（birth_dateなど）の場合にも対応
  const birthDate = player.birthDate || player.birth_date;
  const birthPlace = player.birthPlace || player.birth_place;
  const bloodType = player.bloodType || player.blood_type;
  const almaMater = player.almaMater || player.alma_mater;
  const proTestJoined = player.proTestJoined || player.pro_test_joined;
  const nameKana = player.nameKana || player.name_kana;
  const affiliation = player.affiliation;
  const relatedVideos = player.relatedVideo || player.related_video;

  // 表示用にプロフィール項目を整理
  const profileItems = [
    { label: 'Affiliation', value: affiliation },
    { label: 'Birthday', value: birthDate ? new Date(birthDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
    { label: 'From', value: birthPlace },
    { label: 'Blood Type', value: bloodType },
    { label: 'Height', value: (player.height || player.weight) ? `${player.height ? player.height + 'cm' : ''} ${player.weight ? ' / ' + player.weight + 'kg' : ''}` : null },
    { label: 'School', value: almaMater },
    { label: 'Pro Test', value: proTestJoined ? new Date(proTestJoined).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
  ];

  // --- 選手の戦績をCSVから抽出 ---
  // 大会データも100件を超える可能性があるため、全件取得する
  const fetchAllTournaments = async () => {
    let allContents: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const res = await client.get({
        endpoint: 'tournament',
        queries: {
          limit: limit,
          offset: offset,
          orders: '-date'
        }
      });
      allContents = [...allContents, ...res.contents];
      if (res.contents.length < limit) break;
      offset += limit;
    }
    return allContents;
  };

  const tournamentsContents = await fetchAllTournaments().catch(() => []);

  const playerResults: any[] = [];
  // 統一された正規化ロジック
  const getMatchKey = (s: any) => {
    if (typeof s !== 'string') return "";
    return s.normalize('NFKC').replace(/[@＠]/g, '').replace(/[\s　\.\u00a0\t\r\n]+/g, "").toLowerCase().trim();
  };
  const normalizedPlayerName = getMatchKey(player.name);

  // 現在日時を取得（比較用）
  const now = new Date();

  for (const t of tournamentsContents) {
    // 日付のパースと未来判定
    let tournamentDate: Date | null = null;
    if (t.date) {
      // 1. 標準的なDateパースを試みる
      const d = new Date(t.date);
      if (!isNaN(d.getTime())) {
        tournamentDate = d;
      } else {
        // 2. 日本語形式 (例: 2026年4月17日) を試みる
        const match = t.date.toString().match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (match) {
          tournamentDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        }
      }
    }

    // デバッグログ: 日付判定の状況を確認
    // console.log(`Tournament: ${t.title}, DateStr: ${t.date}, Parsed: ${tournamentDate}, Future: ${tournamentDate ? tournamentDate > now : 'unknown'}`);

    // まだ開催されていない大会（未来の日付）はスキップ
    if (tournamentDate && tournamentDate > now) {
      continue;
    }

    const csvField = t.csv_name || t.tournament_id;
    if (!csvField) continue;

    const baseName = csvField.replace('.csv', '');
    const p2Path = path.join(process.cwd(), 'public', 'data', `${baseName}_2.csv`);
    const p1Path = path.join(process.cwd(), 'public', 'data', `${baseName}_1.csv`);
    const p1PathAlt = path.join(process.cwd(), 'public', 'data', `${baseName}.csv`); // 代替パス

    let finalRecord: any = null;
    let r1Record: any = null;
    let isTwoDay = false;

    try {
      // 1. 2日間大会の最終結果（_2.csv）を最優先で確認
      if (fs.existsSync(p2Path)) {
        isTwoDay = true;
        const d2 = getCsvData(`${baseName}_2.csv`);
        finalRecord = d2.find((r: any) => r.player_id === id || getMatchKey(r.name || "") === normalizedPlayerName);

        // 合計計算が必要な場合に備えて1Rも取得（両パターンを確認）
        if (fs.existsSync(p1Path)) {
          // パターン1: brillia2024_1.csv
          const d1 = getCsvData(`${baseName}_1.csv`);
          r1Record = d1.find((r: any) => r.player_id === id || getMatchKey(r.name || "") === normalizedPlayerName);
        } else if (fs.existsSync(p1PathAlt)) {
          // パターン2: brillia2024.csv（後方互換性のため）
          const d1 = getCsvData(`${baseName}.csv`);
          r1Record = d1.find((r: any) => r.player_id === id || getMatchKey(r.name || "") === normalizedPlayerName);
        }
      } else if (fs.existsSync(p1Path)) {
        // 2. 1日開催の大会（パターン1: xxx_1.csv）
        const d1 = getCsvData(`${baseName}_1.csv`);
        finalRecord = d1.find((r: any) => r.player_id === id || getMatchKey(r.name || "") === normalizedPlayerName);
      } else if (fs.existsSync(p1PathAlt)) {
        // 3. 1日開催の大会（パターン2: xxx.csv）
        const d1 = getCsvData(`${baseName}.csv`);
        finalRecord = d1.find((r: any) => r.player_id === id || getMatchKey(r.name || "") === normalizedPlayerName);
      }
    } catch (err) {
      continue;
    }

    if (finalRecord && finalRecord.rank !== 'PAR') {
      // 💡 修正: スコアとストローク数を分けて管理
      let displayScore = finalRecord.score || "-";
      if (displayScore !== '-' && displayScore !== '' && !isNaN(Number(displayScore))) {
        const s = Number(displayScore);
        if (s > 0) displayScore = `+${s}`;
        else if (s === 0) displayScore = 'E';
      }

      let totalStrokes = finalRecord.total || finalRecord.TOTAL || "-";  // ストローク数（68, 72など）
      let rank = finalRecord.rank || finalRecord.Rank || "-";  // 順位

      // 2日間大会の場合は1R+2Rを計算 + 順位を再計算
      if (isTwoDay && r1Record) {
        const v1 = parseInt(r1Record.total || r1Record.TOTAL || "0", 10);
        const v2 = parseInt(finalRecord.total || finalRecord.TOTAL || "0", 10);

        // デバッグログ（必要に応じてコメントアウト）
        console.log(`[${player.name}] ${t.title}:`);
        console.log(`  1R: ${v1}, 2R: ${v2}`);

        // 両方とも有効な数値の場合のみ計算
        if (!isNaN(v1) && !isNaN(v2) && v1 > 0 && v2 > 0) {
          const combinedTotal = v1 + v2;
          totalStrokes = combinedTotal.toString();

          // パーとの差を再計算（パー72×2日=144と仮定）
          const totalPar = 144; // 💡 必要に応じて動的に取得するように変更可能
          const diff = combinedTotal - totalPar;

          if (diff === 0) {
            displayScore = 'E';
          } else if (diff > 0) {
            displayScore = `+${diff}`;
          } else {
            displayScore = `${diff}`;
          }

          console.log(`  → 合計: ${totalStrokes}, スコア: ${displayScore}`);

          // 💡 順位の再計算: 全選手のデータを読み込んで並べ替え
          try {
            const d1 = getCsvData(`${baseName}_1.csv`) || getCsvData(`${baseName}.csv`);
            const d2 = getCsvData(`${baseName}_2.csv`);

            // 全選手の合計スコアを計算
            const allPlayersWithTotal = d2
              .filter((r: any) => r.rank !== 'PAR' && !['DNS', 'NR', 'DQ'].includes(r.rank))
              .map((r2: any) => {
                const r1: any = d1.find((r: any) =>
                  getMatchKey(r.name || "") === getMatchKey(r2.name || "")
                );

                if (r1) {
                  const t1 = parseInt(r1.total || r1.TOTAL || "0", 10);
                  const t2 = parseInt(r2.total || r2.TOTAL || "0", 10);

                  if (!isNaN(t1) && !isNaN(t2) && t1 > 0 && t2 > 0) {
                    return {
                      name: r2.name,
                      total: t1 + t2,
                      player_id: r2.player_id
                    };
                  }
                }
                return null;
              })
              .filter((p: any) => p !== null)
              .sort((a: any, b: any) => a.total - b.total); // スコア昇順でソート

            // この選手の順位を見つける
            const playerIndex = allPlayersWithTotal.findIndex((p: any) =>
              p.player_id === id || getMatchKey(p.name) === normalizedPlayerName
            );

            if (playerIndex !== -1) {
              // 同スコア判定（タイの処理）
              let finalRank = playerIndex + 1;

              // 前の選手と同じスコアかチェック
              if (playerIndex > 0 &&
                (allPlayersWithTotal[playerIndex] as any).total === (allPlayersWithTotal[playerIndex - 1] as any).total) {
                // 前の選手の順位を探す
                let sameScoreStartIndex = playerIndex - 1;
                while (sameScoreStartIndex > 0 &&
                  (allPlayersWithTotal[sameScoreStartIndex] as any).total === (allPlayersWithTotal[sameScoreStartIndex - 1] as any).total) {
                  sameScoreStartIndex--;
                }
                finalRank = sameScoreStartIndex + 1;
                rank = `T${finalRank}`;
              } else {
                rank = finalRank.toString();
              }

              console.log(`  → 最終順位: ${rank} (${allPlayersWithTotal.length}人中)`);
            }
          } catch (err) {
            console.log(`  → 順位計算エラー:`, err);
          }
        } else {
          console.log(`  → 計算スキップ (v1=${v1}, v2=${v2}が無効)`);
        }
      } else if (isTwoDay && !r1Record) {
        console.log(`[${player.name}] ${t.title}: 1日目のデータが見つかりません`);
      } else if (!isTwoDay) {
        // 💡 1日大会の場合も順位を再計算してタイ(T)を付与
        try {
          let csvData;
          if (fs.existsSync(p1Path)) {
            csvData = getCsvData(`${baseName}_1.csv`);
          } else if (fs.existsSync(p1PathAlt)) {
            csvData = getCsvData(`${baseName}.csv`);
          }

          if (csvData) {
            // 全選手のデータをスコア順にソート
            const allPlayers = csvData
              .filter((r: any) => r.rank !== 'PAR' && !['DNS', 'NR', 'DQ'].includes(r.rank))
              .map((r: any) => {
                const t = parseInt(r.total || r.TOTAL || "0", 10);
                return {
                  name: r.name,
                  total: t,
                  player_id: r.player_id
                };
              })
              .filter((p: any) => !isNaN(p.total) && p.total > 0)
              .sort((a: any, b: any) => a.total - b.total); // スコア昇順でソート

            // この選手の順位を見つける
            const playerIndex = allPlayers.findIndex((p: any) =>
              p.player_id === id || getMatchKey(p.name) === normalizedPlayerName
            );

            if (playerIndex !== -1) {
              let finalRank = playerIndex + 1;

              // 同スコア判定（タイの処理）
              if (playerIndex > 0 &&
                allPlayers[playerIndex].total === allPlayers[playerIndex - 1].total) {
                // 前の選手の順位を探す
                let sameScoreStartIndex = playerIndex - 1;
                while (sameScoreStartIndex > 0 &&
                  allPlayers[sameScoreStartIndex].total === allPlayers[sameScoreStartIndex - 1].total) {
                  sameScoreStartIndex--;
                }
                finalRank = sameScoreStartIndex + 1;
                rank = `T${finalRank}`;
              } else {
                // 次の選手と同じスコアかチェック
                if (playerIndex < allPlayers.length - 1 &&
                  allPlayers[playerIndex].total === allPlayers[playerIndex + 1].total) {
                  rank = `T${finalRank}`;
                } else {
                  rank = finalRank.toString();
                }
              }

              console.log(`[${player.name}] ${t.title}: 1日大会 順位=${rank}`);
            }
          }
        } catch (err) {
          console.log(`[${player.name}] ${t.title}: 1日大会の順位計算エラー`, err);
        }
      }

      playerResults.push({
        ...finalRecord,
        tournament: t,
        displayScore: displayScore,   // パーとの差
        displayRank: rank,             // 順位
        displayTotal: totalStrokes     // 合計ストローク数
      });
    }
  }

  return (
    <main className="bg-white min-h-screen pb-20 font-sans text-slate-900">

      {/* --- ヘッダーエリア --- */}
      <div className="bg-[#001f3f] text-white py-16 px-4 border-b-4 border-red-600">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-4 md:gap-8">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              {player.name}
            </h1>
            {nameKana && (
              <p className="text-slate-400 font-bold tracking-widest uppercase mb-1 text-sm md:text-base">
                {nameKana}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- コンテンツエリア --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white shadow-2xl border border-slate-200 p-6 md:p-12 flex flex-col md:flex-row gap-12">
          {/* 左カラム：画像 */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden border border-slate-200 shadow-inner">
              {player.image?.url ? (
                <img
                  src={`${player.image.url}?q=100&auto=format`}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: '-webkit-optimize-contrast' as any }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic bg-slate-50">NO IMAGE</div>
              )}
            </div>
          </div>

          {/* 右カラム：詳細情報 */}
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-black text-[#001f3f] italic uppercase tracking-widest mb-8 border-b-2 border-slate-100 pb-2 inline-block">
              Profile Data
            </h2>

            <dl className="grid grid-cols-1 gap-y-5 mb-12">
              {profileItems.map((item, index) => (
                item.value && (
                  <div key={index} className="flex flex-col sm:flex-row border-b border-slate-100 pb-3 group hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-sm">
                    <dt className="w-40 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-1">{item.label}</dt>
                    <dd className="flex-1 font-bold text-[#001f3f] text-sm md:text-base">{item.value}</dd>
                  </div>
                )
              ))}
            </dl>

            {player.bio && player.bio !== '<p><br></p>' && (
              <div className="mb-10 bg-slate-50 p-6 md:p-8 rounded-sm border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Biography</h3>
                <div
                  className="prose prose-sm max-w-none text-slate-600 leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: player.bio }}
                />
              </div>
            )}

            {/* --- Related Videos --- */}
            {relatedVideos && relatedVideos.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-black text-[#001f3f] italic uppercase tracking-widest mb-6 border-b-2 border-slate-100 pb-2 inline-block">
                  Related Videos
                </h2>
                <div className="flex flex-wrap gap-3">
                  {relatedVideos.map((video: any, idx: number) => (
                    <a
                      key={video.id || idx}
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-sm font-black italic uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-xl group text-[10px] md:text-xs"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span className="max-w-[200px] truncate">{video.title || `Watch Video ${idx + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* --- Tournament Results --- */}
            {playerResults.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-black text-[#001f3f] italic uppercase tracking-widest mb-6 border-b-2 border-slate-100 pb-2 inline-block">
                  Tournament Results
                </h2>

                {/* Mobile View (Stacked List) */}
                <div className="md:hidden space-y-4">
                  {playerResults.map((res, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-sm p-4 bg-white shadow-sm transition-all hover:border-red-600/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-400 font-bold text-[10px] italic leading-none">{res.tournament.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-slate-300 italic uppercase">Pos</span>
                          <span className="font-black italic text-[#001f3f] text-sm leading-none">{res.displayRank}</span>
                        </div>
                      </div>
                      <Link href={`/results/${res.tournament.tournament_id}`} className="block font-black text-[#001f3f] hover:text-red-600 transition-colors italic uppercase text-base mb-4 leading-tight">
                        {res.tournament.title}
                      </Link>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                          <span className="font-black italic text-red-600 text-2xl leading-none mt-1.5">{res.displayScore}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Strokes</span>
                          <span className="font-bold text-slate-600 text-base mt-2 leading-none font-mono">{res.displayTotal}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View (Traditional Table) */}
                <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-sm">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[#001f3f] font-black italic uppercase text-[10px] tracking-widest">
                        <th className="p-4 border-b border-slate-200">Date</th>
                        <th className="p-4 border-b border-slate-200">Tournament</th>
                        <th className="p-4 border-b border-slate-200 text-center">Pos</th>
                        <th className="p-4 border-b border-slate-200 text-center">Score</th>
                        <th className="p-4 border-b border-slate-200 text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerResults.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                          <td className="p-4 text-slate-400 font-bold text-[10px] italic">{res.tournament.date}</td>
                          <td className="p-4">
                            <Link href={`/results/${res.tournament.tournament_id}`} className="font-black text-[#001f3f] hover:text-red-600 transition-colors italic uppercase text-sm">
                              {res.tournament.title}
                            </Link>
                          </td>
                          <td className="p-4 text-center font-black italic text-[#001f3f]">{res.displayRank}</td>
                          <td className="p-4 text-center font-black italic text-red-600 text-lg">{res.displayScore}</td>
                          <td className="p-4 text-center font-bold text-slate-600">{res.displayTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-6">
              <Link href="/players" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Player List
              </Link>
              <Link href="/" className="group inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-[#001f3f] hover:text-red-600 transition-colors uppercase">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}