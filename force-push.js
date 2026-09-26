const { execSync } = require('child_process');
const path = 'D:/Developer/Desktop/AQUA/streamvitals';
process.chdir(path);
const commands = [
  'git rebase --abort',
  'git fetch origin',
  'git reset --hard origin/main',
  'git add -A',
  'git commit --amend -m "Initial commit: StreamVitals Field Companion for IEEE OneAquaHealth Hackathon 2026" --no-edit',
  'git push --force origin main'
];
async function run() {
  for (const cmd of commands) {
    try {
      console.log(`Running: ${cmd}`);
      execSync(cmd, { stdio: 'inherit', cwd: path });
    } catch (e) {
      console.log(`Error running: ${cmd}`);
      console.log(e.message);
      if (cmd.includes('push')) break;
    }
  }
}
run();
