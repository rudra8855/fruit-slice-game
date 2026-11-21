const fs = require('fs');

console.log('--- Verifying DOM IDs ---');
const gameCode = fs.readFileSync('js/game.js', 'utf-8');
const html = fs.readFileSync('index.html', 'utf-8');

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(gameCode)) !== null) {
  ids.add(match[1]);
}

const missing = [...ids].filter(id => !html.includes('id="' + id + '"'));
console.log('Total unique IDs checked:', ids.size);
if (missing.length === 0) {
  console.log('✅ All DOM element IDs matched perfectly!');
} else {
  console.error('❌ Missing IDs in index.html:', missing);
  process.exit(1);
}

console.log('\n--- Verifying querySelector/All ---');
const qsRegex = /querySelector(?:All)?\(['"]([^'"]+)['"]\)/g;
const selectors = new Set();
while ((match = qsRegex.exec(gameCode)) !== null) {
  selectors.add(match[1]);
}
console.log('Selectors used:', [...selectors]);

console.log('\n--- Build Verification ---');
require('./build.js');
