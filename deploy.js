const { execSync } = require('child_process');
try { execSync('git add -A'); } catch(e) {}
try { execSync('git commit -m "remove deploy.js"'); } catch(e) {}
try { execSync('git push'); } catch(e) { console.log(e.message.substring(0,200)); }
