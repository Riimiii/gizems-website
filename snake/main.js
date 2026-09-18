// === Slay the Snake – Night Edition ===

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const ovTitle = document.getElementById("ovTitle");
const ovSub = document.getElementById("ovSub");
const ovHint = document.getElementById("ovHint");
const mainBtn = document.getElementById("mainBtn");

const scoreEl = document.getElementById("scoreVal");
const hiEl = document.getElementById("hiVal");
const resetHiBtn = document.getElementById("resetHiBtn");

const TILE = 20;

let W, H, COLS, ROWS;

let state = "menu";

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let apple = { x: 0, y: 0 };

let score = 0;
let hi = parseInt(localStorage.getItem("snakeHi") || "0");

let speed = 130;
let baseSpeed = 130;

let gameTimer = null;
let countdownTimer = null;

let particles = [];
let flashTimer = 0;
let newHi = false;

// ── Canvas Größe ─────────────────────────────

function resize() {
  const arena = document.querySelector(".arena");
  const size = arena.clientWidth;

  canvas.width = size;
  canvas.height = size;

  W = size;
  H = size;

  COLS = Math.floor(W / TILE);
  ROWS = Math.floor(H / TILE);
}

resize();

// ── Hilfsfunktionen ──────────────────────────

function rnd(n) {
  return Math.floor(Math.random() * n);
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r);
  c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h);
  c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r);
  c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

// ── Score ────────────────────────────────────

function updateScore() {
  scoreEl.textContent = score;
  hiEl.textContent = hi;
}

function updateSpeedBar() {
  const lvl = Math.min(4, Math.floor((baseSpeed - speed) / 10));

  for (let i = 0; i < 5; i++) {
    const bar = document.getElementById("sp" + i);
    if (bar) {
      bar.classList.toggle("active", i <= lvl);
    }
  }
}

// ── Apfel ────────────────────────────────────

function placeApple() {
  const freeFields = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const isSnake = snake.some(part => part.x === x && part.y === y);

      if (!isSnake) {
        freeFields.push({ x, y });
      }
    }
  }

  if (freeFields.length === 0) {
    endGame();
    return;
  }

  apple = freeFields[rnd(freeFields.length)];
}

// ── Partikel ─────────────────────────────────

function spawnParticles(x, y) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2;

  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const power = 1.5 + Math.random() * 2.5;

    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power,
      life: 1,
      r: 2 + Math.random() * 3,
      hue: Math.random() < 0.5 ? 300 : 330
    });
  }
}

function drawParticles() {
  particles = particles.filter(p => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= 0.04;

    ctx.globalAlpha = p.life;
    ctx.fillStyle = `hsl(${p.hue}, 80%, 75%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

// ── Zeichnen ─────────────────────────────────

function draw() {
  ctx.fillStyle = "#0a0a10";
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.beginPath();
      ctx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Apfel
  const acx = apple.x * TILE + TILE / 2;
  const acy = apple.y * TILE + TILE / 2;
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 400);

  ctx.save();
  ctx.shadowBlur = 14 * pulse;
  ctx.shadowColor = "#ff6699";
  ctx.fillStyle = "#ff8fc4";
  ctx.beginPath();
  ctx.arc(acx, acy, TILE / 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(acx - 2, acy - 2, TILE / 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Snake Körper
  for (let i = snake.length - 1; i > 0; i--) {
    const part = snake[i];
    const t = 1 - i / snake.length;

    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * t;
    ctx.fillStyle = "#9333ea";
    roundRect(
      ctx,
      part.x * TILE + 1,
      part.y * TILE + 1,
      TILE - 2,
      TILE - 2,
      4
    );
    ctx.fill();
    ctx.restore();
  }

  // Snake Kopf
  const head = snake[0];

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = "#c084fc";
  ctx.fillStyle = "#d4b8ff";
  roundRect(
    ctx,
    head.x * TILE + 1,
    head.y * TILE + 1,
    TILE - 2,
    TILE - 2,
    5
  );
  ctx.fill();
  ctx.restore();

  // Augen
  ctx.fillStyle = "#0a0a10";

  const hx = head.x * TILE + TILE / 2;
  const hy = head.y * TILE + TILE / 2;
  const eyeOff = 3;

  if (direction.x !== 0) {
    ctx.beginPath();
    ctx.arc(hx + direction.x * 3, hy - eyeOff, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hx + direction.x * 3, hy + eyeOff, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(hx - eyeOff, hy + direction.y * 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(hx + eyeOff, hy + direction.y * 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawParticles();

  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashTimer * 0.03})`;
    ctx.fillRect(0, 0, W, H);
    flashTimer--;
  }
}

// ── Spiellogik ───────────────────────────────

