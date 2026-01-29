const tilesArea = document.getElementById('tiles-area');
const keys = document.querySelectorAll('.key_1, .key_2');
let score = 0;
let gameOver = false;
let speed = 2;
let spawnInterval = 1000;
let activeTiles = [];

const scoreDisplay = document.createElement('div');
scoreDisplay.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 32px;
    color: white;
    font-weight: bold;
    z-index: 100;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;
scoreDisplay.textContent = 'Score: 0';
document.body.appendChild(scoreDisplay);

const gameOverScreen = document.createElement('div');
gameOverScreen.style.cssText = `
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background: rgba(0, 0, 0, 0.9);
   padding: 40px;
   border-radius: 10px;
   text-align: center;
   display: none;
   z-index: 1000;
`;
gameOverScreen.innerHTML = `
    <h1 style="color: white; margin-bottom: 20px;">Game Over!</h1>
    <p style="color: white; font-size: 24px; margin-bottom: 30px;">Final Score: <span id="final-score">0</span></p>
    <button id="restart-btn" style="
        padding: 15px 40px;
        font-size: 18px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px; 
        cursor: pointer;
    ">Play Again</button>
`;
document.body.appendChild(gameOverScreen);

function createTile() {
    if (gameOver) return;

    const lane = Math.floor(Math.random() * 4) + 1;
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.lane = lane;
    
    const laneWidth = 263 / 4;
    tile.style.cssText = `
        z-index: 10;
        position: absolute;
        top: -100px;
        left: ${(lane - 1) * laneWidth}px;
        width: ${laneWidth}px;
        height: 100px;
        background: linear-gradient(135deg, #d8db34, #b9a329);
        border: 2px solid #000000;
        border-radius: 10px;
    `;

    tilesArea.appendChild(tile);
    activeTiles.push({ 
        element: tile,
        lane: lane, 
        clicked: false 
    });
}

function moveTiles() {
    if (gameOver) return;

    activeTiles.forEach((tileObj, index) => {
        const tile = tileObj.element;
        const currentTop = parseFloat(tile.style.top);
        const newTop = currentTop + speed;

        tile.style.top = newTop + 'px';

        if (newTop > window.innerHeight - 100 && !tileObj.clicked) {
            endGame();
        }

        if (newTop > window.innerHeight + 100) {
            tile.remove();
            activeTiles.splice(index, 1);
        }
    });

    requestAnimationFrame(moveTiles);
}

function handleKeyPress(lane) {
    if (gameOver) return;

    const key = Array.from(keys).find(k => parseInt(k.dataset.lane) === lane)
    if (!key) return;

    key.style.transform = 'scale(0.95)';
    setTimeout(() => {
        key.style.transform = 'scale(1)';
    }, 100);

    let hitTile = false;
    activeTiles.forEach((tileObj, index) => {
        if (tileObj.lane === lane && !tileObj.clicked) {
            const tile = tileObj.element;
            const tileTop = parseFloat(tile.style.top);
            const hitZone = window.innerHeight - 200;

            if (tileTop >= hitZone && tileTop <= window.innerHeight) {
                tileObj.clicked = true;
                tile.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    tile.remove();
                }, 100);

                score += 10;
                scoreDisplay.textContent = 'Score: ' + score;
                hitTile = true;

                // nigkatin kesulitan
                if (score % 50 === 0) {
                    speed += 0.5;
                    if (spawnInterval > 400) {
                        spawnInterval -= 50;
                        clearInterval(spawnTimer);
                        spawnTimer = setInterval(createTile, spawnInterval);
                    }
                }
            }
        }
    });

    if (!hitTile) {
        score = Math.max(0, score - 5);
        scoreDisplay.textContent = 'Score: ' + score;
    }
}

function endGame() {
    if (gameOver) return;

    gameOver = true;
    gameOverScreen.style.display = 'block';
    document.getElementById('final-score').textContent = score;
}

function restartGame() {
    activeTiles.forEach(tileObj => tileObj.element.remove());
    activeTiles = [];

    score = 0;
    gameOver = false;
    speed = 2;
    spawnInterval = 1000;

    scoreDisplay.textContent = 'Score: 0';
    gameOverScreen.style.display = 'none';

    clearInterval(spawnTimer);
    spawnTimer = setInterval(createTile, spawnInterval)
    moveTiles();
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    const key = e.key.toLowerCase();
    let lane = null;

    if (key === 'f') lane = 1;
    else if (key === 'g') lane = 2;
    else if (key === 'h') lane = 3;
    else if (key === 'j') lane = 4;

    if (lane !== null) {
        handleKeyPress(lane)
    }
});

document.getElementById('restart-btn').addEventListener('click', restartGame);

let spawnTimer = setInterval(createTile, spawnInterval);
moveTiles();

keys.forEach(key => {
    key.addEventListener('click', () => {
        if (gameOver) return;

        const lane = parseInt(key.dataset.lane);
        handleKeyPress(lane);
    });
}); 