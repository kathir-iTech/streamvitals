const fs = require('fs');
const { execSync } = require('child_process');
try { fs.unlinkSync('deploy.js'); console.log('deploy.js deleted'); } catch(e) {}
execSync('git add -A');
execSync('git commit -m "final clean"');
execSync('git push');
