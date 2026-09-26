const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/Developer/Desktop/AQUA/streamvitals';
const REMOTE = 'https://github.com/kathir-iTech/streamvitals.git';
const BRANCH = 'main';

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf-8' });
}

function main() {
  console.log('=== StreamVitals Git Setup ===\n');

  // Check if git repo exists
  try {
    git('rev-parse --is-inside-work-tree');
    console.log('Git repo found.');
  } catch {
    console.log('Initializing git repo...');
    git('init');
  }

  // Set remote
  try {
    const currentRemote = git('remote get-url origin').trim();
    if (currentRemote !== REMOTE) {
      git(`remote set-url origin ${REMOTE}`);
      console.log(`Remote updated: ${REMOTE}`);
    } else {
      console.log(`Remote already set: ${REMOTE}`);
    }
  } catch {
    git(`remote add origin ${REMOTE}`);
    console.log(`Remote added: ${REMOTE}`);
  }

  // Ensure branch
  try {
    git(`branch -M ${BRANCH}`);
    console.log(`Branch set to: ${BRANCH}`);
  } catch (e) {
    console.log('Branch already exists.');
  }

  // Stage all files
  git('add -A');
  console.log('All files staged.');

  // Force push
  try {
    git(`push -f origin ${BRANCH}`);
    console.log(`Force push to origin/${BRANCH} complete.`);
  } catch (e) {
    console.log('Push failed:', e.message);
  }
}

main();
