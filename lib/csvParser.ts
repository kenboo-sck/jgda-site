import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export function getCsvData(fileName: string) {
  const filePath = path.join(process.cwd(), 'public/data', fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // CSVを解析して配列（リスト）にする
  const records = parse(fileContent, {
    columns: true, // 1行目を見出しとして扱う
    skip_empty_lines: true,
    relax_column_count: true,
  });
  
  return records;
}