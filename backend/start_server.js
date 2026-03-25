const path = require('path');
const mainPath = path.resolve(__dirname, 'dist', 'main.js');
console.log('Booting CCVA Fleet Management Backend...');
console.log('Main file:', mainPath);
require(mainPath);
