/**
 * Fruit Blade Frenzy - Main Game Controller & Physics Engine
 * Complete, production-ready implementation with touch-friendly gesture slicing,
 * ballistic arc trajectories, combo detection, high scores, and audio synthesis.
 */

class GameEngine {
  constructor() {
    // DOM Elements
    this.appContainer = document.getElementById('game-app');
    this.gameCanvas = document.getElementById('game-canvas');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.bgCanvas = document.getElementById('bg-canvas');

    this.ctx = this.gameCanvas.getContext('2d');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.bgCtx = this.bgCanvas.getContext('2d');

    // HUD Elements
    this.hud = document.getElementById('game-hud');
    this.scoreValEl = document.getElementById('current-score');
    this.bestValEl = document.getElementById('best-score');
    this.comboBubbleEl = document.getElementById('combo-display');
    this.comboCountEl = document.getElementById('combo-count');
    this.livesWrapper = document.getElementById('lives-container');
    this.timerWrapper = document.getElementById('timer-container');
    this.timerValEl = document.getElementById('timer-value');
    this.strikesMarks = document.querySelectorAll('.strike-mark');

    // Modals
    this.menuOverlay = document.getElementById('menu-overlay');
    this.pauseModal = document.getElementById('pause-modal');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.instructionsModal = document.getElementById('instructions-modal');
    this.statsModal = document.getElementById('stats-modal');

    // GameOver Stats Elements
    this.finalScoreEl = document.getElementById('final-score');
    this.newHighBadge = document.getElementById('new-high-badge');
    this.statBestEl = document.getElementById('stat-best');
    this.statMaxComboEl = document.getElementById('stat-max-combo');
    this.statFruitsEl = document.getElementById('stat-fruits');
    this.statBombsDodgedEl = document.getElementById('stat-bombs-dodged');

    // Records Elements
    this.recordClassicEl = document.getElementById('record-classic');
    this.recordArcadeEl = document.getElementById('record-arcade');
    this.recordComboEl = document.getElementById('record-combo');
    this.recordTotalSlicedEl = document.getElementById('record-total-sliced');
    this.recordGamesPlayedEl = document.getElementById('record-games-played');

    // Audio & Particles
    this.particleSystem = new ParticleSystem(this.fxCanvas, this.bgCanvas);

    // Game State
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
    this.mode = 'CLASSIC'; // 'CLASSIC' | 'ARCADE'

    // Runtime Gameplay Data
    this.score = 0;
    this.lives = 3;
    this.arcadeTimeLeft = 60;
    this.fruitsSlicedCount = 0;
    this.bombsDodgedCount = 0;
    this.currentStrokeSlices = 0;
    this.maxComboThisGame = 0;
    this.lastSliceTimestamp = 0;
    this.comboResetTimeout = null;

    // Entities
    this.fruits = [];
    this.slicedHalves = [];

    // Pointer / Blade Trail
    this.isPointerDown = false;
    this.bladePoints = [];
    this.maxBladePoints = 14;

    // Spawner Timing
    this.timeSinceLastWave = 0;
    this.nextWaveInterval = 2.0;
    this.waveDifficultyTier = 1;

    // Canvas Dimensions & Scale
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Tip Carousel
    this.tips = [
      "Slice 3+ fruits in one continuous stroke for Combo Multipliers!",
      "Beware of ticking bombs — listen for their hissing fuse!",
      "Catch the glowing Golden Dragonfruit for a huge +50 point jackpot!",
      "Swiping faster gives you cleaner slices and higher accuracy.",
      "Arcade Mode gives you 60 seconds with unlimited frenzy!"
    ];

    this.init();
  }

