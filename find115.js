const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  try {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
        results.push(...walk(p));
      } else {
        results.push(p);
      }
    });
  } catch(e) {}
  return results;
}

// Search parent dir and all subdirs
const all = walk('..');
const allFiles = all.filter(f => !f.includes('node_modules') && !f.includes('.git') && !f.includes('.next'));
console.log('All files:', allFiles.length);

// Find JSON files with many items
allFiles.forEach(f => {
  try {
    if (f.endsWith('.json') && !f.includes('package-lock') && !f.includes('tsconfig')) {
      const content = fs.readFileSync(f, 'utf8');
      const data = JSON.parse(content);
      if (data && typeof data === 'object') {
        const keys = Object.keys(data);
        if (data.items && Array.isArray(data.items) && data.items.length > 50) {
          console.log(`LARGE: ${f} has ${data.items.length} items`);
        }
        if (data.items && Array.isArray(data.items)) {
          console.log(`Items: ${f} has ${data.items.length} items`);
        }
      }
    }
  } catch(e) {}
});

// Also search for "115" in all files
allFiles.forEach(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('"115"') || content.includes('115 items') || content.includes('items: 115')) {
      console.log(`Found 115 in: ${f}`);
    }
  } catch(e) {}
});
