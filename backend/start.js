// Use relative paths to bypass Node.js realpathSync bug with parentheses in paths
const path = require('path');

console.log('--- CCVA Backend Bootstrapper ---');
try {
    // Join with relative path segment to avoid triggering absolute path resolution logic early
    const relativePath = './dist/main.js';
    console.log(`Loading entry point: ${relativePath}`);
    require(relativePath);
} catch (err) {
    console.error('Boot error:', err);
}