  init() {
    this.setupResizeHandler();
    this.setupEventListeners();
    this.setupButtons();
    this.loadRecords();
    this.updateSoundIcon();

    // Check if first time player -> show instructions
    if (!localStorage.getItem('fruit_blade_visited')) {
      this.showModal('instructions');
      localStorage.setItem('fruit_blade_visited', 'true');
    }

    // Set a random tip on menu
    const tipEl = document.getElementById('random-tip');
    if (tipEl) {
      tipEl.textContent = this.tips[Math.floor(Math.random() * this.tips.length)];
    }

    // Start RAF game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setupResizeHandler() {
    const handleResize = () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      [this.gameCanvas, this.fxCanvas, this.bgCanvas].forEach(canvas => {
        canvas.width = Math.floor(this.width * this.dpr);
        canvas.height = Math.floor(this.height * this.dpr);
        canvas.style.width = `${this.width}px`;
        canvas.style.height = `${this.height}px`;

        const ctx = canvas.getContext('2d');
        ctx.resetTransform();
        ctx.scale(this.dpr, this.dpr);
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 300);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    handleResize();
  }

  setupEventListeners() {
    // Touch & Pointer Gesture Events with Touch-Safety
    const canvasContainer = document.getElementById('canvas-container');

    const getCanvasCoordinates = (e) => {
      const rect = canvasContainer.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const onPointerDown = (e) => {
      if (this.state !== 'PLAYING') return;
      window.soundCtrl.init();
      this.isPointerDown = true;
      const coords = getCanvasCoordinates(e);
      this.bladePoints = [{ x: coords.x, y: coords.y, time: performance.now() }];
      this.currentStrokeSlices = 0;
    };

    const onPointerMove = (e) => {
      if (!this.isPointerDown || this.state !== 'PLAYING') return;
      if (e.cancelable) e.preventDefault(); // Prevent accidental scroll/pull-down while swiping

      const coords = getCanvasCoordinates(e);
      const now = performance.now();
      const prev = this.bladePoints[this.bladePoints.length - 1];

      if (prev) {
        const dx = coords.x - prev.x;
        const dy = coords.y - prev.y;
        const dist = Math.hypot(dx, dy);

        // Require active movement velocity to slice (prevents static click or slow hover)
        if (dist > 8) {
          // Play subtle blade whoosh when swift
          if (dist > 35 && Math.random() < 0.2) {
            window.soundCtrl.playWhoosh();
          }

          // Check line segment collision with all active fruits
          this.checkSliceCollisions(prev.x, prev.y, coords.x, coords.y);
        }
      }

      this.bladePoints.push({ x: coords.x, y: coords.y, time: now });
      if (this.bladePoints.length > this.maxBladePoints) {
        this.bladePoints.shift();
      }
    };

    const onPointerEnd = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.evaluateStrokeCombo();
    };

    // Attach pointer listeners to container
    canvasContainer.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerEnd, { passive: false });
    window.addEventListener('pointercancel', onPointerEnd, { passive: false });

    // Keyboard Shortcuts (ESC, P to Pause, M for Mute, R for Restart)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === 'PLAYING') {
          this.pauseGame();
        } else if (this.state === 'PAUSED') {
          this.resumeGame();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleSound();
      } else if (e.key === 'r' || e.key === 'R') {
        if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
          this.startGame(this.mode);
        }
      }
    });
  }

  setupButtons() {
    // Menu Buttons
    document.getElementById('btn-play-classic').onclick = () => {
      window.soundCtrl.playClick();
      this.startGame('CLASSIC');
    };
    document.getElementById('btn-play-arcade').onclick = () => {
      window.soundCtrl.playClick();
      this.startGame('ARCADE');
    };
    document.getElementById('btn-instructions').onclick = () => {
      window.soundCtrl.playClick();
      this.showModal('instructions');
    };
    document.getElementById('btn-stats').onclick = () => {
      window.soundCtrl.playClick();
      this.updateRecordsUI();
      this.showModal('stats');
    };

    // Instructions
    document.getElementById('btn-close-instructions').onclick = () => {
      window.soundCtrl.playClick();
      this.hideModal('instructions');
    };

    // Pause
    document.getElementById('btn-pause').onclick = () => {
      window.soundCtrl.playClick();
      this.pauseGame();
    };
    document.getElementById('btn-resume').onclick = () => {
      window.soundCtrl.playClick();
      this.resumeGame();
    };
    document.getElementById('btn-restart-paused').onclick = () => {
      window.soundCtrl.playClick();
      this.startGame(this.mode);
    };
    document.getElementById('btn-quit-paused').onclick = () => {
      window.soundCtrl.playClick();
      this.showMenu();
    };

    // GameOver
    document.getElementById('btn-play-again').onclick = () => {
      window.soundCtrl.playClick();
      this.startGame(this.mode);
    };
    document.getElementById('btn-main-menu').onclick = () => {
      window.soundCtrl.playClick();
      this.showMenu();
    };

    // Stats
    document.getElementById('btn-close-stats').onclick = () => {
      window.soundCtrl.playClick();
      this.hideModal('stats');
    };
    document.getElementById('btn-reset-records').onclick = () => {
      if (confirm('Reset all career high scores and stats?')) {
        this.resetRecords();
      }
    };

    // Sound Toggle
    document.getElementById('btn-sound-toggle').onclick = () => {
      this.toggleSound();
    };
  }

  toggleSound() {
    const isMuted = window.soundCtrl.toggleMute();
    this.updateSoundIcon();
  }

  updateSoundIcon() {
    const iconEl = document.getElementById('sound-icon');
    if (iconEl) {
      iconEl.textContent = window.soundCtrl.isMuted ? '🔇' : '🔊';
    }
  }

  showModal(name) {
    if (name === 'instructions') this.instructionsModal.classList.remove('hidden');
    if (name === 'stats') this.statsModal.classList.remove('hidden');
    if (name === 'pause') this.pauseModal.classList.remove('hidden');
    if (name === 'gameover') this.gameoverModal.classList.remove('hidden');
  }

  hideModal(name) {
    if (name === 'instructions') this.instructionsModal.classList.add('hidden');
    if (name === 'stats') this.statsModal.classList.add('hidden');
    if (name === 'pause') this.pauseModal.classList.add('hidden');
    if (name === 'gameover') this.gameoverModal.classList.add('hidden');
  }

  showMenu() {
    this.state = 'MENU';
    this.hideModal('pause');
    this.hideModal('gameover');
    this.hideModal('stats');
    this.hud.classList.add('hidden');
    this.menuOverlay.classList.remove('hidden');

    this.fruits = [];
    this.slicedHalves = [];
    this.bladePoints = [];
    this.particleSystem.clear();
  }

  startGame(mode = 'CLASSIC') {
    window.soundCtrl.init();
    this.state = 'PLAYING';
    this.mode = mode;

    this.score = 0;
    this.lives = 3;
    this.arcadeTimeLeft = 60;
    this.fruitsSlicedCount = 0;
    this.bombsDodgedCount = 0;
    this.currentStrokeSlices = 0;
    this.maxComboThisGame = 0;
    this.waveDifficultyTier = 1;
    this.timeSinceLastWave = 1.0; // Quick initial spawn

    this.fruits = [];
    this.slicedHalves = [];
    this.bladePoints = [];

    // Reset UI
    this.menuOverlay.classList.add('hidden');
    this.hideModal('pause');
    this.hideModal('gameover');
    this.hud.classList.remove('hidden');

    this.scoreValEl.textContent = '0';
    const bestScore = this.getHighScore(this.mode);
    this.bestValEl.textContent = bestScore;

    if (this.mode === 'CLASSIC') {
      this.livesWrapper.classList.remove('hidden');
      this.timerWrapper.classList.add('hidden');
      this.updateStrikesUI();
    } else {
      this.livesWrapper.classList.add('hidden');
      this.timerWrapper.classList.remove('hidden');
      this.timerWrapper.classList.remove('danger');
      this.timerValEl.textContent = '60';
    }

    // Register 1 game played in records
    this.incrementStat('gamesPlayed', 1);
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    document.getElementById('pause-score').textContent = this.score;
    this.showModal('pause');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    this.hideModal('pause');
    this.lastTime = performance.now();
  }

  gameOver(reason = 'strikes') {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    window.soundCtrl.playGameOver();

    // Check High Score
    const previousBest = this.getHighScore(this.mode);
    const isNewHigh = this.score > previousBest;
    if (isNewHigh) {
      this.setHighScore(this.mode, this.score);
    }

    // Update Career Stats
    this.incrementStat('totalSliced', this.fruitsSlicedCount);
    const allTimeCombo = parseInt(localStorage.getItem('fruit_blade_max_combo') || '0', 10);
    if (this.maxComboThisGame > allTimeCombo) {
      localStorage.setItem('fruit_blade_max_combo', this.maxComboThisGame);
    }

    // Populate GameOver Card
    this.finalScoreEl.textContent = this.score;
    this.statBestEl.textContent = Math.max(previousBest, this.score);
    this.statMaxComboEl.textContent = `${this.maxComboThisGame}x`;
    this.statFruitsEl.textContent = this.fruitsSlicedCount;
    this.statBombsDodgedEl.textContent = this.bombsDodgedCount;

    const gameoverTitle = document.getElementById('gameover-title');
    if (reason === 'bomb') {
      gameoverTitle.textContent = '💥 BOOM! Bomb Blast!';
    } else if (reason === 'timeout') {
      gameoverTitle.textContent = '⏱️ Time Is Up!';
    } else {
      gameoverTitle.textContent = '❌ Frenzy Ended!';
    }

    if (isNewHigh && this.score > 0) {
      this.newHighBadge.classList.remove('hidden');
    } else {
      this.newHighBadge.classList.add('hidden');
    }

    this.showModal('gameover');
  }

  // Slice Detection Math
  checkSliceCollisions(x1, y1, x2, y2) {
    const cutAngle = Math.atan2(y2 - y1, x2 - x1);

    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      if (f.isSliced) continue;

      // Distance from circle center (f.x, f.y) to line segment (x1,y1)-(x2,y2)
      if (this.lineIntersectsCircle(x1, y1, x2, y2, f.x, f.y, f.radius)) {
        this.sliceFruit(f, i, cutAngle);
      }
    }
  }

  lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    // Projection parameter t
    let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    // Closest point on segment
    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;

    const distSq = (cx - nearestX) * (cx - nearestX) + (cy - nearestY) * (cy - nearestY);
    return distSq <= r * r;
  }

  sliceFruit(fruit, index, cutAngle) {
    fruit.isSliced = true;
    this.fruits.splice(index, 1);

    // If Bomb is sliced
    if (fruit.type.isBomb) {
      this.handleBombSlice(fruit);
      return;
    }

    // Normal or Rare Fruit Sliced
    this.fruitsSlicedCount++;
    this.currentStrokeSlices++;
    this.lastSliceTimestamp = performance.now();

    // Sound
    window.soundCtrl.playFruitSlice(fruit.type.pitch);
    if (fruit.type.isRare) {
      window.soundCtrl.playDragonfruitBonus();
    }

    // Add Points
    this.addScore(fruit.type.points);

    // Splatter particles
    this.particleSystem.createJuiceExplosion(fruit.x, fruit.y, fruit.type.splashColor, 20);

    // Floating text indicator
    const ptsText = fruit.type.isRare ? `+${fruit.type.points} JACKPOT!` : `+${fruit.type.points}`;
    this.particleSystem.addFloatingText(ptsText, fruit.x, fruit.y - 10, fruit.type.splashColor, fruit.type.isRare);

    // Create 2 sliced halves flying apart perpendicular to the cut line
    const normalAngle = cutAngle + Math.PI / 2;
    const separationSpeed = 160 + Math.random() * 80;

    // Piece 1 (Negative normal)
    const half1 = new SlicedFruitHalf(
      fruit.type,
      fruit.x,
      fruit.y,
      fruit.vx - Math.cos(normalAngle) * separationSpeed,
      fruit.vy - Math.sin(normalAngle) * separationSpeed - 40,
      -3 - Math.random() * 4,
      cutAngle,
      -1
    );

    // Piece 2 (Positive normal)
    const half2 = new SlicedFruitHalf(
      fruit.type,
      fruit.x,
      fruit.y,
      fruit.vx + Math.cos(normalAngle) * separationSpeed,
      fruit.vy + Math.sin(normalAngle) * separationSpeed - 40,
      3 + Math.random() * 4,
      cutAngle,
      1
    );

    this.slicedHalves.push(half1, half2);

    // Check for inline combo timeout
    if (this.comboResetTimeout) clearTimeout(this.comboResetTimeout);
    this.comboResetTimeout = setTimeout(() => {
      this.evaluateStrokeCombo();
    }, 280);
  }

  handleBombSlice(bomb) {
    window.soundCtrl.playExplosion();
    this.particleSystem.createBombExplosion(bomb.x, bomb.y);

    // Screen Shake
    this.appContainer.classList.add('screen-shake');
    setTimeout(() => {
      this.appContainer.classList.remove('screen-shake');
    }, 450);

    if (this.mode === 'CLASSIC') {
      // In Classic mode, slicing a bomb is an instant strike or loss!
      this.lives--;
      this.updateStrikesUI();
      if (this.lives <= 0) {
        this.gameOver('bomb');
      } else {
        this.particleSystem.addFloatingText('BOMB HIT! -1 LIFE', bomb.x, bomb.y - 20, '#ff4757', true);
      }
    } else {
      // Arcade mode: Penalty -10 points & -3 seconds
      this.score = Math.max(0, this.score - 10);
      this.arcadeTimeLeft = Math.max(0, this.arcadeTimeLeft - 3);
      this.scoreValEl.textContent = this.score;
      this.timerValEl.textContent = Math.ceil(this.arcadeTimeLeft);
      this.particleSystem.addFloatingText('-10 PTS! -3s', bomb.x, bomb.y - 20, '#ff4757', true);
    }
  }

  evaluateStrokeCombo() {
    if (this.currentStrokeSlices >= 3) {
      const combo = this.currentStrokeSlices;
      const bonus = combo * 10;
      this.addScore(bonus);

      window.soundCtrl.playComboChime(combo);

      // Floating Combo FX
      const lastPoint = this.bladePoints[this.bladePoints.length - 1] || { x: this.width / 2, y: this.height / 2 };
      this.particleSystem.addFloatingText(`${combo}x COMBO! +${bonus}`, lastPoint.x, lastPoint.y - 30, '#ffd32a', true);

      // Update HUD Combo Pill
      this.comboCountEl.textContent = `${combo}x`;
      this.comboBubbleEl.classList.remove('hidden');
      setTimeout(() => {
        this.comboBubbleEl.classList.add('hidden');
      }, 1200);

      if (combo > this.maxComboThisGame) {
        this.maxComboThisGame = combo;
      }
    }
    this.currentStrokeSlices = 0;
  }

  addScore(pts) {
    this.score += pts;
    this.scoreValEl.textContent = this.score;

    const currentBest = this.getHighScore(this.mode);
    if (this.score > currentBest) {
      this.bestValEl.textContent = this.score;
    }
  }

  updateStrikesUI() {
    this.strikesMarks.forEach((mark, idx) => {
      const strikeIndex = 3 - this.lives;
      if (idx < strikeIndex) {
        mark.classList.add('active');
      } else {
        mark.classList.remove('active');
      }
    });
  }

  // Wave Spawner
  updateSpawner(dt) {
    this.timeSinceLastWave += dt;

    if (this.timeSinceLastWave >= this.nextWaveInterval) {
      this.timeSinceLastWave = 0;
      this.spawnFruitWave();

      // Dynamic difficulty
      const speedFactor = Math.min(2.5, 1 + this.score / 250);
      this.nextWaveInterval = Math.max(1.1, (2.2 - Math.random() * 0.6) / speedFactor);
    }
  }

  spawnFruitWave() {
    // Choose count of fruits to toss (1 to 4 depending on score)
    let count = 1;
    const roll = Math.random();
    if (this.score > 120) {
      count = roll < 0.35 ? 3 : roll < 0.75 ? 2 : 4;
    } else if (this.score > 40) {
      count = roll < 0.5 ? 2 : 3;
    } else {
      count = roll < 0.65 ? 1 : 2;
    }

    const availableFruits = Object.values(FRUIT_TYPES);

    // Calculate total weight for weighted random selection
    const totalWeight = availableFruits.reduce((sum, f) => {
      // Exclude rare in early waves
      if (f.isRare && this.score < 25) return sum;
      return sum + f.weight;
    }, 0);

    for (let i = 0; i < count; i++) {
      // Pick random fruit type
      let rand = Math.random() * totalWeight;
      let chosenType = availableFruits[0];

      for (const f of availableFruits) {
        if (f.isRare && this.score < 25) continue;
        if (rand < f.weight) {
          chosenType = f;
          break;
        }
        rand -= f.weight;
      }

      // Ballistic Launch Parameters
      // Launch from bottom edge across screen
      const minX = this.width * 0.15;
      const maxX = this.width * 0.85;
      const startX = minX + Math.random() * (maxX - minX);
      const startY = this.height + 50;

      // Calculate vertical impulse so fruits peak near top 20%-35% of screen
      const targetPeakY = this.height * (0.2 + Math.random() * 0.25);
      const gravity = 980;
      const targetHeight = startY - targetPeakY;
      const vy = -Math.sqrt(2 * gravity * targetHeight) * (0.95 + Math.random() * 0.15);

      // Horizontal velocity towards screen center
      const centerX = this.width * 0.5;
      const directionToCenter = (centerX - startX) / this.width;
      const vx = directionToCenter * (180 + Math.random() * 220) + (Math.random() - 0.5) * 80;

      const fruitEntity = new FruitEntity(chosenType, startX, startY, vx, vy);

      // Delay successive fruits slightly in multi-fruit waves
      if (i > 0) {
        setTimeout(() => {
          if (this.state === 'PLAYING') {
            this.fruits.push(fruitEntity);
          }
        }, i * 160);
      } else {
        this.fruits.push(fruitEntity);
      }
    }
  }

  // Main Game Loop (Physics, Render, Delta-time)
  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // 1. Spawner
    this.updateSpawner(dt);

    // 2. Arcade Mode Timer
    if (this.mode === 'ARCADE') {
      this.arcadeTimeLeft -= dt;
      this.timerValEl.textContent = Math.max(0, Math.ceil(this.arcadeTimeLeft));

      if (this.arcadeTimeLeft <= 10) {
        this.timerWrapper.classList.add('danger');
      }

      if (this.arcadeTimeLeft <= 0) {
        this.gameOver('timeout');
        return;
      }
    }

    // 3. Update Active Fruits
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      f.update(dt);

      // Dropped past bottom of screen
      if (f.y > this.height + 80 && f.vy > 0) {
        this.fruits.splice(i, 1);

        if (f.type.isBomb) {
          // Dodged a bomb!
          this.bombsDodgedCount++;
        } else if (!f.isSliced && this.mode === 'CLASSIC') {
          // Missed fruit in Classic mode -> strike!
          this.lives--;
          window.soundCtrl.playStrike();
          this.updateStrikesUI();

          // Dropped indicator
          this.particleSystem.addFloatingText('❌ MISSED', Math.min(Math.max(f.x, 60), this.width - 60), this.height - 40, '#ff4757');

          if (this.lives <= 0) {
            this.gameOver('strikes');
            return;
          }
        }
      }
    }

    // 4. Update Sliced Fruit Halves
    for (let i = this.slicedHalves.length - 1; i >= 0; i--) {
      const half = this.slicedHalves[i];
      half.update(dt);
      if (half.y > this.height + 100) {
        this.slicedHalves.splice(i, 1);
      }
    }

    // 5. Update Background stains fade
    this.particleSystem.updateBackground(dt);

    // 6. Blade Trail Fade
    const now = performance.now();
    for (let i = this.bladePoints.length - 1; i >= 0; i--) {
      if (now - this.bladePoints[i].time > 160) {
        this.bladePoints.splice(i, 1);
      }
    }
  }

  render() {
    // Clear Main Physics Canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Clear FX Canvas
    this.particleSystem.clear();

    // 1. Draw Sliced Halves
    for (const half of this.slicedHalves) {
      half.draw(this.ctx);
    }

    // 2. Draw Intact Fruits & Bombs
    for (const f of this.fruits) {
      f.draw(this.ctx);
    }

    // 3. Draw Blade Trail Slash
    this.particleSystem.drawBladeTrail(this.bladePoints);

    // 4. Draw Particles, Shockwaves & Floating Texts on FX Layer
    this.particleSystem.updateAndDraw(0.016);
  }

  // Storage & Records Management
  getHighScore(mode) {
    const key = mode === 'CLASSIC' ? 'fruit_blade_high_classic' : 'fruit_blade_high_arcade';
    return parseInt(localStorage.getItem(key) || '0', 10);
  }

  setHighScore(mode, val) {
    const key = mode === 'CLASSIC' ? 'fruit_blade_high_classic' : 'fruit_blade_high_arcade';
    localStorage.setItem(key, val);
  }

  incrementStat(key, val) {
    const storageKey = `fruit_blade_stat_${key}`;
    const curr = parseInt(localStorage.getItem(storageKey) || '0', 10);
    localStorage.setItem(storageKey, curr + val);
  }

  loadRecords() {
    this.recordClassicEl.textContent = this.getHighScore('CLASSIC');
    this.recordArcadeEl.textContent = this.getHighScore('ARCADE');
    this.recordComboEl.textContent = `${localStorage.getItem('fruit_blade_max_combo') || '0'}x`;
    this.recordTotalSlicedEl.textContent = localStorage.getItem('fruit_blade_stat_totalSliced') || '0';
    this.recordGamesPlayedEl.textContent = localStorage.getItem('fruit_blade_stat_gamesPlayed') || '0';
  }

  updateRecordsUI() {
    this.loadRecords();
  }

  resetRecords() {
    localStorage.removeItem('fruit_blade_high_classic');
    localStorage.removeItem('fruit_blade_high_arcade');
    localStorage.removeItem('fruit_blade_max_combo');
    localStorage.removeItem('fruit_blade_stat_totalSliced');
    localStorage.removeItem('fruit_blade_stat_gamesPlayed');
    this.loadRecords();
    alert('Records have been reset!');
  }
}

// Instantiate and launch game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameEngine();
});
