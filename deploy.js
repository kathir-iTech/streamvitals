const { execSync } = require('child_process');
try { execSync('git add -A'); execSync('git commit -m "chore: remove deploy helper"'); execSync('git push'); } catch(e) {}
