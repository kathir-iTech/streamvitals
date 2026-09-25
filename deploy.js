const { execSync } = require('child_process');
execSync('git add -A');
execSync('git commit -m "remove cleanup.js helper"');
execSync('git push');
