const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const backgroundMusic = document.getElementById("backgroundMusic");
const backgroundMusicSelect = document.getElementById("backgroundMusicSelect");
const timerElement = document.getElementById("timer");
const speedElement = document.getElementById("speed");
const pointsElement = document.getElementById("points");
const levelElement = document.getElementById("level");

const playerImg = new Image();
playerImg.src = 'car.webp'; // Image URL for the car

const emojis = ["🚜", "🐃", "🚗", "🚜"]; // Array of emojis to use as obstacles

let player = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 80,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
};

let obstacles = [];
let bullets = [];
let animationFrameId;
let gamePaused = false;
let timeElapsed = 0;
let gameSpeed = 2;
let points = 0;
let level = 1;
let timerInterval;
let speedInterval;
let pointsInterval;

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x < 0) {
        player.x = 0;
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    if (player.y < 0) {
        player.y = 0;
    } else if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function drawObstacles() {
    ctx.font = "40px Arial";
    obstacles.forEach(obstacle => {
        ctx.fillText(obstacle.emoji, obstacle.x, obstacle.y);
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacle.speed;
        if (obstacle.direction === 'down') {
            obstacle.y += obstacle.dy;
            if (obstacle.y > canvas.height - 40) obstacle.direction = 'up';
        } else {
            obstacle.y -= obstacle.dy;
            if (obstacle.y < 0) obstacle.direction = 'down';
        }

        if (obstacle.x < -40) {
            obstacles.shift();
        }
    });
}

function createObstacle() {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    obstacles.push({
        emoji,
        x: canvas.width,
        y: Math.random() * (canvas.height - 40) + 40,
        speed: gameSpeed,
        dy: 5,
        direction: 'down'
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    });
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;
        if (bullet.x - bullet.radius > canvas.width) {
            bullets.splice(index, 1);
        }
    });
}

function detectCollision() {
    obstacles.forEach((obstacle, obstacleIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            const emojiWidth = 40;
            const emojiHeight = 40;
            if (Math.abs(obstacle.x - bullet.x) < emojiWidth / 2 + bullet.radius &&
                Math.abs(obstacle.y - bullet.y) < emojiHeight / 2 + bullet.radius) {
                obstacles.splice(obstacleIndex, 1);
                bullets.splice(bulletIndex, 1);
                points += 20;
                updatePoints();
            }
        });

        const emojiWidth = 40;
        const emojiHeight = 40;

        if (Math.abs(player.x - obstacle.x) < player.width / 2 + emojiWidth / 2 &&
            Math.abs(player.y - obstacle.y) < player.height / 2 + emojiHeight / 2) {
            endGame();
        }
    });
}

function endGame() {
    cancelAnimationFrame(animationFrameId);
    clearInterval(timerInterval);
    clearInterval(speedInterval);
    clearInterval(pointsInterval);
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    alert(`Game Over! You scored ${points} points.`);
    resetGame();
}

function resetGame() {
    player = {
        x: 50,
        y: canvas.height / 2 - 25,
        width: 80,
        height: 50,
        speed: 5,
        dx: 0,
        dy: 0,
    };
    obstacles = [];
    bullets = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    timeElapsed = 0;
    gameSpeed = 2;
    points = 0;
    level = 1;
    updateTimer();
    updateSpeed();
    updatePoints();
    updateLevel();
}

function updateTimer() {
    timerElement.textContent = `Time: ${timeElapsed}s`;
}

function updateSpeed() {
    speedElement.textContent = `Speed: ${gameSpeed}`;
}

function updatePoints() {
    pointsElement.textContent = `Points: ${points}`;
}

function updateLevel() {
    levelElement.textContent = `Level: ${level}`;
}

function increaseTime() {
    timeElapsed += 1;
    updateTimer();
}

function increaseSpeed() {
    gameSpeed += 0.5;
    obstacles.forEach(obstacle => {
        obstacle.speed = gameSpeed;
    });
    updateSpeed();
}

function increasePoints() {
    points += 10;
    updatePoints();
    if (points % 100 === 0) {
        level += 1;
        updateLevel();
    }
}

function handleKeyDown(event) {
    if (event.key === "ArrowUp" || event.key === "w") {
        player.dy = -player.speed;
    } else if (event.key === "ArrowDown" || event.key === "s") {
        player.dy = player.speed;
    } else if (event.key === "ArrowLeft" || event.key === "a") {
        player.dx = -player.speed;
    } else if (event.key === "ArrowRight" || event.key === "d") {
        player.dx = player.speed;
    } else if (event.key === " ") {
        shootBullet();
    }
}

