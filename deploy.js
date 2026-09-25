const fs = require('fs');
const { execSync } = require('child_process');
const unused = ['ai-vision.tsx', 'health-score.tsx', 'radar-chart.tsx', 'scroll-animations.tsx'];
unused.forEach(f => { try { fs.unlinkSync('src/components/' + f); console.log('Deleted:', f); } catch(e) {} });
try { execSync('git add -A'); } catch(e) {}
try { execSync('git commit -m "clean: remove unused dark-theme components"'); } catch(e) {}
try { execSync('git push'); } catch(e) { console.log(e.message.substring(0, 200)); }
