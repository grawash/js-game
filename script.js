const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const grassCanvas = document.createElement("canvas");
const gCtx = grassCanvas.getContext("2d");
grassCanvas.width = 64;
grassCanvas.height = 64;

gCtx.fillStyle = "#4a7c44"; 
gCtx.fillRect(0, 0, 64, 64);

gCtx.fillStyle = "#3d6638";
gCtx.fillRect(10, 15, 4, 10);
gCtx.fillRect(35, 40, 4, 10);
gCtx.fillRect(50, 10, 4, 10);

const grassPattern = ctx.createPattern(grassCanvas, "repeat");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};
let enemies = [];
const coins = [];
const weapons = ["aura", "gun"];
let projectiles = [];
let coinTimer = 0;
let enemySpawnTimer = 0;
let lastTime = 0;
let deltaTime = 0;
let score = 0;
let gameOver = false;
const playerImg = new Image();
const coinImg = new Image();
const shuriken = new Image();
shuriken.src = "shuriken.png";
playerImg.src = "Sprite-0002.png";
const imgFront = "Sprite-0002.png"
const imgFrontRun1 = "Sprite-0003.png"
const imgFrontRun2 = "Sprite-0004.png"
const imgRight1 = "Sprite-0005.png"
const imgRight2 = "Sprite-0006.png"
const imgLeft1 = "Sprite-0007.png"
const imgLeft2 = "Sprite-0008.png"
const imgBack = "Sprite-0009.png"
const imgBackRun1 = "Sprite-0010.png"
const imgBackRun2 = "Sprite-0011.png"
coinImg.src = "coin.png"
const enemyImg1 = new Image();
enemyImg1.src = "enemy1.png";
const enemyImg2 = new Image();
enemyImg2.src = "enemy2.png";
const enemyHurtImg = new Image();
enemyHurtImg.src = "enemy3.png";




window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

window.addEventListener("keydown", e => e.key == "r" ? location.reload() : null);

window.addEventListener("mousedown", e => {
  shoot(e);
});

const player = {
  x: 200,
  y: 200,
  size: 100,
  collisionSize: 60,
  auraRadius: 200,
  damage:10,
  exp: 0,
  expThreshold: 100,
  level: 1,
  weapon: "aura",
  firing: false,
  speed: 2,
  frameTime: 0,
  currentFrame: 0
};

function spawnEnemy(){
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    health: 100,
    hurtTimer: 0,
    hurtTime: 0,
    size: 30,
    speed: 0.5,
    spriteTimer: 0,
    direction: "front",
    currentFrame: 0,
    frameTime: 0
  })
}
function spawnCoin(x = 0, y = 0) {
  coins.push({
    x: x ? x : Math.random() * canvas.width,
    y: y ? y : Math.random() * canvas.height,
    size: 15
  });
}
function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.collisionSize > b.x &&
    a.y < b.y + b.size &&
    a.y + a.collisionSize > b.y
  );
}

function shoot(e) {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const playerCenterX = player.x + player.collisionSize / 2;
  const playerCenterY = player.y + player.collisionSize / 2;

  let dx = mouseX - playerCenterX;
  let dy = mouseY - playerCenterY;

  let dist = Math.sqrt(dx * dx + dy * dy);

  dx /= dist;
  dy /= dist;

  projectiles.push({
    x: playerCenterX,
    y: playerCenterY,
    dx: dx,
    dy: dy,
    speed: 6,
    size: 15,
    damage: 25
  });
}