function handleKeyUp(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "w" || event.key === "s") {
        player.dy = 0;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "a" || event.key === "d") {
        player.dx = 0;
    }
}

function handleArrowDown(direction) {
    if (direction === 'up') {
        player.dy = -player.speed;
    } else if (direction === 'down') {
        player.dy = player.speed;
    } else if (direction === 'left') {
        player.dx = -player.speed;
    } else if (direction === 'right') {
        player.dx = player.speed;
    }
}

function handleArrowUp() {
    player.dx = 0;
    player.dy = 0;
}

function shootBullet() {
    bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        radius: 5,
        speed: 7
    });
}

document.getElementById('shoot-button').addEventListener('click', function() {
    shootBullet();
    document.getElementById('shoot-button').disabled = true;
    setTimeout(function() {
        document.getElementById('shoot-button').disabled = false;
    }, 1000);
    var audio = new Audio('bulletsound.mp3');
    audio.play();
});

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updatePlayer();
    drawObstacles();
    updateObstacles();
    drawBullets();
    updateBullets();
    detectCollision();
    animationFrameId = requestAnimationFrame(update);
}

function startGame() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('soundSelectionContainer').style.display = 'none';
    canvas.style.display = 'block';
    document.body.classList.add('rotated');
    document.getElementById('gameInfo').style.display = 'flex';
    document.getElementById('controls').style.display = 'flex';
    document.getElementById('arrows').style.display = 'flex';
    document.getElementById('shoot-button').style.display = 'block';
    resetGame();
    setInterval(createObstacle, 2000);
    timerInterval = setInterval(increaseTime, 1000);
    speedInterval = setInterval(increaseSpeed, 5000);
    pointsInterval = setInterval(increasePoints, 1000);
    update();
    backgroundMusic.src = backgroundMusicSelect.value;
    backgroundMusic.play();
}

function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        cancelAnimationFrame(animationFrameId);
        clearInterval(timerInterval);
        clearInterval(speedInterval);
        clearInterval(pointsInterval);
        backgroundMusic.pause();
    }
}

function playGame() {
    if (gamePaused) {
        gamePaused = false;
        backgroundMusic.play();
        timerInterval = setInterval(increaseTime, 1000);
        speedInterval = setInterval(increaseSpeed, 10000);
        pointsInterval = setInterval(increasePoints, 1000);
        update();
    }
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('playBtn').addEventListener('click', playGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

document.getElementById('upArrow').addEventListener('mousedown', () => handleArrowDown('up'));
document.getElementById('downArrow').addEventListener('mousedown', () => handleArrowDown('down'));
document.getElementById('leftArrow').addEventListener('mousedown', () => handleArrowDown('left'));
document.getElementById('rightArrow').addEventListener('mousedown', () => handleArrowDown('right'));

document.getElementById('rightArrow').addEventListener('mousedown', () => handleArrowDown('right'));

// Add touch events for mobile support
document.getElementById('upArrow').addEventListener('touchstart', () => handleArrowDown('up'));
document.getElementById('downArrow').addEventListener('touchstart', () => handleArrowDown('down'));
document.getElementById('leftArrow').addEventListener('touchstart', () => handleArrowDown('left'));
document.getElementById('rightArrow').addEventListener('touchstart', () => handleArrowDown('right'));

document.getElementById('upArrow').addEventListener('touchend', handleArrowUp);
document.getElementById('downArrow').addEventListener('touchend', handleArrowUp);
document.getElementById('leftArrow').addEventListener('touchend', handleArrowUp);
document.getElementById('rightArrow').addEventListener('touchend', handleArrowUp);

// Rotate the screen and lock orientation for mobile devices
function lockScreenOrientation() {
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(err => {
            console.error('Screen orientation lock failed:', err);
        });
    }
}

// Start the game and apply the necessary configurations
function startGame() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('soundSelectionContainer').style.display = 'none';
    canvas.style.display = 'block';
    document.body.classList.add('rotated');
    document.getElementById('gameInfo').style.display = 'flex';
    document.getElementById('controls').style.display = 'flex';
    document.getElementById('arrows').style.display = 'flex';
    document.getElementById('shoot-button').style.display = 'block';
    resetGame();
    setInterval(createObstacle, 2000);
    timerInterval = setInterval(increaseTime, 1000);
    speedInterval = setInterval(increaseSpeed, 5000);
    pointsInterval = setInterval(increasePoints, 1000);
    update();
    backgroundMusic.src = backgroundMusicSelect.value;
    backgroundMusic.play();
    lockScreenOrientation(); // Lock the screen orientation when game starts
}

// Continue adding event listeners and game control logic
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('playBtn').addEventListener('click', playGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

playerImg.onload = () => {
    update();
};