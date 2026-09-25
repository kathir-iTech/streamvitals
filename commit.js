const { execSync } = require('child_process');
execSync('git add -A');
execSync('git commit -m "fix: case-insensitive indicator ID lookup for URL params"');
execSync('git push');