function update(dt) {
  if (gameOver) return
  let moving = false;

  if (keys["w"]) {
    player.y = player.y > 0 ? player.y - player.speed : canvas.height - player.size;
    player.direction = "back";
    moving = true;
  }
  if (keys["s"]) {
    player.y = player.y < canvas.height - player.size ? player.y + player.speed : 0;
    player.direction = "front";
    moving = true;
  }
  if (keys["a"]) {
    player.x = player.x > 0 ? player.x - player.speed : canvas.width - player.size;
    player.direction = "left";
    moving = true;
  }
  if (keys["d"]) {
    player.x = player.x < canvas.width - player.size ? player.x + player.speed : 0;
    player.direction = "right";
    moving = true;
  }

  if (moving) {
    player.frameTime += dt;

    if (player.frameTime > 0.3) {
      player.frameTime = 0;
      player.currentFrame = player.currentFrame === 0 ? 1 : 0;
    }
  } else {
    player.currentFrame = 0;
  }

  if (player.direction === "front") {
    playerImg.src = player.currentFrame === 0 ? imgFrontRun1 : imgFrontRun2;
  }
  if (player.direction === "back") {
    playerImg.src = player.currentFrame === 0 ? imgBackRun1 : imgBackRun2;
  }
  if (player.direction === "left") {
    playerImg.src = player.currentFrame === 0 ? imgLeft1 : imgLeft2;
  }
  if (player.direction === "right") {
    playerImg.src = player.currentFrame === 0 ? imgRight1 : imgRight2;
  }
  for (let e of enemies) {
    const playerCenterX = player.x + player.collisionSize / 2;
    const playerCenterY = player.y + player.collisionSize / 2;

    let dx = playerCenterX - e.x;
    let dy = playerCenterY - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      e.x += (dx / dist) * e.speed;
      e.y += (dy / dist) * e.speed;
    }
    
    if (dist < player.auraRadius ) {
      e.hurtTimer += dt;
    }
    if( dist < player.auraRadius && e.hurtTimer > 0.3 ){
      e.health -= player.damage + (player.damage / 20) * player.level;
      e.hurtTime = 0.3;
      e.hurtTimer = 0;
    }
    if(dist > player.auraRadius){
      e.hurtTimer = 0;
    }
    e.spriteTimer += dt;
    if(e.spriteTimer > 0.5){
      e.frame === 0 ? e.frame = 1 : e.frame = 0;
      e.spriteTimer = 0;
    }
    if(e.health <= 0){
      spawnCoin(e.x, e.y);
    }
    if(player.exp == player.expThreshold){
      player.level += 1;
      player.exp = 0;
      player.expThreshold += 20;
    }
    if (e.hurtTime > 0) {
      e.hurtTime -= dt;
    }
    if (isColliding(player, e)){
      gameOver = true;
    }
  }
  enemies = enemies.filter(e => e.health > 0);
  coinTimer += dt;
  enemySpawnTimer += dt;
  if (coinTimer > 4) {
    spawnCoin();
    coinTimer = 0;
  }
  const minSpawnTime = 1.5;
  const maxSpawnTime = 10;

  const spawnInterval = minSpawnTime + (maxSpawnTime - minSpawnTime) / (1 + player.level);

  if (enemySpawnTimer > spawnInterval) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }
  for (let i = coins.length - 1; i >= 0; i--) {
    if (isColliding(player, coins[i])) {
      coins.splice(i, 1);
      score++;
      player.exp+=10
      console.log(player.exp)
    }
  }
  for (let p of projectiles) {
    p.x += p.dx * p.speed;
    p.y += p.dy * p.speed;
  }
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];

    for (let j = enemies.length - 1; j >= 0; j--) {
      let e = enemies[j];

      if (
        p.x < e.x + e.size &&
        p.x + p.size > e.x &&
        p.y < e.y + e.size &&
        p.y + p.size > e.y
      ) {
        e.health -= p.damage;
        e.hurtTime = 0.3;
        projectiles.splice(i, 1);
        break;
      }
    }
  }
  projectiles = projectiles.filter(p =>
    p.x > 0 &&
    p.x < canvas.width &&
    p.y > 0 &&
    p.y < canvas.height
  );
}


function draw() {
ctx.fillStyle = grassPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = player.x + player.collisionSize / 2;
  const centerY = player.y + player.collisionSize / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, player.auraRadius, 0, Math.PI * 2); 

  ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; 
  ctx.fill();
  ctx.closePath();
  const offset = (player.size - player.collisionSize) / 2;
  ctx.drawImage(playerImg, player.x-offset, player.y-offset, player.size, player.size);

  for (let e of enemies) {
    //ctx.fillStyle = e.hurtTimer > 0.25 ? "white" : "blue";
    let img;

    if (e.hurtTime > 0) {
      img = enemyHurtImg;
    } else {
      img = e.frame === 0 ? enemyImg1 : enemyImg2;
    }

    ctx.drawImage(img, e.x, e.y, e.size, e.size);
    //ctx.drawImage(enemyImg, e.x, e.y, e.size, e.size);
  }
  
  for (let c of coins) {
    ctx.drawImage(coinImg, c.x, c.y, c.size, c.size);
  }

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillStyle = "white";
  ctx.fillText("level: " + player.level, 70, 30);
  for (let p of projectiles) {
    ctx.drawImage(shuriken, p.x, p.y, p.size, p.size);
  }
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER - Press R to Restart", canvas.width/2 - 50, canvas.height/2);
  }
}

function gameLoop(time = 0) {
  if (!lastTime) lastTime = time;

  deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}
spawnEnemy();
for (let i = 0; i < 5; i++) spawnCoin();;
gameLoop();