const { execSync } = require('child_process');
execSync('git add -A');
execSync('git commit -m "remove deploy.js helper"');
execSync('git push');
