const { execSync } = require('child_process');
execSync('git add -A', { stdio: 'inherit' });
execSync('git commit -m "revert vercel json finalize Field Companion"', { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
