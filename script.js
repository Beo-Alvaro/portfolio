function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const clock = document.getElementById('clock');
  if (clock) {
    clock.textContent = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}

setInterval(updateClock, 1000);
updateClock();

function openWindow(id) {
  const win = document.getElementById(id);
  win.classList.remove('hidden');

  // Center the window on the screen
  const desktop = document.querySelector('.desktop');
  const rect = win.getBoundingClientRect();
  win.style.top = `${Math.max((window.innerHeight - rect.height) / 2 - 20, 20)}px`;
  win.style.left = `${Math.max((window.innerWidth - rect.width) / 2, 20)}px`;

  bringToFront(win);
}

function closeWindow(id) {
  document.getElementById(id).classList.add('hidden');
}

let dragged = null;
let offsetX, offsetY;
let zIndexCounter = 10;

function dragStart(e) {
  dragged = e.target.closest('.window');
  const rect = dragged.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
  bringToFront(dragged);
}

function dragMove(e) {
  if (!dragged) return;
  dragged.style.left = `${e.clientX - offsetX}px`;
  dragged.style.top = `${e.clientY - offsetY}px`;
}

function dragEnd() {
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
  dragged = null;
}

function bringToFront(element) {
  zIndexCounter++;
  element.style.zIndex = zIndexCounter;
}

// -----------------------------
// Tic Tac Toe Game
// -----------------------------

let board = Array(9).fill(null);
const cells = [];

function renderBoard() {
  const container = document.getElementById('tictactoe-body');
  container.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    cell.textContent = board[i] || '';
    container.appendChild(cell);
    cells[i] = cell;
  }
}

function onCellClick(e) {
  const i = parseInt(e.target.dataset.index);
  if (board[i]) return;
  board[i] = 'X';
  renderBoard();
  if (!checkWinner()) aiMove();
}

function aiMove() {
  const countdownDisplay = document.getElementById('tictactoe-countdown');
  let timeLeft = 2;

  if (countdownDisplay) {
    countdownDisplay.textContent = `Opponent thinking: ${timeLeft}`;
  }

  const interval = setInterval(() => {
    timeLeft--;
    if (countdownDisplay) {
      countdownDisplay.textContent = `Opponent thinking: ${timeLeft}`;
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
      if (countdownDisplay) countdownDisplay.textContent = '';

      const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
      if (empty.length === 0) return;
      const move = empty[Math.floor(Math.random() * empty.length)];
      board[move] = 'O';
      renderBoard();
      checkWinner();
    }
  }, 1000);
}

function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      setTimeout(() => {
        alert(`${board[a]} wins!`);
        resetBoard();
      }, 10);
      return true;
    }
  }
  if (!board.includes(null)) {
    setTimeout(() => {
      alert(`Draw!`);
      resetBoard();
    }, 10);
    return true;
  }
  return false;
}

function resetBoard() {
  board = Array(9).fill(null);
  renderBoard();
}

// -----------------------------
// Space Invaders Game
// -----------------------------
function initSpaceInvaders() {
  const canvas = document.getElementById('spaceinvaders-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 270;
  canvas.height = 300;

  let player = { x: 200, y: 270, width: 20, height: 20, dx: 30 }; // Removed health
  let bullets = [];
  let enemies = [];
  let score = 0;

  function drawPlayer() {
    ctx.fillStyle = 'lime';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  function drawBullets() {
    ctx.fillStyle = 'white';
    bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, 2, 10));
  }

  function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, 20, 20));
  }

  // Removed drawHealth function entirely

  function update() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawEnemies();
    // Removed drawHealth();

    // Move bullets up
    bullets = bullets.map(b => ({ ...b, y: b.y - 5 })).filter(b => b.y > 0);
    // Move enemies down
    enemies = enemies.map(e => ({ ...e, y: e.y + 1 })).filter(e => e.y < canvas.height);

    // Bullet hits enemy
    bullets.forEach((bullet, bIndex) => {
      enemies.forEach((enemy, eIndex) => {
        if (
          bullet.x < enemy.x + 20 &&
          bullet.x + 2 > enemy.x &&
          bullet.y < enemy.y + 20 &&
          bullet.y + 10 > enemy.y
        ) {
          bullets.splice(bIndex, 1);
          enemies.splice(eIndex, 1);
          score++;
        }
      });
    });

    // Enemy hits player - removed health logic, so just remove the block or keep for enemy removal?
    enemies.forEach((enemy, eIndex) => {
      if (
        enemy.x < player.x + player.width &&
        enemy.x + 20 > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + 20 > player.y
      ) {
        enemies.splice(eIndex, 1);
        // No health decrement or game over alert here now
      }
    });

    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    requestAnimationFrame(update);
  }

  function shoot() {
    bullets.push({ x: player.x + player.width / 2, y: player.y });
  }

  function spawnEnemy() {
    enemies.push({ x: Math.random() * (canvas.width - 20), y: 0 });
  }

  function resetGame() {
    // No health reset needed
    score = 0;
    bullets = [];
    enemies = [];
    player.x = 200;
    player.y = 270;
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
      player.x = Math.max(0, player.x - player.dx);
    }
    if (e.key === 'ArrowRight') {
      player.x = Math.min(canvas.width - player.width, player.x + player.dx);
    }
    if (e.key === ' ' || e.key === 'ArrowUp') shoot();
  });

  setInterval(spawnEnemy, 1000);
  update();
}

window.onload = () => {
  renderBoard();
  updateClock();
  initSpaceInvaders();
};
