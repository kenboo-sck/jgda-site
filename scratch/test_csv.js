const fs = require('fs');
const { parse } = require('csv-parse/sync');

const fileContent = fs.readFileSync('public/data/komagawa2026.csv', 'utf8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true,
});

console.log('Keys:', Object.keys(records[0]));
console.log('First Record:', records[0]);
