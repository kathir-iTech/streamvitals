const { execSync } = require('child_process');
const fs = require('fs');
const files = ['ambient-wave.tsx', 'floating-orb.tsx', 'water-canvas.tsx'];
files.forEach(f => {
  const path = 'src/components/' + f;
  if (fs.existsSync(path)) fs.unlinkSync(path);
});
execSync('git add -A');
execSync('git commit -m "design: light card-based theme, remove dark components"');
execSync('git push');
