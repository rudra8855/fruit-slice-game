/**
 * Fruit Blade Frenzy - Fruit & Entity Procedural Rendering Engine
 * Generates custom 2D vector shapes, textures, seeds, and sliced halves with Canvas2D.
 */

const FRUIT_TYPES = {
  WATERMELON: {
    id: 'watermelon',
    name: 'Watermelon',
    radius: 46,
    points: 1,
    splashColor: '#ff3838',
    juiceColor: 'rgba(255, 56, 56, 0.75)',
    pitch: 0.9,
    weight: 22
  },
  ORANGE: {
    id: 'orange',
    name: 'Orange',
    radius: 38,
    points: 1,
    splashColor: '#ff9f1a',
    juiceColor: 'rgba(255, 159, 26, 0.75)',
    pitch: 1.1,
    weight: 20
  },
  APPLE: {
    id: 'apple',
    name: 'Apple',
    radius: 36,
    points: 1,
    splashColor: '#eb4d4b',
    juiceColor: 'rgba(235, 77, 75, 0.75)',
    pitch: 1.0,
    weight: 20
  },
  BANANA: {
    id: 'banana',
    name: 'Banana',
    radius: 35,
    points: 1,
    splashColor: '#f9ca24',
    juiceColor: 'rgba(249, 202, 36, 0.75)',
    pitch: 1.15,
    weight: 18
  },
  STRAWBERRY: {
    id: 'strawberry',
    name: 'Strawberry',
    radius: 32,
    points: 2,
    splashColor: '#ff4757',
    juiceColor: 'rgba(255, 71, 87, 0.8)',
    pitch: 1.25,
    weight: 15
  },
  PINEAPPLE: {
    id: 'pineapple',
    name: 'Pineapple',
    radius: 44,
    points: 2,
    splashColor: '#f6b93b',
    juiceColor: 'rgba(246, 185, 59, 0.8)',
    pitch: 0.95,
    weight: 12
  },
  COCONUT: {
    id: 'coconut',
    name: 'Coconut',
    radius: 40,
    points: 3,
    splashColor: '#ffffff',
    juiceColor: 'rgba(255, 255, 255, 0.85)',
    pitch: 0.85,
    weight: 10
  },
  GOLDEN_DRAGON: {
    id: 'golden_dragon',
    name: 'Golden Dragonfruit',
    radius: 42,
    points: 50,
    splashColor: '#ffeaa7',
    juiceColor: 'rgba(255, 234, 167, 0.95)',
    pitch: 1.4,
    weight: 2, // Rare spawn
    isRare: true
  },
  BOMB: {
    id: 'bomb',
    name: 'Bomb',
    radius: 36,
    points: 0,
    splashColor: '#2d3436',
    juiceColor: 'rgba(255, 71, 87, 0.9)',
    pitch: 0.5,
    weight: 16,
    isBomb: true
  }
};

