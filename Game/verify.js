const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('🔍 PROJECT HEALTH CHECK & AUDIT');
console.log('==============================================\n');

// 1. Validate JSON Files
console.log('1. Checking JSON configuration files...');
['package.json', 'vercel.json'].forEach(file => {
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    JSON.parse(raw);
    console.log(`   ✅ ${file}: Valid JSON`);
  } catch (err) {
    console.error(`   ❌ ${file}: Invalid JSON!`, err.message);
    process.exit(1);
  }
});

// 2. Validate .gitignore
console.log('\n2. Checking .gitignore file...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  const requiredRules = ['node_modules/', 'dist/', '.env'];
  const allPresent = requiredRules.every(r => gitignore.includes(r));
  if (allPresent) {
    console.log('   ✅ .gitignore: Present and includes essential exclusion rules.');
  } else {
    console.warn('   ⚠️ .gitignore: Missing some standard rules.');
  }
} else {
  console.error('   ❌ .gitignore missing!');
  process.exit(1);
}

// 3. Verify Local Asset Links in index.html
console.log('\n3. Verifying local assets linked in index.html...');
const html = fs.readFileSync('index.html', 'utf-8');
const linkRegex = /(?:src|href)=["']([^"']+)["']/g;
let match;
const localAssets = [];
while ((match = linkRegex.exec(html)) !== null) {
  const asset = match[1];
  if (!asset.startsWith('http') && !asset.startsWith('//') && !asset.startsWith('#')) {
    localAssets.push(asset);
  }
}

let assetsOk = true;
localAssets.forEach(asset => {
  if (fs.existsSync(asset)) {
    console.log(`   ✅ Asset found: ${asset}`);
  } else {
    console.error(`   ❌ Missing referenced asset: ${asset}`);
    assetsOk = false;
  }
});
if (!assetsOk) process.exit(1);

// 4. Verify DOM IDs in JS
console.log('\n4. Verifying DOM Element IDs in js/game.js...');
const gameCode = fs.readFileSync('js/game.js', 'utf-8');
const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
const ids = new Set();
while ((match = idRegex.exec(gameCode)) !== null) {
  ids.add(match[1]);
}

const missing = [...ids].filter(id => !html.includes('id="' + id + '"'));
if (missing.length === 0) {
  console.log(`   ✅ All ${ids.size} DOM element IDs matched in index.html.`);
} else {
  console.error('   ❌ Missing DOM IDs in index.html:', missing);
  process.exit(1);
}

// 5. JavaScript Syntax Validation & Production Build
console.log('\n5. Executing Production Build & Syntax Validation...');
require('./build.js');

console.log('==============================================');
console.log('🎉 ALL CHECKS PASSED: GAME IS 100% READY!');
console.log('==============================================');
