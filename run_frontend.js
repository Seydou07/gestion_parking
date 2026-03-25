const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.resolve(__dirname, 'frontend');
const nextBin = path.resolve(frontendDir, 'node_modules', '.bin', 'next');

console.log('--- CCVA Frontend Bootstrapper ---');
console.log('Direct execution of Next.js to bypass Corepack/npm comparator errors.');

const frontend = spawn('node', [nextBin, 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
});

frontend.on('error', (err) => {
    console.error('Failed to start frontend:', err);
});
