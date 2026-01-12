import os
import glob
import pandas as pd
import pykakasi
import re
import sys

# ローマ字変換の準備
kks = pykakasi.kakasi()

# CSVファイルが保存されているフォルダのパス
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, '..', 'public', 'data'))

def generate_id(name):
    """名前からローマ字IDを自動生成する（例: @松浦 葵 -> matsuura-aoi）"""
    if pd.isna(name) or str(name).strip() == "":
        return "unknown"
    
    # 1. @や＠を除去し、空白（全角・タブ含む）を半角スペース1つに統一
    clean_name = re.sub(r'[@＠\s]+', ' ', str(name)).strip()
    
    # 2. ローマ字に変換
    result = kks.convert(clean_name)
    # 3. 各パーツを結合（姓名の間のスペースは維持される）
    converted = "".join([item['hepburn'].lower() for item in result])
    
    # 4. スペースをハイフンに変換し、連続するハイフンを1つにまとめる
    s = re.sub(r'[-\s]+', '-', converted).strip('-')
    return s

def update_csv_files(target_files=None):
    # 引数でファイルが指定されていればそれを使用、なければフォルダ内全件
    if target_files:
        csv_files = target_files
    else:
        csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    for file_path in csv_files:
        try:
            df = pd.read_csv(file_path)
            
            # player_id 列を作成
            new_ids = []
            for _, row in df.iterrows():
                # rankがPAR、または名前が空の場合は 'master' に設定
                if row.get('rank') == 'PAR' or pd.isna(row.get('name')) or str(row.get('name')).strip() == "":
                    new_ids.append('master')
                else:
                    new_ids.append(generate_id(row['name']))
            
            if 'player_id' in df.columns:
                print(f"更新中 (既存のIDをローマ字に変換): {os.path.basename(file_path)}")
                df['player_id'] = new_ids
            else:
                print(f"新規作成: {os.path.basename(file_path)}")
                df.insert(0, 'player_id', new_ids)

            # 上書き保存（float_format='%.0f' で .0 を消去）
            df.to_csv(file_path, index=False, encoding='utf-8-sig', float_format='%.0f')
            
        except Exception as e:
            print(f"エラー ({os.path.basename(file_path)}): {e}")

if __name__ == "__main__":
    # コマンドライン引数がある場合はそれをファイルパスとして扱う
    args = sys.argv[1:]
    if args:
        update_csv_files(args)
    else:
        update_csv_files()
        
    print("\nすべてのCSVファイルの更新が完了しました。")