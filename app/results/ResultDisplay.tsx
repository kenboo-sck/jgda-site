'use client';
import React from 'react';
import Link from 'next/link';

export default function ResultDisplay({ info, parRow: originalParRow, playerResults = [], rd1 = [], rd2 = [], playerInfoMap = {} }: any) {
  
  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 animate-pulse font-bold tracking-widest uppercase italic">Loading Tournament Data...</p>
      </div>
    );
  }

  // 💡 2日間大会のIDをここで指定します（複数ある場合は配列で .includes() などを使用）
  // rd1とrd2の両方がある場合は、自動的に2日間大会モードとみなします
  const hasRoundData = rd1.length > 0 && rd2.length > 0;
  const isTwoDay = info?.tournament_id === 'brillia2024' || hasRoundData;

  // 💡 CSVの行から名前を取得するヘルパー（列名の揺れに幅広く対応）
  const getNameFromRow = (row: any) => {
    if (!row) return "";
    return (row.name || row.Name || row['選手名'] || row['氏名'] || row.player || row.Player || "").toString();
  };

  // 💡 名前照合用の正規化関数（NFKC正規化、＠、スペース、ドット、特殊空白を除去し小文字化）
  const getMatchKey = (s: any) => {
    if (typeof s !== 'string') return "";
    return s.normalize('NFKC').replace(/[@＠]/g, '').replace(/[\s　\.\u00a0\t\r\n]+/g, "").toLowerCase().trim();
  };

  const par = originalParRow || (playerResults && playerResults.find((r:any) => r.rank === 'PAR')) || (playerResults && playerResults.length > 0 ? playerResults[0] : null); 

  // 💡 ホールバイホールデータがあるかチェック（h1, H1, または 1 というキーが存在するか）
  const hasHoleByHole = !!(par && (par.h1 || par.H1 || par['1']));

  const getScoreSymbol = (scoreVal: any, parVal: any) => {
    const s = parseInt(String(scoreVal || "").trim(), 10);
    const p = parseInt(String(parVal || "").trim(), 10);
    if (!s || !p) return "";
    
    const diff = s - p;
    if (diff <= -2) return "◎";
    if (diff === -1) return "○";
    if (diff === 0) return "－";
    if (diff === 1) return "△";
    if (diff === 2) return "□";
    if (diff >= 3) return `+${diff}`;
    
    return "";
  };

  const findLogoUrl = (item: any): string | null => {
    if (!item) return null;
    return item.logo?.url || item.url || null;
  };

  const renderSafe = (val: any) => {
    if (typeof val === 'object' && val !== null) return "";
    return val;
  };

  // 💡 ホールスコアの合計を計算する関数（2日間大会用）
  const sumHoles = (row: any, start: number, end: number) => {
    let sum = 0;
    for (let i = start; i <= end; i++) {
      // h1, H1, または単なる数字の 1 などを許容するように修正
      const val = parseInt(row[`h${i}`] || row[`H${i}`] || row[`${i}`] || '0', 10);
      if (!isNaN(val)) sum += val;
    }
    return sum > 0 ? sum : '-';
  };

  // 💡 プレイヤーデータの加工と並び替え（ランキング生成）
  let players = playerResults ? playerResults.filter((r:any) => r && r.rank !== 'PAR') : [];

  if (hasRoundData) {
    players = players.map((row: any) => {
      let r2Score = row.total || row.TOTAL || row.Total || row.in; // 2Rの合計ストローク
      let r1Score = row.out || row.OUT; // 初期値
      let displayTotal = r2Score; 
      let sortValue = 99999; // ソート用の数値（大きいほど下位）
      let displayScore = row.score;

      // row は rd2 (2日目) のデータ

      const r1Data = rd1.find((p:any) => getMatchKey(p.name) === getMatchKey(row.name));
      if (r1Data) {
        r1Score = r1Data.total;
        const v1 = parseInt(r1Score, 10);
        const v2 = parseInt(r2Score, 10);
        if (!isNaN(v1) && !isNaN(v2)) {
          displayTotal = v1 + v2;
          sortValue = displayTotal;
        }
      }
      
      // DNS, NR, DQ は一番下に表示
      if (['DNS', 'NR', 'DQ'].includes(row.rank)) {
          sortValue = 999999;
      }

      // スコア（パーとの差）の再計算
      // 例: Total 140, Par 144 (72*2) -> -4
      if (par && par.total && sortValue < 9000) {
          const pTotal = parseInt(par.total, 10);
          if (!isNaN(pTotal)) {
              const totalPar = pTotal * 2; // 2日間なのでパーを2倍と仮定
              const diff = sortValue - totalPar;
              if (diff === 0) displayScore = 'E';
              else if (diff > 0) displayScore = `+${diff}`;
              else displayScore = `${diff}`;
          }
      }

      return {
        ...row,
        r1Score,
        r2Score,
        displayTotal,
        displayScore,
        sortValue
      };
    });

    // トータルスコア順（昇順）に並び替え
    players.sort((a: any, b: any) => a.sortValue - b.sortValue);

    // 💡 順位（Pos）を再計算して割り当て
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      // 特殊ランク（DNS, NR, DQ）は計算対象外（元のランクを表示）
      if (['DNS', 'NR', 'DQ'].includes(p.rank)) {
        p.displayRank = p.rank;
        continue;
      }

      // 同スコア判定（前の人と同じスコアか？）
      // ※前の人が特殊ランクの場合は比較しない
      if (i > 0 && p.sortValue === players[i - 1].sortValue && !['DNS', 'NR', 'DQ'].includes(players[i - 1].rank)) {
        p.displayRank = players[i - 1].displayRank;
        
        // タイ（T）表記の追加
        const prevRankStr = String(players[i - 1].displayRank);
        if (!prevRankStr.startsWith('T')) {
          players[i - 1].displayRank = 'T' + prevRankStr;
        }
        const currRankStr = String(p.displayRank);
        if (!currRankStr.startsWith('T')) {
          p.displayRank = 'T' + currRankStr;
        }
      } else {
        // 新しい順位 = 現在のインデックス + 1
        p.displayRank = i + 1;
      }
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 overflow-x-hidden text-left">
      
      {/* --- ヒーローセクション --- */}
      <section className="relative w-full bg-[#003366] overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row min-h-[450px] md:min-h-[550px]">
          
          <div className="w-full md:w-[45%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#003366] text-white z-20 relative py-16 md:py-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 tracking-[0.3em] uppercase italic">Official Result</span>
              <div className="h-[1px] flex-1 bg-white/20"></div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-8 uppercase tracking-tighter italic">
              {renderSafe(info.title)}
            </h1>
            
            <div className="space-y-3 font-bold text-white/50 tracking-[0.2em] uppercase text-xs italic">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-red-600"></span>
                <p>{renderSafe(info.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-white/20"></span>
                <p>{renderSafe(info.venue)}</p>
              </div>
            </div>

            {/* 関連動画へのリンクボタン */}
            {info.related_video && info.related_video.length > 0 && (
              <div className="mt-8 md:mt-12 flex flex-wrap gap-2 md:gap-3">
                {info.related_video.map((video: any, idx: number) => (
                  <a 
                    key={video.id || idx}
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 md:gap-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-sm font-black italic uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-xl group text-[9px] md:text-[11px] leading-tight"
                  >
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="max-w-[160px] md:max-w-[220px] truncate">{video.title || `Watch Video ${idx + 1}`}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-[55%] relative h-[300px] md:h-auto">
            {info.image?.url && (
              <img 
                src={info.image.url} 
                alt="" 
                className="w-full h-full object-cover" 
              />
            )}
            <div className="absolute inset-y-0 -left-1 w-32 bg-gradient-to-r from-[#003366] to-transparent hidden md:block"></div>
            <div className="absolute inset-0 bg-[#003366]/10"></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
        
        {/* --- 特定の大会だけのバナーエリア --- */}
        {/* 💡 ここにバナーを表示したい大会のID（tournament_id）を指定してください */}
        {info?.tournament_id === 'tsuruya2024' && (
          <div className="mb-16 flex justify-center">
            <a href="https://www.tsuruyagolf.co.jp/nextgenerationgolfer/" target="_blank" rel="noopener noreferrer" className="block w-full max-w-4xl hover:opacity-95 transition-opacity">
              <img src="/images/tsuruya_header_logo.svg" alt="Special Banner" className="w-full h-auto rounded-sm" />
            </a>
          </div>
        )}

        {/* --- FINAL RESULT --- */}
        <section className="mb-20">
          {players.length > 0 ? (
            <>
          <div className="flex items-end justify-between mb-8 border-b-2 border-[#003366] pb-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-[#003366]">Final Result</h2>
          </div>
          <div className="relative overflow-x-auto border border-slate-400 shadow-xl rounded-sm">
            <table className="w-full text-[13px] border-collapse bg-white min-w-[700px]">
              <thead>
                <tr className="bg-[#003366] text-white text-center font-bold uppercase text-[10px] tracking-widest">
                  <th className="py-5 w-10 md:w-16 sticky left-0 z-20 bg-[#003366] italic border-r border-white/10">Pos</th>
                  {/* Playerカラム幅をモバイルで w-28(112px) 程度に設定 */}
                  <th className="py-5 px-3 md:px-8 text-left sticky left-10 md:left-16 z-20 bg-[#003366] border-r border-white/10 shadow-lg w-28 md:w-auto">Player</th>
                  <th className="py-5 w-20 md:w-24 opacity-70 border-r border-white/10">{isTwoDay ? "1R" : "Out"}</th>
                  <th className="py-5 w-20 md:w-24 opacity-70 border-r border-white/10">{isTwoDay ? "2R" : "In"}</th>
                  <th className="py-5 w-20 md:w-24 italic font-bold border-r border-white/10">Total</th>
                  <th className="py-5 w-24 md:w-28 bg-black text-red-500 font-black uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="text-center font-medium">
                {players.length > 0 && (
                  players.map((row: any, index: number) => {
                    const isNR = row.rank === 'NR';
                    const isDNS = row.rank === 'DNS';
                    const nameStr = getNameFromRow(row);
                    const isAmateur = nameStr.includes('@') || nameStr.includes('＠');
                    
                    // 照合用キーの作成
                    const matchKey = getMatchKey(nameStr);
                    const pInfo = playerInfoMap[matchKey];
                    const pid = pInfo?.id;
                    const pAffiliation = pInfo?.affiliation;

                    // 事前計算済みの値を使用（なければ元の値）
                    const r1Score = row.r1Score || row.out;
                    const r2Score = row.r2Score || (isTwoDay ? (row.total || row.TOTAL || row.Total || row.in) : row.in);
                    const displayTotal = row.displayTotal || row.total;
                    let displayScore = row.displayScore || row.score;

                    if (displayScore !== undefined && displayScore !== null && displayScore !== '-' && displayScore !== '' && !isNaN(Number(displayScore))) {
                      const s = Number(displayScore);
                      if (s > 0) displayScore = `+${s}`;
                      else if (s === 0) displayScore = 'E';
                    }

                    return (
                      <tr key={index} className="border-b border-slate-400 hover:bg-slate-50 transition-colors">
                        <td className="py-5 text-slate-700 font-black italic sticky left-0 z-10 bg-white border-r border-slate-400">{renderSafe(row.displayRank || row.rank)}</td>
                        <td className="py-5 px-3 md:px-8 text-left sticky left-10 md:left-16 z-10 bg-white border-r border-slate-400 text-[#003366] font-black whitespace-normal break-words">
                          {/* 省略(truncate)を廃止し、折り返し(break-words)を許可 */}
                          <div className="flex flex-wrap items-center gap-1">
                            {pid ? (
                              <Link href={`/players/${pid}`} className="hover:text-red-600 hover:underline transition-colors">
                                {renderSafe(nameStr.replace(/[@＠]/g, '').trim())}
                              </Link>
                            ) : (
                              <span>{renderSafe(nameStr.replace(/[@＠]/g, '').trim())}</span>
                            )}
                            {pAffiliation && (
                              <span className="text-[10px] text-slate-400 ml-1">({pAffiliation})</span>
                            )}
                            {isAmateur && (
                              <span className="text-[8px] md:text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 font-black leading-none italic flex-shrink-0">AM</span>
                            )}
                          </div>
                        </td>
                        {isNR || isDNS ? (
                          <td colSpan={4} className="py-5 text-center text-slate-300 font-bold tracking-[1em] bg-slate-50/50 italic border-r border-slate-400">{isNR ? "NO RETURN" : "DID NOT START"}</td>
                        ) : (
                          <>
                            <td className="py-5 text-slate-600 border-r border-slate-200">{renderSafe(r1Score)}</td>
                            <td className="py-5 text-slate-600 border-r border-slate-200">{renderSafe(r2Score)}</td>
                            <td className="py-5 text-[#003366] italic font-black text-base border-r border-slate-200">{renderSafe(displayTotal)}</td>
                            <td className="py-5 text-red-600 bg-red-50/10 text-xl italic font-black tracking-tighter">{renderSafe(displayScore)}</td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
            </>
          ) : (
            <div className="py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm">
              <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-slate-400 font-black italic uppercase tracking-[0.2em]">Detailed results are not available for this tournament.</p>
              <p className="text-slate-300 text-[10px] font-bold uppercase mt-2">この大会のスコアデータは登録されていません</p>
            </div>
          )}
        </section>

        {/* --- HOLE BY HOLE --- */}
        {hasHoleByHole && (
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black italic tracking-tight uppercase text-[#003366]">Hole by Hole</h2>
            <div className="h-[1px] flex-1 bg-slate-300"></div>
          </div>
          <div className="relative overflow-x-auto shadow-xl border border-slate-400 rounded-sm">
            <table className="w-full text-[11px] border-collapse bg-white min-w-[1000px]">
              <thead>
                <tr className="bg-[#003366] text-white text-center font-bold italic tracking-widest text-[9px] uppercase">
                  <th className="sticky left-0 z-20 bg-[#003366] border-r border-white/10 p-4 w-10 md:w-14 text-center" rowSpan={2}>Pos</th>
                  <th className="sticky left-10 md:left-14 z-20 bg-[#003366] border-r border-white/10 p-4 w-28 md:w-48 px-3 md:px-6 text-left font-bold" rowSpan={2}>Player</th>
                  {isTwoDay && <th className="sticky z-20 bg-[#003366] border-r border-white/10 p-4 w-12 text-center font-bold italic" rowSpan={2}>R</th>}
                  <th colSpan={10} className="py-3 bg-black/20 border-b border-white/5 tracking-[0.4em]">Front Nine</th>
                  <th colSpan={10} className="py-3 bg-black/20 border-b border-white/5 tracking-[0.4em]">Back Nine</th>
                  <th rowSpan={2} className="sticky right-0 z-20 bg-black text-white py-2 w-14 md:w-16 italic font-bold text-center border-l border-white/10">Total</th>
                </tr>
                <tr className="bg-[#003366] text-white/40 text-[9px] font-bold uppercase tracking-widest text-center">
                  {[...Array(9)].map((_, i) => (
                    <th key={i} className="border-r border-white/5 w-8 py-2 font-mono">{i+1}</th>
                  ))}
                  <th className="bg-black/40 w-10 text-white font-black italic border-r border-white/5 text-center">Out</th>
                  {[...Array(9)].map((_, i) => (
                    <th key={i+9} className="border-r border-white/5 w-8 py-2 font-mono">{i+10}</th>
                  ))}
                  <th className="bg-black/40 w-10 text-white font-black italic border-r border-white/5 text-center">In</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {/* PAR行 */}
                <tr className="bg-slate-100 text-slate-800 text-[10px] border-b border-slate-400 italic font-black">
                  <td className="sticky left-0 z-10 bg-slate-100 border-r border-slate-300 p-4" colSpan={2}>COURSE PAR</td>
                  {isTwoDay && <td className="bg-slate-200 text-[#003366] border-r border-slate-300">-</td>}
                  {[...Array(9)].map((_, i) => <td key={i} className="border-r border-slate-300">{renderSafe(par?.[`h${i+1}`] || par?.[`H${i+1}`])}</td>)}
                  <td className="bg-slate-200 text-[#003366] border-r border-slate-300">{renderSafe(par?.out || par?.OUT)}</td>
                  {[...Array(9)].map((_, i) => <td key={i+9} className="border-r border-slate-300">{renderSafe(par?.[`h${i+10}`] || par?.[`H${i+10}`])}</td>)}
                  <td className="bg-slate-200 text-[#003366] border-r border-slate-300">{renderSafe(par?.in || par?.IN)}</td>
                  <td className="sticky right-0 z-10 bg-slate-300 text-[#003366] border-l border-slate-400 font-mono text-[12px] font-black">{renderSafe(par?.total || par?.TOTAL)}</td>
                </tr>
                {/* プレイヤー行 */}
                {players.length > 0 && 
                  players.map((row: any, index: number) => {
                    const nameStr = getNameFromRow(row);
                    const isNR = row.rank === 'NR';
                    const isDNS = row.rank === 'DNS';
                    const isAmateur = nameStr.includes('@') || nameStr.includes('＠');

                    // 2つのラウンドデータを取得
                    const rounds = [];
                    if (hasRoundData) {
                      const rowMatchKey = getMatchKey(nameStr);
                      const r1 = rd1.find((p:any) => getMatchKey(getNameFromRow(p)) === rowMatchKey);
                      const r2 = rd2.find((p:any) => getMatchKey(getNameFromRow(p)) === rowMatchKey);
                      if (r1) rounds.push({ ...r1, label: '1R' });
                      if (r2) rounds.push({ ...r2, label: '2R' });
                    } else {
                      // 通常（1日のみ）
                      rounds.push({ ...row, label: '-' });
                    }
                    
                    return rounds.map((rData, rIndex) => (
                      <tr key={`${index}-${rIndex}`} className={`hover:bg-slate-50 border-b ${rIndex === rounds.length - 1 ? 'border-slate-400' : 'border-slate-200'}`}>
                        {/* PosとPlayerは最初の行だけ結合して表示、または各行で表示 */}
                        {rIndex === 0 && (
                          <>
                        <td className="sticky left-0 z-10 bg-white border-r border-slate-300 p-5 italic text-slate-700 font-black text-center" rowSpan={rounds.length}>{renderSafe(row.displayRank || row.rank)}</td>
                        <td className="sticky left-10 md:left-14 z-10 bg-white border-r border-slate-300 p-5 text-left px-3 md:px-6 text-[#003366] font-black whitespace-normal break-words" rowSpan={rounds.length}>
                          {/* 省略せず、幅が足りない場合は折り返し */}
                          <div className="flex flex-wrap items-center gap-1">
                            {(() => {
                              const matchKey = getMatchKey(nameStr);
                              const pInfo = playerInfoMap[matchKey];
                              const cleanName = nameStr.replace(/[@＠]/g, '').trim();
                              return pInfo?.id ? (
                                <Link href={`/players/${pInfo.id}`} className="hover:text-red-600 hover:underline transition-colors">
                                  {renderSafe(cleanName)}
                                </Link>
                              ) : (
                                <span>{renderSafe(cleanName)}</span>
                              );
                            })()}
                            {playerInfoMap[getMatchKey(nameStr)]?.affiliation && (
                              <span className="text-[10px] text-slate-400 ml-1">({playerInfoMap[getMatchKey(nameStr)].affiliation})</span>
                            )}
                            {isAmateur && (
                              <span className="text-[8px] md:text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 font-black leading-none italic flex-shrink-0">AM</span>
                            )}
                          </div>
                        </td>
                          </>
                        )}
                        
                        {isNR || isDNS ? (
                          <td colSpan={isTwoDay ? 22 : 21} className="py-5 text-center text-slate-300 font-bold tracking-[3em] bg-slate-50/20 whitespace-nowrap text-center text-xs">{isNR ? "NO RETURN" : "DID NOT START"}</td>
                        ) : (
                          <>
                            {isTwoDay && <td className="bg-slate-50 text-slate-600 border-r border-slate-200 font-black font-mono text-center italic">{rData.label}</td>}
                            {[...Array(9)].map((_, i) => {
                              const s = rData[`h${i+1}`] || rData[`H${i+1}`] || rData[`${i+1}`];
                              const p = par?.[`h${i+1}`] || par?.[`H${i+1}`] || par?.[`${i+1}`];
                              const symbol = getScoreSymbol(s, p);
                              return (
                                <td key={i} className="border-r border-slate-200 p-1">
                                  <div className="flex flex-col items-center justify-center min-h-[52px] leading-tight text-center">
                                    <span className={`text-[14px] font-mono font-bold ${symbol === "○" || symbol === "◎" ? 'text-red-600' : 'text-slate-800'}`}>{renderSafe(s)}</span>
                                    <span className="text-[11px] text-slate-400 font-black mt-1 h-[14px] flex items-center justify-center">{renderSafe(symbol)}</span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="bg-slate-50 text-[#003366] border-r border-slate-200 font-black font-mono text-center">{renderSafe(rData.out)}</td>
                            {[...Array(9)].map((_, i) => {
                              const s = rData[`h${i+10}`] || rData[`H${i+10}`] || rData[`${i+10}`];
                              const p = par?.[`h${i+10}`] || par?.[`H${i+10}`] || par?.[`${i+10}`];
                              const symbol = getScoreSymbol(s, p);
                              return (
                                <td key={i+9} className="border-r border-slate-200 p-1 text-center">
                                  <div className="flex flex-col items-center justify-center min-h-[52px] leading-tight text-center">
                                    <span className={`text-[14px] font-mono font-bold ${symbol === "○" || symbol === "◎" ? 'text-red-600' : 'text-slate-800'}`}>{renderSafe(s)}</span>
                                    <span className="text-[11px] text-slate-400 font-black mt-1 h-[14px] flex items-center justify-center">{renderSafe(symbol)}</span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="bg-slate-50 text-[#003366] border-r border-slate-200 font-black font-mono text-center">{renderSafe(rData.in)}</td>
                            <td className="sticky right-0 z-10 bg-white border-l border-slate-300 text-[#003366] font-black italic font-mono text-center">{renderSafe(rData.total)}</td>
                          </>
                        )}
                      </tr>
                    ));
                  })
                }
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* --- 記号凡例 --- */}
        {hasHoleByHole && (
        <div className="py-12 text-center">
          <div className="inline-flex flex-wrap gap-x-10 gap-y-4 justify-center items-center px-10 py-5 bg-slate-50 border-2 border-slate-200 rounded-full text-[12px] font-black tracking-[0.1em] text-slate-600 uppercase italic shadow-inner">
            <span className="flex items-center gap-3"><span className="text-red-500 text-sm">◎</span> EAGLE</span>
            <span className="flex items-center gap-3"><span className="text-red-500 text-sm">○</span> BIRDIE</span>
            <span className="flex items-center gap-3 text-slate-400 text-sm">－ PAR</span>
            <span className="flex items-center gap-3 text-slate-800 text-sm">△ BOGEY</span>
            <span className="flex items-center gap-3 text-slate-800 text-sm">□ DOUBLE BOGEY</span>
          </div>
        </div>
        )}

        {/* --- スポンサー --- */}
        {info.sponsors && info.sponsors.length > 0 && (
          <section className="mt-10 mb-20 border-t-2 border-slate-200 pt-16 text-center">
            <h3 className="text-[13px] font-black text-[#003366] tracking-[0.8em] uppercase italic mb-16">TOURNAMENT SPONSOR</h3>
            <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-20 max-w-6xl mx-auto px-4">
              {info.sponsors.map((item: any, index: number) => {
                const src = findLogoUrl(item);
                if (!src) return null;
                return (
                  <a key={index} href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="group relative w-48 md:w-64 flex items-center justify-center transition-all duration-500 transform hover:scale-110">
                    <img src={src} alt="" className="w-full h-auto object-contain max-h-32" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* --- 協賛 (CO-SPONSOR) --- */}
        {/* 💡 microCMSに 'cosponsors' というフィールドを追加してください */}
        {info.cosponsors && info.cosponsors.length > 0 && (
          <section className="mt-10 mb-20 border-t-2 border-slate-200 pt-16 text-center">
            <h3 className="text-[13px] font-black text-[#003366] tracking-[0.8em] uppercase italic mb-10">CO-SPONSOR</h3>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 max-w-4xl mx-auto px-4">
              {info.cosponsors.map((item: any, index: number) => {
                return (
                  <a key={index} href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-bold text-slate-500 hover:text-[#003366] transition-colors tracking-wider border-b border-transparent hover:border-[#003366] pb-0.5">
                    {item.name || item.title || "Sponsor"}
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}