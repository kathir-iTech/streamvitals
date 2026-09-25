const fs = require('fs');
const { execSync } = require('child_process');
try {
  // Try npm install with package-lock only
  const result = execSync('npm install --package-lock-only --legacy-peer-deps 2>&1', { encoding: 'utf8', timeout: 120000 });
  console.log('Succeeded');
} catch(e) {
  console.log('Failed:', e.message.substring(0, 300));
}
