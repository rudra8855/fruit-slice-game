/**
 * Fruit Blade Frenzy - Particle System & Visual Effects Engine
 * Handles juicy splatter particles, background juice stains, blade ribbons,
 * floating combo/score popups, and bomb explosion shockwaves.
 */

class ParticleSystem {
  constructor(fxCanvas, bgCanvas) {
    this.fxCanvas = fxCanvas;
    this.fxCtx = fxCanvas.getContext('2d');

    this.bgCanvas = bgCanvas;
    this.bgCtx = bgCanvas.getContext('2d');

    this.particles = [];
    this.floatingTexts = [];
    this.stains = []; // Background juice splatter decals
    this.shockwaves = [];
  }

  // Clear FX canvas every frame
  clear() {
    this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
  }

  // Update & Draw Background Stains (persists with slow fade)
  updateBackground(dt) {
    // Semi-transparent fade of old juice stains
    for (let i = this.stains.length - 1; i >= 0; i--) {
      const s = this.stains[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.stains.splice(i, 1);
      }
    }

    // Redraw stains on bgCanvas if changed
    this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    for (const s of this.stains) {
      const alpha = Math.min(1, s.life / (s.maxLife * 0.4));
      this.bgCtx.save();
      this.bgCtx.globalAlpha = alpha * 0.4;
      this.bgCtx.fillStyle = s.color;
      this.bgCtx.beginPath();
      this.bgCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.bgCtx.fill();

      // Splat drips
      for (const d of s.drips) {
        this.bgCtx.beginPath();
        this.bgCtx.arc(s.x + d.dx, s.y + d.dy, d.r, 0, Math.PI * 2);
        this.bgCtx.fill();
      }
      this.bgCtx.restore();
    }
  }

  // Add a juice stain on the cutting board
  addBackgroundStain(x, y, color) {
    const drips = [];
    const dripCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < dripCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 25;
      drips.push({
        dx: Math.cos(ang) * dist,
        dy: Math.sin(ang) * dist,
        r: 3 + Math.random() * 5
      });
    }

    this.stains.push({
      x,
      y,
      radius: 18 + Math.random() * 16,
      color,
      life: 9.0, // Lasts 9 seconds
      maxLife: 9.0,
      drips
    });

    // Limit maximum stains to preserve performance
    if (this.stains.length > 30) {
      this.stains.shift();
    }
  }

  // Emit Juicy Splatters when a fruit is sliced
  createJuiceExplosion(x, y, color, count = 22) {
    this.addBackgroundStain(x, y, color);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      this.particles.push({
        type: 'juice',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color,
        gravity: 800,
        alpha: 1.0,
        decay: 0.8 + Math.random() * 0.8
      });
    }

    // Sparkle flecks
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 250;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2,
        color: '#ffffff',
        gravity: 300,
        alpha: 1.0,
        decay: 1.6
      });
    }
  }

  // Emit Bomb Blast Shockwave & Fiery Shrapnel
  createBombExplosion(x, y) {
    // Expanding Shockwave ring
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 180,
      alpha: 1.0,
      decay: 2.2
    });

    // Fiery hot sparks
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 550;
      const colors = ['#ffffff', '#f9ca24', '#ff793f', '#ff4757', '#2d3436'];
      this.particles.push({
        type: 'fire',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 400,
        alpha: 1.0,
        decay: 1.2 + Math.random() * 0.8
      });
    }
  }

  // Floating Score & Combo Text
  addFloatingText(text, x, y, color = '#ffa502', isBig = false) {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      isBig,
      vy: isBig ? -90 : -70,
      alpha: 1.0,
      life: 1.0,
      scale: isBig ? 1.4 : 1.0
    });
  }

  // Update and draw all active particles & FX
  updateAndDraw(dt) {
    const ctx = this.fxCtx;

    // 1. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * (dt * 10);
      sw.alpha -= dt * sw.decay;

      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * sw.alpha;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Flying particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.alpha -= dt * p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Floating Popup Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt * 1.2;
      ft.alpha = Math.max(0, ft.life);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `900 ${ft.isBig ? '28px' : '20px'} 'Fredoka One', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // Draw smooth tapered glowing blade trail
  drawBladeTrail(points) {
    if (!points || points.length < 2) return;
    const ctx = this.fxCtx;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer glow pass
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.55)';
    for (let i = 1; i < points.length; i++) {
      const progress = i / points.length; // 0 (tail) to 1 (head)
      ctx.lineWidth = 12 * progress;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }

    // Inner bright razor pass
    ctx.strokeStyle = '#ffffff';
    for (let i = 1; i < points.length; i++) {
      const progress = i / points.length;
      ctx.lineWidth = 4 * progress;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
