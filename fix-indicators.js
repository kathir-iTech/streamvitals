const fs = require('fs');
const d = fs.readFileSync('src/data/indicators.json', 'utf8');
fs.writeFileSync('src/data/indicators.ts', 'export const indicators = ' + d + ';');
console.log('done');
