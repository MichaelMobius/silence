// --- VIDEOJUEGO-POEMA: SILENCE / NOISE ---
// Fondo RGB(71,31,85)
// Letras "silence" RGB(0,255,0)
// Bola y arco "noise" RGB(197,0,63)
// Fuente personalizada: discodeck.ttf
// Pantalla completa + 3 vidas (😊) + score
// Reinicia al click tras GAME OVER
// Sonido "shhh.mp3" al tocar una letra

let bricks = [];
let ball;
let paddle;
let fuente;
let shhh;  // sonido

let palabraSilencio = "silence";
let ruidoKanji = "o";     // símbolo del ruido (bola)
let barraTexto  = "noise";

let vidas = 3;
let score = 0;
let gameOver = false;

// ---- Cargar la fuente y el audio antes de iniciar ----
function preload() {
  fuente = loadFont('discodeck.ttf');
  shhh   = loadSound('sssh.mp3');  // asegúrate de subir este archivo al sketch
}

function setup() {
  createCanvas(windowWidth, windowHeight);  // pantalla completa
  textAlign(CENTER, CENTER);
  textFont(fuente);
  noStroke();

  iniciarJuego();
}

function iniciarJuego() {
  crearPoemaComoBricks();
  vidas = 3;
  score = 0;
  gameOver = false;
  ball = { x: width / 2, y: height / 2, vx: 4, vy: -4, r: 16 };

  textSize(48);
  let wTexto = textWidth(barraTexto);
  paddle = {
    x: width / 2,
    y: height - 60,
    w: wTexto + 20,
    h: 48
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iniciarJuego();
}

function draw() {
  background(71, 31, 85); // fondo morado oscuro

  if (gameOver) {
    drawBricks();
    drawPaddle();
    drawBall();
    drawHUD();
    drawGameOver();
    return;
  }

  actualizarBarra();
  actualizarBola();

  drawBricks();
  drawPaddle();
  drawBall();
  drawHUD();
}

// ------------------- POEMA → LADRILLOS -------------------

function crearPoemaComoBricks() {
  bricks = [];

  let filasY = [
    0.28 * height,
    0.38 * height,
    0.48 * height,
    0.58 * height,
    0.68 * height
  ];
  let columnasX = [
    0.25 * width,
    0.4375 * width,
    0.625 * width
  ];
  let espLetra = 18 * (width / 800);

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {

      // hueco central
      if (r === 2 && c === 1) continue;

      for (let i = 0; i < palabraSilencio.length; i++) {
        let ch = palabraSilencio[i];
        let x  = columnasX[c] + i * espLetra;
        let y  = filasY[r];
        bricks.push({ x, y, char: ch, alive: true });
      }
    }
  }
}

function drawBricks() {
  fill(0, 255, 0); // verde
  textSize(28);
  for (let b of bricks) {
    if (b.alive) {
      text(b.char, b.x, b.y);
    }
  }
}

// ------------------- BARRA: UNA sola "noise" -------------------

function actualizarBarra() {
  if (keyIsDown(LEFT_ARROW))  paddle.x -= 6;
  if (keyIsDown(RIGHT_ARROW)) paddle.x += 6;
  paddle.x = constrain(paddle.x, paddle.w / 2, width - paddle.w / 2);
}

function drawPaddle() {
  fill(197, 0, 63); // color del ruido
  textSize(48);
  text(barraTexto, paddle.x, paddle.y);
}

// ------------------- BOLA -------------------

function actualizarBola() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0 || ball.x + ball.r > width) ball.vx *= -1;
  if (ball.y - ball.r < 0) ball.vy *= -1;

  if (ball.y - ball.r > height) {
    vidas--;
    if (vidas <= 0) {
      gameOver = true;
      return;
    }
    ball.x = width / 2;
    ball.y = height / 2;
    ball.vx = random([-4, 4]);
    ball.vy = -4;
  }

  let halfW = paddle.w / 2;
  let halfH = paddle.h / 2;
  if (
    ball.x > paddle.x - halfW &&
    ball.x < paddle.x + halfW &&
    ball.y + ball.r > paddle.y - halfH &&
    ball.y - ball.r < paddle.y + halfH
  ) {
    ball.vy *= -1;
    let diff = ball.x - paddle.x;
    ball.vx = diff * 0.08;
    ball.y  = paddle.y - halfH - ball.r - 1;
  }

  // Colisión con las letras de "silence"
  for (let b of bricks) {
    if (!b.alive) continue;
    if (dist(ball.x, ball.y, b.x, b.y) < 20) {
      b.alive = false;
      ball.vy *= -1;
      score++;

      // 🔊 reproducir sonido shhh al romper una letra
      if (shhh && shhh.isLoaded()) {
        shhh.play();
      }

      break;
    }
  }
}

function drawBall() {
  fill(197, 0, 63);
  textSize(40);
  text(ruidoKanji, ball.x, ball.y);
}

// ------------------- HUD: VIDAS + SCORE -------------------

function drawHUD() {
  push();
  textFont('sans-serif');
  textAlign(LEFT, CENTER);

  let hudX = 50;
  let hudY = 60;
  let spacing = 35;

  textSize(28);
  for (let i = 0; i < vidas; i++) {
    text("😊", hudX + i * spacing, hudY);
  }

  textSize(20);
  textFont(fuente);  
  text("Score: " + score, hudX, hudY + 30);

  pop();
}

// ------------------- GAME OVER -------------------

function drawGameOver() {
  push();
  textFont(fuente);
  textAlign(CENTER, CENTER);
  fill(236, 152, 0); // color del GAME OVER
  textSize(48);
  text("GAME OVER", width / 2, height / 2);
  textSize(24);
  text("Score: " + score, width / 2, height / 2 + 40);
  textSize(20);
  text("click to restart", width / 2, height / 2 + 80);
  pop();
}

// ------------------- REINICIO CON CLIC -------------------

function mousePressed() {
  if (gameOver) {
    iniciarJuego();
  }
}
