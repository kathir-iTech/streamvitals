const { execSync } = require('child_process');
execSync('git add -A');
execSync('git commit -m "remove helper scripts"');
execSync('git push');