function tick() {
  if (state !== "playing") return;

  direction = nextDirection;

  const head = snake[0];

  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };

  // Wand berührt
  if (
    newHead.x < 0 ||
    newHead.x >= COLS ||
    newHead.y < 0 ||
    newHead.y >= ROWS
  ) {
    endGame();
    return;
  }

  const eatsApple = newHead.x === apple.x && newHead.y === apple.y;

  // Wenn kein Apfel gegessen wird, wird das letzte Stück entfernt
  // Dadurch darf man in das alte Schwanzfeld laufen
  const bodyToCheck = eatsApple ? snake : snake.slice(0, -1);

  // Selbst getroffen
  if (bodyToCheck.some(part => part.x === newHead.x && part.y === newHead.y)) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (eatsApple) {
    score++;
    flashTimer = 5;
    spawnParticles(apple.x, apple.y);

    if (score > hi) {
      hi = score;
      localStorage.setItem("snakeHi", hi);
      newHi = true;
    }

    if (score % 3 === 0 && speed > 70) {
      speed = Math.max(70, speed - 8);
    }

    updateScore();
    updateSpeedBar();
    placeApple();
  } else {
    snake.pop();
  }

  draw();

  clearTimeout(gameTimer);
  gameTimer = setTimeout(tick, speed);
}

// ── Spielzustände ────────────────────────────

function initGame() {
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);

  snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  newHi = false;

  baseSpeed = 130;
  speed = baseSpeed;

  particles = [];
  flashTimer = 0;

  placeApple();
  updateScore();
  updateSpeedBar();
}

function startGame() {
  clearTimeout(gameTimer);
  clearInterval(countdownTimer);

  initGame();

  state = "playing";
  overlay.classList.add("hidden");

  draw();
  gameTimer = setTimeout(tick, speed);
}

function endGame() {
  clearTimeout(gameTimer);

  state = "gameover";

  overlay.classList.remove("hidden");

  ovTitle.innerHTML = '<span style="color:#ff8fc4">Game Over</span>';

  ovSub.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:52px;font-weight:700;color:#e0ccff;line-height:1">${score}</div>
      <div style="font-size:10px;letter-spacing:2.5px;color:#4a4058;text-transform:uppercase;margin-top:4px">Score</div>
      ${
        newHi
          ? '<div style="font-size:11px;letter-spacing:2px;color:#c084fc;text-transform:uppercase;margin-top:10px">✦ New Highscore ✦</div>'
          : ""
      }
    </div>
  `;

  mainBtn.textContent = "Play Again";
  mainBtn.style.display = "";
  ovHint.textContent = "Space to restart";

  draw();
}

function showMenu() {
  clearTimeout(gameTimer);
  clearInterval(countdownTimer);

  state = "menu";

  overlay.classList.remove("hidden");

  ovTitle.innerHTML = '<span style="color:#ff8fc4">Slay</span> the Snake';
  ovSub.textContent = "Press ENTER or tap to start";
  mainBtn.textContent = "Start Game";
  mainBtn.style.display = "";
  ovHint.textContent = "Arrow keys to move · Space to restart";

  updateScore();
}

function startCountdown(callback) {
  clearInterval(countdownTimer);

  state = "countdown";

  let n = 3;

  mainBtn.style.display = "none";
  ovSub.textContent = "Get ready!";
  ovTitle.innerHTML = `<span style="font-size:60px;color:#c084fc">${n}</span>`;
  ovHint.textContent = "";

  countdownTimer = setInterval(() => {
    n--;

    if (n === 0) {
      clearInterval(countdownTimer);
      callback();
    } else {
      ovTitle.innerHTML = `<span style="font-size:60px;color:#c084fc">${n}</span>`;
    }
  }, 700);
}

// ── Steuerung ────────────────────────────────

function changeDirection(dx, dy) {
  if (state !== "playing") return;

  // Nicht direkt umdrehen
  if (dx === -direction.x && dy === -direction.y) return;

  nextDirection = { x: dx, y: dy };
}

mainBtn.addEventListener("click", () => {
  if (state === "menu" || state === "gameover") {
    startCountdown(startGame);
  }
});

resetHiBtn.addEventListener("click", () => {
  localStorage.removeItem("snakeHi");
  hi = 0;
  updateScore();

  const oldText = resetHiBtn.innerHTML;
  resetHiBtn.textContent = "✓ Reset!";

  setTimeout(() => {
    resetHiBtn.innerHTML = oldText;
  }, 1500);
});

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    changeDirection(-1, 0);
    e.preventDefault();
  }

  if (e.key === "ArrowRight") {
    changeDirection(1, 0);
    e.preventDefault();
  }

  if (e.key === "ArrowUp") {
    changeDirection(0, -1);
    e.preventDefault();
  }

  if (e.key === "ArrowDown") {
    changeDirection(0, 1);
    e.preventDefault();
  }

  if (e.key === "Enter" && state === "menu") {
    startCountdown(startGame);
  }

  if (e.key === " " && state === "gameover") {
    e.preventDefault();
    startCountdown(startGame);
  }
});

// Touch / Swipe
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener(
  "touchstart",
  e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  e => {
    if (state === "menu") {
      startCountdown(startGame);
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) changeDirection(1, 0);
      else changeDirection(-1, 0);
    } else {
      if (dy > 0) changeDirection(0, 1);
      else changeDirection(0, -1);
    }

    e.preventDefault();
  },
  { passive: false }
);

window.addEventListener("resize", () => {
  resize();

  if (state !== "playing") {
    draw();
  }
});

// ── Start ────────────────────────────────────

hiEl.textContent = hi;
showMenu();
initGame();
draw();