const fs = require('fs');
const { execSync } = require('child_process');
try { fs.unlinkSync('fix-lock3.js'); } catch(e) {}
try { execSync('git add -A'); } catch(e) {}
try { execSync('git commit -m "fix: regenerate package-lock.json, remove corrupted entries"'); } catch(e) {}
try { execSync('git push'); } catch(e) { console.log(e.message.substring(0,200)); }
