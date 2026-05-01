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
let coinTimer = 0;
let enemySpawnTimer = 0;
let lastTime = 0;
let deltaTime = 0;
let score = 0;
let gameOver = false;
const playerImg = new Image();
playerImg.src = "Sprite-0001.png";

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

window.addEventListener("keydown", e => e.key == "r" ? location.reload() : null);

const player = {
  x: 200,
  y: 200,
  size: 100,
  auraRadius: 200,
  speed: 2
};

function spawnEnemy(){
  enemies.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    health: 100,
    hurtTimer: 0,
    size: 20,
    speed: 0.5
  })
}
function spawnCoin() {
  coins.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 10
  });
}
function isColliding(a, b) {
  return (
    a.x < b.x + b.size &&
    a.x + a.size > b.x &&
    a.y < b.y + b.size &&
    a.y + a.size > b.y
  );
}
function update(dt) {
  if (gameOver) return
  if (keys["w"]){
    if (player.y > 0 ){
        player.y -= player.speed;
    } else {
        player.y = canvas.height - player.size;
    }
  } 
  if (keys["s"]){
    if (player.y < canvas.height - player.size){
        player.y += player.speed;
    } else {        
      player.y = 0;
    }
  }
  if (keys["a"]){
    if (player.x > 0){
      player.x -= player.speed;
    } else {
      player.x = canvas.width - player.size;
    }
  }
  if (keys["d"]){
    if( player.x < canvas.width - player.size){
      player.x += player.speed
    } else{
      player.x = 0;
    }
  }
  for (let e of enemies) {
    let dx = player.x - e.x;
    let dy = player.y - e.y;

    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      e.x += (dx / dist) * e.speed;
      e.y += (dy / dist) * e.speed;
    }
    
    if (dist < player.auraRadius ) {
      e.hurtTimer += dt;
    }
    if( dist < player.auraRadius && e.hurtTimer > 0.5 ){
      console.log(e.health, e.hurtTimer);
      e.health -= 5;
      e.hurtTimer = 0;
    }
    if(dist > player.auraRadius){
      e.hurtTimer = 0;
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
  if (enemySpawnTimer > 10) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }
  for (let i = coins.length - 1; i >= 0; i--) {
    if (isColliding(player, coins[i])) {
      coins.splice(i, 1);
      score++;
    }
  }
}


function draw() {
ctx.fillStyle = grassPattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = player.x + player.size / 2;
  const centerY = player.y + player.size / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2); 

  ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; 
  ctx.fill();
  ctx.closePath();
  ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

  ctx.fillStyle = "blue";
  for (let e of enemies) {
    ctx.fillStyle = e.hurtTimer > 0.25 ? "white" : "blue";
    ctx.fillRect(e.x, e.y, e.size, e.size);
  }
  
  ctx.fillStyle = "gold";
  for (let c of coins) {
    ctx.fillRect(c.x, c.y, c.size, c.size);
  }

  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 20, 30);
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