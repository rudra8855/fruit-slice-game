# Fruit Blade Frenzy 🍉⚔️

A polished, high-performance browser-based fruit-slicing arcade mini-game built with vanilla HTML5, Canvas 2D, modern CSS3, and procedural Web Audio. Zero external asset dependencies, 100% static, and deployable straight to Vercel with zero configuration.

![Fruit Blade Frenzy](https://img.shields.io/badge/Status-Complete-brightgreen)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Canvas2D%20%7C%20WebAudio-orange)
![Deployment](https://img.shields.io/badge/Platform-Vercel%20Static-black)

---

## 🎮 Features

- **Responsive Touch & Mouse Controls**: Slice smoothly using mouse drag on desktop or touch gestures on smartphones and tablets.
- **Touch-Safe Scrolling Prevention**: `touch-action: none` applied cleanly to the play area to prevent accidental swipe gestures or pull-to-refresh on mobile while preserving button clickability.
- **Custom Procedural Vector Artwork**:
  - Fruits: Watermelon, Orange, Apple, Banana, Strawberry, Pineapple, Coconut, and the rare **Golden Dragonfruit** (+50 points!).
  - Ticking Bomb with animated fuse spark and ember particles.
  - Slicing splits fruits into two realistic halves flying apart along the cut angle.
- **Dynamic Juice & Particle FX**:
  - Splattering juice drops with physics and gravity.
  - Lingering juice splatter stains on the background cutting board.
  - Smooth tapered neon glowing blade slash ribbon.
  - Bomb explosion shockwave rings and fireball sparks.
  - Floating combo popups (`3x COMBO! +30`, `5x BLITZ! +50`).
- **Combo System**: Slice 3 or more fruits in a single swift swipe to trigger escalating score multipliers and musical chord chimes.
- **Procedural Web Audio Engine**:
  - Self-contained synthesizer with `AudioContext`.
  - Realistic swooshing blade cuts, juicy squelches, ascending combo chimes, ticking bomb fuses, and explosive blasts.
  - Adheres to modern browser Autoplay policies (lazy-initialized on first user interaction).
  - Sound on/off mute toggle with persistence in `localStorage`.
- **Two Distinct Game Modes**:
  - **Classic Mode**: 3 strikes system. Dropping intact fruits costs a strike; slicing a bomb causes a catastrophic blast!
  - **Arcade Rush**: 60-second high-speed frenzy. Unlimited lives; slicing bombs inflicts time and score penalties!
- **Persistent Career Records**:
  - Classic and Arcade high scores.
  - All-time max combo streak.
  - Total fruits sliced and games played counter.
- **Pause & Resume**: Pause at any time via HUD button or `ESC` / `P` keyboard shortcuts.

---

## 📁 File Structure

```
├── index.html           # Semantic HTML5 layout, HUD, modals, and canvas layers
├── css/
│   └── style.css        # Responsive arcade styling, glassmorphism, animations
├── js/
│   ├── audio.js         # Procedural Web Audio API sound synthesizer
│   ├── fruits.js        # Canvas2D vector fruit models & sliced half physics
│   ├── particles.js     # Juice splatters, blade trail ribbon & explosion FX
│   └── game.js          # Game loop, gesture tracking, physics & state machine
├── vercel.json          # Vercel static deployment & security headers config
└── README.md            # Documentation & deployment guide
```

---

## 🚀 Local Testing & Scripts

### Available NPM Scripts
```bash
# Build & package for production (generates dist/)
npm run build

# Run JavaScript syntax verification tests
npm test

# Start the local development server on port 3000
npm start
```

### Option 1: Built-in NPM Start (Recommended)
```bash
npm start
```
Then open: `http://localhost:3000`

### Option 2: Python HTTP Server (Instant)
```bash
python -m http.server 3000
```

### Option 3: Node.js `npx serve`
```bash
npx serve .
```

### Option 3: Direct Browser Open
Simply double-click `index.html` or open it with your web browser. (Web Audio and localStorage are fully supported in modern browsers).

---

## 🌐 Deploying to Vercel

This repository is pre-configured for static deployment on Vercel with zero build step required.

### Method A: Deploy via Vercel CLI
1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. Run deploy inside the project directory:
   ```bash
   vercel
   ```
3. When prompted:
   - Set up and deploy? **Yes**
   - Which scope? Select your personal or team account
   - Link to existing project? **No**
   - Project name: `fruit-blade-frenzy` (or desired name)
   - Directory: `./`
   - Want to modify settings? **No**

To deploy directly to production:
```bash
vercel --prod
```

### Method B: Deploy via GitHub / Git
1. Push this directory to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Fruit Blade Frenzy mini-game"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New...** > **Project**.
4. Import your GitHub repository.
5. In **Framework Preset**, leave it as **Other** (no build command or output directory needed).
6. Click **Deploy**. Your game will be live within seconds!

---

## ⌨️ Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Slice / Cut** | Swipe mouse with left button held OR swipe finger across screen |
| **Pause / Resume** | Click Pause button or press `ESC` / `P` |
| **Toggle Audio** | Click Speaker button or press `M` |
| **Quick Restart** | Press `R` (during game or game over) |

---

## 📜 License
MIT License. Created with original procedural vector art and synthetic audio. Free to use, modify, and distribute.
