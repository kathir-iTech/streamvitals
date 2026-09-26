const { execSync } = require('child_process');
try { execSync('git add -A'); execSync('git commit -m "remove deploy.js"'); execSync('git push'); } catch(e) {}
