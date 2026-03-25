const { spawn } = require('child_process');
const path = require('path');

// Fix for Node.js path bugs on Windows with special characters like (1)
const backendDir = path.resolve(__dirname, 'backend');
const mainFile = path.resolve(backendDir, 'dist', 'main.js');

console.log('--- CCVA Fleet Management Bootstrapper ---');
console.log('Path:', __dirname);

const backend = spawn('node', [mainFile], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
});

backend.on('error', (err) => {
    console.error('Failed to start backend:', err);
});
