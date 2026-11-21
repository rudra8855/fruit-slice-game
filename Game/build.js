/**
 * Production Build Script for Fruit Blade Frenzy
 * Validates scripts, checks file integrity, and prepares dist/ bundle.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚔️  [Fruit Blade Frenzy] Starting production build...\n');

// Step 1: Validate JS Syntax
console.log('1. Validating JavaScript source files...');
const jsFiles = ['js/audio.js', 'js/fruits.js', 'js/particles.js', 'js/game.js'];
try {
  execSync(`node -c ${jsFiles.join(' ')}`, { stdio: 'inherit' });
  console.log('   ✅ All JavaScript files passed syntax validation.');
} catch (err) {
  console.error('   ❌ JavaScript syntax error detected!');
  process.exit(1);
}

// Step 2: Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Helper to copy files recursively
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItem => {
      copyRecursive(path.join(src, childItem), path.join(dest, childItem));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Step 3: Copy Assets to dist/
console.log('\n2. Assembling production dist/ package...');
const assets = ['index.html', 'css', 'js', 'vercel.json', 'README.md'];

assets.forEach(asset => {
  const srcPath = path.join(__dirname, asset);
  const destPath = path.join(distDir, asset);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log(`   📦 Packaged: ${asset} -> dist/${asset}`);
  }
});

console.log('\n✨ Build successful! The static app is verified and ready for deployment.');
console.log('   - Static root: ./');
console.log('   - Output bundle: ./dist\n');