class FruitEntity {
  constructor(type, x, y, vx, vy, vRot) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = vRot || (Math.random() - 0.5) * 4;
    this.radius = type.radius;
    this.isSliced = false;
    this.slicedAt = 0;
    this.cutAngle = 0;
    this.fuseTimer = 0; // For bomb spark animation
  }

  update(dt, gravity = 980) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += gravity * dt;
    this.rotation += this.vRot * dt;

    if (this.type.isBomb) {
      this.fuseTimer += dt * 15;
    }
  }

  // Draw the whole (intact) fruit on canvas
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.type.isRare) {
      // Golden shimmering aura
      ctx.save();
      const auraPulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
      const grad = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.5 * auraPulse);
      grad.addColorStop(0, 'rgba(255, 234, 167, 0.6)');
      grad.addColorStop(0.6, 'rgba(255, 165, 2, 0.3)');
      grad.addColorStop(1, 'rgba(255, 165, 2, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.5 * auraPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    switch (this.type.id) {
      case 'watermelon':
        this.drawWatermelon(ctx);
        break;
      case 'orange':
        this.drawOrange(ctx);
        break;
      case 'apple':
        this.drawApple(ctx);
        break;
      case 'banana':
        this.drawBanana(ctx);
        break;
      case 'strawberry':
        this.drawStrawberry(ctx);
        break;
      case 'pineapple':
        this.drawPineapple(ctx);
        break;
      case 'coconut':
        this.drawCoconut(ctx);
        break;
      case 'golden_dragon':
        this.drawGoldenDragon(ctx);
        break;
      case 'bomb':
        this.drawBomb(ctx);
        break;
      default:
        this.drawDefault(ctx);
    }

    ctx.restore();
  }

  // Procedural Watermelon Whole
  drawWatermelon(ctx) {
    const r = this.radius;

    // Green Striped Sphere
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#2ed573');
    grad.addColorStop(0.7, '#10ac84');
    grad.addColorStop(1, '#0b7559');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Dark wavy stripes
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = '#055640';
    ctx.lineWidth = 6;
    for (let i = -r + 8; i < r; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, -r);
      ctx.bezierCurveTo(i - 8, -r * 0.3, i + 8, r * 0.3, i, r);
      ctx.stroke();
    }
    ctx.restore();

    // Specular Highlight
    this.drawGlossHighlight(ctx, -r * 0.3, -r * 0.35, r * 0.45);
  }

  // Procedural Orange Whole
  drawOrange(ctx) {
    const r = this.radius;

    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#ffa502');
    grad.addColorStop(0.8, '#ff793f');
    grad.addColorStop(1, '#d35400');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Little top stem & leaf
    ctx.fillStyle = '#218c74';
    ctx.beginPath();
    ctx.ellipse(0, -r + 2, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#33d9b2';
    ctx.beginPath();
    ctx.ellipse(5, -r, 8, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    this.drawGlossHighlight(ctx, -r * 0.3, -r * 0.35, r * 0.4);
  }

  // Procedural Apple Whole
  drawApple(ctx) {
    const r = this.radius;

    // Apple contour with dimpled top & bottom
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.bezierCurveTo(r * 0.6, -r * 1.05, r * 1.15, -r * 0.2, r * 0.9, r * 0.6);
    ctx.bezierCurveTo(r * 0.65, r * 1.05, r * 0.2, r * 0.95, 0, r * 0.85);
    ctx.bezierCurveTo(-r * 0.2, r * 0.95, -r * 0.65, r * 1.05, -r * 0.9, r * 0.6);
    ctx.bezierCurveTo(-r * 1.15, -r * 0.2, -r * 0.6, -r * 1.05, 0, -r * 0.7);
    ctx.closePath();

    const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.2, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#ff5252');
    grad.addColorStop(0.7, '#c0392b');
    grad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#573d1c';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.quadraticCurveTo(4, -r * 1.1, 8, -r * 1.25);
    ctx.stroke();

    // Green Leaf
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.ellipse(8, -r * 0.95, 9, 4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    this.drawGlossHighlight(ctx, -r * 0.3, -r * 0.3, r * 0.4);
    ctx.restore();
  }

  // Procedural Banana Whole
  drawBanana(ctx) {
    const r = this.radius;
    ctx.save();

    // Curved crescent
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, -r * 0.5);
    ctx.quadraticCurveTo(0, -r * 0.8, r * 1.1, -r * 0.2);
    ctx.quadraticCurveTo(0, r * 0.9, -r * 1.1, -r * 0.5);
    ctx.closePath();

    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, '#f9ca24');
    grad.addColorStop(0.8, '#f1c40f');
    grad.addColorStop(1, '#e1b12c');
    ctx.fillStyle = grad;
    ctx.fill();

    // Green tip & brown stem
    ctx.fillStyle = '#26de81';
    ctx.beginPath();
    ctx.ellipse(-r * 1.05, -r * 0.48, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#573d1c';
    ctx.beginPath();
    ctx.ellipse(r * 1.05, -r * 0.18, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Banana ridge line
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, -r * 0.45);
    ctx.quadraticCurveTo(0, 0.1, r * 0.95, -r * 0.15);
    ctx.stroke();

    ctx.restore();
  }

  // Procedural Strawberry Whole
  drawStrawberry(ctx) {
    const r = this.radius;
    ctx.save();

    // Heart / cone body
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.bezierCurveTo(r * 0.9, -r * 0.6, r * 0.85, r * 0.3, 0, r);
    ctx.bezierCurveTo(-r * 0.85, r * 0.3, -r * 0.9, -r * 0.6, 0, -r * 0.6);
    ctx.closePath();

    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 5, 0, 0, r);
    grad.addColorStop(0, '#ff4757');
    grad.addColorStop(0.8, '#ee5253');
    grad.addColorStop(1, '#b33939');
    ctx.fillStyle = grad;
    ctx.fill();

    // Yellow Seed Specks
    ctx.fillStyle = '#fed330';
    const seeds = [
      [-r * 0.35, -r * 0.2], [r * 0.35, -r * 0.2], [0, -r * 0.1],
      [-r * 0.4, 0.1 * r], [r * 0.4, 0.1 * r], [-r * 0.2, 0.35 * r],
      [r * 0.2, 0.35 * r], [0, 0.6 * r]
    ];
    seeds.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 1.8, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Calyx / Leaves top
    ctx.fillStyle = '#26de81';
    for (let a = -0.8; a <= 0.8; a += 0.4) {
      ctx.save();
      ctx.translate(0, -r * 0.6);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -6, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    this.drawGlossHighlight(ctx, -r * 0.25, -r * 0.25, r * 0.35);
    ctx.restore();
  }

  // Procedural Pineapple Whole
  drawPineapple(ctx) {
    const r = this.radius;
    ctx.save();

    // Body oval
    ctx.beginPath();
    ctx.ellipse(0, 4, r * 0.8, r * 0.95, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(0, -r, 0, r);
    grad.addColorStop(0, '#f1c40f');
    grad.addColorStop(0.7, '#e67e22');
    grad.addColorStop(1, '#d35400');
    ctx.fillStyle = grad;
    ctx.fill();

    // Diamond criss-cross skin
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(120, 50, 0, 0.35)';
    ctx.lineWidth = 2.5;
    for (let x = -r * 1.5; x < r * 1.5; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x - r, -r * 1.2);
      ctx.lineTo(x + r, r * 1.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + r, -r * 1.2);
      ctx.lineTo(x - r, r * 1.2);
      ctx.stroke();
    }
    ctx.restore();

    // Spiky green top leaves
    ctx.fillStyle = '#10ac84';
    [-0.5, -0.25, 0, 0.25, 0.5].forEach(ang => {
      ctx.save();
      ctx.translate(0, -r * 0.85);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, -22);
      ctx.lineTo(0, -28);
      ctx.lineTo(7, -22);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    this.drawGlossHighlight(ctx, -r * 0.25, -r * 0.2, r * 0.35);
    ctx.restore();
  }

  // Procedural Coconut Whole
  drawCoconut(ctx) {
    const r = this.radius;
    ctx.save();

    // Rough brown hairy circle
    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#784e2a');
    grad.addColorStop(0.8, '#52341b');
    grad.addColorStop(1, '#382210');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Three coconut "eyes"
    ctx.fillStyle = '#27170a';
    ctx.beginPath();
    ctx.arc(-8, -12, 4, 0, Math.PI * 2);
    ctx.arc(8, -12, 4, 0, Math.PI * 2);
    ctx.arc(0, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Coconut fibrous hair strands
    ctx.strokeStyle = '#422814';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const x1 = Math.cos(a) * (r - 4);
      const y1 = Math.sin(a) * (r - 4);
      const x2 = Math.cos(a) * (r + 4);
      const y2 = Math.sin(a) * (r + 4);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Procedural Golden Dragonfruit Whole
  drawGoldenDragon(ctx) {
    const r = this.radius;
    ctx.save();

    // Bright golden scaled oval
    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 5, 0, 0, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#f9ca24');
    grad.addColorStop(0.8, '#f0932b');
    grad.addColorStop(1, '#eb4d4b');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dragon scales / wavy petal leaves
    ctx.fillStyle = '#badc58';
    [-0.7, -0.35, 0, 0.35, 0.7].forEach((rot, idx) => {
      ctx.save();
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.9);
      ctx.quadraticCurveTo(8, -r * 1.25, 0, -r * 1.4);
      ctx.quadraticCurveTo(-8, -r * 1.25, 0, -r * 0.9);
      ctx.fill();
      ctx.restore();
    });

    this.drawGlossHighlight(ctx, -r * 0.2, -r * 0.25, r * 0.45);
    ctx.restore();
  }

  // Procedural Bomb Whole with Animated Fuse Spark
  drawBomb(ctx) {
    const r = this.radius;
    ctx.save();

    // Black Metallic Sphere
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, '#636e72');
    grad.addColorStop(0.5, '#2d3436');
    grad.addColorStop(1, '#000000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Metal collar ring at fuse base
    ctx.fillStyle = '#b2bec3';
    ctx.beginPath();
    ctx.roundRect(-7, -r - 4, 14, 6, 2);
    ctx.fill();

    // Twisted fuse rope
    ctx.strokeStyle = '#e17055';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r - 4);
    ctx.quadraticCurveTo(12, -r - 18, 16, -r - 26);
    ctx.stroke();

    // Fuse tip coordinates
    const fuseX = 16;
    const fuseY = -r - 26;

    // Animated Fuse Spark & Embers
    const sparkR = 7 + Math.sin(this.fuseTimer * 2) * 3;
    const sparkGrad = ctx.createRadialGradient(fuseX, fuseY, 1, fuseX, fuseY, sparkR);
    sparkGrad.addColorStop(0, '#ffffff');
    sparkGrad.addColorStop(0.3, '#f9ca24');
    sparkGrad.addColorStop(0.7, '#ff4757');
    sparkGrad.addColorStop(1, 'rgba(255, 71, 87, 0)');

    ctx.fillStyle = sparkGrad;
    ctx.beginPath();
    ctx.arc(fuseX, fuseY, sparkR, 0, Math.PI * 2);
    ctx.fill();

    // Little flying spark rays
    ctx.strokeStyle = '#ffa502';
    ctx.lineWidth = 2;
    for (let s = 0; s < 4; s++) {
      const a = (this.fuseTimer * 3 + s * (Math.PI / 2)) % (Math.PI * 2);
      const len = 6 + (s % 3) * 4;
      ctx.beginPath();
      ctx.moveTo(fuseX, fuseY);
      ctx.lineTo(fuseX + Math.cos(a) * len, fuseY + Math.sin(a) * len);
      ctx.stroke();
    }

    // Hazard skull / danger symbol on bomb body
    ctx.fillStyle = 'rgba(255, 71, 87, 0.85)';
    ctx.font = `bold ${Math.round(r * 0.7)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☠️', 0, 2);

    this.drawGlossHighlight(ctx, -r * 0.35, -r * 0.35, r * 0.35);
    ctx.restore();
  }

  // Generic fallback shape
  drawDefault(ctx) {
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Common 3D Glass / Specular Highlight
  drawGlossHighlight(ctx, x, y, radius) {
    const gloss = ctx.createRadialGradient(x, y, 1, x, y, radius);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    gloss.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Sliced Fruit Half Entity
 * Represents one of the two pieces flying apart after a successful cut.
 */
class SlicedFruitHalf {
  constructor(type, x, y, vx, vy, vRot, cutAngle, side) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.rotation = cutAngle;
    this.vRot = vRot;
    this.radius = type.radius;
    this.cutAngle = cutAngle;
    this.side = side; // -1 for left/top, 1 for right/bottom
    this.alpha = 1.0;
  }

  update(dt, gravity = 980) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += gravity * dt;
    this.rotation += this.vRot * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Clip to one semi-circle half along cut line
    ctx.beginPath();
    if (this.side < 0) {
      ctx.arc(0, 0, this.radius + 10, Math.PI, 0, false);
    } else {
      ctx.arc(0, 0, this.radius + 10, 0, Math.PI, false);
    }
    ctx.closePath();
    ctx.clip();

    // Render internal juicy pulp & rind
    this.drawFleshAndRind(ctx);

    ctx.restore();
  }

  drawFleshAndRind(ctx) {
    const r = this.radius;

    switch (this.type.id) {
      case 'watermelon': {
        // Green outer skin
        ctx.fillStyle = '#10ac84';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // White rind
        ctx.fillStyle = '#f1f2f6';
        ctx.beginPath();
        ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
        ctx.fill();

        // Red juicy pulp
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
        ctx.fill();

        // Seeds
        ctx.fillStyle = '#2f3542';
        [-r * 0.45, -r * 0.2, 0, r * 0.2, r * 0.45].forEach((sx) => {
          const sy = this.side < 0 ? -r * 0.35 : r * 0.35;
          ctx.beginPath();
          ctx.ellipse(sx, sy, 2, 4, 0.2, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'orange': {
        // Orange peel
        ctx.fillStyle = '#ff793f';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // White pith
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
        ctx.fill();

        // Citrus segments
        ctx.fillStyle = '#ffa502';
        ctx.beginPath();
        ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
        ctx.fill();

        // Star spokes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * (r - 7), Math.sin(ang) * (r - 7));
          ctx.stroke();
        }
        break;
      }

      case 'apple': {
        // Red skin
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Cream flesh
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Core & seeds
        ctx.fillStyle = '#573d1c';
        ctx.beginPath();
        ctx.ellipse(0, this.side < 0 ? -6 : 6, 2.5, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'coconut': {
        // Brown shell
        ctx.fillStyle = '#52341b';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Thick white coconut meat
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r - 5, 0, Math.PI * 2);
        ctx.fill();

        // Dark hollow center
        ctx.fillStyle = '#1e272e';
        ctx.beginPath();
        ctx.arc(0, 0, r - 15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'golden_dragon': {
        // Golden skin
        ctx.fillStyle = '#f0932b';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Glowing white/gold flesh
        ctx.fillStyle = '#fff9e6';
        ctx.beginPath();
        ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
        ctx.fill();

        // Black dragonfruit seeds
        ctx.fillStyle = '#1e272e';
        for (let k = 0; k < 12; k++) {
          const kx = (Math.random() - 0.5) * (r * 1.2);
          const ky = this.side < 0 ? -Math.random() * (r * 0.7) : Math.random() * (r * 0.7);
          ctx.beginPath();
          ctx.arc(kx, ky, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      default: {
        // Generic pulp
        ctx.fillStyle = this.type.splashColor;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.type.splashColor;
        ctx.beginPath();
        ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
