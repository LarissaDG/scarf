let particles = []; 
let chaosLevel = 1;
let glitchActive = false;
let buttons = {};
let particleSlider;

let glitchOptions = {
  velocity: false,
  walkStyle: false,
  personality: false,
  infectionRate: false,
};

const COLORS = [
  { name: 'green', color: '#39FF14' },
  { name: 'yellow', color: '#FFFF00' },
  { name: 'orange', color: '#FFA500' },
  { name: 'pink', color: '#FF69B4' },
  { name: 'white', color: '#FFFFFF' },
];

const PERSONALITIES = ["😄", "😢", "😡", "🍺"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  createUI();
  spawnParticles(300); // default

  frameRate(60);
}

function createUI() {
  createButton("📸 Capture").position(20, 20).mousePressed(() => saveCanvas("glitch-art", "png"));

  createButton("➕ Chaos +").position(120, 20).mousePressed(() => chaosLevel++);
  createButton("➖ Chaos -").position(200, 20).mousePressed(() => chaosLevel = max(0, chaosLevel - 1));

  buttons.antidote = createButton("🧴 Antidote").position(20, 60).mousePressed(clearAllGlitches);

  createToggle("1️⃣ Velocity", '1', 'velocity', 20, 100);
  createToggle("2️⃣ Walk", '2', 'walkStyle', 20, 140);
  createToggle("3️⃣ Personality", '3', 'personality', 20, 180);
  createToggle("4️⃣ Infection", '4', 'infectionRate', 20, 220);

  let particleSlider = createSpan("Particles: ").position(20, 270);
  particleSlider.style('color', 'white'); // <-- texto branco
  particleSlider = createSlider(1, 500, 300, 1);
  particleSlider.position(90, 270);
  particleSlider.input(() => spawnParticles(particleSlider.value()));
}

function draw() {
  fill(0, 10);
  rect(0, 0, width, height);

  for (let p of particles) {
    p.update();
    p.display();
  }

  updateButtonStates();
}

function mousePressed() {
  glitchActive = true;
  for (let p of particles) {
    if (dist(mouseX, mouseY, p.pos.x, p.pos.y) < 80) {
      p.glitch();
    }
  }
}

function keyPressed() {
  if (key === '+') chaosLevel++;
  if (key === '-') chaosLevel = max(0, chaosLevel - 1);
  if (key === 'A' || key === 'a') clearAllGlitches();
  if (['1','2','3','4'].includes(key)) toggleGlitchFromKey(key);
}

function clearAllGlitches() {
  glitchActive = false;
  for (let p of particles) p.cure();
}

class Pixel {
  constructor(x, y, personality, colorGroup) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.size = 6;
    this.bugged = false;
    this.personality = personality;
    this.colorGroup = colorGroup;
    this.originalColor = color(colorGroup.color);
    this.c = this.originalColor;
  }

  update() {
    if (this.bugged) {
      this.glitchBehavior();
    } else {
      this.pos.add(this.vel.copy().mult(0.5 + chaosLevel * 0.3));
    }
    this.wrap();
  }

  glitchBehavior() {
    if (glitchOptions.velocity) {
      this.vel.add(p5.Vector.random2D().mult(0.5 * chaosLevel));
    }

    if (glitchOptions.walkStyle) {
      this.pos.x += sin(frameCount * 0.3) * 2;
      this.pos.y += cos(frameCount * 0.2) * 2;
    }

    if (glitchOptions.personality && frameCount % 40 === 0) {
      this.personality = random(PERSONALITIES);
    }

    this.c = color(random(255), random(255), random(255));

    if (glitchOptions.infectionRate) {
      for (let other of particles) {
        if (!other.bugged && dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < 40) {
          if (random() < 0.01 * chaosLevel) {
            other.glitch();
          }
        }
      }
    }

    this.pos.add(p5.Vector.random2D().mult(1));
  }

  display() {
    fill(this.c);
    circle(this.pos.x, this.pos.y, this.size);
    if (this.bugged && glitchOptions.personality) {
      textSize(12);
      fill(255);
      text(this.personality, this.pos.x + 6, this.pos.y - 6);
    }
  }

  wrap() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  glitch() {
    this.bugged = true;
  }

  cure() {
    this.bugged = false;
    this.c = this.originalColor;
  }
}

function spawnParticles(count) {
  particles = [];
  for (let i = 0; i < count; i++) {
    let x = random(width);
    let y = random(height);
    let personality = random(PERSONALITIES);
    let colorGroup = random(COLORS);
    particles.push(new Pixel(x, y, personality, colorGroup));
  }
}

function createToggle(label, keyText, key, x, y) {
  buttons[key] = createButton(`${label} [${keyText}]`);
  buttons[key].position(x, y);
  buttons[key].mousePressed(() => toggleGlitch(key));
}

function toggleGlitch(key) {
  glitchOptions[key] = !glitchOptions[key];
  updateButtonStates();
}

function toggleGlitchFromKey(keyStr) {
  let map = { '1': 'velocity', '2': 'walkStyle', '3': 'personality', '4': 'infectionRate' };
  toggleGlitch(map[keyStr]);
}

function updateButtonStates() {
  for (let key in glitchOptions) {
    if (glitchOptions[key]) {
      buttons[key].style('background-color', '#aaa');
    } else {
      buttons[key].style('background-color', '');
    }
  }
}
